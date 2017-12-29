/*
 * pingtype.c
 *
 * Author: Peter Burkimsher, peterburk@gmail.com
 *
 * Last modified: 2017-12-15, Peter
 * First revision: 2017-12-15, Peter
 * 
 * 
 *
 * Reference: To compile on command line for Mac
cc -lm pingtype.c -o pingtype
 * 
 * To compile on iPhone, using libgcc, GNU C Compiler, Link Identity Editor
gcc -o pingtype pingtype.c
ldid -S pingtype
 * 
 * Example commands
CHINESE=`cat "$CHINESEFILE"`
echo "$CHINESE" | ./pingtype
echo -n "你" | ./pingtype
echo -n "真美妙如此美妙是祢不變的愛" | ./pingtype 
cat "Data/CNLT/19. 詩 Psalms 詩篇/詩 Psalms 詩篇 123.txt" | tr '\r' '\n' | ./pingtype
 * 
 * 
 * Done:
 * + Reading input from stdin
 * + Reading dictionary from file
 * + contains
 * + Word spacing
 * + Pinyin
 * + Literal
 * + Translate HTML
 * + Translate Text
 * 
 * 
 * To do:
 * - containChineseString, isChinese
 * - replaceChars
 * - Deradicalize
 * - Word lists
 * - Translate bilingual
 * - Custom dictionary file
 * - Bopomofo
 * - Simplified conversion
 * 
 */

#include <stdio.h>	 /* Standard input/output definitions */
#include <string.h>  /* String function definitions */
#include <stdlib.h>  /* Definition of malloc */
#include <pthread.h> /* Multi-threading speeds up translation of many lines */
//#include <wchar.h>
//#include <locale.h>


/*#include <unistd.h>*/  /* UNIX standard function definitions */
/*#include <fcntl.h>*/   /* File control definitions */     
/*#include <errno.h>*/   /* Error number definitions */     
/*#include <termios.h>*/ /* POSIX terminal control definitions */     
/*#include <signal.h>*/  /* Process signal library for sigint */
/*#include <dirent.h>*/  /* Reading files from directory */
/*#include <stdlib.h>*/	 /* Standard library */

#define INPUT_LINES 2000	  /* Number of lines in input file */
#define STR_LEN 5000	  /* Number of characters to read of input string */
#define HTML_LEN 50000	  /* Number of characters in output HTML */

#define TRUE 1
#define FALSE 0

#define NUM_TASKS 8
#define NUM_THREADS 8
char *messages[NUM_TASKS];

/* Global variables */

// The dictionary
char *combinedDictionaryData = NULL;

// The lines of the input file
char **inputFileLines;

// The lines of output HTML
char **outputHtmlLines;

/*
typedef struct thread_data {
	int thread_id;
	int sum;
	char *message;
	char *threadDictionaryData;
} tdata_t;
*/

typedef struct thread_data {
	int thread_id;
	char *thisChineseLine;
	char *threadDictionaryData;
} tdata_t;


/*
 * contains: Does a string contain a substring?
 */
int contains(char* thisText, char* startText)
{
    char* startPointer = NULL;

    startPointer = strstr(thisText, startText);

    if (startPointer != NULL)
    {
    	return 1;
    } else {
    	return 0;
    }
} // end contains

/*
 * textBetween: Gets text between two delimiters
 */
char* textBetween(char* thisText, char* startText, char* endText, char* returnText)
{
	//printf("textBetween\n");

    char* startPointer = NULL;
    int stringLength = 0;

    char* endPointer = NULL;
    int endLength = 0;

	if (strstr(startText, "start") != NULL)
	{
		// Set the beginning of the string
		startPointer = thisText;
	} else {
		startPointer = strstr(thisText, startText);

    	if (startPointer != NULL)
	    {
        	startPointer = startPointer + strlen(startText);
        }
	} // end if the start delimiter is "start"
    
    if (startPointer != NULL)
    {

		if (strstr(endText, "end") != NULL)
		{
			// Set the end of the string
			endPointer = thisText;
			endLength = 0;
		} else {
			endPointer = strstr(startPointer, endText);
			endLength = (int)strlen(endPointer);
		} // end if the end delimiter is "end"

        stringLength = strlen(startPointer) - endLength;
        
        if (stringLength == 0)
        {
		    returnText = "";
		    startPointer = NULL;
        } else {
	        // Copy characters between the start and end delimiters
    	    strncpy(returnText,startPointer, stringLength);
	        returnText[stringLength++] = '\0';
		}
        
    } else {
	    //printf("Start pointer not found\n");
	    returnText = "";
	    
    } // end if the start pointer is not found
    
    return startPointer;
} // end textBetween method

/*
 * wordSpace: Puts spaces between Chinese words
 */
