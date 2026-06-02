<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\ReferralLink;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

class ProspectEnrollmentService
{
    /**
     * @return array<string, mixed>
     */
    public function validatedArray(Request $request): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:32'],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'program_type' => ['required', 'in:superieur,centre,college'],
            'formation_slug' => ['nullable', 'string', 'max:255'],
            'last_diploma' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'identity_number' => ['nullable', 'string', 'max:100'],
            'identity_document' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp,application/pdf', 'max:12288'],
            'diploma_document' => ['required', 'file', 'mimetypes:image/jpeg,image/png,image/webp,application/pdf', 'max:12288'],
        ]);
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    public function createLead(array $validated): Lead
    {
        $referralLink = ReferralLink::query()
            ->where('code', strtoupper((string) $validated['code']))
            ->where('is_active', true)
            ->first();

        if (! $referralLink) {
            throw ValidationException::withMessages([
                'code' => ['Code de parrainage invalide.'],
            ]);
        }

        /** @var UploadedFile $idFile */
        $idFile = $validated['identity_document'];
        /** @var UploadedFile $dipFile */
        $dipFile = $validated['diploma_document'];

        $lead = Lead::query()->create(
            Arr::only($validated, [
                'full_name',
                'email',
                'phone',
                'program_type',
                'formation_slug',
                'last_diploma',
                'address',
                'guardian_name',
                'identity_number',
            ]) + [
                'referral_link_id' => $referralLink->id,
                'status' => 'pending',
            ]
        );

        $base = 'leads/'.$lead->id;
        $lead->identity_document_path = $idFile->store($base, 'public');
        $lead->diploma_document_path = $dipFile->store($base, 'public');
        $lead->save();

        return $lead->fresh();
    }
}
