import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./AvailableTemplateListItem.module.css";

/**
 * AvailableTemplateListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function AvailableTemplateListItem({
    item: template,
    selectedTemplateId,
    onSelect,
    getCategoryLabel,
}) {
    return (
        <Button
            key={template.id}
            className={`${styles.templateCard} ${String(selectedTemplateId) === String(template.id) ? styles.templateCardSelected : ""}`}
            type="button"
            onClick={() => onSelect?.(template)}
        >
            <div className={styles.templateIdentity}>
                <div className={styles.templateIcon}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M4 5h16v14H4Z" />
                        <path d="M8 9h8" />
                        <path d="M8 13h5" />
                    </svg>
                </div>

                <div>
                    <strong>{template.name}</strong>

                    <span>{template.language}</span>
                </div>
            </div>

            <div className={styles.badges}>
                <span className={styles.categoryBadge}>{getCategoryLabel(template.category)}</span>

                <span className={styles.approvedBadge}>Aprobada</span>
            </div>
        </Button>
    );
}

export default AvailableTemplateListItem;
