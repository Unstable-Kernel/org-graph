import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { nodes, links, RepoLink } from './data';

const CATEGORY_COLORS: Record<string, string> = {
  core: '#4ade80',
  behavior: '#60a5fa',
  infra: '#f59e0b',
  content: '#a78bfa',
  frontend: '#f87171',
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  description: string;
  url: string;
  category: string;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  label: string;
  type: string;
}

export function Graph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: SimNode } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr('width', width).attr('height', height);

    const simNodes: SimNode[] = nodes.map(n => ({ ...n }));
    const simLinks: SimLink[] = links.map(l => ({
      source: l.source,
      target: l.target,
      label: l.label,
      type: l.type,
    }));

    const simulation = d3.forceSimulation(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id(d => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Links
    const link = svg.append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', d => d.type === 'depends' ? '#4ade80' : d.type === 'uses' ? '#60a5fa' : '#a78bfa')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.type === 'documents' ? '4,4' : 'none');

    // Link labels
    const linkLabel = svg.append('g')
      .selectAll('text')
      .data(simLinks)
      .join('text')
      .text(d => d.label)
      .attr('font-size', '9px')
      .attr('fill', '#666')
      .attr('text-anchor', 'middle');

    // Nodes
    const node = svg.append('g')
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .call(d3.drag<any, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Node circles
    node.append('circle')
      .attr('r', d => d.id === 'kernel' ? 28 : 20)
      .attr('fill', d => CATEGORY_COLORS[d.category] || '#888')
      .attr('fill-opacity', 0.15)
      .attr('stroke', d => CATEGORY_COLORS[d.category] || '#888')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_, d) => { window.open(d.url, '_blank'); })
      .on('mouseenter', (event, d) => {
        setTooltip({ x: event.pageX, y: event.pageY, node: d });
      })
      .on('mouseleave', () => { setTooltip(null); });

    // Node labels
    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', d => d.id === 'kernel' ? '12px' : '10px')
      .attr('font-weight', d => d.id === 'kernel' ? '700' : '500')
      .attr('fill', d => CATEGORY_COLORS[d.category] || '#ccc')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!);

      linkLabel
        .attr('x', d => ((d.source as SimNode).x! + (d.target as SimNode).x!) / 2)
        .attr('y', d => ((d.source as SimNode).y! + (d.target as SimNode).y!) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, []);

  return (
    <>
      <svg ref={svgRef} />
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y + 12,
          background: 'rgba(10, 14, 20, 0.95)',
          border: `1px solid ${CATEGORY_COLORS[tooltip.node.category]}`,
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#e0e0e0',
          fontSize: '12px',
          maxWidth: '260px',
          pointerEvents: 'none',
          zIndex: 100,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4, color: CATEGORY_COLORS[tooltip.node.category] }}>
            {tooltip.node.label}
          </div>
          <div style={{ opacity: 0.8 }}>{tooltip.node.description}</div>
        </div>
      )}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        color: '#666',
        fontSize: '11px',
        display: 'flex',
        gap: '16px',
      }}>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <span key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {cat}
          </span>
        ))}
      </div>
    </>
  );
}
