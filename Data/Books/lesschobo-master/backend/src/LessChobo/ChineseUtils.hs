{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE PatternGuards     #-}
{-# LANGUAGE TemplateHaskell   #-}
module LessChobo.ChineseUtils where

import           Control.Applicative
import           Data.Aeson
import           Data.Aeson.Types
import qualified Data.ByteString.Lazy as L
import           Data.Char
import           Data.Csv             (FromRecord (..), index)
import qualified Data.Csv             as Csv
import           Data.FileEmbed
import           Data.List            (findIndices, foldl', nub, partition,
                                       sortBy)
import           Data.Map             (Map)
import qualified Data.Map             as M
import           Data.Maybe
import           Data.Ord
import           Data.Set             (Set)
import qualified Data.Set             as Set
import           Data.Text            (Text)
import qualified Data.Text            as T
import qualified Data.Text.Encoding            as T
import qualified Data.Text.IO         as T
import           Data.Vector          (Vector)
import qualified Data.Vector          as V

{- Main tools:
 * Arrange templates by usage frequency of the words they contain.
    DONE. Finding the best ordering is NP complete. Good solutions
          can be found with simulated annealing, though.
 * Query which words aren't covered by a set of templates, sort by frequency.
 * For a given text, show the N least common words.
-}

arrangeTemplates :: [Template] -> CCTrie -> [Entry] -> [Template]
arrangeTemplates tmpls trie =
    worker Set.empty [ (tmpl, templateDependencies tmpl trie) | tmpl <- tmpls ]
  where
    worker _seen [] _ = []
    worker _seen _heap [] = []
    worker seen heap (e:es) =
      let seen' = Set.insert (entrySimplified e) seen
          isCovered (_tmpl,deps) = deps `Set.isSubsetOf` seen
          (covered, missing) = partition isCovered heap
      in map fst covered ++ worker seen' missing es

sortByUsage :: [Entry] -> SubtlexMap -> [Entry]
sortByUsage entries subt = map fst $ sortBy (comparing snd)
  [ (entry, maybe minBound (negate . subtlexWCount) (M.lookup (entrySimplified entry) subt))
  | entry <- entries ]


type Chinese = T.Text
type English = T.Text

data Template
  = Idiomatic Chinese [English]
  | Cloze Chinese (Maybe English)
  | IdiomaticChunked [Chinese] [[English]]
    deriving ( Show )

--schedule :: Template -> UTCTime
--mkCard :: Template -> Maybe Card
--lookupFeature :: Feature -> Model
--Template -> Set Feature
--Feature -> Set TemplateId

--schedule (Cloze chineseWords _english) = scheduleSR (map getModel chineseWords)
--mkCard (Cloze chineseWords _english) = -- delete words indicated by the SR models

typed :: Text -> [Pair] -> Value
typed ty entries = object $ "type" .= (ty::Text) : entries

instance ToJSON Template where
  toJSON (Idiomatic chinese english) = typed "idiomatic"
    [ "chinese" .= chinese
    , "english" .= english ]
  toJSON (Cloze chinese Nothing) = typed "cloze"
    [ "chinese" .= chinese ]
  toJSON (Cloze chinese (Just english)) = typed "cloze"
    [ "chinese" .= chinese
    , "english" .= english ]
  toJSON (IdiomaticChunked chinese english) = typed "idiomatic_chunked"
    [ "chinese" .= chinese
    , "english" .= english ]
instance FromJSON Template where
  parseJSON = withObject "Template" $ \o -> do
    tmplType <- o .: "type"
    case tmplType :: Text of
      "idiomatic"         -> Idiomatic <$> o.:"chinese" <*> o.:"english"
      "cloze"             -> Cloze <$> o.:"chinese" <*> o.:?"english"
      "idiomatic_chunked" -> IdiomaticChunked <$> o.:"chinese" <*> o.:"english"
      _                   -> error "LessChobo.ChineseUtils.parseJSON: invalid type"

loadTemplates :: FilePath -> IO [Template]
loadTemplates path = do
  inp <- L.readFile path
  case decode inp of
    Nothing    -> error "Failed to load templates"
    Just tmpls -> return tmpls

templateDependencies :: Template -> CCTrie -> Set Text
templateDependencies tmpl trie =
    Set.fromList (map entrySimplified (matchLine getChinese trie))
  where
    getChinese =
      case tmpl of
        Idiomatic chinese _english -> stripBrackets chinese
        Cloze chinese _english     -> stripBrackets chinese
        IdiomaticChunked chinese _english   -> stripBrackets $ T.unlines chinese

templateEntries :: [Template] -> CCTrie -> [Entry]
templateEntries tmpls trie = nub $ concatMap (flip matchLine trie) $ map getChinese tmpls
  where
    getChinese tmpl =
      case tmpl of
        Idiomatic chinese _english -> stripBrackets chinese
        Cloze chinese _english     -> stripBrackets chinese
        IdiomaticChunked chinese _english   -> stripBrackets $ T.unlines chinese

stripBrackets :: T.Text -> T.Text
stripBrackets = T.pack . stripBrackets' . T.unpack

stripBrackets' :: String -> String
stripBrackets' []       = []
stripBrackets' ('{':xs) = stripBrackets' (dropWhile (/= '}') xs)
stripBrackets' ('}':xs) = stripBrackets' xs
stripBrackets' (x:xs)   = x : stripBrackets' xs

matchLine :: Text -> CCTrie -> [Entry]
matchLine txt trie
  | T.null txt = []
  | otherwise =
      case lookupTrie txt trie of
        Nothing -> matchLine (T.drop 1 txt) trie
        Just es -> es : matchLine (T.drop (T.length (entrySimplified es)) txt) trie

-- Ignore lines starting with '#'
-- Traditional space Simplified space [pinyin] space English

data Entry = Entry
  { entrySimplified :: Text
  , entryPinyin     :: [Text]
  , entryDefinition :: [Text]
  } deriving ( Read, Show, Eq, Ord )

type CCTrie = Map Char CCTrieEntry
data CCTrieEntry = CCTrieEntry (Maybe Entry) CCTrie

union :: CCTrie -> CCTrie -> CCTrie
union = M.unionWith join
  where
    join (CCTrieEntry e1 t1) (CCTrieEntry e2 t2) =
      CCTrieEntry (joinEntry e1 e2) (M.unionWith join t1 t2)

joinEntry :: Maybe Entry -> Maybe Entry -> Maybe Entry
joinEntry Nothing Nothing     = Nothing
joinEntry Nothing (Just e)    = Just e
joinEntry (Just e) Nothing    = Just e
joinEntry (Just e1) (Just e2) = Just Entry
  { entrySimplified = entrySimplified e1
  , entryPinyin     = nub $ entryPinyin e1 ++ entryPinyin e2
  , entryDefinition = nub $ entryDefinition e1 ++ entryDefinition e2 }

unions :: [CCTrie] -> CCTrie
unions = foldl' union M.empty

fromList :: [Entry] -> CCTrie
fromList = unions . map singleton

singleton :: Entry -> CCTrie
singleton entry = go (T.unpack (entrySimplified entry))
  where
    go []     = error "singleton: Invalid entry."
    go [x]    = M.singleton x (CCTrieEntry (Just entry) M.empty)
    go (x:xs) = M.singleton x (CCTrieEntry Nothing (go xs))

lookupTrie :: Text -> CCTrie -> Maybe Entry
lookupTrie key trie =
    case T.unpack key of
      [] -> Nothing
      (x:xs) -> go xs =<< M.lookup x trie
  where
    go [] (CCTrieEntry es _) = es
    go (x:xs) (CCTrieEntry es m) = maybe es (go xs) (M.lookup x m)


loadCCDict :: FilePath -> IO CCTrie
loadCCDict path = fromList . parseCCDict <$> T.readFile path


parseCCDict :: Text -> [Entry]
parseCCDict txt = [ entry | Just entry <- map parseLine (T.lines txt) ]

parseLine :: Text -> Maybe Entry
parseLine line | "#" `T.isPrefixOf` line = Nothing
parseLine line =
    Just Entry
    { entrySimplified = chinese
    , entryPinyin     = map adjustPinyin $ T.words $ T.tail $ T.init $ T.unwords (pinyin ++ [pin])
    , entryDefinition = [T.unwords english] }
  where
    (_traditional : chinese : rest) = T.words line
    (pinyin, (pin : english)) = break (\word -> T.count "]" word > 0) rest

adjustPinyin :: Text -> Text
adjustPinyin = modToneNumber toTonal

modToneNumber :: (Int -> Char -> Char) -> Text -> Text
modToneNumber fn txt
  | T.null txt || not (isDigit (T.last txt)) = txt
  | Just n <- T.findIndex (`elem` "ae") txt' = mod n
  | Just n <- findStrIndex "ou" txt'         = mod n
  | Just n <- findSecondVowel txt'           = mod n
  | Just n <- T.findIndex (`elem` "aoeiu") txt' = mod n
  | otherwise = txt
  where
    tone = digitToInt (T.last txt)
    mod n = T.pack [ if n==i then fn tone c else c | (i,c) <- zip [0..] (T.unpack txt') ]
    txt' = T.init txt

findSecondVowel :: Text -> Maybe Int
findSecondVowel = listToMaybe . drop 1 . findIndices isVowel . T.unpack
  where
    isVowel = (`elem` "aoeiu")

findStrIndex :: Text -> Text -> Maybe Int
findStrIndex key = worker 0
  where
    worker n line
      | T.null line             = Nothing
      | key `T.isPrefixOf` line = Just n
      | otherwise               = worker (n+1) (T.drop 1 line)

toTonal :: Int -> Char -> Char
toTonal n key =
    case Prelude.lookup key lst of
      Nothing    -> key
      Just tones -> tones !! (n-1)
  where
    lst =
      [ ('a', "āáǎàa")
      , ('o', "ōóǒòo")
      , ('e', "ēéěèe")
      , ('i', "īíǐìi")
      , ('u', "ūúǔùu") ]



------------------------------------------------------------
-- SUBTLEX

type SubtlexMap = Map T.Text SubtlexEntry

data SubtlexEntry = SubtlexEntry
  { subtlexWord     :: T.Text
  , subtlexPinyin   :: [T.Text]
  , subtlexWCount   :: Int
  , subtlexWMillion :: Double
  , subtlexEnglish  :: T.Text
  } deriving ( Show )

instance FromRecord SubtlexEntry where
  parseRecord rec = SubtlexEntry
    <$> index rec 0
    <*> fmap (map adjustPinyin . T.splitOn "/") (index rec 2)
    <*> index rec 4
    <*> index rec 5 <*> index rec 14

loadSubtlexEntries :: FilePath -> IO (Vector SubtlexEntry)
loadSubtlexEntries path = do
  inp <- L.readFile path
  case Csv.decodeWith (Csv.DecodeOptions 9) True inp of
    Left msg   -> error msg
    Right rows -> return rows

mkSubtlexMap :: Vector SubtlexEntry -> SubtlexMap
mkSubtlexMap rows = M.fromList [ (subtlexWord row, row) | row <- V.toList rows ]






------------------------------------------------------------
-- Embedded files

subtlex :: SubtlexMap
subtlex = mkSubtlexMap $
  case Csv.decodeWith (Csv.DecodeOptions 9) True inp of
    Left msg -> error msg
    Right rows -> rows
  where
    inp = L.fromStrict raw
    raw = $(embedFile "data/SUBTLEX_CH_131210_CE.utf8")

ccDict :: CCTrie
ccDict = fromList $ parseCCDict $ T.decodeUtf8 raw
  where
    raw = $(embedFile "data/cedict_1_0_ts_utf-8_mdbg.txt")
