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
map.setCenter(new google.maps.LatLng(37.7,-122.4));
map.setZoom(9);
acme.maps3.GetPositionZoomTypeCookie(map);
acme.maps3.SavePositionZoomTypeCookieOnChanges(map);
om.Set('Loading...');
acme.utils.HttpGet('hotsprings.xml',RequestChecker);
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
var springElements=xmlDoc.getElementsByTagName('spring');
springs=[];
for(var s=0;s<springElements.length;++s)
{
var spring=new Object();
spring.state=springElements[s].getAttribute('state');
spring.lat=parseFloat(springElements[s].getAttribute('lat'));
spring.lng=parseFloat(springElements[s].getAttribute('lng'));
spring.location=new google.maps.LatLng(spring.lat,spring.lng);
spring.name=springElements[s].getAttribute('name');
var tempf=springElements[s].getAttribute('tempf');
if(tempf=='W'||tempf=='H'||tempf=='B'||tempf=='U')
{spring.tempf=tempf;
spring.tempc=tempf;
}
else
{
spring.tempf=parseInt(tempf);
spring.tempc=DegfToDegc(tempf);
}
springs.push(spring);
}
springs.sort(CompareNames);
var panelHtml='<font size="-2">';
for(var s=0;s<springs.length;++s)
{
springs[s].marker=new google.maps.Marker({position:springs[s].location,map:map,title:springs[s].name});
google.maps.event.addListener(springs[s].marker,'click',acme.utils.Partial(PopUp,s));
var link='<a href="javascript:PopUp( '+s+' )">';
var html=link+'<img border="0" src="http://acme.com/resources/images/markers/red_small.PNG"></a> '+link+springs[s].name+'</a>, '+TempHtml(springs[s].tempf,springs[s].tempc)+'<br />';panelHtml+=html;
}
panelHtml+='</font>';panelDiv.innerHTML=panelHtml;om.Clear();
}
catch(e)
{
acme.utils.Log('RequestChecker: '+e.name+' - '+e.message+', '+acme.utils.Props(e));
}
}
function DegfToDegc(tempf)
{
var tempc=(tempf-32)*100/180;
tempc=tempc.toFixed(0);
return tempc;
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
var mhtml='<table><tbody><tr><td><b>'+spring.name+'</b>, '+spring.state+'</td></tr><tr><td>'+TempHtml(spring.tempf,spring.tempc)+'</td></tr><tr><td><font size="-2">'+(spring.lat>=0.0?'N':'S')+' '+Math.abs(spring.lat)+' '+(spring.lng>=0.0?'E':'W')+' '+Math.abs(spring.lng)+'</font></td></tr></tbody></table>';
infowindow=new google.maps.InfoWindow({content:mhtml,maxWidth:400});
infowindow.open(map,marker);
acme.maps3.InfoWindowStayVisibleOnZoom(map,marker,infowindow);
}
catch(e)
{
acme.utils.Log('PopUp: '+e.name+' - '+e.message+', '+acme.utils.Props(e));
}
}
function TempHtml(tempf,tempc)
{
if(tempf=='W')
return'warm';
else if(tempf=='H')
return'hot';
else if(tempf=='B')
return'boiling';
else if(tempf=='U')
return'unknown';
else
return tempf+'&deg;F / '+tempc+'&deg;C';
}
