
acme.namespace('acme.maps3.maptypes');acme.maps3.maptypes.Initialize=function()
{}
acme.maps3.maptypes.AddMapTypes=function(map,mapOptions)
{acme.maps3.maptypes.CreateMapTypes(map);acme.maps3.maptypes.RegisterMapTypes(map,mapOptions);}
acme.maps3.maptypes.CreateMapTypes=function(map)
{acme.maps3.maptypes.standardTileSize=new google.maps.Size(256,256);acme.maps3.maptypes.EsriTopoId='EsriTopo';acme.maps3.maptypes.EsriTopo=acme.maps3.maptypes.ArcGISCreateMapType('Topo','http://services.arcgisonline.com/ArcGIS/rest/services/USA_Topo_Maps/MapServer/tile/',1.0,0,15);acme.maps3.maptypes.TopoId=acme.maps3.maptypes.EsriTopoId;acme.maps3.maptypes.Topo=acme.maps3.maptypes.EsriTopo;acme.maps3.maptypes.NexRadId='NexRad';acme.maps3.maptypes.NexRadOverlay=acme.maps3.maptypes.TMSCreateMapType('NexRad','http://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0r-900913/',0.666,4,10);acme.maps3.maptypes.NexRadBase=acme.maps3.maptypes.GoogleCreateMapType('NexRad','s,h',1.0,0,20);}
acme.maps3.maptypes.RegisterMapTypes=function(map,mapOptions)
{if(!mapOptions.mapTypeControlOptions)
mapOptions.mapTypeControlOptions={};if(!mapOptions.mapTypeControlOptions.mapTypeIds)
mapOptions.mapTypeControlOptions.mapTypeIds=[];acme.utils.ArrayPushUniq(mapOptions.mapTypeControlOptions.mapTypeIds,acme.maps3.maptypes.TopoId);acme.utils.ArrayPushUniq(mapOptions.mapTypeControlOptions.mapTypeIds,acme.maps3.maptypes.NexRadId);map.setOptions(mapOptions);map.mapTypes.set(acme.maps3.maptypes.TopoId,acme.maps3.maptypes.Topo);map.mapTypes.set(acme.maps3.maptypes.NexRadId,acme.maps3.maptypes.NexRadBase);google.maps.event.addListener(map,'maptypeid_changed',acme.utils.Partial(acme.maps3.maptypes.HandleNexRad,map));}
acme.maps3.maptypes.oldMapTypeId=null;acme.maps3.maptypes.HandleNexRad=function(map)
{var newMapTypeId=map.getMapTypeId();if(newMapTypeId!=acme.maps3.maptypes.oldMapTypeId)
{if(newMapTypeId==acme.maps3.maptypes.NexRadId)
map.overlayMapTypes.insertAt(0,acme.maps3.maptypes.NexRadOverlay);else if(acme.maps3.maptypes.oldMapTypeId==acme.maps3.maptypes.NexRadId)
{for(var i=0;i<map.overlayMapTypes.getLength();++i)
{if(map.overlayMapTypes.getAt(i)==acme.maps3.maptypes.NexRadOverlay)
{map.overlayMapTypes.removeAt(i);break;}}}
acme.maps3.maptypes.oldMapTypeId=newMapTypeId;}}
acme.maps3.maptypes.WMSCreateMapType=function(map,name,baseUrl,layer,format,transparent,opacity,minZoom,maxZoom)
{var options={getTileUrl:function(coord,zoom){var scale=1<<zoom;var southWestPixel=new google.maps.Point(coord.x*256/scale,(coord.y+1)*256/scale);var northEastPixel=new google.maps.Point((coord.x+1)*256/scale,coord.y*256/scale);var projection=map.getProjection();var southWestCoords=projection.fromPointToLatLng(southWestPixel);var northEastCoords=projection.fromPointToLatLng(northEastPixel);var bbox=southWestCoords.lng()+','+southWestCoords.lat()+','+northEastCoords.lng()+','+northEastCoords.lat();var transparency=transparent?'&TRANSPARENT=TRUE':'';return baseUrl+'?VERSION=1.1.1&REQUEST=GetMap&LAYERS='+layer+'&STYLES=&SRS=EPSG:4326&BBOX='+bbox+'&WIDTH=256&HEIGHT=256&FORMAT='+format+'&BGCOLOR=0xCCCCCC&EXCEPTIONS=INIMAGE'+transparency;},tileSize:acme.maps3.maptypes.standardTileSize,name:name,minZoom:minZoom,maxZoom:maxZoom,opacity:opacity};return new google.maps.ImageMapType(options);}
acme.maps3.maptypes.TMSCreateMapType=function(name,baseUrl,opacity,minZoom,maxZoom)
{var options={getTileUrl:function(coord,zoom){return baseUrl+zoom+'/'+coord.x+'/'+coord.y+'.png';},tileSize:acme.maps3.maptypes.standardTileSize,name:name,minZoom:minZoom,maxZoom:maxZoom,opacity:opacity};return new google.maps.ImageMapType(options);}
acme.maps3.maptypes.ArcGISCreateMapType=function(name,baseUrl,opacity,minZoom,maxZoom)
{var options={getTileUrl:function(coord,zoom){return baseUrl+zoom+'/'+coord.y+'/'+coord.x;},tileSize:acme.maps3.maptypes.standardTileSize,name:name,minZoom:minZoom,maxZoom:maxZoom,opacity:opacity};return new google.maps.ImageMapType(options);}
acme.maps3.maptypes.googleServers=['mt0','mt1','mt2','mt3'];acme.maps3.maptypes.googleServer=acme.maps3.maptypes.googleServers[acme.utils.RandInt(0,acme.maps3.maptypes.googleServers.length)];acme.maps3.maptypes.GoogleCreateMapType=function(name,layers,opacity,minZoom,maxZoom)
{var options={getTileUrl:function(coord,zoom){return'http://'+acme.maps3.maptypes.googleServer+'.google.com/vt/lyrs='+layers+'&x='+coord.x+'&y='+coord.y+'&z='+zoom;},tileSize:acme.maps3.maptypes.standardTileSize,name:name,minZoom:minZoom,maxZoom:maxZoom,opacity:opacity};return new google.maps.ImageMapType(options);}