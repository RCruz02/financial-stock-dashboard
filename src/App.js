import React, { useState, useEffect, useMemo } from 'react';
import * as d3 from 'd3'
import Filters from './components/Filters';
import LineChart from './components/LineChart';
import StackedBarChart from './components/StackedBarChart';
import ScatterPlot from './components/ScatterPlot';
import TreemapChart from './components/Treemap';

function App() {
  const [filters, setFilters] = useState({});
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    d3.csv(process.env.PUBLIC_URL + '/data/synthetic_stock_data.csv').then(raw => {
      const parsed = raw.map(d => ({
        ...d,
        Date: new Date(d.Date),
        Open: +d.Open,
        Close: +d.Close,
        Company: d.Company.trim(),
        High: +d.High,
        Low: +d.Low,
        Sector: d.Sector,
        'Dividend Yield': +d['Dividend Yield'],
        'PE Ratio': +d['PE Ratio'],
        'Market Cap': +d['Market Cap'],
        Sentiment: d.Sentiment,
      }));
      setStockData(parsed);
    });
  }, []);
  const filteredData = useMemo(() => {
    if (
      !filters ||
      !filters.companies ||
      !Array.isArray(filters.companies) ||
      filters.companies.length === 0 ||
      !filters.dateStart ||
      !filters.dateEnd
    ) {
      return [];
    }
  
    return stockData.filter(d => {
      const date = d.Date.toISOString().split('T')[0];
      return (
        filters.companies.includes(d.Company) &&
        date >= filters.dateStart &&
        date <= filters.dateEnd
      );
    });
  }, [stockData, filters]);
  
  return (
    <div style={{ padding: 20 }}>
      <h1>Stock Market Dashboard</h1>
      <Filters onFilterChange={setFilters} />
      {stockData.length > 0 && filters.dateStart && (
        <>
          <LineChart data={filteredData}/>
          <StackedBarChart data={filteredData}/>
          <ScatterPlot data={filteredData}/>
          <TreemapChart data={filteredData}/>
        </>
      )}
    </div>
  );
}

export default App;
