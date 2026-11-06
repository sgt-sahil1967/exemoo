var e=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t,t.exports),e=null),t.exports);(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var t=1e3,n=1001,r=1002,i=1003,a=1004,o=1005,s=1006,c=1007,l=1008,u=1009,d=1010,f=1011,p=1012,m=1013,h=1014,g=1015,_=1016,v=1017,y=1018,b=1020,x=35902,S=35899,C=1021,w=1022,T=1023,E=1026,D=1027,O=1028,ee=1029,k=1030,A=1031,te=1033,ne=33776,j=33777,re=33778,M=33779,ie=35840,ae=35841,oe=35842,se=35843,ce=36196,le=37492,ue=37496,N=37488,de=37489,fe=37490,pe=37491,me=37808,he=37809,ge=37810,_e=37811,ve=37812,ye=37813,be=37814,xe=37815,Se=37816,Ce=37817,we=37818,Te=37819,Ee=37820,De=37821,Oe=36492,ke=36494,Ae=36495,je=36283,Me=36284,Ne=36285,Pe=36286,P=2300,Fe=2301,Ie=2302,Le=2303,F=2400,Re=2401,I=2402,ze=3200,Be=`srgb`,Ve=`srgb-linear`,He=`linear`,Ue=`srgb`,We=7680,Ge=35044,Ke=35048,qe=2e3;function Je(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ye(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Xe(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ze(){let e=Xe(`canvas`);return e.style.display=`block`,e}var Qe={};function $e(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function et(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=et(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=et(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function tt(...e){let t=e.join(` `);t in Qe||(Qe[t]=!0,L(...e))}function nt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var rt={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},it=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},at=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),ot=1234567,st=Math.PI/180,ct=180/Math.PI;function lt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(at[e&255]+at[e>>8&255]+at[e>>16&255]+at[e>>24&255]+`-`+at[t&255]+at[t>>8&255]+`-`+at[t>>16&15|64]+at[t>>24&255]+`-`+at[n&63|128]+at[n>>8&255]+`-`+at[n>>16&255]+at[n>>24&255]+at[r&255]+at[r>>8&255]+at[r>>16&255]+at[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function ut(e,t){return(e%t+t)%t}function dt(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function ft(e,t,n){return e===t?0:(n-e)/(t-e)}function pt(e,t,n){return(1-n)*e+n*t}function mt(e,t,n,r){return pt(e,t,1-Math.exp(-n*r))}function ht(e,t=1){return t-Math.abs(ut(e,t*2)-t)}function gt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function _t(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function vt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function yt(e,t){return e+Math.random()*(t-e)}function bt(e){return e*(.5-Math.random())}function xt(e){e!==void 0&&(ot=e);let t=ot+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function St(e){return e*st}function Ct(e){return e*ct}function wt(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Tt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function Et(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Dt(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:L(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function Ot(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function kt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var At={DEG2RAD:st,RAD2DEG:ct,generateUUID:lt,clamp:z,euclideanModulo:ut,mapLinear:dt,inverseLerp:ft,lerp:pt,damp:mt,pingpong:ht,smoothstep:gt,smootherstep:_t,randInt:vt,randFloat:yt,randFloatSpread:bt,seededRandom:xt,degToRad:St,radToDeg:Ct,isPowerOfTwo:wt,ceilPowerOfTwo:Tt,floorPowerOfTwo:Et,setQuaternionFromProperEuler:Dt,normalize:kt,denormalize:Ot},B=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},jt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Nt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Nt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Mt.copy(this).projectOnVector(e),this.sub(Mt)}reflect(e){return this.sub(Mt.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Mt=new V,Nt=new jt,H=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return tt(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(Pt.makeScale(e,t)),this}rotate(e){return tt(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(Pt.makeRotation(-e)),this}translate(e,t){return tt(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(Pt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Pt=new H,Ft=new H().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),It=new H().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Lt(){let e={enabled:!0,workingColorSpace:Ve,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=zt(e.r),e.g=zt(e.g),e.b=zt(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Bt(e.r),e.g=Bt(e.g),e.b=Bt(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?He:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return tt(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return tt(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ve]:{primaries:t,whitePoint:r,transfer:He,toXYZ:Ft,fromXYZ:It,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Be},outputColorSpaceConfig:{drawingBufferColorSpace:Be}},[Be]:{primaries:t,whitePoint:r,transfer:Ue,toXYZ:Ft,fromXYZ:It,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Be}}}),e}var Rt=Lt();function zt(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Bt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Vt,Ht=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Vt===void 0&&(Vt=Xe(`canvas`)),Vt.width=e.width,Vt.height=e.height;let t=Vt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Vt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Xe(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=zt(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(zt(t[e]/255)*255):t[e]=zt(t[e]);return{data:t,width:e.width,height:e.height}}return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Ut=0,Wt=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Ut++}),this.uuid=lt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Gt(r[t].image)):e.push(Gt(r[t]))}else e=Gt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Gt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Ht.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}var Kt=0,qt=new V,Jt=class e extends it{constructor(t=e.DEFAULT_IMAGE,r=e.DEFAULT_MAPPING,i=n,a=n,o=s,c=l,d=T,f=u,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Kt++}),this.uuid=lt(),this.name=``,this.source=new Wt(t),this.mipmaps=[],this.mapping=r,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=o,this.minFilter=c,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new H,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(qt).x}get height(){return this.source.getSize(qt).y}get depth(){return this.source.getSize(qt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case t:e.x-=Math.floor(e.x);break;case n:e.x=e.x<0?0:1;break;case r:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case t:e.y-=Math.floor(e.y);break;case n:e.y=e.y<0?0:1;break;case r:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Jt.DEFAULT_IMAGE=null,Jt.DEFAULT_MAPPING=300,Jt.DEFAULT_ANISOTROPY=1;var Yt=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Xt=class extends it{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:s,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Yt(0,0,e,t),this.scissorTest=!1,this.viewport=new Yt(0,0,e,t),this.textures=[];let r=new Jt({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:s,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Wt(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Zt=class extends Xt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Qt=class extends Jt{constructor(e=null,t=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},$t=class extends Jt{constructor(e=null,t=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:a},this.magFilter=i,this.minFilter=i,this.wrapR=n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},en=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/tn.setFromMatrixColumn(e,0).length(),i=1/tn.setFromMatrixColumn(e,1).length(),a=1/tn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(rn,e,an)}lookAt(e,t,n){let r=this.elements;return cn.subVectors(e,t),cn.lengthSq()===0&&(cn.z=1),cn.normalize(),on.crossVectors(n,cn),on.lengthSq()===0&&(Math.abs(n.z)===1?cn.x+=1e-4:cn.z+=1e-4,cn.normalize(),on.crossVectors(n,cn)),on.normalize(),sn.crossVectors(cn,on),r[0]=on.x,r[4]=sn.x,r[8]=cn.x,r[1]=on.y,r[5]=sn.y,r[9]=cn.y,r[2]=on.z,r[6]=sn.z,r[10]=cn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],ee=r[2],k=r[6],A=r[10],te=r[14],ne=r[3],j=r[7],re=r[11],M=r[15];return i[0]=a*x+o*T+s*ee+c*ne,i[4]=a*S+o*E+s*k+c*j,i[8]=a*C+o*D+s*A+c*re,i[12]=a*w+o*O+s*te+c*M,i[1]=l*x+u*T+d*ee+f*ne,i[5]=l*S+u*E+d*k+f*j,i[9]=l*C+u*D+d*A+f*re,i[13]=l*w+u*O+d*te+f*M,i[2]=p*x+m*T+h*ee+g*ne,i[6]=p*S+m*E+h*k+g*j,i[10]=p*C+m*D+h*A+g*re,i[14]=p*w+m*O+h*te+g*M,i[3]=_*x+v*T+y*ee+b*ne,i[7]=_*S+v*E+y*k+b*j,i[11]=_*C+v*D+y*A+b*re,i[15]=_*w+v*O+y*te+b*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,ee=_*O-v*D+y*E+b*T-x*w+S*C;if(ee===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/ee;return e[0]=(o*O-s*D+c*E)*k,e[1]=(r*D-n*O-i*E)*k,e[2]=(m*S-h*x+g*b)*k,e[3]=(d*x-u*S-f*b)*k,e[4]=(s*T-a*O-c*w)*k,e[5]=(t*O-r*T+i*w)*k,e[6]=(h*y-p*S-g*v)*k,e[7]=(l*S-d*y+f*v)*k,e[8]=(a*D-o*T+c*C)*k,e[9]=(n*T-t*D-i*C)*k,e[10]=(p*x-m*y+g*_)*k,e[11]=(u*y-l*x-f*_)*k,e[12]=(o*w-a*E-s*C)*k,e[13]=(t*E-n*w+r*C)*k,e[14]=(m*v-p*b-h*_)*k,e[15]=(l*b-u*v+d*_)*k,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=tn.set(r[0],r[1],r[2]).length(),o=tn.set(r[4],r[5],r[6]).length(),s=tn.set(r[8],r[9],r[10]).length();i<0&&(a=-a),nn.copy(this);let c=1/a,l=1/o,u=1/s;return nn.elements[0]*=c,nn.elements[1]*=c,nn.elements[2]*=c,nn.elements[4]*=l,nn.elements[5]*=l,nn.elements[6]*=l,nn.elements[8]*=u,nn.elements[9]*=u,nn.elements[10]*=u,t.setFromRotationMatrix(nn),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=qe,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=qe,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},tn=new V,nn=new en,rn=new V(0,0,0),an=new V(1,1,1),on=new V,sn=new V,cn=new V,ln=new en,un=new jt,dn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ln.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ln,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return un.setFromEuler(this),this.setFromQuaternion(un,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};dn.DEFAULT_ORDER=`XYZ`;var fn=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},pn=0,mn=new V,hn=new jt,gn=new en,_n=new V,vn=new V,yn=new V,bn=new jt,xn=new V(1,0,0),Sn=new V(0,1,0),Cn=new V(0,0,1),wn={type:`added`},Tn={type:`removed`},En={type:`childadded`,child:null},Dn={type:`childremoved`,child:null},On=class e extends it{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:pn++}),this.uuid=lt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new dn,r=new jt,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new en},normalMatrix:{value:new H}}),this.matrix=new en,this.matrixWorld=new en,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new fn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return hn.setFromAxisAngle(e,t),this.quaternion.multiply(hn),this}rotateOnWorldAxis(e,t){return hn.setFromAxisAngle(e,t),this.quaternion.premultiply(hn),this}rotateX(e){return this.rotateOnAxis(xn,e)}rotateY(e){return this.rotateOnAxis(Sn,e)}rotateZ(e){return this.rotateOnAxis(Cn,e)}translateOnAxis(e,t){return mn.copy(e).applyQuaternion(this.quaternion),this.position.add(mn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(xn,e)}translateY(e){return this.translateOnAxis(Sn,e)}translateZ(e){return this.translateOnAxis(Cn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(gn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?_n.copy(e):_n.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),vn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?gn.lookAt(vn,_n,this.up):gn.lookAt(_n,vn,this.up),this.quaternion.setFromRotationMatrix(gn),r&&(gn.extractRotation(r.matrixWorld),hn.setFromRotationMatrix(gn),this.quaternion.premultiply(hn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(wn),En.child=e,this.dispatchEvent(En),En.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Tn),Dn.child=e,this.dispatchEvent(Dn),Dn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),gn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),gn.multiply(e.parent.matrixWorld)),e.applyMatrix4(gn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(wn),En.child=e,this.dispatchEvent(En),En.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vn,e,yn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(vn,bn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};On.DEFAULT_UP=new V(0,1,0),On.DEFAULT_MATRIX_AUTO_UPDATE=!0,On.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var kn=class extends On{constructor(){super(),this.isGroup=!0,this.type=`Group`}},An={type:`move`},jn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new kn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new kn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new kn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(An)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new kn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Mn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Nn={h:0,s:0,l:0},Pn={h:0,s:0,l:0};function Fn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var U=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Be){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Rt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Rt.workingColorSpace){return this.r=e,this.g=t,this.b=n,Rt.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Rt.workingColorSpace){if(e=ut(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Fn(i,r,e+1/3),this.g=Fn(i,r,e),this.b=Fn(i,r,e-1/3)}return Rt.colorSpaceToWorking(this,r),this}setStyle(e,t=Be){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Be){let n=Mn[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=zt(e.r),this.g=zt(e.g),this.b=zt(e.b),this}copyLinearToSRGB(e){return this.r=Bt(e.r),this.g=Bt(e.g),this.b=Bt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Be){return Rt.workingToColorSpace(In.copy(this),e),Math.round(z(In.r*255,0,255))*65536+Math.round(z(In.g*255,0,255))*256+Math.round(z(In.b*255,0,255))}getHexString(e=Be){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Rt.workingColorSpace){Rt.workingToColorSpace(In.copy(this),t);let n=In.r,r=In.g,i=In.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Rt.workingColorSpace){return Rt.workingToColorSpace(In.copy(this),t),e.r=In.r,e.g=In.g,e.b=In.b,e}getStyle(e=Be){Rt.workingToColorSpace(In.copy(this),e);let t=In.r,n=In.g,r=In.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(Nn),this.setHSL(Nn.h+e,Nn.s+t,Nn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Nn),e.getHSL(Pn);let n=pt(Nn.h,Pn.h,t),r=pt(Nn.s,Pn.s,t),i=pt(Nn.l,Pn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},In=new U;U.NAMES=Mn;var Ln=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new U(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Rn=class extends On{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new dn,this.environmentIntensity=1,this.environmentRotation=new dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},zn=new V,Bn=new V,Vn=new V,Hn=new V,Un=new V,Wn=new V,Gn=new V,Kn=new V,qn=new V,Jn=new V,Yn=new Yt,Xn=new Yt,Zn=new Yt,Qn=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),zn.subVectors(e,t),r.cross(zn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){zn.subVectors(r,t),Bn.subVectors(n,t),Vn.subVectors(e,t);let a=zn.dot(zn),o=zn.dot(Bn),s=zn.dot(Vn),c=Bn.dot(Bn),l=Bn.dot(Vn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Hn)!==null&&Hn.x>=0&&Hn.y>=0&&Hn.x+Hn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Hn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Hn.x),s.addScaledVector(a,Hn.y),s.addScaledVector(o,Hn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Yn.setScalar(0),Xn.setScalar(0),Zn.setScalar(0),Yn.fromBufferAttribute(e,t),Xn.fromBufferAttribute(e,n),Zn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Yn,i.x),a.addScaledVector(Xn,i.y),a.addScaledVector(Zn,i.z),a}static isFrontFacing(e,t,n,r){return zn.subVectors(n,t),Bn.subVectors(e,t),zn.cross(Bn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return zn.subVectors(this.c,this.b),Bn.subVectors(this.a,this.b),zn.cross(Bn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Un.subVectors(r,n),Wn.subVectors(i,n),Kn.subVectors(e,n);let s=Un.dot(Kn),c=Wn.dot(Kn);if(s<=0&&c<=0)return t.copy(n);qn.subVectors(e,r);let l=Un.dot(qn),u=Wn.dot(qn);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(Un,a);Jn.subVectors(e,i);let f=Un.dot(Jn),p=Wn.dot(Jn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Wn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Gn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Gn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Un,a).addScaledVector(Wn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},$n=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(tr.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(tr.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=tr.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,tr):tr.fromBufferAttribute(r,t),tr.applyMatrix4(e.matrixWorld),this.expandByPoint(tr);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),nr.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),nr.copy(e.boundingBox)),nr.applyMatrix4(e.matrixWorld),this.union(nr)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,tr),tr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(lr),ur.subVectors(this.max,lr),rr.subVectors(e.a,lr),ir.subVectors(e.b,lr),ar.subVectors(e.c,lr),or.subVectors(ir,rr),sr.subVectors(ar,ir),cr.subVectors(rr,ar);let t=[0,-or.z,or.y,0,-sr.z,sr.y,0,-cr.z,cr.y,or.z,0,-or.x,sr.z,0,-sr.x,cr.z,0,-cr.x,-or.y,or.x,0,-sr.y,sr.x,0,-cr.y,cr.x,0];return!pr(t,rr,ir,ar,ur)||(t=[1,0,0,0,1,0,0,0,1],!pr(t,rr,ir,ar,ur))?!1:(dr.crossVectors(or,sr),t=[dr.x,dr.y,dr.z],pr(t,rr,ir,ar,ur))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,tr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(tr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(er[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),er[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),er[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),er[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),er[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),er[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),er[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),er[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(er)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},er=[new V,new V,new V,new V,new V,new V,new V,new V],tr=new V,nr=new $n,rr=new V,ir=new V,ar=new V,or=new V,sr=new V,cr=new V,lr=new V,ur=new V,dr=new V,fr=new V;function pr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){fr.fromArray(e,a);let o=i.x*Math.abs(fr.x)+i.y*Math.abs(fr.y)+i.z*Math.abs(fr.z),s=t.dot(fr),c=n.dot(fr),l=r.dot(fr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var mr=new V,hr=new B,gr=0,_r=class extends it{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:gr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Ge,this.updateRanges=[],this.gpuType=g,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)hr.fromBufferAttribute(this,t),hr.applyMatrix3(e),this.setXY(t,hr.x,hr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)mr.fromBufferAttribute(this,t),mr.applyMatrix3(e),this.setXYZ(t,mr.x,mr.y,mr.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)mr.fromBufferAttribute(this,t),mr.applyMatrix4(e),this.setXYZ(t,mr.x,mr.y,mr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)mr.fromBufferAttribute(this,t),mr.applyNormalMatrix(e),this.setXYZ(t,mr.x,mr.y,mr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)mr.fromBufferAttribute(this,t),mr.transformDirection(e),this.setXYZ(t,mr.x,mr.y,mr.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ot(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=kt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ot(t,this.array)),t}setX(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ot(t,this.array)),t}setY(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ot(t,this.array)),t}setZ(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ot(t,this.array)),t}setW(e,t){return this.normalized&&(t=kt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),r=kt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),r=kt(r,this.array),i=kt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},vr=class extends _r{constructor(e,t,n){super(new Uint16Array(e),t,n)}},yr=class extends _r{constructor(e,t,n){super(new Uint32Array(e),t,n)}},br=class extends _r{constructor(e,t,n){super(new Float32Array(e),t,n)}},xr=new $n,Sr=new V,Cr=new V,wr=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?xr.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Sr.subVectors(e,this.center);let t=Sr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(Sr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Cr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Sr.copy(e.center).add(Cr)),this.expandByPoint(Sr.copy(e.center).sub(Cr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Tr=0,Er=new en,Dr=new On,Or=new V,kr=new $n,Ar=new $n,jr=new V,Mr=class e extends it{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Tr++}),this.uuid=lt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Je(e)?yr:vr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new H().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Er.makeRotationFromQuaternion(e),this.applyMatrix4(Er),this}rotateX(e){return Er.makeRotationX(e),this.applyMatrix4(Er),this}rotateY(e){return Er.makeRotationY(e),this.applyMatrix4(Er),this}rotateZ(e){return Er.makeRotationZ(e),this.applyMatrix4(Er),this}translate(e,t,n){return Er.makeTranslation(e,t,n),this.applyMatrix4(Er),this}scale(e,t,n){return Er.makeScale(e,t,n),this.applyMatrix4(Er),this}lookAt(e){return Dr.lookAt(e),Dr.updateMatrix(),this.applyMatrix4(Dr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Or).negate(),this.translate(Or.x,Or.y,Or.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new br(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new $n);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];kr.setFromBufferAttribute(n),this.morphTargetsRelative?(jr.addVectors(this.boundingBox.min,kr.min),this.boundingBox.expandByPoint(jr),jr.addVectors(this.boundingBox.max,kr.max),this.boundingBox.expandByPoint(jr)):(this.boundingBox.expandByPoint(kr.min),this.boundingBox.expandByPoint(kr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new wr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);else if(e){let n=this.boundingSphere.center;if(kr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Ar.setFromBufferAttribute(n),this.morphTargetsRelative?(jr.addVectors(kr.min,Ar.min),kr.expandByPoint(jr),jr.addVectors(kr.max,Ar.max),kr.expandByPoint(jr)):(kr.expandByPoint(Ar.min),kr.expandByPoint(Ar.max))}kr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)jr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(jr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)jr.fromBufferAttribute(a,t),o&&(Or.fromBufferAttribute(e,t),jr.add(Or)),r=Math.max(r,n.distanceToSquared(jr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new _r(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let c=new V,l=new V,u=new V,d=new B,f=new B,p=new B,m=new V,h=new V;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new V,y=new V,b=new V,x=new V;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new _r(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)jr.fromBufferAttribute(e,t),jr.normalize(),e.setXYZ(t,jr.x,jr.y,jr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new _r(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},Nr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Ge,this.updateRanges=[],this.version=0,this.uuid=lt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Pr=new V,Fr=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Pr.fromBufferAttribute(this,t),Pr.applyMatrix4(e),this.setXYZ(t,Pr.x,Pr.y,Pr.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Pr.fromBufferAttribute(this,t),Pr.applyNormalMatrix(e),this.setXYZ(t,Pr.x,Pr.y,Pr.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Pr.fromBufferAttribute(this,t),Pr.transformDirection(e),this.setXYZ(t,Pr.x,Pr.y,Pr.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Ot(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=kt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=kt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=kt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=kt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=kt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ot(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ot(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ot(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ot(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),r=kt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=kt(t,this.array),n=kt(n,this.array),r=kt(r,this.array),i=kt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){$e(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new _r(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){$e(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Ir=new V,Lr=new V,Rr=new H,zr=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Ir.subVectors(n,t).cross(Lr.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Ir),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Rr.getNormalMatrix(e),r=this.coplanarPoint(Ir).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Br=0,Vr=class extends it{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Br++}),this.uuid=lt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new U(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=We,this.stencilZFail=We,this.stencilZPass=We,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new U().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new zr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new B().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new B().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Hr=class extends Vr{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new U(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ur,Wr=new V,Gr=new V,Kr=new V,qr=new B,Jr=new B,Yr=new en,Xr=new V,Zr=new V,Qr=new V,$r=new B,ei=new B,ti=new B,ni=class extends On{constructor(e=new Hr){if(super(),this.isSprite=!0,this.type=`Sprite`,Ur===void 0){Ur=new Mr;let e=new Nr(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Ur.setIndex([0,1,2,0,2,3]),Ur.setAttribute(`position`,new Fr(e,3,0,!1)),Ur.setAttribute(`uv`,new Fr(e,2,3,!1))}this.geometry=Ur,this.material=e,this.center=new B(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&R(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Gr.setFromMatrixScale(this.matrixWorld),Yr.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Kr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Gr.multiplyScalar(-Kr.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;ri(Xr.set(-.5,-.5,0),Kr,a,Gr,r,i),ri(Zr.set(.5,-.5,0),Kr,a,Gr,r,i),ri(Qr.set(.5,.5,0),Kr,a,Gr,r,i),$r.set(0,0),ei.set(1,0),ti.set(1,1);let o=e.ray.intersectTriangle(Xr,Zr,Qr,!1,Wr);if(o===null&&(ri(Zr.set(-.5,.5,0),Kr,a,Gr,r,i),ei.set(0,1),o=e.ray.intersectTriangle(Xr,Qr,Zr,!1,Wr),o===null))return;let s=e.ray.origin.distanceTo(Wr);s<e.near||s>e.far||t.push({distance:s,point:Wr.clone(),uv:Qn.getInterpolation(Wr,Xr,Zr,Qr,$r,ei,ti,new B),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function ri(e,t,n,r,i,a){qr.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Jr.copy(qr):(Jr.x=a*qr.x-i*qr.y,Jr.y=i*qr.x+a*qr.y),e.copy(t),e.x+=Jr.x,e.y+=Jr.y,e.applyMatrix4(Yr)}var ii=new V,ai=new V,oi=new V,si=new V,ci=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ii)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=ii.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ii.copy(this.origin).addScaledVector(this.direction,t),ii.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){ai.copy(e).add(t).multiplyScalar(.5),oi.copy(t).sub(e).normalize(),si.copy(this.origin).sub(ai);let i=e.distanceTo(t)*.5,a=-this.direction.dot(oi),o=si.dot(this.direction),s=-si.dot(oi),c=si.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(ai).addScaledVector(oi,d),f}intersectSphere(e,t){if(e.radius<0)return null;ii.subVectors(e.center,this.origin);let n=ii.dot(this.direction),r=ii.dot(ii)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,ii)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,ee,k,A,te,ne;if(y>=b&&y>=x?(w=s,D=u,k=p,ne=g,s>=0?(S=c,C=l,T=d,E=f,O=m,ee=h,A=_,te=v):(S=l,C=c,T=f,E=d,O=h,ee=m,A=v,te=_)):b>=x?(w=c,D=d,k=m,ne=_,c>=0?(S=l,C=s,T=f,E=u,O=h,ee=p,A=v,te=g):(S=s,C=l,T=u,E=f,O=p,ee=h,A=g,te=v)):(w=l,D=f,k=h,ne=v,l>=0?(S=s,C=c,T=u,E=d,O=p,ee=m,A=g,te=_):(S=c,C=s,T=d,E=u,O=m,ee=p,A=_,te=g)),w===0)return null;let j=S/w,re=C/w,M=1/w,ie=T-j*D,ae=E-re*D,oe=O-j*k,se=ee-re*k,ce=A-j*ne,le=te-re*ne,ue=ce*se-le*oe,N=ie*le-ae*ce,de=oe*ae-se*ie;if(r){if(ue<0||N<0||de<0)return null}else if((ue<0||N<0||de<0)&&(ue>0||N>0||de>0))return null;let fe=ue+N+de;if(fe===0)return null;let pe=M*(ue*D+N*k+de*ne);return(fe>0?pe<0:pe>0)?null:this.at(pe/fe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},li=class extends Vr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new U(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new dn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ui=new en,di=new ci,fi=new wr,pi=new V,mi=new V,hi=new V,gi=new V,_i=new V,vi=new V,yi=new V,bi=new V,W=class extends On{constructor(e=new Mr,t=new li){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){vi.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(_i.fromBufferAttribute(s,e),a?vi.addScaledVector(_i,r):vi.addScaledVector(_i.sub(t),r))}t.add(vi)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),fi.copy(n.boundingSphere),fi.applyMatrix4(i),di.copy(e.ray).recast(e.near),!(fi.containsPoint(di.origin)===!1&&(di.intersectSphere(fi,pi)===null||di.origin.distanceToSquared(pi)>(e.far-e.near)**2))&&(ui.copy(i).invert(),di.copy(e.ray).applyMatrix4(ui),(n.boundingBox===null||di.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,di)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=Si(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=Si(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=Si(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=Si(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function xi(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;bi.copy(s),bi.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(bi);return l<n.near||l>n.far?null:{distance:l,point:bi.clone(),object:e}}function Si(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,mi),e.getVertexPosition(c,hi),e.getVertexPosition(l,gi);let u=xi(e,t,n,r,mi,hi,gi,yi);if(u){let e=new V;Qn.getBarycoord(yi,mi,hi,gi,e),i&&(u.uv=Qn.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=Qn.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=Qn.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};Qn.getNormal(mi,hi,gi,t.normal),u.face=t,u.barycoord=e}return u}var Ci=class extends Jt{constructor(e=null,t=1,n=1,r,a,o,s,c,l=i,u=i,d,f){super(null,o,s,c,l,u,r,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},wi=class extends _r{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ti=new en,Ei=new en,Di=[],Oi=new $n,ki=new en,Ai=new W,ji=new wr,Mi=class extends W{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new wi(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,ki)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new $n),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ti),Oi.copy(e.boundingBox).applyMatrix4(Ti),this.boundingBox.union(Oi)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new wr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Ti),ji.copy(e.boundingSphere).applyMatrix4(Ti),this.boundingSphere.union(ji)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(Ai.geometry=this.geometry,Ai.material=this.material,Ai.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ji.copy(this.boundingSphere),ji.applyMatrix4(n),e.ray.intersectsSphere(ji)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Ti),Ei.multiplyMatrices(n,Ti),Ai.matrixWorld=Ei,Ai.raycast(e,Di);for(let e=0,n=Di.length;e<n;e++){let n=Di[e];n.instanceId=i,n.object=this,t.push(n)}Di.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new wi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ci(new Float32Array(r*this.count),r,this.count,O,g));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ni=new wr,Pi=new B(.5,.5),Fi=new V,Ii=class{constructor(e=new zr,t=new zr,n=new zr,r=new zr,i=new zr,a=new zr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=qe,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ni.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ni.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ni)}intersectsSprite(e){return Ni.center.set(0,0,0),Ni.radius=.7071067811865476+Pi.distanceTo(e.center),Ni.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ni)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Fi.x=r.normal.x>0?e.max.x:e.min.x,Fi.y=r.normal.y>0?e.max.y:e.min.y,Fi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Fi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Li=class extends Vr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new U(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ri=new en,zi=new ci,Bi=new wr,Vi=new V,Hi=class extends On{constructor(e=new Mr,t=new Li){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Bi.copy(n.boundingSphere),Bi.applyMatrix4(r),Bi.radius+=i,e.ray.intersectsSphere(Bi)===!1)return;Ri.copy(r).invert(),zi.copy(e.ray).applyMatrix4(Ri);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Vi.fromBufferAttribute(l,n),Ui(Vi,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Vi.fromBufferAttribute(l,a),Ui(Vi,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Ui(e,t,n,r,i,a,o){let s=zi.distanceSqToPoint(e);if(s<n){let n=new V;zi.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Wi=class extends Jt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Gi=class extends Jt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ki=class extends Jt{constructor(e,t,n=h,r,a,o,s=i,c=i,l,u=E,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Wt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},qi=class extends Ki{constructor(e,t=h,n=301,r,a,o=i,s=i,c,l=E){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,r,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ji=class extends Jt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Yi=class e extends Mr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new br(c,3)),this.setAttribute(`normal`,new br(l,3)),this.setAttribute(`uv`,new br(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Xi=class e extends Mr{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new V,g=new V;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new br(o,3)),this.setAttribute(`normal`,new br(s,3)),this.setAttribute(`uv`,new br(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},Zi=class e extends Mr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new V,l=new B;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new br(a,3)),this.setAttribute(`normal`,new br(o,3)),this.setAttribute(`uv`,new br(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Qi=class e extends Mr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new br(u,3)),this.setAttribute(`normal`,new br(d,3)),this.setAttribute(`uv`,new br(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},$i=class e extends Qi{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},ea=class e extends Mr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new br(i,3)),this.setAttribute(`normal`,new br(i.slice(),3)),this.setAttribute(`uv`,new br(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},ta=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){L(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new B:new V);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new V,r=[],i=[],a=[],o=new V,s=new en;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new V)}i[0]=new V,a[0]=new V;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(z(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(z(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},na=class extends ta{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new B){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ra=class extends na{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function ia(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var aa=new V,oa=new V,sa=new ia,ca=new ia,la=new ia,ua=class extends ta{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new V){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(oa.subVectors(r[0],r[1]).add(r[0]),c=oa);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(aa.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=aa),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),sa.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),ca.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),la.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(sa.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),ca.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),la.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(sa.calc(s),ca.calc(s),la.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new V().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function da(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function fa(e,t){let n=1-e;return n*n*t}function pa(e,t){return 2*(1-e)*e*t}function ma(e,t){return e*e*t}function ha(e,t,n,r){return fa(e,t)+pa(e,n)+ma(e,r)}function ga(e,t){let n=1-e;return n*n*n*t}function _a(e,t){let n=1-e;return 3*n*n*e*t}function va(e,t){return 3*(1-e)*e*e*t}function ya(e,t){return e*e*e*t}function ba(e,t,n,r,i){return ga(e,t)+_a(e,n)+va(e,r)+ya(e,i)}var xa=class extends ta{constructor(e=new B,t=new B,n=new B,r=new B){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(ba(e,r.x,i.x,a.x,o.x),ba(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Sa=class extends ta{constructor(e=new V,t=new V,n=new V,r=new V){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(ba(e,r.x,i.x,a.x,o.x),ba(e,r.y,i.y,a.y,o.y),ba(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ca=class extends ta{constructor(e=new B,t=new B){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new B){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new B){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},wa=class extends ta{constructor(e=new V,t=new V){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new V){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new V){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ta=class extends ta{constructor(e=new B,t=new B,n=new B){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new B){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(ha(e,r.x,i.x,a.x),ha(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ea=class extends ta{constructor(e=new V,t=new V,n=new V){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new V){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(ha(e,r.x,i.x,a.x),ha(e,r.y,i.y,a.y),ha(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Da=class extends ta{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new B){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(da(o,s.x,c.x,l.x,u.x),da(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new B().fromArray(n))}return this}},Oa=Object.freeze({__proto__:null,ArcCurve:ra,CatmullRomCurve3:ua,CubicBezierCurve:xa,CubicBezierCurve3:Sa,EllipseCurve:na,LineCurve:Ca,LineCurve3:wa,QuadraticBezierCurve:Ta,QuadraticBezierCurve3:Ea,SplineCurve:Da}),ka=class extends ta{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new Oa[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new Oa[n.type]().fromJSON(n))}return this}},Aa=class extends ka{constructor(e){super(),this.type=`Path`,this.currentPoint=new B,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Ca(this.currentPoint.clone(),new B(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new Ta(this.currentPoint.clone(),new B(e,t),new B(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new xa(this.currentPoint.clone(),new B(e,t),new B(n,r),new B(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new Da([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new na(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ja=class extends Aa{constructor(e){super(e),this.uuid=lt(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new Aa().fromJSON(n))}return this}};function Ma(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=Na(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=Ba(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return Fa(a,o,n,s,c,l,0),o}function Na(e,t,n,r,i){let a;if(i===uo(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=so(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=so(i/r|0,e[i],e[i+1],a);return a&&$a(a,a.next)&&(co(a),a=a.next),a}function Pa(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&($a(n,n.next)||Qa(n.prev,n,n.next)===0)){if(co(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function Fa(e,t,n,r,i,a,o){if(!e)return;!o&&a&&Ga(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?La(e,r,i,a):Ia(e))t.push(c.i,e.i,l.i),co(e),e=l.next,s=l.next;else if(e=l,e===s){o?o===1?(e=Ra(Pa(e),t),Fa(e,t,n,r,i,a,2)):o===2&&za(e,t,n,r,i,a):Fa(Pa(e),t,n,r,i,a,1);break}}}function Ia(e){let t=e.prev,n=e,r=e.next;if(Qa(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&Xa(i,s,a,c,o,l,m.x,m.y)&&Qa(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function La(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Qa(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=qa(p,m,t,n,r),v=qa(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Xa(s,u,c,d,l,f,y.x,y.y)&&Qa(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Xa(s,u,c,d,l,f,b.x,b.y)&&Qa(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Xa(s,u,c,d,l,f,y.x,y.y)&&Qa(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Xa(s,u,c,d,l,f,b.x,b.y)&&Qa(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Ra(e,t){let n=e;do{let r=n.prev,i=n.next.next;!$a(r,i)&&eo(r,n,n.next,i)&&io(r,i)&&io(i,r)&&(t.push(r.i,n.i,i.i),co(n),co(n.next),n=e=i),n=n.next}while(n!==e);return Pa(n)}function za(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&Za(o,e)){let s=oo(o,e);o=Pa(o,o.next),s=Pa(s,s.next),Fa(o,t,n,r,i,a,0),Fa(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function Ba(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=Na(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(Ja(o))}i.sort(Va);for(let e=0;e<i.length;e++)n=Ha(i[e],n);return n}function Va(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function Ha(e,t){let n=Ua(e,t);if(!n)return t;let r=oo(n,e);return Pa(r,r.next),Pa(n,n.next)}function Ua(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if($a(e,n))return n;do{if($a(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&Ya(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);io(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&Wa(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function Wa(e,t){return Qa(e.prev,e,t.prev)<0&&Qa(t.next,e,e.next)<0}function Ga(e,t,n,r){let i=e;do i.z===0&&(i.z=qa(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,Ka(i)}function Ka(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function qa(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function Ja(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Ya(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function Xa(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&Ya(e,t,n,r,i,a,o,s)}function Za(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!ro(e,t)&&(io(e,t)&&io(t,e)&&ao(e,t)&&(Qa(e.prev,e,t.prev)||Qa(e,t.prev,t))||$a(e,t)&&Qa(e.prev,e,e.next)>0&&Qa(t.prev,t,t.next)>0)}function Qa(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function $a(e,t){return e.x===t.x&&e.y===t.y}function eo(e,t,n,r){let i=no(Qa(e,t,n)),a=no(Qa(e,t,r)),o=no(Qa(n,r,e)),s=no(Qa(n,r,t));return!!(i!==a&&o!==s||i===0&&to(e,n,t)||a===0&&to(e,r,t)||o===0&&to(n,e,r)||s===0&&to(n,t,r))}function to(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function no(e){return e>0?1:e<0?-1:0}function ro(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&eo(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function io(e,t){return Qa(e.prev,e,e.next)<0?Qa(e,t,e.next)>=0&&Qa(e,e.prev,t)>=0:Qa(e,t,e.prev)<0||Qa(e,e.next,t)<0}function ao(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function oo(e,t){let n=lo(e.i,e.x,e.y),r=lo(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function so(e,t,n,r){let i=lo(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function co(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function lo(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function uo(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var fo=class{static triangulate(e,t,n=2){return Ma(e,t,n)}},po=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];mo(e),ho(n,e);let a=e.length;t.forEach(mo);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,ho(n,t[e]);let o=fo.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function mo(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function ho(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var go=class e extends Mr{constructor(e=new ja([new B(.5,.5),new B(-.5,.5),new B(-.5,-.5),new B(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new br(r,3)),this.setAttribute(`uv`,new br(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0||t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?_o:t.UVGenerator,g,_=!1,v,y,b,x;if(m){g=m.getSpacedPoints(s),_=!0,l=!1;let e=m.isCatmullRomCurve3?m.closed:!1;v=m.computeFrenetFrames(s,e),y=new V,b=new V,x=new V}l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!po.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];po.isClockWise(t)&&(w[e]=t.reverse())}}function T(e){let t=e[0];for(let n=1;n<=e.length;n++){let r=n%e.length,i=e[r],a=i.x-t.x,o=i.y-t.y,s=a*a+o*o,c=Math.max(Math.abs(i.x),Math.abs(i.y),Math.abs(t.x),Math.abs(t.y));s<=10000000000000001e-36*c*c?(e.splice(r,1),n--):t=i}}T(C),w.forEach(T);let E=w.length,D=C;for(let e=0;e<E;e++){let t=w[e];C=C.concat(t)}function O(e,t,n){return t||R(`ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let ee=C.length;function k(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new B(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new B(r/a,i/a)}let A=[];for(let e=0,t=D.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),A[e]=k(D[e],D[n],D[r]);let te=[],ne,j=A.concat();for(let e=0,t=E;e<t;e++){let t=w[e];ne=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),ne[e]=k(t[e],t[r],t[i]);te.push(ne),j=j.concat(ne)}let re;if(p===0)re=po.triangulateShape(D,w);else{let e=[],t=[];for(let n=0;n<p;n++){let r=n/p,i=u*Math.cos(r*Math.PI/2),a=d*Math.sin(r*Math.PI/2)+f;for(let t=0,n=D.length;t<n;t++){let n=O(D[t],A[t],a);ce(n.x,n.y,-i),r===0&&e.push(n)}for(let e=0,n=E;e<n;e++){let n=w[e];ne=te[e];let o=[];for(let e=0,t=n.length;e<t;e++){let t=O(n[e],ne[e],a);ce(t.x,t.y,-i),r===0&&o.push(t)}r===0&&t.push(o)}}re=po.triangulateShape(e,t)}let M=re.length,ie=d+f;for(let e=0;e<ee;e++){let t=l?O(C[e],j[e],ie):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),ce(x.x,x.y,x.z)):ce(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<ee;t++){let n=l?O(C[t],j[t],ie):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),ce(x.x,x.y,x.z)):ce(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=D.length;e<t;e++){let t=O(D[e],A[e],r);ce(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];ne=te[e];for(let e=0,i=t.length;e<i;e++){let i=O(t[e],ne[e],r);_?ce(i.x,i.y+g[s-1].y,g[s-1].x+n):ce(i.x,i.y,c+n)}}}ae(),oe();function ae(){let e=r.length/3;if(l){let e=0,t=ee*e;for(let e=0;e<M;e++){let n=re[e];le(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=ee*e;for(let e=0;e<M;e++){let n=re[e];le(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<M;e++){let t=re[e];le(t[2],t[1],t[0])}for(let e=0;e<M;e++){let t=re[e];le(t[0]+ee*s,t[1]+ee*s,t[2]+ee*s)}}n.addGroup(e,r.length/3-e,0)}function oe(){let e=r.length/3,t=0;se(D,t),t+=D.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];se(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function se(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=ee*e,a=ee*(e+1);ue(t+r+n,t+i+n,t+i+a,t+r+a)}}}function ce(e,t,n){a.push(e),a.push(t),a.push(n)}function le(e,t,i){N(e),N(t),N(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);de(o[0]),de(o[1]),de(o[2])}function ue(e,t,i,a){N(e),N(t),N(a),N(t),N(i),N(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);de(s[0]),de(s[1]),de(s[3]),de(s[1]),de(s[2]),de(s[3])}function N(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function de(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return vo(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new Oa[i.type]().fromJSON(i)),new e(r,t.options)}},_o={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new B(a,o),new B(s,c),new B(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new B(o,1-c),new B(l,1-d),new B(f,1-m),new B(h,1-_)]:[new B(s,1-c),new B(u,1-d),new B(p,1-m),new B(g,1-_)]}};function vo(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var yo=class e extends ea{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},bo=class e extends Mr{constructor(e=[new B(0,-.5),new B(.5,0),new B(0,.5)],t=12,n=0,r=Math.PI*2){super(),this.type=`LatheGeometry`,this.parameters={points:e,segments:t,phiStart:n,phiLength:r},t=Math.floor(t),r=z(r,0,Math.PI*2);let i=[],a=[],o=[],s=[],c=[],l=1/t,u=new V,d=new B,f=new V,p=new V,m=new V,h=0,g=0;for(let t=0;t<=e.length-1;t++)switch(t){case 0:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,m.copy(f),f.normalize(),s.push(f.x,f.y,f.z);break;case e.length-1:s.push(m.x,m.y,m.z);break;default:h=e[t+1].x-e[t].x,g=e[t+1].y-e[t].y,f.x=g*1,f.y=-h,f.z=g*0,p.copy(f),f.x+=m.x,f.y+=m.y,f.z+=m.z,f.normalize(),s.push(f.x,f.y,f.z),m.copy(p)}for(let i=0;i<=t;i++){let f=n+i*l*r,p=Math.sin(f),m=Math.cos(f);for(let n=0;n<=e.length-1;n++){u.x=e[n].x*p,u.y=e[n].y,u.z=e[n].x*m,a.push(u.x,u.y,u.z),d.x=i/t,d.y=n/(e.length-1),o.push(d.x,d.y);let r=s[3*n+0]*p,l=s[3*n+1],f=s[3*n+0]*m;c.push(r,l,f)}}for(let n=0;n<t;n++)for(let t=0;t<e.length-1;t++){let r=t+n*e.length,a=r,o=r+e.length,s=r+e.length+1,c=r+1;i.push(a,o,c),i.push(s,c,o)}this.setIndex(i),this.setAttribute(`position`,new br(a,3)),this.setAttribute(`uv`,new br(o,2)),this.setAttribute(`normal`,new br(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.points,t.segments,t.phiStart,t.phiLength)}},xo=class e extends Mr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new br(p,3)),this.setAttribute(`normal`,new br(m,3)),this.setAttribute(`uv`,new br(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},So=class e extends Mr{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new V,p=new B;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new br(s,3)),this.setAttribute(`normal`,new br(c,3)),this.setAttribute(`uv`,new br(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Co=class e extends Mr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new V,d=new V,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new br(p,3)),this.setAttribute(`normal`,new br(m,3)),this.setAttribute(`uv`,new br(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},wo=class e extends Mr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new V,f=new V,p=new V;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new br(c,3)),this.setAttribute(`normal`,new br(l,3)),this.setAttribute(`uv`,new br(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function To(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Do(i))i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Do(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Eo(e){let t={};for(let n=0;n<e.length;n++){let r=To(e[n]);for(let e in r)t[e]=r[e]}return t}function Do(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Oo(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function ko(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Rt.workingColorSpace}var Ao={clone:To,merge:Eo},jo=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Mo=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,No=class extends Vr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=jo,this.fragmentShader=Mo,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=To(e.uniforms),this.uniformsGroups=Oo(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new U().setHex(r.value);break;case`v2`:this.uniforms[n].value=new B().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new V().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Yt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new H().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new en().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Po=class extends No{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Fo=class extends Vr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new U(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new U(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new dn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Io=class extends Vr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=ze,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Lo=class extends Vr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ro(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function zo(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Bo=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Vo=class extends Bo{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:F,endingEnd:F}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Re:i=e,o=2*t-n;break;case I:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Re:a=e,s=2*n-t;break;case I:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Ho=class extends Bo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Uo=class extends Bo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Wo=class extends Bo{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=qo(n,t,g,y,r);i[p]=Go(x,o,_,b,m)}return i}};function Go(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Ko(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function qo(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Go(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Ko(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Jo=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Ro(t,this.TimeBufferType),this.values=Ro(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ro(e.times,Array),values:Ro(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),zo(e.settings)&&(n.settings={inTangents:Ro(e.settings.inTangents,Array),outTangents:Ro(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Uo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ho(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Vo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Wo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case P:t=this.InterpolantFactoryMethodDiscrete;break;case Fe:t=this.InterpolantFactoryMethodLinear;break;case Ie:t=this.InterpolantFactoryMethodSmooth;break;case Le:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return P;case this.InterpolantFactoryMethodLinear:return Fe;case this.InterpolantFactoryMethodSmooth:return Ie;case this.InterpolantFactoryMethodBezier:return Le}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;zo(this.settings)&&(Yo(this.settings.inTangents,e),Yo(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Ye(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Ie,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,zo(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Yo(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Jo.prototype.ValueTypeName=``,Jo.prototype.TimeBufferType=Float32Array,Jo.prototype.ValueBufferType=Float32Array,Jo.prototype.DefaultInterpolation=Fe;var Xo=class extends Jo{constructor(e,t,n){super(e,t,n)}};Xo.prototype.ValueTypeName=`bool`,Xo.prototype.ValueBufferType=Array,Xo.prototype.DefaultInterpolation=P,Xo.prototype.InterpolantFactoryMethodLinear=void 0,Xo.prototype.InterpolantFactoryMethodSmooth=void 0;var Zo=class extends Jo{constructor(e,t,n,r){super(e,t,n,r)}};Zo.prototype.ValueTypeName=`color`;var Qo=class extends Jo{constructor(e,t,n,r){super(e,t,n,r)}};Qo.prototype.ValueTypeName=`number`;var $o=class extends Bo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)jt.slerpFlat(i,0,a,c-o,a,c,s);return i}},es=class extends Jo{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new $o(this.times,this.values,this.getValueSize(),e)}};es.prototype.ValueTypeName=`quaternion`,es.prototype.InterpolantFactoryMethodSmooth=void 0;var ts=class extends Jo{constructor(e,t,n){super(e,t,n)}};ts.prototype.ValueTypeName=`string`,ts.prototype.ValueBufferType=Array,ts.prototype.DefaultInterpolation=P,ts.prototype.InterpolantFactoryMethodLinear=void 0,ts.prototype.InterpolantFactoryMethodSmooth=void 0;var ns=class extends Jo{constructor(e,t,n,r){super(e,t,n,r)}};ns.prototype.ValueTypeName=`vector`;var rs=class extends On{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new U(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},is=class extends rs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(On.DEFAULT_UP),this.updateMatrix(),this.groundColor=new U(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},as=new en,os=new V,ss=new V,cs=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=u,this.map=null,this.mapPass=null,this.matrix=new en,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ii,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new Yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;os.setFromMatrixPosition(e.matrixWorld),t.position.copy(os),ss.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ss),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){as.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(as,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(as)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ls=new V,us=new jt,ds=new V,fs=class extends On{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new en,this.projectionMatrix=new en,this.projectionMatrixInverse=new en,this.coordinateSystem=qe,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ls,us,ds),ds.x===1&&ds.y===1&&ds.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ls,us,ds.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ls,us,ds),ds.x===1&&ds.y===1&&ds.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ls,us,ds.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ps=new V,ms=new B,hs=new B,gs=class extends fs{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ct*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(st*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ct*2*Math.atan(Math.tan(st*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ps.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ps.x,ps.y).multiplyScalar(-e/ps.z),ps.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ps.x,ps.y).multiplyScalar(-e/ps.z)}getViewSize(e,t){return this.getViewBounds(e,ms,hs),t.subVectors(hs,ms)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(st*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},_s=class extends cs{constructor(){super(new gs(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=ct*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},vs=class extends rs{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(On.DEFAULT_UP),this.updateMatrix(),this.target=new On,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new _s}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},ys=class extends cs{constructor(){super(new gs(90,1,.5,500)),this.isPointLightShadow=!0}},bs=class extends rs{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new ys}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},xs=class extends fs{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ss=class extends cs{constructor(){super(new xs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Cs=class extends rs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(On.DEFAULT_UP),this.updateMatrix(),this.target=new On,this.shadow=new Ss}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},ws=-90,Ts=1,Es=class extends On{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new gs(ws,Ts,e,t);r.layers=this.layers,this.add(r);let i=new gs(ws,Ts,e,t);i.layers=this.layers,this.add(i);let a=new gs(ws,Ts,e,t);a.layers=this.layers,this.add(a);let o=new gs(ws,Ts,e,t);o.layers=this.layers,this.add(o);let s=new gs(ws,Ts,e,t);s.layers=this.layers,this.add(s);let c=new gs(ws,Ts,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Ds=class extends gs{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Os=`\\[\\]\\.:\\/`,ks=RegExp(`[\\[\\]\\.:\\/]`,`g`),As=`[^\\[\\]\\.:\\/]`,js=`[^`+Os.replace(`\\.`,``)+`]`,Ms=`((?:WC+[\\/:])*)`.replace(`WC`,As),Ns=`(WCOD+)?`.replace(`WCOD`,js),Ps=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,As),Fs=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,As),Is=RegExp(`^`+Ms+Ns+Ps+Fs+`$`),Ls=[`material`,`materials`,`bones`,`map`],Rs=class{constructor(e,t,n){let r=n||zs.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},zs=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(ks,``)}static parseTrackName(e){let t=Is.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ls.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};zs.Composite=Rs,zs.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},zs.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},zs.prototype.GetterByBindingType=[zs.prototype._getValue_direct,zs.prototype._getValue_array,zs.prototype._getValue_arrayElement,zs.prototype._getValue_toArray],zs.prototype.SetterByBindingTypeAndVersioning=[[zs.prototype._setValue_direct,zs.prototype._setValue_direct_setNeedsUpdate,zs.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[zs.prototype._setValue_array,zs.prototype._setValue_array_setNeedsUpdate,zs.prototype._setValue_array_setMatrixWorldNeedsUpdate],[zs.prototype._setValue_arrayElement,zs.prototype._setValue_arrayElement_setNeedsUpdate,zs.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[zs.prototype._setValue_fromArray,zs.prototype._setValue_fromArray_setNeedsUpdate,zs.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function Bs(e,t,n,r){let i=Vs(r);switch(n){case C:return e*t;case O:return e*t/i.components*i.byteLength;case ee:return e*t/i.components*i.byteLength;case k:return e*t*2/i.components*i.byteLength;case A:return e*t*2/i.components*i.byteLength;case w:return e*t*3/i.components*i.byteLength;case T:return e*t*4/i.components*i.byteLength;case te:return e*t*4/i.components*i.byteLength;case ne:case j:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case re:case M:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ae:case se:return Math.max(e,16)*Math.max(t,8)/4;case ie:case oe:return Math.max(e,8)*Math.max(t,8)/2;case ce:case le:case N:case de:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case ue:case fe:case pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case me:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case he:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case ge:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case _e:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ve:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ye:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case be:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case xe:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Ce:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case we:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Te:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Ee:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case De:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case Oe:case ke:case Ae:return Math.ceil(e/4)*Math.ceil(t/4)*16;case je:case Me:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Ne:case Pe:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Vs(e){switch(e){case u:case d:return{byteLength:1,components:1};case p:case f:case _:return{byteLength:2,components:1};case v:case y:return{byteLength:2,components:4};case h:case m:case g:return{byteLength:4,components:1};case x:case S:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function Hs(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Us(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var G={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},K={common:{diffuse:{value:new U(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new U(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new V},probesMax:{value:new V},probesResolution:{value:new V}},points:{diffuse:{value:new U(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new U(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},Ws={basic:{uniforms:Eo([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.fog]),vertexShader:G.meshbasic_vert,fragmentShader:G.meshbasic_frag},lambert:{uniforms:Eo([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.fog,K.lights,{emissive:{value:new U(0)},envMapIntensity:{value:1}}]),vertexShader:G.meshlambert_vert,fragmentShader:G.meshlambert_frag},phong:{uniforms:Eo([K.common,K.specularmap,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.fog,K.lights,{emissive:{value:new U(0)},specular:{value:new U(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:G.meshphong_vert,fragmentShader:G.meshphong_frag},standard:{uniforms:Eo([K.common,K.envmap,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.roughnessmap,K.metalnessmap,K.fog,K.lights,{emissive:{value:new U(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:G.meshphysical_vert,fragmentShader:G.meshphysical_frag},toon:{uniforms:Eo([K.common,K.aomap,K.lightmap,K.emissivemap,K.bumpmap,K.normalmap,K.displacementmap,K.gradientmap,K.fog,K.lights,{emissive:{value:new U(0)}}]),vertexShader:G.meshtoon_vert,fragmentShader:G.meshtoon_frag},matcap:{uniforms:Eo([K.common,K.bumpmap,K.normalmap,K.displacementmap,K.fog,{matcap:{value:null}}]),vertexShader:G.meshmatcap_vert,fragmentShader:G.meshmatcap_frag},points:{uniforms:Eo([K.points,K.fog]),vertexShader:G.points_vert,fragmentShader:G.points_frag},dashed:{uniforms:Eo([K.common,K.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:G.linedashed_vert,fragmentShader:G.linedashed_frag},depth:{uniforms:Eo([K.common,K.displacementmap]),vertexShader:G.depth_vert,fragmentShader:G.depth_frag},normal:{uniforms:Eo([K.common,K.bumpmap,K.normalmap,K.displacementmap,{opacity:{value:1}}]),vertexShader:G.meshnormal_vert,fragmentShader:G.meshnormal_frag},sprite:{uniforms:Eo([K.sprite,K.fog]),vertexShader:G.sprite_vert,fragmentShader:G.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:G.background_vert,fragmentShader:G.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:G.backgroundCube_vert,fragmentShader:G.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:G.cube_vert,fragmentShader:G.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:G.equirect_vert,fragmentShader:G.equirect_frag},distance:{uniforms:Eo([K.common,K.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:G.distance_vert,fragmentShader:G.distance_frag},shadow:{uniforms:Eo([K.lights,K.fog,{color:{value:new U(0)},opacity:{value:1}}]),vertexShader:G.shadow_vert,fragmentShader:G.shadow_frag}};Ws.physical={uniforms:Eo([Ws.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new U(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new U(0)},specularColor:{value:new U(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:G.meshphysical_vert,fragmentShader:G.meshphysical_frag};var Gs={r:0,b:0,g:0},Ks=new en,qs=new H;qs.set(-1,0,0,0,1,0,0,0,1);function Js(e,t,n,r,i,a){let o=new U(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new W(new Yi(1,1,1),new No({name:`BackgroundCubeMaterial`,uniforms:To(Ws.backgroundCube.uniforms),vertexShader:Ws.backgroundCube.vertexShader,fragmentShader:Ws.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Ks.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(qs),l.material.toneMapped=Rt.getTransfer(i.colorSpace)!==Ue,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new W(new xo(2,2),new No({name:`BackgroundMaterial`,uniforms:To(Ws.background.uniforms),vertexShader:Ws.background.vertexShader,fragmentShader:Ws.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=Rt.getTransfer(i.colorSpace)!==Ue,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Gs,ko(e)),n.buffers.color.setClear(Gs.r,Gs.g,Gs.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Ys(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Xs(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Zs(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&L(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Qs(e){let t=this,n=null,r=0,i=!1,a=!1,o=new zr,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var $s=4,ec=6,tc=20,nc=256,rc=new xs,ic=new U,ac=null,oc=0,sc=0,cc=!1,lc=new V,uc=new V,dc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=lc}=i;ac=this._renderer.getRenderTarget(),oc=this._renderer.getActiveCubeFace(),sc=this._renderer.getActiveMipmapLevel(),cc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=vc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_c(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ac,oc,sc),this._renderer.xr.enabled=cc,e.scissorTest=!1,mc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ac=this._renderer.getRenderTarget(),oc=this._renderer.getActiveCubeFace(),sc=this._renderer.getActiveMipmapLevel(),cc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:s,minFilter:s,generateMipmaps:!1,type:_,format:T,colorSpace:Ve,depthBuffer:!1},r=pc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=pc(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=fc(r)),this._blurMaterial=gc(r,e,t),this._ggxMaterial=hc(r,e,t)}return r}_compileMaterial(e){let t=new W(new Mr,e);this._renderer.compile(t,rc)}_sceneToCubeUV(e,t,n,r,i){let a=new gs(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(ic),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new W(new Yi,new li({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(ic),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;mc(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=vc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_c());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;mc(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,rc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-$s?n-d+$s:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,mc(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,rc),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,mc(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,rc)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];mc(t,3*l*(r>this._lodMax-$s?r-this._lodMax+$s:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,rc)}};function fc(e){let t=[],n=[],r=e,i=e-$s+1+ec;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?uc.set(1,r,n):e===1?uc.set(-n,1,-r):e===2?uc.set(-n,r,1):e===3?uc.set(-1,r,-n):e===4?uc.set(-n,-1,r):uc.set(n,r,-1),uc.toArray(l,(e*6+t)*3)}}let u=new Mr;u.setAttribute(`position`,new _r(c,3)),u.setAttribute(`outputDirection`,new _r(l,3)),n.push(new W(u,null)),r>$s&&r--}return{lodMeshes:n,sizeLods:t}}function pc(e,t,n){let r=new Zt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function mc(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function hc(e,t,n){return new No({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:nc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:yc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function gc(e,t,n){return new No({name:`SphericalGaussianBlur`,defines:{SAMPLES:tc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:yc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function _c(){return new No({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:yc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function vc(){return new No({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:yc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function yc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var bc=class extends Zt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Wi(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Yi(5,5,5),i=new No({name:`CubemapFromEquirect`,uniforms:To(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new W(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=s),new Es(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function xc(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new bc(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new dc(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new dc(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Sc(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&tt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Cc(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?yr:vr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function wc(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function Tc(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ec(e,t,n){let r=new WeakMap,i=new Yt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),_=new Qt(h,p,m,u);_.type=g,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new B(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Dc(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Oc={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function kc(e,t,n,r,i,a){let o=new Zt(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new Mr;l.setAttribute(`position`,new br([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new br([0,2,0,0,2,0],2));let u=new Po({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new W(l,u),f=new xs(-1,1,1,-1,0,1),p=null,m=null,h=!1,g,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new Zt(t,n,{type:_,depthBuffer:!1,stencilBuffer:!1}),c=new Zt(t,n,{type:_,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<y.length;e++){let r=y[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),g=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=g,h=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},Rt.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=Oc[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(d,f),v=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var Ac=new Jt,jc=new Ki(1,1),Mc=new Qt,Nc=new $t,Pc=new Wi,Fc=[],Ic=[],Lc=new Float32Array(16),Rc=new Float32Array(9),zc=new Float32Array(4);function Bc(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Fc[i];if(a===void 0&&(a=new Float32Array(i),Fc[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Vc(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Hc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Uc(e,t){let n=Ic[t];n===void 0&&(n=new Int32Array(t),Ic[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Wc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Gc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vc(n,t))return;e.uniform2fv(this.addr,t),Hc(n,t)}}function Kc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Vc(n,t))return;e.uniform3fv(this.addr,t),Hc(n,t)}}function qc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vc(n,t))return;e.uniform4fv(this.addr,t),Hc(n,t)}}function Jc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vc(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Hc(n,t)}else{if(Vc(n,r))return;zc.set(r),e.uniformMatrix2fv(this.addr,!1,zc),Hc(n,r)}}function Yc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vc(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Hc(n,t)}else{if(Vc(n,r))return;Rc.set(r),e.uniformMatrix3fv(this.addr,!1,Rc),Hc(n,r)}}function Xc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Vc(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Hc(n,t)}else{if(Vc(n,r))return;Lc.set(r),e.uniformMatrix4fv(this.addr,!1,Lc),Hc(n,r)}}function Zc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Qc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vc(n,t))return;e.uniform2iv(this.addr,t),Hc(n,t)}}function $c(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Vc(n,t))return;e.uniform3iv(this.addr,t),Hc(n,t)}}function el(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vc(n,t))return;e.uniform4iv(this.addr,t),Hc(n,t)}}function tl(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function nl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Vc(n,t))return;e.uniform2uiv(this.addr,t),Hc(n,t)}}function rl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Vc(n,t))return;e.uniform3uiv(this.addr,t),Hc(n,t)}}function il(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Vc(n,t))return;e.uniform4uiv(this.addr,t),Hc(n,t)}}function al(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(jc.compareFunction=n.isReversedDepthBuffer()?518:515,a=jc):a=Ac,n.setTexture2D(t||a,i)}function ol(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Nc,i)}function sl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Pc,i)}function cl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Mc,i)}function ll(e){switch(e){case 5126:return Wc;case 35664:return Gc;case 35665:return Kc;case 35666:return qc;case 35674:return Jc;case 35675:return Yc;case 35676:return Xc;case 5124:case 35670:return Zc;case 35667:case 35671:return Qc;case 35668:case 35672:return $c;case 35669:case 35673:return el;case 5125:return tl;case 36294:return nl;case 36295:return rl;case 36296:return il;case 35678:case 36198:case 36298:case 36306:case 35682:return al;case 35679:case 36299:case 36307:return ol;case 35680:case 36300:case 36308:case 36293:return sl;case 36289:case 36303:case 36311:case 36292:return cl}}function ul(e,t){e.uniform1fv(this.addr,t)}function dl(e,t){let n=Bc(t,this.size,2);e.uniform2fv(this.addr,n)}function fl(e,t){let n=Bc(t,this.size,3);e.uniform3fv(this.addr,n)}function pl(e,t){let n=Bc(t,this.size,4);e.uniform4fv(this.addr,n)}function ml(e,t){let n=Bc(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function hl(e,t){let n=Bc(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function gl(e,t){let n=Bc(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function _l(e,t){e.uniform1iv(this.addr,t)}function vl(e,t){e.uniform2iv(this.addr,t)}function yl(e,t){e.uniform3iv(this.addr,t)}function bl(e,t){e.uniform4iv(this.addr,t)}function xl(e,t){e.uniform1uiv(this.addr,t)}function Sl(e,t){e.uniform2uiv(this.addr,t)}function Cl(e,t){e.uniform3uiv(this.addr,t)}function wl(e,t){e.uniform4uiv(this.addr,t)}function Tl(e,t,n){let r=this.cache,i=t.length,a=Uc(n,i);Vc(r,a)||(e.uniform1iv(this.addr,a),Hc(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?jc:Ac;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function El(e,t,n){let r=this.cache,i=t.length,a=Uc(n,i);Vc(r,a)||(e.uniform1iv(this.addr,a),Hc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Nc,a[e])}function Dl(e,t,n){let r=this.cache,i=t.length,a=Uc(n,i);Vc(r,a)||(e.uniform1iv(this.addr,a),Hc(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Pc,a[e])}function Ol(e,t,n){let r=this.cache,i=t.length,a=Uc(n,i);Vc(r,a)||(e.uniform1iv(this.addr,a),Hc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Mc,a[e])}function kl(e){switch(e){case 5126:return ul;case 35664:return dl;case 35665:return fl;case 35666:return pl;case 35674:return ml;case 35675:return hl;case 35676:return gl;case 5124:case 35670:return _l;case 35667:case 35671:return vl;case 35668:case 35672:return yl;case 35669:case 35673:return bl;case 5125:return xl;case 36294:return Sl;case 36295:return Cl;case 36296:return wl;case 35678:case 36198:case 36298:case 36306:case 35682:return Tl;case 35679:case 36299:case 36307:return El;case 35680:case 36300:case 36308:case 36293:return Dl;case 36289:case 36303:case 36311:case 36292:return Ol}}var Al=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ll(t.type)}},jl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=kl(t.type)}},Ml=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Nl=/(\w+)(\])?(\[|\.)?/g;function Pl(e,t){e.seq.push(t),e.map[t.id]=t}function Fl(e,t,n){let r=e.name,i=r.length;for(Nl.lastIndex=0;;){let a=Nl.exec(r),o=Nl.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Pl(n,l===void 0?new Al(s,e,t):new jl(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Ml(s),Pl(n,e)),n=e}}}var Il=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Fl(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Ll(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Rl=37297,zl=0;function Bl(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Vl=new H;function Hl(e){Rt._getMatrix(Vl,Rt.workingColorSpace,e);let t=`mat3( ${Vl.elements.map(e=>e.toFixed(4))} )`;switch(Rt.getTransfer(e)){case He:return[t,`LinearTransferOETF`];case Ue:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Ul(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Bl(e.getShaderSource(t),r)}return i}function Wl(e,t){let n=Hl(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Gl={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Kl(e,t){let n=Gl[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var ql=new V;function Jl(){return Rt.getLuminanceCoefficients(ql),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${ql.x.toFixed(4)}, ${ql.y.toFixed(4)}, ${ql.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Yl(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Ql).join(`
`)}function Xl(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Zl(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Ql(e){return e!==``}function $l(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function eu(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var tu=/^[ \t]*#include +<([\w\d./]+)>/gm;function nu(e){return e.replace(tu,iu)}var ru=new Map;function iu(e,t){let n=G[t];if(n===void 0){let e=ru.get(t);if(e!==void 0)n=G[e],L(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return nu(n)}var au=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ou(e){return e.replace(au,su)}function su(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function cu(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var lu={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function uu(e){return lu[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var du={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function fu(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:du[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var pu={302:`ENVMAP_MODE_REFRACTION`};function mu(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:pu[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var hu={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function gu(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:hu[e.combine]||`ENVMAP_BLENDING_NONE`}function _u(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function vu(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=uu(n),l=fu(n),u=mu(n),d=gu(n),f=_u(n),p=Yl(n),m=Xl(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Ql).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Ql).join(`
`),_.length>0&&(_+=`
`)):(g=[cu(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Ql).join(`
`),_=[cu(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:G.tonemapping_pars_fragment,n.toneMapping===0?``:Kl(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,G.colorspace_pars_fragment,Wl(`linearToOutputTexel`,n.outputColorSpace),Jl(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Ql).join(`
`)),o=nu(o),o=$l(o,n),o=eu(o,n),s=nu(s),s=$l(s,n),s=eu(s,n),o=ou(o),s=ou(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Ll(i,i.VERTEX_SHADER,y),S=Ll(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Ul(i,x,`vertex`),n=Ul(i,S,`fragment`);R(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Il(i,h),T=Zl(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Rl)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=zl++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var yu=0,bu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new xu(e),t.set(e,n)),n}},xu=class{constructor(e){this.id=yu++,this.code=e,this.usedTimes=0}};function Su(e){return e===1030||e===37490||e===36285}function Cu(e,t,n,r,i,a){let o=new fn,s=new bu,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,ee,k;if(C){let e=Ws[C];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),ee=e.id,k=t.id}let A=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),ne=h.isInstancedMesh===!0,j=h.isBatchedMesh===!0,re=!!i.map,M=!!i.matcap,ie=!!x,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,N=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.dispersion>0,he=i.retroreflectivity>0,ge=i.iridescence>0,_e=i.sheen>0,ve=i.transmission>0,ye=fe&&!!i.anisotropyMap,be=pe&&!!i.clearcoatMap,xe=pe&&!!i.clearcoatNormalMap,Se=pe&&!!i.clearcoatRoughnessMap,Ce=ge&&!!i.iridescenceMap,we=ge&&!!i.iridescenceThicknessMap,Te=_e&&!!i.sheenColorMap,Ee=_e&&!!i.sheenRoughnessMap,De=!!i.specularMap,Oe=!!i.specularColorMap,ke=!!i.specularIntensityMap,Ae=ve&&!!i.transmissionMap,je=ve&&!!i.thicknessMap,Me=!!i.gradientMap,Ne=!!i.alphaMap,Pe=i.alphaTest>0,P=!!i.alphaHash,Fe=!!i.extensions,Ie=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Ie=e.toneMapping);let Le={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:ee,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:j,batchingColor:j&&h._colorsTexture!==null,instancing:ne,instancingColor:ne&&h.instanceColor!==null,instancingMorph:ne&&h.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Rt.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:re,matcap:M,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&Su(i.normalMap.format),metalnessMap:N,roughnessMap:de,anisotropy:fe,anisotropyMap:ye,clearcoat:pe,clearcoatMap:be,clearcoatNormalMap:xe,clearcoatRoughnessMap:Se,dispersion:me,retroreflection:he,iridescence:ge,iridescenceMap:Ce,iridescenceThicknessMap:we,sheen:_e,sheenColorMap:Te,sheenRoughnessMap:Ee,specularMap:De,specularColorMap:Oe,specularIntensityMap:ke,transmission:ve,transmissionMap:Ae,thicknessMap:je,gradientMap:Me,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ne,alphaTest:Pe,alphaHash:P,combine:i.combine,mapUv:re&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:ce&&m(i.normalMap.channel),displacementMapUv:le&&m(i.displacementMap.channel),emissiveMapUv:ue&&m(i.emissiveMap.channel),metalnessMapUv:N&&m(i.metalnessMap.channel),roughnessMapUv:de&&m(i.roughnessMap.channel),anisotropyMapUv:ye&&m(i.anisotropyMap.channel),clearcoatMapUv:be&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:xe&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:we&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(i.sheenRoughnessMap.channel),specularMapUv:De&&m(i.specularMap.channel),specularColorMapUv:Oe&&m(i.specularColorMap.channel),specularIntensityMapUv:ke&&m(i.specularIntensityMap.channel),transmissionMapUv:Ae&&m(i.transmissionMap.channel),thicknessMapUv:je&&m(i.thicknessMap.channel),alphaMapUv:Ne&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(ce||fe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(re||Ne),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ie,decodeVideoTexture:re&&i.map.isVideoTexture===!0&&Rt.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&Rt.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Fe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&i.extensions.multiDraw===!0||j)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Le.vertexUv1s=c.has(1),Le.vertexUv2s=c.has(2),Le.vertexUv3s=c.has(3),c.clear(),Le}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Ws[t];n=Ao.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new vu(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function wu(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Tu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Eu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Du(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Tu),r.length>1&&r.sort(t||Eu),i.length>1&&i.sort(t||Eu)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Ou(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Du,e.set(t,[i])):n>=r.length?(i=new Du,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function ku(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new V,color:new U};break;case`SpotLight`:n={position:new V,direction:new V,color:new U,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new U,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new U,groundColor:new U};break;case`RectAreaLight`:n={color:new U,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Au(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var ju=0;function Mu(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Nu(e){let t=new ku,n=Au(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new en,o=new en;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Mu);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=K.LTC_FLOAT_1,r.rectAreaLTC2=K.LTC_FLOAT_2):(r.rectAreaLTC1=K.LTC_HALF_1,r.rectAreaLTC2=K.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=ju++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function Pu(e){let t=new Nu(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Fu(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Pu(e),t.set(n,[a])):r>=i.length?(a=new Pu(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Iu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lu=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Ru=[new V(1,0,0),new V(-1,0,0),new V(0,1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1)],zu=[new V(0,-1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1),new V(0,-1,0),new V(0,-1,0)],Bu=new en,Vu=new V,Hu=new V;function Uu(e,t,n){let r=new Ii,a=new B,o=new B,c=new Yt,l=new Io,u=new Lo,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},m=new No({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:Iu,fragmentShader:Lu}),v=m.clone();v.defines.HORIZONTAL_PASS=1;let y=new Mr;y.setAttribute(`position`,new _r(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new W(y,m),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.state;m.setBlending(0),m.buffers.depth.getReversed()===!0?m.buffers.color.setClear(0,0,0,0):m.buffers.color.setClear(1,1,1,1),m.buffers.depth.setTest(!0),m.setScissorTest(!1);let v=S!==this.type;v&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){L(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let y=p.getFrameExtents();a.multiply(y),o.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(o.x=Math.floor(f/y.x),a.x=o.x*y.x,p.mapSize.x=o.x),a.y>f&&(o.y=Math.floor(f/y.y),a.y=o.y*y.y,p.mapSize.y=o.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||v===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Zt(a.x,a.y,{format:k,type:_,minFilter:s,magFilter:s,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new Ki(a.x,a.y,g),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=E,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=i,p.map.depthTexture.magFilter=i}else d.isPointLight?(p.map=new bc(a.x),p.map.depthTexture=new qi(a.x,h)):(p.map=new Zt(a.x,a.y),p.map.depthTexture=new Ki(a.x,a.y,h)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=E,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=s,p.map.depthTexture.magFilter=s):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=i,p.map.depthTexture.magFilter=i);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==a.x||p.map.height!==a.y)&&p.map.setSize(a.x,a.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);for(let t=0;t<x;t++){let i=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Vu.setFromMatrixPosition(d.matrixWorld),e.position.copy(Vu),Hu.copy(e.position),Hu.add(Ru[t]),e.up.copy(zu[t]),e.lookAt(Hu),e.updateMatrixWorld(),n.makeTranslation(-Vu.x,-Vu.y,-Vu.z),Bu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(Bu,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);c.set(o.x*n.x,o.y*n.y,o.x*n.z,o.y*n.w),m.viewport(c)}r=p.getFrustum(t),T(n,l,i,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let i=t.update(b);m.defines.VSM_SAMPLES!==n.blurSamples&&(m.defines.VSM_SAMPLES=n.blurSamples,v.defines.VSM_SAMPLES=n.blurSamples,m.needsUpdate=!0,v.needsUpdate=!0),n.mapPass===null?n.mapPass=new Zt(a.x,a.y,{format:k,type:_}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),m.uniforms.shadow_pass.value=n.map.depthTexture,m.uniforms.resolution.value.set(n.map.width,n.map.height),m.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,m,b,null),v.uniforms.shadow_pass.value=n.mapPass.texture,v.uniforms.resolution.value.set(n.map.width,n.map.height),v.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,v,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,D)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function T(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)T(c[e],i,a,o,s)}function D(e){e.target.removeEventListener(`dispose`,D);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Wu(e,t){function n(){let t=!1,n=new Yt,r=null,i=new Yt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?N(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=rt[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?N(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new U(0,0,0),T=0,E=!1,D=null,O=null,ee=null,k=null,A=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ne=!1,j=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),ne=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(re)[1]),ne=j>=1);let M=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new Yt().fromArray(ae),ce=new Yt().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),N(e.DEPTH_TEST),o.setFunc(3),ye(!1),be(1),N(e.CULL_FACE),_e(0);function N(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(de(e.BLEND),g=!1);else if(g===!1&&(N(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):N(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?N(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function be(t){t===0?de(e.CULL_FACE):(N(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function xe(t){t!==ee&&(ne&&e.lineWidth(t),ee=t)}function Se(t,n,r){t?(N(e.POLYGON_OFFSET_FILL),(k!==n||A!==r)&&(k=n,A=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Ce(t){t?N(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+te-1),M!==t&&(e.activeTexture(t),M=t)}function Te(t,n,r){r===void 0&&(r=M===null?e.TEXTURE0+te-1:M);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(M!==r&&(e.activeTexture(r),M=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[M];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ne(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function P(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Fe(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function F(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Re(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function I(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function ze(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},M=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new U(0,0,0),T=0,E=!1,D=null,O=null,ee=null,k=null,A=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:N,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:P,texImage3D:Fe,pixelStorei:Le,getParameter:Ie,updateUBOMapping:I,uniformBlockBinding:ze,texStorage2D:Ne,texStorage3D:Pe,texSubImage2D:ke,texSubImage3D:Ae,compressedTexSubImage2D:je,compressedTexSubImage3D:Me,scissor:F,viewport:Re,reset:Be}}function Gu(e,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new B,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Xe(`canvas`)}function T(e,t,n){let r=1,i=Ie(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function E(e){return e.generateMipmaps}function O(t){e.generateMipmap(t)}function ee(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function k(t,n,r,i,a,o=!1){if(t!==null){if(e[t]!==void 0)return e[t];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+t+`'`)}let s;i&&(s=u.get(`EXT_texture_norm16`),s||L(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let c=n;if(n===e.RED&&(r===e.FLOAT&&(c=e.R32F),r===e.HALF_FLOAT&&(c=e.R16F),r===e.UNSIGNED_BYTE&&(c=e.R8),r===e.UNSIGNED_SHORT&&s&&(c=s.R16_EXT),r===e.SHORT&&s&&(c=s.R16_SNORM_EXT)),n===e.RED_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.R8UI),r===e.UNSIGNED_SHORT&&(c=e.R16UI),r===e.UNSIGNED_INT&&(c=e.R32UI),r===e.BYTE&&(c=e.R8I),r===e.SHORT&&(c=e.R16I),r===e.INT&&(c=e.R32I)),n===e.RG&&(r===e.FLOAT&&(c=e.RG32F),r===e.HALF_FLOAT&&(c=e.RG16F),r===e.UNSIGNED_BYTE&&(c=e.RG8),r===e.UNSIGNED_SHORT&&s&&(c=s.RG16_EXT),r===e.SHORT&&s&&(c=s.RG16_SNORM_EXT)),n===e.RG_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.RG8UI),r===e.UNSIGNED_SHORT&&(c=e.RG16UI),r===e.UNSIGNED_INT&&(c=e.RG32UI),r===e.BYTE&&(c=e.RG8I),r===e.SHORT&&(c=e.RG16I),r===e.INT&&(c=e.RG32I)),n===e.RGB_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.RGB8UI),r===e.UNSIGNED_SHORT&&(c=e.RGB16UI),r===e.UNSIGNED_INT&&(c=e.RGB32UI),r===e.BYTE&&(c=e.RGB8I),r===e.SHORT&&(c=e.RGB16I),r===e.INT&&(c=e.RGB32I)),n===e.RGBA_INTEGER&&(r===e.UNSIGNED_BYTE&&(c=e.RGBA8UI),r===e.UNSIGNED_SHORT&&(c=e.RGBA16UI),r===e.UNSIGNED_INT&&(c=e.RGBA32UI),r===e.BYTE&&(c=e.RGBA8I),r===e.SHORT&&(c=e.RGBA16I),r===e.INT&&(c=e.RGBA32I)),n===e.RGB&&(r===e.UNSIGNED_SHORT&&s&&(c=s.RGB16_EXT),r===e.SHORT&&s&&(c=s.RGB16_SNORM_EXT),r===e.UNSIGNED_INT_5_9_9_9_REV&&(c=e.RGB9_E5),r===e.UNSIGNED_INT_10F_11F_11F_REV&&(c=e.R11F_G11F_B10F)),n===e.RGBA){let t=o?He:Rt.getTransfer(a);r===e.FLOAT&&(c=e.RGBA32F),r===e.HALF_FLOAT&&(c=e.RGBA16F),r===e.UNSIGNED_BYTE&&(c=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),r===e.UNSIGNED_SHORT&&s&&(c=s.RGBA16_EXT),r===e.SHORT&&s&&(c=s.RGBA16_SNORM_EXT),r===e.UNSIGNED_SHORT_4_4_4_4&&(c=e.RGBA4),r===e.UNSIGNED_SHORT_5_5_5_1&&(c=e.RGB5_A1)}return(c===e.R16F||c===e.R32F||c===e.RG16F||c===e.RG32F||c===e.RGBA16F||c===e.RGBA32F)&&u.get(`EXT_color_buffer_float`),c}function A(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function te(e,t){return E(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function ne(e){let t=e.target;t.removeEventListener(`dispose`,ne),re(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),ie(t)}function re(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&M(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function M(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=S.get(r);delete i[n.__cacheKey],h.memory.textures--}function ie(t){let n=f.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),f.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let r=t.textures;for(let t=0,n=r.length;t<n;t++){let n=f.get(r[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(r[t])}f.remove(t)}let ae=0;function oe(){ae=0}function se(){return ae}function ce(e){ae=e}function le(){let e=ae;return e>=p.maxTextures&&L(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),ae+=1,e}function ue(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function N(t,n){let r=f.get(t);if(t.isVideoTexture&&P(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&r.__version!==t.version){let e=t.image;if(e===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{xe(r,t,n);return}}else t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null);d.bindTexture(e.TEXTURE_2D,r.__webglTexture,e.TEXTURE0+n)}function de(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?xe(r,t,n):(t.isExternalTexture&&(r.__webglTexture=t.sourceTexture?t.sourceTexture:null),d.bindTexture(e.TEXTURE_2D_ARRAY,r.__webglTexture,e.TEXTURE0+n))}function fe(t,n){let r=f.get(t);t.isRenderTargetTexture===!1&&t.version>0&&r.__version!==t.version?xe(r,t,n):d.bindTexture(e.TEXTURE_3D,r.__webglTexture,e.TEXTURE0+n)}function pe(t,n){let r=f.get(t);t.isCubeDepthTexture!==!0&&t.version>0&&r.__version!==t.version?Se(r,t,n):d.bindTexture(e.TEXTURE_CUBE_MAP,r.__webglTexture,e.TEXTURE0+n)}let me={[t]:e.REPEAT,[n]:e.CLAMP_TO_EDGE,[r]:e.MIRRORED_REPEAT},he={[i]:e.NEAREST,[a]:e.NEAREST_MIPMAP_NEAREST,[o]:e.NEAREST_MIPMAP_LINEAR,[s]:e.LINEAR,[c]:e.LINEAR_MIPMAP_NEAREST,[l]:e.LINEAR_MIPMAP_LINEAR},ge={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function _e(t,n){if(n.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(n.magFilter===1006||n.magFilter===1007||n.magFilter===1005||n.magFilter===1008||n.minFilter===1006||n.minFilter===1007||n.minFilter===1005||n.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(t,e.TEXTURE_WRAP_S,me[n.wrapS]),e.texParameteri(t,e.TEXTURE_WRAP_T,me[n.wrapT]),(t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY)&&e.texParameteri(t,e.TEXTURE_WRAP_R,me[n.wrapR]),e.texParameteri(t,e.TEXTURE_MAG_FILTER,he[n.magFilter]),e.texParameteri(t,e.TEXTURE_MIN_FILTER,he[n.minFilter]),n.compareFunction&&(e.texParameteri(t,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(t,e.TEXTURE_COMPARE_FUNC,ge[n.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(n.magFilter===1003||n.minFilter!==1005&&n.minFilter!==1008||n.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(n.anisotropy>1||f.get(n).__currentAnisotropy){let r=u.get(`EXT_texture_filter_anisotropic`);e.texParameterf(t,r.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(n.anisotropy,p.getMaxAnisotropy())),f.get(n).__currentAnisotropy=n.anisotropy}}}function ve(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,ne));let i=n.source,a=S.get(i);a===void 0&&(a={},S.set(i,a));let o=ue(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&M(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function ye(e,t,n){return Math.floor(Math.floor(e/n)/t)}function be(t,n,r,i){let a=t.updateRanges;if(a.length===0)d.texSubImage2D(e.TEXTURE_2D,0,0,0,n.width,n.height,r,i,n.data);else{a.sort((e,t)=>e.start-t.start);let o=0;for(let e=1;e<a.length;e++){let t=a[o],r=a[e],i=t.start+t.count,s=ye(r.start,n.width,4),c=ye(t.start,n.width,4);r.start<=i+1&&s===c&&ye(r.start+r.count-1,n.width,4)===s?t.count=Math.max(t.count,r.start+r.count-t.start):(++o,a[o]=r)}a.length=o+1;let s=d.getParameter(e.UNPACK_ROW_LENGTH),c=d.getParameter(e.UNPACK_SKIP_PIXELS),l=d.getParameter(e.UNPACK_SKIP_ROWS);d.pixelStorei(e.UNPACK_ROW_LENGTH,n.width);for(let t=0,o=a.length;t<o;t++){let o=a[t],s=Math.floor(o.start/4),c=Math.ceil(o.count/4),l=s%n.width,u=Math.floor(s/n.width),f=c;d.pixelStorei(e.UNPACK_SKIP_PIXELS,l),d.pixelStorei(e.UNPACK_SKIP_ROWS,u),d.texSubImage2D(e.TEXTURE_2D,0,l,u,f,1,r,i,n.data)}t.clearUpdateRanges(),d.pixelStorei(e.UNPACK_ROW_LENGTH,s),d.pixelStorei(e.UNPACK_SKIP_PIXELS,c),d.pixelStorei(e.UNPACK_SKIP_ROWS,l)}}function xe(t,n,r){let i=e.TEXTURE_2D;(n.isDataArrayTexture||n.isCompressedArrayTexture)&&(i=e.TEXTURE_2D_ARRAY),n.isData3DTexture&&(i=e.TEXTURE_3D);let a=ve(t,n),o=n.source;d.bindTexture(i,t.__webglTexture,e.TEXTURE0+r);let s=f.get(o);if(o.version!==s.__version||a===!0){if(d.activeTexture(e.TEXTURE0+r),!(typeof ImageBitmap<`u`&&n.image instanceof ImageBitmap)){let t=Rt.getPrimaries(Rt.workingColorSpace),r=n.colorSpace===``?null:Rt.getPrimaries(n.colorSpace),i=n.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,i)}d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment);let t=T(n.image,!1,p.maxTextureSize);t=Fe(n,t);let c=m.convert(n.format,n.colorSpace),l=m.convert(n.type),u=k(n.internalFormat,c,l,n.normalized,n.colorSpace,n.isVideoTexture);_e(i,n);let f,h=n.mipmaps,g=n.isVideoTexture!==!0,_=s.__version===void 0||a===!0,v=o.dataReady,y=te(n,t);if(n.isDepthTexture)u=A(n.format===D,n.type),_&&(g?d.texStorage2D(e.TEXTURE_2D,1,u,t.width,t.height):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,null));else if(n.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data);n.generateMipmaps=!1}else g?(_&&d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height),v&&be(n,t,c,l)):d.texImage2D(e.TEXTURE_2D,0,u,t.width,t.height,0,c,l,t.data)}else if(n.isCompressedTexture){if(n.isCompressedArrayTexture){g&&_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,t.depth);for(let r=0,i=h.length;r<i;r++)if(f=h[r],n.format!==1023){if(c!==null){if(g){if(v){if(n.layerUpdates.size>0){let t=Bs(f.width,f.height,n.format,n.type);for(let i of n.layerUpdates){let n=f.data.subarray(i*t/f.data.BYTES_PER_ELEMENT,(i+1)*t/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,i,f.width,f.height,1,c,n)}}else d.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,f.data)}}else d.compressedTexImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,f.data,0,0)}else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(e.TEXTURE_2D_ARRAY,r,0,0,0,f.width,f.height,t.depth,c,l,f.data):d.texImage3D(e.TEXTURE_2D_ARRAY,r,u,f.width,f.height,t.depth,0,c,l,f.data);n.layerUpdates.size>0&&n.clearLayerUpdates()}else{g&&_&&d.texStorage2D(e.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let t=0,r=h.length;t<r;t++)f=h[t],n.format===1023?g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,l,f.data):d.texImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,c,l,f.data):c===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,c,f.data):d.compressedTexImage2D(e.TEXTURE_2D,t,u,f.width,f.height,0,f.data)}}else if(n.isDataArrayTexture){if(g){if(_&&d.texStorage3D(e.TEXTURE_2D_ARRAY,y,u,t.width,t.height,t.depth),v){if(n.layerUpdates.size>0){let r=Bs(t.width,t.height,n.format,n.type);for(let i of n.layerUpdates){let n=t.data.subarray(i*r/t.data.BYTES_PER_ELEMENT,(i+1)*r/t.data.BYTES_PER_ELEMENT);d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,i,t.width,t.height,1,c,l,n)}n.clearLayerUpdates()}else d.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)}}else d.texImage3D(e.TEXTURE_2D_ARRAY,0,u,t.width,t.height,t.depth,0,c,l,t.data)}else if(n.isData3DTexture)g?(_&&d.texStorage3D(e.TEXTURE_3D,y,u,t.width,t.height,t.depth),v&&d.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,c,l,t.data)):d.texImage3D(e.TEXTURE_3D,0,u,t.width,t.height,t.depth,0,c,l,t.data);else if(n.isFramebufferTexture){if(_){if(g)d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height);else{let n=t.width,r=t.height;for(let t=0;t<y;t++)d.texImage2D(e.TEXTURE_2D,t,u,n,r,0,c,l,null),n>>=1,r>>=1}}}else if(n.isHTMLTexture){if(`texElementImage2D`in e){let r=e.canvas;if(r.hasAttribute(`layoutsubtree`)||r.setAttribute(`layoutsubtree`,`true`),t.parentNode!==r){r.appendChild(t),b.add(n),r.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},r.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let t=Ie(h[0]);d.texStorage2D(e.TEXTURE_2D,y,u,t.width,t.height)}for(let t=0,n=h.length;t<n;t++)f=h[t],g?v&&d.texSubImage2D(e.TEXTURE_2D,t,0,0,c,l,f):d.texImage2D(e.TEXTURE_2D,t,u,c,l,f);n.generateMipmaps=!1}else if(g){if(_){let n=Ie(t);d.texStorage2D(e.TEXTURE_2D,y,u,n.width,n.height)}v&&d.texSubImage2D(e.TEXTURE_2D,0,0,0,c,l,t)}else d.texImage2D(e.TEXTURE_2D,0,u,c,l,t);E(n)&&O(i),s.__version=o.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function Se(t,n,r){if(n.image.length!==6)return;let i=ve(t,n),a=n.source;d.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+r);let o=f.get(a);if(a.version!==o.__version||i===!0){d.activeTexture(e.TEXTURE0+r);let t=Rt.getPrimaries(Rt.workingColorSpace),s=n.colorSpace===``?null:Rt.getPrimaries(n.colorSpace),c=n.colorSpace===``||t===s?e.NONE:e.BROWSER_DEFAULT_WEBGL;d.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,n.flipY),d.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,n.premultiplyAlpha),d.pixelStorei(e.UNPACK_ALIGNMENT,n.unpackAlignment),d.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,c);let l=n.isCompressedTexture||n.image[0].isCompressedTexture,u=n.image[0]&&n.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!l&&!u?f[e]=T(n.image[e],!0,p.maxCubemapSize):f[e]=u?n.image[e].image:n.image[e],f[e]=Fe(n,f[e]);let h=f[0],g=m.convert(n.format,n.colorSpace),_=m.convert(n.type),v=k(n.internalFormat,g,_,n.normalized,n.colorSpace),y=n.isVideoTexture!==!0,b=o.__version===void 0||i===!0,x=a.dataReady,S=te(n,h);_e(e.TEXTURE_CUBE_MAP,n);let C;if(l){y&&b&&d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let r=0;r<C.length;r++){let i=C[r];n.format===1023?y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,_,i.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,g,_,i.data):g===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):d.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,v,i.width,i.height,0,i.data)}}}else{if(C=n.mipmaps,y&&b){C.length>0&&S++;let t=Ie(f[0]);d.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(u){y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let n=0;n<C.length;n++){let r=C[n].image[t].image;y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,r.width,r.height,g,_,r.data):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,r.width,r.height,0,g,_,r.data)}}else{y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let n=0;n<C.length;n++){let r=C[n];y?x&&d.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,0,0,g,_,r.image[t]):d.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,n+1,v,g,_,r.image[t])}}}E(n)&&O(e.TEXTURE_CUBE_MAP),o.__version=a.version,n.onUpdate&&n.onUpdate(n)}t.__version=n.version}function Ce(t,n,r,i,a,o){let s=m.convert(r.format,r.colorSpace),c=m.convert(r.type),l=k(r.internalFormat,s,c,r.normalized,r.colorSpace),u=f.get(n),p=f.get(r);if(p.__renderTarget=n,!u.__hasExternalTextures){let t=Math.max(1,n.width>>o),r=Math.max(1,n.height>>o);a===e.TEXTURE_3D||a===e.TEXTURE_2D_ARRAY?d.texImage3D(a,o,l,t,r,n.depth,0,s,c,null):d.texImage2D(a,o,l,t,r,0,s,c,null)}d.bindFramebuffer(e.FRAMEBUFFER,t),Pe(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,i,a,p.__webglTexture,0,Ne(n)):(a===e.TEXTURE_2D||a>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&a<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,i,a,p.__webglTexture,o),d.bindFramebuffer(e.FRAMEBUFFER,null)}function we(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=A(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;Pe(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ne(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ne(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=k(a.internalFormat,o,s,a.normalized,a.colorSpace);Pe(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ne(n),c,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ne(n),c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Te(t,n,r){let i=n.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(e.FRAMEBUFFER,t),!(n.depthTexture&&n.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let a=f.get(n.depthTexture);if(a.__renderTarget=n,a.__webglTexture&&n.depthTexture.image.width===n.width&&n.depthTexture.image.height===n.height||(n.depthTexture.image.width=n.width,n.depthTexture.image.height=n.height,n.depthTexture.needsUpdate=!0),i){if(a.__webglInit===void 0&&(a.__webglInit=!0,n.depthTexture.addEventListener(`dispose`,ne)),a.__webglTexture===void 0){a.__webglTexture=e.createTexture(),d.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture),_e(e.TEXTURE_CUBE_MAP,n.depthTexture);let t=m.convert(n.depthTexture.format),r=m.convert(n.depthTexture.type),i;n.depthTexture.format===1026?i=e.DEPTH_COMPONENT24:n.depthTexture.format===1027&&(i=e.DEPTH24_STENCIL8);for(let a=0;a<6;a++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+a,0,i,n.width,n.height,0,t,r,null)}}else N(n.depthTexture,0);let o=a.__webglTexture,s=Ne(n),c=i?e.TEXTURE_CUBE_MAP_POSITIVE_X+r:e.TEXTURE_2D,l=n.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(n.depthTexture.format===1026)Pe(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,l,c,o,0,s):e.framebufferTexture2D(e.FRAMEBUFFER,l,c,o,0);else if(n.depthTexture.format===1027)Pe(n)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,l,c,o,0,s):e.framebufferTexture2D(e.FRAMEBUFFER,l,c,o,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ee(t){let n=f.get(t),r=t.isWebGLCubeRenderTarget===!0;if(n.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(n.__depthDisposeCallback&&n.__depthDisposeCallback(),e){let t=()=>{delete n.__boundDepthTexture,delete n.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),n.__depthDisposeCallback=t}n.__boundDepthTexture=e}if(t.depthTexture&&!n.__autoAllocateDepthBuffer){if(r)for(let e=0;e<6;e++)Te(n.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?Te(n.__webglFramebuffer[0],t,0):Te(n.__webglFramebuffer,t,0)}}else if(r){n.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[r]),n.__webglDepthbuffer[r]===void 0)n.__webglDepthbuffer[r]=e.createRenderbuffer(),we(n.__webglDepthbuffer[r],t,!1);else{let i=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=n.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,i,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer[0]):d.bindFramebuffer(e.FRAMEBUFFER,n.__webglFramebuffer),n.__webglDepthbuffer===void 0)n.__webglDepthbuffer=e.createRenderbuffer(),we(n.__webglDepthbuffer,t,!1);else{let r=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=n.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,r,e.RENDERBUFFER,i)}}d.bindFramebuffer(e.FRAMEBUFFER,null)}function De(t,n,r){let i=f.get(t);n!==void 0&&Ce(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&Ee(t)}function Oe(t){let n=t.texture,r=f.get(t),i=f.get(n);t.addEventListener(`dispose`,j);let a=t.textures,o=t.isWebGLCubeRenderTarget===!0,s=a.length>1;if(s||(i.__webglTexture===void 0&&(i.__webglTexture=e.createTexture()),i.__version=n.version,h.memory.textures++),o){r.__webglFramebuffer=[];for(let t=0;t<6;t++)if(n.mipmaps&&n.mipmaps.length>0){r.__webglFramebuffer[t]=[];for(let i=0;i<n.mipmaps.length;i++)r.__webglFramebuffer[t][i]=e.createFramebuffer()}else r.__webglFramebuffer[t]=e.createFramebuffer()}else{if(n.mipmaps&&n.mipmaps.length>0){r.__webglFramebuffer=[];for(let t=0;t<n.mipmaps.length;t++)r.__webglFramebuffer[t]=e.createFramebuffer()}else r.__webglFramebuffer=e.createFramebuffer();if(s)for(let t=0,n=a.length;t<n;t++){let n=f.get(a[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&Pe(t)===!1){r.__webglMultisampledFramebuffer=e.createFramebuffer(),r.__webglColorRenderbuffer=[],d.bindFramebuffer(e.FRAMEBUFFER,r.__webglMultisampledFramebuffer);for(let n=0;n<a.length;n++){let i=a[n];r.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.__webglColorRenderbuffer[n]);let o=m.convert(i.format,i.colorSpace),s=m.convert(i.type),c=k(i.internalFormat,o,s,i.normalized,i.colorSpace,t.isXRRenderTarget===!0),l=Ne(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,r.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(r.__webglDepthRenderbuffer=e.createRenderbuffer(),we(r.__webglDepthRenderbuffer,t,!0)),d.bindFramebuffer(e.FRAMEBUFFER,null)}}if(o){d.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture),_e(e.TEXTURE_CUBE_MAP,n);for(let i=0;i<6;i++)if(n.mipmaps&&n.mipmaps.length>0)for(let a=0;a<n.mipmaps.length;a++)Ce(r.__webglFramebuffer[i][a],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,a);else Ce(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+i,0);E(n)&&O(e.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(s){for(let n=0,i=a.length;n<i;n++){let i=a[n],o=f.get(i),s=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(s=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(s,o.__webglTexture),_e(s,i),Ce(r.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0+n,s,0),E(i)&&O(s)}d.unbindTexture()}else{let a=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(a=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),d.bindTexture(a,i.__webglTexture),_e(a,n),n.mipmaps&&n.mipmaps.length>0)for(let i=0;i<n.mipmaps.length;i++)Ce(r.__webglFramebuffer[i],t,n,e.COLOR_ATTACHMENT0,a,i);else Ce(r.__webglFramebuffer,t,n,e.COLOR_ATTACHMENT0,a,0);E(n)&&O(a),d.unbindTexture()}t.depthBuffer&&Ee(t)}function ke(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(E(r)){let t=ee(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),O(t),d.unbindTexture()}}}let Ae=[],je=[];function Me(t){if(t.samples>0){if(Pe(t)===!1){let n=t.textures,r=t.width,i=t.height,a=e.COLOR_BUFFER_BIT,o=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,s=f.get(t),c=n.length>1;if(c)for(let t=0;t<n.length;t++)d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);d.bindFramebuffer(e.READ_FRAMEBUFFER,s.__webglMultisampledFramebuffer);let l=t.texture.mipmaps;l&&l.length>0?d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer[0]):d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglFramebuffer);for(let l=0;l<n.length;l++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(a|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(a|=e.STENCIL_BUFFER_BIT)),c){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,s.__webglColorRenderbuffer[l]);let t=f.get(n[l]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,r,i,0,0,r,i,a,e.NEAREST),_===!0&&(Ae.length=0,je.length=0,Ae.push(e.COLOR_ATTACHMENT0+l),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&(Ae.push(o),je.push(o),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,je)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Ae))}if(d.bindFramebuffer(e.READ_FRAMEBUFFER,null),d.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),c)for(let t=0;t<n.length;t++){d.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,s.__webglColorRenderbuffer[t]);let r=f.get(n[t]).__webglTexture;d.bindFramebuffer(e.FRAMEBUFFER,s.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,r,0)}d.bindFramebuffer(e.DRAW_FRAMEBUFFER,s.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Ne(e){return Math.min(p.maxSamples,e.samples)}function Pe(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function P(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Fe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Rt.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ie(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=le,this.resetTextureUnits=oe,this.getTextureUnits=se,this.setTextureUnits=ce,this.setTexture2D=N,this.setTexture2DArray=de,this.setTexture3D=fe,this.setTextureCube=pe,this.rebindTextures=De,this.setupRenderTarget=Oe,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=Me,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=Pe,this.isReversedDepthBuffer=function(){return d.buffers.depth.getReversed()}}function Ku(e,t){function n(n,r=``){let i,a=Rt.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var qu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ju=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Yu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Ji(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new No({vertexShader:qu,fragmentShader:Ju,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new W(new xo(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Xu=class extends it{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,d=null,f=null,p=null,m=null,g=typeof XRWebGLBinding<`u`,_=new Yu,v={},y=t.getContextAttributes(),x=null,S=null,C=[],w=[],O=new B,ee=null,k=null,A=new gs;A.viewport=new Yt;let te=new gs;te.viewport=new Yt;let ne=[A,te],j=new Ds,re=null,M=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new jn,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new jn,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new jn,C[e]=t),t.getHandSpace()};function ie(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ae(){r.removeEventListener(`select`,ie),r.removeEventListener(`selectstart`,ie),r.removeEventListener(`selectend`,ie),r.removeEventListener(`squeeze`,ie),r.removeEventListener(`squeezestart`,ie),r.removeEventListener(`squeezeend`,ie),r.removeEventListener(`end`,ae),r.removeEventListener(`inputsourceschange`,oe);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}re=null,M=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(ee),e.setSize(O.width,O.height,!1),k!==null){let e=k.camera;e.fov=k.fov,e.zoom=k.zoom,e.updateProjectionMatrix(),k=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,ie),r.addEventListener(`selectstart`,ie),r.addEventListener(`selectend`,ie),r.addEventListener(`squeeze`,ie),r.addEventListener(`squeezestart`,ie),r.addEventListener(`squeezeend`,ie),r.addEventListener(`end`,ae),r.addEventListener(`inputsourceschange`,oe),y.xrCompatible!==!0&&await t.makeXRCompatible(),ee=e.getPixelRatio(),e.getSize(O),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?D:E,a=y.stencil?b:h);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Zt(f.textureWidth,f.textureHeight,{format:T,type:u,depthTexture:new Ki(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Zt(p.framebufferWidth,p.framebufferHeight,{format:T,type:u,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),pe.setContext(r),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function oe(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let se=new V,ce=new V;function le(e,t,n){se.setFromMatrixPosition(t.matrixWorld),ce.setFromMatrixPosition(n.matrixWorld);let r=se.distanceTo(ce),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ue(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=te.near=A.near=t,j.far=te.far=A.far=n,(re!==j.near||M!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),re=j.near,M=j.far),j.layers.mask=e.layers.mask|6,A.layers.mask=j.layers.mask&-5,te.layers.mask=j.layers.mask&-3;let i=e.parent,a=j.cameras;ue(j,i);for(let e=0;e<a.length;e++)ue(a[e],i);a.length===2?le(j,A,te):j.projectionMatrix.copy(A.projectionMatrix),k===null&&e.isPerspectiveCamera&&(k={camera:e,fov:e.fov,zoom:e.zoom}),N(e,j,i)};function N(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=ct*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let de=null;function fe(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=ne[n];o===void 0&&(o=new gs,o.layers.enable(n),o.viewport=new Yt,ne[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Ji,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}de&&de(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let pe=new Hs;pe.setAnimationLoop(fe),this.setAnimationLoop=function(e){de=e},this.dispose=function(){}}},Zu=new en,Qu=new H;Qu.set(-1,0,0,0,1,0,0,0,1);function $u(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,ko(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Zu.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Qu),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ed(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return R(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):L(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var td=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),nd=null;function rd(){return nd===null&&(nd=new Ci(td,16,16,k,_),nd.name=`DFG_LUT`,nd.minFilter=s,nd.magFilter=s,nd.wrapS=n,nd.wrapT=n,nd.generateMipmaps=!1,nd.needsUpdate=!0),nd}var id=class{constructor(e={}){let{canvas:t=Ze(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:m=!1,outputBufferType:g=u}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);x=n.getContextAttributes().alpha}else x=a;let S=g,C=new Set([te,A,ee]),w=new Set([u,h,p,b,v,y]),T=new Uint32Array(4),E=new Int32Array(4),D=new V,O=null,k=null,ne=[],j=[],re=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,ie=!1,ae=null,oe=null,se=null,ce=null;this._outputColorSpace=Be;let le=0,ue=0,N=null,de=-1,fe=null,pe=new Yt,me=new Yt,he=null,ge=new U(0),_e=0,ve=t.width,ye=t.height,be=1,xe=null,Se=null,Ce=new Yt(0,0,ve,ye),we=new Yt(0,0,ve,ye),Te=!1,Ee=new Ii,De=!1,Oe=!1,ke=new en,Ae=new V,je=new Yt,Me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ne=!1;function Pe(){return N===null?be:1}let P=n;function Fe(e,n){return t.getContext(e,n)}let Ie,Le,F,Re,I,ze,Ve,He,Ue,We,Ge,Ke,Je,Ye,Xe,Qe,et,tt,rt,it,at,ot,st;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:f};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,z,!1),t.addEventListener(`webglcontextrestored`,ut,!1),t.addEventListener(`webglcontextcreationerror`,dt,!1),P===null){let t=`webgl2`;if(P=Fe(t,e),P===null)throw Fe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}ct()}catch(e){throw t.removeEventListener(`webglcontextlost`,z,!1),t.removeEventListener(`webglcontextrestored`,ut,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),R(`WebGLRenderer: `+e.message),e}function ct(){Ie=new Sc(P),Ie.init(),at=new Ku(P,Ie),Le=new Zs(P,Ie,e,at),F=new Wu(P,Ie),Le.reversedDepthBuffer&&m&&F.buffers.depth.setReversed(!0),oe=P.createFramebuffer(),se=P.createFramebuffer(),ce=P.createFramebuffer(),Re=new Tc(P),I=new wu,ze=new Gu(P,Ie,F,I,Le,at,Re),Ve=new xc(M),He=new Us(P),ot=new Ys(P,He),Ue=new Cc(P,He,Re,ot),We=new Dc(P,Ue,He,ot,Re),tt=new Ec(P,Le,ze),Xe=new Qs(I),Ge=new Cu(M,Ve,Ie,Le,ot,Xe),Ke=new $u(M,I),Je=new Ou,Ye=new Fu(Ie),et=new Js(M,Ve,F,We,x,s),Qe=new Uu(M,We,Le),st=new ed(P,Re,Le,F),rt=new Xs(P,Ie,Re),it=new wc(P,Ie,Re),Re.programs=Ge.programs,M.capabilities=Le,M.extensions=Ie,M.properties=I,M.renderLists=Je,M.shadowMap=Qe,M.state=F,M.info=Re}S!==1009&&(re=new kc(S,t.width,t.height,o,r,i));let lt=new Xu(M,P);this.xr=lt,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(e){e!==void 0&&(be=e,this.setSize(ve,ye,!1))},this.getSize=function(e){return e.set(ve,ye)},this.setSize=function(e,n,r=!0){lt.isPresenting?L(`WebGLRenderer: Can't change size while VR device is presenting.`):(ve=e,ye=n,t.width=Math.floor(e*be),t.height=Math.floor(n*be),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),re!==null&&re.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ve*be,ye*be).floor()},this.setDrawingBufferSize=function(e,n,r){ve=e,ye=n,be=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009)R(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){L(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}re.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(pe)},this.getViewport=function(e){return e.copy(Ce)},this.setViewport=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),F.viewport(pe.copy(Ce).multiplyScalar(be).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),F.scissor(me.copy(we).multiplyScalar(be).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){F.setScissorTest(Te=e)},this.setOpaqueSort=function(e){xe=e},this.setTransparentSort=function(e){Se=e},this.getClearColor=function(e){return e.copy(et.getClearColor())},this.setClearColor=function(){et.setClearColor(...arguments)},this.getClearAlpha=function(){return et.getClearAlpha()},this.setClearAlpha=function(){et.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=C.has(t)}if(e){let e=N.texture.type,t=w.has(e),n=et.getClearColor(),r=et.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,P.clearBufferuiv(P.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,P.clearBufferiv(P.COLOR,0,E))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),ae=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,z,!1),t.removeEventListener(`webglcontextrestored`,ut,!1),t.removeEventListener(`webglcontextcreationerror`,dt,!1),et.dispose(),Je.dispose(),Ye.dispose(),I.dispose(),Ve.dispose(),We.dispose(),ot.dispose(),st.dispose(),Ge.dispose(),lt.dispose(),lt.removeEventListener(`sessionstart`,vt),lt.removeEventListener(`sessionend`,yt),bt.stop()};function z(e){e.preventDefault(),$e(`WebGLRenderer: Context Lost.`),ie=!0}function ut(){$e(`WebGLRenderer: Context Restored.`),ie=!1;let e=Re.autoReset,t=Qe.enabled,n=Qe.autoUpdate,r=Qe.needsUpdate,i=Qe.type;ct(),Re.autoReset=e,Qe.enabled=t,Qe.autoUpdate=n,Qe.needsUpdate=r,Qe.type=i}function dt(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ft(e){let t=e.target;t.removeEventListener(`dispose`,ft),pt(t)}function pt(e){mt(e),I.remove(e)}function mt(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Ge.releaseProgram(e)}),e.isShaderMaterial&&Ge.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Me);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=At(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ue.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;ot.setup(i,r,s,n,c);let h,g=rt;if(c!==null&&(h=He.get(c),g=it,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*Pe()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*Pe()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh){if(Ie.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?He.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ht(e,t,n,r){ae!==null&&e.isNodeMaterial&&ae.setObject(r,e),De===!0&&Xe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Et(e,t,r),e.side=0,e.needsUpdate=!0,Et(e,t,r),e.side=2):Et(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),ae!==null&&ae.renderStart(e,t,n),k=Ye.get(n),k.init(t),j.push(k),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),k.setupLights(),ae!==null&&ae.updateLights(k.state.lightsArray),Oe=this.localClippingEnabled,De=Xe.init(this.clippingPlanes,Oe),De===!0&&Xe.setGlobalState(this.clippingPlanes,t),ae!==null&&Qe.render(k.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ht(o,n,t,e),r.add(o)}else ht(i,n,t,e),r.add(i)}}),k=j.pop(),ae!==null&&ae.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=I.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Ie.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let gt=null;function _t(e){gt&&gt(e)}function vt(){bt.stop()}function yt(){bt.start()}let bt=new Hs;bt.setAnimationLoop(_t),typeof self<`u`&&bt.setContext(self),this.setAnimationLoop=function(e){gt=e,lt.setAnimationLoop(e),e===null?bt.stop():bt.start()},lt.addEventListener(`sessionstart`,vt),lt.addEventListener(`sessionend`,yt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ie===!0)return;ae!==null&&ae.renderStart(e,t);let n=lt.enabled===!0&&lt.isPresenting===!0,r=re!==null&&(N===null||n)&&re.begin(M,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),lt.enabled===!0&&lt.isPresenting===!0&&(re===null||re.isCompositing()===!1)&&(lt.cameraAutoUpdate===!0&&lt.updateCamera(t),t=lt.getCamera()),e.isScene===!0&&e.onBeforeRender(M,e,t,N),k=Ye.get(e,j.length),k.init(t),k.state.textureUnits=ze.getTextureUnits(),j.push(k),ke.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),Ee.setFromProjectionMatrix(ke,qe,t.reversedDepth),Oe=this.localClippingEnabled,De=Xe.init(this.clippingPlanes,Oe),O=Je.get(e,ne.length),O.init(),ne.push(O),lt.enabled===!0&&lt.isPresenting===!0){let e=M.xr.getDepthSensingMesh();e!==null&&xt(e,t,-1/0,M.sortObjects)}xt(e,t,0,M.sortObjects),O.finish(),ae!==null&&ae.updateLights(k.state.lightsArray),M.sortObjects===!0&&O.sort(xe,Se),Ne=lt.enabled===!1||lt.isPresenting===!1||lt.hasDepthSensing()===!1,Ne&&et.addToRenderList(O,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),De===!0&&Xe.beginShadows();let i=k.state.shadowsArray;if(Qe.render(i,e,t),De===!0&&Xe.endShadows(),(r&&re.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(k.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];Ct(n,r,e,a)}Ne&&et.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];St(O,e,n,n.viewport)}}else r.length>0&&Ct(n,r,e,t),Ne&&et.render(e),St(O,e,t)}N!==null&&ue===0&&(ze.updateMultisampleRenderTarget(N),ze.updateRenderTargetMipmap(N)),r&&re.end(M),e.isScene===!0&&e.onAfterRender(M,e,t),ot.resetDefaultState(),de=-1,fe=null,j.pop(),j.length>0?(k=j[j.length-1],ze.setTextureUnits(k.state.textureUnits),De===!0&&Xe.setGlobalState(M.clippingPlanes,k.state.camera)):k=null,ne.pop(),O=ne.length>0?ne[ne.length-1]:null,ae!==null&&ae.renderEnd()};function xt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)k.pushLightProbeGrid(e);else if(e.isLight)k.pushLight(e),e.castShadow&&k.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(Ee)){r&&je.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ke);let i=We.update(e),a=e.material;a.visible&&O.push(e,i,a,n,je.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(Ee))){let i=We.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),je.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),je.copy(e.boundingSphere.center)),je.applyMatrix4(e.matrixWorld).applyMatrix4(ke)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&O.push(e,i,c,n,je.z,s,t)}}else a.visible&&O.push(e,i,a,n,je.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)xt(i[e],t,n,r)}function St(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;k.setupLightsView(n),De===!0&&Xe.setGlobalState(M.clippingPlanes,n),r&&F.viewport(pe.copy(r)),i.length>0&&wt(i,t,n),a.length>0&&wt(a,t,n),o.length>0&&wt(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function Ct(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(k.state.transmissionRenderTarget[r.id]===void 0){let e=Ie.has(`EXT_color_buffer_half_float`)||Ie.has(`EXT_color_buffer_float`);k.state.transmissionRenderTarget[r.id]=new Zt(1,1,{generateMipmaps:!0,type:e?_:u,minFilter:l,samples:Math.max(4,Le.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Rt.workingColorSpace})}let a=k.state.transmissionRenderTarget[r.id],o=r.viewport||pe;a.setSize(o.z*M.transmissionResolutionScale,o.w*M.transmissionResolutionScale);let s=M.getRenderTarget(),c=M.getActiveCubeFace(),d=M.getActiveMipmapLevel();M.setRenderTarget(a),M.getClearColor(ge),_e=M.getClearAlpha(),_e<1&&M.setClearColor(16777215,.5),M.clear(),Ne&&et.render(n);let f=M.toneMapping;M.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),k.setupLightsView(r),De===!0&&Xe.setGlobalState(M.clippingPlanes,r),wt(e,n,r),ze.updateMultisampleRenderTarget(a),ze.updateRenderTargetMipmap(a),Ie.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Tt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(ze.updateMultisampleRenderTarget(a),ze.updateRenderTargetMipmap(a))}M.setRenderTarget(s,c,d),M.setClearColor(ge,_e),p!==void 0&&(r.viewport=p),M.toneMapping=f}function wt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Tt(o,t,n,s,l,c)}}function Tt(e,t,n,r,i,a){ae!==null&&i.isNodeMaterial&&ae.setObject(e,i),e.onBeforeRender(M,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(M,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=2):M.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(M,t,n,r,i,a)}function Et(e,t,n){t.isScene!==!0&&(t=Me);let r=I.get(e),i=k.state.lights,a=k.state.shadowsArray,o=i.state.version,s=Ge.getParameters(e,i.state,a,t,n,k.state.lightProbeGridArray),c=Ge.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ve.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ft),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Ot(e,s),d}else s.uniforms=Ge.getUniforms(e),ae!==null&&e.isNodeMaterial&&ae.build(e,n,s),e.onBeforeCompile(s,M),d=Ge.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Xe.uniform),Ot(e,s),r.needsLights=jt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=k.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function Dt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Il.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Ot(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function kt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function At(e,t,n,r,i){t.isScene!==!0&&(t=Me),ze.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?M.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:Rt.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ve.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=M.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),y=k.state.lights;if(De===!0&&(Oe===!0||e!==fe)){let t=e===fe&&r.id===de;Xe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Xe.numPlanes||v.numIntersection!==Xe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=k.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=Et(r,t,i),ae&&r.isNodeMaterial&&ae.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(F.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==de&&(de=r.id,C=!0),v.needsLights){let e=kt(k.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||fe!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(P,`projectionMatrix`,e.projectionMatrix),T.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(P,Ae.setFromMatrixPosition(e.matrixWorld)),Le.logarithmicDepthBuffer&&T.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),fe!==e&&(fe=e,C=!0,w=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&T.setValue(P,`sunShadowMap`,y.state.sunShadowMap,ze),y.state.directionalShadowMap.length>0&&T.setValue(P,`directionalShadowMap`,y.state.directionalShadowMap,ze),y.state.spotShadowMap.length>0&&T.setValue(P,`spotShadowMap`,y.state.spotShadowMap,ze),y.state.pointShadowMap.length>0&&T.setValue(P,`pointShadowMap`,y.state.pointShadowMap,ze)),i.isSkinnedMesh){T.setOptional(P,i,`bindMatrix`),T.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(P,`boneTexture`,e.boneTexture,ze))}i.isBatchedMesh&&(T.setOptional(P,i,`batchingTexture`),T.setValue(P,`batchingTexture`,i._matricesTexture,ze),T.setOptional(P,i,`batchingIdTexture`),T.setValue(P,`batchingIdTexture`,i._indirectTexture,ze),T.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(P,`batchingColorTexture`,i._colorsTexture,ze));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&tt.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=rd()),C){if(T.setValue(P,`toneMappingExposure`,M.toneMappingExposure),v.needsLights&&B(E,w),a&&r.fog===!0&&Ke.refreshFogUniforms(E,a),Ke.refreshMaterialUniforms(E,r,be,ye,k.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}Il.upload(P,Dt(v),E,ze)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Il.upload(P,Dt(v),E,ze),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(P,`center`,i.center),T.setValue(P,`modelViewMatrix`,i.modelViewMatrix),T.setValue(P,`normalMatrix`,i.normalMatrix),T.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];st.update(n,x),st.bind(n,x)}}return x}function B(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function jt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return le},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,le=t,ue=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest,F.viewport(pe),F.scissor(me),F.setScissorTest(he),de=-1;return}if(o.__webglFramebuffer===void 0)ze.setupRenderTarget(e);else if(o.__hasExternalTextures)ze.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);ze.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&ze.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest}else pe.copy(Ce).multiplyScalar(be).floor(),me.copy(we).multiplyScalar(be).floor(),he=Te;if(n!==0&&(r=oe),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(pe),F.scissor(me),F.setScissorTest(he),i){let r=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}de=-1};function Mt(e){let t=I.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Le.textureFormatReadable(e.format),t.__typeReadable=Le.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let u=Mt(o);if(u.__formatReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,at.convert(c),at.convert(l),a)}finally{let e=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let d=Mt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,at.convert(l),at.convert(u),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);let p=N===null?null:I.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,p);let m=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await nt(P,m,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(f),P.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;ze.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=at.convert(t.format),_=at.convert(t.type),v;t.isData3DTexture?(ze.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(ze.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(ze.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,o,s,f,p,o,s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,se),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,ce);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,o,s,f,p,o,s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&ze.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?ze.setTextureCube(e,0):e.isData3DTexture?ze.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?ze.setTexture2DArray(e,0):ze.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){le=0,ue=0,N=null,F.reset(),ot.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return qe}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Rt._getDrawingBufferColorSpace(e),t.unpackColorSpace=Rt._getUnpackColorSpace()}},q={length:2.74,width:1.525,height:.76,thickness:.025,netHeight:.1525,netOverhang:.1525},ad={radius:.02,mass:.0027},od=9.81,J=q.length/2,sd=q.width/2,cd=e=>e===`player`?`opponent`:`player`,ld=e=>e===`player`?1:-1,ud=e=>e>=0?`player`:`opponent`,dd={difficulty:`club`,handedness:`right`,gamesToWin:2,assist:.6,sensitivity:1,masterVolume:.8,musicVolume:.4,sfxVolume:.9,quality:`high`,theme:`club`,showTrajectory:!1,haptics:!0,playerName:`You`},fd={duration:3,timeScale:.35,perGame:2},pd={matchesPlayed:0,matchesWon:0,pointsWon:0,pointsLost:0,longestRally:0,fastestShotKmh:0,aces:0,challengeBest:{}},Y={ink:`#1d2333`,paper:`#f6f3ec`,table:`#2f6fd6`,tableDark:`#1f4fa3`,line:`#ffffff`,accent:`#ff6b4a`,accent2:`#2ec4b6`,gold:`#ffc94a`,ball:`#fff8ea`,danger:`#ff4d6d`,good:`#3ddc97`};function md(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Mr,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=hd(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=hd(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function hd(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new _r(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}var gd=`"Avenir Next", "Nunito", "Segoe UI", "Helvetica Neue", system-ui, sans-serif`;function _d(e,t){let n=document.createElement(`canvas`);return n.width=e,n.height=t,[n,n.getContext(`2d`)]}function vd(e,n={}){let r=new Gi(e);return n.srgb!==!1&&(r.colorSpace=Be),n.repeat&&(r.wrapS=t,r.wrapT=t),r.anisotropy=4,r}function yd(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function bd(e,t,n,r,i,a){e.beginPath(),e.moveTo(t+a,n),e.arcTo(t+r,n,t+r,n+i,a),e.arcTo(t+r,n+i,t,n+i,a),e.arcTo(t,n+i,t,n,a),e.arcTo(t,n,t+r,n,a),e.closePath()}function xd(e=128,t=0){let[n,r]=_d(e,e),i=r.createRadialGradient(e/2,e/2,0,e/2,e/2,e/2);return i.addColorStop(0,`rgba(255,255,255,1)`),i.addColorStop(Math.max(.01,t),`rgba(255,255,255,0.85)`),i.addColorStop(.55,`rgba(255,255,255,0.35)`),i.addColorStop(1,`rgba(255,255,255,0)`),r.fillStyle=i,r.fillRect(0,0,e,e),vd(n)}function Sd(){let[e,t]=_d(64,64);t.clearRect(0,0,64,64),t.strokeStyle=`rgba(28,34,52,0.92)`,t.lineWidth=7,t.strokeRect(0,0,64,64),t.strokeStyle=`rgba(70,82,110,0.6)`,t.lineWidth=2,t.strokeRect(3.5,3.5,57,57);let n=vd(e,{repeat:!0});return n.anisotropy=8,n}function Cd(){let[e,t]=_d(256,128);return t.fillStyle=Y.ball,t.fillRect(0,0,256,128),t.fillStyle=`#e4d8c2`,t.fillRect(0,62,256,4),t.fillStyle=Y.accent,t.beginPath(),t.ellipse(64,64,22,20,0,0,Math.PI*2),t.fill(),t.fillStyle=Y.ball,t.font=`900 26px ${gd}`,t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(`S`,64,65),t.fillStyle=Y.ink,bd(t,172,57,40,14,7),t.fill(),t.fillStyle=`#d9cbb3`,t.beginPath(),t.ellipse(128,23.04,10,10,0,0,Math.PI*2),t.fill(),vd(e)}function wd(e,t){let n=2048,[r,i]=_d(n,n),a=yd(7),o=.2,s=Math.ceil(e/o),c=n/e,l=n/t;for(let e=0;e<s;e++){let r=e*o*c,s=-a()*3;for(;s<t;){let e=1.6+a()*2.2,t=.62+(a()-.5)*.035;i.fillStyle=`hsl(${33+(a()-.5)*4}, 58%, ${t*100}%)`,i.fillRect(r,s*l,o*c,e*l);let n=i.createLinearGradient(r,0,r+o*c,0);n.addColorStop(0,`rgba(255,240,215,0.10)`),n.addColorStop(.5,`rgba(255,240,215,0.0)`),n.addColorStop(1,`rgba(120,70,30,0.07)`),i.fillStyle=n,i.fillRect(r,s*l,o*c,e*l),i.fillStyle=`rgba(110,62,28,0.35)`,i.fillRect(r,s*l,o*c,1.5),s+=e}i.fillStyle=`rgba(110,62,28,0.30)`,i.fillRect(r,0,1.5,n)}i.save();let u=6.5*c,d=11*l;bd(i,n/2-u/2,n/2-d/2,u,d,30),i.fillStyle=`rgba(255,236,205,0.16)`,i.fill(),i.lineWidth=6,i.strokeStyle=`rgba(255,250,240,0.55)`,i.stroke(),i.restore(),i.save(),i.translate(n/2,n/2),i.scale(1*c,1*l);let f=i.createRadialGradient(0,0,0,0,0,1);f.addColorStop(0,`rgba(70,40,20,0.42)`),f.addColorStop(.6,`rgba(70,40,20,0.22)`),f.addColorStop(1,`rgba(70,40,20,0)`),i.fillStyle=f,i.scale(1.25,1.95),i.beginPath(),i.arc(0,0,1,0,Math.PI*2),i.fill(),i.restore();let p=i.createRadialGradient(n/2,n/2,n*.25,n/2,n/2,n*.75);p.addColorStop(0,`rgba(90,50,20,0)`),p.addColorStop(1,`rgba(90,50,20,0.35)`),i.fillStyle=p,i.fillRect(0,0,n,n);let m=vd(r);return m.anisotropy=8,m}function Td(e,t,n,r){let i=2048,[a,o]=_d(i,i),s=i/e,c=i/t;o.fillStyle=`#121a2e`,o.fillRect(0,0,i,i);let l=(n+.6)*s,u=(r+.6)*c;o.fillStyle=`#1e3f86`,o.fillRect(i/2-l/2,i/2-u/2,l,u);let d=n*s,f=r*c;o.fillStyle=`#86283a`,o.fillRect(i/2-d/2,i/2-f/2,d,f),o.strokeStyle=`rgba(255,255,255,0.5)`,o.lineWidth=5,o.strokeRect(i/2-d/2+.25*s,i/2-f/2+.25*c,d-.5*s,f-.5*c);for(let e=0;e<6;e++){let t=i/2-d/2+e*d/6;o.fillStyle=`rgba(0,0,0,0.06)`,o.fillRect(t,i/2-f/2,2,f)}o.save(),o.translate(i/2,i/2),o.scale(s,c),o.scale(3.4,4.6);let p=o.createRadialGradient(0,0,0,0,0,1);p.addColorStop(0,`rgba(255,225,190,0.22)`),p.addColorStop(.55,`rgba(255,215,180,0.13)`),p.addColorStop(1,`rgba(255,210,170,0)`),o.fillStyle=p,o.beginPath(),o.arc(0,0,1,0,Math.PI*2),o.fill(),o.restore(),o.save(),o.translate(i/2,i/2),o.scale(s*1.2,c*1.9);let m=o.createRadialGradient(0,0,0,0,0,1);m.addColorStop(0,`rgba(10,10,25,0.5)`),m.addColorStop(.65,`rgba(10,10,25,0.22)`),m.addColorStop(1,`rgba(10,10,25,0)`),o.fillStyle=m,o.beginPath(),o.arc(0,0,1,0,Math.PI*2),o.fill(),o.restore();let h=vd(a);return h.anisotropy=8,h}function Ed(e,t=8,n=256){let[r,i]=_d(t,n),a=i.createLinearGradient(0,0,0,n);for(let[t,n]of e)a.addColorStop(t,n);i.fillStyle=a,i.fillRect(0,0,t,n);let o=vd(r);return o.magFilter=s,o}function Dd(){let[e,t]=_d(256,256),n=t.createLinearGradient(0,0,0,256);n.addColorStop(0,`#cfe8ff`),n.addColorStop(.6,`#f4f9ff`),n.addColorStop(1,`#fff6e2`),t.fillStyle=n,t.fillRect(0,0,256,256);let r=yd(3);t.fillStyle=`rgba(150,200,150,0.45)`;for(let e=0;e<14;e++){let e=r()*256,n=18+r()*30;t.beginPath(),t.arc(e,236+r()*10,n,0,Math.PI*2),t.fill()}return vd(e)}function Od(e,t,n){let[r,i]=_d(512,128);return i.fillStyle=e,i.fillRect(0,0,512,128),kd(i,256,66,64,t,n),vd(r)}function kd(e,t,n,r,i,a){e.save(),e.font=`900 italic ${r}px ${gd}`,e.textAlign=`center`,e.textBaseline=`middle`;let o=e.measureText(`SPINSHOT`).width;e.fillStyle=i,e.fillText(`SPINSHOT`,t+r*.18,n),e.fillStyle=a,e.beginPath(),e.arc(t-o/2-r*.18,n,r*.26,0,Math.PI*2),e.fill(),e.restore()}function Ad(){let e=2048,[t,n]=_d(e,64),r=[{bg:`#0f1830`,draw:(e,t)=>kd(n,e+t/2,33,40,`#ffffff`,Y.accent)},{bg:Y.accent,draw:(e,t)=>{n.fillStyle=`#ffffff`,n.font=`900 34px ${gd}`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(`WORLD TOUR  ·  FINALS`,e+t/2,34)}},{bg:`#0f1830`,draw:(e,t)=>{for(let r=0;r<9;r++)n.fillStyle=[Y.gold,Y.accent2,Y.accent][r%3],n.beginPath(),n.arc(e+(r+.5)*t/9,32,11,0,Math.PI*2),n.fill()}},{bg:Y.accent2,draw:(e,t)=>{n.fillStyle=`#0f1830`,n.font=`900 italic 36px ${gd}`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(`PLAY WITH YOUR PHONE`,e+t/2,34)}}],i=e/r.length;r.forEach((e,t)=>{n.fillStyle=e.bg,n.fillRect(t*i,0,i,64),e.draw(t*i,i)}),n.fillStyle=`rgba(0,0,0,0.22)`;for(let t=0;t<e;t+=4)n.fillRect(t,0,1,64);for(let t=0;t<64;t+=4)n.fillRect(0,t,e,1);let a=vd(t,{repeat:!0});return a.anisotropy=8,a}function jd(){let[e,t]=_d(4,128),n=t.createLinearGradient(0,0,0,128);return n.addColorStop(0,`rgba(255,255,255,0.0)`),n.addColorStop(.25,`rgba(255,255,255,0.6)`),n.addColorStop(1,`rgba(255,255,255,1)`),t.fillStyle=n,t.fillRect(0,0,4,128),vd(e)}function Md(e,t={}){let n=new Fo({color:e,roughness:t.rough??.75,metalness:t.metal??0,flatShading:t.flat??!1,emissiveIntensity:t.emissiveIntensity??1});return t.emissive!==void 0&&(n.emissive=new U(t.emissive)),n}function Nd(e,t=!0,n=!0){return e.traverse(e=>{e.isMesh&&(e.castShadow=t,e.receiveShadow=n)}),e}function Pd(e){let t=new Set;e.traverse(e=>{let n=e;if(n.geometry&&n.geometry.dispose(),n.material){let e=Array.isArray(n.material)?n.material:[n.material];for(let n of e)t.add(n)}});for(let e of t){for(let t of Object.values(e))t&&typeof t==`object`&&t.isTexture&&t.dispose();e.dispose()}}var Fd=new V(0,1,0),Id=new V;function Ld(e,t,n,r){Id.subVectors(n,t);let i=Id.length();e.position.addVectors(t,n).multiplyScalar(.5),i>1e-6&&e.quaternion.setFromUnitVectors(Fd,Id.multiplyScalar(1/i)),r&&e.quaternion.premultiply(r)}var Rd=(e,t,n,r)=>t+(e-t)*Math.exp(-n*r),zd=(e,t,n)=>Math.min(n,Math.max(t,e)),Bd=e=>e*e*(3-2*e);function Vd(e){e.updateMatrixWorld(!0);let t=new en().copy(e.matrixWorld).invert(),n=new Map;e.traverse(e=>{let r=e;if(!r.isMesh||r.isInstancedMesh||Array.isArray(r.material)||r.userData.noMerge)return;let i=r.material;if(i.transparent)return;let a=r.geometry,o=`${i.uuid}|${r.castShadow}|${r.receiveShadow}|${Object.keys(a.attributes).sort().join(`,`)}|${+!!a.index}`,s=n.get(o);s||(s={mat:i,cast:r.castShadow,recv:r.receiveShadow,order:r.renderOrder,geos:[],meshes:[]},n.set(o,s));let c=a.clone();c.applyMatrix4(new en().multiplyMatrices(t,r.matrixWorld)),c.clearGroups(),s.geos.push(c),s.meshes.push(r)});for(let t of n.values()){if(t.meshes.length<2){for(let e of t.geos)e.dispose();continue}let n=md(t.geos,!1);for(let e of t.geos)e.dispose();if(!n)continue;for(let e of t.meshes)e.geometry.dispose(),e.removeFromParent();let r=new W(n,t.mat);r.castShadow=t.cast,r.receiveShadow=t.recv,r.renderOrder=t.order,e.add(r)}}function Hd(e,t){let n=e===`club`?Ud(t):Wd(t);return Vd(n.group),n}function Ud(e){let t=new kn,n=5.5,r=new W(new xo(16,22),new Fo({map:wd(16,22),roughness:.62}));r.rotation.x=-Math.PI/2,r.receiveShadow=!0,t.add(r);let i=new Fo({map:Ed([[0,`#fbf6ec`],[.75,`#efe5d3`],[1,`#e5d8c1`]]),roughness:.95}),a=Md(`#c98d5c`,{rough:.7}),o=(e,r,o,s)=>{let c=new W(new xo(e,n),i);c.position.set(r,n/2,o),c.rotation.y=s,c.receiveShadow=!0,t.add(c);let l=new W(new Yi(e,.14,.03),a);l.position.set(r,.07,o),l.rotation.y=s,l.translateZ(.015),t.add(l);let u=new W(new xo(e,.12),Md(Y.accent2,{rough:.9}));u.position.set(r,1.35,o),u.rotation.y=s,u.translateZ(.005),t.add(u)};o(16,0,-11,0),o(16,0,11,Math.PI),o(22,-8,0,Math.PI/2),o(22,8,0,-Math.PI/2);let s=new li({map:Dd(),color:`#ffffff`}),c=Md(`#ffffff`,{rough:.5}),l=(e,n,r,i,a,o)=>{let l=new kn,u=new W(new xo(i,a),s);l.add(u);let d=.08;for(let[e,t,n,r]of[[0,a/2,i+d,d],[0,-a/2,i+d,d*1.6],[-i/2,0,d,a],[i/2,0,d,a],[0,0,d*.6,a],[0,a*.18,i,d*.6]]){let i=new W(new Yi(n,r,.06),c);i.position.set(e,t,.03),l.add(i)}l.position.set(e,o,n),l.rotation.y=r,l.translateZ(.01),t.add(l)};for(let e of[-4.6,0,4.6])l(e,-11,0,3.2,2.6,3);for(let e of[-6,-1.5,3])l(-8,e,Math.PI/2,3,2.6,3);let u=Md(`#e9dcc6`,{rough:.9});for(let e of[-7,-3.5,0,3.5,7]){let n=new W(new Yi(16,.3,.25),u);n.position.set(0,5.35,e),t.add(n)}let d=new W(new xo(16,22),Md(`#f3ecdf`,{rough:1}));d.rotation.x=Math.PI/2,d.position.y=n,t.add(d);let f=Md(Y.ink,{rough:.5}),p=new li({color:`#fff4dc`});for(let[e,n]of[[0,-1],[0,-4.6],[-4.5,-1],[4.5,-1]]){let r=new W(new Qi(.006,.006,1.6,6),f);r.position.set(e,4.7,n);let i=new W(new $i(.42,.3,24,1,!0),f);i.material.side=2,i.position.set(e,3.8,n);let a=new W(new Co(.11,14,10),p);a.position.set(e,3.6799999999999997,n),t.add(r,i,a)}let m=Od(Y.ink,`#ffffff`,Y.accent),h=Od(Y.accent,`#ffffff`,Y.gold),g=new Fo({map:m,roughness:.7}),_=new Fo({map:h,roughness:.7}),v=Md(`#2a3042`,{rough:.6}),y=(e,n,r,i)=>{let a=new kn,o=new W(new Yi(2,.62,.05),v);o.position.y=.36,a.add(o);for(let e of[-1,1]){let t=new W(new xo(1.96,.58),i%2?_:g);t.position.set(0,.36,e*.0255),t.rotation.y=e>0?0:Math.PI,a.add(t)}for(let e of[-1,1]){let t=new W(new Yi(.06,.05,.38),v);t.position.set(e*.85,.025,0),a.add(t)}a.position.set(e,0,n),a.rotation.y=r,t.add(Nd(a))},b=0;for(let e=-2.6;e<=2.601;e+=2)y(e,-5.6,0,b++),y(e,5.6,Math.PI,b++);for(let e=-5.6+1.2;e<=4.401;e+=2.05)y(-3.6,e,Math.PI/2,b++),y(3.6,e,-Math.PI/2,b++);let x=yd(11),S=Md(`#d9825b`,{rough:.8,flat:!0}),C=[Md(`#5fae6e`,{flat:!0,rough:.8}),Md(`#4c9a62`,{flat:!0,rough:.8}),Md(`#7cc47f`,{flat:!0,rough:.8})],w=(e,n,r,i=1)=>{let a=new kn,o=new W(new Qi(.26,.2,.42,8),S);if(o.position.y=.21,a.add(o),r===0)for(let e=0;e<4;e++){let t=new W(new yo(.32+x()*.12,0),C[e%3]);t.position.set((x()-.5)*.35,.75+e*.2+x()*.1,(x()-.5)*.35),t.rotation.set(x()*3,x()*3,x()*3),a.add(t)}else for(let e=0;e<7;e++){let t=new W(new $i(.07,.9+x()*.6,4),C[e%3]),n=e/7*Math.PI*2;t.position.set(Math.cos(n)*.09,.8,Math.sin(n)*.09),t.rotation.set(Math.sin(n)*.25,x(),-Math.cos(n)*.25),a.add(t)}a.position.set(e,0,n),a.scale.setScalar(i),t.add(Nd(a))};w(-6.8,-9.6,0,1.3),w(-5.2,-9.8,1,1.1),w(6.6,-9.5,1,1.2),w(7,-7.2,0,1),w(-7.1,6.5,0,1.2),w(4.6,-6.3,1,.9),w(-4.6,-6.4,0,.9);let T=new kn,E=new W(new Yi(2.4,.07,.42),Md(`#d9a066`,{rough:.6}));E.position.y=.45,T.add(E);for(let e of[-1,1]){let t=new W(new Yi(.06,.45,.36),v);t.position.set(e*1.05,.225,0),T.add(t)}T.position.set(-6.9,0,-2),T.rotation.y=Math.PI/2,t.add(Nd(T));let D=new W(new Qi(.28,.22,.5,10,1,!0),new Fo({color:Y.accent2,side:2,roughness:.6}));D.position.set(4.4,.25,-6.9),t.add(Nd(D));let O=new Mi(new Co(.025,8,6),Md(`#fff3df`,{rough:.4}),30),ee=new On;for(let e=0;e<30;e++){let t=x()*Math.PI*2,n=x()*.22;ee.position.set(4.4+Math.cos(t)*n,.42+x()*.08,-6.9+Math.sin(t)*n),ee.updateMatrix(),O.setMatrixAt(e,ee.matrix)}return t.add(O),{group:t,lights:{background:`#efe6d6`,fog:[`#efe6d6`,14,34],hemiSky:`#fff6e8`,hemiGround:`#caa37c`,hemi:1.25,dirColor:`#fff0da`,dir:2.9,dirPos:[-3.5,7,2.5],spotColor:`#fff4e0`,spot:18,exposure:1},update:()=>{},pulse:()=>{}}}function Wd(e){let t=new kn,n=new W(new xo(30,36),new Fo({map:Td(30,36,7,12.5),roughness:.55}));n.rotation.x=-Math.PI/2,n.receiveShadow=!0,t.add(n);let r=Ad(),i=new li({map:r,color:`#ffffff`}),a=Md(`#0b1020`,{rough:.5}),o=[],s=(e,n,s,c,l)=>{let u=new kn,d=new W(new Yi(c,.8,.22),a);d.position.y=.4,u.add(d);let f=i.clone();f.map=r.clone(),f.map.repeat.set(c/8,1),f.map.offset.x=l;let p=new W(new xo(c-.06,.62),f);p.position.set(0,.42,.111),u.add(p),o.push(p),u.position.set(e,0,n),u.rotation.y=s,d.castShadow=!0,d.receiveShadow=!0,t.add(u)};s(0,-6.45,0,7.4,0),s(0,6.45,Math.PI,7.4,.3),s(-3.7,0,Math.PI/2,12.3,.55),s(3.7,0,-Math.PI/2,12.3,.8);let c=Md(`#1a2238`,{rough:.8}),l=Md(`#26304d`,{rough:.7}),u=[],d=(e,n,r,i,a)=>{let o=new kn;for(let t=0;t<6;t++){let s=new W(new Yi(i,.5*(t+1),.95),t%2?c:l);s.position.set(0,.25*(t+1),-(a+t*.95)),o.add(s);for(let s=0;s<Math.floor(i/.62);s++){let c=-i/2+.31+s*.62;u.push({x:c,y:.5*(t+1),z:-(a+t*.95)+.1,ry:0});let l=u[u.length-1],d=new On;d.position.set(c,l.y,l.z),d.rotation.y=0,o.position.set(e,0,n),o.rotation.y=r,o.updateMatrixWorld(!0),d.applyMatrix4(o.matrixWorld),l.x=d.position.x,l.z=d.position.z,l.ry=r}}o.position.set(e,0,n),o.rotation.y=r,t.add(o)};d(-5.7,0,Math.PI/2,16,0),d(5.7,0,-Math.PI/2,16,0),d(0,-8.25,0,12,0),d(0,9.25,Math.PI,12,0);let f=yd(5),p=e===`high`?.92:e===`medium`?.6:.3,m=u.filter(()=>f()<p),h=new Xi(.2,.32,2,6);h.translate(0,.38,0);let g=new Co(.12,7,5);g.translate(0,.86,0);let _=new Mi(md([h,g]),new Fo({roughness:.9}),Math.max(1,m.length)),v=[Y.accent,Y.accent2,Y.gold,`#e9e4da`,`#5a6fb0`,`#8a7dff`,`#3a4466`],y=new U,b=[];m.forEach((e,t)=>{y.set(v[Math.floor(f()*v.length)]).multiplyScalar(.3+f()*.18),_.setColorAt(t,y),b.push(f()*Math.PI*2)}),t.add(_);let x=new On,S=0,C=null,w=e=>{m.forEach((t,n)=>{let r=b[n],i=C?S:0,a=Math.sin(e*1.6+r)*.015+Math.max(0,Math.sin(e*9+r))*.12*i;x.position.set(t.x,t.y+a,t.z),x.rotation.set(0,t.ry+Math.sin(e*.4+r)*.15,0),x.scale.set(1,.9+r%.3,1),x.updateMatrix(),_.setMatrixAt(n,x.matrix)}),_.instanceMatrix.needsUpdate=!0};w(0);let T=Md(`#2b3247`,{rough:.5,metal:.5});for(let e of[-2.2,2.2]){let n=new W(new Yi(6,.25,.25),T);n.position.set(0,7,e),t.add(n);for(let n of[-1.4,0,1.4]){let r=new W(new Qi(.18,.24,.35,12),T);r.position.set(n,6.75,e),t.add(r);let i=new W(new Qi(.17,.17,.02,12),new li({color:`#fff3d8`}));i.position.set(n,6.57,e),t.add(i)}}let E=jd();for(let e of[-2.2,2.2]){let n=new W(new Qi(.2,2.2,6.5,24,1,!0),new li({map:E,color:`#ffe2b8`,transparent:!0,opacity:.03,blending:2,depthWrite:!1,side:2}));n.position.set(0,3.3,e*.7),n.renderOrder=1,t.add(n)}let D=new Fo({color:`#0d1322`,roughness:1});for(let[e,n,r,i]of[[0,-18,0,30],[0,18,Math.PI,30],[-15,0,Math.PI/2,36],[15,0,-Math.PI/2,36]]){let a=new W(new xo(i,12),D);a.position.set(e,6,n),a.rotation.y=r,t.add(a)}let O=new W(new xo(6,.9),new li({map:r.clone(),color:`#ffffff`}));O.material.map.repeat.set(.25,1),O.position.set(0,5.2,-13.25),t.add(O);let ee=0,k=new U(`#ffffff`),A=9;return{group:t,lights:{background:`#0e1424`,fog:[`#0e1424`,12,34],hemiSky:`#7d8cc4`,hemiGround:`#1b2034`,hemi:.7,dirColor:`#fff0dd`,dir:1.1,dirPos:[1.2,9,2.2],spotColor:`#ffe8c8`,spot:170,exposure:1.05},update:(e,t)=>{ee+=e;for(let t of o){let n=t.material;n.map.offset.x+=e*.035,A<1.2?n.color.copy(k).lerp(new U(`#ffffff`),A/1.2):n.color.set(`#ffffff`)}A+=e,S=Math.max(0,S-e*.45),w(t)},pulse:(e,t)=>{k=new U(t).multiplyScalar(1.6),A=0,S=1,C=e}}}var Gd=.076,Kd=.08,qd=-.125;function Jd(e,t){let n=new ja;return n.absellipse(0,.004,e,t,0,Math.PI*2,!1,0),n}function Yd(){let e=new kn,t=Md(`#d8b07a`,{rough:.7}),n=Md(`#d8303b`,{rough:.6}),r=Md(`#1e1f24`,{rough:.6}),i=new go(Jd(Gd,Kd),{depth:.006,bevelEnabled:!1,curveSegments:28});i.translate(0,0,-.003),e.add(new W(i,t));let a=new go(Jd(.0745,.0785),{depth:.0022,bevelEnabled:!0,bevelThickness:8e-4,bevelSize:.0012,bevelSegments:2,curveSegments:28}),o=new W(a,n);o.position.z=-.0056,e.add(o);let s=new W(a,r);s.position.z=.003+4e-4,e.add(s);let c=[];for(let[e,t]of[[0,0],[.017,0],[.0135,.02],[.0135,.06],[.0175,.09],[.019,.098],[0,.1]])c.push(new B(e,-t));let l=new W(new bo(c,14),Md(`#b9844c`,{rough:.65}));l.scale.set(1,1,.62),l.position.y=-.068,e.add(l);let u=new W(new bo([new B(0,0),new B(.026,0),new B(.015,-.03),new B(0,-.03)],14),Md(`#c99a62`,{rough:.65}));return u.scale.set(1,1,.45),u.position.y=-.06,e.add(u),e.traverse(e=>{e.isMesh&&(e.castShadow=!0)}),e}var Xd=.27,Zd=.26,Qd=.4,$d=.4,ef=.075,tf=.43,nf=.215,rf=new V,af=new V,of=new V,sf=new V,cf=new jt,lf=new jt,uf=new jt,df=new V(0,1,0);function ff(e,t,n,r,i,a,o){of.subVectors(t,e);let s=of.length(),c=(n+r)*.999,l=Math.abs(n-r)+.02;s<1e-5?(of.set(0,-1,0),s=l):of.multiplyScalar(1/s),s=zd(s,l,c);let u=zd((n*n+s*s-r*r)/(2*n*s),-1,1),d=Math.sqrt(1-u*u);sf.copy(i).addScaledVector(of,-i.dot(of)),sf.lengthSq()<1e-8&&sf.set(0,-1,0).addScaledVector(of,-of.y),sf.normalize(),a.copy(e).addScaledVector(of,n*u).addScaledVector(sf,n*d),o.copy(e).addScaledVector(of,s)}var pf=class{side;group=new kn;root=new kn;paddle;pelvis=new kn;spine=new kn;head=new kn;jerseyMat;bandMat;mats=[];bodyMeshes=[];ghostMeshes=[];upperArm;foreArm;hand;thigh;shin;feet;body=new V;prevBody=new V;vel=new V;padPos=new V;padRot=new jt;backhand=0;backhandTarget=0;handed=`right`;swing=0;mood=`idle`;moodT=0;moodW=0;time=Math.random()*10;yaw;twist=0;leanX=.1;leanZ=0;first=!0;constructor(e,t){this.side=e,this.yaw=e===`player`?Math.PI:0;let n=e===`player`?`#f0c3a0`:`#c58c66`,r=e===`player`?`#3b2a20`:`#1d1b22`;this.jerseyMat=this.m(t,.7);let i=this.m(`#283252`,.8),a=this.m(n,.75),o=this.m(r,.85),s=this.m(`#f7f5f0`,.6);this.bandMat=this.m(e===`player`?`#ffffff`:Y.gold,.6);let c=this.m(Y.ink,.8);this.group.add(this.root),this.root.add(this.pelvis),this.pelvis.add(this.spine);let l=this.part(new Xi(.15,.04,4,14),i,this.pelvis);l.position.y=.03,l.scale.set(1.05,.9,.78);let u=this.part(new Xi(.175,.24,6,16),this.jerseyMat,this.spine);u.position.y=.26,u.scale.set(1.08,1,.78);let d=this.part(new wo(.075,.018,6,16),this.bandMat,this.spine);d.position.y=.505,d.rotation.x=Math.PI/2;let f=this.part(new Qi(.05,.055,.08,10),a,this.spine);f.position.y=.53,this.spine.add(this.head),this.head.position.y=.56;let p=this.part(new Co(.125,18,14),a,this.head);p.position.y=.12,p.scale.set(1,1.06,1);let m=this.part(new Co(.132,18,10,0,Math.PI*2,0,Math.PI*.52),o,this.head);m.position.set(0,.13,-.012),m.rotation.x=-.32;let h=this.part(new wo(.128,.016,6,22),this.bandMat,this.head);h.position.set(0,.155,0),h.rotation.x=Math.PI/2-.3;for(let e of[-1,1]){let t=this.part(new Co(.013,8,6),c,this.head);t.position.set(e*.042,.125,.115),t.scale.set(1,1.4,.6)}this.part(new Co(.018,8,6),a,this.head).position.set(0,.095,.125);let g=new Xi(.052,Xd,4,12),_=new Xi(.043,Zd,4,12),v=new Co(.05,12,10),y=new Xi(.07,Qd,4,12),b=new Xi(.056,$d,4,12);this.upperArm=[this.part(g,this.jerseyMat,this.group),this.part(g,this.jerseyMat,this.group)],this.foreArm=[this.part(_,a,this.group),this.part(_,a,this.group)],this.hand=[this.part(v,a,this.group),this.part(v,a,this.group)],this.thigh=[this.part(y,i,this.group),this.part(y,i,this.group)],this.shin=[this.part(b,a,this.group),this.part(b,a,this.group)];let x=()=>{let e=new kn,t=this.part(new Xi(.058,.13,4,12),s,e);t.rotation.x=Math.PI/2,t.position.set(0,.055,.04),t.scale.set(1,1,.8);let n=this.part(new Xi(.062,.135,2,12),c,e);n.rotation.x=Math.PI/2,n.position.set(0,.022,.04),n.scale.set(1.02,1,.38);let r=this.part(new Co(.03,8,6),this.jerseyMat,e);return r.position.set(0,.095,.075),r.scale.set(1,.5,1.4),this.group.add(e),{pos:new V,from:new V,to:new V,t:1,stepping:!1,mesh:e}};this.feet=[x(),x()],this.paddle=Yd(),this.group.add(this.paddle);let S=(J+.55)*(e===`player`?1:-1);this.body.set(0,0,S),this.prevBody.copy(this.body),this.padPos.set(.3*(e===`player`?1:-1),.95,S-.35*(e===`player`?1:-1)),this.padRot.setFromAxisAngle(df,e===`player`?0:Math.PI)}m(e,t){let n=new Fo({color:e,roughness:t});return this.mats.push(n),n}part(e,t,n){let r=new W(e,t);return r.castShadow=!0,r.receiveShadow=!0,n.add(r),this.bodyMeshes.push(r),r}setColor(e){this.jerseyMat.color.set(e)}setGhost(e){for(let e of this.ghostMeshes)e.removeFromParent();this.ghostMeshes=[];let t=e!==null&&e<1;for(let n of this.mats)n.transparent=t,n.opacity=t?e:1,n.depthWrite=!t,n.needsUpdate=!0;for(let e of this.bodyMeshes)e.renderOrder=t?11:0;if(!t)return;let n=new Fo({colorWrite:!1,transparent:!0});for(let e of this.bodyMeshes){let t=new W(e.geometry,n);t.renderOrder=10,t.castShadow=!1,t.receiveShadow=!1,e.add(t),this.ghostMeshes.push(t)}}setOpacity(e){if(this.ghostMeshes.length)for(let t of this.mats)t.opacity=e}setPose(e,t){this.body.copy(e.body),this.body.y=0,this.padPos.copy(e.paddlePos),this.padRot.copy(e.paddleRot),t?.backhand!==void 0&&(this.backhandTarget=+!!t.backhand),t?.handedness&&(this.handed=t.handedness),t?.swing!==void 0&&(this.swing=t.swing)}react(e){this.mood=e,this.moodT=0}update(e){e=Math.min(e,.05),this.time+=e;let t=this.time;this.first&&this.prevBody.copy(this.body),e>0&&(rf.subVectors(this.body,this.prevBody).multiplyScalar(1/e),rf.lengthSq()>100&&rf.set(0,0,0),this.vel.lerp(rf,1-Math.exp(-12*e))),this.prevBody.copy(this.body);let n=Math.hypot(this.vel.x,this.vel.z);this.moodT+=e,this.mood!==`idle`&&this.moodT>2.6&&(this.mood=`idle`),this.moodW=Rd(this.moodW,this.mood===`idle`?0:1,6,e);let r=this.mood===`cheer`?this.moodW:0,i=this.mood===`sad`?this.moodW:0,a=this.mood===`cheer`?Math.max(0,Math.sin(this.moodT*7.5))*.16*Math.exp(-this.moodT*.6)*r:0;this.root.position.copy(this.body),this.root.position.y=a,this.root.rotation.y=this.yaw;let o=Math.sin(t*2.1)*.006,s=.8-Math.min(n,2)*.012-i*.03+r*.06;this.pelvis.position.y=s+o,this.root.updateMatrixWorld(!0);let c=this.handed===`right`?-1:1;this.backhand=Rd(this.backhand,this.backhandTarget,10,e);let l=af.copy(this.padPos),u=cf.copy(this.padRot);if(this.moodW>.001&&this.mood!==`idle`){let e=new V,t=new jt;if(this.mood===`cheer`){let n=Math.sin(this.moodT*7.5)*.06;e.set(c*.28,1.95+n,.05),t.setFromAxisAngle(df,0)}else e.set(c*.3,.48,.08),lf.setFromAxisAngle(new V(1,0,0),Math.PI),t.copy(lf);this.root.localToWorld(e),uf.setFromAxisAngle(df,this.yaw),t.premultiply(uf),l.lerp(e,this.moodW),u.slerp(t,this.moodW)}this.paddle.position.copy(l),this.paddle.quaternion.copy(u),this.paddle.updateMatrixWorld(!0);let d=this.paddle.localToWorld(new V(0,qd,0)),f=this.root.worldToLocal(d.clone()),p=new V(c*nf,this.pelvis.position.y+tf,0),m=f.distanceTo(p),h=Math.max(0,m-.53*.9),g=.14+h*1.4+zd((this.pelvis.position.y+.25-f.y)*.5,0,.3);g=g*(1-this.moodW)+(i*.35-r*.1);let _=0;h>0&&(_=zd(-Math.sign(f.x)*h*1.6*Math.min(1,Math.abs(f.x)/(m+.001)),-.35,.35)),_*=1-this.moodW;let v=c*zd(.32-f.z,-.6,.7)*.75+c*this.backhand*-.35;v*=1-this.moodW,this.leanX=Rd(this.leanX,zd(g,-.2,.55),14,e),this.leanZ=Rd(this.leanZ,_,14,e),this.twist=Rd(this.twist,v,16,e),this.spine.rotation.set(this.leanX,this.twist,this.leanZ,`YXZ`),this.spine.scale.y=1+Math.sin(t*2.1)*.01,this.head.rotation.x=-this.leanX*.6+i*.65-r*.3,this.head.rotation.y=-this.twist*.7,this.root.updateMatrixWorld(!0);for(let e=0;e<2;e++){let n=e===0,a=n?c:-c,o=this.spine.localToWorld(rf.set(a*nf,.41,0)),s,l=new V;if(n)s=d,l.set(a*.7,-1,-.35).lerp(new V(a*.9,-.3,.6),this.backhand),r>.5&&l.set(a,0,.3);else{let e=Math.sin(t*2.1+1)*.02,n=-this.twist*.25+this.swing*.1,o=new V(a*.33,this.pelvis.position.y+.3+e,.3+n),c=new V(a*.3,this.pelvis.position.y+1.05+Math.sin(this.moodT*7.5)*.06,.05),u=new V(a*.22,this.pelvis.position.y-.12,.05);r>0&&o.lerp(c,r),i>0&&o.lerp(u,i),s=this.root.localToWorld(o),l.set(a*.6,-.6,-.7),r>.5&&l.set(a,0,.2)}uf.setFromAxisAngle(df,this.yaw),l.applyQuaternion(uf);let u=new V,f=new V;ff(o.clone(),s,Xd,Zd,l,u,f),Ld(this.upperArm[e],o,u),Ld(this.foreArm[e],u,f),this.hand[e].position.copy(f)}uf.setFromAxisAngle(df,this.yaw);let y=new V(0,0,1).applyQuaternion(uf);for(let t=0;t<2;t++){let r=this.feet[t],i=t===0?c:-c,o=this.root.localToWorld(new V(i*.2,0,t===0?-.07:.09));o.y=0,this.first&&(r.pos.copy(o),r.t=1,r.stepping=!1);let s=this.feet[1-t],l=Math.hypot(r.pos.x-o.x,r.pos.z-o.z);if(!r.stepping&&(l>.15&&!s.stepping||l>.45)&&(r.stepping=!0,r.t=0,r.from.copy(r.pos),r.to.copy(o).addScaledVector(this.vel,.1),r.to.y=0),r.stepping){let t=zd(.2-n*.03,.11,.2);r.t=Math.min(1,r.t+e/t),r.to.copy(o).addScaledVector(this.vel,.1),r.to.y=0,r.pos.lerpVectors(r.from,r.to,Bd(r.t)),r.pos.y=Math.sin(Math.PI*r.t)*.07,r.t>=1&&(r.stepping=!1)}let u=r.pos.y+(this.mood===`cheer`?a:0);r.mesh.position.set(r.pos.x,u,r.pos.z),r.mesh.rotation.set(0,this.yaw+i*-.18,0);let d=this.pelvis.localToWorld(new V(i*.1,-.03,0)),f=new V(r.pos.x,u+ef,r.pos.z).addScaledVector(y,-.01),p=y.clone().addScaledVector(new V(-y.z,0,y.x),i*-.25),m=new V,h=new V;ff(d,f,Qd,$d,p,m,h),Ld(this.thigh[t],d,m),Ld(this.shin[t],m,h)}this.first=!1}headWorld(e){return this.head.localToWorld(e.set(0,.12,0))}setJerseyAccent(e){this.bandMat.color.copy(new U(e))}},mf=26,hf=.16,gf=1.25,_f=class{group=new kn;mesh;shadow;trail;trailPos;trailCol;hist=[];pos=new V;spin=new V;vel=new V;visible=!1;time=0;lastSet=new V;hasLast=!1;spinTint=0;warm=new U(Y.gold).lerp(new U(Y.accent),.45);cool=new U(`#7fd8ff`);neutral=new U(`#ffffff`);slow=0;constructor(){let e=Cd();this.mesh=new W(new Co(ad.radius*gf,20,14),new Fo({map:e,roughness:.35,emissive:new U(`#fff3dc`),emissiveIntensity:.18})),this.mesh.castShadow=!0,this.group.add(this.mesh),this.shadow=new W(new xo(1,1),new li({color:`#0b1020`,alphaMap:xd(64),transparent:!0,depthWrite:!1,opacity:.5})),this.shadow.rotation.x=-Math.PI/2,this.shadow.renderOrder=2,this.group.add(this.shadow);let t=new Mr;this.trailPos=new Float32Array(156),this.trailCol=new Float32Array(208),t.setAttribute(`position`,new _r(this.trailPos,3).setUsage(Ke)),t.setAttribute(`color`,new _r(this.trailCol,4).setUsage(Ke));let n=[];for(let e=0;e<25;e++){let t=e*2;n.push(t,t+1,t+2,t+1,t+3,t+2)}t.setIndex(n),this.trail=new W(t,new li({vertexColors:!0,transparent:!0,depthWrite:!1,side:2,toneMapped:!1})),this.trail.frustumCulled=!1,this.trail.renderOrder=3,this.group.add(this.trail)}set(e,t,n){n&&this.hasLast&&e.distanceTo(this.lastSet)>1.2&&(this.hist.length=0),n||(this.hist.length=0),this.pos.copy(e),this.spin.copy(t),this.visible=n,this.lastSet.copy(e),this.hasLast=n}update(e,t){this.time+=e;let n=this.visible;if(this.mesh.visible=n,this.shadow.visible=n,this.trail.visible=n,!n)return;this.mesh.position.copy(this.pos);let r=this.hist,i=r[r.length-1];for((!i||i.p.distanceToSquared(this.pos)>1e-10||this.time-i.t>.03)&&r.push({p:this.pos.clone(),t:this.time});r.length>2&&this.time-r[0].t>hf*(1+this.slow*1.8);)r.shift();if(r.length>=2){let e=r[Math.max(0,r.length-3)],t=r[r.length-1],n=t.t-e.t;n>1e-4&&this.vel.subVectors(t.p,e.p).multiplyScalar(1/n)}let a=this.spin.length();if(a>.001&&e>0){let t=Math.min(a*.06,28),n=new jt().setFromAxisAngle(this.spin.clone().multiplyScalar(1/a),t*e);this.mesh.quaternion.premultiply(n)}let o=Math.abs(this.pos.x)<sd&&Math.abs(this.pos.z)<J&&this.pos.y>q.height-.01?q.height+.0015:.003,s=Math.max(0,this.pos.y-o),c=.05+s*.09;this.shadow.position.set(this.pos.x,o,this.pos.z),this.shadow.scale.set(c,c,1),this.shadow.material.opacity=zd(.55-s*.45,.06,.55);let l=Math.hypot(this.vel.x,this.vel.y,this.vel.z),u=0;if(l>.5){let e=new V(0,1,0).cross(this.vel).normalize();u=this.spin.dot(e)/350}this.spinTint+=(zd(u,-1,1)-this.spinTint)*Math.min(1,e*10),this.ribbon(t)}setSlowMo(e){this.slow=zd(e,0,1)}faceCamera(e){this.visible&&this.ribbon(e)}ribbon(e){let t=this.hist,n=Math.hypot(this.vel.x,this.vel.y,this.vel.z),r=e.position,i=t.length,a=new U,o=this.spinTint>=0?this.warm:this.cool,s=zd((n-2)/8,0,1),c=1+this.slow*.6,l=new V,u=new V,d=new V;for(let e=0;e<mf;e++){let n=e/25,f;if(i>=2){let e=(1-n)*(i-1),r=Math.floor(e),a=Math.min(i-1,r+1);f=l.lerpVectors(t[r].p,t[a].p,e-r)}else f=l.copy(this.pos);e===0&&(f=l.copy(this.pos));let p=Math.max(0,Math.floor((1-n)*(i-1))-1),m=Math.min(i-1,p+2),h=i>=2?new V().subVectors(t[m].p,t[p].p):new V(0,0,1);h.lengthSq()<1e-10&&h.set(0,0,1),d.subVectors(r,f),u.crossVectors(h,d).normalize();let g=ad.radius*gf*.95*(1-n)**.7,_=e*6;this.trailPos[_]=f.x+u.x*g,this.trailPos[_+1]=f.y+u.y*g,this.trailPos[_+2]=f.z+u.z*g,this.trailPos[_+3]=f.x-u.x*g,this.trailPos[_+4]=f.y-u.y*g,this.trailPos[_+5]=f.z-u.z*g,a.copy(this.neutral).lerp(o,Math.min(1,Math.abs(this.spinTint)*1.2)*(.35+.65*n));let v=Math.min(1,(1-n)**1.6*.75*s*c);for(let t=0;t<2;t++){let n=e*8+t*4;this.trailCol[n]=a.r,this.trailCol[n+1]=a.g,this.trailCol[n+2]=a.b,this.trailCol[n+3]=v}}let f=this.trail.geometry;f.attributes.position.needsUpdate=!0,f.attributes.color.needsUpdate=!0}},vf={play:52,serve:50,point:46,celebrate:46,menu:44},yf=class{camera;side;mode=`menu`;modeT=0;prevRate=3;pos=new V(0,2.4,5);target=new V(0,.8,0);fov=50;shakeAmp=0;time=0;celebrateSide=`player`;menuAngle=.6;first=!0;dPos=new V;dTgt=new V;pushStart=new V;foc={ball:new V,player:new V};slowMo=0;constructor(e,t=`player`){this.camera=e,this.side=t}setMode(e,t){t?.side&&(this.celebrateSide=t.side),e!==this.mode&&(this.mode=e,this.modeT=0,e===`point`&&this.pushStart.copy(this.pos))}shake(e){this.shakeAmp=Math.min(1.5,this.shakeAmp+e)}snap(){this.first=!0}update(e,t){e=Math.min(e,.1);let n=this.side===`opponent`,r=this.foc;r.ball.copy(t.ball),r.player.copy(t.player),n&&(r.ball.x=-r.ball.x,r.player.x=-r.player.x),this.time+=e,this.modeT+=e;let i=this.camera.aspect||1.6,a=zd((1.6-i)/1,0,1.1),o=this.modeT,s=this.dPos,c=this.dTgt,l=3;switch(this.mode){case`play`:{let e=zd(r.ball.x,-1.2,1.2),t=zd(r.player.x,-1.6,1.6);s.set(zd(t*.35+e*.2,-.65,.65),2.45+a*1,3.35+a*.75),c.set(e*.25+t*.1,.7-a*.12,-.6+a*.25),l=3.2;break}case`serve`:{let e=zd(r.player.x,-1.2,1.2);s.set(e*.5-.3,2.3+a*1,3.25+a*.75),c.set(e*.25-.1,.82,-.55+a*.2),l=2.6;break}case`point`:{let e=1-Math.exp(-o*.35);s.set(Math.sin(o*.25)*.5,1.55+a*.5-e*.15,2.7+a*1.1-e*.6),c.set(Math.sin(o*.2)*.15,.82,-.1),l=1.6;break}case`celebrate`:{let e=this.celebrateSide===`player`?1:-1,t=e*(J+.6),n=3.1+a*1,r=Math.sin(o*.32)*1.05;s.set(Math.sin(r)*n,1.75+Math.sin(o*.5)*.08,t-e*Math.cos(r)*n),c.set(0,1.1,t),l=1.8;break}case`menu`:{this.menuAngle+=e*.07;let t=this.menuAngle,n=4.6+a*1.6;s.set(Math.sin(t)*n,2.25+Math.sin(this.time*.13)*.3,Math.cos(t)*n),c.set(0,.72,0),l=1.5;break}}n&&this.mode!==`menu`&&(s.x=-s.x,s.z=-s.z,c.x=-c.x,c.z=-c.z);let u=zd(o/1.4,0,1),d=At.lerp(Math.min(this.prevRate,1.6),l,u);u>=1&&(this.prevRate=l);let f=this.first?1:1-Math.exp(-d*e);this.pos.lerp(s,f),this.target.lerp(c,f);let p=vf[this.mode];if(i<1.6){let e=2*Math.atan(Math.tan(At.degToRad(p)/2)*1.6);p=Math.min(74,At.radToDeg(2*Math.atan(Math.tan(e/2)/i)))}this.fov=this.first?p:At.lerp(this.fov,p,1-Math.exp(-3*e)),this.first=!1,this.shakeAmp*=Math.exp(-7*e);let m=this.shakeAmp*.035,h=this.camera;h.position.copy(this.pos),m>1e-4&&(h.position.x+=(Math.sin(this.time*71.3)+Math.sin(this.time*37.1))*.5*m,h.position.y+=(Math.sin(this.time*59.7)+Math.sin(this.time*23.9))*.5*m),h.lookAt(this.target);let g=this.fov-this.slowMo*6;Math.abs(h.fov-g)>.01&&(h.fov=g,h.updateProjectionMatrix())}},bf={value:600},xf=`
attribute float size;
attribute vec4 rgba;
varying vec4 vC;
uniform float uScale;
void main() {
  vC = rgba;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = max(1.0, size * uScale / -mv.z);
  gl_Position = projectionMatrix * mv;
}`,Sf=`
varying vec4 vC;
uniform float uSoft;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float a = 1.0 - smoothstep(1.0 - uSoft, 1.0, d);
  if (vC.a * a < 0.004) discard;
  gl_FragColor = vec4(vC.rgb, vC.a * a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Cf=class{cap;gravity;drag;points;pos;col;size;vel;life;maxLife;size0;base;next=0;constructor(e,t,n,r=-3,i=2.5){this.cap=e,this.gravity=r,this.drag=i;let a=new Mr;this.pos=new Float32Array(e*3),this.col=new Float32Array(e*4),this.size=new Float32Array(e),this.vel=new Float32Array(e*3),this.life=new Float32Array(e),this.maxLife=new Float32Array(e),this.size0=new Float32Array(e),this.base=new Float32Array(e*4),a.setAttribute(`position`,new _r(this.pos,3).setUsage(Ke)),a.setAttribute(`rgba`,new _r(this.col,4).setUsage(Ke)),a.setAttribute(`size`,new _r(this.size,1).setUsage(Ke));let o=new No({vertexShader:xf,fragmentShader:Sf,uniforms:{uScale:bf,uSoft:{value:n}},transparent:!0,depthWrite:!1,blending:t});this.points=new Hi(a,o),this.points.frustumCulled=!1,this.points.renderOrder=5}emit(e,t,n,r,i,a){let o=this.next;this.next=(this.next+1)%this.cap,this.pos.set([e.x,e.y,e.z],o*3),this.vel.set([t.x,t.y,t.z],o*3),this.base.set([n.r,n.g,n.b,r],o*4),this.life[o]=a,this.maxLife[o]=a,this.size0[o]=i}clear(){this.life.fill(0),this.next=0}update(e,t=0){let n=Math.exp(-this.drag*e);for(let r=0;r<this.cap;r++){if(this.life[r]<=0){this.col[r*4+3]=0,this.size[r]=0;continue}this.life[r]-=e;let i=zd(this.life[r]/this.maxLife[r],0,1);this.vel[r*3]*=n,this.vel[r*3+1]=this.vel[r*3+1]*n+this.gravity*e,this.vel[r*3+2]*=n,this.pos[r*3]+=this.vel[r*3]*e,this.pos[r*3+1]+=this.vel[r*3+1]*e,this.pos[r*3+2]+=this.vel[r*3+2]*e,this.col[r*4]=this.base[r*4],this.col[r*4+1]=this.base[r*4+1],this.col[r*4+2]=this.base[r*4+2],this.col[r*4+3]=this.base[r*4+3]*i,this.size[r]=this.size0[r]*(t>0?1+(1-i)*t:.4+.6*i)}let r=this.points.geometry;r.attributes.position.needsUpdate=!0,r.attributes.rgba.needsUpdate=!0,r.attributes.size.needsUpdate=!0}},wf={player:Y.accent,opponent:Y.accent2},Tf=class{group=new kn;ripples=[];flashes=[];sparks=new Cf(260,2,.9,-4,3);dust=new Cf(120,1,1,.25,3.5);hitLight;sideLights;sideT={player:9,opponent:9};hitT=9;hitI=0;confetti;conf=[];confActive=0;targets=new Map;traj;trajPoints=null;time=0;onShake=()=>{};onPulse=()=>{};constructor(e=260){this.group.add(this.sparks.points,this.dust.points);let t=new So(.82,1,40);t.rotateX(-Math.PI/2);for(let e=0;e<10;e++){let e=new W(t,new li({color:`#ffffff`,transparent:!0,depthWrite:!1,opacity:0,side:2}));e.visible=!1,e.renderOrder=4,this.group.add(e),this.ripples.push({mesh:e,t:1,dur:1,max:.1})}let n=xd(64,.15);for(let e=0;e<5;e++){let e=new ni(new Hr({map:n,color:`#fff2d0`,blending:2,transparent:!0,depthWrite:!1,opacity:0}));e.visible=!1,e.renderOrder=6,this.group.add(e),this.flashes.push({s:e,t:1,dur:1,scale:.2})}this.hitLight=new bs(`#fff1d6`,0,3,2),this.group.add(this.hitLight),this.sideLights={player:new bs(Y.accent,0,9,1.4),opponent:new bs(Y.accent2,0,9,1.4)},this.sideLights.player.position.set(0,2.3,J+1.2),this.sideLights.opponent.position.set(0,2.3,-J-1.2),this.group.add(this.sideLights.player,this.sideLights.opponent);let r=new xo(.035,.022);this.confetti=new Mi(r,new Fo({side:2,roughness:.6,emissive:`#222222`}),e);let i=[Y.accent,Y.accent2,Y.gold,`#ffffff`,Y.good,`#8a7dff`],a=new U;for(let t=0;t<e;t++)this.confetti.setColorAt(t,a.set(i[t%i.length])),this.conf.push({p:new V,v:new V,r:new V,w:new V,life:0});this.confetti.visible=!1,this.confetti.frustumCulled=!1,this.group.add(this.confetti),this.traj=new Cf(90,1,.35,0,0),this.group.add(this.traj.points)}bounce(e,t){let n=e.y<.3?.004:q.height+.002;this.ripple(new V(e.x,n,e.z),`#ffffff`,.13,.5,.9),this.ripple(new V(e.x,n,e.z),wf[t===`player`?`opponent`:`player`],.075,.38,.55);let r=new U(`#ffffff`);for(let t=0;t<6;t++){let t=Math.random()*Math.PI*2;this.sparks.emit(e,new V(Math.cos(t)*.6,.5+Math.random()*.5,Math.sin(t)*.6),r,.6,.02,.28)}}hit(e,t,n){t=zd(t,0,1);let r=t>=.8,i=Math.round(8+t*22+(r?20:0)),a=new U(Y.gold),o=new U(wf[n]),s=new U(`#fff6e0`),c=n===`player`?-1:1;for(let n=0;n<i;n++){let i=new V(Math.random()-.5,Math.random()-.3,Math.random()-.5).normalize().multiplyScalar(.6+Math.random()*(1.2+t*2.6));i.z+=c*t*1.5;let l=n%3==0?o:n%3==1?a:s;this.sparks.emit(e,i,l,.95,.022+Math.random()*.02+(r?.014:0),.22+Math.random()*.25+t*.15)}let l=this.flashes.find(e=>e.t>=e.dur)??this.flashes[0];l.t=0,l.dur=r?.22:.14,l.scale=.12+t*.25+(r?.2:0),l.s.position.copy(e),l.s.visible=!0,l.s.material.color.set(r?`#ffe2a8`:`#fff4dc`),this.hitLight.position.copy(e),this.hitLight.color.set(r?Y.gold:`#fff1d6`),this.hitI=1+t*3+(r?4:0),this.hitT=0,r&&(this.ripple(e.clone(),Y.gold,.22,.3,.7,!0),this.onShake(.25+(t-.8)*2))}net(e){let t=new U(`#ffffff`);for(let n=0;n<6;n++)this.dust.emit(e,new V((Math.random()-.5)*.4,Math.random()*.3,(Math.random()-.5)*.4),t,.35,.03,.4)}floor(e){let t=new U(`#d8cbb5`);for(let n=0;n<14;n++){let n=Math.random()*Math.PI*2,r=.25+Math.random()*.4;this.dust.emit(new V(e.x,.03,e.z),new V(Math.cos(n)*r,.15+Math.random()*.25,Math.sin(n)*r),t,.4,.06+Math.random()*.05,.6+Math.random()*.4)}this.ripple(new V(e.x,.004,e.z),`#ffffff`,.18,.5,.35)}pointWon(e){this.sideT[e]=0,this.onPulse(e,wf[e])}confettiBurst(){this.confActive=4.5,this.confetti.visible=!0;for(let e=0;e<this.conf.length;e++){let t=this.conf[e],n=e%2==0?1:-1;t.p.set((Math.random()-.5)*1.6,.9+Math.random()*.3,n*(J+.4)*Math.random()),t.v.set((Math.random()-.5)*3,3.5+Math.random()*3,(Math.random()-.5)*3),t.r.set(Math.random()*6,Math.random()*6,Math.random()*6),t.w.set((Math.random()-.5)*14,(Math.random()-.5)*14,(Math.random()-.5)*14),t.life=2.8+Math.random()*1.6}}setTrajectory(e){this.trajPoints=e&&e.length>1?e:null}setTargets(e){let t=new Set(e.map(e=>e.id));for(let[e,n]of this.targets)!t.has(e)&&n.popT<0&&(this.disposeTarget(n),this.targets.delete(e));for(let t of e){let e=this.targets.get(t.id);if(!e){let n=new kn,r=new U(t.color??Y.gold),i=new W(new So(.86,1,48).rotateX(-Math.PI/2),new li({color:r,transparent:!0,depthWrite:!1})),a=new W(new Zi(.86,48).rotateX(-Math.PI/2),new li({color:r,transparent:!0,opacity:.22,depthWrite:!1})),o=new W(new Zi(.16,24).rotateX(-Math.PI/2),new li({color:`#ffffff`,transparent:!0,opacity:.9,depthWrite:!1})),s=new W(new So(.42,.5,40).rotateX(-Math.PI/2),new li({color:`#ffffff`,transparent:!0,opacity:.55,depthWrite:!1}));o.position.y=s.position.y=5e-4,n.add(a,i,s,o),n.renderOrder=3,n.traverse(e=>e.renderOrder=3),this.group.add(n),e={id:t.id,g:n,ring:i,disc:a,t:0,popT:-1,color:r,radius:t.radius},this.targets.set(t.id,e)}e.radius=t.radius,e.g.position.set(t.pos.x,q.height+.0025,t.pos.z),t.color&&e.color.set(t.color)}}hitTarget(e){let t=this.targets.get(e);if(!t||t.popT>=0)return;t.popT=0;let n=t.g.position.clone();n.y+=.02;for(let e=0;e<28;e++){let r=e/28*Math.PI*2;this.sparks.emit(n,new V(Math.cos(r)*1.6,1+Math.random(),Math.sin(r)*1.6),t.color,1,.02,.5)}this.ripple(n,`#ffffff`,t.radius*2.2,.45,.9)}disposeTarget(e){e.g.removeFromParent(),e.g.traverse(e=>{let t=e;t.isMesh&&(t.geometry.dispose(),t.material.dispose())})}ripple(e,t,n,r,i,a=!1){let o=this.ripples.find(e=>e.t>=e.dur)??this.ripples[0];o.t=0,o.dur=r,o.max=n,o.mesh.position.copy(e),o.mesh.visible=!0,o.mesh.rotation.set(a?Math.PI/2:0,0,0);let s=o.mesh.material;s.color.set(t),s.userData.alpha=i}update(e){this.time+=e;for(let t of this.ripples){if(t.t>=t.dur)continue;t.t+=e;let n=zd(t.t/t.dur,0,1),r=1-(1-n)**3,i=.01+t.max*r;t.mesh.scale.set(i,i,i),t.mesh.material.opacity=(1-n)**1.5*(t.mesh.material.userData.alpha??1),n>=1&&(t.mesh.visible=!1)}for(let t of this.flashes){if(t.t>=t.dur)continue;t.t+=e;let n=zd(t.t/t.dur,0,1),r=t.scale*(.6+n*.8);t.s.scale.set(r,r,r),t.s.material.opacity=(1-n)**2,n>=1&&(t.s.visible=!1)}this.hitT+=e,this.hitLight.intensity=this.hitT<.25?this.hitI*(1-this.hitT/.25)**2:0;for(let t of[`player`,`opponent`]){this.sideT[t]+=e;let n=this.sideT[t];this.sideLights[t].intensity=n<1.4?9*Math.sin(Math.min(1,n/.15)*Math.PI*.5)*(1-n/1.4)**1.5:0}if(this.sparks.update(e),this.dust.update(e,1.5),this.confActive>0){this.confActive-=e;let t=new en,n=new On;for(let r=0;r<this.conf.length;r++){let i=this.conf[r];i.life-=e,i.life>0?(i.v.y-=6*e,i.v.multiplyScalar(Math.exp(-2.2*e)),i.v.x+=Math.sin(this.time*3+r)*.6*e,i.v.y<-1.1&&(i.v.y=-1.1),i.p.addScaledVector(i.v,e),i.p.y<.01&&(i.p.y=.01,i.v.set(0,0,0)),i.r.addScaledVector(i.w,e),n.position.copy(i.p),n.rotation.set(i.r.x,i.r.y,i.r.z),n.scale.setScalar(Math.min(1,i.life*2))):n.scale.setScalar(0),n.updateMatrix(),t.copy(n.matrix),this.confetti.setMatrixAt(r,t)}this.confetti.instanceMatrix.needsUpdate=!0,this.confActive<=0&&(this.confetti.visible=!1)}for(let[t,n]of this.targets){n.t+=e;let r=1+Math.sin(n.t*3)*.04;if(n.popT>=0){n.popT+=e;let r=zd(n.popT/.45,0,1),i=n.radius*(1+r*.8);n.g.scale.set(i,1,i),n.g.traverse(e=>{let t=e;t.isMesh&&(t.material.opacity=(1-r)*(t===n.disc?.3:.9))}),r>=1&&(this.disposeTarget(n),this.targets.delete(t))}else{let e=zd(n.t/.3,0,1),t=n.radius*r*(.5+.5*e);n.g.scale.set(t,1,t),n.ring.material.color.copy(n.color),n.disc.material.color.copy(n.color),n.disc.material.opacity=.18+.08*Math.sin(n.t*3)}}let t=this.trajPoints,n=this.traj.cap;if(t){let e=[0];for(let n=1;n<t.length;n++)e.push(e[n-1]+t[n].distanceTo(t[n-1]));let r=e[e.length-1],i=.06,a=this.time*.25%i,o=new U(`#ffffff`);this.traj.clear();let s=0,c=1;for(let l=a;l<r&&s<n;l+=i,s++){for(;c<t.length-1&&e[c]<l;)c++;let n=t[c-1],i=t[c],a=e[c]-e[c-1],s=a>1e-6?(l-e[c-1])/a:0,u=new V().lerpVectors(n,i,s),d=(1-l/r)**1.2;this.traj.emit(u,new V,o,.85*d,.016,1e-4)}this.traj.update(0)}else this.traj.clear(),this.traj.update(0)}},Ef={wait:`#ffffff`,swing:Y.good,armed:Y.gold,late:Y.danger},Df={player:Y.accent,opponent:Y.accent2};function Of(e){let t=document.createElement(`canvas`);t.width=t.height=128;let n=t.getContext(`2d`);return n.strokeStyle=`#fff`,n.lineWidth=e,n.beginPath(),n.arc(64,64,64-e/2-2,0,Math.PI*2),n.stroke(),new Gi(t)}function kf(){let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(64,64,8,64,64,62);return n.addColorStop(0,`rgba(255,255,255,0.9)`),n.addColorStop(.45,`rgba(255,255,255,0.35)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,128,128),new Gi(e)}var Af=.16,jf=.17,Mf=class{side;group=new kn;target;approach;glow;landing;pads=[];t=0;cur=null;pop=0;constructor(e,t){this.side=e;let n=(e,t)=>{let n=new ni(new Hr({map:e,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1}));return n.renderOrder=t,n};this.glow=n(t.glow,20),this.glow.material.blending=2,this.target=n(t.thin,21),this.approach=n(t.thick,22),this.group.add(this.glow,this.target,this.approach);let r=(e,t,n)=>{let r=new W(e,new li({color:t,transparent:!0,opacity:n,depthWrite:!1,toneMapped:!1}));return r.rotation.x=-Math.PI/2,r.renderOrder=4,r};this.landing=r(new So(.055,.085,40),Df[e],.85),this.group.add(this.landing);for(let t=0;t<3;t++){let t=r(new Zi(jf,40),Df[e],.12),n=r(new So(.15200000000000002,jf,48),`#ffffff`,.5);n.rotation.x=0,n.position.z=.001,t.add(n),this.pads.push(t),this.group.add(t)}this.group.visible=!1}set(e){e&&!this.cur&&(this.pop=0),this.cur=e}update(e){this.t+=e;let t=this.cur;if(this.group.visible=!!t,!t)return;this.pop=Math.min(1,this.pop+e*5);let n=new U(Ef[t.state]),r=Math.max(0,Math.min(1,t.fill));for(let e of[this.target,this.approach,this.glow])e.position.copy(t.ball);let i=t.state===`wait`?r:1,a=Af*(1+3.2*(1-i)*(1-i*.15));this.approach.scale.setScalar(a*(.6+.4*this.pop)),this.approach.material.color.copy(n),this.approach.material.opacity=t.state===`late`?.55:.4+.6*r;let o=t.state===`swing`?1+.12*Math.sin(this.t*30):1;this.target.scale.setScalar(Af*o),this.target.material.color.copy(t.state===`wait`?new U(Df[this.side]):n),this.target.material.opacity=.9,this.glow.visible=t.state===`swing`||t.state===`armed`,this.glow.scale.setScalar(Af*2.1*o),this.glow.material.color.copy(n),this.glow.material.opacity=.7,this.landing.visible=!!t.landing,t.landing&&(this.landing.position.set(t.landing.x,q.height+.004,t.landing.z),this.landing.scale.setScalar(1+.18*Math.sin(this.t*9)));let s=!!t.pads;this.pads.forEach((e,n)=>{if(e.visible=s,!t.pads)return;e.position.set(t.pads[n].x,q.height+.003,t.pads[n].z);let r=n-1===t.zone;e.material.opacity=r?.55+.1*Math.sin(this.t*6):.1,e.scale.setScalar(r?1.08:.9)})}},Nf=class{group=new kn;sides;constructor(){let e={thin:Of(9),thick:Of(14),glow:kf()};this.sides={player:new Mf(`player`,e),opponent:new Mf(`opponent`,e)},this.group.add(this.sides.player.group,this.sides.opponent.group)}set(e,t){this.sides[e].set(t)}update(e){this.sides.player.update(e),this.sides.opponent.update(e)}},Pf=512,Ff=300,If=class{group=new kn;cards=[];data={player:0,opponent:0,gamesP:0,gamesO:0,names:[`You`,`CPU`]};pending=[null,null];constructor(){let e=Md(`#f4f1ea`,{rough:.55}),t=Md(`#2a3042`,{rough:.6,metal:.2}),n=new W(new Qi(.025,.03,.9,10),t);n.position.y=.45;let r=new W(new Qi(.22,.25,.04,20),t);r.position.y=.02;let i=new W(new Yi(.98,.42,.07),e);i.position.y=1.08;let a=new W(new Yi(.98,.07,.075),Md(Y.ink,{rough:.6}));a.position.y=1.3,this.group.add(n,r,i,a);for(let e of[n,r,i,a])e.castShadow=!0,e.receiveShadow=!0;let[o,s]=_d(512,40);s.fillStyle=Y.ink,s.fillRect(0,0,512,40),s.fillStyle=`#ffffff`,s.font=`800 26px ${gd}`,s.textAlign=`center`,s.textBaseline=`middle`,s.fillText(`S P I N S H O T`,256,21);let c=new W(new xo(.96,.066),new li({map:vd(o),toneMapped:!1}));c.position.set(0,1.3,.0385),this.group.add(c);for(let e=0;e<2;e++){let[t,n]=_d(Pf,Ff),r=vd(t),i=new W(new xo(.46,Ff/Pf*.46),new Fo({map:r,roughness:.5,emissive:`#ffffff`,emissiveMap:r,emissiveIntensity:.35}));i.position.set(e===0?-.24:.24,1.075,.036),this.group.add(i),this.cards.push({canvas:t,ctx:n,tex:r,mesh:i,flip:1,shown:``})}this.draw(0),this.draw(1)}set(e){this.data={...e,names:[e.names[0],e.names[1]]};for(let e=0;e<2;e++)this.key(e)!==this.cards[e].shown&&(this.cards[e].flip=0,this.pending[e]=this.data)}key(e){let t=this.data;return e===0?`${t.names[0]}|${t.player}|${t.gamesP}`:`${t.names[1]}|${t.opponent}|${t.gamesO}`}draw(e){let t=this.cards[e],n=t.ctx,r=this.data,i=r.names[e]??``,a=e===0?r.player:r.opponent,o=e===0?r.gamesP:r.gamesO,s=e===0?Y.accent:Y.accent2;n.clearRect(0,0,Pf,Ff),n.fillStyle=`#f4f1ea`,n.fillRect(0,0,Pf,Ff),n.fillStyle=s,bd(n,14,10,484,54,14),n.fill(),n.fillStyle=`#ffffff`,n.font=`800 34px ${gd}`,n.textAlign=`center`,n.textBaseline=`middle`,n.fillText(i.toUpperCase().slice(0,12),Pf/2,39),n.fillStyle=`#1f2537`,bd(n,64,76,384,210,22),n.fill(),n.fillStyle=`#2a3148`,bd(n,64,76,384,105,22),n.fill(),n.fillRect(64,161,384,20),n.fillStyle=`#ffffff`,n.font=`900 172px ${gd}`,n.fillText(String(a),Pf/2,191),n.fillStyle=`#11151f`,n.fillRect(64,179,384,4),n.fillStyle=`#8890a6`,n.fillRect(56,172,14,18),n.fillRect(442,172,14,18);for(let e=0;e<3;e++)n.fillStyle=e<o?Y.gold:`rgba(29,35,51,0.18)`,n.beginPath(),n.arc(28,116+e*56,13,0,Math.PI*2),n.fill();t.tex.needsUpdate=!0,t.shown=this.key(e)}update(e){for(let t=0;t<2;t++){let n=this.cards[t];if(n.flip>=1)continue;let r=n.flip;n.flip=Math.min(1,n.flip+e/.32),r<.5&&n.flip>=.5&&this.pending[t]&&(this.draw(t),this.pending[t]=null),n.mesh.scale.y=Math.max(.02,Math.abs(Math.cos(n.flip*Math.PI)))}}},Lf=class{group=new kn;net;netBase;wobbles=[];constructor(){let e=this.group,t=q.height,n=q.thickness,r=Md(Y.table,{rough:.55}),i=Md(Y.tableDark,{rough:.6}),a=Md(`#22324f`,{rough:.9}),o=new W(new Yi(q.width,n,q.length),[i,i,r,a,i,i]);o.position.y=t-n/2,e.add(o);let s=Md(Y.line,{rough:.45}),c=t+6e-4,l=.0012,u=new Yi(.02,l,q.length);for(let t of[-1,1]){let n=new W(u,s);n.position.set(t*(sd-.01),c,0),e.add(n);let r=new W(new Yi(q.width,l,.02),s);r.position.set(0,c,t*(J-.01)),e.add(r)}let d=new W(new Yi(.003,l,q.length-.04),s);d.position.set(0,c,0),e.add(d);let f=Md(`#1a2a48`,{rough:.8}),p=.07;for(let r of[-1,1]){let i=new W(new Yi(.025,p,q.length-.12),f);i.position.set(r*(sd-.06),t-n-p/2,0),e.add(i);let a=new W(new Yi(q.width-.12,p,.025),f);a.position.set(0,t-n-p/2,r*(J-.06)),e.add(a)}let m=Md(`#2c3140`,{rough:.5,metal:.3}),h=t-n-p,g=new Yi(.045,h,.045);for(let t of[-1,1]){for(let n of[-1,1]){let r=new W(g,m);r.position.set(t*(sd-.16),h/2,n*(J-.3)),e.add(r);let i=new W(new Qi(.04,.045,.04,12),Md(`#1b1e27`,{rough:.6}));i.position.set(t*(sd-.16),.02,n*(J-.3)),e.add(i)}let n=new W(new Yi(q.width-.32,.04,.04),m);n.position.set(0,.22,t*(J-.3)),e.add(n)}let _=new W(new Yi(.06,.06,q.length-.6),m);_.position.set(0,.22,0),e.add(_);for(let t of[-1,1]){let n=new W(new Yi(.035,.035,.75),m);n.position.set(0,(h+.22)/2+.05,t*.62),n.rotation.x=t*.62,e.add(n)}Nd(e,!0,!0),o.castShadow=!0;let v=q.width+2*q.netOverhang,y=q.netHeight,b=new xo(v,y-.012,36,4),x=Sd();x.repeat.set(v/.014,(y-.012)/.014);let S=new Fo({map:x,transparent:!0,alphaTest:.25,side:2,roughness:.9,color:`#ffffff`});this.net=new W(b,S),this.net.position.set(0,t+(y-.012)/2,0),this.net.castShadow=!0,e.add(this.net),this.netBase=b.attributes.position.array.slice();let C=new W(new Yi(v,.015,.006),Md(`#ffffff`,{rough:.5}));C.position.set(0,t+y-.0075,0),C.castShadow=!0,e.add(C);let w=new W(new Yi(v,.004,.004),Md(`#1d2333`));w.position.set(0,t+.004,0),e.add(w);let T=Md(`#262b38`,{rough:.45,metal:.4});for(let n of[-1,1]){let r=n*(sd+q.netOverhang),i=new W(new Qi(.009,.011,y+.01,10),T);i.position.set(r,t+(y+.01)/2,0),e.add(i);let a=new W(new Yi(q.netOverhang+.04,.018,.035),T);a.position.set(n*(sd+q.netOverhang/2-.01),t+.012,0),e.add(a);let o=new W(new Yi(.05,.07,.045),T);o.position.set(n*(sd+.005),t-.02,0),e.add(o);let s=new W(new Qi(.016,.016,.02,12),Md(Y.accent,{rough:.5}));s.position.set(n*(sd+.005),t-.06,0),e.add(s),i.castShadow=a.castShadow=o.castShadow=!0}Vd(e)}wobble(e,t=1){this.wobbles.push({x:e.x,t:0,amp:t}),this.wobbles.length>4&&this.wobbles.shift()}update(e){if(this.wobbles.length===0)return;let t=this.net.geometry,n=t.attributes.position,r=n.array,i=(q.netHeight-.012)/2;for(let t of this.wobbles)t.t+=e;this.wobbles=this.wobbles.filter(e=>e.t<1.4);for(let e=0;e<n.count;e++){let t=this.netBase[e*3],n=.35+.65*((i-this.netBase[e*3+1])/(2*i)),a=0;for(let e of this.wobbles){let r=t-e.x,i=Math.exp(-(r*r)/.12);a+=e.amp*.022*i*n*Math.sin(e.t*34-Math.abs(r)*9)*Math.exp(-e.t*4.5)}r[e*3+2]=a}n.needsUpdate=!0,this.wobbles.length===0&&(r.set(this.netBase),n.needsUpdate=!0),t.computeVertexNormals()}},Rf=.13,zf=new U(`#5f86c8`),Bf=4,Vf=class{camera;renderer;scene=new Rn;cues=new Nf;fx;container;quality;theme;env=null;hemi=new is;sun=new Cs;spot=new vs;table=new Lf;ball=new _f;fxs=new Tf;board=new If;rig;camera2;rig2;split=!1;vw=1;vh=1;slowTarget=0;slowK=0;baseExposure=1;baseBg=new U;baseHemiSky=new U;baseHemiGround=new U;baseHemi=1;avatars;time=0;ghost=Rf;ro=null;onResize=()=>this.resize();constructor(e,t){this.container=e,this.quality=t.quality,this.theme=t.theme,this.renderer=new id({antialias:t.quality!==`low`,powerPreference:`high-performance`}),this.renderer.outputColorSpace=Be,this.renderer.toneMapping=4,this.renderer.shadowMap.type=1;let n=this.renderer.domElement;n.style.display=`block`,n.style.width=`100%`,n.style.height=`100%`,e.appendChild(n),this.camera=new gs(52,1.6,.05,80),this.rig=new yf(this.camera),this.camera2=new gs(52,1.6,.05,80),this.rig2=new yf(this.camera2,`opponent`),this.scene.add(this.hemi),this.sun.position.set(-3,7,2.5),this.sun.target.position.set(0,.6,0);let r=this.sun.shadow.camera;r.left=-4.2,r.right=4.2,r.top=4.6,r.bottom=-4.6,r.near=1,r.far=20,this.sun.shadow.bias=-4e-4,this.sun.shadow.normalBias=.02,this.sun.shadow.radius=4,this.scene.add(this.sun,this.sun.target),this.spot.position.set(0,6.6,.4),this.spot.target.position.set(0,q.height,0),this.spot.angle=.55,this.spot.penumbra=.85,this.spot.decay=2,this.spot.distance=0,this.scene.add(this.spot,this.spot.target),this.scene.add(this.table.group,this.ball.group,this.fxs.group,this.board.group,this.cues.group),this.board.group.position.set(-(sd+1.05),0,-.15),this.board.group.rotation.y=.42,this.avatars={player:new pf(`player`,Y.accent),opponent:new pf(`opponent`,Y.accent2)},this.avatars.player.setGhost(Rf),this.scene.add(this.avatars.player.group,this.avatars.opponent.group),this.fxs.onShake=e=>this.shake(e),this.fxs.onPulse=(e,t)=>this.env?.pulse(e,t);let i=this.fxs;this.fx={bounce:(e,t)=>i.bounce(e,t),hit:(e,t,n)=>i.hit(e,t,n),net:e=>{i.net(e),this.table.wobble(e)},floor:e=>i.floor(e),pointWon:e=>i.pointWon(e),confetti:()=>i.confettiBurst()},this.applyTheme(),this.applyQuality(),window.addEventListener(`resize`,this.onResize),typeof ResizeObserver<`u`&&(this.ro=new ResizeObserver(this.onResize),this.ro.observe(e)),this.resize()}setTheme(e){e!==this.theme&&(this.theme=e,this.applyTheme())}setQuality(e){if(e===this.quality)return;let t=e===`low`!=(this.quality===`low`);this.quality=e,this.applyQuality(),this.applyTheme(),t&&this.scene.traverse(e=>{let t=e.material;if(t)for(let e of Array.isArray(t)?t:[t])e.needsUpdate=!0})}applyTheme(){this.env&&(this.scene.remove(this.env.group),Pd(this.env.group)),this.env=Hd(this.theme,this.quality),this.scene.add(this.env.group);let e=this.env.lights;this.scene.background=new U(e.background),this.scene.fog=new Ln(e.fog[0],e.fog[1],e.fog[2]),this.hemi.color.set(e.hemiSky),this.hemi.groundColor.set(e.hemiGround),this.hemi.intensity=e.hemi,this.baseBg.set(e.background),this.baseHemiSky.set(e.hemiSky),this.baseHemiGround.set(e.hemiGround),this.baseHemi=e.hemi,this.baseExposure=e.exposure,this.sun.color.set(e.dirColor),this.sun.intensity=e.dir,this.sun.position.set(...e.dirPos),this.spot.color.set(e.spotColor),this.spot.intensity=e.spot,this.renderer.toneMappingExposure=e.exposure,this.applySlowLook()}applyQuality(){let e=this.quality,t=window.devicePixelRatio||1;this.renderer.setPixelRatio(e===`low`?1:e===`medium`?Math.min(t,1.5):Math.min(t,2)),this.renderer.shadowMap.enabled=e!==`low`,this.sun.castShadow=e!==`low`;let n=e===`high`?2048:1024;this.sun.shadow.mapSize.x!==n&&(this.sun.shadow.mapSize.set(n,n),this.sun.shadow.map?.dispose(),this.sun.shadow.map=null),this.sun.shadow.radius=e===`high`?5:3,this.resize()}resize(){let e=Math.max(1,this.container.clientWidth||window.innerWidth),t=Math.max(1,this.container.clientHeight||window.innerHeight);this.vw=e,this.vh=t,this.renderer.setSize(e,t,!1);let n=(this.split?e/2:e)/t;this.camera.aspect=n,this.camera.updateProjectionMatrix(),this.camera2.aspect=n,this.camera2.updateProjectionMatrix()}setSplit(e){e!==this.split&&(this.split=e,this.avatars.opponent.setGhost(e?Rf:null),e&&this.rig2.snap(),this.resize())}setSlowMo(e){this.slowTarget=At.clamp(e,0,1)}applySlowLook(){let e=this.slowK,t=e*e*(3-2*e);this.renderer.toneMappingExposure=this.baseExposure*(1-.22*t),this.scene.background instanceof U&&this.scene.background.copy(this.baseBg).lerp(zf,.45*t),this.scene.fog&&this.scene.fog.color.copy(this.baseBg).lerp(zf,.45*t),this.hemi.color.copy(this.baseHemiSky).lerp(zf,.4*t),this.hemi.groundColor.copy(this.baseHemiGround).lerp(zf,.3*t),this.hemi.intensity=this.baseHemi*(1-.1*t),this.rig.slowMo=t,this.rig2.slowMo=t,this.ball.setSlowMo(t)}setBall(e,t,n){this.ball.set(e,t,n)}setAvatar(e,t,n){this.avatars[e].setPose(t,n)}avatarReact(e,t){this.avatars[e].react(t)}setAvatarColors(e,t){this.avatars[e].setColor(t)}setHitCue(e,t){this.cues.set(e,t)}setTrajectory(e){this.fxs.setTrajectory(e)}setTargets(e){this.fxs.setTargets(e)}hitTarget(e){this.fxs.hitTarget(e)}setScoreboard(e){this.board.set(e)}setCameraMode(e,t){this.rig.setMode(e,t),this.rig2.setMode(e,t)}shake(e){this.rig.shake(e),this.rig2.shake(e)}update(e,t){if(e=Math.max(0,Math.min(e,.1)),this.time+=e,this.env?.update(e,this.time),this.avatars.player.update(e),this.avatars.opponent.update(e),this.table.update(e),this.board.update(e),this.slowK!==this.slowTarget){let t=Bf*e;this.slowK=Math.abs(this.slowTarget-this.slowK)<=t?this.slowTarget:this.slowK+Math.sign(this.slowTarget-this.slowK)*t,this.applySlowLook()}this.rig.update(e,t),this.split&&this.rig2.update(e,{ball:t.ball,player:t.opponent??t.ball});let n=this.rig.mode===`play`||this.rig.mode===`serve`||this.rig.mode===`point`;this.ghost+=((n?Rf:1)-this.ghost)*(1-Math.exp(-4*e)),this.camera.updateMatrixWorld(),this.ball.update(e,this.camera),this.fxs.update(e),this.cues.update(e),bf.value=this.renderer.domElement.height/(2*Math.tan(At.degToRad(this.camera.fov)/2))}render(){let e=this.renderer;if(!this.split){e.setScissorTest(!1),e.setViewport(0,0,this.vw,this.vh),this.avatars.player.setOpacity(this.ghost),e.render(this.scene,this.camera);return}let t=Math.floor(this.vw/2);e.setScissorTest(!0),e.setViewport(0,0,t,this.vh),e.setScissor(0,0,t,this.vh),this.avatars.player.setOpacity(this.ghost),this.avatars.opponent.setOpacity(1),e.render(this.scene,this.camera),e.setViewport(t,0,this.vw-t,this.vh),e.setScissor(t,0,this.vw-t,this.vh),this.avatars.player.setOpacity(1),this.avatars.opponent.setOpacity(this.ghost),this.camera2.updateMatrixWorld(),this.ball.faceCamera(this.camera2),e.render(this.scene,this.camera2),e.setScissorTest(!1),e.setViewport(0,0,this.vw,this.vh)}dispose(){window.removeEventListener(`resize`,this.onResize),this.ro?.disconnect(),this.env&&Pd(this.env.group),Pd(this.scene),this.renderer.dispose(),this.renderer.domElement.remove()}},Hf=e(((e,t)=>{t.exports=function(){return typeof Promise==`function`&&Promise.prototype&&Promise.prototype.then}})),Uf=e((e=>{var t,n=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];e.getSymbolSize=function(e){if(!e)throw Error(`"version" cannot be null or undefined`);if(e<1||e>40)throw Error(`"version" should be in range from 1 to 40`);return e*4+17},e.getSymbolTotalCodewords=function(e){return n[e]},e.getBCHDigit=function(e){let t=0;for(;e!==0;)t++,e>>>=1;return t},e.setToSJISFunction=function(e){if(typeof e!=`function`)throw Error(`"toSJISFunc" is not a valid function.`);t=e},e.isKanjiModeEnabled=function(){return t!==void 0},e.toSJIS=function(e){return t(e)}})),Wf=e((e=>{e.L={bit:1},e.M={bit:0},e.Q={bit:3},e.H={bit:2};function t(t){if(typeof t!=`string`)throw Error(`Param is not a string`);switch(t.toLowerCase()){case`l`:case`low`:return e.L;case`m`:case`medium`:return e.M;case`q`:case`quartile`:return e.Q;case`h`:case`high`:return e.H;default:throw Error(`Unknown EC Level: `+t)}}e.isValid=function(e){return e&&e.bit!==void 0&&e.bit>=0&&e.bit<4},e.from=function(n,r){if(e.isValid(n))return n;try{return t(n)}catch{return r}}})),Gf=e(((e,t)=>{function n(){this.buffer=[],this.length=0}n.prototype={get:function(e){let t=Math.floor(e/8);return(this.buffer[t]>>>7-e%8&1)==1},put:function(e,t){for(let n=0;n<t;n++)this.putBit((e>>>t-n-1&1)==1)},getLengthInBits:function(){return this.length},putBit:function(e){let t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),e&&(this.buffer[t]|=128>>>this.length%8),this.length++}},t.exports=n})),Kf=e(((e,t)=>{function n(e){if(!e||e<1)throw Error(`BitMatrix size must be defined and greater than 0`);this.size=e,this.data=new Uint8Array(e*e),this.reservedBit=new Uint8Array(e*e)}n.prototype.set=function(e,t,n,r){let i=e*this.size+t;this.data[i]=n,r&&(this.reservedBit[i]=!0)},n.prototype.get=function(e,t){return this.data[e*this.size+t]},n.prototype.xor=function(e,t,n){this.data[e*this.size+t]^=n},n.prototype.isReserved=function(e,t){return this.reservedBit[e*this.size+t]},t.exports=n})),qf=e((e=>{var t=Uf().getSymbolSize;e.getRowColCoords=function(e){if(e===1)return[];let n=Math.floor(e/7)+2,r=t(e),i=r===145?26:Math.ceil((r-13)/(2*n-2))*2,a=[r-7];for(let e=1;e<n-1;e++)a[e]=a[e-1]-i;return a.push(6),a.reverse()},e.getPositions=function(t){let n=[],r=e.getRowColCoords(t),i=r.length;for(let e=0;e<i;e++)for(let t=0;t<i;t++)e===0&&t===0||e===0&&t===i-1||e===i-1&&t===0||n.push([r[e],r[t]]);return n}})),Jf=e((e=>{var t=Uf().getSymbolSize,n=7;e.getPositions=function(e){let r=t(e);return[[0,0],[r-n,0],[0,r-n]]}})),Yf=e((e=>{e.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};var t={N1:3,N2:3,N3:40,N4:10};e.isValid=function(e){return e!=null&&e!==``&&!isNaN(e)&&e>=0&&e<=7},e.from=function(t){return e.isValid(t)?parseInt(t,10):void 0},e.getPenaltyN1=function(e){let n=e.size,r=0,i=0,a=0,o=null,s=null;for(let c=0;c<n;c++){i=a=0,o=s=null;for(let l=0;l<n;l++){let n=e.get(c,l);n===o?i++:(i>=5&&(r+=t.N1+(i-5)),o=n,i=1),n=e.get(l,c),n===s?a++:(a>=5&&(r+=t.N1+(a-5)),s=n,a=1)}i>=5&&(r+=t.N1+(i-5)),a>=5&&(r+=t.N1+(a-5))}return r},e.getPenaltyN2=function(e){let n=e.size,r=0;for(let t=0;t<n-1;t++)for(let i=0;i<n-1;i++){let n=e.get(t,i)+e.get(t,i+1)+e.get(t+1,i)+e.get(t+1,i+1);(n===4||n===0)&&r++}return r*t.N2},e.getPenaltyN3=function(e){let n=e.size,r=0,i=0,a=0;for(let t=0;t<n;t++){i=a=0;for(let o=0;o<n;o++)i=i<<1&2047|e.get(t,o),o>=10&&(i===1488||i===93)&&r++,a=a<<1&2047|e.get(o,t),o>=10&&(a===1488||a===93)&&r++}return r*t.N3},e.getPenaltyN4=function(e){let n=0,r=e.data.length;for(let t=0;t<r;t++)n+=e.data[t];return Math.abs(Math.ceil(n*100/r/5)-10)*t.N4};function n(t,n,r){switch(t){case e.Patterns.PATTERN000:return(n+r)%2==0;case e.Patterns.PATTERN001:return n%2==0;case e.Patterns.PATTERN010:return r%3==0;case e.Patterns.PATTERN011:return(n+r)%3==0;case e.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(r/3))%2==0;case e.Patterns.PATTERN101:return n*r%2+n*r%3==0;case e.Patterns.PATTERN110:return(n*r%2+n*r%3)%2==0;case e.Patterns.PATTERN111:return(n*r%3+(n+r)%2)%2==0;default:throw Error(`bad maskPattern:`+t)}}e.applyMask=function(e,t){let r=t.size;for(let i=0;i<r;i++)for(let a=0;a<r;a++)t.isReserved(a,i)||t.xor(a,i,n(e,a,i))},e.getBestMask=function(t,n){let r=Object.keys(e.Patterns).length,i=0,a=1/0;for(let o=0;o<r;o++){n(o),e.applyMask(o,t);let r=e.getPenaltyN1(t)+e.getPenaltyN2(t)+e.getPenaltyN3(t)+e.getPenaltyN4(t);e.applyMask(o,t),r<a&&(a=r,i=o)}return i}})),Xf=e((e=>{var t=Wf(),n=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],r=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];e.getBlocksCount=function(e,r){switch(r){case t.L:return n[(e-1)*4+0];case t.M:return n[(e-1)*4+1];case t.Q:return n[(e-1)*4+2];case t.H:return n[(e-1)*4+3];default:return}},e.getTotalCodewordsCount=function(e,n){switch(n){case t.L:return r[(e-1)*4+0];case t.M:return r[(e-1)*4+1];case t.Q:return r[(e-1)*4+2];case t.H:return r[(e-1)*4+3];default:return}}})),Zf=e((e=>{var t=new Uint8Array(512),n=new Uint8Array(256);(function(){let e=1;for(let r=0;r<255;r++)t[r]=e,n[e]=r,e<<=1,e&256&&(e^=285);for(let e=255;e<512;e++)t[e]=t[e-255]})(),e.log=function(e){if(e<1)throw Error(`log(`+e+`)`);return n[e]},e.exp=function(e){return t[e]},e.mul=function(e,r){return e===0||r===0?0:t[n[e]+n[r]]}})),Qf=e((e=>{var t=Zf();e.mul=function(e,n){let r=new Uint8Array(e.length+n.length-1);for(let i=0;i<e.length;i++)for(let a=0;a<n.length;a++)r[i+a]^=t.mul(e[i],n[a]);return r},e.mod=function(e,n){let r=new Uint8Array(e);for(;r.length-n.length>=0;){let e=r[0];for(let i=0;i<n.length;i++)r[i]^=t.mul(n[i],e);let i=0;for(;i<r.length&&r[i]===0;)i++;r=r.slice(i)}return r},e.generateECPolynomial=function(n){let r=new Uint8Array([1]);for(let i=0;i<n;i++)r=e.mul(r,new Uint8Array([1,t.exp(i)]));return r}})),$f=e(((e,t)=>{var n=Qf();function r(e){this.genPoly=void 0,this.degree=e,this.degree&&this.initialize(this.degree)}r.prototype.initialize=function(e){this.degree=e,this.genPoly=n.generateECPolynomial(this.degree)},r.prototype.encode=function(e){if(!this.genPoly)throw Error(`Encoder not initialized`);let t=new Uint8Array(e.length+this.degree);t.set(e);let r=n.mod(t,this.genPoly),i=this.degree-r.length;if(i>0){let e=new Uint8Array(this.degree);return e.set(r,i),e}return r},t.exports=r})),ep=e((e=>{e.isValid=function(e){return!isNaN(e)&&e>=1&&e<=40}})),tp=e((e=>{var t=`[0-9]+`,n=`[A-Z $%*+\\-./:]+`,r=`(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+`;r=r.replace(/u/g,`\\u`);var i=`(?:(?![A-Z0-9 $%*+\\-./:]|`+r+`)(?:.|[\r
]))+`;e.KANJI=new RegExp(r,`g`),e.BYTE_KANJI=RegExp(`[^A-Z0-9 $%*+\\-./:]+`,`g`),e.BYTE=new RegExp(i,`g`),e.NUMERIC=new RegExp(t,`g`),e.ALPHANUMERIC=new RegExp(n,`g`);var a=RegExp(`^`+r+`$`),o=RegExp(`^[0-9]+$`),s=RegExp(`^[A-Z0-9 $%*+\\-./:]+$`);e.testKanji=function(e){return a.test(e)},e.testNumeric=function(e){return o.test(e)},e.testAlphanumeric=function(e){return s.test(e)}})),np=e((e=>{var t=ep(),n=tp();e.NUMERIC={id:`Numeric`,bit:1,ccBits:[10,12,14]},e.ALPHANUMERIC={id:`Alphanumeric`,bit:2,ccBits:[9,11,13]},e.BYTE={id:`Byte`,bit:4,ccBits:[8,16,16]},e.KANJI={id:`Kanji`,bit:8,ccBits:[8,10,12]},e.MIXED={bit:-1},e.getCharCountIndicator=function(e,n){if(!e.ccBits)throw Error(`Invalid mode: `+e);if(!t.isValid(n))throw Error(`Invalid version: `+n);return n>=1&&n<10?e.ccBits[0]:n<27?e.ccBits[1]:e.ccBits[2]},e.getBestModeForData=function(t){return n.testNumeric(t)?e.NUMERIC:n.testAlphanumeric(t)?e.ALPHANUMERIC:n.testKanji(t)?e.KANJI:e.BYTE},e.toString=function(e){if(e&&e.id)return e.id;throw Error(`Invalid mode`)},e.isValid=function(e){return e&&e.bit&&e.ccBits};function r(t){if(typeof t!=`string`)throw Error(`Param is not a string`);switch(t.toLowerCase()){case`numeric`:return e.NUMERIC;case`alphanumeric`:return e.ALPHANUMERIC;case`kanji`:return e.KANJI;case`byte`:return e.BYTE;default:throw Error(`Unknown mode: `+t)}}e.from=function(t,n){if(e.isValid(t))return t;try{return r(t)}catch{return n}}})),rp=e((e=>{var t=Uf(),n=Xf(),r=Wf(),i=np(),a=ep(),o=7973,s=t.getBCHDigit(o);function c(t,n,r){for(let i=1;i<=40;i++)if(n<=e.getCapacity(i,r,t))return i}function l(e,t){return i.getCharCountIndicator(e,t)+4}function u(e,t){let n=0;return e.forEach(function(e){let r=l(e.mode,t);n+=r+e.getBitsLength()}),n}function d(t,n){for(let r=1;r<=40;r++)if(u(t,r)<=e.getCapacity(r,n,i.MIXED))return r}e.from=function(e,t){return a.isValid(e)?parseInt(e,10):t},e.getCapacity=function(e,r,o){if(!a.isValid(e))throw Error(`Invalid QR Code version`);o===void 0&&(o=i.BYTE);let s=(t.getSymbolTotalCodewords(e)-n.getTotalCodewordsCount(e,r))*8;if(o===i.MIXED)return s;let c=s-l(o,e);switch(o){case i.NUMERIC:return Math.floor(c/10*3);case i.ALPHANUMERIC:return Math.floor(c/11*2);case i.KANJI:return Math.floor(c/13);case i.BYTE:default:return Math.floor(c/8)}},e.getBestVersionForData=function(e,t){let n,i=r.from(t,r.M);if(Array.isArray(e)){if(e.length>1)return d(e,i);if(e.length===0)return 1;n=e[0]}else n=e;return c(n.mode,n.getLength(),i)},e.getEncodedBits=function(e){if(!a.isValid(e)||e<7)throw Error(`Invalid QR Code version`);let n=e<<12;for(;t.getBCHDigit(n)-s>=0;)n^=o<<t.getBCHDigit(n)-s;return e<<12|n}})),ip=e((e=>{var t=Uf(),n=1335,r=21522,i=t.getBCHDigit(n);e.getEncodedBits=function(e,a){let o=e.bit<<3|a,s=o<<10;for(;t.getBCHDigit(s)-i>=0;)s^=n<<t.getBCHDigit(s)-i;return(o<<10|s)^r}})),ap=e(((e,t)=>{var n=np();function r(e){this.mode=n.NUMERIC,this.data=e.toString()}r.getBitsLength=function(e){return 10*Math.floor(e/3)+(e%3?e%3*3+1:0)},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){let t,n,r;for(t=0;t+3<=this.data.length;t+=3)n=this.data.substr(t,3),r=parseInt(n,10),e.put(r,10);let i=this.data.length-t;i>0&&(n=this.data.substr(t),r=parseInt(n,10),e.put(r,i*3+1))},t.exports=r})),op=e(((e,t)=>{var n=np(),r=`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`.split(``);function i(e){this.mode=n.ALPHANUMERIC,this.data=e}i.getBitsLength=function(e){return 11*Math.floor(e/2)+e%2*6},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(e){let t=0;for(;t+2<=this.data.length;t+=2){let n=r.indexOf(this.data[t])*45;n+=r.indexOf(this.data[t+1]),e.put(n,11)}this.data.length%2&&e.put(r.indexOf(this.data[t]),6)},t.exports=i})),sp=e(((e,t)=>{var n=np();function r(e){this.mode=n.BYTE,this.data=typeof e==`string`?new TextEncoder().encode(e):new Uint8Array(e)}r.getBitsLength=function(e){return e*8},r.prototype.getLength=function(){return this.data.length},r.prototype.getBitsLength=function(){return r.getBitsLength(this.data.length)},r.prototype.write=function(e){for(let t=0,n=this.data.length;t<n;t++)e.put(this.data[t],8)},t.exports=r})),cp=e(((e,t)=>{var n=np(),r=Uf();function i(e){this.mode=n.KANJI,this.data=e}i.getBitsLength=function(e){return e*13},i.prototype.getLength=function(){return this.data.length},i.prototype.getBitsLength=function(){return i.getBitsLength(this.data.length)},i.prototype.write=function(e){let t=0;for(;t<this.data.length;t++){let n=r.toSJIS(this.data[t]);if(n>=33088&&n<=40956)n-=33088;else if(n>=57408&&n<=60351)n-=49472;else throw Error(`Invalid SJIS character: `+this.data[t]+`
Make sure your charset is UTF-8`);n=(n>>>8&255)*192+(n&255),e.put(n,13)}},t.exports=i})),lp=e(((e,t)=>{var n={single_source_shortest_paths:function(e,t,r){var i={},a={};a[t]=0;var o=n.PriorityQueue.make();o.push(t,0);for(var s,c,l,u,d,f,p,m,h;!o.empty();)for(l in s=o.pop(),c=s.value,u=s.cost,d=e[c]||{},d)d.hasOwnProperty(l)&&(f=d[l],p=u+f,m=a[l],h=a[l]===void 0,(h||m>p)&&(a[l]=p,o.push(l,p),i[l]=c));if(r!==void 0&&a[r]===void 0){var g=[`Could not find a path from `,t,` to `,r,`.`].join(``);throw Error(g)}return i},extract_shortest_path_from_predecessor_list:function(e,t){for(var n=[],r=t;r;)n.push(r),e[r],r=e[r];return n.reverse(),n},find_path:function(e,t,r){var i=n.single_source_shortest_paths(e,t,r);return n.extract_shortest_path_from_predecessor_list(i,r)},PriorityQueue:{make:function(e){var t=n.PriorityQueue,r={},i;for(i in e||={},t)t.hasOwnProperty(i)&&(r[i]=t[i]);return r.queue=[],r.sorter=e.sorter||t.default_sorter,r},default_sorter:function(e,t){return e.cost-t.cost},push:function(e,t){var n={value:e,cost:t};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t!==void 0&&(t.exports=n)})),up=e((e=>{var t=np(),n=ap(),r=op(),i=sp(),a=cp(),o=tp(),s=Uf(),c=lp();function l(e){return unescape(encodeURIComponent(e)).length}function u(e,t,n){let r=[],i;for(;(i=e.exec(n))!==null;)r.push({data:i[0],index:i.index,mode:t,length:i[0].length});return r}function d(e){let n=u(o.NUMERIC,t.NUMERIC,e),r=u(o.ALPHANUMERIC,t.ALPHANUMERIC,e),i,a;return s.isKanjiModeEnabled()?(i=u(o.BYTE,t.BYTE,e),a=u(o.KANJI,t.KANJI,e)):(i=u(o.BYTE_KANJI,t.BYTE,e),a=[]),n.concat(r,i,a).sort(function(e,t){return e.index-t.index}).map(function(e){return{data:e.data,mode:e.mode,length:e.length}})}function f(e,o){switch(o){case t.NUMERIC:return n.getBitsLength(e);case t.ALPHANUMERIC:return r.getBitsLength(e);case t.KANJI:return a.getBitsLength(e);case t.BYTE:return i.getBitsLength(e)}}function p(e){return e.reduce(function(e,t){let n=e.length-1>=0?e[e.length-1]:null;return n&&n.mode===t.mode?(e[e.length-1].data+=t.data,e):(e.push(t),e)},[])}function m(e){let n=[];for(let r=0;r<e.length;r++){let i=e[r];switch(i.mode){case t.NUMERIC:n.push([i,{data:i.data,mode:t.ALPHANUMERIC,length:i.length},{data:i.data,mode:t.BYTE,length:i.length}]);break;case t.ALPHANUMERIC:n.push([i,{data:i.data,mode:t.BYTE,length:i.length}]);break;case t.KANJI:n.push([i,{data:i.data,mode:t.BYTE,length:l(i.data)}]);break;case t.BYTE:n.push([{data:i.data,mode:t.BYTE,length:l(i.data)}])}}return n}function h(e,n){let r={},i={start:{}},a=[`start`];for(let o=0;o<e.length;o++){let s=e[o],c=[];for(let e=0;e<s.length;e++){let l=s[e],u=``+o+e;c.push(u),r[u]={node:l,lastCount:0},i[u]={};for(let e=0;e<a.length;e++){let o=a[e];r[o]&&r[o].node.mode===l.mode?(i[o][u]=f(r[o].lastCount+l.length,l.mode)-f(r[o].lastCount,l.mode),r[o].lastCount+=l.length):(r[o]&&(r[o].lastCount=l.length),i[o][u]=f(l.length,l.mode)+4+t.getCharCountIndicator(l.mode,n))}}a=c}for(let e=0;e<a.length;e++)i[a[e]].end=0;return{map:i,table:r}}function g(e,o){let c,l=t.getBestModeForData(e);if(c=t.from(o,l),c!==t.BYTE&&c.bit<l.bit)throw Error(`"`+e+`" cannot be encoded with mode `+t.toString(c)+`.
 Suggested mode is: `+t.toString(l));switch(c===t.KANJI&&!s.isKanjiModeEnabled()&&(c=t.BYTE),c){case t.NUMERIC:return new n(e);case t.ALPHANUMERIC:return new r(e);case t.KANJI:return new a(e);case t.BYTE:return new i(e)}}e.fromArray=function(e){return e.reduce(function(e,t){return typeof t==`string`?e.push(g(t,null)):t.data&&e.push(g(t.data,t.mode)),e},[])},e.fromString=function(t,n){let r=h(m(d(t,s.isKanjiModeEnabled())),n),i=c.find_path(r.map,`start`,`end`),a=[];for(let e=1;e<i.length-1;e++)a.push(r.table[i[e]].node);return e.fromArray(p(a))},e.rawSplit=function(t){return e.fromArray(d(t,s.isKanjiModeEnabled()))}})),dp=e((e=>{var t=Uf(),n=Wf(),r=Gf(),i=Kf(),a=qf(),o=Jf(),s=Yf(),c=Xf(),l=$f(),u=rp(),d=ip(),f=np(),p=up();function m(e,t){let n=e.size,r=o.getPositions(t);for(let t=0;t<r.length;t++){let i=r[t][0],a=r[t][1];for(let t=-1;t<=7;t++)if(!(i+t<=-1||n<=i+t))for(let r=-1;r<=7;r++)a+r<=-1||n<=a+r||(t>=0&&t<=6&&(r===0||r===6)||r>=0&&r<=6&&(t===0||t===6)||t>=2&&t<=4&&r>=2&&r<=4?e.set(i+t,a+r,!0,!0):e.set(i+t,a+r,!1,!0))}}function h(e){let t=e.size;for(let n=8;n<t-8;n++){let t=n%2==0;e.set(n,6,t,!0),e.set(6,n,t,!0)}}function g(e,t){let n=a.getPositions(t);for(let t=0;t<n.length;t++){let r=n[t][0],i=n[t][1];for(let t=-2;t<=2;t++)for(let n=-2;n<=2;n++)t===-2||t===2||n===-2||n===2||t===0&&n===0?e.set(r+t,i+n,!0,!0):e.set(r+t,i+n,!1,!0)}}function _(e,t){let n=e.size,r=u.getEncodedBits(t),i,a,o;for(let t=0;t<18;t++)i=Math.floor(t/3),a=t%3+n-8-3,o=(r>>t&1)==1,e.set(i,a,o,!0),e.set(a,i,o,!0)}function v(e,t,n){let r=e.size,i=d.getEncodedBits(t,n),a,o;for(a=0;a<15;a++)o=(i>>a&1)==1,a<6?e.set(a,8,o,!0):a<8?e.set(a+1,8,o,!0):e.set(r-15+a,8,o,!0),a<8?e.set(8,r-a-1,o,!0):a<9?e.set(8,15-a-1+1,o,!0):e.set(8,15-a-1,o,!0);e.set(r-8,8,1,!0)}function y(e,t){let n=e.size,r=-1,i=n-1,a=7,o=0;for(let s=n-1;s>0;s-=2)for(s===6&&s--;;){for(let n=0;n<2;n++)if(!e.isReserved(i,s-n)){let r=!1;o<t.length&&(r=(t[o]>>>a&1)==1),e.set(i,s-n,r),a--,a===-1&&(o++,a=7)}if(i+=r,i<0||n<=i){i-=r,r=-r;break}}}function b(e,n,i){let a=new r;i.forEach(function(t){a.put(t.mode.bit,4),a.put(t.getLength(),f.getCharCountIndicator(t.mode,e)),t.write(a)});let o=(t.getSymbolTotalCodewords(e)-c.getTotalCodewordsCount(e,n))*8;for(a.getLengthInBits()+4<=o&&a.put(0,4);a.getLengthInBits()%8!=0;)a.putBit(0);let s=(o-a.getLengthInBits())/8;for(let e=0;e<s;e++)a.put(e%2?17:236,8);return x(a,e,n)}function x(e,n,r){let i=t.getSymbolTotalCodewords(n),a=i-c.getTotalCodewordsCount(n,r),o=c.getBlocksCount(n,r),s=o-i%o,u=Math.floor(i/o),d=Math.floor(a/o),f=d+1,p=u-d,m=new l(p),h=0,g=Array(o),_=Array(o),v=0,y=new Uint8Array(e.buffer);for(let e=0;e<o;e++){let t=e<s?d:f;g[e]=y.slice(h,h+t),_[e]=m.encode(g[e]),h+=t,v=Math.max(v,t)}let b=new Uint8Array(i),x=0,S,C;for(S=0;S<v;S++)for(C=0;C<o;C++)S<g[C].length&&(b[x++]=g[C][S]);for(S=0;S<p;S++)for(C=0;C<o;C++)b[x++]=_[C][S];return b}function S(e,n,r,a){let o;if(Array.isArray(e))o=p.fromArray(e);else if(typeof e==`string`){let t=n;if(!t){let n=p.rawSplit(e);t=u.getBestVersionForData(n,r)}o=p.fromString(e,t||40)}else throw Error(`Invalid data`);let c=u.getBestVersionForData(o,r);if(!c)throw Error(`The amount of data is too big to be stored in a QR Code`);if(!n)n=c;else if(n<c)throw Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+c+`.
`);let l=b(n,r,o),d=new i(t.getSymbolSize(n));return m(d,n),h(d),g(d,n),v(d,r,0),n>=7&&_(d,n),y(d,l),isNaN(a)&&(a=s.getBestMask(d,v.bind(null,d,r))),s.applyMask(a,d),v(d,r,a),{modules:d,version:n,errorCorrectionLevel:r,maskPattern:a,segments:o}}e.create=function(e,r){if(e===void 0||e===``)throw Error(`No input text`);let i=n.M,a,o;return r!==void 0&&(i=n.from(r.errorCorrectionLevel,n.M),a=u.from(r.version),o=s.from(r.maskPattern),r.toSJISFunc&&t.setToSJISFunction(r.toSJISFunc)),S(e,a,i,o)}})),fp=e((e=>{function t(e){if(typeof e==`number`&&(e=e.toString()),typeof e!=`string`)throw Error(`Color should be defined as hex string`);let t=e.slice().replace(`#`,``).split(``);if(t.length<3||t.length===5||t.length>8)throw Error(`Invalid hex color: `+e);(t.length===3||t.length===4)&&(t=Array.prototype.concat.apply([],t.map(function(e){return[e,e]}))),t.length===6&&t.push(`F`,`F`);let n=parseInt(t.join(``),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:`#`+t.slice(0,6).join(``)}}e.getOptions=function(e){e||={},e.color||(e.color={});let n=e.margin===void 0||e.margin===null||e.margin<0?4:e.margin,r=e.width&&e.width>=21?e.width:void 0,i=e.scale||4;return{width:r,scale:r?4:i,margin:n,color:{dark:t(e.color.dark||`#000000ff`),light:t(e.color.light||`#ffffffff`)},type:e.type,rendererOpts:e.rendererOpts||{}}},e.getScale=function(e,t){return t.width&&t.width>=e+t.margin*2?t.width/(e+t.margin*2):t.scale},e.getImageWidth=function(t,n){let r=e.getScale(t,n);return Math.floor((t+n.margin*2)*r)},e.qrToImageData=function(t,n,r){let i=n.modules.size,a=n.modules.data,o=e.getScale(i,r),s=Math.floor((i+r.margin*2)*o),c=r.margin*o,l=[r.color.light,r.color.dark];for(let e=0;e<s;e++)for(let n=0;n<s;n++){let u=(e*s+n)*4,d=r.color.light;if(e>=c&&n>=c&&e<s-c&&n<s-c){let t=Math.floor((e-c)/o),r=Math.floor((n-c)/o);d=l[+!!a[t*i+r]]}t[u++]=d.r,t[u++]=d.g,t[u++]=d.b,t[u]=d.a}}})),pp=e((e=>{var t=fp();function n(e,t,n){e.clearRect(0,0,t.width,t.height),t.style||={},t.height=n,t.width=n,t.style.height=n+`px`,t.style.width=n+`px`}function r(){try{return document.createElement(`canvas`)}catch{throw Error(`You need to specify a canvas element`)}}e.render=function(e,i,a){let o=a,s=i;o!==void 0||i&&i.getContext||(o=i,i=void 0),i||(s=r()),o=t.getOptions(o);let c=t.getImageWidth(e.modules.size,o),l=s.getContext(`2d`),u=l.createImageData(c,c);return t.qrToImageData(u.data,e,o),n(l,s,c),l.putImageData(u,0,0),s},e.renderToDataURL=function(t,n,r){let i=r;i!==void 0||n&&n.getContext||(i=n,n=void 0),i||={};let a=e.render(t,n,i),o=i.type||`image/png`,s=i.rendererOpts||{};return a.toDataURL(o,s.quality)}})),mp=e((e=>{var t=fp();function n(e,t){let n=e.a/255,r=t+`="`+e.hex+`"`;return n<1?r+` `+t+`-opacity="`+n.toFixed(2).slice(1)+`"`:r}function r(e,t,n){let r=e+t;return n!==void 0&&(r+=` `+n),r}function i(e,t,n){let i=``,a=0,o=!1,s=0;for(let c=0;c<e.length;c++){let l=Math.floor(c%t),u=Math.floor(c/t);!l&&!o&&(o=!0),e[c]?(s++,c>0&&l>0&&e[c-1]||(i+=o?r(`M`,l+n,.5+u+n):r(`m`,a,0),a=0,o=!1),l+1<t&&e[c+1]||(i+=r(`h`,s),s=0)):a++}return i}e.render=function(e,r,a){let o=t.getOptions(r),s=e.modules.size,c=e.modules.data,l=s+o.margin*2,u=o.color.light.a?`<path `+n(o.color.light,`fill`)+` d="M0 0h`+l+`v`+l+`H0z"/>`:``,d=`<path `+n(o.color.dark,`stroke`)+` d="`+i(c,s,o.margin)+`"/>`,f=`viewBox="0 0 `+l+` `+l+`"`,p=`<svg xmlns="http://www.w3.org/2000/svg" `+(o.width?`width="`+o.width+`" height="`+o.width+`" `:``)+f+` shape-rendering="crispEdges">`+u+d+`</svg>
`;return typeof a==`function`&&a(null,p),p}})),hp=e((e=>{var t=Hf(),n=dp(),r=pp(),i=mp();function a(e,r,i,a,o){let s=[].slice.call(arguments,1),c=s.length,l=typeof s[c-1]==`function`;if(!l&&!t())throw Error(`Callback required as last argument`);if(l){if(c<2)throw Error(`Too few arguments provided`);c===2?(o=i,i=r,r=a=void 0):c===3&&(r.getContext&&o===void 0?(o=a,a=void 0):(o=a,a=i,i=r,r=void 0))}else{if(c<1)throw Error(`Too few arguments provided`);return c===1?(i=r,r=a=void 0):c===2&&!r.getContext&&(a=i,i=r,r=void 0),new Promise(function(t,o){try{t(e(n.create(i,a),r,a))}catch(e){o(e)}})}try{let t=n.create(i,a);o(null,e(t,r,a))}catch(e){o(e)}}e.create=n.create,e.toCanvas=a.bind(null,r.render),e.toDataURL=a.bind(null,r.renderToDataURL),e.toString=a.bind(null,function(e,t,n){return i.render(e,n)})}))(),gp=`#f3c6a5`,_p=`#dea07c`,vp=Y.accent2;function yp(e=Y.accent){return`
  <rect x="-15" y="-52" width="30" height="58" rx="7" fill="${Y.ink}"/>
  <rect x="-12" y="-48" width="24" height="49" rx="4.5" fill="${e}"/>
  <circle cx="0" cy="-30" r="7" fill="#fff" fill-opacity=".35"/>
  <rect x="-21" y="-6" width="42" height="34" rx="14" fill="${gp}"/>
  <path d="M-19 4h22M-19 12h22M-18 20h20" stroke="${_p}" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="10" y="-22" width="11" height="28" rx="5.5" fill="${gp}" transform="rotate(16 15 -8)"/>
  <rect x="-15" y="24" width="30" height="26" rx="6" fill="${vp}"/>`}function bp(e,t=160){return`<rect x="8" y="${e}" width="${t-16}" height="12" rx="4" fill="${Y.table}"/>
  <rect x="8" y="${e+12}" width="${t-16}" height="5" rx="2" fill="${Y.tableDark}"/>
  <path d="M${t/2} ${e}v12" stroke="#fff" stroke-width="2"/>`}var xp=(e,t=``)=>`<svg class="art ${t}" viewBox="0 0 160 110" aria-hidden="true" focusable="false">${e}</svg>`,Sp={hold:xp(`
    <circle cx="80" cy="56" r="44" fill="${Y.accent}" fill-opacity=".1"/>
    <g transform="translate(80 66) rotate(-12)">${yp()}</g>
    <path d="M118 30l10-8M122 44h12M42 30l-10-8" stroke="${Y.gold}" stroke-width="3.5" stroke-linecap="round"/>`),swing:xp(`
    <path d="M28 88 C 48 30, 98 18, 132 34" fill="none" stroke="${Y.accent2}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 10"/>
    <path d="M124 24l10 10-13 4" fill="none" stroke="${Y.accent2}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(54 70) rotate(-30)">
      <rect x="-4" y="6" width="8" height="22" rx="4" fill="#d99a5b"/>
      <circle cx="0" cy="-8" r="17" fill="${Y.accent}"/>
      <path d="M-11 -12a12 12 0 0 1 8 -9" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/>
    </g>
    <circle cx="104" cy="44" r="8" fill="${Y.ball}" stroke="${Y.ink}" stroke-width="2.5"/>
    <path d="M86 40h-12M88 50h-9" stroke="${Y.ink}" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>`),timing:xp(`
    ${bp(78)}
    <path d="M14 22 Q 50 10, 74 78 Q 96 20, 140 46" fill="none" stroke="${Y.ink}" stroke-opacity=".25" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>
    <circle cx="74" cy="72" r="5" fill="${Y.ball}" stroke="${Y.ink}" stroke-width="2" opacity=".55"/>
    <circle cx="122" cy="38" r="17" fill="${Y.gold}" fill-opacity=".3"/>
    <circle cx="122" cy="38" r="17" fill="none" stroke="${Y.gold}" stroke-width="3"/>
    <circle cx="122" cy="38" r="7" fill="${Y.ball}" stroke="${Y.ink}" stroke-width="2.5"/>
    <path d="M60 78l14 -6" stroke="none"/>`),spin:xp(`
    <g transform="translate(46 54)">
      <g transform="rotate(30)"><rect x="-3.5" y="10" width="7" height="20" rx="3.5" fill="#d99a5b"/><ellipse cx="0" cy="-6" rx="9" ry="18" fill="${Y.accent}"/></g>
      <circle cx="0" cy="-36" r="9" fill="${Y.ball}" stroke="${Y.ink}" stroke-width="2.5"/>
      <path d="M-15 -44 a 16 16 0 0 1 26 -6" fill="none" stroke="${Y.good}" stroke-width="4" stroke-linecap="round"/>
      <path d="M8 -56l4 6-7 2" fill="none" stroke="${Y.good}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <g transform="translate(116 54)">
      <g transform="rotate(-30)"><rect x="-3.5" y="10" width="7" height="20" rx="3.5" fill="#d99a5b"/><ellipse cx="0" cy="-6" rx="9" ry="18" fill="${Y.accent}"/></g>
      <circle cx="0" cy="-36" r="9" fill="${Y.ball}" stroke="${Y.ink}" stroke-width="2.5"/>
      <path d="M15 -44 a 16 16 0 0 0 -26 -6" fill="none" stroke="${Y.accent2}" stroke-width="4" stroke-linecap="round"/>
      <path d="M-8 -56l-4 6 7 2" fill="none" stroke="${Y.accent2}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <text x="46" y="104" text-anchor="middle" class="art-lbl" fill="${Y.ink}">TOP</text>
    <text x="116" y="104" text-anchor="middle" class="art-lbl" fill="${Y.ink}">BACK</text>`),aim:xp(`
    <path d="M22 96 L44 40 H116 L138 96 Z" fill="${Y.table}"/>
    <path d="M80 40v56M33 68h94" stroke="#fff" stroke-width="2" stroke-opacity=".7"/>
    <path d="M44 40h72" stroke="${Y.tableDark}" stroke-width="3"/>
    <ellipse cx="112" cy="54" rx="12" ry="6" fill="none" stroke="${Y.gold}" stroke-width="3.5"/>
    <ellipse cx="112" cy="54" rx="4" ry="2" fill="${Y.gold}"/>
    <path d="M46 92 Q 74 20, 110 52" fill="none" stroke="${Y.gold}" stroke-width="3" stroke-dasharray="3 6" stroke-linecap="round"/>
    <g transform="translate(36 90) scale(.42) rotate(24)">${yp()}</g>`),serve:xp(`
    ${bp(84)}
    <path d="M52 70 V 22" stroke="${Y.accent2}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 8"/>
    <path d="M45 30l7 -9 7 9" fill="none" stroke="${Y.accent2}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="art-toss" cx="52" cy="16" r="7" fill="${Y.ball}" stroke="${Y.ink}" stroke-width="2.5"/>
    <ellipse cx="52" cy="76" rx="13" ry="7" fill="${gp}"/>
    <path d="M70 16 Q 110 10, 118 84" fill="none" stroke="${Y.ink}" stroke-opacity=".22" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>
    <g transform="translate(112 50) rotate(20)"><rect x="-3.5" y="10" width="7" height="18" rx="3.5" fill="#d99a5b"/><circle cx="0" cy="-4" r="14" fill="${Y.accent}"/></g>`)},Cp=`<svg class="art art-cal" viewBox="0 0 220 150" aria-hidden="true" focusable="false">
  <rect x="128" y="18" width="80" height="54" rx="8" fill="${Y.ink}"/>
  <rect x="133" y="23" width="70" height="44" rx="5" fill="${Y.table}"/>
  <path d="M168 23v44" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>
  <path d="M158 80h20M168 72v8" stroke="${Y.ink}" stroke-width="4" stroke-linecap="round"/>
  <circle class="cal-dot" cx="168" cy="45" r="5" fill="${Y.gold}"/>
  <path class="cal-beam" d="M70 74 L160 45" stroke="${Y.gold}" stroke-width="3" stroke-dasharray="4 7" stroke-linecap="round"/>
  <g class="cal-bob"><g transform="translate(58 100) rotate(62)">${yp()}</g></g>
</svg>`;function X(e,t,...n){let r=document.createElement(e);if(t){for(let[e,n]of Object.entries(t))if(n!=null&&n!==!1){if(e===`class`||e===`className`)r.className=String(n);else if(e===`style`){if(typeof n==`string`)r.style.cssText=n;else for(let[e,t]of Object.entries(n))e.startsWith(`--`)?r.style.setProperty(e,t):r.style[e]=t}else e===`html`?r.innerHTML=String(n):e.startsWith(`on`)&&typeof n==`function`?r.addEventListener(e.slice(2).toLowerCase(),n):n===!0?r.setAttribute(e,``):r.setAttribute(e,String(n))}}return wp(r,n),r}function wp(e,t){for(let n of t)n!=null&&n!==!1&&e.append(n instanceof Node?n:document.createTextNode(String(n)))}function Tp(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var Ep=(e,t,n)=>e<t?t:e>n?n:e,Dp=()=>typeof matchMedia==`function`&&matchMedia(`(prefers-reduced-motion: reduce)`).matches;function Op(e,t){e.classList.remove(t),e.offsetWidth,e.classList.add(t)}var Z=(e,t=``)=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${t}>${e}</svg>`,kp={play:Z(`<path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.3 0-1.7l-10-6.4C8.9 4.3 8 4.8 8 5.6z" fill="currentColor" stroke="none"/>`),target:Z(`<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>`),trophy:Z(`<path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4.5v1.5A3 3 0 0 0 7.5 10.5M17 6h2.5v1.5a3 3 0 0 1-3 3"/><path d="M12 14v3.5M8.5 20h7M9.5 17.5h5"/>`),phone:Z(`<rect x="6.5" y="2.8" width="11" height="18.4" rx="2.6"/><path d="M10.5 17.6h3"/>`),sliders:Z(`<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>`),chart:Z(`<path d="M5 20V12M10 20V6M15 20v-9M20 20V4" />`),help:Z(`<circle cx="12" cy="12" r="9"/><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2 1c0 1.9-2.6 2.3-2.6 3.9"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>`),back:Z(`<path d="M15 5l-7 7 7 7"/>`),arrowRight:Z(`<path d="M5 12h14M13 6l6 6-6 6"/>`),pause:Z(`<rect x="6.5" y="5" width="3.8" height="14" rx="1.4" fill="currentColor" stroke="none"/><rect x="13.7" y="5" width="3.8" height="14" rx="1.4" fill="currentColor" stroke="none"/>`),recenter:Z(`<circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>`),home:Z(`<path d="M4 11l8-6.5 8 6.5"/><path d="M6.5 9.5V19a1 1 0 0 0 1 1h3v-5h3v5h3a1 1 0 0 0 1-1V9.5"/>`),mouse:Z(`<rect x="6.5" y="3" width="11" height="18" rx="5.5"/><path d="M12 6.5v3.2"/>`),check:Z(`<path d="M5 12.5l4.5 4.5L19 7.5"/>`),star:Z(`<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" fill="currentColor" stroke-width="1.4"/>`),starEmpty:Z(`<path d="M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" stroke-width="1.8"/>`),signal:Z(`<path d="M5 19v-2M9.5 19v-5M14 19v-8M18.5 19V6"/>`),refresh:Z(`<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>`),volume:Z(`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke-width="1.6"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>`),music:Z(`<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>`),monitor:Z(`<rect x="3" y="4.5" width="18" height="12" rx="2.2"/><path d="M9 20h6M12 16.5V20"/>`),gamepad:Z(`<path d="M7 8h10a4 4 0 0 1 3.9 4.9l-.9 4a2.4 2.4 0 0 1-4.2.9L14 16h-4l-1.8 1.8a2.4 2.4 0 0 1-4.2-.9l-.9-4A4 4 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="16" cy="12" r=".7" fill="currentColor"/>`),ball:Z(`<circle cx="12" cy="12" r="7.5" fill="currentColor" stroke="none"/>`),paddle:Z(`<circle cx="10" cy="9.5" r="6.5" fill="currentColor" stroke="none"/><path d="M14 14.5l5 5" stroke-width="3.2"/>`),flame:Z(`<path d="M12 21c-3.8 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.2 3.6-8.8 1.9 1.4 2.7 3.2 2.7 4.8 1-.6 1.6-1.6 1.8-2.9 2.2 1.8 2.9 4.4 2.9 6.9 0 3.6-2.7 6.2-4.5 6.2z"/>`),bolt:Z(`<path d="M13 2.8L5.5 13.2h5.6L10 21.2l8.5-11h-5.8z" fill="currentColor" stroke-width="1.4"/>`),close:Z(`<path d="M6 6l12 12M18 6L6 18"/>`),user:Z(`<circle cx="12" cy="8.5" r="3.8"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/>`),hand:Z(`<path d="M8 12V6.2a1.6 1.6 0 0 1 3.2 0V11M11.2 10.5V4.8a1.6 1.6 0 0 1 3.2 0v5.7M14.4 10.5V6.2a1.6 1.6 0 0 1 3.2 0v7.3a7 7 0 0 1-7 7h-.4a6 6 0 0 1-4.6-2.2l-3-3.7a1.6 1.6 0 0 1 2.4-2.1L8 14"/>`),trash:Z(`<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2a1 1 0 0 0 1 .8h7.2a1 1 0 0 0 1-.8L17.5 7"/>`),clock:Z(`<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`),percent:Z(`<path d="M18.5 5.5l-13 13"/><circle cx="7" cy="7" r="2.3"/><circle cx="17" cy="17" r="2.3"/>`),rally:Z(`<path d="M4 16c2.5-6 5-6 8 0s5.5 6 8 0"/><circle cx="4" cy="16" r="1.4" fill="currentColor"/><circle cx="20" cy="16" r="1.4" fill="currentColor"/>`),ace:Z(`<path d="M12 3l2.2 5.8L20 9.5l-4.5 3.8L17 19.5 12 16l-5 3.5 1.5-6.2L4 9.5l5.8-.7z"/>`),medal:Z(`<path d="M8 3h8l-2.5 6h-3z"/><circle cx="12" cy="15" r="5.5"/><path d="M12 12.5v5"/>`),wifi:Z(`<path d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.7a7.6 7.6 0 0 1 11 0M9.6 15.8a3.2 3.2 0 0 1 4.8 0"/><circle cx="12" cy="19" r=".9" fill="currentColor"/>`),qr:Z(`<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z" fill="currentColor"/>`),versus:Z(`<circle cx="7.5" cy="8.5" r="4" fill="currentColor" stroke="none"/><path d="M10.4 11.4L13 14" stroke-width="2.6"/><circle cx="16.5" cy="15.5" r="4" fill="currentColor" stroke="none" opacity=".55"/><path d="M13.6 12.6L11 10" stroke-width="2.6" opacity=".55"/>`),keyboard:Z(`<rect x="2.5" y="6" width="19" height="12" rx="2.4"/><path d="M6 10h.01M9.3 10h.01M12.6 10h.01M15.9 10h.01M18 10h.01M7.5 14h9"/>`)};function Ap(e,t=``){let n=document.createElement(`span`);return n.className=`ico ${t}`.trim(),n.innerHTML=kp[e],n}var jp={idle:`Offline`,connecting:`Connecting`,waiting:`Waiting`,pairing:`Pairing`,connected:`Phone`,disconnected:`Disconnected`,error:`Error`},Mp=class{gamesToWin;el;onPause=()=>{};board;nameEl;ptsEl;pipsEl;serveEl;tagEl;rallyEl;rallyNum;speedEl;speedNum;calloutEl;calloutText;calloutSub;promptEl;gradeEl;gradeTimer={main:0,player:0,opponent:0};connEl;connText;meters;splitEl;splitTag;splitPrompt;splitOn=!1;slow;chalEl;chal;lastPts={player:-1,opponent:-1};lastRally=0;lastChalScore=-1;speedTimer=0;calloutTimer=0;visible=!1;controllerKind=`none`;constructor(e){this.gamesToWin=e;let t=e=>{let t=X(`span`,{class:`sb-name`}),n=X(`span`,{class:`sb-serve`,title:`Serving`}),r=X(`span`,{class:`sb-pips`}),i=X(`span`,{class:`sb-pts`},`0`);return{wrap:X(`div`,{class:`sb-side sb-${e}`},e===`player`?X(`div`,{class:`sb-id`},X(`span`,{class:`sb-dot`}),t,n):X(`div`,{class:`sb-id`},n,t,X(`span`,{class:`sb-dot`})),r),name:t,serve:n,pips:r,pts:i}},n=t(`player`),r=t(`opponent`);this.nameEl={player:n.name,opponent:r.name},this.ptsEl={player:n.pts,opponent:r.pts},this.pipsEl={player:n.pips,opponent:r.pips},this.serveEl={player:n.serve,opponent:r.serve},this.tagEl=X(`div`,{class:`sb-tag`}),this.board=X(`div`,{class:`sb`},X(`div`,{class:`sb-pill`},n.wrap,X(`div`,{class:`sb-score`},n.pts,X(`span`,{class:`sb-colon`}),r.pts),r.wrap),this.tagEl),this.rallyNum=X(`span`,{class:`rally-num`},`0`),this.rallyEl=X(`div`,{class:`rally`},X(`span`,{class:`rally-lbl`},`Rally`),this.rallyNum),this.speedNum=X(`span`,{class:`speed-num`},`0`),this.speedEl=X(`div`,{class:`speed`},Ap(`bolt`),this.speedNum,X(`span`,{class:`speed-unit`},`km/h`)),this.calloutText=X(`div`,{class:`callout-text`}),this.calloutSub=X(`div`,{class:`callout-sub`}),this.calloutEl=X(`div`,{class:`callout`,"aria-live":`polite`},this.calloutText,this.calloutSub),this.promptEl=X(`div`,{class:`prompt`}),this.gradeEl={main:X(`div`,{class:`grade`}),player:X(`div`,{class:`grade g-player`}),opponent:X(`div`,{class:`grade g-opponent`})},this.connText=X(`span`,{class:`conn-text`}),this.connEl=X(`div`,{class:`conn chip`},X(`span`,{class:`status-dot`}),this.connText);let i=Np(),a=Np(),o=Np();this.meters={main:i,player:a,opponent:o};let s=i.el,c=e=>X(`div`,{class:`hs-tag ${e}`});this.splitTag={player:c(`p1`),opponent:c(`p2`)},this.splitPrompt={player:X(`div`,{class:`prompt`}),opponent:X(`div`,{class:`prompt`})},this.splitEl=X(`div`,{class:`hud-split`},X(`div`,{class:`hs-divider`}),X(`div`,{class:`hs-half hs-left`},this.splitTag.player,X(`div`,{class:`hs-bl`},a.el),X(`div`,{class:`hs-bc`},this.splitPrompt.player)),X(`div`,{class:`hs-half hs-right`},this.splitTag.opponent,X(`div`,{class:`hs-bl`},o.el),X(`div`,{class:`hs-bc`},this.splitPrompt.opponent))),this.splitEl.hidden=!0;let l=X(`span`,{class:`sm-pips`}),u=X(`span`,{class:`sm-hint`},`E / SLOW-MO`),d=X(`div`,{class:`slowmo`},Ap(`clock`),l,u);d.hidden=!0;let f=X(`div`,{class:`sm-bar-fill`}),p=X(`div`,{class:`slowmo-label`},X(`span`,null,`SLOW-MO`),X(`div`,{class:`sm-bar`},f)),m=X(`div`,{class:`slowmo-vig`});this.slow={vig:m,label:p,bar:f,pips:l,box:d,pipEls:[]},this.chal={name:X(`div`,{class:`chal-name`}),score:X(`span`,{class:`chal-score`},`0`),best:X(`span`,{class:`chal-best`}),detail:X(`div`,{class:`chal-detail`})},this.chalEl=X(`div`,{class:`chal card-glass`},this.chal.name,X(`div`,{class:`chal-row`},this.chal.score,this.chal.best),this.chal.detail);let h=X(`button`,{class:`hud-pause`,"aria-label":`Pause`,title:`Pause`,onclick:()=>this.onPause()},Ap(`pause`));this.el=X(`div`,{class:`hud`,"aria-hidden":`true`},m,this.splitEl,X(`div`,{class:`hud-tl`},h,this.chalEl),X(`div`,{class:`hud-tc`},this.board,this.rallyEl,p),X(`div`,{class:`hud-tr`},this.connEl),this.calloutEl,this.gradeEl.main,this.gradeEl.player,this.gradeEl.opponent,X(`div`,{class:`hud-bl`},s),X(`div`,{class:`hud-bc`},this.promptEl),X(`div`,{class:`hud-br`},d,this.speedEl)),this.setChallenge(null),this.setPrompt(null),this.setSlowMo(null),this.setScore({points:{player:0,opponent:0},games:{player:0,opponent:0},server:`player`,names:[`You`,`CPU`],gamePoint:null,matchPoint:null}),this.connEl.hidden=!0}show(e){this.visible=e,this.el.classList.toggle(`on`,e),this.el.setAttribute(`aria-hidden`,e?`false`:`true`)}get shown(){return this.visible}setScore(e){let t=[`player`,`opponent`],n=Math.max(1,e.gamesToWin??this.gamesToWin(),e.games.player,e.games.opponent);this.nameEl.player.textContent=e.names[0],this.nameEl.opponent.textContent=e.names[1];for(let r of t){let t=e.points[r];this.ptsEl[r].textContent!==String(t)&&(this.ptsEl[r].textContent=String(t),this.lastPts[r]>=0&&t>this.lastPts[r]&&Op(this.ptsEl[r],`pop`)),this.lastPts[r]=t,this.serveEl[r].classList.toggle(`on`,e.server===r);let i=this.pipsEl[r];if(i.childElementCount!==n||i.dataset.won!==String(e.games[r])){i.textContent=``;for(let t=0;t<n;t++)i.append(X(`i`,{class:t<e.games[r]?`won`:``}));i.dataset.won=String(e.games[r])}}let r=e.points.player>=10&&e.points.player===e.points.opponent,i=``,a=``;e.matchPoint?(i=`Match point`,a=`gold ${e.matchPoint}`):e.gamePoint?(i=`Game point`,a=e.gamePoint):r&&(i=`Deuce`,a=`neutral`),this.tagEl.textContent!==i&&(this.tagEl.textContent=i,this.tagEl.className=`sb-tag ${a}`,i&&Op(this.tagEl,`show`))}setRally(e){this.rallyNum.textContent=String(e),this.rallyEl.classList.toggle(`on`,e>=2),e>this.lastRally&&e>=2&&(Op(this.rallyNum,`pop`),this.rallyEl.classList.toggle(`hot`,e>=10)),e<2&&this.rallyEl.classList.remove(`hot`),this.lastRally=e}setShotSpeed(e){this.speedNum.textContent=String(Math.round(e)),this.speedEl.classList.toggle(`fast`,e>=80),this.speedEl.classList.add(`on`),Op(this.speedEl,`pop`),clearTimeout(this.speedTimer),this.speedTimer=window.setTimeout(()=>this.speedEl.classList.remove(`on`),1800)}callout(e,t,n){this.calloutText.textContent=e,this.calloutSub.textContent=n??``,this.calloutSub.hidden=!n,this.calloutEl.className=`callout tone-${t}`,this.calloutEl.dataset.len=e.length>9?`long`:`short`,Op(this.calloutEl,`play`),clearTimeout(this.calloutTimer),this.calloutTimer=window.setTimeout(()=>this.calloutEl.classList.remove(`play`),1700)}hitGrade(e,t,n,r){let i=this.splitOn&&r?r:`main`,a=this.gradeEl[i];a.className=`grade${i===`main`?``:` g-${i}`} tone-${t}`,a.replaceChildren(X(`b`,null,e),...n?[X(`small`,null,n)]:[]),Op(a,`play`),clearTimeout(this.gradeTimer[i]),this.gradeTimer[i]=window.setTimeout(()=>a.classList.remove(`play`),1100)}setPrompt(e,t){let n=this.splitOn&&t?this.splitPrompt[t]:this.promptEl;if(e&&(n.textContent=e),n.classList.toggle(`on`,!!e),!e&&!t)for(let e of Object.values(this.splitPrompt))e.classList.remove(`on`)}setSplit(e,t){if(this.splitOn=e,this.splitEl.hidden=!e,this.el.classList.toggle(`split`,e),t?(this.splitTag.player.textContent=t[0],this.splitTag.opponent.textContent=t[1]):e&&(this.splitTag.player.textContent||(this.splitTag.player.textContent=`P1`),this.splitTag.opponent.textContent||(this.splitTag.opponent.textContent=`P2`)),!e)for(let e of Object.values(this.splitPrompt))e.classList.remove(`on`);this.promptEl.classList.remove(`on`)}setSlowMo(e){let t=this.slow;e?(t.box.hidden=!1,t.pipEls.length!==e.max&&(t.pips.textContent=``,t.pipEls=Array.from({length:e.max},()=>X(`i`)),t.pips.append(...t.pipEls)),t.pipEls.forEach((t,n)=>t.classList.toggle(`full`,n<e.charges)),t.box.classList.toggle(`active`,e.active),t.box.classList.toggle(`empty`,e.charges<=0&&!e.active),t.vig.classList.toggle(`on`,e.active),t.label.classList.toggle(`on`,e.active),t.bar.style.transform=`scaleX(${Ep(e.remaining,0,1).toFixed(3)})`):(t.box.hidden=!0,t.vig.classList.remove(`on`),t.label.classList.remove(`on`))}setControllerKind(e){this.controllerKind=e,e===`mouse`&&(this.connEl.hidden=!1,this.connEl.className=`conn chip st-mouse`,this.connText.textContent=`Mouse`)}setConnection(e,t,n){if(this.controllerKind===`mouse`&&e!==`connected`){this.setControllerKind(`mouse`);return}if(e===`idle`&&t===`none`){this.connEl.hidden=!0;return}this.connEl.hidden=!1,this.connEl.className=`conn chip st-${e}`;let r=[jp[e]];e===`connected`&&(t!==`none`&&r.push(t===`webrtc`?`WebRTC`:`Relay`),n>0&&r.push(`${Math.round(n)} ms`),this.connEl.classList.toggle(`slow`,n>60)),this.connText.textContent=r.join(` · `)}setChallenge(e){this.chalEl.hidden=!e,e?(this.chal.name.textContent=e.name,this.chal.score.textContent=String(e.score),this.chal.best.textContent=`Best ${e.best}`,this.chal.detail.textContent=e.detail,this.lastChalScore>=0&&e.score>this.lastChalScore&&Op(this.chal.score,`pop`),this.chal.best.classList.toggle(`beaten`,e.score>e.best&&e.best>0),this.lastChalScore=e.score):this.lastChalScore=-1}setSwingMeter(e,t){let n=this.meters[this.splitOn&&t?t:`main`],r=Ep(e,0,1),i=performance.now();r>=n.peak?(n.peak=r,n.peakT=i):i-n.peakT>600&&(n.peak=Math.max(r,n.peak-.02)),n.fill.style.transform=`scaleY(${r.toFixed(3)})`,n.pk.style.bottom=`${(n.peak*100).toFixed(1)}%`,n.fill.classList.toggle(`hot`,r>.75)}};function Np(){let e=X(`div`,{class:`meter-fill`}),t=X(`div`,{class:`meter-peak`});return{el:X(`div`,{class:`meter`},X(`div`,{class:`meter-track`},e,t),X(`div`,{class:`meter-lbl`},`Swing`)),fill:e,pk:t,peak:0,peakT:0}}var Pp=`ui-rounded, 'SF Pro Rounded', 'Nunito', 'Varela Round', system-ui, -apple-system, 'Segoe UI', sans-serif`;function Fp(e=64,t=`lm`){let n=`${t}g`;return`<svg class="logo-mark" viewBox="0 0 64 64" width="${e}" height="${e}" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${n}" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="${Y.accent2}" stop-opacity="0"/>
      <stop offset=".55" stop-color="${Y.accent2}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${Y.gold}"/>
    </linearGradient>
  </defs>
  <path d="M10 36 C 14 18, 28 9, 44 12" fill="none" stroke="url(#${n})" stroke-width="5" stroke-linecap="round"/>
  <path d="M17 41 C 22 27, 31 21, 41 20" fill="none" stroke="url(#${n})" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>
  <g transform="rotate(-38 26 38)">
    <rect x="22" y="45" width="8.5" height="17" rx="4.2" fill="#d99a5b"/>
    <rect x="22" y="52" width="8.5" height="10" rx="4.2" fill="#b97a3e"/>
    <circle cx="26.2" cy="35" r="15.5" fill="${Y.accent}"/>
    <path d="M14.5 31 a 12 12 0 0 1 9 -9.5" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>
  </g>
  <circle cx="49" cy="13" r="7.2" fill="${Y.ball}" stroke="${Y.ink}" stroke-width="2.4"/>
  <path d="M45.8 10.6 a 4 4 0 0 1 3 -1.8" fill="none" stroke="${Y.ink}" stroke-opacity=".25" stroke-width="1.6" stroke-linecap="round"/>
</svg>`}function Ip(e={}){let t=(e,t,n,r)=>`<text x="${e}" y="${t}" text-anchor="${r}" font-family="${Pp}" font-weight="900" font-size="${n}" letter-spacing="-1" transform="skewX(-7)"><tspan fill="${Y.ink}">SPIN</tspan><tspan fill="${Y.accent}">SHOT</tspan></text>`;if(e.stacked){let n=e.tagline?`<text x="180" y="224" text-anchor="middle" font-family="${Pp}" font-weight="800" font-size="12.5" letter-spacing="3" fill="${Y.ink}" fill-opacity=".5">PHONE · PADDLE · TABLE TENNIS</text>`:``;return`<svg class="logo logo-stacked" viewBox="0 0 360 ${e.tagline?232:204}" role="img" aria-label="Spinshot">
  <g transform="translate(121 0) scale(1.85)">${Fp(64,`ls`).replace(/<svg[^>]*>/,`<g>`).replace(`</svg>`,`</g>`)}</g>
  ${t(203,190,72,`middle`)}
  ${n}
</svg>`}return`<svg class="logo logo-row" viewBox="0 0 300 64" role="img" aria-label="Spinshot">
  ${Fp(64,`lr`).replace(/<svg[^>]*>/,`<g>`).replace(`</svg>`,`</g>`)}
  ${t(84,47,42,`start`)}
</svg>`}var Lp=class{sound;scope=null;focused=null;hovered=null;memory=new WeakMap;constructor(e){this.sound=e}items(){if(!this.scope)return[];let e=[];return this.scope.querySelectorAll(`[data-nav]`).forEach(t=>{if(t.hasAttribute(`disabled`)||t.getAttribute(`aria-disabled`)===`true`)return;let n=t.getBoundingClientRect();n.width<1||n.height<1||t.closest(`[hidden]`)||e.push(t)}),e}setScope(e,t){this.scope&&this.focused&&this.memory.set(this.scope,this.focused),this.scope=e,this.setHover(null);let n=e?this.memory.get(e):void 0,r=t??(n&&n.isConnected&&e?.contains(n)?n:null)??e?.querySelector(`[data-autofocus]`)??null;this.focus(r??null,{scroll:!1})}refresh(){!this.focused||this.focused.isConnected&&this.scope?.contains(this.focused)||this.focus(null,{scroll:!1})}focus(e,t={}){this.focused!==e&&(this.focused?.classList.remove(`nav-focus`),this.focused=e,e&&(e.classList.add(`nav-focus`),t.scroll!==!1&&e.scrollIntoView({block:`nearest`,inline:`nearest`})))}setHover(e){this.hovered!==e&&(this.hovered?.classList.remove(`nav-hover`),this.hovered=e,e?.classList.add(`nav-hover`))}ensureFocus(){if(this.focused&&this.focused.isConnected&&this.items().includes(this.focused))return!0;let e=this.scope?.querySelector(`[data-autofocus]`)??this.items()[0]??null;return e&&this.items().includes(e)&&(this.focus(e),this.sound(`move`)),!1}move(e){if(!this.ensureFocus())return;let t=this.focused,n=t.dataset.nav??``;if((e===`left`||e===`right`)&&(n===`slider`||n===`seg`)){this.adjust(t,e===`right`?1:-1)&&this.sound(`move`);return}let r=this.findNeighbour(t,e);r&&(this.focus(r),this.sound(`move`))}findNeighbour(e,t){let n=e.getBoundingClientRect(),r=n.left+n.width/2,i=n.top+n.height/2,a=t===`left`||t===`right`,o=t===`right`||t===`down`?1:-1,s=[];for(let t of this.items()){if(t===e||e.contains(t)||t.contains(e))continue;let c=t.getBoundingClientRect(),l=c.left+c.width/2,u=c.top+c.height/2;if((a?l-r:u-i)*o<4)continue;let d=Math.max(0,a?o>0?c.left-n.right:n.left-c.right:o>0?c.top-n.bottom:n.top-c.bottom),f=a?Math.min(n.bottom,c.bottom)-Math.max(n.top,c.top):Math.min(n.right,c.right)-Math.max(n.left,c.left),p=a?Math.max(0,Math.max(n.top,c.top)-Math.min(n.bottom,c.bottom)):Math.max(0,Math.max(n.left,c.left)-Math.min(n.right,c.right)),m=f>0;if(!m&&p>d+(a?n.height:n.width)*1.2)continue;let h=Math.abs(a?u-i:l-r),g=d+(m?h*.15:p*2.5+h*.3);s.push({el:t,score:g,inLine:m})}let c=s.some(e=>e.inLine)?s.filter(e=>e.inLine):s,l=null;for(let e of c)(!l||e.score<l.score-.5)&&(l=e);return l?.el??null}adjust(e,t){let n=e.dataset.nav;if(n===`slider`){let n=e instanceof HTMLInputElement?e:e.querySelector(`input[type=range]`);if(!n)return!1;let r=parseFloat(n.min||`0`),i=parseFloat(n.max||`1`),a=parseFloat(n.step||`0`)||(i-r)/20,o=Math.min(i,Math.max(r,parseFloat(n.value)+a*t));return o!==parseFloat(n.value)&&(n.value=String(o),n.dispatchEvent(new Event(`input`,{bubbles:!0})),n.dispatchEvent(new Event(`change`,{bubbles:!0})),!0)}if(n===`seg`){let n=Array.from(e.querySelectorAll(`[data-value]`)),r=n.findIndex(e=>e.getAttribute(`aria-checked`)===`true`)+t;return r<0||r>=n.length?!1:(n[r].click(),!0)}return!1}activate(e){let t=e&&this.hovered?this.hovered:this.focused;if(!t){this.ensureFocus();return}let n=t.dataset.nav??``;if(n===`seg`){let e=Array.from(t.querySelectorAll(`[data-value]`));e[(e.findIndex(e=>e.getAttribute(`aria-checked`)===`true`)+1)%e.length]?.click()}else if(n===`slider`)this.adjust(t,1),this.sound(`move`);else if(n===`text`){let e=t instanceof HTMLInputElement?t:t.querySelector(`input`);e?.focus(),e?.select()}else t.click()}},Rp=[{id:`rookie`,name:`Rookie`,stars:1,desc:`Gentle rallies, slow balls and plenty of forgiveness.`,opp:`Pip`},{id:`club`,name:`Club`,stars:2,desc:`A steady all-rounder who keeps the ball in play.`,opp:`Max`},{id:`pro`,name:`Pro`,stars:3,desc:`Fast, spinny, and punishes every loose ball.`,opp:`Rina`},{id:`legend`,name:`Legend`,stars:4,desc:`Reads everything. Bring your very best strokes.`,opp:`Kaz`}],zp={idle:`Starting…`,connecting:`Connecting to game server…`,waiting:`Waiting for your phone…`,pairing:`Phone found — linking up…`,connected:`Phone connected`,disconnected:`Phone disconnected`,error:`Connection problem`},Bp=240,Vp=class{onStart=()=>{};onSettings=()=>{};onResume=()=>{};onQuit=()=>{};onRestart=()=>{};onRecenter=()=>{};onPair=()=>{};onVersusPair=()=>{};onUseMouse=()=>{};onResetStats=()=>{};onSound=()=>{};onCalibrateDone=()=>{};onPause=()=>{};onScreen=()=>{};hud;_screen=`none`;root;layer;screens={};nav;cursorEl;cursorVisible=!1;toastsEl;modal=null;returnTo={};leaveTimers=new Map;settings;stats;challenges;lastStart=null;controller={kind:`none`,status:`idle`};badges=[];playSub;setupCards=new Map;setupLen;setupSel;challengeGrid;statsGrid;settingsBody;settingsTabs;settingsTab=`gameplay`;versus;pair;cal;resultEl;constructor(e,t,n,r){this.root=e,this.settings={...t},this.stats=n,this.challenges=r,this.setupSel={difficulty:t.difficulty,gamesToWin:t.gamesToWin},this.nav=new Lp(e=>this.onSound(e)),e.classList.add(`ui-root`),e.dataset.screen=`none`,Tp(e),this.hud=new Mp(()=>this.lastStart?.gamesToWin??this.settings.gamesToWin),this.hud.onPause=()=>{this.onSound(`select`),this.onPause()},this.layer=X(`div`,{class:`screens`}),this.cursorEl=X(`div`,{class:`air-cursor`}),this.toastsEl=X(`div`,{class:`toasts`,"aria-live":`polite`}),e.append(X(`div`,{class:`backdrop`}),this.hud.el,this.layer,this.toastsEl,this.cursorEl),this.screens.title=this.buildTitle(),this.screens.main=this.buildMain(),this.screens[`play-setup`]=this.buildSetup(),this.screens.challenges=this.buildChallenges(),this.screens.pair=this.buildPair(),this.screens[`versus-pair`]=this.buildVersusPair(),this.screens.calibrate=this.buildCalibrate(),this.screens.settings=this.buildSettings(),this.screens.stats=this.buildStats(),this.screens.howto=this.buildHowto(),this.screens.pause=this.buildPause(),this.screens.result=this.buildResult();for(let[e,t]of Object.entries(this.screens))t.classList.add(`screen`,`scr-${e}`),t.hidden=!0,this.layer.append(t);this.layer.addEventListener(`pointerover`,e=>{if(e.pointerType!==`mouse`)return;let t=e.target.closest(`[data-nav]`);t&&this.nav.scope?.contains(t)&&this.nav.focused!==t&&(this.nav.focus(t,{scroll:!1}),this.onSound(`move`))}),this.layer.addEventListener(`click`,e=>{if(!e.isTrusted)return;let t=e.target.closest(`[data-nav], [data-value]`);t&&t.dataset.nav!==`slider`&&t.dataset.nav!==`text`&&this.onSound(t.dataset.sound??`select`)}),this.refreshBadges(),this.renderChallenges(),this.renderStats()}get screen(){return this._screen}get typing(){let e=document.activeElement;return!!e&&e instanceof HTMLInputElement&&e.type===`text`&&this.root.contains(e)}show(e){let t=this._screen;if(t===e)return;this.closeModal(),this.typing&&document.activeElement.blur(),(e===`settings`||e===`pair`||e===`versus-pair`||e===`calibrate`||e===`howto`)&&t!==`none`&&t!==e&&(this.returnTo[e]=t),this._screen=e,this.root.dataset.screen=e,e===`stats`&&this.renderStats(),e===`challenges`&&this.renderChallenges(),e===`settings`&&this.renderSettings(),e===`play-setup`&&this.syncSetup(),e===`main`&&this.syncMain(),e===`versus-pair`&&this.syncVersus(!0);let n=t===`none`?null:this.screens[t],r=e===`none`?null:this.screens[e],i=Dp();if(n){n.classList.remove(`active`,`enter`),n.classList.add(`leave`);let e=window.setTimeout(()=>{n.hidden=!0,n.classList.remove(`leave`),this.leaveTimers.delete(n)},i?0:Bp);this.leaveTimers.set(n,e)}if(r){let e=this.leaveTimers.get(r);e&&(clearTimeout(e),this.leaveTimers.delete(r)),r.hidden=!1,r.classList.remove(`leave`),r.scrollTop=0,Op(r,`enter`),r.classList.add(`active`),this.nav.setScope(r)}else this.nav.setScope(null),this.pointer(0,0,!1);this.onScreen(e)}setStats(e){this.stats=e,this.renderStats(),this.renderChallenges()}setSettings(e){this.settings={...e},this.setupSel={difficulty:e.difficulty,gamesToWin:e.gamesToWin},this._screen===`settings`&&this.renderSettings(),this.syncSetup(),this.syncMain()}setPairing(e){let t=this.pair;e.url!==t.lastUrl&&(t.lastUrl=e.url,t.url.textContent=e.url?e.url.replace(/^https?:\/\//,``):``,e.url?this.drawQr(t.qr,e.url,()=>this.pair.lastUrl===e.url):t.qr.innerHTML=`<div class="qr-wait"><span class="spinner"></span></div>`),e.pin!==t.lastPin&&(t.lastPin=e.pin,Tp(t.pin),(e.pin||`------`).padEnd(6,`-`).slice(0,6).split(``).forEach((e,n)=>{n===3&&t.pin.append(X(`span`,{class:`pin-gap`})),t.pin.append(X(`span`,{class:`pin-d ${e===`-`?`empty`:``}`,style:{animationDelay:`${n*40}ms`}},e===`-`?``:e))}),e.pin&&Op(t.pin,`show`));let n=e.status,r=zp[n];n===`connected`&&(r+=e.transport===`webrtc`?` · WebRTC`:e.transport===`relay`?` · Relay`:``),t.chip.className=`chip status-chip st-${n}`,t.chipText.textContent=r,t.detail.textContent=e.detail??``,t.detail.hidden=!e.detail,t.qrCard.classList.toggle(`linked`,n===`connected`),t.cont.hidden=n!==`connected`,n===`connected`&&this._screen===`pair`&&this.nav.focused!==t.cont&&this.nav.focus(t.cont)}drawQr(e,t,n){(0,hp.toString)(t,{type:`svg`,errorCorrectionLevel:`H`,margin:0,color:{dark:`#1d2333`,light:`#ffffff00`}}).then(t=>{n()&&(e.innerHTML=t+`<div class="qr-logo">${Fp(40,`qr`)}</div>`)}).catch(()=>{e.innerHTML=`<div class="qr-wait">QR unavailable</div>`})}setVersusPairing(e,t){let n=this.versus,r=n.cards[e];t.url!==r.lastUrl&&(r.lastUrl=t.url,r.url.textContent=t.url?t.url.replace(/^https?:\/\//,``):``,t.url?this.drawQr(r.qr,t.url,()=>r.lastUrl===t.url):r.qr.innerHTML=`<div class="qr-wait"><span class="spinner"></span></div>`),t.pin!==r.lastPin&&(r.lastPin=t.pin,Tp(r.pin),(t.pin||`------`).padEnd(6,`-`).slice(0,6).split(``).forEach((e,t)=>{t===3&&r.pin.append(X(`span`,{class:`pin-gap`})),r.pin.append(X(`span`,{class:`pin-d ${e===`-`?`empty`:``}`,style:{animationDelay:`${t*40}ms`}},e===`-`?``:e))}),t.pin&&Op(r.pin,`show`));let i=t.status,a=zp[i];i===`connected`&&(a+=t.transport===`webrtc`?` · WebRTC`:t.transport===`relay`?` · Relay`:``),r.chip.className=`chip status-chip st-${i}`,r.chipText.textContent=a,r.detail.textContent=t.detail??``,r.detail.hidden=!t.detail,r.qrCard.classList.toggle(`linked`,i===`connected`),n.status[e]=i,this.syncVersus(!1)}setCalibration(e,t){let n=this.cal,r=Ep(e,0,1),i=2*Math.PI*88;n.ring.style.strokeDashoffset=String(i*(1-r)),n.pct.textContent=`${Math.round(r*100)}%`;let a=r>=1;a!==n.done&&(n.done=a,n.stage.classList.toggle(`done`,a),n.status.textContent=a?`Calibrated!`:`Hold still…`,n.cont.classList.toggle(`primary`,a),n.cont.classList.toggle(`secondary`,!a),a&&(Op(n.status,`pop`),this._screen===`calibrate`&&this.nav.focus(n.cont)));let o=Ep(t.aimX,-1,1)*42+(t.backhand?180:0),s=Ep(t.aimY,-1,1)*32-t.face*180/Math.PI,c=Ep(t.aimX,-1,1)*-8;n.paddle.style.transform=`rotateY(${o.toFixed(1)}deg) rotateX(${s.toFixed(1)}deg) rotateZ(${c.toFixed(1)}deg)`,n.stage.classList.toggle(`disconnected`,!t.connected),n.stage.style.setProperty(`--swing`,Ep(t.swing,0,1).toFixed(2))}setController(e,t){this.controller={kind:e,status:t},this.hud.setControllerKind(e),this.refreshBadges()}showResult(e){this.renderResult(e),this.show(`result`)}navigate(e){this._screen!==`none`&&this._screen!==`title`&&(this.typing||this.nav.move(e))}activate(){if(this._screen===`none`)return;if(this._screen===`title`){this.onSound(`select`),this.show(`main`);return}if(this.typing){document.activeElement.blur();return}let e=this.cursorVisible&&this.nav.hovered?this.nav.hovered:this.nav.focused;e&&((e.dataset.nav??``)!==`slider`&&this.onSound(e.dataset.sound??`select`),e.classList.add(`pressed`),window.setTimeout(()=>e.classList.remove(`pressed`),140)),this.nav.activate(this.cursorVisible)}back(){if(this.modal){this.onSound(`back`),this.closeModal();return}if(this.typing){document.activeElement.blur();return}let e=this._screen;switch(e){case`none`:case`title`:return;case`main`:this.onSound(`back`),this.show(`title`);return;case`pause`:this.onSound(`back`),this.onResume();return;case`result`:this.onSound(`back`),this.onQuit();return;default:this.onSound(`back`),this.show(this.returnTo[e]??`main`)}}pointer(e,t,n){let r=n&&this._screen!==`none`;if(this.cursorVisible=r,this.cursorEl.classList.toggle(`on`,r),!r){this.nav.setHover(null);return}let i=Ep(e,0,1)*window.innerWidth,a=Ep(t,0,1)*window.innerHeight;this.cursorEl.style.transform=`translate(${i.toFixed(1)}px, ${a.toFixed(1)}px)`;let o=document.elementFromPoint(i,a)?.closest(`[data-nav]`)??null,s=o&&this.nav.scope?.contains(o)?o:null;this.nav.setHover(s),this.cursorEl.classList.toggle(`over`,!!s),s&&this.nav.focused!==s&&(this.nav.focus(s,{scroll:!1}),this.onSound(`move`))}toast(e){let t=X(`div`,{class:`toast`},e);for(this.toastsEl.append(t);this.toastsEl.childElementCount>3;)this.toastsEl.firstElementChild?.remove();window.setTimeout(()=>{t.classList.add(`out`),window.setTimeout(()=>t.remove(),320)},2600)}btn(e,t){return X(`button`,{class:`btn ${t.variant??`secondary`} ${t.cls??``}`,type:`button`,"data-nav":``,"data-sound":t.sound,"data-autofocus":t.autofocus,onclick:t.onClick},t.icon?Ap(t.icon):null,X(`span`,{class:`btn-label`},e,t.sub?X(`small`,null,t.sub):null))}head(e,t){return X(`header`,{class:`scr-head`},X(`button`,{class:`icon-btn back-btn`,type:`button`,"data-nav":``,"data-sound":`back`,"aria-label":`Back`,onclick:()=>this.goBackFromButton()},Ap(`back`)),X(`h2`,null,e),X(`div`,{class:`head-extra`},t??null))}goBackFromButton(){let e=this._screen;if(e===`pause`||e===`result`||e===`main`||e===`title`||e===`none`)return this.back();this.show(this.returnTo[e]??`main`)}hints(){let e=e=>X(`kbd`,null,e);return X(`footer`,{class:`hints`},X(`span`,null,e(`↑`),e(`↓`),e(`←`),e(`→`),` Move`),X(`span`,null,e(`Enter`),` Select`),X(`span`,null,e(`Esc`),` Back`))}badge(){let e=X(`button`,{class:`chip ctrl-badge`,type:`button`,"data-nav":``,onclick:()=>this.openPair()});return this.badges.push(e),e}refreshBadges(){let{kind:e,status:t}=this.controller;for(let n of this.badges){Tp(n);let r,i,a;e===`phone`&&t===`connected`?(r=`connected`,i=`Phone connected`,a=`phone`):e===`phone`?(r=t===`disconnected`||t===`error`?`error`:`waiting`,i=t===`disconnected`?`Phone disconnected`:t===`error`?`Phone error`:`Phone linking…`,a=`phone`):e===`mouse`?(r=`mouse`,i=`Mouse`,a=`mouse`):(r=`idle`,i=`Connect phone`,a=`qr`),n.className=`chip ctrl-badge st-${r} ${n.classList.contains(`nav-focus`)?`nav-focus`:``}`,n.append(X(`span`,{class:`status-dot`}),Ap(a),X(`span`,null,i))}}openVersusPair(){this.show(`versus-pair`),this.onVersusPair()}openPair(){this.show(`pair`),this.onPair()}buildTitle(){return X(`section`,{onclick:()=>this.activate()},X(`div`,{class:`title-wrap`},X(`div`,{class:`title-logo`,html:Ip({stacked:!0,tagline:!0})}),X(`div`,{class:`bouncer`,"aria-hidden":`true`},X(`div`,{class:`bouncer-ball`}),X(`div`,{class:`bouncer-shadow`})),X(`div`,{class:`press`,"data-nav":``,"data-autofocus":!0},`Press any key or tap to start`)),X(`div`,{class:`title-foot`},Ap(`phone`),`Best played with your phone as the paddle`))}buildMain(){let e=(e,t,n,r,i)=>X(`button`,{class:`tile`,type:`button`,"data-nav":``,style:{"--c":r},onclick:i},X(`span`,{class:`tile-ico`},Ap(t)),X(`span`,{class:`tile-text`},X(`b`,null,e),X(`small`,null,n)));this.playSub=X(`small`);let t=X(`button`,{class:`play-btn`,type:`button`,"data-nav":``,"data-autofocus":!0,onclick:()=>this.show(`play-setup`)},X(`span`,{class:`play-ico`},Ap(`play`)),X(`span`,{class:`tile-text`},X(`b`,null,`Play Match`),this.playSub),X(`span`,{class:`play-arrow`},Ap(`arrowRight`)));return X(`section`,null,X(`div`,{class:`topbar`},X(`div`),this.badge()),X(`div`,{class:`main-wrap`},X(`div`,{class:`main-brand`,html:Ip({stacked:!0,tagline:!0})}),X(`nav`,{class:`main-menu`},t,X(`div`,{class:`tiles`},e(`2 Players`,`versus`,`Split screen · 2 phones`,`var(--accent)`,()=>this.openVersusPair()),e(`Learn to Play`,`target`,`1-minute guided rally, then practice`,`var(--accent2)`,()=>this.start({mode:`practice`,difficulty:this.settings.difficulty,gamesToWin:this.settings.gamesToWin})),e(`Challenges`,`trophy`,`Targets & drills`,`var(--gold)`,()=>this.show(`challenges`)),e(`Connect Phone`,`phone`,`Your phone is the paddle`,`var(--accent)`,()=>this.openPair()),e(`Settings`,`sliders`,`Controls, audio, graphics`,`var(--ink-60)`,()=>this.show(`settings`)),e(`Stats`,`chart`,`Your career so far`,`var(--table)`,()=>this.show(`stats`)),e(`How to Play`,`help`,`Swing, spin & serve`,`var(--good)`,()=>this.show(`howto`))))),this.hints())}syncMain(){if(!this.playSub)return;let e=Rp.find(e=>e.id===this.settings.difficulty);this.playSub.textContent=`vs ${e.opp} · ${e.name} · Best of ${this.settings.gamesToWin*2-1}`}start(e){this.lastStart=e,this.onStart(e)}buildSetup(){let e=X(`div`,{class:`diff-grid`,role:`radiogroup`,"aria-label":`Difficulty`});for(let t of Rp){let n=X(`span`,{class:`stars`});for(let e=0;e<4;e++)n.append(Ap(e<t.stars?`star`:`starEmpty`));let r=X(`button`,{class:`diff-card d-${t.id}`,type:`button`,role:`radio`,"data-nav":``,onclick:()=>{this.setupSel.difficulty=t.id,this.syncSetup()},ondblclick:()=>this.startMatch()},X(`span`,{class:`diff-top`},X(`span`,{class:`diff-avatar`},t.opp[0]),n),X(`b`,null,t.name),X(`span`,{class:`diff-opp`},`vs ${t.opp}`),X(`small`,null,t.desc),X(`span`,{class:`diff-check`},Ap(`check`)));this.setupCards.set(t.id,r),e.append(r)}this.setupLen=this.seg([{v:`1`,l:`Best of 1`},{v:`2`,l:`Best of 3`},{v:`3`,l:`Best of 5`}],()=>String(this.setupSel.gamesToWin),e=>{this.setupSel.gamesToWin=Number(e)},`Match length`);let t=this.btn(`Start Match`,{icon:`play`,variant:`primary`,cls:`big`,onClick:()=>this.startMatch()});return X(`section`,null,this.head(`Play Match`,this.badge()),X(`div`,{class:`scr-body`},X(`h3`,{class:`label`},`Choose your opponent`),e,X(`div`,{class:`setup-foot`},X(`div`,{class:`setup-len`},X(`h3`,{class:`label`},`Match length`),this.setupLen),t)),this.hints())}syncSetup(){for(let[e,t]of this.setupCards){let n=e===this.setupSel.difficulty;t.classList.toggle(`selected`,n),t.setAttribute(`aria-checked`,String(n))}this.setupLen?.querySelectorAll(`[data-value]`).forEach(e=>{e.setAttribute(`aria-checked`,String(e.dataset.value===String(this.setupSel.gamesToWin)))});for(let e of this.setupCards.values())e.removeAttribute(`data-autofocus`);this.setupCards.get(this.setupSel.difficulty)?.setAttribute(`data-autofocus`,``)}startMatch(){let{difficulty:e,gamesToWin:t}=this.setupSel;(e!==this.settings.difficulty||t!==this.settings.gamesToWin)&&(this.settings={...this.settings,difficulty:e,gamesToWin:t},this.onSettings({...this.settings}),this.syncMain()),this.start({mode:`match`,difficulty:e,gamesToWin:t})}buildChallenges(){return this.challengeGrid=X(`div`,{class:`chal-grid`}),X(`section`,null,this.head(`Challenges`,this.badge()),X(`div`,{class:`scr-body`},this.challengeGrid),this.hints())}renderChallenges(){if(!this.challengeGrid)return;Tp(this.challengeGrid);let e=[`var(--accent)`,`var(--accent2)`,`var(--gold)`,`var(--table)`,`var(--good)`];this.challenges.length?(this.challenges.forEach((t,n)=>{let r=this.stats.challengeBest[t.id];this.challengeGrid.append(X(`button`,{class:`chal-card`,type:`button`,"data-nav":``,"data-autofocus":n===0,style:{"--c":e[n%e.length]},onclick:()=>this.start({mode:`challenge`,difficulty:this.settings.difficulty,gamesToWin:this.settings.gamesToWin,challengeId:t.id})},X(`span`,{class:`chal-num`},String(n+1).padStart(2,`0`)),X(`b`,null,t.name),X(`small`,null,t.description),X(`span`,{class:`chal-goal`},Ap(`target`),t.goal),X(`span`,{class:`chal-foot`},r===void 0?X(`span`,{class:`best`},`Not played yet`):X(`span`,{class:`best has`},Ap(`medal`),`Best ${r}`),X(`span`,{class:`go`},Ap(`play`)))))}),this.nav.refresh()):this.challengeGrid.append(X(`div`,{class:`empty`},`No challenges yet.`))}buildPair(){let e=X(`div`,{class:`qr`,html:`<div class="qr-wait"><span class="spinner"></span></div>`}),t=X(`div`,{class:`qr-url`}),n=X(`div`,{class:`qr-card`},e,X(`div`,{class:`qr-check`},Ap(`check`)),t),r=X(`div`,{class:`pin`,"aria-label":`Pairing PIN`}),i=X(`span`),a=X(`div`,{class:`chip status-chip st-idle`},X(`span`,{class:`status-dot`}),i),o=X(`div`,{class:`pair-detail`}),s=this.btn(`Continue`,{icon:`arrowRight`,variant:`primary`,onClick:()=>this.show(`calibrate`)});s.hidden=!0;let c=(e,t,n,r)=>X(`li`,null,X(`span`,{class:`step-n`},String(e)),X(`span`,{class:`step-ico`},Ap(t)),X(`span`,null,X(`b`,null,n),X(`small`,null,r)));this.pair={qr:e,qrCard:n,url:t,pin:r,chip:a,chipText:i,detail:o,cont:s,lastUrl:`\0`,lastPin:`\0`};let l=X(`section`,null,this.head(`Connect Phone`),X(`div`,{class:`scr-body pair-body`},n,X(`div`,{class:`pair-info`},X(`h3`,{class:`label`},`Or enter this PIN on your phone`),r,X(`ol`,{class:`steps`},c(1,`qr`,`Open camera & scan`,`Point your phone camera at the code`),c(2,`hand`,`Tap “Enable Motion”`,`Allow motion sensors when asked`),c(3,`paddle`,`Hold phone like a paddle`,`Upright, screen facing you, back toward the TV`)),X(`div`,{class:`pair-status`},a,o),X(`div`,{class:`row`},s,this.btn(`Play with mouse instead`,{icon:`mouse`,variant:`ghost`,onClick:()=>this.onUseMouse(),autofocus:!0})))),this.hints());return this.setPairing({pin:``,url:``,status:`idle`,transport:`none`}),l}buildVersusPair(){let e=(e,t,n,r)=>{let i=X(`div`,{class:`qr`,html:`<div class="qr-wait"><span class="spinner"></span></div>`}),a=X(`div`,{class:`qr-url`}),o=X(`div`,{class:`qr-card`},i,X(`div`,{class:`qr-check`},Ap(`check`)),a),s=X(`div`,{class:`pin`,"aria-label":`${n} pairing PIN`}),c=X(`span`),l=X(`div`,{class:`chip status-chip st-idle`},X(`span`,{class:`status-dot`}),c),u=X(`div`,{class:`pair-detail`});return u.hidden=!0,{el:X(`div`,{class:`vs-card vs-p${e}`,style:{"--c":t}},X(`div`,{class:`vs-head`},X(`span`,{class:`vs-dot`}),X(`b`,null,n),X(`small`,null,r)),o,s,X(`div`,{class:`pair-status`},l,u)),qr:i,qrCard:o,url:a,pin:s,chip:l,chipText:c,detail:u,lastUrl:`\0`,lastPin:`\0`}},t=e(1,`#ff6b4a`,`Player 1`,`Near side`),n=e(2,`#2ec4b6`,`Player 2`,`Far side`),r=this.seg([{v:`1`,l:`Best of 1`},{v:`2`,l:`Best of 3`},{v:`3`,l:`Best of 5`}],()=>String(this.versus?.gamesToWin??this.settings.gamesToWin),e=>{this.versus.gamesToWin=Number(e)},`Match length`),i=this.btn(`Start`,{icon:`play`,variant:`primary`,onClick:()=>this.startVersus()});i.disabled=!0;let{el:a,...o}=t,{el:s,...c}=n;return this.versus={cards:{1:o,2:c},status:{1:`idle`,2:`idle`},len:r,gamesToWin:this.settings.gamesToWin,start:i},r.querySelectorAll(`[data-value]`).forEach(e=>e.setAttribute(`aria-checked`,String(e.dataset.value===String(this.versus.gamesToWin)))),X(`section`,null,this.head(`2 Players`),X(`div`,{class:`scr-body vs-body`},X(`div`,{class:`vs-cards`},a,s),X(`div`,{class:`vs-foot`},X(`div`,{class:`setup-len`},X(`h3`,{class:`label`},`Match length`),r),i)),this.hints())}syncVersus(e){let t=this.versus;if(!t)return;e&&(t.gamesToWin=this.settings.gamesToWin,t.len.querySelectorAll(`[data-value]`).forEach(e=>e.setAttribute(`aria-checked`,String(e.dataset.value===String(t.gamesToWin)))));let n=t.status[1]===`connected`&&t.status[2]===`connected`,r=!t.start.disabled;t.start.disabled=!n,n&&!r&&this._screen===`versus-pair`&&this.nav.focus(t.start)}startVersus(){this.versus.start.disabled||this.start({mode:`versus`,difficulty:this.settings.difficulty,gamesToWin:this.versus.gamesToWin})}buildCalibrate(){let e=2*Math.PI*88,t=X(`div`,{class:`cal-ring`,html:`<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="ring-bg" cx="100" cy="100" r="88"/><circle class="ring-fg" cx="100" cy="100" r="88" stroke-dasharray="${e.toFixed(2)}" stroke-dashoffset="${e.toFixed(2)}" transform="rotate(-90 100 100)"/></svg>`}),n=X(`div`,{class:`pv-paddle`},X(`div`,{class:`pv-face pv-front`}),X(`div`,{class:`pv-face pv-back`}),X(`div`,{class:`pv-edge`}),X(`div`,{class:`pv-handle`})),r=X(`div`,{class:`cal-pct`},`0%`),i=X(`div`,{class:`cal-stage`},t,X(`div`,{class:`pv-persp`},n),X(`div`,{class:`pv-shadow`})),a=X(`div`,{class:`cal-status`},`Hold still…`),o=this.btn(`Continue`,{icon:`arrowRight`,variant:`secondary`,onClick:()=>this.onCalibrateDone(),autofocus:!0});return this.cal={paddle:n,ring:t.querySelector(`.ring-fg`),pct:r,status:a,cont:o,stage:i,done:!1},X(`section`,null,this.head(`Calibrate Paddle`),X(`div`,{class:`scr-body cal-body`},X(`div`,{class:`cal-explain`},X(`div`,{class:`cal-art`,html:Cp}),X(`p`,{class:`lead`},`Hold your phone upright like a paddle — screen facing you, the back of the phone toward the game. Keep still for a moment.`),X(`p`,{class:`muted`},`Keep it still for a moment. You can recenter any time from the pause menu.`)),X(`div`,{class:`cal-live`},i,X(`div`,{class:`cal-readout`},a,r),X(`div`,{class:`row`},this.btn(`Recenter`,{icon:`recenter`,variant:`ghost`,onClick:()=>this.onRecenter()}),o))),this.hints())}seg(e,t,n,r){let i=X(`div`,{class:`seg`,role:`radiogroup`,"aria-label":r,"data-nav":`seg`}),a=()=>i.querySelectorAll(`[data-value]`).forEach(e=>e.setAttribute(`aria-checked`,String(e.dataset.value===t())));for(let t of e)i.append(X(`button`,{type:`button`,role:`radio`,"data-value":t.v,tabindex:`-1`,onclick:()=>{n(t.v),a()}},t.l));return a(),i}slider(e,t,n,r,i,a){let o=X(`output`),s=X(`input`,{type:`range`,min:e,max:t,step:n,tabindex:`-1`});s.value=String(r());let c=()=>{let n=parseFloat(s.value);s.style.setProperty(`--p`,`${((n-e)/(t-e)*100).toFixed(1)}%`),o.textContent=a(n)};return s.addEventListener(`input`,()=>{i(parseFloat(s.value)),c()}),c(),X(`label`,{class:`slider`,"data-nav":`slider`},s,o)}toggle(e,t,n){let r=X(`button`,{class:`toggle`,type:`button`,role:`switch`,"aria-label":n,"data-nav":`toggle`,tabindex:`-1`},X(`span`,{class:`knob`})),i=()=>r.setAttribute(`aria-checked`,String(e()));return r.addEventListener(`click`,()=>{t(!e()),i()}),i(),r}change(e,t){this.settings={...this.settings,[e]:t},e===`difficulty`&&(this.setupSel.difficulty=t),e===`gamesToWin`&&(this.setupSel.gamesToWin=t),this.syncMain(),this.onSettings({...this.settings})}buildSettings(){return this.settingsTabs=this.seg([{v:`gameplay`,l:`Gameplay`},{v:`audio`,l:`Audio`},{v:`graphics`,l:`Graphics`}],()=>this.settingsTab,e=>{this.settingsTab=e,this.renderSettings(!0)},`Settings section`),this.settingsTabs.classList.add(`tabs`),this.settingsTabs.setAttribute(`data-autofocus`,``),this.settingsBody=X(`div`,{class:`set-list`}),X(`section`,null,this.head(`Settings`,this.settingsTabs),X(`div`,{class:`scr-body`},this.settingsBody),this.hints())}renderSettings(e=!1){let t=()=>this.settings,n=(e,t,n,r)=>X(`div`,{class:`set-row`},X(`span`,{class:`set-ico`},Ap(r)),X(`span`,{class:`set-label`},X(`b`,null,e),t?X(`small`,null,t):null),X(`span`,{class:`set-ctrl`},n)),r=e=>`${Math.round(e*100)}%`;Tp(this.settingsBody);let i=this.settingsTab;if(this.settingsTabs.querySelectorAll(`[data-value]`).forEach(e=>e.setAttribute(`aria-checked`,String(e.dataset.value===i))),i===`gameplay`){let e=X(`input`,{type:`text`,maxlength:14,spellcheck:`false`,autocomplete:`off`,class:`text-in`,"aria-label":`Player name`});e.value=t().playerName,e.addEventListener(`input`,()=>this.change(`playerName`,e.value.trim()||`You`)),e.addEventListener(`keydown`,t=>{(t.key===`Enter`||t.key===`Escape`)&&e.blur(),t.stopPropagation()});let i=X(`label`,{class:`text-wrap`,"data-nav":`text`},e,Ap(`user`));this.settingsBody.append(n(`Difficulty`,`Default opponent strength`,this.seg(Rp.map(e=>({v:e.id,l:e.name})),()=>t().difficulty,e=>this.change(`difficulty`,e),`Difficulty`),`trophy`),n(`Handedness`,`Which hand holds the phone`,this.seg([{v:`right`,l:`Right`},{v:`left`,l:`Left`}],()=>t().handedness,e=>this.change(`handedness`,e),`Handedness`),`hand`),n(`Assist`,`Helps positioning, timing and aim`,this.slider(0,1,.05,()=>t().assist,e=>this.change(`assist`,e),e=>e<.05?`Off`:r(e)),`target`),n(`Swing sensitivity`,`How hard you need to swing`,this.slider(.5,2,.05,()=>t().sensitivity,e=>this.change(`sensitivity`,e),e=>`${e.toFixed(2)}×`),`bolt`),n(`Show trajectory`,`Dotted guide for the incoming ball`,this.toggle(()=>t().showTrajectory,e=>this.change(`showTrajectory`,e),`Show trajectory`),`rally`),n(`Haptics`,`Phone buzzes on every hit`,this.toggle(()=>t().haptics,e=>this.change(`haptics`,e),`Haptics`),`phone`),n(`Player name`,`Shown on the scoreboard`,i,`user`))}else i===`audio`?this.settingsBody.append(n(`Master volume`,``,this.slider(0,1,.05,()=>t().masterVolume,e=>this.change(`masterVolume`,e),r),`volume`),n(`Music`,``,this.slider(0,1,.05,()=>t().musicVolume,e=>this.change(`musicVolume`,e),r),`music`),n(`Sound effects`,`Hits, bounces, crowd`,this.slider(0,1,.05,()=>t().sfxVolume,e=>this.change(`sfxVolume`,e),r),`ball`)):this.settingsBody.append(n(`Quality`,`Lower it if the game stutters`,this.seg([{v:`low`,l:`Low`},{v:`medium`,l:`Medium`},{v:`high`,l:`High`}],()=>t().quality,e=>this.change(`quality`,e),`Quality`),`monitor`),n(`Venue`,`Where you play`,this.seg([{v:`club`,l:`Club`},{v:`arena`,l:`Arena`}],()=>t().theme,e=>this.change(`theme`,e),`Theme`),`home`));e&&this.nav.focus(this.settingsTabs,{scroll:!1}),this.nav.refresh()}buildStats(){this.statsGrid=X(`div`,{class:`stats-grid`});let e=this.btn(`Reset stats`,{icon:`trash`,variant:`ghost`,cls:`danger-text`,onClick:()=>this.confirmReset()});return X(`section`,null,this.head(`Career Stats`,e),X(`div`,{class:`scr-body`},this.statsGrid),this.hints())}renderStats(){if(!this.statsGrid)return;let e=this.stats;Tp(this.statsGrid);let t=e.matchesPlayed,n=t?e.matchesWon/t:0,r=e.pointsWon+e.pointsLost,i=(e,t,n,r,i,a=!1)=>X(`div`,{class:`stat-card ${a?`big`:``}`,"data-nav":``,style:{"--c":i}},X(`span`,{class:`stat-ico`},Ap(e)),X(`span`,{class:`stat-val`},n),X(`span`,{class:`stat-lbl`},t),r?X(`small`,null,r):null),a=2*Math.PI*40,o=X(`div`,{class:`wr-ring`,html:`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="ring-bg"/><circle cx="50" cy="50" r="40" class="ring-fg" stroke-dasharray="${a.toFixed(1)}" stroke-dashoffset="${(a*(1-n)).toFixed(1)}" transform="rotate(-90 50 50)"/></svg>`});o.append(X(`span`,{class:`wr-text`},X(`span`,{class:`stat-val`},t?`${Math.round(n*100)}%`:`—`),X(`span`,{class:`stat-lbl`},`Win rate`)));let s=X(`div`,{class:`stat-card winrate big`,"data-nav":``,"data-autofocus":!0,style:{"--c":`var(--accent)`}},o,X(`small`,null,`${e.matchesWon} won · ${t-e.matchesWon} lost`));this.statsGrid.append(s,i(`trophy`,`Matches played`,String(t),t?`${e.matchesWon} victories`:`Play your first match!`,`var(--gold)`),i(`rally`,`Longest rally`,String(e.longestRally),`hits in one point`,`var(--accent2)`),i(`bolt`,`Fastest shot`,`${Math.round(e.fastestShotKmh)}`,`km/h`,`var(--accent)`),i(`ace`,`Aces`,String(e.aces),`unreturned serves`,`var(--gold)`),i(`percent`,`Points won`,String(e.pointsWon),r?`${Math.round(e.pointsWon/r*100)}% of all points`:`no points yet`,`var(--good)`),i(`clock`,`Points played`,String(r),`${e.pointsLost} lost`,`var(--table)`));let c=this.challenges.filter(t=>e.challengeBest[t.id]!==void 0);c.length&&this.statsGrid.append(X(`div`,{class:`stat-card wide`,"data-nav":``,style:{"--c":`var(--table)`}},X(`span`,{class:`stat-ico`},Ap(`medal`)),X(`span`,{class:`stat-lbl`},`Challenge bests`),X(`ul`,{class:`best-list`},...c.map(t=>X(`li`,null,X(`span`,null,t.name),X(`b`,null,String(e.challengeBest[t.id]))))))),this.nav.refresh()}confirmReset(){this.openModal(`Reset all stats?`,`Your career record and challenge bests will be wiped. This can’t be undone.`,[{label:`Cancel`,variant:`secondary`,autofocus:!0,sound:`back`,run:()=>this.closeModal()},{label:`Reset`,variant:`danger`,icon:`trash`,run:()=>{this.closeModal(),this.onResetStats(),this.toast(`Stats reset`)}}])}openModal(e,t,n){this.closeModal();let r=X(`div`,{class:`modal`,role:`dialog`,"aria-modal":`true`,"aria-label":e},X(`div`,{class:`modal-card`},X(`h3`,null,e),X(`p`,null,t),X(`div`,{class:`row`},...n.map(e=>this.btn(e.label,{variant:e.variant,icon:e.icon,autofocus:e.autofocus,sound:e.sound,onClick:e.run})))));r.addEventListener(`click`,e=>{e.target===r&&this.closeModal()}),this.layer.append(r),this.modal=r,this.nav.setScope(r)}closeModal(){if(!this.modal)return;this.modal.remove(),this.modal=null;let e=this._screen===`none`?null:this.screens[this._screen];this.nav.setScope(e)}buildHowto(){return X(`section`,null,this.head(`How to Play`),X(`div`,{class:`scr-body`},X(`div`,{class:`howto-grid`},...[{art:`hold`,title:`Hold it like a paddle`,text:`Grip the bottom of the phone like a handle: upright, screen facing you, back of the phone is your rubber.`},{art:`timing`,title:`Swing when the ring turns green`,text:`You run to the ball automatically. A ring closes around the ball — swing (any swing!) when it turns green. No phone motion? Tap the big button instead.`},{art:`swing`,title:`Early or late still counts`,text:`PERFECT timing hits hardest and straightest. EARLY or LATE swings still send the ball back, just softer.`},{art:`aim`,title:`Point to aim`,text:`Point the phone left or right (or press ◀ ▶) — the lit pad on the far side shows where your shot will land.`},{art:`spin`,title:`Spin (optional)`,text:`Brush upward for a fast topspin loop; chop downward for a slow backspin push. A high ball + big swing = smash.`},{art:`serve`,title:`Serving`,text:`Swing or tap to serve. Serves alternate every 2 points — every point from 10–10. First to 11, win by 2.`}].map((e,t)=>X(`article`,{class:`howto-card`,"data-nav":``,"data-autofocus":t===0},X(`div`,{class:`howto-art`,html:Sp[e.art]}),X(`div`,{class:`howto-text`},X(`b`,null,X(`span`,{class:`howto-n`},String(t+1)),e.title),X(`small`,null,e.text))))),X(`p`,{class:`muted center`},Ap(`mouse`),` No phone? Click or press Space when the ring turns green; move the mouse left/right to aim.`)),this.hints())}buildPause(){return X(`section`,null,X(`div`,{class:`pause-card`},X(`div`,{class:`pause-ico`},Ap(`pause`)),X(`h2`,null,`Paused`),X(`div`,{class:`stack`},this.btn(`Resume`,{icon:`play`,variant:`primary`,autofocus:!0,onClick:()=>this.onResume()}),this.btn(`Recenter paddle`,{icon:`recenter`,onClick:()=>{this.onRecenter(),this.toast(`Paddle recentered`)}}),this.btn(`Settings`,{icon:`sliders`,onClick:()=>this.show(`settings`)}),this.btn(`Quit to menu`,{icon:`home`,variant:`ghost`,sound:`back`,onClick:()=>this.onQuit()}))))}buildResult(){return this.resultEl=X(`div`,{class:`result-card`}),X(`section`,null,this.resultEl)}renderResult(e){let t=this.resultEl;Tp(t);let n={match:`Match`,practice:`Practice`,challenge:`Challenge`,demo:`Demo`,versus:`2 Players`};t.className=`result-card ${e.won?`won`:`lost`}`;let r=new Set(e.newRecords.map(e=>e.toLowerCase())),i=X(`div`,{class:`banner`},X(`div`,{class:`banner-ico`},Ap(e.won?`trophy`:`paddle`)),X(`div`,null,X(`span`,{class:`banner-mode`},n[e.mode]??``),X(`h2`,null,e.title)));if(t.append(i),e.games.length){let n=Rp.find(e=>e.id===(this.lastStart?.difficulty??this.settings.difficulty))?.opp??`CPU`,r=X(`table`,{class:`games`}),i=X(`tr`,null,X(`th`,null,``));e.games.forEach((e,t)=>i.append(X(`th`,null,`G${t+1}`))),r.append(X(`thead`,null,i));let a=X(`tbody`);[`player`,`opponent`].forEach(t=>{let r=X(`tr`,{class:t},X(`td`,{class:`nm`},X(`span`,{class:`sb-dot`}),t===`player`?this.settings.playerName:n));e.games.forEach(e=>r.append(X(`td`,{class:e[t]>e[t===`player`?`opponent`:`player`]?`w`:``},String(e[t])))),a.append(r)}),r.append(a),t.append(X(`div`,{class:`games-wrap`},r))}e.stats.length&&t.append(X(`div`,{class:`res-stats`},...e.stats.map(e=>X(`div`,{class:`res-stat ${r.has(e.label.toLowerCase())?`record`:``}`},X(`b`,null,e.value),X(`small`,null,e.label),r.has(e.label.toLowerCase())?X(`span`,{class:`rec-tag`},`New record`):null)))),e.newRecords.length&&t.append(X(`div`,{class:`records`},...e.newRecords.map(e=>X(`span`,{class:`chip gold`},Ap(`star`),`New record · ${e}`)))),t.append(X(`div`,{class:`row center`},this.btn(`Play Again`,{icon:`refresh`,variant:`primary`,autofocus:!0,onClick:()=>this.onRestart()}),this.btn(`Main Menu`,{icon:`home`,variant:`secondary`,sound:`back`,onClick:()=>this.onQuit()})))}},Hp=e=>440*2**((e-69)/12),Up=class{ctx;def;noise;gain;timer=0;nextTime=0;stepIdx=0;stopped=!1;lowpass;constructor(e,t,n,r){this.ctx=e,this.def=n,this.noise=r,this.gain=e.createGain(),this.gain.gain.value=0,this.lowpass=e.createBiquadFilter(),this.lowpass.type=`lowpass`,this.lowpass.frequency.value=9e3,this.lowpass.connect(this.gain),this.gain.connect(t)}get bus(){return this.lowpass}get sixteenth(){return 60/this.def.bpm/4}start(e){let t=this.ctx.currentTime;this.gain.gain.cancelScheduledValues(t),this.gain.gain.setValueAtTime(this.gain.gain.value,t),this.gain.gain.linearRampToValueAtTime(1,t+e),this.nextTime=t+.08,this.timer=window.setInterval(()=>this.schedule(),25),this.schedule()}stop(e){if(this.stopped)return;this.stopped=!0;let t=this.ctx.currentTime;this.gain.gain.cancelScheduledValues(t),this.gain.gain.setValueAtTime(this.gain.gain.value,t),this.gain.gain.linearRampToValueAtTime(0,t+e),window.setTimeout(()=>{clearInterval(this.timer),this.lowpass.disconnect(),this.gain.disconnect()},(e+.6)*1e3)}setMuffle(e){let t=this.ctx.currentTime;this.lowpass.frequency.cancelScheduledValues(t),this.lowpass.frequency.setTargetAtTime(e?900:9e3,t,.15)}schedule(){if(this.stopped)return;let e=this.ctx.currentTime+.18;for(this.nextTime<this.ctx.currentTime-.2&&(this.nextTime=this.ctx.currentTime+.05);this.nextTime<e;){let e=this.stepIdx%16,t=Math.floor(this.stepIdx/16),n=e%2==1?this.def.swing*this.sixteenth:0;this.def.step(this,e,this.nextTime+n,t),this.nextTime+=this.sixteenth,this.stepIdx++}}env(e,t,n,r,i){e.gain.setValueAtTime(1e-4,t),e.gain.linearRampToValueAtTime(n,t+r),e.gain.exponentialRampToValueAtTime(1e-4,t+r+i)}cleanup(e,t){e.onended=()=>t.forEach(e=>e.disconnect())}kick(e,t=1){let n=this.ctx.createOscillator(),r=this.ctx.createGain();n.frequency.setValueAtTime(150,e),n.frequency.exponentialRampToValueAtTime(45,e+.12),this.env(r,e,.9*t,.003,.28),n.connect(r).connect(this.bus),n.start(e),n.stop(e+.35),this.cleanup(n,[n,r])}snare(e,t=1,n=1800){let r=this.ctx.createBufferSource();r.buffer=this.noise;let i=this.ctx.createBiquadFilter();i.type=`bandpass`,i.frequency.value=n,i.Q.value=.8;let a=this.ctx.createGain();this.env(a,e,.35*t,.002,.16),r.connect(i).connect(a).connect(this.bus);let o=this.ctx.createOscillator();o.type=`triangle`,o.frequency.setValueAtTime(220,e),o.frequency.exponentialRampToValueAtTime(150,e+.08);let s=this.ctx.createGain();this.env(s,e,.18*t,.002,.08),o.connect(s).connect(this.bus);let c=Math.random()*1.5;r.start(e,c,.25),o.start(e),o.stop(e+.12),this.cleanup(r,[r,i,a]),this.cleanup(o,[o,s])}hat(e,t=1,n=!1){let r=this.ctx.createBufferSource();r.buffer=this.noise;let i=this.ctx.createBiquadFilter();i.type=`highpass`,i.frequency.value=7e3;let a=this.ctx.createGain();this.env(a,e,.12*t,.001,n?.18:.04),r.connect(i).connect(a).connect(this.bus),r.start(e,Math.random()*1.5,.3),this.cleanup(r,[r,i,a])}keys(e,t,n,r=1){let i=this.ctx.createGain(),a=this.ctx.createBiquadFilter();a.type=`lowpass`,a.frequency.setValueAtTime(2400,e),a.frequency.exponentialRampToValueAtTime(900,e+n),i.gain.setValueAtTime(1e-4,e),i.gain.linearRampToValueAtTime(.07*r,e+.015),i.gain.exponentialRampToValueAtTime(.03*r,e+.3),i.gain.exponentialRampToValueAtTime(1e-4,e+n),a.connect(i).connect(this.bus);let o=[];for(let r of t)for(let[t,i]of[[`triangle`,-6],[`triangle`,6],[`sine`,1200]]){let s=this.ctx.createOscillator();if(s.type=t,s.frequency.value=Hp(r),s.detune.value=i,i===1200){let t=this.ctx.createGain();t.gain.setValueAtTime(.25,e),t.gain.exponentialRampToValueAtTime(.001,e+.4),s.connect(t).connect(a),s.onended=()=>{s.disconnect(),t.disconnect()}}else s.connect(a),s.onended=()=>s.disconnect();s.start(e),s.stop(e+n+.05),o.push(s)}o[0].addEventListener(`ended`,()=>{a.disconnect(),i.disconnect()})}bass(e,t,n,r=1,i=`sine`){let a=this.ctx.createOscillator();a.type=i,a.frequency.value=Hp(t);let o=this.ctx.createBiquadFilter();o.type=`lowpass`,o.frequency.value=i===`sine`?2e3:600;let s=this.ctx.createGain();s.gain.setValueAtTime(1e-4,e),s.gain.linearRampToValueAtTime(.32*r,e+.01),s.gain.setTargetAtTime(1e-4,e+n*.7,n*.15),a.connect(o).connect(s).connect(this.bus),a.start(e),a.stop(e+n+.2),this.cleanup(a,[a,o,s])}pluck(e,t,n=1,r=.25){let i=this.ctx.createOscillator();i.type=`square`,i.frequency.value=Hp(t);let a=this.ctx.createBiquadFilter();a.type=`lowpass`,a.Q.value=4,a.frequency.setValueAtTime(3200,e),a.frequency.exponentialRampToValueAtTime(400,e+r);let o=this.ctx.createGain();this.env(o,e,.06*n,.003,r),i.connect(a).connect(o).connect(this.bus),i.start(e),i.stop(e+r+.05),this.cleanup(i,[i,a,o])}bell(e,t,n=1){let r=this.ctx.createOscillator();r.type=`sine`,r.frequency.value=Hp(t);let i=this.ctx.createOscillator();i.type=`sine`,i.frequency.value=Hp(t)*2.01;let a=this.ctx.createGain();this.env(a,e,.08*n,.005,.9);let o=this.ctx.createGain();o.gain.value=.3,r.connect(a),i.connect(o).connect(a),a.connect(this.bus),r.start(e),i.start(e),r.stop(e+1),i.stop(e+1),this.cleanup(r,[r,i,a,o])}crackle(e){let t=this.ctx.createBufferSource();t.buffer=this.noise;let n=this.ctx.createBiquadFilter();n.type=`bandpass`,n.frequency.value=2500+Math.random()*3e3,n.Q.value=2;let r=this.ctx.createGain();this.env(r,e,.03+Math.random()*.04,5e-4,.008),t.connect(n).connect(r).connect(this.bus),t.start(e,Math.random()*1.5,.02),this.cleanup(t,[t,n,r])}},Wp=e=>e[Math.floor(Math.random()*e.length)],Gp={bpm:82,swing:.28,chords:[[41,57,60,64,67],[40,55,59,62,67],[38,57,60,62,65],[36,55,59,64,67]],scale:[72,74,76,79,81,84],step(e,t,n,r){let i=this.chords[r%this.chords.length];t===0&&e.keys(n,i.slice(1),e.sixteenth*9,1),t===10&&Math.random()<.7&&e.keys(n,i.slice(2),e.sixteenth*5,.6),t===0&&e.bass(n,i[0],e.sixteenth*6),(t===7||t===10&&Math.random()<.5)&&e.bass(n,i[0]+(Math.random()<.3?7:0),e.sixteenth*3,.7),(t===0||t===7||t===10&&r%2==1)&&e.kick(n,t===0?.9:.6),(t===4||t===12)&&e.snare(n,.55,1400),t%2==0&&e.hat(n,t%4==0?.55:.35+Math.random()*.2),t%2==0&&r%4!=3&&Math.random()<.16&&e.bell(n,Wp(this.scale),.7+Math.random()*.3),Math.random()<.25&&e.crackle(n+Math.random()*e.sixteenth)}},Kp={bpm:116,swing:.08,chords:[[45,69,72,76],[41,69,72,77],[48,67,72,76],[43,67,71,74]],scale:[69,72,74,76,79,81],step(e,t,n,r){let i=this.chords[r%this.chords.length],a=Math.floor(r/4)%4;t%4==0&&e.kick(n,.85),(t===4||t===12)&&a>0&&e.snare(n,.5,2200),t%4==2?e.hat(n,.7,!0):a>1&&e.hat(n,.3),(t%2==0||t===15)&&e.bass(n,i[0]+(t%4==2?12:0),e.sixteenth*1.6,t%4==2?.75:.95,`sawtooth`);let o=[0,1,2,3,2,1,3,1],s=i[1+o[t%8]%3]+(o[t%8]===3?12:0);e.pluck(n,s,t%4==0?1:.65,.18),t===0&&e.keys(n,i.slice(1).map(e=>e-12),e.sixteenth*14,.6),a===3&&t%4==3&&Math.random()<.4&&e.bell(n,Wp(this.scale)+12,.5)}},qp=class{ctx;out;noise;current=null;name=null;constructor(e,t,n){this.ctx=e,this.out=t,this.noise=n}get track(){return this.name}play(e,t=1.6){if(e===this.name||(this.name=e,this.current?.stop(t),this.current=null,!e))return;let n=new Up(this.ctx,this.out,e===`menu`?Gp:Kp,this.noise);n.start(t),this.current=n}muffle(e){this.current?.setMuffle(e)}dispose(){this.current?.stop(.2),this.current=null,this.name=null}},Jp=e=>e<0?0:e>1?1:e,Yp=(e,t)=>e+Math.random()*(t-e),Xp=class{ctx=null;master;musicGain;sfxGain;comp;white;pink;musicEngine=null;wantTrack=null;vol={master:.8,music:.4,sfx:.9};crowdNodes=null;crowdLevel=0;lastUi=0;slowPulse=null;unlock(){if(!this.ctx){let e=window.AudioContext??window.webkitAudioContext;if(!e)return;let t=new e({latencyHint:`interactive`});this.ctx=t,this.comp=t.createDynamicsCompressor(),this.comp.threshold.value=-14,this.comp.knee.value=10,this.comp.ratio.value=4,this.comp.attack.value=.004,this.comp.release.value=.2,this.master=t.createGain(),this.musicGain=t.createGain(),this.sfxGain=t.createGain(),this.musicGain.connect(this.master),this.sfxGain.connect(this.master),this.master.connect(this.comp).connect(t.destination),this.white=this.makeNoise(2,!1),this.pink=this.makeNoise(4,!0),this.applyVolumes(!0),this.musicEngine=new qp(t,this.musicGain,this.white),this.wantTrack&&this.musicEngine.play(this.wantTrack,2),this.crowdLevel>0&&this.crowd(this.crowdLevel)}this.ctx.state===`suspended`&&this.ctx.resume()}get ready(){return!!this.ctx&&this.ctx.state===`running`}setVolumes(e,t,n){this.vol={master:Jp(e),music:Jp(t),sfx:Jp(n)},this.applyVolumes(!1)}applyVolumes(e){if(!this.ctx)return;let t=this.ctx.currentTime,n=(n,r)=>{n.cancelScheduledValues(t),e?n.setValueAtTime(r,t):n.setTargetAtTime(r,t,.05)};n(this.master.gain,this.vol.master**1.6),n(this.musicGain.gain,this.vol.music**1.6*.55),n(this.sfxGain.gain,this.vol.sfx**1.6)}makeNoise(e,t){let n=this.ctx,r=Math.floor(n.sampleRate*e),i=n.createBuffer(1,r,n.sampleRate),a=i.getChannelData(0),o=0,s=0,c=0,l=0,u=0,d=0,f=0;for(let e=0;e<r;e++){let n=Math.random()*2-1;t?(o=.99886*o+n*.0555179,s=.99332*s+n*.0750759,c=.969*c+n*.153852,l=.8665*l+n*.3104856,u=.55*u+n*.5329522,d=-.7616*d-n*.016898,a[e]=(o+s+c+l+u+d+f+n*.5362)*.11,f=n*.115926):a[e]=n}let p=Math.min(2048,r>>4);for(let e=0;e<p;e++){let t=e/p;a[r-p+e]=a[r-p+e]*(1-t)+a[e]*t}return i}now(){return this.ctx.currentTime+.002}done(e,t){e.onended=()=>{for(let e of t)e.disconnect()}}noiseBurst(e,t){let n=this.ctx,r=n.createBufferSource();r.buffer=t.pink?this.pink:this.white;let i=n.createBiquadFilter();i.type=t.type,i.frequency.setValueAtTime(t.freq,e),t.freqEnd&&i.frequency.exponentialRampToValueAtTime(t.freqEnd,e+(t.attack??.001)+t.decay),i.Q.value=t.q??1;let a=n.createGain(),o=t.attack??.001;a.gain.setValueAtTime(1e-4,e),a.gain.linearRampToValueAtTime(t.gain,e+o),a.gain.exponentialRampToValueAtTime(1e-4,e+o+t.decay),r.connect(i).connect(a).connect(t.dest??this.sfxGain);let s=o+t.decay+.02;r.start(e,Math.max(0,Math.random()*(r.buffer.duration-s-.01)),s),this.done(r,[r,i,a])}tone(e,t){let n=this.ctx,r=n.createOscillator();r.type=t.type??`sine`,r.frequency.setValueAtTime(t.freq,e),t.freqEnd&&r.frequency.exponentialRampToValueAtTime(t.freqEnd,e+(t.attack??.002)+t.decay),t.detune&&(r.detune.value=t.detune);let i=n.createGain(),a=t.attack??.002,o=t.sustain??0;i.gain.setValueAtTime(1e-4,e),i.gain.linearRampToValueAtTime(t.gain,e+a),o&&i.gain.setValueAtTime(t.gain,e+a+o),i.gain.exponentialRampToValueAtTime(1e-4,e+a+o+t.decay),r.connect(i).connect(t.dest??this.sfxGain),r.start(e),r.stop(e+a+o+t.decay+.03),this.done(r,[r,i])}paddleHit(e,t){if(!this.ctx)return;let n=this.now(),r=Jp(e),i=t===`push`||t===`chop`||t===`block`||t===`lob`,a=t===`smash`||r>.92,o=(.3+.7*r)*(i?.65:1),s=i?.8:1+r*.25,c=Yp(.97,1.03);this.tone(n,{type:`sine`,freq:1250*s*c,freqEnd:1050*s*c,gain:.32*o,decay:.055+r*.02}),this.tone(n,{type:`triangle`,freq:2350*s*c,freqEnd:2100*s*c,gain:.14*o,decay:.035}),this.tone(n,{type:`sine`,freq:190,freqEnd:120,gain:.25*o,decay:.05}),this.noiseBurst(n,{type:`bandpass`,freq:1800+r*1200,q:1.3,gain:.55*o,decay:i?.025:.04}),a&&(this.noiseBurst(n,{type:`highpass`,freq:2500,gain:.35*o,decay:.09}),this.noiseBurst(n+.006,{type:`bandpass`,freq:900,q:.8,gain:.3*o,decay:.07}))}tableBounce(e){if(!this.ctx)return;let t=this.now(),n=Jp(e/10)*.85+.15,r=Yp(.95,1.06);this.tone(t,{type:`sine`,freq:2900*r,freqEnd:2600*r,gain:.2*n,decay:.03}),this.tone(t,{type:`triangle`,freq:1650*r,freqEnd:1450*r,gain:.12*n,decay:.045}),this.tone(t,{type:`sine`,freq:420,freqEnd:260,gain:.16*n,decay:.04}),this.noiseBurst(t,{type:`bandpass`,freq:4200,q:1.5,gain:.4*n,decay:.018})}netHit(){if(!this.ctx)return;let e=this.now();this.tone(e,{type:`sine`,freq:120,freqEnd:70,gain:.4,decay:.14}),this.noiseBurst(e,{type:`lowpass`,freq:650,gain:.55,decay:.12,pink:!0});for(let t=0;t<5;t++)this.noiseBurst(e+.02+t*Yp(.018,.03),{type:`bandpass`,freq:Yp(2500,4500),q:3,gain:.1*(1-t/6),decay:.012})}floorBounce(e){if(!this.ctx)return;let t=this.now(),n=Jp(e/8)*.8+.2,r=Yp(.94,1.06);this.tone(t,{type:`sine`,freq:720*r,freqEnd:480*r,gain:.22*n,decay:.07}),this.tone(t,{type:`triangle`,freq:1300*r,freqEnd:1100*r,gain:.06*n,decay:.04}),this.noiseBurst(t,{type:`lowpass`,freq:1600,gain:.25*n,decay:.035})}whoosh(e){if(!this.ctx)return;let t=this.now(),n=Jp(e),r=.16+n*.12,i=this.ctx,a=i.createBufferSource();a.buffer=this.pink;let o=i.createBiquadFilter();o.type=`bandpass`,o.Q.value=1.2,o.frequency.setValueAtTime(350,t),o.frequency.exponentialRampToValueAtTime(1800+n*1600,t+r*.55),o.frequency.exponentialRampToValueAtTime(600,t+r);let s=i.createGain();s.gain.setValueAtTime(1e-4,t),s.gain.linearRampToValueAtTime(.35+n*.8,t+r*.5),s.gain.exponentialRampToValueAtTime(1e-4,t+r),a.connect(o).connect(s).connect(this.sfxGain),a.start(t,Math.random()*3,r+.05),this.done(a,[a,o,s])}crowd(e){if(this.crowdLevel=Jp(e),!this.ctx)return;let t=this.ctx;if(!this.crowdNodes&&this.crowdLevel>0){let e=t.createGain();e.gain.value=0,e.connect(this.sfxGain);let n=[],r=[e];for(let[i,a,o,s]of[[480,.7,.13,0],[1100,1.4,.21,1.7]]){let c=t.createBufferSource();c.buffer=this.pink,c.loop=!0;let l=t.createBiquadFilter();l.type=`bandpass`,l.frequency.value=i,l.Q.value=a;let u=t.createGain();u.gain.value=.6;let d=t.createOscillator();d.frequency.value=o;let f=t.createGain();f.gain.value=.25,d.connect(f).connect(u.gain),c.connect(l).connect(u).connect(e),c.start(t.currentTime,s),d.start(),n.push(c,d),r.push(l,u,d,f,c)}this.crowdNodes={gain:e,srcs:n,nodes:r}}if(this.crowdNodes){let e=this.crowdNodes.gain.gain;if(e.cancelScheduledValues(t.currentTime),e.setTargetAtTime(this.crowdLevel*.32,t.currentTime,.6),this.crowdLevel===0){let e=this.crowdNodes;this.crowdNodes=null,window.setTimeout(()=>{for(let t of e.srcs)try{t.stop()}catch{}for(let t of e.nodes)t.disconnect()},3e3)}}}applause(e){if(!this.ctx)return;let t=this.now(),n=Jp(e),r=1.4+n*2.4,i=Math.round(25+n*110);for(let e=0;e<i;e++){let e=Math.random()**1.7,i=t+.05+e*r,a=1-e*.85;this.noiseBurst(i,{type:`bandpass`,freq:Yp(900,2600),q:Yp(1,2.2),gain:Yp(.12,.3)*(.5+n*.5)*a,decay:Yp(.012,.035)})}this.noiseBurst(t,{type:`bandpass`,freq:900,q:.6,gain:.22+n*.35,attack:.25,decay:r*.9,pink:!0})}groan(){if(!this.ctx)return;let e=this.ctx,t=this.now(),n=1.3,r=e.createGain();r.gain.setValueAtTime(1e-4,t),r.gain.linearRampToValueAtTime(1.3,t+.22),r.gain.exponentialRampToValueAtTime(1e-4,t+n),r.connect(this.sfxGain);let i=e.createBiquadFilter();i.type=`bandpass`,i.frequency.setValueAtTime(520,t),i.frequency.linearRampToValueAtTime(420,t+n),i.Q.value=5;let a=e.createBiquadFilter();a.type=`bandpass`,a.frequency.setValueAtTime(900,t),a.frequency.linearRampToValueAtTime(760,t+n),a.Q.value=6,i.connect(r),a.connect(r);let o=[r,i,a],s=e.createBufferSource();s.buffer=this.pink;let c=e.createGain();c.gain.value=1.4,s.connect(c),c.connect(i),c.connect(a),s.start(t,Math.random(),1.4000000000000001),o.push(s,c);let l=s;for(let r=0;r<6;r++){let r=e.createOscillator();r.type=`sawtooth`;let s=Yp(120,230);r.frequency.setValueAtTime(s,t),r.frequency.exponentialRampToValueAtTime(s*.78,t+n);let c=e.createGain();c.gain.value=.05,r.connect(c),c.connect(i),c.connect(a),r.start(t+Yp(0,.08)),r.stop(t+n+.05),o.push(r,c),l=r}this.done(l,o)}score(e){if(!this.ctx)return;let t=this.now();e?(this.bell(t,1046.5,.22),this.bell(t+.09,1568,.22)):(this.tone(t,{type:`triangle`,freq:392,gain:.16,decay:.22}),this.tone(t+.12,{type:`triangle`,freq:293.7,gain:.16,decay:.35}))}bell(e,t,n,r=.6){this.tone(e,{type:`sine`,freq:t,gain:n,decay:r}),this.tone(e,{type:`sine`,freq:t*2,gain:n*.35,decay:r*.5}),this.tone(e,{type:`sine`,freq:t*3.01,gain:n*.12,decay:r*.3})}win(){if(!this.ctx)return;let e=this.now();[523.25,659.25,783.99,1046.5].forEach((t,n)=>{this.tone(e+n*.11,{type:`square`,freq:t,gain:.05,decay:.18}),this.bell(e+n*.11,t,.12,.35)});let t=e+.5;for(let e of[523.25,659.25,783.99,1046.5,1318.5])this.tone(t,{type:`triangle`,freq:e,gain:.07,attack:.02,sustain:.5,decay:.9}),this.tone(t,{type:`sawtooth`,freq:e/2,gain:.015,attack:.03,sustain:.4,decay:.8,detune:7});for(let e=0;e<6;e++)this.bell(t+.15+e*.09,2093*(1+e%3*.25),.05,.3)}lose(){if(!this.ctx)return;let e=this.now();[440,349.23,293.66].forEach((t,n)=>this.tone(e+n*.26,{type:`triangle`,freq:t,gain:.13,attack:.01,decay:.4}));for(let t of[146.83,220,293.66,349.23])this.tone(e+.8,{type:`triangle`,freq:t,gain:.06,attack:.05,sustain:.4,decay:1.1})}ui(e){if(!this.ctx)return;let t=this.now();if(e===`move`){if(t-this.lastUi<.035)return;this.lastUi=t,this.tone(t,{type:`sine`,freq:1320,freqEnd:1500,gain:.07,decay:.045})}else e===`select`?(this.tone(t,{type:`sine`,freq:880,gain:.12,decay:.07}),this.tone(t+.055,{type:`sine`,freq:1318.5,gain:.12,decay:.12}),this.tone(t,{type:`triangle`,freq:440,gain:.04,decay:.08})):e===`back`?(this.tone(t,{type:`sine`,freq:990,gain:.1,decay:.06}),this.tone(t+.05,{type:`sine`,freq:660,gain:.1,decay:.1})):(this.tone(t,{type:`square`,freq:150,gain:.05,decay:.12}),this.tone(t+.08,{type:`square`,freq:120,gain:.05,decay:.14}))}slowMo(e){if(!this.ctx)return;let t=this.ctx,n=this.now(),r=()=>{let e=this.slowPulse;e&&(this.slowPulse=null,e.env.gain.cancelScheduledValues(n),e.env.gain.setValueAtTime(Math.max(1e-4,e.env.gain.value),n),e.env.gain.linearRampToValueAtTime(1e-4,n+.12),e.stop(n+.14))};if(e){r(),this.tone(n,{type:`sine`,freq:520,freqEnd:48,gain:.3,attack:.01,decay:.7}),this.tone(n,{type:`triangle`,freq:260,freqEnd:40,gain:.12,attack:.02,decay:.6}),this.noiseBurst(n,{type:`bandpass`,freq:2400,freqEnd:140,q:.9,gain:.12,attack:.04,decay:.55,pink:!0});let e=t.createGain();e.gain.setValueAtTime(1e-4,n),e.gain.linearRampToValueAtTime(1,n+.5);let i=t.createOscillator();i.type=`sine`,i.frequency.value=58;let a=t.createGain();a.gain.value=.045;let o=t.createOscillator();o.type=`sine`,o.frequency.value=1.2;let s=t.createGain();s.gain.value=.045,o.connect(s).connect(a.gain),i.connect(a).connect(e).connect(this.sfxGain),i.start(n),o.start(n),i.onended=()=>{for(let t of[i,o,a,s,e])t.disconnect()},this.slowPulse={env:e,stop:e=>{i.stop(e),o.stop(e)}}}else{let e=!!this.slowPulse;if(r(),!e)return;this.tone(n,{type:`sine`,freq:90,freqEnd:640,gain:.2,attack:.01,decay:.2}),this.noiseBurst(n,{type:`bandpass`,freq:200,freqEnd:3200,q:.9,gain:.08,attack:.02,decay:.2,pink:!0})}}music(e){this.wantTrack=e,this.musicEngine?.play(e)}muffleMusic(e){this.musicEngine?.muffle(e)}},Zp=class{sensitivity=1;enabled=!0;o;phase=`idle`;onsetTime=0;peakVal=0;peakTime=0;fireTime=-1e9;droppedSinceFire=!0;constructor(e={}){this.o={on:e.on??.26,off:e.off??.14,drop:e.drop??.78,refractoryMs:e.refractoryMs??250,rearmMs:e.rearmMs??550,maxRiseMs:e.maxRiseMs??160,minPower:e.minPower??.12}}get swinging(){return this.phase===`rising`}reset(){this.phase=`idle`,this.peakVal=0,this.droppedSinceFire=!0}powerOf(e){let{on:t,minPower:n}=this.o,r=(e-t)/(1-t);return Math.max(0,Math.min(1,n+(1-n)*Math.max(0,r)**.85))}push(e,t){let n=Math.max(0,t)*this.sensitivity,r=this.o,i={newMax:!1,fired:null};if(this.phase===`refractory`){n<r.off&&(this.droppedSinceFire=!0);let t=e-this.fireTime;if(t>=r.refractoryMs&&(this.droppedSinceFire||t>=r.rearmMs))this.phase=`idle`;else return i}if(this.phase===`idle`)return!this.enabled||n<r.on||(this.phase=`rising`,this.onsetTime=e,this.peakVal=n,this.peakTime=e,i.newMax=!0),i;if(n>this.peakVal&&(this.peakVal=n,this.peakTime=e,i.newMax=!0,e-this.onsetTime<r.maxRiseMs))return i;if(n<this.peakVal*r.drop||n<r.off||e-this.onsetTime>=r.maxRiseMs){if(this.phase=`refractory`,this.fireTime=e,this.droppedSinceFire=n<r.off,!this.enabled)return i;i.fired={time:this.peakTime,power:this.powerOf(this.peakVal),peak:this.peakVal}}return i}},Qp=Math.PI/180,$p=new jt().setFromAxisAngle(new V(1,0,0),-Math.PI/2);$p.clone().invert();var em=new V,tm=new jt;function nm(e){let t=em.set(0,0,-1).applyQuaternion(e);if(Math.abs(t.y)>.92){let t=new V(1,0,0).applyQuaternion(e);return Math.atan2(-t.z,t.x)}return Math.atan2(-t.x,-t.z)}function rm(e,t=new jt){return t.setFromAxisAngle(em.set(0,1,0),e)}function im(e){let t=new V(0,0,-1).applyQuaternion(e),n=new V(0,1,0).applyQuaternion(e),r=t.z>.35,i=r?t.negate():t;return{aim:Math.hypot(i.x,i.z)>.2?Math.atan2(i.x,-i.z):-nm(e),face:Math.asin(Math.max(-1,Math.min(1,i.y))),lean:Math.atan2(-n.x,Math.max(.001,Math.hypot(n.y,n.z))),flipped:r}}function am(e,t,n,r=new jt){return r.setFromAxisAngle(em.set(0,1,0),-e),tm.setFromAxisAngle(em.set(1,0,0),t),r.multiply(tm),tm.setFromAxisAngle(em.set(0,0,1),n),r.multiply(tm)}function om(e,t,n,r=new V){let i=tm.copy(e).invert().premultiply(t);i.w<0&&i.set(-i.x,-i.y,-i.z,-i.w);let a=Math.sqrt(Math.max(0,1-i.w*i.w)),o=2*Math.atan2(a,i.w);if(a<1e-9||n<=0)return r.set(0,0,0);let s=o/(a*n);return r.set(i.x*s,i.y*s,i.z*s)}var sm=(e,t,n)=>e<t?t:e>n?n:e,cm=.55,lm=-.5,um=9,dm=.55,fm=.6,pm=class{el;kind=`mouse`;state={connected:!0,orientation:new jt,aimX:0,aimY:0,face:0,backhand:!1,swing:0};handedness;swingEnabled=!0;swingCbs=new Set;buttonCbs=new Set;detector=new Zp({on:.36,off:.18,drop:.7,maxRiseMs:120,minPower:.2});samples=[];px=0;py=0;hasPointer=!1;ax=0;ay=0;face=0;speed=0;vx=0;vy=0;swingLevel=0;rightHeld=!1;shift=!1;ctrl=!1;backhand=!1;centerX=0;centerY=0;preFlick=null;lastSwingAt=-1e9;ac=new AbortController;constructor(e,t={}){this.el=e,this.handedness=t.handedness??`right`;let n={signal:this.ac.signal};window.addEventListener(`pointermove`,e=>this.onMove(e),{...n,passive:!0}),e.addEventListener(`pointerdown`,e=>this.onDown(e),n),window.addEventListener(`pointerup`,e=>this.onUp(e),n),window.addEventListener(`blur`,()=>this.clearHeld(),n),e.addEventListener(`contextmenu`,e=>e.preventDefault(),n),window.addEventListener(`keydown`,e=>this.onKey(e,!0),n),window.addEventListener(`keyup`,e=>this.onKey(e,!1),n)}setHandedness(e){this.handedness=e}setSensitivity(e){this.detector.sensitivity=sm(e,.25,4)}setSwingEnabled(e){this.swingEnabled=e,this.detector.enabled=e,e||this.detector.reset()}onSwing(e){return this.swingCbs.add(e),()=>this.swingCbs.delete(e)}onButton(e){return this.buttonCbs.add(e),()=>this.buttonCbs.delete(e)}recenter(){if(this.hasPointer){let e=this.el.getBoundingClientRect(),t=this.samples[this.samples.length-1];t&&(this.centerX=sm((t.x-(e.left+e.width/2))/(e.width*.4),-.6,.6),this.centerY=sm(-(t.y-(e.top+e.height/2))/(e.height*.4),-.6,.6))}else this.centerX=this.centerY=0}vibrate(){}dispose(){this.ac.abort(),this.swingCbs.clear(),this.buttonCbs.clear()}emitButton(e){for(let t of this.buttonCbs)t(e)}onMove(e){let t=this.el.getBoundingClientRect();if(t.width<1||t.height<1)return;let n=typeof e.getCoalescedEvents==`function`?e.getCoalescedEvents():[],r=n.length?n:[e];for(let e of r)this.samples.push({t:e.timeStamp||performance.now(),x:e.clientX,y:e.clientY});let i=this.samples[this.samples.length-1].t;for(;this.samples.length>2&&i-this.samples[0].t>80;)this.samples.shift();this.hasPointer=!0,this.px=sm((e.clientX-(t.left+t.width/2))/(t.width*.4)-this.centerX,-1,1),this.py=sm(-(e.clientY-(t.top+t.height/2))/(t.height*.4)-this.centerY,-1,1);let a=this.samples[0],o=this.samples[this.samples.length-1],s=(o.t-a.t)/1e3;s>.004&&(this.vx=(o.x-a.x)/t.height/s,this.vy=-(o.y-a.y)/t.height/s,this.speed=Math.hypot(this.vx,this.vy));let c=this.vy>0&&this.vy>Math.abs(this.vx)*.6?this.vy/um:0;!this.detector.swinging&&c<.2&&(this.preFlick=null),c>.15&&!this.preFlick&&(this.preFlick=this.makeState());let l=this.detector.push(i,c);l.fired&&this.fireSwing(l.fired.power,l.fired.time),this.swingLevel=Math.max(this.swingLevel,sm(this.speed/um,0,1))}onDown(e){e.button===2?this.rightHeld=!0:e.button===0&&e.pointerType!==`touch`&&this.swingEnabled&&(this.preFlick=null,this.fireSwing(sm(dm+this.speed/um*.45,0,1),performance.now()))}onUp(e){e.button===2&&(this.rightHeld=!1)}clearHeld(){this.rightHeld=this.shift=this.ctrl=!1}onKey(e,t){if(this.shift=e.shiftKey,this.ctrl=e.ctrlKey||e.altKey,!t)return;let n=e.target;if(n&&(n.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(n.tagName))||e.repeat&&!e.key.startsWith(`Arrow`))return;let r=t=>{e.preventDefault(),this.emitButton(t)};switch(e.key){case`ArrowUp`:return r(`up`);case`ArrowDown`:return r(`down`);case`ArrowLeft`:return r(`left`);case`ArrowRight`:return r(`right`);case`Enter`:return r(`action`);case`Backspace`:return r(`back`);case`Escape`:return r(this.swingEnabled?`pause`:`back`);case`p`:case`P`:return r(`pause`);case`e`:case`E`:return e.metaKey||e.ctrlKey||e.altKey?void 0:r(`power`);case`r`:case`R`:return e.metaKey||e.ctrlKey?void 0:(this.recenter(),r(`recenter`));case` `:e.preventDefault(),this.swingEnabled?this.fireSwing(sm(fm+this.speed/um*.4,0,1),performance.now()):this.emitButton(`action`);return;default:return}}fireSwing(e,t){if(!this.swingEnabled)return;let n=performance.now();if(n-this.lastSwingAt<200)return;this.lastSwingAt=n;let r=this.preFlick??this.makeState();this.preFlick=null,r.swing=Math.max(r.swing,e),this.swingLevel=Math.max(this.swingLevel,e);let i=sm(this.vx/um,-.6,.6),a=sm(-r.face*.8+this.vy/um*.25,-.7,.8),o=Math.hypot(i,a,1),s={time:t,power:e,dir:{x:i/o,y:a/o,z:1/o},paddle:r};for(let e of this.swingCbs)e(s)}makeState(){let e={...this.state,orientation:this.state.orientation.clone()};return e.aimX=this.px,e.aimY=this.py,this.applyOrientation(e),e}applyOrientation(e){let t=this.handedness===`right`?1:-1,n=e.backhand?55*Qp*t:-e.aimX*12*Qp*t;am(e.aimX*50*Qp,e.face+e.aimY*10*Qp,n,e.orientation)}update(e){e=sm(e,0,.1);let t=1-Math.exp(-e/.03);this.ax+=(this.px-this.ax)*t,this.ay+=(this.py-this.ay)*t;let n=this.rightHeld||this.shift?cm:this.ctrl?lm:0;this.face+=(n-this.face)*(1-Math.exp(-e/.06)),this.speed*=Math.exp(-e/.08),this.vx*=Math.exp(-e/.08),this.vy*=Math.exp(-e/.08),this.swingLevel*=Math.exp(-e/.15);let r=this.handedness===`right`?1:-1,i=this.ax*r;this.backhand=this.backhand?i<-.08:i<-.18;let a=this.state;a.connected=!0,a.aimX=this.ax,a.aimY=this.ay,a.face=this.face,a.backhand=this.backhand,a.swing=sm(this.swingLevel,0,1),this.applyOrientation(a)}},mm=1397050930,hm=[`action`,`pause`,`recenter`,`up`,`down`,`left`,`right`,`back`,`power`];function gm(e,t,n){let r=Math.PI/360,i=(e||0)*r,a=(t||0)*r,o=(n||0)*r,s=Math.cos(i),c=Math.sin(i),l=Math.cos(a),u=Math.sin(a),d=Math.cos(o),f=Math.sin(o);return{x:u*d*s-l*f*c,y:l*f*s+u*d*c,z:l*d*c+u*f*s,w:l*d*s-u*f*c}}function _m(e){let{x:t,y:n,z:r,w:i}=e,a=1-2*(n*n+r*r),o=2*(t*n-i*r),s=2*(t*n+i*r),c=1-2*(t*t+r*r),l=2*(t*r-i*n),u=2*(n*r+i*t),d=1-2*(t*t+n*n),f=Math.asin(Math.max(-1,Math.min(1,-l))),p,m;Math.abs(l)<.9999999?(p=Math.atan2(u,d),m=Math.atan2(s,a)):(p=0,m=Math.atan2(-o,c));let h=180/Math.PI;return gm(m*h,p*h,f*h)}var vm=e=>Number.isFinite(e)?e:0;function ym(e,t={}){let n;if(e instanceof ArrayBuffer)n=new DataView(e);else if(ArrayBuffer.isView(e))n=new DataView(e.buffer,e.byteOffset,e.byteLength);else return null;if(n.byteLength<40)return null;let r=n.getUint32(0,!0),i=r===mm;if(!i&&r!==1397050929||i&&n.byteLength<56)return null;let a={x:vm(n.getFloat32(12,!0)),y:vm(n.getFloat32(16,!0)),z:vm(n.getFloat32(20,!0)),w:vm(n.getFloat32(24,!0))},o=Math.hypot(a.x,a.y,a.z,a.w);return a=o<1e-6?{x:0,y:0,z:0,w:1}:{x:a.x/o,y:a.y/o,z:a.z/o,w:a.w/o},!i&&t.repairLegacy!==!1&&(a=_m(a)),{seq:n.getUint32(4,!0),t:n.getUint32(8,!0),q:a,acc:{x:vm(n.getFloat32(28,!0)),y:vm(n.getFloat32(32,!0)),z:vm(n.getFloat32(36,!0))},gyro:i?{alpha:vm(n.getFloat32(40,!0)),beta:vm(n.getFloat32(44,!0)),gamma:vm(n.getFloat32(48,!0))}:{alpha:0,beta:0,gamma:0},buttons:i?n.getUint32(52,!0):0}}function bm(e,t){return t-e|0}var xm=50*Qp,Sm=45*Qp,Cm=35*Qp,wm=22*Qp,Tm=18,Em=32,Dm=25,Om=1,km=.7,Am=1.6,jm=1e3,Mm=350;function Nm(){return{connected:!1,orientation:new jt,aimX:0,aimY:0,face:0,backhand:!1,swing:0}}function Pm(e){return{...e,orientation:e.orientation.clone()}}var Fm=class{link;kind=`phone`;state=Nm();_calibration=0;get calibration(){return this._calibration}handedness;detector=new Zp({on:.21,off:.12});swingCbs=new Set;buttonCbs=new Set;unsubs=[];hasPose=!1;calibrated=!1;qRaw=new jt;offset=new jt;RmeasPrev=new jt;Rmeas=new jt;yo=new jt;R=new jt;Rprev=new jt;omega=new V;accWorld=new V;gravity=new V;linVel=new V;gravityInit=!1;lastSeq=-1;lastT=0;lastPacketAt=-1e9;speedRad=0;accelMag=0;swingLevel=0;lastIntensity=0;stillFor=0;isBackhand=!1;peakSnapshot=null;prevMask=0;pending=[];now;constructor(e,t){this.link=e,this.handedness=t.handedness,this.detector.sensitivity=sm(t.sensitivity,.25,4),this.now=t.now??(()=>performance.now()),this.unsubs.push(e.on(`packet`,e=>this.onPacket(e)),e.on(`message`,e=>this.onMessage(e)),e.on(`status`,e=>this.onStatus(e)))}setHandedness(e){this.handedness=e}setSensitivity(e){this.detector.sensitivity=sm(e,.25,4)}setSwingEnabled(e){this.detector.enabled=e,e||this.detector.reset()}beginCalibration(){this.calibrated=!1,this._calibration=0,this.stillFor=0}onSwing(e){return this.swingCbs.add(e),()=>this.swingCbs.delete(e)}onButton(e){return this.buttonCbs.add(e),()=>this.buttonCbs.delete(e)}recenter(){if(!this.hasPose){this.calibrated=!0,this._calibration=1;return}let e=new jt().copy($p).multiply(this.qRaw);rm(-nm(e),this.yo),this.offset.copy(e.premultiply(this.yo)).invert(),this.computeR(this.R),this.Rprev.copy(this.R),this.RmeasPrev.copy(this.R),this.calibrated=!0,this._calibration=1,this.stillFor=0}vibrate(e){this.link.send({t:`haptic`,pattern:e})}dispose(){for(let e of this.unsubs)e();this.unsubs=[],this.swingCbs.clear(),this.buttonCbs.clear()}onStatus(e){e!==`connected`&&(this.detector.reset(),this.prevMask=0)}onMessage(e){e.t===`hello`?((e.hand===`left`||e.hand===`right`)&&(this.handedness=e.hand),this.lastSeq=-1,this.hasPose=!1,this.gravityInit=!1,this.beginCalibration()):e.t===`button`&&this.fireButton(e.b,`msg`)}fireButton(e,t){let n=this.now();this.pending=this.pending.filter(e=>n-e.at<Mm);let r=this.pending.findIndex(n=>n.b===e&&n.src!==t);if(r>=0)this.pending.splice(r,1);else{this.pending.push({b:e,src:t,at:n}),e===`recenter`&&this.recenter();for(let t of this.buttonCbs)t(e)}}computeR(e){return e.copy($p).multiply(this.qRaw).multiply(this.offset).premultiply(this.yo)}cam=null;camAt=-1/0;onPacket(e){let t=this.now();if(e.cam&&(this.cam=e.cam,this.camAt=t),this.lastSeq>=0){let t=bm(this.lastSeq,e.seq);if(t<=0&&t>-2e3)return}let n=this.lastSeq>=0?(e.t-this.lastT>>>0)/1e3:0;(!(n>0)||n>.25)&&(n=this.lastSeq>=0?.016:0),this.lastSeq=e.seq,this.lastT=e.t,this.lastPacketAt=t;let r=new jt(e.q.x,e.q.y,e.q.z,e.q.w);if(r.lengthSq()<1e-6)return;r.normalize();let i=e.gyro,a=Math.hypot(i.alpha,i.beta,i.gamma)*Qp;if(!this.hasPose)this.qRaw.copy(r),this.hasPose=!0,this.calibrated||(this.offset.identity(),this.yo.identity(),this.computeR(this.R),rm(-nm(this.R),this.yo)),this.computeR(this.R),this.Rprev.copy(this.R),this.RmeasPrev.copy(this.R);else{this.qRaw.dot(r)<0&&r.set(-r.x,-r.y,-r.z,-r.w);let e=2*Math.acos(Math.min(1,Math.abs(this.qRaw.dot(r)))),t=2.5+2*Math.max(a,n>0?e/n:0),i=1/(2*Math.PI*t),o=n>0?n/(n+i):1;this.qRaw.slerp(r,o),this.Rprev.copy(this.R),this.computeR(this.R)}this.Rmeas.copy($p).multiply(r).multiply(this.offset).premultiply(this.yo),n>0?om(this.RmeasPrev,this.Rmeas,n,this.omega):this.omega.set(0,0,0),this.RmeasPrev.copy(this.Rmeas);let o=this.omega.length();this.speedRad=a>.01?a:o;let s=new V(e.acc.x,e.acc.y,e.acc.z);this.gravityInit?n>0&&this.gravity.lerp(s,Math.min(1,n/.6)):(this.gravity.copy(s),this.gravityInit=!0);let c=s.sub(this.gravity);this.accelMag=c.length(),this.accWorld.copy(c).applyQuaternion(new jt().copy($p).multiply(this.qRaw)).applyQuaternion(this.yo),n>0&&this.linVel.multiplyScalar(Math.exp(-n/.15)).addScaledVector(this.accWorld,n);let l=Math.max(this.speedRad/Tm,this.accelMag/Em*.85);this.lastIntensity=l;let u=sm(l*this.detector.sensitivity,0,1);this.swingLevel=Math.max(this.swingLevel,u);{let e=this.detector.push(t,l);if(e.newMax&&(this.peakSnapshot={paddle:this.snapshot(),dir:this.swingDir()}),e.fired&&this.peakSnapshot){let t={time:e.fired.time,power:e.fired.power,dir:this.peakSnapshot.dir,paddle:{...this.peakSnapshot.paddle,swing:Math.max(this.peakSnapshot.paddle.swing,e.fired.power)}};this.peakSnapshot=null;for(let e of this.swingCbs)e(t)}}let d=e.buttons>>>0,f=d&~this.prevMask;if(this.prevMask=d,f)for(let e=0;e<hm.length;e++)f&1<<e&&this.fireButton(hm[e],`mask`)}swingDir(){let e=this.handedness===`right`?1:-1,t=new V(.8*(this.isBackhand?-e:e),.05,-.45).normalize(),n=new V().crossVectors(this.omega,t);n.lengthSq()>1e-6&&n.normalize();let r=this.linVel.clone(),i=Math.min(1,r.length()/.6);return r.lengthSq()>1e-6&&n.addScaledVector(r.normalize(),.6*i),n.lengthSq()<1e-6&&n.set(0,0,-1),n.normalize(),{x:n.x,y:n.y,z:-n.z}}snapshot(){return this.fillState(this.state),Pm(this.state)}fillState(e){let t=im(this.R);if(e.orientation.copy(this.R),e.aimX=sm(t.aim/xm,-1,1),this.cam&&this.now()-this.camAt<400){let t=sm((this.cam.x-this.cam.sx)/(this.cam.scale*1.4),-1,1);e.aimX=sm(e.aimX*.4+t*.6,-1,1)}e.face=sm(t.face,-1.3,1.3),e.aimY=sm(t.face/Sm,-1,1);let n=this.handedness===`right`?1:-1,r=t.lean*n;this.isBackhand=this.isBackhand?r>wm||t.flipped:r>Cm||t.flipped,e.backhand=this.isBackhand,e.swing=sm(this.swingLevel,0,1),e.connected=this.link.status===`connected`&&this.now()-this.lastPacketAt<jm}update(e){if(e=sm(e,0,.1),this.swingLevel*=Math.exp(-e/.12),this.now()-this.lastPacketAt>jm&&(this.swingLevel=0),this.hasPose){let t=this.speedRad<km&&this.accelMag<Am;if(!this.calibrated){let n=new V(0,1,0).applyQuaternion(new jt().copy($p).multiply(this.qRaw)).y>.8;t&&n?(this.stillFor+=e,this._calibration=sm(this.stillFor/Om,0,1),this.stillFor>=Om&&this.recenter()):(this.stillFor=Math.max(0,this.stillFor-e*3),this._calibration=sm(this.stillFor/Om,0,1))}else if(!this.detector.swinging&&this.speedRad<3){let t=im(this.R);if(Math.abs(t.face)<60*Qp){let t=1-Math.exp(-e/Dm),n=rm(-nm(this.R)*t);this.yo.premultiply(n),this.R.premultiply(n),this.RmeasPrev.premultiply(n)}}}this.fillState(this.state)}get intensity(){return this.lastIntensity}},Im=[{urls:`stun:stun.l.google.com:19302`}],Lm=`spinshot.room`,Rm=1e3,zm=15e3,Bm=3500;function Vm(){return typeof location>`u`?`ws://localhost:8080/signal`:`${location.protocol===`https:`?`wss:`:`ws:`}//${location.host}/signal`}var Hm=class{pin=``;status=`idle`;transport=`none`;latencyMs=0;packetRate=0;signalUrl;listeners={status:new Set,packet:new Set,message:new Set};ws=null;token=``;resume=``;savedPin=``;stopped=!0;peerPresent=!1;pc=null;control=null;pendingCandidates=[];remoteSet=!1;relaySeen=!1;lastRx=0;detail;retry=0;reconnectTimer=null;tickTimer=null;keepaliveTimer=null;lastPing=0;rateCount=0;rateT0=0;startWaiters=[];info=null;storageKey;constructor(e={}){this.storageKey=e.storageKey??Lm,this.signalUrl=e.signalUrl??Vm();try{let e=JSON.parse(sessionStorage.getItem(this.storageKey)||`null`);e&&typeof e.pin==`string`&&typeof e.resume==`string`&&(this.savedPin=e.pin,this.resume=e.resume)}catch{}}on(e,t){return this.listeners[e].add(t),()=>{this.listeners[e].delete(t)}}emit(e,...t){for(let n of this.listeners[e])try{n(...t)}catch(e){console.error(`[PhoneLink] listener error`,e)}}setStatus(e,t,n){let r=n??this.transport;(e!==this.status||t!==this.detail||r!==this.transport)&&(this.status=e,this.detail=t,this.transport=r,this.emit(`status`,e,t))}start(){let e=new Promise((e,t)=>{this.pin&&this.ws&&this.ws.readyState===WebSocket.OPEN?e():this.startWaiters.push({res:e,rej:t})});return this.stopped&&(this.stopped=!1,this.retry=0,this.connect(),this.tickTimer=setInterval(()=>this.tick(),250),setTimeout(()=>this.settleStart(Error(`Could not reach the SPINSHOT server`)),8e3)),e}settleStart(e){let t=this.startWaiters.splice(0);for(let n of t)e?n.rej(e):n.res()}stop(){this.stopped=!0,this.reconnectTimer&&clearTimeout(this.reconnectTimer),this.tickTimer&&clearInterval(this.tickTimer),this.keepaliveTimer&&clearInterval(this.keepaliveTimer),this.reconnectTimer=this.tickTimer=this.keepaliveTimer=null,this.closePeer();let e=this.ws;if(this.ws=null,e){e.onclose=e.onmessage=e.onerror=e.onopen=null;try{e.close()}catch{}}this.peerPresent=!1,this.latencyMs=0,this.setStatus(`idle`,void 0,`none`),this.settleStart(Error(`stopped`))}serverInfo(){return this.info||=fetch(`/api/info`,{cache:`no-store`}).then(e=>e.ok?e.json():null).catch(()=>null),this.info}async controllerUrl(){let e=this.pin?`?pin=${this.pin}`:``,t=await this.serverInfo();if(t&&t.httpsPort){let n=t.lanIps&&t.lanIps.length?t.lanIps[0]:typeof location<`u`?location.hostname:`localhost`;return`https://${n.includes(`:`)?`[${n}]`:n}:${t.httpsPort}/controller.html${e}`}return`${typeof location<`u`?location.origin:`http://localhost:8080`}/controller.html${e}`}send(e){this.sendControl(e)}sendControl(e){if(this.control&&this.control.readyState===`open`)try{return this.control.send(JSON.stringify(e)),!0}catch{}return this.peerPresent?this.sendSignal({type:`relay`,payload:e}):!1}sendSignal(e){let t=this.ws;return!t||t.readyState!==WebSocket.OPEN?!1:(t.send(JSON.stringify({...e,token:this.token})),!0)}connect(){if(this.stopped)return;this.status!==`disconnected`&&this.setStatus(`connecting`);let e;try{e=new WebSocket(this.signalUrl)}catch(e){this.setStatus(`error`,`Bad signalling URL: ${e.message}`,`none`),this.scheduleReconnect();return}e.binaryType=`arraybuffer`,this.ws=e,e.onopen=()=>{this.retry=0;let t=this.pin||this.savedPin;e.send(JSON.stringify({type:`create_room`,pin:t||void 0,resume:this.resume||void 0})),this.keepaliveTimer&&clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>this.sendSignal({type:`ping`}),zm)},e.onmessage=e=>{if(typeof e.data==`string`){let t;try{t=JSON.parse(e.data)}catch{return}this.onSignal(t)}else e.data instanceof ArrayBuffer&&(this.onRelayActivity(),this.onBinary(e.data))},e.onerror=()=>{},e.onclose=()=>{this.ws===e&&(this.ws=null,this.token=``,this.keepaliveTimer&&clearInterval(this.keepaliveTimer),this.keepaliveTimer=null,!this.stopped&&(this.control&&this.control.readyState===`open`||(this.closePeer(),this.peerPresent=!1,this.setStatus(`disconnected`,`Lost connection to the server — retrying…`,`none`)),this.scheduleReconnect()))}}scheduleReconnect(){if(this.stopped||this.reconnectTimer)return;let e=Math.min(5e3,500*2**this.retry++);this.reconnectTimer=setTimeout(()=>{this.reconnectTimer=null,this.connect()},e)}persist(){try{sessionStorage.setItem(this.storageKey,JSON.stringify({pin:this.pin,resume:this.resume}))}catch{}}onSignal(e){switch(e.type){case`joined`:this.token=String(e.token||``),this.pin=String(e.room||``),typeof e.resume==`string`&&(this.resume=e.resume),this.persist(),e.peer!==!0&&!(this.control&&this.control.readyState===`open`)&&this.setStatus(`waiting`,void 0,`none`),this.settleStart();break;case`peer_connected`:e.role===`controller`&&(this.peerPresent=!0,this.control&&this.control.readyState===`open`||this.setStatus(`pairing`,`Phone joined — connecting…`,`none`));break;case`peer_disconnected`:e.role===`controller`&&this.onPhoneGone();break;case`offer`:this.onOffer(String(e.sdp||``)).catch(e=>{console.warn(`[PhoneLink] offer failed`,e),this.setStatus(`pairing`,`WebRTC failed — waiting for relay…`,`none`)});break;case`candidate`:if(typeof e.name==`string`&&e.name){let t={candidate:e.name,sdpMid:e.media??null,sdpMLineIndex:e.index??null};this.pc&&this.remoteSet?this.pc.addIceCandidate(t).catch(()=>{}):this.pendingCandidates.push(t)}break;case`relay`:this.onRelayActivity(),e.payload&&typeof e.payload==`object`&&this.onControl(e.payload);break;case`room_expired`:this.closePeer(),this.peerPresent=!1,this.token=``,this.ws?.send(JSON.stringify({type:`create_room`,pin:this.pin||void 0,resume:this.resume}));break;case`error`:console.warn(`[PhoneLink] server error`,e.code,e.message),e.code===`already_joined`||e.code===`unauthorized`?this.ws?.close():this.pin||this.setStatus(`error`,String(e.message||e.code||`Server error`),`none`)}}onPhoneGone(){this.closePeer(),this.peerPresent=!1,this.latencyMs=0,this.setStatus(`waiting`,`Phone disconnected — scan again or reopen the controller`,`none`)}onRelayActivity(){this.relaySeen=!0,this.peerPresent=!0,this.control&&this.control.readyState===`open`||this.markConnected(`relay`)}markConnected(e){this.lastRx=performance.now(),(this.status!==`connected`||this.transport!==e)&&this.setStatus(`connected`,void 0,e)}closePeer(){let e=this.pc;if(this.pc=null,this.control=null,this.remoteSet=!1,this.pendingCandidates=[],this.relaySeen=!1,e){e.ondatachannel=e.onicecandidate=e.oniceconnectionstatechange=null;try{e.close()}catch{}}}async onOffer(e){if(typeof RTCPeerConnection>`u`)throw Error(`WebRTC unavailable`);this.closePeer(),this.peerPresent=!0;let t=new RTCPeerConnection({iceServers:Im});this.pc=t,t.onicecandidate=e=>{e.candidate&&this.sendSignal({type:`candidate`,media:e.candidate.sdpMid,index:e.candidate.sdpMLineIndex,name:e.candidate.candidate})},t.oniceconnectionstatechange=()=>{if(this.pc!==t)return;let e=t.iceConnectionState;(e===`failed`||e===`closed`)&&this.transport===`webrtc`&&(this.control=null,this.relaySeen?this.markConnected(`relay`):this.setStatus(`pairing`,`Direct connection lost — trying relay…`,`none`))},t.ondatachannel=e=>{if(this.pc!==t)return;let n=e.channel;n.binaryType=`arraybuffer`,n.label===`control`?(this.control=n,n.onopen=()=>this.markConnected(`webrtc`),n.onclose=()=>{this.control===n&&(this.control=null,this.relaySeen&&this.peerPresent?this.markConnected(`relay`):this.peerPresent&&this.setStatus(`pairing`,`Reconnecting to phone…`,`none`))},n.onmessage=e=>{if(typeof e.data==`string`)try{this.onControl(JSON.parse(e.data))}catch{}},n.readyState===`open`&&this.markConnected(`webrtc`)):(n.onmessage=e=>{e.data instanceof ArrayBuffer&&this.onBinary(e.data)},n.label===`sensor_data`&&(n.onopen=()=>this.markConnected(`webrtc`),n.readyState===`open`&&this.markConnected(`webrtc`)))},await t.setRemoteDescription({type:`offer`,sdp:e}),this.remoteSet=!0;for(let e of this.pendingCandidates.splice(0))await t.addIceCandidate(e).catch(()=>{});let n=await t.createAnswer();await t.setLocalDescription(n),this.sendSignal({type:`answer`,sdp:n.sdp})}onBinary(e){let t=ym(e);if(t){if(this.lastRx=performance.now(),this.rateCount++,this.status!==`connected`){let e=this.control?.readyState===`open`||this.pc?.connectionState===`connected`?`webrtc`:`relay`;this.markConnected(e)}this.emit(`packet`,t)}}onControl(e){if(this.lastRx=performance.now(),e.t===`pong`&&typeof e.ts==`number`){let t=performance.now()-e.ts;t>=0&&t<5e3&&(this.latencyMs=this.latencyMs?this.latencyMs*.8+t/2*.2:t/2)}else e.t===`ping`&&typeof e.ts==`number`?this.sendControl({t:`pong`,ts:e.ts}):(e.t===`hello`||e.t===`button`)&&(this.status!==`connected`&&this.markConnected(this.control?.readyState===`open`?`webrtc`:`relay`),this.emit(`message`,e))}tick(){let e=performance.now();e-this.rateT0>=1e3&&(this.packetRate=Math.round(this.rateCount*1e3/(e-this.rateT0||1e3)),this.rateCount=0,this.rateT0=e),this.peerPresent&&(e-this.lastPing>=Rm&&(this.lastPing=e,this.sendControl({t:`ping`,ts:e})),this.status===`connected`&&e-this.lastRx>Bm?this.setStatus(`pairing`,`Phone not responding…`,this.transport):this.status===`pairing`&&this.transport!==`none`&&e-this.lastRx<500&&this.setStatus(`connected`,void 0,this.transport))}},Um=[`action`,`pause`,`recenter`,`up`,`down`,`left`,`right`,`back`,`power`,`home`],Wm=()=>typeof window<`u`&&window.parent!==window;function Gm(e){let t={Space:` `,Escape:`Escape`,Enter:`Enter`}[e]??(e.startsWith(`Arrow`)?e:e.replace(/^Key|^Digit/,``).toLowerCase()),n=document.activeElement&&document.activeElement!==document.body?document.activeElement:window;for(let r of[`keydown`,`keyup`])n.dispatchEvent(new KeyboardEvent(r,{code:e,key:t,bubbles:!0,cancelable:!0}))}function Km({layout:e,title:t,stream:n,buttons:r,keys:i}={}){let a=typeof window<`u`&&window.parent!==window,o=new Map,s={connected:!1,transport:`none`,latency:0,pin:``,padUrl:``},c=e=>{a&&window.parent.postMessage({exemoo:1,...e},location.origin)},l=(e,t)=>{for(let n of o.get(e)||[])try{n(t)}catch(t){console.error(`[exemoo sdk] ${e} listener failed`,t)}};return a&&(window.addEventListener(`message`,e=>{if(e.source!==window.parent||e.origin!==location.origin)return;let t=e.data;t&&t.exemoo===1&&(t.type===`status`?(Object.assign(s,{connected:!!t.connected,transport:t.transport,latency:t.latency,pin:t.pin||``,padUrl:t.padUrl||``}),l(`status`,{...s})):t.type===`packet`?l(`packet`,t.p):t.type===`pose`?l(`pose`,t.pose):t.type===`camera`?l(`camera`,!!t.on):t.type===`button`?(i?.[t.b]&&Gm(i[t.b]),l(`button`,t.b)):t.type===`message`&&l(`message`,t.m))}),c({type:`ready`,layout:e,title:t,stream:n,buttons:r})),{inShell:a,phone:s,on(e,t){return o.has(e)||o.set(e,new Set),o.get(e).add(t),()=>o.get(e)?.delete(t)},held(e,t){let n=Um.indexOf(t);return n>=0&&!!(e.buttons&1<<n)},setLayout:(e,t,n)=>c({type:`layout`,layout:e,title:t,buttons:n}),setStream:e=>c({type:`stream`,on:!!e}),haptic:(e=20)=>c({type:`haptic`,pattern:e}),send:e=>c({type:`send`,m:e}),setCamera:e=>c({type:`camera`,on:!!e}),exit:()=>c({type:`exit`}),airCursor({active:e=()=>!0,speed:t=9}={}){let n=document.createElement(`div`);n.style.cssText=`position:fixed;left:0;top:0;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:5px solid #1b1b3a;background:#ffd21fcc;box-shadow:0 4px 0 #1b1b3a;pointer-events:none;z-index:99999;opacity:0;transition:opacity .25s,transform .05s`,document.body.append(n);let r=innerWidth/2,i=innerHeight/2,a=0,o=0,s=null,l=e=>{e!==s&&(s&&(s.style.outline=``),s=e,s&&(s.style.outline=`5px solid #ffd21f`,s.style.outlineOffset=`3px`,c({type:`haptic`,pattern:8})))};return this.on(`packet`,s=>{let c=a?Math.min(.1,(s.t-a>>>0||16)/1e3):0;if(a=s.t,!e())return n.style.opacity=`0`,l(null);let u=Math.abs(s.gyro.beta)>3?s.gyro.beta:0,d=Math.abs(s.gyro.alpha)>3?s.gyro.alpha:0;u||d?o=0:o+=c,r=Math.max(4,Math.min(innerWidth-4,r-u*c*t)),i=Math.max(4,Math.min(innerHeight-4,i-d*c*t)),n.style.transform=`translate(${r}px,${i}px)`,n.style.opacity=o<4?`1`:`0`,l(o<4?document.elementFromPoint(r,i)?.closest(`button, a, [role=button], input, select, [data-nav]`)??null:null)}),{hot:()=>s,center:()=>(r=innerWidth/2,i=innerHeight/2)}},nav(e,{skip:t=``}={}){let n=[...document.querySelectorAll(`button`)].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!==`hidden`&&!e.disabled&&!(t&&e.matches(t)));if(!n.length)return!1;let r=n.indexOf(document.activeElement);if(e===`action`)(r>=0?n[r]:n[0]).click();else if([`up`,`down`,`left`,`right`].includes(e)){let t=n[(r+(e===`up`||e===`left`?-1:1)+n.length)%n.length];t.focus(),t.scrollIntoView?.({block:`nearest`})}else return!1;return!0}}}var qm=class{constructor(){this.map=new Map}on(e,t){return this.map.has(e)||this.map.set(e,new Set),this.map.get(e).add(t),()=>this.map.get(e)?.delete(t)}emit(e,...t){for(let n of this.map.get(e)||[])try{n(...t)}catch(e){console.error(`[exemoo adapter]`,e)}}},Jm=class{constructor({layout:e=`swing`,title:t,buttons:n,buttonMap:r={},maskBits:i=null}={}){this.pin=``,this.status=`waiting`,this.transport=`none`,this.latencyMs=0,this.packetRate=0,this._l=new qm,this._count=0,this._url=``,this.sdk=Km({layout:e,title:t,buttons:n});let a=[`action`,`pause`,`recenter`,`up`,`down`,`left`,`right`,`back`,`power`,`home`],o=i?e=>{let t=0;return a.forEach((n,r)=>{e&1<<r&&i[n]!=null&&(t|=1<<i[n])}),t}:null;this.sdk.on(`status`,e=>{this.pin=e.pin,this._url=e.padUrl,this.latencyMs=e.latency||0;let t=e.connected?`connected`:`waiting`,n=e.connected?e.transport:`none`;(t!==this.status||n!==this.transport)&&(this.status=t,this.transport=n,this._l.emit(`status`,t))}),this.sdk.on(`packet`,e=>{this._count++,this._l.emit(`packet`,o?{...e,buttons:o(e.buttons)}:e)}),this.sdk.on(`button`,e=>this._l.emit(`message`,{t:`button`,b:r[e]??e})),this.sdk.on(`message`,e=>this._l.emit(`message`,e)),setInterval(()=>{this.packetRate=this._count,this._count=0},1e3)}on(e,t){return this._l.on(e,t)}start(){return Promise.resolve()}stop(){}async controllerUrl(){return this._url}send(e){e?.t===`haptic`?this.sdk.haptic(e.pattern):this.sdk.send(e)}},Ym=1/720,Xm=ad.radius,Zm=1.2,Qm=.5,$m=Math.PI*Xm*Xm,eh=.5*Zm*Qm*$m/ad.mass,th=.003,nh=.5*Zm*$m*.6/ad.mass,rh=Math.exp(-.25*Ym),ih=q.height,ah=q.height+q.netHeight,oh=sd+q.netOverhang,sh=.0015,ch=.012,lh=q.height-q.thickness,uh=.25,dh=.65,fh=.62,ph=.4,mh=.5,hh=.12,gh=.0012;function _h(e){return Math.min(.93,Math.max(.8,.93-.012*e))}var vh=8,yh=12,bh=15;function xh(){return{px:0,py:0,pz:0,vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,netTouch:!1,cordPass:!1,done:!1}}var Sh=0,Ch=0,wh=0;function Th(e,t,n,r,i,a){let o=e*e+t*t+n*n,s=eh*Math.sqrt(o),c=i*n-a*t,l=a*e-r*n,u=r*t-i*e,d=th,f=c*c+l*l+u*u;if(f>0){let e=d*Math.sqrt(f),t=nh*o;e>t&&(d*=t/e)}Sh=-s*e+d*c,Ch=-od-s*t+d*l,wh=-s*n+d*u}function Eh(e,t,n=t===.001388888888888889?rh:Math.exp(-.25*t)){Th(e.vx,e.vy,e.vz,e.wx,e.wy,e.wz);let r=t*.5,i=e.vx+Sh*r,a=e.vy+Ch*r,o=e.vz+wh*r;Th(i,a,o,e.wx,e.wy,e.wz),e.px+=i*t,e.py+=a*t,e.pz+=o*t,e.vx+=Sh*t,e.vy+=Ch*t,e.vz+=wh*t,e.wx*=n,e.wy*=n,e.wz*=n}var Dh=0,Oh=0,kh=0;function Ah(e,t,n,r,i,a,o,s,c){Dh=e<r?r:e>i?i:e,Oh=t<a?a:t>o?o:t,kh=n<s?s:n>c?c:n;let l=e-Dh,u=t-Oh,d=n-kh;return Math.sqrt(l*l+u*u+d*d)}var jh=e=>Ah(e.px,e.py,e.pz,-sd,sd,lh,ih,-J,J),Mh=e=>Ah(e.px,e.py,e.pz,-oh,oh,ih,ah,-.0015,sh),Nh=(e,t)=>t>0?Ah(e.px,e.py,e.pz,oh,oh+2*ch,ih-.03,ah+.01,-.012,ch):Ah(e.px,e.py,e.pz,-oh-2*ch,-oh,ih-.03,ah+.01,-.012,ch);function Ph(e,t,n,r,i,a,o){let s=e.vx*t+e.vy*n+e.vz*r;if(s>=0)return;let c=-Xm*t,l=-Xm*n,u=-Xm*r,d=e.vx+(e.wy*u-e.wz*l),f=e.vy+(e.wz*c-e.wx*u),p=e.vz+(e.wx*l-e.wy*c),m=d*t+f*n+p*r,h=d-m*t,g=f-m*n,_=p-m*r,v=Math.sqrt(h*h+g*g+_*_),y=e.vx-s*t,b=e.vy-s*n,x=e.vz-s*r,S=Math.sqrt(y*y+b*b+x*x),C=-(1+i)*s;if(e.vx+=C*t,e.vy+=C*n,e.vz+=C*r,v>1e-9){let t=Math.min(v/2.5,a*C),n=-h/v*t,r=-g/v*t,i=-_/v*t;e.vx+=n,e.vy+=r,e.vz+=i;let o=1.5/(Xm*Xm);e.wx+=(l*i-u*r)*o,e.wy+=(u*n-c*i)*o,e.wz+=(c*r-l*n)*o}if(o>0&&S>.05){let i=e.wx*t+e.wy*n+e.wz*r,a=y/S,s=b/S,c=x/S,l=n*c-r*s,u=r*a-t*c,d=t*s-n*a,f=o*i;e.vx+=l*f,e.vy+=u*f,e.vz+=d*f;let p=-.15*i;e.wx+=p*t,e.wy+=p*n,e.wz+=p*r}}function Fh(e,t,n,r,i,a){let o,s,c;t>1e-9?(o=(e.px-Dh)/t,s=(e.py-Oh)/t,c=(e.pz-kh)/t):(o=0,s=1,c=0);let l=e.vx*o+e.vy*s+e.vz*c,u=Xm-t;if(l>=0)return e.px+=o*u,e.py+=s*u,e.pz+=c*u,Ih.nx=o,Ih.ny=s,Ih.nz=c,Ih.vn=l,Ih.hit=!1,Ih;let d=Math.min(n,u/-l);return e.px-=e.vx*d,e.py-=e.vy*d,e.pz-=e.vz*d,Ph(e,o,s,c,r(-l),i,a),e.px+=e.vx*d,e.py+=e.vy*d,e.pz+=e.vz*d,Ih.nx=o,Ih.ny=s,Ih.nz=c,Ih.vn=l,Ih.hit=!0,Ih}var Ih={nx:0,ny:0,nz:0,vn:0,hit:!1},Lh=e=>Math.sqrt(e.vx*e.vx+e.vy*e.vy+e.vz*e.vz);function Rh(e,t){let n=Math.hypot(t.vx,t.vz),r=0;return n>.1&&(r=(t.wx*t.vz-t.wz*t.vx)/n*Xm/n),r=Math.max(-1,Math.min(1,r)),_h(e)*(1-.03*r)}function zh(e,t,n){let r=jh(e);if(r<Xm){if(e.py>ih&&Math.abs(e.px)<=sd&&Math.abs(e.pz)<=J){if(e.vy<-.06){let i=Lh(e),a=Math.min(t,(Xm-r)/-e.vy),o=e.px-e.vx*a,s=e.pz-e.vz*a,c=e,l=Xm*Math.hypot(e.wx,e.wz)/Math.max(Math.hypot(e.vx,e.vz),1);Fh(e,r,t,e=>Rh(e,c),uh*(1+.8*Math.min(1.5,l)),gh),n&&n(0,o,ih,s,i)}else e.py=ih+Xm,e.vy<0&&(e.vy=0),Bh(e,t,.4)}else{let i=Lh(e),a=Dh,o=Oh,s=kh,c=Fh(e,r,t,()=>dh,.3,0);c.hit&&c.ny>.1&&o>=ih-1e-6&&n&&n(1,a,o,s,i)}}let i=!1;if(r=Mh(e),r<Xm){i=!0;let a=Lh(e);if(!e.netTouch&&n&&n(2,e.px,e.py,e.pz,a),!e.cordPass){if(e.py>ah-.004){let t=(e.py-(ah-.004))/(Xm+.004),n=Math.sign(e.vz)||1;if(t>.3&&e.pz*n<0){let n=.15+.5*t;e.vz*=n,e.vx*=.7,e.vy=Math.max(e.vy,0)*.3+.9*t,e.wx*=.5,e.wy*=.6,e.wz*=.5,e.cordPass=!0}else(e.pz*n<0||Math.abs(e.pz)<=sh)&&(e.vz*=-.18,e.vx*=.6,e.vy=e.vy*.4+.3*t,e.wx*=.5,e.wy*=.6,e.wz*=.5,e.pz=-n*Math.max(Math.abs(e.pz),Math.sqrt(Math.max(0,Xm*Xm-(e.py-ah)**2))+sh))}else Fh(e,r,t,()=>hh,0,0),e.vx*=.35,e.vy*=.35,e.vz*=.6,e.wx*=.4,e.wy*=.4,e.wz*=.4}}else e.cordPass=!1;for(let a of[1,-1])if(r=Nh(e,a),r<Xm){let a=Lh(e);!e.netTouch&&!i&&n&&n(2,e.px,e.py,e.pz,a),Fh(e,r,t,()=>mh,.2,0),i=!0}if(e.netTouch=i,e.py<Xm){if(e.vy<-.3){let r=Lh(e),i=Math.min(t,(Xm-e.py)/-e.vy),a=e.px-e.vx*i,o=e.pz-e.vz*i;Dh=e.px,Oh=0,kh=e.pz,Fh(e,e.py,t,()=>fh,ph,0),n&&n(3,a,0,o,r)}else e.py=Xm,e.vy<0&&(e.vy=0),Bh(e,t,.8),Math.hypot(e.vx,e.vz)<.03&&(e.vx=0,e.vz=0,e.vy=0,e.done=!0)}}function Bh(e,t,n){let r=Math.hypot(e.vx,e.vz);if(r<1e-6)return;let i=Math.max(0,1-n*t/r);e.vx*=i,e.vz*=i,e.wx=e.vz/Xm,e.wz=-e.vx/Xm}function Vh(e,t){if(e.py-Xm<t)return!0;let n=Xm+t;return jh(e)<n||Math.abs(e.pz)<n+ch&&e.py<ah+n+.01&&(Mh(e)<n||Nh(e,1)<n||Nh(e,-1)<n)}var Hh=.004;function Uh(e,t){if(e.done)return;let n=Lh(e),r=n*Ym;if(Vh(e,r+.01)){let n=Math.min(64,Math.max(1,Math.ceil(r/Hh))),i=Ym/n,a=Math.exp(-.25*i);for(let r=0;r<n&&!e.done;r++)Eh(e,i,a),zh(e,i,t)}else Eh(e,Ym,rh),e.netTouch=!1;!e.done&&(Math.abs(e.px)>vh||Math.abs(e.pz)>yh||e.py>bh)&&(e.done=!0,t&&t(4,e.px,e.py,e.pz,n))}var Wh={landed:!1,x:0,z:0,t:0,netY:NaN,netX:NaN};function Gh(e,t,n){let r=Wh;r.landed=!1,r.netY=NaN,r.netX=NaN,r.t=0;let i=e.py>=t,a=Math.ceil(n/Ym);for(let n=0;n<a;n++){let a=e.px,o=e.py,s=e.pz;if(Eh(e,Ym,rh),Number.isNaN(r.netY)&&s<0!=e.pz<0&&s!==0){let t=s/(s-e.pz);r.netY=o+(e.py-o)*t,r.netX=a+(e.px-a)*t}if(e.py<t&&e.vy<0&&i){let i=(o-t)/(o-e.py);return r.x=a+(e.px-a)*i,r.z=s+(e.pz-s)*i,r.t=(n+i)*Ym,r.landed=!0,r}e.py>=t&&(i=!0)}return r.t=n,r.x=e.px,r.z=e.pz,r}function Kh(e,t=xh()){return t.px=e.pos.x,t.py=e.pos.y,t.pz=e.pos.z,t.vx=e.vel.x,t.vy=e.vel.y,t.vz=e.vel.z,t.wx=e.spin.x,t.wy=e.spin.y,t.wz=e.spin.z,t.netTouch=!1,t.cordPass=!1,t.done=!1,t}function qh(e,t,n,r,i){let a=new V(t,n,r);switch(e){case 0:return{type:`bounce`,side:ud(r),pos:a,speed:i};case 1:return{type:`edge`,side:ud(r),pos:a};case 2:return{type:`net`,pos:a,speed:i};case 3:return{type:`floor`,pos:a,speed:i};default:return{type:`out`,pos:a}}}var Jh=class{state={pos:new V(0,1,0),vel:new V,spin:new V};body=xh();acc=0;events=[];sink=(e,t,n,r,i)=>{this.events.push(qh(e,t,n,r,i))};constructor(){Kh(this.state,this.body)}set(e,t,n){this.state.pos.copy(e),this.state.vel.copy(t),this.state.spin.copy(n),Kh(this.state,this.body),this.acc=0}get settled(){return this.body.done}step(e){this.events=[],this.acc+=Math.min(Math.max(e,0),.1);let t=this.body;for(;this.acc>=Ym-1e-9;)this.acc-=Ym,Uh(t,this.sink);this.acc<0&&(this.acc=0);let n=this.state;return n.pos.set(t.px,t.py,t.pz),n.vel.set(t.vx,t.vy,t.vz),n.spin.set(t.wx,t.wy,t.wz),this.events}};function Yh(e,t,n,r,i){let a=Kh(e),o=!1,s=0,c=(e,t,n,r,a)=>{o||i({type:e,x:t,y:n,z:r,speed:a,t:s+.001388888888888889})&&(o=!0)};if(r(0,a))return;let l=Math.ceil(t/Ym);for(let e=1;e<=l;e++){if(Uh(a,c),s=e*Ym,o||a.done){r(s,a);return}if(e%n===0&&r(s,a))return}}function Xh(e,t,n=1/120){let r=Math.max(1,Math.round(n/Ym)),i=[],a=0,o=0;return Yh(e,t,r,(e,t)=>{a=o,i.push({t:e,pos:new V(t.px,t.py,t.pz),vel:new V(t.vx,t.vy,t.vz),bounces:a})},e=>((e.type===0||e.type===1)&&o++,e.type===3||e.type===4)),i}var Zh=-.35,Qh=.015,$h=ih+Xm;function eg(e){let t=e();return t<1e-12&&(t=1e-12),Math.sqrt(-2*Math.log(t))*Math.cos(2*Math.PI*e())}var tg=(e,t,n)=>e<t?t:e>n?n:e,ng=xh();function rg(e,t,n,r,i){let a=ng;return a.px=e.x,a.py=e.y,a.pz=e.z,a.vx=t,a.vy=n,a.vz=r,a.wx=i.x,a.wy=i.y,a.wz=i.z,a.netTouch=!1,a.cordPass=!1,a.done=!1,Gh(a,$h,3)}function ig(e,t,n){let r=9.81,i=n*n,a=i*i-r*(r*e*e+2*t*i);return a<0?Math.PI/4:Math.atan2(i-Math.sqrt(a),r*e)}function ag(e,t,n,r,i,a,o,s=.003){let c=t-e.x,l=n-e.z,u=Math.max(.05,Math.hypot(c,l)),d=c/u,f=l/u,p=a,m=o,h=NaN,g=0,_=NaN,v=0,y=NaN,b=0,x=!1,S={th:p,phi:m,speed:r,converged:!1,tooShort:!1,clearance:-1/0,err:1/0,vx:0,vy:0,vz:0},C=1/0;for(let a=0;a<16;a++){let a=Math.cos(p),o=r*Math.sin(m)*a,c=r*Math.sin(p),l=r*Math.cos(m)*a,u=rg(e,o,c,l,i),w,T;if(u.landed){let e=u.x-t,r=u.z-n;w=e*d+r*f,T=e*Math.cos(m)-r*Math.sin(m)}else w=2,T=0;let E=Math.hypot(w,T);if(E<C&&(C=E,S.th=p,S.phi=m,S.vx=o,S.vy=c,S.vz=l,S.err=E,S.clearance=u.landed?Number.isNaN(u.netY)?e.z<0==n<0?1/0:-1/0:Math.abs(u.netX)>oh+Xm?1/0:u.netY-(ah+Xm):-1/0),E<s){S.converged=!0;break}if(u.landed){let t=Math.max(.3,Math.hypot(u.x-e.x,u.z-e.z));m-=tg(T/t,-.3,.3)}w<0?(h=p,g=w):(_=p,v=w);let D;if(!Number.isNaN(h)&&!Number.isNaN(_)){D=h-g*(_-h)/(v-g);let e=Math.min(h,_),t=Math.max(h,_);D>e&&D<t||(D=(h+_)/2);let n=t-e;(D-e<n*.02||t-D<n*.02)&&(D=.8*D+.2*((e+t)/2))}else if(!Number.isNaN(y)&&Math.abs(p-y)>1e-6){let e=(w-b)/(p-y);if(w<0&&p>y&&e<=0){x=!0;break}D=e>.001?p-w/e:p+(w<0?.1:-.1),D=tg(D,p-.25,p+.25)}else D=p+(w<0?.06:-.06);if(w<0&&p>=1.2){x=!0;break}y=p,b=w,p=tg(D,-1.3,1.2)}return S.tooShort=x&&!S.converged,S}function og(e){return new V(e.vx,e.vy,e.vz)}function sg(e,t,n,r,i){let a=tg(r,2,35),o=Math.hypot(t-e.x,n-e.z),s=ig(o,$h-e.y,a),c=Math.atan2(t-e.x,n-e.z),l=null,u=e=>(e.converged?0:10+e.err)-Math.min(e.clearance,Qh)*20;for(let r=0;r<12;r++){let r=ag(e,t,n,a,i,s,c);if(s=r.th,c=r.phi,(!l||u(r)<u(l))&&(l=r),r.tooShort)a=Math.min(a*1.18,35),s=Math.min(s,.6);else{if(r.converged&&r.clearance>=Qh)return r;if(r.converged||(s=ig(o,$h-e.y,a*.9)),a<=2.01)break;a=Math.max(2,a*(r.clearance<-.06?.8:.9))}}return l}function cg(e,t,n=Math.random){let r=tg(t.error,0,1),i=t.target.x,a=t.target.z,o=t.speed;if(r>0){let e=a<0?-1:1;i+=eg(n)*.3*r,a=e*tg(Math.abs(a)+eg(n)*.35*r,.05,J+.9),i=tg(i,-sd-.7,sd+.7),o*=1+eg(n)*.08*r}let s=t.spin.clone();return{vel:og(sg(e,i,a,o,s)),spin:s}}function lg(e,t,n,r,i){let a=ld(r),o={pos:e,vel:t,spin:n},s=0,c=!1,l=!1,u={ok:!1,depthErr:-.8,lx:0,lz:0},d=!0,f=null;return Yh(o,2.5,1,(e,t)=>{s>=1&&!f&&(t.py<$h&&t.vy<0&&d&&Math.sign(t.pz)===-a&&(f={x:t.px,z:t.pz}),d=t.py>=$h)},e=>{if(e.type===2)return c=!0,!1;if(e.type===0||e.type===1){s++;let t=Math.sign(e.z)===a||e.z===0;return s===1?(l=t,!t):t?(u={ok:!1,depthErr:-.8,lx:e.x,lz:e.z},!0):(u={ok:l&&!c,depthErr:Math.abs(e.z)-i,lx:e.x,lz:e.z},!0)}return e.type===3||e.type===4?(f?u={ok:!1,depthErr:Math.max(.05,Math.abs(f.z)-i),lx:f.x,lz:f.z}:s>=1&&Math.sign(e.z)===-a&&!c&&(u={ok:!1,depthErr:.3,lx:e.x,lz:e.z}),!0):!1}),c&&u.depthErr>-.8&&(u={...u,ok:!1,depthErr:Math.min(u.depthErr,-.3)}),u}function ug(e,t,n,r=Math.random){let i=ld(t),a=tg(n.error,0,1)*.6,o=n.target.x,s=Math.abs(n.target.z),c=n.speed;a>0&&(o+=eg(r)*.3*a,s+=eg(r)*.3*a,c*=1+eg(r)*.06*a),s=tg(s,.2,J+.4),o=tg(o,-sd-.3,sd+.3);let l=n.spin.clone(),u=s>.9?[1,.9,1.1,.8,.65,.5]:[.5,.42,.6,.35,.7,.85],d=null,f=Math.abs(e.z),p=[];for(let e=1.6;e<12.5;e*=1.08)p.push(e);for(let n of u){if(n>=f-.05)continue;let r=i*n,a=(f-n)/(f+s),u=tg(e.x+(o-e.x)*a,-sd+.08,sd-.08),m=n=>{let i=Math.hypot(u-e.x,r-e.z),a=ag(e,u,r,n,l,ig(i,$h-e.y,n),Math.atan2(u-e.x,r-e.z));if(!a.converged)return null;let c=og(a),f=lg(e,c,l,t,s),p=o-f.lx,m=Math.abs(f.depthErr)+(f.ok?Math.abs(p):5);return(!d||m<d.score)&&(d={vel:c,score:m}),{o:f,vel:c,latErr:p,speed:n}},h=null,g=null,_=1/0;for(let e of p){let t=m(e);if(t&&h&&t.o.ok&&h.o.ok&&h.o.depthErr<=0&&t.o.depthErr>=0){let t=Math.abs(Math.log(e/c));t<_&&(g=[h.speed,e],_=t)}h=t}if(g){let[e,t]=g;for(let n=0;n<16;n++){let n=(e+t)/2,r=m(n);if(!r)break;if(r.o.ok&&Math.abs(r.latErr)<.03&&Math.abs(r.o.depthErr)<.025)return{vel:r.vel,spin:l};r.o.ok&&(u=tg(u+r.latErr*.45,-sd+.05,sd-.05)),!r.o.ok&&r.o.depthErr<0||r.o.depthErr<0?e=n:t=n,t-e<.02&&(e=Math.max(1.2,e-.3),t+=.3)}}if(d&&d.score<.08)break}return d?{vel:d.vel,spin:l}:cg(e,{target:new V(o,ih,-i*s),speed:c,spin:l,error:0},r)}function dg(e,t,n=2.5,r=!1){let i=ld(t),a=[],o=+!!r,s=+!!r,c=r;return Yh(e,n,2,(e,t)=>{if(o!==1||!c)return;let n=i*t.pz-J,r=t.py-ih;r>=.02&&r<=.55&&n>=-.8&&n<=1.6&&Math.abs(t.px)<=sd+1.2&&i*t.pz>0&&a.push({t:e,pos:new V(t.px,t.py,t.pz),vel:new V(t.vx,t.vy,t.vz),bounces:s})},e=>{if(e.type===0||e.type===1){s++;let t=Math.sign(e.z)===i||e.z===0&&i>0;return c=t,t&&o++,o>=2||!t&&o>=1}return e.type===3||e.type===4}),a}function fg(e,t,n=!1){let r=dg(e,t,2.5,n);if(!r.length)return null;let i=ld(t),a=r.filter(e=>i*e.pos.z-J>=Zh),o=a.length?a:r,s=o.find(e=>e.vel.y<=-.3)??o.find(e=>e.vel.y<=0)??o[o.length-1];return{t:s.t,pos:s.pos.clone(),vel:s.vel.clone()}}var pg=class{_phase=`idle`;_rally=0;_expecting=`player`;_lastHitter=null;server=`player`;bounces=[];netSinceHit=!1;get phase(){return this._phase}get rally(){return this._rally}get expecting(){return this._expecting}get lastHitter(){return this._lastHitter}get serveFlight(){return this._rally===1}get readyToStrike(){if(this._phase!==`serve`&&this._phase!==`rally`)return!1;if(this._rally===0)return this._expecting===this.server;let e=this._expecting;return this.serveFlight?this.bounces.length===2&&this.bounces[0]===this.server&&this.bounces[1]===e:this.bounces.length===1&&this.bounces[0]===e}startRally(e){this.server=e,this._phase=`serve`,this._rally=0,this._expecting=e,this._lastHitter=null,this.bounces=[],this.netSinceHit=!1}end(e,t,n){this._phase=`over`;let r=this._rally===1&&e===this.server&&t!==`winner`&&n===cd(this.server);return{winner:e,reason:t,faultBy:n,rally:this._rally,ace:r}}onHit(e){return this._phase!==`serve`&&this._phase!==`rally`?null:this._rally===0?e===this.server?(this._rally=1,this._lastHitter=e,this._expecting=cd(e),this.bounces=[],this.netSinceHit=!1,this._phase=`rally`,null):this.end(this.server,`volley`,e):e===this._lastHitter?this.end(cd(e),`double-hit`,e):this.readyToStrike?(this._rally++,this._lastHitter=e,this._expecting=cd(e),this.bounces=[],this.netSinceHit=!1,null):this.end(cd(e),`volley`,e)}onEvent(e){if(this._phase!==`rally`||this._rally===0||!this._lastHitter)return null;let t=this._lastHitter,n=cd(t);switch(e.type){case`net`:return this.netSinceHit=!0,null;case`bounce`:case`edge`:{let r=e.side,i=this.bounces;return this.serveFlight?i.length===0?r===t?(i.push(r),null):this.end(n,`serve-fault`,t):i.length===1?r===t?this.end(n,this.netSinceHit?`net`:`serve-fault`,t):(i.push(r),this.netSinceHit?(this._phase=`over`,`let`):null):this.end(t,`double-bounce`,n):i.length===0?r===t?this.end(n,this.netSinceHit?`net`:`own-side`,t):(i.push(r),null):this.end(t,`double-bounce`,n)}case`floor`:case`out`:{if(this.readyToStrike)return this.end(t,`missed`,n);let r=(e.pos.z>=0?`player`:`opponent`)===t,i=this.netSinceHit&&r?`net`:this.serveFlight&&this.bounces.length===0?`serve-fault`:`out`;return this.end(n,i,t)}}return null}},mg=class{gamesToWin;firstServer;pointsPerGame;points={player:0,opponent:0};games={player:0,opponent:0};gameScores=[];gameFirstServer;finished=null;constructor(e,t,n=11){this.gamesToWin=e,this.firstServer=t,this.pointsPerGame=n,this.gameFirstServer=t}get matchWinner(){return this.finished}server(){let e=this.points.player+this.points.opponent,t=this.pointsPerGame-1,n=2*t;return(e<n?Math.floor(e/2):t+(e-n))%2==0?this.gameFirstServer:cd(this.gameFirstServer)}wins(e,t){let n=this.points[e]+t;return n>=this.pointsPerGame&&n-this.points[cd(e)]>=2}award(e){return this.finished?{matchWon:this.finished}:(this.points[e]++,this.wins(e,0)?(this.gameScores.push({player:this.points.player,opponent:this.points.opponent}),this.games[e]++,this.points.player=0,this.points.opponent=0,this.gameFirstServer=cd(this.gameFirstServer),this.games[e]>=this.gamesToWin?(this.finished=e,{gameWon:e,matchWon:e}):{gameWon:e}):{})}gamePoint(){return this.finished?null:this.wins(`player`,1)?`player`:this.wins(`opponent`,1)?`opponent`:null}matchPoint(){let e=this.gamePoint();return e&&this.games[e]+1>=this.gamesToWin?e:null}deuce(){let e=this.pointsPerGame-1;return this.points.player>=e&&this.points.player===this.points.opponent}},hg={rookie:{reaction:.26,moveSpeed:3,accel:9,reach:.45,error:.3,whiff:.03,speedScale:.6,spinScale:.25,aggression:.05,openCourt:.05,margin:.32,variety:.25,pressure:.3,readyDepth:.45,maxSpeed:6.8},club:{reaction:.2,moveSpeed:3.4,accel:10,reach:.45,error:.27,whiff:.02,speedScale:.75,spinScale:.5,aggression:.25,openCourt:.35,margin:.24,variety:.45,pressure:.3,readyDepth:.5,maxSpeed:9},pro:{reaction:.14,moveSpeed:4,accel:14,reach:.48,error:.22,whiff:.01,speedScale:.93,spinScale:.88,aggression:.55,openCourt:.7,margin:.16,variety:.75,pressure:.2,readyDepth:.6,maxSpeed:13},legend:{reaction:.08,moveSpeed:5.2,accel:20,reach:.62,error:.12,whiff:.002,speedScale:1,spinScale:1,aggression:.75,openCourt:.9,margin:.12,variety:1,pressure:.1,readyDepth:.65,maxSpeed:99}},gg={loop:{back:.25,swing:.16,follow:.25,backOff:[.12,-.25,-.35],followOff:[-.3,.35,.3],face:-.55},drive:{back:.2,swing:.14,follow:.2,backOff:[.1,-.06,-.3],followOff:[-.3,.15,.3],face:-.3},smash:{back:.25,swing:.12,follow:.25,backOff:[.15,.35,-.3],followOff:[-.3,-.3,.35],face:-.35},block:{back:.1,swing:.08,follow:.12,backOff:[.02,0,-.08],followOff:[-.03,.02,.12],face:-.15},push:{back:.15,swing:.14,follow:.16,backOff:[.03,.08,-.15],followOff:[-.05,-.04,.25],face:.75},chop:{back:.22,swing:.16,follow:.2,backOff:[.05,.35,-.05],followOff:[-.1,-.3,.2],face:.95},flick:{back:.12,swing:.1,follow:.15,backOff:[.04,-.05,-.08],followOff:[-.1,.2,.15],face:-.2},lob:{back:.25,swing:.2,follow:.3,backOff:[.1,-.35,-.2],followOff:[-.15,.5,.2],face:.2},serve:{back:.3,swing:.15,follow:.2,backOff:[.15,.05,-.25],followOff:[-.2,-.05,.2],face:.4}},_g=q.height,vg=q.height+q.netHeight,yg=(e,t,n)=>e<t?t:e>n?n:e,bg=(e,t,n)=>e+(t-e)*n,xg=e=>e*e*(3-2*e);function Sg(e,t,n){return e<=0?0:e<t*t/n?2*Math.sqrt(e/n):e/t+t/n}var Cg=class{side;difficulty;rng;body;paddle;d;sign;clock=0;vel=new V;idleTarget;active=null;readyRot=new jt;constructor(e,t,n=Math.random){this.side=e,this.difficulty=t,this.rng=n,this.d=hg[t],this.sign=ld(e),this.body=this.readyPosition(),this.idleTarget=this.body.clone(),this.readyRot.copy(this.makeRot(!0,0,0,-this.sign)),this.paddle={body:this.body,paddlePos:this.readyPaddlePos(new V),paddleRot:this.readyRot.clone()}}get right(){return this.sign}get fwd(){return-this.sign}get level(){return this.difficulty}get plan(){return this.active}get timeToContact(){return this.active?this.active.tContact-this.clock:1/0}get backhand(){return this.active?!this.active.forehand:!1}get swing(){let e=this.active;if(!e||this.clock<e.swingStart)return 0;let t=this.clock-e.tContact;return t<-e.anim.swing?.2:t<=0?.2+.8*((t+e.anim.swing)/e.anim.swing):Math.max(0,1-t/e.anim.follow)}setDifficulty(e){this.difficulty=e,this.d=hg[e]}readyPosition(){return new V(-.08*this.right,0,this.sign*(J+this.d.readyDepth))}clearPlan(){this.active=null,this.idleTarget=this.readyPosition()}planReturn(e,t){let n=dg(e,this.side);if(!n.length)return this.clearPlan(),null;let r=this.d,i=this.sign,a=0;for(let e of n)a=Math.max(a,e.pos.y-_g);let o=a>.38&&this.rng()<.35+r.aggression*.65?Math.min(a-.03,.48):0,s=o||.22,c=null;for(let e=0;e<n.length;e+=2){let t=n[e],a=(t.pos.x-this.body.x)*this.right>-.05,o=a?.42:-.12,l=a?.3:.36,u=new V(t.pos.x-o*this.right,0,t.pos.z-l*this.fwd),d=J+.18,f=0;i*u.z<d&&(f=d-i*u.z,u.z=i*d);let p=Math.hypot(u.x-this.body.x,u.z-this.body.z),m=t.t-r.reaction,h=r.reach*.6,g=Math.max(Sg(Math.abs(u.x-this.body.x)-h*.8,r.moveSpeed,r.accel),Sg(Math.abs(u.z-this.body.z)-h*.6,r.moveSpeed,r.accel)),_=m>.05&&g<=m&&f<=r.reach+.25,v=t.pos.y-_g,y=i*t.pos.z-J,b=-1.2*Math.abs(v-s)-.1*Math.abs(t.vel.y+.5)-.25*Math.max(0,y-.8)-.35*Math.max(0,-.1-y)-.12*p;_||(b-=100+(g-m)*10+f*10),(!c||b>c.score)&&(c={p:t,score:b,forehand:a,bodyT:u,feasible:_,over:f})}let l=c,u=l.p,d=Math.hypot(l.bodyT.x-this.body.x,l.bodyT.z-this.body.z),f=Math.max(t.myScore,t.theirScore),p=1;f>=8&&Math.abs(t.myScore-t.theirScore)<=2&&(p+=r.pressure),t.theirScore>=10&&t.theirScore>t.myScore&&(p+=r.pressure*.5);let m=u.vel.length(),h=e.spin.length(),g=yg(d/1.5,0,1),_=Math.max(0,(m-7)/12)+h/1600+g*.6+l.over*.8,v=!l.feasible;!v&&this.rng()<r.whiff*p*(1+2*_)&&(v=!0);let{kind:y,request:b}=this.chooseShot(e,u,t.opponentBody,p,_,t.rally,o>0);return this.setPlan(u.t,u.pos.clone(),b,y,v,l.bodyT,l.forehand),this.publicPlan()}planServe(e){let t=this.d,n=this.sign,r=this.rng,i=new V(-.3*this.right,0,n*(J+.42)),a=new V(i.x+.25*this.right,_g+.27,n*(J+.2)),o=Math.max(e.myScore,e.theirScore)>=9?1+t.pressure:1,s=r(),c=.35+.3*t.aggression,l,u,d;s<c?(l=J-t.margin*.8-r()*.15,u=Math.min(6+2.5*t.speedScale*r(),t.maxSpeed),d=(150+250*r())*t.spinScale):(l=.38+r()*.25,u=3.5+r(),d=-(250+250*r())*t.spinScale);let f=sd-t.margin,p=new V((r()*2-1)*f*(.5+.5*t.variety),_g,-n*l),m=(r()*2-1)*200*t.variety*t.spinScale,h=this.spinVector(a,p,d,m),g={target:p,speed:u,spin:h,error:yg(t.error*.6*o,0,1)},_=.7+r()*.25;this.idleTarget=i;let v=i.clone();return this.setPlan(_,a.clone(),g,`serve`,!1,v,!0),this.active&&(this.active.moveStart=this.clock),{request:g,kind:`serve`,tossTime:_,strikePos:a}}spinVector(e,t,n,r){let i=t.x-e.x,a=t.z-e.z,o=Math.hypot(i,a)||1;return new V(a/o*n,r,-i/o*n)}chooseShot(e,t,n,r,i,a,o){let s=this.d,c=this.rng,l=this.sign,u=Math.hypot(t.vel.x,t.vel.z)||1,d=(e.spin.x*t.vel.z-e.spin.z*t.vel.x)/u,f=t.pos.y-vg,p=l*t.pos.z-J,m=p<-.05,h=t.vel.length(),g=yg(s.aggression+Math.min(a,10)*.01,0,1),_;if(f>.2&&(o||c()<.35+g*.65))_=`smash`;else if(p>1.25)_=d<-150||t.pos.y-_g<.12?`chop`:c()<.5?`lob`:`drive`;else if(m&&f<.12)_=c()<(d<-80?g*.7:.3+g*.5)?`flick`:`push`;else if(d<-150)_=c()<.25+g*.7?`loop`:c()<.6?`push`:`chop`;else if(d>250||h>13){let e=c();_=e<.55-g*.3?`block`:e<.85?`drive`:`loop`}else _=c()<g?`loop`:f<.02&&c()<.3?`push`:`drive`;let v=s.margin*(_===`smash`?1.2:1)+c()*.05,y=sd-v,b;b=c()<s.openCourt?(n.x>0?-1:1)*y*(.75+.25*c()):(c()*2-1)*y*(.4+.6*s.variety);let x;x=_===`push`&&c()<.4+.3*s.variety?.35+c()*.3:_===`flick`||_===`block`?J-v-c()*.35:J-v-c()*.25*(1.2-s.variety);let S=new V(b,_g,-l*x),C=(e,t)=>bg(e,t,c()),w,T;switch(_){case`smash`:w=C(18,23),T=C(80,200);break;case`loop`:w=C(11.5,15.5),T=C(420,720);break;case`drive`:w=C(11.5,15.5),T=C(180,380);break;case`block`:w=C(9,12),T=C(60,180);break;case`push`:w=C(5.5,7.5),T=-C(250,450);break;case`chop`:w=C(7,9),T=-C(400,650);break;case`flick`:w=C(10,13),T=C(250,400);break;case`lob`:w=C(8,10),T=C(350,500);break;default:w=8,T=0}w*=_===`push`||_===`chop`?1:bg(1,s.speedScale,.9),w=Math.min(w,s.maxSpeed),T*=s.spinScale;let E=(c()*2-1)*120*s.variety*s.spinScale,D=this.spinVector(t.pos,S,T,E),O=yg(s.error*{smash:1.6,loop:1.15,flick:1.3,drive:1,block:.9,push:.8,chop:.9,lob:1,serve:.6}[_]*(1+i)*r,0,1);return{kind:_,request:{target:S,speed:w,spin:D,error:O}}}setPlan(e,t,n,r,i,a,o){let s=gg[r],c=this.clock+e,l=s.back+s.swing,u=Math.max(.08,e-this.d.reaction*.5),d=Math.min(1,u/l),f={...s,back:s.back*d,swing:s.swing*d},p=n.target.x-t.x,m=n.target.z-t.z,h=Math.hypot(p,m)||1,g=o?1:-1,_=e=>new V(t.x+e[0]*g*this.right,t.y+e[1],t.z+e[2]*this.fwd),v=_(f.backOff);v.y=Math.max(_g+.03,v.y),this.active={t:e,strikePos:t,request:n,kind:r,willMiss:i,tContact:c,moveStart:this.clock+this.d.reaction,swingStart:c-f.back-f.swing,bodyTarget:a,forehand:o,anim:f,aimX:p/h,aimZ:m/h,startPos:null,startRot:null,backPos:v,followPos:_(f.followOff),strokeRot:this.makeRot(o,f.face,p/h,m/h)}}publicPlan(){let e=this.active;return e?{t:e.t,strikePos:e.strikePos.clone(),request:e.request,kind:e.kind,willMiss:e.willMiss}:null}readyPaddlePos(e){return e.set(this.body.x+.2*this.right,_g+.14,this.body.z+.38*this.fwd)}makeRot(e,t,n,r){let i=new V(n*Math.cos(t),Math.sin(t),r*Math.cos(t)).normalize(),a=new V(this.right,0,0),o=new V(0,0,-this.fwd),s=(e?new V().addScaledVector(o,.5).addScaledVector(a,.3).add(new V(0,-.6,0)):new V().addScaledVector(o,.4).addScaledVector(a,.6).add(new V(0,-.3,0))).multiplyScalar(-1);s.addScaledVector(i,-s.dot(i)),s.lengthSq()<1e-6&&s.set(0,1,0).addScaledVector(i,-i.y),s.normalize();let c=new V().crossVectors(s,i).normalize();return new jt().setFromRotationMatrix(new en().makeBasis(c,s,i))}update(e){if(e<=0)return;this.clock+=e;let t=this.active,n=this.d,r=this.idleTarget;t&&(this.clock>=t.moveStart&&this.clock<=t.tContact+.05&&(r=t.bodyTarget),this.clock>t.tContact+t.anim.follow+.05&&(this.active=null,this.idleTarget=this.readyPosition()));for(let t of[`x`,`z`]){let i=r[t]-this.body[t],a=Math.sign(i)*Math.min(n.moveSpeed,Math.sqrt(2*n.accel*Math.abs(i)))-this.vel[t],o=n.accel*e;this.vel[t]+=yg(a,-o,o),this.body[t]+=this.vel[t]*e}let i=J+.12;this.sign*this.body.z<i&&(this.body.z=this.sign*i,this.vel.z=0),this.body.y=0;let a=this.paddle,o=this.active;if(o&&this.clock>=o.swingStart){o.startPos||(o.startPos=a.paddlePos.clone(),o.startRot=a.paddleRot.clone());let t=this.clock-o.tContact,n=o.anim;if(t<-n.swing){let e=xg(yg((this.clock-o.swingStart)/Math.max(n.back,.001),0,1));a.paddlePos.lerpVectors(o.startPos,o.backPos,e),a.paddleRot.slerpQuaternions(o.startRot,o.strokeRot,e)}else if(t<=0){let e=yg((t+n.swing)/Math.max(n.swing,.001),0,1),r=e*e*(2-e);a.paddlePos.lerpVectors(o.backPos,o.strikePos,r),a.paddleRot.copy(o.strokeRot)}else if(t<=n.follow){let e=yg(t/n.follow,0,1);a.paddlePos.lerpVectors(o.strikePos,o.followPos,1-(1-e)*(1-e)),a.paddleRot.copy(o.strokeRot)}else this.relaxPaddle(e)}else this.relaxPaddle(e)}tmp=new V;relaxPaddle(e){let t=1-Math.exp(-9*e);this.paddle.paddlePos.lerp(this.readyPaddlePos(this.tmp),t),this.paddle.paddleRot.slerp(this.readyRot,t)}},wg=[{id:`targets`,name:`Target Practice`,description:`Glowing rings appear on the far side. Land your returns inside them — chain hits for a combo bonus.`,goal:`Score as many points as you can in 60 seconds`,seconds:60,unit:`pts`},{id:`rally`,name:`Rally Master`,description:`Keep the ball alive against a steady club player. Three attempts, your longest rally counts.`,goal:`Longest rally out of 3 tries`,unit:`hits`},{id:`speed`,name:`Speed Demon`,description:`The machine feeds high, juicy balls. Swing hard and put them away on the table.`,goal:`Fastest legal smash in 12 balls`,feeds:12,unit:`km/h`},{id:`spin`,name:`Spin Doctor`,description:`Heavy backspin, every ball. Brush up through the ball to loop it back with topspin.`,goal:`Most topspin returns in 60 seconds`,seconds:60,unit:`loops`}],Tg=e=>wg.find(t=>t.id===e),Eg={openAt:[.6,.95],buffer:.18,ringLead:.1,sweet:.04,perfect:[.08,.14],good:[.17,.27],lateLimit:[-.16,-.28],approachScale:[1,.72],speed:{min:5.6,max:11.5,perfectBonus:1.4,smashMin:11,smashMax:16},error:{perfect:.03,good:.06,early:.12,late:.14},vsCpu:{rookie:{maxSpeed:8.5,errorScale:.6},club:{maxSpeed:10.5,errorScale:1},pro:{maxSpeed:14,errorScale:2},legend:{maxSpeed:99,errorScale:3}},aimDeadzone:.32,padX:.55,depth:{min:.35,max:.82}},Dg=(e,t,n)=>e+(t-e)*n,Og=(e,t,n)=>e<t?t:e>n?n:e,kg=(e,t)=>Dg(e[0],e[1],Og(t,0,1));function Ag(e){return{openAt:kg(Eg.openAt,e),lateLimit:kg(Eg.lateLimit,e),perfect:kg(Eg.perfect,e),good:kg(Eg.good,e),approachScale:kg(Eg.approachScale,e)}}function jg(e,t){let n=e-Eg.sweet,r=Math.abs(n);if(r<=t.perfect)return{grade:`perfect`,quality:1};if(r<=t.good)return{grade:`good`,quality:.85-.1*((r-t.perfect)/Math.max(1e-6,t.good-t.perfect))};let i=n>0?t.openAt+Eg.buffer-Eg.sweet:Eg.sweet-t.lateLimit,a=Og((r-t.good)/Math.max(1e-6,i-t.good),0,1);return{grade:n>0?`early`:`late`,quality:Dg(.65,.3,a)}}function Mg(e,t){return Og(1-(e-Eg.ringLead)/Math.max(1e-6,t.openAt-Eg.ringLead),0,1)}function Ng(e,t){return e<t.lateLimit?`late`:Math.abs(e-Eg.sweet)<=t.good?`swing`:e<Eg.sweet?`late`:`wait`}function Pg(e,t=0){let n=Og(e,-1,1)*.75+Og(t,-1,1)*.6;return n>Eg.aimDeadzone?1:n<-Eg.aimDeadzone?-1:0}function Fg(e){let t=Og(e.power,0,1),n=`drive`;e.aboveNet>.3&&t>.65&&e.grade!==`late`?n=`smash`:e.lift>.45&&t>.4?n=`loop`:(e.lift<-.45||e.face>.5)&&(n=`push`);let r=Eg.speed,i=Dg(r.min,r.max,t)*(.78+.22*e.quality)+(e.grade===`perfect`?r.perfectBonus*t:0);n===`smash`&&(i=Dg(r.smashMin,r.smashMax,t)*(.8+.2*e.quality)),n===`push`&&(i=Math.min(i,7)),n===`loop`&&(i*=1.05);let a={drive:150+150*t,loop:480+320*t,push:-(260+160*t),smash:100}[n]*(.8+.2*e.quality),o=e.zone*e.halfWidth*Eg.padX;e.grade===`early`&&(o*=.7),e.grade===`late`&&(o=o*1.1+(e.zone===0?0:.04*e.zone));let s=Dg(Eg.depth.min+.1,Eg.depth.max,t);e.grade===`early`&&(s-=.08),n===`push`&&(s=Eg.depth.min+.05),s=Og(s,Eg.depth.min,Eg.depth.max),o=Og(o,-e.halfWidth*.7,e.halfWidth*.7);let c=Eg.error[e.grade]*(n===`smash`?1.5:1);return{kind:n,speed:i,topspin:a,x:o,depth:s,error:c}}var Ig=[{title:`Swing when the ring turns GREEN`,detail:`Any swing works — or tap the big phone button`,need:3,slow:.6,feed:{speed:[4.2,4.8],spin:`none`,spread:.3},check:()=>!0},{title:`Nice! Same again, a bit faster`,detail:`Watch the ring, not the ball`,need:3,slow:.85,feed:{speed:[5,6],spin:`none`,spread:.6},check:()=>!0},{title:`Point your phone LEFT, then swing`,detail:`The lit pad shows where your shot goes (or press ◀)`,need:1,slow:.85,feed:{speed:[5,6],spin:`none`,spread:.4},check:e=>e.zone===-1},{title:`Now point RIGHT and swing`,detail:`Or press ▶ on the phone`,need:1,slow:.85,feed:{speed:[5,6],spin:`none`,spread:.4},check:e=>e.zone===1},{title:`Swing HARD for a fast shot`,detail:`Bigger swing = faster ball`,need:1,slow:1,feed:{speed:[5.5,6.5],spin:`none`,spread:.6},check:e=>e.power>.6}],Lg=At.clamp,Rg=new jt().setFromAxisAngle(new V(0,1,0),Math.PI),zg=q.height,Bg=()=>({longestRally:0,fastest:0,winners:0,errors:0,aces:0,hits:0,pointsWon:0,pointsLost:0}),Vg={rookie:`Pip`,club:`Max`,pro:`Rina`,legend:`Kaz`},Hg=(e,t)=>t>0?e.clone():new V(-e.x,e.y,-e.z),Ug=class{side;s;body=new V;vel=new V;paddlePos=new V;paddleRot=new jt;backhand=!1;swingT=-1;swingPower=0;pending=[];tooEarlyShown=!1;missShown=!1;landing=null;aimOverride=null;lastZone=0;lastGrade=null;autoAt=null;autoDone=!1;intercept=null;interceptDirty=!0;trajTimer=0;lastKind=null;fastest=0;target=new V;constructor(e){this.side=e,this.s=ld(e),this.reset()}reset(){this.body.set(0,0,this.s*(J+.7)),this.vel.set(0,0,0),this.target.copy(this.body),this.swingT=-1,this.pending=[],this.intercept=null,this.landing=null,this.aimOverride=null,this.tooEarlyShown=this.missShown=!1,this.autoAt=null,this.autoDone=!1,this.lastKind=null}setTarget(e,t){this.target.set(this.s*Lg(e,-sd-1,sd+1),0,this.s*Lg(t,J+.12,J+2.2))}update(e){let t=2*Math.sqrt(38),n=(this.target.x-this.body.x)*38-this.vel.x*t,r=(this.target.z-this.body.z)*38-this.vel.z*t;this.vel.x+=n*e,this.vel.z+=r*e;let i=Math.hypot(this.vel.x,this.vel.z);i>5&&this.vel.multiplyScalar(5/i),this.body.addScaledVector(this.vel,e),this.swingT>=0&&(this.swingT+=e/.32,this.swingT>=1&&(this.swingT=-1))}pose(){return{body:this.body.clone(),paddlePos:this.paddlePos.clone(),paddleRot:this.paddleRot.clone()}}},Wg=class{d;active=!1;paused=!1;mode=`demo`;timeScale=1;autoSwing=0;ball=new Jh;ref=new pg;board=null;opp=new Cg(`opponent`,`club`);auto=null;humans={player:new Ug(`player`),opponent:null};cfg={mode:`demo`,difficulty:`club`,gamesToWin:2};phase=`idle`;phaseT=0;clock=0;server=`player`;oppPlan=null;autoPlan=null;serveReq=null;lastHitSpeed=0;ballVisible=!1;tally=Bg();streak=0;slowmoT=0;overT=0;offSwing=[];powerCharges=0;powerT=0;approachK=1;lastHitAt=0;lesson=null;machine=!1;feed={speed:[7,10],spin:`mixed`};chal=null;practiceStreak=0;practiceBest=0;constructor(e){this.d=e,this.bindInput()}bindInput(){for(let e of this.offSwing)e();this.offSwing=[this.d.input().onSwing(e=>this.onSwing(`player`,e))];let e=this.d.input2();e&&this.offSwing.push(e.onSwing(e=>this.onSwing(`opponent`,e)))}get versus(){return this.mode===`versus`}get focusBall(){return this.ball.state.pos}get focusPlayer(){return this.humans.player?.body??this.auto?.body??this.ball.state.pos}get focusOpponent(){return this.humans.opponent?.body??this.opp.body}inputFor(e){return e===`player`?this.d.input():this.d.input2()}handOf(e){return e===`player`?this.d.settings().handedness:this.d.hand2()}bodyOf(e){return this.humans[e]?.body??(e===`player`?this.auto?.body:this.opp.body)??new V}nameOf(e){return e===`player`?this.d.settings().playerName||(this.versus?`Player 1`:`You`):this.versus?`Player 2`:this.mode===`demo`?`CPU`:Vg[this.cfg.difficulty]}setSwingEnabled(e){this.d.input().setSwingEnabled(e),this.d.input2()?.setSwingEnabled(e&&this.versus)}start(e){this.cfg=e,this.mode=e.mode,this.active=!0,this.paused=!1,this.tally=Bg(),this.streak=0,this.timeScale=1,this.slowmoT=0,this.endPower(!0),this.humans={player:e.mode===`demo`?null:new Ug(`player`),opponent:e.mode===`versus`?new Ug(`opponent`):null},this.opp.setDifficulty(e.difficulty),this.opp.clearPlan(),this.oppPlan=this.autoPlan=null,this.chal=null,this.machine=!1,this.lesson=null,this.approachK=1,this.auto=e.mode===`demo`?new Cg(`player`,`pro`):null;let{stage:t,ui:n}=this.d;t.setTargets([]),t.setTrajectory(null);let r=this.d.settings();if(t.setAvatarColors(`player`,`#ff6b4a`),t.setAvatarColors(`opponent`,`#2ec4b6`),e.mode===`match`||e.mode===`demo`||e.mode===`versus`)this.server=Math.random()<.5?`player`:`opponent`,this.board=new mg(e.mode===`demo`?1:e.gamesToWin,this.server),n.hud.setChallenge(null);else if(e.mode===`practice`)this.board=null,this.machine=!0,this.feed={speed:[5.5,8],spin:`mixed`},this.practiceStreak=0,n.hud.setChallenge({name:`Practice`,score:0,best:this.practiceBest,detail:`Return the machine balls`}),this.setLesson(0);else if(e.mode===`challenge`){this.board=null;let t=Tg(e.challengeId);this.chal={id:t.id,score:0,timeLeft:t.seconds??0,feedsLeft:t.feeds??0,attempts:t.id===`rally`?3:0,combo:0,rally:0,targets:[]},t.id===`rally`?(this.opp.setDifficulty(`club`),this.server=`player`):(this.machine=!0,this.feed=t.id===`targets`?{speed:[6.5,9],spin:`mixed`}:t.id===`speed`?{speed:[5,6.5],spin:`high`}:{speed:[6,8.5],spin:`back`}),t.id===`targets`&&this.spawnTargets(),this.refreshChallengeHud()}n.hud.show(e.mode!==`demo`),n.hud.setSplit(this.versus,this.versus?[this.nameOf(`player`),this.nameOf(`opponent`)]:void 0),t.setSplit(this.versus),this.powerCharges=e.mode===`match`?fd.perGame:0,this.refreshPowerHud(),this.updateScoreHud(),t.setCameraMode(e.mode===`demo`?`menu`:`serve`),this.setSwingEnabled(e.mode!==`demo`),e.mode!==`demo`&&this.d.sfx.music(`match`),this.d.sfx.crowd(r.theme===`arena`?.5:.25),this.beginPoint()}stop(){this.active=!1,this.lesson=null,this.d.stage.setHitCue(`player`,null),this.d.stage.setHitCue(`opponent`,null),this.phase=`idle`,this.ballVisible=!1,this.d.ui.hud.show(!1),this.d.stage.setTargets([]),this.d.stage.setTrajectory(null),this.d.stage.setSplit(!1),this.d.ui.hud.setSplit(!1),this.endPower(!0),this.d.ui.hud.setSlowMo(null),this.setSwingEnabled(!1)}get powerAvailable(){return this.mode===`match`}activatePower(){return!this.active||this.paused||!this.powerAvailable||this.powerT>0||this.powerCharges<=0||this.phase!==`rally`&&this.phase!==`serve`&&this.phase!==`toss`?!1:(this.powerCharges--,this.powerT=fd.duration,this.d.sfx.slowMo(!0),this.d.stage.setSlowMo(1),this.d.ui.hud.callout(`SLOW-MO`,`gold`,`${this.powerCharges} left this game`),this.d.input().vibrate([20,40,60]),this.refreshPowerHud(),!0)}endPower(e=!1){this.powerT<=0&&e?this.d.stage.setSlowMo(0):(this.powerT=0,this.d.stage.setSlowMo(0),e||this.d.sfx.slowMo(!1),this.refreshPowerHud())}refreshPowerHud(){this.powerAvailable?this.d.ui.hud.setSlowMo({charges:this.powerCharges,max:fd.perGame,active:this.powerT>0,remaining:Lg(this.powerT/fd.duration,0,1)}):this.d.ui.hud.setSlowMo(null),this.d.phone({power:!0})}phonePower(){return{charges:this.powerAvailable?this.powerCharges:-1,max:fd.perGame,active:this.powerT>0}}beginPoint(){if(this.phase=`serve`,this.phaseT=0,this.oppPlan=this.autoPlan=null,this.opp.clearPlan(),this.auto?.clearPlan(),this.serveReq=null,this.d.stage.setTrajectory(null),this.humans.player?.reset(),this.humans.opponent?.reset(),this.machine){this.ballVisible=!1,this.d.ui.hud.setPrompt(this.lesson?.title??null);return}this.board&&(this.server=this.board.server()),this.ref.startRally(this.server),this.ballVisible=!0,this.placeBallInHand();let e=!!this.humans[this.server];this.versus?(this.d.ui.hud.setPrompt(null,cd(this.server)),this.d.ui.hud.setPrompt(`Swing or tap to serve`,this.server)):this.d.ui.hud.setPrompt(e?`Swing (or tap the phone button) to serve`:null),this.d.stage.setCameraMode(this.mode===`demo`?`menu`:`serve`);for(let e of[`player`,`opponent`]){if(!this.humans[e])continue;let t=e===this.server;this.d.phone({screen:t?`serve`:`rally`,label:t?`Your serve — swing!`:`Get ready`},e)}if(!e){let e=this.server===`player`?this.auto:this.opp,t=this.scoreFor(this.server),n=e.planServe({myScore:t.mine,theirScore:t.theirs});this.serveReq={request:n.request,kind:n.kind,strikeAt:0},this.phaseT=-Math.max(.6,n.tossTime)}}scoreFor(e){let t=this.board?.points??{player:0,opponent:0};return{mine:t[e],theirs:t[cd(e)]}}serverHand(e){let t=this.bodyOf(e),n=ld(e),r=this.humans[e]&&this.handOf(e)===`left`?.25:-.25;return new V(Lg(t.x+r*n,-sd+.1,sd-.1),zg+.08,n*(J+.22))}placeBallInHand(){let e=this.serverHand(this.server);e.y+=Math.sin(this.clock*3)*.015,this.ball.set(e,new V,new V)}toss(){this.phase=`toss`,this.phaseT=0;let e=this.serverHand(this.server);this.ball.set(e,new V(0,2.3,0),new V),this.d.ui.hud.setPrompt(null,this.server),this.d.sfx.whoosh(.2)}endPoint(e){if(this.phase===`dead`||this.phase===`over`)return;this.phase=`dead`,this.phaseT=0,this.oppPlan=this.autoPlan=null,this.humans.player&&(this.humans.player.pending=[]),this.humans.opponent&&(this.humans.opponent.pending=[]),this.d.stage.setTrajectory(null);let{ui:t,sfx:n,stage:r}=this.d,i=e.winner===`player`;if(this.tally.longestRally=Math.max(this.tally.longestRally,e.rally),this.versus){this.endVersusPoint(e);return}if(this.machine||this.chal?.id===`rally`){this.endDrillPoint(e);return}this.mode!==`demo`&&(i?this.tally.pointsWon++:this.tally.pointsLost++,e.ace&&i&&this.tally.aces++,i&&(e.reason===`winner`||e.reason===`missed`||e.reason===`double-bounce`)&&!e.ace&&e.rally>1&&this.tally.winners++,!i&&e.faultBy===`player`&&this.tally.errors++,this.streak=i?Math.max(1,this.streak+1):Math.min(-1,this.streak-1));let a=this.calloutFor(e);if(this.mode===`demo`?e.rally>5&&n.applause(.4):(t.hud.callout(a.title,i?e.ace||e.reason===`winner`?`gold`:`good`:`bad`,a.sub),n.score(i),i?n.applause(e.rally>6?.9:.5):e.rally>6&&n.groan(),this.d.input().vibrate(i?[30,40,30]:120)),r.fx.pointWon(e.winner),r.avatarReact(e.winner,`cheer`),r.avatarReact(cd(e.winner),`sad`),r.setCameraMode(this.mode===`demo`?`menu`:`point`),!this.board)return;let o=this.board.award(e.winner);if(this.updateScoreHud(),o.matchWon)this.phase=`over`,this.overT=0,this.timeScale=.35,this.slowmoT=.9,this.mode!==`demo`&&(t.hud.callout(o.matchWon===`player`?`MATCH!`:`GAME OVER`,o.matchWon===`player`?`gold`:`bad`),o.matchWon===`player`?(r.fx.confetti(),n.win()):n.lose(),r.setCameraMode(`celebrate`));else if(o.gameWon&&this.mode!==`demo`){let e=this.board.games;this.powerAvailable&&(this.powerCharges=fd.perGame,this.refreshPowerHud()),setTimeout(()=>t.hud.callout(o.gameWon===`player`?`GAME`:`GAME LOST`,o.gameWon===`player`?`gold`:`bad`,`${e.player} – ${e.opponent} in games`),900),this.phaseT=-1.2}else if(this.mode!==`demo`){let e=this.board.matchPoint()??this.board.gamePoint();this.board.deuce()?setTimeout(()=>t.hud.callout(`DEUCE`,`neutral`),900):e&&setTimeout(()=>t.hud.callout(this.board.matchPoint()?`MATCH POINT`:`GAME POINT`,e===`player`?`gold`:`neutral`),900)}}endVersusPoint(e){let{ui:t,sfx:n,stage:r}=this.d,i=this.nameOf(e.winner),a=e.ace?`ACE!`:{net:`NET`,out:`OUT`,"serve-fault":`FAULT`,"own-side":`OWN SIDE`,volley:`VOLLEY`,"double-hit":`DOUBLE HIT`}[e.reason]??(this.lastHitSpeed>16?`WINNER!`:`POINT`);t.hud.callout(a,`gold`,`Point ${i}${e.rally>4?` · ${e.rally}-hit rally`:``}`),n.score(!0),n.applause(e.rally>6?.9:.5),this.inputFor(e.winner)?.vibrate([30,40,30]),this.inputFor(cd(e.winner))?.vibrate(120),r.fx.pointWon(e.winner),r.avatarReact(e.winner,`cheer`),r.avatarReact(cd(e.winner),`sad`),r.setCameraMode(`point`);let o=this.board,s=o.award(e.winner);if(this.updateScoreHud(),s.matchWon)this.phase=`over`,this.overT=0,this.timeScale=.35,this.slowmoT=.9,t.hud.callout(`${this.nameOf(s.matchWon).toUpperCase()} WINS!`,`gold`),r.fx.confetti(),n.win(),r.setCameraMode(`celebrate`,{side:s.matchWon});else if(s.gameWon)setTimeout(()=>t.hud.callout(`GAME ${this.nameOf(s.gameWon)}`,`gold`,`${o.games.player} – ${o.games.opponent} in games`),900),this.phaseT=-1.2;else{let e=o.matchPoint()??o.gamePoint();o.deuce()?setTimeout(()=>t.hud.callout(`DEUCE`,`neutral`),900):e&&setTimeout(()=>t.hud.callout(o.matchPoint()?`MATCH POINT`:`GAME POINT`,`neutral`,this.nameOf(e)),900)}}calloutFor(e){let t=e.winner===`player`;if(e.ace)return{title:`ACE!`,sub:t?`Untouchable serve`:`Ace against you`};switch(e.reason){case`net`:return{title:`NET`,sub:t?`Point to you`:void 0};case`out`:return{title:`OUT`,sub:t?`Point to you`:void 0};case`serve-fault`:return{title:`FAULT`,sub:`Illegal serve`};case`own-side`:return{title:`OWN SIDE`,sub:`Must land on the far half`};case`volley`:return{title:`VOLLEY`,sub:`Let it bounce first`};case`double-hit`:return{title:`DOUBLE HIT`};case`missed`:case`double-bounce`:return t?this.streak>=3?{title:`${this.streak} IN A ROW`,sub:`On fire!`}:{title:this.lastHitSpeed>16?`WINNER!`:`POINT`,sub:this.lastHitSpeed>0?`${Math.round(this.lastHitSpeed*3.6)} km/h`:void 0}:{title:`MISSED`,sub:e.rally>1?`${e.rally}-hit rally`:void 0};default:return{title:t?`WINNER!`:`POINT LOST`,sub:e.rally>4?`${e.rally}-hit rally`:void 0}}}updateScoreHud(){if(this.d.settings(),!this.board)return;let e=this.board,t=[this.nameOf(`player`),this.nameOf(`opponent`)];this.d.ui.hud.setScore({points:{...e.points},games:{...e.games},server:e.server(),names:t,gamePoint:e.gamePoint(),matchPoint:e.matchPoint()}),this.d.stage.setScoreboard({player:e.points.player,opponent:e.points.opponent,gamesP:e.games.player,gamesO:e.games.opponent,names:t}),this.d.phone({score:!0},`player`),this.versus&&this.d.phone({score:!0},`opponent`)}phoneScore(e=`player`){let t=this.board;if(!t)return null;let n=cd(e);return{me:t.points[e],them:t.points[n],gamesMe:t.games[e],gamesThem:t.games[n],serving:t.server()===e}}launchFeed(){let e=this.feed,t=new V((Math.random()-.5)*.6,zg+(e.spin===`high`?.45:.25),-J-.25),n=(Math.random()-.5)*(sd*(e.spread??1.3)),r=J*(.45+Math.random()*.45),i=At.lerp(e.speed[0],e.speed[1],Math.random()),a=e.spin===`mixed`?[`top`,`back`,`none`][Math.floor(Math.random()*3)]:e.spin,o=0;a===`top`&&(o=250+Math.random()*250),a===`back`&&(o=-(300+Math.random()*250)),a===`high`&&(r=J*(.45+Math.random()*.2),i=3.6+Math.random()*.6,o=-120);let{vel:s,spin:c}=cg(t,{target:new V(n,zg,r),speed:i,spin:new V(o,0,0),error:.05});this.ref.startRally(`opponent`),this.ref.onHit(`opponent`),this.ref.onEvent({type:`bounce`,side:`opponent`,pos:t.clone(),speed:1}),this.ball.set(t,s,c),this.ballVisible=!0,this.phase=`rally`,this.phaseT=0,this.humans.player&&(this.humans.player.interceptDirty=!0),this.d.sfx.paddleHit(.25,`push`),this.d.stage.setCameraMode(`play`),this.chal&&this.chal.feedsLeft>0&&this.chal.feedsLeft--}endDrillPoint(e){let{ui:t,sfx:n,stage:r}=this.d,i=e.winner===`player`;if(this.mode===`practice`&&this.lesson){!i&&e.rally>1&&t.hud.callout(`SO CLOSE`,`neutral`,`It counts — the ball just has to come back`);return}if(this.mode===`practice`){this.practiceStreak=i?this.practiceStreak+1:0,this.practiceBest=Math.max(this.practiceBest,this.practiceStreak),t.hud.setChallenge({name:`Practice`,score:this.practiceStreak,best:this.practiceBest,detail:i?`Nice return`:this.calloutFor(e).title}),i&&n.score(!0),i||t.hud.callout(this.calloutFor(e).title,`bad`);return}let a=this.chal;if(a.id===`rally`)a.score=Math.max(a.score,e.rally),a.attempts--,t.hud.callout(`${e.rally} HITS`,e.rally>=a.score?`gold`:`neutral`,a.attempts>0?`${a.attempts} tr${a.attempts===1?`y`:`ies`} left`:void 0),r.setCameraMode(`point`),a.attempts<=0&&this.finishChallenge();else if(a.id===`speed`){if(i&&this.humans.player?.lastKind){let e=Math.round(this.lastHitSpeed*3.6);e>a.score?(a.score=e,t.hud.callout(`${e} KM/H`,`gold`,`New best`)):t.hud.callout(`${e} km/h`,`neutral`)}else t.hud.callout(this.calloutFor(e).title,`bad`);a.feedsLeft<=0&&this.finishChallenge()}else a.id===`spin`?i&&(this.humans.player?.lastKind===`loop`||this.humans.player?.lastKind===`drive`||this.humans.player?.lastKind===`flick`)?(a.score++,t.hud.callout(`LOOP!`,`good`,`${a.score}`),n.score(!0)):i?t.hud.callout(`Too flat`,`neutral`,`Brush up through the ball`):t.hud.callout(this.calloutFor(e).title,`bad`):a.id===`targets`&&(i||(a.combo=0,t.hud.callout(this.calloutFor(e).title,`bad`)));this.refreshChallengeHud()}spawnTargets(){let e=this.chal;e.targets=[];for(let t=0;t<3;t++)e.targets.push(this.randomTarget(`t${Date.now()}-${t}`));this.d.stage.setTargets(e.targets.map(e=>({...e,color:`#ffc94a`})))}randomTarget(e){let t=.16+Math.random()*.06;return{id:e,radius:t,pos:new V((Math.random()*2-1)*(sd-t-.04),zg,-(.3+Math.random()*(J-.5)))}}checkTargets(e){let t=this.chal;if(!t||t.id!==`targets`)return;let n=t.targets.find(t=>Math.hypot(t.pos.x-e.x,t.pos.z-e.z)<=t.radius+.02);if(!n){t.combo=0,this.d.ui.hud.callout(`MISS`,`neutral`,`Aim for the rings`);return}t.combo++;let r=100*Math.min(t.combo,5);t.score+=r,this.d.stage.hitTarget(n.id),this.d.sfx.score(!0),this.d.ui.hud.callout(`+${r}`,`gold`,t.combo>1?`Combo x${Math.min(t.combo,5)}`:void 0),this.d.input().vibrate([20,30,20]);let i=t.targets.indexOf(n);t.targets[i]=this.randomTarget(`t${Date.now()}`),setTimeout(()=>this.chal&&this.d.stage.setTargets(this.chal.targets.map(e=>({...e,color:`#ffc94a`}))),450),this.refreshChallengeHud()}refreshChallengeHud(){let e=this.chal;if(!e)return;let t=Tg(e.id),n=this.d.stats().challengeBest[e.id]??0,r=t.goal;t.seconds&&(r=`${Math.ceil(Math.max(0,e.timeLeft))}s left`),t.feeds&&(r=`${e.feedsLeft} balls left`),e.id===`rally`&&(r=`${e.attempts} tries left · current ${e.rally}`),this.d.ui.hud.setChallenge({name:t.name,score:e.score,best:n,detail:r})}finishChallenge(){let e=this.chal,t=Tg(e.id),n=this.d.stats(),r=n.challengeBest[e.id]??0,i=[];e.score>r&&(n.challengeBest[e.id]=e.score,i.push(`New ${t.name} best: ${e.score} ${t.unit}`)),this.updateCareerFromTally(n),this.d.saveStats(),this.phase=`over`,this.overT=0;let a={title:e.score>r?`New Record!`:`Challenge Complete`,won:e.score>r,mode:`challenge`,games:[],stats:[{label:`Score`,value:`${e.score} ${t.unit}`},{label:`Personal best`,value:`${Math.max(r,e.score)} ${t.unit}`},{label:`Longest rally`,value:`${this.tally.longestRally}`},{label:`Fastest shot`,value:`${Math.round(this.tally.fastest*3.6)} km/h`}],newRecords:i};e.score>r&&(this.d.stage.fx.confetti(),this.d.sfx.win()),this.pendingResult=a}pendingResult=null;onFinished=()=>{};finishMatch(){let e=this.board;if(this.versus){let t=e.games.player>e.games.opponent?`player`:`opponent`,n=e=>`${Math.round((this.humans[e]?.fastest??0)*3.6)} km/h`;this.pendingResult={title:`${this.nameOf(t)} wins!`,won:!0,mode:`versus`,games:e.gameScores.map(e=>({...e})),stats:[{label:`${this.nameOf(`player`)} fastest`,value:n(`player`)},{label:`${this.nameOf(`opponent`)} fastest`,value:n(`opponent`)},{label:`Longest rally`,value:`${this.tally.longestRally}`},{label:`Games`,value:`${e.games.player} – ${e.games.opponent}`}],newRecords:[]};return}let t=e.games.player>e.games.opponent,n=this.d.stats(),r=[];this.tally.longestRally>n.longestRally&&n.matchesPlayed>0&&r.push(`Longest rally: ${this.tally.longestRally}`),this.tally.fastest*3.6>n.fastestShotKmh&&n.matchesPlayed>0&&r.push(`Fastest shot: ${Math.round(this.tally.fastest*3.6)} km/h`),n.matchesPlayed++,t&&n.matchesWon++,n.aces+=this.tally.aces,n.pointsWon+=this.tally.pointsWon,n.pointsLost+=this.tally.pointsLost,this.updateCareerFromTally(n),this.d.saveStats();let i=this.tally.pointsWon+this.tally.pointsLost;this.pendingResult={title:t?`Victory!`:`Defeat`,won:t,mode:`match`,games:e.gameScores.map(e=>({...e})),stats:[{label:`Points won`,value:`${this.tally.pointsWon} / ${i}`},{label:`Winners`,value:`${this.tally.winners}`},{label:`Unforced errors`,value:`${this.tally.errors}`},{label:`Aces`,value:`${this.tally.aces}`},{label:`Longest rally`,value:`${this.tally.longestRally}`},{label:`Fastest shot`,value:`${Math.round(this.tally.fastest*3.6)} km/h`}],newRecords:r}}updateCareerFromTally(e){e.longestRally=Math.max(e.longestRally,this.tally.longestRally),e.fastestShotKmh=Math.max(e.fastestShotKmh,Math.round(this.tally.fastest*3.6))}onSwing(e,t,n=!1){let r=this.humans[e];r&&this.active&&!this.paused&&this.mode!==`demo`&&(n||this.d.ui.hud.setSwingMeter(t.power,e),this.phase===`serve`&&this.server===e&&!this.machine?(r.pending=[{e:t,at:this.clock}],this.toss()):this.phase===`toss`&&this.server===e?r.pending[0]&&t.power>r.pending[0].e.power&&(r.pending[0].e=t):this.phase!==`rally`||this.ref.expecting!==e?(r.swingT=0,r.swingPower=t.power,this.d.sfx.whoosh(t.power*.6)):(r.pending.push({e:t,at:this.clock}),r.pending.length>4&&r.pending.shift()))}tap(e){let t=this.inputFor(e);if(!t||!this.humans[e])return;let n={...t.state,orientation:t.state.orientation.clone()};this.onSwing(e,{time:performance.now(),power:.5,dir:{x:0,y:.15,z:1},paddle:n},!0)}nudgeAim(e,t){let n=this.humans[e];n&&this.active&&!this.paused&&(n.aimOverride=(n.aimOverride??0)===-t?0:t,this.d.sfx.ui(`move`))}timing(){let e=this.d.settings().assist;return Ag(this.lesson?Math.max(e,.85):e)}humanCanStrike(e){if(!this.ref.readyToStrike)return!1;let t=this.ball.state.pos;return t.y<zg-.12||t.y>zg+1.1?!1:e.s*t.z>-.05}fakeSwing(e){let t={...this.d.input().state,aimX:(Math.random()-.5)*1.4,aimY:Math.random()*.6-.2};this.onSwing(`player`,{time:performance.now(),power:e,dir:{x:(Math.random()-.5)*.4,y:.2,z:.9},paddle:t})}gradeFx(e,t,n,r){this.mode!==`demo`&&this.d.ui.hud.hitGrade(t,n,r,this.versus?e.side:void 0)}updateHumanStrike(e){let t=e.intercept;if(this.autoSwing&&e.side===`player`&&this.phase===`rally`&&this.ref.expecting===`player`&&t){if(e.autoAt===null){let n=(Math.random()+Math.random()+Math.random()-1.5)*this.autoSwing;e.autoAt=Math.max(t.at+t.t-Eg.sweet-n,this.lastHitAt+.32)}!e.autoDone&&this.clock>=e.autoAt&&(e.autoDone=!0,this.fakeSwing(.3+Math.random()*.5))}if(this.phase!==`rally`||this.ref.expecting!==e.side){e.pending.length=0;return}if(!t){e.pending=e.pending.filter(e=>this.clock-e.at<1.2);return}let n=this.timing(),r=t.at+t.t,i=r-this.clock,a=e.pending.length;if(e.pending=e.pending.filter(e=>r-e.at<=n.openAt+Eg.buffer&&r-e.at>=n.lateLimit),e.pending.length<a&&i>0&&!e.tooEarlyShown&&(e.tooEarlyShown=!0,this.gradeFx(e,`TOO EARLY`,`neutral`,`Wait for the ring to close`)),!e.pending.length){i<n.lateLimit&&!e.missShown&&(e.missShown=!0,this.gradeFx(e,`SWING!`,`bad`,`Swing or tap when the ring turns green`));return}if(i>.012)return;if(!this.humanCanStrike(e)){i<n.lateLimit-.15&&(e.pending.length=0);return}let o=null,s=e.pending[0];for(let t of e.pending){let e=jg(r-t.at,n);(!o||e.quality>o.g.quality)&&(o={g:e}),t.e.power>s.e.power&&(s=t)}e.pending.length=0,this.humanHit(e,s.e,o.g)}humanHit(e,t,n){let r=this.d.settings(),i=this.ball.state.pos.clone();i.y=Math.max(i.y,zg+.05);let a=t.paddle,o=Lg(t.power*(.75+.25*r.sensitivity),.05,1),s=e.aimOverride??Pg(a.aimX,t.dir.x),c=Fg({power:o,grade:n.grade,quality:n.quality,zone:s,lift:t.dir.y,face:a.face,aboveNet:i.y-(zg+q.netHeight),halfWidth:sd}),l=Hg(new V(c.x,zg,-(.2+c.depth*(J-.25))),e.s),u=Hg(new V(-c.topspin,Lg(t.dir.x,-1,1)*100*o,0),e.s),{speed:d,error:f}=c;if(this.mode===`match`){let e=Eg.vsCpu[this.cfg.difficulty];c.kind!==`smash`&&(d=Math.min(d,e.maxSpeed)),(n.grade===`early`||n.grade===`late`)&&(f*=e.errorScale,d*=1-.1*(e.errorScale-1))}let{vel:p,spin:m}=cg(i,{target:l,speed:d,spin:u,error:f},Math.random);this.applyHit(e.side,i,p,m,c.kind,o,n.quality),e.lastKind=c.kind,e.lastZone=s,e.lastGrade=n.grade,e.aimOverride=null,e.swingT=0,e.swingPower=o;let h=this.inputFor(e.side);r.haptics&&h?.vibrate(n.grade===`perfect`?[40,30,40]:Math.round(22+o*35)),this.d.phone({sound:`bat`,q:n.grade===`perfect`?1:n.grade===`good`?.8:.5},e.side);let[g,_,v]={perfect:[`PERFECT`,`gold`,c.kind===`smash`?`Smash!`:c.kind===`loop`?`Topspin loop`:void 0],good:[`GOOD`,`good`,void 0],early:[`EARLY`,`neutral`,`Wait a beat longer`],late:[`LATE`,`neutral`,`Swing a little sooner`]}[n.grade];this.gradeFx(e,g,_,v),this.onLessonHit(e,s,o,n.grade)}applyHit(e,t,n,r,i,a,o){let s=this.ref.onHit(e);this.lastHitAt=this.clock,this.ball.set(t,n,r),this.phaseT=0;let c=n.length();this.lastHitSpeed=c;let l=this.humans[e];l&&this.mode!==`demo`&&(l.fastest=Math.max(l.fastest,c),e===`player`&&(this.tally.hits++,this.tally.fastest=Math.max(this.tally.fastest,c)),this.d.ui.hud.setShotSpeed(Math.round(c*3.6)));for(let e of[this.humans.player,this.humans.opponent])e&&(e.interceptDirty=!0);this.chal?.id===`rally`&&(this.chal.rally=this.ref.rally,this.refreshChallengeHud()),this.d.ui.hud.setRally(this.ref.rally),this.d.sfx.paddleHit(a,i),this.d.stage.fx.hit(t,a,e),a>.85&&i===`smash`&&this.d.stage.shake(.25),this.mode!==`demo`&&this.ref.rally===8&&this.d.sfx.applause(.3),this.d.stage.setCameraMode(this.mode===`demo`?`menu`:`play`),s&&this.endPoint(s);let u=cd(e),d=this.aiFor(u);d&&this.phase===`rally`&&this.planFor(d,u)}aiFor(e){return this.humans[e]?null:e===`opponent`?this.machine?null:this.opp:this.auto}planFor(e,t){let n=this.scoreFor(t),r=e.planReturn(this.ball.state,{opponentBody:this.bodyOf(cd(t)),rally:this.ref.rally,myScore:n.mine,theirScore:n.theirs}),i=r?{...r,at:this.clock}:null;t===`opponent`?this.oppPlan=i:this.autoPlan=i}runAIPlan(e){let t=e===`opponent`?this.oppPlan:this.autoPlan;if(!t||this.phase!==`rally`||this.ref.expecting!==e||this.clock<t.at+t.t||(e===`opponent`?this.oppPlan=null:this.autoPlan=null,t.willMiss))return;let n=this.ball.state.pos;if(n.distanceTo(t.strikePos)>.35||!this.ref.readyToStrike)return;let{vel:r,spin:i}=cg(n.clone(),t.request,Math.random);this.applyHit(e,n.clone(),r,i,t.kind,Lg(t.request.speed/20,.1,1),1-t.request.error)}setLesson(e){let{ui:t}=this.d;if(e>=Ig.length){this.lesson=null,this.feed={speed:[5.5,8],spin:`mixed`},t.hud.setPrompt(null),t.hud.callout(`YOU'RE READY!`,`gold`,`Free practice now — or Pause → Quit to play a match`),this.d.stage.fx.confetti(),this.d.sfx.win(),t.hud.setChallenge({name:`Practice`,score:this.practiceStreak,best:this.practiceBest,detail:`Return the machine balls`});return}let n=Ig[e];this.lesson={...n,step:e,count:0},this.feed={...n.feed},t.hud.setPrompt(n.title),this.refreshLessonHud()}refreshLessonHud(){let e=this.lesson;e&&this.d.ui.hud.setChallenge({name:`Lesson ${e.step+1} / ${Ig.length}`,score:e.count,best:e.need,detail:e.detail})}onLessonHit(e,t,n,r){let i=this.lesson;if(i&&e.side===`player`){if(!i.check({zone:t,power:n,grade:r}))i.step>=2&&i.step<=3&&this.d.ui.hud.callout(t===0?`MIDDLE`:t<0?`LEFT`:`RIGHT`,`neutral`,i.detail),i.step===4&&this.d.ui.hud.callout(`HARDER!`,`neutral`,`Really whip it`);else if(i.count++,this.refreshLessonHud(),i.count>=i.need){let e=i.step+1;e<Ig.length&&this.d.ui.hud.callout(`GREAT!`,`good`,`Lesson ${e+1} of ${Ig.length}`),setTimeout(()=>this.active&&this.mode===`practice`&&this.lesson?.step===i.step&&this.setLesson(e),900)}}}update(e){if(!this.active||this.paused)return;this.slowmoT>0&&(this.slowmoT-=e),this.powerT>0&&(this.powerT-=e,this.powerT<=0?this.endPower():this.d.ui.hud.setSlowMo({charges:this.powerCharges,max:fd.perGame,active:!0,remaining:this.powerT/fd.duration})),this.timeScale=this.slowmoT>0?.35:this.powerT>0?fd.timeScale:1;let t=this.lesson?.slow??1;if(this.phase===`rally`&&this.mode!==`demo`){let e=this.timing();for(let n of[this.humans.player,this.humans.opponent]){if(!n?.intercept||this.ref.expecting!==n.side)continue;let r=n.intercept.at+n.intercept.t-this.clock;r<e.openAt&&r>e.lateLimit&&(t*=e.approachScale)}}this.approachK+=(t-this.approachK)*(1-Math.exp(-e*10)),this.timeScale*=this.approachK;let n=e*this.timeScale;switch(this.clock+=n,this.phaseT+=n,this.chal&&Tg(this.chal.id)?.seconds&&this.phase!==`over`&&(this.chal.timeLeft-=n,Math.floor(this.chal.timeLeft+n)!==Math.floor(this.chal.timeLeft)&&this.refreshChallengeHud(),this.chal.timeLeft<=0&&this.finishChallenge()),this.phase){case`serve`:this.updateServe();break;case`toss`:this.updateToss(n);break;case`rally`:this.stepBall(n,!0);for(let e of[this.humans.player,this.humans.opponent])e&&this.updateHumanStrike(e);this.runAIPlan(`opponent`),this.runAIPlan(`player`),this.phaseT>6&&this.endPoint({winner:this.ref.lastHitter??`opponent`,reason:`missed`,rally:this.ref.rally,ace:!1});break;case`dead`:this.stepBall(n,!1),this.phaseT>1.7&&(this.d.stage.avatarReact(`player`,`idle`),this.d.stage.avatarReact(`opponent`,`idle`),this.beginPoint());break;case`over`:if(this.stepBall(n,!1),this.overT+=e,this.overT>2.2){if(this.mode===`demo`){this.start(this.cfg);return}!this.pendingResult&&this.board&&this.finishMatch();let e=this.pendingResult;this.pendingResult=null,this.phase=`idle`,this.timeScale=1,e&&this.onFinished(e)}}for(let e of[this.humans.player,this.humans.opponent])e&&this.updateHumanPose(e,n);this.humans.opponent||this.opp.update(n),this.auto?.update(n),this.present()}updateServe(){let e=this.humans.player;this.autoSwing&&e&&this.server===`player`&&!this.machine&&this.phaseT>1.2&&!e.pending.length&&this.fakeSwing(.5),this.machine?this.phaseT>(this.chal?.id===`speed`?1.4:1.1)&&this.launchFeed():(this.placeBallInHand(),this.serveReq&&this.phaseT>=0&&this.toss())}updateToss(e){this.ball.step(e);let t=this.ball.state;if(t.vel.y<0&&t.pos.y<=zg+.27){let e=t.pos.clone(),n=this.humans[this.server];if(n){let t=n.pending[0]?.e;n.pending=[];let r=Lg(t?.power??.4,.1,1),i=t?.paddle,a=n.aimOverride??Pg(i?.aimX??0,t?.dir.x??0);n.aimOverride=null;let o=Hg(new V(a*sd*.5,zg,-(.65+r*.45)),n.s),s=Hg(new V((i?.face??0)>.5||(t?.dir.y??0)<-.45?250+150*r:-(150+200*r),0,0),n.s),c={target:o,speed:4.8+r*4.5,spin:s,error:.05},{vel:l,spin:u}=ug(e,this.server,c,Math.random);this.ref.onHit(this.server),this.ball.set(e,l,u),this.afterServe(this.server,l.length(),r)}else if(this.serveReq){let{vel:t,spin:n}=ug(e,this.server,this.serveReq.request,Math.random);this.ref.onHit(this.server),this.ball.set(e,t,n),this.afterServe(this.server,t.length(),.4)}}}afterServe(e,t,n){this.lastHitAt=this.clock,this.phase=`rally`,this.phaseT=0,this.lastHitSpeed=t;for(let e of[this.humans.player,this.humans.opponent])e&&(e.interceptDirty=!0);this.d.ui.hud.setRally(1),this.d.sfx.paddleHit(n*.7,`serve`),this.d.stage.fx.hit(this.ball.state.pos,n*.6,e),this.d.stage.setCameraMode(this.mode===`demo`?`menu`:`play`);let r=this.humans[e];r&&(r.swingT=0,r.swingPower=n,this.inputFor(e)?.vibrate(25)),this.d.phone({screen:`rally`},`player`),this.versus&&this.d.phone({screen:`rally`},`opponent`);let i=cd(e),a=this.aiFor(i);a&&this.planFor(a,i)}stepBall(e,t){let n=this.ball.step(e);for(let e of n){if(this.presentEvent(e),!t||this.phase!==`rally`)continue;if(e.type===`bounce`||e.type===`net`||e.type===`edge`)for(let e of[this.humans.player,this.humans.opponent])e&&(e.interceptDirty=!0);e.type===`bounce`&&e.side===`opponent`&&this.ref.lastHitter===`player`&&this.ref.rally>1&&this.checkTargets(e.pos);let n=this.ref.onEvent(e);if(n===`let`){this.phase=`dead`,this.phaseT=.3,this.d.ui.hud.callout(`LET`,`neutral`,`Replay the serve`);break}if(n){this.endPoint(n);break}if(e.type===`net`){let e=this.aiFor(this.ref.expecting);e&&this.planFor(e,this.ref.expecting)}}for(let n of[this.humans.player,this.humans.opponent])if(n){if(t&&this.phase===`rally`&&this.ref.expecting===n.side){n.trajTimer-=e;let t=n.intercept&&n.intercept.at+n.intercept.t-this.clock<.15;if(n.interceptDirty||n.trajTimer<=0&&!t){n.interceptDirty=!1,n.trajTimer=.12;let e=fg(this.ball.state,n.side,this.ref.readyToStrike);if(n.intercept=e?{...e,at:this.clock}:null,this.ref.readyToStrike)n.landing=null;else{let t=Xh(this.ball.state,Math.min(1.8,(e?.t??1.4)+.1),1/90).find(e=>e.bounces>0&&n.s*e.pos.z>0);n.landing=t?t.pos.clone():null}if(this.d.settings().showTrajectory&&this.mode!==`demo`&&!this.versus){let t=Xh(this.ball.state,Math.min(1.6,(e?.t??1.2)+.15),1/60);this.d.stage.setTrajectory(t.map(e=>e.pos))}}}else n.intercept&&(n.intercept=null,n.landing=null,n.tooEarlyShown=n.missShown=!1,n.autoAt=null,n.autoDone=!1,n.side===`player`&&this.d.stage.setTrajectory(null))}}presentEvent(e){let{sfx:t,stage:n}=this.d;switch(e.type){case`bounce`:t.tableBounce(e.speed),n.fx.bounce(e.pos,e.side);break;case`edge`:t.tableBounce(3),n.fx.bounce(e.pos,e.side);break;case`net`:t.netHit(),n.fx.net(e.pos);break;case`floor`:e.speed>.6&&t.floorBounce(e.speed),e.speed>2&&n.fx.floor(e.pos)}}updateHumanPose(e,t){let n=this.inputFor(e.side);if(!n)return;let r=n.state,i=this.handOf(e.side)===`left`?-1:1,a=e.intercept,o=this.phase===`rally`&&this.ref.expecting===e.side&&a?Hg(a.pos,e.s):null,s=o?o.x*i<-.3:!1;e.backhand=s;let c=(s?-.12:.42)*i;o?e.setTarget(o.x-c,o.z+.38):this.phase===`serve`||this.phase===`toss`?e.setTarget(this.server===e.side?-.25*i:.1*i,J+.55):e.setTarget(-c*.4,J+.75),e.update(t);let l=Hg(e.body,e.s),u=new V(l.x+c,zg+.16+r.aimY*.1,l.z-(s?.42:.3));if(o){let e=Lg(1-(a.at+a.t-this.clock-.05)/.6,0,1)*.97;u.lerp(o,e)}if(e.swingT>=0){let t=Math.sin(Math.PI*e.swingT);u.z-=t*(.12+.25*e.swingPower),u.y+=e.swingT*.18*e.swingPower,u.x-=t*.18*i*(s?-1:1)*e.swingPower}e.paddlePos.lerp(Hg(u,e.s),1-Math.exp(-t*28)),e.paddleRot.copy(r.orientation),e.s<0&&e.paddleRot.premultiply(Rg)}cueFor(e){if(this.mode===`demo`||this.phase!==`rally`||this.ref.expecting!==e.side||!e.intercept)return null;let t=this.timing(),n=e.intercept.at+e.intercept.t-this.clock;if(n>t.openAt+.6||n<t.lateLimit-.1)return null;let r=this.inputFor(e.side),i=e.aimOverride??Pg(r?.state.aimX??0,0),a=-(.2+.62*(J-.25)),o=t=>Hg(new V(t*sd*Eg.padX,zg,a),e.s);return{ball:this.ball.state.pos,fill:Mg(n,t),state:e.pending.length?`armed`:Ng(n,t),landing:e.landing,pads:[o(-1),o(0),o(1)],zone:i}}present(){let{stage:e,ui:t}=this.d,n=this.ball.state;e.setBall(n.pos,n.spin,this.ballVisible);let r=this.humans.player;r?e.setAvatar(`player`,r.pose(),{backhand:r.backhand,handedness:this.handOf(`player`),swing:Math.max(0,r.swingT)}):this.auto&&e.setAvatar(`player`,this.auto.paddle,{handedness:`right`,backhand:this.auto.backhand,swing:this.auto.swing});let i=this.humans.opponent;if(i)e.setAvatar(`opponent`,i.pose(),{backhand:i.backhand,handedness:this.handOf(`opponent`),swing:Math.max(0,i.swingT)});else{let t=this.opp.paddle;e.setAvatar(`opponent`,{body:t.body,paddlePos:t.paddlePos,paddleRot:t.paddleRot.clone().multiply(Rg)},{handedness:`right`,backhand:this.opp.backhand,swing:this.opp.swing})}if(e.setHitCue(`player`,r?this.cueFor(r):null),e.setHitCue(`opponent`,i?this.cueFor(i):null),this.mode!==`demo`){t.hud.setSwingMeter(this.d.input().state.swing,`player`);let e=this.d.input2();this.versus&&e&&t.hud.setSwingMeter(e.state.swing,`opponent`)}}},Gg=`spinshot.settings.v1`,Kg=`spinshot.stats.v1`;function qg(e,t){try{let n=localStorage.getItem(e);return n?{...structuredClone(t),...JSON.parse(n)}:structuredClone(t)}catch{return structuredClone(t)}}function Jg(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}var Yg=()=>qg(Gg,dd),Xg=e=>Jg(Gg,e),Zg=()=>qg(Kg,pd),Qg=e=>Jg(Kg,e),$g=()=>structuredClone(pd),e_=new URLSearchParams(location.search),t_=e_.has(`debug`),n_=Yg(),r_=Zg(),i_=new Vf(document.getElementById(`app`),{quality:n_.quality,theme:n_.theme}),Q=new Vp(document.getElementById(`ui`),n_,r_,wg),a_=new Xp,o_=new pm(document.body),s_=Wm(),c_=s_?new Jm({layout:`swing`,title:`Table Tennis`}):new Hm,l_=new Hm({storageKey:`spinshot.room.p2`});s_&&(l_.controllerUrl=async()=>`${(await fetch(`/api/info`).then(e=>e.json()).catch(()=>null))?.padUrl||`${location.origin}/pad`}?pin=${l_.pin}&layout=swing&title=Player%202`);var u_=null,d_=null,f_=`right`,p_=!1,m_=!1,h_=!1,g_=``,__=[``,``],v_=`#ff6b4a`,y_=`#2ec4b6`,b_=()=>!!u_&&c_.status===`connected`,x_=()=>!!d_&&l_.status===`connected`,S_=()=>b_()?u_:o_,C_=()=>x_()?d_:null,w_=(e,t)=>{(e===`player`?b_():x_())&&(e===`player`?c_:l_).send(t)},T_=e=>{w_(`player`,e),w_(`opponent`,e)},$=new Wg({stage:i_,ui:Q,sfx:a_,input:S_,input2:C_,hand2:()=>f_,settings:()=>n_,stats:()=>r_,saveStats:()=>{Qg(r_),Q.setStats(r_)},phone:(e,t=`player`)=>{if(`score`in e){let e=$.phoneScore(t);e&&w_(t,{t:`score`,...e})}else`power`in e?w_(`player`,{t:`power`,...$.phonePower()}):`sound`in e?w_(t,{t:`sound`,name:e.sound,q:e.q}):w_(t,{t:`screen`,screen:e.screen,label:e.label})}});function E_(e){let t=n_;n_=e,Xg(e),e.theme!==t.theme&&i_.setTheme(e.theme),e.quality!==t.quality&&i_.setQuality(e.quality),a_.setVolumes(e.masterVolume,e.musicVolume,e.sfxVolume),u_?.setHandedness(e.handedness),u_?.setSensitivity(e.sensitivity)}function D_(){$.start({mode:`demo`,difficulty:`pro`,gamesToWin:1}),S_().setSwingEnabled(!1),d_?.setSwingEnabled(!1)}function O_(e=`main`){$.stop(),Q.hud.show(!1),Q.show(e),D_(),a_.music(`menu`),T_({t:`screen`,screen:`menu`}),w_(`player`,{t:`power`,charges:-1,max:0,active:!1})}function k_(e){$.active&&$.mode!==`demo`&&($.paused=e,S_().setSwingEnabled(!e),$.versus&&C_()?.setSwingEnabled(!e),a_.muffleMusic(e),e?(Q.show(`pause`),T_({t:`screen`,screen:`paused`})):(Q.show(`none`),T_({t:`screen`,screen:`rally`})))}function A_(){p_&&c_.controllerUrl().then(e=>{let t=`${c_.pin}|${e}|${c_.status}|${c_.transport}`;t!==g_&&(g_=t,Q.setPairing({pin:c_.pin,url:e,status:c_.status,transport:c_.transport}))}).catch(()=>{})}function j_(){p_||(p_=!0,c_.start().catch(e=>Q.setPairing({pin:``,url:``,status:`error`,transport:`none`,detail:String(e?.message??e)})))}function M_(){m_||(m_=!0,l_.start().catch(e=>Q.setVersusPairing(2,{pin:``,url:``,status:`error`,transport:`none`,detail:String(e?.message??e)})))}function N_(){[[1,c_,p_],[2,l_,m_]].forEach(([e,t,n])=>{n&&t.controllerUrl().then(n=>{let r=`${t.pin}|${n}|${t.status}|${t.transport}`;r!==__[e-1]&&(__[e-1]=r,Q.setVersusPairing(e,{pin:t.pin,url:n,status:t.status,transport:t.transport}))}).catch(()=>{})})}c_.on(`status`,(e,t)=>{A_(),N_(),t&&Q.setPairing({pin:c_.pin,url:``,status:e,transport:c_.transport,detail:t}),Q.setController(b_()?`phone`:`mouse`,e),e===`connected`?(u_||(u_=new Fm(c_,{handedness:n_.handedness,sensitivity:n_.sensitivity}),u_.onButton(e=>P_(e,`player`)),Q.setController(`phone`,e)),$.bindInput(),a_.ui(`select`),Q.toast(`Phone connected`),(Q.screen===`pair`||Q.screen===`title`||Q.screen===`main`)&&(h_=!0,u_.beginCalibration(),Q.show(`calibrate`),c_.send({t:`screen`,screen:`calibrate`,label:`Hold your phone upright like a paddle, screen facing you`})),Q.screen===`versus-pair`?(u_.beginCalibration(),c_.send({t:`player`,n:1,color:v_})):c_.send({t:`theme`,color:v_}),w_(`player`,{t:`power`,...$.phonePower()})):(e===`disconnected`||e===`waiting`)&&($.bindInput(),$.active&&$.mode!==`demo`&&!$.paused&&(k_(!0),Q.toast(`Phone disconnected — reconnect or continue with mouse`)))}),l_.on(`status`,e=>{N_(),e===`connected`?(d_||(d_=new Fm(l_,{handedness:f_,sensitivity:n_.sensitivity}),d_.onButton(e=>P_(e,`opponent`))),d_.beginCalibration(),$.bindInput(),a_.ui(`select`),Q.toast(`Player 2 connected`),l_.send({t:`player`,n:2,color:y_}),l_.send({t:`power`,charges:-1,max:0,active:!1}),l_.send({t:`screen`,screen:`calibrate`,label:`Player 2 — hold your phone upright like a paddle`}),b_()&&c_.send({t:`player`,n:1,color:v_})):(e===`disconnected`||e===`waiting`)&&($.bindInput(),$.active&&$.versus&&!$.paused&&(k_(!0),Q.toast(`Player 2 disconnected — waiting for their phone`)))}),l_.on(`message`,e=>{e.t===`hello`&&e.hand&&(f_=e.hand)});function P_(e,t=`player`){a_.unlock();let n=Q.screen!==`none`;if(e===`recenter`)(t===`opponent`?d_:S_())?.recenter(),Q.toast(t===`opponent`?`Player 2 paddle recentered`:`Paddle recentered`);else if(e===`power`)!n&&t===`player`&&$.activatePower();else if(!n)e===`pause`||e===`back`?k_(!0):e===`action`?$.tap(t):(e===`left`||e===`right`)&&$.nudgeAim(t,e===`left`?-1:1);else switch(e){case`up`:case`down`:case`left`:case`right`:Q.navigate(e);break;case`action`:Q.activate();break;case`back`:Q.back();break;case`pause`:Q.screen===`pause`?k_(!1):Q.back()}}o_.onButton(e=>P_(e,`player`)),Q.onSound=e=>a_.ui(e),Q.onPause=()=>k_(!0),Q.onCalibrateDone=()=>{h_=!1,S_().recenter(),Q.show(`main`)},Q.onStart=e=>{a_.unlock(),Q.show(`none`),setTimeout(()=>{$.start(e),S_().setSwingEnabled(!0)},120)},Q.onSettings=e=>E_(e),Q.onResume=()=>k_(!1),Q.onQuit=()=>O_(`main`),Q.onRestart=()=>{let e=F_;Q.show(`none`),e&&setTimeout(()=>$.start(e),120)},Q.onRecenter=()=>{S_().recenter(),Q.toast(`Paddle recentered`)},Q.onPair=()=>{j_(),A_()},Q.onVersusPair=()=>{j_(),M_(),b_()&&c_.send({t:`player`,n:1,color:v_}),__[0]=__[1]=``,N_()},Q.onUseMouse=()=>{Q.show(`main`),Q.toast(`Mouse: click (or Space) when the ring turns green · move left/right to aim`)},Q.onResetStats=()=>{r_=$g(),Qg(r_),Q.setStats(r_)};var F_=null,I_=$.start.bind($);$.start=e=>{e.mode!==`demo`&&(F_=e),I_(e)},$.onFinished=e=>{Q.hud.show(!1),Q.showResult(e),S_().setSwingEnabled(!1),d_?.setSwingEnabled(!1),a_.music(`menu`),T_({t:`screen`,screen:`result`,label:e.title})};var L_=()=>{a_.unlock(),a_.setVolumes(n_.masterVolume,n_.musicVolume,n_.sfxVolume),a_.music($.active&&$.mode!==`demo`?`match`:`menu`),window.removeEventListener(`pointerdown`,L_),window.removeEventListener(`keydown`,L_)};window.addEventListener(`pointerdown`,L_),window.addEventListener(`keydown`,L_),document.addEventListener(`visibilitychange`,()=>{document.hidden&&!t_&&k_(!0)}),window.addEventListener(`beforeunload`,()=>{c_.stop(),l_.stop()}),Q.setController(`mouse`,`idle`),Q.show(`title`),D_(),j_(),e_.has(`auto`)&&($.autoSwing=Number(e_.get(`auto`))||.05),t_&&(Object.assign(window,{match:$,stage:i_,ui:Q,sfx:a_,link:c_,link2:l_,mouse:o_}),Object.defineProperty(window,"phone",{get:()=>u_})),e_.has(`play`)&&Q.onStart({mode:e_.get(`play`)||`match`,difficulty:n_.difficulty,gamesToWin:1,challengeId:e_.get(`challenge`)??void 0});var R_=performance.now(),z_=null,B_=0,V_=0;t_&&(z_=document.createElement(`div`),z_.style.cssText=`position:fixed;bottom:8px;right:8px;font:12px ui-monospace,monospace;color:#1d2333;z-index:99;background:#fff9;padding:4px 6px;border-radius:6px`,document.body.appendChild(z_));function H_(e){let t=Math.min(.05,(e-R_)/1e3);if(R_=e,o_.update(t),u_?.update(t),d_?.update(t),Q.screen===`calibrate`&&u_&&(Q.setCalibration(u_.calibration,u_.state),h_&&u_.calibration>=1&&(h_=!1,a_.score(!0),c_.send({t:`haptic`,pattern:[40,60,40]}),setTimeout(()=>Q.screen===`calibrate`&&Q.show(`main`),700))),b_()&&Q.screen!==`none`&&Q.screen!==`calibrate`){let e=u_.state;Q.pointer((e.aimX+1)/2,(1-e.aimY)/2,!0)}else Q.pointer(0,0,!1);$.update(t),i_.update(t,{ball:$.focusBall,player:$.focusPlayer,opponent:$.focusOpponent}),i_.render(),z_&&(B_++,V_+=t,V_>.5&&(z_.textContent=`${Math.round(B_/V_)} fps · ${c_.status}/${c_.transport}`,B_=0,V_=0)),requestAnimationFrame(H_)}requestAnimationFrame(H_),t_&&Object.assign(window,{advance(e,t=!1){let n=Math.round(e*60);for(let e=0;e<n;e++)o_.update(1/60),u_?.update(1/60),d_?.update(1/60),$.update(1/60),i_.update(1/60,{ball:$.focusBall,player:$.focusPlayer,opponent:$.focusOpponent});t&&i_.render()}});