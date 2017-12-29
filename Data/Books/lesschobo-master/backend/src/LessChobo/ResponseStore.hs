{-# LANGUAGE RecordWildCards #-}
module LessChobo.ResponseStore where

import           LessChobo.Common
import           LessChobo.Responses

import           Data.List           (foldl')
import           Data.Map            (Map)
import qualified Data.Map            as Map
import           Data.Set            (Set)
import qualified Data.Set            as Set


data ResponseStore = ResponseStore
  { responseStoreById     :: Map ResponseId Response
  , responseStoreByUserId :: Map UserId (Set Response)
  } deriving ( Read, Show )

responseStoreToList :: ResponseStore -> [(ResponseId, Response)]
responseStoreToList = Map.toList . responseStoreById

responseStoreFromList :: [(ResponseId, Response)] -> ResponseStore
responseStoreFromList = foldl' (\store (rId, r) -> insertResponseStore rId r store) emptyResponseStore

emptyResponseStore :: ResponseStore
emptyResponseStore = ResponseStore
  { responseStoreById = Map.empty
  , responseStoreByUserId = Map.empty }

insertResponseStore :: ResponseId -> Response -> ResponseStore -> ResponseStore
insertResponseStore responseId response@Response{..} store = store
  { responseStoreById = Map.insert responseId response (responseStoreById store)
  , responseStoreByUserId = Map.alter fn responseUserId (responseStoreByUserId store) }
  where
    fn Nothing  = Just $ Set.singleton response
    fn (Just s) = Just $ Set.insert response s

lookupUserResponses :: UserId -> ResponseStore -> Set Response
lookupUserResponses userId = Map.findWithDefault Set.empty userId . responseStoreByUserId

deleteUserResponseStore :: UserId -> ResponseStore -> ResponseStore
deleteUserResponseStore userId store = store
  { responseStoreByUserId = Map.delete userId (responseStoreByUserId store)
  , responseStoreById     = Map.filter fn (responseStoreById store)
  }
  where
    fn response = responseUserId response /= userId


