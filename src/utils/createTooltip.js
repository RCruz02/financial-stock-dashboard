import * as d3 from 'd3';

export default function createTooltip(id) {
  let tooltip = d3.select(`#${id}`);
  if (tooltip.empty()) {
    tooltip = d3.select('body')
      .append('div')
      .attr('id', id)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'white')
      .style('padding', '6px 8px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('display', 'none')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
  }
  return tooltip;
}
