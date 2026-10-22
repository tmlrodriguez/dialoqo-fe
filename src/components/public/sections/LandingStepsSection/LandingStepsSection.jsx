import { STEPS } from "../../../../data/landingContent.js";

import StepList from "../../lists/StepList/StepList.jsx";

import styles from "./LandingStepsSection.module.css";

/**
 * LandingStepsSection
 * Description: Present a page section with explicit data and action props.

 */
function LandingStepsSection({ copy, currentLanguage }) {
    return (
        <section className={styles.stepsSection}>
            <div className={styles.sectionInner}>
                <header className={styles.sectionHeader}>
                    <span className={styles.sectionEyebrow}>{copy.howEyebrow}</span>
                    <h2>{copy.howTitle}</h2>
                    <p>{copy.howIntro}</p>
                </header>

                <div className={styles.steps}>
                    <StepList items={STEPS} currentLanguage={currentLanguage} />
                </div>
            </div>
        </section>
    );
}

export default LandingStepsSection;
