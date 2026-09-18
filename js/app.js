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
let settings = store.get('settings', {provider:'auto'});
if(!settings||typeof settings!=='object'||Array.isArray(settings)) settings={provider:'auto'};
if(typeof settings.provider!=='string'||['auto','groq','google','openrouter'].indexOf(settings.provider)===-1) settings.provider='auto';
if(!settings.aiKeys||typeof settings.aiKeys!=='object') settings.aiKeys={};
['groq','google','openrouter'].forEach(function(p){ settings.aiKeys[p]=typeof settings.aiKeys[p]==='string'?settings.aiKeys[p]:''; });
function key(c){ return c.cls+'|'+c.subject+'|'+c.chapter+'|'+c.t; }
function saveAll(){ store.set('favs',favs); store.set('sheets',sheets); store.set('study',study); store.set('settings',settings); }
window.__fvIsFav = function(c){ return favs.indexOf(key(c))!==-1; };

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
    o=o||{};
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
      '<div class="fv-threads-head"><b>Conversations</b><span class="fv-threads-acts"><button class="fv-txtbtn" id="fvNewInList">New chat</button><button class="fv-icon-btn" id="fvCloseThreads" title="Close conversations" aria-label="Close conversations">×</button></span></div>'+
      (list.length ? list.map(function(th){
        return '<div class="fv-thread'+(th.id===activeThread.id?' active':'')+'" data-tid="'+th.id+'">'+
          '<div class="fv-thread-main"><b>'+escHtml(th.title||'Chat')+'</b><span>'+new Date(th.updated).toLocaleString(undefined,{month:'short',day:'numeric'})+' · '+th.msgs.length+' msg'+(th.msgs.length===1?'':'s')+'</span></div>'+
          '<button class="fv-thread-x" data-tdel="'+th.id+'" title="Delete conversation">×</button></div>';
      }).join('') : '<div class="fv-threads-empty">No conversations yet. Start one below.</div>');
    $$('[data-tid]',thrEl).forEach(function(el){ el.onclick=function(){ switchThread(el.dataset.tid); }; });
    $$('[data-tdel]',thrEl).forEach(function(b){ b.onclick=function(ev){ ev.stopPropagation(); deleteThread(b.dataset.tdel); }; });
    const nb=thrEl.querySelector('#fvNewInList'); if(nb){ nb.onclick=newThread; }
    const cb=thrEl.querySelector('#fvCloseThreads'); if(cb){ cb.onclick=function(){ w.classList.remove('threads-open'); }; }
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
function fmtN(x,d){
  if(typeof x!=='number'||!isFinite(x)) return '—';
  d=(d==null?4:d);
  const a=Math.abs(x);
  if(a>=1e6||(a<1e-4&&a>0)) return Number(x.toExponential(d)).toString();
  return String(Number(x.toFixed(d)));
}
const CalcEngine=(function(){
  const FUNCS={
    sin:Math.sin, cos:Math.cos, tan:Math.tan, asin:Math.asin, acos:Math.acos, atan:Math.atan,
    sec:function(x){return 1/Math.cos(x);}, csc:function(x){return 1/Math.sin(x);}, cot:function(x){return 1/Math.tan(x);},
    sinh:Math.sinh, cosh:Math.cosh, tanh:Math.tanh,
    ln:Math.log, log:Math.log10, log2:Math.log2,
    sqrt:Math.sqrt, cbrt:Math.cbrt, abs:Math.abs, exp:Math.exp,
    floor:Math.floor, ceil:Math.ceil, round:Math.round
  };
  const CONSTS={ pi:Math.PI, e:Math.E, tau:2*Math.PI };
  const DEG_TRIG={ sin:1,cos:1,tan:1,sec:1,csc:1,cot:1,sinh:1,cosh:1,tanh:1 };
  const DEG_INV={ asin:1,acos:1,atan:1 };
  function normalize(src){ return String(src).replace(/[×∗]/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt'); }
  function tokenize(src){
    const toks=[]; let i=0;
    while(i<src.length){
      const ch=src[i];
      if(ch===' '||ch==='\t'||ch==='\n'){ i++; continue; }
      const nm=/^((?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)/.exec(src.slice(i));
      if(nm){ toks.push({t:'num',v:parseFloat(nm[0])}); i+=nm[0].length; continue; }
      const im=/^[A-Za-z_]+/.exec(src.slice(i));
      if(im){ toks.push({t:'id',v:im[0].toLowerCase()}); i+=im[0].length; continue; }
      if(ch==='*'&&src[i+1]==='*'){ toks.push({t:'op',v:'^'}); i+=2; continue; }
      if(ch===','){ toks.push({t:'comma',v:ch}); i++; continue; }
      if(ch==='('){ toks.push({t:'lp',v:ch}); i++; continue; }
      if(ch===')'){ toks.push({t:'rp',v:ch}); i++; continue; }
      if('+-*/%^!'.indexOf(ch)!==-1){ toks.push({t:'op',v:ch}); i++; continue; }
      throw new Error('Unexpected character "'+ch+'"');
    }
    return toks;
  }
  function applyFn(name,args,deg){
    const arg=args[0];
    const input=DEG_TRIG[name]&&deg ? arg*Math.PI/180 : arg;
    const r = name==='log'&&args.length===2 ? Math.log(args[1])/Math.log(args[0]) : FUNCS[name](input);
    return DEG_INV[name]&&deg ? r*180/Math.PI : r;
  }
  function fact(x){ let r=1; for(let k=2;k<=x;k++) r*=k; return r; }
  function parse(toks, env){
    let pos=0;
    function peek(){ return toks[pos]||null; }
    function next(){ return toks[pos++]; }
    function match(t){ const tk=peek(); if(tk&&tk.t===t){ pos++; return true; } return false; }
    function parseAdd(){ let l=parseMul(); for(;;){ const tk=peek(); if(tk&&tk.t==='op'&&(tk.v==='+'||tk.v==='-')){ next(); const r=parseMul(); l=tk.v==='+'?l+r:l-r; } else return l; } }
    function parseMul(){ let l=parseUnary(); for(;;){ const tk=peek(); if(tk&&tk.t==='op'&&(tk.v==='*'||tk.v==='/'||tk.v==='%')){ next(); const r=parseUnary(); if(tk.v==='*') l=l*r; else if(tk.v==='/'){ if(r===0) throw new Error('Division by zero'); l=l/r; } else l=l%r; } else if(tk&&(tk.t==='num'||tk.t==='id'||tk.t==='lp')){ const r=parseUnary(); l=l*r; } else return l; } }
    function parseUnary(){ const tk=peek(); if(tk&&tk.t==='op'&&(tk.v==='-'||tk.v==='+')){ next(); const r=parseUnary(); return tk.v==='-'?-r:r; } return parsePower(); }
    function parsePower(){ const l=parsePostfix(); const tk=peek(); if(tk&&tk.t==='op'&&tk.v==='^'){ next(); const r=parseUnary(); return Math.pow(l,r); } return l; }
    function parsePostfix(){ let v=parseAtom(); for(;;){ const tk=peek(); if(tk&&tk.t==='op'&&tk.v==='!'){ next(); if(v<0||v!==Math.floor(v)) throw new Error('Factorial needs a non-negative integer'); v=fact(v); } else return v; } }
    function parseAtom(){
      const tk=next();
      if(!tk) throw new Error('Incomplete expression');
      if(tk.t==='num') return tk.v;
      if(tk.t==='lp'){ const v=parseAdd(); if(!match('rp')) throw new Error('Missing closing )'); return v; }
      if(tk.t==='id'){
        const name=tk.v;
        if(name in FUNCS){
          if(!match('lp')) throw new Error(name+' needs parentheses, e.g. '+name+'(60)');
          const args=[parseAdd()];
          while(match('comma')) args.push(parseAdd());
          if(!match('rp')) throw new Error('Missing closing )');
          if(args.length>2) throw new Error(name+' accepts at most 2 arguments');
          return applyFn(name,args,env.deg);
        }
        if(name in CONSTS) return CONSTS[name];
        if(Object.prototype.hasOwnProperty.call(env.vars,name)) return env.vars[name];
        throw new Error('Unknown symbol "'+tk.v+'"');
      }
      throw new Error('Unexpected token');
    }
    const v=parseAdd();
    if(pos<toks.length) throw new Error('Unexpected input');
    return v;
  }
  function evaluate(expr,opts){
    opts=opts||{};
    const env={ deg: !!opts.deg, vars: Object.assign({ans:0}, opts.vars||{}) };
    try{
      const toks=tokenize(normalize(expr));
      if(!toks.length) return {ok:false, error:'Type an expression…'};
      return {ok:true, value:parse(toks,env)};
    }catch(e){ return {ok:false, error:(e&&e.message)||'Invalid expression'}; }
  }
  return { eval:evaluate };
})();
const CALCS={
  proj:{ic:'rocket',name:'Projectile',formula:'T = 2u·sinθ/g &nbsp; H = u²sin²θ/(2g) &nbsp; R = u²sin2θ/g',fields:[['u','Initial speed u (m/s)'],['th','Angle θ (°)']],compute:function(v){ const u=+v.u, thd=+v.th; if(!(u>0)) return 'Enter a positive initial speed u.'; if(isNaN(thd)) return 'Enter the launch angle θ.'; const th=thd*Math.PI/180, g=9.8; const T=2*u*Math.sin(th)/g, H=u*u*Math.pow(Math.sin(th),2)/(2*g), R=u*u*Math.sin(2*th)/g; return '<b>Time of flight T = '+fmtN(T,2)+' s</b><br><b>Max height H = '+fmtN(H,2)+' m</b><br><b>Range R = '+fmtN(R,2)+' m</b>'; }},
  kin:{ic:'gauge',name:'Kinematics',formula:'v = u + at &nbsp; s = ut + ½at²',fields:[['u','Initial velocity u (m/s)'],['a','Acceleration a (m/s²)'],['t','Time t (s)']],compute:function(v){ const u=+v.u,a=+v.a,t=+v.t; if(isNaN(u)||isNaN(a)||isNaN(t)) return 'Enter u, a and t to get v and s.'; return '<b>v = '+fmtN(u+a*t,2)+' m/s</b><br><b>s = '+fmtN(u*t+0.5*a*t*t,2)+' m</b>'; }},
  fall:{ic:'layers',name:'Free fall',formula:'v = gt &nbsp; h = ½gt² &nbsp; v = √(2gh)',fields:[['h','Height h (m) — leave blank if using t'],['t','Time t (s) — leave blank if using h']],compute:function(v){ const g=9.8, h=+v.h, t=+v.t; const hasH=h>0, hasT=t>0; if(!hasH&&!hasT) return 'Enter a positive height or time.'; let H,T,V; if(hasH){ H=h; T=Math.sqrt(2*h/g); V=Math.sqrt(2*g*h); } else { T=t; H=0.5*g*t*t; V=g*t; } return '<b>Fallen height h = '+fmtN(H,2)+' m</b><br><b>Time to land t = '+fmtN(T,2)+' s</b><br><b>Impact speed v = '+fmtN(V,2)+' m/s</b>'; }},
  spring:{ic:'x',name:'Spring energy',formula:'F = kx &nbsp; U = ½kx²',fields:[['k','Spring constant k (N/m)'],['x','Displacement x (m)']],compute:function(v){ const k=+v.k,x=+v.x; if(isNaN(k)||isNaN(x)) return 'Enter k and x.'; return '<b>Force F = '+fmtN(k*x,2)+' N</b><br><b>Potential energy U = '+fmtN(0.5*k*x*x,2)+' J</b>'; }},
  pend:{ic:'settings',name:'Pendulum',formula:'T = 2π√(L/g)',fields:[['L','Pendulum length L (m)'],['g','Gravity g (m/s²)']],compute:function(v){ const L=+v.L,g=+v.g||9.8; if(!(L>0)||!(g>0)) return 'Enter a positive length L.'; const T=2*Math.PI*Math.sqrt(L/g); return '<b>Period T = '+fmtN(T,2)+' s</b><br><b>Frequency f = '+fmtN(1/T,3)+' Hz</b>'; }},
  ohm:{ic:'zap',name:"Ohm's law",formula:'V = IR &nbsp; P = VI',fields:[['V','Voltage V (V) — leave one blank'],['I','Current I (A)'],['R','Resistance R (Ω)']],compute:function(v){ const f=x=>x!==''&&!isNaN(+x); const V=f(v.V)?+v.V:null, I=f(v.I)?+v.I:null, R=f(v.R)?+v.R:null; if(V!==null&&I!==null&&R===null) R=V/I; else if(V!==null&&R!==null&&I===null) I=V/R; else if(I!==null&&R!==null&&V===null) V=I*R; else return 'Fill any two of V, I, R.'; return '<b>V = '+fmtN(V,2)+' V</b><br><b>I = '+fmtN(I,2)+' A</b><br><b>R = '+fmtN(R,2)+' Ω</b><br><b>Power P = '+fmtN(V*I,2)+' W</b>'; }},
  res:{ic:'target',name:'Resistors',formula:'Series: R = R₁+R₂ &nbsp; Parallel: R = R₁R₂/(R₁+R₂)',fields:[['r1','Resistor R₁ (Ω)'],['r2','Resistor R₂ (Ω)']],compute:function(v){ const r1=+v.r1,r2=+v.r2; if(!(r1>0)||!(r2>0)) return 'Enter two positive resistances.'; return '<b>Series equivalent = '+fmtN(r1+r2,2)+' Ω</b><br><b>Parallel equivalent = '+fmtN(r1*r2/(r1+r2),2)+' Ω</b>'; }},
  energy:{ic:'sparkles',name:'Kinetic energy',formula:'KE = ½mv²',fields:[['m','Mass m (kg)'],['v','Speed v (m/s)']],compute:function(v){ const m=+v.m,vv=+v.v; if(!(m>0)||!(vv>0)) return 'Enter positive mass and speed.'; return '<b>KE = '+fmtN(0.5*m*vv*vv,2)+' J</b>'; }},
  cent:{ic:'bookmark',name:'Centripetal',formula:'a = v²/r &nbsp; F = mv²/r',fields:[['m','Mass m (kg)'],['v','Speed v (m/s)'],['r','Radius r (m)']],compute:function(v){ const m=+v.m,vv=+v.v,r=+v.r; if(isNaN(m)||isNaN(vv)||!(r>0)) return 'Enter mass, speed and a positive radius.'; const a=vv*vv/r; return '<b>Centripetal acceleration a = '+fmtN(a,2)+' m/s²</b><br><b>Centripetal force F = '+fmtN(m*a,2)+' N</b>'; }},
  grav:{ic:'moon',name:'Gravitation',formula:'F = Gm₁m₂/r²',fields:[['m1','Mass m₁ (kg)'],['m2','Mass m₂ (kg)'],['r','Separation r (m)']],compute:function(v){ const m1=+v.m1,m2=+v.m2,r=+v.r; if(isNaN(m1)||isNaN(m2)||!(r>0)) return 'Enter masses and a positive separation.'; return '<b>Force F = '+fmtN(6.674e-11*m1*m2/(r*r),3)+' N</b>'; }},
  orbit:{ic:'star',name:'Orbital motion',formula:'v = √(GM/r) &nbsp; T = 2π√(r³/GM)',fields:[['M','Central mass M (kg)'],['r','Orbit radius r (m)']],compute:function(v){ const M=+v.M,r=+v.r; if(!(M>0)||!(r>0)) return 'Enter a positive central mass and radius.'; const G=6.674e-11, vOrb=Math.sqrt(G*M/r), T=2*Math.PI*Math.sqrt(r*r*r/(G*M)); return '<b>Orbital speed v = '+fmtN(vOrb,2)+' m/s</b><br><b>Orbital period T = '+fmtN(T,2)+' s</b>'; }},
  eff:{ic:'fileText',name:'Efficiency',formula:'η = W_out/W_in × 100%',fields:[['win','Energy input W_in (J)'],['wout','Useful output W_out (J)']],compute:function(v){ const win=+v.win,wout=+v.wout; if(!(win>0)||isNaN(wout)) return 'Enter energy input and output.'; return '<b>Efficiency η = '+fmtN(wout/win*100,2)+'%</b><br><b>Loss = '+fmtN(win-wout,2)+' J</b>'; }},
  wave:{ic:'printer',name:'Wave speed',formula:'v = f·λ &nbsp; T = 1/f',fields:[['v','Wave speed v (m/s)'],['f','Frequency f (Hz)']],compute:function(v){ const vv=+v.v,f=+v.f; if(!(vv>0)||!(f>0)) return 'Enter positive speed and frequency.'; return '<b>Wavelength λ = '+fmtN(vv/f,3)+' m</b><br><b>Period T = '+fmtN(1/f,3)+' s</b>'; }},
  heat:{ic:'messagePlus',name:'Heat transfer',formula:'Q = mcΔT',fields:[['m','Mass m (kg)'],['c','Specific heat c (J/kg·K)'],['dt','Temperature change ΔT (K or °C)']],compute:function(v){ const m=+v.m,c=+v.c,dt=+v.dt; if(isNaN(m)||isNaN(c)||isNaN(dt)) return 'Enter m, c and ΔT.'; return '<b>Q = '+fmtN(m*c*dt,2)+' J</b>'; }},
  gas:{ic:'wind',name:'Ideal gas',formula:'PV = nRT &nbsp; R = 8.314 J/mol·K',fields:[['P','Pressure P (Pa) — leave one blank'],['V','Volume V (m³)'],['n','Moles n (mol)'],['T','Temperature T (K)']],compute:function(v){ const f=x=>x!==''&&!isNaN(+x); const R=8.314; const P=f(v.P)?+v.P:null, V=f(v.V)?+v.V:null, n=f(v.n)?+v.n:null, T=f(v.T)?+v.T:null; if([P,V,n,T].filter(x=>x!==null).length!==3) return 'Fill exactly three of P, V, n, T.'; let p=P,Vv=V,nn=n,tt=T; if(p===null)p=nn*R*tt/Vv; if(Vv===null)Vv=nn*R*tt/p; if(nn===null)nn=p*Vv/(R*tt); if(tt===null)tt=p*Vv/(nn*R); return '<b>P = '+fmtN(p,2)+' Pa</b><br><b>V = '+fmtN(Vv,3)+' m³</b><br><b>n = '+fmtN(nn,3)+' mol</b><br><b>T = '+fmtN(tt,2)+' K</b>'; }},
  acid:{ic:'flask',name:'pH & [H⁺]',formula:'pH = −log₁₀[H⁺] &nbsp; pOH = 14 − pH',fields:[['h','[H⁺] concentration (M)']],compute:function(v){ const h=+v.h; if(!(h>0)) return 'Enter a positive [H⁺] concentration.'; const pH=-Math.log10(h), pOH=14-pH; return '<b>pH = '+fmtN(pH,2)+'</b><br><b>pOH = '+fmtN(pOH,2)+'</b><br><b>[OH⁻] = '+fmtN(Math.pow(10,-pOH),4)+' M</b>'; }},
  buffer:{ic:'droplet',name:'Buffer pH',formula:'pH = pKₐ + log([salt]/[acid])',fields:[['pka','pKₐ of the weak acid'],['a','[Acid] concentration (M)'],['s','[Conjugate base] concentration (M)']],compute:function(v){ const pka=+v.pka,a=+v.a,s=+v.s; if(isNaN(pka)||!(a>0)||!(s>0)) return 'Enter pKₐ and positive concentrations.'; const pH=pka+Math.log10(s/a); return '<b>pH = '+fmtN(pH,2)+'</b><br><b>[H⁺] = '+fmtN(Math.pow(10,-pH),4)+' M</b>'; }},
  mol:{ic:'calculator',name:'Molarity',formula:'M = n/V (volume in litres)',fields:[['n','Moles of solute (mol)'],['V','Volume of solution (L)']],compute:function(v){ const n=+v.n,V=+v.V; if(!(n>0)||!(V>0)) return 'Enter moles and volume (positive).'; return '<b>Molarity M = '+fmtN(n/V,4)+' mol/L</b>'; }},
  dil:{ic:'history',name:'Dilution',formula:'M₁V₁ = M₂V₂',fields:[['m1','Initial concentration M₁ (M)'],['v1','Initial volume V₁ (L)'],['v2','Final volume V₂ (L)']],compute:function(v){ const m1=+v.m1,v1=+v.v1,v2=+v.v2; if(!(m1>0)||!(v1>0)||!(v2>0)) return 'Enter positive values.'; return '<b>Final concentration M₂ = '+fmtN(m1*v1/v2,4)+' M</b>'; }},
  half:{ic:'target',name:'Half-life',formula:'λ = ln2/t½ &nbsp; fraction = 2^(−t/t½)',fields:[['th','Half-life t½ (s or any time unit)'],['t','Elapsed time t (same unit)']],compute:function(v){ const th=+v.th,t=+v.t; if(!(th>0)||!(t>=0)) return 'Enter a positive half-life and an elapsed time.'; const lam=Math.LN2/th, rem=Math.pow(2,-t/th); return '<b>Decay constant λ = '+fmtN(lam,4)+' s⁻¹</b><br><b>Fraction remaining = '+fmtN(rem,4)+' ('+fmtN(rem*100,2)+'%)</b>'; }},
  quad:{ic:'fn',name:'Quadratic',formula:'x = (−b ± √(b² − 4ac)) / 2a',fields:[['a','a (x² coefficient)'],['b','b (x coefficient)'],['c','c (constant)']],compute:function(v){ const a=+v.a,b=+v.b,c=+v.c; if(isNaN(a)||isNaN(b)||isNaN(c)) return 'Enter a, b and c.'; if(a===0) return b===0?'Not a quadratic equation.':'Linear root: x = '+fmtN(-c/b,4); const D=b*b-4*a*c; let roots; if(D>0) roots='x₁ = '+fmtN((-b+Math.sqrt(D))/(2*a),4)+', x₂ = '+fmtN((-b-Math.sqrt(D))/(2*a),4); else if(D===0) roots='x = '+fmtN(-b/(2*a),4); else roots='x = '+fmtN(-b/(2*a),4)+' ± '+fmtN(Math.sqrt(-D)/(2*a),4)+'i'; return '<b>Discriminant D = '+fmtN(D,2)+'</b> ('+(D>0?'two real roots':D===0?'one repeated root':'complex roots')+')<br><b>'+roots+'</b>'; }},
  err:{ic:'droplet',name:'% Error',formula:'% error = |true − measured| / |true| × 100',fields:[['tv','True value'],['mv','Measured value']],compute:function(v){ const t=+v.tv,m=+v.mv; if(isNaN(t)||isNaN(m)||t===0) return 'Enter both values — the true value cannot be 0.'; const ae=Math.abs(t-m); return '<b>Absolute error = '+fmtN(ae,4)+'</b><br><b>Percentage error = '+fmtN(ae/Math.abs(t)*100,2)+'%</b>'; }}
};
const NK_ORDER=[['C','clear'],['⌫','back'],['±','neg'],['÷','op'],['7','n'],['8','n'],['9','n'],['×','op'],['4','n'],['5','n'],['6','n'],['−','op'],['1','n'],['2','n'],['3','n'],['+','op'],['0','n'],['.','dot'],['=','eq']];
const SK_ORDER=[
  ['C','clear'],['⌫','back'],['(','lp'],[')','rp'],['%','op'],
  ['x²','sq'],['x³','cube'],['xʸ','pow'],['√','sqrt'],['∛','cbrt'],
  ['7','n'],['8','n'],['9','n'],['÷','op'],['1/x','inv'],
  ['4','n'],['5','n'],['6','n'],['×','op'],['ln','ln'],
  ['1','n'],['2','n'],['3','n'],['−','op'],['log','log'],
  ['0','n'],['.','dot'],['±','neg'],['+','op'],['=','eq'],
  ['sin','sin'],['cos','cos'],['tan','tan'],['π','pi'],['!','fact'],
  ['asin','asin'],['acos','acos'],['atan','atan'],['|x|','abs'],['e','e']
];
const SCI_CONSTS=[
  ['π',''+Math.PI],['e (Euler)',''+Math.E],['g — gravity, m/s²','9.80665'],['c — light, m/s','299792458'],
  ['h — Planck, J·s','6.62607015e-34'],['ħ — reduced h, J·s','1.054571817e-34'],['G — gravitation, N·m²/kg²','6.67430e-11'],
  ['R — gas constant, J/mol·K','8.314462618'],['Nₐ — Avogadro, /mol','6.02214076e23'],['k_B — Boltzmann, J/K','1.380649e-23'],
  ['m_e — electron mass, kg','9.1093837015e-31'],['m_p — proton mass, kg','1.67262192369e-27'],['u — atomic mass, kg','1.66053906660e-27'],
  ['ε₀ — permittivity, F/m','8.8541878128e-12'],['μ₀ — permeability, N/A²','1.25663706212e-6'],['atm — standard pressure, Pa','101325']
];
function openCalc(){
  const keys=Object.keys(CALCS);
  const w=openOverlay(
    '<div class="fv-modal-head"><h3>'+window.__I.calculator+'Calculators</h3><button class="fv-icon-btn" data-close>×</button></div>'+
    '<div class="calc-mode-tabs">'+
      '<button class="calc-mode-tab active" data-view="formula">Formula calculators</button>'+
      '<button class="calc-mode-tab" data-view="normal">Normal</button>'+
      '<button class="calc-mode-tab" data-view="sci">Scientific</button>'+
      '<button class="calc-mode-tab" data-view="graph">Graphing</button>'+
    '</div>'+
    '<div class="fv-modal-body">'+
      '<div class="calc-view active" data-view="formula">'+
        '<div class="calc-tabs">'+keys.map(function(k,i){ return '<button class="calc-tab'+(i===0?' active':'')+'" data-k="'+k+'">'+window.__I[CALCS[k].ic]+CALCS[k].name+'</button>'; }).join('')+'</div>'+
        '<div class="calc-grid" id="calcGrid"></div>'+
      '</div>'+
      '<div class="calc-view" data-view="normal">'+
        '<div class="cal-display"><div class="cal-expr" id="normExpr">0</div><div class="cal-result" id="normResult"></div></div>'+
        '<div class="cal-pad pad-4" id="normPad">'+NK_ORDER.map(function(it){ return '<button class="cal-k" data-k="'+it[1]+'"'+(it[1]==='eq'?' data-sp="2"':'')+'>'+it[0]+'</button>'; }).join('')+'</div>'+
      '</div>'+
      '<div class="calc-view" data-view="sci">'+
        '<div class="cal-display"><div class="cal-expr" id="sciExpr">0</div><div class="cal-result" id="sciResult"></div></div>'+
        '<div class="cal-ctrl">'+
          '<select id="sciConst" aria-label="Insert a constant"><option value="">Insert constant…</option>'+SCI_CONSTS.map(function(c){ return '<option value="'+c[1]+'">'+c[0]+'</option>'; }).join('')+'</select>'+
          '<button class="cal-ctrl-b" id="sciDeg" title="Toggle degrees / radians">DEG</button>'+
          '<button class="cal-ctrl-b" id="sciAns" title="Insert the last answer">ANS</button>'+
        '</div>'+
        '<div class="cal-pad pad-5" id="sciPad">'+SK_ORDER.map(function(it){ return '<button class="cal-k" data-k="'+it[1]+'">'+it[0]+'</button>'; }).join('')+'</div>'+
      '</div>'+
      '<div class="calc-view" data-view="graph">'+
        '<div class="graph-ctrl"><span class="graph-y">y</span><input id="graphExpr" value="x^2" spellcheck="false" autocomplete="off" aria-label="Graph of function y"><button class="graph-b" id="gZoomIn" title="Zoom in">+</button><button class="graph-b" id="gZoomOut" title="Zoom out">−</button><button class="graph-b" id="gReset" title="Reset view">Reset</button></div>'+
        '<div class="graph-wrap"><canvas id="graphCanvas" height="400"></canvas></div>'+
        '<div class="graph-hint">Scroll to zoom · drag to pan</div>'+
      '</div>'+
    '</div>','modal calc-modal');
  let cur=keys[0];
  function render(){
    const c=CALCS[cur]; const grid=w.querySelector('#calcGrid');
    grid.innerHTML='<div class="calc-fml">'+c.formula+'</div>'+c.fields.map(f=>'<div class="calc-field"><label>'+f[1]+'</label><input data-f="'+f[0]+'" type="number" step="any" placeholder="—"></div>').join('')+'<div class="calc-out" id="calcOut"></div>';
    $$('input',grid).forEach(inp=>inp.oninput=function(){ const v={}; $$('input',grid).forEach(i=>v[i.dataset.f]=i.value); w.querySelector('#calcOut').innerHTML=c.compute(v); });
  }
  $$('.calc-tab',w).forEach(b=>b.onclick=function(){ $$('.calc-tab',w).forEach(x=>x.classList.remove('active')); b.classList.add('active'); cur=b.dataset.k; render(); });
  render();
  let degFlag=false, shared={ans:0};
  function makeCalc(){
    let buf='', fresh=true;
    function evalEx(expr){ return CalcEngine.eval(expr,{deg:degFlag, vars:{ans:shared.ans}}); }
    function trailingNumber(){
      let i=buf.length-1; while(i>=0&&/[0-9.]/.test(buf[i])) i--;
      if(i===buf.length-1) return null;
      const start=i+1; let neg=-1;
      if(i>=0&&buf[i]==='-'&&(i===0||'()+-*/%^'.indexOf(buf[i-1])!==-1)) neg=i;
      return {start:start, neg:neg, end:buf.length};
    }
    function refresh(disp,res){
      if(!disp) return;
      disp.textContent=buf||'0';
      if(res){
        if(!buf.trim()) res.textContent='';
        else{ const r=evalEx(buf); res.textContent = r.ok ? ('= '+fmtN(r.value,8)) : ('= '+r.error); }
      }
    }
    function input(disp,res,label,key){
      const l=buf.charAt(buf.length-1);
      if(key==='n'){
        if(buf==='0'&&/[0-9]/.test(label)) buf=label;
        else if(fresh&&/[0-9]/.test(label)){ buf=label; }
        else buf+=label;
        fresh=false; refresh(disp,res); return;
      }
      if(key==='dot'){
        const tn=trailingNumber();
        if(tn&&buf.slice(tn.start,tn.end).indexOf('.')!==-1){ refresh(disp,res); return; }
        buf+='.'; fresh=false; refresh(disp,res); return;
      }
      if(key==='op'||key==='lp'||key==='rp'){
        if(key==='op'&&!buf.trim()){ refresh(disp,res); return; }
        if(key==='op'&&l&&'+-*/%^×÷−'.indexOf(l)!==-1) buf=buf.slice(0,-1);
        buf+=label; fresh=false; refresh(disp,res); return;
      }
      if(key==='clear'){ buf=''; fresh=true; refresh(disp,res); return; }
      if(key==='back'){ buf=buf.slice(0,-1); refresh(disp,res); return; }
      if(key==='neg'){
        const tn=trailingNumber();
        if(!tn){ buf+='-'; }
        else if(tn.neg>=0){ buf=buf.slice(0,tn.neg)+buf.slice(tn.neg+1); }
        else{ buf=buf.slice(0,tn.start)+'-'+buf.slice(tn.start); }
        fresh=false; refresh(disp,res); return;
      }
      if(key==='eq'){ const r=evalEx(buf); if(r.ok){ shared.ans=r.value; buf=fmtN(r.value,10); fresh=true; } refresh(disp,res); return; }
      if(key==='ans'){ buf+=fmtN(shared.ans,8); fresh=false; refresh(disp,res); return; }
      if(key==='fact'){ buf+='!'; fresh=false; refresh(disp,res); return; }
      if(key==='inv'){ buf+='^(-1)'; fresh=false; refresh(disp,res); return; }
      if(key==='sq'){ buf+='^2'; fresh=false; refresh(disp,res); return; }
      if(key==='cube'){ buf+='^3'; fresh=false; refresh(disp,res); return; }
      if(key==='pow'){ buf+='^'; fresh=false; refresh(disp,res); return; }
      if(key==='pi'){ buf+='π'; fresh=false; refresh(disp,res); return; }
      if(key==='e'){ buf+='e'; fresh=false; refresh(disp,res); return; }
      if(key==='sqrt'||key==='cbrt'||key==='ln'||key==='log'||key==='sin'||key==='cos'||key==='tan'||key==='asin'||key==='acos'||key==='atan'||key==='abs'){
        buf+=(key==='sqrt'?'√(':key==='cbrt'?'cbrt(':key+'('); fresh=false; refresh(disp,res); return;
      }
    }
    return { input:input, refresh:refresh };
  }
  const nC=makeCalc(), sC=makeCalc();
  const nPad=w.querySelector('#normPad'), sPad=w.querySelector('#sciPad');
  $$('.cal-k',nPad).forEach(function(b){ b.onclick=function(){ nC.input(w.querySelector('#normExpr'), w.querySelector('#normResult'), b.textContent, b.dataset.k); }; });
  $$('.cal-k',sPad).forEach(function(b){ b.onclick=function(){ sC.input(w.querySelector('#sciExpr'), w.querySelector('#sciResult'), b.textContent, b.dataset.k); }; });
  const sciConst=w.querySelector('#sciConst');
  sciConst.onchange=function(){
    if(sciConst.value!==''){ sC.input(w.querySelector('#sciExpr'), w.querySelector('#sciResult'), sciConst.value, 'const'); sciConst.value=''; }
  };
  w.querySelector('#sciDeg').onclick=function(){ degFlag=!degFlag; this.textContent=degFlag?'RAD':'DEG'; sC.refresh(w.querySelector('#sciExpr'), w.querySelector('#sciResult')); };
  w.querySelector('#sciAns').onclick=function(){ sC.input(w.querySelector('#sciExpr'), w.querySelector('#sciResult'), 'ans', 'ans'); };
  const gExpr=w.querySelector('#graphExpr'), gCv=w.querySelector('#graphCanvas');
  const gvp={x0:-10,x1:10,y0:-6,y1:6};
  let gTimer=null;
  function niceStep(range){ const raw=range/7; const mag=Math.pow(10,Math.floor(Math.log10(raw))); const n=raw/mag; if(n<1.5) return mag; if(n<3.5) return 2*mag; if(n<7.5) return 5*mag; return 10*mag; }
  function graphColor(){ try{ const cs=getComputedStyle(document.documentElement); const c=cs.getPropertyValue('--acc').trim(); return c||'#1D64D8'; }catch(e){ return '#1D64D8'; } }
  function drawGraph(){
    const dpr=window.devicePixelRatio||1;
    const rect=gCv.getBoundingClientRect();
    if(!rect.width||!rect.height) return;
    gCv.width=Math.round(rect.width*dpr); gCv.height=Math.round(rect.height*dpr);
    const c2=gCv.getContext('2d');
    c2.setTransform(dpr,0,0,dpr,0,0);
    const W=rect.width, H=rect.height;
    const css=getComputedStyle(document.documentElement);
    c2.fillStyle=css.getPropertyValue('--input-bg').trim()||'rgba(15,22,40,0.6)';
    c2.fillRect(0,0,W,H);
    const X=x=>W*(x-gvp.x0)/(gvp.x1-gvp.x0);
    const Y=y=>H-(y-gvp.y0)/(gvp.y1-gvp.y0);
    const sx=niceStep(gvp.x1-gvp.x0), sy=niceStep(gvp.y1-gvp.y0);
    c2.lineWidth=1; c2.strokeStyle=css.getPropertyValue('--soft-border').trim()||'rgba(255,255,255,0.07)';
    c2.font='11px ui-monospace,Consolas,monospace'; c2.fillStyle=css.getPropertyValue('--text-low').trim()||'#8a93a6';
    c2.beginPath();
    for(let gx=Math.ceil(gvp.x0/sx)*sx; gx<=gvp.x1; gx+=sx){ c2.moveTo(X(gx),0); c2.lineTo(X(gx),H); }
    for(let gy=Math.ceil(gvp.y0/sy)*sy; gy<=gvp.y1; gy+=sy){ c2.moveTo(0,Y(gy)); c2.lineTo(W,Y(gy)); }
    c2.stroke();
    c2.strokeStyle=css.getPropertyValue('--text-mid').trim()||'rgba(255,255,255,0.35)'; c2.lineWidth=1.2;
    c2.beginPath();
    if(gvp.x0<=0&&gvp.x1>=0){ c2.moveTo(X(0),0); c2.lineTo(X(0),H); }
    if(gvp.y0<=0&&gvp.y1>=0){ c2.moveTo(0,Y(0)); c2.lineTo(W,Y(0)); }
    c2.stroke();
    c2.textAlign='left';
    for(let gx=Math.ceil(gvp.x0/sx)*sx; gx<=gvp.x1; gx+=sx){ if(gx===0) continue; c2.fillText(fmtN(gx,2), X(gx)+4, Y(0)+14); }
    for(let gy=Math.ceil(gvp.y0/sy)*sy; gy<=gvp.y1; gy+=sy){ if(gy===0) continue; c2.fillText(fmtN(gy,2), X(0)+5, Y(gy)-4); }
    const expr=gExpr.value.trim();
    if(!expr) return;
    const first=CalcEngine.eval(expr,{vars:{x:gvp.x0},deg:false});
    if(!first.ok){
      c2.fillStyle=graphColor(); c2.textAlign='center'; c2.font='600 13px inherit';
      c2.fillText('y = '+expr, 14, 22);
      c2.textAlign='center';
      c2.fillText(first.error, W/2, 30);
      return;
    }
    c2.strokeStyle=graphColor(); c2.lineWidth=2.4; c2.lineJoin='round'; c2.lineCap='round';
    const N=Math.min(1200, Math.max(300, Math.round(W)));
    let drawing=false, path=null, prevY=null;
    c2.beginPath();
    for(let i=0;i<=N;i++){
      const x=gvp.x0+(gvp.x1-gvp.x0)*i/N;
      const r=CalcEngine.eval(expr,{vars:{x:x},deg:false});
      let y=r.ok?r.value:NaN;
      if(!isFinite(y)||Math.abs(y)>(gvp.y1-gvp.y0)*8){ drawing=false; prevY=null; continue; }
      if(drawing&&prevY!==null&&Math.abs(y-prevY)>(gvp.y1-gvp.y0)*6){ drawing=false; }
      const px=X(x), py=Y(y);
      if(!drawing){ c2.moveTo(px,py); drawing=true; }
      else c2.lineTo(px,py);
      prevY=y;
    }
    c2.stroke();
    c2.fillStyle=graphColor(); c2.textAlign='left'; c2.beginPath();
    c2.fillText('y = '+expr, 14, 22);
  }
  function zoom(f){ const cx=(gvp.x0+gvp.x1)/2, cy=(gvp.y0+gvp.y1)/2; const hx=(gvp.x1-gvp.x0)/2*f, hy=(gvp.y1-gvp.y0)/2*f; gvp.x0=cx-hx; gvp.x1=cx+hx; gvp.y0=cy-hy; gvp.y1=cy+hy; drawGraph(); }
  w.querySelector('#gZoomIn').onclick=function(){ zoom(0.8); };
  w.querySelector('#gZoomOut').onclick=function(){ zoom(1.25); };
  w.querySelector('#gReset').onclick=function(){ gvp.x0=-10; gvp.x1=10; gvp.y0=-6; gvp.y1=6; drawGraph(); };
  function scheduleGraph(){ clearTimeout(gTimer); gTimer=setTimeout(drawGraph,160); }
  gExpr.addEventListener('input',scheduleGraph);
  gExpr.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); drawGraph(); } });
  gCv.addEventListener('wheel',function(e){ e.preventDefault(); zoom(e.deltaY>0?1.25:0.8); }, {passive:false});
  let pan=null;
  gCv.addEventListener('pointerdown',function(e){ pan={x:e.clientX, y:e.clientY, vx0:gvp.x0, vx1:gvp.x1, vy0:gvp.y0, vy1:gvp.y1}; try{ gCv.setPointerCapture(e.pointerId); }catch(err){} });
  gCv.addEventListener('pointermove',function(e){
    if(!pan) return;
    const rect=gCv.getBoundingClientRect();
    const dx=e.clientX-pan.x, dy=e.clientY-pan.y;
    const xpp=(pan.vx1-pan.vx0)/rect.width, ypp=(pan.vy1-pan.vy0)/rect.height;
    gvp.x0=pan.vx0-dx*xpp; gvp.x1=pan.vx1-dx*xpp;
    gvp.y0=pan.vy0+dy*ypp; gvp.y1=pan.vy1+dy*ypp;
    drawGraph();
  });
  gCv.addEventListener('pointerup',function(){ pan=null; });
  gCv.addEventListener('pointercancel',function(){ pan=null; });
  function onRS(){ if(!w.isConnected){ window.removeEventListener('resize',onRS); return; } if(gCv.offsetParent) drawGraph(); }
  window.addEventListener('resize',onRS);
  $$('.calc-mode-tab',w).forEach(function(t){
    t.onclick=function(){ $$('.calc-mode-tab',w).forEach(function(x){ x.classList.remove('active'); }); t.classList.add('active');
      $$('.calc-view',w).forEach(function(vw){ vw.classList.toggle('active', vw.dataset.view===t.dataset.view); });
      if(t.dataset.view==='graph'){ drawGraph(); }
    };
  });
}

function exportData(){
  const blob=new Blob([JSON.stringify({favs:favs,sheets:sheets,study:study,settings:settings,v:2},null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='formula-vault-data.json'; a.click();
  toast('Data exported');
}
function importData(){
  const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
  inp.onchange=function(){ const f=inp.files[0]; if(!f) return; const r=new FileReader();
    r.onload=function(){ try{ const d=JSON.parse(r.result); if(d.favs)favs=d.favs; if(d.sheets)sheets=d.sheets; if(d.study)study=d.study; if(d.settings)settings=Object.assign({},settings,d.settings); saveAll(); updateFavBadge(); FV.renderAll(); toast('Data imported'); }catch(e){ toast('Invalid file'); } };
    r.readAsText(f); };
  inp.click();
}
function resetAll(){
  if(!confirm('Reset all bookmarks, study and revision-sheet progress?')) return;
  favs=[]; sheets=0; study={};
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
updateFavBadge();
FV.renderAll();
})();
