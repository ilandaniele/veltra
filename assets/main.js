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
        var body='Nombre: '+fd.get('nombre')+'\nEmpresa: '+fd.get('empresa')+'\nIndustria: '+fd.get('industria')+'\nEmail: '+fd.get('email')+'\n\nProceso a automatizar:\n'+fd.get('proceso');
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

  /* hero entrance */
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    document.querySelectorAll('.hero-anim').forEach(function(el){el.classList.add('in');});
  });});

  /* hero legajo loop: intake items -> typed fields -> stamp -> status */
  (function(){
    var items=['li1','li2','li3'].map(function(id){return document.getElementById(id);});
    var fields=['lf1','lf2','lf3','lf4'].map(function(id){return document.getElementById(id);});
    var stamp=document.getElementById('stamp');
    var status=document.getElementById('legstatus'),statusTxt=document.getElementById('legstatustxt');
    if(!stamp||!status)return;
    var timers=[];
    function later(fn,ms){timers.push(setTimeout(fn,ms));}
    function typeVal(el){
      var v=el.querySelector('.v'),text=v.getAttribute('data-text'),i=0;
      el.classList.add('show');
      v.innerHTML='<span class="caret"></span>';
      (function tick(){
        if(i<text.length){
          i++;v.innerHTML=text.slice(0,i).replace(/</g,'&lt;')+'<span class="caret"></span>';
          timers.push(setTimeout(tick,34));
        }else{v.textContent=text;}
      })();
    }
    function setStatus(t,done){statusTxt.textContent=t;status.classList.toggle('done',!!done);}
    function finalState(){
      items.forEach(function(el){el.classList.add('show');});
      fields.forEach(function(el){el.classList.add('show');var v=el.querySelector('.v');v.textContent=v.getAttribute('data-text');});
      stamp.classList.add('show');setStatus('Cargado en core',true);
    }
    if(prefersReduce){finalState();return;}
    function run(){
      timers.forEach(clearTimeout);timers=[];
      items.forEach(function(el){el.classList.remove('show');});
      fields.forEach(function(el){el.classList.remove('show');el.querySelector('.v').textContent='';});
      stamp.classList.remove('show');setStatus('Recibiendo',false);
      var t=500;
      items.forEach(function(el){later(function(){el.classList.add('show');},t);t+=480;});
      later(function(){setStatus('Extrayendo',false);},t);
      fields.forEach(function(el){
        later(function(){typeVal(el);},t);
        t+=el.querySelector('.v').getAttribute('data-text').length*34+320;
      });
      later(function(){setStatus('Validando',false);},t);t+=700;
      later(function(){stamp.classList.add('show');setStatus('Cargado en core',true);},t);
      later(run,t+5200);
    }
    var legIO=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){run();legIO.unobserve(e.target);}
    });},{threshold:0,rootMargin:'99999px 0px -10% 0px'});
    legIO.observe(document.getElementById('legajo'));
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

  /* cursor spotlight — desktop pointer only */
  if(!prefersReduce&&canHover){
    var spot=document.createElement('div');spot.className='spotlight';document.body.appendChild(spot);
    var sx=-1000,sy=-1000,tx=sx,ty=sy,raf=null;
    function trail(){sx+=(tx-sx)*.12;sy+=(ty-sy)*.12;spot.style.left=sx+'px';spot.style.top=sy+'px';
      if(Math.abs(tx-sx)>.5||Math.abs(ty-sy)>.5){raf=requestAnimationFrame(trail);}else{raf=null;}}
    window.addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;if(!raf)raf=requestAnimationFrame(trail);});
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
