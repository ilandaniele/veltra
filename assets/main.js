// Veltra landing - interactions
// Set FORM_ID below to your Formspree ID; until then the form falls back to mailto.

(function(){
  var prefersReduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover=window.matchMedia('(hover:hover)').matches;

  /* decorative icons: hide from screen readers */
  document.querySelectorAll('svg').forEach(function(s){s.setAttribute('aria-hidden','true');s.setAttribute('focusable','false');});

  /* progress hairline + nav bg */
  var prog=document.getElementById('prog'),nav=document.getElementById('nav');
  window.addEventListener('scroll',function(){
    var h=document.documentElement,sc=h.scrollTop/(h.scrollHeight-h.clientHeight);
    prog.style.width=(sc*100)+'%';
    nav.classList.toggle('scrolled',h.scrollTop>12);
  },{passive:true});

  /* mobile menu */
  (function(){
    var btn=document.getElementById('menubtn'),mnav=document.getElementById('mnav');
    function setOpen(open){
      document.body.classList.toggle('menu-open',open);
      btn.setAttribute('aria-expanded',open?'true':'false');
      btn.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
      mnav.setAttribute('aria-hidden',open?'false':'true');
    }
    btn.addEventListener('click',function(){setOpen(!document.body.classList.contains('menu-open'));});
    mnav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setOpen(false);});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false);});
  })();

  /* ticker duplicate for seamless loop */
  (function(){var t=document.getElementById('track');if(t){t.innerHTML+=t.innerHTML;}})();

  /* contact form — Formspree AJAX + honeypot (mailto fallback until FORM_ID is set) */
  (function(){
    var FORM_ID='YOUR_FORMSPREE_ID';
    var f=document.getElementById('contact-form'),done=document.getElementById('contact-done'),btn=document.getElementById('cf-submit');
    if(!f)return;
    var lbl=btn.querySelector('span'),lbl0=lbl?lbl.textContent:'';
    function restore(){btn.disabled=false;btn.style.opacity='';if(lbl)lbl.textContent=lbl0;}
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(FORM_ID.indexOf('YOUR_')===0){
        var fd=new FormData(f);
        var body='Nombre: '+fd.get('nombre')+'\nEmpresa: '+fd.get('empresa')+'\nCargo: '+fd.get('cargo')+'\nEmail: '+fd.get('email')+'\n\nCómo entran hoy los avisos:\n'+fd.get('proceso');
        var to=['veltra','soporte'].join('.')+'@'+['gmail','com'].join('.');
        location.href='mailto:'+to+'?subject='+encodeURIComponent('Quiero mi empleado digital — '+fd.get('empresa'))+'&body='+encodeURIComponent(body);
        return;
      }
      btn.disabled=true;btn.style.opacity='0.6';if(lbl)lbl.textContent='Enviando…';
      fetch('https://formspree.io/f/'+FORM_ID,{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'}})
      .then(function(r){
        if(r.ok){f.style.display='none';done.style.display='block';}
        else{return r.json().then(function(d){var msg=d.errors?d.errors.map(function(x){return x.message;}).join(', '):'Error al enviar. Intentá de nuevo.';alert(msg);restore();});}
      }).catch(function(){alert('Error de red. Verificá tu conexión e intentá de nuevo.');restore();});
    });
  })();

  /* hero entrance. The double-rAF runs the transition on the first real paint, which is
     what we want in a focused tab. rAF is paused while a tab is backgrounded, so the
     setTimeout is a safety net for the case where rAF never resumes (prerender, bfcache
     restore, aggressive mobile throttling) — without it the hero would stay at opacity 0.
     1200ms is long enough that rAF always wins in a normal load, so the animation is
     never pre-empted. Both paths are idempotent. */
  (function(){
    function showHero(){document.querySelectorAll('.hero-anim').forEach(function(el){el.classList.add('in');});}
    requestAnimationFrame(function(){requestAnimationFrame(showHero);});
    setTimeout(showHero,1200);
  })();

  /* hero panel loop: rows land one by one, each flips procesando… -> procesado ✓ */
  (function(){
    var panel=document.getElementById('legajo');
    if(!panel)return;
    var rows=['li1','li2','li3','li4','li5'].map(function(id){return document.getElementById(id);}).filter(Boolean);
    if(!rows.length)return;
    var timers=[];
    function later(fn,ms){timers.push(setTimeout(fn,ms));}
    function st(row){return row.querySelector('.pc-status');}
    function settle(row){var s=st(row);s.textContent=s.getAttribute('data-done');s.classList.add('done');}
    function reset(row){var s=st(row);s.textContent='procesando…';s.classList.remove('done');row.classList.remove('show');}
    if(prefersReduce){rows.forEach(function(r){r.classList.add('show');settle(r);});return;}
    function run(){
      timers.forEach(clearTimeout);timers=[];
      rows.forEach(reset);
      var t=420;
      rows.forEach(function(r){
        later(function(){r.classList.add('show');},t);
        later(function(){settle(r);},t+620);
        t+=340;
      });
      later(run,t+6000); /* hold the finished state, then replay */
    }
    var legIO=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){run();legIO.unobserve(e.target);}
    });},{threshold:0,rootMargin:'99999px 0px -10% 0px'});
    legIO.observe(panel);
  })();

  /* stagger children of grids */
  if(!prefersReduce){
    document.querySelectorAll('.statgrid,.pain-list,.grid-4,.grid-3,.timeline').forEach(function(g){
      Array.prototype.slice.call(g.children).forEach(function(c,i){
        if(c.classList.contains('reveal'))c.style.transitionDelay=(i*0.09)+'s';
      });
    });
  }

  /* count-up */
  function animateCount(el){
    if(el.dataset.done)return;el.dataset.done='1';
    var target=parseFloat(el.dataset.count),pre=el.dataset.prefix||'',suf=el.dataset.suffix||'';
    if(prefersReduce){el.textContent=pre+target+suf;return;}
    var dur=1300,t0=null;
    function step(ts){if(!t0)t0=ts;var p=Math.min((ts-t0)/dur,1);var e=1-Math.pow(1-p,3);
      el.textContent=pre+Math.round(target*e)+suf;if(p<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  }

  /* reveal observer — huge top rootMargin so content jumped past (anchor links,
     fast scroll) reveals instantly instead of staying hidden above the viewport */
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(animateCount);
    io.unobserve(e.target);
  }});},{threshold:0,rootMargin:'99999px 0px -8% 0px'});
  document.querySelectorAll('.reveal,.panel').forEach(function(el){io.observe(el);});

  /* scroll-spy */
  (function(){
    var links=Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var entries=links.map(function(a){var id=a.getAttribute('href').slice(1);var s=document.getElementById(id);return s?{a:a,s:s}:null;}).filter(Boolean);
    if(!entries.length)return;
    function spy(){
      var pos=window.scrollY+160,cur=null;
      entries.forEach(function(e){if(e.s.offsetTop<=pos)cur=e;});
      links.forEach(function(a){a.classList.remove('active');});
      if(cur&&window.scrollY>40)cur.a.classList.add('active');
    }
    window.addEventListener('scroll',spy,{passive:true});
    spy();
  })();

  /* hero grid spotlight — a stronger copy of the grid revealed under the pointer.
     Only the mask position changes, so this stays on the compositor; the rAF gate
     keeps it to one style write per frame no matter how fast the mouse moves. */
  if(!prefersReduce&&canHover){
    var hero=document.querySelector('.hero');
    if(hero){
      var px=0,py=0,pending=false;
      function paint(){pending=false;hero.style.setProperty('--mx',px+'px');hero.style.setProperty('--my',py+'px');}
      hero.addEventListener('mousemove',function(e){
        var r=hero.getBoundingClientRect();
        px=e.clientX-r.left;py=e.clientY-r.top;
        if(!pending){pending=true;requestAnimationFrame(paint);}
      });
      hero.addEventListener('mouseenter',function(){hero.classList.add('lit');});
      hero.addEventListener('mouseleave',function(){hero.classList.remove('lit');});
    }
  }

  /* simulation */
  var seq=['b1','b2','b3','f1','f2','f3','f4','n1','n2','n3'],timers=[];
  function runSim(){
    timers.forEach(clearTimeout);timers=[];
    seq.forEach(function(id){var el=document.getElementById(id);if(el)el.classList.remove('show');});
    var d=350;
    seq.forEach(function(id,i){
      var extra=(id==='n1')?600:(id==='n2'||id==='n3')?750:0;
      d+=(i<3?520:380)+extra;
      timers.push(setTimeout(function(){var el=document.getElementById(id);if(el)el.classList.add('show');},d));
    });
  }
  if(prefersReduce){seq.forEach(function(id){var el=document.getElementById(id);if(el)el.classList.add('show');});}
  else{
    var simIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runSim();simIO.unobserve(e.target);}});},{threshold:0,rootMargin:'99999px 0px -12% 0px'});
    var simEl=document.getElementById('sim');if(simEl)simIO.observe(simEl);
    var rpl=document.getElementById('replay');if(rpl)rpl.addEventListener('click',runSim);
  }
})();
