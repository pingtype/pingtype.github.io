/*
Pingtype Node Server
2017-12-27 to 2017-12-28

Bash script
curl -d "text=1%20不久以後,使徒和猶太地區的其他信徒都聽說外族人也接受了上帝的道%E3%80%82\n2%20但彼得回到耶路撒冷後,猶太信徒卻指責他說&wordList=tocfl" "http://localhost:5373" > acts11v1.html

curl -d "chineseFile=Data/CNLT/44.%20徒%20Acts%20使徒行傳/徒%20Acts%20使徒行傳%2011.txt&englishFile=Data/NLT/44.%20Acts/Acts%2011.txt&wordList=tocfl" "http://localhost:5373" > acts11.html

wkhtmltopdf acts11.html acts11.pdf
wkhtmltoimage acts11.html acts11.jpg

curl -d "bilingualFile=Data/KHOP/Mighty%20To%20Save%20-%20大能拯救.txt&wordList=tocfl" "http://localhost:5373" > "../Data/Cache/KHOP/Mighty%20To%20Save%20-%20大能拯救.html"


Run using Terminal
cd /Users/peter/Sites/pingtype/node
node server.js 
Listening on port 5373

Translate
http://localhost/pingtype/node/client.html?text=1%20不久以後,使徒和猶太地區的其他信徒都聽說外族人也接受了上帝的道%E3%80%82\n2%20但彼得回到耶路撒冷後,猶太信徒卻指責他說:

Reload dictionary
http://localhost/pingtype/node/client.html?command=reloadDictionary

Quit
http://localhost/pingtype/node/client.html?command=quit


To run in background
login as root
cd /Users/peter/Sites/pingtype/node
cp io.github.pingtype.plist /Library/LaunchDaemons/
reboot

To stop running in background
login as root
rm /Library/LaunchDaemons/io.github.pingtype.plist 
reboot


*/

/* Node server functions */

var htmlHeaders = "<!DOCTYPE html>\n<html>\n  <head>\n	<meta charset=\"utf-8\" />\n        <style>\n\n@font-face {\n    font-family: \"Charcoal CY\";\n    src: url(\"http://localhost/pingtype/fonts/Charcoal.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"Virtue\";\n    src: url(\"http://localhost/pingtype/fonts/virtue.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"SimSun\";\n    src: url(\"http://localhost/pingtype/fonts/SimSun.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"Jhenghei\";\n    src: url(\"http://localhost/pingtype/fonts/MicrosoftJhengHeiRegular.ttf\") format(\"truetype\");\n}\n\n@font-face {\n    font-family: \"PingfangLocal\";\n    src: local(\"PingFang-TC-Regular\");\n}\n\n@font-face {\n    font-family: \"Pingfang\";\n    src: url(\"http://localhost/pingtype/fonts/PingFang1.ttf\") format(\"truetype\");\n}\n\n      body {\n        font-family: Tahoma, Geneva, sans-serif;\n      }\n      \n      table td {\n      white-space: nowrap;\n      }\n		\n	a:hover, a:visited, a:link, a:active\n	{\n		color:#000000;\n	    text-decoration: none;\n	}\n		\n      .chinese_1 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#000000;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .chinese_2 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_3 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_4 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_5 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_6 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .chinese_7 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n      \n      .chinese_8 {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n\n      .pinyin_1 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .pinyin_2 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\ndisplay:inline;\n      }\n\n      .pinyin_3 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\ndisplay:inline;\n      }\n\n      .pinyin_4 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\ndisplay:inline;\n      }\n\n      .pinyin_5 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .taiwanese_1 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#787878;\n		display:inline;\n      }\n\n      .taiwanese_2 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\ndisplay:inline;\n      }\n\n      .taiwanese_3 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#0000FF;\ndisplay:inline;\n      }\n\n      .taiwanese_4 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#505050;\ndisplay:inline;\n      }\n\n      .taiwanese_5 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#F82423;\ndisplay:inline;\n      }\n\n      .taiwanese_7 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n      \n      .taiwanese_8 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#929292;\ndisplay:inline;\n      }\n\n      .cantonese_1 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#929292;\n		display:inline;\n      }\n\n      .cantonese_2 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#FF8080;\ndisplay:inline;\n      }\n\n      .cantonese_3 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#787878;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .cantonese_4 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#0000FF;\ndisplay:inline;\n      }\n\n      .cantonese_5 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#F82423;\ndisplay:inline;\n      }\n\n      .cantonese_6 {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .hangul {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:#000000;\n		font-size: 26px;\n		display:inline;\n      }\n\n      .tang {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .japanese {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .vietnamese {\n        font-family: \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .englishInChinese {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .literal {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n      .english {\n        font-family: \"Pingfang\", \"Jhenghei\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#000000;\ndisplay:inline;\n      }\n\n\n		.DefaultButtonOuter\n		{\n			border: 2px solid black ;\n			border-radius: 8px;\n			width: 96px;\n			height: 26px;\n			text-align: center;\n			\n			/*background-color: #99999a;*/\n			background: #99999a; /* For browsers that do not support gradients */\n			/*background: -webkit-linear-gradient(left top, red, yellow);*/ /* For Safari 5.1 to 6.0 */\n			/*background: -o-linear-gradient(bottom right, red, yellow);*/ /* For Opera 11.1 to 12.0 */\n			/*background: -moz-linear-gradient(bottom right, red, yellow); */ /* For Firefox 3.6 to 15 */\n			background: linear-gradient(to bottom right, #dcdbde, #737374); /* Standard syntax */\n		}\n\n		.ButtonInner\n		{\n			border: 1px solid black ;\n			border-radius: 5px;\n			background-color: #dcdbde;\n			width: 88px;\n			height: 18px;\n			text-align: center;\n			margin: 3px;\n			\n		    line-height: 18px;\n	        font-family: \"Charcoal CY\", \"Virtue\", Geneva, sans-serif;\n			font-size: 11px;\n			color: #000000;\n		}\n		\n		.ButtonInner:active\n		{\n		    background:#666666;\n		    color: #ffffff;\n		}\n\n		.key\n		{\n			border: 1px solid black ;\n			border-radius: 5px;\n			background-color: #dcdbde;\n			width: 18px;\n			height: 18px;\n			text-align: center;\n			margin: 3px;\n			\n		    line-height: 18px;\n	        font-family: Geneva, sans-serif;\n			font-size: 11px;\n			color: #000000;\n		}\n\n\n			#matrix {\n				background: black;\n				float: center;\n			}\n\n			#matrix td {\n			    padding: 7px;\n    			margin: 0px;\n    			float: center;\n				background: black;\n				font: 54px arial;\n				\n				height: 80px;\n			}\n\n			#matrix tr {\n				height: 80px;\n			}\n\n\n			#matrix p {\n			    opacity: 0;\n			    margin-top: -25px;\n			    text-align: center;\n\n				height: 80px;\n\n			    -webkit-transition: margin-top 2s ease-in;\n			    -moz-transition: margin-top 2s ease-in;\n			    -o-transition: margin-top 2s ease-in;\n			    -ms-transition: margin-top 2s ease-in;\n			    transition: margin-top 2s ease-in;\n			}\n			\n			#matrix p.load {\n			    opacity: 1;\n			    margin-top: 25px;\n			}\n\n     .dialogWithDropShadow\n     {\n         -webkit-box-shadow: 1px 1px 0px rgba(0, 0, 0, 1);\n         -moz-box-shadow: 1px 1px 0px rgba(0, 0, 0, 1); \n     }\n\n@font-face {\n    font-family: \"SmallSealScript\";\n    src: url(\"http://localhost/pingtype/fonts/FangzhengXiaozhuantiFont-TraditionalChinese.ttf\") format(\"truetype\");\n}\n\n      .smallSealScript_1 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:black;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .smallSealScript_2 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .smallSealScript_3 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .smallSealScript_4 {\n        font-family: \"SmallSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n@font-face {\n    font-family: \"LargeSealScript\";\n    src: url(\"http://localhost/pingtype/fonts/JDFZHUANF.ttf\") format(\"truetype\");\n}\n\n      .largeSealScript_1 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:black;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .largeSealScript_2 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .largeSealScript_3 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .largeSealScript_4 {\n        font-family: \"LargeSealScript\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n\n@font-face {\n    font-family: \"OracleBones\";\n    src: url(\"http://localhost/pingtype/fonts/bnujgw.ttf\") format(\"truetype\");\n}\n\n      .oracleBones_1 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\n        color:black;\n		font-size: 30px;\n		display:inline;\n      }\n\n      .oracleBones_2 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#f82423;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .oracleBones_3 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#189c19;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n      .oracleBones_4 {\n        font-family: \"OracleBones\", \"Heiti TC Light\", Tahoma, Geneva, sans-serif;\ncolor:#178FD1;\nfont-size: 30px;\ndisplay:inline;\n      }\n\n\n    </style>\n\n  </head>\n  <body>\n	";
var htmlFooters = "\n  </body>\n</html>\n";

var http = require('http');
var querystring = require('querystring');
var fs = require('fs');

var chineseFileText = "";
var englishFileText = "";

var server;
server = http.createServer(function(req,res){
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}

	// ...
});

	server.listen(5373);

