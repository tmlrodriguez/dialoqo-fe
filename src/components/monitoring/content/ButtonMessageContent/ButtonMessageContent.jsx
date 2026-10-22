import { getFirstValue } from "../../../../utils/firstValue.js";

import styles from "./ButtonMessageContent.module.css";

/**
 * ButtonMessageContent
 * Description: Render a structured WhatsApp message without performing requests.
 */

function ButtonMessageContent({ contentData, t }) {
    const buttonData =
        contentData.button && typeof contentData.button === "object"
            ? contentData.button
            : contentData;
    const title = getFirstValue(buttonData, ["text", "title", "label"]);
    const payload = getFirstValue(buttonData, ["payload", "id"]);
    return (
        <div className={styles.selectionCard}>
            <div className={styles.selectionIcon}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <rect x="4" y="7" width="16" height="10" rx="2" />

                    <path d="M8 12h8" />
                </svg>
            </div>

            <div className={styles.selectionInformation}>
                <span>{t("Respuesta de botón")}</span>

                <strong>{title || t("Botón seleccionado")}</strong>

                {payload && <small>{payload}</small>}
            </div>
        </div>
    );
}

export default ButtonMessageContent;
