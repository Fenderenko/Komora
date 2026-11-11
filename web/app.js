'use strict';
// Komora page: navigation pane (sections, groups, tags), pages in the main area (library, updates, app pages,
// search, authors, tweaks, another PC, settings), the search of the title bar.
// State comes from the app as {t:'state'} messages; actions go back as {t:…} messages.

// ---------------------------------------------------------------- translations (key: Ukrainian text)

const EN = {
  'Пошук і команди': 'Search and commands', 'Додати': 'Add', 'Бібліотека': 'Library', 'Усі програми': 'All apps',
  'Оновлення': 'Updates', 'Встановлені': 'Installed', 'Не встановлені': 'Not installed', 'Посилання': 'Links',
  'Групи': 'Groups', 'Теги': 'Tags', 'Налаштування': 'Settings', 'Нова група': 'New group',
  'Створи групу й перетягни туди програми': 'Create a group and drag apps into it',
  'Перевіряю оновлення…': 'Checking for updates…', 'Перевірено': 'Checked', 'ще не перевіряли': 'not checked yet',
  'наступна о': 'next at', 'Перевірити оновлення': 'Check for updates', 'Оновити все': 'Update all',
  'За назвою': 'By name', 'За групами': 'By group', 'Нещодавно додані': 'Recently added', 'Без групи': 'No group',
  'Тут порожньо': 'Nothing here', 'Обрано': 'Selected', 'Оновити': 'Update', 'У групу': 'To group', 'Прибрати': 'Remove',
  'Скасувати': 'Cancel', 'Зберегти': 'Save', 'Видалити': 'Delete', 'Перейменувати': 'Rename', 'Колір': 'Colour',
  'Назва групи': 'Group name', 'Видалити групу?': 'Delete the group?', 'Програми лишаться в бібліотеці.': 'The apps stay in the library.',
  'Встановити': 'Install', 'Запустити': 'Launch', 'Відкрити': 'Open', 'Відкрити теку': 'Open folder', 'Відкрити на GitHub': 'Open on GitHub',
  'Відкрити сайт': 'Open the site', 'Оновити дані': 'Refresh', 'Повернути попередню версію': 'Roll back to the previous version',
  'Закріпити версію': 'Pin this version', 'Відкріпити версію': 'Unpin the version', 'Видалити з ПК': 'Uninstall',
  'Прибрати з бібліотеки': 'Remove from the library', 'до': 'to', 'немає файлу для Windows': 'no Windows file',
  'немає релізів': 'no releases', 'не встановлено': 'not installed', 'встановлювач': 'installer', 'портативна': 'portable',
  'портативна (zip)': 'portable (zip)', 'знайдено в Windows': 'found in Windows', 'Встановлено': 'Installed',
  'Останній реліз': 'Latest release', 'Зірки': 'Stars', 'Спосіб': 'Method', 'Автоматично': 'Automatic', 'Встановлювач': 'Installer',
  'Портативна': 'Portable', 'змінити': 'change', 'Групи й теги': 'Groups and tags', '+ група': '+ group', '+ тег': '+ tag',
  'Огляд': 'Overview', 'Що нового': 'What’s new', 'Релізи': 'Releases', 'Нотатки': 'Notes', 'Завантаження…': 'Loading…',
  'README немає': 'No README', 'Опису змін немає': 'No release notes', 'На GitHub': 'On GitHub', 'тестовий': 'pre-release',
  'Встановити цей файл': 'Install this file', 'Мої нотатки — навіщо ця програма, що налаштувати…': 'My notes — why I keep it, what to set up…',
  'Спосіб встановлення': 'Install method', 'Закріпити на версії': 'Pin to a version', 'Пропустити реліз': 'Skip a release',
  'Пропущено': 'Skipped', 'Пропустити': 'Skip', 'Назва': 'Name', 'Тека': 'Folder', 'Сайт': 'Site', 'Додано': 'Added',
  'Тема': 'Theme', 'Як у Windows': 'Like Windows', 'Світла': 'Light', 'Темна': 'Dark', 'Мова': 'Language',
  'Перевірка оновлень': 'Update checks', 'Вручну': 'Manually', 'год': 'h', 'Перевірити зараз': 'Check now',
  'Сповіщення': 'Notifications', 'Сповіщати в треї про нові оновлення': 'Notify in the tray about new updates',
  'Автозапуск': 'Start with Windows', 'Запускати з Windows у трей': 'Start with Windows, in the tray',
  'Тека портативних програм': 'Folder for portable apps', 'Сюди розпаковуються програми без встановлювача.': 'Apps without a setup are unpacked here.',
  'Токен GitHub': 'GitHub token', 'Прибрати токен': 'Remove token', 'Створити токен на GitHub': 'Create a token on GitHub',
  'Без токена GitHub дає 60 запитів на годину, з токеном — 5000. Досить токена без жодних дозволів: Komora читає лише публічні репозиторії.':
    'Without a token GitHub allows 60 requests per hour, with one 5000. A token without any permissions is enough: Komora reads public repositories only.',
  'Токен збережено': 'Token saved', 'запитів': 'requests', 'Про програму': 'About', 'Автор': 'Author',
  'Почни свою комору': 'Start your komora', 'Встав посилання на репозиторій GitHub або будь-який сайт — Komora підтягне назву, значок і опис.':
    'Paste a link to a GitHub repository or any site — Komora fetches the name, icon and description.',
  'Встав посилання на GitHub або сайт': 'Paste a link to GitHub or a site', 'Дії': 'Actions', 'Команди': 'Commands',
  'Перейти': 'go to', 'дія': 'action', 'закрити': 'close', 'Тема: світла': 'Theme: light', 'Тема: темна': 'Theme: dark',
  'Тема: як у Windows': 'Theme: like Windows', 'Показати оновлення': 'Show updates',
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
  'Нова назва': 'New name', 'Показати в бібліотеці': 'Show in the library', 'Додати тег': 'Add a tag',
  'Встановлено:': 'Installed:', 'Оновлено:': 'Updated:', 'посилання': 'link', 'Програма закріплена на': 'The app is pinned to',
  'ще': 'more', 'Згорнути': 'Collapse', 'Дані': 'Data',
};

Object.assign(EN, {
  'Пошук на GitHub': 'GitHub search', 'Шукати на GitHub': 'Search GitHub', 'Програми': 'Apps', 'GitHub': 'GitHub',
  'Оновлень немає': 'No updates', 'Усі встановлені програми актуальні.': 'All installed apps are up to date.',
  'Ще нічого не встановлено': 'Nothing installed yet', 'Тут будуть програми, які ти встановиш через Komora, і ті, що вже є у Windows.': 'Apps you install with Komora and the ones already in Windows show up here.',
  'Усе встановлено': 'Everything is installed', 'Тут будуть програми з бібліотеки, яких ще немає на цьому ПК.': 'Apps of the library that are not on this PC yet show up here.',
  'Посилань ще немає': 'No links yet', 'Додай сайт, відео чи статтю: встав посилання в «Додати».': 'Add a site, a video or an article: paste the link into “Add”.',
  'Група порожня': 'The group is empty', 'Перетягни сюди програми зі списку або додай групу на сторінці програми.': 'Drag apps here from the list or add the group on an app’s page.',
  'Додати програму': 'Add an app', 'Додати посилання': 'Add a link', 'Знайти на GitHub': 'Find on GitHub',
  'або знайди програми': 'or find apps', 'наступна': 'next', 'незабаром': 'soon', 'Щодня': 'Daily', 'Щотижня': 'Weekly',
  'Щомісяця': 'Monthly', 'Ніколи': 'Never', 'Додано:': 'Added:', 'Закріплено на версії': 'Pinned to version',
  'ще не встановлено': 'not installed yet', 'Встановити старішу версію?': 'Install an older version?',
  'Komora закріпить програму на ній, щоб не пропонувати оновлення. Відкріпити можна на сторінці програми.': 'Komora pins the app to it so updates are not offered. Unpin it on the app’s page.',
  'Шукати репозиторії': 'Search repositories', 'Найкращі збіги': 'Best match', 'Більше зірок': 'Most stars', 'Нещодавно оновлені': 'Recently updated',
  'Будь-яка мова': 'Any language', 'Будь-скільки зірок': 'Any stars', 'зірок': 'stars', 'Будь-коли': 'Any time', 'Оновлено за місяць': 'Updated this month',
  'Оновлено за пів року': 'Updated in 6 months', 'Оновлено за рік': 'Updated this year', 'Набирає популярності': 'Trending',
  'Для Windows': 'For Windows', 'Утиліти трею': 'Tray utilities', 'Твіки Windows': 'Windows tweaks', 'Нові й живі': 'Fresh and active',
  'Знайдено': 'Found', 'Показати ще': 'Show more', 'Шукаю…': 'Searching…', 'Нічого не знайдено': 'Nothing found',
  'У бібліотеці': 'In the library', 'Відкрити в бібліотеці': 'Open in the library', 'Додати в бібліотеку': 'Add to the library',
  'Мова програмування': 'Language', 'Оновлено': 'Updated', 'Реліз': 'Release', 'Обери репозиторій зі списку': 'Pick a repository from the list',
  'Знайди програму на GitHub: введи, що шукаєш, або обери добірку.': 'Find an app on GitHub: type what you look for or pick a set.',
  'Ліміт пошуку GitHub: 10 запитів на хвилину без токена, 30 — з токеном.': 'GitHub search limit: 10 requests a minute without a token, 30 with one.',
  'Як отримати токен:': 'How to get a token:', '1. На GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.': '1. On GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.',
  '2. Repository access: «Public repositories». Дозволи (Permissions) не додавай — вони не потрібні.': '2. Repository access: “Public repositories”. Do not add permissions — none are needed.',
  '3. Скопіюй токен і встав сюди. Він зберігається лише на цьому ПК, у config.json.': '3. Copy the token and paste it here. It stays on this PC only, in config.json.',
  'Перевстановити': 'Reinstall', 'Цей реліз встановлено': 'This release is installed',
});

Object.assign(EN, {
  'GitHub, сайт, відео YouTube, товар у магазині — будь-яке посилання': 'GitHub, a site, a YouTube video, a shop product — any link',
  'Windows скинула твіки:': 'Windows reset tweaks:', 'Ігри': 'Games', 'Імпорт': 'Import', 'Імпортувати': 'Import', 'Імпортую…': 'Importing…',
  'Історія ціни': 'Price history', 'Їхні списки містять ідентифікатори пакетів, а не посилання на GitHub, тож перенести їх у Komora напряму не можна. Знайди потрібні програми в «Пошуку на GitHub».': 'Their lists hold package IDs, not GitHub links, so they cannot be moved into Komora directly. Find the apps in “GitHub search”.',
  'Або PowerShell (необов’язково)': 'Or PowerShell (optional)', 'Автор (логін GitHub)': 'Author (GitHub login)', 'Без підпису': 'Unsigned', 'Без форків': 'Without forks',
  'Безпека': 'Safety', 'Бібліотека однакова на всіх твоїх ПК: зміни зливаються, перемагає новіша. Встановлене не копіюється — інші ПК лише пропонують поставити.': 'The library is the same on all your PCs: changes merge, the newer one wins. Installed apps are not copied — other PCs offer to install them.',
  'Вимкнути': 'Turn off', 'Встав посилання — додасться в групу': 'Paste a link — it goes into the group', 'Встановити вибрані': 'Install selected', 'Відео': 'Video',
  'Відкрий набір з іншого ПК: Komora додасть усе в бібліотеку, встановить вибрані програми одна за одною, застосує твіки й поверне налаштування з копій.': 'Open a bundle from another PC: Komora adds everything to the library, installs the chosen apps one by one, applies tweaks and restores settings from backups.',
  'Відкрити набір…': 'Open a bundle…', 'Відновити': 'Restore', 'Відновити налаштування?': 'Restore the settings?', 'Відновлюю налаштування': 'Restoring settings',
  'Готово з набору: програм': 'Done from the bundle: apps', 'Детальніше': 'Details', 'Додати в цю групу': 'Add to this group', 'Додати всі': 'Add all', 'Додати ключ': 'Add key',
  'Додати теку…': 'Add a folder…', 'Діє після виходу з облікового запису й повторного входу.': 'Takes effect after signing out and in again.',
  'Діє після перезапуску Провідника — кнопка вгорі сторінки.': 'Takes effect after restarting File Explorer — the button at the top.',
  'Експорт Obtainium (Налаштування → Експорт): посилання з нього — у бібліотеку.': 'An Obtainium export (Settings → Export): its links go into the library.',
  'З копіями налаштувань (.zip)': 'With settings backups (.zip)', 'Закладок Chrome, Edge, Brave, Vivaldi чи Opera не знайдено': 'No Chrome, Edge, Brave, Vivaldi or Opera bookmarks found',
  'Застосовано': 'Applied', 'Зберегти копію зараз': 'Back up now', 'Зберегти набір': 'Save a bundle', 'Знайдено на цьому ПК': 'Found on this PC', 'Знайти й налаштувати': 'Find and set up',
  'Значення': 'Value', 'Значення реєстру': 'Registry values', 'Зірки GitHub': 'GitHub stars', 'Канал': 'Channel', 'Ключ має починатися з HKCU\\ або HKLM\\': 'The key must start with HKCU\\ or HKLM\\',
  'Кожен твік можна скасувати: Komora пам’ятає, що було до нього. Після оновлень Windows Komora перевіряє, чи не скинуто твіки, і пропонує повернути.': 'Every tweak can be undone: Komora remembers what was there before. After Windows updates Komora checks whether tweaks were reset and offers to bring them back.',
  'Копію налаштувань збережено': 'Settings backed up', 'Копіюю налаштування': 'Backing up settings', 'Копії': 'Backups', 'Лише форки': 'Forks only', 'Магазин': 'Shop',
  'Миша й клавіатура': 'Mouse and keyboard', 'Можливо, є живий форк.': 'There may be a living fork.', 'Мої нотатки — навіщо це, що важливо…': 'My notes — why I keep it, what matters…',
  'Мої твіки': 'My tweaks', 'Мій твік': 'My tweak', 'Набір з ПК': 'Bundle from PC', 'Набір збережено:': 'Bundle saved:',
  'Набір — це бібліотека, групи, теги, нотатки й твіки одним файлом. З копіями налаштувань програм — zip.': 'A bundle is the library, groups, tags, notes and tweaks in one file. With the apps’ settings backups — a zip.',
  'Назва значення': 'Value name', 'Найпопулярніші форки. «Живіший» — оновлювався пізніше за оригінал.': 'The most popular forks. “More alive” — updated later than the original.',
  'Налаштування відновлено': 'Settings restored', 'Нова група з назвою джерела': 'New group named after the source', 'Новий ПК і синхронізація': 'New PC and sync',
  'Нічого не вибрано': 'Nothing chosen', 'Обрати теку…': 'Choose a folder…', 'Обрати файл…': 'Choose a file…', 'Обрати…': 'Choose…', 'Опис': 'Description', 'Остання копія': 'Last backup',
  'Панель завдань': 'Taskbar', 'Панель завдань і відкриті вікна Провідника зникнуть на кілька секунд.': 'The taskbar and open File Explorer windows disappear for a few seconds.',
  'Перевірити на VirusTotal': 'Check on VirusTotal', 'Перезапустити': 'Restart', 'Перезапустити Провідник': 'Restart File Explorer', 'Перезапустити Провідник?': 'Restart File Explorer?',
  'Платформа': 'Platform', 'По одному на рядок: GitHub, сайти, відео, товари.': 'One per line: GitHub, sites, videos, products.', 'Повернути': 'Bring back', 'Повернути всі': 'Bring all back',
  'Показати закладки браузерів': 'Show browser bookmarks', 'Показати форки': 'Show forks', 'Посилання скопійовано': 'Link copied', 'Поставити вибране': 'Set up the chosen',
  'Потребує уваги': 'Needs attention', 'Потрібні права адміністратора': 'Needs administrator rights', 'Провідник': 'File Explorer', 'Пуск і пошук': 'Start and search',
  'Підпис пошкоджено': 'Broken signature', 'Підписано': 'Signed', 'Разом з форками': 'With forks', 'Реклама й приватність': 'Ads and privacy',
  'Репозиторії, яким ти поставив зірку, — у бібліотеку. Релізи підтягнуться під час перевірки (для багатьох зірок потрібен токен).': 'Repositories you starred go into the library. Releases come with the next check (many stars need a token).',
  'Свій твік': 'Own tweak', 'Синхронізовано': 'Synced', 'Синхронізовано: є зміни з іншого ПК': 'Synced: changes from another PC', 'Синхронізувати зараз': 'Sync now',
  'Система': 'System', 'Скасовано': 'Undone', 'Скрипт, що вмикає': 'Script that applies', 'Скрипт, що скасовує': 'Script that undoes',
  'Спершу закрий програму: її файли налаштувань буде замінено копією.': 'Close the app first: its settings files are replaced by the backup.', 'Ставлю вибране — це може тривати.': 'Setting up the chosen — this may take a while.',
  'Сторінка': 'Page', 'Стрічка релізів': 'Release feed', 'Твіки': 'Tweaks', 'Твіки Windows': 'Windows tweaks',
  'Тека закладок разом із вкладеними — у бібліотеку: репозиторії як програми, решта як посилання.': 'A bookmarks folder with its subfolders goes into the library: repositories as apps, the rest as links.',
  'Теки й гілки реєстру з налаштуваннями програми. Кеші й журнали не копіюються; зберігаються 5 останніх копій.': 'Folders and registry keys with the app’s settings. Caches and logs are left out; the last 5 backups are kept.',
  'Текст': 'Text', 'Тема: будь-яка': 'Topic: any', 'Тема GitHub': 'Topic', 'Тестові релізи': 'Pre-releases', 'Товар': 'Product', 'У бібліотеку': 'To the library', 'Українська': 'Українська',
  'Усе вже встановлено': 'Everything is installed already', 'Файл релізу': 'Release file', 'Форки': 'Forks', 'Форків немає': 'No forks',
  'Ці програми прийшли з синхронізації чи набору й ще не стоять тут.': 'These apps came with sync or a bundle and are not installed here yet.', 'Ціна': 'Price', 'Ціна знизилась:': 'Price dropped:',
  'Через приватний GitHub Gist': 'Through a secret GitHub Gist', 'Через теку в хмарі (OneDrive, Google Drive, Dropbox…)': 'Through a cloud folder (OneDrive, Google Drive, Dropbox…)',
  'Шукаю, де програма тримає налаштування…': 'Looking for where the app keeps its settings…', 'Ще значення': 'Another value', 'Ще не перевірено': 'Not checked yet', 'Ще не синхронізовано': 'Not synced yet',
  'Що зберігати': 'What to back up', 'адміністратор': 'administrator', 'архів: автор більше не розвиває': 'archived: no longer developed', 'встановлено до Komora 0.3': 'installed before Komora 0.3',
  'від першої': 'since the first', 'живіший': 'more alive', 'за тиждень': 'this week', 'звично для відкритих програм': 'common for open source apps', 'логін GitHub': 'GitHub login',
  'найнижча': 'lowest', 'не вдалося': 'failed', 'не оновлювався понад рік': 'not updated for over a year', 'оновлено': 'updated', 'останній реліз понад 2 роки тому': 'last release over 2 years ago',
  'перевіряється під час встановлення': 'checked during install', 'потрібен токен з дозволом Gists (Налаштування)': 'needs a token with the Gists permission (Settings)', 'пошкоджений підпис': 'broken signature',
  'пропонувати пре-релізи як оновлення': 'offer pre-releases as updates', 'після перезапуску Провідника': 'after restarting File Explorer', 'після повторного входу': 'after signing in again',
  'скинуто Windows': 'reset by Windows', 'спершу додай токен у Налаштуваннях': 'add a token in Settings first', 'стежу за ціною': 'watching the price', 'твіків': 'tweaks', 'уже були': 'already there',
  'уже так у Windows': 'already so in Windows', 'файл змінено після підпису': 'the file was changed after signing', 'форк': 'fork', 'форк від': 'fork of', 'ціни на сторінці не знайдено': 'no price found on the page',
  'частина назви, напр. x64.zip — порожньо: автоматично': 'part of the name, e.g. x64.zip — empty: automatic', 'Дивитись': 'Watch', 'До магазину': 'To the shop',
  'Перенести на інший ПК': 'Move to another PC', 'Поставити на цей ПК': 'Set up this PC', 'Було встановлено на іншому ПК': 'Installed on another PC', 'Синхронізація між ПК': 'Sync between PCs',
  'Закладки браузера': 'Browser bookmarks', 'Список посилань': 'A list of links', 'winget і UniGetUI': 'winget and UniGetUI', 'Тека': 'Folder', 'Сайт': 'Site', 'Додано': 'Added',
  'Копія налаштувань': 'Settings backup', 'Параметри': 'Options', 'Оновити дані': 'Refresh', 'Попередня версія': 'Previous version', 'Відкріпити': 'Unpin', 'Закріпити': 'Pin', 'Копіювати': 'Copy',
  'Прибрати': 'Remove', 'Відкрити': 'Open', 'Новий ПК': 'New PC',
});

