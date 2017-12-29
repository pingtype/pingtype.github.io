{-# LANGUAGE DeriveDataTypeable #-}
module LessChobo.Users where

import LessChobo.Common
import LessChobo.Features

import           Data.Set                     (Set)
import qualified Data.Set                     as Set
import           Data.Map                     (Map)
import qualified Data.Map                     as Map
import Data.Time
import Data.Typeable
import           Control.Monad.Reader
import           Control.Monad.State

data User = User
  { userModel              :: Map Feature Rep
  , userSchedule           :: Map UTCTime (Set StencilId)
  , userSchedule'          :: Map StencilId UTCTime
  } deriving (Typeable)

emptyUser :: User
emptyUser = User
  { userModel              = Map.empty
  , userSchedule           = Map.empty
  , userSchedule'          = Map.empty
  }


setStencilSchedule :: StencilId -> Maybe UTCTime -> User -> User
setStencilSchedule stencilId mbAt user =
    case mbAt of
      Nothing -> user
        { userSchedule  = Map.update delFn prevAt (userSchedule user)
        , userSchedule' = Map.delete stencilId (userSchedule' user) }
      Just at -> user
        { userSchedule  = Map.alter addFn at $
                          Map.update delFn prevAt $ (userSchedule user)
        , userSchedule' = Map.insert stencilId at (userSchedule' user) }
  where
    prevAt         = Map.findWithDefault defDate stencilId (userSchedule' user)
    defDate        = UTCTime (ModifiedJulianDay 0) 0
    delFn s        = Just $ Set.delete stencilId s
    addFn Nothing  = Just $ Set.singleton stencilId
    addFn (Just s) = Just $ Set.insert stencilId s


lookupRep :: Feature -> Reader User Rep
lookupRep feat = do
  model <- asks userModel
  return $ Map.findWithDefault (defaultRep feat) feat model

setUserRep :: Feature -> Rep -> State User ()
setUserRep feat rep =
  modify $ \user -> user{ userModel = Map.insert feat rep (userModel user) }


