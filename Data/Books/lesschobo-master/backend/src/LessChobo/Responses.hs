{-# LANGUAGE DeriveDataTypeable #-}
{-# LANGUAGE OverloadedStrings  #-}
{-# LANGUAGE RecordWildCards    #-}
{-# LANGUAGE TypeFamilies       #-}
module LessChobo.Responses where

import           LessChobo.Common
import           LessChobo.Utilities

import           Control.Applicative
import           Data.Aeson
import           Data.Text
import           Data.Time
import           Data.Typeable


data Response = Response
  { responseAt      :: UTCTime
  , responseContent :: ResponseContent
  , responseStencil :: StencilId
  , responseUserId  :: UserId
  } deriving ( Read, Show, Eq, Ord, Typeable )

-- data ResponseContent_v0
--   = V0_MandarinLookupDefinition Chinese
--   | V0_MandarinTextAnswer       Text Text
--   | V0_MandarinSelect           Text
--   | V0_MathComplementAnswer     Int Int Int
--     deriving ( Read, Show, Eq, Ord )



-- instance Migrate ResponseContent where
--   type MigrateFrom ResponseContent = ResponseContent_v0
--   migrate v0 =
--     case v0 of
--       V0_MandarinLookupDefinition chinese -> MandarinLookupDefinition chinese
--       V0_MandarinTextAnswer key val       -> MandarinTextAnswer False key val
--       V0_MandarinSelect txt               -> MandarinSelect txt
--       V0_MathComplementAnswer a b c       -> MathComplementAnswer a b c


data ResponseContent
  = MandarinLookupDefinition Chinese
  | MandarinTextAnswer       Bool Text Text
  | MandarinSelect           Text
  | MathComplementAnswer     Int Int Int
    deriving ( Read, Show, Eq, Ord, Typeable )

instance ToJSON Response where
  toJSON Response{..} = object
    [ "at"        .=. responseAt
    , "content"   .=. responseContent
    , "stencilId" .=. responseStencil
    , "userId"    .=. responseUserId ]

instance ToJSON ResponseContent where
  toJSON (MandarinTextAnswer shownAnswer key val) = typed "MandarinTextAnswer"
    [ "key"   .=. key
    , "value" .=. val
    , "shownAnswer" .=. shownAnswer ]
  toJSON content =
    error $ "LessChobo.State.toJSON.ResponseContent: Unsupported content: " ++ show content

instance FromJSON Response where
  parseJSON = withObject "Response" $ \obj ->
    Response
      <$> obj .: "at"
      <*> obj .: "content"
      <*> obj .: "stencilId"
      <*> obj .: "userId"

instance FromJSON ResponseContent where
  parseJSON = withObject "ResponseContent" $ \obj -> do
    ty <- obj .: "type"
    case ty of
      "MandarinTextAnswer" ->
        MandarinTextAnswer <$> obj .: "shownAnswer" <*> obj .: "key" <*> obj .: "value"
      _ -> error $ "LessChobo.State.parseJSON.ResponseContent: Unknown type: " ++ ty


-- deriveSafeCopy 0 'base ''ResponseContent_v0
