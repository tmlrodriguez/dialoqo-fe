import ConversationVisual from "../../visuals/ConversationVisual/ConversationVisual.jsx";

import styles from "./LandingMonitoringSection.module.css";

/**
 * LandingMonitoringSection
 * Description: Present a page section with explicit data and action props.

 */
function LandingMonitoringSection({ copy }) {
    return (
        <section className={styles.monitoringSection}>
            <div className={styles.split}>
                <div className={styles.sectionCopy}>
                    <span className={styles.sectionEyebrow}>{copy.visibilityEyebrow}</span>
                    <h2>{copy.visibilityTitle}</h2>
                    <p>{copy.visibilityIntro}</p>
                </div>

                <ConversationVisual copy={copy} className={styles.conversationVisual} />
            </div>
        </section>
    );
}

export default LandingMonitoringSection;
