import React, { useState, useEffect } from 'react';
import { Navigation, AlertTriangle, ShieldCheck, Truck, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function SafeRoutingPanel({ onSelectCorridorRoute }) {
  const [corridors, setCorridors] = useState([]);
  const [selectedCorridorKey, setSelectedCorridorKey] = useState('sikkim_corridor');
  const [corridorDetails, setCorridorDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispatches, setDispatches] = useState([]);
  const [dispatchMsg, setDispatchMsg] = useState('');

  // Fetch all corridors
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getAllCorridors();
        if (res?.corridors) setCorridors(res.corridors);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Fetch details when corridor changes
  useEffect(() => {
    const loadRoute = async () => {
      setLoading(true);
      try {
        const data = await apiService.getCorridorRoute(selectedCorridorKey);
        setCorridorDetails(data);
        if (onSelectCorridorRoute) onSelectCorridorRoute(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadRoute();
  }, [selectedCorridorKey]);

  // Load existing dispatches
  useEffect(() => {
    const loadDispatches = async () => {
      try {
        const res = await apiService.getDispatches();
        if (res?.dispatches) setDispatches(res.dispatches);
      } catch (e) {
        console.error(e);
      }
    };
    loadDispatches();
  }, []);

  const handleDispatchSDRF = async () => {
    if (!corridorDetails) return;
    const payload = {
      team_name: "SDRF Mountain Logistics Unit 3",
      target_location: corridorDetails.destination.name,
      priority: "CRITICAL",
      assigned_route: corridorDetails.safe_bypass_route.name
    };
    try {
      await apiService.createDispatch(payload);
      setDispatchMsg(`Dispatch confirmed! Convoy routed through: ${corridorDetails.safe_bypass_route.name}`);
      const res = await apiService.getDispatches();
      if (res?.dispatches) setDispatches(res.dispatches);
      setTimeout(() => setDispatchMsg(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-4 text-slate-100 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Safe Evacuation & Route Optimizer</h3>
            <p className="text-[11px] text-slate-400">Automated bypass pathfinding avoiding mountain chokepoints</p>
          </div>
        </div>

        {/* Corridor selector */}
        <select
          value={selectedCorridorKey}
          onChange={(e) => setSelectedCorridorKey(e.target.value)}
          className="bg-slate-950 border border-slate-700 text-xs text-slate-200 font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="sikkim_corridor">NH-10 (Siliguri ↔ Gangtok Lifeline)</option>
          <option value="nagaland_corridor">NH-29 (Dimapur ↔ Kohima Corridor)</option>
          <option value="meghalaya_barak_corridor">NH-6 (Shillong ↔ Silchar Tunnel Route)</option>
        </select>
      </div>

      {corridorDetails && (
        <div className="space-y-3">
          
          {/* Origin / Destination Banner */}
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="font-bold text-sky-400">{corridorDetails.origin.name}</span>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-emerald-400">{corridorDetails.destination.name}</span>
          </div>

          {/* Primary Route (High Risk / Blocked) */}
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Primary Arterial Corridor
              </span>
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 font-bold px-2 py-0.5 rounded text-[10px]">
                BLOCKED / DANGER
              </span>
            </div>
            <div className="text-slate-200 font-semibold">{corridorDetails.primary_route.name}</div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Chokepoint: <strong className="text-red-400">{corridorDetails.primary_route.chokepoint}</strong></span>
              <span>Risk: <strong className="text-red-400">{corridorDetails.primary_route.risk_score}%</strong></span>
            </div>
          </div>

          {/* Recommended Safe Bypass */}
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> AI-Recommended Safe Bypass
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold px-2 py-0.5 rounded text-[10px]">
                CLEAR & ACTIVE
              </span>
            </div>
            <div className="text-slate-100 font-semibold">{corridorDetails.safe_bypass_route.name}</div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">Total Distance</span>
                <strong className="text-slate-100">{corridorDetails.safe_bypass_route.distance_km} km</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block">Estimated ETA</span>
                <strong className="text-emerald-300">{corridorDetails.safe_bypass_route.normal_eta_hours} Hours</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {corridorDetails.safe_bypass_route.advisory}
            </p>
          </div>

          {dispatchMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{dispatchMsg}</span>
            </div>
          )}

          {/* Action Dispatch Button */}
          <button
            onClick={handleDispatchSDRF}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 active:scale-95"
          >
            <Truck className="w-4 h-4" /> Dispatch Emergency Convoy via Safe Bypass
          </button>

        </div>
      )}

      {/* Active Convoys List */}
      {dispatches.length > 0 && (
        <div className="border-t border-slate-800 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Active SDRF / Supply Deployments ({dispatches.length})
          </span>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {dispatches.slice(0, 3).map((d, i) => (
              <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                <div>
                  <strong className="text-slate-200 block">{d.team_name}</strong>
                  <span className="text-slate-400 truncate max-w-[200px] block">To: {d.target_location}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
