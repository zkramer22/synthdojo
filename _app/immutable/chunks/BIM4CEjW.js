function m(){}function E(t,n){for(const e in n)t[e]=n[e];return t}function j(t){return t()}function A(){return Object.create(null)}function q(t){t.forEach(j)}function v(t){return typeof t=="function"}function B(t,n){return t!=t?n==n:t!==n||t&&typeof t=="object"||typeof t=="function"}let i;function C(t,n){return t===n?!0:(i||(i=document.createElement("a")),i.href=n,t===i.href)}function F(t){return Object.keys(t).length===0}function k(t,...n){if(t==null){for(const r of n)r(void 0);return m}const e=t.subscribe(...n);return e.unsubscribe?()=>e.unsubscribe():e}function P(t){let n;return k(t,e=>n=e)(),n}function S(t,n,e){t.$$.on_destroy.push(k(n,e))}function U(t,n,e,r){if(t){const o=x(t,n,e,r);return t[0](o)}}function x(t,n,e,r){return t[1]&&r?E(e.ctx.slice(),t[1](r(n))):e.ctx}function G(t,n,e,r){if(t[2]&&r){const o=t[2](r(e));if(n.dirty===void 0)return o;if(typeof o=="object"){const l=[],_=Math.max(n.dirty.length,o.length);for(let s=0;s<_;s+=1)l[s]=n.dirty[s]|o[s];return l}return n.dirty|o}return n.dirty}function H(t,n,e,r,o,l){if(o){const _=x(n,e,r,l);t.p(_,o)}}function I(t){if(t.ctx.length>32){const n=[],e=t.ctx.length/32;for(let r=0;r<e;r++)n[r]=-1;return n}return-1}function J(t){return t??""}function K(t){return t&&v(t.destroy)?t.destroy:m}let f;function d(t){f=t}function g(){if(!f)throw new Error("Function called outside component initialization");return f}function L(t){g().$$.on_mount.push(t)}function N(t){g().$$.after_update.push(t)}function Q(t){g().$$.on_destroy.push(t)}function R(t,n){const e=t.$$.callbacks[n.type];e&&e.slice().forEach(r=>r.call(this,n))}const a=[],y=[];let u=[];const p=[],w=Promise.resolve();let b=!1;function O(){b||(b=!0,w.then(D))}function T(){return O(),w}function z(t){u.push(t)}function V(t){p.push(t)}const h=new Set;let c=0;function D(){if(c!==0)return;const t=f;do{try{for(;c<a.length;){const n=a[c];c++,d(n),M(n.$$)}}catch(n){throw a.length=0,c=0,n}for(d(null),a.length=0,c=0;y.length;)y.pop()();for(let n=0;n<u.length;n+=1){const e=u[n];h.has(e)||(h.add(e),e())}u.length=0}while(a.length);for(;p.length;)p.pop()();b=!1,h.clear(),d(t)}function M(t){if(t.fragment!==null){t.update(),q(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(z)}}function W(t){const n=[],e=[];u.forEach(r=>t.indexOf(r)===-1?n.push(r):e.push(r)),e.forEach(r=>r()),u=n}export{P as A,J as B,V as C,R as D,C as E,k as a,U as b,S as c,G as d,N as e,y as f,I as g,d as h,v as i,A as j,D as k,F as l,z as m,m as n,L as o,W as p,f as q,q as r,B as s,T as t,H as u,j as v,a as w,O as x,Q as y,K as z};
