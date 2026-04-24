import { useState, useEffect, useCallback, useRef } from 'react';
import { useClassificationStore } from '../../store/classificationStore';
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
  XMarkIcon,
  FolderIcon,
  TagIcon,
  ArrowPathIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { getRoots, getChildren, searchClassifications } from '../../api/classifications.api';

/**
 * ClassificationPicker — cascading breadcrumb selector for choosing letter classification.
 *
 * Props:
 *   value     — classification_id of the selected leaf node
 *   onChange  — callback(classificationId) when a leaf node is selected
 *   disabled  — boolean, disable all elements
 */
export default function ClassificationPicker({ value, onChange, disabled = false }) {
  const { roots, setRoots, childrenMap, setChildren } = useClassificationStore();

  // State for the current path: array of { id, name, code, is_leaf }
  const [path, setPath] = useState([]);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Fetch roots on mount
  useEffect(() => {
    if (roots.length > 0) return;
    const fetchRoots = async () => {
      setLoading(true);
      try {
        const res = await getRoots();
        setRoots(res.data || []);
      } catch (err) {
        console.error('Failed to fetch roots', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoots();
  }, [roots.length, setRoots]);

  // Handle Search logic
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await searchClassifications(searchQuery.trim());
        setSearchResults(res.data || []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Close search results on click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch children if not cached
  const fetchChildrenCached = useCallback(async (parentId) => {
    if (childrenMap[parentId]) return childrenMap[parentId];
    setLoading(true);
    try {
      const res = await getChildren(parentId);
      setChildren(parentId, res.data || []);
      return res.data || [];
    } catch (err) {
      console.error('Failed to fetch children', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [childrenMap, setChildren]);

  // Handle item selection in the list
  const handleItemSelect = async (item) => {
    if (disabled) return;

    if (item.is_leaf) {
      // If it's a leaf, finalize selection
      const newPath = [...path, item];
      setPath(newPath);
      onChange?.(String(item.id));
    } else {
      // If not a leaf, drill down
      const children = await fetchChildrenCached(item.id);
      setPath([...path, item]);
      onChange?.(null); // Clear selection if not at leaf
    }
  };

  // Handle search result selection
  const handleSearchSelect = useCallback(async (item) => {
    setShowResults(false);
    setSearchQuery('');

    // ancestors + item itself
    const fullPath = [...(item.ancestors || []), item];
    setPath(fullPath);
    onChange?.(String(item.id));

    // Pre-cache children for ancestors so breadcrumb navigation works smoothly
    item.ancestors?.forEach(anc => {
      if (!childrenMap[anc.id]) {
        getChildren(anc.id).then(res => setChildren(anc.id, res.data || []));
      }
    });
  }, [childrenMap, setChildren, onChange]);

  // Navigate back to a level in the path
  const handleBreadcrumbClick = (index) => {
    if (disabled) return;
    const newPath = path.slice(0, index);
    setPath(newPath);
    onChange?.(null);
  };

  const currentParentId = path.length > 0 ? path[path.length - 1].id : null;
  const currentOptions = currentParentId ? (childrenMap[currentParentId] || []) : roots;

  // If the last item in path is a leaf, we are in "selected" state
  const isLeafSelected = path.length > 0 && path[path.length - 1].is_leaf;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#94A3B8]">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            disabled={disabled}
            placeholder="Cari kode atau klasifikasi..."
            className="block w-full h-11 rounded-[var(--radius-input)] border border-[#E2E8F0] bg-[#F8FAFC] pl-11 pr-4 text-sm font-medium text-[#1B2F6E] focus:border-[var(--color-primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/5 transition-all duration-200"
          />
          {searchLoading && (
            <span className="absolute inset-y-0 right-4 flex items-center">
              <ArrowPathIcon className="h-4 w-4 animate-spin text-primary" />
            </span>
          )}
        </div>

        {/* Search Results */}
        {showResults && (
          <ul className="absolute z-50 mt-2 w-full rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl max-h-72 overflow-y-auto py-2 backdrop-blur-lg">
            {searchResults.length === 0 ? (
              <li className="px-5 py-4 text-sm text-[#94A3B8] italic text-center">Tidak ada hasil ditemukan.</li>
            ) : (
              searchResults.map((item) => (
                <li
                  key={item.id}
                  onMouseDown={() => handleSearchSelect(item)}
                  className="px-5 py-3.5 cursor-pointer hover:bg-[#F8FAFC] transition-colors duration-150 border-b border-slate-50 last:border-0 group"
                >
                  <div className="text-sm font-bold text-[#1B2F6E] group-hover:text-[var(--color-primary)]">{item.name}</div>
                  <div className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-1 font-medium">
                    <span className="text-[var(--color-secondary-dark)] font-bold">{item.code}</span>
                    <span className="mx-1">•</span>
                    {item.ancestors?.map((a) => a.name).join(' › ')} {item.ancestors?.length > 0 && '›'} <span className="text-[#1B2F6E]">{item.name}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Breadcrumb Path */}
      <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 px-4 min-h-[48px]">
        <div className="flex flex-wrap items-center text-[13px] font-bold">
          <button
            type="button"
            onClick={() => handleBreadcrumbClick(0)}
            disabled={disabled}
            className={`transition-colors duration-200 ${path.length === 0 ? 'text-[var(--color-primary)]' : 'text-[#94A3B8] hover:text-[var(--color-primary)]'}`}
          >
            Root
          </button>

          {path.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <span className="mx-2.5 text-[#CBD5E1]">
                <ChevronRightIcon className="w-3 h-3" />
              </span>
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(i + 1)}
                disabled={disabled || (i === path.length - 1 && isLeafSelected)}
                className={`transition-colors duration-200 max-w-[150px] truncate ${i === path.length - 1 ? 'text-[var(--color-primary)]' : 'text-[#94A3B8] hover:text-[var(--color-primary)]'
                  }`}
              >
                {node.name}
              </button>
            </div>
          ))}
        </div>

        {path.length > 0 && (
          <button
            type="button"
            onClick={() => handleBreadcrumbClick(0)}
            disabled={disabled}
            className="p-1.5 rounded-lg text-[#CBD5E1] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-200"
            title="Reset Pilihan"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Options Panel */}
      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-4">
            <div className="w-10 h-10 border-4 border-[var(--color-primary)]/10 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Memuat Data...</p>
          </div>
        ) : isLeafSelected ? (
          <div className="p-10 text-center bg-[#F8FAFC]">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mb-4 shadow-sm">
              <CheckIcon className="h-8 w-8" />
            </div>
            <p className="text-[11px] font-extrabold text-[#94A3B8] uppercase tracking-widest mb-1">Terpilih</p>
            <h4 className="text-xl font-black text-[#1B2F6E] tracking-tight">{path[path.length - 1].name}</h4>
            <p className="mt-1 text-sm font-bold text-[var(--color-secondary-dark)] font-mono">
              {path[path.length - 1].code}
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {currentOptions.length === 0 ? (
              <div className="p-12 text-center text-[#94A3B8] text-sm font-medium">Tidak ada sub-klasifikasi tersedia.</div>
            ) : (
              currentOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  disabled={disabled}
                  className="w-full flex items-center justify-between px-5 py-4 border-b border-[#F8FAFC] last:border-0 hover:bg-[#F8FAFC] transition-all duration-150 text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-[var(--color-secondary-dark)] uppercase tracking-wider mb-1">
                      {item.code}
                    </span>
                    <span className="text-sm font-bold text-[#1B2F6E] group-hover:text-[var(--color-primary)] transition-colors">
                      {item.name}
                    </span>
                  </div>

                  {item.is_leaf ? (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100 shadow-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                      Pilih
                    </span>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#CBD5E1] group-hover:text-[var(--color-primary)] group-hover:bg-white transition-all shadow-sm group-hover:shadow-md">
                      <ChevronRightIcon className="h-4 w-4" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