// English messages of the app side (network, installs) in Ukrainian
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
  [/^GitHub did not understand the search$/, 'GitHub не зрозумів запит'],
  [/^GitHub search limit reached.*/, 'Вичерпано ліміт пошуку GitHub — зачекай хвилину або додай токен у Налаштуваннях'],
  [/^link does not open: (.*)$/, 'Посилання не відкривається: $1'],
  [/^GitHub request limit reached.*/, 'Вичерпано ліміт запитів GitHub — додай токен у Налаштуваннях або спробуй пізніше'],
  [/^not found on GitHub$/, 'Не знайдено на GitHub'],
  [/^GitHub answered HTTP (\d+)$/, 'GitHub відповів HTTP $1'],
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
const ic = k => `<i class="i">${I[k]}</i>`;
const MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="4.5" y="4.5" width="15" height="15" rx="3.2"/><path d="M4.5 11.4h15"/></svg>';
const GROUP_COLORS = ['#7fb8e8', '#d98bc2', '#6ccb8b', '#f5c04a', '#f08a4b', '#a78bfa', '#5fd4d0', '#ff7b72'];
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

function fmtSize(b) {
  if (!b) return '';
  const u = [['Б', 'B'], ['КБ', 'KB'], ['МБ', 'MB'], ['ГБ', 'GB']].map(([a, b]) => ue(a, b));
  let i = 0;
  while (b >= 1024 && i < 3) { b /= 1024; i++; }
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
const dateOf = unix => new Date(unix * 1000).toLocaleDateString(L, { day: 'numeric', month: 'short', year: 'numeric' });
const verOf = tag => { const m = String(tag || '').match(/\d+(?:[._]\d+)*/); return m ? m[0].replace(/_/g, '.') : String(tag || ''); };
const hostOf = u => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return u; } };
const fmtNum = n => n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k' : String(n);


