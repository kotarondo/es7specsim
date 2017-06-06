require('../loader');

Error.stackTraceLimit = 20;

InitializeHostDefinedRealm([]);
InitializeHostDefinedRealm([{ sourceText: "" }]);
InitializeHostDefinedRealm([
    { sourceText: "x=1*2/3%4&5|6^7>>8<<9>>>1;y=1;" },
    { sourceText: "y=1>2<3>=4<=5===6!==7==8!=9" },
    { sourceText: "z='1'+2-3+'4'||5**6&&+-~!typeof void delete ((x.z));++x;--x;x++\n--x" },
    { sourceText: "x=y=z=3;1==2?x:y=z+=y-=z/=y*=z>>=y<<=x>>>=5" },
    { sourceText: "yield=x+y;z=yield*yield;yield\n11;" },
    { sourceText: "var yield=x+y;function yield(yield){yield}" },
    { sourceText: "var yield=x+y;function yield(yield){this.yield=yield}" },
    { sourceText: "w='w'+null+true+false+123.456+\"abc\"" },
    { sourceText: "{u={x:1,y,};a=[1,,[,,4,,]]}" },
    { sourceText: "(o={'':1,'123':{}, [3+2]:u,})" },
    { sourceText: "o.a;o[x]={a};o[x]['a']=2;" },
    { sourceText: "'\0';'\\\n';'\x23\u342D\u{34211}'" },
    { sourceText: "if(false){/aaa/gimu;1/aaa/aaa;/(?:)\\/\\\\/}" },
    { sourceText: "`\0`;`\\\n`;`\x23\u342D\u{34211}`" },
    { sourceText: "`${x}${y}${z}`;`a${x}b${y}c${z}d`;" },
    { sourceText: "aa=[1,2,,,6];aa=[...aa];" },
    { sourceText: "function a(b,c){return b+c;}" },
    { sourceText: "(function a(b,c){return b+c;})" },
    { sourceText: "(function (b,c){return b+c;})" },
    { sourceText: "function *a(b,c){return b+c;}" },
    { sourceText: "(function *a(b,c){return b+c;})" },
    { sourceText: "(function *(b,c){return b+c;})" },
    { sourceText: "class ac {constructor(){}; m(){}}" },
    { sourceText: "class bc extends ac{constructor(){super()}; m(){}}" },
    { sourceText: "(class cc {constructor(){}; m(){class b extends cc{}}})" },
    { sourceText: "do{}while(0);do a=1;while(!a)" },
    { sourceText: "while(false);while(a=1)break;while(!a){a=1}" },
    { sourceText: "for(var i=0,j=0;i<10;i++)for(var j=0;j<i;j++)var k=i+j" },
    { sourceText: "for(i=0;i<10;i++){k+=i}" },
    { sourceText: "for(let i=0;i<10;i++){k+=i}" },
    { sourceText: "for(i in o){k+=i}" },
    { sourceText: "for(var i in o){k+=i}" },
    { sourceText: "for(let i in o){k+=i}" },
    { sourceText: "for(i of [2,,5,'a']){k+=i}" },
    { sourceText: "for(var i of [2,,5,'a']){k+=i}" },
    { sourceText: "for(let i of [2,,5,'a']){k+=i}" },
    { sourceText: "for(i=0;;i++){if(i==2)break;if(i==1)continue;}" },
    { sourceText: "L:for(i=0;;i++){while(true){if(i==2)break L;if(i<=1)continue L;}}" },
    { sourceText: "var o={a:2};with(o){a=1};while(a!=1);" },
    { sourceText: "try{a=1}catch(e){a=e}finally{a=3}" },
    { sourceText: "try{a=1}catch(e){a=e}" },
    { sourceText: "try{a=1}finally{a=3}" },
    { sourceText: "try{throw 4}catch(e){a=e}" },
    { sourceText: "try{throw 1}catch(e){while(e!=1);}" },
    { sourceText: "try{throw {a:1,b:2,c:null}}catch({a,b=5,c=3,d=4}){while(a!=1||b!=2||c!==null||d!=4);}" },
    { sourceText: "function f(a,b,...c){}" },
    { sourceText: "function f([...x],[,,,],[,y,,z],[a,b,...c],d,...{n,m=5,l:ll=6}){}" },
    { sourceText: "(a=>a),(a=>a+1),(a,x)=>a,(a)=>{return a}" },
    { sourceText: "(function(a){while(!a){}return a})(1)" },
    { sourceText: "if('use \\\nstrict'!=='use strict')throw 1" },
    { sourceText: "'use \\\nstrict';function a(a,a){}" },
    { sourceText: "if('use\\x20strict'!=='use strict')throw 1" },
    { sourceText: "'use\\x20strict';function a(a,a){}" },
    { sourceText: ";'use strict';function a(a,a){}" },
    { sourceText: "'use strict';(function tailc(a){if(a<0)return;return tailc(a-1)})(1000)" },
    { sourceText: "'use strict';function tailc(){return isNaN(1)} if(typeof (new tailc)!=='object')throw 'error';" },
    { sourceText: "switch(1){case 1:break; default:case 2:}" },
    { sourceText: "switch(1){case 1:case 2:case 3: break; case 4+4:5+6;\n7+7\n}" },
    { sourceText: "switch(1){case 1: switch(2){default:case '7':}case 2:}" },
    { sourceText: "var aa;({aa}={aa:1});if(aa!==1)throw Error()" },
    { sourceText: "var aa=100;({aa=1,bb:{cc=2,dd:{ee=3}}}={bb:{cc:4,dd:5}});if(aa!==1||cc!==4||ee!==3)throw Error()" },
    { sourceText: "[b]=[2];if(b!==2)throw Error();" },
    { sourceText: "[5,3,6,,7,].sort();" },
    { sourceText: "eval('x=100;for(var i=0;i<10;i++)x++;')" },
    { sourceText: "try{eval('syntax error')}catch(e){a=e}" },
]);
