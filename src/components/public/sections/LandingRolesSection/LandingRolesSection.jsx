import { Eye, Radio, ShieldCheck, UsersRound } from "lucide-react";

import styles from "./LandingRolesSection.module.css";

/**
 * LandingRolesSection
 * Description: Present the rolessection section with page-owned data and actions.

 */
function LandingRolesSection({ copy }) {
    return (
        <section className={styles.rolesSection}>
            <div className={styles.securityGrid}>
                <article>
                    <span className={styles.featureIcon}>
                        <ShieldCheck size={23} strokeWidth={1.8} />
                    </span>
                    <h3>{copy.administrator}</h3>
                    <p>{copy.administratorText}</p>
                </article>

                <article>
                    <span className={styles.featureIcon}>
                        <Eye size={23} strokeWidth={1.8} />
                    </span>
                    <h3>{copy.monitor}</h3>
                    <p>{copy.monitorText}</p>
                </article>

                <article>
                    <span className={styles.featureIcon}>
                        <UsersRound size={23} strokeWidth={1.8} />
                    </span>
                    <h3>{copy.member}</h3>
                    <p>{copy.memberText}</p>
                </article>

                <article>
                    <span className={`${styles.featureIcon} ${styles.realtimeIcon}`}>
                        <Radio size={23} strokeWidth={1.8} />
                    </span>
                    <h3>{copy.realtime}</h3>
                    <p>{copy.realtimeText}</p>
                </article>
            </div>
        </section>
    );
}

export default LandingRolesSection;
