(function(){
"use strict";
const FV = window.FV;
if(!FV) return;
const state = FV.state, CARDS = FV.CARDS, DCARDS = FV.DCARDS, LCARDS = FV.LCARDS;
const DATA = FV.DATA, DERIVATIONS = FV.DERIVATIONS, LAWS = FV.LAWS;
const ACCENT = FV.ACCENT, SUBJ = FV.SUBJECT_LABEL;
const $ = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.prototype.slice.call((r||document).querySelectorAll(s));

/* ============ storage & user data ============ */
const store = {
  get(k,d){ try{ const v=localStorage.getItem('fvault:'+k); return v==null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem('fvault:'+k, JSON.stringify(v)); }catch(e){} }
};
let favs = store.get('favs', []); if(!Array.isArray(favs)) favs=[];
let sheets = store.get('sheets', 0); if(!Number.isFinite(sheets)||sheets<0) sheets=0;
let study = store.get('study', {}); if(!study||typeof study!=='object'||Array.isArray(study)) study={};
let streak = store.get('streak', {count:0, last:'', days:[]});
if(!streak||typeof streak!=='object') streak={count:0,last:'',days:[]};
if(!Array.isArray(streak.days)) streak.days=[];
let settings = store.get('settings', {provider:'auto'});
if(!settings||typeof settings!=='object'||Array.isArray(settings)) settings={provider:'auto'};
if(typeof settings.provider!=='string'||['auto','groq','google','openrouter'].indexOf(settings.provider)===-1) settings.provider='auto';
if(!settings.aiKeys||typeof settings.aiKeys!=='object') settings.aiKeys={};
['groq','google','openrouter'].forEach(function(p){ settings.aiKeys[p]=typeof settings.aiKeys[p]==='string'?settings.aiKeys[p]:''; });
let aiCalls = store.get('aiCalls', 0); if(!Number.isFinite(aiCalls)) aiCalls=0;
function key(c){ return c.cls+'|'+c.subject+'|'+c.chapter+'|'+c.t; }
function saveAll(){ store.set('favs',favs); store.set('sheets',sheets); store.set('study',study); store.set('settings',settings); store.set('aiCalls',aiCalls); }
window.__fvIsFav = function(c){ return favs.indexOf(key(c))!==-1; };
(function(){ const t=new Date().toDateString(); if(streak.last!==t){ const y=new Date(Date.now()-864e5).toDateString(); streak.count = streak.last===y ? streak.count+1 : 1; streak.last=t; streak.days.push(t); if(streak.days.length>90)streak.days.shift(); store.set('streak',streak);} })();

/* ============ helpers ============ */
function escHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function stripHtml(s){ const d=document.createElement('div'); d.innerHTML=s||''; return (d.textContent||'').replace(/\s+/g,' ').trim(); }
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i]; a[i]=a[j]; a[j]=t; } return a; }

function toast(msg, ms){
  const host=$('#fvToasts'); if(!host) return;
  const d=document.createElement('div'); d.className='fv-toast'; d.innerHTML='<span>•</span>'+escHtml(msg);
  host.appendChild(d); requestAnimationFrame(()=>d.classList.add('show'));
  setTimeout(()=>{ d.classList.remove('show'); setTimeout(()=>d.remove(),350); }, ms||2600);
}
window.addEventListener('error', function(e){ try{ toast(e.error&&e.error.message?e.error.message:(e.message||'Unexpected error')); }catch(_){ } });
window.addEventListener('unhandledrejection', function(e){ try{ toast(e.reason&&e.reason.message?e.reason.message:'Promise failed'); }catch(_){ } });
function confetti(n){
  n=n||90; const colors=['#1D64D8','#0E93AE','#5457D9','#FF9F0A','#2fbf71','#FF375F'];
  for(let i=0;i<n;i++){ const p=document.createElement('i'); p.className='fv-confetti';
    p.style.left=Math.random()*100+'vw'; p.style.background=colors[i%colors.length];
    p.style.animationDelay=(Math.random()*0.4)+'s'; p.style.animationDuration=(1.6+Math.random()*1.4)+'s';
    p.style.setProperty('--rx',(Math.random()*720-360)+'deg'); p.style.setProperty('--sz',(6+Math.random()*7)+'px');
    document.body.appendChild(p); setTimeout(()=>p.remove(),3400); }
}

/* ============ scroll reveal ============ */
const io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){ es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('fv-in'); io.unobserve(en.target); } }); }, {rootMargin:'0px 0px -6% 0px', threshold:0.05}) : null;
function reveal(){
  $$('#grid > *').forEach(function(el,i){
    if(!el.classList.contains('fv-reveal')){
      el.classList.add('fv-reveal');
      if(io){
        var r;
        try{ r=el.getBoundingClientRect(); }catch(e){ r={top:0,bottom:0}; }
        if(r.top < window.innerHeight*0.94){ el.classList.add('fv-in'); }
        else{ el.style.transitionDelay=Math.min((i%12)*40,420)+'ms'; io.observe(el); }
      } else el.classList.add('fv-in');
    }
  });
  setTimeout(function(){ $$('#grid .fv-reveal:not(.fv-in)').forEach(el=>el.classList.add('fv-in')); }, 700);
}

/* ============ overlay framework ============ */
const hostEl = $('#fvOverlayHost');
let overlayStack = [];
function openOverlay(html, cls){
  const w=document.createElement('div'); w.className='fv-ov '+(cls||'');
  w.innerHTML='<div class="fv-ov-back"></div><div class="fv-ov-panel">'+html+'</div>';
  hostEl.appendChild(w); requestAnimationFrame(()=>w.classList.add('open'));
  w.addEventListener('click', e=>{ if(e.target.closest('[data-close]')||e.target.classList.contains('fv-ov-back')) closeOverlay(w); });
  overlayStack.push(w); document.addEventListener('keydown', escFor);
  return w;
}
function escFor(e){ if(e.key==='Escape'&&overlayStack.length){ closeOverlay(overlayStack[overlayStack.length-1]); } }
function closeOverlay(w){
  w = w||overlayStack[overlayStack.length-1]; if(!w) return;
  w.classList.remove('open'); overlayStack=overlayStack.filter(x=>x!==w);
  setTimeout(()=>w.remove(),280);
  if(!overlayStack.length) document.removeEventListener('keydown', escFor);
}

/* ============ AI engine (Groq → Google → OpenRouter) — bring your own API key ============ */
/* Keys are never baked into the code: you paste them in AI Settings and they are
   saved only in this browser's localStorage (settings.aiKeys). Auto mode tries every
   provider that has a key configured. */
