'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAddresses } from '@/lib/dawa';
import { DawaAutocompleteResult } from '@/lib/types';

interface AddressSearchProps {
  onSelect: (address: DawaAutocompleteResult) => void;
  large?: boolean;
}

export default function AddressSearch({ onSelect, large }: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DawaAutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchAddresses(q);
      setResults(data);
      setIsOpen(data.length > 0);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (result: DawaAutocompleteResult) => {
    setQuery(result.tekst);
    setIsOpen(false);
    onSelect(result);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Indtast en dansk adresse..."
          className={`w-full border border-warm-gray-300 bg-white text-warm-gray-900 placeholder:text-warm-gray-500 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors ${
            large ? 'px-5 py-4 text-lg rounded-[4px]' : 'px-4 py-3 text-base rounded-[4px]'
          }`}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-warm-gray-300 border-t-navy rounded-full animate-spin" />
          </div>
        )}
      </div>
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-warm-gray-300 rounded-[4px] shadow-sm max-h-64 overflow-y-auto">
          {results.map((result, i) => (
            <li key={i}>
              <button
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 hover:bg-warm-gray-100 transition-colors text-warm-gray-900 border-b border-warm-gray-200 last:border-0"
              >
                {result.tekst}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
