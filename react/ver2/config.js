// config.js
// Конфигурация приложения в YAML-подобном формате (для наглядности)
/*
folderPath: "./svg"            # Относительный путь к папке с SVG-файлами
defaultExpanded: true          # Разворачивать все папки при загрузке
maxStages: 8                   # Максимальное число этапов (для будущего использования)
*/
export const CONFIG = {
    // Укажите относительный или абсолютный путь к папке с SVG
    folderPath: './svg',        // Например, папка "svg" в той же директории, что и index.html
    defaultExpanded: true,
    maxStages: 8,
};

// YAML-представление для отображения в логе/интерфейсе
export const CONFIG_YAML = `
folderPath: "./svg"
defaultExpanded: true
maxStages: 8
`;