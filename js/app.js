/* Hunter BOOM JOHOR 总盘 / 代理 / 顾客 —— 草稿（本地 localStorage，无真实安全） */
(function(){
'use strict';
var DEMO_AGENT={name:'阿伟',tail:'0901',acct:'阿伟0901a',shop:'阿伟0901',rate:0.4};
var AGENT_ABC={name:'abc',tail:'1234',acct:'abc1234a',shop:'abc1234',rate:0.4};
var DEMO_CUST={name:'丽芬',phone:'012-345 6789'};
var LS='hbd.';
var CREDIT_DEF=1000000,CREDIT_CAP=100000000;
var app=document.getElementById('app');
var LOGO='<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#fceee0"/><g stroke="#9b1c2c" stroke-width="3.4" stroke-linecap="round"><path d="M32 8v12M32 44v12M8 32h12M44 32h12M15 15l8.5 8.5M40.5 40.5L49 49M49 15l-8.5 8.5M23.5 40.5L15 49"/></g><circle cx="32" cy="32" r="6.5" fill="#d4a017"/></svg>';
var PHSVG='<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#b8e6e1" stroke-width="3" stroke-linecap="round" fill="none"><path d="M32 8v12M32 44v12M8 32h12M44 32h12M15 15l8.5 8.5M40.5 40.5L49 49M49 15l-8.5 8.5M23.5 40.5L15 49"/></g><circle cx="32" cy="32" r="6" fill="#d4a017"/></svg>';

/* ---------- utils ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function rm(c){if(c==null)return '';var s=(c/100).toFixed(2).split('.');return 'RM'+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+s[1]}
function rmx(c){return c==null?'<span class="nil">—</span>':rm(c)}
function get(k,d){try{var v=localStorage.getItem(LS+k);return v?JSON.parse(v):d}catch(e){return d}}
function set(k,v){localStorage.setItem(LS+k,JSON.stringify(v))}
function del(k){localStorage.removeItem(LS+k)}
function toast(t,ms){var e=document.getElementById('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},ms||Math.max(1600,Math.min(4000,40*String(t).length)))}
function tnow(){return new Date().toISOString()}
function tfmt(iso){try{return new Date(iso).toLocaleString('zh-CN',{timeZone:'Asia/Kuala_Lumpur',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'（马来西亚时间）'}catch(e){return iso}}
function oid(p){var d=new Date(),z=function(n){return(n<10?'0':'')+n};return p+'-'+String(d.getFullYear()).slice(2)+z(d.getMonth()+1)+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes())+z(d.getSeconds())+Math.floor(Math.random()*90+10)}
function orderNo(o){if(o&&o.id)return String(o.id);var pre=(o&&o.kind==='cust')?'C':'A',t='';try{if(o&&o.time)t=new Date(o.time).toISOString().replace(/[-:TZ.]/g,'').slice(2,14)}catch(e){}var who=(o&&(o.agentAcct||o.shop||(o.cust&&o.cust.user)||''))||'';return pre+'-'+(t||'NODATE')+(who?'-'+who:'')+'（补编）'}
function tail4(s){var d=String(s||'').replace(/\D/g,'');return d.slice(-4)}
function phoneDigits(s){return String(s||'').replace(/\D/g,'')}
function isFullPhone(s){var d=phoneDigits(s);return d.length>=9&&d.length<=15}
function custUser(name,phone){return name+phoneDigits(phone)}
function seedAgents(){return [{name:'阿伟',tail:'0901',acct:'阿伟0901a',shop:'阿伟0901',rate:0.4},{name:'abc',tail:'1234',acct:'abc1234a',shop:'abc1234',rate:0.4}]}
function agents(){var L=get('agents',null);if(!Array.isArray(L)||!L.length){L=seedAgents();set('agents',L)}L.forEach(function(a){if(a.rate==null||!isFinite(a.rate))a.rate=0.4;if(!a.sell||typeof a.sell!=='object'||Array.isArray(a.sell))a.sell={};if(a.rateMin==null||!isFinite(a.rateMin))a.rateMin=0;if(a.creditMax==null||!isFinite(a.creditMax))a.creditMax=CREDIT_DEF;if(!a.acct)a.acct=a.name+a.tail+'a';if(!a.shop)a.shop=a.name+a.tail});return L}
function saveAgents(L){set('agents',L)}
function seedStaff(){return [{name:'小芳',tail:'0001',acct:'小芳0001s'}]}
function staff(){var L=get('staff',null);if(!Array.isArray(L)){L=seedStaff();set('staff',L)}L.forEach(function(s){if(!s.acct)s.acct=s.name+s.tail+'s'});return L}
function saveStaff(L){set('staff',L)}
function staffByAcct(acct){var L=staff();for(var i=0;i<L.length;i++)if(L[i].acct===acct)return L[i];return null}
function staffSess(){return get('sess.staff',null)}
function acctTaken(acct){return !!(agentByAcct(acct)||staffByAcct(acct))}
function agentByShop(s){var L=agents();for(var i=0;i<L.length;i++)if(L[i].shop===s)return L[i];return null}
function agentByAcct(acct){var L=agents();for(var i=0;i<L.length;i++)if(L[i].acct===acct)return L[i];return null}
function ratePct(r){var p=Math.round((r==null?0.4:r)*10000)/100;return String(p)}
var RATE_MAX=500;
function parseRate(s,max){var n=parseFloat(String(s==null?'':s).replace(/%/g,'').replace(/,/g,'.').trim());if(!isFinite(n)||n<0||n>(max==null?100:max))return null;return Math.round(n*100)/10000}
function sellOf(cost,rate){return cost==null?null:Math.round(cost*(1+(rate==null?0.4:rate)))}
function rateOf(A){return A&&A.rate!=null?A.rate:0.4}
function minOf(A){return A&&A.rateMin!=null?A.rateMin:0}
function floorOf(A,cost){return sellOf(cost,minOf(A))}
function defOf(A,cost){if(cost==null)return null;return Math.max(sellOf(cost,rateOf(A)),floorOf(A,cost))}
/* 代理当前价：单独改过的建议售价优先（不低于最低售价），否则按利润率 */
function priceOf(A,x){var o=(A&&A.sell&&A.sell[x.sku])||{};function one(cost,ov){if(cost==null)return{s:null,c:false};var f=floorOf(A,cost);if(ov!=null&&isFinite(ov))return{s:Math.max(ov,f),c:true};return{s:defOf(A,cost),c:false}}
  var b=one(x.a,o.box),u=one(x.au,o.unit);return{a:x.a,s:b.s,k:(b.s==null||x.a==null)?null:b.s-x.a,au:x.au,su:u.s,ku:(u.s==null||x.au==null)?null:u.s-x.au,cs:b.c,cu:u.c}}
function withRate(D,A){if(typeof A!=='object')A={rate:A,rateMin:0,sell:{}};var items=D.items.map(function(x){var y={},k;for(k in x)y[k]=x[k];var P=priceOf(A,x);y.s=P.s;y.k=P.k;y.su=P.su;y.ku=P.ku;y.cs=P.cs;y.cu=P.cu;return y});var by={};items.forEach(function(x){by[x.sku]=x});return{cats:D.cats,items:items,by:by,source:D.source,generated:D.generated}}
function shopOnly(D,A){var W=withRate(D,A),items=W.items.map(function(x){return{sku:x.sku,cat:x.cat,name:x.name,en:x.en,pk:x.pk,n:x.n,img:x.img,th:x.th,wh:x.wh,v:x.v,vo:x.vo,vt:x.vt,s:x.s,su:x.su}}),by={};items.forEach(function(x){by[x.sku]=x});return{cats:D.cats,items:items,by:by,source:D.source,generated:D.generated}}
function sellCount(A){var n=0,k;for(k in (A&&A.sell)||{})n++;return n}
function exAt(rate){var a=25000,s=sellOf(a,rate);return '例：HB001 本钱价 RM250.00 → 建议售价 '+rm(s)+' · 利润 '+rm(s-a)}

/* ---------- data (三份分开的数据文件，按角色按需加载) ---------- */
var cache={};
function load(kind){
  var v={master:'HB_MASTER',agent:'HB_AGENT',shop:'HB_SHOP'}[kind];
  if(window[v])return Promise.resolve(window[v]);
  if(cache[kind])return cache[kind];
  return cache[kind]=new Promise(function(res,rej){var s=document.createElement('script');s.src='data/'+kind+'.js';s.onload=function(){var d=window[v];d.by={};d.items.forEach(function(x){d.by[x.sku]=x});res(d)};s.onerror=rej;document.head.appendChild(s)});
}

/* ---------- orders ---------- */
var ST0A='待客服确认',ST0C='待人工确认出货',ST1='已确认',ST2='安排出货';
function isCust(o){return o&&o.kind==='cust'}
function agentChecked(o){return !!(o&&o.agentChk)}
function pendingCust(o){return isCust(o)&&!agentChecked(o)}
function shipLabel(o){return o.status===ST2?ST2:(isCust(o)?'待出货':o.status)}
function chkLabel(o){return agentChecked(o)?'代理已对':'待代理对'}
function custSt(o){return o.status===ST2?'已安排出货':agentChecked(o)?'代理已核对':'订单已提交'}
function custTip(o){return o.status===ST2?'本店已安排出货。':agentChecked(o)?'本店代理已核对，稍后安排出货。':'订单已提交，本店代理正在核对。'}
function askBox(t,opt){opt=opt||{};var c=!!opt.compact;function cell(cls,title,money,miss,sub){return '<div class="'+(cls||'')+'"><i>'+title+'</i><b>'+rmSum(money,miss)+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div>'}
  var inner=cell('','进货了多少',t.a,t.missA,'进价合计，向总盘进的货')+cell('s','卖了多少',t.s,t.missS,'卖价合计')+cell('w','还欠公司多少',t.bal,t.missB,'进价 − 已收，欠总盘')+(c?'':cell('k','抽成',t.k,t.missK,'卖价 − 进价，不是欠公司'));
  var box='<div class="ask'+(c?' sm':'')+'">'+inner+'</div>';return opt.link?'<a class="askc" href="'+opt.link+'">'+box+'</a>':box}
function isDemoOrder(o){return /^(A|C)-DEMO\d+$/.test(o&&o.id)}
function hasDemoOrders(list){return (list||[]).some(isDemoOrder)}
function seedOrders(){
  var t1='2026-11-12T06:18:00.000Z',t2='2026-11-11T09:32:00.000Z',t3='2026-11-09T04:05:00.000Z',t3p='2026-11-09T06:20:00.000Z',t3s='2026-11-10T02:10:00.000Z';
  return [
    {id:'A-DEMO2',kind:'agent',agentAcct:'abc1234a',shop:'abc1234',time:t3,status:ST2,paid:true,paidAt:t3p,memo:'',
      items:[{sku:'HB011',name:'五万头礼炮',pk:'4/1',mode:'box',qty:1,a:59750,s:83650}],
      pays:[{id:'P-DEMO1',amount:59750,method:'银行转账',note:'示例收款',t:t3p,by:'小芳0001s'}],
      log:[{t:t3,s:ST0A},{t:t3s,s:ST2},{t:t3p,s:'收款 RM597.50 · 银行转账'}]},
    {id:'A-DEMO1',kind:'agent',agentAcct:'阿伟0901a',shop:'阿伟0901',time:t2,status:ST1,paid:false,memo:'',
      items:[{sku:'HB003',name:'8尺特红(1.0)',pk:'30/1',mode:'box',qty:1,a:43500,s:60900},{sku:'HB001',name:'8尺红炮',pk:'40/1',mode:'unit',qty:10,a:625,s:875}],
      pays:[],log:[{t:t2,s:ST0A},{t:'2026-11-11T10:05:00.000Z',s:ST1}]},
    {id:'C-DEMO1',kind:'cust',agentAcct:'阿伟0901a',shop:'阿伟0901',time:t1,status:ST0C,paid:false,
      cust:{user:'丽芬0123456789',name:'丽芬',phone:'012-345 6789',ship:'agent',addr:'',memo:''},
      items:[{sku:'HB001',name:'8尺红炮',pk:'40/1',mode:'box',qty:1,s:35000}],
      pays:[],log:[{t:t1,s:ST0C}]}
  ];
}
function orders(){if(localStorage.getItem(LS+'orders')==null){var L=seedOrders();set('orders',L);return L}return get('orders',[])}
function saveOrders(o){set('orders',o)}
function stc(s){return s===ST2?'s2':s===ST1?'s1':'s0'}
var PAY_M=['现金','银行转账','DuitNow','Touch n Go','支票','其他'];
function paysOf(o){return Array.isArray(o.pays)?o.pays:[]}
function parseRM(s){var n=parseFloat(String(s==null?'':s).replace(/[RMrm\s]/g,'').replace(/,/g,''));if(!isFinite(n)||n<0)return null;return Math.round(n*100)}
function tshort(iso){try{return new Date(iso).toLocaleString('zh-CN',{timeZone:'Asia/Kuala_Lumpur',hour12:false,month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(e){return iso}}
function dueOf(o,D){var miss=false,a=0;(o.items||[]).forEach(function(it){var v=lineVals(o,it,D);if(v.a==null)miss=true;else a+=v.a});return{v:a,miss:miss}}
function paidAmt(o,due){var L=paysOf(o),s=0;if(L.length){L.forEach(function(p){s+=(+p.amount||0)});return s}if(o.paid&&due!=null)return due;return 0}
function isPaid(o,D){var d=dueOf(o,D);if(paysOf(o).length)return !d.miss&&paidAmt(o,d.v)>=d.v;return !!o.paid}
function settleOf(o,D){var t={qty:0,s:0,a:0,k:0,missS:0,missA:0,missK:0};(o.items||[]).forEach(function(it){var v=lineVals(o,it,D);t.qty+=it.qty||0;if(v.s==null)t.missS++;else t.s+=v.s;if(v.a==null)t.missA++;else t.a+=v.a;if(v.k==null)t.missK++;else t.k+=v.k});var p=paidAmt(o,t.missA?null:t.a);t.paid=p;t.legacy=!!(o.paid&&!paysOf(o).length);t.missB=t.missA?1:0;t.bal=t.missA?null:t.a-p;return t}
function payMethods(o){var L=paysOf(o),u=[],seen={};L.forEach(function(p){var m=p.method||'未记方式';if(!seen[m]){seen[m]=1;u.push(m)}});if(!L.length&&o.paid)u.push('已付款（未记方式）');return u}
function payListHtml(o,canDel){var L=paysOf(o);if(!L.length)return o.paid?'<p class="tip">已付款（当时未记金额和方式）</p>':'';return '<ul class="paylog">'+L.map(function(p,i){return '<li><span>'+tshort(p.t)+' · '+esc(p.method)+(p.by?' · '+esc(p.by):'')+(p.note?' · '+esc(p.note):'')+'</span><b>'+rm(p.amount)+'</b>'+(canDel?' <button type="button" class="rm" data-pdel="'+esc(o.id)+'" data-pi="'+i+'">删除</button>':'')+'</li>'}).join('')+'</ul>'}
function payBox(o,t,edit){var L=paysOf(o);if(!edit&&!L.length&&!o.paid)return '';var h='<div class="paybox">';if(edit)h+='<div class="payform"><input id="pa-'+o.id+'" inputmode="decimal" placeholder="收款金额" aria-label="收款金额"><select id="pm-'+o.id+'" aria-label="收款方式">'+PAY_M.map(function(m){return '<option>'+m+'</option>'}).join('')+'</select><input id="pn-'+o.id+'" placeholder="备注（选填）" aria-label="备注"><button type="button" data-prec="'+o.id+'">记录收款</button></div>';h+=payListHtml(o,edit);return h+'</div>'}
function ymKL(iso){try{return new Date(iso).toLocaleString('sv-SE',{timeZone:'Asia/Kuala_Lumpur'}).slice(0,7)}catch(e){return ''}}
function thisMonthKL(){return new Date().toLocaleString('sv-SE',{timeZone:'Asia/Kuala_Lumpur'}).slice(0,7)}
function monthLabel(ym){if(!ym||ym.length<7)return ym;return ym.slice(0,4)+'年'+parseInt(ym.slice(5,7),10)+'月'}
function totalsOf(list,D){
  var t={n:list.length,qty:0,s:0,a:0,k:0,paid:0,bal:0,missS:0,missA:0,missK:0,missB:0};
  list.forEach(function(o){var st=settleOf(o,D);t.qty+=st.qty;t.s+=st.s;t.a+=st.a;t.k+=st.k;t.missS+=st.missS;t.missA+=st.missA;t.missK+=st.missK;t.paid+=st.paid;if(st.missB)t.missB++;else t.bal+=st.bal});
  return t;
}
function rmSum(v,miss){if(miss){return (v?rm(v):'—')+'<small class="miss">（有缺）</small>'}return rm(v)}
function modeTxt(it,view){return it.mode==='unit'?'散装（件）':(view==='cust'?'整盒':'整箱')+'（'+esc(it.pk)+'）'}
function creditMaxOf(A){var n=A&&A.creditMax;if(n==null||!isFinite(n))return CREDIT_DEF;return Math.max(0,Math.round(+n))}
function parseCredit(s){var n=parseRM(s);if(n==null||n>CREDIT_CAP)return null;return n}
function creditOf(A,D){var acct=(A&&A.acct)||A,max=creditMaxOf(A&&typeof A==='object'?A:{});var t=totalsOf(orders().filter(function(o){return orderKey(o)===acct}),D);var used=t.missB?null:t.bal,miss=!!t.missB;return{max:max,used:used,remain:miss?null:max-(used||0),miss:miss,t:t}}
function creditTxt(c){return '最高 '+rm(c.max)+' · 已用 '+(c.miss?rmSum(c.t.bal,1):rm(c.used||0))+' · 还可赊 '+(c.miss?rmSum(null,1):rm(c.remain))}
function linesCost(lines,D){var a=0,miss=false;(lines||[]).forEach(function(it){var v=lineVals({},it,D);if(v.a==null)miss=true;else a+=v.a});return{a:a,miss:miss}}
function creditDeny(A,D,lines,costD){var oc=linesCost(lines,costD||D);if(oc.miss)return '本单进价有缺，无法核对赊账额度';var c=creditOf(A,D);if(c.miss)return '已用赊账有缺，无法核对额度';if((c.used||0)+oc.a>c.max)return '超出赊账额度：最高 '+rm(c.max)+'，已用 '+rm(c.used||0)+'，本单进价 '+rm(oc.a);return null}
function applyPay(o,amt,method,note,by,D){o.pays=paysOf(o).concat([{id:oid('P'),amount:amt,method:method,note:note,t:tnow(),by:by}]);var st=settleOf(o,D);o.paid=!st.missA&&st.paid>=st.a;o.paidAt=o.paid?tnow():(o.paidAt||null);(o.log=o.log||[]).push({t:tnow(),s:'收款 '+rm(amt)+' · '+method})}
function repayAcct(acct,amt,method,note,by,D){var all=orders(),list=all.filter(function(o){return orderKey(o)===acct}).slice().sort(function(a,b){return String(a.time||'').localeCompare(String(b.time||''))}),t=totalsOf(list,D);if(t.missB)return{err:'进价有缺，无法核对要收余额'};if(!t.bal||t.bal<=0)return{err:'已经还清，不用还款'};if(amt==null||amt<=0)return{err:'请填写还款金额'};if(amt>t.bal)return{err:'不能超过要收余额 '+rm(t.bal)};var left=amt,n=0;list.forEach(function(o){if(left<=0)return;var st=settleOf(o,D);if(st.missA||!st.bal||st.bal<=0)return;var part=Math.min(left,st.bal);applyPay(o,part,method,note,by,D);left-=part;n++});if(!n)return{err:'没有可还的订单'};saveOrders(all);return{n:n,amt:amt}}
function creditBox(c,canRepay){var h='<div class="crbox"><div class="cr"><b>赊账</b> '+creditTxt(c)+'</div>';if(canRepay){if(!c.miss&&c.used>0)h+='<div class="payform"><input id="ca" inputmode="decimal" placeholder="还款金额（自己填）" aria-label="还款金额"><select id="cm" aria-label="还款方式">'+PAY_M.map(function(m){return '<option>'+m+'</option>'}).join('')+'</select><input id="cn" placeholder="备注（选填）" aria-label="备注"><button type="button" data-crepay="1">记录还款</button></div>';else if(!c.miss)h+='<p class="tip">已经还清，不用还款。</p>';else h+='<p class="tip">进价有缺，无法在这里记还款，请到单笔订单记录收款。</p>'}return h+'</div>'}

/* ---------- 预览条 ---------- */
document.getElementById('reset').onclick=function(){if(!confirm('清空草稿里的示例订单、购物车、登录，以及新开的下线和秘书？代理会回到阿伟和 abc，秘书会回到小芳0001s。'))return;Object.keys(localStorage).forEach(function(k){if(k.indexOf(LS)===0)localStorage.removeItem(k)});toast('已重置');route()};
function markPv(r){[].forEach.call(document.querySelectorAll('#pv a'),function(a){a.classList.toggle('on',a.getAttribute('data-r')===r)})}

/* ---------- router ---------- */
window.addEventListener('hashchange',route);
function parts(){var h=decodeURIComponent(location.hash.replace(/^#\/?/,''));var q='';var i=h.indexOf('?');if(i>=0){q=h.slice(i+1);h=h.slice(0,i)}return{p:h.split('/').filter(Boolean),q:new URLSearchParams(q)}}
function route(){
  var r=parts(),p=r.p;document.body.className='';
  window.scrollTo(0,0);
  if(!p.length){markPv('home');return home()}
  if(p[0]==='master'){markPv('master');return master(p[1]||'stats',p[2])}
  if(p[0]==='cs'){markPv('cs');return staffApp(p[1])}
  if(p[0]==='agent'){markPv('agent');return agent(p.slice(1),r.q)}
  if(p[0]==='a'&&p[1]){markPv('shop');return shop(p[1],p.slice(2),r.q)}
  app.innerHTML='<div class="empty">找不到页面。<a href="#/">回说明页</a></div>';
}

/* ======================= 说明页 ======================= */
function home(){
  document.body.className='nobn';
  app.innerHTML='<div class="land"><h1>Hunter BOOM JOHOR · 总盘与下线代理（草稿）</h1>'+
  '<p>这是给老板看的草稿，入口可在顶部黑条随时切换。数据来自 2026 价目表（253 款），订单只存在这台浏览器（localStorage），不连真实系统。</p>'+
  '<div class="rc">'+
  '<a href="#/master"><span class="e">📊</span><b>总盘（永）</b>给老板看的是统计、订单、代理名单。<ul><li>统计：总销售、未付款 / 已付款、出货状态、抽成，可按代理分</li><li>订单：确认有货、安排出货；秘书记录收款金额和方式</li><li>代理名单：开下线、设定抽成和默认利润率、最低利润</li><li>完整价目表放在内部查阅，不放主菜单，以免扰乱老板</li></ul></a>'+
  '<a href="#/agent"><span class="e">🧾</span><b>① 代理自己订货</b>登录用户名：<b style="display:inline;font-size:15px">阿伟0901a</b><ul><li>名字 + 电话尾号 + <b style="display:inline;font-size:13px">a</b></li><li>完整产品资料，看本钱价 / 建议售价 / 利润</li><li>向总盘下单；底部「账户详情」可看进货、卖出和还欠公司</li></ul></a>'+
  '<a href="#/a/阿伟0901"><span class="e">🛍️</span><b>② 顾客下单链接</b>链接：<b style="display:inline;font-size:15px">/a/阿伟0901</b>（没有 a）<ul><li>只显示卖价，看不到总盘、进价、抽成</li><li>顾客登录填 姓名 + 完整电话号码</li><li>下单必填 姓名、完整电话、收货地址，并可选整盒或散装，单挂在阿伟名下</li></ul></a>'+
  '<a href="#/cs"><span class="e">👩‍💼</span><b>③ 客服（秘书）</b>登录用户名：<b style="display:inline;font-size:15px">小芳0001s</b><ul><li>名字 + 电话尾号 + <b style="display:inline;font-size:13px">s</b>，由总盘开通</li><li>单独入口，按代理户口，外面只看统一钱数；点进去看个别散单并备货</li><li>看不到开下线、改抽成和价目表</li></ul></a>'+
  '</div><div class="rule"><b>价钱规则（按你定的）：</b> 代理进价 = 总盘 × 1.25；卖价 = 代理进价 × 1.40；抽成 = 卖价 − 代理进价（即进价的 40%）。散装：只有包装 N/1 才算，总盘单件 = 箱价 ÷ N，再按同样规则；其他包装散装留空。金额四舍五入到 RM0.01。<br>例：HB001 8尺红炮（40/1）总盘 RM200 → 进价 RM250 · 卖价 RM350 · 抽成 RM100；散装 进价 RM6.25 · 卖价 RM8.75 · 抽成 RM2.50。</div>'+
  '<div class="rule"><b>登录规则：</b> 代理自己订货 = 名字 + 电话尾号 + <code>a</code>（<code>阿伟0901a</code>）。秘书（客服）= 名字 + 电话尾号 + <code>s</code>（<code>小芳0001s</code>），从 <code>/cs</code> 单独登录，只处理订单，由总盘开通。顾客在代理的顾客链接 <code>/a/阿伟0901</code> 登录，须填 姓名和完整电话（例：丽芬，012-345 6789）。草稿里登录不设密码，只为看流程。</div>'+
  '<div class="rule"><b>出货与收款：</b>出货不代表已收款。代理可赊账，最高默认 RM10,000，总盘可按个别代理改；还款由秘书或总盘在该代理户口自填金额。顾客散单开了单后由该代理对。客服按代理户口，外面只看统一钱数；点进去看个别散单并备货。</div></div>';
}

/* ======================= 总盘 ======================= */
function masterFoot(tab){
  if(tab==='data')return '<p class="mf">此页是内部价目查阅，不放在老板主菜单。<a href="#/master">返回统计</a></p>';
  return '<p class="mf"><a href="#/master/data">价目表（内部查阅）</a></p>';
}
function master(tab,sel){
  document.body.className='mst nobn';
  load('master').then(function(D){
    var os=orders(),pend=os.filter(function(o){return o.status!==ST2}).length,unp=os.filter(function(o){return !isPaid(o,D)}).length;
    var head='<header class="mh"><div class="in"><h1>Hunter BOOM JOHOR 总盘<small>永 · 只看数据 · 草稿</small></h1><nav><a href="#/master" class="'+(tab==='stats'||tab==='unpaid'?'on':'')+'">统计</a><a href="#/master/orders" class="'+(tab==='orders'?'on':'')+'">订单'+(unp||pend?'（'+(unp?'未付款 '+unp+(pend?' · ':''):'')+(pend?'未出货 '+pend:'')+'）':'')+'</a><a href="#/master/agents" class="'+(tab==='agents'?'on':'')+'">代理名单</a></nav></div></header>';
    if(tab==='stats')return masterStats(D,head);
    if(tab==='unpaid')return masterUnpaid(D,head);
    if(tab==='orders')return masterOrders(D,head,false,sel);
    if(tab==='agents')return masterAgents(head,D);
    var it=D.items.filter(function(x){return x.live}),ready=it.filter(function(x){return x.n}).length;
    var cat={};D.cats.forEach(function(c){cat[c.id]=c.name});
    var cats=D.cats.filter(function(c){return it.some(function(x){return x.cat===c.id})});
    app.innerHTML=head+'<main class="mw"><h2 class="sh">价目表 <small style="font-weight:500;color:#888">内部查阅</small></h2>'+
    '<div class="kp"><div><b>'+it.length+'</b>款</div><div><b>'+ready+'</b>散装可算（N/1）</div><div class="w"><b>'+(it.length-ready)+'</b>散装待确认</div></div>'+
    '<div class="fl"><input id="mq" type="search" placeholder="搜编号 / 中文名 / 英文名 / 包装"><select id="mc"><option value="">全部分类</option>'+cats.map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join('')+'</select><select id="ml"><option value="">散装：全部</option><option value="y">散装可算</option><option value="n">散装待确认</option></select><button id="mx" type="button">导出 CSV</button><span class="n" id="mn"></span></div>'+
    '<div class="tw"><table class="dt dt2"><thead><tr><th rowspan="2" class="sk">编号</th><th rowspan="2">产品</th><th rowspan="2">包装</th><th colspan="4" class="g1">整盒</th><th colspan="3" class="g2">散装（每件）</th></tr><tr><th class="r g1">总盘</th><th class="r g1">进价</th><th class="r g1">卖价</th><th class="r g1">抽成</th><th class="r g2">进价</th><th class="r g2">卖价</th><th class="r g2">抽成</th></tr></thead><tbody id="mb"></tbody></table></div>'+
    '<p class="ms-note">来源：'+esc(D.source)+'。总盘 = 价目表箱价，包装照原表。表中卖价、抽成按默认 40% 计算；每个代理的实际卖价在「代理名单」按该代理抽成设定。散装只在包装为 N/1 时计算；其他包装留空（不当 0）。</p>'+masterFoot('data')+'</main>';
    var rows=it.map(function(x){return{x:x,s:(x.sku+' '+x.name+' '+x.en+' '+x.pk+' '+cat[x.cat]).toLowerCase(),h:'<tr><td class="b sk">'+x.sku+'</td><td class="nm">'+esc(x.name)+'<small>'+esc(cat[x.cat])+' · '+esc(x.en)+'</small></td><td>'+esc(x.pk)+(x.n?'<small>'+x.n+' 件</small>':'')+'</td><td class="r b g1">'+rm(x.c)+'</td><td class="r g1">'+rm(x.a)+'</td><td class="r g1">'+rm(x.s)+'</td><td class="r g1">'+rm(x.k)+'</td><td class="r g2">'+rmx(x.au)+'</td><td class="r g2">'+rmx(x.su)+'</td><td class="r g2">'+rmx(x.ku)+'</td></tr>'}});
    var tb=document.getElementById('mb');
    function draw(){var q=document.getElementById('mq').value.trim().toLowerCase(),c=document.getElementById('mc').value,l=document.getElementById('ml').value;
      var f=rows.filter(function(r){var x=r.x;return(!q||r.s.indexOf(q)>=0)&&(!c||x.cat===c)&&(!l||(l==='y')===!!x.n)});
      tb.innerHTML=f.map(function(r){return r.h}).join('')||'<tr><td colspan="10" class="muted">没有符合的产品</td></tr>';document.getElementById('mn').textContent='显示 '+f.length+' / '+rows.length;return f}
    ['mq','mc','ml'].forEach(function(id){document.getElementById(id).addEventListener('input',draw)});draw();
    document.getElementById('mx').onclick=function(){var f=draw(),c=function(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v},m=function(v){return v==null?'':(v/100).toFixed(2)};
      var L=[['编号','分类','中文名','英文名','包装','总盘箱价','一盒件数','总盘单件','代理进价箱','卖价箱','抽成箱','散装进价','散装卖价','散装抽成','散装']].concat(f.map(function(r){var x=r.x;return[x.sku,cat[x.cat],x.name,x.en,x.pk,m(x.c),x.n||'',x.u||'',m(x.a),m(x.s),m(x.k),m(x.au),m(x.su),m(x.ku),x.n?'可算':'待确认']}));
      var b=new Blob(['\ufeff'+L.map(function(r){return r.map(c).join(',')}).join('\n')],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='总盘_草稿导出.csv';a.click()};
  });
}
function masterStats(D,head){
  var period=get('ms.period','all'), month=thisMonthKL();
  var os=orders().filter(function(o){return period!=='month'||ymKL(o.time)===month});
  var unpaidL=os.filter(function(o){return !isPaid(o,D)}), paidL=os.filter(function(o){return isPaid(o,D)});
  var waitL=os.filter(function(o){return o.status!==ST1&&o.status!==ST2});
  var confL=os.filter(function(o){return o.status===ST1});
  var shipL=os.filter(function(o){return o.status===ST2});
  var T=totalsOf(os,D),U=totalsOf(unpaidL,D),P=totalsOf(paidL,D),W=totalsOf(waitL,D),C=totalsOf(confL,D),S=totalsOf(shipL,D);
  function card(cls,title,money,miss,n,sub,href,hint){
    var inner='<b>'+rmSum(money,miss)+'</b>'+title+'<i>'+(n!=null?n+' 笔':'')+(n!=null&&sub?' · ':'')+(sub||'')+'</i>'+(hint?'<i class="go">'+hint+'</i>':'');
    if(href)return '<a class="'+(cls||'')+'" href="'+href+'">'+inner+'</a>';
    return '<div class="'+(cls||'')+'">'+inner+'</div>';
  }
  var kpi='<div class="kp sale">'+
    card('hi','总销售（卖价）',T.s,T.missS,T.n,'顾客单 + 代理自己订货')+
    card('','总盘应收（进价）',T.a,T.missA,T.n,'代理应付给总盘')+
    card('w','未付款（要收余额）',T.bal,T.missB,U.n,'总盘还未收的进价','#/master/unpaid','点进去看哪个代理还没还钱 ›')+
    card('ok','已收款',T.paid,T.missB,P.n,'秘书已记的收款')+
    card('k','抽成合计',T.k,T.missK,null,'卖价 − 进价，代理应得')+
    card('','待确认',W.s,W.missS,W.n,'卖价')+
    card('','已确认待出货',C.s,C.missS,C.n,'卖价')+
    card('','已出货',S.s,S.missS,S.n,'卖价')+
  '</div>';
  var by={},keys=[];
  agents().forEach(function(a){by[a.acct]={name:a.name,acct:a.acct,shop:a.shop,list:[]};keys.push(a.acct)});
  os.forEach(function(o){var k=o.agentAcct||('?'+(o.shop||'未记代理'));if(!by[k]){by[k]={name:o.shop||k,acct:k,shop:o.shop||'',list:[]};keys.push(k)}by[k].list.push(o)});
  var arows=keys.map(function(k){var g=by[k],tg=totalsOf(g.list,D);
    return '<tr><td><a href="#/master/orders/'+encodeURIComponent(k)+'">'+esc(g.name)+'</a><br><small class="muted">'+esc(g.acct)+'</small></td><td class="r">'+tg.n+'</td><td class="r">'+rmSum(tg.s,tg.missS)+'</td><td class="r">'+rmSum(tg.a,tg.missA)+'</td><td class="r w">'+rmSum(tg.bal,tg.missB)+'</td><td class="r">'+rm(tg.paid)+'</td><td class="r k">'+rmSum(tg.k,tg.missK)+'</td></tr>';
  }).join('');
  var empty=os.length? '':'<p class="ms-note">这个范围内还没有订单，金额为 RM0.00（没有单，不是缺数据）。去「① 代理自己订货」或「② 顾客下单链接」下一张单后，这里会跟着变。</p>';
  app.innerHTML=head+'<main class="mw"><div class="fl"><strong style="font-size:15px">订单统计</strong><button type="button" data-p="all" style="'+(period==='all'?'background:#222;color:#fff':'')+'">全部</button><button type="button" data-p="month" style="'+(period==='month'?'background:#222;color:#fff':'')+'">本月（'+monthLabel(month)+'）</button><span class="n">收款由秘书记录金额和方式。没有取消或退货。</span></div>'+
    kpi+empty+
    '<h2 class="sh">按代理分</h2><div class="tw" style="max-height:none"><table class="dt at"><thead><tr><th>代理</th><th class="r">笔数</th><th class="r">总销售（卖价）</th><th class="r">总盘应收（进价）</th><th class="r">要收余额</th><th class="r">已收款</th><th class="r">抽成</th></tr></thead><tbody>'+
    (arows||'<tr><td colspan="7" class="muted">还没有代理订单</td></tr>')+'</tbody></table></div>'+
    '<p class="ms-note"><b>口径：</b>总销售 = 订单卖价合计（顾客下单 + 代理自己订货）。总盘应收 = 进价合计（代理应付总盘）。已收款 = 秘书记下的实收金额。要收余额 = 进价 − 已收。抽成 = 卖价 − 进价。可记部分付款。某行缺数据会标「有缺」，不把缺失当 0。暂无取消、退货。</p>'+masterFoot('stats')+'</main>';
  [].forEach.call(app.querySelectorAll('[data-p]'),function(b){b.onclick=function(){set('ms.period',b.getAttribute('data-p'));route()}});
}
function masterUnpaid(D,head){
  var period=get('ms.period','all'), month=thisMonthKL();
  var os=orders().filter(function(o){return period!=='month'||ymKL(o.time)===month});
  var by={},keys=[];
  os.forEach(function(o){var k=orderKey(o);if(!by[k]){var A=agentByAcct(k);by[k]={name:A?A.name:(o.shop||k.replace(/^\?/,'')),acct:k,gone:!A,list:[]};keys.push(k)}by[k].list.push(o)});
  var rows=keys.map(function(k){var g=by[k],t=totalsOf(g.list,D);
    var isP=function(o){return isPaid(o,D)};
    var pp=g.list.filter(isP).length,pt=g.list.filter(function(o){return !isP(o)&&settleOf(o,D).paid>0}).length,pu=g.list.length-pp-pt;
    return {g:g,t:t,pu:pu,pt:pt,unp:pu+pt};
  }).filter(function(r){return r.t.missB||r.t.bal>0}).sort(function(a,b){
    if(a.t.missB&&!b.t.missB)return 1;if(!a.t.missB&&b.t.missB)return -1;return (b.t.bal||0)-(a.t.bal||0);
  });
  var totBal=0,totMiss=0,totUnp=0;
  rows.forEach(function(r){if(r.t.missB)totMiss++;else totBal+=r.t.bal;totUnp+=r.unp});
  var cards=rows.map(function(r){var g=r.g,t=r.t,cr=creditOf(agentByAcct(g.acct)||{acct:g.acct},D);
    return '<a class="acct debt" href="#/master/orders/'+encodeURIComponent(g.acct)+'"><div class="an"><b>'+esc(g.name)+'</b><small>'+esc(g.acct)+(g.gone?' · 已不在名单':'')+'</small><span class="ac w">要收余额 '+rmSum(t.bal,t.missB)+' ›</span></div>'+
      '<div class="am bal"><span class="w">要收余额<b>'+rmSum(t.bal,t.missB)+'</b></span><span>进价（应收）<b>'+rmSum(t.a,t.missA)+'</b></span><span>已收<b>'+rm(t.paid)+'</b></span></div>'+
      '<div class="cn"><span class="x">未付款 '+r.unp+' 笔</span>'+(r.pt?'<span class="x">部分付款 '+r.pt+'</span>':'')+'<span>已用 '+(cr.miss?rmSum(cr.t.bal,1):rm(cr.used||0))+' / 最高 '+rm(cr.max)+'</span></div></a>';
  }).join('');
  var empty=rows.length?'':'<div class="oc empty">这个范围内没有还没还钱的代理。</div>';
  var sum=rows.length?('<p class="unpaid-sum">共 '+rows.length+' 个代理还没还钱 · 未付款 '+totUnp+' 笔 · 要收余额合计 <b>'+rmSum(totBal,totMiss)+'</b></p>'):'';
  app.innerHTML=head+'<main class="mw"><a class="back" href="#/master">‹ 返回统计</a><div class="fl"><strong style="font-size:15px">还没还钱的代理</strong><button type="button" data-p="all" style="'+(period==='all'?'background:#222;color:#fff':'')+'">全部</button><button type="button" data-p="month" style="'+(period==='month'?'background:#222;color:#fff':'')+'">本月（'+monthLabel(month)+'）</button><span class="n">要收余额 = 进价 − 已收（总盘还未收到的钱）。可记部分付款。有缺标「有缺」，不把缺当 0。</span></div>'+
    sum+(cards||empty)+
    (hasDemoOrders(os)?'<p class="ms-note">以上是示例，不是真实生意。</p>':'')+masterFoot('stats')+'</main>';
  [].forEach.call(app.querySelectorAll('[data-p]'),function(b){b.onclick=function(){set('ms.period',b.getAttribute('data-p'));route()}});
}
function masterAgents(head,D){
  var L=agents();
  function preview(){var n=document.getElementById('nn').value.trim(),t=tail4(document.getElementById('nt').value),r=parseRate(document.getElementById('nr').value,RATE_MAX);document.getElementById('np').innerHTML=n&&t.length===4?('将开通：登录 <b>'+esc(n+t+'a')+'</b> · 顾客店 <b>/a/'+esc(n+t)+'</b>'):'请填名字和 4 位尾号';document.getElementById('nx').textContent=r==null?'利润率请填 0–'+RATE_MAX+' 的数字':exAt(r)}
  var rows=L.map(function(a,i){var nc=sellCount(a),cr=creditOf(a,D),cm=creditMaxOf(a);return '<tr><td>'+esc(a.name)+'（尾号 '+esc(a.tail)+'）</td><td><b>'+esc(a.acct)+'</b></td><td><a href="#/a/'+encodeURIComponent(a.shop)+'" style="color:#9b1c2c">/a/'+esc(a.shop)+'</a></td><td><div class="rt"><span class="gl">默认利润率</span><input id="r'+i+'" type="number" min="0" max="'+RATE_MAX+'" step="0.01" value="'+ratePct(a.rate)+'" aria-label="'+esc(a.name)+' 默认利润率"> %<span class="gl">最低利润</span><input id="m'+i+'" type="number" min="0" max="100" step="0.01" value="'+ratePct(a.rateMin)+'" aria-label="'+esc(a.name)+' 最低利润率"> %<span class="gl">赊账最高（RM）</span><input id="c'+i+'" inputmode="decimal" value="'+(cm/100).toFixed(2)+'" aria-label="'+esc(a.name)+' 赊账最高"><button type="button" class="sv" data-save="'+i+'">保存</button></div><div class="ex" id="rx'+i+'">'+esc(exAt(a.rate))+(nc?' · 代理单独改价 '+nc+' 款':'')+'</div><div class="ex crline">'+creditTxt(cr)+'</div></td></tr>'}).join('');
  var SL=staff();
  var srows=SL.map(function(s,i){return '<tr><td>'+esc(s.name)+'（尾号 '+esc(s.tail)+'）</td><td><b>'+esc(s.acct)+'</b></td><td><button type="button" class="rm" data-sdel="'+i+'">删除</button></td></tr>'}).join('');
  app.innerHTML=head+'<main class="mw"><div class="oc"><div class="h"><b>代理名单</b><span class="t">只有总盘可以开下线。本钱价 = 总盘 × 1.25，不能改。代理可在产品卡上自己改建议售价，不能低于最低利润。每个代理可赊账，最高默认 RM10,000，可单独改。</span></div><table class="agt"><tr><th>代理</th><th>自己订货登录</th><th>顾客下单链接</th><th>默认利润率 / 最低利润 / 赊账最高（改完点保存）</th></tr>'+rows+'</table>'+
  '<div class="af"><h3>新增代理（开下线）</h3><div class="row"><div><label for="nn">名字</label><input id="nn" placeholder="例：阿伟" autocomplete="off"></div><div><label for="nt">电话尾号（后四位）</label><input id="nt" inputmode="numeric" maxlength="4" placeholder="例：0901" autocomplete="off"></div><div><label for="nr">默认利润率（%）</label><input id="nr" type="number" min="0" max="'+RATE_MAX+'" step="0.01" value="40"></div><div><label for="nm">最低利润（%）</label><input id="nm" type="number" min="0" max="100" step="0.01" value="0"></div><div><label for="nc">赊账最高（RM）</label><input id="nc" inputmode="decimal" value="10000"></div></div><div class="pvw" id="np">请填名字和 4 位尾号</div><div class="ex" id="nx">'+esc(exAt(0.4))+' · 赊账最高默认 RM10,000.00</div><button class="btn gd" type="button" id="nadd">开通下线</button></div>'+
  '<div class="af" id="staffbox"><h3>客服秘书</h3><p style="margin:0 0 10px;font-size:13px;color:#7a5a50">只有总盘可以开通。秘书用单独入口 <a href="#/cs">/cs</a> 登录（用户名 = 名字 + 尾号 + s），只能处理订单，看不到开下线和价目表。</p>'+
  (SL.length?'<table><tr><th>秘书</th><th>登录</th><th></th></tr>'+srows+'</table>':'<p class="muted">还没有秘书。</p>')+
  '<div class="row"><div><label for="sn">名字</label><input id="sn" placeholder="例：小芳" autocomplete="off"></div><div><label for="snt">电话尾号（后四位）</label><input id="snt" inputmode="numeric" maxlength="4" placeholder="例：0001" autocomplete="off"></div></div><div class="pvw" id="spv">请填名字和 4 位尾号</div><button class="btn gd" type="button" id="sadd">开通秘书</button></div>'+
  '<p class="ms-note">用户名 = 名字 + 电话尾号 + a（自己订货）；顾客店链接 /a/名字+尾号（不带 a）；秘书 = 名字 + 尾号 + s，入口 /cs。新开的下线和秘书保存在这台浏览器里，重置后代理回到阿伟和 abc，秘书回到小芳0001s。</p></div>'+masterFoot('agents')+'</main>';
  ['nn','nt','nr'].forEach(function(id){document.getElementById(id).addEventListener('input',preview)});
  L.forEach(function(a,i){var inp=document.getElementById('r'+i);inp.addEventListener('input',function(){var r=parseRate(inp.value,RATE_MAX);document.getElementById('rx'+i).textContent=r==null?'利润率请填 0–'+RATE_MAX+' 的数字':exAt(r)})});
  [].forEach.call(app.querySelectorAll('[data-save]'),function(b){b.onclick=function(){var i=+b.getAttribute('data-save'),r=parseRate(document.getElementById('r'+i).value,RATE_MAX),mn=parseRate(document.getElementById('m'+i).value,100),cm=parseCredit(document.getElementById('c'+i).value);if(r==null){toast('默认利润率请填 0 到 '+RATE_MAX+' 的数字');return}if(mn==null){toast('最低利润请填 0 到 100');return}if(r<mn){toast('默认利润率不能低于最低利润');return}if(cm==null){toast('赊账最高请填 0 到 RM1,000,000 的金额');return}var all=agents();all[i].rate=r;all[i].rateMin=mn;all[i].creditMax=cm;saveAgents(all);toast(all[i].name+'：默认 '+ratePct(r)+'% · 最低 '+ratePct(mn)+'% · 赊账最高 '+rm(cm));masterAgents(head,D)}});
  document.getElementById('nadd').onclick=function(){
    var n=document.getElementById('nn').value.trim(),tl=tail4(document.getElementById('nt').value),r=parseRate(document.getElementById('nr').value,RATE_MAX),mn=parseRate(document.getElementById('nm').value,100),cm=parseCredit(document.getElementById('nc').value);
    if(!n){toast('请填名字');return}
    if(tl.length!==4){toast('电话尾号要 4 位数字');return}
    if(r==null){toast('默认利润率请填 0 到 '+RATE_MAX+' 的数字');return}
    if(mn==null){toast('最低利润请填 0 到 100');return}
    if(r<mn){toast('默认利润率不能低于最低利润');return}
    if(cm==null){toast('赊账最高请填 0 到 RM1,000,000 的金额');return}
    var acct=n+tl+'a',shop=n+tl,all=agents();
    if(all.some(function(a){return a.acct===acct||a.shop===shop})){toast('这个登录或店铺已经存在');return}
    all.push({name:n,tail:tl,acct:acct,shop:shop,rate:r,rateMin:mn,creditMax:cm,sell:{}});saveAgents(all);
    toast('已开通：'+acct+'，顾客店 /a/'+shop+'，默认利润率 '+ratePct(r)+'%，赊账最高 '+rm(cm));masterAgents(head,D);
  };
  function sprev(){var n=document.getElementById('sn').value.trim(),tl=tail4(document.getElementById('snt').value);document.getElementById('spv').innerHTML=n&&tl.length===4?('将开通秘书登录 <b>'+esc(n+tl+'s')+'</b>，入口 /cs'):'请填名字和 4 位尾号'}
  ['sn','snt'].forEach(function(id){document.getElementById(id).addEventListener('input',sprev)});
  document.getElementById('sadd').onclick=function(){
    var n=document.getElementById('sn').value.trim(),tl=tail4(document.getElementById('snt').value);
    if(!n){toast('请填名字');return}
    if(tl.length!==4){toast('电话尾号要 4 位数字');return}
    var acct=n+tl+'s',all=staff();
    if(acctTaken(acct)||all.some(function(s){return s.acct===acct})){toast('这个登录已经存在');return}
    all.push({name:n,tail:tl,acct:acct});saveStaff(all);
    toast('已开通秘书：'+acct+'，入口 /cs');masterAgents(head,D);
  };
  [].forEach.call(app.querySelectorAll('[data-sdel]'),function(b){b.onclick=function(){var i=+b.getAttribute('data-sdel'),all=staff(),s=all[i];if(!s||!confirm('删除秘书 '+s.acct+'？'))return;all.splice(i,1);saveStaff(all);toast('已删除 '+s.acct);masterAgents(head,D)}});
}
function moF(){var f=get('mof2',null);if(!f||typeof f!=='object')f={};if(['all','open','done'].indexOf(f.ship)<0)f.ship='all';if(['all','unpaid','paid'].indexOf(f.pay)<0)f.pay='all';return f}
function orderKey(o){if(o.agentAcct)return o.agentAcct;var a=o.shop&&agentByShop(o.shop);return a?a.acct:'?'+(o.shop||'未记代理')}
function acctTotals(t){
  return '<div class="am"><span>进价（应收）<b>'+rmSum(t.a,t.missA)+'</b></span><span>卖价<b>'+rmSum(t.s,t.missS)+'</b></span><span class="k">抽成<b>'+rmSum(t.k,t.missK)+'</b></span><span>已收<b>'+rm(t.paid)+'</b></span><span class="w">要收余额<b>'+rmSum(t.bal,t.missB)+'</b></span></div>';
}
function isPacked(o){return !!(o&&o.packed)}
function acctOpen(g){return (g.all||[]).some(function(o){return o.status!==ST2})}
function acctUnpaid(g,D){var t=totalsOf(g.all||[],D);return !!(t.missB||t.bal>0)}
function acctOkShip(g,ship){if(ship==='all')return true;var open=acctOpen(g);return ship==='open'?open:!open}
function acctOkPay(g,pay,D){if(pay==='all')return true;var u=acctUnpaid(g,D);return pay==='unpaid'?u:!u}
function acctCard(g,D,base){
  var L=g.all||[],t=totalsOf(L,D),A=agentByAcct(g.acct),isP=function(o){return isPaid(o,D)};
  var so=L.filter(function(o){return o.status!==ST2}).length,sd=L.length-so,pp=L.filter(isP).length,pt=L.filter(function(o){return !isP(o)&&settleOf(o,D).paid>0}).length,pu=L.length-pp-pt,np=L.filter(pendingCust).length,nk=L.filter(function(o){return !isPacked(o)}).length;
  var cr=creditOf(A||{acct:g.acct},D);
  return '<a class="acct" href="'+base+'/'+encodeURIComponent(g.acct)+'"><div class="an"><b>'+esc(A?A.name:g.name)+'</b><small>'+esc(g.acct)+(g.gone?' · 已不在名单':'')+'</small><span class="ac">'+t.n+' 单 ›</span></div>'+acctTotals(t)+
    '<p class="crline">赊账 '+creditTxt(cr)+'</p>'+
    (L.length?'<div class="cn"><span class="'+(so?'x':'')+'">未出货 '+so+'</span><span>已出货 '+sd+'</span><span class="'+(pu?'x':'')+'">未付款 '+pu+'</span>'+(pt?'<span class="x">部分付款 '+pt+'</span>':'')+'<span>已付款 '+pp+'</span>'+(nk?'<span class="x">待备货 '+nk+'</span>':'')+(np?'<span class="x">待代理对 '+np+'</span>':'')+'</div>':'<div class="cn"><span>还没有订单</span></div>')+'</a>';
}
function masterOrders(D,head,asStaff,sel){
  var base=asStaff?'#/cs':'#/master/orders',f=moF(),all=orders().slice().reverse();
  function okShip(o){return f.ship==='all'||(f.ship==='done'?o.status===ST2:o.status!==ST2)}
  function okPay(o){return f.pay==='all'||(f.pay==='paid'?isPaid(o,D):!isPaid(o,D))}
  var by={},keys=[];
  agents().forEach(function(a){by[a.acct]={name:a.name,acct:a.acct,list:[],all:[]};keys.push(a.acct)});
  all.forEach(function(o){var k=orderKey(o);if(!by[k]){by[k]={name:o.shop||k.replace(/^\?/,''),acct:k,gone:1,list:[],all:[]};keys.push(k)}by[k].all.push(o);if(okShip(o)&&okPay(o))by[k].list.push(o)});
  var scope=sel&&by[sel]?by[sel].all:all;
  function cnt(fn){return scope.filter(fn).length}
  var isP=function(o){return isPaid(o,D)};
  var nShipD=cnt(function(o){return o.status===ST2&&okPay(o)}),nShipO=cnt(function(o){return o.status!==ST2&&okPay(o)}),nShipA=cnt(okPay);
  var nPayP=cnt(function(o){return isP(o)&&okShip(o)}),nPayU=cnt(function(o){return !isP(o)&&okShip(o)}),nPayA=cnt(okShip);
  function fb(dim,id,label,n){return '<button type="button" data-fd="'+dim+'" data-fv="'+id+'" class="'+(f[dim]===id?'on':'')+'">'+label+' '+n+'</button>'}
  var bar='<div class="fl2"><div class="fg"><i>出货</i>'+fb('ship','all','全部',nShipA)+fb('ship','open','未出货',nShipO)+fb('ship','done','已出货',nShipD)+'</div>'+
    '<div class="fg"><i>付款</i>'+fb('pay','all','全部',nPayA)+fb('pay','unpaid','未付款',nPayU)+fb('pay','paid','已付款',nPayP)+'</div></div>';
  var h;
  if(sel){
    var g=by[sel],A=agentByAcct(sel);
    if(!g){app.innerHTML=head+'<main class="mw"><a class="back" href="'+base+'">‹ 代理户口</a><div class="oc empty">找不到这个代理户口。</div></main>';return}
    var tAll=totalsOf(g.all,D),t=asStaff?tAll:totalsOf(g.list,D),cr=creditOf(A||{acct:sel},D);
    var headAcct='<a class="back" href="'+base+'">‹ 代理户口</a><div class="acct top"><div class="an"><b>'+esc(A?A.name:g.name)+'</b><small>'+esc(g.acct)+(g.gone?' · 已不在代理名单':'')+'</small><span class="ac">'+tAll.n+' 单</span></div>'+acctTotals(tAll)+creditBox(cr,true)+'</div>'+bar;
    if(asStaff){
      var cu=g.list.filter(isCust),own=g.list.filter(function(o){return !isCust(o)});
      function grp(title,sub,L,empty){return '<div class="acch"><h2>'+title+'</h2><span>'+sub+'</span></div>'+(L.length?L.map(function(o){return orderCard(o,'staff',D)}).join(''):'<div class="oc empty">'+empty+'</div>')}
      h=headAcct+grp('顾客散单 · 备货','看货品和收货资料，备货后可安排出货。对单由代理做',cu,'这个筛选下没有散单。')+
        grp('自己订货','确定货、备货、安排出货',own,'这个筛选下没有自己订货。');
    }else{
      h=headAcct+(g.list.length?g.list.map(function(o){return orderCard(o,'master',D)}).join(''):'<div class="oc empty">这个筛选下，这个代理没有订单。</div>');
    }
  }else if(asStaff){
    var pool=keys.filter(function(k){return by[k].all.length});
    function acnt(ship,pay){return pool.filter(function(k){return acctOkShip(by[k],ship)&&acctOkPay(by[k],pay,D)}).length}
    function afb(dim,id,label,n){return '<button type="button" data-fd="'+dim+'" data-fv="'+id+'" class="'+(f[dim]===id?'on':'')+'">'+label+' '+n+'</button>'}
    bar='<div class="fl2"><div class="fg"><i>出货</i>'+afb('ship','all','全部',acnt('all',f.pay))+afb('ship','open','未出货',acnt('open',f.pay))+afb('ship','done','已出货',acnt('done',f.pay))+'</div>'+
      '<div class="fg"><i>付款</i>'+afb('pay','all','全部',acnt(f.ship,'all'))+afb('pay','unpaid','未付款',acnt(f.ship,'unpaid'))+afb('pay','paid','已付款',acnt(f.ship,'paid'))+'</div><span class="n">按代理户口，数字是代理个数</span></div>';
    var show=pool.filter(function(k){return acctOkShip(by[k],f.ship)&&acctOkPay(by[k],f.pay,D)});
    var empty=pool.length?'<div class="oc empty">这个筛选下没有代理户口。</div>':'<div class="oc empty">还没有代理下单。代理自己订货或顾客下单后，会按户口出现在这里。</div>';
    h='<div class="acch"><h2>代理户口</h2><span>外面只看统一钱数，点进去看个别散单并备货</span></div>'+bar+
      (show.length?show.map(function(k){return acctCard(by[k],D,base)}).join(''):empty)+
      (hasDemoOrders(all)?'<p class="ms-note">以上是示例户口，方便看统一钱数和备货，不是真实生意。重置后会重新出现。</p>':'');
  }else{
    var show=keys.filter(function(k){return (f.ship==='all'&&f.pay==='all')||by[k].list.length});
    h='<div class="acch"><h2>代理户口</h2><span>点进去看采购明细</span></div>'+bar+
      (show.length?show.map(function(k){var g=by[k],L=g.list,t=totalsOf(L,D);
        var so=L.filter(function(o){return o.status!==ST2}).length,sd=L.length-so,pp=L.filter(isP).length,pt=L.filter(function(o){return !isP(o)&&settleOf(o,D).paid>0}).length,pu=L.length-pp-pt,np=L.filter(pendingCust).length;
        return '<a class="acct" href="'+base+'/'+encodeURIComponent(k)+'"><div class="an"><b>'+esc(g.name)+'</b><small>'+esc(g.acct)+(g.gone?' · 已不在名单':'')+'</small><span class="ac">'+t.n+' 单 ›</span></div>'+acctTotals(t)+
          (L.length?'<div class="cn"><span class="'+(so?'x':'')+'">未出货 '+so+'</span><span>已出货 '+sd+'</span><span class="'+(pu?'x':'')+'">未付款 '+pu+'</span>'+(pt?'<span class="x">部分付款 '+pt+'</span>':'')+'<span>已付款 '+pp+'</span>'+(np?'<span class="x">待代理对 '+np+'</span>':'')+'</div>':'<div class="cn"><span>还没有订单</span></div>')+'</a>';
      }).join(''):'<div class="oc empty">这个筛选下没有订单。</div>')+
      (hasDemoOrders(all)?'<p class="ms-note">以上是示例订单，方便看确定货和出货，不是真实生意。重置后会重新出现。</p>':'');
  }
  app.innerHTML=head+'<main class="mw">'+h+(asStaff||sel?'':masterFoot('orders'))+'</main>';
  [].forEach.call(app.querySelectorAll('[data-fd]'),function(b){b.onclick=function(){var x=moF();x[b.getAttribute('data-fd')]=b.getAttribute('data-fv');set('mof2',x);route()}});
  [].forEach.call(app.querySelectorAll('[data-st]'),function(b){b.onclick=function(){var all=orders();all.forEach(function(o){if(o.id===b.getAttribute('data-id')){o.status=b.getAttribute('data-st');(o.log=o.log||[]).push({t:tnow(),s:o.status})}});saveOrders(all);toast('已更新：'+b.getAttribute('data-st'));route()}});
  [].forEach.call(app.querySelectorAll('[data-pack]'),function(b){b.onclick=function(){var all=orders();all.forEach(function(o){if(o.id===b.getAttribute('data-pack')&&!o.packed){o.packed=true;(o.log=o.log||[]).push({t:tnow(),s:'已备货'})}});saveOrders(all);toast('已备货');route()}});
  [].forEach.call(app.querySelectorAll('[data-prec]'),function(b){b.onclick=function(){
    var id=b.getAttribute('data-prec'),amt=parseRM(document.getElementById('pa-'+id).value),method=(document.getElementById('pm-'+id).value||'').trim(),note=(document.getElementById('pn-'+id).value||'').trim();
    if(amt==null||amt<=0){toast('请填写收款金额');return}
    if(!method){toast('请选收款方式');return}
    var by=asStaff?((staffSess()||{}).acct||'秘书'):'总盘',all=orders();
    all.forEach(function(o){if(o.id===id){o.pays=paysOf(o).concat([{id:oid('P'),amount:amt,method:method,note:note,t:tnow(),by:by}]);var st=settleOf(o,D);o.paid=!st.missA&&st.paid>=st.a;o.paidAt=o.paid?tnow():(o.paidAt||null);(o.log=o.log||[]).push({t:tnow(),s:'收款 '+rm(amt)+' · '+method})}});
    saveOrders(all);toast('已记收款 '+rm(amt)+'（'+method+'）');route();
  }});
  [].forEach.call(app.querySelectorAll('[data-pdel]'),function(b){b.onclick=function(){
    var id=b.getAttribute('data-pdel'),i=+b.getAttribute('data-pi');if(!confirm('删除这笔收款记录？'))return;
    var all=orders();
    all.forEach(function(o){if(o.id===id){var L=paysOf(o).slice();L.splice(i,1);o.pays=L;var st=settleOf(o,D);o.paid=L.length?(!st.missA&&st.paid>=st.a):false;if(!o.paid)o.paidAt=null;(o.log=o.log||[]).push({t:tnow(),s:'删除收款记录'})}});
    saveOrders(all);toast('已删除收款记录');route();
  }});
  [].forEach.call(app.querySelectorAll('[data-crepay]'),function(b){b.onclick=function(){
    if(!sel)return;
    var amt=parseRM(document.getElementById('ca').value),method=(document.getElementById('cm').value||'').trim(),note=(document.getElementById('cn').value||'').trim();
    if(amt==null||amt<=0){toast('请填写还款金额');return}
    if(!method){toast('请选还款方式');return}
    var by=asStaff?((staffSess()||{}).acct||'秘书'):'总盘',r=repayAcct(sel,amt,method,note,by,D);
    if(r.err){toast(r.err);return}
    toast('已记还款 '+rm(r.amt)+'（分到 '+r.n+' 张单）');route();
  }});
}
/* 订单卡：view = master | agent | cust ；D 为该角色的数据 */
function lineVals(o,it,D){ // 统一算出 进价/卖价/抽成（顾客单只存卖价，进价与抽成从代理/总盘数据查）
  var q=it.qty,x=D&&D.by[it.sku],u=it.mode==='unit';
  var s=it.s!=null?it.s:(x?(u?x.su:x.s):null);
  var a=it.a!=null?it.a:(x&&x.a!=null?(u?x.au:x.a):null);
  return{s:s==null?null:s*q,a:a==null?null:a*q,k:(a==null||s==null)?null:(s-a)*q};
}
function orderTotals(o,D){var t={qty:0,s:0,a:0,k:0};o.items.forEach(function(it){var v=lineVals(o,it,D);t.qty+=it.qty;t.s+=v.s||0;t.a+=v.a||0;t.k+=v.k||0});return t}
function donePop(id,wish){var old=document.querySelector('.mdl.okp');if(old)old.remove();var m=document.createElement('div');m.className='mdl okp';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-labelledby','okt');m.innerHTML='<div><div class="ok">🎉</div><h3 id="okt">下单已成</h3><div class="oid"><i>单号</i><b>'+esc(id)+'</b></div><p class="pr">为了您的保障，请截图保留单号。</p><p class="wish">'+esc(wish)+'</p><button class="btn gd" type="button">我已截图</button></div>';m.querySelector('button').onclick=function(){m.remove()};document.body.appendChild(m);m.querySelector('button').focus()}
function shipTxt(c){if(c.ship==='agent')return '<b class="shm">🛵 代理送货</b>';if(c.ship==='post')return '<b class="shm">📮 邮寄</b> · '+esc(c.addr);return esc(c.addr||'')}
function shipNote(paid){return '<span class="'+(paid?'muted':'shipnote')+'" style="font-size:12.5px">'+(paid?'已安排出货':'已安排出货 · 尚未收款（赊账）')+'</span>'}
function orderCard(o,view,D){
  var src=o.kind==='agent'?'<span class="kind">自己订货</span>':'<span class="kind">顾客下单</span>';
  var who=o.kind==='agent'?'代理 '+esc(o.agentAcct):'顾客 '+esc(o.cust.user)+' · 经代理 '+esc(o.shop);
  var t=settleOf(o,D),showCost=view!=='cust',paid=isPaid(o,D),partial=!paid&&t.paid>0;
  var paySt=view==='cust'?'':('<span class="st '+(paid?'s2':'sp')+'">'+(paid?'已付款':(partial?'部分付款':'未付款'))+'</span>');
  var chkSt=(isCust(o)&&view!=='cust')?'<span class="st '+(agentChecked(o)?'s2':'s0')+'">'+chkLabel(o)+'</span>':'';
  var packSt=(view!=='cust'&&isPacked(o))?'<span class="st s2">已备货</span>':'';
  var shipSt=view==='cust'?('<span class="st '+(o.status===ST2?'s2':agentChecked(o)?'s1':'s0')+'">'+esc(custSt(o))+'</span>'):('<span class="st '+stc(o.status)+'">'+esc(shipLabel(o))+'</span>');
  var rows=o.items.map(function(it){var v=lineVals(o,it,D);return '<tr><td>'+it.sku+' '+esc(it.name)+'<br><small class="muted">'+modeTxt(it,isCust(o)?'cust':view)+'</small></td><td class="r">'+it.qty+'</td>'+(showCost?'<td class="r">'+rmx(v.a)+'</td>':'')+'<td class="r">'+rmx(v.s)+'</td>'+(showCost?'<td class="r">'+rmx(v.k)+'</td>':'')+'</tr>'}).join('');
  var h='<div class="oc"><div class="h"><b class="ono"><i>单号</i> '+esc(orderNo(o))+'</b>'+(view==='cust'?'':src)+shipSt+chkSt+packSt+paySt+'<span class="t">'+tfmt(o.time)+'</span></div>';
  if(view!=='cust')h+='<div class="t muted" style="font-size:12.5px">'+who+'</div>';
  if(o.kind==='cust'&&view!=='agent-lite')h+='<div class="note">📦 收货：<b>'+esc(o.cust.name)+'</b> · '+esc(o.cust.phone)+'<br>'+shipTxt(o.cust)+(o.cust.memo?'<br>备注：'+esc(o.cust.memo):'')+'</div>';
  if(o.kind==='agent'&&o.memo)h+='<div class="note">备注：'+esc(o.memo)+'</div>';
  h+='<table><tr><th>产品</th><th class="r">数量</th>'+(showCost?'<th class="r">进价</th>':'')+'<th class="r">卖价</th>'+(showCost?'<th class="r">抽成</th>':'')+'</tr>'+rows+'</table>';
  h+='<div class="sum"><span>数量 <b>'+t.qty+'</b></span>'+(showCost?'<span>进价 <b>'+rmSum(t.a,t.missA)+'</b></span>':'')+'<span>'+(view==='cust'?'订单金额':'卖价')+' <b style="color:#9b1c2c">'+rmSum(t.s,t.missS)+'</b></span>'+(showCost?'<span>抽成 <b style="color:#1b7a3a">'+rmSum(t.k,t.missK)+'</b></span><span>已交 <b>'+rm(t.paid)+'</b></span><span>要收余额 <b style="color:#875a16">'+rmx(t.bal)+'</b></span>':'')+'</div>';
  if(view==='master'||view==='staff'){
    var ops='';
    if(!isPacked(o))ops+='<button type="button" data-pack="'+o.id+'">📦 备货</button>';
    if(!isCust(o)&&o.status!==ST1&&o.status!==ST2)ops+='<button type="button" data-st="'+ST1+'" data-id="'+o.id+'">✓ 确定货</button>';
    if(o.status!==ST2)ops+='<button type="button" class="o" data-st="'+ST2+'" data-id="'+o.id+'">🚚 安排出货</button>';
    else ops+=shipNote(paid);
    h+='<div class="ops">'+ops+'</div>';
    if(view==='master')h+=payBox(o,t,true);
  }
  if(view==='agent'){
    if(isCust(o))h+='<div class="ops">'+(agentChecked(o)?'':'<button type="button" data-achk="'+o.id+'">✓ 对单</button>')+(o.status!==ST2?'<button type="button" class="o" data-st="'+ST2+'" data-id="'+o.id+'">🚚 安排出货</button>':shipNote(paid))+'</div>';
    h+=payBox(o,t,false);
  }
  if(view==='cust')h+='<p class="tip">'+custTip(o)+'</p>';
  return h+'</div>';
}

/* ======================= 共用：店面框架 ======================= */
function topbar(o){ // o: {home,title,sub,cats,base,q,cur,simple}
  return '<header class="top'+(o.simple?' simple':'')+'"><div class="in"><a class="lg" href="'+o.base+'">'+LOGO+'<span class="wm"><b>'+esc(o.title)+'</b><small>'+esc(o.sub)+'</small></span></a>'+
  (o.simple?'':'<form class="sb" role="search" id="sf"><label class="sr" for="q">搜索产品</label><input id="q" type="search" value="'+esc(o.q||'')+'" placeholder="搜索名称或编号，如 HB001、红炮" autocomplete="off"><button type="submit">搜索</button></form>'+
  '<nav class="tabs" aria-label="产品分类"><a href="'+o.base+'" class="'+(!o.cur?'on':'')+'">全部</a>'+o.cats.map(function(c){return '<a href="'+o.base+'/c/'+c.id+'" class="'+(o.cur===c.id?'on':'')+'">'+esc(c.name)+'</a>'}).join('')+'</nav>')+
  '</div></header>';
}
function bindSearch(base){var f=document.getElementById('sf');if(f)f.onsubmit=function(e){e.preventDefault();var q=document.getElementById('q').value.trim();location.hash=base.replace(/^#/,'#')+(q?'?q='+encodeURIComponent(q):'')}}
function liveCats(D){var has={};D.items.forEach(function(x){has[x.cat]=1});return D.cats.filter(function(c){return has[c.id]})}
function img(x,cls){return x.th||x.img?'<img src="'+(cls==='big'?(x.img||x.th):(x.th||x.img))+'" loading="lazy" alt="'+esc(x.name)+' '+esc(x.en)+'">':'<span class="ph">'+PHSVG+'<b>'+esc(x.name)+'</b><i>图片待补</i></span>'}
function filterItems(D,cat,q){q=(q||'').toLowerCase();return D.items.filter(function(x){return(!cat||x.cat===cat)&&(!q||(x.sku+' '+x.name+' '+x.en).toLowerCase().indexOf(q)>=0)})}
function bottomNav(items){return '<nav class="bn'+(items.length===5?' n5':'')+'">'+items.map(function(i){return '<a href="'+i.h+'" class="'+(i.on?'on':'')+'">'+i.ic+'<span>'+i.t+'</span>'+(i.b?'<span class="bdg show">'+i.b+'</span>':'')+'</a>'}).join('')+'</nav>'}
var IC={home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>',ord:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>',chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H8l-4 4z"/></svg>'};
function cartCount(c){return c.reduce(function(s,l){return s+l.qty},0)}
function addTo(key,sku,mode,qty){var c=get(key,[]),l=c.filter(function(l){return l.sku===sku&&l.mode===mode})[0];if(l)l.qty+=qty;else c.push({sku:sku,mode:mode,qty:qty});set(key,c);return c}
function qtyBox(id,v){return '<div class="qty"><button type="button" data-qs="-1" data-for="'+id+'" aria-label="减少">−</button><input id="'+id+'" type="number" min="1" value="'+(v||1)+'" inputmode="numeric" aria-label="数量"><button type="button" data-qs="1" data-for="'+id+'" aria-label="增加">+</button></div>'}
function bindQty(root,cb){[].forEach.call(root.querySelectorAll('[data-qs]'),function(b){b.onclick=function(){var i=document.getElementById(b.getAttribute('data-for'));i.value=Math.max(1,(parseInt(i.value,10)||1)+parseInt(b.getAttribute('data-qs'),10));if(cb)cb(i)}});if(cb)[].forEach.call(root.querySelectorAll('.qty input'),function(i){i.onchange=function(){i.value=Math.max(1,parseInt(i.value,10)||1);cb(i)}})}
function videoBlock(x){if(!x.v)return '';var v=x.vo==='horizontal'?'v169':'v916';return '<section class="vid"><h2>视频介绍 <small>'+x.sku+'</small></h2><div class="vf '+v+'"><iframe src="'+esc(x.v)+'?rel=0&amp;modestbranding=1&amp;playsinline=1" title="'+esc(x.name)+' 视频" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'+(x.vt?'<p class="vs">'+esc(x.vt)+'</p>':'')+'</section>'}
function specTable(x,catName){return '<table class="sp"><tr><th>编号</th><td>'+x.sku+'</td></tr><tr><th>中文名</th><td>'+esc(x.name)+'</td></tr><tr><th>英文名</th><td lang="en">'+esc(x.en)+'</td></tr><tr><th>包装</th><td>'+esc(x.pk)+'</td></tr><tr><th>一盒件数</th><td>'+(x.n?x.n+' 件':'<span class="nil">待确认（包装不是 N/1，暂无散装价）</span>')+'</td></tr><tr><th>分类</th><td>'+esc(catName)+'</td></tr></table>'}
function catName(D,id){var c=D.cats.filter(function(c){return c.id===id})[0];return c?c.name:''}

/* ======================= ① 代理自己订货 ======================= */
function staffLogin(){
  document.body.className='nobn';
  app.innerHTML='<div class="lc"><h1>③ 客服（秘书）· 登录</h1><p>用户名 = 名字 + 电话尾号 + <b>s</b>（例：<b>小芳0001s</b>）。<br>由总盘开通。登录后按代理户口处理：外面看统一钱数，点进去看个别散单并备货。看不到开下线、改抽成和价目表。顾客散单由该代理对。</p>'+
  '<label for="snl">名字</label><input id="snl" placeholder="例：小芳"><label for="stl">电话尾号（后四位）</label><input id="stl" inputmode="numeric" maxlength="4" placeholder="例：0001">'+
  '<div class="un">用户名：<b id="su">—</b></div><button class="btn gd" id="sgo" type="button">登录</button><button class="btn ol" id="sdemo" type="button">进入示例：小芳0001s</button>'+
  '<p class="or">草稿不设密码，只为看流程。这是秘书专用入口，不是总盘，也不是代理。</p></div>';
  function u(){var n=document.getElementById('snl').value.trim(),t=tail4(document.getElementById('stl').value);document.getElementById('su').textContent=n&&t.length===4?n+t+'s':'—';return n&&t.length===4?n+t+'s':''}
  document.getElementById('snl').oninput=u;document.getElementById('stl').oninput=u;
  function go(acct){var s=staffByAcct(acct);if(!s){toast('总盘还没开通这个秘书账号');return}set('sess.staff',{acct:acct,name:s.name,t:tnow()});location.hash='#/cs';route()}
  document.getElementById('sgo').onclick=function(){var x=u();if(!x){toast('请填名字和电话后四位');return}go(x)};
  document.getElementById('sdemo').onclick=function(){go('小芳0001s')};
}
function staffApp(sel){
  var ss=staffSess(),S=ss&&staffByAcct(ss.acct);
  if(!S){if(ss)del('sess.staff');return staffLogin()}
  document.body.className='mst nobn';
  load('master').then(function(D){
    var head='<header class="mh"><div class="in"><h1>客服（秘书）<small>'+esc(S.name)+' · '+esc(S.acct)+' · 按代理户口备货、出货、记收款</small></h1><nav><a href="#/cs" class="on">订单</a><a href="#/cs" id="slo" style="font-weight:500">退出</a></nav></div></header>';
    masterOrders(D,head,true,sel);
    var lo=document.getElementById('slo');if(lo)lo.onclick=function(e){e.preventDefault();del('sess.staff');toast('已退出');location.hash='#/cs';route()};
  });
}
function agentSess(){return get('sess.agent',null)}
function agent(p,q){
  var s=agentSess();
  if(!s||p[0]==='login')return agentLogin();
  var A=agentByAcct(s.acct);if(!A){del('sess.agent');return agentLogin()}
  if(p[0]==='rate'){location.replace('#/agent');return}
  if(p[0]==='account'){location.replace('#/agent/orders');return}
  load('agent').then(function(D0){var D=withRate(D0,A);AG={A:A,D:D};
    var base='#/agent',ck='cart.agent.'+A.acct,cats=liveCats(D),cur=p[0]==='c'?p[1]:'';
    var page=p[0]||'';
    var html=topbar({base:base,title:'代理订货 · '+A.name,sub:A.acct,cats:cats,cur:cur,q:q.get('q'),simple:page==='link'||page==='orders'});
    if(page!=='link')html+='<div class="ann" role="note"><div class="in"><span>向总盘下单，客服确认后出货</span><span>价格：本钱价 / 建议售价 / 利润</span><span><a href="#/agent/link" style="color:#9b1c2c">顾客链接 /a/'+esc(A.shop)+'</a></span><span><a href="#" id="lo" style="color:#7a5a50">退出</a></span></div></div>';
    html+='<main class="wrap">';
    if(page==='p')html+=agentProduct(D,A,p[1],base);
    else if(page==='cart')html+=agentCart(D,A,ck);
    else if(page==='orders')html+=agentOrders(D,A,q.get('f')||'all');
    else if(page==='link')html+=agentLink(A);
    else if(page==='done')html+='<div class="cp thx"><div class="e">✅</div><h1>已提交给总盘（客服）</h1><p>单号 <b>'+esc(p[1])+'</b><br>状态：<span class="st s0">'+ST0A+'</span><br>客服人工确认有货后安排出货。</p><p><a class="btn gd" href="#/agent/orders">看账户详情</a> <a class="btn ol" href="#/agent">继续订货</a></p></div>';
    else html+=agentHome(D,A,cur,q.get('q'));
    var nPend=orders().filter(function(o){return (o.shop===A.shop||o.agentAcct===A.acct)&&pendingCust(o)}).length;
    html+='</main>'+bottomNav([{h:base,t:'订货',ic:IC.home,on:!page||page==='c'||page==='p'},{h:base+'/cart',t:'订货车',ic:IC.cart,on:page==='cart',b:cartCount(get(ck,[]))||''},{h:base+'/orders',t:'账户详情',ic:IC.ord,on:page==='orders'||page==='account',b:nPend||''},{h:base+'/link',t:'顾客链接',ic:IC.link,on:page==='link'}]);
    app.innerHTML=html;bindSearch(base);bindQty(app,page==='cart'?function(i){var c=get(ck,[]);c[+i.getAttribute('data-i')].qty=+i.value;set(ck,c);route()}:null);
    var lo=document.getElementById('lo');if(lo)lo.onclick=function(e){e.preventDefault();del('sess.agent');route()};
    [].forEach.call(app.querySelectorAll('[data-add]'),function(b){b.onclick=function(){var qi=b.getAttribute('data-qf'),qq=qi?Math.max(1,parseInt(document.getElementById(qi).value,10)||1):1;var mode=b.getAttribute('data-mode')||(app.querySelector('.seg .on')||{}).value||'box';addTo(ck,b.getAttribute('data-add'),mode,qq);toast('已加入 ×'+qq);route()}});
    [].forEach.call(app.querySelectorAll('.seg button'),function(b){b.onclick=function(){if(b.disabled)return;[].forEach.call(app.querySelectorAll('.seg button'),function(x){x.classList.remove('on')});b.classList.add('on')}});
    [].forEach.call(app.querySelectorAll('[data-rm]'),function(b){b.onclick=function(){var c=get(ck,[]);c.splice(+b.getAttribute('data-rm'),1);set(ck,c);route()}});
    var sub=document.getElementById('submit');if(sub)sub.onclick=function(){var c=get(ck,[]);if(!c.length)return;var items=c.map(function(l){var x=D.by[l.sku],u=l.mode==='unit';return{sku:l.sku,name:x.name,pk:x.pk,mode:l.mode,qty:l.qty,a:u?x.au:x.a,s:u?x.su:x.s}});var deny=creditDeny(A,D,items,D);if(deny){toast(deny);return}var o={id:oid('A'),kind:'agent',agentAcct:A.acct,shop:A.shop,time:tnow(),status:ST0A,paid:false,memo:document.getElementById('memo').value.trim(),items:items};var all=orders();all.push(o);saveOrders(all);del(ck);location.hash='#/agent/done/'+o.id;donePop(o.id,'祝生意兴隆，大吉大利！')};
    bindRateBar(A);
    [].forEach.call(app.querySelectorAll('[data-ap]'),function(b){b.onclick=function(){set('ag.period',b.getAttribute('data-ap'));route()}});
    [].forEach.call(app.querySelectorAll('[data-achk]'),function(b){b.onclick=function(){var all=orders();all.forEach(function(o){if(o.id===b.getAttribute('data-achk')&&isCust(o)&&!o.agentChk){o.agentChk=true;(o.log=o.log||[]).push({t:tnow(),s:'代理对单'})}});saveOrders(all);toast('已对单');route()}});
    [].forEach.call(app.querySelectorAll('[data-st]'),function(b){b.onclick=function(){var all=orders();all.forEach(function(o){if(o.id===b.getAttribute('data-id')&&isCust(o)){o.status=b.getAttribute('data-st');(o.log=o.log||[]).push({t:tnow(),s:o.status})}});saveOrders(all);toast('已更新：'+b.getAttribute('data-st'));route()}});
    var cp=document.getElementById('cpl');if(cp)cp.onclick=function(){var t=document.getElementById('lkf').textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('链接已复制')},function(){toast('请长按复制')})};
  });
}
function agentLogin(){
  document.body.className='nobn';
  app.innerHTML='<div class="lc"><h1>① 代理自己订货 · 登录</h1><p>用户名 = 名字 + 电话尾号 + <b>a</b>（例：<b>阿伟0901a</b>）。<br>顾客在顾客店登录，须填姓名和完整电话。</p>'+
  '<label for="an">名字</label><input id="an" placeholder="例：阿伟"><label for="at">电话尾号（后四位）</label><input id="at" inputmode="numeric" maxlength="4" placeholder="例：0901">'+
  '<div class="un">用户名：<b id="au">—</b></div><button class="btn gd" id="ago" type="button">登录</button><button class="btn ol" id="ademo" type="button">进入示例：阿伟0901a</button><button class="btn ol" id="ademo2" type="button">进入：abc1234a</button>'+
  '<p class="or">草稿不设密码；正式版需要时再加密码。开下线只由总盘做。</p><p class="or"><a href="#/a/阿伟0901" style="color:#9b1c2c">我是顾客 → ② 顾客下单链接</a></p></div>';
  function u(){var n=document.getElementById('an').value.trim(),t=tail4(document.getElementById('at').value);document.getElementById('au').textContent=n&&t.length===4?n+t+'a':'—';return n&&t.length===4?n+t+'a':''}
  document.getElementById('an').oninput=u;document.getElementById('at').oninput=u;
  function go(acct){var a=agentByAcct(acct);if(!a){toast('总盘还没开通这个下线');return}set('sess.agent',{acct:acct,t:tnow()});location.hash='#/agent';route()}
  document.getElementById('ago').onclick=function(){var x=u();if(!x){toast('请填名字和电话后四位');return}go(x)};
  document.getElementById('ademo').onclick=function(){go(DEMO_AGENT.acct)};
  document.getElementById('ademo2').onclick=function(){go(AGENT_ABC.acct)};
}
function seBtn(x,m,mk){var u=m==='unit',v=u?x.su:x.s,c=u?x.cu:x.cs;return '<button type="button" class="se" data-se="'+x.sku+'" data-m="'+m+'" aria-label="改 '+x.sku+(u?' 散装':' 整箱')+' 建议售价">'+rm(v)+'</button>'+(mk&&c?'<em class="chg">已改</em>':'')}
function seWrap(x,m,mk){return '<span class="sew" data-sw="'+x.sku+'|'+m+'"'+(mk?' data-mk="1"':'')+'>'+seBtn(x,m,mk)+'</span>'}
function chgMk(x,m){var c=m==='unit'?x.cu:x.cs;return '<em class="chg" data-ck="'+x.sku+'|'+m+'"'+(c?'':' hidden')+'>已改</em>'}
function agentPrices(x){return '<div class="lbl">整箱 · '+esc(x.pk)+'</div><div class="ap"><div><i>本钱价</i><b>'+rm(x.a)+'</b></div><div class="s"><i>建议售价</i>'+seWrap(x,'box')+'</div><div class="k"><i>利润</i><b data-pk="'+x.sku+'|box">'+rm(x.k)+'</b>'+chgMk(x,'box')+'</div></div>'+(x.n?'<div class="lbl">散装 · 每件（'+x.n+'/盒）</div><div class="ap u"><div><i>本钱价</i><b>'+rm(x.au)+'</b></div><div class="s"><i>建议售价</i>'+seWrap(x,'unit')+'</div><div class="k"><i>利润</i><b data-pk="'+x.sku+'|unit">'+rm(x.ku)+'</b>'+chgMk(x,'unit')+'</div></div>':'<div class="lbl">散装：待确认</div>')}
function rateBar(A){var n=sellCount(A);return '<div class="rbar"><label for="rr">利润率</label><input id="rr" type="number" inputmode="decimal" min="'+ratePct(minOf(A))+'" max="'+RATE_MAX+'" step="0.01" value="'+ratePct(rateOf(A))+'"><span>%</span><button type="button" id="rra">应用于全部</button><small>最低 '+ratePct(minOf(A))+'%'+(n?' · 单独改 '+n+' 款':'')+'</small></div>'}
function bindRateBar(A){var b=document.getElementById('rra'),inp=document.getElementById('rr');if(!b)return;
  inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();b.click()}};
  b.onclick=function(){var r=parseRate(inp.value,RATE_MAX);if(r==null){toast('利润率请填 0 到 '+RATE_MAX);return}var all=agents(),me=null;all.forEach(function(a){if(a.acct===A.acct)me=a});if(!me)return;if(r<me.rateMin){toast('不能低于最低利润 '+ratePct(me.rateMin)+'%');inp.value=ratePct(me.rate);return}
    if(sellCount(me)&&!confirm('全部产品按新利润率重算，单独改过的售价会清掉，确定？'))return;
    me.rate=r;me.sell={};saveAgents(all);toast('全部产品已按利润率 '+ratePct(r)+'% 重算');route()}}
/* 点建议售价直接改（代理产品卡 / 产品页） */
var AG=null;
function seRefresh(sku,m){var x=AG.D.by[sku];[].forEach.call(app.querySelectorAll('[data-sw="'+sku+'|'+m+'"]'),function(w){w.innerHTML=seBtn(x,m,w.hasAttribute('data-mk'))});[].forEach.call(app.querySelectorAll('[data-ck="'+sku+'|'+m+'"]'),function(e){e.hidden=!(m==='unit'?x.cu:x.cs)});[].forEach.call(app.querySelectorAll('[data-pk="'+sku+'|'+m+'"]'),function(e){e.textContent=rm(m==='unit'?x.ku:x.k)})}
function seEdit(b){if(!AG)return;var sku=b.getAttribute('data-se'),m=b.getAttribute('data-m'),u=m==='unit',x=AG.D.by[sku];if(!x)return;var cost=u?x.au:x.a,cur=u?x.su:x.s;if(cost==null)return;
  var w=b.parentNode,inp=document.createElement('input');inp.type='text';inp.className='sei';inp.setAttribute('inputmode','decimal');inp.setAttribute('aria-label','建议售价 RM');inp.value=(cur/100).toFixed(2);w.innerHTML='';w.appendChild(inp);inp.focus();inp.select();
  var done=false;
  function fin(save){if(done)return;done=true;if(!save){seRefresh(sku,m);return}
    var v=parseRM(inp.value);if(v==null||v<=0||!String(inp.value).trim()){toast('请填正确的金额');seRefresh(sku,m);return}
    var all=agents(),me=null;all.forEach(function(a){if(a.acct===AG.A.acct)me=a});if(!me){seRefresh(sku,m);return}
    var f=floorOf(me,cost);if(v<f){toast('不能低于最低售价 '+rm(f));seRefresh(sku,m);return}
    var o=me.sell[sku]||{},key=u?'unit':'box';if(v===defOf(me,cost))delete o[key];else o[key]=v;if(o.box==null&&o.unit==null)delete me.sell[sku];else me.sell[sku]=o;saveAgents(all);
    AG.A.sell=me.sell;AG.A.rate=me.rate;AG.A.rateMin=me.rateMin;var P=priceOf(me,x);x.s=P.s;x.k=P.k;x.su=P.su;x.ku=P.ku;x.cs=P.cs;x.cu=P.cu;
    seRefresh(sku,m);var rb=document.querySelector('.rbar small');if(rb){var n=sellCount(me);rb.textContent='最低 '+ratePct(minOf(me))+'%'+(n?' · 单独改 '+n+' 款':'')}
    toast('建议售价 '+rm(u?P.su:P.s)+' · 利润 '+rm(u?P.ku:P.k))}
  inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();fin(true)}else if(e.key==='Escape'){e.preventDefault();fin(false)}};
  inp.onblur=function(){fin(true)};
  inp.onclick=function(e){e.stopPropagation()}}
app.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-se]');if(!b)return;e.preventDefault();e.stopPropagation();seEdit(b)});
function agentCard(x,base){var qid='aq-'+x.sku;return '<article class="pc"><a class="im" href="'+base+'/p/'+x.sku+'">'+img(x)+'<span class="cd2">'+x.sku+'</span>'+(x.v?'<span class="vb">▶ 视频</span>':'')+'</a><div class="b"><a href="'+base+'/p/'+x.sku+'"><h3>'+esc(x.name)+'</h3></a><div class="en">'+esc(x.en)+'</div>'+agentPrices(x)+'<div class="pcx"><div class="pcq"><span>数量</span>'+qtyBox(qid,1)+'</div><div class="pcb"><button class="add" data-add="'+x.sku+'" data-mode="box" data-qf="'+qid+'">+ 整箱</button>'+(x.n?'<button class="add o" data-add="'+x.sku+'" data-mode="unit" data-qf="'+qid+'">+ 散装</button>':'')+'</div></div></div></article>'}
function agentStats(D,A){var my=orders().filter(function(o){return o.shop===A.shop}),r={own:0,cu:0,a:0,s:0,k:0};my.forEach(function(o){var t=orderTotals(o,D);if(o.kind==='agent'){r.own++;r.a+=t.a}else{r.cu++;r.k+=t.k;r.s+=t.s}});return r}
function agentHome(D,A,cur,q){
  var list=filterItems(D,cur,q),h='';
  if(!cur&&!q){var myAll=orders().filter(function(o){return o.shop===A.shop||o.agentAcct===A.acct}),nPend=myAll.filter(pendingCust).length,st=agentStats(D,A);h+='<section class="hero ag"><span class="tag">① 代理自己订货 · 草稿</span><h1>你好，'+esc(A.name)+'。向总盘订货，<em>本钱价 · 建议售价 · 利润</em> 一目了然</h1><p>利润 = 建议售价 − 本钱价。点建议售价可直接改，顾客店跟着变。</p>'+(nPend?'<p class="pendn"><a href="#/agent/orders">有 '+nPend+' 张散单待对</a></p>':'')+'<div class="kv"><span>自己订货 <b>'+st.own+'</b> 单</span><span>顾客下单 <b>'+st.cu+'</b> 单</span></div><div class="btns" style="margin-top:12px"><a class="btn gd" href="#/agent/orders">交帐给总盘</a><a class="btn ol" href="#/agent/link">② 顾客下单链接</a></div></section>'}
  h+=rateBar(A)+'<section class="sec"><h2>'+(q?'搜索「'+esc(q)+'」':cur?esc(catName(D,cur)):'全部产品')+' <small>'+list.length+' 款'+(cur||q?'':' ')+'</small></h2>';
  return h+(list.length?'<div class="g">'+list.map(function(x){return agentCard(x,'#/agent')}).join('')+'</div>':'<div class="empty">没有找到产品</div>')+'</section>';
}
function neighbors(D,x){var l=D.items.filter(function(i){return i.cat===x.cat}),i=l.indexOf(x);return{prev:l[i-1],next:l[i+1],rel:l.filter(function(i){return i!==x}).slice(0,10)}}
function agentProduct(D,A,sku,base){
  var x=D.by[sku];if(!x)return '<div class="empty">产品不存在。</div>';var nb=neighbors(D,x),cn=catName(D,x.cat);
  return '<nav class="bc"><a href="'+base+'">订货首页</a> › <a href="'+base+'/c/'+x.cat+'">'+esc(cn)+'</a> › <span>'+esc(x.name)+'</span></nav><article class="pd"><div class="im">'+img(x,'big')+'<span class="cd2">'+x.sku+'</span></div><div class="pi"><span class="cd2" style="position:static;display:inline-block">'+x.sku+'</span><h1>'+esc(x.name)+'</h1><p class="en" lang="en">'+esc(x.en)+'</p>'+
  '<table class="pt"><tr><th>单位</th><th>本钱价</th><th>建议售价</th><th>利润</th></tr><tr><td>整箱（'+esc(x.pk)+'）</td><td>'+rm(x.a)+'</td><td class="s">'+seWrap(x,'box',1)+'</td><td class="k" data-pk="'+x.sku+'|box">'+rm(x.k)+'</td></tr>'+(x.n?'<tr><td>散装 / 件</td><td>'+rm(x.au)+'</td><td class="s">'+seWrap(x,'unit',1)+'</td><td class="k" data-pk="'+x.sku+'|unit">'+rm(x.ku)+'</td></tr>':'<tr><td>散装 / 件</td><td colspan="3" class="nil" style="text-align:center">待确认（包装 '+esc(x.pk)+' 不是 N/1）</td></tr>')+'</table>'+
  '<div class="act"><div class="seg"><button type="button" class="on" value="box">整箱</button><button type="button" value="unit"'+(x.n?'':' disabled title="散装待确认"')+'>散装</button></div>'+qtyBox('pq')+'</div><div class="act"><button class="btn gd" type="button" data-add="'+x.sku+'" data-qf="pq">加入订货车</button><a class="btn ol" href="#/a/'+encodeURIComponent(A.shop)+'/p/'+x.sku+'">看顾客看到的这一款</a></div>'+
  '<p class="tip">建议售价就是顾客看到的价，点一下可改；本钱价不能改。</p>'+specTable(x,cn)+'</div></article>'+videoBlock(x)+
  '<nav class="pn"><span>'+(nb.prev?'<a href="'+base+'/p/'+nb.prev.sku+'">‹ '+esc(nb.prev.name)+'</a>':'')+'</span><span>'+(nb.next?'<a href="'+base+'/p/'+nb.next.sku+'">'+esc(nb.next.name)+' ›</a>':'')+'</span></nav>'+
  (nb.rel.length?'<section class="sec"><h2>同类产品 <small>'+esc(cn)+'</small></h2><div class="g">'+nb.rel.map(function(i){return agentCard(i,base)}).join('')+'</div></section>':'');
}
function agentCart(D,A,ck){
  var c=get(ck,[]);if(!c.length)return '<div class="cp"><h1>订货车</h1><div class="empty">订货车是空的。<br><a class="btn gd" href="#/agent" style="margin-top:12px">去选产品</a></div></div>';
  var t={a:0,s:0,k:0,q:0};
  var rows=c.map(function(l,i){var x=D.by[l.sku],u=l.mode==='unit',a=(u?x.au:x.a)*l.qty,s=(u?x.su:x.s)*l.qty;t.a+=a;t.s+=s;t.k+=s-a;t.q+=l.qty;
    return '<div class="cl"><div class="t" style="'+(x.th?'background-image:url('+x.th+')':'')+'"></div><div><div class="n">'+x.sku+' '+esc(x.name)+'<small>'+(u?'散装 / 件 · 本钱价 '+rm(x.au)+' · 建议售价 '+rm(x.su):'整箱（'+esc(x.pk)+'）· 本钱价 '+rm(x.a)+' · 建议售价 '+rm(x.s))+'</small></div><div class="q">'+qtyBox('cq'+i,l.qty).replace('<input ','<input data-i="'+i+'" ')+'<span>本钱 <b>'+rm(a)+'</b></span><span style="color:#1b7a3a">利润 '+rm(s-a)+'</span><button class="rm" data-rm="'+i+'">删除</button></div></div></div>'}).join('');
  return '<div class="cp"><h1>订货车 · 向总盘下单</h1>'+rows+'<div class="tot"><div><i>本钱合计（付总盘）</i><b>'+rm(t.a)+'</b></div><div class="s"><i>建议售价合计</i><b>'+rm(t.s)+'</b></div><div class="k"><i>利润合计</i><b>'+rm(t.k)+'</b></div></div><label for="memo" style="font-size:13px;font-weight:700">备注（选填）</label><textarea id="memo" placeholder="例：取货时间"></textarea><button class="btn gd big" id="submit" type="button" style="margin-top:10px">提交给总盘（客服）· '+t.q+' 件</button><p class="tip">提交后状态「'+ST0A+'」，客服人工确认有货后安排出货。</p></div>';
}
function agentOrders(D,A,f){
  var myAll=orders().filter(function(o){return o.shop===A.shop||o.agentAcct===A.acct}).slice().reverse();
  var period=get('ag.period','all')==='month'?'month':'all',month=thisMonthKL();
  var scoped=myAll.filter(function(o){return period!=='month'||ymKL(o.time)===month});
  var own=myAll.filter(function(o){return o.kind==='agent'}),cu=myAll.filter(function(o){return o.kind==='cust'});
  var pend=myAll.filter(pendingCust);
  var list=(f==='own'?own:f==='cust'?cu:myAll).filter(function(o){return !pendingCust(o)});
  var ra=totalsOf(scoped,D),ro=totalsOf(own.filter(function(o){return period!=='month'||ymKL(o.time)===month}),D),rc=totalsOf(cu.filter(function(o){return period!=='month'||ymKL(o.time)===month}),D),cr=creditOf(A,D);
  function src(lab,r){return '<div class="setrow"><b>'+lab+'</b><span>'+r.n+' 单</span><span class="k">抽成 '+rmSum(r.k,r.missK)+'</span><span class="w">要收 '+rmSum(r.bal,r.missB)+'</span></div>'}
  var bar='<div class="aper"><button type="button" data-ap="all" class="'+(period==='all'?'on':'')+'">全部</button><button type="button" data-ap="month" class="'+(period==='month'?'on':'')+'">本月（'+monthLabel(month)+'）</button><span>含自己订货和顾客散单</span></div>';
  var pendH=pend.length?'<div class="pend"><div class="acch"><h2>待对散单</h2><span>'+pend.length+' 张顾客下单，开了单后由你对</span></div>'+pend.map(function(o){return orderCard(o,'agent',D)}).join('')+'</div>':'';
  return '<div class="cp settle"><h1>账户详情</h1><p class="setsub">交帐给总盘</p>'+bar+askBox(ra)+
  src('自己订货',ro)+src('顾客下单',rc)+
  '<p class="setsub">已交 '+rm(ra.paid)+' · 还欠公司是欠总盘的进价余额，不是抽成。有缺会标明，不把缺当 0。</p>'+
  '<p class="crline">赊账 '+creditTxt(cr)+'</p>'+
  pendH+
  '<div class="act"><div class="seg"><button type="button" onclick="location.hash=\'#/agent/orders?f=all\'" class="'+(f==='all'?'on':'')+'">全部 '+myAll.length+'</button><button type="button" onclick="location.hash=\'#/agent/orders?f=own\'" class="'+(f==='own'?'on':'')+'">自己订货 '+own.length+'</button><button type="button" onclick="location.hash=\'#/agent/orders?f=cust\'" class="'+(f==='cust'?'on':'')+'">顾客下单 '+cu.length+'</button></div></div>'+
  (list.length?list.map(function(o){return orderCard(o,'agent',D)}).join(''):(pend.length?'':'<div class="empty">还没有订单。</div>'))+
  '</div>';
}

function agentLink(A){
  var full=location.href.split('#')[0]+'#/a/'+A.shop;
  return '<div class="cp lkpage"><h1>顾客链接</h1><p>发给顾客。他们只看到卖价，订单记在你名下。</p>'+
  '<div class="lk" id="lkf">'+esc(full)+'</div>'+
  '<div class="act"><button class="btn gd" id="cpl" type="button">复制链接</button><a class="btn ol" href="#/a/'+encodeURIComponent(A.shop)+'">打开店铺</a></div>'+
  '<p class="tip">你自己订货登录是 '+esc(A.acct)+'，不要发给顾客。 <a href="#" id="lo">退出</a></p></div>';
}

/* ======================= ② 顾客下单链接 ======================= */
function custSess(){return get('sess.cust',null)}
function shop(slug,p,q){
  var A=agentByShop(slug);
  if(!A){app.innerHTML='<div class="lc"><h1>找不到这家店</h1><p>链接 /a/'+esc(slug)+' 不是有效的代理店铺。'+(/a$/.test(slug)?'（顾客链接没有 a，例：/a/阿伟0901）':'')+'</p><a class="btn gd" href="#/a/阿伟0901">打开示例店 /a/阿伟0901</a></div>';document.body.className='nobn';return}
  load('agent').then(function(D0){var D=shopOnly(D0,A),costD=withRate(D0,A);
    var cs0=custSess();if(cs0){var gk='cart.shop.'+A.shop+'.guest',g=get(gk,[]);if(g.length){g.forEach(function(l){addTo('cart.shop.'+A.shop+'.'+cs0.user,l.sku,l.mode,l.qty)});del(gk)}}
    var base='#/a/'+encodeURIComponent(A.shop),cs=custSess(),ck='cart.shop.'+A.shop+'.'+(cs?cs.user:'guest'),cats=liveCats(D),cur=p[0]==='c'?p[1]:'',page=p[0]||'';
    var html=topbar({base:base,title:A.name+'的烟花店',sub:'② 顾客下单 · 示例店 · /a/'+A.shop,cats:cats,cur:cur,q:q.get('q')});
    html+='<div class="ann" role="note"><div class="in"><span>🛍️ <b>'+esc(A.name)+'的烟花店（示例）</b> · Hunter BOOM JOHOR 产品</span><span>📦 下单后由本店代理核对，再安排出货</span><span>💬 <a href="#" id="ct">联系本店代理：'+esc(A.name)+'</a></span><span>'+(cs?'👤 '+esc(cs.user)+' · <a href="#" id="clo" style="color:#7a5a50">退出</a>':'<a href="'+base+'/login" style="color:#9b1c2c">登录 / 注册</a>')+'</span></div></div><main class="wrap">';
    if(page==='p')html+=shopProduct(D,A,p[1],base);
    else if(page==='cart')html+=shopCart(D,A,ck,base,cs);
    else if(page==='login')html+=custLogin(A,base,q.get('next'));
    else if(page==='orders')html+=shopOrders(A,base,cs);
    else if(page==='done')html+='<div class="cp thx"><div class="e">🎆</div><h1>订单已提交，本店代理正在核对</h1><p>单号 <b>'+esc(p[1])+'</b><br>状态：<span class="st s0">订单已提交</span></p><p><a class="btn gd" href="'+base+'/orders">查看我的订单</a> <a class="btn ol" href="'+base+'">继续逛</a></p></div>';
    else html+=shopHome(D,A,cur,q.get('q'),base);
    html+='</main><footer><div class="in"><div><h2>'+esc(A.name)+'的烟花店（示例）</h2><p>Hunter BOOM JOHOR 产品。价格为卖价；下单后由本店代理核对再出货。</p></div><div><h3>联系</h3><p>联系本店代理：'+esc(A.name)+'（联系方式待代理填写）</p></div><div><h3>分类</h3><p class="cats">'+cats.map(function(c){return '<a href="'+base+'/c/'+c.id+'">'+esc(c.name)+'</a>'}).join('')+'</p></div><p class="legal">燃放烟花请遵守当地法律法规。本页为草稿示例。</p></div></footer>';
    html+=bottomNav([{h:base,t:'首页',ic:IC.home,on:!page||page==='c'||page==='p'},{h:base+'/cart',t:'购物车',ic:IC.cart,on:page==='cart',b:cartCount(get(ck,[]))||''},{h:base+'/orders',t:'我的订单',ic:IC.ord,on:page==='orders'},{h:cs?base+'/orders':base+'/login',t:cs?esc(cs.name||cs.user):'登录',ic:IC.user,on:page==='login'}]);
    app.innerHTML=html;bindSearch(base);
    bindQty(app,page==='cart'?function(i){var c=get(ck,[]);c[+i.getAttribute('data-i')].qty=+i.value;set(ck,c);route()}:null);
    document.getElementById('ct').onclick=function(e){e.preventDefault();var m=document.createElement('div');m.className='mdl';m.innerHTML='<div><h3>联系本店代理</h3><p>'+esc(A.name)+'（示例）<br><small class="muted">联系方式待代理填写，草稿不放电话。</small></p><button class="btn gd" type="button">好</button></div>';m.onclick=function(){m.remove()};document.body.appendChild(m)};
    var lo=document.getElementById('clo');if(lo)lo.onclick=function(e){e.preventDefault();del('sess.cust');route()};
    [].forEach.call(app.querySelectorAll('[data-add]'),function(b){b.onclick=function(){var qi=b.getAttribute('data-qf'),qq=qi?Math.max(1,parseInt(document.getElementById(qi).value,10)||1):1;var mode=b.getAttribute('data-mode')||(app.querySelector('.seg .on')||{}).value||'box';addTo(ck,b.getAttribute('data-add'),mode,qq);toast('已加入 ×'+qq);route()}});
    [].forEach.call(app.querySelectorAll('.seg button'),function(b){b.onclick=function(){if(b.disabled)return;[].forEach.call(app.querySelectorAll('.seg button'),function(x){x.classList.remove('on')});b.classList.add('on')}});
    [].forEach.call(app.querySelectorAll('[data-rm]'),function(b){b.onclick=function(){var c=get(ck,[]);c.splice(+b.getAttribute('data-rm'),1);set(ck,c);route()}});
    [].forEach.call(app.querySelectorAll('[data-ci] button'),function(b){b.onclick=function(){if(b.disabled)return;var i=+b.parentNode.getAttribute('data-ci'),mode=b.value,c=get(ck,[]),line=c[i];if(!line)return;var want=mode==='unit'?'unit':'box';if(line.mode===want)return;var exist=-1;c.forEach(function(l,j){if(j!==i&&l.sku===line.sku&&l.mode===want)exist=j});if(exist>=0){c[exist].qty+=line.qty;c.splice(i,1)}else line.mode=want;set(ck,c);route()}});
    if(page==='login')bindCustLogin(A,base,q.get('next'));
    [].forEach.call(app.querySelectorAll('.shipo button'),function(b){b.onclick=function(){[].forEach.call(app.querySelectorAll('.shipo button'),function(x){x.classList.remove('on');x.setAttribute('aria-checked','false')});b.classList.add('on');b.setAttribute('aria-checked','true');b.parentNode.classList.remove('bad');var w=document.getElementById('faw');if(w)w.hidden=b.getAttribute('data-ship')!=='post'}});
    var co=document.getElementById('co');if(co)co.onclick=function(){
      var f={name:document.getElementById('fn').value.trim(),phone:document.getElementById('fp').value.trim(),addr:document.getElementById('fa').value.trim(),memo:document.getElementById('fm').value.trim(),ship:(app.querySelector('.shipo .on')||{getAttribute:function(){return ''}}).getAttribute('data-ship')},ok=document.getElementById('fc').checked;
      var bad=[];if(!f.name)bad.push('姓名');if(!isFullPhone(f.phone))bad.push('电话');if(!f.ship)bad.push('送货方式');if(f.ship==='post'&&!f.addr)bad.push('收货地址');
      ['fn','fp','fa'].forEach(function(id){document.getElementById(id).style.borderColor=''});app.querySelector('.shipo').classList.remove('bad');
      if(bad.length){bad.forEach(function(b){if(b==='送货方式'){app.querySelector('.shipo').classList.add('bad');return}document.getElementById({'姓名':'fn','电话':'fp','收货地址':'fa'}[b]).style.borderColor='#9b1c2c'});toast('请填好：'+bad.join('、'));return}
      if(!ok){toast('请勾选确认资料正确');return}
      var c=get(ck,[]);if(!c.length)return;
      var prof=get('prof.'+cs.user,{});prof.name=f.name;prof.phone=f.phone;prof.ship=f.ship;if(f.ship==='post')prof.addr=f.addr;set('prof.'+cs.user,prof);
      var items=c.map(function(l){var x=D.by[l.sku],u=l.mode==='unit';return{sku:l.sku,name:x.name,pk:x.pk,mode:l.mode,qty:l.qty,s:u?x.su:x.s}});
      var deny=creditDeny(A,costD,items,costD);if(deny){toast(deny);return}
      var o={id:oid('C'),kind:'cust',shop:A.shop,agentAcct:A.acct,time:tnow(),status:ST0C,paid:false,cust:{user:cs.user,name:f.name,phone:f.phone,ship:f.ship,addr:f.ship==='post'?f.addr:'',memo:f.memo},items:items};
      var all=orders();all.push(o);saveOrders(all);del(ck);location.hash=base+'/done/'+o.id;donePop(o.id,'祝您购炮愉快，佳节红火，大吉大利！')};
  });
}
function shopPrice(x){return '<div class="row"><span class="pr"><small>RM</small>'+rm(x.s).slice(2)+'</span><span class="pk">/整盒 '+esc(x.pk)+'</span></div>'+(x.su!=null?'<div class="row"><span class="pr" style="font-size:14px"><small>RM</small>'+rm(x.su).slice(2)+'</span><span class="pk">/件 散装</span></div>':'<div class="pk" style="margin-top:2px">此款只按整盒卖</div>')}
function shopCard(x,base){var qid='cq-'+x.sku;return '<article class="pc"><a class="im" href="'+base+'/p/'+x.sku+'">'+img(x)+'<span class="cd2">'+x.sku+'</span>'+(x.v?'<span class="vb">▶ 视频</span>':'')+'</a><div class="b"><a href="'+base+'/p/'+x.sku+'"><h3>'+esc(x.name)+'</h3></a><div class="en">'+esc(x.en)+'</div>'+shopPrice(x)+'<div class="pcx"><div class="pcq"><span>数量</span>'+qtyBox(qid,1)+'</div><div class="pcb"><button class="add" data-add="'+x.sku+'" data-mode="box" data-qf="'+qid+'">+ 整盒</button>'+(x.su!=null?'<button class="add o" data-add="'+x.sku+'" data-mode="unit" data-qf="'+qid+'">+ 散装</button>':'')+'</div></div></div></article>'}
function shopHome(D,A,cur,q,base){
  var list=filterItems(D,cur,q),h='';
  if(!cur&&!q)h+='<section class="hero"><span class="tag">示例店 · 草稿</span><h1>'+esc(A.name)+'的烟花店 <em>年货烟花</em></h1><p>完整产品图和视频，价格就是卖价。登录须填姓名和完整电话，下单再填收货地址；每款可选整盒或散装（能算散装的才有）。下单后由本店代理核对，再安排出货。</p><div class="btns"><a class="btn gd" href="'+base+'/c/'+(D.cats[0]||{}).id+'">开始选购</a>'+(custSess()?'':'<a class="btn ol" href="'+base+'/login">登录 / 注册</a>')+'</div></section><div class="ic">'+liveCats(D).map(function(c){return '<a href="'+base+'/c/'+c.id+'"><span>'+c.icon+'</span>'+esc(c.name)+'</a>'}).join('')+'</div>';
  h+='<section class="sec"><h2>'+(q?'搜索「'+esc(q)+'」':cur?esc(catName(D,cur)):'全部产品')+' <small>'+list.length+' 款</small></h2>';
  return h+(list.length?'<div class="g">'+list.map(function(x){return shopCard(x,base)}).join('')+'</div>':'<div class="empty">没有找到产品</div>')+'</section>';
}
function shopProduct(D,A,sku,base){
  var x=D.by[sku];if(!x)return '<div class="empty">产品不存在。</div>';var nb=neighbors(D,x),cn=catName(D,x.cat);
  return '<nav class="bc"><a href="'+base+'">首页</a> › <a href="'+base+'/c/'+x.cat+'">'+esc(cn)+'</a> › <span>'+esc(x.name)+'</span></nav><article class="pd"><div class="im">'+img(x,'big')+'<span class="cd2">'+x.sku+'</span></div><div class="pi"><span class="cd2" style="position:static;display:inline-block">'+x.sku+'</span><h1>'+esc(x.name)+'</h1><p class="en" lang="en">'+esc(x.en)+'</p>'+
  '<div class="pr">'+rm(x.s)+' <small style="font-size:13px;color:#7a5a50;font-weight:600">/ 整盒（'+esc(x.pk)+'）</small></div>'+(x.su!=null?'<div class="pr" style="font-size:20px">'+rm(x.su)+' <small style="font-size:13px;color:#7a5a50;font-weight:600">/ 件 散装</small></div>':'<p class="tip">此款只按整盒卖，暂无散装价。</p>')+
  '<div class="act"><div class="seg"><button type="button" class="on" value="box">整盒</button>'+(x.su!=null?'<button type="button" value="unit">散装</button>':'<button type="button" value="unit" disabled title="此款暂无散装价">散装</button>')+'</div>'+qtyBox('pq')+'</div><div class="act"><button class="btn gd" type="button" data-add="'+x.sku+'" data-qf="pq">加入购物车</button><a class="btn ol" href="'+base+'/cart">去结算</a></div>'+
  '<p class="note">下单后由本店代理核对，再安排出货。有问题请联系本店代理 '+esc(A.name)+'。</p>'+specTable(x,cn).replace(/<tr><th>一盒件数<\/th><td><span class="nil">[^<]*<\/span><\/td><\/tr>/,'')+'</div></article>'+videoBlock(x)+
  '<nav class="pn"><span>'+(nb.prev?'<a href="'+base+'/p/'+nb.prev.sku+'">‹ '+esc(nb.prev.name)+'</a>':'')+'</span><span>'+(nb.next?'<a href="'+base+'/p/'+nb.next.sku+'">'+esc(nb.next.name)+' ›</a>':'')+'</span></nav>'+
  (nb.rel.length?'<section class="sec"><h2>同类推荐 <small>'+esc(cn)+'</small></h2><div class="g">'+nb.rel.map(function(i){return shopCard(i,base)}).join('')+'</div></section>':'');
}
function custLogin(A,base,next){
  return '<div class="lc"><h1>顾客登录 / 注册</h1><p>请填写 <b>姓名</b> 和 <b>完整电话号码</b>（不要只填后四位）。<br>你在「'+esc(A.name)+'的烟花店」下的单会记在代理 '+esc(A.name)+' 名下。</p>'+
  '<label for="cn">姓名 *</label><input id="cn" placeholder="例：丽芬" autocomplete="name"><label for="cp">完整电话号码 *</label><input id="cp" type="tel" inputmode="tel" placeholder="例：012-345 6789" autocomplete="tel"><div class="un">将使用：<b id="cu">—</b></div>'+
  '<button class="btn gd" id="cgo" type="button">登录 / 注册</button><button class="btn ol" id="cdemo" type="button">进入示例：丽芬 012-345 6789</button><p class="or">草稿不设密码。下单还要填收货地址，并勾选确认。</p></div>';
}
function bindCustLogin(A,base,next){
  function u(){var n=document.getElementById('cn').value.trim(),p=document.getElementById('cp').value.trim();var ok=n&&isFullPhone(p);document.getElementById('cu').textContent=ok?(n+' · '+p):(n&&p?'电话请填完整号码（至少 9 位）':'请填姓名和完整电话');return{ok:ok,n:n,p:p}}
  document.getElementById('cn').oninput=u;document.getElementById('cp').oninput=u;
  function go(name,phone){var user=custUser(name,phone);set('sess.cust',{user:user,name:name,phone:phone,t:tnow()});var pr=get('prof.'+user,{});pr.name=name;pr.phone=phone;set('prof.'+user,pr);location.hash=base+(next?'/'+next:'')}
  document.getElementById('cgo').onclick=function(){var x=u();if(!x.n){toast('请填姓名');return}if(!isFullPhone(x.p)){toast('请填写完整电话号码');return}go(x.n,x.p)};
  document.getElementById('cdemo').onclick=function(){go(DEMO_CUST.name,DEMO_CUST.phone)};
}
function shopCart(D,A,ck,base,cs){
  var c=get(ck,[]);
  if(!c.length)return '<div class="cp"><h1>购物车</h1><div class="empty">购物车是空的。<br><a class="btn gd" href="'+base+'" style="margin-top:12px">去选购</a></div></div>';
  var t=0,q=0;
  var rows=c.map(function(l,i){var x=D.by[l.sku],u=l.mode==='unit',canU=x.su!=null,s=(u?x.su:x.s)*l.qty;t+=s;q+=l.qty;return '<div class="cl"><div class="t" style="'+(x.th?'background-image:url('+x.th+')':'')+'"></div><div><div class="n">'+x.sku+' '+esc(x.name)+'<small>'+(u?'散装 / 件 · '+rm(x.su):'整盒（'+esc(x.pk)+'）· '+rm(x.s))+'</small></div><div class="q"><div class="seg" data-ci="'+i+'"><button type="button" class="'+(u?'':'on')+'" value="box">整盒</button><button type="button" class="'+(u?'on':'')+'" value="unit"'+(canU?'':' disabled title="此款暂无散装价"')+'>散装</button></div>'+qtyBox('cq'+i,l.qty).replace('<input ','<input data-i="'+i+'" ')+'<span>小计 <b style="color:#9b1c2c">'+rm(s)+'</b></span><button class="rm" data-rm="'+i+'">删除</button></div></div></div>'}).join('');
  var h='<div class="cp"><h1>购物车</h1>'+rows+'<div class="tot" style="grid-template-columns:1fr 1fr"><div><i>数量</i><b>'+q+'</b></div><div class="s"><i>订单金额（卖价）</i><b>'+rm(t)+'</b></div></div>';
  if(!cs){
    return h+'<a class="btn gd big" href="'+base+'/login?next=cart">登录后填写收货资料下单</a><p class="tip">登录须填姓名和完整电话号码。</p></div>';
  }
  var pr=get('prof.'+cs.user,{});
  return h+'<h2 style="font-size:16px;color:#6e101c;margin:14px 0 4px">基本资料（必填，免得出货搞混）</h2>'+
  '<div class="lc" style="margin:6px 0;max-width:none;box-shadow:none"><label for="fn">姓名 *</label><input id="fn" value="'+esc(pr.name||cs.name||'')+'" required><label for="fp">电话 *</label><input id="fp" type="tel" inputmode="tel" value="'+esc(pr.phone||cs.phone||'')+'" placeholder="完整电话号码" required><label>送货方式 *</label><div class="shipo" role="radiogroup" aria-label="送货方式"><button type="button" role="radio" data-ship="agent" class="'+(pr.ship==='agent'?'on':'')+'" aria-checked="'+(pr.ship==='agent')+'">🛵 代理送货</button><button type="button" role="radio" data-ship="post" class="'+(pr.ship==='post'?'on':'')+'" aria-checked="'+(pr.ship==='post')+'">📮 邮寄</button></div><div id="faw"'+(pr.ship==='post'?'':' hidden')+'><p class="shipn">西马邮费 RM15 任买（不含在订单金额）</p><label for="fa">收货地址 *</label><textarea id="fa" placeholder="门牌、路名、区、邮编、城市">'+esc(pr.addr||'')+'</textarea></div><label for="fm">备注（选填）</label><textarea id="fm" placeholder="例：方便收货时间"></textarea>'+
  '<label style="display:flex;gap:8px;align-items:flex-start;font-weight:600"><input id="fc" type="checkbox" style="width:auto;margin-top:4px"> 我确认以上资料正确'+(pr.name?'（已带出上次资料，请再核对）':'')+'</label></div>'+
  '<button class="btn gd big" id="co" type="button">提交订单 · '+rm(t)+'</button><p class="tip">登录：'+esc(cs.user)+' · 订单记在代理 '+esc(A.name)+' 名下，由本店代理核对后安排出货。</p></div>';
}
function shopOrders(A,base,cs){
  if(!cs)return '<div class="lc"><h1>我的订单</h1><p>请先登录查看订单。</p><a class="btn gd" href="'+base+'/login?next=orders">登录</a></div>';
  var my=orders().filter(function(o){return o.kind==='cust'&&o.shop===A.shop&&o.cust.user===cs.user}).reverse();
  return '<div class="cp"><h1>我的订单 · '+esc(cs.name||cs.user)+'</h1>'+(my.length?my.map(function(o){return orderCard(o,'cust',null)}).join(''):'<div class="empty">还没有订单。</div>')+'</div>';
}

route();
})();
