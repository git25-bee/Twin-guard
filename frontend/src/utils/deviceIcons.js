/**
 * High-definition 3D-styled SVG Miniature Device Icons for TwinGuard Digital Twin
 * Provides transparent, borderless miniature device graphics matching hospital equipment.
 */

// Helper to encode SVG into Data URI
const svgToDataUri = (svgString) => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

// 1. Bedside / ICU Patient Monitor Icon SVG
const bedsideMonitorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="monBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <linearGradient id="monScreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#091E05"/>
      <stop offset="100%" stop-color="#020E02"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#shadow)">
    <!-- Top Handle -->
    <path d="M 45 18 C 45 12, 75 12, 75 18 L 72 26 L 48 26 Z" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5"/>
    <!-- Outer Casing -->
    <rect x="18" y="24" width="84" height="74" rx="12" fill="url(#monBody)" stroke="#94A3B8" stroke-width="2"/>
    <!-- Side Accent / Ports -->
    <rect x="96" y="40" width="6" height="16" rx="3" fill="#2563EB"/>
    <rect x="96" y="62" width="6" height="10" rx="2" fill="#64748B"/>
    <!-- Screen Bezel -->
    <rect x="25" y="31" width="68" height="52" rx="6" fill="#1E293B"/>
    <!-- Display Screen -->
    <rect x="28" y="34" width="62" height="46" rx="4" fill="url(#monScreen)"/>
    <!-- ECG Waveforms (Green) -->
    <path d="M 30 46 L 40 46 L 43 40 L 46 54 L 49 36 L 52 48 L 54 46 L 68 46 L 71 42 L 74 50 L 76 46 L 88 46" fill="none" stroke="#22C55E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Pleth Waveform (Yellow) -->
    <path d="M 30 62 Q 36 55 42 62 T 54 62 T 66 62 T 78 62 H 88" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round"/>
    <!-- Digital Vital Numbers (Cyan/Yellow) -->
    <text x="73" y="44" fill="#22C55E" font-family="monospace" font-weight="bold" font-size="10">120</text>
    <text x="73" y="56" fill="#38BDF8" font-family="monospace" font-weight="bold" font-size="9">98</text>
    <text x="73" y="68" fill="#EAB308" font-family="monospace" font-weight="bold" font-size="9">20</text>
    <!-- Bottom Buttons & Knob -->
    <circle cx="34" cy="90" r="3" fill="#94A3B8"/>
    <circle cx="44" cy="90" r="3" fill="#94A3B8"/>
    <circle cx="54" cy="90" r="3" fill="#94A3B8"/>
    <circle cx="64" cy="90" r="3" fill="#94A3B8"/>
    <circle cx="82" cy="89" r="6" fill="#2563EB" stroke="#1D4ED8" stroke-width="1.5"/>
  </g>
</svg>
`;

// 2. Clinical Workstation Cart SVG
const workstationSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="wsScreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <filter id="shadowWs" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#shadowWs)">
    <!-- Monitor Base & Neck -->
    <rect x="56" y="48" width="8" height="14" fill="#64748B"/>
    <rect x="46" y="60" width="28" height="4" fill="#475569" rx="1"/>
    <!-- Monitor Screen frame -->
    <rect x="28" y="14" width="64" height="38" rx="5" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <rect x="31" y="17" width="58" height="32" rx="3" fill="url(#wsScreen)"/>
    <!-- Screen Header & Lines -->
    <rect x="33" y="20" width="54" height="6" rx="1" fill="#38BDF8" opacity="0.8"/>
    <rect x="35" y="30" width="22" height="3" fill="#FFFFFF" opacity="0.9"/>
    <rect x="35" y="36" width="30" height="3" fill="#94A3B8"/>
    <rect x="35" y="42" width="18" height="3" fill="#94A3B8"/>
    <rect x="62" y="30" width="23" height="15" rx="2" fill="#0284C7" opacity="0.5"/>
    <!-- Workstation Table surface -->
    <path d="M 22 64 L 98 64 L 94 72 L 26 72 Z" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect x="36" y="66" width="28" height="3" fill="#334155" rx="1"/> <!-- Keyboard -->
    <ellipse cx="78" cy="67.5" rx="3" ry="2" fill="#334155"/> <!-- Mouse -->
    <!-- Cart Column -->
    <rect x="54" y="72" width="12" height="24" fill="#94A3B8"/>
    <!-- Cart Drawer Box -->
    <rect x="36" y="80" width="48" height="26" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <line x1="38" y1="88" x2="82" y2="88" stroke="#E2E8F0" stroke-width="1.5"/>
    <line x1="38" y1="96" x2="82" y2="96" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="56" y="83" width="8" height="2" rx="1" fill="#0284C7"/>
    <rect x="56" y="91" width="8" height="2" rx="1" fill="#0284C7"/>
    <rect x="56" y="99" width="8" height="2" rx="1" fill="#0284C7"/>
    <!-- Cart Base & Wheels -->
    <path d="M 28 108 L 92 108 L 86 112 L 34 112 Z" fill="#64748B"/>
    <circle cx="32" cy="114" r="3.5" fill="#334155"/>
    <circle cx="88" cy="114" r="3.5" fill="#334155"/>
  </g>
</svg>
`;

