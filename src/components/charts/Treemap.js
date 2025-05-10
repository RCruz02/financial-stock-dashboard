import { useEffect, useRef } from 'react';
import createTooltip from '../../utils/createTooltip';
import * as d3 from 'd3';

const SECTOR_COLORS = {
  Aerospace: '#4e79a7',
  Automotive: '#f28e2b',
  'Consumer Goods': '#e15759',
  Energy: '#76b7b2',
  Finance: '#59a14f',
  Healthcare: '#edc949',
  Technology: '#af7aa1'
};

export default function TreemapChart({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 250;
    svg.attr('width', width).attr('height', height);
    const tooltip = createTooltip('treemap-tooltip');

    const companyMap = d3.rollup(
      data,
      v => ({
        avgMarketCap: d3.mean(v, d => +d['Market_Cap']),
        sector: v[0]?.Sector || 'Unknown'
      }),
      d => d.Company
    );

    const sectorMap = new Map();
    for (const [company, { avgMarketCap, sector }] of companyMap) {
      if (!company || !sector || isNaN(avgMarketCap)) continue;
      if (!sectorMap.has(sector)) sectorMap.set(sector, []);
      sectorMap.get(sector).push({ name: company, value: avgMarketCap });
    }

    const nested = {
      name: 'root',
      children: Array.from(sectorMap, ([sector, companies]) => ({
        name: sector,
        children: companies
      }))
    };

    const root = d3.hierarchy(nested)
      .sum(d => d.value || 0)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).padding(1)(root);

    const node = svg.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    node.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => SECTOR_COLORS[d.parent?.data?.name] || '#ccc')
      .on('mousemove', function (event, d) {
        tooltip
          .style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY}px`)
          .html(`
            <strong>${d.data.name}</strong><br/>
            Sector: ${d.parent.data.name}<br/>
            Market Cap: $${Math.round(d.value)}
          `);
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });

    node.append('text')
      .attr('x', 3)
      .attr('y', 10)
      .text(d => (d.data?.name || '').slice(0, 12))
      .attr('font-size', '8px')
      .attr('fill', 'white')
      .style('pointer-events', 'none');
  }, [data]);

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Company Size by Market Cap and Sector</h3>
      <svg ref={svgRef}></svg>
      <div style={{ marginTop: 12 }}>
        <strong>Sector</strong>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '4px'
        }}>
          {[...new Set(data.map(d => d.Sector))]
            .filter(sector => SECTOR_COLORS[sector])
            .sort()
            .map(sector => (
              <div key={sector} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: 12,
                  height: 12,
                  backgroundColor: SECTOR_COLORS[sector],
                  borderRadius: 2
                }}></div>
                <span style={{ fontSize: '12px' }}>{sector}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
