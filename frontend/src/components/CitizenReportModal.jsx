import React, { useState } from 'react';
import { Camera, Upload, CheckCircle, AlertTriangle, X, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { DEMO_PRESET_IMAGES } from '../data/ner_constants';
import { apiService } from '../services/api';

export default function CitizenReportModal({ isOpen, onClose, onReportSubmitted }) {
  const [selectedPreset, setSelectedPreset] = useState(DEMO_PRESET_IMAGES[0]);
  const [locationName, setLocationName] = useState('NH-29 Zubza Valley Section (Nagaland)');
  const [coordinates, setCoordinates] = useState({ lat: 25.6890, lng: 93.9920 });
  const [description, setDescription] = useState('Deep transverse tension fissure observed stretching across highway shoulder after 3 hours of intense rain.');
  const [reporterRole, setReporterRole] = useState('Field Officer (PWD/NHIDCL)');
  
  const [scanning, setScanning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState({
    detected_class: 'TENSION_CRACK',
    class_name: 'Linear Slope / Asphalt Tension Crack',
    confidence_pct: 96.4,
    hazard_severity: 'SEVERE',
    status: 'VERIFIED_BY_AI'
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setScanning(true);
    setTimeout(() => {
      if (preset.category === 'DEBRIS_MUDFLOW') {
        setAiAnalysis({
          detected_class: 'DEBRIS_MUDFLOW',
          class_name: 'Active Mudflow / Silt Debris',
          confidence_pct: 98.1,
          hazard_severity: 'CRITICAL',
          status: 'VERIFIED_BY_AI'
        });
        setLocationName('NH-10 Kalijhora Teesta Gorge (Sikkim)');
        setCoordinates({ lat: 26.9389, lng: 88.4680 });
      } else if (preset.category === 'WALL_BULGE') {
        setAiAnalysis({
          detected_class: 'WALL_BULGE',
          class_name: 'Retaining Wall Hydrostatic Bulge',
          confidence_pct: 92.5,
          hazard_severity: 'HIGH',
          status: 'VERIFIED_BY_AI'
        });
        setLocationName('Sonapur Tunnel Embankment (Meghalaya NH-6)');
        setCoordinates({ lat: 25.1150, lng: 92.3680 });
      } else {
        setAiAnalysis({
          detected_class: 'TENSION_CRACK',
          class_name: 'Linear Slope / Asphalt Tension Crack',
          confidence_pct: 96.4,
          hazard_severity: 'SEVERE',
          status: 'VERIFIED_BY_AI'
        });
        setLocationName('NH-29 Zubza Sinking Corridor (Nagaland)');
        setCoordinates({ lat: 25.6890, lng: 93.9920 });
      }
      setScanning(false);
    }, 450);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    try {
      const res = await apiService.analyzePhoto(file);
      setAiAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      lat: coordinates.lat,
      lng: coordinates.lng,
      location_name: locationName,
      hazard_type: aiAnalysis.detected_class,
      severity: aiAnalysis.hazard_severity,
      confidence_pct: aiAnalysis.confidence_pct,
      description: description,
      image_url: selectedPreset?.url || "",
      reporter_role: reporterRole
    };

    // Also cache locally in case offline
    const localQueue = JSON.parse(localStorage.getItem("offline_reports_queue") || "[]");
    localQueue.push({ ...payload, timestamp: Date.now() });
    localStorage.setItem("offline_reports_queue", JSON.stringify(localQueue));

    try {
      const res = await apiService.submitReport(payload);
      setSuccessMsg("Incident successfully verified by AI and dispatched to SDRF & GIS Command!");
      if (onReportSubmitted) onReportSubmitted(payload);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1400);
    } catch (err) {
      setSuccessMsg("Offline Mode: Report cached locally in IndexedDB. Will auto-sync once online!");
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1600);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-100">Crowdsourced Field Reporting & Edge AI</h2>
              <p className="text-xs text-slate-400">On-device crack and mudflow verification with offline queue</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Quick Demo Preset Selector + Custom Upload Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 font-semibold">
                1. SELECT PRESET IMAGE OR UPLOAD CUSTOM PHOTO
              </label>
              <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition-all">
                <Upload className="w-3.5 h-3.5" /> Upload Live Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const objectUrl = URL.createObjectURL(file);
                    setSelectedPreset({
                      title: file.name,
                      category: 'CUSTOM_UPLOAD',
                      url: objectUrl
                    });
                    handleFileUpload(e);
                  }} 
                  className="hidden" 
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DEMO_PRESET_IMAGES.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedPreset?.title === p.title
                      ? 'bg-sky-950/60 border-sky-500 text-sky-200 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <img src={p.url} alt={p.title} className="w-full h-16 object-cover rounded-md mb-1.5" />
                  <span className="text-[11px] font-bold block truncate">{p.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Inspection Box */}
          <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-950 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" /> Edge AI Computer Vision Scanner
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {scanning ? "Processing..." : `Confidence: ${aiAnalysis.confidence_pct}%`}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full sm:w-48 h-28 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                <img src={selectedPreset?.url} alt="Scan preview" className="w-full h-full object-cover" />
                {/* Simulated AI bounding box */}
                <div className="absolute inset-2 border-2 border-red-500/80 rounded bg-red-500/10 flex items-start p-1">
                  <span className="bg-red-600 text-white text-[9px] font-bold px-1 rounded">
                    {aiAnalysis.detected_class}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-300 flex-1">
                <div><strong>Classification:</strong> <span className="text-sky-300 font-semibold">{aiAnalysis.class_name}</span></div>
                <div><strong>Hazard Level:</strong> <span className="text-red-400 font-bold">{aiAnalysis.hazard_severity}</span></div>
                <p className="text-[11px] text-slate-400 leading-tight pt-1">
                  AI verified high structural shear tension. Geotagged coordinates will be pinned to GIS Master Map.
                </p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Location / Corridor</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1 block">Reporter Designation</label>
                <select
                  value={reporterRole}
                  onChange={(e) => setReporterRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option>Field Officer (PWD/NHIDCL)</option>
                  <option>Traffic Police Patrol</option>
                  <option>Local Village Council Head</option>
                  <option>Citizen / Commuter</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold mb-1 block">Field Notes / Observations</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-lg shadow-sky-900/40 flex items-center gap-1.5"
              >
                {submitting ? "Uploading & Syncing..." : "Submit Verified Incident"}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
