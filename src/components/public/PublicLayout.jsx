import {
    ArrowRight,
    FileText,
    House,
    Mail,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { Link, Outlet } from "react-router-dom";

import LanguageSelector from "../common/LanguageSelector/LanguageSelector.jsx";

import { useLanguage } from "../../context/LanguageContext.jsx";

import dialoqoLogo from "../../assets/dialoqo-logo.png";

import styles from "./PublicLayout.module.css";


const COPY = {
    es: {
        tagline: "Comunicación empresarial centralizada",
        app: "Ingresar a Dialoqo",
        contact: "Contacto",
        privacy: "Política de privacidad",
        terms: "Términos",
        deletion: "Eliminación de datos",
        footer: "La comunicación de WhatsApp de tu empresa, visible y bajo control.",
        legal: "Legal",
        product: "Producto",
        home: "Inicio",
        copyright: "Todos los derechos reservados.",
    },

    en: {
        tagline: "Centralized business communication",
        app: "Open Dialoqo",
        contact: "Contact",
        privacy: "Privacy Policy",
        terms: "Terms",
        deletion: "Data Deletion",
        footer: "Your company's WhatsApp communication, visible and under control.",
        legal: "Legal",
        product: "Product",
        home: "Home",
        copyright: "All rights reserved.",
    },
};


function PublicLayout() {
    const { language } = useLanguage();
    const currentLanguage = language === "en" ? "en" : "es";
    const copy = COPY[currentLanguage];

    return (
        <div className={styles.publicShell}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <Link className={styles.brand} to="/" aria-label="Dialoqo">
                        <span className={styles.brandMark} aria-hidden="true">
                            <img src={dialoqoLogo} alt="" />
                        </span>

                        <span className={styles.brandText}>
                            <strong>Dialoqo</strong>
                            <small>{copy.tagline}</small>
                        </span>
                    </Link>

                    <nav className={styles.actions} aria-label="Public navigation">
                        <LanguageSelector compact />

                        <Link className={styles.contactLink} to="/contact">
                            <Mail size={15} strokeWidth={1.9} />
                            <span>{copy.contact}</span>
                        </Link>

                        <Link className={styles.appButton} to="/app">
                            <span>{copy.app}</span>
                            <ArrowRight size={16} strokeWidth={2} />
                        </Link>
                    </nav>
                </div>
            </header>

            <main className={styles.main}>
                <Outlet />
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerGlow} />

                <div className={styles.footerInner}>
                    <div className={styles.footerBrand}>
                        <Link className={styles.footerBrandLink} to="/" aria-label="Dialoqo">
                            <span className={styles.footerLogo}>
                                <img src={dialoqoLogo} alt="" />
                            </span>

                            <span>
                                <strong>Dialoqo</strong>
                                <small>{copy.tagline}</small>
                            </span>
                        </Link>

                        <p>{copy.footer}</p>

                        <small className={styles.copyright}>
                            © {new Date().getFullYear()} Dialoqo. {copy.copyright}
                        </small>
                    </div>

                    <div className={styles.footerNavigation}>
                        <div>
                            <span className={styles.footerNavigationTitle}>
                                {copy.product}
                            </span>

                            <nav>
                                <Link to="/">
                                    <House size={14} strokeWidth={1.8} />
                                    <span>{copy.home}</span>
                                </Link>

                                <Link to="/contact">
                                    <Mail size={14} strokeWidth={1.8} />
                                    <span>{copy.contact}</span>
                                </Link>

                                <Link to="/app">
                                    <ArrowRight size={14} strokeWidth={1.8} />
                                    <span>{copy.app}</span>
                                </Link>
                            </nav>
                        </div>

                        <div>
                            <span className={styles.footerNavigationTitle}>
                                {copy.legal}
                            </span>

                            <nav>
                                <Link to="/privacy">
                                    <ShieldCheck size={14} strokeWidth={1.8} />
                                    <span>{copy.privacy}</span>
                                </Link>

                                <Link to="/terms">
                                    <FileText size={14} strokeWidth={1.8} />
                                    <span>{copy.terms}</span>
                                </Link>

                                <Link to="/data-deletion">
                                    <Trash2 size={14} strokeWidth={1.8} />
                                    <span>{copy.deletion}</span>
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


export default PublicLayout;