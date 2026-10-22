import { Plus, Send, UserRound } from "lucide-react";

import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./ConversationVisual.module.css";

function ConversationVisual({ copy, className = "" }) {
    return (
        <div className={`${styles.conversationVisual} ${className}`}>
            <div className={styles.conversationHeader}>
                <div>
                    <span className={styles.memberAvatar}>
                        <UserRound size={17} strokeWidth={2} />
                    </span>

                    <div>
                        <small>{copy.current}</small>
                        <strong>Luis Rodriguez</strong>
                    </div>
                </div>

                <span className={styles.onlineBadge}>
                    <i />
                    {copy.connected}
                </span>
            </div>

            <div className={styles.conversationBody}>
                <div className={styles.messageIncoming}>
                    <p>{copy.messageOne}</p>
                    <small>10:41</small>
                </div>

                <div className={styles.messageOutgoing}>
                    <p>{copy.messageTwo}</p>
                    <small>10:42</small>
                </div>

                <div className={styles.messageIncomingSmall}>
                    <p>{copy.messageThree}</p>
                    <small>10:43</small>
                </div>
            </div>

            <div className={styles.composerPreview}>
                <span>
                    <Plus size={16} strokeWidth={2.1} />
                </span>

                <div />

                <Button variant="unstyled" type="button" aria-label="Send">
                    <Send size={14} strokeWidth={2} />
                </Button>
            </div>
        </div>
    );
}

export default ConversationVisual;
