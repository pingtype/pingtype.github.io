#!/usr/local/bin/bash

# Warning - you have to update bash on Mac OS 10.9 for this to work. 

# head -n 20 "/Users/peter/Documents/Homes/Taiwan/Kaohsiung/Social/Traditional Characters/ucd.unihan.grouped.xml" | tail -n 10 | ./unihanToDictionary.sh

# cat "/Users/peter/Documents/Homes/Taiwan/Kaohsiung/Social/Traditional Characters/ucd.unihan.grouped.xml" | ./unihanToDictionary.sh > "/Users/peter/Sites/pingxing/UnihanDictionary.txt"

# Don't forget to sort afterwards.
# do shell script "sort -k6 -r -t $'\\t' \"/Users/peter/Sites/pingxing/UnihanDictionary.txt\" > \"/Users/peter/Sites/pingxing/UnihanDictionarySorted.txt\""

# Runtime: 17m24.504s

while IFS= read -r thisLine; do
	
	thisName="";
	thisPinyin="";
	thisDefinition="";
	thisFrequency="";
	thisPinyinToneless="";
	thisPinyinTones="";
	
	if [[ $thisLine == *"<char cp=\""* ]]; then
		thisName=`echo "$thisLine" | sed 's/.*<char cp=\"//g' | sed 's/\".*//g'`;
		
		#printf '%u' "$thisName";
		
		thisName=`echo -n -e "\u$thisName"`;
	fi

	if [[ $thisLine == *"kMandarin=\""* ]]; then
		thisPinyin=`echo "$thisLine" | sed 's/.*kMandarin=\"//g' | sed 's/\".*//g'`;
		
		if [[ $thisPinyin == "" ]]; then
			thisPinyin=`echo "$thisLine" | sed 's/.*kHanyuPinyin=\"//g' | sed 's/\".*//g'`;
			thisPinyin=`echo "$thisPinyin" | sed 's/,.*//g'`;
		fi
		
	fi

	if [[ $thisLine == *"kDefinition=\""* ]]; then
		thisDefinition=`echo "$thisLine" | sed 's/.*kDefinition=\"//g' | sed 's/\".*//g'`;
		
		echo $thisDefinition;
		
		thisDefinition=`echo "$thisDefinition" | sed 's/\(.*\)(.*)/\1/g'`;
		thisDefinition=`echo "$thisDefinition" | sed 's/to //g'`;
		thisDefinition=`echo "$thisDefinition" | sed 's/or .*//g'`;
		thisDefinition=`echo "$thisDefinition" | sed 's/non-standard form of //g'`;
		thisDefinition=`echo "$thisDefinition" | sed 's/,.*//g'`;
		thisDefinition=`echo "$thisDefinition" | sed 's/;.*//g'`;
		thisDefinition=`echo "$thisDefinition" | sed -e 's/^ *//g;s/ *$//g'`;

	fi
	
	if [[ $thisLine == *"kFrequency=\""* ]]; then
		thisFrequency=`echo "$thisLine" | sed 's/.*kFrequency=\"//g' | sed 's/\".*//g'`;
		
		thisFrequency=`echo $((10 - $thisFrequency))`;
		
	fi
	
	# Remove tones
	thisPinyinToneless=`echo "$thisPinyin" | sed 'y/áéíóúếǘńḿ/aeioueunm/'`;
	thisPinyinToneless=`echo "$thisPinyinToneless" | sed 'y/àèìòùềǜǹ/aeioueun/'`;
	thisPinyinToneless=`echo "$thisPinyinToneless" | sed 'y/ǎěǐǒǔǎêěǐǒǚň/aeiouaeeioun/'`;
	thisPinyinToneless=`echo "$thisPinyinToneless" | sed 'y/āēīōūü/aeiouu/'`;

	# Get tones
	thisPinyinTones=`echo "$thisPinyin" | sed 'y/āēīōūü/111111/'`;
	thisPinyinTones=`echo "$thisPinyinTones" | sed 'y/áéíóúếǘńḿ/222222222/'`;
	thisPinyinTones=`echo "$thisPinyinTones" | sed 'y/ǎěǐǒǔǎêěǐǒǚň/333333333333/'`;
	thisPinyinTones=`echo "$thisPinyinTones" | sed 'y/àèìòùềǜǹ/44444444/'`;
	thisPinyinTones=${thisPinyinTones//[!0-9]/};
	

	if [[ $thisName != "" ]]; then
		echo "$thisName	$thisDefinition	$thisPinyin	$thisPinyinToneless	$thisPinyinTones	$thisFrequency	";
	fi
		
done
