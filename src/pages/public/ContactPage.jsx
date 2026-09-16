import { useEffect } from "react";

import { useLanguage } from "../../context/LanguageContext.jsx";

import styles from "./LegalPage.module.css";

const COPY = {
    es: {
        title: "Contacto",
        intro: "Información para soporte, privacidad, seguridad y solicitudes relacionadas con Dialoqo.",
        general: "Contacto general",
        company: "Empresa",
        product: "Producto",
        location: "Ubicación",
        privacy: "Privacidad y datos",
        privacyText: "Para solicitudes de privacidad, acceso, corrección o eliminación de datos, contáctanos utilizando el correo indicado. Incluye información suficiente para identificar la cuenta u organización correspondiente sin enviar información sensible innecesaria.",
        email: "Correo",
    },
    en: {
        title: "Contact",
        intro: "Contact information for support, privacy, security, and requests related to Dialoqo.",
        general: "General contact",
        company: "Company",
        product: "Product",
        location: "Location",
        privacy: "Privacy and data",
        privacyText: "For privacy, access, correction, or data-deletion requests, contact us using the email below. Include enough information to identify the relevant account or organization without sending unnecessary sensitive information.",
        email: "Email",
    },
};

function ContactPage() {
    const { language } = useLanguage();
    const copy = COPY[language] || COPY.es;

    useEffect(() => {
        document.title = `${copy.title} | Dialoqo`;
    }, [copy.title]);

    return (
        <>
            <section className={styles.hero}>
                <div>
                    <h1>{copy.title}</h1>
                    <p>{copy.intro}</p>
                </div>
            </section>

            <div className={styles.contactGrid}>
                <section>
                    <h2>{copy.general}</h2>
                    <p><strong>{copy.company}:</strong> Telemática, S. de R.L. de C.V.</p>
                    <p><strong>{copy.product}:</strong> Dialoqo</p>
                    <p><strong>{copy.location}:</strong> Choluteca, Honduras</p>
                    <p><strong>{copy.email}:</strong> <a href="mailto:telematica@telematica.hn">telematica@telematica.hn</a></p>
                </section>

                <section>
                    <h2>{copy.privacy}</h2>
                    <p>{copy.privacyText}</p>
                    <p><strong>{copy.email}:</strong> <a href="mailto:telematica@telematica.hn">telematica@telematica.hn</a></p>
                </section>
            </div>
        </>
    );
}

export default ContactPage;