// 3. Patient Database (PHI Storage) 3D Cylinder SVG
const databaseSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1D4ED8"/>
      <stop offset="50%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1E40AF"/>
    </linearGradient>
    <linearGradient id="dbTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
    <filter id="shadowDb" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.2"/>
    </filter>
  </defs>
  <g filter="url(#shadowDb)">
    <!-- Base Cylinder -->
    <path d="M 30 70 A 30 12 0 0 0 90 70 L 90 92 A 30 12 0 0 1 30 92 Z" fill="url(#dbGrad)" stroke="#1D4ED8" stroke-width="1"/>
    <ellipse cx="60" cy="70" rx="30" ry="12" fill="url(#dbTop)" stroke="#93C5FD" stroke-width="1.5"/>
    <!-- Middle Cylinder -->
    <path d="M 30 48 A 30 12 0 0 0 90 48 L 90 70 A 30 12 0 0 1 30 70 Z" fill="url(#dbGrad)" stroke="#1D4ED8" stroke-width="1"/>
    <ellipse cx="60" cy="48" rx="30" ry="12" fill="url(#dbTop)" stroke="#93C5FD" stroke-width="1.5"/>
    <!-- Top Cylinder -->
    <path d="M 30 26 A 30 12 0 0 0 90 26 L 90 48 A 30 12 0 0 1 30 48 Z" fill="url(#dbGrad)" stroke="#1D4ED8" stroke-width="1"/>
    <ellipse cx="60" cy="26" rx="30" ry="12" fill="url(#dbTop)" stroke="#93C5FD" stroke-width="1.5"/>
    <!-- Medical Cross Shield Emblem -->
    <circle cx="60" cy="62" r="15" fill="#FFFFFF" filter="url(#shadowDb)"/>
    <path d="M 55 62 H 65 M 60 57 V 67" stroke="#2563EB" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Status LEDs -->
    <circle cx="80" cy="33" r="2" fill="#22C55E"/>
    <circle cx="80" cy="55" r="2" fill="#38BDF8"/>
    <circle cx="80" cy="77" r="2" fill="#22C55E"/>
  </g>
