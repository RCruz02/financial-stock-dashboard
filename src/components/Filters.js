import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

export default function Filters({ onFilterChange }) {
  // const [data, setData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [dates, setDates] = useState([]);

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [dateRange, setDateRange] = useState([0, 0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    d3.csv(process.env.PUBLIC_URL + '/data/synthetic_stock_data.csv').then(raw => {
      const parsed = raw.map(d => ({
        ...d,
        Date: new Date(d.Date),
        Company: d.Company.trim(),
      }));

      const uniqueCompanies = [...new Set(parsed.map(d => d.Company))].filter(Boolean);
      const sortedDates = [...new Set(parsed.map(d => d.Date.toISOString().split('T')[0]))].sort();

      setCompanies(uniqueCompanies);
      setDates(sortedDates);

      setSelectedCompanies(uniqueCompanies);
      setDateRange([0, sortedDates.length - 1]);
    });
  }, []);

  useEffect(() => {
    if (dates.length === 0 || companies.length === 0) return;

    onFilterChange({
      companies: selectedCompanies,
      dateStart: dates[dateRange[0]],
      dateEnd: dates[dateRange[1]],
    });
  }, [selectedCompanies, dateRange, dates, companies.length, onFilterChange]);

  const toggleCompany = (company) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const toggleAll = () => {
    setSelectedCompanies(prev =>
      prev.length === companies.length ? [] : [...companies]
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Group both filters side by side */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '40px',          // spacing between filters
          flexWrap: 'wrap',     // allows wrap on smaller screens
        }}
      >
        {/* Company Dropdown */}
        <div style={{ position: 'relative' }}>
          <strong>Companies:</strong>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              marginLeft: 8,
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid #ccc',
              background: '#f9f9f9',
              cursor: 'pointer',
            }}
          >
            {selectedCompanies.length === companies.length
              ? 'All Companies'
              : `${selectedCompanies.length} selected`}
          </button>
  
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: 250,
                maxHeight: 300,
                overflowY: 'auto',
                background: '#fff',
                border: '1px solid #ccc',
                padding: 10,
                zIndex: 10,
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={selectedCompanies.length === companies.length}
                  onChange={toggleAll}
                />{" "}
                Select All
              </label>
              <hr />
              {companies.map(company => (
                <label key={company} style={{ display: 'block', marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company)}
                    onChange={() => toggleCompany(company)}
                  />{" "}
                  {company}
                </label>
              ))}
            </div>
          )}
        </div>
  
        {/* Date Range Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <strong>Date Range:</strong>
  
          {/* <input
            type="range"
            min={0}
            max={dates.length - 1}
            value={dateRange[0]}
            onChange={e => {
              const start = +e.target.value;
              if (start <= dateRange[1]) setDateRange([start, dateRange[1]]);
            }}
          /> */}
  
          <input
            type="range"
            min={0}
            max={dates.length - 1}
            value={dateRange[1]}
            onChange={e => {
              const end = +e.target.value;
              if (end >= dateRange[0]) setDateRange([dateRange[0], end]);
            }}
          />
  
          <span style={{ whiteSpace: 'nowrap' }}>
            {dates[dateRange[0]]} → {dates[dateRange[1]]}
          </span>
          <div>WIP</div>
        </div>
      </div>
    </div>
  );  
}
