// Made-up library for checking the page in a browser (not part of the app).
// Serve the project folder, open /web/index.html, then run:
//   await import('/tools/mock.js').then(m => m.load({ theme: 'dark' }))
const rel = (tag, date, notes, assets, pre = false) => ({ tag, name: tag, date, notes, url: 'https://github.com/x', prerelease: pre, assets: assets.map(([name, size]) => ({ name, url: 'https://x/' + name, size, digest: '' })) });
const base = { bpaths: [], breg: [], priceHist: [], kit: false, langs: [], dead: 0, setupDir: '', wasInstalled: false, forks: 0, url: '', kind: 'github', icon: '', homepage: '', stars: 0, license: '', topics: [], archived: false, metaAt: Date.now() / 1000, groups: [], tags: [], notes: '', want: false, added: 1762400000, method: 'auto', pin: '', skip: '', inst: null, latest: null, etag: '', checked: 0, error: '', notified: '' };
const mk = o => ({ ...base, ...o });

export function state(cfg = {}) {
  return {
    t: 'state', ver: '1.3.0', arch: 'x64', pc: 'DESKTOP-MAIN', disk: 1.83e9, winget: { avail: true, scanning: false, at: 1762900000, err: '', items: [{ id: 'Wagnardsoft.DisplayDriverUninstaller', name: 'Display Driver Uninstaller', cat: 'hw', has: true, inst: '18.1.6.1', latest: '' }, { id: 'Guru3D.Afterburner', name: 'MSI Afterburner', cat: 'hw', has: true, inst: '4.6.5', latest: '4.6.6' }, { id: 'Guru3D.RTSS', name: 'RivaTuner Statistics Server', cat: 'hw', has: false, inst: '', latest: '' }, { id: 'CPUID.CPU-Z', name: 'CPU-Z', cat: 'hw', has: false, inst: '', latest: '' }, { id: 'REALiX.HWiNFO', name: 'HWiNFO', cat: 'hw', has: true, inst: '8.50', latest: '8.54' }, { id: 'Valve.Steam', name: 'Steam', cat: 'games', has: true, inst: '2.10.91.91', latest: '' }, { id: 'Blizzard.BattleNet', name: 'Battle.net', cat: 'games', has: true, inst: '', latest: '' }, { id: 'EpicGames.EpicGamesLauncher', name: 'Epic Games Launcher', cat: 'games', has: false, inst: '', latest: '' }, { id: 'Discord.Discord', name: 'Discord', cat: 'chat', has: true, inst: '1.0.9268', latest: '' }, { id: 'Telegram.TelegramDesktop', name: 'Telegram', cat: 'chat', has: false, inst: '', latest: '' }, { id: 'OBSProject.OBSStudio', name: 'OBS Studio', cat: 'media', has: true, inst: '32.0.1', latest: '33.0.0' }, { id: '7zip.7zip', name: '7-Zip', cat: 'tools', has: true, inst: '23.01', latest: '26.06' }, { id: 'Microsoft.VCRedist.2015+.x64', name: 'Visual C++ Redistributable', cat: 'runtime', has: true, inst: '14.52.37029.0', latest: '' }] }, sys: { windows: 'Windows 11 Pro', build: '24H2 · 26100.4061', cpu: { name: 'AMD Ryzen 7 7800X3D 8-Core Processor', arch: 'x64', uarch: 'Zen 4', cores: 8, pcores: 0, threads: 16, l3: 100663296 }, gpus: [{ name: 'NVIDIA GeForce RTX 5070 Ti', vendor: 'nvidia', vram: 17171480576, vramUsed: 4014563328, mem: 'GDDR7', bus: 256, driver: '32.0.15.7680', date: '' }], board: { maker: 'Micro-Star International Co., Ltd.', model: 'MAG B650 TOMAHAWK WIFI (MS-7D75)', sysMaker: 'Micro-Star International Co., Ltd.', sysModel: 'MS-7D75', bios: '1.H0', biosDate: '05/14/2025', biosVendor: 'American Megatrends International, LLC.' }, ram: 33996070912, ramFree: 12411080704, mem: { type: 'DDR5', speed: 6000, maker: 'Corsair', part: 'CMH32GX5M2B6000C30', sticks: [17179869184, 17179869184], slots: 4 }, serials: { pc: '', board: '230418818000365', ram: [], disks: [{ model: 'WD_BLACK SN770 2TB', serial: 'E823_8FA6_BF53_0001_001B_448B_4E2B_0A39' }] }, volumes: [{ letter: 'C:', label: '', total: 1000202039296, free: 402653184000, disk: { name: 'Samsung SSD 990 PRO 1TB', bus: 'NVMe', pcie: 'PCIe 4.0 x4', media: 'SSD' } }, { letter: 'D:', label: 'Games', total: 2000398934016, free: 214748364800, disk: { name: 'WD_BLACK SN770 2TB', bus: 'NVMe', pcie: 'PCIe 4.0 x4', media: 'SSD' } }, { letter: 'F:', label: 'Archive', total: 4000787030016, free: 1200000000000, disk: { name: 'Seagate ST4000DM004', bus: 'SATA', pcie: '', media: 'HDD' } }] }, gains: { 'gh:sharex/sharex': 140, 'gh:localsend/localsend': 74, 'gh:microsoft/powertoys': 0 },
    checkLog: { at: Math.floor(Date.now() / 1000) - 3000, lines: [{ tag: 'cmd', key: 'check' }, { tag: 'ok', key: 'found', n: 4 }, { tag: 'ok', key: 'releases', n: 5, m: 2 }, { tag: 'warn', key: 'reset', text: 'Класичне контекстне меню' }, { tag: 'ok', key: 'sync', text: 'C:\\Users\\user\\OneDrive\\Komora' }] },
    sync: { okAt: Math.floor(Date.now() / 1000) - 120 }, resets: 1, dataDir: 'C:\\Users\\user\\AppData\\Roaming\\Komora',
    cfg: { theme: 'dark', lang: 'uk', langNow: 'uk', checkHours: 24, hasToken: true, accent: 'violet', preAll: false, setupDir: '', setupShow: false, hasVt: false, syncDir: 'C:\\Users\\user\\OneDrive\\Komora', syncGist: false, appsDir: 'C:\\Users\\user\\Apps', notify: true, autostart: true, btTray: true, ...cfg },
    bt: [{ id: 'a1', name: 'DualSense Wireless Controller', kind: 'pad', pct: 64, tray: true }, { id: 'a2', name: 'yz75pro5.0', kind: 'kbd', pct: 81, tray: true }, { id: 'a3', name: 'MX Anywhere 3', kind: 'mouse', pct: 12, tray: true }, { id: 'a4', name: 'LinkBuds Fit', kind: 'audio', pct: 100, tray: false }],
    lib: {
      kitTweaks: ['ext', 'left', 'mouse'],
      groups: [{ id: 'g1', name: 'Робоче', color: '#7fb8e8' }, { id: 'g2', name: 'Стрім', color: '#d98bc2' }, { id: 'g3', name: 'Інструменти', color: '#6ccb8b' }],
      apps: [
        mk({ id: 'gh:sharex/sharex', url: 'https://github.com/ShareX/ShareX', owner: 'ShareX', repo: 'ShareX', name: 'ShareX', desc: 'ShareX is a free and open-source screen capture, file sharing and productivity tool.', stars: 32100, license: 'GPL-3.0', topics: ['screenshot', 'screen-recorder'], groups: ['g1'], tags: ['скріншоти', 'трей'], kit: true, langs: [['C#', 0.98]], pushed: '2026-11-05T10:00:00Z', inst: { version: '17.1.0', tag: '', method: 'installer', exe: 'C:\\x\\ShareX.exe', dir: '', uninstall: '', prev: '', at: 0 }, latest: rel('v18.0.0', '2026-10-28T10:00:00Z', '<h2>What’s new</h2><ul><li>New editor</li><li>Offline OCR</li></ul><p><img src="https://img.shields.io/badge/x-y-blue"></p>', [['ShareX-18.0.0-setup.exe', 8400000], ['ShareX-18.0.0-portable.zip', 9100000]]) }),
        mk({ id: 'gh:microsoft/powertoys', url: 'https://github.com/microsoft/PowerToys', owner: 'microsoft', repo: 'PowerToys', name: 'PowerToys', desc: 'Windows system utilities to maximize productivity', stars: 118000, license: 'MIT', groups: ['g1'], kit: true, langs: [['C#', 0.82], ['C++', 0.15]], inst: { version: '0.97.0', tag: 'v0.97.0', method: 'installer', exe: 'C:\\x\\PowerToys.exe', dir: '', uninstall: '', prev: '', at: 0 }, latest: rel('v0.97.0', '2026-10-20T10:00:00Z', '', [['PowerToysUserSetup-0.97.0-x64.exe', 280000000]]) }),
        mk({ id: 'gh:localsend/localsend', url: 'https://github.com/localsend/localsend', owner: 'localsend', repo: 'localsend', name: 'LocalSend', desc: 'An open-source cross-platform alternative to AirDrop', stars: 62000, inst: { version: '1.17.0', tag: 'v1.17.0', method: 'portable', exe: 'C:\\Apps\\LocalSend\\localsend_app.exe', dir: 'C:\\Users\\user\\Apps\\LocalSend', uninstall: '', prev: '1.16.1', at: 0 }, latest: rel('v1.18.0', '2026-11-01T10:00:00Z', '<p>Fixes</p>', [['LocalSend-1.18.0-windows-x86-64.zip', 6000000]]) }),
        mk({ id: 'gh:obsproject/obs-studio', url: 'https://github.com/obsproject/obs-studio', owner: 'obsproject', repo: 'obs-studio', name: 'OBS Studio', desc: 'Free and open source software for live streaming and screen recording', stars: 63000, groups: ['g2'], kit: true, wasInstalled: true, latest: rel('32.0.1', '2026-10-01T10:00:00Z', '', [['OBS-Studio-32.0.1-Windows-x64-Installer.exe', 150000000]]) }),
        mk({ id: 'gh:a/nothing', url: 'https://github.com/a/nothing', owner: 'a', repo: 'nothing', name: 'nothing-tool', error: 'GitHub request limit reached — add a token in Settings or try later' }),
        mk({ id: 'gh:old/tool', url: 'https://github.com/old/tool', owner: 'old', repo: 'tool', name: 'OldTool', desc: 'An abandoned tray tool', stars: 900, pushed: '2023-01-10T00:00:00Z', fork: true, parent: 'orig/tool', inst: { version: '2.0', tag: 'v2.0', method: 'portable', exe: 'C:\\Apps\\OldTool\\tool.exe', dir: 'C:\\Apps\\OldTool', signed: 'unsigned', sha256: 'ab'.repeat(32), prev: '', at: 0 }, latest: rel('v2.0', '2023-01-01T00:00:00Z', '', [['tool-2.0-win64.zip', 1200000]]) }),
        mk({ id: 'wg:Valve.Steam', kind: 'winget', kit: true, repo: 'Valve.Steam', name: 'Steam', url: 'https://winstall.app/apps/Valve.Steam', inst: { version: '2.10.91.91', tag: '', method: 'winget', exe: '', dir: '', uninstall: '', prev: '', at: 0 }, latest: { tag: '2.10.91.91', name: '', date: '', notes: '', url: '', prerelease: false, assets: [] } }),
        mk({ id: 'ln:1', kind: 'link', kit: true, linkKind: 'video', url: 'https://www.youtube.com/watch?v=x', name: 'Налаштування Windows 11 — гайд', author: 'Канал про ПК', site: 'YouTube', tags: ['гайди'], metaAt: 1 }),
        mk({ id: 'ln:2', kind: 'link', linkKind: 'product', url: 'https://stiystil.com.ua/organizer', name: 'Органайзер для дротів і кабелів', site: 'STIYSTIL', groups: ['g3'], metaAt: 1 }),
        mk({ id: 'ln:3', kind: 'link', linkKind: 'page', url: 'https://blog.example.com/post', name: 'Старий блог про трей', site: 'blog.example.com', dead: 1762000000, error: 'the site answered HTTP 404', metaAt: 1762000000 }),
        mk({ id: 'ln:4', kind: 'link', linkKind: 'page', url: 'https://www.simhubdash.com/download-2/', name: 'Download SimHub', site: 'SimHub', dl: 'SimHub.9.13.5.zip', metaAt: 1 }),
        mk({ id: 'ln:5', kind: 'page', url: 'https://thecrewchief.org/downloads/', name: 'Crew Chief', repo: 'CrewChiefV4', method: 'auto', metaAt: 1, latest: { tag: '2026.10.31', name: 'CrewChiefV4.msi', date: '2026-10-31T00:00:00Z', notes: '', url: 'https://thecrewchief.org/downloads/', prerelease: false, assets: [{ name: 'CrewChiefV4.msi', url: 'https://thecrewchief.org/CrewChiefV4.msi', size: 61865984, digest: '' }, { name: 'CrewChiefV4-sounds.zip', url: 'https://thecrewchief.org/sounds.zip', size: 0, digest: '' }] } }),
      ],
      authors: [{ login: 'localsend', name: 'LocalSend', kit: true, bio: 'Share files to nearby devices', blog: 'localsend.org', avatar: '', org: true, news: ['localsend/protocol'], added: 1762400000, updated: 1762400000, checked: Math.floor(Date.now() / 1000) - 3000, error: '',
        repos: [{ full: 'localsend/localsend', owner: 'localsend', name: 'localsend', desc: 'An open-source cross-platform alternative to AirDrop', stars: 62000, lang: 'Dart', pushed: '2026-11-01T00:00:00Z', fork: false, avatar: '' }, { full: 'localsend/protocol', owner: 'localsend', name: 'protocol', desc: 'The protocol specification', stars: 900, lang: '', pushed: '2026-11-06T00:00:00Z', fork: false, avatar: '' }] }],
    },
    updates: ['gh:sharex/sharex', 'gh:localsend/localsend'],
    busy: { 'gh:localsend/localsend': { stage: 'download', pct: 0.42 } },
    picks: {
      'gh:sharex/sharex': { name: 'ShareX-18.0.0-setup.exe', size: 8400000, kind: 'setup' },
      'gh:localsend/localsend': { name: 'LocalSend-1.18.0-windows-x86-64.zip', size: 6000000, kind: 'zip' },
      'gh:obsproject/obs-studio': { name: 'OBS-Studio-32.0.1-Windows-x64-Installer.exe', size: 150000000, kind: 'setup' },
      'ln:5': { name: 'CrewChiefV4.msi', size: 61865984, kind: 'msi' },
    },
    rate: { remaining: 52, limit: 60, reset: 0 }, lastCheck: Math.floor(Date.now() / 1000) - 3000, checking: false,
  };
}

