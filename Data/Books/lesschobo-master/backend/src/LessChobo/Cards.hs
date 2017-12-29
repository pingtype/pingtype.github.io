{-# LANGUAGE DeriveDataTypeable #-}
{-# LANGUAGE RecordWildCards    #-}
{-# LANGUAGE OverloadedStrings  #-}
module LessChobo.Cards where

import           LessChobo.Common
import           LessChobo.Utilities

import           Data.Aeson
import           Data.Aeson.Types    (Pair)
import           Data.Text           (Text)
import qualified Data.Text           as T
import           Data.Typeable


data Card = Card
  { cardStencil :: StencilId
  , cardContent :: CardContent
  } deriving (Show, Typeable)

instance ToJSON Card where
  toJSON Card{..} = object $
    [ "stencilId" .=. cardStencil ] ++
    cardContentPairs cardContent

-- FIXME: do Mandarin -> Chinese renaming?
data MandarinGapSentence = MandarinGapSentence [MandarinBlock] English
  deriving ( Read, Show )
data MandarinBlock = MandarinWord Chinese [MandarinDefinition] Bool | EscapedBlock Text
  deriving ( Read, Show )
data MandarinDefinition = MandarinDefinition Pinyin [English]
  deriving ( Eq, Read, Show )

instance ToJSON MandarinGapSentence where
  toJSON (MandarinGapSentence blocks english) = object
    [ "english" .=. english
    , "blocks"  .=. blocks ]

instance ToJSON MandarinBlock where
  toJSON (MandarinWord chinese definitions isGap) = object
    [ "isEscaped" .=. False
    , "chinese"   .=. chinese
    , "definitions" .=. definitions
    , "isGap"     .=. isGap ]
  toJSON (EscapedBlock txt) = object
    [ "isEscaped" .=. True
    , "text"      .=. txt ]

instance ToJSON MandarinDefinition where
  toJSON (MandarinDefinition pinyin english) = object
    [ "pinyin" .=. pinyin
    , "english" .=. map trimDefinition english ]

-- you (blah blah blah) -> you
-- (modal particle) -> (modal particle)
trimDefinition :: Text -> Text
trimDefinition txt =
  case T.takeWhile (/='(') txt of
    before
      | T.null before -> txt
      | otherwise     -> before

data CardContent
  = ChineseCard [MandarinGapSentence]
  deriving ( Read, Show )

cardContentPairs :: CardContent -> [Pair]
cardContentPairs (ChineseCard sentences) =
  [ "type"      .=. ("chinese" :: String)
  , "sentences" .=. sentences ]

complexity :: Card -> Int
complexity card =
  case cardContent card of
    ChineseCard sentences -> sum
      [ 1
      | MandarinGapSentence blocks _ <- sentences
      , MandarinWord _ _ True <- blocks ]

