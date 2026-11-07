(() => {
  'use strict';
  const root = document.querySelector('#evaluation');
  if (!root) return;
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function renderVisitTimeline() {
    const x0=236,plot=856,at=t=>x0+plot*t/90;
    const rows=[['Order submitted','Original and app task timings'],['First drinks arrived','Original 27 · app 11.03'],['Starters served','Original 27–30 · app 19'],['Main course served','Same reported range in both'],['Second drinks','Original workflow · no order'],['Desserts','Guests asked to sit on the other side'],['Table handover','Next booking · final ten minutes']];
    let svg=`<svg viewBox="0 0 1150 424" role="img" aria-labelledby="visit-gantt-title visit-gantt-desc"><title id="visit-gantt-title">Reported service timings across a 90-minute dining window</title><desc id="visit-gantt-desc">Original workflow: order submission took 10 minutes, first drinks arrived at 27 minutes, and starters arrived between 27 and 30 minutes. App test: order submitted at 3.91 minutes, first drinks at 11.03 minutes, and starters at 19 minutes. Mains arrived at 37 to 40 minutes in both workflows. The original second-drinks entry is no order, so no arrival time is plotted. Guests were asked to sit on the other side for desserts in the final ten minutes as the table had another booking.</desc><defs><pattern id="reported-window-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M-2 2L2-2M0 7L7 0M5 9L9 5" stroke="#839889" stroke-width="1"/></pattern></defs>`;
    [0,15,30,45,60,75,90].forEach(t=>{svg+=`<line x1="${at(t)}" y1="35" x2="${at(t)}" y2="407" class="gantt-grid"/><text x="${at(t)}" y="21" text-anchor="middle" class="gantt-axis">${t}</text>`;});
    rows.forEach(([name,source],i)=>{const y=62+i*51;svg+=`<line x1="0" y1="${y+31}" x2="1110" y2="${y+31}" class="gantt-row-line"/><text x="0" y="${y}" class="gantt-row-name">${name}</text><text x="0" y="${y+17}" class="gantt-row-source">${source}</text>`;});
    const bar=(start,end,y,kind,height=10)=>`<rect x="${at(start)}" y="${y}" width="${at(end)-at(start)}" height="${height}" rx="3" class="gantt-${kind}"/>`;
    const point=(time,y,kind,label)=>`<circle cx="${at(time)}" cy="${y}" r="5" class="gantt-${kind}"/><text x="${at(time)+12}" y="${y+5}" class="gantt-value ${kind==='app'?'app-value':''}">${label}</text>`;
    svg+=bar(0,10,51,'original')+bar(0,3.91,67,'app')+`<text x="${at(10)+9}" y="60" class="gantt-value">10</text><text x="${at(3.91)+9}" y="76" class="gantt-value app-value">3.91</text>`;
    svg+=point(27,105,'original','27')+point(11.03,123,'app','11.03');
    svg+=bar(27,30,153,'original')+`<text x="${at(30)+10}" y="162" class="gantt-value">27–30</text>`+point(19,177,'app','19');
    svg+=bar(37,40,204,'original')+bar(37,40,220,'app')+`<text x="${at(40)+12}" y="221" class="gantt-value">37–40</text>`;
    svg+=`<text x="${at(0)}" y="271" class="gantt-value">No order</text>`;
    svg+=bar(80,90,304,'window',22)+`<text x="${at(85)}" y="320" class="gantt-value" text-anchor="middle">Move</text>`;
    svg+=`<rect x="${at(80)}" y="355" width="${at(90)-at(80)}" height="22" rx="3" class="gantt-relocation"/><text x="${at(85)}" y="371" class="gantt-value" text-anchor="middle">Final 10 min</text></svg>`;
    $('#eval-journey').innerHTML=`<article class="visit-timeline"><header><span class="eval-label">The full dining window</span><h3>Course timing and the final table handover.</h3><p>Mains stayed at <strong>37–40 minutes</strong> in both workflows because guests needed to finish their starters.</p></header><div class="gantt-legend"><span><i class="gantt-key-original"></i>Original service</span><span><i class="gantt-key-app"></i>App-test timing</span><span><i class="gantt-key-window"></i>Reported window</span><small>Minutes · reported timings</small></div><div class="visit-gantt-scroll" tabindex="0" aria-label="Service Gantt chart. Scroll horizontally on smaller screens.">${svg}</div><div class="visit-service-insights"><p><strong>Guest pace stays with the guest.</strong>Mains followed the same 37–40-minute window; the app did not change how long guests needed to enjoy starters.</p><p><strong>The final handover matters.</strong>The second-drinks entry was “No order”, and guests were asked to sit on the other side for desserts.</p></div><details class="visit-context"><summary>Read the service context</summary><p>In the original workflow, first drinks arrived at 27 minutes and starters at 27–30 minutes. In the app test, first drinks arrived at 11.03 minutes and starters at 19 minutes. The second-drinks entry in the original record is “No order”, so it has no plotted arrival time. Guests were asked to sit on the other side for desserts as the table needed to be prepared for another booking.</p><p>These are designer-reported timings and service recollections. The final-ten-minute window follows the 90-minute booking described in my observations. Order task timings and visit milestones are presented together for context; a common start point, sample size and matched test conditions were not documented. No missing arrival times have been estimated.</p></details></article>`;
    $$('[data-eval-problem]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.evalProblem===3)));
  }

  const timingCases = [
    {
      title: 'Remove the gap between taking and submitting an order.',
      description: 'For a table of four, writing on paper and entering the same order again delayed the ticket reaching the preparing teams.',
      metric: 'Order submitted', before: '10', after: '3.91',
      impact: 'The prototype combines capture, review and submission at the table.',
      follow: 'Check that faster entry still preserves the correct seat, order and guest requirement.',
      visual: `<div class="eval-order-chart" role="img" aria-label="Original order submission: 3 minutes on paper plus 7 minutes confirming and re-entering, 10 minutes total. App submission: 3.91 minutes."><div class="eval-bar-row"><div><strong>Paper + system</strong><span>10 min</span></div><div class="eval-track"><span class="eval-paper" style="--bar-width:30%">3</span><span class="eval-reentry" style="--bar-width:70%">7</span></div></div><div class="eval-bar-row"><div><strong>App prototype</strong><span>3.91 min</span></div><div class="eval-track app-track"><span class="eval-app-bar" style="--bar-width:39.1%"></span></div></div><div class="eval-chart-key"><span><i class="paper-key"></i>Paper notes</span><span><i class="reentry-key"></i>Confirm + re-enter</span><span><i class="app-key"></i>Capture + send</span></div></div>`
    },
    {
      title: 'Make a missing ticket visible before the guest has to ask.',
      description: 'The waiter had taken the drinks order, but the bar had not received it. The manager had to reconstruct the handover.',
      metric: 'First drinks arrived', before: '27', after: '11.03',
      impact: 'Submission and order progress are visible, so the floor team can check the handover directly.',
      follow: 'Measure ticket receipt and drink arrival separately to establish where waiting time changes.',
      visual: `<div class="eval-milestone-visual"><span class="eval-label">What needs to stay connected</span><div class="eval-checkpoint-row"><div><i></i><strong>Order captured</strong><span>Waiter records it</span></div><div><i></i><strong>Ticket received</strong><span>Bar can act</span></div><div><i></i><strong>Drinks delivered</strong><span>Guest receives it</span></div></div><p>First drinks arrived at 27 minutes in the original workflow and 11.03 minutes in the app test. The original second-drinks entry is “No order”; no second-round arrival time is plotted.</p></div>`
    },
    {
      title: 'Give ready food a clear collector.',
      description: 'Dishes waited on the pass while chefs looked for the floor team. Collection was another task without a visible owner.',
      metric: 'Starters served', before: '27–30', after: '19',
      impact: 'Readiness and a named collection claim help waiters and runners fit a pickup around their other tables.',
      follow: 'Time readiness to collection and record reheat requests. Starter arrival alone does not show pass-wait time.',
      visual: `<div class="eval-milestone-visual"><span class="eval-label">What needs to stay connected</span><div class="eval-checkpoint-row"><div><i></i><strong>Ready</strong><span>Kitchen releases food</span></div><div><i></i><strong>Collecting</strong><span>A colleague owns it</span></div><div><i></i><strong>Served</strong><span>Guest receives it</span></div></div><p>Starters arrived at 27–30 minutes in the original workflow and 19 minutes in the app test. Mains stayed at 37–40 minutes in both workflows, following the guests’ pace. Arrival time does not establish how long food waited at the pass.</p></div>`
    }
  ];
  function renderEvaluation(index) {
    if(index===3){renderVisitTimeline();return;}
    const d = timingCases[index];
    $('#eval-journey').innerHTML = `<article class="eval-timing-card"><div class="eval-timing-copy"><span class="eval-label">${d.metric}</span><h3>${d.title}</h3><p>${d.description}</p><div class="eval-change-note"><span class="eval-label">What changed in the workflow</span><p>${d.impact}</p></div></div><div class="eval-data-view"><div class="eval-number-pair"><div class="eval-before-number"><span>Original workflow</span>${d.before ? `<strong class="${d.before.includes('–')?'eval-range-number':''}">${d.before}<small>min</small></strong>` : '<b class="eval-unrecorded">Arrival time<br>not recorded</b>'}</div><div class="eval-after-number"><span>App prototype</span><strong aria-label="${d.after} minutes" aria-live="off" data-timing-value="${d.after}">${d.after}<small>min</small></strong></div></div>${d.visual}</div><footer><strong>Next service check</strong><span>${d.follow}</span></footer></article>`;
    $$('[data-eval-problem]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.evalProblem === index)));
    animateValue($('[data-timing-value]'), Number(d.after), true);
  }
  function animateValue(el, value, unit = false) {
    if (reduce.matches) return;
    const decimals = Number.isInteger(value) ? 0 : 2;
    let start;
    function tick(time) {
      if (!el.isConnected) return;
      if (start === undefined) start = time;
      const p = Math.min(1, (time - start) / 700);
      el.innerHTML = (value * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + (unit ? '<small>min</small>' : '');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  $$('[data-eval-problem]').forEach(b => b.onclick = () => renderEvaluation(+b.dataset.evalProblem));
  new IntersectionObserver((entries, observer) => {
    if (!entries.some(e => e.isIntersecting)) return;
    $$('[data-recorded-value]').forEach(el => animateValue(el, +el.dataset.recordedValue));
    observer.disconnect();
  }, { threshold: .3 }).observe($('.eval-milestone-rail'));
  renderEvaluation(3);
})();
