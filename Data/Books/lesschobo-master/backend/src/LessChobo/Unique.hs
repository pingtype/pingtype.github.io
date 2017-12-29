module LessChobo.Unique where

import LessChobo.Common

data UniqueStore = UniqueStore
  { nextUnique :: !UniqueId }

emptyUniqueStore :: UniqueStore
emptyUniqueStore = UniqueStore { nextUnique = 0 }

getNextUnique :: UniqueStore -> (UniqueId, UniqueStore)
getNextUnique (UniqueStore next) = (next, UniqueStore (next+1))

