import Button from "../../../common/buttons/Button/Button.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import AvailableTemplateList from "../../lists/AvailableTemplateList/AvailableTemplateList.jsx";

import styles from "./TemplatePickerView.module.css";

/**
 * TemplatePickerView
 * Description: Render monitoring state and delegate resource operations to its controller.
 */
function TemplatePickerView({
    t,
    onClose,
    search,
    handleSearchChange,
    isLoading,
    templates,
    selectedTemplateId,
    onSelect,
    getCategoryLabel,
}) {
    return (
        <section className={styles.picker}>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>WhatsApp</span>

                    <h3>{t("Seleccionar plantilla")}</h3>

                    <p>
                        {t("Seleccione una plantilla aprobada para enviarla en esta conversación.")}
                    </p>
                </div>

                <Button
                    className={styles.closeButton}
                    type="button"
                    onClick={onClose}
                    aria-label={t("Cerrar selector de plantillas")}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m6 6 12 12" />
                        <path d="m18 6-12 12" />
                    </svg>
                </Button>
            </header>

            <div className={styles.searchContainer}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" />

                    <path d="m20 20-3.5-3.5" />
                </svg>

                <Input
                    type="search"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder={t("Buscar plantilla...")}
                />
            </div>

            <div className={styles.list}>
                {isLoading ? (
                    <div className={styles.loadingState}>
                        <span className={styles.spinner}></span>

                        <span>{t("Cargando plantillas...")}</span>
                    </div>
                ) : templates.length === 0 ? (
                    <div className={styles.emptyState}>
                        <strong>{t("No existen plantillas disponibles.")}</strong>

                        <span>{t("No se encontraron plantillas aprobadas para este número.")}</span>
                    </div>
                ) : (
                    <AvailableTemplateList
                        items={templates}
                        selectedTemplateId={selectedTemplateId}
                        onSelect={onSelect}
                        getCategoryLabel={getCategoryLabel}
                    />
                )}
            </div>
        </section>
    );
}

export default TemplatePickerView;
