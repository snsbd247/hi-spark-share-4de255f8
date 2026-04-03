<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FiberOlt;
use App\Models\FiberPonPort;
use App\Models\FiberCable;
use App\Models\FiberCore;
use App\Models\FiberSplitter;
use App\Models\FiberSplitterOutput;
use App\Models\FiberOnu;
use Illuminate\Http\Request;

class FiberTopologyController extends Controller
{
    /**
     * Full topology tree: OLT → PON → Cable → Core → Splitter → Output → ONU → Customer
     */
    public function tree(Request $request)
    {
        $olts = FiberOlt::with([
            'ponPorts.cables.cores.splitter.outputs.onu.customer',
        ])->orderBy('name')->get();

        return response()->json($olts);
    }

    /**
     * Create OLT and auto-generate PON ports
     */
    public function storeOlt(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string',
            'total_pon_ports' => 'required|integer|min:1|max:64',
        ]);

        $olt = FiberOlt::create($request->only(['name', 'location', 'total_pon_ports', 'status']));

        // Auto-create PON ports
        for ($i = 1; $i <= $request->total_pon_ports; $i++) {
            FiberPonPort::create([
                'olt_id' => $olt->id,
                'port_number' => $i,
                'tenant_id' => $olt->tenant_id,
            ]);
        }

        return response()->json($olt->load('ponPorts'), 201);
    }

    /**
     * Create Fiber Cable with auto-generated cores
     */
    public function storeCable(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'pon_port_id' => 'nullable|uuid',
            'total_cores' => 'required|integer|min:1|max:144',
            'color' => 'nullable|string',
            'length_meters' => 'nullable|numeric',
        ]);

        $cable = FiberCable::create($request->only([
            'name', 'pon_port_id', 'total_cores', 'color', 'length_meters', 'status',
        ]));

        // Auto-create cores
        for ($i = 1; $i <= $request->total_cores; $i++) {
            FiberCore::create([
                'fiber_cable_id' => $cable->id,
                'core_number' => $i,
                'tenant_id' => $cable->tenant_id,
            ]);
        }

        return response()->json($cable->load('cores'), 201);
    }

    /**
     * Create Splitter on a core and auto-generate outputs
     */
    public function storeSplitter(Request $request)
    {
        $request->validate([
            'core_id' => 'required|uuid',
            'ratio' => 'required|in:1:2,1:4,1:8,1:16,1:32',
            'location' => 'nullable|string',
            'label' => 'nullable|string',
        ]);

        // Check core doesn't already have a splitter
        $existing = FiberSplitter::where('core_id', $request->core_id)->first();
        if ($existing) {
            return response()->json(['error' => 'This core already has a splitter assigned.'], 422);
        }

        // Mark core as used
        $core = FiberCore::findOrFail($request->core_id);
        $core->update(['status' => 'used']);

        $splitter = FiberSplitter::create($request->only([
            'core_id', 'ratio', 'location', 'label', 'status',
        ]));

        // Parse ratio and create outputs
        $outputCount = (int) explode(':', $request->ratio)[1];
        for ($i = 1; $i <= $outputCount; $i++) {
            FiberSplitterOutput::create([
                'splitter_id' => $splitter->id,
                'output_number' => $i,
                'tenant_id' => $splitter->tenant_id,
            ]);
        }

        return response()->json($splitter->load('outputs'), 201);
    }

    /**
     * Assign ONU to a splitter output
     */
    public function storeOnu(Request $request)
    {
        $request->validate([
            'splitter_output_id' => 'required|uuid',
            'serial_number' => 'required|string',
            'mac_address' => 'nullable|string',
            'customer_id' => 'nullable|uuid',
        ]);

        // Check output not already used
        $existingOnu = FiberOnu::where('splitter_output_id', $request->splitter_output_id)->first();
        if ($existingOnu) {
            return response()->json(['error' => 'This splitter output already has an ONU assigned.'], 422);
        }

        // Mark output as used
        $output = FiberSplitterOutput::findOrFail($request->splitter_output_id);
        $output->update(['status' => 'used']);

        $onu = FiberOnu::create($request->only([
            'splitter_output_id', 'serial_number', 'mac_address', 'customer_id', 'status', 'signal_strength',
        ]));

        return response()->json($onu->load('customer'), 201);
    }

    /**
     * Search across topology
     */
    public function search(Request $request)
    {
        $q = $request->input('q', '');
        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $results = [];

        // Search OLTs
        $olts = FiberOlt::where('name', 'like', "%{$q}%")->limit(5)->get();
        foreach ($olts as $olt) {
            $results[] = ['type' => 'OLT', 'id' => $olt->id, 'label' => $olt->name];
        }

        // Search Cables
        $cables = FiberCable::where('name', 'like', "%{$q}%")->limit(5)->get();
        foreach ($cables as $cable) {
            $results[] = ['type' => 'Cable', 'id' => $cable->id, 'label' => $cable->name];
        }

        // Search ONUs
        $onus = FiberOnu::where('serial_number', 'like', "%{$q}%")
            ->orWhere('mac_address', 'like', "%{$q}%")
            ->limit(5)->get();
        foreach ($onus as $onu) {
            $results[] = ['type' => 'ONU', 'id' => $onu->id, 'label' => $onu->serial_number];
        }

        return response()->json($results);
    }

    /**
     * Stats summary
     */
    public function stats()
    {
        return response()->json([
            'total_olts' => FiberOlt::count(),
            'total_cables' => FiberCable::count(),
            'total_cores' => FiberCore::count(),
            'free_cores' => FiberCore::where('status', 'free')->count(),
            'used_cores' => FiberCore::where('status', 'used')->count(),
            'total_splitters' => FiberSplitter::count(),
            'total_outputs' => FiberSplitterOutput::count(),
            'free_outputs' => FiberSplitterOutput::where('status', 'free')->count(),
            'used_outputs' => FiberSplitterOutput::where('status', 'used')->count(),
            'total_onus' => FiberOnu::count(),
        ]);
    }
}
