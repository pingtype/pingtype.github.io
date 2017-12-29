{-# LANGUAGE BangPatterns #-}
module LessChobo.SimulatedAnnealing
  ( testPathCost
  , testSA
  , testSA'
  , runSA
  ) where

import           Control.Monad.ST
import           Data.Array.Base
import           Data.IntSet         (IntSet)
import qualified Data.IntSet         as IntSet
import qualified Data.Vector         as Vector
import qualified Data.Vector.Unboxed as UVector
import           Debug.Trace
import           System.Random.MWC

{-
item: facts

A: [1,2]
B: [2]
C: [2,3,4,5]

Costs: fact: cost
1: 1
2: 1
3: 1
4: 1
5: 1

-}

type Items = Vector.Vector Facts
type Facts = IntSet
type Costs = UVector.Vector Int

testPathCost :: [[Int]] -> Int
testPathCost items = runST (do
    initPath <- newListArray (0, length items-1) [0..length items-1]
    pathCost costs itemArr (length items) initPath
  )
  where
    nFacts = maximum (concat items) + 1
    costs = UVector.fromList (replicate nFacts 1)
    itemArr = Vector.fromList (map IntSet.fromList items)

pathCost :: Costs -> Items -> Int -> STUArray s Int Int -> ST s Int
pathCost costs items len arr = go IntSet.empty 0 0
  where
    go !seen !acc !n
      | n == len  = return acc
      | otherwise = do
        item <- unsafeRead arr n
        let facts    = Vector.unsafeIndex items item
            seen'    = facts `IntSet.union` seen
            cost     = IntSet.foldl' (\s this -> s + UVector.unsafeIndex costs this) 0 seen'
        go seen' (cost + acc) (n+1)

copyMArray :: STUArray s Int Int -> ST s (STUArray s Int Int)
copyMArray arr = do
  iarr <- freezeSTUArray arr
  unsafeThawSTUArray iarr

randomMutation :: Gen s -> Int -> STUArray s Int Int -> ST s (ST s ())
randomMutation gen len arr = do
  posX <- uniformR (0, len-1) gen
  posY <- uniformR (0, len-1) gen

  valX <- unsafeRead arr posX
  valY <- unsafeRead arr posY
  unsafeWrite arr posX valY
  unsafeWrite arr posY valX
  return $ do
    unsafeWrite arr posX valX
    unsafeWrite arr posY valY



acceptanceProbability :: Int -> Int -> Double -> Double
acceptanceProbability e0 e1 t = exp ((fromIntegral (e0-e1)) / t)

testSA :: Seed -> [[Int]] -> [[Int]]
testSA seed items = runST (do
    gen <- restore seed
    initPath <- newListArray (0, length items-1) [0..length items-1]
    result <- runSA gen costs itemArr (length items) initPath
    uarr <- freezeSTUArray result
    return $ [ items !! n | n <- elems uarr ]
  )
  where
    nFacts = maximum (concat items) + 1
    costs = UVector.fromList (replicate nFacts 1)
    itemArr = Vector.fromList (map IntSet.fromList items)

testSA' :: Seed -> [[Int]] -> [Int]
testSA' seed items = runST (do
    gen <- restore seed
    initPath <- newListArray (0, length items-1) [0..length items-1]
    result <- runSA gen costs itemArr (length items) initPath
    uarr <- freezeSTUArray result
    return $ elems uarr
  )
  where
    nFacts = maximum (concat items) + 1
    costs = UVector.fromList (replicate nFacts 1)
    itemArr = Vector.fromList (map IntSet.fromList items)

betterThan :: Int -> Int -> Bool
a `betterThan` b = a < b

runSA :: Gen s -> Costs -> Items -> Int -> STUArray s Int Int -> ST s (STUArray s Int Int)
runSA !gen !costs !items !len !arr0 = do
    best <- copyMArray arr0
    e0 <- pathCost costs items len arr0
    worker best e0 e0 initTemp arr0
  where
    worker !best !best_energy !e0 !t arr
      | t < 1 = return best
      | otherwise = do
        undo <- randomMutation gen len arr
        e1 <- pathCost costs items len arr
        let t' = t*coolingFactor
        let rng = 0.5
        -- If the new path is the best we've ever seen, take it.
        if e1 `betterThan` best_energy
          then trace ("New best energy: " ++ show e1 ++ " " ++ show (round t::Int)) $ do
            new_best <- copyMArray arr
            worker new_best e1 e1 t' arr
          else
            -- Otherwise, accept the mutation if allowed by temperature and rng.
            -- 'e1 > e0' is a shortcut to avoid unnecessary floating point computations.
            if e1 `betterThan` e0 || acceptanceProbability e0 e1 t > rng
              then worker best best_energy e1 t' arr
              else
                if acceptanceProbability best_energy e1 t < rng
                  then do -- trace ("Backtracking to: " ++ show best_energy ++ " " ++ show (e1-best_energy) ++ " " ++ show (round t :: Int)) $ do
                    arr1 <- copyMArray best
                    worker best best_energy best_energy t' arr1
                  else do
                    -- Mutation not accepted, undo.
                    undo
                    worker best best_energy e0 t' arr

    initTemp    = 10000
    coolingRate = 0.0001
    coolingFactor = 1-coolingRate


