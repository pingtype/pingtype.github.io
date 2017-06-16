#!/bin/bash

IFS="";

thisFolder="TOCFL0movies";
outputFolder="TOCFL0moviesReferences";

mkdir "$outputFolder";

theseFiles="$thisFolder/*";

for thisFile in $theseFiles
do
	thisWord=`basename "$thisFile" | cut -d. -f1`

	while IFS= read -r thisLine; do 

		outputFilename=`basename "$thisLine"`
		
		echo "$thisWord" >> "$outputFolder/$outputFilename";
				
	done < "$thisFile"

done
