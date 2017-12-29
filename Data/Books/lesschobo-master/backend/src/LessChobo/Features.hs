{-# LANGUAGE DeriveDataTypeable #-}
{-# LANGUAGE OverloadedStrings  #-}
{-# LANGUAGE RecordWildCards    #-}
module LessChobo.Features where

import           LessChobo.Common
import           LessChobo.Responses
import           LessChobo.Utilities

import           Control.Applicative
import           Data.Aeson
import           Data.Char           (isSpace, toLower)
import           Data.Chinese.CCDict (Entry (..), ccDict)
import qualified Data.Chinese.CCDict as CCDict
import           Data.Chinese.Pinyin (clearToneMarks)
import           Data.Maybe
import           Data.Text           (Text)
import qualified Data.Text           as T
import           Data.Time
import           Data.Typeable

-- Eigenvector? Even more esoteric. Brainbug? Seedling? Dimension?
data Feature
  = MandarinWordFeature Chinese
  deriving ( Eq, Ord, Read, Show, Typeable )

instance FromJSON Feature where
  parseJSON = withObject "Feature" $ \o -> do
    ty <- o .: "type"
    case ty of
      "chinese" ->
        MandarinWordFeature
          <$> o .: "word"
      _ -> fail $ "Unknown feature type: " ++ ty

instance ToJSON Feature where
  toJSON feature =
    case feature of
      MandarinWordFeature chinese -> typed "chinese"
        [ "word" .= chinese ]

defaultRep :: Feature -> Rep
defaultRep MandarinWordFeature{} = MandarinWordRep Nothing

data Rep
  = MandarinWordRep (Maybe RecallCurve)
  deriving ( Read, Show, Typeable, Eq )

instance ToJSON Rep where
  toJSON rep =
    case rep of
      MandarinWordRep Nothing -> typed "chinese"
        []
      MandarinWordRep (Just curve) -> typed "chinese"
        [ "curve" .= curve ]

instance FromJSON Rep where
  parseJSON = withObject "Model" $ \o -> do
    ty <- o .: "type"
    case ty of
      "chinese" ->
        MandarinWordRep
          <$> o .:? "curve"
      _ -> fail $ "Unknown model type: " ++ ty



repSchedule :: Rep -> Maybe UTCTime
repSchedule (MandarinWordRep mbCurve) = fmap (recallWhen 0.8) mbCurve

scheduleByReps :: [Rep] -> Maybe UTCTime
scheduleByReps reps =
  case mapM repSchedule reps of
    -- Unless all reps have been scheduled, do not give a final schedule.
    Nothing  -> Nothing
    -- If there are no reps then there's nothing to schedule.
    Just []  -> Nothing
    -- The final schedule is the earliest of the rep schedules.
    Just lst -> Just $ minimum lst

bumpRep :: UTCTime -> Rep -> Rep
bumpRep now rep =
  case rep of
    MandarinWordRep Nothing ->
      MandarinWordRep $ Just (RecallCurve now 100)
    MandarinWordRep (Just curve) ->
      MandarinWordRep $ Just curve{rcSuccessfulRecall = now}


-- There are three ways to correctly answer a Mandarin question:
checkMandarinAnswer :: Chinese -> Text -> Bool
checkMandarinAnswer target answerOrig
  -- 1. Answer with the Chinese charaters
  | answer == target            = True
  -- 2. Answer with pinyin with correct tone marks
  | answer `elem` pinyinAnswers = True
  -- 3. Answer with pinyin /without/ tone marks
  | answer == answerNoTones &&
    answer `elem` pinyinAnswersNoTones
                                = True
  | otherwise                   = False
  where
    answer = T.map toLower (T.filter (not . isSpace) answerOrig)
    answerNoTones = clearToneMarks answer
    pinyinAnswers =
      map (T.map toLower . T.filter (not . isSpace)) $
      fromMaybe [] (fmap entryPinyin (CCDict.lookup target ccDict))
    pinyinAnswersNoTones = map clearToneMarks pinyinAnswers

applyResponse :: Response -> Feature -> Rep -> Rep
applyResponse Response{..} feature rep =
  case (responseContent, feature, rep) of
    (MandarinTextAnswer shownAnswer key answer, MandarinWordFeature chinese, MandarinWordRep mbCurve)
      | key == chinese ->
      let curve = fromMaybe (RecallCurve responseAt 100) mbCurve in
      MandarinWordRep $ Just $
      if checkMandarinAnswer chinese answer
        then if shownAnswer
                then (markSuccess responseAt .
                      bumpStability (recip factor)) curve
                else if recallLikelihood responseAt curve > spuriousCutoff && isJust mbCurve
                  then markSuccess responseAt curve -- Spurious response
                  else (markSuccess responseAt .
                        bumpStability factor .
                        setEffectiveStability responseAt) curve
        else bumpStability guessPenalty curve
    _ -> rep
    where
      -- Reward for correct answers and punishment for giving up.
      factor         = 5
      -- Ignore responses given when the recall probability is higher than this.
      -- This happens when the above factor is increased.
      spuriousCutoff = 0.9
      -- Penalty for giving an incorrect answer.
      guessPenalty   = 0.9










data RecallCurve = RecallCurve
  { rcSuccessfulRecall :: UTCTime
  , rcStability        :: Integer
  } deriving ( Read, Show, Typeable, Eq )

instance ToJSON RecallCurve where
  toJSON (RecallCurve recall stability) = object
    [ "recall"    .= recall
    , "stability" .= stability ]

instance FromJSON RecallCurve where
  parseJSON = withObject "RecallCurve" $ \o ->
    RecallCurve
      <$> o .: "recall"
      <*> o .: "stability"

markSuccess :: UTCTime -> RecallCurve -> RecallCurve
markSuccess now curve = curve{rcSuccessfulRecall = now}

bumpStability :: Rational -> RecallCurve -> RecallCurve
bumpStability factor curve =
  curve{rcStability = max 60 (round (fromIntegral (rcStability curve) * factor))}

setEffectiveStability :: UTCTime -> RecallCurve -> RecallCurve
setEffectiveStability now curve =
    curve{rcStability = max (rcStability curve) effectiveStability}
  where
    effectiveStability = round (diffUTCTime now (rcSuccessfulRecall curve))

-- R = e^(-t/S)
-- t = S(log(1/R))
-- Calculate when the predicted recall will reach 'likelihood' %.
-- Invariant: recallLikelihood (recallWhen likelihood curve) curve = likelihood
-- Invariant: recallWhen (recallLikelihood ts curve) curve = ts
recallWhen :: Double -> RecallCurve -> UTCTime
recallWhen likelihood (RecallCurve ts stability) =
  addUTCTime (realToFrac (fromIntegral stability * log (recip likelihood))) ts

-- R = e^(-t/S)
recallLikelihood :: UTCTime -> RecallCurve -> Double
recallLikelihood future (RecallCurve ts stability) =
    exp (negate (t/fromIntegral stability))
  where
    t = realToFrac $ diffUTCTime future ts
