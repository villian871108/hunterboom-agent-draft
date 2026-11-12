/* Hunter BOOM JOHOR 总盘 / 代理 / 顾客 —— 草稿（本地 localStorage，无真实安全） */
(function(){
'use strict';
var DEMO_AGENT={name:'阿伟',tail:'0901',acct:'阿伟0901a',shop:'阿伟0901'};
var AGENT_ABC={name:'abc',tail:'1234',acct:'abc1234a',shop:'abc1234'};
var AGENTS=[DEMO_AGENT,AGENT_ABC];      // 草稿示例代理；开下线只由总盘做
var DEMO_CUST={name:'丽芬',tail:'1688'};
var LS='hbd.';
var app=document.getElementById('app');
var LOGO='<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#fff3d0"/><g stroke="#c8161d" stroke-width="3.4" stroke-linecap="round"><path d="M32 8v12M32 44v12M8 32h12M44 32h12M15 15l8.5 8.5M40.5 40.5L49 49M49 15l-8.5 8.5M23.5 40.5L15 49"/></g><circle cx="32" cy="32" r="6.5" fill="#f6b52e"/></svg>';
var PHSVG='<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#ffe4a8" stroke-width="3" stroke-linecap="round" fill="none"><path d="M32 8v12M32 44v12M8 32h12M44 32h12M15 15l8.5 8.5M40.5 40.5L49 49M49 15l-8.5 8.5M23.5 40.5L15 49"/></g><circle cx="32" cy="32" r="6" fill="#f6c453"/></svg>';

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
function agentByShop(s){for(var i=0;i<AGENTS.length;i++)if(AGENTS[i].shop===s)return AGENTS[i];return null}

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
function modeTxt(it){return it.mode==='unit'?'散装（件）':'整箱（'+esc(it.pk)+'）'}

/* ---------- 预览条 ---------- */
document.getElementById('reset').onclick=function(){if(!confirm('清空草稿里的示例订单、购物车和登录？'))return;Object.keys(localStorage).forEach(function(k){if(k.indexOf(LS)===0)localStorage.removeItem(k)});toast('已重置');route()};
function markPv(r){[].forEach.call(document.querySelectorAll('#pv a'),function(a){a.classList.toggle('on',a.getAttribute('data-r')===r)})}

/* ---------- router ---------- */
window.addEventListener('hashchange',route);
function parts(){var h=decodeURIComponent(location.hash.replace(/^#\/?/,''));var q='';var i=h.indexOf('?');if(i>=0){q=h.slice(i+1);h=h.slice(0,i)}return{p:h.split('/').filter(Boolean),q:new URLSearchParams(q)}}
function route(){
  var r=parts(),p=r.p;document.body.className='';
  window.scrollTo(0,0);
  if(!p.length){markPv('home');return home()}
  if(p[0]==='master'){markPv('master');return master(p[1]||'data')}
  if(p[0]==='agent'){markPv('agent');return agent(p.slice(1),r.q)}
  if(p[0]==='a'&&p[1]){markPv('shop');return shop(p[1],p.slice(2),r.q)}
  app.innerHTML='<div class="empty">找不到页面。<a href="#/">回说明页</a></div>';
}

/* ======================= 说明页 ======================= */
function home(){
  document.body.className='nobn';
  app.innerHTML='<div class="land"><h1>Hunter BOOM JOHOR · 总盘与下线代理（草稿）</h1>'+
  '<p>这是给老板看的草稿，三个入口可在顶部黑条随时切换。数据来自 2026 价目表（260 款），订单只存在这台浏览器（localStorage），不连真实系统。</p>'+
  '<div class="rc">'+
  '<a href="#/master"><span class="e">📊</span><b>总盘（永）</b>只看数据，不是店面。<ul><li>260 款总盘箱价、代理进价、卖价、抽成</li><li>散装三列（能算的才显示）</li><li>待确认订单：确认 → 安排出货</li></ul></a>'+
  '<a href="#/agent"><span class="e">🧾</span><b>① 代理自己订货</b>登录用户名：<b style="display:inline;font-size:15px">阿伟0901a</b><ul><li>名字 + 电话尾号 + <b style="display:inline;font-size:13px">a</b></li><li>完整产品资料，看进价 / 卖价 / 抽成</li><li>向总盘下单；「我的订单」看订了多少货、多少钱、抽成多少（含顾客下单）</li></ul></a>'+
  '<a href="#/a/阿伟0901"><span class="e">🛍️</span><b>② 顾客下单链接</b>链接：<b style="display:inline;font-size:15px">/a/阿伟0901</b>（没有 a）<ul><li>只显示卖价，看不到总盘、进价、抽成</li><li>顾客用 名字+电话尾号 登录，例：丽芬1688</li><li>下单必填 姓名、电话、收货地址，单挂在阿伟名下</li></ul></a>'+
  '</div><div class="rule"><b>价钱规则（按你定的）：</b> 代理进价 = 总盘 × 1.25；卖价 = 代理进价 × 1.40；抽成 = 卖价 − 代理进价（即进价的 40%）。散装：只有包装 N/1 才算，总盘单件 = 箱价 ÷ N，再按同样规则；其他包装散装留空。金额四舍五入到 RM0.01。<br>例：HB001 8尺红炮（40/1）总盘 RM200 → 进价 RM250 · 卖价 RM350 · 抽成 RM100；散装 进价 RM6.25 · 卖价 RM8.75 · 抽成 RM2.50。</div>'+
  '<div class="rule"><b>登录规则：</b> 代理自己订货 = 名字 + 电话尾号 + <code>a</code>（<code>阿伟0901a</code>）。不带 a 的是顾客那一边：代理的顾客链接 <code>/a/阿伟0901</code>，顾客自己登录 <code>丽芬1688</code>。草稿里登录不设密码，只为看流程。</div></div>';
}

/* ======================= 总盘 ======================= */
function master(tab){
  document.body.className='mst nobn';
  load('master').then(function(D){
    var os=orders(),pend=os.filter(function(o){return o.status!==ST2}).length;
    var head='<header class="mh"><div class="in"><h1>Hunter BOOM JOHOR 总盘<small>永 · 只看数据 · 草稿</small></h1><nav><a href="#/master" class="'+(tab==='data'?'on':'')+'">价目数据</a><a href="#/master/orders" class="'+(tab==='orders'?'on':'')+'">待确认订单'+(pend?'（'+pend+'）':'')+'</a><a href="#/master/agents" class="'+(tab==='agents'?'on':'')+'">代理名单</a></nav></div></header>';
    if(tab==='orders')return masterOrders(D,head);
    if(tab==='agents')return masterAgents(head);
    var it=D.items,off=it.filter(function(x){return !x.live}).length,ready=it.filter(function(x){return x.n}).length;
    var cat={};D.cats.forEach(function(c){cat[c.id]=c.name});
    app.innerHTML=head+'<main class="mw"><div class="kp"><div><b>'+it.length+'</b>款（价目表）</div><div><b>'+(it.length-off)+'</b>在售</div><div class="x"><b>'+off+'</b>下架（熊炮 HB133–HB139）</div><div><b>'+ready+'</b>散装可算（N/1）</div><div class="w"><b>'+(it.length-ready)+'</b>散装待确认</div><div><b>'+os.length+'</b>订单（草稿）</div></div>'+
    '<div class="fl"><input id="mq" type="search" placeholder="搜编号 / 中文名 / 英文名 / 包装"><select id="mc"><option value="">全部分类</option>'+D.cats.map(function(c){return '<option value="'+c.id+'">'+esc(c.name)+'</option>'}).join('')+'</select><select id="ms"><option value="">全部状态</option><option value="on">在售</option><option value="off">下架</option></select><select id="ml"><option value="">散装：全部</option><option value="y">散装可算</option><option value="n">散装待确认</option></select><button id="mx" type="button">导出 CSV</button><span class="n" id="mn"></span></div>'+
    '<div class="tw"><table class="dt"><thead><tr><th>编号</th><th>分类</th><th>中文名</th><th>英文名</th><th>包装</th><th class="r g1">总盘箱价</th><th class="r">一盒件数</th><th class="r">总盘单件</th><th class="r g1">代理进价(箱)</th><th class="r g1">卖价(箱)</th><th class="r g1">抽成(箱)</th><th class="r g2">散装进价</th><th class="r g2">散装卖价</th><th class="r g2">散装抽成</th><th>状态</th></tr></thead><tbody id="mb"></tbody></table></div>'+
    '<p class="ms-note">来源：'+esc(D.source)+'。总盘箱价 = 价目表箱价，包装照原表。散装只在包装为 N/1 时计算；其他包装留空（不当 0）。</p></main>';
    var rows=it.map(function(x){return{x:x,s:(x.sku+' '+x.name+' '+x.en+' '+x.pk+' '+cat[x.cat]).toLowerCase(),h:'<tr class="'+(x.live?'':'off')+'"><td class="b">'+x.sku+'</td><td>'+esc(cat[x.cat])+'</td><td class="nm">'+esc(x.name)+'</td><td class="en">'+esc(x.en)+'</td><td>'+esc(x.pk)+'</td><td class="r b">'+rm(x.c)+'</td><td class="r">'+(x.n||'<span class="nil">—</span>')+'</td><td class="r">'+(x.u?'RM'+x.u:'<span class="nil">—</span>')+'</td><td class="r">'+rm(x.a)+'</td><td class="r">'+rm(x.s)+'</td><td class="r">'+rm(x.k)+'</td><td class="r">'+rmx(x.au)+'</td><td class="r">'+rmx(x.su)+'</td><td class="r">'+rmx(x.ku)+'</td><td>'+(x.live?'<span class="tg on">在售</span>':'<span class="tg off">下架</span>')+(x.n?'':' <span class="tg pd">散装待确认</span>')+'</td></tr>'}});
    var tb=document.getElementById('mb');
    function draw(){var q=document.getElementById('mq').value.trim().toLowerCase(),c=document.getElementById('mc').value,s=document.getElementById('ms').value,l=document.getElementById('ml').value;
      var f=rows.filter(function(r){var x=r.x;return(!q||r.s.indexOf(q)>=0)&&(!c||x.cat===c)&&(!s||(s==='on')===x.live)&&(!l||(l==='y')===!!x.n)});
      tb.innerHTML=f.map(function(r){return r.h}).join('')||'<tr><td colspan="15" class="muted">没有符合的产品</td></tr>';document.getElementById('mn').textContent='显示 '+f.length+' / '+rows.length;return f}
    ['mq','mc','ms','ml'].forEach(function(id){document.getElementById(id).addEventListener('input',draw)});draw();
    document.getElementById('mx').onclick=function(){var f=draw(),c=function(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v},m=function(v){return v==null?'':(v/100).toFixed(2)};
      var L=[['编号','分类','中文名','英文名','包装','总盘箱价','一盒件数','总盘单件','代理进价箱','卖价箱','抽成箱','散装进价','散装卖价','散装抽成','状态']].concat(f.map(function(r){var x=r.x;return[x.sku,cat[x.cat],x.name,x.en,x.pk,m(x.c),x.n||'',x.u||'',m(x.a),m(x.s),m(x.k),m(x.au),m(x.su),m(x.ku),x.live?'在售':'下架']}));
      var b=new Blob(['\ufeff'+L.map(function(r){return r.map(c).join(',')}).join('\n')],{type:'text/csv'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='总盘_草稿导出.csv';a.click()};
  });
}
function masterAgents(head){
  app.innerHTML=head+'<main class="mw"><div class="oc"><div class="h"><b>代理名单（草稿）</b><span class="t">开下线只由总盘做；代理不能自己开下线或改抽成</span></div><table><tr><th>代理</th><th>自己订货登录</th><th>顾客下单链接</th><th>抽成</th></tr>'+AGENTS.map(function(a){return '<tr><td>'+esc(a.name)+'（尾号 '+a.tail+'）</td><td><b>'+esc(a.acct)+'</b></td><td><a href="#/a/'+encodeURIComponent(a.shop)+'" style="color:#1a56c4">/a/'+esc(a.shop)+'</a></td><td>卖价 − 进价（进价 × 40%）</td></tr>'}).join('')+'</table><p class="ms-note">用户名规则：代理自己订货 = 名字 + 电话尾号 + a；不带 a 的是顾客店面链接和顾客账号。正式版「新增代理」按钮放这里（草稿未做）。</p></div></main>';
}
function masterOrders(D,head){
  var os=orders().slice().reverse(),f=get('mof','open');
  var list=os.filter(function(o){return f==='all'||o.status!==ST2});
  app.innerHTML=head+'<main class="mw"><div class="fl"><button type="button" data-f="open" style="'+(f==='open'?'background:#222;color:#fff':'')+'">未出货（'+os.filter(function(o){return o.status!==ST2}).length+'）</button><button type="button" data-f="all" style="'+(f==='all'?'background:#222;color:#fff':'')+'">全部（'+os.length+'）</button><span class="n">总盘同时是客服：确认有货 → 安排出货，全部人工操作。</span></div>'+
  (list.length?list.map(function(o){return orderCard(o,'master',D)}).join(''):'<div class="oc empty">还没有订单。去「① 代理自己订货」或「② 顾客下单链接」下一张示例单。</div>')+'</main>';
  [].forEach.call(app.querySelectorAll('[data-f]'),function(b){b.onclick=function(){set('mof',b.getAttribute('data-f'));route()}});
  [].forEach.call(app.querySelectorAll('[data-st]'),function(b){b.onclick=function(){var all=orders();all.forEach(function(o){if(o.id===b.getAttribute('data-id')){o.status=b.getAttribute('data-st');(o.log=o.log||[]).push({t:tnow(),s:o.status})}});saveOrders(all);toast('已更新：'+b.getAttribute('data-st'));route()}});
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
  var h='<div class="oc"><div class="h"><b>'+o.id+'</b>'+(view==='cust'?'':src)+'<span class="st '+stc(o.status)+'">'+esc(o.status)+'</span><span class="t">'+tfmt(o.time)+'</span></div>';
  if(view!=='cust')h+='<div class="t muted" style="font-size:12.5px">'+who+'</div>';
  if(o.kind==='cust'&&view!=='agent-lite')h+='<div class="note">📦 收货：<b>'+esc(o.cust.name)+'</b> · '+esc(o.cust.phone)+'<br>'+esc(o.cust.addr)+(o.cust.memo?'<br>备注：'+esc(o.cust.memo):'')+'</div>';
  if(o.kind==='agent'&&o.memo)h+='<div class="note">备注：'+esc(o.memo)+'</div>';
  h+='<table><tr><th>产品</th><th class="r">数量</th>'+(showCost?'<th class="r">进价</th>':'')+'<th class="r">卖价</th>'+(showCost?'<th class="r">抽成</th>':'')+'</tr>'+rows+'</table>';
  h+='<div class="sum"><span>数量 <b>'+t.qty+'</b></span>'+(showCost?'<span>进价合计 <b>'+rm(t.a)+'</b></span>':'')+'<span>'+(view==='cust'?'订单金额':'卖价合计')+' <b style="color:#c8161d">'+rm(t.s)+'</b></span>'+(showCost?'<span>抽成合计 <b style="color:#1b7a3a">'+rm(t.k)+'</b></span>':'')+'</div>';
  if(view==='master'){h+='<div class="ops">'+(o.status!==ST1&&o.status!==ST2?'<button data-st="'+ST1+'" data-id="'+o.id+'">✓ 已确认有货</button>':'')+(o.status!==ST2?'<button class="o" data-st="'+ST2+'" data-id="'+o.id+'">🚚 安排出货</button>':'<span class="muted" style="font-size:12.5px">已安排出货</span>')+'</div>'}
  if(view==='cust')h+='<p class="tip">'+(o.status===ST2?'客服已安排出货。':o.status===ST1?'客服已确认有货，稍后安排出货。':'订单已提交，客服确认货后安排出货。')+'</p>';
  return h+'</div>';
}

/* ======================= 共用：店面框架 ======================= */
function topbar(o){ // o: {home,title,sub,cats,base,q,cur}
  return '<header class="top"><div class="in"><a class="lg" href="'+o.base+'">'+LOGO+'<span class="wm"><b>'+esc(o.title)+'</b><small>'+esc(o.sub)+'</small></span></a>'+
  '<form class="sb" role="search" id="sf"><label class="sr" for="q">搜索产品</label><input id="q" type="search" value="'+esc(o.q||'')+'" placeholder="搜索名称或编号，如 HB001、红炮" autocomplete="off"><button type="submit">搜索</button></form>'+
  '<nav class="tabs" aria-label="产品分类"><a href="'+o.base+'" class="'+(!o.cur?'on':'')+'">全部</a>'+o.cats.map(function(c){return '<a href="'+o.base+'/c/'+c.id+'" class="'+(o.cur===c.id?'on':'')+'">'+esc(c.name)+'</a>'}).join('')+'</nav></div></header>';
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
function agentSess(){return get('sess.agent',null)}
function agent(p,q){
  var s=agentSess();
  if(!s||p[0]==='login')return agentLogin();
  var A=AGENTS.filter(function(a){return a.acct===s.acct})[0];
  load('agent').then(function(D){
    var base='#/agent',ck='cart.agent.'+A.acct,cats=liveCats(D),cur=p[0]==='c'?p[1]:'';
    var html=topbar({base:base,title:'代理订货 · '+A.name,sub:'① 代理自己订货 · '+A.acct+' · 草稿',cats:cats,cur:cur,q:q.get('q')});
    html+='<div class="ann" role="note"><div class="in"><span>🧾 <b>代理自己订货</b>：向总盘下单，客服人工确认后出货</span><span>💰 价格显示 进价 / 卖价 / 抽成</span><span>🔗 顾客下单请用 <a href="#/agent/link" style="color:#c8161d">你的顾客链接 /a/'+esc(A.shop)+'</a></span><span><a href="#" id="lo" style="color:#8a5a4a">退出登录</a></span></div></div><main class="wrap">';
    var page=p[0]||'';
    if(page==='p')html+=agentProduct(D,A,p[1],base);
    else if(page==='cart')html+=agentCart(D,A,ck);
    else if(page==='orders')html+=agentOrders(D,A,q.get('f')||'all');
    else if(page==='link')html+=agentLink(A);
    else if(page==='done')html+='<div class="cp thx"><div class="e">✅</div><h1>已提交给总盘（客服）</h1><p>订单 <b>'+esc(p[1])+'</b> 状态：<span class="st s0">'+ST0A+'</span><br>客服人工确认有货后安排出货。</p><p><a class="btn gd" href="#/agent/orders">看我的订单</a> <a class="btn ol" href="#/agent">继续订货</a></p></div>';
    else html+=agentHome(D,A,cur,q.get('q'));
    html+='</main>'+bottomNav([{h:base,t:'订货',ic:IC.home,on:!page||page==='c'||page==='p'},{h:base+'/cart',t:'订货车',ic:IC.cart,on:page==='cart',b:cartCount(get(ck,[]))||''},{h:base+'/orders',t:'我的订单',ic:IC.ord,on:page==='orders'},{h:base+'/link',t:'顾客链接',ic:IC.link,on:page==='link'}]);
    app.innerHTML=html;bindSearch(base);bindQty(app,page==='cart'?function(i){var c=get(ck,[]);c[+i.getAttribute('data-i')].qty=+i.value;set(ck,c);route()}:null);
    document.getElementById('lo').onclick=function(e){e.preventDefault();del('sess.agent');route()};
    [].forEach.call(app.querySelectorAll('[data-add]'),function(b){b.onclick=function(){var qi=b.getAttribute('data-qf'),qq=qi?Math.max(1,parseInt(document.getElementById(qi).value,10)||1):1;var mode=b.getAttribute('data-mode')||(app.querySelector('.seg .on')||{}).value||'box';addTo(ck,b.getAttribute('data-add'),mode,qq);toast('已加入订货车');route()}});
    [].forEach.call(app.querySelectorAll('.seg button'),function(b){b.onclick=function(){if(b.disabled)return;[].forEach.call(app.querySelectorAll('.seg button'),function(x){x.classList.remove('on')});b.classList.add('on')}});
    [].forEach.call(app.querySelectorAll('[data-rm]'),function(b){b.onclick=function(){var c=get(ck,[]);c.splice(+b.getAttribute('data-rm'),1);set(ck,c);route()}});
    var sub=document.getElementById('submit');if(sub)sub.onclick=function(){var c=get(ck,[]);if(!c.length)return;var o={id:oid('A'),kind:'agent',agentAcct:A.acct,shop:A.shop,time:tnow(),status:ST0A,memo:document.getElementById('memo').value.trim(),items:c.map(function(l){var x=D.by[l.sku],u=l.mode==='unit';return{sku:l.sku,name:x.name,pk:x.pk,mode:l.mode,qty:l.qty,a:u?x.au:x.a,s:u?x.su:x.s}})};var all=orders();all.push(o);saveOrders(all);del(ck);location.hash='#/agent/done/'+o.id};
    var cp=document.getElementById('cpl');if(cp)cp.onclick=function(){var t=document.getElementById('lkf').textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('链接已复制')},function(){toast('请长按复制')})};
  });
}
function agentLogin(){
  document.body.className='nobn';
  app.innerHTML='<div class="lc"><h1>① 代理自己订货 · 登录</h1><p>用户名 = 名字 + 电话尾号 + <b>a</b>（例：<b>阿伟0901a</b>）。<br>不带 a 的是顾客那边（顾客链接 /a/阿伟0901、顾客账号 丽芬1688）。</p>'+
  '<label for="an">名字</label><input id="an" placeholder="例：阿伟"><label for="at">电话尾号（后四位）</label><input id="at" inputmode="numeric" maxlength="4" placeholder="例：0901">'+
  '<div class="un">用户名：<b id="au">—</b></div><button class="btn gd" id="ago" type="button">登录</button><button class="btn ol" id="ademo" type="button">进入示例：阿伟0901a</button><button class="btn ol" id="ademo2" type="button">进入：abc1234a</button>'+
  '<p class="or">草稿不设密码；正式版需要时再加密码。开下线、改抽成只由总盘做。</p><p class="or"><a href="#/a/阿伟0901" style="color:#c8161d">我是顾客 → ② 顾客下单链接</a></p></div>';
  function u(){var n=document.getElementById('an').value.trim(),t=tail4(document.getElementById('at').value);document.getElementById('au').textContent=n&&t.length===4?n+t+'a':'—';return n&&t.length===4?n+t+'a':''}
  document.getElementById('an').oninput=u;document.getElementById('at').oninput=u;
  function go(acct){var a=AGENTS.filter(function(x){return x.acct===acct})[0];if(!a){toast('草稿目前开放：阿伟0901a、abc1234a');return}set('sess.agent',{acct:acct,t:tnow()});location.hash='#/agent';route()}
  document.getElementById('ago').onclick=function(){var x=u();if(!x){toast('请填名字和电话后四位');return}go(x)};
  document.getElementById('ademo').onclick=function(){go(DEMO_AGENT.acct)};
  document.getElementById('ademo2').onclick=function(){go(AGENT_ABC.acct)};
}
function agentPrices(x){return '<div class="lbl">整箱 · '+esc(x.pk)+'</div><div class="ap"><div><i>进价</i><b>'+rm(x.a)+'</b></div><div class="s"><i>卖价</i><b>'+rm(x.s)+'</b></div><div class="k"><i>抽成</i><b>'+rm(x.k)+'</b></div></div>'+(x.n?'<div class="lbl">散装 · 每件（'+x.n+'/盒）</div><div class="ap u"><div><i>进价</i><b>'+rm(x.au)+'</b></div><div class="s"><i>卖价</i><b>'+rm(x.su)+'</b></div><div class="k"><i>抽成</i><b>'+rm(x.ku)+'</b></div></div>':'<div class="lbl">散装：待确认</div>')}
function agentCard(x,base){return '<article class="pc"><a class="im" href="'+base+'/p/'+x.sku+'">'+img(x)+'<span class="cd2">'+x.sku+'</span>'+(x.v?'<span class="vb">▶ 视频</span>':'')+'</a><div class="b"><a href="'+base+'/p/'+x.sku+'"><h3>'+esc(x.name)+'</h3></a><div class="en">'+esc(x.en)+'</div>'+agentPrices(x)+'<div class="pcx"><button class="add" data-add="'+x.sku+'" data-mode="box">+ 整箱</button>'+(x.n?'<button class="add o" data-add="'+x.sku+'" data-mode="unit">+ 散装</button>':'')+'</div></div></article>'}
function agentStats(D,A){var my=orders().filter(function(o){return o.shop===A.shop}),r={own:0,cu:0,a:0,s:0,k:0};my.forEach(function(o){var t=orderTotals(o,D);if(o.kind==='agent'){r.own++;r.a+=t.a}else{r.cu++;r.k+=t.k;r.s+=t.s}});return r}
function agentHome(D,A,cur,q){
  var list=filterItems(D,cur,q),h='';
  if(!cur&&!q){var st=agentStats(D,A);h+='<section class="hero ag"><span class="tag">① 代理自己订货 · 草稿</span><h1>你好，'+esc(A.name)+'。向总盘订货，<em>进价 · 卖价 · 抽成</em> 一目了然</h1><p>抽成 = 卖价 − 进价（进价的 40%），由总盘设定。下单后客服人工确认，再安排出货。</p><div class="kv"><span>自己订货 <b>'+st.own+'</b> 单 · 进价 <b>'+rm(st.a)+'</b></span><span>顾客下单 <b>'+st.cu+'</b> 单 · 抽成 <b>'+rm(st.k)+'</b></span></div><div class="btns" style="margin-top:12px"><a class="btn gd" href="#/agent/orders">我的订单与抽成</a><a class="btn ol" href="#/agent/link">② 顾客下单链接</a></div></section>'}
  h+='<section class="sec"><h2>'+(q?'搜索「'+esc(q)+'」':cur?esc(catName(D,cur)):'全部产品')+' <small>'+list.length+' 款'+(cur||q?'':' · 熊炮系列已下架不显示')+'</small></h2>';
  return h+(list.length?'<div class="g">'+list.map(function(x){return agentCard(x,'#/agent')}).join('')+'</div>':'<div class="empty">没有找到产品</div>')+'</section>';
}
function neighbors(D,x){var l=D.items.filter(function(i){return i.cat===x.cat}),i=l.indexOf(x);return{prev:l[i-1],next:l[i+1],rel:l.filter(function(i){return i!==x}).slice(0,10)}}
function agentProduct(D,A,sku,base){
  var x=D.by[sku];if(!x)return '<div class="empty">产品不存在或已下架。</div>';var nb=neighbors(D,x),cn=catName(D,x.cat);
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
  return '<div class="cp"><h1>② 顾客下单链接</h1><p>把这个链接发给你的顾客。顾客打开就是「'+esc(A.name)+'的烟花店」，只看到卖价；他们下的单会记在你名下，你在「我的订单」看得到抽成。</p>'+
  '<div style="font-size:13px;font-weight:700">正式版链接样子</div><div class="lk">/a/'+esc(A.shop)+'</div><div style="font-size:13px;font-weight:700">草稿预览链接</div><div class="lk" id="lkf">'+esc(full)+'</div>'+
  '<div class="act"><button class="btn ol" id="cpl" type="button">复制链接</button><a class="btn gd" href="#/a/'+encodeURIComponent(A.shop)+'">打开顾客看到的店</a></div>'+
  '<div class="two"><div class="y"><b>顾客看得到</b><ul><li>完整产品图、视频、分类、包装</li><li>卖价（整箱；散装能算的才显示）</li><li>自己的订单和状态</li></ul></div><div class="n"><b>顾客看不到</b><ul><li>总盘价、代理进价</li><li>抽成</li><li>别的顾客的订单</li></ul></div></div>'+
  '<p class="tip">链接 /a/'+esc(A.shop)+' 没有 a；你自己订货登录用 '+esc(A.acct)+'。顾客下单要填 姓名、电话、收货地址，免得出货搞混。</p></div>';
}

/* ======================= ② 顾客下单链接 ======================= */
function custSess(){return get('sess.cust',null)}
function shop(slug,p,q){
  var A=agentByShop(slug);
  if(!A){app.innerHTML='<div class="lc"><h1>找不到这家店</h1><p>链接 /a/'+esc(slug)+' 不是有效的代理店铺。'+(/a$/.test(slug)?'（顾客链接没有 a，例：/a/阿伟0901）':'')+'</p><a class="btn gd" href="#/a/阿伟0901">打开示例店 /a/阿伟0901</a></div>';document.body.className='nobn';return}
  load('shop').then(function(D){
    var cs0=custSess();if(cs0){var gk='cart.shop.'+A.shop+'.guest',g=get(gk,[]);if(g.length){g.forEach(function(l){addTo('cart.shop.'+A.shop+'.'+cs0.user,l.sku,l.mode,l.qty)});del(gk)}}
    var base='#/a/'+encodeURIComponent(A.shop),cs=custSess(),ck='cart.shop.'+A.shop+'.'+(cs?cs.user:'guest'),cats=liveCats(D),cur=p[0]==='c'?p[1]:'',page=p[0]||'';
    var html=topbar({base:base,title:A.name+'的烟花店',sub:'② 顾客下单 · 示例店 · /a/'+A.shop,cats:cats,cur:cur,q:q.get('q')});
    html+='<div class="ann" role="note"><div class="in"><span>🛍️ <b>'+esc(A.name)+'的烟花店（示例）</b> · Hunter BOOM JOHOR 产品</span><span>📦 下单后客服人工确认货，再安排出货</span><span>💬 <a href="#" id="ct">联系本店代理：'+esc(A.name)+'</a></span><span>'+(cs?'👤 '+esc(cs.user)+' · <a href="#" id="clo" style="color:#8a5a4a">退出</a>':'<a href="'+base+'/login" style="color:#c8161d">登录 / 注册</a>')+'</span></div></div><main class="wrap">';
    if(page==='p')html+=shopProduct(D,A,p[1],base);
    else if(page==='cart')html+=shopCart(D,A,ck,base,cs);
    else if(page==='login')html+=custLogin(A,base,q.get('next'));
    else if(page==='orders')html+=shopOrders(A,base,cs);
    else if(page==='done')html+='<div class="cp thx"><div class="e">🎆</div><h1>订单已提交，客服确认货后安排出货</h1><p>订单编号 <b>'+esc(p[1])+'</b><br>状态：<span class="st s0">'+ST0C+'</span></p><p><a class="btn gd" href="'+base+'/orders">查看我的订单</a> <a class="btn ol" href="'+base+'">继续逛</a></p></div>';
    else html+=shopHome(D,A,cur,q.get('q'),base);
    html+='</main><footer><div class="in"><div><h2>'+esc(A.name)+'的烟花店（示例）</h2><p>Hunter BOOM JOHOR 产品。价格为卖价；最终数量与出货由客服人工确认。</p></div><div><h3>联系</h3><p>联系本店代理：'+esc(A.name)+'（联系方式待代理填写）</p></div><div><h3>分类</h3><p class="cats">'+cats.map(function(c){return '<a href="'+base+'/c/'+c.id+'">'+esc(c.name)+'</a>'}).join('')+'</p></div><p class="legal">燃放烟花请遵守当地法律法规。本页为草稿示例。</p></div></footer>';
    html+=bottomNav([{h:base,t:'首页',ic:IC.home,on:!page||page==='c'||page==='p'},{h:base+'/cart',t:'购物车',ic:IC.cart,on:page==='cart',b:cartCount(get(ck,[]))||''},{h:base+'/orders',t:'我的订单',ic:IC.ord,on:page==='orders'},{h:cs?base+'/orders':base+'/login',t:cs?esc(cs.user):'登录',ic:IC.user,on:page==='login'}]);
    app.innerHTML=html;bindSearch(base);
    bindQty(app,page==='cart'?function(i){var c=get(ck,[]);c[+i.getAttribute('data-i')].qty=+i.value;set(ck,c);route()}:null);
    document.getElementById('ct').onclick=function(e){e.preventDefault();var m=document.createElement('div');m.className='mdl';m.innerHTML='<div><h3>联系本店代理</h3><p>'+esc(A.name)+'（示例）<br><small class="muted">联系方式待代理填写，草稿不放电话。</small></p><button class="btn gd" type="button">好</button></div>';m.onclick=function(){m.remove()};document.body.appendChild(m)};
    var lo=document.getElementById('clo');if(lo)lo.onclick=function(e){e.preventDefault();del('sess.cust');route()};
    [].forEach.call(app.querySelectorAll('[data-add]'),function(b){b.onclick=function(){var qi=b.getAttribute('data-qf'),qq=qi?Math.max(1,parseInt(document.getElementById(qi).value,10)||1):1;var mode=b.getAttribute('data-mode')||(app.querySelector('.seg .on')||{}).value||'box';addTo(ck,b.getAttribute('data-add'),mode,qq);toast('已加入购物车');route()}});
    [].forEach.call(app.querySelectorAll('.seg button'),function(b){b.onclick=function(){if(b.disabled)return;[].forEach.call(app.querySelectorAll('.seg button'),function(x){x.classList.remove('on')});b.classList.add('on')}});
    [].forEach.call(app.querySelectorAll('[data-rm]'),function(b){b.onclick=function(){var c=get(ck,[]);c.splice(+b.getAttribute('data-rm'),1);set(ck,c);route()}});
    if(page==='login')bindCustLogin(A,base,q.get('next'));
    var co=document.getElementById('co');if(co)co.onclick=function(){
      var f={name:document.getElementById('fn').value.trim(),phone:document.getElementById('fp').value.trim(),addr:document.getElementById('fa').value.trim(),memo:document.getElementById('fm').value.trim()},ok=document.getElementById('fc').checked;
      var bad=[];if(!f.name)bad.push('姓名');if(f.phone.replace(/\D/g,'').length<7)bad.push('电话');if(!f.addr)bad.push('收货地址');
      ['fn','fp','fa'].forEach(function(id){document.getElementById(id).style.borderColor=''});
      if(bad.length){bad.forEach(function(b){document.getElementById({'姓名':'fn','电话':'fp','收货地址':'fa'}[b]).style.borderColor='#c8161d'});toast('请填好：'+bad.join('、'));return}
      if(!ok){toast('请勾选确认资料正确');return}
      var c=get(ck,[]);if(!c.length)return;
      var prof=get('prof.'+cs.user,{});prof.name=f.name;prof.phone=f.phone;prof.addr=f.addr;set('prof.'+cs.user,prof);
      var o={id:oid('C'),kind:'cust',shop:A.shop,agentAcct:A.acct,time:tnow(),status:ST0C,cust:{user:cs.user,name:f.name,phone:f.phone,addr:f.addr,memo:f.memo},items:c.map(function(l){var x=D.by[l.sku],u=l.mode==='unit';return{sku:l.sku,name:x.name,pk:x.pk,mode:l.mode,qty:l.qty,s:u?x.su:x.s}})};
      var all=orders();all.push(o);saveOrders(all);del(ck);location.hash=base+'/done/'+o.id};
  });
}
function shopPrice(x){return '<div class="row"><span class="pr"><small>RM</small>'+rm(x.s).slice(2)+'</span><span class="pk">/箱 '+esc(x.pk)+'</span></div>'+(x.su!=null?'<div class="row"><span class="pr" style="font-size:14px"><small>RM</small>'+rm(x.su).slice(2)+'</span><span class="pk">/件 散装</span></div>':'')}
function shopCard(x,base){return '<article class="pc"><a class="im" href="'+base+'/p/'+x.sku+'">'+img(x)+'<span class="cd2">'+x.sku+'</span>'+(x.v?'<span class="vb">▶ 视频</span>':'')+'</a><div class="b"><a href="'+base+'/p/'+x.sku+'"><h3>'+esc(x.name)+'</h3></a><div class="en">'+esc(x.en)+'</div>'+shopPrice(x)+'<div class="pcx"><button class="add" data-add="'+x.sku+'" data-mode="box">加入购物车</button></div></div></article>'}
function shopHome(D,A,cur,q,base){
  var list=filterItems(D,cur,q),h='';
  if(!cur&&!q)h+='<section class="hero"><span class="tag">示例店 · 草稿</span><h1>'+esc(A.name)+'的烟花店 <em>年货烟花</em></h1><p>完整产品图和视频，价格就是卖价。登录（名字 + 电话后四位）后下单，填好姓名、电话、收货地址，客服确认货后安排出货。</p><div class="btns"><a class="btn gd" href="'+base+'/c/'+(D.cats[0]||{}).id+'">开始选购</a>'+(custSess()?'':'<a class="btn ol" href="'+base+'/login">登录 / 注册</a>')+'</div></section><div class="ic">'+liveCats(D).map(function(c){return '<a href="'+base+'/c/'+c.id+'"><span>'+c.icon+'</span>'+esc(c.name)+'</a>'}).join('')+'</div>';
  h+='<section class="sec"><h2>'+(q?'搜索「'+esc(q)+'」':cur?esc(catName(D,cur)):'全部产品')+' <small>'+list.length+' 款</small></h2>';
  return h+(list.length?'<div class="g">'+list.map(function(x){return shopCard(x,base)}).join('')+'</div>':'<div class="empty">没有找到产品</div>')+'</section>';
}
function shopProduct(D,A,sku,base){
  var x=D.by[sku];if(!x)return '<div class="empty">产品不存在或已下架。</div>';var nb=neighbors(D,x),cn=catName(D,x.cat);
  return '<nav class="bc"><a href="'+base+'">首页</a> › <a href="'+base+'/c/'+x.cat+'">'+esc(cn)+'</a> › <span>'+esc(x.name)+'</span></nav><article class="pd"><div class="im">'+img(x,'big')+'<span class="cd2">'+x.sku+'</span></div><div class="pi"><span class="cd2" style="position:static;display:inline-block">'+x.sku+'</span><h1>'+esc(x.name)+'</h1><p class="en" lang="en">'+esc(x.en)+'</p>'+
  '<div class="pr">'+rm(x.s)+' <small style="font-size:13px;color:#8a5a4a;font-weight:600">/ 整箱（'+esc(x.pk)+'）</small></div>'+(x.su!=null?'<div class="pr" style="font-size:20px">'+rm(x.su)+' <small style="font-size:13px;color:#8a5a4a;font-weight:600">/ 件 散装</small></div>':'<p class="tip">此款只按整箱卖。</p>')+
  '<div class="act"><div class="seg"><button type="button" class="on" value="box">整箱</button>'+(x.su!=null?'<button type="button" value="unit">散装</button>':'')+'</div>'+qtyBox('pq')+'</div><div class="act"><button class="btn gd" type="button" data-add="'+x.sku+'" data-qf="pq">加入购物车</button><a class="btn ol" href="'+base+'/cart">去结算</a></div>'+
  '<p class="note">下单后客服人工确认货，再安排出货。有问题请联系本店代理 '+esc(A.name)+'。</p>'+specTable(x,cn).replace(/<tr><th>一盒件数<\/th><td><span class="nil">[^<]*<\/span><\/td><\/tr>/,'')+'</div></article>'+videoBlock(x)+
  '<nav class="pn"><span>'+(nb.prev?'<a href="'+base+'/p/'+nb.prev.sku+'">‹ '+esc(nb.prev.name)+'</a>':'')+'</span><span>'+(nb.next?'<a href="'+base+'/p/'+nb.next.sku+'">'+esc(nb.next.name)+' ›</a>':'')+'</span></nav>'+
  (nb.rel.length?'<section class="sec"><h2>同类推荐 <small>'+esc(cn)+'</small></h2><div class="g">'+nb.rel.map(function(i){return shopCard(i,base)}).join('')+'</div></section>':'');
}
function custLogin(A,base,next){
  return '<div class="lc"><h1>顾客登录 / 注册</h1><p>用户名 = 名字 + 电话后四位（没有 a），例：<b>丽芬1688</b>。<br>你在「'+esc(A.name)+'的烟花店」下的单会记在代理 '+esc(A.name)+' 名下。</p>'+
  '<label for="cn">名字</label><input id="cn" placeholder="例：丽芬"><label for="ct4">电话后四位</label><input id="ct4" inputmode="numeric" maxlength="4" placeholder="例：1688"><div class="un">用户名：<b id="cu">—</b></div>'+
  '<button class="btn gd" id="cgo" type="button">登录 / 注册</button><button class="btn ol" id="cdemo" type="button">进入示例顾客：丽芬1688</button><p class="or">草稿不设密码。下单时要填 姓名、电话、收货地址。</p></div>';
}
function bindCustLogin(A,base,next){
  function u(){var n=document.getElementById('cn').value.trim(),t=tail4(document.getElementById('ct4').value);var x=n&&t.length===4?n+t:'';document.getElementById('cu').textContent=x||'—';return{u:x,n:n}}
  document.getElementById('cn').oninput=u;document.getElementById('ct4').oninput=u;
  function go(user,name){set('sess.cust',{user:user,name:name,t:tnow()});var pr=get('prof.'+user,null);if(!pr)set('prof.'+user,{name:name});location.hash=base+(next?'/'+next:'')}
  document.getElementById('cgo').onclick=function(){var x=u();if(!x.u){toast('请填名字和电话后四位');return}if(AGENTS.some(function(a){return a.shop===x.u}))toast('提示：这是代理店铺名，顾客请用自己的名字');go(x.u,x.n)};
  document.getElementById('cdemo').onclick=function(){go(DEMO_CUST.name+DEMO_CUST.tail,DEMO_CUST.name)};
}
function shopCart(D,A,ck,base,cs){
  var c=get(ck,[]);
  if(!c.length)return '<div class="cp"><h1>购物车</h1><div class="empty">购物车是空的。<br><a class="btn gd" href="'+base+'" style="margin-top:12px">去选购</a></div></div>';
  var t=0,q=0;
  var rows=c.map(function(l,i){var x=D.by[l.sku],u=l.mode==='unit',s=(u?x.su:x.s)*l.qty;t+=s;q+=l.qty;return '<div class="cl"><div class="t" style="'+(x.th?'background-image:url('+x.th+')':'')+'"></div><div><div class="n">'+x.sku+' '+esc(x.name)+'<small>'+(u?'散装 / 件 · '+rm(x.su):'整箱（'+esc(x.pk)+'）· '+rm(x.s))+'</small></div><div class="q">'+qtyBox('cq'+i,l.qty).replace('<input ','<input data-i="'+i+'" ')+'<span>小计 <b style="color:#c8161d">'+rm(s)+'</b></span><button class="rm" data-rm="'+i+'">删除</button></div></div></div>'}).join('');
  var h='<div class="cp"><h1>购物车</h1>'+rows+'<div class="tot" style="grid-template-columns:1fr 1fr"><div><i>数量</i><b>'+q+'</b></div><div class="s"><i>订单金额（卖价）</i><b>'+rm(t)+'</b></div></div>';
  if(!cs){
    return h+'<a class="btn gd big" href="'+base+'/login?next=cart">登录后填写收货资料下单</a><p class="tip">登录：名字 + 电话后四位，例 丽芬1688。</p></div>';
  }
  var pr=get('prof.'+cs.user,{});
  return h+'<h2 style="font-size:16px;color:#8f0d13;margin:14px 0 4px">基本资料（必填，免得出货搞混）</h2>'+
  '<div class="lc" style="margin:6px 0;max-width:none;box-shadow:none"><label for="fn">姓名 *</label><input id="fn" value="'+esc(pr.name||cs.name||'')+'" required><label for="fp">电话 *</label><input id="fp" type="tel" inputmode="tel" value="'+esc(pr.phone||'')+'" placeholder="完整电话号码" required><label for="fa">收货地址 *</label><textarea id="fa" required placeholder="门牌、路名、区、邮编、城市">'+esc(pr.addr||'')+'</textarea><label for="fm">备注（选填）</label><textarea id="fm" placeholder="例：方便收货时间"></textarea>'+
  '<label style="display:flex;gap:8px;align-items:flex-start;font-weight:600"><input id="fc" type="checkbox" style="width:auto;margin-top:4px"> 我确认以上姓名、电话、收货地址正确'+(pr.addr?'（已带出上次资料，请再核对）':'')+'</label></div>'+
  '<button class="btn gd big" id="co" type="button">提交订单 · '+rm(t)+'</button><p class="tip">登录：'+esc(cs.user)+' · 订单记在代理 '+esc(A.name)+' 名下，送客服人工确认后安排出货。</p></div>';
}
function shopOrders(A,base,cs){
  if(!cs)return '<div class="lc"><h1>我的订单</h1><p>请先登录查看订单。</p><a class="btn gd" href="'+base+'/login?next=orders">登录</a></div>';
  var my=orders().filter(function(o){return o.kind==='cust'&&o.shop===A.shop&&o.cust.user===cs.user}).reverse();
  return '<div class="cp"><h1>我的订单 · '+esc(cs.user)+'</h1>'+(my.length?my.map(function(o){return orderCard(o,'cust',null)}).join(''):'<div class="empty">还没有订单。</div>')+'</div>';
}

route();
})();
