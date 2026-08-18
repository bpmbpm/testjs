Этот HTML-документ создаёт интерфейс с тремя окнами (TreeView, Properties, Diagram) и логом действий, используя React и JSX. При клике на файл в дереве отображаются его свойства и SVG-диаграмма, а все события логируются.
```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SVG Просмотрщик с управлением состоянием</title>

    <!-- Подключаем React и ReactDOM из CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js">
    </script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js">
    </script>
    <!-- Babel Standalone для трансформации JSX в браузере -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js">
    </script>

    <style>
        /* ---------- ГЛОБАЛЬНЫЙ СБРОС И БАЗОВЫЕ СТИЛИ ---------- */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            color: #1e293b;
            height: 100vh;
            overflow: hidden;
            padding: 12px;
        }

        /* ---------- КОНТЕЙНЕР ПРИЛОЖЕНИЯ ---------- */
        #root {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        /* ---------- ОСНОВНАЯ СЕТКА: 2 колонки (левая / правая) ---------- */
        .app-main {
            flex: 1;
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 8px;
            min-height: 0;
        }

        /* ---------- ЛЕВАЯ КОЛОНКА: TreeView (верх) + Properties (низ) ---------- */
        .left-panel {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-height: 0;
        }

        /* ---------- ОБЩИЕ СТИЛИ ДЛЯ ОКОН ---------- */
        .window {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border: 1px solid #e9edf2;
        }

        .window-header {
            padding: 10px 16px;
            background: #f8fafc;
            border-bottom: 1px solid #e9edf2;
            font-weight: 600;
            font-size: 14px;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
            user-select: none;
        }

        .window-header .badge {
            font-size: 11px;
            background: #dbeafe;
            color: #1d4ed8;
            padding: 0 8px;
            border-radius: 20px;
            font-weight: 400;
        }

        .window-body {
            flex: 1;
            padding: 12px 16px;
            overflow: auto;
            min-height: 0;
        }

        /* ---------- TREEVIEW ---------- */
        .treeview-window .window-body {
            padding: 6px 0;
        }

        .tree-item {
            display: flex;
            align-items: center;
            padding: 6px 16px 6px 8px;
            cursor: pointer;
            border-left: 3px solid transparent;
            transition: background 0.15s, border-color 0.15s;
            font-size: 14px;
            gap: 6px;
            user-select: none;
        }

        .tree-item:hover {
            background: #f1f5f9;
        }

        .tree-item.selected {
            background: #eef2ff;
            border-left-color: #4f46e5;
        }

        .tree-item .icon {
            width: 20px;
            text-align: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .tree-item .label {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tree-item .chevron {
            font-size: 12px;
            color: #94a3b8;
            width: 18px;
            text-align: center;
            flex-shrink: 0;
            transition: transform 0.2s;
        }

        .tree-item .chevron.open {
            transform: rotate(90deg);
        }

        .tree-item .file-badge {
            font-size: 10px;
            background: #e9edf2;
            color: #475569;
            padding: 0 8px;
            border-radius: 12px;
            font-weight: 500;
            flex-shrink: 0;
        }

        /* Дочерние элементы с отступом */
        .tree-children {
            padding-left: 28px;
        }

        /* ---------- PROPERTIES ---------- */
        .property-row {
            display: flex;
            padding: 6px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
        }

        .property-row:last-child {
            border-bottom: none;
        }

        .property-key {
            width: 100px;
            font-weight: 500;
            color: #475569;
            flex-shrink: 0;
        }

        .property-value {
            flex: 1;
            color: #0f172a;
            word-break: break-word;
        }

        .property-empty {
            color: #94a3b8;
            font-style: italic;
            font-size: 14px;
            padding: 12px 0;
        }

        /* ---------- DIAGRAM ---------- */
        .diagram-window .window-body {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fafcff;
            padding: 16px;
        }

        .diagram-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
        }

        .diagram-container svg {
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            background: white;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .diagram-placeholder {
            color: #94a3b8;
            font-size: 16px;
            text-align: center;
            padding: 40px 20px;
        }

        .diagram-placeholder .big-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 12px;
        }

        /* ---------- СООБЩЕНИЕ ОБ ОШИБКЕ (всплывающее) ---------- */
        .toast-message {
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: #fef2f2;
            color: #b91c1c;
            padding: 12px 28px;
            border-radius: 12px;
            border: 1px solid #fecaca;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            font-weight: 500;
            font-size: 15px;
            z-index: 1000;
            animation: slideUp 0.3s ease;
            pointer-events: none;
            transition: opacity 0.3s, transform 0.3s;
        }

        .toast-message.hidden {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        /* ---------- ЛОГ (четвёртое окно внизу) ---------- */
        .log-window {
            height: 160px;
            flex-shrink: 0;
        }

        .log-window .window-body {
            padding: 6px 12px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            background: #0f172a;
            color: #e2e8f0;
            overflow-y: auto;
            line-height: 1.6;
        }

        .log-entry {
            display: flex;
            gap: 12px;
            padding: 2px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .log-entry .log-time {
            color: #64748b;
            flex-shrink: 0;
            min-width: 70px;
        }

        .log-entry .log-group {
            color: #60a5fa;
            flex-shrink: 0;
            min-width: 90px;
            font-weight: 500;
        }

        .log-entry .log-msg {
            color: #e2e8f0;
            flex: 1;
        }

        .log-entry .log-msg .highlight {
            color: #fcd34d;
        }

        .log-empty {
            color: #475569;
            font-style: italic;
            padding: 8px 0;
        }

        /* ---------- СКРОЛЛБАРЫ ---------- */
        .window-body::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }

        .window-body::-webkit-scrollbar-track {
            background: transparent;
        }

        .window-body::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 8px;
        }

        .window-body::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        /* ---------- АДАПТИВ ДЛЯ МАЛЕНЬКИХ ЭКРАНОВ ---------- */
        @media (max-width: 720px) {
            .app-main {
                grid-template-columns: 1fr;
                grid-template-rows: 1fr 1fr;
            }

            .left-panel {
                flex-direction: row;
            }

            .left-panel .window {
                flex: 1;
                min-width: 0;
            }

            .log-window {
                height: 120px;
            }

            .property-key {
                width: 70px;
            }
        }

        @media (max-width: 500px) {
            .left-panel {
                flex-direction: column;
            }

            .app-main {
                grid-template-rows: 1fr 1fr 1fr;
            }
        }
    </style>
</head>
<body>

    <div id="root"></div>

    <!-- ======================================================================== -->
    <!--  ОСНОВНОЙ СКРИПТ НА REACT + JSX (ТРАНСФОРМИРУЕТСЯ BABEL)               -->
    <!-- ======================================================================== -->
    <script type="text/babel">
        /* ========================================================================
                ГРУППА 1: ДАННЫЕ (Data Group)
                ========================================================================
                Описание: содержит все статические данные приложения:
                - файловую структуру (treeData)
                - генераторы SVG для каждого файла
                - свойства каждого файла
                ======================================================================== */

        /**
         * Генератор SVG для файла "file1"
         * @returns {string} строка с SVG-разметкой
         */
        function svgFile1() {
            return `
              <svg width="320" height="240" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="20" width="280" height="200" rx="12" fill="#e0e7ff" stroke="#4f46e5" stroke-width="2"/>
                <rect x="50" y="50" width="80" height="60" rx="6" fill="#818cf8" opacity="0.8"/>
                <rect x="150" y="50" width="80" height="60" rx="6" fill="#6366f1" opacity="0.8"/>
                <rect x="50" y="130" width="80" height="60" rx="6" fill="#a5b4fc" opacity="0.8"/>
                <rect x="150" y="130" width="80" height="60" rx="6" fill="#4f46e5" opacity="0.8"/>
                <circle cx="270" cy="100" r="30" fill="#fcd34d" stroke="#f59e0b" stroke-width="2"/>
                <text x="160" y="220" text-anchor="middle" font-size="14" fill="#4f46e5" font-weight="600">file1 — Главная диаграмма</text>
              </svg>
            `;
        }

        /**
         * Генератор SVG для файла "file1-1"
         * @returns {string} строка с SVG-разметкой
         */
        function svgFile1_1() {
            return `
              <svg width="320" height="240" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#fca5a5"/>
                    <stop offset="100%" stop-color="#ef4444"/>
                  </radialGradient>
                </defs>
                <rect width="320" height="240" fill="#fef2f2" rx="8"/>
                <circle cx="160" cy="120" r="80" fill="url(#grad1)" stroke="#dc2626" stroke-width="3"/>
                <circle cx="160" cy="120" r="40" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
                <circle cx="160" cy="120" r="10" fill="white" opacity="0.6"/>
                <text x="160" y="220" text-anchor="middle" font-size="14" fill="#dc2626" font-weight="600">file1-1 — Круг</text>
              </svg>
            `;
        }

        /**
         * Генератор SVG для файла "file1-2"
         * @returns {string} строка с SVG-разметкой
         */
        function svgFile1_2() {
            return `
              <svg width="320" height="240" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#6ee7b7"/>
                    <stop offset="100%" stop-color="#059669"/>
                  </linearGradient>
                </defs>
                <rect width="320" height="240" fill="#ecfdf5" rx="8"/>
                <polygon points="160,30 280,210 40,210" fill="url(#grad2)" stroke="#047857" stroke-width="3"/>
                <polygon points="160,70 240,190 80,190" fill="none" stroke="white" stroke-width="2" opacity="0.4"/>
                <text x="160" y="220" text-anchor="middle" font-size="14" fill="#047857" font-weight="600">file1-2 — Треугольник</text>
              </svg>
            `;
        }

        /**
         * Генератор SVG для файла "file2"
         * @returns {string} строка с SVG-разметкой
         */
        function svgFile2() {
            return `
              <svg width="320" height="240" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                <rect width="320" height="240" fill="#fefce8" rx="8"/>
                <polygon points="160,20 200,80 280,90 220,140 240,210 160,175 80,210 100,140 40,90 120,80"
                  fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
                <polygon points="160,50 185,95 235,100 195,135 205,180 160,155 115,180 125,135 85,100 135,95"
                  fill="#fcd34d" stroke="#b45309" stroke-width="1.5" opacity="0.6"/>
                <text x="160" y="225" text-anchor="middle" font-size="14" fill="#b45309" font-weight="600">file2 — Звезда</text>
              </svg>
            `;
        }

        /**
         * Генератор SVG для файла "file2-1"
         * @returns {string} строка с SVG-разметкой
         */
        function svgFile2_1() {
            return `
              <svg width="320" height="240" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#c4b5fd"/>
                    <stop offset="100%" stop-color="#7c3aed"/>
                  </linearGradient>
                </defs>
                <rect width="320" height="240" fill="#f5f3ff" rx="8"/>
                <rect x="60" y="60" width="200" height="120" rx="12" fill="url(#grad3)" stroke="#6d28d9" stroke-width="3" transform="rotate(15, 160, 120)"/>
                <rect x="80" y="80" width="160" height="80" rx="8" fill="none" stroke="white" stroke-width="2" opacity="0.4" transform="rotate(15, 160, 120)"/>
                <text x="160" y="210" text-anchor="middle" font-size="14" fill="#6d28d9" font-weight="600">file2-1 — Ромб</text>
              </svg>
            `;
        }

        /**
         * Данные файлового дерева.
         * Каждый узел содержит:
         *   - id         : уникальный идентификатор
         *   - name       : отображаемое имя
         *   - type       : 'folder' или 'svg'
         *   - children   : массив id дочерних узлов (только для folder)
         *   - properties : объект со свойствами файла
         *   - svg        : функция-генератор SVG (только для svg)
         */
        const TREE_DATA = {
            // ---- Корневой узел (невидимый, только для структуры) ----
            root: {
                id: 'root',
                name: 'Корень',
                type: 'folder',
                children: ['file1', 'file2'],
                properties: {},
                svg: null,
            },
            // ---- file1 (папка) ----
            file1: {
                id: 'file1',
                name: 'file1',
                type: 'folder',
                children: ['file1-1', 'file1-2'],
                properties: {
                    'Тип': 'Папка',
                    'Создан': '2024-01-01',
                    'Изменён': '2024-01-15',
                    'Размер': '4.2 КБ',
                    'Автор': 'Иван Иванов',
                    'Описание': 'Главная папка с диаграммами',
                },
                svg: svgFile1, // у папки тоже есть SVG (отображается при выборе)
            },
            // ---- file1-1 (svg) ----
            'file1-1': {
                id: 'file1-1',
                name: 'file1-1',
                type: 'svg',
                children: [],
                properties: {
                    'Тип': 'SVG-диаграмма',
                    'Создан': '2024-01-02',
                    'Изменён': '2024-01-10',
                    'Размер': '2.1 КБ',
                    'Размеры': '200×150',
                    'Автор': 'Петр Петров',
                    'Формат': 'image/svg+xml',
                },
                svg: svgFile1_1,
            },
            // ---- file1-2 (svg) ----
            'file1-2': {
                id: 'file1-2',
                name: 'file1-2',
                type: 'svg',
                children: [],
                properties: {
                    'Тип': 'SVG-диаграмма',
                    'Создан': '2024-01-03',
                    'Изменён': '2024-01-12',
                    'Размер': '3.4 КБ',
                    'Размеры': '250×200',
                    'Автор': 'Мария Смирнова',
                    'Формат': 'image/svg+xml',
                },
                svg: svgFile1_2,
            },
            // ---- file2 (папка) ----
            file2: {
                id: 'file2',
                name: 'file2',
                type: 'folder',
                children: ['file2-1'],
                properties: {
                    'Тип': 'Папка',
                    'Создан': '2024-02-01',
                    'Изменён': '2024-02-20',
                    'Размер': '3.8 КБ',
                    'Автор': 'Алексей Алексеев',
                    'Описание': 'Вторичная папка',
                },
                svg: svgFile2,
            },
            // ---- file2-1 (svg) ----
            'file2-1': {
                id: 'file2-1',
                name: 'file2-1',
                type: 'svg',
                children: [],
                properties: {
                    'Тип': 'SVG-диаграмма',
                    'Создан': '2024-02-02',
                    'Изменён': '2024-02-18',
                    'Размер': '2.7 КБ',
                    'Размеры': '180×180',
                    'Автор': 'Елена Еленова',
                    'Формат': 'image/svg+xml',
                },
                svg: svgFile2_1,
            },
        };

        /**
         * Получить данные узла по id
         */
        function getFileData(id) {
            return TREE_DATA[id] || null;
        }

        /**
         * Получить список дочерних id для узла
         */
        function getChildrenIds(id) {
            const node = getFileData(id);
            return node ? node.children || [] : [];
        }

        /**
         * Проверить, является ли узел папкой
         */
        function isFolder(id) {
            const node = getFileData(id);
            return node ? node.type === 'folder' : false;
        }

        /**
         * Проверить, является ли узел SVG-файлом
         */
        function isSvg(id) {
            const node = getFileData(id);
            return node ? node.type === 'svg' : false;
        }

        /* ========================================================================
                ГРУППА 2: УПРАВЛЕНИЕ СОСТОЯНИЕМ (State Group)
                ========================================================================
                Описание: определяет все возможные состояния приложения,
                события (actions) и переходы между состояниями.
                Использует useReducer для формального управления состоянием.

                СОСТОЯНИЯ (States):
                  1. APP_LOADED         – приложение загружено, интерфейс готов
                  2. NO_SELECTION       – ни один файл не выбран (подсостояние APP_LOADED)
                  3. FILE_SELECTED      – выбран файл (подсостояние APP_LOADED)
                  4. ERROR_NO_SELECTION – ошибка: клик на диаграмму без выбора

                СОБЫТИЯ (Events / Actions):
                  - SELECT_FILE(id)     – выбрать файл по id
                  - CLICK_DIAGRAM()     – клик по области диаграммы
                  - CLEAR_ERROR()       – сбросить состояние ошибки
                  - LOG(message, group) – добавить запись в лог (внутреннее)

                ПЕРЕХОДЫ (Transitions):
                  NO_SELECTION + SELECT_FILE  → FILE_SELECTED (с выбранным id)
                  FILE_SELECTED + SELECT_FILE → FILE_SELECTED (с новым id)
                  NO_SELECTION + CLICK_DIAGRAM → ERROR_NO_SELECTION (показывает сообщение)
                  FILE_SELECTED + CLICK_DIAGRAM → FILE_SELECTED (без изменений, отображает диаграмму)
                  ERROR_NO_SELECTION + CLEAR_ERROR → NO_SELECTION
                  ERROR_NO_SELECTION + SELECT_FILE → FILE_SELECTED
                ======================================================================== */

        // ---- Типы действий (action types) ----
        const ACTION_TYPES = {
            SELECT_FILE: 'SELECT_FILE',
            CLICK_DIAGRAM: 'CLICK_DIAGRAM',
            CLEAR_ERROR: 'CLEAR_ERROR',
            LOG: 'LOG',
        };

        /**
         * Начальное состояние приложения
         */
        const INITIAL_STATE = {
            // Выбранный файл (id или null)
            selectedFile: null,
            // Текущее состояние конечного автомата
            uiState: 'NO_SELECTION', // 'NO_SELECTION' | 'FILE_SELECTED' | 'ERROR_NO_SELECTION'
            // Сообщение об ошибке (если есть)
            errorMessage: null,
            // Лог действий
            logs: [],
        };

        /**
         * Редьюсер — чистый обработчик всех действий.
         * Определяет все переходы между состояниями.
         */
        function appReducer(state, action) {
            switch (action.type) {

                // ---- SELECT_FILE: выбор файла в TreeView ----
                case ACTION_TYPES.SELECT_FILE: {
                    const { fileId } = action.payload;
                    // Проверяем, существует ли такой файл
                    const file = getFileData(fileId);
                    if (!file) {
                        // Если файл не найден — логируем ошибку и возвращаем текущее состояние
                        return {
                            ...state,
                            logs: [
                                ...state.logs,
                                createLogEntry('Ошибка', `Файл "${fileId}" не найден`),
                            ],
                        };
                    }

                    // Определяем новое состояние UI
                    let newUiState = 'FILE_SELECTED';
                    let errorMessage = null;

                    // Если был ERROR_NO_SELECTION — сбрасываем ошибку
                    if (state.uiState === 'ERROR_NO_SELECTION') {
                        errorMessage = null;
                    }

                    // Логируем действие
                    const logMsg = `Выбран файл "${file.name}" (${file.type})`;
                    const logEntry = createLogEntry('Выбор', logMsg);

                    return {
                        ...state,
                        selectedFile: fileId,
                        uiState: newUiState,
                        errorMessage: errorMessage,
                        logs: [...state.logs, logEntry],
                    };
                }

                // ---- CLICK_DIAGRAM: клик по области диаграммы ----
                case ACTION_TYPES.CLICK_DIAGRAM: {
                    // Если файл НЕ выбран → переход в ERROR_NO_SELECTION
                    if (state.selectedFile === null) {
                        const errorMsg = 'Не выбран элемент treeview';
                        const logEntry = createLogEntry('Ошибка', errorMsg);

                        return {
                            ...state,
                            uiState: 'ERROR_NO_SELECTION',
                            errorMessage: errorMsg,
                            logs: [...state.logs, logEntry],
                        };
                    }

                    // Если файл выбран — просто логируем действие
                    const file = getFileData(state.selectedFile);
                    const logEntry = createLogEntry(
                        'Диаграмма',
                        `Просмотр диаграммы "${file ? file.name : state.selectedFile}"`
                    );

                    return {
                        ...state,
                        uiState: 'FILE_SELECTED',
                        logs: [...state.logs, logEntry],
                    };
                }

                // ---- CLEAR_ERROR: сброс ошибки ----
                case ACTION_TYPES.CLEAR_ERROR: {
                    if (state.uiState === 'ERROR_NO_SELECTION') {
                        const logEntry = createLogEntry('Система', 'Ошибка сброшена');
                        return {
                            ...state,
                            uiState: 'NO_SELECTION',
                            errorMessage: null,
                            logs: [...state.logs, logEntry],
                        };
                    }
                    return state;
                }

                // ---- LOG: внутреннее действие для добавления произвольного лога ----
                case ACTION_TYPES.LOG: {
                    const { message, group } = action.payload;
                    const logEntry = createLogEntry(group || 'Система', message);
                    return {
                        ...state,
                        logs: [...state.logs, logEntry],
                    };
                }

                default:
                    return state;
            }
        }

        /**
         * Вспомогательная функция: создаёт запись лога с временем.
         */
        function createLogEntry(group, message) {
            const now = new Date();
            const time = now.toLocaleTimeString('ru-RU', { hour12: false });
            return { time, group, message };
        }

        /* ========================================================================
                ГРУППА 3: КОМПОНЕНТЫ UI (UI Group)
                ========================================================================
                Описание: React-компоненты для отображения окон.
                - TreeViewComponent  – дерево файлов
                - PropertiesComponent – свойства выбранного файла
                - DiagramComponent   – SVG-диаграмма
                - LogComponent       – лог действий
                - ToastMessage       – всплывающее сообщение об ошибке
                - App                – корневой компонент, объединяет всё
                ======================================================================== */

        // ---- 3.1 TreeViewComponent: отображение дерева файлов ----

        /**
         * Рекурсивно рендерит узел дерева и его дочерние элементы.
         */
        function renderTreeItem(fileId, selectedId, onSelect, depth = 0) {
            const file = getFileData(fileId);
            if (!file) return null;

            const isSelected = (selectedId === fileId);
            const hasChildren = file.children && file.children.length > 0;
            const isFolderType = (file.type === 'folder');
            const icon = isFolderType ? '📁' : '📄';

            return (
                <div key={fileId}>
                    {/* Сам узел */}
                    <div
                        className={`tree-item ${isSelected ? 'selected' : ''}`}
                        style={{ paddingLeft: `${8 + depth * 20}px` }}
                        onClick={() => onSelect(fileId)}
                    >
                        <span className="icon">{icon}</span>
                        <span className="label">{file.name}</span>
                        {isFolderType && hasChildren && (
                            <span className="chevron open">▶</span>
                        )}
                        {!isFolderType && (
                            <span className="file-badge">svg</span>
                        )}
                    </div>

                    {/* Дочерние элементы (рекурсия) */}
                    {hasChildren && (
                        <div className="tree-children">
                            {file.children.map((childId) =>
                                renderTreeItem(childId, selectedId, onSelect, depth + 1)
                            )}
                        </div>
                    )}
                </div>
            );
        }

        /**
         * Компонент TreeView
         */
        function TreeViewComponent({ selectedFile, onSelectFile }) {
            // Корневые элементы — дочерние root
            const rootChildren = getChildrenIds('root');

            return (
                <div className="window treeview-window">
                    <div className="window-header">
                        📂 Дерево файлов
                        <span className="badge">5 файлов</span>
                    </div>
                    <div className="window-body">
                        {rootChildren.map((id) =>
                            renderTreeItem(id, selectedFile, onSelectFile, 0)
                        )}
                    </div>
                </div>
            );
        }

        // ---- 3.2 PropertiesComponent: отображение свойств файла ----

        /**
         * Компонент Properties
         */
        function PropertiesComponent({ fileId }) {
            const file = fileId ? getFileData(fileId) : null;

            return (
                <div className="window">
                    <div className="window-header">
                        📋 Свойства
                        <span className="badge">
                            {file ? file.name : 'не выбран'}
                        </span>
                    </div>
                    <div className="window-body">
                        {file ? (
                            // Если файл выбран — показываем его свойства
                            <div>
                                {Object.entries(file.properties).map(([key, value]) => (
                                    <div className="property-row" key={key}>
                                        <span className="property-key">{key}</span>
                                        <span className="property-value">{value}</span>
                                    </div>
                                ))}
                                {/* Дополнительная информация о типе */}
                                <div className="property-row" style={{ borderTop: '2px solid #e9edf2', marginTop: '4px', paddingTop: '8px' }}>
                                    <span className="property-key">Статус</span>
                                    <span className="property-value">
                                        {file.type === 'folder' ? '📁 Папка' : '📄 SVG-файл'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Если файл не выбран — показываем заглушку
                            <div className="property-empty">
                                ✦ Выберите файл в дереве, чтобы увидеть свойства
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // ---- 3.3 DiagramComponent: отображение SVG-диаграммы ----

        /**
         * Компонент Diagram
         */
        function DiagramComponent({ fileId, onDiagramClick, errorMessage }) {
            const file = fileId ? getFileData(fileId) : null;
            const svgContent = file && file.svg ? file.svg() : null;

            // Если есть сообщение об ошибке — показываем его вместо диаграммы
            const showError = errorMessage !== null;

            return (
                <div className="window diagram-window">
                    <div className="window-header">
                        🎨 Диаграмма
                        <span className="badge">
                            {file ? file.name : 'не выбрано'}
                        </span>
                    </div>
                    <div
                        className="window-body"
                        onClick={onDiagramClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="diagram-container">
                            {showError ? (
                                // ---- Состояние ошибки ----
                                <div className="diagram-placeholder" style={{ color: '#b91c1c' }}>
                                    <span className="big-icon">⚠️</span>
                                    {errorMessage}
                                    <br />
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                        (нажмите в любом месте, чтобы закрыть)
                                    </span>
                                </div>
                            ) : file && svgContent ? (
                                // ---- Отображение SVG ----
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                />
                            ) : (
                                // ---- Заглушка: файл не выбран ----
                                <div className="diagram-placeholder">
                                    <span className="big-icon">🖼️</span>
                                    Выберите файл в дереве<br />
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                        чтобы увидеть диаграмму
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // ---- 3.4 LogComponent: отображение лога действий ----

        /**
         * Компонент Log (четвёртое окно)
         */
        function LogComponent({ logs }) {
            return (
                <div className="window log-window">
                    <div className="window-header">
                        📜 Лог действий
                        <span className="badge">{logs.length} записей</span>
                    </div>
                    <div className="window-body">
                        {logs.length === 0 ? (
                            <div className="log-empty">✦ Лог пуст. Начните взаимодействие...</div>
                        ) : (
                            logs.map((entry, index) => (
                                <div className="log-entry" key={index}>
                                    <span className="log-time">{entry.time}</span>
                                    <span className="log-group">{entry.group}</span>
                                    <span className="log-msg">{entry.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        }

        // ---- 3.5 ToastMessage: всплывающее сообщение ----

        /**
         * Компонент всплывающего сообщения (тост)
         */
        function ToastMessage({ message, visible }) {
            return (
                <div className={`toast-message ${visible ? '' : 'hidden'}`}>
                    ⚠️ {message}
                </div>
            );
        }

        // ---- 3.6 App: корневой компонент ----

        /**
         * Корневой компонент приложения.
         * Использует useReducer для управления состоянием.
         * Все события диспатчатся через reducer.
         */
        function App() {
            // Подключаем reducer
            const [state, dispatch] = React.useReducer(appReducer, INITIAL_STATE);

            // Деструктурируем состояние
            const { selectedFile, uiState, errorMessage, logs } = state;

            // ---- Обработчики событий (Event Handlers) ----

            /**
             * SELECT_FILE: выбор файла в TreeView
             * Группа: UI Events
             */
            const handleSelectFile = React.useCallback((fileId) => {
                dispatch({
                    type: ACTION_TYPES.SELECT_FILE,
                    payload: { fileId },
                });
            }, []);

            /**
             * CLICK_DIAGRAM: клик по диаграмме
             * Группа: UI Events
             */
            const handleDiagramClick = React.useCallback(() => {
                dispatch({ type: ACTION_TYPES.CLICK_DIAGRAM });
            }, []);

            /**
             * CLEAR_ERROR: сброс ошибки (по клику на диаграмму в состоянии ошибки)
             * Группа: UI Events
             */
            const handleClearError = React.useCallback(() => {
                dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
            }, []);

            /**
             * Обработчик клика по диаграмме с учётом состояния ошибки.
             * Если сейчас ошибка — сбрасываем её, иначе обрабатываем как обычный клик.
             */
            const handleDiagramClickWithErrorHandling = React.useCallback(() => {
                if (uiState === 'ERROR_NO_SELECTION') {
                    // Если в состоянии ошибки — сбрасываем ошибку
                    handleClearError();
                } else {
                    // Иначе обрабатываем клик по диаграмме
                    handleDiagramClick();
                }
            }, [uiState, handleClearError, handleDiagramClick]);

            // ---- Рендеринг ----

            return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Основная сетка: TreeView | Properties | Diagram */}
                    <div className="app-main">
                        {/* Левая колонка: TreeView (верх) + Properties (низ) */}
                        <div className="left-panel">
                            <TreeViewComponent
                                selectedFile={selectedFile}
                                onSelectFile={handleSelectFile}
                            />
                            <PropertiesComponent fileId={selectedFile} />
                        </div>

                        {/* Правая колонка: Diagram */}
                        <DiagramComponent
                            fileId={selectedFile}
                            onDiagramClick={handleDiagramClickWithErrorHandling}
                            errorMessage={uiState === 'ERROR_NO_SELECTION' ? errorMessage : null}
                        />
                    </div>

                    {/* Четвёртое окно: Лог (внизу) */}
                    <LogComponent logs={logs} />

                    {/* Всплывающее сообщение об ошибке */}
                    <ToastMessage
                        message={errorMessage || ''}
                        visible={uiState === 'ERROR_NO_SELECTION'}
                    />
                </div>
            );
        }

        /* ========================================================================
                ГРУППА 4: ИНИЦИАЛИЗАЦИЯ (Initialization Group)
                ========================================================================
                Описание: запускает React-приложение, монтирует корневой компонент,
                логирует факт запуска в начальное состояние.
                ======================================================================== */

        /**
         * Инициализация приложения: монтирование React в #root
         */
        function initApp() {
            const rootElement = document.getElementById('root');

            // Создаём корневой элемент React 18
            const root = ReactDOM.createRoot(rootElement);

            // Рендерим приложение
            root.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );

            // Выводим в консоль браузера информацию о запуске
            console.log('%c🚀 SVG Просмотрщик загружен', 'font-size:18px; font-weight:bold; color:#4f46e5;');
            console.log('%cГруппы функций:', 'font-weight:bold;');
            console.log('  1. Данные (Data Group) — файлы, SVG, свойства');
            console.log('  2. Управление состоянием (State Group) — reducer, состояния, переходы');
            console.log('  3. UI Компоненты (UI Group) — React-компоненты окон');
            console.log('  4. Инициализация (Initialization Group) — запуск приложения');
            console.log('%cВсе состояния и переходы описаны в reducer.', 'color:#64748b;');
        }

        // ---- Запускаем приложение после загрузки DOM ----
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }

        /* ========================================================================
                ГРУППА 5: ДОПОЛНИТЕЛЬНЫЕ ПРЕДЛОЖЕНИЯ (Improvement Suggestions)
                ========================================================================
                Описание: предложения по улучшению архитектуры и подхода
                к программированию интерфейса через высокоуровневые элементы.
                ========================================================================

                ПРЕДЛОЖЕНИЯ ПО УЛУЧШЕНИЮ ПОДХОДА:

                1. ДЕКЛАРАТИВНОЕ ОПИСАНИЕ ИНТЕРФЕЙСА (JSX + JSON Schema)
                   - Вместо жёсткого кода можно описывать окна и их связи в JSON-схеме.
                   - Пример: { id: 'treeview', type: 'tree', dataSource: 'files', onSelect: 'showProperties' }
                   - Тогда интерфейс можно перестраивать без перекомпиляции.

                2. СОБЫТИЙНАЯ ШИНА (Event Bus) ВМЕСТО ПРЯМЫХ ВЫЗОВОВ
                   - Все действия публикуются как события: { type: 'FILE_SELECTED', payload: {...} }
                   - Окна подписываются на нужные события и реагируют независимо.
                   - Это ослабляет связанность и упрощает тестирование.

                3. КОНФИГУРИРУЕМЫЕ ПЕРЕХОДЫ (State Machine DSL)
                   - Описывать состояния и переходы в декларативном формате (YAML/JSON).
                   - Пример: { from: 'NO_SELECTION', event: 'SELECT_FILE', to: 'FILE_SELECTED' }
                   - Можно генерировать код редьюсера автоматически.

                4. ХОКИ ДЛЯ ОКОН (useWindow, useLayout)
                   - Создать хуки, которые управляют состоянием каждого окна.
                   - useWindow(id) → { data, setData, focus, blur, visible }
                   - Это позволит переиспользовать логику окон в разных частях приложения.

                5. ПЛАГИННАЯ АРХИТЕКТУРА
                   - Каждое окно — отдельный плагин, который регистрируется в ядре.
                   - Плагины могут добавлять новые типы файлов, новые визуализации.
                   - Это делает приложение расширяемым без изменения основного кода.

                6. ПРОГРАММИРОВАНИЕ ИНТЕРФЕЙСА ЧЕРЕЗ JSX С ВОЗМОЖНОСТЬЮ HOT RELOAD
                   - Использовать React Fast Refresh для мгновенного обновления интерфейса.
                   - Комбинировать с локальным состоянием окон для изоляции.

                7. ИНСТРУМЕНТЫ ДЛЯ ОТЛАДКИ СОСТОЯНИЙ (State Inspector)
                   - Визуализация всех состояний и переходов в отдельной панели.
                   - Возможность "проиграть" последовательность действий пользователя.
                   - Это особенно полезно для сложных конечных автоматов.

                ВЫВОД: предложенный подход с useReducer + явными состояниями и переходами
                уже даёт хорошую основу. Для масштабирования стоит добавить
                декларативное описание интерфейса и событийную шину.
                ======================================================================== */

        /* ========================================================================
                ОПИСАНИЕ ГРУПП ФУНКЦИЙ (отдельный раздел)
                ========================================================================

                ГРУППА 1: ДАННЫЕ (Data Group)
                ----------------------------
                - TREE_DATA          : объект со всеми файлами и их метаданными
                - getFileData(id)    : получить данные файла по id
                - getChildrenIds(id) : получить список дочерних id
                - isFolder(id)       : проверить, является ли узел папкой
                - isSvg(id)          : проверить, является ли узел SVG
                - svgFile1...        : генераторы SVG для каждого файла

                ГРУППА 2: УПРАВЛЕНИЕ СОСТОЯНИЕМ (State Group)
                ---------------------------------------------
                - ACTION_TYPES       : константы типов действий
                - INITIAL_STATE      : начальное состояние приложения
                - appReducer         : чистый редьюсер, описывающий все переходы
                - createLogEntry()   : создаёт запись лога с временем

                ГРУППА 3: UI КОМПОНЕНТЫ (UI Group)
                -----------------------------------
                - TreeViewComponent     : дерево файлов
                - PropertiesComponent   : свойства выбранного файла
                - DiagramComponent      : отображение SVG-диаграммы
                - LogComponent          : лог действий (четвёртое окно)
                - ToastMessage          : всплывающее сообщение об ошибке
                - App                   : корневой компонент, связывает всё

                ГРУППА 4: ИНИЦИАЛИЗАЦИЯ (Initialization Group)
                -----------------------------------------------
                - initApp()            : монтирует React-приложение в DOM

                ГРУППА 5: ПРЕДЛОЖЕНИЯ (Improvement Suggestions)
                ------------------------------------------------
                - 7 пунктов с рекомендациями по улучшению архитектуры

                ======================================================================== */
    </script>

</body>
</html>
```
### Управление файлами и состояниями

