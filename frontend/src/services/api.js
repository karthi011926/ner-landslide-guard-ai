const API_BASE = "https://ner-landslide-guard-ai.onrender.com";

export const apiService = {
  // Fetch district risk heatmap data
  async getDistrictsRisk(scenario = "cloudburst_monsoon") {
    try {
      const res = await fetch(`${API_BASE}/api/districts/risk?scenario=${scenario}`);
      if (!res.ok) throw new Error("Failed to fetch district risk");
      return await res.json();
    } catch (e) {
      console.warn("Using fallback district data:", e);
      return null;
    }
  },

  // Fetch critical highway corridors
  async getHighways() {
    try {
      const res = await fetch(`${API_BASE}/api/highways`);
      if (!res.ok) throw new Error("Failed to fetch highways");
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Fetch historical hotspots
  async getHotspots() {
    try {
      const res = await fetch(`${API_BASE}/api/hotspots`);
      if (!res.ok) throw new Error("Failed to fetch hotspots");
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Custom coordinate calculation
  async evaluateCoordinate(payload) {
    const res = await fetch(`${API_BASE}/api/evaluate/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // AI photo crack detection
  async analyzePhoto(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/reports/analyze-photo`, {
      method: "POST",
      body: formData
    });
    return await res.json();
  },

  // Submit field report
  async submitReport(reportData) {
    const res = await fetch(`${API_BASE}/api/reports/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData)
    });
    return await res.json();
  },

  // Fetch all filed reports
  async getReports() {
    try {
      const res = await fetch(`${API_BASE}/api/reports`);
      return await res.json();
    } catch (e) {
      return { reports: [] };
    }
  },

  // Fetch safe evacuation routes
  async getCorridorRoute(corridorKey = "sikkim_corridor") {
    const res = await fetch(`${API_BASE}/api/routes/corridor?corridor=${corridorKey}`);
    return await res.json();
  },

  async getAllCorridors() {
    const res = await fetch(`${API_BASE}/api/routes/all`);
    return await res.json();
  },

  // Multilingual alert broadcast
  async getMultilingualAlert(location, severity = "SEVERE") {
    const res = await fetch(`${API_BASE}/api/alerts/broadcast?location=${encodeURIComponent(location)}&severity=${severity}`);
    return await res.json();
  },

  // Emergency SMS decoder
  async decodeSMS(smsText) {
    const res = await fetch(`${API_BASE}/api/alerts/decode-sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sms_text: smsText })
    });
    return await res.json();
  },

  // SDRF dispatch
  async createDispatch(payload) {
    const res = await fetch(`${API_BASE}/api/dispatches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async getDispatches() {
    const res = await fetch(`${API_BASE}/api/dispatches`);
    return await res.json();
  },

  // AI Disaster Chatbot
  async askChatbot(question, scenario = "cloudburst_monsoon", apiKey = "") {
    try {
      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, scenario, api_key: apiKey || undefined })
      });
      return await res.json();
    } catch (e) {
      console.warn("Chatbot API offline, using fallback answer:", e);
      return {
        category: "GENERAL_FALLBACK",
        title: "Disaster AI Assistant (Offline)",
        answer: "⚠️ **Offline Mode:** The AI chatbot backend is running locally. You can ask about NH-10/NH-29 road status, crack reporting, or emergency helplines (`1070` / `1077`).",
        suggested_actions: ["Check NH-10 Status", "Emergency Contacts"]
      };
    }
  }
};


