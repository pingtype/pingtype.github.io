#!/bin/bash

# Runtime: 17m24.504s

fileText=`cat "/Users/peter/Music/iTunes/Libraries/Traditional Characters/iTunes Library.xml"`;

echo "" > "/Users/peter/Sites/decompose/PinyinDefinitionsTones.txt"

while read -r thisLine; do
	
	if [[ $thisLine == *"<key>Name</key>"* ]]; then
		thisName=`echo "$thisLine" | sed 's/.*<string>\(.*\)<\/string>/\1/g'`;
		
		echo -n "$thisName	" >> "/Users/peter/Sites/decompose/PinyinDefinitionsTones.txt"
	fi

	if [[ $thisLine == *"<key>Grouping</key>"* ]]; then
		thisGrouping=`echo "$thisLine" | sed 's/.*<string>\(.*\)<\/string>/\1/g'`;

		echo -n "$thisGrouping	" >> "/Users/peter/Sites/decompose/PinyinDefinitionsTones.txt"
	fi

	if [[ $thisLine == *"<key>Composer</key>"* ]]; then
		thisComposer=`echo "$thisLine" | sed 's/.*<string>\(.*\)<\/string>/\1/g'`;

		echo -n "$thisComposer	" >> "/Users/peter/Sites/decompose/PinyinDefinitionsTones.txt"
	fi
	
	if [[ $thisLine == *"<key>BPM</key>"* ]]; then
		thisBpm=`echo "$thisLine" | sed 's/.*<integer>\(.*\)<\/integer>/\1/g'`;

		echo -n "$thisBpm	" >> "/Users/peter/Sites/decompose/PinyinDefinitionsTones.txt"
	fi	

	if [[ $thisLine == *"<key>Track ID</key>"* ]]; then
		echo "" >> "/Users/peter/Sites/decompose/PinyinDefinitionsTones.txt"
	fi
		
done <<< "$fileText"
