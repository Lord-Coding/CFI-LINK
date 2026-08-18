<?php

namespace App\Http\Controllers;

use App\Models\PaymentCode;
use App\Models\PaymentRecord;
use App\Models\User;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    public function __construct(
        private AuditService $audit,
        private NotificationService $notifService,
    ) {}

    // GET /api/payments  (admin : tous | étudiant : ses paiements)
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isStudent()) {
            $records = PaymentRecord::where('student_id', $user->id)
                ->orderByDesc('created_at')->get();
        } else {
            $records = PaymentRecord::with('student:id,nom_complet,filiere,annee')
                ->orderByDesc('created_at')->get();
        }

        return response()->json($records);
    }

    // POST /api/payments  (étudiant soumet un paiement)
    public function store(Request $request)
    {
        $data = $request->validate([
            'month'     => 'required|string',
            'amount'    => 'required|integer|min:1',
            'method'    => ['required', Rule::in(['cash', 'mobile_money', 'card'])],
            'reference' => 'nullable|string|max:100',
        ]);

        $record = PaymentRecord::create([
            ...$data,
            'student_id' => $request->user()->id,
            'status'     => 'pending',
        ]);

        $this->audit->log($request->user(), 'Soumission paiement', "Paiement {$data['month']} soumis", 'payment');

        return response()->json($record, 201);
    }

    // PATCH /api/payments/{record}/confirm
    public function confirm(Request $request, PaymentRecord $paymentRecord)
    {
        $paymentRecord->update(['status' => 'confirmed', 'confirmed_at' => now()]);

        // Débloquer le compte si besoin
        $paymentRecord->student->update(['payment_blocked' => false]);

        $this->notifService->send(
            userId: $paymentRecord->student_id,
            type:    'paiement',
            title:   'Paiement confirmé',
            message: "Votre paiement de scolarité pour {$paymentRecord->month} a été validé. Votre accès est rétabli.",
        );

        $this->audit->log($request->user(), 'Confirmation paiement', "Paiement #{$paymentRecord->id} confirmé", 'payment');

        return response()->json($paymentRecord);
    }

    // PATCH /api/payments/{record}/reject
    public function reject(Request $request, PaymentRecord $paymentRecord)
    {
        $paymentRecord->update(['status' => 'rejected']);

        $this->notifService->send(
            userId: $paymentRecord->student_id,
            type:    'paiement',
            title:   'Paiement rejeté',
            message: "Votre paiement pour {$paymentRecord->month} a été rejeté. Contactez l'administration.",
        );

        $this->audit->log($request->user(), 'Rejet paiement', "Paiement #{$paymentRecord->id} rejeté", 'payment');

        return response()->json($paymentRecord);
    }

    // ── Payment Codes ─────────────────────────────────────────────

    // GET /api/payment-codes
    public function indexCodes(Request $request)
    {
        return response()->json(
            PaymentCode::with('student:id,nom_complet')
                ->orderByDesc('created_at')->get()
        );
    }

    // POST /api/payment-codes
    public function generateCode(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:users,id',
            'month'      => 'required|string',
        ]);

        $code = PaymentCode::create([
            'code'       => PaymentCode::generateCode(),
            'student_id' => $data['student_id'],
            'month'      => $data['month'],
        ]);

        $student = User::find($data['student_id']);
        $this->audit->log($request->user(), 'Génération code paiement', "Code {$code->code} pour {$student->nom_complet}", 'payment');

        return response()->json($code, 201);
    }

    // POST /api/payment-codes/validate
    public function validateCode(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();
        $code = PaymentCode::where('code', $data['code'])
            ->where('student_id', $user->id)
            ->where('used', false)
            ->first();

        if (! $code) {
            return response()->json(['message' => 'Code de paiement invalide.'], 422);
        }

        $code->update(['used' => true]);
        $user->update(['payment_blocked' => false]);

        $this->notifService->send(
            userId: $user->id,
            type:    'paiement',
            title:   'Paiement confirmé',
            message: "Votre paiement de scolarité pour {$code->month} a été validé. Votre accès est rétabli.",
        );

        $this->audit->log($user, 'Validation code paiement', "Code {$code->code} utilisé", 'payment');

        return response()->json(['message' => 'Paiement validé. Accès rétabli.']);
    }
}
