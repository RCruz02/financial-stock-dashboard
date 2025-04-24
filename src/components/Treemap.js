'use client';
import { useEffect } from 'react';

export default function TreemapChart({ data }) {
  useEffect(() => {
    console.log('Treemap Data:', data);
  }, [data]);

  return <div className="text-gray-500">Treemap Chart (Coming Soon)</div>;
}
