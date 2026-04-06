<?php

return [
    // Ubah nilai ini untuk mengubah perilaku gap secara global.
    // Perubahan hanya berlaku untuk sequence baru (hari berikutnya).
    'default_gap_size' => 10,
    'default_start'    => 1000,

    // Prefix dan separator untuk formatted_number.
    // Format hasil: {prefix}{separator}{classificationCode}{separator}{number}
    // Contoh: W7-TU.01.02-1001
    'prefix'    => 'W7',
    'separator' => '-',
];
