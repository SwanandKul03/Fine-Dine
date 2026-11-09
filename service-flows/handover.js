(() => {
 'use strict';
 const root=document.getElementById('floor-story'),stage=document.getElementById('floor-stage');
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)],reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let mode='without',step=0,playing=false,timer=null;
 const states={
  without:[
   {speaker:'chef',dialogue:'Table 1’s starters are ready. Can someone collect?',state:'Food is ready',owner:'No collector confirmed',location:'Kitchen pass'},
   {speaker:'chef',dialogue:'Who is free to take Table 1’s starters?',state:'No named collector',owner:'The chef is finding someone',location:'Waiting at the pass'},
   {speaker:'waiter',dialogue:'I’m bringing Table 1’s starters over.',state:'On the way to Table 1',owner:'Collected after the wait',location:'Table 1'}
  ],
  with:[
   {speaker:'chef',dialogue:'Table 1 is ready. The floor can see the pickup.',state:'Ready for collection',owner:'Visible to the floor team',location:'Kitchen pass'},
   {speaker:'waiter',dialogue:'I’m collecting Table 1’s starters.',state:'Arjun is collecting',owner:'A named owner for this pickup',location:'Collection aisle'},
   {speaker:'waiter',dialogue:'I’m bringing your starters over.',state:'On the way to Table 1',owner:'Arjun · Collection assigned',location:'Table 1'}
  ]
 };
 function updatePlay(){const b=q('#play-story');b.setAttribute('aria-pressed',String(playing));b.setAttribute('aria-label',playing?'Pause the handover':'Play the handover');q('#play-story>span').textContent=playing?'Pause':'Play';}
 function stop(pauseMotion=true){clearTimeout(timer);timer=null;playing=false;if(pauseMotion)stage.pauseMotion?.();updatePlay();}
 function schedule(){clearTimeout(timer);if(playing)timer=setTimeout(()=>{if(step<2){step++;render();}else stop(false);},7200);}
 function render(){
  const d=states[mode][step];root.dataset.mode=mode;root.dataset.step=String(step);q('.handover-track').style.setProperty('--ticket-step',String(step));
  q('#handover-state').textContent=d.state;q('#handover-owner').textContent=d.owner;q('.handover-ticket').dataset.gap=String(mode==='without'&&step<2);
  q('.focused-location').textContent=d.location;q('#collection-label').textContent=mode==='with'?'Named pickup':'Find a collector';
  qa('[data-workflow]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.workflow===mode)));
  qa('[data-step]').forEach(b=>{if(Number(b.dataset.step)===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  stage.setHandover({step,workflow:mode,speaker:d.speaker,dialogue:d.dialogue});updatePlay();schedule();reportHeight();
 }
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.workflow){stop(false);mode=b.dataset.workflow;render();}else if(b.dataset.step!==undefined){stop(false);step=Number(b.dataset.step);render();}});
 q('#play-story').addEventListener('click',()=>{if(playing){stop();return;}playing=true;if(stage.dataset.actionState==='paused'){stage.resumeMotion?.();schedule();}else{if(step===2)step=0;render();}updatePlay();});
 q('.handover-chapters').addEventListener('keydown',e=>{const b=e.target.closest('[data-step]');if(!b)return;let next;const i=Number(b.dataset.step);if(e.key==='ArrowRight'||e.key==='ArrowDown')next=Math.min(2,i+1);if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=Math.max(0,i-1);if(e.key==='Home')next=0;if(e.key==='End')next=2;if(next!==undefined){e.preventDefault();stop(false);step=next;render();q(`[data-step="${next}"]`).focus({preventScroll:true});}});
 stage.addEventListener('handover:beat',e=>{
  if(e.detail.beat==='served'&&step===2){q('#handover-state').textContent=mode==='with'?'Handover complete':'Food reaches the table';q('#handover-owner').textContent=mode==='with'?'Arjun · Served and checked':'A late pickup can mean reheating';stage.setDialogue(mode==='with'?'Thank you. We’re ready for our starters.':'These have cooled. Could you warm them up?','guest');}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='oblix:flow-visibility')return;if(!e.data.visible)stop();});
 reduce.addEventListener('change',()=>{if(reduce.matches)stop(false);render();});
 let sizing=0;function reportHeight(){if(sizing)return;sizing=requestAnimationFrame(()=>{sizing=0;parent.postMessage({type:'oblix:flow-height',height:Math.ceil(root.getBoundingClientRect().height)},location.origin);});}
 new ResizeObserver(reportHeight).observe(root);addEventListener('load',reportHeight);render();
})();
