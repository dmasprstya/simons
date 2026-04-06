import { useState, useEffect, useCallback } from 'react';
import { useClassificationStore } from '../../store/classificationStore';
import { getRoots, getChildren } from '../../api/classifications.api';

/**
 * ClassificationPicker — 3 dropdown bertingkat untuk memilih klasifikasi surat.
 *
 * Props:
 *   value     — classification_id yang terpilih (Level 3)
 *   onChange  — callback(classificationId) saat Level 3 dipilih
 *   disabled  — boolean, nonaktifkan semua dropdown
 *
 * Alur:
 *   1. Fetch root classifications (Level 1) — cache di classificationStore
 *   2. Saat Level 1 dipilih, fetch children Level 2 — cache di childrenMap
 *   3. Saat Level 2 dipilih, fetch children Level 3 — cache di childrenMap
 *   4. Hanya Level 3 (is_leaf=true) yang bisa dipilih sebagai value akhir
 *
 * Cache: Tidak fetch ulang jika children sudah ada di store (childrenMap)
 */
export default function ClassificationPicker({ value, onChange, disabled = false }) {
  const { roots, setRoots, childrenMap, setChildren } = useClassificationStore();

  // State untuk seleksi tiap level
  const [level1Id, setLevel1Id] = useState('');
  const [level2Id, setLevel2Id] = useState('');
  const [level3Id, setLevel3Id] = useState(value || '');

  // Loading state per level
  const [loadingRoots, setLoadingRoots] = useState(false);
  const [loadingLevel2, setLoadingLevel2] = useState(false);
  const [loadingLevel3, setLoadingLevel3] = useState(false);

  // Fetch root classifications (Level 1) — hanya jika belum ada di store
  useEffect(() => {
    if (roots.length > 0) return;

    let cancelled = false;
    const fetchRoots = async () => {
      setLoadingRoots(true);
      try {
        const res = await getRoots();
        if (!cancelled) {
          setRoots(res.data || []);
        }
      } catch {
        // Error ditangani oleh interceptor global
      } finally {
        if (!cancelled) setLoadingRoots(false);
      }
    };
    fetchRoots();
    return () => { cancelled = true; };
  }, [roots.length, setRoots]);

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

  // Handler Level 1 berubah → fetch Level 2, reset Level 2 & 3
  const handleLevel1Change = async (e) => {
    const id = e.target.value;
    setLevel1Id(id);
    setLevel2Id('');
    setLevel3Id('');
    onChange?.(null); // Reset value akhir saat level 1 berubah

    if (id) {
      await fetchChildrenCached(id, setLoadingLevel2);
    }
  };

  // Handler Level 2 berubah → fetch Level 3, reset Level 3
  const handleLevel2Change = async (e) => {
    const id = e.target.value;
    setLevel2Id(id);
    setLevel3Id('');
    onChange?.(null); // Reset value akhir saat level 2 berubah

    if (id) {
      await fetchChildrenCached(id, setLoadingLevel3);
    }
  };

  // Handler Level 3 berubah → set value akhir
  const handleLevel3Change = (e) => {
    const id = e.target.value;
    setLevel3Id(id);
    onChange?.(id || null);
  };

  // Options untuk Level 2 dan 3 — ambil dari cache
  const level2Options = level1Id ? childrenMap[level1Id] || [] : [];
  const level3Options = level2Id ? childrenMap[level2Id] || [] : [];

  const selectBaseClass = `
    block w-full h-9 rounded-lg border border-[#E2E8F0] bg-[#F7F9FC]
    px-3 text-sm text-[#0B1F3A]
    transition-all duration-200
    focus:border-[#2A7FD4] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2A7FD4]/20
    disabled:bg-[#F7F9FC] disabled:text-[#94A3B8] disabled:cursor-not-allowed
  `;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
              {item.code} — {item.name}
            </option>
          ))}
        </select>
      </div>

      {/* Level 3 — Detail (is_leaf) */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide text-[#0B1F3A] mb-1">
          Level 3
        </label>
        <select
          value={level3Id}
          onChange={handleLevel3Change}
          disabled={disabled || !level2Id || loadingLevel3}
          className={selectBaseClass}
        >
          <option value="">
            {loadingLevel3 ? 'Memuat...' : '— Pilih Level 3 —'}
          </option>
          {level3Options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.code} — {item.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
