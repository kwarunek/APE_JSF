var APE={Config:{identifier:"ape",init:true,frequency:0,scripts:[]}};
APE.Client=new Class({eventProxy:[],fireEvent:function(a,b,c){return this.core.fireEvent(a,b,c)},addEvent:function(a,b,c){var d=b.bind(this),e=this;if($defined(this.core)){e=this.core.addEvent(a,d,c);this.core.$originalEvents[a]=this.core.$originalEvents[a]||[];this.core.$originalEvents[a][b]=d;delete this.core.$originalEvents[a][b]}else this.eventProxy.push([a,b,c]);return e},onRaw:function(a,b,c){return this.addEvent("raw_"+a.toLowerCase(),b,c)},removeEvent:function(a,b){this.core.removeEvent(a,
this.core.$originalEvents[a][b])},onCmd:function(a,b,c){return this.addEvent("cmd_"+a.toLowerCase(),b,c)},onError:function(a,b,c){return this.addEvent("error_"+a,b,c)},load:function(a){a=$merge({},APE.Config,a);a.init=function(f){this.core=f;for(f=0;f<this.eventProxy.length;f++)this.addEvent.apply(this,this.eventProxy[f])}.bind(this);if(a.transport!=2)document.domain=a.domain;var b=JSON.decode(Cookie.read("APE_Cookie"),{domain:document.domain});if(b)a.frequency=b.frequency.toInt();else b={frequency:0};
b.frequency=a.frequency+1;Cookie.write("APE_Cookie",JSON.encode(b),{domain:document.domain});var c=(new Element("iframe",{id:"ape_"+a.identifier,styles:{display:"none",position:"absolute",left:-300,top:-300}})).inject(document.body);if(a.transport==2){b=c.contentDocument;if(!b)b=c.contentWindow.document;b.open();for(var d="<html><head>",e=0;e<a.scripts.length;e++)d+='<script src="'+a.scripts[e]+'"><\/script>';d+="</head><body></body></html>";b.write(d);b.close()}else{c.set("src","http://"+a.frequency+
"."+a.server+'/?[{"cmd":"script","params":{"scripts":["'+a.scripts.join('","')+'"]}}]');c.contentWindow.location.href=c.get("src")}c.onload=function(){c.contentWindow.APE.init(a)}}});
