export const NER_STATES = [
  { name: "All North East (NER)", center: [25.8, 92.5], zoom: 7 },
  { name: "Sikkim (NH-10 Lifeline)", center: [27.3389, 88.6065], zoom: 10 },
  { name: "Nagaland (NH-29 Corridor)", center: [25.7500, 93.9800], zoom: 10 },
  { name: "Meghalaya (NH-6 / Shillong)", center: [25.5788, 91.8933], zoom: 9 },
  { name: "Assam (Dima Hasao Hill Link)", center: [25.1764, 93.0175], zoom: 9 },
  { name: "Mizoram (Aizawl Slope)", center: [23.7271, 92.7176], zoom: 9 },
  { name: "Arunachal Pradesh (Tawang)", center: [27.5861, 91.8594], zoom: 9 },
  { name: "Manipur (Senapati/Imphal)", center: [25.2600, 94.0200], zoom: 9 }
];

export const MAP_LAYERS = {
  STREET: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  TOPO: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  SATELLITE: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
};

export const DEMO_PRESET_IMAGES = [
  {
    title: "Longitudinal Tension Crack (NH-29 Zubza)",
    category: "TENSION_CRACK",
    url: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=60",
    desc: "10-meter surface asphalt crack following heavy continuous rainfall."
  },
  {
    title: "Active Mudflow & Rock Slump (NH-10 Kalijhora)",
    category: "DEBRIS_MUDFLOW",
    url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=60",
    desc: "Silt and boulder slurry washing across carriageway lanes."
  },
  {
    title: "Retaining Wall Bulge (Sonapur Portal)",
    category: "WALL_BULGE",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60",
    desc: "Hydrostatic displacement and masonry cracking on hillside wall."
  }
];
