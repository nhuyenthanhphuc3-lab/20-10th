// SELECTORS
const heart = document.getElementById('openHeart');
const envelope = document.getElementById('envelope');
const letterInner = document.getElementById('letterInner');
const fan = document.getElementById('fan');
const fanImgs = Array.from(document.querySelectorAll('.fan-img'));
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalClose = document.getElementById('modalClose');
const floatingLayer = document.getElementById('floatingLayer');

// lazy-load images from data-src
document.querySelectorAll('img[data-src]').forEach(img=>{
  img.src = img.dataset.src;
  img.removeAttribute('data-src');
  img.style.opacity = 0;
  img.onload = ()=>{ img.style.transition = 'opacity .6s ease, transform .6s ease'; img.style.opacity = 1; }
});

// animate letter lines one-by-one (type/fade-in)
function revealLetterLines() {
  const nodes = Array.from(letterInner.children);
  nodes.forEach((n,i)=>{
    n.style.opacity = 0;
    n.style.transform = 'translateY(12px)';
    n.style.transition = `all .6s cubic-bezier(.2,.9,.2,1) ${(i+1)*120}ms`;
    requestAnimationFrame(()=> {
      n.style.opacity = 1;
      n.style.transform = 'translateY(0)';
    });
  });
}
// initial reveal (but keep letter scrollable)
setTimeout(revealLetterLines, 300);

// heart click: open/close envelope + spread fan
heart.addEventListener('click', (e)=>{
  // envelope subtle tilt animation
  envelope.classList.toggle('open');
  if (fan.classList.contains('open')){
    fan.classList.remove('open');
  } else {
    fan.classList.add('open');
    // trigger tiny delay reveal for fan items
    fanImgs.forEach((el, idx)=> {
      el.style.transitionDelay = `${idx*40}ms`;
    });
  }
});

// Apply "open" visual change (scale) to envelope
const styleTag = document.createElement('style');
styleTag.innerHTML = `
.envelope.open { transform: translateY(-6px) scale(1.02); filter:drop-shadow(0 30px 60px rgba(0,0,0,0.5)); transition:transform .5s cubic-bezier(.2,.9,.2,1);}
.envelope.open .letter-inner { transform: translateY(0); opacity:1; }
`;
document.head.appendChild(styleTag);

// Fan image click: zoom to center, upright
fanImgs.forEach(img=>{
  img.addEventListener('click', (ev)=>{
    const src = img.src || img.currentSrc;
    openModalWithImage(src);
  });
});

// modal open/close
function openModalWithImage(src){
  modalImg.src = src;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  // slight pop animation
  requestAnimationFrame(()=> modalImg.style.transform = 'translateY(0) scale(1)');
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click',(e)=> { if(e.target === modal) closeModal();});
function closeModal(){
  modalImg.style.transform = 'translateY(12px) scale(.98)';
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  modalImg.src = '';
}

// floating hearts & "Anh yêu em" random floating
const floatTexts = ['Anh yêu em','💖','Anh yêu em','❤','Anh iu'];
function spawnFloat(){
  const el = document.createElement('div');
  el.className = 'float-item';
  el.innerText = floatTexts[Math.floor(Math.random()*floatTexts.length)];
  const startX = Math.random()*90; // vw
  const size = 10 + Math.random()*14;
  el.style.left = startX + 'vw';
  el.style.bottom = '-6vh';
  el.style.fontSize = `${size}px`;
  el.style.opacity = 0.95;
  floatingLayer.appendChild(el);

  const duration = 3500 + Math.random()*3000;
  el.animate([
    { transform: `translateY(0) scale(1)`, opacity:1 },
    { transform: `translateY(-110vh) translateX(${(Math.random()*40-20)}vw) scale(1.1)`, opacity:0.05 }
  ], { duration: duration, easing: 'cubic-bezier(.2,.9,.2,1)'});

  setTimeout(()=> el.remove(), duration+80);
}
setInterval(spawnFloat, 700);

// ensure letter scrollable on mobile and not covered by heart
const letter = document.querySelector('.letter');
letter.style.paddingTop = '6px'; // ensure content not hidden under heart
letter.addEventListener('touchstart', (e)=> e.stopPropagation(), {passive:true});

// Prevent envelope / fan from overlapping headline: adjust top spacing if opened
const header = document.querySelector('.topbar');
const adjustLayout = ()=>{
  const open = envelope.classList.contains('open');
  if (open) {
    header.style.marginTop = '4vh';
  } else {
    header.style.marginTop = '6vh';
  }
};
new MutationObserver(adjustLayout).observe(envelope, {attributes:true, attributeFilter:['class']});

// Accessibility: keyboard open/close (Enter on heart)
heart.addEventListener('keydown',(e)=>{ if(e.key==='Enter') heart.click();});
heart.tabIndex = 0;

// small tuned UX: disable background scroll when modal open
const body = document.body;
const observer = new MutationObserver(()=> {
  if (modal.classList.contains('open')) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
});
observer.observe(modal, {attributes:true, attributeFilter:['class']});

// ARIA labels for dynamic items (improve with screen reader)
fanImgs.forEach((el, i)=> el.setAttribute('aria-label', `Ảnh ${i+1}`));

/* Optional: keyboard ESC to close modal */
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape' && modal.classList.contains('open')) closeModal(); });
