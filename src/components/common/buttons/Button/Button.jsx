import Spinner from "../../feedback/Spinner/Spinner.jsx";

import styles from "./Button.module.css";

/**
 * Button
 * Description: Render an action with consistent variants and busy semantics.
 * Notes: A supplied className preserves feature styling unless a variant is specified.
 */
function Button({
    children,
    className = "",
    variant = className ? "unstyled" : "primary",
    size = "medium",
    loading = false,
    icon = null,
    disabled = false,
    type = "button",
    ...props
}) {
    const appearance =
        variant === "unstyled" ? "" : `${styles.button} ${styles[variant]} ${styles[size]}`;

    return (
        <button
            {...props}
            type={type}
            className={`${appearance} ${className}`.trim() || undefined}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
        >
            {loading ? <Spinner /> : icon}
            {children}
        </button>
    );
}

export default Button;
