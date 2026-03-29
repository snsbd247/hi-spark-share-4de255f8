<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;

class LanguageController extends Controller
{
    /**
     * Update admin user language preference.
     */
    public function update(Request $request)
    {
        $request->validate([
            'language' => 'required|string|in:en,bn',
        ]);

        $admin = $request->get('admin_user');

        if ($admin) {
            Profile::where('id', $admin->id)->update([
                'language' => $request->language,
            ]);
        }

        return response()->json([
            'success'  => true,
            'language' => $request->language,
        ]);
    }

    /**
     * Get current language preference.
     */
    public function show(Request $request)
    {
        $admin = $request->get('admin_user');
        $profile = $admin ? Profile::find($admin->id) : null;

        return response()->json([
            'language' => $profile->language ?? 'en',
        ]);
    }
}
