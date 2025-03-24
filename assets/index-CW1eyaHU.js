(function(){const g=document.createElement("link").relList;if(g&&g.supports&&g.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))C(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const s of a.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&C(s)}).observe(document,{childList:!0,subtree:!0});function p(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function C(r){if(r.ep)return;r.ep=!0;const a=p(r);fetch(r.href,a)}})();const z=function(){function c(r){const a=[];for(let s=0;s<r;s++){a[s]=[];for(let S=0;S<r;S++)a[s][S]=0}return a}function g(r){const a=new Set;for(let s=0;s<r.length;s++)for(let S=0;S<r.length;S++){const i=r[s][S];i!==0&&i!=="hit"&&i!=="miss"&&a.add(i)}if(a.size===0){let s=!1;for(let S=0;S<r.length;S++){for(let i=0;i<r.length;i++)if(r[S][i]==="hit"){s=!0;break}if(s)break}return s}for(const s of a)if(!s.isSunk())return!1;return!0}function p(r,a,s){if(a<0||a>=r.length||s<0||s>=r.length)return!1;const S=r[a][s];return S!==0&&S!=="miss"&&S!=="hit"?(S.hit(),r[a][s]="hit",!0):S===0?(r[a][s]="miss",!0):!1}function C(r,a,s,S,i=!0){const e=a.length,t=r.length;if(i&&S+e>t||!i&&s+e>t)return!1;if(i){for(let d=Math.max(0,s-1);d<=Math.min(t-1,s+1);d++)for(let y=Math.max(0,S-1);y<=Math.min(t-1,S+e);y++)if(r[d][y]!==0)return!1}else for(let d=Math.max(0,S-1);d<=Math.min(t-1,S+1);d++)for(let y=Math.max(0,s-1);y<=Math.min(t-1,s+e);y++)if(r[y][d]!==0)return!1;if(i)for(let d=0;d<e;d++)r[s][S+d]=a;else for(let d=0;d<e;d++)r[s+d][S]=a;return!0}return{createBoard:c,placeShip:C,receiveAttack:p,allShipsSunk:g}}(),Q=function(){function c(i){const e=z.createBoard(10);return{type:i,board:e,attack:i==="computer"?C:p,isComputer:i==="computer",computerState:i==="computer"?{lastHit:null,firstHit:null,successfulDirection:null,hitsInSequence:[],triedDirections:new Set,huntMode:!1}:null}}function g(i){const e=i.length,t=[];for(let I=0;I<e;I++)for(let h=0;h<e;h++)i[I][h]!=="hit"&&i[I][h]!=="miss"&&t.push({row:I,col:h});if(t.length===0)return!1;const d=Math.floor(Math.random()*t.length),{row:y,col:k}=t[d];return{row:y,col:k}}function p(i,e,t){return z.receiveAttack(i,e,t)}function C(i){let e;const t=this.computerState;if(t.huntMode?(e=s(i,t),e||(t.huntMode=!1,t.lastHit=null,t.firstHit=null,t.successfulDirection=null,t.hitsInSequence=[],t.triedDirections.clear(),e=g(i))):e=g(i),!e)return!1;const d=z.receiveAttack(i,e.row,e.col);if(d){if(this.lastAttack=e,i[e.row][e.col]==="hit"){if(!t.huntMode)t.huntMode=!0,t.firstHit={...e},t.lastHit={...e},t.hitsInSequence=[{...e}],t.triedDirections.clear();else if(t.lastHit={...e},t.hitsInSequence.push({...e}),t.hitsInSequence.length>=2){const y=t.hitsInSequence[t.hitsInSequence.length-1],k=t.hitsInSequence[t.hitsInSequence.length-2];y.row===k.row?t.successfulDirection=y.col>k.col?"right":"left":t.successfulDirection=y.row>k.row?"down":"up"}}else if(t.huntMode){const y=r(t.lastHit,e);y&&t.triedDirections.add(y),t.successfulDirection&&(t.triedDirections.add(t.successfulDirection),t.lastHit={...t.firstHit},t.successfulDirection=a(t.successfulDirection))}}return d}function r(i,e){if(!i||!e)return null;if(i.row===e.row){if(i.col<e.col)return"right";if(i.col>e.col)return"left"}else if(i.col===e.col){if(i.row<e.row)return"down";if(i.row>e.row)return"up"}return null}function a(i){return{up:"down",down:"up",left:"right",right:"left"}[i]||null}function s(i,e){const t=["up","right","down","left"];if(e.successfulDirection&&!e.triedDirections.has(e.successfulDirection))return S(i,e.lastHit,e.successfulDirection);for(const d of t)if(!e.triedDirections.has(d)){const y=S(i,e.lastHit||e.firstHit,d);if(y)return y;e.triedDirections.add(d)}return e.firstHit&&e.lastHit&&(e.firstHit.row!==e.lastHit.row||e.firstHit.col!==e.lastHit.col)?(e.lastHit={...e.firstHit},e.triedDirections.clear(),s(i,e)):null}function S(i,e,t){if(!e)return null;const{row:d,col:y}=e,k=i.length;let I=d,h=y;switch(t){case"up":I=d-1;break;case"right":h=y+1;break;case"down":I=d+1;break;case"left":h=y-1;break}return I>=0&&I<k&&h>=0&&h<k&&i[I][h]!=="hit"&&i[I][h]!=="miss"?{row:I,col:h}:null}return{createPlayer:c,makeRandomAttack:g,attack:p,computerAttack:C}}(),ee=function(){function c(g){return{length:g,hitCounter:0,sunk:!1,coordinates:null,hit(){this.hitCounter++,this.sunk=this.isSunk()},isSunk(){return this.hitCounter>=this.length},get hits(){return this.hitCounter}}}return{createShip:c}}(),j=function(){function c(g,p,C=!0){const r=document.getElementById(p);if(!r){console.error(`Gameboard container ${p} not found`);return}const a=r.querySelector(".grid-container");if(!a){console.error("Grid container not found");return}const s=g?g.length:10,S=a.querySelectorAll(".grid-cell");if(S.length===s*s)S.forEach(t=>{const d=parseInt(t.dataset.row),y=parseInt(t.dataset.col);if(t.className="grid-cell",g){const k=g[d][y];k==="hit"?t.classList.add("hit"):k==="miss"?t.classList.add("miss"):k!==0&&C&&t.classList.add("ship")}});else{a.innerHTML="";for(let t=0;t<s;t++)for(let d=0;d<s;d++){const y=document.createElement("button");if(y.className="grid-cell",y.dataset.row=t,y.dataset.col=d,y.dataset.board=p,g){const k=g[t][d];k==="hit"?y.classList.add("hit"):k==="miss"?y.classList.add("miss"):k!==0&&C&&y.classList.add("ship")}a.appendChild(y)}}const i=r.querySelector(".numbers-container");if(i&&i.children.length!==s){i.innerHTML="";for(let t=0;t<s;t++){const d=document.createElement("div");d.className="number",d.textContent=t+1,i.appendChild(d)}}const e=r.querySelector(".letters-container");if(e&&e.children.length!==s){e.innerHTML="";for(let t=0;t<s;t++){const d=document.createElement("div");d.className="letter",d.textContent=String.fromCharCode(65+t),e.appendChild(d)}}a.style.gridTemplateColumns=`repeat(${s}, 1fr)`,a.style.gridTemplateRows=`repeat(${s}, 1fr)`}return{renderBoard:c}}(),ne=function(){let c=null,g=!0,p=[],C=[],r=-1,a=[],s=null;function S(n,u,o="Player"){a=[...n],s=u,p=[],C=[[]],r=0,g=!0,i(),d(o),y()}function i(){document.removeEventListener("keydown",e),document.querySelectorAll(".ship").forEach(o=>{o.removeEventListener("dragstart",I),o.removeEventListener("dragend",h)}),document.querySelectorAll("#player-board .grid-cell").forEach(o=>{o.removeEventListener("dragover",q),o.removeEventListener("dragenter",O),o.removeEventListener("dragleave",U),o.removeEventListener("drop",Y)})}function e(n){n.key.toLowerCase()==="r"&&t()}function t(){g=!g,document.querySelectorAll(".ship").forEach(o=>{o.classList.remove("horizontal"),o.classList.remove("vertical"),o.classList.add(g?"horizontal":"vertical")});const u=document.querySelector(".orientation-value");u&&(u.textContent=g?"Horizontal":"Vertical")}function d(n){const u=document.querySelector(".board-container:first-child");let o=document.querySelector(".ship-placement-container");o&&o.remove(),o=document.createElement("div"),o.className="ship-placement-container",u.insertBefore(o,u.querySelector(".buttons"));const v=document.createElement("div");v.className="placement-instructions",v.innerHTML=`
      <h3>${n}, place your ships</h3>
      <p>Drag ships to place them on the board</p>
      <p>Press <strong>R</strong> to rotate ships</p>
    `,o.appendChild(v);const b=document.createElement("div");b.className="rotation-indicator",b.innerHTML=`
      <span>Current orientation: </span>
      <span class="orientation-value">${g?"Horizontal":"Vertical"}</span>
    `,v.appendChild(b);const f=document.createElement("div");f.className="ships-container",o.appendChild(f),a.forEach((T,V)=>{const K=document.createElement("div");K.className=`ship size-${T} ${g?"horizontal":"vertical"}`,K.dataset.index=V,K.dataset.size=T,K.draggable=!0;for(let X=0;X<T;X++){const te=document.createElement("div");te.className="ship-segment",K.appendChild(te)}if(g)f.appendChild(K);else{const X=document.createElement("div");X.className="ship-wrapper",X.style.display="inline-block",X.style.verticalAlign="top",X.appendChild(K),f.appendChild(X)}});const l=document.createElement("div");l.className="placement-buttons-container",o.appendChild(l);const m=document.createElement("button");m.className="rotate-button",m.textContent="Rotate Ships",m.addEventListener("click",t),l.appendChild(m);const H=document.createElement("button");H.className="auto-arrange-button",H.textContent="Auto Arrange",H.addEventListener("click",re),l.appendChild(H);const D=document.createElement("div");D.className="undo-redo-container";const N=document.createElement("button");N.className="undo-button",N.textContent="Undo",N.disabled=!0,N.addEventListener("click",F);const P=document.createElement("button");P.className="redo-button",P.textContent="Redo",P.disabled=!0,P.addEventListener("click",G),D.appendChild(N),D.appendChild(P),l.appendChild(D);const $=document.createElement("button");$.className="start-game",$.textContent="Start Game",$.disabled=!0,l.appendChild($),$.addEventListener("click",function(){p.length===a.length&&(s(p),o.style.display="none")})}function y(){document.addEventListener("keydown",e),document.addEventListener("mousemove",o=>{window.lastMouseX=o.clientX,window.lastMouseY=o.clientY});const n=document.querySelectorAll(".ship"),u=document.querySelectorAll("#player-board .grid-cell");n.forEach(o=>{o.addEventListener("dragstart",I),o.addEventListener("dragend",h),o.setAttribute("tabindex","0"),o.addEventListener("keydown",k),o.addEventListener("focus",()=>{o.classList.add("focused")}),o.addEventListener("blur",()=>{o.classList.remove("focused")})}),u.forEach(o=>{o.addEventListener("dragover",q),o.addEventListener("dragenter",O),o.addEventListener("dragleave",U),o.addEventListener("drop",Y)})}function k(n){if(n.key==="Enter"||n.key===" "){n.preventDefault(),c={element:this,size:parseInt(this.dataset.size),index:parseInt(this.dataset.index)},document.querySelectorAll(".ship").forEach(o=>{o.classList.remove("keyboard-selected")}),this.classList.add("keyboard-selected");const u=document.querySelector("#player-board .grid-cell");u&&u.focus()}}function I(n){c={element:this,size:parseInt(this.dataset.size),index:parseInt(this.dataset.index)},this.classList.add("dragging"),c.initialOrientation=g,document.addEventListener("contextmenu",w),n.dataTransfer.setData("text/plain",""),n.dataTransfer.effectAllowed="move"}function h(){this.classList.remove("dragging"),document.removeEventListener("contextmenu",w),document.querySelectorAll(".grid-cell.highlight, .grid-cell.row-highlight, .grid-cell.col-highlight").forEach(n=>{n.classList.remove("highlight"),n.classList.remove("valid"),n.classList.remove("invalid"),n.classList.remove("preview"),n.classList.remove("row-highlight"),n.classList.remove("col-highlight")})}function w(n){if(n.preventDefault(),!!c)return t(),!1}function q(n){if(n.preventDefault(),!c)return;const u=document.querySelector("#player-board .grid-container").getBoundingClientRect(),o=10;if(!(n.clientX>=u.left-o&&n.clientX<=u.right+o&&n.clientY>=u.top-o))return document.querySelectorAll(".grid-cell.highlight, .grid-cell.row-highlight, .grid-cell.col-highlight").forEach(m=>{m.classList.remove("highlight"),m.classList.remove("valid"),m.classList.remove("invalid"),m.classList.remove("preview"),m.classList.remove("row-highlight"),m.classList.remove("col-highlight")}),!1;const b=50,f=Math.floor((n.clientX-u.left)/b),l=Math.floor((n.clientY-u.top)/b);return l>=0&&l<10&&f>=0&&f<10&&x(l,f,c.size,g),!1}function O(n){if(n.preventDefault(),!c)return;const u=parseInt(this.dataset.row),o=parseInt(this.dataset.col);x(u,o,c.size,g)}function U(){}function Y(n){if(n.preventDefault(),!c)return;const u=parseInt(this.dataset.row),o=parseInt(this.dataset.col),v={size:c.size,row:u,col:o,isHorizontal:g,index:c.index};if(L(u,o,c.size,g)){const b=p.findIndex(f=>f.index===c.index);b>=0?p[b]=v:p.push(v),r++,C=C.slice(0,r),C.push([...p]),c.element.classList.add("placed"),E(),W(),A()}return!1}function x(n,u,o,v){document.querySelectorAll(".grid-cell.highlight, .grid-cell.row-highlight, .grid-cell.col-highlight").forEach(l=>{l.classList.remove("highlight"),l.classList.remove("valid"),l.classList.remove("invalid"),l.classList.remove("preview"),l.classList.remove("row-highlight"),l.classList.remove("col-highlight")});const b=L(n,u,o,v);if(M(n,u,o,v).forEach(l=>{l&&(l.classList.add("highlight"),l.classList.add(b?"valid":"invalid"),b&&l.classList.add("preview"))}),v)for(let l=0;l<10;l++){const m=document.querySelector(`#player-board .grid-cell[data-row="${n}"][data-col="${l}"]`);m&&!m.classList.contains("highlight")&&m.classList.add("row-highlight")}else for(let l=0;l<10;l++){const m=document.querySelector(`#player-board .grid-cell[data-row="${l}"][data-col="${u}"]`);m&&!m.classList.contains("highlight")&&m.classList.add("col-highlight")}}function M(n,u,o,v){const b=[],f=document.querySelector("#player-board .grid-container"),l=10;if(v){if(u+o>l)return[];for(let m=0;m<o;m++){const H=`.grid-cell[data-row="${n}"][data-col="${u+m}"]`,D=f.querySelector(H);D&&b.push(D)}}else{if(n+o>l)return[];for(let m=0;m<o;m++){const H=`.grid-cell[data-row="${n+m}"][data-col="${u}"]`,D=f.querySelector(H);D&&b.push(D)}}return b}function L(n,u,o,v){if(M(n,u,o,v).length!==o)return!1;const f=new Set;p.forEach(m=>{if(m.index===(c==null?void 0:c.index))return;const{row:H,col:D,size:N,isHorizontal:P}=m;if(P)for(let $=0;$<N;$++){f.add(`${H},${D+$}`);for(let T=Math.max(0,H-1);T<=Math.min(9,H+1);T++)for(let V=Math.max(0,D+$-1);V<=Math.min(9,D+$+1);V++)f.add(`${T},${V}`)}else for(let $=0;$<N;$++){f.add(`${H+$},${D}`);for(let T=Math.max(0,H+$-1);T<=Math.min(9,H+$+1);T++)for(let V=Math.max(0,D-1);V<=Math.min(9,D+1);V++)f.add(`${T},${V}`)}});const l=[];if(v)for(let m=0;m<o;m++)l.push(`${n},${u+m}`);else for(let m=0;m<o;m++)l.push(`${n+m},${u}`);return!l.some(m=>f.has(m))}function E(){const n=document.querySelector(".start-game");n&&(n.disabled=p.length!==a.length)}function A(){document.querySelectorAll("#player-board .grid-cell").forEach(n=>{n.classList.remove("ship")}),p.forEach(n=>{const{row:u,col:o,size:v,isHorizontal:b}=n;if(b)for(let f=0;f<v;f++){const l=document.querySelector(`#player-board .grid-cell[data-row="${u}"][data-col="${o+f}"]`);l&&l.classList.add("ship")}else for(let f=0;f<v;f++){const l=document.querySelector(`#player-board .grid-cell[data-row="${u+f}"][data-col="${o}"]`);l&&l.classList.add("ship")}})}function B(){p=[],document.querySelectorAll(".ship").forEach(n=>{n.classList.remove("placed")}),document.querySelectorAll("#player-board .grid-cell").forEach(n=>{n.classList.remove("ship")}),E()}function F(){r>0&&(r--,p=[...C[r]],J(),A(),E(),W())}function G(){r<C.length-1&&(r++,p=[...C[r]],J(),A(),E(),W())}function W(){const n=document.querySelector(".undo-button"),u=document.querySelector(".redo-button");n&&(n.disabled=r<=0),u&&(u.disabled=r>=C.length-1)}function J(){document.querySelectorAll(".ship").forEach(n=>{n.classList.remove("placed")}),p.forEach(n=>{const u=document.querySelector(`.ship[data-index="${n.index}"]`);u&&u.classList.add("placed")})}function re(){p=[];const n=[];for(let v=0;v<10;v++){n[v]=[];for(let b=0;b<10;b++)n[v][b]=0}const u=[()=>a.map((v,b)=>{const f=Math.random()>.5;let l=100,m=!1,H=null;for(;!m&&l>0;){l--;let D,N;f?(D=Math.random()>.5?0:9,N=Math.floor(Math.random()*(10-v))):(N=Math.random()>.5?0:9,D=Math.floor(Math.random()*(10-v))),Z(n,v,D,N,f)&&(_(n,v,D,N,f),H={size:v,row:D,col:N,isHorizontal:f,index:b},m=!0)}if(!m)for(;!m;){const D=Math.floor(Math.random()*(10-(f?0:v))),N=Math.floor(Math.random()*(10-(f?v:0)));Z(n,v,D,N,f)&&(_(n,v,D,N,f),H={size:v,row:D,col:N,isHorizontal:f,index:b},m=!0)}return H}),()=>{const v=[{rowStart:0,rowEnd:4,colStart:0,colEnd:4},{rowStart:0,rowEnd:4,colStart:5,colEnd:9},{rowStart:5,rowEnd:9,colStart:0,colEnd:4},{rowStart:5,rowEnd:9,colStart:5,colEnd:9}];return a.map((b,f)=>{const l=v[f%v.length],m=Math.random()>.5;let H=!1,D=null,N=50;for(;!H&&N>0;){N--;const P=Math.floor(Math.random()*(l.rowEnd-l.rowStart+1-(m?0:Math.min(b,l.rowEnd-l.rowStart+1))))+l.rowStart,$=Math.floor(Math.random()*(l.colEnd-l.colStart+1-(m?Math.min(b,l.colEnd-l.colStart+1):0)))+l.colStart;Z(n,b,P,$,m)&&(_(n,b,P,$,m),D={size:b,row:P,col:$,isHorizontal:m,index:f},H=!0)}if(!H)for(;!H;){const P=Math.random()>.5,$=Math.floor(Math.random()*(10-(P?0:b))),T=Math.floor(Math.random()*(10-(P?b:0)));Z(n,b,$,T,P)&&(_(n,b,$,T,P),D={size:b,row:$,col:T,isHorizontal:P,index:f},H=!0)}return D})}],o=u[Math.floor(Math.random()*u.length)];p=o(),r++,C=C.slice(0,r),C.push([...p]),J(),A(),E(),W()}function Z(n,u,o,v,b){if(b&&v+u>10||!b&&o+u>10)return!1;for(let f=Math.max(0,o-1);f<=Math.min(9,o+(b?1:u));f++)for(let l=Math.max(0,v-1);l<=Math.min(9,v+(b?u:1));l++)if(n[f][l]!==0)return!1;return!0}function _(n,u,o,v,b){if(b)for(let f=0;f<u;f++)n[o][v+f]=1;else for(let f=0;f<u;f++)n[o+f][v]=1}return{init:S,resetPlacements:B}}(),R=function(){const c=new Map;function g(a,s){const S=document.getElementById(a);if(!S)return;const i=S.querySelector(".ship-status-display");i&&i.remove(),c.clear();const e=document.createElement("div");e.className="ship-status-display";const t=document.createElement("h3");t.textContent="Fleet Status",e.appendChild(t),s.forEach((d,y)=>{const k=document.createElement("div");k.className="ship-indicator",k.dataset.size=d,k.dataset.index=y,k.dataset.containerId=a;const I=document.createElement("div");I.className="ship-status-icon";for(let h=0;h<d;h++){const w=document.createElement("div");w.className="ship-segment",w.dataset.segment=h,I.appendChild(w)}k.appendChild(I),e.appendChild(k)}),S.appendChild(e)}function p(a,s){const S=document.getElementById(a);if(!S)return;const i=S.querySelector(".ship-status-display");if(!i)return;const e=[],t=new Set;for(let h=0;h<s.length;h++)for(let w=0;w<s[h].length;w++){const q=s[h][w];q!==0&&q!=="hit"&&q!=="miss"&&(t.has(q)||(t.add(q),e.push({ship:q,size:q.length,hits:q.hitCounter,isSunk:q.isSunk()})))}const d=i.querySelectorAll(".ship-indicator");if(c.size===0||c.get(a)===void 0){c.set(a,new Map);const h=new Map;e.forEach(w=>{h.has(w.size)||h.set(w.size,[]),h.get(w.size).push(w)}),d.forEach(w=>{const q=parseInt(w.dataset.size),O=parseInt(w.dataset.index),U=h.get(q)||[];if(O<U.length){const Y=U[O];c.get(a).set(Y.ship,w)}})}const y=c.get(a)||new Map,k=new Map;y.forEach((h,w)=>{let q=!1;for(const O of e)if(O.ship===w){q=!0;break}q||k.set(w,h)});for(const h of e){const w=y.get(h.ship);if(w)C(w,h.hits,h.isSunk);else{const q=r(d,y,h.size);q&&(y.set(h.ship,q),C(q,h.hits,h.isSunk))}}k.forEach((h,w)=>{C(h,w.length,!0)});let I=!1;for(let h=0;h<s.length;h++){for(let w=0;w<s[h].length;w++)if(s[h][w]==="hit"){I=!0;break}if(I)break}d.forEach(h=>{let w=!1;if(y.forEach(q=>{q===h&&(w=!0)}),!w&&I){const q=parseInt(h.dataset.size);let O=!1;for(const U of e)if(U.size===q){O=!0;break}O||C(h,q,!0)}})}function C(a,s,S){a.querySelectorAll(".ship-segment").forEach((e,t)=>{t<s?e.classList.add("hit"):e.classList.remove("hit")}),S?a.classList.add("sunk"):a.classList.remove("sunk")}function r(a,s,S){const i=new Set;s.forEach(e=>{i.add(e)});for(const e of a)if(!i.has(e)&&parseInt(e.dataset.size)===S)return e;return null}return{createShipStatusDisplay:g,updateShipStatus:p}}(),oe=function(){let c,g,p,C,r,a;const s=[5,4,3,3,2,1,1];function S(x="singleplayer"){a=x,c=Q.createPlayer("human"),C="setup",r="player1",a==="singleplayer"?(g=Q.createPlayer("computer"),g.board=z.createBoard(10),e()):(p=Q.createPlayer("human"),p.board=z.createBoard(10)),c.board=z.createBoard(10),t(),R.createShipStatusDisplay("player-status",s),R.createShipStatusDisplay("computer-status",s),O(),x==="select"?i():ne.init(s,Y,"Player 1")}function i(){const x=document.querySelector(".mode-selection-container");x&&x.remove();const M=document.createElement("div");M.className="mode-selection-container";const L=document.createElement("h2");L.textContent="Select Game Mode",M.appendChild(L);const E=document.createElement("button");E.className="mode-button single-player",E.textContent="Play vs Computer",E.addEventListener("click",()=>{M.remove(),S("singleplayer")});const A=document.createElement("button");A.className="mode-button two-player",A.textContent="Play vs Friend",A.addEventListener("click",()=>{M.remove(),S("multiplayer")}),M.appendChild(E),M.appendChild(A),document.querySelector(".game-container").appendChild(M)}function e(){s.forEach(x=>{const M=ee.createShip(x);let L=!1;for(;!L;){const E=Math.floor(Math.random()*10),A=Math.floor(Math.random()*10),B=Math.random()>.5;L=z.placeShip(g.board,M,E,A,B)}})}function t(){const x=document.querySelector("#computer-board .grid-container");if(!x)return;const M=x,L=M.cloneNode(!0);M.parentNode.replaceChild(L,M),L.addEventListener("click",y)}function d(x,M,L){const E=document.createElement("div");E.className=`attack-result ${L?"hit":"miss"}`;const A=L?"HIT! GO AGAIN!":"MISS!";E.textContent=A;const B=r==="player1"||r==="player2"?"computer-board":"player-board",F=document.querySelector(`#${B} .grid-cell[data-row="${x}"][data-col="${M}"]`);if(F){const G=F.getBoundingClientRect();E.style.position="absolute",E.style.left=`${G.left+G.width/2}px`,E.style.top=`${G.top+G.height/2}px`,E.style.transform="translate(-50%, -50%)"}document.body.appendChild(E),setTimeout(()=>{E.classList.add("fadeout"),setTimeout(()=>{E.parentNode&&E.parentNode.removeChild(E)},500)},1e3)}function y(x){const M=x.target;if(!M.classList.contains("grid-cell"))return;const L=parseInt(M.dataset.row),E=parseInt(M.dataset.col);if(C==="playing"){if(a==="singleplayer"&&r==="player1"){if(c.attack(g.board,L,E)){const B=g.board[L][E]==="hit";if(O(),B&&R.updateShipStatus("computer-status",g.board),d(L,E,B),w())return;B||(r="computer",setTimeout(h,1500))}}else if(a==="multiplayer"&&r==="player1"){if(c.attack(p.board,L,E)){const B=p.board[L][E]==="hit";if(j.renderBoard(p.board,"computer-board",!1),B&&R.updateShipStatus("computer-status",p.board),d(L,E,B),w())return;B||(r="player2",setTimeout(()=>{k()},1500))}}else if(a==="multiplayer"&&r==="player2"&&p.attack(c.board,L,E)){const B=c.board[L][E]==="hit";if(j.renderBoard(c.board,"computer-board",!1),B&&R.updateShipStatus("computer-status",c.board),d(L,E,B),w())return;B||(r="player1",setTimeout(()=>{k()},1500))}}}function k(){j.renderBoard(c.board,"player-board",!1),j.renderBoard(p.board,"computer-board",!1);const x=document.createElement("div");x.className="pass-device-screen";const M=r==="player1"?"Player 1":"Player 2";x.innerHTML=`
      <div class="pass-screen-content">
        <h2>Pass the device to ${M}</h2>
        <p>Make sure the other player isn't peeking at your board!</p>
        <button class="ready-button">I'm Ready</button>
      </div>
    `,document.body.appendChild(x),x.querySelector(".ready-button").addEventListener("click",()=>{document.body.removeChild(x),I()})}function I(){a==="multiplayer"?r==="player1"?(j.renderBoard(c.board,"player-board",!0),j.renderBoard(p.board,"computer-board",!1),R.createShipStatusDisplay("player-status",s),R.createShipStatusDisplay("computer-status",s),R.updateShipStatus("player-status",c.board),R.updateShipStatus("computer-status",p.board),document.querySelector(".board-container:first-child h2").textContent="Your Fleet",document.querySelector(".board-container:last-child h2").textContent="Opponent's Fleet"):(j.renderBoard(p.board,"player-board",!0),j.renderBoard(c.board,"computer-board",!1),R.createShipStatusDisplay("player-status",s),R.createShipStatusDisplay("computer-status",s),R.updateShipStatus("player-status",p.board),R.updateShipStatus("computer-status",c.board),document.querySelector(".board-container:first-child h2").textContent="Your Fleet",document.querySelector(".board-container:last-child h2").textContent="Opponent's Fleet"):O()}function h(){if(C!=="playing"||r!=="computer"||!g.attack(c.board))return;const M=g.lastAttack.row,L=g.lastAttack.col,E=c.board[M][L]==="hit";O(),E&&R.updateShipStatus("player-status",c.board),d(M,L,E),!w()&&(E?setTimeout(h,1500):r="player1")}function w(){if(a==="singleplayer"){if(z.allShipsSunk(c.board))return C="gameOver",q("Computer"),!0;if(z.allShipsSunk(g.board))return C="gameOver",q("Player"),!0}else{if(z.allShipsSunk(c.board))return C="gameOver",q("Player 2"),!0;if(z.allShipsSunk(p.board))return C="gameOver",q("Player 1"),!0}return!1}function q(x){const M=document.createElement("div");M.className="winner-announcement";const L=document.createElement("div");L.className="winner-content";for(let F=0;F<30;F++){const G=document.createElement("div");G.className="confetti",G.style.left=`${Math.random()*100}%`,G.style.animationDelay=`${Math.random()*3}s`,G.style.animationDuration=`${2+Math.random()*2}s`,L.appendChild(G)}const E=document.createElement("h2");E.textContent=`${x} wins!`;const A=document.createElement("p");A.textContent="Congratulations on your victory at sea!";const B=document.createElement("button");B.textContent="Play Again",B.addEventListener("click",()=>{document.body.removeChild(M),U()}),L.appendChild(E),L.appendChild(A),L.appendChild(B),M.appendChild(L),document.body.appendChild(M)}function O(){j.renderBoard(c.board,"player-board",!0),R.updateShipStatus("player-status",c.board),a==="singleplayer"?(j.renderBoard(g.board,"computer-board",!1),R.updateShipStatus("computer-status",g.board)):(j.renderBoard(p.board,"computer-board",!1),R.updateShipStatus("computer-status",p.board))}function U(){const x=document.querySelector(".ship-placement-container");x&&x.remove(),S("select")}function Y(x){if(C!=="setup")return!1;if(r==="player1"){if(c.board=z.createBoard(10),x.forEach(M=>{const{size:L,row:E,col:A,isHorizontal:B}=M,F=ee.createShip(L);z.placeShip(c.board,F,E,A,B)}),a==="multiplayer")return r="player2",k(),ne.init(s,Y,"Player 2"),!0}else r==="player2"&&a==="multiplayer"&&(p.board=z.createBoard(10),x.forEach(M=>{const{size:L,row:E,col:A,isHorizontal:B}=M,F=ee.createShip(L);z.placeShip(p.board,F,E,A,B)}),r="player1",k());return C="playing",O(),!0}return{init:S,startGame:Y,handleCellClick:y,getCurrentState:()=>({gameState:C,currentTurn:r,gameMode:a,playerBoard:c==null?void 0:c.board,computerBoard:a==="singleplayer"?g==null?void 0:g.board:p==null?void 0:p.board}),getShipSizes:()=>s}}();document.addEventListener("DOMContentLoaded",()=>{oe.init("select")});
