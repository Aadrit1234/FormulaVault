(function(){
  "use strict";

  const __L='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
  const __LE='</svg>';
  const __IC={
    star:__L+'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'+__LE,
    starFilled:__L+'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none"/>'+__LE,
    sparkles:__L+'<path d="M12 3l1.9 5.6a2 2 0 0 0 1.3 1.3L20.8 12l-5.6 1.9a2 2 0 0 0-1.3 1.3L12 20.8l-1.9-5.6a2 2 0 0 0-1.3-1.3L3.2 12l5.6-1.9a2 2 0 0 0 1.3-1.3z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>'+__LE,
    settings:__L+'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'+__LE,
    history:__L+'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>'+__LE,
    messagePlus:__L+'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 8v6"/><path d="M9 11h6"/>'+__LE,
    printer:__L+'<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>'+__LE,
    fileText:__L+'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'+__LE,
    bookmark:__L+'<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>'+__LE,
    moon:__L+'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'+__LE,
    calculator:__L+'<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>'+__LE,
    layers:__L+'<path d="M12 2 4 7l8 5 8-5-8-5Z"/><path d="m17 11 3 2-8 5-8-5 3-2"/><path d="m17 16 3 2-8 5-8-5 3-2"/>'+__LE,
    target:__L+'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'+__LE,
    rocket:__L+'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'+__LE,
    gauge:__L+'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>'+__LE,
    zap:__L+'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>'+__LE,
    wind:__L+'<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>'+__LE,
    flask:__L+'<path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2"/><path d="M6.453 15h11.094"/><path d="M8.5 2h7"/>'+__LE,
    fn:__L+'<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"/><path d="M9 11.2h5.5"/>'+__LE,
    droplet:__L+'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>'+__LE,
    x:__L+'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'+__LE
  };
  window.__I=__IC;
  window.__STAR_OUT=__IC.star;
  window.__STAR_FILL=__IC.starFilled;
  window.__SPARK=__IC.sparkles;

  /* ============================= DATA ============================= */
  const DATA = (window.FVDATA || []);

  /* ============================= DERIVATIONS ============================= */
  const DERIVATIONS = (window.FVDERIVATIONS || []);

  /* ============================= LAWS ============================= */
  const LAWS = (window.FVLAWS || []);

  /* ---------- flatten + index ---------- */
  const CARDS = [];
  DATA.forEach(ch=>{
    ch.formulas.forEach(f=>{
      const searchText = [f.t, ch.chapter, ch.subject, "class "+ch.cls,
        f.eq.replace(/<[^>]+>/g,' '),
        (f.sym||[]).map(s=>s[0]+' '+s[1]).join(' '),
        (f.cases||[]).join(' ').replace(/<[^>]+>/g,' '),
        (f.consts||[]).join(' '),
        f.tip||''
      ].join(' ').toLowerCase();
      CARDS.push({
        cls: ch.cls, subject: ch.subject, chapter: ch.chapter,
        t: f.t, eq: f.eq, sym: f.sym||[], tip: f.tip||'',
        consts: f.consts||null, cases: f.cases||null,
        search: searchText
      });
    });
  });

  const ACCENT = { physics: "#1D64D8", chemistry: "#0E93AE", math: "#5457D9" };
  const SUBJECT_LABEL = { physics: "Physics", chemistry: "Chemistry", math: "Mathematics" };

  const DCARDS = [];
  DERIVATIONS.forEach(ch=>{
    ch.derivations.forEach(d=>{
      const searchText = [d.t, ch.chapter, ch.subject, "class "+ch.cls,
        d.given||'',
        (d.steps||[]).join(' '),
        d.result||''
      ].join(' ').replace(/<[^>]+>/g,' ').toLowerCase();
      DCARDS.push({
        cls: ch.cls, subject: ch.subject, chapter: ch.chapter,
        t: d.t, given: d.given||'', steps: d.steps||[], result: d.result||'',
        search: searchText
      });
    });
  });

  const LCARDS = [];
  LAWS.forEach(ch=>{
    ch.laws.forEach(l=>{
      const searchText = [l.t, ch.chapter, ch.subject, "class "+ch.cls,
        l.statement||'',
        l.multipart||'',
        (l.terms||[]).map(s=>s[0]+' '+s[1]).join(' '),
        (l.formulas||[]).join(' '),
        l.tip||''
      ].join(' ').replace(/<[^>]+>/g,' ').toLowerCase();
      LCARDS.push({
        cls: ch.cls, subject: ch.subject, chapter: ch.chapter,
        t: l.t, statement: l.statement||'', terms: l.terms||[], formulas: l.formulas||[],
        multipart: l.multipart||'', tip: l.tip||'',
        search: searchText
      });
    });
  });

  /* ============ typo-tolerant universal search ("AI search") ============ */
  /*
    Searches the ENTIRE vault (formulas + derivations + laws, all classes &
    subjects) regardless of the active mode/filter. Matching is fuzzy so
    misspelled queries still resolve: edit-distance typo tolerance, greek
    symbol names (λ -> "lambda", θ -> "theta"...), stopword removal and
    field weighting (title > chapter/subject > body).
  */
  const SEARCH = (function(){
    const GREEK = {
      'α':'alpha','β':'beta','γ':'gamma','δ':'delta','ε':'epsilon','ζ':'zeta','η':'eta','θ':'theta',
      'λ':'lambda','μ':'mu','ν':'nu','ξ':'xi','π':'pi','ρ':'rho','σ':'sigma','τ':'tau','φ':'phi','ϕ':'phi','χ':'chi','ψ':'psi','ω':'omega',
      'Γ':'gamma','Δ':'delta','Θ':'theta','Λ':'lambda','Π':'pi','Σ':'sigma','Φ':'phi','Ψ':'psi','Ω':'omega',
      '√':'sqrt','∫':'integral','≤':'less','≥':'greater','×':'times','·':'dot','÷':'divide','≈':'approx','∞':'infinity','°':'degree'
    };
    const STOP = new Set(['a','an','the','of','to','in','on','for','and','or','is','by','do','does','did','with','at','from','as','be','its','it']);
    function norm(s){
      s = String(s||'').toLowerCase().replace(/[\u2019\u2018']/g,'');
      let out='';
      for(let i=0;i<s.length;i++){ const ch=s[i]; out += GREEK[ch] ? ' '+GREEK[ch]+' ' : ch; }
      return out.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[²³⁴]/g,m=>m==='²'?'2':m==='³'?'3':'4')
        .replace(/(tion|sion|cion|cian|shun)/g,'shn')
        .replace(/ph/g,'f')
        .replace(/(\w)\1+/g,'$1'); // collapse double letters (typing habit)
    }
    function tokens(s){ return norm(s).split(/[^a-z0-9]+/).filter(t=>t.length); }
    function lev(a,b){
      if(a===b) return 0;
      const m=a.length, n=b.length;
      if(!m||!n) return m||n;
      if(Math.abs(m-n)>2) return 99;
      const dp=[]; for(let i=0;i<=m;i++){ dp[i]=[i]; for(let j=1;j<=n;j++) dp[i][j]=0; }
      for(let j=0;j<=n;j++) dp[0][j]=j;
      for(let i=1;i<=m;i++){ const ai=a[i-1]; for(let j=1;j<=n;j++){
        dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(ai===b[j-1]?0:1));
      } }
      return dp[m][n];
    }
    const _stemCache = {};
    function stem(w){
      const c=_stemCache[w]; if(c!==undefined) return c;
      let res=w;
      if(w.length>=5){
        const SUF=['ational','tional','ation','ance','ence','ment','ness','ions','tion','ity','ious','ive','ous','al','ic','ing','er','ed','es','s'];
        for(let k=0;k<SUF.length;k++){
          const sf=SUF[k];
          if(w.length-sf.length>=4 && w.slice(w.length-sf.length)===sf){ res=w.slice(0,w.length-sf.length); break; }
        }
      }
      return _stemCache[w]=res;
    }
    function maskOf(s){
      let m=0;
      for(let i=0;i<s.length;i++){ const c=s.charCodeAt(i); m |= (c>=97&&c<=122) ? (1<<(c-97)) : (c>=48&&c<=57) ? (1<<26) : 0; }
      return m;
    }
    function popc(x){ x -= (x>>1)&0x55555555; x = (x&0x33333333)+((x>>2)&0x33333333); x = (x+(x>>4))&0x0f0f0f0f; return (x*0x01010101)>>24; }
    const _levCache = new Map();
    function levC(a,b){
      const key = a<b ? (a+'|'+b) : (b+'|'+a);
      const v=_levCache.get(key); if(v!==undefined) return v;
      const d=lev(a,b); if(_levCache.size>8000) _levCache.clear(); _levCache.set(key,d); return d;
    }
    function levScore(a,b,L){
      const d=levC(a,b);
      if(d===1) return L<=5 ? 0.85 : 0.90;
      if(d===2) return L>=6 ? 0.78 : -1;
      if(d===3) return L>=8 ? 0.70 : -1;
      return -1;
    }
    function simRaw(qS,qm,tS,tm){
      if(qS===tS) return 1;
      const ql=qS.length, tl=tS.length;
      if(tS.indexOf(qS)===0 && ql>=3) return 0.95;
      if(qS.indexOf(tS)===0 && tl>=3 && ql===tl+1) return 0.92;
      if(tS.indexOf(qS)>0 && ql>=3) return 0.9;
      if(ql<3 || tl<3) return -1;
      if(Math.abs(ql-tl)>2) return -1;
      if(popc(qm & ~tm) > 3) return -1;
      return levScore(qS,tS,Math.max(ql,tl));
    }
    function tokSim(q,t){
      let best=simRaw(q.w,q.m,t.w,t.m);
      if(best<0.9){
        best=Math.max(best, simRaw(q.st,q.sm,t.w,t.m));
        if(best<0.9){
          best=Math.max(best, simRaw(q.w,q.m,t.st,t.sm));
          if(best<0.9) best=Math.max(best, simRaw(q.st,q.sm,t.st,t.sm));
        }
      }
      return best;
    }
    function _mk(w){ return { w:w, st:stem(w), m:maskOf(w), sm:maskOf(stem(w)) }; }
    function pools(c){
      if(c._p) return c._p;
      return c._p = {
        hi: tokens(c.t).map(_mk),
        mid: tokens(c.chapter).concat(tokens(c.subject), tokens('class '+c.cls)).map(_mk),
        low: tokens(c.search).map(_mk)
      };
    }
    function scoreCard(qt,c){
      const p=pools(c);
      const qq = qt.map(function(tt){ return { w:tt, st:stem(tt), m:maskOf(tt), sm:maskOf(stem(tt)) }; });
      let total=0, matched=0, bestAny=0, fuzzy=false;
      for(const qx of qq){
        let best=-1, bf=false, w=0;
        for(const t of p.hi){ const s=tokSim(qx,t); if(s>best){ best=s; bf=s<0.94; w=1; } }
        if(best<0){ for(const t of p.mid){ const s=tokSim(qx,t); if(s>best){ best=s; bf=s<0.94; w=0.9; } } }
        if(best<0){ for(const t of p.low){ const s=tokSim(qx,t); if(s>best){ best=s; bf=s<0.94; w=0.7; } } }
        if(best<0) continue;
        if(best>bestAny) bestAny=best;
        total += best * w;
        matched++; if(bf) fuzzy=true;
      }
      if(!matched) return null;
      const minCov = qt.length===1 ? 1 : Math.ceil(qt.length*0.5);
      if(matched < minCov || bestAny < 0.7) return null;
      return { score: total + (matched>=qt.length?0.15:0), coverage: matched/qt.length, fuzzy:fuzzy };
    }
    function run(list, qt){
      const out=[];
      for(const c of list){ const r=scoreCard(qt,c); if(r) out.push({card:c, score:r.score, coverage:r.coverage, fuzzy:r.fuzzy}); }
      out.sort(function(a,b){ return (b.coverage-a.coverage) || (b.score-a.score); });
      return out;
    }
    function search(raw){
      const q=norm(raw||'');
      const qt=tokens(q).filter(t=>!STOP.has(t));
      if(!qt.length) return { formulas:[], derivations:[], laws:[], fuzzy:false, tokens:[] };
      if(qt.join('').length<2) return { formulas:[], derivations:[], laws:[], fuzzy:false, tokens:[] };
      const formulas=run(CARDS,qt), derivations=run(DCARDS,qt), laws=run(LCARDS,qt);
      return { formulas:formulas, derivations:derivations, laws:laws,
               fuzzy: formulas.some(m=>m.fuzzy)||derivations.some(m=>m.fuzzy)||laws.some(m=>m.fuzzy), tokens:qt };
    }
    return { search:search, tokens:tokens, STOP:STOP };
  })();

  /* ---------- state ---------- */
  const state = { cls: "11", subject: "physics", chapter: "all", query: "", mode: "formulas" };

  const grid = document.getElementById('grid');
  const chapterChips = document.getElementById('chapterChips');
  const countPill = document.getElementById('countPill');
  const searchInput = document.getElementById('search');
  const clearBtn = document.getElementById('clearSearch');
  const controlsWrap = document.getElementById('controlsWrap');
  const themeToggle = document.getElementById('themeToggle');
  let _searchTimer = null;

  themeToggle.addEventListener('click', ()=>{
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    html.setAttribute('data-theme', isLight ? 'dark' : 'light');
  });

  function flipSVG(){
    return '<svg viewBox="0 0 24 24" fill="none"><path d="M17 2L21 6L17 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12V10C3 7.8 4.8 6 7 6H21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M7 22L3 18L7 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12V14C21 16.2 19.2 18 17 18H3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }

  function cardHTML(c, idx, showTag, hl){
    const accent = ACCENT[c.subject] || "#1D64D8";
    const titleHTML = hl ? hl(c.t) : c.t;
    const tag = showTag
      ? '<div class="card-tag">Class '+c.cls+' • <b style="color:'+accent+'">'+SUBJECT_LABEL[c.subject]+'</b> • '+c.chapter+'</div>'
      : '';
    const symHTML = c.sym.length
      ? '<ul class="sym-list">' + c.sym.map(s=>'<li><b>'+s[0]+'</b><span>'+s[1]+'</span></li>').join('') + '</ul>'
      : '';
    const constsHTML = (c.consts && c.consts.length)
      ? '<div class="const-box">' + c.consts.map(x=>'<div>'+x+'</div>').join('') + '</div>'
      : '';
    const casesHTML = (c.cases && c.cases.length)
      ? '<div class="case-box" style="--accent-c:'+accent+'"><span class="case-label">Special cases</span><ul>' + c.cases.map(x=>'<li>'+x+'</li>').join('') + '</ul></div>'
      : '';
    const tipHTML = c.tip ? '<div class="tip-box"><b>Tip — </b>'+c.tip+'</div>' : '';
    const backDetail = (symHTML + constsHTML + casesHTML + tipHTML) ||
      '<div class="tip-box" style="margin-top:6px">No extra notes on this card — flip back to review the equation.</div>';
    return (
      '<div class="card-outer" data-idx="'+idx+'" tabindex="0" role="button" aria-label="'+c.t+', tap to flip">'+
        '<div class="card-inner">'+
          '<div class="face face-front" style="--accent-c:'+accent+'">'+
            '<div class="card-actions">'+
              '<button class="card-btn fv-fav'+(window.__fvIsFav&&window.__fvIsFav(c)?' active':'')+'" data-fav="'+idx+'" title="Bookmark" aria-label="Bookmark formula">'+(window.__fvIsFav&&window.__fvIsFav(c)?window.__I.starFilled:window.__I.star)+'</button>'+
              '<button class="card-btn fv-explain" data-explain="'+idx+'" title="Explain with AI" aria-label="Explain with AI">'+window.__I.sparkles+'</button>'+
            '</div>'+
            tag +
            '<div class="card-title">'+titleHTML+'</div>'+
            '<div class="card-eq">'+c.eq+'</div>'+
            '<div class="card-hint">'+flipSVG()+' tap to flip</div>'+
          '</div>'+
          '<div class="face face-back" style="--accent-c:'+accent+'">'+
            '<div class="back-chapter">'+c.chapter+'</div>'+
            backDetail +
          '</div>'+
        '</div>'+
      '</div>'
    );
  }

  function derivCardHTML(d, idx, hl){
    const accent = ACCENT[d.subject] || "#1D64D8";
    const titleHTML = hl ? hl(d.t) : d.t;
    const givenHTML = d.given ? '<div class="deriv-given"><b>Given — </b>'+d.given+'</div>' : '';
    const stepsHTML = d.steps.length
      ? '<ol class="deriv-steps">' + d.steps.map(s=>'<li>'+s+'</li>').join('') + '</ol>'
      : '';
    const resultHTML = d.result
      ? '<div class="deriv-result"><span class="deriv-result-label">Result</span><div class="deriv-result-eq">'+d.result+'</div></div>'
      : '';
    return (
      '<div class="deriv-card" data-idx="'+idx+'" style="--accent-c:'+accent+'">'+
        '<div class="deriv-head" tabindex="0" role="button" aria-label="'+d.t+', tap to expand">'+
          '<div class="deriv-head-text">'+
            '<span class="deriv-tag">Class '+d.cls+' • '+SUBJECT_LABEL[d.subject]+' • '+d.chapter+'</span>'+
            '<span class="deriv-title">'+titleHTML+'</span>'+
          '</div>'+
          '<svg class="deriv-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
        '</div>'+
        '<div class="deriv-body"><div class="deriv-body-inner">'+
          givenHTML + stepsHTML + resultHTML +
        '</div></div>'+
      '</div>'
    );
  }

  function lawCardHTML(l, idx, hl){
    const accent = ACCENT[l.subject] || "#1D64D8";
    const titleHTML = hl ? hl(l.t) : l.t;
    const statementHTML = l.statement ? '<div class="law-statement">'+l.statement+'</div>' : '';
    const multipartHTML = l.multipart ? '<span class="law-multipart">'+l.multipart+'</span>' : '';
    const termsHTML = l.terms.length
      ? '<span class="law-section-label">Key terms</span><ul class="law-terms">' + l.terms.map(s=>'<li><b>'+s[0]+'</b><span>'+s[1]+'</span></li>').join('') + '</ul>'
      : '';
    const formulasHTML = l.formulas.length
      ? '<span class="law-section-label">Formulas that follow from this law</span><ul class="law-formulas">' + l.formulas.map(x=>'<li>'+x+'</li>').join('') + '</ul>'
      : '';
    const tipHTML = l.tip ? '<div class="tip-box"><b>Tip — </b>'+l.tip+'</div>' : '';
    return (
      '<div class="law-card" data-idx="'+idx+'" style="--accent-c:'+accent+'">'+
        '<div class="deriv-head" tabindex="0" role="button" aria-label="'+l.t+', tap to expand">'+
          '<div class="deriv-head-text">'+
            '<span class="deriv-tag">Class '+l.cls+' • '+SUBJECT_LABEL[l.subject]+' • '+l.chapter+'</span>'+
            '<span class="deriv-title">'+titleHTML+'</span>'+
          '</div>'+
          '<svg class="deriv-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'+
        '</div>'+
        '<div class="deriv-body"><div class="deriv-body-inner">'+
          multipartHTML + statementHTML + termsHTML + formulasHTML + tipHTML +
        '</div></div>'+
      '</div>'
    );
  }

  function getChaptersFor(cls, subject){
    const src = state.mode === 'formulas' ? DATA : (state.mode === 'derivations' ? DERIVATIONS : LAWS);
    return src.filter(d=>d.cls===cls && d.subject===subject).map(d=>d.chapter);
  }

  function renderChips(){
    const chapters = getChaptersFor(state.cls, state.subject);
    let html = '<button class="chip'+(state.chapter==="all"?" active":"")+'" data-chapter="all">All chapters</button>';
    chapters.forEach(ch=>{
      html += '<button class="chip'+(state.chapter===ch?" active":"")+'" data-chapter="'+ch.replace(/"/g,'&quot;')+'">'+ch+'</button>';
    });
    chapterChips.innerHTML = html;
  }

  function renderCards(){
    if(state.query.trim()){ renderUniversalSearch(); return; }
    if(state.mode === 'derivations'){ renderDerivationCards(); return; }
    if(state.mode === 'laws'){ renderLawCards(); return; }
    let html = '';
    let count = 0;
    const chaptersData = DATA.filter(d=>d.cls===state.cls && d.subject===state.subject &&
      (state.chapter==="all" || d.chapter===state.chapter));

    if(chaptersData.length === 0){
      html = '<div class="empty-state"><h3>Nothing here yet</h3><p>Try a different chapter or subject.</p></div>';
    } else {
      chaptersData.forEach(ch=>{
        html += '<div class="chapter-heading"><h2>'+ch.chapter+'</h2><span>'+ch.formulas.length+' formulas</span></div>';
        ch.formulas.forEach(f=>{
          const idx = CARDS.findIndex(c=>c.cls===ch.cls && c.subject===ch.subject && c.chapter===ch.chapter && c.t===f.t);
          html += cardHTML(CARDS[idx], idx, false);
          count++;
        });
      });
    }
    controlsWrap.style.opacity = '1';
    controlsWrap.style.pointerEvents = 'auto';
    grid.innerHTML = html;
    countPill.textContent = count + (count===1 ? ' formula' : ' formulas');
  }

  function escQ(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function makeHL(qRaw){
    const qt = SEARCH.tokens(qRaw).filter(function(t){ return t.length>=2 && !SEARCH.STOP.has(t); });
    if(!qt.length) return null;
    return function(text){
      let out = escQ(text);
      qt.forEach(function(tkn){
        out = out.replace(new RegExp('('+tkn.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'), '<mark>$1</mark>');
      });
      return out;
    };
  }
  function renderUniversalSearch(){
    const q = state.query.trim();
    const rawTokens = SEARCH.tokens(q);
    let html = '';
    if(!rawTokens.length){
      html = '<div class="empty-state"><h3>Keep typing…</h3><p>Search works across formulas, derivations and laws — even for misspellings.</p></div>';
      grid.innerHTML = html;
      countPill.textContent = '';
      controlsWrap.style.opacity = '0.4';
      controlsWrap.style.pointerEvents = 'none';
      return;
    }
    const res = SEARCH.search(q);
    const hl = makeHL(q);
    if(!res.tokens.length){
      html = '<div class="empty-state"><h3>Be more specific…</h3><p>Those words are all ignored as filler. Try adding a real term — like “projectile”, “pH”, or “lambda”.</p></div>';
      controlsWrap.style.opacity = '0.4';
      controlsWrap.style.pointerEvents = 'none';
      grid.innerHTML = html;
      countPill.textContent = '';
      return;
    }
    const cap = function(list,n){ return { list: list.slice(0,n), total: list.length }; };
    const cf = cap(res.formulas,60), cd = cap(res.derivations,30), cl = cap(res.laws,30);
    const total = cf.total + cd.total + cl.total;

    if(!total){
      html = '<div class="empty-state"><h3>No matches for “'+escQ(q)+'”</h3><p>Even after typo-correction and symbol lookup, nothing matched. Try simpler words — like “projectile”, “pH”, or “lambda”.</p></div>';
    } else {
      if(res.fuzzy){
        html += '<div class="deriv-note">Typo-aware search — best matches for “'+escQ(q)+'” across <b>all classes &amp; subjects</b>.</div>';
      }
      if(cf.list.length){
        html += '<div class="chapter-heading"><h2>Formulas</h2><span>'+(cf.total>cf.list.length ? cf.list.length+' of '+cf.total+' · top matches' : cf.total+' found')+'</span></div>';
        cf.list.forEach((m)=>{ html += cardHTML(m.card, CARDS.indexOf(m.card), true, hl); });
      }
      if(cd.list.length){
        html += '<div class="chapter-heading"><h2>Derivations</h2><span>'+(cd.total>cd.list.length ? cd.list.length+' of '+cd.total+' · top matches' : cd.total+' found')+'</span></div>';
        cd.list.forEach((m)=>{ html += derivCardHTML(m.card, DCARDS.indexOf(m.card), hl); });
      }
      if(cl.list.length){
        html += '<div class="chapter-heading"><h2>Laws</h2><span>'+(cl.total>cl.list.length ? cl.list.length+' of '+cl.total+' · top matches' : cl.total+' found')+'</span></div>';
        cl.list.forEach((m)=>{ html += lawCardHTML(m.card, LCARDS.indexOf(m.card), hl); });
      }
    }
    controlsWrap.style.opacity = '0.4';
    controlsWrap.style.pointerEvents = 'none';
    grid.innerHTML = html;
    countPill.textContent = total + (total===1 ? ' result' : ' results');
  }

  function renderLawCards(){
    let html = '';
    let count = 0;
    const chaptersData = LAWS.filter(d=>d.cls===state.cls && d.subject===state.subject &&
      (state.chapter==="all" || d.chapter===state.chapter));

    if(chaptersData.length === 0){
      html = '<div class="deriv-note">No curated named laws for this selection yet — many chapters (like most of Organic Chemistry, or Application of Derivatives in Math) are built on techniques and formulas rather than a single named law. Try Physics or Chemistry, Class 11 or 12, for the fullest coverage.</div>';
    } else {
      chaptersData.forEach(ch=>{
        html += '<div class="chapter-heading"><h2>'+ch.chapter+'</h2><span>'+ch.laws.length+' law'+(ch.laws.length===1?'':'s')+'</span></div>';
        ch.laws.forEach(l=>{
          const idx = LCARDS.findIndex(c=>c.cls===ch.cls && c.subject===ch.subject && c.chapter===ch.chapter && c.t===l.t);
          html += lawCardHTML(LCARDS[idx], idx);
          count++;
        });
      });
    }
    controlsWrap.style.opacity = '1';
    controlsWrap.style.pointerEvents = 'auto';
    grid.innerHTML = html;
    countPill.textContent = count + (count===1 ? ' law' : ' laws');
  }

  function renderDerivationCards(){
    let html = '';
    let count = 0;
    const chaptersData = DERIVATIONS.filter(d=>d.cls===state.cls && d.subject===state.subject &&
      (state.chapter==="all" || d.chapter===state.chapter));

    if(chaptersData.length === 0){
      html = '<div class="deriv-note">No curated derivations for this selection yet — this app prioritises CBSE-board and JEE-critical derivations rather than covering every formula, since many (like Ohm\'s Law or F=ma) are definitions or postulates rather than derived results. Try Class 12 for more coverage, or switch back to Formulas.</div>';
    } else {
      chaptersData.forEach(ch=>{
        html += '<div class="chapter-heading"><h2>'+ch.chapter+'</h2><span>'+ch.derivations.length+' derivation'+(ch.derivations.length===1?'':'s')+'</span></div>';
        ch.derivations.forEach(d=>{
          const idx = DCARDS.findIndex(c=>c.cls===ch.cls && c.subject===ch.subject && c.chapter===ch.chapter && c.t===d.t);
          html += derivCardHTML(DCARDS[idx], idx);
          count++;
        });
      });
    }
    controlsWrap.style.opacity = '1';
    controlsWrap.style.pointerEvents = 'auto';
    grid.innerHTML = html;
    countPill.textContent = count + (count===1 ? ' derivation' : ' derivations');
  }

  const renderHooks = [];
  function renderAll(){
    renderChips();
    renderCards();
    renderHooks.forEach(function(cb){ try{ cb(); }catch(e){} });
  }

  /* ---------- events ---------- */
  document.getElementById('modeSeg').addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    document.querySelectorAll('#modeSeg button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.mode = btn.dataset.mode;
    state.chapter = 'all';
    state.query = '';
    searchInput.value = '';
    clearBtn.classList.remove('show');
    searchInput.placeholder = 'Search everything — formulas, derivations & laws (typo-friendly)…';
    renderAll();
  });

  document.getElementById('classSeg').addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    document.querySelectorAll('#classSeg button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.cls = btn.dataset.class;
    state.chapter = 'all';
    renderAll();
  });

  document.getElementById('subjectSeg').addEventListener('click', e=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    document.querySelectorAll('#subjectSeg button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state.subject = btn.dataset.subject;
    state.chapter = 'all';
    renderAll();
  });

  chapterChips.addEventListener('click', e=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    state.chapter = btn.dataset.chapter;
    renderChips();
    renderCards();
  });

  grid.addEventListener('click', e=>{
    if(e.target.closest('.card-btn')) return;
    const dhead = e.target.closest('.deriv-head');
    if(dhead){
      const accordion = dhead.closest('.deriv-card, .law-card');
      if(accordion) accordion.classList.toggle('open');
      return;
    }
    const card = e.target.closest('.card-outer');
    if(!card) return;
    card.classList.toggle('flipped');
  });
  grid.addEventListener('keydown', e=>{
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const dhead = e.target.closest('.deriv-head');
    if(dhead){
      e.preventDefault();
      const accordion = dhead.closest('.deriv-card, .law-card');
      if(accordion) accordion.classList.toggle('open');
      return;
    }
    const card = e.target.closest('.card-outer');
    if(!card) return;
    e.preventDefault();
    card.classList.toggle('flipped');
  });

  searchInput.addEventListener('input', e=>{
    state.query = e.target.value;
    clearBtn.classList.toggle('show', state.query.length > 0);
    clearTimeout(_searchTimer);
    if(SEARCH.tokens(state.query).length===0){
      renderCards();
      return;
    }
    _searchTimer = setTimeout(renderCards, 140);
  });
  clearBtn.addEventListener('click', ()=>{
    searchInput.value = '';
    state.query = '';
    clearBtn.classList.remove('show');
    searchInput.focus();
    renderCards();
  });

  window.FV = {
    state: state, CARDS: CARDS, DCARDS: DCARDS, LCARDS: LCARDS,
    DATA: DATA, DERIVATIONS: DERIVATIONS, LAWS: LAWS,
    ACCENT: ACCENT, SUBJECT_LABEL: SUBJECT_LABEL,
    renderAll: renderAll,
    onRender: function(cb){ renderHooks.push(cb); },
    strip: function(s){ return String(s).replace(/<[^>]*>/g,''); }
  };
  renderAll();
})();
