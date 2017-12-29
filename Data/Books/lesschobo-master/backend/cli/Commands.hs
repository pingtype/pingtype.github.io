module Commands where

import System.Console.CmdTheLine
import Control.Applicative

import Commands.WordList
import Commands.Satisfy
import Commands.Load

-- word list
-- satisfy
-- sort stencils
-- merge stencils
-- load stencils


wordListInfo :: TermInfo
wordListInfo = defTI
  { termName = "list"
  , termDoc  = "Generate word list from input text document" }

wordListTerm :: Term (IO ())
wordListTerm = cmdWordList <$> outputFormat <*> inputFile
  where
    inputFile = fileExists $ required $ pos 0 Nothing posInfo
      { posName = "FILE"
      , posDoc  = "Text file containing mandarin." }
    outputFormat = value $ opt WordListTable (optInfo ["output","o"])
      { optName = "FORMAT"
      , optDoc  = "plain or table." }



satisfyInfo :: TermInfo
satisfyInfo = defTI
  { termName = "satisfy"
  , termDoc  = "Generate a subset of stencils that cover as many of the \
               \words in the input text as possible." }

satisfyTerm :: Term (IO ())
satisfyTerm =
    cmdSatisfy <$> verbose <*> costLimit <*> assumedFiles <*> inputFile
  where
    inputFile = fileExists $ required $ pos 0 Nothing posInfo
      { posName = "FILE"
      , posDoc  = "Text file containing mandarin." }
    assumedFiles = filesExist $ value $ optAll [] (optInfo ["assume","a"])
      { optName = "FILE"
      , optDoc  = "Stencils files covering concepts the \
                  \user has already been shown." }
    costLimit = value $ opt 10 (optInfo ["cost-limit","c"])
      { optName = "MAX-COST"
      , optDoc  = "Limit the word cost (recip of word frequency)" }




loadInfo :: TermInfo
loadInfo = defTI  
  { termName = "load"
  , termDoc  = "Load stencils into central db." }

loadTerm :: Term (IO ())
loadTerm = cmdLoad <$> verbose <*> inputFiles
  where
    inputFiles = filesExist $ nonEmpty $ posAny [] posInfo
      { posName = "FILES"
      , posDoc  = "Yaml stencils files" }




verbose :: Term Bool
verbose = value . flag $
  (optInfo ["verbose", "v"])
  { optDoc = "Verbose" }




runCommands :: IO ()
runCommands =
    runChoice (noCommand, self) commands
  where
    noCommand = ret (pure $ helpFail Plain Nothing)
    self = defTI{ termName = "lesschobo-cli" }

commands :: [ (Term (IO()), TermInfo) ]
commands =
  [ (wordListTerm, wordListInfo)
  , (satisfyTerm, satisfyInfo)
  , (loadTerm, loadInfo) ]
