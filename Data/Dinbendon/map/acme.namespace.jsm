'use strict';if(window.acme===undefined)
window.acme={};acme.namespace=function(name)
{var parts=name.split('.');var o=window;for(var i=0;i<parts.length;++i)
{if(o[parts[i]]===undefined)
o[parts[i]]={};o=o[parts[i]];}}
function namespace(name)
{acme.namespace(name);}