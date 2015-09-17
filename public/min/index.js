angular.module("afkl.lazyImage",[]),angular.module("afkl.lazyImage").service("afklSrcSetService",["$window",function(e){"use strict"
function n(e){this.src=e.src,this.w=e.w||1/0,this.h=e.h||1/0,this.x=e.x||1}var t=/^[0-9]+$/,i=function(e){for(var n=e.split(/\s/),i={},r=0,o=n.length;o>r;r++){var a=n[r]
if(a.length>0){var l=a.slice(-1),c=a.substring(0,a.length-1),s=parseInt(c,10),u=parseFloat(c)
c.match(t)&&"w"===l?i[l]=s:c.match(t)&&"h"===l?i[l]=s:isNaN(u)||"x"!==l||(i[l]=u)}}return i},r=function(e,n){for(var t=e[0],i=0,r=e.length;r>i;i++){var o=e[i]
n(o,t)&&(t=o)}return t},o=function(e,n){for(var t=e.length-1;t>=0;t--){var i=e[t]
n(i)&&e.splice(t,1)}return e},a=function(n,t){if(n){t||(t={w:e.innerWidth||document.documentElement.clientWidth,h:e.innerHeight||document.documentElement.clientHeight,x:e.devicePixelRatio||1})
var i=n.slice(0),a=r(i,function(e,n){return e.w>n.w})
o(i,function(){return function(e){return e.w<t.w}}(this)),0===i.length&&(i=[a])
var l=r(i,function(e,n){return e.h>n.h})
o(i,function(){return function(e){return e.h<t.h}}(this)),0===i.length&&(i=[l])
var c=r(i,function(e,n){return e.x>n.x})
o(i,function(){return function(e){return e.x<t.x}}(this)),0===i.length&&(i=[c])
var s=r(i,function(e,n){return e.w<n.w})
o(i,function(e){return e.w>s.w})
var u=r(i,function(e,n){return e.h<n.h})
o(i,function(e){return e.h>u.h})
var f=r(i,function(e,n){return e.x<n.x})
return o(i,function(e){return e.x>f.x}),i[0]}},l=function(e){var t=[],r=e.src,o=e.srcset
if(o){var l=function(e){for(var n=0,i=t.length;i>n;n++){var r=t[n]
if(r.x===e.x&&r.w===e.w&&r.h===e.h)return}t.push(e)},c=function(){for(var e,t,a=o,c=0,s=[];""!==a;){for(;" "===a.charAt(0);)a=a.slice(1)
c=a.indexOf(" "),-1!==c?(e=a.slice(0,c),a=a.slice(c+1),c=a.indexOf(","),-1===c?(t=a,a=""):(t=a.slice(0,c),a=a.slice(c+1)),s.push({url:e,descriptors:t})):(s.push({url:a,descriptors:""}),a="")}for(var u=0,f=s.length;f>u;u++){var d=s[u],m=i(d.descriptors)
l(new n({src:d.url,x:m.x,w:m.w,h:m.h}))}r&&l(new n({src:r}))}
c()
var s=a(t),u={best:s,candidates:t}
return t=null,u}}
return{get:l,image:a}}]),angular.module("afkl.lazyImage").directive("afklImageContainer",function(){"use strict"
return{restrict:"A",controller:["$scope","$element",function(e,n){n.data("afklImageContainer",n)}]}}).directive("afklLazyImage",["$window","$timeout","afklSrcSetService","$parse",function(e,n,t,i){"use strict"
var r=function(e){var n,i=t.get({srcset:e})
return i&&(n=i.best.src),n}
return{restrict:"A",link:function(t,o,a){var l=o.inheritedData("afklImageContainer")
l||(l=angular.element(a.afklLazyImageContainer||e))
var c,s,u=!1,f=a.afklLazyImage,d=a.afklLazyImageOptions?i(a.afklLazyImageOptions)(t):{},m=null,p=d.offset?d.offset:50,h=d.alt?'alt="'+d.alt+'"':'alt=""',g="afkl-lazy-image-loading",w="afkl-lazy-image"
d.className&&(w=w+" "+d.className),a.afklLazyImageLoaded=!1
var v=function(){if(l.scrollTop){var e=l.scrollTop()
if(e)return e}var n=l[0]
return void 0!==n.pageYOffset?n.pageYOffset:void 0!==n.scrollTop?n.scrollTop:document.documentElement.scrollTop||0},y=function(){if(l.innerHeight)return l.innerHeight()
var e=l[0]
return void 0!==e.innerHeight?e.innerHeight:void 0!==e.clientHeight?e.clientHeight:document.documentElement.clientHeight||0},x=function(){if(o.offset)return o.offset().top
var e=o[0].getBoundingClientRect()
return e.top+v()-document.documentElement.clientTop},S=function(){return o.offset?o.offset().top-l.offset().top:o[0].getBoundingClientRect().top-l[0].getBoundingClientRect().top},$=function(){d.background?o[0].style.backgroundImage='url("'+m+'")':s[0].src=m},k=function(){u=!0
var e=r(f)
e&&(d.background||s||(s=angular.element("<img "+h+' class="'+w+'" src=""/>'),o.append(s)),C()),l.off("scroll",z)},C=function(){if(u){var e=r(f)
e!==m&&(m=e,d.background||(o.addClass(g),s.one("load",b),s.one("error",L)),$())}}
C()
var b=function(){a.$set("afklLazyImageLoaded","done"),o.removeClass(g)},L=function(){a.$set("afklLazyImageLoaded","fail")},z=function(){var n,t,i,r=y(),o=v(),a=l[0]===e?x():S()
i=l[0]===e?r+o:r,n=a-i,t=p>=n,t&&!u&&k()},E=function(){n.cancel(c),c=n(function(){C(),z()},300)},I=function(){n.cancel(c),l.off("scroll",z),angular.element(e).off("resize",E),l[0]!==e&&l.off("resize",E),s&&s.remove(),s=c=m=void 0}
return l.on("scroll",z),angular.element(e).on("resize",E),l[0]!==e&&l.on("resize",E),a.$observe("afklLazyImage",function(){f=a.afklLazyImage,u&&k()}),d.nolazy&&k(),t.$on("$destroy",function(){return I()}),z()}}}])
var mod
mod=angular.module("infinite-scroll",[]),mod.value("THROTTLE_MILLISECONDS",null),mod.directive("infiniteScroll",["$rootScope","$window","$interval","THROTTLE_MILLISECONDS",function(e,n,t,i){return{scope:{infiniteScroll:"&",infiniteScrollContainer:"=",infiniteScrollDistance:"=",infiniteScrollDisabled:"=",infiniteScrollUseDocumentBottom:"=",infiniteScrollListenForEvent:"@"},link:function(r,o,a){var l,c,s,u,f,d,m,p,h,g,w,v,y,x,S,$,k,C
return C=angular.element(n),y=null,x=null,c=null,s=null,g=!0,k=!1,$=null,h=function(e){return e=e[0]||e,isNaN(e.offsetHeight)?e.document.documentElement.clientHeight:e.offsetHeight},w=function(e){return e[0].getBoundingClientRect&&!e.css("none")?e[0].getBoundingClientRect().top+v(e):void 0},v=function(e){return e=e[0]||e,isNaN(window.pageYOffset)?e.document.documentElement.scrollTop:e.ownerDocument.defaultView.pageYOffset},p=function(){var n,t,i,a,l
return s===C?(n=h(s)+v(s[0].document.documentElement),i=w(o)+h(o)):(n=h(s),t=0,void 0!==w(s)&&(t=w(s)),i=w(o)-t+h(o)),k&&(i=h((o[0].ownerDocument||o[0].document).documentElement)),a=i-n,l=a<=h(s)*y+1,l?(c=!0,x?r.$$phase||e.$$phase?r.infiniteScroll():r.$apply(r.infiniteScroll):void 0):c=!1},S=function(e,n){var i,r,o
return o=null,r=0,i=function(){var n
return r=(new Date).getTime(),t.cancel(o),o=null,e.call(),n=null},function(){var a,l
return a=(new Date).getTime(),l=n-(a-r),0>=l?(clearTimeout(o),t.cancel(o),o=null,r=a,e.call()):o?void 0:o=t(i,l,1)}},null!=i&&(p=S(p,i)),r.$on("$destroy",function(){return s.unbind("scroll",p),null!=$?($(),$=null):void 0}),d=function(e){return y=parseFloat(e)||0},r.$watch("infiniteScrollDistance",d),d(r.infiniteScrollDistance),f=function(e){return x=!e,x&&c?(c=!1,p()):void 0},r.$watch("infiniteScrollDisabled",f),f(r.infiniteScrollDisabled),m=function(e){return k=e},r.$watch("infiniteScrollUseDocumentBottom",m),m(r.infiniteScrollUseDocumentBottom),l=function(e){return null!=s&&s.unbind("scroll",p),s=e,null!=e?s.bind("scroll",p):void 0},l(C),r.infiniteScrollListenForEvent&&($=e.$on(r.infiniteScrollListenForEvent,p)),u=function(e){if(null!=e&&0!==e.length){if(e instanceof HTMLElement?e=angular.element(e):"function"==typeof e.append?e=angular.element(e[e.length-1]):"string"==typeof e&&(e=angular.element(document.querySelector(e))),null!=e)return l(e)
throw new Exception("invalid infinite-scroll-container attribute.")}},r.$watch("infiniteScrollContainer",u),u(r.infiniteScrollContainer||[]),null!=a.infiniteScrollParent&&l(angular.element(o.parent())),null!=a.infiniteScrollImmediateCheck&&(g=r.$eval(a.infiniteScrollImmediateCheck)),t(function(){return g?p():void 0},0,1)}}}]),function(){"use strict"
var e=angular.module("sticky",[])
e.directive("sticky",function(){function e(e,n,t){function i(){if(w.offsetWidth=m.offsetWidth,o(),x){var e=window.getComputedStyle(m.parentElement,null),t=m.parentElement.offsetWidth-e.getPropertyValue("padding-right").replace("px","")-e.getPropertyValue("padding-left").replace("px","")
n.css("width",t+"px")}}function r(){p.off("scroll",o),p.off("resize",i),d&&h.removeClass(d)}function o(){var e,n,t,i;(!u||b("("+u+")").matches)&&("top"===k?(i=window.pageYOffset||g.scrollTop,e=i-(g.clientTop||0),n=e>=S):(t=window.pageYOffset+window.innerHeight,n=S>=t),n&&!x?a():!n&&x&&l())}function a(){var e,t
e=n[0].getBoundingClientRect(),t=e.left,w.offsetWidth=m.offsetWidth,x=!0,d&&h.addClass(d),f&&n.addClass(f),n.css("width",m.offsetWidth+"px").css("position","fixed").css(k,$+"px").css("left",t).css("margin-top",0),"bottom"===k&&n.css("margin-bottom",0)}function l(){n.attr("style",n.initialStyle),x=!1,d&&h.removeClass(d),f&&n.removeClass(f),n.css("width","").css("top",w.top).css("position",w.position).css("left",w.cssLeft).css("margin-top",w.marginTop)}function c(e){var n=0
if(e.offsetParent)do n+=e.offsetTop,e=e.offsetParent
while(e)
return n}function s(e){return e.offsetTop+e.clientHeight}var u,f,d,m,p,h,g,w,v,y,x,S,$,k,C,b
switch(y=!1,x=!1,b=window.matchMedia,p=angular.element(window),h=angular.element(document.body),m=n[0],g=document.documentElement,u=t.mediaQuery||!1,f=t.stickyClass||"",d=t.bodyClass||"",v=n.attr("style"),$="string"==typeof t.offset?parseInt(t.offset.replace(/px;?/,"")):0,k="string"==typeof t.anchor?t.anchor.toLowerCase().trim():"top",w={top:n.css("top"),width:n.css("width"),position:n.css("position"),marginTop:n.css("margin-top"),cssLeft:n.css("left")},k){case"top":case"bottom":break
default:console.log("Unknown anchor "+k+", defaulting to top"),k="top"}p.on("scroll",o),p.on("resize",e.$apply.bind(e,i)),e.$on("$destroy",r),C=c(m),e.$watch(function(){return x?C:C="top"===k?c(m):s(m)},function(e,n){(e!==n||"undefined"==typeof S)&&(S=e-$,o())})}return{restrict:"A",link:e}}),window.matchMedia=window.matchMedia||function(){var e="angular-sticky: This browser does not support matchMedia, therefore the minWidth option will not work on this browser. Polyfill matchMedia to fix this issue."
return window.console&&console.warn&&console.warn(e),function(){return{matches:!0}}}()}(),function(){"use strict"
var e=angular.module("matchMedia",[])
e.run(function(){window.matchMedia||(window.matchMedia=function(){var e=window.styleMedia||window.media
if(!e){var n=document.createElement("style"),t=document.getElementsByTagName("script")[0],i=null
n.type="text/css",n.id="matchmediajs-test",t.parentNode.insertBefore(n,t),i="getComputedStyle"in window&&window.getComputedStyle(n,null)||n.currentStyle,e={matchMedium:function(e){var t="@media "+e+"{ #matchmediajs-test { width: 1px; } }"
return n.styleSheet?n.styleSheet.cssText=t:n.textContent=t,"1px"===i.width}}}return function(n){return{matches:e.matchMedium(n||"all"),media:n||"all"}}}())}),e.service("screenSize",["$rootScope",function(e){var n={lg:"(min-width: 1200px)",md:"(min-width: 992px) and (max-width: 1199px)",sm:"(min-width: 768px) and (max-width: 991px)",xs:"(max-width: 767px)"},t=this,i=function(n,t){t=t||e
var i=t.$root.$$phase
"$apply"===i||"$digest"===i?n&&"function"==typeof n&&n():t.$apply(n)}
this.is=function(e){var t=this.rules||n
if("string"!=typeof e&&"[object Array]"===Object.prototype.toString.call(e))throw new Error("screenSize requires array or comma-separated list")
return"string"==typeof e&&(e=e.split(/\s*,\s*/)),e.some(function(e,n,i){return window.matchMedia(t[e]).matches?!0:void 0})},this.get=function(){var e=this.rules||n
for(var t in e)if(window.matchMedia(e[t]).matches)return t},this.on=function(e,n,r){return window.addEventListener("resize",function(o){i(n(t.is(e)),r)}),t.is(e)},this.when=function(e,n,r){return window.addEventListener("resize",function(o){t.is(e)===!0&&i(n(t.is(e)),r)}),t.is(e)}}]),e.filter("media",["screenSize",function(e){var n=function(n,t){var i=e.get(),r=""
if(!t)return i
if(t.groups){for(var o in t.groups){var a=t.groups[o].indexOf(i)
a>=0&&(r=o)}""===r&&(r=i)}return t.replace&&"string"==typeof t.replace&&t.replace.length>0?n.replace(t.replace,r):r}
return n.$stateful=!0,n}])}(),window.angular.module("myApp",["afkl.lazyImage","infinite-scroll","sticky","matchMedia"]).controller("ApplicationController",["$scope","$http","$window","screenSize",function(e,n,t,i){e.displayed=[],e.count=0,e.scrollDisabled=!0,e.predicate="l",e.reverse=!1,i.rules={mportrait:"(max-width: 450px)",mlandscape:"(max-width: 750px)"},i.is("mportrait")?e.thumbCount=3:i.is("mlandscape")?e.thumbCount=6:e.thumbCount=10,n.get("/small.json").then(function(n){e.displayed=n.data,e.addResults(),e.scrollDisabled=!1}),e.addResults=function(){e.count<e.displayed.length?e.count+=20:e.scrollDisabled=!0},e.order=function(n){e.reverse=e.predicate===n?!e.reverse:!1,e.predicate=n}}]).filter("customOrderBy",["$window",function(e){return function(n,t,i){var r=[]
return e.angular.forEach(n,function(e){r.push(e)}),r.sort(function(e,n){return e[t]?n[t]&&e[t]>n[t]?1:-1:1}),i&&r.reverse(),r}}]).filter("customSearch",["$window",function(e){return function(n,t){if(!t)return n
var i=[],r=t.toLowerCase()
return e.angular.forEach(n,function(e){var n=(e.f+" "+e.l).toLowerCase()
n.indexOf(r)>-1&&i.push(e)}),i}}]).filter("scrollHack",["$window",function(e){return function(n){return e.angular.element(e).triggerHandler("scroll"),n}}])
