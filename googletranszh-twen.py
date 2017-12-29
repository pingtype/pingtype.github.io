import sys
from googletrans import Translator

translator = Translator()

line = sys.argv[1]
translation = translator.translate(line, src="zh-tw", dest='en')
english = translation.text.encode('utf-8')
print english
