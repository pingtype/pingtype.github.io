
acme.namespace('acme.maps3');acme.maps3.Initialize=function()
{var msie8pat=new RegExp('MSIE 8');if(msie8pat.test(navigator.userAgent))
alert('WARNING: You appear to be using MSIE 8. The ACME Maps are known to not work in MSIE 8. Until we have a fix for this issue we recommend you upgrade to MSIE 9, or use Firefox or Chrome.');acme.maps3.mapOptions={disableDoubleClickZoom:true,draggableCursor:'default',keyboardShortcuts:true,scrollwheel:false,tilt:0,mapTypeControl:true,mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR,mapTypeIds:[google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.TERRAIN,google.maps.MapTypeId.SATELLITE,google.maps.MapTypeId.HYBRID,],position:google.maps.ControlPosition.RIGHT_TOP},streetViewControl:true,streetViewControlOptions:{position:google.maps.ControlPosition.LEFT_TOP},zoomControl:true,zoomControlOptions:{position:google.maps.ControlPosition.LEFT_TOP},scaleControl:true,panControl:false,overviewMapControl:false,};acme.maps3.streetViewPanoramaOptions={addressControl:true,addressControlOptions:{position:google.maps.ControlPosition.LEFT_TOP},panControl:true,panControlOptions:{position:google.maps.ControlPosition.LEFT_TOP},zoomControl:true,zoomControlOptions:{position:google.maps.ControlPosition.LEFT_TOP},};google.maps.controlStyle='azteca';}
acme.maps3.FixStreetView=function(map)
{map.getStreetView().setOptions(acme.maps3.streetViewPanoramaOptions);}
acme.maps3.redIcon={url:'http://acme.com/resources/images/markers/red.PNG',smallUrl:'http://acme.com/resources/images/markers/red_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.blueIcon={url:'http://acme.com/resources/images/markers/blue.PNG',smallUrl:'http://acme.com/resources/images/markers/blue_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.greenIcon={url:'http://acme.com/resources/images/markers/green.PNG',smallUrl:'http://acme.com/resources/images/markers/green_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.purpleIcon={url:'http://acme.com/resources/images/markers/purple.PNG',smallUrl:'http://acme.com/resources/images/markers/purple_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.yellowIcon={url:'http://acme.com/resources/images/markers/yellow.PNG',smallUrl:'http://acme.com/resources/images/markers/yellow_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.brownIcon={url:'http://acme.com/resources/images/markers/brown.PNG',smallUrl:'http://acme.com/resources/images/markers/brown_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.orangeIcon={url:'http://acme.com/resources/images/markers/orange.PNG',smallUrl:'http://acme.com/resources/images/markers/orange_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.whiteIcon={url:'http://acme.com/resources/images/markers/white.PNG',smallUrl:'http://acme.com/resources/images/markers/white_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.blackIcon={url:'http://acme.com/resources/images/markers/black.PNG',smallUrl:'http://acme.com/resources/images/markers/black_small.PNG',size:{width:20,height:34},anchor:{x:9,y:34}};acme.maps3.iconShadow={url:'http://acme.com/resources/images/markers/shadow.PNG',size:{width:37,height:34}};acme.maps3.LANG_UNKNOWN=0;acme.maps3.LANG_ENGLISH=1;acme.maps3.LANG_FRENCH=2;acme.maps3.currentLanguage=acme.maps3.LANG_UNKNOWN;acme.maps3._mInstructions=null;acme.maps3.SetLanguage=function(language)
{if(language!=acme.maps3.currentLanguage)
{switch(language)
{case acme.maps3.LANG_ENGLISH:acme.maps3._mInstructions='Drag the map with your mouse, or double-click to center.';_mSiteName='Google Maps';_mDataCopy='Map data &#169;2005 ';_mZenrinCopy='Map &#169;2005 ';_mNormalMap='Map';_mNormalMapShort='Map';_mHybridMap='Hybrid';_mHybridMapShort='Hyb';_mKeyholeMap='Satellite';_mKeyholeMapShort='Sat';_mNew='New!';_mTerms='Terms of Use';_mKeyholeCopy='Imagery &#169;2005 ';_mDecimalPoint='.';_mThousandsSeparator=',';_mZoomIn='Zoom In';_mZoomOut='Zoom Out';_mZoomSet='Click to set zoom level';_mZoomDrag='Drag to zoom';_mPanWest='Go left';_mPanEast='Go right';_mPanNorth='Go up';_mPanSouth='Go down';_mLastResult='Return to the last result';_mScale='Scale at the center of the map';break;case acme.maps3.LANG_FRENCH:acme.maps3._mInstructions='Faites glisser la carte avec la souris ou double-cliquez sur un point pour la recentrer.';_mSiteName='Cartes Google';_mDataCopy='Donn&eacute;es cartographiques &#169;2005 ';_mZenrinCopy='Carte &#169;2005 ';_mNormalMap='Carte';_mNormalMapShort='Car';_mHybridMap='Mixte';_mHybridMapShort='Mix';_mKeyholeMap='Satellite';_mKeyholeMapShort='Sat';_mNew='Nouvelle!';_mTerms='Limites d\'utilisation';_mKeyholeCopy='Images &#169;2005 ';_mDecimalPoint=',';_mThousandsSeparator='.';_mZoomIn='Zoom avant';_mZoomOut='Zoom arri&egrave;re';_mZoomSet='Cliquez pour d&eacute;finir le facteur de zoom';_mZoomDrag='Faites glisser le curseur pour zoomer';_mPanWest='D&eacute;placer vers la gauche';_mPanEast='D&eacute;placer vers la droite';_mPanNorth='D&eacute;placer vers le haut';_mPanSouth='D&eacute;placer vers le bas';_mLastResult='Revenir au r&eacute;sultat pr&eacute;c&eacute;dent';_mScale='&Eacute;chelle au centre de la carte';break;}
_mZoomIn=acme.utils.EntityToIso8859(_mZoomIn);_mZoomOut=acme.utils.EntityToIso8859(_mZoomOut);_mZoomSet=acme.utils.EntityToIso8859(_mZoomSet);_mZoomDrag=acme.utils.EntityToIso8859(_mZoomDrag);_mPanWest=acme.utils.EntityToIso8859(_mPanWest);_mPanEast=acme.utils.EntityToIso8859(_mPanEast);_mPanNorth=acme.utils.EntityToIso8859(_mPanNorth);_mPanSouth=acme.utils.EntityToIso8859(_mPanSouth);_mLastResult=acme.utils.EntityToIso8859(_mLastResult);_mScale=acme.utils.EntityToIso8859(_mScale);acme.maps3.currentLanguage=language;}}
acme.maps3.InfoWindowStayVisibleOnZoom=function(map,marker,infowindow)
{return;}
acme.maps3.pztCookieName='positionZoomType';acme.maps3.SavePositionZoomTypeCookie=function(map)
{var mapCenter=map.getCenter();var mapZoom=map.getZoom();var mapTypeLetter=acme.maps3.MapTypeIdToLetter(map.getMapTypeId());var cookieValue=mapCenter.lat().toFixed(5)+','+mapCenter.lng().toFixed(5)+','+mapZoom+','+mapTypeLetter;acme.utils.SaveCookie(acme.maps3.pztCookieName,cookieValue);}
acme.maps3.GetPositionZoomTypeCookie=function(map)
{var cookieValue=acme.utils.GetCookie(acme.maps3.pztCookieName);if(cookieValue===null||cookieValue===undefined)
return false;var vals=cookieValue.split(',');if(vals.length!=4)
return false;var mapY=parseFloat(vals[0]);var mapX=parseFloat(vals[1]);var mapZoom=parseInt(vals[2]);var mapTypeLetter=vals[3];map.setCenter(new google.maps.LatLng(mapY,mapX));map.setZoom(mapZoom);var mapTypeId=acme.maps3.LetterToMapTypeId(mapTypeLetter);if(mapTypeId)
map.setMapTypeId(mapTypeId);return true;}
acme.maps3.SavePositionZoomTypeCookieOnChanges=function(map)
{var caller=acme.utils.Partial(acme.maps3.SavePositionZoomTypeCookie,map);google.maps.event.addListener(map,'center_changed',caller);google.maps.event.addListener(map,'zoom_changed',caller);google.maps.event.addListener(map,'maptypeid_changed',caller);}
acme.maps3.MapTypeIdToLetter=function(mapTypeId)
{switch(mapTypeId)
{case google.maps.MapTypeId.ROADMAP:return'M';case google.maps.MapTypeId.SATELLITE:return'S';case google.maps.MapTypeId.HYBRID:return'H';case google.maps.MapTypeId.TERRAIN:return'R';}
if(acme.maps3.maptypes)
{switch(mapTypeId)
{case acme.maps3.maptypes.TopoId:return'T';case acme.maps3.maptypes.DOQId:return'O';case acme.maps3.maptypes.NexRadId:return'N';case acme.maps3.maptypes.MapnikId:return'K';}}
return'-';}
acme.maps3.LetterToMapTypeId=function(letter)
{switch(letter)
{case'M':return google.maps.MapTypeId.ROADMAP;case'S':return google.maps.MapTypeId.SATELLITE;case'H':return google.maps.MapTypeId.HYBRID;case'R':return google.maps.MapTypeId.TERRAIN;}
if(acme.maps3.maptypes)
{switch(letter)
{case'T':return acme.maps3.maptypes.TopoId;case'O':return acme.maps3.maptypes.DOQId;case'N':return acme.maps3.maptypes.NexRadId;case'K':return acme.maps3.maptypes.MapnikId;}}
return null;}
acme.maps3.degreesPerRadian=180.0/Math.PI;acme.maps3.radiansPerDegree=Math.PI/180.0;acme.maps3.Bearing=function(from,to)
{var lat1=from.lat()*acme.maps3.radiansPerDegree;var lon1=from.lng()*acme.maps3.radiansPerDegree;var lat2=to.lat()*acme.maps3.radiansPerDegree;var lon2=to.lng()*acme.maps3.radiansPerDegree;var angle=-Math.atan2(Math.sin(lon1-lon2)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2));if(angle<0.0)
angle+=Math.PI*2.0;angle=angle*acme.maps3.degreesPerRadian;return angle;}
acme.maps3.BadBearing=function(from,to)
{var a=from.lat();var b=to.lat();var l=to.lng()-from.lng();var episilon=0.0000000001;if(Math.abs(l)<=episilon)
if(a>b)
return 180.0;else
return 0.0;else if(Math.abs(Math.abs(l)-180.0)<=episilon)
if(a>=0.0&&b>=0.0)
return 0.0;else if(a<0.0&&b<0.0)
return 180.0;else if(a>=0.0)
if(a>-b)
return 0.0;else
return 180.0;else
if(a>-b)
return 180.0;else
return 0.0;a*=acme.maps3.radiansPerDegree;b*=acme.maps3.radiansPerDegree;l*=acme.maps3.radiansPerDegree;var d=Math.acos(Math.sin(a)*Math.sin(b)+Math.cos(a)*Math.cos(b)*Math.cos(l));var angle=Math.acos((Math.sin(b)-Math.sin(a)*Math.cos(d))/(Math.cos(a)*Math.sin(d)));angle=angle*acme.maps3.degreesPerRadian;if(Math.sin(l)<0)
angle=360.0-angle;return angle;}
acme.maps3.Direction=function(bearing)
{if(bearing>=348.75||bearing<11.25)
return"N";if(bearing>=11.25&&bearing<33.75)
return"NxNE";if(bearing>=33.75&&bearing<56.25)
return"NE";if(bearing>=56.25&&bearing<78.75)
return"ExNE";if(bearing>=78.75&&bearing<101.25)
return"E";if(bearing>=101.25&&bearing<123.75)
return"ExSE";if(bearing>=123.75&&bearing<146.25)
return"SE";if(bearing>=146.25&&bearing<168.75)
return"SxSE";if(bearing>=168.75&&bearing<191.25)
return"S";if(bearing>=191.25&&bearing<213.75)
return"SxSW";if(bearing>=213.75&&bearing<236.25)
return"SW";if(bearing>=236.25&&bearing<258.75)
return"WxSW";if(bearing>=258.75&&bearing<281.25)
return"W";if(bearing>=281.25&&bearing<303.75)
return"WxNW";if(bearing>=303.75&&bearing<326.25)
return"NW";if(bearing>=326.25&&bearing<348.75)
return"NxNW";return"???"}
acme.maps3.Direction8=function(bearing)
{if(bearing>=337.5||bearing<22.5)
return"N";if(bearing>=22.5&&bearing<67.5)
return"NE";if(bearing>=67.5&&bearing<112.5)
return"E";if(bearing>=112.5&&bearing<157.5)
return"SE";if(bearing>=157.5&&bearing<202.5)
return"S";if(bearing>=202.5&&bearing<247.5)
return"SW";if(bearing>=247.5&&bearing<292.5)
return"W";if(bearing>=292.5&&bearing<337.5)
return"NW";return"???"}
acme.maps3.clickZoomMap=null;acme.maps3.clickZoomListener=null;acme.maps3.clickZoomClicked=false;acme.maps3.clickZoomDoubleClicked=false;acme.maps3.ClickZoom=function(map)
{if(map==acme.maps3.clickZoomMap)
return;if(acme.maps3.clickZoomMap)
acme.maps3.ClickZoomOff();acme.maps3.clickZoomMap=map;acme.maps3.clickZoomListener=google.maps.event.addListener(map,'click',acme.maps3.ClickZoomClickHandler);acme.maps3.clickZoomClicked=false;acme.maps3.clickZoomDoubleClicked=false;}
acme.maps3.ClickZoomOff=function()
{if(acme.maps3.clickZoomMap)
{google.maps.event.removeListener(acme.maps3.clickZoomListener);acme.maps3.clickZoomMap=null;acme.maps3.clickZoomListener=null;}}
acme.maps3.ClickZoomClickHandler=function(event)
{if(acme.maps3.clickZoomClicked)
acme.maps3.clickZoomDoubleClicked=true;else
{acme.maps3.clickZoomClicked=true;acme.maps3.clickZoomDoubleClicked=false;setTimeout(acme.utils.Partial(acme.maps3.ClickZoomLaterHandler,event),250);}}
acme.maps3.ClickZoomLaterHandler=function(event)
{if(!acme.maps3.clickZoomDoubleClicked)
{acme.maps3.clickZoomMap.setCenter(event.latLng);acme.maps3.clickZoomMap.setZoom(acme.maps3.clickZoomMap.getZoom()+1);}
acme.maps3.clickZoomClicked=false;}
acme.maps3.doubleClickZoomMap=null;acme.maps3.doubleClickZoomListener=null;acme.maps3.DoubleClickZoom=function(map)
{if(map==acme.maps3.doubleClickZoomMap)
return;if(acme.maps3.doubleClickZoomMap)
acme.maps3.DoubleClickZoomOff();acme.maps3.doubleClickZoomMap=map;acme.maps3.doubleClickZoomListener=google.maps.event.addListener(map,'dblclick',acme.maps3.DoubleClickZoomDoubleClickHandler);}
acme.maps3.DoubleClickZoomOff=function()
{if(acme.maps3.doubleClickZoomMap)
{google.maps.event.removeListener(acme.maps3.doubleClickZoomListener);acme.maps3.doubleClickZoomMap=null;acme.maps3.doubleClickZoomListener=null;}}
acme.maps3.DoubleClickZoomDoubleClickHandler=function(event)
{acme.maps3.doubleClickZoomMap.setCenter(event.latLng);acme.maps3.doubleClickZoomMap.setZoom(acme.maps3.doubleClickZoomMap.getZoom()+1);}
acme.maps3.scrollWheelZoomMap=null;acme.maps3.scrollWheelZoomElement=null;acme.maps3.ScrollWheelZoom=function(map,element)
{if(map==acme.maps3.scrollWheelZoomMap)
return;if(acme.maps3.scrollWheelZoomMap)
acme.maps3.ScrollWheelZoomOff();acme.maps3.scrollWheelZoomMap=map;acme.maps3.scrollWheelZoomElement=element?element:map.getDiv();if(acme.maps3.scrollWheelZoomElement.addEventListener)
acme.maps3.scrollWheelZoomElement.addEventListener('wheel',acme.maps3.ScrollWheelZoomHandler);else
acme.maps3.scrollWheelZoomElement.onwheel=acme.maps3.ScrollWheelZoomHandler;}
acme.maps3.ScrollWheelZoomOff=function()
{if(acme.maps3.scrollWheelZoomMap)
{if(acme.maps3.scrollWheelZoomElement.removeEventListener)
acme.maps3.scrollWheelZoomElement.removeEventListener('wheel',acme.maps3.ScrollWheelZoomHandler);else
acme.maps3.scrollWheelZoomElement.onwheel=null;acme.maps3.scrollWheelZoomMap=null;acme.maps3.scrollWheelZoomElement=null;}}
var prevTimeStamp=-123456789;acme.maps3.ScrollWheelZoomHandler=function(e)
{if(e.timeStamp-prevTimeStamp>20)
{if(e.deltaY>0)
acme.maps3.scrollWheelZoomMap.setZoom(acme.maps3.scrollWheelZoomMap.getZoom()-1);else if(e.deltaY<0)
acme.maps3.scrollWheelZoomMap.setZoom(acme.maps3.scrollWheelZoomMap.getZoom()+1);}
prevTimeStamp=e.timeStamp;e.stopPropagation();e.preventDefault();}
acme.maps3.GetLatLngFromIP=function()
{var request=acme.utils.CreateXMLHttpRequest();if(request===null||request===undefined)
return null;request.open('GET','/resources/hostip_proxy.cgi',false);request.send(null);if(request.readyState!=4)
return null;if(request.status!=200)
return null;if(request.responseXML===null||request.responseXML===undefined)
return null;if(request.responseXML.documentElement===null||request.responseXML.documentElement===undefined)
return null;var coordElement=acme.utils.FindDeepChildNamed(request.responseXML.documentElement,'gml:coordinates');if(coordElement===null||coordElement===undefined)
return null;var coordText=acme.utils.GetXmlText(coordElement);var coords=coordText.split(',');if(coords.length!=2)
return null;var lng=parseFloat(coords[0]);var lat=parseFloat(coords[1]);return new google.maps.LatLng(lat,lng);}
acme.maps3.ZoomToMarkers=function(map,markers)
{if(markers.length==0)
return;var minLat=9999.0;var maxLat=-9999.0;var minLng=9999.0;var maxLng=-9999.0;for(var i in markers)
{var lagLng=markers[i].getPosition();var lat=lagLng.lat();var lng=lagLng.lng();if(lat<minLat)minLat=lat;if(lat>maxLat)maxLat=lat;if(lng<minLng)minLng=lng;if(lng>maxLng)maxLng=lng;}
var bounds=new google.maps.LatLngBounds(new google.maps.LatLng(minLat,minLng),new google.maps.LatLng(maxLat,maxLng));map.fitBounds(bounds);}
acme.maps3.crosshairsSize=19;acme.maps3.AddCrosshairs=function(map)
{var div=map.getDiv();if(acme.maps3.crosshairs)
acme.maps3.RemoveCrosshairs(map);var crosshairs=document.createElement("img");crosshairs.src='//acme.com/resources/images/crosshairs.gif';crosshairs.style.width=acme.maps3.crosshairsSize+'px';crosshairs.style.height=acme.maps3.crosshairsSize+'px';crosshairs.style.border='0';crosshairs.style.position='relative';crosshairs.style.top=((div.clientHeight-acme.maps3.crosshairsSize)/2)+'px';crosshairs.style.left=((div.clientWidth-acme.maps3.crosshairsSize)/2)+'px';crosshairs.style.zIndex='500';div.appendChild(crosshairs);return crosshairs;};acme.maps3.RemoveCrosshairs=function(map,crosshairs)
{if(crosshairs)
map.getDiv().removeChild(crosshairs);};