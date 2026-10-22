import styles from "./ContactHero.module.css";

/**
 * ContactHero
 * Description: Present a page section with explicit data and action props.

 */
function ContactHero({ copy }) {
    return (
        <section className={styles.hero}>
            <div>
                <h1>{copy.title}</h1>
                <p>{copy.intro}</p>
            </div>
        </section>
    );
}

export default ContactHero;