</svg>
`;

// 4. Core Hospital Server Rack SVG
const serverSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="srvBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <filter id="shadowSrv" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#0F172A" flood-opacity="0.25"/>
    </filter>
  </defs>
  <g filter="url(#shadowSrv)">
    <!-- Main Server Tower Frame -->
    <rect x="28" y="16" width="64" height="88" rx="8" fill="url(#srvBody)" stroke="#475569" stroke-width="2"/>
    <!-- Server Drive Bay 1 -->
    <rect x="34" y="24" width="52" height="12" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1"/>
    <circle cx="40" cy="30" r="2" fill="#22C55E"/>
    <circle cx="46" cy="30" r="2" fill="#38BDF8"/>
    <rect x="76" y="28" width="6" height="4" fill="#64748B"/>
    <!-- Server Drive Bay 2 -->
    <rect x="34" y="40" width="52" height="12" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1"/>
    <circle cx="40" cy="46" r="2" fill="#22C55E"/>
    <circle cx="46" cy="46" r="2" fill="#22C55E"/>
    <rect x="76" y="44" width="6" height="4" fill="#64748B"/>
    <!-- Server Drive Bay 3 -->
    <rect x="34" y="56" width="52" height="12" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1"/>
    <circle cx="40" cy="62" r="2" fill="#22C55E"/>
    <circle cx="46" cy="62" r="2" fill="#38BDF8"/>
    <rect x="76" y="60" width="6" height="4" fill="#64748B"/>
    <!-- Server Drive Bay 4 -->
    <rect x="34" y="72" width="52" height="12" rx="3" fill="#1E293B" stroke="#475569" stroke-width="1"/>
    <circle cx="40" cy="78" r="2" fill="#22C55E"/>
    <circle cx="46" cy="78" r="2" fill="#EAB308"/>
    <rect x="76" y="76" width="6" height="4" fill="#64748B"/>
    <!-- Blue Security Shield Overlay on Server -->
    <path d="M 60 48 L 73 54 V 66 C 73 74 60 80 60 80 C 60 80 47 74 47 66 V 54 Z" fill="#2563EB" stroke="#FFFFFF" stroke-width="1.5"/>
    <path d="M 56 64 L 59 67 L 65 60" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

// 5. Hospital Firewall Appliance SVG
const firewallSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="fwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#DC2626"/>
      <stop offset="100%" stop-color="#991B1B"/>
    </linearGradient>
    <filter id="shadowFw" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.2"/>
    </filter>
  </defs>
  <g filter="url(#shadowFw)">
    <!-- Outer Appliance Box -->
    <rect x="18" y="32" width="84" height="60" rx="8" fill="url(#fwGrad)" stroke="#B91C1C" stroke-width="2"/>
    <!-- Brick Pattern Lines -->
    <line x1="18" y1="47" x2="102" y2="47" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="18" y1="62" x2="102" y2="62" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="18" y1="77" x2="102" y2="77" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <!-- Vertical Brick Joints -->
    <line x1="45" y1="32" x2="45" y2="47" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="75" y1="32" x2="75" y2="47" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="30" y1="47" x2="30" y2="62" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="60" y1="47" x2="60" y2="62" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="90" y1="47" x2="90" y2="62" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="45" y1="62" x2="45" y2="77" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <line x1="75" y1="62" x2="75" y2="77" stroke="#FECACA" stroke-width="1.5" opacity="0.6"/>
    <!-- Golden Shield Badge -->
    <circle cx="60" cy="62" r="16" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
    <path d="M 60 52 L 70 56 V 64 C 70 70 60 74 60 74 C 60 74 50 70 50 64 V 56 Z" fill="#CA8A04"/>
  </g>
</svg>
`;

// 6. ICU Ventilator Unit SVG
const ventilatorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="ventBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <filter id="shadowVent" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#shadowVent)">
    <!-- Cart Base Pole -->
    <rect x="56" y="80" width="8" height="28" fill="#94A3B8"/>
    <path d="M 36 108 L 84 108 L 80 112 L 40 112 Z" fill="#64748B"/>
    <circle cx="38" cy="114" r="3" fill="#334155"/>
    <circle cx="82" cy="114" r="3" fill="#334155"/>
    <!-- Ventilator Head Unit -->
    <rect x="24" y="20" width="72" height="64" rx="10" fill="url(#ventBody)" stroke="#94A3B8" stroke-width="2"/>
    <!-- Screen -->
    <rect x="32" y="28" width="56" height="38" rx="4" fill="#0F172A"/>
    <!-- Breathing Sine Wave (Cyan) -->
    <path d="M 34 46 Q 42 30 50 46 T 66 46 T 82 46" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
    <text x="36" y="60" fill="#22C55E" font-family="sans-serif" font-size="8" font-weight="bold">VT: 500ml</text>
    <text x="64" y="60" fill="#38BDF8" font-family="sans-serif" font-size="8" font-weight="bold">FiO2: 40%</text>
    <!-- Tubing Port -->
    <circle cx="40" cy="74" r="4" fill="#0284C7"/>
    <circle cx="54" cy="74" r="4" fill="#64748B"/>
    <!-- Breathing Tube Line -->
    <path d="M 40 78 C 30 90, 20 85, 18 100" fill="none" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
