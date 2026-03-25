import { useEffect, useRef, useCallback } from 'react';

interface AlHrsaniLabsAnimationProps {
  width?: number;
  height?: number;
  className?: string;
}

interface Particle {
  type: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  hue: string;
  grav?: number;
}

interface Word {
  text: string;
  color: string;
  x: number;
  y: number;
  vy: number;
  ay: number;
  rot: number;
  rotV: number;
  opacity: number;
  landed: boolean;
  age: number;
  done: boolean;
  fadeDelay: number;
  size: number;
  mode: string;
  rollDir: number;
  rollSpd: number;
  driftVx: number;
  evVy: number;
}

const FONT = "'Courier New',monospace";
const WORD_LIST = ['تطوير', 'برمجة', 'نشر', 'تصميم', 'كود', 'إبداع', 'ابتكار', 'حلول'];
const WORD_COLS = ['#FF6B00', '#1B8FFF', '#00C853', '#FFD600', '#FF2D78', '#00E5FF', '#C62BFF', '#FF9500'];
const MODES = ['roll', 'roll', 'drift', 'evaporate', 'scatter', 'flip', 'roll', 'drift'];

function easeOut(v: number) { return 1 - Math.pow(1 - v, 3); }

const AlHrsaniLabsAnimation = ({ width = 660, height = 480, className = '' }: AlHrsaniLabsAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const stateRef = useRef({ t: 0, phase: 0, phaseStart: 0, gearAngle: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const wordsRef = useRef<Word[]>([]);

  const W = Math.min(660, width);
  const H = height;
  const CX = W / 2;
  const GEAR1X = W / 2 - 58;
  const GEAR2X = W / 2 + 8;
  const GEARY = 52;
  const TEXT_Y = 172;
  const LABS_Y = 218;
  const GROUND_Y = 305;
  const TORCH_X = W / 2 + 92;
  const TORCH_TOP = TEXT_Y - 56;

  const spawnFlame = useCallback((x: number, y: number, n: number, big: boolean) => {
    for (let i = 0; i < n; i++) {
      const spd = big ? (1.6 + Math.random() * 3) : (0.8 + Math.random() * 2);
      particlesRef.current.push({
        type: 'flame', x: x + (Math.random() - .5) * (big ? 10 : 5), y,
        vx: (Math.random() - .5) * 1.3, vy: -spd,
        life: 1, decay: (big ? .02 : .03) + Math.random() * .012,
        size: big ? (6 + Math.random() * 11) : (2 + Math.random() * 5),
        hue: Math.random() > .6 ? '#FFD600' : Math.random() > .5 ? '#FF6B00' : '#FF4500'
      });
    }
  }, []);

  const spawnEmber = useCallback((x: number, y: number) => {
    for (let i = 0; i < 2; i++) {
      const a = -(Math.PI * .25 + Math.random() * Math.PI * .5), s = 1 + Math.random() * 2.5;
      particlesRef.current.push({
        type: 'ember', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 1, decay: .025 + Math.random() * .015, size: 1 + Math.random() * 2.5, hue: '#FF9500', grav: .038
      });
    }
  }, []);

  const spawnSpark = useCallback((x: number, y: number) => {
    for (let i = 0; i < 4; i++) {
      const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 3;
      particlesRef.current.push({
        type: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5,
        life: 1, decay: .055 + Math.random() * .03, size: 1 + Math.random() * 2, hue: '#FFD600'
      });
    }
  }, []);

  const spawnWord = useCallback(() => {
    if (wordsRef.current.filter(w => !w.done).length >= 4) return;
    const idx = Math.floor(Math.random() * WORD_LIST.length);
    wordsRef.current.push({
      text: WORD_LIST[idx], color: WORD_COLS[idx],
      x: GEAR1X + 33 + (Math.random() - .5) * 40, y: GEARY + 30,
      vy: 0, ay: .18 + Math.random() * .15,
      rot: (Math.random() - .5) * .5, rotV: (Math.random() - .5) * .06,
      opacity: 1, landed: false, age: 0, done: false,
      fadeDelay: 55 + Math.random() * 65,
      size: 13 + Math.random() * 5, mode: MODES[Math.floor(Math.random() * MODES.length)],
      rollDir: Math.random() > .5 ? 1 : -1, rollSpd: 0.9 + Math.random() * 1.4,
      driftVx: (Math.random() > .5 ? 1 : -1) * (0.7 + Math.random() * .9),
      evVy: 0
    });
  }, [GEAR1X, GEARY]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx2 = cv.getContext('2d');
    if (!cx2) return;

    const state = stateRef.current;
    state.t = 0; state.phase = 0; state.phaseStart = 0; state.gearAngle = 0;
    particlesRef.current = [];
    wordsRef.current = [];

    function drawGear(gx: number, gy: number, r: number, teeth: number, ang: number, col: string, alpha: number) {
      cx2!.save(); cx2!.globalAlpha = alpha; cx2!.translate(gx, gy); cx2!.rotate(ang);
      const ti = r * .82, tr = r * 1.22, step = Math.PI * 2 / teeth;
      cx2!.beginPath();
      for (let i = 0; i < teeth; i++) {
        const a0 = step * i - step * .2, a1 = step * i + step * .2,
          a2 = step * i + step * .5 - step * .2, a3 = step * i + step * .5 + step * .2;
        cx2!.lineTo(Math.cos(a0) * ti, Math.sin(a0) * ti); cx2!.lineTo(Math.cos(a0) * tr, Math.sin(a0) * tr);
        cx2!.lineTo(Math.cos(a1) * tr, Math.sin(a1) * tr); cx2!.lineTo(Math.cos(a1) * ti, Math.sin(a1) * ti);
        cx2!.lineTo(Math.cos(a2) * ti, Math.sin(a2) * ti); cx2!.lineTo(Math.cos(a3) * ti, Math.sin(a3) * ti);
      }
      cx2!.closePath(); cx2!.strokeStyle = col; cx2!.lineWidth = 2; cx2!.stroke();
      [r * .55, r * .3].forEach(ri => {
        cx2!.beginPath(); cx2!.arc(0, 0, ri, 0, Math.PI * 2);
        cx2!.strokeStyle = col; cx2!.lineWidth = 1; cx2!.stroke();
      });
      cx2!.beginPath(); cx2!.arc(0, 0, r * .14, 0, Math.PI * 2);
      cx2!.fillStyle = col; cx2!.globalAlpha = alpha * .5; cx2!.fill();
      cx2!.restore();
    }

    function drawTorch(tx: number, ty: number, flameT: number) {
      cx2!.save(); cx2!.translate(tx, ty);
      const shH = 42, shW = 8;
      const sg = cx2!.createLinearGradient(-shW / 2, 0, shW / 2, shH);
      sg.addColorStop(0, '#555'); sg.addColorStop(.2, '#ccc'); sg.addColorStop(.5, '#eee'); sg.addColorStop(.8, '#aaa'); sg.addColorStop(1, '#444');
      cx2!.beginPath();
      cx2!.moveTo(-shW / 2 + 2, shH); cx2!.lineTo(-shW / 2, shH - 3); cx2!.lineTo(-shW / 2, 3);
      cx2!.quadraticCurveTo(-shW / 2, -2, 0, -3); cx2!.quadraticCurveTo(shW / 2, -2, shW / 2, 3);
      cx2!.lineTo(shW / 2, shH - 3); cx2!.lineTo(shW / 2 - 2, shH);
      cx2!.closePath(); cx2!.fillStyle = sg; cx2!.fill();

      [11, 22, 33].forEach(ry => {
        cx2!.beginPath(); cx2!.ellipse(0, ry, shW / 2 + 1, 2, 0, 0, Math.PI * 2);
        const rg = cx2!.createLinearGradient(-shW / 2, 0, shW / 2, 0);
        rg.addColorStop(0, '#777'); rg.addColorStop(.5, '#fff'); rg.addColorStop(1, '#666');
        cx2!.fillStyle = rg; cx2!.fill();
      });

      cx2!.beginPath();
      cx2!.moveTo(-shW / 2, 0); cx2!.bezierCurveTo(-shW / 2, -4, -15, -9, -15, -13);
      cx2!.lineTo(-11, -17); cx2!.lineTo(-7, -13); cx2!.bezierCurveTo(-5, -9, -3, -6, 0, -5);
      cx2!.bezierCurveTo(3, -6, 5, -9, 7, -13); cx2!.lineTo(11, -17); cx2!.lineTo(15, -13);
      cx2!.bezierCurveTo(15, -9, shW / 2, -4, shW / 2, 0);
      cx2!.closePath();
      const cg = cx2!.createLinearGradient(-15, -17, 15, 0);
      cg.addColorStop(0, '#999'); cg.addColorStop(.4, '#eee'); cg.addColorStop(1, '#555');
      cx2!.fillStyle = cg; cx2!.fill();

      cx2!.beginPath();
      cx2!.moveTo(-shW / 2, shH); cx2!.lineTo(-shW / 2 - 4, shH + 11); cx2!.lineTo(shW / 2 + 4, shH + 11); cx2!.lineTo(shW / 2, shH);
      cx2!.closePath(); cx2!.fillStyle = '#333'; cx2!.fill();

      if (flameT > 0) {
        const t = state.t;
        const fw = (t * .058) % (Math.PI * 2), fw2 = (t * .04) % (Math.PI * 2), fw3 = (t * .075) % (Math.PI * 2);
        for (let layer = 0; layer < 3; layer++) {
          const wobX = Math.sin(fw + layer * 1.1) * 2.5 * flameT;
          const wobX2 = Math.sin(fw2 + layer * .9) * 1.5 * flameT;
          const fh = (24 + layer * 3) * flameT, fw_ = 8 - layer * 1.2;
          cx2!.save(); cx2!.globalAlpha = (.72 - .18 * layer) * flameT;
          cx2!.beginPath();
          cx2!.moveTo(-fw_, -13);
          cx2!.bezierCurveTo(-fw_ - wobX, -13 - fh * .3, -fw_ * .3 + wobX2, -13 - fh * .65, wobX, -13 - fh);
          cx2!.bezierCurveTo(fw_ * .3 + wobX, -13 - fh * .65, fw_ + wobX2, -13 - fh * .3, fw_, -13);
          cx2!.closePath();
          const hues = ['#FF3D00', '#FF5500', '#FF6B00'], tops = ['#FF8C00', '#FF9500', '#FFB300'];
          const flg = cx2!.createLinearGradient(0, -13 - fh, 0, -13);
          flg.addColorStop(0, tops[layer] + '00'); flg.addColorStop(.35, tops[layer]); flg.addColorStop(1, hues[layer]);
          cx2!.fillStyle = flg; cx2!.fill(); cx2!.restore();
        }
        const wy = Math.sin(fw3) * 1.8 * flameT, fhM = 18 * flameT;
        cx2!.save(); cx2!.globalAlpha = .82 * flameT;
        cx2!.beginPath();
        cx2!.moveTo(-5, -13);
        cx2!.bezierCurveTo(-5 - wy, -13 - fhM * .35, -2.5 + wy, -13 - fhM * .72, wy, -13 - fhM);
        cx2!.bezierCurveTo(2.5 + wy, -13 - fhM * .72, 5 - wy, -13 - fhM * .35, 5, -13);
        cx2!.closePath();
        const mg = cx2!.createLinearGradient(0, -13 - fhM, 0, -13);
        mg.addColorStop(0, '#FFEE5800'); mg.addColorStop(.4, '#FFD600'); mg.addColorStop(1, '#FF8C00');
        cx2!.fillStyle = mg; cx2!.fill(); cx2!.restore();

        const wy2 = Math.sin(fw2 + 1) * 1.2 * flameT, fhC = 11 * flameT;
        cx2!.save(); cx2!.globalAlpha = .88 * flameT;
        cx2!.beginPath();
        cx2!.moveTo(-3, -13);
        cx2!.bezierCurveTo(-2 + wy2, -13 - fhC * .55, 2 - wy2, -13 - fhC * .85, wy2, -13 - fhC);
        cx2!.bezierCurveTo(2 - wy2, -13 - fhC * .85, 2 + wy2, -13 - fhC * .55, 3, -13);
        cx2!.closePath();
        const wg = cx2!.createLinearGradient(0, -13 - fhC, 0, -13);
        wg.addColorStop(0, '#FFFFFF00'); wg.addColorStop(.5, '#FFFDE7'); wg.addColorStop(1, '#FFD600');
        cx2!.fillStyle = wg; cx2!.fill(); cx2!.restore();
      }
      cx2!.restore();
    }

    function render() {
      cx2!.clearRect(0, 0, W, H);
      const elapsed = state.t - state.phaseStart;

      // Letters
      const letters = ['A', 'L', '-', 'H', 'R', 'S', 'A', 'N'];
      const lColors = ['#FF6B00', '#FF6B00', '#FF6B00', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'];
      const lX = [W / 2 - 252, W / 2 - 213, W / 2 - 178, W / 2 - 146, W / 2 - 103, W / 2 - 60, W / 2 - 18, W / 2 + 24];
      cx2!.font = `bold 56px ${FONT}`;
      letters.forEach((ch, i) => {
        const prog = Math.max(0, Math.min(1, (elapsed - i * 7) / 35));
        if (prog <= 0) return;
        const ep = easeOut(prog);
        const yNow = (TEXT_Y - 130) + (130) * ep + (prog < 1 ? Math.sin(prog * Math.PI) * 9 * (1 - prog) : 0);
        cx2!.save(); cx2!.globalAlpha = prog;
        if (lColors[i] === '#FFFFFF') { cx2!.shadowColor = '#FF6B00'; cx2!.shadowBlur = 14; }
        cx2!.fillStyle = lColors[i]; cx2!.fillText(ch, lX[i], yNow); cx2!.restore();
      });

      // Torch
      const torchDelay = 8 * 7 + 6;
      const torchProg = Math.max(0, Math.min(1, (elapsed - torchDelay) / 38));
      const torchFlame = state.phase >= 1 ? Math.min(1, elapsed / 40) : 0;
      if (torchProg > 0) {
        const yOff = (1 - easeOut(torchProg)) * (-120);
        cx2!.save(); cx2!.globalAlpha = torchProg; cx2!.translate(0, yOff);
        drawTorch(TORCH_X, TORCH_TOP, torchFlame);
        cx2!.restore();
        if (state.phase >= 1) {
          const tipX = TORCH_X, tipY = TORCH_TOP - 13 - 24 * torchFlame;
          if (Math.random() > .45) spawnFlame(tipX, tipY, 2, true);
          if (Math.random() > .82) spawnEmber(tipX + (Math.random() - .5) * 8, tipY + 4);
        }
      }

      // Underline
      const ulProg = Math.max(0, Math.min(1, (elapsed - 80) / 28));
      if (ulProg > 0) {
        const uw = 440 * ulProg;
        const ug = cx2!.createLinearGradient(CX - 220, 0, CX + 220, 0);
        ug.addColorStop(0, '#FF6B0000'); ug.addColorStop(.25, '#FF6B00');
        ug.addColorStop(.75, '#1B8FFF'); ug.addColorStop(1, '#1B8FFF00');
        cx2!.save(); cx2!.globalAlpha = ulProg; cx2!.fillStyle = ug; cx2!.fillRect(CX - uw / 2, TEXT_Y + 8, uw, 2.5); cx2!.restore();
      }

      // LABS
      const labsProg = Math.max(0, Math.min(1, (elapsed - 94) / 24));
      if (labsProg > 0) {
        cx2!.save(); cx2!.globalAlpha = labsProg; cx2!.font = `400 30px ${FONT}`;
        cx2!.strokeStyle = '#1B8FFF'; cx2!.lineWidth = 1.8;
        cx2!.strokeText('LABS', CX - 62, LABS_Y); cx2!.restore();
      }

      // Ground line
      const gl = Math.max(0, Math.min(1, (elapsed - 105) / 20));
      if (gl > 0) {
        cx2!.save(); cx2!.globalAlpha = .25 * gl;
        cx2!.strokeStyle = '#FF6B00'; cx2!.lineWidth = 1; cx2!.setLineDash([5, 7]);
        cx2!.beginPath(); cx2!.moveTo(55, GROUND_Y); cx2!.lineTo(W - 55, GROUND_Y); cx2!.stroke();
        cx2!.setLineDash([]); cx2!.restore();
      }

      // Gears
      if (state.phase >= 1) {
        const gp = Math.min(1, elapsed / 45);
        state.gearAngle += .019;
        drawGear(GEAR1X, GEARY, 34, 10, state.gearAngle, '#FF6B00', gp * .9);
        drawGear(GEAR2X, GEARY, 28, 8, -state.gearAngle * 1.214, '#1B8FFF', gp * .9);
        if (Math.random() > .9 && elapsed > 30) spawnWord();
      }

      // Particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.type === 'ember') { p.vy += (p.grav || 0); p.vx *= .98; }
        if (p.type === 'flame') { p.vy -= .04; p.vx *= .96; p.size *= .965; }
        const useGrad = p.type === 'flame' || p.type === 'ember';
        cx2!.save();
        cx2!.globalAlpha = p.life * (useGrad ? .65 : .9);
        if (useGrad) {
          const g = cx2!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          g.addColorStop(0, p.hue); g.addColorStop(1, p.hue + '00');
          cx2!.beginPath(); cx2!.arc(p.x, p.y, p.size, 0, Math.PI * 2); cx2!.fillStyle = g; cx2!.fill();
        } else {
          cx2!.fillStyle = p.hue; cx2!.beginPath(); cx2!.arc(p.x, p.y, p.size, 0, Math.PI * 2); cx2!.fill();
        }
        cx2!.restore();
      });

      // Words
      wordsRef.current.forEach(w => {
        w.age++;
        if (!w.landed) {
          w.vy += w.ay; w.y += w.vy; w.rot += w.rotV;
          if (w.y >= GROUND_Y) {
            w.y = GROUND_Y; w.landed = true;
            if (w.mode === 'roll' || w.mode === 'scatter') spawnSpark(w.x, GROUND_Y);
            if (w.mode === 'flip') w.rot = Math.PI + (Math.random() - .5) * .2;
          }
        } else {
          if (w.mode === 'roll') {
            w.x += w.rollDir * w.rollSpd; w.rot += w.rollDir * .07; w.rollSpd *= .993;
            if (w.x < 70 || w.x > W - 70) w.rollDir *= -1;
            if (w.age > w.fadeDelay + 20) w.opacity -= .011;
          } else if (w.mode === 'drift') {
            w.driftVx *= 1.015; w.x += w.driftVx; w.rot += w.driftVx * .012;
            if (w.age > w.fadeDelay) w.opacity -= .012;
          } else if (w.mode === 'evaporate') {
            w.evVy -= .038; w.y += w.evVy;
            w.x += Math.sin(w.age * .08) * 1.1;
            w.size *= 1.006; w.opacity -= .007; w.rot += .014;
          } else if (w.mode === 'scatter') {
            w.size += .45; w.opacity -= .014;
          } else if (w.mode === 'flip') {
            w.x += w.driftVx * .4;
            if (w.age > w.fadeDelay) { w.y += .5; w.opacity -= .010; }
          }
        }
        if (w.opacity <= 0) { w.done = true; return; }
        cx2!.save();
        cx2!.translate(w.x, w.y); cx2!.rotate(w.rot);
        cx2!.globalAlpha = Math.max(0, w.opacity);
        cx2!.font = `bold ${Math.max(6, w.size)}px ${FONT}`;
        cx2!.shadowColor = w.color; cx2!.shadowBlur = 10;
        cx2!.fillStyle = w.color; cx2!.textAlign = 'center';
        cx2!.fillText(w.text, 0, 0);
        cx2!.restore();
      });
      wordsRef.current = wordsRef.current.filter(w => !w.done);

      state.t++;
      if (state.phase === 0 && elapsed > 110) { state.phase = 1; state.phaseStart = state.t; }
      animRef.current = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [W, H, CX, GEAR1X, GEAR2X, GEARY, TEXT_Y, LABS_Y, GROUND_Y, TORCH_X, TORCH_TOP, spawnFlame, spawnEmber, spawnSpark, spawnWord]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className={className}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
};

export default AlHrsaniLabsAnimation;
