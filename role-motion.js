/* Original articulated service cast. Shared geometry, lighting and movement vocabulary. */
(() => {
 'use strict';
 const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
 const mul=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;};
 const trs=(p=[0,0,0],r=[0,0,0],s=[1,1,1])=>{const [x,y,z]=r,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);const m=mul(mul(new Float32Array([cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1]),new Float32Array([cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1])),new Float32Array([1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1]));for(let c=0;c<3;c++)for(let i=0;i<3;i++)m[c*4+i]*=s[c];m[12]=p[0];m[13]=p[1];m[14]=p[2];return m;};
 const ortho=(l,r,b,t,n,f)=>new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);
 const look=(eye,target)=>{const sub=(a,b)=>a.map((v,i)=>v-b[i]),norm=a=>{let l=Math.hypot(...a);return a.map(v=>v/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0);const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);};
 const colour=h=>{const n=parseInt(h.replace('#',''),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const wave=(t,a,b)=>Math.sin(Math.PI*Math.max(0,Math.min(1,(t-a)/(b-a))));
 const node=(p=[0,0,0],r=[0,0,0],s=[1,1,1])=>({p,r,s,children:[]});
 const add=(parent,child)=>(parent.children.push(child),child);
 const mesh=(parent,type,p,s,c,r=[0,0,0],alpha=1)=>add(parent,{...node(p,r,s),type,c:colour(c),alpha});
 // Project joint-based movement into an inked illustration shared by every character.
 // Inked figures use the same articulated joints in every part of the case study.
 // Facial expressions and silhouette colours remain readable without relying on colour alone.
 function drawInkedActor(a,m,project,world,queue,ctx){
  const at=(p,mat=m)=>project(world(mat,p));
  const base=at([0,0,0]),up=at([0,1,0]),u=Math.max(1,Math.hypot(up[0]-base[0],up[1]-base[1]));
  const ink='#101b28',skin=a.skinCSS,cloth=a.clothCSS,white='#f2f0e9',accent=a.accent;
  const put=(point,draw,offset=0)=>queue.push({z:point[2]+offset,draw});
  const stroke=(points,width,fill)=>{ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=ink;ctx.lineWidth=width+Math.max(1.3,u*.035);ctx.stroke();ctx.strokeStyle=fill;ctx.lineWidth=width;ctx.stroke();};
  const circle=(x,y,r,fill)=>{ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=Math.max(.8,u*.025);ctx.stroke();};
  if(a.selected)put(base,()=>{ctx.save();ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.globalAlpha=.75;ctx.beginPath();ctx.ellipse(base[0],base[1]+2,u*.58,u*.12,0,0,Math.PI*2);ctx.stroke();ctx.restore();},-.001);
  a.legs.forEach(({hip,knee},i)=>{
   const h=mul(m,trs(hip.p,hip.r,hip.s)),k=mul(h,trs(knee.p,knee.r,knee.s));
   const p=at([0,0,0],h),q=at([0,0,0],k),f=at([0,-.46,.07],k);
   put(q,()=>{stroke([p,q,f],u*.17,a.role==='guest'?cloth:({waiter:'#3e6487',chef:'#5b6e78',manager:'#635f83'})[a.role]);stroke([[f[0]-u*.07,f[1]+u*.02],[f[0]+u*.15,f[1]+u*.02]],u*.12,'#162436');});
  });
  const torso=at([0,1.55,Math.sin(a.body.r[0])*.35]);
  put(torso,()=>{
   ctx.save();ctx.translate(torso[0],torso[1]);ctx.rotate(a.body.r[2]||0);ctx.scale(u,u);ctx.lineWidth=Math.max(.018,1/u);ctx.strokeStyle=ink;ctx.fillStyle=cloth;
   ctx.beginPath();ctx.moveTo(-.23,-.53);ctx.quadraticCurveTo(-.38,-.44,-.34,-.22);ctx.lineTo(-.26,.43);ctx.quadraticCurveTo(0,.51,.27,.43);ctx.lineTo(.34,-.22);ctx.quadraticCurveTo(.36,-.45,.21,-.53);ctx.closePath();ctx.fill();ctx.stroke();
   if(a.role!=='guest'){
    ctx.fillStyle=white;ctx.beginPath();ctx.moveTo(-.11,-.52);ctx.lineTo(.11,-.52);ctx.lineTo(.07,-.10);ctx.lineTo(-.07,-.10);ctx.closePath();ctx.fill();ctx.stroke();
    if(a.role==='waiter'){
     ctx.fillStyle='#173a61';ctx.beginPath();ctx.moveTo(-.28,-.46);ctx.lineTo(-.10,-.48);ctx.lineTo(0,-.24);ctx.lineTo(.10,-.48);ctx.lineTo(.29,-.45);ctx.lineTo(.23,.4);ctx.lineTo(-.23,.4);ctx.closePath();ctx.fill();ctx.stroke();
     ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(-.12,-.44);ctx.lineTo(0,-.39);ctx.lineTo(.12,-.44);ctx.lineTo(.10,-.32);ctx.lineTo(0,-.37);ctx.lineTo(-.1,-.32);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#90caff';ctx.beginPath();ctx.moveTo(-.2,-.06);ctx.lineTo(-.08,-.06);ctx.stroke();
    }
    if(a.role==='chef'){
     ctx.fillStyle='#ec8e7a';ctx.fillRect(-.24,-.05,.48,.49);ctx.strokeRect(-.24,-.05,.48,.49);ctx.fillRect(-.15,-.38,.30,.34);ctx.strokeRect(-.15,-.38,.30,.34);ctx.strokeStyle='#884f47';ctx.beginPath();ctx.moveTo(-.13,.12);ctx.lineTo(.13,.12);ctx.lineTo(.12,.27);ctx.lineTo(-.12,.27);ctx.closePath();ctx.stroke();
    }
    if(a.role==='manager'){
     ctx.fillStyle='#7d73b8';ctx.beginPath();ctx.moveTo(-.12,-.52);ctx.lineTo(-.28,-.32);ctx.lineTo(-.05,-.09);ctx.lineTo(0,-.22);ctx.lineTo(.05,-.09);ctx.lineTo(.28,-.32);ctx.lineTo(.12,-.52);ctx.lineTo(0,-.24);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#eeeaf9';ctx.fillRect(-.018,-.38,.036,.28);
    }
   }else{ctx.strokeStyle='#1f3344';ctx.beginPath();ctx.moveTo(-.13,-.49);ctx.quadraticCurveTo(0,-.26,.13,-.49);ctx.stroke();}
   ctx.restore();
  });
  a.arms.forEach(({shoulder,elbow,hand},i)=>{
   const s=mul(m,trs(shoulder.p,shoulder.r,shoulder.s)),e=mul(s,trs(elbow.p,elbow.r,elbow.s)),h=mul(e,trs(hand.p,hand.r,hand.s));
   const p=at([0,0,0],s),q=at([0,0,0],e),r=at([0,-.015,.02],h);
   put(q,()=>{stroke([p,q],u*.14,a.role==='waiter'||a.role==='chef'?white:cloth);stroke([q,r],u*.12,a.role==='chef'||a.role==='guest'?skin:a.role==='waiter'?white:cloth);circle(r[0],r[1]+u*.025,u*.065,skin);},-.0002);
  });
  const neck=at([0,2.25,0]);put(neck,()=>stroke([[neck[0],neck[1]+u*.1],[neck[0],neck[1]-u*.18]],u*.14,skin));
  const hm=mul(m,trs(a.head.p,a.head.r,a.head.s)),hp=at([0,.09,.025],hm);
  put(hp,()=>{
   ctx.save();ctx.translate(hp[0],hp[1]);ctx.rotate((a.head.r[2]||0)+a.head.r[1]*.1+a.head.r[0]*.12);ctx.scale(u,u);ctx.lineWidth=Math.max(.018,.85/u);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=ink;
   ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(-.22,-.24);ctx.quadraticCurveTo(-.29,-.04,-.23,.16);ctx.lineTo(-.12,.28);ctx.quadraticCurveTo(.03,.35,.17,.24);ctx.quadraticCurveTo(.29,.11,.24,-.15);ctx.quadraticCurveTo(.22,-.34,-.02,-.33);ctx.quadraticCurveTo(-.15,-.33,-.22,-.24);ctx.fill();ctx.stroke();
   ctx.fillStyle='rgba(24,37,48,.13)';ctx.beginPath();ctx.moveTo(.13,-.28);ctx.quadraticCurveTo(.28,-.12,.21,.13);ctx.lineTo(.10,.25);ctx.lineTo(.17,.24);ctx.quadraticCurveTo(.31,.11,.24,-.15);ctx.closePath();ctx.fill();
   ctx.fillStyle=a.older?'#c8ccd3':a.hairCSS;
   ctx.beginPath();ctx.moveTo(-.24,.03);ctx.lineTo(-.28,-.12);ctx.lineTo(-.25,-.29);ctx.lineTo(-.29,-.36);ctx.lineTo(-.13,-.34);ctx.lineTo(-.18,-.41);ctx.lineTo(.01,-.37);ctx.lineTo(.14,-.4);ctx.lineTo(.27,-.28);ctx.lineTo(.26,-.06);ctx.lineTo(.21,-.15);ctx.lineTo(.17,-.25);ctx.quadraticCurveTo(.01,-.15,-.12,-.23);ctx.lineTo(-.20,-.12);ctx.lineTo(-.20,.02);ctx.closePath();ctx.fill();ctx.stroke();
   if(a.role==='guest'&&!a.older&&a.variant%2===0){ctx.beginPath();ctx.moveTo(-.24,-.18);ctx.quadraticCurveTo(-.40,.04,-.28,.27);ctx.lineTo(-.21,.23);ctx.lineTo(-.22,-.10);ctx.closePath();ctx.fill();ctx.stroke();}
   if(a.older){ctx.strokeStyle='#8998a6';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-.20+i*.09,-.25);ctx.quadraticCurveTo(-.18+i*.09,-.35,-.07+i*.06,-.29);ctx.stroke();}ctx.strokeStyle=ink;}
   if(a.role==='chef'){
    ctx.fillStyle=white;ctx.beginPath();ctx.moveTo(-.27,-.30);ctx.lineTo(-.29,-.44);ctx.bezierCurveTo(-.41,-.58,-.20,-.69,-.13,-.59);ctx.bezierCurveTo(-.09,-.76,.16,-.73,.18,-.59);ctx.bezierCurveTo(.34,-.65,.42,-.44,.27,-.39);ctx.lineTo(.25,-.30);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-.26,-.40);ctx.quadraticCurveTo(0,-.36,.26,-.4);ctx.stroke();
   }
   if(a.role==='guest'&&Math.cos(a.heading)<-.65){ctx.fillStyle=a.older?'#c8ccd3':a.hairCSS;ctx.beginPath();ctx.moveTo(-.24,-.22);ctx.quadraticCurveTo(0,-.43,.24,-.22);ctx.lineTo(.23,.11);ctx.quadraticCurveTo(0,.22,-.23,.11);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();return;}
   if(a.role==='manager'){ctx.fillStyle='rgba(36,31,36,.17)';ctx.beginPath();ctx.moveTo(-.20,.12);ctx.quadraticCurveTo(0,.27,.20,.10);ctx.lineTo(.15,.25);ctx.quadraticCurveTo(0,.34,-.13,.27);ctx.closePath();ctx.fill();}
   const [tension,concern,smile,frown]=a.reaction||[.1,.1,0,0],gaze=Math.max(-.024,Math.min(.024,a.head.r[1]*.05)),blink=a.eyes[0].s[1]<.5;
   for(const x of [-.105,.105]){
    if(blink){ctx.beginPath();ctx.moveTo(x-.05,-.018);ctx.quadraticCurveTo(x,.0,x+.05,-.018);ctx.stroke();}
    else{ctx.fillStyle='#f7f1e6';ctx.beginPath();ctx.ellipse(x,-.018,.056,.032-tension*.012,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#182c3e';ctx.beginPath();ctx.ellipse(x+gaze,-.015,.019,.027-tension*.006,0,0,Math.PI*2);ctx.fill();}
    const side=x<0?1:-1,tilt=(tension*.021-concern*.027)*side;
    ctx.beginPath();ctx.moveTo(x-.057,-.12-tilt);ctx.quadraticCurveTo(x,-.145-concern*.025+tension*.012,x+.057,-.12+tilt);ctx.strokeStyle=a.hairCSS;ctx.lineWidth=.023;ctx.stroke();ctx.strokeStyle=ink;ctx.lineWidth=Math.max(.015,.8/u);
   }
   ctx.beginPath();ctx.moveTo(.014,.025);ctx.lineTo(.035,.09);ctx.lineTo(.004,.10);ctx.stroke();
   const corner=.18-smile*.025+frown*.017;
   ctx.beginPath();ctx.moveTo(-.08,corner);ctx.quadraticCurveTo(.01,.183+smile*.06-frown*.068,.09,corner-.004*smile);ctx.lineWidth=.019;ctx.stroke();
   if(a.older){ctx.lineWidth=.012;for(const x of [-.105,.105]){ctx.beginPath();ctx.ellipse(x,-.016,.080,.058,0,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(-.025,-.025);ctx.lineTo(.025,-.025);ctx.stroke();ctx.beginPath();ctx.moveTo(-.17,.12);ctx.lineTo(-.14,.14);ctx.moveTo(.14,.12);ctx.lineTo(.16,.14);ctx.stroke();}
   ctx.restore();
  },-.0001);
 }

 // The floor has its own architectural lighting; character cards stay transparent.
 function paintDiningRoom(ctx,w,h,project,district=false){
  const p=(x,y,z)=>project([x,y,z]);
  const polygon=(points,fill)=>{ctx.beginPath();points.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();};
  const ellipse=(x,y,rx,ry,colour,alpha)=>{ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,colour);g.addColorStop(1,'transparent');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();};
  ctx.save();ctx.fillStyle='#080c11';ctx.fillRect(0,0,w,h);
  const back=p(0,0,-6),front=p(0,0,4.2),sky=ctx.createLinearGradient(0,0,0,back[1]);
  sky.addColorStop(0,'#151a28');sky.addColorStop(.6,'#192531');sky.addColorStop(1,'#25282e');
  const window=[p(-8.5,.3,-6),p(-8.5,4.8,-6),p(8.5,4.8,-6),p(8.5,.3,-6)];
  ctx.save();ctx.beginPath();window.forEach((v,i)=>i?ctx.lineTo(v[0],v[1]):ctx.moveTo(v[0],v[1]));ctx.closePath();ctx.clip();ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  const horizon=p(0,1,-6);ellipse(w*.72,horizon[1],w*.38,h*.25,'#8e7870',.12);
  if(district){paintCityWindows(ctx,p);}else for(let i=0;i<39;i++){
   const x=-8.8+i*.46,ht=.24+(Math.sin(i*2.73)+1)*.39,roof=p(x,.72+ht,-5.98),base=p(x+.36,.36,-5.98);
   ctx.fillStyle=i%3?'#111b25':'#15202b';ctx.fillRect(roof[0],roof[1],Math.max(2,base[0]-roof[0]),base[1]-roof[1]);
   for(let row=0;row<4;row++)for(let col=0;col<2;col++)if((i*3+row*7+col)%5<2){const dot=p(x+.08+col*.13,.65+row*.14,-5.95);ctx.fillStyle=(i+row)%3?'#c2b2a263':'#8faeba59';ctx.fillRect(dot[0],dot[1],1.2,1.4);}
  }
  // Narrow reflections in the glass, with quiet vertical mullions.
  for(let x=-8.4;x<=8.4;x+=1.4){const a=p(x,.34,-5.9),b=p(x,4.8,-5.9);ctx.strokeStyle='#91a1ae30';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();const c=p(x+.045,4.8,-5.89);polygon([a,b,c,p(x+.045,.34,-5.89)],'#c3d0d008');}
  const reflection=ctx.createLinearGradient(0,0,w,h);reflection.addColorStop(0,'transparent');reflection.addColorStop(.42,'#e2e2e208');reflection.addColorStop(.5,'transparent');reflection.addColorStop(.73,'#cfb8ad05');reflection.addColorStop(1,'transparent');ctx.fillStyle=reflection;ctx.fillRect(0,0,w,h);ctx.restore();
  const floor=ctx.createLinearGradient(0,back[1],0,front[1]);floor.addColorStop(0,'#171d23');floor.addColorStop(.5,'#1c2329');floor.addColorStop(1,'#0b1017');
  polygon([p(-8.5,0,-6),p(8.5,0,-6),p(8.5,0,4.2),p(-8.5,0,4.2)],floor);
  ctx.strokeStyle='#b1bdc00b';ctx.lineWidth=.6;
  for(let x=-8;x<=8;x+=2){const a=p(x,.004,-6),b=p(x,.004,4.1);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
  for(const z of [-4,-1,2]){const a=p(-8.5,.004,z),b=p(8.5,.004,z);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}
  const scale=Math.abs(p(1,0,0)[0]-p(0,0,0)[0]);
  for(const [x,z,r] of [[-6,0,2.3],[-3.05,-4.75,1.25],[4.8,1.35,2.1],[6.35,-4.75,1.25]]){const c=p(x,.014,z);ellipse(c[0],c[1],scale*r,scale*r*.33,'#d6c1ae',.14);ellipse(c[0],c[1]+3,scale*r*.72,scale*r*.14,'#020508',.66);}
  // Pendants light their own work area and remain fixed as the story changes.
  for(const [x,z,top,drop,r] of [[-6,-.3,4.8,4.2,.42],[-3.05,-4.75,4.8,2.8,.27],[4.8,1.35,4.8,3.7,.40],[6.35,-4.75,4.8,2.8,.27]]){
   const a=p(x,top,z),b=p(x,drop,z),s=scale*r;ctx.strokeStyle='#6f747958';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();
   const ground=p(x,0,z),beam=ctx.createLinearGradient(0,b[1],0,ground[1]);beam.addColorStop(0,'#efdcbe10');beam.addColorStop(1,'#e6d2bc00');polygon([[b[0]-s*.35,b[1]],[b[0]+s*.35,b[1]],[ground[0]+s*3,ground[1]],[ground[0]-s*3,ground[1]]],beam);
   ellipse(b[0],b[1]+3,s*2.6,s*1.2,'#efdcca',.19);
   const shade=ctx.createLinearGradient(b[0]-s,b[1],b[0]+s,b[1]);shade.addColorStop(0,'#262b32');shade.addColorStop(.5,'#53575a');shade.addColorStop(1,'#242a31');
   ctx.beginPath();ctx.moveTo(b[0]-s*.53,b[1]-s*.25);ctx.quadraticCurveTo(b[0],b[1]-s*.72,b[0]+s*.53,b[1]-s*.25);ctx.lineTo(b[0]+s,b[1]+s*.15);ctx.quadraticCurveTo(b[0],b[1]+s*.35,b[0]-s,b[1]+s*.15);ctx.closePath();ctx.fillStyle=shade;ctx.fill();
   ctx.beginPath();ctx.ellipse(b[0],b[1]+s*.16,s,s*.15,0,0,Math.PI*2);ctx.fillStyle='#e8d7c1';ctx.shadowColor='#d8c3ab';ctx.shadowBlur=s*.8;ctx.fill();ctx.shadowBlur=0;
  }
  ctx.restore();
 }
 class IllustrationRenderer{
  constructor(canvas){this.actorAnchors=new Map();this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});if(!this.ctx)throw Error('Canvas unavailable');}
  render(root,eye,target,span=3.8){const c=this.canvas,ctx=this.ctx,w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;const ratio=Math.min(devicePixelRatio||1,1.5);if(c.width!==Math.round(w*ratio)||c.height!==Math.round(h*ratio)){c.width=Math.round(w*ratio);c.height=Math.round(h*ratio);}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);const vp=mul(ortho(-span*w/h/2,span*w/h/2,-span/2,span/2,.1,100),look(eye,target));const project=p=>{const x=vp[0]*p[0]+vp[4]*p[1]+vp[8]*p[2]+vp[12],y=vp[1]*p[0]+vp[5]*p[1]+vp[9]*p[2]+vp[13],z=vp[2]*p[0]+vp[6]*p[1]+vp[10]*p[2]+vp[14];return [(x+1)*w/2,(1-y)*h/2,z];};const world=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];if(root.ambience)paintDiningRoom(ctx,w,h,project,root.district);this.actorAnchors.clear();const queue=[];const shade=(colour,k)=>'rgb('+colour.map(v=>Math.round(Math.min(255,v*255*k))).join(',')+')';
   const walk=(n,parent)=>{const m=mul(parent,trs(n.p,n.r,n.s));if(n.actor){this.actorAnchors.set(n.actor,project(world(m,[0,n.actor.role==='chef'?3.36:2.98,0])));drawInkedActor(n.actor,m,project,world,queue,ctx);walk(n.actor.props,m);return;}if(n.type&&Math.max(...n.s)>.0001){const centre=project([m[12],m[13],m[14]]);if(n.type==='sphere'){const axes=[[1,0,0],[0,1,0],[0,0,1]].map(p=>{const v=project(world(m,p));return [v[0]-centre[0],v[1]-centre[1]];});let a=0,b=0,d=0;axes.forEach(v=>{a+=v[0]**2;b+=v[0]*v[1];d+=v[1]**2;});const disc=Math.sqrt((a-d)**2+4*b*b),rx=Math.sqrt(Math.max(.001,(a+d+disc)/2)),ry=Math.sqrt(Math.max(.001,(a+d-disc)/2)),angle=.5*Math.atan2(2*b,a-d);queue.push({z:centre[2],draw:()=>{ctx.save();ctx.globalAlpha=n.alpha;ctx.translate(centre[0],centre[1]);ctx.rotate(angle);ctx.scale(rx,ry);ctx.fillStyle=shade(n.c,.98);ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#172a38';ctx.lineWidth=Math.min(.11,1.05/Math.max(rx,ry));ctx.stroke();ctx.restore();}});}else{const vertices=[],faces=[];if(n.type==='box'){vertices.push([-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]);faces.push([4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]);}else{const count=12;for(let i=0;i<count;i++){const angle=i/count*Math.PI*2;vertices.push([Math.cos(angle),-1,Math.sin(angle)],[Math.cos(angle),1,Math.sin(angle)]);}for(let i=0;i<count;i++)faces.push([i*2,((i+1)%count)*2,((i+1)%count)*2+1,i*2+1]);faces.push(Array.from({length:count},(_,i)=>i*2+1),Array.from({length:count},(_,i)=>(count-i-1)*2));}const ws=vertices.map(p=>world(m,p)),ps=ws.map(project);for(const face of faces){const points=face.map(i=>ps[i]),a=ws[face[0]],b=ws[face[1]],c=ws[face[2]],u=b.map((v,i)=>v-a[i]),v=c.map((z,i)=>z-a[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...normal)||1,k=.55+.40*Math.max(0,(-.4*normal[0]+.8*normal[1]+.5*normal[2])/len),z=points.reduce((t,p)=>t+p[2],0)/points.length;const environment=n.type==='box'&&(Math.abs(n.s[0])>=5||Math.abs(n.s[2])>=4);queue.push({z:environment?10:z,draw:()=>{ctx.globalAlpha=n.alpha;ctx.fillStyle=shade(n.c,k);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();ctx.globalAlpha=1;}});}}}for(const child of n.children)walk(child,m);};walk(root,I());queue.sort((a,b)=>b.z-a.z).forEach(v=>v.draw());}
  dispose(){}
 }
 const createRenderer=canvas=>new IllustrationRenderer(canvas);
 function makeActor(role,{skin,older=false,seated=false,variant=0}={}){
  const palette={waiter:['#c99272','#558fce','#f2f0e8'],chef:['#a96f4e','#f1eee5','#f1eee5'],manager:['#9a674d','#aa98da','#eeeaf8'],guest:['#cc9e85','#7b687a','#7b687a']};let [skinDefault,cloth,shirt]=palette[role]||palette.guest;if(role==='guest'){cloth=['#79677d','#556d7c','#66857e','#a29588'][variant%4];shirt=cloth;}skin=skin||skinDefault;const hair=older?'#b4b8be':role==='chef'?'#29201e':'#252322';
  const root=node(),body=add(root,node([0,1.45,0])),head=add(root,node([0,2.55,0]));root.r[1]=-.15;
  mesh(body,'sphere',[0,.1,0],[.34,.59,.21],cloth);mesh(body,'sphere',[0,-.37,0],[.28,.19,.20],cloth);
  if(role!=='guest'){mesh(body,'box',[0,.29,.189],[.10,.29,.035],shirt);if(role==='waiter'){mesh(body,'sphere',[-.075,.48,.241],[.08,.045,.025],'#141c24');mesh(body,'sphere',[.075,.48,.241],[.08,.045,.025],'#141c24');}if(role==='manager'){mesh(body,'box',[0,.27,.24],[.025,.20,.015],'#344455');mesh(body,'sphere',[-.19,.25,.195],[.10,.30,.035],'#303846',[0,0,-.25]);mesh(body,'sphere',[.19,.25,.195],[.10,.30,.035],'#303846',[0,0,.25]);}if(role==='chef'){mesh(body,'box',[0,-.07,.211],[.24,.32,.025],'#37434a');for(const x of [-.09,.09])for(const y of [.21,.37])mesh(body,'sphere',[x,y,.239],[.017,.017,.012],'#52616a');}}
  mesh(root,'cylinder',[0,2.23,0],[.10,.15,.10],skin);mesh(head,'sphere',[0,.10,0],[.32,.38,.29],skin);mesh(head,'sphere',[0,.35,-.035],[.335,.19,.28],hair);mesh(head,'sphere',[-.24,.25,-.02],[.10,.19,.22],hair);if(role==='guest'&&!older&&variant%2===0){mesh(head,'sphere',[.24,.15,-.04],[.12,.27,.25],hair);mesh(head,'sphere',[0,.20,-.26],[.24,.23,.13],hair);}if(older){for(let i=0;i<7;i++){const angle=i/6*Math.PI;mesh(head,'sphere',[Math.cos(angle)*.28,.34+Math.sin(angle)*.12,-.015],[.11,.12,.20],hair);}}else if(role!=='chef'){for(let i=0;i<3;i++)mesh(head,'sphere',[-.17+i*.13,.42+i*.016,.11],[.15,.10,.18],hair,[0,0,-.15]);}
  mesh(head,'sphere',[-.31,.10,0],[.065,.095,.06],skin);mesh(head,'sphere',[.31,.10,0],[.065,.095,.06],skin);mesh(head,'sphere',[0,.07,.29],[.055,.07,.066],skin);
  const eyes=[],brows=[];for(const x of [-.115,.115]){const eye=add(head,node([x,.16,.258]));mesh(eye,'sphere',[0,0,0],[.064,.043,.033],'#f3f3ed');mesh(eye,'sphere',[.005,0,.027],[.026,.029,.016],'#2c2928');mesh(eye,'sphere',[-.002,.009,.039],[.007,.008,.003],'#ffffff');eyes.push(eye);brows.push(mesh(head,'sphere',[x,.254,.255],[.075,.015,.017],hair));}
  const mouth=add(head,node([0,-.065,.266]));for(let i=0;i<5;i++){const x=(i-2)*.023;mesh(mouth,'sphere',[x,-.014+Math.abs(i-2)*.006,0],[.018,.010,.012],'#754839');}
  if(older){for(const x of [-.115,.115]){mesh(head,'cylinder',[x,.16,.289],[.085,.005,.073],'#636877',[Math.PI/2,0,0]);mesh(head,'sphere',[x,.16,.296],[.064,.042,.009],skin);mesh(head,'sphere',[x,.16,.309],[.022,.025,.008],'#2c2928');}mesh(head,'box',[0,.17,.30],[.035,.009,.008],'#636877');}
  if(role==='chef'){mesh(head,'cylinder',[0,.48,-.01],[.28,.10,.25],'#e3e7e6');for(const x of [-.17,0,.17])mesh(head,'sphere',[x,.64,-.025],[.18,.17,.18],'#f5f4ed');mesh(head,'sphere',[0,.30,-.29],[.15,.17,.13],hair);}
  const arms=[];for(const side of [-1,1]){const shoulder=add(root,node([side*.33,2.00,0]));mesh(shoulder,'sphere',[side*.015,-.19,0],[.105,.25,.105],role==='waiter'?shirt:cloth);const elbow=add(shoulder,node([0,-.41,0]));mesh(elbow,'sphere',[0,-.19,0],[.082,.22,.082],role==='chef'||role==='guest'?skin:role==='waiter'?shirt:cloth);const hand=add(elbow,node([0,-.40,0]));mesh(hand,'sphere',[0,-.025,.015],[.082,.105,.052],skin);mesh(hand,'sphere',[side*.058,0,.03],[.032,.06,.033],skin,[0,0,side*.3]);arms.push({shoulder,elbow,hand});}
  const legs=[];for(const side of [-1,1]){const hip=add(root,node([side*.145,1.04,0]));mesh(hip,'sphere',[0,-.23,0],[.132,.29,.139],role==='guest'?cloth:'#252e38');const knee=add(hip,node([0,-.48,0]));mesh(knee,'sphere',[0,-.22,0],[.098,.26,.105],role==='guest'?cloth:'#252e38');mesh(knee,'sphere',[0,-.45,.065],[.115,.085,.21],'#18212a');legs.push({hip,knee});}
  const props=add(root,node());
  if(role==='waiter'){const tray=add(props,node([-.52,1.65,.53]));mesh(tray,'cylinder',[0,0,0],[.39,.025,.29],'#657888');const glasses=add(tray,node());for(const x of [-.19,0,.19]){mesh(glasses,'cylinder',[x,.055,0],[.058,.008,.058],'#b0c1c9');mesh(glasses,'cylinder',[x,.14,0],[.008,.08,.008],'#cad8dd');mesh(glasses,'sphere',[x,.25,0],[.076,.105,.076],'#bfd6e0',[0,0,0],.58);mesh(glasses,'sphere',[x,.24,0],[.063,.053,.063],'#728e9c',[0,0,0],.7);}const food=add(tray,node());mesh(food,'cylinder',[0,.05,0],[.26,.02,.22],'#d2d9d9');for(let i=0;i<5;i++)mesh(food,'sphere',[(i%3-1)*.09,.10,Math.floor(i/3)*.11-.05],[.065,.04,.06],i%2?'#8caa91':'#aa806c');food.s=[0,0,0];props.tray=tray;props.glasses=glasses;props.food=food;const pad=add(props,node([.42,1.75,.38]));mesh(pad,'box',[0,0,0],[.12,.15,.018],'#ced6d6',[-.6,0,-.1]);props.pad=pad;}
  if(role==='chef'){const pan=add(props,node([-.44,1.54,.56]));mesh(pan,'cylinder',[0,0,0],[.31,.035,.26],'#39444e');mesh(pan,'box',[.36,.005,0],[.21,.028,.028],'#26333d');const ingredients=add(pan,node());for(let i=0;i<7;i++)mesh(ingredients,'sphere',[(i%3-1)*.1,.06,Math.floor(i/3)*.09-.09],[.06,.035,.05],i%2?'#a9b69a':'#b98769');props.pan=pan;props.ingredients=ingredients;const spatula=add(props,node([.42,1.62,.49]));mesh(spatula,'cylinder',[0,.1,0],[.015,.20,.015],'#6d7f8e',[0,0,-.3]);mesh(spatula,'box',[-.06,.31,0],[.07,.09,.018],'#9baeb9',[0,0,-.3]);props.spatula=spatula;const plate=add(props,node([.38,1.65,.49]));mesh(plate,'cylinder',[0,0,0],[.24,.02,.20],'#d4dcdb');for(let i=0;i<5;i++)mesh(plate,'sphere',[(i%3-1)*.08,.05,Math.floor(i/3)*.09-.05],[.06,.035,.055],i%2?'#8ca78b':'#a97b65');plate.s=[0,0,0];props.plate=plate;}
  if(role==='manager'){mesh(props,'box',[-.30,1.52,.32],[.12,.17,.018],'#718696',[-.35,0,-.1]);mesh(head,'sphere',[.30,.13,-.025],[.045,.075,.05],'#233543');}
  mesh(root,'sphere',[0,.016,0],[.48,.015,.28],'#0a1420',[0,0,0],.13);
  const actor={root,body,head,arms,legs,props,eyes,brows,mouth,role,seated,older,variant,skinCSS:skin,clothCSS:cloth,hairCSS:hair,accent:({waiter:'#78b7ff',chef:'#f0a28d',manager:'#b8a4f2',guest:'#92ccbd'})[role],base:[0,0,0],heading:0};root.actor=actor;
  return actor;
 }
 const reactionTargets={focused:[.08,.10,.05,.05],attentive:[.05,.08,.35,0],calm:[0,.02,.62,0],reassured:[0,.02,.86,0],confident:[.05,.02,.60,0],rushed:[.85,.32,0,.35],uncertain:[.18,.90,0,.62],concerned:[.12,.92,0,.64],frustrated:[1,.08,0,.06],disappointed:[.32,.70,0,.95]};
 function updateReaction(a,mood,now=performance.now()){
  const target=reactionTargets[mood]||reactionTargets.focused;
  if(!a.reaction){a.reaction=target.slice();a.reactionFrom=target.slice();a.reactionTarget=target;a.reactionKey=mood;a.reactionAt=now;return;}
  if(a.reactionKey!==mood){a.reactionFrom=a.reaction.slice();a.reactionTarget=target;a.reactionKey=mood;a.reactionAt=now;}
  const progress=matchMedia('(prefers-reduced-motion: reduce)').matches?1:smooth((now-a.reactionAt)/950);
  a.reaction=a.reactionFrom.map((v,i)=>v+(a.reactionTarget[i]-v)*progress);
 }
 function pose(a,t,mood='calm',walking=false){a.mood=mood==='stressed'?'frustrated':mood;updateReaction(a,a.mood);const tension=a.reaction[0],concernWeight=a.reaction[1],tense=tension>.45||concernWeight>.55;const {root,body,head,arms,legs,props,eyes,brows,role}=a;const cycle=Math.min(t,11.8),scan=wave(cycle,1,5),action=wave(cycle,3,9),finish=smooth((cycle-8)/2);root.p=[...a.base];root.r=[0,a.heading||-.15,0];body.r=[0,0,0];head.r=[.02,0,0];arms.forEach((v,i)=>{v.shoulder.p[1]=2.00+tension*.06;v.shoulder.r=[.05,0,(i===0?-.08:.08)];v.elbow.r=[-.15,0,0];});legs.forEach(v=>{v.hip.r=[0,0,0];v.knee.r=[0,0,0];});
  const blink=Math.sin(cycle*1.8)>0.985?.15:1;eyes.forEach(e=>{e.s[1]=blink;});brows.forEach((b,i)=>{b.r[2]=(tense?(i===0?-.25:.25):0);});
  if(role==='waiter'){head.r[1]=.25*Math.sin(scan*Math.PI);head.r[0]=.18*wave(cycle,0,3);arms[0].shoulder.r=[-.35,0,-.48];arms[0].elbow.r=[-1.25,0,0];arms[1].shoulder.r=[-.35,0,.18+.12*action];arms[1].elbow.r=[-.75-.35*wave(cycle,0,3),0,0];props.pad.s=[1-finish,1-finish,1-finish];props.tray.p[1]=1.66-.17*finish;props.tray.r=[.025*action,0,.035*Math.sin(cycle*2)*action];body.r[0]=.12*finish;head.r[0]+=.08*wave(cycle,9,11);}
  if(role==='chef'){arms[0].shoulder.r=[-.38,0,-.34];arms[0].elbow.r=[-1.15,0,0];arms[1].shoulder.r=[-.4,0,.25];arms[1].elbow.r=[-1.15-.25*Math.sin(cycle*2)*action,0,-.12*Math.sin(cycle*2)];head.r=[.12+.06*action,-.12*scan,0];props.pan.r[0]=-.21*Math.sin(cycle*2.3)*action;props.pan.p[1]=1.54+.07*Math.sin(cycle*2.3)*action;props.ingredients.p[1]=Math.max(0,Math.sin(cycle*2.3))*.27*action;props.spatula.r=[.2*Math.sin(cycle*2)*action,0,-.22*Math.sin(cycle*2)*action];props.spatula.p[0]=.40-.09*action;props.spatula.s=[1-finish,1-finish,1-finish];props.plate.s=[finish,finish,finish];arms[1].shoulder.r[0]-=finish*.25;body.r[0]=.05*action;}
  if(role==='manager'){head.r[1]=.55*Math.sin(cycle*.7)*Math.sin(Math.min(cycle/11.8,1)*Math.PI);head.r[0]=-.05*wave(cycle,1,3);arms[0].shoulder.r=[-.35,0,-.1];arms[0].elbow.r=[-1,0,0];const listen=wave(cycle,2,6),point=wave(cycle,6,11);arms[1].shoulder.r=[-.25-.9*listen,0,.1+.65*point];arms[1].elbow.r=[-.4-1.5*listen,0,.15*point];head.r[0]+=.1*wave(cycle,8,10);}
  if(role==='guest'){head.r[1]=(.15+.035*a.variant)*scan;head.r[0]=.06-.18*Math.min(1,tension+concernWeight*.6);body.r[0]=.04-.14*Math.min(1,tension+concernWeight*.6);arms[0].shoulder.r[0]=-.7;arms[1].shoulder.r[0]=-.65-.35*action;arms.forEach(v=>v.elbow.r[0]=-.8);}
  const sitting=a.seatBlend===undefined?(a.seated?1:0):a.seatBlend;if(sitting>0){root.p[1]-=.40*sitting;legs.forEach(v=>{v.hip.r[0]=-Math.PI/2*sitting;v.knee.r[0]=Math.PI/2*sitting;});}body.r[0]+=.06*tension+.025*concernWeight;head.r[0]+=.035*concernWeight;
  if(walking){const stride=Math.sin((a.walkClock===undefined?t:a.walkClock)*(a.mood==='rushed'?6.2:5.7));legs[0].hip.r[0]=stride*.36;legs[1].hip.r[0]=-stride*.36;legs[0].knee.r[0]=Math.max(0,-stride)*.45;legs[1].knee.r[0]=Math.max(0,stride)*.45;root.p[1]+=.025*Math.abs(stride);body.r[2]=stride*.025;}
 }
 class ServiceCharacter extends HTMLElement{
  static get observedAttributes(){return ['data-role'];}
  connectedCallback(){
   if(this.canvas)return;this.setAttribute('role','img');this.innerHTML='<canvas aria-hidden="true"></canvas>';this.canvas=this.querySelector('canvas');this.still=this.hasAttribute('still');this.elapsed=0;this.playing=!this.still&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
   try{this.renderer=createRenderer(this.canvas);this.setActor();this.observer=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;this.last=0;if(this.visible)this.tick();else cancelAnimationFrame(this.frame);},{threshold:.15});this.observer.observe(this);this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(this);this.draw();}catch(e){this.dataset.motionError=e.message;this.innerHTML='';}
  }
  setActor(){const role=this.dataset.role||'waiter';this.actor=makeActor(role);this.setAttribute('aria-label',({waiter:'Waiter balancing a tray and serving.',chef:'Chef stirring, tossing a pan and plating.',manager:'Manager checking the room and directing support.'})[role]||'Restaurant service');}
  attributeChangedCallback(name,old,value){if(this.renderer&&old!==value){this.setActor();this.draw();}}
  draw(){if(!this.renderer)return;const role=this.dataset.role||'waiter',handover=this.getAttribute('motion')==='handover',phase=this.still?12:handover?Math.min(12,({waiter:8,chef:7.5,manager:6}[role]||8)+this.elapsed*1.25):Math.min(12,this.elapsed*2.5);pose(this.actor,phase,handover?'calm':role==='chef'?'focused':'attentive');this.renderer.render(this.actor.root,[.35,2.35,7],[0,1.66,0],3.85);}
  tick(now=performance.now()){cancelAnimationFrame(this.frame);if(!this.visible)return;if(this.playing){if(this.last)this.elapsed+=Math.min(.1,(now-this.last)/1000);if(this.elapsed>=4.8)this.playing=false;}this.last=now;this.draw();if(this.playing)this.frame=requestAnimationFrame(t=>this.tick(t));}
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.observer?.disconnect();this.resize?.disconnect();this.renderer?.dispose();}
 }
 function furnish(root){
  mesh(root,'box',[-6,.70,-.05],[1.65,.70,.55],'#26313b');
  mesh(root,'box',[-6,1.43,-.05],[1.75,.035,.64],'#a6ada9');
  for(const x of [-6.85,-6,-5.15]){mesh(root,'cylinder',[x,1.51,.08],[.27,.02,.27],'#e3e8e4');for(const dx of [-.08,.04,.13])mesh(root,'sphere',[x+dx,1.56,.07],[.055,.03,.08],'#b1c3a7');}
  mesh(root,'box',[-1.15,.64,-2.65],[.4,.64,.25],'#3d4b6d');mesh(root,'box',[-1.15,1.32,-2.65],[.48,.04,.31],'#a3aed4',[-.15,0,0]);
 }
 function diningTable(root,r=.9){
  mesh(root,'cylinder',[0,1.10,0],[r,.065,r],'#667d79');mesh(root,'cylinder',[0,.53,0],[.085,.53,.085],'#3c5967');mesh(root,'cylinder',[0,.04,0],[.36,.04,.36],'#293f50');
  mesh(root,'cylinder',[0,1.22,0],[.075,.065,.075],'#d5cbbc',[0,0,0],.8);mesh(root,'sphere',[0,1.31,0],[.023,.042,.023],'#f0debf',[0,0,0],.9);
  for(const [dx,dz] of [[-.48,0],[.48,0],[0,.48],[0,-.48]]){mesh(root,'cylinder',[dx,1.18,dz],[.21,.012,.21],'#edf0e5');mesh(root,'cylinder',[dx+.16,1.25,dz],[.012,.06,.012],'#d7ebef');mesh(root,'sphere',[dx+.16,1.33,dz],[.045,.055,.045],'#d7e9ee',[0,0,0],.72);}
 }
 class ServiceFloor extends HTMLElement{
  static get observedAttributes(){return ['moment','workflow','focus-role','paused','dialogue'];}
  connectedCallback(){
   if(this.canvas)return;this.innerHTML='<canvas role="img" aria-label="Evening restaurant floor with softly lit tables, a kitchen pass and a clear service aisle. Blue waiter, coral chef, lilac manager and seated guests."></canvas>';this.canvas=this.querySelector('canvas');this.insertAdjacentHTML('beforeend','<div class="scene-dialogue" role="status" aria-live="polite" aria-atomic="true" hidden><span class="dialogue-speaker"></span><p class="dialogue-words"></p></div>');this.bubble=this.querySelector('.scene-dialogue');
   try{
    this.renderer=createRenderer(this.canvas);this.scene=node();this.scene.ambience=true;furnish(this.scene);this.guests=[];
    const tableGroup=(x,z,size,count,active)=>{
     const group=add(this.scene,node([x,0,z],[0,0,0],[size,size,size]));diningTable(group);
     if(active){this.tableFood=add(group,node());for(const [dx,dz] of [[-.48,0],[.48,0],[0,.48],[0,-.48]])for(let i=0;i<3;i++)mesh(this.tableFood,'sphere',[dx+(i-1)*.07,1.23,dz],[.06,.03,.05],i%2?'#96b49b':'#ca9282');}
     const angles=active?[Math.PI*1.5,Math.PI*.5,Math.PI,0]:Array.from({length:count},(_,i)=>i/count*Math.PI*2+Math.PI*.5);
     angles.forEach((angle,i)=>{const skin=['#cba68d','#885b45','#b87d60','#bd9a7e'][i%4],older=active?i===0:i===count-1;const actor=makeActor('guest',{skin,older,seated:true,variant:i+(active?0:3)});actor.base=[Math.sin(angle)*1.46,0,Math.cos(angle)*1.46];actor.home=actor.base.slice();actor.heading=angle+Math.PI;actor.activeTable=active;add(group,actor.root);this.guests.push(actor);const [gx,,gz]=actor.base;mesh(group,'box',[gx,.52,gz],[.25,.05,.27],'#334d62');mesh(group,'box',[gx-Math.sin(actor.heading)*.24,.85,gz-Math.cos(actor.heading)*.24],[.28,.34,.035],'#334d62',[0,actor.heading,0]);});
    };
    tableGroup(4.8,1.35,1,4,true);tableGroup(-3.05,-4.75,.58,2,false);tableGroup(6.35,-4.75,.58,3,false);
    this.actors={waiter:makeActor('waiter'),chef:makeActor('chef'),manager:makeActor('manager')};Object.values(this.actors).forEach(a=>add(this.scene,a.root));
    this.actors.waiter.base=[2.35,0,2.0];this.actors.chef.base=[-6,0,-1.05];this.actors.chef.heading=0;this.actors.manager.base=[-1.05,0,-2.15];this.actors.manager.root.s=[.88,.88,.88];
    this.visible=true;this.elapsed=0;this.last=0;this.eye=[0,6.9,18];this.target=[0,1.35,-1.15];
    this.observer=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;this.last=0;if(this.visible)this.tick();else cancelAnimationFrame(this.frame);},{threshold:.05});this.observer.observe(this);this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(this);this.updateScene();
   }catch(e){this.dataset.motionError=e.message;this.innerHTML='<p class="scene-unavailable">The illustrated floor is unavailable. Follow the labelled story below.</p>';}
  }
  attributeChangedCallback(name,old,value){if(!this.renderer||old===value)return;if(name==='focus-role'||name==='dialogue'){this.focusRole=this.getAttribute('focus-role')||'waiter';this.draw();return;}if(name==='paused'){this.last=0;this.dataset.actionState=value===null?'playing':'paused';if(value===null)this.tick();return;}this.elapsed=0;this.last=0;this.updateScene();}
  updateScene(){
   this.moment=+(this.getAttribute('moment')||0);this.withApp=this.getAttribute('workflow')==='with';this.focusRole=this.getAttribute('focus-role')||'waiter';this.previous=this.actors.waiter.base.slice();
   const old=[[-2.2,0,-.7],[2.35,0,2.0],[-3.7,0,.5],[2.35,0,2.0],[2.35,0,2.2]],app=[[2.35,0,2.0],[2.35,0,2.0],[-3.7,0,.5],[2.35,0,2.0],[1.1,0,.8]];this.destination=(this.withApp?app:old)[this.moment];this.tick();
  }
  draw(){
   if(!this.renderer)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,t=reduce?12:Math.min(12,this.elapsed*2.5),k=smooth(this.elapsed/2.5),w=this.actors.waiter;
   const allMoods=this.withApp?[['focused','focused','calm','reassured'],['attentive','focused','calm','reassured'],['confident','focused','calm','reassured'],['attentive','focused','attentive','calm'],['attentive','focused','attentive','concerned']]:[['rushed','uncertain','concerned','uncertain'],['rushed','focused','concerned','frustrated'],['rushed','frustrated','concerned','disappointed'],['attentive','focused','attentive','calm'],['concerned','focused','concerned','disappointed']];const moods=allMoods[this.moment];
   w.base=this.previous.map((v,i)=>v+(this.destination[i]-v)*k);let walking=k<.99;if(this.moment===1)w.base[2]+=Math.sin(k*Math.PI)*1.4;
   if(this.moment===2){const travel=smooth((this.elapsed-.7)/2.5);w.base=[-3.7+6.05*travel,0,.5+1.5*travel+Math.sin(travel*Math.PI)*1.1];walking=this.elapsed>.7&&this.elapsed<3.2;}
   w.heading=this.moment===2&&this.elapsed<.7?-.65:0;w.walkClock=this.elapsed;pose(w,t,moods[0],walking);w.selected=this.focusRole==='waiter';
   const foodTrip=this.moment===2||this.moment===3;w.props.glasses.s=foodTrip?[0,0,0]:[1,1,1];w.props.food.s=foodTrip?[1,1,1]:[0,0,0];
   if(this.moment===0||this.moment===4){w.props.tray.s=[0,0,0];w.props.pad.s=[1,1,1];w.props.pad.children[0].c=colour(this.withApp?'#477eb7':'#e3dfd1');w.head.r[0]=.16;w.arms[1].elbow.r[0]=-1.1;}else{w.props.tray.s=[1,1,1];w.props.pad.s=[0,0,0];}
   if(this.moment===2&&this.elapsed>3.4){w.props.tray.s=[0,0,0];w.body.r[0]=.14*wave(this.elapsed,3.4,4.6);}
   const chef=this.actors.chef;pose(chef,foodTrip?10:t,moods[1]);chef.selected=this.focusRole==='chef';
   const manager=this.actors.manager;manager.base=[-1.05,0,-2.15];manager.heading=0;pose(manager,t,moods[2],false);manager.selected=this.focusRole==='manager';
   this.tableFood.s=this.moment>=3||(this.moment===2&&this.elapsed>3.4)?[1,1,1]:[0,0,0];
   this.guests.forEach((a,i)=>{a.base=a.home.slice();a.seatBlend=1;a.selected=this.focusRole==='guest'&&i===0;if(a.activeTable&&i===0&&!this.withApp&&this.moment===4){const stand=smooth((this.elapsed-1.5)/2);a.seatBlend=1-stand;a.base[0]-=stand*.7;}pose(a,a.activeTable?t+i*.45:10,a.activeTable?moods[3]:'calm');if(a.activeTable&&i===0){const request=Math.min(1,a.reaction[0]+a.reaction[3]);a.arms[1].shoulder.r[0]-=.28*request*wave(t,2,9);a.arms[1].elbow.r[0]-=.25*request;}});
   const ratio=this.clientWidth/this.clientHeight,compact=innerWidth<800&&this.clientHeight<300,span=Math.max(compact?8.5:7,19.0/ratio),target=innerWidth<800?[0,2.05,-1.15]:this.target;this.renderer.render(this.scene,this.eye,target,span);this.positionDialogue();
  }
  getRoleAnchor(role){const actor=role==='guest'?this.guests?.find(a=>a.activeTable):this.actors?.[role];return this.renderer?.actorAnchors.get(actor);}
  positionDialogue(){
   if(!this.bubble)return;const words=this.getAttribute('dialogue'),anchor=this.getRoleAnchor(this.focusRole);if(!words||!anchor){this.bubble.hidden=true;return;}
   const speaker={chef:'Chef',waiter:'Waiter',manager:'Floor manager',guest:'Guest'}[this.focusRole]||'Team';
   const text=this.bubble.querySelector('.dialogue-words'),label=this.bubble.querySelector('.dialogue-speaker');if(text.textContent!==words)text.textContent=words;if(label.textContent!==speaker)label.textContent=speaker;
   this.bubble.dataset.speaker=this.focusRole;const camera=this.closest('.room-camera'),viewWidth=camera?.clientWidth||this.clientWidth;let viewLeft=camera?.scrollLeft||0;
   if(camera&&camera.scrollWidth>viewWidth+1&&this.visible&&!this.hasAttribute('paused')&&!this.hasAttribute('free-pan')&&this.elapsed<4.8&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const desired=Math.max(0,Math.min(camera.scrollWidth-viewWidth,anchor[0]-viewWidth/2));if(Math.abs(desired-viewLeft)>1)camera.scrollLeft+=(desired-viewLeft)*.2;viewLeft=camera.scrollLeft;}
   const viewRight=Math.min(this.clientWidth,viewLeft+viewWidth);
   if(anchor[0]<viewLeft||anchor[0]>viewRight){this.bubble.hidden=true;return;}this.bubble.hidden=false;
   const width=this.bubble.offsetWidth,height=this.bubble.offsetHeight,left=Math.max(viewLeft+12,Math.min(viewRight-width-12,anchor[0]-width/2)),top=Math.max(10,anchor[1]-height-18);
   this.bubble.style.transform=`translate3d(${left.toFixed(2)}px,${top.toFixed(2)}px,0)`;this.bubble.style.setProperty('--tail-x',Math.max(15,Math.min(width-15,anchor[0]-left))+'px');this.bubble.style.setProperty('--tail-length',Math.max(12,anchor[1]-top-height-3)+'px');
  }
  tick(now=performance.now()){cancelAnimationFrame(this.frame);if(!this.visible)return;const paused=this.hasAttribute('paused'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!paused&&!reduce&&this.last)this.elapsed+=Math.min(.1,(now-this.last)/1000);this.last=now;this.dataset.actionState=paused?'paused':reduce||this.elapsed>=4.8?'complete':'playing';if(!this.lastDraw||now-this.lastDraw>1000/30||paused||reduce){this.draw();this.lastDraw=now;}if(!paused&&!reduce&&this.elapsed<4.8)this.frame=requestAnimationFrame(t=>this.tick(t));}
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.observer?.disconnect();this.resize?.disconnect();this.renderer?.dispose();}
 }
 // A quiet City skyline, inspired by the northward view from the Shard.
 // The buildings are a setting, never a map or a claimed exact sightline.
 function paintCityWindows(ctx,p){
  const poly=(pts,fill,stroke)=>{ctx.beginPath();pts.forEach((v,i)=>{const q=p(...v);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.8;ctx.stroke();}};
  const line=(pts,col,width=.7)=>{ctx.beginPath();pts.forEach((v,i)=>{const q=p(...v);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke();};
  const block=(x,width,height,style=0)=>{
   const bottom=.32,top=bottom+height;
   poly([[x,bottom,-5.98],[x,top,-5.98],[x+width,top,-5.98],[x+width,bottom,-5.98]],style?'#182a36':'#142430','#7598a122');
   for(let row=0;row<Math.floor(height/.16);row++)for(let col=0;col<Math.floor(width/.13);col++){
    if((row*7+col*5+Math.round(x*19))%7>3)continue;const a=p(x+.045+col*.13,bottom+.09+row*.16,-5.94),b=p(x+.105+col*.13,bottom+.14+row*.16,-5.94);
    ctx.fillStyle=(col+row)%4===0?'#d5bb7e90':'#9ab6bd64';ctx.fillRect(a[0],b[1],Math.max(1,b[0]-a[0]),Math.max(1,a[1]-b[1]));
   }
   for(let i=1;i<width/.3;i++)line([[x+i*.3,bottom,-5.93],[x+i*.3,top,-5.93]],'#9eb9c41c');
  };
  for(const [x,w,h] of [[-8.6,.8,.9],[-7.6,.7,1.2],[-6.7,1.2,.8],[-5.4,.8,1.5],[-4.5,.8,1.8],[-3.6,.8,1.0],[-2.7,.9,1.5],[-1.6,.8,.9],[-.6,1.1,.7],[3.5,.9,1.4],[4.6,.6,1.1],[5.4,1.1,1.7],[6.7,.7,1.4],[7.5,1.0,.8]])block(x,w,h);
  // Broadgate-like glazed tower with an expressed diagonal structure.
  block(-5.1,.83,3.45,1);
  for(let j=0;j<3;j++)line([[-5.08,.43+j*1.07,-5.90],[-4.30,1.49+j*1.07,-5.90],[-5.08,2.56+j*1.07,-5.90]],'#9ab7c14a',.8);
  // Distinct rounded Gherkin silhouette and diamond glazing.
  const cx=1.7,base=.34,height=3.04,width=.72,outline=[];
  for(let i=0;i<=24;i++){const u=i/24;outline.push([cx+Math.sin((.22+.78*u)*Math.PI)*width,base+u*height,-5.87]);}
  for(let i=24;i>=0;i--){const u=i/24;outline.push([cx-Math.sin((.22+.78*u)*Math.PI)*width,base+u*height,-5.87]);}
  poly(outline,'#1a303c','#9fbac278');
  for(let j=1;j<13;j++){const u=j/14,y=base+u*height,r=Math.sin((.22+.78*u)*Math.PI)*width;line([[cx-r,y,-5.84],[cx+r,y,-5.84]],j%3===0?'#dbc28b75':'#a5c5cf44');}
  for(const phase of [-1,-.5,0,.5,1]){
   const path=[];for(let j=0;j<=24;j++){const u=j/24;path.push([cx+Math.sin((.22+.78*u)*Math.PI)*width*Math.sin(u*Math.PI*2+phase*Math.PI),base+u*height,-5.83]);}line(path,'#b2c8c958');
  }
  // A stepped glazed City tower, set further back than the foreground blocks.
  poly([[2.8,.35,-5.95],[2.8,2.7,-5.95],[3.48,3.65,-5.95],[3.65,3.65,-5.95],[3.65,.35,-5.95]],'#1a2c38','#a1b7bf36');
  for(let i=0;i<15;i++)line([[2.83,.48+i*.18,-5.91],[3.61,.48+i*.18,-5.91]],'#d6bc843c');
  // Curved, terraced glazing evokes the Liverpool Street / Broadgate frontage.
  poly([[-1.95,.33,-5.8],[-1.95,1.30,-5.8],[-1.7,1.54,-5.8],[-.1,1.54,-5.8],[.12,1.31,-5.8],[.12,.33,-5.8]],'#23333b','#c1c4b43d');
  for(let row=0;row<5;row++)line([[-1.88,.47+row*.19,-5.76],[-1.68,.58+row*.19,-5.76],[-.18,.58+row*.19,-5.76],[.06,.47+row*.19,-5.76]],row%2?'#e6ce9658':'#a6c8cf54');
  for(let col=0;col<12;col++)line([[-1.8+col*.16,.36,-5.74],[-1.8+col*.16,1.42,-5.74]],'#b1c4c329');
 }
 class HandoverSpotlight extends HTMLElement{
  connectedCallback(){
   if(this.canvas)return;
   this.innerHTML='<canvas role="img" aria-label="Table 1’s starters move from the chef at the kitchen pass to a collecting waiter and four guests. Illuminated City building silhouettes are visible through the windows."></canvas><div class="scene-dialogue" role="status" aria-live="polite" aria-atomic="true" hidden><span class="dialogue-speaker"></span><p class="dialogue-words"></p></div>';
   this.canvas=this.querySelector('canvas');this.bubble=this.querySelector('.scene-dialogue');
   try{
    this.renderer=createRenderer(this.canvas);this.scene=node();this.scene.ambience=true;this.scene.district=true;
    mesh(this.scene,'box',[-5.6,.68,-.25],[1.58,.68,.56],'#29333d');mesh(this.scene,'box',[-5.6,1.40,-.25],[1.69,.035,.65],'#abb1ac');
    this.passFood=add(this.scene,node());for(const x of [-6.35,-5.6,-4.85]){mesh(this.passFood,'cylinder',[x,1.49,-.05],[.27,.02,.27],'#e6e9e2');for(let i=0;i<3;i++)mesh(this.passFood,'sphere',[x+(i-1)*.075,1.55,-.05],[.06,.035,.06],i%2?'#b28670':'#92aa86');}
    const table=add(this.scene,node([4.65,0,1.05],[0,0,0],[.96,.96,.96]));diningTable(table);this.tableFood=add(table,node());
    for(const [dx,dz] of [[-.48,0],[.48,0],[0,.48],[0,-.48]])for(let i=0;i<3;i++)mesh(this.tableFood,'sphere',[dx+(i-1)*.07,1.23,dz],[.06,.03,.05],i%2?'#96b49b':'#ca9282');
    this.guests=[];[Math.PI*1.5,Math.PI*.5,Math.PI,0].forEach((angle,i)=>{
     const a=makeActor('guest',{skin:['#cba68d','#885b45','#b87d60','#bd9a7e'][i],older:i===0,seated:true,variant:i});a.base=[Math.sin(angle)*1.46,0,Math.cos(angle)*1.46];a.home=a.base.slice();a.heading=angle+Math.PI;add(table,a.root);this.guests.push(a);
     const [x,,z]=a.base;mesh(table,'box',[x,.52,z],[.25,.05,.27],'#334b5c');mesh(table,'box',[x-Math.sin(a.heading)*.24,.85,z-Math.cos(a.heading)*.24],[.28,.34,.035],'#334b5c',[0,a.heading,0]);
    });
    this.actors={chef:makeActor('chef'),waiter:makeActor('waiter'),manager:makeActor('manager')};Object.values(this.actors).forEach(a=>add(this.scene,a.root));
    this.actors.chef.base=[-5.6,0,-1.15];this.actors.chef.heading=0;this.actors.waiter.base=[.8,0,1.85];this.actors.manager.base=[-.7,0,-3.15];this.actors.manager.heading=.1;this.actors.manager.root.s=[.76,.76,.76];
    this.elapsed=0;this.last=0;this.visible=true;this.paused=false;this.cameraX=0;this.state={step:0,workflow:'without',speaker:'chef',dialogue:''};
    this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(this);
    this.observer=new IntersectionObserver(es=>{this.visible=es[0].isIntersecting;this.last=0;if(this.visible)this.tick();else cancelAnimationFrame(this.frame);},{threshold:.05});this.observer.observe(this);this.draw();
   }catch(e){this.dataset.motionError=e.message;this.innerHTML='<p class="scene-unavailable">Food ready → confirm a collector → serve Table 1. With the app, the pickup has a visible, named owner.</p>';}
  }
  setHandover(value){this.state={...value};this.elapsed=0;this.last=0;this.startedAt=0;this.beat=null;this.paused=false;this.lastDraw=0;this.cameraFrom=this.cameraX||0;this.tick();}
  setDialogue(words,speaker){this.state.dialogue=words;this.state.speaker=speaker;this.positionDialogue();}
  pauseMotion(){this.paused=true;this.last=0;this.startedAt=0;this.dataset.actionState='paused';cancelAnimationFrame(this.frame);}
  resumeMotion(){this.paused=false;this.last=0;this.startedAt=0;this.tick();}
  draw(){
   if(!this.renderer||!this.state)return;
   const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,s=this.state.step,app=this.state.workflow==='with',time=reduce?5.8:this.elapsed,t=Math.min(12,time*2.5),w=this.actors.waiter,c=this.actors.chef,m=this.actors.manager;
   let walking=false,collected=false,served=false;
   if(s===0){w.base=[.8,0,1.85];}
   if(s===1){
    if(app){const approach=smooth(time/2.1),returning=smooth((time-2.4)/2);w.base=returning>0?[-3.7+2.6*returning,0,.72+returning*.75]:[.8-4.5*approach,0,1.85-1.13*approach+Math.sin(approach*Math.PI)*.45];walking=time<2.1||(time>2.4&&time<4.4);collected=time>=2.15;}
    else{w.base=[.8,0,1.85];}
   }
   if(s===2){const travel=smooth(time/3.2);w.base=[-1.1+3.25*travel,0,1.47+.35*travel+Math.sin(travel*Math.PI)*.55];walking=time<3.2;collected=true;served=time>=3.5;}
   w.heading=0;w.walkClock=time;pose(w,s===0?11:t,app?'confident':s===1?'uncertain':'concerned',walking);w.selected=this.state.speaker==='waiter';w.props.glasses.s=[0,0,0];w.props.food.s=collected&&!served?[1,1,1]:[0,0,0];w.props.tray.s=collected&&!served?[1,1,1]:[0,0,0];w.props.pad.s=s===1&&app&&!collected?[1,1,1]:[0,0,0];w.props.pad.children[0].c=colour('#477eb7');
   if(served){w.body.r[0]=.12*wave(time,3.5,5.2);w.head.r[0]=.08;}
   pose(c,8+Math.min(4,time),app?'focused':s===1?'frustrated':'focused');c.selected=this.state.speaker==='chef';c.props.pan.s=[0,0,0];c.props.spatula.s=[0,0,0];c.props.plate.s=!collected?[1,1,1]:[0,0,0];c.head.r[1]=s===1&&!app?.3*wave(time,.3,4):.02;c.arms[1].shoulder.r[2]+=s===1&&!app?.25*wave(time,.2,3.5):0;
   pose(m,s===1&&!app?t:12,app?'calm':'concerned');m.selected=false;
   this.passFood.s=collected?[0,0,0]:[1,1,1];this.tableFood.s=served?[1,1,1]:[0,0,0];
   this.guests.forEach((a,i)=>{a.base=a.home.slice();pose(a,i===0&&s===2?t:12,app?(served?'reassured':'calm'):(s===2?'disappointed':'uncertain'));a.selected=this.state.speaker==='guest'&&i===0;});
   const narrow=this.clientWidth<540,ratio=this.clientWidth/Math.max(1,this.clientHeight),focus=s===0?-5.15:s===1?(app?-1.8:-5.0):4.1,wanted=narrow?focus:0;
   if(this.narrowLast!==narrow){this.cameraFrom=wanted;this.narrowLast=narrow;}
   this.cameraX=reduce?wanted:(this.cameraFrom||0)+(wanted-(this.cameraFrom||0))*smooth(time/.85);
   const span=narrow?Math.max(6.7,6.7/ratio):Math.max(7.1,17.2/ratio);
   this.renderer.render(this.scene,[this.cameraX,6.6,19.5],[this.cameraX,narrow?2.0:1.75,-.8],span);
   if(served&&this.beat!=='served'){this.beat='served';this.dispatchEvent(new CustomEvent('handover:beat',{detail:{beat:'served'}}));}
   this.positionDialogue();
  }
  positionDialogue(){
   if(!this.renderer||!this.bubble||!this.state)return;
   const {speaker,dialogue}=this.state,a=speaker==='guest'?this.guests[0]:this.actors[speaker],anchor=this.renderer.actorAnchors.get(a);
   if(!anchor||!dialogue){this.bubble.hidden=true;return;}
   const label=this.bubble.querySelector('.dialogue-speaker'),text=this.bubble.querySelector('.dialogue-words'),name={chef:'Chef',waiter:'Arjun · Waiter',guest:'Guest',manager:'Floor manager'}[speaker];
   if(label.textContent!==name)label.textContent=name;if(text.textContent!==dialogue)text.textContent=dialogue;this.bubble.dataset.speaker=speaker;this.bubble.hidden=false;
   const width=this.bubble.offsetWidth,height=this.bubble.offsetHeight,left=Math.max(12,Math.min(this.clientWidth-width-12,anchor[0]-width/2)),top=Math.max(12,anchor[1]-height-15);
   this.bubble.style.transform=`translate3d(${left.toFixed(2)}px,${top.toFixed(2)}px,0)`;this.bubble.style.setProperty('--tail-x',Math.max(14,Math.min(width-14,anchor[0]-left))+'px');this.bubble.style.setProperty('--tail-length',Math.max(12,Math.min(32,anchor[1]-top-height))+'px');
  }
  tick(now=performance.now()){
   cancelAnimationFrame(this.frame);if(!this.visible||this.paused)return;
   const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!this.startedAt)this.startedAt=now-this.elapsed*1000;if(!reduce)this.elapsed=Math.max(0,(now-this.startedAt)/1000);this.last=now;this.dataset.actionState=reduce||this.elapsed>=5.8?'complete':'playing';
   if(!this.lastDraw||now-this.lastDraw>1000/30||reduce){this.draw();this.lastDraw=now;}
   if(!reduce&&this.elapsed<5.8)this.frame=requestAnimationFrame(t=>this.tick(t));
  }
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.observer?.disconnect();this.resize?.disconnect();}
 }

 customElements.define('handover-spotlight',HandoverSpotlight);
 customElements.define('service-character',ServiceCharacter);customElements.define('service-floor',ServiceFloor);
})();
