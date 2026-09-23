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
  const browsing=!!state.chapter;
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
    const ch = state.chapter||null;
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
  else{ queue=CARDS.filter(c=>c.subject===state.subject&&c.chapter===state.chapter); if(queue.length<5) queue=CARDS.slice(); queue=shuffle(queue.slice()); }
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
    asec:function(x){return Math.acos(1/x);}, acsc:function(x){return Math.asin(1/x);}, acot:function(x){return Math.atan(1/x);},
    sinh:Math.sinh, cosh:Math.cosh, tanh:Math.tanh,
    asinh:Math.asinh, acosh:Math.acosh, atanh:Math.atanh,
    sech:function(x){return 1/Math.cosh(x);}, csch:function(x){return 1/Math.sinh(x);}, coth:function(x){return 1/Math.tanh(x);},
    ln:Math.log, log:Math.log10, log2:Math.log2, exp:Math.exp, exp10:function(x){return Math.pow(10,x);},
    abs:Math.abs, sqrt:Math.sqrt, cbrt:function(x){return Math.cbrt(x);}, sign:function(x){return x>0?1:x<0?-1:0;},
    round:Math.round, floor:Math.floor, ceil:Math.ceil,
    gcd:function(a,b){a=Math.abs(~~a);b=Math.abs(~~b);while(b){const t=a%b;a=b;b=t;}return a;},
    lcm:function(a,b){a=Math.abs(~~a);b=Math.abs(~~b);if(!a||!b)return 0;return a/FUNCS.gcd(a,b)*b;}
  };
  const CONSTS={
    pi:Math.PI, e:Math.E, phi:(1+Math.sqrt(5))/2, tau:2*Math.PI, gamma:0.5772156649015329,
    g:9.80665, c:299792458, h:6.62607015e-34, hbar:1.054571817e-34, G:6.67430e-11,
    Na:6.02214076e23, kb:1.380649e-23, R:8.31446261815324, R2:0.08205736608096,
    Me:9.1093837015e-31, Mp:1.67262192369e-27, Mn:1.67492749804e-27, u:1.66053906660e-27,
    e0:8.8541878128e-12, mu0:1.25663706212e-6, ke:8.9875517923e9, sigma:5.670374419e-8,
    a0:5.29177210903e-11, Ffar:96485.33212, Rinf:10973731.568160,
    atm:101325, torr:133.322368421, cal:4.184, ev:1.602176634e-19, t0:273.15,
    ly:9.46073047258e15, au:149597870700, minute:60, hour:3600, day:86400
  };
  const DEG_TRIG=['sin','cos','tan','sec','csc','cot','sinh','cosh','tanh','sech','csch','coth'];
  const DEG_INV=['asin','acos','atan','asec','acsc','acot'];
  function normalize(src){
    return String(src)
      .replace(/\s+/g,'')
      .replace(/\*\*+/g,'^')
      .replace(/[×·∗]/g,'*')
      .replace(/÷/g,'/')
      .replace(/[−–—]/g,'-')
      .replace(/π/g,'pi').replace(/τ/g,'tau').replace(/φ/g,'phi').replace(/γ/g,'gamma')
      .replace(/√/g,'sqrt').replace(/∛/g,'cbrt')
      .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,function(ch){return '^'+('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(ch));});
  }
  function tokenize(src){
    const toks=[];
    const re=/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|[+\-*\/\^%,()!]/g;
    let m; let last=0;
    while((m=re.exec(src))){
      if(m.index>last) return {err:'Unexpected character "'+src.slice(last,m.index)+'"'};
      toks.push(m[0]); last=re.lastIndex;
    }
    if(last<src.length) return {err:'Unexpected character "'+src.slice(last)+'"'};
    return {toks:toks};
  }
  function fact(n){
    if(!isFinite(n)) return NaN;
    n=Math.round(n);
    if(n<0||n>170) return NaN;
    if(n===0||n===1) return 1;
    let r=1; for(let i=2;i<=n;i++) r*=i;
    return r;
  }
  function parse(toks){
    let p=0;
    function peek(){ return toks[p]; }
    function take(t){ if(t===undefined||toks[p]===t){ p++; return toks[p-1]; } return false; }
    function parseAdd(){
      let left=parseMul();
      if(!left) return null;
      while(peek()==='+'||peek()==='-'){
        const op=take();
        const rhs=parseMul();
        if(!rhs) return null;
        left={op:'expr',base:left,ops:[{op:op,rhs:rhs}]};
      }
      return left;
    }
    function parseMul(){
      let left=parsePow();
      if(!left) return null;
      for(;;){
        const t=peek();
        if(t==='*'||t==='/'||t==='%'){
          take(); const rhs=parsePow(); if(!rhs) return null;
          left={op:'expr',base:left,ops:[{op:t,rhs:rhs}]};
          continue;
        }
        if(t&&/^[0-9A-Za-z_(]/.test(t)){
          const rhs=parsePow(); if(!rhs) return null;
          left={op:'expr',base:left,ops:[{op:'*',rhs:rhs}]};
          continue;
        }
        break;
      }
      return left;
    }
    function parsePow(){
      const left=parseSign();
      if(!left) return null;
      if(take('^')){
        const right=parsePow();
        if(!right) return null;
        return {op:'expr',base:left,ops:[{op:'^',rhs:right}]};
      }
      return left;
    }
    function parseSign(){
      const t=peek();
      if(t==='-'||t==='+'){
        take();
        const rhs=parseSign();
        if(!rhs) return null;
        return {op:'neg',rhs:rhs};
      }
      return parseSimplest();
    }
    function parseSimplest(){
      const t=peek();
      if(t==='!'){
        take();
        const inner=parseSimplest();
        if(!inner) return null;
        return {op:'fact',child:inner};
      }
      let node;
      if(t==='('){
        take();
        const inner=parseAdd();
        if(!inner) return null;
        if(!take(')')) return null;
        node={op:'group',child:inner};
      } else if(t&&(/^\d/.test(t)||t.charAt(0)==='.')){
        take();
        if(!(/^(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(t))) return null;
        node={op:'const',v:parseFloat(t)};
      } else if(t&&/^[A-Za-z_]/.test(t)){
        take();
        const name=t.toLowerCase();
        if(take('(')){
          const args=[];
          if(peek()===')') return null;
          const a1=parseAdd();
          if(!a1) return null;
          args.push(a1);
          while(take(',')){
            const an=parseAdd();
            if(!an) return null;
            args.push(an);
          }
          if(!take(')')) return null;
          node={op:'call',fn:name,args:args};
        } else {
          node={op:'const',symbol:name};
        }
      } else {
        return null;
      }
      while(take('!')){ node={op:'fact',child:node}; }
      return node;
    }
    const root=parseAdd();
    if(!root) return {err:'Invalid expression'};
    if(p<toks.length) return {err:'Unexpected "'+toks[p]+'"'};
    return {node:root};
  }
  function evalNode(node,env){
    if(!node) return NaN;
    switch(node.op){
      case 'expr': {
        let val=evalNode(node.base,env);
        for(let i=0;i<node.ops.length;i++){
          const o=node.ops[i];
          const rv=evalNode(o.rhs,env);
          if(!isFinite(val)||!isFinite(rv)) return NaN;
          if(o.op==='+') val+=rv;
          else if(o.op==='-') val-=rv;
          else if(o.op==='*') val*=rv;
          else if(o.op==='/'){ if(rv===0) return NaN; val/=rv; }
          else if(o.op==='%') val%=rv;
          else val=Math.pow(val,rv);
        }
        return isFinite(val)?val:NaN;
      }
      case 'const': {
        if(node.symbol){
          if(env.vars&&Object.prototype.hasOwnProperty.call(env.vars,node.symbol)) return env.vars[node.symbol];
          return (CONSTS[node.symbol]===undefined)?NaN:CONSTS[node.symbol];
        }
        return node.v;
      }
      case 'neg': return -evalNode(node.rhs,env);
      case 'fact': return fact(evalNode(node.child,env));
      case 'group': return evalNode(node.child,env);
      case 'call': {
        const fn=FUNCS[node.fn];
        if(!fn) return NaN;
        const args=node.args.map(function(a){return evalNode(a,env);});
        if(args.some(function(a){return !isFinite(a);})) return NaN;
        if(node.fn==='log'&&args.length===2) return Math.log(args[1])/Math.log(args[0]);
        if(DEG_TRIG.indexOf(node.fn)>-1) return fn(args[0]*env.deg);
        if(DEG_INV.indexOf(node.fn)>-1) return fn(args[0])*env.rad;
        return fn.apply(null,args);
      }
    }
    return NaN;
  }
  function compile(src,opts){
    opts=opts||{};
    const s=normalize(src||'');
    if(!s) return {ok:false,error:'Type an expression…'};
    const tk=tokenize(s);
    if(tk.err) return {ok:false,error:tk.err};
    const pr=parse(tk.toks);
    if(pr.err||!pr.node) return {ok:false,error:pr.err||'Invalid expression'};
    const deg=opts.deg?Math.PI/180:1;
    return {ok:true,node:pr.node,deg:deg,rad:1/deg};
  }
  function evaluate(expr,opts){
    const c=compile(expr,opts);
    if(!c.ok) return {ok:false,error:c.error};
    const v=evalNode(c.node,{deg:c.deg,rad:c.rad,vars:Object.assign({ans:0},(opts&&opts.vars)||{})});
    if(!isFinite(v)) return {ok:false,error:'Result is not a valid number'};
    return {ok:true,value:v};
  }
  return {
    eval:evaluate,
    compile:compile,
    fn:function(c){ return function(vars){ let v=evalNode(c.node,{deg:c.deg,rad:c.rad,vars:vars||{}}); return isFinite(v)?v:NaN; }; }
  };
})();
const CALC_CATS=[['all','All'],['phys','Physics'],['chem','Chemistry'],['math','Math']];
const CALC_CAT_NAMES={phys:'Physics',chem:'Chemistry',math:'Math'};
const CALCS={
  proj:{ic:'rocket',cat:'phys',name:'Projectile',formula:'T = 2u·sinθ/g &nbsp; H = u²sin²θ/(2g) &nbsp; R = u²sin2θ/g',fields:[['u','Initial speed u (m/s)'],['th','Angle θ (°)']],compute:function(v){ const u=+v.u, thd=+v.th; if(!(u>0)) return 'Enter a positive initial speed u.'; if(isNaN(thd)) return 'Enter the launch angle θ.'; const th=thd*Math.PI/180, g=9.8; const T=2*u*Math.sin(th)/g, H=u*u*Math.pow(Math.sin(th),2)/(2*g), R=u*u*Math.sin(2*th)/g; return '<b>Time of flight T = '+fmtN(T,2)+' s</b><br><b>Max height H = '+fmtN(H,2)+' m</b><br><b>Range R = '+fmtN(R,2)+' m</b>'; }},
  kin:{ic:'gauge',cat:'phys',name:'Kinematics',formula:'v = u + at &nbsp; s = ut + ½at²',fields:[['u','Initial velocity u (m/s)'],['a','Acceleration a (m/s²)'],['t','Time t (s)']],compute:function(v){ const u=+v.u,a=+v.a,t=+v.t; if(isNaN(u)||isNaN(a)||isNaN(t)) return 'Enter u, a and t to get v and s.'; return '<b>v = '+fmtN(u+a*t,2)+' m/s</b><br><b>s = '+fmtN(u*t+0.5*a*t*t,2)+' m</b>'; }},
  fall:{ic:'layers',cat:'phys',name:'Free fall',formula:'v = gt &nbsp; h = ½gt² &nbsp; v = √(2gh)',fields:[['h','Height h (m) — leave blank if using t'],['t','Time t (s) — leave blank if using h']],compute:function(v){ const g=9.8, h=+v.h, t=+v.t; const hasH=h>0, hasT=t>0; if(!hasH&&!hasT) return 'Enter a positive height or time.'; let H,T,V; if(hasH){ H=h; T=Math.sqrt(2*h/g); V=Math.sqrt(2*g*h); } else { T=t; H=0.5*g*t*t; V=g*t; } return '<b>Fallen height h = '+fmtN(H,2)+' m</b><br><b>Time to land t = '+fmtN(T,2)+' s</b><br><b>Impact speed v = '+fmtN(V,2)+' m/s</b>'; }},
  spring:{ic:'x',cat:'phys',name:'Spring energy',formula:'F = kx &nbsp; U = ½kx²',fields:[['k','Spring constant k (N/m)'],['x','Displacement x (m)']],compute:function(v){ const k=+v.k,x=+v.x; if(isNaN(k)||isNaN(x)) return 'Enter k and x.'; return '<b>Force F = '+fmtN(k*x,2)+' N</b><br><b>Potential energy U = '+fmtN(0.5*k*x*x,2)+' J</b>'; }},
  pend:{ic:'settings',cat:'phys',name:'Pendulum',formula:'T = 2π√(L/g)',fields:[['L','Pendulum length L (m)'],['g','Gravity g (m/s²)']],compute:function(v){ const L=+v.L,g=+v.g||9.8; if(!(L>0)||!(g>0)) return 'Enter a positive length L.'; const T=2*Math.PI*Math.sqrt(L/g); return '<b>Period T = '+fmtN(T,2)+' s</b><br><b>Frequency f = '+fmtN(1/T,3)+' Hz</b>'; }},
  shm:{ic:'settings',cat:'phys',name:'SHM',formula:'ω = √(k/m) &nbsp; T = 2π√(m/k)',fields:[['k','Spring constant k (N/m)'],['m','Mass m (kg)'],['A','Amplitude A (m) — optional']],compute:function(v){ const k=+v.k,m=+v.m,A=+v.A; if(!(k>0)||!(m>0)) return 'Enter positive k and m.'; const w=Math.sqrt(k/m), T=2*Math.PI*Math.sqrt(m/k); let out='<b>Angular frequency ω = '+fmtN(w,3)+' rad/s</b><br><b>Period T = '+fmtN(T,3)+' s</b><br><b>Frequency f = '+fmtN(1/T,3)+' Hz</b>'; if(v.A.trim()!==''&&isFinite(+v.A)) out+='<br><b>v_max = '+fmtN(w*A,3)+' m/s</b><br><b>a_max = '+fmtN(w*w*A,3)+' m/s²</b>'; return out; }},
  ohm:{ic:'zap',cat:'phys',name:"Ohm's law",formula:'V = IR &nbsp; P = VI',fields:[['V','Voltage V (V) — leave one blank'],['I','Current I (A)'],['R','Resistance R (Ω)']],compute:function(v){ const f=x=>x!==''&&!isNaN(+x); let V=f(v.V)?+v.V:null, I=f(v.I)?+v.I:null, R=f(v.R)?+v.R:null; if(V!==null&&I!==null&&R===null) R=V/I; else if(V!==null&&R!==null&&I===null) I=V/R; else if(I!==null&&R!==null&&V===null) V=I*R; else return 'Fill any two of V, I, R.'; return '<b>V = '+fmtN(V,2)+' V</b><br><b>I = '+fmtN(I,2)+' A</b><br><b>R = '+fmtN(R,2)+' Ω</b><br><b>Power P = '+fmtN(V*I,2)+' W</b>'; }},
  res:{ic:'target',cat:'phys',name:'Resistors',formula:'Series: R = R₁+R₂ &nbsp; Parallel: R = R₁R₂/(R₁+R₂)',fields:[['r1','Resistor R₁ (Ω)'],['r2','Resistor R₂ (Ω)']],compute:function(v){ const r1=+v.r1,r2=+v.r2; if(!(r1>0)||!(r2>0)) return 'Enter two positive resistances.'; return '<b>Series equivalent = '+fmtN(r1+r2,2)+' Ω</b><br><b>Parallel equivalent = '+fmtN(r1*r2/(r1+r2),2)+' Ω</b>'; }},
  cap:{ic:'layers',cat:'phys',name:'Capacitor',formula:'Q = CV &nbsp; U = ½CV²',fields:[['C','Capacitance C (F)'],['V','Voltage V (V)'],['Q','Charge Q (C)']],compute:function(v){ const gC=v.C.trim()!==''&&+v.C>0, gV=v.V.trim()!==''&&isFinite(+v.V), gQ=v.Q.trim()!==''&&isFinite(+v.Q); if((gC?1:0)+(gV?1:0)+(gQ?1:0)!==2) return 'Enter any two of C, V, Q.'; let c,vd,q; if(gC&&gV){ c=+v.C; vd=+v.V; q=c*vd; } else if(gC&&gQ){ c=+v.C; q=+v.Q; vd=q/c; } else { vd=+v.V; q=+v.Q; c=q/vd; } const U=0.5*q*vd; return '<b>Charge Q = '+fmtN(q,4)+' C</b><br><b>Voltage V = '+fmtN(vd,4)+' V</b><br><b>Capacitance C = '+fmtN(c,6)+' F</b><br><b>Energy U = ½CV² = '+fmtN(U,5)+' J</b>'; }},
  energy:{ic:'sparkles',cat:'phys',name:'Kinetic energy',formula:'KE = ½mv²',fields:[['m','Mass m (kg)'],['v','Speed v (m/s)']],compute:function(v){ const m=+v.m,vv=+v.v; if(!(m>0)||!(vv>0)) return 'Enter positive mass and speed.'; return '<b>KE = '+fmtN(0.5*m*vv*vv,2)+' J</b>'; }},
  cent:{ic:'bookmark',cat:'phys',name:'Centripetal',formula:'a = v²/r &nbsp; F = mv²/r',fields:[['m','Mass m (kg)'],['v','Speed v (m/s)'],['r','Radius r (m)']],compute:function(v){ const m=+v.m,vv=+v.v,r=+v.r; if(isNaN(m)||isNaN(vv)||!(r>0)) return 'Enter mass, speed and a positive radius.'; const a=vv*vv/r; return '<b>Centripetal acceleration a = '+fmtN(a,2)+' m/s²</b><br><b>Centripetal force F = '+fmtN(m*a,2)+' N</b>'; }},
  grav:{ic:'moon',cat:'phys',name:'Gravitation',formula:'F = Gm₁m₂/r²',fields:[['m1','Mass m₁ (kg)'],['m2','Mass m₂ (kg)'],['r','Separation r (m)']],compute:function(v){ const m1=+v.m1,m2=+v.m2,r=+v.r; if(isNaN(m1)||isNaN(m2)||!(r>0)) return 'Enter masses and a positive separation.'; return '<b>Force F = '+fmtN(6.674e-11*m1*m2/(r*r),3)+' N</b>'; }},
  orbit:{ic:'star',cat:'phys',name:'Orbital motion',formula:'v = √(GM/r) &nbsp; T = 2π√(r³/GM)',fields:[['M','Central mass M (kg)'],['r','Orbit radius r (m)']],compute:function(v){ const M=+v.M,r=+v.r; if(!(M>0)||!(r>0)) return 'Enter a positive central mass and radius.'; const G=6.674e-11, vOrb=Math.sqrt(G*M/r), T=2*Math.PI*Math.sqrt(r*r*r/(G*M)); return '<b>Orbital speed v = '+fmtN(vOrb,2)+' m/s</b><br><b>Orbital period T = '+fmtN(T,2)+' s</b>'; }},
  dopp:{ic:'sparkles',cat:'phys',name:'Doppler',formula:'f′ = f·(c+v₀)/(c−vₛ)',fields:[['f0','Source frequency f (Hz)'],['c','Wave speed c (m/s)'],['vs','Source speed vₛ (m/s, + toward listener)'],['vo','Listener speed v₀ (m/s, + toward source)']],compute:function(v){ const f0=+v.f0,c=+v.c,vs=+v.vs,vo=+v.vo; if(!(f0>0)||!(c>0)) return 'Enter a positive source frequency and wave speed.'; if(Math.abs(vs)>=c||Math.abs(vo)>=c) return 'Speeds must be below the wave speed c.'; return '<b>Observed frequency f′ = '+fmtN(f0*(c+vo)/(c-vs),3)+' Hz</b>'; }},
  string:{ic:'target',cat:'phys',name:'String harmonics',formula:'f₁ = √(T/μ)/(2L) &nbsp; fₙ = f₁·n',fields:[['L','String length L (m)'],['T','Tension T (N)'],['mu','Linear density μ (kg/m)'],['n','Harmonic n — optional']],compute:function(v){ const L=+v.L,T=+v.T,mu=+v.mu; if(!(L>0)||!(mu>0)) return 'Enter a positive length and linear density.'; const f1=Math.sqrt(T/mu)/(2*L); let out='<b>Fundamental f₁ = '+fmtN(f1,3)+' Hz</b>'; if(v.n.trim()!==''&&+v.n>=1&&isFinite(+v.n)) out+='<br><b>Harmonic n = '+fmtN((+v.n)*f1,3)+' Hz</b>'; return out; }},
  wave:{ic:'printer',cat:'phys',name:'Wave speed',formula:'v = f·λ &nbsp; T = 1/f',fields:[['v','Wave speed v (m/s)'],['f','Frequency f (Hz)']],compute:function(v){ const vv=+v.v,f=+v.f; if(!(vv>0)||!(f>0)) return 'Enter positive speed and frequency.'; return '<b>Wavelength λ = '+fmtN(vv/f,3)+' m</b><br><b>Period T = '+fmtN(1/f,3)+' s</b>'; }},
  heat:{ic:'messagePlus',cat:'phys',name:'Heat transfer',formula:'Q = mcΔT',fields:[['m','Mass m (kg)'],['c','Specific heat c (J/kg·K)'],['dt','Temperature change ΔT (K or °C)']],compute:function(v){ const m=+v.m,c=+v.c,dt=+v.dt; if(isNaN(m)||isNaN(c)||isNaN(dt)) return 'Enter m, c and ΔT.'; return '<b>Q = '+fmtN(m*c*dt,2)+' J</b>'; }},
  gas:{ic:'wind',cat:'phys',name:'Ideal gas',formula:'PV = nRT &nbsp; R = 8.314 J/mol·K',fields:[['P','Pressure P (Pa) — leave one blank'],['V','Volume V (m³)'],['n','Moles n (mol)'],['T','Temperature T (K)']],compute:function(v){ const f=x=>x!==''&&!isNaN(+x); const R=8.314; const P=f(v.P)?+v.P:null, V=f(v.V)?+v.V:null, n=f(v.n)?+v.n:null, T=f(v.T)?+v.T:null; if([P,V,n,T].filter(x=>x!==null).length!==3) return 'Fill exactly three of P, V, n, T.'; let p=P,Vv=V,nn=n,tt=T; if(p===null)p=nn*R*tt/Vv; if(Vv===null)Vv=nn*R*tt/p; if(nn===null)nn=p*Vv/(R*tt); if(tt===null)tt=p*Vv/(nn*R); return '<b>P = '+fmtN(p,2)+' Pa</b><br><b>V = '+fmtN(Vv,3)+' m³</b><br><b>n = '+fmtN(nn,3)+' mol</b><br><b>T = '+fmtN(tt,2)+' K</b>'; }},
  lens:{ic:'droplet',cat:'phys',name:'Thin lens',formula:'1/f = 1/v + 1/u &nbsp; m = v/u &nbsp; P = 100/f (cm)',fields:[['u','Object distance u (cm, signed)'],['v','Image distance v (cm, signed)']],compute:function(v){ const u=+v.u,vv=+v.v; if(v.u.trim()===''||v.v.trim()==='') return 'Enter both signed distances u and v.'; if(u===0||vv===0||u+vv===0) return 'Enter non-zero distances; u + v cannot be zero.'; const f=u*vv/(u+vv); return '<b>Focal length f = '+fmtN(f,2)+' cm</b><br><b>Magnification m = '+fmtN(vv/u,3)+'</b><br><b>Power P = '+fmtN(100/f,3)+' D</b>'; }},
  mirror:{ic:'layers',cat:'phys',name:'Spherical mirror',formula:'1/f = 1/v + 1/u &nbsp; m = −v/u &nbsp; R = 2f',fields:[['u','Object distance u (cm, signed)'],['v','Image distance v (cm, signed)']],compute:function(v){ const u=+v.u,vv=+v.v; if(v.u.trim()===''||v.v.trim()==='') return 'Enter both signed distances u and v.'; if(u===0||vv===0||u+vv===0) return 'Enter non-zero distances; u + v cannot be zero.'; const f=u*vv/(u+vv); return '<b>Focal length f = '+fmtN(f,2)+' cm</b><br><b>Radius R = '+fmtN(2*f,2)+' cm</b><br><b>Magnification m = '+fmtN(-vv/u,3)+'</b>'; }},
  snell:{ic:'wind',cat:'phys',name:'Refraction',formula:'n₁ sinθ₁ = n₂ sinθ₂ &nbsp; sinθc = n₂/n₁',fields:[['n1','n₁ (incident medium)'],['n2','n₂ (refracted medium)'],['th1','Incident angle θ₁ (°)']],compute:function(v){ const n1=+v.n1,n2=+v.n2; if(!(n1>0)||!(n2>0)) return 'Enter positive refractive indices n₁ and n₂.'; let out=''; if(v.th1.trim()!==''&&isFinite(+v.th1)){ const th=Math.abs(+v.th1); const s=n1*Math.sin(th*Math.PI/180)/n2; if(s>1) out='<b>Total internal reflection — no refracted ray.</b>'; else out='<b>Refracted angle θ₂ = '+fmtN(Math.asin(s)*180/Math.PI,2)+'°</b>'; } if(n1>n2){ const crit=Math.asin(n2/n1)*180/Math.PI; out+=(out?'<br>':'')+'<b>Critical angle θc = '+fmtN(crit,2)+'°</b>'; } return out||'Enter an incident angle (and n₁ &gt; n₂ to get the critical angle).'; }},
  buoy:{ic:'droplet',cat:'phys',name:'Buoyancy',formula:'F_b = ρgV &nbsp; floats when ρ_body &lt; ρ_liquid',fields:[['rf','Liquid density ρ_local (kg/m³)'],['rb','Body density ρ_body (kg/m³)'],['vol','Volume submerged V (m³) — optional']],compute:function(v){ const rf=+v.rf,rb=+v.rb,vol=+v.vol; if(!(rf>0)||!(rb>0)) return 'Enter positive liquid and body densities.'; let out=rb<rf?'<b>Body floats — '+fmtN(rb/rf*100,2)+'% submerged</b>':'<b>Body sinks (ρ_body ≥ ρ_liquid)</b>'; if(v.vol.trim()!==''&&+v.vol>0) out+='<br><b>Buoyant force F_b = '+fmtN(rf*9.8*vol,3)+' N</b>'; return out; }},
  galt:{ic:'moon',cat:'phys',name:'Gravity at altitude',formula:'g(h) = g₀·(R/(R+h))²',fields:[['h','Altitude h (m)']],compute:function(v){ const h=+v.h; if(v.h.trim()===''||!(h>=0)||!isFinite(+v.h)) return 'Enter a non-negative altitude above the surface.'; const g=9.80665*Math.pow(6371e3/(6371e3+h),2); return '<b>g = '+fmtN(g,4)+' m/s²</b> at '+fmtN(h,1)+' m altitude'; }},
  mom:{ic:'gauge',cat:'phys',name:'Momentum & impulse',formula:'p = mv &nbsp; J = F·Δt &nbsp; Δv = J/m',fields:[['m','Mass m (kg)'],['v','Velocity v (m/s) — for momentum'],['F','Net force F (N) — for impulse'],['t','Time Δt (s) — for impulse']],compute:function(v){ const m=+v.m,vv=+v.v,F=+v.F,t=+v.t; const gM=v.m.trim()!==''&&+v.m>0, gV=v.v.trim()!==''&&isFinite(+v.v), gF=v.F.trim()!==''&&isFinite(+v.F), gT=v.t.trim()!==''&&isFinite(+v.t)&&+v.t!==0; let out=''; if(gM&&gV) out+='<b>Momentum p = '+fmtN(m*vv,3)+' kg·m/s</b><br>'; if(gF&&gT) out+='<b>Impulse J = '+fmtN(F*t,3)+' N·s</b><br>'; if(gM&&gF&&gT) out+='<b>Δv from impulse = '+fmtN(F*t/m,3)+' m/s</b>'; return out||'Enter mass &amp; velocity for momentum, and/or force &amp; time for impulse.'; }},
  eff:{ic:'fileText',cat:'phys',name:'Efficiency',formula:'η = W_out/W_in × 100%',fields:[['win','Energy input W_in (J)'],['wout','Useful output W_out (J)']],compute:function(v){ const win=+v.win,wout=+v.wout; if(!(win>0)||isNaN(wout)) return 'Enter energy input and output.'; return '<b>Efficiency η = '+fmtN(wout/win*100,2)+'%</b><br><b>Loss = '+fmtN(win-wout,2)+' J</b>'; }},
  work:{ic:'zap',cat:'phys',name:'Work & power',formula:'W = F·s·cosθ &nbsp; P = W/t',fields:[['F','Force F (N)'],['s','Displacement s (m)'],['th','Angle θ (°) — optional'],['t','Time t (s) — for power']],compute:function(v){ if(v.F.trim()===''||v.s.trim()==='') return 'Enter force and displacement.'; if(!isFinite(+v.F)||!isFinite(+v.s)) return 'Enter valid numbers.'; const ct=v.th.trim()===''?1:Math.cos((+v.th)*Math.PI/180); const W=(+v.F)*(+v.s)*ct; let out='<b>Work W = '+fmtN(W,3)+' J</b>'; if(v.t.trim()!==''&&+v.t>0) out+='<br><b>Power P = '+fmtN(W/(+v.t),3)+' W</b>'; return out; }},
  acid:{ic:'flask',cat:'chem',name:'pH & [H⁺]',formula:'pH = −log₁₀[H⁺] &nbsp; pOH = 14 − pH',fields:[['h','[H⁺] concentration (M)']],compute:function(v){ const h=+v.h; if(!(h>0)) return 'Enter a positive [H⁺] concentration.'; const pH=-Math.log10(h), pOH=14-pH; return '<b>pH = '+fmtN(pH,2)+'</b><br><b>pOH = '+fmtN(pOH,2)+'</b><br><b>[OH⁻] = '+fmtN(Math.pow(10,-pOH),4)+' M</b>'; }},
  buffer:{ic:'droplet',cat:'chem',name:'Buffer pH',formula:'pH = pKₐ + log([salt]/[acid])',fields:[['pka','pKₐ of the weak acid'],['a','[Acid] concentration (M)'],['s','[Conjugate base] concentration (M)']],compute:function(v){ const pka=+v.pka,a=+v.a,s=+v.s; if(isNaN(pka)||!(a>0)||!(s>0)) return 'Enter pKₐ and positive concentrations.'; const pH=pka+Math.log10(s/a); return '<b>pH = '+fmtN(pH,2)+'</b><br><b>[H⁺] = '+fmtN(Math.pow(10,-pH),4)+' M</b>'; }},
  mol:{ic:'calculator',cat:'chem',name:'Molarity',formula:'M = n/V (volume in litres)',fields:[['n','Moles of solute (mol)'],['V','Volume of solution (L)']],compute:function(v){ const n=+v.n,V=+v.V; if(!(n>0)||!(V>0)) return 'Enter moles and volume (positive).'; return '<b>Molarity M = '+fmtN(n/V,4)+' mol/L</b>'; }},
  molality:{ic:'flask',cat:'chem',name:'Molality',formula:'m = n/kg_solvent',fields:[['n','Moles of solute (mol)'],['kg','Solvent mass (kg)']],compute:function(v){ const n=+v.n,kg=+v.kg; if(!(n>0)||!(kg>0)) return 'Enter positive moles and solvent mass.'; return '<b>Molality m = '+fmtN(n/kg,4)+' mol/kg</b>'; }},
  mole:{ic:'calculator',cat:'chem',name:'Moles',formula:'n = m/M &nbsp; count = n·Nₐ',fields:[['m','Mass (g)'],['M','Molar mass M (g/mol)']],compute:function(v){ const m=+v.m,M=+v.M; if(v.m.trim()===''||isNaN(m)) return 'Enter the mass in grams.'; if(!(M>0)) return 'Enter a positive molar mass M.'; return '<b>Moles n = '+fmtN(m/M,4)+' mol</b><br><b>Particles = '+fmtN(m/M*6.02214076e23,4)+'</b>'; }},
  dil:{ic:'history',cat:'chem',name:'Dilution',formula:'M₁V₁ = M₂V₂',fields:[['m1','Initial concentration M₁ (M)'],['v1','Initial volume V₁ (L)'],['v2','Final volume V₂ (L)']],compute:function(v){ const m1=+v.m1,v1=+v.v1,v2=+v.v2; if(!(m1>0)||!(v1>0)||!(v2>0)) return 'Enter positive values.'; return '<b>Final concentration M₂ = '+fmtN(m1*v1/v2,4)+' M</b>'; }},
  half:{ic:'target',cat:'chem',name:'Half-life',formula:'λ = ln2/t½ &nbsp; fraction = 2^(−t/t½)',fields:[['th','Half-life t½ (s or any time unit)'],['t','Elapsed time t (same unit)']],compute:function(v){ const th=+v.th,t=+v.t; if(!(th>0)||!(t>=0)) return 'Enter a positive half-life and an elapsed time.'; const lam=Math.LN2/th, rem=Math.pow(2,-t/th); return '<b>Decay constant λ = '+fmtN(lam,4)+' s⁻¹</b><br><b>Fraction remaining = '+fmtN(rem,4)+' ('+fmtN(rem*100,2)+'%)</b>'; }},
  nern:{ic:'flask',cat:'chem',name:'Nernst equation',formula:'E = E⁰ − (RT/nF)·lnQ',fields:[['E0','Standard potential E⁰ (V)'],['n','Electrons transferred n'],['T','Temperature T (K) — optional (default 298)'],['q','Reaction quotient Q — optional (default 1)']],compute:function(v){ const E0=+v.E0,n=+v.n; if(!(n>0)) return 'Enter electron count n &gt; 0.'; const T=(v.T.trim()==='')?298:Math.max(0,+v.T); const Q=(v.q.trim()!==''&&+v.q>0)?+v.q:1; const E=E0+8.314*T/(n*96485)*Math.log(Q); return '<b>E_cell = '+fmtN(E,4)+' V</b>'+(v.T.trim()===''?' at 298 K':' at '+fmtN(T,2)+' K'); }},
  yield:{ic:'target',cat:'chem',name:'Percent yield',formula:'% yield = actual/(theoretical) × 100',fields:[['a','Actual yield (g)'],['b','Theoretical yield (g)']],compute:function(v){ const a=+v.a,b=+v.b; if(v.a.trim()===''||v.b.trim()==='') return 'Enter the actual and theoretical yields.'; if(isNaN(a)||isNaN(b)||a<0||!(b>0)) return 'Theoretical yield must be positive.'; const pct=a/b*100; return '<b>Percent yield = '+fmtN(pct,2)+'%</b>'+(a>b?'<br><span style="color:var(--bad)">Close to or above theoretical — check your values.</span>':''); }},
  ka:{ic:'flask',cat:'chem',name:'Kₐ from pH',formula:'Kₐ = [H⁺]²/(C − [H⁺]) &nbsp; approx Kₐ ≈ [H⁺]²/C',fields:[['c','Acid concentration C (M)'],['pH','pH of the solution']],compute:function(v){ const c=+v.c,pH=+v.pH; if(!(c>0)||isNaN(pH)) return 'Enter a positive concentration and the pH.'; if(pH<0||pH>14) return 'pH should be between 0 and 14.'; const h=Math.pow(10,-pH); const ka=h*h/c; return '<b>Kₐ = '+fmtN(ka,6)+'</b> (pKₐ = '+fmtN(-Math.log10(ka),2)+')'; }},
  rms:{ic:'wind',cat:'chem',name:'RMS speed',formula:'v_rms = √(3RT/M)',fields:[['T','Temperature T (K)'],['M','Molar mass M (kg/mol)']],compute:function(v){ const T=+v.T,M=+v.M; if(!(T>0)||!(M>0)) return 'Enter a positive temperature (K) and molar mass (kg/mol).'; return '<b>v_rms = '+fmtN(Math.sqrt(3*8.314*T/M),2)+' m/s</b>'; }},
  dg:{ic:'sparkles',cat:'chem',name:'Gibbs free energy',formula:'ΔG = ΔH − TΔS',fields:[['dh','ΔH (kJ/mol)'],['ds','ΔS (J/mol·K)'],['T','Temperature T (K)']],compute:function(v){ const dh=+v.dh,ds=+v.ds,T=+v.T; if(isNaN(dh)||isNaN(ds)||isNaN(T)) return 'Enter ΔH, ΔS and T.'; const dg=dh*1000-T*ds; return '<b>ΔG = '+fmtN(dg/1000,3)+' kJ/mol</b> — <b>'+(dg<=0?'spontaneous cell':'non-spontaneous')+'</b> at '+fmtN(T,1)+' K'; }},
  quad:{ic:'fn',cat:'math',name:'Quadratic',formula:'x = (−b ± √(b² − 4ac)) / 2a',fields:[['a','a (x² coefficient)'],['b','b (x coefficient)'],['c','c (constant)']],compute:function(v){ const a=+v.a,b=+v.b,c=+v.c; if(isNaN(a)||isNaN(b)||isNaN(c)) return 'Enter a, b and c.'; if(a===0) return b===0?'Not a quadratic equation.':'Linear root: x = '+fmtN(-c/b,4); const D=b*b-4*a*c; let roots; if(D>0) roots='x₁ = '+fmtN((-b+Math.sqrt(D))/(2*a),4)+', x₂ = '+fmtN((-b-Math.sqrt(D))/(2*a),4); else if(D===0) roots='x = '+fmtN(-b/(2*a),4); else roots='x = '+fmtN(-b/(2*a),4)+' ± '+fmtN(Math.sqrt(-D)/(2*a),4)+'i'; return '<b>Discriminant D = '+fmtN(D,2)+'</b> ('+(D>0?'two real roots':D===0?'one repeated root':'complex roots')+')<br><b>'+roots+'</b>'; }},
  err:{ic:'droplet',cat:'math',name:'% Error',formula:'% error = |true − measured| / |true| × 100',fields:[['tv','True value'],['mv','Measured value']],compute:function(v){ const t=+v.tv,m=+v.mv; if(isNaN(t)||isNaN(m)||t===0) return 'Enter both values — the true value cannot be 0.'; const ae=Math.abs(t-m); return '<b>Absolute error = '+fmtN(ae,4)+'</b><br><b>Percentage error = '+fmtN(ae/Math.abs(t)*100,2)+'%</b>'; }},
  ap:{ic:'layers',cat:'math',name:'Arithmetic series',formula:'aₙ = a + (n−1)d &nbsp; Sₙ = n(2a+(n−1)d)/2',fields:[['a','First term a'],['d','Common difference d'],['n','Number of terms n']],compute:function(v){ const a=+v.a,d=+v.d,n=+v.n; if(isNaN(a)||isNaN(d)||!(n>0)||Math.round(n)!==n) return 'Enter a, d and an integer n ≥ 1.'; return '<b>a_n = '+fmtN(a+(n-1)*d,4)+'</b><br><b>S_n = '+fmtN(n*(2*a+(n-1)*d)/2,4)+'</b>'; }},
  gp:{ic:'layers',cat:'math',name:'Geometric series',formula:'aₙ = arⁿ⁻¹ &nbsp; Sₙ = a(1−rⁿ)/(1−r)',fields:[['a','First term a'],['r','Common ratio r'],['n','Number of terms n']],compute:function(v){ const a=+v.a,r=+v.r,n=+v.n; if(isNaN(a)||isNaN(r)||!(n>0)||Math.round(n)!==n) return 'Enter a, r and an integer n ≥ 1.'; const an=a*Math.pow(r,n-1); const sn=(Math.abs(r)===1)?a*n:(a*(1-Math.pow(r,n))/(1-r)); let out='<b>a_n = '+fmtN(an,5)+'</b><br><b>S_n = '+fmtN(sn,5)+'</b>'; if(Math.abs(r)<1) out+='<br><b>S_∞ = '+fmtN(a/(1-r),5)+'</b>'; return out; }},
  perm:{ic:'fn',cat:'math',name:'Permutations',formula:'P(n,r) = n!/(n−r)!',fields:[['n','n (total items)'],['r','r (chosen)']],compute:function(v){ const n=+v.n,r=+v.r; if(!(n>=0)||!(r>=0)||Math.round(n)!==n||Math.round(r)!==r||r>n) return 'Enter integers with 0 ≤ r ≤ n.'; let p=1; for(let k=0;k<r;k++) p*=(n-k); return '<b>P('+fmtN(n,0)+', '+fmtN(r,0)+') = '+fmtN(p,0)+'</b>'; }},
  comb:{ic:'fn',cat:'math',name:'Combinations',formula:'C(n,r) = n!/(r!(n−r)!)',fields:[['n','n (total items)'],['r','r (chosen)']],compute:function(v){ let n=+v.n,r=+v.r; if(!(n>=0)||!(r>=0)||Math.round(n)!==n||Math.round(r)!==r||r>n) return 'Enter integers with 0 ≤ r ≤ n.'; if(r>n-r) r=n-r; let c=1; for(let k=0;k<r;k++) c=c*(n-k)/(k+1); return '<b>C('+fmtN(n,0)+', '+fmtN(r,0)+') = '+fmtN(Math.round(c),0)+'</b>'; }},
  dist:{ic:'gauge',cat:'math',name:'Distance & midpoint',formula:'d = √((x₂−x₁)²+(y₂−y₁)²)',fields:[['x1','x₁'],['y1','y₁'],['x2','x₂'],['y2','y₂']],compute:function(v){ if(v.x1.trim()===''||v.y1.trim()===''||v.x2.trim()===''||v.y2.trim()==='') return 'Enter all four coordinates.'; const x1=+v.x1,y1=+v.y1,x2=+v.x2,y2=+v.y2; if([x1,y1,x2,y2].some(x=>isNaN(x))) return 'Enter numeric coordinates.'; const dx=x2-x1,dy=y2-y1; return '<b>Distance = '+fmtN(Math.sqrt(dx*dx+dy*dy),3)+'</b><br><b>Midpoint = ('+fmtN((x1+x2)/2,3)+', '+fmtN((y1+y2)/2,3)+')</b>'; }},
  circle:{ic:'layers',cat:'math',name:'Circle',formula:'A = πr² &nbsp; C = 2πr',fields:[['r','Radius r (m)']],compute:function(v){ const r=+v.r; if(!(r>0)) return 'Enter a positive radius.'; return '<b>Area A = '+fmtN(Math.PI*r*r,4)+' m²</b><br><b>Circumference C = '+fmtN(2*Math.PI*r,4)+' m</b>'; }},
  sphere:{ic:'star',cat:'math',name:'Sphere',formula:'V = 4/3πr³ &nbsp; A = 4πr²',fields:[['r','Radius r (m)']],compute:function(v){ const r=+v.r; if(!(r>0)) return 'Enter a positive radius.'; return '<b>Volume V = '+fmtN(4/3*Math.PI*r*r*r,4)+' m³</b><br><b>Surface area A = '+fmtN(4*Math.PI*r*r,4)+' m²</b>'; }},
  cyl:{ic:'layers',cat:'math',name:'Cylinder',formula:'V = πr²h &nbsp; A = 2πr(r+h)',fields:[['r','Radius r (m)'],['h','Height h (m)']],compute:function(v){ const r=+v.r,h=+v.h; if(!(r>0)||!(h>0)) return 'Enter a positive radius and height.'; return '<b>Volume V = '+fmtN(Math.PI*r*r*h,4)+' m³</b><br><b>Surface area A = '+fmtN(2*Math.PI*r*(r+h),4)+' m²</b>'; }},
  degcon:{ic:'settings',cat:'math',name:'Degrees → trig',formula:'rad = θ·π/180 &nbsp; sin(θ), cos(θ), tan(θ)',fields:[['d','Angle θ (°)']],compute:function(v){ const d=+v.d; if(v.d.trim()===''||isNaN(d)) return 'Enter an angle in degrees.'; const rad=d*Math.PI/180; return '<b>Radians = '+fmtN(rad,5)+'</b><br><b>sin = '+fmtN(Math.sin(rad),5)+'</b><br><b>cos = '+fmtN(Math.cos(rad),5)+'</b><br><b>tan = '+fmtN(Math.tan(rad),5)+'</b>'; }},
  sumsq:{ic:'gauge',cat:'math',name:'Sum of powers',formula:'Σk = n(n+1)/2 &nbsp; Σk² = n(n+1)(2n+1)/6',fields:[['n','n (positive integer)']],compute:function(v){ const n=+v.n; if(!(n>=1)||Math.round(n)!==n) return 'Enter a positive integer n.'; const s=n*(n+1)/2; return '<b>Σk = '+fmtN(s,0)+'</b><br><b>Σk² = '+fmtN(n*(n+1)*(2*n+1)/6,0)+'</b><br><b>Σk³ = '+fmtN(s*s,0)+'</b>'; }},
  right:{ic:'fn',cat:'math',name:'Right triangle',formula:'c² = a² + b² &nbsp; sin A = a/c',fields:[['a','Side a'],['b','Side b'],['c','Hypotenuse c']],compute:function(v){ const gA=v.a.trim()!==''&&+v.a>0, gB=v.b.trim()!==''&&+v.b>0, gC=v.c.trim()!==''&&+v.c>0; if((gA?1:0)+(gB?1:0)+(gC?1:0)<2) return 'Enter the lengths of any two sides (positive).'; let A=gA?+v.a:null, B=gB?+v.b:null, C=gC?+v.c:null; if(A===null) A=Math.sqrt(C*C-B*B); else if(B===null) B=Math.sqrt(C*C-A*A); else if(C===null) C=Math.sqrt(A*A+B*B); if(!(A>0)||!(B>0)||!(C>0)) return 'Those sides cannot form a right triangle — check your values.'; return '<b>Hypotenuse = '+fmtN(Math.max(A,B,C),4)+'</b><br><b>Angle opposite a = '+fmtN(Math.asin(A/Math.max(A,B,C))*180/Math.PI,2)+'°</b><br><b>Angle opposite b = '+fmtN(90-Math.asin(A/Math.max(A,B,C))*180/Math.PI,2)+'°</b>'; }}
};
const NK_ORDER=[['C','clear'],['⌫','back'],['±','neg'],['÷','op'],['7','n'],['8','n'],['9','n'],['×','op'],['4','n'],['5','n'],['6','n'],['−','op'],['1','n'],['2','n'],['3','n'],['+','op'],['0','n'],['.','dot'],['=','eq']];
const SK_ORDER=[
  ['C','clear'],['⌫','back'],['(','lp'],[')','rp'],['%','op'],['!','fact'],
  ['sin','sin','sec','sec'],['cos','cos','csc','csc'],['tan','tan','cot','cot'],
  ['asin','asin','asec','asec'],['acos','acos','acsc','acsc'],['atan','atan','acot','acot'],
  ['x²','sq'],['x³','cube'],['xʸ','pow'],['√','sqrt'],['∛','cbrt'],['1/x','inv'],
  ['ln','ln'],['log','log'],['log2','log2'],['eˣ','exp'],['10ˣ','exp10'],['|x|','abs'],
  ['7','n'],['8','n'],['9','n'],['÷','op'],['π','pi','φ','phi'],['e','e','γ','gamma'],
  ['4','n'],['5','n'],['6','n'],['×','op'],['sinh','sinh','asinh','asinh'],['cosh','cosh','acosh','acosh'],
  ['1','n'],['2','n'],['3','n'],['−','op'],['tanh','tanh','atanh','atanh'],['ANS','ans'],
  ['0','n'],['.','dot'],['±','neg'],['+','op'],['=','eq']
];
const SCI_CONSTS=[
  ['π',''+Math.PI],
  ['e (Euler)',''+Math.E],
  ['φ (golden ratio)',''+(1+Math.sqrt(5))/2],
  ['τ (turn 2π)',''+(2*Math.PI)],
  ['γ (Euler–Mascheroni)','0.5772156649015329'],
  ['g — gravity, m/s²','9.80665'],
  ['c — speed of light, m/s','299792458'],
  ['h — Planck, J·s','6.62607015e-34'],
  ['ħ — reduced Planck, J·s','1.054571817e-34'],
  ['G — gravitation, N·m²/kg²','6.67430e-11'],
  ['R — gas constant, J/(mol·K)','8.314462618'],
  ["R' — gas constant, L·atm/(mol·K)",'0.08205736608096'],
  ['Nₐ — Avogadro, mol⁻¹','6.02214076e23'],
  ['k_B — Boltzmann, J/K','1.380649e-23'],
  ['e — elementary charge, C','1.602176634e-19'],
  ['m_e — electron mass, kg','9.1093837015e-31'],
  ['m_p — proton mass, kg','1.67262192369e-27'],
  ['m_n — neutron mass, kg','1.67492749804e-27'],
  ['u — atomic mass unit, kg','1.66053906660e-27'],
  ['ε₀ — permittivity, F/m','8.8541878128e-12'],
  ['μ₀ — permeability, N/A²','1.25663706212e-6'],
  ['k_e — Coulomb constant, N·m²/C²','8.9875517923e9'],
  ['σ — Stefan–Boltzmann, W/(m²·K⁴)','5.670374419e-8'],
  ['a₀ — Bohr radius, m','5.29177210903e-11'],
  ['F — Faraday constant, C/mol','96485.33212'],
  ['R∞ — Rydberg, m⁻¹','10973731.568160'],
  ['atm — atmosphere, Pa','101325'],
  ['torr — mmHg, Pa','133.322368421'],
  ['calorie, J','4.184'],
  ['T₀ — 0 °C, K','273.15'],
  ['V_m(STP) — molar volume, L','22.414'],
  ['ly — light-year, m','9.46073047258e15'],
  ['au — astronomical unit, m','149597870700']
];
function openCalc(){
  const constOpts='<option value="">Insert constant…</option>'+SCI_CONSTS.map(function(c){ return '<option value="'+c[1]+'">'+c[0]+'</option>'; }).join('');
  const w=openOverlay(
    '<div class="fv-modal-head"><h3>'+window.__I.calculator+'Calculators</h3><button class="fv-icon-btn" data-close>×</button></div>'+
    '<div class="calc-mode-tabs">'+
      '<button class="calc-mode-tab active" data-view="formula">Formula</button>'+
      '<button class="calc-mode-tab" data-view="normal">Normal</button>'+
      '<button class="calc-mode-tab" data-view="sci">Scientific</button>'+
      '<button class="calc-mode-tab" data-view="graph">Graphing</button>'+
      '<button class="calc-mode-tab" data-view="sciplot">Sci + Graph</button>'+
    '</div>'+
    '<div class="fv-modal-body">'+
      '<div class="calc-view active" data-view="formula">'+
        '<div class="calc-cats" id="calcCats"></div>'+
        '<div class="calc-tabs" id="calcTabs"></div>'+
        '<div class="calc-grid" id="calcGrid"></div>'+
      '</div>'+
      '<div class="calc-view" data-view="normal">'+
        '<div class="cal-display"><div class="cal-expr" id="normExpr">0</div><div class="cal-result" id="normResult"></div></div>'+
        '<div class="cal-pad pad-4" id="normPad">'+NK_ORDER.map(function(it){ return '<button class="cal-k" data-k="'+it[1]+'"'+(it[1]==='eq'?' data-sp="2"':'')+'>'+it[0]+'</button>'; }).join('')+'</div>'+
      '</div>'+
      '<div class="calc-view" data-view="sci">'+
        '<div class="cal-display"><div class="cal-expr" id="sciExpr">0</div><div class="cal-result" id="sciResult"></div></div>'+
        '<div class="cal-ctrl">'+
          '<select id="sciConst" aria-label="Insert a constant">'+constOpts+'</select>'+
          '<button class="cal-ctrl-b" id="sciDeg" title="Toggle degrees / radians">DEG</button>'+
          '<button class="cal-ctrl-b" id="sci2nd" title="Toggle the 2nd function layer">2nd</button>'+
        '</div>'+
        '<div class="cal-pad pad-6" id="sciPad"></div>'+
      '</div>'+
      '<div class="calc-view" data-view="graph">'+
        '<div class="g-toolbar"><span class="graph-y">y =</span><div class="g-list" id="gList"></div></div>'+
        '<div class="g-range">'+
          '<label>x</label><input id="gxmin" value="-10" aria-label="x minimum"><input id="gxmax" value="10" aria-label="x maximum">'+
          '<label>y</label><input id="gymin" value="-6" aria-label="y minimum"><input id="gymax" value="6" aria-label="y maximum">'+
          '<button class="graph-b tiny" id="gSet" title="Apply the range">Set</button>'+
          '<button class="graph-b tiny" id="gZoomIn" title="Zoom in">+</button>'+
          '<button class="graph-b tiny" id="gZoomOut" title="Zoom out">−</button>'+
          '<button class="graph-b tiny" id="gReset" title="Reset the view">Reset</button>'+
        '</div>'+
        '<div class="graph-wrap"><canvas id="graphCanvas"></canvas></div>'+
        '<div class="graph-hint">drag to pan · scroll to zoom towards the cursor · shift+scroll pans x · alt+scroll pans y · pinch zooms</div>'+
      '</div>'+
      '<div class="calc-view" data-view="sciplot">'+
        '<div class="calc-split">'+
          '<div class="sciplot-left">'+
            '<div class="cal-display"><div class="cal-expr" id="spExpr">0</div><div class="cal-result" id="spResult"></div></div>'+
            '<div class="cal-ctrl">'+
              '<select id="spConst" aria-label="Insert a constant">'+constOpts+'</select>'+
              '<button class="cal-ctrl-b" id="spDeg" title="Toggle degrees / radians">DEG</button>'+
              '<button class="cal-ctrl-b" id="sp2nd" title="Toggle the 2nd function layer">2nd</button>'+
            '</div>'+
            '<div class="cal-pad pad-6" id="spPad"></div>'+
            '<button class="fv-btn primary sciplot-plot" id="spPlot">Plot graph</button>'+
          '</div>'+
          '<div class="sciplot-right">'+
            '<div class="g-toolbar"><span class="graph-y">y =</span><div class="g-list" id="spList"></div></div>'+
            '<div class="graph-wrap"><canvas id="spCanvas"></canvas></div>'+
            '<div class="graph-hint">drag to pan · scroll to zoom · pinch zooms</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>','modal calc-modal');
  const panel=w.querySelector('.fv-ov-panel');
  const modeTabs=$$('.calc-mode-tab',w);
  let curCat='all';
  let cur=Object.keys(CALCS)[0];
  /* ---- formula calculators ---- */
  function renderCats(){
    const cc=w.querySelector('#calcCats');
    cc.innerHTML=CALC_CATS.map(function(c){ return '<button class="calc-cat-chip'+(curCat===c[0]?' active':'')+'" data-c="'+c[0]+'">'+c[1]+'</button>'; }).join('');
    $$('.calc-cat-chip',cc).forEach(function(b){ b.onclick=function(){ curCat=b.dataset.c; renderCats(); renderTabs(); render(); }; });
  }
  function renderTabs(){
    const filterKeys=Object.keys(CALCS).filter(function(k){ return curCat==='all'||CALCS[k].cat===curCat; });
    if(filterKeys.indexOf(cur)===-1) cur=filterKeys[0];
    const tabs=w.querySelector('#calcTabs');
    tabs.innerHTML='';
    let prevCat=null;
    filterKeys.forEach(function(k){
      const cat=CALCS[k].cat;
      if(cat!==prevCat){
        const h=document.createElement('div'); h.className='calc-tab-head'; h.textContent=CALC_CAT_NAMES[cat]||cat; tabs.appendChild(h);
        prevCat=cat;
      }
      const b=document.createElement('button'); b.className='calc-tab'+(k===cur?' active':''); b.dataset.k=k;
      b.innerHTML=window.__I[CALCS[k].ic]+CALCS[k].name;
      b.onclick=function(){ cur=k; $$('.calc-tab',tabs).forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); render(); };
      tabs.appendChild(b);
    });
  }
  function render(){
    const c=CALCS[cur]; const grid=w.querySelector('#calcGrid');
    grid.innerHTML='<div class="calc-fml">'+c.formula+'</div>'+c.fields.map(function(f){ return '<div class="calc-field"><label>'+f[1]+'</label><input data-f="'+f[0]+'" type="number" step="any" placeholder="—"></div>'; }).join('')+'<div class="calc-out" id="calcOut"></div>';
    $$('input',grid).forEach(function(inp){
      inp.oninput=function(){
        const v={}; let any=false;
        $$('input',grid).forEach(function(i){ v[i.dataset.f]=i.value; if(i.value.trim()!=='') any=true; });
        w.querySelector('#calcOut').innerHTML=any?c.compute(v):'';
      };
    });
  }
  renderCats(); renderTabs(); render();
  /* ---- shared calculator state ---- */
  let degFlag=false, page2=false, shared={ans:0};
  function makeCalc(groups){
    let buf='', fresh=true;
    function refresh(){
      groups.forEach(function(g){
        const disp=g[0], res=g[1];
        disp.textContent=buf||'0';
        if(res){
          if(!buf.trim()) res.textContent='';
          else{ const r=CalcEngine.eval(buf,{deg:degFlag, vars:{ans:shared.ans}}); res.textContent=r.ok?('= '+fmtN(r.value,8)):('= '+r.error); }
        }
      });
    }
    function trailingNumber(){
      let i=buf.length-1; while(i>=0&&/[0-9.]/.test(buf[i])) i--;
      if(i===buf.length-1) return null;
      const start=i+1; let neg=-1;
      if(i>=0&&buf[i]==='-'&&(i===0||'()+-*/%^'.indexOf(buf[i-1])!==-1)) neg=i;
      return {start:start, neg:neg, end:buf.length};
    }
    function input(key,label){
      const l=buf.charAt(buf.length-1);
      if(key==='n'){
        if(buf==='0'&&/[0-9]/.test(label)) buf=label;
        else if(fresh&&/[0-9]/.test(label)){ buf=label; }
        else buf+=label;
        fresh=false; refresh(); return;
      }
      if(key==='dot'){
        const tn=trailingNumber();
        if(tn&&buf.slice(tn.start,tn.end).indexOf('.')!==-1){ refresh(); return; }
        buf+='.'; fresh=false; refresh(); return;
      }
      if(key==='op'||key==='lp'||key==='rp'){
        if(key==='op'&&!buf.trim()){ refresh(); return; }
        if(key==='op'&&l&&'+-*/%^×÷−'.indexOf(l)!==-1) buf=buf.slice(0,-1);
        buf+=label; fresh=false; refresh(); return;
      }
      if(key==='clear'){ buf=''; fresh=true; refresh(); return; }
      if(key==='back'){ buf=buf.slice(0,-1); refresh(); return; }
      if(key==='neg'){
        const tn=trailingNumber();
        if(!tn){ buf+='-'; }
        else if(tn.neg>=0){ buf=buf.slice(0,tn.neg)+buf.slice(tn.neg+1); }
        else{ buf=buf.slice(0,tn.start)+'-'+buf.slice(tn.start); }
        fresh=false; refresh(); return;
      }
      if(key==='eq'){ const r=CalcEngine.eval(buf,{deg:degFlag, vars:{ans:shared.ans}}); if(r.ok){ shared.ans=r.value; buf=fmtN(r.value,10); fresh=true; } refresh(); return; }
      if(key==='ans'){ buf+=fmtN(shared.ans,8); fresh=false; refresh(); return; }
      if(key==='const'){ buf+=label; fresh=false; refresh(); return; }
      if(key==='fact'){ buf+='!'; fresh=false; refresh(); return; }
      if(key==='inv'){ buf+='^(-1)'; fresh=false; refresh(); return; }
      if(key==='sq'){ buf+='^2'; fresh=false; refresh(); return; }
      if(key==='cube'){ buf+='^3'; fresh=false; refresh(); return; }
      if(key==='pow'){ buf+='^'; fresh=false; refresh(); return; }
      if(key==='pi'){ buf+='π'; fresh=false; refresh(); return; }
      if(key==='phi'){ buf+='phi'; fresh=false; refresh(); return; }
      if(key==='gamma'){ buf+='gamma'; fresh=false; refresh(); return; }
      if(key==='e'){ buf+='e'; fresh=false; refresh(); return; }
      if(key==='sqrt'||key==='cbrt'||key==='ln'||key==='log'||key==='log2'||key==='exp'||key==='exp10'||key==='sin'||key==='cos'||key==='tan'||key==='asin'||key==='acos'||key==='atan'||key==='sec'||key==='csc'||key==='cot'||key==='asec'||key==='acsc'||key==='acot'||key==='sinh'||key==='cosh'||key==='tanh'||key==='asinh'||key==='acosh'||key==='atanh'||key==='abs'){
        buf+=(key==='sqrt'?'√(':key==='cbrt'?'cbrt(':key+'('); fresh=false; refresh(); return;
      }
    }
    return { input:input, refresh:refresh, text:function(){ return buf; }, set:function(t){ buf=t; fresh=false; refresh(); } };
  }
  const nC=makeCalc([[w.querySelector('#normExpr'),w.querySelector('#normResult')]]);
  const sC=makeCalc([[w.querySelector('#sciExpr'),w.querySelector('#sciResult')],[w.querySelector('#spExpr'),w.querySelector('#spResult')]]);
  /* ---- keypads ---- */
  const sciPad=w.querySelector('#sciPad'), spPad=w.querySelector('#spPad');
  function padHTML(){
    return SK_ORDER.map(function(it){
      const k=page2?(it[3]||it[1]):it[1];
      const l=page2?(it[2]||it[0]):it[0];
      return '<button class="cal-k" data-k="'+k+'"'+(it[1]==='eq'?' data-sp="2"':'')+'>'+l+'</button>';
    }).join('');
  }
  function bindPad(pad){
    $$('.cal-k',pad).forEach(function(b){ b.onclick=function(){ sC.input(b.dataset.k,b.textContent); }; });
  }
  function renderSciPads(){
    sciPad.innerHTML=padHTML(); bindPad(sciPad);
    spPad.innerHTML=padHTML(); bindPad(spPad);
  }
  renderSciPads();
  function bind2nd(id){
    w.querySelector(id).onclick=function(){
      page2=!page2;
      w.querySelector('#sci2nd').classList.toggle('on',page2);
      w.querySelector('#sp2nd').classList.toggle('on',page2);
      renderSciPads();
    };
  }
  bind2nd('#sci2nd'); bind2nd('#sp2nd');
  function bindConstSel(id){
    const sel=w.querySelector(id);
    sel.onchange=function(){
      if(sel.value!==''){ sC.input('const',sel.value); sel.value=''; }
    };
  }
  bindConstSel('#sciConst'); bindConstSel('#spConst');
  function bindDeg(id){
    w.querySelector(id).onclick=function(){
      degFlag=!degFlag;
      w.querySelector('#sciDeg').textContent=degFlag?'RAD':'DEG';
      w.querySelector('#spDeg').textContent=degFlag?'RAD':'DEG';
      sC.refresh();
    };
  }
  bindDeg('#sciDeg'); bindDeg('#spDeg');
  $$('.cal-k',w.querySelector('#normPad')).forEach(function(b){ b.onclick=function(){ nC.input(b.dataset.k,b.textContent); }; });
  /* ---- graphing ---- */
  const PALETTE=['#2E7CF6','#FF375F','#2FBF71','#FF9F0A','#9B5CFF','#0E93AE','#FFD60A','#FF7AC6'];
  const gCanvases=[w.querySelector('#graphCanvas'), w.querySelector('#spCanvas')];
  const gList=w.querySelector('#gList'), spList=w.querySelector('#spList');
  const gst={exps:[],x0:-10,x1:10,y0:-6,y1:6,next:0,_pan:null,_pinch:null};
  function addGraphExpr(txt){
    txt=(txt||'').trim();
    if(!txt) return false;
    if(gst.exps.some(function(e){ return e.e===txt; })) return false;
    gst.exps.push({id:gst.next++, e:txt, c:gst.exps.length%PALETTE.length});
    renderAllLists(); requestDraw(); return true;
  }
  function renderAllLists(){ [gList,spList].forEach(function(ul){ renderList(ul); }); }
  function renderList(ul){
    ul.innerHTML='';
    gst.exps.forEach(function(exp){
      const row=document.createElement('div'); row.className='g-row';
      const dot=document.createElement('button'); dot.className='g-dot'; dot.style.background=PALETTE[exp.c%PALETTE.length]; dot.title='Cycle colour';
      const inp=document.createElement('input'); inp.className='g-inp'; inp.value=exp.e; inp.spellcheck=false; inp.autocomplete='off'; inp.setAttribute('aria-label','Graph y = '+exp.e+', press Enter to draw');
      const del=document.createElement('button'); del.className='g-x'; del.textContent='×'; del.title='Remove function';
      dot.onclick=function(){ exp.c=(exp.c+1)%PALETTE.length; renderAllLists(); requestDraw(); };
      inp.addEventListener('input',function(){ exp.e=inp.value; scheduleDraw(); });
      inp.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); drawAll(); } });
      del.onclick=function(){ const i=gst.exps.indexOf(exp); if(i>-1) gst.exps.splice(i,1); renderAllLists(); requestDraw(); };
      row.appendChild(dot); row.appendChild(inp); row.appendChild(del);
      ul.appendChild(row);
    });
    if(!gst.exps.length){
      const hint=document.createElement('div'); hint.className='g-empty'; hint.textContent='No functions — type one above and press Enter';
      ul.appendChild(hint);
    }
  }
  function niceStep(range){
    const raw=range/7; if(raw<=0) return 1;
    const mag=Math.pow(10,Math.floor(Math.log10(raw))); const n=raw/mag;
    if(n<1.5) return mag; if(n<3.5) return 2*mag; if(n<7.5) return 5*mag; return 10*mag;
  }
  function trunc(s,n){ s=String(s); return s.length>n?s.slice(0,n-1)+'…':s; }
  function drawGraph(cv){
    const rect=cv.getBoundingClientRect();
    if(!rect.width||!rect.height) return;
    const dpr=window.devicePixelRatio||1;
    cv.width=Math.round(rect.width*dpr); cv.height=Math.round(rect.height*dpr);
    const c2=cv.getContext('2d');
    c2.setTransform(dpr,0,0,dpr,0,0);
    const W=rect.width,H=rect.height;
    const css=getComputedStyle(document.documentElement);
    c2.fillStyle=css.getPropertyValue('--input-bg').trim()||'rgba(15,22,40,0.6)';
    c2.fillRect(0,0,W,H);
    const X=x=>W*(x-gst.x0)/(gst.x1-gst.x0);
    const Y=y=>H-(y-gst.y0)/(gst.y1-gst.y0);
    const sx=niceStep(gst.x1-gst.x0), sy=niceStep(gst.y1-gst.y0);
    c2.lineWidth=1; c2.strokeStyle=css.getPropertyValue('--soft-border').trim()||'rgba(255,255,255,0.07)';
    c2.font='11px ui-monospace,Consolas,monospace';
    c2.fillStyle=css.getPropertyValue('--text-low').trim()||'#8a93a6';
    c2.beginPath();
    for(let gx=Math.ceil(gst.x0/sx)*sx; gx<=gst.x1; gx+=sx){ c2.moveTo(X(gx),0); c2.lineTo(X(gx),H); }
    for(let gy=Math.ceil(gst.y0/sy)*sy; gy<=gst.y1; gy+=sy){ c2.moveTo(0,Y(gy)); c2.lineTo(W,Y(gy)); }
    c2.stroke();
    c2.strokeStyle=css.getPropertyValue('--text-mid').trim()||'rgba(255,255,255,0.35)'; c2.lineWidth=1.2;
    c2.beginPath();
    if(gst.x0<=0&&gst.x1>=0){ c2.moveTo(X(0),0); c2.lineTo(X(0),H); }
    if(gst.y0<=0&&gst.y1>=0){ c2.moveTo(0,Y(0)); c2.lineTo(W,Y(0)); }
    c2.stroke();
    c2.textAlign='left';
    for(let gx=Math.ceil(gst.x0/sx)*sx; gx<=gst.x1; gx+=sx){ if(gx===0){continue;} c2.fillText(fmtN(gx,2), X(gx)+4, Y(0)+14); }
    for(let gy=Math.ceil(gst.y0/sy)*sy; gy<=gst.y1; gy+=sy){ if(gy===0){continue;} c2.fillText(fmtN(gy,2), X(0)+5, Y(gy)-4); }
    if(!gst.exps.length){
      c2.fillStyle=css.getPropertyValue('--text-low').trim()||'#8a93a6';
      c2.textAlign='center';
      c2.fillText('Type a function above and press Enter', W/2, H/2);
      return;
    }
    c2.lineJoin='round'; c2.lineCap='round';
    let firstErr=null;
    gst.exps.forEach(function(exp){
      const cc=CalcEngine.compile(exp.e,{deg:false});
      if(!cc.ok){ if(!firstErr) firstErr=exp; return; }
      const fn=CalcEngine.fn(cc);
      c2.strokeStyle=PALETTE[exp.c%PALETTE.length]; c2.lineWidth=2.4;
      c2.beginPath();
      const N=Math.min(1600,Math.max(400,Math.round(W)));
      let drawing=false, prevY=null;
      for(let i=0;i<=N;i++){
        const x=gst.x0+(gst.x1-gst.x0)*i/N;
        const y=fn({x:x});
        if(!isFinite(y)){ drawing=false; prevY=null; continue; }
        if(drawing&&prevY!==null&&Math.abs(y-prevY)>(gst.y1-gst.y0)*8) drawing=false;
        const px=X(x), py=Y(y);
        if(!drawing){ c2.moveTo(px,py); drawing=true; }
        else c2.lineTo(px,py);
        prevY=y;
      }
      c2.stroke();
    });
    if(firstErr){
      const cc=CalcEngine.compile(firstErr.e,{deg:false});
      c2.fillStyle='rgba(255,93,108,0.9)'; c2.textAlign='center'; c2.font='600 13px inherit';
      c2.fillText('y = '+trunc(firstErr.e,26)+' — '+(cc.error||'cannot plot'), W/2, 30);
    }
    let ly=18;
    gst.exps.forEach(function(exp){
      c2.fillStyle=PALETTE[exp.c%PALETTE.length];
      c2.fillRect(14,ly-9,11,11);
      c2.fillStyle=css.getPropertyValue('--text-mid').trim()||'rgba(255,255,255,0.7)';
      c2.textAlign='left';
      c2.fillText('y = '+trunc(exp.e,30), 32, ly);
      ly+=20;
      if(ly>H-14){ ly=18; }
    });
  }
  function drawAll(){ gCanvases.forEach(function(cv){ if(cv.isConnected&&cv.getBoundingClientRect().width>0) drawGraph(cv); }); }
  let drawTimer=null, drawRaf=null;
  function requestDraw(){ if(drawRaf) return; drawRaf=requestAnimationFrame(function(){ drawRaf=null; drawAll(); }); }
  function scheduleDraw(){ clearTimeout(drawTimer); drawTimer=setTimeout(requestDraw,160); }
  function bindGraph(cv){
    cv.addEventListener('wheel',function(e){
      e.preventDefault();
      const rect=cv.getBoundingClientRect();
      const spanX=gst.x1-gst.x0, spanY=gst.y1-gst.y0;
      if(e.shiftKey){
        const dx=(e.deltaY||e.deltaX)*(spanX/480);
        gst.x0+=dx; gst.x1+=dx;
      } else if(e.altKey){
        const dy=(e.deltaY||e.deltaX)*(spanY/480);
        gst.y0-=dy; gst.y1-=dy;
      } else {
        const factor=e.ctrlKey?1.12:1.35;
        const f=e.deltaY>0?factor:1/factor;
        const mx=(e.clientX-rect.left)/rect.width;
        const my=(e.clientY-rect.top)/rect.height;
        const cx=gst.x0+spanX*mx;
        const cy=gst.y0+spanY*(1-my);
        gst.x0=cx-(cx-gst.x0)*f; gst.x1=cx+(gst.x1-cx)*f;
        gst.y0=cy-(cy-gst.y0)*f; gst.y1=cy+(gst.y1-cy)*f;
      }
      requestDraw();
    },{passive:false});
    const ptrs={};
    function clearPtr(){ if(Object.keys(ptrs).length===0){ gst._pan=null; gst._pinch=null; } }
    cv.addEventListener('pointerdown',function(e){
      e.preventDefault();
      try{ cv.setPointerCapture(e.pointerId); }catch(err){}
      ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
      gst._pan={x:e.clientX,y:e.clientY,x0:gst.x0,x1:gst.x1,y0:gst.y0,y1:gst.y1};
    });
    cv.addEventListener('pointermove',function(e){
      if(!ptrs.hasOwnProperty(e.pointerId)) return;
      ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
      const ids=Object.keys(ptrs);
      const rect=cv.getBoundingClientRect();
      if(ids.length===1){
        if(gst._pinch){ gst._pinch=null; gst._pan={x:ptrs[ids[0]].x,y:ptrs[ids[0]].y,x0:gst.x0,x1:gst.x1,y0:gst.y0,y1:gst.y1}; }
        if(!gst._pan) return;
        const p=gst._pan;
        const xpp=(p.x1-p.x0)/rect.width, ypp=(p.y1-p.y0)/rect.height;
        const dx=e.clientX-p.x, dy=e.clientY-p.y;
        gst.x0=p.x0-dx*xpp; gst.x1=p.x1-dx*xpp;
        gst.y0=p.y0+dy*ypp; gst.y1=p.y1+dy*ypp;
        requestDraw();
      } else if(ids.length===2){
        const a=ptrs[ids[0]], b=ptrs[ids[1]];
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(!gst._pinch){ gst._pinch={d:Math.max(1,d)}; return; }
        const f=d/Math.max(1,gst._pinch.d);
        gst._pinch.d=Math.max(1,d);
        const cx=gst.x0+(gst.x1-gst.x0)*((((a.x+b.x)/2-rect.left)/rect.width));
        const cy=gst.y0+(gst.y1-gst.y0)*(1-((rect.bottom-(a.y+b.y)/2)/rect.height));
        gst.x0=cx-(cx-gst.x0)/f; gst.x1=cx+(gst.x1-cx)/f;
        gst.y0=cy-(cy-gst.y0)/f; gst.y1=cy+(gst.y1-cy)/f;
        gst._pan=null;
        requestDraw();
      }
    });
    function endPtr(e){ delete ptrs[e.pointerId]; clearPtr(); }
    cv.addEventListener('pointerup',endPtr);
    cv.addEventListener('pointercancel',endPtr);
    cv.addEventListener('pointerleave',function(e){ if(e.pointerType!=='touch'){ delete ptrs[e.pointerId]; clearPtr(); } });
  }
  gCanvases.forEach(bindGraph);
  w.querySelector('#gZoomIn').onclick=function(){ const f=0.8, cx=(gst.x0+gst.x1)/2, cy=(gst.y0+gst.y1)/2; gst.x0=cx-(cx-gst.x0)*f; gst.x1=cx+(gst.x1-cx)*f; gst.y0=cy-(cy-gst.y0)*f; gst.y1=cy+(gst.y1-cy)*f; requestDraw(); };
  w.querySelector('#gZoomOut').onclick=function(){ const f=1.25, cx=(gst.x0+gst.x1)/2, cy=(gst.y0+gst.y1)/2; gst.x0=cx-(cx-gst.x0)*f; gst.x1=cx+(gst.x1-cx)*f; gst.y0=cy-(cy-gst.y0)*f; gst.y1=cy+(gst.y1-cy)*f; requestDraw(); };
  w.querySelector('#gReset').onclick=function(){ gst.x0=-10; gst.x1=10; gst.y0=-6; gst.y1=6; w.querySelector('#gxmin').value='-10'; w.querySelector('#gxmax').value='10'; w.querySelector('#gymin').value='-6'; w.querySelector('#gymax').value='6'; requestDraw(); };
  w.querySelector('#gSet').onclick=function(){
    const a=+w.querySelector('#gxmin').value, b=+w.querySelector('#gxmax').value, c=+w.querySelector('#gymin').value, d=+w.querySelector('#gymax').value;
    if(isFinite(a)&&isFinite(b)&&isFinite(c)&&isFinite(d)&&a<b&&c<d){ gst.x0=a; gst.x1=b; gst.y0=c; gst.y1=d; requestDraw(); }
  };
  w.querySelector('#spPlot').onclick=function(){ if(addGraphExpr(sC.text())) toast('Plotted: '+trunc(sC.text(),24)); };
  addGraphExpr('x^2'); addGraphExpr('sin(x)');
  renderAllLists();
  /* ---- mode tabs ---- */
  modeTabs.forEach(function(t){
    t.onclick=function(){
      modeTabs.forEach(function(x){ x.classList.remove('active'); });
      t.classList.add('active');
      $$('.calc-view',w).forEach(function(vw){ vw.classList.toggle('active',vw.dataset.view===t.dataset.view); });
      panel.classList.toggle('sciplot-wide',t.dataset.view==='sciplot');
      if(t.dataset.view==='graph'||t.dataset.view==='sciplot'){ requestDraw(); }
    };
  });
  function onRS(){ if(!w.isConnected){ window.removeEventListener('resize',onRS); return; } requestDraw(); }
  window.addEventListener('resize',onRS);
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
  if(chapter){ setTimeout(function(){ const chip=document.querySelector('#chapterChips .chip[data-chapter="'+chapter.replace(/"/g,'&quot;')+'"]'); if(chip) chip.click(); },50); }
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