// ---------------------------------------------------------------- 0.4 strings
Object.assign(EN, {
  'Огляд': 'Dashboard', 'посилання не відкривається': 'the link does not open', 'Шукати в бібліотеці й на GitHub': 'Search the library and GitHub', 'Перевіряю': 'Checking',
  'Додати програму чи посилання': 'Add an app or a link', 'Мій набір': 'My kit', 'знайти': 'find', 'Знайти нове': 'Find new', 'Автори': 'Authors', 'групи': 'groups', 'теги': 'tags',
  'у бібліотеці': 'in the library', 'встановлено': 'installed', 'ціна у вішлісті знизилась': 'a wishlist price dropped', 'Усе спокійно': 'All quiet',
  'Windows скинула твіки': 'Windows reset tweaks', 'Усі оновлення': 'All updates', 'Встановлюються по черзі; портативні лишають попередню версію для відкату': 'Installed one by one; portable apps keep the previous version for a rollback',
  'Закріплено': 'Pinned', 'є': 'there is', 'Диск': 'Disk', 'портативні програми': 'portable apps', 'Зірки за тиждень': 'Stars this week', 'найбільше': 'most:',
  'рахую з першого тижня': 'counting from the first week', 'нових репозиторіїв немає': 'no new repositories', 'стеж за улюбленими авторами': 'follow your favourite authors',
  'журнал перевірки': 'check log', 'Усе з набору стоїть': 'Everything of the kit is installed', 'Вішліст': 'Wishlist', 'без змін': 'no change', 'Релізи бібліотеки': 'Releases of the library',
  '30 днів': '30 days', 'Нове від авторів': 'New from authors', 'перевірено': 'checked', 'не вдалося перевірити': 'could not be checked', 'Windows скинула твік': 'Windows reset a tweak',
  'або': 'or', 'Набір з іншого ПК': 'A bundle from another PC', 'не відкривається': 'does not open', 'набір': 'kit', 'Встановити відсутні': 'Install the missing',
  'Група': 'Group', 'Програми, які мають бути на кожному твоєму ПК': 'Apps that belong on every PC of yours', 'Стоять на цьому ПК': 'Installed on this PC', 'Оновити до': 'Update to',
  'група': 'group', 'тег': 'tag', 'Інші версії': 'Other versions', 'Ще': 'More',
  'антивірусів позначили файл. Часто це хибна тривога для відкритих програм, але подивись звіт.': 'antivirus engines flagged the file. For open source apps this is often a false alarm, but look at the report.',
  'Звіт': 'Report', 'закріплено': 'pinned', 'форків': 'forks', 'Мови': 'Languages', 'оновлюється з даними': 'comes with a refresh', 'ще не налаштовано': 'not set up yet',
  'як пропонує встановлювач': 'where the setup proposes', 'Увімкнено для всіх у Налаштуваннях': 'On for every app in Settings', 'Без підпису — звично для відкритих програм.': 'Unsigned — common for open source apps.',
  'Підпис пошкоджено: файл змінено після підпису.': 'Broken signature: the file was changed after signing.', 'Встановлено до Komora 0.3 — не перевірено.': 'Installed before Komora 0.3 — not checked.',
  'Підпис і контрольна сума перевіряються під час встановлення.': 'The signature and the checksum are checked during the install.', 'SHA-256 збігся з релізом.': 'SHA-256 matches the release.',
  'аналізує…': 'analysing…', 'VirusTotal ще не бачив цей файл.': 'VirusTotal has not seen this file yet.', 'Покаже файл у Провіднику й відкриє сторінку завантаження VirusTotal': 'Shows the file in File Explorer and opens the VirusTotal upload page',
  'Завантажити на перевірку': 'Upload for a scan', 'файл': 'file', 'тип': 'type', 'тека': 'folder', 'Порівняти з': 'Compare with', 'Тека встановлення': 'Install folder', 'Огляд…': 'Browse…',
  'Як у Налаштуваннях': 'As in Settings', 'Посилання не відкривається': 'The link does not open', 'з': 'since', 'із': 'of', 'Перевірити': 'Check', 'Найнижча': 'Lowest', 'разом з оновленнями': 'with the update checks',
  'раз на тиждень': 'once a week', 'знайдено': 'found', 'Шукати': 'Search', 'нещодавні': 'recent', 'Лише додати в бібліотеку': 'Only add to the library', 'Ліцензія': 'Licence',
  'Нові репозиторії тих, за ким стежиш, — під час кожної перевірки': 'New repositories of the people you follow — on every check', 'Логін GitHub або посилання на профіль': 'GitHub login or profile link',
  'Стежити': 'Follow', 'Ще ні за ким не стежиш': 'You follow nobody yet', 'Стежити можна зі сторінки програми (меню ⋯) або тут за логіном.': 'Follow from an app’s page (the ⋯ menu) or here by login.',
  'організація': 'organisation', 'Не стежити': 'Unfollow', 'Нові репозиторії': 'New repositories', 'Переглянуто': 'Seen', 'нове': 'new', 'Публічних репозиторіїв немає': 'No public repositories',
  'Кожен можна скасувати — Komora пам’ятає, що було до нього.': 'Each can be undone — Komora remembers what was there before.', 'Komora перевіряє твіки після кожного запуску й перевірки оновлень.': 'Komora checks the tweaks after every start and update check.',
  'було увімкнено': 'was on', 'увімкнено': 'on', 'вимкнено': 'off', 'Змінити': 'Change',
  'Бібліотека, групи, теги, нотатки, твіки й копії налаштувань — на будь-який твій ПК.': 'The library, groups, tags, notes, tweaks and settings backups — on any PC of yours.',
  'Один файл із усім. З копіями налаштувань програм — zip.': 'One file with everything. With the apps’ settings backups — a zip.', 'З копіями налаштувань · .zip': 'With settings backups · .zip',
  'ще не синхронізовано': 'not synced yet', 'Синхронізація': 'Sync', 'Тека в хмарі': 'A cloud folder', 'Приватний GitHub Gist': 'A secret GitHub Gist', 'потрібен токен з дозволом Gists': 'needs a token with the Gists permission',
  'Вимкнено': 'Off', 'лише набір у файл': 'only a bundle file', 'Зміни зливаються, перемагає новіша. Встановлене не копіюється — інші ПК лише пропонують поставити.': 'Changes merge, the newer one wins. Installed apps are not copied — other PCs offer to install them.',
  'По одній програмі; налаштування повертаються з копій одразу після встановлення': 'One app at a time; settings come back from backups right after the install', 'Ставлю набір з': 'Setting up the bundle from',
  'готово': 'done', 'у черзі': 'queued', 'Твіки з набору': 'Tweaks of the bundle', 'Прийшло із синхронізацією чи набору': 'Came with sync or a bundle', 'Як пропонує встановлювач': 'Where the setup proposes',
  'Вигляд': 'Appearance', 'Світла — теплий папір, темна — графіт': 'Light — warm paper, dark — graphite', 'Колір акценту': 'Accent colour', 'Темна — теплий сірий, світла — папір': 'Dark — warm grey, light — paper', 'Перетягни сюди програми, щоб додати їх у набір': 'Drop apps here to add them to the kit', 'Зберегти лише набір (.zip)': 'Save just the kit (.zip)', 'На цьому ПК': 'On this PC', 'Оновлювати програми набору самі': 'Update the kit’s apps by themselves', 'Після кожної перевірки нові версії програм набору ставляться без твого кліку': 'After every check new versions of the kit’s apps install without a click', 'На новому ПК ставити набір самі': 'Install the kit by itself on a new PC', 'Коли набір приходить із синхронізації чи набору, відсутні програми встановлюються самі': 'When the kit arrives with sync or a bundle, the missing apps install by themselves', 'Копії налаштувань програм набору завжди їдуть у zip-набір із «Перенесення».': 'Settings backups of the kit’s apps always go into the zip bundle from “Transfer”.', 'Додай програму кнопкою з позначкою набору — у рядку бібліотеки, на сторінці програми чи в результатах пошуку GitHub. Або перетягни програми на «Мій набір» у меню.': 'Add an app with the kit button — in a library row, on the app’s page or in GitHub search results. Or drop apps on “My kit” in the menu.', 'Додано в мій набір': 'Added to my kit', 'Додати в бібліотеку й у мій набір': 'Add to the library and to my kit', 'Файл .zip: бібліотека, групи, теги, нотатки, твіки й сама Komora.exe. На новому ПК розпакуй, запусти Komora.exe й відкрий цей zip.': 'A .zip file: the library, groups, tags, notes, tweaks and Komora.exe itself. On a new PC unpack it, start Komora.exe and open this zip.', 'З налаштуваннями програм': 'With the apps’ settings', 'копій ще немає': 'no backups yet', 'Синхронізація не вдалася': 'Sync failed', 'Відкрити «Перенесення»': 'Open “Transfer”', 'помилка': 'error', 'У моєму наборі — натисни, щоб прибрати': 'In my kit — click to remove', 'Додати в мій набір': 'Add to my kit', 'У моєму наборі': 'In my kit', 'Той самий токен, що й у Налаштуваннях: для Gist йому потрібен дозвіл Gists (Read and write).': 'The same token as in Settings: for a Gist it needs the Gists permission (Read and write).', 'Перенесення': 'Transfer', 'На інший ПК чи після перевстановлення Windows: бібліотека, групи, теги, нотатки, твіки й копії налаштувань.': 'To another PC or after reinstalling Windows: the library, groups, tags, notes, tweaks and settings backups.', 'Нові версії програм, які стоять на цьому ПК. Перевіряються за розкладом зі сторінки «Оновлення».': 'New versions of the apps on this PC. Checked on the schedule set on the Updates page.', 'Програми й посилання, з якими щось не так: архівний чи покинутий проєкт, пошкоджений підпис, посилання не відкривається.': 'Apps and links with something wrong: an archived or abandoned project, a broken signature, a link that does not open.', 'Що знайшла остання перевірка оновлень.': 'What the last update check found.', 'Програми, які мають бути на кожному твоєму ПК. Познач програму «У мій набір» на її сторінці.': 'Apps that belong on every PC of yours. Mark an app “To my kit” on its page.', 'Нові релізи програм із бібліотеки за останні 30 днів, зокрема не встановлених.': 'New releases of the library’s apps over the last 30 days, installed or not.', 'Нові репозиторії авторів, за якими стежиш (Знайти → Автори).': 'New repositories of the authors you follow (Find → Authors).', 'Один файл, щоб забрати бібліотеку на інший ПК чи на чисту Windows.': 'One file to take the library to another PC or a clean Windows.', 'Бібліотека сама оновлюється на всіх твоїх ПК: через приватний GitHub Gist або Dropbox. Перемагають новіші зміни; програми не встановлюються самі — інший ПК лише пропонує їх.': 'The library keeps itself the same on all your PCs: through a secret GitHub Gist or Dropbox. Newer changes win; apps do not install by themselves — the other PC only offers them.', 'Усі програми й посилання в бібліотеці': 'All apps and links in the library', 'Програми, налаштування яких Komora копіює (теки й гілки реєстру)': 'Apps whose settings Komora backs up (folders and registry keys)', 'Застосовані твіки Windows': 'Applied Windows tweaks', 'Програми з новою версією': 'Apps with a new version', 'Або імпортуй багато:': 'Or import many:', 'Добірки': 'Sets', 'Сортування': 'Sort', 'Будь-яка': 'Any', 'Будь-скільки': 'Any number', 'За місяць': 'Within a month', 'За пів року': 'Within half a year', 'За рік': 'Within a year', 'Автор GitHub': 'GitHub author', 'будь-хто': 'anyone', 'Нещодавні': 'Recent', 'Коли автор востаннє змінював код': 'When the author last changed the code', 'Додаю й встановлюю…': 'Adding and installing…', 'Зберегти бібліотеку': 'Save the library', 'Файл .komora: програми, посилання, групи, теги, нотатки й твіки.': 'A .komora file: apps, links, groups, tags, notes and tweaks.', 'Повний набір для нового ПК': 'A full bundle for a new PC', 'Файл .zip: усе те саме, копії налаштувань програм і сама Komora.exe. На новому ПК розпакуй, запусти Komora.exe й відкрий цей zip.': 'A .zip file: all the same, the apps’ settings backups and Komora.exe itself. On a new PC unpack it, start Komora.exe and open this zip.', 'Зберегти .zip': 'Save .zip', 'Відкрити набір': 'Open a bundle', 'Файл .komora чи .zip — або встав посилання на спільний набір (Ctrl+V).': 'A .komora or .zip file — or paste a link to a shared bundle (Ctrl+V).', 'Відкрити…': 'Open…', 'Посиланням (секретний Gist) або текстом — інший відкриє його в Komora.': 'As a link (secret Gist) or as text — someone else opens it in Komora.', 'синхронізацію вимкнено': 'sync is off', 'Конфігурації': 'Configs', 'програм з копіями налаштувань': 'apps with settings backups', 'копій налаштувань ще немає': 'no settings backups yet', 'готові до встановлення': 'ready to install', 'усе актуальне': 'all up to date', 'активні': 'active', 'Копії налаштувань програм самі': 'Settings backups by themselves', 'Теки налаштувань знаходяться самі; копія — перед кожним оновленням і раз на день, якщо файли змінилися': 'Settings folders are found by themselves; a backup before every update and once a day when the files changed', 'фіолетовий': 'violet', 'увійдено · тека Apps/Komora': 'signed in · folder Apps/Komora', 'увійти через сайт Dropbox': 'sign in on the Dropbox site', 'ще не налаштовано в цій збірці': 'not set up in this build yet', '1. Відкрий Dropbox і дозволь Komora доступ лише до її теки. 2. Скопіюй код, який покаже Dropbox, і встав сюди.': '1. Open Dropbox and allow Komora its own folder only. 2. Copy the code Dropbox shows and paste it here.', 'Відкрити Dropbox': 'Open Dropbox', 'код з Dropbox': 'code from Dropbox', 'Підтвердити': 'Confirm', 'Для Dropbox потрібен ключ застосунку Dropbox — його додасть автор у наступній збірці.': 'Dropbox needs a Dropbox app key — the author adds it in a coming build.', 'Вийти з Dropbox': 'Sign out of Dropbox', 'Поділитися': 'Share', 'Поділитися…': 'Share…', 'Посиланням (секретний Gist)': 'As a link (secret Gist)', 'Потрібен токен GitHub з дозволом Gists — Налаштування → Ключі': 'Needs a GitHub token with the Gists permission — Settings → Keys', 'Створюю посилання…': 'Creating the link…', 'Копіювати як текст': 'Copy as text', 'Скопійовано — встав куди завгодно; Komora прочитає цей текст через Ctrl+V': 'Copied — paste it anywhere; Komora reads such text back with Ctrl+V', 'Поділитися групою…': 'Share the group…', 'Посилання готове': 'The link is ready', 'Його скопійовано. Хто вставить його в Komora (Ctrl+V), побачить список і поставить, що захоче.': 'It is copied. Whoever pastes it into Komora (Ctrl+V) sees the list and installs what they want.', 'Гаразд': 'OK', 'Відкриваю спільний набір…': 'Opening the shared bundle…', 'Відновити': 'Restore', 'Розгорнути': 'Maximize', 'Згорнути': 'Minimize', 'Закрити': 'Close', 'Знайти': 'Find', 'Тег': 'Tag', 'Загальне': 'General', 'Підтримати Komora': 'Support Komora', 'Komora безкоштовна. Якщо вона тобі корисна — банка monobank.': 'Komora is free. If it is useful to you — a monobank jar.', 'Підтримати': 'Support', 'Файл набору': 'Bundle file', 'Бібліотека, групи, теги, нотатки й твіки одним файлом. Zip несе ще копії налаштувань програм і саму Komora.exe: на новому ПК розпакуй, запусти Komora.exe й відкрий цей zip.': 'The library, groups, tags, notes and tweaks in one file. A zip also carries the apps’ settings backups and Komora.exe itself: on a new PC unpack it, start Komora.exe and open this zip.', 'Перевіряти': 'Check', 'Перевіряю…': 'Checking…', 'останній': 'latest', 'Темна — обсидіан, світла — сіро-біла': 'Dark — obsidian, light — grey and white', 'Є оновлення': 'Has updates', 'Актуально': 'Up to date', 'Без ключа — пошук за SHA-256 на сайті VirusTotal.': 'Without a key — a lookup by SHA-256 on the VirusTotal site.', 'Без токена': 'No token', 'Безпека й цілісність': 'Safety and integrity', 'Встав (Ctrl+V) чи перетягни у вікно посилання на репозиторій або будь-яку сторінку. Або імпортуй відразу багато:': 'Paste (Ctrl+V) or drop into the window a link to a repository or any page. Or import many at once:', 'Встановлені встановлювачем або знайдені у Windows': 'Installed by a setup or found in Windows', 'Встановлювачі': 'Installers', 'Відео, статті, товари з історією ціни': 'Videos, articles, products with price history', 'ГРУПИ': 'GROUPS', 'Доступно': 'Available', 'Дійсний': 'Valid', 'Закладки': 'Bookmarks', 'Зірки й форки': 'Stars and forks', 'КОПІЇ': 'BACKUPS', 'Картки': 'Cards', 'Каталог твіків Windows': 'Windows tweak catalog', 'Комора': 'Komora', 'ЛОКАЛЬНО': 'LOCAL', 'МІЙ НАБІР': 'MY KIT', 'МЕНЮ ІНСТРУМЕНТІВ': 'TOOLS', 'Моніторинг оновлень': 'Update monitoring', 'Моніторинг оновлень і трей': 'Update monitoring and tray', 'Набір': 'Bundle', 'Не встановлено': 'Not installed', 'Немає': 'None', 'Нові версії встановлених програм': 'New versions of installed apps', 'Один файл із усім. Zip несе ще копії налаштувань програм і саму Komora.exe: на новому ПК розпакуй, запусти Komora.exe й відкрий цей zip.': 'One file with everything. A zip also carries the apps’ settings backups and Komora.exe itself: on a new PC unpack it, start Komora.exe and open this zip.', 'Оновити всі': 'Update all', 'Оновлення готові': 'Updates ready', 'Оновлення знайдено': 'Update found', 'ПОМИЛКА': 'ERROR', 'ПРОГРАМИ': 'APPS', 'Портативні': 'Portable', 'Поточний стан': 'Current state', 'Пошкоджено': 'Broken', 'Прогрес': 'Progress', 'Підтримати проєкт': 'Support the project', 'РОБОЧИЙ ПРОСТІР': 'WORKSPACE', 'Репозиторії': 'Repositories', 'Розпаковані Komora в теку переносних програм': 'Unpacked by Komora into the portable apps folder', 'Сама Komora теж є в бібліотеці й у кожному наборі — на іншому ПК вона оновлюватиметься, як решта програм.': 'Komora itself is in the library and in every bundle too — on another PC it updates like the other apps.', 'Скопійовано': 'Copied', 'Список': 'List', 'ТВІКИ': 'TWEAKS', 'ТЕГИ': 'TAGS', 'Твіки та оновлення': 'Tweaks and updates', 'Тестові версії (pre-release) для всіх': 'Pre-releases for all apps', 'ФІЛЬТР': 'FILTER', 'Це сама Komora. Вона завжди є в бібліотеці й у кожному наборі: на іншому ПК оновлюватиметься, як решта програм. «Оновити» завантажить новий Komora.exe, замінить ним цей і перезапустить програму.': 'This is Komora itself. It is always in the library and in every bundle: on another PC it updates like the other apps. “Update” downloads the new Komora.exe, puts it in place of this one and restarts.', 'ШВИДКІ ФІЛЬТРИ': 'QUICK FILTERS', 'Швидкий пошук у коморі, тегах і на GitHub': 'Quick search in the library, tags and GitHub', 'Швидкий імпорт до комори': 'Quick import', 'активних': 'active', 'виявлень': 'detections', 'вручну': 'manual', 'джерел': 'sources', 'для цього ПК': 'for this PC', 'запущена зараз': 'running now', 'застосовано': 'applied', 'збіг з релізом': 'matches the release', 'з’явиться після встановлення': 'appears after an install', 'лише в .zip': 'only in a .zip', 'на кожен ПК': 'for every PC', 'обсидіан': 'obsidian', 'перевіряю…': 'checking…', 'посилань': 'links', 'програм': 'apps', 'реліз': 'release', 'реєстр і PowerShell': 'registry and PowerShell', 'синій': 'blue', 'тиждень': 'week', 'із': 'of', 'Працює': 'Running', 'Токен GitHub задано': 'A GitHub token is set', 'Без токена GitHub дає 60 запитів на годину. Додати токен — у Налаштуваннях': 'Without a token GitHub allows 60 requests an hour. Add a token in Settings', 'Підпис, SHA-256 і VirusTotal перевіряються під час кожного встановлення': 'The signature, SHA-256 and VirusTotal are checked on every install', 'Підпис і SHA-256 перевіряються під час кожного встановлення; VirusTotal — з ключем у Налаштуваннях': 'The signature and SHA-256 are checked on every install; VirusTotal — with a key in Settings', 'Як налаштувати Gist': 'How to set up the Gist', 'Відкрий сторінку нового токена на GitHub (посилання нижче) і ввійди у свій обліковий запис.': 'Open the page of a new token on GitHub (the link below) and sign in.', 'Token name — будь-яка назва, наприклад Komora. Expiration — скільки житиме токен: коли мине, синхронізація зупиниться й знадобиться новий.': 'Token name — any name, Komora for example. Expiration — how long the token lives: when it ends, sync stops and a new one is needed.', 'Repository access — «Public repositories»: доступ до твоїх репозиторіїв Komora не потрібен.': 'Repository access — “Public repositories”: Komora needs no access to your repositories.', 'Permissions → Account → Gists → Read and write.': 'Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен (github_pat_…) і встав його тут, у поле «Токен GitHub» під «Приватний GitHub Gist».': 'Generate token, copy it (github_pat_…) and paste it in Settings → Keys → GitHub token.', 'Тут обери «Приватний GitHub Gist». Komora сама створить секретний Gist із файлом komora-sync.json або знайде наявний.': 'Choose “Secret GitHub Gist” here. Komora creates a secret Gist with komora-sync.json itself, or finds the one there is.', 'На іншому ПК зроби те саме з тим самим обліковим записом GitHub — Komora знайде той самий Gist.': 'On another PC do the same with the same GitHub account — Komora finds the same Gist.', 'Секретний Gist не видно в списках і пошуку, але відкрити його може кожен, хто має посилання. Токени й ключі в синхронізацію не потрапляють.': 'A secret Gist is not listed or searchable, but anyone with its link can open it. Tokens and keys never go into sync.', 'Як працює тека в хмарі': 'How the cloud folder works', 'Обери теку, яку синхронізує OneDrive, Google Drive чи Dropbox (кнопки вище знаходять їх самі).': 'Pick a folder that OneDrive, Google Drive or Dropbox syncs (the buttons above find them).', 'Komora пише туди komora-sync.json і щохвилини дивиться, чи його не змінив інший ПК.': 'Komora writes komora-sync.json there and looks every minute whether another PC changed it.', 'На іншому ПК обери ту саму теку тієї самої хмари.': 'On another PC pick the same folder of the same cloud.', 'Як отримати токен': 'How to get a token', 'Створи токен на GitHub (посилання нижче): назва — будь-яка, Repository access — «Public repositories».': 'Create a token on GitHub (the link below): any name, Repository access — “Public repositories”.', 'Для ліміту запитів дозволи не потрібні. Для синхронізації через Gist — Permissions → Account → Gists → Read and write.': 'The request limit needs no permissions. Sync through a Gist needs Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен і встав сюди → Зберегти.': 'Generate token, copy it, paste it here → Save.', 'Як отримати ключ': 'How to get a key', 'Зареєструйся на virustotal.com — це безкоштовно.': 'Sign up on virustotal.com — it is free.', 'Відкрий свій профіль → API key (посилання нижче) і скопіюй ключ.': 'Open your profile → API key (the link below) and copy the key.', 'Встав сюди → Зберегти. Безкоштовний ключ дає 4 запити на хвилину й 500 на день — Komora чекає сама.': 'Paste it here → Save. A free key allows 4 requests a minute and 500 a day — Komora waits by itself.', 'Колір фону': 'Background colour', 'Вікно й заголовок; світлота підлаштовується під тему': 'The window and its title bar; the lightness follows the theme', 'Свій колір': 'Own colour', 'теплий сірий': 'warm grey', 'графіт': 'graphite', 'сланець': 'slate', 'мох': 'moss', 'слива': 'plum', 'Кнопки, позначка розділу, рядок пошуку': 'Buttons, the section marker, the search field',
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
  'Познач на сторінці програми «У мій набір» те, що має бути на кожному ПК, — тут з’явиться кнопка «Встановити відсутні».': 'Mark “To my kit” on the page of an app that belongs on every PC — a button “Install the missing” appears here.',
  'Додай сайт, відео чи товар: Ctrl+V у вікні або кнопка «Додати».': 'Add a site, a video or a product: Ctrl+V in the window or the “Add” button.',
  'Усі': 'All', 'Застосовані': 'Applied', 'Скинуті Windows': 'Reset by Windows', 'Мої': 'Mine', 'автоматично': 'automatic', 'бірюзовий': 'teal', 'шавлія': 'sage', 'охра': 'ochre', 'як у Windows': 'like Windows',
  'Прибрати з набору': 'Remove from the kit', 'У мій набір': 'To my kit', 'у моєму наборі': 'in my kit', 'у мій набір': 'to my kit', 'Порівняти зміни на GitHub': 'Compare the changes on GitHub', 'Реліз на GitHub': 'The release on GitHub',
  'увімкнено для всіх у Налаштуваннях': 'on for every app in Settings', 'Сховати': 'Hide', 'Показати': 'Show', 'Встановити всі': 'Install all', 'Нещодавні й з оновленнями': 'Recent and with updates',
  'Набір порожній': 'The kit is empty', 'Усю групу в мій набір': 'The whole group to my kit', 'Прибрати групу з набору': 'Remove the group from the kit', 'Позиція': 'Item',
});
UK_ERR.push(
  [/^the VirusTotal key is not accepted$/, 'VirusTotal не приймає ключ'],
  [/^VirusTotal limit reached.*/, 'Вичерпано ліміт VirusTotal — спробуй за хвилину'],
  [/^VirusTotal answered HTTP (\d+)$/, 'VirusTotal відповів HTTP $1'],
  [/^the file is too large for an automatic upload$/, 'Файл завеликий для автоматичного вивантаження — завантаж його вручну'],
  [/^VirusTotal gave no (upload address|analysis id)$/, 'VirusTotal відповів незрозуміло'],
);
Object.assign(I, { grid: '', list: '', heart: '', clock: '', info: '', home: '', user: '', chevD: '', chevR: '', chevL: '', kit: '', unpin: '', disc: '', close: '', prev: '', next: '' });
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
  repo: [['репозиторій', 'репозиторії', 'репозиторіїв'], ['repository', 'repositories']],
  fresh: [['новий', 'нові', 'нових'], ['new', 'new']],
  path: [['шлях', 'шляхи', 'шляхів'], ['path', 'paths']],
  item: [['позиція', 'позиції', 'позицій'], ['item', 'items']],
  tweak: [['твік', 'твіки', 'твіків'], ['tweak', 'tweaks']],
  app: [['програма', 'програми', 'програм'], ['app', 'apps']],
};
const nwk = (n, k) => nw(n, W[k][0], W[k][1], k);

// ---------------------------------------------------------------- colours

const ACCENTS = { violet: ['#a78bfa', '#7c3aed'], blue: ['#58a6ff', '#0969da'], teal: ['#8dbfb7', '#2f6b64'], sage: ['#a7bfa0', '#4e7350'], ochre: ['#d3b47a', '#7d5e22'], windows: ['#60cdff', '#0067c0'] };
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

/** The accent of a choice for the theme in use; "windows" follows the accent of the system, toned to the theme. */
function accentOf(k) {
  let [d, l] = ACCENTS[k] || ACCENTS.violet;
  if (k === 'windows' && /^#[0-9a-f]{6}$/i.test(S.winAccent || '')) {
    const [h, s] = rgb2hsl(hex2rgb(S.winAccent));
    d = rgbHex(hsl2rgb(h, Math.min(s, 0.9), 0.74));
    l = rgbHex(hsl2rgb(h, Math.min(Math.max(s, 0.5), 0.9), 0.36));
  }
  return dark() ? d : l;
}
function applyAccent() {
  const c = accentOf(S.cfg.accent);
  const st = document.documentElement.style;
  st.setProperty('--acc', c);
  st.setProperty('--acc-text', c);
  st.setProperty('--on-acc', dark() ? '#18181b' : '#ffffff');
  // the selected section: a deeper fill of the accent with white text
  const [h, sat] = rgb2hsl(hex2rgb(c));
  st.setProperty('--acc-fill', dark() ? rgbHex(hsl2rgb(h, Math.min(1, sat * 0.9), 0.5)) : c);
  st.setProperty('--acc-soft', `rgb(${hex2rgb(c).join(' ')} / ${dark() ? 0.14 : 0.12})`);
}

