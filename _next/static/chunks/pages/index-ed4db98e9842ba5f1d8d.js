(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{9584:function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return b}});var r=n(5893),a=n(7294),s=n(1163),o=n(7820),i=n(6640),c=n(7819),u=n(8819),l=n(1007),d=n(7454),h=n(7478),f=n(5018),x=n(6406),p=n(1334),b=function(){var e=(0,a.useState)(""),t=e[0],n=e[1],b=(0,a.useState)(0),g=b[0],m=b[1],j=(0,a.useState)(""),v=j[0],_=j[1],y=(0,s.useRouter)(),Z=(0,a.useState)(!1),k=Z[0],C=Z[1];(0,a.useEffect)((function(){localStorage.removeItem("saved-player"),localStorage.removeItem("saved-lobby")}),[]);return k?(0,r.jsx)(c.Z,{message:"Creating lobby..."}):(0,r.jsx)(x.Z,{children:(0,r.jsxs)(h.Z,{container:!0,spacing:0,direction:"column",justifyContent:"center",alignItems:"center",children:[(0,r.jsx)(d.Z,{}),(0,r.jsx)("br",{}),(0,r.jsx)("h2",{children:" Choose your Avatar "}),(0,r.jsx)("br",{}),(0,r.jsx)(f.Z,{number:g,onPrevious:function(){m(0===g?9:g-1)},onNext:function(){m((g+1)%10)}}),(0,r.jsx)("br",{}),(0,r.jsx)("h2",{children:" Enter your Nickname "}),(0,r.jsx)("br",{}),(0,r.jsx)(p.Z,{center:!0,children:(0,r.jsx)(l.Z,{type:"text",value:t,onPaste:function(e){return e.preventDefault()},onChange:function(e){return t=e.target.value.replace(/[^a-zA-Z\d]/gi,""),_(""),void n(t);var t},maxLength:10,placeholder:"E.g. Derek1234",error:""!==v})}),v&&(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("br",{}),v,(0,r.jsx)("br",{})]}),(0,r.jsx)("br",{}),(0,r.jsx)(u.Z,{onClick:function(){!t||t.length<3?_("Your nickname must be at least 3 characters long"):(C(!0),o.Z.database().ref().push({gameStatus:i.c_,settings:i.Rw}).then((function(e){var n=e.key,r=o.Z.database().ref("".concat(n,"/players")).push().key;o.Z.database().ref("".concat(n,"/players/").concat(r)).set({nickname:t,avatar:g,isHost:!0,gameState:i.Qx}).then((function(){sessionStorage.setItem("lid",n),sessionStorage.setItem("pid",r),y.push("/lobby")}))})).catch((function(e){_("This application is in testing. The developer has disabled it's use"),C(!1)})))},primary:!0,disabled:!1,children:" Create Lobby "})]})})}},1007:function(e,t,n){"use strict";var r=n(5893),a=n(7840),s=n.n(a);t.Z=function(e){return(0,r.jsx)("input",{className:e.error?s().error:s().textfield,type:e.type,value:e.value,onPaste:e.onPaste,onChange:e.onChange,maxLength:e.maxLength,placeholder:e.placeholder,children:e.children})}},5301:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(9584)}])},7840:function(e){e.exports={textfield:"TextField_textfield__rjBqy",error:"TextField_error__fiQNW"}}},function(e){e.O(0,[774,724,803,626,319,888,179],(function(){return t=5301,e(e.s=t);var t}));var t=e.O();_N_E=t}]);