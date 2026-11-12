/* Hunter BOOM JOHOR 总盘 / 代理 / 顾客 —— 草稿（本地 localStorage，无真实安全） */
(function(){
'use strict';
var DEMO_AGENT={name:'阿伟',tail:'0901',acct:'阿伟0901a',shop:'阿伟0901',rate:0.4};
var AGENT_ABC={name:'abc',tail:'1234',acct:'abc1234a',shop:'abc1234',rate:0.4};
var DEMO_CUST={name:'丽芬',phone:'012-345 6789'};
var LS='hbd.';
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
function toast(t){var e=document.getElementById('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},1600)}
function tnow(){return new Date().toISOString()}
function tfmt(iso){try{return new Date(iso).toLocaleString('zh-CN',{timeZone:'Asia/Kuala_Lumpur',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})+'（马来西亚时间）'}catch(e){return iso}}
function oid(p){var d=new Date(),z=function(n){return(n<10?'0':'')+n};return p+'-'+String(d.getFullYear()).slice(2)+z(d.getMonth()+1)+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes())+z(d.getSeconds())+Math.floor(Math.random()*90+10)}
function tail4(s){var d=String(s||'').replace(/\D/g,'');return d.slice(-4)}
function phoneDigits(s){return String(s||'').replace(/\D/g,'')}
function isFullPhone(s){var d=phoneDigits(s);return d.length>=9&&d.length<=15}
function custUser(name,phone){return name+phoneDigits(phone)}
function seedAgents(){return [{name:'阿伟',tail:'0901',acct:'阿伟0901a',shop:'阿伟0901',rate:0.4},{name:'abc',tail:'1234',acct:'abc1234a',shop:'abc1234',rate:0.4}]}
function agents(){var L=get('agents',null);if(!Array.isArray(L)||!L.length){L=seedAgents();set('agents',L)}L.forEach(function(a){if(a.rate==null||!isFinite(a.rate))a.rate=0.4;if(!a.acct)a.acct=a.name+a.tail+'a';if(!a.shop)a.shop=a.name+a.tail});return L}
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
function parseRate(s){var n=parseFloat(String(s==null?'':s).replace(/%/g,'').replace(/,/g,'.').trim());if(!isFinite(n)||n<0||n>100)return null;return Math.round(n*100)/10000}
function sellOf(cost,rate){return cost==null?null:Math.round(cost*(1+(rate==null?0.4:rate)))}
function withRate(D,rate){var items=D.items.map(function(x){var y={},k;for(k in x)y[k]=x[k];y.s=sellOf(x.a,rate);y.k=(y.s==null||x.a==null)?null:y.s-x.a;y.su=sellOf(x.au,rate);y.ku=(y.su==null||x.au==null)?null:y.su-x.au;return y});var by={};items.forEach(function(x){by[x.sku]=x});return{cats:D.cats,items:items,by:by,source:D.source,generated:D.generated}}
function shopOnly(D,rate){var W=withRate(D,rate),items=W.items.map(function(x){return{sku:x.sku,cat:x.cat,name:x.name,en:x.en,pk:x.pk,n:x.n,img:x.img,th:x.th,wh:x.wh,v:x.v,vo:x.vo,vt:x.vt,s:x.s,su:x.su}}),by={};items.forEach(function(x){by[x.sku]=x});return{cats:D.cats,items:items,by:by,source:D.source,generated:D.generated}}
function exAt(rate){var a=25000,s=sellOf(a,rate);return '进价不变。例：HB001 进价 RM250.00 → 卖价 '+rm(s)+' · 抽成 '+rm(s-a)}

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
function orders(){return get('orders',[])}
function saveOrders(o){set('orders',o)}
function stc(s){return s===ST2?'s2':s===ST1?'s1':'s0'}
function isPaid(o){return !!o.paid}
function ymKL(iso){try{return new Date(iso).toLocaleString('sv-SE',{timeZone:'Asia/Kuala_Lumpur'}).slice(0,7)}catch(e){return ''}}
function thisMonthKL(){return new Date().toLocaleString('sv-SE',{timeZone:'Asia/Kuala_Lumpur'}).slice(0,7)}
function monthLabel(ym){if(!ym||ym.length<7)return ym;return ym.slice(0,4)+'年'+parseInt(ym.slice(5,7),10)+'月'}
function totalsOf(list,D){
  var t={n:list.length,qty:0,s:0,a:0,k:0,missS:0,missA:0,missK:0};
  list.forEach(function(o){(o.items||[]).forEach(function(it){
    var v=lineVals(o,it,D);t.qty+=it.qty||0;
    if(v.s==null)t.missS++;else t.s+=v.s;
    if(v.a==null)t.missA++;else t.a+=v.a;
    if(v.k==null)t.missK++;else t.k+=v.k;
  })});
  return t;
}
function rmSum(v,miss){if(miss){return (v?rm(v):'—')+'<small class="miss">（有缺）</small>'}return rm(v)}
function modeTxt(it,view){return it.mode==='unit'?'散装（件）':(view==='cust'?'整盒':'整箱')+'（'+esc(it.pk)+'）'}

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
  if(p[0]==='master'){markPv('master');return master(p[1]||'stats')}
  if(p[0]==='cs'){markPv('cs');return staffApp()}
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
  '<a href="#/master"><span class="e">📊</span><b>总盘（永）</b>给老板看的是统计、订单、代理名单。<ul><li>统计：总销售、未付款 / 已付款、出货状态、抽成，可按代理分</li><li>订单：确认有货 → 安排出货；付款由总盘手工标记</li><li>代理名单：开下线、设定抽成</li><li>完整价目表放在内部查阅，不放主菜单，以免扰乱老板</li></ul></a>'+
  '<a href="#/agent"><span class="e">🧾</span><b>① 代理自己订货</b>登录用户名：<b style="display:inline;font-size:15px">阿伟0901a</b><ul><li>名字 + 电话尾号 + <b style="display:inline;font-size:13px">a</b></li><li>完整产品资料，看进价 / 卖价 / 抽成</li><li>向总盘下单；「我的订单」看订了多少货、多少钱、抽成多少（含顾客下单）</li></ul></a>'+
  '<a href="#/a/阿伟0901"><span class="e">🛍️</span><b>② 顾客下单链接</b>链接：<b style="display:inline;font-size:15px">/a/阿伟0901</b>（没有 a）<ul><li>只显示卖价，看不到总盘、进价、抽成</li><li>顾客登录填 姓名 + 完整电话号码</li><li>下单必填 姓名、完整电话、收货地址，并可选整盒或散装，单挂在阿伟名下</li></ul></a>'+
  '<a href="#/cs"><span class="e">👩‍💼</span><b>③ 客服（秘书）</b>登录用户名：<b style="display:inline;font-size:15px">小芳0001s</b><ul><li>名字 + 电话尾号 + <b style="display:inline;font-size:13px">s</b>，由总盘开通</li><li>单独入口，只处理订单：确认有货、安排出货、标记付款</li><li>看不到开下线、改抽成和价目表</li></ul></a>'+
  '</div><div class="rule"><b>价钱规则（按你定的）：</b> 代理进价 = 总盘 × 1.25；卖价 = 代理进价 × 1.40；抽成 = 卖价 − 代理进价（即进价的 40%）。散装：只有包装 N/1 才算，总盘单件 = 箱价 ÷ N，再按同样规则；其他包装散装留空。金额四舍五入到 RM0.01。<br>例：HB001 8尺红炮（40/1）总盘 RM200 → 进价 RM250 · 卖价 RM350 · 抽成 RM100；散装 进价 RM6.25 · 卖价 RM8.75 · 抽成 RM2.50。</div>'+
  '<div class="rule"><b>登录规则：</b> 代理自己订货 = 名字 + 电话尾号 + <code>a</code>（<code>阿伟0901a</code>）。秘书（客服）= 名字 + 电话尾号 + <code>s</code>（<code>小芳0001s</code>），从 <code>/cs</code> 单独登录，只处理订单，由总盘开通。顾客在代理的顾客链接 <code>/a/阿伟0901</code> 登录，须填 姓名和完整电话（例：丽芬，012-345 6789）。草稿里登录不设密码，只为看流程。</div></div>';
}

/* ======================= 总盘 ======================= */
function masterFoot(tab){
  if(tab==='data')return '<p class="mf">此页是内部价目查阅，不放在老板主菜单。<a href="#/master">返回统计</a></p>';
  return '<p class="mf"><a href="#/master/data">价目表（内部查阅）</a></p>';
}
function master(tab){
  document.body.className='mst nobn';
  load('master').then(function(D){
    var os=orders(),pend=os.filter(function(o){return o.status!==ST2}).length,unp=os.filter(function(o){return !isPaid(o)}).length;
    var head='<header class="mh"><div class="in"><h1>Hunter BOOM JOHOR 总盘<small>永 · 只看数据 · 草稿</small></h1><nav><a href="#/master" class="'+(tab==='stats'?'on':'')+'">统计</a><a href="#/master/orders" class="'+(tab==='orders'?'on':'')+'">订单'+(unp||pend?'（'+(unp?'未付款 '+unp+(pend?' · ':''):'')+(pend?'未出货 '+pend:'')+'）':'')+'</a><a href="#/master/agents" class="'+(tab==='agents'?'on':'')+'">代理名单</a></nav></div></header>';
    if(tab==='stats')return masterStats(D,head);
    if(tab==='orders')return masterOrders(D,head);
    if(tab==='agents')return masterAgents(head);
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
  var unpaidL=os.filter(function(o){return !isPaid(o)}), paidL=os.filter(isPaid);
  var waitL=os.filter(function(o){return o.status!==ST1&&o.status!==ST2});
  var confL=os.filter(function(o){return o.status===ST1});
  var shipL=os.filter(function(o){return o.status===ST2});
  var T=totalsOf(os,D),U=totalsOf(unpaidL,D),P=totalsOf(paidL,D),W=totalsOf(waitL,D),C=totalsOf(confL,D),S=totalsOf(shipL,D);
  function card(cls,title,money,miss,n,sub){
    return '<div class="'+(cls||'')+'"><b>'+rmSum(money,miss)+'</b>'+title+'<i>'+(n!=null?n+' 笔':'')+(n!=null&&sub?' · ':'')+(sub||'')+'</i></div>';
  }
  var kpi='<div class="kp sale">'+
    card('hi','总销售（卖价）',T.s,T.missS,T.n,'顾客单 + 代理自己订货')+
    card('','总盘应收（进价）',T.a,T.missA,T.n,'代理应付给总盘')+
    card('w','未付款',U.a,U.missA,U.n,'尚未收到的进价')+
    card('ok','已付款',P.a,P.missA,P.n,'已收进价')+
    card('k','抽成合计',T.k,T.missK,null,'卖价 − 进价，代理应得')+
    card('','待确认',W.s,W.missS,W.n,'卖价')+
    card('','已确认待出货',C.s,C.missS,C.n,'卖价')+
    card('','已出货',S.s,S.missS,S.n,'卖价')+
  '</div>';
  var by={},keys=[];
  agents().forEach(function(a){by[a.acct]={name:a.name,acct:a.acct,shop:a.shop,list:[]};keys.push(a.acct)});
  os.forEach(function(o){var k=o.agentAcct||('?'+(o.shop||'未记代理'));if(!by[k]){by[k]={name:o.shop||k,acct:k,shop:o.shop||'',list:[]};keys.push(k)}by[k].list.push(o)});
  var arows=keys.map(function(k){var g=by[k],tg=totalsOf(g.list,D),ug=totalsOf(g.list.filter(function(o){return !isPaid(o)}),D),pg=totalsOf(g.list.filter(isPaid),D);
    return '<tr><td>'+esc(g.name)+'<br><small class="muted">'+esc(g.acct)+'</small></td><td class="r">'+tg.n+'</td><td class="r">'+rmSum(tg.s,tg.missS)+'</td><td class="r">'+rmSum(tg.a,tg.missA)+'</td><td class="r w">'+rmSum(ug.a,ug.missA)+'</td><td class="r">'+rmSum(pg.a,pg.missA)+'</td><td class="r k">'+rmSum(tg.k,tg.missK)+'</td></tr>';
  }).join('');
  var empty=os.length? '':'<p class="ms-note">这个范围内还没有订单，金额为 RM0.00（没有单，不是缺数据）。去「① 代理自己订货」或「② 顾客下单链接」下一张单后，这里会跟着变。</p>';
  app.innerHTML=head+'<main class="mw"><div class="fl"><strong style="font-size:15px">订单统计</strong><button type="button" data-p="all" style="'+(period==='all'?'background:#222;color:#fff':'')+'">全部</button><button type="button" data-p="month" style="'+(period==='month'?'background:#222;color:#fff':'')+'">本月（'+monthLabel(month)+'）</button><span class="n">付款由总盘手工标记。没有取消或退货，统计里暂不含这两项。</span></div>'+
    kpi+empty+
    '<h2 class="sh">按代理分</h2><div class="tw" style="max-height:none"><table class="dt at"><thead><tr><th>代理</th><th class="r">笔数</th><th class="r">总销售（卖价）</th><th class="r">总盘应收（进价）</th><th class="r">未付款</th><th class="r">已付款</th><th class="r">抽成</th></tr></thead><tbody>'+
    (arows||'<tr><td colspan="7" class="muted">还没有代理订单</td></tr>')+'</tbody></table></div>'+
    '<p class="ms-note"><b>口径：</b>总销售 = 订单卖价合计（顾客下单 + 代理自己订货）。总盘应收、未付款、已付款 = 按进价，即代理应付给总盘的钱，不是顾客付给代理的卖价。抽成 = 卖价 − 进价。某行缺进价或卖价会标「有缺」，不把缺失当 0。库存数量总盘没有，不在这里编。暂无取消、退货、部分付款。</p>'+masterFoot('stats')+'</main>';
  [].forEach.call(app.querySelectorAll('[data-p]'),function(b){b.onclick=function(){set('ms.period',b.getAttribute('data-p'));route()}});
}
function masterAgents(head){
  var L=agents();
  function preview(){var n=document.getElementById('nn').value.trim(),t=tail4(document.getElementById('nt').value),r=parseRate(document.getElementById('nr').value);document.getElementById('np').innerHTML=n&&t.length===4?('将开通：登录 <b>'+esc(n+t+'a')+'</b> · 顾客店 <b>/a/'+esc(n+t)+'</b>'):'请填名字和 4 位尾号';document.getElementById('nx').textContent=r==null?'抽成请填 0–100 的数字':exAt(r)}
  var rows=L.map(function(a,i){return '<tr><td>'+esc(a.name)+'（尾号 '+esc(a.tail)+'）</td><td><b>'+esc(a.acct)+'</b></td><td><a href="#/a/'+encodeURIComponent(a.shop)+'" style="color:#9b1c2c">/a/'+esc(a.shop)+'</a></td><td><div class="rt"><input id="r'+i+'" type="number" min="0" max="100" step="0.01" value="'+ratePct(a.rate)+'" aria-label="'+esc(a.name)+' 抽成百分比"> % <button type="button" class="sv" data-save="'+i+'">保存</button></div><div class="ex" id="rx'+i+'">'+esc(exAt(a.rate))+'</div></td></tr>'}).join('');
  var SL=staff();
  var srows=SL.map(function(s,i){return '<tr><td>'+esc(s.name)+'（尾号 '+esc(s.tail)+'）</td><td><b>'+esc(s.acct)+'</b></td><td><button type="button" class="rm" data-sdel="'+i+'">删除</button></td></tr>'}).join('');
  app.innerHTML=head+'<main class="mw"><div class="oc"><div class="h"><b>代理名单</b><span class="t">只有总盘可以开新下线和改抽成；代理自己不能做。进价固定为总盘 × 1.25，卖价 = 进价 ×（1 + 抽成率）。</span></div><table><tr><th>代理</th><th>自己订货登录</th><th>顾客下单链接</th><th>抽成（改完点保存）</th></tr>'+rows+'</table>'+
  '<div class="af"><h3>新增代理（开下线）</h3><div class="row"><div><label for="nn">名字</label><input id="nn" placeholder="例：阿伟" autocomplete="off"></div><div><label for="nt">电话尾号（后四位）</label><input id="nt" inputmode="numeric" maxlength="4" placeholder="例：0901" autocomplete="off"></div><div><label for="nr">抽成率（%）</label><input id="nr" type="number" min="0" max="100" step="0.01" value="40"></div></div><div class="pvw" id="np">请填名字和 4 位尾号</div><div class="ex" id="nx">'+esc(exAt(0.4))+'</div><button class="btn gd" type="button" id="nadd">开通下线</button></div>'+
  '<div class="af" id="staffbox"><h3>客服秘书</h3><p style="margin:0 0 10px;font-size:13px;color:#7a5a50">只有总盘可以开通。秘书用单独入口 <a href="#/cs">/cs</a> 登录（用户名 = 名字 + 尾号 + s），只能处理订单，看不到开下线和价目表。</p>'+
  (SL.length?'<table><tr><th>秘书</th><th>登录</th><th></th></tr>'+srows+'</table>':'<p class="muted">还没有秘书。</p>')+
  '<div class="row"><div><label for="sn">名字</label><input id="sn" placeholder="例：小芳" autocomplete="off"></div><div><label for="snt">电话尾号（后四位）</label><input id="snt" inputmode="numeric" maxlength="4" placeholder="例：0001" autocomplete="off"></div></div><div class="pvw" id="spv">请填名字和 4 位尾号</div><button class="btn gd" type="button" id="sadd">开通秘书</button></div>'+
  '<p class="ms-note">用户名 = 名字 + 电话尾号 + a（自己订货）；顾客店链接 /a/名字+尾号（不带 a）；秘书 = 名字 + 尾号 + s，入口 /cs。新开的下线和秘书保存在这台浏览器里，重置后代理回到阿伟和 abc，秘书回到小芳0001s。</p></div>'+masterFoot('agents')+'</main>';
  ['nn','nt','nr'].forEach(function(id){document.getElementById(id).addEventListener('input',preview)});
  L.forEach(function(a,i){var inp=document.getElementById('r'+i);inp.addEventListener('input',function(){var r=parseRate(inp.value);document.getElementById('rx'+i).textContent=r==null?'抽成请填 0–100 的数字':exAt(r)})});
  [].forEach.call(app.querySelectorAll('[data-save]'),function(b){b.onclick=function(){var i=+b.getAttribute('data-save'),r=parseRate(document.getElementById('r'+i).value);if(r==null){toast('抽成请填 0 到 100 的数字');return}var all=agents();all[i].rate=r;saveAgents(all);toast(all[i].name+' 的抽成已改为 '+ratePct(r)+'%，进价不变');masterAgents(head)}});
  document.getElementById('nadd').onclick=function(){
    var n=document.getElementById('nn').value.trim(),tl=tail4(document.getElementById('nt').value),r=parseRate(document.getElementById('nr').value);
    if(!n){toast('请填名字');return}
    if(tl.length!==4){toast('电话尾号要 4 位数字');return}
    if(r==null){toast('抽成请填 0 到 100 的数字');return}
    var acct=n+tl+'a',shop=n+tl,all=agents();
    if(all.some(function(a){return a.acct===acct||a.shop===shop})){toast('这个登录或店铺已经存在');return}
    all.push({name:n,tail:tl,acct:acct,shop:shop,rate:r});saveAgents(all);
    toast('已开通：'+acct+'，顾客店 /a/'+shop+'，抽成 '+ratePct(r)+'%');masterAgents(head);
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
    toast('已开通秘书：'+acct+'，入口 /cs');masterAgents(head);
  };
  [].forEach.call(app.querySelectorAll('[data-sdel]'),function(b){b.onclick=function(){var i=+b.getAttribute('data-sdel'),all=staff(),s=all[i];if(!s||!confirm('删除秘书 '+s.acct+'？'))return;all.splice(i,1);saveStaff(all);toast('已删除 '+s.acct);masterAgents(head)}});
}
function masterOrders(D,head,asStaff){
  var os=orders().slice().reverse(),f=get('mof','open');
  var list=os.filter(function(o){
    if(f==='all')return true;
    if(f==='open')return o.status!==ST2;
    if(f==='unpaid')return !isPaid(o);
    if(f==='paid')return isPaid(o);
    return true;
  });
  function fb(id,label){return '<button type="button" data-f="'+id+'" style="'+(f===id?'background:#222;color:#fff':'')+'">'+label+'</button>'}
  app.innerHTML=head+'<main class="mw"><div class="fl">'+
    fb('open','未出货（'+os.filter(function(o){return o.status!==ST2}).length+'）')+
    fb('unpaid','未付款（'+os.filter(function(o){return !isPaid(o)}).length+'）')+
    fb('paid','已付款（'+os.filter(isPaid).length+'）')+
    fb('all','全部（'+os.length+'）')+
    '<span class="n">'+(asStaff?'你是客服秘书，只处理订单：确认有货、安排出货、标记付款（收的是进价）。':'确认有货 → 安排出货；付款手工标记（收的是进价）。秘书请走单独的客服入口登录。')+'</span></div>'+
  (list.length?list.map(function(o){return orderCard(o,'master',D)}).join(''):'<div class="oc empty">这个筛选下还没有订单。'+(asStaff?'':'去「① 代理自己订货」或「② 顾客下单链接」下一张示例单。')+'</div>')+(asStaff?'':masterFoot('orders'))+'</main>';
  [].forEach.call(app.querySelectorAll('[data-f]'),function(b){b.onclick=function(){set('mof',b.getAttribute('data-f'));route()}});
  [].forEach.call(app.querySelectorAll('[data-st]'),function(b){b.onclick=function(){var all=orders();all.forEach(function(o){if(o.id===b.getAttribute('data-id')){o.status=b.getAttribute('data-st');(o.log=o.log||[]).push({t:tnow(),s:o.status})}});saveOrders(all);toast('已更新：'+b.getAttribute('data-st'));route()}});
  [].forEach.call(app.querySelectorAll('[data-pay]'),function(b){b.onclick=function(){var all=orders(),id=b.getAttribute('data-id'),on=b.getAttribute('data-pay')==='1';all.forEach(function(o){if(o.id===id){o.paid=on;o.paidAt=on?tnow():null;(o.log=o.log||[]).push({t:tnow(),s:on?'已付款':'未付款'})}});saveOrders(all);toast(on?'已标记付款':'已改回未付款');route()}});
}
/* 订单卡：view = master | agent | cust ；D 为该角色的数据 */
function lineVals(o,it,D){ // 统一算出 进价/卖价/抽成（顾客单只存卖价，进价与抽成从代理/总盘数据查）
  var q=it.qty,x=D&&D.by[it.sku],u=it.mode==='unit';
  var s=it.s!=null?it.s:(x?(u?x.su:x.s):null);
  var a=it.a!=null?it.a:(x&&x.a!=null?(u?x.au:x.a):null);
  return{s:s==null?null:s*q,a:a==null?null:a*q,k:(a==null||s==null)?null:(s-a)*q};
}
function orderTotals(o,D){var t={qty:0,s:0,a:0,k:0};o.items.forEach(function(it){var v=lineVals(o,it,D);t.qty+=it.qty;t.s+=v.s||0;t.a+=v.a||0;t.k+=v.k||0});return t}
function orderCard(o,view,D){
  var src=o.kind==='agent'?'<span class="kind">自己订货</span>':'<span class="kind">顾客下单</span>';
  var who=o.kind==='agent'?'代理 '+esc(o.agentAcct):'顾客 '+esc(o.cust.user)+' · 经代理 '+esc(o.shop);
  var t=orderTotals(o,D),showCost=view!=='cust';
  var rows=o.items.map(function(it){var v=lineVals(o,it,D);return '<tr><td>'+it.sku+' '+esc(it.name)+'<br><small class="muted">'+modeTxt(it)+'</small></td><td class="r">'+it.qty+'</td>'+(showCost?'<td class="r">'+rmx(v.a)+'</td>':'')+'<td class="r">'+rmx(v.s)+'</td>'+(showCost?'<td class="r">'+rmx(v.k)+'</td>':'')+'</tr>'}).join('');
  var h='<div class="oc"><div class="h"><b>'+o.id+'</b>'+(view==='cust'?'':src)+'<span class="st '+stc(o.status)+'">'+esc(o.status)+'</span>'+(view==='cust'?'':'<span class="st '+(isPaid(o)?'s2':'sp')+'">'+(isPaid(o)?'已付款':'未付款')+'</span>')+'<span class="t">'+tfmt(o.time)+'</span></div>';
  if(view!=='cust')h+='<div class="t muted" style="font-size:12.5px">'+who+'</div>';
  if(o.kind==='cust'&&view!=='agent-lite')h+='<div class="note">📦 收货：<b>'+esc(o.cust.name)+'</b> · '+esc(o.cust.phone)+'<br>'+esc(o.cust.addr)+(o.cust.memo?'<br>备注：'+esc(o.cust.memo):'')+'</div>';
  if(o.kind==='agent'&&o.memo)h+='<div class="note">备注：'+esc(o.memo)+'</div>';
  h+='<table><tr><th>产品</th><th class="r">数量</th>'+(showCost?'<th class="r">进价</th>':'')+'<th class="r">卖价</th>'+(showCost?'<th class="r">抽成</th>':'')+'</tr>'+rows+'</table>';
  h+='<div class="sum"><span>数量 <b>'+t.qty+'</b></span>'+(showCost?'<span>进价合计 <b>'+rm(t.a)+'</b></span>':'')+'<span>'+(view==='cust'?'订单金额':'卖价合计')+' <b style="color:#9b1c2c">'+rm(t.s)+'</b></span>'+(showCost?'<span>抽成合计 <b style="color:#1b7a3a">'+rm(t.k)+'</b></span>':'')+'</div>';
  if(view==='master'){h+='<div class="ops">'+(o.status!==ST1&&o.status!==ST2?'<button data-st="'+ST1+'" data-id="'+o.id+'">✓ 已确认有货</button>':'')+(o.status!==ST2?'<button class="o" data-st="'+ST2+'" data-id="'+o.id+'">🚚 安排出货</button>':'<span class="muted" style="font-size:12.5px">已安排出货</span>')+(isPaid(o)?'<button class="o" data-pay="0" data-id="'+o.id+'">改回未付款</button>':'<button data-pay="1" data-id="'+o.id+'">标记已付款</button>')+'</div>'}
  if(view==='cust')h+='<p class="tip">'+(o.status===ST2?'客服已安排出货。':o.status===ST1?'客服已确认有货，稍后安排出货。':'订单已提交，客服确认货后安排出货。')+'</p>';
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
  app.innerHTML='<div class="lc"><h1>③ 客服（秘书）· 登录</h1><p>用户名 = 名字 + 电话尾号 + <b>s</b>（例：<b>小芳0001s</b>）。<br>由总盘开通。登录后只能处理订单，看不到开下线、改抽成和价目表。</p>'+
  '<label for="snl">名字</label><input id="snl" placeholder="例：小芳"><label for="stl">电话尾号（后四位）</label><input id="stl" inputmode="numeric" maxlength="4" placeholder="例：0001">'+
  '<div class="un">用户名：<b id="su">—</b></div><button class="btn gd" id="sgo" type="button">登录</button><button class="btn ol" id="sdemo" type="button">进入示例：小芳0001s</button>'+
  '<p class="or">草稿不设密码，只为看流程。这是秘书专用入口，不是总盘，也不是代理。</p></div>';
  function u(){var n=document.getElementById('snl').value.trim(),t=tail4(document.getElementById('stl').value);document.getElementById('su').textContent=n&&t.length===4?n+t+'s':'—';return n&&t.length===4?n+t+'s':''}
  document.getElementById('snl').oninput=u;document.getElementById('stl').oninput=u;
  function go(acct){var s=staffByAcct(acct);if(!s){toast('总盘还没开通这个秘书账号');return}set('sess.staff',{acct:acct,name:s.name,t:tnow()});location.hash='#/cs';route()}
  document.getElementById('sgo').onclick=function(){var x=u();if(!x){toast('请填名字和电话后四位');return}go(x)};
  document.getElementById('sdemo').onclick=function(){go('小芳0001s')};
}
function staffApp(){
  var ss=staffSess(),S=ss&&staffByAcct(ss.acct);
  if(!S){if(ss)del('sess.staff');return staffLogin()}
  document.body.className='mst nobn';
  load('master').then(function(D){
    var head='<header class="mh"><div class="in"><h1>客服（秘书）<small>'+esc(S.name)+' · '+esc(S.acct)+' · 只处理订单</small></h1><nav><a href="#/cs" class="on">订单</a><a href="#/cs" id="slo" style="font-weight:500">退出</a></nav></div></header>';
    masterOrders(D,head,true);
    var lo=document.getElementById('slo');if(lo)lo.onclick=function(e){e.preventDefault();del('sess.staff');toast('已退出');location.hash='#/cs';route()};
  });
}
function agentSess(){return get('sess.agent',null)}
function agent(p,q){
  var s=agentSess();
  if(!s||p[0]==='login')return agentLogin();
  var A=agentByAcct(s.acct);if(!A){del('sess.agent');return agentLogin()}
  load('agent').then(function(D0){var D=withRate(D0,A.rate);
    var base='#/agent',ck='cart.agent.'+A.acct,cats=liveCats(D),cur=p[0]==='c'?p[1]:'';
    var page=p[0]||'';
    var html=topbar({base:base,title:'代理订货 · '+A.name,sub:A.acct,cats:cats,cur:cur,q:q.get('q'),simple:page==='link'});
    if(page!=='link')html+='<div class="ann" role="note"><div class="in"><span>向总盘下单，客服确认后出货</span><span>价格：进价 / 卖价 / 抽成</span><span><a href="#/agent/link" style="color:#9b1c2c">顾客链接 /a/'+esc(A.shop)+'</a></span><span><a href="#" id="lo" style="color:#7a5a50">退出</a></span></div></div>';
    html+='<main class="wrap">';
    if(page==='p')html+=agentProduct(D,A,p[1],base);
    else if(page==='cart')html+=agentCart(D,A,ck);
    else if(page==='orders')html+=agentOrders(D,A,q.get('f')||'all');
    else if(page==='link')html+=agentLink(A);
    else if(page==='done')html+='<div class="cp thx"><div class="e">✅</div><h1>已提交给总盘（客服）</h1><p>订单 <b>'+esc(p[1])+'</b> 状态：<span class="st s0">'+ST0A+'</span><br>客服人工确认有货后安排出货。</p><p><a class="btn gd" href="#/agent/orders">看我的订单</a> <a class="btn ol" href="#/agent">继续订货</a></p></div>';
    else html+=agentHome(D,A,cur,q.get('q'));
    html+='</main>'+bottomNav([{h:base,t:'订货',ic:IC.home,on:!page||page==='c'||page==='p'},{h:base+'/cart',t:'订货车',ic:IC.cart,on:page==='cart',b:cartCount(get(ck,[]))||''},{h:base+'/orders',t:'我的订单',ic:IC.ord,on:page==='orders'},{h:base+'/link',t:'顾客链接',ic:IC.link,on:page==='link'}]);
    app.innerHTML=html;bindSearch(base);bindQty(app,page==='cart'?function(i){var c=get(ck,[]);c[+i.getAttribute('data-i')].qty=+i.value;set(ck,c);route()}:null);
    var lo=document.getElementById('lo');if(lo)lo.onclick=function(e){e.preventDefault();del('sess.agent');route()};
    [].forEach.call(app.querySelectorAll('[data-add]'),function(b){b.onclick=function(){var qi=b.getAttribute('data-qf'),qq=qi?Math.max(1,parseInt(document.getElementById(qi).value,10)||1):1;var mode=b.getAttribute('data-mode')||(app.querySelector('.seg .on')||{}).value||'box';addTo(ck,b.getAttribute('data-add'),mode,qq);toast('已加入 ×'+qq);route()}});
    [].forEach.call(app.querySelectorAll('.seg button'),function(b){b.onclick=function(){if(b.disabled)return;[].forEach.call(app.querySelectorAll('.seg button'),function(x){x.classList.remove('on')});b.classList.add('on')}});
    [].forEach.call(app.querySelectorAll('[data-rm]'),function(b){b.onclick=function(){var c=get(ck,[]);c.splice(+b.getAttribute('data-rm'),1);set(ck,c);route()}});
    var sub=document.getElementById('submit');if(sub)sub.onclick=function(){var c=get(ck,[]);if(!c.length)return;var o={id:oid('A'),kind:'agent',agentAcct:A.acct,shop:A.shop,time:tnow(),status:ST0A,paid:false,memo:document.getElementById('memo').value.trim(),items:c.map(function(l){var x=D.by[l.sku],u=l.mode==='unit';return{sku:l.sku,name:x.name,pk:x.pk,mode:l.mode,qty:l.qty,a:u?x.au:x.a,s:u?x.su:x.s}})};var all=orders();all.push(o);saveOrders(all);del(ck);location.hash='#/agent/done/'+o.id};
    var cp=document.getElementById('cpl');if(cp)cp.onclick=function(){var t=document.getElementById('lkf').textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('链接已复制')},function(){toast('请长按复制')})};
  });
}
function agentLogin(){
  document.body.className='nobn';
  app.innerHTML='<div class="lc"><h1>① 代理自己订货 · 登录</h1><p>用户名 = 名字 + 电话尾号 + <b>a</b>（例：<b>阿伟0901a</b>）。<br>顾客在顾客店登录，须填姓名和完整电话。</p>'+
  '<label for="an">名字</label><input id="an" placeholder="例：阿伟"><label for="at">电话尾号（后四位）</label><input id="at" inputmode="numeric" maxlength="4" placeholder="例：0901">'+
  '<div class="un">用户名：<b id="au">—</b></div><button class="btn gd" id="ago" type="button">登录</button><button class="btn ol" id="ademo" type="button">进入示例：阿伟0901a</button><button class="btn ol" id="ademo2" type="button">进入：abc1234a</button>'+
  '<p class="or">草稿不设密码；正式版需要时再加密码。开下线、改抽成只由总盘做。</p><p class="or"><a href="#/a/阿伟0901" style="color:#9b1c2c">我是顾客 → ② 顾客下单链接</a></p></div>';
  function u(){var n=document.getElementById('an').value.trim(),t=tail4(document.getElementById('at').value);document.getElementById('au').textContent=n&&t.length===4?n+t+'a':'—';return n&&t.length===4?n+t+'a':''}
  document.getElementById('an').oninput=u;document.getElementById('at').oninput=u;
  function go(acct){var a=agentByAcct(acct);if(!a){toast('总盘还没开通这个下线');return}set('sess.agent',{acct:acct,t:tnow()});location.hash='#/agent';route()}
  document.getElementById('ago').onclick=function(){var x=u();if(!x){toast('请填名字和电话后四位');return}go(x)};
  document.getElementById('ademo').onclick=function(){go(DEMO_AGENT.acct)};
  document.getElementById('ademo2').onclick=function(){go(AGENT_ABC.acct)};
}
function agentPrices(x){return '<div class="lbl">整箱 · '+esc(x.pk)+'</div><div class="ap"><div><i>进价</i><b>'+rm(x.a)+'</b></div><div class="s"><i>卖价</i><b>'+rm(x.s)+'</b></div><div class="k"><i>抽成</i><b>'+rm(x.k)+'</b></div></div>'+(x.n?'<div class="lbl">散装 · 每件（'+x.n+'/盒）</div><div class="ap u"><div><i>进价</i><b>'+rm(x.au)+'</b></div><div class="s"><i>卖价</i><b>'+rm(x.su)+'</b></div><div class="k"><i>抽成</i><b>'+rm(x.ku)+'</b></div></div>':'<div class="lbl">散装：待确认</div>')}
function agentCard(x,base){var qid='aq-'+x.sku;return '<article class="pc"><a class="im" href="'+base+'/p/'+x.sku+'">'+img(x)+'<span class="cd2">'+x.sku+'</span>'+(x.v?'<span class="vb">▶ 视频</span>':'')+'</a><div class="b"><a href="'+base+'/p/'+x.sku+'"><h3>'+esc(x.name)+'</h3></a><div class="en">'+esc(x.en)+'</div>'+agentPrices(x)+'<div class="pcx"><div class="pcq"><span>数量</span>'+qtyBox(qid,1)+'</div><div class="pcb"><button class="add" data-add="'+x.sku+'" data-mode="box" data-qf="'+qid+'">+ 整箱</button>'+(x.n?'<button class="add o" data-add="'+x.sku+'" data-mode="unit" data-qf="'+qid+'">+ 散装</button>':'')+'</div></div></div></article>'}
function agentStats(D,A){var my=orders().filter(function(o){return o.shop===A.shop}),r={own:0,cu:0,a:0,s:0,k:0};my.forEach(function(o){var t=orderTotals(o,D);if(o.kind==='agent'){r.own++;r.a+=t.a}else{r.cu++;r.k+=t.k;r.s+=t.s}});return r}
function agentHome(D,A,cur,q){
  var list=filterItems(D,cur,q),h='';
  if(!cur&&!q){var st=agentStats(D,A);h+='<section class="hero ag"><span class="tag">① 代理自己订货 · 草稿</span><h1>你好，'+esc(A.name)+'。向总盘订货，<em>进价 · 卖价 · 抽成</em> 一目了然</h1><p>'+'抽成 = 卖价 − 进价（进价的 '+ratePct(A.rate)+'%，由总盘设定）。下单后客服人工确认，再安排出货。</p><div class="kv"><span>自己订货 <b>'+st.own+'</b> 单 · 进价 <b>'+rm(st.a)+'</b></span><span>顾客下单 <b>'+st.cu+'</b> 单 · 抽成 <b>'+rm(st.k)+'</b></span></div><div class="btns" style="margin-top:12px"><a class="btn gd" href="#/agent/orders">我的订单与抽成</a><a class="btn ol" href="#/agent/link">② 顾客下单链接</a></div></section>'}
  h+='<section class="sec"><h2>'+(q?'搜索「'+esc(q)+'」':cur?esc(catName(D,cur)):'全部产品')+' <small>'+list.length+' 款'+(cur||q?'':' ')+'</small></h2>';
  return h+(list.length?'<div class="g">'+list.map(function(x){return agentCard(x,'#/agent')}).join('')+'</div>':'<div class="empty">没有找到产品</div>')+'</section>';
}
function neighbors(D,x){var l=D.items.filter(function(i){return i.cat===x.cat}),i=l.indexOf(x);return{prev:l[i-1],next:l[i+1],rel:l.filter(function(i){return i!==x}).slice(0,10)}}
function agentProduct(D,A,sku,base){
  var x=D.by[sku];if(!x)return '<div class="empty">产品不存在。</div>';var nb=neighbors(D,x),cn=catName(D,x.cat);
  return '<nav class="bc"><a href="'+base+'">订货首页</a> › <a href="'+base+'/c/'+x.cat+'">'+esc(cn)+'</a> › <span>'+esc(x.name)+'</span></nav><article class="pd"><div class="im">'+img(x,'big')+'<span class="cd2">'+x.sku+'</span></div><div class="pi"><span class="cd2" style="position:static;display:inline-block">'+x.sku+'</span><h1>'+esc(x.name)+'</h1><p class="en" lang="en">'+esc(x.en)+'</p>'+
  '<table class="pt"><tr><th>单位</th><th>进价</th><th>卖价</th><th>抽成</th></tr><tr><td>整箱（'+esc(x.pk)+'）</td><td>'+rm(x.a)+'</td><td class="s">'+rm(x.s)+'</td><td class="k">'+rm(x.k)+'</td></tr>'+(x.n?'<tr><td>散装 / 件</td><td>'+rm(x.au)+'</td><td class="s">'+rm(x.su)+'</td><td class="k">'+rm(x.ku)+'</td></tr>':'<tr><td>散装 / 件</td><td colspan="3" class="nil" style="text-align:center">待确认（包装 '+esc(x.pk)+' 不是 N/1）</td></tr>')+'</table>'+
  '<div class="act"><div class="seg"><button type="button" class="on" value="box">整箱</button><button type="button" value="unit"'+(x.n?'':' disabled title="散装待确认"')+'>散装</button></div>'+qtyBox('pq')+'</div><div class="act"><button class="btn gd" type="button" data-add="'+x.sku+'" data-qf="pq">加入订货车</button><a class="btn ol" href="#/a/'+encodeURIComponent(A.shop)+'/p/'+x.sku+'">看顾客看到的这一款</a></div>'+
  '<p class="tip">卖价是给顾客的价；抽成由总盘设定，代理不能改。</p>'+specTable(x,cn)+'</div></article>'+videoBlock(x)+
  '<nav class="pn"><span>'+(nb.prev?'<a href="'+base+'/p/'+nb.prev.sku+'">‹ '+esc(nb.prev.name)+'</a>':'')+'</span><span>'+(nb.next?'<a href="'+base+'/p/'+nb.next.sku+'">'+esc(nb.next.name)+' ›</a>':'')+'</span></nav>'+
  (nb.rel.length?'<section class="sec"><h2>同类产品 <small>'+esc(cn)+'</small></h2><div class="g">'+nb.rel.map(function(i){return agentCard(i,base)}).join('')+'</div></section>':'');
}
function agentCart(D,A,ck){
  var c=get(ck,[]);if(!c.length)return '<div class="cp"><h1>订货车</h1><div class="empty">订货车是空的。<br><a class="btn gd" href="#/agent" style="margin-top:12px">去选产品</a></div></div>';
  var t={a:0,s:0,k:0,q:0};
  var rows=c.map(function(l,i){var x=D.by[l.sku],u=l.mode==='unit',a=(u?x.au:x.a)*l.qty,s=(u?x.su:x.s)*l.qty;t.a+=a;t.s+=s;t.k+=s-a;t.q+=l.qty;
    return '<div class="cl"><div class="t" style="'+(x.th?'background-image:url('+x.th+')':'')+'"></div><div><div class="n">'+x.sku+' '+esc(x.name)+'<small>'+(u?'散装 / 件 · 进价 '+rm(x.au)+' · 卖价 '+rm(x.su):'整箱（'+esc(x.pk)+'）· 进价 '+rm(x.a)+' · 卖价 '+rm(x.s))+'</small></div><div class="q">'+qtyBox('cq'+i,l.qty).replace('<input ','<input data-i="'+i+'" ')+'<span>进价 <b>'+rm(a)+'</b></span><span style="color:#1b7a3a">抽成 '+rm(s-a)+'</span><button class="rm" data-rm="'+i+'">删除</button></div></div></div>'}).join('');
  return '<div class="cp"><h1>订货车 · 向总盘下单</h1>'+rows+'<div class="tot"><div><i>进价合计（付总盘）</i><b>'+rm(t.a)+'</b></div><div class="s"><i>卖价合计</i><b>'+rm(t.s)+'</b></div><div class="k"><i>抽成合计</i><b>'+rm(t.k)+'</b></div></div><label for="memo" style="font-size:13px;font-weight:700">备注（选填）</label><textarea id="memo" placeholder="例：取货时间"></textarea><button class="btn gd big" id="submit" type="button" style="margin-top:10px">提交给总盘（客服）· '+t.q+' 件</button><p class="tip">提交后状态「'+ST0A+'」，客服人工确认有货后安排出货。</p></div>';
}
function agentOrders(D,A,f){
  var my=orders().filter(function(o){return o.shop===A.shop}).reverse();
  function roll(list){var r={n:list.length,q:0,a:0,s:0,k:0};list.forEach(function(o){var t=orderTotals(o,D);r.q+=t.qty;r.a+=t.a;r.s+=t.s;r.k+=t.k});return r}
  var own=my.filter(function(o){return o.kind==='agent'}),cu=my.filter(function(o){return o.kind==='cust'}),ro=roll(own),rc=roll(cu),ra=roll(my);
  var list=f==='own'?own:f==='cust'?cu:my;
  function row(t,r,cls){return '<tr'+(cls?' style="font-weight:800"':'')+'><td>'+t+'</td><td class="r">'+r.n+'</td><td class="r">'+r.q+'</td><td class="r">'+rm(r.a)+'</td><td class="r">'+rm(r.s)+'</td><td class="r" style="color:#1b7a3a">'+rm(r.k)+'</td></tr>'}
  return '<div class="cp"><h1>我的订单 · 汇总</h1><p class="tip" style="margin-top:-4px">定了多少货、多少钱、抽成多少。「自己订货」的抽成是照卖价卖出后可赚的；「顾客下单」的抽成是这些单的抽成。</p>'+
  '<div class="oc" style="padding:6px 10px"><table><tr><th>来源</th><th class="r">单数</th><th class="r">数量</th><th class="r">进价合计</th><th class="r">卖价合计</th><th class="r">抽成合计</th></tr>'+row('<span class="kind">自己订货</span>',ro)+row('<span class="kind">顾客下单</span>',rc)+row('合计',ra,1)+'</table></div>'+
  '<div class="act"><div class="seg"><button type="button" onclick="location.hash=\'#/agent/orders?f=all\'" class="'+(f==='all'?'on':'')+'">全部 '+my.length+'</button><button type="button" onclick="location.hash=\'#/agent/orders?f=own\'" class="'+(f==='own'?'on':'')+'">自己订货 '+own.length+'</button><button type="button" onclick="location.hash=\'#/agent/orders?f=cust\'" class="'+(f==='cust'?'on':'')+'">顾客下单 '+cu.length+'</button></div></div>'+
  (list.length?list.map(function(o){return orderCard(o,'agent',D)}).join(''):'<div class="empty">还没有订单。</div>')+'</div>';
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
  load('agent').then(function(D0){var D=shopOnly(D0,A.rate);
    var cs0=custSess();if(cs0){var gk='cart.shop.'+A.shop+'.guest',g=get(gk,[]);if(g.length){g.forEach(function(l){addTo('cart.shop.'+A.shop+'.'+cs0.user,l.sku,l.mode,l.qty)});del(gk)}}
    var base='#/a/'+encodeURIComponent(A.shop),cs=custSess(),ck='cart.shop.'+A.shop+'.'+(cs?cs.user:'guest'),cats=liveCats(D),cur=p[0]==='c'?p[1]:'',page=p[0]||'';
    var html=topbar({base:base,title:A.name+'的烟花店',sub:'② 顾客下单 · 示例店 · /a/'+A.shop,cats:cats,cur:cur,q:q.get('q')});
    html+='<div class="ann" role="note"><div class="in"><span>🛍️ <b>'+esc(A.name)+'的烟花店（示例）</b> · Hunter BOOM JOHOR 产品</span><span>📦 下单后客服人工确认货，再安排出货</span><span>💬 <a href="#" id="ct">联系本店代理：'+esc(A.name)+'</a></span><span>'+(cs?'👤 '+esc(cs.user)+' · <a href="#" id="clo" style="color:#7a5a50">退出</a>':'<a href="'+base+'/login" style="color:#9b1c2c">登录 / 注册</a>')+'</span></div></div><main class="wrap">';
    if(page==='p')html+=shopProduct(D,A,p[1],base);
    else if(page==='cart')html+=shopCart(D,A,ck,base,cs);
    else if(page==='login')html+=custLogin(A,base,q.get('next'));
    else if(page==='orders')html+=shopOrders(A,base,cs);
    else if(page==='done')html+='<div class="cp thx"><div class="e">🎆</div><h1>订单已提交，客服确认货后安排出货</h1><p>订单编号 <b>'+esc(p[1])+'</b><br>状态：<span class="st s0">'+ST0C+'</span></p><p><a class="btn gd" href="'+base+'/orders">查看我的订单</a> <a class="btn ol" href="'+base+'">继续逛</a></p></div>';
    else html+=shopHome(D,A,cur,q.get('q'),base);
    html+='</main><footer><div class="in"><div><h2>'+esc(A.name)+'的烟花店（示例）</h2><p>Hunter BOOM JOHOR 产品。价格为卖价；最终数量与出货由客服人工确认。</p></div><div><h3>联系</h3><p>联系本店代理：'+esc(A.name)+'（联系方式待代理填写）</p></div><div><h3>分类</h3><p class="cats">'+cats.map(function(c){return '<a href="'+base+'/c/'+c.id+'">'+esc(c.name)+'</a>'}).join('')+'</p></div><p class="legal">燃放烟花请遵守当地法律法规。本页为草稿示例。</p></div></footer>';
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
    var co=document.getElementById('co');if(co)co.onclick=function(){
      var f={name:document.getElementById('fn').value.trim(),phone:document.getElementById('fp').value.trim(),addr:document.getElementById('fa').value.trim(),memo:document.getElementById('fm').value.trim()},ok=document.getElementById('fc').checked;
      var bad=[];if(!f.name)bad.push('姓名');if(!isFullPhone(f.phone))bad.push('电话');if(!f.addr)bad.push('收货地址');
      ['fn','fp','fa'].forEach(function(id){document.getElementById(id).style.borderColor=''});
      if(bad.length){bad.forEach(function(b){document.getElementById({'姓名':'fn','电话':'fp','收货地址':'fa'}[b]).style.borderColor='#9b1c2c'});toast('请填好：'+bad.join('、'));return}
      if(!ok){toast('请勾选确认资料正确');return}
      var c=get(ck,[]);if(!c.length)return;
      var prof=get('prof.'+cs.user,{});prof.name=f.name;prof.phone=f.phone;prof.addr=f.addr;set('prof.'+cs.user,prof);
      var o={id:oid('C'),kind:'cust',shop:A.shop,agentAcct:A.acct,time:tnow(),status:ST0C,paid:false,cust:{user:cs.user,name:f.name,phone:f.phone,addr:f.addr,memo:f.memo},items:c.map(function(l){var x=D.by[l.sku],u=l.mode==='unit';return{sku:l.sku,name:x.name,pk:x.pk,mode:l.mode,qty:l.qty,s:u?x.su:x.s}})};
      var all=orders();all.push(o);saveOrders(all);del(ck);location.hash=base+'/done/'+o.id};
  });
}
function shopPrice(x){return '<div class="row"><span class="pr"><small>RM</small>'+rm(x.s).slice(2)+'</span><span class="pk">/整盒 '+esc(x.pk)+'</span></div>'+(x.su!=null?'<div class="row"><span class="pr" style="font-size:14px"><small>RM</small>'+rm(x.su).slice(2)+'</span><span class="pk">/件 散装</span></div>':'<div class="pk" style="margin-top:2px">此款只按整盒卖</div>')}
function shopCard(x,base){var qid='cq-'+x.sku;return '<article class="pc"><a class="im" href="'+base+'/p/'+x.sku+'">'+img(x)+'<span class="cd2">'+x.sku+'</span>'+(x.v?'<span class="vb">▶ 视频</span>':'')+'</a><div class="b"><a href="'+base+'/p/'+x.sku+'"><h3>'+esc(x.name)+'</h3></a><div class="en">'+esc(x.en)+'</div>'+shopPrice(x)+'<div class="pcx"><div class="pcq"><span>数量</span>'+qtyBox(qid,1)+'</div><div class="pcb"><button class="add" data-add="'+x.sku+'" data-mode="box" data-qf="'+qid+'">+ 整盒</button>'+(x.su!=null?'<button class="add o" data-add="'+x.sku+'" data-mode="unit" data-qf="'+qid+'">+ 散装</button>':'')+'</div></div></div></article>'}
function shopHome(D,A,cur,q,base){
  var list=filterItems(D,cur,q),h='';
  if(!cur&&!q)h+='<section class="hero"><span class="tag">示例店 · 草稿</span><h1>'+esc(A.name)+'的烟花店 <em>年货烟花</em></h1><p>完整产品图和视频，价格就是卖价。登录须填姓名和完整电话，下单再填收货地址；每款可选整盒或散装（能算散装的才有）。客服确认货后安排出货。</p><div class="btns"><a class="btn gd" href="'+base+'/c/'+(D.cats[0]||{}).id+'">开始选购</a>'+(custSess()?'':'<a class="btn ol" href="'+base+'/login">登录 / 注册</a>')+'</div></section><div class="ic">'+liveCats(D).map(function(c){return '<a href="'+base+'/c/'+c.id+'"><span>'+c.icon+'</span>'+esc(c.name)+'</a>'}).join('')+'</div>';
  h+='<section class="sec"><h2>'+(q?'搜索「'+esc(q)+'」':cur?esc(catName(D,cur)):'全部产品')+' <small>'+list.length+' 款</small></h2>';
  return h+(list.length?'<div class="g">'+list.map(function(x){return shopCard(x,base)}).join('')+'</div>':'<div class="empty">没有找到产品</div>')+'</section>';
}
function shopProduct(D,A,sku,base){
  var x=D.by[sku];if(!x)return '<div class="empty">产品不存在。</div>';var nb=neighbors(D,x),cn=catName(D,x.cat);
  return '<nav class="bc"><a href="'+base+'">首页</a> › <a href="'+base+'/c/'+x.cat+'">'+esc(cn)+'</a> › <span>'+esc(x.name)+'</span></nav><article class="pd"><div class="im">'+img(x,'big')+'<span class="cd2">'+x.sku+'</span></div><div class="pi"><span class="cd2" style="position:static;display:inline-block">'+x.sku+'</span><h1>'+esc(x.name)+'</h1><p class="en" lang="en">'+esc(x.en)+'</p>'+
  '<div class="pr">'+rm(x.s)+' <small style="font-size:13px;color:#7a5a50;font-weight:600">/ 整盒（'+esc(x.pk)+'）</small></div>'+(x.su!=null?'<div class="pr" style="font-size:20px">'+rm(x.su)+' <small style="font-size:13px;color:#7a5a50;font-weight:600">/ 件 散装</small></div>':'<p class="tip">此款只按整盒卖，暂无散装价。</p>')+
  '<div class="act"><div class="seg"><button type="button" class="on" value="box">整盒</button>'+(x.su!=null?'<button type="button" value="unit">散装</button>':'<button type="button" value="unit" disabled title="此款暂无散装价">散装</button>')+'</div>'+qtyBox('pq')+'</div><div class="act"><button class="btn gd" type="button" data-add="'+x.sku+'" data-qf="pq">加入购物车</button><a class="btn ol" href="'+base+'/cart">去结算</a></div>'+
  '<p class="note">下单后客服人工确认货，再安排出货。有问题请联系本店代理 '+esc(A.name)+'。</p>'+specTable(x,cn).replace(/<tr><th>一盒件数<\/th><td><span class="nil">[^<]*<\/span><\/td><\/tr>/,'')+'</div></article>'+videoBlock(x)+
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
  '<div class="lc" style="margin:6px 0;max-width:none;box-shadow:none"><label for="fn">姓名 *</label><input id="fn" value="'+esc(pr.name||cs.name||'')+'" required><label for="fp">电话 *</label><input id="fp" type="tel" inputmode="tel" value="'+esc(pr.phone||cs.phone||'')+'" placeholder="完整电话号码" required><label for="fa">收货地址 *</label><textarea id="fa" required placeholder="门牌、路名、区、邮编、城市">'+esc(pr.addr||'')+'</textarea><label for="fm">备注（选填）</label><textarea id="fm" placeholder="例：方便收货时间"></textarea>'+
  '<label style="display:flex;gap:8px;align-items:flex-start;font-weight:600"><input id="fc" type="checkbox" style="width:auto;margin-top:4px"> 我确认以上姓名、电话、收货地址正确'+(pr.addr?'（已带出上次资料，请再核对）':'')+'</label></div>'+
  '<button class="btn gd big" id="co" type="button">提交订单 · '+rm(t)+'</button><p class="tip">登录：'+esc(cs.user)+' · 订单记在代理 '+esc(A.name)+' 名下，送客服人工确认后安排出货。</p></div>';
}
function shopOrders(A,base,cs){
  if(!cs)return '<div class="lc"><h1>我的订单</h1><p>请先登录查看订单。</p><a class="btn gd" href="'+base+'/login?next=orders">登录</a></div>';
  var my=orders().filter(function(o){return o.kind==='cust'&&o.shop===A.shop&&o.cust.user===cs.user}).reverse();
  return '<div class="cp"><h1>我的订单 · '+esc(cs.name||cs.user)+'</h1>'+(my.length?my.map(function(o){return orderCard(o,'cust',null)}).join(''):'<div class="empty">还没有订单。</div>')+'</div>';
}

route();
})();
