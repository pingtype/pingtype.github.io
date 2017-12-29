(function($) {

  // Start the plugin code
  $.fn.pinyin = function(parameter) {

    // The element reference
    var element = $(this);
    
    // Asterisks determine the position of the accent in pīnyīn vowel clusters
    var accentsMap = {
        iao: 'ia*o', uai: 'ua*i',
        ai: 'a*i', ao: 'a*o', ei: 'e*i', ia: 'ia*',  ie: 'ie*',
        io: 'io*', iu: 'iu*', Ai: 'A*i', Ao: 'A*o', Ei: 'E*i',
        ou: 'o*u', ua: 'ua*',  ue: 'ue*', ui: 'ui*', uo: 'uo*',
        ve: 'üe*', Ou: 'O*u', 
        a: 'a*', e: 'e*', i: 'i*', o: 'o*', u: 'u*', v: 'v*',
        A: 'A*', E: 'E*', O: 'O*'
    };        
    
    // Vowels to replace with their accented froms
    var vowels = ['a*','e*','i*','o*','u*','v*','A*','E*','O*'];
    
    // Accented characters for each of the four tones
    var pinyin = {
        1: ['ā','ē','ī','ō','ū','ǖ','Ā','Ē','Ī','Ō'],
        2: ['á','é','í','ó','ú','ǘ','Á','É','Í','Ó'],
        3: ['ǎ','ě','ǐ','ǒ','ǔ','ǚ','Ǎ','Ě','Ǐ','Ǒ'],
        4: ['à','è','ì','ò','ù','ǜ','À','È','Ì','Ò']
    };
    
    // The replacer function
    var pinyinReplace = function(match) {
    
        // Extract the tone number from the match
        var toneNumber = match.substr(-1, 1);
        
        // Extract just the syllable
        var word = match.substring(0, match.indexOf(toneNumber));
        
        // Put an asterisk inside of the first found vowel cluster
        for (var val in accentsMap) {
            if (word.search(val) != -1) {
                word = word.replace(new RegExp(val), accentsMap[val])
                break;
            }
        }
      
        // Replace the asterisk’d vowel with an accented character          
        for (i=0; i<10; i++)
            word = word.replace(vowels[i], pinyin[toneNumber][i]);
        
        // Return the result
        return word;
        
    }

    // Plugin initialisation
    var init = function() {
      
      // Bind a function to the keyup event for the attached element
      // element.bind('keyup', function(e) {
      
      //     // Get the pressed key code
      //     var code = (e.keyCode ? e.keyCode : e.which);
          
      //     // Do stuff if it’s a space or one of the tone numbers (1-4)
      //     if (code == 32 || code == 49 || code == 50 || code == 51 || code == 52) {
          
      //         // Get the value of the field
      //         var inputText = $(this).val();
              
      //         // Run the replacer function for each numeric pīnyīn string match
      //         inputText = inputText.replace(/([a-zA-Z]+)([1-5])/g, pinyinReplace);
      
      //         // Update the text field value
      //         $(this).val(inputText);
      //     }                 
      // });

      // Bind a function to the keyup event for the attached element
      element.bind('keypress', function(e) {    
        // Get the pressed key code
        var code = (e.keyCode ? e.keyCode : e.which);

        // Do stuff if it’s a space or one of the tone numbers (1-4)
        if (code == 49 || code == 50 || code == 51 || code == 52) {

            // Get the value of the field
            var inputText = $(this).val() + String.fromCharCode(code);

            // Run the replacer function for each numeric pīnyīn string match
            inputText = inputText.replace(/([a-zA-Z]+)([1-5])/g, pinyinReplace);

            // Update the text field value
            $(this).val(inputText);
            return false;
        } 
      });
        
    };
    
    init();
  }      
})(jQuery);