module Commands.Load
  ( cmdLoad
  , readStencilDB
  , writeStencilDB
  ) where

import           Control.Monad
import qualified Data.ByteString    as B
import qualified Data.Yaml          as Yaml
import           System.Directory
import           System.FilePath
import           System.IO

import           LessChobo.Stencils

import           Commands.Merge

-- FIXME: Create a type synonym for Verbose.
cmdLoad :: Bool -> [FilePath] -> IO ()
cmdLoad verbose paths = do
  stencils <- fmap concat $ forM paths $ \path -> do
    when verbose $
      putStr $ "Loading stencils: " ++ path
    hFlush stdout
    stencils <- loadStencils path
    when verbose $
      putStrLn $ " OK, " ++ show (length stencils) ++ " stencils"
    return stencils
  when verbose $
    putStrLn "Loading stencil DB."
  origStencils <- readStencilDB
  when verbose $
    putStrLn $ "Stencil DB: " ++ show (length origStencils) ++ " stencils"
  let newStencils = nubStencils $ origStencils ++ stencils
      added = length newStencils - length origStencils
      dups  = length origStencils + length stencils - length newStencils
  when verbose $ do
    putStrLn $ "Added: " ++ show added
    putStrLn $ "Dups:  " ++ show dups
    putStrLn $ "Total: " ++ show (length newStencils)
  writeStencilDB newStencils




readStencilDB :: IO [Stencil]
readStencilDB = do
  dir <- getAppUserDataDirectory "lesschobo"
  createDirectoryIfMissing True dir
  let path = dir </>  "stencils.yaml"
  exist <- doesFileExist path
  unless exist $
    writeFile path "[]"
  loadStencils path

-- Atomically replace the stencil DB.
writeStencilDB :: [Stencil] -> IO ()
writeStencilDB stencils = do
  dir <- getAppUserDataDirectory "lesschobo"
  createDirectoryIfMissing True dir
  (path, handle) <- openTempFile dir "stencils.yaml"
  B.hPut handle (Yaml.encode stencils)
  hClose handle
  renameFile path (dir </> "stencils.yaml")



loadStencils :: FilePath -> IO [Stencil]
loadStencils path = do
  ret <- Yaml.decodeFileEither path
  case ret of
    Left msg       -> error $ "Failed to decode yaml file: " ++ show msg
    Right stencils -> return stencils
