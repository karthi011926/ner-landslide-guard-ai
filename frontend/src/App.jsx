import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Map, 
  Activity, 
  Navigation, 
  Radio, 
  Camera, 
  Wifi, 
  AlertTriangle, 
  Layers, 
  CloudRain,
  ExternalLink,
  ChevronRight,
  Bot,
  MessageSquare
} from 'lucide-react';

import GISMapView from './components/GISMapView';
import RiskAnalytics from './components/RiskAnalytics';
import CitizenReportModal from './components/CitizenReportModal';
import SafeRoutingPanel from './components/SafeRoutingPanel';
import AlertCenter from './components/AlertCenter';
import OfflineSyncWidget from './components/OfflineSyncWidget';
import DisasterChatbot from './components/DisasterChatbot';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('GIS'); // 'GIS', 'ROUTING', 'ALERTS', 'OFFLINE'
  const [scenario, setScenario] = useState('cloudburst_monsoon');
  
  const [districtData, setDistrictData] = useState([]);
  const [highways, setHighways] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [alertBroadcastTarget, setAlertBroadcastTarget] = useState("East Khasi Hills / NH-6");
  const [alertSeverity, setAlertSeverity] = useState("SEVERE");

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dRes = await apiService.getDistrictsRisk(scenario);
        if (dRes?.data) {
          setDistrictData(dRes.data);
          setSelectedDistrict(dRes.data[0]);
        }

        const hwRes = await apiService.getHighways();
        if (hwRes?.highways) setHighways(hwRes.highways);

        const hotRes = await apiService.getHotspots();
        if (hotRes?.hotspots) setHotspots(hotRes.hotspots);

        const repRes = await apiService.getReports();
        if (repRes?.reports) setReports(repRes.reports);

        const routeRes = await apiService.getCorridorRoute('sikkim_corridor');
        if (routeRes) setActiveRoute(routeRes);
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      }
    };
    fetchData();
  }, [scenario]);

  const handleTriggerAlert = (locationName, severity) => {
    setAlertBroadcastTarget(locationName);
    setAlertSeverity(severity || "SEVERE");
    setActiveTab('ALERTS');
  };

  const handleReportSubmitted = (newReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const handleSMSDecoded = (decodedData) => {
    setReports(prev => [{
      lat: decodedData.lat,
      lng: decodedData.lng,
      location_name: `SMS Dispatch (${decodedData.lat.toFixed(3)}, ${decodedData.lng.toFixed(3)})`,
      hazard_type: "GSM_FIELD_SMS",
      severity: decodedData.severity,
      confidence_pct: 94.0,
      description: decodedData.notes,
      reporter_role: "2G SMS Gateway",
      created_at: Date.now() / 1000
    }, ...prev]);
  };

  // Count severe risk districts
  const severeCount = districtData.filter(d => d.overall_risk_probability >= 70).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b1329] text-slate-100 font-sans relative">
      
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-red-500 p-0.5 flex items-center justify-center shadow-lg shadow-sky-900/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">
              NER LANDSLIDE <span className="text-sky-400">GUARD AI</span> – Landslide Risk Monitoring & Early Warning
              </h1>
              <span className="text-[10px] bg-red-500/20 text-red-300 font-mono font-bold px-2 py-0.5 rounded border border-red-500/40">
                EARLY WARNING ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI-based landslide risk monitoring, early warning, and emergency response system for India's North Eastern Region (NER).
            </p>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('GIS')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'GIS' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" /> 3D GIS Command
          </button>

          <button
            onClick={() => setActiveTab('ROUTING')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'ROUTING' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" /> Safe Evacuation Routes
          </button>

          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'ALERTS' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Multilingual Siren Hub
          </button>

          <button
            onClick={() => setActiveTab('OFFLINE')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'OFFLINE' ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" /> 2G GSM & Offline Sync
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          {/* AI Chatbot Trigger button */}
          <button
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${
              isChatbotOpen
                ? 'bg-sky-500 text-slate-950 shadow-sky-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/40'
            }`}
          >
            <Bot className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Ask Disaster AI</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-900/30 active:scale-95 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Field Report (AI Vision)</span>
          </button>
        </div>

      </header>

      {/* Live Alert Ticker Bar */}
      <div className="bg-red-950/80 border-b border-red-900/50 px-4 py-1 flex items-center justify-between text-xs text-red-200 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-bold uppercase text-[11px] text-red-300 shrink-0">HIGH HAZARD ALERT:</span>
          <span className="truncate text-red-100 font-medium">
            {severeCount} Mountain Districts at CRITICAL landslide failure saturation. NH-10 (Kalijhora) & NH-29 (Dzüdza) restricted. Emergency bypass routing operational.
          </span>
        </div>
        <span className="text-[11px] font-mono text-red-300 shrink-0 hidden sm:block">
          IMD Rain Inundation Stream: ACTIVE
        </span>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 gap-3">
        
        {/* Left Side: 2D/3D GIS Command Map */}
        <div className="flex-1 h-full min-h-[350px]">
          <GISMapView
            districtData={districtData}
            highways={highways}
            hotspots={hotspots}
            reports={reports}
            activeRoute={activeRoute}
            onSelectDistrict={(d) => setSelectedDistrict(d)}
            onTriggerAlert={handleTriggerAlert}
          />
        </div>

        {/* Right Side: Tab-Specific Control Panels */}
        <div className="w-full md:w-[460px] h-full overflow-y-auto shrink-0 flex flex-col gap-3">
          
          {activeTab === 'GIS' && (
            <RiskAnalytics
              selectedDistrict={selectedDistrict}
              activeScenario={scenario}
              onScenarioChange={(sc) => setScenario(sc)}
              onTriggerAlert={handleTriggerAlert}
            />
          )}

          {activeTab === 'ROUTING' && (
            <SafeRoutingPanel
              onSelectCorridorRoute={(routeData) => setActiveRoute(routeData)}
            />
          )}

          {activeTab === 'ALERTS' && (
            <AlertCenter
              targetLocation={alertBroadcastTarget}
              severity={alertSeverity}
            />
          )}

          {activeTab === 'OFFLINE' && (
            <OfflineSyncWidget
              onSMSDecoded={handleSMSDecoded}
            />
          )}

        </div>

      </main>

      {/* Floating Bottom-Right Chat Bubble (When Chatbot is Closed) */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-500 hover:from-sky-500 hover:to-indigo-400 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl shadow-sky-500/50 flex items-center gap-2 border border-sky-400/40 hover:scale-105 transition-all animate-bounce"
        >
          <Bot className="w-5 h-5 text-white" />
          <span>Ask Disaster AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>
      )}

      {/* Interactive AI Disaster Chatbot Modal/Widget */}
      <DisasterChatbot
        scenario={scenario}
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Citizen Field Reporting & Edge-AI Modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={handleReportSubmitted}
      />

    </div>
  );
}
