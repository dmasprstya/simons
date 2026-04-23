<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Rekapitulasi Nomor Surat</title>
    <style>
        @page {
            margin: 1cm;
        }
        body {
            font-family: 'Helvetica', sans-serif;
            font-size: 9pt;
            color: #334155;
            line-height: 1.4;
        }
        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #1B2F6E;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #1B2F6E;
            margin: 0;
            font-size: 18pt;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0;
            color: #64748B;
            font-size: 10pt;
        }
        .filter-info {
            margin-bottom: 15px;
            background: #F8FAFC;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #E2E8F0;
        }
        .filter-info table {
            width: 100%;
        }
        .filter-info td {
            padding: 2px 0;
        }
        .label {
            font-weight: bold;
            color: #1B2F6E;
            width: 120px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table.data-table th {
            background-color: #1B2F6E;
            color: white;
            text-align: left;
            padding: 8px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8pt;
        }
        table.data-table td {
            padding: 8px;
            border-bottom: 1px solid #E2E8F0;
            vertical-align: top;
        }
        table.data-table tr:nth-child(even) {
            background-color: #F8FAFC;
        }
        .status-badge {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-active { color: #059669; background: #ECFDF5; }
        .status-voided { color: #DC2626; background: #FEF2F2; }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: right;
            font-size: 8pt;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 5px;
        }
        .page-number:before {
            content: "Halaman " counter(page);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Rekapitulasi Nomor Surat</h1>
        <p>SIMONS — Sistem Informasi Manajemen Penomoran Surat</p>
    </div>

    <div class="filter-info">
        <table>
            <tr>
                <td class="label">Periode:</td>
                <td>{{ $filters['date_from'] ?? '-' }} s/d {{ $filters['date_to'] ?? '-' }}</td>
                <td class="label">Diekspor:</td>
                <td style="text-align: right;">{{ now()->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td class="label">Total Data:</td>
                <td>{{ number_format($rows->count()) }} baris</td>
                <td class="label">Unit Kerja:</td>
                <td style="text-align: right;">{{ $filters['work_unit'] ?? 'Semua' }}</td>
            </tr>
        </table>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 20px;">No</th>
                <th style="width: 70px;">Tanggal</th>
                <th style="width: 120px;">Nomor Surat</th>
                <th>Klasifikasi</th>
                <th style="width: 180px;">Perihal</th>
                <th style="width: 90px;">Pemohon</th>
                <th style="width: 80px;">Unit Kerja</th>
                <th style="width: 50px;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $index => $row)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($row->issued_date)->format('d/m/Y') }}</td>
                    <td style="font-family: monospace; font-weight: bold;">
                        {{ $row->formatted_number ?: $row->number }}
                    </td>
                    <td>{{ $row->classification }}</td>
                    <td>{{ $row->subject }}</td>
                    <td>{{ $row->requested_by }}</td>
                    <td>{{ $row->work_unit }}</td>
                    <td>
                        <span class="status-badge {{ $row->status === 'active' ? 'status-active' : 'status-voided' }}">
                            {{ $row->status }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px; color: #94A3B8;">
                        Tidak ada data yang ditemukan untuk periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <span class="page-number"></span>
    </div>
</body>
</html>
