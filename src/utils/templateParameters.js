export /**
 * extractPlaceholders
 *
 * Description:
 * - Extraer placeholders de una cadena de plantilla.
 */
function extractPlaceholders(text) {
    if (!text) {
        return [];
    }
    const matches = [...String(text).matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)];
    return matches.map((match) => match[1].trim());
}

/**
 * buildFields
 *
 * Description:
 * - Construir los campos editables requeridos por HEADER y BODY.
 */

export /**
 * buildFields
 *
 * Description:
 * - Construir los campos editables requeridos por HEADER y BODY.
 */
function buildFields(template, t) {
    const components = template?.components || [];
    const fields = [];
    components.forEach((component) => {
        const type = String(component?.type || "").toUpperCase();
        if (type !== "HEADER" && type !== "BODY") {
            return;
        }
        const placeholders = extractPlaceholders(component?.text);
        placeholders.forEach((placeholder, index) => {
            fields.push({
                id: `${type.toLowerCase()}-${placeholder}-${index}`,
                componentType: type.toLowerCase(),
                placeholder,
                label:
                    type === "HEADER"
                        ? `Encabezado · ${placeholder}`
                        : `${t("Mensaje")} · ${placeholder}`,
            });
        });
    });
    return fields;
}
