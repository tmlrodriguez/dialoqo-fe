import { getFirstValue } from "../../../../utils/firstValue.js";

import styles from "./InteractiveMessageContent.module.css";

/**
 * InteractiveMessageContent
 * Description: Render a structured WhatsApp message without performing requests.
 */

function InteractiveMessageContent({ contentData, t }) {
    const interactiveType = String(contentData.type || "").toLowerCase();
    const reply =
        contentData.button_reply ||
        contentData.buttonReply ||
        contentData.list_reply ||
        contentData.listReply ||
        contentData.reply ||
        {};
    const title = getFirstValue(reply, ["title", "text", "name"]);
    const description = getFirstValue(reply, ["description", "subtitle"]);
    const identifier = getFirstValue(reply, ["id", "payload"]);
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
                    <path d="M5 5h14v14H5Z" />
                    <path d="M8 9h8" />
                    <path d="M8 13h5" />
                </svg>
            </div>

            <div className={styles.selectionInformation}>
                <span>
                    {interactiveType === "list_reply"
                        ? t("Opción seleccionada")
                        : t("Respuesta interactiva")}
                </span>

                <strong>{title || t("Respuesta recibida")}</strong>

                {description && <small>{description}</small>}

                {identifier && <small>ID: {identifier}</small>}
            </div>
        </div>
    );
}

export default InteractiveMessageContent;