// background: "" keeps the warm greys of app.css; the others derive every surface from one colour
const BGS = { '': '', obsidian: '#0f0f12', graphite: '#1c1c1c', slate: '#1a1e24', moss: '#1b1e1a', plum: '#1f1b21' };
// lightness of each surface against --base, as in the default palette
const BG_D = { base: 0, layer: -.022, card: .016, btn: .055, 'btn-h': .09, field: -.01, stroke: .09, stroke2: .157, div: .055, fly: .039, term: -.037, 'term-line': .055, bar: -.037 };
const BG_L = { base: 0, layer: .045, card: .075, btn: 0, 'btn-h': -.045, field: .09, stroke: -.069, stroke2: -.153, div: -.037, fly: .09, bar: 0 };
/** The base colour [h, s, l] of a background choice for the theme (win.rs base() makes the same caption colour). */
function bgBase(k, d = dark()) {
  const hex = k in BGS ? BGS[k] : /^#[0-9a-f]{6}$/i.test(k || '') ? k : '';
  if (!hex) return null;
  const [h, s, l] = rgb2hsl(hex2rgb(hex));
  const L = d ? (l <= .5 ? Math.min(.18, Math.max(.05, l)) : .104) : (l > .5 ? Math.min(.95, Math.max(.8, l)) : .896);
  return [h, s, L];
}
const bgHex = (k, d = dark()) => { const b = bgBase(k, d); return b ? rgbHex(hsl2rgb(...b)) : d ? '#1c1b19' : '#ebe7de'; };
function applyBg() {
  const k = S.cfg.bg || '';
  const st = document.documentElement.style;
  const b = bgBase(k);
  const d = dark();
  for (const n of Object.keys(BG_D)) st.removeProperty('--' + n);
  if (b) {
    const [h, s, L] = b;
    // lighter light bases leave less room above: the lighter surfaces are compressed towards white
    for (const [n, dl] of Object.entries(d ? BG_D : BG_L)) st.setProperty('--' + n, rgbHex(hsl2rgb(h, s, Math.min(1, Math.max(0, L + (!d && dl > 0 ? dl * (1 - L) / .104 : dl))))));
  }
}

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
  return a.icon ? picTile('icons/' + encodeURIComponent(a.icon), a.name || a.id, cls) : letterTile(a.name || a.id, cls);
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
const tabOf = {}, readmes = {}, rels = {}, forksOf = {}, bk = {}, repos = {};
const shapes = {}; // image URL → width / height
let checkProg = null, flashId = null, lastKey = '';
const scrolls = {};
if (['feed', 'attention', 'notinst'].includes(view)) view = 'home';
if (view === 'monitor') view = 'updates';

const disc = Object.assign({ q: '', sort: 'stars', lang: '', stars: '', updated: '', topic: 'windows', created: '', fork: 'true', owner: '' }, store.get('disc', {}),
  { items: [], total: 0, page: 1, seq: 0, loading: false, err: '', ran: false });

const apps = () => S?.lib.apps ?? [];
const appById = id => apps().find(a => a.id === id);
const groups = () => S?.lib.groups ?? [];
const authors = () => S?.lib.authors ?? [];
const isUpd = a => S?.updates.includes(a.id);
const busyOf = id => S?.busy[id];
const inLib = full => appById('gh:' + full.toLowerCase());
const LIB_VIEWS = ['all', 'apps', 'installed', 'portable', 'setup', 'kit', 'links'];
const isList = v => LIB_VIEWS.includes(v) || v.startsWith('g:') || v.startsWith('tag:');

