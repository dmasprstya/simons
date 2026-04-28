-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 20, 2026 at 10:44 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `simons`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `record_id` bigint UNSIGNED NOT NULL,
  `old_data` json DEFAULT NULL,
  `new_data` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `ip_address`, `created_at`) VALUES
(1, 2, 'letter.created', 'letter_numbers', 1, NULL, '{\"id\": 1, \"number\": 1000, \"status\": \"active\", \"subject\": \"sss\", \"user_id\": 2, \"created_at\": \"2026-04-16T12:50:35.000000Z\", \"destination\": \"dfdfdf\", \"issued_date\": \"2026-04-16T00:00:00.000000Z\", \"sifat_surat\": \"biasa\", \"formatted_number\": \"W7-PR.01.02-1000\", \"classification_id\": \"53\"}', '127.0.0.1', '2026-04-16 05:50:35'),
(2, 1, 'classification.created', 'letter_classifications', 72, NULL, '{\"id\": 72, \"code\": \"05.04\", \"name\": \"Tingkat Kantor Wilayah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 66, \"created_at\": \"2026-04-16T12:51:13.000000Z\"}', '127.0.0.1', '2026-04-16 05:51:13'),
(3, 1, 'classification.deleted', 'letter_classifications', 71, '{\"id\": 71, \"code\": \"TEST999\", \"name\": \"Test\", \"type\": \"substantif\", \"level\": 1, \"is_leaf\": true, \"is_active\": false, \"parent_id\": null, \"created_at\": \"2026-04-16T12:29:11.000000Z\"}', NULL, '127.0.0.1', '2026-04-16 06:21:28'),
(4, 1, 'classification.deleted', 'letter_classifications', 70, '{\"id\": 70, \"code\": \"PR.05.04\", \"name\": \"Tingkat Kantor Wilayah\", \"type\": \"fasilitatif\", \"level\": 4, \"is_leaf\": true, \"is_active\": false, \"parent_id\": 67, \"created_at\": \"2026-04-16T12:20:12.000000Z\"}', NULL, '127.0.0.1', '2026-04-16 06:21:44'),
(5, 1, 'classification.deleted', 'letter_classifications', 72, '{\"id\": 72, \"code\": \"05.04\", \"name\": \"Tingkat Kantor Wilayah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 66, \"created_at\": \"2026-04-16T12:51:13.000000Z\"}', NULL, '127.0.0.1', '2026-04-16 06:21:49'),
(6, 1, 'classification.created', 'letter_classifications', 73, NULL, '{\"id\": 73, \"code\": \"PR.05.04\", \"name\": \"Tingkat Kantor Wilayah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 66, \"created_at\": \"2026-04-16T13:25:19.000000Z\"}', '127.0.0.1', '2026-04-16 06:25:19'),
(7, 1, 'classification.created', 'letter_classifications', 74, NULL, '{\"id\": 74, \"code\": \"PR.05.05\", \"name\": \"Rapat Pimpinan dan Rapat Staf\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 66, \"created_at\": \"2026-04-16T13:25:52.000000Z\"}', '127.0.0.1', '2026-04-16 06:25:52'),
(8, 1, 'classification.created', 'letter_classifications', 75, NULL, '{\"id\": 75, \"code\": \"PR.06\", \"name\": \"Sidang Kabinet\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 50, \"created_at\": \"2026-04-16T13:26:29.000000Z\"}', '127.0.0.1', '2026-04-16 06:26:29'),
(9, 1, 'classification.created', 'letter_classifications', 76, NULL, '{\"id\": 76, \"code\": \"PR.06.01\", \"name\": \"Sidang Kabinet Terbatas\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 75, \"created_at\": \"2026-04-16T13:27:03.000000Z\"}', '127.0.0.1', '2026-04-16 06:27:03'),
(10, 1, 'classification.created', 'letter_classifications', 77, NULL, '{\"id\": 77, \"code\": \"PR.06.02\", \"name\": \"Sidang Kabinet Paripurna\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 75, \"created_at\": \"2026-04-16T13:27:25.000000Z\"}', '127.0.0.1', '2026-04-16 06:27:25'),
(11, 1, 'classification.created', 'letter_classifications', 78, NULL, '{\"id\": 78, \"code\": \"OT\", \"name\": \"ORGANISASI DAN TATA LAKSANA\", \"type\": \"fasilitatif\", \"level\": 1, \"is_leaf\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T13:28:40.000000Z\"}', '127.0.0.1', '2026-04-16 06:28:40'),
(12, 1, 'classification.created', 'letter_classifications', 79, NULL, '{\"id\": 79, \"code\": \"OT.01\", \"name\": \"Organisasi dan Tata Kerja\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 78, \"created_at\": \"2026-04-16T13:30:59.000000Z\"}', '127.0.0.1', '2026-04-16 06:30:59'),
(13, 1, 'classification.created', 'letter_classifications', 80, NULL, '{\"id\": 80, \"code\": \"OT.01.01\", \"name\": \"Organisasi dan Tata Kerja Kementerian\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 79, \"created_at\": \"2026-04-16T13:32:36.000000Z\"}', '127.0.0.1', '2026-04-16 06:32:36'),
(14, 1, 'classification.created', 'letter_classifications', 81, NULL, '{\"id\": 81, \"code\": \"OT.01.02\", \"name\": \"Organisasi dan Tata Kerja Kantor Wilayah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 79, \"created_at\": \"2026-04-16T13:33:13.000000Z\"}', '127.0.0.1', '2026-04-16 06:33:13'),
(15, 1, 'classification.created', 'letter_classifications', 82, NULL, '{\"id\": 82, \"code\": \"OT.01.03\", \"name\": \"Organisasi dan Tata Kerja UPT\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 79, \"created_at\": \"2026-04-16T13:33:37.000000Z\"}', '127.0.0.1', '2026-04-16 06:33:37'),
(16, 1, 'classification.created', 'letter_classifications', 83, NULL, '{\"id\": 83, \"code\": \"OT.01.04\", \"name\": \"Evaluasi Kelembagaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 79, \"created_at\": \"2026-04-16T13:34:04.000000Z\"}', '127.0.0.1', '2026-04-16 06:34:04'),
(17, 1, 'classification.created', 'letter_classifications', 84, NULL, '{\"id\": 84, \"code\": \"OT.02\", \"name\": \"Ketatalaksanaan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 78, \"created_at\": \"2026-04-16T13:34:42.000000Z\"}', '127.0.0.1', '2026-04-16 06:34:42'),
(18, 1, 'classification.created', 'letter_classifications', 85, NULL, '{\"id\": 85, \"code\": \"OT.02.01\", \"name\": \"Standarisasi Sarana Kerja\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 84, \"created_at\": \"2026-04-16T13:35:15.000000Z\"}', '127.0.0.1', '2026-04-16 06:35:15'),
(19, 1, 'classification.created', 'letter_classifications', 86, NULL, '{\"id\": 86, \"code\": \"OT.02.02\", \"name\": \"Sistem, Prosedur dan Metoda Kerja\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 84, \"created_at\": \"2026-04-16T13:35:36.000000Z\"}', '127.0.0.1', '2026-04-16 06:35:36'),
(20, 1, 'classification.created', 'letter_classifications', 87, NULL, '{\"id\": 87, \"code\": \"OT.02.03\", \"name\": \"Analisa dan Uraian Jabatan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 84, \"created_at\": \"2026-04-16T13:36:05.000000Z\"}', '127.0.0.1', '2026-04-16 06:36:05'),
(21, 1, 'classification.created', 'letter_classifications', 88, NULL, '{\"id\": 88, \"code\": \"OT.03\", \"name\": \"Reformasi Birokrasi\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 78, \"created_at\": \"2026-04-16T13:36:52.000000Z\"}', '127.0.0.1', '2026-04-16 06:36:52'),
(22, 1, 'classification.created', 'letter_classifications', 89, NULL, '{\"id\": 89, \"code\": \"OT.03.01\", \"name\": \"Penilaian Mandiri Pelaksanaan Reformasi Birokrasi (PMPRB)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 88, \"created_at\": \"2026-04-16T13:37:17.000000Z\"}', '127.0.0.1', '2026-04-16 06:37:17'),
(23, 1, 'classification.created', 'letter_classifications', 90, NULL, '{\"id\": 90, \"code\": \"OT.03.02\", \"name\": \"Zona Integritas (ZI)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 88, \"created_at\": \"2026-04-16T13:37:50.000000Z\"}', '127.0.0.1', '2026-04-16 06:37:50'),
(24, 1, 'classification.created', 'letter_classifications', 91, NULL, '{\"id\": 91, \"code\": \"OT.03.03\", \"name\": \"Evaluasi Reformasi Birokrasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 88, \"created_at\": \"2026-04-16T13:38:18.000000Z\"}', '127.0.0.1', '2026-04-16 06:38:18'),
(25, 1, 'classification.created', 'letter_classifications', 92, NULL, '{\"id\": 92, \"code\": \"OT.04\", \"name\": \"Instruksi Menteri\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 78, \"created_at\": \"2026-04-16T13:38:51.000000Z\"}', '127.0.0.1', '2026-04-16 06:38:51'),
(26, 1, 'classification.created', 'letter_classifications', 93, NULL, '{\"id\": 93, \"code\": \"KP.01.03\", \"name\": \"Usulan Formasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 21, \"created_at\": \"2026-04-16T13:41:56.000000Z\"}', '127.0.0.1', '2026-04-16 06:41:56'),
(27, 1, 'classification.created', 'letter_classifications', 94, NULL, '{\"id\": 94, \"code\": \"KP.01.04\", \"name\": \"Alokasi Formasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 21, \"created_at\": \"2026-04-16T13:42:37.000000Z\"}', '127.0.0.1', '2026-04-16 06:42:37'),
(28, 1, 'classification.created', 'letter_classifications', 95, NULL, '{\"id\": 95, \"code\": \"KP.02.03\", \"name\": \"Surat Keputusan CPNS/PNS Kolektif\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 24, \"created_at\": \"2026-04-16T13:44:11.000000Z\"}', '127.0.0.1', '2026-04-16 06:44:11'),
(29, 1, 'classification.created', 'letter_classifications', 96, NULL, '{\"id\": 96, \"code\": \"KP.02.04\", \"name\": \"Penerimaan Pegawai dari Politeknik Ilmu Pemasyarakatan dan AIM\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 24, \"created_at\": \"2026-04-16T13:44:36.000000Z\"}', '127.0.0.1', '2026-04-16 06:44:36'),
(30, 1, 'classification.created', 'letter_classifications', 97, NULL, '{\"id\": 97, \"code\": \"KP.02.05\", \"name\": \"Ujian Dinas dan Ujian Penyusaian Ijazah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 24, \"created_at\": \"2026-04-16T13:44:58.000000Z\"}', '127.0.0.1', '2026-04-16 06:44:58'),
(31, 1, 'classification.created', 'letter_classifications', 98, NULL, '{\"id\": 98, \"code\": \"KP.03.03\", \"name\": \"Pengangkatan Jabatan Struktural\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 27, \"created_at\": \"2026-04-16T13:47:21.000000Z\"}', '127.0.0.1', '2026-04-16 06:47:21'),
(32, 1, 'classification.created', 'letter_classifications', 99, NULL, '{\"id\": 99, \"code\": \"KP.03.04\", \"name\": \"Pengangkatan Jabatan Fungsional\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 27, \"created_at\": \"2026-04-16T13:47:48.000000Z\"}', '127.0.0.1', '2026-04-16 06:47:48'),
(33, 1, 'classification.created', 'letter_classifications', 100, NULL, '{\"id\": 100, \"code\": \"KP.04\", \"name\": \"Mutasi Pegawai\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T13:48:25.000000Z\"}', '127.0.0.1', '2026-04-16 06:48:25'),
(34, 1, 'classification.created', 'letter_classifications', 101, NULL, '{\"id\": 101, \"code\": \"KP.04.01\", \"name\": \"Alih Tugas/Diperbantukan/Dipekerjakan/Pelaksana\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:48:53.000000Z\"}', '127.0.0.1', '2026-04-16 06:48:53'),
(35, 1, 'classification.created', 'letter_classifications', 102, NULL, '{\"id\": 102, \"code\": \"KP.04.02\", \"name\": \"Pelaksana Harian/Pelaksana Tugas\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:49:16.000000Z\"}', '127.0.0.1', '2026-04-16 06:49:16'),
(36, 1, 'classification.created', 'letter_classifications', 103, NULL, '{\"id\": 103, \"code\": \"KP.04.03\", \"name\": \"Pencantuman gelar Akadmik\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:50:00.000000Z\"}', '127.0.0.1', '2026-04-16 06:50:00'),
(37, 1, 'classification.created', 'letter_classifications', 104, NULL, '{\"id\": 104, \"code\": \"KP.04.04\", \"name\": \"Kenaikan Gaji Berkala (KGB)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:50:21.000000Z\"}', '127.0.0.1', '2026-04-16 06:50:21'),
(38, 1, 'classification.created', 'letter_classifications', 105, NULL, '{\"id\": 105, \"code\": \"KP.04.05\", \"name\": \"Kenaikan Pangkat/Golongan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:50:56.000000Z\"}', '127.0.0.1', '2026-04-16 06:50:56'),
(39, 1, 'classification.created', 'letter_classifications', 106, NULL, '{\"id\": 106, \"code\": \"KP.04.06\", \"name\": \"Peninjauan Masa Kerja\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:51:28.000000Z\"}', '127.0.0.1', '2026-04-16 06:51:28'),
(40, 1, 'classification.created', 'letter_classifications', 107, NULL, '{\"id\": 107, \"code\": \"KP.04.07\", \"name\": \"Berkas Badan Pertimbangan Jabatan dan Kepangkatan (Baperjakat)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:51:49.000000Z\"}', '127.0.0.1', '2026-04-16 06:51:49'),
(41, 1, 'classification.created', 'letter_classifications', 108, NULL, '{\"id\": 108, \"code\": \"KP.04.08\", \"name\": \"Pengaktifan Kembali dari CLTN dan Hukuman Disiplin\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 100, \"created_at\": \"2026-04-16T13:52:11.000000Z\"}', '127.0.0.1', '2026-04-16 06:52:11'),
(42, 1, 'classification.created', 'letter_classifications', 109, NULL, '{\"id\": 109, \"code\": \"KP.05\", \"name\": \"Pembinaan Pegawai\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T13:53:07.000000Z\"}', '127.0.0.1', '2026-04-16 06:53:07'),
(43, 1, 'classification.created', 'letter_classifications', 110, NULL, '{\"id\": 110, \"code\": \"KP.05.01\", \"name\": \"Penilaian Prestasi Kerja Pegawai ( PPKP )\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 109, \"created_at\": \"2026-04-16T13:53:29.000000Z\"}', '127.0.0.1', '2026-04-16 06:53:29'),
(44, 1, 'classification.created', 'letter_classifications', 111, NULL, '{\"id\": 111, \"code\": \"KP.05.02\", \"name\": \"Pembinaan Disiplin dan Kode Etik\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 109, \"created_at\": \"2026-04-16T13:53:49.000000Z\"}', '127.0.0.1', '2026-04-16 06:53:49'),
(45, 1, 'classification.created', 'letter_classifications', 112, NULL, '{\"id\": 112, \"code\": \"KP.05.03\", \"name\": \"Pemberian Penghargaan dan Tanda Jasa\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 109, \"created_at\": \"2026-04-16T13:54:13.000000Z\"}', '127.0.0.1', '2026-04-16 06:54:13'),
(46, 1, 'classification.created', 'letter_classifications', 113, NULL, '{\"id\": 113, \"code\": \"KP.06\", \"name\": \"Pengembangan Pegawai\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T13:54:44.000000Z\"}', '127.0.0.1', '2026-04-16 06:54:44'),
(47, 1, 'classification.created', 'letter_classifications', 114, NULL, '{\"id\": 114, \"code\": \"KP.06.01\", \"name\": \"Pengembangan Kompetensi Jabatan Pimpinan Tinggi dan Adminstrasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 113, \"created_at\": \"2026-04-16T13:55:21.000000Z\"}', '127.0.0.1', '2026-04-16 06:55:21'),
(48, 1, 'classification.created', 'letter_classifications', 115, NULL, '{\"id\": 115, \"code\": \"KP.06.02\", \"name\": \"Pengembangan Kompetensi Fungsional\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 113, \"created_at\": \"2026-04-16T13:55:52.000000Z\"}', '127.0.0.1', '2026-04-16 06:55:52'),
(49, 1, 'classification.created', 'letter_classifications', 116, NULL, '{\"id\": 116, \"code\": \"KP.06.03\", \"name\": \"Pengiriman Peserta Diklat\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 113, \"created_at\": \"2026-04-16T13:56:12.000000Z\"}', '127.0.0.1', '2026-04-16 06:56:12'),
(50, 1, 'classification.created', 'letter_classifications', 117, NULL, '{\"id\": 117, \"code\": \"KP.06.04\", \"name\": \"Bea Siswa\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 113, \"created_at\": \"2026-04-16T13:56:36.000000Z\"}', '127.0.0.1', '2026-04-16 06:56:36'),
(51, 1, 'classification.created', 'letter_classifications', 118, NULL, '{\"id\": 118, \"code\": \"KP.07\", \"name\": \"Hukuman Disiplin\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T13:57:01.000000Z\"}', '127.0.0.1', '2026-04-16 06:57:01'),
(52, 1, 'classification.created', 'letter_classifications', 119, NULL, '{\"id\": 119, \"code\": \"KP.07.01\", \"name\": \"Tingkat Ringan (Pernyataatnn Tidak Puas, Teguran Lisan, Teguran Tertulis)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 118, \"created_at\": \"2026-04-16T13:57:27.000000Z\"}', '127.0.0.1', '2026-04-16 06:57:27'),
(53, 1, 'classification.created', 'letter_classifications', 120, NULL, '{\"id\": 120, \"code\": \"KP.07.02\", \"name\": \"Tingkat Sedang (Penundaan KGB, KP dan Penurunan Gaji)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 118, \"created_at\": \"2026-04-16T13:57:56.000000Z\"}', '127.0.0.1', '2026-04-16 06:57:56'),
(54, 1, 'classification.created', 'letter_classifications', 121, NULL, '{\"id\": 121, \"code\": \"KP.07.03\", \"name\": \"Tingkat Berat (Penurunan Pangkat, Pembebasan Jabatan, Pemberhentian Dengan Hormat/Tidak Dengan Hormat)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 118, \"created_at\": \"2026-04-16T13:58:17.000000Z\"}', '127.0.0.1', '2026-04-16 06:58:17'),
(55, 1, 'classification.created', 'letter_classifications', 122, NULL, '{\"id\": 122, \"code\": \"KP.08\", \"name\": \"Tata Usaha Kepegawaian\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T13:58:50.000000Z\"}', '127.0.0.1', '2026-04-16 06:58:50'),
(56, 1, 'classification.created', 'letter_classifications', 123, NULL, '{\"id\": 123, \"code\": \"KP.08.01\", \"name\": \"Data Pegawai\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 122, \"created_at\": \"2026-04-16T13:59:15.000000Z\"}', '127.0.0.1', '2026-04-16 06:59:15'),
(57, 1, 'classification.created', 'letter_classifications', 124, NULL, '{\"id\": 124, \"code\": \"KP.08.02\", \"name\": \"Identitas Pegawai (Karpeg, Karsu, Karis)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 122, \"created_at\": \"2026-04-16T13:59:35.000000Z\"}', '127.0.0.1', '2026-04-16 06:59:35'),
(58, 1, 'classification.created', 'letter_classifications', 125, NULL, '{\"id\": 125, \"code\": \"KP.08.03\", \"name\": \"Izin Kepegawaian (Izin Belajar, Tugas Belajar Dalam Negeri dan Luar Negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 122, \"created_at\": \"2026-04-16T13:59:56.000000Z\"}', '127.0.0.1', '2026-04-16 06:59:56'),
(59, 1, 'classification.created', 'letter_classifications', 126, NULL, '{\"id\": 126, \"code\": \"KP.08.04\", \"name\": \"Keanggotaan Pegawai Dalam Organisasi Sosial\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 122, \"created_at\": \"2026-04-16T14:00:19.000000Z\"}', '127.0.0.1', '2026-04-16 07:00:19'),
(60, 1, 'classification.created', 'letter_classifications', 127, NULL, '{\"id\": 127, \"code\": \"KP.08.05\", \"name\": \"Daftar Hadir/Absensi Pegawai\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 122, \"created_at\": \"2026-04-16T14:00:42.000000Z\"}', '127.0.0.1', '2026-04-16 07:00:42'),
(61, 1, 'classification.created', 'letter_classifications', 128, NULL, '{\"id\": 128, \"code\": \"KP.09\", \"name\": \"Kesejahteraan Pegawai\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T14:01:13.000000Z\"}', '127.0.0.1', '2026-04-16 07:01:13'),
(62, 1, 'classification.created', 'letter_classifications', 129, NULL, '{\"id\": 129, \"code\": \"KP.09.01\", \"name\": \"Kesehatan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:01:38.000000Z\"}', '127.0.0.1', '2026-04-16 07:01:38'),
(63, 1, 'classification.created', 'letter_classifications', 130, NULL, '{\"id\": 130, \"code\": \"KP.09.02\", \"name\": \"Perumahan (TAPERUM, Biaya Uang Muka)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:02:00.000000Z\"}', '127.0.0.1', '2026-04-16 07:02:00'),
(64, 1, 'classification.created', 'letter_classifications', 131, NULL, '{\"id\": 131, \"code\": \"KP.09.03\", \"name\": \"Taspen\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:02:23.000000Z\"}', '127.0.0.1', '2026-04-16 07:02:23'),
(65, 1, 'classification.created', 'letter_classifications', 132, NULL, '{\"id\": 132, \"code\": \"KP.09.04\", \"name\": \"Cuti\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:02:43.000000Z\"}', '127.0.0.1', '2026-04-16 07:02:43'),
(66, 1, 'classification.created', 'letter_classifications', 133, NULL, '{\"id\": 133, \"code\": \"KP.09.05\", \"name\": \"Uang Duka Tewas\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:03:14.000000Z\"}', '127.0.0.1', '2026-04-16 07:03:14'),
(67, 1, 'classification.created', 'letter_classifications', 134, NULL, '{\"id\": 134, \"code\": \"KP.09.06\", \"name\": \"Pembekalan Purnabakti\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:03:41.000000Z\"}', '127.0.0.1', '2026-04-16 07:03:41'),
(68, 1, 'classification.created', 'letter_classifications', 135, NULL, '{\"id\": 135, \"code\": \"KP.09.07\", \"name\": \"Mutasi Keluarga\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:04:05.000000Z\"}', '127.0.0.1', '2026-04-16 07:04:05'),
(69, 1, 'classification.created', 'letter_classifications', 136, NULL, '{\"id\": 136, \"code\": \"KP.09.08\", \"name\": \"Laporan Kekayaan (LP2P dan LHKPN)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 128, \"created_at\": \"2026-04-16T14:04:32.000000Z\"}', '127.0.0.1', '2026-04-16 07:04:32'),
(70, 1, 'classification.created', 'letter_classifications', 137, NULL, '{\"id\": 137, \"code\": \"KP.10\", \"name\": \"Pembinaan Jabatan Fungsional\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T14:05:11.000000Z\"}', '127.0.0.1', '2026-04-16 07:05:11'),
(71, 1, 'classification.created', 'letter_classifications', 138, NULL, '{\"id\": 138, \"code\": \"KP.10.01\", \"name\": \"Jabatan Fungsional Umum\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 137, \"created_at\": \"2026-04-16T14:05:35.000000Z\"}', '127.0.0.1', '2026-04-16 07:05:35'),
(72, 1, 'classification.created', 'letter_classifications', 139, NULL, '{\"id\": 139, \"code\": \"KP.10.02\", \"name\": \"Jabatan Fungsional Tertentu\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 137, \"created_at\": \"2026-04-16T14:06:00.000000Z\"}', '127.0.0.1', '2026-04-16 07:06:00'),
(73, 1, 'classification.created', 'letter_classifications', 140, NULL, '{\"id\": 140, \"code\": \"KP.11\", \"name\": \"Pemberhentian Pegawai\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T14:06:33.000000Z\"}', '127.0.0.1', '2026-04-16 07:06:33'),
(74, 1, 'classification.created', 'letter_classifications', 141, NULL, '{\"id\": 141, \"code\": \"KP.11.01\", \"name\": \"Pemberhentian Atas Permintaan Sendiri\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 140, \"created_at\": \"2026-04-16T14:06:59.000000Z\"}', '127.0.0.1', '2026-04-16 07:06:59'),
(75, 1, 'classification.created', 'letter_classifications', 142, NULL, '{\"id\": 142, \"code\": \"KP.11.02\", \"name\": \"Pemberhentian Karena Batas Usia Pensiun\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 140, \"created_at\": \"2026-04-16T14:07:21.000000Z\"}', '127.0.0.1', '2026-04-16 07:07:21'),
(76, 1, 'classification.created', 'letter_classifications', 143, NULL, '{\"id\": 143, \"code\": \"KP.11.03\", \"name\": \"Pemberhentian Karena Keuzuran/Kondisi Jasmani dan Rohani\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 140, \"created_at\": \"2026-04-16T14:07:44.000000Z\"}', '127.0.0.1', '2026-04-16 07:07:44'),
(77, 1, 'classification.created', 'letter_classifications', 144, NULL, '{\"id\": 144, \"code\": \"KP.11.04\", \"name\": \"Pemberhentian Karena Hilang\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 140, \"created_at\": \"2026-04-16T14:08:10.000000Z\"}', '127.0.0.1', '2026-04-16 07:08:10'),
(78, 1, 'classification.created', 'letter_classifications', 145, NULL, '{\"id\": 145, \"code\": \"KP.11.05\", \"name\": \"Pemberhentian Sementara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 140, \"created_at\": \"2026-04-16T14:08:31.000000Z\"}', '127.0.0.1', '2026-04-16 07:08:31'),
(79, 1, 'classification.created', 'letter_classifications', 146, NULL, '{\"id\": 146, \"code\": \"KP.11.06\", \"name\": \"Pensiun Janda/Duda dan Anak\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 140, \"created_at\": \"2026-04-16T14:08:54.000000Z\"}', '127.0.0.1', '2026-04-16 07:08:54'),
(80, 1, 'classification.created', 'letter_classifications', 147, NULL, '{\"id\": 147, \"code\": \"KP.12\", \"name\": \"Berkas PNS/ASN\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T14:09:25.000000Z\"}', '127.0.0.1', '2026-04-16 07:09:25'),
(81, 1, 'classification.created', 'letter_classifications', 148, NULL, '{\"id\": 148, \"code\": \"KP.13\", \"name\": \"Berkas Perseorangan Menteri, Wakil Menteri dan Pejabat Negara lainnya\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T14:10:35.000000Z\"}', '127.0.0.1', '2026-04-16 07:10:35'),
(82, 1, 'classification.created', 'letter_classifications', 149, NULL, '{\"id\": 149, \"code\": \"KP.14\", \"name\": \"Organisasi Non Kedinasan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 20, \"created_at\": \"2026-04-16T14:11:15.000000Z\"}', '127.0.0.1', '2026-04-16 07:11:15'),
(83, 1, 'classification.created', 'letter_classifications', 150, NULL, '{\"id\": 150, \"code\": \"KP.14.01\", \"name\": \"KORPRI\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 149, \"created_at\": \"2026-04-16T14:11:44.000000Z\"}', '127.0.0.1', '2026-04-16 07:11:44'),
(84, 1, 'classification.created', 'letter_classifications', 151, NULL, '{\"id\": 151, \"code\": \"KP.14.02\", \"name\": \"Dharma Wanita\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 149, \"created_at\": \"2026-04-16T14:12:10.000000Z\"}', '127.0.0.1', '2026-04-16 07:12:10'),
(85, 1, 'classification.created', 'letter_classifications', 152, NULL, '{\"id\": 152, \"code\": \"KP.14.03\", \"name\": \"Koperasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 149, \"created_at\": \"2026-04-16T14:12:41.000000Z\"}', '127.0.0.1', '2026-04-16 07:12:41'),
(86, 1, 'classification.created', 'letter_classifications', 153, NULL, '{\"id\": 153, \"code\": \"KU.02.03\", \"name\": \"Pejabat Perbendaharaan Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 34, \"created_at\": \"2026-04-16T14:17:15.000000Z\"}', '127.0.0.1', '2026-04-16 07:17:15'),
(87, 1, 'classification.created', 'letter_classifications', 154, NULL, '{\"id\": 154, \"code\": \"KU.02.04\", \"name\": \"Penyelesaian Kerugian Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 34, \"created_at\": \"2026-04-16T14:17:45.000000Z\"}', '127.0.0.1', '2026-04-16 07:17:45'),
(88, 1, 'classification.created', 'letter_classifications', 155, NULL, '{\"id\": 155, \"code\": \"KU.02.05\", \"name\": \"Penatausahaan Rekening Pemerintah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 34, \"created_at\": \"2026-04-16T14:18:28.000000Z\"}', '127.0.0.1', '2026-04-16 07:18:28'),
(89, 1, 'classification.created', 'letter_classifications', 156, NULL, '{\"id\": 156, \"code\": \"KU.03.03\", \"name\": \"LPJ Bendahara Pengeluaran\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 37, \"created_at\": \"2026-04-16T14:20:51.000000Z\"}', '127.0.0.1', '2026-04-16 07:20:51'),
(90, 1, 'classification.created', 'letter_classifications', 157, NULL, '{\"id\": 157, \"code\": \"KU.03.04\", \"name\": \"Bendahara Penerimaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 37, \"created_at\": \"2026-04-16T14:21:14.000000Z\"}', '127.0.0.1', '2026-04-16 07:21:14'),
(91, 1, 'classification.created', 'letter_classifications', 158, NULL, '{\"id\": 158, \"code\": \"KU.03.05\", \"name\": \"Penerimaan Negara Pajak\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 37, \"created_at\": \"2026-04-16T14:21:43.000000Z\"}', '127.0.0.1', '2026-04-16 07:21:43'),
(92, 1, 'classification.created', 'letter_classifications', 159, NULL, '{\"id\": 159, \"code\": \"KU.04\", \"name\": \"Akuntansi dan Pelaporan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 30, \"created_at\": \"2026-04-16T14:22:29.000000Z\"}', '127.0.0.1', '2026-04-16 07:22:29'),
(93, 1, 'classification.created', 'letter_classifications', 160, NULL, '{\"id\": 160, \"code\": \"KU.04.01\", \"name\": \"Laporan Keuangan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 159, \"created_at\": \"2026-04-16T14:23:04.000000Z\"}', '127.0.0.1', '2026-04-16 07:23:04'),
(94, 1, 'classification.created', 'letter_classifications', 161, NULL, '{\"id\": 161, \"code\": \"KU.04.02\", \"name\": \"Rekonsiliasi dan Data Laporan Keuangan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 159, \"created_at\": \"2026-04-16T14:23:30.000000Z\"}', '127.0.0.1', '2026-04-16 07:23:30'),
(95, 1, 'classification.created', 'letter_classifications', 162, NULL, '{\"id\": 162, \"code\": \"KU.04.03\", \"name\": \"Penyelesaian Tindak Lanjut Temuan Hasil Pemeriksaan BPK dan Inspektorat Jenderal.\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 159, \"created_at\": \"2026-04-16T14:24:08.000000Z\"}', '127.0.0.1', '2026-04-16 07:24:08'),
(96, 1, 'classification.created', 'letter_classifications', 163, NULL, '{\"id\": 163, \"code\": \"PB\", \"name\": \"Pengelolaan Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 1, \"is_leaf\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T14:26:48.000000Z\"}', '127.0.0.1', '2026-04-16 07:26:48'),
(97, 1, 'classification.created', 'letter_classifications', 164, NULL, '{\"id\": 164, \"code\": \"PB 01\", \"name\": \"Perencanaan Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 163, \"created_at\": \"2026-04-16T14:27:34.000000Z\"}', '127.0.0.1', '2026-04-16 07:27:34'),
(98, 1, 'classification.created', 'letter_classifications', 165, NULL, '{\"id\": 165, \"code\": \"PB.01.01\", \"name\": \"Usulan Rencana Kebutuhan BMN\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 164, \"created_at\": \"2026-04-16T14:28:12.000000Z\"}', '127.0.0.1', '2026-04-16 07:28:12'),
(99, 1, 'classification.created', 'letter_classifications', 166, NULL, '{\"id\": 166, \"code\": \"PB.01.02\", \"name\": \"Rencana Kebutuhan BMN Kementerian\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 164, \"created_at\": \"2026-04-16T14:28:56.000000Z\"}', '127.0.0.1', '2026-04-16 07:28:56'),
(100, 1, 'classification.created', 'letter_classifications', 167, NULL, '{\"id\": 167, \"code\": \"PB.01.03\", \"name\": \"Hasil Analisis Kebutuhan BMN\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 164, \"created_at\": \"2026-04-16T14:29:20.000000Z\"}', '127.0.0.1', '2026-04-16 07:29:20'),
(101, 1, 'classification.created', 'letter_classifications', 168, NULL, '{\"id\": 168, \"code\": \"PB.01.04\", \"name\": \"Rencana Kebutuhan Aset Berwujud\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 164, \"created_at\": \"2026-04-16T14:29:45.000000Z\"}', '127.0.0.1', '2026-04-16 07:29:45'),
(102, 1, 'classification.created', 'letter_classifications', 169, NULL, '{\"id\": 169, \"code\": \"PB.01.05\", \"name\": \"Rencana Kebutuhan Aset tak Berwujud\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 164, \"created_at\": \"2026-04-16T14:31:36.000000Z\"}', '127.0.0.1', '2026-04-16 07:31:36'),
(103, 1, 'classification.created', 'letter_classifications', 170, NULL, '{\"id\": 170, \"code\": \"PB.02\", \"name\": \"Pengadaan Barang Milik Negara (Layanan Pengadaan)\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 163, \"created_at\": \"2026-04-16T14:32:15.000000Z\"}', '127.0.0.1', '2026-04-16 07:32:15'),
(104, 1, 'classification.created', 'letter_classifications', 171, NULL, '{\"id\": 171, \"code\": \"PB.02.01\", \"name\": \"Pengelolaan Pengadaan Barang/Jasa\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 163, \"created_at\": \"2026-04-16T14:32:42.000000Z\"}', '127.0.0.1', '2026-04-16 07:32:42'),
(105, 1, 'classification.deleted', 'letter_classifications', 171, '{\"id\": 171, \"code\": \"PB.02.01\", \"name\": \"Pengelolaan Pengadaan Barang/Jasa\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 163, \"created_at\": \"2026-04-16T14:32:42.000000Z\"}', NULL, '127.0.0.1', '2026-04-16 07:33:14'),
(106, 1, 'classification.created', 'letter_classifications', 172, NULL, '{\"id\": 172, \"code\": \"PB.02.01\", \"name\": \"Pengelolaan Pengadaan Barang/Jasa\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:33:49.000000Z\"}', '127.0.0.1', '2026-04-16 07:33:49'),
(107, 1, 'classification.created', 'letter_classifications', 173, NULL, '{\"id\": 173, \"code\": \"PB.02.02\", \"name\": \"Pengelolaan layanan pengadaan secara elektronik dan data informasi pengadaan barang/jasa\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:34:30.000000Z\"}', '127.0.0.1', '2026-04-16 07:34:30'),
(108, 1, 'classification.created', 'letter_classifications', 174, NULL, '{\"id\": 174, \"code\": \"PB.02.03\", \"name\": \"Pembinaan, Bimbingan, Pendampingan, dan Konsultasi Teknis Pengadaan Barang/Jasa\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:35:02.000000Z\"}', '127.0.0.1', '2026-04-16 07:35:02'),
(109, 1, 'classification.created', 'letter_classifications', 175, NULL, '{\"id\": 175, \"code\": \"PB.02.04\", \"name\": \"Tindaklanjut Hasil Pemeriksaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:35:27.000000Z\"}', '127.0.0.1', '2026-04-16 07:35:27'),
(110, 1, 'classification.created', 'letter_classifications', 176, NULL, '{\"id\": 176, \"code\": \"PB.02.05\", \"name\": \"Laporan Pengadaan Barang/Jasa\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:35:53.000000Z\"}', '127.0.0.1', '2026-04-16 07:35:53'),
(111, 1, 'classification.created', 'letter_classifications', 177, NULL, '{\"id\": 177, \"code\": \"PB.02.06\", \"name\": \"Telaahan Permasalahan Pengadaan Barang/Jasa\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:36:24.000000Z\"}', '127.0.0.1', '2026-04-16 07:36:24'),
(112, 1, 'classification.created', 'letter_classifications', 178, NULL, '{\"id\": 178, \"code\": \"PB.02.07\", \"name\": \"Unit Kerja Pengadaan Barang dan Jasa (UKPBJ)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:36:50.000000Z\"}', '127.0.0.1', '2026-04-16 07:36:50'),
(113, 1, 'classification.created', 'letter_classifications', 179, NULL, '{\"id\": 179, \"code\": \"PB.02.08\", \"name\": \"Pendistribusian Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 170, \"created_at\": \"2026-04-16T14:37:13.000000Z\"}', '127.0.0.1', '2026-04-16 07:37:13'),
(114, 1, 'classification.created', 'letter_classifications', 180, NULL, '{\"id\": 180, \"code\": \"PB.03\", \"name\": \"Penetapan Status dan Pengamanan Barang Milik Negara (BMN)\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 163, \"created_at\": \"2026-04-16T14:37:43.000000Z\"}', '127.0.0.1', '2026-04-16 07:37:43'),
(115, 1, 'classification.created', 'letter_classifications', 181, NULL, '{\"id\": 181, \"code\": \"PB.03.01\", \"name\": \"Penggunaan Barang Milik Negara (BMN)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 180, \"created_at\": \"2026-04-16T14:38:28.000000Z\"}', '127.0.0.1', '2026-04-16 07:38:28'),
(116, 1, 'classification.created', 'letter_classifications', 182, NULL, '{\"id\": 182, \"code\": \"PB.03.02\", \"name\": \"Pemanfaatan Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 180, \"created_at\": \"2026-04-16T14:38:55.000000Z\"}', '127.0.0.1', '2026-04-16 07:38:55'),
(117, 1, 'classification.created', 'letter_classifications', 183, NULL, '{\"id\": 183, \"code\": \"PB.03.03\", \"name\": \"Pengamanan dan Pemeliharaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 180, \"created_at\": \"2026-04-16T14:39:17.000000Z\"}', '127.0.0.1', '2026-04-16 07:39:17'),
(118, 1, 'classification.created', 'letter_classifications', 184, NULL, '{\"id\": 184, \"code\": \"PB.03.04\", \"name\": \"Rumah Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 180, \"created_at\": \"2026-04-16T14:39:39.000000Z\"}', '127.0.0.1', '2026-04-16 07:39:39'),
(119, 1, 'classification.created', 'letter_classifications', 185, NULL, '{\"id\": 185, \"code\": \"PB.04\", \"name\": \"Penatausahaan Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 163, \"created_at\": \"2026-04-16T14:40:10.000000Z\"}', '127.0.0.1', '2026-04-16 07:40:10'),
(120, 1, 'classification.created', 'letter_classifications', 186, NULL, '{\"id\": 186, \"code\": \"PB.04.01\", \"name\": \"Pencatataan Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 185, \"created_at\": \"2026-04-16T14:40:37.000000Z\"}', '127.0.0.1', '2026-04-16 07:40:37'),
(121, 1, 'classification.created', 'letter_classifications', 187, NULL, '{\"id\": 187, \"code\": \"PB.04.02\", \"name\": \"Inventarisasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 185, \"created_at\": \"2026-04-16T14:41:01.000000Z\"}', '127.0.0.1', '2026-04-16 07:41:01'),
(122, 1, 'classification.created', 'letter_classifications', 188, NULL, '{\"id\": 188, \"code\": \"PB.04.03\", \"name\": \"Opname fisik\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 185, \"created_at\": \"2026-04-16T14:41:35.000000Z\"}', '127.0.0.1', '2026-04-16 07:41:35'),
(123, 1, 'classification.created', 'letter_classifications', 189, NULL, '{\"id\": 189, \"code\": \"PB.04.04\", \"name\": \"Rekonsiliasi data Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 185, \"created_at\": \"2026-04-16T14:42:00.000000Z\"}', '127.0.0.1', '2026-04-16 07:42:00'),
(124, 1, 'classification.created', 'letter_classifications', 190, NULL, '{\"id\": 190, \"code\": \"PB.04.05\", \"name\": \"Pengawasan dan Pengedalian BMN\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 185, \"created_at\": \"2026-04-16T14:42:26.000000Z\"}', '127.0.0.1', '2026-04-16 07:42:26'),
(125, 1, 'classification.created', 'letter_classifications', 191, NULL, '{\"id\": 191, \"code\": \"PB.04.06\", \"name\": \"Laporan Barang Milik Negara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 185, \"created_at\": \"2026-04-16T14:42:46.000000Z\"}', '127.0.0.1', '2026-04-16 07:42:46'),
(126, 1, 'classification.created', 'letter_classifications', 192, NULL, '{\"id\": 192, \"code\": \"PB.05\", \"name\": \"Pemindahtanganan dan Penghapusan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 163, \"created_at\": \"2026-04-16T14:43:15.000000Z\"}', '127.0.0.1', '2026-04-16 07:43:15'),
(127, 1, 'classification.created', 'letter_classifications', 193, NULL, '{\"id\": 193, \"code\": \"PB.05.01\", \"name\": \"Penjualan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 192, \"created_at\": \"2026-04-16T14:43:38.000000Z\"}', '127.0.0.1', '2026-04-16 07:43:38'),
(128, 1, 'classification.created', 'letter_classifications', 194, NULL, '{\"id\": 194, \"code\": \"PB.05.02\", \"name\": \"Tukar Menukar\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 192, \"created_at\": \"2026-04-16T14:43:59.000000Z\"}', '127.0.0.1', '2026-04-16 07:43:59'),
(129, 1, 'classification.created', 'letter_classifications', 195, NULL, '{\"id\": 195, \"code\": \"PB.05.03\", \"name\": \"Hibah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 192, \"created_at\": \"2026-04-16T14:44:19.000000Z\"}', '127.0.0.1', '2026-04-16 07:44:19'),
(130, 1, 'classification.created', 'letter_classifications', 196, NULL, '{\"id\": 196, \"code\": \"PB.05.04\", \"name\": \"Pemusnahan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 192, \"created_at\": \"2026-04-16T14:44:38.000000Z\"}', '127.0.0.1', '2026-04-16 07:44:38'),
(131, 1, 'classification.created', 'letter_classifications', 197, NULL, '{\"id\": 197, \"code\": \"PB.05.05\", \"name\": \"Penghapusan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 192, \"created_at\": \"2026-04-16T14:44:57.000000Z\"}', '127.0.0.1', '2026-04-16 07:44:57'),
(132, 1, 'classification.created', 'letter_classifications', 198, NULL, '{\"id\": 198, \"code\": \"HH\", \"name\": \"Kehumasan dan Hukum\", \"type\": \"fasilitatif\", \"level\": 1, \"is_leaf\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T14:45:43.000000Z\"}', '127.0.0.1', '2026-04-16 07:45:43'),
(133, 1, 'classification.created', 'letter_classifications', 199, NULL, '{\"id\": 199, \"code\": \"HH.01\", \"name\": \"Informasi dan Komunikasi\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 198, \"created_at\": \"2026-04-16T14:46:16.000000Z\"}', '127.0.0.1', '2026-04-16 07:46:16'),
(134, 1, 'classification.created', 'letter_classifications', 200, NULL, '{\"id\": 200, \"code\": \"HH.01.01\", \"name\": \"Media Massa (Cetak, Elektronik, Media Sosial)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 199, \"created_at\": \"2026-04-16T14:46:39.000000Z\"}', '127.0.0.1', '2026-04-16 07:46:39'),
(135, 1, 'classification.created', 'letter_classifications', 201, NULL, '{\"id\": 201, \"code\": \"HH.01.02\", \"name\": \"Sosialisasi dan Diseminasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 199, \"created_at\": \"2026-04-16T14:47:20.000000Z\"}', '127.0.0.1', '2026-04-16 07:47:20'),
(136, 1, 'classification.created', 'letter_classifications', 202, NULL, '{\"id\": 202, \"code\": \"HH.01.03\", \"name\": \"Pejabat Pengelola Informasi dan Dokumentasi (PPID)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 199, \"created_at\": \"2026-04-16T14:48:12.000000Z\"}', '127.0.0.1', '2026-04-16 07:48:12'),
(137, 1, 'classification.created', 'letter_classifications', 203, NULL, '{\"id\": 203, \"code\": \"HH.01.04\", \"name\": \"Badan Koordinasi Hubungan Masyarakat (Bakohumas)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 199, \"created_at\": \"2026-04-16T14:48:39.000000Z\"}', '127.0.0.1', '2026-04-16 07:48:39'),
(138, 1, 'classification.created', 'letter_classifications', 204, NULL, '{\"id\": 204, \"code\": \"HH.01.05\", \"name\": \"Peliputan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 199, \"created_at\": \"2026-04-16T14:49:00.000000Z\"}', '127.0.0.1', '2026-04-16 07:49:00'),
(139, 1, 'classification.created', 'letter_classifications', 205, NULL, '{\"id\": 205, \"code\": \"HH.01.06\", \"name\": \"Konferensi Pers\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 199, \"created_at\": \"2026-04-16T14:49:26.000000Z\"}', '127.0.0.1', '2026-04-16 07:49:26'),
(140, 1, 'classification.created', 'letter_classifications', 206, NULL, '{\"id\": 206, \"code\": \"HH.01.07\", \"name\": \"Siaran Pers\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 199, \"created_at\": \"2026-04-16T14:49:49.000000Z\"}', '127.0.0.1', '2026-04-16 07:49:49'),
(141, 1, 'classification.created', 'letter_classifications', 207, NULL, '{\"id\": 207, \"code\": \"HH.02\", \"name\": \"Dokumentasi\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 198, \"created_at\": \"2026-04-16T14:50:23.000000Z\"}', '127.0.0.1', '2026-04-16 07:50:23'),
(142, 1, 'classification.created', 'letter_classifications', 208, NULL, '{\"id\": 208, \"code\": \"HH.02.01\", \"name\": \"Produk Informasi (Media Cetak, Elektronik, Media Sosial)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 207, \"created_at\": \"2026-04-16T14:50:52.000000Z\"}', '127.0.0.1', '2026-04-16 07:50:52'),
(143, 1, 'classification.created', 'letter_classifications', 209, NULL, '{\"id\": 209, \"code\": \"HH.02.02\", \"name\": \"Rekapitulasi Pemberitaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 207, \"created_at\": \"2026-04-16T14:51:15.000000Z\"}', '127.0.0.1', '2026-04-16 07:51:15'),
(144, 1, 'classification.created', 'letter_classifications', 210, NULL, '{\"id\": 210, \"code\": \"HH.03\", \"name\": \"Kepustakaan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 198, \"created_at\": \"2026-04-16T14:52:04.000000Z\"}', '127.0.0.1', '2026-04-16 07:52:04'),
(145, 1, 'classification.created', 'letter_classifications', 211, NULL, '{\"id\": 211, \"code\": \"HH.03.01\", \"name\": \"Akusisi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:52:31.000000Z\"}', '127.0.0.1', '2026-04-16 07:52:31'),
(146, 1, 'classification.created', 'letter_classifications', 212, NULL, '{\"id\": 212, \"code\": \"HH.03.02\", \"name\": \"Pengolahan Bahan Pustaka\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:53:08.000000Z\"}', '127.0.0.1', '2026-04-16 07:53:08'),
(147, 1, 'classification.created', 'letter_classifications', 213, NULL, '{\"id\": 213, \"code\": \"HH.03.03\", \"name\": \"Pangkalan Data Koleksi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:53:34.000000Z\"}', '127.0.0.1', '2026-04-16 07:53:34'),
(148, 1, 'classification.created', 'letter_classifications', 214, NULL, '{\"id\": 214, \"code\": \"HH.03.04\", \"name\": \"Layanan Perpustakaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:53:55.000000Z\"}', '127.0.0.1', '2026-04-16 07:53:55'),
(149, 1, 'classification.created', 'letter_classifications', 215, NULL, '{\"id\": 215, \"code\": \"HH.03.05\", \"name\": \"Preservasi Bahan Pustaka\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:54:18.000000Z\"}', '127.0.0.1', '2026-04-16 07:54:18'),
(150, 1, 'classification.created', 'letter_classifications', 216, NULL, '{\"id\": 216, \"code\": \"HH.03.06\", \"name\": \"Pengembangan Perpustakaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:54:48.000000Z\"}', '127.0.0.1', '2026-04-16 07:54:48'),
(151, 1, 'classification.created', 'letter_classifications', 217, NULL, '{\"id\": 217, \"code\": \"HH.03.07\", \"name\": \"Pendidikan dan Pelatihan Perpustakaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:55:56.000000Z\"}', '127.0.0.1', '2026-04-16 07:55:56'),
(152, 1, 'classification.created', 'letter_classifications', 218, NULL, '{\"id\": 218, \"code\": \"HH.03.08\", \"name\": \"Tenaga Perpustakaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 210, \"created_at\": \"2026-04-16T14:56:18.000000Z\"}', '127.0.0.1', '2026-04-16 07:56:18'),
(153, 1, 'classification.created', 'letter_classifications', 219, NULL, '{\"id\": 219, \"code\": \"HH.04\", \"name\": \"Kerja Sama/Hubungan Lembaga dan Organisasi Kemasyarakatan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 198, \"created_at\": \"2026-04-16T14:57:16.000000Z\"}', '127.0.0.1', '2026-04-16 07:57:16'),
(154, 1, 'classification.created', 'letter_classifications', 220, NULL, '{\"id\": 220, \"code\": \"HH.04.01\", \"name\": \"Lembaga Tinggi Negara (dalam negeri dan luar negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T14:58:06.000000Z\"}', '127.0.0.1', '2026-04-16 07:58:06');
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `table_name`, `record_id`, `old_data`, `new_data`, `ip_address`, `created_at`) VALUES
(155, 1, 'classification.created', 'letter_classifications', 221, NULL, '{\"id\": 221, \"code\": \"HH.04.02\", \"name\": \"Lembaga Pemerintah (dalam negeri dan luar negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T14:58:52.000000Z\"}', '127.0.0.1', '2026-04-16 07:58:52'),
(156, 1, 'classification.created', 'letter_classifications', 222, NULL, '{\"id\": 222, \"code\": \"HH.04.03\", \"name\": \"Organisasi Kemasyarakatan/Lembaga Swasta (dalam negeri dan luar negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T14:59:56.000000Z\"}', '127.0.0.1', '2026-04-16 07:59:56'),
(157, 1, 'classification.created', 'letter_classifications', 223, NULL, '{\"id\": 223, \"code\": \"HH.04.04\", \"name\": \"Perguruan Tinggi/Sekolah (dalam negeri dan luar negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T15:00:41.000000Z\"}', '127.0.0.1', '2026-04-16 08:00:41'),
(158, 1, 'classification.created', 'letter_classifications', 224, NULL, '{\"id\": 224, \"code\": \"04.05\", \"name\": \"Penyusunan Dokumen Kerja Sama (dalam negeri dan luar negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T15:01:11.000000Z\"}', '127.0.0.1', '2026-04-16 08:01:11'),
(159, 1, 'classification.created', 'letter_classifications', 225, NULL, '{\"id\": 225, \"code\": \"HH.04.06\", \"name\": \"Permintaan dan Pengelolaan Data Kerja Sama (dalam negeri dan luar negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T15:02:40.000000Z\"}', '127.0.0.1', '2026-04-16 08:02:40'),
(160, 1, 'classification.created', 'letter_classifications', 226, NULL, '{\"id\": 226, \"code\": \"HH.04.07\", \"name\": \"Audiensi/Kunjungan (Kementerian/Lembaga, Organisasi Kemasyarakatan/Lembaga Swasta, Organisasi Internasional/Organisasi Internasional Non Pemerintah)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T15:03:21.000000Z\"}', '127.0.0.1', '2026-04-16 08:03:21'),
(161, 1, 'classification.created', 'letter_classifications', 227, NULL, '{\"id\": 227, \"code\": \"HH.04.08\", \"name\": \"Pemantauan dan Evaluasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T15:03:53.000000Z\"}', '127.0.0.1', '2026-04-16 08:03:53'),
(162, 1, 'classification.created', 'letter_classifications', 228, NULL, '{\"id\": 228, \"code\": \"HH.04.09\", \"name\": \"Administrasi Kerja Sama\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 219, \"created_at\": \"2026-04-16T15:04:21.000000Z\"}', '127.0.0.1', '2026-04-16 08:04:21'),
(163, 1, 'classification.created', 'letter_classifications', 229, NULL, '{\"id\": 229, \"code\": \"HH.05\", \"name\": \"Layanan Advokasi Hukum\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 198, \"created_at\": \"2026-04-16T15:04:55.000000Z\"}', '127.0.0.1', '2026-04-16 08:04:55'),
(164, 1, 'classification.created', 'letter_classifications', 230, NULL, '{\"id\": 230, \"code\": \"HH.05.01\", \"name\": \"Advokasi Hukum Litigasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 229, \"created_at\": \"2026-04-16T15:05:20.000000Z\"}', '127.0.0.1', '2026-04-16 08:05:20'),
(165, 1, 'classification.created', 'letter_classifications', 231, NULL, '{\"id\": 231, \"code\": \"HH.05.02\", \"name\": \"Advokasi Hukum Non Litigasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 229, \"created_at\": \"2026-04-16T15:05:43.000000Z\"}', '127.0.0.1', '2026-04-16 08:05:43'),
(166, 1, 'classification.created', 'letter_classifications', 232, NULL, '{\"id\": 232, \"code\": \"HH.05.03\", \"name\": \"Pengaduan Hukum\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 229, \"created_at\": \"2026-04-16T15:06:05.000000Z\"}', '127.0.0.1', '2026-04-16 08:06:05'),
(167, 1, 'classification.created', 'letter_classifications', 233, NULL, '{\"id\": 233, \"code\": \"HH.05.04\", \"name\": \"Bantuan Hukum\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 229, \"created_at\": \"2026-04-16T15:06:32.000000Z\"}', '127.0.0.1', '2026-04-16 08:06:32'),
(168, 1, 'classification.created', 'letter_classifications', 234, NULL, '{\"id\": 234, \"code\": \"HH.05.05\", \"name\": \"Layanan Aspirasi Dan Pengaduan Online Rakyat (LAPOR)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 229, \"created_at\": \"2026-04-16T15:06:57.000000Z\"}', '127.0.0.1', '2026-04-16 08:06:57'),
(169, 1, 'classification.created', 'letter_classifications', 235, NULL, '{\"id\": 235, \"code\": \"HH.05.06\", \"name\": \"Sistem Informasi Pelayanan Publik (SIPP)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 229, \"created_at\": \"2026-04-16T15:07:26.000000Z\"}', '127.0.0.1', '2026-04-16 08:07:26'),
(170, 1, 'classification.created', 'letter_classifications', 236, NULL, '{\"id\": 236, \"code\": \"UM\", \"name\": \"UMUM\", \"type\": \"fasilitatif\", \"level\": 1, \"is_leaf\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T15:07:58.000000Z\"}', '127.0.0.1', '2026-04-16 08:07:58'),
(171, 1, 'classification.created', 'letter_classifications', 237, NULL, '{\"id\": 237, \"code\": \"UM.01\", \"name\": \"Ketatausahaan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 236, \"created_at\": \"2026-04-16T15:08:51.000000Z\"}', '127.0.0.1', '2026-04-16 08:08:51'),
(172, 1, 'classification.created', 'letter_classifications', 238, NULL, '{\"id\": 238, \"code\": \"UM.01.01\", \"name\": \"Persuratan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 237, \"created_at\": \"2026-04-16T15:09:16.000000Z\"}', '127.0.0.1', '2026-04-16 08:09:16'),
(173, 1, 'classification.created', 'letter_classifications', 239, NULL, '{\"id\": 239, \"code\": \"UM.01.02\", \"name\": \"Ucapan Terima Kasih/Ucapan Selamat\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 237, \"created_at\": \"2026-04-16T15:09:43.000000Z\"}', '127.0.0.1', '2026-04-16 08:09:43'),
(174, 1, 'classification.created', 'letter_classifications', 240, NULL, '{\"id\": 240, \"code\": \"UM.02\", \"name\": \"Kearsipan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 236, \"created_at\": \"2026-04-16T15:10:49.000000Z\"}', '127.0.0.1', '2026-04-16 08:10:49'),
(175, 1, 'classification.created', 'letter_classifications', 241, NULL, '{\"id\": 241, \"code\": \"UM.02.01\", \"name\": \"Pemindahan Arsip\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 240, \"created_at\": \"2026-04-16T15:11:16.000000Z\"}', '127.0.0.1', '2026-04-16 08:11:16'),
(176, 1, 'classification.created', 'letter_classifications', 242, NULL, '{\"id\": 242, \"code\": \"UM.02.02\", \"name\": \"Pemusnahan Arsip\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 240, \"created_at\": \"2026-04-16T15:11:51.000000Z\"}', '127.0.0.1', '2026-04-16 08:11:51'),
(177, 1, 'classification.created', 'letter_classifications', 243, NULL, '{\"id\": 243, \"code\": \"UM.02.03\", \"name\": \"Penyerahan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 240, \"created_at\": \"2026-04-16T15:12:23.000000Z\"}', '127.0.0.1', '2026-04-16 08:12:23'),
(178, 1, 'classification.created', 'letter_classifications', 244, NULL, '{\"id\": 244, \"code\": \"UM 03\", \"name\": \"Kerumahtanggaan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 236, \"created_at\": \"2026-04-16T15:12:59.000000Z\"}', '127.0.0.1', '2026-04-16 08:12:59'),
(179, 1, 'classification.created', 'letter_classifications', 245, NULL, '{\"id\": 245, \"code\": \"UM.03.01\", \"name\": \"Penggunaan Ruang dan Peralatan Kantor\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:13:38.000000Z\"}', '127.0.0.1', '2026-04-16 08:13:38'),
(180, 1, 'classification.created', 'letter_classifications', 246, NULL, '{\"id\": 246, \"code\": \"UM.03.02\", \"name\": \"Penggunaan dan Penghunian Rumah Negara serta Wisma Pengayoman\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:14:09.000000Z\"}', '127.0.0.1', '2026-04-16 08:14:09'),
(181, 1, 'classification.created', 'letter_classifications', 247, NULL, '{\"id\": 247, \"code\": \"UM.03.03\", \"name\": \"Penggunaan dan Pemeliharaan Kendaraan Dinas\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:14:33.000000Z\"}', '127.0.0.1', '2026-04-16 08:14:33'),
(182, 1, 'classification.created', 'letter_classifications', 248, NULL, '{\"id\": 248, \"code\": \"UM.03.04\", \"name\": \"Penggunaan dan Pemeliharaan Barang Elektronik serta Mesin\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:15:00.000000Z\"}', '127.0.0.1', '2026-04-16 08:15:00'),
(183, 1, 'classification.created', 'letter_classifications', 249, NULL, '{\"id\": 249, \"code\": \"UM.03.05\", \"name\": \"Pemeliharaan Gedung dan Bangunan serta Area Kantor\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:15:24.000000Z\"}', '127.0.0.1', '2026-04-16 08:15:24'),
(184, 1, 'classification.created', 'letter_classifications', 250, NULL, '{\"id\": 250, \"code\": \"UM.03.06\", \"name\": \"Pemeliharaan Alat Kesehatan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:15:51.000000Z\"}', '127.0.0.1', '2026-04-16 08:15:51'),
(185, 1, 'classification.created', 'letter_classifications', 251, NULL, '{\"id\": 251, \"code\": \"UM.03.07\", \"name\": \"Perjalanan Dinas (Dalam Negeri/Luar Negeri)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:16:17.000000Z\"}', '127.0.0.1', '2026-04-16 08:16:17'),
(186, 1, 'classification.created', 'letter_classifications', 252, NULL, '{\"id\": 252, \"code\": \"UM.03.08\", \"name\": \"Penghematan Energi dan air\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 244, \"created_at\": \"2026-04-16T15:16:40.000000Z\"}', '127.0.0.1', '2026-04-16 08:16:40'),
(187, 1, 'classification.created', 'letter_classifications', 253, NULL, '{\"id\": 253, \"code\": \"UM.04\", \"name\": \"Keprotokolan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 236, \"created_at\": \"2026-04-16T15:17:24.000000Z\"}', '127.0.0.1', '2026-04-16 08:17:24'),
(188, 1, 'classification.created', 'letter_classifications', 254, NULL, '{\"id\": 254, \"code\": \"UM.04.01\", \"name\": \"Penyelenggaraan Upacara\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 253, \"created_at\": \"2026-04-16T15:17:50.000000Z\"}', '127.0.0.1', '2026-04-16 08:17:50'),
(189, 1, 'classification.created', 'letter_classifications', 255, NULL, '{\"id\": 255, \"code\": \"UM.04.02\", \"name\": \"Pelayanan Tamu, Acara Kedinasan, Jamuan, dan Ramah Tamah\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 253, \"created_at\": \"2026-04-16T15:18:32.000000Z\"}', '127.0.0.1', '2026-04-16 08:18:32'),
(190, 1, 'classification.created', 'letter_classifications', 256, NULL, '{\"id\": 256, \"code\": \"UM.04.03\", \"name\": \"Daftar Nama Pejabat dan Alamat\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 253, \"created_at\": \"2026-04-16T15:18:55.000000Z\"}', '127.0.0.1', '2026-04-16 08:18:55'),
(191, 1, 'classification.created', 'letter_classifications', 257, NULL, '{\"id\": 257, \"code\": \"UM.05\", \"name\": \"Pengamanan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 236, \"created_at\": \"2026-04-16T15:19:26.000000Z\"}', '127.0.0.1', '2026-04-16 08:19:26'),
(192, 1, 'classification.created', 'letter_classifications', 258, NULL, '{\"id\": 258, \"code\": \"UM.05.01\", \"name\": \"Pengamanan Personil (VVIP/VIP)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 257, \"created_at\": \"2026-04-16T15:19:52.000000Z\"}', '127.0.0.1', '2026-04-16 08:19:52'),
(193, 1, 'classification.created', 'letter_classifications', 259, NULL, '{\"id\": 259, \"code\": \"UM.05.02\", \"name\": \"Pengamanan Lingkungan, Fisik dan Instalasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 257, \"created_at\": \"2026-04-16T15:20:16.000000Z\"}', '127.0.0.1', '2026-04-16 08:20:16'),
(194, 1, 'classification.created', 'letter_classifications', 260, NULL, '{\"id\": 260, \"code\": \"UM.05.03\", \"name\": \"Pengamanan Dokumen dan Informasi Rahasia\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 257, \"created_at\": \"2026-04-16T15:20:40.000000Z\"}', '127.0.0.1', '2026-04-16 08:20:40'),
(195, 1, 'classification.created', 'letter_classifications', 261, NULL, '{\"id\": 261, \"code\": \"UM.05.04\", \"name\": \"Laporan Keamanan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 257, \"created_at\": \"2026-04-16T15:21:10.000000Z\"}', '127.0.0.1', '2026-04-16 08:21:10'),
(196, 1, 'classification.created', 'letter_classifications', 262, NULL, '{\"id\": 262, \"code\": \"UM.05.05\", \"name\": \"Laporan Kejadian\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 257, \"created_at\": \"2026-04-16T15:21:34.000000Z\"}', '127.0.0.1', '2026-04-16 08:21:34'),
(197, 1, 'classification.created', 'letter_classifications', 263, NULL, '{\"id\": 263, \"code\": \"UM.05.06\", \"name\": \"Bantuan Pengamanan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 257, \"created_at\": \"2026-04-16T15:21:58.000000Z\"}', '127.0.0.1', '2026-04-16 08:21:58'),
(198, 1, 'classification.created', 'letter_classifications', 264, NULL, '{\"id\": 264, \"code\": \"UM.06\", \"name\": \"Pembinaan Sikap Mental dan Layanan Kesehatan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 236, \"created_at\": \"2026-04-16T15:22:29.000000Z\"}', '127.0.0.1', '2026-04-16 08:22:29'),
(199, 1, 'classification.created', 'letter_classifications', 265, NULL, '{\"id\": 265, \"code\": \"UM.06.01\", \"name\": \"Layanan Keagamaan dan Sosial\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 264, \"created_at\": \"2026-04-16T15:22:53.000000Z\"}', '127.0.0.1', '2026-04-16 08:22:53'),
(200, 1, 'classification.created', 'letter_classifications', 266, NULL, '{\"id\": 266, \"code\": \"UM.06.02\", \"name\": \"Layanan Kesehatan Jasmani\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 264, \"created_at\": \"2026-04-16T15:23:16.000000Z\"}', '127.0.0.1', '2026-04-16 08:23:16'),
(201, 1, 'classification.created', 'letter_classifications', 267, NULL, '{\"id\": 267, \"code\": \"UM.06.03\", \"name\": \"Pelayanan Kesehatan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 264, \"created_at\": \"2026-04-16T15:23:37.000000Z\"}', '127.0.0.1', '2026-04-16 08:23:37'),
(202, 1, 'classification.created', 'letter_classifications', 268, NULL, '{\"id\": 268, \"code\": \"PW\", \"name\": \"Pengawasan\", \"type\": \"substantif\", \"level\": 1, \"is_leaf\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T15:24:09.000000Z\"}', '127.0.0.1', '2026-04-16 08:24:09'),
(203, 1, 'classification.created', 'letter_classifications', 269, NULL, '{\"id\": 269, \"code\": \"PW.01\", \"name\": \"Perencanaan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 268, \"created_at\": \"2026-04-16T15:24:54.000000Z\"}', '127.0.0.1', '2026-04-16 08:24:54'),
(204, 1, 'classification.created', 'letter_classifications', 270, NULL, '{\"id\": 270, \"code\": \"PW.01.01\", \"name\": \"Kebijakan Pengawasan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 269, \"created_at\": \"2026-04-16T15:25:23.000000Z\"}', '127.0.0.1', '2026-04-16 08:25:23'),
(205, 1, 'classification.created', 'letter_classifications', 271, NULL, '{\"id\": 271, \"code\": \"PW.01.02\", \"name\": \"Perjanjian Kinerja\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 269, \"created_at\": \"2026-04-16T15:25:45.000000Z\"}', '127.0.0.1', '2026-04-16 08:25:45'),
(206, 1, 'classification.created', 'letter_classifications', 272, NULL, '{\"id\": 272, \"code\": \"PW.01.03\", \"name\": \"Program Kerja Pengawasan Tahunan (PKPT)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 269, \"created_at\": \"2026-04-16T15:26:06.000000Z\"}', '127.0.0.1', '2026-04-16 08:26:06'),
(207, 1, 'classification.created', 'letter_classifications', 273, NULL, '{\"id\": 273, \"code\": \"PW.01.04\", \"name\": \"Program Kerja Administrasi Umum (PKAU)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 269, \"created_at\": \"2026-04-16T15:26:32.000000Z\"}', '127.0.0.1', '2026-04-16 08:26:32'),
(208, 1, 'classification.created', 'letter_classifications', 274, NULL, '{\"id\": 274, \"code\": \"PW.01.05\", \"name\": \"Rapat Koordinasi Pengawasan (RAKORWAS)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 269, \"created_at\": \"2026-04-16T15:26:58.000000Z\"}', '127.0.0.1', '2026-04-16 08:26:58'),
(209, 1, 'classification.created', 'letter_classifications', 275, NULL, '{\"id\": 275, \"code\": \"PW.01.06\", \"name\": \"Ikhtisar Hasil Pengawasan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 269, \"created_at\": \"2026-04-16T15:27:21.000000Z\"}', '127.0.0.1', '2026-04-16 08:27:21'),
(210, 1, 'classification.created', 'letter_classifications', 276, NULL, '{\"id\": 276, \"code\": \"PW.02\", \"name\": \"Pelaksanaan Pengawasan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 268, \"created_at\": \"2026-04-16T15:27:48.000000Z\"}', '127.0.0.1', '2026-04-16 08:27:48'),
(211, 1, 'classification.created', 'letter_classifications', 277, NULL, '{\"id\": 277, \"code\": \"PW.02.01\", \"name\": \"Audit Kinerja & Informasi, Reviu dan Evaluasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 276, \"created_at\": \"2026-04-16T15:28:14.000000Z\"}', '127.0.0.1', '2026-04-16 08:28:14'),
(212, 1, 'classification.created', 'letter_classifications', 278, NULL, '{\"id\": 278, \"code\": \"PW.02.02\", \"name\": \"Audit Tujuan Tertentu/Khusus\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 276, \"created_at\": \"2026-04-16T15:28:34.000000Z\"}', '127.0.0.1', '2026-04-16 08:28:34'),
(213, 1, 'classification.created', 'letter_classifications', 279, NULL, '{\"id\": 279, \"code\": \"PW.02.03\", \"name\": \"Pemantauan/Monitoring\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 276, \"created_at\": \"2026-04-16T15:29:00.000000Z\"}', '127.0.0.1', '2026-04-16 08:29:00'),
(214, 1, 'classification.created', 'letter_classifications', 280, NULL, '{\"id\": 280, \"code\": \"PW.02.04\", \"name\": \"Pengawasan lainnya, Pendampingan, Sosialisasi, RDK, PKS dll\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 276, \"created_at\": \"2026-04-16T15:29:24.000000Z\"}', '127.0.0.1', '2026-04-16 08:29:24'),
(215, 1, 'classification.created', 'letter_classifications', 281, NULL, '{\"id\": 281, \"code\": \"PW.03\", \"name\": \"Pelaporan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 268, \"created_at\": \"2026-04-16T15:29:48.000000Z\"}', '127.0.0.1', '2026-04-16 08:29:48'),
(216, 1, 'classification.created', 'letter_classifications', 282, NULL, '{\"id\": 282, \"code\": \"PW.03.01\", \"name\": \"Laporan Hasil Audit Kinerja (LHA/LHP), Informasi Data Pendukung Pemeriksaan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 281, \"created_at\": \"2026-04-16T15:30:20.000000Z\"}', '127.0.0.1', '2026-04-16 08:30:20'),
(217, 1, 'classification.created', 'letter_classifications', 283, NULL, '{\"id\": 283, \"code\": \"PW.03.02\", \"name\": \"Laporan Hasil Audit Tujuan Tertentu (Audit Khusus)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 281, \"created_at\": \"2026-04-16T15:30:45.000000Z\"}', '127.0.0.1', '2026-04-16 08:30:45'),
(218, 1, 'classification.created', 'letter_classifications', 284, NULL, '{\"id\": 284, \"code\": \"PW.03.03\", \"name\": \"Pemantauan/Monitoring Badan Pemeriksan Keuangan (BPK RI), Badan Pengawasan Keuangan dan Pembangunan Republik Indonesia (BPKP RI),Ombudsman Republik Indonesia (ORI), Inspektorat Jenderal\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 281, \"created_at\": \"2026-04-16T15:31:19.000000Z\"}', '127.0.0.1', '2026-04-16 08:31:19'),
(219, 1, 'classification.created', 'letter_classifications', 285, NULL, '{\"id\": 285, \"code\": \"PW.03.04\", \"name\": \"Pengawasan lainnya, Pendampingan, Sosialisasi, RDK, PKS dll\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 281, \"created_at\": \"2026-04-16T15:31:49.000000Z\"}', '127.0.0.1', '2026-04-16 08:31:49'),
(220, 1, 'classification.created', 'letter_classifications', 286, NULL, '{\"id\": 286, \"code\": \"PW.03.05\", \"name\": \"Ombudsman Republik Indonesia (ORI) (Dikonsultasikan terlebih dahulu)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 281, \"created_at\": \"2026-04-16T15:32:26.000000Z\"}', '127.0.0.1', '2026-04-16 08:32:26'),
(221, 1, 'classification.created', 'letter_classifications', 287, NULL, '{\"id\": 287, \"code\": \"PW.03.06\", \"name\": \"Inspektorat Jenderal\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 281, \"created_at\": \"2026-04-16T15:32:55.000000Z\"}', '127.0.0.1', '2026-04-16 08:32:55'),
(222, 1, 'classification.created', 'letter_classifications', 288, NULL, '{\"id\": 288, \"code\": \"PW.04\", \"name\": \"Tindak Lanjut\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 268, \"created_at\": \"2026-04-16T15:33:24.000000Z\"}', '127.0.0.1', '2026-04-16 08:33:24'),
(223, 1, 'classification.created', 'letter_classifications', 289, NULL, '{\"id\": 289, \"code\": \"PW.04.01\", \"name\": \"Laporan Tindak Lanjut Hasil Audit Kinerja\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 288, \"created_at\": \"2026-04-16T15:33:52.000000Z\"}', '127.0.0.1', '2026-04-16 08:33:52'),
(224, 1, 'classification.created', 'letter_classifications', 290, NULL, '{\"id\": 290, \"code\": \"PW.04.02\", \"name\": \"Laporan Tindak Lanjut Hasil Audit Khusus\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 288, \"created_at\": \"2026-04-16T15:34:20.000000Z\"}', '127.0.0.1', '2026-04-16 08:34:20'),
(225, 1, 'classification.created', 'letter_classifications', 291, NULL, '{\"id\": 291, \"code\": \"PW.04.03\", \"name\": \"Tindak Lanjut Badan Pengawasan Keuangan dan Pembangunan Republik Indonesia (BPKP RI), BPK RI, ITJEN\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 288, \"created_at\": \"2026-04-16T15:34:49.000000Z\"}', '127.0.0.1', '2026-04-16 08:34:49'),
(226, 1, 'classification.created', 'letter_classifications', 292, NULL, '{\"id\": 292, \"code\": \"PW.05\", \"name\": \"Reviu dan Tindak Lanjut Reviu\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 268, \"created_at\": \"2026-04-16T15:35:19.000000Z\"}', '127.0.0.1', '2026-04-16 08:35:19'),
(227, 1, 'classification.created', 'letter_classifications', 293, NULL, '{\"id\": 293, \"code\": \"PW.05.01\", \"name\": \"Reviu\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 292, \"created_at\": \"2026-04-16T15:35:51.000000Z\"}', '127.0.0.1', '2026-04-16 08:35:51'),
(228, 1, 'classification.created', 'letter_classifications', 294, NULL, '{\"id\": 294, \"code\": \"PW.05.02\", \"name\": \"Tindak Lanjut Reviu\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 292, \"created_at\": \"2026-04-16T15:36:11.000000Z\"}', '127.0.0.1', '2026-04-16 08:36:11'),
(229, 1, 'classification.created', 'letter_classifications', 295, NULL, '{\"id\": 295, \"code\": \"PW.06\", \"name\": \"Tindak Lanjut Pengaduan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 268, \"created_at\": \"2026-04-16T15:36:49.000000Z\"}', '127.0.0.1', '2026-04-16 08:36:49'),
(230, 1, 'classification.created', 'letter_classifications', 296, NULL, '{\"id\": 296, \"code\": \"PW.06.01\", \"name\": \"Whistle Blowing System (WBS)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 295, \"created_at\": \"2026-04-16T15:37:17.000000Z\"}', '127.0.0.1', '2026-04-16 08:37:17'),
(231, 1, 'classification.created', 'letter_classifications', 297, NULL, '{\"id\": 297, \"code\": \"PW.06.02\", \"name\": \"Gratifikasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 295, \"created_at\": \"2026-04-16T15:37:37.000000Z\"}', '127.0.0.1', '2026-04-16 08:37:37'),
(232, 1, 'classification.created', 'letter_classifications', 298, NULL, '{\"id\": 298, \"code\": \"PW.06.03\", \"name\": \"Pengaduan Tertulis\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 295, \"created_at\": \"2026-04-16T15:37:56.000000Z\"}', '127.0.0.1', '2026-04-16 08:37:56'),
(233, 1, 'classification.created', 'letter_classifications', 299, NULL, '{\"id\": 299, \"code\": \"PW.06.05\", \"name\": \"Pengaduan melalui aplikasi LAPOR (Layanan Pengaduan Secara Online Rakyat\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 295, \"created_at\": \"2026-04-16T15:39:22.000000Z\"}', '127.0.0.1', '2026-04-16 08:39:22'),
(234, 1, 'classification.created', 'letter_classifications', 300, NULL, '{\"id\": 300, \"code\": \"PW.06.06\", \"name\": \"Pengaduan Ombusman\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 295, \"created_at\": \"2026-04-16T15:39:54.000000Z\"}', '127.0.0.1', '2026-04-16 08:39:54'),
(235, 1, 'classification.created', 'letter_classifications', 301, NULL, '{\"id\": 301, \"code\": \"PW.07\", \"name\": \"Tindak Lanjut Atensi dan Telaahan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 268, \"created_at\": \"2026-04-16T15:40:28.000000Z\"}', '127.0.0.1', '2026-04-16 08:40:28'),
(236, 1, 'classification.created', 'letter_classifications', 302, NULL, '{\"id\": 302, \"code\": \"PW.07.01\", \"name\": \"Tanggapan/Telaahan Hukuman Disiplin yang Tidak Ditindaklanjuti\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 301, \"created_at\": \"2026-04-16T15:41:06.000000Z\"}', '127.0.0.1', '2026-04-16 08:41:06'),
(237, 1, 'classification.created', 'letter_classifications', 303, NULL, '{\"id\": 303, \"code\": \"PW.07.02\", \"name\": \"Tanggapan/Telaahan Hukuman Disiplin yang Ditindaklanjuti\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 301, \"created_at\": \"2026-04-16T15:41:32.000000Z\"}', '127.0.0.1', '2026-04-16 08:41:32'),
(238, 1, 'classification.created', 'letter_classifications', 304, NULL, '{\"id\": 304, \"code\": \"PW.07.03\", \"name\": \"Daftar nama pegawai Kementerian Hukum dan HAM yang dikenakan sanksi hukuman disiplin/kartu cela\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 301, \"created_at\": \"2026-04-16T15:42:12.000000Z\"}', '127.0.0.1', '2026-04-16 08:42:12'),
(239, 1, 'classification.created', 'letter_classifications', 305, NULL, '{\"id\": 305, \"code\": \"TI\", \"name\": \"Teknologi dan Informasi\", \"type\": \"substantif\", \"level\": 1, \"is_leaf\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T15:43:05.000000Z\"}', '127.0.0.1', '2026-04-16 08:43:05'),
(240, 1, 'classification.created', 'letter_classifications', 306, NULL, '{\"id\": 306, \"code\": \"TI.01\", \"name\": \"Pengamanan Data\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 305, \"created_at\": \"2026-04-16T15:43:42.000000Z\"}', '127.0.0.1', '2026-04-16 08:43:42'),
(241, 1, 'classification.created', 'letter_classifications', 307, NULL, '{\"id\": 307, \"code\": \"TI.02\", \"name\": \"Pengamanan Jaringan\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 305, \"created_at\": \"2026-04-16T15:44:16.000000Z\"}', '127.0.0.1', '2026-04-16 08:44:16'),
(242, 1, 'classification.created', 'letter_classifications', 308, NULL, '{\"id\": 308, \"code\": \"TI.03\", \"name\": \"Standarisasi\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 305, \"created_at\": \"2026-04-16T15:44:35.000000Z\"}', '127.0.0.1', '2026-04-16 08:44:35'),
(243, 1, 'classification.created', 'letter_classifications', 309, NULL, '{\"id\": 309, \"code\": \"TI.03.01\", \"name\": \"Standarisasi Teknologi dan Informasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 308, \"created_at\": \"2026-04-16T15:45:15.000000Z\"}', '127.0.0.1', '2026-04-16 08:45:15'),
(244, 1, 'classification.created', 'letter_classifications', 310, NULL, '{\"id\": 310, \"code\": \"TI.03.02\", \"name\": \"Implementasi Aplikasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 308, \"created_at\": \"2026-04-16T15:45:59.000000Z\"}', '127.0.0.1', '2026-04-16 08:46:00'),
(245, 1, 'classification.created', 'letter_classifications', 311, NULL, '{\"id\": 311, \"code\": \"TI.03.03\", \"name\": \"Implementasi Situs Internet, Portal Internet dan Surat Elektronik\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 308, \"created_at\": \"2026-04-16T15:46:36.000000Z\"}', '127.0.0.1', '2026-04-16 08:46:36'),
(246, 1, 'classification.created', 'letter_classifications', 312, NULL, '{\"id\": 312, \"code\": \"TI.03.04\", \"name\": \"Uji Coba Infrastruktur\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 308, \"created_at\": \"2026-04-16T15:47:09.000000Z\"}', '127.0.0.1', '2026-04-16 08:47:09'),
(247, 1, 'classification.created', 'letter_classifications', 313, NULL, '{\"id\": 313, \"code\": \"TI.04\", \"name\": \"Kerjasama\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 305, \"created_at\": \"2026-04-16T15:47:38.000000Z\"}', '127.0.0.1', '2026-04-16 08:47:38'),
(248, 1, 'classification.created', 'letter_classifications', 314, NULL, '{\"id\": 314, \"code\": \"TI.04.01\", \"name\": \"Kerjasama Internal\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 313, \"created_at\": \"2026-04-16T15:48:04.000000Z\"}', '127.0.0.1', '2026-04-16 08:48:04'),
(249, 1, 'classification.created', 'letter_classifications', 315, NULL, '{\"id\": 315, \"code\": \"TI.04.02\", \"name\": \"Kerjasama Eksternal\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 313, \"created_at\": \"2026-04-16T15:48:28.000000Z\"}', '127.0.0.1', '2026-04-16 08:48:28'),
(250, 1, 'classification.created', 'letter_classifications', 316, NULL, '{\"id\": 316, \"code\": \"TI.05\", \"name\": \"Perencanaan Pengembangan Teknologi Informasi\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 305, \"created_at\": \"2026-04-16T15:49:05.000000Z\"}', '127.0.0.1', '2026-04-16 08:49:05'),
(251, 1, 'classification.created', 'letter_classifications', 317, NULL, '{\"id\": 317, \"code\": \"TI.05.01\", \"name\": \"Penyusunan Program Perencanaan Teknologi dan Informasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 316, \"created_at\": \"2026-04-16T15:49:38.000000Z\"}', '127.0.0.1', '2026-04-16 08:49:38'),
(252, 1, 'classification.created', 'letter_classifications', 318, NULL, '{\"id\": 318, \"code\": \"TI.05.02\", \"name\": \"Pengembangan Infrastruktur Teknologi dan Informasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 316, \"created_at\": \"2026-04-16T15:50:24.000000Z\"}', '127.0.0.1', '2026-04-16 08:50:24'),
(253, 1, 'classification.created', 'letter_classifications', 319, NULL, '{\"id\": 319, \"code\": \"TI.05.03\", \"name\": \"Pengembangan Aplikasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 316, \"created_at\": \"2026-04-16T15:50:48.000000Z\"}', '127.0.0.1', '2026-04-16 08:50:48'),
(254, 1, 'classification.created', 'letter_classifications', 320, NULL, '{\"id\": 320, \"code\": \"TI.05.04\", \"name\": \"Pengembangan Database, Situs Internet, dan Surat Elektronik\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 316, \"created_at\": \"2026-04-16T15:51:13.000000Z\"}', '127.0.0.1', '2026-04-16 08:51:13'),
(255, 1, 'classification.created', 'letter_classifications', 321, NULL, '{\"id\": 321, \"code\": \"TI.06\", \"name\": \"Pengelolaan Sistem Teknologi Informasi\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 305, \"created_at\": \"2026-04-16T15:51:54.000000Z\"}', '127.0.0.1', '2026-04-16 08:51:54'),
(256, 1, 'classification.created', 'letter_classifications', 322, NULL, '{\"id\": 322, \"code\": \"TI.06.01\", \"name\": \"Pengelolaan Jaringan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 321, \"created_at\": \"2026-04-16T15:52:28.000000Z\"}', '127.0.0.1', '2026-04-16 08:52:28'),
(257, 1, 'classification.created', 'letter_classifications', 323, NULL, '{\"id\": 323, \"code\": \"TI.06.02\", \"name\": \"Pengelolaan Jaringan Sistem Informasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 321, \"created_at\": \"2026-04-16T15:52:50.000000Z\"}', '127.0.0.1', '2026-04-16 08:52:50'),
(258, 1, 'classification.created', 'letter_classifications', 324, NULL, '{\"id\": 324, \"code\": \"TI.06.03\", \"name\": \"Pengelolaan Database\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 321, \"created_at\": \"2026-04-16T15:53:16.000000Z\"}', '127.0.0.1', '2026-04-16 08:53:16'),
(259, 1, 'classification.created', 'letter_classifications', 325, NULL, '{\"id\": 325, \"code\": \"TI.06.04\", \"name\": \"Pengelolaan Situs Internet, Portal Internet, dan Surat Elektronik\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 321, \"created_at\": \"2026-04-16T15:53:53.000000Z\"}', '127.0.0.1', '2026-04-16 08:53:53'),
(260, 1, 'classification.created', 'letter_classifications', 326, NULL, '{\"id\": 326, \"code\": \"TI.06.05\", \"name\": \"Pengelolaan Aplikasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 321, \"created_at\": \"2026-04-16T15:54:22.000000Z\"}', '127.0.0.1', '2026-04-16 08:54:22'),
(261, 1, 'classification.created', 'letter_classifications', 327, NULL, '{\"id\": 327, \"code\": \"TI.06.06\", \"name\": \"Pengelolaan Alat Pendukung\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 321, \"created_at\": \"2026-04-16T15:54:42.000000Z\"}', '127.0.0.1', '2026-04-16 08:54:42'),
(262, 1, 'classification.created', 'letter_classifications', 328, NULL, '{\"id\": 328, \"code\": \"TI.07\", \"name\": \"Layanan Sistem Teknologi dan Informasi\", \"type\": \"fasilitatif\", \"level\": 2, \"is_leaf\": true, \"parent_id\": 305, \"created_at\": \"2026-04-16T15:55:08.000000Z\"}', '127.0.0.1', '2026-04-16 08:55:08'),
(263, 1, 'classification.created', 'letter_classifications', 329, NULL, '{\"id\": 329, \"code\": \"TII.07.01\", \"name\": \"Layanan Keluhan LPSE (Layanan Pengadaan Secara Elektronik)\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 328, \"created_at\": \"2026-04-16T15:55:33.000000Z\"}', '127.0.0.1', '2026-04-16 08:55:33'),
(264, 1, 'classification.created', 'letter_classifications', 330, NULL, '{\"id\": 330, \"code\": \"TI.07.02\", \"name\": \"Tindak Lanjut Keluhan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 328, \"created_at\": \"2026-04-16T15:55:54.000000Z\"}', '127.0.0.1', '2026-04-16 08:55:54'),
(265, 1, 'classification.created', 'letter_classifications', 331, NULL, '{\"id\": 331, \"code\": \"TI.07.03\", \"name\": \"Monitoring/Pemantauan Layanan Keluhan\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 328, \"created_at\": \"2026-04-16T15:56:16.000000Z\"}', '127.0.0.1', '2026-04-16 08:56:16'),
(266, 1, 'classification.created', 'letter_classifications', 332, NULL, '{\"id\": 332, \"code\": \"TI.07.04\", \"name\": \"Evaluasi\", \"type\": \"fasilitatif\", \"level\": 4, \"is_leaf\": true, \"parent_id\": 329, \"created_at\": \"2026-04-16T15:56:49.000000Z\"}', '127.0.0.1', '2026-04-16 08:56:49'),
(267, 1, 'classification.deleted', 'letter_classifications', 332, '{\"id\": 332, \"code\": \"TI.07.04\", \"name\": \"Evaluasi\", \"type\": \"fasilitatif\", \"level\": 4, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 329, \"created_at\": \"2026-04-16T15:56:49.000000Z\"}', NULL, '127.0.0.1', '2026-04-16 08:57:14'),
(268, 1, 'classification.created', 'letter_classifications', 333, NULL, '{\"id\": 333, \"code\": \"TI.07.04\", \"name\": \"Evaluasi\", \"type\": \"fasilitatif\", \"level\": 3, \"is_leaf\": true, \"parent_id\": 328, \"created_at\": \"2026-04-16T15:57:29.000000Z\"}', '127.0.0.1', '2026-04-16 08:57:29'),
(269, 2, 'letter.created', 'letter_numbers', 2, NULL, '{\"id\": 2, \"number\": 12, \"status\": \"active\", \"subject\": \"ssss\", \"user_id\": 2, \"created_at\": \"2026-04-18T10:23:26.000000Z\", \"destination\": \"dddd\", \"issued_date\": \"2026-04-18T00:00:00.000000Z\", \"sifat_surat\": \"segera\", \"formatted_number\": \"W7-HH.01.02-12\", \"classification_id\": \"201\"}', '127.0.0.1', '2026-04-18 03:23:26'),
(270, 2, 'letter.created', 'letter_numbers', 3, NULL, '{\"id\": 3, \"number\": 13, \"status\": \"active\", \"subject\": \"sddsassss\", \"user_id\": 2, \"created_at\": \"2026-04-18T10:54:43.000000Z\", \"destination\": \"gfdfgdf\", \"issued_date\": \"2026-04-18T00:00:00.000000Z\", \"sifat_surat\": \"biasa\", \"formatted_number\": \"W7-TU.02.02-13\", \"classification_id\": \"17\"}', '127.0.0.1', '2026-04-18 03:54:43'),
(271, 2, 'letter.created', 'letter_numbers', 4, NULL, '{\"id\": 4, \"number\": 14, \"status\": \"active\", \"subject\": \"dfsfddss\", \"user_id\": 2, \"created_at\": \"2026-04-18T11:03:49.000000Z\", \"destination\": \"gdssfsd\", \"issued_date\": \"2026-04-18T00:00:00.000000Z\", \"sifat_surat\": \"rahasia\", \"formatted_number\": \"W7-TI.04.01-14\", \"classification_id\": \"314\"}', '127.0.0.1', '2026-04-18 04:03:49'),
(272, 2, 'letter.created', 'letter_numbers', 5, NULL, '{\"id\": 5, \"number\": 1001, \"status\": \"active\", \"subject\": \"sdasfsd\", \"user_id\": 2, \"created_at\": \"2026-04-18T11:05:58.000000Z\", \"destination\": \"fdfddfdf\", \"issued_date\": \"2026-04-18T00:00:00.000000Z\", \"sifat_surat\": \"segera\", \"formatted_number\": \"W7-TU.02.01-1001\", \"classification_id\": \"16\"}', '127.0.0.1', '2026-04-18 04:05:58'),
(273, 2, 'letter.created', 'letter_numbers', 6, NULL, '{\"id\": 6, \"number\": 1002, \"status\": \"active\", \"subject\": \"sdssad\", \"user_id\": 2, \"created_at\": \"2026-04-19T11:07:26.000000Z\", \"destination\": \"fgfdgdfdgdd\", \"issued_date\": \"2026-04-19T00:00:00.000000Z\", \"sifat_surat\": \"biasa\", \"formatted_number\": \"W7-HH.01.01-1002\", \"classification_id\": \"200\"}', '127.0.0.1', '2026-04-19 04:07:26'),
(274, 2, 'letter.created', 'letter_numbers', 7, NULL, '{\"id\": 7, \"number\": 1003, \"status\": \"active\", \"subject\": \"fdfdf\", \"user_id\": 2, \"created_at\": \"2026-04-19T11:10:35.000000Z\", \"destination\": \"dsfdddfddd\", \"issued_date\": \"2026-04-19T00:00:00.000000Z\", \"sifat_surat\": \"biasa\", \"formatted_number\": \"W7-OT.03.02-1003\", \"classification_id\": \"90\"}', '127.0.0.1', '2026-04-19 04:10:35'),
(275, 2, 'letter.created', 'letter_numbers', 8, NULL, '{\"id\": 8, \"number\": 1004, \"status\": \"active\", \"subject\": \"sdasssds\", \"user_id\": 2, \"created_at\": \"2026-04-20T11:12:40.000000Z\", \"destination\": \"fdfdfd\", \"issued_date\": \"2026-04-20T00:00:00.000000Z\", \"sifat_surat\": \"biasa\", \"formatted_number\": \"W7-KP.12-1004\", \"classification_id\": \"147\"}', '127.0.0.1', '2026-04-20 04:12:40'),
(276, 2, 'letter.created', 'letter_numbers', 9, NULL, '{\"id\": 9, \"number\": 1005, \"status\": \"active\", \"subject\": \"fgdgf\", \"user_id\": 2, \"created_at\": \"2026-04-20T11:13:27.000000Z\", \"destination\": \"sdfds\", \"issued_date\": \"2026-04-20T00:00:00.000000Z\", \"sifat_surat\": \"biasa\", \"formatted_number\": \"W7-HH.04.05-1005\", \"classification_id\": \"224\"}', '127.0.0.1', '2026-04-20 04:13:27'),
(277, 2, 'letter.created', 'letter_numbers', 10, NULL, '{\"id\": 10, \"number\": 1006, \"status\": \"active\", \"subject\": \"fgfgfg\", \"user_id\": 2, \"created_at\": \"2026-04-21T11:14:26.000000Z\", \"destination\": \"fghgfg\", \"issued_date\": \"2026-04-21T00:00:00.000000Z\", \"sifat_surat\": \"rahasia\", \"formatted_number\": \"W7-KP.02.05-1006\", \"classification_id\": \"97\"}', '127.0.0.1', '2026-04-21 04:14:26'),
(278, 2, 'letter.created', 'letter_numbers', 11, NULL, '{\"id\": 11, \"number\": 1007, \"status\": \"active\", \"subject\": \"sddssadaa\", \"user_id\": 2, \"created_at\": \"2026-04-21T11:31:48.000000Z\", \"destination\": \"sdasadddd\", \"issued_date\": \"2026-04-21T00:00:00.000000Z\", \"sifat_surat\": \"biasa\", \"formatted_number\": \"W7-HM.01.01-1007\", \"classification_id\": \"3\"}', '127.0.0.1', '2026-04-21 04:31:48'),
(279, 2, 'letter.created', 'letter_numbers', 12, NULL, '{\"id\": 12, \"number\": 1018, \"status\": \"active\", \"subject\": \"sddasdda\", \"user_id\": 2, \"created_at\": \"2026-04-22T11:33:01.000000Z\", \"destination\": \"gfdgfdfrd\", \"issued_date\": \"2026-04-22T00:00:00.000000Z\", \"sifat_surat\": \"segera\", \"formatted_number\": \"W7-KP.02.03-1018\", \"classification_id\": \"95\"}', '127.0.0.1', '2026-04-22 04:33:01'),
(280, 1, 'report.exported', 'letter_numbers', 0, NULL, '{\"format\": \"pdf\", \"filters\": {\"date_to\": \"2026-04-19\", \"date_from\": \"2026-03-20\"}, \"total_rows\": 0}', '127.0.0.1', '2026-04-19 09:16:32'),
(281, 1, 'report.exported', 'letter_numbers', 0, NULL, '{\"format\": \"pdf\", \"filters\": {\"date_to\": \"2026-04-19\", \"date_from\": \"2026-03-20\"}, \"total_rows\": 0}', '127.0.0.1', '2026-04-19 09:21:17'),
(282, 1, 'report.exported', 'letter_numbers', 0, NULL, '{\"format\": \"pdf\", \"filters\": {\"date_to\": \"2026-04-19\", \"date_from\": \"2026-03-20\"}, \"total_rows\": 0}', '127.0.0.1', '2026-04-19 09:21:19'),
(283, 1, 'classification.deleted', 'letter_classifications', 10, '{\"id\": 10, \"code\": \"HM.03.02\", \"name\": \"Penyuluhan Media\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 8, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:19'),
(284, 1, 'classification.deleted', 'letter_classifications', 9, '{\"id\": 9, \"code\": \"HM.03.01\", \"name\": \"Penyuluhan Langsung\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 8, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:22'),
(285, 1, 'classification.deleted', 'letter_classifications', 8, '{\"id\": 8, \"code\": \"HM.03\", \"name\": \"Penyuluhan Hukum\", \"type\": \"substantif\", \"level\": 2, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 1, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:26'),
(286, 1, 'classification.deleted', 'letter_classifications', 7, '{\"id\": 7, \"code\": \"HM.02.02\", \"name\": \"Litigasi dan Perwakilan\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 5, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:38'),
(287, 1, 'classification.deleted', 'letter_classifications', 6, '{\"id\": 6, \"code\": \"HM.02.01\", \"name\": \"Konsultasi Hukum\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 5, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:41'),
(288, 1, 'classification.deleted', 'letter_classifications', 5, '{\"id\": 5, \"code\": \"HM.02\", \"name\": \"Bantuan Hukum\", \"type\": \"substantif\", \"level\": 2, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 1, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:46'),
(289, 1, 'classification.deleted', 'letter_classifications', 4, '{\"id\": 4, \"code\": \"HM.01.02\", \"name\": \"Evaluasi Peraturan\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 2, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:53'),
(290, 1, 'classification.deleted', 'letter_classifications', 3, '{\"id\": 3, \"code\": \"HM.01.01\", \"name\": \"Penyusunan Peraturan\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 2, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:14:56'),
(291, 1, 'classification.deleted', 'letter_classifications', 2, '{\"id\": 2, \"code\": \"HM.01\", \"name\": \"Peraturan Perundang-undangan\", \"type\": \"substantif\", \"level\": 2, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 1, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:01'),
(292, 1, 'classification.deleted', 'letter_classifications', 1, '{\"id\": 1, \"code\": \"HM\", \"name\": \"Hukum dan Perundang-undangan\", \"type\": \"substantif\", \"level\": 1, \"is_leaf\": true, \"is_active\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:06'),
(293, 1, 'classification.deleted', 'letter_classifications', 49, '{\"id\": 49, \"code\": \"OR.03.02\", \"name\": \"Evaluasi dan Pelaporan\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 47, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:16'),
(294, 1, 'classification.deleted', 'letter_classifications', 48, '{\"id\": 48, \"code\": \"OR.03.01\", \"name\": \"Perencanaan Reformasi\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 47, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:19'),
(295, 1, 'classification.deleted', 'letter_classifications', 46, '{\"id\": 46, \"code\": \"OR.02.02\", \"name\": \"Analisis Jabatan\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 44, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:25'),
(296, 1, 'classification.deleted', 'letter_classifications', 45, '{\"id\": 45, \"code\": \"OR.02.01\", \"name\": \"Standar Operasional Prosedur\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 44, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:29'),
(297, 1, 'classification.deleted', 'letter_classifications', 43, '{\"id\": 43, \"code\": \"OR.01.02\", \"name\": \"Evaluasi Kelembagaan\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 41, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:32'),
(298, 1, 'classification.deleted', 'letter_classifications', 42, '{\"id\": 42, \"code\": \"OR.01.01\", \"name\": \"Pembentukan Unit Kerja\", \"type\": \"substantif\", \"level\": 3, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 41, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:36'),
(299, 1, 'classification.deleted', 'letter_classifications', 47, '{\"id\": 47, \"code\": \"OR.03\", \"name\": \"Reformasi Birokrasi\", \"type\": \"substantif\", \"level\": 2, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 40, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:40'),
(300, 1, 'classification.deleted', 'letter_classifications', 44, '{\"id\": 44, \"code\": \"OR.02\", \"name\": \"Ketatalaksanaan\", \"type\": \"substantif\", \"level\": 2, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 40, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:44'),
(301, 1, 'classification.deleted', 'letter_classifications', 41, '{\"id\": 41, \"code\": \"OR.01\", \"name\": \"Kelembagaan\", \"type\": \"substantif\", \"level\": 2, \"is_leaf\": true, \"is_active\": true, \"parent_id\": 40, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:48'),
(302, 1, 'classification.deleted', 'letter_classifications', 40, '{\"id\": 40, \"code\": \"OR\", \"name\": \"Organisasi dan Tata Laksana\", \"type\": \"substantif\", \"level\": 1, \"is_leaf\": true, \"is_active\": true, \"parent_id\": null, \"created_at\": \"2026-04-16T10:56:08.000000Z\"}', NULL, '127.0.0.1', '2026-04-20 00:15:53');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_gaps`
--

CREATE TABLE `daily_gaps` (
  `id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `gap_start` int UNSIGNED NOT NULL,
  `gap_end` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `daily_gaps`
