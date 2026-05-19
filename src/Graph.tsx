import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { nodes, links, RepoNode } from './data';

const COLORS: Record<string, string> = {
  core: '#38bd7e',
  behavior: '#6366f1',
  infra: '#f59e0b',
  content: '#a78bfa',
  frontend: '#ef4444',
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string; label: string; description: string; url: string;
  deployedUrl?: string; tech: string[]; category: string; status: string;
}
interface SimLink extends d3.SimulationLinkDatum<SimNode> { label: string; type: string; }

export function Graph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<RepoNode | null>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * 2; canvas.height = h * 2;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.scale(2, 2);

    const simNodes: SimNode[] = nodes.map(n => ({ ...n }));
    const simLinks: SimLink[] = links.map(l => ({ source: l.source, target: l.target, label: l.label, type: l.type }));
    nodesRef.current = simNodes;
    linksRef.current = simLinks;

    const sim = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id(d => d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-900))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius(60));
    simRef.current = sim;

    // Animation loop
    let animId: number;
    const draw = () => {
      frameRef.current++;
      const t = frameRef.current * 0.02;
      ctx.clearRect(0, 0, w, h);

      // Draw links with pulse animation
      for (const link of simLinks) {
        const s = link.source as SimNode;
        const e = link.target as SimNode;
        if (!s.x || !e.x) continue;
        const color = link.type === 'depends' ? '#38bd7e' : link.type === 'uses' ? '#6366f1' : '#a78bfa';
        const pulse = 0.15 + Math.sin(t + (s.x! * 0.01)) * 0.08;
        ctx.beginPath();
        ctx.moveTo(s.x!, s.y!);
        ctx.lineTo(e.x!, e.y!);
        ctx.strokeStyle = color;
        ctx.globalAlpha = pulse;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Traveling particle along edge
        const progress = (Math.sin(t * 0.8 + (s.x! * 0.005)) + 1) / 2;
        const px = s.x! + (e.x! - s.x!) * progress;
        const py = s.y! + (e.y! - s.y!) * progress;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw nodes
      for (const node of simNodes) {
        if (!node.x) continue;
        const color = COLORS[node.category] || '#888';
        const r = node.id === 'kernel' ? 30 : 22;
        const breathe = 1 + Math.sin(t + node.x! * 0.01) * 0.04;

        // Outer glow
        const grad = ctx.createRadialGradient(node.x!, node.y!, r * 0.5, node.x!, node.y!, r * 2.5 * breathe);
        grad.addColorStop(0, color + '20');
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, r * 2.5 * breathe, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Ring
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, r * breathe, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, r * 0.7 * breathe, 0, Math.PI * 2);
        ctx.fillStyle = color + '12';
        ctx.fill();

        // Label
        ctx.font = `${node.id === 'kernel' ? '600 12px' : '500 10px'} Syne, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x!, node.y!);
      }

      animId = requestAnimationFrame(draw);
    };
    sim.on('tick', () => {});
    draw();

    // Click detection
    const handleClick = (ev: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      for (const node of simNodes) {
        if (!node.x) continue;
        const dx = mx - node.x!;
        const dy = my - node.y!;
        if (dx * dx + dy * dy < 900) {
          setSelected(node as unknown as RepoNode);
          return;
        }
      }
      setSelected(null);
    };
    canvas.addEventListener('click', handleClick);

    // Drag
    let dragging: SimNode | null = null;
    canvas.addEventListener('mousedown', (ev) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      for (const node of simNodes) {
        if (!node.x) continue;
        if ((mx - node.x!) ** 2 + (my - node.y!) ** 2 < 900) {
          dragging = node;
          sim.alphaTarget(0.3).restart();
          break;
        }
      }
    });
    canvas.addEventListener('mousemove', (ev) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      dragging.fx = ev.clientX - rect.left;
      dragging.fy = ev.clientY - rect.top;
    });
    canvas.addEventListener('mouseup', () => {
      if (dragging) { dragging.fx = null; dragging.fy = null; dragging = null; sim.alphaTarget(0); }
    });

    const handleResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * 2; canvas.height = h * 2;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.scale(2, 2);
      sim.force('center', d3.forceCenter(w / 2, h / 2));
      sim.alpha(0.3).restart();
    };
    window.addEventListener('resize', handleResize);

    return () => { cancelAnimationFrame(animId); sim.stop(); canvas.removeEventListener('click', handleClick); window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />

      {/* Header */}
      <div style={{ position: 'fixed', top: 28, left: 32, zIndex: 10, animation: 'fadeIn 1s ease', display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/org-graph/logo.png" alt="Unstable Kernel" style={{ height: 32, opacity: 0.9 }} />
        <div>
          <h1 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            UNSTABLE KERNEL
          </h1>
          <p style={{ color: '#475569', fontSize: '10px', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
            // system dependency map
          </p>
        </div>
      </div>

      {/* Nav */}
      <div style={{ position: 'fixed', top: 28, right: 32, display: 'flex', gap: 10, zIndex: 10, animation: 'fadeIn 1s ease 0.2s both' }}>
        <a href="https://unstable-kernel.github.io/visualization/" target="_blank" rel="noopener"
          style={{ padding: '7px 14px', background: 'rgba(56,189,126,0.08)', border: '1px solid rgba(56,189,126,0.2)', borderRadius: 6, color: '#38bd7e', fontSize: '11px', textDecoration: 'none', fontWeight: 600 }}>
          Simulation
        </a>
        <a href="https://unstable-kernel.github.io/docs/" target="_blank" rel="noopener"
          style={{ padding: '7px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, color: '#6366f1', fontSize: '11px', textDecoration: 'none', fontWeight: 600 }}>
          Docs
        </a>
        <a href="https://github.com/Unstable-Kernel" target="_blank" rel="noopener"
          style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#94a3b8', fontSize: '11px', textDecoration: 'none', fontWeight: 600 }}>
          GitHub
        </a>
      </div>

      {/* Legend */}
      <div style={{ position: 'fixed', bottom: 28, left: 32, display: 'flex', gap: 16, fontSize: '10px', color: '#475569', zIndex: 10, fontFamily: "'JetBrains Mono', monospace" }}>
        {Object.entries(COLORS).map(([cat, color]) => (
          <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            {cat}
          </span>
        ))}
      </div>

      {/* Info Panel */}
      {selected && (
        <div style={{
          position: 'fixed', right: 32, top: 80, width: 300,
          background: 'rgba(3, 5, 8, 0.95)', border: `1px solid ${COLORS[selected.category]}22`,
          borderRadius: 14, padding: 24, zIndex: 20, backdropFilter: 'blur(16px)',
          animation: 'slideIn 0.3s ease',
        }}>
          <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } } @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: COLORS[selected.category], fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              {selected.label}
            </h2>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '18px', fontFamily: 'monospace' }}>x</button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: 12, lineHeight: 1.7 }}>{selected.description}</p>
          <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {selected.tech.map(t => (
              <span key={t} style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, fontSize: '10px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>{t}</span>
            ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <a href={selected.url} target="_blank" rel="noopener"
              style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#94a3b8', fontSize: '11px', textDecoration: 'none', fontWeight: 600 }}>
              Source
            </a>
            {selected.deployedUrl && (
              <a href={selected.deployedUrl} target="_blank" rel="noopener"
                style={{ padding: '6px 12px', background: COLORS[selected.category] + '12', border: `1px solid ${COLORS[selected.category]}30`, borderRadius: 6, color: COLORS[selected.category], fontSize: '11px', textDecoration: 'none', fontWeight: 600 }}>
                Live
              </a>
            )}
          </div>
        </div>
      )}

      {/* Hint */}
      {!selected && (
        <div style={{ position: 'fixed', bottom: 28, right: 32, color: '#334155', fontSize: '10px', zIndex: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          click node / drag to rearrange
        </div>
      )}
    </div>
  );
}
