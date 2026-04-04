<?php

namespace App\Exceptions;

/**
 * Dilempar jika terjadi lock timeout atau deadlock saat acquireNumber().
 * Controller harus menangkap exception ini dan mengembalikan response 409 Conflict.
 */
class NumberingLockException extends \RuntimeException {}
