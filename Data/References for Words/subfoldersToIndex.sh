#!/bin/bash

IFS="";

thisFolder="TaiwanLawChinese";

bookFolders="$thisFolder/*";

for thisBook in $bookFolders
do
	bookChapters="$thisBook/*";
	
	for thisChapter in $bookChapters
	do
		chapterText=`cat "$thisChapter" | tr -d '\n' | tr -d '\r' | tr '	' ' '`;
		
		echo "$thisChapter	$chapterText" >> "index.txt";
		
	done
	
done