char* wordSpace(char* combinedDictionaryData, char* thisChineseLine, char* spacedLine)
{
	//printf("wordSpace %s\n", thisChineseLine);

    char* startPointer = NULL;
	
	// The word we search for
    char* wordText;
    char wordTextArray[STR_LEN];
	wordText = wordTextArray;

	// The word search text, with the return and tab
    char* wordSearchText;
    char wordSearchTextArray[STR_LEN];
	wordSearchText = wordSearchTextArray;


	// The spaced line while we append to it
    char* newSpacedLine;
    char newSpacedLineArray[STR_LEN];
	newSpacedLine = newSpacedLineArray;
	
	// Don't read past the end of the line
	int numberCharacters = strlen(thisChineseLine);
	
	//printf("numberCharacters %d\n", numberCharacters);
	
	int currentCharacter = 0;
	
	int wordFound = FALSE;
	int addExtraSpace = TRUE;
	
	// To Do: write containsChineseString, isChinese
	
    char* inputLine;
    char inputLineArray[STR_LEN];
	inputLine = inputLineArray;
	
	// Don't space blank inputs
	if (strcmp(thisChineseLine,"") == 0)
	{
		return 0;
	}
	
	// Don't space blank inputs
	if (strcmp(thisChineseLine," ") == 0)
	{
		return 0;
	}

	// Don't space blank inputs
	if (strcmp(thisChineseLine,"	") == 0)
	{
		return 0;
	}
	

	sprintf(inputLine, "%s§", thisChineseLine);
	

	//printf("wordSpace inputLine %s\n", inputLine);

	
	startPointer = inputLine;
	
	int currentOutputCharacter = 0;
	
	for (currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
	{
		// Words that aren't found can be copied out one character at a time
		wordFound = FALSE;
		
		int wordLength;
		
		// Chinese characters are not 1 byte in length! They're 4 bytes in UTF-8. 
		for (wordLength = 18; wordLength >= 3; wordLength = wordLength - 1)
		{
			int lastCharacter = currentCharacter + wordLength;
		
			//while (lastCharacter > numberCharacters)
			//{
			//	printf("going past the end of the string");
			
			//	wordLength = wordLength - 1;
			//	lastCharacter = currentCharacter + wordLength;
			//} // end if we read beyond the end of the string
			
			if (lastCharacter > numberCharacters)
			{
				wordLength = numberCharacters - currentCharacter;
			} // end if we read beyond the end of the string
			
			
			//printf("wordLength %d\n", wordLength);
		
			// Reset the word array
			wordText = wordTextArray;
			// Copy that many characters to the word string
    	    strncpy(wordText,startPointer, wordLength);
	        wordText[wordLength] = '\0';
        
			//printf("wordSpace wordText %s\n", wordText);
        
			//printf("wordText %s\n", wordText);
			
			
			// Need to add return and tab
			sprintf( wordSearchText, "\n%s	", wordText);
			wordFound = contains(combinedDictionaryData, wordSearchText);
			
			//printf("wordFound %d\n", wordFound);
			
    	    // If it's in the dictionary, copy it to the output text with a space
	        if (wordFound == TRUE)
    	    {
				sprintf(newSpacedLine, "%s %s", spacedLine, wordText);
				sprintf(spacedLine, "%s", newSpacedLine);
			
				//printf("spacedLine %s\n", spacedLine);
				//printf("currentCharacter %d\n", currentCharacter);

				startPointer = startPointer + wordLength;
				
				//currentCharacter = currentCharacter + wordLength / 3;
				//currentCharacter = currentCharacter + 1;
				
				// Exit the loop
				wordLength = 0;
			} // end if it's not in the dictionary, keep checking substrings
			
		} // end for every word length
		
		// If the word is not found
		if (wordFound == FALSE)
		{
			int wordLength = 1;
    	    strncpy(wordText,startPointer, wordLength);
	        wordText[wordLength] = '\0';
			
			//printf("wordText %s\n", wordText);
			
			int wordId = (int)wordText[0];
			
			// Copy it to the output with a space if it's not Chinese, but without a space if it is Chinese
			if (wordId > 0)
			{
				sprintf(newSpacedLine, "%s %s", spacedLine, wordText);
				sprintf(spacedLine, "%s", newSpacedLine);
			} else {
				if (addExtraSpace == TRUE)
				{
					sprintf(newSpacedLine, "%s %s", spacedLine, wordText);
					sprintf(spacedLine, "%s", newSpacedLine);
					addExtraSpace = FALSE;
				} else {
					sprintf(newSpacedLine, "%s%s", spacedLine, wordText);
					sprintf(spacedLine, "%s", newSpacedLine);
				}
				
			}
			
			startPointer = startPointer + wordLength;
			//currentCharacter = currentCharacter + 1;

		} else {
			// If the word was found
			addExtraSpace = TRUE;

			//currentCharacter = currentCharacter + 1;

		} // end if the word is not found
		
		
		
	} // end for every character in the string
    
	//printf("wordSpace spacedLine %s\n", spacedLine);
    
	//printf("spacedLine %s\n", spacedLine);
    
    // Remove trailing marker
    if (numberCharacters > 0)
    {
		textBetween(spacedLine, "start", "§", newSpacedLine);
		sprintf(spacedLine, "%s", newSpacedLine);
	}
	
	
    // Remove leading space
	//textBetween(spacedLine, " ", "end", newSpacedLine);
	//sprintf(spacedLine, "%s", newSpacedLine);
	
    return startPointer;
} // end wordSpace method

/*
 * translateText: Translate Chinese words to Pinyin and English
 */
char* translateText(char* inputText, char* englishLine, char* outputHtml, char* outputText)
{
    char* startPointer = NULL;
    char* inputTextPointer = NULL;
    char* dictionaryLinePointer = NULL;
    
	// The word we search for
    //char* wordText;
    //char wordTextArray[STR_LEN];
	//wordText = wordTextArray;

	// The word search text, with the return and tab
    char* wordSearchText;
    char wordSearchTextArray[STR_LEN];
	wordSearchText = wordSearchTextArray;
	sprintf( wordSearchText, "");

	// The dictionary line for the word
    char* thisDictionaryLine;
    char thisDictionaryLineArray[STR_LEN];
	thisDictionaryLine = thisDictionaryLineArray;
	sprintf( thisDictionaryLine, "");

	// The pinyin for the word
    char* thisPinyin;
    char thisPinyinArray[STR_LEN];
	thisPinyin = thisPinyinArray;
	sprintf( thisPinyin, "");

	// The pinyin for the word with a space after
    char* thisPinyinWithSpace;
    char thisPinyinWithSpaceArray[STR_LEN];
	thisPinyinWithSpace = thisPinyinWithSpaceArray;
	sprintf( thisPinyinWithSpace, "");

	// The English for the word
    char* thisDefinition;
    char thisDefinitionArray[STR_LEN];
	thisDefinition = thisDefinitionArray;
	sprintf( thisDefinition, "");

	// The toneless pinyin for the word
    char* thisToneless;
    char thisTonelessArray[STR_LEN];
	thisToneless = thisTonelessArray;
	sprintf( thisToneless, "");

	// The tones for the word
    char* thisTone;
    char thisToneArray[STR_LEN];
	thisTone = thisToneArray;
	sprintf( thisTone, "");

	// ChineseText for each line
    char* chineseText;
    char chineseTextArray[STR_LEN];
	chineseText = chineseTextArray;
	sprintf( chineseText, "");

	// Temporary chineseText buffer
    char* newChineseText;
    char newChineseTextArray[STR_LEN];
	newChineseText = newChineseTextArray;
	sprintf( newChineseText, "");

	// ChineseHtml for each line
    char* chineseHtml;
    char chineseHtmlArray[HTML_LEN];
	chineseHtml = chineseHtmlArray;
	sprintf( chineseHtml, "");

	// chineseCharacterText
    char* chineseCharacterText;
    char chineseCharacterTextArray[STR_LEN];
	chineseCharacterText = chineseCharacterTextArray;
	sprintf( chineseCharacterText, "");
	
	// thisCharacterPinyin
    char* thisCharacterPinyin;
    char thisCharacterPinyinArray[STR_LEN];
	thisCharacterPinyin = thisCharacterPinyinArray;
	sprintf( thisCharacterPinyin, "");

	// chineseWordHtml
    char* chineseWordHtml;
    char chineseWordHtmlArray[STR_LEN];
	chineseWordHtml = chineseWordHtmlArray;
	sprintf( chineseWordHtml, "");

	// newChineseWordHtml buffer
    char* newChineseWordHtml;
    char newChineseWordHtmlArray[STR_LEN];
	newChineseWordHtml = newChineseWordHtmlArray;
	sprintf( newChineseWordHtml, "");

	// thisCharacterTone
    char* thisCharacterTone;
    char thisCharacterToneArray[STR_LEN];
	thisCharacterTone = thisCharacterToneArray;
	sprintf( thisCharacterTone, "");

	// chineseCharacterHtml with tone
    char* chineseCharacterHtml;
    char chineseCharacterHtmlArray[STR_LEN];
	chineseCharacterHtml = chineseCharacterHtmlArray;
	sprintf( chineseCharacterHtml, "");

	// Temporary chineseCharacterHtml buffer
    char* newChineseCharacterHtml;
    char newChineseCharacterHtmlArray[STR_LEN];
	newChineseCharacterHtml = newChineseCharacterHtmlArray;
	sprintf( newChineseCharacterHtml, "");

	// pinyinHtmlWord with tone
    char* pinyinHtmlWord;
    char pinyinHtmlWordArray[STR_LEN];
	pinyinHtmlWord = pinyinHtmlWordArray;
	sprintf( pinyinHtmlWord, "");

	// Temporary newPinyinHtmlWord buffer
    char* newPinyinHtmlWord;
    char newPinyinHtmlWordArray[STR_LEN];
	newPinyinHtmlWord = newPinyinHtmlWordArray;
	sprintf( newPinyinHtmlWord, "");


	// Temporary chineseHtml buffer
    char* newChineseHtml;
    char newChineseHtmlArray[HTML_LEN];
	newChineseHtml = newChineseHtmlArray;
	sprintf( newChineseHtml, "");

	// PinyinHtml for each line
    char* pinyinHtml;
    char pinyinHtmlArray[STR_LEN];
	pinyinHtml = pinyinHtmlArray;
	sprintf( pinyinHtml, "");

	// Temporary pinyinHtml buffer
    char* newPinyinHtml;
    char newPinyinHtmlArray[STR_LEN];
	newPinyinHtml = newPinyinHtmlArray;
	sprintf( newPinyinHtml, "");

	// PinyinText for each line
    char* pinyinText;
    char pinyinTextArray[STR_LEN];
	pinyinText = pinyinTextArray;
	sprintf( pinyinText, "");

	// Temporary pinyinText buffer
    char* newPinyinText;
    char newPinyinTextArray[STR_LEN];
	newPinyinText = newPinyinTextArray;
	sprintf( newPinyinText, "");

	// TranslatedHtml for each line
    char* translatedHtml;
    char translatedHtmlArray[STR_LEN];
	translatedHtml = translatedHtmlArray;
	sprintf( translatedHtml, "");

	// Temporary translatedHtml buffer
    char* newTranslatedHtml;
    char newTranslatedHtmlArray[STR_LEN];
	newTranslatedHtml = newTranslatedHtmlArray;
	sprintf( newTranslatedHtml, "");

	// TranslatedText for each line
    char* translatedText;
    char translatedTextArray[STR_LEN];
	translatedText = translatedTextArray;
	sprintf( translatedText, "");

	// Temporary translatedText buffer
    char* newTranslatedText;
    char newTranslatedTextArray[STR_LEN];
	newTranslatedText = newTranslatedTextArray;
	sprintf( newTranslatedText, "");

	// outputHtml of one line
    char* outputHtmlLine;
    char outputHtmlLineArray[STR_LEN];
	outputHtmlLine = outputHtmlLineArray;
	sprintf( outputHtmlLine, "");

	// outputText of one line
    char* outputTextLine;
    char outputTextLineArray[STR_LEN];
	outputTextLine = outputTextLineArray;
	sprintf( outputTextLine, "");
	
	
	char *wordText;
	wordText = strtok(inputText, " ,.\n");

	int tabLength = strlen("	");
	
	while(wordText != NULL)
	{
		//printf("wordText %s\n", wordText);
		
		thisTone = thisToneArray;
		sprintf( thisTone, "");

		// Need to add return and tab
		wordSearchText = wordSearchTextArray;
		sprintf( wordSearchText, "\n%s	", wordText);
		
		//printf("wordSearchText %s\n", wordSearchText);
		
    	// Search the dictionary for the word
    	thisDictionaryLine = thisDictionaryLineArray;
		sprintf( thisDictionaryLine, "");
    	dictionaryLinePointer = textBetween(combinedDictionaryData, wordSearchText, "\n", thisDictionaryLine);
    	
    	//printf("textBetween completed\n");
    	
    	if (dictionaryLinePointer != NULL)
    	{
	    	dictionaryLinePointer = textBetween(thisDictionaryLine, "start", "	", thisDefinition);
	    	dictionaryLinePointer = dictionaryLinePointer + strlen(thisDefinition) + tabLength;
    		//printf("thisDefinition %s\n", thisDefinition);
	    	dictionaryLinePointer = textBetween(dictionaryLinePointer, "start", "	", thisPinyin);
	    	dictionaryLinePointer = dictionaryLinePointer + strlen(thisPinyin) + tabLength;
    		//printf("thisPinyin %s\n", thisPinyin);
	    	dictionaryLinePointer = textBetween(dictionaryLinePointer, "start", "	", thisToneless);
	    	dictionaryLinePointer = dictionaryLinePointer + strlen(thisToneless) + tabLength;
    		//printf("thisToneless %s\n", thisToneless);
	    	dictionaryLinePointer = textBetween(dictionaryLinePointer, "start", "end", thisTone);
    		//printf("thisTone %s\n", thisTone);
    		
    		//printf("%s	%s	%s	%s	%s\n", wordText, thisPinyin, thisDefinition, thisToneless, thisTone);

    		// Append the Chinese
			sprintf( newChineseText, "%s %s", chineseText, wordText);
			sprintf( chineseText, "%s", newChineseText);
			
			// Clear the previous word
			chineseWordHtml = chineseWordHtmlArray;
			sprintf( chineseWordHtml, "");
			newChineseWordHtml = newChineseWordHtmlArray;
			sprintf( newChineseWordHtml, "");

			sprintf(thisPinyinWithSpace, "%s ", thisPinyin);
			
			char* thisPinyinPointer = thisPinyinWithSpace;
			
			pinyinHtmlWord = pinyinHtmlWordArray;
			sprintf(pinyinHtmlWord, "");
			
			//thisCharacterPinyin = strtok_s(thisPinyin, " ,.\n");

	    	//printf("chineseTextLength %lu\n", strlen(wordText));
	    	int currentTone = 0;
	    	
	    	int wordLength = strlen(wordText);
			
			int currentWordCharacter;
			
			for (currentWordCharacter = 0; currentWordCharacter < wordLength; currentWordCharacter = currentWordCharacter + 3)
			{
				// Chinese
				char* currentWordCharacterPointer = wordText + currentWordCharacter;
				
				sprintf( thisCharacterTone, "");
				sprintf( chineseCharacterHtml, "");
				
				sprintf( thisCharacterTone, "%c", thisTone[currentTone]);
				
				// Catch blank tones
				if ((strcmp(thisCharacterTone, "	") == 0) || (strcmp(thisCharacterTone, "") == 0))
				{
					sprintf( thisCharacterTone, "1");
				}

				
    			sprintf( chineseCharacterText, "%c%c%c", currentWordCharacterPointer[0], currentWordCharacterPointer[1], currentWordCharacterPointer[2]);
				
				sprintf( newChineseCharacterHtml, "<div class=\"chinese_%s\">%s</div>", thisCharacterTone, chineseCharacterText);
				sprintf( chineseCharacterHtml, "%s", newChineseCharacterHtml);
				
				// Append to Chinese word HTML
	    		sprintf( newChineseWordHtml, "%s%s", chineseWordHtml, chineseCharacterHtml);
				sprintf( chineseWordHtml, "%s", newChineseWordHtml);
				
		    	//printf("chineseWordHtml %s\n", chineseWordHtml);
				
				// Pinyin
				thisCharacterPinyin = thisCharacterPinyinArray;
				sprintf(thisCharacterPinyin, "");
				
				//printf("thisPinyinPointer %s\n", thisPinyinPointer);

				textBetween(thisPinyinPointer, "start", " ", thisCharacterPinyin);
				
				thisPinyinPointer = thisPinyinPointer + strlen(thisCharacterPinyin) + strlen(" ");
				
				//printf("thisCharacterPinyin %s\n", thisCharacterPinyin);
				
				sprintf( newPinyinHtmlWord, "%s<div class=\"pinyin_%s\">%s</div> ", pinyinHtmlWord, thisCharacterTone, thisCharacterPinyin);
				sprintf( pinyinHtmlWord, "%s", newPinyinHtmlWord);
				
		    	
				// Get the next character pinyin
				//thisCharacterPinyin = strtok(NULL, " ,.\n");		

				currentTone = currentTone + 1;
			} // end for every character in the Chinese word
			
			//printf("chineseWordHtml %s\n", chineseWordHtml);
			
    		sprintf( newChineseHtml, "%s</td><td>%s", chineseHtml, chineseWordHtml);
			sprintf( chineseHtml, "%s", newChineseHtml);
    		
    		// Append the Pinyin
			sprintf( newPinyinText, "%s %s", pinyinText, thisPinyin);
			sprintf( pinyinText, "%s", newPinyinText);

			sprintf( newPinyinHtml, "%s</td><td>%s", pinyinHtml, pinyinHtmlWord);
			//sprintf( newPinyinHtml, "%s</td><td>%s", pinyinHtml, wordText);
			sprintf( pinyinHtml, "%s", newPinyinHtml);

    		// Append the English
			sprintf( newTranslatedText, "%s %s", translatedText, thisDefinition);
			sprintf( translatedText, "%s", newTranslatedText);

			sprintf( newTranslatedHtml, "%s</td><td>%s", translatedHtml, thisDefinition);
			sprintf( translatedHtml, "%s", newTranslatedHtml);
    		
    	} else {
    		//printf("word not found");

			// Append punctuation without spaces

    		// Append the Chinese
			sprintf( newChineseText, "%s %s", chineseText, wordText);
			sprintf( chineseText, "%s", newChineseText);

    		sprintf( newChineseHtml, "%s</td><td>%s", chineseHtml, wordText);
			sprintf( chineseHtml, "%s", newChineseHtml);
    		
    		// Append the Pinyin
			sprintf( newPinyinText, "%s%s", pinyinText, wordText);
			sprintf( pinyinText, "%s", newPinyinText);

			sprintf( newPinyinHtml, "%s</td><td>%s", pinyinHtml, wordText);
			sprintf( pinyinHtml, "%s", newPinyinHtml);

    		// Append the English
			sprintf( newTranslatedText, "%s%s", translatedText, wordText);
			sprintf( translatedText, "%s", newTranslatedText);

			sprintf( newTranslatedHtml, "%s</td><td>%s", translatedHtml, wordText);
			sprintf( translatedHtml, "%s", newTranslatedHtml);
    		
    	} // end if the word is found
		
		// Get the next word
		wordText = strtok(NULL, " ,.\n");		
				
	} // end for every word in the inputText
    

	
	// Add leading and trailing td to Chinese, Pinyin, Literal
	sprintf( newChineseHtml, "<td>%s</td>", chineseHtml);
	sprintf( chineseHtml, "%s", newChineseHtml);
	sprintf( newPinyinHtml, "<td>%s</td>", pinyinHtml);
	sprintf( pinyinHtml, "%s", newPinyinHtml);
	sprintf( newTranslatedHtml, "<td>%s</td>", translatedHtml);
	sprintf( translatedHtml, "%s", newTranslatedHtml);
	
	sprintf( outputHtml, "<table>\n<tr>%s</tr>\n<tr>%s</tr>\n<tr>%s</tr>\n</table>", chineseHtml, pinyinHtml, translatedHtml);
    
    sprintf( outputText, "%s\n%s\n%s\n", chineseText, pinyinText, translatedText);
    
    return 0;
    
} // end translateText method

int writeToFile(char* filename, char* thisString)
{
	FILE *file; 
	file = fopen(filename,"w");
	fprintf(file,"%s\n", thisString); 
	fclose(file);
	
	return 0;
} // end writeToFile method

void loadDictionary()
{
	FILE *dictionaryFile = fopen("PinyinDefinitionsTonesSorted.txt", "r");
	if (dictionaryFile != NULL) 
	{
		// Go to the end of the file.
		if (fseek(dictionaryFile, 0L, SEEK_END) == 0) {
			
			// Get the size of the file. 
			long dictionaryLength = ftell(dictionaryFile);
			
			// If the dictionary is blank, print an error
			if (dictionaryLength == -1) 
			{
				// Error
		        printf("Error, dictionary is blank\n");
			} // end if the dictionary is blank

			// Allocate a memory buffer to the size of the dictionary.
			combinedDictionaryData = malloc(sizeof(char) * (dictionaryLength + 1));

			// Go back to the start of the file.
			if (fseek(dictionaryFile, 0L, SEEK_SET) != 0) 
			{
				// Error
		        printf("Error going back to the start of the dictionary file\n");
			} // end seeking in the dictionary

			// Read the entire file into memory.
			size_t readLength = fread(combinedDictionaryData, sizeof(char), dictionaryLength, dictionaryFile);
			
			// If there's an error reading the file
			if ( ferror( dictionaryFile ) != 0 ) {
				fputs("Error reading file\n", stderr);
			} else {
				// Add a null terminator to the string
				combinedDictionaryData[readLength++] = '\0';
			} // end if there isn't an error reading the file
		}
		fclose(dictionaryFile);
	} // end if the dictionary file exists

} // end function loadDictionary

void *translateLineThread(void *threadarg) 
{
	//int taskId;
	//sleep(1);
	//taskId = *((int *) taskIdPtr);
	//printf("Input Line %d: %s\n", taskId, inputFileLines[taskId]);
	
	tdata_t* my_data;
	my_data = (tdata_t*) threadarg;
	int taskid = my_data->thread_id;
	char* thisChineseLine = my_data->thisChineseLine;
	char* threadDictionaryData = my_data->threadDictionaryData;
	
	
	
	//char thisChineseLineArray[STR_LEN];	
    //char* thisChineseLine;
    //thisChineseLine = thisChineseLineArray;

	// Copy the buffer to inputLine for using it. 
	//textBetween(stdinBuffer, "start", "\n", inputLine);
	//thisChineseLine = thisChineseLineArray;
	//sprintf(thisChineseLine, "%s", inputFileLines[taskId]);
	
	// Print the input to stdout
	printf("threadLine %s\n", thisChineseLine);


	// Print the input to stdout
	//int dictionaryLength = strlen(combinedDictionaryData);
	//printf("combinedDictionaryDataLength %d\n", dictionaryLength);
	
	
	// The dictionary in this thread
	//char *threadDictionaryData = NULL;
	//threadDictionaryData = (char *)malloc(dictionaryLength);
	
	//sprintf(threadDictionaryData, "%s", combinedDictionaryData);
	
	//threadDictionaryData = strdup(combinedDictionaryData);
	
	printf("threadDictionaryData Length %lu\n", strlen(threadDictionaryData));
	
    char* startPointer = NULL;
	
	// The word we search for
    char* wordText;
    char wordTextArray[STR_LEN];
	wordText = wordTextArray;

	// Temporary buffer for the word we search for
    char* newWordText;
    char newWordTextArray[STR_LEN];
	newWordText = newWordTextArray;


	// The word search text, with the return and tab
    char* wordSearchText;
    char wordSearchTextArray[STR_LEN];
	wordSearchText = wordSearchTextArray;

    char* spacedLine;
    char spacedLineArray[STR_LEN];
	spacedLine = spacedLineArray;

	// The spaced line while we append to it
    char* newSpacedLine;
    char newSpacedLineArray[STR_LEN];
	newSpacedLine = newSpacedLineArray;
	
	// Don't read past the end of the line
	int numberCharacters = strlen(thisChineseLine);
	
	//printf("numberCharacters %d\n", numberCharacters);
	
	int currentCharacter = 0;
	
	int wordFound = FALSE;
	int addExtraSpace = TRUE;
	
	// To Do: write containsChineseString, isChinese
	
    char* inputLine;
    char inputLineArray[STR_LEN];
	inputLine = inputLineArray;
	
	// Don't space blank inputs
	if (strcmp(thisChineseLine,"") == 0)
	{
		return 0;
	}

	sprintf(inputLine, "%s§", thisChineseLine);
	

	printf("threadWordSpace inputLine %s\n", inputLine);

	
	startPointer = inputLine;
	
	int currentOutputCharacter = 0;
	
	for (currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
	{
		// Words that aren't found can be copied out one character at a time
		wordFound = FALSE;
		
		int wordLength;
		
		// Chinese characters are not 1 byte in length! They're 4 bytes in UTF-8. 
		for (wordLength = 18; wordLength >= 3; wordLength = wordLength - 1)
		{
			int lastCharacter = currentCharacter + wordLength;
		
			//while (lastCharacter > numberCharacters)
			//{
			//	printf("going past the end of the string");
			
			//	wordLength = wordLength - 1;
			//	lastCharacter = currentCharacter + wordLength;
			//} // end if we read beyond the end of the string
			
			if (lastCharacter > numberCharacters)
			{
				wordLength = numberCharacters - currentCharacter;
			} // end if we read beyond the end of the string
			
			
			//printf("wordLength %d\n", wordLength);
		
			// Reset the word array
			wordText = wordTextArray;
			// Copy that many characters to the word string
			strncpy(newWordText,startPointer, wordLength);
	        newWordText[wordLength] = '\0';
	        
	        sprintf(wordText, "%s", newWordText);
        
			printf("wordSpace wordText %s\n", wordText);
        
			//printf("wordText %s\n", wordText);
			
			
			// Need to add return and tab
			sprintf( wordSearchText, "\n%s	", wordText);
			//printf("wordSearchText %s\n", wordSearchText);
			
			// Removing all function calls
			//wordFound = contains(combinedDictionaryData, wordSearchText);
			
			if (strstr(threadDictionaryData, wordSearchText) != NULL)
			{
				wordFound = 1;
			} else {
				wordFound = 0;
			}
			
			
			//printf("wordFound %d\n", wordFound);
			
    	    // If it's in the dictionary, copy it to the output text with a space
	        if (wordFound == TRUE)
    	    {
				sprintf(newSpacedLine, "%s %s", spacedLine, wordText);
				sprintf(spacedLine, "%s", newSpacedLine);
			
				//printf("spacedLine %s\n", spacedLine);
				//printf("currentCharacter %d\n", currentCharacter);

				startPointer = startPointer + wordLength;
				
				//currentCharacter = currentCharacter + wordLength / 3;
				//currentCharacter = currentCharacter + 1;
				
				// Exit the loop
				wordLength = 0;
			} else {
				printf("word not found\n");
			} // end if it's not in the dictionary, keep checking substrings
			
		} // end for every word length
		
		// If the word is not found
		if (wordFound == FALSE)
		{
			int wordLength = 1;
    	    strncpy(wordText,startPointer, wordLength);
	        wordText[wordLength] = '\0';
			
			//printf("wordText %s\n", wordText);
			
			int wordId = (int)wordText[0];
			
			// Copy it to the output with a space if it's not Chinese, but without a space if it is Chinese
			if (wordId > 0)
			{
				sprintf(newSpacedLine, "%s %s", spacedLine, wordText);
				sprintf(spacedLine, "%s", newSpacedLine);
			} else {
				if (addExtraSpace == TRUE)
				{
					sprintf(newSpacedLine, "%s %s", spacedLine, wordText);
					sprintf(spacedLine, "%s", newSpacedLine);
					addExtraSpace = FALSE;
				} else {
					sprintf(newSpacedLine, "%s%s", spacedLine, wordText);
					sprintf(spacedLine, "%s", newSpacedLine);
				}
				
			}
			
			startPointer = startPointer + wordLength;
			//currentCharacter = currentCharacter + 1;

		} else {
			// If the word was found
			addExtraSpace = TRUE;

			//currentCharacter = currentCharacter + 1;

		} // end if the word is not found
		
		
		
	} // end for every character in the string
    
	printf("wordSpace spacedLine %s\n", spacedLine);
    
	//printf("spacedLine %s\n", spacedLine);
    
    // Remove trailing marker
    if (numberCharacters > 0)
    {
		textBetween(spacedLine, "start", "§", newSpacedLine);
		sprintf(spacedLine, "%s", newSpacedLine);
	}



	// Print the spaced line to stdout
	printf("spacedLine %s\n", spacedLine);
	
	
	// Save the HTML line to the array
	//outputHtmlLines[taskId] = outputHtmlLine;
	//outputHtmlLines[taskId] = outputText;
	
	//free(taskIdPtr);
	pthread_exit(NULL);
} // end function translateLineThread

/*
void *PrintHello(void *threadarg) 
{
	int taskid, sum;
	char *hello_msg;
	tdata_t* my_data;
	my_data = (tdata_t*) threadarg;
	taskid = my_data->thread_id;
	sum = my_data->sum;
	hello_msg = my_data->message;
	char* threadDictionaryData = my_data->threadDictionaryData;
	
	printf("Thread %d: %s  Sum=%d\n", taskid, hello_msg, sum);
	
	printf("threadDictionaryData Length %lu\n", strlen(threadDictionaryData));
	
	free(threadarg);
	pthread_exit(NULL);
}
*/

/*
 * main: Load Chinese from stdin, output Pinyin to stdout
 * @params: int argc: Number of arguments
 *			char* argv[]: String arguments
 * @return int: Error code (1 if failed, 0 if no errors)
 */
int main(int argc, char** argv) 
{
	// Input line string pointer
    //char *inputLine = NULL;
    
    // The length of a line
	//size_t inputLineLength;
	
	char stdinBufferArray[STR_LEN];	
    char* stdinBuffer;
    stdinBuffer = stdinBufferArray;

	char inputLineArray[STR_LEN];	
    char* inputLine;
    inputLine = inputLineArray;
	
    char* startPointer = NULL;
	
	// Chinese input string
	char* chineseString;
	char chineseStringArray[STR_LEN];
	chineseString = chineseStringArray;
    
    char* startText;
    char startTextArray[STR_LEN];
	startText = startTextArray;

    char* endText;
    char endTextArray[STR_LEN];
	endText = endTextArray;

    char* foundText;
    char foundTextArray[STR_LEN];
	foundText = foundTextArray;

    char* spacedLine;
    char spacedLineArray[STR_LEN];
	spacedLine = spacedLineArray;

    char* englishLine;
    char englishLineArray[STR_LEN];
	englishLine = englishLineArray;

    char* outputHtml;
    char outputHtmlArray[HTML_LEN];
	outputHtml = outputHtmlArray;

    char* newOutputHtml;
    char newOutputHtmlArray[HTML_LEN];
	newOutputHtml = newOutputHtmlArray;

    char* outputHtmlLine;
    char outputHtmlLineArray[HTML_LEN];
	outputHtmlLine = outputHtmlLineArray;

    char* outputText;
    char outputTextArray[STR_LEN];
	outputText = outputTextArray;

    char* inputFilePath;
    char inputFilePathArray[STR_LEN];
	inputFilePath = inputFilePathArray;

    char* inputFileLine;
    char inputFileLineArray[STR_LEN];
	inputFileLine = inputFileLineArray;

    char* newInputFileLine;
    char newInputFileLineArray[STR_LEN];
	newInputFileLine = newInputFileLineArray;

    char* inputFileText;
    char inputFileTextArray[HTML_LEN];
	inputFileText = inputFileTextArray;

    char* inputFileFixedLineEndingsText;
    char inputFileFixedLineEndingsTextArray[HTML_LEN];
	inputFileFixedLineEndingsText = inputFileFixedLineEndingsTextArray;

    int outputToHtml = 0;
	
	/* Read the dictionary */
	loadDictionary();
	
	//printf("combinedDictionaryData length:%lu\n", strlen(combinedDictionaryData));

	// Don't forget to call free() later to release memory - keep this line at the end of main()
	// free(combinedDictionaryData);
	
	
	// Read lines from stdin
    //if (getline(&inputLine, &inputLineLength, stdin) == -1) 
    //{
    	// If there's no line input, output a "No line" string
        //printf("No line\n");
    //} else {
    	// Print the input to stdout
        //printf("inputLine %s\n", inputLine);
    //} // end if input line is not blank
    
    // Append headers to HTML
	sprintf( newOutputHtml, "<!DOCTYPE html>\n<html>\n  <head>\n	<meta charset=\"utf-8\" />\n        <style>\n\n@font-face {\n    font-family: \"Charcoal CY\";\n    src: url(\"fonts/Charcoal.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"Virtue\";\n    src: url(\"fonts/virtue.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"SimSun\";\n    src: url(\"fonts/SimSun.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"Jhenghei\";\n    src: url(\"fonts/MicrosoftJhengHeiRegular.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"PingfangLocal\";\n    src: local(\"PingFang-TC-Regular\");\n}\n\n@font-face {\n    font-family: \"Pingfang\";\n    src: url(\"fonts/PingFang1.ttf\") format(\"truetype\");\n}\n\n      body {\n        font-family: Tahoma, Geneva, sans-serif;\n      }\n      \n      table td {\n      white-space: nowrap;\n      }\n		\n	a:hover, a:visited, a:link, a:active\n	{\n		color:#000000;\n	    text-decoration: none;\n	}\n		\n      .chinese_1 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#000000;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .chinese_2 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_3 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_4 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_5 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_6 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_7 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n      \n      .chinese_8 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n\n      .pinyin_1 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .pinyin_2 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\ndisplay:inline;\n      }\n\n      .pinyin_3 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\ndisplay:inline;\n      }\n\n      .pinyin_4 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\ndisplay:inline;\n      }\n\n      .pinyin_5 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .taiwanese_1 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#787878;\n		display:inline;\n      }\n\n      .taiwanese_2 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\ndisplay:inline;\n      }\n\n      .taiwanese_3 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#0000FF;\ndisplay:inline;\n      }\n\n      .taiwanese_4 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#505050;\ndisplay:inline;\n      }\n\n      .taiwanese_5 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#F82423;\ndisplay:inline;\n      }\n\n      .taiwanese_7 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n      \n      .taiwanese_8 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#929292;\ndisplay:inline;\n      }\n\n      .cantonese_1 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#929292;\n		display:inline;\n      }\n\n      .cantonese_2 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#FF8080;\ndisplay:inline;\n      }\n\n      .cantonese_3 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#787878;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .cantonese_4 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#0000FF;\ndisplay:inline;\n      }\n\n      .cantonese_5 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#F82423;\ndisplay:inline;\n      }\n\n      .cantonese_6 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .hangul {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#000000;\n		font-size: 26px;\n		display:inline;\n      }\n\n      .tang {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .japanese {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .vietnamese {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .englishInChinese {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .literal {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .english {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n\n		.DefaultButtonOuter\n		{\n			border: 2px solid black ;\n			border-radius: 8px;\n			width: 96px;\n			height: 26px;\n			text-align: center;\n			\n			/*background-color: #99999a;*/\n			background: #99999a; /* For browsers that do not support gradients */\n			/*background: -webkit-linear-gradient(left top, red, yellow);*/ /* For Safari 5.1 to 6.0 */\n			/*background: -o-linear-gradient(bottom right, red, yellow);*/ /* For Opera 11.1 to 12.0 */\n			/*background: -moz-linear-gradient(bottom right, red, yellow); */ /* For Firefox 3.6 to 15 */\n			background: linear-gradient(to bottom right, #dcdbde, #737374); /* Standard syntax */\n		}\n\n		.ButtonInner\n		{\n			border: 1px solid black ;\n			border-radius: 5px;\n			background-color: #dcdbde;\n			width: 88px;\n			height: 18px;\n			text-align: center;\n			margin: 3px;\n			\n		    line-height: 18px;\n	        font-family: \"Charcoal CY\", \"Virtue\", Geneva, sans-serif;\n			font-size: 11px;\n			color: #000000;\n		}\n		\n		.ButtonInner:active\n		{\n		    background:#666666;\n		    color: #ffffff;\n		}\n\n		.key\n		{\n			border: 1px solid black ;\n			border-radius: 5px;\n			background-color: #dcdbde;\n			width: 18px;\n			height: 18px;\n			text-align: center;\n			margin: 3px;\n			\n		    line-height: 18px;\n	        font-family: Geneva, sans-serif;\n			font-size: 11px;\n			color: #000000;\n		}\n\n\n			#matrix {\n				background: black;\n				float: center;\n			}\n\n			#matrix td {\n			    padding: 7px;\n    			margin: 0px;\n    			float: center;\n				background: black;\n				font: 54px arial;\n				\n				height: 80px;\n			}\n\n			#matrix tr {\n				height: 80px;\n			}\n\n\n			#matrix p {\n			    opacity: 0;\n			    margin-top: -25px;\n			    text-align: center;\n\n				height: 80px;\n\n			    -webkit-transition: margin-top 2s ease-in;\n			    -moz-transition: margin-top 2s ease-in;\n			    -o-transition: margin-top 2s ease-in;\n			    -ms-transition: margin-top 2s ease-in;\n			    transition: margin-top 2s ease-in;\n			}\n			\n			#matrix p.load {\n			    opacity: 1;\n			    margin-top: 25px;\n			}\n\n     .dialogWithDropShadow\n     {\n         -webkit-box-shadow: 1px 1px 0px rgba(0, 0, 0, 1);\n         -moz-box-shadow: 1px 1px 0px rgba(0, 0, 0, 1); \n     }\n\n@font-face {\n    font-family: \"SmallSealScript\";\n    src: url(\"fonts/FangzhengXiaozhuantiFont-TraditionalChinese.ttf\") format(\"truetype\");\n}\n\n      .smallSealScript_1 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:black;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .smallSealScript_2 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .smallSealScript_3 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .smallSealScript_4 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n@font-face {\n    font-family: \"LargeSealScript\";\n    src: url(\"fonts/JDFZHUANF.ttf\") format(\"truetype\");\n}\n\n      .largeSealScript_1 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:black;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .largeSealScript_2 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .largeSealScript_3 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .largeSealScript_4 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n\n@font-face {\n    font-family: \"OracleBones\";\n    src: url(\"fonts/bnujgw.ttf\") format(\"truetype\");\n}\n\n      .oracleBones_1 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:black;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .oracleBones_2 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .oracleBones_3 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .oracleBones_4 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n\n    </style>\n\n  </head>\n  <body>");
	sprintf( outputHtml, "%s", newOutputHtml);
    
    int currentArgument;
    
	// Go through all the arguments
    for (currentArgument = 1; currentArgument < argc; currentArgument++)
	{
		// If the user specifies an input file
		if (contains(argv[currentArgument], "-i") != 0)
		{
	    	sprintf(inputFilePath, "%s", argv[currentArgument + 1]);
		} // end if the user specifies an input file

		// If the user wants HTML
		if (contains(argv[currentArgument], "--html") != 0)
		{
	    	outputToHtml = 1;
		} // end if the user specifies an input file
		
	} // end for every argument
	
	// If the user specified an input file, try to use threads
	if (strcmp(inputFilePath, "") != FALSE)
	{
		//printf("inputFilePath %s\n", inputFilePath);

		// Open the file
		FILE *inputFilePointer = fopen(inputFilePath, "r");
		if (inputFilePointer == NULL)
		{
			fprintf(stderr,"Error opening file.\n");
			exit(2);
		}
		
		// Read a file with CR line endings - don't touch this section.
		char thisCharacter;
		int currentCharacter = 0;
		
		while ((thisCharacter = fgetc(inputFilePointer)) != EOF)
		{
			if ((thisCharacter == '\r') || (thisCharacter == '\n'))
			{
				inputFileText[currentCharacter] = '\n';
				
			} else {
				inputFileText[currentCharacter] = thisCharacter;
			}
						
			currentCharacter = currentCharacter + 1;
		}

		fclose(inputFilePointer);

		//printf("inputFileText %s", inputFileText);
		
		// Read the string again to replace line endings
		int numberCharacters = strlen(inputFileText);
		int currentLine = 0;
		int currentLineCharacter = 0;
		int numberLines = 0;
		
		inputFileLines = (char **)malloc(sizeof(char*)*INPUT_LINES);
		outputHtmlLines = (char **)malloc(sizeof(char*)*INPUT_LINES);
		
		int currentInputCharacter;
		
		for (currentInputCharacter = 0; currentInputCharacter < numberCharacters; currentInputCharacter = currentInputCharacter + 1)
		{
			char thisInputCharacter = inputFileText[currentInputCharacter];
			
			if ((thisInputCharacter == '\r') || (thisInputCharacter == '\n'))
			{
				inputFileFixedLineEndingsText[currentInputCharacter] = '\n';

				//printf("%s\n", inputFileLine);
				
				// Copy to the string array
				inputFileLine[currentLineCharacter] = '\n';
				inputFileLine[currentLineCharacter + 1] = '\0';

				int lineLength = strlen(inputFileLine);
				inputFileLines[currentLine] = malloc(lineLength);
				
				outputHtmlLines[currentLine] = malloc(HTML_LEN);
				
				textBetween(inputFileLine, "start", "\n", inputFileLines[currentLine]);
				
				//sprintf(inputFileLines[currentLine] , "%s", inputFileLine);

				currentLineCharacter = 0;
				
				inputFileLine = inputFileLineArray;
				sprintf(inputFileLine, "");
				
				numberLines = numberLines + 1;
				
				currentLine = currentLine + 1;
			} else {
				inputFileFixedLineEndingsText[currentInputCharacter] = thisInputCharacter;
				
				inputFileLine[currentLineCharacter] = thisInputCharacter;
				
				currentLineCharacter = currentLineCharacter + 1;
			}
			
		} // end for every character in the input file

		numberLines = numberLines + 1;

		//printf("%s", inputFileFixedLineEndingsText);
		
		// Iterative line by line parsing - this is just as slow as Javascript
		
		/*
		// For every line in the input file
		for (currentLine = 0; currentLine < numberLines; currentLine = currentLine + 1)
		{
			// Read the line from the array
			//	printf("%s\n", inputFileLines[currentLine]);
		
		
			// Copy the buffer to inputLine for using it. 
			//textBetween(stdinBuffer, "start", "\n", inputLine);
			inputLine = inputLineArray;
			sprintf(inputLine, "%s", inputFileLines[currentLine]);
				
			// Print the input to stdout
			//printf("inputLine %s\n", inputLine);
		
			spacedLine = spacedLineArray;
			sprintf( spacedLine, "");
		
			wordSpace(combinedDictionaryData, inputLine, spacedLine);
		
			// Print the spaced line to stdout
			//printf("spacedLine %s\n", spacedLine);
		
			outputText = outputTextArray;
			sprintf( outputText, "");
		
			translateText(spacedLine, englishLine, outputHtmlLine, outputText);
		
			// Append the HTML line
			sprintf( newOutputHtml, "%s\n%s", outputHtml, outputHtmlLine);
			sprintf( outputHtml, "%s", newOutputHtml);
		
			// Print the text to stdout, unless the user wanted HTML
			if (outputToHtml == 0)
			{
				printf("outputText\n%s\n", outputText);
			}
		
		} // end for every line
    	//return 0;
    	*/
    	
    	
    	// My failed attempt to use threading
    	
    	
		pthread_t threads[NUM_TASKS];
		
		int *taskIdPtr;
		int threadReturn;
		int thisThread;
		
		for(thisThread=0; thisThread < numberLines; thisThread++) 
		{
			//printf("Creating thread %d\n", thisThread);
			
			if (threadReturn) 
			{
				printf("ERR; pthread_create() ret = %d\n", threadReturn);
				exit(-1); 
			}

			//taskIdPtr = (int *) malloc(sizeof(int));
			//*taskIdPtr = thisThread;
			//threadReturn = pthread_create(&threads[thisThread], NULL, translateLineThread, (void *) taskIdPtr);
			
			int combinedDictionaryDataLength = strlen(combinedDictionaryData);
			char* threadDictionaryData = (char *)malloc(combinedDictionaryDataLength);
			sprintf(threadDictionaryData, "%s", combinedDictionaryData);
			
			int lineLength = strlen(inputFileLines[thisThread]);
			char* thisChineseLine = (char *)malloc(lineLength);
			sprintf(thisChineseLine, "%s", inputFileLines[thisThread]);
			
			
			tdata_t* tdata = (tdata_t *) malloc(sizeof(tdata_t));
			tdata->thread_id = thisThread;
			tdata->thisChineseLine = thisChineseLine;
			tdata->threadDictionaryData = threadDictionaryData;
			
			
			threadReturn = pthread_create(&threads[thisThread], NULL, translateLineThread, (void *) tdata);
			
		} // end for every thread
    	
		// For every line in the output HTML
		for (currentLine = 0; currentLine < numberLines; currentLine = currentLine + 1)
		{
			// Read the line from the array
			printf("%s\n", outputHtmlLines[currentLine]);
		} // end for every line
    	//return 0;
    	
    	// Free memory at the end
		for (currentLine = 0;currentLine<numberLines;currentLine = currentLine + 1)
		{
			free(inputFileLines[currentLine]);
			//free(outputHtmlLines[currentLine]);
		}

		free(inputFileLines);
		//free(outputHtmlLines);
    	
    	/*
		pthread_t threads[NUM_THREADS];
		int rc, t, sum;
		sum=0;
		messages[0] = "English: Hello World!";
		messages[1] = "French: Bonjour, le monde!";
		messages[2] = "Spanish: Hola al mundo";
		messages[3] = "Klingon: Nuq neH!";
		messages[4] = "German: Guten Tag, Welt!";
		messages[5] = "Russian: Zdravstvytye, mir!";
		messages[6] = "Japan: Sekai e konnichiwa!";
		messages[7] = "Latin: Orbis, te saluto!";
    
        for(t=0;t<NUM_THREADS;t++) 
        {
			tdata_t* tdata = (tdata_t *) malloc(sizeof(tdata_t));
			sum = sum + t;
			tdata->thread_id = t;
			tdata->sum = sum;
			tdata->message = messages[t];
			tdata->threadDictionaryData = combinedDictionaryData;
			printf("Creating thread %d\n", t);
			rc = pthread_create(&threads[t], NULL, PrintHello, (void *) tdata);
			if (rc) 
			{
				printf("ERR; pthread_create() ret = %d\n", rc);
				exit(-1);
			}
		}
		*/
    	
	} else {
    	// Read a line from stdin.
		while (fgets(stdinBuffer, STR_LEN, stdin) != NULL)
		{
			// Terminate the buffer at the newline
			size_t inputLength = strlen(stdinBuffer);
			if (inputLength && (stdinBuffer[inputLength-1] == '\n')) 
			{
				stdinBuffer[inputLength-1] = '\0';
			}
		
			// Copy the buffer to inputLine for using it. 
			//textBetween(stdinBuffer, "start", "\n", inputLine);
			inputLine = inputLineArray;
			sprintf(inputLine, "%s", stdinBuffer);
				
			// Print the input to stdout
			//printf("inputLine %s\n", inputLine);
		
			spacedLine = spacedLineArray;
			sprintf( spacedLine, "");
		
			wordSpace(combinedDictionaryData, inputLine, spacedLine);
		
			// Print the spaced line to stdout
			//printf("spacedLine %s\n", spacedLine);
		
			outputText = outputTextArray;
			sprintf( outputText, "");
		
			translateText(spacedLine, englishLine, outputHtmlLine, outputText);
		
			// Append the HTML line
			sprintf( newOutputHtml, "%s\n%s", outputHtml, outputHtmlLine);
			sprintf( outputHtml, "%s", newOutputHtml);
		
			// Print the text to stdout, unless the user wanted HTML
			if (outputToHtml == 0)
			{
				printf("outputText\n%s\n", outputText);
			}
		} // end while lines come from stdin
		
	} // end if the user specified an input file
	
	
    // Append footers to HTML
	sprintf( newOutputHtml, "%s\n  </body>\n</html>", outputHtml);
	sprintf( outputHtml, "%s", newOutputHtml);

	if (outputToHtml == 1)
	{
		printf("%s", outputHtml);
	}


    // Write the HTML to a file
    //writeToFile("filename.html", outputHtml);
	
	// Don't forget to call free() later to release memory
	free(combinedDictionaryData);
	
	// Return no errors
	return 0;
	
} // end main method






