`;

// 7. ECG Telemetry Monitor SVG
const ecgSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="ecgBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <filter id="shadowEcg" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#shadowEcg)">
    <rect x="20" y="26" width="80" height="68" rx="10" fill="url(#ecgBody)" stroke="#94A3B8" stroke-width="2"/>
    <rect x="28" y="34" width="64" height="42" rx="4" fill="#091E05"/>
    <!-- Heart Rate Spike -->
    <path d="M 30 55 L 42 55 L 45 42 L 48 68 L 51 32 L 55 58 L 58 55 L 88 55" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="78" cy="44" r="5" fill="#EF4444"/>
    <path d="M 76 44 L 80 44 M 78 42 L 78 46" stroke="#FFFFFF" stroke-width="1.5"/>
    <!-- Control Buttons -->
    <rect x="30" y="82" width="12" height="6" rx="2" fill="#2563EB"/>
    <rect x="46" y="82" width="12" height="6" rx="2" fill="#64748B"/>
    <rect x="62" y="82" width="12" height="6" rx="2" fill="#64748B"/>
  </g>
</svg>
`;

// 8. Smart Infusion Pump SVG
const pumpSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pumpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <filter id="shadowPump" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#shadowPump)">
    <!-- IV Pole -->
    <line x1="60" y1="10" x2="60" y2="114" stroke="#94A3B8" stroke-width="3"/>
    <!-- IV Bag -->
    <path d="M 52 14 C 52 10, 68 10, 68 14 L 70 34 C 70 38, 50 38, 50 34 Z" fill="#E0F2FE" stroke="#38BDF8" stroke-width="1.5" opacity="0.85"/>
    <path d="M 54 22 H 66" stroke="#0284C7" stroke-width="2"/>
    <!-- Pump Device Body -->
    <rect x="36" y="38" width="48" height="64" rx="8" fill="url(#pumpGrad)" stroke="#94A3B8" stroke-width="2"/>
    <!-- Dispenser Screen -->
    <rect x="42" y="46" width="36" height="24" rx="3" fill="#0F172A"/>
    <text x="45" y="58" fill="#22C55E" font-family="monospace" font-weight="bold" font-size="9">125 ml/h</text>
    <text x="45" y="66" fill="#38BDF8" font-family="monospace" font-size="7">VOL: 250ml</text>
    <!-- Keypad Buttons -->
    <circle cx="46" cy="78" r="2.5" fill="#64748B"/>
    <circle cx="54" cy="78" r="2.5" fill="#64748B"/>
    <circle cx="62" cy="78" r="2.5" fill="#64748B"/>
    <circle cx="70" cy="78" r="2.5" fill="#22C55E"/>
    <circle cx="46" cy="86" r="2.5" fill="#64748B"/>
    <circle cx="54" cy="86" r="2.5" fill="#64748B"/>
    <circle cx="62" cy="86" r="2.5" fill="#64748B"/>
    <circle cx="70" cy="86" r="2.5" fill="#EF4444"/>
  </g>
</svg>
`;

// 9. Pharmacy Dispenser SVG
const pharmacySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="pharmaBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <filter id="shadowPharma" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.18"/>
    </filter>
  </defs>
  <g filter="url(#shadowPharma)">
    <rect x="26" y="18" width="68" height="84" rx="8" fill="url(#pharmaBody)" stroke="#94A3B8" stroke-width="2"/>
    <!-- Lock Screen -->
    <rect x="34" y="26" width="52" height="18" rx="3" fill="#0F172A"/>
    <text x="38" y="38" fill="#A855F7" font-family="sans-serif" font-weight="bold" font-size="9">MED-DISPENSER</text>
    <!-- Drawers -->
    <rect x="34" y="48" width="52" height="12" rx="2" fill="#FFFFFF" stroke="#94A3B8"/>
    <rect x="34" y="64" width="52" height="12" rx="2" fill="#FFFFFF" stroke="#94A3B8"/>
    <rect x="34" y="80" width="52" height="12" rx="2" fill="#FFFFFF" stroke="#94A3B8"/>
    <circle cx="60" cy="54" r="2" fill="#A855F7"/>
    <circle cx="60" cy="70" r="2" fill="#A855F7"/>
    <circle cx="60" cy="86" r="2" fill="#A855F7"/>
  </g>
</svg>
`;

