<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\GenieBizController;

Route::get('/', [GenieBizController::class, 'index'])->name('dynamic-qr');
Route::get('/dynamic-qr', [GenieBizController::class, 'index']);

// Genie Business API endpoints
Route::post('/api/genie/fetch-company', [GenieBizController::class, 'fetchCompany'])->name('genie.fetch-company');
Route::post('/api/genie/generate-payload', [GenieBizController::class, 'generatePayload'])->name('genie.generate-payload');

Route::get('/welcome', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