function viewApps(v = view) {
  const a = apps();
  if (v === 'all') return a;
  if (v === 'apps') return a.filter(x => x.kind === 'github');
  if (v === 'updates') return a.filter(isUpd);
  if (v === 'installed') return a.filter(x => x.inst);
  if (v === 'portable') return a.filter(x => x.inst?.method === 'portable');
  if (v === 'setup') return a.filter(x => x.inst && !['portable', 'self'].includes(x.inst.method));
  if (v === 'kit') return a.filter(x => x.kit);
  if (v === 'links') return a.filter(x => x.kind === 'link');
  if (v.startsWith('g:')) return a.filter(x => x.groups.includes(v.slice(2)));
  if (v.startsWith('tag:')) return a.filter(x => x.tags.includes(v.slice(4)));
  return [];
}
const YEAR = 365 * 86400000;
/** What is wrong with an app or a link: an abandoned project, a broken signature, a dead page, an error. */
function health(a) {
  const out = [];
  if (a.kind === 'github') {
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
const TITLES = { home: 'Dashboard', all: 'Бібліотека', apps: 'Програми', updates: 'Оновлення', installed: 'Встановлені', portable: 'Портативні', setup: 'Встановлювачі', kit: 'Мій набір', links: 'Посилання', discover: 'Знайти', authors: 'Автори', tweaks: 'Твіки', newpc: 'Перенесення', settings: 'Налаштування' };
/** The tool of the sidebar a view belongs to (the Stitch layout: library, repositories, sync, tweaks and updates). */
const toolOf = v => v === 'kit' ? 'kit' : (isList(v) && !v.startsWith('g:')) ? 'all' : ['discover', 'authors'].includes(v) ? 'discover' : v;
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
const byName = (x, y) => (x.name || '').localeCompare(y.name || '', L, { sensitivity: 'base' });

/** Rows of a list in display order: [{title?, color?}, app…]; updates first, pinned apps after the others. */
function listModel() {
  const a = viewApps().slice();
  if (sortBy === 'added') return a.sort((x, y) => y.added - x.added);
  a.sort((x, y) => (isUpd(y) - isUpd(x)) || (!!x.pin - !!y.pin) || byName(x, y));
  if (sortBy !== 'group' || view.startsWith('g:') || !groups().length) return a;
  const out = [];
  for (const g of groups()) {
    const in_ = a.filter(x => x.groups.includes(g.id));
    if (in_.length) out.push({ title: g.name, color: g.color }, ...in_);
  }
  const none = a.filter(x => !x.groups.some(id => groups().some(g => g.id === id)));
  if (none.length) out.push({ title: t('Без групи') }, ...none);
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
  if (!appById(id)) return;
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
  if (d !== lastDark) { lastDark = d; post({ t: 'theme', dark: d }); }
}
let lastDark = null;

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
  const ab = `<i class="i">${I.add}</i><span class="lbl2">${t('Додати')}</span>`;
  if ($('#addBtn').innerHTML !== ab) $('#addBtn').innerHTML = ab;
  $('#addBtn').title = t('Додати програму чи посилання') + ' (Ctrl+N, Ctrl+V)';
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

function renderNav() {
  const a = apps();
  const tool = toolOf(view);
  const n = (v, icon, label, extra = '') => `<div class="n ${tool === v || view === v ? 'on' : ''}" data-view="${esc(v)}">${ic(icon)}<span class="nm">${esc(label)}</span>${extra}</div>`;
  const cnt = c => (c ? `<span class="cnt mono">${c}</span>` : '');
  const badge = (c, cls = '') => (c ? `<span class="badge ${cls} mono">${c}</span>` : '');
  const st = S.sync || {};
  let h = n('home', 'home', 'Dashboard');
  h += n('all', 'box', t('Бібліотека'), cnt(a.length));
  const kitApps = a.filter(x => x.kit && x.kind === 'github');
  h += `<div class="n kitnav ${tool === 'kit' ? 'on' : ''}" data-view="kit" data-kitdrop="1" title="${esc(t('Перетягни сюди програми, щоб додати їх у набір'))}">${ic('kit')}<span class="nm">${t('Мій набір')}</span>${kitApps.length ? `<span class="cnt mono">${kitApps.filter(x => x.inst).length}/${kitApps.length}</span>` : ''}</div>`;
  h += n('updates', 'download', t('Оновлення'), badge(S.updates.length, 'warn'));
  h += n('discover', 'search', t('Знайти'), badge(authors().reduce((s2, x) => s2 + (x.news?.length || 0), 0)));
  h += n('tweaks', 'tool', t('Твіки'), badge(S.resets, 'warn'));
  h += n('newpc', 'cloud', t('Перенесення'), st.err ? `<span class="cnt" style="color:var(--err)">${ic('warn')}</span>` : '');
  h += `<div class="nh ${fold.groups ? 'fold' : ''}" data-fold="groups"><span class="t">${t('Групи')}</span><button data-act="newGroup" title="${esc(t('Нова група'))}">${ic('add')}</button><i class="i chev">${I.chevD}</i></div>`;
  if (!fold.groups) {
    for (const g of groups())
      h += `<div class="n ${view === 'g:' + g.id ? 'on' : ''}" data-view="g:${esc(g.id)}" data-group="${esc(g.id)}"><span class="dot" style="background:${esc(g.color || '#8d9099')}"></span><span class="nm">${esc(g.name)}</span>${cnt(a.filter(x => x.groups.includes(g.id)).length)}</div>`;
    if (!groups().length) h += `<div class="m" style="padding:4px 12px">${t('Створи групу й перетягни туди програми')}</div>`;
  }
  h += `<div class="navfoot">${n('settings', 'settings', t('Налаштування'))}</div>`;
  const nav = $('#nav');
  if (nav.innerHTML !== h) { const sc = nav.scrollTop; nav.innerHTML = h; nav.scrollTop = sc; }
}

function renderStatus() {}

/** The main area: rebuilt only when its content changed and the user is not typing in it. */
function renderMain(force = false) {
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
function mainHtml() {
  const h = mainRaw();
  _norm.innerHTML = h;
  return _norm.innerHTML;
}
function mainRaw() {
  if (page?.k === 'app' && appById(page.id)) { const a = appById(page.id); return a.kind === 'link' ? linkPage(a) : appPage(a); }
  if (page?.k === 'repo') return repoPage();
  if (page?.k === 'author') return reposTabs() + authorPage();
  page = null;
  switch (view) {
    case 'home': return dashboard();
    case 'kit': return kitPage();
    case 'updates': case 'monitor': return updatesPage();
    case 'discover': return reposTabs() + discoverPage();
    case 'authors': return reposTabs() + authorsPage();
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

function dashboard() {
  if (!apps().length) return welcome();
  const a = apps();
  const upd = a.filter(isUpd);
  const bits = [];
  if (upd.length) bits.push(nwk(upd.length, 'updReady'));
  if (S.resets) bits.push(nwk(S.resets, 'reset'));
  let h = `<div class="page"><div class="phead"><div class="grow"><h1>Dashboard</h1><div class="sub">${esc(bits.join(' · ') || t('Усе спокійно'))}</div></div></div>`;
  if (S.resets) {
    if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); }
    const names = (tweakList || []).filter(x => x.status === 'reset').map(tweakName);
    h += `<div class="info warn"><span class="sign">!</span><div class="grow"><b>${t('Windows скинула твіки')}</b> <span class="m">${esc(names.join(', '))}</span></div><button class="btn sm" data-act="tweakFix">${t('Повернути')}</button></div>`;
  }
  // this PC: what Komora keeps here, and where it syncs to
  if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); }
  const st = S.sync || {};
  const where = S.cfg.syncDbx ? 'Dropbox' : S.cfg.syncGist ? 'GitHub Gist' : S.cfg.syncDir ? t('тека') : '';
  if (where && st.err) h = h.replace('<div class="phead">', `<div class="info err"><span class="sign">!</span><div class="grow"><b>${t('Синхронізація не вдалася')}</b> <span class="m">${esc(msg(st.err))}</span></div><button class="btn sm" data-view="newpc">${t('Відкрити «Перенесення»')}</button></div><div class="phead">`);
  const syncPill = !where ? `<span class="bdg">${t('синхронізацію вимкнено')}</span>` : st.err ? `<span class="bdg err">● ${esc(where)} · ${t('помилка')}</span>` : `<span class="bdg ok">● ${esc(where)}${st.okAt ? ' · ' + esc(ago(new Date(st.okAt * 1000).toISOString())) : ''}</span>`;
  const conf = a.filter(x => (x.bpaths?.length || 0) + (x.breg?.length || 0));
  const twOn = (tweakList || []).filter(x => x.status === 'on' || x.status === 'reset').length;
  const tile = (n, label, icon, val, note, v, tip) => `<div class="htile click" data-view="${v}" title="${esc(t(tip))}"><div class="hk mono"><span>${n} / ${esc(label)}</span>${ic(icon)}</div><div class="hv ${n === '04' && upd.length ? 'acc' : ''}">${val}</div><div class="m">${note}</div></div>`;
  h += `<section class="hero2"><div class="row wrap" style="gap:12px;align-items:flex-start"><div class="grow"><h2>${ic('pc')} ${esc(S.pc || 'PC')} <span class="m mono">Windows · ${esc(S.arch)}</span></h2></div>${syncPill}</div>
    <div class="htiles">${tile('01', t('Бібліотека'), 'box', a.length, `${a.filter(x => x.inst).length} ${t('встановлено', 'Усі програми й посилання в бібліотеці')} · ${nwk(a.filter(x => x.kind === 'link').length, 'link')}`, 'all')}${tile('02', t('Конфігурації'), 'save', conf.length, conf.length ? `${t('програм з копіями налаштувань', 'Програми, налаштування яких Komora копіює (теки й гілки реєстру)')}` : t('копій налаштувань ще немає'), 'all')}${tile('03', t('Твіки'), 'tool', twOn, S.resets ? `<span class="warnc">${nwk(S.resets, 'reset', 'Застосовані твіки Windows')}</span>` : t('активних'), 'tweaks')}${tile('04', t('Оновлення'), 'download', upd.length, upd.length ? t('готові до встановлення') : t('усе актуальне'), 'updates', 'Програми з новою версією')}</div></section>`;
  h += '<div class="grid4">';
  // updates
  h += `<section class="card s2" style="display:flex;flex-direction:column"><h2 class="big">${t('Оновлення')}${hint('Нові версії програм, які стоять на цьому ПК. Перевіряються за розкладом зі сторінки «Оновлення».')}<span class="mono">${upd.length ? `${upd.length} · ${fmtSize(upd.reduce((s, x) => s + (S.picks?.[x.id]?.size || 0), 0))}` : ''}</span></h2>`;
  if (upd.length) {
    for (const x of upd.slice(0, 6)) {
      const b = busyOf(x.id), pick = S.picks?.[x.id];
      h += `<div class="qrow" style="padding:10px 0;cursor:pointer" data-open="${esc(x.id)}">${iconHtml(x)}<div style="flex:1;min-width:0"><div class="row" style="gap:8px"><b>${esc(x.name)}</b>${mono(`<span class="m">${esc(x.inst.version || verOf(x.inst.tag))} → </span>${esc(verOf(x.latest.tag))}`)}</div><div class="m" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(b ? stageText(b) : [pick && fmtSize(pick.size), pick && kindLabel(pick.kind), ago(x.latest.date)].filter(Boolean).join(' · '))}</div></div>${b ? '' : `<button class="btn" data-act="installId" data-id="${esc(x.id)}">${t('Оновити')}</button>`}</div>`;
    }
    if (upd.length > 6) h += `<a class="alink" style="margin-top:8px" data-view="updates">${t('Усі оновлення')} (${upd.length})</a>`;
    h += `<div class="row" style="margin-top:auto;padding-top:14px"><span class="m grow">${t('Встановлюються по черзі; портативні лишають попередню версію для відкату')}</span><button class="btn acc" data-act="updateAll">${t('Оновити все')}</button></div>`;
  } else {
    const pinned = a.filter(x => x.pin && x.inst && x.latest && x.latest.tag !== x.pin);
    h += `<div style="margin:auto 0;padding:18px 0;text-align:center"><div class="num" style="color:var(--ok)">✓</div><div style="font-weight:600;margin-top:4px">${t('Усе актуальне')}</div><div class="m">${esc(statusText())}</div>`;
    if (pinned.length) h += `<div class="m" style="margin-top:6px">${t('Закріплено')}: ${pinned.map(x => `${esc(x.name)} ${esc(verOf(x.pin))} (${t('є')} ${esc(verOf(x.latest.tag))})`).join(', ')}</div>`;
    h += `<button class="btn" style="margin-top:12px" data-act="check" ${S.checking ? 'disabled' : ''}>${ic('refresh')} ${t('Перевірити зараз')}</button></div>`;
  }
  h += '</section>';
  const gh = a.filter(x => x.kind === 'github');
  // needs attention
  const bad = a.filter(x => health(x).length);
  if (bad.length) {
    h += `<section class="card s2"><h2>${t('Потребує уваги')}${hint('Програми й посилання, з якими щось не так: архівний чи покинутий проєкт, пошкоджений підпис, посилання не відкривається.')}<span class="mono">${bad.length}</span></h2>`;
    for (const x of bad.slice(0, 5)) {
      const hl = health(x);
      const sev = x.dead || x.inst?.signed === 'bad' || (x.inst?.vtHits > 0) || x.error ? 'var(--warn)' : 'var(--mu)';
      h += `<div class="qrow" style="padding:10px 0;cursor:pointer" data-open="${esc(x.id)}"><span class="sign" style="color:${sev}">${x.dead || x.error ? '×' : '~'}</span><div style="flex:1;min-width:0"><div>${esc(x.name)}</div><div class="m">${esc(hl.join(' · '))}</div></div><span class="alink">${t(x.kind === 'github' && (x.archived || x.pushed) && !x.error ? 'Форки' : 'Відкрити')}</span></div>`;
    }
    h += '</section>';
  }
  // log of the last check
  const lg = S.checkLog || {};
  h += `<section class="term s2"><div class="th"><span>${t('журнал перевірки')}${hint('Що знайшла остання перевірка оновлень.')}</span><span>${lg.at ? esc(new Date(lg.at * 1000).toLocaleString(L, { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })) : ''}</span></div><div class="tb">${(lg.lines || []).map(logLine).join('') || `<div class="mu">${t('ще не перевіряли')}</div>`}</div></section>`;
  // my kit
  const kit = a.filter(x => x.kit);
  if (kit.length) {
    const missing = kit.filter(x => x.kind === 'github' && !x.inst);
    const done = kit.length - missing.length;
    h += `<section class="card click kitcard" data-view="kit"><h2>${t('Мій набір')}${hint('Програми, які мають бути на кожному твоєму ПК. Познач програму «У мій набір» на її сторінці.')}</h2><div class="num">${done}<span style="color:var(--mu)">/${kit.length}</span></div><div class="row" style="gap:3px;margin:8px 0 10px">${kit.slice(0, 24).map((x, i) => `<span style="flex:1;height:10px;border-radius:2px;${i < done ? 'background:var(--acc)' : 'background:var(--btn-h)'}"></span>`).join('')}</div>${missing.length ? `<a class="alink" data-act="kitInstall">${t('Встановити')} ${esc(missing.slice(0, 2).map(x => x.name).join(ue(' і ', ' and ')))}${missing.length > 2 ? ` +${missing.length - 2}` : ''}</a>` : `<span class="m">${t('Усе з набору стоїть')}</span>`}</section>`;
  }
  // releases of the library
  const rel = gh.filter(x => x.latest?.date).sort((x, y) => Date.parse(y.latest.date) - Date.parse(x.latest.date));
  const days = Array.from({ length: 30 }, (_, i) => rel.filter(x => Math.floor((Date.now() - Date.parse(x.latest.date)) / 86400000) === 29 - i).length);
  const mx = Math.max(1, ...days);
  h += `<section class="card s2"><h2>${t('Релізи бібліотеки')}${hint('Нові релізи програм із бібліотеки за останні 30 днів, зокрема не встановлених.')}<span class="mono">${t('30 днів')} · ${days.reduce((s, x) => s + x, 0)}</span></h2><div role="img" aria-label="${esc(t('Релізи бібліотеки'))}" style="display:flex;align-items:flex-end;gap:3px;height:48px;margin:10px 0 6px">${days.map((n, i) => `<div title="${n}" style="flex:1;border-radius:2px;height:${n ? 10 + (n / mx) * 38 : 3}px;background:${n ? (i > 22 ? 'var(--acc)' : 'var(--stroke2)') : 'var(--div)'}"></div>`).join('')}</div>`;
  for (const x of rel.slice(0, 5)) h += `<div class="qrow" style="padding:6px 0;cursor:pointer" data-open="${esc(x.id)}" data-tab="news">${iconHtml(x, 'sm')}<span class="grow" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.name)}</span>${mono(`<span class="${isUpd(x) ? '' : 'm'}">${esc(verOf(x.latest.tag))}</span>`)}<span class="m" style="width:110px;text-align:right">${esc(ago(x.latest.date))}</span></div>`;
  h += '</section>';
  // new repositories of followed authors
  const fresh = authors().flatMap(au => (au.news || []).map(full => ({ au, full })));
  if (fresh.length) {
    h += `<section class="card s2"><h2>${t('Нове від авторів')}${hint('Нові репозиторії авторів, за якими стежиш (Знайти → Автори).')}<span class="mono">${fresh.length}</span></h2>`;
    for (const { au, full } of fresh.slice(0, 5)) {
      const it = au.repos.find(r => r.full === full);
      h += `<div class="qrow" style="padding:8px 0;cursor:pointer" data-repo="${esc(full)}" data-login="${esc(au.login)}">${avatarHtml(au.avatar, au.login, 'sm')}<div style="flex:1;min-width:0"><div>${esc(full)}</div><div class="m" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(it?.desc || '')}</div></div></div>`;
    }
    h += '</section>';
  }
  return h + '</div></div>';
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
function welcome() {
  return `<div class="empty"><span class="mark">${MARK}</span><div class="big">${t('Почни свою комору')}</div><div class="m" style="font-size:13px">${t('Встав посилання на репозиторій GitHub або будь-який сайт — Komora підтягне назву, значок і опис.')}</div>
  <div class="row" style="margin-top:18px"><input class="inp" id="firstUrl" placeholder="${esc(t('Встав посилання на GitHub або сайт'))}"><button class="btn acc" data-act="firstAdd">${t('Додати')}</button></div>
  <div class="ex"><span class="m">${t('або')}</span><button class="btn sm" data-view="discover">${ic('disc')} ${t('Знайти нове')}</button><button class="btn sm" data-act="importMenu">${ic('importI')} ${t('Імпорт')}</button><button class="btn sm" data-view="newpc">${ic('pc')} ${t('Набір з іншого ПК')}</button></div></div>`;
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
  if (a.inst) return `<i class="sdot ok" title="${esc(t('встановлено'))}"></i>` + pin + esc(a.inst.version || verOf(a.inst.tag)) + (a.inst.method === 'portable' ? ` · ${t('портативна')}` : '');
  if (a.error) return `<i class="sdot err"></i><span class="er">${esc(msg(a.error).slice(0, 70))}</span>`;
  return `<i class="sdot" title="${esc(t('не встановлено'))}"></i>` + esc(a.latest ? `${t('не встановлено')} · ${verOf(a.latest.tag)}` : t('немає релізів'));
}
function rowDesc(a) {
  if (a.kind === 'link') return esc([t({ video: 'Відео' }[a.linkKind] || 'Сторінка'), a.author || a.site].filter(Boolean).join(' · '));
  return esc(a.desc || `${a.owner}/${a.repo}`);
}
function rowHtml(a) {
  const b = busyOf(a.id);
  const det = b && b.pct >= 0 && b.stage === 'download';
  const bar = b ? `<span class="bar ${det ? '' : 'ind'}"><i style="width:${det ? Math.round(b.pct * 100) : 30}%"></i></span>` : '';
  let act = '';
  if (!b && isUpd(a)) act = `<button class="btn sm act warnb" data-act="installId" data-id="${esc(a.id)}">${ic('download')}<span class="lbl">${t('Оновити')}</span></button>`;
  else if (!b && a.kind === 'github' && !a.inst && S.picks?.[a.id]) act = `<button class="btn sm act" data-act="installId" data-id="${esc(a.id)}">${ic('download')}<span class="lbl">${t('Встановити')}</span></button>`;
  if (a.kind === 'github' && a.id !== 'gh:fenderenko/komora') act += `<button class="btn sm ico kitt ${a.kit ? 'on' : ''}" data-act="kitId" data-id="${esc(a.id)}" title="${esc(t(a.kit ? 'У моєму наборі — натисни, щоб прибрати' : 'Додати в мій набір'))}">${ic('kit')}</button>`;
  const pills = `${a.kit && view !== 'kit' ? `<i class="i kitmark" title="${esc(t('у моєму наборі'))}">${I.kit}</i>` : ''}${health(a).length ? `<span class="pill warn">!</span>` : ''}`;
  return `<div class="r ${a.id === cursor ? 'on' : ''} ${multi.has(a.id) ? 'multi' : ''}" data-id="${esc(a.id)}" draggable="true">${iconHtml(a)}<div class="tx"><div class="nm"><span>${esc(a.name)}</span>${pills}</div><div class="ds">${rowDesc(a)}</div></div><div class="meta">${rowMeta(a)}</div><div class="acts2">${act}</div>${bar}</div>`;
}

const layout = 'list';
/** One row of filters over the library; the layout and the sort on the right. */
function libToolbar() {
  const a = apps();
  const f = (v, label, c) => `<button class="fchip ${view === v ? 'on' : ''}" data-view="${v}">${esc(label)}${c ? `<span class="mono">${c}</span>` : ''}</button>`;
  let h = '<div class="toolbar"><div class="filters">';
  h += f('all', t('Усі'), a.length);
  h += f('apps', t('Програми'), a.filter(x => x.kind === 'github').length);
  h += f('links', t('Посилання'), a.filter(x => x.kind === 'link').length);
  if (allTags().length) h += `<button class="fchip pick ${view.startsWith('tag:') ? 'on' : ''}" data-act="tagPick">${esc(view.startsWith('tag:') ? viewTitle() : t('Тег'))}${ic('chevD')}</button>`;
  h += '</div><div class="tools">';
  h += `<button class="btn ico flat" data-act="sort" title="${esc(t({ name: 'За назвою', group: 'За групами', added: 'Нещодавно додані' }[sortBy]))}">${ic('sort')}</button>`;
  return h + '</div></div>';
}
function listPage() {
  if (!apps().length && view === 'all') return welcome();
  const items = visibleOrder();
  const inGroup = view.startsWith('g:');
  let h = '<div class="page wide">';
  if (inGroup) h += `<div class="lhead"><span class="dot" style="background:${esc(groups().find(g => g.id === view.slice(2))?.color || '#8d9099')}"></span><h1>${esc(viewTitle())}</h1><span class="mono m">${items.length}</span><span class="grow"></span><button class="btn sm" data-act="addToGroup">${ic('add')} ${t('Додати в цю групу')}</button><button class="btn sm ico" data-act="groupCtx" title="${esc(t('Група'))}">${ic('more')}</button></div>`;
  else h += libToolbar();
  if (!items.length) return h + emptyView() + '</div>';
  h += '<div class="list">';
  for (const x of listModel()) h += x.id ? rowHtml(x) : `<div class="gt">${x.color ? `<span class="dot" style="background:${esc(x.color)}"></span>` : ''}${esc(x.title)}</div>`;
  h += '</div>';
  if (multi.size > 1) {
    const upd = [...multi].map(appById).filter(a => a && isUpd(a));
    const allKit = [...multi].map(appById).every(a => a?.kit);
    h += `<div class="bulk"><span class="mono">${t('Обрано')} ${multi.size}</span><span class="grow"></span>${upd.length ? `<button class="btn sm" data-act="bulkUpdate">${t('Оновити')} ${upd.length}</button>` : ''}<button class="btn sm" data-act="bulkKit">${ic('kit')} ${t(allKit ? 'Прибрати з набору' : 'У мій набір')}</button><button class="btn sm" data-act="bulkGroup">${t('У групу')}</button><button class="btn sm" data-act="bulkShare">${ic('link')} ${t('Поділитися')}</button><button class="btn sm danger" data-act="bulkRemove">${t('Прибрати')}</button></div>`;
  }
  return h + '</div>';
}

/** The tabs of «Find»: GitHub search and the authors followed. */
function reposTabs() {
  const tab = (v, icon, label, extra) => `<button class="${view === v || (v === 'authors' && page?.k === 'author') ? 'on' : ''}" data-view="${v}">${ic(icon)}<span>${esc(label)}</span>${extra ? `<span class="mono cnt">${extra}</span>` : ''}</button>`;
  return `<div class="hubtabs">${tab('discover', 'search', t('Пошук на GitHub'), '')}${tab('authors', 'user', t('Автори'), authors().length || '')}</div>`;
}

/** «My kit»: the apps that belong on every PC — how many are here, the missing in one click, what the kit does by itself. */
function kitPage() {
  const all = apps().filter(x => x.kit);
  const gh = all.filter(x => x.kind === 'github');
  const here = gh.filter(x => x.inst).length;
  const miss = gh.filter(x => !x.inst);
  const c = S.cfg;
  const sw = (key, on) => `<span class="sw ${on ? 'on' : ''}" role="switch" aria-checked="${!!on}" data-act="cfgSw" data-key="${key}"></span>`;
  let h = `<div class="page narrow"><div class="phead"><div class="grow"><h1>${ic('kit')} ${t('Мій набір')}</h1><div class="sub">${t('Програми, які мають бути на кожному твоєму ПК')}</div></div>${gh.length ? `<button class="btn" data-act="exportKit">${ic('box')} ${t('Зберегти лише набір (.zip)')}</button>` : ''}</div>`;
  if (gh.length) {
    const pct = Math.round(here / gh.length * 100);
    h += `<section class="kithead"><div class="grow"><div class="kt">${t('На цьому ПК')}: <b>${here}</b> ${t('із')} ${gh.length}</div><span class="pbar"><i style="width:${pct}%"></i></span></div>${miss.length ? `<button class="btn acc" data-act="kitInstall">${ic('download')} ${t('Встановити відсутні')} (${miss.length})</button>` : `<span class="bdg ok">${ic('check')} ${t('Усе з набору стоїть')}</span>`}</section>`;
  }
  h += `<section class="card kitset"><div class="opt"><span><b>${t('Оновлювати програми набору самі')}</b><br><span class="m">${t('Після кожної перевірки нові версії програм набору ставляться без твого кліку')}</span></span>${sw('kitAutoUpdate', c.kitAutoUpdate)}</div><div class="opt"><span><b>${t('На новому ПК ставити набір самі')}</b><br><span class="m">${t('Коли набір приходить із синхронізації чи набору, відсутні програми встановлюються самі')}</span></span>${sw('kitAutoInstall', c.kitAutoInstall)}</div><div class="m" style="padding:6px 0 2px">${t('Копії налаштувань програм набору завжди їдуть у zip-набір із «Перенесення».')}</div></section>`;
  if (!all.length) return h + `<div class="empty"><span class="mark kitm"><i class="i">${I.kit}</i></span><div class="big">${t('Набір порожній')}</div><div class="m" style="font-size:13px">${t('Додай програму кнопкою з позначкою набору — у рядку бібліотеки, на сторінці програми чи в результатах пошуку GitHub. Або перетягни програми на «Мій набір» у меню.')}</div></div></div>`;
  h += '<div class="list" style="margin-top:12px">' + all.slice().sort(byName).map(rowHtml).join('') + '</div>';
  return h + '</div>';
}

/** Updates: what is ready, checking and its schedule, and what needs attention. */
function updatesPage() {
  const a = apps();
  const upd = a.filter(isUpd);
  const c = S.cfg;
  const sel = `<select class="inp" data-cfg="checkHours" style="width:auto">${[[24, 'Щодня'], [168, 'Щотижня'], [720, 'Щомісяця'], [0, 'Вручну']].map(([v, l]) => `<option value="${v}" ${+c.checkHours === v ? 'selected' : ''}>${esc(t(l))}</option>`).join('')}</select>`;
  let h = `<div class="page narrow"><div class="phead"><div class="grow"><h1>${t('Оновлення')}</h1><div class="sub">${esc(statusText())}</div></div><div class="row wrap"><span class="m">${t('Перевіряти')}</span>${sel}<button class="btn" data-act="check" ${S.checking ? 'disabled' : ''}>${ic('refresh')} ${t(S.checking ? 'Перевіряю…' : 'Перевірити зараз')}</button>${upd.length ? `<button class="btn acc" data-act="updateAll">${t('Оновити все')} (${upd.length})</button>` : ''}</div></div>`;
  if (S.resets) {
    if (tweakList === null) { tweakList = []; post({ t: 'tweaks' }); }
    const names = (tweakList || []).filter(x => x.status === 'reset').map(tweakName);
    h += `<div class="info warn"><span class="sign">!</span><div class="grow"><b>${t('Windows скинула твіки')}</b> <span class="m">${esc(names.join(', '))}</span></div><button class="btn sm" data-act="tweakFix">${t('Повернути')}</button></div>`;
  }
  if (upd.length) h += '<div class="list">' + upd.map(rowHtml).join('') + '</div>';
  else {
    const pinned = a.filter(x => x.pin && x.inst && x.latest && x.latest.tag !== x.pin);
    h += `<div class="empty" style="margin:40px auto"><span class="mark" style="background:var(--ok-bg);color:var(--ok)"><i class="i">${I.check}</i></span><div class="big">${t('Усе актуальне')}</div>${pinned.length ? `<div class="m">${t('Закріплено')}: ${pinned.map(x => `${esc(x.name)} ${esc(verOf(x.pin))} (${t('є')} ${esc(verOf(x.latest.tag))})`).join(', ')}</div>` : ''}</div>`;
  }
  const bad = a.filter(x => health(x).length);
  if (bad.length) {
    h += `<div class="sect">${t('Потребує уваги')} · ${bad.length}</div><div class="list">`;
    for (const x of bad) h += `<div class="r" data-id="${esc(x.id)}">${iconHtml(x)}<div class="tx"><div class="nm"><span>${esc(x.name)}</span></div><div class="ds">${esc(health(x).join(' · '))}</div></div></div>`;
    h += '</div>';
  }
  return h + '</div>';
}

function emptyView() {
  const g = view.startsWith('g:') ? 'group' : view.startsWith('tag:') ? 'tag' : view;
  const E = {
    updates: ['check', 'Оновлень немає', 'Усі встановлені програми актуальні.'],
    installed: ['installed', 'Ще нічого не встановлено', 'Тут будуть програми, які ти встановиш через Komora, і ті, що вже є у Windows.'],
    kit: ['kit', 'Набір порожній', 'Познач на сторінці програми «У мій набір» те, що має бути на кожному ПК, — тут з’явиться кнопка «Встановити відсутні».'],
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

function primary(a) {
  const b = busyOf(a.id);
  if (b) return { busy: b, icon: 'download', label: stageText(b) };
  if (a.kind === 'link') {
    const k = a.linkKind;
    return { icon: k === 'video' ? 'play' : 'open', label: t(k === 'video' ? 'Дивитись' : 'Відкрити'), fn: () => post({ t: 'open', url: a.url }) };
  }
  const pick = S.picks?.[a.id];
  if (isUpd(a)) return { icon: 'download', label: `${t('Оновити до')} ${verOf(a.latest.tag)}`, fn: () => post({ t: 'install', id: a.id }) };
  if (!a.inst && a.latest && pick) return { icon: 'download', label: t('Встановити'), note: [fmtSize(pick.size), kindLabel(pick.kind)].filter(Boolean).join(' · '), fn: () => post({ t: 'install', id: a.id }) };
  if (!a.inst) return { icon: 'globe', label: t('Відкрити на GitHub'), note: a.latest ? t('немає файлу для Windows') : t('немає релізів'), fn: () => post({ t: 'open', url: a.url }) };
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
  const state = upd ? `<span class="warnc">${esc(inst.version || verOf(inst.tag))} → ${esc(verOf(lt.tag))}</span>` : inst ? `<span class="okc">●</span> ${esc(inst.version || verOf(inst.tag) || '?')} · ${esc(methodLabel(inst.method))}` : `${t('не встановлено')}${lt ? ` · ${t('останній')} ${esc(verOf(lt.tag))}` : ''}`;
  let h = `<div class="page">${crumb(a.name)}<div class="ahead">${iconHtml(a, 'lg')}<div class="tx"><h1 title="${esc(a.name)}">${esc(a.name)}</h1><div class="src"><a data-act="openUrl" data-url="${esc(a.url)}">${esc(a.owner)}/${esc(a.repo)}</a> · ★ ${fmtNum(a.stars || 0)}${a.license ? ' · ' + esc(a.license) : ''}</div><div class="stl mono">${state}</div>${a.desc ? `<div class="desc">${esc(a.desc)}</div>` : ''}${chipsHtml(a)}</div>`;
  h += '<div><div class="acts">';
  if (inst?.exe && !self && !p.busy && p.label !== t('Запустити')) h += `<button class="btn" data-act="launch">${t('Запустити')}</button>`;
  h += `<div class="split"><button class="btn acc" data-act="primary" ${p.busy ? 'disabled' : ''}>${ic(p.icon)} ${esc(p.label)}</button>${a.kind === 'github' && !self ? `<button class="btn acc ico" data-act="versions" title="${esc(t('Інші версії'))}">${ic('chevD')}</button>` : ''}</div>`;
  if (!self) h += `<button class="btn kitbtn ${a.kit ? 'on' : ''}" data-act="kit" title="${esc(t('Програми, які мають бути на кожному твоєму ПК'))}">${ic(a.kit ? 'check' : 'kit')} ${t(a.kit ? 'У моєму наборі' : 'У мій набір')}</button>`;
  h += `<button class="btn ico" data-act="appMore" title="${esc(t('Ще'))}">${ic('more')}</button></div>`;
  if (p.busy) h += progHtml(p.busy);
  else if (p.note) h += `<div class="m" style="margin-top:6px;text-align:right">${esc(p.note)}</div>`;
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
  return tabOf[a.id] ?? (isUpd(a) ? 'news' : 'readme');
}
function tabsHtml(a) {
  const cur = currentTab(a);
  const tb = (k, label) => `<button class="${cur === k ? 'on' : ''}" data-act="tab" data-tab="${k}">${t(label)}</button>`;
  return `<div class="tabs" role="tablist">${a.latest ? tb('news', 'Що нового') : ''}${tb('readme', 'Опис')}${tb('releases', 'Релізи')}${cur === 'forks' ? tb('forks', 'Форки') : ''}${tb('settings', 'Параметри')}</div>`;
}
const compareUrl = (a, from, to) => `https://github.com/${a.owner}/${a.repo}/compare/${encodeURIComponent(from)}...${encodeURIComponent(to)}`;
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
      `<div class="row" style="margin-top:12px"><a class="alink" data-act="openUrl" data-url="${esc(from ? compareUrl(a, from, l.tag) : l.url)}">${t(from ? 'Порівняти зміни на GitHub' : 'Реліз на GitHub')} →</a></div>`;
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
    h += `<div>${t('Тестові релізи')}</div><div class="row"><span class="sw ${a.pre || S.cfg.preAll ? 'on' : ''} ${S.cfg.preAll ? 'busy' : ''}" data-act="appSw" data-key="pre"></span><span class="m">${t(S.cfg.preAll ? 'увімкнено для всіх у Налаштуваннях' : 'пропонувати пре-релізи як оновлення')}</span></div>`;
    if (a.inst) h += `<div>${t('Закріпити на версії')}</div><div class="row"><span class="sw ${a.pin ? 'on' : ''}" data-act="pin"></span><span class="m mono">${esc(a.pin ? verOf(a.pin) : '')}</span></div>`;
    if (a.latest) h += `<div>${t('Пропустити реліз')}</div><div class="row">${a.skip ? `<span class="m">${t('Пропущено')} ${esc(verOf(a.skip))}</span><button class="btn sm" data-act="unskip">${t('Скасувати')}</button>` : `<button class="btn sm" data-act="skip">${t('Пропустити')} ${esc(verOf(a.latest.tag))}</button>`}</div>`;
    h += `<div>${t('Назва')}</div><input class="inp" data-act="rename" value="${esc(a.name)}" maxlength="80">`;
    if (a.inst?.dir) h += `<div>${t('Тека')}</div><div class="row"><a class="path" style="cursor:pointer" data-act="folder">${esc(a.inst.dir)}</a></div>`;
    h += '</div>';
    h += `<div class="psect">${t('Нотатки')}</div><textarea class="inp" data-act="notes" style="height:110px" placeholder="${esc(t('Мої нотатки — навіщо ця програма, що налаштувати…'))}">${esc(a.notes)}</textarea>`;
    if (a.kind === 'github') {
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
  h += '</div><div class="facts" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-top:4px">';
  const fact = (kk, v, note = '', cls = '') => `<div class="fact"><div class="k">${kk}</div><div class="v">${v}</div><div class="h ${cls}">${note}</div></div>`;
  if (k === 'video') {
    h += fact(t('Канал'), esc(a.author || '—')) + fact(t('Платформа'), esc(a.site || hostOf(a.url))) + fact(t('Додано'), esc(dateOf(a.added)));
  } else {
    h += fact(t('Сайт'), esc(a.site || hostOf(a.url))) + fact(t('Додано'), esc(dateOf(a.added))) + fact(t('Перевірено'), esc(a.metaAt ? shortAgo(a.metaAt) : '—'), esc(t('раз на тиждень')));
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
  if (!/repo:/.test(disc.q)) p.push('archived:false');
  return p.join(' ');
}
function discSave() {
  const { q, sort, lang, stars, updated, topic, created, fork, owner } = disc;
  store.set('disc', { q, sort, lang, stars, updated, topic, created, fork, owner });
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
  post({ t: 'ghSearch', q: discQuery(), sort: disc.sort === 'best' ? '' : disc.sort, page: disc.page, seq: disc.seq });
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
  const act = (lib ? `<span class="pill acc" title="${esc(t('У бібліотеці'))}">${ic('check')}<span class="lbl">${t('У бібліотеці')}</span></span>` : `<button class="btn sm act" data-act="addUrl" data-url="https://github.com/${esc(it.full)}" title="${esc(t('У бібліотеку'))}">${ic('add')}<span class="lbl">${t('У бібліотеку')}</span></button>`)
    + (la?.inst ? '' : `<button class="btn sm act" data-act="addInstall" data-full="${esc(it.full)}" title="${esc(t('Встановити'))}">${ic('download')}<span class="lbl">${t('Встановити')}</span></button>`)
    + (la ? `<button class="btn sm ico kitt ${la.kit ? 'on' : ''}" data-act="kitId" data-id="${esc(la.id)}" title="${esc(t(la.kit ? 'У моєму наборі — натисни, щоб прибрати' : 'Додати в мій набір'))}">${ic('kit')}</button>` : `<button class="btn sm ico kitt" data-act="addKit" data-full="${esc(it.full)}" title="${esc(t('Додати в бібліотеку й у мій набір'))}">${ic('kit')}</button>`);
  return `<div class="r" data-full="${esc(it.full)}">${avatarHtml(it.avatar, it.owner)}<div class="tx"><div class="nm"><span>${esc(it.name)}</span>${extra}${it.fork ? `<span class="pill">${t('форк')}</span>` : ''}${it.archived ? `<span class="pill">${t('архів')}</span>` : ''}<span class="m" style="font-weight:400">${esc(it.owner)}</span></div><div class="ds">${esc(it.desc || it.full)}</div></div><div class="meta">★ ${fmtNum(it.stars)}${gain}<br><span class="m" title="${esc(t('Коли автор востаннє змінював код'))}">${esc([it.lang, it.pushed && `${t('оновлено')} ${ago(it.pushed)}`].filter(Boolean).join(' · '))}</span></div><div class="acts2">${act}</div></div>`;
}
function discoverPage() {
  if (!disc.ran && !disc.loading) { disc.ran = true; setTimeout(() => discSearch(), 0); }
  const opt = (v, l, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(l)}</option>`;
  let h = `<div class="page narrow"><div class="phead"><div class="grow"><h1>${t('Знайти нове')}</h1><div class="sub">${t('Пошук на GitHub')}${disc.total ? ' · ' + mono(disc.total.toLocaleString(L)) + ' ' + t('знайдено') : ''}</div></div></div>`;
  h += `<div class="row"><label class="search grow"><span class="mono prompt">❯</span><input id="dq" value="${esc(disc.q)}" placeholder="${esc(t('Шукати на GitHub'))}" spellcheck="false"></label><button class="btn acc" data-act="discGo">${ic('search')} ${t('Шукати')}</button></div>`;
  h += `<div class="dpre"><span class="dl">${t('Добірки')}</span><div class="filters">${PRESETS.map(([l, p]) => `<button class="fchip ${Object.entries(p).every(([k, v]) => String(disc[k]) === String(v)) ? 'on' : ''}" data-act="preset" data-p="${esc(l)}">${t(l)}</button>`).join('')}</div></div>`;
  const fld = (label, ctl) => `<label class="dfld"><span class="dl">${label}</span>${ctl}</label>`;
  h += `<div class="dgrid">
    ${fld(t('Сортування'), `<select class="inp" data-f="sort">${opt('best', t('Найкращі збіги'), disc.sort)}${opt('stars', t('Більше зірок'), disc.sort)}${opt('updated', t('Нещодавно оновлені'), disc.sort)}</select>`)}
    ${fld(t('Мова'), `<select class="inp" data-f="lang">${opt('', t('Будь-яка'), disc.lang)}${LANGS.map(x => opt(x, x, disc.lang)).join('')}</select>`)}
    ${fld(t('Зірки'), `<select class="inp" data-f="stars">${opt('', t('Будь-скільки'), disc.stars)}${['10', '100', '1000', '10000'].map(x => opt(x, `${(+x).toLocaleString(L)}+`, disc.stars)).join('')}</select>`)}
    ${fld(t('Оновлено'), `<select class="inp" data-f="updated">${opt('', t('Будь-коли'), disc.updated)}${opt('30', t('За місяць'), disc.updated)}${opt('180', t('За пів року'), disc.updated)}${opt('365', t('За рік'), disc.updated)}</select>`)}
    ${fld(t('Тема GitHub'), `<select class="inp" data-f="topic">${opt('', t('Будь-яка'), disc.topic)}${['windows', 'windows-11', 'tray', 'utility', 'productivity', 'audio', 'screenshot', 'clipboard'].map(x => opt(x, x, disc.topic)).join('')}</select>`)}
    ${fld(t('Форки'), `<select class="inp" data-f="fork">${opt('', t('Без форків'), disc.fork)}${opt('true', t('Разом з форками'), disc.fork)}${opt('only', t('Лише форки'), disc.fork)}</select>`)}
    ${fld(t('Автор GitHub'), `<input class="inp" data-f="owner" value="${esc(disc.owner)}" placeholder="${esc(t('будь-хто'))}">`)}
  </div>`;
  if (hist.length) h += `<div class="dpre"><span class="dl">${t('Нещодавні')}</span>${hist.map(q => `<span class="chip" data-act="histQ" data-q="${esc(q)}">${esc(q)}</span>`).join('')}</div>`;
  h += '<div class="list" style="margin-top:16px">';
  if (disc.err) h += `<div class="info err"><span class="sign">!</span><div class="grow">${esc(msg(disc.err))}</div></div>`;
  else if (!disc.items.length && !disc.loading) h += `<div class="nothing">${t('Нічого не знайдено')}</div>`;
  for (const it of disc.items) h += repoRow(it);
  if (disc.loading) h += `<div class="nothing">${t('Шукаю…')}</div>`;
  else if (disc.items.length && disc.items.length < Math.min(disc.total, 1000)) h += `<button class="btn more" data-act="discMore">${t('Показати ще')}</button>`;
  h += `</div><div class="m" style="margin-top:12px">${t('Ліміт пошуку GitHub: 10 запитів на хвилину без токена, 30 — з токеном.')}</div>`;
  return h + '</div>';
}
/** Images of a README that are not badges: the first is the banner, the next ones are screenshots. */
function readmeImages(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('img')].map(i => i.getAttribute('src')).filter(s => s && /^https:/.test(s) && !/\.svg(\?|$)/i.test(s));
}
function repoPage() {
  const full = page.full;
  const it = page.item || disc.items.find(x => x.full === full) || { full, owner: full.split('/')[0], name: full.split('/')[1], desc: '', stars: 0, topics: [], url: `https://github.com/${full}`, avatar: '' };
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
  h += `<div><div class="acts">${act}<button class="btn ico" data-act="repoMore" title="${esc(t('Ще'))}">${ic('more')}</button></div>${r?.pick && !lib ? `<div class="m" style="margin-top:6px;text-align:right">${esc([fmtSize(r.pick.size), kindLabel(r.pick.kind)].filter(Boolean).join(' · '))}</div>` : r && !r.pick && !lib ? `<div class="m" style="margin-top:6px;text-align:right">${esc(r.release ? t('немає файлу для Windows') : t('немає релізів'))}</div>` : ''}${b ? progHtml(b) : ''}</div></div>`;
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
  let h = `<div class="page narrow"><div class="phead"><div class="grow"><h1>${t('Автори')}</h1><div class="sub">${t('Нові репозиторії тих, за ким стежиш, — під час кожної перевірки')}</div></div></div>`;
  h += `<div class="row" style="margin-bottom:16px"><input class="inp" id="followIn" placeholder="${esc(t('Логін GitHub або посилання на профіль'))}" style="max-width:360px"><button class="btn acc" data-act="follow">${ic('add')} ${t('Стежити')}</button></div>`;
  if (!list.length) return h + `<div class="empty"><span class="mark"><i class="i">${I.user}</i></span><div class="big">${t('Ще ні за ким не стежиш')}</div><div class="m" style="font-size:13px">${t('Стежити можна зі сторінки програми (меню ⋯) або тут за логіном.')}</div></div></div>`;
  h += '<div class="list">';
  for (const au of list) {
    const n = au.news?.length || 0;
    h += `<div class="r" data-login="${esc(au.login)}">${avatarHtml(au.avatar, au.login)}<div class="tx"><div class="nm"><span>${esc(au.name || au.login)}</span>${n ? `<span class="pill acc">+${nwk(n, 'fresh')}</span>` : ''}<span class="m" style="font-weight:400">@${esc(au.login)}</span></div><div class="ds">${esc(au.bio || '')}</div></div><div class="meta">${nwk(au.repos.length, 'repo')}<br><span class="m">${au.checked ? esc(shortAgo(au.checked)) : ''}</span></div></div>`;
  }
  return h + '</div></div>';
}
function authorPage() {
  const au = authors().find(x => x.login.toLowerCase() === page.login.toLowerCase());
  if (!au) return `<div class="page narrow"><div class="crumb"><a data-act="crumb">${t('Автори')}</a></div><div class="nothing">${t('Завантаження…')}</div></div>`;
  const news = new Set(au.news || []);
  let h = `<div class="page narrow"><div class="crumb"><a data-act="crumb">${t('Автори')}</a><span class="sep">›</span><b>${esc(au.name || au.login)}</b></div>`;
  h += `<div class="ahead">${avatarHtml(au.avatar, au.login, 'lg')}<div class="tx"><h1>${esc(au.name || au.login)}</h1><div class="src"><a data-act="openUrl" data-url="https://github.com/${esc(au.login)}">@${esc(au.login)}</a> · ${nwk(au.repos.length, 'repo')}${au.org ? ` · ${t('організація')}` : ''}${au.blog ? ` · <a data-act="openUrl" data-url="${esc(/^https?:/.test(au.blog) ? au.blog : 'https://' + au.blog)}">${esc(hostOf(/^https?:/.test(au.blog) ? au.blog : 'https://' + au.blog))}</a>` : ''}</div>${au.bio ? `<div class="desc">${esc(au.bio)}</div>` : ''}</div>`;
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
  let h = `<div class="page narrow"><div class="phead"><div class="grow"><h1>${t('Твіки Windows')}</h1><div class="sub">${t('Кожен можна скасувати — Komora пам’ятає, що було до нього.')}</div></div><div class="row"><button class="btn" data-act="explorer">${ic('restart')} ${t('Перезапустити Провідник')}</button><button class="btn acc" data-act="tweakNew">${ic('add')} ${t('Свій твік')}</button></div></div>`;
  const fdot = { on: 'ok', reset: 'warn', custom: 'acc' };
  h += `<div class="filters">${[['all', 'Усі'], ['on', 'Застосовані'], ['reset', 'Скинуті Windows'], ['custom', 'Мої']].map(([k, l]) => `<button class="fchip ${tweakFilter === k ? 'on' : ''}" data-act="tweakFilter" data-f="${k}">${fdot[k] ? `<i class="sdot ${fdot[k]}"></i>` : ''}${t(l)}<span class="mono">${tweakList.filter(F[k]).length}</span></button>`).join('')}</div>`;
  if (reset.length) h += `<div class="info warn" style="margin-top:14px"><span class="sign">!</span><div class="grow"><b>${t('Windows скинула твіки:')} ${esc(reset.map(tweakName).join(', '))}.</b> <span class="m">${t('Komora перевіряє твіки після кожного запуску й перевірки оновлень.')}</span></div><button class="btn sm" data-act="tweakFix">${t('Повернути всі')}</button></div>`;
  let sectN = 0;
  for (const [cat, title, icon] of TCATS) {
    const list = tweakList.filter(x => x.cat === cat && F[tweakFilter](x));
    if (!list.length) continue;
    const all = tweakList.filter(x => x.cat === cat);
    const act = all.filter(isOn).length;
    sectN += 1;
    h += `<div class="sect tsect"><span><span class="acc">${String(sectN).padStart(2, '0')} //</span> ${t(title)}</span><span class="mono ${act === all.length ? 'okc' : ''}">${act} ${t('із')} ${all.length} ${t('активні')}</span></div>`;
    for (const x of list) {
      const busy = tweakBusy.has(x.id);
      const tag = '';
      const after = { explorer: t('після перезапуску Провідника'), logon: t('після повторного входу') }[x.restart] || '';
      const [stCls, stTxt] = x.status === 'reset' ? ['warn', t('скинуто Windows')] : x.status === 'already' ? ['acc', t('уже так у Windows')] : isOn(x) ? ['ok', t('застосовано')] : ['', t('вимкнено')];
      const state = `<i class="sdot ${stCls}"></i>${stTxt}`;
      h += `<div class="tw"><i class="i">${I[icon]}</i><div class="tx"><div class="nm"><span>${esc(tweakName(x))}</span>${tag}${x.admin ? `<span class="pill mono">admin</span>` : ''}</div><div class="d">${esc(desc(x))}${after ? ' · ' + esc(after) : ''}</div></div>`;
      if (x.custom) h += `<button class="btn sm ico flat" data-act="tweakEdit" data-id="${esc(x.id)}" title="${esc(t('Змінити'))}">${ic('edit')}</button>`;
      h += `<span class="st">${state}</span>`;
      if (x.status === 'reset' && !busy) h += `<button class="btn sm" data-act="tweakOn" data-id="${esc(x.id)}">${t('Повернути')}</button>`;
      h += `<span class="sw ${isOn(x) ? 'on' : ''} ${busy ? 'busy' : ''}" role="switch" aria-checked="${isOn(x)}" data-act="tweakSw" data-id="${esc(x.id)}" data-on="${isOn(x) ? 1 : ''}"></span></div>`;
    }
  }
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
  const offered = apps().filter(a => a.kind === 'github' && a.wasInstalled && !a.inst);
  const mode = c.syncDir ? 'dir' : c.syncDbx ? 'dropbox' : dbxForm ? 'dropbox' : c.syncGist ? 'gist' : 'off';
  const st = S.sync || {};
  let h = `<div class="page narrow"><div class="phead"><div class="grow"><h1>${t('Перенесення')}</h1><div class="sub">${t('На інший ПК чи після перевстановлення Windows: бібліотека, групи, теги, нотатки, твіки й копії налаштувань.')}</div></div></div><div class="grid2">`;
  // take everything to another PC
  const applied = (tweakList || []).filter(x => x.status === 'on' || x.status === 'reset').length;
  if (bkInfo === null) { bkInfo = undefined; post({ t: 'bkSize' }); }
  const frow = (icon, title, d, btn) => `<div class="frow"><span class="fic">${ic(icon)}</span><div class="tx"><div class="ft">${title}</div><div class="m">${d}</div></div>${btn}</div>`;
  h += `<section class="card"><h2 class="big">${t('Файл набору')}${hint('Один файл, щоб забрати бібліотеку на інший ПК чи на чисту Windows.')}</h2><div class="fl">
    ${frow('box', t('Зберегти набір'), `${t('Файл .zip: бібліотека, групи, теги, нотатки, твіки й сама Komora.exe. На новому ПК розпакуй, запусти Komora.exe й відкрий цей zip.')}<label class="bkw"><span class="sw ${bkWith ? 'on' : ''}" role="switch" aria-checked="${bkWith}" data-act="bkWith"></span>${t('З налаштуваннями програм')}<span class="mono m">${bkInfo ? (bkInfo.apps ? `${nwk(bkInfo.apps, 'app')} · ${fmtSize(bkInfo.size) || '0'}` : t('копій ще немає')) : '…'}</span></label>`, `<button class="btn acc" data-act="export" data-zip="1">${t('Зберегти .zip')}</button>`)}
    ${frow('importI', t('Відкрити набір'), t('Файл .komora чи .zip — або встав посилання на спільний набір (Ctrl+V).'), `<button class="btn" data-act="openBundle">${t('Відкрити…')}</button>`)}
    ${frow('link', t('Поділитися'), t('Посиланням (секретний Gist) або текстом — інший відкриє його в Komora.'), `<button class="btn" data-act="shareAll">${t('Поділитися…')}</button>`)}
  </div></section>`;
  // sync
  const stTxt = st.err ? `<span style="color:var(--err)">● ${esc(msg(st.err))}</span>` : st.okAt ? `<span style="color:var(--ok)">● ${esc(shortAgo(st.okAt))}</span>` : mode === 'off' ? '' : `<span class="m">${t('ще не синхронізовано')}</span>`;
  const radio = (k, name, note, noteMono) => `<div class="radio ${mode === k ? 'on' : ''}" data-act="syncMode" data-mode="${k}"><span class="o"></span><span><span>${name}</span><br><span class="${noteMono ? 'mono ' : ''}m">${note}</span></span></div>`;
  h += `<section class="card"><h2 class="big">${t('Синхронізація')}${hint('Бібліотека сама оновлюється на всіх твоїх ПК: через приватний GitHub Gist або Dropbox. Перемагають новіші зміни; програми не встановлюються самі — інший ПК лише пропонує їх.')}<span class="mono" style="font-size:12px">${stTxt}</span></h2><div style="margin-top:8px">`;
  if (mode === 'dir') h += radio('dir', t('Тека'), esc(c.syncDir + '\\komora-sync.json'), true);
  const gistTok = () => { const r = S.rate; return keyRow('token', t('Токен GitHub'), c.hasToken, 'github_pat_…', r ? `<span class="mono" style="font-size:12px;color:${r.remaining > 10 ? 'var(--ok)' : 'var(--warn)'}">● ${r.remaining} / ${r.limit}</span>` : '', esc(t('Той самий токен, що й у Налаштуваннях: для Gist йому потрібен дозвіл Gists (Read and write).')), `<a class="alink" style="font-size:12px" data-act="openUrl" data-url="${TOKEN_URL}">${t('Створити токен на GitHub')} →</a>`); };
  h += radio('gist', t('Приватний GitHub Gist'), esc(c.hasToken ? t('потрібен токен з дозволом Gists') : t('спершу додай токен у Налаштуваннях')));
  if (mode === 'gist' || (S.sync?.err && c.syncGist)) h += `<div class="dbx">${gistTok()}</div>`;
  h += radio('dropbox', 'Dropbox', esc(c.hasDbx ? t('увійдено · тека Apps/Komora') : c.dbxAvail ? t('увійти через сайт Dropbox') : t('ще не налаштовано в цій збірці')));
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
  h += `<section class="card s2 howtos one">${howto('Як налаштувати Gist', ['Відкрий сторінку нового токена на GitHub (посилання нижче) і ввійди у свій обліковий запис.', 'Token name — будь-яка назва, наприклад Komora. Expiration — скільки житиме токен: коли мине, синхронізація зупиниться й знадобиться новий.', 'Repository access — «Public repositories»: доступ до твоїх репозиторіїв Komora не потрібен.', 'Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен (github_pat_…) і встав його тут, у поле «Токен GitHub» під «Приватний GitHub Gist».', 'Тут обери «Приватний GitHub Gist». Komora сама створить секретний Gist із файлом komora-sync.json або знайде наявний.', 'На іншому ПК зроби те саме з тим самим обліковим записом GitHub — Komora знайде той самий Gist.'],
    `<div class="m">${t('Секретний Gist не видно в списках і пошуку, але відкрити його може кожен, хто має посилання. Токени й ключі в синхронізацію не потрапляють.')}</div><div class="row wrap" style="margin-top:8px;gap:16px"><a class="alink" data-act="openUrl" data-url="${TOKEN_URL}">${t('Створити токен на GitHub')} →</a></div>`)}</section>`;
  // an opened bundle: what to set up
  if (bundlePrev) {
    const want = bundlePrev.apps.filter(a => a.kind === 'github' && a.was && !a.here);
    h += `<section class="card s2"><h2 class="big">${t('Набір з ПК')} ${esc(bundlePrev.pc || '?')}<span class="mono">${esc(ago(bundlePrev.at))}</span></h2><div class="grid2" style="margin-top:10px">
      <div><div style="font-weight:600">${t('Встановити')} (${want.length})</div><div style="max-height:300px;overflow:auto;margin-top:4px">${want.map(a => `<label class="check"><input type="checkbox" data-bi="${esc(a.id)}" checked>${esc(a.name)}</label>`).join('') || `<div class="m">${t('Усе вже встановлено')}</div>`}</div></div>
      <div><div style="font-weight:600">${t('Твіки')} (${bundlePrev.tweaks.length})</div><div style="max-height:300px;overflow:auto;margin-top:4px">${bundlePrev.tweaks.map(id => `<label class="check"><input type="checkbox" data-bt="${esc(id)}" checked>${esc(tweakName(id))}</label>`).join('') || `<div class="m">—</div>`}</div></div></div>
      <div class="row" style="margin-top:12px"><button class="btn acc" data-act="acceptBundle">${t('Поставити вибране')}</button><button class="btn" data-act="dropBundle">${t('Скасувати')}</button><span class="m">${t('По одній програмі; налаштування повертаються з копій одразу після встановлення')}</span></div></section>`;
  }
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
  // installed on another PC
  if (offered.length) {
    h += `<section class="card s2"><div class="row wrap"><div class="grow" style="min-width:280px"><div style="font-weight:600">${t('Було встановлено на іншому ПК')} · ${offered.length}</div><div class="m" style="font-size:12.5px">${t('Прийшло із синхронізацією чи набору')}: ${esc(offered.slice(0, 6).map(a => a.name).join(', '))}${offered.length > 6 ? '…' : ''}</div></div><button class="btn" data-act="offeredToggle">${t(offeredOpen ? 'Сховати' : 'Показати')}</button><button class="btn acc" data-act="installOffered">${t(offered.length === 1 ? 'Встановити' : 'Встановити всі')}</button></div>`;
    if (offeredOpen) h += `<div style="margin-top:10px;max-height:280px;overflow:auto">${offered.map(a => `<label class="check"><input type="checkbox" data-oi="${esc(a.id)}" checked>${esc(a.name)} <span class="m">${esc(busyOf(a.id) ? stageText(busyOf(a.id)) : '')}</span></label>`).join('')}</div>`;
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
  let h = `<div class="page set"><div class="phead"><h1>${t('Налаштування')}</h1></div><div class="setcol">`;
  h += `<div class="sect">${t('Вигляд')}</div>`;
  h += row(t('Тема'), t('Темна — теплий сірий, світла — папір'), sel('theme', c.theme, [['system', 'Як у Windows'], ['light', 'Світла'], ['dark', 'Темна']]));
  const sws = Object.keys(ACCENTS).map(k => `<button class="${c.accent === k ? 'on' : ''}" style="background:${esc(accentOf(k))}" title="${esc(t({ violet: 'фіолетовий', blue: 'синій', teal: 'бірюзовий', sage: 'шавлія', ochre: 'охра', windows: 'як у Windows' }[k]))}" data-act="cfgVal" data-key="accent" data-val="${k}"></button>`).join('');
  h += row(t('Колір акценту'), t('Кнопки, позначка розділу, рядок пошуку'), `<div class="swatches">${sws}</div>`);
  const own = /^#/.test(c.bg || '');
  const bgs = Object.keys(BGS).map(k => `<button class="${(c.bg || '') === k ? 'on' : ''}" style="background:${esc(bgHex(k))}" title="${esc(t({ '': 'теплий сірий', obsidian: 'обсидіан', graphite: 'графіт', slate: 'сланець', moss: 'мох', plum: 'слива' }[k]))}" data-act="cfgVal" data-key="bg" data-val="${k}"></button>`).join('')
    + `<label class="own ${own ? 'on' : ''}" title="${esc(t('Свій колір'))}" style="background:${own ? esc(bgHex(c.bg)) : 'conic-gradient(#c66,#cc6,#6c6,#6cc,#66c,#c6c,#c66)'}"><input type="color" id="bgPick" data-cfg="bg" value="${esc(own ? c.bg : bgHex(c.bg || ''))}"></label>`;
  h += row(t('Колір фону'), t('Вікно й заголовок; світлота підлаштовується під тему'), `<div class="swatches">${bgs}</div>`);
  h += row(t('Мова'), '', sel('lang', c.lang, [['auto', 'Як у Windows'], ['uk', 'Українська'], ['en', 'English'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español'], ['pt', 'Português'], ['pl', 'Polski'], ['it', 'Italiano'], ['tr', 'Türkçe']]));
  h += `<div class="sect">${t('Загальне')}</div>`;
  h += row(t('Тестові версії (pre-release)'), t('Для всіх програм; окремо можна ввімкнути на сторінці програми'), sw('preAll', c.preAll));
  h += row(t('Сповіщення Windows'), t('Нові версії, нове від авторів, скинуті твіки'), sw('notify', c.notify));
  h += row(t('Копії налаштувань програм самі'), t('Теки налаштувань знаходяться самі; копія — перед кожним оновленням і раз на день, якщо файли змінилися'), sw('autoBackup', c.autoBackup));
  h += row(t('Запускати разом із Windows'), t('Згорнутою в трей'), sw('autostart', c.autostart));
  h += `<div class="sect">${t('Встановлення')}</div>`;
  h += pathRow(t('Тека переносних програм'), t('Сюди розпаковуються zip і окремі .exe'), c.appsDir, 'appsDir', '', false);
  h += pathRow(t('Тека для встановлювачів'), t('Inno Setup і NSIS отримують цю теку, MSI — якщо підтримує; порожньо — як пропонує встановлювач'), c.setupDir, 'setupDir', t('як пропонує встановлювач'), true);
  h += row(t('Показувати вікно встановлювача'), t('Вимкнено — тихе встановлення'), sw('setupShow', c.setupShow));
  h += `<div class="sect">${t('Ключі')}</div>`;
  const rate = S.rate ? `<span class="mono" style="font-size:12px;color:${S.rate.remaining > 10 ? 'var(--ok)' : 'var(--warn)'}">● ${S.rate.remaining} / ${S.rate.limit} ${t('запитів')}</span>` : '';
  h += keyRow('token', t('Токен GitHub'), c.hasToken, 'github_pat_…', rate, esc(t('Без токена GitHub дає 60 запитів на годину, з токеном — 5000. Досить токена без дозволів; для синхронізації через Gist — дозвіл Gists.')), `<a class="alink" style="font-size:12px" data-act="openUrl" data-url="${TOKEN_URL}">${t('Створити токен на GitHub')} →</a>${howto('Як отримати токен', ['Створи токен на GitHub (посилання нижче): назва — будь-яка, Repository access — «Public repositories».', 'Для ліміту запитів дозволи не потрібні. Для синхронізації через Gist — Permissions → Account → Gists → Read and write.', 'Generate token, скопіюй токен і встав сюди → Зберегти.'])}`);
  h += keyRow('vtKey', t('Ключ VirusTotal'), c.hasVt, t('безкоштовний ключ API'), `<span class="mono m">${c.hasVt ? t('задано') : t('не задано')}</span>`, esc(t('Із ключем кожне встановлення перевіряється само, а невідомі файли вивантажуються. Без нього — кнопка «Завантажити на перевірку».')), `<a class="alink" style="font-size:12px" data-act="openUrl" data-url="https://www.virustotal.com/gui/my-apikey">${t('Отримати ключ на VirusTotal')} →</a>${howto('Як отримати ключ', ['Зареєструйся на virustotal.com — це безкоштовно.', 'Відкрий свій профіль → API key (посилання нижче) і скопіюй ключ.', 'Встав сюди → Зберегти. Безкоштовний ключ дає 4 запити на хвилину й 500 на день — Komora чекає сама.'])}`);
  h += `<div class="m" style="padding:2px 4px">${t('Ключі зашифровано для твого облікового запису Windows і не потрапляють у синхронізацію.')}</div>`;
  h += `<div class="sect">${t('Про програму')}</div>`;
  h += `<div class="srow"><span class="mark" style="width:32px;height:32px;border-radius:8px">${MARK}</span><div class="tx"><div><b>Komora</b> <span class="mono m">${esc(S.ver)} · ${esc(S.arch)}</span></div><div class="d">${t('Автор')}: Fenderenko · <span class="mono">${esc(S.dataDir || '')}</span></div></div><button class="btn" data-act="openPath" data-path="${esc(S.dataDir || '')}">${t('Відкрити теку')}</button></div>`;
  h += '</div></div>';
  return h;
}

// ---------------------------------------------------------------- README / notes from GitHub

const BADGE = /shields\.io|badgen\.net|badge|star-history|visitor|hits\.|komarev|readme-stats|codecov|travis-ci|appveyor|actions\/workflows|ko-fi\.com\/img|buymeacoffee\.com\/button|liberapay\.com\/assets|forthebadge|repobeats/i;
function clean(html, a) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,form,input,button,textarea,select,link,meta,base,source,frame,frameset,applet').forEach(n => n.remove());
  const raw = `https://raw.githubusercontent.com/${a.owner}/${a.repo}/HEAD/`;
  const blob = `https://github.com/${a.owner}/${a.repo}/blob/HEAD/`;
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
  if (hist.length && !q) h += `<div class="recent"><span class="mono m">${t('нещодавні')}</span>${hist.map(x => `<span class="chip" data-hq="${esc(x)}">${esc(x)}</span>`).join('')}</div>`;
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
      res += `<div class="it" data-i="${items.length - 1}">${iconHtml(a)}<div class="tx"><div><b>${esc(a.name)}</b>${a.kit ? `<i class="i kitmark">${I.kit}</i>` : ''} <span class="mono m">${a.kind === 'github' ? esc(isUpd(a) ? `${a.inst.version || verOf(a.inst.tag)} → ${verOf(a.latest.tag)}` : a.inst ? a.inst.version || verOf(a.inst.tag) : '') : esc(hostOf(a.url))}</span></div><div class="m">${esc([a.groups.map(gname).filter(Boolean).join(', '), a.tags.map(x => '#' + x).join(' '), isUpd(a) ? t('є оновлення') : ''].filter(Boolean).join(' · ') || (a.kind === 'link' ? t('посилання') : a.inst ? t('встановлено') : t('не встановлено')))}</div></div>${items.length === 1 ? '<span class="mono m">Enter</span>' : ''}</div>`;
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
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : it.head ? `<div class="mh">${esc(it.head)}</div>` : `<button data-i="${i}" class="${it.danger ? 'danger' : ''}">${it.dot ? `<span style="width:9px;height:9px;border-radius:3px;background:${esc(it.dot)}"></span>` : it.icon ? ic(it.icon) : ''}<span>${esc(it.label)}</span>${it.check ? `<i class="i ck">${I.check}</i>` : ''}</button>`).join('');
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(8, Math.min(x, innerWidth - r.width - 8)) + 'px';
  m.style.top = Math.max(8, Math.min(y, innerHeight - r.height - 8)) + 'px';
  m.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    const it = items[+b.dataset.i];
    if (!it.keep) closeOverlay();
    it.fn?.();
  });
  overlay = m;
}
function menuAt(el, items, right = false) {
  const r = el.getBoundingClientRect();
  showMenu(right ? r.right - 240 : r.left, r.bottom + 4, items);
}

function dialog({ title, text = '', ok, danger = false, input = null, colors = null, body = '' }) {
  return new Promise(res => {
    closeOverlay();
    const v = document.createElement('div');
    v.className = 'veil';
    let color = colors?.value;
    v.innerHTML = `<div class="dlg"><div class="body"><div class="ttl">${esc(title)}</div>${text ? `<div class="txt">${esc(text)}</div>` : ''}${input ? `<input class="inp" id="dlgIn" style="margin-top:12px" value="${esc(input.value || '')}" placeholder="${esc(input.placeholder || '')}" maxlength="${input.max || 60}">` : ''}${body}${colors ? `<div class="colors">${GROUP_COLORS.map(c => `<button data-c="${c}" class="${c === color ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>` : ''}</div><div class="btns"><button class="btn" data-r="0">${t('Скасувати')}</button><button class="btn ${danger ? 'danger' : 'acc'}" data-r="1">${esc(ok)}</button></div></div>`;
    document.body.append(v);
    overlay = v;
    const inp = $('#dlgIn', v);
    (inp || v.querySelector('input,textarea,select') || $('[data-r="1"]', v)).focus();
    inp?.select();
    const vals = () => Object.fromEntries([...v.querySelectorAll('[data-k]')].map(i => [i.dataset.k, i.value]));
    const done = r => { const out = r ? { value: inp?.value.trim() ?? '', color, ...vals() } : null; closeOverlay(); res(out); };
    v.addEventListener('click', e => {
      if (e.target === v) return done(false);
      const c = e.target.closest('[data-c]');
      if (c) { color = c.dataset.c; v.querySelectorAll('[data-c]').forEach(b => b.classList.toggle('on', b === c)); return; }
      const b = e.target.closest('[data-r]');
      if (b) done(b.dataset.r === '1' && (!inp || inp.value.trim()));
    });
    v.addEventListener('keydown', e => {
      if (e.key === 'Escape') done(false);
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && (!inp || inp.value.trim())) done(true);
    });
  });
}
async function newGroup(appId) {
  const used = new Set(groups().map(g => g.color));
  const r = await dialog({ title: t('Нова група'), ok: t('Зберегти'), input: { placeholder: t('Назва групи') }, colors: { value: GROUP_COLORS.find(c => !used.has(c)) || GROUP_COLORS[0] } });
  if (r?.value) post({ t: 'group', op: 'add', name: r.value, color: r.color, app: appId || '' });
}

/** The add field: a link of GitHub or any site (`group` — what is added goes into it). */
function openAdd(text = '', group = view.startsWith('g:') ? view.slice(2) : '') {
  closeOverlay();
  closeFly();
  const v = document.createElement('div');
  v.className = 'veil';
  const gname = groups().find(g => g.id === group)?.name;
  v.innerHTML = `<div class="pal"><div class="pin">${ic('add')}<input placeholder="${esc(gname ? `${t('Встав посилання — додасться в групу')} «${gname}»` : t('Встав посилання на GitHub або сайт'))}" spellcheck="false"><span class="kbd mono">Esc</span></div><div class="res"></div><div class="imps"><span class="m">${t('Або імпортуй багато:')}</span><button class="btn sm" data-imp="stars">${ic('star')} ${t('Зірки GitHub')}</button><button class="btn sm" data-imp="obtainium">Obtainium</button><button class="btn sm" data-imp="bookmarks">${ic('globe')} ${t('Закладки')}</button><button class="btn sm" data-imp="list">${ic('list')} ${t('Список')}</button><button class="btn sm" data-imp="bundle">${ic('importI')} ${t('Набір')}</button></div><div class="foot"><span>Enter ${t('додати')}</span><span>Esc ${t('закрити')}</span><span class="grow"></span><span>${t('Посилання також можна вставити Ctrl+V у вікні чи перетягнути з браузера')}</span></div></div>`;
  document.body.append(v);
  overlay = v;
  const inp = $('input', v);
  inp.value = text;
  const draw = () => {
    const q = inp.value.trim();
    const had = q && apps().find(a => a.url.toLowerCase().replace(/\/$/, '') === q.toLowerCase().replace(/\/$/, '') || (a.kind === 'github' && /github\.com\//i.test(q) && q.toLowerCase().includes(`github.com/${a.owner}/${a.repo}`.toLowerCase())));
    $('.res', v).innerHTML = had ? `<div class="it on" data-had="${esc(had.id)}">${iconHtml(had, 'sm')}<span class="grow">${t('Уже в бібліотеці')}: <b>${esc(had.name)}</b></span><span class="alink">${t('Відкрити')} →</span></div>`
      : q && looksLikeLink(q) ? `<div class="it on">${ic('add')}<span class="grow">${t('Додати')} ${esc(q)}${gname ? ' → ' + esc(gname) : ''}</span><span class="mono m">Enter</span></div>`
      : `<div class="it">${ic('link')}<span class="grow m">${t('GitHub, сайт, відео YouTube, товар у магазині — будь-яке посилання')}</span></div>`;
  };
  const go2 = () => {
    const q = inp.value.trim();
    const had = $('[data-had]', v);
    closeOverlay();
    if (had) openApp(had.dataset.had);
    else if (q && looksLikeLink(q)) post({ t: 'add', url: q, group });
  };
  inp.addEventListener('input', draw);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go2(); } else if (e.key === 'Escape') closeOverlay(); });
  v.addEventListener('click', e => {
    const imp = e.target.closest('[data-imp]')?.dataset.imp;
    if (imp) { closeOverlay(); ({ stars: importStars, obtainium: importObtainium, bookmarks: importBookmarks, list: () => importText(), bundle: () => { go('newpc'); post({ t: 'openBundle' }); } })[imp](); return; }
    if (e.target === v) closeOverlay(); else if (e.target.closest('.it.on')) go2();
  });
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

function updateAll() { for (const id of S.updates) post({ t: 'install', id }); }
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
    return { label: g.name, dot: g.color || '#8d9099', check: all, fn: () => { for (const a of list) edit(a.id, { groups: all ? a.groups.filter(x => x !== g.id) : [...new Set([...a.groups, g.id])] }); } };
  });
  if (items.length) items.push('-');
  items.push({ icon: 'add', label: t('Нова група…'), fn: () => newGroup(list.length === 1 ? list[0].id : '') });
  menuAt(el, items);
}
function groupContext(x, y, g) {
  // only apps go to the kit: links have nothing to install
  const inG = apps().filter(a => a.kind === 'github' && a.groups.includes(g.id));
  const allKit = inG.length && inG.every(a => a.kit);
  showMenu(x, y, [
    ...(inG.length ? [{ icon: 'kit', label: t(allKit ? 'Прибрати групу з набору' : 'Усю групу в мій набір'), fn: () => { for (const a of inG) if (a.kit === allKit) edit(a.id, { kit: !allKit }); } }, '-'] : []),
    { icon: 'edit', label: t('Перейменувати'), fn: async () => { const r = await dialog({ title: t('Перейменувати'), ok: t('Зберегти'), input: { value: g.name, placeholder: t('Нова назва') } }); if (r?.value) post({ t: 'group', op: 'rename', id: g.id, name: r.value }); } },
    { icon: 'palette', label: t('Колір'), fn: async () => { const r = await dialog({ title: g.name, ok: t('Зберегти'), colors: { value: g.color } }); if (r) post({ t: 'group', op: 'color', id: g.id, color: r.color }); } },
    '-',
    { icon: 'link', label: t('Поділитися групою…'), keep: true, fn: () => shareMenu({ getBoundingClientRect: () => ({ left: x, bottom: y, right: x }) }, apps().filter(a => a.groups.includes(g.id)).map(a => a.id)) },
    { icon: 'del', label: t('Видалити'), danger: true, fn: async () => { const r = await dialog({ title: t('Видалити групу?'), text: `${g.name}. ${t('Програми лишаться в бібліотеці.')}`, ok: t('Видалити'), danger: true }); if (r) { post({ t: 'group', op: 'delete', id: g.id }); if (view === 'g:' + g.id) go('all'); } } },
  ]);
}
function appMenuItems(a) {
  const items = [];
  if (a.inst) items.push({ icon: 'folder', label: t('Відкрити теку'), fn: () => post({ t: 'folder', id: a.id }) });
  items.push({ icon: 'globe', label: a.kind === 'link' ? t('Відкрити') : t('Відкрити на GitHub'), fn: () => post({ t: 'open', url: a.url }) });
  if (a.homepage) items.push({ icon: 'link', label: t('Сайт'), fn: () => post({ t: 'open', url: a.homepage }) });
  if (a.kind === 'github') {
    items.push({ icon: 'refresh', label: t('Оновити дані'), fn: () => post({ t: 'refresh', id: a.id }) });
    const fol = authors().some(x => x.login.toLowerCase() === a.owner.toLowerCase());
    items.push({ icon: 'user', label: fol ? `${t('Автор')}: ${a.owner}` : `${t('Стежити за автором')} ${a.owner}`, fn: () => fol ? openAuthor(a.owner) : post({ t: 'follow', login: a.owner }) });
    if (a.inst) items.push({ icon: a.pin ? 'unpin' : 'pin', label: t(a.pin ? 'Відкріпити версію' : 'Закріпити версію'), fn: () => edit(a.id, { pin: a.pin ? '' : (a.inst.tag || a.inst.version) }) });
  } else {
    items.push({ icon: 'copy', label: t('Копіювати посилання'), fn: () => navigator.clipboard?.writeText(a.url).then(() => toast(t('Посилання скопійовано'))) });
    items.push({ icon: 'refresh', label: t('Оновити дані'), fn: () => post({ t: 'refresh', id: a.id }) });
  }
  items.push({ icon: 'kit', label: t(a.kit ? 'Прибрати з набору' : 'У мій набір'), fn: () => edit(a.id, { kit: !a.kit }) });
  items.push('-');
  if (a.inst && a.kind === 'github') items.push({ icon: 'del', label: t('Видалити з ПК'), fn: () => confirmUninstall(a) });
  items.push({ icon: 'x', label: t('Прибрати з бібліотеки'), danger: true, fn: () => confirmRemove([a.id]) });
  return items;
}
function appContext(x, y, a) {
  const p = primary(a);
  const items = [{ icon: 'open', label: t('Відкрити сторінку'), fn: () => openApp(a.id) }];
  if (!p.busy && p.fn) items.push({ icon: p.icon, label: p.label, fn: p.fn });
  items.push({ icon: 'group', label: t('У групу'), keep: true, fn: () => groupMenu({ getBoundingClientRect: () => ({ left: x, bottom: y, right: x }) }, [a.id]) }, '-', ...appMenuItems(a));
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
  // the picked background is shown while the picker is open; it is saved on change
  if (el.id === 'bgPick') { S.cfg.bg = el.value; applyBg(); }
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
  if (arow) return openAuthor(arow.dataset.login);
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
  if (link) { e.preventDefault(); post({ t: 'open', url: link.href }); return; }
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
    case 'repoMore': {
      const full = page.full, it = page.item || {};
      const owner = full.split('/')[0];
      const fol = authors().some(x => x.login.toLowerCase() === owner.toLowerCase());
      menuAt(b, [
        { icon: 'globe', label: t('Відкрити на GitHub'), fn: () => post({ t: 'open', url: `https://github.com/${full}` }) },
        it.homepage && { icon: 'link', label: t('Сайт'), fn: () => post({ t: 'open', url: it.homepage }) },
        { icon: 'fork', label: t('Показати форки'), fn: () => { if (forksOf[full] === undefined) { forksOf[full] = null; post({ t: 'forks', full }); } renderMain(); } },
        { icon: 'user', label: fol ? `${t('Автор')}: ${owner}` : `${t('Стежити за автором')} ${owner}`, fn: () => fol ? openAuthor(owner) : post({ t: 'follow', login: owner }) },
      ].filter(Boolean), true);
      break;
    }
    case 'newGroup': newGroup(); break;
    case 'groupCtx': { const g = groups().find(x => x.id === view.slice(2)); const r = b.getBoundingClientRect(); if (g) groupContext(r.right - 220, r.bottom + 4, g); break; }
    case 'sort': menuAt(b, [['group', 'За групами'], ['name', 'За назвою'], ['added', 'Нещодавно додані']].map(([k, l]) => ({ label: t(l), check: sortBy === k, fn: () => { sortBy = k; store.set('sort', k); renderMain(); } })), true); break;
    case 'launch': case 'folder': case 'refresh': case 'rollback': case 'vtCheck': case 'vtUpload': post({ t: act, id: a.id }); break;
    case 'installId': post({ t: 'install', id: b.dataset.id }); break;
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
    case 'kitInstall': post({ t: 'installMany', ids: apps().filter(x => x.kit && x.kind === 'github' && !x.inst).map(x => x.id) }); break;
    // GitHub search and repositories
    case 'discGo': discNewQuery($('#dq').value); break;
    case 'discMore': discSearch(true); break;
    case 'histQ': $('#dq').value = b.dataset.q; discNewQuery(b.dataset.q); break;
    case 'preset': { const p = PRESETS.find(x => x[0] === b.dataset.p); if (p) { Object.assign(disc, p[1]); discSearch(); } break; }
    case 'discTopic': Object.assign(disc, { q: '', topic: b.dataset.topic, stars: '', updated: '', created: '', lang: '' }); go('discover'); discSearch(); break;
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
      const ids = boxes.length ? boxes.filter(x => x.checked).map(x => x.dataset.oi) : apps().filter(x => x.kind === 'github' && x.wasInstalled && !x.inst).map(x => x.id);
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
    case 'cfgSw': post({ t: 'cfg', key: b.dataset.key, val: !b.classList.contains('on') }); break;
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
  const g = e.target.closest('[data-group]');
  if (g) { const grp = groups().find(x => x.id === g.dataset.group); if (grp) groupContext(e.clientX, e.clientY, grp); return; }
  const row = e.target.closest('.r[data-id]');
  if (row) { const a = appById(row.dataset.id); if (a) appContext(e.clientX, e.clientY, a); }
});

// ---- drag: apps onto a group of the sidebar; links from a browser into the window (added)
let dragIds = [];
let dropShown = null;
document.addEventListener('dragstart', e => {
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
  if (g && dragIds.length) { e.preventDefault(); g.classList.add('drop'); }
});
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
  if (g.dataset.kitdrop) { for (const id of dragIds) { const a = appById(id); if (a && !a.kit && a.kind === 'github') edit(id, { kit: true }); } dragIds = []; toast(t('Додано в мій набір')); return; }
  for (const id of dragIds) { const a = appById(id); if (a && !a.groups.includes(g.dataset.group)) edit(id, { groups: [...a.groups, g.dataset.group] }); }
  dragIds = [];
});
document.addEventListener('dragend', () => { dragIds = []; showDrop(false); document.querySelectorAll('.n.drop').forEach(n => n.classList.remove('drop')); });

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
$('#home').addEventListener('click', () => go('home'));
$('#addBtn').addEventListener('click', () => openAdd());
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
    case 'readme': { const a = appById(m.id); readmes[m.id] = m.err ? { err: m.err } : { html: a && m.html ? clean(m.html, a) : '' }; renderMain(); break; }
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
    case 'bundle': bundlePrev = m.preview; if (view !== 'newpc' || page) go('newpc'); else renderMain(); break;
    case 'bundleDone':
      toast(`${t('Готово з набору: програм')} ${m.apps}, ${t('твіків')} ${m.tweaks}${m.failed ? ` · ${t('не вдалося')}: ${m.failed}` : ''}`, !!m.failed);
      if (bundleRun) bundleRun.done = true;
      break;
    case 'synced': toast(m.err ? msg(m.err) : m.changed ? t('Синхронізовано: є зміни з іншого ПК') : t('Синхронізовано'), !!m.err); break;
    case 'clouds': clouds = m.list || []; renderMain(); break;
    case 'bookmarks': if (bmWait) { bmWait = null; bookmarksDialog(m.tree || []); } break;
    case 'imported': toast(`${t('Додано:')} ${m.added}${m.had ? ` · ${t('уже були')}: ${m.had}` : ''}`); break;
    case 'installed':
      toast(`${t('Готово')}: ${appById(m.id)?.name ?? ''}`);
      if (m.pinned) toast(`${t('Закріплено на версії')} ${verOf(m.pinned)}`);
      delete rels[m.id];
      break;
    case 'added': toast(`${t('Додано:')} ${m.name}`); break;
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
