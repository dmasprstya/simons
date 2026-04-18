import { useState, useEffect, useCallback, useRef } from 'react';
import { useClassificationStore } from '../../store/classificationStore';
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
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#94A3B8]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            disabled={disabled}
            placeholder="Cari berdasarkan nama atau kode..."
            className="block w-full h-10 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] pl-10 pr-3 text-sm text-[#0B1F3A] focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#2A7FD4]/10 transition-all duration-200"
          />
          {searchLoading && (
            <span className="absolute inset-y-0 right-3 flex items-center">
              <svg className="h-4 w-4 animate-spin text-[#2A7FD4]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </span>
          )}
        </div>

        {/* Search Results */}
        {showResults && (
          <ul className="absolute z-50 mt-2 w-full rounded-xl border border-[#E2E8F0] bg-white shadow-xl max-h-72 overflow-y-auto py-2">
            {searchResults.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#94A3B8] italic text-center">No results found.</li>
            ) : (
              searchResults.map((item) => (
                <li
                  key={item.id}
                  onMouseDown={() => handleSearchSelect(item)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-[#F0F7FF] transition-colors duration-150 border-b border-slate-50 last:border-0"
                >
                  <div className="text-sm font-semibold text-[#0B1F3A]">{item.name}</div>
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
                    {item.ancestors?.map((a) => a.name).join(' › ')} {item.ancestors?.length > 0 && '›'} <span className="text-navy">{item.name}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Breadcrumb Path */}
      <div className="flex items-center justify-between bg-slate-50/50 border border-slate-200 rounded-xl p-2 px-3 min-h-[44px]">
        <div className="flex flex-wrap items-center text-sm font-medium">
          <button
            type="button"
            onClick={() => handleBreadcrumbClick(0)}
            disabled={disabled}
            className={`transition-colors duration-200 ${path.length === 0 ? 'text-navy font-bold' : 'text-slate-400 hover:text-navy'}`}
          >
            Klasifikasi
          </button>
          
          {path.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <span className="mx-2 text-slate-300">›</span>
              <button
                type="button"
                onClick={() => handleBreadcrumbClick(i + 1)}
                disabled={disabled || (i === path.length - 1 && isLeafSelected)}
                className={`transition-colors duration-200 max-w-[150px] truncate ${
                  i === path.length - 1 ? 'text-navy font-bold' : 'text-slate-400 hover:text-navy'
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
            className="p-1 px-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-all duration-200"
            title="Reset"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Options Panel */}
      <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
             <div className="w-8 h-8 border-4 border-[#2A7FD4]/20 border-t-[#2A7FD4] rounded-full animate-spin"></div>
             <p className="text-sm text-slate-400">Loading classifications...</p>
          </div>
        ) : isLeafSelected ? (
          <div className="p-8 text-center bg-blue-50/30">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h4 className="text-lg font-bold text-navy">{path[path.length - 1].name}</h4>
            <p className="text-sm text-slate-500 mt-1">Classification selected</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {currentOptions.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">No sub-classifications available.</div>
            ) : (
              currentOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemSelect(item)}
                  disabled={disabled}
                  className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors duration-150 text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#2A7FD4] uppercase tracking-wider mb-0.5">
                      {item.code}
                    </span>
                    <span className="text-sm font-medium text-[#0B1F3A] group-hover:text-[#2A7FD4]">
                      {item.name}
                    </span>
                  </div>
                  
                  {item.is_leaf ? (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-md border border-emerald-100">
                      Select
                    </span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-[#2A7FD4] transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
