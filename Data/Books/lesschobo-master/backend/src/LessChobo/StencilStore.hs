module LessChobo.StencilStore where

import           LessChobo.Common
import           LessChobo.Features
import           LessChobo.Stencils

import           Data.List          (foldl')
import           Data.Map           (Map)
import qualified Data.Map           as Map
import           Data.SafeCopy
import qualified Data.Set           as Set


data StencilStore = StencilStore
  { stencilStoreById      :: Map StencilId Stencil
  , stencilStoreByStencil :: Map Stencil StencilId
  , stencilStoreByFeature :: Map Feature (Map StencilId Stencil)
  }

instance SafeCopy StencilStore where
  version = 1
  kind = base
  getCopy = contain $ fmap stencilStoreFromList safeGet
  putCopy = contain . safePut . stencilStoreToList

emptyStencilStore :: StencilStore
emptyStencilStore = StencilStore
  { stencilStoreById      = Map.empty
  , stencilStoreByStencil = Map.empty
  , stencilStoreByFeature = Map.empty }

stencilStoreFromList :: [(StencilId, Stencil)] -> StencilStore
stencilStoreFromList =
  foldl' (\store (stencilId, stencil) -> insertStencilStore stencilId stencil store) emptyStencilStore

stencilStoreToList :: StencilStore -> [(StencilId, Stencil)]
stencilStoreToList = Map.toList . stencilStoreById

insertStencilStore :: StencilId -> Stencil -> StencilStore -> StencilStore
insertStencilStore stencilId stencil store =
  store{ stencilStoreById      = Map.insert stencilId stencil (stencilStoreById store)
       , stencilStoreByStencil = Map.insert stencil stencilId (stencilStoreByStencil store)
       , stencilStoreByFeature = stencilStoreByFeature store `union` newFeatureIndex
       }
  where
    union = Map.unionWith Map.union
    newFeatureIndex = Map.fromList
        [ (feature, Map.singleton stencilId stencil)
        | feature <- Set.toList (features stencil) ]

lookupStencil :: StencilId -> StencilStore -> Maybe Stencil
lookupStencil stencilId = Map.lookup stencilId . stencilStoreById

lookupStencilId :: Stencil -> StencilStore -> Maybe StencilId
lookupStencilId stencil = Map.lookup stencil . stencilStoreByStencil

lookupStencilByFeature :: Feature -> StencilStore -> Map StencilId Stencil
lookupStencilByFeature feature =
  Map.findWithDefault Map.empty feature . stencilStoreByFeature

