module Commands.Merge where

import qualified Data.Set as Set
import           LessChobo.Stencils

nubStencils :: [Stencil] -> [Stencil]
nubStencils = worker Set.empty
  where
    worker _seen [] = []
    worker seen (x:xs)
      | x `Set.member` seen = worker seen xs
      | otherwise           = x : worker (Set.insert x seen) xs


