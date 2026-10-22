import styles from "./Spinner.module.css";

/**
 * Spinner
 * Description: Render a decorative progress indicator alongside a visible status.
 */
function Spinner({ className = "", as: Element = "span" }) {
    return <Element className={className || styles.spinner} aria-hidden="true" />;
}

export default Spinner;
