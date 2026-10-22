import { getFirstValue } from "../../../../utils/firstValue.js";

import styles from "./ReactionMessageContent.module.css";

/**
 * ReactionMessageContent
 * Description: Render a structured WhatsApp message without performing requests.
 */

function ReactionMessageContent({ contentData, t, message }) {
    const reactionData =
        contentData.reaction && typeof contentData.reaction === "object"
            ? contentData.reaction
            : contentData;
    const emoji = getFirstValue(reactionData, ["emoji", "reaction"]);
    return (
        <div className={styles.reactionCard}>
            <span className={styles.reactionEmoji}>{emoji || "♡"}</span>

            <div className={styles.reactionInformation}>
                <strong>{t(t("Reacción"))}</strong>

                <span>
                    {message?.context_message_id
                        ? `${t("Mensaje relacionado")} #${message.context_message_id}`
                        : t("Mensaje relacionado")}
                </span>
            </div>
        </div>
    );
}

export default ReactionMessageContent;
