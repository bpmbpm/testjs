# Инструкция по работе и доработке VAD-просмотрщика

## 1. Группы функций в коде

### Группа 1: Утилиты для работы с файлами и SVG
- `extractStagesFromSVG(svgText)` – парсит SVG и возвращает массив названий этапов.
- `extractPropertiesFromSVG(svgText)` – формирует объект свойств.
- `buildTreeFromFileNames(fileNames)` – строит иерархическое дерево из списка имён файлов (без расширения). Использует `reduce` и `filter`.

### Группа 2: Управление состоянием (Reducer)
- Типы действий: `SET_FILES`, `SELECT_FILE`, `LOAD_SVG`, `CLICK_DIAGRAM`, `CLEAR_ERROR`, `LOG`, `EXPAND_ALL`, `COLLAPSE_ALL`, `SET_EXPANDED`, `SET_FOLDER_PATH`.
- `appReducer` – чистый редьюсер, описывающий все переходы.

### Группа 3: React-компоненты
- `FolderSelector` – компонент для выбора папки (использует File System Access API).
- `TreeViewComponent` – отображает дерево, содержит поиск и кнопки управления.
- `PropertiesComponent` – показывает свойства узла.
- `DiagramComponent` – отображает SVG.
- `LogComponent` – лог.
- `ToastMessage` – всплывающее сообщение.
- `App` – корневой компонент, связывает всё.

### Группа 4: Инициализация
- `initApp()` – монтирует приложение.

---

## 2. Как добавить новую функцию (пример для новичка)

**Задача:** добавить кнопку «Экспортировать SVG» для текущего файла.

**Шаги:**
1. В компоненте `DiagramComponent` добавить кнопку в заголовок или в тело.
2. Использовать функцию `downloadFile` (можно создать отдельную утилиту).
3. В `App` передать обработчик `onExport` через пропсы.

**Пример кода (функциональный подход):**
```javascript
// Добавить в DiagramComponent
const handleExport = () => {
    if (node && node.svgContent) {
        const blob = new Blob([node.svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = node.name + '.svg';
        a.click();
        URL.revokeObjectURL(url);
    }
};
// Добавить кнопку в заголовок
<button className="btn" onClick={handleExport}>💾 Экспорт</button>