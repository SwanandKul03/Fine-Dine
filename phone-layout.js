(() => {
 const mobile=matchMedia('(max-width:760px)'),stage=document.querySelector('.prototype-depth-stage'),panel=document.querySelector('#prototype-panel'),device=document.querySelector('#prototype-device'),viewport=document.querySelector('.prototype-screen-viewport'),gallery=document.querySelector('#gallery-screen-panel');
 if(!viewport)return;
 const frame=viewport.querySelector('iframe'),comparison=document.querySelector('#comparison-viewer'),studies=[...document.querySelectorAll('#insights .screen-explainer')],contexts=[...document.querySelectorAll('.screen-context')];
 studies.forEach(card=>{const buttons=[...card.querySelectorAll('.screen-callout')],select=document.createElement('select');select.className='screen-callout-select';select.setAttribute('aria-label','Highlight an area of the screen');buttons.forEach(b=>select.add(new Option(b.textContent.trim(),b.dataset.callout)));select.value=card.querySelector('.screen-callout[aria-pressed="true"]').dataset.callout;select.addEventListener('change',()=>buttons.find(b=>b.dataset.callout===select.value)?.click());card.querySelector('.screen-callouts').before(select);});
 const syncContexts=()=>contexts.forEach(d=>d.open=!mobile.matches);syncContexts();mobile.addEventListener('change',syncContexts);
 let pending=0;
 function fit(){
  pending=0;
  if(mobile.matches&&stage&&panel&&device){
   const s=getComputedStyle(stage),d=getComputedStyle(device),availableWidth=stage.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),availableHeight=stage.clientHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom),chromeX=parseFloat(d.paddingLeft)+parseFloat(d.paddingRight)+parseFloat(d.borderLeftWidth)+parseFloat(d.borderRightWidth),chromeY=parseFloat(d.paddingTop)+parseFloat(d.paddingBottom)+parseFloat(d.borderTopWidth)+parseFloat(d.borderBottomWidth);
   stage.style.setProperty('--live-phone-width',Math.min(340,availableWidth,Math.max(1,availableHeight-chromeY)*402/874+chromeX)+'px');
  }else stage?.style.removeProperty('--live-phone-width');
  frame.style.setProperty('--prototype-fit',String(viewport.clientWidth/402));
  if(gallery&&mobile.matches)gallery.style.setProperty('--gallery-phone-width',Math.min(286,gallery.clientWidth,Math.max(1,gallery.clientHeight-12)*1020/2208+12)+'px');
  else gallery?.style.removeProperty('--gallery-phone-width');
  if(mobile.matches){
   if(comparison){const c=comparison.querySelector('.comparison-copy'),gap=parseFloat(getComputedStyle(comparison).rowGap)||20,h=comparison.clientHeight-c.offsetHeight-gap;comparison.style.setProperty('--compare-phone-width',Math.min(286,comparison.clientWidth,Math.max(1,h)*360/760)+'px');}
   studies.forEach(card=>{const context=card.querySelector('.screen-context');if(context.open){card.style.removeProperty('--study-phone-width');return;}const cs=getComputedStyle(card),copy=card.querySelector('.screen-explainer-copy'),h=card.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-copy.offsetHeight-(parseFloat(cs.rowGap)||28),w=card.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);card.style.setProperty('--study-phone-width',Math.min(286,w,Math.max(1,h-12)*1020/2208+12)+'px');});
  }else {comparison?.style.removeProperty('--compare-phone-width');studies.forEach(c=>c.style.removeProperty('--study-phone-width'));}

 }
 function queue(){if(!pending)pending=requestAnimationFrame(fit);}
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),primary=document.querySelector('.prototype-primary-view'),options=document.querySelector('.screen-gallery-options');
 const align=el=>{if(mobile.matches&&el)requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:reduce.matches?'auto':'smooth'}));};
 document.querySelector('.comparison-picker')?.addEventListener('click',()=>align(comparison));
 document.querySelector('.comparison-mode-controls')?.addEventListener('click',()=>align(comparison));
 document.querySelector('.evolution-disclosure')?.addEventListener('toggle',e=>{if(e.currentTarget.open){queue();align(comparison);}});
 contexts.forEach(d=>d.addEventListener('toggle',queue));
 options?.addEventListener('click',()=>align(gallery.closest('.export-screen-gallery')));
 options?.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key))align(gallery.closest('.export-screen-gallery'));});
 let seenView=false;
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='oblix:view')return;if(!seenView){seenView=true;return;}if(mobile.matches){const b=primary.getBoundingClientRect();if(b.top<0||b.bottom>innerHeight)align(primary);}});
 const resize=new ResizeObserver(queue);[stage,viewport,gallery,comparison,comparison?.querySelector('.comparison-copy'),...studies,...studies.map(c=>c.querySelector('.screen-explainer-copy'))].filter(Boolean).forEach(el=>resize.observe(el));mobile.addEventListener('change',queue);addEventListener('resize',queue);document.fonts?.ready.then(queue);fit();
})();