server.on('request', function (req, res) {
    if (req.method == 'POST') {
        var body = '';
    }

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        var post = querystring.parse(body);
        //console.log(post);
        res.writeHead(200, {'Content-Type': 'text/plain'});
                
        var thisCommand = post.command;
        
        if (thisCommand != undefined)
        {
        	var thisCommandString = thisCommand.toString();
        	
        	//console.log(thisCommandString);

    	    if (thisCommandString == "reloadDictionary")
   	     	{
				loadDictionary("../PinyinDefinitionsTonesSorted.txt");
				console.log("reloaded dictionary");
		        res.end("reloaded dictionary");
    	    }

    	    if (thisCommandString == "quit")
     	    {
			    server.close();
			    server.unref();
				process.exit( 0 );
				return;
      	    }
        } // end if the command is not undefined

        var addCommon = false;
        	
        var thisWordList = post.wordList;
        
        if (thisWordList != undefined)
        {
        	var wordList = thisWordList.toString();
        	
        	addCommon = true;
			
			if (wordList == "tocfl")
			{
				if (commonWords == "")
				{
					loadCommonWords("../wordLists/TOCFL/tocfl.txt");
				}
			}
        	
        } // end if a word list should be loaded

        var thisEnglishFile = post.englishFile;
		var thisChineseFile = post.chineseFile;
		
		// If we have both Chinese and English files
		
		if ((thisChineseFile != undefined) && (thisEnglishFile != undefined))
        {
			var chineseFile = "../" + thisChineseFile.toString();
			var englishFile = "../" + thisEnglishFile.toString();
			
			chineseFileText = "";
			englishFileText = "";

        	loadChineseEnglish(chineseFile, englishFile, function (err, data) {
						if (err) {
							console.log('error loading chinese and english files');
							console.log(err.toString());
						} else {
							//console.log(data.toString());
							//console.log("callback function running");
							//console.log("englishFileText.length" + englishFileText.length);
					
							var outputHtml = "";
		
							outputHtml = outputHtml + htmlHeaders;
			
							var deradicalizedText = deradicalize(chineseFileText);
							var spacedText = wordSpace(deradicalizedText);
							var translationOutput = translateText(spacedText, englishFileText, addCommon);
							outputHtml = outputHtml + translationOutput[0];

							outputHtml = outputHtml + htmlFooters;
		
							res.end(outputHtml);
					
						}
					});
        } else {
		
			if (thisChineseFile != undefined)
		    {
				var chineseFile = "../" + thisChineseFile.toString();
		
        		loadChinese(chineseFile, function (err, data) {
						if (err) {
							console.log('error loading chinese file');
							console.log(err.toString());
						} else {
							//console.log(data.toString());
							//console.log("callback function running");
							//console.log("englishFileText.length" + englishFileText.length);
					
							var outputHtml = "";
		
							outputHtml = outputHtml + htmlHeaders;
			
							var deradicalizedText = deradicalize(chineseFileText);
							var spacedText = wordSpace(deradicalizedText);
							var translationOutput = translateText(spacedText, englishFileText, addCommon);
							outputHtml = outputHtml + translationOutput[0];

							outputHtml = outputHtml + htmlFooters;
		
							res.end(outputHtml);
					
						}
					});
				
			} // end if a chinese file should be loaded
			
		} // end load files
        
		var thisBilingualFile = post.bilingualFile;
		if (thisBilingualFile != undefined)
		{
			var bilingualFile = "../" + thisBilingualFile.toString();

			chineseFileText = "";
			englishFileText = "";

			loadBilingual(bilingualFile, function (err, data) {
					if (err) {
						console.log('error loading bilingual file');
						console.log(err.toString());
					} else {
						//console.log(data.toString());
						//console.log("callback function running");
						//console.log("englishFileText.length" + englishFileText.length);
				
						var outputHtml = "";
	
						outputHtml = outputHtml + htmlHeaders;
		
						var deradicalizedText = deradicalize(chineseFileText);
						var spacedText = wordSpace(deradicalizedText);
						var translationOutput = translateText(spacedText, englishFileText, addCommon);
						outputHtml = outputHtml + translationOutput[0];

						outputHtml = outputHtml + htmlFooters;
	
						res.end(outputHtml);
				
					}
				});
			
		} // end if a chinese file should be loaded
        
        var thisPostText = post.text;
        
        if (thisPostText != undefined)
        {
			
        	thisPostText = thisPostText.toString();
			thisPostText = replaceChars(thisPostText, "\\n", "\n");
        	
        	
			var outputHtml = "";
		
			outputHtml = outputHtml + htmlHeaders;
			
			var deradicalizedText = deradicalize(thisPostText);
			var spacedText = wordSpace(deradicalizedText);
			var translationOutput = translateText(spacedText, "", addCommon);
			outputHtml = outputHtml + translationOutput[0];

			outputHtml = outputHtml + htmlFooters;
		
			res.end(outputHtml);
        	
		} // end if the post text is not undefined
		
		
    });
});


