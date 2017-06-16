#!/bin/bash

inputFile="tocfl0.txt";
indexFile="movies.txt";
outputFolder="TOCFL0movies";

while IFS= read -r thisWord; do 

	grep "$thisWord" "$indexFile" | cut -d "	" -f 1 > "$outputFolder/$thisWord.txt";

done < "$inputFile"