/** A made-up GitHub search answer and repository (the page asks for them when the search opens). */
export function search() {
  const items = [
    { full: 'File-New-Project/EarTrumpet', owner: 'File-New-Project', name: 'EarTrumpet', desc: 'Volume control for Windows', stars: 15200, lang: 'C#', pushed: '2026-10-30T00:00:00Z', created: '', license: 'MIT', topics: ['windows', 'audio', 'volume'], archived: false, avatar: '', org: true, url: 'https://github.com/File-New-Project/EarTrumpet', homepage: 'https://eartrumpet.app' },
    { full: 'sabrogden/Ditto', owner: 'sabrogden', name: 'Ditto', desc: 'Ditto is an extension to the Windows Clipboard.', stars: 5200, lang: 'C++', pushed: '2026-10-20T00:00:00Z', created: '', license: 'GPL-3.0', topics: ['clipboard', 'windows'], archived: false, avatar: '', org: false, url: 'https://github.com/sabrogden/Ditto', homepage: '' },
  ];
  window.komoraMessage({ t: 'ghResults', seq: 1, page: 1, total: 2, items });
  window.komoraMessage({ t: 'ghRepo', full: 'File-New-Project/EarTrumpet', release: { tag: 'v2.3.3', date: '2026-09-01T00:00:00Z', prerelease: false }, pick: { name: 'EarTrumpet-2.3.3.zip', size: 4500000, kind: 'zip' }, readme: '<p><img src="https://img.shields.io/badge/a-b-c"></p><p><img src="https://example.com/banner.png"></p><h2>EarTrumpet</h2><p>Volume control.</p><p><img src="https://example.com/shot1.png"><img src="https://example.com/shot2.png"></p>' });
}

