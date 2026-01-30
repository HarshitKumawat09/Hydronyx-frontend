"use client";

import { useEffect, useState } from 'react';

export default function LimitationsPage() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLimit = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://localhost:8000/api/validation/limitations', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to fetch limitations');
        const j = await res.json();
        setItems(j.limitations || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };
    fetchLimit();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-3">Model Limitations & Disclosures</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && (
        <ul className="list-disc pl-6 text-sm text-gray-200">
          {items.map((it, idx) => (
            <li key={idx} className="mb-2">{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
