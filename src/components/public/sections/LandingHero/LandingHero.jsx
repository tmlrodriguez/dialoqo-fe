import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import ConversationVisual from "../../visuals/ConversationVisual/ConversationVisual.jsx";

import StructureVisual from "../../visuals/StructureVisual/StructureVisual.jsx";

import styles from "./LandingHero.module.css";

/**
 * LandingHero
 * Description: Present the hero section with page-owned data and actions.

 */
function LandingHero({ copy }) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroGlowOne} />
            <div className={styles.heroGlowTwo} />
            <div className={styles.gridBackground} />

            <div className={styles.container}>
                <div className={styles.heroCopy}>
                    <span className={styles.eyebrow}>
                        <i />
                        {copy.eyebrow}
                    </span>

                    <h1>{copy.title}</h1>

                    <p className={styles.heroIntro}>{copy.intro}</p>

                    <div className={styles.heroActions}>
                        <a href="#capabilities" className={styles.primary}>
                            {copy.discover}
                            <ArrowRight size={17} strokeWidth={2} />
                        </a>

                        <Link to="/app" className={styles.secondary}>
                            {copy.app}
                        </Link>
                    </div>

                    <div className={styles.heroTrust}>
                        <span className={styles.trustLine} />
                        <span>{copy.trust}</span>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.visualGlow} />

                    <div className={styles.visualStack}>
                        <StructureVisual copy={copy} className={styles.structureVisual} />
                        <ConversationVisual copy={copy} className={styles.conversationVisual} />
                    </div>
                </div>
            </div>
        </section>
    );
}

export default LandingHero;
