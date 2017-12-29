module Worker where

import           Control.Concurrent as C
import           Control.Exception

data Worker = Worker (MVar [(ThreadId, MVar ())])

new :: IO Worker
new = fmap Worker (newMVar [])

forkIO :: Worker -> IO () -> IO ()
forkIO (Worker mvar) action = do
    flag <- newEmptyMVar
    tid <- C.forkIO (action `finally` putMVar flag ())
    modifyMVar_ mvar (\lst -> return $ (tid, flag) : lst)

killAll :: Worker -> IO ()
killAll (Worker mvar) = do
    lst <- takeMVar mvar
    mapM_ killThread (map fst lst)
    mapM_ takeMVar (map snd lst)

