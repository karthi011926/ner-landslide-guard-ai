import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Send, Terminal, ShieldAlert, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

export default function OfflineSyncWidget({ onSMSDecoded }) {
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [smsInput, setSmsInput] = useState('#SLIDE 25.6890 93.9920 4 NH29_CRITICAL_MUDFLOW');
  const [smsResult, setSmsResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load offline cached queue
  useEffect(() => {
    const queue = JSON.parse(localStorage.getItem('offline_reports_queue') || '[]');
    setOfflineQueue(queue);
  }, []);

  // Sync offline queue when online
  const handleSyncQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);

    try {
      for (const item of offlineQueue) {
        await apiService.submitReport(item);
      }
      localStorage.removeItem('offline_reports_queue');
      setOfflineQueue([]);
      alert("All offline cached incidents synced with GIS Central Command!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Decode emergency field SMS
  const handleDecodeSMS = async (e) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    try {
      const res = await apiService.decodeSMS(smsInput);
      setSmsResult(res);
      if (res.success && onSMSDecoded) {
        onSMSDecoded(res.extracted_data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col gap-3 text-slate-100 shadow-xl">
      
      {/* Header with Network Simulation Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isSimulatedOffline ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
            {isSimulatedOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Offline & 2G GSM Fallback Terminal</h3>
            <p className="text-[11px] text-slate-400">Resilient communication for remote mountainous valleys</p>
          </div>
        </div>

        {/* Offline Toggle button for demo */}
        <button
          onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
            isSimulatedOffline
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {isSimulatedOffline ? "Mode: OFFLINE (Simulated)" : "Mode: ONLINE (Connected)"}
        </button>
      </div>

      {/* Offline Storage Status */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-400 font-semibold block">Local IndexedDB / SQLite Queue:</span>
          <span className="text-slate-200 text-[11px]">
            {offlineQueue.length > 0 ? `${offlineQueue.length} incidents waiting to sync` : "All local records synchronized"}
          </span>
        </div>
        {offlineQueue.length > 0 && (
          <button
            onClick={handleSyncQueue}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Now
          </button>
        )}
      </div>

      {/* GSM 2G SMS Decoder Terminal */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-amber-400 flex items-center gap-1.5">
            <Terminal className="w-4 h-4" /> 2G GSM Field SMS Gateway
          </span>
          <span className="text-[10px] text-slate-500 font-mono">No 4G/Data Required</span>
        </div>

        <form onSubmit={handleDecodeSMS} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              placeholder="#SLIDE <LAT> <LNG> <SEV_1_TO_4> <NOTES>"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" /> Decode
            </button>
          </div>
        </form>

        {/* Decoded Result */}
        {smsResult && smsResult.success && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
            <div className="flex items-center justify-between text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Decoded via GSM Telemetry
              </span>
              <span className="bg-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">
                Severity: {smsResult.extracted_data.severity}
              </span>
            </div>
            <div className="text-slate-300 text-[11px]">
              GPS: <strong className="font-mono text-slate-100">{smsResult.extracted_data.lat}, {smsResult.extracted_data.lng}</strong>
            </div>
            <div className="text-slate-400 text-[11px]">
              Notes: {smsResult.extracted_data.notes}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
