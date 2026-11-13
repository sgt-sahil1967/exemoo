(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=1e3,t=1001,n=1002,r=1003,i=1004,a=1005,o=1006,s=1007,c=1008,l=1009,u=1010,d=1011,f=1012,p=1013,m=1014,h=1015,g=1016,_=1017,v=1018,y=1020,b=35902,x=35899,S=1021,C=1022,w=1023,T=1026,E=1027,D=1028,ee=1029,te=1030,O=1031,ne=1033,k=33776,A=33777,j=33778,re=33779,M=35840,ie=35841,ae=35842,oe=35843,se=36196,ce=37492,le=37496,ue=37488,N=37489,de=37490,fe=37491,pe=37808,me=37809,he=37810,ge=37811,_e=37812,ve=37813,ye=37814,be=37815,xe=37816,Se=37817,Ce=37818,we=37819,Te=37820,Ee=37821,De=36492,Oe=36494,ke=36495,Ae=36283,je=36284,Me=36285,Ne=36286,Pe=2300,P=2301,Fe=2302,Ie=2303,Le=2400,F=2401,Re=2402,ze=3200,Be=`srgb`,Ve=`srgb-linear`,He=`linear`,Ue=`srgb`,We=7680,Ge=35044,Ke=35048,qe=2e3;function Je(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Ye(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Xe(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ze(){let e=Xe(`canvas`);return e.style.display=`block`,e}var Qe={};function $e(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function et(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function tt(...e){e=et(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function I(...e){e=et(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function nt(...e){let t=e.join(` `);t in Qe||(Qe[t]=!0,tt(...e))}function rt(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var it={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},at=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},ot=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),st=Math.PI/180,ct=180/Math.PI;function lt(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(ot[e&255]+ot[e>>8&255]+ot[e>>16&255]+ot[e>>24&255]+`-`+ot[t&255]+ot[t>>8&255]+`-`+ot[t>>16&15|64]+ot[t>>24&255]+`-`+ot[n&63|128]+ot[n>>8&255]+`-`+ot[n>>16&255]+ot[n>>24&255]+ot[r&255]+ot[r>>8&255]+ot[r>>16&255]+ot[r>>24&255]).toLowerCase()}function ut(e,t,n){return Math.max(t,Math.min(n,e))}function L(e,t){return(e%t+t)%t}function dt(e,t,n){return(1-n)*e+n*t}function ft(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:case Uint8ClampedArray:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}function pt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`THREE.MathUtils: Invalid component type.`)}}var R=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},mt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:tt(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ut(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},z=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(gt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(gt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ht.copy(this).projectOnVector(e),this.sub(ht)}reflect(e){return this.sub(ht.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ut(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ht=new z,gt=new mt,_t=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return nt(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(vt.makeScale(e,t)),this}rotate(e){return nt(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(vt.makeRotation(-e)),this}translate(e,t){return nt(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(vt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},vt=new _t,yt=new _t().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),bt=new _t().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function xt(){let e={enabled:!0,workingColorSpace:Ve,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Ct(e.r),e.g=Ct(e.g),e.b=Ct(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=wt(e.r),e.g=wt(e.g),e.b=wt(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?He:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return nt(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return nt(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Ve]:{primaries:t,whitePoint:r,transfer:He,toXYZ:yt,fromXYZ:bt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Be},outputColorSpaceConfig:{drawingBufferColorSpace:Be}},[Be]:{primaries:t,whitePoint:r,transfer:Ue,toXYZ:yt,fromXYZ:bt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Be}}}),e}var St=xt();function Ct(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function wt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Tt,Et=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Tt===void 0&&(Tt=Xe(`canvas`)),Tt.width=e.width,Tt.height=e.height;let t=Tt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Tt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Xe(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Ct(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Ct(t[e]/255)*255):t[e]=Ct(t[e]);return{data:t,width:e.width,height:e.height}}return tt(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Dt=0,Ot=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Dt++}),this.uuid=lt(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(kt(r[t].image)):e.push(kt(r[t]))}else e=kt(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function kt(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Et.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(tt(`Texture: Unable to serialize Texture.`),{})}var At=0,jt=new z,Mt=class r extends at{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,i=t,a=t,s=o,u=c,d=w,f=l,p=r.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:At++}),this.uuid=lt(),this.name=``,this.source=new Ot(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=a,this.magFilter=s,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new R(0,0),this.repeat=new R(1,1),this.center=new R(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new _t,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(jt).x}get height(){return this.source.getSize(jt).y}get depth(){return this.source.getSize(jt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){tt(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?tt(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x)}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y)}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Mt.DEFAULT_IMAGE=null,Mt.DEFAULT_MAPPING=300,Mt.DEFAULT_ANISOTROPY=1;var Nt=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ut(this.x,e.x,t.x),this.y=ut(this.y,e.y,t.y),this.z=ut(this.z,e.z,t.z),this.w=ut(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ut(this.x,e,t),this.y=ut(this.y,e,t),this.z=ut(this.z,e,t),this.w=ut(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ut(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Pt=class extends at{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:o,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Nt(0,0,e,t),this.scissorTest=!1,this.viewport=new Nt(0,0,e,t),this.textures=[];let r=new Mt({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:o,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Ot(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Ft=class extends Pt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},It=class extends Mt{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Lt=class extends Mt{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Rt=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/zt.setFromMatrixColumn(e,0).length(),i=1/zt.setFromMatrixColumn(e,1).length(),a=1/zt.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Vt,e,Ht)}lookAt(e,t,n){let r=this.elements;return Gt.subVectors(e,t),Gt.lengthSq()===0&&(Gt.z=1),Gt.normalize(),Ut.crossVectors(n,Gt),Ut.lengthSq()===0&&(Math.abs(n.z)===1?Gt.x+=1e-4:Gt.z+=1e-4,Gt.normalize(),Ut.crossVectors(n,Gt)),Ut.normalize(),Wt.crossVectors(Gt,Ut),r[0]=Ut.x,r[4]=Wt.x,r[8]=Gt.x,r[1]=Ut.y,r[5]=Wt.y,r[9]=Gt.y,r[2]=Ut.z,r[6]=Wt.z,r[10]=Gt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],ee=r[13],te=r[2],O=r[6],ne=r[10],k=r[14],A=r[3],j=r[7],re=r[11],M=r[15];return i[0]=a*x+o*T+s*te+c*A,i[4]=a*S+o*E+s*O+c*j,i[8]=a*C+o*D+s*ne+c*re,i[12]=a*w+o*ee+s*k+c*M,i[1]=l*x+u*T+d*te+f*A,i[5]=l*S+u*E+d*O+f*j,i[9]=l*C+u*D+d*ne+f*re,i[13]=l*w+u*ee+d*k+f*M,i[2]=p*x+m*T+h*te+g*A,i[6]=p*S+m*E+h*O+g*j,i[10]=p*C+m*D+h*ne+g*re,i[14]=p*w+m*ee+h*k+g*M,i[3]=_*x+v*T+y*te+b*A,i[7]=_*S+v*E+y*O+b*j,i[11]=_*C+v*D+y*ne+b*re,i[15]=_*w+v*ee+y*k+b*M,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,ee=d*g-f*h,te=_*ee-v*D+y*E+b*T-x*w+S*C;if(te===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/te;return e[0]=(o*ee-s*D+c*E)*O,e[1]=(r*D-n*ee-i*E)*O,e[2]=(m*S-h*x+g*b)*O,e[3]=(d*x-u*S-f*b)*O,e[4]=(s*T-a*ee-c*w)*O,e[5]=(t*ee-r*T+i*w)*O,e[6]=(h*y-p*S-g*v)*O,e[7]=(l*S-d*y+f*v)*O,e[8]=(a*D-o*T+c*C)*O,e[9]=(n*T-t*D-i*C)*O,e[10]=(p*x-m*y+g*_)*O,e[11]=(u*y-l*x-f*_)*O,e[12]=(o*w-a*E-s*C)*O,e[13]=(t*E-n*w+r*C)*O,e[14]=(m*v-p*b-h*_)*O,e[15]=(l*b-u*v+d*_)*O,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=zt.set(r[0],r[1],r[2]).length(),o=zt.set(r[4],r[5],r[6]).length(),s=zt.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Bt.copy(this);let c=1/a,l=1/o,u=1/s;return Bt.elements[0]*=c,Bt.elements[1]*=c,Bt.elements[2]*=c,Bt.elements[4]*=l,Bt.elements[5]*=l,Bt.elements[6]*=l,Bt.elements[8]*=u,Bt.elements[9]*=u,Bt.elements[10]*=u,t.setFromRotationMatrix(Bt),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=qe,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=qe,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},zt=new z,Bt=new Rt,Vt=new z(0,0,0),Ht=new z(1,1,1),Ut=new z,Wt=new z,Gt=new z,Kt=new Rt,qt=new mt,Jt=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(ut(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-ut(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(ut(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-ut(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(ut(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-ut(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:tt(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Kt.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Kt,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return qt.setFromEuler(this),this.setFromQuaternion(qt,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Jt.DEFAULT_ORDER=`XYZ`;var Yt=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}},Xt=0,Zt=new z,Qt=new mt,$t=new Rt,en=new z,tn=new z,nn=new z,rn=new mt,an=new z(1,0,0),on=new z(0,1,0),sn=new z(0,0,1),cn={type:`added`},ln={type:`removed`},un={type:`childadded`,child:null},dn={type:`childremoved`,child:null},fn=class e extends at{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Xt++}),this.uuid=lt(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new z,n=new Jt,r=new mt,i=new z(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Rt},normalMatrix:{value:new _t}}),this.matrix=new Rt,this.matrixWorld=new Rt,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yt,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Qt.setFromAxisAngle(e,t),this.quaternion.multiply(Qt),this}rotateOnWorldAxis(e,t){return Qt.setFromAxisAngle(e,t),this.quaternion.premultiply(Qt),this}rotateX(e){return this.rotateOnAxis(an,e)}rotateY(e){return this.rotateOnAxis(on,e)}rotateZ(e){return this.rotateOnAxis(sn,e)}translateOnAxis(e,t){return Zt.copy(e).applyQuaternion(this.quaternion),this.position.add(Zt.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(an,e)}translateY(e){return this.translateOnAxis(on,e)}translateZ(e){return this.translateOnAxis(sn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($t.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?en.copy(e):en.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),tn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$t.lookAt(tn,en,this.up):$t.lookAt(en,tn,this.up),this.quaternion.setFromRotationMatrix($t),r&&($t.extractRotation(r.matrixWorld),Qt.setFromRotationMatrix($t),this.quaternion.premultiply(Qt.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(I(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(cn),un.child=e,this.dispatchEvent(un),un.child=null):I(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ln),dn.child=e,this.dispatchEvent(dn),dn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$t.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$t.multiply(e.parent.matrixWorld)),e.applyMatrix4($t),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(cn),un.child=e,this.dispatchEvent(un),un.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tn,e,nn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(tn,rn,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};fn.DEFAULT_UP=new z(0,1,0),fn.DEFAULT_MATRIX_AUTO_UPDATE=!0,fn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var B=class extends fn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},pn={type:`move`},mn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new B,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new B,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new z),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new B,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new z,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(pn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new B;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},hn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},gn={h:0,s:0,l:0},_n={h:0,s:0,l:0};function vn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var V=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Be){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,St.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=St.workingColorSpace){return this.r=e,this.g=t,this.b=n,St.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=St.workingColorSpace){if(e=L(e,1),t=ut(t,0,1),n=ut(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=vn(i,r,e+1/3),this.g=vn(i,r,e),this.b=vn(i,r,e-1/3)}return St.colorSpaceToWorking(this,r),this}setStyle(e,t=Be){function n(t){t!==void 0&&parseFloat(t)<1&&tt(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:tt(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);tt(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Be){let n=hn[e.toLowerCase()];return n===void 0?tt(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ct(e.r),this.g=Ct(e.g),this.b=Ct(e.b),this}copyLinearToSRGB(e){return this.r=wt(e.r),this.g=wt(e.g),this.b=wt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Be){return St.workingToColorSpace(yn.copy(this),e),Math.round(ut(yn.r*255,0,255))*65536+Math.round(ut(yn.g*255,0,255))*256+Math.round(ut(yn.b*255,0,255))}getHexString(e=Be){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=St.workingColorSpace){St.workingToColorSpace(yn.copy(this),t);let n=yn.r,r=yn.g,i=yn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=St.workingColorSpace){return St.workingToColorSpace(yn.copy(this),t),e.r=yn.r,e.g=yn.g,e.b=yn.b,e}getStyle(e=Be){St.workingToColorSpace(yn.copy(this),e);let t=yn.r,n=yn.g,r=yn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(gn),this.setHSL(gn.h+e,gn.s+t,gn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(gn),e.getHSL(_n);let n=dt(gn.h,_n.h,t),r=dt(gn.s,_n.s,t),i=dt(gn.l,_n.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},yn=new V;V.NAMES=hn;var bn=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new V(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},xn=class extends fn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Jt,this.environmentIntensity=1,this.environmentRotation=new Jt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Sn=new z,Cn=new z,wn=new z,Tn=new z,En=new z,Dn=new z,On=new z,kn=new z,An=new z,jn=new z,Mn=new Nt,Nn=new Nt,Pn=new Nt,Fn=class e{constructor(e=new z,t=new z,n=new z){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Sn.subVectors(e,t),r.cross(Sn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Sn.subVectors(r,t),Cn.subVectors(n,t),wn.subVectors(e,t);let a=Sn.dot(Sn),o=Sn.dot(Cn),s=Sn.dot(wn),c=Cn.dot(Cn),l=Cn.dot(wn),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Tn)!==null&&Tn.x>=0&&Tn.y>=0&&Tn.x+Tn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Tn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Tn.x),s.addScaledVector(a,Tn.y),s.addScaledVector(o,Tn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Mn.setScalar(0),Nn.setScalar(0),Pn.setScalar(0),Mn.fromBufferAttribute(e,t),Nn.fromBufferAttribute(e,n),Pn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Mn,i.x),a.addScaledVector(Nn,i.y),a.addScaledVector(Pn,i.z),a}static isFrontFacing(e,t,n,r){return Sn.subVectors(n,t),Cn.subVectors(e,t),Sn.cross(Cn).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Sn.subVectors(this.c,this.b),Cn.subVectors(this.a,this.b),Sn.cross(Cn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;En.subVectors(r,n),Dn.subVectors(i,n),kn.subVectors(e,n);let s=En.dot(kn),c=Dn.dot(kn);if(s<=0&&c<=0)return t.copy(n);An.subVectors(e,r);let l=En.dot(An),u=Dn.dot(An);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(En,a);jn.subVectors(e,i);let f=En.dot(jn),p=Dn.dot(jn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Dn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return On.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(On,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(En,a).addScaledVector(Dn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},In=class{constructor(e=new z(1/0,1/0,1/0),t=new z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Rn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Rn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Rn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Rn):Rn.fromBufferAttribute(r,t),Rn.applyMatrix4(e.matrixWorld),this.expandByPoint(Rn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),zn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),zn.copy(e.boundingBox)),zn.applyMatrix4(e.matrixWorld),this.union(zn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Rn),Rn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Kn),qn.subVectors(this.max,Kn),Bn.subVectors(e.a,Kn),Vn.subVectors(e.b,Kn),Hn.subVectors(e.c,Kn),Un.subVectors(Vn,Bn),Wn.subVectors(Hn,Vn),Gn.subVectors(Bn,Hn);let t=[0,-Un.z,Un.y,0,-Wn.z,Wn.y,0,-Gn.z,Gn.y,Un.z,0,-Un.x,Wn.z,0,-Wn.x,Gn.z,0,-Gn.x,-Un.y,Un.x,0,-Wn.y,Wn.x,0,-Gn.y,Gn.x,0];return!Xn(t,Bn,Vn,Hn,qn)||(t=[1,0,0,0,1,0,0,0,1],!Xn(t,Bn,Vn,Hn,qn))?!1:(Jn.crossVectors(Un,Wn),t=[Jn.x,Jn.y,Jn.z],Xn(t,Bn,Vn,Hn,qn))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Rn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Rn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Ln[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ln[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ln[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ln[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ln[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ln[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ln[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ln[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ln)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ln=[new z,new z,new z,new z,new z,new z,new z,new z],Rn=new z,zn=new In,Bn=new z,Vn=new z,Hn=new z,Un=new z,Wn=new z,Gn=new z,Kn=new z,qn=new z,Jn=new z,Yn=new z;function Xn(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){Yn.fromArray(e,a);let o=i.x*Math.abs(Yn.x)+i.y*Math.abs(Yn.y)+i.z*Math.abs(Yn.z),s=t.dot(Yn),c=n.dot(Yn),l=r.dot(Yn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var Zn=new z,Qn=new R,$n=0,er=class extends at{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:$n++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Ge,this.updateRanges=[],this.gpuType=h,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Qn.fromBufferAttribute(this,t),Qn.applyMatrix3(e),this.setXY(t,Qn.x,Qn.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Zn.fromBufferAttribute(this,t),Zn.applyMatrix3(e),this.setXYZ(t,Zn.x,Zn.y,Zn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Zn.fromBufferAttribute(this,t),Zn.applyMatrix4(e),this.setXYZ(t,Zn.x,Zn.y,Zn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Zn.fromBufferAttribute(this,t),Zn.applyNormalMatrix(e),this.setXYZ(t,Zn.x,Zn.y,Zn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Zn.fromBufferAttribute(this,t),Zn.transformDirection(e),this.setXYZ(t,Zn.x,Zn.y,Zn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=ft(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ft(t,this.array)),t}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ft(t,this.array)),t}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ft(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ft(t,this.array)),t}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),r=pt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),r=pt(r,this.array),i=pt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}},tr=class extends er{constructor(e,t,n){super(new Uint16Array(e),t,n)}},nr=class extends er{constructor(e,t,n){super(new Uint32Array(e),t,n)}},rr=class extends er{constructor(e,t,n){super(new Float32Array(e),t,n)}},ir=new In,ar=new z,or=new z,sr=class{constructor(e=new z,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?ir.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ar.subVectors(e,this.center);let t=ar.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(ar,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(or.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ar.copy(e.center).add(or)),this.expandByPoint(ar.copy(e.center).sub(or))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},cr=0,lr=new Rt,ur=new fn,dr=new z,fr=new In,pr=new In,mr=new z,hr=class e extends at{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:cr++}),this.uuid=lt(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(Je(e)?nr:tr)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new _t().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return lr.makeRotationFromQuaternion(e),this.applyMatrix4(lr),this}rotateX(e){return lr.makeRotationX(e),this.applyMatrix4(lr),this}rotateY(e){return lr.makeRotationY(e),this.applyMatrix4(lr),this}rotateZ(e){return lr.makeRotationZ(e),this.applyMatrix4(lr),this}translate(e,t,n){return lr.makeTranslation(e,t,n),this.applyMatrix4(lr),this}scale(e,t,n){return lr.makeScale(e,t,n),this.applyMatrix4(lr),this}lookAt(e){return ur.lookAt(e),ur.updateMatrix(),this.applyMatrix4(ur.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(dr).negate(),this.translate(dr.x,dr.y,dr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new rr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&tt(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new In);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)I(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new z(-1/0,-1/0,-1/0),new z(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];fr.setFromBufferAttribute(n),this.morphTargetsRelative?(mr.addVectors(this.boundingBox.min,fr.min),this.boundingBox.expandByPoint(mr),mr.addVectors(this.boundingBox.max,fr.max),this.boundingBox.expandByPoint(mr)):(this.boundingBox.expandByPoint(fr.min),this.boundingBox.expandByPoint(fr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&I(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new sr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)I(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new z,1/0);else if(e){let n=this.boundingSphere.center;if(fr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];pr.setFromBufferAttribute(n),this.morphTargetsRelative?(mr.addVectors(fr.min,pr.min),fr.expandByPoint(mr),mr.addVectors(fr.max,pr.max),fr.expandByPoint(mr)):(fr.expandByPoint(pr.min),fr.expandByPoint(pr.max))}fr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)mr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(mr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)mr.fromBufferAttribute(a,t),o&&(dr.fromBufferAttribute(e,t),mr.add(dr)),r=Math.max(r,n.distanceToSquared(mr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&I(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){I(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new er(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new z,s[e]=new z;let c=new z,l=new z,u=new z,d=new R,f=new R,p=new R,m=new z,h=new z;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new z,y=new z,b=new z,x=new z;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new er(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new z,i=new z,a=new z,o=new z,s=new z,c=new z,l=new z,u=new z;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)mr.fromBufferAttribute(e,t),mr.normalize(),e.setXYZ(t,mr.x,mr.y,mr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new er(a,r,i)}if(this.index===null)return tt(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}},gr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Ge,this.updateRanges=[],this.version=0,this.uuid=lt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},_r=new z,vr=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)_r.fromBufferAttribute(this,t),_r.applyMatrix4(e),this.setXYZ(t,_r.x,_r.y,_r.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)_r.fromBufferAttribute(this,t),_r.applyNormalMatrix(e),this.setXYZ(t,_r.x,_r.y,_r.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)_r.fromBufferAttribute(this,t),_r.transformDirection(e),this.setXYZ(t,_r.x,_r.y,_r.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=ft(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=ft(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=ft(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=ft(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=ft(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),r=pt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),r=pt(r,this.array),i=pt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){$e(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new er(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){$e(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},yr=new z,br=new z,xr=new _t,Sr=class{constructor(e=new z(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=yr.subVectors(n,t).cross(br.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(yr),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||xr.getNormalMatrix(e),r=this.coplanarPoint(yr).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Cr=0,wr=class extends at{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Cr++}),this.uuid=lt(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new V(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=We,this.stencilZFail=We,this.stencilZPass=We,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){tt(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?tt(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new V().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Sr().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new R().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new R().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Tr=class extends wr{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new V(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Er,Dr=new z,Or=new z,kr=new z,Ar=new R,jr=new R,Mr=new Rt,Nr=new z,Pr=new z,Fr=new z,Ir=new R,Lr=new R,Rr=new R,zr=class extends fn{constructor(e=new Tr){if(super(),this.isSprite=!0,this.type=`Sprite`,Er===void 0){Er=new hr;let e=new gr(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Er.setIndex([0,1,2,0,2,3]),Er.setAttribute(`position`,new vr(e,3,0,!1)),Er.setAttribute(`uv`,new vr(e,2,3,!1))}this.geometry=Er,this.material=e,this.center=new R(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&I(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Or.setFromMatrixScale(this.matrixWorld),Mr.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),kr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Or.multiplyScalar(-kr.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Br(Nr.set(-.5,-.5,0),kr,a,Or,r,i),Br(Pr.set(.5,-.5,0),kr,a,Or,r,i),Br(Fr.set(.5,.5,0),kr,a,Or,r,i),Ir.set(0,0),Lr.set(1,0),Rr.set(1,1);let o=e.ray.intersectTriangle(Nr,Pr,Fr,!1,Dr);if(o===null&&(Br(Pr.set(-.5,.5,0),kr,a,Or,r,i),Lr.set(0,1),o=e.ray.intersectTriangle(Nr,Fr,Pr,!1,Dr),o===null))return;let s=e.ray.origin.distanceTo(Dr);s<e.near||s>e.far||t.push({distance:s,point:Dr.clone(),uv:Fn.getInterpolation(Dr,Nr,Pr,Fr,Ir,Lr,Rr,new R),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Br(e,t,n,r,i,a){Ar.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?jr.copy(Ar):(jr.x=a*Ar.x-i*Ar.y,jr.y=i*Ar.x+a*Ar.y),e.copy(t),e.x+=jr.x,e.y+=jr.y,e.applyMatrix4(Mr)}var Vr=new z,Hr=new z,Ur=new z,Wr=new z,Gr=class{constructor(e=new z,t=new z(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Vr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Vr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Vr.copy(this.origin).addScaledVector(this.direction,t),Vr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Hr.copy(e).add(t).multiplyScalar(.5),Ur.copy(t).sub(e).normalize(),Wr.copy(this.origin).sub(Hr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Ur),o=Wr.dot(this.direction),s=-Wr.dot(Ur),c=Wr.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Hr).addScaledVector(Ur,d),f}intersectSphere(e,t){if(e.radius<0)return null;Vr.subVectors(e.center,this.origin);let n=Vr.dot(this.direction),r=Vr.dot(Vr)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Vr)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,ee,te,O,ne,k,A;if(y>=b&&y>=x?(w=s,D=u,O=p,A=g,s>=0?(S=c,C=l,T=d,E=f,ee=m,te=h,ne=_,k=v):(S=l,C=c,T=f,E=d,ee=h,te=m,ne=v,k=_)):b>=x?(w=c,D=d,O=m,A=_,c>=0?(S=l,C=s,T=f,E=u,ee=h,te=p,ne=v,k=g):(S=s,C=l,T=u,E=f,ee=p,te=h,ne=g,k=v)):(w=l,D=f,O=h,A=v,l>=0?(S=s,C=c,T=u,E=d,ee=p,te=m,ne=g,k=_):(S=c,C=s,T=d,E=u,ee=m,te=p,ne=_,k=g)),w===0)return null;let j=S/w,re=C/w,M=1/w,ie=T-j*D,ae=E-re*D,oe=ee-j*O,se=te-re*O,ce=ne-j*A,le=k-re*A,ue=ce*se-le*oe,N=ie*le-ae*ce,de=oe*ae-se*ie;if(r){if(ue<0||N<0||de<0)return null}else if((ue<0||N<0||de<0)&&(ue>0||N>0||de>0))return null;let fe=ue+N+de;if(fe===0)return null;let pe=M*(ue*D+N*O+de*A);return(fe>0?pe<0:pe>0)?null:this.at(pe/fe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Kr=class extends wr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new V(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Jt,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},qr=new Rt,Jr=new Gr,Yr=new sr,Xr=new z,Zr=new z,Qr=new z,$r=new z,ei=new z,ti=new z,ni=new z,ri=new z,H=class extends fn{constructor(e=new hr,t=new Kr){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){ti.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(ei.fromBufferAttribute(s,e),a?ti.addScaledVector(ei,r):ti.addScaledVector(ei.sub(t),r))}t.add(ti)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Yr.copy(n.boundingSphere),Yr.applyMatrix4(i),Jr.copy(e.ray).recast(e.near),Yr.containsPoint(Jr.origin)===!1&&(Jr.intersectSphere(Yr,Xr)===null||Jr.origin.distanceToSquared(Xr)>(e.far-e.near)**2)||(qr.copy(i).invert(),Jr.copy(e.ray).applyMatrix4(qr),(n.boundingBox===null||Jr.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Jr)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=ai(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=ai(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=ai(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=ai(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function ii(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;ri.copy(s),ri.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(ri);return l<n.near||l>n.far?null:{distance:l,point:ri.clone(),object:e}}function ai(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Zr),e.getVertexPosition(c,Qr),e.getVertexPosition(l,$r);let u=ii(e,t,n,r,Zr,Qr,$r,ni);if(u){let e=new z;Fn.getBarycoord(ni,Zr,Qr,$r,e),i&&(u.uv=Fn.getInterpolatedAttribute(i,s,c,l,e,new R)),a&&(u.uv1=Fn.getInterpolatedAttribute(a,s,c,l,e,new R)),o&&(u.normal=Fn.getInterpolatedAttribute(o,s,c,l,e,new z),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new z,materialIndex:0};Fn.getNormal(Zr,Qr,$r,t.normal),u.face=t,u.barycoord=e}return u}var oi=class extends Mt{constructor(e=null,t=1,n=1,i,a,o,s,c,l=r,u=r,d,f){super(null,o,s,c,l,u,i,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},si=class extends er{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},ci=new Rt,li=new Rt,ui=[],di=new In,fi=new Rt,pi=new H,mi=new sr,hi=class extends H{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new si(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,fi)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new In),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ci),di.copy(e.boundingBox).applyMatrix4(ci),this.boundingBox.union(di)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new sr),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,ci),mi.copy(e.boundingSphere).applyMatrix4(ci),this.boundingSphere.union(mi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(pi.geometry=this.geometry,pi.material=this.material,pi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),mi.copy(this.boundingSphere),mi.applyMatrix4(n),e.ray.intersectsSphere(mi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,ci),li.multiplyMatrices(n,ci),pi.matrixWorld=li,pi.raycast(e,ui);for(let e=0,n=ui.length;e<n;e++){let n=ui[e];n.instanceId=i,n.object=this,t.push(n)}ui.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new si(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new oi(new Float32Array(r*this.count),r,this.count,D,h));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},gi=new sr,_i=new R(.5,.5),vi=new z,yi=class{constructor(e=new Sr,t=new Sr,n=new Sr,r=new Sr,i=new Sr,a=new Sr){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=qe,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(gi)}intersectsSprite(e){return gi.center.set(0,0,0),gi.radius=.7071067811865476+_i.distanceTo(e.center),gi.applyMatrix4(e.matrixWorld),this.intersectsSphere(gi)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(vi.x=r.normal.x>0?e.max.x:e.min.x,vi.y=r.normal.y>0?e.max.y:e.min.y,vi.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(vi)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},bi=class extends wr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new V(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},xi=new z,Si=new z,Ci=new Rt,wi=new Gr,Ti=new sr,Ei=new z,Di=new z,Oi=class extends fn{constructor(e=new hr,t=new bi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)xi.fromBufferAttribute(t,e-1),Si.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=xi.distanceTo(Si);e.setAttribute(`lineDistance`,new rr(n,1))}else tt(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ti.copy(n.boundingSphere),Ti.applyMatrix4(r),Ti.radius+=i,e.ray.intersectsSphere(Ti)===!1)return;Ci.copy(r).invert(),wi.copy(e.ray).applyMatrix4(Ci);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=ki(this,e,wi,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=ki(this,e,wi,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=ki(this,e,wi,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=ki(this,e,wi,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ki(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(xi.fromBufferAttribute(s,i),Si.fromBufferAttribute(s,a),n.distanceSqToSegment(xi,Si,Ei,Di)>r)return;Ei.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Ei);if(!(c<t.near||c>t.far))return{distance:c,point:Di.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Ai=class extends wr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new V(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ji=new Rt,Mi=new Gr,Ni=new sr,Pi=new z,Fi=class extends fn{constructor(e=new hr,t=new Ai){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ni.copy(n.boundingSphere),Ni.applyMatrix4(r),Ni.radius+=i,e.ray.intersectsSphere(Ni)===!1)return;ji.copy(r).invert(),Mi.copy(e.ray).applyMatrix4(ji);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Pi.fromBufferAttribute(l,n),Ii(Pi,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Pi.fromBufferAttribute(l,a),Ii(Pi,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Ii(e,t,n,r,i,a,o){let s=Mi.distanceSqToPoint(e);if(s<n){let n=new z;Mi.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Li=class extends Mt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ri=class extends Mt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},zi=class extends Mt{constructor(e,t,n=m,i,a,o,s=r,c=r,l,u=T,d=1){if(u!==1026&&u!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},i,a,o,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ot(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Bi=class extends zi{constructor(e,t=m,n=301,i,a,o=r,s=r,c,l=T){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,i,a,o,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Vi=class extends Mt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Hi=class e extends hr{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new rr(c,3)),this.setAttribute(`normal`,new rr(l,3)),this.setAttribute(`uv`,new rr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new z;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ui=class e extends hr{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new z,l=new R;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new rr(a,3)),this.setAttribute(`normal`,new rr(o,3)),this.setAttribute(`uv`,new rr(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Wi=class e extends hr{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new rr(u,3)),this.setAttribute(`normal`,new rr(d,3)),this.setAttribute(`uv`,new rr(f,2));function _(){let a=new z,_=new z,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new R,m=new z,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Gi=class e extends Wi{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ki=class e extends hr{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new rr(i,3)),this.setAttribute(`normal`,new rr(i.slice(),3)),this.setAttribute(`uv`,new rr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new z,r=new z,i=new z;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new z;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new z;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new z,t=new z,n=new z,r=new z,o=new R,s=new R,c=new R;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},qi=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){tt(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new R:new z);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new z,r=[],i=[],a=[],o=new z,s=new Rt;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new z)}i[0]=new z,a[0]=new z;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(ut(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(ut(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Ji=class extends qi{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new R){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Yi=class extends Ji{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function Xi(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Zi=new z,Qi=new z,$i=new Xi,ea=new Xi,ta=new Xi,na=class extends qi{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new z){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Qi.subVectors(r[0],r[1]).add(r[0]),c=Qi);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Zi.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Zi),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),$i.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),ea.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),ta.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&($i.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),ea.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),ta.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set($i.calc(s),ea.calc(s),ta.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new z().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function ra(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function ia(e,t){let n=1-e;return n*n*t}function aa(e,t){return 2*(1-e)*e*t}function oa(e,t){return e*e*t}function sa(e,t,n,r){return ia(e,t)+aa(e,n)+oa(e,r)}function ca(e,t){let n=1-e;return n*n*n*t}function la(e,t){let n=1-e;return 3*n*n*e*t}function ua(e,t){return 3*(1-e)*e*e*t}function da(e,t){return e*e*e*t}function fa(e,t,n,r,i){return ca(e,t)+la(e,n)+ua(e,r)+da(e,i)}var pa=class extends qi{constructor(e=new R,t=new R,n=new R,r=new R){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new R){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(fa(e,r.x,i.x,a.x,o.x),fa(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ma=class extends qi{constructor(e=new z,t=new z,n=new z,r=new z){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new z){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(fa(e,r.x,i.x,a.x,o.x),fa(e,r.y,i.y,a.y,o.y),fa(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ha=class extends qi{constructor(e=new R,t=new R){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new R){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ga=class extends qi{constructor(e=new z,t=new z){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new z){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new z){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},_a=class extends qi{constructor(e=new R,t=new R,n=new R){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new R){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(sa(e,r.x,i.x,a.x),sa(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},va=class extends qi{constructor(e=new z,t=new z,n=new z){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new z){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(sa(e,r.x,i.x,a.x),sa(e,r.y,i.y,a.y),sa(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ya=class extends qi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new R){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(ra(o,s.x,c.x,l.x,u.x),ra(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new R().fromArray(n))}return this}},ba=Object.freeze({__proto__:null,ArcCurve:Yi,CatmullRomCurve3:na,CubicBezierCurve:pa,CubicBezierCurve3:ma,EllipseCurve:Ji,LineCurve:ha,LineCurve3:ga,QuadraticBezierCurve:_a,QuadraticBezierCurve3:va,SplineCurve:ya}),xa=class extends qi{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new ba[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new ba[n.type]().fromJSON(n))}return this}},Sa=class extends xa{constructor(e){super(),this.type=`Path`,this.currentPoint=new R,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new ha(this.currentPoint.clone(),new R(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new _a(this.currentPoint.clone(),new R(e,t),new R(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new pa(this.currentPoint.clone(),new R(e,t),new R(n,r),new R(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new ya([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new Ji(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Ca=class extends Sa{constructor(e){super(e),this.uuid=lt(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new Sa().fromJSON(n))}return this}};function wa(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=Ta(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=Ma(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return Da(a,o,n,s,c,l,0),o}function Ta(e,t,n,r,i){let a;if(i===no(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=$a(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=$a(i/r|0,e[i],e[i+1],a);return a&&Ga(a,a.next)&&(eo(a),a=a.next),a}function Ea(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(Ga(n,n.next)||Wa(n.prev,n,n.next)===0)){if(eo(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function Da(e,t,n,r,i,a,o){if(!e)return;!o&&a&&La(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?ka(e,r,i,a):Oa(e))t.push(c.i,e.i,l.i),eo(e),e=l.next,s=l.next;else if(e=l,e===s){o?o===1?(e=Aa(Ea(e),t),Da(e,t,n,r,i,a,2)):o===2&&ja(e,t,n,r,i,a):Da(Ea(e),t,n,r,i,a,1);break}}}function Oa(e){let t=e.prev,n=e,r=e.next;if(Wa(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&Ha(i,s,a,c,o,l,m.x,m.y)&&Wa(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function ka(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Wa(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=za(p,m,t,n,r),v=za(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Ha(s,u,c,d,l,f,y.x,y.y)&&Wa(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Ha(s,u,c,d,l,f,b.x,b.y)&&Wa(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&Ha(s,u,c,d,l,f,y.x,y.y)&&Wa(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&Ha(s,u,c,d,l,f,b.x,b.y)&&Wa(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function Aa(e,t){let n=e;do{let r=n.prev,i=n.next.next;!Ga(r,i)&&Ka(r,n,n.next,i)&&Xa(r,i)&&Xa(i,r)&&(t.push(r.i,n.i,i.i),eo(n),eo(n.next),n=e=i),n=n.next}while(n!==e);return Ea(n)}function ja(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&Ua(o,e)){let s=Qa(o,e);o=Ea(o,o.next),s=Ea(s,s.next),Da(o,t,n,r,i,a,0),Da(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function Ma(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=Ta(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(Ba(o))}i.sort(Na);for(let e=0;e<i.length;e++)n=Pa(i[e],n);return n}function Na(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function Pa(e,t){let n=Fa(e,t);if(!n)return t;let r=Qa(n,e);return Ea(r,r.next),Ea(n,n.next)}function Fa(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(Ga(e,n))return n;do{if(Ga(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&Va(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Xa(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&Ia(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function Ia(e,t){return Wa(e.prev,e,t.prev)<0&&Wa(t.next,e,e.next)<0}function La(e,t,n,r){let i=e;do i.z===0&&(i.z=za(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,Ra(i)}function Ra(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function za(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function Ba(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Va(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function Ha(e,t,n,r,i,a,o,s){return(e!==o||t!==s)&&Va(e,t,n,r,i,a,o,s)}function Ua(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!Ya(e,t)&&(Xa(e,t)&&Xa(t,e)&&Za(e,t)&&(Wa(e.prev,e,t.prev)||Wa(e,t.prev,t))||Ga(e,t)&&Wa(e.prev,e,e.next)>0&&Wa(t.prev,t,t.next)>0)}function Wa(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function Ga(e,t){return e.x===t.x&&e.y===t.y}function Ka(e,t,n,r){let i=Ja(Wa(e,t,n)),a=Ja(Wa(e,t,r)),o=Ja(Wa(n,r,e)),s=Ja(Wa(n,r,t));return!!(i!==a&&o!==s||i===0&&qa(e,n,t)||a===0&&qa(e,r,t)||o===0&&qa(n,e,r)||s===0&&qa(n,t,r))}function qa(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Ja(e){return e>0?1:e<0?-1:0}function Ya(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Ka(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Xa(e,t){return Wa(e.prev,e,e.next)<0?Wa(e,t,e.next)>=0&&Wa(e,e.prev,t)>=0:Wa(e,t,e.prev)<0||Wa(e,e.next,t)<0}function Za(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Qa(e,t){let n=to(e.i,e.x,e.y),r=to(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function $a(e,t,n,r){let i=to(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function eo(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function to(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function no(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var ro=class{static triangulate(e,t,n=2){return wa(e,t,n)}},io=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];ao(e),oo(n,e);let a=e.length;t.forEach(ao);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,oo(n,t[e]);let o=ro.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function ao(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function oo(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var so=class e extends Ki{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},co=class e extends Ki{constructor(e=1,t=0){super([1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2],e,t),this.type=`OctahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},lo=class e extends hr{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new rr(p,3)),this.setAttribute(`normal`,new rr(m,3)),this.setAttribute(`uv`,new rr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},uo=class e extends hr{constructor(e=.5,t=1,n=32,r=1,i=0,a=Math.PI*2){super(),this.type=`RingGeometry`,this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:r,thetaStart:i,thetaLength:a},n=Math.max(3,n),r=Math.max(1,r);let o=[],s=[],c=[],l=[],u=e,d=(t-e)/r,f=new z,p=new R;for(let e=0;e<=r;e++){for(let e=0;e<=n;e++){let r=i+e/n*a;f.x=u*Math.cos(r),f.y=u*Math.sin(r),s.push(f.x,f.y,f.z),c.push(0,0,1),p.x=(f.x/t+1)/2,p.y=(f.y/t+1)/2,l.push(p.x,p.y)}u+=d}for(let e=0;e<r;e++){let t=e*(n+1);for(let e=0;e<n;e++){let r=e+t,i=r,a=r+n+1,s=r+n+2,c=r+1;o.push(i,a,c),o.push(a,s,c)}}this.setIndex(o),this.setAttribute(`position`,new rr(s,3)),this.setAttribute(`normal`,new rr(c,3)),this.setAttribute(`uv`,new rr(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},fo=class e extends hr{constructor(e=new Ca([new R(0,.5),new R(-.5,-.5),new R(.5,-.5)]),t=12){super(),this.type=`ShapeGeometry`,this.parameters={shapes:e,curveSegments:t};let n=[],r=[],i=[],a=[],o=0,s=0;if(Array.isArray(e)===!1)c(e);else for(let t=0;t<e.length;t++)c(e[t]),this.addGroup(o,s,t),o+=s,s=0;this.setIndex(n),this.setAttribute(`position`,new rr(r,3)),this.setAttribute(`normal`,new rr(i,3)),this.setAttribute(`uv`,new rr(a,2));function c(e){let o=r.length/3,c=e.extractPoints(t),l=c.shape,u=c.holes;io.isClockWise(l)===!1&&(l=l.reverse());for(let e=0,t=u.length;e<t;e++){let t=u[e];io.isClockWise(t)===!0&&(u[e]=t.reverse())}let d=io.triangulateShape(l,u);for(let e=0,t=u.length;e<t;e++){let t=u[e];l=l.concat(t)}for(let e=0,t=l.length;e<t;e++){let t=l[e];r.push(t.x,t.y,0),i.push(0,0,1),a.push(t.x,t.y)}for(let e=0,t=d.length;e<t;e++){let t=d[e],r=t[0]+o,i=t[1]+o,a=t[2]+o;n.push(r,i,a),s+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return po(t,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}return new e(r,t.curveSegments)}};function po(e,t){if(t.shapes=[],Array.isArray(e))for(let n=0,r=e.length;n<r;n++){let r=e[n];t.shapes.push(r.uuid)}else t.shapes.push(e.uuid);return t}var mo=class e extends hr{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new z,d=new z,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new rr(p,3)),this.setAttribute(`normal`,new rr(m,3)),this.setAttribute(`uv`,new rr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},ho=class e extends hr{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new z,f=new z,p=new z;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new rr(c,3)),this.setAttribute(`normal`,new rr(l,3)),this.setAttribute(`uv`,new rr(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function go(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(vo(i))i.isRenderTargetTexture?(tt(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(vo(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function _o(e){let t={};for(let n=0;n<e.length;n++){let r=go(e[n]);for(let e in r)t[e]=r[e]}return t}function vo(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function yo(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function bo(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:St.workingColorSpace}var xo={clone:go,merge:_o},So=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Co=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,wo=class extends wr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=So,this.fragmentShader=Co,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=go(e.uniforms),this.uniformsGroups=yo(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new V().setHex(r.value);break;case`v2`:this.uniforms[n].value=new R().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new z().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Nt().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new _t().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Rt().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},To=class extends wo{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Eo=class extends wr{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:``},this.type=`MeshToonMaterial`,this.color=new V(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new V(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new R(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Do=class extends wr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type=`MeshLambertMaterial`,this.color=new V(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new V(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new R(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Jt,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Oo=class extends wr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=ze,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ko=class extends wr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ao(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function jo(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Mo=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},No=class extends Mo{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Le,endingEnd:Le}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case F:i=e,o=2*t-n;break;case Re:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case F:a=e,s=2*n-t;break;case Re:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Po=class extends Mo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Fo=class extends Mo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Io=class extends Mo{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=zo(n,t,g,y,r);i[p]=Lo(x,o,_,b,m)}return i}};function Lo(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function Ro(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function zo(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=Lo(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=Ro(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var Bo=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Ao(t,this.TimeBufferType),this.values=Ao(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ao(e.times,Array),values:Ao(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),jo(e.settings)&&(n.settings={inTangents:Ao(e.settings.inTangents,Array),outTangents:Ao(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Fo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Po(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new No(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Io(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Pe:t=this.InterpolantFactoryMethodDiscrete;break;case P:t=this.InterpolantFactoryMethodLinear;break;case Fe:t=this.InterpolantFactoryMethodSmooth;break;case Ie:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return tt(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Pe;case this.InterpolantFactoryMethodLinear:return P;case this.InterpolantFactoryMethodSmooth:return Fe;case this.InterpolantFactoryMethodBezier:return Ie}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;jo(this.settings)&&(Vo(this.settings.inTangents,e),Vo(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(I(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(I(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){I(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){I(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Ye(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){I(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Fe,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,jo(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function Vo(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}Bo.prototype.ValueTypeName=``,Bo.prototype.TimeBufferType=Float32Array,Bo.prototype.ValueBufferType=Float32Array,Bo.prototype.DefaultInterpolation=P;var Ho=class extends Bo{constructor(e,t,n){super(e,t,n)}};Ho.prototype.ValueTypeName=`bool`,Ho.prototype.ValueBufferType=Array,Ho.prototype.DefaultInterpolation=Pe,Ho.prototype.InterpolantFactoryMethodLinear=void 0,Ho.prototype.InterpolantFactoryMethodSmooth=void 0;var Uo=class extends Bo{constructor(e,t,n,r){super(e,t,n,r)}};Uo.prototype.ValueTypeName=`color`;var Wo=class extends Bo{constructor(e,t,n,r){super(e,t,n,r)}};Wo.prototype.ValueTypeName=`number`;var Go=class extends Mo{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)mt.slerpFlat(i,0,a,c-o,a,c,s);return i}},Ko=class extends Bo{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Go(this.times,this.values,this.getValueSize(),e)}};Ko.prototype.ValueTypeName=`quaternion`,Ko.prototype.InterpolantFactoryMethodSmooth=void 0;var qo=class extends Bo{constructor(e,t,n){super(e,t,n)}};qo.prototype.ValueTypeName=`string`,qo.prototype.ValueBufferType=Array,qo.prototype.DefaultInterpolation=Pe,qo.prototype.InterpolantFactoryMethodLinear=void 0,qo.prototype.InterpolantFactoryMethodSmooth=void 0;var Jo=class extends Bo{constructor(e,t,n,r){super(e,t,n,r)}};Jo.prototype.ValueTypeName=`vector`;var Yo=class extends fn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new V(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Xo=class extends Yo{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(fn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new V(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Zo=new Rt,Qo=new z,$o=new z,es=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new R(512,512),this.mapType=l,this.map=null,this.mapPass=null,this.matrix=new Rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new yi,this._frameExtents=new R(1,1),this._viewportCount=1,this._viewports=[new Nt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Qo.setFromMatrixPosition(e.matrixWorld),t.position.copy(Qo),$o.setFromMatrixPosition(e.target.matrixWorld),t.lookAt($o),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Zo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Zo,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Zo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},ts=new z,ns=new mt,rs=new z,is=class extends fn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Rt,this.projectionMatrix=new Rt,this.projectionMatrixInverse=new Rt,this.coordinateSystem=qe,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ts,ns,rs),rs.x===1&&rs.y===1&&rs.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ts,ns,rs.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(ts,ns,rs),rs.x===1&&rs.y===1&&rs.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ts,ns,rs.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},as=new z,os=new R,ss=new R,cs=class extends is{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ct*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(st*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ct*2*Math.atan(Math.tan(st*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){as.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(as.x,as.y).multiplyScalar(-e/as.z),as.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(as.x,as.y).multiplyScalar(-e/as.z)}getViewSize(e,t){return this.getViewBounds(e,os,ss),t.subVectors(ss,os)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(st*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ls=class extends is{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},us=class extends es{constructor(){super(new ls(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ds=class extends Yo{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(fn.DEFAULT_UP),this.updateMatrix(),this.target=new fn,this.shadow=new us}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},fs=-90,ps=1,ms=class extends fn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new cs(fs,ps,e,t);r.layers=this.layers,this.add(r);let i=new cs(fs,ps,e,t);i.layers=this.layers,this.add(i);let a=new cs(fs,ps,e,t);a.layers=this.layers,this.add(a);let o=new cs(fs,ps,e,t);o.layers=this.layers,this.add(o);let s=new cs(fs,ps,e,t);s.layers=this.layers,this.add(s);let c=new cs(fs,ps,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},hs=class extends cs{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},gs=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=_s.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function _s(){this._document.hidden===!1&&this.reset()}var vs=`\\[\\]\\.:\\/`,ys=RegExp(`[\\[\\]\\.:\\/]`,`g`),bs=`[^\\[\\]\\.:\\/]`,xs=`[^`+vs.replace(`\\.`,``)+`]`,Ss=`((?:WC+[\\/:])*)`.replace(`WC`,bs),Cs=`(WCOD+)?`.replace(`WCOD`,xs),ws=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,bs),Ts=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,bs),Es=RegExp(`^`+Ss+Cs+ws+Ts+`$`),Ds=[`material`,`materials`,`bones`,`map`],Os=class{constructor(e,t,n){let r=n||ks.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},ks=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(ys,``)}static parseTrackName(e){let t=Es.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ds.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){tt(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){I(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){I(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){I(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){I(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){I(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){I(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){I(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;I(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){I(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){I(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ks.Composite=Os,ks.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},ks.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},ks.prototype.GetterByBindingType=[ks.prototype._getValue_direct,ks.prototype._getValue_array,ks.prototype._getValue_arrayElement,ks.prototype._getValue_toArray],ks.prototype.SetterByBindingTypeAndVersioning=[[ks.prototype._setValue_direct,ks.prototype._setValue_direct_setNeedsUpdate,ks.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ks.prototype._setValue_array,ks.prototype._setValue_array_setNeedsUpdate,ks.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ks.prototype._setValue_arrayElement,ks.prototype._setValue_arrayElement_setNeedsUpdate,ks.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ks.prototype._setValue_fromArray,ks.prototype._setValue_fromArray_setNeedsUpdate,ks.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var As=new Rt,js=class{constructor(e,t,n=0,r=1/0){this.ray=new Gr(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new Yt,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):I(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return As.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(As),this}intersectObject(e,t=!0,n=[]){return Ns(e,this,n,t),n.sort(Ms),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Ns(e[r],this,n,t);return n.sort(Ms),n}};function Ms(e,t){return e.distance-t.distance}function Ns(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Ns(r[e],t,n,!0)}}(class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function Ps(e,t,n,r){let i=Fs(r);switch(n){case S:return e*t;case D:return e*t/i.components*i.byteLength;case ee:return e*t/i.components*i.byteLength;case te:return e*t*2/i.components*i.byteLength;case O:return e*t*2/i.components*i.byteLength;case C:return e*t*3/i.components*i.byteLength;case w:return e*t*4/i.components*i.byteLength;case ne:return e*t*4/i.components*i.byteLength;case k:case A:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case j:case re:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case ie:case oe:return Math.max(e,16)*Math.max(t,8)/4;case M:case ae:return Math.max(e,8)*Math.max(t,8)/2;case se:case ce:case ue:case N:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case le:case de:case fe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case me:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case he:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case ge:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case _e:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ve:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ye:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case be:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case xe:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Ce:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case we:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Te:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Ee:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case De:case Oe:case ke:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ae:case je:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Me:case Ne:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Fs(e){switch(e){case l:case u:return{byteLength:1,components:1};case f:case d:case g:return{byteLength:2,components:1};case _:case v:return{byteLength:2,components:4};case m:case p:case h:return{byteLength:4,components:1};case b:case x:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`186`}})),typeof window<`u`&&(window.__THREE__?tt(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`186`);function Is(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Ls(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Rs={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},U={common:{diffuse:{value:new V(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new _t},alphaMap:{value:null},alphaMapTransform:{value:new _t},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new _t}},envmap:{envMap:{value:null},envMapRotation:{value:new _t},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new _t}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new _t}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new _t},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new _t},normalScale:{value:new R(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new _t},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new _t}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new _t}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new _t}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new V(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new z},probesMax:{value:new z},probesResolution:{value:new z}},points:{diffuse:{value:new V(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new _t},alphaTest:{value:0},uvTransform:{value:new _t}},sprite:{diffuse:{value:new V(16777215)},opacity:{value:1},center:{value:new R(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new _t},alphaMap:{value:null},alphaMapTransform:{value:new _t},alphaTest:{value:0}}},zs={basic:{uniforms:_o([U.common,U.specularmap,U.envmap,U.aomap,U.lightmap,U.fog]),vertexShader:Rs.meshbasic_vert,fragmentShader:Rs.meshbasic_frag},lambert:{uniforms:_o([U.common,U.specularmap,U.envmap,U.aomap,U.lightmap,U.emissivemap,U.bumpmap,U.normalmap,U.displacementmap,U.fog,U.lights,{emissive:{value:new V(0)},envMapIntensity:{value:1}}]),vertexShader:Rs.meshlambert_vert,fragmentShader:Rs.meshlambert_frag},phong:{uniforms:_o([U.common,U.specularmap,U.envmap,U.aomap,U.lightmap,U.emissivemap,U.bumpmap,U.normalmap,U.displacementmap,U.fog,U.lights,{emissive:{value:new V(0)},specular:{value:new V(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Rs.meshphong_vert,fragmentShader:Rs.meshphong_frag},standard:{uniforms:_o([U.common,U.envmap,U.aomap,U.lightmap,U.emissivemap,U.bumpmap,U.normalmap,U.displacementmap,U.roughnessmap,U.metalnessmap,U.fog,U.lights,{emissive:{value:new V(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Rs.meshphysical_vert,fragmentShader:Rs.meshphysical_frag},toon:{uniforms:_o([U.common,U.aomap,U.lightmap,U.emissivemap,U.bumpmap,U.normalmap,U.displacementmap,U.gradientmap,U.fog,U.lights,{emissive:{value:new V(0)}}]),vertexShader:Rs.meshtoon_vert,fragmentShader:Rs.meshtoon_frag},matcap:{uniforms:_o([U.common,U.bumpmap,U.normalmap,U.displacementmap,U.fog,{matcap:{value:null}}]),vertexShader:Rs.meshmatcap_vert,fragmentShader:Rs.meshmatcap_frag},points:{uniforms:_o([U.points,U.fog]),vertexShader:Rs.points_vert,fragmentShader:Rs.points_frag},dashed:{uniforms:_o([U.common,U.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Rs.linedashed_vert,fragmentShader:Rs.linedashed_frag},depth:{uniforms:_o([U.common,U.displacementmap]),vertexShader:Rs.depth_vert,fragmentShader:Rs.depth_frag},normal:{uniforms:_o([U.common,U.bumpmap,U.normalmap,U.displacementmap,{opacity:{value:1}}]),vertexShader:Rs.meshnormal_vert,fragmentShader:Rs.meshnormal_frag},sprite:{uniforms:_o([U.sprite,U.fog]),vertexShader:Rs.sprite_vert,fragmentShader:Rs.sprite_frag},background:{uniforms:{uvTransform:{value:new _t},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Rs.background_vert,fragmentShader:Rs.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new _t}},vertexShader:Rs.backgroundCube_vert,fragmentShader:Rs.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Rs.cube_vert,fragmentShader:Rs.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Rs.equirect_vert,fragmentShader:Rs.equirect_frag},distance:{uniforms:_o([U.common,U.displacementmap,{referencePosition:{value:new z},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Rs.distance_vert,fragmentShader:Rs.distance_frag},shadow:{uniforms:_o([U.lights,U.fog,{color:{value:new V(0)},opacity:{value:1}}]),vertexShader:Rs.shadow_vert,fragmentShader:Rs.shadow_frag}};zs.physical={uniforms:_o([zs.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new _t},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new _t},clearcoatNormalScale:{value:new R(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new _t},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new _t},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new _t},sheen:{value:0},sheenColor:{value:new V(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new _t},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new _t},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new _t},transmissionSamplerSize:{value:new R},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new _t},attenuationDistance:{value:0},attenuationColor:{value:new V(0)},specularColor:{value:new V(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new _t},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new _t},anisotropyVector:{value:new R},anisotropyMap:{value:null},anisotropyMapTransform:{value:new _t}}]),vertexShader:Rs.meshphysical_vert,fragmentShader:Rs.meshphysical_frag};var Bs={r:0,b:0,g:0},Vs=new Rt,Hs=new _t;Hs.set(-1,0,0,0,1,0,0,0,1);function Us(e,t,n,r,i,a){let o=new V(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new H(new Hi(1,1,1),new wo({name:`BackgroundCubeMaterial`,uniforms:go(zs.backgroundCube.uniforms),vertexShader:zs.backgroundCube.vertexShader,fragmentShader:zs.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Vs.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Hs),l.material.toneMapped=St.getTransfer(i.colorSpace)!==Ue,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new H(new lo(2,2),new wo({name:`BackgroundMaterial`,uniforms:go(zs.background.uniforms),vertexShader:zs.background.vertexShader,fragmentShader:zs.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=St.getTransfer(i.colorSpace)!==Ue,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Bs,bo(e)),n.buffers.color.setClear(Bs.r,Bs.g,Bs.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function Ws(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Gs(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Ks(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(tt(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&tt(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function qs(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Sr,s=new _t,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Js=4,Ys=6,Xs=20,Zs=256,Qs=new ls,$s=new V,ec=null,tc=0,nc=0,rc=!1,ic=new z,ac=new z,oc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=ic}=i;ec=this._renderer.getRenderTarget(),tc=this._renderer.getActiveCubeFace(),nc=this._renderer.getActiveMipmapLevel(),rc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=pc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(ec,tc,nc),this._renderer.xr.enabled=rc,e.scissorTest=!1,lc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ec=this._renderer.getRenderTarget(),tc=this._renderer.getActiveCubeFace(),nc=this._renderer.getActiveMipmapLevel(),rc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:o,minFilter:o,generateMipmaps:!1,type:g,format:w,colorSpace:Ve,depthBuffer:!1},r=cc(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=cc(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=sc(r)),this._blurMaterial=dc(r,e,t),this._ggxMaterial=uc(r,e,t)}return r}_compileMaterial(e){let t=new H(new hr,e);this._renderer.compile(t,Qs)}_sceneToCubeUV(e,t,n,r,i){let a=new cs(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor($s),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new H(new Hi,new Kr({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy($s),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;lc(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=pc()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fc());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;lc(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Qs)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-Js?n-d+Js:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,lc(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,Qs),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,lc(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,Qs)}_blur(e,t,n,r){let i=this._pingPongRenderTarget,a=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,i,t,n,a),this._blurPass(i,e,n,n,a)}_blurPass(e,t,n,r,i){let a=this._renderer,o=this._blurMaterial,s=this._lodMeshes[r];s.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=i,c.mipInt.value=this._lodMax-n;let l=this._sizeLods[r];lc(t,3*l*(r>this._lodMax-Js?r-this._lodMax+Js:0),4*(this._cubeSize-l),3*l,2*l),a.setRenderTarget(t),a.render(s,Qs)}};function sc(e){let t=[],n=[],r=e,i=e-Js+1+Ys;for(let e=0;e<i;e++){let e=2**r;t.push(e);let i=1/(e-2),a=-i,o=1+i,s=[a,a,o,a,o,o,a,a,o,o,a,o],c=new Float32Array(108),l=new Float32Array(108);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];c.set(r,18*e);for(let t=0;t<6;t++){let n=s[t*2]*2-1,r=s[t*2+1]*2-1;e===0?ac.set(1,r,n):e===1?ac.set(-n,1,-r):e===2?ac.set(-n,r,1):e===3?ac.set(-1,r,-n):e===4?ac.set(-n,-1,r):ac.set(n,r,-1),ac.toArray(l,(e*6+t)*3)}}let u=new hr;u.setAttribute(`position`,new er(c,3)),u.setAttribute(`outputDirection`,new er(l,3)),n.push(new H(u,null)),r>Js&&r--}return{lodMeshes:n,sizeLods:t}}function cc(e,t,n){let r=new Ft(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function lc(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function uc(e,t,n){return new wo({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:Zs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:mc(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function dc(e,t,n){return new wo({name:`SphericalGaussianBlur`,defines:{SAMPLES:Xs,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:mc(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function fc(){return new wo({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:mc(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function pc(){return new wo({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:mc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function mc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var hc=class extends Ft{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Li(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Hi(5,5,5),i=new wo({name:`CubemapFromEquirect`,uniforms:go(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new H(r,i),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=o),new ms(1,10,this).update(e,a),t.minFilter=s,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function gc(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new hc(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new oc(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new oc(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function _c(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&nt(`WebGLRenderer: `+e+` extension not supported.`),t}}}function vc(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?nr:tr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function yc(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function bc(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:I(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function xc(e,t,n){let r=new WeakMap,i=new Nt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new It(g,p,m,u);_.type=h,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new R(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Sc(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Cc={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function wc(e,t,n,r,i,a){let o=new Ft(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=new hr;l.setAttribute(`position`,new rr([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute(`uv`,new rr([0,2,0,0,2,0],2));let u=new To({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new H(l,u),f=new ls(-1,1,1,-1,0,1),p=null,m=null,h=!1,_,v=null,y=[],b=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<y.length;n++){let r=y[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){y=e,b=y.length>0&&y[0].isRenderPass===!0;let t=o.width,n=o.height;y.length>0&&s===null&&(s=new Ft(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}),c=new Ft(t,n,{type:g,depthBuffer:!1,stencilBuffer:!1}));for(let e=0;e<y.length;e++){let r=y[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(h||e.toneMapping===0&&y.length===0)return!1;if(v=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return b===!1&&e.setRenderTarget(o),_=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return b},this.end=function(e,t){e.toneMapping=_,h=!0;let n=o,r=s;for(let i=0;i<y.length;i++){let a=y[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(p!==e.outputColorSpace||m!==e.toneMapping){p=e.outputColorSpace,m=e.toneMapping,u.defines={},St.getTransfer(p)===`srgb`&&(u.defines.SRGB_TRANSFER=``);let t=Cc[m];t&&(u.defines[t]=``),u.needsUpdate=!0}u.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(v),e.render(d,f),v=null,h=!1},this.isCompositing=function(){return h},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var Tc=new Mt,Ec=new zi(1,1),Dc=new It,Oc=new Lt,kc=new Li,Ac=[],jc=[],Mc=new Float32Array(16),Nc=new Float32Array(9),Pc=new Float32Array(4);function Fc(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Ac[i];if(a===void 0&&(a=new Float32Array(i),Ac[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Ic(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Lc(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Rc(e,t){let n=jc[t];n===void 0&&(n=new Int32Array(t),jc[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function zc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Bc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ic(n,t))return;e.uniform2fv(this.addr,t),Lc(n,t)}}function Vc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Ic(n,t))return;e.uniform3fv(this.addr,t),Lc(n,t)}}function Hc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ic(n,t))return;e.uniform4fv(this.addr,t),Lc(n,t)}}function Uc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ic(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Lc(n,t)}else{if(Ic(n,r))return;Pc.set(r),e.uniformMatrix2fv(this.addr,!1,Pc),Lc(n,r)}}function Wc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ic(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Lc(n,t)}else{if(Ic(n,r))return;Nc.set(r),e.uniformMatrix3fv(this.addr,!1,Nc),Lc(n,r)}}function Gc(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Ic(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Lc(n,t)}else{if(Ic(n,r))return;Mc.set(r),e.uniformMatrix4fv(this.addr,!1,Mc),Lc(n,r)}}function Kc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function qc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ic(n,t))return;e.uniform2iv(this.addr,t),Lc(n,t)}}function Jc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ic(n,t))return;e.uniform3iv(this.addr,t),Lc(n,t)}}function Yc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ic(n,t))return;e.uniform4iv(this.addr,t),Lc(n,t)}}function Xc(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Zc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Ic(n,t))return;e.uniform2uiv(this.addr,t),Lc(n,t)}}function Qc(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Ic(n,t))return;e.uniform3uiv(this.addr,t),Lc(n,t)}}function $c(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Ic(n,t))return;e.uniform4uiv(this.addr,t),Lc(n,t)}}function el(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Ec.compareFunction=n.isReversedDepthBuffer()?518:515,a=Ec):a=Tc,n.setTexture2D(t||a,i)}function tl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Oc,i)}function nl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||kc,i)}function rl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Dc,i)}function il(e){switch(e){case 5126:return zc;case 35664:return Bc;case 35665:return Vc;case 35666:return Hc;case 35674:return Uc;case 35675:return Wc;case 35676:return Gc;case 5124:case 35670:return Kc;case 35667:case 35671:return qc;case 35668:case 35672:return Jc;case 35669:case 35673:return Yc;case 5125:return Xc;case 36294:return Zc;case 36295:return Qc;case 36296:return $c;case 35678:case 36198:case 36298:case 36306:case 35682:return el;case 35679:case 36299:case 36307:return tl;case 35680:case 36300:case 36308:case 36293:return nl;case 36289:case 36303:case 36311:case 36292:return rl}}function al(e,t){e.uniform1fv(this.addr,t)}function ol(e,t){let n=Fc(t,this.size,2);e.uniform2fv(this.addr,n)}function sl(e,t){let n=Fc(t,this.size,3);e.uniform3fv(this.addr,n)}function cl(e,t){let n=Fc(t,this.size,4);e.uniform4fv(this.addr,n)}function ll(e,t){let n=Fc(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function ul(e,t){let n=Fc(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function dl(e,t){let n=Fc(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function fl(e,t){e.uniform1iv(this.addr,t)}function pl(e,t){e.uniform2iv(this.addr,t)}function ml(e,t){e.uniform3iv(this.addr,t)}function hl(e,t){e.uniform4iv(this.addr,t)}function gl(e,t){e.uniform1uiv(this.addr,t)}function _l(e,t){e.uniform2uiv(this.addr,t)}function vl(e,t){e.uniform3uiv(this.addr,t)}function yl(e,t){e.uniform4uiv(this.addr,t)}function bl(e,t,n){let r=this.cache,i=t.length,a=Rc(n,i);Ic(r,a)||(e.uniform1iv(this.addr,a),Lc(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Ec:Tc;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function xl(e,t,n){let r=this.cache,i=t.length,a=Rc(n,i);Ic(r,a)||(e.uniform1iv(this.addr,a),Lc(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Oc,a[e])}function Sl(e,t,n){let r=this.cache,i=t.length,a=Rc(n,i);Ic(r,a)||(e.uniform1iv(this.addr,a),Lc(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||kc,a[e])}function Cl(e,t,n){let r=this.cache,i=t.length,a=Rc(n,i);Ic(r,a)||(e.uniform1iv(this.addr,a),Lc(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Dc,a[e])}function wl(e){switch(e){case 5126:return al;case 35664:return ol;case 35665:return sl;case 35666:return cl;case 35674:return ll;case 35675:return ul;case 35676:return dl;case 5124:case 35670:return fl;case 35667:case 35671:return pl;case 35668:case 35672:return ml;case 35669:case 35673:return hl;case 5125:return gl;case 36294:return _l;case 36295:return vl;case 36296:return yl;case 35678:case 36198:case 36298:case 36306:case 35682:return bl;case 35679:case 36299:case 36307:return xl;case 35680:case 36300:case 36308:case 36293:return Sl;case 36289:case 36303:case 36311:case 36292:return Cl}}var Tl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=il(t.type)}},El=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=wl(t.type)}},Dl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ol=/(\w+)(\])?(\[|\.)?/g;function kl(e,t){e.seq.push(t),e.map[t.id]=t}function Al(e,t,n){let r=e.name,i=r.length;for(Ol.lastIndex=0;;){let a=Ol.exec(r),o=Ol.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){kl(n,l===void 0?new Tl(s,e,t):new El(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Dl(s),kl(n,e)),n=e}}}var jl=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Al(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Ml(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Nl=37297,Pl=0;function Fl(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Il=new _t;function Ll(e){St._getMatrix(Il,St.workingColorSpace,e);let t=`mat3( ${Il.elements.map(e=>e.toFixed(4))} )`;switch(St.getTransfer(e)){case He:return[t,`LinearTransferOETF`];case Ue:return[t,`sRGBTransferOETF`];default:return tt(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Rl(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Fl(e.getShaderSource(t),r)}return i}function zl(e,t){let n=Ll(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Bl={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Vl(e,t){let n=Bl[t];return n===void 0?(tt(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Hl=new z;function Ul(){return St.getLuminanceCoefficients(Hl),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Hl.x.toFixed(4)}, ${Hl.y.toFixed(4)}, ${Hl.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Wl(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(ql).join(`
`)}function Gl(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Kl(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function ql(e){return e!==``}function Jl(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Yl(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Xl=/^[ \t]*#include +<([\w\d./]+)>/gm;function Zl(e){return e.replace(Xl,$l)}var Ql=new Map;function $l(e,t){let n=Rs[t];if(n===void 0){let e=Ql.get(t);if(e!==void 0)n=Rs[e],tt(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`)}return Zl(n)}var eu=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function tu(e){return e.replace(eu,nu)}function nu(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function ru(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}var iu={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function au(e){return iu[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var ou={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function su(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:ou[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var cu={302:`ENVMAP_MODE_REFRACTION`};function lu(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:cu[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var uu={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function du(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:uu[e.combine]||`ENVMAP_BLENDING_NONE`}function fu(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function pu(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=au(n),l=su(n),u=lu(n),d=du(n),f=fu(n),p=Wl(n),m=Gl(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(ql).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(ql).join(`
`),_.length>0&&(_+=`
`)):(g=[ru(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(ql).join(`
`),_=[ru(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Rs.tonemapping_pars_fragment,n.toneMapping===0?``:Vl(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Rs.colorspace_pars_fragment,zl(`linearToOutputTexel`,n.outputColorSpace),Ul(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(ql).join(`
`)),o=Zl(o),o=Jl(o,n),o=Yl(o,n),s=Zl(s),s=Jl(s,n),s=Yl(s,n),o=tu(o),s=tu(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Ml(i,i.VERTEX_SHADER,y),S=Ml(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Rl(i,x,`vertex`),n=Rl(i,S,`fragment`);I(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):tt(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new jl(i,h),T=Kl(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Nl)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Pl++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var mu=0,hu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new gu(e),t.set(e,n)),n}},gu=class{constructor(e){this.id=mu++,this.code=e,this.usedTimes=0}};function _u(e){return e===1030||e===37490||e===36285}function vu(e,t,n,r,i,a){let o=new Yt,s=new hu,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&tt(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,ee,te,O;if(C){let e=zs[C];D=e.vertexShader,ee=e.fragmentShader}else{D=i.vertexShader,ee=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),te=e.id,O=t.id}let ne=e.getRenderTarget(),k=e.state.buffers.depth.getReversed(),A=h.isInstancedMesh===!0,j=h.isBatchedMesh===!0,re=!!i.map,M=!!i.matcap,ie=!!x,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,ce=!!i.normalMap,le=!!i.displacementMap,ue=!!i.emissiveMap,N=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.dispersion>0,he=i.retroreflectivity>0,ge=i.iridescence>0,_e=i.sheen>0,ve=i.transmission>0,ye=fe&&!!i.anisotropyMap,be=pe&&!!i.clearcoatMap,xe=pe&&!!i.clearcoatNormalMap,Se=pe&&!!i.clearcoatRoughnessMap,Ce=ge&&!!i.iridescenceMap,we=ge&&!!i.iridescenceThicknessMap,Te=_e&&!!i.sheenColorMap,Ee=_e&&!!i.sheenRoughnessMap,De=!!i.specularMap,Oe=!!i.specularColorMap,ke=!!i.specularIntensityMap,Ae=ve&&!!i.transmissionMap,je=ve&&!!i.thicknessMap,Me=!!i.gradientMap,Ne=!!i.alphaMap,Pe=i.alphaTest>0,P=!!i.alphaHash,Fe=!!i.extensions,Ie=0;i.toneMapped&&(ne===null||ne.isXRRenderTarget===!0)&&(Ie=e.toneMapping);let Le={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:ee,defines:i.defines,customVertexShaderID:te,customFragmentShaderID:O,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:j,batchingColor:j&&h._colorsTexture!==null,instancing:A,instancingColor:A&&h.instanceColor!==null,instancingMorph:A&&h.morphTexture!==null,outputColorSpace:ne===null?e.outputColorSpace:ne.isXRRenderTarget===!0?ne.texture.colorSpace:St.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:re,matcap:M,envMap:ie,envMapMode:ie&&x.mapping,envMapCubeUVHeight:S,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:le,emissiveMap:ue,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,packedNormalMap:ce&&i.normalMapType===0&&_u(i.normalMap.format),metalnessMap:N,roughnessMap:de,anisotropy:fe,anisotropyMap:ye,clearcoat:pe,clearcoatMap:be,clearcoatNormalMap:xe,clearcoatRoughnessMap:Se,dispersion:me,retroreflection:he,iridescence:ge,iridescenceMap:Ce,iridescenceThicknessMap:we,sheen:_e,sheenColorMap:Te,sheenRoughnessMap:Ee,specularMap:De,specularColorMap:Oe,specularIntensityMap:ke,transmission:ve,transmissionMap:Ae,thicknessMap:je,gradientMap:Me,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Ne,alphaTest:Pe,alphaHash:P,combine:i.combine,mapUv:re&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:ce&&m(i.normalMap.channel),displacementMapUv:le&&m(i.displacementMap.channel),emissiveMapUv:ue&&m(i.emissiveMap.channel),metalnessMapUv:N&&m(i.metalnessMap.channel),roughnessMapUv:de&&m(i.roughnessMap.channel),anisotropyMapUv:ye&&m(i.anisotropyMap.channel),clearcoatMapUv:be&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:xe&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Se&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:we&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(i.sheenRoughnessMap.channel),specularMapUv:De&&m(i.specularMap.channel),specularColorMapUv:Oe&&m(i.specularColorMap.channel),specularIntensityMapUv:ke&&m(i.specularIntensityMap.channel),transmissionMapUv:Ae&&m(i.transmissionMap.channel),thicknessMapUv:je&&m(i.thicknessMap.channel),alphaMapUv:Ne&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(ce||fe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(re||Ne),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:k,skinning:h.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ie,decodeVideoTexture:re&&i.map.isVideoTexture===!0&&St.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ue&&i.emissiveMap.isVideoTexture===!0&&St.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Fe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&i.extensions.multiDraw===!0||j)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Le.vertexUv1s=c.has(1),Le.vertexUv2s=c.has(2),Le.vertexUv3s=c.has(3),c.clear(),Le}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=zs[t];n=xo.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new pu(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function yu(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function bu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function xu(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Su(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||bu),r.length>1&&r.sort(t||xu),i.length>1&&i.sort(t||xu)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Cu(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Su,e.set(t,[i])):n>=r.length?(i=new Su,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function wu(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new z,color:new V};break;case`SpotLight`:n={position:new z,direction:new z,color:new V,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new z,color:new V,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new z,skyColor:new V,groundColor:new V};break;case`RectAreaLight`:n={color:new V,position:new z,halfWidth:new z,halfHeight:new z}}return e[t.id]=n,n}}}function Tu(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Eu=0;function Du(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Ou(e){let t=new wu,n=Tu(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new z);let i=new z,a=new Rt,o=new Rt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Du);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=U.LTC_FLOAT_1,r.rectAreaLTC2=U.LTC_FLOAT_2):(r.rectAreaLTC1=U.LTC_HALF_1,r.rectAreaLTC2=U.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Eu++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function ku(e){let t=new Ou(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function Au(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new ku(e),t.set(n,[a])):r>=i.length?(a=new ku(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var ju=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Mu=`uniform sampler2D shadow_pass;
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
}`,Nu=[new z(1,0,0),new z(-1,0,0),new z(0,1,0),new z(0,-1,0),new z(0,0,1),new z(0,0,-1)],Pu=[new z(0,-1,0),new z(0,-1,0),new z(0,0,1),new z(0,0,-1),new z(0,-1,0),new z(0,-1,0)],Fu=new Rt,Iu=new z,Lu=new z;function Ru(e,t,n){let i=new yi,a=new R,s=new R,c=new Nt,l=new Oo,u=new ko,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},_=new wo({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new R},radius:{value:4}},vertexShader:ju,fragmentShader:Mu}),v=_.clone();v.defines.HORIZONTAL_PASS=1;let y=new hr;y.setAttribute(`position`,new er(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new H(y,_),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,l){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(tt(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.state;_.setBlending(0),_.buffers.depth.getReversed()===!0?_.buffers.color.setClear(0,0,0,0):_.buffers.color.setClear(1,1,1,1),_.buffers.depth.setTest(!0),_.setScissorTest(!1);let v=S!==this.type;v&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){tt(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;a.copy(p.mapSize);let y=p.getFrameExtents();a.multiply(y),s.copy(p.mapSize),(a.x>f||a.y>f)&&(a.x>f&&(s.x=Math.floor(f/y.x),a.x=s.x*y.x,p.mapSize.x=s.x),a.y>f&&(s.y=Math.floor(f/y.y),a.y=s.y*y.y,p.mapSize.y=s.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||v===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){tt(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Ft(a.x,a.y,{format:te,type:g,minFilter:o,magFilter:o,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new zi(a.x,a.y,h),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=T,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r}else d.isPointLight?(p.map=new hc(a.x),p.map.depthTexture=new Bi(a.x,m)):(p.map=new Ft(a.x,a.y),p.map.depthTexture=new zi(a.x,a.y,m)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=T,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=r,p.map.depthTexture.magFilter=r);p.camera.updateProjectionMatrix()}p.map.isWebGLCubeRenderTarget!==!0&&(p.map.width!==a.x||p.map.height!==a.y)&&p.map.setSize(a.x,a.y);let x=p.map.isWebGLCubeRenderTarget?6:p.getViewportCount();d.isPointLight!==!0&&p.updateMatrices(d,l);for(let t=0;t<x;t++){let r=p.getCamera(t);if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Iu.setFromMatrixPosition(d.matrixWorld),e.position.copy(Iu),Lu.copy(e.position),Lu.add(Nu[t]),e.up.copy(Pu[t]),e.lookAt(Lu),e.updateMatrixWorld(),n.makeTranslation(-Iu.x,-Iu.y,-Iu.z),Fu.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(Fu,e.coordinateSystem,e.reversedDepth)}if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);c.set(s.x*n.x,s.y*n.y,s.x*n.z,s.y*n.w),_.viewport(c)}i=p.getFrustum(t),E(n,l,r,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,l),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let i=t.update(b);_.defines.VSM_SAMPLES!==n.blurSamples&&(_.defines.VSM_SAMPLES=n.blurSamples,v.defines.VSM_SAMPLES=n.blurSamples,_.needsUpdate=!0,v.needsUpdate=!0),n.mapPass===null?n.mapPass=new Ft(a.x,a.y,{format:te,type:g}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),_.uniforms.shadow_pass.value=n.map.depthTexture,_.uniforms.resolution.value.set(n.map.width,n.map.height),_.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,_,b,null),v.uniforms.shadow_pass.value=n.mapPass.texture,v.uniforms.resolution.value.set(n.map.width,n.map.height),v.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,v,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:l,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,D)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function E(n,r,a,o,s){if(n.visible===!1)return;if(n.layers.test(r.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||n.intersectsFrustum(i))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let i=t.update(n),c=n.material;if(Array.isArray(c)){let t=i.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,r,a,i,t,u),e.renderBufferDirect(a,null,i,t,n,u),n.onAfterShadow(e,n,r,a,i,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,r,a,i,t,null),e.renderBufferDirect(a,null,i,t,n,null),n.onAfterShadow(e,n,r,a,i,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)E(c[e],r,a,o,s)}function D(e){e.target.removeEventListener(`dispose`,D);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function zu(e,t){function n(){let t=!1,n=new Nt,r=null,i=new Nt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?N(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=it[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?N(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new V(0,0,0),T=0,E=!1,D=null,ee=null,te=null,O=null,ne=null,k=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),A=!1,j=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),A=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(re)[1]),A=j>=1);let M=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new Nt().fromArray(ae),ce=new Nt().fromArray(oe);function le(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ue={};ue[e.TEXTURE_2D]=le(e.TEXTURE_2D,e.TEXTURE_2D,1),ue[e.TEXTURE_CUBE_MAP]=le(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ue[e.TEXTURE_2D_ARRAY]=le(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ue[e.TEXTURE_3D]=le(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),N(e.DEPTH_TEST),o.setFunc(3),ye(!1),be(1),N(e.CULL_FACE),_e(0);function N(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return h!==t&&(e.useProgram(t),h=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(de(e.BLEND),g=!1);else if(g===!1&&(N(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:I(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:I(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:I(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:I(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(he[n],he[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):N(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),Se(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?N(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function be(t){t===0?de(e.CULL_FACE):(N(e.CULL_FACE),t!==ee&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),ee=t}function xe(t){t!==te&&(A&&e.lineWidth(t),te=t)}function Se(t,n,r){t?(N(e.POLYGON_OFFSET_FILL),(O!==n||ne!==r)&&(O=n,ne=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function Ce(t){t?N(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+k-1),M!==t&&(e.activeTexture(t),M=t)}function Te(t,n,r){r===void 0&&(r=M===null?e.TEXTURE0+k-1:M);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(M!==r&&(e.activeTexture(r),M=r),e.bindTexture(t,n||ue[t]),i.type=t,i.texture=n)}function Ee(){let t=ie[M];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){I(`WebGLState:`,e)}}function Oe(){try{e.compressedTexImage3D(...arguments)}catch(e){I(`WebGLState:`,e)}}function ke(){try{e.texSubImage2D(...arguments)}catch(e){I(`WebGLState:`,e)}}function Ae(){try{e.texSubImage3D(...arguments)}catch(e){I(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage2D(...arguments)}catch(e){I(`WebGLState:`,e)}}function Me(){try{e.compressedTexSubImage3D(...arguments)}catch(e){I(`WebGLState:`,e)}}function Ne(){try{e.texStorage2D(...arguments)}catch(e){I(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){I(`WebGLState:`,e)}}function P(){try{e.texImage2D(...arguments)}catch(e){I(`WebGLState:`,e)}}function Fe(){try{e.texImage3D(...arguments)}catch(e){I(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function F(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Re(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function ze(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Be(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Ve(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},M=null,ie={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new V(0,0,0),T=0,E=!1,D=null,ee=null,te=null,O=null,ne=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:N,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:be,setLineWidth:xe,setPolygonOffset:Se,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:Oe,texImage2D:P,texImage3D:Fe,pixelStorei:Le,getParameter:Ie,updateUBOMapping:ze,uniformBlockBinding:Be,texStorage2D:Ne,texStorage3D:Pe,texSubImage2D:ke,texSubImage3D:Ae,compressedTexSubImage2D:je,compressedTexSubImage3D:Me,scissor:F,viewport:Re,reset:Ve}}function Bu(l,u,d,f,p,m,h){let g=u.has(`WEBGL_multisampled_render_to_texture`)?u.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new R,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Xe(`canvas`)}function T(e,t,n){let r=1,i=Ie(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),tt(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&tt(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function D(e){return e.generateMipmaps}function ee(e){l.generateMipmap(e)}function te(e){return e.isWebGLCubeRenderTarget?l.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?l.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?l.TEXTURE_2D_ARRAY:l.TEXTURE_2D}function O(e,t,n,r,i,a=!1){if(e!==null){if(l[e]!==void 0)return l[e];tt(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let o;r&&(o=u.get(`EXT_texture_norm16`),o||tt(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let s=t;if(t===l.RED&&(n===l.FLOAT&&(s=l.R32F),n===l.HALF_FLOAT&&(s=l.R16F),n===l.UNSIGNED_BYTE&&(s=l.R8),n===l.UNSIGNED_SHORT&&o&&(s=o.R16_EXT),n===l.SHORT&&o&&(s=o.R16_SNORM_EXT)),t===l.RED_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.R8UI),n===l.UNSIGNED_SHORT&&(s=l.R16UI),n===l.UNSIGNED_INT&&(s=l.R32UI),n===l.BYTE&&(s=l.R8I),n===l.SHORT&&(s=l.R16I),n===l.INT&&(s=l.R32I)),t===l.RG&&(n===l.FLOAT&&(s=l.RG32F),n===l.HALF_FLOAT&&(s=l.RG16F),n===l.UNSIGNED_BYTE&&(s=l.RG8),n===l.UNSIGNED_SHORT&&o&&(s=o.RG16_EXT),n===l.SHORT&&o&&(s=o.RG16_SNORM_EXT)),t===l.RG_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RG8UI),n===l.UNSIGNED_SHORT&&(s=l.RG16UI),n===l.UNSIGNED_INT&&(s=l.RG32UI),n===l.BYTE&&(s=l.RG8I),n===l.SHORT&&(s=l.RG16I),n===l.INT&&(s=l.RG32I)),t===l.RGB_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGB8UI),n===l.UNSIGNED_SHORT&&(s=l.RGB16UI),n===l.UNSIGNED_INT&&(s=l.RGB32UI),n===l.BYTE&&(s=l.RGB8I),n===l.SHORT&&(s=l.RGB16I),n===l.INT&&(s=l.RGB32I)),t===l.RGBA_INTEGER&&(n===l.UNSIGNED_BYTE&&(s=l.RGBA8UI),n===l.UNSIGNED_SHORT&&(s=l.RGBA16UI),n===l.UNSIGNED_INT&&(s=l.RGBA32UI),n===l.BYTE&&(s=l.RGBA8I),n===l.SHORT&&(s=l.RGBA16I),n===l.INT&&(s=l.RGBA32I)),t===l.RGB&&(n===l.UNSIGNED_SHORT&&o&&(s=o.RGB16_EXT),n===l.SHORT&&o&&(s=o.RGB16_SNORM_EXT),n===l.UNSIGNED_INT_5_9_9_9_REV&&(s=l.RGB9_E5),n===l.UNSIGNED_INT_10F_11F_11F_REV&&(s=l.R11F_G11F_B10F)),t===l.RGBA){let e=a?He:St.getTransfer(i);n===l.FLOAT&&(s=l.RGBA32F),n===l.HALF_FLOAT&&(s=l.RGBA16F),n===l.UNSIGNED_BYTE&&(s=e===`srgb`?l.SRGB8_ALPHA8:l.RGBA8),n===l.UNSIGNED_SHORT&&o&&(s=o.RGBA16_EXT),n===l.SHORT&&o&&(s=o.RGBA16_SNORM_EXT),n===l.UNSIGNED_SHORT_4_4_4_4&&(s=l.RGBA4),n===l.UNSIGNED_SHORT_5_5_5_1&&(s=l.RGB5_A1)}return(s===l.R16F||s===l.R32F||s===l.RG16F||s===l.RG32F||s===l.RGBA16F||s===l.RGBA32F)&&u.get(`EXT_color_buffer_float`),s}function ne(e,t){let n;return e?t===null||t===1014||t===1020?n=l.DEPTH24_STENCIL8:t===1015?n=l.DEPTH32F_STENCIL8:t===1012&&(n=l.DEPTH24_STENCIL8,tt(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=l.DEPTH_COMPONENT24:t===1015?n=l.DEPTH_COMPONENT32F:t===1012&&(n=l.DEPTH_COMPONENT16),n}function k(e,t){return D(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function A(e){let t=e.target;t.removeEventListener(`dispose`,A),re(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),ie(t)}function re(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&M(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function M(e){let t=f.get(e);l.deleteTexture(t.__webglTexture);let n=e.source,r=S.get(n);delete r[t.__cacheKey],h.memory.textures--}function ie(e){let t=f.get(e);if(e.depthTexture&&(e.depthTexture.dispose(),f.remove(e.depthTexture)),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)l.deleteFramebuffer(t.__webglFramebuffer[e][n]);else l.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)l.deleteFramebuffer(t.__webglFramebuffer[e]);else l.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&l.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&l.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&l.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&l.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let n=e.textures;for(let e=0,t=n.length;e<t;e++){let t=f.get(n[e]);t.__webglTexture&&(l.deleteTexture(t.__webglTexture),h.memory.textures--),f.remove(n[e])}f.remove(e)}let ae=0;function oe(){ae=0}function se(){return ae}function ce(e){ae=e}function le(){let e=ae;return e>=p.maxTextures&&tt(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+p.maxTextures),ae+=1,e}function ue(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function N(e,t){let n=f.get(e);if(e.isVideoTexture&&P(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)tt(`WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)tt(`WebGLRenderer: Texture marked for update but image is incomplete`);else{xe(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);d.bindTexture(l.TEXTURE_2D,n.__webglTexture,l.TEXTURE0+t)}function de(e,t){let n=f.get(e);e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version?xe(n,e,t):(e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null),d.bindTexture(l.TEXTURE_2D_ARRAY,n.__webglTexture,l.TEXTURE0+t))}function fe(e,t){let n=f.get(e);e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version?xe(n,e,t):d.bindTexture(l.TEXTURE_3D,n.__webglTexture,l.TEXTURE0+t)}function pe(e,t){let n=f.get(e);e.isCubeDepthTexture!==!0&&e.version>0&&n.__version!==e.version?Se(n,e,t):d.bindTexture(l.TEXTURE_CUBE_MAP,n.__webglTexture,l.TEXTURE0+t)}let me={[e]:l.REPEAT,[t]:l.CLAMP_TO_EDGE,[n]:l.MIRRORED_REPEAT},he={[r]:l.NEAREST,[i]:l.NEAREST_MIPMAP_NEAREST,[a]:l.NEAREST_MIPMAP_LINEAR,[o]:l.LINEAR,[s]:l.LINEAR_MIPMAP_NEAREST,[c]:l.LINEAR_MIPMAP_LINEAR},ge={512:l.NEVER,519:l.ALWAYS,513:l.LESS,515:l.LEQUAL,514:l.EQUAL,518:l.GEQUAL,516:l.GREATER,517:l.NOTEQUAL};function _e(e,t){if(t.type===1015&&u.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&tt(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),l.texParameteri(e,l.TEXTURE_WRAP_S,me[t.wrapS]),l.texParameteri(e,l.TEXTURE_WRAP_T,me[t.wrapT]),(e===l.TEXTURE_3D||e===l.TEXTURE_2D_ARRAY)&&l.texParameteri(e,l.TEXTURE_WRAP_R,me[t.wrapR]),l.texParameteri(e,l.TEXTURE_MAG_FILTER,he[t.magFilter]),l.texParameteri(e,l.TEXTURE_MIN_FILTER,he[t.minFilter]),t.compareFunction&&(l.texParameteri(e,l.TEXTURE_COMPARE_MODE,l.COMPARE_REF_TO_TEXTURE),l.texParameteri(e,l.TEXTURE_COMPARE_FUNC,ge[t.compareFunction])),u.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&u.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||f.get(t).__currentAnisotropy){let n=u.get(`EXT_texture_filter_anisotropic`);l.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,p.getMaxAnisotropy())),f.get(t).__currentAnisotropy=t.anisotropy}}}function ve(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,A));let r=t.source,i=S.get(r);i===void 0&&(i={},S.set(r,i));let a=ue(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:l.createTexture(),usedTimes:0},h.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&M(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function ye(e,t,n){return Math.floor(Math.floor(e/n)/t)}function be(e,t,n,r){let i=e.updateRanges;if(i.length===0)d.texSubImage2D(l.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=ye(r.start,t.width,4),c=ye(n.start,t.width,4);r.start<=o+1&&s===c&&ye(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let o=d.getParameter(l.UNPACK_ROW_LENGTH),s=d.getParameter(l.UNPACK_SKIP_PIXELS),c=d.getParameter(l.UNPACK_SKIP_ROWS);d.pixelStorei(l.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],o=Math.floor(a.start/4),s=Math.ceil(a.count/4),c=o%t.width,u=Math.floor(o/t.width),f=s;d.pixelStorei(l.UNPACK_SKIP_PIXELS,c),d.pixelStorei(l.UNPACK_SKIP_ROWS,u),d.texSubImage2D(l.TEXTURE_2D,0,c,u,f,1,n,r,t.data)}e.clearUpdateRanges(),d.pixelStorei(l.UNPACK_ROW_LENGTH,o),d.pixelStorei(l.UNPACK_SKIP_PIXELS,s),d.pixelStorei(l.UNPACK_SKIP_ROWS,c)}}function xe(e,t,n){let r=l.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=l.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=l.TEXTURE_3D);let i=ve(e,t),a=t.source;d.bindTexture(r,e.__webglTexture,l.TEXTURE0+n);let o=f.get(a);if(a.version!==o.__version||i===!0){if(d.activeTexture(l.TEXTURE0+n),!(typeof ImageBitmap<`u`&&t.image instanceof ImageBitmap)){let e=St.getPrimaries(St.workingColorSpace),n=t.colorSpace===``?null:St.getPrimaries(t.colorSpace),r=t.colorSpace===``||e===n?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,r)}d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment);let e=T(t.image,!1,p.maxTextureSize);e=Fe(t,e);let s=m.convert(t.format,t.colorSpace),c=m.convert(t.type),u=O(t.internalFormat,s,c,t.normalized,t.colorSpace,t.isVideoTexture);_e(r,t);let f,h=t.mipmaps,g=t.isVideoTexture!==!0,_=o.__version===void 0||i===!0,v=a.dataReady,y=k(t,e);if(t.isDepthTexture)u=ne(t.format===E,t.type),_&&(g?d.texStorage2D(l.TEXTURE_2D,1,u,e.width,e.height):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,null));else if(t.isDataTexture){if(h.length>0){g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data);t.generateMipmaps=!1}else g?(_&&d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height),v&&be(t,e,s,c)):d.texImage2D(l.TEXTURE_2D,0,u,e.width,e.height,0,s,c,e.data)}else if(t.isCompressedTexture){if(t.isCompressedArrayTexture){g&&_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,h[0].width,h[0].height,e.depth);for(let n=0,r=h.length;n<r;n++)if(f=h[n],t.format!==1023){if(s!==null){if(g){if(v){if(t.layerUpdates.size>0){let e=Ps(f.width,f.height,t.format,t.type);for(let r of t.layerUpdates){let t=f.data.subarray(r*e/f.data.BYTES_PER_ELEMENT,(r+1)*e/f.data.BYTES_PER_ELEMENT);d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,r,f.width,f.height,1,s,t)}}else d.compressedTexSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,f.data)}}else d.compressedTexImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,f.data,0,0)}else tt(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else g?v&&d.texSubImage3D(l.TEXTURE_2D_ARRAY,n,0,0,0,f.width,f.height,e.depth,s,c,f.data):d.texImage3D(l.TEXTURE_2D_ARRAY,n,u,f.width,f.height,e.depth,0,s,c,f.data);t.layerUpdates.size>0&&t.clearLayerUpdates()}else{g&&_&&d.texStorage2D(l.TEXTURE_2D,y,u,h[0].width,h[0].height);for(let e=0,n=h.length;e<n;e++)f=h[e],t.format===1023?g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,c,f.data):d.texImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,s,c,f.data):s===null?tt(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&d.compressedTexSubImage2D(l.TEXTURE_2D,e,0,0,f.width,f.height,s,f.data):d.compressedTexImage2D(l.TEXTURE_2D,e,u,f.width,f.height,0,f.data)}}else if(t.isDataArrayTexture){if(g){if(_&&d.texStorage3D(l.TEXTURE_2D_ARRAY,y,u,e.width,e.height,e.depth),v){if(t.layerUpdates.size>0){let n=Ps(e.width,e.height,t.format,t.type);for(let r of t.layerUpdates){let t=e.data.subarray(r*n/e.data.BYTES_PER_ELEMENT,(r+1)*n/e.data.BYTES_PER_ELEMENT);d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,s,c,t)}t.clearLayerUpdates()}else d.texSubImage3D(l.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)}}else d.texImage3D(l.TEXTURE_2D_ARRAY,0,u,e.width,e.height,e.depth,0,s,c,e.data)}else if(t.isData3DTexture)g?(_&&d.texStorage3D(l.TEXTURE_3D,y,u,e.width,e.height,e.depth),v&&d.texSubImage3D(l.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,s,c,e.data)):d.texImage3D(l.TEXTURE_3D,0,u,e.width,e.height,e.depth,0,s,c,e.data);else if(t.isFramebufferTexture){if(_){if(g)d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height);else{let t=e.width,n=e.height;for(let e=0;e<y;e++)d.texImage2D(l.TEXTURE_2D,e,u,t,n,0,s,c,null),t>>=1,n>>=1}}}else if(t.isHTMLTexture){if(`texElementImage2D`in l){let n=l.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),e.parentNode!==n){n.appendChild(e),b.add(t),n.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(l.texElementImage2D.length===3)l.texElementImage2D(l.TEXTURE_2D,l.RGBA8,e);else{let t=l.RGBA,n=l.RGBA,r=l.UNSIGNED_BYTE;l.texElementImage2D(l.TEXTURE_2D,0,t,n,r,e)}l.texParameteri(l.TEXTURE_2D,l.TEXTURE_MIN_FILTER,l.LINEAR),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_S,l.CLAMP_TO_EDGE),l.texParameteri(l.TEXTURE_2D,l.TEXTURE_WRAP_T,l.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let e=Ie(h[0]);d.texStorage2D(l.TEXTURE_2D,y,u,e.width,e.height)}for(let e=0,t=h.length;e<t;e++)f=h[e],g?v&&d.texSubImage2D(l.TEXTURE_2D,e,0,0,s,c,f):d.texImage2D(l.TEXTURE_2D,e,u,s,c,f);t.generateMipmaps=!1}else if(g){if(_){let t=Ie(e);d.texStorage2D(l.TEXTURE_2D,y,u,t.width,t.height)}v&&d.texSubImage2D(l.TEXTURE_2D,0,0,0,s,c,e)}else d.texImage2D(l.TEXTURE_2D,0,u,s,c,e);D(t)&&ee(r),o.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function Se(e,t,n){if(t.image.length!==6)return;let r=ve(e,t),i=t.source;d.bindTexture(l.TEXTURE_CUBE_MAP,e.__webglTexture,l.TEXTURE0+n);let a=f.get(i);if(i.version!==a.__version||r===!0){d.activeTexture(l.TEXTURE0+n);let e=St.getPrimaries(St.workingColorSpace),o=t.colorSpace===``?null:St.getPrimaries(t.colorSpace),s=t.colorSpace===``||e===o?l.NONE:l.BROWSER_DEFAULT_WEBGL;d.pixelStorei(l.UNPACK_FLIP_Y_WEBGL,t.flipY),d.pixelStorei(l.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),d.pixelStorei(l.UNPACK_ALIGNMENT,t.unpackAlignment),d.pixelStorei(l.UNPACK_COLORSPACE_CONVERSION_WEBGL,s);let c=t.isCompressedTexture||t.image[0].isCompressedTexture,u=t.image[0]&&t.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!c&&!u?f[e]=T(t.image[e],!0,p.maxCubemapSize):f[e]=u?t.image[e].image:t.image[e],f[e]=Fe(t,f[e]);let h=f[0],g=m.convert(t.format,t.colorSpace),_=m.convert(t.type),v=O(t.internalFormat,g,_,t.normalized,t.colorSpace),y=t.isVideoTexture!==!0,b=a.__version===void 0||r===!0,x=i.dataReady,S=k(t,h);_e(l.TEXTURE_CUBE_MAP,t);let C;if(c){y&&b&&d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let e=0;e<6;e++){C=f[e].mipmaps;for(let n=0;n<C.length;n++){let r=C[n];t.format===1023?y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,_,r.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,g,_,r.data):g===null?tt(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&d.compressedTexSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,g,r.data):d.compressedTexImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,v,r.width,r.height,0,r.data)}}}else{if(C=t.mipmaps,y&&b){C.length>0&&S++;let e=Ie(f[0]);d.texStorage2D(l.TEXTURE_CUBE_MAP,S,v,e.width,e.height)}for(let e=0;e<6;e++)if(u){y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,f[e].width,f[e].height,g,_,f[e].data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,f[e].width,f[e].height,0,g,_,f[e].data);for(let t=0;t<C.length;t++){let n=C[t].image[e].image;y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,g,_,n.data):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,n.width,n.height,0,g,_,n.data)}}else{y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,g,_,f[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,v,g,_,f[e]);for(let t=0;t<C.length;t++){let n=C[t];y?x&&d.texSubImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,g,_,n.image[e]):d.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,v,g,_,n.image[e])}}}D(t)&&ee(l.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function Ce(e,t,n,r,i,a){let o=m.convert(n.format,n.colorSpace),s=m.convert(n.type),c=O(n.internalFormat,o,s,n.normalized,n.colorSpace),u=f.get(t),p=f.get(n);if(p.__renderTarget=t,!u.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===l.TEXTURE_3D||i===l.TEXTURE_2D_ARRAY?d.texImage3D(i,a,c,e,n,t.depth,0,o,s,null):d.texImage2D(i,a,c,e,n,0,o,s,null)}d.bindFramebuffer(l.FRAMEBUFFER,e),Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,r,i,p.__webglTexture,0,Ne(t)):(i===l.TEXTURE_2D||i>=l.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=l.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&l.framebufferTexture2D(l.FRAMEBUFFER,r,i,p.__webglTexture,a),d.bindFramebuffer(l.FRAMEBUFFER,null)}function we(e,t,n){if(l.bindRenderbuffer(l.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=ne(t.stencilBuffer,i),o=t.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;Pe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,Ne(t),a,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,Ne(t),a,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,a,t.width,t.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,o,l.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=m.convert(i.format,i.colorSpace),o=m.convert(i.type),s=O(i.internalFormat,a,o,i.normalized,i.colorSpace);Pe(t)?g.renderbufferStorageMultisampleEXT(l.RENDERBUFFER,Ne(t),s,t.width,t.height):n?l.renderbufferStorageMultisample(l.RENDERBUFFER,Ne(t),s,t.width,t.height):l.renderbufferStorage(l.RENDERBUFFER,s,t.width,t.height)}}l.bindRenderbuffer(l.RENDERBUFFER,null)}function Te(e,t,n){let r=t.isWebGLCubeRenderTarget===!0;if(d.bindFramebuffer(l.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let i=f.get(t.depthTexture);if(i.__renderTarget=t,i.__webglTexture&&t.depthTexture.image.width===t.width&&t.depthTexture.image.height===t.height||(t.depthTexture.image.width=t.width,t.depthTexture.image.height=t.height,t.depthTexture.needsUpdate=!0),r){if(i.__webglInit===void 0&&(i.__webglInit=!0,t.depthTexture.addEventListener(`dispose`,A)),i.__webglTexture===void 0){i.__webglTexture=l.createTexture(),d.bindTexture(l.TEXTURE_CUBE_MAP,i.__webglTexture),_e(l.TEXTURE_CUBE_MAP,t.depthTexture);let e=m.convert(t.depthTexture.format),n=m.convert(t.depthTexture.type),r;t.depthTexture.format===1026?r=l.DEPTH_COMPONENT24:t.depthTexture.format===1027&&(r=l.DEPTH24_STENCIL8);for(let i=0;i<6;i++)l.texImage2D(l.TEXTURE_CUBE_MAP_POSITIVE_X+i,0,r,t.width,t.height,0,e,n,null)}}else N(t.depthTexture,0);let a=i.__webglTexture,o=Ne(t),s=r?l.TEXTURE_CUBE_MAP_POSITIVE_X+n:l.TEXTURE_2D,c=t.depthTexture.format===1027?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;if(t.depthTexture.format===1026)Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else if(t.depthTexture.format===1027)Pe(t)?g.framebufferTexture2DMultisampleEXT(l.FRAMEBUFFER,c,s,a,0,o):l.framebufferTexture2D(l.FRAMEBUFFER,c,s,a,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Ee(e){let t=f.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer){if(n)for(let n=0;n<6;n++)Te(t.__webglFramebuffer[n],e,n);else{let n=e.texture.mipmaps;n&&n.length>0?Te(t.__webglFramebuffer[0],e,0):Te(t.__webglFramebuffer,e,0)}}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=l.createRenderbuffer(),we(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];l.bindRenderbuffer(l.RENDERBUFFER,i),l.framebufferRenderbuffer(l.FRAMEBUFFER,r,l.RENDERBUFFER,i)}}else{let n=e.texture.mipmaps;if(n&&n.length>0?d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer[0]):d.bindFramebuffer(l.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=l.createRenderbuffer(),we(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;l.bindRenderbuffer(l.RENDERBUFFER,r),l.framebufferRenderbuffer(l.FRAMEBUFFER,n,l.RENDERBUFFER,r)}}d.bindFramebuffer(l.FRAMEBUFFER,null)}function De(e,t,n){let r=f.get(e);t!==void 0&&Ce(r.__webglFramebuffer,e,e.texture,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,0),n!==void 0&&Ee(e)}function Oe(e){let t=e.texture,n=f.get(e),r=f.get(t);e.addEventListener(`dispose`,j);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,o=i.length>1;if(o||(r.__webglTexture===void 0&&(r.__webglTexture=l.createTexture()),r.__version=t.version,h.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=l.createFramebuffer()}else n.__webglFramebuffer[e]=l.createFramebuffer()}else{if(t.mipmaps&&t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=l.createFramebuffer()}else n.__webglFramebuffer=l.createFramebuffer();if(o)for(let e=0,t=i.length;e<t;e++){let t=f.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=l.createTexture(),h.memory.textures++)}if(e.samples>0&&Pe(e)===!1){n.__webglMultisampledFramebuffer=l.createFramebuffer(),n.__webglColorRenderbuffer=[],d.bindFramebuffer(l.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=l.createRenderbuffer(),l.bindRenderbuffer(l.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=m.convert(r.format,r.colorSpace),o=m.convert(r.type),s=O(r.internalFormat,a,o,r.normalized,r.colorSpace,e.isXRRenderTarget===!0),c=Ne(e);l.renderbufferStorageMultisample(l.RENDERBUFFER,c,s,e.width,e.height),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+t,l.RENDERBUFFER,n.__webglColorRenderbuffer[t])}l.bindRenderbuffer(l.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=l.createRenderbuffer(),we(n.__webglDepthRenderbuffer,e,!0)),d.bindFramebuffer(l.FRAMEBUFFER,null)}}if(a){d.bindTexture(l.TEXTURE_CUBE_MAP,r.__webglTexture),_e(l.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps&&t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)Ce(n.__webglFramebuffer[r][i],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else Ce(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,l.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);D(t)&&ee(l.TEXTURE_CUBE_MAP),d.unbindTexture()}else if(o){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=f.get(r),o=l.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(o=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(o,a.__webglTexture),_e(o,r),Ce(n.__webglFramebuffer,e,r,l.COLOR_ATTACHMENT0+t,o,0),D(r)&&ee(o)}d.unbindTexture()}else{let i=l.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?l.TEXTURE_3D:l.TEXTURE_2D_ARRAY),d.bindTexture(i,r.__webglTexture),_e(i,t),t.mipmaps&&t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)Ce(n.__webglFramebuffer[r],e,t,l.COLOR_ATTACHMENT0,i,r);else Ce(n.__webglFramebuffer,e,t,l.COLOR_ATTACHMENT0,i,0);D(t)&&ee(i),d.unbindTexture()}e.depthBuffer&&Ee(e)}function ke(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(D(r)){let t=te(e),n=f.get(r).__webglTexture;d.bindTexture(t,n),ee(t),d.unbindTexture()}}}let Ae=[],je=[];function Me(e){if(e.samples>0){if(Pe(e)===!1){let t=e.textures,n=e.width,r=e.height,i=l.COLOR_BUFFER_BIT,a=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT,o=f.get(e),s=t.length>1;if(s)for(let e=0;e<t.length;e++)d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,null),d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,null,0);d.bindFramebuffer(l.READ_FRAMEBUFFER,o.__webglMultisampledFramebuffer);let c=e.texture.mipmaps;c&&c.length>0?d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer[0]):d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=l.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=l.STENCIL_BUFFER_BIT)),s){l.framebufferRenderbuffer(l.READ_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.RENDERBUFFER,o.__webglColorRenderbuffer[c]);let e=f.get(t[c]).__webglTexture;l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0,l.TEXTURE_2D,e,0)}l.blitFramebuffer(0,0,n,r,0,0,n,r,i,l.NEAREST),_===!0&&(Ae.length=0,je.length=0,Ae.push(l.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&(Ae.push(a),je.push(a),l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,je)),l.invalidateFramebuffer(l.READ_FRAMEBUFFER,Ae))}if(d.bindFramebuffer(l.READ_FRAMEBUFFER,null),d.bindFramebuffer(l.DRAW_FRAMEBUFFER,null),s)for(let e=0;e<t.length;e++){d.bindFramebuffer(l.FRAMEBUFFER,o.__webglMultisampledFramebuffer),l.framebufferRenderbuffer(l.FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.RENDERBUFFER,o.__webglColorRenderbuffer[e]);let n=f.get(t[e]).__webglTexture;d.bindFramebuffer(l.FRAMEBUFFER,o.__webglFramebuffer),l.framebufferTexture2D(l.DRAW_FRAMEBUFFER,l.COLOR_ATTACHMENT0+e,l.TEXTURE_2D,n,0)}d.bindFramebuffer(l.DRAW_FRAMEBUFFER,o.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&_){let t=e.stencilBuffer?l.DEPTH_STENCIL_ATTACHMENT:l.DEPTH_ATTACHMENT;l.invalidateFramebuffer(l.DRAW_FRAMEBUFFER,[t])}}}function Ne(e){return Math.min(p.maxSamples,e.samples)}function Pe(e){let t=f.get(e);return e.samples>0&&u.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function P(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function Fe(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(St.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&tt(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):I(`WebGLTextures: Unsupported texture color space:`,n)),t}function Ie(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=le,this.resetTextureUnits=oe,this.getTextureUnits=se,this.setTextureUnits=ce,this.setTexture2D=N,this.setTexture2DArray=de,this.setTexture3D=fe,this.setTextureCube=pe,this.rebindTextures=De,this.setupRenderTarget=Oe,this.updateRenderTargetMipmap=ke,this.updateMultisampleRenderTarget=Me,this.setupDepthRenderbuffer=Ee,this.setupFrameBufferTexture=Ce,this.useMultisampledRTT=Pe,this.isReversedDepthBuffer=function(){return d.buffers.depth.getReversed()}}function Vu(e,t){function n(n,r=``){let i,a=St.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Hu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Uu=`
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

}`,Wu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Vi(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new wo({vertexShader:Hu,fragmentShader:Uu,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new H(new lo(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Gu=class extends at{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,u=null,d=null,f=null,p=null,h=null,g=typeof XRWebGLBinding<`u`,_=new Wu,v={},b=t.getContextAttributes(),x=null,S=null,C=[],D=[],ee=new R,te=null,O=null,ne=new cs;ne.viewport=new Nt;let k=new cs;k.viewport=new Nt;let A=[ne,k],j=new hs,re=null,M=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new mn,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new mn,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new mn,C[e]=t),t.getHandSpace()};function ie(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ae(){r.removeEventListener(`select`,ie),r.removeEventListener(`selectstart`,ie),r.removeEventListener(`selectend`,ie),r.removeEventListener(`squeeze`,ie),r.removeEventListener(`squeezestart`,ie),r.removeEventListener(`squeezeend`,ie),r.removeEventListener(`end`,ae),r.removeEventListener(`inputsourceschange`,oe);for(let e=0;e<C.length;e++){let t=D[e];t!==null&&(D[e]=null,C[e].disconnect(t))}re=null,M=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(x),p=null,f=null,d=null,r=null,S=null,pe.stop(),n.isPresenting=!1,e.setPixelRatio(te),e.setSize(ee.width,ee.height,!1),O!==null){let e=O.camera;e.fov=O.fov,e.zoom=O.zoom,e.updateProjectionMatrix(),O=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&tt(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&tt(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(u){if(r=u,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,ie),r.addEventListener(`selectstart`,ie),r.addEventListener(`selectend`,ie),r.addEventListener(`squeeze`,ie),r.addEventListener(`squeezestart`,ie),r.addEventListener(`squeezeend`,ie),r.addEventListener(`end`,ae),r.addEventListener(`inputsourceschange`,oe),b.xrCompatible!==!0&&await t.makeXRCompatible(),te=e.getPixelRatio(),e.getSize(ee),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?E:T,a=b.stencil?y:m);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};d=this.getBinding(),f=d.createProjectionLayer(s),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),S=new Ft(f.textureWidth,f.textureHeight,{format:w,type:l,depthTexture:new zi(f.textureWidth,f.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new Ft(p.framebufferWidth,p.framebufferHeight,{format:w,type:l,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),pe.setContext(r),pe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function oe(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let se=new z,ce=new z;function le(e,t,n){se.setFromMatrixPosition(t.matrixWorld),ce.setFromMatrixPosition(n.matrixWorld);let r=se.distanceTo(ce),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ue(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=k.near=ne.near=t,j.far=k.far=ne.far=n,(re!==j.near||M!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),re=j.near,M=j.far),j.layers.mask=e.layers.mask|6,ne.layers.mask=j.layers.mask&-5,k.layers.mask=j.layers.mask&-3;let i=e.parent,a=j.cameras;ue(j,i);for(let e=0;e<a.length;e++)ue(a[e],i);a.length===2?le(j,ne,k):j.projectionMatrix.copy(ne.projectionMatrix),O===null&&e.isPerspectiveCamera&&(O={camera:e,fov:e.fov,zoom:e.zoom}),N(e,j,i)};function N(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=ct*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(f!==null||p!==null)return s},this.setFoveation=function(e){s=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let de=null;function fe(t,i){if(u=i.getViewerPose(c||a),h=i,u!==null){let t=u.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=d.getViewSubImage(f,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=A[n];o===void 0&&(o=new cs,o.layers.enable(n),o.viewport=new Nt,A[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){d=n.getBinding();let e=d.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),d=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Vi,v[n]=e);let t=d.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=D[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}de&&de(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let pe=new Is;pe.setAnimationLoop(fe),this.setAnimationLoop=function(e){de=e},this.dispose=function(){}}},Ku=new Rt,qu=new _t;qu.set(-1,0,0,0,1,0,0,0,1);function Ju(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,bo(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Ku.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(qu),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Yu(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(g(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,v));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return I(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)p(t[n],e,n,a);else p(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(t,n,r,i){if(h(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=_(i);m(i,t.__data,e),typeof i!=`number`&&typeof i!=`boolean`&&!i.isMatrix3&&!ArrayBuffer.isView(i)&&(e+=a.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function m(e,t,n){typeof e==`number`||typeof e==`boolean`?t[0]=e:e.isMatrix3?(t[0]=e.elements[0],t[1]=e.elements[1],t[2]=e.elements[2],t[3]=0,t[4]=e.elements[3],t[5]=e.elements[4],t[6]=e.elements[5],t[7]=0,t[8]=e.elements[6],t[9]=e.elements[7],t[10]=e.elements[8],t[11]=0):ArrayBuffer.isView(e)?t.set(new e.constructor(e.buffer,e.byteOffset,t.length)):e.toArray(t,n)}function h(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:ArrayBuffer.isView(i)?i.slice():i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function g(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=_(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function _(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?tt(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):tt(`WebGLRenderer: Unsupported uniform value type.`,e),t}function v(t){let n=t.target;n.removeEventListener(`dispose`,v);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function y(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:y}}var Xu=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Zu=null;function Qu(){return Zu===null&&(Zu=new oi(Xu,16,16,te,g),Zu.name=`DFG_LUT`,Zu.minFilter=o,Zu.magFilter=o,Zu.wrapS=t,Zu.wrapT=t,Zu.generateMipmaps=!1,Zu.needsUpdate=!0),Zu}var $u=class{constructor(e={}){let{canvas:t=Ze(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:u=!1,powerPreference:d=`default`,failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:h=!1,outputBufferType:b=l}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);x=n.getContextAttributes().alpha}else x=a;let S=b,C=new Set([ne,O,ee]),w=new Set([l,m,f,y,_,v]),T=new Uint32Array(4),E=new Int32Array(4),D=new z,te=null,k=null,A=[],j=[],re=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,ie=!1,ae=null,oe=null,se=null,ce=null;this._outputColorSpace=Be;let le=0,ue=0,N=null,de=-1,fe=null,pe=new Nt,me=new Nt,he=null,ge=new V(0),_e=0,ve=t.width,ye=t.height,be=1,xe=null,Se=null,Ce=new Nt(0,0,ve,ye),we=new Nt(0,0,ve,ye),Te=!1,Ee=new yi,De=!1,Oe=!1,ke=new Rt,Ae=new z,je=new Nt,Me={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ne=!1;function Pe(){return N===null?be:1}let P=n;function Fe(e,n){return t.getContext(e,n)}let Ie,Le,F,Re,ze,Ve,He,Ue,We,Ge,Ke,Je,Ye,Xe,Qe,et,nt,it,at,ot,st,ct,lt;try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:p};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r186`),t.addEventListener(`webglcontextlost`,dt,!1),t.addEventListener(`webglcontextrestored`,ft,!1),t.addEventListener(`webglcontextcreationerror`,pt,!1),P===null){let t=`webgl2`;if(P=Fe(t,e),P===null)throw Fe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}ut()}catch(e){throw t.removeEventListener(`webglcontextlost`,dt,!1),t.removeEventListener(`webglcontextrestored`,ft,!1),t.removeEventListener(`webglcontextcreationerror`,pt,!1),I(`WebGLRenderer: `+e.message),e}function ut(){Ie=new _c(P),Ie.init(),st=new Vu(P,Ie),Le=new Ks(P,Ie,e,st),F=new zu(P,Ie),Le.reversedDepthBuffer&&h&&F.buffers.depth.setReversed(!0),oe=P.createFramebuffer(),se=P.createFramebuffer(),ce=P.createFramebuffer(),Re=new bc(P),ze=new yu,Ve=new Bu(P,Ie,F,ze,Le,st,Re),He=new gc(M),Ue=new Ls(P),ct=new Ws(P,Ue),We=new vc(P,Ue,Re,ct),Ge=new Sc(P,We,Ue,ct,Re),it=new xc(P,Le,Ve),Qe=new qs(ze),Ke=new vu(M,He,Ie,Le,ct,Qe),Je=new Ju(M,ze),Ye=new Cu,Xe=new Au(Ie),nt=new Us(M,He,F,Ge,x,s),et=new Ru(M,Ge,Le),lt=new Yu(P,Re,Le,F),at=new Gs(P,Ie,Re),ot=new yc(P,Ie,Re),Re.programs=Ke.programs,M.capabilities=Le,M.extensions=Ie,M.properties=ze,M.renderLists=Ye,M.shadowMap=et,M.state=F,M.info=Re}S!==1009&&(re=new wc(S,t.width,t.height,o,r,i));let L=new Gu(M,P);this.xr=L,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(e){e!==void 0&&(be=e,this.setSize(ve,ye,!1))},this.getSize=function(e){return e.set(ve,ye)},this.setSize=function(e,n,r=!0){L.isPresenting?tt(`WebGLRenderer: Can't change size while VR device is presenting.`):(ve=e,ye=n,t.width=Math.floor(e*be),t.height=Math.floor(n*be),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),re!==null&&re.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ve*be,ye*be).floor()},this.setDrawingBufferSize=function(e,n,r){ve=e,ye=n,be=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(S===1009)I(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){tt(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}re.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(pe)},this.getViewport=function(e){return e.copy(Ce)},this.setViewport=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),F.viewport(pe.copy(Ce).multiplyScalar(be).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),F.scissor(me.copy(we).multiplyScalar(be).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){F.setScissorTest(Te=e)},this.setOpaqueSort=function(e){xe=e},this.setTransparentSort=function(e){Se=e},this.getClearColor=function(e){return e.copy(nt.getClearColor())},this.setClearColor=function(){nt.setClearColor(...arguments)},this.getClearAlpha=function(){return nt.getClearAlpha()},this.setClearAlpha=function(){nt.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(N!==null){let t=N.texture.format;e=C.has(t)}if(e){let e=N.texture.type,t=w.has(e),n=nt.getClearColor(),r=nt.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,P.clearBufferuiv(P.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,P.clearBufferiv(P.COLOR,0,E))}else r|=P.COLOR_BUFFER_BIT}t&&(r|=P.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&P.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),ae=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,dt,!1),t.removeEventListener(`webglcontextrestored`,ft,!1),t.removeEventListener(`webglcontextcreationerror`,pt,!1),nt.dispose(),Ye.dispose(),Xe.dispose(),ze.dispose(),He.dispose(),Ge.dispose(),ct.dispose(),lt.dispose(),Ke.dispose(),L.dispose(),L.removeEventListener(`sessionstart`,yt),L.removeEventListener(`sessionend`,bt),xt.stop()};function dt(e){e.preventDefault(),$e(`WebGLRenderer: Context Lost.`),ie=!0}function ft(){$e(`WebGLRenderer: Context Restored.`),ie=!1;let e=Re.autoReset,t=et.enabled,n=et.autoUpdate,r=et.needsUpdate,i=et.type;ut(),Re.autoReset=e,et.enabled=t,et.autoUpdate=n,et.needsUpdate=r,et.type=i}function pt(e){I(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function R(e){let t=e.target;t.removeEventListener(`dispose`,R),mt(t)}function mt(e){ht(e),ze.remove(e)}function ht(e){let t=ze.get(e).programs;t!==void 0&&(t.forEach(function(e){Ke.releaseProgram(e)}),e.isShaderMaterial&&Ke.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Me);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=Mt(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=We.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;ct.setup(i,r,s,n,c);let h,g=at;if(c!==null&&(h=Ue.get(c),g=ot,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*Pe()),g.setMode(P.LINES)):g.setMode(P.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*Pe()),i.isLineSegments?g.setMode(P.LINES):i.isLineLoop?g.setMode(P.LINE_LOOP):g.setMode(P.LINE_STRIP)}else i.isPoints?g.setMode(P.POINTS):i.isSprite&&g.setMode(P.TRIANGLES);if(i.isBatchedMesh){if(Ie.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ue.get(c).bytesPerElement:1,o=ze.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(P,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function gt(e,t,n,r){ae!==null&&e.isNodeMaterial&&ae.setObject(r,e),De===!0&&Qe.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Ot(e,t,r),e.side=0,e.needsUpdate=!0,Ot(e,t,r),e.side=2):Ot(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),ae!==null&&ae.renderStart(e,t,n),k=Xe.get(n),k.init(t),j.push(k),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),k.setupLights(),ae!==null&&ae.updateLights(k.state.lightsArray),Oe=this.localClippingEnabled,De=Qe.init(this.clippingPlanes,Oe),De===!0&&Qe.setGlobalState(this.clippingPlanes,t),ae!==null&&et.render(k.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];gt(o,n,t,e),r.add(o)}else gt(i,n,t,e),r.add(i)}}),k=j.pop(),ae!==null&&ae.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=ze.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Ie.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let _t=null;function vt(e){_t&&_t(e)}function yt(){xt.stop()}function bt(){xt.start()}let xt=new Is;xt.setAnimationLoop(vt),typeof self<`u`&&xt.setContext(self),this.setAnimationLoop=function(e){_t=e,L.setAnimationLoop(e),e===null?xt.stop():xt.start()},L.addEventListener(`sessionstart`,yt),L.addEventListener(`sessionend`,bt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){I(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ie===!0)return;ae!==null&&ae.renderStart(e,t);let n=L.enabled===!0&&L.isPresenting===!0,r=re!==null&&(N===null||n)&&re.begin(M,N);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),L.enabled===!0&&L.isPresenting===!0&&(re===null||re.isCompositing()===!1)&&(L.cameraAutoUpdate===!0&&L.updateCamera(t),t=L.getCamera()),e.isScene===!0&&e.onBeforeRender(M,e,t,N),k=Xe.get(e,j.length),k.init(t),k.state.textureUnits=Ve.getTextureUnits(),j.push(k),ke.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),Ee.setFromProjectionMatrix(ke,qe,t.reversedDepth),Oe=this.localClippingEnabled,De=Qe.init(this.clippingPlanes,Oe),te=Ye.get(e,A.length),te.init(),A.push(te),L.enabled===!0&&L.isPresenting===!0){let e=M.xr.getDepthSensingMesh();e!==null&&Ct(e,t,-1/0,M.sortObjects)}Ct(e,t,0,M.sortObjects),te.finish(),ae!==null&&ae.updateLights(k.state.lightsArray),M.sortObjects===!0&&te.sort(xe,Se),Ne=L.enabled===!1||L.isPresenting===!1||L.hasDepthSensing()===!1,Ne&&nt.addToRenderList(te,e),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),De===!0&&Qe.beginShadows();let i=k.state.shadowsArray;if(et.render(i,e,t),De===!0&&Qe.endShadows(),(r&&re.hasRenderPass())===!1){let n=te.opaque,r=te.transmissive;if(k.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];Tt(n,r,e,a)}Ne&&nt.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];wt(te,e,n,n.viewport)}}else r.length>0&&Tt(n,r,e,t),Ne&&nt.render(e),wt(te,e,t)}N!==null&&ue===0&&(Ve.updateMultisampleRenderTarget(N),Ve.updateRenderTargetMipmap(N)),r&&re.end(M),e.isScene===!0&&e.onAfterRender(M,e,t),ct.resetDefaultState(),de=-1,fe=null,j.pop(),j.length>0?(k=j[j.length-1],Ve.setTextureUnits(k.state.textureUnits),De===!0&&Qe.setGlobalState(M.clippingPlanes,k.state.camera)):k=null,A.pop(),te=A.length>0?A[A.length-1]:null,ae!==null&&ae.renderEnd()};function Ct(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)k.pushLightProbeGrid(e);else if(e.isLight)k.pushLight(e),e.castShadow&&k.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||e.intersectsFrustum(Ee)){r&&je.setFromMatrixPosition(e.matrixWorld).applyMatrix4(ke);let i=Ge.update(e),a=e.material;a.visible&&te.push(e,i,a,n,je.z,null,t)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||e.intersectsFrustum(Ee))){let i=Ge.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),je.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),je.copy(e.boundingSphere.center)),je.applyMatrix4(e.matrixWorld).applyMatrix4(ke)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&te.push(e,i,c,n,je.z,s,t)}}else a.visible&&te.push(e,i,a,n,je.z,null,t)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)Ct(i[e],t,n,r)}function wt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;k.setupLightsView(n),De===!0&&Qe.setGlobalState(M.clippingPlanes,n),r&&F.viewport(pe.copy(r)),i.length>0&&Et(i,t,n),a.length>0&&Et(a,t,n),o.length>0&&Et(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function Tt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(k.state.transmissionRenderTarget[r.id]===void 0){let e=Ie.has(`EXT_color_buffer_half_float`)||Ie.has(`EXT_color_buffer_float`);k.state.transmissionRenderTarget[r.id]=new Ft(1,1,{generateMipmaps:!0,type:e?g:l,minFilter:c,samples:Math.max(4,Le.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:St.workingColorSpace})}let a=k.state.transmissionRenderTarget[r.id],o=r.viewport||pe;a.setSize(o.z*M.transmissionResolutionScale,o.w*M.transmissionResolutionScale);let s=M.getRenderTarget(),u=M.getActiveCubeFace(),d=M.getActiveMipmapLevel();M.setRenderTarget(a),M.getClearColor(ge),_e=M.getClearAlpha(),_e<1&&M.setClearColor(16777215,.5),M.clear(),Ne&&nt.render(n);let f=M.toneMapping;M.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),k.setupLightsView(r),De===!0&&Qe.setGlobalState(M.clippingPlanes,r),Et(e,n,r),Ve.updateMultisampleRenderTarget(a),Ve.updateRenderTargetMipmap(a),Ie.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Dt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(Ve.updateMultisampleRenderTarget(a),Ve.updateRenderTargetMipmap(a))}M.setRenderTarget(s,u,d),M.setClearColor(ge,_e),p!==void 0&&(r.viewport=p),M.toneMapping=f}function Et(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Dt(o,t,n,s,l,c)}}function Dt(e,t,n,r,i,a){ae!==null&&i.isNodeMaterial&&ae.setObject(e,i),e.onBeforeRender(M,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(M,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=2):M.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(M,t,n,r,i,a)}function Ot(e,t,n){t.isScene!==!0&&(t=Me);let r=ze.get(e),i=k.state.lights,a=k.state.shadowsArray,o=i.state.version,s=Ke.getParameters(e,i.state,a,t,n,k.state.lightProbeGridArray),c=Ke.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=He.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,R),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return At(e,s),d}else s.uniforms=Ke.getUniforms(e),ae!==null&&e.isNodeMaterial&&ae.build(e,n,s),e.onBeforeCompile(s,M),d=Ke.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Qe.uniform),At(e,s),r.needsLights=It(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=k.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function kt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=jl.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function At(e,t){let n=ze.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function jt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function Mt(e,t,n,r,i){t.isScene!==!0&&(t=Me),Ve.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=N===null?M.outputColorSpace:N.isXRRenderTarget===!0?N.texture.colorSpace:St.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=He.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(N===null||N.isXRRenderTarget===!0)&&(h=M.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=ze.get(r),y=k.state.lights;if(De===!0&&(Oe===!0||e!==fe)){let t=e===fe&&r.id===de;Qe.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Qe.numPlanes||v.numIntersection!==Qe.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=k.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=Ot(r,t,i),ae&&r.isNodeMaterial&&ae.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(F.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==de&&(de=r.id,C=!0),v.needsLights){let e=jt(k.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||fe!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(P,`projectionMatrix`,e.projectionMatrix),T.setValue(P,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(P,Ae.setFromMatrixPosition(e.matrixWorld)),Le.logarithmicDepthBuffer&&T.setValue(P,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(P,`isOrthographic`,e.isOrthographicCamera===!0),fe!==e&&(fe=e,C=!0,w=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&T.setValue(P,`sunShadowMap`,y.state.sunShadowMap,Ve),y.state.directionalShadowMap.length>0&&T.setValue(P,`directionalShadowMap`,y.state.directionalShadowMap,Ve),y.state.spotShadowMap.length>0&&T.setValue(P,`spotShadowMap`,y.state.spotShadowMap,Ve),y.state.pointShadowMap.length>0&&T.setValue(P,`pointShadowMap`,y.state.pointShadowMap,Ve)),i.isSkinnedMesh){T.setOptional(P,i,`bindMatrix`),T.setOptional(P,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(P,`boneTexture`,e.boneTexture,Ve))}i.isBatchedMesh&&(T.setOptional(P,i,`batchingTexture`),T.setValue(P,`batchingTexture`,i._matricesTexture,Ve),T.setOptional(P,i,`batchingIdTexture`),T.setValue(P,`batchingIdTexture`,i._indirectTexture,Ve),T.setOptional(P,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(P,`batchingColorTexture`,i._colorsTexture,Ve));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&it.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(P,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=Qu()),C){if(T.setValue(P,`toneMappingExposure`,M.toneMappingExposure),v.needsLights&&Pt(E,w),a&&r.fog===!0&&Je.refreshFogUniforms(E,a),Je.refreshMaterialUniforms(E,r,be,ye,k.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}jl.upload(P,kt(v),E,Ve)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(jl.upload(P,kt(v),E,Ve),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(P,`center`,i.center),T.setValue(P,`modelViewMatrix`,i.modelViewMatrix),T.setValue(P,`normalMatrix`,i.normalMatrix),T.setValue(P,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];lt.update(n,x),lt.bind(n,x)}}return x}function Pt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function It(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return le},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return N},this.setRenderTargetTextures=function(e,t,n){let r=ze.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),ze.get(e.texture).__webglTexture=t,ze.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=ze.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){N=e,le=t,ue=n;let r=null,i=!1,a=!1;if(e){let o=ze.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(P.FRAMEBUFFER,o.__webglFramebuffer),pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest,F.viewport(pe),F.scissor(me),F.setScissorTest(he),de=-1;return}if(o.__webglFramebuffer===void 0)Ve.setupRenderTarget(e);else if(o.__hasExternalTextures)Ve.rebindTextures(e,ze.get(e.texture).__webglTexture,ze.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&ze.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);Ve.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=ze.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&Ve.useMultisampledRTT(e)===!1?ze.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest}else pe.copy(Ce).multiplyScalar(be).floor(),me.copy(we).multiplyScalar(be).floor(),he=Te;if(n!==0&&(r=oe),F.bindFramebuffer(P.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(pe),F.scissor(me),F.setScissorTest(he),i){let r=ze.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=ze.get(e.textures[t]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=ze.get(e.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,t.__webglTexture,n)}de=-1};function Lt(e){let t=ze.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Le.textureFormatReadable(e.format),t.__typeReadable=Le.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){I(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=ze.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){F.bindFramebuffer(P.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let u=Lt(o);if(u.__formatReadable===!1){I(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){I(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&P.readPixels(t,n,r,i,st.convert(c),st.convert(l),a)}finally{let e=N===null?null:ze.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=ze.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(P.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+s);let d=Lt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.bufferData(P.PIXEL_PACK_BUFFER,a.byteLength,P.STREAM_READ),P.readPixels(t,n,r,i,st.convert(l),st.convert(u),0),P.bindBuffer(P.PIXEL_PACK_BUFFER,null);let p=N===null?null:ze.get(N).__webglFramebuffer;F.bindFramebuffer(P.FRAMEBUFFER,p);let m=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await rt(P,m,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,f),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,a),P.bindBuffer(P.PIXEL_PACK_BUFFER,null),P.deleteBuffer(f),P.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Ve.setTexture2D(e,0),P.copyTexSubImage2D(P.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=st.convert(t.format),_=st.convert(t.type),v;t.isData3DTexture?(Ve.setTexture3D(t,0),v=P.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Ve.setTexture2DArray(t,0),v=P.TEXTURE_2D_ARRAY):(Ve.setTexture2D(t,0),v=P.TEXTURE_2D),F.activeTexture(P.TEXTURE0),F.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,t.flipY),F.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),F.pixelStorei(P.UNPACK_ALIGNMENT,t.unpackAlignment);let y=F.getParameter(P.UNPACK_ROW_LENGTH),b=F.getParameter(P.UNPACK_IMAGE_HEIGHT),x=F.getParameter(P.UNPACK_SKIP_PIXELS),S=F.getParameter(P.UNPACK_SKIP_ROWS),C=F.getParameter(P.UNPACK_SKIP_IMAGES);F.pixelStorei(P.UNPACK_ROW_LENGTH,h.width),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,h.height),F.pixelStorei(P.UNPACK_SKIP_PIXELS,l),F.pixelStorei(P.UNPACK_SKIP_ROWS,u),F.pixelStorei(P.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=ze.get(e),r=ze.get(t),h=ze.get(n.__renderTarget),g=ze.get(r.__renderTarget);F.bindFramebuffer(P.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,ze.get(e).__webglTexture,i,d+n),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,ze.get(t).__webglTexture,a,m+n)),P.blitFramebuffer(l,u,o,s,f,p,o,s,P.DEPTH_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||ze.has(e)){let n=ze.get(e),r=ze.get(t);F.bindFramebuffer(P.READ_FRAMEBUFFER,se),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,ce);for(let e=0;e<c;e++)w?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,n.__webglTexture,i),T?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,r.__webglTexture,a),i===0?T?P.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):P.copyTexSubImage2D(v,a,f,p,l,u,o,s):P.blitFramebuffer(l,u,o,s,f,p,o,s,P.COLOR_BUFFER_BIT,P.NEAREST);F.bindFramebuffer(P.READ_FRAMEBUFFER,null),F.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?P.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):P.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):P.texSubImage2D(P.TEXTURE_2D,a,f,p,o,s,g,_,h);F.pixelStorei(P.UNPACK_ROW_LENGTH,y),F.pixelStorei(P.UNPACK_IMAGE_HEIGHT,b),F.pixelStorei(P.UNPACK_SKIP_PIXELS,x),F.pixelStorei(P.UNPACK_SKIP_ROWS,S),F.pixelStorei(P.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&P.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){ze.get(e).__webglFramebuffer===void 0&&Ve.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Ve.setTextureCube(e,0):e.isData3DTexture?Ve.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Ve.setTexture2DArray(e,0):Ve.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){le=0,ue=0,N=null,F.reset(),ct.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return qe}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=St._getDrawingBufferColorSpace(e),t.unpackColorSpace=St._getUnpackColorSpace()}},ed=1400;function td(e){return .62+.38*Math.min(1,e/7e3)}var nd=200,rd=950,id=170,ad=e=>e<=0?0:e>=1?1:e*e*(3-2*e);function od(e){let t=Math.floor((e-nd)/ed);return{i:t,v:e-nd-t*ed}}function sd(e){return ad(e/id)*ad((rd-e)/id)}function cd(e,t,n){let r=Math.PI*2;switch(e){case 0:return n*(30*Math.sin(r*t/640)+6*Math.sin(r*t/230+1));case 1:return n*(23*Math.sin(r*t/290)+9*Math.sin(r*t/150+.6));case 2:return-n*(62*Math.sin(Math.PI*t/rd)**2-7*Math.sin(r*t/260));case 3:return n*(30*Math.sin(r*t/260)+3.5*Math.sin(3*r*t/260));default:return n*(26*Math.sin(r*t/520)+16*Math.sin(r*t/230+1.3)+5*Math.sin(r*t/120))}}function ld(e){let{i:t,v:n}=od(e);return t<0||n>=rd?0:sd(n)*cd(t%5,n,td(e))}function ud(e){return(ld(e+1)-ld(e-1))/2}function dd(e){return(ld(e+2)-2*ld(e)+ld(e-2))/4}function fd(e,t=60){let n=Math.atan(ud(e)),r=0;for(let i=1;i<=6;i++){let a=Math.atan(ud(e+t*i/6))-n;Math.abs(a)>Math.abs(r)&&(r=a)}return Math.max(-1,Math.min(1,r/(Math.PI/3)))}function pd(e){return-Math.atan(ud(e))}function md(e,t,n=0,r=new z){return r.set(ld(e)+t,n,-e)}var hd=[{name:`Sunny Meadow`,kind:`meadow`,sky:[5224703,13496575],fog:13496575,grass:[6279226,5424432],ground:7330890,road:5593712,accent:16765471,sun:16774084},{name:`Barnyard Bend`,kind:`barnyard`,sky:[6078719,14939903],fog:14939903,grass:[8313175,7129927],ground:9363555,road:5988211,accent:16726832,sun:16773560},{name:`Creek Crossing`,kind:`creek`,sky:[3844328,12905727],fog:12905727,grass:[5227130,4437100],ground:5885830,road:5199472,accent:3112191,sun:16777215},{name:`Red Rock Run`,kind:`canyon`,sky:[16751178,16769456],fog:16767400,grass:[15115356,14259791],ground:15380843,road:6969946,accent:16747008,sun:16769712},{name:`Sunset Hills`,kind:`sunset`,sky:[8015359,16757898],fog:16758938,grass:[9424725,8569674],ground:10147423,road:5065320,accent:16735370,sun:16761994}],gd=e=>Math.floor(Math.max(0,e)/ed),_d=e=>hd[gd(e)%hd.length],vd=3.5,yd=1.1,bd=5,xd=250,Sd=46,Cd=e=>e===`vTower`||e===`vHut`||e===`vGate`||e===`vChief`,wd=e=>e===`drone`||e===`bomber`,Td=new Set([`boss`,`drone`,`bomber`,`vTower`,`vHut`,`vChief`]),Ed=130,Dd=160,Od=40,kd=e=>Math.min(82,20+.1*e+7e-5*e*e),Ad=8.5,jd=3,Md=4,Nd=[`engine`,`armor`,`rapid`,`spread`,`shield`,`repair`],Pd=[.22,.14,.22,.16,.14,.12],Fd=(e,t,n)=>Math.min(n,Math.max(t,e)),Id=1;function Ld(e,t,n,r,i,a){return{id:Id++,kind:e,d:t,x:n,hp:a,hpMax:a,w:r,h:i,phase:Math.random()*6.28,wob:0,fireT:1.2+Math.random()*1.5,tele:0,flash:0,hit:!1,used:!1,zPrev:9999,upgrade:`engine`,vx:0,alt:0,vy:0,zOff:0}}var Rd=class{D=0;speed=0;carRel=0;time=0;level=1;zone=0;hull=bd;maxHull=bd;score=0;kills=0;shots=0;shotHits=0;upg={engine:0,armor:0,rapid:0,spread:0};combo=0;comboT=0;get mult(){return Math.min(5,1+Math.floor(this.combo/3))}shield=0;nitroT=0;nitroCd=0;slipT=0;drifting=!1;driftDir=1;driftCharge=0;driftTierShown=0;boostT=0;airT=0;airDur=1;heat=0;heatLockT=0;sinceShot=9;lock=null;nearMisses=0;prevNitro=!1;shotCd=0;invul=0;shake=0;flash=0;over=!1;collide=!0;boss=null;bossStyle=null;village=[];stormD=-130;stormV=20;stormHitT=0;overBy=`hull`;villageBase=0;get stormGap(){return this.D-this.stormD}bossesDown=0;carVx=0;gear=1;rpm=0;shiftT=0;accLong=0;accLat=0;get slipAng(){return Math.atan2(this.carVx,Math.max(this.speed,6))}ditchT=0;nextEdge=90;steerApplied=0;lastShot=null;objs=[];events=[];project=()=>null;nextSpawn=140;nextPickup=240;nextBossD=ed-160;reset(){this.D=0,this.speed=0,this.carRel=0,this.time=0,this.level=1,this.zone=0,this.hull=bd,this.maxHull=bd,this.score=0,this.kills=0,this.shots=0,this.shotHits=0,this.upg={engine:0,armor:0,rapid:0,spread:0},this.combo=0,this.comboT=0,this.shield=0,this.nitroT=0,this.nitroCd=0,this.slipT=0,this.drifting=!1,this.driftCharge=0,this.driftTierShown=0,this.boostT=0,this.airT=0,this.heat=0,this.heatLockT=0,this.sinceShot=9,this.lock=null,this.nearMisses=0,this.prevNitro=!1,this.shotCd=0,this.invul=0,this.shake=0,this.flash=0,this.over=!1,this.boss=null,this.bossStyle=null,this.village=[],this.stormD=-130,this.stormV=20,this.stormHitT=0,this.overBy=`hull`,this.carVx=0,this.gear=1,this.rpm=0,this.shiftT=0,this.accLong=0,this.accLat=0,this.ditchT=0,this.nextEdge=90,this.bossesDown=0,this.steerApplied=0,this.lastShot=null,this.objs=[],this.events=[],this.nextSpawn=140,this.nextPickup=240,this.nextBossD=ed-160}carWorldX(){return ld(this.D+vd)+this.carRel}get difficulty(){return this.level+this.zone*1.5}get driftTier(){return this.driftCharge>=1.6?3:this.driftCharge>=1?2:+(this.driftCharge>=.5)}get air(){if(this.airT<=0)return 0;let e=1-this.airT/this.airDur;return 13.6*e*(1-e)}get bossFrac(){if(!this.boss)return null;if(this.bossStyle===`village`){let e=0;for(let t of this.village)t.hit||(e+=Math.max(0,t.hp))}return this.boss.hp/this.boss.hpMax}get shotInterval(){return Math.max(.12,.38-.08*this.upg.rapid)}step(e,t,n,r=!0){if(this.over)return;this.collide=r,this.time+=e,this.level=Math.min(10,1+Math.floor(this.time/25)),this.zone=gd(this.D),this.comboT>0&&(this.comboT-=e,this.comboT<=0&&(this.combo=0)),this.shield=Math.max(0,this.shield-e),this.slipT=Math.max(0,this.slipT-e),this.nitroCd=Math.max(0,this.nitroCd-e),this.nitroT>0&&(this.nitroT=Math.max(0,this.nitroT-e)),r&&t.nitro&&!this.prevNitro&&this.nitroCd<=0&&this.nitroT<=0&&(this.nitroT=1.6,this.nitroCd=8,this.events.push({k:`nitro`})),this.prevNitro=t.nitro;let i=Math.min(90,46+5*this.upg.engine+1.5*this.level);this.boostT=Math.max(0,this.boostT-e);let a=this.nitroT>0?i+20:this.boostT>0?i+14:i,o=this.airT<=0,s=[0,17,31,46,64,92],c=this.gear;for(;c<5&&this.speed>s[c];)c++;for(;c>1&&this.speed<s[c-1]-4;)c--;c>this.gear&&t.gas&&o&&(this.shiftT=.16,this.events.push({k:`shift`})),this.gear=c,this.shiftT=Math.max(0,this.shiftT-e),this.rpm=Fd((this.speed-s[c-1])/(s[c]-s[c-1]),0,1);let l=0;if(t.gas&&!t.brake){let e=Fd((a-this.speed)/5,0,1),t=25*(1-.5*this.rpm)*(c===1?1.15:1);this.shiftT>0&&(t=0),(this.nitroT>0||this.boostT>0)&&(t+=20),l+=t*e*(o?1:.2)}l-=1.1+.0011*this.speed*this.speed,this.speed>a&&(l-=(this.speed-a)*1.5),t.brake&&o&&(l-=24),this.accLong+=(l-this.accLong)*Math.min(1,e*8),this.speed=Math.max(0,this.speed+l*e);let u=Math.abs(this.carRel);if(this.collide&&this.airT<=0&&u>Ad){let t=Fd((u-Ad)/2,.2,1.5);this.speed=Math.max(0,this.speed-16*t*e),this.shake=Math.max(this.shake,.14),u>11.6?(this.ditchT+=e,this.ditchT>1.8&&(this.ditchT=0,this.slipT=Math.max(this.slipT,.8),this.hurt(1))):this.ditchT=Math.max(0,this.ditchT-e)}else this.ditchT=Math.max(0,this.ditchT-e);let d=this.speed*e;if(this.D+=d,this.updateStorm(e,r),this.score+=d*.5*(r?this.mult:1),this.airT>0&&(this.airT-=e,this.airT<=0)){this.airT=0;let e=Math.abs(t.steer)<.35;e&&(this.boostT=Math.max(this.boostT,.7)),this.events.push({k:`land`,boost:e})}let f=this.airT<=0;r&&t.drift&&f&&this.speed>28&&Math.abs(t.steer)>.25?(this.drifting||(this.drifting=!0,this.driftDir=Math.sign(t.steer)||1,this.driftCharge=0,this.driftTierShown=0,this.events.push({k:`drift`,phase:`start`,tier:0})),this.driftCharge+=e*(.55+.45*Math.abs(t.steer)),this.driftTier>this.driftTierShown&&(this.driftTierShown=this.driftTier,this.events.push({k:`drift`,phase:`tier`,tier:this.driftTier})),this.speed=Math.max(0,this.speed-3*e)):this.drifting&&this.endDrift();let p=t.steer;this.slipT>0&&(p=p*.35+Math.sin(this.time*9)*.55),f||(p*=.4);let m=Math.abs(p)>Math.abs(this.steerApplied)?4:6.5;this.steerApplied+=Fd(p-this.steerApplied,-m*e,m*e);let h=this.speed,g=Fd(h/9,0,1)*(1-.32*Fd(h/Math.max(i,1),0,1.3)),_=(f?1:.08)*(this.slipT>0?.3:1)*(this.drifting?.5:1)*(Math.abs(this.carRel)>Ad?.75:1),v=Fd((this.steerApplied*13*g*(this.drifting?1.3:1)+(this.drifting?this.driftDir*2.2:0)-this.carVx)*7,-22*_,22*_);this.carVx+=v*e,this.accLat+=(v-this.accLat)*Math.min(1,e*10),this.carRel+=(this.carVx-.2*dd(this.D+vd)*h*h)*e,Math.abs(this.carRel)>12.5&&(this.carRel=Fd(this.carRel,-12.5,12.5),this.carVx*=.3),this.invul=Math.max(0,this.invul-e),this.shake=Math.max(0,this.shake-e),this.flash=Math.max(0,this.flash-e),this.shotCd-=e,this.spawnAhead(),this.updateObjects(e),this.sinceShot+=e,this.heatLockT=Math.max(0,this.heatLockT-e),this.heatLockT>0?this.heat=Math.max(0,this.heat-.8*e):this.sinceShot>.25&&(this.heat=Math.max(0,this.heat-.3*e)),this.lock=r?this.scan(n.rx*innerWidth,n.ry*innerHeight)?.o??null:null,r&&n.fire&&this.shotCd<=0&&this.heatLockT<=0&&(this.shotCd=this.shotInterval,this.sinceShot=0,this.heat+=.12-.015*this.upg.rapid,this.fire(n.rx,n.ry),this.heat>=1&&(this.heat=1,this.heatLockT=1.3,this.events.push({k:`overheat`}))),this.checkCollisions(),this.objs=this.objs.filter(e=>!e.hit&&e.d-this.D>-10&&e.d-this.D<330)}spawnAhead(){!this.boss&&this.collide&&this.D>=this.nextBossD-(this.isVillageZone()?150:0)&&this.spawnBoss();let e=!!this.boss;for(;this.nextSpawn<this.D+xd;){!e&&this.nextSpawn<this.nextBossD-30&&this.spawnEnemy(this.nextSpawn);let t=Math.max(20,60-this.difficulty*3.5)*(.7+Math.random()*.6);this.nextSpawn+=t}for(;this.nextEdge<this.D+xd;)this.spawnEdge(this.nextEdge),this.nextEdge+=16+Math.random()*18;for(;this.nextPickup<this.D+xd;){let e=Ld(`pickup`,this.nextPickup,(Math.random()*2-1)*7.5,2.6,1.6,1);e.upgrade=this.pickUpgrade(),this.objs.push(e),this.nextPickup+=220+Math.random()*160}}pickUpgrade(){let e=Math.random();for(let t=0;t<Nd.length;t++){let n=Nd[t],r=n!==`shield`&&n!==`repair`&&this.upg[n]>=(n===`armor`?Md:jd)||n===`repair`&&this.hull>=this.maxHull?0:Pd[t];if(e-=r,e<=0&&r>0)return n}return`shield`}spawnEdge(e){let t=(Math.random()<.5?-1:1)*(9.6+Math.random()*2.2),n=Math.random();n<.55?this.objs.push(Ld(`post`,e,t,.7,1.4,1)):n<.8?this.objs.push(Ld(`rock`,e,t,2.2,1.5,9)):this.objs.push(Ld(`hay`,e,t,2.2,1.6,2))}airCount(){let e=0;for(let t of this.objs)wd(t.kind)&&!t.hit&&e++;return e}spawnEnemy(e){let t=(Math.random()*2-1)*7.5,n=this.difficulty;if(n>=1.5&&this.airCount()<2&&Math.random()<.13){if(n>=3&&Math.random()<.42){let e=Ld(`bomber`,this.D+190,t,4.2,1.4,4);e.alt=5.5,e.fireT=.6,this.objs.push(e),this.events.push({k:`air`,kind:`bomber`})}else{let e=Ld(`drone`,this.D+170,t,2,1.2,2);e.alt=4+Math.random()*3,e.fireT=2+Math.random(),this.objs.push(e),this.events.push({k:`air`,kind:`drone`})}return}let r=Math.min(.62,.34+.035*n),i=Math.random();if(i<.07)return void this.objs.push(Ld(`ramp`,e,(Math.random()*2-1)*6.5,5,.7,1));if(i<.15)return void this.objs.push(Ld(`pad`,e,(Math.random()*2-1)*7,4.4,.1,1));let a=Math.random();if(a<r){let r=n>=3&&Math.random()<.3;this.objs.push(r?Ld(`heavy`,e,t,3,2.8,3):Ld(`raider`,e,t,2.4,1.9,1))}else a<r+.2?this.objs.push(Ld(`barrel`,e,t,1.3,1.3,1)):a<r+.32?this.objs.push(Ld(`rock`,e,t,2.2,1.5,9)):a<r+.44?this.objs.push(Ld(`hay`,e,t,2.2,1.6,2)):this.objs.push(Ld(`oil`,e,t,4.2,.1,1))}isVillageZone(){return gd(this.nextBossD)%2==1}updateStorm(e,t){if(!t){this.stormD=this.D-Ed;return}this.stormV=kd(this.time),this.stormD+=this.stormV*e,this.D-this.stormD>Dd&&(this.stormD=this.D-Dd);let n=this.D-this.stormD;this.stormHitT=Math.max(0,this.stormHitT-e),n<=0?(this.hull=0,this.overBy=`storm`,this.over=!0,this.events.push({k:`over`})):n<Od&&this.stormHitT<=0&&(this.stormHitT=2.2,this.events.push({k:`storm`}),this.invul=0,this.hurt(1))}spawnBoss(){let e=gd(this.D+200);if(this.isVillageZone())return this.spawnVillage(e);let t=Ld(`boss`,this.D+Sd+80,0,6,4.5,18+10*e);t.fireT=2.5,this.objs.push(t),this.boss=t,this.bossStyle=`harvester`,this.events.push({k:`boss`,phase:`spawn`,zone:e,style:`harvester`})}spawnVillage(e){let t=(e,t,n,r,i,a,o)=>{let s=Ld(e,this.villageBase+t,n,r,i,a);return s.zOff=t,s.fireT=o,this.objs.push(s),this.village.push(s),s};this.village=[],this.villageBase=this.nextBossD;for(let n of[-1,1])t(`vTower`,56,n*10.5,3.4,7,5+2*e,2+(n+1)*.4),t(`vHut`,40,n*12.5,4,3.4,4+e,1.5);t(`vGate`,78,0,24,3.4,10+2*e,99);let n=t(`vChief`,104,0,7,5,16+6*e,3);this.boss=n,this.bossStyle=`village`,this.events.push({k:`boss`,phase:`spawn`,zone:e,style:`village`})}gateAlive(){return this.village.some(e=>e.kind===`vGate`&&!e.hit)}updateObjects(e){let t=[],n=this.difficulty;for(let r of this.objs)if(r.flash>0&&(r.flash-=e),r.kind===`raider`||r.kind===`heavy`){r.d+=(this.speed-(r.kind===`heavy`?16:22))*e,r.wob+=e,r.x=Fd(r.x+Math.sin(r.wob*1.4+r.phase)*2.4*e,-8.4,8.4),r.fireT-=e,r.tele=Fd(1-r.fireT/.6,0,1);let i=r.d-this.D,a=Math.abs(r.x-this.carRel)>3;this.collide&&r.fireT<=0&&i<150&&i>(a?10:20)?(r.fireT=Math.max(1.6,3-.1*n)*(.8+Math.random()*.4),t.push(this.aimShell(r,0))):r.fireT<=0&&(r.fireT=.4)}else r.kind===`boss`?this.updateBoss(r,e,t):r.kind===`drone`?this.updateDrone(r,e,t):r.kind===`bomber`?this.updateBomber(r,e,t):r.kind===`bomb`?(r.alt=Math.max(0,r.alt-9*e),r.tele=Fd(1-r.alt/6,0,1)):Cd(r.kind)?this.updateVillagePiece(r,e,t):r.kind===`bullet`&&(r.d+=(this.speed-60)*e,r.x+=r.vx*e,r.alt>0&&(r.alt=Math.max(0,r.alt+r.vy*e)));this.objs.push(...t)}shellFrom(e,t){let n=Ld(`bullet`,e.d,e.x,.9,.9,1);return n.vx=t,n}aimShell(e,t){let n=Fd((e.d-this.D-vd)/60,.18,3),r=this.carRel+this.carVx*n*.7,i=this.shellFrom(e,Fd((r-e.x)/n,-30,30)+t);return e.alt>0&&(i.alt=e.alt,i.vy=-e.alt/n),i}updateDrone(e,t,n){e.wob+=t;let r=e.wob>18,i=e.d-this.D,a=r?40:Fd((52-i)*1.5,-40,40);e.d+=(this.speed+a)*t;let o=Fd(this.carRel*.6+Math.sin(e.wob*.9+e.phase)*7,-8.5,8.5);e.x+=Fd(o-e.x,-9*t,9*t),e.fireT-=t,e.tele=Fd(1-e.fireT/.7,0,1),this.collide&&e.fireT<=0&&i>12&&i<120&&!r?(e.fireT=Math.max(1.5,2.6-.08*this.difficulty)*(.8+Math.random()*.4),n.push(this.aimShell(e,0))):e.fireT<=0&&(e.fireT=.4)}updateBomber(e,t,n){e.d+=(this.speed-34)*t;let r=e.d-this.D,i=Fd(this.carRel+this.carVx*.4,-8,8);if(e.x+=Fd(i-e.x,-6*t,6*t),e.fireT-=t,e.tele=Fd(1-e.fireT/.5,0,1),this.collide&&e.fireT<=0&&r>14&&r<100){e.fireT=.75;let t=r/Math.max(20,this.speed),i=Ld(`bomb`,e.d,Fd(this.carRel+this.carVx*t*.5+(Math.random()-.5)*3,-9,9),2.6,1,1);i.alt=6,n.push(i)}else e.fireT<=0&&(e.fireT=.3)}updateVillagePiece(e,t,n){if(e.hit)return;let r=e.d-this.D,i=r<105&&r>4.5;if(e.fireT-=t,this.collide&&!e.used&&e.kind!==`vGate`&&r<2.5)e.used=!0,this.invul=0,this.hurt(e.kind===`vChief`?2:1),this.events.push({k:`ambush`,d:e.d,x:e.x,kind:e.kind}),e.kind===`vChief`&&this.endVillage();else if(e.kind===`vTower`){if(e.tele=Fd(1-e.fireT/.7,0,1),this.collide&&i&&e.fireT<=0){e.fireT=Math.max(1.8,3.2-.1*this.zone)*(.8+Math.random()*.4);let t=this.aimShell({...e,alt:5.5},0);n.push(t)}}else if(e.kind===`vHut`){if(e.tele=Fd(1-e.fireT/.8,0,1),this.collide&&i&&e.fireT<=0){e.fireT=4+Math.random()*1.5;let t=0;for(let e of this.objs)e.kind===`raider`&&!e.hit&&t++;if(t<3){let t=Ld(`raider`,e.d-2,Math.sign(e.x)*5,2.4,1.9,1);n.push(t)}}}else if(e.kind===`vChief`){let r=!this.gateAlive();if(e.wob+=t,e.x+=(Math.sin(e.wob*.6)*6*(r?1:.4)-e.x)*Math.min(1,t*1.4),e.tele=i?Fd(1-e.fireT/.9,0,1):0,this.collide&&i&&e.fireT<=0){e.fireT=Math.max(1.3,2.4-(1-e.hp/e.hpMax)*1);for(let t of[-6,0,6])n.push(this.aimShell(e,t))}else e.fireT<=0&&(e.fireT=.5)}}updateBoss(e,t,n){e.d+=(this.D+Sd-e.d)*Math.min(1,t*2.2),e.wob+=t;let r=Math.sin(e.wob*.7)*6.5;e.x+=(r-e.x)*Math.min(1,t*1.6);let i=1-e.hp/e.hpMax;if(e.fireT-=t,e.tele=Fd(1-e.fireT/.9,0,1),this.collide&&e.fireT<=0){e.fireT=Math.max(1.3,2.6-i*1.2-this.zone*.1);for(let t of[-7,0,7])n.push(this.aimShell(e,t))}}checkCollisions(){let e=this.carWorldX();for(let t of this.objs){let n=t.d-this.D;if(this.collide&&!t.hit&&t.zPrev>3.5&&n<=3.5&&!Td.has(t.kind)){let n=Math.abs(ld(t.d)+t.x-e),r=t.w/2+yd,i=t.kind===`barrel`||t.kind===`rock`||t.kind===`hay`||t.kind===`raider`||t.kind===`heavy`||t.kind===`oil`||t.kind===`post`||t.kind===`bomb`;n<r?this.airT>0&&i?this.nearMiss(t,!0):this.collideWith(t):n<r+1.3&&!t.used&&(i||t.kind===`bullet`)&&t.kind!==`oil`&&this.nearMiss(t,!1)}t.zPrev=n}}nearMiss(e,t){e.used=!0,this.nearMisses++,this.score+=(t?60:30)*this.mult,this.nitroCd=Math.max(0,this.nitroCd-1.2),this.events.push({k:`near`,air:t})}endDrift(){let e=this.driftTier;this.drifting=!1,e>0&&(this.boostT=Math.max(this.boostT,[0,.7,1.2,1.8][e]),this.nitroCd=Math.max(0,this.nitroCd-e*1.5),this.events.push({k:`drift`,phase:`boost`,tier:e})),this.driftCharge=0,this.driftTierShown=0}collideWith(e){let t=(t,n,r)=>this.events.push({k:`kill`,d:e.d,x:e.x,h:t,size:n,color:r});switch(e.kind){case`pickup`:e.hit=!0,this.applyUpgrade(e);break;case`ramp`:!e.used&&this.airT<=0&&this.speed>15&&(e.used=!0,this.drifting&&this.endDrift(),this.airDur=.7+this.speed*.012,this.airT=this.airDur,this.events.push({k:`jump`}));break;case`pad`:e.used||(e.used=!0,this.boostT=Math.max(this.boostT,1.3),this.events.push({k:`pad`}));break;case`oil`:e.used||(e.used=!0,this.slipT=1.4,this.events.push({k:`slip`}));break;case`barrel`:e.hit=!0,this.speed*=.6,this.hurt(1),t(.6,1.6,16747008);break;case`rock`:case`hay`:case`post`:e.hit=!0,this.speed*=e.kind===`rock`?.5:.7,this.hurt(1),t(.8,1.8,e.kind===`hay`?16765471:e.kind===`post`?12159562:9080739),Math.abs(e.x)>Ad&&(this.slipT=Math.max(this.slipT,1),this.speed*=.8,this.events.push({k:`spin`}));break;case`bomb`:e.hit=!0,this.hurt(1),this.speed*=.75,t(.8,3.2,16747008);break;case`vGate`:e.hit=!0,this.speed=Math.min(this.speed,9),this.hurt(2),t(1.5,6,12159562);break;case`raider`:case`heavy`:e.hit=!0,this.hurt(1),t(1,3,16726832);break;case`bullet`:e.hit=!0,this.hurt(1),t(.6,1.2,16726832)}}applyUpgrade(e){let t=e.upgrade;t===`armor`?(this.upg.armor<Md&&(this.upg.armor++,this.maxHull=bd+this.upg.armor),this.hull=Math.min(this.maxHull,this.hull+1)):t===`shield`?this.shield=8:t===`repair`?this.hull=Math.min(this.maxHull,this.hull+2):this.upg[t]=Math.min(jd,this.upg[t]+1),this.score+=50,this.events.push({k:`pickup`,u:t,d:e.d,x:e.x})}hurt(e){this.invul>0||!this.collide||(this.combo=0,this.comboT=0,this.shield>0?(this.shield=0,this.invul=.6,this.shake=.2,this.events.push({k:`hurt`})):(this.hull-=e,this.invul=.8,this.shake=.45,this.flash=.3,this.events.push({k:`hurt`}),this.hull<=0&&(this.hull=0,this.over=!0,this.events.push({k:`over`}))))}scan(e,t){let n=40+16*this.upg.spread,r=null,i=1/0;for(let a of this.objs){if(a.hit||a.kind===`pickup`||a.kind===`rock`||a.kind===`oil`||a.kind===`ramp`||a.kind===`pad`||a.kind===`post`||a.kind===`vChief`&&this.gateAlive())continue;let o=a.d-this.D;if(o<=2.2||o>260)continue;let s=a.kind===`bullet`?a.alt+.2:a.alt,c=this.project(a.d,a.x-a.w/2,s),l=this.project(a.d,a.x+a.w/2,s+a.h);if(!c||!l)continue;let u=Math.min(c.sx,l.sx),d=Math.max(c.sx,l.sx),f=Math.min(c.sy,l.sy),p=Math.max(c.sy,l.sy),m=e<u?u-e:e>d?e-d:0,h=t<f?f-t:t>p?t-p:0,g=Math.hypot(m,h);if(g>n)continue;let _=g+o*.15;_<i&&(i=_,r={o:a,crit:(a.kind===`raider`||a.kind===`heavy`||a.kind===`boss`||a.kind===`drone`||a.kind===`bomber`||a.kind===`vChief`)&&g===0&&t<f+(p-f)*.38})}return r}fire(e,t){this.shots++,this.events.push({k:`shot`});let n=this.scan(e*innerWidth,t*innerHeight);if(!n){this.lastShot=null;return}let r=n.o,i=n.crit,a=i?r.kind===`boss`&&r.tele>.3?3:2:1;if(this.shotHits++,this.lastShot={d:r.d,x:r.x,h:r.alt+r.h*.5},r.hp-=a,r.flash=.12,r.hp>0){this.events.push({k:`hit`,d:r.d,x:r.x,h:r.alt+r.h*(i?.75:.5),crit:i});return}r.hit=!0;let o=25,s=1.2,c=16765471;switch(r.kind){case`raider`:this.kills++,this.addCombo(),o=150,s=3,c=16726832;break;case`heavy`:this.kills++,this.addCombo(),o=300,s=4,c=10178047;break;case`boss`:this.kills++,this.addCombo(),o=2e3,s=9,c=16747008,this.bossDown(r,`harvester`);break;case`vChief`:this.kills++,this.addCombo(),o=3e3,s=9,c=16747008,this.bossDown(r,`village`);break;case`vTower`:case`vHut`:case`vGate`:this.kills++,this.addCombo(),o=r.kind===`vGate`?500:350,s=r.kind===`vGate`?6:5,c=12159562;break;case`drone`:case`bomber`:if(this.kills++,this.addCombo(),o=r.kind===`drone`?200:350,s=r.kind===`drone`?2.6:3.6,c=5230847,Math.random()<.3){let e=Ld(`pickup`,r.d,Fd(r.x,-7.5,7.5),2.6,1.6,1);e.upgrade=this.pickUpgrade(),this.objs.push(e)}break;case`bomb`:o=30,s=3,c=16747008;break;case`barrel`:o=40,s=1.8,c=16747008;break;case`hay`:o=30,s=2}this.score+=o*this.mult*(i?1.5:1),this.events.push({k:`kill`,d:r.d,x:r.x,h:r.alt+r.h*.5,size:s,color:c,crit:i})}endVillage(){this.boss=null,this.bossStyle=null,this.village=[],this.nextBossD=(gd(this.D)+1)*ed+ed-160,this.events.push({k:`escaped`})}bossDown(e,t){this.boss=null,this.bossStyle=null,this.bossesDown++,this.nextBossD=(gd(this.D)+1)*ed+ed-160;for(let t of this.village)t.hit||t===e||(t.hit=!0,this.events.push({k:`kill`,d:t.d,x:t.x,h:t.h*.5,size:5,color:12159562}));this.village=[],this.events.push({k:`boss`,phase:`down`,zone:gd(this.D),style:t}),this.dropReward(e)}addCombo(){let e=this.mult;this.combo++,this.comboT=3.2,this.mult!==e&&this.events.push({k:`combo`,mult:this.mult})}dropReward(e){let t=Ld(`pickup`,e.d+18,0,2.6,1.6,1);t.upgrade=this.hull<this.maxHull?`repair`:this.pickUpgrade(),this.objs.push(t),this.hull=Math.min(this.maxHull,this.hull+1)}},zd=60,Bd=10,Vd=zd/Bd,Hd=8,Ud=45,Wd=268,Gd=14,Kd=14.8,qd=12.4,Jd=e=>e<0?0:e>1?1:e,Yd=e=>{let t=Jd(e);return t*t*(3-2*t)},Xd=(e,t,n)=>e+(t-e)*n,Zd=(e,t)=>(e%t+t)%t;function W(e,t,n=0){let r=Math.imul(e|0,668265261)^Math.imul(t|0,374761393)^Math.imul(n+1|0,2654435761);return r^=r>>>15,r=Math.imul(r,2246822507),r^=r>>>13,r=Math.imul(r,3266489909),r^=r>>>16,(r>>>0)/4294967296}var Qd=e=>hd[Zd(gd(e),hd.length)].kind,$d=e=>hd[Zd(e,hd.length)],G=(e,t,n,r,i,a)=>({g:new Hi(e,t,n),c:r,p:i,r:a}),ef=(e,t,n,r,i,a,o,s)=>({g:new Wi(e,t,n,r),c:i,p:a,r:o,s}),tf=(e,t,n,r,i,a,o)=>({g:new Gi(e,t,n),c:r,p:i,r:a,s:o}),nf=(e,t,n,r,i)=>({g:new so(e,t),c:n,p:r,s:i}),rf=(e,t,n,r,i,a)=>({g:new mo(e,t,n),c:r,p:i,s:a});function af(e,t,n,r,i){let a=[-e/2,0,-n/2],o=[e/2,0,-n/2],s=[0,t,-n/2],c=[-e/2,0,n/2],l=[e/2,0,n/2],u=[0,t,n/2],d=[a,s,o,c,l,u,a,c,u,a,u,s,o,s,u,o,u,l,a,o,l,a,l,c],f=[];for(let e of d)f.push(e[0],e[1],e[2]);let p=new hr;return p.setAttribute(`position`,new rr(f,3)),{g:p,c:r,p:i}}var of=new V,sf=new Rt,cf=new mt,lf=new Jt,uf=new z,df=new z,ff=new Rt,pf=new z,mf=new Rt,hf=new Rt,gf=new Rt,_f=new z(0,1,0);function vf(e,t=.32){let n=[],r=[];for(let t of e){let e=t.g.index?t.g.toNonIndexed():t.g.clone(),[i,a,o]=t.p??[0,0,0],[s,c,l]=t.r??[0,0,0],[u,d,f]=t.s??[1,1,1];sf.compose(uf.set(i,a,o),cf.setFromEuler(lf.set(s,c,l)),df.set(u,d,f)),e.applyMatrix4(sf);let p=e.getAttribute(`position`);of.setHex(t.c);for(let e=0;e<p.count;e++)n.push(p.getX(e),p.getY(e),p.getZ(e)),r.push(of.r,of.g,of.b);e.dispose(),t.g.dispose()}let i=1/0,a=-1/0;for(let e=1;e<n.length;e+=3)i=Math.min(i,n[e]),a=Math.max(a,n[e]);let o=Math.max(.001,a-i);for(let e=0;e<r.length/3;e++){let a=1-t+t*((n[e*3+1]-i)/o);r[e*3]*=a,r[e*3+1]*=a,r[e*3+2]*=a}let s=new hr;return s.setAttribute(`position`,new rr(n,3)),s.setAttribute(`color`,new rr(r,3)),s.computeVertexNormals(),s}var yf=12088894,bf=1776442;function xf(){return vf([ef(.32,.46,2.6,6,yf,[0,1.3,0]),nf(1.95,1,3130970,[0,3.7,0],[1,.92,1]),nf(1.45,1,4052326,[1.15,3,.3]),nf(1.35,1,2667858,[-1.05,3.15,-.4]),nf(1.2,1,4972658,[.1,4.95,.1])])}function Sf(){return vf([ef(.3,.42,1.8,6,9067056,[0,.9,0]),tf(2.3,2.8,7,2071117,[0,2.9,0]),tf(1.85,2.5,7,2402390,[0,4.3,0]),tf(1.4,2.3,7,2865250,[0,5.6,0]),tf(.8,1.6,7,3853168,[0,6.8,0])])}function Cf(){return vf([nf(.95,1,3524700,[0,.7,0],[1.1,.8,1]),nf(.7,1,3127379,[.9,.55,.2]),nf(.65,1,4183143,[-.8,.5,-.25]),nf(.12,0,16726832,[.3,1.15,-.7]),nf(.12,0,16726832,[-.4,1.05,.7])])}function wf(){let e=[ef(1.5,1.6,.12,8,5034078,[0,.06,0])],t=[16765471,16726832,16777215,10178047,16747184,16765471,16777215];for(let n=0;n<7;n++){let r=n*2.4+.5,i=.25+n%3*.38,a=Math.cos(r)*i,o=Math.sin(r)*i;e.push(ef(.03,.035,.55,4,3119690,[a,.38,o])),e.push(nf(.2,0,t[n],[a,.7,o])),e.push(nf(.09,0,16770138,[a,.78,o]))}return vf(e,.15)}function Tf(){return vf([G(.26,1.15,.26,13802076,[0,.57,-1.9]),G(.26,1.15,.26,13802076,[0,.57,1.9]),G(.26,1.15,.26,13802076,[0,.57,0]),G(.14,.16,4.1,yf,[0,.45,0]),G(.14,.16,4.1,yf,[0,.85,0])],.2)}function Ef(){return vf([G(1.15,.95,1.95,16777215,[0,1.05,0]),G(1.18,.5,.7,bf,[0,1.25,.25]),G(.6,.55,.7,16777215,[0,.7,-1.2]),G(.44,.26,.3,16754872,[0,.52,-1.52]),G(.12,.3,.12,15787720,[.24,1,-1.2],[0,0,.5]),G(.12,.3,.12,15787720,[-.24,1,-1.2],[0,0,-.5]),G(.22,.6,.22,15921906,[.4,.3,-.7]),G(.22,.6,.22,15921906,[-.4,.3,-.7]),G(.22,.6,.22,15921906,[.4,.3,.7]),G(.22,.6,.22,15921906,[-.4,.3,.7]),G(.1,.8,.1,bf,[0,.95,1.05],[.25,0,0])],.25)}function Df(){return vf([nf(1.25,0,10133677,[0,.6,0],[1.2,.75,1]),nf(.7,0,11186365,[1,.35,.5]),nf(.5,0,8817818,[-.9,.28,-.6])])}function Of(){return vf([G(6.4,4.2,8.6,14694958,[0,2.1,0]),af(7.6,2.9,9.2,5925514,[0,4.2,0]),G(7.7,.18,9.3,16777215,[0,4.22,0]),G(2.6,3,.2,11545120,[0,1.5,-4.35]),G(2.9,.22,.26,16777215,[0,3.05,-4.38]),G(.22,3.1,.26,16777215,[-1.4,1.55,-4.38]),G(.22,3.1,.26,16777215,[1.4,1.55,-4.38]),G(.2,3.5,.28,16777215,[0,1.5,-4.4],[0,0,.72]),G(.2,3.5,.28,16777215,[0,1.5,-4.4],[0,0,-.72]),G(1.3,1.3,.2,bf,[0,5.2,-4.4]),G(1.5,.16,.28,16777215,[0,5.2,-4.42])],.28)}function kf(){let e=[ef(1.7,1.8,9,10,13885424,[0,4.5,0])];for(let t=1;t<4;t++)e.push(ef(1.77,1.8,.28,10,10465480,[0,t*2.2,0]));return e.push({g:new mo(1.75,10,5,0,Math.PI*2,0,Math.PI/2),c:16726832,p:[0,9,0]}),e.push(ef(.12,.12,.9,5,bf,[0,10.9,0])),vf(e,.25)}function Af(){let e=(e,t,n)=>[ef(.92,.92,1.5,10,15975994,[e,t,n],[0,0,Math.PI/2]),ef(.95,.95,.12,10,14263584,[e-.4,t,n],[0,0,Math.PI/2]),ef(.95,.95,.12,10,14263584,[e+.4,t,n],[0,0,Math.PI/2])];return vf([...e(0,.92,-1),...e(0,.92,1),...e(0,2.5,0)],.2)}function jf(){return vf([ef(1.7,1.95,2.2,8,14238511,[0,1.1,0]),ef(1,1.7,7,8,16777215,[0,5.7,0]),ef(1.05,1.05,.25,8,14238511,[0,7,0]),tf(1.7,1.9,8,14238511,[0,10.1,0]),G(.9,1.3,.12,bf,[0,1.3,-1.9]),G(.7,.7,.12,16765471,[0,5,-1.4]),rf(.42,8,6,5913130,[0,9,-1.2])],.22)}function Mf(){let e=[];for(let t=0;t<4;t++){let n=t*Math.PI/2,r=Math.sin(n),i=Math.cos(n);e.push(G(.16,4.8,.16,yf,[-r*2.4,i*2.4,0],[0,0,n]));let a=i*.75,o=r*.75;e.push(G(1.35,3.2,.08,16777215,[-r*3+a,i*3+o,.05],[0,0,n])),e.push(G(1.35,.5,.1,16726832,[-r*4.4+a,i*4.4+o,.05],[0,0,n]))}return e.push(rf(.34,6,5,16765471,[0,0,.15])),vf(e,.1)}function Nf(){return vf([G(2.3,1.5,1.7,16734790,[0,1,0],void 0),af(2.7,.8,2,16777215,[0,1.75,0]),G(.22,.4,.22,yf,[.8,.2,-.7]),G(.22,.4,.22,yf,[-.8,.2,-.7]),G(.22,.4,.22,yf,[.8,.2,.7]),G(.22,.4,.22,yf,[-.8,.2,.7]),G(.7,.7,.1,bf,[0,1,-.88]),G(.9,.12,1.2,yf,[0,.35,-1.5],[.35,0,0]),rf(.34,7,5,16765471,[.5,.4,-2]),tf(.12,.3,4,16747008,[.5,.36,-2.35],[-Math.PI/2,0,0]),nf(.1,0,16726832,[.5,.78,-2])],.2)}function Pf(){let e=[];for(let t=0;t<9;t++){let n=t*2.1,r=.15+t%4*.2,i=1.8+t*37%10*.1,a=Math.cos(n)*r,o=Math.sin(n)*r;e.push(tf(.07,i,4,t%2?7057482:5808958,[a,i/2,o],[Math.cos(n)*.1,0,Math.sin(n)*.1])),t%3==0&&e.push(ef(.1,.1,.42,5,8014378,[a,i*.95,o]))}return vf(e,.2)}function Ff(){return vf([ef(.46,.46,3.3,7,10183986,[0,.46,0],[Math.PI/2,0,0]),ef(.4,.4,.06,7,14723184,[0,.46,1.66],[Math.PI/2,0,0]),ef(.4,.4,.06,7,14723184,[0,.46,-1.66],[Math.PI/2,0,0]),nf(.18,0,5029984,[.2,.95,.4],[1,.5,1])],.2)}function If(){return vf([ef(.6,.7,.35,7,10265523,[0,.12,0]),ef(.5,.58,.3,6,11712710,[1.5,.1,.9]),ef(.55,.62,.32,7,9278886,[-1.3,.11,1.4]),ef(.45,.5,.28,6,10989245,[.3,.1,2.5])],.2)}function Lf(){let e=[];return[[0,0,0],[1.4,0,.7],[-1.1,0,1.1],[.4,0,-1.3]].forEach((t,n)=>{e.push(ef(.55,.55,.05,8,n%2?3785834:3126108,[t[0],.1,t[2]])),n%2==0&&e.push(nf(.14,0,16747184,[t[0],.2,t[2]]))}),vf(e,.1)}function Rf(){let e=[];for(let t=0;t<16;t++)e.push(G(21,.1,1,t%2?12088894:12878410,[0,.06,-7.5+t]));for(let t=-1;t<=1;t+=2){let n=t*10.4;for(let t=0;t<9;t++)e.push(G(.36,1.4,.36,13802076,[n,.7,-8+t*2]));for(let t=0;t<8;t++)e.push(G(.08,.07,2.1,12878410,[n,.88,-7+t*2],[.26,0,0])),e.push(G(.08,.07,2.1,12878410,[n,.88,-7+t*2],[-.26,0,0]));for(let t of[-4,0,4])e.push(ef(.07,.09,2.2,5,7031338,[n*1.01,1.1,t])),e.push(rf(.2,7,5,16769162,[n*1.01,2.3,t]));e.push(G(.22,.2,16.6,15118448,[n,1.15,0])),e.push(G(.2,.18,16.6,yf,[n,.6,0])),e.push(G(.5,.2,.5,16765471,[n,1.5,-8])),e.push(G(.5,.2,.5,16765471,[n,1.5,8])),e.push(G(.5,2,16.6,7031338,[n*.985,-.6,0]))}return vf(e,.12)}function zf(){return vf([ef(10.5,13,12,8,13194026,[0,6,0]),ef(9.4,10.5,3.2,8,15237178,[0,13.6,0]),ef(8.6,9.4,5,8,14245930,[0,17.7,0]),ef(7.8,8.6,2.2,8,15769680,[0,21.3,0]),ef(5.2,6.4,3.6,7,15237178,[1.5,24.2,.5])],.3)}function Bf(){return vf([ef(.4,.46,3.6,7,3119690,[0,1.8,0]),rf(.4,7,5,3714390,[0,3.6,0]),ef(.26,.26,1.2,6,3119690,[.8,1.9,0],[0,0,Math.PI/2]),ef(.26,.28,1.4,6,3714390,[1.35,2.6,0]),rf(.27,6,4,4570466,[1.35,3.3,0]),ef(.22,.22,.9,6,3119690,[-.65,1.3,0],[0,0,Math.PI/2]),ef(.22,.24,1,6,3714390,[-1.1,1.8,0]),rf(.23,6,4,4570466,[-1.1,2.33,0]),nf(.1,0,16735370,[.1,3.95,.1])],.25)}function Vf(){return vf([nf(1.5,0,12870202,[0,.8,0],[1.2,.8,1]),nf(.9,0,14251071,[1.3,.5,.6]),nf(.7,0,11030060,[-1.2,.4,-.5])])}function Hf(){return vf([nf(4,0,12079152,[0,1.9,1.8],[1.6,.95,1.1]),G(3.6,3.3,.3,2760493,[0,1.65,-.15]),G(.45,3.8,.45,yf,[-1.9,1.9,-.5]),G(.45,3.8,.45,yf,[1.9,1.9,-.5]),G(4.8,.55,.55,13802076,[0,3.85,-.5]),G(.3,.3,4.2,8026762,[-.6,.15,-2.4]),G(.3,.3,4.2,8026762,[.6,.15,-2.4]),G(.9,.9,.12,16765471,[0,4.5,-.55])],.25)}function Uf(){let e=[G(1.7,.8,1.2,6978188,[0,.85,0]),nf(.55,0,16765471,[0,1.4,0],[1.3,.7,1])];for(let t of[-.7,.7])for(let n of[-.45,.45])e.push(ef(.3,.3,.12,8,bf,[t,.3,n],[Math.PI/2,0,0]));return vf(e,.2)}function Wf(){return vf([G(1.1,1.1,1.1,16726832,[0,.55,0]),G(1.14,.18,1.14,bf,[0,.3,0]),G(1.14,.18,1.14,bf,[0,.8,0]),G(.8,.8,.8,16734790,[.9,.4,.5],[0,.4,0])],.2)}function Gf(){return vf([{g:new mo(1,9,4,0,Math.PI*2,0,Math.PI/2),c:16777215}],.3)}function Kf(){return vf([ef(.1,.14,3.4,6,3811914,[0,1.7,0]),G(.5,.12,.5,3811914,[0,3.45,0]),tf(.42,.45,4,3811914,[0,3.95,0],[0,Math.PI/4,0]),ef(.25,.3,.2,6,3811914,[0,.1,0])],.1)}function qf(){return vf([ef(.07,.09,3,5,yf,[0,1.5,0]),G(2,.12,.12,yf,[0,2.3,0]),G(.9,1,.5,16734790,[0,2,0]),G(.9,.18,.52,16765471,[0,2.1,0]),G(.25,.8,.25,3825616,[-.5,2.05,0],[0,0,.3]),G(.25,.8,.25,3825616,[.5,2.05,0],[0,0,-.3]),rf(.36,8,6,15975994,[0,2.85,0]),ef(.62,.62,.07,8,6965802,[0,3.1,0]),ef(.3,.38,.4,8,6965802,[0,3.3,0]),G(.4,.06,.04,bf,[0,2.78,-.34]),nf(.14,0,15975994,[-1,2.2,0]),nf(.14,0,15975994,[1,2.2,0])],.2)}function Jf(){return vf([tf(1.7,2.6,9,15975994,[0,1.3,0]),ef(1.72,1.8,.35,9,14263584,[0,.18,0]),ef(1.15,1.2,.18,9,14263584,[0,1.2,0]),tf(.9,1,8,16769146,[0,2.8,0]),G(.06,1.4,.06,yf,[.1,3.4,0])],.22)}function Yf(){return vf([ef(.1,.12,2.6,6,yf,[0,1.3,0]),G(1.5,.5,.1,16765471,[.25,2.3,-.05],[0,0,.06]),G(1.3,.12,.12,bf,[.2,2.3,-.12],[0,0,.06]),G(1.2,.42,.1,16734790,[-.15,1.7,-.05],[0,0,-.08]),G(.12,.12,.12,16777215,[-.15,1.7,-.12])],.2)}function Xf(){return vf([ef(.1,.12,1,5,16777215,[0,.5,0]),ef(.105,.105,.2,5,16726832,[0,.82,0]),G(.16,.1,.04,16765471,[0,.62,-.1])],.1)}function Zf(){return vf([ef(2.6,3.4,5,7,13194026,[0,2.5,0]),ef(2.1,2.6,4,7,15237178,[0,7,0]),ef(1.6,2.1,4,7,14245930,[.2,11,.1]),ef(1.9,1.6,1.2,7,15769680,[.3,13.6,.1]),ef(.9,1.3,2.2,6,15237178,[.3,15.3,.1])],.3)}function Qf(){let e=new ho(6,2.1,6,12,Math.PI);return vf([ef(2.4,3.1,8,7,13194026,[-6,4,0]),ef(2.4,3.1,8,7,14245930,[6,4,0]),{g:e,c:15237178,p:[0,8,0],s:[1,1,1.3]},ef(1.4,1.8,2,6,15769680,[-1.5,15.5,0])],.3)}function $f(){return vf([rf(.3,8,6,16765562,[0,3.7,0])],0)}function ep(){return vf([nf(1.3,1,16777215,[0,.7,0],[1.4,.9,1]),nf(1.1,1,16777215,[1.8,.45,.2],[1.2,.8,1]),nf(1,1,16777215,[-1.8,.4,-.2],[1.2,.8,1]),nf(.9,1,16777215,[.6,1.4,.1]),nf(.8,1,16777215,[3,.2,0],[1.1,.7,1]),nf(.75,1,16777215,[-3,.15,0],[1.1,.7,1])],.18)}function tp(){let e=new hr;return e.setAttribute(`position`,new rr([0,0,-.35,1.3,0,.2,0,0,.35,0,0,-.35,0,0,.35,1.3,0,.2],3)),e.computeVertexNormals(),e}var np={value:0},rp={uGA:{value:new V(6279226)},uGB:{value:new V(5424432)},uGround:{value:new V(7330890)}};function ip(e,t){let n=new Do({vertexColors:!0});return n.onBeforeCompile=t=>{t.uniforms.uTime=np,t.vertexShader=`uniform float uTime;
`+t.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
      #ifdef USE_INSTANCING
        float ph = instanceMatrix[3].x*0.23 + instanceMatrix[3].z*0.19;
      #else
        float ph = 0.0;
      #endif
      float sw = position.y*position.y*${e.toFixed(4)};
      transformed.x += sin(uTime*1.7+ph)*sw;
      transformed.z += cos(uTime*1.3+ph*1.4)*sw*0.7;`)},n.customProgramCacheKey=()=>`b2b-sway-`+t,n}function ap(){let e=new Do({color:16777215});return e.onBeforeCompile=e=>{Object.assign(e.uniforms,rp),e.vertexShader=`attribute float aTone;
varying float vTone;
`+e.vertexShader.replace(`#include <begin_vertex>`,`#include <begin_vertex>
vTone = aTone;`),e.fragmentShader=`varying float vTone;
uniform vec3 uGA;
uniform vec3 uGB;
uniform vec3 uGround;
`+e.fragmentShader.replace(`#include <color_fragment>`,`#include <color_fragment>
      diffuseColor.rgb = mix(mix(uGA, uGB, clamp(vTone, 0.0, 1.0)), uGround, clamp(-vTone, 0.0, 1.0));`)},e.customProgramCacheKey=()=>`b2b-ground`,e}var op={meadow:[[`roundTree`,3,17,60],[`pine`,1.6,18,70],[`bush`,2,14.5,40],[`flowers`,3,13.5,35],[`cow`,1,18,50],[`rock`,.7,15,50],[`scarecrow`,.25,16,30],[`haypile`,.35,16,36],[`signpost`,.2,13.4,14.4]],barnyard:[[`barn`,.3,24,45],[`silo`,.25,27,50],[`windmill`,.22,28,55],[`hay`,1,15.5,35],[`coop`,.5,16,30],[`roundTree`,1,18,60],[`bush`,1,14.5,40],[`flowers`,.6,13.5,35],[`cow`,.7,18,50],[`rock`,.3,15,50],[`scarecrow`,.5,16,30],[`haypile`,.9,16,36],[`signpost`,.2,13.4,14.4]],creek:[[`roundTree`,1.5,17,60],[`pine`,1,18,70],[`reeds`,3,12.8,30],[`log`,1,13.5,30],[`rock`,1,15,50],[`bush`,1,14.5,40],[`flowers`,.6,13.5,35],[`signpost`,.2,13.4,14.4]],canyon:[[`mesa`,.6,48,140],[`cactus`,2.2,13.5,60],[`canRock`,2,14,60],[`mine`,.12,24,40],[`cart`,.18,15,30],[`tnt`,.35,14.5,30],[`rock`,.4,15,50],[`spire`,.9,20,70],[`arch`,.1,32,60],[`signpost`,.2,13.4,14.4]],sunset:[[`roundTree`,1.5,17,60],[`pine`,1.3,18,70],[`bush`,1.2,14.5,40],[`flowers`,1,13.5,35],[`rock`,.4,15,50],[`cow`,.4,18,50],[`scarecrow`,.2,16,30],[`haypile`,.3,16,36],[`signpost`,.2,13.4,14.4]]},sp={roundTree:[.8,1.35],pine:[.8,1.4],bush:[.8,1.5],flowers:[.8,1.4],cow:[.9,1.1],rock:[.7,1.8],barn:[1,1.15],silo:[.95,1.2],windmill:[1,1.2],hay:[.9,1.1],coop:[.9,1.1],reeds:[.9,1.5],log:[.9,1.2],mesa:[.9,1.7],cactus:[.8,1.6],canRock:[.8,2.4],mine:[1,1.2],cart:[1,1],tnt:[.9,1.2],scarecrow:[.9,1.2],haypile:[.9,1.3],signpost:[1,1],spire:[.9,1.6],arch:[1.1,1.6]},cp={roundTree:2.6,pine:2.4,bush:1.4,flowers:1.6,cow:1.6,rock:1.8,barn:5.5,silo:2.4,windmill:3,hay:2.4,coop:2,reeds:1,log:1.8,mesa:14,cactus:1.8,canRock:2,mine:5.5,cart:1.4,tnt:1.2,scarecrow:1.2,haypile:2,signpost:1,spire:3.2,arch:12},lp=new Set([`barn`,`windmill`,`coop`,`mine`,`cart`,`arch`,`signpost`]),up=[{sunEl:.5,sunSize:.05,sunInt:3,hemiSky:12575743,hemiGround:8376154,hemiInt:1.2,hill:6737733,cloud:16777215},{sunEl:.45,sunSize:.05,sunInt:3,hemiSky:13166847,hemiGround:8836191,hemiInt:1.2,hill:8116567,cloud:16777215},{sunEl:.55,sunSize:.05,sunInt:3,hemiSky:12116223,hemiGround:5227130,hemiInt:1.2,hill:4765818,cloud:16056319},{sunEl:.34,sunSize:.065,sunInt:3.2,hemiSky:16769208,hemiGround:14719066,hemiInt:1.1,hill:14191178,cloud:16773336},{sunEl:.12,sunSize:.14,sunInt:3.4,hemiSky:16755082,hemiGround:9071280,hemiInt:1.05,hill:8085429,cloud:16756904}],dp=new Set(`roundTree.pine.bush.fence.cow.rock.barn.silo.hay.coop.log.bridge.cactus.canRock.mine.cart.tnt.scarecrow.haypile.signpost.marker.spire.arch.lantern.windmill.sails`.split(`.`)),fp=new Rt().makeScale(0,0,0);function pp(){let e=[];for(let t of[-1,1]){let n=t*qd;e.push(G(2.1,1,2.1,bf,[n,.5,0])),e.push(G(1.3,9.6,1.3,16777215,[n,5,0]));for(let t=0;t<4;t++)e.push(G(1.42,1.2,1.42,bf,[n,1.6+t*2.4,0]));e.push(G(1.7,.5,1.7,bf,[n,9.85,0])),e.push(rf(.5,8,6,16770138,[n,10.6,0]))}e.push(G(27,4.6,1.3,16777215,[0,9.7,0])),e.push(G(27.6,.3,1.6,bf,[0,12.1,0])),e.push(G(27.6,.3,1.6,bf,[0,7.4,0]));for(let t=0;t<26;t++)t%2==0?e.push(G(1,.45,1.64,bf,[-12.5+t,7.15,0])):e.push(G(1,.45,1.64,16777215,[-12.5+t,7.15,0]));return vf(e,.1)}function mp(e,t,n,r,i){let a=e.getContext(`2d`);if(!a)return;let o=e.width,s=e.height,c=`#`+i.toString(16).padStart(6,`0`);a.clearRect(0,0,o,s),a.fillStyle=`#1b1b3a`,a.fillRect(0,0,o,s);let l=a.createLinearGradient(0,0,0,s);l.addColorStop(0,c),l.addColorStop(1,`#fff6d8`),a.fillStyle=l,a.fillRect(14,14,o-28,s-28),a.fillStyle=`rgba(255,255,255,0.35)`,a.fillRect(14,14,o-28,34),a.textAlign=`center`,a.textBaseline=`middle`,a.lineJoin=`round`,a.font=`900 38px "Arial Black", Impact, sans-serif`,a.lineWidth=8,a.strokeStyle=`#1b1b3a`,a.fillStyle=`#ffffff`,a.strokeText(r.toUpperCase(),o/2,40),a.fillText(r.toUpperCase(),o/2,40);let u=128,d=n.toUpperCase();do a.font=`900 ${u}px "Arial Black", Impact, sans-serif`,u-=6;while(a.measureText(d).width>o-100&&u>40);a.lineWidth=18,a.strokeStyle=`#1b1b3a`,a.strokeText(d,o/2,s/2+34),a.fillStyle=`#ffffff`,a.fillText(d,o/2,s/2+34),t.needsUpdate=!0}function hp(){let e=document.createElement(`canvas`);e.width=340,e.height=40;let t=e.getContext(`2d`);if(t)for(let e=0;e<2;e++)for(let n=0;n<17;n++)t.fillStyle=(e+n)%2?`#1b1b3a`:`#ffffff`,t.fillRect(n*20,e*20,20,20);let n=new Ri(e);n.colorSpace=Be,n.magFilter=r;let i=new Do({map:n,polygonOffset:!0,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),a=new H(new lo(20.4,2.4),i);a.rotation.x=-Math.PI/2;let o=new H;return o.add(a),a.position.y=.075,o}function gp(){let t=document.createElement(`canvas`);t.width=128,t.height=128;let n=t.getContext(`2d`);if(n){n.fillStyle=`#d8f0ff`,n.fillRect(0,0,128,128),n.strokeStyle=`rgba(255,255,255,0.9)`,n.lineWidth=3,n.lineCap=`round`;for(let e=0;e<9;e++){let t=12+e*53%100,r=e*29%128;n.beginPath(),n.moveTo(t,r),n.quadraticCurveTo(t+8,r+10,t,r+20),n.stroke()}n.strokeStyle=`rgba(120,190,240,0.7)`;for(let e=0;e<7;e++){let t=20+e*41%90,r=(e*47+20)%128;n.beginPath(),n.moveTo(t,r),n.quadraticCurveTo(t-6,r+9,t,r+18),n.stroke()}for(let e of[0,1]){let t=n.createLinearGradient(e?128:0,0,e?108:20,0);t.addColorStop(0,`rgba(255,255,255,1)`),t.addColorStop(1,`rgba(255,255,255,0)`),n.fillStyle=t,n.fillRect(e?108:0,0,20,128)}}let r=new Ri(t);return r.colorSpace=Be,r.wrapS=r.wrapT=e,r.anisotropy=4,r}var _p=`
varying vec3 vDir;
void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,vp=`
varying vec3 vDir;
uniform vec3 uZen; uniform vec3 uHor; uniform vec3 uSunDir; uniform vec3 uSunCol;
uniform float uSunSize; uniform float uNight; uniform float uTime;
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float hn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  float a = hash(i), b = hash(i+vec2(1.0,0.0)), c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }
void main(){
  vec3 d = normalize(vDir);
  float h = d.y;
  float t = clamp(h, 0.0, 1.0);
  vec3 col = mix(uHor, uZen, pow(t, 0.6));
  col += uHor * 0.10 * exp(-max(h, 0.0) * 9.0) * (1.0 - uNight * 0.8);
  col = mix(col, uHor, smoothstep(0.0, -0.25, h));
  if (h > 0.01) {
    vec2 cp = d.xz / (h + 0.18) * 0.9 + vec2(uTime * 0.012, 0.0);
    float n = hn(cp * 1.3) * 0.55 + hn(cp * 2.9) * 0.3 + hn(cp * 6.1) * 0.15;
    float cl = smoothstep(0.52, 0.78, n) * smoothstep(0.01, 0.2, h);
    float cl2 = smoothstep(0.58, 0.85, hn(cp * 0.8 + 7.0) * 0.7 + hn(cp * 3.7) * 0.3) * smoothstep(0.03, 0.4, h);
    vec3 ccol = mix(uHor, vec3(1.0), 0.75);
    col = mix(col, ccol, cl * 0.5 * (1.0 - uNight * 0.85));
    col = mix(col, mix(ccol, uZen, 0.2), cl2 * 0.3 * (1.0 - uNight * 0.85));
  }
  float sd = dot(d, normalize(uSunDir));
  float ang = acos(clamp(sd, -1.0, 1.0));
  float disc = 1.0 - smoothstep(uSunSize*0.86, uSunSize, ang);
  float halo = exp(-ang*ang/(uSunSize*uSunSize*30.0))*0.55 + exp(-ang*4.0)*0.18;
  col += uSunCol * halo * (1.0 - uNight*0.7);
  col = mix(col, vec3(1.0, 0.98, 0.9), disc * (1.0 - uNight*0.2));
  // stars
  if (uNight > 0.01 && h > 0.0) {
    vec2 sp = floor(d.xz / (0.02 + h*0.03) * 3.0 + d.y*40.0);
    float s = step(0.992, hash(sp));
    col += vec3(s) * uNight * smoothstep(0.0, 0.3, h) * (0.6 + 0.4*sin(uTime*3.0 + hash(sp)*30.0));
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,yp=`
uniform float uScale; uniform float uTime;
attribute float aPh;
varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.55 + 0.45*sin(uTime*2.6 + aPh*20.0);
  vA = tw;
  gl_PointSize = max(2.0, 0.34 * uScale / max(1.0, -mv.z)) * (0.8 + 0.4*tw);
}`,bp=`
uniform float uAmt; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float r = length(c);
  float a = smoothstep(0.5, 0.0, r);
  gl_FragColor = vec4(vec3(1.0, 0.86, 0.35) * (0.7 + vA*0.6), a*a*uAmt*vA);
  #include <colorspace_fragment>
}`,xp=`
uniform float uScale; uniform float uTime;
attribute float aPh; varying float vA;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  vA = 0.55 + 0.45 * sin(uTime * 2.0 + aPh * 30.0);
  gl_PointSize = max(2.0, (0.1 + aPh * 0.1) * uScale / max(1.0, -mv.z));
}`,Sp=`
uniform vec3 uCol; uniform float uAmt; varying float vA;
void main(){
  vec2 c = gl_PointCoord - 0.5; float r = length(c) * 2.0;
  float a = (1.0 - smoothstep(0.55, 1.0, r)) * uAmt * vA;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uCol, a);
}`,Cp=`
varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,wp=`
varying vec2 vUv; uniform vec3 uCol; uniform float uAmt;
void main(){
  float a = pow(1.0 - vUv.y, 1.4) * smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * smoothstep(0.0, 0.08, vUv.y) * uAmt;
  gl_FragColor = vec4(uCol * a, a);
}`;function Tp(){let e=document.createElement(`canvas`);e.width=e.height=128;let t=e.getContext(`2d`);if(t){let e=t.createRadialGradient(64,64,0,64,64,64);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.18,`rgba(255,255,255,0.55)`),e.addColorStop(.5,`rgba(255,255,255,0.12)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.fillRect(0,0,128,128)}let n=new Ri(e);return n.colorSpace=Be,n}function Ep(e,t){let n=new B;n.name=`back2back-world`,e.add(n);let r=[],i=-1,a=0,o=0,s=0,c=new bn(13496575,70,285);e.fog=c;let l=new Xo(12575743,8376154,1.2),u=new ds(16774084,3);n.add(l,u,u.target),u.castShadow=!0,u.shadow.mapSize.set(2048,2048);let d=u.shadow.camera;d.left=-26,d.right=26,d.top=26,d.bottom=-26,d.near=40,d.far=180,u.shadow.bias=-4e-4,u.shadow.normalBias=.06,u.shadow.radius=2.5,d.updateProjectionMatrix();let f=new z,p=new z,m=new z,h={uZen:{value:new V(5224703)},uHor:{value:new V(13496575)},uSunDir:{value:new z(.4,.5,-.9)},uSunCol:{value:new V(16774084)},uSunSize:{value:.05},uNight:{value:0},uTime:np},g=new H(new mo(150,24,14),new wo({uniforms:h,vertexShader:_p,fragmentShader:vp,side:1,depthTest:!1,depthWrite:!1,fog:!1}));g.frustumCulled=!1,g.renderOrder=-10,n.add(g);let _=new Do({vertexColors:!0}),v=ip(.0045,`big`),y=ip(.016,`small`),b=new Do({vertexColors:!0,color:6737733}),x=new Kr({vertexColors:!0}),S=ap(),C=new Do({vertexColors:!0,color:5593712,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),w=new Do({vertexColors:!0,polygonOffset:!0,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),T=gp(),E=new Do({map:T,color:3844336,emissive:801382,side:2,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2});E.onBeforeCompile=e=>{e.uniforms.uTime=np,e.fragmentShader=`uniform float uTime;
`+e.fragmentShader.replace(`#include <map_fragment>`,`#include <map_fragment>
      vec2 sq = floor(vMapUv * vec2(26.0, 40.0));
      float shn = fract(sin(dot(sq + floor(uTime * 2.5), vec2(12.9898, 78.233))) * 43758.5453);
      float spk = step(0.972, shn) * (0.5 + 0.5 * sin(uTime * 9.0 + shn * 40.0));
      float edgeD = min(vMapUv.x, 1.0 - vMapUv.x) + 0.025 * sin(vMapUv.y * 34.0 + uTime * 2.2) + 0.012 * sin(vMapUv.y * 71.0 - uTime * 3.0);
      float fm = smoothstep(0.075, 0.03, edgeD);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), fm * 0.85) + vec3(spk * 0.9);`)},E.customProgramCacheKey=()=>`b2b-water`;let D=new Do({vertexColors:!0,emissive:10135744,emissiveIntensity:.9}),ee=new Do({vertexColors:!0,emissive:10135744,emissiveIntensity:.9,transparent:!0,opacity:.55,depthWrite:!1}),te=new Kr({color:16777215,transparent:!0,opacity:0,depthWrite:!1,blending:2,fog:!1}),O=new Do({vertexColors:!0,color:2829130,side:2}),ne=new Do({vertexColors:!0}),k={},A=(e,t,r,i,a=!1)=>{let o=new hi(t,r,i*Hd);o.instanceMatrix.setUsage(Ke),o.frustumCulled=!1;for(let e=0;e<i*Hd;e++)o.setMatrixAt(e,fp);if(a){of.setRGB(1,1,1);for(let e=0;e<i*Hd;e++)o.setColorAt(e,of)}o.name=e,o.castShadow=dp.has(e),n.add(o),k[e]={mesh:o,cap:i,tint:a}};A(`roundTree`,xf(),v,10,!0),A(`pine`,Sf(),v,8,!0),A(`bush`,Cf(),y,9,!0),A(`flowers`,wf(),y,9,!0),A(`fence`,Tf(),_,34),A(`cow`,Ef(),_,3),A(`rock`,Df(),_,7),A(`barn`,Of(),_,1),A(`silo`,kf(),_,1),A(`windmill`,jf(),_,1),A(`hay`,Af(),_,4),A(`coop`,Nf(),_,3),A(`reeds`,Pf(),y,12),A(`log`,Ff(),_,4),A(`stones`,If(),_,6),A(`lilies`,Lf(),_,5),A(`bridge`,Rf(),_,1),A(`mesa`,zf(),_,4),A(`cactus`,Bf(),_,9),A(`canRock`,Vf(),_,7),A(`mine`,Hf(),_,1),A(`cart`,Uf(),_,2),A(`tnt`,Wf(),_,4),A(`hill`,Gf(),b,8),A(`lantern`,Kf(),_,10),A(`lamp`,$f(),x,10),A(`scarecrow`,qf(),_,2),A(`haypile`,Jf(),_,3),A(`signpost`,Yf(),_,2),A(`marker`,Xf(),_,2),A(`spire`,Zf(),_,4),A(`arch`,Qf(),_,1),A(`sails`,Mf(),_,1);let j=k.sails.mesh,re=[],M=[-240,-150,-110,-85,-65,-49,-37,-25,-13,-10],ie=[10,13,25,37,49,65,85,110,150,240],ae=1080,oe=new Uint16Array(420);for(let e=0;e<70;e++)oe.set([e*4,e*4+1,e*4+2,e*4+1,e*4+3,e*4+2],e*6);let se=new Float32Array(840);for(let e=0;e<70;e++){let t=16777215;e>=30&&(t=(e-30)%2?16777215:16726832),of.setHex(t);for(let t=0;t<4;t++)se.set([of.r,of.g,of.b],(e*4+t)*3)}let ce=new Uint16Array(60);for(let e=0;e<Bd;e++)ce.set([e*4,e*4+1,e*4+2,e*4+1,e*4+3,e*4+2],e*6);let le=new Uint16Array([0,1,2,1,3,2,4,5,6,5,7,6]),ue=e=>{let t=new Float32Array(e*3);for(let n=0;n<e;n++)t[n*3+1]=1;return t};for(let e=0;e<Hd;e++){let e=new Float32Array(ae*3),t=new Float32Array(ae),r=new hr;r.setAttribute(`position`,new er(e,3).setUsage(Ke)),r.setAttribute(`normal`,new er(ue(ae),3)),r.setAttribute(`aTone`,new er(t,1).setUsage(Ke));let i=new H(r,S),a=new Float32Array(120),o=new Float32Array(120),s=new hr;s.setAttribute(`position`,new er(a,3).setUsage(Ke)),s.setAttribute(`normal`,new er(ue(40),3)),s.setAttribute(`color`,new er(o,3).setUsage(Ke)),s.setIndex(new er(ce,1));let c=new H(s,C),l=new Float32Array(840),u=new hr;u.setAttribute(`position`,new er(l,3).setUsage(Ke)),u.setAttribute(`normal`,new er(ue(280),3)),u.setAttribute(`color`,new er(se,3)),u.setIndex(new er(oe,1));let d=new H(u,w),f=new Float32Array(24),p=new Float32Array(16),m=new hr;m.setAttribute(`position`,new er(f,3).setUsage(Ke)),m.setAttribute(`normal`,new er(ue(8),3)),m.setAttribute(`uv`,new er(p,2).setUsage(Ke)),m.setIndex(new er(le,1));let h=new H(m,E);h.visible=!1,i.receiveShadow=!0,c.receiveShadow=!0,d.receiveShadow=!0;for(let e of[i,c,d,h])e.frustumCulled=!1,n.add(e);re.push({k:-999999,ground:i,road:c,decor:d,water:h,gPos:e,gTone:t,rPos:a,rCol:o,dPos:l,wPos:f,hasWm:!1,wm:new Rt})}let N=(e,t,n,r,i,a,o)=>{let s=ld(i),c=ld(a),l=t*12;e[l]=s+n,e[l+1]=o,e[l+2]=-i,e[l+3]=s+r,e[l+4]=o,e[l+5]=-i,e[l+6]=c+n,e[l+7]=o,e[l+8]=-a,e[l+9]=c+r,e[l+10]=o,e[l+11]=-a},de=new Float64Array(11);function fe(e,t){let n=t*zd;for(let e=0;e<=Bd;e++)de[e]=ld(n+e*Vd);let r=e.gPos,i=e.gTone,a=0,o=0;for(let e=0;e<Bd;e++){let s=t*Bd+e,c=-(n+e*Vd),l=-(n+(e+1)*Vd),u=de[e],d=de[e+1];for(let e=0;e<2;e++){let t=e?ie:M;for(let n=0;n<9;n++){let f=t[n],p=t[n+1],m=e?n:8-n,h=s+m&1,g=h,_=h;if(m===0){let t=s+1&1;e?(g=-1,_=t):(g=t,_=-1)}let v=[u+f,u+p,d+f,u+p,d+p,d+f],y=[c,c,l,c,l,l],b=[g,_,g,_,_,g];for(let e=0;e<6;e++)r[a++]=v[e],r[a++]=0,r[a++]=y[e],i[o++]=b[e]}}}e.ground.geometry.getAttribute(`position`).needsUpdate=!0,e.ground.geometry.getAttribute(`aTone`).needsUpdate=!0;for(let r=0;r<Bd;r++){N(e.rPos,r,-10,10,n+r*Vd,n+(r+1)*Vd,.03);let i=t*Bd+r&1?1:.94;for(let t=0;t<4;t++)e.rCol.set([i,i,i],(r*4+t)*3)}e.road.geometry.getAttribute(`position`).needsUpdate=!0,e.road.geometry.getAttribute(`color`).needsUpdate=!0;let s=0;for(let t=0;t<10;t++)N(e.dPos,s++,-.22,.22,n+t*Vd,n+t*Vd+3,.05);for(let t=0;t<10;t++)N(e.dPos,s++,-9.55,-9.25,n+t*Vd,n+(t+1)*Vd,.05),N(e.dPos,s++,9.25,9.55,n+t*Vd,n+(t+1)*Vd,.05);for(let t=0;t<20;t++)N(e.dPos,s++,-11.3,-10,n+t*3,n+t*3+3,.07);for(let t=0;t<20;t++)N(e.dPos,s++,10,11.3,n+t*3,n+t*3+3,.07);e.decor.geometry.getAttribute(`position`).needsUpdate=!0}let pe={},me=[],he=[],ge=[],_e=new V;function ve(e,t,n,r,i,a,o,s=0,c){let l=k[e],u=pe[e]??0;if(u>=l.cap)return;pe[e]=u+1;let d=t*l.cap+u;if(pf.set(ld(n)+r,s,-n),cf.setFromAxisAngle(_f,i),sf.compose(pf,cf,df.set(a,o,a)),l.mesh.setMatrixAt(d,sf),l.tint){let e=.82+.3*W(Math.round(n*10),Math.round(r*10),77);c===`sunset`?_e.setRGB(e*1,e*.9,e*1.05):c===`canyon`?_e.setRGB(e*1.1,e*.95,e*.7):_e.setRGB(e,e,e),l.mesh.setColorAt(d,_e)}if(e===`windmill`){let e=re[t];e.hasWm=!0,e.wm.copy(sf)}}let ye=new z;function be(e,t,n){let r=n*zd;for(let e in pe)pe[e]=0;e.hasWm=!1,me.length=0,he.length=0,ge.length=0;let i=-1,a=r+18+W(n,700,1)*24;if(Qd(a-10)===`creek`&&Qd(a+10)===`creek`&&W(n,701,2)<.55){let e=Math.round(a/ed)*ed;Math.abs(a-e)>24&&(i=a)}if(i>=0){let r=pd(i),a=Math.cos(r),o=Math.sin(r),s=ld(i),c=0,l=e.water.geometry.getAttribute(`uv`),u=0;for(let t of[-1,1]){let n=t*10.2,r=t*175;for(let[t,d]of[[n,-8],[r,-8],[n,8],[r,8]])ye.set(s+t*a+d*o,.06,-i-t*o+d*a),e.wPos[c++]=ye.x,e.wPos[c++]=ye.y,e.wPos[c++]=ye.z,l.setXY(u++,(d+8)/16,t/8)}l.needsUpdate=!0,e.water.geometry.getAttribute(`position`).needsUpdate=!0,e.water.visible=!0,ve(`bridge`,t,i,0,r,1,1);for(let e=0;e<8;e++){let r=e%2?1:-1,a=(8.7+W(n,710+e,3)*1.2)*(W(n,720+e,4)<.5?-1:1);ve(`reeds`,t,i+a,r*(11.2+W(n,730+e,5)*22),W(n,740+e,6)*6.28,1,1)}for(let e=0;e<5;e++){let r=e%2?1:-1;ve(`stones`,t,i+(W(n,750+e,7)-.5)*9,r*(13+W(n,760+e,8)*18),W(n,770+e,9)*6.28,1,1,.05),ve(`lilies`,t,i+(W(n,780+e,7)-.5)*10,-r*(12.5+W(n,790+e,8)*25),W(n,800+e,9)*6.28,1,1,.06)}}else e.water.visible=!1;for(let e=0;e<2;e++){let a=e?1:-1,o=Qd(r+30),s=o===`meadow`?.55:o===`barnyard`?.7:0;if(W(n,900+e,1)<s)for(let o=0;o<15;o++){let s=r+o*4+2,c=Qd(s);c!==`meadow`&&c!==`barnyard`||i>=0&&Math.abs(s-i)<10||W(n,910+e*20+o,2)<.05||ve(`fence`,t,s,a*Kd,pd(s),1,1)}}for(let e=0;e<5;e++){let n=r+e*12+6;if(Qd(n)===`sunset`)for(let e of[-1,1])ve(`lantern`,t,n,e*13.2,0,1,1),ve(`lamp`,t,n,e*13.2,0,1,1)}for(let e=0;e<2;e++)ve(`marker`,t,r+10+e*30,(n+e&1?1:-1)*12.3,0,1,1);for(let e=0;e<2;e++){let i=e?1:-1;for(let a=0;a<3;a++){let o=r+(a+W(n,1e3+e*4+a,1))/3*zd,s=Qd(o);if(s===`canyon`)continue;let c=(s===`sunset`?40:26)+W(n,1010+e*4+a,2)*40,l=(s===`sunset`?18:s===`creek`?12:8)+W(n,1020+e*4+a,3)*(s===`sunset`?26:16),u=i*(80+W(n,1030+e*4+a,4)*130);ve(`hill`,t,o,u,W(n,1040+e*4+a,5)*6.28,c,l,-l*.04);let d=k.hill,f=t*d.cap+(pe.hill-1);pf.set(ld(o)+u,-l*.04,-o),cf.setFromAxisAngle(_f,W(n,1040+e*4+a,5)*6.28),sf.compose(pf,cf,df.set(c,l,c)),d.mesh.setMatrixAt(f,sf)}}for(let e=0;e<2;e++){let a=e?1:-1;for(let o=0;o<Gd;o++){let s=o*2+e,c=r+(o+W(n,s,1))/Gd*zd;if(W(n,s,2)<.1||i>=0&&Math.abs(c-i)<10)continue;let l=Qd(c),u=op[l],d=0;for(let e of u)d+=e[1];let f=W(n,s,3)*d,p=u[0];for(let e of u)if(f-=e[1],f<=0){p=e;break}let m=p[0];if((pe[m]??0)>=k[m].cap)continue;let h=a*(p[2]+W(n,s,4)*(p[3]-p[2])),g=sp[m]??[1,1],_=Xd(g[0],g[1],W(n,s,5)),v=(cp[m]??1.5)*_;if(v>2.4){let e=!1;for(let t=0;t<me.length;t++){let n=me[t]-(ld(c)+h),r=he[t]-c;if(n*n+r*r<(ge[t]+v)*(ge[t]+v)){e=!0;break}}if(e)continue;me.push(ld(c)+h),he.push(c),ge.push(v)}let y=W(n,s,6)*Math.PI*2;lp.has(m)&&(y=pd(c)+(a<0?-Math.PI/2:Math.PI/2)+(W(n,s,7)-.5)*.25),ve(m,t,c,h,y,_,_,0,l)}}for(let e in k){let n=k[e],r=pe[e]??0;for(let e=r;e<n.cap;e++)n.mesh.setMatrixAt(t*n.cap+e,fp);n.mesh.instanceMatrix.needsUpdate=!0,n.mesh.instanceColor&&(n.mesh.instanceColor.needsUpdate=!0)}e.hasWm||j.setMatrixAt(t,fp)}function xe(e,t){let n=re[e];n.k=t,fe(n,t),be(n,e,t)}let Se=pp(),Ce=new lo(16,4),we=[];for(let e=0;e<3;e++){let e=document.createElement(`canvas`);e.width=1024,e.height=256;let t=new Ri(e);t.colorSpace=Be,t.anisotropy=4;let r=new Do({vertexColors:!0,color:16765471}),i=new B,a=new H(Se,r),o=new Kr({map:t}),s=new H(Ce,o);s.position.set(0,9.7,.72);let c=new H(Ce,o);c.position.set(0,9.7,-.72),c.rotation.y=Math.PI,i.add(a,s,c),i.visible=!1,n.add(i),we.push({group:i,mat:r,cv:e,tex:t,g:-1})}let Te=hp();Te.position.set(ld(0),0,0),Te.rotation.y=pd(0),n.add(Te);let Ee=new hi(ep(),D,9);Ee.instanceMatrix.setUsage(Ke),Ee.frustumCulled=!1,n.add(Ee);let De=new hi(ep(),ee,7);De.instanceMatrix.setUsage(Ke),De.frustumCulled=!1,De.renderOrder=-8,n.add(De);let Oe=new hi(Ef(),_,7);Oe.instanceMatrix.setUsage(Ke),Oe.frustumCulled=!1,Oe.castShadow=!0,n.add(Oe);let ke=new zr(new Tr({map:Tp(),color:16774084,transparent:!0,depthWrite:!1,depthTest:!1,blending:2,fog:!1,opacity:.6}));ke.renderOrder=-9,ke.frustumCulled=!1,n.add(ke);let Ae=new lo(1,1);Ae.translate(0,.5,0);let je=[];for(let e=0;e<4;e++){let e={uCol:{value:new V(16774084)},uAmt:{value:0}},t=new H(Ae,new wo({uniforms:e,vertexShader:Cp,fragmentShader:wp,transparent:!0,depthWrite:!1,blending:2,side:2,fog:!1}));t.frustumCulled=!1,t.renderOrder=6,n.add(t),je.push({mesh:t,u:e})}let Me=new lo(1,1);Me.rotateX(-Math.PI/2);let Ne=new hi(Me,te,24);Ne.instanceMatrix.setUsage(Ke),Ne.frustumCulled=!1,n.add(Ne);let Pe=new Float32Array(560);for(let e=0;e<140;e++)Pe[e*4]=W(e,1,66),Pe[e*4+1]=W(e,2,66),Pe[e*4+2]=W(e,3,66),Pe[e*4+3]=W(e,4,66);let P=new Float32Array(420),Fe=new Float32Array(140);for(let e=0;e<140;e++)Fe[e]=Pe[e*4+3];let Ie=new hr;Ie.setAttribute(`position`,new er(P,3).setUsage(Ke)),Ie.setAttribute(`aPh`,new er(Fe,1));let Le={uScale:{value:600},uTime:np,uCol:{value:new V(16774048)},uAmt:{value:.8}},F=new Fi(Ie,new wo({uniforms:Le,vertexShader:xp,fragmentShader:Sp,transparent:!0,depthWrite:!1,fog:!1}));F.frustumCulled=!1,n.add(F);let Re={meadow:16774824,barnyard:15781744,creek:14219007,canyon:15245414,sunset:16751300},ze={meadow:.15,barnyard:.3,creek:-.2,canyon:.6,sunset:.7},Ve=new V,He=.2,Ue=new hi(new mo(.28,6,5),O,5),We=new hi(tp(),O,5),Ge=new hi(tp(),O,5);for(let e of[Ue,We,Ge])e.instanceMatrix.setUsage(Ke),e.frustumCulled=!1,n.add(e);Ue.scale.set(1,1,1);let qe=new hi(vf([nf(.85,1,12092990,[0,.85,0]),nf(.55,0,13804632,[.2,.85,.1])],.1),ne,4);qe.instanceMatrix.setUsage(Ke),qe.frustumCulled=!1,n.add(qe);let Je=new Float32Array(360);for(let e=0;e<90;e++)Je[e*4]=W(e,1,55)<.5?-1:1,Je[e*4+1]=12+W(e,2,55)*26,Je[e*4+2]=W(e,3,55),Je[e*4+3]=W(e,4,55);let Ye=new Float32Array(270),Xe=new Float32Array(90);for(let e=0;e<90;e++)Xe[e]=Je[e*4+3];let Ze=new hr;Ze.setAttribute(`position`,new er(Ye,3).setUsage(Ke)),Ze.setAttribute(`aPh`,new er(Xe,1));let Qe={uScale:{value:600},uTime:np,uAmt:{value:0}},$e=new Fi(Ze,new wo({uniforms:Qe,vertexShader:yp,fragmentShader:bp,transparent:!0,depthWrite:!1,blending:2,fog:!1}));$e.frustumCulled=!1,$e.visible=!1,n.add($e);let et=new V,tt=new V,I={zen:new V,hor:new V,fog:new V,gA:new V,gB:new V,ground:new V,road:new V,sun:new V,hemiSky:new V,hemiGround:new V,hill:new V,cloud:new V},nt=new V(658986),rt=new V(1910098),it=new V(6978760),at=new V(16777215),ot=(e,t,n,r)=>e.copy(et.setHex(t)).lerp(tt.setHex(n),r),st=0,ct=new z,lt=new z;function ut(e){let n=Math.round(e/ed),r=n<=0?1:Yd((e-n*ed+75)/150),i=Math.max(0,n-1),o=Math.max(0,n),s=$d(i),d=$d(o),f=up[Zd(i,hd.length)],p=up[Zd(o,hd.length)];ot(I.zen,s.sky[0],d.sky[0],r),ot(I.fog,s.fog,d.fog,r),I.hor.copy(I.fog),ot(I.gA,s.grass[0],d.grass[0],r),ot(I.gB,s.grass[1],d.grass[1],r),ot(I.ground,s.ground,d.ground,r),ot(I.road,s.road,d.road,r),ot(I.sun,s.sun,d.sun,r),ot(I.hemiSky,f.hemiSky,p.hemiSky,r),ot(I.hemiGround,f.hemiGround,p.hemiGround,r),ot(I.hill,f.hill,p.hill,r),ot(I.cloud,f.cloud,p.cloud,r);let m=Xd(f.sunEl,p.sunEl,r),g=Xd(f.sunSize,p.sunSize,r),_=Xd(f.sunInt,p.sunInt,r),v=Xd(f.hemiInt,p.hemiInt,r);st=(s.kind===`sunset`?1-r:0)+(d.kind===`sunset`?r:0),a>.001&&(I.zen.lerp(nt,a),I.hor.lerp(rt,a),I.fog.lerp(rt,a),I.sun.lerp(it,a),I.hemiSky.lerp(nt,a*.7),I.hemiGround.lerp(nt,a*.6),I.gA.multiplyScalar(1-a*.55),I.gB.multiplyScalar(1-a*.55),I.ground.multiplyScalar(1-a*.55),I.road.multiplyScalar(1-a*.4),I.hill.multiplyScalar(1-a*.55),I.cloud.lerp(rt,a*.8),_*=1-a*.8,v*=1-a*.45),h.uZen.value.copy(I.zen),h.uHor.value.copy(I.hor),h.uSunCol.value.copy(I.sun),h.uSunSize.value=g,h.uNight.value=a;let y=Math.sqrt(Math.max(0,1-m*m));ct.set(.4*y,m,-.92*y),h.uSunDir.value.copy(ct),ke.position.copy(ct).multiplyScalar(140),ke.scale.setScalar(70+g*600),ke.material.color.copy(I.sun),ke.material.opacity=.55*(1-a*.7),c.color.copy(I.fog),c.near=Xd(70,40,a),c.far=Xd(285,210,a),t.setClearColor(I.fog),l.color.copy(I.hemiSky),l.groundColor.copy(I.hemiGround),l.intensity=v,u.color.copy(I.sun),u.intensity=_;let S=Math.max(m,.42),w=Math.sqrt(1-S*S);lt.set(-.45*w,S,.75*w),rp.uGA.value.copy(I.gA),rp.uGB.value.copy(I.gB),rp.uGround.value.copy(I.ground),C.color.copy(I.road),b.color.copy(I.hill),D.color.copy(at).lerp(I.cloud,1),D.emissive.copy(I.cloud).multiplyScalar(.55),E.color.setHex(3844336).lerp(I.fog,.12).multiplyScalar(1-a*.55),E.emissive.setHex(801382).multiplyScalar(1-a*.6),x.color.setHex(16777215).multiplyScalar(1+a*.6)}let L=new fn;function dt(e,n){let r=!1;for(let e=0;e<Hd;e++){let t=re[e];t.hasWm&&(ff.makeTranslation(0,9,-1.6),sf.copy(t.wm).multiply(ff),ff.makeRotationZ(n*1.1+e),sf.multiply(ff),j.setMatrixAt(e,sf),r=!0)}r&&(j.instanceMatrix.needsUpdate=!0);let i=e-80;for(let e=0;e<9;e++){let t=i+Zd(e*41+W(e,1,31)*30-i,360),r=Zd((W(e,2,31)-.5)*360+n*1.3+180,360)-180,a=Yd((190-Math.abs(r))/45),o=(14+W(e,3,31)*14)*a;L.position.set(ld(t)+r,75+W(e,4,31)*40,-t),L.rotation.set(0,W(e,5,31)*.6,0),L.scale.set(o,o*.9,o),L.updateMatrix(),Ee.setMatrixAt(e,L.matrix)}Ee.instanceMatrix.needsUpdate=!0;let o=Math.ceil((e-20-14*n)/80);for(let e=0;e<5;e++){let t=o+e,r=t*80+14*n,i=(W(t,1,41)-.5)*90+Math.sin(n*.5+t)*6,a=15+W(t,2,41)*14+Math.sin(n*1.2+t*2)*.8,s=Math.sin(n*9+t*1.7)*.7,c=pd(r)+Math.cos(n*.5+t)*.25;L.position.set(ld(r)+i,a,-r),L.rotation.set(0,c,0),L.scale.set(1.3,1.3,1.3),L.updateMatrix(),Ue.setMatrixAt(e,L.matrix),sf.copy(L.matrix),mf.makeRotationZ(s).multiply(hf.makeScale(-1,1,1)),We.setMatrixAt(e,gf.copy(sf).multiply(mf)),ff.makeRotationZ(-s),Ge.setMatrixAt(e,sf.multiply(ff))}Ue.instanceMatrix.needsUpdate=!0,We.instanceMatrix.needsUpdate=!0,Ge.instanceMatrix.needsUpdate=!0;let c=Math.ceil((e-30+4*n)/90);for(let e=0;e<4;e++){let t=c+e,r=t*90-4*n,i=+(Qd(r)===`canyon`),a=(W(t,1,51)<.5?-1:1)*(13.5+W(t,2,51)*14),o=Math.abs(Math.sin(n*5+t*3))*.5;L.position.set(ld(r)+a,o,-r),L.rotation.set(r/.9,0,0),L.scale.setScalar(i*(.7+W(t,3,51)*.5)),L.updateMatrix(),qe.setMatrixAt(e,L.matrix)}qe.instanceMatrix.needsUpdate=!0;let l=Math.max(st,a*.9);if(l>.02){$e.visible=!0,Qe.uAmt.value=l;let r=e-40;for(let e=0;e<90;e++){let t=r+Zd(Je[e*4+2]*240-r,240),i=Je[e*4+3];Ye[e*3]=ld(t)+Je[e*4]*Je[e*4+1]+Math.sin(n*.7+i*40)*1.6,Ye[e*3+1]=.8+i*5+Math.sin(n*1.1+i*25)*.7,Ye[e*3+2]=-t+Math.cos(n*.6+i*33)*1.4}Ze.getAttribute(`position`).needsUpdate=!0,Qe.uScale.value=t.domElement.height*.9}else $e.visible=!1;T.offset.y=-n*.12;for(let e=0;e<7;e++){let t=i+Zd(e*71+W(e,1,32)*40-i,500),r=Zd((W(e,2,32)-.5)*520+n*.7+260,520)-260,a=Yd((260-Math.abs(r))/70),o=(34+W(e,3,32)*30)*a;L.position.set(ld(t)+r,120+W(e,4,32)*25,-t),L.rotation.set(0,W(e,5,32)*1.2,0),L.scale.set(o*1.4,o*.35,o),L.updateMatrix(),De.setMatrixAt(e,L.matrix)}De.instanceMatrix.needsUpdate=!0;let u=Math.ceil((e-40-.9*n)/110);for(let e=0;e<7;e++){let t=u+e,r=t*110+.9*n+W(t,9,61)*30,i=Qd(r),a=+(i===`meadow`||i===`barnyard`||i===`sunset`),o=(W(t,1,61)<.5?-1:1)*(17+W(t,2,61)*16),s=W(t,3,61)*6.28;L.position.set(ld(r)+o,Math.abs(Math.sin(n*5+s))*.07,-r),L.rotation.set(0,pd(r),Math.sin(n*5+s)*.04),L.scale.setScalar(a*(.85+W(t,4,61)*.25)),L.updateMatrix(),Oe.setMatrixAt(e,L.matrix)}Oe.instanceMatrix.needsUpdate=!0;let d=Jd((s-25)/45);if(te.opacity=d*.5,Ne.visible=d>.02,Ne.visible){let t=e-10;for(let e=0;e<24;e++){let n=t+Zd(W(e,1,71)*90-t,90),r=(e&1?1:-1)*(11.9+W(e,2,71)*4.5);L.position.set(ld(n)+r,.13,-n),L.rotation.set(0,pd(n),0),L.scale.set(.09+W(e,3,71)*.08,1,.6+s*.1*(.4+W(e,4,71))),L.updateMatrix(),Ne.setMatrixAt(e,L.matrix)}Ne.instanceMatrix.needsUpdate=!0}let f=Qd(e+40);Ve.setHex(Re[f]),Le.uCol.value.lerp(Ve,.04),He+=(ze[f]-He)*.04,Le.uAmt.value=f===`creek`?.45:.85,Le.uScale.value=t.domElement.height*.9;let p=e-15;for(let e=0;e<140;e++){let t=p+Zd(Pe[e*4]*110-p,110),r=Pe[e*4+3];P[e*3]=ld(t)+(Pe[e*4+1]-.5)*56+Math.sin(n*.8+r*40)*1.5+n*.2*(r-.5),P[e*3+1]=Zd(Pe[e*4+2]*12-n*He*(.5+r),12)+.3,P[e*3+2]=-t+Math.cos(n*.7+r*33)*1.2}Ie.getAttribute(`position`).needsUpdate=!0;let m=(st*.1+.07)*(1-a),h=Math.atan(-lt.x/lt.y),g=e-20;for(let t=0;t<je.length;t++){let n=je[t],r=g+Zd(t*55+W(t,1,81)*30-g,220),i=(t&1?1:-1)*(22+W(t,2,81)*30),a=r-e;n.mesh.position.set(ld(r)+i,0,-r),n.mesh.rotation.set(0,0,h),n.mesh.scale.set(7+W(t,3,81)*6,55,1),n.u.uAmt.value=m*Yd((200-a)/60)*Yd((a+10)/30),n.u.uCol.value.copy(I.sun)}}function ft(e){let t=Math.max(0,gd(e));for(let e of[t,t+1]){let t=we[e%3],n=e*ed;if(t.g!==e){t.g=e;let r=$d(e);t.mat.color.setHex(r.accent),mp(t.cv,t.tex,r.name,e===0?`Let's moo!`:`Zone ${e+1}`,r.accent),t.group.position.set(ld(n),0,-n),t.group.rotation.y=pd(n)}}for(let t of we){let n=t.g*ed;t.group.visible=t.g>=0&&n>e-80&&n<e+Wd+40}Te.visible=e<120}let pt={update(e,t,n,a){s=a,o=e,np.value=t;let c=gd(e);if(c!==i){let e=i<0;if(i=c,!e)for(let e of r)e($d(c),c)}ut(e);let l=Math.floor((e-Ud)/zd),d=Math.floor((e+Wd)/zd);for(let e=l;e<=d;e++){let t=Zd(e,Hd);re[t].k!==e&&xe(t,e)}let h=ld(e);g.position.set(h,0,-e),ke.position.set(h+ct.x*140,ct.y*140,-e+ct.z*140);let _=e+3.5;m.set(ld(_),0,-_),f.set(lt.z,0,-lt.x).normalize(),p.crossVectors(lt,f).normalize();let v=52/2048,y=m.dot(f),b=m.dot(p);m.addScaledVector(f,Math.round(y/v)*v-y).addScaledVector(p,Math.round(b/v)*v-b),u.target.position.copy(m),u.position.set(m.x+lt.x*100,m.y+lt.y*100,m.z+lt.z*100),ft(e),dt(e,t)},onZone(e){r.push(e)},setNight(e){a=Jd(e),ut(o)}};return pt.update(0,0,0,0),pt}var Dp=`
attribute float size; attribute vec4 col;
uniform float uScale; varying vec4 vC;
void main(){ vC = col; vec4 mv = modelViewMatrix * vec4(position,1.0);
  gl_PointSize = size * uScale / max(0.1, -mv.z); gl_Position = projectionMatrix * mv; }`,Op=`
varying vec4 vC; uniform float uSoft;
void main(){ vec2 p = gl_PointCoord - 0.5; float r = length(p) * 2.0;
  float a = 1.0 - smoothstep(uSoft, 1.0, r); if (a * vC.a < 0.01) discard;
  gl_FragColor = vec4(vC.rgb, vC.a * a); }`,kp=class{points;n;pos;vel;col;siz;life;max;s0;s1;grav;drag;c0;c1;next=0;geo=new hr;mat;constructor(e,t,n,r){this.n=e,this.pos=new Float32Array(e*3),this.vel=new Float32Array(e*3),this.col=new Float32Array(e*4),this.siz=new Float32Array(e),this.life=new Float32Array(e),this.max=new Float32Array(e).fill(1),this.s0=new Float32Array(e),this.s1=new Float32Array(e),this.grav=new Float32Array(e),this.drag=new Float32Array(e),this.c0=new Float32Array(e*3),this.c1=new Float32Array(e*3),this.geo.setAttribute(`position`,new er(this.pos,3).setUsage(Ke)),this.geo.setAttribute(`col`,new er(this.col,4).setUsage(Ke)),this.geo.setAttribute(`size`,new er(this.siz,1).setUsage(Ke)),this.mat=new wo({vertexShader:Dp,fragmentShader:Op,transparent:!0,depthWrite:!1,blending:t?2:1,uniforms:{uScale:{value:700},uSoft:{value:n}}}),this.points=new Fi(this.geo,this.mat),this.points.frustumCulled=!1,this.points.renderOrder=t?11:10,r.add(this.points)}setScale(e){this.mat.uniforms.uScale.value=e}emit(e,t,n,r,i,a,o,s,c,l,u,d=0,f=0){let p=this.next;this.next=(this.next+1)%this.n;let m=p*3;this.pos[m]=e,this.pos[m+1]=t,this.pos[m+2]=n,this.vel[m]=r,this.vel[m+1]=i,this.vel[m+2]=a,this.life[p]=o,this.max[p]=o,this.s0[p]=s,this.s1[p]=c,this.grav[p]=d,this.drag[p]=f,this.c0[m]=(l>>16&255)/255,this.c0[m+1]=(l>>8&255)/255,this.c0[m+2]=(l&255)/255,this.c1[m]=(u>>16&255)/255,this.c1[m+1]=(u>>8&255)/255,this.c1[m+2]=(u&255)/255}update(e){for(let t=0;t<this.n;t++){let n=this.life[t],r=t*4,i=t*3;if(n<=0){this.col[r+3]!==0&&(this.col[r+3]=0,this.siz[t]=0);continue}let a=n-e;if(this.life[t]=a,a<=0){this.col[r+3]=0,this.siz[t]=0;continue}let o=1-a/this.max[t],s=Math.max(0,1-this.drag[t]*e);this.vel[i]*=s,this.vel[i+1]=this.vel[i+1]*s-this.grav[t]*e,this.vel[i+2]*=s,this.pos[i]+=this.vel[i]*e,this.pos[i+1]+=this.vel[i+1]*e,this.pos[i+2]+=this.vel[i+2]*e,this.siz[t]=this.s0[t]+(this.s1[t]-this.s0[t])*o,this.col[r]=this.c0[i]+(this.c1[i]-this.c0[i])*o,this.col[r+1]=this.c0[i+1]+(this.c1[i+1]-this.c0[i+1])*o,this.col[r+2]=this.c0[i+2]+(this.c1[i+2]-this.c0[i+2])*o,this.col[r+3]=o<.12?o/.12:1-(o-.12)/.88}this.geo.attributes.position.needsUpdate=!0,this.geo.attributes.col.needsUpdate=!0,this.geo.attributes.size.needsUpdate=!0}},Ap=class{grav;bounce;flutter;mesh;n;p;v;r;w;life;max;sc;next=0;qa=new mt;ea=new Jt;ma=new Rt;pa=new z;sa=new z;ca=new V;zero=new Rt().makeScale(0,0,0);constructor(e,t,n,r,i,a,o){this.grav=i,this.bounce=a,this.flutter=o,this.n=n,this.p=new Float32Array(n*3),this.v=new Float32Array(n*3),this.r=new Float32Array(n*3),this.w=new Float32Array(n*3),this.life=new Float32Array(n),this.max=new Float32Array(n).fill(1),this.sc=new Float32Array(n),this.mesh=new hi(e,t,n),this.mesh.instanceMatrix.setUsage(Ke),this.mesh.frustumCulled=!1,this.mesh.castShadow=!1,this.mesh.receiveShadow=!1,this.mesh.renderOrder=9;for(let e=0;e<n;e++)this.mesh.setMatrixAt(e,this.zero),this.mesh.setColorAt(e,this.ca.setRGB(1,1,1));r.add(this.mesh)}emit(e,t,n,r,i,a,o,s,c){let l=this.next;this.next=(this.next+1)%this.n;let u=l*3;this.p[u]=e,this.p[u+1]=t,this.p[u+2]=n,this.v[u]=r,this.v[u+1]=i,this.v[u+2]=a,this.r[u]=Math.random()*6,this.r[u+1]=Math.random()*6,this.r[u+2]=Math.random()*6,this.w[u]=(Math.random()-.5)*16,this.w[u+1]=(Math.random()-.5)*16,this.w[u+2]=(Math.random()-.5)*16,this.life[l]=c,this.max[l]=c,this.sc[l]=o,this.mesh.setColorAt(l,this.ca.setHex(s)),this.mesh.instanceColor&&(this.mesh.instanceColor.needsUpdate=!0)}update(e){let t=!1;for(let n=0;n<this.n;n++){let r=this.life[n];if(r<=0)continue;let i=n*3,a=r-e;if(this.life[n]=a,a<=0){this.mesh.setMatrixAt(n,this.zero),t=!0;continue}this.flutter?(this.v[i+1]=Math.max(this.v[i+1]-this.grav*e,-2.2),this.v[i]+=Math.sin(a*7+n)*3*e,this.v[i+2]+=Math.cos(a*6+n*1.7)*3*e):this.v[i+1]-=this.grav*e,this.p[i]+=this.v[i]*e,this.p[i+1]+=this.v[i+1]*e,this.p[i+2]+=this.v[i+2]*e,this.p[i+1]<.12&&this.v[i+1]<0&&(this.p[i+1]=.12,this.v[i+1]=-this.v[i+1]*this.bounce,this.v[i]*=.7,this.v[i+2]*=.7,this.w[i]*=.6,this.w[i+1]*=.6,this.w[i+2]*=.6,this.flutter&&(this.v[i]*=.2,this.v[i+2]*=.2)),this.r[i]+=this.w[i]*e,this.r[i+1]+=this.w[i+1]*e,this.r[i+2]+=this.w[i+2]*e;let o=this.sc[n]*Math.min(1,a/.35);this.qa.setFromEuler(this.ea.set(this.r[i],this.r[i+1],this.r[i+2])),this.ma.compose(this.pa.set(this.p[i],this.p[i+1],this.p[i+2]),this.qa,this.sa.set(o,(this.flutter,o),o)),this.mesh.setMatrixAt(n,this.ma),t=!0}t&&(this.mesh.instanceMatrix.needsUpdate=!0)}};function jp(){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`);if(t){let e=t.createRadialGradient(32,32,0,32,32,32);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.25,`rgba(255,255,255,0.65)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.fillRect(0,0,64,64)}let n=new Ri(e);return n.colorSpace=Be,n}function Mp(){let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`);t&&(t.lineCap=`round`,t.strokeStyle=`#1b1b3a`,t.lineWidth=16,t.beginPath(),t.moveTo(14,14),t.lineTo(50,50),t.moveTo(50,14),t.lineTo(14,50),t.stroke(),t.strokeStyle=`#ffffff`,t.lineWidth=8,t.beginPath(),t.moveTo(14,14),t.lineTo(50,50),t.moveTo(50,14),t.lineTo(14,50),t.stroke());let n=new Ri(e);return n.colorSpace=Be,n}var Np=200,Pp=9;function Fp(e){let t=new kp(520,!0,.25,e),n=new kp(420,!1,.05,e),r=Math.random,i=new Wi(1,1,1,5);i.rotateX(Math.PI/2);let a=[];for(let t=0;t<24;t++){let t=new Kr({color:16770688,transparent:!0,depthWrite:!1,blending:2,fog:!1}),n=new H(i,t);n.visible=!1,n.frustumCulled=!1,n.renderOrder=12,e.add(n),a.push({mesh:n,mat:t,t:0,dur:.1,a:0,b:0})}let o=0,s=new uo(.82,1,36);s.rotateX(-Math.PI/2);let c=[];for(let t=0;t<12;t++){let t=new Kr({color:16777215,transparent:!0,depthWrite:!1,side:2,blending:2,fog:!1}),n=new H(s,t);n.visible=!1,n.frustumCulled=!1,n.renderOrder=12,e.add(n),c.push({mesh:n,mat:t,t:0,dur:.5,a:1,b:6})}let l=0,u=new mo(1,8,6),d=[];for(let t=0;t<14;t++){let t=new Kr({color:16773280,transparent:!0,depthWrite:!1,blending:2,fog:!1}),n=new H(u,t);n.visible=!1,n.frustumCulled=!1,n.renderOrder=12,e.add(n),d.push({mesh:n,mat:t,t:0,dur:.08,a:.35,b:.6})}let f=0,p=new Gi(.5,1,8,1,!0);p.rotateX(Math.PI/2),p.translate(0,0,.5);let m=[];for(let t=0;t<8;t++){let t=new Kr({color:16765024,transparent:!0,depthWrite:!1,side:2,blending:2,fog:!1}),n=new H(p,t);n.visible=!1,n.frustumCulled=!1,n.renderOrder=12,e.add(n),m.push({mesh:n,mat:t,t:0,dur:.06,a:1,b:1})}let h=0,g=jp(),_=[];for(let t=0;t<6;t++){let t=new Tr({map:g,color:16760928,transparent:!0,depthWrite:!1,blending:2,fog:!1}),n=new zr(t);n.visible=!1,n.frustumCulled=!1,n.renderOrder=13,e.add(n),_.push({sp:n,mat:t,t:0,dur:.3,a:1,b:4})}let v=0,y=Mp(),b=[];for(let t=0;t<8;t++){let t=new Tr({map:y,transparent:!0,depthWrite:!1,depthTest:!1,fog:!1}),n=new zr(t);n.visible=!1,n.frustumCulled=!1,n.renderOrder=14,e.add(n),b.push({sp:n,mat:t,t:0,dur:.4,a:.4,b:1})}let x=0,S=new Ap(new so(.5,0),new Do({color:16777215,flatShading:!0}),80,e,22,.45,!1),C=new Ap(new lo(.28,.16),new Kr({color:16777215,side:2,fog:!1}),140,e,4,.1,!0),w=[16726832,16765471,3112191,3130970,16747008,10178047,16777215,16735370],T=new Float32Array(2400),E=new Float32Array(800),D=new Float32Array(Np).fill(-1e9),ee=new Float32Array(Np),te=new hr;te.setAttribute(`position`,new er(T,3).setUsage(Ke)),te.setAttribute(`aA`,new er(E,1).setUsage(Ke));let O=new Uint16Array(1200);for(let e=0;e<Np;e++)O.set([e*4,e*4+1,e*4+2,e*4+1,e*4+3,e*4+2],e*6);te.setIndex(new er(O,1));let ne=new H(te,new wo({transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-6,polygonOffsetUnits:-6,fog:!1,vertexShader:`attribute float aA; varying float vA; void main(){ vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,fragmentShader:`varying float vA; void main(){ gl_FragColor = vec4(0.05,0.05,0.1, vA*0.75); }`}));ne.frustumCulled=!1,ne.renderOrder=3,e.add(ne);let k=0,A=!1,j=-9,re=!1,M=0,ie=new z,ae=new z,oe=.085,se=.17,ce=(e,t,n,r,i)=>{let a=n-e,o=r-t,s=Math.hypot(a,o);if(s<.02)return;let c=-o/s*se,l=a/s*se,u=k*12;T[u]=e-c,T[u+1]=oe,T[u+2]=t-l,T[u+3]=e+c,T[u+4]=oe,T[u+5]=t+l,T[u+6]=n-c,T[u+7]=oe,T[u+8]=r-l,T[u+9]=n+c,T[u+10]=oe,T[u+11]=r+l,D[k]=M,ee[k]=i,k=(k+1)%Np,re=!0,te.attributes.position.needsUpdate=!0},le=new z,ue=(e,t,n,r)=>{e.t=t,e.dur=t,e.a=n,e.b=r,e.mesh.visible=!0},N=(e,t,n,r,i)=>{let a=d[f++%d.length];a.mesh.position.copy(e),a.mat.color.setHex(r),ue(a,i,t,n)},de=(e,t,n,r,i)=>{let a=c[l++%c.length];a.mesh.position.copy(e),a.mesh.position.y=Math.max(e.y,.05),a.mat.color.setHex(r),ue(a,i,t,n)},fe=(e,t,n,r,i)=>{let a=_[v++%_.length];a.sp.position.copy(e),a.mat.color.setHex(r),a.t=i,a.dur=i,a.a=t,a.b=n,a.sp.visible=!0},pe=(e,t,n)=>{let r=(e>>16&255)*(1-n)+(t>>16&255)*n,i=(e>>8&255)*(1-n)+(t>>8&255)*n,a=(e&255)*(1-n)+(t&255)*n;return(r|0)<<16|(i|0)<<8|a},me=(e,t,n)=>{let i=Math.min(30,n|0);for(let n=0;n<i;n++){let i=r()*Math.PI*2,a=3+r()*7,o=n%3==0?1776442:n%3==1?pe(t,16777215,.25):t;S.emit(e.x,e.y+.2,e.z,Math.cos(i)*a,4+r()*9,Math.sin(i)*a,.12+r()*.2,o,1.2+r()*.9)}};return{setViewScale(e){t.setScale(e),n.setScale(e)},explosion(e,i,a=16747008){let o=Math.max(.3,i);N(e,o*.5,o*1.7,16773808,.22),fe(e,o*2.5,o*7,pe(a,16777215,.35),.35),de(e,o*.4,o*3.4,pe(a,16777215,.4),.5);let s=Math.min(10,4+o*2|0);for(let n=0;n<s;n++){let n=r()*Math.PI*2,i=r()*2-1,a=Math.sqrt(1-i*i),s=(1+r()*3)*o*.6;t.emit(e.x,e.y,e.z,Math.cos(n)*a*s,Math.abs(i)*s*.7+.6,Math.sin(n)*a*s,.22+r()*.18,o*(.7+r()*.5),o*.15,16777215,16765024,0,4)}let c=Math.min(24,9+o*4|0);for(let n=0;n<c;n++){let n=r()*Math.PI*2,i=r()*2-1,s=Math.sqrt(1-i*i),c=(2+r()*5)*o*.7;t.emit(e.x,e.y,e.z,Math.cos(n)*s*c,Math.abs(i)*c*.8+1,Math.sin(n)*s*c,.35+r()*.35,o*(.9+r()*.7),o*.25,a,8000512,0,3)}for(let n=0;n<12+(o*3|0);n++){let n=r()*Math.PI*2,i=(6+r()*12)*Math.min(2,o*.7);t.emit(e.x,e.y,e.z,Math.cos(n)*i,2+r()*9,Math.sin(n)*i,.4+r()*.5,.18,.04,16770688,16734720,22,.5)}let l=Math.min(14,5+o*2|0);for(let t=0;t<l;t++){let t=r()*Math.PI*2,i=r()*1.6*o*.5;n.emit(e.x+Math.cos(t)*.3,e.y+.3,e.z+Math.sin(t)*.3,Math.cos(t)*i,2.4+r()*3.2,Math.sin(t)*i,1.5+r()*1.2,o*.6,o*(1.6+r()*.8),2762808,9078170,-.8,.9)}me(e,a,Math.min(14,4+o*2|0))},muzzle(e,i){N(e,.2,.36,16770688,.06);let a=m[h++%m.length];a.mesh.position.copy(e),a.mesh.lookAt(le.copy(e).add(i));let o=.28+r()*.1,s=.9+r()*.4;a.mesh.scale.set(o,o,s),a.mat.color.setHex(r()<.5?16765024:16773296),ue(a,.06,1,1);for(let n=0;n<4;n++){let n=6+r()*10;t.emit(e.x,e.y,e.z,i.x*n+(r()-.5)*4,i.y*n+(r()-.5)*4,i.z*n+(r()-.5)*4,.12+r()*.1,.16,.03,16777215,16752672,0,2)}n.emit(e.x,e.y,e.z,i.x*2,i.y*2+.6,i.z*2,.5,.15,.55,11578040,14736616,-.3,1.5),S.emit(e.x,e.y,e.z,-i.z*3+(r()-.5),3+r()*2,i.x*3+(r()-.5),.06,16762938,.9)},tracer(e,t,n=16770688){let r=a[o++%a.length],i=le.copy(t).sub(e).length();i<.01||(r.mesh.position.copy(e).add(t).multiplyScalar(.5),r.mesh.lookAt(t),r.mesh.scale.set(.045,.045,i),r.mat.color.setHex(n),ue(r,.09,1,.3))},impact(e,i=16765024){N(e,.14,.34,16777215,.06);for(let n=0;n<9;n++){let n=r()*Math.PI*2,a=2+r()*7;t.emit(e.x,e.y,e.z,Math.cos(n)*a,1+r()*5,Math.sin(n)*a,.2+r()*.25,.12,.03,i,16738816,18,.5)}for(let n=0;n<2;n++){let n=r()*Math.PI*2;t.emit(e.x,e.y,e.z,Math.cos(n)*9,2+r()*3,Math.sin(n)*9,.15,.2,.02,16777215,16752672,10,1)}n.emit(e.x,e.y,e.z,0,.9,0,.45,.22,.65,12104900,14999788,-.2,1),n.emit(e.x+(r()-.5)*.2,e.y,e.z+(r()-.5)*.2,r()-.5,.6,r()-.5,.35,.15,.4,9276060,13683932,0,1)},smoke(e,t=1){n.emit(e.x+(r()-.5)*.3,e.y,e.z+(r()-.5)*.3,(r()-.5)*.8,1.6+r()*1,(r()-.5)*.8,.8+r()*.5,.35*t,1.5*t,2894394,7828362,-.3,.8)},dust(e,t){n.emit(e.x,e.y,e.z,t.x+(r()-.5)*1.2,t.y+r()*.9,t.z+(r()-.5)*1.2,.5+r()*.35,.3,1.1,14075034,15326656,-.2,2)},pickupBurst(e,n){de(e,.3,2.4,n,.45),N(e,.3,.9,16777215,.15),fe(e,1,3.2,n,.3);for(let i=0;i<22;i++){let a=i/22*Math.PI*2+r()*.2,o=3+r()*3.5;t.emit(e.x,e.y,e.z,Math.cos(a)*o,2+r()*4,Math.sin(a)*o,.6+r()*.3,.22,.06,i%3==0?16777215:n,n,9,.8)}},nitro(e,n){let i=7+r()*5;t.emit(e.x,e.y,e.z,n.x*i+(r()-.5),n.y*i+(r()-.5)*.6,n.z*i+(r()-.5),.22+r()*.12,.55,.1,16769162,16726528,0,1.5)},skid(e,t,n){n<.03?A=!1:(A&&M-j<.2&&ie.distanceToSquared(e)<16&&ae.distanceToSquared(t)<16&&(ce(ie.x,ie.z,e.x,e.z,n),ce(ae.x,ae.z,t.x,t.z,n)),ie.copy(e),ae.copy(t),A=!0,j=M)},tireSmoke(e,t,i){let a=Math.min(1.6,i);a<=0||n.emit(e.x+(r()-.5)*.4,e.y+.1,e.z+(r()-.5)*.4,-t.x*.5+(r()-.5)*1.2,.8+r()*.8,-t.z*.5+(r()-.5)*1.2,.55+r()*.45,.35+a*.2,1.3+a*.8,15263472,16777215,-.1,1.6)},shockwave(e,i){let a=Math.max(2,i),o=le.set(e.x,.05,e.z);de(o,a*.3,a*4.2,16777215,.7),de(o,a*.2,a*2.8,16756800,.5),fe(e,a*1.5,a*6,16769184,.4);for(let e=0;e<26;e++){let t=e/26*Math.PI*2+r()*.2,i=a*(2.2+r()*1.2);n.emit(o.x,.25,o.z,Math.cos(t)*i,.4+r()*.8,Math.sin(t)*i,.8+r()*.5,a*.22,a*.6,14075034,15787724,0,2.6)}for(let e=0;e<14;e++){let e=r()*Math.PI*2,n=a*(3+r()*2);t.emit(o.x,.3,o.z,Math.cos(e)*n,1+r()*2,Math.sin(e)*n,.4,.3,.05,16777215,16752672,6,2)}},debris:me,confetti(e){for(let t=0;t<70;t++){let n=r()*Math.PI*2,i=2+r()*7;C.emit(e.x,e.y+.5,e.z,Math.cos(n)*i,8+r()*9,Math.sin(n)*i,.7+r()*.7,w[t%w.length],2.8+r()*1.6)}de(le.set(e.x,.05,e.z),.5,5,16765471,.6)},sparkTrail(e,n){for(let i=0;i<2;i++)t.emit(e.x+(r()-.5)*.4,e.y+.1,e.z+(r()-.5)*.4,n.x*.3+(r()-.5)*3,1.5+r()*3,n.z*.3+(r()-.5)*3,.25+r()*.25,.13,.02,16773280,16734720,16,.6)},hitMarker3D(e){let t=b[x++%b.length];t.sp.position.copy(e),t.t=.4,t.dur=.4,t.a=.4,t.b=1,t.sp.visible=!0},update(e){if(M+=e,t.update(e),n.update(e),S.update(e),C.update(e),re){let e=!1;for(let t=0;t<Np;t++){let n=M-D[t],r=n>Pp?0:ee[t]*Math.min(1,n*8)*(1-n/Pp);r>.002&&(e=!0),E[t*4]=E[t*4+1]=E[t*4+2]=E[t*4+3]=r}te.attributes.aA.needsUpdate=!0,e||(re=!1)}for(let t=0;t<a.length;t++){let n=a[t];n.mesh.visible&&(n.t-=e,n.t<=0?n.mesh.visible=!1:n.mat.opacity=n.t/n.dur)}for(let t=0;t<c.length;t++){let n=c[t];if(!n.mesh.visible)continue;if(n.t-=e,n.t<=0){n.mesh.visible=!1;continue}let r=1-n.t/n.dur,i=1-(1-r)*(1-r);n.mesh.scale.setScalar(n.a+(n.b-n.a)*i),n.mat.opacity=(1-r)*.9}for(let t=0;t<d.length;t++){let n=d[t];if(!n.mesh.visible)continue;if(n.t-=e,n.t<=0){n.mesh.visible=!1;continue}let r=1-n.t/n.dur;n.mesh.scale.setScalar(n.a+(n.b-n.a)*r),n.mat.opacity=1-r}for(let t=0;t<m.length;t++){let n=m[t];n.mesh.visible&&(n.t-=e,n.t<=0?n.mesh.visible=!1:n.mat.opacity=n.t/n.dur)}for(let t=0;t<_.length;t++){let n=_[t];if(!n.sp.visible)continue;if(n.t-=e,n.t<=0){n.sp.visible=!1;continue}let r=1-n.t/n.dur;n.sp.scale.setScalar(n.a+(n.b-n.a)*Math.sqrt(r)),n.mat.opacity=(1-r)*(1-r)}for(let t=0;t<b.length;t++){let n=b[t];if(!n.sp.visible)continue;if(n.t-=e,n.t<=0){n.sp.visible=!1;continue}let r=1-n.t/n.dur;n.sp.scale.setScalar(n.a+(n.b-n.a)*Math.min(1,r*4)),n.sp.position.y+=e*1.2,n.mat.opacity=r<.6?1:1-(r-.6)/.4}}}}var K={ink:`#1b1b3a`,red:`#ff3b30`,yellow:`#ffd21f`,blue:`#2f7cff`,green:`#2fc65a`,orange:`#ff8a00`,purple:`#9b4dff`,wood:`#b8763e`,cream:`#fff6e0`,pink:`#ffb3c1`,steel:`#9aa3b8`,dark:`#2b2b4d`,white:`#ffffff`,cyan:`#38e1ff`},Ip=null;function Lp(){if(Ip)return Ip;let e=new oi(new Uint8Array([105,165,220,255]),4,1,D);return e.minFilter=e.magFilter=r,e.generateMipmaps=!1,e.needsUpdate=!0,Ip=e}var Rp=new Map;function q(e,t){if(t){let n=new Eo({color:e,gradientMap:Lp()});return t.push(n),n}let n=new V(e).getHexString(),r=Rp.get(n);return r||(r=new Eo({color:e,gradientMap:Lp()}),Rp.set(n,r)),r}function zp(e,t=1,n=!0){return new Kr({color:e,transparent:!0,opacity:t,depthWrite:!1,blending:n?2:1})}function Bp(e,t,n,r){for(let i=0;i<e.length;i++)e[i].emissive.setRGB(t,n,r)}var Vp={box:new Hi(1,1,1),sph:new mo(1,14,10),ico:new so(1,0)},Hp=new Map;function Up(e,t){let n=e.toFixed(3)+`/`+t,r=Hp.get(n);return r||(r=new Wi(e,1,1,t),Hp.set(n,r)),r}var Wp=new Kr({color:K.ink,side:1});function J(e,t,n=0,r=0,i=0){return t.position.set(n,r,i),e&&e.add(t),t}function Gp(e,t){let n=e.scale,r=new H(e.geometry,Wp);return r.scale.set(1+2*t/Math.abs(n.x||1),1+2*t/Math.abs(n.y||1),1+2*t/Math.abs(n.z||1)),e.add(r),e}function Y(e,t,n,r,i,a=0,o=0,s=0,c=0){let l=new H(Vp.box,t);return l.scale.set(n,r,i),l.castShadow=!0,c&&Gp(l,c),J(e,l,a,o,s)}function X(e,t,n,r,i,a=0,o=0,s=0,c=0){let l=new H(Vp.sph,t);return l.scale.set(n,r,i),l.castShadow=!0,c&&Gp(l,c),J(e,l,a,o,s)}function Kp(e,t,n,r=0,i=0,a=0){let o=new H(Vp.ico,t);return o.scale.setScalar(n),o.castShadow=!0,J(e,o,r,i,a)}function Z(e,t,n,r,i,a=0,o=0,s=0,c=0,l=14){let u=new H(Up(n/r,l),t);return u.scale.set(r,i,r),u.castShadow=!0,c&&Gp(u,c),J(e,u,a,o,s)}function qp(e){let t=Math.floor(e*1e3)+2654435769>>>0;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}var Jp=(e,t,n)=>Math.min(n,Math.max(t,e)),Yp=(e,t)=>1-Math.exp(-e*t);function Xp(e,t,n,r){let i=new B,a=new B;i.add(a);let o=Z(a,q(K.dark,n),e*.9,e*.9,t,0,0,0,.03,16);o.rotation.z=Math.PI/2;let s=q(`#15152e`,n);for(let n=0;n<10;n++){let r=n/10*Math.PI*2,i=Y(null,s,t*1.02,e*.2,e*.36);i.position.set(0,Math.cos(r)*e*.92,Math.sin(r)*e*.92),i.rotation.x=-r,a.add(i)}let c=Z(a,q(r,n),e*.5,e*.5,t*1.06,0,0,0,.02);c.rotation.z=Math.PI/2;let l=q(K.white,n);for(let n=0;n<3;n++){let r=Y(a,l,t*1.12,e*.14,e*.8);r.rotation.x=n/3*Math.PI}return{root:i,spin:a,r:e}}var Q=Math.PI,Zp=new V;function Qp(e){let t=new B,n=new V(e).getHSL({h:0,s:0,l:0}).l,r=q(e),i=q(n>.75?K.ink:K.white),a=q(K.pink),o=q(K.ink),s=q(K.cream);Y(t,r,1,.85,1.5,0,.9,.05,.035),Y(t,i,1.03,.42,.5,0,1.12,.3),Y(t,i,.5,.35,.45,.28,1,-.35).position.x=.27,X(t,a,.2,.17,.2,0,.5,.55);let c=new B;t.add(c);for(let e of[-1,1])for(let t of[-1,1])Y(c,r,.28,.5,.28,e*.3,.27,t*.52,.025),Y(c,o,.3,.13,.3,e*.3,.06,t*.52);let l=J(t,new B,0,1.32,-.88);Y(l,r,.72,.66,.6,0,0,0,.035),Y(l,i,.26,.5,.04,0,.03,-.31),Y(l,a,.52,.3,.3,0,-.17,-.34,.025),Y(l,o,.07,.07,.04,.13,-.14,-.5),Y(l,o,.07,.07,.04,-.13,-.14,-.5);let u=[],d=[],f=[],p=[],m=q(K.white),h=q(`#ff8aa0`);for(let e of[-1,1]){u.push(X(l,m,.12,.13,.08,e*.22,.1,-.29,.015)),d.push(X(l,o,.06,.07,.05,e*.22,.09,-.35)),X(l,m,.025,.025,.02,e*.2,.12,-.375),f.push(Y(l,o,.17,.035,.04,e*.22,.25,-.31)),p.push(X(l,h,.07,.04,.03,e*.3,-.04,-.31));let t=Z(l,s,0,.09,.3,e*.3,.42,-.02,.02,8);t.rotation.z=-e*.45}let g=e=>{let t=J(l,new B,e*.38,.2,.02);return Y(t,r,.34,.12,.2,e*.17,0,0,.02),Y(t,a,.2,.13,.12,e*.2,0,0),t},_=g(-1),v=g(1),y=J(t,new B,0,1.25,.8);Z(y,r,.04,.05,.6,0,-.3,.03),X(y,o,.1,.14,.1,0,-.66,.03);let b=Y(l,q(`#ff6b8a`),.12,.2,.04,0,-.38,-.5,.012);return b.visible=!1,t.userData.parts={head:l,earL:_,earR:v,tail:y,legs:c,eyes:u,pupils:d,brows:f,tongue:b,cheeks:p},t}function $p(e,t,n,r){let i=e.userData.parts;if(!i.eyes||!i.pupils||!i.brows||!i.tongue)return;let a=t?1.55:n?.75:1;for(let e=0;e<2;e++){let r=e?1:-1;i.eyes[e].scale.set(.12*(t?1.3:1),.13*a,.08),i.pupils[e].scale.setScalar(t?.04:.06).multiplyScalar(1),i.pupils[e].scale.y=t?.05:.07,i.pupils[e].scale.z=.05,i.brows[e].rotation.z=r*(t?.45:n?-.5:0),i.brows[e].position.y=t?.31:n?.2:.25}i.tongue.visible=n,n&&(i.tongue.rotation.z=Math.sin(r*24)*.25,i.tongue.scale.y=1+Math.sin(r*18)*.15)}function em(e,t,n=1){let r=e.userData.parts;r.earL.rotation.z=.35+Math.sin(t*9)*.28*n,r.earR.rotation.z=-.35-Math.sin(t*9+1.3)*.28*n,r.tail.rotation.z=Math.sin(t*7+.5)*.55*n,r.head.position.y=1.32+Math.sin(t*5)*.025*n}function tm(e,t=!0){let n=new B,r=q(`#f6f0e0`,e),i=q(`#3a3a5c`,e),a=q(K.ink,e),o=q(K.red,e),s=qp(7);X(n,r,.62,.55,.7,0,.8,.1,.03);for(let e=0;e<7;e++)X(n,r,.3,.3,.3,(s()-.5)*.9,.7+s()*.6,(s()-.5)*.9);let c=J(n,new B,0,1.3,-.62);X(c,i,.34,.36,.32,0,0,0,.03),X(c,r,.3,.2,.28,0,.3,.05);for(let t of[-1,1])Y(c,i,.34,.1,.18,t*.4,.05,.05).rotation.z=t*-.3,X(c,q(K.white,e),.1,.1,.06,t*.14,.06,-.28),X(c,a,.05,.06,.04,t*.14,.05,-.33);return t&&Y(c,a,.66,.12,.1,0,.1,-.26),Y(n,o,.72,.16,.5,0,1.1,-.45),n}function nm(e){let t=new B,n=q(`#c9a77a`,e),r=q(`#6b4a2a`,e),i=q(K.ink,e),a=q(K.cream,e);Y(t,n,.8,.8,1,0,.8,.1,.03);let o=J(t,new B,0,1.35,-.6);Y(o,n,.6,.55,.6,0,0,0,.03),Y(o,r,.34,.26,.3,0,-.14,-.34),Y(o,r,.14,.34,.1,0,-.4,-.3);for(let t of[-1,1])X(o,q(K.white,e),.1,.1,.06,t*.17,.1,-.29),X(o,i,.05,.05,.04,t*.17,.1,-.34),Z(o,a,.02,.09,.5,t*.2,.5,.05,.02,8).rotation.z=-t*.3,Y(o,n,.3,.1,.16,t*.4,.1,.05);return t}function rm(e){let t=new B,n=q(`#3d2a44`,e),r=q(K.ink,e),i=q(K.cream,e),a=q(K.yellow,e);Y(t,n,1.1,.95,1.4,0,.9,.1,.04);let o=J(t,new B,0,1.4,-.8);Y(o,n,.85,.75,.7,0,0,0,.04),Y(o,q(`#6a4d6e`,e),.6,.34,.3,0,-.2,-.38),J(o,new H(new ho(.1,.03,6,12),a),0,-.32,-.5);for(let t of[-1,1])X(o,q(K.white,e),.13,.12,.07,t*.26,.12,-.34),X(o,q(K.red,e),.06,.06,.05,t*.26,.12,-.4),Y(o,r,.3,.06,.06,t*.26,.26,-.37).rotation.z=t*.4,Z(o,i,.02,.12,.7,t*.5,.35,0,.025,8).rotation.z=-t*1,Y(o,n,.36,.12,.2,t*.55,0,.1);return t}function im(){let e=[],t=new B,n=J(t,new B,0,.5,0),r=J(n,new B,0,-.5,0),i=q(K.red,e),a=q(K.dark,e),o=q(K.ink,e),s=q(K.yellow,e),c=q(K.steel,e),l=q(K.wood,e),u=q(K.blue,e),d=new Kr({color:`#fff7b0`});Y(r,o,1.7,.3,3.8,0,.5,0),Y(r,i,1.95,.5,1.5,0,.82,-1.3,.04),Y(r,s,.4,.04,1.5,0,1.08,-1.3),Y(r,i,1.95,.55,1.1,0,.85,-.05,.04),Y(r,s,2,.28,.3,0,.55,-2,.03);for(let e of[-1,1])X(r,d,.2,.2,.12,e*.65,.95,-2.06),Y(r,i,.35,.12,1.1,e*1,.66,-1.35),Y(r,i,.35,.12,1,e*1,.66,1.2);for(let e of[-1,1]){Z(r,o,.05,.05,1,e*.88,1.35,-.55,.01,8);let t=Z(r,o,.05,.05,1,e*.88,1.35,.35,.01,8);t.rotation.x=0}Y(r,o,1.85,.07,1,0,1.87,-.1);let f=new H(new lo(1.7,.62),new Eo({color:`#9fe4ff`,transparent:!0,opacity:.45,side:2}));J(r,f,0,1.45,-.62).rotation.x=-.35,Y(r,a,1.6,.3,.4,0,1.15,-.72),Y(r,a,1.4,.55,.3,0,1.2,.5),Y(r,l,1.8,.1,1.9,0,.78,1.15);for(let e of[-1,1])Y(r,i,.12,.5,1.9,e*.93,1,1.15,.025);Y(r,i,1.98,.5,.12,0,1,2.1,.025),Y(r,s,1.98,.08,.14,0,1.27,2.1);let p=new Kr({color:`#ff5a4a`});for(let e of[-1,1])Y(r,p,.3,.14,.05,e*.7,1.05,2.18);let m=new V(`#a8302a`),h=new V(`#ff3a2a`),g=zp(`#ff2a1a`,0),_=[];for(let e of[-1,1]){let t=new H(new mo(.34,8,6),g);J(r,t,e*.7,1.05,2.28),t.visible=!1,_.push(t)}Y(r,o,1,.2,.06,0,.75,-2.08);for(let e=-2;e<=2;e++)Y(r,c,.05,.16,.05,e*.2,.75,-2.12);Y(r,a,.55,.14,.6,0,1.12,-1.7,.02),Y(r,o,.4,.05,.4,0,1.2,-1.7);let v=q(K.white);for(let e of[-1,1]){Y(r,o,.04,.04,.2,e*1.02,1.42,-.62),Y(r,i,.1,.18,.2,e*1.12,1.46,-.62,.015);let t=Z(r,v,.2,.2,.03,e*.99,.86,-.05,.012,14);t.rotation.z=Q/2;let n=Z(r,s,.12,.12,.04,e*1,.86,-.05,0,12);n.rotation.z=Q/2,Y(r,o,.05,.36,.28,e*1.1,.42,1.78),Y(r,o,.1,.06,.1,e*.88,.62,-2.04)}Y(r,v,.5,.18,.04,0,.72,2.2,.01),Y(r,o,.4,.04,.045,0,.74,2.22),Z(r,o,.015,.02,1.4,.85,1.9,2,0,5);let y=J(r,new B,.85,2.55,2);Y(y,i,.03,.2,.35,0,0,.18),Y(y,s,.035,.07,.12,0,0,.18);let b=zp(`#fff3b0`,.05);for(let e of[-1,1]){let t=new H(new Gi(.55,5,10,1,!0),b);t.rotation.x=Q/2,J(r,t,e*.65,.95,-2.06-2.5),J(r,new H(new mo(.3,8,6),zp(`#fff3b0`,.35)),e*.65,.95,-2.12)}let x=q(`#7a1f1a`,e),S=q(`#241818`,e),C=[Y(r,x,.5,.04,.35,-.4,1.1,-1),Y(r,x,.04,.3,.4,.99,.9,.4),Y(r,S,.7,.04,.5,.35,1.12,-1.5),Y(r,x,.04,.3,.5,-.99,.92,-.5)];for(let e of C)e.visible=!1;let w=J(r,new B,1.02,1.1,-.35);Y(w,i,.05,.5,.9,0,-.25,.45,.02),w.visible=!1;let T=J(r,new B,0,1.09,-.62);Y(T,i,1.5,.06,.9,0,.03,-.45,.02),T.visible=!1;let E=Y(r,o,1.4,.03,.8,0,1.08,-1.05);E.visible=!1;let D=new Kr({color:`#2c2a3a`,transparent:!0,opacity:.55,depthWrite:!1}),ee=new Kr({color:`#e8e6f0`,transparent:!0,opacity:.4,depthWrite:!1}),te=zp(`#ffd060`,.95),O=new mo(1,7,5),ne=[];for(let e=0;e<6;e++)ne.push(J(r,new H(O,D),0,1.2,-1.2));let k=[];for(let e=0;e<8;e++)k.push(J(r,new H(O,ee),0,.65,2.4));let A=[];for(let e=0;e<4;e++)A.push(J(r,new H(new mo(.06,5,4),te),0,.5,0));for(let e of[...ne,...k,...A])e.visible=!1;for(let e of[-1,1]){let t=Z(r,c,.09,.09,.5,e*.55,.62,2.05,.015,8);t.rotation.x=Q/2}let j=[],re=[];for(let[t,n,i,a]of[[-1,-1.35,.46,!0],[1,-1.35,.46,!0],[-1,1.25,.5,!1],[1,1.25,.5,!1]]){let o=Xp(i,.42,e,K.yellow),s=J(r,new B,t*1,i,n);s.add(o.root),j.push(o),a&&re.push(s)}let M=Qp(K.red);M.scale.setScalar(.62),M.position.set(0,.76,.08),M.userData.parts.legs.visible=!1,r.add(M);let ie=M.userData.parts,ae=J(ie.head,new B,0,.33,0);X(ae,q(K.red),.4,.2,.38,0,0,0,.03),Y(ae,q(K.red),.6,.06,.4,0,-.1,-.35),Y(ae,q(K.white),.14,.14,.04,0,.05,-.36);let oe=J(r,new B,0,1.3,-.5);oe.rotation.x=-1.05;let se=J(oe,new B),ce=new H(new ho(.22,.045,8,16),o);se.add(ce),Y(se,o,.44,.05,.05),Y(se,o,.05,.2,.05,0,-.1,0),Y(se,s,.14,.14,.07);let le=J(r,new B,0,.83,1);Z(le,c,.3,.38,.22,0,.11,0,.025);let ue=J(le,new B,0,.6,0);Y(ue,u,.6,.45,.6,0,0,.02,.03);let N=J(ue,new B,0,.05,-.2),de=J(N,new B),fe=[];for(let e of[-.17,0,.17]){let t=Z(de,o,.09,.1,1.5,e,0,-.75,.02,10);t.rotation.x=Q/2;let n=Z(de,s,.12,.12,.14,e,0,-1.43,.015,10);n.rotation.x=Q/2,fe.push(t,n)}let pe=J(N,new fn,0,0,-1.55),me=new H(new Gi(.42,.45,14,1,!0),new Eo({color:K.green,side:2}));me.rotation.x=-Q/2,J(N,me,0,0,-1.28),me.visible=!1;let he=Y(ue,s,.36,.3,.3,.45,-.05,.1,.02);he.visible=!1;let ge=Qp(K.blue);ge.scale.setScalar(.62),ge.position.set(0,-.78,.82),le.add(ge);let _e=ge.userData.parts;_e.legs.visible=!1;let ve=J(_e.head,new B,0,.3,0);X(ve,q(K.blue),.42,.28,.4,0,0,0,.03),Y(ve,q(K.yellow),.08,.1,.5,0,.26,0),Y(ve,q(`#9fe4ff`),.5,.1,.06,0,-.1,-.38);let ye=[],be=J(r,new B);for(let e of[-1,1]){let t=Z(be,c,.11,.13,.7,e*.97,1.25,1.8,.02,10);t.rotation.z=0,Z(be,o,.1,.1,.05,e*.97,1.62,1.8)}let xe=J(r,new B);Y(xe,i,1.9,.07,.55,0,1.75,2.28,.02);for(let e of[-1,1])Y(xe,o,.07,.5,.2,e*.8,1.5,2.2);let Se=J(r,new B);for(let e of[-1,1])Z(Se,c,.09,.11,.55,e*.77,1.15,1.8,.02,10),Y(Se,q(K.orange),.1,.08,.9,e*.5,1.12,-1.3);Y(Se,o,.55,.22,.45,0,1.18,-1.55,.02),ye.push(be,xe,Se);let Ce=[],we=J(r,new B),Te=q(`#c4cbe0`,e);for(let e of[-1,1]){Y(we,Te,.1,.5,1.5,e*1.04,1,.2,.025);for(let t of[-.4,.8])X(we,o,.06,.06,.06,e*1.1,1.1,t)}let Ee=J(r,new B);Y(Ee,Te,1.6,.35,.18,0,.9,-2.15,.025).rotation.x=-.25,Y(Ee,Te,1,.1,1.1,0,1.12,-1.3,.02);let De=J(r,new B);for(let e of[-1,0,1])Z(De,c,0,.14,.45,e*.7,.58,-2.3,.015,8).rotation.x=-Q/2;for(let e of[-1,1])Y(De,Te,.12,.45,1.6,e*.98,1,1.25,.02);Ce.push(we,Ee,De);let Oe=new B;Oe.position.set(0,1.1,0);let ke=new H(new mo(2.7,20,14),new Kr({color:K.cyan,transparent:!0,opacity:.2,depthWrite:!1,side:2}));ke.scale.set(1,.75,1.35);let Ae=new H(new so(2.72,1),new Kr({color:`#c9f6ff`,transparent:!0,opacity:.35,wireframe:!0,depthWrite:!1}));Ae.scale.copy(ke.scale),Oe.add(ke,Ae),Oe.visible=!1,t.add(Oe);let je=[],Me=zp(`#ff7a1a`,.85),Ne=zp(`#fff2a0`,.95);for(let e of[-1,1]){let t=J(r,new B,e*.55,.62,2.3),n=new H(new Gi(.22,1,10),Me);n.rotation.x=Q/2,n.position.z=.5;let i=new H(new Gi(.11,.7,8),Ne);i.rotation.x=Q/2,i.position.z=.35,t.add(n,i),t.visible=!1,je.push(t)}let Pe=new H(new mo(.6,10,8),zp(`#ffb040`,.35));J(r,Pe,0,.7,2.5).visible=!1,r.traverse(e=>{let t=e;t.isMesh&&t.material.type===`MeshToonMaterial`&&!t.material.transparent&&(t.receiveShadow=!0)});let P=0,Fe=0,Ie=0,Le=0,F=0,Re=0,ze=0,Be=0,Ve=0,He=0,Ue=0,We=0,Ge=0;return{group:t,muzzle:pe,fireKick(){Ve=1},update(i,a,o){let s=o.upgrades;Le+=(o.steer-Le)*Yp(10,i);let c=o.speed;Ge+=c*i/.48;for(let e of j)e.spin.rotation.x=-Ge;for(let e of re)e.rotation.y=-Le*.5;se.rotation.z=Le*1.3;let l=Jp(c/40,0,1.4);Ie+=(+!!o.drifting-Ie)*Yp(8,i),F+=(Le*.04*(.4+l)*(1+Ie*.6)-F)*Yp(6,i),r.rotation.y=-Le*.3*Ie,We+=(+!!o.nitro-We)*Yp(5,i),Re+=(-.02-We*.07-F*0-Re)*Yp(5,i);let u=Math.sin(a*17)*.003*l+Math.sin(a*11.3)*.003*l;n.rotation.z=F,n.rotation.x=Re,n.position.y=.5+u+(o.nitro?.02:0),o.hurt?n.position.x=Math.sin(a*70)*.04:n.position.x=0,$p(M,o.hurt,o.nitro,a),$p(ge,o.hurt,o.nitro,a),em(M,a,.6+l*.6),ie.head.rotation.y=-Le*.35,em(ge,a+1,.6+ +!!o.firing),_e.head.rotation.y=0,ze+=(o.aimYaw-ze)*Yp(24,i),Be+=(o.aimPitch-Be)*Yp(24,i),le.rotation.y=ze,N.rotation.x=Be,Ve=Math.max(0,Ve-i*7),de.position.z=Ve*.28,ue.scale.set(1,1-Ve*.05,1+Ve*.05),ge.position.z=.82+Ve*.05,ye[0].visible=s.engine>=1,ye[1].visible=s.engine>=2,ye[2].visible=s.engine>=3,Ce[0].visible=s.armor>=1,Ce[1].visible=s.armor>=2,Ce[2].visible=s.armor>=3;let d=s.rapid>=1,f=s.rapid>=3;fe[0].visible=fe[1].visible=d,fe[4].visible=fe[5].visible=d,fe[2].visible=fe[3].visible=!d||f,he.visible=s.rapid>=2,me.visible=s.spread>=1,me.scale.setScalar(.7+Math.min(3,s.spread)*.3),He+=(+!!o.nitro-He)*Yp(14,i);for(let e=0;e<je.length;e++){let t=je[e];t.visible=He>.05;let n=He*(.85+.3*Math.sin(a*60+e*2)+.15*Math.sin(a*37));t.scale.set(1,1,Math.max(.01,n*1.6))}if(Pe.visible=He>.05,Pe.scale.setScalar(He*(1.1+.2*Math.sin(a*45))),Ue+=(+!!o.shield-Ue)*Yp(10,i),Oe.visible=Ue>.02,Oe.visible){let e=1+Math.sin(a*5)*.03;Oe.scale.setScalar(Ue*e),Ae.rotation.y=a*.6,ke.material.opacity=.16+.07*Math.sin(a*6)}P+=(+!!o.braking-P)*Yp(18,i),p.color.copy(m).lerp(h,P),g.opacity=P*.55;for(let e of _)e.visible=P>.05,e.scale.setScalar(.8+P*.5);y.rotation.y=Math.sin(a*14)*.35*(.3+l);let v=.3+l*.4+We*.4;for(let e=0;e<k.length;e++){let t=k[e],n=(a*(1.3+l)+e/k.length)%1,r=e&1?1:-1;t.visible=!o.nitro,t.position.set(r*(.55+n*.15),.65+n*.45,2.35+n*(1.2+l*1.6)),t.scale.setScalar(Math.sin(n*Q)*(.06+n*.2)*v*1.6)}let b=Jp(o.damage??0,0,1);Fe+=(b-Fe)*Yp(6,i),C[0].visible=Fe>.2,C[1].visible=Fe>.35,C[2].visible=Fe>.5,C[3].visible=Fe>.65,w.visible=Fe>.5,w.rotation.z=-.35-Math.sin(a*16)*.1*(.3+l),T.visible=Fe>.78,E.visible=Fe>.78,T.rotation.x=-.5-Math.sin(a*13)*.07*(.3+l);for(let e=0;e<ne.length;e++){let t=ne[e];if(t.visible=Fe>.35,!t.visible)continue;let n=(a*.9+e/ne.length)%1;t.position.set(.3+Math.sin(e*2+a)*.15,1.2+n*1.8,-1.1+n*(1.2+l*1.4)),t.scale.setScalar(Math.sin(n*Q)*(.15+n*.5)*(.5+Fe))}for(let e=0;e<A.length;e++){let t=A[e],n=Fe>.7&&Math.sin(a*(23+e*7)+e)>.55;t.visible=n,n&&t.position.set((e&1?1:-1)*(.95+Math.sin(a*40+e)*.1),.55+Math.abs(Math.sin(a*31+e*3))*.3,-1.3+Math.sin(a*27+e)*.3)}if(o.hurt){let n=.5+.5*Math.sin(a*45);Bp(e,.9*n,.05*n,.03*n),t.visible=Math.sin(a*60)>-.6}else Bp(e,0,0,0),t.visible=!0}}}function am(e,t,n){let r=new Kr({color:e});return n.push({mat:r,base:new V(e),hot:new V(t)}),r}function om(e){let t=0,n=Math.random()*10,r=new V,i=0;return{group:e.group,muzzle:e.muzzle,size:e.size,flash(){t=.14},update(a,o,s){let c=Jp(s.telegraph,0,1);i+=s.speed*a/e.wheels[0].r;for(let t of e.wheels)t.spin.rotation.x=-i*(e.wheels[0].r/t.r);let l=Jp(s.speed/30,.2,1.3);e.body.position.y=Math.abs(Math.sin(o*13+n))*e.bounce*l,e.body.rotation.z=Math.sin(o*3+n)*.018+Math.sin(o*9+n)*.008*l,e.body.rotation.x=Math.sin(o*5.5+n)*.01+c*.02,t=Math.max(0,t-a);let u=t/.14,d=Math.max(0,.4-s.hpFrac)/.4*(.5+.5*Math.sin(o*16))*.25;Bp(e.L,Jp(u*.95+c*.35+d,0,1),Jp(u*.95+c*.12+d*.25,0,1),Jp(u*.95,0,1)),e.glow.visible=c>.02,e.glow.visible&&(e.glow.scale.setScalar(.15+c*.55+Math.sin(o*40)*.05*c),e.glow.material.opacity=.5+c*.5);for(let t of e.lights){let e=c>.02?(.5+.5*Math.sin(o*(14+20*c)))*c:0;t.mat.color.copy(t.base).lerp(r.copy(t.hot),Jp(e+u,0,1))}for(let t of e.spinners)t.o.rotation[t.axis]+=a*t.rate*(1+(t.teleBoost??0)*c);if(e.scorch)for(let t=0;t<e.scorch.length;t++)e.scorch[t].visible=s.hpFrac<.8-t*.2;e.anim?.(a,o,c)}}}function sm(e,t){let n=new H(new mo(1,10,8),zp(t,1));return n.visible=!1,e.add(n),n}function cm(){let e=[],t=[],n=new B,r=J(n,new B),i=q(K.purple,e),a=q(`#6a2bc4`,e),o=q(K.red,e),s=q(K.ink,e),c=q(K.steel,e),l=q(K.dark,e);Y(r,s,1.6,.3,3.4,0,.55,.1),Y(r,i,1.95,.5,3.3,0,.8,.1,.04),Y(r,a,1.7,.36,1.3,0,1.12,-1,.04),Y(r,o,.36,.04,1.32,0,1.31,-1);for(let e of[-1,1])Y(r,o,.1,.12,2.6,e*.99,.82,.1),Y(r,i,.34,.12,1,e*1.02,.7,-1.2,.02),Y(r,i,.34,.12,1,e*1.02,.7,1.3,.02),X(r,am(`#ff8a3a`,`#ffffff`,t),.17,.17,.1,e*.62,1,-1.72),Z(r,c,.08,.1,.8,e*.62,1.55,1.58,.015,8).rotation.z=e*.15;Y(r,s,2.05,.3,.3,0,.62,-1.82,.025);for(let e of[-1,-.33,.33,1])Z(r,c,0,.12,.42,e*.7,.62,-2.05,.015,8).rotation.x=-Q/2;Y(r,l,1.3,.6,.3,0,1.2,.8),Y(r,c,1.2,.6,.8,0,1.1,1.45,.03);for(let e of[-1,1])Z(r,s,.05,.05,1.05,e*.88,1.4,0,.01,8),Z(r,s,.05,.05,1.05,e*.88,1.4,1,.01,8);Y(r,s,1.85,.08,1.2,0,1.88,.5,.01);let u=q(K.cream,e),d=q(K.orange,e);X(r,u,.2,.17,.08,0,1,-1.7,.015),Y(r,s,.05,.05,.03,-.07,1.02,-1.78),Y(r,s,.05,.05,.03,.07,1.02,-1.78),Y(r,s,.06,.07,.03,0,.93,-1.78);for(let e=0;e<5;e++)Z(r,c,0,.1,.35,(e-2)*.32,1.33,.15,.012,6);for(let e of[-1,1]){let t=Z(r,c,.09,.1,1.5,e*1.1,.5,.5,.015,8);t.rotation.x=Q/2,Z(r,s,.1,.1,.06,e*1.1,.5,-.25,0,8).rotation.x=Q/2,Y(r,d,.06,.1,1.1,e*1,.95,.1);for(let t=0;t<3;t++)Z(r,c,0,.1,.3,e*1.1,.7+t*.12,-1.2+t*.1,.01,5).rotation.z=e*-Q/2}Y(r,s,1.4,.07,.05,0,1.28,-1.72);let f=tm(e);f.scale.setScalar(.62),f.position.set(0,.8,.55),r.add(f),Y(r,s,.42,.36,.5,0,1.3,-.65,.025);let p=Z(r,c,.1,.12,1.1,0,1.36,-1.4,.02,10);p.rotation.x=Q/2;let m=J(r,new fn,0,1.36,-1.98),h=sm(m,`#ff7a1a`),g=Z(r,s,.025,.03,1.2,.85,1.9,1.7,0,6),_=J(r,new B,.85,2.3,1.7);Y(_,s,.03,.4,.7,0,0,.35),Y(_,q(K.white,e),.04,.16,.16,0,.04,.3),g.castShadow=!1;let v=[];for(let[t,n,i]of[[-1,-1.25,.5],[1,-1.25,.5],[-1,1.3,.58],[1,1.3,.58]]){let a=Xp(i,.46,e,K.red);J(r,a.root,t*1,i,n),v.push(a)}return om({group:n,body:r,L:e,wheels:v,muzzle:m,glow:h,lights:t,spinners:[],bounce:.045,size:{w:2.4,h:1.9,l:3.8},anim(e,t,n){_.rotation.y=Math.sin(t*9)*.3,f.position.y=.8+Math.sin(t*13)*.02,f.rotation.z=Math.sin(t*17)*.03*(1+n*3)}})}function lm(){let e=[],t=[],n=new B,r=J(n,new B),i=q(`#d65a1e`,e),a=q(K.ink,e),o=q(`#aab2c8`,e),s=q(K.dark,e),c=q(K.wood,e),l=q(`#ffd54a`,e),u=q(K.red,e);Y(r,a,2.2,.4,4.6,0,.8,0),Y(r,i,2.5,1.5,1.5,0,1.75,-.95,.045),Y(r,i,2.4,.9,1.1,0,1.2,-2,.045),Y(r,s,2.1,.55,.06,0,2,-1.72),J(r,new H(new Hi(2.1,.55,.06),new Eo({color:`#9fe4ff`,transparent:!0,opacity:.5})),0,2.15,-1.72),Y(r,a,2,.6,.1,0,1.15,-2.58);for(let e=-2;e<=2;e++)Y(r,o,.08,.5,.06,e*.35,1.15,-2.64);Y(r,o,2.9,.4,.5,0,.7,-2.65,.03);let d=Y(r,o,2.9,.9,.2,0,.95,-2.95,.03);d.rotation.x=-.35;for(let e of[-1,0,1])Z(r,o,0,.16,.5,e*1.1,.85,-3.2,.015,8).rotation.x=-Q/2;for(let e of[-1,1]){X(r,am(`#fff3a0`,`#ffffff`,t),.2,.2,.1,e*.9,1.35,-2.6),Z(r,a,.09,.11,1.1,e*1,2.9-.2,-.35,.02,8),Y(r,o,.12,.8,1.3,e*1.28,1.7,-.95,.03),Y(r,o,.12,.5,2.6,e*1.4,1,1.1,.03);for(let t of[-.4,1.9])X(r,a,.07,.07,.07,e*1.47,1.2,t)}let f=nm(e);f.scale.setScalar(.62),f.position.set(0,1,-.9),r.add(f);let p=new B;p.position.set(0,1,-.25),X(p,o,.36,.2,.34,0,.32,0),Y(p,u,.08,.1,.5,0,.5,0),f.add(p),Y(r,c,2.7,.22,2.8,0,1,1.35,.03);for(let e of[-1,1])Y(r,o,.14,.9,2.8,e*1.35,1.5,1.35,.025);Y(r,o,2.8,.9,.14,0,1.5,2.75,.025);for(let e=0;e<2;e++)for(let t=0;t<2;t++){let n=Z(r,l,.62,.62,1.1,(e-.5)*1.15,1.8,.65+t*1.35,.03);n.rotation.z=Q/2,Z(r,a,.63,.63,.1,(e-.5)*1.15,1.8,.65+t*1.35).rotation.z=Q/2}let m=q(K.yellow,e);for(let e=-3;e<=3;e++){let t=Y(r,e%2?a:m,.28,.85,.06,e*.4,.95,-3.05);t.rotation.x=-.35,t.rotation.z=.3}for(let e of[-1,1]){Z(r,o,.12,.14,1.6,e*1.1,3,.3,.02,8),Z(r,a,.17,.17,.08,e*1.1,3.82,.3,0,8),X(r,am(`#ffe9a0`,`#ffffff`,t),.16,.16,.16,e*.8,2.6,-1.5);for(let t=0;t<3;t++)X(r,a,.05,.05,.05,e*1.36,.85+t*.001,-.3+t*.9)}let h=Y(r,a,.05,.05,.5,0,.6,2.95);h.rotation.x=.4,Y(r,a,.8,.4,.9,0,2.6,-.95,.03);let g=J(r,new B,0,2.72,-.95),_=Z(g,o,.22,.28,1.7,0,0,-.85,.03,12);_.rotation.x=Q/2,Z(g,a,.32,.32,.18,0,0,-1.7,.02,12).rotation.x=Q/2;let v=J(g,new fn,0,0,-1.8),y=sm(v,`#ff5a1a`),b=[];for(let[t,n,i]of[[-1,-1.55,.72],[1,-1.55,.72],[-1,1.4,.74],[1,1.4,.74]]){let a=Xp(i,.6,e,K.yellow);J(r,a.root,t*1.2,i,n),b.push(a)}return om({group:n,body:r,L:e,wheels:b,muzzle:v,glow:y,lights:t,spinners:[],bounce:.035,size:{w:3,h:2.8,l:4.8},anim(e,t,n){g.position.z=-.95+n*.12,f.position.y=1+Math.sin(t*11)*.02,d.rotation.x=-.35+Math.sin(t*20)*.015}})}function um(){let e=[],t=[],n=new B,r=J(n,new B),i=q(K.red,e),a=q(K.yellow,e),o=q(K.ink,e),s=q(`#b4bcd2`,e),c=q(K.dark,e),l=q(K.orange,e),u=[];Y(r,o,3.8,.5,6,0,1,.3),Y(r,i,4.2,1.8,4,0,2,1.2,.06),Y(r,a,4.26,.3,4,0,2.3,1.2),Y(r,a,3.6,1.7,2.4,0,3.55,2.2,.06),Y(r,l,3.7,.25,2.5,0,4.4,2.2,.04),Z(r,s,.28,.28,3.2,1.9,3.8,.5,.03,10).rotation.x=Q/2.6,Y(r,c,2.3,1.5,1.8,0,3.15,-.5,.05),J(r,new H(new Hi(2,1.1,.06),new Eo({color:`#9fe4ff`,transparent:!0,opacity:.45})),0,3.25,-1.42);for(let e of[-1,1])Y(r,o,.06,1.1,1.5,e*1.12,3.25,-.5);Y(r,o,2.5,.16,2,0,3.98,-.5,.025);let d=rm(e);d.scale.setScalar(.85),d.position.set(0,2.45,-.15),r.add(d);let f=new B;f.position.set(0,1.4,-.8),X(f,s,.5,.28,.42,0,.42,.02);for(let e of[-1,0,1])Z(f,o,0,.09,.3,e*.25,.7,.02,.01,6);d.add(f);for(let[e,n,i]of[[-1,`#ff2a2a`,`#ffffff`],[1,`#2a6bff`,`#ffffff`]]){Z(r,o,.26,.3,.14,e*.85,4.15,.1),X(r,am(n,i,t),.24,.24,.24,e*.85,4.35,.1);let a=new B;a.position.set(e*.85,4.35,.1);let s=new H(new Gi(.4,1.8,10,1,!0),zp(n,.35));s.rotation.z=Q/2,s.position.x=.9,a.add(s),r.add(a),u.push({o:a,axis:`y`,rate:6*-e,teleBoost:2})}let p=J(r,new B,0,4.2,-.5),m=Z(p,s,.24,.3,2.2,0,0,-1.2,.035,12);m.rotation.x=Q/2,Z(p,o,.36,.36,.2,0,0,-2.3,.02,12).rotation.x=Q/2,Y(p,o,.9,.5,.9,0,-.1,.1,.03);let h=J(p,new fn,0,0,-2.5),g=sm(h,`#ff4a1a`),_=J(r,new B,0,0,0);Y(_,a,6,.8,.9,0,1.15,-2.6,.05),Y(_,o,6,.7,.3,0,1,-3,.03);let v=J(_,new B,0,2.05,-3);Z(v,o,.3,.3,5.6,0,0,0,.02,10).rotation.z=Q/2;for(let e=0;e<6;e++){let t=J(v,new B);t.rotation.x=e/6*Q*2,Y(t,e%2?i:l,5.4,.12,.7,0,.9,0,.025),Y(t,s,5.4,.1,.1,0,.55,0)}u.push({o:v,axis:`x`,rate:4.5,teleBoost:.6});let y=J(_,new B,0,.62,-3.3);for(let e=0;e<22;e++)Z(y,s,0,.17,.5,(e-10.5)*.27,0,0,.01,6).rotation.x=-Q/2;for(let e of[-1,1]){let t=J(_,new B,e*3.1,1.15,-3.3),n=Z(t,s,.95,.95,.14,0,0,0,.04,20);n.rotation.z=Q/2;for(let e=0;e<12;e++){let n=e/12*Q*2,r=Z(t,o,0,.13,.3,0,Math.cos(n)*1,Math.sin(n)*1,0,5);r.rotation.x=n-Q/2+Q,r.rotation.x=n,r.rotation.z=0}Z(t,i,.25,.25,.2,0,0,0).rotation.z=Q/2,u.push({o:t,axis:`x`,rate:14*e,teleBoost:.8})}let b=J(r,new B,0,3.55,-2.05);Y(b,o,1.1,.2,.9,0,-.35,0,.03);let x=new Kr({color:`#ffd24a`}),S=new H(new so(.34,1),x);b.add(S);let C=new H(new mo(.75,12,9),zp(`#ff5a1a`,.5));b.add(C);let w=new H(new ho(.55,.05,6,20),zp(`#fff2a0`,.9));b.add(w);let T=Y(b,s,.55,.14,.9,-.28,.32,0,.03),E=Y(b,s,.55,.14,.9,.28,.32,0,.03);for(let e of[-1,1])Y(b,o,.1,.5,.9,e*.58,0,0,.02);S.visible=C.visible=w.visible=!1,Z(r,o,.2,.26,1.4,-1.5,3.6,.1,.02,8);for(let e=-4;e<=4;e++)Y(_,e%2?o:i,.5,.16,.06,e*.6,1.45,-3.08);for(let e of[-1,1])Z(r,s,.08,.1,1.2,e*1.6,4.7,2.2,.015,6);let D=[],ee=q(`#2a1a1a`,e);for(let[e,t,n,i,a]of[[-2.12,2.1,.6,.06,.9],[2.12,2.5,1.8,.06,.8],[.6,3.5,3.44,1,.7],[-1,4,-1.55,1.2,.1]]){let o=n>3?Y(r,ee,i,a,.06,e,t,n):t>3.9?Y(r,ee,i,.06,.6,e,t+.5,n):Y(r,ee,i,a,1,e,t,n);o.visible=!1,D.push(o)}let te=[];for(let[t,n,i,a]of[[-1,-.3,1.1,.9],[1,-.3,1.1,.9],[-1,3,.75,.65],[1,3,.75,.65]]){let o=Xp(i,a,e,K.yellow);J(r,o.root,t*(i>1?2.5:2),i,n),te.push(o)}return om({group:n,body:r,L:e,wheels:te,muzzle:h,glow:g,lights:t,spinners:u,scorch:D,bounce:.06,size:{w:6,h:4.5,l:7},anim(e,t,n){y.position.x=Math.sin(t*28)*.12,p.position.z=-.5+n*.2,d.position.y=2.45+Math.sin(t*10)*.03,d.rotation.z=Math.sin(t*20)*.03*(.3+n);let r=Jp((n-.05)/.4,0,1);T.position.x=-.28-r*.42,E.position.x=.28+r*.42,T.rotation.z=r*.6,E.rotation.z=-r*.6;let i=r>.02;if(S.visible=C.visible=w.visible=i,i){let e=.5+.5*Math.sin(t*(14+20*n));S.scale.setScalar(.5+r*.8+e*.15),S.rotation.y=t*4,S.rotation.x=t*3,x.color.setHex(16756784).lerp(Zp.setHex(16777215),e*n),C.scale.setScalar(.4+r*1.1+e*.25),C.material.opacity=.25+.4*r,w.scale.setScalar(.7+r*.6+e*.15),w.rotation.x=Q/2+Math.sin(t*5)*.4,w.rotation.z=t*3}}})}function dm(e){return e===`boss`?um():e===`heavy`?lm():cm()}function fm(){let e=new B,t=q(K.orange),n=q(K.ink),r=q(K.yellow),i=q(`#c96a00`);Z(e,t,.65,.62,1.3,0,.65,0,.035,16);for(let t of[.25,1.05])Z(e,n,.665,.665,.1,0,t,0,0,16);Z(e,i,.58,.58,.06,0,1.31,0,0,16),Z(e,r,.1,.1,.12,.25,1.36,.2,.01,8);let a=X(e,zp(`#fff0a0`,.9),.1,.1,.1,-.2,1.42,-.1);a.castShadow=!1;for(let t of[-1,1]){let i=Z(e,r,.3,.3,.05,0,.65,t*.64,.015,14);i.rotation.x=Q/2;let a=Z(e,n,0,.17,.34,0,.66,t*.68,0,6);a.rotation.x=t*Q/2,a.scale.set(.17,.05,.17),Y(e,q(K.red),.5,.14,.04,0,.9,t*.64)}return e}var pm=new Map;function mm(e){let t=Math.abs(Math.floor(e))%8,n=pm.get(t);if(!n){let e=qp(t+11),r=new so(1,1),i=r.attributes.position,a=new Map;for(let t=0;t<i.count;t++){let n=i.getX(t).toFixed(3)+i.getY(t).toFixed(3)+i.getZ(t).toFixed(3),r=a.get(n);r===void 0&&(r=.82+e()*.36,a.set(n,r)),i.setXYZ(t,i.getX(t)*r,i.getY(t)*r,i.getZ(t)*r)}n=r.toNonIndexed(),n.computeVertexNormals(),pm.set(t,n)}let r=new B,i=new H(n,q([`#9aa0b4`,`#8a90a6`,`#a8aec0`][t%3]));i.scale.set(1.1,.78,1),i.rotation.y=t*.9,i.castShadow=!0,Gp(i,.04),J(r,i,0,.62,0);let a=qp(t+3);for(let e=0;e<2;e++){let e=new H(n,q(`#7e849a`));e.scale.setScalar(.28+a()*.14),J(r,e,(a()-.5)*2.4,.2,.9+a()*.2)}return X(r,q(`#5fb04a`),.55,.12,.45,-.2,1.3,.1),r}function hm(){let e=new B,t=q(`#ffd54a`),n=q(`#ffe58a`),r=q(K.ink),i=Z(e,t,.8,.8,2,0,.8,0,.04,18);i.rotation.z=Q/2;for(let t of[-1,1]){let i=Z(e,n,.74,.74,.06,t*1,.8,0,0,18);i.rotation.z=Q/2;for(let n of[.2,.45,.68]){let i=new H(new ho(n,.018,4,20),r);i.rotation.y=Q/2,J(e,i,t*1.035,.8,0)}}for(let t of[-.55,.55]){let n=Z(e,r,.83,.83,.1,t,.8,0,0,18);n.rotation.z=Q/2}let a=qp(5);for(let n=0;n<5;n++){let n=Y(e,t,.05,.28,.05,(a()-.5)*1.8,1.55+a()*.1,(a()-.5)*.6);n.rotation.z=(a()-.5)*.8}return e}function gm(){let e=new B,t=qp(42),n=[],r=[t()*6,t()*6,t()*6];for(let e=0;e<22;e++){let t=e/22*Q*2,i=1.75+.22*Math.sin(t*3+r[0])+.14*Math.sin(t*5+r[1])+.08*Math.sin(t*2+r[2]);n.push(new R(Math.cos(t)*i,Math.sin(t)*i))}let i=new fo(new Ca(n));i.rotateX(-Q/2);let a=new H(i,new Eo({color:`#17172e`,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));a.position.y=.02,e.add(a);for(let[t,n,r,i,a]of[[`#7a5cff`,-.5,.4,.9,.5],[`#38e1ff`,.5,-.3,.8,.4],[`#ff5ca8`,.1,.8,.5,.3]]){let o=new H(new Ui(1,14),new Kr({color:t,transparent:!0,opacity:.28,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));o.rotation.x=-Q/2,o.scale.set(i,a,1),o.position.set(n,.03,r),e.add(o)}let o=new H(new Ui(1,10),new Kr({color:`#ffffff`,transparent:!0,opacity:.4,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-5,polygonOffsetUnits:-5}));return o.rotation.x=-Q/2,o.scale.set(.45,.18,1),o.position.set(-.8,.035,-.6),e.add(o),e.userData.size=4,e.userData.radius=2,e}function _m(){let e=new B,t=new H(new mo(.28,10,8),new Kr({color:`#ffe0d0`})),n=new H(new mo(.4,10,8),zp(`#ff2a1a`,.85)),r=new H(new mo(.62,10,8),zp(`#ff5a2a`,.28)),i=new H(new Gi(.34,1.8,10,1,!0),zp(`#ff4a1a`,.45));i.rotation.x=Q/2,i.position.z=.9;let a=new H(new Gi(.18,2.6,8,1,!0),zp(`#ffb050`,.5));return a.rotation.x=Q/2,a.position.z=1.3,e.add(t,n,r,i,a),e.position.y=0,e.userData.parts={halo:r,mid:n,trail:i},e}function vm(e,t){let n=e.userData.parts;n.halo.scale.setScalar(1+Math.sin(t*30)*.15),n.trail.scale.set(1,1,.9+Math.sin(t*40)*.15)}var ym={engine:K.orange,armor:K.blue,rapid:K.yellow,spread:K.purple,shield:K.cyan,repair:K.green};function bm(e){let t=new B,n=ym[e],r=J(t,new B,0,1,0),i=J(r,new B);Y(i,q(K.wood),.95,.95,.95,0,0,0,.045);let a=q(n);for(let e of[-1,1])Y(i,a,.1,1,1,e*.43,0,0),Y(i,a,1,.1,1,0,e*.43,0),Y(i,a,1,1,.1,0,0,e*.43);let o=J(r,new B,0,.95,0),s=q(K.white),c=q(K.ink),l=q(n);switch(e){case`engine`:{let e=Z(o,l,.28,.28,.14,0,0,0,.03,12);e.rotation.x=Q/2;for(let e=0;e<8;e++){let t=e/8*Q*2,n=Y(o,l,.12,.12,.14,Math.cos(t)*.34,Math.sin(t)*.34,0,.02);n.rotation.z=t}Z(o,c,.1,.1,.16,0,0,0).rotation.x=Q/2;break}case`armor`:{Y(o,l,.55,.42,.14,0,.1,0,.03);let e=Z(o,l,.275,0,.35,0,-.25,0,.03,4);e.rotation.y=Q/4,e.scale.z=.25,Y(o,s,.12,.34,.16,0,.1,.01);break}case`rapid`:for(let e of[-.22,0,.22])Z(o,l,.09,.09,.4,e,0,0,.025,8),Z(o,q(K.orange),0,.09,.2,e,.3,0,.02,8);break;case`spread`:for(let e of[-.6,0,.6]){let t=J(o,new B);t.rotation.z=e,Z(t,l,0,.1,.3,0,.38,0,.025,8),Z(t,s,.04,.04,.3,0,.1,0,0,6)}X(o,c,.1,.1,.1,0,-.1,0);break;case`shield`:{let e=new H(new mo(.4,14,10),zp(n,.55,!1));o.add(e);let t=new H(new co(.2),q(K.white));t.scale.y=1.5,o.add(t);break}case`repair`:Y(o,s,.5,.18,.16,0,0,0,.03),Y(o,s,.18,.5,.16,0,0,0,.03),Y(o,l,.4,.1,.18),Y(o,l,.1,.4,.18)}let u=new H(new ho(.85,.035,6,24),zp(n,.7));return u.rotation.x=Q/2,J(t,u,0,.12,0),t.userData.flt=r,t.userData.icon=o,t.userData.halo=u,t.userData.kind=e,t.userData.phase=Math.random()*6,t}function xm(e,t){let n=e.userData,r=n.phase??0,i=n.flt;i.position.y=1+Math.sin(t*2.6+r)*.18,i.rotation.y=t*1.8+r,i.rotation.z=Math.sin(t*1.7+r)*.1,n.icon.rotation.y=t*2.4;let a=n.halo;a.scale.setScalar(1+Math.sin(t*4+r)*.12),a.rotation.z=t*.8}function Sm(e){let t=0,n=0,r=Math.random()*10,i=new V;return{group:e.group,muzzle:e.muzzle,size:e.size,flash(){t=.14},update(a,o,s){let c=Jp(s.telegraph,0,1);n+=a*e.propRate*(1+c*.4),e.prop.rotation.z=n,e.body.position.y=Math.sin(o*2.6+r)*e.bob,e.body.rotation.z=Math.sin(o*1.7+r)*.09,e.body.rotation.x=Math.sin(o*2.1+r)*.04+c*.06,t=Math.max(0,t-a);let l=t/.14,u=Math.max(0,.4-s.hpFrac)/.4*(.5+.5*Math.sin(o*16))*.25;Bp(e.L,Jp(l*.95+c*.3+u,0,1),Jp(l*.95+c*.1+u*.25,0,1),Jp(l*.95,0,1)),e.glow.visible=c>.02,e.glow.visible&&(e.glow.scale.setScalar(.12+c*.45+Math.sin(o*40)*.04*c),e.glow.material.opacity=.5+c*.5);for(let t of e.lamps){let e=c>.02?(.5+.5*Math.sin(o*(14+20*c)))*c:0;t.mat.color.copy(t.base).lerp(i.copy(t.hot),Jp(e+l,0,1))}e.extra?.(o,c,s.hpFrac)}}}function Cm(e,t,n,r,i,a,o,s){let c=new Kr({color:n}),l=new H(new mo(i,8,6),c);l.position.set(a,o,s),e.add(l),t.push({mat:c,base:new V(n),hot:new V(r)})}function wm(e,t,n,r,i,a=2){let o=J(e,new B,0,i,r),s=q(K.wood,t),c=q(K.yellow,t);for(let e=0;e<a;e++){let t=J(o,new B);t.rotation.z=e/a*Math.PI*2,Y(t,s,.14,n/2,.05,0,n/4,0,.01),Y(t,c,.15,n*.09,.06,0,n*.46,0)}X(o,q(K.ink,t),.12,.12,.14,0,0,-.03);let l=new H(new Ui(n/2,18),zp(`#ffffff`,.12,!1));return l.position.z=0,o.add(l),o}function Tm(){let e=[],t=new B,n=J(t,new B,0,.8,0),r=q(K.blue,e),i=q(K.ink,e),a=q(K.yellow,e),o=q(K.red,e),s=q(K.cream,e),c=q(K.orange,e),l=q(K.steel,e),u=[];X(n,r,.5,.42,.95,0,0,.1,.04),X(n,o,.4,.34,.3,0,0,-.85,.03),Z(n,r,.08,.2,1,0,.02,1,.03).rotation.x=Math.PI/2,Y(n,a,.07,.55,.45,0,.35,1.38,.025),Y(n,a,1,.07,.38,0,.04,1.38,.025),Y(n,i,.6,.12,.5,0,.36,0),X(n,i,.26,.26,.27,0,.62,0,.03);let d=Z(n,c,.0101,.1,.34,0,.58,-.3,.015,6);d.rotation.x=-Math.PI/2;for(let e of[-1,1])X(n,s,.1,.1,.06,e*.1,.68,-.2),X(n,i,.04,.04,.04,e*.1,.68,-.25),X(n,a,.12,.12,.03,e*.1,.68,-.22).scale.z=.02;Y(n,o,.5,.06,.1,0,.5,-.1);let f=(e,t,r)=>{Y(n,r,2.6,.08,.7,0,e,t,.03);for(let r of[-1,1])Y(n,o,.05,.1,.72,r*1.3,e,t)};f(.5,-.05,a),f(-.3,-.05,r);for(let e of[-1,1])for(let t of[-.2,.15])Y(n,i,.05,.86,.05,e*.95,.1,-.05+t);Cm(n,u,`#ff3b30`,`#ffffff`,.06,-1.3,-.3,-.05),Cm(n,u,`#2fc65a`,`#ffffff`,.06,1.3,-.3,-.05);for(let e of[-1,1])Y(n,l,.05,.4,.05,e*.3,-.55,-.3),Z(n,i,.17,.17,.1,e*.3,-.75,-.3,.02,10).rotation.z=Math.PI/2;let p=wm(n,e,1.5,-1.05,0,2),m=Z(n,i,.07,.09,.8,0,-.42,-.55,.02,8);m.rotation.x=Math.PI/2,Y(n,l,.2,.14,.3,0,-.35,-.3,.02);let h=J(n,new fn,0,-.42,-1),g=new H(new mo(1,10,8),zp(`#ff5a2a`,1));return g.visible=!1,h.add(g),t.traverse(e=>{e.castShadow=!0}),Sm({group:t,body:n,L:e,muzzle:h,glow:g,size:{w:2.6,h:1.6,l:2.6},bob:.12,lamps:u,prop:p,propRate:55})}function Em(){let e=[],t=new B,n=J(t,new B,0,.9,0),r=q(K.red,e),i=q(`#b3231c`,e),a=q(K.ink,e),o=q(K.yellow,e),s=q(K.cream,e),c=q(K.orange,e),l=q(K.steel,e),u=q(K.purple,e),d=[];X(n,r,.8,.7,1.5,0,0,.1,.05),X(n,i,.62,.55,.55,0,-.05,-1.3,.04),Z(n,r,.14,.4,1.3,0,.05,1.55,.04).rotation.x=Math.PI/2,Y(n,a,1.62,.18,.4,0,.12,.15,0),X(n,s,.38,.3,.5,0,.62,.25,.03).scale.y=.8,X(n,a,.2,.2,.2,0,.7,.22,.02),Y(n,a,.55,.05,.55,0,.9,.22),Z(n,u,.16,.2,.2,0,1,.22,.02,8);for(let e of[-1,1])X(n,o,.05,.05,.03,e*.08,.74,.01);Y(n,o,4,.12,1.1,0,.5,-.15,.04),Y(n,c,4,.125,.18,0,.5,-.55);for(let e of[-1,1])Y(n,r,.12,.14,1.12,e*1.98,.5,-.15),Y(n,a,.05,.5,.05,e*.9,.2,-.2),Y(n,l,.08,.08,.7,e*1.4,.38,-.15),Cm(n,d,e<0?`#ff3b30`:`#2fc65a`,`#ffffff`,.07,e*1.98,.5,-.78);Y(n,r,.1,.8,.6,0,.55,2,.03),Y(n,o,1.7,.1,.55,0,.12,2,.03);let f=J(n,new B,0,.5,2.3);Y(f,c,.08,.7,.3,0,.05,.14,.02);let p=[];for(let e of[-1,1]){let t=J(n,new B,e*.85,.12,2.28);Y(t,c,.8,.07,.28,e*-.4+e*.4,0,.14),p.push(t)}for(let e of[-1,1])Y(n,l,.07,.6,.07,e*.55,-.6,-.3),Z(n,a,.26,.26,.16,e*.55,-.9,-.3,.03,12).rotation.z=Math.PI/2;let m=wm(n,e,2.1,-1.65,-.05,3);Y(n,l,.9,.08,1.2,0,-.62,.3,.02);for(let e of[-1,1])Y(n,a,.05,.14,.05,e*.3,-.55,.3);let h=J(n,new fn,0,-.85,.3),g=[];for(let e of[-.35,0,.35]){let t=km();t.scale.setScalar(.55),t.position.set(0,-.85,.3+e),t.rotation.y=Math.PI/2,n.add(t),g.push(t)}let _=new H(new mo(1,10,8),zp(`#ff5a2a`,1));return _.visible=!1,_.position.y=-.1,h.add(_),t.traverse(e=>{e.castShadow=!0}),Sm({group:t,body:n,L:e,muzzle:h,glow:_,size:{w:4,h:2.2,l:4},bob:.16,lamps:d,prop:m,propRate:42,extra:(e,t)=>{f.rotation.y=Math.sin(e*1.6)*.4;for(let n=0;n<p.length;n++)p[n].rotation.x=Math.sin(e*2.2+n)*.28+t*.3;for(let t of g)Am(t,e)}})}function Dm(e){return e===`drone`?Tm():Em()}var Om=null;function km(){let e=new B,t=q(`#16162e`),n=q(K.steel),r=q(K.yellow);X(e,t,.4,.4,.4,0,0,0,.03),X(e,q(`#ffffff`),.09,.07,.05,-.15,.18,-.3).rotation.y=.3,Z(e,n,.13,.16,.14,0,.4,0,.02,8),Z(e,r,.41,.41,.07,0,-.05,0,0,14);let i=Z(e,q(K.wood),.025,.025,.28,.06,.58,0,0,5);i.rotation.z=-.5,Om||=new mo(1,8,6);let a=new H(Om,zp(`#ffd21f`,1));a.scale.setScalar(.1),a.position.set(.14,.7,0),e.add(a);let o=new H(Om,zp(`#ff8a00`,.6));return o.scale.setScalar(.18),o.position.copy(a.position),e.add(o),e.userData.update=e=>{let t=.7+.5*Math.sin(e*38)*Math.sin(e*23);a.scale.setScalar(.09*t+.03),o.scale.setScalar(.17*t+.05)},e}function Am(e,t){let n=e.userData.update;n&&n(t)}function jm(e,t,n){let r=document.createElement(`canvas`);r.width=e,r.height=t,n(r.getContext(`2d`));let i=new Ri(r);return i.colorSpace=Be,i}function Mm(e){return jm(128,128,t=>{t.fillStyle=e,t.fillRect(0,0,128,128),t.strokeStyle=K.ink,t.lineWidth=6,t.strokeRect(3,3,122,122),t.fillStyle=K.cream,t.strokeStyle=K.ink,t.lineWidth=5,t.beginPath(),t.arc(64,54,30,0,Math.PI*2),t.fill(),t.stroke(),t.fillRect(48,76,32,22),t.strokeRect(48,76,32,22),t.fillStyle=K.ink,t.beginPath(),t.arc(52,54,8,0,Math.PI*2),t.arc(76,54,8,0,Math.PI*2),t.fill(),t.fillRect(60,66,8,8);for(let e=0;e<3;e++)t.fillRect(55+e*9,84,3,12);t.lineWidth=7,t.beginPath(),t.moveTo(22,108),t.lineTo(106,112),t.moveTo(22,112),t.lineTo(106,108),t.stroke()})}function Nm(e,t,n,r,i,a,o,s=0){let c=new H(new lo(e,t),new Kr({map:n,side:2}));return c.rotation.y=s,J(r,c,i,a,o)}function Pm(e,t,n,r,i,a=`#8a8a9c`){let o=[],s=new B;J(e,s,t,n,r);for(let e=0;e<i;e++){let e=new H(new so(1,0),zp(a,.6,!1));s.add(e),o.push(e)}return{tick(e,t,n=2.4){if(s.visible=t>.02,s.visible)for(let r=0;r<i;r++){let a=(e*.55+r/i)%1;o[r].position.set(Math.sin(a*5+r)*.25*a*2,a*n,Math.cos(a*4+r*2)*.2*a),o[r].scale.setScalar((.18+a*.5)*(.5+t*.5)),o[r].material.opacity=(1-a)*.6*t}}}}function Fm(e,t,n,r,i,a=1){let o=new B;J(e,o,n,r,i),o.scale.setScalar(a);let s=q(K.cream,t),c=q(K.ink,t),l=q(`#e9c7a0`,t),u=q(K.purple,t);return X(o,s,.5,.45,.5,0,.5,0,.03),X(o,s,.3,.3,.3,-.3,.7,.1),X(o,s,.3,.3,.3,.3,.7,.1),X(o,l,.28,.3,.3,0,1,-.2,.025),Y(o,c,.52,.12,.06,0,1.04,-.46),Y(o,q(K.white,t),.07,.07,.04,-.1,1.05,-.5),Y(o,q(K.white,t),.07,.07,.04,.1,1.05,-.5),X(o,l,.1,.06,.16,-.32,1.02,-.18),X(o,l,.1,.06,.16,.32,1.02,-.18),Z(o,u,.12,.3,.3,0,1.38,-.2,.02,8),Z(o,u,.4,.4,.05,0,1.24,-.2,.02,10),o}function Im(e,t=.9){let n=0,r=Math.random()*10;return{group:e.group,muzzle:e.muzzle,size:e.size,flash(){n=.14},update(i,a,o){let s=Jp(o.telegraph,0,1);n=Math.max(0,n-i);let c=n/.14,l=Jp((.5-o.hpFrac)/.5,0,1),u=l*(.5+.5*Math.sin(a*14+r))*.22;Bp(e.L,Jp(c*t+s*.3+u,0,1),Jp(c*t+s*.1+u*.2,0,1),Jp(c*t,0,1)),e.glow.visible=s>.02,e.glow.visible&&(e.glow.scale.setScalar(.2+s*.5+Math.sin(a*40)*.05*s),e.glow.material.opacity=.5+s*.5),e.anim(i,a,o,s,l)}}}function Lm(e,t,n,r,i){let a=new H(new mo(1,10,8),zp(i,1));return a.visible=!1,J(e,a,t,n,r)}function Rm(e,t,n,r,i,a,o=1.1,s=.65){let c=new B;return J(e,c,n,r,i),Y(Y(c,q(a,t),o,s,.04,o/2,0,0),q(K.ink,t),.2,.2,1.6,-.25,0,0),c}function zm(){let e=[],t=new B,n=J(t,new B),r=q(K.wood,e),i=q(`#8a5428`,e),a=q(K.red,e),o=q(K.ink,e),s=q(K.steel,e);for(let e of[-1,1])for(let t of[-1,1])Y(n,r,.28,4.6,.28,e*1.05,2.2,t*1.05,.03).rotation.set(-t*.05,0,e*.05);for(let e of[1.2,2.8]){for(let t of[-1,1])Y(n,i,2.2,.16,.14,0,e,t*1.04);for(let t of[-1,1])Y(n,i,.14,.16,2.2,t*1.04,e,0)}let c=Y(n,i,.12,3,.1,0,2,-1.06);c.rotation.z=.78;let l=Y(n,i,.12,3,.1,0,2,-1.06);l.rotation.z=-.78,Y(n,r,3,.22,3,0,4.5,0,.04);let u=[];for(let e=0;e<5;e++)u.push(Y(n,i,2.6,.1,.42,0,4.66,-1.05+e*.52));let d=[];for(let e of[5,5.5])d.push(Y(n,r,3,.1,.1,0,e,-1.45)),d.push(Y(n,r,3,.1,.1,0,e,1.45)),d.push(Y(n,r,.1,.1,3,-1.45,e,0)),d.push(Y(n,r,.1,.1,3,1.45,e,0));for(let e of[-1,1])for(let t of[-1,1])Y(n,r,.2,2.6,.2,e*1.4,5.7,t*1.4,.03);let f=Z(n,a,.08,2.6,1.3,0,6.85,0,.04,4);f.rotation.y=Math.PI/4,f.position.y=6.35,Fm(n,e,0,4.6,.3,1.05);let p=new B;J(n,p,.45,5.45,-.5),Y(p,o,.22,.26,1,0,0,-.1,.02);let m=Z(p,s,.09,.1,1.9,0,0,-1.4,.02,10);m.rotation.x=Math.PI/2;let h=Y(p,q(K.cyan,e),.1,.1,.1,0,.2,-.2),g=J(p,new fn,0,0,-2.4),_=Lm(p,0,0,-2.45,K.red),v=new H(new Wi(.115,.125,.5,10),zp(K.orange,0,!0));v.rotation.x=Math.PI/2,J(p,v,0,0,-1.9),Z(n,r,.05,.06,1.4,1.3,7.3,1.3,.02,6);let y=Rm(n,e,1.3,7.55,1.3,K.purple),b=[Y(n,q(`#1b1b2a`,e),1.1,.5,.06,-.5,3.4,-1.22),Y(n,q(`#1b1b2a`,e),.7,1,.06,.7,5.2,-1)],x=Pm(n,.9,5.2,.4,6,`#55556a`),S=Pm(n,-.9,4.8,1,4,`#ff8a00`);return Im({group:t,body:n,L:e,muzzle:g,glow:_,size:{w:3,h:7,l:3},anim(e,t,r,i,a){let o=.012+a*.05;n.rotation.z=Math.sin(t*2.2)*o+a*.03,n.rotation.x=Math.sin(t*1.7+1)*o*.7,p.rotation.y=Math.sin(t*.9)*.08*(1-i),p.position.z=-.5+i*.12,v.material.opacity=i*(.6+.4*Math.sin(t*30)),h.rotation.y=t*3,y.rotation.y=Math.sin(t*6)*.35,y.rotation.z=Math.sin(t*4.3)*.1,b[0].visible=r.hpFrac<.75,b[1].visible=r.hpFrac<.45,u[1].visible=r.hpFrac>.6,u[3].visible=r.hpFrac>.35,d[1].visible=r.hpFrac>.8,d[6].visible=r.hpFrac>.5,x.tick(t,r.hpFrac<.7?.4+a*.6:0,2.6),S.tick(t,+(r.hpFrac<.3),1.6)}})}function Bm(){let e=[],t=new B,n=J(t,new B),r=q(K.wood,e),i=q(`#8a5428`,e),a=q(`#7a3b2e`,e),o=q(K.ink,e),s=q(K.steel,e);Y(n,q(`#6b6b86`,e),5.2,.35,5.2,0,.17,0,.04),Y(n,r,4.6,2.4,4.6,0,1.55,0,.05);for(let e=-2;e<=2;e++)Y(n,i,.1,2.4,.06,e*.9,1.55,-2.32);Y(n,i,4.7,.18,4.7,0,2.78,0);for(let e of[-1,1]){let t=Y(n,a,2.9,.22,5.4,e*1.2,3.45,0,.05);t.rotation.z=e*-.62}Y(n,o,.3,.3,5.5,0,4,0),Y(n,o,1.5,1.8,.1,0,1.25,-2.28);let c=new B;J(n,c,-.75,1.25,-2.4),Y(c,i,1.5,1.8,.12,.75,0,0,.03),Y(c,q(K.yellow,e),.12,.12,.08,1.3,0,-.08);let l=[Y(n,zp(K.red,0,!1),.1,.1,.05,-.25,1.5,-2.22),Y(n,zp(K.red,0,!1),.1,.1,.05,.25,1.5,-2.22)];for(let e of[-1,1])Y(n,o,.1,.7,.7,e*2.32,1.9,0),Y(n,i,.14,.12,.9,e*2.34,1.9,0);Y(n,s,.7,1.6,.7,1.4,4.1,1.2,.04),Y(n,o,.8,.12,.8,1.4,4.95,1.2);let u=Pm(n,1.4,5.05,1.2,6);Z(n,r,.06,.07,3.2,-2.4,3,-2.4,.02,6);let d=new B;J(n,d,-2.4,4.4,-2.4),Nm(.9,1.3,Mm(K.purple),d,0,-.65,0),Y(d,o,1,.07,.07,0,.02,0),Z(n,r,.4,.42,.9,2.9,.45,-1.8,.03,10),Z(n,r,.4,.42,.9,3.4,.45,-.9,.03,10),Z(n,o,.41,.43,.08,2.9,.6,-1.8,0,10);let f=J(n,new fn,0,1.4,-2.6),p=Lm(n,0,2.2,-2.6,K.orange),m=[Y(n,q(`#1b1b2a`,e),1.2,.8,.06,1.4,2,-2.33),Y(n,q(`#1b1b2a`,e),.06,.9,1.4,-2.33,2.5,1)],h=0;return Im({group:t,body:n,L:e,muzzle:f,glow:p,size:{w:5,h:4,l:5},anim(e,t,r,i,a){h+=(+(i>.55)-h)*Jp(e*10,0,1),c.rotation.y=-h*1.7+(i>.3?Math.sin(t*30)*.03:0);for(let e of l)e.material.opacity=+(h>.4);n.rotation.z=Math.sin(t*9)*.006*(.4+i)+a*Math.sin(t*20)*.01,d.rotation.z=Math.sin(t*4)*.1,d.rotation.x=Math.sin(t*3.1)*.08,m[0].visible=r.hpFrac<.7,m[1].visible=r.hpFrac<.4,u.tick(t,.5+i*.5+a*.5,2.8+i)}})}function Vm(){let e=[],t=new B,n=J(t,new B),r=q(K.wood,e),i=q(`#8a5428`,e),a=q(K.ink,e),o=q(K.red,e),s=q(K.yellow,e);for(let e of[-1,1])Y(n,r,1.6,4.2,1.6,e*6.2,2.1,0,.05),Y(n,i,1.9,.25,1.9,e*6.2,4.2,0),Z(n,o,.05,1.2,1,e*6.2,4.7,0,.04,4).rotation.y=Math.PI/4;let c=[],l=[],u=[],d=qp(7);for(let t=0;t<13;t++){let a=-5.3+t/12*10.6,o=2.7+d()*.9,s=Z(n,t%2?r:i,.34,.38,o,a,o/2,0,.035,8),f=Z(n,q(K.steel,e),.0201,.34,.8,a,o+.35,0,.03,8);c.push(s),u.push(f),l.push(o)}let f=[];for(let e=0;e<6;e++){let t=.7+e%3*.8,r=e<3?1:-1;f.push(Y(n,i,5.3,.3,.14,r*-2.75,t,-.4))}for(let t of[-4.2,-1.4,1.4,4.2]){let r=Z(n,q(K.steel,e),.02,.2,1.8,t,.8,-.95,.03,6);r.rotation.x=-Math.PI/2+.5,r.position.z=-1}Y(n,r,3.4,1.4,.18,0,4.1,-.2,.05),Nm(1.15,1.15,Mm(K.red),n,-.95,4.1,-.32),Nm(2,.75,jm(256,96,e=>{e.fillStyle=K.yellow,e.fillRect(0,0,256,96),e.fillStyle=K.ink,e.font=`bold 44px sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`KEEP OUT`,128,36),e.font=`bold 30px sans-serif`,e.fillText(`BAA-NDITS`,128,72)}),n,.55,4.1,-.32);for(let e of[-1,1])Z(n,a,.04,.04,.9,e*1.4,4.9,-.2,0,4);let p=[];for(let e of[-1,1]){Z(n,a,.03,.03,.6,e*6.2,4,-1,0,4),Y(n,a,.4,.5,.4,e*6.2,3.45,-1),p.push(Kp(n,new Kr({color:K.yellow}),.2,e*6.2,3.45,-1));let t=new H(new mo(.55,10,8),zp(K.orange,.25));J(n,t,e*6.2,3.45,-1),p.push(t)}let m=J(n,new fn,0,3.2,-1.1),h=Lm(n,0,3.2,-1.1,K.red);Y(n,s,1,.1,.1,0,.12,-1);let g=-1;return Im({group:t,body:n,L:e,muzzle:m,glow:h,size:{w:14,h:4,l:2},anim(e,t,r,i,a){let o=Math.floor((1-Jp(r.hpFrac,0,1))*6.99);if(o!==g){g=o;for(let e=0;e<f.length;e++)f[e].visible=e>=o;for(let e=0;e<13;e++){let t=e*5%13<o*1.6;c[e].scale.y=t?.35:l[e],c[e].position.y=c[e].scale.y/2,u[e].visible=!t}}for(let e=0;e<p.length;e++){let n=.85+.15*Math.sin(t*11+e*2.3)+i*.4;p[e].scale.setScalar(n*(e%2,1))}n.rotation.z=a*Math.sin(t*17)*.004}})}function Hm(){let e=[],t=new B,n=J(t,new B),r=q(K.wood,e),i=q(`#8a5428`,e),a=q(K.ink,e),o=q(K.red,e),s=q(K.steel,e),c=q(K.dark,e),l=q(K.purple,e),u=q(K.yellow,e),d=[];Y(n,a,5.2,.4,6.6,0,1.15,.2),Y(n,r,5.6,.55,6.4,0,1.5,.2,.05),Y(n,i,5.7,.14,6.5,0,1.82,.2);for(let e of[-1,1]){Y(n,s,.18,1.1,5.6,e*2.8,2.5,.3,.04);for(let t=0;t<4;t++){let r=Z(n,s,.02,.2,.7,e*3.05,2.9,-1.8+t*1.5,.02,6);r.rotation.z=-e*Math.PI/2}}Y(n,s,5.6,1.1,.18,0,2.5,3.4,.04),Y(n,s,5,1.6,.4,0,2.3,-2.95,.05),Y(n,o,5,.2,.42,0,3.15,-2.95),Nm(1.2,1.2,Mm(K.red),n,0,2.3,-3.17);for(let[t,r]of[[-1,-2],[1,-2],[-1,2.2],[1,2.2]]){let i=Xp(.9,.7,e,K.yellow);J(n,i.root,t*3.05,.9,r),d.push(i)}let f=new B;J(n,f,0,1.9,.9);let p=q(`#e8d8b8`,e),m=q(`#f2e6c8`,e),h=q(`#cfa27a`,e);X(f,p,1.5,1.2,1.4,0,1.2,.4,.05),X(f,p,.95,.9,.95,0,2.5,-.1,.04),X(f,h,.5,.4,.55,0,2.3,-.9,.03),Y(f,a,1.5,.28,.08,0,2.7,-.98);let g=new Kr({color:K.yellow}),_=[Kp(f,g,.1,-.3,2.72,-1.03),Kp(f,g,.1,.3,2.72,-1.03)],v=new ho(.6,.17,6,12,Math.PI*1.4);for(let e of[-1,1]){let t=new H(v,m);t.castShadow=!0,t.position.set(e*.7,2.75,-.1),t.rotation.set(0,e>0?0:Math.PI,e>0?.3:-.3),t.scale.x=1,f.add(t)}Z(f,s,.8,.95,.5,0,3.2,-.1,.04,10),Y(f,o,.2,.55,1.2,0,3.7,-.1);let y=Y(f,p,.4,1,.4,-1.3,1.5,-.3,.03),b=Y(f,p,.4,1,.4,1.3,1.5,-.3,.03);y.rotation.z=.4,b.rotation.z=-.4;let x=new B;J(n,x,0,3.3,-1.7);let S=Z(x,c,.38,.5,3.4,0,0,-.9,.05,12);S.rotation.x=Math.PI/2;let C=Z(x,s,.55,.55,.3,0,0,-2,.03,12);C.rotation.x=Math.PI/2,X(x,c,.65,.65,.65,0,0,.75,.04);let w=J(x,new fn,0,0,-2.7),T=Lm(x,0,0,-2.75,K.orange),E=new H(new Ui(.34,12),zp(K.red,0,!0));E.rotation.y=Math.PI,J(x,E,0,0,-2.62);let D=Z(n,l,.7,.7,.8,-1.9,2.3,2.3,.04,12);Z(n,u,.72,.72,.1,-1.9,2.72,2.3,0,12);let ee=Y(n,a,.08,.08,.9,-1.7,3.2,2.1),te=Y(n,a,.08,.08,.9,-2.1,3.2,2.4);Z(n,r,.07,.09,4.6,2.4,4,3.1,.02,6);let O=new B;J(n,O,2.4,6,3.1),Y(O,a,.08,.08,2.2,0,.3,1.1),Nm(1.9,1.7,Mm(K.purple),O,0,-.6,1.1,Math.PI/2);let ne=zp(K.red,0,!0),k=new H(new mo(1,12,10),ne);k.scale.set(3.4,2.8,3.4),J(f,k,0,1.6,.2);let A=Pm(n,-2.4,3.2,.5,5,`#4a4a60`),j=0,re=0;return Im({group:t,body:n,L:e,muzzle:w,glow:T,size:{w:6,h:5,l:7},anim(e,t,r,i,a){let o=Jp((.7-r.hpFrac)/.6,0,1),s=1+o*1.2;re+=e*s,j+=r.speed*e/.9;for(let e of d)e.spin.rotation.x=-j;let c=Jp(r.speed/30,.2,1.3);n.position.y=Math.abs(Math.sin(re*12))*.06*c,n.rotation.z=Math.sin(re*3)*.015+Math.sin(re*9)*.007*c,n.rotation.x=i*.025+Math.sin(re*5)*.008,f.position.y=1.9+Math.abs(Math.sin(re*7))*.08*(1+o),f.rotation.z=Math.sin(re*4)*.04*s;let l=Math.max(0,Math.sin(re*9));ee.rotation.x=-l*.6,te.rotation.x=-(1-l)*.4,D.scale.y=1-l*.06,y.rotation.x=-l*.5,x.rotation.x=-i*.05+Math.sin(re*2)*.02,x.position.z=-1.7+i*.2,E.material.opacity=i,O.rotation.y=Math.sin(t*5*s)*.25,ne.opacity=o*(.14+.1*Math.sin(t*12))+i*.08;for(let e of _)e.material=o>.3||i>.3?e.userData.red??=new Kr({color:K.red}):g;A.tick(t,r.hpFrac<.5?.4+a*.6:0,2.4)}})}function Um(e){switch(e){case`vTower`:return zm();case`vHut`:return Bm();case`vGate`:return Vm();case`vChief`:return Hm()}}function Wm(){let e=new B,t=qp(42),n=q(K.wood),r=q(`#8a5428`),i=q(`#8d8da8`),a=q(`#6b6b86`),o=q(K.ink),s=q(`#7a3b2e`);for(let t of[-1,1])Y(e,i,2.4,8.5,2.4,t*12.8,4.25,-2,.06),Y(e,a,2.9,.6,2.9,t*12.8,.3,-2),Y(e,a,2.9,.5,2.9,t*12.8,8.6,-2),Z(e,q(K.red),.05,1.4,1.4,t*12.8,9.5,-2,.04,4).rotation.y=Math.PI/4;Y(e,i,28,1.8,2.2,0,8.6,-2,.06),Y(e,a,28.4,.4,2.5,0,9.65,-2);for(let t=-6;t<=6;t++)Y(e,a,1.5,.7,2.2,t*2.2,10.1,-2);Nm(11,2.75,jm(512,128,e=>{e.fillStyle=`#2b2b4d`,e.fillRect(0,0,512,128),e.strokeStyle=K.yellow,e.lineWidth=8,e.strokeRect(6,6,500,116),e.fillStyle=K.yellow,e.font=`bold 60px sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`BANDIT VILLAGE`,256,68)}),e,0,8.6,-.8);let c=Mm(K.purple);for(let t of[-1,1])Nm(1.7,1.7,c,e,t*12.8,5.2,-.75);let l=[],u=[],d=new Rt,f=new mt,p=new z,m=new z;for(let e of[-1,1]){let n=e*14.5;for(let e=-58;e<=-6;e+=2.6)p.set(n,.8,e),m.set(.3,1.6+t()*.3,.3),l.push(d.clone().compose(p,f.identity(),m));for(let e of[.55,1.2])p.set(n,e,-32),m.set(.12,.14,52),u.push(d.clone().compose(p,f.identity(),m))}let h=new Hi(1,1,1),g=(t,n)=>{let r=new hi(h,t,n.length);n.forEach((e,t)=>r.setMatrixAt(t,e)),r.castShadow=!0,e.add(r)};g(n,l),g(r,u);let _=[`#b8763e`,`#9a6232`,`#c98a4e`];[[-17,-14],[18,-20],[-19,-30],[17,-38],[-17,-48],[19,-54]].forEach(([r,i],a)=>{let c=new B;J(e,c,r,0,i),c.rotation.y=(r<0?.4:-.4)+(t()-.5)*.3;let l=3.4+t()*1.2;Y(c,q(_[a%3]),l,2.2,l,0,1.1,0,.05),Y(c,o,.9,1.4,.1,0,.7,l/2);for(let e of[-1,1]){let t=Y(c,s,l*.65,.2,l+.8,e*l*.22,2.75,0,.04);t.rotation.z=e*-.6}Z(c,n,.04,.05,2.2,l/2-.2,3.3,l/2-.2,0,5),Y(c,a%2?q(K.purple):q(K.red),.9,.6,.05,l/2+.25,4.1,l/2-.2)});let v=[];for(let e=-10;e>-58;e-=9)for(let t of[-1,1])v.push([t*12.2,e]);let y=new Wi(.07,.1,2.4,6),b=new so(.28,0),x=new hi(y,o,v.length),S=new hi(b,new Kr({color:K.orange}),v.length),C=new hi(b,new Kr({color:K.yellow}),v.length);v.forEach(([e,t],n)=>{x.setMatrixAt(n,d.makeTranslation(e,1.2,t)),S.setMatrixAt(n,d.makeTranslation(e,2.65,t)),C.setMatrixAt(n,d.makeTranslation(e,2.75,t))}),e.add(x,S,C);let w=new Kr({map:Mm(K.red),side:2}),T=new lo(1.4,2);for(let n=0;n<6;n++){let i=(n%2?1:-1)*12.6,a=-8-n*9;Z(e,r,.07,.1,6,i,3,a,.02,6);let o=new H(T,w);J(e,o,i+(i>0?-.75:.75),4.9,a),o.rotation.y=Math.PI/2+(t()-.5)*.3}let E=q(K.yellow);for(let n=0;n<7;n++)X(e,E,1.1,.9,1.1,(n%2?1:-1)*(16+t()*6),.5,-8-t()*48,.04);return e}var Gm={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Km=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},qm=new ls(-1,1,1,-1,0,1),Jm=new class extends hr{constructor(){super(),this.setAttribute(`position`,new rr([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new rr([0,2,0,0,2,0],2))}},Ym=class{constructor(e){this._mesh=new H(Jm,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,qm)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},Xm=class extends Km{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof wo?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=xo.clone(e.uniforms),this.material=new wo({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Ym(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Zm=class extends Km{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},Qm=class extends Km{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},$m=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new R);this._width=n.width,this._height=n.height,t=new Ft(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:g}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Xm(Gm),this.copyPass.material.blending=0,this.timer=new gs}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}Zm!==void 0&&(r instanceof Zm?n=!0:r instanceof Qm&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new R);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},eh=class extends Km{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new V}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},th={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new V(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},nh=class e extends Km{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new R(256,256):new R(e.x,e.y),this.clearColor=new V(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Ft(i,a,{type:g,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Ft(i,a,{type:g,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Ft(i,a,{type:g,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=th;this.highPassUniforms=xo.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new wo({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new R(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new z(1,1,1),new z(1,1,1),new z(1,1,1),new z(1,1,1),new z(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=xo.clone(Gm.uniforms),this.blendMaterial=new wo({uniforms:this.copyUniforms,vertexShader:Gm.vertexShader,fragmentShader:Gm.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new V,this._oldClearAlpha=1,this._basic=new Kr,this._fsQuad=new Ym(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new R(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new wo({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new R(.5,.5)},direction:{value:new R(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new wo({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};nh.BlurDirectionX=new R(1,0),nh.BlurDirectionY=new R(0,1);var rh={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

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

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},ih=class extends Km{constructor(){super(),this.isOutputPass=!0,this.uniforms=xo.clone(rh.uniforms),this.material=new To({name:rh.name,uniforms:this.uniforms,vertexShader:rh.vertexShader,fragmentShader:rh.fragmentShader}),this._fsQuad=new Ym(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},St.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},ah=1.5,oh={name:`B2BFx`,uniforms:{tDiffuse:{value:null},uTime:{value:0},uSpeed:{value:0},uNitro:{value:0},uHurt:{value:0},uBoost:{value:0},uSlow:{value:0},uFlash:{value:0},uAspect:{value:1},uLow:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uTime, uSpeed, uNitro, uHurt, uBoost, uSlow, uFlash, uAspect, uLow;
    varying vec2 vUv;

    float hash(float n) { return fract(sin(n * 91.3458) * 47453.5453); }

    void main() {
      vec2 p = vUv - 0.5;
      vec2 pa = vec2(p.x * uAspect, p.y);
      float r = length(pa);
      float fast = max(uSpeed, uNitro);
      float edge = smoothstep(0.12, 0.75, r);

      // radial blur + chromatic aberration (full quality only)
      float blurAmt = (uSpeed * 0.018 + uNitro * 0.03) * edge;
      float ca = (uSpeed * 0.0018 + uNitro * 0.003 + uHurt * 0.004) * edge;
      vec3 col;
      if (uLow > 0.5) {
        col = texture2D(tDiffuse, vUv).rgb;
      } else {
        vec2 dir = -p;
        vec3 acc = vec3(0.0);
        for (int i = 0; i < 5; i++) {
          float k = float(i) / 4.0;
          vec2 uv = vUv + dir * blurAmt * k;
          vec2 o = p * ca * (1.0 + k);
          acc += vec3(texture2D(tDiffuse, uv + o).r, texture2D(tDiffuse, uv).g, texture2D(tDiffuse, uv - o).b);
        }
        col = acc * 0.2;
      }

      // radial speed streaks
      if (fast > 0.35) {
        float a = atan(pa.y, pa.x);
        float seg = a * 22.0;
        float id = floor(seg);
        float h = hash(id + floor(uTime * 14.0 + hash(id) * 5.0) * 7.31);
        float w = abs(fract(seg) - 0.5);
        float line = smoothstep(0.16 + 0.1 * h, 0.0, w) * step(0.55, h);
        float reach = smoothstep(0.30 + (1.0 - fast) * 0.2, 0.85, r);
        float s = line * reach * smoothstep(0.35, 1.0, fast) * (0.18 + 0.22 * uNitro);
        col += s * mix(vec3(1.0), vec3(0.75, 0.88, 1.0), uNitro);
      }

      // slow-mo: desaturate + tighter vignette
      float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(col, vec3(lum), uSlow * 0.6);

      // vignette
      float vig = smoothstep(0.42 - uSlow * 0.12, 0.98, r);
      col *= 1.0 - vig * (0.28 + uSlow * 0.4 + uSpeed * 0.1);

      // warm boost glow from the edges
      col += vec3(1.0, 0.55, 0.18) * uBoost * (0.05 + 0.2 * vig);
      col = mix(col, col * vec3(1.06, 1.0, 0.94), uBoost * 0.5);

      // hurt pulse: red edge wash
      col = mix(col, vec3(0.9, 0.05, 0.04), uHurt * (0.12 + 0.55 * vig));

      // white flash
      col = mix(col, vec3(1.0), uFlash);

      gl_FragColor = vec4(col, 1.0);
    }
  `};function sh(e,t,n){let r=`high`,i=!1,a=null,o=null,s=null,c=0,l=0,u=1,d=1,f=new R;try{e.getSize(f),u=f.x||1,d=f.y||1;let r=Math.min(ah,e.getPixelRatio());a=new $m(e,new Ft(u*r,d*r,{type:g,samples:4})),a.setPixelRatio(r),a.setSize(u,d),a.addPass(new eh(t,n)),a.addPass(new Xm({name:`B2BSanitize`,uniforms:{tDiffuse:{value:null}},vertexShader:`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); if (!(c.r == c.r) || !(c.g == c.g) || !(c.b == c.b) || !(c.a == c.a)) c = vec4(0.0, 0.0, 0.0, 1.0); gl_FragColor = vec4(clamp(c.rgb, 0.0, 8.0), 1.0); }`})),o=new nh(new R(u,d),.18,.55,1),a.addPass(o),a.addPass(new ih),s=new Xm(oh),a.addPass(s),s.uniforms.uAspect.value=u/d}catch(e){console.warn(`[post] composer init failed, using direct render`,e),i=!0}let p=s?.uniforms;function m(){if(!a||!o||!p)return;let e=r===`low`;o.enabled=!e,p.uLow.value=+!!e}function h(e){o&&(o.strength=.16+.34*c+.3*e.flash+.12*e.boost,o.radius=.5+.2*c,o.threshold=1-.06*c)}return{render(r,o){if(i||!a||!p)e.render(t,n);else{l+=r,c+=(+!!o.nitro-c)*Math.min(1,r*6),p.uTime.value=l,p.uSpeed.value=Math.min(1,Math.max(0,o.speed/90)),p.uNitro.value=c,p.uHurt.value=o.hurt,p.uBoost.value=o.boost,p.uSlow.value=o.slow,p.uFlash.value=o.flash,h(o);try{a.render(r)}catch(r){console.warn(`[post] composer render failed, falling back`,r),i=!0,e.setRenderTarget(null),e.render(t,n)}}},resize(t,n){u=Math.max(1,t),d=Math.max(1,n),a&&p&&(a.setPixelRatio(Math.min(ah,e.getPixelRatio())),a.setSize(u,d),p.uAspect.value=u/d)},setQuality(e){r=e,m()}}}var ch=.8,lh=e=>e<0?0:e>1?1:e,uh=e=>{let t=lh(e);return t*t*(3-2*t)},dh=e=>{let t=lh(e);return t*t*t*(t*(t*6-15)+10)},fh=(e,t,n)=>e+(t-e)*n,ph=new z,mh=new z,hh=(e,t)=>t.set(-Math.sin(e),0,-Math.cos(e)),gh={intro:{dur:2.8,blendIn:.12,outro:0,bars:!0,capIn:0,capOut:0,fill(e,t,n,r,i,a){let o=1-dh(t),s=a.startAng*o,c=ph.copy(n.pos).sub(r.carPos),l=Math.hypot(c.x,c.z),u=Math.atan2(c.x,c.z),d=fh(l,8.5,o),f=u+s;i.pos.set(r.carPos.x+Math.sin(f)*d,fh(n.pos.y,1.5,o*o)+Math.sin(t*Math.PI)*1.2,r.carPos.z+Math.cos(f)*d),i.look.copy(n.look).lerp(mh.copy(r.carPos).setY(1.3),lh(o*1.15)),i.fov=n.fov-14*o,i.roll=.06*Math.sin(o*Math.PI),i.ts=1}},boss:{dur:3.2,blendIn:.16,outro:.95,bars:!0,capIn:.55,capOut:2.7,fill(e,t,n,r,i,a){let o=a.bossPos,s=e*.7;i.pos.set(o.x+a.sideSign*(9-s*.6),1.1+s*.12,o.z+17-s*1.6);let c=dh(e/.45);i.look.copy(n.look).lerp(ph.set(o.x,o.y+3.4,o.z),c),i.fov=fh(n.fov,52,uh(e/.5))-5*uh(t),i.roll=a.sideSign*.2*uh(e/.6);let l=uh((e-1.9)/1.1);i.ts=1-.65*uh(e/.28)*(1-l)}},bossDown:{dur:2.6,blendIn:.2,outro:.8,bars:!0,capIn:.2,capOut:1.9,fill(e,t,n,r,i,a){let o=a.bossPos,s=a.startAng+t*1.7*a.sideSign,c=fh(26,13,dh(t));i.pos.set(o.x+Math.sin(s)*c,3.2+2.2*(1-t),o.z+Math.cos(s)*c),i.look.set(o.x,o.y+2.4,o.z),i.fov=fh(62,48,uh(t)),i.roll=a.sideSign*.08*Math.sin(t*Math.PI),i.ts=1-.85*uh(e/.2)*(1-uh((e-1.8)/.8))}},zone:{dur:1.8,blendIn:.14,outro:.55,bars:!0,capIn:.15,capOut:1.5,fill(e,t,n,r,i,a){let o=hh(r.carYaw,ph),s=mh.set(-o.z,0,o.x).multiplyScalar(a.sideSign),c=fh(-9,10,dh(t)),l=fh(11,8,uh(t));i.pos.copy(r.carPos).addScaledVector(o,c).addScaledVector(s,l),i.pos.y=fh(1.6,3.4,uh(t)),i.look.copy(r.carPos).addScaledVector(o,3).setY(1.4),i.fov=fh(48,58,uh(t)),i.roll=a.sideSign*.05*Math.sin(t*Math.PI),i.ts=fh(1,.7,uh(e/.2))}},crash:{dur:1/0,blendIn:.3,outro:0,bars:!0,capIn:.6,capOut:1/0,fill(e,t,n,r,i,a){Number.isNaN(a.startAng)&&(a.startAng=Math.atan2(n.pos.x-r.carPos.x,n.pos.z-r.carPos.z));let o=a.startAng+a.sideSign*(1.3*dh(e/3)+Math.max(0,e-3)*.12),s=fh(7.5,15,dh(e/3.2)),c=uh(e/.6);i.pos.set(r.carPos.x+Math.sin(o)*s,fh(3.4,5.6,dh(e/3)),r.carPos.z+Math.cos(o)*s),i.look.copy(r.carPos).setY(1.1),i.fov=fh(n.fov,50,c),i.roll=a.sideSign*.05*c,i.ts=fh(1,.3,uh(e/.35))}}};function _h(e,t,n,r,i){let a=2/Math.max(1e-4,r),o=a*i,s=1/(1+o+.48*o*o+.235*o*o*o),c=e-t,l=(n.v+a*c)*i;return n.v=(n.v-a*l)*s,t+(c+l)*s}var vh=class{out={pos:new z,look:new z,fov:62,active:!1,timeScale:1,roll:0};raw={pos:new z,look:new z,fov:62,roll:0,ts:1};held={bossPos:new z,sideSign:1,startAng:0};shot=null;def=null;t=0;w=0;wv={v:0};ts=1;tsv={v:0};roll=0;lastCtx=null;leaving=!1;root;title;sub;caption=``;subText=``;constructor(e){this.root=document.createElement(`div`),this.root.className=`cine-root`,this.root.innerHTML=`<div class="cine-bar top"></div><div class="cine-bar bot"></div><div class="cine-cap"><div class="cine-title"></div><div class="cine-sub"></div></div>`,this.title=this.root.querySelector(`.cine-title`),this.sub=this.root.querySelector(`.cine-sub`),e.appendChild(this.root)}get active(){return this.shot!==null}play(e,t){let n=gh[e];this.shot=e,this.def=n,this.t=0,this.leaving=!1,this.w=0,this.ts=1,this.tsv.v=0,this.roll=0,this.raw.ts=1,this.caption=t?.caption??``,this.subText=t?.sub??``,this.title.textContent=this.caption,this.sub.textContent=this.subText,this.root.classList.remove(`cap`),this.root.classList.toggle(`on`,n.bars),this.wv.v=0,this.held.sideSign=Math.random()<.5?-1:1,e===`intro`?this.held.startAng=this.held.sideSign*(2.3+Math.random()*.4):e===`bossDown`?this.held.startAng=Math.random()*.8-.4:e===`crash`&&(this.held.startAng=NaN),this.lastCtx?.bossPos&&this.held.bossPos.copy(this.lastCtx.bossPos)}skip(){this.shot&&(this.leaving=!0,this.root.classList.remove(`on`,`cap`))}update(e,t){this.lastCtx=t;let n=this.out,r=Math.min(.05,Math.max(0,t.dt)),i=this.def;if(!this.shot||!i)return n.pos.copy(e.pos),n.look.copy(e.look),n.fov=e.fov,n.active=!1,n.timeScale=1,n.roll=0,n;this.t+=r;let a=this.t,o=Number.isFinite(i.dur)?lh(a/i.dur):lh(a/4);(this.shot===`boss`||this.shot===`bossDown`)&&(t.bossPos?this.held.bossPos.copy(t.bossPos):this.held.bossPos.lengthSq()===0&&md(t.D+70,0,2,this.held.bossPos)),i.fill(a,o,e,t,this.raw,this.held);let s=i.dur-i.outro;!this.leaving&&a>=i.dur&&(this.leaving=!0,this.root.classList.remove(`on`,`cap`));let c=this.leaving||i.outro>0&&a>=s;c&&this.root.classList.remove(`on`);let l=!c&&(this.caption||this.subText)&&a>=i.capIn&&a<i.capOut;this.root.classList.toggle(`cap`,!!l);let u=+!c;if(this.w=lh(_h(this.w,u,this.wv,c?this.leaving&&i.outro===0?.25:.3:i.blendIn,r)),this.ts=_h(this.ts,this.leaving?1:this.raw.ts,this.tsv,this.leaving?.3:.1,r),this.roll=fh(this.roll,this.leaving?0:this.raw.roll,Math.min(1,r*6)),this.leaving&&this.w<.004)return this.shot=null,this.def=null,this.w=0,this.wv.v=0,this.ts=1,this.roll=0,n.pos.copy(e.pos),n.look.copy(e.look),n.fov=e.fov,n.active=!1,n.timeScale=1,n.roll=0,n;let d=this.w;return n.pos.copy(e.pos).lerp(this.raw.pos,d),n.look.copy(e.look).lerp(this.raw.look,d),n.pos.y=Math.max(ch,n.pos.y),n.fov=fh(e.fov,this.raw.fov,d),n.roll=this.roll*d,n.timeScale=this.ts,n.active=!0,n}};function yh(e){return new vh(e??document.body)}var bh=5,xh=6,Sh=.9,Ch=Math.atan2(Sh,xh),wh=e=>Sh*(xh/2-e)/xh,Th=null,Eh=null,Dh=null,Oh=null,kh=null;function Ah(){if(Th)return Th;let e=bh/2,t=xh/2,n=[[-2.5,0,t],[e,0,t],[-2.5,0,-3],[e,0,-3],[-2.5,Sh,-3],[e,Sh,-3]],r=[[0,1,5],[0,5,4],[2,4,5],[2,5,3],[0,4,2],[1,3,5],[0,2,3],[0,3,1]],i=[];for(let e of r)for(let t of e)i.push(...n[t]);return Th=new hr,Th.setAttribute(`position`,new rr(i,3)),Th.computeVertexNormals(),Th}function jh(e,t,n){let r=document.createElement(`canvas`);r.width=e,r.height=t,n(r.getContext(`2d`));let i=new Ri(r);return i.colorSpace=Be,i}function Mh(e,t,n,r,i){let a=r.clone().sub(n),o=Z(e,t,i,i,a.length(),(n.x+r.x)/2,(n.y+r.y)/2,(n.z+r.z)/2,0,6);return o.quaternion.setFromUnitVectors(new z(0,1,0),a.normalize()),o}function Nh(e,t,n,r,i,a){let o=[K.red,K.yellow,K.blue,K.green,K.orange].map(e=>new V(e)),s=[],c=[],l=e=>t.clone().lerp(n,e).setY(t.y+(n.y-t.y)*e-Math.sin(Math.PI*e)*r),u=l(0);for(let t=1;t<=i*2;t++){let n=l(t/(i*2));Mh(e,a,u,n,.018),u=n}for(let e=0;e<i;e++){let t=(e+.25)/i,n=(e+.75)/i,r=(t+n)/2,a=l(t),u=l(n),d=l(r),f=o[e%o.length],p=d.clone().add(new z(0,-.38,0));for(let e of[[a,u,p],[u,a,p]])for(let t of e)s.push(t.x,t.y,t.z),c.push(f.r,f.g,f.b)}let d=new hr;d.setAttribute(`position`,new rr(s,3)),d.setAttribute(`color`,new rr(c,3)),d.computeVertexNormals();let f=new H(d,new Kr({vertexColors:!0,side:2}));e.add(f)}function Ph(){let e=new B,t=q(K.wood),n=q(`#8a5428`),r=q(`#d49a5c`),i=q(K.steel),a=q(K.orange),o=q(K.cream),s=q(`#e8d29a`),c=q(`#f2c94c`),l=q(`#c99a22`),u=new H(Ah(),n);u.scale.set(.98,.97,1),u.castShadow=u.receiveShadow=!0,e.add(u);let d=new B;d.position.y=Sh/2,d.rotation.x=Ch,e.add(d);let f=Math.hypot(xh,Sh),p=f/10;for(let e=0;e<10;e++){let n=-f/2+p*(e+.5),i=Y(d,e%2?t:r,bh,.1,p-.04,0,-.04,n);i.receiveShadow=!0}for(let[e,t]of[[1,a],[3,o],[5,a],[7,o]]){let n=-f/2+p*(e+.5);Y(d,t,4.5,.02,p*.5,0,.012,n).castShadow=!1}for(let e of[-1,1]){let n=Z(d,t,.17,.17,f+.1,e*2.55,.05,0,.03,8);n.rotation.x=Math.PI/2,Z(d,r,.12,.12,.02,e*2.55,.05,-f/2-.05,0,8).rotation.x=Math.PI/2}let m=Z(e,t,.14,.14,5.3,0,.06,3.05,.03,8);m.rotation.z=Math.PI/2,kh||=new Wi(.05,.05,.04,6);let h=new hi(kh,q(`#7a4a2a`),20),g=new Rt,_=new mt().setFromEuler(new Jt(Ch,0,0)),v=0;for(let e=0;e<10;e++)for(let t of[-1,1]){let n=-f/2+p*(e+.5),r=new z(t*(bh/2-.2),.02,n).applyEuler(new Jt(Ch,0,0)).add(new z(0,Sh/2,0));g.compose(r,_,new z(1,1,1)),h.setMatrixAt(v++,g)}e.add(h);let y=[[],[]];[-1,1].forEach((a,o)=>{for(let n of[-2.7,0,2.7]){let s=wh(n)+.55,c=Z(e,t,.15,.17,s,a*2.95,s/2,n,.03,8);Z(e,r,.14,.14,.03,0,s/2+0,0,0,8).position.y=s/2,c.castShadow=!0,y[o].push(new z(a*2.95,s,n)),Y(e,i,.12,.04,.12,a*2.95,s+.02,n)}for(let t=0;t<2;t++){let n=y[o][t].clone(),r=y[o][t+1].clone(),i=n.clone().lerp(r,.5).add(new z(0,-.12,0));Mh(e,s,n.clone().add(new z(0,-.05,0)),i,.03),Mh(e,s,i,r.clone().add(new z(0,-.05,0)),.03)}Nh(e,y[o][0].clone().add(new z(0,.25,0)),y[o][2].clone().add(new z(0,.25,0)),.22,9,s),Mh(e,n,new z(a*3.2,.02,.4),new z(a*2.6,wh(-.4)*.8,-.6),.08)});for(let t of[-1,1]){let n=Y(e,c,.9,.55,.7,t*3.25,.28,3.8,.03);n.rotation.y=t*.2,Y(n,l,1.02,.08,1.04,0,.1,0),Y(n,l,1.02,.08,1.04,0,-.1,0);let r=Y(e,c,.8,.5,.65,t*3.3,.8,3.75,.03);r.rotation.y=-t*.3,Oh||=new ho(.42,.17,6,12);for(let n=0;n<3;n++){let r=new H(Oh,q(`#2b2b4d`));r.rotation.x=Math.PI/2,r.position.set(t*3.5,.17+n*.32,-2.7+n%2*.05),r.castShadow=!0,e.add(r)}Y(e,q(K.yellow),.5,.04,.5,t*3.5,1.1,-2.7).castShadow=!1}Eh||=jh(256,128,e=>{e.fillStyle=`#ffd21f`,e.fillRect(0,0,256,128),e.strokeStyle=`#1b1b3a`,e.lineWidth=12,e.strokeRect(6,6,244,116),e.fillStyle=`#1b1b3a`,e.font=`900 82px "Arial Black", Impact, sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(`JUMP`,128,70),e.fillStyle=`#ff3b30`;for(let t of[26,230])e.beginPath(),e.arc(t,22,6,0,7),e.fill()});let b=2.4;for(let n of[-1,1])Z(e,t,.1,.11,b,n*1.1,b/2,-2.8,.03,8);let x=new H(new Hi(2.6,1,.1),[q(K.ink),q(K.ink),q(K.ink),q(K.ink),new Kr({map:Eh}),q(K.ink)]);return x.position.set(0,2.5,-2.7),x.castShadow=!0,e.add(x),e}var Fh=4.4,Ih=6,Lh=4;function Rh(){let t=new B,n=q(K.steel),r=q(`#23234a`),i=q(K.ink);Dh||(Dh=jh(64,64,e=>{e.fillStyle=`#ffd21f`,e.fillRect(0,0,64,64),e.fillStyle=`#1b1b3a`;for(let t=-1;t<4;t++)e.beginPath(),e.moveTo(t*24,64),e.lineTo(t*24+16,64),e.lineTo(t*24+48,0),e.lineTo(t*24+32,0),e.fill()}),Dh.wrapS=Dh.wrapT=e,Dh.repeat.set(1,4)),Y(t,n,Fh,.1,Ih,0,.05,0,.03).receiveShadow=!0,Y(t,r,3.9000000000000004,.03,5.5,0,.105,0);for(let e of[-1,1])for(let n=0;n<5;n++)Z(t,i,.06,.06,.03,e*(Fh/2-.13),.11,-2.6+5.2/4*n,0,6);let a=[],o=new V(`#ffd21f`),s=new V(`#fff7b0`),c=new V(`#7a5a00`),l=1.9,u=.62;for(let e=0;e<Lh;e++){let n=new Kr({color:o});a.push(n);let r=Ih/2-1-e*1.4,i=new B;i.position.set(0,.125,r);for(let e of[-1,1]){let t=Y(i,n,l,.03,.38,e*Math.sin(u)*l*.5,0,Math.cos(u)*l*.5);t.castShadow=!1,t.rotation.y=e*u}t.add(i)}let d=new H(new lo(4,5.6),zp(`#ffd21f`,.18));d.rotation.x=-Math.PI/2,d.position.y=.135,t.add(d);let f=new Eo({map:Dh}),p=[];for(let e of[-1,1])for(let n of[-2.8,Ih/2-.2]){let r=e*2.5500000000000003;Z(t,f,.17,.2,1,r,.5,n,.03,8),Y(t,i,.4,.1,.4,r,.05,n);let a=new Kr({color:`#ff6a2b`});p.push(a);let o=new H(new mo(.2,10,8),a);o.position.set(r,1.15,n),t.add(o)}let m=new Kr({color:`#38e1ff`}),h=[];for(let e of[-1,1]){let r=e*2.75;Y(t,n,.36,2.2,.36,r,1.1,0,.04),Y(t,i,.44,.14,.44,r,.07,0);let a=new H(new ho(.55,.07,6,18),m);a.position.set(r,1.7,0),a.rotation.y=Math.PI/2,t.add(a),h.push(a);let o=new H(new mo(.2,10,8),m);o.position.set(r,2.3,0),t.add(o)}return t.userData.update=e=>{for(let t=0;t<Lh;t++){let n=Jp(.5+.5*Math.sin(e*6-(3-t)*1.25),0,1);a[t].color.copy(c).lerp(o,.35+.65*n).lerp(s,n*n*.6)}d.material.opacity=.12+.1*(.5+.5*Math.sin(e*6));let t=.5+.5*Math.sin(e*9);for(let e of p)e.color.setRGB(1,.3+.35*t,.1);for(let t=0;t<h.length;t++)h[t].scale.setScalar(1+.08*Math.sin(e*7+t*Math.PI))},t}function zh(e,t){let n=e.userData.update;n&&n(t)}var Bh=null;function Vh(){Bh??={wood:new Eo({color:12159562}),band:new Eo({color:16726832})};let e=new B,t=new H(new Hi(.4,1.4,.4),Bh.wood);t.position.y=.7,t.castShadow=!0;let n=new H(new Hi(.44,.22,.44),Bh.band);n.position.y=1.15;let r=new H(new Hi(.12,.14,2.4),Bh.wood);return r.position.y=.95,e.add(t,n,r),e}var Hh=null;function Uh(e){Hh||(Hh=new Ui(1,24),Hh.rotateX(-Math.PI/2));let t=new H(Hh,new Kr({color:e?16722458:0,transparent:!0,opacity:.35,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-3}));return t.renderOrder=2,t}var Wh=new z,Gh=new z,Kh=new z,qh=class{game;renderer;scene=new xn;camera=new cs(62,1,.3,700);world;fx;post;cine=yh();timeScale=1;slow=0;whiteFlash=0;lastAir=0;turnSm=0;susp={p:0,pv:0,r:0,rv:0,h:0,hv:0,y:0,yv:0};camAcc=0;camLat=0;suspStep(e){let t=this.game,n=this.susp,r=Math.min(1.2,t.speed/50),i=t.airT<=0,a=i?Math.max(-.14,Math.min(.12,t.accLong*.0042)):0,o=i?Math.max(-.13,Math.min(.13,t.accLat*.0055)):0,s=Math.max(-.35,Math.min(.35,-t.slipAng*.55)),c=Math.abs(t.carRel)>8.5&&i,l=i?(Math.sin(t.D*.9)*.5+Math.sin(t.D*2.3+1)*.35)*.02*r+(c?(Math.random()-.5)*.12:0):0,u=(t,n,r,i,a)=>(n+=(i*(r-t)-a*n)*e,[t+n*e,n]);[n.p,n.pv]=u(n.p,n.pv,a,70,9),[n.r,n.rv]=u(n.r,n.rv,o,60,8),[n.h,n.hv]=u(n.h,n.hv,l,140,11),[n.y,n.yv]=u(n.y,n.yv,s,50,8)}endT=0;wall=null;bolts=[];nextBolt=0;boltT=0;skL=new z;skR=new z;decor=null;decorD=0;turnHint=0;shakeScale=1;setQuality(e){this.post.setQuality(e)}cineBase={pos:new z,look:new z,fov:62};bossTmp=new z;car;views=new Map;raycaster=new js;ground=new Sr(new z(0,1,0),-1.3);fov=62;smoothX=0;zoneCb=()=>{};target=new z;constructor(e,t){this.game=t,this.renderer=new $u({canvas:e,antialias:!0,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1)),this.renderer.outputColorSpace=Be,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1.05,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=1,this.world=Ep(this.scene,this.renderer),this.post=sh(this.renderer,this.scene,this.camera),this.world.onZone((e,t)=>this.zoneCb(e,t)),this.fx=Fp(this.scene),this.car=im(),this.car.group.rotation.order=`YXZ`,this.scene.add(this.car.group),this.resize(),t.project=(e,t,n)=>this.project(e,t,n)}onZone(e){this.zoneCb=e}resize(){let e=innerWidth,t=innerHeight;this.renderer.setSize(e,t,!1),this.renderer.domElement.style.width=`${e}px`,this.renderer.domElement.style.height=`${t}px`,this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.post?.resize(e,t),this.fx?.setViewScale(t/(2*Math.tan(this.camera.fov*Math.PI/360)))}project(e,t,n){let r=md(e,t,n,Wh);return r.project(this.camera),r.z>1||r.z<-1?null:{sx:(r.x+1)/2*innerWidth,sy:(1-r.y)/2*innerHeight}}startStormEnd(){this.stormReset(),this.endT=.001,this.nextBolt=.2;let e=new B,t=new Kr({color:2363454,fog:!1}),n=new Kr({color:3875430,fog:!1});for(let r=0;r<26;r++){let i=new H(new so(7+Math.random()*9,0),r%3?t:n);i.position.set(-34+r%9*8.5+Math.random()*4,4+Math.random()*20,-(r/9|0)*9-Math.random()*6),i.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3),e.add(i)}this.scene.add(e),this.wall=e;let r=new bi({color:16050943,fog:!1});for(let e=0;e<3;e++){let e=[];for(let t=0;t<=7;t++)e.push(new z((Math.random()-.5)*3,30-t*4.3,(Math.random()-.5)*3));let t=new Oi(new hr().setFromPoints(e),r);t.visible=!1,this.scene.add(t),this.bolts.push(t)}this.cine.play(`crash`,{})}stormReset(){this.endT=0,this.wall&&=(this.scene.remove(this.wall),null);for(let e of this.bolts)this.scene.remove(e);this.bolts=[],this.world.setNight?.(0),this.whiteFlash=0,this.car.group.rotation.z=0,this.car.group.rotation.x=0}stormEndStep(e,t,n){this.endT+=e;let r=this.endT,i=Wh.set(Math.sin(n),0,Math.cos(n)),a=Math.max(-8,80-48*r);if(this.wall&&(this.wall.position.copy(t).addScaledVector(i,a).setY(0),this.wall.rotation.y=n),this.world.setNight?.(Math.min(1,.7+r*.4)),this.boltT-=e,this.boltT<=0)for(let e of this.bolts)e.visible=!1;if(this.nextBolt-=e,this.nextBolt<=0&&this.bolts.length){this.nextBolt=.25+Math.random()*.4,this.boltT=.12,this.whiteFlash=Math.max(this.whiteFlash,.55+Math.random()*.3);let e=this.bolts[Math.random()*this.bolts.length|0];e.visible=!0,e.position.copy(t).addScaledVector(i,a*.5+(Math.random()-.5)*18).setY(0),e.position.x+=(Math.random()-.5)*24}let o=Math.max(0,r-1.5);this.car.group.position.y=Math.min(14,o*o*5),this.car.group.position.addScaledVector(i,-o*6),this.car.group.rotation.y=n+o*o*2.4,this.car.group.rotation.z=Math.sin(o*6)*Math.min(1,o)*.9,this.car.group.rotation.x=Math.min(1.2,o*.8),this.slow=.55,r>1.7&&Math.random()<e*40&&this.fx.debris(Gh.copy(this.car.group.position),12088894,6)}update(e,t,n,r,i){let a=this.game,o=a.D+vd,s=md(o,a.carRel,0,Gh),c=pd(o);this.smoothX+=(a.carRel*.8-this.smoothX)*Math.min(1,e*4),this.camAcc+=(a.accLong-this.camAcc)*Math.min(1,e*3),this.camLat+=(a.accLat-this.camLat)*Math.min(1,e*3);let l=4.5+Math.max(-.5,Math.min(1.1,this.camAcc*.04)),u=md(a.D-l,this.smoothX,4.6+a.speed*.01+this.susp.h*.6,Kh),d=fd(a.D,70);this.turnSm+=(d-this.turnSm)*Math.min(1,e*3);let f=md(a.D+24+30*Math.abs(this.turnSm),this.smoothX*.7+this.turnSm*5,1.4,Wh);if(a.shake>0&&!this.cine.active){let e=a.shake*.5*this.shakeScale;u.x+=(Math.random()-.5)*e,u.y+=(Math.random()-.5)*e}let p=62+Math.min(1,a.speed/80)*6+(a.nitroT>0?12:0);this.fov+=(p-this.fov)*Math.min(1,e*5);let m=this.cineBase;m.pos.copy(u),m.look.copy(f),m.fov=this.fov;let h=a.boss?md(a.boss.d,a.boss.x,0,this.bossTmp):null,g=this.cine.update(m,{dt:e,carPos:s,carYaw:c,speed:a.speed,D:a.D,carRel:a.carRel,bossPos:h});this.timeScale=g.timeScale,this.slow=1-g.timeScale,this.camera.position.copy(g.pos),this.camera.lookAt(g.look),this.camera.rotateZ(g.roll+(g.active?0:-this.turnSm*.06-this.camLat*.0022)),Math.abs(this.camera.fov-g.fov)>.05&&(this.camera.fov=g.fov,this.camera.updateProjectionMatrix()),this.camera.updateMatrixWorld(!0),this.raycaster.setFromCamera(new R(r.rx*2-1,-(r.ry*2-1)),this.camera),this.raycaster.ray.intersectPlane(this.ground,this.target)||this.target.copy(f);let _=this.car.muzzle.getWorldPosition(new z),v=this.target.x-_.x,y=this.target.z-_.z,b=Math.atan2(-v,-y)-c,x=Math.atan2(this.target.y-_.y,Math.hypot(v,y)),S=a.air,C=(S-this.lastAir)/Math.max(e,.001);this.lastAir=S,this.car.group.position.copy(s),this.suspStep(e),this.car.group.position.y=S+Math.max(-.12,Math.min(.12,this.susp.h)),this.car.group.rotation.y=c+this.susp.y,this.car.group.rotation.x=(S>0?Math.max(-.45,Math.min(.45,C*.045)):0)+this.susp.p,this.car.group.rotation.z=this.susp.r,this.car.update(e,t,{steer:a.steerApplied,speed:a.speed,nitro:a.nitroT>0,aimYaw:i?b:0,aimPitch:i?x:0,firing:r.fire&&i,hurt:a.invul>0&&a.shield<=0,shield:a.shield>0,upgrades:a.upg,braking:!!n.brake,drifting:a.drifting,damage:Math.max(0,Math.min(1,1-a.hull/a.maxHull))}),this.turnHint=d,this.endT>0&&this.stormEndStep(e,s,c),this.syncObjects(e,t),this.ambientFx(e,s,c),this.endT<=0&&this.world.setNight?.(Math.max(0,Math.min(1,1-a.stormGap/160))*.7),this.decor&&(a.D>this.decorD+140||a.D<this.decorD-200)&&(this.scene.remove(this.decor),this.decor=null),this.world.update(a.D,t,e,a.speed),this.fx.update(e),this.whiteFlash=Math.max(0,this.whiteFlash-e*1.6),this.post.render(e,{speed:a.speed,nitro:a.nitroT>0,hurt:Math.min(1,a.flash/.3),boost:Math.min(1,a.boostT)*.8+(a.drifting?a.driftTier*.15:0),slow:this.slow,flash:this.whiteFlash})}ambientFx(e,t,n){let r=this.game,i=Wh.set(Math.sin(n),0,Math.cos(n));r.nitroT>0&&Math.random()<e*90&&this.fx.nitro(Gh.copy(t).addScaledVector(i,2.2).setY(.7),i),r.speed>8&&Math.abs(r.steerApplied)>.6&&Math.random()<e*50&&this.fx.dust(Gh.copy(t).addScaledVector(i,1.6).setY(.1),Kh.set(Math.random()-.5,1.2,Math.random()-.5));{let a=Kh.set(Math.cos(n),0,-Math.sin(n)),o=Wh.copy(t).addScaledVector(i,1.5),s=this.skL.copy(o).addScaledVector(a,-.95).setY(.05),c=this.skR.copy(o).addScaledVector(a,.95).setY(.05),l=r.drifting&&r.air<=0;if(this.fx.skid(s,c,+!!l),l){let t=Gh.copy(a).multiplyScalar(Math.sign(r.steerApplied)||1);Math.random()<e*40&&this.fx.tireSmoke(s,t,1),Math.random()<e*30&&this.fx.sparkTrail(c,Gh.set((Math.random()-.5)*3,2,(Math.random()-.5)*3))}}r.hull<=2&&r.hull>0&&Math.random()<e*8&&this.fx.smoke(Gh.copy(t).setY(1.4),1),Math.abs(r.carRel)>10&&r.speed>8&&Math.random()<e*60&&this.fx.dust(Gh.copy(t).addScaledVector(i,1.2).setY(.1),Kh.set(Math.random()-.5,1.6,Math.random()-.5))}makeView(e){switch(e.kind){case`raider`:case`heavy`:case`boss`:{let t=dm(e.kind),n=new B;return t.group.rotation.y=Math.PI,n.add(t.group),{group:n,rig:t,kind:e.kind,lastFlash:0}}case`drone`:case`bomber`:{let t=Dm(e.kind),n=new B;return t.group.rotation.y=Math.PI,n.add(t.group),{group:n,rig:t,kind:e.kind,lastFlash:0,shadow:Uh(!1)}}case`vTower`:case`vHut`:case`vGate`:case`vChief`:{let t=Um(e.kind),n=new B;return t.group.rotation.y=Math.PI,n.add(t.group),{group:n,rig:t,kind:e.kind,lastFlash:0}}case`post`:return{group:Vh(),kind:e.kind,lastFlash:0};case`bomb`:{let t=_m();return t.scale.setScalar(2.2),{group:t,kind:e.kind,lastFlash:0,shadow:Uh(!0)}}case`barrel`:return{group:fm(),kind:e.kind,lastFlash:0};case`rock`:return{group:mm(e.id),kind:e.kind,lastFlash:0};case`hay`:return{group:hm(),kind:e.kind,lastFlash:0};case`oil`:return{group:gm(),kind:e.kind,lastFlash:0};case`bullet`:return{group:_m(),kind:e.kind,lastFlash:0};case`pickup`:return{group:bm(e.upgrade),kind:e.kind,lastFlash:0};case`ramp`:return{group:Ph(),kind:e.kind,lastFlash:0};case`pad`:return{group:Rh(),kind:e.kind,lastFlash:0}}}syncObjects(e,t){let n=this.game,r=new Set;for(let i of n.objs){let a=i.d-n.D;if(a>270||a<-12)continue;r.add(i.id);let o=this.views.get(i.id);o||(o=this.makeView(i),this.views.set(i.id,o),this.scene.add(o.group),o.shadow&&this.scene.add(o.shadow));let s=i.kind===`bullet`?1.1+i.alt:i.alt;if(md(i.d,i.x,s,o.group.position),o.group.rotation.y=pd(i.d)+(i.kind===`bullet`||i.kind===`bomb`?Math.PI:0),o.shadow){md(i.d,i.x,.07,o.shadow.position),o.shadow.rotation.y=pd(i.d);let e=o.shadow.material;if(i.kind===`bomb`){let n=.5+.5*Math.sin(t*18);o.shadow.scale.setScalar(1.3+.4*i.tele),e.opacity=.25+.4*i.tele*(.6+.4*n)}else o.shadow.scale.set(i.w*.7,1,i.w*.5),e.opacity=Math.max(.12,.42-i.alt*.04)}o.rig?(i.flash>0&&o.lastFlash<=0&&o.rig.flash(),o.lastFlash=i.flash,o.rig.update(e,t,{hpFrac:i.hp/i.hpMax,speed:n.speed,telegraph:i.tele})):i.kind===`pickup`?xm(o.group,t):i.kind===`bullet`?vm(o.group,t):i.kind===`pad`&&zh(o.group,t)}for(let[e,t]of this.views)r.has(e)||(this.scene.remove(t.group),t.shadow&&(this.scene.remove(t.shadow),t.shadow.material.dispose()),this.views.delete(e))}handle(e){switch(e.k){case`shot`:{let e=this.car.muzzle.getWorldPosition(Wh.clone()),t=Gh.copy(this.target).sub(e).normalize();this.fx.muzzle(e,t),this.car.fireKick();let n=this.game.lastShot?md(this.game.lastShot.d,this.game.lastShot.x,this.game.lastShot.h,Kh):this.target;this.fx.tracer(e,n,16765471),this.game.lastShot||this.fx.impact(this.target,16765471);break}case`hit`:this.fx.impact(md(e.d,e.x,e.h,Wh),16777215);break;case`kill`:this.fx.explosion(md(e.d,e.x,e.h,Wh),e.size,e.color);break;case`land`:this.susp.hv-=2.4,this.susp.pv-=1.2;break;case`hurt`:this.susp.rv+=(Math.random()-.5)*5,this.susp.pv-=1.6,this.susp.yv+=(Math.random()-.5)*3;break;case`shift`:this.susp.pv+=.9;break;case`pickup`:this.fx.pickupBurst(md(e.d,e.x,1.2,Wh),16765471);break;case`boss`:if(e.phase===`down`){let e=Wh.copy(this.camera.position),t=this.game.boss?md(this.game.boss.d,this.game.boss.x,1.5,Gh):e;this.fx.shockwave(t,8),this.fx.confetti(t),this.fx.debris(t,16747008,30),this.whiteFlash=.8}else e.style===`village`&&(this.decor&&this.scene.remove(this.decor),this.decor=Wm(),this.decorD=this.game.villageBase,md(this.game.villageBase+20,0,0,this.decor.position),this.decor.rotation.y=0,this.scene.add(this.decor))}}},Jh=[`action`,`pause`,`recenter`,`up`,`down`,`left`,`right`,`back`,`power`,`home`];function Yh(e){let t={Space:` `,Escape:`Escape`,Enter:`Enter`}[e]??(e.startsWith(`Arrow`)?e:e.replace(/^Key|^Digit/,``).toLowerCase()),n=document.activeElement&&document.activeElement!==document.body?document.activeElement:window;for(let r of[`keydown`,`keyup`])n.dispatchEvent(new KeyboardEvent(r,{code:e,key:t,bubbles:!0,cancelable:!0}))}function Xh({x:e,y:t},n,r,i,{w:a,h:o}){let s=Math.abs(n?.beta)>3?n.beta:0,c=Math.abs(n?.alpha)>3?n.alpha:0;return{x:Math.max(4,Math.min(a-4,e-s*r*i)),y:Math.max(4,Math.min(o-4,t-c*r*i)),moving:!!(s||c)}}var Zh=e=>e===`swing`||e===`slice`;function Qh({layout:e,title:t,stream:n,buttons:r,keys:i,menuCursor:a}={}){let o=typeof window<`u`&&window.parent!==window,s=new Map,c={connected:!1,transport:`none`,latency:0,pin:``,padUrl:``},l=e=>{o&&window.parent.postMessage({exemoo:1,...e},location.origin)},u=e,d=null,f=null,p=!1,m=()=>{let e=p||(n??Zh(u));(d!==null||p)&&e!==d&&(d=e,l({type:`stream`,on:e}))},h=(e,t)=>{for(let n of s.get(e)||[])try{n(t)}catch(t){console.error(`[exemoo sdk] ${e} listener failed`,t)}};o&&(window.addEventListener(`message`,e=>{if(e.source!==window.parent||e.origin!==location.origin)return;let t=e.data;if(t&&t.exemoo===1){if(t.type===`status`)Object.assign(c,{connected:!!t.connected,transport:t.transport,latency:t.latency,pin:t.pin||``,padUrl:t.padUrl||``}),h(`status`,{...c});else if(t.type===`packet`)h(`packet`,t.p);else if(t.type===`pose`)h(`pose`,t.pose);else if(t.type===`camera`)h(`camera`,!!t.on);else if(t.type===`button`){let e=t.b===`action`?f?.hot():null;if(e&&!e.disabled){e.click();return}i?.[t.b]&&Yh(i[t.b]),h(`button`,t.b)}else t.type===`message`&&h(`message`,t.m)}}),l({type:`ready`,layout:e,title:t,stream:n,buttons:r}));let g={inShell:o,phone:c,on(e,t){return s.has(e)||s.set(e,new Set),s.get(e).add(t),()=>s.get(e)?.delete(t)},held(e,t){let n=Jh.indexOf(t);return n>=0&&!!(e.buttons&1<<n)},setLayout(e,t,r){u=e,l({type:`layout`,layout:e,title:t,buttons:r}),d!==null&&(d=p||(n??Zh(u)),l({type:`stream`,on:d}))},setStream:e=>l({type:`stream`,on:!!e}),haptic:(e=20)=>l({type:`haptic`,pattern:e}),send:e=>l({type:`send`,m:e}),setCamera:e=>l({type:`camera`,on:!!e}),exit:()=>l({type:`exit`}),airCursor({active:e=()=>!0,speed:t=9}={}){let n=document.createElement(`div`);n.style.cssText=`position:fixed;left:0;top:0;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;border:5px solid #1b1b3a;background:#ffd21fcc;box-shadow:0 4px 0 #1b1b3a;pointer-events:none;z-index:99999;opacity:0;transition:opacity .25s,transform .05s`,document.body.append(n);let r=innerWidth/2,i=innerHeight/2,a=0,o=0,s=null,c=e=>{e!==s&&(s&&(s.style.outline=``),s=e,s&&(s.style.outline=`5px solid #ffd21f`,s.style.outlineOffset=`3px`,l({type:`haptic`,pattern:8})))};return this.on(`packet`,s=>{let l=a?Math.min(.1,(s.t-a>>>0||16)/1e3):0;if(a=s.t,!e())return n.style.opacity=`0`,c(null);let u=Xh({x:r,y:i},s.gyro,l,t,{w:innerWidth,h:innerHeight});u.moving?o=0:o+=l,{x:r,y:i}=u,n.style.transform=`translate(${r}px,${i}px)`,n.style.opacity=o<4?`1`:`0`,c(o<4?document.elementFromPoint(r,i)?.closest(`button, a, [role=button], input, select, [data-nav]`)??null:null)}),setInterval(()=>{let t=!!e();t||(n.style.opacity=`0`,c(null)),p!==t&&(p=t,m())},200),f={hot:()=>s?.isConnected?s:null,center:()=>(r=innerWidth/2,i=innerHeight/2)},f},nav(e,{skip:t=``}={}){let n=[...document.querySelectorAll(`button`)].filter(e=>e.getClientRects().length&&getComputedStyle(e).visibility!==`hidden`&&!e.disabled&&!(t&&e.matches(t)));if(!n.length)return!1;let r=n.indexOf(document.activeElement);if(e===`action`)(r>=0?n[r]:n[0]).click();else if([`up`,`down`,`left`,`right`].includes(e)){let t=n[(r+(e===`up`||e===`left`?-1:1)+n.length)%n.length];t.focus(),t.scrollIntoView?.({block:`nearest`})}else return!1;return!0}};if(o&&typeof a==`function`){let e=()=>g.airCursor({active:a});document.body?e():addEventListener(`DOMContentLoaded`,e,{once:!0})}return g}var $h=1397050930,eg={a:`action`,b:`back`,select:`action`},tg=e=>eg[e]||e;function ng(e,t,n){let r=Math.PI/360,i=(e||0)*r,a=(t||0)*r,o=(n||0)*r,s=Math.cos(i),c=Math.sin(i),l=Math.cos(a),u=Math.sin(a),d=Math.cos(o),f=Math.sin(o);return{x:u*d*s-l*f*c,y:l*f*s+u*d*c,z:l*d*c+u*f*s,w:l*d*s-u*f*c}}function rg({x:e,y:t,z:n,w:r}){let i=1-2*(t*t+n*n),a=2*(e*t-r*n),o=2*(e*t+r*n),s=1-2*(e*e+n*n),c=2*(e*n-r*t),l=2*(t*n+r*e),u=1-2*(e*e+t*t),d=Math.asin(Math.max(-1,Math.min(1,-c))),f,p;Math.abs(c)<.9999999?(f=Math.atan2(l,u),p=Math.atan2(o,i)):(f=0,p=Math.atan2(-a,s));let m=180/Math.PI;return ng(p*m,f*m,d*m)}var ig=e=>Number.isFinite(e)?e:0;function ag(e,{repairLegacy:t=!0}={}){let n;if(e instanceof ArrayBuffer)n=new DataView(e);else if(ArrayBuffer.isView(e))n=new DataView(e.buffer,e.byteOffset,e.byteLength);else return null;if(n.byteLength<40)return null;let r=n.getUint32(0,!0),i=r===$h;if(!i&&r!==1397050929||i&&n.byteLength<56)return null;let a={x:ig(n.getFloat32(12,!0)),y:ig(n.getFloat32(16,!0)),z:ig(n.getFloat32(20,!0)),w:ig(n.getFloat32(24,!0))},o=Math.hypot(a.x,a.y,a.z,a.w);return a=o<1e-6?{x:0,y:0,z:0,w:1}:{x:a.x/o,y:a.y/o,z:a.z/o,w:a.w/o},!i&&t&&(a=rg(a)),{seq:n.getUint32(4,!0),t:n.getUint32(8,!0),q:a,acc:{x:ig(n.getFloat32(28,!0)),y:ig(n.getFloat32(32,!0)),z:ig(n.getFloat32(36,!0))},gyro:i?{alpha:ig(n.getFloat32(40,!0)),beta:ig(n.getFloat32(44,!0)),gamma:ig(n.getFloat32(48,!0))}:{alpha:0,beta:0,gamma:0},buttons:i?n.getUint32(52,!0):0}}var og=class{#e=new Map;on(e,t){return this.#e.has(e)||this.#e.set(e,new Set),this.#e.get(e).add(t),()=>this.#e.get(e)?.delete(t)}emit(e,...t){for(let n of this.#e.get(e)||[])try{n(...t)}catch(t){console.error(`[exemoo] ${e} listener failed`,t)}}},sg=[{urls:`stun:stun.l.google.com:19302`}];function cg(){return typeof location>`u`?`http://localhost:8080/api/signal`:`${location.origin}/api/signal`}var lg=class{#e=null;#t=0;#n=0;#r=0;constructor({pingMs:e=5e3,deadMs:t=12e3,ping:n,onDead:r}){this.pingMs=e,this.deadMs=t,this.ping=n,this.onDead=r}start(){this.stop(),this.#t=0,this.#r=Date.now(),this.#e=setInterval(()=>this.#a(),Math.max(50,Math.min(1e3,Math.floor(this.pingMs/2))))}stop(){clearInterval(this.#e),this.#e=null,this.#t=0}seen(){this.#t=0}probe(e=3e3){this.#e&&(this.#i(),this.#n=Math.min(this.deadMs,e))}#i(){let e=Date.now();this.#r=e;try{if(this.ping()===!1)return}catch{return}this.#t=e,this.#n=this.deadMs}#a(){let e=Date.now();this.#t&&e-this.#t>this.#n?(this.stop(),this.onDead()):!this.#t&&e-this.#r>=this.pingMs&&this.#i()}};function ug(e,t=500,n=8e3){let r=Math.min(n,t*2**Math.max(0,e));return Math.round(r*(.75+Math.random()*.5))}function dg({onVisible:e,onOnline:t,onRestore:n,onHide:r}={}){if(typeof window>`u`||typeof window.addEventListener!=`function`)return()=>{};let i=()=>{document.visibilityState===`visible`?e?.():r?.({persisted:!0})},a=()=>t?.(),o=e=>{e.persisted&&n?.()},s=e=>r?.({persisted:!!e.persisted});return document.addEventListener(`visibilitychange`,i),window.addEventListener(`online`,a),window.addEventListener(`pageshow`,o),window.addEventListener(`pagehide`,s),()=>{document.removeEventListener(`visibilitychange`,i),window.removeEventListener(`online`,a),window.removeEventListener(`pageshow`,o),window.removeEventListener(`pagehide`,s)}}var fg=15,pg=45e3,mg=class{static CONNECTING=0;static OPEN=1;static CLOSING=2;static CLOSED=3;readyState=0;binaryType=`arraybuffer`;bufferedAmount=0;onopen=null;onmessage=null;onclose=null;onerror=null;#e;#t;#n=1500;#r=[];#i=null;#a=null;#o=!1;#s=null;#c=0;#l=null;constructor(e,{fetchImpl:t,pollMs:n}={}){this.url=e,this.#e=e,this.#t=t??((...e)=>fetch(...e)),n!==void 0&&(this.#n=n),setTimeout(()=>{this.readyState===0&&(this.readyState=1,this.onopen?.({type:`open`}))},0),typeof addEventListener==`function`&&(this.#l=()=>this.#u(1012,!0),addEventListener(`pagehide`,this.#l))}get pollMs(){return this.#n}set pollMs(e){let t=e>0&&(this.#n<=0||e<this.#n);this.#n=e,(t||e<=0)&&this.#f(e)}send(e){if(this.readyState!==1)throw Error(`PollSocket is not open`);if(typeof e!=`string`)return;let t;try{t=JSON.parse(e)}catch{return}if(!t||typeof t.type!=`string`||t.type===`relay`)return;if(t.type===`ping`){(!this.#s||Date.now()-this.#c<pg)&&setTimeout(()=>this.#m({type:`pong`,timestamp_ms:Date.now()}),0);return}let{token:n,...r}=t;this.#r.push(r),this.#i||=setTimeout(()=>this.#p(),fg)}close(e=1e3){this.#u(e,!0)}#u(e,t){this.readyState>=2||(this.readyState=3,clearTimeout(this.#i),clearTimeout(this.#a),this.#i=this.#a=null,this.#l&&removeEventListener(`pagehide`,this.#l),t&&this.#s&&this.#d({...this.#s,msgs:[{type:`leave`}]}),this.#s=null,setTimeout(()=>this.onclose?.({type:`close`,code:e,wasClean:e===1e3}),0))}#d(e){let t=JSON.stringify(e);try{if(typeof navigator<`u`&&navigator.sendBeacon?.(this.#e,new Blob([t],{type:`text/plain`})))return}catch{}this.#t(this.#e,{method:`POST`,body:t,keepalive:!0,headers:{"Content-Type":`application/json`}}).catch(()=>{})}#f(e=this.#n){clearTimeout(this.#a),this.#a=null,this.readyState!==1||!this.#s||e<=0||(this.#a=setTimeout(()=>{this.#a=null,this.#p()},e))}async#p(){if(clearTimeout(this.#i),this.#i=null,this.readyState!==1||this.#o)return;this.#o=!0,clearTimeout(this.#a),this.#a=null;let e=this.#r.splice(0),t;try{let n=await this.#t(this.#e,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({...this.#s||{},msgs:e}),credentials:`same-origin`,cache:`no-store`});if(!n.ok)throw Error(`HTTP ${n.status}`);t=await n.json()}catch(e){this.#o=!1,this.readyState===1&&(this.onerror?.({type:`error`,error:e}),this.#u(1006,!1));return}if(this.#o=!1,this.readyState===1){this.#c=Date.now();for(let e of Array.isArray(t?.msgs)?t.msgs:[])if(e?.type===`joined`&&typeof e.token==`string`&&(this.#s={pin:String(e.room),role:e.role,token:e.token}),(e?.type===`replaced`||e?.type===`room_expired`||e?.type===`room_closed`)&&(this.#s=null),this.#m(e),this.readyState!==1)return;this.#r.length?this.#p():this.#f()}}#m(e){this.readyState===1&&this.onmessage?.({type:`message`,data:JSON.stringify(e)})}};function hg(e,t){return/^wss?:/i.test(e)&&typeof WebSocket<`u`?new WebSocket(e):new mg(e,t)}function gg(e,t){e instanceof mg&&(e.pollMs=t)}var _g=1e3,vg=3500,yg=5e3,bg=12e3,xg=class extends og{pin=``;status=`idle`;transport=`none`;latencyMs=0;packetRate=0;phoneClockOffsetMs=0;clockRttMs=-1;#e;#t;#n=null;#r=``;#i=``;#a=!0;#o=!1;#s=null;#c=null;#l=[];#u=!1;#d=!1;#f=0;#p;#m=0;#h=null;#g=null;#_;#v=null;#y=0;#b=0;#x=[];#S=0;#C=0;#w=0;constructor({signalUrl:e,storageKey:t=`exemoo.room`,iceServers:n=sg,wsPingMs:r=yg,wsDeadMs:i=bg,retryBaseMs:a=500,retryMaxMs:o=8e3}={}){super(),this.#e=e??cg(),this.#t=t,this.iceServers=n,this.retryBaseMs=a,this.retryMaxMs=o,this.#_=new lg({pingMs:r,deadMs:i,ping:()=>this.#D({type:`ping`}),onDead:()=>this.#A(this.#n,`Connection stalled. Reconnecting...`)});try{let e=JSON.parse(sessionStorage.getItem(t)||`null`);e&&typeof e.pin==`string`&&typeof e.resume==`string`&&(this.pin=e.pin,this.#i=e.resume)}catch{}}get connected(){return this.status===`connected`}start(){this.#a&&(this.#a=!1,this.#m=0,this.#k(),this.#g=setInterval(()=>this.#U(),250),this.#v=dg({onVisible:()=>this.#M(3e3),onOnline:()=>this.#M(2500),onRestore:()=>this.#N()}))}stop(){this.#a=!0,clearTimeout(this.#h),clearInterval(this.#g),this.#h=this.#g=null,this.#_.stop(),this.#v?.(),this.#v=null,this.#R();let e=this.#n;if(this.#n=null,e){e.onclose=e.onmessage=e.onerror=e.onopen=null;try{e.close()}catch{}}this.#o=!1,this.#T(`idle`,void 0,`none`)}send(e){if(this.#c?.readyState===`open`)try{return this.#c.send(JSON.stringify(e)),!0}catch{}return this.#o?this.#D({type:`relay`,payload:e}):!1}#T(e,t,n){let r=n??this.transport;(e!==this.status||t!==this.#p||r!==this.transport)&&(e===`waiting`&&this.status!==`waiting`&&(this.#w=performance.now()),this.status=e,this.#p=t,this.transport=r,this.#E(),this.emit(`status`,e,t))}#E(){let e=this.status,t=1e3;if(e===`connected`&&this.transport===`webrtc`)t=15e3;else if(e===`pairing`)t=500;else if(e===`waiting`){let e=typeof document<`u`&&document.visibilityState===`hidden`,n=performance.now()-this.#w;t=e?3e4:n<12e4?2e3:n<6e5?5e3:15e3}gg(this.#n,t)}#D(e){let t=this.#n;return!t||t.readyState!==1?!1:(t.send(JSON.stringify({...e,token:this.#r})),!0)}#O(){try{sessionStorage.setItem(this.#t,JSON.stringify({pin:this.pin,resume:this.#i}))}catch{}}#k(){if(this.#a)return;this.status!==`disconnected`&&this.#T(`connecting`);let e;try{e=hg(this.#e)}catch(e){return this.#T(`error`,`Bad signalling URL: ${e.message}`,`none`),this.#j()}e.binaryType=`arraybuffer`,this.#n=e,this.#E(),e.onopen=()=>{e.send(JSON.stringify({type:`create_room`,pin:this.pin||void 0,resume:this.#i||void 0})),this.#_.start()},e.onmessage=e=>{if(this.#_.seen(),typeof e.data==`string`){let t;try{t=JSON.parse(e.data)}catch{return}this.#P(t)}else e.data instanceof ArrayBuffer&&(this.#I(),this.#B(e.data))},e.onclose=t=>this.#A(e,`Lost connection to the server. Retrying...`,t?.code===1012)}#A(e,t,n=!1){if(e&&this.#n===e){this.#n=null,this.#r=``,this.#_.stop(),e.onclose=e.onmessage=e.onerror=e.onopen=null;try{e.close()}catch{}this.#a||(this.#c?.readyState!==`open`&&(this.#R(),this.#o=!1,this.#T(`disconnected`,t,`none`)),n&&(this.#m=0),this.#j(n?150+Math.random()*600:void 0))}}#j(e){if(this.#a||this.#h)return;let t=e??ug(this.#m++,this.retryBaseMs,this.retryMaxMs);this.#h=setTimeout(()=>{this.#h=null,this.#k()},t)}#M(e){if(!this.#a){if(this.#w=performance.now(),this.#E(),this.#h)return this.#N();this.#n?.readyState===1&&this.#_.probe(e)}}#N(){this.#a||(clearTimeout(this.#h),this.#h=null,this.#m=0,this.#n?this.#A(this.#n,`Reconnecting...`,!0):this.#k())}#P(e){switch(e.type){case`joined`:{this.#r=String(e.token||``),this.#m=0;let t=this.pin!==e.room;this.pin=String(e.room||``),typeof e.resume==`string`&&(this.#i=e.resume),this.#O(),t&&this.emit(`room`,this.pin),e.peer!==!0&&this.#c?.readyState!==`open`&&this.#T(`waiting`,void 0,`none`),e.peer===!0&&(this.#o=!0);break}case`peer_connected`:e.role===`controller`&&(this.#o=!0,this.#c?.readyState!==`open`&&this.#T(`pairing`,`Phone joined. Connecting...`,`none`));break;case`peer_disconnected`:e.role===`controller`&&this.#F();break;case`offer`:this.#z(String(e.sdp||``)).catch(e=>{console.warn(`[exemoo] WebRTC offer failed`,e),this.#T(`pairing`,`Could not connect to the phone. Is it on the same Wi-Fi?`,`none`)});break;case`candidate`:if(typeof e.name==`string`&&e.name){let t={candidate:e.name,sdpMid:e.media??null,sdpMLineIndex:e.index??null};this.#s&&this.#u?this.#s.addIceCandidate(t).catch(()=>{}):this.#l.push(t)}break;case`relay`:this.#I(),e.payload&&typeof e.payload==`object`&&this.#V(e.payload);break;case`room_expired`:case`room_closed`:this.#R(),this.#o=!1,this.#n?.close();break;case`replaced`:this.pin=``,this.#i=``;try{sessionStorage.removeItem(this.#t)}catch{}this.#n?.close();break;case`error`:console.warn(`[exemoo] server error`,e.code,e.message),e.code===`already_joined`||e.code===`unauthorized`?this.#n?.close():this.pin||this.#T(`error`,String(e.message||e.code||`Server error`),`none`)}}#F(){this.#R(),this.#o=!1,this.latencyMs=0,this.#T(`waiting`,`Phone disconnected`,`none`)}#I(){this.#d=!0,this.#o=!0,this.#c?.readyState!==`open`&&this.#L(`relay`)}phoneTimeToLocal(e){return this.clockRttMs>=0?e-this.phoneClockOffsetMs:null}#L(e){this.#f=performance.now(),this.status!==`connected`&&(this.#b=10,this.#x=[],this.clockRttMs=-1),(this.status!==`connected`||this.transport!==e)&&this.#T(`connected`,void 0,e)}#R(){let e=this.#s;if(this.#s=null,this.#c=null,this.#u=!1,this.#l=[],this.#d=!1,e){e.ondatachannel=e.onicecandidate=e.oniceconnectionstatechange=null;try{e.close()}catch{}}}async#z(e){if(typeof RTCPeerConnection>`u`)throw Error(`WebRTC unavailable`);this.#R(),this.#o=!0;let t=new RTCPeerConnection({iceServers:this.iceServers});this.#s=t,t.onicecandidate=e=>{e.candidate&&this.#D({type:`candidate`,media:e.candidate.sdpMid,index:e.candidate.sdpMLineIndex,name:e.candidate.candidate})},t.oniceconnectionstatechange=()=>{if(this.#s!==t)return;let e=t.iceConnectionState;(e===`failed`||e===`closed`)&&this.transport===`webrtc`&&(this.#c=null,this.#d?this.#L(`relay`):this.#T(`pairing`,`Connection to the phone lost. Reconnecting...`,`none`))},t.ondatachannel=e=>{if(this.#s!==t)return;let n=e.channel;n.binaryType=`arraybuffer`,n.label===`control`?(this.#c=n,n.onopen=()=>this.#L(`webrtc`),n.onclose=()=>{this.#c===n&&(this.#c=null,this.#d&&this.#o?this.#L(`relay`):this.#o&&this.#T(`pairing`,`Reconnecting to phone...`,`none`))},n.onmessage=e=>{if(typeof e.data==`string`)try{this.#V(JSON.parse(e.data))}catch{}},n.readyState===`open`&&this.#L(`webrtc`)):(n.onmessage=e=>{e.data instanceof ArrayBuffer&&this.#B(e.data)},n.label===`sensor_data`&&(n.onopen=()=>this.#L(`webrtc`),n.readyState===`open`&&this.#L(`webrtc`)))},await t.setRemoteDescription({type:`offer`,sdp:e}),this.#u=!0;for(let e of this.#l.splice(0))await t.addIceCandidate(e).catch(()=>{});let n=await t.createAnswer();await t.setLocalDescription(n),this.#D({type:`answer`,sdp:n.sdp})}#B(e){let t=ag(e);t&&(this.#f=performance.now(),this.#S++,this.status!==`connected`&&this.#L(this.#c?.readyState===`open`?`webrtc`:`relay`),this.emit(`packet`,t))}#V(e){if(this.#f=performance.now(),e.t===`pong`&&typeof e.ts==`number`){let t=performance.now()-e.ts;t>=0&&t<5e3&&(this.latencyMs=this.latencyMs?this.latencyMs*.8+t/2*.2:t/2),t>=0&&t<5e3&&typeof e.pt==`number`&&this.#H(t,e.pt-(e.ts+t/2))}else e.t===`ping`&&typeof e.ts==`number`?this.send({t:`pong`,ts:e.ts}):e.t===`transport`?(e.via===`relay`&&this.#c&&(this.#R(),this.#d=!0),this.#L(this.#c?.readyState===`open`?`webrtc`:`relay`)):(this.status!==`connected`&&this.#L(this.#c?.readyState===`open`?`webrtc`:`relay`),typeof e.t==`string`&&this.emit(`message`,e))}#H(e,t){this.#x.push({rtt:e,offset:t}),this.#x.length>16&&this.#x.shift();let n=this.#x.reduce((e,t)=>t.rtt<e.rtt?t:e);this.clockRttMs=n.rtt,this.phoneClockOffsetMs=n.offset}#U(){let e=performance.now();this.#E(),e-this.#C>=1e3&&(this.packetRate=Math.round(this.#S*1e3/(e-this.#C||1e3)),this.#S=0,this.#C=e),this.#o&&((this.#b>0||e-this.#y>=_g)&&(this.#b>0&&this.#b--,this.#y=e,this.send({t:`ping`,ts:e})),this.status===`connected`&&e-this.#f>vg?this.#T(`pairing`,`Phone not responding...`,this.transport):this.status===`pairing`&&this.transport!==`none`&&e-this.#f<500&&this.#T(`connected`,void 0,this.transport))}},Sg=180/Math.PI,Cg=26,wg=16,Tg=.5,Eg=.56,Dg=(e,t,n)=>Math.min(n,Math.max(t,e)),Og=e=>((e+180)%360+360)%360-180;function kg(e,t){let n=2*(t.y*e.z-t.z*e.y),r=2*(t.z*e.x-t.x*e.z),i=2*(t.x*e.y-t.y*e.x);return{x:e.x+t.w*n+(t.y*i-t.z*r),y:e.y+t.w*r+(t.z*n-t.x*i),z:e.z+t.w*i+(t.x*r-t.y*n)}}function Ag(e){let t={x:0,y:1,z:0},n=kg(t,e);return Math.abs(n.z)>.82&&(t={x:0,y:0,z:-1},n=kg(t,e)),{axis:t,yaw:Math.atan2(n.x,n.y)*Sg,pitch:Math.asin(Dg(n.z,-1,1))*Sg}}var jg=class{rx=Tg;ry=Eg;ref=null;qLive=!1;gyroYaw=0;gyroPitch=0;lastT=0;push(e){let t=e.q??{x:0,y:0,z:0,w:1};!this.qLive&&Math.abs(t.x)+Math.abs(t.y)+Math.abs(t.z)>1e-4&&(this.qLive=!0,this.ref=null);let n=this.lastT?Dg((e.t-this.lastT>>>0||16)/1e3,0,.1):0;this.lastT=e.t;let r,i;if(this.qLive){this.ref||=Ag(t);let e=kg(this.ref.axis,t);r=Og(Math.atan2(e.x,e.y)*Sg-this.ref.yaw),i=Math.asin(Dg(e.z,-1,1))*Sg-this.ref.pitch}else{let t=e.gyro??{alpha:0,beta:0,gamma:0};Math.abs(t.beta)>2&&(this.gyroYaw-=t.beta*n),Math.abs(t.alpha)>2&&(this.gyroPitch+=t.alpha*n),this.gyroYaw=Dg(this.gyroYaw,-28.6,Cg*1.1),this.gyroPitch=Dg(this.gyroPitch,-17.6,wg*1.1),r=this.gyroYaw,i=this.gyroPitch}this.rx=Dg(Tg+r/52,.02,.98),this.ry=Dg(Eg-i/32,.04,.9)}recenter(){this.ref=null,this.gyroYaw=0,this.gyroPitch=0,this.rx=Tg,this.ry=Eg}},Mg=1500,Ng={driver:`#ff3b30`,shooter:`#2f7cff`},Pg={driver:`Back2Back · Driver`,shooter:`Back2Back · Shooter`},Fg={driver:`kart`,shooter:`swing`},Ig={driver:`kart`,shooter:`swing`},Lg=class{sdk=Qh({layout:`remote`,title:`Back2Back`,menuCursor:()=>this.mode===`menu`});inShell=this.sdk.inShell;driverLink=null;shooterLink;padBase=`${location.origin}/pad`;mode=`menu`;driver={connected:!1,pin:``,last:0,steer:0,gas:!1,brake:!1,nitro:!1,drift:!1};shooter={connected:!1,pin:``,last:0,aim:new jg,fire:!1};onButton=()=>{};onChange=()=>{};keys=new Set;mx=.5;my=.56;mouseFire=!1;constructor(){this.inShell?(this.sdk.on(`status`,e=>{let t=this.driver.connected;this.driver.connected=!!e.connected,this.driver.last=this.driver.connected?performance.now():0,this.driver.connected&&!t&&this.applyMode(`driver`),this.onChange()}),this.sdk.on(`message`,e=>this.onDriverMessage(e)),this.sdk.on(`button`,e=>this.onButton(`driver`,tg(e)))):this.driverLink=this.makeLink(`driver`,`back2back.room1`),this.shooterLink=this.makeLink(`shooter`,`back2back.room2`),this.bindInput(),fetch(`/api/info`,{cache:`no-store`}).then(e=>e.json()).then(e=>{e?.padUrl&&(this.padBase=e.padUrl),Array.isArray(e?.iceServers)&&(this.driverLink&&(this.driverLink.iceServers=e.iceServers),this.shooterLink.iceServers=e.iceServers),this.driverLink?.start(),this.shooterLink.start(),this.onChange()}).catch(()=>{this.driverLink?.start(),this.shooterLink.start()})}makeLink(e,t){let n=new xg({storageKey:t}),r=e===`driver`?this.driver:this.shooter;return n.on(`room`,()=>{r.pin=n.pin,this.onChange()}),n.on(`status`,t=>{let i=t===`connected`,a=r.connected;r.connected=i,r.pin=n.pin||r.pin,i||(r.last=0),i&&!a&&this.applyMode(e),this.onChange()}),n.on(`message`,t=>{t.t===`button`?this.onButton(e,tg(t.b??``)):e===`driver`&&t.t===`in`&&this.onDriverMessage(t)}),e===`shooter`&&n.on(`packet`,e=>{this.shooter.aim.push(e),this.shooter.fire=!!(e.buttons&1),this.shooter.last=performance.now()}),n}onDriverMessage(e){if(e.t!==`in`)return;let t=this.driver;t.steer=Math.max(-1,Math.min(1,Number(e.s)||0)),t.gas=!!e.g,t.brake=!!e.b,t.nitro=!!e.i,t.drift=!!e.d,t.last=performance.now()}setMode(e){this.mode=e,this.applyMode(`driver`),this.applyMode(`shooter`)}applyMode(e){let t=this.mode===`play`,n=t?Fg[e]:`remote`;if(e===`driver`&&this.inShell){this.sdk.setLayout(n,Pg.driver,[]),this.sdk.send({t:`theme`,color:Ng.driver});return}let r=e===`driver`?this.driverLink:this.shooterLink;r?.connected&&(r.send({t:`layout`,layout:n,title:Pg[e],buttons:[]}),r.send({t:`theme`,color:Ng[e]}),e===`shooter`&&r.send({t:`stream`,on:t}))}haptic(e,t){if(e===`driver`&&this.inShell)return void this.sdk.haptic(t);let n=e===`driver`?this.driverLink:this.shooterLink;n?.connected&&n.send({t:`haptic`,pattern:t})}nav(e){this.sdk.nav(e)}isPhone(e){let t=e===`driver`?this.driver:this.shooter;return t.connected&&performance.now()-t.last<Mg}padUrl(e){let t=e===`driver`?this.driverLink?.pin??``:this.shooterLink.pin;return t?`${this.padBase}?pin=${t}&layout=${Ig[e]}&title=${encodeURIComponent(Pg[e])}`:``}driveInput(){let e=this.driver;if(e.connected)return{steer:e.steer,gas:e.gas,brake:e.brake,nitro:e.nitro,drift:e.drift};let t=this.keys;return{steer:(t.has(`ArrowRight`)||t.has(`KeyD`)?1:0)-(t.has(`ArrowLeft`)||t.has(`KeyA`)?1:0),gas:t.has(`ArrowUp`)||t.has(`KeyW`),brake:t.has(`ArrowDown`)||t.has(`KeyS`),nitro:t.has(`ShiftLeft`)||t.has(`ShiftRight`)||t.has(`KeyE`),drift:t.has(`KeyZ`)||t.has(`ControlLeft`)}}aimInput(){return this.isPhone(`shooter`)?{rx:this.shooter.aim.rx,ry:this.shooter.aim.ry,fire:this.shooter.fire}:{rx:this.mx,ry:this.my,fire:this.mouseFire||this.keys.has(`Space`)}}inputLabel(e){return this.isPhone(e)?`phone`:`keys`}bindInput(){let e=new Set([`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`Space`]);window.addEventListener(`keydown`,t=>{this.keys.add(t.code),e.has(t.code)&&t.preventDefault()}),window.addEventListener(`keyup`,e=>this.keys.delete(e.code)),window.addEventListener(`blur`,()=>this.keys.clear()),window.addEventListener(`pointermove`,e=>{this.mx=Math.max(0,Math.min(1,e.clientX/innerWidth)),this.my=Math.max(0,Math.min(1,e.clientY/innerHeight))}),window.addEventListener(`pointerdown`,e=>{e.button===0&&(this.mouseFire=!0)}),window.addEventListener(`pointerup`,()=>this.mouseFire=!1)}},Rg={crosshairSize:1,crosshairStyle:`ring`,crosshairColor:`blue`,aimSens:1,steerSens:1,volume:.7,engine:!0,quality:`high`,shake:`full`},zg={blue:`#2f7cff`,red:`#ff3b30`,green:`#2fc65a`,yellow:`#ffd21f`,white:`#ffffff`},Bg=e=>`${Math.round(Number(e)*100)}%`,Vg=[{key:`crosshairSize`,label:`Crosshair size`,group:`Shooter`,kind:`num`,min:.5,max:2,step:.1,fmt:Bg},{key:`crosshairStyle`,label:`Crosshair style`,group:`Shooter`,kind:`choice`,choices:[`ring`,`dot`,`cross`]},{key:`crosshairColor`,label:`Crosshair colour`,group:`Shooter`,kind:`choice`,choices:[`blue`,`red`,`green`,`yellow`,`white`]},{key:`aimSens`,label:`Aim sensitivity`,group:`Shooter`,kind:`num`,min:.6,max:1.8,step:.1,fmt:Bg},{key:`steerSens`,label:`Steering sensitivity`,group:`Driver`,kind:`num`,min:.6,max:1.6,step:.1,fmt:Bg},{key:`volume`,label:`Volume`,group:`Game`,kind:`num`,min:0,max:1,step:.1,fmt:Bg},{key:`engine`,label:`Engine sound`,group:`Game`,kind:`choice`,choices:[`on`,`off`],fmt:e=>e?`On`:`Off`},{key:`quality`,label:`Graphics`,group:`Game`,kind:`choice`,choices:[`high`,`low`]},{key:`shake`,label:`Camera shake`,group:`Game`,kind:`choice`,choices:[`off`,`low`,`full`]}],Hg=`back2back.settings`;function Ug(){let e={...Rg};try{let t=JSON.parse(localStorage.getItem(Hg)??`{}`);for(let n of Vg){let r=t[n.key];r!==void 0&&(n.kind===`num`&&typeof r==`number`?e[n.key]=Math.min(n.max??1,Math.max(n.min??0,r)):n.key===`engine`&&typeof r==`boolean`?e.engine=r:n.kind===`choice`&&n.key!==`engine`&&typeof r==`string`&&n.choices?.includes(r)&&(e[n.key]=r))}}catch{}return e}function Wg(e){try{localStorage.setItem(Hg,JSON.stringify(e))}catch{}}function Gg(e,t,n){let r=Vg.find(e=>e.key===t);if(!r)return;let i=e;if(r.kind===`num`){let e=Math.round((Number(i[t])+n*(r.step??.1))*100)/100;i[t]=Math.min(r.max??1,Math.max(r.min??0,e))}else if(t===`engine`)e.engine=!e.engine;else{let e=r.choices??[];i[t]=e[(e.indexOf(String(i[t]))+n+e.length)%e.length]}}function Kg(e,t){let n=e[t.key];if(t.fmt)return t.fmt(n);let r=String(n);return r.charAt(0).toUpperCase()+r.slice(1)}function qg(e,t){let n=zg[t],r;return r=e===`dot`?`<circle r="4.5" fill="${n}" stroke="#1b1b3a" stroke-width="3"/>`:e===`cross`?`<path d="M-20 0H-6M6 0H20M0-20V-6M0 6V20" stroke="#1b1b3a" stroke-width="8" stroke-linecap="round"/><path d="M-20 0H-6M6 0H20M0-20V-6M0 6V20" stroke="${n}" stroke-width="4" stroke-linecap="round"/>`:`<circle r="15" fill="none" stroke="#1b1b3a" stroke-width="7"/><circle r="15" fill="none" stroke="${n}" stroke-width="4"/><circle r="2.5" fill="${n}"/>`,`<svg viewBox="-40 -40 80 80">${r}<circle id="xhRing" r="26" fill="none" stroke="#ffd21f" stroke-width="5" stroke-dasharray="163.4" transform="rotate(-90)"/></svg>`}var Jg={engine:`Engine`,armor:`Armor`,rapid:`Rapid`,spread:`Spread`,shield:`Shield`,repair:`Repair`},Yg={engine:`#ff8a00`,armor:`#2f7cff`,rapid:`#ffd21f`,spread:`#2fc65a`,shield:`#9b4dff`,repair:`#ff3b30`},Xg=e=>e.replace(/[&<>"']/g,e=>`&#${e.charCodeAt(0)};`);function Zg(e){return Jg[e]}function Qg(e,t){t.innerHTML=`
    <div id="stormFx"></div>
    <div class="hud-top">
      <div class="hcard drv"><b>DRIVER</b><span class="hull" id="hHull"></span><small id="hSpeed"></small><small id="hDrift"></small><div class="storm"><u id="hStormFill"></u></div><small id="hStorm"></small></div>
      <div class="hcard mid"><div id="hDist">0 m</div><div class="small" id="hScore">0</div><div class="lvl" id="hLevel">Level 1</div><div class="combo" id="hCombo"></div></div>
      <div class="hcard shot"><b>SHOOTER</b><span id="hKills">0</span><small id="hReady"></small><div class="heat"><u id="hHeat"></u></div></div>
    </div>
    <div class="bossbar" id="hBoss"><b id="hBossName">MEGA HARVESTER</b><i><u id="hBossFill"></u></i></div>
    <div class="hud-bot">
      <div class="chips" id="hUpg"></div>
      <div class="nitro" id="hNitro"></div>
      <div class="conn" id="hConn"></div>
    </div>`;let n=e=>document.getElementById(e),r=``,i=t=>{e.innerHTML=t,e.classList.add(`on`)},a=(t,n)=>e.querySelector(t)?.addEventListener(`click`,n);return{hideOverlay(){e.classList.remove(`on`),e.innerHTML=``},showTitle(t){i(`
        <div class="menu">
          <div class="menu-main">
            <h1 class="logo">BACK<span>2</span>BACK</h1>
            <p class="tag">One drives. One shoots. Outrun the storm.</p>
            <div class="menu-btns">
              <button class="btn yellow big" id="bPlay">Play</button>
              <button class="btn blue" id="bHow">How to play</button>
              <button class="btn" id="bSet">Settings</button>
              ${t.onExit?`<button class="btn ghost" id="bExit">Exit</button>`:``}
            </div>
          </div>
          <div class="menu-side">
            <div class="role red"><b>Player 1 · Driver</b><span>Tilt to steer. Hold GAS: the storm is chasing you.</span></div>
            <div class="role blue"><b>Player 2 · Shooter</b><span>Aim with your phone, hold Action to fire.</span></div>
            <div class="best"><b>${t.best>0?`${Math.round(t.best)} m`:`–`}</b><span>best run</span></div>
          </div>
        </div>`),a(`#bPlay`,t.onPlay),a(`#bHow`,t.onHow),a(`#bSet`,t.onSettings),t.onExit&&a(`#bExit`,t.onExit),e.querySelector(`#bPlay`)?.focus()},showHow(t){i(`
        <div class="panel how">
          <h2>How to play</h2>
          <div class="roles">
            <div class="role red"><b>Driver</b><span>Tilt the phone to steer. GAS keeps you moving, BRAKE slows, DRIFT through bends for a boost, ITEM fires nitro. Ramps and boost pads help you gain ground.</span></div>
            <div class="role blue"><b>Shooter</b><span>Point your phone at the screen to aim. Hold Action to fire. Headshots on vehicles crit; the gun overheats if you hold it too long.</span></div>
          </div>
          <ul class="tips">
            <li><b>The storm</b> starts behind you and gets faster all the time. Watch the purple bar on the driver card: stay ahead, or it catches you.</li>
            <li><b>Every zone ends in a boss.</b> A harvester, or a bandit village you drive through: shoot the gate open and fell the chief, or the guards get a free attack as you pass.</li>
            <li><b>Stay on the road.</b> The verge slows you down and the ditch hurts.</li>
          </ul>
          <p class="hint">No phone? Driver: ← → steer, ↑ gas, ↓ brake, Z drift, Shift nitro. Shooter: mouse aims, click or Space fires. P / Esc pauses.</p>
          <div class="row"><button class="btn yellow big" id="bBack">Back</button></div>
        </div>`),a(`#bBack`,t.onBack),e.querySelector(`#bBack`)?.focus()},showSettings(t){let n=[`Shooter`,`Driver`,`Game`].map(e=>`<div class="sgroup"><h3>${e}</h3>${Vg.filter(t=>t.group===e).map(e=>`<div class="srow"><span class="slabel">${e.label}</span>
                <button class="btn step" data-k="${e.key}" data-d="-1" aria-label="${e.label} down">‹</button>
                <span class="sval" id="v_${e.key}">${Kg(t.s,e)}</span>
                <button class="btn step" data-k="${e.key}" data-d="1" aria-label="${e.label} up">›</button></div>`).join(``)}</div>`).join(``);i(`
        <div class="panel settings">
          <h2>Settings</h2>
          <div class="sbody">
            <div class="scols">${n}</div>
            <div class="spreview"><div class="xprev" style="--xh:${Math.round(44*t.s.crosshairSize)}px">${qg(t.s.crosshairStyle,t.s.crosshairColor)}</div><span>Crosshair preview</span></div>
          </div>
          <div class="row">
            <button class="btn ghost" id="bReset">Reset</button>
            <button class="btn yellow big" id="bBack">Done</button>
          </div>
        </div>`),e.querySelectorAll(`button.step`).forEach(e=>e.addEventListener(`click`,()=>t.onStep(e.dataset.k,Number(e.dataset.d)))),a(`#bReset`,t.onReset),a(`#bBack`,t.onBack),((t.focus?e.querySelector(t.focus):null)??e.querySelector(`button.step`))?.focus()},showPairing(e){let t=e=>`
        <div class="pcard" style="--c:${e.color}">
          <div class="ptitle">${Xg(e.label)}</div>
          ${e.connected?`<div class="pok">Phone connected ✓</div>`:e.qrSrc?`<img class="qr" alt="QR code" src="${Xg(e.qrSrc)}" />`:`<div class="qrwait">…</div>`}
          ${e.pin&&!e.connected?`<div class="pin">PIN ${Xg(e.pin)}</div>`:``}
          <div class="psub">${Xg(e.sub)}</div>
        </div>`;i(`
        <div class="panel pairing">
          <h2>Pair your phones</h2>
          <div class="cards">${t(e.driver)}${t(e.shooter)}</div>
          <div class="row">
            <button class="btn ghost" id="bBack">Back</button>
            <button class="btn yellow big" id="bGo">Start run</button>
          </div>
          <p class="hint">Phones are optional: the keyboard and mouse can play either seat.</p>
        </div>`),a(`#bGo`,e.onStart),a(`#bBack`,e.onBack)},showCountdown(t){i(`<div class="count">${t>0?t:`GO!`}</div>`),e.querySelector(`.count`)?.classList.add(`pop`)},showPause(e){i(`
        <div class="panel">
          <h2>Paused</h2>
          <div class="col">
            <button class="btn yellow big" id="bResume">Resume</button>
            <button class="btn blue" id="bRestart">Restart</button>
            <button class="btn" id="bSet">Settings</button>
            <button class="btn ghost" id="bQuit">Quit</button>
          </div>
        </div>`),a(`#bResume`,e.onResume),a(`#bRestart`,e.onRestart),a(`#bSet`,e.onSettings),a(`#bQuit`,e.onQuit)},showResults(e){i(`
        <div class="panel results">
          <h2>${e.isBest?`New best!`:e.storm?`Swallowed by the storm`:`Wrecked`}</h2>
          <div class="stats">
            <div><b>${Math.round(e.dist)} m</b><span>distance</span></div>
            <div><b>${Math.round(e.score)}</b><span>score</span></div>
            <div><b>${e.kills}</b><span>kills</span></div>
            <div><b>${e.accuracy}%</b><span>accuracy</span></div>
            <div><b>${e.level}</b><span>level</span></div>
            <div><b>${Math.round(e.best)} m</b><span>best</span></div>
          </div>
          <div class="row">
            <button class="btn ghost" id="bQuit">Menu</button>
            <button class="btn yellow big" id="bAgain">Run again</button>
          </div>
        </div>`),a(`#bAgain`,e.onAgain),a(`#bQuit`,e.onQuit)},hudShow(e){t.classList.toggle(`hidden`,!e)},hudUpdate(e){let i=Array.from({length:e.maxHull},(t,n)=>n<e.hull?`♥`:`·`).join(` `),a=Object.keys(e.upg).filter(t=>e.upg[t]>0).map(t=>`<i style="background:${Yg[t]}">${Jg[t]} ×${e.upg[t]}</i>`).join(``)+(e.shield>0?`<i style="background:${Yg.shield}">Shield ${Math.ceil(e.shield)}s</i>`:``),o=[i,e.speed|0,e.gear,e.dist|0,e.score|0,e.level,e.kills,a,e.nitroReady,e.nitroOn,Math.round(e.storm/2),e.speed>e.stormV,e.mult,e.heat.toFixed(2),e.overheated,e.drift.toFixed(1),e.driftTier,e.air,e.comboFrac.toFixed(1),e.boss===null?-1:e.boss.toFixed(2),e.bossName,e.zone,e.ready.toFixed(2),e.driverIn,e.shooterIn,e.driverOn,e.shooterOn].join(`|`);if(o===r)return;r=o,n(`hHull`).textContent=i,n(`hSpeed`).textContent=`${Math.round(e.speed*3.6)} km/h · G${e.gear}`,n(`hDist`).textContent=`${Math.round(e.dist)} m`,n(`hScore`).textContent=`${Math.round(e.score)} pts`,n(`hLevel`).textContent=`${e.zone} · Lv ${e.level}`,n(`hCombo`).textContent=e.mult>1?`COMBO ×${e.mult}`:``,n(`hBossName`).textContent=e.bossName,n(`hBoss`).classList.toggle(`on`,e.boss!==null),n(`hBossFill`).style.width=`${Math.max(0,(e.boss??0)*100)}%`,n(`hKills`).textContent=`${e.kills} down`,n(`hReady`).textContent=e.overheated?`OVERHEAT!`:e.ready>=1?`Ready`:`Reloading`;let s=n(`hHeat`);s.style.width=`${Math.round(e.heat*100)}%`,s.parentElement?.classList.toggle(`hot`,e.overheated||e.heat>.75);let c=Math.max(0,e.storm),l=Math.max(0,Math.min(1,1-c/260)),u=n(`hStormFill`);u.style.width=`${Math.round(l*100)}%`,u.parentElement?.classList.toggle(`hot`,c<90),n(`hStorm`).textContent=`STORM ${Math.round(c)} m ${e.speed>e.stormV?`▲ pulling away`:`▼ closing in`}`,n(`hStorm`).classList.toggle(`hot`,c<90),t.style.setProperty(`--storm`,String(Math.max(0,Math.min(1,1-c/140)).toFixed(2))),n(`hDrift`).textContent=e.air?`AIRBORNE`:e.driftTier>0?`DRIFT ${`★`.repeat(e.driftTier)}`:e.drift>0?`drifting…`:``,n(`hUpg`).innerHTML=a,n(`hNitro`).textContent=e.nitroOn?`NITRO!`:e.nitroReady?`Nitro ready (ITEM)`:`Nitro recharging`,n(`hNitro`).classList.toggle(`on`,e.nitroOn),n(`hConn`).innerHTML=`<span class="${e.driverOn?`dot on`:`dot`}"></span>Driver · ${e.driverIn===`phone`?`phone`:`keys`}
        <span class="${e.shooterOn?`dot on`:`dot`}"></span>Shooter · ${e.shooterIn===`phone`?`phone`:`mouse`}`},toast(e,t=`#ffd21f`){let n=document.getElementById(`toast`);n&&(n.textContent=e,n.style.setProperty(`--c`,t),n.classList.remove(`show`),n.offsetWidth,n.classList.add(`show`))},focusFirst(){(e.querySelector(`.btn.yellow`)??e.querySelector(`button`))?.focus()}}}var $g=document.getElementById(`game`),$=new Rd,e_=new qh($g,$),t_=new Lg,n_=Qg(document.getElementById(`overlay`),document.getElementById(`hud`)),r_=`back2back.best`,i_=e=>({steer:Math.sin(e*.6)*.35,gas:!0,brake:!1,nitro:!1,drift:!1}),a_={rx:.5,ry:.56,fire:!1},o_=`title`,s_=Ug(),c_=null;function l_(){e_.shakeScale=s_.shake===`off`?0:s_.shake===`low`?.4:1,e_.setQuality(s_.quality),H_()}var u_=e=>Math.max(0,Math.min(1,e));function d_(){let e=t_.driveInput();return{...e,steer:Math.max(-1,Math.min(1,e.steer*s_.steerSens))}}function f_(){let e=t_.aimInput();return{rx:u_(.5+(e.rx-.5)*s_.aimSens),ry:u_(.56+(e.ry-.56)*s_.aimSens),fire:e.fire}}function p_(e,t){c_=e,n_.showSettings({s:s_,focus:t,onStep:(t,n)=>{Gg(s_,t,n),Wg(s_),l_(),p_(e,`button[data-k="${t}"][data-d="${n}"]`)},onReset:()=>{Object.assign(s_,Rg),Wg(s_),l_(),p_(e,`#bReset`)},onBack:()=>{c_=null,e()}})}var m_=0,h_=-1,g_=performance.now(),__=0;try{__=Number(localStorage.getItem(r_))||0}catch{}window.addEventListener(`resize`,()=>e_.resize()),e_.onZone((e,t)=>{o_===`play`&&t>0&&(n_.toast(`Zone ${t+1}: ${e.name}`,`#ffffff`),e_.cine.play(`zone`,{caption:e.name,sub:`Zone ${t+1}`}))});var v_=null;function y_(){if(!v_)try{v_=new AudioContext}catch{v_=null}}window.addEventListener(`pointerdown`,y_,{once:!1}),window.addEventListener(`keydown`,y_);function b_(e,t,n=`square`,r=.05,i=0){if(v_)try{let a=v_.createOscillator(),o=v_.createGain();a.type=n,a.frequency.value=e,i&&a.frequency.linearRampToValueAtTime(e+i,v_.currentTime+t),o.gain.value=r*s_.volume*1.4,o.gain.exponentialRampToValueAtTime(1e-4,v_.currentTime+t),a.connect(o).connect(v_.destination),a.start(),a.stop(v_.currentTime+t)}catch{}}var x_=null;function S_(e,t,n,r,i){if(v_)try{if(!x_){let e=v_.createOscillator(),t=v_.createOscillator(),n=v_.createGain(),r=v_.createBiquadFilter();e.type=`sawtooth`,t.type=`square`,r.type=`lowpass`,r.frequency.value=500,n.gain.value=0,e.connect(r),t.connect(r),r.connect(n).connect(v_.destination),e.start(),t.start(),x_={osc:e,osc2:t,gain:n,lp:r}}let a=38+t*6+n*70+i*.25,o=v_.currentTime;x_.osc.frequency.setTargetAtTime(a,o,.05),x_.osc2.frequency.setTargetAtTime(a*.5,o,.05),x_.lp.frequency.setTargetAtTime(280+n*500+(r?350:0),o,.08),x_.gain.gain.setTargetAtTime(e&&s_.engine?(r?.035:.014)*s_.volume*1.4:0,o,.1)}catch{}}var C_={shift:()=>b_(150,.07,`square`,.025,-60),shot:()=>b_(880,.05,`square`,.03,-300),hit:()=>b_(520,.08,`triangle`,.06),kill:()=>b_(330,.25,`sawtooth`,.05,500),hurt:()=>b_(160,.3,`sawtooth`,.09,-90),pickup:()=>{b_(660,.1,`triangle`,.07),setTimeout(()=>b_(880,.12,`triangle`,.07),90)},nitro:()=>b_(220,.4,`sawtooth`,.05,440),go:()=>b_(990,.3,`square`,.05),beep:()=>b_(660,.12,`square`,.05),over:()=>b_(240,.8,`sawtooth`,.07,-180)};function w_(e){o_=e}function T_(){w_(`title`),P_=0,e_.stormReset(),e_.cine.skip(),$.reset(),t_.setMode(`menu`),n_.hudShow(!1),E_()}function E_(e){c_=null,n_.showTitle({best:__,onPlay:D_,onHow:()=>{n_.showHow({onBack:()=>E_(`#bHow`)})},onSettings:()=>p_(()=>E_(`#bSet`)),onExit:t_.inShell?L_:void 0}),e&&document.querySelector(e)?.focus()}function D_(){w_(`pairing`),t_.setMode(`menu`),n_.hudShow(!1),O_()}function O_(){if(o_!==`pairing`)return;let e=t_.inShell;n_.showPairing({driver:{label:e?`Player 1 · Driver (your Exemoo phone)`:`Player 1 · Driver`,sub:t_.driver.connected?`Tilt to steer · ITEM = nitro`:e?`Connect your phone in the Exemoo menu, or drive with the keyboard`:`Scan to drive · or use the keyboard`,connected:t_.driver.connected,pin:e?``:t_.driver.pin,qrSrc:e?``:k_(t_.padUrl(`driver`)),color:`#ff3b30`},shooter:{label:`Player 2 · Shooter`,sub:t_.shooter.connected?`Point to aim · hold Action to fire`:`Scan with a second phone · or use the mouse`,connected:t_.shooter.connected,pin:t_.shooter.pin,qrSrc:k_(t_.padUrl(`shooter`)),color:`#2f7cff`},onStart:A_,onBack:T_}),n_.focusFirst()}var k_=e=>e?`/api/qr?text=${encodeURIComponent(e)}`:``;function A_(){$.reset(),P_=0,e_.stormReset(),e_.cine.skip(),e_.cine.play(`intro`,{}),w_(`countdown`),m_=3.4,h_=-1,t_.setMode(`play`),n_.hudShow(!0)}function j_(){w_(`play`),n_.hideOverlay(),t_.setMode(`play`)}function M_(){n_.showPause({onResume:j_,onRestart:A_,onQuit:L_,onSettings:()=>p_(()=>M_())}),n_.focusFirst()}function N_(){c_?c_():o_===`play`?(w_(`paused`),t_.setMode(`menu`),n_.showPause({onResume:j_,onRestart:A_,onQuit:L_,onSettings:()=>p_(()=>M_())}),n_.focusFirst()):o_===`paused`&&j_()}var P_=0;function F_(){w_(`over`),t_.setMode(`menu`),$.overBy===`storm`?(e_.startStormEnd(),P_=4.6,n_.toast(`THE STORM GOT YOU!`,`#9b4dff`)):(e_.cine.play(`crash`,{}),I_())}function I_(){document.getElementById(`toast`)?.classList.remove(`show`);let e=$.D>__;if(e){__=$.D;try{localStorage.setItem(r_,String(Math.round(__)))}catch{}}let t=$.shots?Math.round($.shotHits/$.shots*100):0;n_.showResults({dist:$.D,score:$.score,kills:$.kills,accuracy:t,level:$.level,best:__,isBest:e,storm:$.overBy===`storm`,onAgain:A_,onQuit:T_}),n_.focusFirst()}function L_(){t_.inShell?t_.sdk.exit():T_()}t_.onButton=(e,t)=>{if(e===`shooter`&&t===`recenter`&&t_.shooter.aim.recenter(),o_===`play`)t===`pause`&&N_();else{if(o_===`paused`&&t===`pause`)return j_();o_!==`countdown`&&t_.nav(t)}},t_.onChange=()=>R_();function R_(){o_===`pairing`&&O_()}window.addEventListener(`keydown`,e=>{(e.code===`KeyP`||e.code===`Escape`)&&(o_===`play`||o_===`paused`?N_():c_&&c_())});function z_(e){for(let t of e)switch(t.k){case`shot`:C_.shot();break;case`hit`:C_.hit(),t_.haptic(`shooter`,10);break;case`kill`:C_.kill(),t_.haptic(`shooter`,25);break;case`hurt`:C_.hurt(),t_.haptic(`driver`,[60,40,60]),t_.haptic(`shooter`,40);break;case`pickup`:C_.pickup(),n_.toast(t.u===`shield`?`Shield!`:t.u===`repair`?`Repaired!`:`${Zg(t.u)} up!`,t.u===`armor`||t.u===`shield`?`#2f7cff`:`#ffd21f`);break;case`combo`:n_.toast(`COMBO ×${t.mult}!`,`#ff3b30`),C_.pickup();break;case`boss`:if(t.phase===`spawn`){let e=t.style===`village`;n_.toast(e?`BOSS: Village Uprising!`:`BOSS: Mega Harvester!`,`#ff3b30`),e_.cine.play(`boss`,{caption:e?`VILLAGE UPRISING`:`MEGA HARVESTER`,sub:e?`Break the gate, topple the chief`:`Zone boss`})}else e_.cine.play(`bossDown`,{caption:t.style===`village`?`VILLAGE FALLS`:`BOSS DOWN`,sub:`Nice shooting!`}),n_.toast(`Boss down!`,`#ffd21f`),t_.haptic(`shooter`,[30,30,80]),t_.haptic(`driver`,[30,30,80]);break;case`shift`:C_.shift();break;case`drift`:t.phase===`boost`?(n_.toast([``,`Mini boost!`,`Super boost!`,`ULTRA boost!`][t.tier],`#ffd21f`),C_.nitro(),t_.haptic(`driver`,25)):t.phase===`tier`&&(b_(500+t.tier*180,.06,`square`,.04),t_.haptic(`driver`,8));break;case`pad`:n_.toast(`BOOST!`,`#ffd21f`),C_.nitro();break;case`jump`:n_.toast(`Air time!`,`#ffffff`),b_(300,.3,`triangle`,.06,500);break;case`land`:b_(120,.15,`sawtooth`,.07,-60),t_.haptic(`driver`,30);break;case`near`:n_.toast(t.air?`Sky clear! +60`:`Close call! +30`,`#2fc65a`),b_(1100,.05,`square`,.03);break;case`overheat`:n_.toast(`OVERHEAT!`,`#ff3b30`),C_.hurt(),t_.haptic(`shooter`,[80,40,80]);break;case`spin`:n_.toast(`Spun out on the verge!`,`#ff8a00`),C_.hurt(),t_.haptic(`driver`,[40,30,40]);break;case`air`:n_.toast(t.kind===`bomber`?`Bomber overhead!`:`Drone!`,`#4fd0ff`),b_(700,.2,`triangle`,.05,-200);break;case`slip`:n_.toast(`Oil slick!`,`#9b4dff`);break;case`nitro`:C_.nitro(),t_.haptic(`driver`,20);break;case`storm`:n_.toast(`LIGHTNING! Keep moving!`,`#9b4dff`),t_.haptic(`driver`,[60,30,60]),C_.over();break;case`ambush`:n_.toast(`Free hit from the guards!`,`#ff3b30`),t_.haptic(`driver`,[50,20,50]);break;case`escaped`:n_.toast(`Through the village!`,`#ffffff`);break;case`over`:C_.over()}}var B_=document.createElement(`div`);B_.id=`xhair`,document.body.append(B_);var V_=null;function H_(){B_.innerHTML=qg(s_.crosshairStyle,s_.crosshairColor),B_.style.setProperty(`--xh`,`${Math.round(44*s_.crosshairSize)}px`),V_=B_.querySelector(`#xhRing`)}l_();function U_(e,t,n,r){B_.style.display=r?`block`:`none`,B_.style.transform=`translate(${e*innerWidth}px, ${t*innerHeight}px)`,V_&&(V_.style.strokeDashoffset=String(163.4*(1-Math.max(0,Math.min(1,n)))))}function W_(e){let t=Math.min(.05,Math.max(0,(e-g_)/1e3));g_=e;let n=e/1e3;if(o_===`countdown`){m_-=t;let e=Math.ceil(m_-.4);e!==h_&&m_>.4&&(h_=e,n_.showCountdown(e),C_.beep()),m_<=.4&&h_!==0&&(h_=0,n_.showCountdown(0),C_.go()),m_<=0&&(w_(`play`),$.speed=Math.min($.speed,16),n_.hideOverlay()),$.step(t,i_(n),a_,!1)}else if(o_===`play`){$.step(t*e_.timeScale,d_(),f_(),!0),z_($.events);for(let e of $.events)e_.handle(e);$.events.length=0,$.over&&F_()}else o_===`over`?P_>0&&(P_-=t,P_<=0&&I_()):(o_===`title`||o_===`pairing`)&&$.step(t,i_(n),a_,!1);S_(o_===`play`,$.gear,$.rpm,d_().gas&&!$.over,$.speed);let r=f_(),i=Math.max(0,1-Math.max(0,$.shotCd)/$.shotInterval),a=o_===`play`||o_===`countdown`;e_.update(t,n,d_(),r,a);{let e=e_.turnHint,t=document.getElementById(`turn`);t&&(t.textContent=o_===`play`&&Math.abs(e)>.25?e>0?`›`.repeat(Math.abs(e)>.6?3:2):`‹`.repeat(Math.abs(e)>.6?3:2):``,t.className=Math.abs(e)>.6?`sharp`:``)}U_(r.rx,r.ry,i,a),B_.classList.toggle(`lock`,!!$.lock&&a),(o_===`play`||o_===`paused`)&&n_.hudUpdate({hull:$.hull,maxHull:$.maxHull,speed:$.speed,gear:$.gear,dist:$.D,score:$.score,level:$.level,kills:$.kills,upg:$.upg,storm:$.stormGap,stormV:$.stormV,mult:$.mult,comboFrac:$.comboT/3.2,shield:$.shield,boss:$.bossFrac,bossName:$.bossStyle===`village`?`VILLAGE UPRISING`:`MEGA HARVESTER`,zone:_d($.D).name,heat:$.heat,overheated:$.heatLockT>0,drift:$.driftCharge,driftTier:$.driftTier,air:$.airT>0,nitroReady:$.nitroCd<=0,nitroOn:$.nitroT>0,ready:i,driverIn:t_.inputLabel(`driver`),shooterIn:t_.inputLabel(`shooter`),driverOn:t_.driver.connected,shooterOn:t_.shooter.connected}),requestAnimationFrame(W_)}T_(),requestAnimationFrame(e=>{g_=e,W_(e)});