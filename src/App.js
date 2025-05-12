import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { Filters } from './components/filters';
import {LineChart, StackedBarChart, ScatterPlot, Treemap} from './components/charts';
import { loadStockData } from './utils/parseStockCsv';

function App() {
  const [filters, setFilters] = useState({});
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    loadStockData(process.env.PUBLIC_URL + '/data/synthetic_stock_data.csv')
      .then(setStockData);
  }, []);

  const availableCompanies = useMemo(() => (
    [...new Set(stockData.map(d => d.Company))].filter(Boolean)
  ), [stockData]);

  const availableDates = useMemo(() => (
    [...new Set(stockData.map(d =>
      d.Date.toISOString().split('T')[0]
    ))].sort()
  ), [stockData]);

  const filteredData = useMemo(() => {
    if (
      !filters.companies?.length ||
      !filters.dateStart ||
      !filters.dateEnd
    ) return [];

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
    <div className="dashboard">
      <h2>Stock Market Dashboard</h2>
      <Filters
        companies={availableCompanies}
        dates={availableDates}
        onFilterChange={setFilters}
      />
      {stockData.length > 0 && filters.dateStart && (
        <div className="chart-grid">
          <LineChart data={filteredData} />
          <StackedBarChart data={filteredData} />
          <ScatterPlot data={filteredData} />
          <Treemap data={filteredData} />
        </div>
      )}
    </div>
  );
}

export default App;
