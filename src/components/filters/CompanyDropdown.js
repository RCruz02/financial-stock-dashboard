import React, { useRef, useEffect } from 'react';

export default function CompanyDropdown({
  companies,
  selectedCompanies,
  setSelectedCompanies,
  dropdownOpen,
  setDropdownOpen,
}) {
  const dropdownRef = useRef();

  const toggleCompany = (company) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  const toggleAll = () => {
    setSelectedCompanies((prev) =>
      prev.length === companies.length ? [] : [...companies]
    );
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setDropdownOpen]);

  const dropdownStyle = {
    marginTop: 6,
    position: 'absolute',
    zIndex: 10,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: 6,
    padding: 10,
    maxHeight: 300,
    overflowY: 'auto',
    width: 300,
    fontSize: '0.9rem',
  };

  return (
    <div className="filter-block">
      <label className="filter-label">Companies:</label>
      <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
        {selectedCompanies.length === companies.length
          ? 'All Companies'
          : `${selectedCompanies.length} selected`}
      </button>
      {dropdownOpen && (
        <div ref={dropdownRef} style={dropdownStyle}>
          <label>
            <input
              type="checkbox"
              checked={selectedCompanies.length === companies.length}
              onChange={toggleAll}
            />{' '}
            Select All
          </label>
          <hr />
          {companies.map((company) => (
            <label key={company} style={{ display: 'block', marginBottom: 4 }}>
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company)}
                onChange={() => toggleCompany(company)}
              />{' '}
              {company}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
