{-# OPTIONS_GHC -fno-warn-orphans #-}
module LessChobo.Common where

import           Data.Aeson
import           Data.Text
import           Data.UUID

instance ToJSON UUID where
    toJSON = toJSON . show

instance FromJSON UUID where
    parseJSON = withText "UUID" $ \txt ->
        case reads (unpack txt) of
            [(uuid,"")] -> return uuid
            _           -> fail "invalid uuid"

type UnitId     = Text
type CourseId   = Text
type UserId     = Text
type StencilId  = UUID -- UniqueId
type ResponseId = UUID
type FeatureId  = UUID

type Chinese = Text
type Pinyin  = Text
type English = Text
type Comment = Text
