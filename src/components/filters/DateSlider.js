import React, { useEffect, useRef } from 'react';
import { sliderBottom } from 'd3-simple-slider';
import * as d3 from 'd3';

export default function DateSlider({ dates, onDateRangeChange }) {
  const sliderRef = useRef();

  useEffect(() => {
    if (!dates.length || !sliderRef.current) return;

    const dateObjects = dates.map(d => new Date(d));
    const minDate = d3.min(dateObjects);
    const maxDate = d3.max(dateObjects);
    const formatDate = d => new Date(d).toISOString().split('T')[0];

    const slider = sliderBottom()
      .min(minDate)
      .max(maxDate)
      .width((sliderRef.current.clientWidth || 440) - 40)
      .tickFormat(d3.timeFormat('%Y-%m-%d'))
      .ticks(4)
      .default([minDate, maxDate])
      .fill('#85bb65')
      .on('onchange', ([startRaw, endRaw]) => {
        const startStr = formatDate(startRaw);
        const endStr = formatDate(endRaw);
        onDateRangeChange(startStr, endStr);
      });

    const container = d3.select(sliderRef.current);
    container.selectAll('*').remove();
    container.append('g').attr('transform', 'translate(0,10)').call(slider);
  }, [dates, onDateRangeChange]);

  return (
    <div className="filter-block">
      <label className="filter-label">Date Range:</label>
      <svg ref={sliderRef} style={{ width: '100%', height: 70 }}></svg>
    </div>
  );
}
