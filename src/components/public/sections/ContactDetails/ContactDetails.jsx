import styles from "./ContactDetails.module.css";

/**
 * ContactDetails
 * Description: Present the contactgrid section with page-owned data and actions.

 */
function ContactDetails({ copy }) {
    return (
        <div className={styles.contactGrid}>
            <section>
                <h2>{copy.general}</h2>
                <p>
                    <strong>{copy.company}:</strong> Telemática, S. de R.L. de C.V.
                </p>
                <p>
                    <strong>{copy.product}:</strong> Dialoqo
                </p>
                <p>
                    <strong>{copy.location}:</strong> Choluteca, Honduras
                </p>
                <p>
                    <strong>{copy.email}:</strong>{" "}
                    <a href="mailto:telematica@telematica.hn">telematica@telematica.hn</a>
                </p>
            </section>

            <section>
                <h2>{copy.privacy}</h2>
                <p>{copy.privacyText}</p>
                <p>
                    <strong>{copy.email}:</strong>{" "}
                    <a href="mailto:telematica@telematica.hn">telematica@telematica.hn</a>
                </p>
            </section>
        </div>
    );
}

export default ContactDetails;