--

INSERT INTO `daily_gaps` (`id`, `date`, `gap_start`, `gap_end`, `created_at`, `updated_at`) VALUES
(4, '2026-04-18', 1001, 1010, '2026-04-19 08:46:53', '2026-04-19 08:46:53'),
(5, '2026-04-19', 1001, 1010, '2026-04-20 00:13:57', '2026-04-20 00:13:57');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gap_requests`
--

CREATE TABLE `gap_requests` (
  `id` bigint UNSIGNED NOT NULL,
  `requested_by` bigint UNSIGNED NOT NULL,
  `reviewed_by` bigint UNSIGNED DEFAULT NULL,
  `classification_id` bigint UNSIGNED NOT NULL,
  `number` int UNSIGNED DEFAULT NULL,
  `gap_date` date NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `global_sequence`
--

CREATE TABLE `global_sequence` (
  `id` bigint UNSIGNED NOT NULL,
  `last_number` int UNSIGNED NOT NULL DEFAULT '0',
  `next_start` int UNSIGNED NOT NULL DEFAULT '1000',
  `gap_size` int UNSIGNED NOT NULL DEFAULT '10',
  `last_issued_date` date DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `global_sequence`
--

INSERT INTO `global_sequence` (`id`, `last_number`, `next_start`, `gap_size`, `last_issued_date`, `updated_at`) VALUES
(1, 1000, 1000, 10, '2026-04-20', '2026-04-20 00:13:57');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `letter_classifications`
--

CREATE TABLE `letter_classifications` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` tinyint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('substantif','fasilitatif') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_leaf` tinyint(1) NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `letter_classifications`
--

INSERT INTO `letter_classifications` (`id`, `parent_id`, `code`, `level`, `name`, `type`, `is_leaf`, `is_active`, `created_at`) VALUES
(11, NULL, 'TU', 1, 'Tata Usaha', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(12, 11, 'TU.01', 2, 'Surat Menyurat', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(13, 12, 'TU.01.01', 3, 'Surat Keluar', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(14, 12, 'TU.01.02', 3, 'Surat Masuk', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(15, 11, 'TU.02', 2, 'Kearsipan', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(16, 15, 'TU.02.01', 3, 'Penyimpanan Arsip', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(17, 15, 'TU.02.02', 3, 'Pemusnahan Arsip', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(18, 11, 'TU.03', 2, 'Protokol dan Hubungan Masyarakat', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(19, 18, 'TU.03.01', 3, 'Keprotokolan', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(20, NULL, 'KP', 1, 'Kepegawaian', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(21, 20, 'KP.01', 2, 'Formasi Pegawai', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(22, 21, 'KP.01.01', 3, 'Inventarisasi Jabatan/Peta Jabatan', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(23, 21, 'KP.01.02', 3, 'Evaluasi Jabatan', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(24, 20, 'KP.02', 2, 'Penerimaan/Pengadaan Pegawai', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(25, 24, 'KP.02.01', 3, 'Proses Penerimaan Pegawai', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(26, 24, 'KP.02.02', 3, 'Berkas Lamaran Yang Tidak Diterima', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(27, 20, 'KP.03', 2, 'Pengangkatan Pegawai', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(28, 27, 'KP.03.01', 3, 'Pengangkatan CPNS', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(29, 27, 'KP.03.02', 3, 'Pengangkatan PNS', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(30, NULL, 'KU', 1, 'Keuangan', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(31, 30, 'KU.01', 2, 'Pedoman, Petunjuk, dan Administrasi Pelaksanaan Anggaran', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(32, 31, 'KU.01.01', 3, 'Rencana Kerja Anggaran', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(33, 31, 'KU.01.02', 3, 'Revisi Anggaran', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(34, 30, 'KU.02', 2, 'Tata Usaha Keuangan', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(35, 34, 'KU.02.01', 3, 'Pedoman dan Petunjuk Administrasi Keuangan', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(36, 34, 'KU.02.02', 3, 'Penatausahaan Hibah', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(37, 30, 'KU.03', 2, 'Perbendaharaan', 'fasilitatif', 0, 1, '2026-04-16 03:56:08'),
(38, 37, 'KU.03.01', 3, 'Dokumen Pertanggungjawaban Belanja', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(39, 37, 'KU.03.02', 3, 'Buku Kas Umum dan Buku Pembantu', 'fasilitatif', 1, 1, '2026-04-16 03:56:08'),
(50, NULL, 'PR', 1, 'Perencanaan', 'fasilitatif', 0, 1, '2026-04-16 04:57:23'),
(51, 50, 'PR.01', 2, 'Program dan Anggaran', 'fasilitatif', 0, 1, '2026-04-16 05:02:32'),
(52, 51, 'PR.01.01', 3, 'Rencana Strategis', 'fasilitatif', 1, 1, '2026-04-16 05:03:46'),
(53, 51, 'PR.01.02', 3, 'Trilateral Meeting', 'fasilitatif', 1, 1, '2026-04-16 05:07:10'),
(54, 51, 'PR.01.03', 3, 'Rencana Kerja', 'fasilitatif', 1, 1, '2026-04-16 05:07:36'),
(55, 51, 'PR.01.04', 3, 'Rencana Kerja dan Anggaran', 'fasilitatif', 1, 1, '2026-04-16 05:08:29'),
(56, 50, 'PR.02', 2, 'Evaluasi', 'fasilitatif', 0, 1, '2026-04-16 05:10:00'),
(57, 56, 'PR.02.01', 3, 'Unit Utama', 'fasilitatif', 1, 1, '2026-04-16 05:12:26'),
(58, 56, 'PR.02.02', 3, 'Kantor Wilayah', 'fasilitatif', 1, 1, '2026-04-16 05:12:50'),
(59, 50, 'PR.03', 2, 'Laporan Akuntabilitas Kinerja Instansi Pemerintah (LAKIP)', 'fasilitatif', 1, 1, '2026-04-16 05:13:42'),
(60, 50, 'PR.04', 2, 'Pelaporan', 'fasilitatif', 0, 1, '2026-04-16 05:14:28'),
(61, 60, 'PR.04.01', 3, 'Laporan Bulanan', 'fasilitatif', 1, 1, '2026-04-16 05:15:11'),
(62, 60, 'PR.04.02', 3, 'Laporan Triwulan', 'fasilitatif', 1, 1, '2026-04-16 05:15:43'),
(63, 60, 'PR.04.03', 3, 'Laporan Semester', 'fasilitatif', 1, 1, '2026-04-16 05:16:38'),
(64, 60, 'PR.04.04', 3, 'Laporan Tahunan', 'fasilitatif', 1, 1, '2026-04-16 05:17:05'),
(65, 60, 'PR.04.05', 3, 'Insidentil', 'fasilitatif', 1, 1, '2026-04-16 05:17:35'),
(66, 50, 'PR.05', 2, 'Rapat Kerja', 'fasilitatif', 0, 1, '2026-04-16 05:18:14'),
(67, 66, 'PR.05.01', 3, 'Dengan DPR', 'fasilitatif', 1, 1, '2026-04-16 05:18:52'),
(68, 66, 'PR.05.02', 3, 'Tingkat Kementerian', 'fasilitatif', 1, 1, '2026-04-16 05:19:15'),
(69, 66, 'PR.05.03', 3, 'Tingkat Unit Utama (RAKERNIS)', 'fasilitatif', 1, 1, '2026-04-16 05:19:44'),
(73, 66, 'PR.05.04', 3, 'Tingkat Kantor Wilayah', 'fasilitatif', 1, 1, '2026-04-16 06:25:19'),
(74, 66, 'PR.05.05', 3, 'Rapat Pimpinan dan Rapat Staf', 'fasilitatif', 1, 1, '2026-04-16 06:25:52'),
(75, 50, 'PR.06', 2, 'Sidang Kabinet', 'fasilitatif', 0, 1, '2026-04-16 06:26:29'),
(76, 75, 'PR.06.01', 3, 'Sidang Kabinet Terbatas', 'fasilitatif', 1, 1, '2026-04-16 06:27:03'),
(77, 75, 'PR.06.02', 3, 'Sidang Kabinet Paripurna', 'fasilitatif', 1, 1, '2026-04-16 06:27:25'),
(78, NULL, 'OT', 1, 'Organisasi dan Tata Laksana', 'fasilitatif', 0, 1, '2026-04-16 06:28:40'),
(79, 78, 'OT.01', 2, 'Organisasi dan Tata Kerja', 'fasilitatif', 0, 1, '2026-04-16 06:30:59'),
(80, 79, 'OT.01.01', 3, 'Organisasi dan Tata Kerja Kementerian', 'fasilitatif', 1, 1, '2026-04-16 06:32:36'),
(81, 79, 'OT.01.02', 3, 'Organisasi dan Tata Kerja Kantor Wilayah', 'fasilitatif', 1, 1, '2026-04-16 06:33:13'),
(82, 79, 'OT.01.03', 3, 'Organisasi dan Tata Kerja UPT', 'fasilitatif', 1, 1, '2026-04-16 06:33:37'),
(83, 79, 'OT.01.04', 3, 'Evaluasi Kelembagaan', 'fasilitatif', 1, 1, '2026-04-16 06:34:04'),
(84, 78, 'OT.02', 2, 'Ketatalaksanaan', 'fasilitatif', 0, 1, '2026-04-16 06:34:42'),
(85, 84, 'OT.02.01', 3, 'Standarisasi Sarana Kerja', 'fasilitatif', 1, 1, '2026-04-16 06:35:15'),
(86, 84, 'OT.02.02', 3, 'Sistem, Prosedur dan Metoda Kerja', 'fasilitatif', 1, 1, '2026-04-16 06:35:36'),
(87, 84, 'OT.02.03', 3, 'Analisa dan Uraian Jabatan', 'fasilitatif', 1, 1, '2026-04-16 06:36:05'),
(88, 78, 'OT.03', 2, 'Reformasi Birokrasi', 'fasilitatif', 0, 1, '2026-04-16 06:36:52'),
(89, 88, 'OT.03.01', 3, 'Penilaian Mandiri Pelaksanaan Reformasi Birokrasi (PMPRB)', 'fasilitatif', 1, 1, '2026-04-16 06:37:17'),
(90, 88, 'OT.03.02', 3, 'Zona Integritas (ZI)', 'fasilitatif', 1, 1, '2026-04-16 06:37:50'),
(91, 88, 'OT.03.03', 3, 'Evaluasi Reformasi Birokrasi', 'fasilitatif', 1, 1, '2026-04-16 06:38:18'),
(92, 78, 'OT.04', 2, 'Instruksi Menteri', 'fasilitatif', 1, 1, '2026-04-16 06:38:51'),
(93, 21, 'KP.01.03', 3, 'Usulan Formasi', 'fasilitatif', 1, 1, '2026-04-16 06:41:56'),
(94, 21, 'KP.01.04', 3, 'Alokasi Formasi', 'fasilitatif', 1, 1, '2026-04-16 06:42:37'),
(95, 24, 'KP.02.03', 3, 'Surat Keputusan CPNS/PNS Kolektif', 'fasilitatif', 1, 1, '2026-04-16 06:44:11'),
(96, 24, 'KP.02.04', 3, 'Penerimaan Pegawai dari Politeknik Ilmu Pemasyarakatan dan AIM', 'fasilitatif', 1, 1, '2026-04-16 06:44:36'),
(97, 24, 'KP.02.05', 3, 'Ujian Dinas dan Ujian Penyusaian Ijazah', 'fasilitatif', 1, 1, '2026-04-16 06:44:58'),
(98, 27, 'KP.03.03', 3, 'Pengangkatan Jabatan Struktural', 'fasilitatif', 1, 1, '2026-04-16 06:47:21'),
(99, 27, 'KP.03.04', 3, 'Pengangkatan Jabatan Fungsional', 'fasilitatif', 1, 1, '2026-04-16 06:47:48'),
(100, 20, 'KP.04', 2, 'Mutasi Pegawai', 'fasilitatif', 0, 1, '2026-04-16 06:48:25'),
(101, 100, 'KP.04.01', 3, 'Alih Tugas/Diperbantukan/Dipekerjakan/Pelaksana', 'fasilitatif', 1, 1, '2026-04-16 06:48:53'),
(102, 100, 'KP.04.02', 3, 'Pelaksana Harian/Pelaksana Tugas', 'fasilitatif', 1, 1, '2026-04-16 06:49:16'),
(103, 100, 'KP.04.03', 3, 'Pencantuman gelar Akadmik', 'fasilitatif', 1, 1, '2026-04-16 06:50:00'),
(104, 100, 'KP.04.04', 3, 'Kenaikan Gaji Berkala (KGB)', 'fasilitatif', 1, 1, '2026-04-16 06:50:21'),
(105, 100, 'KP.04.05', 3, 'Kenaikan Pangkat/Golongan', 'fasilitatif', 1, 1, '2026-04-16 06:50:56'),
(106, 100, 'KP.04.06', 3, 'Peninjauan Masa Kerja', 'fasilitatif', 1, 1, '2026-04-16 06:51:28'),
(107, 100, 'KP.04.07', 3, 'Berkas Badan Pertimbangan Jabatan dan Kepangkatan (Baperjakat)', 'fasilitatif', 1, 1, '2026-04-16 06:51:49'),
(108, 100, 'KP.04.08', 3, 'Pengaktifan Kembali dari CLTN dan Hukuman Disiplin', 'fasilitatif', 1, 1, '2026-04-16 06:52:11'),
(109, 20, 'KP.05', 2, 'Pembinaan Pegawai', 'fasilitatif', 0, 1, '2026-04-16 06:53:07'),
(110, 109, 'KP.05.01', 3, 'Penilaian Prestasi Kerja Pegawai ( PPKP )', 'fasilitatif', 1, 1, '2026-04-16 06:53:29'),
(111, 109, 'KP.05.02', 3, 'Pembinaan Disiplin dan Kode Etik', 'fasilitatif', 1, 1, '2026-04-16 06:53:49'),
(112, 109, 'KP.05.03', 3, 'Pemberian Penghargaan dan Tanda Jasa', 'fasilitatif', 1, 1, '2026-04-16 06:54:13'),
(113, 20, 'KP.06', 2, 'Pengembangan Pegawai', 'fasilitatif', 0, 1, '2026-04-16 06:54:44'),
(114, 113, 'KP.06.01', 3, 'Pengembangan Kompetensi Jabatan Pimpinan Tinggi dan Adminstrasi', 'fasilitatif', 1, 1, '2026-04-16 06:55:21'),
(115, 113, 'KP.06.02', 3, 'Pengembangan Kompetensi Fungsional', 'fasilitatif', 1, 1, '2026-04-16 06:55:52'),
(116, 113, 'KP.06.03', 3, 'Pengiriman Peserta Diklat', 'fasilitatif', 1, 1, '2026-04-16 06:56:12'),
(117, 113, 'KP.06.04', 3, 'Bea Siswa', 'fasilitatif', 1, 1, '2026-04-16 06:56:36'),
(118, 20, 'KP.07', 2, 'Hukuman Disiplin', 'fasilitatif', 0, 1, '2026-04-16 06:57:01'),
(119, 118, 'KP.07.01', 3, 'Tingkat Ringan (Pernyataatnn Tidak Puas, Teguran Lisan, Teguran Tertulis)', 'fasilitatif', 1, 1, '2026-04-16 06:57:27'),
(120, 118, 'KP.07.02', 3, 'Tingkat Sedang (Penundaan KGB, KP dan Penurunan Gaji)', 'fasilitatif', 1, 1, '2026-04-16 06:57:56'),
(121, 118, 'KP.07.03', 3, 'Tingkat Berat (Penurunan Pangkat, Pembebasan Jabatan, Pemberhentian Dengan Hormat/Tidak Dengan Hormat)', 'fasilitatif', 1, 1, '2026-04-16 06:58:17'),
(122, 20, 'KP.08', 2, 'Tata Usaha Kepegawaian', 'fasilitatif', 0, 1, '2026-04-16 06:58:50'),
(123, 122, 'KP.08.01', 3, 'Data Pegawai', 'fasilitatif', 1, 1, '2026-04-16 06:59:15'),
(124, 122, 'KP.08.02', 3, 'Identitas Pegawai (Karpeg, Karsu, Karis)', 'fasilitatif', 1, 1, '2026-04-16 06:59:35'),
(125, 122, 'KP.08.03', 3, 'Izin Kepegawaian (Izin Belajar, Tugas Belajar Dalam Negeri dan Luar Negeri)', 'fasilitatif', 1, 1, '2026-04-16 06:59:56'),
(126, 122, 'KP.08.04', 3, 'Keanggotaan Pegawai Dalam Organisasi Sosial', 'fasilitatif', 1, 1, '2026-04-16 07:00:19'),
(127, 122, 'KP.08.05', 3, 'Daftar Hadir/Absensi Pegawai', 'fasilitatif', 1, 1, '2026-04-16 07:00:42'),
(128, 20, 'KP.09', 2, 'Kesejahteraan Pegawai', 'fasilitatif', 0, 1, '2026-04-16 07:01:13'),
(129, 128, 'KP.09.01', 3, 'Kesehatan', 'fasilitatif', 1, 1, '2026-04-16 07:01:38'),
(130, 128, 'KP.09.02', 3, 'Perumahan (TAPERUM, Biaya Uang Muka)', 'fasilitatif', 1, 1, '2026-04-16 07:02:00'),
(131, 128, 'KP.09.03', 3, 'Taspen', 'fasilitatif', 1, 1, '2026-04-16 07:02:23'),
(132, 128, 'KP.09.04', 3, 'Cuti', 'fasilitatif', 1, 1, '2026-04-16 07:02:43'),
(133, 128, 'KP.09.05', 3, 'Uang Duka Tewas', 'fasilitatif', 1, 1, '2026-04-16 07:03:14'),
(134, 128, 'KP.09.06', 3, 'Pembekalan Purnabakti', 'fasilitatif', 1, 1, '2026-04-16 07:03:41'),
(135, 128, 'KP.09.07', 3, 'Mutasi Keluarga', 'fasilitatif', 1, 1, '2026-04-16 07:04:05'),
(136, 128, 'KP.09.08', 3, 'Laporan Kekayaan (LP2P dan LHKPN)', 'fasilitatif', 1, 1, '2026-04-16 07:04:32'),
(137, 20, 'KP.10', 2, 'Pembinaan Jabatan Fungsional', 'fasilitatif', 0, 1, '2026-04-16 07:05:11'),
(138, 137, 'KP.10.01', 3, 'Jabatan Fungsional Umum', 'fasilitatif', 1, 1, '2026-04-16 07:05:35'),
(139, 137, 'KP.10.02', 3, 'Jabatan Fungsional Tertentu', 'fasilitatif', 1, 1, '2026-04-16 07:06:00'),
(140, 20, 'KP.11', 2, 'Pemberhentian Pegawai', 'fasilitatif', 0, 1, '2026-04-16 07:06:33'),
(141, 140, 'KP.11.01', 3, 'Pemberhentian Atas Permintaan Sendiri', 'fasilitatif', 1, 1, '2026-04-16 07:06:59'),
(142, 140, 'KP.11.02', 3, 'Pemberhentian Karena Batas Usia Pensiun', 'fasilitatif', 1, 1, '2026-04-16 07:07:21'),
(143, 140, 'KP.11.03', 3, 'Pemberhentian Karena Keuzuran/Kondisi Jasmani dan Rohani', 'fasilitatif', 1, 1, '2026-04-16 07:07:44'),
(144, 140, 'KP.11.04', 3, 'Pemberhentian Karena Hilang', 'fasilitatif', 1, 1, '2026-04-16 07:08:10'),
(145, 140, 'KP.11.05', 3, 'Pemberhentian Sementara', 'fasilitatif', 1, 1, '2026-04-16 07:08:31'),
(146, 140, 'KP.11.06', 3, 'Pensiun Janda/Duda dan Anak', 'fasilitatif', 1, 1, '2026-04-16 07:08:54'),
(147, 20, 'KP.12', 2, 'Berkas PNS/ASN', 'fasilitatif', 1, 1, '2026-04-16 07:09:25'),
(148, 20, 'KP.13', 2, 'Berkas Perseorangan Menteri, Wakil Menteri dan Pejabat Negara lainnya', 'fasilitatif', 1, 1, '2026-04-16 07:10:35'),
(149, 20, 'KP.14', 2, 'Organisasi Non Kedinasan', 'fasilitatif', 0, 1, '2026-04-16 07:11:15'),
(150, 149, 'KP.14.01', 3, 'KORPRI', 'fasilitatif', 1, 1, '2026-04-16 07:11:44'),
(151, 149, 'KP.14.02', 3, 'Dharma Wanita', 'fasilitatif', 1, 1, '2026-04-16 07:12:10'),
(152, 149, 'KP.14.03', 3, 'Koperasi', 'fasilitatif', 1, 1, '2026-04-16 07:12:41'),
(153, 34, 'KU.02.03', 3, 'Pejabat Perbendaharaan Negara', 'fasilitatif', 1, 1, '2026-04-16 07:17:15'),
(154, 34, 'KU.02.04', 3, 'Penyelesaian Kerugian Negara', 'fasilitatif', 1, 1, '2026-04-16 07:17:45'),
(155, 34, 'KU.02.05', 3, 'Penatausahaan Rekening Pemerintah', 'fasilitatif', 1, 1, '2026-04-16 07:18:28'),
(156, 37, 'KU.03.03', 3, 'LPJ Bendahara Pengeluaran', 'fasilitatif', 1, 1, '2026-04-16 07:20:51'),
(157, 37, 'KU.03.04', 3, 'Bendahara Penerimaan', 'fasilitatif', 1, 1, '2026-04-16 07:21:14'),
(158, 37, 'KU.03.05', 3, 'Penerimaan Negara Pajak', 'fasilitatif', 1, 1, '2026-04-16 07:21:43'),
(159, 30, 'KU.04', 2, 'Akuntansi dan Pelaporan', 'fasilitatif', 0, 1, '2026-04-16 07:22:29'),
(160, 159, 'KU.04.01', 3, 'Laporan Keuangan', 'fasilitatif', 1, 1, '2026-04-16 07:23:04'),
(161, 159, 'KU.04.02', 3, 'Rekonsiliasi dan Data Laporan Keuangan', 'fasilitatif', 1, 1, '2026-04-16 07:23:30'),
(162, 159, 'KU.04.03', 3, 'Penyelesaian Tindak Lanjut Temuan Hasil Pemeriksaan BPK dan Inspektorat Jenderal.', 'fasilitatif', 1, 1, '2026-04-16 07:24:08'),
(163, NULL, 'PB', 1, 'Pengelolaan Barang Milik Negara', 'fasilitatif', 0, 1, '2026-04-16 07:26:48'),
(164, 163, 'PB 01', 2, 'Perencanaan Barang Milik Negara', 'fasilitatif', 0, 1, '2026-04-16 07:27:34'),
(165, 164, 'PB.01.01', 3, 'Usulan Rencana Kebutuhan BMN', 'fasilitatif', 1, 1, '2026-04-16 07:28:12'),
(166, 164, 'PB.01.02', 3, 'Rencana Kebutuhan BMN Kementerian', 'fasilitatif', 1, 1, '2026-04-16 07:28:56'),
(167, 164, 'PB.01.03', 3, 'Hasil Analisis Kebutuhan BMN', 'fasilitatif', 1, 1, '2026-04-16 07:29:20'),
(168, 164, 'PB.01.04', 3, 'Rencana Kebutuhan Aset Berwujud', 'fasilitatif', 1, 1, '2026-04-16 07:29:45'),
(169, 164, 'PB.01.05', 3, 'Rencana Kebutuhan Aset tak Berwujud', 'fasilitatif', 1, 1, '2026-04-16 07:31:36'),
(170, 163, 'PB.02', 2, 'Pengadaan Barang Milik Negara (Layanan Pengadaan)', 'fasilitatif', 0, 1, '2026-04-16 07:32:15'),
(172, 170, 'PB.02.01', 3, 'Pengelolaan Pengadaan Barang/Jasa', 'fasilitatif', 1, 1, '2026-04-16 07:33:49'),
(173, 170, 'PB.02.02', 3, 'Pengelolaan layanan pengadaan secara elektronik dan data informasi pengadaan barang/jasa', 'fasilitatif', 1, 1, '2026-04-16 07:34:30'),
(174, 170, 'PB.02.03', 3, 'Pembinaan, Bimbingan, Pendampingan, dan Konsultasi Teknis Pengadaan Barang/Jasa', 'fasilitatif', 1, 1, '2026-04-16 07:35:02'),
(175, 170, 'PB.02.04', 3, 'Tindaklanjut Hasil Pemeriksaan', 'fasilitatif', 1, 1, '2026-04-16 07:35:27'),
(176, 170, 'PB.02.05', 3, 'Laporan Pengadaan Barang/Jasa', 'fasilitatif', 1, 1, '2026-04-16 07:35:53'),
(177, 170, 'PB.02.06', 3, 'Telaahan Permasalahan Pengadaan Barang/Jasa', 'fasilitatif', 1, 1, '2026-04-16 07:36:24'),
(178, 170, 'PB.02.07', 3, 'Unit Kerja Pengadaan Barang dan Jasa (UKPBJ)', 'fasilitatif', 1, 1, '2026-04-16 07:36:50'),
(179, 170, 'PB.02.08', 3, 'Pendistribusian Barang Milik Negara', 'fasilitatif', 1, 1, '2026-04-16 07:37:13'),
(180, 163, 'PB.03', 2, 'Penetapan Status dan Pengamanan Barang Milik Negara (BMN)', 'fasilitatif', 0, 1, '2026-04-16 07:37:43'),
(181, 180, 'PB.03.01', 3, 'Penggunaan Barang Milik Negara (BMN)', 'fasilitatif', 1, 1, '2026-04-16 07:38:28'),
(182, 180, 'PB.03.02', 3, 'Pemanfaatan Barang Milik Negara', 'fasilitatif', 1, 1, '2026-04-16 07:38:55'),
(183, 180, 'PB.03.03', 3, 'Pengamanan dan Pemeliharaan', 'fasilitatif', 1, 1, '2026-04-16 07:39:17'),
(184, 180, 'PB.03.04', 3, 'Rumah Negara', 'fasilitatif', 1, 1, '2026-04-16 07:39:39'),
(185, 163, 'PB.04', 2, 'Penatausahaan Barang Milik Negara', 'fasilitatif', 0, 1, '2026-04-16 07:40:10'),
(186, 185, 'PB.04.01', 3, 'Pencatataan Barang Milik Negara', 'fasilitatif', 1, 1, '2026-04-16 07:40:37'),
(187, 185, 'PB.04.02', 3, 'Inventarisasi', 'fasilitatif', 1, 1, '2026-04-16 07:41:01'),
(188, 185, 'PB.04.03', 3, 'Opname fisik', 'fasilitatif', 1, 1, '2026-04-16 07:41:35'),
(189, 185, 'PB.04.04', 3, 'Rekonsiliasi data Barang Milik Negara', 'fasilitatif', 1, 1, '2026-04-16 07:42:00'),
(190, 185, 'PB.04.05', 3, 'Pengawasan dan Pengedalian BMN', 'fasilitatif', 1, 1, '2026-04-16 07:42:26'),
(191, 185, 'PB.04.06', 3, 'Laporan Barang Milik Negara', 'fasilitatif', 1, 1, '2026-04-16 07:42:46'),
(192, 163, 'PB.05', 2, 'Pemindahtanganan dan Penghapusan', 'fasilitatif', 0, 1, '2026-04-16 07:43:15'),
(193, 192, 'PB.05.01', 3, 'Penjualan', 'fasilitatif', 1, 1, '2026-04-16 07:43:38'),
(194, 192, 'PB.05.02', 3, 'Tukar Menukar', 'fasilitatif', 1, 1, '2026-04-16 07:43:59'),
(195, 192, 'PB.05.03', 3, 'Hibah', 'fasilitatif', 1, 1, '2026-04-16 07:44:19'),
(196, 192, 'PB.05.04', 3, 'Pemusnahan', 'fasilitatif', 1, 1, '2026-04-16 07:44:38'),
(197, 192, 'PB.05.05', 3, 'Penghapusan', 'fasilitatif', 1, 1, '2026-04-16 07:44:57'),
(198, NULL, 'HH', 1, 'Kehumasan dan Hukum', 'fasilitatif', 0, 1, '2026-04-16 07:45:43'),
(199, 198, 'HH.01', 2, 'Informasi dan Komunikasi', 'fasilitatif', 0, 1, '2026-04-16 07:46:16'),
(200, 199, 'HH.01.01', 3, 'Media Massa (Cetak, Elektronik, Media Sosial)', 'fasilitatif', 1, 1, '2026-04-16 07:46:39'),
(201, 199, 'HH.01.02', 3, 'Sosialisasi dan Diseminasi', 'fasilitatif', 1, 1, '2026-04-16 07:47:20'),
(202, 199, 'HH.01.03', 3, 'Pejabat Pengelola Informasi dan Dokumentasi (PPID)', 'fasilitatif', 1, 1, '2026-04-16 07:48:12'),
(203, 199, 'HH.01.04', 3, 'Badan Koordinasi Hubungan Masyarakat (Bakohumas)', 'fasilitatif', 1, 1, '2026-04-16 07:48:39'),
(204, 199, 'HH.01.05', 3, 'Peliputan', 'fasilitatif', 1, 1, '2026-04-16 07:49:00'),
(205, 199, 'HH.01.06', 3, 'Konferensi Pers', 'fasilitatif', 1, 1, '2026-04-16 07:49:26'),
(206, 199, 'HH.01.07', 3, 'Siaran Pers', 'fasilitatif', 1, 1, '2026-04-16 07:49:49'),
(207, 198, 'HH.02', 2, 'Dokumentasi', 'fasilitatif', 0, 1, '2026-04-16 07:50:23'),
(208, 207, 'HH.02.01', 3, 'Produk Informasi (Media Cetak, Elektronik, Media Sosial)', 'fasilitatif', 1, 1, '2026-04-16 07:50:52'),
(209, 207, 'HH.02.02', 3, 'Rekapitulasi Pemberitaan', 'fasilitatif', 1, 1, '2026-04-16 07:51:15'),
(210, 198, 'HH.03', 2, 'Kepustakaan', 'fasilitatif', 0, 1, '2026-04-16 07:52:04'),
(211, 210, 'HH.03.01', 3, 'Akusisi', 'fasilitatif', 1, 1, '2026-04-16 07:52:31'),
(212, 210, 'HH.03.02', 3, 'Pengolahan Bahan Pustaka', 'fasilitatif', 1, 1, '2026-04-16 07:53:08'),
(213, 210, 'HH.03.03', 3, 'Pangkalan Data Koleksi', 'fasilitatif', 1, 1, '2026-04-16 07:53:34'),
(214, 210, 'HH.03.04', 3, 'Layanan Perpustakaan', 'fasilitatif', 1, 1, '2026-04-16 07:53:55'),
(215, 210, 'HH.03.05', 3, 'Preservasi Bahan Pustaka', 'fasilitatif', 1, 1, '2026-04-16 07:54:18'),
(216, 210, 'HH.03.06', 3, 'Pengembangan Perpustakaan', 'fasilitatif', 1, 1, '2026-04-16 07:54:48'),
(217, 210, 'HH.03.07', 3, 'Pendidikan dan Pelatihan Perpustakaan', 'fasilitatif', 1, 1, '2026-04-16 07:55:56'),
(218, 210, 'HH.03.08', 3, 'Tenaga Perpustakaan', 'fasilitatif', 1, 1, '2026-04-16 07:56:18'),
(219, 198, 'HH.04', 2, 'Kerja Sama/Hubungan Lembaga dan Organisasi Kemasyarakatan', 'fasilitatif', 0, 1, '2026-04-16 07:57:16'),
(220, 219, 'HH.04.01', 3, 'Lembaga Tinggi Negara (dalam negeri dan luar negeri)', 'fasilitatif', 1, 1, '2026-04-16 07:58:06'),
(221, 219, 'HH.04.02', 3, 'Lembaga Pemerintah (dalam negeri dan luar negeri)', 'fasilitatif', 1, 1, '2026-04-16 07:58:52'),
(222, 219, 'HH.04.03', 3, 'Organisasi Kemasyarakatan/Lembaga Swasta (dalam negeri dan luar negeri)', 'fasilitatif', 1, 1, '2026-04-16 07:59:56'),
(223, 219, 'HH.04.04', 3, 'Perguruan Tinggi/Sekolah (dalam negeri dan luar negeri)', 'fasilitatif', 1, 1, '2026-04-16 08:00:41'),
(224, 219, 'HH.04.05', 3, 'Penyusunan Dokumen Kerja Sama (dalam negeri dan luar negeri)', 'fasilitatif', 1, 1, '2026-04-16 08:01:11'),
(225, 219, 'HH.04.06', 3, 'Permintaan dan Pengelolaan Data Kerja Sama (dalam negeri dan luar negeri)', 'fasilitatif', 1, 1, '2026-04-16 08:02:40'),
(226, 219, 'HH.04.07', 3, 'Audiensi/Kunjungan (Kementerian/Lembaga, Organisasi Kemasyarakatan/Lembaga Swasta, Organisasi Internasional/Organisasi Internasional Non Pemerintah)', 'fasilitatif', 1, 1, '2026-04-16 08:03:21'),
(227, 219, 'HH.04.08', 3, 'Pemantauan dan Evaluasi', 'fasilitatif', 1, 1, '2026-04-16 08:03:53'),
(228, 219, 'HH.04.09', 3, 'Administrasi Kerja Sama', 'fasilitatif', 1, 1, '2026-04-16 08:04:21'),
(229, 198, 'HH.05', 2, 'Layanan Advokasi Hukum', 'fasilitatif', 0, 1, '2026-04-16 08:04:55'),
(230, 229, 'HH.05.01', 3, 'Advokasi Hukum Litigasi', 'fasilitatif', 1, 1, '2026-04-16 08:05:20'),
(231, 229, 'HH.05.02', 3, 'Advokasi Hukum Non Litigasi', 'fasilitatif', 1, 1, '2026-04-16 08:05:43'),
(232, 229, 'HH.05.03', 3, 'Pengaduan Hukum', 'fasilitatif', 1, 1, '2026-04-16 08:06:05'),
(233, 229, 'HH.05.04', 3, 'Bantuan Hukum', 'fasilitatif', 1, 1, '2026-04-16 08:06:32'),
(234, 229, 'HH.05.05', 3, 'Layanan Aspirasi Dan Pengaduan Online Rakyat (LAPOR)', 'fasilitatif', 1, 1, '2026-04-16 08:06:57'),
(235, 229, 'HH.05.06', 3, 'Sistem Informasi Pelayanan Publik (SIPP)', 'fasilitatif', 1, 1, '2026-04-16 08:07:26'),
(236, NULL, 'UM', 1, 'Umum', 'fasilitatif', 0, 1, '2026-04-16 08:07:58'),
(237, 236, 'UM.01', 2, 'Ketatausahaan', 'fasilitatif', 0, 1, '2026-04-16 08:08:51'),
(238, 237, 'UM.01.01', 3, 'Persuratan', 'fasilitatif', 1, 1, '2026-04-16 08:09:16'),
(239, 237, 'UM.01.02', 3, 'Ucapan Terima Kasih/Ucapan Selamat', 'fasilitatif', 1, 1, '2026-04-16 08:09:43'),
(240, 236, 'UM.02', 2, 'Kearsipan', 'fasilitatif', 0, 1, '2026-04-16 08:10:49'),
(241, 240, 'UM.02.01', 3, 'Pemindahan Arsip', 'fasilitatif', 1, 1, '2026-04-16 08:11:16'),
(242, 240, 'UM.02.02', 3, 'Pemusnahan Arsip', 'fasilitatif', 1, 1, '2026-04-16 08:11:51'),
(243, 240, 'UM.02.03', 3, 'Penyerahan', 'fasilitatif', 1, 1, '2026-04-16 08:12:23'),
(244, 236, 'UM.03', 2, 'Kerumahtanggaan', 'fasilitatif', 0, 1, '2026-04-16 08:12:59'),
(245, 244, 'UM.03.01', 3, 'Penggunaan Ruang dan Peralatan Kantor', 'fasilitatif', 1, 1, '2026-04-16 08:13:38'),
(246, 244, 'UM.03.02', 3, 'Penggunaan dan Penghunian Rumah Negara serta Wisma Pengayoman', 'fasilitatif', 1, 1, '2026-04-16 08:14:09'),
(247, 244, 'UM.03.03', 3, 'Penggunaan dan Pemeliharaan Kendaraan Dinas', 'fasilitatif', 1, 1, '2026-04-16 08:14:33'),
(248, 244, 'UM.03.04', 3, 'Penggunaan dan Pemeliharaan Barang Elektronik serta Mesin', 'fasilitatif', 1, 1, '2026-04-16 08:15:00'),
(249, 244, 'UM.03.05', 3, 'Pemeliharaan Gedung dan Bangunan serta Area Kantor', 'fasilitatif', 1, 1, '2026-04-16 08:15:24'),
(250, 244, 'UM.03.06', 3, 'Pemeliharaan Alat Kesehatan', 'fasilitatif', 1, 1, '2026-04-16 08:15:51'),
(251, 244, 'UM.03.07', 3, 'Perjalanan Dinas (Dalam Negeri/Luar Negeri)', 'fasilitatif', 1, 1, '2026-04-16 08:16:17'),
(252, 244, 'UM.03.08', 3, 'Penghematan Energi dan air', 'fasilitatif', 1, 1, '2026-04-16 08:16:40'),
(253, 236, 'UM.04', 2, 'Keprotokolan', 'fasilitatif', 0, 1, '2026-04-16 08:17:24'),
(254, 253, 'UM.04.01', 3, 'Penyelenggaraan Upacara', 'fasilitatif', 1, 1, '2026-04-16 08:17:50'),
(255, 253, 'UM.04.02', 3, 'Pelayanan Tamu, Acara Kedinasan, Jamuan, dan Ramah Tamah', 'fasilitatif', 1, 1, '2026-04-16 08:18:32'),
(256, 253, 'UM.04.03', 3, 'Daftar Nama Pejabat dan Alamat', 'fasilitatif', 1, 1, '2026-04-16 08:18:55'),
(257, 236, 'UM.05', 2, 'Pengamanan', 'fasilitatif', 0, 1, '2026-04-16 08:19:26'),
(258, 257, 'UM.05.01', 3, 'Pengamanan Personil (VVIP/VIP)', 'fasilitatif', 1, 1, '2026-04-16 08:19:52'),
(259, 257, 'UM.05.02', 3, 'Pengamanan Lingkungan, Fisik dan Instalasi', 'fasilitatif', 1, 1, '2026-04-16 08:20:16'),
(260, 257, 'UM.05.03', 3, 'Pengamanan Dokumen dan Informasi Rahasia', 'fasilitatif', 1, 1, '2026-04-16 08:20:40'),
(261, 257, 'UM.05.04', 3, 'Laporan Keamanan', 'fasilitatif', 1, 1, '2026-04-16 08:21:10'),
(262, 257, 'UM.05.05', 3, 'Laporan Kejadian', 'fasilitatif', 1, 1, '2026-04-16 08:21:34'),
(263, 257, 'UM.05.06', 3, 'Bantuan Pengamanan', 'fasilitatif', 1, 1, '2026-04-16 08:21:58'),
(264, 236, 'UM.06', 2, 'Pembinaan Sikap Mental dan Layanan Kesehatan', 'fasilitatif', 0, 1, '2026-04-16 08:22:29'),
(265, 264, 'UM.06.01', 3, 'Layanan Keagamaan dan Sosial', 'fasilitatif', 1, 1, '2026-04-16 08:22:53'),
(266, 264, 'UM.06.02', 3, 'Layanan Kesehatan Jasmani', 'fasilitatif', 1, 1, '2026-04-16 08:23:16'),
(267, 264, 'UM.06.03', 3, 'Pelayanan Kesehatan', 'fasilitatif', 1, 1, '2026-04-16 08:23:37'),
(268, NULL, 'PW', 1, 'Pengawasan', 'fasilitatif', 0, 1, '2026-04-16 08:24:09'),
(269, 268, 'PW.01', 2, 'Perencanaan', 'fasilitatif', 0, 1, '2026-04-16 08:24:54'),
(270, 269, 'PW.01.01', 3, 'Kebijakan Pengawasan', 'fasilitatif', 1, 1, '2026-04-16 08:25:23'),
(271, 269, 'PW.01.02', 3, 'Perjanjian Kinerja', 'fasilitatif', 1, 1, '2026-04-16 08:25:45'),
(272, 269, 'PW.01.03', 3, 'Program Kerja Pengawasan Tahunan (PKPT)', 'fasilitatif', 1, 1, '2026-04-16 08:26:06'),
(273, 269, 'PW.01.04', 3, 'Program Kerja Administrasi Umum (PKAU)', 'fasilitatif', 1, 1, '2026-04-16 08:26:32'),
(274, 269, 'PW.01.05', 3, 'Rapat Koordinasi Pengawasan (RAKORWAS)', 'fasilitatif', 1, 1, '2026-04-16 08:26:58'),
(275, 269, 'PW.01.06', 3, 'Ikhtisar Hasil Pengawasan', 'fasilitatif', 1, 1, '2026-04-16 08:27:21'),
(276, 268, 'PW.02', 2, 'Pelaksanaan Pengawasan', 'fasilitatif', 0, 1, '2026-04-16 08:27:48'),
(277, 276, 'PW.02.01', 3, 'Audit Kinerja & Informasi, Reviu dan Evaluasi', 'fasilitatif', 1, 1, '2026-04-16 08:28:14'),
(278, 276, 'PW.02.02', 3, 'Audit Tujuan Tertentu/Khusus', 'fasilitatif', 1, 1, '2026-04-16 08:28:34'),
(279, 276, 'PW.02.03', 3, 'Pemantauan/Monitoring', 'fasilitatif', 1, 1, '2026-04-16 08:29:00'),
(280, 276, 'PW.02.04', 3, 'Pengawasan lainnya, Pendampingan, Sosialisasi, RDK, PKS dll', 'fasilitatif', 1, 1, '2026-04-16 08:29:24'),
(281, 268, 'PW.03', 2, 'Pelaporan', 'fasilitatif', 0, 1, '2026-04-16 08:29:48'),
(282, 281, 'PW.03.01', 3, 'Laporan Hasil Audit Kinerja (LHA/LHP), Informasi Data Pendukung Pemeriksaan', 'fasilitatif', 1, 1, '2026-04-16 08:30:20'),
(283, 281, 'PW.03.02', 3, 'Laporan Hasil Audit Tujuan Tertentu (Audit Khusus)', 'fasilitatif', 1, 1, '2026-04-16 08:30:45'),
(284, 281, 'PW.03.03', 3, 'Pemantauan/Monitoring Badan Pemeriksan Keuangan (BPK RI), Badan Pengawasan Keuangan dan Pembangunan Republik Indonesia (BPKP RI),Ombudsman Republik Indonesia (ORI), Inspektorat Jenderal', 'fasilitatif', 1, 1, '2026-04-16 08:31:19'),
(285, 281, 'PW.03.04', 3, 'Pengawasan lainnya, Pendampingan, Sosialisasi, RDK, PKS dll', 'fasilitatif', 1, 1, '2026-04-16 08:31:49'),
(286, 281, 'PW.03.05', 3, 'Ombudsman Republik Indonesia (ORI) (Dikonsultasikan terlebih dahulu)', 'fasilitatif', 1, 1, '2026-04-16 08:32:26'),
(287, 281, 'PW.03.06', 3, 'Inspektorat Jenderal', 'fasilitatif', 1, 1, '2026-04-16 08:32:55'),
(288, 268, 'PW.04', 2, 'Tindak Lanjut', 'fasilitatif', 0, 1, '2026-04-16 08:33:24'),
(289, 288, 'PW.04.01', 3, 'Laporan Tindak Lanjut Hasil Audit Kinerja', 'fasilitatif', 1, 1, '2026-04-16 08:33:52'),
(290, 288, 'PW.04.02', 3, 'Laporan Tindak Lanjut Hasil Audit Khusus', 'fasilitatif', 1, 1, '2026-04-16 08:34:20'),
(291, 288, 'PW.04.03', 3, 'Tindak Lanjut Badan Pengawasan Keuangan dan Pembangunan Republik Indonesia (BPKP RI), BPK RI, ITJEN', 'fasilitatif', 1, 1, '2026-04-16 08:34:49'),
(292, 268, 'PW.05', 2, 'Reviu dan Tindak Lanjut Reviu', 'fasilitatif', 0, 1, '2026-04-16 08:35:19'),
(293, 292, 'PW.05.01', 3, 'Reviu', 'fasilitatif', 1, 1, '2026-04-16 08:35:51'),
(294, 292, 'PW.05.02', 3, 'Tindak Lanjut Reviu', 'fasilitatif', 1, 1, '2026-04-16 08:36:11'),
(295, 268, 'PW.06', 2, 'Tindak Lanjut Pengaduan', 'fasilitatif', 0, 1, '2026-04-16 08:36:49'),
(296, 295, 'PW.06.01', 3, 'Whistle Blowing System (WBS)', 'fasilitatif', 1, 1, '2026-04-16 08:37:17'),
(297, 295, 'PW.06.02', 3, 'Gratifikasi', 'fasilitatif', 1, 1, '2026-04-16 08:37:37'),
(298, 295, 'PW.06.03', 3, 'Pengaduan Tertulis', 'fasilitatif', 1, 1, '2026-04-16 08:37:56'),
(299, 295, 'PW.06.05', 3, 'Pengaduan melalui aplikasi LAPOR (Layanan Pengaduan Secara Online Rakyat', 'fasilitatif', 1, 1, '2026-04-16 08:39:22'),
(300, 295, 'PW.06.06', 3, 'Pengaduan Ombusman', 'fasilitatif', 1, 1, '2026-04-16 08:39:54'),
(301, 268, 'PW.07', 2, 'Tindak Lanjut Atensi dan Telaahan', 'fasilitatif', 0, 1, '2026-04-16 08:40:28'),
(302, 301, 'PW.07.01', 3, 'Tanggapan/Telaahan Hukuman Disiplin yang Tidak Ditindaklanjuti', 'fasilitatif', 1, 1, '2026-04-16 08:41:06'),
(303, 301, 'PW.07.02', 3, 'Tanggapan/Telaahan Hukuman Disiplin yang Ditindaklanjuti', 'fasilitatif', 1, 1, '2026-04-16 08:41:32'),
(304, 301, 'PW.07.03', 3, 'Daftar nama pegawai Kementerian Hukum dan HAM yang dikenakan sanksi hukuman disiplin/kartu cela', 'fasilitatif', 1, 1, '2026-04-16 08:42:12'),
(305, NULL, 'TI', 1, 'Teknologi dan Informasi', 'fasilitatif', 0, 1, '2026-04-16 08:43:05'),
(306, 305, 'TI.01', 2, 'Pengamanan Data', 'fasilitatif', 1, 1, '2026-04-16 08:43:42'),
(307, 305, 'TI.02', 2, 'Pengamanan Jaringan', 'fasilitatif', 1, 1, '2026-04-16 08:44:16'),
(308, 305, 'TI.03', 2, 'Standarisasi', 'fasilitatif', 0, 1, '2026-04-16 08:44:35'),
(309, 308, 'TI.03.01', 3, 'Standarisasi Teknologi dan Informasi', 'fasilitatif', 1, 1, '2026-04-16 08:45:15'),
(310, 308, 'TI.03.02', 3, 'Implementasi Aplikasi', 'fasilitatif', 1, 1, '2026-04-16 08:45:59'),
(311, 308, 'TI.03.03', 3, 'Implementasi Situs Internet, Portal Internet dan Surat Elektronik', 'fasilitatif', 1, 1, '2026-04-16 08:46:36'),
(312, 308, 'TI.03.04', 3, 'Uji Coba Infrastruktur', 'fasilitatif', 1, 1, '2026-04-16 08:47:09'),
(313, 305, 'TI.04', 2, 'Kerjasama', 'fasilitatif', 0, 1, '2026-04-16 08:47:38'),
(314, 313, 'TI.04.01', 3, 'Kerjasama Internal', 'fasilitatif', 1, 1, '2026-04-16 08:48:04'),
(315, 313, 'TI.04.02', 3, 'Kerjasama Eksternal', 'fasilitatif', 1, 1, '2026-04-16 08:48:28'),
(316, 305, 'TI.05', 2, 'Perencanaan Pengembangan Teknologi Informasi', 'fasilitatif', 0, 1, '2026-04-16 08:49:05'),
(317, 316, 'TI.05.01', 3, 'Penyusunan Program Perencanaan Teknologi dan Informasi', 'fasilitatif', 1, 1, '2026-04-16 08:49:38'),
(318, 316, 'TI.05.02', 3, 'Pengembangan Infrastruktur Teknologi dan Informasi', 'fasilitatif', 1, 1, '2026-04-16 08:50:24'),
(319, 316, 'TI.05.03', 3, 'Pengembangan Aplikasi', 'fasilitatif', 1, 1, '2026-04-16 08:50:48'),
(320, 316, 'TI.05.04', 3, 'Pengembangan Database, Situs Internet, dan Surat Elektronik', 'fasilitatif', 1, 1, '2026-04-16 08:51:13'),
(321, 305, 'TI.06', 2, 'Pengelolaan Sistem Teknologi Informasi', 'fasilitatif', 0, 1, '2026-04-16 08:51:54'),
(322, 321, 'TI.06.01', 3, 'Pengelolaan Jaringan', 'fasilitatif', 1, 1, '2026-04-16 08:52:28'),
(323, 321, 'TI.06.02', 3, 'Pengelolaan Jaringan Sistem Informasi', 'fasilitatif', 1, 1, '2026-04-16 08:52:50'),
(324, 321, 'TI.06.03', 3, 'Pengelolaan Database', 'fasilitatif', 1, 1, '2026-04-16 08:53:16'),
(325, 321, 'TI.06.04', 3, 'Pengelolaan Situs Internet, Portal Internet, dan Surat Elektronik', 'fasilitatif', 1, 1, '2026-04-16 08:53:53'),
(326, 321, 'TI.06.05', 3, 'Pengelolaan Aplikasi', 'fasilitatif', 1, 1, '2026-04-16 08:54:22'),
(327, 321, 'TI.06.06', 3, 'Pengelolaan Alat Pendukung', 'fasilitatif', 1, 1, '2026-04-16 08:54:42'),
(328, 305, 'TI.07', 2, 'Layanan Sistem Teknologi dan Informasi', 'fasilitatif', 0, 1, '2026-04-16 08:55:08'),
(329, 328, 'TI.07.01', 3, 'Layanan Keluhan LPSE (Layanan Pengadaan Secara Elektronik)', 'fasilitatif', 1, 1, '2026-04-16 08:55:33'),
(330, 328, 'TI.07.02', 3, 'Tindak Lanjut Keluhan', 'fasilitatif', 1, 1, '2026-04-16 08:55:54'),
(331, 328, 'TI.07.03', 3, 'Monitoring/Pemantauan Layanan Keluhan', 'fasilitatif', 1, 1, '2026-04-16 08:56:16'),
(333, 328, 'TI.07.04', 3, 'Evaluasi', 'fasilitatif', 1, 1, '2026-04-16 08:57:29'),
(334, NULL, 'PP', 1, 'Peraturan Perundang-undangan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(335, 334, 'PP.01', 2, 'Perancangan Peraturan Perundang-undangan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(336, 335, 'PP.01.01', 3, 'Perencanaan dan Penyiapan Konsepsi Rancangan Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(337, 335, 'PP.01.02', 3, 'Penyusunan Rancangan Undang-Undang, Rancangan Peraturan Pemerintah Pengganti Undang-Undang, dan Rancangan Peraturan Pemerintah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(338, 335, 'PP.01.03', 3, 'Penyusunan Rancangan Peraturan Presiden dan Rancangan Peraturan Menteri Hukum dan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(339, 335, 'PP.01.04', 3, 'Pembahasan Rancangan Undang-Undang', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(340, 335, 'PP.01.05', 3, 'Pengharmonisasian Rancangan Peraturan Menteri/Lembaga', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(341, 334, 'PP.02', 2, 'Harmonisasi Peraturan Perundang-undangan I', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(342, 341, 'PP.02.01', 3, 'Harmonisasi Bidang Politik dan Pemerintahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(343, 341, 'PP.02.02', 3, 'Harmonisasi Bidang Pertahanan dan Keamanan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(344, 341, 'PP.02.03', 3, 'Harmonisasi Bidang Hukum dan Hak Asasi Manusia (HAM)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(345, 341, 'PP.02.04', 3, 'Harmonisasi Bidang Sumber Daya Manusia (SDM), Kelembagaan dan Kesejahteraan Rakyat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(346, 334, 'PP.03', 2, 'Harmonisasi Peraturan Perundang-undangan II', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(347, 346, 'PP.03.01', 3, 'Harmonisasi Bidang Moneter, Jasa Keuangan, Badan Usaha Milik Negara (BUMN) dan Penanaman Modal', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(348, 346, 'PP.03.02', 3, 'Harmonisasi Bidang Perencanaan Pembangunan Nasional dan Fiskal', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(349, 346, 'PP.03.03', 3, 'Harmonisasi Bidang Sumber Daya Alam (SDA), Lingkungan hidup, Kehutanan, Prasarana, Agraria dan Tata Ruang', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(350, 346, 'PP.03.04', 3, 'Harmonisasi Bidang Perindustrian, Perdagangan, Riset dan Teknologi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(351, 334, 'PP.04', 2, 'Fasilitasi Perancangan Peraturan Daerah dan Pembinaan Perancang Peraturan Perundang-undangan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(352, 351, 'PP.04.01', 3, 'Perencanaan, Penyusunan Kebijakan Teknis dan Akreditasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(353, 351, 'PP.04.02', 3, 'Fasilitasi Perancangan Peraturan Daerah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(354, 351, 'PP.04.03', 3, 'Standardisasi dan Bimbingan Perancang Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(355, 351, 'PP.04.04', 3, 'Sistem Informasi, Manajemen dan Penilaian Angka Kredit Perancang Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(356, 334, 'PP.05', 2, 'Pengundangan, Penerjemahan, dan Publikasi Peraturan Perundang-undangan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(357, 356, 'PP.05.01', 3, 'Pengundangan Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(358, 356, 'PP.05.02', 3, 'Penerjemahan Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(359, 356, 'PP.05.03', 3, 'Sistem Informasi Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(360, 356, 'PP.05.04', 3, 'Publikasi, Dokumentasi, dan Perpustakaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(361, 334, 'PP.06', 2, 'Litigasi Peraturan Perundang-undangan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(362, 361, 'PP.06.01', 3, 'Penyiapan dan Pendampingan Persidangan Bidang Politik, Hukum, Hak Asasi Manusia dan Keamanan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(363, 361, 'PP.06.02', 3, 'Penyiapan dan Pendampingan Persidangan Bidang Kesejahteraan Rakyat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(364, 361, 'PP.06.03', 3, 'Penyiapan dan Pendampingan Persidangan Bidang Perekonomian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(365, NULL, 'AH', 1, 'Administrasi Hukum Umum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(366, 365, 'AH.01', 2, 'Badan Hukum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(367, 366, 'AH.01.01', 3, 'Pendaftaran Pendirian Perseroan Terbatas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(368, 366, 'AH.01.02', 3, 'Pendaftaran Persetujuan Perubahan Anggaran Dasar', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(369, 366, 'AH.01.03', 3, 'Pendaftaran Pemberitahuan Anggaran Dasar dan Perubahan Data Persero', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(370, 366, 'AH.01.04', 3, 'Pendirian Yayasan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(371, 366, 'AH.01.05', 3, 'Persetujuan Perubahan Anggaran Dasar Yayasan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(372, 366, 'AH.01.06', 3, 'Pemberitahuan Anggaran Dasar dan Perubahan Data', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(373, 366, 'AH.01.07', 3, 'Pendirian Perkumpulan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(374, 366, 'AH.01.08', 3, 'Persetujuan Perubahan Anggaran Dasar Perkumpulan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(375, 366, 'AH.01.09', 3, 'Penggabungan, Pengambilalihan, Pemisahan PT', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(376, 366, 'AH.01.10', 3, 'Pembubaran Perseroan Terbatas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(377, 366, 'AH.01.11', 3, 'Likuidasi / Berakhirnya Status Badan Hukum PT', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(378, 366, 'AH.01.12', 3, 'Pembubaran Yayasan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(379, 366, 'AH.01.13', 3, 'Pembubaran Perkumpulan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(380, 366, 'AH.01.14', 3, 'Pendaftaran Persekutuan Komanditer', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(381, 366, 'AH.01.15', 3, 'Pencatatan Pendaftaran Persekutuan Komanditer', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(382, 366, 'AH.01.16', 3, 'Perubahan Persekutuan Komanditer', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(383, 366, 'AH.01.17', 3, 'Pencatatan Perubahan Persekutuan Komanditer', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(384, 366, 'AH.01.18', 3, 'Pendaftaran Firma', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(385, 366, 'AH.01.19', 3, 'Pencatatan Pendaftaran Firma', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(386, 366, 'AH.01.20', 3, 'Perubahan Firma', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(387, 366, 'AH.01.21', 3, 'Pencatatan Perubahan Firma', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(388, 366, 'AH.01.22', 3, 'Pendaftaran Persekutuan Perdata', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(389, 366, 'AH.01.23', 3, 'Pencatatan Pendaftaran Persekutuan Perdata', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(390, 366, 'AH.01.24', 3, 'Perubahan Persekutuan Perdata', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(391, 366, 'AH.01.25', 3, 'Pencatatan Perubahan Persekutuan Perdata', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(392, 366, 'AH.01.26', 3, 'Pembubaran Persekutuan Komanditer', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(393, 366, 'AH.01.27', 3, 'Pembubaran Firma', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(394, 366, 'AH.01.28', 3, 'Pembubaran Persekutuan Perdata', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(395, 366, 'AH.01.29', 3, 'Pengesahan Pendirian Badan Hukum Koperasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(396, 366, 'AH.01.30', 3, 'Pendaftaran Pendirian Perseroan Perorangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(397, 366, 'AH.01.31', 3, 'Pendaftaran Perubahan Perseroan Perorangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(398, 366, 'AH.01.32', 3, 'Pembubaran Perseroan Perorangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(399, 366, 'AH.01.33', 3, 'Pendaftaran Pendirian BUM Desa', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(400, 366, 'AH.01.34', 3, 'Pendaftaran Perubahan BUM Desa', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(401, 366, 'AH.01.35', 3, 'Pendaftaran Pendirian BUM Desa Bersama', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(402, 366, 'AH.01.36', 3, 'Pendaftaran Perubahan BUM Desa Bersama', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(403, 366, 'AH.01.37', 3, 'Pencabutan Status Badan Hukum Perseroan Perorangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(404, 366, 'AH.01.38', 3, 'Pengesahan Perubahan Anggaran Dasar Koperasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(405, 366, 'AH.01.39', 3, 'Penerimaan Pemberitahuan Perubahan Data Koperasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(406, 366, 'AH.01.40', 3, 'Pemberitahuan Pembubaran Koperasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(407, 366, 'AH.01.41', 3, 'Pencabutan/Pembatalan Status Badan Hukum PT', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(408, 366, 'AH.01.42', 3, 'Pencabutan/Pembatalan Status Badan Hukum Yayasan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(409, 366, 'AH.01.43', 3, 'Pencabutan/Pembatalan Status Badan Hukum Perkumpulan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(410, 366, 'AH.01.44', 3, 'Pencabutan/Pembatalan Status Badan Hukum Koperasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(411, 366, 'AH.01.45', 3, 'Pencabutan/Pembatalan Status Persekutuan Komanditer, Persekutuan Firma, Persekutuan Perdata', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(412, 366, 'AH.01.46', 3, 'Penerimaan pemberitahuan perubahan anggaran dasar BUM Desa', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(413, 366, 'AH.01.47', 3, 'Penerimaan pemberitahuan perubahan anggaran dasar BUM Desa Bersama', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(414, 365, 'AH.02', 2, 'Notariat', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(415, 414, 'AH.02.01', 3, 'Pengangkatan Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(416, 414, 'AH.02.02', 3, 'Perpindahan Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(417, 414, 'AH.02.03', 3, 'Perpanjangan Masa Jabatan Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(418, 414, 'AH.02.04', 3, 'Pemberhentian Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(419, 414, 'AH.02.05', 3, 'Surat Keputusan Cuti', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(420, 414, 'AH.02.06', 3, 'Penunjukan Pemegang Protokol', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(421, 414, 'AH.02.07', 3, 'Majelis Pengawas Pusat Notaris', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(422, 421, 'AH.02.07.01', 4, 'Surat Umum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(423, 421, 'AH.02.07.02', 4, 'Cuti Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(424, 421, 'AH.02.07.03', 4, 'Konduite Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(425, 421, 'AH.02.07.04', 4, 'Rekomendasi Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(426, 421, 'AH.02.07.05', 4, 'Putusan MPPN', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(427, 414, 'AH.02.08', 3, 'Sertifikat Ujian Pengangkatan Notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(428, 414, 'AH.02.09', 3, 'Majelis Kehormatan Notaris Pusat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(429, 365, 'AH.03', 2, 'Hukum Perdata Umum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(430, 429, 'AH.03.01', 3, 'Legalisasi Spesimen Tanda Tangan Pejabat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(431, 429, 'AH.03.02', 3, 'Surat Keputusan Ganti Nama', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(432, 429, 'AH.03.03', 3, 'Advokat Asing', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(433, 432, 'AH.03.03.01', 4, 'Surat Keputusan Persetujuan Mempekerjakan Advokat Asing', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(434, 432, 'AH.03.03.02', 4, 'Surat Keputusan Persetujuan Perpanjangan Mempekerjakan Advokat Asing', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(435, 429, 'AH.03.04', 3, 'Pendapat Hukum (Legal Opinion) yang diminta oleh Pemerintah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(436, 429, 'AH.03.05', 3, 'Pendapat Hukum (Legal Opinion) yang diminta oleh Masyarakat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(437, 429, 'AH.03.06', 3, 'Formulir Permohonan Legalisir', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(438, 429, 'AH.03.07', 3, 'Pengangkatan Penerjemah Tersumpah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(439, 429, 'AH.03.08', 3, 'Pemberhentian Penerjemah Tersumpah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(440, 429, 'AH.03.09', 3, 'Advokasi Keperdataan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(441, 429, 'AH.03.10', 3, 'Database', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(442, 365, 'AH.04', 2, 'Wasiat', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(443, 442, 'AH.04.01', 3, 'Penerbitan Surat Keterangan Wasiat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(444, 442, 'AH.04.02', 3, 'Pelaporan Wasiat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(445, 442, 'AH.04.03', 3, 'Laporan Bulanan Wasiat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(446, 442, 'AH.04.04', 3, 'Perubahan Permohonan/Perbaikan Surat Keterangan Wasiat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(447, 442, 'AH.04.05', 3, 'Pendaftaran Kurator dan Pengurus', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(448, 442, 'AH.04.06', 3, 'Perpanjangan Tanda Terdaftar Kurator dan Pengurus', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(449, 442, 'AH.04.07', 3, 'Perpanjangan Sementara Kurator dan Pengurus', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(450, 442, 'AH.04.08', 3, 'Izin Jual Boedel, Persetujuan, Penelitian dan Penelaahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(451, 442, 'AH.04.09', 3, 'Daftar harta peninggalan/boedel of wezig', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(452, 365, 'AH.05', 2, 'Pendaftaran Fidusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(453, 452, 'AH.05.01', 3, 'Pendaftaran Sertifikat Jaminan Fidusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(454, 452, 'AH.05.02', 3, 'Perubahan Sertifikat Jaminan Fidusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(455, 452, 'AH.05.03', 3, 'Penghapusan/Pencoretan Sertifikat Jaminan Fidusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(456, 365, 'AH.06', 2, 'Harta Peninggalan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(457, 456, 'AH.06.01', 3, 'Pendaftaran Wasiat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(458, 456, 'AH.06.02', 3, 'Perwalian Pengawas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(459, 456, 'AH.06.03', 3, 'Pengampu Pengawas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(460, 456, 'AH.06.04', 3, 'Pengampu Anak Dalam Kandungan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(461, 456, 'AH.06.05', 3, 'Pengampu Harta Peninggalan yang tidak ada kuasanya (Onbeheerde Nalatenschap)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(462, 456, 'AH.06.06', 3, 'Kurator Dalam Kepailitan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(463, 456, 'AH.06.07', 3, 'Wali Sementara', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(464, 456, 'AH.06.08', 3, 'Pengurus Harta Kekayaan Orang yang Dinyatakan Tidak Hadir (afwijzig)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(465, 456, 'AH.06.09', 3, 'Surat Keterangan Hak Waris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(466, 456, 'AH.06.10', 3, 'Transfer Dana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(467, 365, 'AH.07', 2, 'Pelayanan Hukum Pidana dan Grasi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(468, 467, 'AH.07.01', 3, 'Pendapat Hukum tentang Pelayanan Pidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(469, 467, 'AH.07.02', 3, 'Pendapat Hukum tentang Grasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(470, 467, 'AH.07.03', 3, 'Pendapat Hukum tentang Saksi Ahli', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(471, 467, 'AH.07.04', 3, 'Kajian dan Telaah tentang Pemantauan dan Evaluasi Hukum Pidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(472, 365, 'AH.08', 2, 'Sidik Jari/Daktiloskopi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(473, 472, 'AH.08.01', 3, 'Sidik Jari', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(474, 473, 'AH.08.01.01', 4, 'Slip Sidik Jari', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(475, 473, 'AH.08.01.02', 4, 'Hasil Rumusan Identifikasi/Sidik Jari', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(476, 472, 'AH.08.02', 3, 'Data dan Informasi Sidik Jari', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(477, 365, 'AH.09', 2, 'Penyidik Pegawai Negeri Sipil (PPNS)', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(478, 477, 'AH.09.01', 3, 'Seleksi Administrasi Calon PPNS', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(479, 477, 'AH.09.02', 3, 'Pengangkatan PPNS', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(480, 477, 'AH.09.03', 3, 'Pengangkatan Kembali PPNS', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(481, 477, 'AH.09.04', 3, 'Pelantikan PPNS', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(482, 477, 'AH.09.05', 3, 'Mutasi PPNS', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(483, 477, 'AH.09.06', 3, 'Pemberhentian Non Teknis Operasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(484, 477, 'AH.09.07', 3, 'Pemberhentian Sebagai PPNS', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(485, 477, 'AH.09.08', 3, 'Pemberhentian atas Permintaan Sendiri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(486, 477, 'AH.09.09', 3, 'Perpanjangan KTP', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(487, 477, 'AH.09.10', 3, 'Penerbitan KTP yang Hilang/Rusak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(488, 365, 'AH.10', 2, 'Hukum Tata Negara', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(489, 488, 'AH.10.01', 3, 'Kewarganegaraan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(490, 489, 'AH.10.01.01', 4, 'Proses Pengurusan Kewarganegaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(491, 489, 'AH.10.01.02', 4, 'Bukti Kewarganegaraan Termasuk KEPPRES dan Berita Acara Sumpah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(492, 489, 'AH.10.01.03', 4, 'Keterangan Pelepasan Kewarganegaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(493, 489, 'AH.10.01.04', 4, 'Surat Keterangan Status Kewarganegaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(494, 489, 'AH.10.01.05', 4, 'Surat Keputusan Kewarganegaraan RI Bagi Anak Berkewarganegaraan Ganda', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(495, 489, 'AH.10.01.06', 4, 'Surat Keputusan Permohonan Tetap Menjadi WNI', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(496, 489, 'AH.10.01.07', 4, 'Surat Keputusan Permohonan Memperoleh Kembali Kewarganegaraan RI', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(497, 489, 'AH.10.01.08', 4, 'Surat Keterangan Kehilangan Warga Negara RI atas Kemauan Sendiri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(498, 489, 'AH.10.01.09', 4, 'Surat Pengantar Kepada Presiden RI Permohonan Kehilangan Kewarganegaraan RI', 'substantif', 1, 1, '2026-04-20 07:20:39');
INSERT INTO `letter_classifications` (`id`, `parent_id`, `code`, `level`, `name`, `type`, `is_leaf`, `is_active`, `created_at`) VALUES
(499, 489, 'AH.10.01.10', 4, 'Dokumen Laporan Kehilangan Kewarganegaraan RI dari Kantor Perwakilan RI di Luar Negeri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(500, 489, 'AH.10.01.11', 4, 'SBKRI (Surat Bukti Kewarganegaraan Republik Indonesia)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(501, 489, 'AH.10.01.12', 4, 'Surat Keputusan Menteri Hukum dan Hak Asasi Manusia RI tentang Penegasan Status Kewarganegaraan RI bagi WNI Keturunan Asing yang tidak Memiliki Dokumen Kewarganegaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(502, 488, 'AH.10.02', 3, 'Pewarganegaraan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(503, 502, 'AH.10.02.01', 4, 'Permohonan Pewarganegaraan melalui Perkawinan Berdasarkan Pasal 19 Undang-Undang Nomor 12 Tahun 2006', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(504, 502, 'AH.10.02.02', 4, 'Permohonan Karena Jasa Terhadap Negara Indonesia Berdasarkan Pasal 20 Undang-Undang Nomor 12 Tahun 2006', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(505, 502, 'AH.10.02.03', 4, 'Permohonan Naturalisasi Murni berdasarkan Pasal 8 Undang-Undang Nomor 12 Tahun 2006', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(506, 365, 'AH.11', 2, 'Partai Politik', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(507, 506, 'AH.11.01', 3, 'Keputusan Menteri Hukum dan HAM tentang Pengesahan Badan Hukum Partai Politik dan salinan akta notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(508, 506, 'AH.11.02', 3, 'Keputusan Menteri Hukum dan HAM tentang Pengesahan Kepengurusan Partai Politik dan salinan akta notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(509, 506, 'AH.11.03', 3, 'Keputusan Menteri Hukum dan HAM tentang Pengesahan AD/ART Partai Politik dan salinan akta notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(510, 506, 'AH.11.04', 3, 'Dokumen Persyaratan Pendirian Badan Hukum Partai Politik kecuali salinan akta notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(511, 506, 'AH.11.05', 3, 'Dokumen Persyaratan Pengesahan Kepengurusan Partai Politik kecuali salinan akta notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(512, 506, 'AH.11.06', 3, 'Dokumen Persyaratan Pengesahan AD/ART Partai Politik kecuali salinan akta notaris', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(513, 506, 'AH.11.07', 3, 'Dokumen Advokasi Partai Politik', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(514, 506, 'AH.11.08', 3, 'Keputusan Menteri Hukum dan HAM tentang Pembubaran Partai Politik', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(515, 365, 'AH.12', 2, 'Otoritas Pusat dan Hukum Internasional', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(516, 515, 'AH.12.01', 3, 'Perjanjian Bantuan Hukum Timbal Balik Dalam Masalah Pidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(517, 515, 'AH.12.02', 3, 'Surat Rekomendasi Penanganan Bantuan Hukum Timbal Balik Dalam Masalah Pidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(518, 515, 'AH.12.03', 3, 'Perjanjian Ekstradisi dan Pemindahan Narapidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(519, 515, 'AH.12.04', 3, 'Surat Rekomendasi Penanganan Ekstradisi dan Pemindahan Narapidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(520, 515, 'AH.12.05', 3, 'Hukum Ekonomi dan Lembaga Internasional', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(521, 520, 'AH.12.05.01', 4, 'Sertifikat Apostille', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(522, 515, 'AH.12.06', 3, 'Hukum Perdata Internasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(523, 515, 'AH.12.07', 3, 'Hukum Laut, Udara, Angkasa dan Lingkungan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(524, 515, 'AH.12.08', 3, 'Hukum Humaniter', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(525, 515, 'AH.12.09', 3, 'Produk yang diterbitkan Atase Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(526, 365, 'AH.13', 2, 'Teknologi Informasi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(527, 526, 'AH.13.01', 3, 'Perencanaan dan Pengembangan Teknologi Informasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(528, 526, 'AH.13.02', 3, 'Pembangunan Aplikasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(529, 526, 'AH.13.03', 3, 'Implementasi dan Perubahan Sistem Teknologi Informasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(530, 526, 'AH.13.04', 3, 'Layanan Sistem Teknologi Informasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(531, 526, 'AH.13.05', 3, 'Pengelolaan dan Pemeliharaan Perangkat Keras dan Perangkat Lunak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(532, 526, 'AH.13.06', 3, 'Monitoring dan Evaluasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(533, NULL, 'PK', 1, 'Pemasyarakatan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(534, 533, 'PK.01', 2, 'Pelayanan Pemasyarakatan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(535, 534, 'PK.01.01', 3, 'Registrasi Tahanan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(536, 534, 'PK.01.02', 3, 'Registrasi Narapidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(537, 534, 'PK.01.03', 3, 'Registrasi Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(538, 534, 'PK.01.04', 3, 'Registrasi Klien Pemasyarakatan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(539, 534, 'PK.01.05', 3, 'Registrasi Titipan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(540, 534, 'PK.01.06', 3, 'Admisi Orientasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(541, 533, 'PK.02', 2, 'Assesment dan Klasifikasi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(542, 541, 'PK.02.01', 3, 'Tahanan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(543, 541, 'PK.02.02', 3, 'Narapidana dan Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(544, 541, 'PK.02.03', 3, 'Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(545, 541, 'PK.02.04', 3, 'Klien', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(546, 533, 'PK.03', 2, 'Statistik Pelayanan Pemasyarakatan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(547, 546, 'PK.03.01', 3, 'Tahanan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(548, 546, 'PK.03.02', 3, 'Narapidana', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(549, 546, 'PK.03.03', 3, 'Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(550, 546, 'PK.03.04', 3, 'Klien Pemasyarakatan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(551, 546, 'PK.03.05', 3, 'Titipan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(552, 546, 'PK.03.06', 3, 'Benda Sitaan/Barang Rampasan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(553, 533, 'PK.04', 2, 'Bimbingan Kemasyarakatan dan Pengentasan Anak', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(554, 553, 'PK.04.01', 3, 'Penelitian Kemasyarakatan (LITMAS)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(555, 553, 'PK.04.02', 3, 'Pidana Bersyarat (PiB)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(556, 553, 'PK.04.03', 3, 'Diversi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(557, 553, 'PK.04.04', 3, 'Pembimbingan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(558, 553, 'PK.04.05', 3, 'Pembimbingan Lanjutan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(559, 533, 'PK.05', 2, 'Pelayanan Tahanan, Pembinaan Narapidana/Anak dan Latihan Kerja Produksi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(560, 559, 'PK.05.01', 3, 'Pembinaan Kepribadian dan Pendidikan Narapidana dan Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(561, 559, 'PK.05.02', 3, 'Bimbingan Kepribadian dan Keterampilan Tahanan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(562, 559, 'PK.05.03', 3, 'Pelatihan Keterampilan Narapidana dan Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(563, 559, 'PK.05.04', 3, 'Remisi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(564, 559, 'PK.05.05', 3, 'Pemindahan/Mutasi WBP', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(565, 559, 'PK.05.06', 3, 'Peminjaman/Bon Tahanan, Narapidana dan Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(566, 559, 'PK.05.07', 3, 'Ijin Keluar Lapas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(567, 559, 'PK.05.08', 3, 'Kegiatan Kerja dan Tenaga Kerja', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(568, 559, 'PK.05.09', 3, 'Integrasi Narapidana dan Anak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(569, 559, 'PK.05.10', 3, 'Sidang Tim Pengamat Pemasyarakatan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(570, 559, 'PK.05.11', 3, 'Bantuan/Penyuluhan Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(571, 559, 'PK.05.12', 3, 'Pengeluaran WBP', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(572, 533, 'PK.06', 2, 'Perawatan Kesehatan dan Rehabilitasi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(573, 572, 'PK.06.01', 3, 'Penyuluhan dan Pencegahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(574, 572, 'PK.06.02', 3, 'Perawatan Dasar dan Kelompok Rentan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(575, 572, 'PK.06.03', 3, 'Perawatan Mental dan Paliatif', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(576, 572, 'PK.06.04', 3, 'Rujukan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(577, 572, 'PK.06.05', 3, 'Rehabilitasi Ketergantungan Napza', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(578, 572, 'PK.06.06', 3, 'Perawatan HIV/AIDS', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(579, 572, 'PK.06.07', 3, 'Perawatan Pencegahan Penyakit Menular', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(580, 572, 'PK.06.08', 3, 'Pelayanan Makanan dan Gizi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(581, 572, 'PK.06.09', 3, 'Pelayanan Dasar Sanitasi dan Kesehatan Lingkungan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(582, 533, 'PK.07', 2, 'Pengelolaan Benda Sitaan dan Barang Rampasan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(583, 582, 'PK.07.01', 3, 'Registrasi Benda Sitaan/Rampasan Negara', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(584, 582, 'PK.07.02', 3, 'Penilaian dan Klasifikasi Benda Sitaan/Barang Rampasan Negara', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(585, 582, 'PK.07.03', 3, 'Pemeliharaan dan Pemusnahan Benda Sitaan/Barang Rampasan Negara', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(586, 582, 'PK.07.04', 3, 'Keamanan dan Pengawasan Benda Sitaan/Barang Rampasan Negara', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(587, 582, 'PK.07.05', 3, 'Klarifikasi dan Mutasi Benda Sitaan/Barang Rampasan Negara', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(588, 533, 'PK.08', 2, 'Keamanan dan Ketertiban', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(589, 588, 'PK.08.01', 3, 'Keamanan dan Kepatuhan Internal Kode Etik', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(590, 588, 'PK.08.02', 3, 'Layanan Pengaduan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(591, 588, 'PK.08.03', 3, 'Intelijen', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(592, 588, 'PK.08.04', 3, 'Pembinaan dan Penyelenggaraan Layanan Intelijen', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(593, 588, 'PK.08.05', 3, 'Pencegahan dan Pemeliharaan Keamanan dan Ketertiban', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(594, 588, 'PK.08.06', 3, 'Penindakan dan Penanggulangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(595, NULL, 'GR', 1, 'Keimigrasian', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(596, 595, 'GR.01', 2, 'Lalu Lintas Keimigrasian', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(597, 596, 'GR.01.01', 3, 'Kebijakan Imigrasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(598, 596, 'GR.01.02', 3, 'Dokumen Perjalanan Republik Indonesia (DPRI)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(599, 596, 'GR.01.03', 3, 'Pas Lintas Batas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(600, 596, 'GR.01.04', 3, 'Surat Pejalanan Laksana Paspor (SPLP) Warga Negara Asing', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(601, 596, 'GR.01.05', 3, 'Fasilitas Keimigrasian antara lain ABTC (Asia Pacific Economic Corporation Business Travel Card) dan Smart Card', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(602, 596, 'GR.01.06', 3, 'Persetujuan Visa', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(603, 596, 'GR.01.07', 3, 'Bebas Visa Kunjungan (BVK)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(604, 596, 'GR.01.08', 3, 'Tanda Masuk dan Tanda Keluar', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(605, 596, 'GR.01.09', 3, 'Rekomendasi Untuk Mendapatkan Work and Holiday Visa', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(606, 596, 'GR.01.10', 3, 'Pengelolaan Dokumen Blangko DPRI, Visa, dan Perdim', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(607, 595, 'GR.02', 2, 'Izin Tinggal Keimigrasian', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(608, 607, 'GR.02.01', 3, 'Izin Tinggal Kunjungan (ITK)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(609, 607, 'GR.02.02', 3, 'Izin Tinggal Terbatas (ITAS)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(610, 607, 'GR.02.03', 3, 'Izin Tinggal Tetap (ITAP)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(611, 607, 'GR.02.04', 3, 'Alih Status (Konversi) Izin Tinggal Termasuk Penolakannya', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(612, 607, 'GR.02.05', 3, 'Surat Keterangan Keimigrasian (SKIM)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(613, 607, 'GR.02.06', 3, 'Skip Alur Pengambilan Data Biometrik', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(614, 607, 'GR.02.07', 3, 'Penelaahan Status Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(615, 607, 'GR.02.08', 3, 'Pengelolaan Dokumen Izin Tinggal Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(616, 607, 'GR.02.09', 3, 'Permohonan Exit Permit Only (EPO)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(617, 607, 'GR.02.10', 3, 'Permohonan Izin Masuk Kembali (IMK)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(618, 595, 'GR.03', 2, 'Pengawasan dan Penindakan Keimigrasian (WASDAKIM)', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(619, 618, 'GR.03.01', 3, 'Penyelidikan dan Penyidikan Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(620, 618, 'GR.03.02', 3, 'Pencegahan dan Penangkalan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(621, 618, 'GR.03.03', 3, 'Imigran Ilegal', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(622, 618, 'GR.03.04', 3, 'Pencabutan, Pembatalan, Penahanan Doklan dan DOKIM termasuk Siar Paspor Yang Dibatalkan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(623, 618, 'GR.03.05', 3, 'Pengawasan Terhadap WNI', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(624, 618, 'GR.03.06', 3, 'Pengawasan Terhadap WNA', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(625, 618, 'GR.03.07', 3, 'Kepatuhan Internal', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(626, 618, 'GR.03.08', 3, 'Pendeportasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(627, 618, 'GR.03.09', 3, 'Tindakan Administratif Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(628, 618, 'GR.03.10', 3, 'Daftar Pencarian Orang (DPO)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(629, 618, 'GR.03.11', 3, 'Pendetensian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(630, 595, 'GR.04', 2, 'Intelijen Keimigrasian', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(631, 630, 'GR.04.01', 3, 'Penyelidikan dan Operasi Intelijen Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(632, 630, 'GR.04.02', 3, 'Pengamanan Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(633, 630, 'GR.04.03', 3, 'Kerjasama Intelijen Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(634, 630, 'GR.04.04', 3, 'Produk Intelijen Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(635, 595, 'GR.05', 2, 'Kerjasama Keimigrasian', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(636, 635, 'GR.05.01', 3, 'Kerja Sama Antar Lembaga (Dalam Negeri)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(637, 635, 'GR.05.02', 3, 'Kerja Sama Antar Negara', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(638, 635, 'GR.05.03', 3, 'Kerja Sama dengan Organisasi Internasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(639, 635, 'GR.05.04', 3, 'Pembinaan Perwakilan RI di Luar Negeri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(640, 595, 'GR.06', 2, 'Sistem dan Teknologi Informasi Keimigrasian', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(641, 640, 'GR.06.01', 3, 'Lintas Informasi Internal termasuk Tukar Menukar Informasi dan Pelaporan Kegiatan Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(642, 640, 'GR.06.02', 3, 'Lintas Informasi External termasuk Pertukaran Informasi dengan Institusi di Luar Imigrasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(643, 640, 'GR.06.03', 3, 'Data Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(644, 640, 'GR.06.04', 3, 'Permohonan Data Keimigrasian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(645, 640, 'GR.06.05', 3, 'Perubahan Data Status Keimigrasian WNA', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(646, 640, 'GR.06.06', 3, 'Data Permohonan Ditolak Sistem', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(647, 595, 'GR.07', 2, 'Dokumen Keimigrasian Perwakilan Luar Negeri', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(648, 647, 'GR.07.01', 3, 'Warga Negara Indonesia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(649, 647, 'GR.07.02', 3, 'Warga Negara Asing', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(650, NULL, 'KI', 1, 'Kekayaan Intelektual', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(651, 650, 'KI.01', 2, 'Hak Cipta', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(652, 651, 'KI.01.01', 3, 'Proses Penyelesaian Permohonan Pencatatan Ciptaan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(653, 652, 'KI.01.01.01', 4, 'Pemberitahuan Kekurangan Kelengkapan Permohonan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(654, 652, 'KI.01.01.02', 4, 'Tarik Kembali', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(655, 652, 'KI.01.01.03', 4, 'Tidak Dapat Dicatatkan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(656, 651, 'KI.01.02', 3, 'Pasca Pencatatan Ciptaan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(657, 656, 'KI.01.02.01', 4, 'Pemberitahuan Kekurangan Kelengkapan Permohonan Pasca Pencatatan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(658, 656, 'KI.01.02.02', 4, 'Perubahan Nama dan/atau Alamat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(659, 656, 'KI.01.02.03', 4, 'Koreksi Surat Pencatatan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(660, 656, 'KI.01.02.04', 4, 'Pencatatan Pengalihan Hak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(661, 656, 'KI.01.02.05', 4, 'Pencatatan Perjanjian Lisensi Berdasarkan Surat Pencatatan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(662, 656, 'KI.01.02.06', 4, 'Pencatatan Perjanjian Lisensi Tidak Berdasarkan Surat Pencatatan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(663, 656, 'KI.01.02.07', 4, 'Petikan Resmi Surat Pencatatan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(664, 656, 'KI.01.02.08', 4, 'Salinan Surat Pencatatan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(665, 656, 'KI.01.02.09', 4, 'Pembatalan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(666, 656, 'KI.01.02.10', 4, 'Penghapusan Ciptaan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(667, 651, 'KI.01.03', 3, 'Pelayanan Hukum/Pendapat Hukum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(668, 667, 'KI.01.03.01', 4, 'Pertimbangan/Pendapat Hukum Hak Cipta', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(669, 667, 'KI.01.03.02', 4, 'Keputusan Penghapusan Hak Cipta atas Permohonan Pemegang Hak Cipta', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(670, 667, 'KI.01.03.03', 4, 'Keputusan Pembatalan Hak Cipta atas Putusan Pengadilan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(671, 667, 'KI.01.03.04', 4, 'Tanggapan atas Permohonan Keterangan Tertulis Hak Cipta', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(672, 667, 'KI.01.03.05', 4, 'Ahli perkara Pidana Hak Cipta', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(673, 667, 'KI.01.03.06', 4, 'Saksi ahli Hak Cipta di Pengadilan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(674, 667, 'KI.01.03.07', 4, 'Kuasa Khusus Pengadilan atas perkara Hak Cipta', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(675, 651, 'KI.01.04', 3, 'Lembaga Manajemen Kolektif', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(676, 675, 'KI.01.04.01', 4, 'Rekomendasi Ijin Operasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(677, 675, 'KI.01.04.02', 4, 'Pemberitahuan Verifikasi Ijin Operasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(678, 675, 'KI.01.04.03', 4, 'Pemberitahuan Hasil Verifikasi Operasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(679, 675, 'KI.01.04.04', 4, 'Evaluasi LMK', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(680, 650, 'KI.02', 2, 'Desain Industri', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(681, 680, 'KI.02.01', 3, 'Proses Penyelesaian Permohonan Pendaftaran Desain Industri', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(682, 681, 'KI.02.01.01', 4, 'Pemberitahuan Kekurangan Kelengkapan Persyaratan Formalitas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(683, 681, 'KI.02.01.02', 4, 'Perpanjangan Waktu Pemenuhan Kelengkapan Persyaratan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(684, 681, 'KI.02.01.03', 4, 'Pemberitahuan Kekurangan Biaya Permohonan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(685, 681, 'KI.02.01.04', 4, 'Pemberitahuan Perubahan Data Permohonan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(686, 681, 'KI.02.01.05', 4, 'Pemberitahuan Perubahan Data Konsultan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(687, 681, 'KI.02.01.06', 4, 'Penarikan Kembali Permohonan Atas Permintaan Pemohon', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(688, 681, 'KI.02.01.07', 4, 'Keputusan Dianggap Ditarik Kembali (Formalitas)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(689, 681, 'KI.02.01.08', 4, 'Penundaan Pengumuman', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(690, 681, 'KI.02.01.09', 4, 'Keberatan atas Pengumuman', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(691, 681, 'KI.02.01.10', 4, 'Pemberitahuan Kekurangan Kelengkapan Persyaratan Pemeriksaan Substansi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(692, 681, 'KI.02.01.11', 4, 'Keputusan Dianggap Ditarik Kembali (Substantif)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(693, 681, 'KI.02.01.12', 4, 'Keputusan Tolak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(694, 680, 'KI.02.02', 3, 'Bukti Prioritas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(695, 680, 'KI.02.03', 3, 'Pasca Pendaftaran Desain Industri', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(696, 695, 'KI.02.03.01', 4, 'Pemberitahuan Kekurangan Kelengkapan Permohonan Pasca Pendaftaran Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(697, 695, 'KI.02.03.02', 4, 'Perubahan Nama dan/atau Alamat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(698, 695, 'KI.02.03.03', 4, 'Koreksi Sertifikat Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(699, 695, 'KI.02.03.04', 4, 'Pencatatan Pengalihan Hak Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(700, 695, 'KI.02.03.05', 4, 'Pencatatan Perjanjian Lisensi Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(701, 695, 'KI.02.03.06', 4, 'Petikan Resmi Sertifikat Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(702, 695, 'KI.02.03.07', 4, 'Salinan Sertifikat Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(703, 695, 'KI.02.03.08', 4, 'Pembatalan Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(704, 695, 'KI.02.03.09', 4, 'Penghapusan Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(705, 680, 'KI.02.04', 3, 'Pelayanan Hukum/Pendapat Hukum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(706, 705, 'KI.02.04.01', 4, 'Pertimbangan/Pendapat Hukum Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(707, 705, 'KI.02.04.02', 4, 'Keputusan Pembatalan Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(708, 705, 'KI.02.04.03', 4, 'Tanggapan atas Permohonan Keterangan Tertulis Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(709, 705, 'KI.02.04.04', 4, 'Ahli perkara Pidana Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(710, 705, 'KI.02.04.05', 4, 'Saksi ahli Desain Industri di Pengadilan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(711, 705, 'KI.02.04.06', 4, 'Kuasa Khusus Pengadilan atas perkara Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(712, 680, 'KI.02.05', 3, 'Komisi Banding Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(713, 680, 'KI.02.06', 3, 'Pendaftaran Desain Industri Internasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(714, 680, 'KI.02.07', 3, 'Proses Penyelesaian Permohonan Pencatatan Desain Industri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(715, 650, 'KI.03', 2, 'Desain Tata Letak Sirkuit Terpadu (DTLST)', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(716, 715, 'KI.03.01', 3, 'Proses Penyelesaian Permohonan Pendaftaran', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(717, 716, 'KI.03.01.01', 4, 'Pemeriksaan Administrasi/Formalitas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(718, 716, 'KI.03.01.02', 4, 'Perbaikan Data Permohonan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(719, 716, 'KI.03.01.03', 4, 'Publikasi/Pengumuman/Berita Resmi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(720, 716, 'KI.03.01.04', 4, 'Penarikan (Atas Permintaan Sendiri atau Kekurangan Formalitas Tidak Terpenuhi)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(721, 716, 'KI.03.01.05', 4, 'Pemberitahuan Penolakan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(722, 716, 'KI.03.01.06', 4, 'Ralat/Perbaikan Permohonan dan Sertifikat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(723, 716, 'KI.03.01.07', 4, 'Pengalihan Hak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(724, 716, 'KI.03.01.08', 4, 'Perubahan Nama dan Alamat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(725, 716, 'KI.03.01.09', 4, 'Penghapusan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(726, 716, 'KI.03.01.10', 4, 'Pembatalan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(727, 715, 'KI.03.02', 3, 'Sertifikat/Kutipan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(728, 727, 'KI.03.02.01', 4, 'Pemberitahuan Koreksi sertifikat DTLST', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(729, 727, 'KI.03.02.02', 4, 'Pemberitahuan Kekurangan Persyaratan Koreksi Sertifikat DTLST', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(730, 727, 'KI.03.02.03', 4, 'Petikan Daftar Umum DTLST', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(731, 727, 'KI.03.02.04', 4, 'Pemberitahuan Kekurangan Persyaratan Petikan Daftar Umum DTLST', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(732, 715, 'KI.03.03', 3, 'Bukti Prioritas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(733, 715, 'KI.03.04', 3, 'Keterangan Status Permohonan Pendaftaran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(734, 715, 'KI.03.05', 3, 'Permohonan Petikan Resmi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(735, 715, 'KI.03.06', 3, 'Lisensi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(736, 735, 'KI.03.06.01', 4, 'Pemberitahuan Pencatatan Lisensi DTLST', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(737, 735, 'KI.03.06.02', 4, 'Kekurangan Persyaratan Pencatatan Lisensi DTLST', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(738, 735, 'KI.03.06.03', 4, 'Pemberitahuan Pencatatan Lisensi Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(739, 735, 'KI.03.06.04', 4, 'Kekurangan Persyaratan Pencatatan Lisensi Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(740, 715, 'KI.03.07', 3, 'Pelanggaran/Penegakan Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(741, 715, 'KI.03.08', 3, 'Pendapat Hukum/Saksi Ahli', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(742, 650, 'KI.04', 2, 'Rahasia Dagang', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(743, 742, 'KI.04.01', 3, 'Pencatatan Lisensi Rahasia Dagang', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(744, 743, 'KI.04.01.01', 4, 'Pemberitahuan Pencatatan Lisensi Rahasia Dagang', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(745, 743, 'KI.04.01.02', 4, 'Kekurangan Persyaratan Pencatatan Lisensi Rahasia Dagang', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(746, 742, 'KI.04.02', 3, 'Pengalihan Hak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(747, 742, 'KI.04.03', 3, 'Pendapat Hukum/Saksi Ahli', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(748, 650, 'KI.05', 2, 'Paten', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(749, 748, 'KI.05.01', 3, 'Proses Penyelesaian Permohonan Pendaftaran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(750, 748, 'KI.05.02', 3, 'Sertifikat', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(751, 750, 'KI.05.02.01', 4, 'Pemberitahuan Koreksi sertifikat Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(752, 750, 'KI.05.02.02', 4, 'Pemberitahuan Kekurangan Persyaratan Koreksi Sertifikat Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(753, 750, 'KI.05.02.03', 4, 'Pemberitahuan Pengambilan Sertifikat/Jasa Cetak Sertifikat Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(754, 748, 'KI.05.03', 3, 'Bukti Prioritas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(755, 748, 'KI.05.04', 3, 'Pemeliharaan Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(756, 748, 'KI.05.05', 3, 'Penelusuran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(757, 748, 'KI.05.06', 3, 'Keterangan Status Permohonan Pendaftaran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(758, 748, 'KI.05.07', 3, 'Petikan Daftar Umum Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(759, 748, 'KI.05.08', 3, 'Lisensi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(760, 759, 'KI.05.08.01', 4, 'Pemberitahuan Pencatatan Lisensi Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(761, 759, 'KI.05.08.02', 4, 'Kekurangan Persyaratan Pencatatan Lisensi Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(762, 748, 'KI.05.09', 3, 'Pelanggaran/Penegakan Hukum di Bidang Paten', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(763, 748, 'KI.05.10', 3, 'Pendapat Hukum/Saksi Ahli', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(764, 748, 'KI.05.11', 3, 'Komisi Banding', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(765, 748, 'KI.05.12', 3, 'Pengalihan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(766, 748, 'KI.05.13', 3, 'Perbaikan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(767, 650, 'KI.06', 2, 'Merek', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(768, 767, 'KI.06.01', 3, 'Proses Penyelesaian Permohonan Pendaftaran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(769, 767, 'KI.06.02', 3, 'Sertifikat/Kutipan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(770, 767, 'KI.06.03', 3, 'Bukti Prioritas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(771, 767, 'KI.06.04', 3, 'Keterangan Status Permohonan Pendaftaran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(772, 767, 'KI.06.05', 3, 'Permohonan Petikan Resmi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(773, 767, 'KI.06.06', 3, 'Lisensi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(774, 767, 'KI.06.07', 3, 'Penyelesaian/Pertimbangan Hukum atas Merek', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(775, 767, 'KI.06.08', 3, 'Pendapat Hukum/Tanggapan/Analisa Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(776, 767, 'KI.06.09', 3, 'Perpanjangan Merek', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(777, 767, 'KI.06.10', 3, 'Monitoring Merek Terdaftar', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(778, 767, 'KI.06.11', 3, 'Keterangan Tertulis', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(779, 767, 'KI.06.12', 3, 'Komisi Banding Merek', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(780, 767, 'KI.06.13', 3, 'Banding terhadap Penolakan Perpanjangan Merek', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(781, 767, 'KI.06.14', 3, 'Penghapusan Merek Terdaftar atas Prakarsa Menteri', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(782, 767, 'KI.06.15', 3, 'Pengadilan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(783, 767, 'KI.06.16', 3, 'Keputusan Ketua Komisi Banding Merek', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(784, 767, 'KI.06.17', 3, 'Banding Indikasi Geografis', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(785, 767, 'KI.06.18', 3, 'Pendaftaran Merek Internasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(786, 767, 'KI.06.19', 3, 'Statement of Grant Protection', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(787, 767, 'KI.06.20', 3, 'Provisional Refusal', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(788, 767, 'KI.06.21', 3, 'Statement of Grant Protection Following Provisional Refusal', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(789, 767, 'KI.06.22', 3, 'Final Refusal', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(790, 767, 'KI.06.23', 3, 'Notifikasi Transformasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(791, 767, 'KI.06.24', 3, 'Notifikasi Penggantian', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(792, 650, 'KI.07', 2, 'Indikasi Geografis', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(793, 792, 'KI.07.01', 3, 'Proses Penyelesaian Permohonan Pendaftaran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(794, 792, 'KI.07.02', 3, 'Sertifikat/Kutipan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(795, 792, 'KI.07.03', 3, 'Keterangan Status Permohonan Pendaftaran', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(796, 792, 'KI.07.04', 3, 'Permohonan Petikan Resmi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(797, 792, 'KI.07.05', 3, 'Pengawasan Indikasi Geografis Terdaftar', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(798, 792, 'KI.07.06', 3, 'Keterangan Tertulis Indikasi Geografis', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(799, 792, 'KI.07.07', 3, 'Pemakai Indikasi Geografis Terdaftar', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(800, 792, 'KI.07.08', 3, 'Pertimbangan/Rekomendasi Tim Ahli Indikasi Geografis', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(801, 650, 'KI.08', 2, 'Penyidikan dan Penyelesaian Sengketa', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(802, 801, 'KI.08.01', 3, 'Pemberkasan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(803, 801, 'KI.08.02', 3, 'Pemantauan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(804, 801, 'KI.08.03', 3, 'Pencegahan dan Penyelesaian Sengketa Alternatif', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(805, 801, 'KI.08.04', 3, 'Seleksi Administrasi Calon PPNS Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(806, 801, 'KI.08.05', 3, 'Pengangkatan PPNS Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(807, 801, 'KI.08.06', 3, 'Pengangkatan Kembali PPNS Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(808, 801, 'KI.08.07', 3, 'Pelantikan PPNS Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(809, 801, 'KI.08.08', 3, 'Mutasi PPNS Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(810, 801, 'KI.08.09', 3, 'Pemberhentian PPNS Non Teknis Operasional Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(811, 801, 'KI.08.10', 3, 'Pemberhentian PPNS Atas Permintaan Sendiri Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(812, 801, 'KI.08.11', 3, 'Perpanjangan Kartu Tanda Penyidik Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(813, 801, 'KI.08.12', 3, 'Penerbitan Kartu Tanda Penyidik yang Hilang/Rusak PPNS Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(814, 650, 'KI.09', 2, 'Kerjasama dan Pemberdayaan Kekayaan Intelektual', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(815, 814, 'KI.09.01', 3, 'Konsultan Kekayaan Intelektual', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(816, 814, 'KI.09.02', 3, 'Inventarisasi Kekayaan Intelektual Komunal (KIK)', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(817, 814, 'KI.09.03', 3, 'Pendampingan Inventarisasi KIK', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(818, 814, 'KI.09.04', 3, 'Studi Lapangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(819, 814, 'KI.09.05', 3, 'Pertukaran Data', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(820, 814, 'KI.09.06', 3, 'Mediasi KIK', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(821, 814, 'KI.09.07', 3, 'Keberatan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(822, 814, 'KI.09.08', 3, 'Mengubah Data KIK', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(823, 814, 'KI.09.09', 3, 'Menghapus Data KIK', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(824, 814, 'KI.09.10', 3, 'Pendokumentasian/Pengarsipan KIK', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(825, NULL, 'HA', 1, 'Hak Asasi Manusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(826, 825, 'HA.01', 2, 'Pelayanan Komunikasi Masyarakat', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(827, 826, 'HA.01.01', 3, 'Telaahan/Analisis Dugaan Pelanggaran HAM', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(828, 826, 'HA.01.02', 3, 'Klarifikasi/Koordinasi/Konsultasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(829, 826, 'HA.01.03', 3, 'Informasi/Pemberitahuan/Ucapan Terima Kasih', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(830, 826, 'HA.01.04', 3, 'Rekomendasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(831, 826, 'HA.01.05', 3, 'HAM Aktual/Penanganan Pemulihan Korban Dugaan Pelanggaran Hak Asasi Manusia Yang Berat Secara Nonyudisial', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(832, 826, 'HA.01.06', 3, 'Pemantauan, Evaluasi dan Pelaporan Yankomas', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(833, 825, 'HA.02', 2, 'Kerja Sama Hak Asasi Manusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(834, 833, 'HA.02.01', 3, 'Kerja Sama Dalam Negeri Dan Rencana Aksi Nasional Hak Asasi Manusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(835, 834, 'HA.02.01.01', 4, 'Kerja sama HAM Antar Instansi Pemerintah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(836, 834, 'HA.02.01.02', 4, 'Kerja sama HAM dengan Mitra Pemerintah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(837, 834, 'HA.02.01.03', 4, 'Kerja sama HAM dengan Lembaga Swadaya Masyarakat/LSM dan Korporasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(838, 834, 'HA.02.01.04', 4, 'Kerja Sama HAM dengan Lembaga Pendidikan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(839, 833, 'HA.02.02', 3, 'Kerja Sama Luar Negeri', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(840, 839, 'HA.02.02.01', 4, 'Kerja sama HAM Bilateral', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(841, 839, 'HA.02.02.02', 4, 'Kerja sama HAM Regional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(842, 839, 'HA.02.02.03', 4, 'Kerja sama HAM Organisasi Internasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(843, 839, 'HA.02.02.04', 4, 'Kerja sama HAM Badan-Badan Khusus Perserikatan Bangsa-Bangsa', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(844, 833, 'HA.02.03', 3, 'Pemantauan, Evaluasi, dan Pelaporan di bidang Kerja Sama Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(845, 825, 'HA.03', 2, 'Diseminasi dan Penguatan HAM', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(846, 845, 'HA.03.01', 3, 'Perencanaan Teknis dan Pengembangan Tenaga Diseminasi dan Penguatan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(847, 845, 'HA.03.02', 3, 'Diseminasi dan Penguatan HAM bagi Aparatur', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(848, 845, 'HA.03.03', 3, 'Diseminasi dan Penguatan HAM bagi Masyarakat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(849, 845, 'HA.03.04', 3, 'Pemantauan, Evaluasi, dan Pelaporan di Bidang Diseminasi dan Penguatan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(850, 825, 'HA.04', 2, 'Instrumen HAM', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(851, 850, 'HA.04.01', 3, 'Analisis Peraturan Perundang-undangan Berperspektif Hak Asasi Manusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(852, 851, 'HA.04.01.01', 4, 'Analisis/Telaahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(853, 851, 'HA.04.01.02', 4, 'Rekomendasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(854, 850, 'HA.04.02', 3, 'Penyiapan dan Evaluasi Instrumen Hak Asasi Manusia/Indikator Pembangunan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(855, 850, 'HA.04.03', 3, 'Pemantauan dan Pelaporan Implementasi Instrumen Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(856, 825, 'HA.05', 2, 'Fasilitasi dan Informasi Hak Asasi Manusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(857, 856, 'HA.05.01', 3, 'Fasilitasi dan Informasi HAM Ekosob', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(858, 856, 'HA.05.02', 3, 'Fasilitasi dan Informasi HAM Sipol', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(859, 856, 'HA.05.03', 3, 'Pemantauan, evaluasi, dan pelaporan di bidang fasilitasi hak asasi manusia, informasi hak asasi manusia, serta profil Pembangunan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(860, NULL, 'HN', 1, 'Pembinaan Hukum Nasional', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(861, 860, 'HN.01', 2, 'Analisis dan Evaluasi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(862, 861, 'HN.01.01', 3, 'Dokumen Analisis dan Evaluasi Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(863, 861, 'HN.01.02', 3, 'Dokumen Pembangunan Hukum Nasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(864, 861, 'HN.01.03', 3, 'Pedoman Analisis dan Evaluasi Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(865, 861, 'HN.01.04', 3, 'Pemantauan Tindak Lanjut Rekomendasi Hasil Analisis dan Evaluasi Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(866, 861, 'HN.01.05', 3, 'Jurnal Analisis dan Evaluasi Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(867, 861, 'HN.01.06', 3, 'Penyusunan Pedoman Audit Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(868, 860, 'HN.02', 2, 'Perencanaan Hukum Nasional', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(869, 868, 'HN.02.01', 3, 'Program Legislasi Nasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(870, 868, 'HN.02.02', 3, 'Program Legislasi Daerah', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(871, 868, 'HN.02.03', 3, 'Naskah Akademik Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(872, 868, 'HN.02.04', 3, 'Penyelarasan Naskah Akademik', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(873, 860, 'HN.03', 2, 'Dokumentasi dan Jaringan Informasi Hukum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(874, 873, 'HN.03.01', 3, 'Inventarisasi Peraturan Perundang-undangan dan Bahan Hukum Lainnya', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(875, 873, 'HN.03.02', 3, 'Pengolahan Peraturan Perundang-undangan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(876, 873, 'HN.03.03', 3, 'Pengolahan Peraturan Perundang-undangan dan Bahan Hukum Lainnya Bentuk Offline dan Online', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(877, 873, 'HN.03.04', 3, 'Sosialisasi/Penyebarluasan Peraturan Perundang-undangan dan Bahan Hukum Lainnya', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(878, 873, 'HN.03.05', 3, 'Evaluasi dan Pemantauan Pengelola Jaringan Dokumentasi dan Informasi Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(879, 873, 'HN.03.06', 3, 'Publikasi Hasil Kegiatan Badan Pembinaan Hukum Nasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(880, 873, 'HN.03.07', 3, 'Bimbingan Teknis Pusat Dokumentasi dan Jaringan Informasi Hukum Nasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(881, 873, 'HN.03.08', 3, 'Pertemuan Nasional Pengelola Jaringan Dokumentasi dan Informasi Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(882, 860, 'HN.04', 2, 'Penyuluhan dan Bantuan Hukum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(883, 882, 'HN.04.01', 3, 'Penyusunan Kebijakan Teknis Pembentukan Tenaga Fungsional Penyuluh Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(884, 882, 'HN.04.02', 3, 'Penyuluhan Hukum Melalui Media Elektronik dan Cetak', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(885, 882, 'HN.04.03', 3, 'Konsultasi dan Bantuan Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(886, 882, 'HN.04.04', 3, 'Pengelolaan dan Pengembangan Keluarga Sadar Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(887, 882, 'HN.04.05', 3, 'Forum Koordinasi Pelaksanaan Penyuluhan Hukum Seluruh Indonesia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(888, NULL, 'SM', 1, 'Sumber Daya Manusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(889, 888, 'SM.01', 2, 'Diklat Kepemimpinan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(890, 889, 'SM.01.01', 3, 'Perencanaan Program Diklat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(891, 889, 'SM.01.02', 3, 'Kurikulum, Metode Standar/Mutu dan Pedoman Diklat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(892, 889, 'SM.01.03', 3, 'Penyelenggaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(893, 889, 'SM.01.04', 3, 'Evaluasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(894, 888, 'SM.02', 2, 'Diklat Teknis', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(895, 894, 'SM.02.01', 3, 'Perencanaan Program Diklat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(896, 894, 'SM.02.02', 3, 'Kurikulum, Metode Standar/Mutu dan Pedoman Diklat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(897, 894, 'SM.02.03', 3, 'Penyelenggaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(898, 894, 'SM.02.04', 3, 'Evaluasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(899, 888, 'SM.03', 2, 'Diklat Fungsional dan HAM', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(900, 899, 'SM.03.01', 3, 'Perencanaan Program Diklat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(901, 899, 'SM.03.02', 3, 'Kurikulum, Metode Standar/Mutu dan Pedoman Diklat', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(902, 899, 'SM.03.03', 3, 'Penyelenggaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(903, 899, 'SM.03.04', 3, 'Evaluasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(904, 888, 'SM.04', 2, 'Bimbingan Teknis/Fokus Grup Diskusi (FGD)', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(905, 904, 'SM.04.01', 3, 'Fasilitatif', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(906, 904, 'SM.04.02', 3, 'Substantif', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(907, 888, 'SM.05', 2, 'Pertemuan Ilmiah', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(908, 907, 'SM.05.01', 3, 'Seminar', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(909, 907, 'SM.05.02', 3, 'Lokakarya', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(910, 907, 'SM.05.03', 3, 'Diskusi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(911, 907, 'SM.05.04', 3, 'Simposium', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(912, 907, 'SM.05.05', 3, 'Temu Karya', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(913, 907, 'SM.05.06', 3, 'Bedah Buku', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(914, 888, 'SM.06', 2, 'Penilaian Kompetensi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(915, 914, 'SM.06.01', 3, 'Penyusunan Program', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(916, 914, 'SM.06.02', 3, 'Standarisasi Kompetensi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(917, 914, 'SM.06.03', 3, 'Penilaian Kompetensi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(918, 914, 'SM.06.04', 3, 'Evaluasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(919, 888, 'SM.07', 2, 'Kerjasama Pengembangan SDM', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(920, 919, 'SM.07.01', 3, 'Internasional', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(921, 919, 'SM.07.02', 3, 'Institusi/Lembaga', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(922, 919, 'SM.07.03', 3, 'Universitas/Perguruan Tinggi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(923, 888, 'SM.08', 2, 'Data dan Informasi Pengembangan SDM', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(924, 923, 'SM.08.01', 3, 'Pengelolaan Data', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(925, 923, 'SM.08.02', 3, 'Pengelolaan Jaringan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(926, 888, 'SM.09', 2, 'Akademi/Politeknik Ilmu Pemasyarakatan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(927, 926, 'SM.09.01', 3, 'Perencanaan Program Perkuliahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(928, 926, 'SM.09.02', 3, 'Kurikulum, Metode Standar/Mutu dan Pedoman Perkuliahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(929, 926, 'SM.09.03', 3, 'Penyelenggaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(930, 926, 'SM.09.04', 3, 'Evaluasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(931, 888, 'SM.10', 2, 'Akademi/Politeknik Imigrasi', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(932, 931, 'SM.10.01', 3, 'Perencanaan Program Perkuliahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(933, 931, 'SM.10.02', 3, 'Kurikulum, Metode Standar/Mutu dan Pedoman Perkuliahan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(934, 931, 'SM.10.03', 3, 'Penyelenggaraan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(935, 931, 'SM.10.04', 3, 'Evaluasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(936, NULL, 'LT', 1, 'Penelitian dan Pengembangan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(937, 936, 'LT.01', 2, 'Penelitian dan Pengembangan Hukum', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(938, 937, 'LT.01.01', 3, 'Kelompok Substansi Penelitian dan Pengembangan Pembentukan Regulasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(939, 937, 'LT.01.02', 3, 'Kelompok Substansi Penelitian Dan Pengembangan Penegakan Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(940, 937, 'LT.01.03', 3, 'Kelompok Substansi Penelitian dan Pengembangan Pelayanan Hukum', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(941, 936, 'LT.02', 2, 'Penelitian dan Pengembangan HAM', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(942, 941, 'LT.02.01', 3, 'Kelompok Substansi Penelitian dan Pengembangan Sipil, Politik, dan Pembentukan Regulasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(943, 941, 'LT.02.02', 3, 'Kelompok Substansi Penelitian dan Pengembangan Ekonomi, Sosial, Budaya, dan Pembentukan Regulasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(944, 941, 'LT.02.03', 3, 'Kelompok Substansi Penelitian dan Pengembangan Resolusi Konflik dan Pembentukan Regulasi', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(945, 936, 'LT.03', 2, 'Pusat Penelitian dan Pengembangan Kebijakan', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(946, 945, 'LT.03.01', 3, 'Kelompok Substansi Penelitian dan Pengembangan Administrasi Fasilitatif', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(947, 945, 'LT.03.02', 3, 'Kelompok Substansi Penelitian dan Pengembangan Sumber Daya Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(948, 945, 'LT.03.03', 3, 'Kelompok Substansi Penelitian dan Pengembangan Pengawasan', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(949, 936, 'LT.04', 2, 'Pusat Pengembangan Data dan Informasi Penelitian Hukum dan Hak Asasi Manusia', 'substantif', 0, 1, '2026-04-20 07:20:39'),
(950, 949, 'LT.04.01', 3, 'Kelompok Substansi Analisis Data dan Informasi Penelitian Hukum dan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(951, 949, 'LT.04.02', 3, 'Kelompok Substansi Pengembangan Teknologi dan Sistem Informasi Penelitian Hukum dan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39'),
(952, 949, 'LT.04.03', 3, 'Kelompok Substansi Pengelolaan Publikasi Ilmiah Penelitian Hukum dan Hak Asasi Manusia', 'substantif', 1, 1, '2026-04-20 07:20:39');

-- --------------------------------------------------------

--
-- Table structure for table `letter_numbers`
--

CREATE TABLE `letter_numbers` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `classification_id` bigint UNSIGNED NOT NULL,
  `number` int UNSIGNED NOT NULL,
  `formatted_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_date` date NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sifat_surat` enum('sangat_segera','segera','biasa','rahasia') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'biasa',
  `status` enum('active','voided') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `voided_at` timestamp NULL DEFAULT NULL,
  `voided_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_04_152050_create_personal_access_tokens_table', 1),
(5, '2026_04_05_000001_add_columns_to_users_table', 1),
(6, '2026_04_05_000002_create_letter_classifications_table', 1),
(7, '2026_04_05_000003_create_daily_sequences_table', 1),
(8, '2026_04_05_000004_create_letter_numbers_table', 1),
(9, '2026_04_05_000005_create_gap_requests_table', 1),
(10, '2026_04_05_000006_create_audit_logs_table', 1),
(11, '2026_04_06_122700_add_formatted_number_to_letter_numbers_table', 1),
(12, '2026_04_13_000001_add_sifat_surat_to_letter_numbers_table', 1),
(13, '2026_04_13_000002_create_global_sequence_table', 1),
(14, '2026_04_13_000003_drop_daily_sequences_table', 1),
(15, '2026_04_13_000004_add_profile_photo_to_users_table', 1),
(16, '2026_04_13_000005_add_nip_to_users_table', 1),
(17, '2026_04_14_000001_add_last_issued_date_to_global_sequence_table', 1),
(18, '2026_04_14_000002_create_daily_gaps_table', 1),
(19, '2026_04_14_000003_modify_daily_gaps_allow_multi_block_per_day', 1);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'api-token', '8f4fba5548d624b80c8655fdde23b029231d591e7414b33d9006e69fa1e7bf6f', '[\"*\"]', '2026-04-16 04:47:51', NULL, '2026-04-16 03:58:56', '2026-04-16 04:47:51'),
(4, 'App\\Models\\User', 1, 'api-token', '9d09ba9924638c0c05dcef6b122b0c18555da1344c1caa9dccce94ec1c4a16e6', '[\"*\"]', '2026-04-16 04:55:42', NULL, '2026-04-16 04:55:40', '2026-04-16 04:55:42'),
(5, 'App\\Models\\User', 1, 'api-token', '688c584078edfa4a8a6421ec56efab58780f272ae781c48a122a1c341199b2dd', '[\"*\"]', '2026-04-16 08:58:50', NULL, '2026-04-16 04:56:32', '2026-04-16 08:58:50'),
(8, 'App\\Models\\User', 1, 'api-token', 'a7f3d70e2b30b2166106ac1877e9110d942792cd22b8425c30d64f0473a3e3cd', '[\"*\"]', '2026-04-21 04:31:17', NULL, '2026-04-19 04:07:59', '2026-04-21 04:31:17'),
(9, 'App\\Models\\User', 1, 'api-token', 'd330b44cb1b02aefd211259e6c30e1a67a09a92d99080a1d8231f8e6c33a5cce', '[\"*\"]', '2026-04-18 09:35:04', NULL, '2026-04-18 09:33:40', '2026-04-18 09:35:04'),
(11, 'App\\Models\\User', 1, 'api-token', 'c0fded39272cb573ee29daf401b4c91fd0f68e708b60868267abca6b17d17af7', '[\"*\"]', '2026-04-18 10:47:17', NULL, '2026-04-18 10:27:24', '2026-04-18 10:47:17'),
(12, 'App\\Models\\User', 1, 'api-token', '9c6c23c603fa7f45fc89f08423a78e352363ce10e8f39d2ae013571e9629d36e', '[\"*\"]', '2026-04-19 09:21:19', NULL, '2026-04-19 08:46:40', '2026-04-19 09:21:19');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `division` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `profile_photo` longtext COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `nip`, `division`, `role`, `is_active`, `profile_photo`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'ADM-0001', 'TU', 'admin', 1, NULL, 'admin@surat.local', NULL, '$2y$12$VRs4mqMeGfcJw9NsRlST/.wP.A6i9FturYLCZW.Ldi.YB8BrFxeN.', NULL, '2026-04-16 03:56:08', '2026-04-16 03:56:08'),
(2, 'Gilang Aksay Bilbili', '123456789', 'IT', 'user', 1, NULL, 'gilangaksay@gmail.com', NULL, '$2y$12$g.ou/lJ6J.YwVarvvvKm9eMVZof5Ie3cqfKMem5MFBfKOm5TCcd.G', NULL, '2026-04-16 04:24:52', '2026-04-16 09:00:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `audit_logs_action_index` (`action`),
  ADD KEY `audit_logs_table_name_record_id_index` (`table_name`,`record_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `daily_gaps`
