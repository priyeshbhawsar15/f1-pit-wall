// Team logo URLs from official/public sources
export const TEAM_LOGOS: Record<number, string> = {
  // F1 25 standard (0-9)
  0: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes-logo.png',
  1: 'https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari-logo.png',
  2: 'https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing-logo.png',
  3: 'https://media.formula1.com/content/dam/fom-website/teams/2025/williams-logo.png',
  4: 'https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin-logo.png',
  5: 'https://media.formula1.com/content/dam/fom-website/teams/2025/alpine-logo.png',
  6: 'https://media.formula1.com/content/dam/fom-website/teams/2025/rb-logo.png',
  7: 'https://media.formula1.com/content/dam/fom-website/teams/2025/haas-logo.png',
  8: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren-logo.png',
  9: 'https://media.formula1.com/content/dam/fom-website/teams/2025/kick-sauber-logo.png',
  // F1 25 My Team (220-229) - same logos
  220: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes-logo.png',
  221: 'https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari-logo.png',
  222: 'https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing-logo.png',
  223: 'https://media.formula1.com/content/dam/fom-website/teams/2025/williams-logo.png',
  224: 'https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin-logo.png',
  225: 'https://media.formula1.com/content/dam/fom-website/teams/2025/alpine-logo.png',
  226: 'https://media.formula1.com/content/dam/fom-website/teams/2025/rb-logo.png',
  227: 'https://media.formula1.com/content/dam/fom-website/teams/2025/haas-logo.png',
  228: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren-logo.png',
  229: 'https://media.formula1.com/content/dam/fom-website/teams/2025/kick-sauber-logo.png',
  // F1 26 standard (256-265)
  256: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes-logo.png',
  257: 'https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari-logo.png',
  258: 'https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing-logo.png',
  259: 'https://media.formula1.com/content/dam/fom-website/teams/2025/williams-logo.png',
  260: 'https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin-logo.png',
  261: 'https://media.formula1.com/content/dam/fom-website/teams/2025/alpine-logo.png',
  262: 'https://media.formula1.com/content/dam/fom-website/teams/2025/rb-logo.png',
  263: 'https://media.formula1.com/content/dam/fom-website/teams/2025/haas-logo.png',
  264: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren-logo.png',
  265: 'https://media.formula1.com/content/dam/fom-website/teams/2026/audi-logo.png',
  // F1 26 My Team (476-485)
  476: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mercedes-logo.png',
  477: 'https://media.formula1.com/content/dam/fom-website/teams/2025/ferrari-logo.png',
  478: 'https://media.formula1.com/content/dam/fom-website/teams/2025/red-bull-racing-logo.png',
  479: 'https://media.formula1.com/content/dam/fom-website/teams/2025/williams-logo.png',
  480: 'https://media.formula1.com/content/dam/fom-website/teams/2025/aston-martin-logo.png',
  481: 'https://media.formula1.com/content/dam/fom-website/teams/2025/alpine-logo.png',
  482: 'https://media.formula1.com/content/dam/fom-website/teams/2025/rb-logo.png',
  483: 'https://media.formula1.com/content/dam/fom-website/teams/2025/haas-logo.png',
  484: 'https://media.formula1.com/content/dam/fom-website/teams/2025/mclaren-logo.png',
  485: 'https://media.formula1.com/content/dam/fom-website/teams/2026/audi-logo.png',
};

// Tyre compound SVG icons (inline data URIs for reliability)
export const TYRE_ICONS = {
  soft: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#FF3333" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#FF3333"/></svg>')}`,
  medium: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#FFC300" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#FFC300"/></svg>')}`,
  hard: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#FFFFFF" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#FFFFFF"/></svg>')}`,
  inter: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#39B54A" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#39B54A"/></svg>')}`,
  wet: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="#00AEEF" stroke-width="3"/><circle cx="12" cy="12" r="4" fill="#00AEEF"/></svg>')}`,
};

// Weather icons as inline SVGs
export const WEATHER_ICONS: Record<number, string> = {
  0: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="5" fill="#FFC300"/><g stroke="#FFC300" stroke-width="2"><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/></g></svg>')}`,
  1: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 10a6 6 0 00-12 0 4 4 0 100 8h12a3 3 0 100-6 3 3 0 00-2-2z" fill="#999"/></svg>')}`,
  2: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 10a6 6 0 00-12 0 4 4 0 100 8h12a3 3 0 100-6 3 3 0 00-2-2z" fill="#666"/></svg>')}`,
  3: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 10a6 6 0 00-12 0 4 4 0 100 8h12a3 3 0 100-6" fill="#666"/><line x1="8" y1="20" x2="7" y2="23" stroke="#4FC3F7" stroke-width="1.5"/><line x1="12" y1="20" x2="11" y2="23" stroke="#4FC3F7" stroke-width="1.5"/></svg>')}`,
  4: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 10a6 6 0 00-12 0 4 4 0 100 8h12a3 3 0 100-6" fill="#444"/><line x1="7" y1="20" x2="5" y2="23" stroke="#4FC3F7" stroke-width="2"/><line x1="11" y1="20" x2="9" y2="23" stroke="#4FC3F7" stroke-width="2"/><line x1="15" y1="20" x2="13" y2="23" stroke="#4FC3F7" stroke-width="2"/></svg>')}`,
  5: `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 10a6 6 0 00-12 0 4 4 0 100 8h12a3 3 0 100-6" fill="#333"/><path d="M13 20l-2 4 4-3-2 4" stroke="#FFC300" stroke-width="1.5" fill="none"/></svg>')}`,
};

// F1 logo as inline SVG
export const F1_LOGO = `data:image/svg+xml,${encodeURIComponent('<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg"><text x="0" y="32" font-family="Arial Black, sans-serif" font-weight="900" font-size="36" fill="#E10600">F1</text><text x="48" y="32" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#FFFFFF">TELEMETRY</text></svg>')}`;
