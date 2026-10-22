import styles from "./UnsupportedContent.module.css";

/**
 * UnsupportedContent
 * Description: Show a readable fallback for an unsupported message payload.
 */

function UnsupportedContent({ title, description }) {
    return (
        <div className={styles.unsupported}>
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="9" />

                <path d="M9.5 9a2.5 2.5 0 0 1 4.7 1.2c0 1.8-2.2 2.1-2.2 3.8" />

                <path d="M12 17h.01" />
            </svg>

            <div>
                <strong>{title}</strong>

                <span>{description}</span>
            </div>
        </div>
    );
}

export default UnsupportedContent;
