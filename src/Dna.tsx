import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

// Perspective projection of a double helix. All particles share one angular clock.
export function Dna() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = 0, height = 0, frame = 0, angle = 0, last = 0;
    const resize = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio, 1.7);
      canvas.width = width * dpr; canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    const points: {y:number; phase:number; radius:number; size:number; alpha:number}[] = [];
    const random = (i:number) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
    for (let i = 0; i < 2500; i++) {
      const y = random(i) * 2 - 1;
      const strand = i % 2 * Math.PI;
      points.push({y, phase: y * Math.PI * 2.1 + strand + (random(i+7)-.5)*.18, radius: 1+(random(i+19)-.5)*.15, size: .6+random(i+31)*1.6, alpha:.45+random(i+40)*.5});
    }
    for (let rung = 0; rung < 33; rung++) for (let j = 0; j < 28; j++) {
      const y = rung / 32 * 2 - 1;
      points.push({y, phase:y*Math.PI*2.1, radius:j/27*2-1, size: .65, alpha:.48});
    }
    for (let i=0;i<240;i++) points.push({y:random(i+4000)*2-1,phase:random(i+5000)*Math.PI*2,radius:1.15+random(i+6000)*.7,size:.4+random(i+7000),alpha:.12});
    const draw = (now:number) => {
      if (!document.hidden) {
        if (!reduced && last) angle += Math.min(now-last,50)*.00019;
        ctx.clearRect(0,0,width,height);
        const radius = Math.min(width*.25,145), length = height*.52;
        const projected = points.map(p=>{
          const phase=p.phase+angle, z=Math.sin(phase)*p.radius;
          const perspective=1/(1-z*.14);
          const x=Math.cos(phase)*p.radius*radius*perspective;
          const y=p.y*length;
          return {x:width*.53+x*.966-y*.259,y:height*.5+x*.259+y*.966,z,size:p.size*perspective,alpha:p.alpha};
        }).sort((a,b)=>a.z-b.z);
        for(const p of projected){
          const depth=(p.z+2)/4;
          ctx.fillStyle=`rgba(${Math.round(6+depth*5)},${Math.round(105+depth*63)},${Math.round(70+depth*35)},${p.alpha*(.25+depth*.65)})`;
          ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
        }
      }
      last=now;
      if(!reduced) frame=requestAnimationFrame(draw);
    };
    draw(0);
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();};
  },[reduced]);
  return <div className="dna-backdrop" aria-hidden="true"><canvas ref={ref}/></div>;
}
