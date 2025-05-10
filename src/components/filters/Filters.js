import React, { useEffect, useState, useCallback } from 'react';
import CompanyDropdown from './CompanyDropdown';
import DateSlider from './DateSlider';

export default function Filters({ companies, dates, onFilterChange }) {
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [dateRange, setDateRange] = useState([0, 0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (companies.length && dates.length) {
      setSelectedCompanies(companies);
      setDateRange([0, dates.length - 1]);
      setInitialized(true);
    }
  }, [companies, dates]);

  useEffect(() => {
    if (
      !initialized ||
      !dates.length ||
      selectedCompanies.length === 0 ||
      dateRange[0] === null ||
      dateRange[1] === null
    ) return;

    onFilterChange({
      companies: selectedCompanies,
      dateStart: dates[dateRange[0]],
      dateEnd: dates[dateRange[1]],
    });
  }, [selectedCompanies, dateRange, dates, initialized, onFilterChange]);

  const handleDateChange = useCallback((startStr, endStr) => {
    const startStrNorm = new Date(startStr).toISOString().split('T')[0];
    const endStrNorm = new Date(endStr).toISOString().split('T')[0];

    const startIdx = dates.findIndex(d => d === startStrNorm);
    const endIdx = dates.findIndex(d => d === endStrNorm);
    
    if (startIdx !== -1 && endIdx !== -1) {
      setDateRange([startIdx, endIdx]);
    }
  }, [dates]);

  return (
    <div className="filters-grid">
      <CompanyDropdown
        companies={companies}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
      />
      <DateSlider
        dates={dates}
        onDateRangeChange={handleDateChange}
      />
    </div>
  );
}
