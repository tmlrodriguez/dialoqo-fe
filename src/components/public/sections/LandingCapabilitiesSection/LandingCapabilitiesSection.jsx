import { CAPABILITIES } from "../../../../data/landingContent.js";

import CapabilityList from "../../lists/CapabilityList/CapabilityList.jsx";

import styles from "./LandingCapabilitiesSection.module.css";

/**
 * LandingCapabilitiesSection
 * Description: Present a page section with explicit data and action props.

 */
function LandingCapabilitiesSection({ copy, currentLanguage }) {
    return (
        <section id="capabilities" className={styles.section}>
            <div className={styles.sectionInner}>
                <header className={styles.sectionHeader}>
                    <span className={styles.sectionEyebrow}>{copy.capabilityEyebrow}</span>
                    <h2>{copy.capabilityTitle}</h2>
                    <p>{copy.capabilityIntro}</p>
                </header>

                <div className={styles.cards}>
                    <CapabilityList items={CAPABILITIES} currentLanguage={currentLanguage} />
                </div>
            </div>
        </section>
    );
}

export default LandingCapabilitiesSection;
