import React, { useEffect, useRef } from 'react';
import createTooltip from '../../utils/createTooltip';
import * as d3 from 'd3';

export default function LineChart({ data }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    const dateMap = d3.rollup(
      data,
      v => ({
        avgHigh: d3.mean(v, d => +d.High),
        avgLow: d3.mean(v, d => +d.Low),
      }),
      d => d.Date
    );

    const series = Array.from(dateMap, ([date, values]) => ({
      date,
      ...values,
    })).sort((a, b) => a.date - b.date);

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 500;
    const height = 250;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear

    const x = d3.scaleTime()
      .domain(d3.extent(series, d => d.date))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(series, d => Math.min(d.avgHigh, d.avgLow)),
        d3.max(series, d => Math.max(d.avgHigh, d.avgLow)),
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const lineHigh = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.avgHigh));

    const lineLow = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.avgLow));

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg.append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1.5)
      .attr("d", lineHigh);

    svg.append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", lineLow);

    const tooltip = createTooltip('linechart-tooltip');
    svg.append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("fill", "transparent")
      .on("mousemove", function (event) {
        const [xCoord] = d3.pointer(event);
        const hoveredDate = x.invert(xCoord);

        const bisectDate = d3.bisector(d => d.date).left;
        const i = bisectDate(series, hoveredDate);
        const d0 = series[i - 1];
        const d1 = series[i];
        const d = !d0 ? d1 : !d1 ? d0 : hoveredDate - d0.date > d1.date - hoveredDate ? d1 : d0;

        tooltip
          .style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`)
          .html(`
            <strong>${d.date.toISOString().split('T')[0]}</strong><br/>
            High: ${d.avgHigh.toFixed(2)}<br/>
            Low: ${d.avgLow.toFixed(2)}
          `);
      })
      .on("mousemove", function (event) {
        const [mouseX, mouseY] = d3.pointer(event);
        const hoveredDate = x.invert(mouseX);
      
        const bisectDate = d3.bisector(d => d.date).left;
        const i = bisectDate(series, hoveredDate);
        const d0 = series[i - 1];
        const d1 = series[i];
        const d = !d0 ? d1 : !d1 ? d0 : hoveredDate - d0.date > d1.date - hoveredDate ? d1 : d0;
      
        const yHigh = y(d.avgHigh);
        const yLow = y(d.avgLow);
      
        const proximityThreshold = 10;
        const verticalDistanceToHigh = Math.abs(mouseY - yHigh);
        const verticalDistanceToLow = Math.abs(mouseY - yLow);
      
        const isCloseToHigh = verticalDistanceToHigh < proximityThreshold;
        const isCloseToLow = verticalDistanceToLow < proximityThreshold;
      
        if (isCloseToHigh || isCloseToLow) {
          const isCloserToHigh = verticalDistanceToHigh < verticalDistanceToLow;
          const content = isCloserToHigh
            ? `<strong>${d.date.toISOString().split('T')[0]}</strong><br/>High: ${d.avgHigh.toFixed(2)}`
            : `<strong>${d.date.toISOString().split('T')[0]}</strong><br/>Low: ${d.avgLow.toFixed(2)}`;
      
          tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY + 10}px`)
            .html(content); 
      
          tooltip
            .transition()
            .duration(150)
            .style("opacity", 1);
        } else {
          tooltip
            .transition()
            .duration(100)
            .style("opacity", 0)
            .on("end", () => tooltip.style("display", "none"));
        }
      })
  }, [data]);

  return (
    <div style={{ width: 500, margin: '0 auto' }}>
      <h3 style={{ textAlign: 'center' }}>Line Chart - High and Low Over Time</h3>
      <svg ref={svgRef} width={500} height={250}></svg>
    </div>
  );
}
