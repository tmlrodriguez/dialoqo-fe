import styles from "./LegalHero.module.css";

/**
 * LegalHero
 * Description: Present a page section with explicit data and action props.

 */
function LegalHero({ copy }) {
    return (
        <section className={styles.hero}>
            <div>
                <h1>{copy.title}</h1>

                {copy.updated && <span className={styles.updated}>{copy.updated}</span>}

                <p>{copy.intro}</p>

                {copy.description && <p className={styles.description}>{copy.description}</p>}
            </div>
        </section>
    );
}

export default LegalHero;
