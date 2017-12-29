{-# LANGUAGE OverloadedStrings #-}
module Logic where

import           Control.Applicative
import           Control.Monad
import           Control.Monad.State
import           Data.Chinese.CCDict
import           Data.List
import           Data.List.Split
import           Data.Map                   (Map)
import qualified Data.Map                   as Map
import           Data.Maybe
import qualified Data.Set                   as Set
import qualified Data.Text                  as T
import           Data.Time
import           Database.PostgreSQL.Simple
import           Text.Printf

import           DB
import           LessChobo.Cards
import           LessChobo.Features         (Feature (..), applyResponse,
                                             bumpRep, defaultRep, repSchedule,
                                             scheduleByReps)
import           LessChobo.Responses
import           LessChobo.Stencils

type Instantiate a = State (Map Feature Model) a

getModel :: Feature -> Instantiate Model
getModel feat = gets (Map.findWithDefault (defaultRep feat) feat)

setModel :: Feature -> Model -> Instantiate ()
setModel feat model = modify $ Map.insert feat model

runInstantiate :: Instantiate a -> [(Feature,Model)] -> a
runInstantiate action st = evalState action m
  where
    m = Map.fromList st

instantiateStencils :: UTCTime -> UserId ->
    [(StencilId, Stencil)] -> Instantiate [Card]
instantiateStencils now userId lst = catMaybes <$> mapM worker lst
  where
    worker (stencilId, stencil) = do
      mbCardContent <- instantiateContent stencil now
      return $ do
        cardContent <- mbCardContent
        return Card{ cardStencil = stencilId, cardContent = cardContent }

dropSeparator :: [Token] -> [Token]
dropSeparator = filter (not . isTokenSeparator)
  where
    isTokenSeparator (UnknownWord "|") = True
    isTokenSeparator _ = False

instantiateContent :: Stencil -> UTCTime -> Instantiate (Maybe CardContent)
instantiateContent (Chinese chinese english _comment) now = do
    let rows = zip (T.lines chinese) (T.lines (T.unlines english) ++
                                        repeat T.empty)
    sentences <- forM rows $ \(line, hint) -> do
      blocks <- forM (dropSeparator $ tokenizer ccDict line) $ \token ->
        case token of
          KnownWord entry -> do
            let feat = MandarinWordFeature (entryChinese entry)
            rep <- getModel feat
            setModel feat (bumpRep now rep)
            let gapped = maybe True (<now) (repSchedule rep)
            let definitions = nub $
                  zipWith MandarinDefinition (entryPinyin entry) (entryDefinition entry)
            return $ MandarinWord (entryChinese entry) definitions gapped
          UnknownWord txt -> return $ EscapedBlock txt
      return $ MandarinGapSentence blocks hint
    let isValid (MandarinGapSentence blocks _) = not $ null [ () | MandarinWord _ _ True <- blocks ]
    if any isValid sentences
      then return $ Just $ ChineseCard sentences
      else return Nothing





limitComplexity :: [Card] -> [Card]
limitComplexity = worker 0
  where
    worker c [] = []
    worker c (card:cards)
      | c >= maxComplexity = []
      | otherwise          = card : worker (c+complexity card) cards
    maxComplexity = 10

drawReviewCards :: Connection -> UserId -> CourseId -> IO [Card]
drawReviewCards conn userId courseId = do
    tasks <- fetchReviewStencils conn userId courseId
    now <- getCurrentTime
    let (stencils, brains) = unzip
            [ ((stencilId, stencil), models)
            | (stencilId, stencil, models) <- tasks ]
    return $ limitComplexity $
      runInstantiate (instantiateStencils now userId stencils)
        (concat brains)

drawStudyCards :: Connection -> UserId -> CourseId -> Int -> IO [Card]
drawStudyCards conn userId courseId unitIdx = do
    review <- fetchReviewStencils conn userId courseId
    study <- fetchStudyStencils conn userId courseId unitIdx
    now <- getCurrentTime
    let (stencils, brains) = unzip
            [ ((stencilId, stencil), models)
            | (stencilId, stencil, models) <- review ++ study ]
    return $ limitComplexity $
      runInstantiate (instantiateStencils now userId stencils)
        (concat brains)





addResponse :: Connection -> Response -> IO ()
addResponse conn response = do
    DB.addResponse conn response
    brains <- DB.fetchStencilModels conn
        (responseUserId response)
        (responseStencil response)
    let newBrains = updateBrain response brains
    DB.postModels conn (responseUserId response) newBrains
    case scheduleByReps (map snd newBrains) of
      Just newSchedule | length newBrains == length brains ->
        postNewStencilSchedule
          conn
          (responseUserId response)
          (responseStencil response)
          newSchedule
      _Nothing -> return ()

updateBrain :: Response -> [(FeatureId, Feature, Maybe Model)]
  -> [(FeatureId, Model)]
updateBrain response = mapMaybe worker
  where
    worker (featureId, feature, mbModel) =
        let model = fromMaybe (defaultRep feature) mbModel
            newModel = applyResponse response feature model in
        if newModel == model
            then Nothing
            else Just (featureId, newModel)

recalcBrain :: Feature -> [Response] -> Model
recalcBrain feat = worker (defaultRep feat)
  where
    worker model [] = model
    worker model (response:responses) =
      worker (applyResponse response feat model) responses



updDirtyStencils :: Connection -> IO ()
updDirtyStencils conn = do
  commit conn

  stencils <- fetchDirtyStencils conn
  forM_ (chunksOf 1000 stencils) $ \chunk -> do
    let n = length chunk
        buffer = length (show n)
    withTransaction conn $
      forM_ (zip [1::Int ..] chunk) $ \(nth, (stencilId, stencil)) -> do
        printf "Dirty: (%*d/%d) %s\n" buffer nth n (show stencilId)
        postFeatures conn stencilId (Set.toList $ features stencil)

  begin conn


recalcAllBrains :: Connection -> IO ()
recalcAllBrains conn = do
  -- Commit the initial transaction. We manage our own transaction since
  -- recalculating can take a while.
  commit conn
  putStrLn "Recalc all"
  users <- withTransaction conn $ fetchUserList conn

  let n = length users
      buffer = length (show n)
  forM_ (zip [1::Int ..] users) $ \(nth, user) -> do
    printf "Recalc user: (%*d/%d) %s\n" buffer nth n (show user)
    recalcUserBrain conn user

  -- Begin a new transaction to suppress the warning when our caller
  -- tries to commit.
  begin conn

recalcUserBrain :: Connection -> UserId -> IO ()
recalcUserBrain conn userId = do
  features <- fetchTouchedFeatures conn userId
  let n = length features
      buffer = length (show n)
  forM_ (zip [1::Int ..] features) $ \(nth, (featureId, feature)) -> do
    printf "Recalc feature: (%*d/%d) %s\n" buffer nth n (show featureId)
    recalcUserModel conn userId featureId feature

recalcUserModel :: Connection -> UserId -> FeatureId -> Feature -> IO ()
recalcUserModel conn userId featureId feature = do
  -- get all responses for stencils that refer the feature.
  -- Sort them by date oldest first.
  responses <- fetchFeatureResponses conn userId featureId feature

  -- Apply all the responses to an empty model.
  let newModel = recalcBrain feature responses
  unless (newModel == defaultRep feature) $
    -- Write model back to DB.
    withTransaction conn $ postModels conn userId [(featureId, newModel)]




updDirtySchedule :: Connection -> IO ()
updDirtySchedule conn = do
  commit conn

  users <- fetchDirtyUsers conn
  let n = length users
      buffer = length (show n)
  forM_ (zip [1::Int ..] users) $ \(nth, userId) -> do
    dirty <- fetchDirtySchedule conn userId
    printf "Dirty stencils: (%*d/%d) %d\n" buffer nth n (length dirty)
    forM_ (chunksOf 10 dirty) $ \lst ->
      withTransaction conn $ forM_ lst $ \(stencilId, at) ->
        postNewStencilSchedule conn userId stencilId at

  begin conn






sanitizeStencils :: [Stencil] -> [Stencil]
sanitizeStencils = nubStencils Set.empty . map stripComments
  where
    stripComments stencil = stencil{stencilComment = ""}
    nubStencils seen lst =
      case lst of
        [] -> []
        (x:xs) | x `Set.member` seen -> nubStencils seen xs
               | otherwise           -> x : nubStencils (Set.insert x seen) xs
