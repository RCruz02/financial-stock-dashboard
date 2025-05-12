import * as d3 from 'd3';

export async function loadStockData(path) {
  const raw = await d3.csv(path);
  return raw.map(d => ({
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
}
