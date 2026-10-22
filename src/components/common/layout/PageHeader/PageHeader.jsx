import styles from "./PageHeader.module.css";

/**
 * PageHeader
 *
 * Description:
 * - Mostrar el encabezado principal de una página.
 *
 * Notes:
 * - Permite mostrar categoría, título, descripción y acciones opcionales.
 */
function PageHeader({ eyebrow, title, description, actions = null }) {
    return (
        <header className={styles.pageHeader}>
            <div className={styles.content}>
                {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}

                <h1>{title}</h1>

                {description && <p>{description}</p>}
            </div>

            {actions && <div className={styles.actions}>{actions}</div>}
        </header>
    );
}

export default PageHeader;
