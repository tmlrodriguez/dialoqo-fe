import Button from "../../../common/buttons/Button/Button.jsx";

import styles from "./MessageMediaView.module.css";

/**
 * MessageMediaView
 * Description: Render monitoring state and delegate resource operations to its controller.
 */
function MessageMediaView({
    isLoading,
    isRetrying,
    t,
    errorMessage,
    handleManualRetry,
    objectUrl,
    getNormalizedType,
    attachment,
    formatSize,
    handleOpenContent,
}) {
    if (isLoading || isRetrying) {
        return (
            <div className={styles.loading}>
                <span className={styles.spinner}></span>

                <span>{isRetrying ? t("Preparando archivo...") : t("Cargando archivo...")}</span>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className={styles.error}>
                <div className={styles.errorInformation}>
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

                        <path d="M12 8v5" />
                        <path d="M12 17h.01" />
                    </svg>

                    <span>{errorMessage}</span>
                </div>

                <Button type="button" className={styles.retryButton} onClick={handleManualRetry}>
                    {t("Reintentar")}
                </Button>
            </div>
        );
    }

    if (!objectUrl) {
        return null;
    }

    const normalizedType = getNormalizedType();

    const filename = attachment?.original_filename || t("Archivo de WhatsApp");

    const formattedSize = formatSize(attachment?.size);

    if (normalizedType === "image") {
        return (
            <Button
                className={styles.imageButton}
                type="button"
                onClick={handleOpenContent}
                aria-label={t("Abrir imagen")}
            >
                <img className={styles.image} src={objectUrl} alt={filename} />
            </Button>
        );
    }

    if (normalizedType === "video") {
        return (
            <div className={styles.videoContainer}>
                <video className={styles.video} src={objectUrl} controls preload="metadata">
                    Su navegador no soporta reproducción de video.
                </video>
            </div>
        );
    }

    if (normalizedType === "audio") {
        return (
            <div className={styles.audioContainer}>
                <audio className={styles.audio} src={objectUrl} controls preload="metadata">
                    Su navegador no soporta reproducción de audio.
                </audio>
            </div>
        );
    }

    return (
        <Button className={styles.document} type="button" onClick={handleOpenContent}>
            <div className={styles.documentIcon}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M6 2.5h8l4 4V21H6Z" />
                    <path d="M14 2.5V7h4" />
                </svg>
            </div>

            <div className={styles.documentInformation}>
                <strong>{filename}</strong>

                <span>{[attachment?.mime_type, formattedSize].filter(Boolean).join(" · ")}</span>
            </div>

            <svg
                className={styles.openIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M14 5h5v5" />
                <path d="m10 14 9-9" />
                <path d="M19 13v6H5V5h6" />
            </svg>
        </Button>
    );
}

export default MessageMediaView;
