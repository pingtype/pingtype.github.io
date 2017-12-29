{-# LANGUAGE OverloadedStrings #-}
module LessChobo.Utilities where

import           Data.Aeson
import qualified Data.Aeson          as Aeson
import           Data.Aeson.Types    (Pair)
import Data.Text

(.=.) :: ToJSON a => Text -> a -> Pair
a .=. b  = a Aeson..= b

typed :: String -> [Pair] -> Value
typed ty pairs = Aeson.object (("type" .=. ty) : pairs)

