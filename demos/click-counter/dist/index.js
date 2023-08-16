!function(){"use strict";const t=document,n=t.createElement("template");const e=t=>void 0===t,i=t=>"string"==typeof t;function s(t){this.e=t,this._pool=void 0}function o(t){return i(t)?document.getElementById(t):t}function r(t,n,e){const i=c(t,n);return i.props=e,i.init(),i.update(),i}function c(t,n){const e=new t(n);return e.__bv(e,t.prototype),e}function h(t,n){this._v=t,this._f=n,this._k=[],this._p={}}s.prototype={__ge:function(n){return n.e||t.createTextNode(n)},getAtt:function(t){return this.e[t]},getValue:function(){return this.e.value},isChecked:function(){return this.e.checked},append:function(t){return this.e.appendChild(this.__ge(t)),this},att:function(t,n){return this.e.setAttribute(t,n),this},atts:function(t){for(let n in t)this.att(n,t[n]);return this},pool:function(t){return this._pool=t,this},clear:function(){return this.e.innerHTML="",this.e.textContent="",this.e.value="",this},checked:function(t){return this.e.checked=!!t,this},child:function(t){return this.e.innerHTML="",this.e.appendChild(t.e),this},css:function(t){return this.e.className=t,this},cssAdd:function(t){return this.e.classList.add(t),this},cssRemove:function(t){return this.e.classList.remove(t),this},cssToggle:function(t){return this.e.classList.toggle(t),this},disabled:function(t){return this.e.disabled=t,this},href:function(t){return this.att("href",t)},html:function(t){return this.e.innerHTML=t,this},id:function(t){return this.att("id",t)},inner:function(t){Array.isArray(t)||(t=[t]);const n=this.e;n.innerHTML="";for(var e=0,i=t.length;e<i;e++)n.appendChild(this.__ge(t[e]));return this},items:function(t,n){return this._pool.patch(this.e,t,n),this},on:function(t,n){return this.e.addEventListener(t,(t=>n(this,t))),this},replace:function(t){return this.e.parentNode.replaceChild(t,this.e),this},src:function(t){return this.att("src",t)},style:function(t,n){return this.e.style[t]=n,this},swap:function(t,n){return this.child(this._pool.getOne(t,n)),this},text:function(t){return this.e.textContent=t,this},visible:function(t){return this.e.classList.toggle("hidden",!t),this},value:function(t){return this.e.value=t,this}};const u=h.prototype;function p(t){this._v=t,this._p=[],this._c=0}function l(t,n){this._m=t,this._f=n,this._i={}}function _(t,n,e){let i=e-1;for(let e=n.length-1;e>i;e--)t.removeChild(n[e])}function f(t,n,e){const i=t.indexOf(n);i!=e&&t.splice(e,0,t.splice(i,1)[0])}u.getOne=function(t,n){return this._get(this._p,this._v,this._f(t),t,n)},u.patch=function(t,n,e){const i=this._p,s=this._v,o=this._f,r=t.childNodes,c=n.length,h=this._k,u=[];let p,l,a,d=h.length+1;for(let _=0;_<c;_++)p=n[_],l=o(p),a=this._get(i,s,l,p,e),u.push(l),_>d?t.appendChild(a.e):l!==h[_]&&(t.insertBefore(a.e,r[_]),f(h,l,_));this._k=u,_(t,r,c)},u._get=function(t,n,e,i,s){let o;return t.hasOwnProperty(e)?(o=t[e],o.setProps(i)):(o=r(n,s,i),t[e]=o),o},p.prototype.patch=function(t,n,e){const i=this._p,s=this._v,o=t.childNodes,c=n.length;let h,u,p=i.length,l=this._c;for(let o=0;o<c;o++)h=n[o],o<p?(u=i[o],u.setProps(h)):(u=r(s,e,h),i.push(u),p++),o>=l&&t.appendChild(u.e);this._c=c,_(t,o,c)},l.prototype.getOne=function(t,n){return this._i.hasOwnProperty(t)||(this._i[t]=this._m.hasOwnProperty(t)?n.nest(this._m[t]):this._f(t,n)),this._i[t]};const a=[];var d={track:function(t){a.push({component:t,isAttached:t.__ia()})},flush:function(){for(let t=0,n=a.length;t<n;t++){let n=a[t],e=n.component,i=e.__ia();if(i!==n.isAttached){(i?e.mount:e.unmount).apply(e),n.isAttached=i}}}};function v(t){this.callbacks=t,this.run={}}v.prototype={get:function(t,n){const i=this.run;if(void 0===i[n]){let s=t.__ov[n];s=e(s)?"":s;const o=this.callbacks[n](t,t.props),r=o!==s;t.__ov[n]=o;const c={n:o,o:s,c:r};return i[n]=c,c}return i[n]},reset:function(){this.run={}}};const g=function(){};function b(t){const n=this;n.parent=t,n.props=void 0,n.e=null,n.el=null,n.__nv=[],n.__ov={}}b.define=function(t){var n=t._base||this,e=function(t){n.call(this,t)};return delete t._base,e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.assign(e.prototype,t),e};var m=b.prototype;m.onUpdate=g,m.afterUpdate=g,m.onInit=g,m.afterInit=g,m.init=function(){this.onInit();for(let t in this.__ip){let n=this.el[t],e=this.__ip[t];e&&(n.props=e(this,this.props)),n.init()}this.afterInit()},m.bubble=function(t){let n=this.parent;for(;!e(n);){if(n[t])return n[t].apply(n,Array.prototype.slice.call(arguments,1));n=n.parent}throw"Bubble popped."},m.move=function(t){if(this.parent&&this.parent.__nv){const t=this.parent.__nv;t.splice(t.indexOf(this),1)}this.parent=t},m.nest=function(t,n){const e=r(t,this,n||this.props);return this.__nv.push(e),e},m.lookup=function(t){return this.__qc.get(this,t)},m.resetLookups=function(){this.__qc.reset()},m.setProps=function(t){return this.props=t,this.update(),this},m.trackMounting=function(){this.__mt.track(this)},m.update=function(){this.onUpdate(),this.resetLookups(),this.updateSelf(),this.updateNested(),this.afterUpdate()},m.updateSelf=function(){let t,n,e,i,s,o,r=0;const c=this.__wc,h=c.length;for(;r<h;)t=c[r],n=this.el[t.wk],i=t.sq,r++,o=!0,i&&(s=this.lookup(i).n,o=t.rv?s:!s,e=o?0:t.sc,n.visible(o),r+=e),o&&y(this,n,t.cb)},m.updateNested=function(){const t=this.__nv;for(let n=0,e=t.length;n<e;n++){let e=t[n];e.__ia()&&e.update()}for(let t in this.__ip){let n=this.__ip[t],e=this.el[t];n?e.setProps(n(this,this.props)):e.update()}},m.__wa=function(t,n,e,i,s){return{wk:t,sq:n,rv:e,sc:i,cb:s}};const y=(t,n,e)=>{for(let i in e){let s=e[i];if("*"===i)s.call(t,n,t.props,t);else{const{n:e,o:o,c:r}=t.lookup(i);r&&s.call(t,e,o,n,t.props,t)}}};m.__mt=d,m.__ni=function(t,n){const e=c(n,this);return this.__gw(t).replace(e.e),e},m.__ex=function(t,n,e){var i=e||function(n){t.call(this,n)};return i.prototype=Object.create(t&&t.prototype,{constructor:{value:i,writable:!0,configurable:!0}}),n&&Object.assign(i.prototype,n),i},m.pool=function(t,n){return n?new h(t,n):new p(t)},m.__ic=function(t,n){return new l(t,n)},m.__bd=function(t){var e;void 0===t.__cn&&(t.__cn=(e=t.__ht,n.innerHTML=e,n.content.firstChild)),this.e=t.__cn.cloneNode(!0)},m.__gw=function(t){return new s(this.__fe(t))},m.__fe=function(t){return t.reduce(((t,n)=>t.childNodes[n]),this.e)},m.__ia=function(){let t=this.e;for(;t;){if(t===document)return!0;t=t.parentNode}return!1},m.__lu=function(t){return new v(t)},m.__sv=function(){const t=function(t){b.call(this,t)};return t.prototype=new b,t},m.visible=function(t){this.e.classList.toggle("hidden",!t)};var w={createComponent:r,h:function(n){return new s(t.createElement(n))},mount:function(t,n,e,i){const s=r(n,i,e),c=o(t);return c.parentNode.replaceChild(s.e,c),s},KeyedPool:h,InstancePool:l,isStr:i,SequentialPool:p,Component:b,Wrapper:s,wrap:function(t){return new s(o(t))},FFF:function(t){}};const k=w.Component.define({});var C=k.prototype;C.__ht="<div>Hello</div>",C.__wc=[],C.__qc=C.__lu({}),C.__ip={},C.__bv=function(t,n){t.__bd(n),t.el={}},C.__cn=void 0,w.mount("main",k)}();