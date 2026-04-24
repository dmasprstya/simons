<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Rekapitulasi Nomor Surat</title>
    <style>
        @page {
            margin: 1cm 0.8cm;
            size: A4 landscape;
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 8pt;
            color: #1E293B;
            line-height: 1.4;
        }

        /* ── Header ── */
        .header {
            background-color: #E8EDF7;
            border-bottom: 2.5px solid #1B2F6E;
            padding: 10px 12px 8px;
            margin-bottom: 8px;
        }
        .header h1 {
            color: #1B2F6E;
            margin: 0;
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 3px 0 0;
            color: #64748B;
            font-size: 8.5pt;
            font-style: italic;
        }

        /* ── Filter Info ── */
        .filter-info {
            margin-bottom: 10px;
            background: #F8FAFC;
            padding: 7px 10px;
            border: 1px solid #E2E8F0;
            border-radius: 3px;
        }
        .filter-info table { width: 100%; }
        .filter-info td { padding: 2px 4px; font-size: 8pt; }
        .label { font-weight: bold; color: #1B2F6E; width: 90px; }

        /* ── Data Table ── */
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }
        table.data-table thead tr {
            background-color: #1B2F6E;
        }
        table.data-table th {
            color: #FFFFFF;
            text-align: center;
            padding: 6px 4px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 7.5pt;
            border: 1px solid #1B2F6E;
            vertical-align: middle;
        }
        table.data-table td {
            padding: 5px 4px;
            border: 1px solid #CCCCCC;
            vertical-align: middle;
            font-size: 7.5pt;
        }
        table.data-table tr:nth-child(even) td {
            background-color: #F5F7FB;
        }
        table.data-table tr:nth-child(odd) td {
            background-color: #FFFFFF;
        }

        /* ── Status Badge ── */
        .status-badge {
            padding: 2px 5px;
            border-radius: 3px;
            font-size: 6.5pt;
            font-weight: bold;
            text-transform: uppercase;
            display: inline-block;
        }
        .status-active { color: #059669; background: #ECFDF5; }
        .status-voided { color: #DC2626; background: #FEF2F2; }

        /* ── Footer Row (Total) ── */
        .footer-row td {
            background-color: #E8EDF7 !important;
            font-weight: bold;
            color: #1B2F6E;
            font-size: 8pt;
            padding: 6px 8px;
            border: 1px solid #CCCCCC;
        }

        /* ── Page Number ── */
        .page-footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: right;
            font-size: 7pt;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 4px;
        }
        .page-number:before { content: "Halaman " counter(page); }
    </style>
</head>
<body>

    {{-- Header --}}
    <div class="header">
        <h1>Laporan Rekapitulasi Nomor Surat</h1>
        <p>SIMONS — Sistem Informasi Manajemen Penomoran Surat</p>
    </div>

    {{-- Filter Info --}}
    <div class="filter-info">
        <table>
            <tr>
                <td class="label">Periode:</td>
                <td>{{ $filters['date_from'] ?? '-' }} s/d {{ $filters['date_to'] ?? '-' }}</td>
                <td class="label">Unit Kerja:</td>
                <td>{{ $filters['work_unit'] ?? 'Semua' }}</td>
                <td class="label">Diekspor:</td>
                <td style="text-align: right;">{{ now()->format('d/m/Y H:i') }}</td>
            </tr>
            <tr>
                <td class="label">Total Data:</td>
                <td colspan="5">{{ number_format($rows->count()) }} baris</td>
            </tr>
        </table>
    </div>

    {{-- Data Table --}}
    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 22px;">No</th>
                <th style="width: 62px;">Tanggal</th>
                <th style="width: 110px;">Nomor Surat</th>
                <th style="width: 28px;">Urut</th>
                <th style="width: 110px;">Klasifikasi</th>
                <th style="width: 110px;">Perihal</th>
                <th style="width: 90px;">Tujuan</th>
                <th style="width: 45px;">Sifat</th>
                <th style="width: 80px;">Pemohon</th>
                <th style="width: 80px;">Unit Kerja</th>
                <th style="width: 45px;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $index => $row)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td style="text-align: center;">
                        {{ \Carbon\Carbon::parse($row->issued_date)->format('d/m/Y') }}
                    </td>
                    <td style="font-family: 'Courier New', monospace; font-weight: bold; font-size: 7pt; text-align: center;">
                        {{ $row->formatted_number ?: $row->number }}
                    </td>
                    <td style="text-align: center;">{{ $row->number }}</td>
                    <td>{{ $row->classification }}</td>
                    <td>{{ $row->subject }}</td>
                    <td>{{ $row->destination ?? '-' }}</td>
                    <td style="text-align: center;">
                        @php
                            $sifatLabels = [
                                'sangat_segera' => 'Sangat Segera',
                                'segera' => 'Segera',
                                'penting' => 'Penting',
                                'biasa' => 'Biasa',
                                'rahasia' => 'Rahasia',
                            ];
                        @endphp
                        {{ $sifatLabels[$row->sifat_surat] ?? $row->sifat_surat ?? '-' }}
                    </td>
                    <td>{{ $row->requested_by }}</td>
                    <td>{{ $row->work_unit }}</td>
                    <td style="text-align: center;">
                        <span class="status-badge {{ $row->status === 'active' ? 'status-active' : 'status-voided' }}">
                            {{ $row->status }}
                        </span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" style="text-align: center; padding: 20px; color: #94A3B8;">
                        Tidak ada data yang ditemukan untuk periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>

        {{-- Footer Row --}}
        <tfoot>
            <tr class="footer-row">
                <td colspan="11" style="text-align: right;">
                    TOTAL RECORDS: {{ number_format($rows->count()) }}
                </td>
            </tr>
        </tfoot>
    </table>

    <div class="page-footer">
        <span class="page-number"></span>
    </div>

</body>
</html>