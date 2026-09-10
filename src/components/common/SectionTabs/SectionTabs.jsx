import styles from "./SectionTabs.module.css";


/**
 * SectionTabs
 *
 * Description:
 * - Renderizar navegación reutilizable entre secciones internas.
 *
 * Notes:
 * - Cada sección debe proporcionar una etiqueta visible.
 * - El identificador de una sección puede definirse mediante value o id.
 * - value se utiliza como formato principal para mantener compatibilidad
 *   con las páginas administrativas existentes.
 * - id permanece soportado para componentes que ya utilizan ese formato.
 * - onChange recibe exclusivamente el identificador de la sección.
 */
function SectionTabs({
    sections = [],
    activeSection,
    onChange,
}) {
    return (
        <div
            className={styles.sectionTabs}
            role="tablist"
            aria-label="Secciones"
        >
            {sections.map((section) => {
                const sectionValue = section.value ?? section.id;
                const isActive = activeSection === sectionValue;

                return (
                    <button
                        key={sectionValue}
                        className={`${styles.sectionTab} ${
                            isActive
                                ? styles.sectionTabActive
                                : ""
                        }`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(sectionValue)}
                    >
                        {section.label}
                    </button>
                );
            })}
        </div>
    );
}

export default SectionTabs;