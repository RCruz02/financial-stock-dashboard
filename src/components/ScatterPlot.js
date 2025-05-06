import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ScatterPlot({ data }) {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 1000;
    const height = 800;
    const margin = { top: 40, right: 40, bottom: 70, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const chart = svg.selectAll(".chart-group")
      .data([null])
      .join("g")
      .attr("class", "chart-group")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
      .domain([0, 40])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 5.0])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain([...new Set(data.map(d => d.Sector))]);

    chart.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.PE_Ratio))
      .attr("cy", d => yScale(d.Dividend_Yield))
      .attr("r", 6)
      .attr("fill", "white")
      .attr("stroke", d => colorScale(d.Sector))
      .attr("stroke-width", 3)
      .style("pointer-events", "all")
      .on("mouseover", function (event, d) {
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.Company}</strong><br/>
            Sector: ${d.Sector}<br/>
            P/E Ratio: ${Number(d.PE_Ratio).toFixed(2)}<br/>
            Dividend Yield: ${Number(d.Dividend_Yield).toFixed(2)}<br/>
            Market Cap: $${(+d.Market_Cap / 1e9).toFixed(2)}B
          `);
      })
      .on("mousemove", function (event) {
        d3.select(tooltipRef.current)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 1050) + "px");
      })
      .on("mouseout", function () {
        d3.select(tooltipRef.current).style("opacity", 0);
      });



    chart.selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickValues(d3.range(0, 45, 5)));

    chart.append("text")
      .attr("class", "x-axis-label")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 50)
      .attr("text-anchor", "middle")
      .text("P/E Ratio");

    chart.selectAll(".y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale).tickValues(d3.range(0, 5.5, 0.5)));

    chart.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .text("Dividend Yield");

  }, [data]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} className="container"></svg>
      <div id="tooltip" ref={tooltipRef} style={{
        position: "absolute",
        backgroundColor: "white",
        border: "1px solid black",
        padding: "5px",
        pointerEvents: "none"
      }}></div>
    </div>
  );
}
