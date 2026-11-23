'use strict';
// Komora page: navigation pane (sections, groups, tags), pages in the main area (library, updates, app pages,
// search, authors, tweaks, another PC, settings), the search of the title bar.
// State comes from the app as {t:'state'} messages; actions go back as {t:…} messages.

// ---------------------------------------------------------------- translations (key: Ukrainian text)

const EN = {
  'Додати': 'Add', 'Бібліотека': 'Library',
  'Оновлення': 'Updates', 'Встановлені': 'Installed', 'Не встановлені': 'Not installed', 'Посилання': 'Links',
  'Групи': 'Groups', 'Налаштування': 'Settings', 'Нова група': 'New group',
  'Перевіряю оновлення…': 'Checking for updates…', 'Перевірено': 'Checked', 'ще не перевіряли': 'not checked yet',
  'Перевірити оновлення': 'Check for updates', 'Оновити все': 'Update all',
  'За назвою': 'By name', 'За групами': 'By group', 'Нещодавно додані': 'Recently added', 'Без групи': 'No group',
  'Тут порожньо': 'Nothing here', 'Обрано': 'Selected', 'Оновити': 'Update', 'У групу': 'To group', 'Прибрати': 'Remove',
  'Скасувати': 'Cancel', 'Зберегти': 'Save', 'Видалити': 'Delete', 'Перейменувати': 'Rename',
  'Назва групи': 'Group name', 'Видалити групу?': 'Delete the group?', 'Програми лишаться в бібліотеці.': 'The apps stay in the library.',
  'Встановити': 'Install', 'Запустити': 'Launch', 'Відкрити': 'Open', 'Відкрити теку': 'Open folder', 'Відкрити на GitHub': 'Open on GitHub',
  'Оновити дані': 'Refresh', 'Повернути попередню версію': 'Roll back to the previous version',
  'Закріпити версію': 'Pin this version', 'Відкріпити версію': 'Unpin the version', 'Видалити з ПК': 'Uninstall',
  'Прибрати з бібліотеки': 'Remove from the library', 'до': 'to', 'немає файлу для Windows': 'no Windows file',
  'немає релізів': 'no releases', 'не встановлено': 'not installed', 'встановлювач': 'installer', 'портативна': 'portable',
  'портативна (zip)': 'portable (zip)', 'знайдено в Windows': 'found in Windows', 'Встановлено': 'Installed',
  'Останній реліз': 'Latest release', 'Зірки': 'Stars', 'Спосіб': 'Method', 'Автоматично': 'Automatic', 'Встановлювач': 'Installer',
  'Портативна': 'Portable', 'Групи й теги': 'Groups and tags',
  'Що нового': 'What’s new', 'Релізи': 'Releases', 'Нотатки': 'Notes', 'Завантаження…': 'Loading…',
  'README немає': 'No README', 'Опису змін немає': 'No release notes', 'На GitHub': 'On GitHub', 'тестовий': 'pre-release',
  'Мої нотатки — навіщо ця програма, що налаштувати…': 'My notes — why I keep it, what to set up…',
  'Спосіб встановлення': 'Install method', 'Закріпити на версії': 'Pin to a version', 'Пропустити реліз': 'Skip a release',
  'Пропущено': 'Skipped', 'Пропустити': 'Skip', 'Назва': 'Name', 'Тека': 'Folder', 'Сайт': 'Site', 'Додано': 'Added',
  'Тема': 'Theme', 'Як у Windows': 'Same as Windows', 'Мова': 'Language',
  'Вручну': 'Manually', 'год': 'h', 'Перевірити зараз': 'Check now',
  'Сповіщення': 'Notifications',
  'Токен GitHub': 'GitHub token', 'Створити токен на GitHub': 'Create a token on GitHub',
  'запитів': 'requests', 'Про програму': 'About', 'Автор': 'Author',
  'Почни свою комору': 'Start your komora',
  'Встав посилання на GitHub або сайт': 'Paste a link to GitHub or a site',
  'закрити': 'close',
  'Видалити програму з ПК?': 'Uninstall the app?', 'Портативна програма піде в Кошик.': 'The portable app goes to the Recycle Bin.',
  'Запуститься її деінсталятор.': 'Its uninstaller will start.', 'Прибрати з бібліотеки?': 'Remove from the library?',
  'Сама програма на ПК лишиться.': 'The app itself stays on the PC.', 'Усе актуальне': 'Everything is up to date',
  'Доступно оновлень:': 'Updates available:', 'Не вдалося перевірити:': 'Could not check:', 'Готово': 'Done',
  'У черзі': 'Queued', 'Завантаження': 'Downloading', 'Перевірка файлу': 'Verifying', 'Встановлення': 'Installing',
  'Розпаковування': 'Unpacking', 'Дані з GitHub': 'Fetching from GitHub', 'Видалення': 'Uninstalling', 'Відкат': 'Rolling back',
  'Не схоже на посилання': 'That does not look like a link', 'Уже в бібліотеці': 'Already in the library',
  'Репозиторій не знайдено на GitHub': 'Repository not found on GitHub', 'У репозиторію немає релізів': 'The repository has no releases',
  'У релізі немає файлу для Windows': 'The release has no file for Windows', 'Програма ще є в списку Windows': 'The app is still in the Windows list',
  'Спробувати знову': 'Try again', 'архів': 'archived', 'щойно': 'just now', 'Нова група…': 'New group…',
  'Нова назва': 'New name',
  'посилання': 'link', 'Програма закріплена на': 'The app is pinned to',
  'ще': 'more', 'Згорнути': 'Collapse', 'Дані': 'Data',
};

Object.assign(EN, {
  'Пошук на GitHub': 'Search on GitHub', 'Шукати на GitHub': 'Search GitHub', 'Програми': 'Apps', 'GitHub': 'GitHub',
  'Оновлень немає': 'No updates', 'Усі встановлені програми актуальні.': 'All installed apps are up to date.',
  'Ще нічого не встановлено': 'Nothing installed yet', 'Тут будуть програми, які ти встановиш через Komora, і ті, що вже є у Windows.': 'Apps you install with Komora and the ones already in Windows show up here.',
  'Посилань ще немає': 'No links yet',
  'Група порожня': 'The group is empty', 'Перетягни сюди програми зі списку або додай групу на сторінці програми.': 'Drag apps here from the list or add the group on an app’s page.',
  'Додати програму': 'Add an app', 'Додати посилання': 'Add a link',
  'наступна': 'next', 'незабаром': 'soon', 'Щодня': 'Daily', 'Щотижня': 'Weekly',
  'Щомісяця': 'Monthly', 'Додано:': 'Added:', 'Закріплено на версії': 'Pinned to version',
  'Встановити старішу версію?': 'Install an older version?',
  'Komora закріпить програму на ній, щоб не пропонувати оновлення. Відкріпити можна на сторінці програми.': 'Komora pins the app to it so updates are not offered. Unpin it on the app’s page.',
  'Найкращі збіги': 'Best match', 'Більше зірок': 'Most stars', 'Нещодавно оновлені': 'Recently updated',
  'зірок': 'stars', 'Будь-коли': 'Any time',
  'Набирає популярності': 'Trending',
  'Для Windows': 'For Windows', 'Утиліти трею': 'Tray utilities', 'Твіки Windows': 'Windows tweaks', 'Нові й живі': 'Fresh and active',
  'Знайдено': 'Found', 'Показати ще': 'Show more', 'Шукаю…': 'Searching…', 'Нічого не знайдено': 'Nothing found',
  'У бібліотеці': 'In the library', 'Відкрити в бібліотеці': 'Open in the library', 'Додати в бібліотеку': 'Add to the library',
  'Оновлено': 'Updated', 'Реліз': 'Release',
  'Ліміт пошуку GitHub: 10 запитів на хвилину без токена, 30 — з токеном.': 'GitHub search limit: 10 requests a minute without a token, 30 with one.',
  'Перевстановити': 'Reinstall', 'Цей реліз встановлено': 'This release is installed',
});

Object.assign(EN, {
  'GitHub, сайт, відео YouTube, товар у магазині — будь-яке посилання': 'GitHub, a site, a YouTube video, a shop product — any link',
  'Windows скинула твіки:': 'Windows reset tweaks:', 'Ігри': 'Games', 'Імпорт': 'Import', 'Імпортувати': 'Import', 'Імпортую…': 'Importing…',
  'Або PowerShell (необов’язково)': 'Or PowerShell (optional)', 'Без підпису': 'Unsigned', 'Без форків': 'Without forks',
  'Безпека': 'Safety',
  'Вимкнути': 'Turn off', 'Відео': 'Video',
  'Відновити': 'Restore', 'Відновити налаштування?': 'Restore the settings?', 'Відновлюю налаштування': 'Restoring settings',
  'Готово з набору: програм': 'Done from the bundle: apps', 'Детальніше': 'Details', 'Додати в цю групу': 'Add to this group', 'Додати всі': 'Add all', 'Додати ключ': 'Add key',
  'Додати теку…': 'Add a folder…', 'Діє після виходу з облікового запису й повторного входу.': 'Takes effect after signing out and in again.',
  'Діє після перезапуску Провідника — кнопка вгорі сторінки.': 'Takes effect after restarting File Explorer — the button at the top.',
  'Експорт Obtainium (Налаштування → Експорт): посилання з нього — у бібліотеку.': 'An Obtainium export (Settings → Export): its links go into the library.',
  'Закладок Chrome, Edge, Brave, Vivaldi чи Opera не знайдено': 'No Chrome, Edge, Brave, Vivaldi or Opera bookmarks found',
  'Застосовано': 'Applied', 'Зберегти копію зараз': 'Back up now', 'Знайдено на цьому ПК': 'Found on this PC',
  'Значення': 'Value', 'Значення реєстру': 'Registry values', 'Зірки GitHub': 'GitHub stars', 'Канал': 'Channel', 'Ключ має починатися з HKCU\\ або HKLM\\': 'The key must start with HKCU\\ or HKLM\\',
  'Копію налаштувань збережено': 'Settings backed up', 'Копіюю налаштування': 'Backing up settings', 'Копії': 'Backups', 'Лише форки': 'Forks only', 'Магазин': 'Shop',
  'Миша й клавіатура': 'Mouse and keyboard', 'Можливо, є живий форк.': 'There may be a living fork.', 'Мої нотатки — навіщо це, що важливо…': 'My notes — why I keep it, what matters…',
  'Мої твіки': 'My tweaks', 'Мій твік': 'My tweak', 'Набір збережено:': 'Bundle saved:',
  'Назва значення': 'Value name', 'Найпопулярніші форки. «Живіший» — оновлювався пізніше за оригінал.': 'The most popular forks. “More alive” — updated later than the original.',
  'Налаштування відновлено': 'Settings restored', 'Нова група з назвою джерела': 'New group named after the source',
  'Нічого не вибрано': 'Nothing chosen', 'Обрати файл…': 'Choose a file…', 'Опис': 'Description', 'Остання копія': 'Last backup',
  'Панель завдань': 'Taskbar', 'Панель завдань і відкриті вікна Провідника зникнуть на кілька секунд.': 'The taskbar and open File Explorer windows disappear for a few seconds.',
  'Перезапустити': 'Restart', 'Перезапустити Провідник': 'Restart File Explorer', 'Перезапустити Провідник?': 'Restart File Explorer?',
  'Платформа': 'Platform', 'По одному на рядок: GitHub, сайти, відео, товари.': 'One per line: GitHub, sites, videos, products.', 'Повернути': 'Bring back',
  'Показати форки': 'Show forks', 'Посилання скопійовано': 'Link copied', 'Поставити вибране': 'Set up the chosen',
  'Потребує уваги': 'Needs attention', 'Потрібні права адміністратора': 'Needs administrator rights', 'Провідник': 'File Explorer', 'Пуск і пошук': 'Start and search',
  'Підпис пошкоджено': 'Broken signature', 'Підписано': 'Signed', 'Разом з форками': 'With forks', 'Реклама й приватність': 'Ads and privacy',
  'Репозиторії, яким ти поставив зірку, — у бібліотеку. Релізи підтягнуться під час перевірки (для багатьох зірок потрібен токен).': 'Repositories you starred go into the library. Releases come with the next check (many stars need a token).',
  'Свій твік': 'Own tweak', 'Синхронізовано': 'Synced', 'Синхронізовано: є зміни з іншого ПК': 'Synced: changes from another PC', 'Синхронізувати зараз': 'Sync now',
  'Система': 'System', 'Скасовано': 'Undone', 'Скрипт, що вмикає': 'Script that applies', 'Скрипт, що скасовує': 'Script that undoes',
  'Спершу закрий програму: її файли налаштувань буде замінено копією.': 'Close the app first: its settings files are replaced by the backup.',
  'Сторінка': 'Page', 'Твіки': 'Tweaks', 'Твіки Windows': 'Windows tweaks',
  'Тека закладок разом із вкладеними — у бібліотеку: репозиторії як програми, решта як посилання.': 'A bookmarks folder with its subfolders goes into the library: repositories as apps, the rest as links.',
  'Теки й гілки реєстру з налаштуваннями програми. Кеші й журнали не копіюються; зберігаються 5 останніх копій.': 'Folders and registry keys with the app’s settings. Caches and logs are left out; the last 5 backups are kept.',
  'Текст': 'Text', 'Тестові релізи': 'Pre-releases', 'Товар': 'Product', 'У бібліотеку': 'To the library', 'Українська': 'Українська',
  'Файл релізу': 'Release file', 'Форки': 'Forks', 'Форків немає': 'No forks',
  'Шукаю, де програма тримає налаштування…': 'Looking for where the app keeps its settings…', 'Ще значення': 'Another value',
  'Що зберігати': 'What to back up', 'адміністратор': 'administrator', 'архів: автор більше не розвиває': 'archived: no longer developed',
  'живіший': 'more alive', 'за тиждень': 'this week', 'звично для відкритих програм': 'common for open source apps', 'логін GitHub': 'GitHub login',
  'не вдалося': 'failed', 'не оновлювався понад рік': 'not updated for over a year', 'оновлено': 'updated', 'останній реліз понад 2 роки тому': 'last release over 2 years ago',
  'пошкоджений підпис': 'broken signature',
  'пропонувати пре-релізи як оновлення': 'offer pre-releases as updates', 'після перезапуску Провідника': 'after restarting File Explorer', 'після повторного входу': 'after signing in again',
  'скинуто Windows': 'reset by Windows', 'спершу додай токен у Налаштуваннях': 'add a token in Settings first', 'твіків': 'tweaks', 'уже були': 'already there',
  'уже так у Windows': 'already so in Windows', 'файл змінено після підпису': 'the file was changed after signing', 'форк': 'fork',
  'частина назви, напр. x64.zip — порожньо: автоматично': 'part of the name, e.g. x64.zip — empty: automatic', 'Дивитись': 'Watch',
  'Поставити на цей ПК': 'Set up this PC',
  'Закладки браузера': 'Browser bookmarks', 'Список посилань': 'A list of links', 'Тека': 'Folder', 'Сайт': 'Site', 'Додано': 'Added',
  'Копія налаштувань': 'Settings backup', 'Параметри': 'Options', 'Оновити дані': 'Refresh', 'Відкріпити': 'Unpin', 'Закріпити': 'Pin', 'Копіювати': 'Copy',
  'Прибрати': 'Remove', 'Відкрити': 'Open', 
});

// English messages of the app side (network, installs) in Ukrainian
// 1.1: system card, «For PC», «About»
Object.assign(EN, {
  'winget не знайдено': 'winget is not found',
  'Ігри EA': 'EA games',
  'Ігри Ubisoft': 'Ubisoft games',
  'Ігри без DRM і всі бібліотеки разом': 'DRM-free games and all libraries together',
  'Архіви': 'Archives',
  'Браузер': 'Browser',
  'Браузери': 'Browsers',
  'Відтворює будь-яке відео': 'Plays any video',
  'Він входить до «Інсталятора застосунків» (App Installer) з Microsoft Store.': 'It comes with App Installer from Microsoft Store.',
  'Голос і чати': 'Voice and chats',
  'Датчики й температури всього ПК': 'Sensors and temperatures of the whole PC',
  'Дивлюся, що вже встановлено…': 'Looking at what is installed…',
  'Драйвер NVIDIA без зайвих складників': 'An NVIDIA driver without the extras',
  'Фізика PhysX, потрібна деяким іграм': 'PhysX physics that some games need',
  'Керування вентиляторами за кривими': 'Fan curves for every fan',
  'Датчики ПК, відкритий код': 'PC sensors, open source',
  'Стрес-тест і перевірка стабільності': 'Stress test and stability check',
  'Тест швидкості процесора': 'CPU speed benchmark',
  'Ігри Blizzard': 'Blizzard games',
  'Ігри Rockstar': 'Rockstar games',
  'Ігри Prime Gaming': 'Prime Gaming games',
  'Інді-ігри': 'Indie games',
  'Усі бібліотеки ігор в одному місці': 'All game libraries in one place',
  'Ігри Epic, GOG і Amazon без їхніх програм': 'Epic, GOG and Amazon games without their launchers',
  'Хмарні ігри NVIDIA': 'NVIDIA cloud gaming',
  'Гра й робота на віддаленому ПК': 'Play and work on a remote PC',
  'Голосовий зв’язок для ігор': 'Voice chat for games',
  'Голосовий зв’язок, відкритий код': 'Voice chat, open source',
  'Захищений месенджер': 'A private messenger',
  'Відеодзвінки': 'Video calls',
  'Робочі чати': 'Work chats',
  'Стрім із готовими оверлеями': 'Streaming with ready-made overlays',
  'Знімки й записи екрана': 'Screenshots and screen recordings',
  'Легкий відеоплеєр': 'A light video player',
  'Кодеки для будь-якого відео': 'Codecs for any video',
  'Аудіоплеєр': 'An audio player',
  'Запис і монтаж звуку': 'Record and edit audio',
  'Перекодування відео': 'Video converter',
  'Редактор зображень': 'An image editor',
  'Що займає місце на диску': 'What takes up disk space',
  'Редактор коду': 'A code editor',
  'Розширений диспетчер завдань': 'An advanced Task Manager',
  'Усе, що запускається з Windows': 'Everything that starts with Windows',
  'Менеджер паролів': 'A password manager',
  'Паролі в локальному файлі': 'Passwords in a local file',
  'Торент-клієнт без реклами': 'A torrent client without ads',
  'Віддалений доступ до ПК': 'Remote access to a PC',
  'Завантажувальна флешка з Windows': 'A bootable USB stick with Windows',
  'Кілька ISO на одній флешці': 'Many ISOs on one USB stick',
  'VPN від Proton': 'A VPN by Proton',
  'Нотатки в Markdown': 'Notes in Markdown',
  'Firefox без стеження': 'Firefox without tracking',
  'Потрібен старим інді-іграм': 'Needed by older indie games',
  'Потрібна Minecraft і програмам на Java': 'Needed by Minecraft and Java apps',
  'Потрібен програмам із вбудованим вебвікном': 'Needed by apps with a built-in web view',
  'Відкрити на GitLab': 'Open on GitLab', 'Відкрити на Codeberg': 'Open on Codeberg', 'Порівняти зміни на GitLab': 'Compare the changes on GitLab', 'Порівняти зміни на Codeberg': 'Compare the changes on Codeberg', 'Реліз на GitLab': 'The release on GitLab', 'Реліз на Codeberg': 'The release on Codeberg', 'Пошук на GitLab': 'GitLab search', 'Пошук на Codeberg': 'Codeberg search', 'Шукати на GitLab': 'Search GitLab', 'Шукати на Codeberg': 'Search Codeberg', 'Пошук': 'Search', '$1 відповів HTTP $2': '$1 answered HTTP $2', '$1 просить зачекати — спробуй пізніше': '$1 asks to wait — try later',
  'Показувати програми з добірки в «Усі» й групах': 'Show the picks in “All” and the groups',
  'Ховати програми з добірки з «Усі» й груп': 'Hide the picks from “All” and the groups',
  'Видавець': 'Publisher',
  'Версія': 'Version',
  'Усі зміни': 'All changes',
  '$1 працює: закрий програму й онови ще раз': '$1 is running: close it and update again',
  'Обсидіан': 'Obsidian',
  'Графіт': 'Graphite',
  'Північ': 'Midnight',
  'Сіро-біла': 'Grey and white',
  'Біла': 'White',
  'Пісок': 'Sand',
  'Назва цього ПК у Komora': 'This PC’s name in Komora',
  'Для Огляду, синхронізації й наборів. Порожньо — ім’я комп’ютера у Windows': 'For the dashboard, sync and bundles. Empty — the computer’s name in Windows',
  'Оновлювати автоматично': 'Update automatically',
  'Ставити відсутні автоматично': 'Install the missing automatically',
  'Нові версії програм набору ставляться самі після кожної перевірки оновлень': 'New versions of the kit’s apps install by themselves after every update check',
  'Коли набір з’являється на цьому ПК — через синхронізацію чи файл набору, — програми, яких тут немає, встановлюються без твого кліку': 'When the kit arrives on this PC — through sync or a bundle file — the apps this PC lacks install without a click',
  'Уся група в моєму наборі': 'The whole group is in my kit',
  'Стежиш': 'Following',
  'Стежиш за': 'Following',
  'Скасувати встановлення': 'Cancel the install',
  'Встановлення скасовано': 'The install is cancelled',
  'Логін GitHub або посилання на профіль GitHub, GitLab чи Codeberg': 'A GitHub login or a GitHub, GitLab or Codeberg profile link',
  'Значки ігор Steam': 'Steam game icons',
  'Коли гру переносять на інший диск, її ярлик на робочому столі стає білим. Komora знаходить гру в бібліотеках Steam і повертає значок.': 'When a game moves to another disk, its desktop shortcut turns white. Komora finds the game in the Steam libraries and brings the icon back.',
  'Значки повернуто': 'Icons brought back',
  'ігор не знайдено': 'games not found',
  'Усі значки Steam на місці': 'All Steam icons are in place',
  'Шукаю ігри в бібліотеках Steam…': 'Looking for the games in the Steam libraries…',
  'працює': 'up',
  'Нова програма чи посилання…': 'A new app or link…',
  'Сторінка winget': 'winget page',
  'GitLab не шукає за ліцензією': 'GitLab does not search by licence',
  'Без кольору': 'No colour',
  'Без значка — кольоровий квадрат': 'No icon — a coloured square',
  'Значок і колір': 'Icon and colour',
  'Кеш шейдерів відеокарти': 'Video card shader cache',
  'NVIDIA, AMD, Intel і DirectX: допомагає від підвисань після оновлення драйвера. Гра збере шейдери знову під час першого запуску.': 'NVIDIA, AMD, Intel and DirectX: helps with stutter after a driver update. A game builds its shaders again on its first start.',
  'Тимчасові файли': 'Temporary files',
  'Тимчасова тека Windows, завантаження winget і Komora старші за добу. Файли, які зараз використовуються, лишаються.': 'The Windows temp folder, winget’s and Komora’s downloads older than a day. Files in use stay.',
  'Очистити': 'Clean',
  'Очищаю…': 'Cleaning…',
  'Звільнено': 'Freed',
  'Що повернути після перевстановлення Windows чи на новому ПК': 'What comes back after reinstalling Windows or on a new PC',
  'Нове одразу в набір': 'New things straight into the kit',
  'Програми, посилання, групи, автори й твіки, які додаєш, одразу потрапляють у набір': 'The apps, links, groups, authors and tweaks you add go into the kit at once',
  'Додати групу': 'Add a group',
  'Додати в набір': 'Add to the kit',
  'Порожньо — додай кнопкою +': 'Empty — add with the + button',
  'Усе вже в наборі': 'Everything is in the kit already',
  'Повертати після перевстановлення Windows': 'Bring back after reinstalling Windows',
  'Виконую…': 'Working…',
  'Годинник Windows': 'Windows clock',
  'Неправильний час ламає сайти, ігри й оновлення. Годинник синхронізується із сервером часу зараз.': 'A wrong time breaks sites, games and updates. The clock is synced with the time server now.',
  'Синхронізувати': 'Sync',
  'Кеш DNS': 'DNS cache',
  'Інтернет є, а якийсь сайт не відкривається чи веде на старе місце: Windows забуває збережені адреси сайтів.': 'The internet works but a site does not open or leads to an old place: Windows forgets the site addresses it kept.',
  'Кеш Microsoft Store': 'Microsoft Store cache',
  'Store не завантажує чи не оновлює програми. Після скидання Store відкриється сам.': 'The Store does not download or update apps. After the reset the Store opens by itself.',
  'Скинути': 'Reset',
  'Кеш оновлень Windows': 'Windows Update cache',
  'Оновлення Windows зависли чи не встановлюються: служби оновлення перезапускаються, завантажені файли оновлень видаляються.': 'Windows updates are stuck or fail: the update services restart, the downloaded update files are removed.',
  'Системні файли Windows': 'Windows system files',
  'Перевіряє й відновлює пошкоджені файли Windows (sfc, потім DISM). Відкриється вікно з поступом; це триває 10–30 хвилин.': 'Checks and repairs damaged Windows files (sfc, then DISM). A window shows the progress; it takes 10–30 minutes.',
  'Годинник синхронізовано': 'The clock is synced',
  'Кеш DNS очищено': 'The DNS cache is flushed',
  'Microsoft Store скидається — він відкриється сам': 'Microsoft Store is resetting — it opens by itself',
  'Кеш оновлень Windows очищено': 'The Windows Update cache is cleaned',
  'Перевірка запущена в окремому вікні': 'The check runs in its own window',
  'Права адміністратора не надано': 'The administrator’s rights were not given',
  'Швидкий пошук': 'Quick search',
  'Встановити набір': 'Install the kit',
  'Усе з набору вже встановлено': 'Everything of the kit is installed already',
  'Синхронізацію не налаштовано — набір є лише на цьому ПК': 'Sync is not set up — the kit is only on this PC',
  'Налаштувати': 'Set up',
  'Групувати': 'Group by',
  'За джерелом': 'By source',
  'у наборі': 'in the kit',
  'Прибрати всю групу з набору': 'Take the whole group out of the kit',
  'Додати всю групу в набір': 'Add the whole group to the kit',
  'Нове в групі — одразу в набір': 'New in the group — straight into the kit',
  'Програми з цього ПК': 'Programs on this PC', 'Знайти…': 'Find…', 'Шукаю через winget… кілька секунд.': 'Looking through winget… a few seconds.',
  'Знайде встановлені програми, які winget уміє ставити. Додай їх у бібліотеку й набір — на новому ПК вони встануть одним кліком.': 'Finds installed programs winget can install. Add them to the library and the kit — on a new PC they install in one click.',
  'Позначене піде в бібліотеку. Системні компоненти (бібліотеки Visual C++, .NET тощо) Windows і програми зазвичай ставлять самі — їх не позначено.': 'What is checked goes into the library. System components (Visual C++ libraries, .NET and the like) Windows and programs usually install themselves — they are not checked.',
  'Системні компоненти': 'System components', 'Додати вибране': 'Add selected', 'Одразу в мій набір': 'Straight into my kit', 'уже в бібліотеці': 'already in the library', 'Нічого не вибрано': 'Nothing selected', 'Додано в бібліотеку': 'Added to the library',
  'версію не визначено': 'version unknown',
  'Твої програми й посилання: Komora ставить їх, оновлює й переносить на новий ПК': 'Your programs and links: Komora installs them, updates them and moves them to a new PC',
  'Як Komora працює на цьому ПК: перевірки, теки, вигляд, ключі й дані': 'How Komora works on this PC: checks, folders, look, keys and data',
  'Пристрої': 'Devices', 'Зараз жоден пристрій не повідомляє заряд.': 'No device reports its charge right now.',
  'Окремий значок у треї для кожного пристрою, що повідомляє заряд: Bluetooth, миші й клавіатури Logitech, миші Razer, SteelSeries і ATK / VXE, гарнітури Arctis, геймпади PlayStation і Xbox. Наведи на значок — назва й відсоток.': 'A tray icon for each device that reports its charge: Bluetooth, Logitech mice and keyboards, Razer, SteelSeries and ATK / VXE mice, Arctis headsets, PlayStation and Xbox controllers. Hover the icon for the name and percent.',
  'Сповіщення про низький заряд': 'Low charge notifications', 'При 20 % і при 10 % — раз на розряд, лише для пристроїв зі значком у треї': 'At 20 % and at 10 % — once per discharge, only for devices with a tray icon',
  'Сторонні компоненти': 'Third-party components', 'Шрифт Geist (OFL), значки Material Symbols (Apache-2.0) і Lucide (ISC)': 'The Geist typeface (OFL), Material Symbols (Apache-2.0) and Lucide (ISC) icons',
  'Komora — незалежний проєкт. Вона не пов’язана з Microsoft, Valve, Sony, Logitech, Razer, SteelSeries, Nintendo, GitHub, GitLab чи іншими згаданими компаніями й не схвалена ними; їхні назви й торгові марки належать власникам.': 'Komora is an independent project. It is not affiliated with or endorsed by Microsoft, Valve, Sony, Logitech, Razer, SteelSeries, Nintendo, GitHub, GitLab or any other company named in it; their names and trademarks belong to their owners.',
  'Заряд пристроїв у треї': 'Device charge in the tray', 'Вказати іншу теку встановлення…': 'Choose another install folder…', 'Уже встановлено — вказати теку…': 'Already installed — choose its folder…', 'Програму знайдено в теці': 'The app was found in the folder', 'Значок у треї': 'Tray icon',
  'Сторінка завантаження': 'Download page', 'Файли': 'Files', 'Перевірити сторінку': 'Check the page', 'Зробити знову посиланням': 'Make it a link again',
  'Файли для Windows, на які посилається сторінка. Komora перевіряє її разом з оновленнями: новий файл — нова версія.': 'Windows files the page links to. Komora checks it with the updates: a new file is a new version.',
  'На сторінці є файл для Windows': 'The page has a Windows file', 'Встановлювати звідси': 'Install from here', 'На сторінці немає файлу для Windows': 'The page has no Windows file',
  'Програма чи посилання, яке кладеш у цю групу, одразу потрапляє в мій набір': 'An app or link you put into this group goes straight into my kit',
  'Добірка': 'Picks',
  'З репозиторіїв': 'From repositories',
  'З добірки': 'From the picks',
  'Перевірені програми для ПК: ставляться одним кліком і далі оновлюються з бібліотеки': 'Proven programs for a PC: they install in one click and then update from the library',
  'Встановити в…': 'Install to…',
  'Натисни, щоб скопіювати': 'Click to copy',
  'Показати серійні номери': 'Show serial numbers',
  'Сховати серійні номери': 'Hide serial numbers',
  'Плата': 'Board',
  'Драйвер чипсета': 'Chipset driver',
  'ПК': 'PC',
  '$1: встановлювач обрав свою теку: $2': '$1: the installer chose its own folder: $2',
  'Тонкі налаштування драйвера NVIDIA для кожної гри': 'Fine NVIDIA driver settings for every game',
  'Анонімний браузер': 'An anonymous browser',
  'Розблоковує й видаляє файли, зайняті програмами': 'Unlocks and deletes files held by programs',
  'Видаляє багато програм разом і їхні залишки': 'Removes many programs at once and their leftovers',
  'Драйвер': 'Driver',
  'Драйвери Intel для цього ПК': 'Intel drivers for this PC',
  'Драйвери відеокарти й чипсета та BIOS материнської плати беруться з сайтів виробників. BIOS Komora не прошиває: онови його за інструкцією виробника.': 'Video card and chipset drivers and the motherboard BIOS come from the makers’ sites. Komora never flashes a BIOS: update it by the maker’s instructions.',
  'Драйвери й BIOS': 'Drivers and BIOS',
  'Драйвери й залізо': 'Drivers and hardware',
  'Запис і стрім': 'Recording and streaming',
  'Здоров’я дисків (SMART)': 'Disk health (SMART)',
  'Корисні дрібниці від Microsoft': 'Handy extras from Microsoft',
  'Локальний диск': 'Local disk',
  'Лічильник FPS і обмеження кадрів в іграх': 'FPS counter and frame limit in games',
  'Магазин Epic Games': 'Epic Games store',
  'Магазин і бібліотека ігор': 'Game store and library',
  'Месенджер': 'Messenger',
  'Миттєвий пошук файлів': 'Instant file search',
  'Музика': 'Music',
  'Повністю прибирає драйвер відеокарти перед чистим встановленням': 'Removes a video driver completely before a clean install',
  'Потрібен програмам на .NET': 'Needed by .NET apps',
  'Потрібна багатьом іграм і програмам': 'Needed by many games and apps',
  'Права кнопка — прибрати': 'Right-click to remove',
  'Процесор, пам’ять і материнська плата': 'Processor, memory and motherboard',
  'Розгін і криві вентиляторів відеокарти': 'Overclocking and fan curves of the video card',
  'Спілкування': 'Chat',
  'Старі бібліотеки DirectX для ігор': 'Legacy DirectX libraries for games',
  'Стрім і медіа': 'Streaming and media',
  'Тека даних': 'Data folder',
  'Текстовий редактор': 'Text editor',
  'Температури, напруги, вентилятори': 'Temperatures, voltages, fans',
  'Усе про відеокарту та її датчики': 'Everything about the video card and its sensors',
  'Утиліти': 'Utilities',
  'Швидкість дисків': 'Disk speed',
  'автор · Komora на GitHub': 'author · Komora on GitHub',
  'вільно з': 'free of', 'вільно': 'free', 'біт': 'bit', 'МТ/с': 'MT/s',
  'драйвер': 'driver',
});

const UK_ERR = [
  [/^the file's signature is broken.*/, 'Підпис файлу пошкоджено: його змінили після підпису'],
  [/^choose what to back up first$/, 'Спершу обери, що зберігати'],
  [/^too much data: (\d+) MB \(at most (\d+) MB\)$/, 'Забагато даних: $1 МБ (найбільше $2 МБ)'],
  [/^no backup$/, 'Копії немає'],
  [/^the registry was not restored \((.*)\)$/, 'Реєстр не відновлено ($1)'],
  [/^not a Komora bundle$/, 'Це не набір Komora'],
  [/^open a bundle first$/, 'Спершу відкрий набір'],
  [/^cannot pack: (.*)$/, 'Не вдалося запакувати: $1'],
  [/^the token cannot use Gists.*/, 'Токен не має доступу до Gist — дай йому дозвіл Gists'],
  [/^no sync file in the Gist$/, 'У Gist немає файлу синхронізації'],
  [/^enter your GitHub login.*/, 'Введи свій логін GitHub (або додай токен)'],
  [/^no such GitHub user$/, 'Такого користувача GitHub немає'],
  [/^not an Obtainium export$/, 'Це не експорт Obtainium'],
  [/^Windows did not take the value.*/, 'Windows не прийняла значення (політика або захищений ключ)'],
  [/^a name is needed$/, 'Потрібна назва'],
  [/^a registry path is needed$/, 'Потрібен шлях у реєстрі'],
  [/^not a number: (.*)$/, 'Не число: $1'],
  [/^a registry value or a script is needed$/, 'Потрібне значення реєстру або скрипт'],
  [/^characters .* cannot be used in an administrator value$/, 'Символи " & | < > ^ % не можна використовувати в значенні для адміністратора'],
  [/^(the script )?ended with code (-?\d+)$/, 'Завершилося з кодом $2'],
  [/^the administrator's rights were not given$/, 'Права адміністратора не надано'],
  [/^GitHub did not understand the search$/, 'GitHub не зрозумів запит'],
  [/^GitHub search limit reached.*/, 'Вичерпано ліміт пошуку GitHub — зачекай хвилину або додай токен у Налаштуваннях'],
  [/^link does not open: (.*)$/, 'Посилання не відкривається: $1'],
  [/^GitHub request limit reached.*/, 'Вичерпано ліміт запитів GitHub — додай токен у Налаштуваннях або спробуй пізніше'],
  [/^not found on GitHub$/, 'Не знайдено на GitHub'],
  [/^not found on GitLab$/, 'Не знайдено на GitLab'],
  [/^not found on Codeberg$/, 'Не знайдено на Codeberg'],
  [/^GitHub answered HTTP (\d+)$/, 'GitHub відповів HTTP $1'],
  [/^(GitLab|Codeberg) answered HTTP (\d+)$/, '$1 відповів HTTP $2'],
  [/^(GitLab|Codeberg) asks to wait.*/, '$1 просить зачекати — спробуй пізніше'],
  [/^(.+): the installer chose its own folder: (.+)$/, '$1: встановлювач обрав свою теку: $2'],
  [/^(.+) is running: close it and update again$/, '$1 працює: закрий програму й онови ще раз'],
  [/^the site answered HTTP (\d+)$/, 'Сайт відповів HTTP $1'],
  [/^close the app first: its files are in use$/, 'Спершу закрий програму: її файли зайняті'],
  [/^checksum mismatch.*/, 'Контрольна сума не збіглася: файл відрізняється від релізу'],
  [/^the download is not a Windows program$/, 'Завантажене — не програма для Windows'],
  [/^the setup ended with code (\d+)$/, 'Встановлювач завершився з кодом $1'],
  [/^cancelled$/, 'Скасовано'],
  [/^cannot unpack: (.*)$/, 'Не вдалося розпакувати: $1'],
  [/^download incomplete$/, 'Завантаження обірвалося'],
  [/^file too large$/, 'Файл завеликий'],
  [/^page too large$/, 'Сторінка завелика'],
  [/^nothing to roll back$/, 'Немає до чого повертатися'],
  [/^the previous version is not kept$/, 'Попередньої версії не збережено'],
  [/^Windows has no uninstaller for this app$/, 'У Windows немає деінсталятора цієї програми'],
  [/^the app's exe is unknown$/, 'Невідомо, який exe запускати'],
  [/^cannot connect to (.*)$/, 'Немає з’єднання з $1'],
  [/^not installed$/, 'Не встановлено'],
];

let L = 'uk', LI = -1;
/** A string of another language from i18n.js (index LI), or undefined. */
const tx = s => window.I18N?.s[s]?.[LI];
const t = s => (L === 'uk' ? s : L === 'en' ? EN[s] ?? s : tx(s) ?? EN[s] ?? s);
/** Ukrainian or English pair by the language: other languages translate the Ukrainian one. */
const ue = (uk, en) => (L === 'uk' ? uk : L === 'en' ? en : tx(uk) ?? en);
function msg(s) {
  if (L === 'en') return EN[s] ?? s;
  for (const [re, uk] of UK_ERR) if (re.test(s)) return s.replace(re, t(uk));
  return t(s);
}

// ---------------------------------------------------------------- helpers

const post = m => window.chrome?.webview?.postMessage(m);
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const I = {
  add: '', search: '', refresh: '', download: '', play: '', folder: '', del: '', pin: '',
  more: '', x: '', check: '', settings: '', apps: '', link: '', star: '', tag: '',
  globe: '', undo: '', warn: '', sort: '', edit: '', open: '', back: '', box: '',
  installed: '', notinst: '', note: '', remove: '', group: '', palette: '', moon: '', sun: '',
};
Object.assign(I, {
  feed: '', tool: '', pc: '', cloud: '', copy: '', cart: '', shield: '', save: '',
  importI: '', exportI: '', fork: '', video: '', restart: '', code: '', star2: '',
});
/** «My kit»: a backpack. */
// Bluetooth devices in the tray card: gamepad and keyboard — Material Symbols (Apache-2.0), the rest — Lucide (ISC)
const DEV_I = {
  pad: '<svg viewBox="0 -960 960 960" fill="currentColor"><path d="M189-160q-60 0-102.5-43T42-307q0-9 1-18t3-18l84-336q14-54 57-87.5t98-33.5h390q55 0 98 33.5t57 87.5l84 336q2 9 3.5 18.5T919-306q0 61-43.5 103.5T771-160q-42 0-78-22t-54-60l-28-58q-5-10-15-15t-21-5H385q-11 0-21 5t-15 15l-28 58q-18 38-54 60t-78 22Zm2.66-60q24.34 0 45.01-12.97Q257.33-245.95 268-268l28-57q13-26 36.5-40.5T385-380h190q29 0 52.5 15t37.5 40l28 57q10.67 22.05 31.33 35.03Q745-220 769.26-220 805-220 831-244.5t27-60.5q0-4-3-24l-84-335q-8-33-34.4-54.5T675-740H285q-34.7 0-61.35 21T189-664l-84 335q-1 4-3 23 0 36.48 26.26 61.24Q154.52-220 191.66-220ZM561.5-538.68q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68Zm80-80q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68Zm0 160q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68Zm80-80q8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5 12.82 0 21.32-8.68ZM358-472.08q7-7.09 7-17.92v-45h45q10.83 0 17.92-7.12 7.08-7.11 7.08-18 0-10.88-7.08-17.88-7.09-7-17.92-7h-45v-45q0-10.83-7.12-17.92-7.11-7.08-18-7.08-10.88 0-17.88 7.08-7 7.09-7 17.92v45h-45q-10.83 0-17.92 7.12-7.08 7.11-7.08 18 0 10.88 7.08 17.88 7.09 7 17.92 7h45v45q0 10.83 7.12 17.92 7.11 7.08 18 7.08 10.88 0 17.88-7.08ZM480-480Z"/></svg>',
  kbd: '<svg viewBox="0 -960 960 960" fill="currentColor"><path d="M140-200q-24 0-42-18.5T80-260v-440q0-24 18-42t42-18h680q24 0 42 18t18 42v440q0 23-18 41.5T820-200H140Zm0-60h680v-440H140v440Zm160-65h360v-60H300v60Zm-97-125h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60ZM203-575h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60Zm124 0h60v-60h-60v60Zm123 0h60v-60h-60v60ZM140-260v-440 440Z"/></svg>',
  mouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="7"/><path d="M12 6v4"/></svg>',
  audio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>',
  bt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 7 10 10-5 5V2l5 5L7 17"/></svg>',
};
I.kit = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.2V4a2.5 2.5 0 0 1 5 0v1.2"/><path d="M5 10a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v9a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"/><path d="M5.2 11.5c4.4 2 9.2 2 13.6 0"/><rect x="8.5" y="15.5" width="7" height="4" rx="1.2"/><path d="M12 13v2.5"/></svg>';
/** GitHub (Lucide, ISC licence), as in Arcmix «About». */
const GH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>';
/** GitLab (Lucide, ISC licence). */
const GL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 13.29-3.33-10a.42.42 0 0 0-.14-.18.38.38 0 0 0-.22-.11.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18l-2.26 6.67H8.32L6.1 3.26a.42.42 0 0 0-.1-.18.38.38 0 0 0-.26-.08.39.39 0 0 0-.23.07.42.42 0 0 0-.14.18L2 13.29a.74.74 0 0 0 .27.83L12 21l9.69-6.88a.71.71 0 0 0 .31-.83Z"/></svg>';
/** «Find»: a globe with a magnifier — new things from the internet, not from this PC. */
I.find = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 11.2A9.3 9.3 0 1 0 11.2 20.6"/><path d="M2 11h9"/><path d="M11.2 2c-2.3 2.4-3.6 5.6-3.6 9s1.3 6.6 3.6 9"/><path d="M11.2 2c1.9 2 3.1 4.5 3.5 7.3"/><circle cx="17.3" cy="17.3" r="3.6"/><path d="m22 22-2.1-2.1"/></svg>';
const ic = k => `<i class="i">${I[k]}</i>`;
const MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="3.2"/><path d="M4.5 11.4h15"/></svg>';
const GROUP_COLORS = ['#7fb8e8', '#60a5fa', '#a78bfa', '#c084fc', '#d98bc2', '#f472b6', '#ff7b72', '#f87171', '#f08a4b', '#fb923c', '#f5c04a', '#facc15', '#a3e635', '#6ccb8b', '#34d399', '#5fd4d0', '#2dd4bf', '#94a3b8'];
/** Icons a group can have (Segoe Fluent Icons), drawn in its colour or in the text colour. */
const GROUP_ICONS = { game: '\uE7FC', music: '\uE8D6', video: '\uE714', camera: '\uE722', photo: '\uE91B', art: '\uE790', code: '\uE943', tool: '\uE90F', work: '\uE821', globe: '\uE774', chat: '\uE8BD', people: '\uE716', headphones: '\uE7F6', mic: '\uE720', mouse: '\uE962', keyboard: '\uE765', settings: '\uE713', shield: '\uEA18', lock: '\uE72E', star: '\uE734', heart: '\uEB51', folder: '\uE8B7', book: '\uE8F1', school: '\uE7BE', cloud: '\uE753', download: '\uE896', home: '\uE80F', car: '\uE804', puzzle: '\uEA86', bulb: '\uEA80' };
/** A group's mark: its icon in its colour (or the text colour), else a square of its colour. */
const groupMark = g => (g.icon && GROUP_ICONS[g.icon] ? `<span class="gmark" style="color:${esc(g.color || 'var(--mu)')}"><i class="i">${GROUP_ICONS[g.icon]}</i></span>` : `<span class="dot" style="background:${esc(g.color || 'var(--mu2)')}"></span>`);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

function fmtSize(b) {
  if (!b) return '';
  const u = [['Б', 'B'], ['КБ', 'KB'], ['МБ', 'MB'], ['ГБ', 'GB'], ['ТБ', 'TB']].map(([a, b]) => ue(a, b));
  let i = 0;
  while (b >= 1024 && i < 4) { b /= 1024; i++; }
  return `${b >= 10 || i === 0 ? Math.round(b) : b.toFixed(1)} ${u[i]}`;
}
function ago(when) {
  const ms = typeof when === 'number' ? when * 1000 : Date.parse(when);
  if (!ms) return '';
  const s = (ms - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(L, { numeric: 'auto' });
  const a = Math.abs(s);
  if (a < 60) return t('щойно');
  for (const [lim, div, unit] of [[3600, 60, 'minute'], [86400, 3600, 'hour'], [86400 * 30, 86400, 'day'], [86400 * 365, 86400 * 30, 'month']])
    if (a < lim) return rtf.format(Math.round(s / div), unit);
  return rtf.format(Math.round(s / (86400 * 365)), 'year');
}
const hm = unix => new Date(unix * 1000).toLocaleTimeString(L, { hour: '2-digit', minute: '2-digit' });
/** "Fri, 13.11, 08:16": the locale's parts, without a trailing dot after the month. */
function whenShort(unix) {
  const parts = new Intl.DateTimeFormat(L, { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(unix * 1000));
  return parts.map((p, i) => (p.type === 'literal' && parts[i - 1]?.type === 'month' ? p.value.replace(/^\./, '') : p.value)).join('');
}
const dateOf = unix => new Date(unix * 1000).toLocaleDateString(L, { day: 'numeric', month: 'short', year: 'numeric' });
const verOf = tag => { const m = String(tag || '').match(/\d+(?:[._]\d+)*/); return m ? m[0].replace(/_/g, '.') : String(tag || ''); };
const hostOf = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return u; } };
const fmtNum = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k' : String(n);


// ---------------------------------------------------------------- 0.4 strings
Object.assign(EN, {
  'Огляд': 'Dashboard', 'посилання не відкривається': 'the link does not open', 'Шукати в бібліотеці й на GitHub': 'Search the library and GitHub', 'Перевіряю': 'Checking',
  'Додати програму чи посилання': 'Add an app or a link', 'Мій набір': 'My kit', 'Знайти нове': 'Find new', 'Автори': 'Authors', 'групи': 'groups', 'теги': 'tags',
  'встановлено': 'installed',
  'Windows скинула твіки': 'Windows reset tweaks',
  'Закріплено': 'Pinned', 'є': 'there is', 'найбільше': 'most:',
  'Нове від авторів': 'New from authors', 'перевірено': 'checked', 'не вдалося перевірити': 'could not be checked', 'Windows скинула твік': 'Windows reset a tweak',
  'або': 'or', 'Набір з іншого ПК': 'A bundle from another PC', 'не відкривається': 'does not open', 'набір': 'kit',
  'Група': 'Group', 'Оновити до': 'Update to',
  'група': 'group', 'тег': 'tag', 'Інші версії': 'Other versions', 'Ще': 'More',
  'антивірусів позначили файл. Часто це хибна тривога для відкритих програм, але подивись звіт.': 'antivirus engines flagged the file. For open source apps this is often a false alarm, but look at the report.',
  'Звіт': 'Report', 'закріплено': 'pinned', 'форків': 'forks', 'Мови': 'Languages', 'ще не налаштовано': 'not set up yet',
  'як пропонує встановлювач': 'where the setup proposes', 'Без підпису — звично для відкритих програм.': 'Unsigned — common for open source apps.',
  'Підпис пошкоджено: файл змінено після підпису.': 'Broken signature: the file was changed after signing.', 'Встановлено до Komora 0.3 — не перевірено.': 'Installed before Komora 0.3 — not checked.',
  'Підпис і контрольна сума перевіряються під час встановлення.': 'The signature and the checksum are checked during the install.',
  'аналізує…': 'analysing…', 'VirusTotal ще не бачив цей файл.': 'VirusTotal has not seen this file yet.', 'Покаже файл у Провіднику й відкриє сторінку завантаження VirusTotal': 'Shows the file in File Explorer and opens the VirusTotal upload page',
  'Завантажити на перевірку': 'Upload for a scan', 'файл': 'file', 'тека': 'folder', 'Порівняти з': 'Compare with', 'Тека встановлення': 'Install folder', 'Огляд…': 'Browse…',
  'Як у Налаштуваннях': 'As in Settings', 'Посилання не відкривається': 'The link does not open', 'з': 'since', 'із': 'of', 'Перевірити': 'Check', 'разом з оновленнями': 'with the update checks',
  'знайдено': 'found', 'Шукати': 'Search', 'нещодавні': 'recent', 'Ліцензія': 'Licence',
  'Нові репозиторії тих, за ким стежиш, — під час кожної перевірки': 'New repositories of the people you follow — on every check', 'Логін GitHub або посилання на профіль': 'GitHub login or profile link',
  'Стежити': 'Follow', 'Ще ні за ким не стежиш': 'You follow nobody yet', 'Стежити можна зі сторінки програми (меню ⋯) або тут за логіном.': 'Follow from an app’s page (the ⋯ menu) or here by login.',
  'організація': 'organisation', 'Не стежити': 'Unfollow', 'Нові репозиторії': 'New repositories', 'Переглянуто': 'Seen', 'нове': 'new', 'Публічних репозиторіїв немає': 'No public repositories',
  'Кожен можна скасувати — Komora пам’ятає, що було до нього.': 'Each can be undone — Komora remembers what was there before.',
  'увімкнено': 'on', 'вимкнено': 'off', 'Змінити': 'Change',
  'ще не синхронізовано': 'not synced yet', 'Синхронізація': 'Sync', 'Приватний GitHub Gist': 'A secret GitHub Gist', 'потрібен токен з дозволом Gists': 'needs a token with the Gists permission',
  'Вимкнено': 'Off', 'лише набір у файл': 'only a bundle file', 'Зміни зливаються, перемагає новіша. Встановлене не копіюється — інші ПК лише пропонують поставити.': 'Changes merge, the newer one wins. Installed apps are not copied — other PCs offer to install them.',
  'По одній програмі; налаштування повертаються з копій одразу після встановлення': 'One app at a time; settings come back from backups right after the install', 'Ставлю набір з': 'Setting up the bundle from',
  'готово': 'done', 'у черзі': 'queued', 'Твіки з набору': 'Tweaks of the bundle', 'Як пропонує встановлювач': 'Where the setup proposes',
  'Вигляд': 'Appearance', 'Перетягни сюди програми, щоб додати їх у набір': 'Drop apps here to add them to the kit', 'Додано в мій набір': 'Added to my kit', 'Додати в бібліотеку й у мій набір': 'Add to the library and to my kit', 'З налаштуваннями програм': 'With the apps’ settings', 'копій ще немає': 'no backups yet', 'Синхронізація не вдалася': 'Sync failed', 'Прибрати з набору': 'In my kit — click to remove', 'Додати в мій набір': 'Add to my kit', 'У моєму наборі': 'In my kit', 'Той самий токен, що й у Налаштуваннях: для Gist йому потрібен дозвіл Gists (Read and write).': 'The same token as in Settings: for a Gist it needs the Gists permission (Read and write).', 'Перенесення': 'Transfer', 'Або імпортуй багато:': 'Or import many:', 'Сортування': 'Sort', 'Будь-яка': 'Any', 'Будь-скільки': 'Any number', 'За місяць': 'Within a month', 'За пів року': 'Within half a year', 'За рік': 'Within a year', 'будь-хто': 'anyone', 'Нещодавні': 'Recent', 'Коли автор востаннє змінював код': 'When the author last changed the code', 'Додаю й встановлюю…': 'Adding and installing…', 'Зберегти .zip': 'Save .zip', 'Файл .komora чи .zip — або встав посилання на спільний набір (Ctrl+V).': 'A .komora or .zip file — or paste a link to a shared bundle (Ctrl+V).', 'Відкрити…': 'Open…', 'Посиланням (секретний Gist) або текстом — інший відкриє його в Komora.': 'As a link (secret Gist) or as text — someone else opens it in Komora.', 'Копії налаштувань програм самі': 'Settings backups by themselves', 'Теки налаштувань знаходяться самі; копія — перед кожним оновленням і раз на день, якщо файли змінилися': 'Settings folders are found by themselves; a backup before every update and once a day when the files changed', 'увійдено · тека Apps/Komora': 'signed in · folder Apps/Komora', 'увійти через сайт Dropbox': 'sign in on the Dropbox site', 'ще не налаштовано в цій збірці': 'not set up in this build yet', '1. Відкрий Dropbox і дозволь Komora доступ лише до її теки. 2. Скопіюй код, який покаже Dropbox, і встав сюди.': '1. Open Dropbox and allow Komora its own folder only. 2. Copy the code Dropbox shows and paste it here.', 'Відкрити Dropbox': 'Open Dropbox', 'код з Dropbox': 'code from Dropbox', 'Підтвердити': 'Confirm', 'Для Dropbox потрібен ключ застосунку Dropbox — його додасть автор у наступній збірці.': 'Dropbox needs a Dropbox app key — the author adds it in a coming build.', 'Вийти з Dropbox': 'Sign out of Dropbox', 'Поділитися': 'Share', 'Поділитися…': 'Share…', 'Посиланням (секретний Gist)': 'As a link (secret Gist)', 'Потрібен токен GitHub з дозволом Gists — Налаштування → Ключі': 'Needs a GitHub token with the Gists permission — Settings → Keys', 'Створюю посилання…': 'Creating the link…', 'Копіювати як текст': 'Copy as text', 'Скопійовано — встав куди завгодно; Komora прочитає цей текст через Ctrl+V': 'Copied — paste it anywhere; Komora reads such text back with Ctrl+V', 'Поділитися групою…': 'Share the group…', 'Посилання готове': 'The link is ready', 'Його скопійовано. Хто вставить його в Komora (Ctrl+V), побачить список і поставить, що захоче.': 'It is copied. Whoever pastes it into Komora (Ctrl+V) sees the list and installs what they want.', 'Гаразд': 'OK', 'Відкриваю спільний набір…': 'Opening the shared bundle…', 'Відновити': 'Restore', 'Розгорнути': 'Maximize', 'Згорнути': 'Minimize', 'Закрити': 'Close', 'Знайти': 'Find', 'Тег': 'Tag', 'Загальне': 'General', 'Перевіряти': 'Check', 'Перевіряю…': 'Checking…', 'останній': 'latest', 'Без ключа — пошук за SHA-256 на сайті VirusTotal.': 'Without a key — a lookup by SHA-256 on the VirusTotal site.', 'Без токена': 'No token', 'Встановлювачі': 'Installers', 'Доступно': 'Available', 'Дійсний': 'Valid', 'Закладки': 'Bookmarks', 'Набір': 'Bundle', 'Не встановлено': 'Not installed', 'Немає': 'None', 'Портативні': 'Portable', 'Пошкоджено': 'Broken', 'Репозиторії': 'Repositories', 'Скопійовано': 'Copied', 'Список': 'List', 'Це сама Komora. Вона завжди є в бібліотеці й у кожному наборі: на іншому ПК оновлюватиметься, як решта програм. «Оновити» завантажить новий Komora.exe, замінить ним цей і перезапустить програму.': 'This is Komora itself. It is always in the library and in every bundle: on another PC it updates like the other apps. “Update” downloads the new Komora.exe, puts it in place of this one and restarts.', 'виявлень': 'detections', 'вручну': 'manual', 'джерел': 'sources', 'для цього ПК': 'for this PC', 'запущена зараз': 'running now', 'застосовано': 'applied', 'збіг з релізом': 'matches the release', 'з’явиться після встановлення': 'appears after an install', 'посилань': 'links', 'програм': 'apps', 'реліз': 'release', 'тиждень': 'week', 'із': 'of', 'Як налаштувати Gist': 'How to set up the Gist', 'Відкрий сторінку нового токена на GitHub (посилання нижче) і ввійди у свій обліковий запис.': 'Open the page of a new token on GitHub (the link below) and sign in.', 'Token name — будь-яка назва, наприклад Komora. Expiration — скільки житиме токен: коли мине, синхронізація зупиниться й знадобиться новий.': 'Token name — any name, Komora for example. Expiration — how long the token lives: when it ends, sync stops and a new one is needed.', 'Repository access — «Public repositories»: доступ до твоїх репозиторіїв Komora не потрібен.': 'Repository access — “Public repositories”: Komora needs no access to your repositories.', 'Permissions → Account → Gists → Read and write.': 'Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен (github_pat_…) і встав його тут, у поле «Токен GitHub» під «Приватний GitHub Gist».': 'Generate token, copy it (github_pat_…) and paste it in Settings → Keys → GitHub token.', 'Тут обери «Приватний GitHub Gist». Komora сама створить секретний Gist із файлом komora-sync.json або знайде наявний.': 'Choose “Secret GitHub Gist” here. Komora creates a secret Gist with komora-sync.json itself, or finds the one there is.', 'На іншому ПК зроби те саме з тим самим обліковим записом GitHub — Komora знайде той самий Gist.': 'On another PC do the same with the same GitHub account — Komora finds the same Gist.', 'Секретний Gist не видно в списках і пошуку, але відкрити його може кожен, хто має посилання. Токени й ключі в синхронізацію не потрапляють.': 'A secret Gist is not listed or searchable, but anyone with its link can open it. Tokens and keys never go into sync.', 'Як отримати токен': 'How to get a token', 'Створи токен на GitHub (посилання нижче): назва — будь-яка, Repository access — «Public repositories».': 'Create a token on GitHub (the link below): any name, Repository access — “Public repositories”.', 'Для ліміту запитів дозволи не потрібні. Для синхронізації через Gist — Permissions → Account → Gists → Read and write.': 'The request limit needs no permissions. Sync through a Gist needs Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен і встав сюди → Зберегти.': 'Generate token, copy it, paste it here → Save.', 'Як отримати ключ': 'How to get a key', 'Зареєструйся на virustotal.com — це безкоштовно.': 'Sign up on virustotal.com — it is free.', 'Відкрий свій профіль → API key (посилання нижче) і скопіюй ключ.': 'Open your profile → API key (the link below) and copy the key.', 'Встав сюди → Зберегти. Безкоштовний ключ дає 4 запити на хвилину й 500 на день — Komora чекає сама.': 'Paste it here → Save. A free key allows 4 requests a minute and 500 a day — Komora waits by itself.',
  'Перевіряти оновлення': 'Check for updates', 'Тестові версії (pre-release)': 'Pre-releases', 'Для всіх програм; окремо можна ввімкнути на сторінці програми': 'For every app; each app can also have them on its page',
  'Сповіщення Windows': 'Windows notifications', 'Нові версії, нове від авторів, скинуті твіки': 'New versions, news of authors, reset tweaks', 'Запускати разом із Windows': 'Start with Windows',
  'Згорнутою в трей': 'Minimised to the tray', 'Тека переносних програм': 'Folder for portable apps', 'Сюди розпаковуються zip і окремі .exe': 'Zips and standalone .exe files go here',
  'Тека для встановлювачів': 'Folder for setups', 'Inno Setup і NSIS отримують цю теку, MSI — якщо підтримує; порожньо — як пропонує встановлювач': 'Inno Setup and NSIS get this folder, MSI if it supports it; empty — where the setup proposes',
  'Показувати вікно встановлювача': 'Show the setup window', 'Вимкнено — тихе встановлення': 'Off — a silent install', 'Ключі': 'Keys',
  'Без токена GitHub дає 60 запитів на годину, з токеном — 5000. Досить токена без дозволів; для синхронізації через Gist — дозвіл Gists.': 'Without a token GitHub allows 60 requests an hour, with one 5000. A token without permissions is enough; sync through a Gist needs the Gists permission.',
  'Ключ VirusTotal': 'VirusTotal key', 'безкоштовний ключ API': 'free API key', 'задано': 'set', 'не задано': 'not set',
  'Із ключем кожне встановлення перевіряється само, а невідомі файли вивантажуються. Без нього — кнопка «Завантажити на перевірку».': 'With a key every install is checked by itself and unknown files are uploaded. Without it — the “Upload for a scan” button.',
  'Отримати ключ на VirusTotal': 'Get a key on VirusTotal', 'Ключі зашифровано для твого облікового запису Windows і не потрапляють у синхронізацію.': 'The keys are encrypted for your Windows account and never go into sync.',
  'є оновлення': 'update available', 'Почни писати — назва, тег, група або що шукаєш на GitHub. Посилання можна одразу додати.': 'Start typing — a name, a tag, a group or what to look for on GitHub. A link can be added right away.',
  'Усі результати з фільтрами': 'All results with filters', 'перейти': 'move', 'відкрити': 'open', 'додати': 'add', 'Посилання також можна вставити Ctrl+V у вікні чи перетягнути з браузера': 'A link can also be pasted with Ctrl+V in the window or dragged from a browser',
  'Додати програму чи посилання…': 'Add an app or a link…', 'Зірки GitHub…': 'GitHub stars…', 'Закладки браузера…': 'Browser bookmarks…', 'Список посилань…': 'A list of links…', 'Набір з іншого ПК…': 'A bundle from another PC…',
  'Шукаю закладки…': 'Looking for bookmarks…', 'Стежити за автором': 'Follow the author', 'Копіювати посилання': 'Copy the link', 'Відкрити сторінку': 'Open the page', 'Інша версія…': 'Another version…',
  'Не пропускати': 'Do not skip', 'Шукаю автора…': 'Looking for the author…', 'Не стежити?': 'Unfollow?', 'Оновлюю…': 'Refreshing…', 'Ключ збережено': 'Key saved', 'Прибрати ключ?': 'Remove the key?',
  'Відпусти — посилання додасться в бібліотеку': 'Drop — the link goes into the library', 'У буфері немає посилання': 'No link in the clipboard', 'Нові репозиторії авторів:': 'New repositories of authors:',
  'Оновлюю дані сайту': 'Refreshing the site', 'Перевіряю на VirusTotal': 'Checking on VirusTotal',
  'Додай сайт, відео чи товар: Ctrl+V у вікні або кнопка «Додати».': 'Add a site, a video or a product: Ctrl+V in the window or the “Add” button.',
  'Усі': 'All', 'Застосовані': 'Applied', 'Скинуті Windows': 'Reset by Windows', 'Мої': 'Mine', 'автоматично': 'automatic',
  'Прибрати з набору': 'Remove from the kit', 'У мій набір': 'To my kit', 'у мій набір': 'to my kit', 'Порівняти зміни на GitHub': 'Compare the changes on GitHub', 'Реліз на GitHub': 'The release on GitHub',
  'увімкнено для всіх у Налаштуваннях': 'on for every app in Settings', 'Сховати': 'Hide', 'Показати': 'Show', 'Нещодавні й з оновленнями': 'Recent and with updates',
  'Набір порожній': 'The kit is empty', 
});
// ---------------------------------------------------------------- 1.2 strings
Object.assign(EN, {
  'Створи групу й перетягни туди програми': 'Create a group and drag apps into it',
  'Показати всі': 'Show all',
  'Zip із самою Komora.exe: на новому ПК розпакуй, запусти Komora.exe й відкрий цей zip.': 'A zip with Komora.exe itself: on the new PC unpack it, run Komora.exe and open this zip.',
  '«Мій набір» сам оновлюється на всіх твоїх ПК через приватний GitHub Gist. Перемагають новіші зміни; програми не встановлюються самі — інший ПК лише пропонує їх.': '«My kit» updates itself on all your PCs through a private GitHub Gist. Newer changes win; apps do not install by themselves — another PC only offers them.',
  'Або встав посилання на GitHub чи сайт': 'Or paste a GitHub or website link',
  'Бібліотеки': 'Libraries',
  'Відкрий файл перенесення або підключи синхронізацію — Komora запропонує поставити твій набір.': 'Open a transfer file or connect sync — Komora will offer to install your kit.',
  'Відкрити файл перенесення': 'Open a transfer file',
  'Додати в мій набір — встановиться на новому ПК': 'Add to my kit — it installs on a new PC',
  'Забери програми, які вже стоять, і познач, що має повертатися на кожен твій ПК.': 'Take in the apps already installed and mark what should come back on every PC of yours.',
  'Закрити файл': 'Close the file',
  'Зберегти файл перенесення': 'Save a transfer file',
  'Лише набір': 'Only the kit',
  'На інший ПК чи після перевстановлення Windows: синхронізація «Мого набору», файл перенесення, програми з цього ПК.': 'To another PC or after reinstalling Windows: sync of «My kit», a transfer file, the apps of this PC.',
  'Новий чи перевстановлений ПК': 'A new or reinstalled PC',
  'Один zip, щоб забрати набір чи всю бібліотеку на інший ПК або на чисту Windows.': 'One zip to take the kit or the whole library to another PC or a clean Windows.',
  'Познач рюкзаком у списку чи на сторінці програми те, що має бути на кожному ПК, — тут з’явиться кнопка «Встановити набір».': 'Mark with the backpack, in a list or on an app’s page, what should be on every PC — the «Install kit» button appears here.',
  'Правила набору': 'Kit rules',
  'Програми встановляться по одній, твіки з файлу застосуються.': 'Apps install one by one; tweaks from the file are applied.',
  'Уся бібліотека': 'The whole library',
  'Файл .komora чи .zip — або встав посилання на спільний набір (Ctrl+V). Що поставити, вибереш у «Моєму наборі».': 'A .komora or .zip file — or paste a shared kit link (Ctrl+V). You choose what to install in «My kit».',
  'Файл перенесення': 'Transfer file',
  'Це мій ПК': 'This is my PC',
  'Як часто Komora сама шукає нові версії': 'How often Komora looks for new versions by itself',
  'було на іншому ПК': 'was on another PC',
  'з добірки': 'from the picks',
  'з набору': 'from the kit',
  'з файлу': 'from the file',
  'на цьому ПК': 'on this PC',
  'твік з файлу': 'tweak from the file',
  'Показати все': 'Show all',
  'Йде зараз': 'In progress',
  'Нове від авторів, за якими стежиш': 'New from the authors you follow',
  'Підпис': 'Signature',
  'Розмір': 'Size',
  'Стан': 'State',
  'Фільтри': 'Filters',
  'програм встановлено': 'apps installed',
  'Пропустити версію': 'Skip version',
  'Пропущені версії': 'Skipped versions',
  'версію пропущено в «Оновленнях»': 'version skipped in «Updates»',
  'з’явиться знову, коли вийде новіша': 'it shows again when a newer one comes out',
  'GitHub і VirusTotal': 'GitHub and VirusTotal',
  'NVIDIA, AMD, Intel і DirectX': 'NVIDIA, AMD, Intel and DirectX',
  'sfc, потім DISM': 'sfc, then DISM',
  'Є оновлення': 'Update available',
  'Ігри, перенесені на інший диск': 'Games moved to another disk',
  'Історія оновлень': 'Update history',
  'Автор GitHub': 'GitHub author',
  'Актуально': 'Up to date',
  'Бібліотека програм': 'App library',
  'Вибрати': 'Select',
  'Вибрати всі': 'Select all',
  'Встав посилання на репозиторій GitHub, GitLab чи Codeberg або сторінку — воно одразу потрапить у набір.': 'Paste a link to a GitHub, GitLab or Codeberg repository or a page — it goes straight into the kit.',
  'Встановити вибрані': 'Install selected',
  'Встановлено програм': 'Apps installed',
  'Відкотити': 'Roll back',
  'Відкрити в Store': 'Open in Store',
  'Відкрити всю бібліотеку': 'Open the whole library',
  'Відкрити набір': 'Open the kit',
  'Головна': 'Home',
  'Головне меню': 'Main',
  'Готовність до перевстановлення ПК': 'Ready to reinstall this PC',
  'Групи набору': 'Groups of the kit',
  'Дані про залізо ще збираються': 'Gathering the hardware details',
  'Детальніше й твіки': 'Details and tweaks',
  'Джерела': 'Sources',
  'Дивлюся…': 'Looking…',
  'Для нового чи перевстановленого ПК': 'For a new or reinstalled PC',
  'Додати в один клік': 'Add in one click',
  'Доступні оновлення': 'Updates available',
  'Дії': 'Actions',
  'Залізо цього ПК, виправлення в один клік і твіки Windows, які можна скасувати': 'This PC’s hardware, one-click fixes and Windows tweaks you can undo',
  'Заряд мишей, клавіатур, навушників і геймпадів у треї': 'The charge of mice, keyboards, headphones and gamepads in the tray',
  'Заряд мишей, клавіатур, навушників і геймпадів — значком у треї.': 'The charge of mice, keyboards, headphones and gamepads — as an icon in the tray.',
  'Заряд пристроїв': 'Device charge',
  'Зняти вибір': 'Clear selection',
  'Каталог': 'Catalog',
  'Каталогу': 'the Catalog',
  'Категорія': 'Category',
  'Кожен файл перевіряється перед встановленням': 'Every file is checked before it installs',
  'Кожне — один клік; позначені admin просять дозволу Windows': 'One click each; those marked admin ask Windows for permission',
  'Коли набір приходить із синхронізації чи файлу, відсутні програми встановлюються самі': 'When the kit arrives with sync or a file, the missing apps install by themselves',
  'Куди ставляться програми й чи показувати встановлювач': 'Where apps install and whether the installer is shown',
  'Набір і бібліотека однакові на всіх твоїх ПК': 'The kit and the library are the same on all your PCs',
  'Назва й джерело': 'Name and source',
  'Не встановлено на цьому ПК': 'Not installed on this PC',
  'Оновити встановлені': 'Update installed',
  'Оновлювати набір самі': 'Update the kit by itself',
  'Оновлюється сама': 'Updates by itself',
  'Останні додані й встановлені програми': 'Apps added and installed lately',
  'Очікують встановлення': 'Waiting to install',
  'Перевірений підпис': 'Verified signature',
  'Перевірити, що встановлено': 'Check what is installed',
  'Перевірки, сповіщення, копії налаштувань, автозапуск': 'Checks, notifications, settings backups, start with Windows',
  'Перенесення і синхронізація': 'Transfer and sync',
  'Повернути значки': 'Bring the icons back',
  'Показано': 'Shown',
  'Потребують оновлення': 'Need an update',
  'Пошук серед програм добірки, winget ID чи призначення': 'Search the picks by name, winget ID or purpose',
  'Пошук у наборі': 'Search the kit',
  'Програма / winget ID': 'App / winget ID',
  'Програми, посилання, автори й твіки, які повертаються одним кліком після чистої Windows чи на новому ПК.': 'Apps, links, authors and tweaks that come back in one click on a clean Windows or a new PC.',
  'Підпис Authenticode, SHA-256 проти релізу, а з ключем — VirusTotal. Файл із пошкодженим підписом не встановлюється.': 'Authenticode signature, SHA-256 against the release and, with a key, VirusTotal. A file with a broken signature is not installed.',
  'Підписані': 'Signed',
  'Після кожної перевірки нові версії програм набору ставляться без твого кліку': 'After every check, new versions of the kit’s apps install without your click',
  'Розклад': 'Schedule',
  'Сайт не відкривається чи веде на старе місце': 'A site will not open or leads to an old place',
  'Система та дані': 'System and data',
  'Склад набору': 'What the kit holds',
  'Скопіювати характеристики': 'Copy the specs',
  'Ставити на новому ПК': 'Install on a new PC',
  'Стежу за твіками': 'Watching the tweaks',
  'Теги': 'Tags',
  'Тема, тло й мова вікна': 'Theme, background and language of the window',
  'Тут поки порожньо': 'Nothing here yet',
  'У наборі': 'In the kit',
  'Усі виправлення й твіки': 'All fixes and tweaks',
  'Фільтр за назвою, автором, тегом': 'Filter by name, author, tag',
  'Цей ПК і залізо': 'This PC and hardware',
  'Цей ПК і твіки': 'This PC and tweaks',
  'Швидке додавання до набору': 'Quick add to the kit',
  'Швидкий доступ': 'Quick access',
  'Швидкі виправлення': 'Quick fixes',
  'Що Komora встановила й оновила на цьому ПК': 'What Komora installed and updated on this PC',
  'або обери з': 'or pick from',
  'без ключа': 'no key',
  'без підпису': 'unsigned',
  'бракує': 'missing',
  'версію пропущено': 'version skipped',
  'встановлених': 'installed',
  'встановлено, але не в наборі': 'installed but not in the kit',
  'готовності': 'ready',
  'з ключем': 'with a key',
  'записів': 'entries',
  'помилка': 'error',
  'програм актуальні': 'apps up to date',
  'програм набору стоять на цьому ПК': 'kit apps are on this PC',
  'підписано': 'signed',
  'після кожного запуску й перевірки оновлень Komora дивиться, чи Windows не скинула їх, і пропонує повернути.': 'after every start and update check Komora looks whether Windows reset them and offers to bring them back.',
  'синхронізовано': 'synced',
  'тека в хмарі': 'cloud folder',
  'у треї': 'in the tray',
  'усього': 'in all',
});
UK_ERR.push(
  [/^no file for Windows on the page$/, 'На сторінці немає файлу для Windows'],
  [/^no program \(\.exe\) in the folder$/, 'У теці немає програми (.exe)'],
  [/^the VirusTotal key is not accepted$/, 'VirusTotal не приймає ключ'],
  [/^VirusTotal limit reached.*/, 'Вичерпано ліміт VirusTotal — спробуй за хвилину'],
  [/^VirusTotal answered HTTP (\d+)$/, 'VirusTotal відповів HTTP $1'],
  [/^the file is too large for an automatic upload$/, 'Файл завеликий для автоматичного вивантаження — завантаж його вручну'],
  [/^VirusTotal gave no (upload address|analysis id)$/, 'VirusTotal відповів незрозуміло'],
);
Object.assign(I, { layers: '\uE81E', eye: '\uE890', eyeOff: '\uED1A', grid: '', list: '', heart: '', clock: '', info: '', home: '', user: '', chevD: '', chevR: '', chevL: '', unpin: '', disc: '', close: '', prev: '', next: '' });
const mono = s => `<span class="mono">${s}</span>`;
/** A number with its word in the right form: uk [one, few, many], en [one, many]. */
function nw(n, uk, en, k) {
  const f = L === 'uk' || L === 'en' ? null : window.I18N?.W[L]?.[k];
  if (f && L === 'pl') {
    const d = n % 10, h = n % 100;
    return `${n} ${n === 1 ? f[0] : d >= 2 && d <= 4 && (h < 12 || h > 14) ? f[1] : f[2]}`;
  }
  if (f) return `${n} ${n === 1 || (L === 'fr' && n === 0) ? f[0] : f[1]}`;
  if (L !== 'uk') return `${n} ${n === 1 ? en[0] : en[1]}`;
  const d = n % 10, h = n % 100;
  return `${n} ${d === 1 && h !== 11 ? uk[0] : d >= 2 && d <= 4 && (h < 12 || h > 14) ? uk[1] : uk[2]}`;
}
const W = {
  core: [['ядро', 'ядра', 'ядер'], ['core', 'cores']],
  thread: [['потік', 'потоки', 'потоків'], ['thread', 'threads']],
  upd: [['оновлення', 'оновлення', 'оновлень'], ['update', 'updates']],
  updReady: [['оновлення готове', 'оновлення готові', 'оновлень готові'], ['update ready', 'updates ready']],
  reset: [['твік скинуто', 'твіки скинуто', 'твіків скинуто'], ['tweak reset', 'tweaks reset']],
  link: [['посилання', 'посилання', 'посилань'], ['link', 'links']],
  newRepo: [['новий репозиторій', 'нові репозиторії', 'нових репозиторіїв'], ['new repository', 'new repositories']],
  found: [['програму знайдено у Windows', 'програми знайдено у Windows', 'програм знайдено у Windows'], ['app found in Windows', 'apps found in Windows']],
  newRel: [['новий реліз', 'нові релізи', 'нових релізів'], ['new release', 'new releases']],
  price: [['ціну перевірено', 'ціни перевірено', 'цін перевірено'], ['price checked', 'prices checked']],
  lower: [['нижча', 'нижчі', 'нижчих'], ['lower', 'lower']],
  dead: [['посилання не відкривається', 'посилання не відкриваються', 'посилань не відкривається'], ['link does not open', 'links do not open']],
  author: [['автор', 'автори', 'авторів'], ['author', 'authors']],
  group: [['група', 'групи', 'груп'], ['group', 'groups']],
  repo: [['репозиторій', 'репозиторії', 'репозиторіїв'], ['repository', 'repositories']],
  fresh: [['новий', 'нові', 'нових'], ['new', 'new']],
  path: [['шлях', 'шляхи', 'шляхів'], ['path', 'paths']],
  item: [['позиція', 'позиції', 'позицій'], ['item', 'items']],
  tweak: [['твік', 'твіки', 'твіків'], ['tweak', 'tweaks']],
  app: [['програма', 'програми', 'програм'], ['app', 'apps']],
};
const nwk = (n, k) => nw(n, W[k][0], W[k][1], k);

// ---------------------------------------------------------------- colours

/** The accent: violet, [dark theme, light theme]. */
const ACCENT = ['#8b5cf6', '#7c3aed'];
const dark = () => document.documentElement.dataset.theme !== 'light';
function hashHue(s) {
  let h = 0;
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 360) / 360;
}
function rgb2hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function hsl2rgb(h, s, l) {
  if (!s) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = tt => { tt = (tt + 1) % 1; return tt < 1 / 6 ? p + (q - p) * 6 * tt : tt < 0.5 ? q : tt < 2 / 3 ? p + (q - p) * (2 / 3 - tt) * 6 : p; };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}
const hex2rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbHex = c => '#' + c.map(x => Math.round(x).toString(16).padStart(2, '0')).join('');

function applyAccent() {
  const c = ACCENT[dark() ? 0 : 1];
  const st = document.documentElement.style;
  st.setProperty('--acc', c);
  st.setProperty('--acc-text', dark() ? '#b8a2fb' : c);
  st.setProperty('--on-acc', '#ffffff');
  // the selected section: a deeper fill of the accent with white text
  const [h, sat] = rgb2hsl(hex2rgb(c));
  st.setProperty('--acc-fill', dark() ? rgbHex(hsl2rgb(h, Math.min(1, sat * 0.9), 0.5)) : c);
  st.setProperty('--acc-soft', `rgb(${hex2rgb(c).join(' ')} / ${dark() ? 0.14 : 0.12})`);
}

/** The themes: every surface given outright, with clear steps between the window, the cards and the buttons. */
const LOOKS = {
  dark: {
    obsidian: { base: '#09090b', layer: '#0c0c0f', card: '#121215', btn: '#1b1b1f', 'btn-h': '#232328', field: '#0f0f12', stroke: '#27272a', stroke2: '#3f3f46', div: '#1c1c20', fly: '#18181b', term: '#070708', 'term-line': '#1c1c20', bar: '#09090b' },
    graphite: { base: '#1e1e1e', layer: '#171717', card: '#262626', btn: '#303030', 'btn-h': '#3b3b3b', field: '#1b1b1b', stroke: '#363636', stroke2: '#4a4a4a', div: '#2d2d2d', fly: '#2b2b2b', term: '#121212', 'term-line': '#2d2d2d', bar: '#171717' },
    midnight: { base: '#121a29', layer: '#0d1420', card: '#172235', btn: '#213049', 'btn-h': '#2a3b58', field: '#101827', stroke: '#26344b', stroke2: '#364866', div: '#1d293d', fly: '#1b273a', term: '#0a0f19', 'term-line': '#1d293d', bar: '#0d1420' },
  },
  light: {
    grey: { base: '#dcdee4', layer: '#e9ebf0', card: '#ffffff', btn: '#e1e4ea', 'btn-h': '#d3d7df', field: '#ffffff', stroke: '#c4c9d3', stroke2: '#a7adba', div: '#d3d7df', fly: '#ffffff', bar: '#dcdee4', fg: '#1b1d22', mu: '#545a66', mu2: '#848a96' },
    white: { base: '#ededed', layer: '#f6f6f6', card: '#ffffff', btn: '#e9e9e9', 'btn-h': '#dcdcdc', field: '#ffffff', stroke: '#d0d0d0', stroke2: '#b0b0b0', div: '#e0e0e0', fly: '#ffffff', bar: '#ededed', fg: '#1a1a1a', mu: '#555555', mu2: '#8a8a8a' },
    sand: { base: '#e4dccd', layer: '#eee8dc', card: '#fbf8f1', btn: '#e2d9c8', 'btn-h': '#d6ccb8', field: '#fffdf8', stroke: '#cdc2ad', stroke2: '#b1a48b', div: '#dcd2c0', fly: '#fffdf8', bar: '#e4dccd', fg: '#23201a', mu: '#615a4e', mu2: '#958c7d' },
  },
};
const LOOK_NAMES = { obsidian: 'Обсидіан', graphite: 'Графіт', midnight: 'Північ', grey: 'Сіро-біла', white: 'Біла', sand: 'Пісок' };
/** The palette of the theme in use. */
function lookOf(d = dark()) {
  const set = LOOKS[d ? 'dark' : 'light'];
  return set[S?.cfg[d ? 'darkLook' : 'lightLook']] || Object.values(set)[0];
}
function applyBg() {
  const st = document.documentElement.style;
  for (const k of ['base', 'layer', 'card', 'btn', 'btn-h', 'field', 'stroke', 'stroke2', 'div', 'fly', 'term', 'term-line', 'bar', 'fg', 'mu', 'mu2']) st.removeProperty('--' + k);
  // cards are glass over the page: the violet and green glows of the main area shine through them
  const glass = dark() ? { card: 0.7, btn: 0.78, 'btn-h': 0.85 } : { card: 0.74, btn: 0.82, 'btn-h': 0.9 };
  for (const [k, v] of Object.entries(lookOf())) st.setProperty('--' + k, k in glass ? hexA(v, glass[k]) : v);
}
/** "#rrggbb" with an alpha, as rgb(). */
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgb(${n >> 16} ${(n >> 8) & 255} ${n & 255} / ${a})`; };

/** The letter tile of an app without an icon: a muted tile in the hue of its name. */
function tileColors(name) {
  const h = hashHue(name);
  return dark() ? [rgbHex(hsl2rgb(h, 0.16, 0.26)), rgbHex(hsl2rgb(h, 0.32, 0.82))] : [rgbHex(hsl2rgb(h, 0.22, 0.83)), rgbHex(hsl2rgb(h, 0.3, 0.24))];
}
function letterTile(name, cls = '') {
  const [b, f] = tileColors(name || '?');
  return `<span class="ic ${cls}" style="--tb:${b};--tf:${f}">${esc((name || '?').trim().charAt(0).toUpperCase())}</span>`;
}
/** An image tile that falls back to the letter tile when the picture does not load. */
function picTile(src, name, cls = '') {
  const [b, f] = tileColors(name || '?');
  const letter = (name || '?').trim().charAt(0).toUpperCase().replace(/[^\p{L}\p{N}]/u, '?');
  return `<span class="ic pic ${cls}" style="--tb:${b};--tf:${f}"><img src="${esc(src)}" alt="" draggable="false" onerror="this.parentNode.classList.remove('pic');this.parentNode.textContent='${letter}'"></span>`;
}
function iconHtml(a, cls = '') {
  return a.icon ? picTile('icons/' + encodeURIComponent(a.icon), a.name || a.id, cls + (a.kind === 'link' ? ' fav' : '')) : letterTile(a.name || a.id, cls);
}
/** A GitHub owner's avatar (a person's photo is fine here: it stands for the author, not the app). */
function avatarHtml(url, name, cls = '') {
  if (!url) return letterTile(name, 'round ' + cls);
  return `<span class="ic round ${cls}"><img src="${esc(url)}${url.includes('?') ? '&' : '?'}s=96" alt="" draggable="false" loading="lazy"></span>`;
}

// ---------------------------------------------------------------- state

let S = null;
let view = store.get('view', 'home');
let page = null; // {k: 'app', id} | {k: 'repo', full, item} | {k: 'author', login}
let cursor = store.get('sel', null);
let sortBy = store.get('sort', 'group');
let fold = store.get('fold', {});
let hist = store.get('hist', []);
const back = [];
const multi = new Set();
const readmePath = {};
const tabOf = {}, readmes = {}, rels = {}, forksOf = {}, bk = {}, repos = {};
const shapes = {}; // image URL → width / height
let checkProg = null, flashId = null, lastKey = '';
const scrolls = {};
if (['feed', 'attention', 'notinst'].includes(view)) view = 'home';
if (view === 'monitor') view = 'updates';

const disc = Object.assign({ site: 'github', license: '', q: '', sort: 'stars', lang: '', stars: '', updated: '', topic: 'windows', created: '', fork: 'true', owner: '' }, store.get('disc', {}),
  { items: [], total: 0, page: 1, seq: 0, loading: false, err: '', ran: false });

const apps = () => S?.lib.apps ?? [];
/** «GitHub», «GitLab» or «Codeberg» for a repository owner or its full name. */
const siteOf = s => (/^gitlab\.com\//i.test(s || '') ? 'GitLab' : /^codeberg\.org\//i.test(s || '') ? 'Codeberg' : 'GitHub');
/** A «… GitHub» string for the repository's own site. */
const onSite = (key, site) => t(site === 'GitHub' ? key : key.replace('GitHub', site));
/** The page of a repository by its full name. */
const repoUrl = full => (siteOf(full) === 'GitHub' ? `https://github.com/${full}` : `https://${full}`);
const appById = id => apps().find(a => a.id === id);
const groups = () => S?.lib.groups ?? [];
const authors = () => S?.lib.authors ?? [];
const isUpd = a => S?.updates.includes(a.id);
const busyOf = id => (S?.busy[id] ? { ...S.busy[id], key: id } : undefined);
const inLib = full => appById('gh:' + full.toLowerCase());
const LIB_VIEWS = ['all', 'apps', 'picks', 'installed', 'portable', 'setup', 'kit', 'links'];
/** The picks hidden from «All» and the groups (they stay under their own filter). */
let hidePicks = store.get('hidePicks', false);
/** Installed or not, for each list on its own (view → "" — all, "on" — installed, "off" — not installed); links
 *  count as neither and stay. */
let instFilters = store.get('instFilters', {});
const instFilterOf = (v = view) => instFilters[v] || '';
const instOk = (v = view) => x => { const f = instFilterOf(v); return !f || !INSTALLABLE(x) || (f === 'on' ? !!x.inst : !x.inst); };
/** The kit: sections by source ("src") or by group ("grp"); folded sections. */
let kitBy = store.get('kitBy', 'src');
const kitFold = store.get('kitFold', {});
const isList = v => LIB_VIEWS.includes(v) || v.startsWith('g:') || v.startsWith('tag:');

function viewApps(v = view) {
  const a = apps();
  const shown = (hidePicks ? a.filter(x => x.kind !== 'winget') : a).filter(instOk(v));
  if (v === 'all') return shown;
  if (v === 'apps') return a.filter(x => x.kind === 'github' || x.kind === 'page').filter(instOk(v));
  if (v === 'picks') return a.filter(x => x.kind === 'winget').filter(instOk(v));
  if (v === 'updates') return a.filter(isUpd);
  if (v === 'installed') return a.filter(x => x.inst);
  if (v === 'portable') return a.filter(x => x.inst?.method === 'portable');
  if (v === 'setup') return a.filter(x => x.inst && !['portable', 'self'].includes(x.inst.method));
  if (v === 'kit') return a.filter(x => x.kit);
  if (v === 'links') return a.filter(x => x.kind === 'link');
  if (v.startsWith('g:')) return shown.filter(x => x.groups.includes(v.slice(2)));
  if (v.startsWith('tag:')) return shown.filter(x => x.tags.includes(v.slice(4)));
  return [];
}
const YEAR = 365 * 86400000;
/** What is wrong with an app or a link: an abandoned project, a broken signature, a dead page, an error. */
function health(a) {
  const out = [];
  if (a.kind === 'github' || a.kind === 'page') {
    if (a.archived) out.push(t('архів: автор більше не розвиває'));
    else if (a.pushed && Date.now() - Date.parse(a.pushed) > YEAR) out.push(t('не оновлювався понад рік'));
    if (a.latest?.date && Date.now() - Date.parse(a.latest.date) > 2 * YEAR) out.push(t('останній реліз понад 2 роки тому'));
    if (a.inst?.signed === 'bad') out.push(t('пошкоджений підпис'));
    if (a.inst?.vt === 'done' && a.inst.vtHits > 0) out.push(`VirusTotal: ${a.inst.vtHits} / ${a.inst.vtTotal}`);
  } else if (a.dead) out.push(t('посилання не відкривається'));
  // the GitHub request limit passes by itself: it is not something the app needs
  if (a.error && !busyOf(a.id) && !a.dead && !/^GitHub request limit/.test(a.error)) out.push(msg(a.error));
  return out;
}
const TITLES = { home: 'Огляд', all: 'Бібліотека', apps: 'З репозиторіїв', picks: 'З добірки', updates: 'Оновлення', installed: 'Встановлені', portable: 'Портативні', setup: 'Встановлювачі', kit: 'Мій набір', pc: 'Добірка', links: 'Посилання', discover: 'Знайти', authors: 'Автори', tweaks: 'Твіки', newpc: 'Перенесення', settings: 'Налаштування' };
/** The tool of the sidebar a view belongs to (the Stitch layout: library, repositories, sync, tweaks and updates). */
const toolOf = v => v === 'kit' ? 'kit' : isList(v) && !v.startsWith('g:') ? 'all' : ['discover', 'authors', 'pc'].includes(v) ? 'pc' : v;
function viewTitle(v = view) {
  if (TITLES[v]) return t(TITLES[v]);
  if (v.startsWith('g:')) return groups().find(g => g.id === v.slice(2))?.name ?? '';
  if (v.startsWith('tag:')) return '#' + v.slice(4);
  return '';
}
function allTags() {
  const m = new Map();
  for (const a of apps()) for (const tg of a.tags) m.set(tg, (m.get(tg) || 0) + 1);
  return [...m.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
}
const SELF_ID = 'gh:fenderenko/komora';
/** What can be in «My kit»: programs, picks and links (not Komora itself, which is in every bundle anyway). */
const KITABLE = a => a.id !== SELF_ID;
/** What of the kit is installed: programs of repositories and of the picks. */
const INSTALLABLE = a => ['github', 'winget', 'page'].includes(a.kind) && a.id !== SELF_ID;
const kitTweaks = () => S?.lib.kitTweaks || [];
/** The kit's mark: a backpack, with a small green check when the program is in the kit. */
/** «Out of the kit»: the backpack with a small red cross. */
const kitIconOff = () => `<span class="kicon">${ic('kit')}<span class="kb off">${ic('x')}</span></span>`;
const kitIcon = on => `<span class="kicon">${ic('kit')}${on ? `<span class="kb">${ic('check')}</span><span class="kxx">${ic('x')}</span>` : ''}</span>`;
/** A group whose every program is in the kit. */
/** How many of a group's apps and links are in the kit; all — every one of them (and there is at least one). */
const groupKit = gid => { const m = apps().filter(x => x.groups.includes(gid) && x.id !== SELF_ID); const n = m.filter(x => x.kit).length; return { n, of: m.length, all: m.length > 0 && n === m.length }; };
const groupInKit = gid => groupKit(gid).all;
const byName = (x, y) => (x.name || '').localeCompare(y.name || '', L, { sensitivity: 'base' });

/** Where a library entry comes from: repositories, the picks (winget), links — the order of the list's parts. */
const SRC = x => (x.kind === 'github' || x.kind === 'page' ? 0 : x.kind === 'winget' ? 1 : 2);
const SRC_TITLE = ['З репозиторіїв', 'З добірки', 'Посилання'];
/** Rows of a list in display order: [{title?, color?, count?}, app…]; by source (repositories, picks, links), updates first
 *  in each, pinned apps after the others. */
/** The library's own filter (name, owner, description, tags), «» — none. */
let libQ = '';
const libMatch = x => { if (!libQ) return true; const q = libQ.toLowerCase(); return [x.name, x.owner, x.repo, x.desc, ...(x.tags || [])].some(s => (s || '').toLowerCase().includes(q)); };
function listModel() {
  const a = viewApps().filter(libMatch);
  const self = x => x.id === SELF_ID;
  if (sortBy === 'added') a.sort((x, y) => self(y) - self(x) || SRC(x) - SRC(y) || y.added - x.added);
  else a.sort((x, y) => self(y) - self(x) || SRC(x) - SRC(y) || (isUpd(y) - isUpd(x)) || (!!x.pin - !!y.pin) || byName(x, y));
  if (sortBy === 'group' && !view.startsWith('g:') && groups().length) {
    const out = [];
    // inside a group the sources get their own small headings when there are more than one
    const parts = list => (new Set(list.map(SRC)).size < 2 ? list : [0, 1, 2].flatMap(k => { const p = list.filter(x => SRC(x) === k); return p.length ? [{ title: t(SRC_TITLE[k]), count: p.length, sub: true }, ...p] : []; }));
    for (const g of groups()) {
      const in_ = a.filter(x => x.groups.includes(g.id));
      if (in_.length) out.push({ title: g.name, color: g.color, icon: g.icon, grp: true }, ...parts(in_));
    }
    const none = a.filter(x => !self(x) && !x.groups.some(id => groups().some(g => g.id === id)));
    if (none.length) out.push({ title: t('Без групи') }, ...parts(none));
    return a.some(self) ? [a.find(self), ...out.filter(x => !self(x))] : out;
  }
  // one source only: no headings
  if (new Set(a.map(SRC)).size < 2) return a;
  const out = [];
  for (const k of [0, 1, 2]) {
    const part = a.filter(x => SRC(x) === k);
    if (part.length) out.push({ title: t(SRC_TITLE[k]), count: part.length }, ...part);
  }
  return out;
}
const visibleOrder = () => { const seen = new Set(); return listModel().filter(x => x.id && !seen.has(x.id) && seen.add(x.id)); };

// ---------------------------------------------------------------- navigation

function go(v, pg = null, remember = true) {
  if (remember && (v !== view || JSON.stringify(pg) !== JSON.stringify(page))) back.push({ view, page });
  if (back.length > 50) back.shift();
  view = v;
  page = pg;
  store.set('view', v);
  if (toolOf(v) === 'discover') store.set('hub', v);
  multi.clear();
  closeFly();
  render();
}
const setView = v => go(v, null);
function goBack() {
  const b = back.pop();
  if (b) { view = b.view; page = b.page; store.set('view', view); render(); }
  else if (page) { page = null; render(); }
}
/** Opens an app or a link of the library (from any section: a list section stays, others go to «All apps»). */
function openApp(id) {
  const ap = appById(id);
  if (!ap) return;
  // fresh data when a page opens: links after an hour, repositories after six (the GitHub request limit)
  const age = Date.now() / 1000 - (ap.metaAt || 0);
  if ((ap.kind === 'link' && age > 3600) || ((ap.kind === 'github' || ap.kind === 'page') && age > 6 * 3600)) post({ t: 'refresh', id });
  cursor = id;
  store.set('sel', id);
  go(isList(view) && viewApps().some(a => a.id === id) ? view : 'all', { k: 'app', id });
}
function openRepo(full, item) {
  if (repos[full] === undefined) { repos[full] = null; post({ t: 'ghRepo', full }); }
  go('discover', { k: 'repo', full, item: item || disc.items.find(x => x.full === full) || page?.item || null });
}
function openAuthor(login) { go('authors', { k: 'author', login }); }

// ---------------------------------------------------------------- render

function applyTheme() {
  const th = S?.cfg.theme || 'system';
  const d = th === 'system' ? matchMedia('(prefers-color-scheme: dark)').matches : th === 'dark';
  document.documentElement.dataset.theme = d ? 'dark' : 'light';
  // the window's own caption takes the base colour of the theme
  const base = lookOf(d).base;
  if (d !== lastDark || base !== lastBase) { lastDark = d; lastBase = base; post({ t: 'theme', dark: d, base }); }
}
let lastDark = null, lastBase = null;

function render() {
  if (!S) return;
  applyTheme();
  applyAccent();
  applyBg();
  L = ['uk', 'en', ...(window.I18N?.langs || [])].includes(S.cfg.langNow) ? S.cfg.langNow : 'en';
  LI = window.I18N?.langs.indexOf(L) ?? -1;
  document.documentElement.lang = L;
  renderTop();
  renderNav();
  renderMain();
  renderStatus();
}

function renderTop() {
  $('.brand .mark').innerHTML = MARK;
  $('.brand .ver').textContent = String(S.ver).split('.').slice(0, 2).join('.');
  $('#q').placeholder = t('Шукати в бібліотеці й на GitHub');
  // the charge of the devices that report it; a click — their switches in «Settings»
  const bt = S.bt || [];
  const hb = bt.length ? `<button class="hbat" data-act="goDevices" title="${esc(bt.map(d => `${d.name} — ${d.pct} %${d.charging ? ' · ' + t('заряджається') : ''}`).join('\n'))}">${bt.slice(0, 4).map(d => `<span class="hb ${d.charging ? 'chg' : d.pct <= 20 ? 'low' : ''}"><i class="i">${DEV_I[d.kind] || DEV_I.bt}</i><span class="mono">${d.pct}%</span></span>`).join('')}</button>` : '';
  if ($('#hbat').innerHTML !== hb) $('#hbat').innerHTML = hb;
}
/** "2h", "3d" — the time since a moment, short. */
function shortAgo(unix) {
  const s = Date.now() / 1000 - unix;
  if (s < 60) return ue('щойно', 'now');
  if (s < 3600) return Math.round(s / 60) + ue('хв', 'm');
  if (s < 86400) return Math.round(s / 3600) + ue('год', 'h');
  return Math.round(s / 86400) + ue('д', 'd');
}
function statusText() {
  if (S.checking) return t('Перевіряю оновлення…');
  let s = S.lastCheck ? `${t('Перевірено')} ${ago(S.lastCheck)}` : t('ще не перевіряли');
  if (S.lastCheck && S.cfg.checkHours) {
    const next = S.lastCheck + S.cfg.checkHours * 3600;
    s += ` · ${t('наступна')} ${next * 1000 - Date.now() > 60000 ? ago(next) : t('незабаром')}`;
  }
  return s;
}

/** A redraw asked while apps are dragged: done after the drop (the row and the group under the pointer stay put). */
let renderLater = false;
let dragIds = [];
function renderNav() {
  if (dragIds.length || dragGroup) { renderLater = true; return; }
  const a = apps();
  const tool = toolOf(view);
  const n = (v, icon, label, extra = '') => `<div class="n ${tool === v || view === v ? 'on' : ''}" data-view="${esc(v)}">${ic(icon)}<span class="nm">${esc(label)}</span>${extra}</div>`;
  const cnt = c => (c ? `<span class="cnt mono">${c}</span>` : '');
  const badge = (c, cls = '') => (c ? `<span class="badge ${cls} mono">${c}</span>` : '');
  const st = S.sync || {};
  const news = authors().reduce((s2, x) => s2 + (x.news?.length || 0), 0);
  const kitApps = a.filter(x => x.kit && INSTALLABLE(x));
  let h = `<div class="nsec">${t('Головне меню')}</div>`;
  h += n('home', 'home', t('Головна'));
  h += `<div class="n kitnav ${tool === 'kit' ? 'on' : ''}" data-view="kit" data-kitdrop="1" title="${esc(t('Перетягни сюди програми, щоб додати їх у набір'))}">${ic('kit')}<span class="nm">${t('Мій набір')}</span>${cnt(kitApps.length ? `${kitApps.filter(x => x.inst).length}/${kitApps.length}` : '')}</div>`;
  h += n('pc', 'pc', t('Каталог'), news ? `<span title="${esc(t('Нове від авторів, за якими стежиш'))}">${badge(news)}</span>` : '');
  h += n('all', 'box', t('Бібліотека програм'), cnt(a.length));
  h += n('updates', 'download', t('Оновлення'), badge(updCount(), 'warn'));
  h += `<div class="nsec">${t('Система та дані')}</div>`;
  h += n('tweaks', 'tool', t('Цей ПК і твіки'), badge(S.resets, 'warn'));
  h += n('newpc', 'cloud', t('Перенесення і синхронізація'), st.err ? `<span class="cnt" style="color:var(--err)">${ic('warn')}</span>` : '');
  h += `<div class="nh ${fold.groups ? 'fold' : ''}" data-fold="groups"><span class="t">${t('Групи')}</span><button data-act="newGroup" title="${esc(t('Нова група'))}">${ic('add')}</button><i class="i chev">${I.chevD}</i></div>`;
  if (!fold.groups) {
    for (const g of groups())
      h += `<div class="n ${view === 'g:' + g.id ? 'on' : ''}" data-view="g:${esc(g.id)}" data-group="${esc(g.id)}">${groupMark(g)}<span class="nm">${esc(g.name)}</span>${cnt(a.filter(x => x.groups.includes(g.id)).length)}${groupInKit(g.id) ? `<span class="gkit" title="${esc(t('Уся група в моєму наборі'))}">${kitIcon(true)}</span>` : ''}</div>`;
    if (!groups().length) h += `<div class="m" style="padding:4px 12px">${t('Створи групу й перетягни туди програми')}</div>`;
  }
  h += `<div class="navfoot">${n('settings', 'settings', t('Налаштування'))}</div>`;
  const nav = $('#nav');
  if (nav.innerHTML !== h) { const sc = nav.scrollTop; nav.innerHTML = h; nav.scrollTop = sc; }
}

function renderStatus() {}

/** The main area: rebuilt only when its content changed and the user is not typing in it. */
function renderMain(force = false) {
  if (dragIds.length || dragGroup) { renderLater = true; return; }
  const el = $('#main');
  const focus = document.activeElement;
  if (!force && focus && el.contains(focus) && /INPUT|TEXTAREA|SELECT/.test(focus.tagName) && focus.type !== 'checkbox') return;
  const key = view + '|' + JSON.stringify(page && { ...page, item: undefined });
  const html = mainHtml();
  if (key !== lastKey) {
    scrolls[lastKey] = el.scrollTop;
    el.innerHTML = html;
    el.scrollTop = page ? 0 : scrolls[key] || 0;
    lastKey = key;
  } else if (el.innerHTML !== html) {
    const sc = el.scrollTop;
    el.innerHTML = html;
    el.scrollTop = sc;
  }
  if (flashId) {
    const r = el.querySelector(`.r[data-id="${CSS.escape(flashId)}"]`);
    if (r) { r.classList.add('flash'); r.scrollIntoView({ block: 'nearest' }); }
    flashId = null;
  }
}
// the browser rewrites some markup; compare with what it made, not with the string (a template is inert: no loads)
const _norm = document.createElement('template');
/** The header of a page: its title, one line under it (always there: every page's filters start at the same
 *  height) and the page's own buttons on the right. */
function phead(title, sub = '', actions = '', eyebrow = '') {
  return `<div class="phead"><div class="grow">${eyebrow ? `<div class="eyebrow mono">${eyebrow}</div>` : ''}<h1>${title}</h1><div class="sub">${sub || '&nbsp;'}</div></div>${actions ? `<div class="row wrap pact">${actions}</div>` : ''}</div>`;
}
function mainHtml() {
  const h = mainRaw();
  _norm.innerHTML = h;
  return _norm.innerHTML;
}
function mainRaw() {
  if (page?.k === 'app' && appById(page.id)) { const a = appById(page.id); return a.kind === 'link' ? linkPage(a) : a.kind === 'winget' ? wgAppPage(a) : appPage(a); }
  if (page?.k === 'repo') return repoPage();
  if (page?.k === 'wg') return wgPickPage(page.id);
  if (page?.k === 'author') return reposTabs() + authorPage();
  page = null;
  switch (view) {
    case 'home': return dashboard();
    case 'kit': return kitPage();
    case 'pc': return pcPage();
    case 'updates': case 'monitor': return updatesPage();
    case 'discover': return discoverPage();
    case 'authors': return authorsPage();
    case 'tweaks': return tweaksPage();
    case 'newpc': return newPcPage();
    case 'settings': return settingsPage();
    default: return listPage();
  }
}

const STAGE = { queued: 'У черзі', download: 'Завантаження', verify: 'Перевірка файлу', install: 'Встановлення', unpack: 'Розпаковування', meta: 'Дані з GitHub', site: 'Оновлюю дані сайту', uninstall: 'Видалення', rollback: 'Відкат', backup: 'Копіюю налаштування', restore: 'Відновлюю налаштування', vt: 'Перевіряю на VirusTotal' };
const stageText = b => t(STAGE[b.stage] ?? b.stage) + (b.stage === 'download' && b.pct >= 0 ? ` ${Math.round(b.pct * 100)} %` : '…');
const methodLabel = m => t({ installer: 'встановлювач', portable: 'портативна', found: 'знайдено в Windows', self: 'запущена зараз' }[m] ?? m);
const kindLabel = k => t({ msi: 'MSI', setup: 'встановлювач', exe: 'exe', zip: 'портативна (zip)', msix: 'MSIX' }[k] ?? k);
const progHtml = b => { const det = b.pct >= 0 && b.stage === 'download'; return `<div class="prog ${det ? '' : 'ind'}"><i style="width:${det ? Math.round(b.pct * 100) : 30}%"></i></div>`; };

// ---------------------------------------------------------------- the first start

/** What installs right now, as one strip with its progress; `only` narrows it to some ids (the picks). */
function runStrip(only = () => true) {
  const ids = Object.keys(S.busy || {}).filter(id => only(id) && ['download', 'verify', 'install', 'unpack', 'queued'].includes(S.busy[id].stage));
  const run = ids.find(id => S.busy[id].stage !== 'queued') || ids[0];
  if (!run) return '';
  const b = busyOf(run);
  const ap = appById(run);
  const wg = (S.winget?.items || []).find(x => 'wg:' + x.id === run);
  const name = ap?.name || wg?.name || run;
  const det = b.pct >= 0 && b.stage === 'download';
  const more = ids.length > 1 ? `<span class="pill mono">+${ids.length - 1} ${t('у черзі')}</span>` : '';
  return `<section class="card hrun">${ap ? iconHtml(ap, 'sm') : wg?.icon ? picTile('icons/' + encodeURIComponent(wg.icon), wg.name, 'sm') : `<span class="ic sm">${ic('download')}</span>`}<div class="grow"><div class="row" style="gap:8px"><b>${esc(name)}</b>${ap?.latest ? `<span class="pill mono">${esc(verOf(ap.latest.tag))}</span>` : ''}${more}</div><div class="m">${esc(stageText(b))}${wg ? ` · <span class="mono">${esc(wg.id)}</span>` : ''}</div></div><span class="pbar wide"><i style="width:${det ? Math.round(b.pct * 100) : 30}%"></i></span>${det ? `<span class="mono m">${Math.round(b.pct * 100)}%</span>` : ''}${b.stage === 'queued' || b.stage === 'download' ? cancelBtn(run) : ''}</section>`;
}
/** The tab of «Quick access» on «Home»: recent, kit, updates. */
let homeTab = store.get('homeTab', 'recent');
function dashboard() {
  if (!apps().length) return welcome();
  const a = apps();
  const upd = a.filter(isUpd);
  const wu = wgUpdates();
  const st = S.sync || {};
  const where = S.cfg.syncDbx ? 'Dropbox' : S.cfg.syncGist ? 'GitHub Gist' : S.cfg.syncDir ? t('тека в хмарі') : '';
  let h = `<div class="page wide dash home">`;
  if (S.resets) {
    if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); }
    const names = (tweakList || []).filter(x => x.status === 'reset').map(tweakName);
    h += `<div class="info warn"><span class="sign">!</span><div class="grow"><b>${t('Windows скинула твіки')}</b> <span class="m">${esc(names.join(', '))}</span></div><button class="btn sm upd soft" data-act="tweakFix">${t('Повернути')}</button></div>`;
  }
  // the hero: is this PC ready to be reinstalled — the kit saved elsewhere, its groups installed, nothing left outside
  {
    const kit = a.filter(x => x.kit);
    const gk = kit.filter(INSTALLABLE);
    const missing = gk.filter(x => !x.inst);
    const outside = a.filter(x => INSTALLABLE(x) && x.inst && !x.kit);
    const synced = where && !st.err;
    const part = list => list.filter(([n]) => n > 0).map(([n, k]) => nwk(n, k)).join(' · ');
    const counts = part([[gk.length, 'app'], [kit.filter(x => x.kind === 'link').length, 'link'], [authors().filter(x => x.kit).length, 'author'], [kitTweaks().length, 'tweak']]);
    const pillTxt = synced ? `${t('Синхронізовано')} · ${where}${st.okAt ? ' · ' + ago(new Date(st.okAt * 1000).toISOString()) : ''}` : where ? `${t('Синхронізація не вдалася')} · ${where}` : t('Синхронізацію не налаштовано — набір є лише на цьому ПК');
    h += `<section class="hero"><div class="hero-top"><span class="hpill ${synced ? 'ok' : where ? 'err' : 'warn'}"><i class="dot ${synced ? 'ok' : where ? 'err' : 'warn'}"></i>${esc(pillTxt)}</span>${S.cfg.gistId ? `<span class="mono m">Gist ${esc(S.cfg.gistId.slice(0, 4))}…${esc(S.cfg.gistId.slice(-4))}</span>` : ''}</div>`;
    h += `<div class="hero-main"><div class="grow"><h1>${t('Готовність до перевстановлення ПК')}</h1><div class="sub">${esc(counts ? `${t('Мій набір')}: ${counts}` : t('Набір порожній'))}</div></div><div class="row wrap hero-act"><button class="btn" data-act="exportKit">${ic('save')} ${t('Зберегти .zip')}</button>${missing.length ? `<button class="btn acc" data-act="kitInstall">${ic('download')} ${t('Встановити набір')} (${missing.length})</button>` : `<button class="btn acc" data-view="kit">${ic('kit')} ${t('Відкрити набір')}</button>`}</div></div>`;
    // the kit's groups as tiles: ready when all of their kit apps stand here
    const gs = groups().filter(g => kit.some(x => x.groups.includes(g.id)));
    if (gs.length) {
      h += `<div class="eyebrow mono hg">${ic('layers')} ${t('Групи набору')}</div><div class="htiles">`;
      for (const g of gs.slice(0, 6)) {
        const m = gk.filter(x => x.groups.includes(g.id));
        const miss = m.filter(x => !x.inst).length;
        h += `<button class="htile" data-view="g:${esc(g.id)}">${groupMark(g)}<span class="tx"><b>${esc(g.name)}</b><span class="m mono">${esc(nwk(m.length || kit.filter(x => x.groups.includes(g.id)).length, m.length ? 'app' : 'link'))}</span></span><span class="stp ${miss ? 'warn' : 'ok'}">${miss ? `${t('бракує')} ${miss}` : t('Готово')}</span></button>`;
      }
      h += '</div>';
    }
    if (outside.length) h += `<div class="hnote">${ic('add')}<span class="grow"><b>${esc(nwk(outside.length, 'app'))}</b> ${t('встановлено, але не в наборі')}</span><button class="alink" data-act="kitAddInstalled" title="${esc(outside.map(x => x.name).join(', '))}">${t('Додати в один клік')} ${ic('chevR')}</button></div>`;
    h += '</section>';
  }
  // four numbers: installed, updates, this PC, the devices' charge
  {
    const inst = a.filter(x => x.inst);
    const by = [['GitHub', inst.filter(x => x.kind === 'github' || x.kind === 'page').length], [t('Добірка'), inst.filter(x => x.kind === 'winget').length], [t('Портативні'), inst.filter(x => x.inst.method === 'portable').length], [t('Встановлювач'), inst.filter(x => x.kind !== 'winget' && !['portable', 'self'].includes(x.inst.method)).length]];
    h += `<div class="hcards">`;
    h += `<section class="card hc"><div class="hk">${t('Встановлено програм')}</div><div class="hv mono">${inst.length}</div><div class="hsplit">${by.map(([k, n]) => `<span><i class="dot acc"></i>${esc(k)}<b class="mono">${n}</b></span>`).join('')}</div></section>`;
    const n = upd.length + wu.length;
    const bad = a.filter(x => health(x).length);
    h += `<section class="card hc ${n ? 'hupd' : ''}"><div class="hk">${t('Доступні оновлення')}${n ? `<span class="pill warn mono">${n}</span>` : ''}</div>${n ? `<div class="hv mono warnc">${n}</div><div class="m">${esc([...upd.map(x => x.name), ...wu.map(x => x.name)].slice(0, 3).join(', '))}${n > 3 ? '…' : ''}</div><div class="hfoot"><button class="btn upd" data-act="updateAll">${ic('download')} ${t('Оновити все')} (${n})</button></div>` : `<div class="hv okc">${ic('check')}</div><div class="m">${t('Усе актуальне')} · ${esc(statusText())}</div><div class="hfoot"><button class="btn" data-act="check" ${S.checking ? 'disabled' : ''}>${ic('refresh')} ${t('Перевірити зараз')}</button></div>`}${bad.length ? `<button class="alink warnc hattn" data-view="updates">${t('Потребує уваги')} · ${bad.length}</button>` : ''}</section>`;
    const y = S.sys;
    h += `<section class="card hc"><div class="hk">${t('Цей ПК і залізо')}<span class="mono m">${esc(S.pc || '')}</span></div>${y ? `<div class="hfacts">${[['CPU', cpuShort((y.cpu || {}).name)], ['GPU', (y.gpus || [])[0]?.name], ['RAM', y.ram ? fmtSize(y.ram) + (y.mem?.type ? ' ' + y.mem.type : '') : ''], ['OS', y.windows]].filter(([, v]) => v).map(([k, v]) => `<div><span class="mono acck">${k}</span><span class="v" title="${esc(v)}">${esc(v)}</span></div>`).join('')}</div>` : `<div class="m">${t('Дані про залізо ще збираються')}</div>`}<div class="hfoot"><button class="alink" data-view="tweaks">${t('Детальніше й твіки')} ${ic('chevR')}</button></div></section>`;
    const bt = S.bt || [];
    h += `<section class="card hc"><div class="hk">${t('Заряд пристроїв')}${S.cfg.btTray ? `<span class="pill ok mono">${t('у треї')}</span>` : ''}</div>`;
    if (bt.length) h += `<div class="hbt">${bt.slice(0, 4).map(d => `<div class="hbd"><div class="row"><i class="i">${DEV_I[d.kind] || DEV_I.bt}</i><span class="grow">${esc(d.name)}</span><b class="mono ${d.charging ? 'acck' : d.pct <= 20 ? 'errc' : ''}">${d.pct}%</b></div><span class="pbar"><i style="width:${d.pct}%;background:${d.charging ? 'var(--acc)' : d.pct <= 20 ? 'var(--err)' : 'var(--ok)'}"></i></span></div>`).join('')}</div>`;
    else h += `<div class="m">${t(S.cfg.btTray ? 'Зараз жоден пристрій не повідомляє заряд.' : 'Заряд мишей, клавіатур, навушників і геймпадів — значком у треї.')}</div>`;
    h += `<div class="hfoot"><button class="alink" data-act="goDevices">${t('Пристрої')} ${ic('chevR')}</button></div></section>`;
    h += '</div>';
  }
  h += runStrip();
  // quick access to apps on the left; fixes and sync on the right
  h += '<div class="hbottom"><section class="hq">';
  const tabs = [['recent', 'Нещодавні', a.length], ['kit', 'Мій набір', a.filter(x => x.kit && KITABLE(x)).length], ['upd', 'Оновлення', upd.length]];
  h += `<div class="row hqh"><div class="grow"><h2 class="big">${t('Швидкий доступ')}</h2><div class="m">${t('Останні додані й встановлені програми')}</div></div><div class="tabs">${tabs.map(([k, l, c]) => `<button class="${homeTab === k ? 'on' : ''}" data-act="homeTab" data-tab="${k}">${t(l)} <span class="mono m">${c}</span></button>`).join('')}</div></div>`;
  const pool = homeTab === 'kit' ? a.filter(x => x.kit && KITABLE(x)) : homeTab === 'upd' ? upd : a.filter(x => x.id !== SELF_ID);
  const recent = pool.slice().sort((x, y) => Math.max(y.added || 0, y.inst?.at || 0) - Math.max(x.added || 0, x.inst?.at || 0)).slice(0, 5);
  h += recent.length ? `<div class="list">${recent.map(x => rowHtml(x, 'home')).join('')}</div>` : `<div class="m" style="padding:16px 4px">${t('Тут поки порожньо')}</div>`;
  h += `<button class="alink hall" data-view="all">${t('Відкрити всю бібліотеку')} (${a.length}) ${ic('chevR')}</button></section><div class="hside">`;
  h += `<section class="card"><div class="hk">${t('Швидкі виправлення')}</div>`;
  const fx = (icon, title, d, attrs) => `<button class="hfix" ${attrs}><i class="i">${I[icon]}</i><span class="tx"><b>${t(title)}</b><span class="m">${t(d)}</span></span>${ic('play')}</button>`;
  h += fx('pc', 'Кеш шейдерів відеокарти', 'NVIDIA, AMD, Intel і DirectX', 'data-act="toolsClean" data-what="shader"');
  h += fx('globe', 'Кеш DNS', 'Сайт не відкривається чи веде на старе місце', 'data-act="fix" data-what="dns"');
  h += fx('shield', 'Системні файли Windows', 'sfc, потім DISM', 'data-act="fix" data-what="sfc"');
  if (S.steam) h += fx('pc', 'Значки ігор Steam', 'Ігри, перенесені на інший диск', 'data-act="steamIconsFix"');
  h += `<button class="btn hall2" data-view="tweaks">${t('Усі виправлення й твіки')} ${ic('chevR')}</button></section>`;
  h += `<section class="card"><div class="hk">${t('Синхронізація')}${where ? `<span class="pill mono ${st.err ? 'warn' : 'ok'}">${esc(where)}</span>` : ''}</div><div class="m">${esc(where ? st.err ? msg(st.err) : `${t('Набір і бібліотека однакові на всіх твоїх ПК')}${st.okAt ? ' · ' + ago(new Date(st.okAt * 1000).toISOString()) : ''}` : t('Синхронізацію не налаштовано — набір є лише на цьому ПК'))}</div><div class="hfoot">${where ? `<button class="btn sm" data-act="syncNow">${ic('refresh')} ${t('Синхронізувати зараз')}</button>` : `<button class="btn sm" data-view="newpc">${t('Налаштувати')}</button>`}</div></section>`;
  return h + '</div></div></div>';
}
/** The makers' driver pages (Komora never flashes a BIOS: the board maker's page and instructions are for that). */
const GPU_PAGE = { nvidia: ['https://www.nvidia.com/en-us/drivers/', 'NVIDIA'], amd: ['https://www.amd.com/en/support/download/drivers.html', 'AMD'], intel: ['https://www.intel.com/content/www/us/en/support/detect.html', 'Intel'] };
const CHIPSET_PAGE = { amd: 'https://www.amd.com/en/support/download/drivers.html', intel: 'https://www.intel.com/content/www/us/en/support/detect.html' };
let showSerials = false;
/** «AMD Ryzen 7 7800X3D 8-Core Processor» → «AMD Ryzen 7 7800X3D». */
const cpuShort = n => (n || '').replace(/\((R|TM)\)/gi, '').replace(/\s+\d+-Core Processor|\s+Processor|\s+CPU.*$/i, '').replace(/\s+/g, ' ').trim();
/** The dashboard's card of this PC: drivers and BIOS on the makers' pages; versions and codes are copied by a click. */
function sysCard(right, full = false) {
  const y = S.sys;
  if (!y) return '';
  const pct = (used, total) => (total ? Math.min(100, Math.round(used / total * 100)) : 0);
  const bar = (used, total) => `<span class="pbar"><i style="width:${pct(used, total)}%;${total && used / total > .9 ? 'background:var(--warn)' : ''}"></i></span>`;
  // a usage line under a bar: «4.0 GB / 16 GB · 25 %»
  const use = (used, total) => `<span class="m mono">${esc(fmtSize(used))} / ${esc(fmtSize(total))} · ${pct(used, total)} %</span>`;
  const cp = v => `data-copy="${esc(v)}" title="${esc(t('Натисни, щоб скопіювати'))}"`;
  const link = (url, label) => (url ? `<a class="sl" data-act="openUrl" data-url="${esc(url)}">${esc(label)} ${ic('open')}</a>` : '');
  const fact = (k, v, lnk, ...lines) => `<div class="sf"><span class="k mono"><span>${esc(k)}</span>${lnk || ''}</span><span class="v" title="${esc(v)}">${esc(v)}</span>${lines.filter(Boolean).join('')}</div>`;
  // parts of a line: text, or [text, true] — that one is copied by a click (a build, a driver version, a code)
  const line = parts => {
    const ps = parts.filter(p => (Array.isArray(p) ? p[0] : p));
    return ps.length ? `<span class="m">${ps.map(p => (Array.isArray(p) ? `<span class="cp" ${cp(p[0])}>${esc(p[0])}</span>` : esc(p))).join(' · ')}</span>` : '';
  };
  // a serial number: blurred in its own card until shown (no card moves), the number in the tooltip meanwhile
  const sr = y.serials || {};
  const serLine = v => (v ? `<span class="m ser1 ${showSerials ? '' : 'blur'}" ${showSerials ? cp(v) : `title="${esc(v)}"`}>${ic('shield')}<span class="sv">${esc(v)}</span></span>` : '');
  const dur = s => { const d = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), mm = Math.floor(s % 3600 / 60); return d ? `${d} ${ue('д', 'd')} ${hh} ${ue('год', 'h')}` : `${hh} ${ue('год', 'h')} ${mm} ${ue('хв', 'min')}`; };
  let h = `<section class="card sys"><div class="row wrap" style="gap:10px"><h2 class="big grow">${ic('pc')} ${esc(S.pc || 'PC')} <button class="btn ico flat" data-act="pcName" title="${esc(t('Назва цього ПК у Komora'))}">${ic('edit')}</button></h2>${right}<button class="btn ico flat pcfold ${store.get('pcFold', true) ? '' : 'on'}" data-act="pcFold" title="${esc(t(store.get('pcFold', true) ? 'Розгорнути' : 'Згорнути'))}">${ic('chevD')}</button></div><div class="sgrid">`;
  if (!full && store.get('pcFold', true)) return h.replace('<div class="sgrid">', `<div class="pcline m">${esc([y.windows, cpuShort((y.cpu || {}).name), (y.gpus || [])[0]?.name, y.ram && fmtSize(y.ram), ...(y.volumes || []).filter(v => /^C/i.test(v.letter || '')).map(v => `${v.letter} ${Math.round((v.total - v.free) / v.total * 100)} %`)].filter(Boolean).join(' · '))}</div>`) + '</section>';
  h += fact('Windows', y.windows || 'Windows', '', line([[y.build, true], S.arch]), line([y.installed ? `${t('Встановлено')} ${dateOf(y.installed)}` : '', y.uptime ? `${t('працює')} ${dur(y.uptime)}` : '']), serLine(sr.pc));
  const c = y.cpu || {};
  const cpuV = /amd/i.test(c.name || '') ? 'amd' : /intel/i.test(c.name || '') ? 'intel' : '';
  const cores = c.pcores ? `${c.pcores}P + ${c.cores - c.pcores}E` : c.cores ? nwk(c.cores, 'core') : '';
  h += fact('CPU', cpuShort(c.name) || '—', link(CHIPSET_PAGE[cpuV], t('Драйвер чипсета')), line([c.uarch, c.arch]), line([cores, c.threads ? nwk(c.threads, 'thread') : '', c.l3 ? `L3 ${fmtSize(c.l3)}` : '']));
  for (const g of (y.gpus || []).slice(0, 2)) {
    const pg = GPU_PAGE[g.vendor];
    h += fact('GPU', g.name, pg ? link(pg[0], `${t('Драйвер')} ${pg[1]}`) : '', line([g.vram ? fmtSize(g.vram) : '', g.mem, g.bus ? `${g.bus} ${t('біт')}` : '']), g.vramUsed != null && g.vram ? bar(g.vramUsed, g.vram) + use(g.vramUsed, g.vram) : '', line([g.driver ? t('драйвер') : '', g.driver ? [g.driver, true] : '']).replace(' · ', ' '));
  }
  if (y.ram) {
    const m = y.mem || {};
    const sticks = m.sticks || [];
    const total = sticks.length ? sticks.reduce((s, x) => s + x, 0) : y.ram;
    const same = sticks.length && sticks.every(x => x === sticks[0]);
    h += fact('RAM', [fmtSize(total), m.type, m.speed ? `${m.speed} ${t('МТ/с')}` : ''].filter(Boolean).join(' '), '',
      line([m.maker, same ? `${sticks.length} × ${fmtSize(sticks[0])}` : sticks.map(fmtSize).join(' + ')]), line([[m.part, true]]),
      bar(y.ram - y.ramFree, y.ram) + use(y.ram - y.ramFree, y.ram), serLine((sr.ram || []).filter(Boolean).join(' · ')));
  }
  const bd = y.board || {};
  if (bd.maker || bd.model) h += fact(t('Плата'), bd.model || bd.maker, link(boardUrl(bd.maker, bd.model || bd.sysModel), t('Драйвери й BIOS')) + hint('Драйвери відеокарти й чипсета та BIOS материнської плати беруться з сайтів виробників. BIOS Komora не прошиває: онови його за інструкцією виробника.'), line([bd.model ? bd.maker : '']), line([bd.bios ? 'BIOS' : '', bd.bios ? [bd.bios, true] : '', bd.biosDate]).replace('BIOS · ', 'BIOS '), serLine(sr.board));
  if (y.volumes?.length) {
    for (const v of y.volumes) {
      const d = v.disk || {};
      const kind = [d.bus, d.pcie, d.media].filter(Boolean).join(' · ');
      h += `<div class="vol" title="${esc(`${fmtSize(v.free)} ${t('вільно з')} ${fmtSize(v.total)}`)}"><div class="vh"><span class="mono vl">${esc(v.letter)}</span><span class="vn">${esc(v.label || t('Локальний диск'))}</span><span class="mono vp">${pct(v.total - v.free, v.total)} %</span></div>${d.name ? `<div class="vd" title="${esc(d.name)}">${esc(d.name)}</div>` : ''}${kind ? `<div class="vk mono">${esc(kind)}</div>` : ''}${bar(v.total - v.free, v.total)}<span class="mono m vf">${esc(fmtSize(v.free))} ${t('вільно')} · ${esc(fmtSize(v.total))}</span>${serLine(d.serial)}</div>`;
    }
  }
  h += '</div>';
  // serial numbers: hidden until asked (they should not end up on a screenshot)
  if (sr.pc || sr.board || (sr.ram || []).some(Boolean) || (y.volumes || []).some(v => v.disk?.serial)) h += `<div class="sers"><button class="btn sm flat" data-act="serials">${ic(showSerials ? 'x' : 'shield')} ${t(showSerials ? 'Сховати серійні номери' : 'Показати серійні номери')}</button></div>`;
  return h + '</section>';
}
function logLine(l) {
  const n = l.n ?? 0, m = l.m ?? 0;
  const text = {
    check: 'komora check',
    found: nwk(n, 'found'),
    releases: `${n} ${t('перевірено')} · ${nwk(m, 'newRel')}`,
    failed: `${n} ${t('не вдалося перевірити')}`,
    prices: `${nwk(n, 'price')} · ${nwk(m, 'lower')}`,
    dead: nwk(n, 'dead'),
    authors: `${nwk(n, 'author')} · ${nwk(m, 'newRepo')}`,
    reset: `${t('Windows скинула твік')}: ${l.text || ''}`,
    sync: `sync → ${l.text || ''}`,
    syncErr: `sync: ${msg(l.text || '')}`,
  }[l.key] ?? l.text ?? '';
  const tag = l.tag === 'cmd' ? '❯' : l.tag;
  return `<div><span class="${esc(l.tag)}">${esc(tag)}</span> ${esc(text)}</div>`;
}
/** The first start: two ways — gather the programs of this PC, or bring a kit made on another one. */
function welcome() {
  const way = (icon, title, d, btns) => `<section class="card way"><div class="row" style="gap:10px"><span class="fic">${ic(icon)}</span><h2 class="big">${t(title)}</h2></div><div class="m" style="margin:6px 0 12px">${t(d)}</div><div class="row wrap">${btns}</div></section>`;
  return `<div class="empty welcome"><span class="mark">${MARK}</span><div class="big">${t('Почни свою комору')}</div>
  <div class="grid2 eq" style="margin-top:18px;text-align:left">
    ${way('pc', 'Це мій ПК', 'Забери програми, які вже стоять, і познач, що має повертатися на кожен твій ПК.', `<button class="btn acc" data-act="wgFindGo">${ic('pc')} ${t('Програми з цього ПК')}</button><button class="btn" data-view="pc">${ic('apps')} ${t('Добірка')}</button>`)}
    ${way('importI', 'Новий чи перевстановлений ПК', 'Відкрий файл перенесення або підключи синхронізацію — Komora запропонує поставити твій набір.', `<button class="btn acc" data-act="openBundle">${ic('importI')} ${t('Відкрити файл перенесення')}</button><button class="btn" data-view="newpc">${ic('cloud')} ${t('Синхронізація')}</button>`)}
  </div>
  <div class="row" style="margin-top:18px"><input class="inp" id="firstUrl" placeholder="${esc(t('Або встав посилання на GitHub чи сайт'))}"><button class="btn" data-act="firstAdd">${t('Додати')}</button></div></div>`;
}

// ---------------------------------------------------------------- lists of the library

function rowMeta(a) {
  const b = busyOf(a.id);
  if (b) return esc(stageText(b));
  if (a.kind === 'link') {
    if (a.dead) return `<i class="sdot err"></i><span class="er">${t('не відкривається')}</span>`;
    return esc(hostOf(a.url));
  }
  const pin = a.pin ? `<span class="pinm" title="${esc(t('Закріплено на версії'))}">${ic('pin')}</span> ` : '';
  if (isUpd(a)) return `<i class="sdot warn" title="${esc(t('є оновлення'))}"></i>${esc(a.inst.version || verOf(a.inst.tag))} → <span class="up">${esc(verOf(a.latest.tag))}</span>`;
  if (a.inst) return `<i class="sdot ok" title="${esc(t('встановлено'))}"></i>` + pin + esc(a.inst.version || verOf(a.inst.tag) || (unknownVer(a) ? t('версію не визначено') : t('встановлено'))) + (a.inst.method === 'portable' ? ` · ${t('портативна')}` : '');
  if (a.error) return `<i class="sdot err"></i><span class="er">${esc(msg(a.error).slice(0, 70))}</span>`;
  return `<i class="sdot" title="${esc(t('не встановлено'))}"></i>` + esc(a.latest ? `${t('не встановлено')} · ${verOf(a.latest.tag)}` : t('немає релізів'));
}
function rowDesc(a) {
  if (a.kind === 'winget') return esc(t(WG_DESC[a.repo] || '') || a.repo) + (wgLoc[a.repo] && !a.inst ? ` <span class="loc mono">→ ${esc(wgLoc[a.repo])}</span>` : '');
  if (a.kind === 'link') return esc([t({ video: 'Відео' }[a.linkKind] || 'Сторінка'), a.author || a.site].filter(Boolean).join(' · '));
  if (a.kind === 'page') return esc(`${t('Сторінка завантаження')} · ${hostOf(a.url)}`);
  return esc(a.desc || `${a.owner}/${a.repo}`);
}
/** A row of a list. `mode`: "lib" — the library and groups (install, no update: that is on «Updates» and the app's
 *  page), "upd" — «Updates» (the update button), "kit" — «My kit» (only the kit mark; the missing go in one click). */
function rowHtml(a, mode = 'lib') {
  const b = busyOf(a.id);
  const det = b && b.pct >= 0 && b.stage === 'download';
  const bar = b ? `<span class="bar ${det ? '' : 'ind'}"><i style="width:${det ? Math.round(b.pct * 100) : 30}%"></i></span>` : '';
  let act = '';
  if (b && (b.stage === 'queued' || b.stage === 'download')) act = cancelBtn(a.id);
  else if (mode === 'kit') act = '';
  else if (!b && isUpd(a) && mode === 'upd') act = `<button class="btn sm ico flat" data-act="skipId" data-id="${esc(a.id)}" title="${esc(`${t('Пропустити версію')} ${verOf(a.latest.tag)} — ${t('з’явиться знову, коли вийде новіша')}`)}">${ic('eyeOff')}</button><button class="btn sm act upd soft" data-act="installId" data-id="${esc(a.id)}">${ic('download')}<span class="lbl">${t('Оновити')}</span></button>`;
  else if (!b && isUpd(a)) act = `<button class="btn sm act upd soft" data-act="installId" data-id="${esc(a.id)}">${ic('download')}<span class="lbl">${t('Оновити')}</span></button>`;
  else if (!b && a.kind === 'winget' && !a.inst) act = `<span class="split"><button class="btn sm act" data-act="installId" data-id="${esc(a.id)}">${ic('download')}<span class="lbl">${t('Встановити')}</span></button><button class="btn sm ico" data-act="wgInstallTo" data-id="${esc(a.repo)}" title="${esc(t('Встановити в…'))}">${ic('chevD')}</button></span>`;
  else if (!b && (a.kind === 'github' || a.kind === 'page') && !a.inst && S.picks?.[a.id]) act = `<button class="btn sm act" data-act="installId" data-id="${esc(a.id)}">${ic('download')}<span class="lbl">${t('Встановити')}</span></button>`;
  else if (!b && (mode === 'lib' || mode === 'home') && a.inst && a.inst.method !== 'self') act = `<button class="btn sm act" data-act="launchId" data-id="${esc(a.id)}">${ic('play')}<span class="lbl">${t('Запустити')}</span></button>`;
  else if (!b && (mode === 'lib' || mode === 'home') && a.kind === 'link') act = `<button class="btn sm act" data-act="openUrl" data-url="${esc(a.url)}">${ic('open')}<span class="lbl">${t('Відкрити')}</span></button>`;
  const kit = KITABLE(a) && mode !== 'upd' ? `<button class="btn sm ico kitt ${a.kit ? 'on' : ''}" data-act="kitId" data-id="${esc(a.id)}" title="${esc(t(a.kit ? 'Прибрати з набору' : 'Додати в мій набір'))}">${kitIcon(a.kit)}</button>` : '';
  const pills = health(a).length ? `<span class="pill warn">!</span>` : '';
  const cls = `r ${a.id === cursor ? 'on' : ''} ${multi.has(a.id) ? 'multi' : ''}`;
  if (mode === 'lib') {
    const more = `<button class="btn sm ico flat" data-act="rowMenu" data-id="${esc(a.id)}" title="${esc(t('Ще'))}">${ic('more')}</button>`;
    return `<div class="${cls} trow" data-id="${esc(a.id)}" draggable="true"><button class="cbx ${multi.has(a.id) ? 'on' : ''}" data-act="rowPick" data-id="${esc(a.id)}" title="${esc(t('Вибрати'))}">${ic('check')}</button><div class="c-name">${iconHtml(a)}<div class="tx"><div class="nm"><span>${esc(a.name)}</span>${srcPill(a)}${pills}</div><div class="ds">${rowDesc(a)}</div></div></div><div class="c-ver mono">${verCell(a)}</div><div class="c-st">${stateCell(a)}</div><div class="c-sig">${sigCell(a)}</div><div class="c-kit">${kit}</div><div class="acts2">${act}${more}</div>${bar}</div>`;
  }
  return `<div class="${cls}" data-id="${esc(a.id)}" draggable="true">${iconHtml(a)}<div class="tx"><div class="nm"><span>${esc(a.name)}</span>${pills}</div><div class="ds">${rowDesc(a)}</div></div><div class="meta">${rowMeta(a)}</div><div class="acts2">${act}${kit}</div>${bar}</div>`;
}
/** The source of a library entry as a small label of the table. */
const srcPill = a => `<span class="spill">${esc(a.kind === 'winget' ? t('Добірка') : a.kind === 'link' ? t({ video: 'Відео', product: 'Товар' }[a.linkKind] || 'Посилання') : a.kind === 'page' ? t('Сторінка') : a.site ? (a.site.startsWith('gitlab') ? 'GitLab' : 'Codeberg') : 'GitHub')}</span>`;
/** The version column: what is installed, or the latest release. */
function verCell(a) {
  if (a.kind === 'link') return `<span class="m">${esc(hostOf(a.url))}</span>`;
  const cur = a.inst ? a.inst.version || verOf(a.inst.tag) : '';
  if (isUpd(a)) return `<span class="old">${esc(cur)}</span> → <span class="up">${esc(verOf(a.latest.tag))}</span>`;
  if (a.inst) return esc(cur || '—') + (a.pin ? ` <span class="pinm" title="${esc(t('Закріплено на версії'))}">${ic('pin')}</span>` : '');
  return `<span class="m">${esc(a.latest ? verOf(a.latest.tag) : '—')}</span>`;
}
/** The update state column. */
function stateCell(a) {
  const b = busyOf(a.id);
  if (b) return `<span class="stp acc">${esc(stageText(b))}</span>`;
  if (a.kind === 'link') return a.dead ? `<span class="stp err">${t('не відкривається')}</span>` : a.linkKind === 'product' && a.price ? `<span class="stp">${esc(a.price)}</span>` : `<span class="stp">${t('посилання')}</span>`;
  if (a.error && !a.inst) return `<span class="stp err" title="${esc(msg(a.error))}">${t('помилка')}</span>`;
  if (isUpd(a)) return `<span class="stp warn">${t('Є оновлення')}</span>`;
  if (a.inst && a.skip && a.latest?.tag === a.skip) return `<span class="stp">${t('версію пропущено')}</span>`;
  if (a.inst) return `<span class="stp ok">${t('Актуально')}</span>`;
  return `<span class="stp">${t('не встановлено')}</span>`;
}
/** The signature column: Authenticode and VirusTotal of the installed file. */
function sigCell(a) {
  const i = a.inst;
  if (!i || a.kind === 'winget') return '<span class="m">—</span>';
  const vt = i.vt === 'done' ? ` <span class="mono ${i.vtHits ? 'errc' : 'okc'}">VT ${i.vtHits}/${i.vtTotal}</span>` : '';
  if (i.signed === 'trusted') return `<span class="okc" title="${esc(i.signer || '')}">${ic('shield')} ${t('підписано')}</span>${vt}`;
  if (i.signed === 'bad') return `<span class="errc">${ic('warn')} ${t('пошкоджений підпис')}</span>${vt}`;
  if (i.signed === 'unsigned') return `<span class="m">${t('без підпису')}</span>${vt}`;
  return vt || '<span class="m">—</span>';
}

const layout = 'list';
/** One row of filters over the library; the layout and the sort on the right. */
function libToolbar() {
  const a = apps();
  const f = (v, label, c) => `<button class="${view === v ? 'on' : ''}" data-view="${v}">${esc(label)}${c ? `<span class="mono">${c}</span>` : ''}</button>`;
  const nPicks = a.filter(x => x.kind === 'winget').length;
  let h = '<div class="lbar card"><div class="lrow1">';
  h += `<label class="lq">${ic('find')}<input id="libQ" value="${esc(libQ)}" placeholder="${esc(t('Фільтр за назвою, автором, тегом'))}" spellcheck="false" autocomplete="off">${libQ ? `<button data-act="libQx" title="${esc(t('Очистити'))}">${ic('x')}</button>` : ''}</label>`;
  h += '<div class="seg">';
  h += f('all', t('Усі'), hidePicks ? a.length - nPicks : a.length);
  h += f('apps', t('З репозиторіїв'), a.filter(x => x.kind === 'github' || x.kind === 'page').length);
  if (nPicks) h += f('picks', t('З добірки'), nPicks);
  h += f('links', t('Посилання'), a.filter(x => x.kind === 'link').length);
  h += '</div><span class="grow"></span>';
  const instF = instFilterOf();
  const inst = a.filter(x => INSTALLABLE(x) && x.inst).length, notInst = a.filter(x => INSTALLABLE(x) && !x.inst).length;
  h += `<div class="seg ist">${[['on', 'Встановлені', inst], ['off', 'Не встановлені', notInst]].map(([k, l, c]) => `<button class="${instF === k ? 'on' : ''}" data-act="instFilter" data-f="${k}" title="${esc(t(instF === k ? 'Показати всі' : l))}">${t(l)}<span class="mono">${c}</span></button>`).join('')}</div>`;
  if (a.some(x => x.kind === 'winget')) h += `<button class="btn ico flat ${hidePicks ? 'on' : ''}" data-act="hidePicks" title="${esc(t(hidePicks ? 'Показувати програми з добірки в «Усі» й групах' : 'Ховати програми з добірки з «Усі» й груп'))}">${ic('eyeOff')}</button>`;
  h += `<button class="btn ico flat" data-act="sort" title="${esc(t({ name: 'За назвою', group: 'За групами', added: 'Нещодавно додані' }[sortBy]))}">${ic('sort')}</button>`;
  h += '</div>';
  const tags = allTags();
  if (tags.length) h += `<div class="lrow2"><span class="lk">${t('Теги')}</span><div class="gstrip">${tags.slice(0, 24).map(([tg, c]) => `<button class="tchip ${view === 'tag:' + tg ? 'on' : ''}" data-view="${view === 'tag:' + tg ? 'all' : 'tag:' + esc(tg)}">#${esc(tg)} <span class="mono">${c}</span></button>`).join('')}</div></div>`;
  return h + '</div>';
}
function listPage() {
  if (!apps().length && view === 'all') return welcome();
  const items = visibleOrder();
  const a = apps();
  const inGroup = view.startsWith('g:');
  let h = '<div class="page wide lib">';
  const acts = `<button class="btn" data-act="importMenu">${ic('importI')} ${t('Імпорт')}</button><button class="btn acc" data-act="addNew">${ic('add')} ${t('Додати програму чи посилання')}</button>`;
  if (inGroup) h += phead(`<span class="ghm">${groupMark(groups().find(g => g.id === view.slice(2)) || {})}</span>${esc(viewTitle())}`, `${t('Група')} · <span class="mono">${items.length}</span>`, `${groupHeadKit(view.slice(2))}<button class="btn" data-act="addToGroupPick">${ic('add')} ${t('Додати в цю групу')}</button><button class="btn ico" data-act="groupCtx" title="${esc(t('Група'))}">${ic('more')}</button>`, t('Бібліотека програм'));
  else h += phead(`${t('Бібліотека програм')} <span class="hcount mono">${a.length}</span>`, t('Твої програми й посилання: Komora ставить їх, оновлює й переносить на новий ПК'), acts);
  if (!inGroup) {
    const inst = a.filter(x => x.inst);
    const kitN = a.filter(x => x.kit && KITABLE(x)).length;
    const signed = inst.filter(x => x.inst.signed === 'trusted').length;
    const src = [['GitHub', a.filter(x => x.kind === 'github' || x.kind === 'page').length], [t('Добірка'), a.filter(x => x.kind === 'winget').length], [t('Посилання'), a.filter(x => x.kind === 'link').length]];
    h += `<div class="stats">
      <button class="stat" data-view="updates"><span class="sk">${t('Потребують оновлення')}${ic('download')}</span><span class="sv mono ${S.updates.length ? 'warnc' : ''}">${S.updates.length}</span></button>
      <button class="stat" data-view="kit"><span class="sk">${t('У моєму наборі')}${ic('kit')}</span><span class="sv mono">${kitN}<small>/ ${a.length}</small></span></button>
      <div class="stat"><span class="sk">${t('Перевірений підпис')}${ic('shield')}</span><span class="sv mono okc">${signed}<small>/ ${inst.length} ${t('встановлених')}</small></span></div>
      <div class="stat"><span class="sk">${t('Джерела')}${ic('layers')}</span><span class="srcs">${src.map(([k, n]) => `<span class="mono"><b>${n}</b> ${esc(k)}</span>`).join('')}</span></div>
    </div>`;
  }
  h += libToolbar();
  if (!items.length) return h + emptyView() + '</div>';
  const allOn = items.length && items.every(x => multi.has(x.id));
  h += `<div class="list ltable"><div class="thead"><button class="cbx ${allOn ? 'on' : ''}" data-act="pickAll" title="${esc(t('Вибрати всі'))}">${ic('check')}</button><span>${t('Назва й джерело')}</span><span class="c-ver">${t('Версія')}</span><span class="c-st">${t('Стан')}</span><span class="c-sig">${t('Підпис')}</span><span>${t('Набір')}</span><span class="rt">${t('Дії')}</span></div>`;
  for (const x of listModel()) h += x.id ? rowHtml(x) : `<div class="gt ${x.sub ? 'sub' : ''}">${x.grp ? groupMark(x) : ''}${esc(x.title)}${x.count ? `<span class="mono">${x.count}</span>` : ''}</div>`;
  h += `</div><div class="lfoot m mono">${t('Показано')} ${items.length} / ${a.length}</div>`;
  if (multi.size) {
    const allKit = [...multi].map(appById).every(x => x?.kit);
    const anyUpd = [...multi].map(appById).some(x => x && isUpd(x));
    h += `<div class="bulk"><span class="bsel"><i class="dot acc"></i>${t('Обрано')} <b class="mono">${multi.size}</b></span><button class="btn sm" data-act="bulkKit">${ic('kit')} ${t(allKit ? 'Прибрати з набору' : 'У мій набір')}</button>${anyUpd ? `<button class="btn sm upd" data-act="bulkUpdate">${ic('download')} ${t('Оновити')}</button>` : ''}<button class="btn sm" data-act="bulkGroup">${ic('layers')} ${t('У групу')}</button><button class="btn sm" data-act="bulkShare">${ic('link')} ${t('Поділитися')}</button><button class="btn sm danger" data-act="bulkRemove">${t('Прибрати')}</button><button class="btn sm ico flat" data-act="pickNone" title="${esc(t('Зняти вибір'))}">${ic('x')}</button></div>`;
  }
  return h + '</div>';
}

/** The tabs of «Find»: GitHub and GitLab search, the authors followed. */
function reposTabs() {
  const tab = (on, attrs, icon, label, extra = '') => `<button class="${on ? 'on' : ''}" ${attrs}>${icon}<span>${esc(label)}</span>${extra ? `<span class="mono cnt">${extra}</span>` : ''}</button>`;
  const repo = view === 'discover';
  const news = authors().reduce((s2, x) => s2 + (x.news?.length || 0), 0);
  return `<div class="tabs top" role="tablist">${tab(view === 'pc' && !page, 'data-view="pc"', ic('pc'), t('Добірка'))}${tab(repo && disc.site !== 'gitlab', 'data-act="hubSite" data-site="github"', `<i class="i">${GH_SVG}</i>`, 'GitHub')}${tab(repo && disc.site === 'gitlab', 'data-act="hubSite" data-site="gitlab"', `<i class="i">${GL_SVG}</i>`, 'GitLab')}${tab(view === 'authors' || page?.k === 'author', 'data-view="authors"', ic('user'), t('Автори'), news ? `+${news}` : authors().length || '')}</div>`;
}

// ---------------------------------------------------------------- «For PC»: everyday programs through winget

let wgAsked = false;
/** The category of the picks shown ("" — all). */
let pickCat = store.get('pickCat', '');
const WG_ICON = { hw: 'pc', games: 'play', chat: 'note', media: 'video', tools: 'tool', web: 'globe', runtime: 'box' };
// the dashboard's memory, video memory and disks: read again every 3 s while it is on screen
setInterval(() => { if (S && view === 'tweaks' && !page && document.visibilityState === 'visible') post({ t: 'sysLive' }); }, 3000);
/** What winget tells about each package (`winget show`), asked once per run. */
const wgInfo = {};
/** Upkeep of «Tweaks»: { sizes: {shader, temp} }; null — not asked yet. */
let toolsInfo = null;
/** The folder picked for a program of the picks before its install ("Install to…"). */
const wgLoc = {};
/** The cancel button of an install that is queued or downloading. */
const cancelBtn = id => `<button class="btn sm cancelb" data-act="cancel" data-id="${esc(id)}" title="${esc(t('Скасувати встановлення'))}">${ic('x')}<span class="lbl">${t('Скасувати')}</span></button>`;
const wgAllUpdates = () => (S?.winget?.items || []).filter(x => x.has && x.latest && x.skip !== x.latest);
/** winget updates of packages outside the library (the library's own are in S.updates). */
const wgUpdates = () => wgAllUpdates().filter(x => !appById('wg:' + x.id));
/** Every update the PC has: the library's and the picks' outside it (one number on the sidebar, the dashboard and «Update all»). */
const updCount = () => (S?.updates.length || 0) + wgUpdates().length;
const WG_CATS = { hw: 'Драйвери й залізо', games: 'Ігри', chat: 'Спілкування', media: 'Стрім і медіа', tools: 'Утиліти', web: 'Браузери', runtime: 'Бібліотеки' };
const WG_DESC = {
  'Wagnardsoft.DisplayDriverUninstaller': 'Повністю прибирає драйвер відеокарти перед чистим встановленням',
  'Guru3D.Afterburner': 'Розгін і криві вентиляторів відеокарти',
  'Guru3D.RTSS': 'Лічильник FPS і обмеження кадрів в іграх',
  'CPUID.CPU-Z': 'Процесор, пам’ять і материнська плата',
  'TechPowerUp.GPU-Z': 'Усе про відеокарту та її датчики',
  'REALiX.HWiNFO': 'Датчики й температури всього ПК',
  'CPUID.HWMonitor': 'Температури, напруги, вентилятори',
  'CrystalDewWorld.CrystalDiskInfo': 'Здоров’я дисків (SMART)',
  'CrystalDewWorld.CrystalDiskMark': 'Швидкість дисків',
  'Intel.IntelDriverAndSupportAssistant': 'Драйвери Intel для цього ПК',
  'Valve.Steam': 'Магазин і бібліотека ігор',
  'EpicGames.EpicGamesLauncher': 'Магазин Epic Games',
  'ElectronicArts.EADesktop': 'Ігри EA',
  'Ubisoft.Connect': 'Ігри Ubisoft',
  'GOG.Galaxy': 'Ігри без DRM і всі бібліотеки разом',
  'Discord.Discord': 'Голос і чати',
  'Telegram.TelegramDesktop': 'Месенджер',
  'OBSProject.OBSStudio': 'Запис і стрім',
  'VideoLAN.VLC': 'Відтворює будь-яке відео',
  'Spotify.Spotify': 'Музика',
  '7zip.7zip': 'Архіви',
  'Microsoft.PowerToys': 'Корисні дрібниці від Microsoft',
  'voidtools.Everything': 'Миттєвий пошук файлів',
  'Notepad++.Notepad++': 'Текстовий редактор',
  'Mozilla.Firefox': 'Браузер', 'Google.Chrome': 'Браузер', 'Brave.Brave': 'Браузер',
  'Microsoft.VCRedist.2015+.x64': 'Потрібна багатьом іграм і програмам',
  'Microsoft.DirectX': 'Старі бібліотеки DirectX для ігор',
  'Microsoft.DotNet.DesktopRuntime.8': 'Потрібен програмам на .NET',
  'TechPowerUp.NVCleanstall': 'Драйвер NVIDIA без зайвих складників',
  'Nvidia.PhysX': 'Фізика PhysX, потрібна деяким іграм',
  'Rem0o.FanControl': 'Керування вентиляторами за кривими',
  'LibreHardwareMonitor.LibreHardwareMonitor': 'Датчики ПК, відкритий код',
  'OCBase.OCCT.Personal': 'Стрес-тест і перевірка стабільності',
  'Maxon.CinebenchR23': 'Тест швидкості процесора',
  'Blizzard.BattleNet': 'Ігри Blizzard',
  'RockstarGames.Launcher': 'Ігри Rockstar',
  'Amazon.Games': 'Ігри Prime Gaming',
  'ItchIo.Itch': 'Інді-ігри',
  'Playnite.Playnite': 'Усі бібліотеки ігор в одному місці',
  'HeroicGamesLauncher.HeroicGamesLauncher': 'Ігри Epic, GOG і Amazon без їхніх програм',
  'Nvidia.GeForceNow': 'Хмарні ігри NVIDIA',
  'Parsec.Parsec': 'Гра й робота на віддаленому ПК',
  'TeamSpeakSystems.TeamSpeakClient': 'Голосовий зв’язок для ігор',
  'Mumble.Mumble.Client': 'Голосовий зв’язок, відкритий код',
  'OpenWhisperSystems.Signal': 'Захищений месенджер',
  'Zoom.Zoom': 'Відеодзвінки',
  'SlackTechnologies.Slack': 'Робочі чати',
  'Streamlabs.Streamlabs': 'Стрім із готовими оверлеями',
  'ShareX.ShareX': 'Знімки й записи екрана',
  'clsid2.mpc-hc': 'Легкий відеоплеєр',
  'CodecGuide.K-LiteCodecPack.Standard': 'Кодеки для будь-якого відео',
  'PeterPawlowski.foobar2000': 'Аудіоплеєр',
  'Audacity.Audacity': 'Запис і монтаж звуку',
  'HandBrake.HandBrake': 'Перекодування відео',
  'GIMP.GIMP.3': 'Редактор зображень',
  'AntibodySoftware.WizTree': 'Що займає місце на диску',
  'Microsoft.VisualStudioCode': 'Редактор коду',
  'Microsoft.Sysinternals.ProcessExplorer': 'Розширений диспетчер завдань',
  'Microsoft.Sysinternals.Autoruns': 'Усе, що запускається з Windows',
  'Bitwarden.Bitwarden': 'Менеджер паролів',
  'KeePassXCTeam.KeePassXC': 'Паролі в локальному файлі',
  'qBittorrent.qBittorrent': 'Торент-клієнт без реклами',
  'AnyDesk.AnyDesk': 'Віддалений доступ до ПК',
  'Rufus.Rufus': 'Завантажувальна флешка з Windows',
  'Ventoy.Ventoy': 'Кілька ISO на одній флешці',
  'Proton.ProtonVPN': 'VPN від Proton',
  'Obsidian.Obsidian': 'Нотатки в Markdown',
  'LibreWolf.LibreWolf': 'Firefox без стеження',
  'Vivaldi.Vivaldi': 'Браузер',
  'Zen-Team.Zen-Browser': 'Браузер',
  'Microsoft.VCRedist.2015+.x86': 'Потрібна багатьом іграм і програмам',
  'Microsoft.DotNet.DesktopRuntime.9': 'Потрібен програмам на .NET',
  'Microsoft.XNARedist': 'Потрібен старим інді-іграм',
  'EclipseAdoptium.Temurin.21.JRE': 'Потрібна Minecraft і програмам на Java',
  'Microsoft.EdgeWebView2Runtime': 'Потрібен програмам із вбудованим вебвікном',
  'Orbmu2k.nvidiaProfileInspector': 'Тонкі налаштування драйвера NVIDIA для кожної гри',
  'TorProject.TorBrowser': 'Анонімний браузер',
  'CrystalRich.LockHunter': 'Розблоковує й видаляє файли, зайняті програмами',
  'Klocman.BulkCrapUninstaller': 'Видаляє багато програм разом і їхні залишки',
};
/** One package of the picks. `where`: "pick" — the picks (install only; an installed one opens in the library),
 *  "upd" — «Updates» (the update button). */
function wgRow(x, where = 'pick') {
  const b = busyOf('wg:' + x.id);
  const lib = appById('wg:' + x.id);
  let st, act = '';
  if (b) st = esc(b.stage === 'install' && x.has ? t('Оновлення') + '…' : stageText(b));
  else if (x.has && x.latest) {
    st = `<i class="sdot warn"></i>${esc(x.inst)} → <span class="up">${esc(x.latest)}</span>`;
    act = `${where === 'upd' ? `<button class="btn sm" data-act="wgSkip" data-id="${esc(x.id)}" data-v="${esc(x.latest)}" title="${esc(`${t('Пропустити версію')} ${x.latest} — ${t('з’явиться знову, коли вийде новіша')}`)}">${t('Пропустити')}</button>` : ''}<button class="btn sm act upd soft" data-act="wgInstall" data-id="${esc(x.id)}">${ic('download')}<span class="lbl">${t('Оновити')}</span></button>`;
  } else if (x.has) st = `<i class="sdot ok"></i>${esc(x.inst || t('встановлено'))}`;
  else {
    st = `<i class="sdot"></i>${t('не встановлено')}`;
    act = `<span class="split"><button class="btn sm act" data-act="wgInstall" data-id="${esc(x.id)}">${ic('download')}<span class="lbl">${t('Встановити')}</span></button><button class="btn sm ico" data-act="wgInstallTo" data-id="${esc(x.id)}" title="${esc(t('Встановити в…'))}">${ic('chevD')}</button></span>`;
  }
  if (x.has && !x.latest && !b && where === 'pick') act = '';
  if (where === 'pick' && !b) act += lib ? `<button class="btn sm ico kitt ${lib.kit ? 'on' : ''}" data-act="kitId" data-id="${esc(lib.id)}" title="${esc(t(lib.kit ? 'Прибрати з набору' : 'Додати в мій набір'))}">${kitIcon(lib.kit)}</button>` : `<button class="btn sm ico kitt" data-act="wgKit" data-id="${esc(x.id)}" title="${esc(t('Додати в мій набір — встановиться на новому ПК'))}">${kitIcon(false)}</button>`;
  if (b && (b.stage === 'queued' || b.stage === 'download')) act = cancelBtn('wg:' + x.id);
  const loc = !x.has && !b && wgLoc[x.id] ? `<div class="loc mono" title="${esc(wgLoc[x.id])}">→ ${esc(wgLoc[x.id])} <button class="btn ico flat xs" data-act="wgLocClear" data-id="${esc(x.id)}" title="${esc(t('Як пропонує встановлювач'))}">${ic('x')}</button></div>` : '';
  const tile = x.icon ? picTile('icons/' + encodeURIComponent(x.icon), x.name) : letterTile(x.name);
  const det = b && b.stage === 'download' && b.pct >= 0;
  const bar = b ? `<span class="bar ${det ? '' : 'ind'}"><i style="width:${det ? Math.round(b.pct * 100) : 30}%"></i></span>` : '';
  // a click opens the program: in the library when it is there, else its page in the picks
  const open = lib ? `data-open="${esc(lib.id)}"` : `data-wg="${esc(x.id)}"`;
  return `<div class="r wg" ${where === 'pick' ? open : ''}>${tile}<div class="tx"><div class="nm"><span>${esc(x.name)}</span></div><div class="ds">${esc(t(WG_DESC[x.id] || ''))}</div>${loc}</div><div class="meta">${st}</div><div class="acts2">${act}</div>${bar}</div>`;
}
/** A winget package of the library: versions, the action, groups and tags. */
function wgAppPage(a) {
  const b = busyOf(a.id);
  const st = b ? (b.stage === 'install' && a.inst ? t('Оновлення') + '…' : stageText(b)) : isUpd(a) ? `${a.inst.version} → ${verOf(a.latest.tag)}` : a.inst ? a.inst.version : t('не встановлено');
  let act = '';
  if (!b && isUpd(a)) act = `<button class="btn upd" data-act="installId" data-id="${esc(a.id)}">${ic('download')} ${t('Оновити')}</button>`;
  else if (!b && !a.inst) act = `<span class="split"><button class="btn acc" data-act="installId" data-id="${esc(a.id)}">${ic('download')} ${t('Встановити')}</button><button class="btn acc ico" data-act="wgInstallTo" data-id="${esc(a.repo)}" title="${esc(t('Встановити в…'))}">${ic('chevD')}</button></span>`;
  if (!b && a.inst?.exe) act += `<button class="btn" data-act="launchId" data-id="${esc(a.id)}">${ic('play')} ${t('Запустити')}</button>`;
  return `<div class="page">${crumb(a.name)}<div class="ahead">${iconHtml(a, 'lg')}<div class="tx"><h1 title="${esc(a.name)}">${esc(a.name)}</h1><div class="src mono">winget · ${esc(a.repo)}</div><div class="stl mono">${esc(st)}</div><div class="desc">${esc(t(WG_DESC[a.repo] || ''))}</div>${chipsHtml(a)}</div><div class="row" style="align-self:flex-start">${act}${wgInfo[a.repo]?.homepage ? `<button class="btn" data-act="openUrl" data-url="${esc(wgInfo[a.repo].homepage)}">${t('Сайт')} ${ic('open')}</button>` : ''}<button class="btn ico" data-act="appMore" title="${esc(t('Ще'))}">${ic('more')}</button></div></div>${b ? progHtml(b) + (b.stage === 'queued' || b.stage === 'download' ? `<div class="row" style="margin-top:6px">${cancelBtn(b.key)}</div>` : '') : ''}${wgInfoHtml(a.repo)}</div>`;
}
/** What winget tells about a package: publisher, licence, date, the full description and the release notes. */
function wgInfoHtml(pid) {
  const i = wgInfo[pid];
  if (i === undefined) { wgInfo[pid] = null; post({ t: 'wgShow', id: pid }); }
  if (!i) return `<div class="m" style="margin-top:16px">${t('Завантаження…')}</div>`;
  if (i.err) return '';
  const fact = (k, v) => (v ? `<div class="fact"><div class="k">${k}</div><div class="v">${v}</div></div>` : '');
  let h = '<div class="facts">';
  h += fact(t('Версія'), esc(i.version));
  h += fact(t('Видавець'), i.publisherUrl ? `<a data-act="openUrl" data-url="${esc(i.publisherUrl)}">${esc(i.publisher)}</a>` : esc(i.publisher));
  h += fact(t('Ліцензія'), i.licenseUrl ? `<a data-act="openUrl" data-url="${esc(i.licenseUrl)}">${esc(i.license)}</a>` : esc(i.license));
  h += fact(t('Реліз'), esc(i.date));
  h += fact(t('Встановлювач'), esc(i.type));
  h += '</div>';
  const tags = i.tags ? `<div class="gchips" style="margin-top:10px">${i.tags.split(', ').slice(0, 12).map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : '';
  if (i.desc) h += `<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">${t('Опис')}</h2><div class="pre">${esc(i.desc)}</div>${tags}</div>`;
  if (i.notes || i.notesUrl) h += `<div class="card" style="margin-top:8px"><h2 style="margin-bottom:8px">${t('Що нового')}</h2>${i.notes ? `<div class="pre">${esc(i.notes)}</div>` : ''}${i.notesUrl ? `<div class="row" style="margin-top:10px"><a class="alink" data-act="openUrl" data-url="${esc(i.notesUrl)}">${t('Усі зміни')} →</a></div>` : ''}</div>`;
  return h;
}
/** A package of the picks that is not in the library: what it is, its state and the install. */
function wgPickPage(pid) {
  const x = (S.winget?.items || []).find(w => w.id === pid);
  if (!x) { page = null; return pcPage(); }
  const lib = appById('wg:' + pid);
  if (lib) return wgAppPage(lib);
  const b = busyOf('wg:' + pid);
  const i = wgInfo[pid] || {};
  const st = b ? stageText(b) : x.has ? x.inst || t('встановлено') : t('не встановлено');
  const act = b || x.has ? '' : `<span class="split"><button class="btn acc" data-act="wgInstall" data-id="${esc(pid)}">${ic('download')} ${t('Встановити')}</button><button class="btn acc ico" data-act="wgInstallTo" data-id="${esc(pid)}" title="${esc(t('Встановити в…'))}">${ic('chevD')}</button></span>`;
  const tile = x.icon ? picTile('icons/' + encodeURIComponent(x.icon), x.name, 'lg') : letterTile(x.name, 'lg');
  return `<div class="page">${crumb(x.name)}<div class="ahead">${tile}<div class="tx"><h1 title="${esc(x.name)}">${esc(x.name)}</h1><div class="src mono">winget · ${esc(pid)}</div><div class="stl mono">${esc(st)}</div><div class="desc">${esc(t(WG_DESC[pid] || ''))}</div></div><div class="row" style="align-self:flex-start">${act}${i.homepage ? `<button class="btn" data-act="openUrl" data-url="${esc(i.homepage)}">${t('Сайт')} ${ic('open')}</button>` : ''}</div></div>${b ? progHtml(b) + (b.stage === 'queued' || b.stage === 'download' ? `<div class="row" style="margin-top:6px">${cancelBtn(b.key)}</div>` : '') : ''}${wgInfoHtml(pid)}</div>`;
}
/** The support page of a board maker for a model (a search there when the maker has no direct link). */
function boardUrl(maker, model) {
  const q = encodeURIComponent(model);
  const m = (maker || '').toLowerCase();
  if (m.includes('micro-star') || m.startsWith('msi')) return `https://www.msi.com/search/${q}`;
  if (m.includes('asus')) return `https://www.asus.com/support/search-results/?keyword=${q}`;
  if (m.includes('gigabyte')) return `https://www.gigabyte.com/Search?kw=${q}`;
  if (m.includes('asrock')) return `https://www.asrock.com/support/index.asp?model=${q}`;
  if (m.includes('dell')) return 'https://www.dell.com/support/home';
  if (m.includes('lenovo')) return 'https://pcsupport.lenovo.com';
  if (m.includes('hp') || m.includes('hewlett')) return 'https://support.hp.com/drivers';
  return `https://www.bing.com/search?q=${encodeURIComponent(`${maker} ${model} BIOS`)}`;
}
/** «Picks» in «Find»: everyday programs for a PC through winget; what of them is installed is in the library. */
/** «Catalog»: the picks chosen to install at once (winget ids), the layout and a filter. */
const pickSel = new Set();

let pickQ = '';
function pcPage() {
  const W = S.winget || { items: [] };
  if (W.avail && !W.at && !W.scanning && !wgAsked) { wgAsked = true; post({ t: 'wgScan' }); }
  const ups = W.items.filter(x => x.has && x.latest && x.skip !== x.latest);
  const sel = [...pickSel].filter(id => W.items.some(x => x.id === id && !x.has));
  const acts = `${W.avail ? `<button class="btn" data-act="wgScan" ${W.scanning ? 'disabled' : ''}>${ic('refresh')} ${t(W.scanning ? 'Дивлюся…' : 'Перевірити, що встановлено')}</button>` : ''}${ups.length ? `<button class="btn upd" data-act="wgUpdateAll">${ic('download')} ${t('Оновити встановлені')} (${ups.length})</button>` : ''}<button class="btn acc" data-act="pickInstall" ${sel.length ? '' : 'disabled'}>${ic('download')} ${t('Встановити вибрані')}${sel.length ? ` (${sel.length})` : ''}</button>`;
  let h = `<div class="page wide cat">${phead(t('Каталог'), t('Перевірені програми для ПК: ставляться одним кліком і далі оновлюються з бібліотеки'), acts, `winget · ${W.items.length} ${t('програм')}`)}${reposTabs()}`;
  if (!W.avail) return h + `<div class="info warn"><span class="sign">!</span><div class="grow"><b>${t('winget не знайдено')}</b> <span class="m">${t('Він входить до «Інсталятора застосунків» (App Installer) з Microsoft Store.')}</span></div><button class="btn sm" data-act="openUrl" data-url="ms-windows-store://pdp/?productid=9NBLGGH4NNS1">${t('Відкрити в Store')}</button></div></div>`;
  if (W.err) h += `<div class="info err"><span class="sign">!</span><div class="grow"><b>winget</b> <span class="m">${esc(msg(W.err))}</span></div></div>`;
  if (!W.at && W.scanning) h += `<div class="m" style="padding:14px 4px">${t('Дивлюся, що вже встановлено…')}</div>`;
  // search, categories and the layout
  const cats = Object.entries(WG_CATS).filter(([cat]) => W.items.some(x => x.cat === cat));
  const qm = x => !pickQ || [x.name, x.id, t(WG_DESC[x.id] || '')].some(s => (s || '').toLowerCase().includes(pickQ.toLowerCase()));
  h += `<div class="cbar"><label class="lq wide">${ic('find')}<input id="pickQ" value="${esc(pickQ)}" placeholder="${esc(t('Пошук серед програм добірки, winget ID чи призначення'))}" spellcheck="false" autocomplete="off">${pickQ ? `<button data-act="pickQx" title="${esc(t('Очистити'))}">${ic('x')}</button>` : '<span class="kbd mono">Esc</span>'}</label></div>`;
  if (cats.length) h += `<div class="filters pcats">${[['', 'Усі', 'apps'], ...cats.map(([k, l]) => [k, l, WG_ICON[k]])].map(([k, l, icon]) => `<button class="fchip ${pickCat === k ? 'on' : ''}" data-act="pickCat" data-c="${k}">${ic(icon)}${t(l)}<span class="mono">${k ? W.items.filter(x => x.cat === k).length : W.items.length}</span></button>`).join('')}</div>`;
  h += runStrip(id => id.startsWith('wg:'));
  const shown = W.items.filter(x => (!pickCat || x.cat === pickCat) && qm(x));
  if (!shown.length && W.items.length) h += `<div class="empty"><div class="m">${t('Нічого не знайдено')}</div></div>`;
  if (shown.length) {
    const canSel = shown.filter(x => !x.has);
    const allOn = canSel.length && canSel.every(x => pickSel.has(x.id));
    h += `<div class="list ltable ptable"><div class="thead"><button class="cbx ${allOn ? 'on' : ''}" data-act="pickSelAll" title="${esc(t('Вибрати всі'))}">${ic('check')}</button><span>${t('Програма / winget ID')}</span><span>${t('Категорія')}</span><span class="c-ds">${t('Опис')}</span><span>${t('Версія')}</span><span class="rt">${t('Дії')}</span></div>`;
    for (const x of shown) h += wgTRow(x);
    h += '</div>';
  }
  if (sel.length) h += `<div class="bulk"><span class="bsel"><i class="dot acc"></i>${t('Обрано')} <b class="mono">${sel.length}</b></span><button class="btn sm acc" data-act="pickInstall">${ic('download')} ${t('Встановити вибрані')}</button><button class="btn sm" data-act="pickKit">${ic('kit')} ${t('У мій набір')}</button><button class="btn sm ico flat" data-act="pickSelNone" title="${esc(t('Зняти вибір'))}">${ic('x')}</button></div>`;
  return h + '</div>';
}
/** The pick's buttons: install (with a folder), update, cancel; the kit mark. */
function wgActs(x) {
  const b = busyOf('wg:' + x.id);
  const lib = appById('wg:' + x.id);
  if (b && (b.stage === 'queued' || b.stage === 'download')) return cancelBtn('wg:' + x.id);
  if (b) return '';
  let act = '';
  if (x.has && x.latest) act = `<button class="btn sm act upd soft" data-act="wgInstall" data-id="${esc(x.id)}">${ic('download')}<span class="lbl">${t('Оновити')}</span></button>`;
  else if (!x.has) act = `<span class="split"><button class="btn sm act acc" data-act="wgInstall" data-id="${esc(x.id)}">${ic('download')}<span class="lbl">${t('Встановити')}</span></button><button class="btn sm ico acc" data-act="wgInstallTo" data-id="${esc(x.id)}" title="${esc(t('Встановити в…'))}">${ic('chevD')}</button></span>`;
  act += lib ? `<button class="btn sm ico kitt ${lib.kit ? 'on' : ''}" data-act="kitId" data-id="${esc(lib.id)}" title="${esc(t(lib.kit ? 'Прибрати з набору' : 'Додати в мій набір'))}">${kitIcon(lib.kit)}</button>` : `<button class="btn sm ico kitt" data-act="wgKit" data-id="${esc(x.id)}" title="${esc(t('Додати в мій набір'))}">${kitIcon(false)}</button>`;
  return act;
}
const wgTile = (x, cls = '') => (x.icon ? picTile('icons/' + encodeURIComponent(x.icon), x.name, cls) : letterTile(x.name, cls));
const wgVer = x => (x.has && x.latest ? `<span class="old">${esc(x.inst)}</span> → <span class="up">${esc(x.latest)}</span>` : x.has ? esc(x.inst || t('встановлено')) : '<span class="m">—</span>');
/** A pick as a row of the table. */
function wgTRow(x) {
  const b = busyOf('wg:' + x.id);
  const lib = appById('wg:' + x.id);
  const det = b && b.stage === 'download' && b.pct >= 0;
  const open = lib ? `data-open="${esc(lib.id)}"` : `data-wg="${esc(x.id)}"`;
  return `<div class="r wg trow ${pickSel.has(x.id) ? 'multi' : ''}" ${open}>${!x.has && !b ? `<button class="cbx ${pickSel.has(x.id) ? 'on' : ''}" data-act="pickSel" data-id="${esc(x.id)}" title="${esc(t('Вибрати'))}">${ic('check')}</button>` : '<span></span>'}<div class="c-name">${wgTile(x, 'sm')}<div class="tx"><div class="nm"><span>${esc(x.name)}</span></div><div class="ds mono">${esc(x.id)}</div></div></div><div><span class="spill">${esc(t(WG_CATS[x.cat] || x.cat))}</span></div><div class="c-ds ds">${esc(t(WG_DESC[x.id] || ''))}</div><div class="c-ver mono">${wgVer(x)}</div><div class="acts2">${wgActs(x)}</div>${b ? `<span class="bar ${det ? '' : 'ind'}"><i style="width:${det ? Math.round(b.pct * 100) : 30}%"></i></span>` : ''}</div>`;
}

/** «My kit»: the apps that belong on every PC — how many are here, the missing in one click, what the kit does by itself. */
/** «Set up this PC»: what the kit misses here, what another PC had and an opened file — one list, one button; and
 *  the queue while it is set up. Empty when only the kit misses something: the header's «Install the kit» does that. */
function restoreHtml() {
  const a = apps();
  let h = '';
  // setting up from a bundle: the queue
  if (bundleRun) {
    const ids = bundleRun.ids;
    const done = ids.filter(id => appById(id)?.inst).length;
    const cur = ids.find(id => busyOf(id) && busyOf(id).stage !== 'queued');
    h += `<section class="card pad0 s2"><div class="row" style="padding:14px 18px;border-bottom:1px solid var(--div)"><div class="grow"><h2 class="big">${t('Ставлю набір з')} ${esc(bundleRun.pc || '?')}</h2><div class="m">${t('По одній програмі; налаштування повертаються з копій одразу після встановлення')}</div></div><span class="mono">${done} / ${ids.length}</span></div><div style="height:3px;background:var(--div)"><div style="width:${ids.length ? (done / ids.length) * 100 : 0}%;height:3px;background:var(--acc)"></div></div><div class="grid2" style="gap:0">`;
    for (const id of ids) {
      const a = appById(id), b = busyOf(id);
      const [sign, col, state] = a?.inst ? ['✓', 'var(--ok)', t('готово')] : id === cur ? ['›', 'var(--acc)', stageText(b)] : a?.error ? ['×', 'var(--err)', t('не вдалося')] : ['·', 'var(--mu)', t('у черзі')];
      h += `<div class="qrow"><span class="sign" style="color:${col}">${sign}</span><span class="grow">${esc(a?.name || id)}</span><span class="mono" style="font-size:12px;color:${col}">${esc(state)}</span></div>`;
    }
    h += '</div>';
    if (bundleRun.tweaks.length) h += `<div class="row wrap" style="padding:12px 18px"><b>${t('Твіки з набору')}</b>${bundleRun.tweaks.map(id => `<span class="chip">${esc(tweakName(id))}</span>`).join('')}</div>`;
    h += '</section>';
  }
  const miss = a.filter(x => x.kit && INSTALLABLE(x) && !x.inst);
  const offered = a.filter(x => INSTALLABLE(x) && x.wasInstalled && !x.inst && !x.kit);
  if (!offered.length && !bundlePrev) return h;
  const want = bundlePrev ? bundlePrev.apps.filter(x => ['github', 'winget', 'page'].includes(x.kind) && x.was && !x.here) : [];
  const row = (attr, id, name, note) => `<label class="check"><input type="checkbox" ${attr}="${esc(id)}" checked><span class="grow">${esc(name)}</span><span class="m">${esc(note)}</span></label>`;
  h += `<section class="card s2" id="restore"><h2 class="big">${t('Поставити на цей ПК')}<span class="mono">${miss.length + offered.length + want.length}</span></h2><div class="m">${t('Програми встановляться по одній, твіки з файлу застосуються.')}</div><div class="wgl">`;
  h += miss.map(x => row('data-ri', x.id, x.name, t('з набору'))).join('');
  h += offered.map(x => row('data-ri', x.id, x.name, t('було на іншому ПК'))).join('');
  if (bundlePrev) {
    h += want.map(x => row('data-bi', x.id, x.name, `${t('з файлу')} · ${bundlePrev.pc || '?'}`)).join('');
    h += bundlePrev.tweaks.map(id => row('data-bt', id, tweakName(id), t('твік з файлу'))).join('');
  }
  h += `</div><div class="row wrap" style="margin-top:12px"><button class="btn acc" data-act="restoreGo">${ic('download')} ${t('Поставити вибране')}</button>${bundlePrev ? `<button class="btn" data-act="dropBundle">${t('Закрити файл')}</button>` : ''}</div></section>`;
  return h;
}
function kitPage() {
  if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); }
  const a = apps();
  const prog = a.filter(x => x.kit && INSTALLABLE(x));
  const here = prog.filter(x => x.inst).length;
  const miss = prog.filter(x => !x.inst);
  const c = S.cfg;
  const tgl = (key, label, tip) => `<button class="tgl" data-act="cfgSw" data-key="${key}" title="${esc(t(tip))}"><span class="sw sm ${c[key] ? 'on' : ''}"></span>${t(label)}</button>`;
  const restore = restoreHtml();
  // always there: on a new PC it installs the kit, here it says everything is in place
  const get = `<button class="btn acc" data-act="kitInstall" ${miss.length ? '' : `disabled title="${esc(t('Усе з набору вже встановлено'))}"`}>${ic('download')} ${t('Встановити набір')}${miss.length ? ` (${miss.length})` : ''}</button>`;
  const sub = t('Програми, посилання, автори й твіки, які повертаються одним кліком після чистої Windows чи на новому ПК.');
  const kitIds = a.filter(x => x.kit && KITABLE(x)).map(x => x.id);
  const acts = `<button class="btn" data-act="kitShare" ${kitIds.length ? '' : 'disabled'}>${ic('link')} ${t('Поділитися')}</button><button class="btn" data-act="exportKit">${ic('save')} ${t('Зберегти .zip')}</button>` + (restore.includes('id="restore"') ? '' : get) + `<button class="btn ico" data-act="kitRules" title="${esc(t('Правила набору'))}">${ic('settings')}</button>`;
  let h = `<div class="page wide kitp">${phead(t('Мій набір'), esc(sub), acts, t('Для нового чи перевстановленого ПК'))}${restore}`;
  // readiness: what of the kit stands here, as one bar; the sync on the right
  {
    const links = a.filter(x => x.kit && x.kind === 'link').length;
    const tw = kitTweaks().length;
    const total = prog.length + links + tw + authors().filter(x => x.kit).length;
    const pct = prog.length ? Math.round(here / prog.length * 100) : 100;
    const st = S.sync || {};
    const where = S.cfg.syncDbx ? 'Dropbox' : S.cfg.syncGist ? 'GitHub Gist' : S.cfg.syncDir ? t('тека в хмарі') : '';
    const seg = (n, cls) => (n ? `<i class="${cls}" style="flex:${n}"></i>` : '');
    h += `<div class="kready2"><section class="card kr1"><div class="row" style="gap:14px;align-items:flex-start"><span class="kshield">${ic('shield')}</span><div class="grow"><div class="row" style="gap:8px"><b class="kpct">${pct}% ${t('готовності')}</b>${where && !st.err ? `<span class="pill ok mono">${t('синхронізовано')}</span>` : ''}</div><div class="m">${prog.length ? `${here} ${t('із')} ${prog.length} ${t('програм набору стоять на цьому ПК')}` : t('Набір порожній')}</div></div></div>`;
    h += `<div class="kline"><span class="m mono">${t('Склад набору')}</span><span class="m mono">${total} ${t('усього')}</span></div><div class="kbar">${seg(here, 'a')}${seg(miss.length, 'b')}${seg(tw, 'c')}${seg(links, 'd')}</div>`;
    h += `<div class="klegend"><span><i class="dot acc"></i>${here} ${t('встановлено')}</span><span><i class="dot"></i>${miss.length} ${t('бракує')}</span><span><i class="dot ok"></i>${esc(nwk(tw, 'tweak'))}</span><span><i class="dot" style="background:var(--mu)"></i>${esc(nwk(links, 'link'))}</span></div></section>`;
    h += `<section class="card kr2"><div class="hk">${t('Синхронізація')}${where ? `<span class="pill mono ${st.err ? 'warn' : 'ok'}">${esc(where)}</span>` : ''}</div><div class="m">${esc(where ? st.err ? msg(st.err) : `${t('Набір і бібліотека однакові на всіх твоїх ПК')}${st.okAt ? ' · ' + ago(new Date(st.okAt * 1000).toISOString()) : ''}` : t('Синхронізацію не налаштовано — набір є лише на цьому ПК'))}</div><div class="kopts">${tgl('kitAutoUpdate', 'Оновлювати набір самі', 'Після кожної перевірки нові версії програм набору ставляться без твого кліку')}${tgl('kitAutoInstall', 'Ставити на новому ПК', 'Коли набір приходить із синхронізації чи файлу, відсутні програми встановлюються самі')}</div><button class="alink" data-view="newpc">${t('Перенесення і синхронізація')} ${ic('chevR')}</button></section></div>`;
  }
  const outGroups = groups().filter(g => groupKit(g.id).of && !groupInKit(g.id));
  // the kit's own bar: by source or by group, installed or not
  h += `<div class="toolbar kitf pin"><div class="filters"><span class="flabel">${t('Групувати')}</span><div class="seg">${[['src', 'За джерелом', 'apps'], ['grp', 'За групами', 'layers']].map(([k, l, icon]) => `<button class="${kitBy === k ? 'on' : ''}" data-act="kitBy" data-by="${k}">${ic(icon)}${t(l)}</button>`).join('')}</div><span class="fsep"></span>${[['on', 'Встановлені', 'check'], ['off', 'Не встановлені', 'download']].map(([k, l, icon]) => `<button class="fchip ${instFilterOf('kit') === k ? 'on' : ''}" data-act="instFilter" data-f="${k}">${ic(icon)}${t(l)}</button>`).join('')}</div><div class="tools"><label class="lq">${ic('find')}<input id="kitQ" value="${esc(kitQ)}" placeholder="${esc(t('Пошук у наборі'))}" spellcheck="false" autocomplete="off">${kitQ ? `<button data-act="kitQx" title="${esc(t('Очистити'))}">${ic('x')}</button>` : ''}</label>${outGroups.length ? `<button class="btn ico" data-act="kitAdd" data-kind="group" title="${esc(t('Додати групу'))}">${ic('group')}</button>` : ''}</div></div>`;
  // sections of rows: a heading that folds, its count, «+» to add from the library (a group has ✕ to take it out)
  const head = (key, icon, title, n, tail) => `<div class="sect ksect" data-act="kitFold" data-k="${esc(key)}"><i class="i chev ${kitFold[key] ? 'fold' : ''}">${I.chevD}</i>${icon}<span>${esc(title)}</span><span class="mono">${n}</span><span class="grow"></span>${tail}</div>`;
  const add = kind => `<button class="btn ico flat" data-act="kitAdd" data-kind="${kind}" title="${esc(t('Додати в набір'))}">${ic('add')}</button>`;
  const section = (key, icon, title, rows, tail, empty) => head(key, icon, title, rows.length, tail) + (kitFold[key] ? '' : rows.length ? `<div class="list klist">${rows.join('')}</div>` : `<div class="m kempty">${t(empty)}</div>`);
  const rowsOf = list => list.filter(instOk('kit')).filter(libMatchQ(kitQ)).sort(byName).map(kitCard);
  if (kitBy === 'grp') {
    // every group with kit programs or in the kit itself, then what has no group
    const inKit = a.filter(x => x.kit && x.id !== SELF_ID);
    for (const g of groups().filter(g => inKit.some(x => x.groups.includes(g.id)))) h += section('g:' + g.id, groupMark(g), g.name || t('Група'), rowsOf(inKit.filter(x => x.groups.includes(g.id))), `<button class="btn ico flat" data-act="kitGroupOff" data-id="${esc(g.id)}" title="${esc(t('Прибрати всю групу з набору'))}">${kitIconOff()}</button>`, 'Група порожня');
    h += section('nogroup', ic('apps'), t('Без групи'), rowsOf(inKit.filter(x => !x.groups.some(id => groups().some(g => g.id === id)))), '', 'Порожньо — додай кнопкою +');
  } else {
    const own = kind => rowsOf(a.filter(x => x.kit && (x.kind === kind || (kind === 'github' && x.kind === 'page')) && x.id !== SELF_ID));
    h += section('github', ic('code'), t('З репозиторіїв'), own('github'), add('github'), 'Порожньо — додай кнопкою +');
    h += section('winget', ic('pc'), t('З добірки'), own('winget'), add('winget'), 'Порожньо — додай кнопкою +');
    h += section('link', ic('link'), t('Посилання'), own('link'), add('link'), 'Порожньо — додай кнопкою +');
  }
  const kitBtn = (act, attr) => `<button class="ktgl on" data-act="${act}" ${attr} title="${esc(t('Прибрати з набору'))}"><span class="sw sm on"></span>${t('У наборі')}</button>`;
  h += section('author', ic('user'), t('Автори'), authors().filter(au => au.kit).filter(au => !kitQ || (au.name + au.login).toLowerCase().includes(kitQ.toLowerCase())).map(au => `<div class="kcard r" data-login="${esc(au.login)}"><div class="kc-top">${avatarHtml(au.avatar, au.login)}<div class="tx"><div class="nm"><span>${esc(au.name || au.login)}</span></div><div class="ds mono">github.com/${esc(au.login)}</div></div></div><div class="kc-chips">${au.news?.length ? `<span class="kchip acc">+${au.news.length} ${t('нових')}</span>` : ''}<span class="kchip">${esc(nwk((au.repos || []).length, 'repo'))}</span></div><div class="kc-foot"><span class="m mono">${t('Автор GitHub')}</span>${kitBtn('kitAuthor', `data-login="${esc(au.login)}"`)}</div></div>`), add('author'), 'Порожньо — додай кнопкою +');
  const tws = kitTweaks().map(id => (tweakList || []).find(x => x.id === id)).filter(Boolean);
  h += section('tweak', ic('tool'), t('Твіки'), tws.filter(x => !kitQ || tweakName(x).toLowerCase().includes(kitQ.toLowerCase())).map(x => `<div class="kcard tw-r"><div class="kc-top"><span class="ic"><i class="i">${I.tool}</i></span><div class="tx"><div class="nm"><span>${esc(tweakName(x))}</span></div><div class="ds">${esc((L === 'uk' ? x.ukD : L === 'en' ? x.enD : tx(x.ukD) ?? x.enD) || '')}</div></div></div><div class="kc-foot">${x.status === 'on' || x.status === 'already' ? `<span class="stp ok">${t('застосовано')}</span>` : `<span class="stp">${t('вимкнено')}</span>`}${kitBtn('kitTweak', `data-id="${esc(x.id)}"`)}</div></div>`), add('tweak'), 'Порожньо — додай кнопкою +');
  // quick add: a link or a repository straight into the kit
  h += `<section class="card kadd"><span class="kaddi">${ic('add')}</span><h2 class="big">${t('Швидке додавання до набору')}</h2><div class="m">${t('Встав посилання на репозиторій GitHub, GitLab чи Codeberg або сторінку — воно одразу потрапить у набір.')}</div><div class="row kaddf"><input class="inp mono" id="kitUrl" placeholder="https://github.com/owner/repo" spellcheck="false"><button class="btn acc" data-act="kitUrlAdd">${t('Додати')}</button></div><div class="m">${t('або обери з')} <button class="alink" data-view="pc">${t('Каталогу')}</button> · <button class="alink" data-view="all">${t('Бібліотеки')}</button></div></section>`;
  return h + '</div>';
}
/** A kit entry as a card: where it comes from, what Komora keeps for it, whether it stands here, its kit switch. */
function kitCard(a) {
  const src = a.kind === 'winget' ? a.repo : a.kind === 'link' ? hostOf(a.url) : a.kind === 'page' ? hostOf(a.url) : `${a.owner}/${a.repo}`;
  const chips = [];
  if (isUpd(a)) chips.push(`<span class="kchip warn">${ic('download')} ${t('Є оновлення')} ${esc(verOf(a.latest.tag))}</span>`);
  if (a.pin) chips.push(`<span class="kchip">${ic('pin')} ${t('Закріплено')} ${esc(verOf(a.pin))}</span>`);
  else if (S.cfg.kitAutoUpdate && INSTALLABLE(a)) chips.push(`<span class="kchip acc">${ic('refresh')} ${t('Оновлюється сама')}</span>`);
  if (a.backupAt) chips.push(`<span class="kchip ok">${ic('save')} ${t('Копія налаштувань')} · ${esc(ago(new Date(a.backupAt * 1000).toISOString()))}</span>`);
  const where = a.kind === 'link' ? `<span class="m mono">${esc(t({ video: 'Відео', product: 'Товар' }[a.linkKind] || 'Посилання'))}</span>` : a.inst ? `<span class="m mono">${esc(a.inst.version || verOf(a.inst.tag) || t('встановлено'))}</span>` : `<span class="warnc kmiss">${t('Не встановлено на цьому ПК')}</span>`;
  return `<div class="kcard r ${multi.has(a.id) ? 'multi' : ''}" data-id="${esc(a.id)}" draggable="true"><div class="kc-top">${iconHtml(a)}<div class="tx"><div class="nm"><span>${esc(a.name)}</span>${a.inst ? `<span class="okc">${ic('check')}</span>` : ''}</div><div class="ds mono">${esc(src)}</div></div></div><div class="kc-chips">${chips.join('')}</div><div class="kc-foot">${where}<button class="ktgl on" data-act="kitId" data-id="${esc(a.id)}" title="${esc(t('Прибрати з набору'))}"><span class="sw sm on"></span>${t('У наборі')}</button></div></div>`;
}
/** A filter by text over names, owners and tags. */
const libMatchQ = q => x => !q || [x.name, x.owner, x.repo, x.desc, ...(x.tags || [])].some(s => (s || '').toLowerCase().includes(q.toLowerCase()));
let kitQ = '';
/** «+» of a section of the kit: what of that kind is not in the kit yet (a click puts one in, the menu stays). */
function kitAddMenu(el, kind) {
  let items = [];
  if (kind === 'group') items = groups().filter(g => groupKit(g.id).of && !groupInKit(g.id)).map(g => ({ label: g.name || t('Група'), mark: groupMark(g), fn: () => post({ t: 'kitGroup', id: g.id, on: true }) }));
  else if (kind === 'author') items = authors().filter(au => !au.kit).map(au => ({ icon: 'user', label: au.name || au.login, keep: true, toggle: true, fn: () => post({ t: 'kitAuthor', login: au.login, on: true }) }));
  else if (kind === 'tweak') items = (tweakList || []).filter(x => !kitTweaks().includes(x.id)).sort((p, q) => (q.status === 'on') - (p.status === 'on')).map(x => ({ icon: 'tool', label: tweakName(x), keep: true, toggle: true, fn: () => post({ t: 'kitTweak', id: x.id, on: true }) }));
  else items = apps().filter(x => !x.kit && (x.kind === kind || (kind === 'github' && x.kind === 'page')) && x.id !== SELF_ID).sort(byName).map(x => ({ label: x.name, mark: iconHtml(x, 'xs'), keep: true, toggle: true, fn: () => edit(x.id, { kit: true }) }));
  if (!items.length) items = [{ head: t('Усе вже в наборі') }];
  menuAt(el, items.slice(0, 60), true);
}

/** Updates: what is ready, checking and its schedule, and what needs attention. */
function updatesPage() {
  const a = apps();
  const upd = a.filter(isUpd);
  const c = S.cfg;
  const sel = `<label class="sched">${ic('clock')}<span>${t('Розклад')}:</span><select class="inp" data-cfg="checkHours">${[[24, 'Щодня'], [168, 'Щотижня'], [720, 'Щомісяця'], [0, 'Вручну']].map(([v, l]) => `<option value="${v}" ${+c.checkHours === v ? 'selected' : ''}>${esc(t(l))}</option>`).join('')}</select></label>`;
  const wu = wgUpdates();
  const all = upd.length + wu.length;
  const inst = a.filter(x => x.inst);
  const sub = all ? `<span class="warnc">● ${esc(nwk(all, 'upd'))}</span> · ${inst.length - upd.length} ${t('програм актуальні')}` : `<span class="okc">● ${t('Усе актуальне')}</span> · ${inst.length} ${t('програм встановлено')}`;
  let h = `<div class="page wide updp">${phead(t('Оновлення'), sub, `<button class="btn" data-act="check" ${S.checking ? 'disabled' : ''}>${ic('refresh')} ${t(S.checking ? 'Перевіряю…' : 'Перевірити зараз')}</button>${sel}${all ? `<button class="btn upd" data-act="updateAll">${ic('download')} ${t('Оновити все')} (${all})</button>` : ''}`, esc(statusText()))}`;
  // what Komora checks before an install, with this PC's numbers
  {
    const signed = inst.filter(x => x.inst.signed === 'trusted').length;
    const vt = inst.filter(x => x.inst.vt === 'done');
    const vtBad = vt.filter(x => x.inst.vtHits > 0).length;
    h += `<section class="card usafe"><span class="kshield ok">${ic('shield')}</span><div class="grow"><div class="row" style="gap:8px"><b>${t('Кожен файл перевіряється перед встановленням')}</b>${vt.length ? `<span class="pill mono ${vtBad ? 'warn' : 'ok'}">VirusTotal ${vt.length - vtBad}/${vt.length}</span>` : ''}</div><div class="m">${t('Підпис Authenticode, SHA-256 проти релізу, а з ключем — VirusTotal. Файл із пошкодженим підписом не встановлюється.')}</div></div><div class="ustat"><span class="m mono">${t('Підписані')}</span><b class="mono okc">${signed}/${inst.length}</b></div><div class="ustat"><span class="m mono">VirusTotal</span><b class="mono ${c.hasVt ? 'okc' : ''}">${c.hasVt ? t('з ключем') : t('без ключа')}</b></div></section>`;
  }
  const running = x => { const b = busyOf(x.id); return b && !quietBusy(b); };
  const runU = upd.filter(running), runW = wu.filter(x => busyOf('wg:' + x.id));
  if (runU.length || runW.length) h += `<div class="sect">${t('Йде зараз')} · ${runU.length + runW.length}</div><div class="list ulist">${runU.map(updRow).join('')}${runW.map(x => wgRow(x, 'upd')).join('')}</div>`;
  const restU = upd.filter(x => !running(x)), restW = wu.filter(x => !busyOf('wg:' + x.id));
  if (restU.length || restW.length) h += `<div class="sect">${t('Очікують встановлення')} · ${restU.length + restW.length}</div><div class="list ulist">${restU.map(updRow).join('')}${restW.map(x => wgRow(x, 'upd')).join('')}</div>`;
  if (!upd.length && !wu.length) {
    const pinned = a.filter(x => x.pin && x.inst && x.latest && x.latest.tag !== x.pin);
    h += `<div class="empty" style="margin:28px auto"><span class="mark" style="background:var(--ok-bg);color:var(--ok)"><i class="i">${I.check}</i></span><div class="big">${t('Усе актуальне')}</div>${pinned.length ? `<div class="m">${t('Закріплено')}: ${pinned.map(x => `${esc(x.name)} ${esc(verOf(x.pin))} (${t('є')} ${esc(verOf(x.latest.tag))})`).join(', ')}</div>` : ''}</div>`;
  }
  const bad = a.filter(x => health(x).length);
  if (bad.length) {
    h += `<div class="sect">${t('Потребує уваги')} · ${bad.length}</div><div class="list ulist">`;
    for (const x of bad) h += `<div class="r urow" data-id="${esc(x.id)}">${iconHtml(x)}<div class="tx"><div class="nm"><span>${esc(x.name)}</span></div><div class="ds warnc">${esc(health(x).join(' · '))}</div></div><div class="acts2"><span class="btn sm">${t('Відкрити')} ${ic('chevR')}</span></div></div>`;
    h += '</div>';
  }
  // versions left out by hand: one click brings each back
  const sk = a.filter(x => x.skip && x.inst && x.latest?.tag === x.skip);
  const skw = (S.winget?.items || []).filter(x => x.has && x.latest && x.skip === x.latest);
  if (sk.length || skw.length) {
    h += `<div class="sect">${t('Пропущені версії')} · ${sk.length + skw.length}</div><div class="list ulist">`;
    for (const x of sk) h += `<div class="r urow" data-id="${esc(x.id)}">${iconHtml(x)}<div class="tx"><div class="nm"><span>${esc(x.name)}</span></div><div class="ds mono">${esc(x.inst.version || verOf(x.inst.tag))} → ${esc(verOf(x.skip))}</div></div><div class="acts2"><button class="btn sm" data-act="unskipId" data-id="${esc(x.id)}">${t('Не пропускати')}</button></div></div>`;
    for (const x of skw) h += `<div class="r urow wg">${x.icon ? picTile('icons/' + encodeURIComponent(x.icon), x.name) : letterTile(x.name)}<div class="tx"><div class="nm"><span>${esc(x.name)}</span></div><div class="ds mono">${esc(x.inst)} → ${esc(x.latest)}</div></div><div class="acts2"><button class="btn sm" data-act="wgSkip" data-id="${esc(x.id)}" data-v="">${t('Не пропускати')}</button></div></div>`;
    h += '</div>';
  }
  return h + histHtml() + '</div>';
}
/** An update of the library as a card: versions, source and signature; what's new, skip, update. */
function updRow(a) {
  const b = busyOf(a.id);
  const det = b && b.pct >= 0 && b.stage === 'download';
  const bar = b ? `<span class="bar ${det ? '' : 'ind'}"><i style="width:${det ? Math.round(b.pct * 100) : 30}%"></i></span>` : '';
  const size = S.picks?.[a.id]?.size;
  const src = a.kind === 'page' ? hostOf(a.url) : a.site ? (a.site.startsWith('gitlab') ? 'GitLab' : 'Codeberg') : 'GitHub Releases';
  const sig = a.inst?.signed === 'trusted' ? `<span class="okc">${ic('check')} ${t('підписано')}${a.inst.signer ? ': ' + esc(a.inst.signer) : ''}</span>` : a.inst?.signed === 'bad' ? `<span class="errc">${t('пошкоджений підпис')}</span>` : '';
  let act;
  if (b && (b.stage === 'queued' || b.stage === 'download')) act = cancelBtn(a.id);
  else if (b) act = `<span class="stp acc">${esc(stageText(b))}</span>`;
  else act = `<button class="btn sm" data-act="relNotes" data-id="${esc(a.id)}">${ic('note')} ${t('Що нового')}</button><button class="btn sm" data-act="skipId" data-id="${esc(a.id)}" title="${esc(`${t('Пропустити версію')} ${verOf(a.latest.tag)} — ${t('з’явиться знову, коли вийде новіша')}`)}">${t('Пропустити')}</button><button class="btn sm upd soft" data-act="installId" data-id="${esc(a.id)}">${ic('download')} ${t('Оновити')}${size ? ` <span class="mono">(${esc(fmtSize(size))})</span>` : ''}</button>`;
  return `<div class="r urow" data-id="${esc(a.id)}">${iconHtml(a)}<div class="tx"><div class="nm"><span>${esc(a.name)}</span><span class="vchg mono"><span class="m">${esc(a.inst.version || verOf(a.inst.tag))}</span> → <span class="up">${esc(verOf(a.latest.tag))}</span></span>${a.latest?.date ? `<span class="m mono">${esc(ago(a.latest.date))}</span>` : ''}</div><div class="ds">${ic('box')} ${esc(src)}${sig ? ' · ' + sig : ''}</div></div><div class="acts2">${act}</div>${bar}</div>`;
}

/** What Komora installed and updated, the newest first (asked for each time «Updates» opens). */
let histList = null, histAll = false;
function histHtml() {
  if (histList === null) { histList = undefined; post({ t: 'hist' }); }
  const list = histList || [];
  if (!list.length) return '';
  const shown = histAll ? list : list.slice(0, 15);
  const ok = list.length;
  let h = `<section class="card uhist"><div class="row uhh">${ic('clock')}<div class="grow"><h2 class="big">${t('Історія оновлень')}</h2><div class="m">${t('Що Komora встановила й оновила на цьому ПК')}</div></div><span class="mono okc">${ok} ${t('записів')}</span></div><div class="list hist">`;
  for (const x of shown) {
    const ap = appById(x.id);
    const ver = x.from ? `${esc(verOf(x.from))} → ${esc(verOf(x.to))}` : `${t('встановлено')} ${esc(verOf(x.to))}`;
    const rb = ap?.inst?.method === 'portable' && ap.inst.prev && x.from && list.find(y => y.id === x.id) === x ? `<button class="btn sm" data-act="rollbackId" data-id="${esc(ap.id)}" title="${esc(`${t('Повернути попередню версію')} ${ap.inst.prev}`)}">${ic('undo')} ${t('Відкотити')}</button>` : '';
    h += `<div class="r" ${ap ? `data-id="${esc(ap.id)}"` : ''}>${ap ? iconHtml(ap) : `<span class="ic">${ic('box')}</span>`}<div class="tx"><div class="nm"><span>${esc(ap?.name || x.name)}</span></div><div class="ds mono">${ver}</div></div><span class="m hwhen" title="${esc(new Date(x.at * 1000).toLocaleString(L))}">${esc(ago(new Date(x.at * 1000).toISOString()))}</span>${rb}</div>`;
  }
  h += '</div>';
  if (list.length > shown.length) h += `<div class="row" style="margin-top:8px"><a class="alink" data-act="histAll">${t('Показати все')} (${list.length})</a></div>`;
  return h + '</section>';
}

function emptyView() {
  const g = view.startsWith('g:') ? 'group' : view.startsWith('tag:') ? 'tag' : view;
  const E = {
    updates: ['check', 'Оновлень немає', 'Усі встановлені програми актуальні.'],
    installed: ['installed', 'Ще нічого не встановлено', 'Тут будуть програми, які ти встановиш через Komora, і ті, що вже є у Windows.'],
    kit: ['kit', 'Набір порожній', 'Познач рюкзаком у списку чи на сторінці програми те, що має бути на кожному ПК, — тут з’явиться кнопка «Встановити набір».'],
    links: ['link', 'Посилань ще немає', 'Додай сайт, відео чи товар: Ctrl+V у вікні або кнопка «Додати».'],
    group: ['group', 'Група порожня', 'Перетягни сюди програми зі списку або додай групу на сторінці програми.'],
  }[g] ?? ['apps', 'Тут порожньо', ''];
  let btns = '';
  if (g === 'updates') btns += `<button class="btn" data-act="check" ${S.checking ? 'disabled' : ''}>${ic('refresh')} ${t('Перевірити зараз')}</button><span class="m">${esc(statusText())}</span>`;
  if (g === 'links') btns += `<button class="btn acc" data-act="addOpen">${ic('add')} ${t('Додати посилання')}</button>`;
  if (g === 'installed' || g === 'all') btns += `<button class="btn" data-view="discover">${ic('disc')} ${t('Знайти нове')}</button>`;
  return `<div class="empty"><span class="mark"><i class="i">${I[E[0]]}</i></span><div class="big">${t(E[1])}</div>${E[2] ? `<div class="m" style="font-size:13px">${t(E[2])}</div>` : ''}<div class="ex">${btns}</div></div>`;
}

// ---------------------------------------------------------------- the page of an app

/** Installed outside Komora, and neither Windows nor the app's files tell a version. */
const unknownVer = a => (a.kind === 'github' || a.kind === 'page') && !!a.inst && !a.inst.tag && !a.inst.version && a.inst.method !== 'self';
/** Busy only with a refresh of its data (GitHub, the site): the app's buttons stay as they are. */
const quietBusy = b => b && (b.stage === 'meta' || b.stage === 'site');
function primary(a) {
  const b = busyOf(a.id);
  if (b && !quietBusy(b)) return { busy: b, icon: 'download', label: stageText(b) };
  if (a.kind === 'link') {
    const k = a.linkKind;
    return { icon: k === 'video' ? 'play' : 'open', label: t(k === 'video' ? 'Дивитись' : 'Відкрити'), fn: () => post({ t: 'open', url: a.url }) };
  }
  const pick = S.picks?.[a.id];
  if (isUpd(a)) return { icon: 'download', upd: true, label: `${t('Оновити до')} ${verOf(a.latest.tag)}`, fn: () => post({ t: 'install', id: a.id }) };
  // a version skipped on «Updates»: not offered there, but here it is one click away
  if (a.inst && a.skip && a.latest?.tag === a.skip && a.inst.tag !== a.skip && !a.pin) return { icon: 'download', upd: true, label: `${t('Оновити до')} ${verOf(a.skip)}`, note: t('версію пропущено в «Оновленнях»'), fn: () => post({ t: 'install', id: a.id }) };
  if (!a.inst && a.latest && pick) return { icon: 'download', label: t('Встановити'), note: [fmtSize(pick.size), kindLabel(pick.kind)].filter(Boolean).join(' · '), fn: () => post({ t: 'install', id: a.id }) };
  if (!a.inst && a.kind === 'page') return { icon: 'globe', label: t('Відкрити сторінку'), note: t('немає файлу для Windows'), fn: () => post({ t: 'open', url: a.url }) };
  if (!a.inst) return { icon: 'globe', label: onSite('Відкрити на GitHub', siteOf(a.owner)), note: a.latest ? t('немає файлу для Windows') : t('немає релізів'), fn: () => post({ t: 'open', url: a.url }) };
  // found on the PC without a version Komora can trust: the newest release is one click away, but it is not
  // counted as an update
  if (unknownVer(a) && a.latest?.tag && S.picks?.[a.id]) return { icon: 'download', upd: true, label: `${t('Оновити до')} ${verOf(a.latest.tag)}`, note: t('версію не визначено'), fn: () => post({ t: 'install', id: a.id }) };
  if (a.inst.exe) return { icon: 'play', label: t('Запустити'), fn: () => post({ t: 'launch', id: a.id }) };
  return { icon: 'folder', label: t('Відкрити теку'), fn: () => post({ t: 'folder', id: a.id }) };
}
function chipsHtml(a) {
  const gs = a.groups.map(id => groups().find(g => g.id === id)).filter(Boolean);
  let h = '<div class="gchips">';
  for (const g of gs) h += `<span class="chip line" data-act="groupMenu"><span class="dot" style="background:${esc(g.color || '#8d9099')}"></span>${esc(g.name)}</span>`;
  h += `<span class="chip" data-act="groupMenu">+ ${t('група')}</span>`;
  for (const tg of a.tags) h += `<span class="chip" data-act="untag" data-tag="${esc(tg)}">#${esc(tg)} <i class="i x">${I.x}</i></span>`;
  return h + `<input class="tagin" data-act="tagin" placeholder="${esc('+ ' + t('тег'))}" maxlength="32"></div>`;
}
function crumb(name) {
  return `<div class="crumb"><a data-act="crumb">${esc(viewTitle())}</a><span class="sep">›</span><b>${esc(name)}</b></div>`;
}
function appPage(a) {
  const inst = a.inst, lt = a.latest, p = primary(a);
  const self = inst?.method === 'self';
  const upd = isUpd(a);
  const state = upd ? `<span class="warnc">${esc(inst.version || verOf(inst.tag))} → ${esc(verOf(lt.tag))}</span>` : inst ? `<span class="okc">●</span> ${esc(inst.version || verOf(inst.tag) || t('версію не визначено'))} · ${esc(methodLabel(inst.method))}` : `${t('не встановлено')}${lt ? ` · ${t('останній')} ${esc(verOf(lt.tag))}` : ''}`;
  let h = `<div class="page">${crumb(a.name)}<div class="ahead">${iconHtml(a, 'lg')}<div class="tx"><h1 title="${esc(a.name)}">${esc(a.name)}</h1><div class="src">${a.kind === 'page' ? `${t('Сторінка завантаження')} · <a data-act="openUrl" data-url="${esc(a.url)}">${esc(hostOf(a.url))}</a>` : `<a data-act="openUrl" data-url="${esc(a.url)}">${esc(a.owner)}/${esc(a.repo)}</a> · ★ ${fmtNum(a.stars || 0)}${a.license ? ' · ' + esc(a.license) : ''}`}</div><div class="stl mono">${state}${quietBusy(busyOf(a.id)) ? ` <span class="m refr">${ic('refresh')} ${esc(stageText(busyOf(a.id)))}</span>` : ''}</div>${a.desc ? `<div class="desc">${esc(a.desc)}</div>` : ''}${chipsHtml(a)}</div>`;
  h += '<div><div class="acts">';
  if (inst?.exe && !self && !p.busy && p.label !== t('Запустити')) h += `<button class="btn" data-act="launch">${t('Запустити')}</button>`;
  const pc = p.upd ? 'upd' : 'acc';
  h += `<div class="split"><button class="btn ${pc}" data-act="primary" ${p.busy ? 'disabled' : ''}>${ic(p.icon)} ${esc(p.label)}</button>${a.kind === 'github' && !self ? `<button class="btn ${pc} ico" data-act="versions" title="${esc(t('Інші версії'))}">${ic('chevD')}</button>` : ''}</div>`;
  if (!self) h += `<button class="btn kitbtn ${a.kit ? 'on' : ''}" data-act="kit" title="${esc(t('Що повернути після перевстановлення Windows чи на новому ПК'))}">${kitIcon(a.kit)} ${t(a.kit ? 'У моєму наборі' : 'У мій набір')}</button>`;
  // the author: followed with one button (a GitHub, GitLab or Codeberg account)
  h += `<button class="btn ico" data-act="appMore" title="${esc(t('Ще'))}">${ic('more')}</button></div>`;
  if (p.busy) h += progHtml(p.busy);
  else if (p.note) h += `<div class="m" style="margin-top:6px;text-align:right">${esc(p.note)}</div>`;
  h += factsHtml(a);
  h += '</div></div>';
  // only what asks for an action
  h += '<div style="margin-top:14px">';
  if (self) h += `<div class="info"><span class="sign">${ic('box')}</span><div class="grow">${t('Це сама Komora. Вона завжди є в бібліотеці й у кожному наборі: на іншому ПК оновлюватиметься, як решта програм. «Оновити» завантажить новий Komora.exe, замінить ним цей і перезапустить програму.')}</div></div>`;
  if (a.error && !busyOf(a.id)) h += `<div class="info err"><span class="sign">!</span><div class="grow">${esc(msg(a.error))}</div><button class="btn sm" data-act="refresh">${t('Спробувати знову')}</button></div>`;
  if (inst?.vt === 'done' && inst.vtHits > 0) h += `<div class="info err"><span class="sign">!</span><div class="grow"><b>VirusTotal: ${inst.vtHits} / ${inst.vtTotal}</b> <span class="m">${t('антивірусів позначили файл. Часто це хибна тривога для відкритих програм, але подивись звіт.')}</span></div><button class="btn sm" data-act="openUrl" data-url="https://www.virustotal.com/gui/file/${esc(inst.sha256)}">${t('Звіт')}</button></div>`;
  const hl = health({ ...a, error: '', inst: inst && { ...inst, vt: '' } });
  if (hl.length) h += `<div class="info warn"><span class="sign">~</span><div class="grow">${esc(hl.join(' · '))}. ${t('Можливо, є живий форк.')}</div><button class="btn sm" data-act="tab" data-tab="forks">${t('Показати форки')}</button></div>`;
  if (a.pin && lt && inst && lt.tag !== a.pin && verOf(lt.tag) !== verOf(inst.version))
    h += `<div class="info"><span class="sign">${ic('pin')}</span><div class="grow">${t('Програма закріплена на')} ${esc(verOf(a.pin))} · ${t('Останній реліз')} ${esc(verOf(lt.tag))}</div><button class="btn sm" data-act="pin">${t('Відкріпити версію')}</button></div>`;
  h += '</div>';
  h += `${tabsHtml(a)}<div class="card" style="margin-top:12px">${paneHtml(a)}</div>`;
  return h + '</div>';
}
/** A few facts beside the app's buttons: how and where it is installed, its signature and VirusTotal, the release. */
function factsHtml(a) {
  const i = a.inst, lt = a.latest, pick = S.picks?.[a.id];
  const rows = [];
  if (i) {
    rows.push([t('Спосіб'), esc(methodLabel(i.method))]);
    if (i.dir) rows.push([t('Тека'), `<a class="alink mono" data-act="folder" title="${esc(i.dir)}">${esc(i.dir.split(/[\\/]/).filter(Boolean).slice(-2).join('\\'))}</a>`]);
    if (i.signed) rows.push([t('Підпис'), i.signed === 'trusted' ? `<span class="okc">${esc(i.signer || t('Дійсний'))}</span>` : i.signed === 'bad' ? `<span class="errc">${t('Пошкоджено')}</span>` : t('Немає')]);
    if (i.vt === 'done') rows.push(['VirusTotal', `<span class="${i.vtHits ? 'errc' : 'okc'}">${i.vtHits} / ${i.vtTotal}</span>`]);
    if (i.at) rows.push([t('Встановлено'), esc(dateOf(i.at))]);
  }
  if (lt?.date) rows.push([t('Реліз'), `${esc(verOf(lt.tag))} · ${esc(ago(lt.date))}`]);
  if (pick?.size && (!i || isUpd(a))) rows.push([t('Розмір'), esc(fmtSize(pick.size))]);
  return rows.length ? `<div class="afacts">${rows.map(([k, v]) => `<span class="m">${k}</span><span>${v}</span>`).join('')}</div>` : '';
}
function safetyCard(a) {
  const i = a.inst;
  const sha = i?.sha256 || (S.picks?.[a.id]?.digest || '').replace(/^sha256:/, '');
  // Authenticode
  let sig, sigCls, sigBadge;
  if (i?.signed === 'trusted') [sig, sigCls, sigBadge] = [`${t('Підписано')}: ${i.signer || ''}`, 'ok', t('Дійсний')];
  else if (i?.signed === 'unsigned') [sig, sigCls, sigBadge] = [t('Без підпису — звично для відкритих програм.'), '', t('Немає')];
  else if (i?.signed === 'bad') [sig, sigCls, sigBadge] = [t('Підпис пошкоджено: файл змінено після підпису.'), 'err', t('Пошкоджено')];
  else [sig, sigCls, sigBadge] = [i ? t('Встановлено до Komora 0.3 — не перевірено.') : t('Підпис і контрольна сума перевіряються під час встановлення.'), '', ''];
  const shaOk = i?.sha256 && S.picks?.[a.id]?.digest;
  // VirusTotal
  let vt = t('Без ключа — пошук за SHA-256 на сайті VirusTotal.'), vtCls = '';
  if (i?.vt === 'done') [vt, vtCls] = [`${i.vtHits} / ${i.vtTotal} ${t('виявлень')}${i.vtAt ? ` · ${ago(new Date(i.vtAt * 1000).toISOString())}` : ''}`, i.vtHits ? 'err' : 'ok'];
  else if (i?.vt === 'queued' || busyOf(a.id)?.stage === 'vt') vt = t('аналізує…');
  else if (i?.vt === 'unknown') vt = t('VirusTotal ще не бачив цей файл.');
  const passed = [i?.signed === 'trusted', !!shaOk, i?.vt === 'done' && !i.vtHits].filter(Boolean).length;
  let btns = '';
  if (sha) btns += `<button class="btn sm" data-act="openUrl" data-url="https://www.virustotal.com/gui/file/${esc(sha)}">${t('Звіт')} ${ic('open')}</button>`;
  if (i && S.cfg.hasVt) btns += `<button class="btn sm" data-act="vtCheck" ${busyOf(a.id) ? 'disabled' : ''}>${t('Перевірити зараз')}</button>`;
  else if (i?.file) btns += `<button class="btn sm" data-act="vtUpload" title="${esc(t('Покаже файл у Провіднику й відкриє сторінку завантаження VirusTotal'))}">${t('Завантажити на перевірку')}</button>`;
  return `<section>
    <div class="secrow"><i class="i ${sigCls}c">${I[sigCls === 'err' ? 'warn' : 'check']}</i><div class="tx"><div class="row"><b>Authenticode</b><span class="grow"></span>${sigBadge ? `<span class="bdg ${sigCls}">${esc(sigBadge)}</span>` : ''}</div><div class="m">${esc(sig)}</div></div></div>
    <div class="secrow"><i class="i ${shaOk ? 'ok' : ''}c">${I.check}</i><div class="tx"><div class="row"><b>SHA-256</b><span class="grow"></span>${shaOk ? `<span class="bdg ok">${t('збіг з релізом')}</span>` : ''}</div>${sha ? `<div class="hash"><span>${esc(sha)}</span><button class="btn sm ico" data-act="copyText" data-text="${esc(sha)}" title="${esc(t('Копіювати'))}">${ic('copy')}</button></div>` : `<div class="m">${t('з’явиться після встановлення')}</div>`}</div></div>
    <div class="secrow"><i class="i ${vtCls}c">${I.shield}</i><div class="tx"><div class="row"><b>VirusTotal</b></div><div class="m">${esc(vt)}</div></div></div>
    ${btns ? `<div class="row wrap" style="margin-top:8px">${btns}</div>` : ''}</section>`;
}
function currentTab(a) {
  if (a.kind === 'page') return tabOf[a.id] === 'settings' ? 'settings' : 'files';
  return tabOf[a.id] ?? (isUpd(a) ? 'news' : 'readme');
}
function tabsHtml(a) {
  const cur = currentTab(a);
  const tb = (k, label) => `<button class="${cur === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${t(label)}</button>`;
  if (a.kind === 'page') return `<div class="tabs" role="tablist">${tb('files', 'Файли')}${tb('settings', 'Параметри')}</div>`;
  return `<div class="tabs" role="tablist">${a.latest ? tb('news', 'Що нового') : ''}${tb('readme', 'Опис')}${tb('releases', 'Релізи')}${cur === 'forks' ? tb('forks', 'Форки') : ''}${tb('settings', 'Параметри')}</div>`;
}
const compareUrl = (a, from, to) => `${siteOf(a.owner) === 'GitHub' ? `https://github.com/${a.owner}/${a.repo}` : `https://${a.owner}/${a.repo}${siteOf(a.owner) === 'GitLab' ? '/-' : ''}`}/compare/${encodeURIComponent(from)}...${encodeURIComponent(to)}`;
function paneHtml(a) {
  let cur = currentTab(a);
  if (cur === 'backup' || cur === 'notes') cur = 'settings';
  if (cur === 'readme') {
    if (readmes[a.id] === undefined) { readmes[a.id] = null; post({ t: 'readme', id: a.id }); }
    const r = readmes[a.id];
    if (r == null) return `<div class="m">${t('Завантаження…')}</div>`;
    if (r.err) return `<div class="m">${esc(msg(r.err))}</div>`;
    return r.html ? `<div class="md">${r.html}</div>` : `<div class="m">${t('README немає')}</div>`;
  }
  if (cur === 'news') {
    const l = a.latest;
    if (!l) return '';
    const from = a.inst?.tag && a.inst.tag !== l.tag ? a.inst.tag : '';
    return `<div class="row" style="margin-bottom:8px;align-items:baseline"><span style="font-size:18px;font-weight:600">${esc(l.name || l.tag)}</span><span class="grow"></span><span class="mono m">${esc(dateOf(Date.parse(l.date) / 1000))} · ${esc(ago(l.date))}</span></div>` +
      (l.notes ? `<div class="md">${clean(l.notes, a)}</div>` : `<div class="m">${t('Опису змін немає')}.</div>`) +
      `<div class="row" style="margin-top:12px"><a class="alink" data-act="openUrl" data-url="${esc(from ? compareUrl(a, from, l.tag) : l.url)}">${onSite(from ? 'Порівняти зміни на GitHub' : 'Реліз на GitHub', siteOf(a.owner))} →</a></div>`;
  }
  if (cur === 'releases') {
    if (rels[a.id] === undefined) { rels[a.id] = null; post({ t: 'releases', id: a.id }); }
    const r = rels[a.id];
    if (r == null) return `<div class="m">${t('Завантаження…')}</div>`;
    if (r.err) return `<div class="m">${esc(msg(r.err))}</div>`;
    if (!r.list.length) return `<div class="m">${t('немає релізів')}</div>`;
    const best = S.picks?.[a.id]?.name;
    const busy = !!busyOf(a.id);
    return r.list.map((rel, i) => {
      const here = a.inst && a.inst.tag === rel.tag;
      const older = r.list[i + 1];
      const files = rel.assets.filter(x => /\.(exe|msi|zip|7z|msix|msixbundle|appx|appxbundle)$/i.test(x.name) && !/linux|macos|darwin|osx|android/i.test(x.name));
      return `<div class="rel"><div class="rh"><span class="tag">${esc(rel.name || rel.tag)}</span>${mono(`<span class="m">${esc(rel.tag)} · ${esc(ago(rel.date))}</span>`)}${rel.prerelease ? `<span class="pill">${t('тестовий')}</span>` : ''}${here ? `<span class="pill acc">${t('Цей реліз встановлено')}</span>` : ''}</div>` +
        (rel.notes ? `<div class="md" data-act="expand">${clean(rel.notes, a)}</div>` : `<div class="m" style="margin-top:4px">${t('Опису змін немає')}${older ? ` · <a class="alink" data-act="openUrl" data-url="${esc(compareUrl(a, older.tag, rel.tag))}">${t('Порівняти з')} ${esc(older.tag)}</a>` : ''}</div>`) +
        `<div class="assets">${files.map(x => `<div class="asset ${i === 0 && x.name === best ? 'best' : ''}"><span class="nm">${esc(x.name)}</span><span class="m mono">${esc(fmtSize(x.size))}</span>${busy ? '' : `<button class="btn sm" data-act="installAsset" data-asset="${esc(x.name)}" data-tag="${esc(rel.tag)}" data-old="${i > 0 && rel.tag !== a.latest?.tag ? 1 : ''}">${t(here ? 'Перевстановити' : 'Встановити')}</button>`}</div>`).join('')}</div></div>`;
    }).join('');
  }
  if (cur === 'files') {
    const files = (a.latest?.assets || []).filter(x => !/linux|macos|darwin|osx|android/i.test(x.name));
    const best = S.picks?.[a.id]?.name, busy = !!busyOf(a.id);
    let h = `<div class="m" style="margin-bottom:8px">${t('Файли для Windows, на які посилається сторінка. Komora перевіряє її разом з оновленнями: новий файл — нова версія.')}</div>`;
    if (!files.length) return h + `<div class="m">${t('немає файлу для Windows')}</div>`;
    return h + `<div class="assets">${files.map(x => `<div class="asset ${x.name === best ? 'best' : ''}"><span class="nm">${esc(x.name)}</span><span class="m mono">${esc(x.size ? fmtSize(x.size) : hostOf(x.url))}</span>${busy ? '' : `<button class="btn sm" data-act="installAsset" data-asset="${esc(x.name)}" data-tag="${esc(a.latest.tag)}">${t(a.inst ? 'Перевстановити' : 'Встановити')}</button>`}</div>`).join('')}</div>`;
  }
  if (cur === 'forks') {
    if (forksOf[a.id] === undefined) { forksOf[a.id] = null; post({ t: 'forks', id: a.id }); }
    return forksHtml(a.id, a.pushed);
  }
  if (cur === 'backup') {
    if (bk[a.id] === undefined) { bk[a.id] = null; post({ t: 'bkSuggest', id: a.id }); }
    return backupHtml(a);
  }
  if (cur === 'notes') return `<textarea class="inp" data-act="notes" placeholder="${esc(t('Мої нотатки — навіщо ця програма, що налаштувати…'))}">${esc(a.notes)}</textarea>`;
  if (cur === 'settings') {
    const seg = (key, cur2, opts) => `<div class="seg">${opts.map(([v, l]) => `<button class="${cur2 === v ? 'on' : ''}" data-act="appSet" data-key="${key}" data-val="${esc(v)}">${t(l)}</button>`).join('')}</div>`;
    let h = '<div class="form">';
    h += `<div>${t('Спосіб встановлення')}</div>${seg('method', a.method || 'auto', [['auto', 'Автоматично'], ['installer', 'Встановлювач'], ['portable', 'Портативна']])}`;
    h += `<div>${t('Файл релізу')}</div><div class="row"><input class="inp" data-act="assetMatch" value="${esc(a.assetMatch || '')}" placeholder="${esc(t('частина назви, напр. x64.zip — порожньо: автоматично'))}"><span class="m mono" style="white-space:nowrap">${esc(S.picks?.[a.id]?.name || '')}</span></div>`;
    h += `<div>${t('Тека встановлення')}</div><div class="row"><span class="path ${a.setupDir ? '' : 'none'}">${esc(a.setupDir || (S.cfg.setupDir ? `${S.cfg.setupDir}\\${a.name}` : t('як пропонує встановлювач')))}</span><button class="btn sm" data-act="pickPath" data-purpose="setupDirApp">${t('Огляд…')}</button>${a.setupDir ? `<button class="btn sm ico" data-act="appClearDir" title="${esc(t('Як у Налаштуваннях'))}">${ic('x')}</button>` : ''}</div>`;
    if (a.kind !== 'page') h += `<div>${t('Тестові релізи')}</div><div class="row"><span class="sw ${a.pre || S.cfg.preAll ? 'on' : ''} ${S.cfg.preAll ? 'busy' : ''}" data-act="appSw" data-key="pre"></span><span class="m">${t(S.cfg.preAll ? 'увімкнено для всіх у Налаштуваннях' : 'пропонувати пре-релізи як оновлення')}</span></div>`;
    if (a.inst) h += `<div>${t('Закріпити на версії')}</div><div class="row"><span class="sw ${a.pin ? 'on' : ''}" data-act="pin"></span><span class="m mono">${esc(a.pin ? verOf(a.pin) : '')}</span></div>`;
    if (a.latest) h += `<div>${t('Пропустити реліз')}</div><div class="row">${a.skip ? `<span class="m">${t('Пропущено')} ${esc(verOf(a.skip))}</span><button class="btn sm" data-act="unskip">${t('Скасувати')}</button>` : `<button class="btn sm" data-act="skip">${t('Пропустити')} ${esc(verOf(a.latest.tag))}</button>`}</div>`;
    h += `<div>${t('Назва')}</div><input class="inp" data-act="rename" value="${esc(a.name)}" maxlength="80">`;
    if (a.inst?.dir) h += `<div>${t('Тека')}</div><div class="row"><a class="path" style="cursor:pointer" data-act="folder">${esc(a.inst.dir)}</a></div>`;
    h += '</div>';
    h += `<div class="psect">${t('Нотатки')}</div><textarea class="inp" data-act="notes" style="height:110px" placeholder="${esc(t('Мої нотатки — навіщо ця програма, що налаштувати…'))}">${esc(a.notes)}</textarea>`;
    if (a.kind === 'github' || a.kind === 'page') {
      if (bk[a.id] === undefined) { bk[a.id] = null; post({ t: 'bkSuggest', id: a.id }); }
      h += `<div class="psect">${t('Копія налаштувань')}</div>${backupHtml(a)}`;
      h += `<div class="psect">${t('Безпека')}</div>${safetyCard(a)}`;
    }
    return h;
  }
  return '';
}
function forksHtml(key, origPushed) {
  const r = forksOf[key];
  if (r == null) return `<div class="m">${t('Завантаження…')}</div>`;
  if (r.err) return `<div class="m">${esc(msg(r.err))}</div>`;
  if (!r.list?.length) return `<div class="m">${t('Форків немає')}</div>`;
  return `<div class="m" style="margin-bottom:8px">${t('Найпопулярніші форки. «Живіший» — оновлювався пізніше за оригінал.')}</div><div class="assets">` + r.list.map(f => {
    const lib = inLib(f.full);
    const alive = origPushed && Date.parse(f.pushed) > Date.parse(origPushed);
    return `<div class="asset"><span class="nm"><b>${esc(f.owner)}</b>/${esc(f.name)} ${alive ? `<span class="pill acc">${t('живіший')}</span>` : ''}</span><span class="m mono">★ ${fmtNum(f.stars)} · ${esc(ago(f.pushed))}</span><button class="btn sm" data-act="repoOpen" data-full="${esc(f.full)}">${t('Детальніше')}</button>${lib ? `<span class="pill acc">${t('У бібліотеці')}</span>` : `<button class="btn sm" data-act="addUrl" data-url="https://github.com/${esc(f.full)}">${t('У бібліотеку')}</button>`}</div>`;
  }).join('') + '</div>';
}
function backupHtml(a) {
  const b = bk[a.id];
  if (b == null) return `<div class="m">${t('Шукаю, де програма тримає налаштування…')}</div>`;
  const row = (kind, p, on) => `<div class="asset"><span class="nm mono" style="font-size:12px">${esc(p)}</span>${on ? `<button class="btn sm ico" data-act="bkDel" data-kind="${kind}" data-p="${esc(p)}" title="${esc(t('Прибрати'))}">${ic('x')}</button>` : `<button class="btn sm" data-act="bkAdd" data-kind="${kind}" data-p="${esc(p)}">${ic('add')} ${t('Додати')}</button>`}</div>`;
  const bp = a.bpaths || [], br = a.breg || [];
  let h = `<div class="m" style="margin-bottom:10px">${t('Теки й гілки реєстру з налаштуваннями програми. Кеші й журнали не копіюються; зберігаються 5 останніх копій.')}</div>`;
  h += `<div style="font-weight:600">${t('Що зберігати')}</div><div class="assets">`;
  if (!bp.length && !br.length) h += `<div class="m">${t('Нічого не вибрано')}</div>`;
  for (const p of bp) h += row('dir', p, true);
  for (const k of br) h += row('reg', k, true);
  h += '</div>';
  const sug = [...b.dirs.filter(d => !bp.includes(d)).map(d => ['dir', d]), ...b.regs.filter(r => !br.includes(r)).map(r => ['reg', r])];
  if (sug.length) h += `<div style="font-weight:600;margin-top:14px">${t('Знайдено на цьому ПК')}</div><div class="assets">${sug.map(([k, p]) => row(k, p, false)).join('')}</div>`;
  h += `<div class="row wrap" style="margin-top:12px"><button class="btn sm" data-act="bkPick">${ic('folder')} ${t('Додати теку…')}</button><input class="inp mono" id="bkReg" placeholder="HKCU\\Software\\…" style="max-width:280px;height:28px"><button class="btn sm" data-act="bkRegAdd">${t('Додати ключ')}</button></div>`;
  h += `<div class="row" style="margin-top:16px"><button class="btn acc" data-act="backup">${ic('save')} ${t('Зберегти копію зараз')}</button><span class="m">${a.backupAt ? `${t('Остання копія')} ${esc(ago(a.backupAt))}` : ''}</span></div>`;
  if (b.list?.length) h += `<div style="font-weight:600;margin-top:16px">${t('Копії')}</div><div class="assets">${b.list.map(x => `<div class="asset"><span class="nm">${esc(new Date(x.at * 1000).toLocaleString(L))}</span><span class="m mono">${esc(fmtSize(x.size))}</span><button class="btn sm" data-act="restore" data-which="${esc(x.dir)}">${t('Відновити')}</button></div>`).join('')}</div>`;
  return h;
}

// ---------------------------------------------------------------- the page of a link

/** The shape of an image (width / height), measured once; undefined while loading. */
function shapeOf(url) {
  if (!(url in shapes)) {
    shapes[url] = undefined;
    const img = new Image();
    img.onload = () => { shapes[url] = img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0; renderMain(); };
    img.onerror = () => { shapes[url] = 0; renderMain(); };
    img.src = url;
  }
  return shapes[url];
}
function linkPage(a) {
  const k = a.linkKind || 'page';
  const kindName = t({ video: 'Відео', product: 'Товар', page: 'Сторінка' }[k]);
  const pv = a.preview ? 'icons/' + encodeURIComponent(a.preview) : '';
  const ratio = pv ? shapeOf(pv) : 0;
  // a wide picture is a banner; a squarish one (a product photo) a large thumbnail next to the name
  const wide = ratio >= 1.6, thumb = ratio > 0 && ratio < 1.6;
  let h = `<div class="page narrow">${crumb(a.name)}`;
  if (wide) h += `<div class="banner" data-act="zoom" data-src="${esc(pv)}"><img src="${esc(pv)}" alt="">${k === 'video' ? `<span class="play">${I.play}</span>` : ''}</div>`;
  const p = primary(a);
  h += `<div class="ahead">${thumb ? `<span class="ic thumb" data-act="zoom" data-src="${esc(pv)}" style="cursor:zoom-in"><img src="${esc(pv)}" alt=""></span>` : iconHtml(a, 'lg')}<div class="tx"><h1 title="${esc(a.name)}">${esc(a.name)}</h1><div class="src"><a data-act="openLink">${esc(hostOf(a.url))}</a> · ${esc(kindName)}${a.author ? ' · ' + esc(a.author) : ''}</div>${a.desc ? `<div class="desc">${esc(a.desc)}</div>` : ''}${chipsHtml(a)}</div>`;
  h += `<div><div class="acts"><button class="btn acc" data-act="primary" ${p.busy ? 'disabled' : ''}>${ic(p.icon)} ${esc(p.label)}</button><button class="btn ico" data-act="linkMore" title="${esc(t('Ще'))}">${ic('more')}</button></div>${p.busy ? progHtml(p.busy) : ''}</div></div>`;
  h += '<div style="margin-top:16px">';
  if (a.dead) h += `<div class="info warn"><span class="sign">×</span><div class="grow"><b>${t('Посилання не відкривається')}</b> <span class="m">${esc(msg(a.error || ''))} · ${t('з')} ${esc(dateOf(a.dead))}</span></div><button class="btn sm" data-act="refresh">${t('Перевірити')}</button></div>`;
  else if (a.error && !busyOf(a.id)) h += `<div class="info err"><span class="sign">!</span><div class="grow">${esc(msg(a.error))}</div><button class="btn sm" data-act="refresh">${t('Спробувати знову')}</button></div>`;
  if (a.dl && !a.dead) h += `<div class="info"><span class="sign">${ic('download')}</span><div class="grow"><b>${t('Сторінка завантаження')}</b> <span class="m">${t('На сторінці є файл для Windows')}: <span class="mono">${esc(a.dl)}</span></span></div><button class="btn sm acc" data-act="pageSource" ${busyOf(a.id) ? 'disabled' : ''}>${t('Встановлювати звідси')}</button></div>`;
  h += '</div><div class="facts" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-top:4px">';
  const fact = (kk, v, note = '', cls = '') => `<div class="fact"><div class="k">${kk}</div><div class="v">${v}</div><div class="h ${cls}">${note}</div></div>`;
  if (k === 'video') {
    h += fact(t('Канал'), esc(a.author || '—')) + fact(t('Платформа'), esc(a.site || hostOf(a.url))) + fact(t('Додано'), esc(dateOf(a.added)));
  } else {
    h += fact(t('Сайт'), esc(a.site || hostOf(a.url))) + fact(t('Додано'), esc(dateOf(a.added)));
  }
  h += '</div>';
  h += `<div class="card" style="margin-top:8px"><h2 style="margin-bottom:8px">${t('Нотатки')}</h2><textarea class="inp" data-act="notes" style="height:140px" placeholder="${esc(t('Мої нотатки — навіщо це, що важливо…'))}">${esc(a.notes)}</textarea></div>`;
  return h + '</div>';
}
// ---------------------------------------------------------------- find new (GitHub search)

const PRESETS = [
  ['Для Windows', { q: '', topic: 'windows', sort: 'stars', stars: '', updated: '', created: '', lang: '' }],
  ['Набирає популярності', { q: '', topic: 'windows', sort: 'stars', stars: '20', updated: '', created: '90', lang: '' }],
  ['Утиліти трею', { q: 'tray', topic: 'windows', sort: 'stars', stars: '', updated: '', created: '', lang: '' }],
  ['Твіки Windows', { q: 'windows 11 tweak debloat', topic: '', sort: 'stars', stars: '100', updated: '365', created: '', lang: '' }],
  ['Нові й живі', { q: '', topic: 'windows', sort: 'updated', stars: '100', updated: '30', created: '', lang: '' }],
];
const LANGS = ['C#', 'C++', 'C', 'Rust', 'Go', 'Python', 'JavaScript', 'TypeScript', 'PowerShell', 'AutoHotkey', 'Dart', 'Java'];
const daysAgo = d => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

function discQuery() {
  const p = [];
  if (disc.q.trim()) p.push(disc.q.trim());
  if (disc.topic) p.push(`topic:${disc.topic}`);
  if (disc.lang) p.push(`language:"${disc.lang}"`);
  if (disc.stars) p.push(`stars:>=${disc.stars}`);
  if (disc.updated) p.push(`pushed:>=${daysAgo(+disc.updated)}`);
  if (disc.created) p.push(`created:>=${daysAgo(+disc.created)}`);
  // GitHub leaves forks out unless asked: "with forks" finds your own fork too
  if (disc.fork === 'true' || disc.fork === 'only') p.push(`fork:${disc.fork}`);
  if (disc.owner.trim()) p.push(`user:${disc.owner.trim().replace(/^@/, '')}`);
  if (disc.license) p.push(`license:${disc.license}`);
  if (!/repo:/.test(disc.q)) p.push('archived:false');
  return p.join(' ');
}
function discSave() {
  const { site, q, sort, lang, stars, updated, topic, created, fork, owner, license } = disc;
  store.set('disc', { site, q, sort, lang, stars, updated, topic, created, fork, owner, license });
}
/** A new text: the narrowing of a chosen set (topic, age, stars) goes. */
function discNewQuery(text) {
  if (text.trim() !== disc.q.trim()) Object.assign(disc, { topic: '', created: '', stars: '' });
  disc.q = text;
  remember(text);
  discSearch();
}
function discSearch(more = false) {
  discSave();
  disc.page = more ? disc.page + 1 : 1;
  if (!more) { disc.items = []; disc.total = 0; }
  disc.loading = true;
  disc.err = '';
  disc.ran = true;
  disc.seq++;
  // GitLab takes plain text: the qualifiers and filters are GitHub's own
  const gl = disc.site === 'gitlab';
  const { topic, lang, updated, created, stars, fork, owner } = disc;
  post({ t: 'ghSearch', site: disc.site, q: gl ? disc.q.trim() : discQuery(), sort: disc.sort === 'best' ? '' : disc.sort, page: disc.page, seq: disc.seq, gl: gl ? { topic, lang, updated, created, stars, fork, owner } : null });
  renderMain(true);
}
function remember(q) {
  q = q.trim();
  if (q.length < 2) return;
  hist = [q, ...hist.filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 10);
  store.set('hist', hist);
}
function repoRow(it, extra = '') {
  const lib = inLib(it.full);
  const gain = it.gain > 0 ? ` · <span class="ok">+${fmtNum(it.gain)}</span>` : '';
  const la = lib;
  const act = (lib ? `<button class="btn sm act inlib" data-act="repoRowMenu" data-full="${esc(it.full)}" title="${esc(t('У бібліотеці'))}">${ic('check')}<span class="lbl">${t('У бібліотеці')}</span>${ic('chevD')}</button>` : `<button class="btn sm act" data-act="addUrl" data-url="${esc(it.url || repoUrl(it.full))}" title="${esc(t('У бібліотеку'))}">${ic('add')}<span class="lbl">${t('У бібліотеку')}</span></button>`)
    + (la?.inst ? '' : `<button class="btn sm act" data-act="addInstall" data-full="${esc(it.full)}" title="${esc(t('Встановити'))}">${ic('download')}<span class="lbl">${t('Встановити')}</span></button>`)
    + (la ? `<button class="btn sm ico kitt ${la.kit ? 'on' : ''}" data-act="kitId" data-id="${esc(la.id)}" title="${esc(t(la.kit ? 'Прибрати з набору' : 'Додати в мій набір'))}">${kitIcon(la.kit)}</button>` : `<button class="btn sm ico kitt" data-act="addKit" data-full="${esc(it.full)}" title="${esc(t('Додати в бібліотеку й у мій набір'))}">${kitIcon(false)}</button>`);
  return `<div class="r" data-full="${esc(it.full)}">${avatarHtml(it.avatar, it.owner)}<div class="tx"><div class="nm"><span>${esc(it.name)}</span>${extra}${it.fork ? `<span class="pill">${t('форк')}</span>` : ''}${it.archived ? `<span class="pill">${t('архів')}</span>` : ''}<span class="m" style="font-weight:400">${esc(it.owner)}</span></div><div class="ds">${esc(it.desc || it.full)}</div></div><div class="meta">★ ${fmtNum(it.stars)}${gain}<br><span class="m" title="${esc(t('Коли автор востаннє змінював код'))}">${esc([it.lang, it.pushed && `${t('оновлено')} ${ago(it.pushed)}`].filter(Boolean).join(' · '))}</span></div><div class="acts2">${act}</div></div>`;
}
/** «Find»: the detailed filters are folded behind one button; the number of the changed ones is on it. */
let discOpen = store.get('discOpen', false);
const discChanged = () => [disc.sort !== 'best' && disc.sort, disc.lang, disc.stars, disc.updated, disc.topic, disc.fork, disc.owner, disc.license].filter(Boolean).length;
function discoverPage() {
  if (!disc.ran && !disc.loading) { disc.ran = true; setTimeout(() => discSearch(), 0); }
  const opt = (v, l, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(l)}</option>`;
  const SITE = disc.site === 'gitlab' ? 'GitLab' : 'GitHub';
  let h = `<div class="page narrow">${phead(t('Каталог'), `${onSite('Пошук на GitHub', SITE)}${disc.total ? ' · ' + mono(disc.total.toLocaleString(L)) + ' ' + t('знайдено') : ''}`)}${reposTabs()}`;
  h += `<div class="pin dpin"><div class="row"><label class="search grow"><span class="mono prompt">❯</span><input id="dq" value="${esc(disc.q)}" placeholder="${esc(onSite('Шукати на GitHub', SITE))}" spellcheck="false"></label><button class="btn acc" data-act="discGo">${ic('search')} ${t('Шукати')}</button><button class="btn ${discOpen ? 'on' : ''}" data-act="discFilters">${ic('sort')} ${t('Фільтри')}${discChanged() ? ` (${discChanged()})` : ''}</button>${SITE === 'GitHub' ? hint('Ліміт пошуку GitHub: 10 запитів на хвилину без токена, 30 — з токеном.') : ''}</div>`;
  const fld = (label, ctl, icon) => `<label class="dfld"><span class="dl">${icon ? ic(icon) : ''}${label}</span>${ctl}</label>`;
  h += `<div class="dpre"><span class="dl">${t('Швидкий пошук')}</span><div class="filters">${PRESETS.map(([l, p]) => `<button class="fchip ${Object.entries(p).every(([k, v]) => String(disc[k]) === String(v)) ? 'on' : ''}" data-act="preset" data-p="${esc(l)}">${t(l)}</button>`).join('')}</div></div>`;
  if (discOpen) h += `<div class="dgrid">
    ${fld(t('Сортування'), `<select class="inp" data-f="sort">${opt('best', t('Найкращі збіги'), disc.sort)}${opt('stars', t('Більше зірок'), disc.sort)}${opt('updated', t('Нещодавно оновлені'), disc.sort)}</select>`, 'sort')}
    ${fld(t('Мова'), `<select class="inp" data-f="lang">${opt('', t('Будь-яка'), disc.lang)}${LANGS.map(x => opt(x, x, disc.lang)).join('')}</select>`, 'code')}
    ${fld(t('Зірки'), `<select class="inp" data-f="stars">${opt('', t('Будь-скільки'), disc.stars)}${['10', '100', '1000', '10000'].map(x => opt(x, `${(+x).toLocaleString(L)}+`, disc.stars)).join('')}</select>`, 'star')}
    ${fld(t('Оновлено'), `<select class="inp" data-f="updated">${opt('', t('Будь-коли'), disc.updated)}${opt('30', t('За місяць'), disc.updated)}${opt('180', t('За пів року'), disc.updated)}${opt('365', t('За рік'), disc.updated)}</select>`, 'clock')}
    ${fld(t('Тема'), `<select class="inp" data-f="topic">${opt('', t('Будь-яка'), disc.topic)}${['windows', 'windows-11', 'tray', 'utility', 'productivity', 'audio', 'screenshot', 'clipboard'].map(x => opt(x, x, disc.topic)).join('')}</select>`, 'tag')}
    ${fld(t('Форки'), `<select class="inp" data-f="fork">${opt('', t('Без форків'), disc.fork)}${opt('true', t('Разом з форками'), disc.fork)}${opt('only', t('Лише форки'), disc.fork)}</select>`, 'fork')}
    ${fld(t('Автор'), `<input class="inp" data-f="owner" value="${esc(disc.owner)}" placeholder="${esc(t('будь-хто'))}">`, 'user')}
    ${fld(t('Ліцензія'), `<select class="inp" data-f="license" ${SITE === 'GitHub' ? '' : 'disabled title="' + esc(t('GitLab не шукає за ліцензією')) + '"'}>${opt('', t('Будь-яка'), disc.license)}${['mit', 'gpl-3.0', 'apache-2.0', 'bsd-3-clause', 'mpl-2.0', 'unlicense'].map(x => opt(x, x.toUpperCase(), disc.license)).join('')}</select>`, 'shield')}
  </div>`;
  h += '</div>';
  if (hist.length) h += `<div class="dpre"><span class="dl">${t('Нещодавні')}</span>${hist.map(q => `<span class="chip" data-act="histQ" data-q="${esc(q)}" title="${esc(t('Права кнопка — прибрати'))}">${esc(q)}</span>`).join('')}</div>`;
  h += '<div class="list" style="margin-top:16px">';
  if (disc.err) h += `<div class="info err"><span class="sign">!</span><div class="grow">${esc(msg(disc.err))}</div></div>`;
  else if (!disc.items.length && !disc.loading) h += `<div class="nothing">${t('Нічого не знайдено')}</div>`;
  for (const it of disc.items) h += repoRow(it);
  if (disc.loading) h += `<div class="nothing">${t('Шукаю…')}</div>`;
  else if (disc.items.length && disc.items.length < Math.min(disc.total, 1000)) h += `<button class="btn more" data-act="discMore">${t('Показати ще')}</button>`;
  h += '</div>';
  return h + '</div>';
}
/** Images of a README that are not badges: the first is the banner, the next ones are screenshots. */
function readmeImages(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('img')].map(i => i.getAttribute('src')).filter(s => s && /^https:/.test(s) && !/\.svg(\?|$)/i.test(s));
}
function repoPage() {
  const full = page.full;
  const it = page.item || disc.items.find(x => x.full === full) || { full, owner: full.slice(0, full.lastIndexOf('/')), name: full.slice(full.lastIndexOf('/') + 1), desc: '', stars: 0, topics: [], url: repoUrl(full), avatar: '' };
  const r = repos[full];
  const lib = inLib(full);
  const a = { owner: it.owner, repo: it.name };
  let html = r?.readme ? clean(r.readme, a) : '';
  const imgs = html ? readmeImages(html) : [];
  const ratio = imgs[0] ? shapeOf(imgs[0]) : 0;
  const banner = ratio >= 1.6 ? imgs[0] : '';
  const shots = imgs.slice(banner ? 1 : 0, 7);
  if (imgs.length) {
    // the banner and the screenshots are shown above: not twice
    const shown = new Set([banner, ...shots].filter(Boolean));
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('img').forEach(i => shown.has(i.getAttribute('src')) && i.remove());
    for (const x of [...doc.querySelectorAll('a,p,picture')].reverse()) if (!x.textContent.trim() && !x.querySelector('img,video')) x.remove();
    html = doc.body.innerHTML;
  }
  const crumbHtml = `<div class="crumb"><a data-act="crumb">${t('Знайти нове')}</a><span class="sep">›</span><b>${esc(it.name)}</b></div>`;
  let h = `<div class="page">${crumbHtml}`;
  if (banner) h += `<div class="banner" data-act="zoom" data-src="${esc(banner)}"><img src="${esc(banner)}" alt=""></div>`;
  const icon = r?.icon ? picTile(r.icon, it.name, 'lg') : avatarHtml(it.avatar, it.owner, 'lg');
  const langs = (r?.langs || []).map(([n, s]) => `${n} ${Math.round(s * 100)}%`);
  h += `<div class="ahead">${icon}<div class="tx"><h1>${esc(it.name)}</h1><div class="src"><a data-act="openUrl" data-url="${esc(it.url)}">${esc(full)}</a>${it.license ? ' · ' + esc(it.license) : ''}${langs[0] ? ' · ' + esc(langs[0]) : ''}${it.pushed ? ` · ${t('оновлено')} ${esc(ago(it.pushed))}` : ''}</div>${it.desc ? `<div class="desc">${esc(it.desc)}</div>` : ''}<div class="gchips">${(it.topics || []).slice(0, 10).map(x => `<span class="chip" data-act="discTopic" data-topic="${esc(x)}">${esc(x)}</span>`).join('')}</div></div>`;
  let act;
  const b = lib && busyOf(lib.id);
  if (b) act = `<button class="btn acc" disabled>${esc(stageText(b))}</button>`;
  else if (lib) act = `<button class="btn acc" data-act="openLib">${ic('apps')} ${t('Відкрити в бібліотеці')}</button>`;
  else if (r == null) act = `<button class="btn acc" disabled>${t('Завантаження…')}</button>`;
  else if (r.pick) act = `<button class="btn" data-act="discAdd">${ic('add')} ${t('У бібліотеку')}</button><button class="btn acc" data-act="discInstall">${ic('download')} ${t('Встановити')}</button>`;
  else act = `<button class="btn acc" data-act="discAdd">${ic('add')} ${t('Додати в бібліотеку')}</button>`;
  h += `<div><div class="acts">${act}<button class="btn ico" data-act="repoMore" title="${esc(t('Ще'))}">${ic('more')}</button></div>${r?.pick && !lib ? `<div class="m" style="margin-top:6px;text-align:right">${esc([fmtSize(r.pick.size), kindLabel(r.pick.kind)].filter(Boolean).join(' · '))}</div>` : r && !r.pick && !lib ? `<div class="m" style="margin-top:6px;text-align:right">${esc(r.release ? t('немає файлу для Windows') : t('немає релізів'))}</div>` : ''}${b ? progHtml(b) + (b.stage === 'queued' || b.stage === 'download' ? `<div class="row" style="margin-top:6px">${cancelBtn(b.key)}</div>` : '') : ''}</div></div>`;
  const fact = (k, v, note = '', cls = '') => `<div class="fact"><div class="k">${k}</div><div class="v">${v}</div><div class="h ${cls}">${note}</div></div>`;
  h += '<div class="facts">';
  h += fact(t('Зірки'), '★ ' + fmtNum(it.stars), it.gain > 0 ? `+${fmtNum(it.gain)} ${t('за тиждень')}` : '', 'ok');
  h += fact(t('Мови'), esc(langs[0] || it.lang || '—'), esc(langs.slice(1).join(' · ')));
  h += fact(t('Оновлено'), esc(it.pushed ? shortAgo(Date.parse(it.pushed) / 1000) : '—'), esc(it.pushed ? dateOf(Date.parse(it.pushed) / 1000) : ''));
  h += fact(t('Реліз'), esc(r?.release ? verOf(r.release.tag) : '—'), esc(r?.release ? ago(r.release.date) : r ? t('немає релізів') : ''), 'acc');
  h += fact(t('Ліцензія'), esc(it.license || '—'), esc(it.owner));
  h += '</div>';
  if (shots.length) h += `<div class="shots" style="margin-top:16px">${shots.map(s => `<img src="${esc(s)}" alt="" data-act="zoom" data-src="${esc(s)}" loading="lazy" onerror="this.remove()">`).join('')}</div>`;
  if (forksOf[full] !== undefined) h += `<div class="card" style="margin-top:16px"><h2 style="margin-bottom:8px">${t('Форки')}</h2>${forksHtml(full, it.pushed)}</div>`;
  h += `<div class="card" style="margin-top:${shots.length ? 0 : 16}px"><h2 style="margin-bottom:8px">${t('Опис')}</h2>${r == null ? `<div class="m">${t('Завантаження…')}</div>` : r.err ? `<div class="m">${esc(msg(r.err))}</div>` : html ? `<div class="md">${html}</div>` : `<div class="m">${t('README немає')}</div>`}</div>`;
  return h + '</div>';
}

// ---------------------------------------------------------------- followed authors

function authorsPage() {
  const list = authors().slice().sort((x, y) => (y.news?.length || 0) - (x.news?.length || 0) || (x.name || x.login).localeCompare(y.name || y.login));
  let h = `<div class="page narrow">${phead(t('Каталог'), t('Нові репозиторії тих, за ким стежиш, — під час кожної перевірки'))}${reposTabs()}`;
  h += `<div class="row" style="margin-bottom:16px"><input class="inp" id="followIn" placeholder="${esc(t('Логін GitHub або посилання на профіль GitHub, GitLab чи Codeberg'))}" style="max-width:360px"><button class="btn acc" data-act="follow">${ic('add')} ${t('Стежити')}</button></div>`;
  if (!list.length) return h + `<div class="empty"><span class="mark"><i class="i">${I.user}</i></span><div class="big">${t('Ще ні за ким не стежиш')}</div><div class="m" style="font-size:13px">${t('Стежити можна зі сторінки програми (меню ⋯) або тут за логіном.')}</div></div></div>`;
  h += '<div class="list">';
  for (const au of list) {
    const n = au.news?.length || 0;
    h += `<div class="r" data-login="${esc(au.login)}">${avatarHtml(au.avatar, au.login)}<div class="tx"><div class="nm"><span>${esc(au.name || au.login)}</span>${n ? `<span class="pill acc">+${nwk(n, 'fresh')}</span>` : ''}<span class="m" style="font-weight:400">@${esc(au.login)}</span></div><div class="ds">${esc(au.bio || '')}</div></div><div class="meta">${nwk(au.repos.length, 'repo')}<br><span class="m">${au.checked ? esc(shortAgo(au.checked)) : ''}</span></div><div class="acts2"><button class="btn sm ico kitt ${au.kit ? 'on' : ''}" data-act="kitAuthor" data-login="${esc(au.login)}" title="${esc(t(au.kit ? 'Прибрати з набору' : 'Додати в мій набір'))}">${kitIcon(au.kit)}</button></div></div>`;
  }
  return h + '</div></div>';
}
function authorPage() {
  const au = authors().find(x => x.login.toLowerCase() === page.login.toLowerCase());
  if (!au) return `<div class="page narrow"><div class="crumb"><a data-act="crumb">${t('Автори')}</a></div><div class="nothing">${t('Завантаження…')}</div></div>`;
  const news = new Set(au.news || []);
  let h = `<div class="page narrow"><div class="crumb"><a data-act="crumb">${t('Автори')}</a><span class="sep">›</span><b>${esc(au.name || au.login)}</b></div>`;
  h += `<div class="ahead">${avatarHtml(au.avatar, au.login, 'lg')}<div class="tx"><h1>${esc(au.name || au.login)}</h1><div class="src"><a data-act="openUrl" data-url="${esc(au.login.includes('/') ? 'https://' + au.login : 'https://github.com/' + au.login)}">@${esc(au.login)}</a> · ${nwk(au.repos.length, 'repo')}${au.org ? ` · ${t('організація')}` : ''}${au.blog ? ` · <a data-act="openUrl" data-url="${esc(/^https?:/.test(au.blog) ? au.blog : 'https://' + au.blog)}">${esc(hostOf(/^https?:/.test(au.blog) ? au.blog : 'https://' + au.blog))}</a>` : ''}</div>${au.bio ? `<div class="desc">${esc(au.bio)}</div>` : ''}</div>`;
  h += `<div class="acts"><button class="btn" data-act="authorRefresh">${ic('refresh')} ${t('Оновити')}</button><button class="btn danger" data-act="unfollow">${t('Не стежити')}</button></div></div>`;
  if (au.error) h += `<div class="info err" style="margin-top:16px"><span class="sign">!</span><div class="grow">${esc(msg(au.error))}</div></div>`;
  if (news.size) h += `<div class="info ok" style="margin-top:16px"><span class="sign">+</span><div class="grow"><b>${t('Нові репозиторії')}</b> <span class="m">${esc([...news].map(x => x.split('/')[1]).join(', '))}</span></div><button class="btn sm" data-act="authorSeen">${t('Переглянуто')}</button></div>`;
  h += '<div class="list" style="margin-top:16px">';
  const own = au.repos.filter(x => !x.fork);
  for (const it of own) h += repoRow(it, news.has(it.full) ? `<span class="pill acc">${t('нове')}</span>` : '');
  const forks = au.repos.filter(x => x.fork);
  if (forks.length) { h += `<div class="gt">${t('Форки')}</div>`; for (const it of forks) h += repoRow(it); }
  if (!au.repos.length) h += `<div class="nothing">${t('Публічних репозиторіїв немає')}</div>`;
  return h + '</div></div>';
}

// ---------------------------------------------------------------- Windows tweaks

let tweakList = null;
const tweakBusy = new Set();
/** «Tweaks» tab: "tw" — tweaks, "fix" — fixes, "run" — programs starting with Windows. */
let tweakTab = store.get('tweakTab', 'tw') === 'fix' ? 'fix' : 'tw';
let tweakFilter = 'all';
const TCATS = [['explorer', 'Провідник', 'folder'], ['taskbar', 'Панель завдань', 'apps'], ['start', 'Пуск і пошук', 'search'], ['privacy', 'Реклама й приватність', 'shield'], ['input', 'Миша й клавіатура', 'edit'], ['games', 'Ігри', 'play'], ['system', 'Система', 'settings'], ['custom', 'Мої твіки', 'tool']];
function tweakName(x) {
  if (typeof x === 'string') x = tweakList?.find(w => w.id === x) || { uk: x, en: x };
  return L === 'uk' ? x.uk : L === 'en' ? x.en : tx(x.uk) ?? x.en;
}
function tweaksPage() {
  if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); }
  const desc = x => (L === 'uk' ? x.ukD : L === 'en' ? x.enD : tx(x.ukD) ?? x.enD);
  const isOn = x => x.status === 'on' || x.status === 'already';
  const reset = tweakList.filter(x => x.status === 'reset');
  const F = { all: () => true, on: x => x.status === 'on', reset: x => x.status === 'reset', custom: x => x.custom };
  let h = `<div class="page wide pcp">${phead(t('Цей ПК і твіки'), t('Залізо цього ПК, виправлення в один клік і твіки Windows, які можна скасувати'), `${S.sys ? `<button class="btn" data-act="copySpecs">${ic('copy')} ${t('Скопіювати характеристики')}</button>` : ''}<button class="btn" data-act="explorer">${ic('restart')} ${t('Перезапустити Провідник')}</button>`, esc(S.pc || ''))}`;
  h += sysCard('', true);
  // the fixes: one click each
  if (toolsInfo === null) { toolsInfo = {}; post({ t: 'toolsScan' }); }
  h += `<div class="psect"><h2 class="big">${ic('tool')} ${t('Швидкі виправлення')}</h2><span class="m">${t('Кожне — один клік; позначені admin просять дозволу Windows')}</span></div><div class="fixgrid">`;
  if (S.steam) h += `<div class="tw tool steamfix"><i class="i">${I.pc}</i><div class="tx"><div class="nm"><span>${t('Значки ігор Steam')}</span></div><div class="d">${t('Коли гру переносять на інший диск, її ярлик на робочому столі стає білим. Komora знаходить гру в бібліотеках Steam і повертає значок.')}</div></div><button class="btn" data-act="steamIconsFix">${ic('refresh')} ${t('Повернути значки')}</button></div>`;
  {
    const sz = toolsInfo.sizes || {};
    const tool = (icon, title, d, size, what) => `<div class="tw tool"><i class="i">${I[icon]}</i><div class="tx"><div class="nm"><span>${t(title)}</span>${size != null ? `<span class="pill mono">${esc(fmtSize(size) || '0')}</span>` : ''}</div><div class="d">${t(d)}</div></div><button class="btn" data-act="toolsClean" data-what="${what}" ${size ? '' : 'disabled'}>${ic('del')} ${t('Очистити')}</button></div>`;
    h += tool('pc', 'Кеш шейдерів відеокарти', 'NVIDIA, AMD, Intel і DirectX: допомагає від підвисань після оновлення драйвера. Гра збере шейдери знову під час першого запуску.', sz.shader, 'shader');
    const fix = (icon, title, d, what, label, btnIcon, admin) => `<div class="tw tool"><i class="i">${I[icon]}</i><div class="tx"><div class="nm"><span>${t(title)}</span>${admin ? `<span class="pill mono">admin</span>` : ''}</div><div class="d">${t(d)}</div></div><button class="btn" data-act="fix" data-what="${what}">${ic(btnIcon)} ${t(label)}</button></div>`;
    h += fix('clock', 'Годинник Windows', 'Неправильний час ламає сайти, ігри й оновлення. Годинник синхронізується із сервером часу зараз.', 'time', 'Синхронізувати', 'refresh', true);
    h += fix('globe', 'Кеш DNS', 'Інтернет є, а якийсь сайт не відкривається чи веде на старе місце: Windows забуває збережені адреси сайтів.', 'dns', 'Очистити', 'del', false);
    h += fix('cart', 'Кеш Microsoft Store', 'Store не завантажує чи не оновлює програми. Після скидання Store відкриється сам.', 'store', 'Скинути', 'undo', false);
    h += fix('download', 'Кеш оновлень Windows', 'Оновлення Windows зависли чи не встановлюються: служби оновлення перезапускаються, завантажені файли оновлень видаляються.', 'wu', 'Очистити', 'del', true);
    h += fix('shield', 'Системні файли Windows', 'Перевіряє й відновлює пошкоджені файли Windows (sfc, потім DISM). Відкриється вікно з поступом; це триває 10–30 хвилин.', 'sfc', 'Перевірити', 'shield', true);
    h += tool('box', 'Тимчасові файли', 'Тимчасова тека Windows, завантаження winget і Komora старші за добу. Файли, які зараз використовуються, лишаються.', sz.temp, 'temp');
  }
  h += '</div>';
  // the tweak catalog
  h += `<div class="psect"><h2 class="big">${ic('settings')} ${t('Твіки Windows')}</h2><span class="m">${t('Кожен можна скасувати — Komora пам’ятає, що було до нього.')}</span><span class="grow"></span><button class="btn acc" data-act="tweakNew">${ic('add')} ${t('Свій твік')}</button></div>`;
  h += `<div class="guard"><i class="dot ok"></i><b>${t('Стежу за твіками')}:</b> <span class="m">${t('після кожного запуску й перевірки оновлень Komora дивиться, чи Windows не скинула їх, і пропонує повернути.')}</span></div>`;
  h += `<div class="filters pin">${[['all', 'Усі'], ['on', 'Застосовані'], ['reset', 'Скинуті Windows'], ['custom', 'Мої']].map(([k, l]) => `<button class="fchip ${tweakFilter === k ? 'on' : ''}" data-act="tweakFilter" data-f="${k}">${ic({ all: 'apps', on: 'check', reset: 'warn', custom: 'user' }[k])}${t(l)}<span class="mono">${tweakList.filter(F[k]).length}</span></button>`).join('')}</div>`;
  let sectN = 0;
  for (const [cat, title, icon] of TCATS) {
    const list = tweakList.filter(x => x.cat === cat && F[tweakFilter](x));
    if (!list.length) continue;
    const all = tweakList.filter(x => x.cat === cat);
    const act = all.filter(isOn).length;
    sectN += 1;
    h += `<div class="sect tsect"><span>${t(title)}</span><span class="mono">${act}/${all.length}</span></div>`;
    for (const x of list) {
      const busy = tweakBusy.has(x.id);
      const tag = '';
      const after = { explorer: t('після перезапуску Провідника'), logon: t('після повторного входу') }[x.restart] || '';
      // the switch tells on / off; the text only what it cannot
      const [stCls, stTxt] = x.status === 'reset' ? ['warn', t('скинуто Windows')] : x.status === 'already' ? ['acc', t('уже так у Windows')] : ['', ''];
      const state = stTxt ? `<i class="sdot ${stCls}"></i>${stTxt}` : '';
      h += `<div class="tw"><i class="i">${I[icon]}</i><div class="tx"><div class="nm"><span>${esc(tweakName(x))}</span>${tag}${x.admin ? `<span class="pill mono">admin</span>` : ''}</div><div class="d">${esc(desc(x))}${after ? ' · ' + esc(after) : ''}</div></div>`;
      if (x.custom) h += `<button class="btn sm ico flat" data-act="tweakEdit" data-id="${esc(x.id)}" title="${esc(t('Змінити'))}">${ic('edit')}</button>`;
      const tk = kitTweaks().includes(x.id);
      h += `<button class="btn sm ico kitt ${tk ? 'on' : ''}" data-act="kitTweak" data-id="${esc(x.id)}" title="${esc(t(tk ? 'Прибрати з набору' : 'Повертати після перевстановлення Windows'))}">${kitIcon(tk)}</button>`;
      if (state) h += `<span class="st">${state}</span>`;
      if (x.status === 'reset' && !busy) h += `<button class="btn sm upd soft" data-act="tweakOn" data-id="${esc(x.id)}">${t('Повернути')}</button>`;
      h += `<span class="sw ${isOn(x) ? 'on' : ''} ${busy ? 'busy' : ''}" role="switch" aria-checked="${isOn(x)}" data-act="tweakSw" data-id="${esc(x.id)}" data-on="${isOn(x) ? 1 : ''}"></span></div>`;
    }
  }
  // programs that start with Windows (switched as Task Manager does)
  return h + '</div>';
}
function tweakEditor(x) {
  closeOverlay();
  const v = document.createElement('div');
  v.className = 'veil';
  const vals = x?.vals?.length ? x.vals : [{ root: 'HKCU', path: '', name: '', kind: 'dword', data: '' }];
  const row = r => `<div class="row tv wrap" style="margin-top:6px"><select class="inp" data-k="root" style="width:84px">${['HKCU', 'HKLM'].map(o => `<option ${r.root === o ? 'selected' : ''}>${o}</option>`).join('')}</select><input class="inp mono" data-k="path" placeholder="Software\\…" value="${esc(r.path)}" style="flex:3;min-width:180px;width:auto"><input class="inp" data-k="name" placeholder="${esc(t('Назва значення'))}" value="${esc(r.name)}" style="flex:1.4;min-width:110px;width:auto"><select class="inp" data-k="kind" style="width:96px">${[['dword', 'DWORD'], ['sz', 'Текст']].map(([o, l]) => `<option value="${o}" ${r.kind === o ? 'selected' : ''}>${t(l)}</option>`).join('')}</select><input class="inp mono" data-k="data" placeholder="${esc(t('Значення'))}" value="${esc(r.data)}" style="flex:1;min-width:80px;width:auto"></div>`;
  v.innerHTML = `<div class="dlg" style="width:min(760px,calc(100vw - 40px));margin-top:-30px"><div class="body"><div class="ttl">${t(x ? 'Мій твік' : 'Свій твік')}</div>
    <div class="form" style="margin-top:14px"><div>${t('Назва')}</div><input class="inp" id="twName" value="${esc(x?.uk || '')}"><div>${t('Опис')}</div><input class="inp" id="twDesc" value="${esc(x?.ukD || '')}"></div>
    <div style="font-weight:600;margin-top:16px">${t('Значення реєстру')}</div><div id="twVals">${vals.map(row).join('')}</div><button class="btn sm" id="twAddVal" style="margin-top:6px">${ic('add')} ${t('Ще значення')}</button>
    <div style="font-weight:600;margin-top:16px">${t('Або PowerShell (необов’язково)')}</div><textarea class="inp mono" id="twApply" placeholder="${esc(t('Скрипт, що вмикає'))}" style="height:70px">${esc(x?.applyPs || '')}</textarea><textarea class="inp mono" id="twUndo" placeholder="${esc(t('Скрипт, що скасовує'))}" style="height:70px;margin-top:6px">${esc(x?.undoPs || '')}</textarea>
    <label class="check" style="margin-top:8px"><input type="checkbox" id="twAdmin" ${x?.admin ? 'checked' : ''}>${t('Потрібні права адміністратора')}</label></div>
    <div class="btns">${x ? `<button class="btn danger" data-r="del" style="margin-right:auto">${t('Видалити')}</button>` : ''}<button class="btn" data-r="0">${t('Скасувати')}</button><button class="btn acc" data-r="1">${t('Зберегти')}</button></div></div>`;
  document.body.append(v);
  overlay = v;
  $('#twAddVal', v).onclick = () => $('#twVals', v).insertAdjacentHTML('beforeend', row({ root: 'HKCU', path: '', name: '', kind: 'dword', data: '' }));
  v.addEventListener('click', e => {
    if (e.target === v) return closeOverlay();
    const b = e.target.closest('[data-r]');
    if (!b) return;
    if (b.dataset.r === 'del') { post({ t: 'tweakDel', id: x.id }); closeOverlay(); return; }
    if (b.dataset.r === '1') {
      const rows = [...v.querySelectorAll('.tv')].map(r => Object.fromEntries([...r.querySelectorAll('[data-k]')].map(i => [i.dataset.k, i.value.trim()]))).filter(r => r.path);
      post({ t: 'tweakSave', tweak: { id: x?.id || '', name: $('#twName', v).value, desc: $('#twDesc', v).value, vals: rows, applyPs: $('#twApply', v).value, undoPs: $('#twUndo', v).value, admin: $('#twAdmin', v).checked } });
    }
    closeOverlay();
  });
}

// ---------------------------------------------------------------- another PC and sync

let bundlePrev = null; // an opened bundle: { pc, at, apps, tweaks }
/** What the transfer file carries: "kit" or "all". */
let expScope = store.get('expScope', 'kit');
/** Programs of this PC winget can install, for the import: null, { loading }, or { items, err }. */
let wgImp = null;
let wgImpKit = true;
let bundleRun = null; // what is being set up from a bundle: { pc, ids, tweaks }
let clouds = null, offeredOpen = false;

let dbxForm = false;
/** The bundle carries the apps' settings backups; their count and size (null — not asked yet). */
let bkWith = store.get('bkWith', true), bkInfo = null;
/** Plain text of apps and links: a line each; Komora reads such text back from the clipboard. */
function shareText(ids) {
  const list = (ids.length ? ids.map(appById) : apps()).filter(Boolean);
  return [`Komora · ${list.length}`, ...list.map(a => `${a.name} — ${a.url}`)].join('\n');
}
/** How to share apps (empty — the whole library): a link anyone opens in Komora, or text. */
function shareMenu(el, ids) {
  menuAt(el, [
    { icon: 'link', label: t('Посиланням (секретний Gist)'), fn: () => { if (!S.cfg.hasToken) return toast(t('Потрібен токен GitHub з дозволом Gists — Налаштування → Ключі'), true); post({ t: 'share', ids }); toast(t('Створюю посилання…')); } },
    { icon: 'copy', label: t('Копіювати як текст'), fn: () => navigator.clipboard?.writeText(shareText(ids)).then(() => toast(t('Скопійовано — встав куди завгодно; Komora прочитає цей текст через Ctrl+V'))) },
  ], true);
}

/** The window buttons, drawn (10 px glyphs, 1 px strokes). */
const WB = {
  min: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M0 5.5h10" stroke="currentColor"/></svg>',
  max: '<svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9" rx="1" fill="none" stroke="currentColor"/></svg>',
  restore: '<svg width="10" height="10" viewBox="0 0 10 10"><rect x=".5" y="2.5" width="7" height="7" rx="1" fill="none" stroke="currentColor"/><path d="M2.5 2.5V1.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1" fill="none" stroke="currentColor"/></svg>',
  close: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M.5.5l9 9M9.5.5l-9 9" stroke="currentColor"/></svg>',
};
for (const [k, v] of [['min', WB.min], ['max', WB.max], ['close', WB.close]]) { const b = $(`#winbtns [data-win="${k}"]`); if (b) b.innerHTML = v; }
/** An (i) with what a block is about, shown on hover. */
const hint = text => `<i class="i hint" title="${esc(t(text))}">${I.info}</i>`;
/** A secret of the app (a token, an API key): entered, replaced or removed in place; kept DPAPI-encrypted. */
const keyRow = (key, title, has, ph, status, d, link) => `<div class="srow col"><div class="row" style="justify-content:space-between"><div>${title}</div>${status}</div>${d ? `<div class="d">${d}</div>` : ''}<div class="row">${keyEdit === key || !has ? `<input class="inp mono" id="key_${key}" type="password" autocomplete="off" placeholder="${esc(ph)}"><button class="btn" data-act="saveKey" data-key="${key}">${t('Зберегти')}</button>${has ? `<button class="btn" data-act="keyCancel">${t('Скасувати')}</button>` : ''}` : `<span class="path">••••••••••••••••••••</span><button class="btn" data-act="keyEdit" data-key="${key}">${t('Змінити')}</button><button class="btn danger" data-act="clearKey" data-key="${key}">${t('Прибрати')}</button>`}</div>${link}</div>`;
/** A folded step-by-step instruction. */
const howOpen = new Set();
document.addEventListener('toggle', e => { const d = e.target; if (d.classList?.contains('howto')) d.open ? howOpen.add(d.dataset.k) : howOpen.delete(d.dataset.k); }, true);
function howto(title, steps, extra = '') {
  return `<details class="howto" data-k="${esc(title)}" ${howOpen.has(title) ? 'open' : ''}><summary>${ic('info')} ${t(title)}</summary><ol>${steps.map(s => `<li>${esc(t(s))}</li>`).join('')}</ol>${extra}</details>`;
}
const TOKEN_URL = 'https://github.com/settings/personal-access-tokens/new?name=Komora&description=Komora';
function newPcPage() {
  if (clouds === null) { clouds = []; post({ t: 'clouds' }); }
  if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); }
  const c = S.cfg;
  const offered = apps().filter(a => INSTALLABLE(a) && a.wasInstalled && !a.inst);
  const mode = c.syncDir ? 'dir' : c.syncDbx ? 'dropbox' : dbxForm ? 'dropbox' : c.syncGist ? 'gist' : 'off';
  const st = S.sync || {};
  let h = `<div class="page narrow">${phead(t('Перенесення і синхронізація'), t('На інший ПК чи після перевстановлення Windows: синхронізація «Мого набору», файл перенесення, програми з цього ПК.'), mode !== 'off' ? `<span class="hpill ${st.err ? 'err' : 'ok'}"><i class="dot ${st.err ? 'err' : 'ok'}"></i>${esc(st.err ? t('Синхронізація не вдалася') : `${t('Синхронізовано')}${st.okAt ? ' · ' + ago(new Date(st.okAt * 1000).toISOString()) : ''}`)}</span><button class="btn acc" data-act="syncNow">${ic('refresh')} ${t('Синхронізувати зараз')}</button>` : '')}<div class="grid2 eq">`;
  // take everything to another PC
  const applied = (tweakList || []).filter(x => x.status === 'on' || x.status === 'reset').length;
  if (bkInfo === null) { bkInfo = undefined; post({ t: 'bkSize' }); }
  const frow = (icon, title, d, btn, more = '') => `<div class="frow"><span class="fic">${ic(icon)}</span><div class="tx"><div class="ft">${title}</div><div class="m">${d}</div>${more}</div>${btn}</div>`;
  const scope = [['kit', 'Лише набір'], ['all', 'Уся бібліотека']].map(([v, l]) => `<button class="${expScope === v ? 'on' : ''}" data-act="expScope" data-v="${v}">${t(l)}</button>`).join('');
  h += `<section class="card"><h2 class="big">${t('Файл перенесення')}${hint('Один zip, щоб забрати набір чи всю бібліотеку на інший ПК або на чисту Windows.')}</h2><div class="fl">
    ${frow('box', t('Зберегти файл перенесення'), t('Zip із самою Komora.exe: на новому ПК розпакуй, запусти Komora.exe й відкрий цей zip.'), `<button class="btn acc" data-act="exportGo">${t('Зберегти .zip')}</button>`, `<div class="xopts"><div class="scope"><div class="seg">${scope}</div></div><label class="bkw line"><span class="sw ${bkWith ? 'on' : ''}" role="switch" aria-checked="${bkWith}" data-act="bkWith"></span>${t('З налаштуваннями програм')}<span class="mono m">${bkInfo ? (bkInfo.apps ? `${nwk(bkInfo.apps, 'app')} · ${fmtSize(bkInfo.size) || '0'}` : t('копій ще немає')) : '…'}</span></label></div>`)}
    ${frow('pc', t('Програми з цього ПК'), t('Знайде встановлені програми, які winget уміє ставити. Додай їх у бібліотеку й набір — на новому ПК вони встануть одним кліком.'), `<button class="btn" data-act="wgFind" ${wgImp?.loading ? 'disabled' : ''}>${t('Знайти…')}</button>`)}
    ${frow('importI', t('Відкрити файл перенесення'), t('Файл .komora чи .zip — або встав посилання на спільний набір (Ctrl+V). Що поставити, вибереш у «Моєму наборі».'), `<button class="btn" data-act="openBundle">${t('Відкрити…')}</button>`)}
    ${frow('link', t('Поділитися'), t('Посиланням (секретний Gist) або текстом — інший відкриє його в Komora.'), `<button class="btn" data-act="shareAll">${t('Поділитися…')}</button>`)}
  </div></section>`;
  // sync
  const stTxt = st.err ? `<span style="color:var(--err)">● ${esc(msg(st.err))}</span>` : st.okAt ? `<span style="color:var(--ok)">● ${esc(shortAgo(st.okAt))}</span>` : mode === 'off' ? '' : `<span class="m">${t('ще не синхронізовано')}</span>`;
  const radio = (k, name, note, noteMono) => `<div class="radio ${mode === k ? 'on' : ''}" data-act="syncMode" data-mode="${k}"><span class="o"></span><span><span>${name}</span><br><span class="${noteMono ? 'mono ' : ''}m">${note}</span></span></div>`;
  h += `<section class="card"><h2 class="big">${t('Синхронізація')}${hint('«Мій набір» сам оновлюється на всіх твоїх ПК через приватний GitHub Gist. Перемагають новіші зміни; програми не встановлюються самі — інший ПК лише пропонує їх.')}<span class="mono" style="font-size:12px">${stTxt}</span></h2><div style="margin-top:8px">`;
  if (mode === 'dir') h += radio('dir', t('Тека'), esc(c.syncDir + '\\komora-sync.json'), true);
  const gistTok = () => { const r = S.rate; return keyRow('token', t('Токен GitHub'), c.hasToken, 'github_pat_…', r ? `<span class="mono" style="font-size:12px;color:${r.remaining > 10 ? 'var(--ok)' : 'var(--warn)'}">● ${r.remaining} / ${r.limit}</span>` : '', esc(t('Той самий токен, що й у Налаштуваннях: для Gist йому потрібен дозвіл Gists (Read and write).')), `<a class="alink" style="font-size:12px" data-act="openUrl" data-url="${TOKEN_URL}">${t('Створити токен на GitHub')} →</a>`); };
  h += radio('gist', t('Приватний GitHub Gist'), esc(c.hasToken ? t('потрібен токен з дозволом Gists') : t('спершу додай токен у Налаштуваннях')));
  if (mode === 'gist' || (S.sync?.err && c.syncGist)) h += `<div class="dbx">${gistTok()}</div>`;
  if (c.dbxAvail || c.hasDbx) h += radio('dropbox', 'Dropbox', esc(c.hasDbx ? t('увійдено · тека Apps/Komora') : c.dbxAvail ? t('увійти через сайт Dropbox') : t('ще не налаштовано в цій збірці')));
  if (mode === 'dropbox' && !c.hasDbx) {
    h += c.dbxAvail
      ? `<div class="dbx"><div class="m">${t('1. Відкрий Dropbox і дозволь Komora доступ лише до її теки. 2. Скопіюй код, який покаже Dropbox, і встав сюди.')}</div><div class="row" style="margin-top:8px"><button class="btn sm" data-act="dbxBegin">${ic('open')} ${t('Відкрити Dropbox')}</button><input class="inp mono" id="dbxCode" placeholder="${esc(t('код з Dropbox'))}" style="max-width:260px;height:26px"><button class="btn sm acc" data-act="dbxFinish">${t('Підтвердити')}</button></div></div>`
      : `<div class="dbx m">${t('Для Dropbox потрібен ключ застосунку Dropbox — його додасть автор у наступній збірці.')}</div>`;
  }
  if (c.hasDbx) h += `<div class="dbx"><a class="alink" data-act="dbxOff" style="font-size:12px">${t('Вийти з Dropbox')}</a></div>`;
  h += radio('off', t('Вимкнено'), esc(t('лише набір у файл')));
  h += `</div><div class="m" style="margin-top:8px">${t('Зміни зливаються, перемагає новіша. Встановлене не копіюється — інші ПК лише пропонують поставити.')}</div>`;
  if (mode !== 'off') h += `<div class="row" style="margin-top:12px"><button class="btn sm" data-act="syncNow">${ic('refresh')} ${t('Синхронізувати зараз')}</button></div>`;
  h += '</section>';
  // how-tos in a card of their own: open, they would stretch the cards of the row
  if (mode === 'gist') h += `<section class="card s2 howtos one">${howto('Як налаштувати Gist', ['Відкрий сторінку нового токена на GitHub (посилання нижче) і ввійди у свій обліковий запис.', 'Token name — будь-яка назва, наприклад Komora. Expiration — скільки житиме токен: коли мине, синхронізація зупиниться й знадобиться новий.', 'Repository access — «Public repositories»: доступ до твоїх репозиторіїв Komora не потрібен.', 'Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен (github_pat_…) і встав його тут, у поле «Токен GitHub» під «Приватний GitHub Gist».', 'Тут обери «Приватний GitHub Gist». Komora сама створить секретний Gist із файлом komora-sync.json або знайде наявний.', 'На іншому ПК зроби те саме з тим самим обліковим записом GitHub — Komora знайде той самий Gist.'],
    `<div class="m">${t('Секретний Gist не видно в списках і пошуку, але відкрити його може кожен, хто має посилання. Токени й ключі в синхронізацію не потрапляють.')}</div><div class="row wrap" style="margin-top:8px;gap:16px"><a class="alink" data-act="openUrl" data-url="${TOKEN_URL}">${t('Створити токен на GitHub')} →</a></div>`)}</section>`;
  // programs of this PC to bring into the library
  if (wgImp) {
    h += `<section class="card s2" id="wgImp"><h2 class="big">${t('Програми з цього ПК')}${wgImp.items ? `<span class="mono">${wgImp.items.filter(x => !x.sys).length}</span>` : ''}</h2>`;
    if (wgImp.loading) h += `<div class="m" style="margin-top:8px">${t('Шукаю через winget… кілька секунд.')}</div>`;
    else if (wgImp.err) h += `<div class="info err" style="margin-top:8px"><span class="sign">!</span><div class="grow">${esc(msg(wgImp.err))}</div></div>`;
    else {
      const row = x => `<label class="check ${x.inLib ? 'dim' : ''}"><input type="checkbox" data-wi="${esc(x.id)}" data-wn="${esc(x.name)}" ${x.inLib ? 'disabled' : x.sys ? '' : 'checked'}><span class="grow">${esc(x.name)}</span><span class="mono m">${esc(x.ver || '')}</span>${x.inLib ? `<span class="pill">${t('уже в бібліотеці')}</span>` : ''}</label>`;
      const apps = wgImp.items.filter(x => !x.sys), sys = wgImp.items.filter(x => x.sys);
      h += `<div class="m" style="margin-top:4px">${t('Позначене піде в бібліотеку. Системні компоненти (бібліотеки Visual C++, .NET тощо) Windows і програми зазвичай ставлять самі — їх не позначено.')}</div>`;
      h += `<div class="wgl">${apps.map(row).join('')}${sys.length ? `<details class="wgsys"><summary>${t('Системні компоненти')} (${sys.length})</summary>${sys.map(row).join('')}</details>` : ''}</div>`;
      h += `<div class="row wrap" style="margin-top:12px"><button class="btn acc" data-act="wgImportGo">${ic('add')} ${t('Додати вибране')}</button><label class="bkw line"><span class="sw ${wgImpKit ? 'on' : ''}" role="switch" aria-checked="${wgImpKit}" data-act="wgImpKit"></span>${t('Одразу в мій набір')}</label><span class="grow"></span><button class="btn" data-act="wgImpClose">${t('Скасувати')}</button></div>`;
    }
    h += '</section>';
  }
  return h + '</div></div>';
}

// ---------------------------------------------------------------- settings

let keyEdit = '';
function settingsPage() {
  const c = S.cfg;
  const row = (title, d, ctl) => `<div class="srow"><div class="tx"><div>${title}</div>${d ? `<div class="d">${d}</div>` : ''}</div>${ctl}</div>`;
  const sel = (key, cur, opts) => `<select class="inp" data-cfg="${key}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(t(l))}</option>`).join('')}</select>`;
  const sw = (key, on) => `<span class="sw ${on ? 'on' : ''}" role="switch" aria-checked="${!!on}" data-act="cfgSw" data-key="${key}"></span>`;
  const pathRow = (title, d, val, purpose, empty, clear) => `<div class="srow col"><div><div>${title}</div><div class="d">${d}</div></div><div class="row"><span class="path ${val ? '' : 'none'}">${esc(val || empty)}</span><button class="btn" data-act="pickPath" data-purpose="${purpose}">${t('Огляд…')}</button>${clear && val ? `<button class="btn ico" data-act="cfgVal" data-key="${purpose}" data-val="" title="${esc(t('Як пропонує встановлювач'))}">${ic('x')}</button>` : ''}</div></div>`;
  let h = `<div class="page set wide">${phead(t('Налаштування'), t('Як Komora працює на цьому ПК: перевірки, теки, вигляд, ключі й дані'), `<button class="btn acc" data-act="check" ${S.checking ? 'disabled' : ''}>${ic('refresh')} ${t('Перевірити оновлення')}</button>`, `Komora ${esc(S.ver)}`)}<div class="setcol">`;
  h += `<section class="card scard"><div class="sch"><span class="schi">${ic('palette')}</span><div><b>${t('Вигляд')}</b><span class="m">${t('Тема, тло й мова вікна')}</span></div></div>`;
  // the themes only: a dark or a light one is chosen with its palette at once
  const curD = dark(), curK = curD ? (c.darkLook || 'obsidian') : (c.lightLook || 'grey');
  const look = (kind, k, p) => `<button class="look ${curD === (kind === 'dark') && curK === k ? 'on' : ''}" data-act="look" data-kind="${kind}" data-val="${k}" title="${esc(t(LOOK_NAMES[k]))}"><span class="sw3" style="background:${p.layer}"><i style="background:${p.card};border-color:${p.stroke}"></i><i style="background:${p.btn};border-color:${p.stroke}"></i><b style="background:${kind === 'dark' ? '#a78bfa' : '#7c3aed'}"></b></span><span>${esc(t(LOOK_NAMES[k]))}</span></button>`;
  h += row(t('Тема'), '', `<div class="looks">${['dark', 'light'].flatMap(kind => Object.entries(LOOKS[kind]).map(([k, p]) => look(kind, k, p))).join('')}</div>`);
  h += row(t('Мова'), '', sel('lang', c.lang, [['auto', 'Як у Windows'], ['uk', 'Українська'], ['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['pt', 'Português'], ['pl', 'Polski'], ['it', 'Italiano'], ['tr', 'Türkçe']]));
  h += `</section><section class="card scard"><div class="sch"><span class="schi">${ic('settings')}</span><div><b>${t('Загальне')}</b><span class="m">${t('Перевірки, сповіщення, копії налаштувань, автозапуск')}</span></div></div>`;
  h += row(t('Перевіряти оновлення'), t('Як часто Komora сама шукає нові версії'), sel('checkHours', c.checkHours, [[24, 'Щодня'], [168, 'Щотижня'], [720, 'Щомісяця'], [0, 'Вручну']]));
  h += row(t('Тестові версії (pre-release)'), t('Для всіх програм; окремо можна ввімкнути на сторінці програми'), sw('preAll', c.preAll));
  h += row(t('Сповіщення Windows'), t('Нові версії, нове від авторів, скинуті твіки'), sw('notify', c.notify));
  h += row(t('Копії налаштувань програм самі'), t('Теки налаштувань знаходяться самі; копія — перед кожним оновленням і раз на день, якщо файли змінилися'), sw('autoBackup', c.autoBackup));
  h += row(t('Запускати разом із Windows'), t('Згорнутою в трей'), sw('autostart', c.autostart));
  h += `</section><section class="card scard"><div class="sch"><span class="schi">${ic('download')}</span><div><b>${t('Встановлення')}</b><span class="m">${t('Куди ставляться програми й чи показувати встановлювач')}</span></div></div>`;
  h += pathRow(t('Тека переносних програм'), t('Сюди розпаковуються zip і окремі .exe'), c.appsDir, 'appsDir', '', false);
  h += pathRow(t('Тека для встановлювачів'), t('Inno Setup і NSIS отримують цю теку, MSI — якщо підтримує; порожньо — як пропонує встановлювач'), c.setupDir, 'setupDir', t('як пропонує встановлювач'), true);
  h += row(t('Показувати вікно встановлювача'), t('Вимкнено — тихе встановлення'), sw('setupShow', c.setupShow));
  // devices with a battery: a tray icon each, and a note when the charge runs low
  h += `</section><section class="card scard" id="setDev"><div class="sch"><span class="schi">${ic('pc')}</span><div><b>${t('Пристрої')}</b><span class="m">${t('Заряд мишей, клавіатур, навушників і геймпадів у треї')}</span></div></div>`;
  h += row(t('Заряд пристроїв у треї'), t('Окремий значок у треї для кожного пристрою, що повідомляє заряд: Bluetooth, миші й клавіатури Logitech, миші Razer, SteelSeries і ATK / VXE, гарнітури Arctis, геймпади PlayStation і Xbox. Наведи на значок — назва й відсоток.'), sw('btTray', c.btTray));
  if (c.btTray) {
    const bt = S.bt || [];
    h += `<div class="srow col btrow">${bt.length ? `<div class="btl">${bt.map(d => `<div class="btd"><i class="i">${DEV_I[d.kind] || DEV_I.bt}</i><span class="grow">${esc(d.name)}</span><span class="mono ${d.charging ? 'acc' : d.pct <= 20 ? 'errc' : 'm'}" title="${esc(d.charging ? t('заряджається') : '')}">${d.charging ? '⚡ ' : ''}${d.pct} %</span><span class="sw sm ${d.tray ? 'on' : ''}" role="switch" aria-checked="${!!d.tray}" data-act="btDev" data-id="${esc(d.id)}" title="${esc(t('Значок у треї'))}"></span></div>`).join('')}</div>` : `<div class="d">${t('Зараз жоден пристрій не повідомляє заряд.')}</div>`}</div>`;
    h += row(t('Сповіщення про низький заряд'), t('При 20 % і при 10 % — раз на розряд, лише для пристроїв зі значком у треї'), sw('btLow', c.btLow));
  }
  h += `</section><section class="card scard"><div class="sch"><span class="schi">${ic('shield')}</span><div><b>${t('Ключі')}</b><span class="m">${t('GitHub і VirusTotal')}</span></div></div>`;
  const rate = S.rate ? `<span class="mono" style="font-size:12px;color:${S.rate.remaining > 10 ? 'var(--ok)' : 'var(--warn)'}">● ${S.rate.remaining} / ${S.rate.limit} ${t('запитів')}</span>` : '';
  h += keyRow('token', t('Токен GitHub'), c.hasToken, 'github_pat_…', rate, esc(t('Без токена GitHub дає 60 запитів на годину, з токеном — 5000. Досить токена без дозволів; для синхронізації через Gist — дозвіл Gists.')), `<a class="alink" style="font-size:12px" data-act="openUrl" data-url="${TOKEN_URL}">${t('Створити токен на GitHub')} →</a>${howto('Як отримати токен', ['Створи токен на GitHub (посилання нижче): назва — будь-яка, Repository access — «Public repositories».', 'Для ліміту запитів дозволи не потрібні. Для синхронізації через Gist — Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен і встав сюди → Зберегти.'])}`);
  h += keyRow('vtKey', t('Ключ VirusTotal'), c.hasVt, t('безкоштовний ключ API'), `<span class="mono m">${c.hasVt ? t('задано') : t('не задано')}</span>`, esc(t('Із ключем кожне встановлення перевіряється само, а невідомі файли вивантажуються. Без нього — кнопка «Завантажити на перевірку».')), `<a class="alink" style="font-size:12px" data-act="openUrl" data-url="https://www.virustotal.com/gui/my-apikey">${t('Отримати ключ на VirusTotal')} →</a>${howto('Як отримати ключ', ['Зареєструйся на virustotal.com — це безкоштовно.', 'Відкрий свій профіль → API key (посилання нижче) і скопіюй ключ.', 'Встав сюди → Зберегти. Безкоштовний ключ дає 4 запити на хвилину й 500 на день — Komora чекає сама.'])}`);
  h += `<div class="m" style="padding:2px 4px">${t('Ключі зашифровано для твого облікового запису Windows і не потрапляють у синхронізацію.')}</div>`;
  h += `</section><section class="card scard" id="about"><div class="sch"><span class="schi">${ic('info')}</span><div><b>${t('Про програму')}</b></div></div>`;
  h += `<div class="about"><div class="ahd"><span class="mark">${MARK}</span><div class="tx"><b>Komora</b><span class="mono m">${esc(S.ver)} · ${esc(S.arch)}</span></div></div>
    <button class="lrow" data-act="openUrl" data-url="https://github.com/Fenderenko/Komora"><span class="li gh">${GH_SVG}</span><span class="tx"><b>Fenderenko</b><span class="m">${t('автор · Komora на GitHub')}</span></span>${ic('open')}</button>
    <button class="lrow" data-act="openUrl" data-url="https://github.com/Fenderenko/Komora/blob/main/THIRD_PARTY.md"><span class="li">${ic('box')}</span><span class="tx"><b>${t('Сторонні компоненти')}</b><span class="m">${t('Шрифт Geist (OFL), значки Material Symbols (Apache-2.0) і Lucide (ISC)')}</span></span>${ic('open')}</button>
    <div class="lrow"><span class="li">${ic('folder')}</span><span class="tx"><b>${t('Тека даних')}</b><span class="m mono path2">${esc(S.dataDir || '')}</span></span><button class="btn sm" data-act="openPath" data-path="${esc(S.dataDir || '')}">${t('Відкрити теку')}</button></div></div>`;
  h += `<div class="m disclaim">${t('Komora — незалежний проєкт. Вона не пов’язана з Microsoft, Valve, Sony, Logitech, Razer, SteelSeries, Nintendo, GitHub, GitLab чи іншими згаданими компаніями й не схвалена ними; їхні назви й торгові марки належать власникам.')}</div>`;
  h += '</section></div></div>';
  return h;
}

// ---------------------------------------------------------------- README / notes from GitHub

const BADGE = /shields\.io|badgen\.net|badge|star-history|visitor|hits\.|komarev|readme-stats|codecov|travis-ci|appveyor|actions\/workflows|ko-fi\.com\/img|buymeacoffee\.com\/button|liberapay\.com\/assets|forthebadge|repobeats/i;
function clean(html, a, path = '') {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,link,meta,base,source,frame,frameset,applet').forEach(n => n.remove());
  // relative links of a file in a subfolder start from that folder
  const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '';
  const raw = `https://raw.githubusercontent.com/${a.owner}/${a.repo}/HEAD/${dir}`;
  const blob = `https://github.com/${a.owner}/${a.repo}/blob/HEAD/${dir}`;
  const abs = (u, base) => { try { return new URL(u, base).href; } catch { return ''; } };
  for (const el of doc.body.querySelectorAll('*')) {
    for (const at of [...el.attributes]) {
      const n = at.name.toLowerCase();
      if (n.startsWith('on') || n === 'srcset' || n === 'style' && el.tagName !== 'IMG' || n === 'autoplay') el.removeAttribute(at.name);
      else if (['href', 'src', 'xlink:href', 'action', 'formaction', 'poster'].includes(n) && /^\s*(javascript|vbscript|data):/i.test(at.value) && !(n === 'src' && /^\s*data:image\/(png|gif|jpe?g|webp);/i.test(at.value))) el.removeAttribute(at.name);
    }
  }
  for (const img of doc.querySelectorAll('img')) {
    const src = img.getAttribute('src') || '';
    if (BADGE.test(src) || BADGE.test(img.getAttribute('data-canonical-src') || '')) { img.remove(); continue; }
    img.setAttribute('src', abs(src, raw));
    img.setAttribute('loading', 'lazy');
    img.removeAttribute('style');
  }
  for (const v of doc.querySelectorAll('video')) { v.setAttribute('controls', ''); v.removeAttribute('autoplay'); if (v.getAttribute('src')) v.setAttribute('src', abs(v.getAttribute('src'), raw)); }
  for (const el of doc.querySelectorAll('a')) {
    const href = el.getAttribute('href') || '';
    if (!href || href.startsWith('#')) el.removeAttribute('href');
    else el.setAttribute('href', abs(href, blob));
    el.removeAttribute('target');
  }
  // links and paragraphs left empty by the removed badges
  for (const el of [...doc.querySelectorAll('a,p,picture,div,span')].reverse())
    if (!el.textContent.trim() && !el.querySelector('img,video,hr,br,code,pre,table')) el.remove();
  return doc.body.innerHTML;
}

// ---------------------------------------------------------------- the search in the title bar

const fly = { q: '', items: [], i: 0, gh: {}, seq: 0, timer: 0 };
const looksLikeLink = q => /^(https?:\/\/|www\.)\S+$/i.test(q) || /^[\w.-]+\/[\w.-]+$/.test(q) && !/\s/.test(q) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(q);
function openFly() { $('#fly').hidden = false; flyRender(); }
function closeFly() { const f = $('#fly'); if (f) f.hidden = true; }
function flyRender() {
  const q = $('#q').value.trim();
  const ql = q.toLowerCase();
  fly.q = q;
  const items = [];
  let h = '';
  if (hist.length && !q) h += `<div class="recent"><span class="mono m">${t('нещодавні')}</span>${hist.map(x => `<span class="chip" data-hq="${esc(x)}" title="${esc(t('Права кнопка — прибрати'))}">${esc(x)}</span>`).join('')}</div>`;
  let res = '';
  if (q && looksLikeLink(q)) {
    items.push({ fn: () => { post({ t: 'add', url: q, group: view.startsWith('g:') ? view.slice(2) : '' }); $('#q').value = ''; } });
    res += `<div class="it" data-i="${items.length - 1}"><span class="ic sm" style="background:var(--acc);color:var(--on-acc)">${ic('add')}</span><div class="tx"><div><b>${t('Додати')}</b> ${esc(q)}</div></div><span class="mono m">Enter</span></div>`;
  }
  // the library: name, repository, tags, groups, description
  const gname = id => groups().find(g => g.id === id)?.name ?? '';
  const found = !q ? apps().slice().sort((x, y) => isUpd(y) - isUpd(x) || y.added - x.added).slice(0, 5)
    : apps().map(a => {
      const n = (a.name || '').toLowerCase();
      const tagHit = a.tags.some(tg => tg.startsWith(ql.replace(/^#/, '')));
      const grpHit = a.groups.some(id => gname(id).toLowerCase().includes(ql));
      const hay = [a.repo, a.owner, a.desc, hostOf(a.url)].join(' ').toLowerCase();
      return [n.startsWith(ql) ? 5 : n.includes(ql) ? 4 : tagHit ? 3 : grpHit ? 2 : hay.includes(ql) ? 1 : 0, a];
    }).filter(x => x[0]).sort((x, y) => y[0] - x[0] || byName(x[1], y[1])).slice(0, 6).map(x => x[1]);
  if (found.length) {
    res += `<div class="grp">${t(q ? 'У бібліотеці' : 'Нещодавні й з оновленнями')} <span class="mono">${found.length}</span></div>`;
    for (const a of found) {
      items.push({ fn: () => openApp(a.id) });
      res += `<div class="it" data-i="${items.length - 1}">${iconHtml(a)}<div class="tx"><div><b>${esc(a.name)}</b>${a.kit ? `<i class="i kitmark">${I.kit}</i>` : ''} <span class="mono m">${a.kind === 'github' || a.kind === 'page' ? esc(isUpd(a) ? `${a.inst.version || verOf(a.inst.tag)} → ${verOf(a.latest.tag)}` : a.inst ? a.inst.version || verOf(a.inst.tag) : '') : esc(hostOf(a.url))}</span></div><div class="m">${esc([a.groups.map(gname).filter(Boolean).join(', '), a.tags.map(x => '#' + x).join(' '), isUpd(a) ? t('є оновлення') : ''].filter(Boolean).join(' · ') || (a.kind === 'link' ? t('посилання') : a.inst ? t('встановлено') : t('не встановлено')))}</div></div>${items.length === 1 ? '<span class="mono m">Enter</span>' : ''}</div>`;
    }
  }
  const gs = groups().filter(g => q && g.name.toLowerCase().includes(ql));
  const tags = allTags().filter(([tg]) => q && tg.includes(ql.replace(/^#/, ''))).slice(0, 6);
  if (gs.length || tags.length) res += `<div class="grp">${t('Групи й теги')}</div><div class="chips">${gs.map(g => `<span class="chip line" data-fv="g:${esc(g.id)}"><span class="dot" style="background:${esc(g.color)}"></span>${esc(g.name)}</span>`).join('')}${tags.map(([tg, n]) => `<span class="chip line" data-fv="tag:${esc(tg)}">#${esc(tg)} · ${n}</span>`).join('')}</div>`;
  // GitHub: after a pause in typing, at most a few results
  if (q.length >= 2 && !looksLikeLink(q)) {
    const g = fly.gh[ql];
    res += `<div class="grp">${t('На GitHub')} ${g?.total ? `<span class="mono">${g.total.toLocaleString(L)}</span>` : ''}</div>`;
    if (!g) {
      res += `<div class="m" style="padding:6px 10px">${t('Шукаю…')}</div>`;
      clearTimeout(fly.timer);
      fly.timer = setTimeout(() => {
        if (fly.gh[ql]) return;
        fly.gh[ql] = null;
        post({ t: 'ghSearch', q: `${q} archived:false`, sort: '', page: 1, seq: 'fly:' + ql });
      }, 450);
    } else if (g.err) res += `<div class="m" style="padding:6px 10px">${esc(msg(g.err))}</div>`;
    else if (!g.items.length) res += `<div class="m" style="padding:6px 10px">${t('Нічого не знайдено')}</div>`;
    else for (const it of g.items.slice(0, 4)) {
      items.push({ fn: () => openRepo(it.full, it) });
      const lib = inLib(it.full);
      res += `<div class="it" data-i="${items.length - 1}">${avatarHtml(it.avatar, it.owner)}<div class="tx"><div><b>${esc(it.name)}</b> <span class="m">${esc(it.owner)}</span></div><div class="m">${esc(it.desc || '')}</div></div><span class="mono m" style="white-space:nowrap">★ ${fmtNum(it.stars)}</span>${it.gain > 0 ? `<span class="mono" style="font-size:12px;color:var(--ok)">+${fmtNum(it.gain)}</span>` : ''}${lib ? `<span class="pill acc">${t('У бібліотеці')}</span>` : `<button class="btn sm" data-addfull="${esc(it.full)}">${t('У бібліотеку')}</button>`}</div>`;
    }
  }
  if (!res) res = `<div class="nothing">${t('Почни писати — назва, тег, група або що шукаєш на GitHub. Посилання можна одразу додати.')}</div>`;
  h += `<div class="res">${res}</div><div class="foot"><a class="alink" data-allres="1">${t('Усі результати з фільтрами')} →</a><span class="grow"></span><span class="mono">↑↓ ${t('перейти')} · Enter ${t('відкрити')} · Esc ${t('закрити')}</span></div>`;
  fly.items = items;
  fly.i = Math.min(fly.i, Math.max(0, items.length - 1));
  $('#fly').innerHTML = h;
  flyMark();
}
function flyMark() {
  $('#fly').querySelectorAll('.it').forEach(el => el.classList.toggle('on', +el.dataset.i === fly.i));
  $('#fly .it.on')?.scrollIntoView({ block: 'nearest' });
}
function flyAll() {
  const q = $('#q').value.trim();
  if (q && !looksLikeLink(q)) { disc.q = q; Object.assign(disc, { topic: '', created: '', stars: '' }); remember(q); discSearch(); }
  $('#q').value = '';
  $('#q').blur();
  go('discover');
}

// ---------------------------------------------------------------- overlays: menus, dialogs, add, imports, lightbox, toasts

let overlay = null;
function closeOverlay() { overlay?.remove(); overlay = null; }

function toast(text, err = false) {
  const box = $('#toasts');
  for (const old of [...box.children]) if (old.textContent === text) old.remove();
  while (box.children.length >= 3) box.firstElementChild.remove();
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' err' : '');
  el.textContent = text;
  box.append(el);
  setTimeout(() => el.remove(), err ? 7000 : 3500);
}

function showMenu(x, y, items) {
  closeOverlay();
  const m = document.createElement('div');
  m.className = 'menu';
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : it.head ? `<div class="mh">${esc(it.head)}</div>` : `<button data-i="${i}" class="${it.danger ? 'danger' : ''} ${it.sub ? 'two' : ''}">${it.sw ? `<span class="sw sm ${it.on ? 'on' : ''}"></span>` : it.mark ? it.mark : it.dot ? `<span style="width:9px;height:9px;border-radius:3px;background:${esc(it.dot)}"></span>` : it.icon ? ic(it.icon) : ''}${it.sub ? `<span class="mtx"><span>${esc(it.label)}</span><span class="m">${esc(it.sub)}</span></span>` : `<span>${esc(it.label)}</span>`}${it.check ? `<i class="i ck">${I.check}</i>` : ''}</button>`).join('');
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + 'px';
  m.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + 'px';
  m.addEventListener('click', e => {
    // the click stays in the menu: a submenu opened by it is not closed by the page's own click handling
    e.stopPropagation();
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    const it = items[+b.dataset.i];
    if (!it.keep) closeOverlay();
    it.fn?.();
    // a toggled item of a menu that stays open: its check follows
    if (it.sw) { it.on = !it.on; b.querySelector('.sw')?.classList.toggle('on', it.on); }
    if (it.toggle) { it.check = !it.check; b.querySelector('.ck')?.remove(); if (it.check) b.insertAdjacentHTML('beforeend', `<i class="i ck">${I.check}</i>`); }
  });
  overlay = m;
}
function menuAt(el, items, right = false) {
  const r = el.getBoundingClientRect();
  showMenu(right ? r.right - 240 : r.left, r.bottom + 4, items);
}

function dialog({ title, text = '', ok, danger = false, input = null, colors = null, icons = null, body = '' }) {
  return new Promise(res => {
    closeOverlay();
    const v = document.createElement('div');
    v.className = 'veil';
    let color = colors?.value;
    let icon = icons?.value || '';
    v.innerHTML = `<div class="dlg"><div class="body"><div class="ttl">${esc(title)}</div>${text ? `<div class="txt">${esc(text)}</div>` : ''}${input ? `<input class="inp" id="dlgIn" style="margin-top:12px" value="${esc(input.value || '')}" placeholder="${esc(input.placeholder || '')}" maxlength="${input.max || 60}">` : ''}${body}${colors ? `<div class="colors"><button data-c="" class="mono ${!color ? 'on' : ''}" title="${esc(t('Без кольору'))}"></button>${GROUP_COLORS.map(c => `<button data-c="${c}" class="${c === color ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>` : ''}${icons ? `<div class="gicons"><button data-g="" class="${!icon ? 'on' : ''}" title="${esc(t('Без значка — кольоровий квадрат'))}"><span class="sq"></span></button>${Object.entries(GROUP_ICONS).map(([k, g]) => `<button data-g="${k}" class="${k === icon ? 'on' : ''}"><i class="i">${g}</i></button>`).join('')}</div>` : ''}</div><div class="btns"><button class="btn" data-r="0">${t('Скасувати')}</button><button class="btn ${danger ? 'danger' : 'acc'}" data-r="1">${esc(ok)}</button></div></div>`;
    document.body.append(v);
    overlay = v;
    const inp = $('#dlgIn', v);
    (inp || v.querySelector('input,textarea,select') || $('[data-r="1"]', v)).focus();
    inp?.select();
    const vals = () => Object.fromEntries([...v.querySelectorAll('[data-k]')].map(i => [i.dataset.k, i.value]));
    const done = r => { const out = r ? { value: inp?.value.trim() ?? '', color, icon, ...vals() } : null; closeOverlay(); res(out); };
    const okIn = () => !inp || input.optional || inp.value.trim();
    v.addEventListener('click', e => {
      if (e.target === v) return done(false);
      const c = e.target.closest('[data-c]');
      if (c) { color = c.dataset.c; v.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', b === c)); v.querySelectorAll('.gicons button').forEach(b => { b.style.color = color || ''; }); return; }
      const gi = e.target.closest('[data-g]');
      if (gi) { icon = gi.dataset.g; v.querySelectorAll('[data-g]').forEach(b => b.classList.toggle('on', b === gi)); return; }
      const b = e.target.closest('[data-r]');
      if (b) done(b.dataset.r === '1' && okIn());
    });
    v.addEventListener('keydown', e => {
      if (e.key === 'Escape') done(false);
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && okIn()) done(true);
    });
  });
}
async function newGroup(appId) {
  const used = new Set(groups().map(g => g.color));
  const r = await dialog({ title: t('Нова група'), ok: t('Зберегти'), input: { placeholder: t('Назва групи'), optional: true }, colors: { value: GROUP_COLORS.find(c => !used.has(c)) || GROUP_COLORS[0] }, icons: { value: '' } });
  if (r) post({ t: 'group', op: 'add', name: r.value, color: r.color, icon: r.icon, app: appId || '' });
}

/** The menu of a repository found on GitHub or GitLab: its page, the site, forks, its author, the library and the kit. */
function repoMenuItems(full, it) {
  const owner = full.slice(0, full.lastIndexOf('/'));
  const fol = authors().some(x => x.login.toLowerCase() === owner.toLowerCase());
  const lib = inLib(full);
  return [
    { icon: 'info', label: t('Відкрити сторінку'), fn: () => openRepo(full, it) },
    { icon: 'globe', label: onSite('Відкрити на GitHub', siteOf(full)), fn: () => post({ t: 'open', url: it.url || repoUrl(full) }) },
    it.homepage && { icon: 'link', label: t('Сайт'), fn: () => post({ t: 'open', url: it.homepage }) },
    '-',
    lib ? { icon: 'apps', label: t('Відкрити в бібліотеці'), fn: () => openApp(lib.id) } : { icon: 'add', label: t('У бібліотеку'), fn: () => post({ t: 'add', url: it.url || repoUrl(full) }) },
    lib && { icon: 'x', label: t('Прибрати з бібліотеки'), danger: true, fn: () => confirmRemove([lib.id]) },
    !lib?.inst && { icon: 'download', label: t('Встановити'), fn: () => post({ t: 'addInstall', full }) },
    { icon: 'kit', label: t(lib?.kit ? 'Прибрати з набору' : 'Додати в мій набір'), fn: () => (lib ? edit(lib.id, { kit: !lib.kit }) : post({ t: 'addKit', full })) },
    '-',
    { icon: 'fork', label: t('Показати форки'), fn: () => { if (forksOf[full] === undefined) { forksOf[full] = null; post({ t: 'forks', full }); } openRepo(full, it); } },
    { icon: 'user', label: fol ? `${t('Автор')}: ${owner}` : `${t('Стежити за автором')} ${owner}`, fn: () => (fol ? openAuthor(owner) : post({ t: 'follow', login: owner })) },
  ].filter(Boolean);
}

/** «Add to this group»: the programs and links without a group (a click puts one in, the menu stays), or a new one. */
function addToGroupMenu(el) {
  const gid = view.slice(2);
  const free = apps().filter(a => !a.groups.some(id => groups().some(g => g.id === id))).sort(byName).slice(0, 40);
  const items = free.length ? [{ head: t('Без групи') }, ...free.map(a => ({ label: a.name, mark: iconHtml(a, 'xs'), keep: true, toggle: true, check: false, fn: () => { const x = appById(a.id); if (x) edit(a.id, { groups: x.groups.includes(gid) ? x.groups.filter(g => g !== gid) : [...x.groups, gid] }); } })), '-'] : [];
  items.push({ icon: 'add', label: t('Нова програма чи посилання…'), fn: () => openAdd('', gid) });
  menuAt(el, items);
}

/** The add field: a link of GitHub or any site (`group` — what is added goes into it). */
function openAdd(text = '', group = view.startsWith('g:') ? view.slice(2) : '') {
  closeOverlay();
  closeFly();
  const v = document.createElement('div');
  v.className = 'veil';
  let selG = groups().some(g => g.id === group) ? group : '', kitOn = !!S.cfg.kitNew;
  const gname = () => groups().find(g => g.id === selG)?.name;
  v.innerHTML = `<div class="pal"><div class="pin">${ic('add')}<input placeholder="${esc(t('Встав посилання на GitHub або сайт'))}" spellcheck="false"><span class="kbd mono">Esc</span></div><div class="res"></div><div class="dest"></div><div class="imps"><span class="m">${t('Або імпортуй багато:')}</span><button class="btn sm" data-imp="stars">${ic('star')} ${t('Зірки GitHub')}</button><button class="btn sm" data-imp="obtainium">Obtainium</button><button class="btn sm" data-imp="bookmarks">${ic('globe')} ${t('Закладки')}</button><button class="btn sm" data-imp="list">${ic('list')} ${t('Список')}</button><button class="btn sm" data-imp="bundle">${ic('importI')} ${t('Набір')}</button></div><div class="foot"><span>Enter ${t('додати')}</span><span>Esc ${t('закрити')}</span><span class="grow"></span><span>${t('Посилання також можна вставити Ctrl+V у вікні чи перетягнути з браузера')}</span></div></div>`;
  document.body.append(v);
  overlay = v;
  const inp = $('input', v);
  inp.value = text;
  // where it goes: no group or one of them, and the kit (by default — the «new things into the kit» rule)
  const drawDest = () => {
    $('.dest', v).innerHTML = `<span class="m">${t('Група')}</span><span class="chip ${selG ? '' : 'on'}" data-g="">${t('Без групи')}</span>${groups().map(g => `<span class="chip ${selG === g.id ? 'on' : ''}" data-g="${esc(g.id)}"><span class="dot" style="background:${esc(g.color || '#8d9099')}"></span>${esc(g.name)}</span>`).join('')}<span class="grow"></span><label class="kitsw" data-kit><span class="sw sm ${kitOn ? 'on' : ''}"></span>${t('У мій набір')}</label>`;
  };
  const draw = () => {
    const q = inp.value.trim();
    const had = q && apps().find(a => a.url.toLowerCase().replace(/\/$/, '') === q.toLowerCase().replace(/\/$/, '') || (a.kind === 'github' && /github\.com\//i.test(q) && q.toLowerCase().includes(`github.com/${a.owner}/${a.repo}`.toLowerCase())));
    $('.res', v).innerHTML = had ? `<div class="it on" data-had="${esc(had.id)}">${iconHtml(had, 'sm')}<span class="grow">${t('Уже в бібліотеці')}: <b>${esc(had.name)}</b></span><span class="alink">${t('Відкрити')} →</span></div>`
      : q && looksLikeLink(q) ? `<div class="it on">${ic('add')}<span class="grow">${t('Додати')} ${esc(q)} → ${esc([t('Бібліотека'), gname() && `«${gname()}»`, kitOn && t('Мій набір')].filter(Boolean).join(' · '))}</span><span class="mono m">Enter</span></div>`
      : `<div class="it">${ic('link')}<span class="grow m">${t('GitHub, сайт, відео YouTube, товар у магазині — будь-яке посилання')}</span></div>`;
  };
  const go2 = () => {
    const q = inp.value.trim();
    const had = $('[data-had]', v);
    closeOverlay();
    if (had) openApp(had.dataset.had);
    else if (q && looksLikeLink(q)) post({ t: 'add', url: q, group: selG, kit: kitOn });
  };
  inp.addEventListener('input', draw);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go2(); } else if (e.key === 'Escape') closeOverlay(); });
  v.addEventListener('click', e => {
    const imp = e.target.closest('[data-imp]')?.dataset.imp;
    if (imp) { closeOverlay(); ({ stars: importStars, obtainium: importObtainium, bookmarks: importBookmarks, list: () => importText(), bundle: () => { go('newpc'); post({ t: 'openBundle' }); } })[imp](); return; }
    const gc = e.target.closest('[data-g]');
    if (gc) { selG = gc.dataset.g; drawDest(); draw(); inp.focus(); return; }
    if (e.target.closest('[data-kit]')) { e.preventDefault(); kitOn = !kitOn; drawDest(); draw(); inp.focus(); return; }
    if (e.target === v) closeOverlay(); else if (e.target.closest('.it.on')) go2();
  });
  drawDest();
  draw();
  inp.focus();
}

/** The imports: GitHub stars, Obtainium, browser bookmarks, a list of links. */
function importMenu(el) {
  const items = [
    { icon: 'add', label: t('Додати програму чи посилання…'), fn: () => openAdd() },
    '-', { head: t('Імпорт') },
    { icon: 'star', label: t('Зірки GitHub…'), fn: importStars },
    { icon: 'apps', label: 'Obtainium…', fn: importObtainium },
    { icon: 'globe', label: t('Закладки браузера…'), fn: importBookmarks },
    { icon: 'note', label: t('Список посилань…'), fn: importText },
    '-', { icon: 'pc', label: t('Набір з іншого ПК…'), fn: () => { go('newpc'); post({ t: 'openBundle' }); } },
  ];
  if (el) menuAt(el, items, true); else showMenu(innerWidth / 2 - 120, 140, items);
}
const groupSelect = () => `<select class="inp" data-k="group" style="margin-top:10px"><option value="">${t('Без групи')}</option>${groups().map(g => `<option value="${esc(g.id)}">${esc(g.name)}</option>`).join('')}<option value="new:">${t('Нова група з назвою джерела')}</option></select>`;
const grpOf = (v, name) => (v === 'new:' ? `new:${name}` : v || '');
async function importStars() {
  const r = await dialog({ title: t('Зірки GitHub'), text: t('Репозиторії, яким ти поставив зірку, — у бібліотеку. Релізи підтягнуться під час перевірки (для багатьох зірок потрібен токен).'), ok: t('Імпортувати'), input: { value: S.cfg.ghLogin || '', placeholder: t('логін GitHub'), max: 60 }, body: groupSelect() });
  if (!r) return;
  post({ t: 'cfg', key: 'ghLogin', val: r.value });
  post({ t: 'importStars', login: r.value, group: grpOf(r.group, t('Зірки GitHub')) });
  toast(t('Імпортую…'));
}
async function importObtainium() {
  const r = await dialog({ title: 'Obtainium', text: t('Експорт Obtainium (Налаштування → Експорт): посилання з нього — у бібліотеку.'), ok: t('Обрати файл…'), body: groupSelect() });
  if (r) post({ t: 'importObtainium', group: grpOf(r.group, 'Obtainium') });
}
let bmWait = null;
function importBookmarks() {
  bmWait = true;
  post({ t: 'bookmarks' });
  toast(t('Шукаю закладки…'));
}
async function bookmarksDialog(tree) {
  if (!tree.length) { toast(t('Закладок Chrome, Edge, Brave, Vivaldi чи Opera не знайдено'), true); return; }
  const opts = tree.flatMap(b => b.folders.map(f => `<option value="${esc(b.browser)}|${esc(f.path)}">${esc(b.browser)} — ${'· '.repeat(f.depth)}${esc(f.name || '—')} (${f.links})</option>`)).join('');
  const r = await dialog({ title: t('Закладки браузера'), text: t('Тека закладок разом із вкладеними — у бібліотеку: репозиторії як програми, решта як посилання.'), ok: t('Імпортувати'), body: `<select class="inp" data-k="folder">${opts}</select>${groupSelect()}` });
  if (!r) return;
  const [browser, path] = r.folder.split('|');
  post({ t: 'importBookmarks', browser, path, group: grpOf(r.group, path.split('/').pop() || browser) });
}
async function importText(pre = '') {
  const r = await dialog({ title: t('Список посилань'), text: t('По одному на рядок: GitHub, сайти, відео, товари.'), ok: t('Додати всі'), body: `<textarea class="inp mono" data-k="text" style="height:160px" placeholder="https://github.com/…">${esc(pre)}</textarea>${groupSelect()}` });
  if (r?.text?.trim()) post({ t: 'importText', text: r.text, group: grpOf(r.group, t('Імпорт')) });
}

/** Pictures of the page on the whole window: arrows go through them, Esc closes. */
function lightbox(src) {
  const list = [...new Set([...$('#main').querySelectorAll('.md img, .shots img, .banner img, .ic.thumb img')].map(i => i.currentSrc || i.src).filter(Boolean))];
  let i = Math.max(0, list.indexOf(src));
  if (!list.length) list.push(src);
  closeOverlay();
  const v = document.createElement('div');
  v.className = 'lightbox';
  const draw = () => { v.innerHTML = `<img src="${esc(list[i])}" alt="">${list.length > 1 ? `<button class="nav prev" data-d="-1"><i class="i">${I.prev}</i></button><button class="nav next" data-d="1"><i class="i">${I.next}</i></button><div class="cnt">${i + 1} / ${list.length}</div>` : ''}<button class="close" data-x="1" title="Esc"><i class="i">${I.close}</i></button>`; };
  draw();
  document.body.append(v);
  overlay = v;
  v.addEventListener('click', e => {
    const d = e.target.closest('[data-d]');
    if (d) { i = (i + +d.dataset.d + list.length) % list.length; draw(); return; }
    if (e.target === v || e.target.closest('[data-x]')) closeOverlay();
  });
  v.tabIndex = -1;
  v.focus();
  v.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { i = (i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length; draw(); e.preventDefault(); e.stopPropagation(); }
  });
}

// ---------------------------------------------------------------- actions

function updateAll() {
  for (const id of S.updates) post({ t: 'install', id });
  const w = wgUpdates().map(x => x.id);
  if (w.length) post({ t: 'wgInstall', ids: w, to: '' });
}
const edit = (id, patch) => post({ t: 'edit', id, patch });
async function confirmUninstall(a) {
  const r = await dialog({ title: t('Видалити програму з ПК?'), text: `${a.name}. ${a.inst?.method === 'portable' ? t('Портативна програма піде в Кошик.') : t('Запуститься її деінсталятор.')}`, ok: t('Видалити з ПК'), danger: true });
  if (r) post({ t: 'uninstall', id: a.id });
}
async function confirmRemove(ids) {
  const list = ids.map(appById).filter(Boolean);
  if (!list.length) return;
  const r = await dialog({ title: t('Прибрати з бібліотеки?'), text: `${list.map(a => a.name).join(', ')}. ${list.some(a => a.inst) ? t('Сама програма на ПК лишиться.') : ''}`, ok: t('Прибрати'), danger: true });
  if (r) { for (const a of list) post({ t: 'remove', id: a.id }); multi.clear(); if (page?.k === 'app' && list.some(a => a.id === page.id)) goBack(); }
}
function groupMenu(el, ids) {
  const list = ids.map(appById).filter(Boolean);
  const items = groups().map(g => {
    const all = list.every(a => a.groups.includes(g.id));
    return { label: g.name || t('Група'), mark: groupMark(g), check: all, fn: () => { for (const a of list) edit(a.id, { groups: all ? a.groups.filter(x => x !== g.id) : [...new Set([...a.groups, g.id])] }); } };
  });
  if (items.length) items.push('-');
  items.push({ icon: 'add', label: t('Нова група…'), fn: () => newGroup(list.length === 1 ? list[0].id : '') });
  menuAt(el, items);
}
/** The group page's kit controls: «in the kit N of M», the whole group in or out at once, and the group's own switch. */
function groupHeadKit(gid) {
  const g = groups().find(x => x.id === gid) || {};
  const k = groupKit(gid);
  let h = k.of ? `<span class="m gkn">${esc(`${t('у наборі')} ${k.n} ${t('із')} ${k.of}`)}</span>` : '';
  if (k.of) h += k.all ? `<button class="btn sm kitt on gkp" data-act="kitGroupOff" data-id="${esc(gid)}">${kitIcon(true)} ${t('Прибрати всю групу з набору')}</button>` : `<button class="btn sm" data-act="groupKit">${kitIcon(false)} ${t('Додати всю групу в набір')}</button>`;
  return h + `<button class="tgl" data-act="groupAuto" data-id="${esc(gid)}" title="${esc(t('Програма чи посилання, яке кладеш у цю групу, одразу потрапляє в мій набір'))}"><span class="sw sm ${g.kitAuto ? 'on' : ''}"></span>${t('Нове в групі — одразу в набір')}</button>`;
}
function groupContext(x, y, g) {
  // only apps go to the kit: links have nothing to install
  showMenu(x, y, [
    ...(() => { const all = groupInKit(g.id); return groupKit(g.id).of ? [{ mark: all ? kitIconOff() : kitIcon(false), label: t(all ? 'Прибрати всю групу з набору' : 'Додати всю групу в набір'), fn: () => post({ t: 'kitGroup', id: g.id, on: !all }) }] : []; })(),
    { icon: 'kit', label: t('Нове в групі — одразу в набір'), check: !!g.kitAuto, fn: () => post({ t: 'kitGroupAuto', id: g.id, on: !g.kitAuto }) }, '-',
    { icon: 'edit', label: t('Перейменувати'), fn: async () => { const r = await dialog({ title: t('Перейменувати'), ok: t('Зберегти'), input: { value: g.name, placeholder: t('Нова назва') } }); if (r?.value) post({ t: 'group', op: 'rename', id: g.id, name: r.value }); } },
    { icon: 'palette', label: t('Значок і колір'), fn: async () => { const r = await dialog({ title: g.name || t('Група'), ok: t('Зберегти'), colors: { value: g.color }, icons: { value: g.icon || '' } }); if (r) post({ t: 'group', op: 'color', id: g.id, color: r.color, icon: r.icon }); } },
    '-',
    { icon: 'link', label: t('Поділитися групою…'), keep: true, fn: () => shareMenu({ getBoundingClientRect: () => ({ left: x, bottom: y, right: x }) }, apps().filter(a => a.groups.includes(g.id)).map(a => a.id)) },
    { icon: 'del', label: t('Видалити'), danger: true, fn: async () => { const r = await dialog({ title: t('Видалити групу?'), text: `${g.name}. ${t('Програми лишаться в бібліотеці.')}`, ok: t('Видалити'), danger: true }); if (r) { post({ t: 'group', op: 'delete', id: g.id }); if (view === 'g:' + g.id) go('all'); } } },
  ]);
}
function appMenuItems(a) {
  const items = [];
  if (a.inst && (a.kind !== 'winget' || a.inst.dir)) items.push({ icon: 'folder', label: t('Відкрити теку'), fn: () => post({ t: 'folder', id: a.id }) });
  items.push({ icon: 'globe', label: a.kind === 'link' ? t('Відкрити') : a.kind === 'page' ? t('Відкрити сторінку') : a.kind === 'winget' ? t('Сторінка winget') : onSite('Відкрити на GitHub', siteOf(a.owner)), fn: () => post({ t: 'open', url: a.url }) });
  if (a.homepage) items.push({ icon: 'link', label: t('Сайт'), fn: () => post({ t: 'open', url: a.homepage }) });
  if (a.kind === 'github') {
    items.push({ icon: 'refresh', label: t('Оновити дані'), fn: () => post({ t: 'refresh', id: a.id }) });
    const fol = authors().some(x => x.login.toLowerCase() === a.owner.toLowerCase());
    items.push({ icon: 'user', label: fol ? `${t('Автор')}: ${a.owner}` : `${t('Стежити за автором')} ${a.owner}`, fn: () => fol ? openAuthor(a.owner) : post({ t: 'follow', login: a.owner }) });
    if (a.inst) items.push({ icon: a.pin ? 'unpin' : 'pin', label: t(a.pin ? 'Відкріпити версію' : 'Закріпити версію'), fn: () => edit(a.id, { pin: a.pin ? '' : (a.inst.tag || a.inst.version) }) });
  } else if (a.kind === 'page') {
    items.push({ icon: 'refresh', label: t('Перевірити сторінку'), fn: () => post({ t: 'refresh', id: a.id }) });
    if (a.inst) items.push({ icon: a.pin ? 'unpin' : 'pin', label: t(a.pin ? 'Відкріпити версію' : 'Закріпити версію'), fn: () => edit(a.id, { pin: a.pin ? '' : (a.inst.tag || a.inst.version) }) });
    items.push({ icon: 'link', label: t('Зробити знову посиланням'), fn: () => post({ t: 'pageToLink', id: a.id }) });
  } else if (a.kind === 'link') {
    items.push({ icon: 'copy', label: t('Копіювати посилання'), fn: () => navigator.clipboard?.writeText(a.url).then(() => toast(t('Посилання скопійовано'))) });
    items.push({ icon: 'refresh', label: t('Оновити дані'), fn: () => post({ t: 'refresh', id: a.id }) });
  }
  if (KITABLE(a)) items.push({ mark: a.kit ? kitIconOff() : kitIcon(false), label: t(a.kit ? 'Прибрати з набору' : 'У мій набір'), fn: () => edit(a.id, { kit: !a.kit }) });
  items.push('-');
  if (['github', 'page'].includes(a.kind) && a.id !== SELF_ID) items.push({ icon: 'folder', label: t(a.inst ? 'Вказати іншу теку встановлення…' : 'Уже встановлено — вказати теку…'), fn: () => post({ t: 'pickPath', purpose: 'instDir', id: a.id }) });
  if (a.inst && ['github', 'winget', 'page'].includes(a.kind)) items.push({ icon: 'del', label: t('Видалити з ПК'), fn: () => confirmUninstall(a) });
  items.push({ icon: 'x', label: t('Прибрати з бібліотеки'), danger: true, fn: () => confirmRemove([a.id]) });
  return items;
}
function appContext(x, y, a) {
  const p = primary(a);
  const items = [{ icon: 'info', label: t('Відкрити сторінку'), fn: () => openApp(a.id) }];
  if (!p.busy && p.fn) items.push({ icon: p.icon, label: p.label, fn: p.fn });
  items.push({ icon: 'layers', label: t('У групу'), keep: true, fn: () => groupMenu({ getBoundingClientRect: () => ({ left: x, bottom: y, right: x }) }, [a.id]) }, '-', ...appMenuItems(a));
  showMenu(x, y, items);
}

let notesTimer = 0;
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.act === 'notes') {
    clearTimeout(notesTimer);
    const id = page?.id;
    notesTimer = setTimeout(() => edit(id, { notes: el.value }), 600);
  }
  if (el.id === 'q') { fly.i = 0; openFly(); }
});
document.addEventListener('focusout', e => {
  const el = e.target;
  const id = page?.id;
  if (el.dataset?.act === 'notes' && id) { clearTimeout(notesTimer); edit(id, { notes: el.value }); }
  if (el.dataset?.act === 'rename' && id && el.value.trim() && el.value.trim() !== appById(id)?.name) edit(id, { name: el.value.trim() });
  if (el.dataset?.f === 'owner' && el.value !== disc.owner) { disc.owner = el.value; disc.q = $('#dq')?.value ?? disc.q; discSearch(); }
  setTimeout(() => renderMain(), 0);
});
$('#q').addEventListener('focus', () => openFly());

document.addEventListener('keydown', e => {
  const el = e.target;
  const k = e.key;
  if (el.id === 'q') {
    if (k === 'ArrowDown' || k === 'ArrowUp') { fly.i = Math.max(0, Math.min(fly.items.length - 1, fly.i + (k === 'ArrowDown' ? 1 : -1))); flyMark(); e.preventDefault(); return; }
    if (k === 'Enter') {
      e.preventDefault();
      const it = fly.items[fly.i];
      const q = el.value.trim();
      if (it) { remember(q); el.value = ''; el.blur(); closeFly(); it.fn(); }
      else if (q) flyAll();
      return;
    }
    if (k === 'Escape') { el.value = ''; el.blur(); closeFly(); return; }
    return;
  }
  if (el.dataset?.act === 'tagin' && k === 'Enter') {
    const v = el.value.trim().replace(/^#/, '').toLowerCase();
    const a = appById(page?.id);
    if (v && a && !a.tags.includes(v)) edit(a.id, { tags: [...a.tags, v] });
    el.value = '';
    e.preventDefault();
    return;
  }
  if (el.dataset?.act === 'rename' && k === 'Enter') { el.blur(); return; }
  if (el.id === 'firstUrl' && k === 'Enter') { if (el.value.trim()) post({ t: 'add', url: el.value.trim() }); return; }
  if (el.id?.startsWith('key_') && k === 'Enter') { $(`[data-act="saveKey"][data-key="${el.id.slice(4)}"]`)?.click(); return; }
  if (el.id === 'dq' && k === 'Enter') { discNewQuery(el.value); el.blur(); return; }
  if (el.id === 'followIn' && k === 'Enter') { $('[data-act="follow"]')?.click(); return; }
  if (el.dataset?.f === 'owner' && k === 'Enter') { el.blur(); return; }
  if (el.id === 'bkReg' && k === 'Enter') { $('[data-act="bkRegAdd"]')?.click(); return; }
  if ((e.ctrlKey && k.toLowerCase() === 'k') || (k === '/' && !/INPUT|TEXTAREA|SELECT/.test(el.tagName) && !overlay)) { e.preventDefault(); closeOverlay(); $('#q').focus(); $('#q').select(); return; }
  if (e.ctrlKey && k.toLowerCase() === 'n') { e.preventDefault(); openAdd(); return; }
  if (k === 'F5' || (e.ctrlKey && k.toLowerCase() === 'r')) { e.preventDefault(); post({ t: 'reload' }); return; }
  if (k === 'Escape' && overlay) { closeOverlay(); return; }
  if (k === 'Escape' && multi.size) { multi.clear(); renderMain(); return; }
  if (overlay || /INPUT|TEXTAREA|SELECT/.test(el.tagName)) return;
  if (((k === 'Escape' && page) || (e.altKey && k === 'ArrowLeft') || k === 'Backspace') && (page || back.length)) { e.preventDefault(); goBack(); return; }
  if (page || !isList(view)) return;
  // the list keys
  const order = visibleOrder();
  if (k === 'ArrowDown' || k === 'ArrowUp') {
    const i = order.findIndex(a => a.id === cursor);
    const n = order[Math.max(0, Math.min(order.length - 1, i < 0 ? 0 : i + (k === 'ArrowDown' ? 1 : -1)))];
    if (n) { cursor = n.id; store.set('sel', cursor); renderMain(); $('#main').querySelector(`.r[data-id="${CSS.escape(n.id)}"]`)?.scrollIntoView({ block: 'nearest' }); }
    e.preventDefault();
  } else if (k === 'Enter' && cursor && order.some(a => a.id === cursor)) openApp(cursor);
  else if (k === 'Delete') { if (multi.size > 1) confirmRemove([...multi]); else if (cursor) confirmRemove([cursor]); }
});

// mouse "back" / "forward" buttons
document.addEventListener('mouseup', e => { if (e.button === 3) { e.preventDefault(); goBack(); } });

document.addEventListener('click', e => {
  const wgEl = e.target.closest('[data-wg]');
  if (wgEl && !e.target.closest('button, a')) { go(view, { k: 'wg', id: wgEl.dataset.wg }); return; }
  const cpEl = e.target.closest('[data-copy]');
  if (cpEl && !e.target.closest('button, a')) { navigator.clipboard?.writeText(cpEl.dataset.copy).then(() => toast(t('Скопійовано'))); return; }
  if (overlay?.classList.contains('menu') && !overlay.contains(e.target)) closeOverlay();
  // the search flyout
  const inFly = e.target.closest('#sbox');
  if (!inFly) closeFly();
  else {
    const it = e.target.closest('.fly .it');
    const add = e.target.closest('[data-addfull]');
    if (add) { post({ t: 'add', url: add.dataset.addfull }); add.outerHTML = `<span class="pill acc">${t('У бібліотеці')}</span>`; return; }
    if (it) { const x = fly.items[+it.dataset.i]; remember($('#q').value); $('#q').value = ''; closeFly(); x?.fn(); return; }
    const hq = e.target.closest('[data-hq]');
    if (hq) { $('#q').value = hq.dataset.hq; fly.i = 0; flyRender(); $('#q').focus(); return; }
    const fv = e.target.closest('[data-fv]');
    if (fv) { $('#q').value = ''; closeFly(); setView(fv.dataset.fv); return; }
    if (e.target.closest('[data-allres]')) { flyAll(); return; }
    return;
  }
  const fl = e.target.closest('[data-fold]');
  if (fl && !e.target.closest('button')) { fold[fl.dataset.fold] = !fold[fl.dataset.fold]; store.set('fold', fold); renderNav(); return; }
  const nav = e.target.closest('[data-view]');
  if (nav) return go(nav.dataset.view);
  const op = e.target.closest('[data-open]');
  if (op && !e.target.closest('button')) { if (op.dataset.tab) tabOf[op.dataset.open] = op.dataset.tab; return openApp(op.dataset.open); }
  const rep = e.target.closest('[data-repo]');
  if (rep) { const au = authors().find(x => x.login === rep.dataset.login); return openRepo(rep.dataset.repo, au?.repos.find(r => r.full === rep.dataset.repo)); }
  const drow = e.target.closest('.r[data-full]');
  if (drow && !e.target.closest('button')) { const au = page?.k === 'author' ? authors().find(x => x.login.toLowerCase() === page.login.toLowerCase()) : null; return openRepo(drow.dataset.full, au?.repos.find(r => r.full === drow.dataset.full) || disc.items.find(x => x.full === drow.dataset.full)); }
  const arow = e.target.closest('.r[data-login]');
  if (arow && !e.target.closest('button')) return openAuthor(arow.dataset.login);
  const row = e.target.closest('.r[data-id]');
  if (row && !e.target.closest('button')) {
    const id = row.dataset.id;
    if (e.ctrlKey) {
      if (!multi.size && cursor && visibleOrder().some(a => a.id === cursor)) multi.add(cursor);
      multi.has(id) ? multi.delete(id) : multi.add(id);
      cursor = id;
      renderMain();
      return;
    }
    if (e.shiftKey && cursor) {
      const order = visibleOrder().map(a => a.id);
      const [i, j] = [order.indexOf(cursor), order.indexOf(id)].sort((x, y) => x - y);
      multi.clear();
      if (i >= 0) order.slice(i, j + 1).forEach(x => multi.add(x));
      renderMain();
      return;
    }
    return openApp(id);
  }
  const zoom = e.target.closest('.md img, .shots img, [data-act="zoom"]');
  if (zoom) { e.preventDefault(); return lightbox(zoom.dataset?.src || zoom.currentSrc || zoom.src); }
  const link = e.target.closest('.md a[href]');
  if (link) {
    e.preventDefault();
    const a = page?.k === 'app' && appById(page.id);
    const mdf = a && a.kind === 'github' && new RegExp(`^https://github\\.com/${a.owner}/${a.repo}/blob/[^/]+/(.+\\.(md|markdown))$`, 'i').exec(link.href.split('#')[0]);
    if (mdf) { readmes[a.id] = null; readmePath[a.id] = decodeURIComponent(mdf[1]); post({ t: 'readme', id: a.id, path: readmePath[a.id] }); renderMain(); $('#main').scrollTop = 0; return; }
    post({ t: 'open', url: link.href });
    return;
  }
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const a = appById(page?.id);
  const act = b.dataset.act;
  switch (act) {
    case 'crumb': go(view, null); break;
    case 'primary': { const p = a && primary(a); if (p && !p.busy) p.fn?.(); break; }
    case 'versions': menuAt(b, [
      { icon: 'download', label: t('Інша версія…'), fn: () => { tabOf[a.id] = 'releases'; renderMain(); } },
      a.inst?.method === 'portable' && a.inst.prev && { icon: 'undo', label: `${t('Повернути попередню версію')} ${a.inst.prev}`, fn: () => post({ t: 'rollback', id: a.id }) },
      a.latest && (a.skip ? { icon: 'undo', label: `${t('Не пропускати')} ${verOf(a.skip)}`, fn: () => edit(a.id, { skip: '' }) } : isUpd(a) && { icon: 'x', label: `${t('Пропустити')} ${verOf(a.latest.tag)}`, fn: () => edit(a.id, { skip: a.latest.tag }) }),
    ].filter(Boolean), true); break;
    case 'appMore': case 'linkMore': menuAt(b, appMenuItems(a), true); break;
    case 'repoMore': menuAt(b, repoMenuItems(page.full, page.item || {}), true); break;
    case 'newGroup': newGroup(); break;
    case 'groupCtx': { const g = groups().find(x => x.id === view.slice(2)); const r = b.getBoundingClientRect(); if (g) groupContext(r.right - 220, r.bottom + 4, g); break; }
    case 'sort': menuAt(b, [['group', 'За групами'], ['name', 'За назвою'], ['added', 'Нещодавно додані']].map(([k, l]) => ({ label: t(l), check: sortBy === k, fn: () => { sortBy = k; store.set('sort', k); renderMain(); } })), true); break;
    case 'launch': case 'folder': case 'refresh': case 'pageSource': case 'rollback': case 'vtCheck': case 'vtUpload': post({ t: act, id: a.id }); break;
    case 'installId': {
      // a program of the picks installs alike from every place: with the folder picked for it, if any
      const pid = b.dataset.id.startsWith('wg:') ? b.dataset.id.slice(3) : '';
      if (pid) { post({ t: 'wgInstall', ids: [pid], to: wgLoc[pid] || '' }); delete wgLoc[pid]; } else post({ t: 'install', id: b.dataset.id });
      break;
    }
    case 'launchId': post({ t: 'launch', id: b.dataset.id }); break;
    case 'copyText': navigator.clipboard?.writeText(b.dataset.text).then(() => toast(t('Скопійовано'))); break;
    case 'imports': importMenu(b); break;
    case 'impStars': importStars(); break;
    case 'impObtainium': importObtainium(); break;
    case 'impBookmarks': importBookmarks(); break;
    case 'impList': importText(); break;
    case 'kitId': { const x = appById(b.dataset.id); if (x) edit(x.id, { kit: !x.kit }); break; }
    case 'addKit': post({ t: 'addKit', full: b.dataset.full }); b.classList.add('on'); toast(t('Додано в мій набір')); break;
    case 'exportKit': post({ t: 'export', zip: true, withBk: bkWith, kitOnly: true }); break;
    case 'groupPick': menuAt(b, [...groups().map(g => ({ label: g.name, dot: g.color || '#8d9099', check: view === 'g:' + g.id, fn: () => setView('g:' + g.id) })), '-', { icon: 'add', label: t('Нова група…'), fn: () => newGroup('') }]); break;
    case 'discFilters': discOpen = !discOpen; store.set('discOpen', discOpen); renderMain(true); break;
    case 'pickSel': { const id = b.dataset.id; pickSel.has(id) ? pickSel.delete(id) : pickSel.add(id); renderMain(); break; }
    case 'pickSelAll': { const W = S.winget || { items: [] }; const ids = W.items.filter(x => !x.has && (!pickCat || x.cat === pickCat)).map(x => x.id); const all = ids.every(id => pickSel.has(id)); ids.forEach(id => (all ? pickSel.delete(id) : pickSel.add(id))); renderMain(); break; }
    case 'pickSelNone': pickSel.clear(); renderMain(); break;
    case 'pickInstall': { const ids = [...pickSel].filter(id => (S.winget?.items || []).some(x => x.id === id && !x.has)); if (ids.length) post({ t: 'wgInstall', ids, to: '' }); pickSel.clear(); renderMain(); break; }
    case 'pickKit': { for (const id of pickSel) { const lib = appById('wg:' + id); if (lib) { if (!lib.kit) edit(lib.id, { kit: true }); } else post({ t: 'wgKit', id }); } toast(t('Додано в мій набір')); pickSel.clear(); renderMain(); break; }
    case 'pickQx': pickQ = ''; renderMain(true); $('#pickQ')?.focus(); break;
    case 'relNotes': tabOf[b.dataset.id] = 'news'; openApp(b.dataset.id); break;
    case 'rollbackId': post({ t: 'rollback', id: b.dataset.id }); break;
    case 'kitShare': shareMenu(b, apps().filter(x => x.kit && KITABLE(x)).map(x => x.id)); break;
    case 'kitUrlAdd': { const u = $('#kitUrl')?.value.trim(); if (u && looksLikeLink(u)) { post({ t: 'add', url: u, group: '', kit: true }); $('#kitUrl').value = ''; } else if (u) toast(t('Не схоже на посилання'), true); break; }
    case 'kitQx': kitQ = ''; renderMain(true); $('#kitQ')?.focus(); break;
    case 'copySpecs': {
      const y = S.sys || {};
      const c = y.cpu || {};
      const lines = [`${S.pc || 'PC'}`, y.windows && `Windows: ${y.windows}${y.build ? ' (' + y.build + ')' : ''}`, c.name && `CPU: ${cpuShort(c.name)}${c.cores ? ` · ${c.cores}C/${c.threads || c.cores}T` : ''}`, ...(y.gpus || []).map(g => `GPU: ${g.name}${g.vram ? ' · ' + fmtSize(g.vram) : ''}${g.driver ? ' · ' + g.driver : ''}`), y.ram && `RAM: ${fmtSize(y.ram)}${y.mem?.type ? ' ' + y.mem.type : ''}${y.mem?.speed ? '-' + y.mem.speed : ''}`, y.board?.model && `Board: ${y.board.maker || ''} ${y.board.model}${y.board.bios ? ' · BIOS ' + y.board.bios : ''}`, ...(y.volumes || []).map(v => `${v.letter} ${v.disk?.name || ''} · ${fmtSize(v.total)}`)].filter(Boolean);
      navigator.clipboard?.writeText(lines.join('\n')).then(() => toast(t('Скопійовано')), () => {});
      break;
    }
    case 'homeTab': homeTab = b.dataset.tab; store.set('homeTab', homeTab); renderMain(); break;
    case 'goDevices': go('settings'); requestAnimationFrame(() => $('#setDev')?.scrollIntoView({ block: 'start', behavior: 'smooth' })); break;
    case 'addNew': openAdd(); break;
    case 'launchId': post({ t: 'launch', id: b.dataset.id }); break;
    case 'rowMenu': { const ap = appById(b.dataset.id); if (ap) menuAt(b, appMenuItems(ap), true); break; }
    case 'rowPick': { const id = b.dataset.id; multi.has(id) ? multi.delete(id) : multi.add(id); cursor = id; renderMain(); break; }
    case 'pickAll': { const ids = visibleOrder().map(x => x.id); const all = ids.every(id => multi.has(id)); multi.clear(); if (!all) ids.forEach(id => multi.add(id)); renderMain(); break; }
    case 'pickNone': multi.clear(); renderMain(); break;
    case 'libQx': libQ = ''; renderMain(true); $('#libQ')?.focus(); break;
    case 'instPick': menuAt(b, [['', 'Усі'], ['on', 'Встановлені'], ['off', 'Не встановлені']].map(([k, l]) => ({ label: t(l), check: instFilterOf() === k, fn: () => { instFilters = { ...instFilters, [view]: k }; store.set('instFilters', instFilters); render(); } }))); break;
    case 'tagPick': menuAt(b, allTags().slice(0, 30).map(([tg, c]) => ({ label: `#${tg} · ${c}`, check: view === 'tag:' + tg, fn: () => setView('tag:' + tg) }))); break;
    case 'openRepo': case 'openLink': post({ t: 'open', url: a.url }); break;
    case 'openUrl': post({ t: 'open', url: b.dataset.url }); break;
    case 'openPath': post({ t: 'openPath', path: b.dataset.path }); break;
    case 'pin': if (a?.inst) edit(a.id, { pin: a.pin ? '' : (a.inst.tag || a.inst.version) }); break;
    case 'skip': edit(a.id, { skip: a.latest.tag }); break;
    case 'unskip': edit(a.id, { skip: '' }); break;
    case 'kit': edit(a.id, { kit: !a.kit }); break;
    case 'remove': confirmRemove([a.id]); break;
    case 'groupMenu': groupMenu(b, [a.id]); break;
    case 'untag': edit(a.id, { tags: a.tags.filter(x => x !== b.dataset.tag) }); break;
    case 'tab': tabOf[a.id] = b.dataset.tab; renderMain(true); break;
    case 'expand': b.classList.add('open'); break;
    case 'installAsset': {
      const go2 = () => post({ t: 'install', id: a.id, asset: b.dataset.asset, tag: b.dataset.tag });
      if (b.dataset.old) dialog({ title: t('Встановити старішу версію?'), text: `${a.name} ${verOf(b.dataset.tag)}. ${t('Komora закріпить програму на ній, щоб не пропонувати оновлення. Відкріпити можна на сторінці програми.')}`, ok: t('Встановити') }).then(r => r && go2());
      else go2();
      break;
    }
    case 'addOpen': openAdd(); break;
    case 'addToGroup': openAdd('', view.slice(2)); break;
    case 'addUrl': post({ t: 'add', url: b.dataset.url }); b.outerHTML = `<span class="pill acc">${ic('check')}<span class="lbl">${t('У бібліотеці')}</span></span>`; break;
    case 'importMenu': importMenu(b); break;
    case 'openParent': openRepo(a.parent); break;
    case 'repoOpen': openRepo(b.dataset.full); break;
    case 'appSw': if (!S.cfg.preAll) edit(a.id, { [b.dataset.key]: !b.classList.contains('on') }); break;
    case 'appSet': edit(a.id, { [b.dataset.key]: b.dataset.val }); break;
    case 'appClearDir': edit(a.id, { setupDir: '' }); break;
    case 'updateAll': updateAll(); break;
    case 'skipId': { const ap = appById(b.dataset.id); if (ap?.latest) { edit(ap.id, { skip: ap.latest.tag }); toast(`${t('Пропущено')}: ${ap.name} ${verOf(ap.latest.tag)}`); } break; }
    case 'wgSkip': post({ t: 'wgSkip', id: b.dataset.id, ver: b.dataset.v || '' }); if (b.dataset.v) toast(`${t('Пропущено')}: ${b.dataset.v}`); break;
    case 'unskipId': edit(b.dataset.id, { skip: '' }); break;
    case 'histAll': histAll = true; renderMain(true); break;
    case 'wgScan': post({ t: 'wgScan' }); break;
    case 'wgInstall': post({ t: 'wgInstall', ids: [b.dataset.id], to: wgLoc[b.dataset.id] || '' }); delete wgLoc[b.dataset.id]; break;
    case 'wgLocClear': delete wgLoc[b.dataset.id]; renderMain(true); break;
    case 'cancel': post({ t: 'cancel', id: b.dataset.id }); break;
    case 'followOwner': { const lg = b.dataset.login; if (authors().some(x => x.login.toLowerCase() === lg.toLowerCase())) openAuthor(lg); else { post({ t: 'follow', login: lg }); toast(`${t('Стежиш за')} ${lg}`); } break; }
    case 'pcName': (async () => { const r = await dialog({ title: t('Назва цього ПК у Komora'), text: t('Для Огляду, синхронізації й наборів. Порожньо — ім’я комп’ютера у Windows') + ` (${S.pcWin || ''}).`, ok: t('Зберегти'), input: { value: S.cfg.pcName || '', placeholder: S.pcWin || '', optional: true } }); if (r) post({ t: 'cfg', key: 'pcName', val: r.value || '' }); })(); break;
    case 'steamIconsFix': post({ t: 'steamIconsFix' }); toast(t('Шукаю ігри в бібліотеках Steam…')); break;
    case 'groupKit': post({ t: 'kitGroup', id: view.slice(2), on: true }); toast(t('Додано в мій набір')); break;
    case 'kitGroupOff': post({ t: 'kitGroup', id: b.dataset.id, on: false }); break;
    case 'groupAuto': { const g = groups().find(x => x.id === b.dataset.id); if (g) post({ t: 'kitGroupAuto', id: g.id, on: !g.kitAuto }); break; }
    case 'kitAuthor': post({ t: 'kitAuthor', login: b.dataset.login, on: !b.classList.contains('on') }); break;
    case 'kitTweak': post({ t: 'kitTweak', id: b.dataset.id, on: !b.classList.contains('on') }); break;
    case 'kitAdd': kitAddMenu(b, b.dataset.kind); break;
    case 'fix': post({ t: 'fix', what: b.dataset.what }); if (b.dataset.what !== 'sfc') toast(t('Виконую…')); break;
    case 'addToGroupPick': addToGroupMenu(b); break;
    case 'look': post({ t: 'cfg', key: 'theme', val: b.dataset.kind }); post({ t: 'cfg', key: b.dataset.kind === 'dark' ? 'darkLook' : 'lightLook', val: b.dataset.val }); break;
    case 'toolsClean': post({ t: 'toolsClean', what: b.dataset.what }); toast(t('Очищаю…')); break;
    case 'pickCat': pickCat = b.dataset.c; store.set('pickCat', pickCat); renderMain(true); break;
    case 'kitAddInstalled': for (const x of apps().filter(x => INSTALLABLE(x) && x.inst && !x.kit)) edit(x.id, { kit: true }); toast(t('Додано в мій набір')); break;
    case 'instFilter': instFilters = { ...instFilters, [view]: instFilterOf() === b.dataset.f ? '' : b.dataset.f }; store.set('instFilters', instFilters); render(); break;
    case 'kitBy': kitBy = b.dataset.by; store.set('kitBy', kitBy); renderMain(true); break;
    case 'kitFold': kitFold[b.dataset.k] = !kitFold[b.dataset.k]; store.set('kitFold', kitFold); renderMain(true); break;
    case 'repoRowMenu': menuAt(b, repoMenuItems(b.dataset.full, disc.items.find(x => x.full === b.dataset.full) || {}), true); break;
    case 'hidePicks': hidePicks = !hidePicks; store.set('hidePicks', hidePicks); render(); break;
    case 'wgInstallTo': post({ t: 'wgPickDir', id: b.dataset.id }); break;
    case 'serials': showSerials = !showSerials; renderMain(true); break;
    case 'wgUpdateAll': post({ t: 'wgInstall', ids: wgAllUpdates().map(x => x.id) }); break;
    case 'kitInstall': post({ t: 'installMany', ids: apps().filter(x => x.kit && INSTALLABLE(x) && !x.inst).map(x => x.id) }); break;
    // GitHub search and repositories
    case 'discGo': discNewQuery($('#dq').value); break;
    case 'hubSite': { const s2 = b.dataset.site, ch = disc.site !== s2; disc.site = s2; if ($('#dq')) disc.q = $('#dq').value; if (view !== 'discover' || page) go('discover'); if (ch || !disc.ran) discSearch(); else renderMain(true); break; }
    case 'discMore': discSearch(true); break;
    case 'histQ': $('#dq').value = b.dataset.q; discNewQuery(b.dataset.q); break;
    case 'preset': { const p = PRESETS.find(x => x[0] === b.dataset.p); if (p) { Object.assign(disc, p[1]); discSearch(); } break; }
    case 'discTopic': Object.assign(disc, { site: 'github', q: '', topic: b.dataset.topic, stars: '', updated: '', created: '', lang: '' }); go('discover'); discSearch(); break;
    case 'openLib': { const lib = inLib(page.full); if (lib) openApp(lib.id); break; }
    case 'discInstall': post({ t: 'addInstall', full: page.full }); break;
    case 'addInstall': post({ t: 'addInstall', full: b.dataset.full }); toast(t('Додаю й встановлюю…')); break;
    case 'discAdd': post({ t: 'add', url: page.full }); break;
    // authors
    case 'follow': { const v = ($('#followIn')?.value || '').trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').split(/[/?#]/)[0]; if (v) { post({ t: 'follow', login: v }); toast(t('Шукаю автора…')); } break; }
    case 'unfollow': { const login = page.login; dialog({ title: t('Не стежити?'), text: login, ok: t('Не стежити'), danger: true }).then(r => { if (r) { post({ t: 'unfollow', login }); goBack(); } }); break; }
    case 'authorRefresh': post({ t: 'authorRefresh', login: page.login }); toast(t('Оновлюю…')); break;
    case 'authorSeen': post({ t: 'authorSeen', login: page.login }); break;
    // tweaks
    case 'tweakFilter': tweakFilter = b.dataset.f; renderMain(); break;
    case 'tweakSw': case 'tweakOn': {
      const id = b.dataset.id, on = act === 'tweakOn' || !b.dataset.on;
      tweakBusy.add(id);
      post({ t: 'tweak', id, on });
      renderMain();
      break;
    }
    case 'tweakFix': for (const x of (tweakList || []).filter(w => w.status === 'reset')) { tweakBusy.add(x.id); post({ t: 'tweak', id: x.id, on: true }); } renderMain(); break;
    case 'tweakNew': tweakEditor(null); break;
    case 'tweakEdit': tweakEditor(tweakList.find(w => w.id === b.dataset.id)); break;
    case 'explorer': dialog({ title: t('Перезапустити Провідник?'), text: t('Панель завдань і відкриті вікна Провідника зникнуть на кілька секунд.'), ok: t('Перезапустити') }).then(r => r && post({ t: 'explorer' })); break;
    // backups of app settings
    case 'bkAdd': case 'bkDel': {
      const key = b.dataset.kind === 'reg' ? 'breg' : 'bpaths';
      const cur = a[key] || [];
      edit(a.id, { [key]: act === 'bkAdd' ? [...cur, b.dataset.p] : cur.filter(x => x !== b.dataset.p) });
      break;
    }
    case 'bkPick': post({ t: 'pickPath', purpose: 'bkPath', id: a.id }); break;
    case 'bkRegAdd': { const k = $('#bkReg').value.trim(); if (/^HK(CU|LM|EY_)/i.test(k)) edit(a.id, { breg: [...(a.breg || []), k] }); else toast(t('Ключ має починатися з HKCU\\ або HKLM\\'), true); break; }
    case 'backup': post({ t: 'backup', id: a.id }); break;
    case 'restore': dialog({ title: t('Відновити налаштування?'), text: `${a.name}. ${t('Спершу закрий програму: її файли налаштувань буде замінено копією.')}`, ok: t('Відновити') }).then(r => r && post({ t: 'restore', id: a.id, which: b.dataset.which })); break;
    case 'pickPath': post({ t: 'pickPath', purpose: b.dataset.purpose, id: page?.id || '' }); break;
    // another PC, sync
    case 'export': post({ t: 'export', zip: !!b.dataset.zip, withBk: bkWith }); break;
    case 'openBundle': if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); } post({ t: 'openBundle' }); break;
    case 'dropBundle': bundlePrev = null; renderMain(); break;
    case 'restoreGo': {
      const q = at => [...document.querySelectorAll(`#restore [${at}]:checked`)].map(x => x.getAttribute(at));
      const ids = q('data-ri'), bi = q('data-bi'), bt = q('data-bt');
      if (bundlePrev) { post({ t: 'acceptBundle', install: bi, tweaks: bt }); bundleRun = { pc: bundlePrev.pc, ids: bi, tweaks: bt }; }
      bundlePrev = null;
      if (ids.length) post({ t: 'installMany', ids });
      renderMain();
      break;
    }
    case 'kitRules': {
      const c = S.cfg;
      const r = (key, label, tip) => ({ label: t(label), sub: t(tip), sw: true, on: !!c[key], keep: true, fn: () => post({ t: 'cfg', key, val: !c[key] }) });
      menuAt(b, [r('kitAutoUpdate', 'Оновлювати автоматично', 'Нові версії програм набору ставляться самі після кожної перевірки оновлень'), r('kitAutoInstall', 'Ставити відсутні автоматично', 'Коли набір з’являється на цьому ПК — через синхронізацію чи файл набору, — програми, яких тут немає, встановлюються без твого кліку'), r('kitNew', 'Нове одразу в набір', 'Програми, посилання, групи, автори й твіки, які додаєш, одразу потрапляють у набір')], true);
      break;
    }
    case 'pcFold': store.set('pcFold', !store.get('pcFold', true)); renderMain(true); break;
    case 'expScope': expScope = b.dataset.v; store.set('expScope', expScope); renderMain(true); break;
    case 'exportGo': post({ t: 'export', zip: true, withBk: bkWith, kitOnly: expScope === 'kit' }); break;
    case 'tweakTab': tweakTab = b.dataset.tab; store.set('tweakTab', tweakTab); renderMain(true); break;
    case 'wgKit': post({ t: 'wgKit', id: b.dataset.id }); break;
    case 'wgFindGo': go('newpc'); wgImp = { loading: true }; post({ t: 'wgInstalled' }); renderMain(); break;
    case 'wgFind': wgImp = { loading: true }; post({ t: 'wgInstalled' }); renderMain(); setTimeout(() => $('#wgImp')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50); break;
    case 'wgImpKit': wgImpKit = !wgImpKit; renderMain(); break;
    case 'wgImpClose': wgImp = null; renderMain(); break;
    case 'wgImportGo': {
      const items = [...document.querySelectorAll('#wgImp input[data-wi]:checked')].map(i => ({ id: i.dataset.wi, name: i.dataset.wn }));
      if (!items.length) { toast(t('Нічого не вибрано')); break; }
      post({ t: 'wgImport', items, kit: wgImpKit });
      wgImp = null;
      renderMain();
      break;
    }
    case 'acceptBundle': {
      const ids = [...document.querySelectorAll('[data-bi]:checked')].map(x => x.dataset.bi);
      const tw = [...document.querySelectorAll('[data-bt]:checked')].map(x => x.dataset.bt);
      post({ t: 'acceptBundle', install: ids, tweaks: tw });
      bundleRun = { pc: bundlePrev.pc, ids, tweaks: tw };
      bundlePrev = null;
      renderMain();
      break;
    }
    case 'offeredToggle': offeredOpen = !offeredOpen; renderMain(); break;
    case 'installOffered': {
      const boxes = [...document.querySelectorAll('[data-oi]')];
      const ids = boxes.length ? boxes.filter(x => x.checked).map(x => x.dataset.oi) : apps().filter(x => INSTALLABLE(x) && x.wasInstalled && !x.inst).map(x => x.id);
      post({ t: 'installMany', ids });
      break;
    }
    case 'syncMode': {
      const m = b.dataset.mode;
      dbxForm = false;
      if (m === 'off') { post({ t: 'cfg', key: 'syncDir', val: '' }); post({ t: 'cfg', key: 'syncGist', val: false }); post({ t: 'cfg', key: 'syncDbx', val: false }); }
      else if (m === 'gist') { post({ t: 'cfg', key: 'syncDir', val: '' }); post({ t: 'cfg', key: 'syncGist', val: true }); }
      else if (m === 'dropbox') { if (S.cfg.hasDbx) post({ t: 'cfg', key: 'syncDbx', val: true }); else { dbxForm = true; renderMain(true); } }
      else if (!S.cfg.syncDir) { post({ t: 'cfg', key: 'syncGist', val: false }); if (clouds?.length) post({ t: 'cfg', key: 'syncDir', val: clouds[0][1] }); else post({ t: 'pickPath', purpose: 'syncDir' }); }
      break;
    }
    case 'cfgVal': post({ t: 'cfg', key: b.dataset.key, val: b.dataset.val }); if (b.dataset.key === 'syncDir' && b.dataset.val) post({ t: 'cfg', key: 'syncGist', val: false }); break;
    case 'syncNow': post({ t: 'syncNow' }); break;
    // settings
    case 'btDev': { const d = (S.bt || []).find(x => x.id === b.dataset.id); if (d) post({ t: 'btDev', id: d.id, on: !d.tray }); break; }
    case 'cfgSw': post({ t: 'cfg', key: b.dataset.key, val: !(b.classList.contains('on') || b.querySelector('.sw.on')) }); break;
    case 'keyEdit': keyEdit = b.dataset.key; renderMain(true); $(`#key_${keyEdit}`)?.focus(); break;
    case 'keyCancel': keyEdit = ''; renderMain(true); break;
    case 'saveKey': { const k = b.dataset.key, inp = $(`#key_${k}`); const v = inp?.value.trim(); if (v) { post({ t: 'cfg', key: k, val: v }); inp.value = ''; keyEdit = ''; toast(t('Ключ збережено')); } break; }
    case 'clearKey': dialog({ title: t('Прибрати ключ?'), ok: t('Прибрати'), danger: true }).then(r => r && post({ t: 'cfg', key: b.dataset.key, val: '' })); break;
    case 'check': post({ t: 'check' }); break;
    case 'firstAdd': { const v = $('#firstUrl').value.trim(); if (v) post({ t: 'add', url: v }); break; }
    case 'bulkUpdate': for (const id of multi) if (isUpd(appById(id) || {})) post({ t: 'install', id }); break;
    case 'bulkKit': { const list = [...multi].map(appById).filter(Boolean); const on = !list.every(x => x.kit); for (const x of list) edit(x.id, { kit: on }); break; }
    case 'bulkGroup': groupMenu(b, [...multi]); break;
    case 'bulkRemove': confirmRemove([...multi]); break;
    case 'bulkShare': shareMenu(b, [...multi]); break;
    case 'shareAll': shareMenu(b, []); break;
    case 'dbxBegin': post({ t: 'dbxBegin' }); break;
    case 'bkWith': bkWith = !bkWith; store.set('bkWith', bkWith); renderMain(true); break;
    case 'dbxFinish': { const code = $('#dbxCode')?.value.trim(); if (code) post({ t: 'dbxFinish', code }); break; }
    case 'dbxOff': dbxForm = false; post({ t: 'dbxOff' }); break;
  }
});

document.addEventListener('contextmenu', e => {
  if (/INPUT|TEXTAREA/.test(e.target.tagName) || e.target.closest('.md')) return;
  e.preventDefault();
  const rq = e.target.closest('[data-hq], [data-act="histQ"]');
  if (rq) {
    const q = rq.dataset.hq ?? rq.dataset.q;
    hist = hist.filter(x => x !== q);
    store.set('hist', hist);
    if (rq.dataset.hq != null) flyRender(); else renderMain(true);
    return;
  }
  const g = e.target.closest('[data-group]');
  if (g) { const grp = groups().find(x => x.id === g.dataset.group); if (grp) groupContext(e.clientX, e.clientY, grp); return; }
  const row = e.target.closest('.r[data-id]');
  if (row) { const a = appById(row.dataset.id); if (a) appContext(e.clientX, e.clientY, a); return; }
  const rr = e.target.closest('.r[data-full]');
  if (rr) showMenu(e.clientX, e.clientY, repoMenuItems(rr.dataset.full, disc.items.find(x => x.full === rr.dataset.full) || {}));
});

// ---- drag: apps onto a group of the sidebar; links from a browser into the window (added)
let dropShown = null;
/** A group of the sidebar being moved to a new place with the mouse: its row follows the pointer, the others make room. */
let dragGroup = '';
let gMove = null;
document.addEventListener('mousedown', e => {
  const row = e.button === 0 && !e.target.closest('button') && e.target.closest('.n[data-group]');
  if (row) gMove = { row, id: row.dataset.group, y0: e.clientY, on: false };
});
document.addEventListener('mousemove', e => {
  if (!gMove) return;
  if (!(e.buttons & 1)) { endGroupMove(false); return; }
  const dy = e.clientY - gMove.y0;
  if (!gMove.on) {
    if (Math.abs(dy) < 5) return;
    gMove.on = true;
    dragGroup = gMove.id;
    gMove.row.classList.add('gmove');
    document.body.classList.add('gmoving');
  }
  // the row goes before the first other row whose middle is under the pointer
  const rows = [...document.querySelectorAll('#nav .n[data-group]')].filter(r => r !== gMove.row);
  const before = rows.find(r => { const b = r.getBoundingClientRect(); return e.clientY < b.top + b.height / 2; });
  const last = rows[rows.length - 1];
  if (before) { if (gMove.row.nextElementSibling !== before) before.before(gMove.row); }
  else if (last && last.nextElementSibling !== gMove.row) last.after(gMove.row);
  e.preventDefault();
});
document.addEventListener('mouseup', e => { if (gMove && e.button === 0) endGroupMove(true); });
document.addEventListener('keydown', e => { if (gMove?.on && e.key === 'Escape') endGroupMove(false); }, true);
/** Ends a move of a group: `keep` — the new place is saved, else the sidebar goes back as it was. */
function endGroupMove(keep) {
  const m = gMove;
  gMove = null;
  if (!m?.on) return;
  m.row.classList.remove('gmove');
  document.body.classList.remove('gmoving');
  dragGroup = '';
  // the click that ends a move does not open the group
  const eat = ev => { ev.stopPropagation(); ev.preventDefault(); };
  window.addEventListener('click', eat, true);
  setTimeout(() => window.removeEventListener('click', eat, true), 0);
  const to = [...document.querySelectorAll('#nav .n[data-group]')].indexOf(m.row);
  if (keep && to !== groups().findIndex(x => x.id === m.id)) {
    // the page shows the new order at once; the library confirms it
    const list = groups().slice();
    const i = list.findIndex(x => x.id === m.id);
    if (i >= 0) { list.splice(to, 0, list.splice(i, 1)[0]); S.lib.groups = list; }
    post({ t: 'group', op: 'move', id: m.id, to });
  }
  renderLater = false;
  render();
}
document.addEventListener('dragstart', e => {
  const gn = e.target.closest?.('.n[data-group]');
  if (gn) { e.preventDefault(); return; }
  const row = e.target.closest?.('.r[data-id]');
  if (!row) return;
  dragIds = multi.has(row.dataset.id) ? [...multi] : [row.dataset.id];
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('application/x-komora', dragIds.join(','));
  const a = appById(dragIds[0]);
  const gh = document.createElement('div');
  gh.className = 'ghost';
  gh.style.left = '-1000px';
  gh.innerHTML = `${iconHtml(a, 'sm')}<span>${esc(a.name)}${dragIds.length > 1 ? ` +${dragIds.length - 1}` : ''}</span>`;
  document.body.append(gh);
  e.dataTransfer.setDragImage(gh, 14, 14);
  setTimeout(() => gh.remove(), 0);
});
const outsideLink = e => !dragIds.length && [...(e.dataTransfer?.types || [])].some(x => x === 'text/uri-list' || x === 'text/plain');
function showDrop(on) {
  if (on && !dropShown) { dropShown = document.createElement('div'); dropShown.className = 'drop'; dropShown.innerHTML = `<div>${t('Відпусти — посилання додасться в бібліотеку')}</div>`; document.body.append(dropShown); }
  if (!on && dropShown) { dropShown.remove(); dropShown = null; }
}
document.addEventListener('dragover', e => {
  if (outsideLink(e)) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; showDrop(true); return; }
  const g = e.target.closest('[data-group], [data-kitdrop]');
  document.querySelectorAll('.n.drop').forEach(n => n !== g && n.classList.remove('drop'));
  if (g && dragIds.length) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; g.classList.add('drop'); }
});
document.addEventListener('dragenter', e => { if (e.target.closest?.('[data-group], [data-kitdrop]') && dragIds.length) e.preventDefault(); });
document.addEventListener('dragleave', e => { if (!e.relatedTarget) showDrop(false); });
document.addEventListener('drop', e => {
  showDrop(false);
  if (outsideLink(e)) {
    e.preventDefault();
    const url = (e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain') || '').split(/\r?\n/).find(x => x && !x.startsWith('#'))?.trim();
    if (url && looksLikeLink(url)) post({ t: 'add', url, group: view.startsWith('g:') ? view.slice(2) : '' });
    else toast(t('Не схоже на посилання'), true);
    return;
  }
  const g = e.target.closest('[data-group], [data-kitdrop]');
  document.querySelectorAll('.n.drop').forEach(n => n.classList.remove('drop'));
  if (!g || !dragIds.length) return;
  e.preventDefault();
  if (g.dataset.kitdrop) { for (const id of dragIds) { const a = appById(id); if (a && !a.kit && KITABLE(a)) edit(id, { kit: true }); } dragIds = []; toast(t('Додано в мій набір')); if (renderLater) { renderLater = false; render(); } return; }
  for (const id of dragIds) { const a = appById(id); if (a && !a.groups.includes(g.dataset.group)) edit(id, { groups: [...a.groups, g.dataset.group] }); }
  dragIds = [];
  if (renderLater) { renderLater = false; render(); }
});
document.addEventListener('dragend', () => { dragIds = []; showDrop(false); document.querySelectorAll('.n.drop').forEach(n => n.classList.remove('drop')); if (renderLater) { renderLater = false; render(); } });

// ---- the library's own filter: the table follows the typing
document.addEventListener('input', e => {
  const id = e.target.id;
  if (id !== 'libQ' && id !== 'pickQ' && id !== 'kitQ') return;
  if (id === 'libQ') libQ = e.target.value; else if (id === 'pickQ') pickQ = e.target.value; else kitQ = e.target.value;
  const p = e.target.selectionStart;
  renderMain(true);
  const q = $('#' + id);
  if (q) { q.focus(); q.setSelectionRange(p, p); }
});
document.addEventListener('keydown', e => {
  const id = e.target.id;
  if (e.key === 'Enter' && id === 'kitUrl') { $('[data-act="kitUrlAdd"]')?.click(); return; }
  if (e.key !== 'Escape' || !['libQ', 'pickQ', 'kitQ'].includes(id) || !e.target.value) return;
  e.stopPropagation();
  if (id === 'libQ') libQ = ''; else if (id === 'pickQ') pickQ = ''; else kitQ = '';
  renderMain(true);
  $('#' + id)?.focus();
}, true);

// ---- Ctrl+V anywhere outside a field: a link is added
document.addEventListener('paste', e => {
  if (/INPUT|TEXTAREA/.test(e.target.tagName) || overlay) return;
  const text = (e.clipboardData?.getData('text') || '').trim();
  if (!text) return;
  e.preventDefault();
  if (/gist\.github\.com\/(\S+\/)?[0-9a-f]{20,}/i.test(text) && text.split(/\s+/).length === 1) { post({ t: 'openShared', url: text }); toast(t('Відкриваю спільний набір…')); return; }
  const links = text.match(/https?:\/\/\S+/g) || [];
  if (links.length > 1) importText(links.join('\n'));
  else if (looksLikeLink(text.split(/\s/)[0])) openAdd(text.split(/\s/)[0]);
  else if (links.length === 1) openAdd(links[0]);
  else toast(t('У буфері немає посилання'), true);
});

document.addEventListener('change', e => {
  const f = e.target.dataset?.f;
  if (f && f !== 'owner') { disc[f] = e.target.value; disc.q = $('#dq')?.value ?? disc.q; discSearch(); }
  if (e.target.dataset?.act === 'assetMatch') edit(page?.id, { assetMatch: e.target.value.trim() });
  const c = e.target.dataset?.cfg;
  if (c) {
    post({ t: 'cfg', key: c, val: c === 'checkHours' ? +e.target.value : e.target.value });
    // the page does not redraw under a focused field: let go of it, the new state redraws
    if (e.target.tagName === 'SELECT') e.target.blur();
  }
});
$('#home').addEventListener('click', () => { go('settings'); requestAnimationFrame(() => $('#about')?.scrollIntoView({ block: 'start', behavior: 'smooth' })); });
// the window buttons (the header is the title bar)
$('#winbtns').addEventListener('click', e => { const b = e.target.closest('[data-win]'); if (b) post({ t: 'win', op: b.dataset.win }); });
post({ t: 'win', op: 'state' });
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => render());

// ---------------------------------------------------------------- messages of the app

function onMessage(m) {
  switch (m.t) {
    case 'state':
      S = m;
      if (!S.checking) checkProg = null;
      if (bundleRun && bundleRun.ids.every(id => !busyOf(id)) && bundleRun.done) bundleRun = null;
      render();
      break;
    case 'busy':
      if (!S) break;
      if (m.stage) S.busy[m.id] = { stage: m.stage, pct: m.pct }; else delete S.busy[m.id];
      renderMain();
      break;
    case 'checkProg': checkProg = { done: m.done, total: m.total }; if (S) renderTop(); break;
    case 'toast': toast(msg(m.text), m.err); break;
    case 'wgList': wgImp = { items: m.items || [], err: m.err || '' }; renderMain(); break;
    case 'wgImported': toast(`${t('Додано в бібліотеку')}: ${m.n}`); break;
    case 'sys': if (S) { S.sys = m.data; if (view === 'home' && !page) renderMain(); } break;
    case 'wgInfo': wgInfo[m.id] = m.info || { err: m.err || 'no data' }; renderMain(); break;
    case 'wgLoc': wgLoc[m.id] = m.path; renderMain(true); break;
    case 'tools': toolsInfo = { sizes: m.sizes ?? toolsInfo?.sizes }; if (view === 'tweaks') renderMain(); break;
    case 'cleaned': toast(`${t('Звільнено')} ${fmtSize(m.freed) || '0'}`); break;
    case 'fixed': toast(m.err ? msg(m.err) : t({ time: 'Годинник синхронізовано', dns: 'Кеш DNS очищено', store: 'Microsoft Store скидається — він відкриється сам', wu: 'Кеш оновлень Windows очищено', sfc: 'Перевірка запущена в окремому вікні' }[m.what] || 'Готово'), !!m.err); break;
    case 'steamIcons': toast(m.fixed ? `${t('Значки повернуто')}: ${m.fixed}${m.lost ? ` · ${t('ігор не знайдено')}: ${m.lost}` : ''}` : m.lost ? `${t('ігор не знайдено')}: ${m.lost}` : t('Усі значки Steam на місці')); break;
    case 'shared':
      navigator.clipboard?.writeText(m.url);
      dialog({ title: t('Посилання готове'), text: t('Його скопійовано. Хто вставить його в Komora (Ctrl+V), побачить список і поставить, що захоче.'), ok: t('Гаразд'), body: `<div class="path" style="margin-top:10px">${esc(m.url)}</div>` });
      break;
    case 'winState':
      document.body.classList.toggle('native', !!m.native);
      document.body.classList.toggle('maxed', !!m.max);
      $('#winbtns [data-win="max"]').innerHTML = m.max ? WB.restore : WB.max;
      $('#winbtns [data-win="max"]').title = t(m.max ? 'Відновити' : 'Розгорнути');
      break;
    case 'select': {
      // something was added: a list that shows it flashes it, otherwise its page opens
      const id = m.id;
      if (page?.k === 'repo' || view === 'discover' || page?.k === 'author') break;
      if (S && isList(view) && !page && viewApps().some(a => a.id === id)) { flashId = id; cursor = id; renderMain(); }
      else if (S && appById(id)) { flashId = id; openApp(id); }
      break;
    }
    case 'author': openAuthor(m.login); break;
    case 'winget': S.winget = m.data; renderNav(); renderMain(); break;
    case 'readme': { const a = appById(m.id); readmes[m.id] = m.err ? { err: m.err } : { html: a && m.html ? clean(m.html, a, m.path || '') : '' }; renderMain(); break; }
    case 'releases': rels[m.id] = m.err ? { err: m.err } : { list: m.list || [] }; renderMain(); break;
    case 'checked': {
      const pin = (m.pinned || []).map(p => `${p.name} ${verOf(p.pin)} (${t('є')} ${verOf(p.latest)})`);
      toast(m.updates ? `${t('Доступно оновлень:')} ${m.updates}` : `${t('Усе актуальне')}${pin.length ? ` · ${t('закріплено')} ${pin.length}: ${pin.join(', ')}` : ''}`);
      if (m.failed) toast(`${t('Не вдалося перевірити:')} ${m.failed}`, true);
      if (m.resets?.length) toast(`${t('Windows скинула твіки:')} ${m.resets.join(', ')}`, true);
      if (m.news?.length) toast(`${t('Нові репозиторії авторів:')} ${m.news.join(', ')}`);
      break;
    }
    case 'forks': forksOf[m.key] = m.err ? { err: m.err } : { list: m.list || [] }; renderMain(); break;
    case 'tweaks': tweakList = m.list || []; tweakBusy.clear(); renderMain(); break;
    case 'tweakDone':
      tweakBusy.delete(m.id);
      if (m.err) toast(msg(m.err), true);
      else {
        const x = tweakList?.find(w => w.id === m.id);
        toast(`${m.on ? t('Застосовано') : t('Скасовано')}: ${tweakName(m.id)}`);
        if (m.on && x?.restart === 'explorer') toast(t('Діє після перезапуску Провідника — кнопка вгорі сторінки.'));
        if (m.on && x?.restart === 'logon') toast(t('Діє після виходу з облікового запису й повторного входу.'));
      }
      break;
    case 'bkSuggest': bk[m.id] = { dirs: m.dirs || [], regs: m.regs || [], list: m.list || [] }; renderMain(); break;
    case 'backupDone': if (bk[m.id]) bk[m.id].list = m.list || []; toast(m.err ? msg(m.err) : t('Копію налаштувань збережено'), !!m.err); renderMain(); break;
    case 'restoreDone': toast(m.err ? msg(m.err) : t('Налаштування відновлено'), !!m.err); break;
    case 'exported': toast(m.err ? msg(m.err) : `${t('Набір збережено:')} ${m.path}`, !!m.err); break;
    case 'bkSize': bkInfo = { apps: m.apps, size: m.size }; if (view === 'newpc') renderMain(); break;
    case 'bundle': bundlePrev = m.preview; if (view !== 'kit' || page) go('kit'); else renderMain(); break;
    case 'bundleDone':
      toast(`${t('Готово з набору: програм')} ${m.apps}, ${t('твіків')} ${m.tweaks}${m.failed ? ` · ${t('не вдалося')}: ${m.failed}` : ''}`, !!m.failed);
      if (bundleRun) bundleRun.done = true;
      break;
    case 'synced': toast(m.err ? msg(m.err) : m.changed ? t('Синхронізовано: є зміни з іншого ПК') : t('Синхронізовано'), !!m.err); break;
    case 'clouds': clouds = m.list || []; renderMain(); break;
    case 'bookmarks': if (bmWait) { bmWait = null; bookmarksDialog(m.tree || []); } break;
    case 'imported': toast(`${t('Додано:')} ${m.added}${m.had ? ` · ${t('уже були')}: ${m.had}` : ''}`); break;
    case 'installed':
      histList = null;
      toast(`${t('Готово')}: ${appById(m.id)?.name ?? ''}`);
      if (m.pinned) toast(`${t('Закріплено на версії')} ${verOf(m.pinned)}`);
      delete rels[m.id];
      break;
    case 'go':
      if (m.to === 'devices') {
        go('settings');
        requestAnimationFrame(() => { const el = $('#setDev'); if (el) { el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); } });
      }
      break;
    case 'hist': histList = m.items || []; if (view === 'updates' && !page) renderMain(true); break;
    case 'added': {
      const ap = appById(m.id);
      const gs = (ap?.groups || []).map(id => groups().find(g => g.id === id)?.name).filter(Boolean);
      toast([`${t('Додано в бібліотеку')}: ${m.name}`, ...gs.map(n => `«${n}»`), ap?.kit && t('Мій набір')].filter(Boolean).join(' · '));
      break;
    }
    case 'ghResults':
      if (typeof m.seq === 'string' && m.seq.startsWith('fly:')) {
        fly.gh[m.seq.slice(4)] = m.err ? { err: m.err, items: [] } : { items: m.items || [], total: m.total };
        if (!$('#fly').hidden) flyRender();
        break;
      }
      if (m.seq !== disc.seq) break;
      disc.loading = false;
      disc.err = m.err || '';
      disc.total = m.total;
      disc.items = m.page > 1 ? disc.items.concat(m.items) : m.items;
      renderMain(true);
      break;
    case 'ghRepo': repos[m.full] = { release: m.release, pick: m.pick, readme: m.readme, err: m.err, langs: m.langs || [], icon: m.icon || '' }; renderMain(); break;
  }
}
if (window.chrome?.webview) window.chrome.webview.addEventListener('message', e => onMessage(e.data));
// outside Komora (a browser with made-up data): messages are fed by hand
else window.komoraMessage = onMessage;

$('.brand .mark').innerHTML = MARK;
post({ t: 'ready' });