/** The user's own words of the made-up library in English (for English screenshots). */
const EN_DATA = {
  'Робоче': 'Work', 'Стрім': 'Stream', 'Інструменти': 'Tools', 'скріншоти': 'screenshots', 'трей': 'tray', 'гайди': 'guides',
  'Налаштування Windows 11 — гайд': 'Setting up Windows 11 — a guide', 'Канал про ПК': 'PC channel', 'Органайзер для дротів і кабелів': 'Cable organiser',
  'Старий блог про трей': 'An old blog about tray apps', 'Класичне контекстне меню': 'Classic context menu',
};
function english(s) {
  const tr = v => (typeof v === 'string' ? EN_DATA[v] ?? v : Array.isArray(v) ? v.map(tr) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tr(x)])) : v);
  return tr(s);
}

/** Made-up tweaks of the catalog with their states. */
export function tweaks() {
  const tw = (id, cat, uk, en, ukD, enD, status, o = {}) => ({ id, cat, uk, en, ukD, enD, status, restart: '', admin: false, custom: false, vals: [], ...o });
  window.komoraMessage({ t: 'tweaks', list: [
    tw('classic_menu', 'explorer', 'Класичне контекстне меню', 'Classic context menu', 'Повне меню правої кнопки без «Показати більше параметрів»', 'The full right-click menu without “Show more options”', 'reset', { restart: 'explorer' }),
    tw('ext', 'explorer', 'Показувати розширення файлів', 'Show file extensions', '.exe, .zip, .txt у назвах', '.exe, .zip, .txt in names', 'on'),
    tw('this_pc', 'explorer', 'Провідник відкривається на «Цей ПК»', 'File Explorer opens on “This PC”', 'Замість «Головної»', 'Instead of “Home”', 'off'),
    tw('left', 'taskbar', 'Панель завдань ліворуч', 'Taskbar aligned left', 'Як у Windows 10', 'Like Windows 10', 'on'),
    tw('bing', 'start', 'Без Bing у пошуку Пуску', 'No Bing in Start search', 'Пошук лише по ПК', 'Search this PC only', 'already', { restart: 'logon' }),
    tw('tips', 'privacy', 'Без порад і реклами в Пуску', 'No tips and ads in Start', 'Рекомендації й пропозиції вимкнено', 'Suggestions and offers off', 'on'),
    tw('telemetry', 'privacy', 'Менше телеметрії', 'Less telemetry', 'Політика AllowTelemetry = 1', 'AllowTelemetry policy = 1', 'off', { admin: true }),
    tw('mouse', 'input', 'Без прискорення миші', 'No mouse acceleration', 'Рух миші один до одного', 'One-to-one pointer movement', 'on'),
  ] });
}

export function load(cfg = {}, empty = false) {
  let s = state(cfg);
  if (empty) { s.lib.apps = []; s.lib.groups = []; s.updates = []; s.busy = {}; }
  if (s.cfg.langNow === 'en') s = english(s);
  window.komoraMessage(s);
  window.komoraMessage({ t: 'readme', id: 'gh:sharex/sharex', html: '<h1>ShareX</h1><p><a href="https://x"><img src="https://img.shields.io/badge/a-b-c"></a></p><p>ShareX is a free and open-source <a href="docs/x.md">screen capture</a> tool.</p><pre><code>winget install ShareX</code></pre>' });
  return s;
}
