#!/bin/bash
# also replace-all verb-ing, verb-ed, verb-en, adjective-er, adjective-est
#
# (.*)ing	(.*)	1
# \1ing	\2	2
#
# (.*)ed	(.*)	1
# \1ed	\2	2
# 
# (.*)en	(.*)	1
# \1en	\2	2
# 
# (.*)er	(.*)	1
# \1er	\2	3
#
# (.*)est	(.*)	1
# \1est	\2	3
#
#	1. Other	
#	2. Verb
#	3. Adjective
# 	4. Noun


inputFile="nltWordsEnglishIpaPhonicsBopomofoChinese.txt";

nounsFile="Classifications/nouns.txt"
verbsFile="Classifications/verbs.txt"
adjectivesFile="Classifications/adjectives.txt"

nounsAllFile="Classifications/nounsAll.txt"
verbsAllFile="Classifications/verbsAll.txt"
adjectivesAllFile="Classifications/adjectivesAll.txt"

outputFile="EnglishIpaPhonicsBpmChinesePos.txt";

while IFS= read -r thisWordIpaPhonicsBpmChinese; do 
	
	thisWord=`echo "$thisWordIpaPhonicsBpmChinese" | cut -d "	" -f 1`;
	
	nounsSearch=`grep -m 1 "^$thisWord    " "$nounsFile"`;
	
	if [[ $nounsSearch != "" ]]
	then
	   echo "$thisWordIpaPhonicsBpmChinese	4" >> "$outputFile";

	else

	   verbsSearch=`grep -m 1 "^$thisWord    " "$verbsFile"`;
	   
	   if [[ $verbsSearch != "" ]]
	   then
		  echo "$thisWordIpaPhonicsBpmChinese	2" >> "$outputFile";

	   else
	   
		  adjectivesSearch=`grep -m 1 "^$thisWord    " "$adjectivesFile"`;
		  
		  if [[ $adjectivesSearch != "" ]]
		  then

			 echo "$thisWordIpaPhonicsBpmChinese	3" >> "$outputFile";

		  else
			
			nounsAllSearch=`grep -m 1 "^$thisWord    " "$nounsAllFile"`;
			
			if [[ $nounsAllSearch != "" ]]
			then
				echo "$thisWordIpaPhonicsBpmChinese	4" >> "$outputFile";
			else
			
				verbsAllSearch=`grep -m 1 "^$thisWord    " "$verbsAllFile"`;
				
				if [[ $verbsAllSearch != "" ]]
				then
					echo "$thisWordIpaPhonicsBpmChinese	2" >> "$outputFile";
				else
				
					adjectivesAllSearch=`grep -m 1 "^$thisWord    " "$adjectivesAllFile"`;
					if [[ $adjectivesAllSearch != "" ]]
					then
						echo "$thisWordIpaPhonicsBpmChinese	3" >> "$outputFile";
					else
						echo "$thisWordIpaPhonicsBpmChinese	1" >> "$outputFile";
					fi
				fi
			fi
		  fi			   
	   fi
	fi	


done < "$inputFile"