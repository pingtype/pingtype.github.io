import sys
from googletrans import Translator

translator = Translator()

line = sys.argv[1]
translation = translator.translate(line, src="en", dest='zh-tw')
chinese = translation.text.encode('utf-8')
print chinese
