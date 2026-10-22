import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./ManagedTemplateListItem.module.css";

/**
 * ManagedTemplateListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function ManagedTemplateListItem({
    item: template,
    selectedTemplate,
    handleSelectTemplate,
    isLoadingDetail,
    getCategoryLabel,
    getStatusLabel,
}) {
    return (
        <Button
            key={template.id}
            className={`${styles.templateCard} ${selectedTemplate?.id === template.id ? styles.templateCardActive : ""}`}
            type="button"
            onClick={() => handleSelectTemplate(template)}
            disabled={isLoadingDetail}
        >
            <div className={styles.templateCardMain}>
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
                        <path d="M5 4h14v16H5z" />
                        <path d="M8 8h8" />
                        <path d="M8 12h8" />
                    </svg>
                </div>

                <div className={styles.templateInformation}>
                    <strong>{template.name}</strong>

                    <span>
                        {template.language} · {getCategoryLabel(template.category)}
                    </span>
                </div>
            </div>

            <span
                className={`${styles.statusBadge} ${template.status === "APPROVED" ? styles.statusApproved : template.status === "REJECTED" ? styles.statusRejected : template.status === "PENDING" ? styles.statusPending : styles.statusNeutral}`}
            >
                {getStatusLabel(template.status)}
            </span>
        </Button>
    );
}

export default ManagedTemplateListItem;