const AI = (function(){
  const MODELS = {
    groq:['qwen/qwen3.8-27b','openai/gpt-oss-120b'],
    google:['gemini-3.5-flash-lite','gemini-2.5-flash'],
    openrouter:['deepseek/deepseek-chat-v3.1','meta-llama/llama-4-maverick']
  };
  const LABEL = { groq:'Groq', google:'Google AI', openrouter:'OpenRouter' };
  const HELP = {
    groq:'https://console.groq.com/keys',
    google:'https://aistudio.google.com/apikey',
    openrouter:'https://openrouter.ai/keys'
  };
  const keyTips = {
    groq:'Paste your Groq key — starts with gsk_…',
    google:'Paste your Google AI Studio key — starts with AIza… or AQ.…',
    openrouter:'Paste your OpenRouter key — starts with sk-or-v1-…'
  };

  function keyFor(p){ const k=(settings.aiKeys&&settings.aiKeys[p])||''; return String(k).trim(); }
  function hasKey(p){ return !!keyFor(p); }
  function configured(){ return ['groq','google','openrouter'].filter(hasKey); }
  function errNoKey(p){
    const e=new Error('No '+LABEL[p]+' API key yet — get one free at '+HELP[p]+' and paste it in AI Settings.');
    e.code='AI_NO_KEY'; e.provider=p; return e;
  }
  function errBadKey(p, msg){
    const e=new Error(msg||(LABEL[p]+' rejected that API key. Double-check it at '+HELP[p]));
    e.code='AI_BAD_KEY'; e.provider=p; return e;
  }

  async function* sseChunks(res){
    const reader=res.body.getReader(); const dec=new TextDecoder(); let buf='';
    while(true){ const r=await reader.read(); if(r.done) break; buf+=dec.decode(r.value,{stream:true});
      let idx; while((idx=buf.indexOf('\n'))>=0){ const line=buf.slice(0,idx).trim(); buf=buf.slice(idx+1);
        if(!line||line.indexOf('data:')!==0) continue; const payload=line.slice(5).trim();
        if(payload==='[DONE]') return; yield payload; } }
  }

  async function callProvider(p, model, messages, o){
    const KEY=keyFor(p);
    if(!KEY) throw errNoKey(p);
    const sys = messages.filter(m=>m.role==='system').map(m=>m.content).join('\n\n');
    const rest = messages.filter(m=>m.role!=='system');
    let url, init;
    if(p==='groq'||p==='openrouter'){
      url = p==='groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
      const headers={'Content-Type':'application/json','Authorization':'Bearer '+KEY};
      if(p==='openrouter'){ headers['HTTP-Referer']='https://formula-vault.app'; headers['X-Title']='Formula Vault'; }
      init={ method:'POST', headers, body: JSON.stringify({ model, messages: messages, stream:true, temperature:0.55, max_tokens:o.maxTokens||1800 }), signal:o.signal };
    } else {
      url='https://generativelanguage.googleapis.com/v1beta/models/'+model+':streamGenerateContent?alt=sse&key='+encodeURIComponent(KEY);
      const body={ contents: rest.map(m=>({ role: m.role==='assistant'?'model':'user', parts:[{text:m.content}] })), generationConfig:{ temperature:0.55, maxOutputTokens:o.maxTokens||1800 } };
      if(sys) body.systemInstruction={ parts:[{text:sys}] };
      init={ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body), signal:o.signal };
    }
    const res=await fetch(url, init);
    if(!res.ok){
      let em=''; try{ const j=await res.json(); em=(j.error&&(j.error.message||j.error.msg))||''; }catch(e){}
      if(res.status===401||res.status===403) throw errBadKey(p, LABEL[p]+' rejected this API key ('+res.status+'). Check it at '+HELP[p]);
      throw new Error(LABEL[p]+' '+res.status+(em?': '+em:''));
    }
    let got=false;
    for await (const payload of sseChunks(res)){
      let j; try{ j=JSON.parse(payload); }catch(e){ continue; }
      let piece='';
      if(p==='google'){ const c=j.candidates&&j.candidates[0]; if(c&&c.content&&c.content.parts) piece=c.content.parts.filter(pt=>pt.text&&!pt.thought).map(pt=>pt.text).join(''); }
      else { const d=j.choices&&j.choices[0]&&(j.choices[0].delta||j.choices[0].message); if(d&&d.content) piece=d.content; }
      if(piece){ got=true; if(o.onDelta) o.onDelta(piece); }
    }
    if(!got) throw new Error(LABEL[p]+' returned no text');
    return true;
  }

  function serverMode(){ return typeof location!=='undefined' && /^https?:$/.test(location.protocol||''); }
  async function serverChat(messages, o){
    const res=await fetch('/api/ai', {method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ messages: messages, provider: settings.provider||'auto', maxTokens: o.maxTokens||1800 }),
      signal: o.signal });
    if(!res.ok){
      let j=null; try{ j=await res.json(); }catch(e){}
      const msg = j&&j.error ? (j.error.message||'AI server error') : ('AI server unavailable ('+res.status+')');
      const err = new Error(msg);
      if(j&&j.error&&j.error.code){ err.code=j.error.code; err.provider=j.error.provider; }
      throw err;
    }
    const reader=res.body.getReader(); const dec=new TextDecoder(); let buf='', acc='', got=false;
    while(true){
      const r=await reader.read(); if(r.done) break;
      buf+=dec.decode(r.value,{stream:true});
      let idx;
      while((idx=buf.indexOf('\n'))>=0){
        const line=buf.slice(0,idx).trim(); buf=buf.slice(idx+1);
        if(!line) continue;
        let j; try{ j=JSON.parse(line); }catch(e){ continue; }
        if(j.error){ const err=new Error(j.error.message||'AI server error'); if(j.error.code) err.code=j.error.code; err.provider=j.error.provider; throw err; }
        if(j.delta!=null){ got=true; acc+=j.delta; if(o.onDelta) o.onDelta(j.delta); }
      }
    }
    if(!got&&!acc){ const e=new Error('AI server returned no response'); e.code='AI_EMPTY'; throw e; }
    return { provider:'server', model:'server' };
  }

  async function chat(messages, o){
    o=o||{}; aiCalls++; store.set('aiCalls',aiCalls);
    if(serverMode()&&!o.noServer){
      try{ return await serverChat(messages.slice(-14), o); }
      catch(e){
        if(e&&e.name==='AbortError') throw e;
      }
    }
    let order = settings.provider==='auto' ? configured() : (hasKey(settings.provider)?[settings.provider]:[]);
    if(!order.length){ const e=new Error('No AI provider configured yet. Open AI Settings and paste a free API key for Groq, Google or OpenRouter — it stays on your device.'); e.code='AI_NO_KEY'; throw e; }
    let streamed=false; let lastErr=null;
    const od = t=>{ streamed=true; if(o.onDelta) o.onDelta(t); };
    for(const p of order){
      for(const model of MODELS[p]){
        if(o.onStatus) o.onStatus(LABEL[p]+' · '+model.split('/').pop());
        try{ await callProvider(p, model, messages, Object.assign({},o,{onDelta:od})); return {provider:p, model:model}; }
        catch(e){ if(e&&e.name==='AbortError') throw e; lastErr=e; if(streamed||e.code==='AI_NO_KEY'||e.code==='AI_BAD_KEY') throw e; }
      }
    }
    throw lastErr||new Error('All AI providers failed');
  }

  async function testKey(p){
    const KEY=keyFor(p); if(!KEY) throw errNoKey(p);
    if(p==='google'){
      const url='https://generativelanguage.googleapis.com/v1beta/models/'+MODELS.google[0]+':generateContent?key='+encodeURIComponent(KEY);
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:'Reply with exactly: OK'}]}],generationConfig:{maxOutputTokens:5}})});
      if(!res.ok){ let em=''; try{ const j=await res.json(); em=(j.error&&j.error.message)||''; }catch(e){} throw errBadKey(p, em?em:(LABEL[p]+' '+res.status)); }
      return true;
    }
    const url = p==='groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://openrouter.ai/api/v1/chat/completions';
    const body={ model:MODELS[p][0], messages:[{role:'user',content:'Reply with exactly: OK'}], max_tokens:5, stream:false };
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+KEY},body:JSON.stringify(body)});
    if(!res.ok){ let em=''; try{ const j=await res.json(); em=(j.error&&(j.error.message||j.error.msg))||''; }catch(e){} throw errBadKey(p, em?em:(LABEL[p]+' '+res.status)); }
    return true;
  }

  return { chat:chat, testKey:testKey, LABEL:LABEL, HELP:HELP, keyTips:keyTips, hasKey:hasKey, configured:configured, serverMode:serverMode };
})();
window.__AI = AI;

