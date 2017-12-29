{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ParallelListComp  #-}
{-# LANGUAGE TemplateHaskell   #-}
{-# OPTIONS_GHC -fno-warn-orphans #-}
module Main ( main ) where

import           DB
import           LessChobo.Stencils         (permaUserId)
import           LessChobo.Responses (Response(..))
import           Logic

import           Control.Applicative
import           Control.Concurrent
import           Control.Exception
import           Control.Monad
import           Control.Monad.Fix
import           Control.Monad.Trans
import qualified Data.Aeson                 as Aeson
import qualified Data.ByteString.Char8      as B
import           Data.List.Split
import           Data.Maybe
import           Data.Pool
import qualified Data.Set                   as Set
import qualified Data.Text                  as T
import           Data.Time
import           Database.MongoDB
import qualified Database.PostgreSQL.Simple as PSQL
import           Happstack.Server           hiding (Host, Response)
import           Network.URI                (URI (..), URIAuth (..), parseURI,
                                             uriAuthority)
import           System.Environment
import           System.IO.Error

import qualified Worker

instance ToMessage Aeson.Value where
  toContentType _ = "text/json"
  toMessage       = Aeson.encode

--maxSize :: Int
--maxSize = 1024*1024*10

--MONGO_URL=mongodb://$MONGO_PORT_27017_TCP_ADDR/lesschobo
getMongoAddr :: IO (Host, Database)
getMongoAddr = do
  mongoURL <- getEnv "MONGO_URL" `catchIOError` \_ -> return ""
  return $ fromMaybe (readHostPort "127.0.0.1:3001", "meteor") $ do
    uri <- parseURI mongoURL
    auth <- uriAuthority uri
    addr <- readHostPortM (uriRegName auth ++ uriPort auth)
    return (addr, T.pack $ tail $ uriPath uri)

mkDatabasePool :: IO (Pool PSQL.Connection)
mkDatabasePool = do
  dbAddr <- getEnv "SQL_DB" `catchIOError` \_ -> return "host=localhost user=postgres"
  createPool (PSQL.connectPostgreSQL (B.pack dbAddr)) PSQL.close
    1 -- One stripe.
    (60*60) -- Keep connections open for an hour.
    5 -- Max five connections per stripe.

oneSecond :: Int
oneSecond = 10^6

logExceptions :: String -> IO () -> IO ()
logExceptions name action =
  catch action $ \e -> do
    putStrLn $ name ++ ": " ++ show e
    case fromException e of
      Nothing -> return ()
      Just e  -> throwIO (e::AsyncException)

main :: IO ()
main = do
  group <- Worker.new
  pool <- mkDatabasePool
  (mongoHost, database) <- getMongoAddr
  pipe <- connect mongoHost


  Worker.forkIO group $ forever $ do
    logExceptions "updDirtyStencils" $ runDB pool $ updDirtyStencils
    threadDelay oneSecond

  Worker.forkIO group $ forever $ do
    logExceptions "updDirtySchedule" $ runDB pool $ updDirtySchedule
    threadDelay oneSecond

  Worker.forkIO group $ forever $ do
    logExceptions "updCourseStats" $ runDB pool $ \conn ->
      updCourseStats conn pipe database
    threadDelay oneSecond

  simpleHTTP nullConf (msum
    [ do -- decodeBody (defaultBodyPolicy "/tmp/" maxSize maxSize maxSize)
         --liftIO $ putStrLn "Body decoded"
         mzero
    , dir "users" $ path $ \userId -> do
      msum
        [ {-dir "duplicate" $ path $ \dstUserId -> do
          method POST
          () <- update' global $ DuplicateUser userId dstUserId
          ok $ toResponse ()
        , -}dir "courses" $ msum
          [ path $ \courseId -> msum
            [ dir "review" $ do
              liftIO $ putStrLn "review"
              cards <- runDB pool $ \conn -> do
                ensureUser conn userId
                drawReviewCards conn userId courseId
              ok $ toResponse $ Aeson.toJSON cards
            , path $ \unitIdx -> do
              liftIO $ putStrLn "study"
              cards <- runDB pool $ \conn -> do
                ensureUser conn userId
                drawStudyCards conn userId courseId unitIdx
              ok $ toResponse $ Aeson.toJSON cards
            ]
          ]
        ]
    , dir "responses" $ path $ \courseId -> do
      method POST
      response <- jsonBody
      liftIO $ 
        triggerStatsUpdate pipe database (responseUserId response) courseId
      runDB pool $ \conn ->
        Logic.addResponse conn response
      ok $ toResponse ()
    , dir "responses" $ do
      method POST
      response <- jsonBody
      runDB pool $ \conn ->
        Logic.addResponse conn response
      ok $ toResponse ()

    , dir "perma" $ do
      method GET
      lst <- runDB pool $ fetchPermaResponses
      ok $ toResponse $ Aeson.toJSON lst
    , dir "perma" $ do
      method POST
      responses <- jsonBody
      let userIds = Set.toList $ Set.fromList (map permaUserId responses)
      runDB pool $ \conn ->
        mapM_ (ensureUser conn) userIds
      forM_ (chunksOf 1000 responses) $ \chunk ->
        runDB pool $ \conn -> postPermaResponses conn chunk
      runDB pool $ deleteDuplicateResponses
      ok $ toResponse ()

    , dir "courses" $ path $ \courseId -> do
      method PUT
      unitList <- jsonBody
      runDB pool $ \conn ->
        postCourse conn courseId unitList
      ok $ toResponse ()

    , dir "units" $ path $ \unitId -> do
      liftIO $ putStrLn "units"
      method PUT
      stencils <- jsonBody
      runDB pool $ \conn ->
        postUnit conn unitId (sanitizeStencils stencils)
      ok $ toResponse ()

    , dir "recalc" $ do
      liftIO $ forkIO $ runDB pool $ recalcAllBrains
      ok $ toResponse ()
    ]) `finally` Worker.killAll group
  where
    jsonBody :: Aeson.FromJSON a => ServerPart a
    jsonBody = do
      liftIO $ putStrLn "jsonBody"
      rq <- askRq
      mbBS <- fmap unBody <$> takeRequestBody rq
      case mbBS of
        Nothing -> mzero
        Just bs -> do
          -- liftIO $ L.putStrLn bs
          case Aeson.decode bs of
            Nothing    -> liftIO (putStrLn "failed to parse") >> mzero
            Just value -> return value





--openChobo :: IO (AcidState Global)
--openChobo = openLocalState emptyGlobal



{-
CourseStats
{ userId:   id
, courseId: id
, review:   boolean
, seen:     int
, mastered: int
, total:    int
, updatedAt: date
, expiresAt: date
}
-}
updCourseStats :: PSQL.Connection -> Pipe -> Database -> IO ()
updCourseStats conn pipe database = do
 -- fetch expired or old userId/courseId pairs
  now <- getCurrentTime
  access pipe slaveOk database $ do
    cursor <- find (select ["expiresAt" =: ["$lt" =: now]] "CourseStats")
    fix $ \loop -> do
      objs <- nextBatch cursor
      unless (null objs) $ do
        forM_ objs $ \obj -> do
          liftIO $ putStrLn $ "Got object: " ++ show obj
          let userId = at "userId" obj
              courseId = at "courseId" obj
          doc <- liftIO $ mkUserStats conn now userId courseId
          liftIO $ putStrLn $ "Made doc: " ++ show doc
          upsert
            (select [ "userId" =: userId
                    , "courseId" =: courseId] "CourseStats")
            doc
        loop
    closeCursor cursor
    return ()
  -- recalculate review/seen/mastered for each one of them.
  return ()

{-
{ userId:    id
, courseId:  id
, review:    int
, seen:      int
, mastered:  int
, total:     int
, expiresAt: at
, updatedAt: at
}
-}
mkUserStats :: PSQL.Connection -> UTCTime -> UserId -> CourseId -> IO Document
mkUserStats conn now userId courseId = do
 (review, seen, total, expires) <- fetchUserMetrics conn userId courseId
 let longExpire = addUTCTime 200000 now
     expires' = fromMaybe longExpire expires
     nearest = addUTCTime 10 now
     expires'' = max nearest expires'
 return
   [ "userId"   =: userId
   , "courseId" =: courseId
   , "review"   =: review
   , "seen"     =: seen
   , "mastered" =: (0::Int)
   , "total"    =: total
   , "expiresAt" =: expires''
   , "updatedAt" =: now ]

triggerStatsUpdate :: Pipe -> Database -> UserId -> CourseId -> IO ()
triggerStatsUpdate pipe database userId courseId = do
  now <- getCurrentTime
  let expire = addUTCTime 10 now
  access pipe slaveOk database $ do
    mbObj <- findOne (select ["userId" =: userId, "courseId" =: courseId]
                        "CourseStats")
    case mbObj of
      Just doc | at "expiresAt" doc < expire -> do
        liftIO $ putStrLn "Found young expire date"
        return ()
      -- Just doc -> do
      --   liftIO $ putStrLn "Old expire date, replacing."
      --   modify
      --       (select [ "userId" =: userId
      --               , "courseId" =: courseId] "CourseStats")
      --       [ "$set" =: [ "userId"   =: userId
      --       , "courseId" =: courseId
      --       , "expiresAt" =: expire
      --       , "updatedAt" =: now ]]
      _Nothing -> do
        liftIO $ putStrLn "Missing expire date, replacing."
        upsert
            (select [ "userId" =: userId
                    , "courseId" =: courseId] "CourseStats")
            [ "$set" =: ["userId"   =: userId
            , "courseId" =: courseId
            , "expiresAt" =: expire
            , "updatedAt" =: now ]]
    