--
ALTER TABLE `daily_gaps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `daily_gaps_date_gap_start_unique` (`date`,`gap_start`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `gap_requests`
--
ALTER TABLE `gap_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gap_requests_reviewed_by_foreign` (`reviewed_by`),
  ADD KEY `gap_requests_requested_by_status_index` (`requested_by`,`status`),
  ADD KEY `gap_requests_classification_id_gap_date_index` (`classification_id`,`gap_date`);

--
-- Indexes for table `global_sequence`
--
ALTER TABLE `global_sequence`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `letter_classifications`
--
ALTER TABLE `letter_classifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `letter_classifications_code_unique` (`code`),
  ADD KEY `letter_classifications_parent_id_index` (`parent_id`),
  ADD KEY `letter_classifications_type_is_active_index` (`type`,`is_active`),
  ADD KEY `letter_classifications_is_leaf_index` (`is_leaf`);

--
-- Indexes for table `letter_numbers`
--
ALTER TABLE `letter_numbers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `letter_numbers_classification_id_number_issued_date_unique` (`classification_id`,`number`,`issued_date`),
  ADD KEY `letter_numbers_voided_by_foreign` (`voided_by`),
  ADD KEY `letter_numbers_user_id_issued_date_index` (`user_id`,`issued_date`),
  ADD KEY `letter_numbers_classification_id_issued_date_index` (`classification_id`,`issued_date`),
  ADD KEY `letter_numbers_status_index` (`status`),
  ADD KEY `letter_numbers_formatted_number_index` (`formatted_number`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_nip_unique` (`nip`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=303;

--
-- AUTO_INCREMENT for table `daily_gaps`
--
ALTER TABLE `daily_gaps`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gap_requests`
--
ALTER TABLE `gap_requests`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `global_sequence`
--
ALTER TABLE `global_sequence`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `letter_classifications`
--
ALTER TABLE `letter_classifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=953;

--
-- AUTO_INCREMENT for table `letter_numbers`
--
ALTER TABLE `letter_numbers`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `gap_requests`
--
ALTER TABLE `gap_requests`
  ADD CONSTRAINT `gap_requests_classification_id_foreign` FOREIGN KEY (`classification_id`) REFERENCES `letter_classifications` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `gap_requests_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `gap_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `letter_classifications`
--
ALTER TABLE `letter_classifications`
  ADD CONSTRAINT `letter_classifications_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `letter_classifications` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `letter_numbers`
--
ALTER TABLE `letter_numbers`
  ADD CONSTRAINT `letter_numbers_classification_id_foreign` FOREIGN KEY (`classification_id`) REFERENCES `letter_classifications` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `letter_numbers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `letter_numbers_voided_by_foreign` FOREIGN KEY (`voided_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
