import Badge from './Badge';

/**
 * StatusChip — Wrapper Badge khusus untuk status sistem.
 *
 * Props:
 *   status — string status dari backend
 *
 * Mapping status → variant + label Indonesia:
 *   'active'   → success  "Aktif"
 *   'voided'   → danger   "Dibatalkan"
 *   'pending'  → warning  "Menunggu"
 *   'approved' → success  "Disetujui"
 *   'rejected' → danger   "Ditolak"
 */

const statusConfig = {
  active:   { variant: 'success', label: 'Aktif' },
  voided:   { variant: 'danger',  label: 'Dibatalkan' },
  pending:  { variant: 'warning', label: 'Menunggu' },
  approved: { variant: 'success', label: 'Disetujui' },
  rejected: { variant: 'danger',  label: 'Ditolak' },
};

export default function StatusChip({ status }) {
  const config = statusConfig[status] || { variant: 'default', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
