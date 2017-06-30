
acme.namespace('acme.utils');acme.utils.HttpGet=function(url,okCallback,failCallback,progressCallback)
{if(!failCallback)
failCallback=acme.utils.DefaultFailCallback;var request=acme.utils.CreateXMLHttpRequest();request.open('GET',url,true);var clientData={okCallback:okCallback,failCallback:failCallback,progressCallback:progressCallback,prevProgressReport:null};request.onreadystatechange=acme.utils.Partial(acme.utils.HttpRequestChecker,request,clientData);request.send(null);}
acme.utils.HttpPost=function(url,contentType,content,okCallback,failCallback,progressCallback)
{if(!contentType)
contentType='application/x-www-form-urlencoded';if(!failCallback)
failCallback=acme.utils.DefaultFailCallback;var request=acme.utils.CreateXMLHttpRequest();request.open('POST',url,true);var clientData={okCallback:okCallback,failCallback:failCallback,progressCallback:progressCallback,prevProgressReport:null};request.onreadystatechange=acme.utils.Partial(acme.utils.HttpRequestChecker,request,clientData);request.setRequestHeader('Content-Type',contentType);request.send(content);}
acme.utils.HttpPostMultipart=function(url,okCallback,failCallback,progressCallback,name1,filename1,data1,name2,filename2,data2,name3,filename3,data3,name4,filename4,data4,name5,filename5,data5,name6,filename6,data6,name7,filename7,data7,name8,filename8,data8,name9,filename9,data9,name10,filename10,data10)
{var boundary=acme.utils.RandomBoundary(20);var content='';function AddPart(name,filename,data)
{content+='--'+boundary+'\r\n';content+='Content-Disposition: form-data; name="'+name+'"';if(filename)
content+='; filename="'+filename+'"';content+='\r\n';if(filename)
content+='Content-Transfer-Encoding: base64\r\n';content+='\r\n';content+=data;content+='\r\n';}
if(name1&&data1)
{AddPart(name1,filename1,data1)
if(name2&&data2)
{AddPart(name2,filename2,data2)
if(name3&&data3)
{AddPart(name3,filename3,data3)
if(name4&&data4)
{AddPart(name4,filename4,data4)
if(name5&&data5)
{AddPart(name5,filename5,data5)
if(name6&&data6)
{AddPart(name6,filename6,data6)
if(name7&&data7)
{AddPart(name7,filename7,data7)
if(name8&&data8)
{AddPart(name8,filename8,data8)
if(name9&&data9)
{AddPart(name9,filename9,data9)
if(name10&&data10)
AddPart(name10,filename10,data10)}}}}}}}}}
content+='--'+boundary+'--\r\n';acme.utils.HttpPost(url,'multipart/form-data; boundary="'+boundary+'"',content,okCallback,failCallback,progressCallback);}
acme.utils.RandomBoundary=function(n)
{var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';var str='';for(var i=0;i<n;++i)
str+=chars.charAt(acme.utils.RandInt(0,chars.length-1));return str;}
acme.utils.HttpRequestChecker=function(request,clientData)
{if(request.readyState==4)
if(request.status==200)
{if(clientData.okCallback)
clientData.okCallback(request);}
else
{if(clientData.failCallback)
clientData.failCallback(request);}
else
{if(clientData.progressCallback)
{var now=new Date();if(clientData.prevProgressReport===null||now.getTime()-clientData.prevProgressReport.getTime()>=250)
{if(request.responseText.length>0)
{var cl=null;try
{cl=request.getResponseHeader('content-length');}
catch(e)
{}
var progress;if(cl)
progress=Math.round(request.responseText.length*100/cl)+'%';else
progress=request.responseText.length+' bytes';clientData.progressCallback(request,progress);}
clientData.prevProgressReport=now;}}}}
acme.utils.DefaultFailCallback=function(request)
{if(request===null||request===undefined)
alert('XMLHttpRequest create failed!');else
alert('XML fetch failed! ('+request.status+' '+request.statusText+')');}
acme.utils.CreateXMLHttpRequest=function()
{var r;try
{r=new XMLHttpRequest();}
catch(e1)
{try
{r=new ActiveXObject('Microsoft.XMLHTTP');}
catch(e2)
{try
{r=new ActiveXObject('Msxml2.XMLHTTP');}
catch(e2)
{r=null;}}}
return r;}
acme.utils.HttpGetProxy=function(url,okCallback,failCallback,progressCallback)
{if(url.substring(0,7)=='http://')
{var host=url.substring(7);var slash=host.indexOf('/');if(slash!=-1)
host=host.substring(0,slash);if(host!=location.host)
url='/resources/proxy.cgi?url='+encodeURIComponent(url);}
acme.utils.HttpGet(url,okCallback,failCallback,progressCallback);}
acme.utils.JsonGet=function(url,okCallback,failCallback)
{}
acme.utils.ParseXml=function(string)
{if(typeof window.DOMParser!="undefined")
return(new window.DOMParser()).parseFromString(string,"text/xml");else if(typeof window.ActiveXObject!="undefined")
{var dom=new window.ActiveXObject("Microsoft.XMLDOM");dom.async="false";dom.loadXML(string);return dom;}
else
return null;}
acme.utils.CopyAttributes=function(from,to)
{if(from)
{if(!to)
to={};for(var name in from)
{if(name=='style')
{if(!to.style)
to.style={};for(var styleName in from.style)
to.style[styleName]=from.style[styleName];}
else
to[name]=from[name];}}}
acme.utils.CopyDom=function(from,to)
{function CopyDomInternal(from,to)
{if(from.nodeValue!==null&&from.nodeValue!==undefined)
to.nodeValue=from.nodeValue;if(from.attributes)
{for(var i=0;i<from.attributes.length;++i)
{to.setAttribute(from.attributes[i].nodeName,from.attributes[i].value);}}
if(from.childNodes)
{for(var i=0;i<from.childNodes.length;++i)
{var fromChild=from.childNodes[i];var toChild=document.createElement(fromChild.nodeName);to.appendChild(toChild);CopyDomInternal(fromChild,toChild);}}}
acme.utils.ClearElement(to);acme.utils.ClearAttributes(to);if(from.nodeName!=to.nodeName)
{var to2=document.createElement(from.nodeName);to.appendChild(to2);to=to2}
CopyDomInternal(from,to);}
acme.utils.XMLtoJS=function(node)
{var object={};if(node.nodeValue!==null&&node.nodeValue!==undefined)
object=node.nodeValue;if(node.attributes)
for(var i=0;i<node.attributes.length;++i)
object[node.attributes[i].nodeName]=node.attributes[i].value;if(node.childNodes)
{for(var i=0;i<node.childNodes.length;++i)
{var n=node.childNodes[i].nodeName;if(object[n]===undefined)
object[n]=[];object[n].push(acme.utils.XMLtoJS(node.childNodes[i]));}
for(var n in object)
if(acme.utils.IsArray(object[n])&&object[n].length==1)
object[n]=object[n][0];}
if(object['#text'])
{object.TEXT=object['#text'];delete object['#text'];}
else if(object['#cdata-section'])
{object.TEXT=object['#cdata-section'];delete object['#cdata-section'];}
return object;}
acme.utils.IsEmpty=function(obj)
{for(var i in obj)
return false;return true;}
acme.utils.IsArray=function(obj)
{return obj.constructor==Array;}
acme.utils.ForceArray=function(obj)
{if(obj===null||obj===undefined)
return[];else if(acme.utils.IsArray(obj))
return obj;else
return[obj];}
acme.utils.PrettyPrintXML=function(tree)
{var NT_ELEMENT_NODE=1;var NT_ATTRIBUTE_NODE=2;var NT_TEXT_NODE=3;var NT_CDATA_SECTION_NODE=4;var NT_ENTITY_REFERENCE_NODE=5;var NT_ENTITY_NODE=6;var NT_PROCESSING_INSTRUCTION_NODE=7;var NT_COMMENT_NODE=8;var NT_DOCUMENT_NODE=9;var NT_DOCUMENT_TYPE_NODE=10;var NT_DOCUMENT_FRAGMENT_NODE=11;var NT_NOTATION_NODE=12;var html='';var nest=0;html+='<code><pre>';html+='&lt;?xml version="1.0"?&gt;\n';function PrettyPrintIndent()
{for(var i=0;i<nest;++i)
html+='  ';}
function PrettyPrintNode(node)
{switch(node.nodeType)
{case NT_ELEMENT_NODE:PrettyPrintIndent();html+='&lt;'+node.nodeName;if(node.attributes)
for(var i=0;i<node.attributes.length;++i)
html+=' '+node.attributes[i].nodeName+'="'+node.attributes[i].value+'"';if(node.childNodes&&node.childNodes.length>0)
{html+='&gt;';if(node.childNodes.length>1||node.childNodes[0].nodeType==NT_ELEMENT_NODE)
html+='\n';++nest;for(var i=0;i<node.childNodes.length;++i)
PrettyPrintNode(node.childNodes[i]);--nest;if(node.childNodes.length>1||node.childNodes[0].nodeType==NT_ELEMENT_NODE)
PrettyPrintIndent();html+='&lt;/'+node.nodeName+'&gt;';}
else
html+=' /&gt;';html+='\n';break;case NT_TEXT_NODE:if(node.nodeValue!='\n')
html+=acme.utils.QuoteHtml(node.nodeValue);break;case NT_CDATA_SECTION_NODE:html+='&lt;![CDATA['+acme.utils.QuoteHtml(node.nodeValue)+']]&gt;';break;case NT_COMMENT_NODE:html+='&lt;!--'+acme.utils.QuoteHtml(node.nodeValue)+'--&gt;';break;html+='[[UNKNOWN XML NODE TYPE '+node.nodeType+']]';}}
PrettyPrintNode(tree);html+='</pre></code>';return html;}
acme.utils.GetXmlText=function(element)
{var value='';var child=element.firstChild;while(child)
{if(value!='')
value+=' ';value+=child.nodeValue;child=child.nextSibling;}
return value;}
acme.utils.GetXmlValue=function(elements)
{var values='';for(var i=0;i<elements.length;++i)
{if(elements[i]&&elements[i].firstChild)
{if(values!='')
values+=' ';values+=elements[i].firstChild.nodeValue;}}
return values;}
acme.utils.getElementById=function(element,id)
{if(element.id==id)
return element;var child=element.firstChild;while(child)
{var rv=acme.utils.getElementById(child,id);if(rv)
return rv;child=child.nextSibling;}
return null;}
acme.utils.getElementsByName=function(element,name)
{var elements=[];if(element.getAttribute&&element.getAttribute('name')==name)
elements.push(element);var child=element.firstChild;while(child)
{var rv=acme.utils.getElementsByName(child,name);for(var i in rv)
elements.push(rv[i]);child=child.nextSibling;}
return elements;}
acme.utils.FindChildNamed=function(element,name)
{var child=element.firstChild;while(child)
{if(child.nodeName==name)
return child;child=child.nextSibling;}
return null;}
acme.utils.FindDeepChildNamed=function(element,name)
{if(element.nodeName==name)
return element;var child=element.firstChild;while(child)
{var d=acme.utils.FindDeepChildNamed(child,name);if(d)
return d;child=child.nextSibling;}
return null;}
acme.utils.CountNodes=function(element)
{var count=1;var child=element.firstChild;while(child)
{count+=acme.utils.CountNodes(child);child=child.nextSibling;}
return count;}
acme.utils.SaveCookie=function(cookieName,cookieValue)
{var endOfTime='Fri, 01-Jan-2038 00:00:00 GMT';try
{localStorage[cookieName]=cookieValue;}
catch(e)
{}
document.cookie=cookieName+'='+encodeURIComponent(cookieValue)+'; path=/; expires='+endOfTime;}
acme.utils.ClearCookie=function(cookieName)
{var beginningOfTime='Thu, 01-Jan-1970 00:00:00 GMT';try
{delete localStorage[cookieName];}
catch(e)
{}
document.cookie=cookieName+'=; path=/; expires='+beginningOfTime;}
acme.utils.GetCookie=function(cookieName)
{try
{var value=localStorage[cookieName];if(value)
return value;}
catch(e)
{}
if(document.cookie.length>0)
{var cookieNameEq=cookieName+'=';var cookies=document.cookie.split(';');for(var i=0;i<cookies.length;++i)
{while(cookies[i].charAt(0)==' ')
cookies[i]=cookies[i].substr(1);if(cookies[i].indexOf(cookieNameEq)==0)
return decodeURIComponent(cookies[i].substr(cookieNameEq.length));}}
return null;}
acme.utils.SaveHash=function(hash)
{var hashStr='#'+hash;if(history&&history.replaceState)
history.replaceState({},'',hashStr);else
location.hash=hashStr;}
acme.utils.GetHash=function()
{var hashStr=location.hash;if(hashStr.charAt(0)=='#')
hashStr=hashStr.substr(1);return hashStr;}
acme.utils.EntityToIso8859=function(inStr)
{var outStr='';for(var i=0;i<inStr.length;++i)
{var c=inStr.charAt(i);if(c!='&')
outStr+=c;else
{var semi=inStr.indexOf(';',i);if(semi==-1)
outStr+=c;else
{var entity=inStr.substring(i+1,semi);if(entity=='iexcl')outStr+='\xa1';else if(entity=='copy')outStr+='\xa9';else if(entity=='laquo')outStr+='\xab';else if(entity=='reg')outStr+='\xae';else if(entity=='deg')outStr+='\xb0';else if(entity=='raquo')outStr+='\xbb';else if(entity=='iquest')outStr+='\xbf';else if(entity=='Agrave')outStr+='\xc0';else if(entity=='Aacute')outStr+='\xc1';else if(entity=='Acirc')outStr+='\xc2';else if(entity=='Atilde')outStr+='\xc3';else if(entity=='Auml')outStr+='\xc4';else if(entity=='Aring')outStr+='\xc5';else if(entity=='AElig')outStr+='\xc6';else if(entity=='Ccedil')outStr+='\xc7';else if(entity=='Egrave')outStr+='\xc8';else if(entity=='Eacute')outStr+='\xc9';else if(entity=='Ecirc')outStr+='\xca';else if(entity=='Euml')outStr+='\xcb';else if(entity=='Igrave')outStr+='\xcc';else if(entity=='Iacute')outStr+='\xcd';else if(entity=='Icirc')outStr+='\xce';else if(entity=='Iuml')outStr+='\xcf';else if(entity=='Ntilde')outStr+='\xd1';else if(entity=='Ograve')outStr+='\xd2';else if(entity=='Oacute')outStr+='\xd3';else if(entity=='Ocirc')outStr+='\xd4';else if(entity=='Otilde')outStr+='\xd5';else if(entity=='Ouml')outStr+='\xd6';else if(entity=='Oslash')outStr+='\xd8';else if(entity=='Ugrave')outStr+='\xd9';else if(entity=='Uacute')outStr+='\xda';else if(entity=='Ucirc')outStr+='\xdb';else if(entity=='Uuml')outStr+='\xdc';else if(entity=='Yacute')outStr+='\xdd';else if(entity=='szlig')outStr+='\xdf';else if(entity=='agrave')outStr+='\xe0';else if(entity=='aacute')outStr+='\xe1';else if(entity=='acirc')outStr+='\xe2';else if(entity=='atilde')outStr+='\xe3';else if(entity=='auml')outStr+='\xe4';else if(entity=='aring')outStr+='\xe5';else if(entity=='aelig')outStr+='\xe6';else if(entity=='ccedil')outStr+='\xe7';else if(entity=='egrave')outStr+='\xe8';else if(entity=='eacute')outStr+='\xe9';else if(entity=='ecirc')outStr+='\xea';else if(entity=='euml')outStr+='\xeb';else if(entity=='igrave')outStr+='\xec';else if(entity=='iacute')outStr+='\xed';else if(entity=='icirc')outStr+='\xee';else if(entity=='iuml')outStr+='\xef';else if(entity=='ntilde')outStr+='\xf1';else if(entity=='ograve')outStr+='\xf2';else if(entity=='oacute')outStr+='\xf3';else if(entity=='ocirc')outStr+='\xf4';else if(entity=='otilde')outStr+='\xf5';else if(entity=='ouml')outStr+='\xf6';else if(entity=='oslash')outStr+='\xf8';else if(entity=='ugrave')outStr+='\xf9';else if(entity=='uacute')outStr+='\xfa';else if(entity=='ucirc')outStr+='\xfb';else if(entity=='uuml')outStr+='\xfc';else if(entity=='yacute')outStr+='\xfd';else if(entity=='yuml')outStr+='\xff';else if(entity=='nbsp')outStr+=' ';else if(entity=='lt')outStr+='<';else if(entity=='gt')outStr+='>';else if(entity=='amp')outStr+='&';else outStr+='&'+entity+';';i+=entity.length+1;}}}
return outStr;}
acme.utils.DeEntityize=function(inStr)
{var outStr='';for(var i=0;i<inStr.length;++i)
{var c=inStr.charAt(i);if(c!='&')
outStr+=c;else
{var semi=inStr.indexOf(';',i);if(semi!=-1)
i=semi;}}
return outStr;}
acme.utils.DeElementize=function(inStr)
{var outStr='';for(var i=0;i<inStr.length;++i)
{var c=inStr.charAt(i);if(c!='<')
outStr+=c;else
{var gt=inStr.indexOf('>',i);if(gt!=-1)
i=gt;}}
return outStr;}
acme.utils.DeHtmlize=function(str)
{return acme.utils.DeEntityize(acme.utils.EntityToIso8859(acme.utils.DeElementize(str)));}
acme.utils.QuoteHtml=function(inStr)
{var outStr='';for(var i=0;i<inStr.length;++i)
{var c=inStr.charAt(i);switch(c)
{case'<':outStr+='&lt;';break;case'>':outStr+='&gt;';break;case'&':outStr+='&amp;';break;default:outStr+=c;break;}}
return outStr;}
acme.utils.MakeCaller=function(func,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10)
{if(arg1===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg2===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg3===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg4===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg5===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,arg4,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg6===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,arg4,arg5,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg7===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,arg4,arg5,arg6,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg8===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,arg4,arg5,arg6,arg7,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg9===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg10===undefined)
return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};return function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};}
acme.utils.MakeEventCaller=function(func,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10)
{if(arg1===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg2===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg3===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg4===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg5===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,arg4,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg6===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,arg4,arg5,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg7===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,arg4,arg5,arg6,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg8===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,arg4,arg5,arg6,arg7,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg9===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};if(arg10===undefined)
return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};return function(e,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10){return func(e,arg1,arg2,arg3,arg4,arg5,arg6,arg7,arg8,arg9,arg10,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);};}
acme.utils.Partial=function()
{var partialArgs=arguments;var func=partialArgs[0];return function()
{var funcArgs=[];for(var i=1,j=0;i<partialArgs.length||j<arguments.length;++i)
if(partialArgs[i]===undefined)
funcArgs.push(arguments[j++]);else
funcArgs.push(partialArgs[i]);return func.apply(func,funcArgs);};}
acme.utils.Associatize=function(array,fieldName)
{var convertedArray=[];for(var i in array)
convertedArray[array[i][fieldName]]=array[i]
return convertedArray;}
acme.utils.GetEvent=function(e)
{if(e)
return e;if(event)
return event;if(window.event)
return window.event;return null;}
acme.utils.GetQuery=function()
{return location.search.substring(1,location.search.length);}
acme.utils.SplitParameters=function(str)
{if(!str)
return{};var namevals=str.split('&');var params=[];for(var i=0;i<namevals.length;++i)
{var nameval=namevals[i].split('=');if(nameval.length==2)
params[nameval[0]]=decodeURIComponent(nameval[1].replace(/\+/g,' '));}
return params;}
acme.utils.GetParameters=function()
{return acme.utils.SplitParameters(acme.utils.GetQuery());}
acme.utils.ForceHttps=function()
{if(location.protocol!='https:')
{location.replace(location.href.replace(/^[^:]*:/,'https:'));return true;}
return false;}
acme.utils.Substitute=function(str,from,to)
{var fromLen=from.length;var newStr='';while(str.length>0)
{if(str.substr(0,fromLen)==from)
{newStr+=to;str=str.substr(fromLen);}
else
{newStr+=str.charAt(0);str=str.substr(1);}}
return newStr;}
acme.utils.Trim=function(str)
{while(str.length>0&&acme.utils.IsWhiteSpace(str.charAt(0)))
str=str.substr(1);while(str.length>0&&acme.utils.IsWhiteSpace(str.charAt(str.length-1)))
str=str.substr(0,str.length-1);return str;}
acme.utils.IsWhiteSpace=function(c)
{if(c==' '||c=='\t'||c=='\n')
return true;return false;}
acme.utils.Props=function(o)
{var s='';for(var p in o)
{if(s.length!=0)
s+='\n';s+=p+': '+o[p];}
return s;}
acme.utils.GetElementXY=function(element)
{var borderLeft=+element.style.borderLeftWidth.substr(0,element.style.borderLeftWidth.length-2);var borderTop=+element.style.borderTopWidth.substr(0,element.style.borderTopWidth.length-2);var x=0;var y=0;do
{x+=element.offsetLeft;y+=element.offsetTop;element=element.offsetParent;}
while(element);return{x:x+borderLeft,y:y+borderTop};}
acme.utils.GetPageWH=function()
{if(window.innerWidth&&window.innerHeight)
return{w:window.innerWidth,h:window.innerHeight};else if(document.documentElement&&document.documentElement.clientWidth&&document.documentElement.clientHeight)
return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight};else if(document.body)
return{w:document.body.clientWidth,h:document.body.clientHeight};else
return null;}
acme.utils.IsNumeric=function(str)
{if(str===null||str===undefined||str.length==0)
return false;for(var i=0;i<str.length;++i)
if(str.charAt(i)<'0'||str.charAt(i)>'9')
return false;return true;}
acme.utils.ForceStr=function(x)
{return x+'';}
acme.utils.ForceNum=function(x)
{return x-0;}
acme.utils.Commaize=function(n)
{var s=acme.utils.ForceStr(n);var l=s.length;if(l<=3)
return s;return acme.utils.Commaize(s.substring(0,l-3))+','+s.substring(l-3);}
acme.utils.AppendElement=function(parent,elementType,properties)
{var element=document.createElement(elementType);acme.utils.AddProperties(element,properties);parent.appendChild(element);return element;}
acme.utils.InsertElement=function(parent,before,elementType,properties)
{var element=document.createElement(elementType);acme.utils.AddProperties(element,properties);parent.insertBefore(element,before);return element;}
acme.utils.AppendText=function(parent,text)
{var element=document.createTextNode(text);parent.appendChild(element);return element;}
acme.utils.AddProperties=function(element,properties)
{if(properties)
for(var property in properties)
if(property=='style')
for(var nestedProperty in properties[property])
element[property][nestedProperty]=properties[property][nestedProperty];else
element[property]=properties[property];}
acme.utils.ClearElement=function(element)
{while(element.firstChild)
{acme.utils.ClearElement(element.firstChild);element.removeChild(element.firstChild);}}
acme.utils.ClearAttributes=function(element)
{if(element.attributes)
while(element.attributes.length>0)
element.removeAttributeNode(element.attributes[0]);}
acme.utils.DestroyElement=function(element)
{acme.utils.ClearElement(element);if(element.parentNode)
element.parentNode.removeChild(element);}
acme.utils.ElementIsEmpty=function(element)
{return!element.firstChild;}
acme.utils.AddCSSRule=function(selector,styles)
{var styleSheet=document.styleSheets[0];if(styleSheet.insertRule)
styleSheet.insertRule(selector+' { '+styles+'}',styleSheet.cssRules.length)
else if(styleSheet.addRule)
styleSheet.addRule(selector,styles)}
acme.utils.GetComputedStyle=function(element,style)
{var camelStyle=acme.utils.Camelize(style);if(element.currentStyle)
return element.currentStyle[camelStyle];if(window.getComputedStyle)
return window.getComputedStyle(element,null)[camelStyle];return null;}
acme.utils.camelizeTable=[];acme.utils.camelizeTable['background-attachment']='backgroundAttachment';acme.utils.camelizeTable['background-color']='backgroundColor';acme.utils.camelizeTable['background-image']='backgroundImage';acme.utils.camelizeTable['background-position']='backgroundPosition';acme.utils.camelizeTable['background-repeat']='backgroundRepeat';acme.utils.camelizeTable['border-bottom']='borderBottom';acme.utils.camelizeTable['border-bottom-color']='borderBottomColor';acme.utils.camelizeTable['border-bottom-style']='borderBottomStyle';acme.utils.camelizeTable['border-bottom-width']='borderBottomWidth';acme.utils.camelizeTable['border-color']='borderColor';acme.utils.camelizeTable['border-left']='borderLeft';acme.utils.camelizeTable['border-left-color']='borderLeftColor';acme.utils.camelizeTable['border-left-style']='borderLeftStyle';acme.utils.camelizeTable['border-left-width']='borderLeftWidth';acme.utils.camelizeTable['border-right']='borderRight';acme.utils.camelizeTable['border-right-color']='borderRightColor';acme.utils.camelizeTable['border-right-style']='borderRightStyle';acme.utils.camelizeTable['border-right-width']='borderRightWidth';acme.utils.camelizeTable['border-style']='borderStyle';acme.utils.camelizeTable['border-top']='borderTop';acme.utils.camelizeTable['border-top-color']='borderTopColor';acme.utils.camelizeTable['border-top-style']='borderTopStyle';acme.utils.camelizeTable['border-top-width']='borderTopWidth';acme.utils.camelizeTable['border-width']='borderWidth';acme.utils.camelizeTable['font-family']='fontFamily';acme.utils.camelizeTable['font-size']='fontSize';acme.utils.camelizeTable['font-variant']='fontVariant';acme.utils.camelizeTable['font-weight']='fontWeight';acme.utils.camelizeTable['letter-spacing']='letterSpacing';acme.utils.camelizeTable['line-height']='lineHeight';acme.utils.camelizeTable['list-style']='listStyle';acme.utils.camelizeTable['list-style-image']='listStyleImage';acme.utils.camelizeTable['list-style-position']='listStylePosition';acme.utils.camelizeTable['list-style-type']='listStyleType';acme.utils.camelizeTable['margin-bottom']='marginBottom';acme.utils.camelizeTable['margin-left']='marginLeft';acme.utils.camelizeTable['margin-right']='marginRight';acme.utils.camelizeTable['margin-top']='marginTop';acme.utils.camelizeTable['padding-bottom']='paddingBottom';acme.utils.camelizeTable['padding-left']='paddingLeft';acme.utils.camelizeTable['padding-right']='paddingRight';acme.utils.camelizeTable['padding-top']='paddingTop';acme.utils.camelizeTable['page-break-after']='pageBreakAfter';acme.utils.camelizeTable['page-break-before']='pageBreakBefore';acme.utils.camelizeTable['float']='cssFloat';acme.utils.camelizeTable['text-align']='textAlign';acme.utils.camelizeTable['text-decoration']='textDecoration';acme.utils.camelizeTable['text-indent']='textIndent';acme.utils.camelizeTable['text-transform']='textTransform';acme.utils.camelizeTable['vertical-align']='verticalAlign';acme.utils.camelizeTable['z-index']='zIndex';acme.utils.Camelize=function(styleName)
{var camelStyleName=acme.utils.camelizeTable[styleName];if(camelStyleName)
return camelStyleName;else
return styleName;}
acme.utils.SortTable=function(table,columnNumber,compare)
{acme.utils.oldCursor=table.style.cursor;table.style.cursor='wait';setTimeout(acme.utils.Partial(acme.utils.SortTableLater,table,columnNumber,compare),100);}
acme.utils.SortTableLater=function(table,columnNumber,compare)
{var container=table;var child=table.firstChild;while(child)
{if(child.nodeName=='TBODY')
{container=child;break;}
child=child.nextSibling;}
if(compare===null||compare===undefined||compare==false)
compare=function(v1,v2){return v1>v2;};else if(compare==true)
compare=function(v1,v2){return v1<v2;};var rows=[];var row=container.firstChild;while(row)
{if(row.nodeName=='TR')
{var columns=[];var column=row.firstChild;while(column)
{if(column.nodeName=='TD')
columns.push(column);column=column.nextSibling;}
if(columns.length>0)
rows.push(columns);}
row=row.nextSibling;}
for(var i=0;i<rows.length;++i)
{var m=i;for(var j=i+1;j<rows.length;++j)
{var jtd=rows[j][columnNumber-1];var jstr;var jattr=jtd.attributes['value'];if(jattr)
jstr=jattr.value;else
jstr=jtd.innerHTML;var jnum=parseFloat(jstr);var mtd=rows[m][columnNumber-1];var mstr;var mattr=mtd.attributes['value'];if(mattr)
mstr=mattr.value;else
mstr=mtd.innerHTML;mnum=parseFloat(mstr);var r;if(isNaN(jnum)||isNaN(mnum))
r=compare(jstr,mstr);else
r=compare(jnum,mnum);if(r)
m=j;}
if(m!=i)
{var t;for(var k=0;k<rows[i].length;++k)
{t=rows[i][k].innerHTML;rows[i][k].innerHTML=rows[m][k].innerHTML;rows[m][k].innerHTML=t;if(rows[i][k].attributes&&rows[i][k].attributes['value']&&rows[m][k].attributes&&rows[m][k].attributes['value'])
{t=rows[i][k].attributes['value'].value;rows[i][k].attributes['value'].value=rows[m][k].attributes['value'].value;rows[m][k].attributes['value'].value=t;}
t=rows[i][k].className;rows[i][k].className=rows[m][k].className;rows[m][k].className=t;t=rows[i][k].onclick;rows[i][k].onclick=rows[m][k].onclick;rows[m][k].onclick=t;}
t=rows[i].className;rows[i].className=rows[m].className;rows[m].className=t;}}
table.style.cursor=acme.utils.oldCursor;}
acme.utils.instanceOf=function(object,clas)
{while(object)
{if(object==clas.prototype)
return true;object=object.__proto__;}
return false;}
acme.utils.ArrayEvery=function(boolfunc,list)
{for(var i in list)
if(!boolfunc(list[i]))
return false;return true;}
acme.utils.ArraySome=function(boolfunc,list)
{for(var i in list)
if(boolfunc(list[i]))
return true;return false;}
acme.utils.ArrayFilter=function(boolfunc,list)
{var results=[];for(var i in list)
if(boolfunc(list[i]))
results.push(list[i]);return results;}
acme.utils.ArrayForEach=function(func,list)
{for(var i in list)
func(list[i]);}
acme.utils.ArrayMap=function(func,list)
{var results=[];for(var i in list)
results[i]=func(list[i]);return results;}
acme.utils.ArrayReduce=function(func,list,initialValue)
{var i;var result;if(initialValue)
{result=initialValue;i=0;}
else
{result=list[0];i=1;}
for(;i<list.length;++i)
result=func(result,list[i]);return result;}
acme.utils.Range=function(from,to,inc)
{if(inc===null||inc===undefined)
inc=1;if(to===null||to===undefined)
{to=from;from=0;}
inc=Math.abs(inc);var results=[];if(from<=to)
for(var i=from;i<to;i+=inc)
results.push(i);else
for(var i=from;i>to;i-=inc)
results.push(i);return results;}
acme.utils.ArraySearch=function(a,v)
{for(var i in a)
if(a[i]==v)
return i;return null;}
acme.utils.ArrayUniq=function(a,compareFunc)
{var b=[];var first=true;var prevEle;for(var i in a)
{var ele=a[i];if(first||compareFunc(ele,prevEle)!=0)
{b.push(ele);prevEle=ele;first=false;}}
return b;}
acme.utils.MergeObjects=function(o1,o2)
{var o={};if(o1)
for(var i in o1)
if(typeof(o1[i])=='object')
o[i]=acme.utils.MergeObjects({},o1[i]);else
o[i]=o1[i];if(o2)
for(var i in o2)
if(typeof(o2[i])=='object')
if(!o[i])
o[i]=acme.utils.MergeObjects({},o2[i]);else
o[i]=acme.utils.MergeObjects(o[i],o2[i]);else
o[i]=o2[i];return o;}
acme.utils.currentPopup=null;acme.utils.PopUpInternal=function(anchorElement,styles)
{var nonContainers=['AREA','BASE','BR','COL','HR','IMG','INPUT','LINK','META','PARAM','TITLE'];if(acme.utils.ArraySearch(nonContainers,anchorElement.nodeName))
anchorElement=anchorElement.parentNode;acme.utils.PopDown();anchorElement.style.position='relative';var outerDiv=acme.utils.AppendElement(anchorElement,'div',{onclick:acme.utils.NoBubble,style:{position:'relative'}});var innerStyles=acme.utils.MergeObjects({position:'absolute',right:'25px',top:'3px',zIndex:'1000000',backgroundColor:'#ffffff'},styles);var innerDiv=acme.utils.AppendElement(outerDiv,'div',{style:innerStyles});acme.utils.currentPopup=outerDiv;return innerDiv;}
acme.utils.PopUpAddClose=function(div)
{acme.utils.AppendElement(div,'img',{src:'http://acme.com/resources/images/close.gif',onclick:acme.utils.PopDown,style:{width:'14px',height:'13px',border:'solid 0px #ffffff',position:'absolute',right:'2px',top:'2px',cursor:'pointer'}});}
acme.utils.PopUp=function(anchorElement,styles)
{var p=acme.utils.PopUpInternal(anchorElement,styles);acme.utils.PopUpAddClose(p);return p;}
acme.utils.PopUpHtml=function(anchorElement,html,styles)
{var p=acme.utils.PopUpInternal(anchorElement,styles);p.innerHTML=html;acme.utils.PopUpAddClose(p);return p;}
acme.utils.PopDown=function()
{if(!acme.utils.currentPopup)
return;acme.utils.DestroyElement(acme.utils.currentPopup);acme.utils.currentPopup=null;}
acme.utils.NoBubble=function(e)
{e=acme.utils.GetEvent(e);if(e)
e.stopPropagation();}
acme.utils.PopUpColorPicker=function(anchorElement,styles,callback)
{var hexits=['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];var p=acme.utils.PopUpInternal(anchorElement,acme.utils.MergeObjects({width:'163px',height:'96px'},styles));acme.utils.PopUpAddClose(p);var table=acme.utils.AppendElement(p,'table',{border:'0',cellSpacing:'0',cellPadding:'0',style:{position:'absolute',left:'0px',top:'0px'}});var tbody=acme.utils.AppendElement(table,'tbody');r=g=b=0;for(var y=0;y<12;++y)
{var tr=acme.utils.AppendElement(tbody,'tr');for(var x=0;x<18;++x)
{var c=hexits[r>>4]+hexits[r&15]+
hexits[g>>4]+hexits[g&15]+
hexits[b>>4]+hexits[b&15];var td=acme.utils.AppendElement(tr,'td',{title:c,style:{width:'8px',height:'8px',backgroundColor:'#'+c}});td.onclick=acme.utils.MakePopDownCallback(callback,c);b+=51;if(b>=256)
{b=0;g+=51;if(g>=256)
{g=0;r+=51;}}}}}
acme.utils.MakePopDownCallback=function(callback,arg)
{return function(){acme.utils.PopDown();callback(arg);};}
acme.utils.Animate=function(stepSecs,nSteps,callback)
{function AnimateStep(stepSecs,nSteps,stepNum,callback)
{callback(stepNum/nSteps);if(stepNum<nSteps)
setTimeout(acme.utils.Partial(AnimateStep,stepSecs,nSteps,stepNum+1,callback),stepSecs*1000);}
AnimateStep(stepSecs,nSteps,0,callback);}
acme.utils.logOuterElement=null;acme.utils.logMiddleElement=null;acme.utils.logInnerElement=null;acme.utils.Log=function(msg)
{if(typeof console!="undefined")
console.log(msg);else
{if(acme.utils.logOuterElement===null||acme.utils.logOuterElement===undefined)
{acme.utils.logOuterElement=acme.utils.AppendElement(document.documentElement,'div',{zIndex:1000000,style:{position:'absolute',bottom:'20px',left:'20px',right:'20px',height:'2in',border:'solid 2px #ff0000',backgroundColor:'#ffeeee',padding:'5px',overflow:'hidden'}});acme.utils.logMiddleElement=acme.utils.AppendElement(acme.utils.logOuterElement,'div',{style:{position:'absolute',left:'0',right:'0',top:'0',bottom:'0',overflow:'auto'}});acme.utils.logInnerElement=acme.utils.AppendElement(acme.utils.logMiddleElement,'div',{});acme.utils.AppendElement(acme.utils.logOuterElement,'img',{src:'http://acme.com/resources/images/close.gif',alt:'close',onclick:acme.utils.LogClose,style:{position:'absolute',top:'2px',right:'20px',width:'14px',height:'13px',borderWidth:'0',cursor:'pointer'}});}
acme.utils.ShowElement(acme.utils.logOuterElement);var time=((new Date())+' ').split(' ')[4];acme.utils.logInnerElement.innerHTML+=time+' '+msg+'<br>';acme.utils.logMiddleElement.scrollTop=acme.utils.logMiddleElement.scrollHeight;}}
acme.utils.LogClose=function()
{acme.utils.HideElement(acme.utils.logOuterElement);}
acme.utils.NoScrollWheel=function(element)
{element.addEventListener('wheel',function(e){e.stopPropagation();});}
acme.utils.Join=function(strArray,separator)
{var results='';for(var i in strArray)
{if(results!='')
results+=separator;results+=strArray[i];}
return results;}
acme.utils.ArrayPushUniq=function(a,v)
{if(a.indexOf(v)==-1)
a.push(v);}
acme.utils.HideElement=function(element)
{element.style.display='none';}
acme.utils.ShowElement=function(element)
{element.style.display='';}
acme.utils.InvisibleElement=function(element)
{element.style.visibility='hidden';}
acme.utils.VisibleElement=function(element)
{element.style.visibility='visible';}
acme.utils.CenterElement=function(element)
{var parent=element.parentNode;var pw,ph;if(parent==document.body)
{pw=window.innerWidth;ph=window.innerHeight;}
else
{pw=parent.clientWidth;ph=parent.clientHeight;}
var ew=element.clientWidth;var eh=element.clientHeight;element.style.position='absolute';element.style.left=((pw-ew)/2)+'px';element.style.top=((ph-eh)/2)+'px';}
acme.utils.Strftime=function(format,date)
{var weekdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];var wdys=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];var months=['January','February','March','April','May','June','July','August','September','October','November','December'];var mnths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];if(date===undefined)
date=new Date();var r='';for(var i=0;i<format.length;++i)
{var c=format.charAt(i);if(c=='%')
{++i;c=format.charAt(i);switch(c)
{case'A':r+=weekdays[date.getDay()];break;case'a':r+=wdys[date.getDay()];break;case'B':r+=months[date.getMonth()];break;case'b':r+=mnths[date.getMonth()];break;case'C':r+=Math.floor(date.getFullYear()/100);break;case'c':break;case'D':r+=acme.utils.Strftime('%m/%d/%y',date);break;case'd':r+=acme.utils.ZeroPad(date.getDate(),2);break;case'e':r+=acme.utils.BlankPad(date.getDate(),2);break;case'F':r+=acme.utils.Strftime('%Y-%m-%d',date);break;case'G':break;case'g':break;case'H':r+=acme.utils.ZeroPad(date.getHours(),2);break;case'h':r+=acme.utils.Strftime('%b',date);break;case'I':r+=acme.utils.ZeroPad(date.getHours(),2);break;case'j':break;case'k':r+=acme.utils.BlankPad(date.getHours(),2);break;case'l':r+=acme.utils.BlankPad(date.getHours(),2);break;!!!fixup
case'M':r+=acme.utils.ZeroPad(date.getMinutes(),2);break;case'm':r+=date.getMonth()+1;break;case'n':r+='\n';break;case'p':break;case'R':r+=acme.utils.Strftime('%H:%M',date);break;case'r':r+=acme.utils.Strftime('%I:%M:%S %p',date);break;case'S':r+=acme.utils.ZeroPad(date.getSeconds(),2);break;case's':r+=Math.floor(date.getTime()/1000);break;case'T':r+=acme.utils.Strftime('%H:%M:%S',date);break;case't':t+='\t';break;case'U':break;case'u':r+=date.getDay();break;case'V':break;case'v':r+=acme.utils.Strftime('%e-%b-%Y',date);break;case'W':break;case'w':r+=date.getDay();break;case'X':break;case'x':break;case'Y':r+=date.getFullYear();break;case'y':r+=acme.utils.ZeroPad(date.getFullYear()%100,2);break;case'Z':break;case'z':break;case'+':break;case'%':r+='%';break;default:r+='%'+c;break;}}
else
r+=c;}
return r;}
acme.utils.ZeroPad=function(s,n)
{return acme.utils.Pad(s,n,'0');}
acme.utils.BlankPad=function(s,n)
{return acme.utils.Pad(s,n,' ');}
acme.utils.Pad=function(s,n,p)
{s=s+'';var pp='';for(var i=0;i<n-s.length;++i)
pp+=p;return pp+s;}
acme.utils.DegToRad=function(a)
{return a*Math.PI/180;}
acme.utils.RadToDeg=function(a)
{return a*180/Math.PI;}
acme.utils.RandInt=function(min,max)
{return Math.floor(Math.random()*(Math.round(max)-Math.round(min)+1))+Math.round(min);}
acme.utils.RandReal=function(min,max)
{return Math.random()*(max-min)+min;}