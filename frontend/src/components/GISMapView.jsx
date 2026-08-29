import React, { useEffect, useRef, useState } from 'react';
import { Layers, MapPin, AlertTriangle, ShieldCheck, Navigation, Eye, EyeOff, Radio } from 'lucide-react';
import { MAP_LAYERS, NER_STATES } from '../data/ner_constants';

export default function GISMapView({ 
  districtData, 
  highways, 
  hotspots, 
  reports, 
  activeRoute, 
  onSelectDistrict, 
  onTriggerAlert 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({});
  
  const [activeBaseLayer, setActiveBaseLayer] = useState('TOPO');
  const [visibleLayers, setVisibleLayers] = useState({
    districts: true,
    highways: true,
    hotspots: true,
    reports: true,
    safeRoute: true
  });
  const [selectedStateIndex, setSelectedStateIndex] = useState(0);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    const map = L.map(mapContainerRef.current, {
      center: [25.8, 92.5],
      zoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Tile Layer
    const tileLayer = L.tileLayer(MAP_LAYERS[activeBaseLayer], {
      maxZoom: 18,
      subdomains: 'abc'
    }).addTo(map);

    // Layer groups
    const districtLayerGroup = L.layerGroup().addTo(map);
    const highwayLayerGroup = L.layerGroup().addTo(map);
    const hotspotLayerGroup = L.layerGroup().addTo(map);
    const reportLayerGroup = L.layerGroup().addTo(map);
    const routingLayerGroup = L.layerGroup().addTo(map);

    layersGroupRef.current = {
      tileLayer,
      districts: districtLayerGroup,
      highways: highwayLayerGroup,
      hotspots: hotspotLayerGroup,
      reports: reportLayerGroup,
      safeRoute: routingLayerGroup
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Layer
  useEffect(() => {
    const L = window.L;
    const map = mapInstanceRef.current;
    if (!map || !L || !layersGroupRef.current.tileLayer) return;

    map.removeLayer(layersGroupRef.current.tileLayer);
    const newTile = L.tileLayer(MAP_LAYERS[activeBaseLayer], {
      maxZoom: 18,
      subdomains: 'abc'
    }).addTo(map);
    layersGroupRef.current.tileLayer = newTile;
  }, [activeBaseLayer]);

  // Update District Risk Markers
  useEffect(() => {
    const L = window.L;
    const group = layersGroupRef.current.districts;
    if (!group || !L) return;
    group.clearLayers();

    if (!visibleLayers.districts || !districtData) return;

    districtData.forEach(d => {
      const radius = d.overall_risk_probability >= 70 ? 28000 : d.overall_risk_probability >= 45 ? 20000 : 14000;
      
      const circle = L.circle([d.lat, d.lng], {
        color: d.color_code,
        fillColor: d.color_code,
        fillOpacity: 0.35,
        weight: 2,
        radius: radius
      });

      const popupHtml = `
        <div style="font-family: Inter, sans-serif; min-width: 220px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="color: #f8fafc; font-size: 14px;">${d.name}</strong>
            <span style="background: ${d.color_code}; color: #000; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
              ${d.risk_level}
            </span>
          </div>
          <div style="color: #94a3b8; line-height: 1.5;">
            <div><strong>State:</strong> ${d.state}</div>
            <div><strong>Risk Probability:</strong> <span style="color: ${d.color_code}; font-weight: bold;">${d.overall_risk_probability}%</span></div>
            <div><strong>24h Rain Saturation:</strong> ${d.breakdown?.ari_mm || 65} mm</div>
            <div><strong>Terrain Slope:</strong> ${d.base_slope || 35}°</div>
            <div><strong>Action Window:</strong> ${d.estimated_failure_window || 'Immediate'}</div>
          </div>
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 11px; color: #cbd5e1;">
            ${d.recommended_action}
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      circle.on('click', () => {
        if (onSelectDistrict) onSelectDistrict(d);
      });

      group.addLayer(circle);

      // Add center pulse dot
      const marker = L.circleMarker([d.lat, d.lng], {
        radius: 6,
        color: '#ffffff',
        fillColor: d.color_code,
        fillOpacity: 1.0,
        weight: 2
      });
      group.addLayer(marker);
    });
  }, [districtData, visibleLayers.districts]);

  // Update Highways
  useEffect(() => {
    const L = window.L;
    const group = layersGroupRef.current.highways;
    if (!group || !L) return;
    group.clearLayers();

    if (!visibleLayers.highways || !highways) return;

    highways.forEach(hw => {
      const polyline = L.polyline(hw.coordinates, {
        color: hw.color || '#f97316',
        weight: 5,
        opacity: 0.85,
        dashArray: hw.default_status === 'RESTRICTED' ? '6, 6' : null
      });

      polyline.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 13px;">
          <strong style="color: #38bdf8;">${hw.name}</strong><br/>
          <span style="color: #94a3b8;">Stretch: ${hw.vulnerable_stretch}</span><br/>
          <span style="color: #ef4444; font-weight: 600;">Risk: ${hw.risk_reason}</span>
        </div>
      `);
      group.addLayer(polyline);
    });
  }, [highways, visibleLayers.highways]);

  // Update Historical Hotspots
  useEffect(() => {
    const L = window.L;
    const group = layersGroupRef.current.hotspots;
    if (!group || !L) return;
    group.clearLayers();

    if (!visibleLayers.hotspots || !hotspots) return;

    hotspots.forEach(h => {
      const icon = L.divIcon({
        className: 'custom-hotspot-icon',
        html: `<div style="background: #ef4444; color: white; border: 2px solid white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);">⚠️</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([h.lat, h.lng], { icon });
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 13px;">
          <strong style="color: #ef4444;">${h.name}</strong> (${h.state})<br/>
          <span style="color: #94a3b8;">Type: ${h.type}</span><br/>
          <span style="color: #fbbf24;">Trigger Rainfall: >${h.trigger_rain_mm} mm</span><br/>
          <span style="color: #cbd5e1;">Last Slide: ${h.last_incident}</span>
        </div>
      `);
      group.addLayer(marker);
    });
  }, [hotspots, visibleLayers.hotspots]);

  // Update Crowdsourced Reports
  useEffect(() => {
    const L = window.L;
    const group = layersGroupRef.current.reports;
    if (!group || !L) return;
    group.clearLayers();

    if (!visibleLayers.reports || !reports) return;

    reports.forEach(r => {
      const icon = L.divIcon({
        className: 'custom-report-icon',
        html: `<div style="background: #3b82f6; color: white; border: 2px solid #93c5fd; border-radius: 6px; padding: 2px 5px; font-size: 11px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.6);">📸 AI Verified</div>`,
        iconSize: [80, 20],
        iconAnchor: [40, 10]
      });

      const marker = L.marker([r.lat, r.lng], { icon });
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 13px; max-width: 240px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <strong style="color: #38bdf8;">${r.location_name}</strong>
            <span style="color: #22c55e; font-weight: bold;">${r.confidence_pct}% Conf</span>
          </div>
          <div style="color: #f87171; font-weight: 600; font-size: 12px; margin-bottom: 4px;">${r.hazard_type} (${r.severity})</div>
          <p style="color: #cbd5e1; font-size: 11px; margin: 0 0 6px 0;">${r.description}</p>
          <div style="color: #94a3b8; font-size: 10px;">Reported by: ${r.reporter_role}</div>
        </div>
      `);
      group.addLayer(marker);
    });
  }, [reports, visibleLayers.reports]);

  // Update Safe Evacuation Route if active
  useEffect(() => {
    const L = window.L;
    const group = layersGroupRef.current.safeRoute;
    if (!group || !L) return;
    group.clearLayers();

    if (!visibleLayers.safeRoute || !activeRoute) return;

    // Blocked route in Red dashed
    if (activeRoute.primary_route?.coordinates) {
      const blocked = L.polyline(activeRoute.primary_route.coordinates, {
        color: '#ef4444',
        weight: 6,
        dashArray: '8, 8',
        opacity: 0.9
      });
      blocked.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px;">
          <strong style="color: #ef4444;">🚫 PRIMARY ROUTE BLOCKED</strong><br/>
          <span>${activeRoute.primary_route.name}</span><br/>
          <span>Chokepoint: ${activeRoute.primary_route.chokepoint}</span>
        </div>
      `);
      group.addLayer(blocked);
    }

    // Safe Bypass in Green Glow
    if (activeRoute.safe_bypass_route?.coordinates) {
      const safe = L.polyline(activeRoute.safe_bypass_route.coordinates, {
        color: '#10b981',
        weight: 6,
        opacity: 0.95
      });
      safe.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px;">
          <strong style="color: #10b981;">✅ APPROVED SAFE BYPASS</strong><br/>
          <span>${activeRoute.safe_bypass_route.name}</span><br/>
          <span>Distance: ${activeRoute.safe_bypass_route.distance_km} km | ETA: ${activeRoute.safe_bypass_route.normal_eta_hours}h</span>
        </div>
      `);
      group.addLayer(safe);
    }
  }, [activeRoute, visibleLayers.safeRoute]);

  // Handle Quick State Focus Zoom
  const handleStateSelect = (e) => {
    const idx = parseInt(e.target.value);
    setSelectedStateIndex(idx);
    const target = NER_STATES[idx];
    if (mapInstanceRef.current && target) {
      mapInstanceRef.current.flyTo(target.center, target.zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        
        {/* State Selector */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-xl flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-400" />
          <select 
            value={selectedStateIndex}
            onChange={handleStateSelect}
            className="bg-transparent text-xs text-slate-100 font-semibold focus:outline-none cursor-pointer"
          >
            {NER_STATES.map((st, i) => (
              <option key={st.name} value={i} className="bg-slate-900 text-slate-200">
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Map Style Switcher & Layer Toggles */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1.5 shadow-xl">
          <div className="flex bg-slate-950 rounded-md p-0.5 border border-slate-800 text-[11px] font-medium">
            {['TOPO', 'STREET', 'SATELLITE'].map(mode => (
              <button
                key={mode}
                onClick={() => setActiveBaseLayer(mode)}
                className={`px-2.5 py-1 rounded transition-all ${
                  activeBaseLayer === mode 
                    ? 'bg-sky-600 text-white font-bold shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Layer toggles */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <button
              onClick={() => setVisibleLayers(p => ({ ...p, districts: !p.districts }))}
              className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1 transition-all ${
                visibleLayers.districts 
                  ? 'bg-red-950/60 border-red-500/50 text-red-300' 
                  : 'bg-slate-800/40 border-slate-700 text-slate-500'
              }`}
            >
              <Radio className="w-3 h-3" /> Risk Zones
            </button>

            <button
              onClick={() => setVisibleLayers(p => ({ ...p, highways: !p.highways }))}
              className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1 transition-all ${
                visibleLayers.highways 
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' 
                  : 'bg-slate-800/40 border-slate-700 text-slate-500'
              }`}
            >
              <Navigation className="w-3 h-3" /> Highways
            </button>

            <button
              onClick={() => setVisibleLayers(p => ({ ...p, hotspots: !p.hotspots }))}
              className={`px-2 py-1 rounded border text-[11px] flex items-center gap-1 transition-all ${
                visibleLayers.hotspots 
                  ? 'bg-red-950/60 border-red-500/50 text-red-300' 
                  : 'bg-slate-800/40 border-slate-700 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Hotspots
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs shadow-2xl flex items-center gap-3">
        <span className="text-slate-400 font-semibold text-[11px]">HAZARD MATRIX:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="text-slate-200 text-[11px]">Severe (&gt;75%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-200 text-[11px]">High (50-74%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-slate-200 text-[11px]">Moderate (28-49%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-200 text-[11px]">Low (&lt;28%)</span>
        </div>
      </div>
    </div>
  );
}
