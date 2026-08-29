import React, { useState, useEffect } from 'react';
import { Activity, CloudRain, Mountain, Droplets, AlertOctagon, RefreshCw, Cpu } from 'lucide-react';
import { apiService } from '../services/api';

export default function RiskAnalytics({ 
  selectedDistrict, 
  activeScenario, 
  onScenarioChange, 
  onTriggerAlert 
}) {
  const [customParams, setCustomParams] = useState({
    slope_deg: selectedDistrict?.base_slope || 38.5,
    rain_24h_mm: 85,
    rain_72h_antecedent_mm: 180,
    soil_moisture_pct: 82,
    fault_dist_km: selectedDistrict?.fault_distance_km || 4.5
  });

  const [simResult, setSimResult] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);

  // Update params when a district is clicked on the map
  useEffect(() => {
    if (selectedDistrict) {
      setCustomParams(p => ({
        ...p,
        slope_deg: selectedDistrict.base_slope || 35.0,
        fault_dist_km: selectedDistrict.fault_distance_km || 5.0,
        rain_24h_mm: selectedDistrict.breakdown?.ari_mm ? Math.round(selectedDistrict.breakdown.ari_mm * 0.6) : 75,
        rain_72h_antecedent_mm: selectedDistrict.breakdown?.ari_mm ? Math.round(selectedDistrict.breakdown.ari_mm * 1.3) : 150,
        soil_moisture_pct: selectedDistrict.breakdown?.soil_moisture_pct || 78
      }));
    }
  }, [selectedDistrict]);

  // Run dynamic risk recalculation
  useEffect(() => {
    let isMounted = true;
    const runCalculation = async () => {
      setLoadingSim(true);
      try {
        const payload = {
          lat: selectedDistrict?.lat || 27.3389,
          lng: selectedDistrict?.lng || 88.6065,
          slope_deg: parseFloat(customParams.slope_deg),
          lithology_factor: selectedDistrict?.lithology_factor || 0.85,
          fault_dist_km: parseFloat(customParams.fault_dist_km),
          rain_24h_mm: parseFloat(customParams.rain_24h_mm),
          rain_72h_antecedent_mm: parseFloat(customParams.rain_72h_antecedent_mm),
          soil_moisture_pct: parseFloat(customParams.soil_moisture_pct),
          crack_multiplier: 1.0
        };
        const res = await apiService.evaluateCoordinate(payload);
        if (isMounted) setSimResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingSim(false);
      }
    };

    const timer = setTimeout(runCalculation, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [customParams, selectedDistrict]);

  const riskScore = simResult ? simResult.overall_risk_probability : (selectedDistrict?.overall_risk_probability || 84.5);
  const riskLevel = simResult ? simResult.risk_level : (selectedDistrict?.risk_level || 'SEVERE');
  const riskColor = simResult ? simResult.color_code : (selectedDistrict?.color_code || '#ef4444');

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-4 text-slate-100 shadow-xl">
      
      {/* Header & Scenario Selection */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">AI Risk Prediction Engine</h3>
            <p className="text-[11px] text-slate-400">
              Focus: <span className="text-sky-400 font-semibold">{selectedDistrict ? selectedDistrict.name : "East Sikkim (Gangtok)"}</span>
            </p>
          </div>
        </div>

        {/* Weather Scenario selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          <CloudRain className="w-3.5 h-3.5 text-sky-400" />
          <select
            value={activeScenario}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="cloudburst_monsoon" className="bg-slate-900">2024 Monsoon Cloudburst (High Slide)</option>
            <option value="cyclone_remal" className="bg-slate-900">Cyclone Remal Inundation (Extreme)</option>
            <option value="live" className="bg-slate-900">Live IMD / Open-Meteo Telemetry</option>
            <option value="moderate_showers" className="bg-slate-900">Moderate Seasonal Showers</option>
            <option value="clear_dry" className="bg-slate-900">Dry Season Baseline</option>
          </select>
        </div>
      </div>

      {/* Real-Time Risk Gauge Card */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Predicted Landslide Probability</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-extrabold" style={{ color: riskColor }}>
              {riskScore}%
            </span>
            <span 
              className="text-xs font-bold px-2 py-0.5 rounded uppercase"
              style={{ backgroundColor: `${riskColor}25`, color: riskColor, border: `1px solid ${riskColor}50` }}
            >
              {riskLevel} HAZARD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Estimated Failure Window: <span className="text-slate-200 font-semibold">{simResult?.estimated_failure_window || "2 to 6 hours"}</span>
          </p>
        </div>

        <button
          onClick={() => onTriggerAlert(selectedDistrict?.name || "East Sikkim", riskLevel)}
          className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-red-900/40 active:scale-95"
        >
          <AlertOctagon className="w-4 h-4 animate-pulse" /> Broadcast Siren
        </button>
      </div>

      {/* Interactive Simulation Sliders */}
      <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
          <span>Simulation Parameters (Physics & Weather)</span>
          {loadingSim && <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />}
        </div>

        {/* 24h Rainfall */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1"><CloudRain className="w-3 h-3 text-sky-400" /> 24-Hour Rainfall Intensity</span>
            <span className="font-mono text-sky-300 font-bold">{customParams.rain_24h_mm} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            value={customParams.rain_24h_mm}
            onChange={(e) => setCustomParams(p => ({ ...p, rain_24h_mm: e.target.value }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* 72h Antecedent Rain */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-indigo-400" /> 72-Hour Antecedent Accumulation (ARI)</span>
            <span className="font-mono text-indigo-300 font-bold">{customParams.rain_72h_antecedent_mm} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max="400"
            value={customParams.rain_72h_antecedent_mm}
            onChange={(e) => setCustomParams(p => ({ ...p, rain_72h_antecedent_mm: e.target.value }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
        </div>

        {/* Terrain Slope */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Mountain className="w-3 h-3 text-amber-400" /> Slope Gradient (DEM CartoSat)</span>
            <span className="font-mono text-amber-300 font-bold">{customParams.slope_deg}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="60"
            value={customParams.slope_deg}
            onChange={(e) => setCustomParams(p => ({ ...p, slope_deg: e.target.value }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Soil Moisture */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-400" /> Soil Pore Saturation Index</span>
            <span className="font-mono text-emerald-300 font-bold">{customParams.soil_moisture_pct}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={customParams.soil_moisture_pct}
            onChange={(e) => setCustomParams(p => ({ ...p, soil_moisture_pct: e.target.value }))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>
      </div>

      {/* Recommended Action Advisory */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold block mb-1">DISASTER MANAGEMENT ADVISORY:</span>
        <p className="text-slate-300 text-[12px] leading-relaxed">
          {simResult?.recommended_action || "Standby emergency road clearing dozers and issue highway advisory."}
        </p>
      </div>

    </div>
  );
}
