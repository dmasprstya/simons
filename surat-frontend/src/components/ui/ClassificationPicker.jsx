import { useState, useEffect, useCallback, useRef } from 'react';
import { useClassificationStore } from '../../store/classificationStore';
import { getRoots, getChildren, searchClassifications } from '../../api/classifications.api';

/**
 * ClassificationPicker — search box + 4 dropdown bertingkat untuk memilih klasifikasi surat.
 *
 * Props:
 *   value     — classification_id yang terpilih (node leaf terpilih)
 *   onChange  — callback(classificationId) saat node leaf dipilih
 *   disabled  — boolean, nonaktifkan semua elemen
 *
 * Alur search:
 *   1. User mengetik di search box → debounce 350ms → hit GET /classifications/search?q=…
 *   2. Hasil tampil sebagai dropdown; setiap item membawa ancestors[] dari backend
 *   3. Saat item dipilih:
 *      a. Pre-populate childrenMap dengan ancestors agar dropdown level 1–4 bisa render
 *      b. Set level1Id–level4Id sesuai kedalaman ancestor
 *      c. Panggil onChange(id) dengan id klasifikasi yang dipilih
 *
 * Alur dropdown manual tetap tersedia (untuk navigasi hierarki tanpa search).
 */
export default function ClassificationPicker({ value, onChange, disabled = false }) {
  const { roots, setRoots, childrenMap, setChildren } = useClassificationStore();

  // State seleksi tiap level
  const [level1Id, setLevel1Id] = useState('');
  const [level2Id, setLevel2Id] = useState('');
  const [level3Id, setLevel3Id] = useState('');
  const [level4Id, setLevel4Id] = useState(value || '');

  // Loading state per level
  const [loadingRoots, setLoadingRoots] = useState(false);
  const [loadingLevel2, setLoadingLevel2] = useState(false);
  const [loadingLevel3, setLoadingLevel3] = useState(false);
  const [loadingLevel4, setLoadingLevel4] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults]   = useState(false);
  const searchRef  = useRef(null);
  const debounceRef = useRef(null);

  // Fetch root classifications (Level 1) — hanya jika belum ada di store
  useEffect(() => {
    if (roots.length > 0) return;

    let cancelled = false;
    const fetchRoots = async () => {
      setLoadingRoots(true);
      try {
        const res = await getRoots();
        if (!cancelled) setRoots(res.data || []);
      } catch {
        // Error ditangani oleh interceptor global
      } finally {
        if (!cancelled) setLoadingRoots(false);
      }
    };
    fetchRoots();
    return () => { cancelled = true; };
  }, [roots.length, setRoots]);

  // Tutup hasil search saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search — panggil API setelah 350ms idle
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

  // Fetch children untuk parent tertentu — cache di childrenMap
  const fetchChildrenCached = useCallback(
    async (parentId, setLoading) => {
      // Jika children sudah ada di store, tidak perlu fetch ulang
      if (childrenMap[parentId]) return;

      setLoading(true);
      try {
        const res = await getChildren(parentId);
        setChildren(parentId, res.data || []);
      } catch {
        // Error ditangani oleh interceptor global
      } finally {
        setLoading(false);
      }
    },
    [childrenMap, setChildren]
  );

  /**
   * Saat user memilih hasil search:
   * 1. Pre-populate childrenMap untuk setiap ancestor (agar dropdown bisa render)
   * 2. Sinkronkan level1Id–level4Id berdasarkan kedalaman ancestor + item itu sendiri
   * 3. Panggil onChange(item.id)
   */
  const handleSearchSelect = useCallback(
    async (item) => {
      setShowResults(false);
      setSearchQuery('');

      // ancestors[] sudah diurutkan dari level 1 → level N-1 oleh backend
      const ancestors = item.ancestors || [];

      // Pre-populate childrenMap agar dropdown bisa render tanpa fetch tambahan.
      // Fetch dilakukan secara paralel untuk setiap ancestor yang belum dicache.
      const fetchPromises = ancestors.map((anc) =>
        childrenMap[anc.id] ? Promise.resolve() : getChildren(anc.id).then((res) => setChildren(anc.id, res.data || []))
      );
      // Juga fetch children dari item itu sendiri jika bukan leaf (untuk sinkronisasi level atasnya)
      // Tidak perlu — item adalah node yang dipilih, dropdown di bawahnya tidak relevan.
      await Promise.allSettled(fetchPromises);

      // Sinkronkan dropdown berdasarkan kedalaman
      const l1 = ancestors[0] ? String(ancestors[0].id) : String(item.id);
      const l2 = ancestors[1] ? String(ancestors[1].id) : (ancestors.length === 0 ? '' : String(item.id));
      const l3 = ancestors[2] ? String(ancestors[2].id) : (ancestors.length <= 1 ? '' : String(item.id));
      const l4 = ancestors.length >= 3 ? String(item.id) : '';

      setLevel1Id(l1);
      setLevel2Id(l2);
      setLevel3Id(l3);
      setLevel4Id(l4);

      onChange?.(String(item.id));
    },
    [childrenMap, setChildren, onChange]
  );

  // Handler Level 1 berubah → fetch Level 2 bila belum leaf
  const handleLevel1Change = async (e) => {
    const id = e.target.value;
    const selected = roots.find((item) => String(item.id) === id);
    setLevel1Id(id);
    setLevel2Id('');
    setLevel3Id('');
    setLevel4Id('');

    if (!id) { onChange?.(null); return; }
    if (selected?.is_leaf) { onChange?.(id); return; }

    onChange?.(null);
    await fetchChildrenCached(id, setLoadingLevel2);
  };

  // Handler Level 2 berubah → fetch Level 3 bila belum leaf
  const handleLevel2Change = async (e) => {
    const id = e.target.value;
    const selected = level2Options.find((item) => String(item.id) === id);
    setLevel2Id(id);
    setLevel3Id('');
    setLevel4Id('');

    if (!id) { onChange?.(null); return; }
    if (selected?.is_leaf) { onChange?.(id); return; }

    onChange?.(null);
    await fetchChildrenCached(id, setLoadingLevel3);
  };

  // Handler Level 3 berubah → fetch Level 4 bila belum leaf
  const handleLevel3Change = async (e) => {
    const id = e.target.value;
    const selected = level3Options.find((item) => String(item.id) === id);
    setLevel3Id(id);
    setLevel4Id('');

    if (!id) { onChange?.(null); return; }
    if (selected?.is_leaf) { onChange?.(id); return; }

    onChange?.(null);
    await fetchChildrenCached(id, setLoadingLevel4);
  };

  // Handler Level 4 berubah → set value akhir
  const handleLevel4Change = (e) => {
    const id = e.target.value;
    setLevel4Id(id);
    onChange?.(id || null);
  };

  // Options untuk Level 2, 3, dan 4 — ambil dari cache
  const level2Options = level1Id ? childrenMap[level1Id] || [] : [];
  const level3Options = level2Id ? childrenMap[level2Id] || [] : [];
  const level4Options = level3Id ? childrenMap[level3Id] || [] : [];
  const selectedLevel2 = level2Options.find((item) => String(item.id) === level2Id);
  const selectedLevel3 = level3Options.find((item) => String(item.id) === level3Id);
  const level2IsLeaf = Boolean(selectedLevel2?.is_leaf);
  const level3IsLeaf = Boolean(selectedLevel3?.is_leaf);

  const selectBaseClass = `
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
    disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
  `;

  return (
    <div className="space-y-3">
      {/* Search box */}
      <div ref={searchRef} className="relative">
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Cari Klasifikasi
        </label>
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
            placeholder="Ketik nama atau kode klasifikasi…"
            className={`
              block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
              pl-9 pr-3 text-sm text-[#0B1F3A] placeholder-[#94A3B8]
              transition-all duration-200
              focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
              disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
            `}
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

        {/* Search results dropdown */}
        {showResults && (
          <ul className="absolute z-50 mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white shadow-lg max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <li className="px-3 py-2 text-sm text-[#94A3B8]">Tidak ada hasil.</li>
            ) : (
              searchResults.map((item) => (
                <li
                  key={item.id}
                  onMouseDown={() => handleSearchSelect(item)}
                  className="flex flex-col gap-0.5 px-3 py-2 cursor-pointer hover:bg-[#F0F7FF] transition-colors duration-150"
                >
                  <span className="text-sm font-medium text-[#0B1F3A]">{item.name}</span>
                  <span className="text-xs text-[#64748B]">
                    {item.ancestors.map((a) => a.name).concat(item.name).join(' › ')}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* 4 dropdown bertingkat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Level 1 — Klasifikasi Utama */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
            Level 1
          </label>
          <select
            value={level1Id}
            onChange={handleLevel1Change}
            disabled={disabled || loadingRoots}
            className={selectBaseClass}
          >
            <option value="">
              {loadingRoots ? 'Memuat...' : '— Pilih Level 1 —'}
            </option>
            {roots.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} — {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2 — Sub-klasifikasi */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
            Level 2
          </label>
          <select
            value={level2Id}
            onChange={handleLevel2Change}
            disabled={disabled || !level1Id || loadingLevel2}
            className={selectBaseClass}
          >
            <option value="">
              {loadingLevel2 ? 'Memuat...' : '— Pilih Level 2 —'}
            </option>
            {level2Options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 3 — Sub-detail */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
            Level 3
          </label>
          <select
            value={level3Id}
            onChange={handleLevel3Change}
            disabled={disabled || !level2Id || level2IsLeaf || loadingLevel3}
            className={selectBaseClass}
          >
            <option value="">
              {loadingLevel3 ? 'Memuat...' : '— Pilih Level 3 —'}
            </option>
            {level3Options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 4 — Detail akhir */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
            Level 4
          </label>
          <select
            value={level4Id}
            onChange={handleLevel4Change}
            disabled={disabled || !level3Id || level3IsLeaf || loadingLevel4}
            className={selectBaseClass}
          >
            <option value="">
              {loadingLevel4 ? 'Memuat...' : '— Pilih Level 4 —'}
            </option>
            {level4Options.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
