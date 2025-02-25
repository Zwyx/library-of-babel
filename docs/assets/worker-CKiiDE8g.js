(function(){"use strict";BigInt(4),BigInt(5);const d=BigInt(32);BigInt(410),BigInt(40),BigInt(80);const P=BigInt(640),b=BigInt(160),H=BigInt(1312e3);BigInt(3200);const T=10,G=16,a=29,K=94,N=BigInt(T),M=BigInt(G),S=BigInt(a),h=BigInt(K),C="0123456789",w="0123456789abcdef",I=" abcdefghijklmnopqrstuvwxyz,.",L="!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",W="!\\\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",g=972399,R=796712,A=(o,n,s)=>{let t="";const e=[n],_=o.toString(2).length;for(;e[e.length-1].toString(2).length*2-1<=_;)e.push(e[e.length-1]**2n);const c=(l,r)=>{const E=e[r],B=l%E,i=l/E;r>0?(c(B,r-1),c(i,r-1)):t=`${s[Number(i)]}${s[Number(B)]}${t}`};return c(o,e.length-1),t=t.replace(new RegExp(`^${s[0]}*`),""),t},k=(o,n,s)=>{let t=(o||" ").split("").map(c=>[BigInt(s.indexOf(c)),n]);if(t.length===1)return t[0][0];let e;for(;t.length>2;)e=!1,t=t.reduce((c,l,r)=>(e?e=!1:r===t.length-1?c.push(l):(c.push([l[0]*t[r+1][1]+t[r+1][0],l[1]*t[r+1][1]]),e=!0),c),[]);return t[0][0]*t[1][1]+t[1][0]},v=o=>A(o,N,C),D=o=>A(o,S,I),$=o=>A(o,h,L),F=o=>k(o,M,w),V=o=>k(o,S,I),y=o=>k(o,h,L);let O;const j=()=>(typeof O!="bigint"&&(O=S**H-1n),O),X=o=>{const n=o.replace(new RegExp(`[^${W}]`,"g"),"");return n?y(n):null},z=o=>{const n=o.flatMap(t=>[(t&15).toString(16),(t>>4).toString(16)]).reverse().join("");return F(n)},u=o=>{const n=[];let s={lines:[]},t="";for(let e=0;e<1312e3;e++)t+=o[e]||I[0],(e+1)%80===0&&(s.lines.push({chars:t}),t="",(e+1)%3200===0&&(n.push(s),s={lines:[]}));return{pages:n}},q=o=>{const n=D(o).split("").reverse();return u(n)},f=o=>$(o),m=(o="",n)=>{let s="",t="";if(n){const c=3200*n-o.length,l=Math.floor(Math.random()*(c+1));for(let r=0;r<l;r++)s+=I.charAt(Math.floor(Math.random()*a));for(let r=l;r<c;r++)t+=I.charAt(Math.floor(Math.random()*a))}return{...u(`${s}${o}${t}`.split("")),selection:{start:s.length,end:o?s.length+o.length-1:null}}},J=o=>{const n=o.pages.reverse().map(({lines:t})=>t.reverse().map(({chars:e})=>e.split("").reverse().join("")).join("")).join("").replace(new RegExp(`^${I[0]}*`),"");return V(n)},Q=o=>{const n=f(o),s=o/P,t=o%P,e=t/b,_=t%b,c=_/d,l=_%d,r=o.toString(16).split("").reverse(),E=r.reduce((x,Z,p)=>(p%2===0&&x.push(parseInt(Z,16)+(parseInt(r[p+1],16)||0)*16),x),[]),B=v(s+1n),i=(e+1n).toString(),U=(c+1n).toString(),Y=(l+1n).toString();return{bookId:n,roomIndex:B,wallIndexInRoom:i,shelfIndexInWall:U,bookIndexInShelf:Y,bookImageData:E}};onmessage=({data:o})=>{const n=o.operation;let s;try{switch(n){case"browse":{let t,e,_=!1;if(o.source==="bookId"){let r;o.bookId.length<=g?(_=o.bookId.length===g,r=o.bookId):(e=!0,r=o.bookId.slice(o.bookId.length-g)),t=X(r)}else{let r;o.bookImageData.length<=R?(_=o.bookImageData.length===R,r=o.bookImageData):(e=!0,r=o.bookImageData.slice(0,R)),t=z(r)}_&&t&&(e=t>j());const c=typeof t=="bigint"?q(t):void 0,l=o.source==="bookImage"&&t?f(t):void 0;s={operation:n,...c?{book:c}:{invalidData:!0},bookId:l,dataTruncated:e};break}case"search":case"random":{let t,e;if(n==="search"){let _;const c=o.searchText.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(new RegExp(`[^${I}]`,"g"),"");c.length<=1312e3?_=c:(e=!0,_=c.slice(0,1312e3)),t=_?m(_,o.searchOptions.numberOfPages):null}else t=m(void 0,o.randomOptions.numberOfPages);s={operation:n,...t?{book:t}:{invalidData:!0},dataTruncated:e};break}case"getBookMetadata":{const t=J(o.book),e=Q(t);s={operation:n,bookMetadata:e};break}}}catch(t){s={operation:n,error:t}}postMessage(s)}})();
