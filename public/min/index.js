angular.module("afkl.lazyImage",[]),angular.module("afkl.lazyImage").service("afklSrcSetService",["$window",function(n){"use strict"
function e(n){this.src=n.src,this.w=n.w||1/0,this.h=n.h||1/0,this.x=n.x||1}var t=/^[0-9]+$/,i=function(n){for(var e=n.split(/\s/),i={},o=0,r=e.length;r>o;o++){var l=e[o]
if(l.length>0){var a=l.slice(-1),c=l.substring(0,l.length-1),u=parseInt(c,10),s=parseFloat(c)
c.match(t)&&"w"===a?i[a]=u:c.match(t)&&"h"===a?i[a]=u:isNaN(s)||"x"!==a||(i[a]=s)}}return i},o=function(n,e){for(var t=n[0],i=0,o=n.length;o>i;i++){var r=n[i]
e(r,t)&&(t=r)}return t},r=function(n,e){for(var t=n.length-1;t>=0;t--){var i=n[t]
e(i)&&n.splice(t,1)}return n},l=function(e,t){if(e){t||(t={w:n.innerWidth||document.documentElement.clientWidth,h:n.innerHeight||document.documentElement.clientHeight,x:n.devicePixelRatio||1})
var i=e.slice(0),l=o(i,function(n,e){return n.w>e.w})
r(i,function(){return function(n){return n.w<t.w}}(this)),0===i.length&&(i=[l])
var a=o(i,function(n,e){return n.h>e.h})
r(i,function(){return function(n){return n.h<t.h}}(this)),0===i.length&&(i=[a])
var c=o(i,function(n,e){return n.x>e.x})
r(i,function(){return function(n){return n.x<t.x}}(this)),0===i.length&&(i=[c])
var u=o(i,function(n,e){return n.w<e.w})
r(i,function(n){return n.w>u.w})
var s=o(i,function(n,e){return n.h<e.h})
r(i,function(n){return n.h>s.h})
var f=o(i,function(n,e){return n.x<e.x})
return r(i,function(n){return n.x>f.x}),i[0]}},a=function(n){var t=[],o=n.src,r=n.srcset
if(r){var a=function(n){for(var e=0,i=t.length;i>e;e++){var o=t[e]
if(o.x===n.x&&o.w===n.w&&o.h===n.h)return}t.push(n)},c=function(){for(var n,t,l=r,c=0,u=[];""!==l;){for(;" "===l.charAt(0);)l=l.slice(1)
c=l.indexOf(" "),-1!==c?(n=l.slice(0,c),l=l.slice(c+1),c=l.indexOf(","),-1===c?(t=l,l=""):(t=l.slice(0,c),l=l.slice(c+1)),u.push({url:n,descriptors:t})):(u.push({url:l,descriptors:""}),l="")}for(var s=0,f=u.length;f>s;s++){var d=u[s],m=i(d.descriptors)
a(new e({src:d.url,x:m.x,w:m.w,h:m.h}))}o&&a(new e({src:o}))}
c()
var u=l(t),s={best:u,candidates:t}
return t=null,s}}
return{get:a,image:l}}]),angular.module("afkl.lazyImage").directive("afklImageContainer",function(){"use strict"
return{restrict:"A",controller:["$scope","$element",function(n,e){e.data("afklImageContainer",e)}]}}).directive("afklLazyImage",["$window","$timeout","afklSrcSetService","$parse",function(n,e,t,i){"use strict"
var o=function(n){var e,i=t.get({srcset:n})
return i&&(e=i.best.src),e}
return{restrict:"A",link:function(t,r,l){var a=r.inheritedData("afklImageContainer")
a||(a=angular.element(l.afklLazyImageContainer||n))
var c,u,s=!1,f=l.afklLazyImage,d=l.afklLazyImageOptions?i(l.afklLazyImageOptions)(t):{},m=null,g=d.offset?d.offset:50,p=d.alt?'alt="'+d.alt+'"':'alt=""',h="afkl-lazy-image-loading",v="afkl-lazy-image"
d.className&&(v=v+" "+d.className),l.afklLazyImageLoaded=!1
var w=function(){if(a.scrollTop){var n=a.scrollTop()
if(n)return n}var e=a[0]
return void 0!==e.pageYOffset?e.pageYOffset:void 0!==e.scrollTop?e.scrollTop:document.documentElement.scrollTop||0},y=function(){if(a.innerHeight)return a.innerHeight()
var n=a[0]
return void 0!==n.innerHeight?n.innerHeight:void 0!==n.clientHeight?n.clientHeight:document.documentElement.clientHeight||0},k=function(){if(r.offset)return r.offset().top
var n=r[0].getBoundingClientRect()
return n.top+w()-document.documentElement.clientTop},$=function(){return r.offset?r.offset().top-a.offset().top:r[0].getBoundingClientRect().top-a[0].getBoundingClientRect().top},S=function(){d.background?r[0].style.backgroundImage='url("'+m+'")':u[0].src=m},C=function(){s=!0
var n=o(f)
n&&(d.background||u||(u=angular.element("<img "+p+' class="'+v+'" src=""/>'),r.append(u)),x()),a.off("scroll",I)},x=function(){if(s){var n=o(f)
n!==m&&(m=n,d.background||(r.addClass(h),u.one("load",L),u.one("error",b)),S())}}
x()
var L=function(){l.$set("afklLazyImageLoaded","done"),r.removeClass(h)},b=function(){l.$set("afklLazyImageLoaded","fail")},I=function(){var e,t,i,o=y(),r=w(),l=a[0]===n?k():$()
i=a[0]===n?o+r:o,e=l-i,t=g>=e,t&&!s&&C()},T=function(){e.cancel(c),c=e(function(){x(),I()},300)},z=function(){e.cancel(c),a.off("scroll",I),angular.element(n).off("resize",T),a[0]!==n&&a.off("resize",T),u&&u.remove(),u=c=m=void 0}
return a.on("scroll",I),angular.element(n).on("resize",T),a[0]!==n&&a.on("resize",T),l.$observe("afklLazyImage",function(){f=l.afklLazyImage,s&&C()}),d.nolazy&&C(),t.$on("$destroy",function(){return z()}),I()}}}])
var mod
mod=angular.module("infinite-scroll",[]),mod.value("THROTTLE_MILLISECONDS",null),mod.directive("infiniteScroll",["$rootScope","$window","$interval","THROTTLE_MILLISECONDS",function(n,e,t,i){return{scope:{infiniteScroll:"&",infiniteScrollContainer:"=",infiniteScrollDistance:"=",infiniteScrollDisabled:"=",infiniteScrollUseDocumentBottom:"=",infiniteScrollListenForEvent:"@"},link:function(o,r,l){var a,c,u,s,f,d,m,g,p,h,v,w,y,k,$,S,C,x
return x=angular.element(e),y=null,k=null,c=null,u=null,h=!0,C=!1,S=null,p=function(n){return n=n[0]||n,isNaN(n.offsetHeight)?n.document.documentElement.clientHeight:n.offsetHeight},v=function(n){return n[0].getBoundingClientRect&&!n.css("none")?n[0].getBoundingClientRect().top+w(n):void 0},w=function(n){return n=n[0]||n,isNaN(window.pageYOffset)?n.document.documentElement.scrollTop:n.ownerDocument.defaultView.pageYOffset},g=function(){var e,t,i,l,a
return u===x?(e=p(u)+w(u[0].document.documentElement),i=v(r)+p(r)):(e=p(u),t=0,void 0!==v(u)&&(t=v(u)),i=v(r)-t+p(r)),C&&(i=p((r[0].ownerDocument||r[0].document).documentElement)),l=i-e,a=l<=p(u)*y+1,a?(c=!0,k?o.$$phase||n.$$phase?o.infiniteScroll():o.$apply(o.infiniteScroll):void 0):c=!1},$=function(n,e){var i,o,r
return r=null,o=0,i=function(){var e
return o=(new Date).getTime(),t.cancel(r),r=null,n.call(),e=null},function(){var l,a
return l=(new Date).getTime(),a=e-(l-o),0>=a?(clearTimeout(r),t.cancel(r),r=null,o=l,n.call()):r?void 0:r=t(i,a,1)}},null!=i&&(g=$(g,i)),o.$on("$destroy",function(){return u.unbind("scroll",g),null!=S?(S(),S=null):void 0}),d=function(n){return y=parseFloat(n)||0},o.$watch("infiniteScrollDistance",d),d(o.infiniteScrollDistance),f=function(n){return k=!n,k&&c?(c=!1,g()):void 0},o.$watch("infiniteScrollDisabled",f),f(o.infiniteScrollDisabled),m=function(n){return C=n},o.$watch("infiniteScrollUseDocumentBottom",m),m(o.infiniteScrollUseDocumentBottom),a=function(n){return null!=u&&u.unbind("scroll",g),u=n,null!=n?u.bind("scroll",g):void 0},a(x),o.infiniteScrollListenForEvent&&(S=n.$on(o.infiniteScrollListenForEvent,g)),s=function(n){if(null!=n&&0!==n.length){if(n instanceof HTMLElement?n=angular.element(n):"function"==typeof n.append?n=angular.element(n[n.length-1]):"string"==typeof n&&(n=angular.element(document.querySelector(n))),null!=n)return a(n)
throw new Exception("invalid infinite-scroll-container attribute.")}},o.$watch("infiniteScrollContainer",s),s(o.infiniteScrollContainer||[]),null!=l.infiniteScrollParent&&a(angular.element(r.parent())),null!=l.infiniteScrollImmediateCheck&&(h=o.$eval(l.infiniteScrollImmediateCheck)),t(function(){return h?g():void 0},0,1)}}}]),function(){"use strict"
var n=angular.module("sticky",[])
n.directive("sticky",function(){function n(n,e,t){function i(){if(v.offsetWidth=m.offsetWidth,r(),k){var n=window.getComputedStyle(m.parentElement,null),t=m.parentElement.offsetWidth-n.getPropertyValue("padding-right").replace("px","")-n.getPropertyValue("padding-left").replace("px","")
e.css("width",t+"px")}}function o(){g.off("scroll",r),g.off("resize",i),d&&p.removeClass(d)}function r(){var n,e,t,i;(!s||L("("+s+")").matches)&&("top"===C?(i=window.pageYOffset||h.scrollTop,n=i-(h.clientTop||0),e=n>=$):(t=window.pageYOffset+window.innerHeight,e=$>=t),e&&!k?l():!e&&k&&a())}function l(){var n,t
n=e[0].getBoundingClientRect(),t=n.left,v.offsetWidth=m.offsetWidth,k=!0,d&&p.addClass(d),f&&e.addClass(f),e.css("width",m.offsetWidth+"px").css("position","fixed").css(C,S+"px").css("left",t).css("margin-top",0),"bottom"===C&&e.css("margin-bottom",0)}function a(){e.attr("style",e.initialStyle),k=!1,d&&p.removeClass(d),f&&e.removeClass(f),e.css("width","").css("top",v.top).css("position",v.position).css("left",v.cssLeft).css("margin-top",v.marginTop)}function c(n){var e=0
if(n.offsetParent)do e+=n.offsetTop,n=n.offsetParent
while(n)
return e}function u(n){return n.offsetTop+n.clientHeight}var s,f,d,m,g,p,h,v,w,y,k,$,S,C,x,L
switch(y=!1,k=!1,L=window.matchMedia,g=angular.element(window),p=angular.element(document.body),m=e[0],h=document.documentElement,s=t.mediaQuery||!1,f=t.stickyClass||"",d=t.bodyClass||"",w=e.attr("style"),S="string"==typeof t.offset?parseInt(t.offset.replace(/px;?/,"")):0,C="string"==typeof t.anchor?t.anchor.toLowerCase().trim():"top",v={top:e.css("top"),width:e.css("width"),position:e.css("position"),marginTop:e.css("margin-top"),cssLeft:e.css("left")},C){case"top":case"bottom":break
default:console.log("Unknown anchor "+C+", defaulting to top"),C="top"}g.on("scroll",r),g.on("resize",n.$apply.bind(n,i)),n.$on("$destroy",o),x=c(m),n.$watch(function(){return k?x:x="top"===C?c(m):u(m)},function(n,e){(n!==e||"undefined"==typeof $)&&($=n-S,r())})}return{restrict:"A",link:n}}),window.matchMedia=window.matchMedia||function(){var n="angular-sticky: This browser does not support matchMedia, therefore the minWidth option will not work on this browser. Polyfill matchMedia to fix this issue."
return window.console&&console.warn&&console.warn(n),function(){return{matches:!0}}}()}(),window.angular.module("myApp",["afkl.lazyImage","infinite-scroll","sticky"]).controller("ApplicationController",["$scope","$http","$window",function(n,e,t){n.displayed=[],n.count=0,n.scrollDisabled=!0,n.predicate="l",n.reverse=!1,e.get("/small.json").then(function(e){n.displayed=e.data,n.addResults(),n.scrollDisabled=!1}),n.addResults=function(){n.count<n.displayed.length?n.count+=20:n.scrollDisabled=!0},n.order=function(e){n.reverse=n.predicate===e?!n.reverse:!1,n.predicate=e}}]).filter("customOrderBy",["$window",function(n){return function(e,t,i){var o=[]
return n.angular.forEach(e,function(n){o.push(n)}),o.sort(function(n,e){return n[t]?e[t]&&n[t]>e[t]?1:-1:1}),i&&o.reverse(),o}}]).filter("customSearch",["$window",function(n){return function(e,t){if(!t)return e
var i=[],o=t.toLowerCase()
return n.angular.forEach(e,function(n){var e=(n.f+" "+n.l).toLowerCase()
e.indexOf(o)>-1&&i.push(n)}),i}}]).filter("scrollHack",["$window",function(n){return function(e){return n.angular.element(n).triggerHandler("scroll"),e}}])