function aiKeyErrHTML(msg){
  return '<div class="fv-err">'+escHtml(msg)+' <button class="fv-btn primary" data-gokeys style="margin-top:8px">Add API key</button></div>';
}
function wireGoKeys(root){
  (root.querySelectorAll('[data-gokeys]')||[]).forEach(function(b){ b.onclick=function(){ if(root.classList.contains('fv-ov')) closeOverlay(root); else closeOverlay(); openAISettings(); }; });
}

/* ============ MathJax (lazy) ============ */
let mjPromise=null;
function loadMathJax(){
  if(mjPromise) return mjPromise;
  mjPromise=new Promise(function(res){
    window.MathJax={ tex:{ inlineMath:[['\\(','\\)']], displayMath:[['\\[','\\]']] }, chtml:{ displayAlign:'left' }, startup:{ typeset:false } };
    const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js'; s.async=true;
    s.onload=res; s.onerror=res; document.head.appendChild(s); setTimeout(res,9000);
  });
  return mjPromise;
}
function typeset(el){
  if(window.MathJax&&window.MathJax.typesetPromise){ try{ window.MathJax.typesetPromise([el]); }catch(e){} }
  else loadMathJax().then(function(){ try{ if(window.MathJax&&window.MathJax.typesetPromise) window.MathJax.typesetPromise([el]); }catch(e){} });
}

