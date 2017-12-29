{-# LANGUAGE DeriveDataTypeable #-}
{-# LANGUAGE OverloadedStrings  #-}
{-# LANGUAGE RecordWildCards    #-}
module LessChobo.Stencils
    ( PermaResponse(..)

    , StencilId
    , Chinese
    , Pinyin
    , English
    , Stencil(..)
    , features
    , schedule
    ) where

import           LessChobo.Common
import           LessChobo.Features
import           LessChobo.Users
import           LessChobo.Responses ( ResponseContent )

import           Control.Applicative
import           Control.Monad.Reader
import           Data.Aeson           (FromJSON (..), ToJSON (..), Value,
                                       withObject, (.!=), (.:), (.:?), object)
import qualified Data.Aeson           as Aeson
import           Data.Aeson.Types     (Pair)
import           Data.Chinese.CCDict  as CCDict
import           Data.Set             (Set)
import qualified Data.Set             as Set
import           Data.Text
import           Data.Time
import           Data.Typeable



data Stencil
  = Chinese
  { stencilChinese :: Chinese
  , stencilEnglish :: [English]
  , stencilComment :: Comment }
  deriving ( Eq, Ord, Read, Show, Typeable )

features :: Stencil -> Set Feature
features Chinese{stencilChinese=chinese} = Set.fromList
  [ MandarinWordFeature (entryChinese entry) | KnownWord entry <- tokenizer ccDict chinese ]

schedule :: Stencil -> Reader User (Maybe UTCTime)
schedule stencil@Chinese{} = fmap scheduleByReps $ mapM lookupRep (Set.toList $ features stencil)










--------------------------------------------------------------------
-- ToJSON/FromJSON instances

(.=.) :: ToJSON a => Text -> a -> Pair
a .=. b  = a Aeson..= b

typed :: String -> [Pair] -> Value
typed ty pairs = Aeson.object (("type" .=. ty) : pairs)

instance ToJSON Stencil where
  toJSON stencil =
    case stencil of
      Chinese chinese english "" -> typed "chinese"
        [ "chinese" .=. chinese
        , "english" .=. english ]
      Chinese chinese english comment -> typed "chinese"
        [ "chinese" .=. chinese
        , "english" .=. english
        , "comment" .=. comment ]

instance FromJSON Stencil where
  parseJSON = withObject "Stencil" $ \o -> do
    ty <- o .: "type"
    case ty of
      "chinese" ->
        Chinese
          <$> o.:"chinese"
          <*> o.:? "english" .!= []
          <*> o.:? "comment" .!= ""
      _other    -> fail $ "Unknown stencil type: " ++ ty


-- deriveSafeCopy 0 'base ''Stencil












data PermaResponse = PermaResponse
  { permaResponseAt  :: UTCTime
  , permaContent     :: ResponseContent
  , permaStencil     :: Stencil
  , permaUserId      :: UserId
  } deriving ( Typeable )
instance ToJSON PermaResponse where
  toJSON PermaResponse{..} = object
    [ "at"      .=. permaResponseAt
    , "content" .=. permaContent
    , "stencil" .=. permaStencil
    , "userId"  .=. permaUserId ]

instance FromJSON PermaResponse where
  parseJSON = withObject "PermaResponse" $ \o ->
    PermaResponse
      <$> o .: "at"
      <*> o .: "content"
      <*> o .: "stencil"
      <*> o .: "userId"

