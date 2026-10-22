import { ArrowRight } from "lucide-react";

import { Link } from "react-router-dom";

import styles from "./LandingCallToAction.module.css";

/**
 * LandingCallToAction
 * Description: Present a page section with explicit data and action props.

 */
function LandingCallToAction({ copy }) {
    return (
        <section className={styles.cta}>
            <div className={styles.ctaGlow} />

            <div className={styles.ctaInner}>
                <span className={styles.ctaEyebrow}>{copy.ctaEyebrow}</span>
                <h2>{copy.cta}</h2>
                <p>{copy.ctaText}</p>

                <div className={styles.heroActions}>
                    <Link className={styles.primary} to="/contact">
                        {copy.contact}
                        <ArrowRight size={17} strokeWidth={2} />
                    </Link>

                    <Link className={styles.secondary} to="/app">
                        {copy.openApp}
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default LandingCallToAction;
