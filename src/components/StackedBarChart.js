'use client';
import { useEffect } from 'react';

export default function StackedBarChart({ data  }) {
  useEffect(() => {
    console.log('Stacked Bar Chart Data:', data);
  }, [data]);

  return <div className="text-gray-500">Stacked Bar Chart (Coming Soon)</div>;
}
