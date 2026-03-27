// Moon — SVG crescent moon from Gemini's code, rendered into #moonContainer
(function() {
  const container = document.getElementById('moonContainer');
  if (!container) return;

  // Inject keyframes once
  if (!document.getElementById('moon-svg-styles')) {
    const style = document.createElement('style');
    style.id = 'moon-svg-styles';
    style.textContent = `
      @keyframes twinkle { 0%,100%{opacity:0.15} 50%{opacity:0.75} }
      @keyframes twinkle2 { 0%,100%{opacity:0.1} 40%{opacity:0.6} 80%{opacity:0.15} }
      @keyframes twinkle3 { 0%,100%{opacity:0.2} 30%{opacity:0.85} 60%{opacity:0.1} }
      @keyframes driftUp { 0%{transform:translateY(0);opacity:0.35} 100%{transform:translateY(-18px);opacity:0} }
      @keyframes moonFade { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
      @keyframes haloBreath { 0%,100%{opacity:0.012} 50%{opacity:0.04} }
      @keyframes haloBreath2 { 0%,100%{opacity:0.018} 50%{opacity:0.055} }
    `;
    document.head.appendChild(style);
  }

  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const [k,v] of Object.entries(attrs||{})) e.setAttribute(k,v);
    return e;
  }

  const svg = el('svg', { width:'100%', height:'100%', viewBox:'0 0 680 680', xmlns:NS });
  container.appendChild(svg);

  const defs = el('defs');
  svg.appendChild(defs);

  const R1 = 180, R2 = 145;
  const cx1 = 340, cy1 = 340;
  const cx2 = 400, cy2 = 340;
  const dd = cx2 - cx1;
  const a = (R1*R1 - R2*R2 + dd*dd) / (2*dd);
  const h = Math.sqrt(R1*R1 - a*a);
  const ix = cx1 + a;
  const iy1 = cy1 - h;
  const iy2 = cy1 + h;
  const crescentD = `M ${ix} ${iy1} A ${R1} ${R1} 0 1 0 ${ix} ${iy2} A ${R2} ${R2} 0 1 1 ${ix} ${iy1} Z`;

  const grad = el('radialGradient', { id:'moonGrad', cx:'0.35', cy:'0.5', r:'0.65', fx:'0.25', fy:'0.5' });
  [
    { off:'0%', color:'#f5e8c0' },
    { off:'25%', color:'#dbb855' },
    { off:'55%', color:'#c89638' },
    { off:'80%', color:'#b07828' },
    { off:'100%', color:'#96661e' },
  ].forEach(s => {
    grad.appendChild(el('stop', { offset:s.off, 'stop-color':s.color }));
  });
  defs.appendChild(grad);

  const mainG = el('g');
  mainG.style.animation = 'moonFade 2s ease-out both';
  mainG.style.transformOrigin = '340px 340px';
  svg.appendChild(mainG);

  const tiltG = el('g', { transform:'rotate(-45 340 340)' });
  mainG.appendChild(tiltG);

  // Glow
  const h1 = el('ellipse', { cx:'340', cy:'340', rx:'260', ry:'260', fill:'#d4a844', opacity:'0.012' });
  h1.style.animation = 'haloBreath 6s ease-in-out infinite';
  tiltG.appendChild(h1);
  const h2 = el('ellipse', { cx:'340', cy:'340', rx:'220', ry:'220', fill:'#dbb855', opacity:'0.018' });
  h2.style.animation = 'haloBreath2 5s ease-in-out 1s infinite';
  tiltG.appendChild(h2);

  // Moon crescent
  tiltG.appendChild(el('path', { d: crescentD, fill:'url(#moonGrad)' }));

  // Stars
  const particleLayer = el('g');
  mainG.appendChild(particleLayer);

  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 220 + Math.random() * 120;
    const x = 340 + Math.cos(angle) * dist * (0.9+Math.random()*0.3);
    const y = 340 + Math.sin(angle) * dist * (0.9+Math.random()*0.3);
    if (x < 15 || x > 665 || y < 15 || y > 665) continue;
    const r = 0.3 + Math.random() * 1.6;
    const bright = Math.random();
    const fill = bright>0.6?'#f5e8c0':bright>0.3?'#dbb855':'#c8a050';
    const anims = ['twinkle','twinkle2','twinkle3'];
    const dot = el('circle', { cx:String(x), cy:String(y), r:String(r), fill, opacity:'0' });
    dot.dataset.anim = `${anims[Math.floor(Math.random()*3)]} ${2+Math.random()*4}s ease-in-out ${Math.random()*5}s infinite`;
    particleLayer.appendChild(dot);
  }

  [{x:140,y:100,s:6},{x:530,y:160,s:5},{x:570,y:400,s:4.5},
  {x:120,y:480,s:5},{x:490,y:560,s:4},{x:180,y:220,s:3.5},
  {x:560,y:260,s:3},{x:450,y:90,s:4},{x:85,y:350,s:3.5},
  {x:600,y:520,s:3},{x:250,y:585,s:4},{x:430,y:600,s:3},
  {x:590,y:130,s:3},{x:150,y:580,s:3.5},{x:500,y:340,s:3}].forEach((st,i) => {
    const sg = el('g');
    sg.style.opacity = '0';
    sg.dataset.anim = `twinkle${1+(i%3)} ${3+Math.random()*3}s ease-in-out ${Math.random()*4}s infinite`;
    sg.appendChild(el('line', { x1:st.x, y1:st.y-st.s, x2:st.x, y2:st.y+st.s, stroke:'#f0dca0', 'stroke-width':'0.8', 'stroke-linecap':'round', opacity:'0.8' }));
    sg.appendChild(el('line', { x1:st.x-st.s, y1:st.y, x2:st.x+st.s, y2:st.y, stroke:'#f0dca0', 'stroke-width':'0.8', 'stroke-linecap':'round', opacity:'0.8' }));
    sg.appendChild(el('circle', { cx:st.x, cy:st.y, r:'1.2', fill:'#f5e8c0', opacity:'0.9' }));
    particleLayer.appendChild(sg);
  });

  for (let i = 0; i < 15; i++) {
    const x = 160+Math.random()*200, y = 200+Math.random()*300;
    const dot = el('circle', { cx:String(x), cy:String(y), r:String(0.4+Math.random()*0.7), fill:'#f5e8c0', opacity:'0' });
    dot.dataset.driftAnim = `driftUp ${4+Math.random()*5}s ease-in ${Math.random()*6}s infinite`;
    particleLayer.appendChild(dot);
  }

  setTimeout(() => {
    let dl = 0;
    particleLayer.querySelectorAll('circle').forEach(p => {
      setTimeout(() => {
        p.style.opacity = '';
        if (p.dataset.anim) p.style.animation = p.dataset.anim;
        if (p.dataset.driftAnim) p.style.animation = p.dataset.driftAnim;
      }, dl);
      dl += 18;
    });
    particleLayer.querySelectorAll('g').forEach((s,i) => {
      setTimeout(() => {
        s.style.opacity = '';
        if (s.dataset.anim) s.style.animation = s.dataset.anim;
      }, 200+i*70);
    });
  }, 900);
})();
