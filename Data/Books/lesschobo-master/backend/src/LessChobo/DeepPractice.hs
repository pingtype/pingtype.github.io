module LessChobo.DeepPractice where

type At       = Int
type Duration = Int
data Datum    = Datum Duration At


{-
A :: Duration
B = [Datum]

P(A|B) = P(B|A)

P(B|A) = 1/(|above-below|+1)

P(B) = 1

-}



