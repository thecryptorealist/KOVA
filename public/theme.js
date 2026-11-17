// The site uses a single black theme.
document.documentElement.dataset.theme='dark';
document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#030303');

// Brief brand introduction; independent of API/database availability.
(()=>{
 const started=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let closing=false;
 const close=()=>{if(closing)return;closing=true;setTimeout(()=>{const intro=document.querySelector('#brand-intro');if(!intro)return;intro.classList.add('intro-leaving');setTimeout(()=>intro.remove(),reduced?0:500);},Math.max(0,(reduced?0:3400)-(performance.now()-started)));};
 document.addEventListener('DOMContentLoaded',()=>{
  const intro=document.querySelector('#brand-intro');if(!intro)return;
  const image=intro.querySelector('img');if(image.complete)close();else{image.addEventListener('load',close,{once:true});image.addEventListener('error',close,{once:true});}
  setTimeout(close,1800);
 });
})();
