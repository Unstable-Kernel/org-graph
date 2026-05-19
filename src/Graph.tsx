import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { nodes, links, RepoNode } from './data';

const COLORS: Record<string, string> = {
  core: '#4ade80',
  behavior: '#60a5fa',
  infra: '#f59e0b',
  content: '#a78bfa',
  frontend: '#f87171',
};

const STATUS_LABEL: Record<string, string> = {
  active: 'Active Development',
  stable: 'Stable',
  wip: 'Work in Progress',
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  description: string;
  url: string;
  deployedUrl?: string;
  tech: string[];
  category: string;
  status: string;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  label: string;
  type: string;
}

export function Graph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<RepoNode | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.attr('width', width).attr('height', height);

    const simNodes: SimNode[] = nodes.map(n => ({ ...n }));
    const simLinks: SimLink[] = links.map(l => ({ source: l.source, target: l.target, label: l.label, type: l.type }));

    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id(d => d.id).distance(160))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(55));

    // Glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    filter.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic']).join('feMergeNode').attr('in', d => d);

    // Links
    const link = svg.append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', d => d.type === 'depends' ? '#4ade8066' : d.type === 'uses' ? '#60a5fa66' : '#a78bfa66')
      .attr('stroke-width', 1.5);

    // Nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(d3.drag<any, SimNode>()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('click', (_, d) => { setSelected(d as unknown as RepoNode); });

    // Outer ring
    node.append('circle')
      .attr('r', d => d.id === 'kernel' ? 32 : 24)
      .attr('fill', 'transparent')
      .attr('stroke', d => COLORS[d.category])
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    // Inner fill
    node.append('circle')
      .attr('r', d => d.id === 'kernel' ? 28 : 20)
      .attr('fill', d => COLORS[d.category] + '18')
      .attr('stroke', 'none');

    // Labels
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', d => d.id === 'kernel' ? '11px' : '10px')
      .attr('font-weight', '600')
      .attr('fill', d => COLORS[d.category])
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <svg ref={svgRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Header */}
      <div style={{ position: 'fixed', top: 24, left: 24, zIndex: 10 }}>
        <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, margin: 0 }}>
          Unstable Kernel
        </h1>
        <p style={{ color: '#888', fontSize: '12px', marginTop: 4 }}>
          Autonomous Intelligence Coordination Engine
        </p>
      </div>

      {/* Legend */}
      <div style={{ position: 'fixed', bottom: 24, left: 24, display: 'flex', gap: 14, fontSize: '11px', color: '#888', zIndex: 10 }}>
        {Object.entries(COLORS).map(([cat, color]) => (
          <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
            {cat}
          </span>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ position: 'fixed', top: 24, right: 24, display: 'flex', gap: 10, zIndex: 10 }}>
        <a href="https://unstable-kernel.github.io/visualization/" target="_blank" rel="noopener"
          style={{ padding: '6px 12px', background: '#4ade8020', border: '1px solid #4ade8040', borderRadius: 6, color: '#4ade80', fontSize: '11px', textDecoration: 'none' }}>
          Live Simulation
        </a>
        <a href="https://unstable-kernel.github.io/docs/" target="_blank" rel="noopener"
          style={{ padding: '6px 12px', background: '#a78bfa20', border: '1px solid #a78bfa40', borderRadius: 6, color: '#a78bfa', fontSize: '11px', textDecoration: 'none' }}>
          Documentation
        </a>
        <a href="https://github.com/Unstable-Kernel" target="_blank" rel="noopener"
          style={{ padding: '6px 12px', background: '#ffffff10', border: '1px solid #ffffff20', borderRadius: 6, color: '#ccc', fontSize: '11px', textDecoration: 'none' }}>
          GitHub
        </a>
      </div>

      {/* Info Panel */}
      {selected && (
        <div style={{
          position: 'fixed', right: 24, top: 80, width: 300,
          background: 'rgba(10, 14, 20, 0.95)', border: `1px solid ${COLORS[selected.category]}40`,
          borderRadius: 12, padding: 20, zIndex: 20, backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: COLORS[selected.category], fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {selected.label}
            </h2>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px' }}>x</button>
          </div>

          <p style={{ color: '#aaa', fontSize: '12px', marginTop: 10, lineHeight: 1.5 }}>
            {selected.description}
          </p>

          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {selected.tech.map(t => (
              <span key={t} style={{ padding: '2px 8px', background: '#ffffff10', borderRadius: 4, fontSize: '10px', color: '#ccc' }}>{t}</span>
            ))}
          </div>

          <div style={{ marginTop: 10, fontSize: '10px', color: '#888' }}>
            Status: {STATUS_LABEL[selected.status] || selected.status}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <a href={selected.url} target="_blank" rel="noopener"
              style={{ padding: '5px 10px', background: '#ffffff10', border: '1px solid #ffffff20', borderRadius: 6, color: '#ccc', fontSize: '11px', textDecoration: 'none' }}>
              Source
            </a>
            {selected.deployedUrl && (
              <a href={selected.deployedUrl} target="_blank" rel="noopener"
                style={{ padding: '5px 10px', background: COLORS[selected.category] + '20', border: `1px solid ${COLORS[selected.category]}40`, borderRadius: 6, color: COLORS[selected.category], fontSize: '11px', textDecoration: 'none' }}>
                Live Site
              </a>
            )}
          </div>
        </div>
      )}

      {/* Hint */}
      {!selected && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, color: '#555', fontSize: '11px', zIndex: 10 }}>
          Click a node to see details. Drag to rearrange.
        </div>
      )}
    </div>
  );
}
