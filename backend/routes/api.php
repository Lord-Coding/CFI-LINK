<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CalendarEventController;
use App\Http\Controllers\CodesController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DocumentRequestController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ══════════════════════════════════════════════════════════════════
//  Routes publiques (sans authentification)
// ══════════════════════════════════════════════════════════════════

Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ══════════════════════════════════════════════════════════════════
//  Routes protégées (Sanctum)
// ══════════════════════════════════════════════════════════════════

Route::middleware('auth:sanctum')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────
    Route::get( '/me',     [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ── Utilisateurs ──────────────────────────────────────────────
    Route::get   ('/users',                        [UserController::class, 'index']);
    Route::get   ('/users/{user}',                 [UserController::class, 'show']);
    Route::post  ('/users',                        [UserController::class, 'store']);
    Route::put   ('/users/{user}',                 [UserController::class, 'update']);
    Route::delete('/users/{user}',                 [UserController::class, 'destroy']);
    Route::patch ('/users/{user}/toggle-active',   [UserController::class, 'toggleActive']);
    Route::patch ('/users/{user}/toggle-payment-block', [UserController::class, 'togglePaymentBlock']);

    // ── Codes d'accès ─────────────────────────────────────────────
    Route::get   ('/codes/concours',          [CodesController::class, 'indexConcours']);
    Route::post  ('/codes/concours',          [CodesController::class, 'storeConcours']);
    Route::delete('/codes/concours/{concoursCode}',    [CodesController::class, 'destroyConcours']);
    Route::get   ('/codes/validation',        [CodesController::class, 'indexValidation']);
    Route::post  ('/codes/validation',        [CodesController::class, 'storeValidation']);
    Route::delete('/codes/validation/{validationCode}',[CodesController::class, 'destroyValidation']);

    // ── Paiements ─────────────────────────────────────────────────
    Route::get  ('/payments',                      [PaymentController::class, 'index']);
    Route::post ('/payments',                      [PaymentController::class, 'store']);
    Route::patch('/payments/{paymentRecord}/confirm', [PaymentController::class, 'confirm']);
    Route::patch('/payments/{paymentRecord}/reject',  [PaymentController::class, 'reject']);
    Route::get  ('/payment-codes',                 [PaymentController::class, 'indexCodes']);
    Route::post ('/payment-codes',                 [PaymentController::class, 'generateCode']);
    Route::post ('/payment-codes/validate',        [PaymentController::class, 'validateCode']);

    // ── Notes ─────────────────────────────────────────────────────
    Route::get   ('/grades',                        [GradeController::class, 'index']);
    Route::put   ('/grades/upsert',                 [GradeController::class, 'upsert']);
    Route::post  ('/grades/publish/{courseId}',     [GradeController::class, 'publish']);
    Route::post  ('/grades/unpublish/{courseId}',   [GradeController::class, 'unpublish']);
    Route::delete('/grades/{grade}',                [GradeController::class, 'destroy']);

    // ── Présences ─────────────────────────────────────────────────
    Route::get ('/attendance',                  [AttendanceController::class, 'index']);
    Route::post('/attendance/upsert',           [AttendanceController::class, 'upsert']);
    Route::get ('/attendance/stats/{studentId}',[AttendanceController::class, 'stats']);

    // ── Cours & Leçons ────────────────────────────────────────────
    Route::get   ('/courses',                    [CourseController::class, 'index']);
    Route::get   ('/courses/{course}',           [CourseController::class, 'show']);
    Route::post  ('/courses',                    [CourseController::class, 'store']);
    Route::put   ('/courses/{course}',           [CourseController::class, 'update']);
    Route::delete('/courses/{course}',           [CourseController::class, 'destroy']);
    Route::get   ('/courses/{course}/lessons',   [CourseController::class, 'lessons']);
    Route::get   ('/courses/{course}/progress',  [CourseController::class, 'courseProgress']);
    Route::post  ('/lessons/{lesson}/progress',  [CourseController::class, 'markLessonComplete']);

    // ── Semestres ─────────────────────────────────────────────────
    Route::get   ('/semesters',                     [SemesterController::class, 'index']);
    Route::post  ('/semesters',                     [SemesterController::class, 'store']);
    Route::put   ('/semesters/{semester}',          [SemesterController::class, 'update']);
    Route::patch ('/semesters/{semester}/activate', [SemesterController::class, 'setActive']);
    Route::delete('/semesters/{semester}',          [SemesterController::class, 'destroy']);

    // ── Emploi du temps ───────────────────────────────────────────
    Route::get   ('/schedule',                 [ScheduleController::class, 'index']);
    Route::post  ('/schedule',                 [ScheduleController::class, 'store']);
    Route::put   ('/schedule/{scheduleEntry}', [ScheduleController::class, 'update']);
    Route::delete('/schedule/{scheduleEntry}', [ScheduleController::class, 'destroy']);

    // ── Annonces ──────────────────────────────────────────────────
    Route::get   ('/announcements',               [AnnouncementController::class, 'index']);
    Route::post  ('/announcements',               [AnnouncementController::class, 'store']);
    Route::put   ('/announcements/{announcement}',[AnnouncementController::class, 'update']);
    Route::delete('/announcements/{announcement}',[AnnouncementController::class, 'destroy']);

    // ── Notifications ─────────────────────────────────────────────
    Route::get   ('/notifications',                       [NotificationController::class, 'index']);
    Route::patch ('/notifications/{notification}/read',   [NotificationController::class, 'markRead']);
    Route::patch ('/notifications/read-all',              [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{notification}',        [NotificationController::class, 'destroy']);

    // ── Messages ──────────────────────────────────────────────────
    Route::get   ('/messages/inbox',              [MessageController::class, 'inbox']);
    Route::get   ('/messages/sent',               [MessageController::class, 'sent']);
    Route::post  ('/messages',                    [MessageController::class, 'store']);
    Route::patch ('/messages/{message}/read',     [MessageController::class, 'markRead']);
    Route::delete('/messages/{message}',          [MessageController::class, 'destroy']);

    // ── Documents administratifs ──────────────────────────────────
    Route::get  ('/document-requests',                        [DocumentRequestController::class, 'index']);
    Route::post ('/document-requests',                        [DocumentRequestController::class, 'store']);
    Route::patch('/document-requests/{documentRequest}/process',[DocumentRequestController::class, 'process']);

    // ── Bibliothèque ──────────────────────────────────────────────
    Route::get   ('/library',                             [LibraryController::class, 'index']);
    Route::post  ('/library',                             [LibraryController::class, 'store']);
    Route::patch ('/library/{libraryItem}/download',      [LibraryController::class, 'incrementDownload']);
    Route::delete('/library/{libraryItem}',               [LibraryController::class, 'destroy']);

    // ── Calendrier ────────────────────────────────────────────────
    Route::get   ('/events',                  [CalendarEventController::class, 'index']);
    Route::post  ('/events',                  [CalendarEventController::class, 'store']);
    Route::put   ('/events/{calendarEvent}',  [CalendarEventController::class, 'update']);
    Route::delete('/events/{calendarEvent}',  [CalendarEventController::class, 'destroy']);

    // ── Communauté ────────────────────────────────────────────────
    Route::get   ('/community',                           [CommunityController::class, 'index']);
    Route::post  ('/community',                           [CommunityController::class, 'store']);
    Route::patch ('/community/{communityPost}/like',      [CommunityController::class, 'toggleLike']);
    Route::delete('/community/{communityPost}',           [CommunityController::class, 'destroy']);

    // ── Forum ─────────────────────────────────────────────────────
    Route::get   ('/forum',                           [ForumController::class, 'index']);
    Route::post  ('/forum',                           [ForumController::class, 'store']);
    Route::post  ('/forum/{forumPost}/reply',         [ForumController::class, 'reply']);
    Route::patch ('/forum/{forumPost}/pin',           [ForumController::class, 'togglePin']);
    Route::delete('/forum/{forumPost}',               [ForumController::class, 'destroy']);

    // ── Audit Log (admin uniquement) ──────────────────────────────
    Route::get('/audit-logs', [AuditLogController::class, 'index']);
});
