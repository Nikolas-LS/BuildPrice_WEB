// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Rolagem suave para âncoras
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
      if(nav.classList.contains('open')){
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    }
  });
});

// Menu mobile (hambúrguer no canto superior direito)
(function(){
  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  if(btn && nav){
    btn.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
})();

// Efeito 3D tilt com mouse e giroscópio (suavizado)
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

  // Suporte a giroscópio
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