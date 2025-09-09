

// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================
   Rolagem suave para âncoras
========================= */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id=a.getAttribute('href');
    if(id.length>1){
      e.preventDefault();
      const el=document.querySelector(id);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      // fecha o menu mobile ao clicar
      const nav = document.getElementById('main-nav');
      const btn = document.querySelector('.menu-toggle');
      if(nav && btn && nav.classList.contains('open')){
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    }
  });
});

/* =========================
   Menu mobile (hambúrguer)
========================= */
(function(){
  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  if(btn && nav){
    btn.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    window.addEventListener('resize', ()=>{
      if(window.innerWidth > 960){
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    });
  }
})();

/* =========================
   Tilt 3D do mock do celular
========================= */
(function(){
  const phone = document.getElementById('phone');
  if(!phone) return;
  let bounds=null, raf=null;
  function setTilt(xPerc, yPerc){
    const rotX = (yPerc - .5) * 12;
    const rotY = (xPerc - .5) * 16;
    phone.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
  }
  function onMove(e){
    if(!bounds) bounds = phone.getBoundingClientRect();
    const x = (e.clientX - bounds.left) / bounds.width;
    const y = (e.clientY - bounds.top) / bounds.height;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=> setTilt(x, y));
  }
  function onLeave(){
    cancelAnimationFrame(raf);
    phone.style.transform = 'rotateX(6deg) rotateY(-9deg) translateZ(0)';
  }
  phone.addEventListener('mousemove', onMove);
  phone.addEventListener('mouseleave', onLeave);

  // Giroscópio (iOS precisa permissão por gesto)
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.body.addEventListener('click', async function once() {
      try{ await DeviceOrientationEvent.requestPermission(); }catch(_e){}
      document.body.removeEventListener('click', once);
    });
  }
  window.addEventListener('deviceorientation', (e)=>{
    if(!e.gamma && !e.beta) return;
    const x = Math.min(Math.max((e.gamma + 45) / 90, 0), 1);
    const y = Math.min(Math.max((e.beta  +  30) /  60, 0), 1);
    setTilt(x,y);
  }, {passive:true});
})();

/* =========================
   Scroll Reveal com Observer
========================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  // Alvos principais (sem mexer no HTML)
  const groups = [
    // itens com "stagger" por seção
    { sel: '.hero-copy > *', stagger: 70 },
    { sel: '.badge-list li', stagger: 60 },
    { sel: '.grid-3 .card', stagger: 80 },
    { sel: '.grid-6 .card', stagger: 80 },
    { sel: '.steps .step',  stagger: 80 },
    { sel: '.section-head', stagger: 0 },
    { sel: '.callout.card', stagger: 0 },
  ];

  // Marca todos como "reveal" + aplica delays incrementais
  groups.forEach(g=>{
    const nodes = document.querySelectorAll(g.sel);
    nodes.forEach((el, i)=>{
      el.classList.add('reveal');
      if(g.stagger){
        el.style.setProperty('--reveal-delay', `${i * g.stagger}ms`);
      }
    });
  });

  // Observer que ativa a revelação quando entra na viewport
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        // opcional: desobservar para não ficar togglando
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* =========================
   Ripple em botões (pointer)
========================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  function addRipple(e){
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.left = x + 'px';
    span.style.top  = y + 'px';
    btn.appendChild(span);
    // remove ao terminar a animação
    span.addEventListener('animationend', ()=> span.remove());
  }
  document.querySelectorAll('.btn, .nav-link').forEach(el=>{
    el.addEventListener('pointerdown', addRipple, { passive: true });
  });
})();

/* =========================
   Parallax MUITO sutil no mock
========================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  const wrap = document.querySelector('.phone-wrap');
  if(!wrap) return;

  let ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      const rect = wrap.getBoundingClientRect();
      // valor pequeno para não distrair (entre -6px e 6px aprox.)
      const viewportH = window.innerHeight || 1;
      const progress = (rect.top + rect.height/2) / viewportH; // 0..1
      const offset = (progress - 0.5) * -12; // -6..6
      wrap.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* =========================
   Touch "lift" em cards (mobile)
========================= */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pressables = document.querySelectorAll('.card, .step.card, .callout.card');
  if(!pressables.length) return;

  // aplica classe no toque (touch) e remove ao soltar
  pressables.forEach(el=>{
    el.addEventListener('pointerdown', (e)=>{
      if(reduce) return;
      // prioriza comportamento em telas sem hover (mobile) ou quando o pointer é touch
      if (e.pointerType === 'touch' || window.matchMedia('(hover: none)').matches) {
        el.classList.add('is-pressed');
      }
    }, { passive: true });

    const clear = ()=> el.classList.remove('is-pressed');
    el.addEventListener('pointerup', clear, { passive: true });
    el.addEventListener('pointercancel', clear, { passive: true });
    el.addEventListener('pointerleave', clear, { passive: true });
  });
})();
