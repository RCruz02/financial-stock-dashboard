import { useEffect, useRef } from 'react';
import createTooltip from '../../utils/createTooltip';
import * as d3 from 'd3';

export default function StackedBarChart({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    const tooltip = createTooltip('stackedBarChart-tooltip');
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 60, bottom: 50, left: 50 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const nested = d3.rollups(
      data,
      v => ({
        Bullish: v.filter(d => d.Trend === 'Bullish').length,
        Bearish: v.filter(d => d.Trend === 'Bearish').length,
        Stable: v.filter(d => d.Trend === 'Stable').length
      }),
      d => d.Sector
    );

    const stackedData = nested.map(([sector, counts]) => ({
      sector,
      ...counts,
      total: counts.Bullish + counts.Bearish + counts.Stable
    }));
    stackedData.sort((a, b) => a.total - b.total);

    const keys = ['Bearish', 'Bullish', 'Stable'];

    const xScale = d3.scaleBand()
      .domain(stackedData.map(d => d.sector))
      .range([0, innerWidth])
      .padding(0.2);


    const yMax = d3.max(stackedData, d => d.Bullish + d.Bearish + d.Stable);

    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(keys)
      .range(['#5084b4', '#ff942c', '#f85464']);

    const stackGen = d3.stack().keys(keys);
    const series = stackGen(stackedData);

    const chartGroup = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    chartGroup
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', d => colorScale(d.key))
      .selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => xScale(d.data.sector))
      .attr('y', d => yScale(d[1]))
      .attr('height', d => Math.abs(yScale(d[0]) - yScale(d[1])))
      .attr('width', xScale.bandwidth())
      .on('mouseover', (event, d) => {
        const count = d[1] - d[0];
        const sector = d.data.sector;

        const parentData = d3.select(event.target.parentNode).datum();
        const trend = parentData.key;

        tooltip
          .style('display', 'block')
          .html(`<strong>Sector:</strong> ${sector}<br/>
                 <strong>Trend:</strong> ${trend}<br/>
                 <strong>Count:</strong> ${count}`);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('top', (event.pageY +10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });


    chartGroup
      .selectAll('g')
      .data(series)
      .join('g')
      .attr('fill', d => colorScale(d.key))
      .selectAll('text')
      .data(d => d)
      .join('text')
      .text(d => {
        const count = d[1] - d[0];
        return count > 0 ? count : '';
      })
      .attr('x', d => xScale(d.data.sector) + xScale.bandwidth() / 2)
      .attr('y', d => (yScale(d[0]) + yScale(d[1])) / 2)
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('fill', 'black')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    chartGroup.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));
    chartGroup.selectAll(".tick text")
      .each(function () {
        const self = d3.select(this);
        const words = self.text().split(" ");
        self.text(null);
        words.forEach((word, i) => {
          self.append("tspan")
            .text(word)
            .attr("x", 0)
            .attr("dy", i === 0 ? "1.2em"  : "1.1em");
        });
      }).attr("y",10);
    
    chartGroup.append('g')
      .call(d3.axisLeft(yScale));

    chartGroup.append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', 'black')
      .text('Count of Trend');

    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right}, ${margin.top})`);

    keys.forEach((key, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", colorScale(key));

      legendRow.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text(key)
        .attr("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });

  }, [data]);

  return (
    <div>
      <h3 style={{ textAlign: 'center' }}>Market Sentiment Breakdown by Sector</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
}
