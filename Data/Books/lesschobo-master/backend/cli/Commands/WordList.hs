{-# LANGUAGE RecordWildCards #-}
module Commands.WordList
  ( cmdWordList
  , WordListOutput(..)
  ) where

import           Control.Monad
import           Data.Chinese.CCDict       as CCDict
import           Data.List
import qualified Data.Text                 as T
import qualified Data.Text.IO              as T
import           System.Console.CmdTheLine
import           Text.Printf

data WordListOutput
  = WordListTable
  | WordListPlain
  deriving ( Eq )

instance ArgVal WordListOutput where
  converter = enum
    [ ("table", WordListTable)
    , ("plain", WordListPlain) ]

cmdWordList :: WordListOutput -> FilePath -> IO ()
cmdWordList output path = do
  text <- T.readFile path
  let entries = nub [ entry | KnownWord entry <- tokenizer ccDict text ]
  forM_ entries $ \Entry{..} ->
    case output of
      WordListTable ->
        forM_ (zip entryPinyin entryDefinition) $ \(pinyin, english) ->
          printf "%s\t%-10s %s\n"
            (T.unpack entryChinese)
            (T.unpack pinyin)
            (merge english)
      WordListPlain ->
        printf "%s\n"
          (T.unpack entryChinese)

merge :: [T.Text] -> String
merge = concat . intersperse "/" . map T.unpack


