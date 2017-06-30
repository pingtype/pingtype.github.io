'use strict';
var mapDiv=document.getElementById('map');
var panelDiv=document.getElementById('panel');
var om=null;
var map=null;
var infowindow=null;
var springs;
function Setup()
{
try
{
acme.maps3.Initialize();
acme.maps3.maptypes.Initialize();
om=new acme.overlaymessage.OverlayMessage(mapDiv);
map=new google.maps.Map(mapDiv,acme.maps3.mapOptions);
acme.maps3.zoom5.Add(map,google.maps.ControlPosition.LEFT_TOP,0);
acme.maps3.FixStreetView(map);
acme.maps3.maptypes.AddMapTypes(map,acme.maps3.mapOptions);
acme.maps3.DoubleClickZoom(map);
acme.maps3.ScrollWheelZoom(map);
map.setCenter(new google.maps.LatLng(22.6,120.3));
map.setZoom(9);
acme.maps3.GetPositionZoomTypeCookie(map);
acme.maps3.SavePositionZoomTypeCookieOnChanges(map);
om.Set('Loading...');
acme.utils.HttpGet('DinbendonStoreNames.xml',RequestChecker);
}
catch(e)
{
acme.utils.Log('Setup: '+e.name+' - '+e.message+', '+acme.utils.Props(e));
}
}
function RequestChecker(request)
{
try
{
var xmlDoc=request.responseXML.documentElement;
var springElements=xmlDoc.getElementsByTagName('store');
springs=[];
for(var s=0;s<springElements.length;++s)
{
var spring=new Object();
spring.lat=parseFloat(springElements[s].getAttribute('lat'));
spring.lng=parseFloat(springElements[s].getAttribute('lng'));
spring.location=new google.maps.LatLng(spring.lat,spring.lng);
spring.name=springElements[s].getAttribute('name');
spring.filename=springElements[s].getAttribute('filename');
springs.push(spring);
}
springs.sort(CompareNames);
var panelHtml='<font size="-2">';
for(var s=0;s<springs.length;++s)
{
springs[s].marker=new google.maps.Marker({position:springs[s].location,map:map,title:springs[s].name});
google.maps.event.addListener(springs[s].marker,'click',acme.utils.Partial(PopUp,s));
var link='<a href="javascript:PopUp( '+s+' )">';
var html=link+'<img border="0" src="http://acme.com/resources/images/markers/red_small.PNG"></a> '+link+springs[s].name+'</a>, '+'<br />';
panelHtml+=html;
}
panelHtml+='</font>';
panelDiv.innerHTML=panelHtml;
om.Clear();
}
catch(e)
{
acme.utils.Log('RequestChecker: '+e.name+' - '+e.message+', '+acme.utils.Props(e));
}
}
function CompareNames(a,b)
{
if(a.name<b.name)
return-1;
else if(a.name>b.name)
return 1;
else
return 0;
}
function PopUp(s)
{
try
{
if(infowindow)
infowindow.close();
var spring=springs[s];
var marker=spring.marker;
var mhtml='<table><tbody><tr><td><b>'+spring.name+'</b>'+'</td></tr><tr><td><font size="-1"><iframe src="https://pingtype.github.io/Data/Dinbendon/DinbendonHTML/'+spring.filename+'" frameBorder="0" height="400px" width="600px"></iframe></font></td></tr><tr><td><font size="-2">'+(spring.lat>=0.0?'N':'S')+' '+Math.abs(spring.lat)+' '+(spring.lng>=0.0?'E':'W')+' '+Math.abs(spring.lng)+'</font></td></tr></tbody></table>';
infowindow=new google.maps.InfoWindow({content:mhtml,maxWidth:1000});
infowindow.open(map,marker);
acme.maps3.InfoWindowStayVisibleOnZoom(map,marker,infowindow);
}
catch(e)
{
acme.utils.Log('PopUp: '+e.name+' - '+e.message+', '+acme.utils.Props(e));
}
}
