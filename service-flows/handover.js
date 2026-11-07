(() => {
 'use strict';
 const root=document.querySelector('#floor-story'),q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let mode='without',moment=0,actor='waiter',playing=false,timer=null;
 const chapters=['Order','First drinks','Starters','Mains','Final handover'];
 // Short scene dialogue; the original supplied timing figures stay in the timeline.
 const stories={
  without:[
   {time:'10',lead:'waiter',dialogue:{waiter:'I’ll write this down, then enter it at the system.',chef:'Has Table 1’s order come through yet?',manager:'Has anyone sent Table 1’s order?',guest:'We’ve ordered. Could you check our drinks?'}},
   {time:'27',lead:'manager',dialogue:{waiter:'Let me check whether I sent that ticket.',chef:'I’m preparing the food. Can the floor team check the drinks?',manager:'Who took Table 1’s drinks order?',guest:'Our drinks still haven’t arrived. Could you check?'}},
   {time:'27–30',lead:'chef',dialogue:{waiter:'I’m leaving my section to collect Table 1’s food.',chef:'Table 1’s starters are ready. Who can collect?',manager:'Who can cover the section while the food is collected?',guest:'Could someone check on our starters?'}},
   {time:'37–40',lead:'waiter',dialogue:{waiter:'Have you finished your starters? Shall I bring the mains?',chef:'I’ll time the mains for when the table is ready.',manager:'Check the guests are ready before the next course.',guest:'We’re ready for our main course now.'}},
   {time:'80–90',lead:'manager',dialogue:{waiter:'I’ll take your dessert request to the new table.',chef:'Where should I send Table 1’s desserts?',manager:'This table has another booking. I’ll arrange dessert on the other side.',guest:'Could we have dessert on the other side?'}}
  ],
  with:[
   {time:'3.91',lead:'waiter',dialogue:{waiter:'Seat 3’s requirement is checked. I’m sending the order now.',chef:'The table, seat and requirement are here together.',manager:'I can check Table 1’s progress from here.',guest:'Thank you for checking my allergy before sending.'}},
   {time:'11.03',lead:'manager',dialogue:{waiter:'I can check the drinks without leaving the section.',chef:'I can stay with preparation while the floor checks progress.',manager:'I’ll check the table’s progress before asking the team.',guest:'Thanks for keeping us updated.'}},
   {time:'19',lead:'waiter',dialogue:{waiter:'I’m collecting Table 1’s starters.',chef:'Starters are ready. I can see who’s collecting.',manager:'That pickup is assigned. I’ll help with the next task.',guest:'Thank you. We’re ready for our starters.'}},
   {time:'37–40',lead:'waiter',dialogue:{waiter:'Are you ready for the mains? I’ll coordinate the pickup.',chef:'The guests are ready, so I’ll finish their mains.',manager:'The guests set the pace. Let’s support the handover.',guest:'We’ve enjoyed our starters. We’re ready for the mains.'}},
   {time:null,lead:'manager',dialogue:{waiter:'I’ll check the drinks and dessert request before the move.',chef:'Please confirm the dessert order and the new table.',manager:'Before we move the guests, let’s check any open requests.',guest:'Can we confirm our drinks and dessert before we move?'}}
  ]
 };
 function updatePlay(){q('#play-story').textContent=playing?'Pause story':'Play story';q('#play-story').setAttribute('aria-pressed',String(playing));root.dataset.playing=String(playing);}
 function stop(){playing=false;clearTimeout(timer);timer=null;q('#floor-stage').setAttribute('paused','');updatePlay();}
 function schedule(){clearTimeout(timer);if(playing)timer=setTimeout(()=>{if(moment<4){moment++;render();}else stop();},6000);}
 function renderPerson(){
  root.dataset.actor=actor;root.style.setProperty('--focus-x',({chef:18.5,waiter:56,manager:44,guest:76}[actor])+'%');
  const stage=q('#floor-stage');stage.removeAttribute('free-pan');stage.setAttribute('focus-role',actor);stage.setAttribute('dialogue',stories[mode][moment].dialogue[actor]);
  qa('[data-actor]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.actor===actor)));
  const camera=q('#room-camera');if(camera.scrollWidth>camera.clientWidth+1){const anchor=stage.getRoleAnchor?.(actor),x=anchor?.[0]||camera.scrollWidth*({chef:.17,waiter:.56,manager:.44,guest:.76}[actor]);camera.scrollTo({left:Math.max(0,Math.min(camera.scrollWidth-camera.clientWidth,x-camera.clientWidth/2)),behavior:reduce.matches?'auto':'smooth'});}
 }
 function render(){
  const d=stories[mode][moment];root.dataset.mode=mode;root.dataset.moment=String(moment);
  qa('[data-workflow]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.workflow===mode)));
  q('#visit-chapters').innerHTML=stories[mode].map((s,i)=>`<button type="button" data-moment="${i}" ${i===moment?'aria-current="step"':''} aria-label="${chapters[i]}, ${s.time?s.time+' minutes':'not timed'}"><span>${chapters[i]}</span><strong><span class="chapter-time">${s.time||'Not timed'}</span>${s.time?'<span class="chapter-unit"> min</span>':''}</strong></button>`).join('');
  const stage=q('#floor-stage');stage.setAttribute('moment',String(moment));stage.setAttribute('workflow',mode);stage.removeAttribute('paused');actor=d.lead;renderPerson();updatePlay();schedule();reportHeight();
 }
 function select(index,focus=false){stop();moment=index;render();if(focus)q(`button[data-moment="${moment}"]`).focus({preventScroll:true});}
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.workflow){stop();mode=b.dataset.workflow;render();}else if(b.dataset.moment!==undefined)select(+b.dataset.moment);else if(b.dataset.actor){actor=b.dataset.actor;renderPerson();}});
 q('#play-story').addEventListener('click',()=>{if(playing){stop();return;}if(moment===4){moment=0;render();}playing=true;q('#floor-stage').removeAttribute('paused');updatePlay();schedule();});
 q('#visit-chapters').addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=Math.min(4,moment+1);if(e.key==='ArrowLeft')next=Math.max(0,moment-1);if(e.key==='Home')next=0;if(e.key==='End')next=4;if(next!==undefined){e.preventDefault();select(next,true);}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='oblix:flow-visibility'&&!e.data.visible)stop();});
 reduce.addEventListener('change',()=>{if(reduce.matches)stop();});
 const room=q('#room-camera');let reflectionFrame=0;
 room.addEventListener('scroll',()=>q('#floor-stage').positionDialogue?.(),{passive:true});
 room.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')q('#floor-stage').setAttribute('free-pan','');},{passive:true});
 room.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY))q('#floor-stage').setAttribute('free-pan','');},{passive:true});
 room.addEventListener('pointermove',e=>{if(reduce.matches||e.pointerType!=='mouse')return;cancelAnimationFrame(reflectionFrame);reflectionFrame=requestAnimationFrame(()=>{const b=room.getBoundingClientRect();root.style.setProperty('--reflection-shift',((e.clientX-b.left)/b.width-.5)*18+'px');});},{passive:true});
 room.addEventListener('pointerleave',()=>{cancelAnimationFrame(reflectionFrame);root.style.setProperty('--reflection-shift','0px');});
 let resizeFrame=0;function reportHeight(){if(resizeFrame)return;resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;parent.postMessage({type:'oblix:flow-height',height:Math.ceil(root.getBoundingClientRect().height)},location.origin);});}
 new ResizeObserver(reportHeight).observe(root);addEventListener('load',reportHeight);document.fonts?.ready.then(()=>q('#floor-stage').positionDialogue?.());render();
})();
