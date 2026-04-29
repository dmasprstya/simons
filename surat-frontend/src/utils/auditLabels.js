export const ACTION_LABELS = {
  'letter.created': 'Surat Dibuat',
  'letter.updated': 'Detail Surat Diperbarui',
  'letter.voided': 'Surat Dibatalkan',
  'gap_request.created': 'Permintaan Gap Diajukan',
  'gap_request.status_changed': 'Status Permintaan Gap Diubah',
  'gap.approved': 'Gap Disetujui',
  'gap.rejected': 'Gap Ditolak',
  'user.create': 'User Dibuat',
  'user.update': 'User Diperbarui',
  'user.delete': 'User Dihapus',
  'user.toggle_active': 'Status User Diubah',
  'user.change_password': 'Password User Direset',
  'auth.login': 'Masuk',
  'auth.logout': 'Keluar',
  'profile.update': 'Profil Diperbarui',
  'profile.change_password': 'Password Profil Diubah',
  'profile.photo_upload': 'Foto Profil Diunggah',
  'profile.photo_delete': 'Foto Profil Dihapus',
  'classification.create': 'Klasifikasi Dibuat',
  'classification.update': 'Klasifikasi Diperbarui',
  'classification.delete': 'Klasifikasi Dihapus',
  'report.exported': 'Laporan Diekspor',
};

export function getActionLabel(action) {
  return ACTION_LABELS[action] || action;
}

export function getActionColor(action) {
  const label = getActionLabel(action);
  const act = label.toLowerCase();
  
  if (act.includes('dibuat') || act.includes('disetujui') || act.includes('masuk')) {
    return 'text-[#065F46] bg-[#ECFDF5]';
  }
  if (act.includes('dibatalkan') || act.includes('ditolak') || act.includes('dihapus')) {
    return 'text-[#991B1B] bg-[#FEF2F2]';
  }
  if (act.includes('diperbarui') || act.includes('diubah') || act.includes('password')) {
    return 'text-[#185FA5] bg-[#EBF4FD]';
  }
  if (act.includes('diminta')) {
    return 'text-amber-700 bg-amber-50';
  }
  return 'text-[#64748B] bg-[#F7F9FC]';
}

export function getDashboardActionColor(action) {
  const label = getActionLabel(action);
  const act = label.toLowerCase();

  if (act.includes('dibuat') || act.includes('disetujui') || act.includes('masuk')) {
    return 'bg-emerald-50 text-emerald-700';
  }
  if (act.includes('dibatalkan') || act.includes('ditolak') || act.includes('dihapus')) {
    return 'bg-red-50 text-red-700';
  }
  if (act.includes('diperbarui') || act.includes('diubah') || act.includes('password')) {
    return 'bg-primary-light text-primary';
  }
  if (act.includes('diminta')) {
    return 'bg-amber-50 text-amber-700';
  }
  return 'bg-[#F7F9FC] text-[#64748B]';
}
