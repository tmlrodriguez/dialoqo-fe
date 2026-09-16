import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getMediaAttachmentContent,
} from "../../../services/monitoring.js";

import styles from "./MessageMedia.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


const MAX_RETRIEVAL_ATTEMPTS = 10;

const RETRY_DELAYS = [
    0,
    1000,
    1500,
    2000,
    3000,
    4000,
    5000,
    6000,
    8000,
    10000,
];


/**
 * MessageMedia
 *
 * Description:
 * - Obtener y representar contenido multimedia privado asociado a un mensaje.
 *
 * Notes:
 * - El registro del adjunto puede llegar al frontend antes de que Celery termine
 *   de descargar y almacenar el binario desde Meta.
 * - El componente mantiene una ventana de recuperación automática mientras el
 *   archivo es preparado por el backend.
 * - Las respuestas pertenecientes a una ejecución anterior son ignoradas.
 * - La Object URL se libera cuando deja de utilizarse.
 */
function MessageMedia({
    companyId,
    branchId,
    numberId,
    conversationId,
    messageId,
    messageType,
    attachment,
}) {
    const { t } = usePageTranslation();
    const [objectUrl, setObjectUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const retryTimeoutRef = useRef(null);
    const objectUrlRef = useRef("");
    const requestGenerationRef = useRef(0);


    /**
     * clearRetryTimeout
     *
     * Description:
     * - Cancelar un intento diferido pendiente.
     */
    function clearRetryTimeout() {
        if (!retryTimeoutRef.current) {
            return;
        }

        window.clearTimeout(
            retryTimeoutRef.current
        );

        retryTimeoutRef.current = null;
    }


    /**
     * releaseObjectUrl
     *
     * Description:
     * - Liberar la Object URL temporal activa.
     */
    function releaseObjectUrl() {
        if (!objectUrlRef.current) {
            return;
        }

        URL.revokeObjectURL(
            objectUrlRef.current
        );

        objectUrlRef.current = "";
    }


    /**
     * formatSize
     *
     * Description:
     * - Convertir un tamaño binario a una representación legible.
     */
    function formatSize(size) {
        if (
            size === null ||
            size === undefined
        ) {
            return "";
        }

        const numericSize =
            Number(size);

        if (
            Number.isNaN(
                numericSize
            )
        ) {
            return "";
        }

        if (numericSize < 1024) {
            return `${numericSize} B`;
        }

        if (
            numericSize <
            1024 * 1024
        ) {
            return `${(
                numericSize /
                1024
            ).toFixed(1)} KB`;
        }

        return `${(
            numericSize /
            (1024 * 1024)
        ).toFixed(1)} MB`;
    }


    /**
     * getNormalizedType
     *
     * Description:
     * - Determinar el tipo visual del archivo.
     */
    function getNormalizedType() {
        const normalizedMessageType =
            String(
                messageType || ""
            ).toUpperCase();

        const mimeType =
            String(
                attachment?.mime_type || ""
            ).toLowerCase();

        if (
            normalizedMessageType === "IMAGE" ||
            normalizedMessageType === "STICKER" ||
            mimeType.startsWith("image/")
        ) {
            return "image";
        }

        if (
            normalizedMessageType === "VIDEO" ||
            mimeType.startsWith("video/")
        ) {
            return "video";
        }

        if (
            normalizedMessageType === "AUDIO" ||
            mimeType.startsWith("audio/")
        ) {
            return "audio";
        }

        return "document";
    }


    /**
     * scheduleRetry
     *
     * Description:
     * - Programar un nuevo intento mientras Celery prepara el archivo.
     */
    function scheduleRetry(
        nextAttempt,
        generation
    ) {
        if (
            generation !==
            requestGenerationRef.current
        ) {
            return;
        }

        if (
            nextAttempt >=
            MAX_RETRIEVAL_ATTEMPTS
        ) {
            setIsLoading(false);
            setIsRetrying(false);

            setErrorMessage(
                t("No fue posible obtener el archivo multimedia.")
            );

            return;
        }

        const delay =
            RETRY_DELAYS[nextAttempt] ??
            10000;

        setIsLoading(false);
        setIsRetrying(true);

        retryTimeoutRef.current =
            window.setTimeout(
                () => {
                    loadAttachment(
                        nextAttempt,
                        generation
                    );
                },
                delay
            );
    }


    /**
     * loadAttachment
     *
     * Description:
     * - Recuperar el binario privado del backend.
     *
     * Notes:
     * - Un error puede representar simplemente que Celery todavía está
     *   descargando el archivo desde Meta.
     * - Se ignoran resultados pertenecientes a generaciones anteriores.
     */
    async function loadAttachment(
        currentAttempt,
        generation
    ) {
        if (
            generation !==
            requestGenerationRef.current
        ) {
            return;
        }

        if (
            !companyId ||
            !branchId ||
            !numberId ||
            !conversationId ||
            !messageId ||
            !attachment?.id
        ) {
            setIsLoading(false);
            setIsRetrying(false);

            return;
        }

        clearRetryTimeout();

        if (currentAttempt === 0) {
            setIsLoading(true);
            setIsRetrying(false);
        } else {
            setIsLoading(false);
            setIsRetrying(true);
        }

        setErrorMessage("");

        try {
            const blob =
                await getMediaAttachmentContent(
                    companyId,
                    branchId,
                    numberId,
                    conversationId,
                    messageId,
                    attachment.id
                );

            if (
                generation !==
                requestGenerationRef.current
            ) {
                return;
            }

            if (
                !blob ||
                blob.size === 0
            ) {
                throw new Error(
                    t("El archivo multimedia todavía no está disponible.")
                );
            }

            releaseObjectUrl();

            const url =
                URL.createObjectURL(
                    blob
                );

            objectUrlRef.current =
                url;

            setObjectUrl(url);
            setIsLoading(false);
            setIsRetrying(false);
            setErrorMessage("");
        } catch {
            if (
                generation !==
                requestGenerationRef.current
            ) {
                return;
            }

            scheduleRetry(
                currentAttempt + 1,
                generation
            );
        }
    }


    /**
     * handleManualRetry
     *
     * Description:
     * - Reiniciar manualmente la recuperación del archivo.
     */
    function handleManualRetry() {
        clearRetryTimeout();

        requestGenerationRef.current += 1;

        const generation =
            requestGenerationRef.current;

        releaseObjectUrl();

        setObjectUrl("");
        setErrorMessage("");
        setIsLoading(true);
        setIsRetrying(false);

        loadAttachment(
            0,
            generation
        );
    }


    /**
     * handleOpenContent
     *
     * Description:
     * - Abrir el contenido en una nueva pestaña.
     */
    function handleOpenContent() {
        if (!objectUrl) {
            return;
        }

        window.open(
            objectUrl,
            "_blank",
            "noopener,noreferrer"
        );
    }


    useEffect(() => {
        clearRetryTimeout();
        releaseObjectUrl();

        requestGenerationRef.current += 1;

        const generation =
            requestGenerationRef.current;

        setObjectUrl("");
        setErrorMessage("");
        setIsLoading(true);
        setIsRetrying(false);

        loadAttachment(
            0,
            generation
        );

        return () => {
            requestGenerationRef.current += 1;

            clearRetryTimeout();
            releaseObjectUrl();
        };
    }, [
        companyId,
        branchId,
        numberId,
        conversationId,
        messageId,
        attachment?.id,
    ]);


    if (
        isLoading ||
        isRetrying
    ) {
        return (
            <div className={styles.loading}>
                <span className={styles.spinner}></span>

                <span>
                    {isRetrying
                        ? t("Preparando archivo...")
                        : t("Cargando archivo...")}
                </span>
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
                        <circle
                            cx="12"
                            cy="12"
                            r="9"
                        />

                        <path d="M12 8v5" />
                        <path d="M12 17h.01" />
                    </svg>

                    <span>
                        {errorMessage}
                    </span>
                </div>

                <button
                    type="button"
                    className={styles.retryButton}
                    onClick={handleManualRetry}
                >
                    {t("Reintentar")}
                </button>
            </div>
        );
    }


    if (!objectUrl) {
        return null;
    }


    const normalizedType =
        getNormalizedType();

    const filename =
        attachment?.original_filename ||
        t("Archivo de WhatsApp");

    const formattedSize =
        formatSize(
            attachment?.size
        );


    if (normalizedType === "image") {
        return (
            <button
                className={styles.imageButton}
                type="button"
                onClick={handleOpenContent}
                aria-label={t("Abrir imagen")}
            >
                <img
                    className={styles.image}
                    src={objectUrl}
                    alt={filename}
                />
            </button>
        );
    }


    if (normalizedType === "video") {
        return (
            <div className={styles.videoContainer}>
                <video
                    className={styles.video}
                    src={objectUrl}
                    controls
                    preload="metadata"
                >
                    Su navegador no soporta reproducción de video.
                </video>
            </div>
        );
    }


    if (normalizedType === "audio") {
        return (
            <div className={styles.audioContainer}>
                <audio
                    className={styles.audio}
                    src={objectUrl}
                    controls
                    preload="metadata"
                >
                    Su navegador no soporta reproducción de audio.
                </audio>
            </div>
        );
    }


    return (
        <button
            className={styles.document}
            type="button"
            onClick={handleOpenContent}
        >
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
                <strong>
                    {filename}
                </strong>

                <span>
                    {[
                        attachment?.mime_type,
                        formattedSize,
                    ]
                        .filter(Boolean)
                        .join(" · ")}
                </span>
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
        </button>
    );
}


export default MessageMedia;
