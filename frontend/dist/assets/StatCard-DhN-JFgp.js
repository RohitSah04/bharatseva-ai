import{l as r,j as e,c as l}from"./index-B3kpUOMo.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=r("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=r("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=r("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);function N({label:i,value:d,change:s,changeLabel:t,icon:n,color:x="blue",className:a=""}){const o={blue:"bg-blue-50 text-blue-600",green:"bg-emerald-50 text-emerald-600",orange:"bg-orange-50 text-orange-600",purple:"bg-purple-50 text-purple-600",red:"bg-red-50 text-red-600"},c=s>0?e.jsx(j,{className:"w-3 h-3 text-emerald-600"}):s<0?e.jsx(u,{className:"w-3 h-3 text-red-500"}):e.jsx(p,{className:"w-3 h-3 text-gray-400"}),m=s>0?"text-emerald-600":s<0?"text-red-500":"text-gray-500";return e.jsx("div",{className:l("card p-5",a),children:e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-500 mb-1",children:i}),e.jsx("p",{className:"text-2xl font-bold text-gray-900",children:d??"—"}),(s!=null||t)&&e.jsxs("div",{className:"flex items-center gap-1 mt-1",children:[s!=null&&c,e.jsxs("span",{className:l("text-xs font-medium",m),children:[s!=null&&`${s>0?"+":""}${s}`,t&&` ${t}`]})]})]}),n&&e.jsx("div",{className:l("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",o[x]),children:e.jsx(n,{className:"w-5 h-5","aria-hidden":"true"})})]})})}export{N as S,j as T};