// 10. Internet Gateway / WAN Router SVG
const internetSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
    <filter id="shadowNet" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.2"/>
    </filter>
  </defs>
  <g filter="url(#shadowNet)">
    <circle cx="60" cy="60" r="36" fill="url(#netGrad)" stroke="#38BDF8" stroke-width="2"/>
    <!-- Globe Grid Lines -->
    <ellipse cx="60" cy="60" rx="36" ry="14" fill="none" stroke="#E0F2FE" stroke-width="1.5" opacity="0.7"/>
    <ellipse cx="60" cy="60" rx="14" ry="36" fill="none" stroke="#E0F2FE" stroke-width="1.5" opacity="0.7"/>
    <line x1="24" y1="60" x2="96" y2="60" stroke="#E0F2FE" stroke-width="1.5" opacity="0.7"/>
    <line x1="60" y1="24" x2="60" y2="96" stroke="#E0F2FE" stroke-width="1.5" opacity="0.7"/>
    <!-- Orbiting Satellites / Nodes -->
    <circle cx="60" cy="60" r="6" fill="#FFFFFF"/>
  </g>
</svg>
`;

export const DEVICE_ICONS = {
  bedside: svgToDataUri(bedsideMonitorSvg),
  workstation: svgToDataUri(workstationSvg),
  database: svgToDataUri(databaseSvg),
  server: svgToDataUri(serverSvg),
  firewall: svgToDataUri(firewallSvg),
  ventilator: svgToDataUri(ventilatorSvg),
  ecg: svgToDataUri(ecgSvg),
  pump: svgToDataUri(pumpSvg),
  pharmacy: svgToDataUri(pharmacySvg),
  internet: svgToDataUri(internetSvg)
};

/**
 * Returns the matching SVG Data URI for any device node based on its name, id, or category type.
 */
export const getDeviceImageUri = (dev) => {
  const name = (dev?.name || '').toLowerCase();
  const id = (dev?.id || '').toLowerCase();
  const type = (dev?.device_type || '').toLowerCase();

  if (name.includes('internet') || name.includes('gateway') || id.includes('internet') || type.includes('wan')) {
    return DEVICE_ICONS.internet;
  }
  if (name.includes('firewall') || id.includes('firewall') || type.includes('dmz') || type.includes('perimeter')) {
    return DEVICE_ICONS.firewall;
  }
  if (name.includes('database') || name.includes('db') || name.includes('phi') || type.includes('db') || type.includes('storage')) {
    return DEVICE_ICONS.database;
  }
  if (name.includes('server') || id.includes('server') || type.includes('core')) {
    return DEVICE_ICONS.server;
  }
  if (name.includes('ventilator') || id.includes('ventilator')) {
    return DEVICE_ICONS.ventilator;
  }
  if (name.includes('ecg') || name.includes('cardio') || id.includes('ecg')) {
    return DEVICE_ICONS.ecg;
  }
  if (name.includes('pump') || name.includes('infusion') || id.includes('pump')) {
    return DEVICE_ICONS.pump;
  }
  if (name.includes('pharmacy') || name.includes('dispenser') || id.includes('pharmacy')) {
    return DEVICE_ICONS.pharmacy;
  }
  if (name.includes('pc') || name.includes('workstation') || type.includes('staff') || id.includes('pc') || name.includes('doctor')) {
    return DEVICE_ICONS.workstation;
  }
  
  // Default for Bedside Monitors / ICU Monitors / Generic Medical Devices
  return DEVICE_ICONS.bedside;
};
