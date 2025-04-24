'use client';
import { useEffect } from 'react';

export default function ScatterPlot({ data }) {
  useEffect(() => {
    console.log('Scatter Plot Data:', data);
  }, [data]);

  return <div className="text-gray-500">Scatter Plot </div>;
}