/* Functions from Pingtype */
		
		// Global variables
		var token = "";
		var githubUsername = "pingtype";
		var githubRepo = "pingtype.github.io";

  
		var combinedDictionaryData = "";
		var fiveWords = "\n";
		var fourWords = "\n";
		var threeWords = "\n";
		var twoWords = "\n";
		var oneWords = "\n";
		var longWords;
		var radicals;
		var toneNumbersMarks;

		var chineseText = "";
		var englishText = "";
		var literalText = "";
		
		var compositionData;
		var genealogiesData;
		var dictionaryData;
		var pinyinDefinitionData;
		var longWords;
		var commonWords = "";
		var bopomofoData;
		var reviewingTheHanziData = "\n";
		
		var taiwaneseData = "";
		var cantoneseData = "";
		var hangulData = "";
		var tangData = "";
		var japaneseData = "";
		var vietnameseData = "";
		
		var simplifiedCharacters = "";
		var simplifiedData = "";
		var traditionalData = "";
		var taiwanData = "";
		var hongKongData = "";
		var japanData = "";
				
		var ancestors = "";
		var highestLevel = 0;
		var genealogy = "";
		var children = "";
		
		var lastDictionary = false;
		
		var slideTextArray = [];
		var lastSlideText = "";
		var lastSlideStartTime = "";
		var currentSlide = 0;
		var currentSlideSubtitle = 1;
		
		var imageFolderList = "";		
		
		// Disabled functions that only exist so I can copy-paste translateText and wordSpace without major changes
		
		function appendToFile(filename, thisString)
		{
			//console.log("appendToFile(" + filename + "," + thisString + ")");
			
			return;
			
	  		var useGithub = document.getElementById("useGithubCheckbox").checked;
			
			if (useGithub == false)
			{
				var request = new XMLHttpRequest();
				request.open('POST', 'appendToFile.php', true);
				request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

				request.onreadystatechange =
		  		function(e) { return appendToFileResponseHandler.call(e, request); };

				var requestData = "filename=" + filename + "&" + "data=" + thisString;

				request.send(requestData);
			} else {
				appendToGithub(filename, thisString);

			}

		} // end function appendToFile
		
		function showMissingWords(theseWords)
		{
			//debugLog("showMissingWords(" + theseWords + ")");

			var missingWordsHtml = "";

			var headers = "<tr><td><div style=\"font-family: 'Charcoal CY', 'Virtue', Geneva, sans-serif; font-size: 14px;\">Missing words</div></td><td><textarea id=\"missingWordsTextArea\" rows=\"5\" cols=\"50\" >";
		
			var footers = "</textarea></td></tr>";
			
			var missingWordsArray = theseWords.split("\n");
			
			var missingWordsString = "";
			
			var numberWords = missingWordsArray.length;
			
			if (numberWords <= 1)
			{
				return;
			}
			
			for (var currentWord = 0; currentWord < numberWords; currentWord++)
			{
				var thisWord = missingWordsArray[currentWord];
				
				if (contains(missingWordsString,thisWord) == false)
				{
					missingWordsString = missingWordsString + thisWord + "\n";
				}
			} // end for every word
			
			missingWordsHtml = headers + missingWordsString + footers;
			
			//var missingWordsTable = document.getElementById("missingWordsTable");
			//missingWordsTable.innerHTML = missingWordsHtml;
			
			console.log(missingWordsHtml);
		
		} // end function showMissingWords
		
		function dictionariesLoaded()
		{
			dictionaryToWordLengths();
		} // end function dictionariesLoaded

		function loadChineseEnglish(chineseFile, englishFile, callbackFunction)
		{
			//console.log("loadChinese(" + chineseFile + ")");

			
			fs.readFile( __dirname + "/" + chineseFile, function (err, data) {
				if (err) {
					console.log('error loading chinese file');
					console.log(err.toString());
				} else {
					//console.log("chinese file loaded");
					chineseFileText = data.toString();
					chineseFileText = replaceChars(chineseFileText, "\r", "\n");
					
					fs.readFile( __dirname + "/" + englishFile, function (err, data) {
						if (err) {
							console.log('error loading english file');
							console.log(err.toString());
						} else {
							//console.log("english file loaded");
							//console.log(data.toString());
							englishFileText = data.toString();
							englishFileText = replaceChars(englishFileText, "\r", "\n");
					
							callbackFunction();
					
						}
					});
					
				}
			});
			
		} // end function loadChinese

		function loadChinese(filename, callbackFunction)
		{
			//debugLog("loadChinese(" + filename + ")");

			
			fs.readFile( __dirname + "/" + filename, function (err, data) {
				if (err) {
					console.log('error loading chinese file');
					console.log(err.toString());
				} else {
					//console.log(data.toString());
					chineseFileText = data.toString();
					chineseFileText = replaceChars(chineseFileText, "\r", "\n");
					
					callbackFunction();
				}
			});
			
		} // end function loadChinese

		function loadBilingual(filename, callbackFunction)
		{
			//debugLog("loadBilingual(" + filename + ")");

			
			fs.readFile( __dirname + "/" + filename, function (err, data) {
				if (err) {
					console.log('error loading bilingual file');
					console.log(err.toString());
				} else {
					//console.log(data.toString());
					var bilingualFileText = data.toString();
					bilingualFileText = replaceChars(bilingualFileText, "\r", "\n");
					
					var inputLines = bilingualFileText.split("\n");
		   
					var numberLines = inputLines.length;
		   
					var outputHtml = "";
					var outputText = "";
		   
					var lastEnglishLine = "";
		   
					var lastWasEnglish = false;

					for (var currentLine = 0; currentLine < numberLines; currentLine = currentLine + 1)
					{
						var thisLine = inputLines[currentLine];
			   
						if (thisLine == "")
						{
							if (lastWasEnglish == false)
							{
								chineseFileText = chineseFileText + "\n";
								englishFileText = englishFileText + "\n";
							}
				   
							outputHtml = outputHtml + "\n<br></br>";
							outputText = outputText + "\n";
				   
						} else {
							if (containsChineseString(thisLine) == true)
							{
								lastWasEnglish = false;

								chineseFileText = chineseFileText + thisLine + "\n";

							} else {
				   
								englishFileText = englishFileText + thisLine + "\n";
				   
								lastWasEnglish = true;
				   
							} // end if the line contains chinese
						} // end if the line is not blank
							   
					} // end for every line
		   
					//outputText = replaceChars(outputText, "\n\n", "\n");
					
					callbackFunction();
				}
			});
			
		} // end function loadChinese

		function loadEnglish(filename)
		{
			//debugLog("loadEnglish(" + filename + ")");

			
			fs.readFile( __dirname + "/" + filename, function (err, data) {
				if (err) {
					console.log('error loading english file');
					console.log(err.toString());
				} else {
					//console.log(data.toString());
					englishFileText = data.toString();
				}
			});
			
		} // end function loadEnglish


		function loadCommonWords(filename)
		{
			//debugLog("loadDictionary(" + filename + ")");

			
			fs.readFile( __dirname + "/" + filename, function (err, data) {
				if (err) {
					console.log('error loading word list');
					console.log(err.toString());
				} else {
					//console.log(data.toString());
					commonWords = "\n" + data.toString();
				}
			});
			
		} // end function loadCommonWords

		function loadDictionary(filename)
		{
			//debugLog("loadDictionary(" + filename + ")");

			
			fs.readFile( __dirname + "/" + filename, function (err, data) {
				if (err) {
					console.log('error loading dictionary');
					console.log(err.toString());
				} else {
					//console.log(data.toString());
					combinedDictionaryData = data.toString();
					dictionariesLoaded();
				}
			});
			
		} // end function loadDictionary

		function loadRadicals(filename)
		{
			//debugLog("loadDictionary(" + filename + ")");

			
			fs.readFile( __dirname + "/" + filename, function (err, data) {
				if (err) {
					console.log('error loading radicals');
					console.log(err.toString());
				} else {
					//console.log(data.toString());
					radicals = data.toString();
				}
			});
			
		} // end function loadRadicals

		
		// Library functions
		
		function replaceChars(thisString, searchString, replaceString)
		{
			//debugLog("replaceChars(" + thisString + "," + searchString + "," + replaceString + ")");

			return thisString.split(searchString).join(replaceString);
		} // end function replaceChars

		function textBetween(thisText, startString, endString)
		{
			//debugLog("textBetween(" + thisText + "," + startString + "," + endString + ")");
			
			if (thisText == undefined)
			{
				return "";
			}
			
			var start_pos = 0;
			if (startString != 'start')
			{
				start_pos = thisText.indexOf(startString);

				// If the text does not contain the start string, return a blank string
				if (start_pos < 0)
				{
					return '';
				}

				// Skip the first startString characters
				start_pos = start_pos + startString.length;
			}

			var end_pos = thisText.length;
			if (endString != 'end')
			{
				end_pos = thisText.indexOf(endString,start_pos);
			}

			// If the text does not have the end string after the start string, return the whole string after the start
			if (end_pos < start_pos)
			{
				end_pos = thisText.length;
			}

			var newText = thisText.substring(start_pos,end_pos);

			return newText;
		} // end textBetween

		// contains - Does thisText contain searchString?
		function contains(thisText, searchString)
		{
			//debugLog("contains(" + thisText + "," + searchString + ")");

			if (thisText == null)
			{
				return false;
			}
			
			return thisText.indexOf(searchString) != -1;
		} // end function contains

		function containsLineStartingWith(thisText, searchString)
		{
			//debugLog("containsLineStartingWith(" + thisText + "," + searchString + ")");

			var searchRegexString = "^" + "(" + searchString + ".*)";
				
			searchRegexString = searchRegexString + "$";
				
			var searchRegex = new RegExp(searchRegexString, "gm");
				
			//document.write(searchRegex);
				
			var searchResultsArray = thisText.match(searchRegex);
			
			if (searchResultsArray == null)
			{
				return false;
			}
			
			if (searchResultsArray.length > 0)
			{
				return true;
			} else {
				return false;
			}
		
		} // end function containsLineStartingWith

		function getDateString()
		{
			//debugLog("getDateString");
		
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var hour = today.getHours();
			var mins = today.getMinutes();
			var sec = today.getSeconds();

			var yyyy = today.getFullYear();
			if(dd<10)
			{
				dd='0'+dd;
			} 

			if(mm<10)
			{
				mm='0'+mm;
			}

			if(mins<10)
			{
				mins='0'+mins;
			}
			
			if(sec<10)
			{
				sec='0'+sec;
			}
			
			var today = dd+'/'+mm+'/'+yyyy+" "+hour+":"+mins+":"+sec;
			
			return today;
		} // end function getDateString

		// isChinese - check if the character is in the unihan dictionary 
		function isChinese(thisCharacter)
		{
			//debugLog("isChinese(" + thisCharacter + ")");
			
			// Pi-hahiroth
			if (thisCharacter == "．")
			{
				return true;
			}
			
			var charCode = thisCharacter.charCodeAt(0);
		
			if (charCode >= 13312)
			{
				if (charCode <= 64217)
				{
					return true;
				}
			}
			
			if (charCode >= 131072)
			{
				if (charCode <= 195101)
				{
					return true;
				}
			}
			
			return false;
			
		} // end function isChinese
		
		function isChineseString(thisString)
		{
			//debugLog("isChineseString(" + thisString + ")");

			var numberCharacters = thisString.length;
			
			var stringIsChinese = true;
			
			for (var currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
			{
				var thisCharacter = thisString[currentCharacter];
				
				if (isChinese(thisCharacter) == false)
				{
					stringIsChinese = false;
					break;
				}
			} // end for every character
			
			return stringIsChinese;
		} // end function isChineseString

		function containsChineseString(thisString)
		{
			//debugLog("isChineseString(" + thisString + ")");

			var numberCharacters = thisString.length;
			
			var stringIsChinese = false;
			
			for (var currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
			{
				var thisCharacter = thisString[currentCharacter];
				
				if (isChinese(thisCharacter) == true)
				{
					stringIsChinese = true;
					break;
				}
			} // end for every character
			
			return stringIsChinese;
		} // end function containsChineseString

		
		function isEnglish(thisCharacter)
		{
			//debugLog("isEnglish(" + thisCharacter + ")");

			var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890-";
			
			if (contains(alphabet, thisCharacter) == true)
			{
				return true;
			} else {
				return false;
			}
			
		} // end function isEnglish
		
		function isEnglishString(thisString)
		{
			//debugLog("isEnglishString(" + thisString + ")");

			var numberCharacters = thisString.length;
			
			var stringIsEnglish = true;
			
			for (var currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
			{
				var thisCharacter = thisString[currentCharacter];
				
				if (isEnglish(thisCharacter) == false)
				{
					stringIsEnglish = false;
					break;
				}
			} // end for every character
			
			return stringIsEnglish;
		} // end function isEnglishString
		
		function isBopomofo(thisCharacter)
		{
			//debugLog("isBopomofo(" + thisCharacter + ")");

			var alphabet = "ㄅㄉˇˋㄓˊ˙ㄚㄞㄢㄦㄆㄊㄍㄐㄔㄗㄧㄛㄟㄣㄇㄋㄎㄑㄕㄘㄨㄜㄠㄤㄈㄌㄏㄒㄖㄙㄩㄝㄡㄥ ";
			
			if (contains(alphabet, thisCharacter) == true)
			{
				return true;
			} else {
				return false;
			}
			
		} // end function isBopomofo
		
		function isBopomofoString(thisString)
		{
			//debugLog("isBopomofoString(" + thisString + ")");

			var numberCharacters = thisString.length;
			
			var stringIsBopomofo = true;
			
			for (var currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
			{
				var thisCharacter = thisString[currentCharacter];
				
				if (isBopomofo(thisCharacter) == false)
				{
					stringIsBopomofo = false;
					break;
				}
			} // end for every character
			
			return stringIsBopomofo;
		} // end function isBopomofoString
		
		// Check if a value is a number
		function isNumeric(n) 
		{
			//debugLog("isNumeric(" + n + ")");
			
			return !isNaN(parseFloat(n)) && isFinite(n);
		} // end function isNumeric

		function isNumberString(thisString)
		{
			//debugLog("isNumberString(" + thisString + ")");

			var numberCharacters = thisString.length;
			
			var stringIsNumber = true;
			
			for (var currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
			{
				var thisCharacter = thisString[currentCharacter];
				
				if (isNumeric(thisCharacter) == false)
				{
					stringIsNumber = false;
					break;
				}
			} // end for every character
			
			return stringIsNumber;
		} // end function isNumberString

		// returns a char's Unicode codepoint, of the char at index idx of string str
		// 2013-07-16 from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/charCodeAt
		function fixedCharCodeAt (str, idx) 
		{
			//debugLog("fixedCharCodeAt(" + str + "," + idx + ")");
			
			// ex. fixedCharCodeAt ('\uD800\uDC00', 0); // 65536
			// ex. fixedCharCodeAt ('\uD800\uDC00', 1); // 65536
			idx = idx || 0;
			var code = str.charCodeAt(idx);
			var hi, low;
			if (0xD800 <= code && code <= 0xDBFF) 
			{ // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
        		hi = code;
        		low = str.charCodeAt(idx+1);
        		if (isNaN(low)) 
        		{
            		throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
        		}
        		return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    		}
    		if (0xDC00 <= code && code <= 0xDFFF) 
    		{ 
    			// Low surrogate
        		// We return false to allow loops to skip this iteration since should have already handled high surrogate above in the previous iteration
        	return false;
        	/*hi = str.charCodeAt(idx-1);
        	low = code;
        	return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
    		}
    		return code;
		} // end function fixedCharCodeAt
		
		function deradicalize(thisText)
		{
			//debugLog("deradicalize(" + thisText + ")");

			var radicalLines = radicals.split("\n");
			var numberLines = radicalLines.length;
			
			for (var currentLine = 0; currentLine < numberLines; currentLine = currentLine + 1)
			{
				var thisLine = radicalLines[currentLine];
				
				var thisLineArray = thisLine.split(" ");
				
				var thisRadical = thisLineArray[0];
				var thisIdeograph = thisLineArray[1];
				
				//thisText = thisText.replace(/thisRadical/g, thisIdeograph);
				//thisText = thisText.split(thisRadical).join(thisIdeograph);
				thisText = replaceChars(thisText, thisRadical, thisIdeograph)

			} // end for every radical
			
			return thisText;
			
		} // end function deradicalize
		
		function dictionaryToWordLengths()
		{
			//debugLog("dictionaryToWordLengths");
		
			var combinedDictionaryDataLines = combinedDictionaryData.split("\n");
			
			var numberLines = combinedDictionaryDataLines.length;
			
			for (var currentLine = 0; currentLine < numberLines; currentLine++)
			{
				var thisLine = combinedDictionaryDataLines[currentLine];
			
				if (thisLine != "")
				{
					var thisChinese = textBetween(thisLine, "start", "	");
					
					var wordLength = thisChinese.length;
					
					switch (wordLength)
					{
						case 5: fiveWords = fiveWords + thisChinese + "\n"; break;
						case 4: fourWords = fourWords + thisChinese + "\n"; break;
						case 3: threeWords = threeWords + thisChinese + "\n"; break;
						case 2: twoWords = twoWords + thisChinese + "\n"; break;
						case 1: oneWords = oneWords + thisChinese + "\n"; break;
						default: break;
					}
					
				} // end if the line is not blank
			} // end for every line in the dictionary
			

		} // end function dictionaryToWordLengths
		
		function searchDictionary(thisWord)
		{
			//debugLog("searchDictionary(" + thisWord + ")");

			var wordLength = thisWord.length;
			
			switch (wordLength)
			{
				case 5: return contains(fiveWords, "\n" + thisWord + "\n"); break;
				case 4: return contains(fourWords, "\n" + thisWord + "\n"); break;
				case 3: return contains(threeWords, "\n" + thisWord + "\n"); break;
				case 2: return contains(twoWords, "\n" + thisWord + "\n"); break;
				case 1: return contains(oneWords, "\n" + thisWord + "\n"); break;
				default: return contains(combinedDictionaryData, "\n" + thisWord + "	"); break;
			}
			
		} // end function searchDictionary
		
		function wordSpace(thisChinese)
		{
			//debugLog("wordSpace(" + thisChinese + ")");
			
			var breakMissingWords = true;
			
			var spacedChinese = "";
			
			var thisChineseLines = thisChinese.split("\n");
			
			for (var currentLine = 0; currentLine < thisChineseLines.length; currentLine++)
			{
			
				var thisChineseLine = thisChineseLines[currentLine];
				
				var numberCharacters = thisChineseLine.length;
				var lastWasNotChinese = false;
				var spacedChineseLine = "";
				
				var lineIsEnglish = true;
				
				// Skip non-Chinese character
				/*
				if (numberCharacters >= 1)
				{
					
					for (var currentCharacter = 0; currentCharacter <= numberCharacters; currentCharacter++)
					{	
						
						if (currentCharacter >= numberCharacters)
						{
							break;
						}
									
						var thisCharacter = thisChineseLine[currentCharacter];
						
						if (isChinese(thisCharacter) == true)
						{
							lineIsEnglish = false;
							break;
						}
					} // end for every non-Chinese character
				} // end if there is more than one character on the line
				*/
				
				// Skip all-English lines
		   		if (containsChineseString(thisChineseLine) == false)
				{
					spacedChinese = spacedChinese + thisChineseLine + "\n";
				} else {
				
					 for (var currentCharacter = 0; currentCharacter < numberCharacters; currentCharacter++)
					 {
						 var thisWord = "";
				
						 var wordFound = false;
					
						 for (var wordLength = 5; wordLength >= 2; wordLength--)
						 {
				
							 var lastCharacter = currentCharacter + wordLength;
						
							 if (lastCharacter > numberCharacters)
							 {
								 lastCharacter = numberCharacters;
							 }
						
							 thisWord = thisChineseLine.substring(currentCharacter, lastCharacter);
						
							 var thisCharacter = thisChineseLine[currentCharacter];

							 if (isChinese(thisCharacter) == false)
							 {
								 // Don't add spaces between non-Chinese characters
								 //spacedChineseLine = spacedChineseLine + thisCharacter;
						
								 //lastWasNotChinese = true;
							
								 // Move the character along in the string
								 //currentCharacter = currentCharacter + 1;
							
								 wordFound == false;
							
							 } else {

								 //lastWasNotChinese = false;
							
								 var inDictionary = false;
							
								 if (breakMissingWords == false)
								 {
									 inDictionary = contains(combinedDictionaryData, thisWord + "	");
								 } else {
									 //inDictionary = contains(combinedDictionaryData, "\n" + thisWord + "	");
									 inDictionary = searchDictionary(thisWord);
								 }
							
								 //if (contains(longWords, " " + thisWord) == true)
								 if (inDictionary == true)
								 {
									 // Move the character along in the string
									 currentCharacter = currentCharacter + wordLength - 1;
							
									 wordFound = true;
						
									 // Exit the loop cleanly
									 wordLength = 0;
								 } // end if the character is not Chinese
							
							 } // if the word exists
					
						 } // end for every word length
				
						 // If the word is not found, just use the character
						 if (wordFound == false)
						 {
							 var thisCharacter = thisChineseLine[currentCharacter];
					
							 if (isChinese(thisCharacter) == false)
							 {
								 // Don't add spaces between non-Chinese characters
								 spacedChineseLine = spacedChineseLine + thisCharacter;
						
								 lastWasNotChinese = true;
						
							 } else {
						
								 // Add a space if we're back to parsing Chinese
								 if (lastWasNotChinese == true)
								 {
									 spacedChineseLine = spacedChineseLine + " ";
									 lastWasNotChinese = false;
								 }
						
								 spacedChineseLine = spacedChineseLine + thisCharacter + " ";					

							 } // end if this character is not Chinese
					
						 } else {

							 // Add a space if we're back to parsing Chinese
							 if (lastWasNotChinese == true)
							 {
								 spacedChineseLine = spacedChineseLine + " ";
								 lastWasNotChinese = false;
							 }

							 spacedChineseLine = spacedChineseLine + thisWord + " ";

						 } // end if the word was not found
								
				
					 } // end for every character
				
					 spacedChinese = spacedChinese + spacedChineseLine + "\n";
				} // end if the line is English
				
			} // end for every line
			
			
			var spacedLines = "";
		   
			var spacedChineseLines = spacedChinese.split("\n");
			
			var numberLines = spacedChineseLines.length;
			
			for (var currentLine = 0; currentLine < numberLines; currentLine++)
			{
			
				var spacedChineseLine = spacedChineseLines[currentLine];


				if (containsChineseString(spacedChineseLine) == true)
				{
					var spacedLine = "";
				
					var numberLineCharacters = spacedChineseLine.length;
		   			
		   			// Add spaces for punctuation
					for (var currentLineCharacter = 0; currentLineCharacter < numberLineCharacters; currentLineCharacter++)
					{
						var thisLineCharacter = spacedChineseLine[currentLineCharacter];
			   			
						if (isChinese(thisLineCharacter) == true)
						{
							spacedLine = spacedLine + thisLineCharacter;
						} else {
							if (isEnglish(thisLineCharacter) == true)
							{
								spacedLine = spacedLine + thisLineCharacter;
							} else {
								spacedLine = spacedLine + thisLineCharacter + " ";
							}
						}			   			
					} // end add spaces after every non-Chinese character
					
					spacedLines = spacedLines + spacedLine + "\n";
					
				} else {
					// Don't add spaces on English lines
					spacedLines = spacedLines + spacedChineseLine + "\n";
				
				} // end if the line is english
				
			} // end for every line
			
			return spacedLines;
			
		} // end function wordSpace
		
		function getPinyinSized(thisPinyin, thisTone)
		{
			//debugLog("getPinyinSized(" + thisPinyin + "," + thisTone + ")");
			
			if (thisTone == 1)
			{
				return "<span style=\"font-size:16px\">" + thisPinyin + "</span>";
			}

			if (thisTone == 5)
			{
				return "<span style=\"font-size:16px\">" + thisPinyin + "</span>";
			}
			
			var thisPinyinArray = thisPinyin.split("");
			
			var numberCharacters = thisPinyinArray.length;
			
			// Longest is 6
			
			if (numberCharacters == 1)
			{
				return "<span style=\"font-size:16px\">" + thisPinyin + "</span>";
			}
			
			var thisPinyinSized;
			
			if (numberCharacters == 2)
			{
				if (thisTone == 2)
				{
					thisPinyinSized = "<span style=\"font-size:14px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[1] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 3)
				{
					return "<span style=\"font-size:16px\">" + thisPinyin + "</span>";
				}

				if (thisTone == 4)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[1] + "</span>";
					return thisPinyinSized;
				}
			}

			if (numberCharacters == 3)
			{
				if (thisTone == 2)
				{
					thisPinyinSized = "<span style=\"font-size:14px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[2] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 3)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[2] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 4)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[2] + "</span>";
					return thisPinyinSized;
				}
			}

			if (numberCharacters == 4)
			{
				if (thisTone == 2)
				{
					thisPinyinSized = "<span style=\"font-size:14px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:17px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[3] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 3)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[3] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 4)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:17px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[3] + "</span>";
					return thisPinyinSized;
				}
			}

			if (numberCharacters == 5)
			{
				if (thisTone == 2)
				{
					thisPinyinSized = "<span style=\"font-size:14px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:17px\">" + thisPinyin[3] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[4] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 3)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[3] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[4] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 4)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:17px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[3] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[4] + "</span>";
					return thisPinyinSized;
				}
			}

			if (numberCharacters == 6)
			{
				if (thisTone == 2)
				{
					thisPinyinSized = "<span style=\"font-size:14px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[3] + "</span>" + "<span style=\"font-size:17px\">" + thisPinyin[4] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[5] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 3)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[3] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[4] + "</span>" + "<span style=\"font-size:18px\">" + thisPinyin[5] + "</span>";
					return thisPinyinSized;
				}

				if (thisTone == 4)
				{
					thisPinyinSized = "<span style=\"font-size:18px\">" + thisPinyin[0] + "</span>" + "<span style=\"font-size:17px\">" + thisPinyin[1] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[2] + "</span>" + "<span style=\"font-size:16px\">" + thisPinyin[3] + "</span>" + "<span style=\"font-size:15px\">" + thisPinyin[4] + "</span>" + "<span style=\"font-size:14px\">" + thisPinyin[5] + "</span>";
					return thisPinyinSized;
				}
			}

			
			return thisPinyin;
			
		} // end function getPinyinSized
		
		// translateText - translate Chinese to English
		function translateText(inputText, englishText, addCommon)
		{		
			//debugLog("translateText(" + inputText + "," + englishText + ")");
			
			var outputText = "";			
			var outputHtml = "";			
			
			var inputArray = inputText.split("\n");
			var englishArray = englishText.split("\n");
			
			var numberLines = inputArray.length;
			var numberEnglishLines = englishArray.length;
			
			var addChinesePlain = false;
			var addChineseSpaced = false;
			var addChinese = true;
			var addPinyin = true;
			var pinyinToneNumbers = false;
			var pinyinSize = true;
			var addLiteral = true;
			var addLitMan = false;
			var addEnglish = true;
			var addHex = false;
			var addUnitype = false;
			var addSyllables = false;
			var addLargeSealScript = false;
			var addSmallSealScript = false;
			var addOracleBones = false;
			var addBopomofo = false;
			var addWadeGiles = false;
			var addSimplified = false;
			var addTaiwanese = false;
			var addCantonese = false;
			var monospaceText = false;
			var addHangul = false;
			var addVietnamese = false;
			var addJapanese = false;
			var addTang = false;
			var addPageBreaks = false;
			var hashOut = false;
			
			/*
			var addCommon = false;
			
			if (commonWords != "")
			{
				addCommon = true;
			}
			*/
			
			var missingWords = "";
			
			if (englishText == "")
			{
				addEnglish = false;
			}
			
			if (addSimplified == true)
			{
				var simplifiedText = document.getElementById('simplifiedSpacedTextArea').value;
			
				var simplifiedArray = simplifiedText.split("\n");
			} // end if addSimplified
			
			if (addLitMan == true)
			{
				var litManText = document.getElementById('simplifiedInputTextArea').value;
			
				var litManArray = litManText.split("\n");
			} // end if addLitMan

			
			if (addPageBreaks == true)
			{
				var pageBreaksLine = pageBreaksTextArea.value;
			} // end if addPageBreaks
			
			for (var currentLine = 0; currentLine < numberLines; currentLine++)
			{
				var thisLine = inputArray[currentLine];
				var englishLine = englishArray[currentLine];

				if (currentLine >= numberEnglishLines)
				{
					if (thisLine == "")
					{
						englishLine = "";
					} else {
						// Could show "undefined" to warn the user, but that might be more confusing. 
						englishLine = "";
					}
				}
				
				if (addSimplified == true)
				{
					var simplifiedLine = simplifiedArray[currentLine];
				} // end if addSimplified
				
				if (addLitMan == true)
				{
					var litManLine = litManArray[currentLine];
				} // end if litMan
				
				var chinesePlainLine = "";
				
				if (addChinesePlain == true)
				{
					chinesePlainLine = thisLine;
					chinesePlainLine = replaceChars(thisLine, " ", "");
				} // end if addChinesePlain

				var chineseSpacedLine = "";
				
				if (addChineseSpaced == true)
				{
					chineseSpacedLine = thisLine;
				} // end if addChineseSpaced
				
				var chineseHtml = "";
				var pinyinHtml = "";			
				var syllablesHtml = "";
				var translatedHtml = "";

				var chineseText = "";
				var pinyinText = "";			
				var translatedText = "";
				
				var simplifiedHtml = "";
				var simplifiedText = "";
				
				var wadeGilesHtml = "";
				var wadeGilesText = "";
				
				var hexHtml = "";
				var hexText = "";
				
				var unitypeHtml = "";
				var unitypeText = "";
				
				var smallSealScriptHtml = "";
				var largeSealScriptHtml = "";
				var oracleBonesHtml = "";
				
				var taiwaneseHtml = "";
				var taiwaneseText = "";
				
				var cantoneseHtml = "";
				var cantoneseText = "";
				
				var hangulHtml = "";
				var hangulText = "";

				var tangHtml = "";
				var tangText = "";

				var japaneseHtml = "";
				var japaneseText = "";

				var vietnameseHtml = "";
				var vietnameseText = "";
				

				//var thisLineWords = spacedLine.split(" ");
				
				var thisLineWords = thisLine.split(" ");
				
				if (addSimplified == true)
				{
					var thisSimplifiedWords = simplifiedLine.split(" ");
				} // end if addSimplified
				
				var numberLineWords = thisLineWords.length;
				for (var currentLineWord = 0; currentLineWord < numberLineWords; currentLineWord++)
				{
			
					var thisWord = thisLineWords[currentLineWord];
					
					var chineseHtmlWord = "";
					var pinyinHtmlWord = "";
					var syllablesHtmlWord = "";
					
					var chineseTextWord = "";
					var pinyinTextWord = "";
					var translatedTextWord = "";
					var chineseLength = 0;
					
					if (addBopomofo == true)
					{
						chineseHtmlWord = "<table><tr>";
					}
					
					if (addSimplified == true)
					{
						var simplifiedHtmlWord = "";
						var thisSimplifiedWord = thisSimplifiedWords[currentLineWord];
					} // end if addSimplified

					if (addSmallSealScript == true)
					{
						var smallSealScriptHtmlWord = "";
					} // end if addSmallSealScript

					if (addLargeSealScript == true)
					{
						var largeSealScriptHtmlWord = "";
					} // end if addLargeSealScript

					if (addOracleBones == true)
					{
						var oracleBonesHtmlWord = "";
					} // end if addOracleBones

					if (addWadeGiles == true)
					{
						var wadeGilesHtmlWord = "";
					} // end if addWadeGiles

					if (addTaiwanese == true)
					{
						var taiwaneseHtmlWord = "";
					} // end if addTaiwanese
					
					if (addCantonese == true)
					{
						var cantoneseHtmlWord = "";
					} // end if addCantonese

					if (addHangul == true)
					{
						var hangulHtmlWord = "";
					} // end if addHangul

					if (addTang == true)
					{
						var tangHtmlWord = "";
					} // end if addTang

					if (addJapanese == true)
					{
						var japaneseHtmlWord = "";
					} // end if addJapanese

					if (addVietnamese == true)
					{
						var vietnameseHtmlWord = "";
					} // end if addVietnamese

					
					if (addHex == true)
					{
						var hexHtmlWord = "";
					} // end if addHex

					if (addUnitype == true)
					{
						var unitypeHtmlWord = "";
					} // end if addUnitype
					
					if (searchDictionary(thisWord) == true)
					{
						var thisDictionaryLine = textBetween(combinedDictionaryData, "\n" + thisWord + "	", "\n");
						
						var thisDictionaryLineArray = thisDictionaryLine.split("	");
						
						var lineLength = thisDictionaryLineArray.length;
						
						var thisDefinition = "";
						var thisPinyin = "";
						var thisToneless = "";
						var thisTone = "";
						
						thisDefinition = thisDictionaryLineArray[0];

						if (lineLength >= 1)
						{
							thisPinyin = thisDictionaryLineArray[1];
						}
						
						if (lineLength >= 2)
						{
							thisToneless = thisDictionaryLineArray[2];
						}
						
						if (lineLength >= 3)
						{
							thisTone = thisDictionaryLineArray[3];
							
							if (thisTone == undefined)
							{
								thisTone = "";
							}
						}
						
						//var thisPinyin = textBetween(thisCharacterLine, "start", "	");
						//var thisDefinitionTone = textBetween(thisCharacterLine, "	", "end");
						//var thisDefinition = textBetween(thisDefinitionTone, "start", "	");
						//var thisTone = textBetween(thisDefinitionTone, "	", "end");
						
						var thisWordLength = thisWord.length;
						
						var thisPinyinArray = [];
						
						if (contains(thisPinyin," ") == true)
						{
							thisPinyinArray = thisPinyin.split(" ");
						} else {
							thisPinyinArray = [thisPinyin];
						}
						
						var thisPinyinLength = thisPinyinArray.length;
						var thisToneLength = thisTone.length;
						
						if ((addSyllables == true) || (addWadeGiles == true))
						{
							var thisTonelessArray = thisToneless.split(" ");
							var thisTonelessLength = thisTonelessArray.length;
						} // only use toneless when showing syllables
						
						var pinyinWord = "";
						
						
						// Get Taiwanese and/or Cantonese first, because those tone colours replace the Chinese tone colours
						
						if (addTaiwanese == true)
						{
							var thisTaiwaneseWordResults = getTaiwanese(thisWord, pinyinWord);

							var thisTaiwaneseWord = thisTaiwaneseWordResults[0];
							var thisTaiwaneseWordOptions = thisTaiwaneseWordResults[1];
							var thisTaiwaneseTonesArray = thisTaiwaneseWordResults[2];
							
							thisTone = thisTaiwaneseTonesArray.join("");
							
							//debugLog(thisTone);
							
							var thisTaiwaneseWordArray = [];
							
							if (thisTaiwaneseWord != "")
							{
								thisTaiwaneseWordArray = thisTaiwaneseWord.split(" ");
							}
							
							taiwaneseHtmlWord = getTaiwaneseHtml(thisWord, thisTaiwaneseWord);
							
							taiwaneseText = taiwaneseText + thisTaiwaneseWord + " ";
						} // end if addTaiwanese
						
						if (addCantonese == true)
						{
							var thisCantoneseWordResults = getCantonese(thisWord, pinyinWord);
							
							var thisCantoneseWord = thisCantoneseWordResults[0];
							var thisCantoneseWordOptions = thisCantoneseWordResults[1];
							var thisCantoneseTonesArray = thisCantoneseWordResults[2];
							
							thisTone = thisCantoneseTonesArray.join("");
							
							var thisCantoneseWordArray = [];
														
							if (thisCantoneseWord != "")
							{
								thisCantoneseWordArray = thisCantoneseWord.split(" ");
							}
							
							cantoneseHtmlWord = getCantoneseHtml(thisWord, thisCantoneseWord);
							
							cantoneseText = cantoneseText + thisCantoneseWord + " ";
						} // end if addCantonese


						// For every character in the word
						for (var currentWordCharacter = 0; currentWordCharacter < thisWordLength; currentWordCharacter++)
						{
							var thisCharacterChinese = thisWord[currentWordCharacter];
							
							var thisCharacterPinyin = "";
							
							if (currentWordCharacter < thisPinyinLength)
							{
								thisCharacterPinyin = thisPinyinArray[currentWordCharacter];
								
								if (pinyinToneNumbers == true)
								{
									thisCharacterPinyin = toneMarksToNumbers(thisCharacterPinyin);
								} // if we should convert to to numbers
								
							} // if there is a pinyin word
							
							if ((addSyllables == true) || (addWadeGiles == true))
							{
								var thisCharacterToneless = "";
							
								if (currentWordCharacter < thisTonelessLength)
								{
									thisCharacterToneless = thisTonelessArray[currentWordCharacter];
								}
							} // end if addSyllables then get toneless
							
							
							var thisCharacterTone = 1;
							
							if (currentWordCharacter < thisToneLength)
							{
								thisCharacterTone = thisTone[currentWordCharacter];
								
								if (thisCharacterTone < 1)
								{
									thisCharacterTone = 1;
								}
							} // end set the tone
							
							var chineseCharacterHtml = "<div class=\"chinese_" + thisCharacterTone + "\">" + thisCharacterChinese + "</div>";
							
							if (hashOut == true)
							{
								if (contains(commonWords,thisCharacterChinese) == false)
								{
									chineseCharacterHtml = "<div class=\"chinese_" + thisCharacterTone + "\">" + "#</div>";
								}
							}
							
							if (addSimplified == true)
							{
								var thisCharacterSimplified = thisSimplifiedWord[currentWordCharacter];
								var simplifiedCharacterHtml = "<div class=\"chinese_" + thisCharacterTone + "\">" + thisCharacterSimplified + "</div>";
								
								simplifiedHtmlWord = simplifiedHtmlWord + simplifiedCharacterHtml;
							}
							
							if (addSmallSealScript == true)
							{
								var smallSealScriptCharacterHtml = "<div class=\"smallSealScript_" + thisCharacterTone + "\">" + thisCharacterChinese + "</div>";
								
								smallSealScriptHtmlWord = smallSealScriptHtmlWord + smallSealScriptCharacterHtml;
							} // end if addSmallSealScript

							if (addLargeSealScript == true)
							{
								var largeSealScriptCharacterHtml = "<div class=\"largeSealScript_" + thisCharacterTone + "\">" + thisCharacterChinese + "</div>";
								
								largeSealScriptHtmlWord = largeSealScriptHtmlWord + largeSealScriptCharacterHtml;
							} // end if addLargeSealScript


							if (addOracleBones == true)
							{
								var oracleBonesCharacterHtml = "<div class=\"oracleBones_" + thisCharacterTone + "\">" + thisCharacterChinese + "</div>";
								
								oracleBonesHtmlWord = oracleBonesHtmlWord + oracleBonesCharacterHtml;
							} // end if addOracleBones

														
							if (addBopomofo == true)
							{
								var thisBopomofo = getBopomofo(thisCharacterChinese, thisCharacterTone);
								
								chineseHtmlWord = chineseHtmlWord + "<td>" + "<table><tr><td>" + chineseCharacterHtml + "</td><td>" + thisBopomofo + "</td></tr></table>" + "</td>";
								
							} else {
								
								chineseHtmlWord = chineseHtmlWord + chineseCharacterHtml;
								
							} // end if addBopomofo
							
							if (pinyinSize == true)
							{
								var pinyinSized = getPinyinSized(thisCharacterPinyin, thisCharacterTone);
								pinyinHtmlWord = pinyinHtmlWord + "<div class=\"pinyin_" + thisCharacterTone + "\">" + pinyinSized + "</div> ";
								
							} else {
								pinyinHtmlWord = pinyinHtmlWord + "<div class=\"pinyin_" + thisCharacterTone + "\">" + thisCharacterPinyin + "</div> ";
							}
														
							if (addWadeGiles == true)
							{
								var thisWadeGiles = getWadeGiles(thisCharacterToneless, thisCharacterTone);
								
								wadeGilesHtmlWord = wadeGilesHtmlWord + "<div class=\"pinyin_" + thisCharacterTone + "\">" + thisWadeGiles + "</div> ";
								
								wadeGilesText = wadeGilesText + thisWadeGiles + " ";
							} // end if addWadeGiles

							if (addHex == true)
							{
								var thisHex = getHex(thisCharacterChinese);
								
								hexHtmlWord = hexHtmlWord + "<div class=\"pinyin_" + thisCharacterTone + "\">" + thisHex + "</div> ";
								
								hexText = hexText + thisHex + " ";
							} // end if addHex

							if (addUnitype == true)
							{
								var thisUnitype = getUnitype(thisCharacterChinese);
								
								unitypeHtmlWord = unitypeHtmlWord + "<div class=\"pinyin_" + thisCharacterTone + "\">" + thisUnitype + "</div> ";
								
								unitypeText = unitypeText + thisUnitype + " ";
							} // end if addUnitype

							
							if (addSyllables == true)
							{
								var thisCharacterSyllable = getSyllable(thisCharacterChinese, thisCharacterToneless);
								
								syllablesHtmlWord = syllablesHtmlWord + thisCharacterSyllable;
							} // end if addSyllables
							
							chineseTextWord = chineseTextWord + thisCharacterChinese;
							pinyinWord = pinyinWord + thisCharacterPinyin + " ";
							
						} // end for every character in the word
						
						
						if (addHangul == true)
						{
							var thisHangulWord = getHangul(thisWord);
							
							var thisHangulWordArray = [];
							
							if (thisHangulWord != "")
							{
								thisHangulWordArray = thisHangulWord.split(" ");
							}
							
							hangulHtmlWord = getHangulHtml(thisHangulWord);
							
							hangulText = hangulText + thisHangulWord + " ";
							
						} // end if addHangul

						if (addTang == true)
						{
							var thisTangWord = getTang(thisWord, pinyinWord);
							
							var thisTangWordArray = [];
							
							if (thisTangWord != "")
							{
								thisTangWordArray = thisTangWord.split(" ");
							}
							
							tangHtmlWord = getTangHtml(thisTangWord);
							
							tangText = tangText + thisTangWord + " ";
							
						} // end if addTang

						if (addJapanese == true)
						{
							var thisJapaneseWord = getJapanese(thisWord, pinyinWord);
							
							var thisJapaneseWordArray = [];
							
							if (thisJapaneseWord != "")
							{
								thisJapaneseWordArray = thisJapaneseWord.split(" ");
							}
							
							japaneseHtmlWord = getJapaneseHtml(thisJapaneseWord);
							
							japaneseText = japaneseText + thisJapaneseWord + " ";
							
						} // end if addJapanese

						if (addVietnamese == true)
						{
							var thisVietnameseWord = getVietnamese(thisWord, pinyinWord);
							
							var thisVietnameseWordArray = [];
							
							if (thisVietnameseWord != "")
							{
								thisVietnameseWordArray = thisVietnameseWord.split(" ");
							}
							
							vietnameseHtmlWord = getVietnameseHtml(thisVietnameseWord);
							
							vietnameseText = vietnameseText + thisVietnameseWord + " ";
							
						} // end if addVietnamese
						
						
						translatedHtml = translatedHtml + " " + "<div class=\"literal\">" + thisDefinition + "</div>";
						
						chineseLength = chineseTextWord.length * 2;
						
						//pinyinText = pinyinText + pinyinWord + " ";
						//pinyinText = pinyinText + pinyinWord;
						pinyinTextWord = pinyinWord;
						
						//translatedText = translatedText + thisDefinition + " ";
						translatedTextWord = thisDefinition;

						//alert(thisTone);
						if (addBopomofo == true)
						{
							chineseHtmlWord = chineseHtmlWord + "</tr></table>";
						}
												
						chineseHtml = chineseHtml + chineseHtmlWord;
						
						if (addSmallSealScript == true)
						{
							smallSealScriptHtml = smallSealScriptHtml + smallSealScriptHtmlWord;
						} // end if addSmallSealScript

						if (addLargeSealScript == true)
						{
							largeSealScriptHtml = largeSealScriptHtml + largeSealScriptHtmlWord;
						} // end if addLargeSealScript

						if (addOracleBones == true)
						{
							oracleBonesHtml = oracleBonesHtml + oracleBonesHtmlWord;
						} // end if addOracleBones
						
						if (addCommon == true)
						{
							if (thisWord != "")
							{							
								if (contains(commonWords,thisWord) == true)
								{
									pinyinHtmlWord = "<b>" + pinyinHtmlWord + "</b>";
								}
							} // end if the word is not blank
						} // end if addCommon
					} else {
						
						// If the word is not blank
						if (thisWord != "")
						{
					
							if (isChineseString(thisWord) == true)
							{
								appendToFile("missingWords.txt", thisWord);
								missingWords = missingWords + thisWord + "\n";
							}
							
							chineseHtml = chineseHtml + "<div class=\"englishInChinese\">" + thisWord + "</div>";
							pinyinHtmlWord = pinyinHtmlWord + "<div class=\"englishInChinese\">" + thisWord + "</div>";
							translatedHtml = translatedHtml + thisWord;

							chineseTextWord = thisWord;
							pinyinTextWord = thisWord;
							translatedTextWord = thisWord;
							
							chineseLength = thisWord.length;
							
							if (addSimplified == true)
							{
								simplifiedHtmlWord = thisSimplifiedWord;
							} // end if addSimplified
							
							if (addWadeGiles == true)
							{
								wadeGilesHtmlWord = wadeGilesHtmlWord + thisWord;
							} // end if addWadeGiles
							
							if (addTaiwanese == true)
							{
								taiwaneseHtmlWord = taiwaneseHtmlWord + thisWord;
							} // end if addTaiwanese
							
							if (addCantonese == true)
							{
								cantoneseHtmlWord = cantoneseHtmlWord + thisWord;
							} // end if addCantonese

							if (addHangul == true)
							{
								hangulHtmlWord = hangulHtmlWord + thisWord;
							} // end if addHangul

							if (addTang == true)
							{
								tangHtmlWord = tangHtmlWord + thisWord;
							} // end if addTang

							if (addJapanese == true)
							{
								japaneseHtmlWord = japaneseHtmlWord + thisWord;
							} // end if addJapanese

							if (addVietnamese == true)
							{
								vietnameseHtmlWord = vietnameseHtmlWord + thisWord;
							} // end if addVietnamese

							
							if (addHex == true)
							{
								var thisWordHex = getHex(thisWord);
								hexHtmlWord = hexHtmlWord + thisWordHex;
								hexText = hexText + thisWordHex + " ";
							} // end if addHex

							if (addUnitype == true)
							{
								var thisWordUnitype = getUnitype(thisWord);
								unitypeHtmlWord = unitypeHtmlWord + thisWordUnitype;
								unitypeText = unitypeText + thisWordUnitype + " ";
							} // end if addHex

							if (addSmallSealScript == true)
							{
								smallSealScriptHtml = smallSealScriptHtml + thisWord;
							} // end if addSmallSealScript

							if (addLargeSealScript == true)
							{
								largeSealScriptHtml = largeSealScriptHtml + thisWord;
							} // end if addLargeSealScript

							if (addOracleBones == true)
							{
								oracleBonesHtml = oracleBonesHtml + thisWord;
							} // end if addOracleBones

						} // end if the word is not blank

					} // end if the dictionary contains the word already
					
					
					// There is a space between each word
					chineseHtml = chineseHtml + "</td><td>";
					pinyinHtml = pinyinHtml + pinyinHtmlWord + "</td><td>";						
					translatedHtml = translatedHtml + "</td><td>";						
					
					if (addSyllables == true)
					{
						syllablesHtml = syllablesHtml + syllablesHtmlWord + "</td><td>";						
					}
					
					if (addSimplified == true)
					{
						simplifiedHtml = simplifiedHtml + simplifiedHtmlWord+ "</td><td>";
					} // end if addSimplified
					
					if (addWadeGiles == true)
					{
						wadeGilesHtml = wadeGilesHtml + wadeGilesHtmlWord+ "</td><td>";
						wadeGilesText = wadeGilesText + "  ";
					} // end if addWadeGiles

					if (addTaiwanese == true)
					{
						taiwaneseHtml = taiwaneseHtml + taiwaneseHtmlWord+ "</td><td>";
						taiwaneseText = taiwaneseText + "  ";
					} // end if addTaiwanese
					
					if (addCantonese == true)
					{
						cantoneseHtml = cantoneseHtml + cantoneseHtmlWord+ "</td><td>";
						cantoneseText = cantoneseText + "  ";
					} // end if addCantonese

					if (addHangul == true)
					{
						hangulHtml = hangulHtml + hangulHtmlWord+ "</td><td>";
						hangulText = hangulText + "  ";
					} // end if addHangul

					if (addTang == true)
					{
						tangHtml = tangHtml + tangHtmlWord+ "</td><td>";
						tangText = tangText + "  ";
					} // end if addTang

					if (addJapanese == true)
					{
						japaneseHtml = japaneseHtml + japaneseHtmlWord+ "</td><td>";
						japaneseText = japaneseText + "  ";
					} // end if addJapanese

					if (addVietnamese == true)
					{
						vietnameseHtml = vietnameseHtml + vietnameseHtmlWord+ "</td><td>";
						vietnameseText = vietnameseText + "  ";
					} // end if addVietnamese
					
					if (addHex == true)
					{
						hexHtml = hexHtml + hexHtmlWord+ "</td><td>";
					} // end if addHex

					if (addUnitype == true)
					{
						unitypeHtml = unitypeHtml + unitypeHtmlWord+ "</td><td>";
					} // end if addUnitype

					if (addSmallSealScript == true)
					{
						smallSealScriptHtml = smallSealScriptHtml + "</td><td>";
					} // end if addSmallSealScript

					if (addLargeSealScript == true)
					{
						largeSealScriptHtml = largeSealScriptHtml + "</td><td>";
					} // end if addLargeSealScript

					if (addOracleBones == true)
					{
						oracleBonesHtml = oracleBonesHtml + "</td><td>";
					} // end if addOracleBones
					
					//pinyinTextWord = pinyinTextWord + " ";
					//translatedTextWord = translatedTextWord + " ";
					
					if (monospaceText == true)
					{
						//var chineseLength = chineseTextWord.length * 2;
						//var chineseLength = chineseTextWord.length;
						var pinyinLength = pinyinTextWord.length;
						var translatedLength = translatedTextWord.length;
						
						//debugLog("thisWord" + thisWord);
						
						//var chineseUnspaced = replaceChars(chineseTextWord, " ", "");
						//var chineseUnspacedLength = chineseUnspaced.length;
						//var chineseSpacesLength = chineseLength - chineseUnspacedLength;
						// Because of Unicode weirdness, Chinese characters take up 2x monospaced size
						//chineseUnspacedLength = chineseUnspacedLength * 2;
						//chineseLength = chineseUnspacedLength + chineseSpacesLength;
						
						
						var longestLength = chineseLength;

						if (pinyinLength > longestLength)
						{
							longestLength = pinyinLength;
						}

						if (translatedLength > longestLength)
						{
							longestLength = translatedLength;
						}
						
						longestLength = longestLength + 1;
						
						chineseTextWord = pad(chineseTextWord, chineseLength, longestLength);
						pinyinTextWord = pad(pinyinTextWord, pinyinLength, longestLength);
						translatedTextWord = pad(translatedTextWord, translatedLength, longestLength);
						
						chineseText = chineseText + chineseTextWord;
						pinyinText = pinyinText + pinyinTextWord;
						translatedText = translatedText + translatedTextWord;

					} else {
						chineseText = chineseText + chineseTextWord + " ";
						pinyinText = pinyinText + pinyinTextWord + "	";
						translatedText = translatedText + translatedTextWord + "	";
					}
					
				} // end for every word
				
				
				/* Lines to text */
				
				if (addChinesePlain == true)
				{
					outputText = outputText + chinesePlainLine + "\n";
				}

				if (addChineseSpaced == true)
				{
					outputText = outputText + chineseSpacedLine + "\n";
				}

				if (addSimplified == true)
				{
					outputText = outputText + simplifiedLine + "\n";
				} // end if addSimplified

				if (addHangul == true)
				{
					outputText = outputText + hangulText + "\n";
				} // end if addHangul
				
				if (addChinese == true)
				{
					outputText = outputText + chineseText + "\n";
				}
				
				if (addPinyin == true)
				{
					outputText = outputText + pinyinText + "\n";
				}
				
				if (addLitMan == true)
				{
					if (litManLine != undefined)
					{
						outputText = outputText + litManLine + "\n";
					}
				} // end if litMan
				
				if (addTaiwanese == true)
				{
					outputText = outputText + taiwaneseText + "\n";
				} // end if addTaiwanese
				
				if (addCantonese == true)
				{
					outputText = outputText + cantoneseText + "\n";
				} // end if addCantonese
				
				if (addTang == true)
				{
					outputText = outputText + tangText + "\n";
				} // end if addTang

				if (addJapanese == true)
				{
					outputText = outputText + japaneseText + "\n";
				} // end if addJapanese

				if (addVietnamese == true)
				{
					outputText = outputText + vietnameseText + "\n";
				} // end if addVietnamese
				
				if (addWadeGiles == true)
				{
					outputText = outputText + wadeGilesText + "\n";
				} // end if addWadeGiles
				
				if (addHex == true)
				{
					outputText = outputText + hexText + "\n";
				} // end if addHex

				if (addUnitype == true)
				{
					outputText = outputText + unitypeText + "\n";
				} // end if adUnitype

				
				if (addLiteral == true)
				{
					outputText = outputText + translatedText + "\n";
				}
				
				if (addEnglish == true)
				{
					outputText = outputText + englishLine + "\n";
				}
				
				outputText = outputText + "\n";
				
				
				/* Lines to HTML */
				
				outputHtml = outputHtml + "<p>";
				
				if (addChinesePlain == true)
				{
					outputHtml = outputHtml + "<div class=\"chinesePlain\">" + chinesePlainLine + "</div>";
				}

				if (addChineseSpaced == true)
				{
					outputHtml = outputHtml + "<div class=\"chineseSpaced\">" + chineseSpacedLine + "</div>";
				}
				
				outputHtml = outputHtml + "<table>";
				
				if (addOracleBones == true)
				{
					outputHtml = outputHtml + "<tr><td>" + oracleBonesHtml + "</td></tr>";
				} // end if addOracleBones
				
				if (addLargeSealScript == true)
				{
					outputHtml = outputHtml + "<tr><td>" + largeSealScriptHtml + "</td></tr>";
				} // end if addLargeSealScript

				if (addSmallSealScript == true)
				{
					outputHtml = outputHtml + "<tr><td>" + smallSealScriptHtml + "</td></tr>";
				} // end if addSealScript

				if (addChinese == true)
				{
					outputHtml = outputHtml + "<tr class=\"chineseLine\"><td>" + chineseHtml + "</td></tr>";
				}

				if (addSimplified == true)
				{
					outputHtml = outputHtml + "<tr><td>" + simplifiedHtml + "</td></tr>";
				} // end if addSimplified

				if (addHangul ==  true)
				{
					outputHtml = outputHtml + "<tr><td>" + hangulHtml + "</td></tr>";
				}
				
				if (addSyllables == true)
				{
					outputHtml = outputHtml + "<tr><td>" + syllablesHtml + "</td></tr>";
				} // end if addSyllables
								
				if (addPinyin == true)
				{
					outputHtml = outputHtml + "<tr class=\"pinyinLine\"><td>" + pinyinHtml + "</td></tr>";
				}

				if (addWadeGiles == true)
				{
					outputHtml = outputHtml + "<tr><td>" + wadeGilesHtml + "</td></tr>";
				} // end if addWadeGiles

				if (addLitMan == true)
				{
					if (litManLine != undefined)
					{
						var litManHtml = "<tr><td>" + replaceChars(litManLine, " ", "</td><td>") + "</td></tr>";
						outputHtml = outputHtml + litManHtml + "\n";
					}
				} // end if litMan

				if (addTaiwanese ==  true)
				{
					outputHtml = outputHtml + "<tr class=\"taiwaneseLine\"><td>" + taiwaneseHtml + "</td></tr>";
				}
				
				if (addCantonese ==  true)
				{
					outputHtml = outputHtml + "<tr><td>" + cantoneseHtml + "</td></tr>";
				}

				if (addTang ==  true)
				{
					outputHtml = outputHtml + "<tr><td>" + tangHtml + "</td></tr>";
				}

				if (addJapanese ==  true)
				{
					outputHtml = outputHtml + "<tr><td>" + japaneseHtml + "</td></tr>";
				}

				if (addVietnamese ==  true)
				{
					outputHtml = outputHtml + "<tr><td>" + vietnameseHtml + "</td></tr>";
				}

				if (addHex == true)
				{
					outputHtml = outputHtml + "<tr><td>" + hexHtml + "</td></tr>";
				} // end if addHex

				if (addUnitype == true)
				{
					outputHtml = outputHtml + "<tr><td>" + unitypeHtml + "</td></tr>";
				} // end if addUnitype
				
				if (addLiteral == true)
				{
					outputHtml = outputHtml + "<tr class=\"literalLine\"><td>" + translatedHtml + "</td></tr>";
				} // end if addLiteral

				outputHtml = outputHtml + "</table>\n";

				if (addEnglish == true)
				{
					outputHtml = outputHtml + "<div class=\"english\">" + englishLine + "</div>\n";
				} // end if addEnglish
				
				outputHtml = outputHtml + "</p>";
				
				if (addPageBreaks == true)
				{
					if ((currentLine % pageBreaksLine) == (pageBreaksLine - 1))
					{
						outputHtml = outputHtml + "<br></br>" + "<br></br>";
					}
				} // end if addPageBreaks
				
			} // end for every line
						
			//showMissingWords(missingWords);
			
			return [outputHtml, outputText];
			
		} // end function translateText


// On startup

console.log('Listening on port 5373');

loadDictionary("../PinyinDefinitionsTonesSorted.txt");
loadRadicals("../radicals.txt");
