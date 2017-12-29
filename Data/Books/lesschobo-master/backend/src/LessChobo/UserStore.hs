module LessChobo.UserStore where

import LessChobo.Common
import LessChobo.Users

import           Data.Map                     (Map)
import qualified Data.Map                     as Map


data UserStore = UserStore
  { userStoreById :: Map UserId User }

emptyUserStore :: UserStore
emptyUserStore = UserStore { userStoreById = Map.empty }

idsUserStore :: UserStore -> [UserId]
idsUserStore = Map.keys . userStoreById

lookupUserStore :: UserId -> UserStore -> Maybe User
lookupUserStore userId = Map.lookup userId . userStoreById

insertUserStore :: UserId -> User -> UserStore -> UserStore
insertUserStore userId user store =
  store{ userStoreById = Map.insert userId user (userStoreById store) }

deleteUserStore :: UserId -> UserStore -> UserStore
deleteUserStore userId store =
  store{ userStoreById = Map.delete userId (userStoreById store) }

clearUserStore :: UserId -> UserStore -> UserStore
clearUserStore userId store = store
  { userStoreById = Map.adjust fn userId (userStoreById store) }
  where
    fn user = user
        { userModel     = Map.empty
        , userSchedule  = Map.empty
        , userSchedule' = Map.empty }


listUserStore :: UserStore -> [(UserId, User)]
listUserStore = Map.toList . userStoreById