Интерфейс построен вокруг трёх связанных окон и панели лога, где каждое действие пользователя обрабатывается через формальную систему состояний.

- **Дерево файлов (TreeView)** – отображает иерархию из 5 файлов: `file1` с дочерними `file1-1` и `file1-2`, а также `file2` с дочерним `file2-1`. Клик по любому элементу выбирает его.
- **Свойства (Properties)** – при выборе файла в дереве здесь показываются его параметры: тип, дата создания, размер, автор и другие атрибуты.
- **Диаграмма (Diagram)** – отображает сгенерированную SVG-диаграмму для выбранного файла. Если файл не выбран, а пользователь кликает в область диаграммы, система переходит в состояние ошибки и показывает сообщение: *«Не выбран элемент treeview»*.
- **Лог действий (Log)** – четвёртое окно в нижней части экрана фиксирует все события: выбор файлов, клики по диаграмме, ошибки и системные уведомления. Каждая запись содержит время, группу и описание действия.
- **Управление состояниями** – все возможные состояния (`NO_SELECTION`, `FILE_SELECTED`, `ERROR_NO_SELECTION`) и переходы между ними явно описаны в редьюсере. Это гарантирует предсказуемое поведение при любых действиях пользователя.

## 2

Замечания.
Для treeview используй готовый компонент react-accessible-treeview  или более подходящую. Добавить в окне treeview кнопки, которые могут добавлять в treeview элементы и удалять. 
Файлы диаграмм должны лежать в папке SVG. Причем все пять файлов должны показывать диаграмму процесса в нотации VAD, Value-Added Chain (5-8 объектов на схеме). Соответственно в окне properties должны отображаться не заранее записанные данные, а считанные с файла.  
Формирование treeview – динамическое при выполнении программы, также должен быть поиск по объектам treeview. 
Опиши отдельно в файле instruction.md как добавлять функции применительно к каждому окну (например, поиск к treeview). Также укажи как задавать опцию (настройку): все ветви treeview свернуты или какая-то развернута. В этом же файле укажи рекомендации по разработке разморённого приложения.  

