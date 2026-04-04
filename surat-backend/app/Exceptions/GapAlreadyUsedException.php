<?php

namespace App\Exceptions;

/**
 * Dilempar jika nomor dalam zona gap sudah pernah dipakai.
 * Controller harus menangkap exception ini dan mengembalikan response 422 Unprocessable Entity.
 */
class GapAlreadyUsedException extends \RuntimeException {}
