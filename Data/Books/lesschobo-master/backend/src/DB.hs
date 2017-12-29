{-# LANGUAGE DeriveDataTypeable #-}
{-# LANGUAGE OverloadedStrings  #-}
{-# LANGUAGE RecordWildCards    #-}
{-# OPTIONS_GHC -fno-warn-orphans #-}
module DB
    ( runDB
    , ensureUser
    , postCourse
    , postUnit
    , postStencils
    , addResponse
    , fetchStencilModels
    , postModels
    , postNewStencilSchedule
    , fetchReviewStencils
    , fetchStudyStencils
    , fetchDirtyStencils
    , fetchDirtyUsers
    , fetchDirtySchedule
    , postFeatures
    , fetchPermaResponses
    , postPermaResponses
    , fetchFeatureResponses
    , fetchTouchedFeatures
    , fetchUserList
    , deleteDuplicateResponses
    , fetchUserMetrics
    , FeatureId
    , Model
    , UserId
    , CourseId
    ) where

import           LessChobo.Common               
import           LessChobo.Features                     (Feature (..), Rep,
                                                         repSchedule)
import           LessChobo.Responses
import           LessChobo.Stencils                     (PermaResponse (..),
                                                         Stencil (..))

import           Control.Applicative
import           Control.Exception
import           Control.Monad
import           Control.Monad.Trans
import           Data.Aeson
import           Data.Pool
import           Data.Time
import           Data.Typeable
import qualified Data.Vector                            as V
import           Database.PostgreSQL.Simple
import           Database.PostgreSQL.Simple.FromField
import           Database.PostgreSQL.Simple.ToField
import           Database.PostgreSQL.Simple.Transaction

type Model = Rep

instance FromField Feature where
    fromField = fromJSONField

instance ToField Feature where
    toField = toJSONField


instance FromField ResponseContent where
    fromField = fromJSONField

instance ToField ResponseContent where
    toField = toJSONField


instance FromField Stencil where
    fromField = fromJSONField

instance ToField Stencil where
    toField = toJSONField



instance FromField Rep where
    fromField = fromJSONField

instance ToField Rep where
    toField = toJSONField

newtype FeatureModel = FeatureModel { unFeatureModel :: (Feature, Model) }
    deriving ( Typeable )
instance FromField FeatureModel where
    fromField = fromJSONField

instance FromJSON FeatureModel where
    parseJSON = withObject "FeatureModel" $ \o ->
        FeatureModel <$>
        ((,)
            <$> o .: "f1"
            <*> o .: "f2")



logErrors :: IO a -> IO a
logErrors action = action `catch` \e -> do
    putStrLn $ "Error: " ++ show (e::SomeException)
    throwIO e

runDB :: MonadIO m => Pool Connection -> (Connection -> IO a) -> m a
runDB pool action =
    liftIO $
    logErrors $
    withResource pool $ \conn ->
    withTransactionSerializable conn (action conn)

ensureUser :: Connection -> UserId -> IO ()
ensureUser conn userId = do
    rets <- query conn "SELECT id FROM Users WHERE id = ?" (Only userId)
    when (null (rets :: [Only UserId])) $ do
        _ <- execute conn "INSERT INTO Users (id) VALUES (?)" (Only userId)
        return ()

postCourse :: Connection -> CourseId -> [UnitId] -> IO ()
postCourse conn courseId units = do
    void $ execute conn
        "DELETE FROM Units WHERE course_id = ?"
        (Only courseId)
    _ <- executeMany conn
        "INSERT INTO Units (id, course_id, index) VALUES (?, ?, ?)"
        [ (unitId, courseId, n::Int)
        | (unitId, n) <- zip units [0..] ]
    void $ execute conn
        "DELETE FROM Inherit WHERE receiver = ? AND receiver = ?"
        (courseId, courseId)
    void $ execute conn
        "INSERT INTO Inherit (receiver, giver) VALUES (?,?)"
        (courseId, courseId)
    return ()

postStencils :: Connection -> [Stencil] -> IO [StencilId]
postStencils conn stencils = do
    rows <- returning conn "INSERT INTO StencilsView (content) VALUES (?) \
                            \RETURNING id"
                [ Only stencil
                | stencil <- stencils ]
    return $ map fromOnly rows

postUnit :: Connection -> UnitId -> [Stencil] -> IO ()
postUnit conn unitId stencils = do
    _ <- execute conn "DELETE FROM UnitMembers WHERE unit_id = ?" (Only unitId)
    stencilIds <- postStencils conn stencils
    _ <- executeMany conn
        "INSERT INTO UnitMembers (unit_id, stencil_id, index) \
        \VALUES (?, ?, ?)"
        [ (unitId, stencilId, n::Int)
        | (stencilId, n) <- zip stencilIds [0..] ]
    return ()

querySingle :: (FromRow r, ToRow q) => Connection -> Query -> q -> IO r
querySingle conn str q = do
    rows <- query conn str q
    case rows of
        []  -> error $ "querySingle: No results: " ++ show str
        [x] -> return x
        _   -> error $ "querySingle: Multiple results: " ++ show str

addResponse :: Connection -> Response -> IO ResponseId
addResponse conn Response{..} = do
    Only responseId <- querySingle conn
        "INSERT INTO Responses (id, stencil_id, user_id, content, at) \
        \VALUES (uuid_generate_v4(),?,?,?,?) RETURNING id"
        (responseStencil, responseUserId, responseContent, responseAt)
    return responseId

fetchStencilModels :: Connection -> UserId -> StencilId ->
    IO [(FeatureId, Feature, Maybe Model)]
fetchStencilModels conn userId stencilId =
    query conn
        "SELECT id, Features.content, \
        \  (SELECT content FROM Models WHERE user_id = ? AND \
        \     feature_id = Features.id) \
        \FROM Features, StencilFeatures \
        \WHERE StencilFeatures.stencil_id = ? AND \
        \      Features.id = StencilFeatures.feature_id"
        (userId, stencilId)

postModels :: Connection -> UserId -> [(FeatureId, Model)] -> IO ()
postModels conn userId models = do
    void $ execute conn
        "DELETE FROM Models WHERE user_id = ? AND feature_id IN ?"
        (userId, In (map fst models))
    void $ executeMany conn
        "INSERT INTO Models (user_id, feature_id, content, at)\
        \ VALUES (?, ?, ?, ?)"
        [ (userId, featureId, model, repSchedule model)
        | (featureId, model) <- models ]

postNewStencilSchedule :: Connection -> UserId -> StencilId -> UTCTime -> IO ()
postNewStencilSchedule conn userId stencilId at = do
    void $ execute conn
        "DELETE FROM Schedule WHERE user_id = ? AND stencil_id = ?"
        (userId, stencilId)
    void $ execute conn
        "INSERT INTO Schedule (user_id, stencil_id, at) \
        \VALUES (?,?,?)"
        (userId, stencilId, at)



fetchReviewStencils :: Connection -> UserId -> CourseId ->
    IO [(StencilId, Stencil, [(Feature, Model)])]
fetchReviewStencils conn userId courseId = do
    rows <- query conn
        "SELECT stencil_id, stencil, brain \
        \FROM Review \
        \WHERE user_id = ? AND course_id = ? AND review_at < now() \
        \LIMIT 10"
        (userId, courseId)
    return
        [ (stencilId, stencil, V.toList $ V.map unFeatureModel brain)
        | (stencilId, stencil, brain) <- rows]
    --return
    --    [ (stencilId, stencil, V.toList (V.zip features models))
    --    | (stencilId, stencil, features, models) <- rows]

fetchStudyStencils :: Connection -> UserId -> CourseId -> Int ->
    IO [(StencilId, Stencil, [(Feature, Model)])]
fetchStudyStencils conn userId courseId unitIdx = do
    rows <- query conn
        "SELECT stencil_id, stencil, brain \
        \FROM Study \
        \WHERE user_id = ? AND course_id = ? AND unitindex <= ? AND\
        \      at IS NULL \
        \LIMIT 10"
        (userId, courseId, unitIdx)
    return
        [ (stencilId, stencil, V.toList $ V.map unFeatureModel brain)
        | (stencilId, stencil, brain) <- rows]
    -- return
    --     [ (stencilId, stencil, filterNothing $ V.toList (V.zip features models))
    --     | (stencilId, stencil, features, models) <- rows]
  -- where
  --   filterNothing = mapMaybe fn
  --   fn (x, Nothing) = Nothing
  --   fn (x, Just y)  = Just (x,y)

fetchDirtyStencils :: Connection -> IO [(StencilId, Stencil)]
fetchDirtyStencils conn =
    query conn
        "SELECT id, content \
        \FROM Stencils \
        \WHERE dirty"
        ()

fetchDirtyUsers :: Connection -> IO [UserId]
fetchDirtyUsers conn = do
    rows <- query conn "SELECT id FROM Users WHERE dirty" ()
    void $ execute conn "UPDATE Users SET dirty = false" ()
    return $ map fromOnly rows

fetchDirtySchedule :: Connection -> UserId -> IO [(StencilId, UTCTime)]
fetchDirtySchedule conn userId = query conn
    "SELECT stencil_id, at \
    \FROM DirtySchedule \
    \WHERE user_id = ?"
    (Only userId)

-- rewriteStencilSchedule :: Connection -> IO

postFeatures :: Connection -> StencilId -> [Feature] -> IO ()
postFeatures conn stencilId features = do
    featureIds <- returning conn
        "INSERT INTO FeaturesView (content) VALUES (?) RETURNING id"
        [ Only feature | feature <- features ]
    void $ execute conn "DELETE FROM StencilFeatures WHERE stencil_id = ?"
        (Only stencilId)
    void $ executeMany conn
        "INSERT INTO StencilFeatures (stencil_id, feature_id) VALUES (?,?)"
        [ (stencilId, featureId :: FeatureId)
        | Only featureId <- featureIds ]
    void $ execute conn
        "UPDATE Stencils SET dirty = false WHERE id = ?"
        (Only stencilId)


fetchPermaResponses :: Connection -> IO [PermaResponse]
fetchPermaResponses conn = do
    rows <- query conn
        "SELECT Stencils.content, user_id, Responses.content, at \
        \FROM Responses, Stencils \
        \WHERE Responses.stencil_id = Stencils.id"
        ()
    return
        [ PermaResponse
            { permaResponseAt = at
            , permaContent    = content
            , permaStencil    = stencil
            , permaUserId     = userId }
        | (stencil, userId, content, at) <- rows ]

-- XXX: Would be faster to filter out duplicate stencils before we
--      insert them in the database.
postPermaResponses :: Connection -> [PermaResponse] -> IO ()
postPermaResponses conn responses = do
    rows <- returning conn
        "INSERT INTO StencilsView (content) VALUES (?) RETURNING id"
        [ Only (permaStencil response)
        | response <- responses ]
    void $ executeMany conn
        "INSERT INTO Responses (stencil_id, user_id, content, at)\
        \ VALUES (?,?,?,?)"
        [ (stencilId :: StencilId, permaUserId, permaContent, permaResponseAt)
        | (Only stencilId, PermaResponse{..}) <- zip rows responses ]
    return ()

fetchFeatureResponses
    :: Connection -> UserId
    -> FeatureId -> Feature -> IO [Response]
fetchFeatureResponses conn userId _featureId feature =
    case feature of
        MandarinWordFeature word ->
            fetchMandarinWordResponses conn userId word
        -- _ -> fetchFeatureResponsesById conn userId featureId

fetchFeatureResponsesById :: Connection -> UserId -> FeatureId -> IO [Response]
fetchFeatureResponsesById conn userId featureId = do
    rows <- query conn
        "SELECT DISTINCT ON (at, id) \
        \       Responses.stencil_id, content, at \
        \FROM Responses, StencilFeatures \
        \WHERE Responses.stencil_id = StencilFeatures.stencil_id AND\
        \      Responses.user_id = ? AND\
        \      StencilFeatures.feature_id = ? \
        \ORDER BY at ASC, id"
        (userId, featureId)
    return
        [ Response at content stencilId userId
        | (stencilId, content, at) <- rows ]

-- FIXME: We should make sure to only return responses for stencils
--        that refer to our feature. Right now we rely on the fact
--        that all responses with {key: word} refers to the feature
--        for that word.
fetchMandarinWordResponses :: Connection -> UserId -> Chinese -> IO [Response]
fetchMandarinWordResponses conn userId word = do
    rows <- query conn
        "SELECT DISTINCT ON (at, id) \
        \       Responses.stencil_id, content, at \
        \FROM Responses \
        \WHERE Responses.content @> ? AND\
        \      Responses.user_id = ? \
        \ORDER BY at ASC, id"
        (q, userId)
    return
        [ Response at content stencilId userId
        | (stencilId, content, at) <- rows ]
  where
    q = object
            [ "key" .= word
            , "type" .= ("MandarinTextAnswer"::String) ]


fetchTouchedFeatures :: Connection -> UserId -> IO [(FeatureId, Feature)]
fetchTouchedFeatures conn userId =
    query conn
        "SELECT DISTINCT ON (id) Features.id, Features.content \
        \FROM Features, StencilFeatures, Responses \
        \WHERE Responses.user_id = ? AND\
        \      Responses.stencil_id = StencilFeatures.stencil_id AND\
        \      StencilFeatures.feature_id = Features.id \
        \ORDER BY Features.id"
        (Only userId)

fetchUserList :: Connection -> IO [UserId]
fetchUserList conn = map fromOnly <$> query conn "SELECT id FROM Users" ()

deleteDuplicateResponses :: Connection -> IO ()
deleteDuplicateResponses conn = void $
    execute conn
        "DELETE FROM Responses USING Responses r \
        \WHERE Responses.at = r.at AND\
        \      Responses.content = r.content AND\
        \      Responses.user_id = r.user_id AND\
        \      Responses.id < r.id"
        ()


fetchUserMetrics :: Connection -> UserId -> CourseId
                 -> IO (Int,Int,Int,Maybe UTCTime)
fetchUserMetrics conn userId courseId =
    querySingle conn
        "SELECT review, seen, total, change \
        \FROM CourseMetrics \
        \WHERE user_id = ? AND course_id = ?"
        (userId, courseId)