/* ============ AI tutor drawer (multi-thread chat history) ============ */
function cleanMsgs(a){ return Array.isArray(a)?a.filter(function(m){ return m&&typeof m==='object'&&typeof m.role==='string'&&typeof m.content==='string'; }):[]; }
function threadTitleFrom(q){
  const t=String(q||'').replace(/\s+/g,' ').trim();
  return t ? (t.length>46?t.slice(0,46)+'…':t) : 'New chat';
}
let threads=(function(){
  try{
    const t=store.get('chats',null);
    if(Array.isArray(t)) return t.filter(function(th){ return th&&typeof th==='object'&&typeof th.id==='string'&&Array.isArray(th.msgs); }).map(function(th){
      return { id:th.id, title:typeof th.title==='string'&&th.title?th.title:'New chat', msgs:cleanMsgs(th.msgs), updated:Number(th.updated)||0 };
    }).sort(function(a,b){ return b.updated-a.updated; });
    const legacy=store.get('chat',[]);
    if(Array.isArray(legacy)&&legacy.length) return [{ id:'t'+Date.now(), title:'Chat history', msgs:cleanMsgs(legacy), updated:Date.now() }];
  }catch(e){}
  return [];
})();
function saveThreads(){
  threads.slice(0,50).forEach(function(th){ if(th.msgs.length>80) th.msgs.splice(0, th.msgs.length-80); });
  store.set('chats',threads.map(function(th){ return { id:th.id, title:th.title, msgs:th.msgs, updated:th.updated }; }));
}
function ensureThread(){
  if(!activeThread||!threads.some(function(th){ return th.id===activeThread.id; })){
    activeThread={ id:'t'+Date.now(), title:'New chat', msgs:[], updated:Date.now() };
    threads.unshift(activeThread);
  }
  settings.threadId=activeThread.id; store.set('settings',settings); saveThreads();
  return activeThread;
}
let activeThread=(function(){
  const id=settings.threadId||(threads[0]&&threads[0].id);
  const th=threads.find(function(t){ return t.id===id; })||threads[0];
  if(th){ settings.threadId=th.id; return th; }
  return null;
})();
let chatMsgs=activeThread?activeThread.msgs:[];
let busy=false;
function tutorSystem(){
  const subj=SUBJ[state.subject], cls=state.cls;
  const browsing=(state.chapter&&state.chapter!=='all');
  const ctx=browsing
    ? 'The user is browsing the chapter "'+state.chapter+'" ('+subj+', Class '+cls+') in the vault — use it only as a hint about what they might ask.'
    : 'The user is browsing a '+subj+' formula vault for Class '+cls+'.';
  return [
    'You are Vault AI, a warm, patient, versatile teaching tutor for ANY subject and ANY level — sciences (physics, chemistry, biology), mathematics, engineering, computer science and programming, economics, history, languages, exam prep, and everyday concepts. '+ctx+' Treat that as a soft hint only, never as a restriction.',
    'The user can ask about anything — a concept, a formula, a solved example, homework, career advice, or a random curiosity. Decide the topic and level from their question itself; never assume a subject or class, and never say a topic is outside your scope. If they ask about '+subj+' or the chapter they are browsing, feel free to use that context.',
    'TEACHING METHOD — teach the thinking, not just the answer. For each topic:',
    '1) INTUITION first: open with a short everyday analogy that makes the idea click before any mathematics or jargon.',
    '2) Then give the formula, law, or rule and explain WHY each symbol or part is there and what it is really saying.',
    '3) EXAM & APPLICATION: if the topic is commonly tested (JEE/CBSE, SAT, university courses, coding interviews, etc.), note typical question styles and traps and give a short step-by-step worked example. Otherwise give a concrete real-world application.',
    '4) MISCONCEPTIONS: name the classic mistake learners make and the warning sign that they are about to fall into it.',
    'Match the student\'s level: if they ask something basic, explain simply; if they ask advanced, go deep but stay structured. When a student makes a conceptual error, correct it gently and affirm the part they got right.',
    'Formatting: mathematics in LaTeX with \\( ... \\) inline and \\[ ... \\] display; bold key terms with **term**. Use short paragraphs and bullets, not walls of text.',
    'End most answers with ONE short follow-up question that helps them apply the idea (for example a quick variation to try) — but only if the reply ends cleanly and the student has not asked for something else.',
    'Length: under 300 words unless the student asks for full depth. Be encouraging, precise, and never condescending.'
  ].join(' ');
}
function fmtAI(t){
  let s=escHtml(t);
  s=s.replace(/\*\*([^*]+)\*\*/g,(m,p)=>'<b>'+p+'</b>');
  s=s.replace(/`([^`\n]+)`/g,(m,p)=>'<code>'+p+'</code>');
  s=s.replace(/^### (.*)$/gm,(m,p)=>'<b>'+p+'</b>');
  s=s.replace(/\n/g,'<br>');
  return s;
}
function tutorHTML(){
  const prov=settings.provider||'auto';
  return '<div class="fv-drawer-head">'+
    '<div class="fv-drawer-title"><span class="ai-dot"></span>Vault AI <button class="fv-txtbtn" id="fvAISet" title="AI settings & API keys">'+window.__I.settings+'Settings</button></div>'+
    '<div class="fv-drawer-actions">'+
      '<select class="fv-sel" id="fvProv"><option value="auto"'+(prov==='auto'?' selected':'')+'>Auto</option><option value="groq"'+(prov==='groq'?' selected':'')+'>Groq</option><option value="google"'+(prov==='google'?' selected':'')+'>Google</option><option value="openrouter"'+(prov==='openrouter'?' selected':'')+'>OpenRouter</option></select>'+
      '<button class="fv-txtbtn" id="fvHistory" title="Review past conversations">'+window.__I.history+'History</button>'+
      '<button class="fv-txtbtn" id="fvNewChat" title="Start a new conversation">'+window.__I.messagePlus+'New chat</button>'+
      '<button class="fv-icon-btn" data-close title="Close">×</button>'+
    '</div></div>'+
    '<div class="fv-drawer-body"><div class="fv-threads" id="fvThreads"></div>'+
    '<div class="fv-drawer-main"><div class="fv-chat" id="fvChat"></div>'+
    '<div class="fv-suggest" id="fvSuggest"></div>'+
    '<div class="fv-chat-input"><textarea id="fvChatText" rows="1" placeholder="Ask anything — any subject, any class…"></textarea><button class="fv-send" id="fvSend" title="Send">Send</button></div></div></div>';
}
function openAISettings(){
  const aiKeys=settings.aiKeys||{groq:'',google:'',openrouter:''};
  const w=openOverlay(
    '<div class="fv-modal-head"><div><h3>'+window.__I.settings+'Vault AI Settings</h3><span class="ctx-pill">Teaching tutor engine</span></div><button class="fv-icon-btn" data-close>×</button></div>'+
    '<div class="fv-modal-body">'+
      '<p class="fv-ai-note">'+(AI.serverMode()?'This deployed version uses the site\'s built-in API keys — the AI tutor already works, no setup needed. You may still add your own key below as a personal backup. ':'Vault AI is your tutor for any subject and any class. Paste one (or more) free API key below. ')+'Keys are saved <b>only on this device</b> and are never uploaded anywhere. Auto mode tries every provider that has a key.</p>'+
      (!AI.serverMode()&&AI.configured().length===0 ? '<div class="fv-err" style="margin-bottom:12px">No provider is set up yet — add at least one key.</div>' : '')+
      ['groq','google','openrouter'].map(function(p){
        return '<div class="ai-key-row" data-p="'+p+'">'+
          '<div class="ai-key-head"><b>'+AI.LABEL[p]+'</b><a href="'+AI.HELP[p]+'" target="_blank" rel="noopener">get a free key ↗</a><span class="ai-ok" id="aiChk'+p+'">'+(settings.aiKeys&&settings.aiKeys[p]?'configured':'')+'</span></div>'+
          '<div class="ai-key-in"><input id="aiKey'+p+'" type="password" placeholder="'+escHtml(AI.keyTips[p])+'" value="'+escHtml(aiKeys[p]||'')+'" autocomplete="off" spellcheck="false">'+
            '<button class="fv-btn" id="aiTog'+p+'" type="button">Show</button>'+
            '<button class="fv-btn primary" id="aiTest'+p+'" type="button">Test</button></div>'+
          '<div class="ai-state" id="aiState'+p+'"></div>'+
        '</div>';
      }).join('')+
      '<div style="display:flex;gap:10px;margin-top:16px;align-items:center">'+
        '<button class="fv-btn primary" id="aiSave">Save keys</button>'+
        '<span class="fv-ai-note" style="margin:0">Default provider stays <b>Auto</b> — it will pick the first working key.</span></div>'+
    '</div>','modal');
  ['groq','google','openrouter'].forEach(function(p){
    const inp=w.querySelector('#aiKey'+p), state=w.querySelector('#aiState'+p);
    w.querySelector('#aiTog'+p).onclick=function(){
      const show=inp.type==='password';
      inp.type=show?'text':'password';
      w.querySelector('#aiTog'+p).textContent=show?'Hide':'Show';
    };
    w.querySelector('#aiTest'+p).onclick=async function(){
      const k=inp.value.trim();
      if(!k){ state.innerHTML='<span class="ai-err">Enter a key first.</span>'; return; }
      settings.aiKeys=settings.aiKeys||{}; settings.aiKeys[p]=k; store.set('settings',settings);
      state.innerHTML='<span class="ai-wait">Testing connection…</span>';
      const btn=w.querySelector('#aiTest'+p); const prev=btn.textContent; btn.disabled=true; btn.textContent='…';
      try{ await AI.testKey(p); state.innerHTML='<span class="ai-ok">Key works! '+AI.LABEL[p]+' is ready to teach.</span>'; w.querySelector('#aiChk'+p).textContent='working'; }
      catch(e){ state.innerHTML='<span class="ai-err">'+escHtml(e.message||'failed')+'</span>'; }
      btn.disabled=false; btn.textContent=prev;
    };
  });
  w.querySelector('#aiSave').onclick=function(){
    const k={};
    ['groq','google','openrouter'].forEach(function(p){ k[p]=String(w.querySelector('#aiKey'+p).value||'').trim(); });
    settings.aiKeys=k; store.set('settings',settings);
    const any=Object.keys(k).filter(function(p){return k[p];});
    closeOverlay(w);
    toast(any.length ? 'AI keys saved — tutor is ready ('+any.map(function(p){return AI.LABEL[p];}).join(', ')+')' : 'Keys cleared — add at least one to use the AI tutor');
  };
}
function openTutor(){
  loadMathJax();
  ensureThread(); chatMsgs=activeThread.msgs;
  const w=openOverlay(tutorHTML(),'drawer');
  const chat=w.querySelector('#fvChat');
  const thrEl=w.querySelector('#fvThreads');
  function scroll(){ chat.scrollTop=chat.scrollHeight; }
  function add(role,text){ const d=document.createElement('div'); d.className='msg '+role; d.innerHTML = role==='user'?escHtml(text):fmtAI(text); chat.appendChild(d); scroll(); return d; }
  function setStatus(el,s){ let st=el.querySelector('.fv-stream-status'); if(!st){ st=document.createElement('div'); st.className='fv-stream-status'; el.appendChild(st);} st.innerHTML='◌ '+escHtml(s); }
  function renderSug(){
    const ch = state.chapter!=='all'?state.chapter:null;
    const sug = ch ? ['Explain '+ch+' simply','Top tricks for '+ch,'Common mistakes in '+ch,'3 practice problems on '+ch]
                   : ['Explain a concept from '+SUBJ[state.subject],'Quiz me on '+SUBJ[state.subject],'Help me with a homework problem','Make a 1-page revision plan'];
    const box=w.querySelector('#fvSuggest');
    box.innerHTML=sug.map(s=>'<button class="fv-sug">'+escHtml(s)+'</button>').join('');
    $$('.fv-sug',box).forEach(b=>b.onclick=()=>{ w.querySelector('#fvChatText').value=b.textContent; send(); });
  }
  function touchThread(){ if(activeThread){ activeThread.updated=Date.now(); saveThreads(); if(thrEl&&!thrEl.hidden) renderThreads(); } }
  function renderThreads(){
    const list=threads.slice().sort(function(a,b){ return b.updated-a.updated; });
    thrEl.innerHTML=
      '<div class="fv-threads-head"><b>Conversations</b><button class="fv-txtbtn" id="fvNewInList">New chat</button></div>'+
      (list.length ? list.map(function(th){
        return '<div class="fv-thread'+(th.id===activeThread.id?' active':'')+'" data-tid="'+th.id+'">'+
          '<div class="fv-thread-main"><b>'+escHtml(th.title||'Chat')+'</b><span>'+new Date(th.updated).toLocaleString(undefined,{month:'short',day:'numeric'})+' · '+th.msgs.length+' msg'+(th.msgs.length===1?'':'s')+'</span></div>'+
          '<button class="fv-thread-x" data-tdel="'+th.id+'" title="Delete conversation">×</button></div>';
      }).join('') : '<div class="fv-threads-empty">No conversations yet. Start one below.</div>');
    $$('[data-tid]',thrEl).forEach(function(el){ el.onclick=function(){ switchThread(el.dataset.tid); }; });
    $$('[data-tdel]',thrEl).forEach(function(b){ b.onclick=function(ev){ ev.stopPropagation(); deleteThread(b.dataset.tdel); }; });
    const nb=thrEl.querySelector('#fvNewInList'); if(nb){ nb.onclick=newThread; }
  }
  function deleteThread(id){
    threads=threads.filter(function(th){ return th.id!==id; });
    if(activeThread&&activeThread.id===id){
      activeThread=threads[0]||null;
      if(!activeThread){ ensureThread(); }
      settings.threadId=activeThread.id; store.set('settings',settings);
      chatMsgs=activeThread.msgs; renderChat();
    }
    saveThreads(); renderThreads();
  }
  function renderChat(){
    chat.innerHTML='';
    if(chatMsgs.length) chatMsgs.forEach(function(m){ add(m.role==='assistant'?'ai':'user', m.content); });
    else if(AI.serverMode()||AI.configured().length)
      add('ai', "Hey! I'm Vault AI — your tutor for any subject, any class, any level. Explain formulas, work through problems, quiz you, or plan revision — for physics, chemistry, math, coding or anything you're stuck on. What's confusing you today?");
    else add('ai', "Welcome! I'm Vault AI. To let me teach you, add a free API key (Groq, Google or OpenRouter) in Settings. Tap Settings above and paste any key, then hit Save.");
  }
  function newThread(){
    activeThread={ id:'t'+Date.now(), title:'New chat', msgs:[], updated:Date.now() };
    threads.unshift(activeThread); settings.threadId=activeThread.id; store.set('settings',settings); saveThreads();
    chatMsgs=activeThread.msgs;
    chat.innerHTML=''; renderChat(); renderSug(); w.classList.remove('threads-open');
  }
  function switchThread(id){
    const th=threads.find(function(t){ return t.id===id; });
    if(th&&th!==activeThread){
      activeThread=th; settings.threadId=th.id; store.set('settings',settings); chatMsgs=activeThread.msgs;
      renderChat(); renderSug();
    }
    w.classList.remove('threads-open');
  }
  async function send(){
    if(busy) return;
    const ta=w.querySelector('#fvChatText'); const q=ta.value.trim(); if(!q) return;
    ta.value=''; ta.style.height='auto';
    add('user',q); chatMsgs.push({role:'user',content:q});
    if(!activeThread.title||activeThread.title==='New chat') activeThread.title=threadTitleFrom(q);
    touchThread();
    busy=true; w.querySelector('#fvSend').disabled=true;
    const el=add('ai',''); el.innerHTML='<div class="fv-typing"><i></i><i></i><i></i></div>';
    let acc=''; const ctl=new AbortController();
    try{
      await AI.chat([{role:'system',content:tutorSystem()}].concat(chatMsgs.slice(-12)), {
        signal:ctl.signal,
        onStatus:s=>setStatus(el,s),
        onDelta:d=>{ acc+=d; el.innerHTML=fmtAI(acc)+'<span class="caret"></span>'; scroll(); }
      });
      el.innerHTML=fmtAI(acc); typeset(el);
      chatMsgs.push({role:'assistant',content:acc}); touchThread();
    }catch(e){
      if(e&&e.name==='AbortError'){ el.innerHTML=fmtAI(acc)+' <span class="stoptag">stopped</span>'; if(acc){ chatMsgs.push({role:'assistant',content:acc}); touchThread(); } }
      else {
        el.innerHTML=fmtAI(acc)+aiKeyErrHTML(e.message||'AI failed');
        wireGoKeys(w);
      }
    }
    busy=false; w.querySelector('#fvSend').disabled=false; scroll();
  }
  w.querySelector('#fvSend').onclick=send;
  w.querySelector('#fvAISet').onclick=openAISettings;
  const ta=w.querySelector('#fvChatText');
  ta.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send(); } });
  ta.addEventListener('input',()=>{ ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,120)+'px'; });
  w.querySelector('#fvProv').onchange=e=>{ settings.provider=e.target.value; store.set('settings',settings); toast('AI provider: '+e.target.value); };
  w.querySelector('#fvHistory').onclick=function(){ if(w.classList.toggle('threads-open')) renderThreads(); };
  w.querySelector('#fvNewChat').onclick=newThread;
  chat.addEventListener('click',function(){ w.classList.remove('threads-open'); });
  renderChat(); renderSug();
  setTimeout(()=>ta.focus(),150);
}
function askTutor(text){ openTutor(); setTimeout(()=>{ const ta=$('#fvChatText'); if(ta){ ta.value=text; const btn=$('#fvSend'); if(btn) btn.click(); } },400); }

/* ============ Explain with AI (modal) ============ */
function openExplain(c){
  loadMathJax();
  const w=openOverlay('<div class="fv-modal-head"><div><h3>'+window.__I.sparkles+'AI Explanation</h3><span class="ctx-pill">'+SUBJ[c.subject]+' · '+escHtml(c.chapter)+'</span></div><button class="fv-icon-btn" data-close>×</button></div>'+
    '<div class="fv-modal-body"><div class="qq" style="margin:0 0 10px">'+escHtml(c.t)+'</div><div class="calc-out" style="margin-bottom:12px">'+c.eq+'</div><div id="fvExOut"><div class="fv-typing"><i></i><i></i><i></i></div></div></div>'+
    '<div class="fv-modal-foot"><button class="fv-btn" data-close>Close</button><button class="fv-btn primary" id="fvExMore">Go deeper in Tutor →</button></div>','modal');
  const out=w.querySelector('#fvExOut');
  const prompt='Explain this '+SUBJ[c.subject]+' formula for a Class '+c.cls+' student.\nTitle: '+c.t+'\nFormula: '+FV.strip(c.eq)+
    (c.sym&&c.sym.length?'\nSymbols: '+c.sym.map(s=>s[0]+' = '+s[1]).join('; '):'')+
    (c.tip?'\nHint already known: '+c.tip:'')+
    '\nStructure: (1) the intuition, (2) when to use it in problems, (3) a tiny worked numerical example, (4) one common mistake to avoid. Max 220 words. LaTeX in \\( \\) Delimiters.';
  let acc='';
  AI.chat([{role:'system',content:tutorSystem()},{role:'user',content:prompt}],{
    onDelta:d=>{ acc+=d; out.innerHTML=fmtAI(acc)+'<span class="caret"></span>'; }
  }).then(()=>{ out.innerHTML=fmtAI(acc); typeset(out); })
    .catch(e=>{ out.innerHTML=aiKeyErrHTML(e.message||'AI unavailable'); wireGoKeys(w); });
  w.querySelector('#fvExMore').onclick=()=>{ closeOverlay(w); askTutor('Explain in more depth: "'+c.t+'" ('+FV.strip(c.eq)+')'); };
}

    /* ============ Revision Sheet builder ============ */
  function openSheet(){
    const sel={};
    DATA.forEach(function(d){ sel[d.cls+'|'+d.subject+'|'+d.chapter]=false; });
    const w=openOverlay('<div class="fv-modal-head"><div><h3>'+window.__I.fileText+'Revision Sheet</h3><span class="ctx-pill" id="shCount"></span></div><button class="fv-icon-btn" data-close>×</button></div>'+
      '<div class="fv-modal-body"><div class="sh-groups">'+ DATA.map(function(d){
        return '<div class="sh-chip" data-k="'+d.cls+'|'+d.subject+'|'+d.chapter+'"><span>'+escHtml(d.chapter)+'</span><i>Class '+d.cls+' · '+SUBJ[d.subject].slice(0,4)+' · '+d.formulas.length+' formulas</i></div>';
      }).join('')+'</div>'+
      '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;align-items:center">'+
        '<button class="fv-btn" id="shFavs">'+window.__I.bookmark+'Use my bookmarks</button>'+
        '<button class="fv-btn" id="shAll">Toggle all</button>'+
        '<button class="fv-btn primary" id="shGo" style="margin-left:auto">Preview sheet →</button>'+
      '</div></div>','modal sheet-modal');
    function recount(){ const n=Object.keys(sel).filter(k=>sel[k]).length; w.querySelector('#shCount').textContent=n+' chapter'+(n===1?'':'s')+' selected'; }
    recount();
    $$('.sh-chip',w).forEach(function(ch){
      ch.onclick=function(){ const k=ch.dataset.k; sel[k]=!sel[k]; ch.classList.toggle('sel',sel[k]); recount(); };
    });
    w.querySelector('#shAll').onclick=function(){
      const any=Object.keys(sel).some(k=>!sel[k]);
      $$('.sh-chip',w).forEach(function(ch){ sel[ch.dataset.k]=any; ch.classList.toggle('sel',any); });
      recount();
    };
    w.querySelector('#shFavs').onclick=function(){
      $$('.sh-chip',w).forEach(function(ch){ const on=favs.some(f=>f.indexOf(ch.dataset.k)===0); sel[ch.dataset.k]=on; ch.classList.toggle('sel',on); });
      recount();
      if(!Object.keys(sel).some(k=>sel[k])) toast('No bookmarks yet — star some formulas first');
    };
    w.querySelector('#shGo').onclick=function(){ sheetPreview(w, sel); };
  }
  function sheetPreview(w, sel){
    const items=[];
    Object.keys(sel).filter(k=>sel[k]).forEach(function(k){
      const p=k.split('|');
      const ch=DATA.find(d=>d.cls===p[0]&&d.subject===p[1]&&d.chapter===p[2]);
      if(ch) ch.formulas.forEach(function(f){ items.push({cls:p[0],subject:p[1],chapter:p[2],f:f}); });
    });
    if(!items.length){ toast('Select at least one chapter'); return; }
    const body=w.querySelector('.fv-modal-body');
    body.innerHTML='<div class="sh-toolbar"><button class="fv-btn" id="shBack">← Chapters</button><button class="fv-btn" id="shAi">'+window.__I.sparkles+'AI top-pick 25</button><button class="fv-btn primary" id="shPrint">'+window.__I.printer+'Print / Save PDF</button></div>'+
      '<div class="sh-scroll"><div class="sheet" id="sheetGrid">'+
        '<div class="sheet-head"><h1>Formula Vault — Revision Sheet</h1><p>'+new Date().toLocaleDateString()+' · '+items.length+' formulas</p></div>'+
        items.map(function(it){
          const c=it.f;
          return '<div class="sheet-item"><div class="si-ch">'+escHtml(it.chapter)+'</div>'+
            '<div class="si-t">'+escHtml(c.t)+'</div>'+
            '<div class="si-eq">'+c.eq+'</div>'+
            (c.sym&&c.sym.length?'<div class="si-sym">'+c.sym.slice(0,4).map(s=>'<span><b>'+escHtml(s[0])+'</b> '+escHtml(s[1])+'</span>').join('')+'</div>':'')+
            (c.tip?'<div class="si-tip">'+escHtml(c.tip)+'</div>':'')+
            '<button class="si-x" title="Remove from sheet">×</button></div>';
        }).join('')+
      '</div></div>';
    w.querySelector('#shBack').onclick=function(){ closeOverlay(w); openSheet(); };
    w.querySelector('#shPrint').onclick=function(){ sheets++; store.set('sheets',sheets); window.print(); };
    w.querySelector('#shAi').onclick=function(){ aiTopPicks(w, items); };
    $$('.si-x',w).forEach(function(x){ x.onclick=function(){ x.closest('.sheet-item').remove(); }; });
  }
  function aiTopPicks(w, items){
    const btn=w.querySelector('#shAi');
    if(btn){ btn.disabled=true; btn.textContent='Picking…'; }
    const list=items.map(function(it,i){ return (i+1)+'. ['+it.chapter+'] '+it.f.t+' — '+FV.strip(it.f.eq); }).join('\n');
    let acc='';
    AI.chat([
      {role:'system',content:'You are a JEE formula prioritisation engine. Reply with ONLY a JSON array of integers — no words, no markdown fences.'},
      {role:'user',content:'From the numbered list below, return the positions (1-based) of the 25 most exam-critical formulas for JEE Main & Advanced, as a JSON array sorted by importance.\n\n'+list}
    ],{ maxTokens:400, onDelta:function(d){ acc+=d; } })
    .then(function(){
      const m=acc.match(/\[[\s\S]*?\]/); if(!m) throw new Error('bad AI reply');
      const idxs=JSON.parse(m[0]).filter(x=>typeof x==='number'&&x>=1&&x<=items.length).slice(0,25);
      if(!idxs.length) throw new Error('empty');
      const grid=w.querySelector('#sheetGrid'); if(!grid) return;
      const picks=idxs.map(i=>items[i-1]);
      grid.innerHTML='<div class="sheet-head"><h1>AI Top Picks</h1><p>'+picks.length+' highest-yield formulas chosen by AI · '+new Date().toLocaleDateString()+'</p></div>'+
        picks.map(function(it){
          const c=it.f;
          return '<div class="sheet-item"><div class="si-ch">'+escHtml(it.chapter)+'</div>'+
            '<div class="si-t">'+escHtml(c.t)+'</div>'+
            '<div class="si-eq">'+c.eq+'</div>'+
            (c.sym&&c.sym.length?'<div class="si-sym">'+c.sym.slice(0,4).map(s=>'<span><b>'+escHtml(s[0])+'</b> '+escHtml(s[1])+'</span>').join('')+'</div>':'')+
            '<button class="si-x" title="Remove from sheet">×</button></div>';
        }).join('');
      $$('.si-x',w).forEach(function(x){ x.onclick=function(){ x.closest('.sheet-item').remove(); }; });
      toast('AI picked '+picks.length+' formulas');
    })
    .catch(function(e){
      toast((e&&e.code==='AI_NO_KEY') ? 'Add an API key in AI Settings to use AI top picks' : ('AI pick failed — '+(e.message||'try again')));
      if(btn){ btn.disabled=false; btn.innerHTML=window.__I.sparkles+'AI top-pick 25'; }
    });
  }

  /* ============ Study mode (flashcards) ============ */
  function openStudy(){
  let queue;
  const favCards=favs.map(k=>CARDS.find(c=>key(c)===k)).filter(Boolean);
  if(favCards.length>=5) queue=shuffle(favCards.slice());
  else{ queue=CARDS.filter(c=>c.subject===state.subject&&(state.chapter==='all'||c.chapter===state.chapter)); if(queue.length<5) queue=CARDS.slice(); queue=shuffle(queue.slice()); }
  queue=queue.slice(0,15);
  const ST={q:queue,i:0,got:0,again:0,handler:null};
  const w=openOverlay('<div class="study-top"><button class="fv-icon-btn" id="stEnd" title="End session">×</button><div class="study-progress"><i id="stProg" style="width:0%"></i></div><span class="ctx-pill" id="stCnt"></span></div>'+
    '<div class="study-card" id="stCard"><div class="study-inner" id="stInner"></div></div>'+
    '<div class="study-btns"><button class="fv-btn again" id="stAgain">Again<span class="k">1</span></button><button class="fv-btn got" id="stGot">Got it<span class="k">2</span></button></div>'+
    '<div class="study-hintkeys">Click card or press Space to flip · 1 = again · 2 = got it</div>','study');
  function show(){
    const c=ST.q[ST.i];
    w.querySelector('#stInner').innerHTML=
      '<div class="study-face front"><div class="s-tag">'+SUBJ[c.subject]+' · '+escHtml(c.chapter)+'</div><div class="s-title">'+escHtml(c.t)+'</div><div class="s-eq">'+c.eq+'</div><div class="study-hintkeys">tap to reveal details</div></div>'+
      '<div class="study-face back"><div class="s-tag">Details</div><div class="s-title" style="font-size:15px">'+escHtml(c.t)+'</div>'+
        (c.sym&&c.sym.length?'<div class="s-body"><b>Symbols</b><br>'+c.sym.map(s=>'• <i>'+escHtml(s[0])+'</i> — '+escHtml(s[1])).join('<br>')+'</div>':'')+
        (c.cases&&c.cases.length?'<div class="s-body"><b>Special cases</b><br>'+c.cases.map(x=>'• '+escHtml(FV.strip(x))).join('<br>')+'</div>':'')+
        (c.tip?'<div class="s-body" style="border-left:2px solid var(--amber);padding-left:10px"><b style="color:var(--amber)">Tip</b> — '+escHtml(c.tip)+'</div>':'')+
      '</div>';
    w.querySelector('#stCnt').textContent=(ST.i+1)+' / '+ST.q.length;
    w.querySelector('#stProg').style.width=(ST.i/ST.q.length*100)+'%';
    w.querySelector('#stCard').classList.remove('flipped');
  }
  function flip(){ w.querySelector('#stCard').classList.toggle('flipped'); }
  function rate(got){
    const c=ST.q[ST.i]; const k=key(c); const rec=study[k]||(study[k]={seen:0,known:0});
    rec.seen++; if(got) rec.known++; else rec.known=Math.max(0,rec.known-1);
    if(got) ST.got++; else ST.again++; store.set('study',study);
    if(ST.i+1>=ST.q.length){ summary(); closeOverlay(w); }
    else{ ST.i++; show(); }
  }
  function summary(){
    const total=ST.got+ST.again; if(!total) return;
    const pct=Math.round(100*ST.got/total);
    toast('Session: '+ST.got+' correct, '+ST.again+' again ('+pct+'%)');
    if(pct>=80) confetti(80);
  }
  w.querySelector('#stCard').onclick=flip;
  w.querySelector('#stAgain').onclick=()=>rate(false);
  w.querySelector('#stGot').onclick=()=>rate(true);
  w.querySelector('#stEnd').onclick=()=>{ summary(); closeOverlay(w); };
  ST.handler=function(e){
    if(overlayStack.indexOf(w)===-1){ document.removeEventListener('keydown',ST.handler); return; }
    if(e.code==='Space'){ e.preventDefault(); flip(); }
    else if(e.key==='1') rate(false);
    else if(e.key==='2') rate(true);
  };
  document.addEventListener('keydown',ST.handler);
  show();
}

/* ============ Smart calculators ============ */
const CALCS={
  proj:{ic:'rocket',name:'Projectile',fields:[['u','Initial speed u (m/s)'],['th','Angle θ (°)']],compute:function(v){ const u=+v.u, thd=+v.th; if(!(u>0)||isNaN(thd)) return 'Enter u and θ.'; const th=thd*Math.PI/180, g=9.8; const T=2*u*Math.sin(th)/g, H=u*u*Math.pow(Math.sin(th),2)/(2*g), R=u*u*Math.sin(2*th)/g; return '<b>T = '+T.toFixed(2)+' s</b><br><b>H = '+H.toFixed(2)+' m</b><br><b>R = '+R.toFixed(2)+' m</b>'; }},
  kin:{ic:'gauge',name:'Kinematics',fields:[['u','u (m/s)'],['a','a (m/s²)'],['t','t (s)']],compute:function(v){ const u=+v.u,a=+v.a,t=+v.t; if(isNaN(u)||isNaN(a)||isNaN(t)) return 'Fill u, a and t.'; return '<b>v = '+(u+a*t).toFixed(2)+' m/s</b><br><b>s = '+(u*t+0.5*a*t*t).toFixed(2)+' m</b>'; }},
  ohm:{ic:'zap',name:'Ohm & Power',fields:[['V','Voltage V (V) — leave one blank'],['I','Current I (A)'],['R','Resistance R (Ω)']],compute:function(v){ const f=x=>x!==''&&!isNaN(+x); let V=v.V,I=v.I,R=v.R; if(f(V)&&f(I)&&!f(R)) R=+V/+I; else if(f(V)&&f(R)&&!f(I)) I=+V/+R; else if(f(I)&&f(R)&&!f(V)) V=+I*+R; else return 'Fill exactly two fields.'; return '<b>V = '+V.toFixed(2)+' V</b><br><b>I = '+I.toFixed(2)+' A</b><br><b>R = '+R.toFixed(2)+' Ω</b><br><b>P = '+(V*I).toFixed(2)+' W</b>'; }},
  gas:{ic:'wind',name:'Ideal gas',fields:[['P','Pressure P (Pa)'],['V','Volume V (m³)'],['n','Moles n (mol)'],['T','Temperature T (K)']],compute:function(v){ const f=x=>x!==''&&!isNaN(+x); const R=8.314; if(['P','V','n','T'].filter(k=>f(v[k])).length!==3) return 'Fill exactly three of P, V, n, T.'; let P=f(v.P)?+v.P:null,V=f(v.V)?+v.V:null,n=f(v.n)?+v.n:null,T=f(v.T)?+v.T:null; if(P===null)P=n*R*T/V; if(V===null)V=n*R*T/P; if(n===null)n=P*V/(R*T); if(T===null)T=P*V/(n*R); return '<b>P = '+P.toFixed(2)+' Pa</b><br><b>V = '+V.toFixed(4)+' m³</b><br><b>n = '+n.toFixed(4)+' mol</b><br><b>T = '+T.toFixed(2)+' K</b>'; }},
  acid:{ic:'flask',name:'pH & [H⁺]',fields:[['h','[H⁺] concentration (M)']],compute:function(v){ const h=+v.h; if(!(h>0)) return 'Enter a positive concentration.'; const pH=-Math.log10(h), pOH=14-pH; return '<b>pH = '+pH.toFixed(2)+'</b><br><b>pOH = '+pOH.toFixed(2)+'</b><br><b>[OH⁻] = '+Math.pow(10,-pOH).toExponential(2)+' M</b>'; }},
  quad:{ic:'fn',name:'Quadratic',fields:[['a','a'],['b','b'],['c','c']],compute:function(v){ const a=+v.a,b=+v.b,c=+v.c; if(isNaN(a)||isNaN(b)||isNaN(c)) return 'Enter a, b, c.'; if(a===0) return b===0?'Not an equation.':'Linear: x = '+(-c/b); const D=b*b-4*a*c; let roots; if(D>0) roots='x₁ = '+((-b+Math.sqrt(D))/(2*a)).toFixed(4)+', x₂ = '+((-b-Math.sqrt(D))/(2*a)).toFixed(4); else if(D===0) roots='x = '+(-b/(2*a)); else roots='x = '+(-b/(2*a)).toFixed(4)+' ± '+(Math.sqrt(-D)/(2*a)).toFixed(4)+'i'; return '<b>D = '+D+'</b> ('+(D>0?'two real roots':D===0?'equal real roots':'complex roots')+')<br><b>'+roots+'</b>'; }},
  mol:{ic:'droplet',name:'Molarity',fields:[['n','Moles of solute (mol)'],['V','Solution volume (L)']],compute:function(v){ const n=+v.n,V=+v.V; if(!(n>0)||!(V>0)) return 'Enter moles and volume.'; return '<b>M = '+(n/V).toFixed(4)+' mol/L</b>'; }},
  err:{ic:'target',name:'% Error',fields:[['tv','True value'],['mv','Measured value']],compute:function(v){ const t=+v.tv,m=+v.mv; if(isNaN(t)||isNaN(m)||t===0) return 'Enter both values (true ≠ 0).'; const ae=Math.abs(t-m); return '<b>Absolute error = '+ae.toFixed(4)+'</b><br><b>% error = '+(ae/Math.abs(t)*100).toFixed(2)+'%</b>'; }}
};
function openCalc(){
  const keys=Object.keys(CALCS);
  const w=openOverlay('<div class="fv-modal-head"><h3>'+window.__I.calculator+'Smart Calculators</h3><button class="fv-icon-btn" data-close>×</button></div>'+
    '<div class="calc-tabs">'+keys.map((k,i)=>'<button class="calc-tab'+(i===0?' active':'')+'" data-k="'+k+'">'+window.__I[CALCS[k].ic]+CALCS[k].name+'</button>').join('')+'</div>'+
    '<div class="fv-modal-body"><div class="calc-grid" id="calcGrid"></div></div>','modal');
  let cur=keys[0];
  function render(){
    const c=CALCS[cur]; const grid=w.querySelector('#calcGrid');
    grid.innerHTML=c.fields.map(f=>'<div class="calc-field"><label>'+f[1]+'</label><input data-f="'+f[0]+'" type="number" step="any" placeholder="—"></div>').join('')+'<div class="calc-out" id="calcOut">Fill the fields above ↑</div>';
    $$('input',grid).forEach(inp=>inp.oninput=()=>{ const v={}; $$('input',grid).forEach(i=>v[i.dataset.f]=i.value); w.querySelector('#calcOut').innerHTML=c.compute(v); });
  }
  $$('.calc-tab',w).forEach(b=>b.onclick=()=>{ $$('.calc-tab',w).forEach(x=>x.classList.remove('active')); b.classList.add('active'); cur=b.dataset.k; render(); });
  render();
}

function exportData(){
  const blob=new Blob([JSON.stringify({favs:favs,sheets:sheets,study:study,streak:streak,settings:settings,v:2},null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='formula-vault-data.json'; a.click();
  toast('Data exported');
}
function importData(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
  inp.onchange=function(){ const f=inp.files[0]; if(!f) return; const r=new FileReader();
    r.onload=function(){ try{ const d=JSON.parse(r.result); if(d.favs)favs=d.favs; if(d.sheets)sheets=d.sheets; if(d.study)study=d.study; if(d.streak)streak=d.streak; if(d.settings)settings=Object.assign({},settings,d.settings); saveAll(); updateFavBadge(); FV.renderAll(); toast('Data imported'); }catch(e){ toast('Invalid file'); } };
    r.readAsText(f); };
  inp.click();
}
function resetAll(){
  if(!confirm('Reset all bookmarks, study and revision-sheet progress?')) return;
  favs=[]; sheets=0; study={};
  streak={count:1,last:new Date().toDateString(),days:[new Date().toDateString()]};
  saveAll(); updateFavBadge(); FV.renderAll(); toast('Progress reset');
}

/* ============ Bookmarks ============ */
function openFavs(){
  const cards=favs.map(k=>CARDS.find(c=>key(c)===k)).filter(Boolean);
  const w=openOverlay('<div class="fv-modal-head"><h3>'+window.__I.star+'Bookmarks</h3><button class="fv-icon-btn" data-close>×</button></div><div class="fv-modal-body">'+
    (cards.length?cards.map(function(c){ return '<div class="fav-row"><span class="fav-dot" style="background:'+ACCENT[c.subject]+'"></span><div class="fav-main" data-jump="'+escHtml(key(c))+'"><b>'+escHtml(c.t)+'</b><span>Class '+c.cls+' · '+SUBJ[c.subject]+' · '+escHtml(c.chapter)+'</span></div><button class="fav-x" data-x="'+escHtml(key(c))+'" title="Remove">×</button></div>'; }).join(''):'<div style="text-align:center;padding:30px 10px;color:var(--text-low)">No bookmarks yet.<br>Tap the star on any formula card to pin it here.</div>')+
  '</div>','modal');
  $$('[data-jump]',w).forEach(el=>el.onclick=()=>{ const c=CARDS.find(x=>key(x)===el.dataset.jump); if(c) jumpToCard(c); });
  $$('[data-x]',w).forEach(el=>el.onclick=()=>{ favs=favs.filter(k=>k!==el.dataset.x); store.set('favs',favs); updateFavBadge(); el.closest('.fav-row').remove(); FV.renderAll(); toast('Removed from bookmarks'); });
}
function jumpToCard(c){
  closeOverlay();
  jumpTo(c.cls,c.subject,c.chapter,'formulas');
  setTimeout(function(){
    const el=document.querySelector('#grid .card-outer[data-idx="'+CARDS.indexOf(c)+'"]');
    if(el){ el.scrollIntoView({behavior:'smooth',block:'center'}); el.classList.add('fv-flash'); setTimeout(()=>el.classList.remove('fv-flash'),1300); }
  },150);
}

/* ============ Navigation helpers ============ */
function jumpTo(cls,subject,chapter,mode){
  closeOverlay();
  const si=document.getElementById('search'); if(si){ si.value=''; document.getElementById('clearSearch').classList.remove('show'); }
  if(mode){ const mb=document.querySelector('#modeSeg [data-mode="'+mode+'"]'); if(mb&&!mb.classList.contains('active')) mb.click(); }
  const cb=document.querySelector('#classSeg [data-class="'+cls+'"]'); if(cb&&!cb.classList.contains('active')) cb.click();
  const sb=document.querySelector('#subjectSeg [data-subject="'+subject+'"]'); if(sb&&!sb.classList.contains('active')) sb.click();
  state.query='';
  if(chapter&&chapter!=='all'){ setTimeout(function(){ const chip=document.querySelector('#chapterChips .chip[data-chapter="'+chapter.replace(/"/g,'&quot;')+'"]'); if(chip) chip.click(); },50); }
  else { FV.renderAll(); }
  window.scrollTo({top:0,behavior:'smooth'});
}
  function updateFavBadge(){ const b=document.getElementById('fvFavCount'); if(b) b.textContent=favs.length||''; }
function heroCounters(){
  [['hTotal',CARDS.length],['hDeriv',DCARDS.length],['hLaws',LCARDS.length]].forEach(function(pair){
    const el=document.getElementById(pair[0]); if(!el) return; let cur=0;
    const step=Math.max(1,Math.round(pair[1]/28));
    const iv=setInterval(function(){ cur+=step; if(cur>=pair[1]){ cur=pair[1]; clearInterval(iv); } el.textContent=cur; },28);
  });
}
document.getElementById('grid').addEventListener('click', function(e){
  const fav=e.target.closest('.fv-fav');
  if(fav){ const c=CARDS[+fav.dataset.fav]; if(!c) return; const k=key(c);
    if(favs.indexOf(k)!==-1){ favs=favs.filter(x=>x!==k); fav.classList.remove('active'); fav.innerHTML=window.__I.star; }
    else{ favs.push(k); fav.classList.add('active'); fav.innerHTML=window.__I.starFilled; toast('Bookmarked — '+c.t.slice(0,42)); }
    store.set('favs',favs); updateFavBadge(); return; }
  const ex=e.target.closest('.fv-explain');
  if(ex){ const c=CARDS[+ex.dataset.explain]; if(c) openExplain(c); }
});
document.getElementById('fvBtnTutor').onclick=openTutor;
document.getElementById('fvBtnFavs').onclick=openFavs;
$$('[data-open]').forEach(function(b){ b.addEventListener('click',function(){ const fn={tutor:openTutor,sheet:openSheet,study:openStudy,calc:openCalc}[b.dataset.open]; if(fn) fn(); }); });
/* comment: application keyboard shortcuts removed with the command palette */
FV.onRender(function(){ document.body.setAttribute('data-subject', state.subject); reveal(); });
updateFavBadge(); heroCounters();
FV.renderAll();
})();