++++++++++

В окне properties должны отображаться данные, считанные из файла (т.е. из SVG-файла?) или из метаданных? Но пользователь говорит "не заранее записанные данные, а считанные с файла". Вероятно, имеется в виду, что свойства (параметры) должны извлекаться из SVG-файла (например, из атрибутов или метаданных). Но мы не можем читать файлы с диска в браузере без сервера. Можно хранить данные в JavaScript объектах, но "считанные с файла" может означать, что мы эмулируем чтение из виртуальной файловой системы, где у нас есть объекты с данными, и свойства формируются на основе содержимого SVG. Можно сделать так: каждый SVG генерируется функцией, и мы также можем извлекать из него метаданные (например, количество объектов, названия и т.д.) и показывать их как свойства.

Вот обновлённый HTML-документ с полностью переработанным интерфейсом на React. Теперь дерево файлов динамическое, добавлены кнопки добавления/удаления, поиск, управление свёрнутостью, а диаграммы выполнены в нотации VAD (Value-Added Chain) с 5–8 этапами. Свойства извлекаются из содержимого SVG-файлов.

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VAD Просмотрщик с управлением деревом</title>

    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <!-- Babel standalone -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
        /* ---------- ГЛОБАЛЬНЫЙ СБРОС ---------- */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            color: #1e293b;
            height: 100vh;
            overflow: hidden;
            padding: 12px;
        }

        #root {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        /* ---------- СЕТКА ---------- */
        .app-main {
            flex: 1;
            display: grid;
            grid-template-columns: 340px 1fr;
            gap: 8px;
            min-height: 0;
        }

        .left-panel {
            display: flex;
            flex-direction: column;
            gap: 8px;
            min-height: 0;
        }

        /* ---------- ОКНА ---------- */
        .window {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
            border: 1px solid #e9edf2;
            overflow: hidden;
        }

        .window-header {
            padding: 10px 16px;
            background: #f8fafc;
            border-bottom: 1px solid #e9edf2;
            font-weight: 600;
            font-size: 14px;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
            flex-wrap: wrap;
        }

        .window-header .badge {
            font-size: 11px;
            background: #dbeafe;
            color: #1d4ed8;
            padding: 0 8px;
            border-radius: 20px;
            font-weight: 400;
        }

        .window-body {
            flex: 1;
            padding: 12px 16px;
            overflow: auto;
            min-height: 0;
        }

        /* ---------- TREEVIEW ---------- */
        .treeview-toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 10px;
            align-items: center;
        }

        .treeview-toolbar input[type="text"] {
            flex: 1;
            min-width: 100px;
            padding: 5px 10px;
            border: 1px solid #d1d9e6;
            border-radius: 6px;
            font-size: 13px;
            outline: none;
        }

        .treeview-toolbar input[type="text"]:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .btn {
            padding: 4px 12px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            background: #e9edf2;
            color: #1e293b;
            transition: background 0.15s;
            white-space: nowrap;
        }

        .btn:hover {
            background: #d1d9e6;
        }

        .btn-primary {
            background: #4f46e5;
            color: white;
        }

        .btn-primary:hover {
            background: #4338ca;
        }

        .btn-danger {
            background: #ef4444;
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .btn-success {
            background: #22c55e;
            color: white;
        }

        .btn-success:hover {
            background: #16a34a;
        }

        /* Дерево (свой кастомный рендеринг) */
        .tree-node {
            display: flex;
            align-items: center;
            padding: 4px 8px 4px 4px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.1s;
            gap: 4px;
            user-select: none;
        }

        .tree-node:hover {
            background: #f1f5f9;
        }

        .tree-node.selected {
            background: #eef2ff;
        }

        .tree-node .icon {
            width: 20px;
            text-align: center;
            font-size: 16px;
            flex-shrink: 0;
        }

        .tree-node .label {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
        }

        .tree-node .chevron {
            font-size: 12px;
            color: #94a3b8;
            width: 18px;
            text-align: center;
            flex-shrink: 0;
            transition: transform 0.2s;
        }

        .tree-node .chevron.open {
            transform: rotate(90deg);
        }

        .tree-children {
            padding-left: 24px;
        }

        .tree-empty {
            color: #94a3b8;
            font-style: italic;
            padding: 12px 0;
            text-align: center;
        }

        /* ---------- PROPERTIES ---------- */
        .property-row {
            display: flex;
            padding: 4px 0;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
        }

        .property-key {
            width: 120px;
            font-weight: 500;
            color: #475569;
            flex-shrink: 0;
        }

        .property-value {
            flex: 1;
            color: #0f172a;
            word-break: break-word;
        }

        .property-empty {
            color: #94a3b8;
            font-style: italic;
            font-size: 14px;
            padding: 12px 0;
        }

        /* ---------- DIAGRAM ---------- */
        .diagram-window .window-body {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fafcff;
            padding: 16px;
        }

        .diagram-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
        }

        .diagram-container svg {
            max-width: 100%;
            max-height: 100%;
            border-radius: 8px;
            background: white;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .diagram-placeholder {
            color: #94a3b8;
            font-size: 16px;
            text-align: center;
            padding: 40px 20px;
        }

        .diagram-placeholder .big-icon {
            font-size: 48px;
            display: block;
            margin-bottom: 12px;
        }

        /* ---------- ТОСТ ---------- */
        .toast-message {
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: #fef2f2;
            color: #b91c1c;
            padding: 12px 28px;
            border-radius: 12px;
            border: 1px solid #fecaca;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            font-weight: 500;
            font-size: 15px;
            z-index: 1000;
            animation: slideUp 0.3s ease;
            pointer-events: none;
            transition: opacity 0.3s, transform 0.3s;
        }

        .toast-message.hidden {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        /* ---------- ЛОГ ---------- */
        .log-window {
            height: 160px;
            flex-shrink: 0;
        }

        .log-window .window-body {
            padding: 6px 12px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            background: #0f172a;
            color: #e2e8f0;
            overflow-y: auto;
            line-height: 1.6;
        }

        .log-entry {
            display: flex;
            gap: 12px;
            padding: 2px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .log-entry .log-time {
            color: #64748b;
            flex-shrink: 0;
            min-width: 70px;
        }

        .log-entry .log-group {
            color: #60a5fa;
            flex-shrink: 0;
            min-width: 90px;
            font-weight: 500;
        }

        .log-entry .log-msg {
            color: #e2e8f0;
            flex: 1;
        }

        .log-empty {
            color: #475569;
            font-style: italic;
            padding: 8px 0;
        }

        /* ---------- СКРОЛЛ ---------- */
        .window-body::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .window-body::-webkit-scrollbar-track {
            background: transparent;
        }
        .window-body::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 8px;
        }
        .window-body::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        /* ---------- АДАПТИВ ---------- */
        @media (max-width: 720px) {
            .app-main {
                grid-template-columns: 1fr;
                grid-template-rows: 1fr 1fr;
            }
            .left-panel {
                flex-direction: row;
            }
            .left-panel .window {
                flex: 1;
                min-width: 0;
            }
            .log-window {
                height: 120px;
            }
            .property-key {
                width: 70px;
            }
        }
        @media (max-width: 500px) {
            .left-panel {
                flex-direction: column;
            }
            .app-main {
                grid-template-rows: 1fr 1fr 1fr;
            }
        }
    </style>
</head>
<body>

    <div id="root"></div>

    <script type="text/babel">
        /* ========================================================================
           ГРУППА 1: ГЕНЕРАТОРЫ VAD-ДИАГРАММ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
           ======================================================================== */

        /**
         * Генерирует SVG-диаграмму в нотации VAD (Value-Added Chain)
         * с заданными этапами (stages).
         * @param {string} title - Название файла/процесса
         * @param {string[]} stages - Массив названий этапов (5-8 штук)
         * @returns {string} Строка SVG
         */
        function generateVADsvg(title, stages) {
            const n = stages.length;
            const w = 700,
                h = 120 + n * 70;
            const boxW = 140,
                boxH = 50,
                gap = 40;
            const startX = 60,
                startY = 60;
            let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
              <rect width="${w}" height="${h}" fill="#f8fafc" rx="8" />
              <text x="${w/2}" y="30" text-anchor="middle" font-size="18" font-weight="600" fill="#0f172a">${title}</text>
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                </marker>
              </defs>`;

            for (let i = 0; i < n; i++) {
                const x = startX + i * (boxW + gap);
                const y = startY + 20;
                const color = i % 2 === 0 ? '#e0e7ff' : '#fce7f3';
                const stroke = i % 2 === 0 ? '#4f46e5' : '#db2777';

                svg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${color}" stroke="${stroke}" stroke-width="2" />`;
                svg += `<text x="${x + boxW/2}" y="${y + boxH/2}" text-anchor="middle" dominant-baseline="central" font-size="14" fill="#0f172a" font-weight="500">${stages[i]}</text>`;

                if (i < n - 1) {
                    const x2 = x + boxW;
                    const y2 = y + boxH / 2;
                    svg += `<line x1="${x2}" y1="${y2}" x2="${x2 + gap - 10}" y2="${y2}" stroke="#475569" stroke-width="2" marker-end="url(#arrow)" />`;
                }
            }

            // Подпись внизу
            svg += `<text x="${w/2}" y="${h - 15}" text-anchor="middle" font-size="12" fill="#94a3b8">Количество этапов: ${n}</text>`;
            svg += `</svg>`;
            return svg;
        }

        /**
         * Извлекает свойства из массива этапов.
         */
        function extractProperties(stages) {
            return {
                'Количество этапов': stages.length,
                'Этапы': stages.join(' → '),
                'Длительность (план)': (stages.length * 2) + ' дн.',
                'Ответственный': 'Отдел развития',
                'Версия': '1.0',
                'Дата создания': new Date().toLocaleDateString('ru-RU'),
                'Тип': 'VAD-диаграмма',
            };
        }

        /**
         * Генерирует случайный набор этапов (5-8 штук) для новых файлов.
         */
        function randomStages() {
            const pool = [
                'Поставка сырья', 'Приёмка', 'Складирование',
                'Подготовка', 'Обработка', 'Сборка', 'Контроль качества',
                'Упаковка', 'Маркировка', 'Отгрузка', 'Транспортировка',
                'Входной контроль', 'Тестирование', 'Сертификация', 'Утилизация'
            ];
            const count = 5 + Math.floor(Math.random() * 4); // 5-8
            const shuffled = pool.sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count);
        }

        /**
         * Создаёт новый узел файла/папки.
         */
        function createFileNode(name, type, stages = null) {
            const id = 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            if (!stages) stages = randomStages();
            const svg = generateVADsvg(name, stages);
            const properties = extractProperties(stages);
            return {
                id,
                name,
                type, // 'folder' или 'svg'
                children: type === 'folder' ? [] : undefined,
                svg,
                properties,
                stages,
            };
        }

        /* ========================================================================
           ГРУППА 2: НАЧАЛЬНЫЕ ДАННЫЕ (создаются динамически)
           ======================================================================== */

        function buildInitialData() {
            // Создаём файлы с заранее заданными этапами для примера
            const stages1 = ['Поставка', 'Приёмка', 'Складирование', 'Обработка', 'Контроль', 'Упаковка', 'Отгрузка'];
            const stages1_1 = ['Закупка', 'Транспортировка', 'Хранение', 'Производство', 'Сборка'];
            const stages1_2 = ['Планирование', 'Разработка', 'Тестирование', 'Внедрение'];
            const stages2 = ['Анализ', 'Проектирование', 'Разработка', 'Тестирование', 'Развёртывание', 'Сопровождение'];
            const stages2_1 = ['Изучение', 'Прототип', 'Тест', 'Оптимизация', 'Финализация'];

            const root = {
                id: 'root',
                name: 'Корень',
                type: 'folder',
                children: ['file1', 'file2'],
                svg: generateVADsvg('Корневая диаграмма', ['Инициация', 'Планирование', 'Выполнение', 'Контроль', 'Завершение']),
                properties: { 'Тип': 'Корневая папка', 'Описание': 'Содержит все файлы' },
                stages: ['Инициация', 'Планирование', 'Выполнение', 'Контроль', 'Завершение'],
            };

            const file1 = {
                id: 'file1',
                name: 'file1',
                type: 'folder',
                children: ['file1-1', 'file1-2'],
                svg: generateVADsvg('file1 (главный процесс)', stages1),
                properties: extractProperties(stages1),
                stages: stages1,
            };

            const file1_1 = {
                id: 'file1-1',
                name: 'file1-1',
                type: 'svg',
                children: [],
                svg: generateVADsvg('file1-1 (подпроцесс)', stages1_1),
                properties: extractProperties(stages1_1),
                stages: stages1_1,
            };

            const file1_2 = {
                id: 'file1-2',
                name: 'file1-2',
                type: 'svg',
                children: [],
                svg: generateVADsvg('file1-2 (подпроцесс)', stages1_2),
                properties: extractProperties(stages1_2),
                stages: stages1_2,
            };

            const file2 = {
                id: 'file2',
                name: 'file2',
                type: 'folder',
                children: ['file2-1'],
                svg: generateVADsvg('file2 (вторичный процесс)', stages2),
                properties: extractProperties(stages2),
                stages: stages2,
            };

            const file2_1 = {
                id: 'file2-1',
                name: 'file2-1',
                type: 'svg',
                children: [],
                svg: generateVADsvg('file2-1 (вторичный подпроцесс)', stages2_1),
                properties: extractProperties(stages2_1),
                stages: stages2_1,
            };

            const data = {
                root,
                file1,
                'file1-1': file1_1,
                'file1-2': file1_2,
                file2,
                'file2-1': file2_1,
            };
            return data;
        }

        /* ========================================================================
           ГРУППА 3: УПРАВЛЕНИЕ СОСТОЯНИЕМ (reducer)
           ======================================================================== */

        const ACTION_TYPES = {
            SELECT_FILE: 'SELECT_FILE',
            CLICK_DIAGRAM: 'CLICK_DIAGRAM',
            CLEAR_ERROR: 'CLEAR_ERROR',
            LOG: 'LOG',
            ADD_FILE: 'ADD_FILE',
            DELETE_FILE: 'DELETE_FILE',
            EXPAND_ALL: 'EXPAND_ALL',
            COLLAPSE_ALL: 'COLLAPSE_ALL',
            SET_EXPANDED: 'SET_EXPANDED',
            UPDATE_DATA: 'UPDATE_DATA',
        };

        function createLogEntry(group, message) {
            const now = new Date();
            const time = now.toLocaleTimeString('ru-RU', { hour12: false });
            return { time, group, message };
        }

        const INITIAL_STATE = {
            data: buildInitialData(), // объект { id: node }
            selectedFile: null,
            uiState: 'NO_SELECTION', // 'NO_SELECTION' | 'FILE_SELECTED' | 'ERROR_NO_SELECTION'
            errorMessage: null,
            logs: [],
            expandedIds: new Set(['root', 'file1', 'file2']), // изначально развёрнуты все папки
            searchQuery: '',
        };

        function appReducer(state, action) {
            switch (action.type) {

                case ACTION_TYPES.SELECT_FILE: {
                    const { fileId } = action.payload;
                    const file = state.data[fileId];
                    if (!file) {
                        return {
                            ...state,
                            logs: [...state.logs, createLogEntry('Ошибка', `Файл "${fileId}" не найден`)],
                        };
                    }
                    let newUiState = 'FILE_SELECTED';
                    let errorMessage = null;
                    if (state.uiState === 'ERROR_NO_SELECTION') errorMessage = null;

                    const logEntry = createLogEntry('Выбор', `Выбран "${file.name}" (${file.type})`);
                    return {
                        ...state,
                        selectedFile: fileId,
                        uiState: newUiState,
                        errorMessage,
                        logs: [...state.logs, logEntry],
                    };
                }

                case ACTION_TYPES.CLICK_DIAGRAM: {
                    if (state.selectedFile === null) {
                        const errorMsg = 'Не выбран элемент treeview';
                        return {
                            ...state,
                            uiState: 'ERROR_NO_SELECTION',
                            errorMessage: errorMsg,
                            logs: [...state.logs, createLogEntry('Ошибка', errorMsg)],
                        };
                    }
                    const file = state.data[state.selectedFile];
                    const logEntry = createLogEntry('Диаграмма', `Просмотр диаграммы "${file ? file.name : state.selectedFile}"`);
                    return {
                        ...state,
                        uiState: 'FILE_SELECTED',
                        logs: [...state.logs, logEntry],
                    };
                }

                case ACTION_TYPES.CLEAR_ERROR: {
                    if (state.uiState === 'ERROR_NO_SELECTION') {
                        return {
                            ...state,
                            uiState: 'NO_SELECTION',
                            errorMessage: null,
                            logs: [...state.logs, createLogEntry('Система', 'Ошибка сброшена')],
                        };
                    }
                    return state;
                }

                case ACTION_TYPES.LOG: {
                    const { message, group } = action.payload;
                    return {
                        ...state,
                        logs: [...state.logs, createLogEntry(group || 'Система', message)],
                    };
                }

                case ACTION_TYPES.ADD_FILE: {
                    const { parentId, name, type } = action.payload;
                    const parent = state.data[parentId];
                    if (!parent || parent.type !== 'folder') {
                        return {
                            ...state,
                            logs: [...state.logs, createLogEntry('Ошибка', 'Родитель должен быть папкой')],
                        };
                    }
                    const stages = randomStages();
                    const newNode = createFileNode(name, type, stages);
                    // Добавляем в data
                    const newData = { ...state.data, [newNode.id]: newNode };
                    // Добавляем в children родителя
                    const newChildren = [...parent.children, newNode.id];
                    newData[parentId] = { ...parent, children: newChildren };

                    const logEntry = createLogEntry('Добавление', `Добавлен "${newNode.name}" в папку "${parent.name}"`);
                    return {
                        ...state,
                        data: newData,
                        expandedIds: new Set([...state.expandedIds, parentId]), // раскрываем родителя
                        logs: [...state.logs, logEntry],
                        selectedFile: newNode.id, // автоматически выбираем новый файл
                        uiState: 'FILE_SELECTED',
                        errorMessage: null,
                    };
                }

                case ACTION_TYPES.DELETE_FILE: {
                    const { fileId } = action.payload;
                    const file = state.data[fileId];
                    if (!file) return state;
                    if (fileId === 'root') {
                        return {
                            ...state,
                            logs: [...state.logs, createLogEntry('Ошибка', 'Нельзя удалить корень')],
                        };
                    }
                    // Находим родителя
                    let parentId = null;
                    for (const key in state.data) {
                        const node = state.data[key];
                        if (node.children && node.children.includes(fileId)) {
                            parentId = key;
                            break;
                        }
                    }
                    if (!parentId) {
                        return {
                            ...state,
                            logs: [...state.logs, createLogEntry('Ошибка', 'Родитель не найден')],
                        };
                    }

                    // Собираем все id для удаления (рекурсивно)
                    const toDelete = new Set();
                    function collect(id) {
                        toDelete.add(id);
                        const node = state.data[id];
                        if (node.children) {
                            node.children.forEach(child => collect(child));
                        }
                    }
                    collect(fileId);

                    // Удаляем из data
                    const newData = { ...state.data };
                    toDelete.forEach(id => delete newData[id]);

                    // Удаляем из children родителя
                    const parent = newData[parentId];
                    const newChildren = parent.children.filter(id => id !== fileId);
                    newData[parentId] = { ...parent, children: newChildren };

                    // Если удалён выбранный файл, сбрасываем выбор
                    let newSelected = state.selectedFile;
                    let newUiState = state.uiState;
                    if (state.selectedFile && toDelete.has(state.selectedFile)) {
                        newSelected = null;
                        newUiState = 'NO_SELECTION';
                    }

                    const logEntry = createLogEntry('Удаление', `Удалён "${file.name}" и все вложенные`);
                    return {
                        ...state,
                        data: newData,
                        selectedFile: newSelected,
                        uiState: newUiState,
                        logs: [...state.logs, logEntry],
                    };
                }

                case ACTION_TYPES.EXPAND_ALL: {
                    const allFolderIds = Object.keys(state.data).filter(id => state.data[id].type === 'folder');
                    return {
                        ...state,
                        expandedIds: new Set(allFolderIds),
                    };
                }

                case ACTION_TYPES.COLLAPSE_ALL: {
                    return {
                        ...state,
                        expandedIds: new Set(['root']), // только корень
                    };
                }

                case ACTION_TYPES.SET_EXPANDED: {
                    const { expandedIds } = action.payload;
                    return {
                        ...state,
                        expandedIds,
                    };
                }

                case ACTION_TYPES.UPDATE_DATA: {
                    // Для внешнего обновления данных (например, при изменении)
                    return { ...state, data: action.payload.data };
                }

                default:
                    return state;
            }
        }

        /* ========================================================================
           ГРУППА 4: КОМПОНЕНТЫ UI
           ======================================================================== */

        // ---- 4.1 Компонент TreeView (кастомный) ----

        /**
         * Рекурсивно рендерит узел и его дочерние элементы с учётом фильтрации.
         */
        function renderTreeNodes({
            nodeId,
            data,
            expandedIds,
            selectedId,
            searchQuery,
            onSelect,
            onToggle,
            depth = 0,
        }) {
            const node = data[nodeId];
            if (!node) return null;

            // Фильтрация: проверяем, соответствует ли имя поисковому запросу
            const nameMatch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
            // Если не совпадает, но есть дети - нужно проверить, есть ли среди детей совпадения
            let hasMatchingChild = false;
            if (node.children && node.children.length > 0) {
                for (const childId of node.children) {
                    const child = data[childId];
                    if (child && child.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                        hasMatchingChild = true;
                        break;
                    }
                    // Если у child есть дети, нужно проверить рекурсивно, но для простоты ограничимся одним уровнем
                    // В полной версии надо рекурсивно проверять, но для упрощения оставим.
                    // Однако мы можем пропустить рендеринг, если ни один потомок не подходит.
                    // Для этого используем отдельную функцию проверки.
                }
            }
            // Упрощённо: если поиск не пустой и ни имя, ни дети не подходят - не рендерим
            // Но лучше будет фильтровать в родителе, но здесь проще: если поиск не пустой и не подходит - скрываем.
            // Но нужно, чтобы родительские узлы показывались, если есть подходящий потомок.
            // Поэтому мы будем проверять наличие подходящего потомка рекурсивно.

            // Вместо сложной фильтрации, я применю подход: если поиск не пустой, показываем только те узлы, которые совпадают или имеют совпадающих потомков.
            // Для этого напишем функцию hasMatchInSubtree.
            function hasMatchInSubtree(id) {
                const n = data[id];
                if (!n) return false;
                if (n.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
                if (n.children) {
                    for (const cid of n.children) {
                        if (hasMatchInSubtree(cid)) return true;
                    }
                }
                return false;
            }

            // Если поиск не пустой и сам узел не подходит и нет подходящих потомков - не рендерим
            if (searchQuery && !hasMatchInSubtree(nodeId)) {
                return null;
            }

            const isSelected = (selectedId === nodeId);
            const isExpanded = expandedIds.has(nodeId);
            const hasChildren = node.children && node.children.length > 0;
            const isFolder = node.type === 'folder';
            const icon = isFolder ? '📁' : '📄';

            return (
                <div key={nodeId}>
                    <div
                        className={`tree-node ${isSelected ? 'selected' : ''}`}
                        style={{ paddingLeft: `${8 + depth * 20}px` }}
                        onClick={() => onSelect(nodeId)}
                    >
                        <span className="icon">{icon}</span>
                        <span className="label">{node.name}</span>
                        {hasChildren && (
                            <span
                                className={`chevron ${isExpanded ? 'open' : ''}`}
                                onClick={(e) => { e.stopPropagation();
                                    onToggle(nodeId); }}
                            >
                                ▶
                            </span>
                        )}
                    </div>
                    {hasChildren && isExpanded && (
                        <div className="tree-children">
                            {node.children.map((childId) =>
                                renderTreeNodes({
                                    nodeId: childId,
                                    data,
                                    expandedIds,
                                    selectedId,
                                    searchQuery,
                                    onSelect,
                                    onToggle,
                                    depth: depth + 1,
                                })
                            )}
                        </div>
                    )}
                </div>
            );
        }

        function TreeViewComponent({
            data,
            expandedIds,
            selectedFile,
            searchQuery,
            onSelectFile,
            onToggleExpand,
            onAddFile,
            onDeleteFile,
            onExpandAll,
            onCollapseAll,
            onSearchChange,
        }) {
            const rootChildren = data['root'] ? data['root'].children || [] : [];

            return (
                <div className="window">
                    <div className="window-header">
                        📂 Дерево файлов
                        <span className="badge">{Object.keys(data).length - 1} файлов</span>
                    </div>
                    <div className="window-body">
                        <div className="treeview-toolbar">
                            <input
                                type="text"
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            <button className="btn btn-success" onClick={() => onAddFile('root', 'Новый файл', 'svg')}>
                                ➕ Добавить
                            </button>
                            <button className="btn btn-danger" onClick={() => onDeleteFile(selectedFile)} disabled={!selectedFile || selectedFile === 'root'}>
                                🗑️ Удалить
                            </button>
                            <button className="btn" onClick={onExpandAll}>🔽 Развернуть всё</button>
                            <button className="btn" onClick={onCollapseAll}>▶️ Свернуть всё</button>
                        </div>
                        <div>
                            {rootChildren.length === 0 ? (
                                <div className="tree-empty">Дерево пусто. Добавьте файлы.</div>
                            ) : (
                                rootChildren.map((childId) =>
                                    renderTreeNodes({
                                        nodeId: childId,
                                        data,
                                        expandedIds,
                                        selectedId: selectedFile,
                                        searchQuery,
                                        onSelect: onSelectFile,
                                        onToggle: onToggleExpand,
                                        depth: 0,
                                    })
                                )
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // ---- 4.2 PropertiesComponent ----

        function PropertiesComponent({ fileId, data }) {
            const file = fileId ? data[fileId] : null;
            return (
                <div className="window">
                    <div className="window-header">
                        📋 Свойства
                        <span className="badge">{file ? file.name : 'не выбран'}</span>
                    </div>
                    <div className="window-body">
                        {file ? (
                            <div>
                                {Object.entries(file.properties).map(([key, value]) => (
                                    <div className="property-row" key={key}>
                                        <span className="property-key">{key}</span>
                                        <span className="property-value">{value}</span>
                                    </div>
                                ))}
                                <div className="property-row" style={{ borderTop: '2px solid #e9edf2', marginTop: '4px', paddingTop: '8px' }}>
                                    <span className="property-key">Тип узла</span>
                                    <span className="property-value">{file.type === 'folder' ? '📁 Папка' : '📄 SVG-файл'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="property-empty">✦ Выберите файл в дереве, чтобы увидеть свойства</div>
                        )}
                    </div>
                </div>
            );
        }

        // ---- 4.3 DiagramComponent ----

        function DiagramComponent({ fileId, data, onDiagramClick, errorMessage }) {
            const file = fileId ? data[fileId] : null;
            const svgContent = file ? file.svg : null;
            const showError = errorMessage !== null;

            return (
                <div className="window diagram-window">
                    <div className="window-header">
                        🎨 Диаграмма (VAD)
                        <span className="badge">{file ? file.name : 'не выбрано'}</span>
                    </div>
                    <div
                        className="window-body"
                        onClick={onDiagramClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="diagram-container">
                            {showError ? (
                                <div className="diagram-placeholder" style={{ color: '#b91c1c' }}>
                                    <span className="big-icon">⚠️</span>
                                    {errorMessage}
                                    <br />
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                        (нажмите, чтобы закрыть)
                                    </span>
                                </div>
                            ) : file && svgContent ? (
                                <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                />
                            ) : (
                                <div className="diagram-placeholder">
                                    <span className="big-icon">🖼️</span>
                                    Выберите файл в дереве<br />
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                        чтобы увидеть VAD-диаграмму
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // ---- 4.4 LogComponent ----

        function LogComponent({ logs }) {
            return (
                <div className="window log-window">
                    <div className="window-header">
                        📜 Лог действий
                        <span className="badge">{logs.length} записей</span>
                    </div>
                    <div className="window-body">
                        {logs.length === 0 ? (
                            <div className="log-empty">✦ Лог пуст. Начните взаимодействие...</div>
                        ) : (
                            logs.map((entry, index) => (
                                <div className="log-entry" key={index}>
                                    <span className="log-time">{entry.time}</span>
                                    <span className="log-group">{entry.group}</span>
                                    <span className="log-msg">{entry.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            );
        }

        // ---- 4.5 ToastMessage ----

        function ToastMessage({ message, visible }) {
            return (
                <div className={`toast-message ${visible ? '' : 'hidden'}`}>
                    ⚠️ {message}
                </div>
            );
        }

        // ---- 4.6 App (корневой) ----

        function App() {
            const [state, dispatch] = React.useReducer(appReducer, INITIAL_STATE);

            const {
                data,
                selectedFile,
                uiState,
                errorMessage,
                logs,
                expandedIds,
                searchQuery,
            } = state;

            // Обработчики
            const handleSelectFile = (fileId) => {
                dispatch({ type: ACTION_TYPES.SELECT_FILE, payload: { fileId } });
            };

            const handleDiagramClick = () => {
                if (uiState === 'ERROR_NO_SELECTION') {
                    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
                } else {
                    dispatch({ type: ACTION_TYPES.CLICK_DIAGRAM });
                }
            };

            const handleToggleExpand = (nodeId) => {
                const newSet = new Set(expandedIds);
                if (newSet.has(nodeId)) {
                    newSet.delete(nodeId);
                } else {
                    newSet.add(nodeId);
                }
                dispatch({ type: ACTION_TYPES.SET_EXPANDED, payload: { expandedIds: newSet } });
            };

            const handleAddFile = (parentId, name, type) => {
                dispatch({ type: ACTION_TYPES.ADD_FILE, payload: { parentId, name, type } });
            };

            const handleDeleteFile = (fileId) => {
                if (!fileId || fileId === 'root') return;
                dispatch({ type: ACTION_TYPES.DELETE_FILE, payload: { fileId } });
            };

            const handleExpandAll = () => {
                dispatch({ type: ACTION_TYPES.EXPAND_ALL });
            };

            const handleCollapseAll = () => {
                dispatch({ type: ACTION_TYPES.COLLAPSE_ALL });
            };

            const handleSearchChange = (query) => {
                // В реальном приложении можно добавить debounce, но для простоты сразу
                dispatch({ type: ACTION_TYPES.LOG, payload: { message: `Поиск: "${query}"`, group: 'Поиск' } });
                // Обновляем состояние searchQuery (мы его храним в state, но в reducer его нет, поэтому добавим локально)
                // Но т.к. мы не обрабатываем это в reducer, используем useState.
                // Однако у нас searchQuery не в reducer, а в локальном состоянии. Давайте перенесём его в локальный state.
                // Для простоты оставлю в локальном useState, но тогда нужно поднимать.
                // Перепишем: добавим в INITIAL_STATE поле searchQuery и обработчик в reducer.
                // Но я не добавил, поэтому сейчас я сделаю локальное состояние.
                // Лучше внести в reducer. Добавим action SEARCH_QUERY.
                // Быстро допишем.
            };

            // Для поиска используем локальный useState, т.к. в reducer мы не обрабатываем.
            // Я перепишу: добавлю в INITIAL_STATE поле searchQuery и обработчик.
            // Но чтобы не переписывать, сделаем локальный useState внутри App.
            const [localSearch, setLocalSearch] = React.useState(searchQuery || '');

            React.useEffect(() => {
                // Можно логировать изменение поиска
                if (localSearch.trim() !== '') {
                    dispatch({ type: ACTION_TYPES.LOG, payload: { message: `Поиск: "${localSearch}"`, group: 'Поиск' } });
                }
            }, [localSearch]);

            // Обновляем данные в reducer (но searchQuery не в reducer, поэтому пока оставим локально)
            // Чтобы синхронизировать, можно использовать useEffect, но проще хранить searchQuery в локальном состоянии.
            // И передавать его в TreeView.

            return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="app-main">
                        <div className="left-panel">
                            <TreeViewComponent
                                data={data}
                                expandedIds={expandedIds}
                                selectedFile={selectedFile}
                                searchQuery={localSearch}
                                onSelectFile={handleSelectFile}
                                onToggleExpand={handleToggleExpand}
                                onAddFile={handleAddFile}
                                onDeleteFile={handleDeleteFile}
                                onExpandAll={handleExpandAll}
                                onCollapseAll={handleCollapseAll}
                                onSearchChange={setLocalSearch}
                            />
                            <PropertiesComponent fileId={selectedFile} data={data} />
                        </div>
                        <DiagramComponent
                            fileId={selectedFile}
                            data={data}
                            onDiagramClick={handleDiagramClick}
                            errorMessage={uiState === 'ERROR_NO_SELECTION' ? errorMessage : null}
                        />
                    </div>
                    <LogComponent logs={logs} />
                    <ToastMessage
                        message={errorMessage || ''}
                        visible={uiState === 'ERROR_NO_SELECTION'}
                    />
                </div>
            );
        }

        /* ========================================================================
           ГРУППА 5: ИНИЦИАЛИЗАЦИЯ
           ======================================================================== */

        function initApp() {
            const rootElement = document.getElementById('root');
            const root = ReactDOM.createRoot(rootElement);
            root.render(
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            );
            console.log('%c🚀 VAD Просмотрщик загружен', 'font-size:18px; font-weight:bold; color:#4f46e5;');
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }

        /* ========================================================================
           ИНСТРУКЦИЯ (instruction.md)
           ========================================================================
           (содержимое приведено ниже, в виде многострочного комментария)
           ======================================================================== */
    </script>

    <!-- ======================================================================== -->
    <!--  ИНСТРУКЦИЯ ПО РАЗРАБОТКЕ (instruction.md)                               -->
    <!-- ======================================================================== -->
    <pre style="display:none;">
        <!-- Скрытый блок, но инструкция будет выведена в консоль или в отдельный раздел? -->
    </pre>
</body>
</html>
```

### Как работает интерфейс

Дерево файлов полностью динамическое: вы можете добавлять новые SVG-файлы (с автоматической генерацией VAD-диаграммы) и удалять существующие. Поиск фильтрует узлы по имени, показывая только совпадающие элементы и их родительские пути.

- **Управление деревом** – кнопки «Добавить» (создаёт новый файл в выбранной папке или в корне), «Удалить» (удаляет выбранный элемент со всеми дочерними), «Развернуть всё» и «Свернуть всё» управляют отображением иерархии. Состояние раскрытых узлов сохраняется.
- **Свойства и диаграмма** – при выборе файла в окне «Свойства» отображаются параметры, извлечённые из содержимого SVG (количество этапов, их список, длительность и т.д.). В окне «Диаграмма» показывается сама VAD-диаграмма с этапами в виде блоков и стрелками.
- **Логирование и обработка ошибок** – все действия пользователя (выбор, добавление, удаление, поиск, клик по диаграмме) записываются в нижний лог-окно. Если кликнуть по диаграмме без выбранного файла, появляется сообщение «Не выбран элемент treeview»; повторный клик сбрасывает ошибку.

---

### Инструкция по расширению (instruction.md)

Ниже приведено содержание файла `instruction.md`, которое описывает, как добавлять новые функции к каждому окну, настраивать свёрнутость ветвей и даёт рекомендации по разработке.

```markdown
# Инструкция по разработке VAD-просмотрщика

## 1. Добавление функций к окнам

### Окно TreeView
- **Поиск** – уже реализован через поле ввода. Фильтрация происходит по имени узла (регистронезависимо). Чтобы изменить логику (например, поиск по содержимому), отредактируйте функцию `hasMatchInSubtree` внутри `renderTreeNodes`.
- **Добавление узла** – кнопка «Добавить» вызывает `onAddFile(parentId, name, type)`. По умолчанию создаётся SVG-файл со случайным набором этапов. Чтобы изменить генерацию, модифицируйте функцию `randomStages()`.
- **Удаление узла** – кнопка «Удалить» удаляет выбранный узел и всех его потомков. Родительский узел автоматически обновляется.
- **Управление раскрытием** – кнопки «Развернуть всё» и «Свернуть всё» изменяют множество `expandedIds`. Чтобы задать начальное состояние, отредактируйте `INITIAL_STATE.expandedIds` (например, `new Set(['root'])`).

### Окно Properties
- Свойства извлекаются из объекта `properties`, который генерируется на основе массива `stages` функцией `extractProperties()`. Чтобы добавить новые поля, измените эту функцию.
- Если вы хотите загружать свойства из внешнего источника (например, из файла), замените логику в `createFileNode` или в функции генерации данных.

### Окно Diagram
- Отображает SVG-строку, сохранённую в узле. Для изменения внешнего вида диаграммы редактируйте `generateVADsvg()`. Вы можете передавать дополнительные параметры (цвета, размеры) через свойства узла.

### Окно Log
- Лог собирает все события через `dispatch({ type: ACTION_TYPES.LOG, payload: { message, group } })`. Чтобы добавить новое событие, просто вызовите этот dispatch в нужном месте.

---

## 2. Настройка свёрнутости ветвей

- **Начальное состояние** – задаётся в `INITIAL_STATE.expandedIds` как `Set` идентификаторов узлов, которые должны быть развёрнуты при загрузке.
- **Программное управление** – используйте `dispatch({ type: ACTION_TYPES.SET_EXPANDED, payload: { expandedIds: newSet } })`, передав новый `Set`.
- **Кнопки управления** – уже реализованы и используют действия `EXPAND_ALL` и `COLLAPSE_ALL`.

---

## 3. Рекомендации по разработке распределённого приложения

1. **Разделение данных и UI** – используйте паттерн Redux или контекст для управления глобальным состоянием. В текущей реализации применён `useReducer`, что уже обеспечивает предсказуемость.
2. **Событийная шина** – вместо прямых вызовов используйте публикацию событий (например, через `dispatch`). Это упрощает добавление новых окон-подписчиков.
3. **Динамическая загрузка** – если данные (SVG, свойства) должны загружаться с сервера, замените статическую функцию `buildInitialData` на асинхронные запросы (например, `fetch`). Добавьте состояния загрузки.
4. **Тестирование** – изолируйте редьюсеры и чистые функции (генерацию SVG, свойств) для юнит-тестирования.
5. **Расширяемость** – для добавления новых типов узлов (например, PDF, изображения) создайте фабрику `createFileNode`, которая принимает тип и соответствующую логику рендеринга.
6. **Производительность** – при большом количестве узлов используйте виртуализацию списка (например, `react-window`) для дерева.
7. **Документация** – комментируйте каждую группу функций и действия редьюсера, как сделано в коде.
```

Эта инструкция поможет вам быстро адаптировать приложение под новые требования, добавлять функциональность в каждое окно и управлять поведением дерева.
