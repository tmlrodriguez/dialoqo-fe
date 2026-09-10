import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getMediaAttachmentContent,
} from "../../../services/monitoring.js";

import styles from "./MessageMedia.module.css";


const MAX_RETRIEVAL_ATTEMPTS = 5;

const RETRY_DELAYS = [
    0,
    1000,
    2000,
    4000,
    8000,
];


/**
 * MessageMedia
 *
 * Description:
 * - Obtener y representar contenido multimedia privado asociado a un mensaje.
 *
 * Notes:
 * - El archivo se obtiene mediante un endpoint autenticado.
 * - El navegador utiliza una Object URL temporal para renderizar el Blob.
 * - La Object URL se libera cuando deja de utilizarse.
 * - La recuperación se reintenta automáticamente porque el binario puede no estar disponible inmediatamente después del webhook.
 * - Soporta imágenes, stickers, video, audio y documentos.
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
    const [objectUrl, setObjectUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [attempt, setAttempt] = useState(0);

    const retryTimeoutRef = useRef(null);
    const objectUrlRef = useRef("");


    /**
     * clearRetryTimeout
     *
     * Description:
     * - Cancelar un intento diferido pendiente.
     */
    function clearRetryTimeout() {
        if (retryTimeoutRef.current) {
            window.clearTimeout(
                retryTimeoutRef.current
            );

            retryTimeoutRef.current = null;
        }
    }


    /**
     * releaseObjectUrl
     *
     * Description:
     * - Liberar la URL temporal actualmente utilizada por el navegador.
     */
    function releaseObjectUrl() {
        if (!objectUrlRef.current) {
            return;
        }

        URL.revokeObjectURL(
            objectUrlRef.current
        );

        objectUrlRef.current = "";

        setObjectUrl("");
    }


    /**
     * scheduleRetry
     *
     * Description:
     * - Programar un nuevo intento de recuperación del archivo.
     */
    function scheduleRetry(nextAttempt) {
        if (
            nextAttempt >=
            MAX_RETRIEVAL_ATTEMPTS
        ) {
            setIsLoading(false);
            setIsRetrying(false);

            setErrorMessage(
                "No fue posible obtener el archivo multimedia."
            );

            return;
        }

        const delay =
            RETRY_DELAYS[nextAttempt] ??
            8000;

        setIsLoading(false);
        setIsRetrying(true);

        retryTimeoutRef.current =
            window.setTimeout(
                () => {
                    loadAttachment(
                        nextAttempt
                    );
                },
                delay
            );
    }


    /**
     * loadAttachment
     *
     * Description:
     * - Obtener el archivo binario protegido desde CentralChat.
     *
     * Notes:
     * - Los errores iniciales son tratados como potencialmente transitorios.
     */
    async function loadAttachment(
        currentAttempt = 0
    ) {
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

        setAttempt(currentAttempt);
        setErrorMessage("");

        if (currentAttempt === 0) {
            setIsLoading(true);
            setIsRetrying(false);
        } else {
            setIsLoading(false);
            setIsRetrying(true);
        }

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
            scheduleRetry(
                currentAttempt + 1
            );
        }
    }


    /**
     * handleManualRetry
     *
     * Description:
     * - Reiniciar manualmente la recuperación después de agotar los intentos automáticos.
     */
    function handleManualRetry() {
        clearRetryTimeout();

        setAttempt(0);
        setErrorMessage("");
        setIsLoading(true);
        setIsRetrying(false);

        loadAttachment(0);
    }


    /**
     * formatSize
     *
     * Description:
     * - Convertir el tamaño binario a una representación legible.
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
     * - Determinar el tipo visual utilizando message_type y MIME type.
     */
    function getNormalizedType() {
        const normalizedMessageType =
            String(
                messageType || ""
            ).toUpperCase();

        const mimeType =
            attachment?.mime_type || "";

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
     * handleOpenContent
     *
     * Description:
     * - Abrir el contenido Blob en una nueva pestaña.
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
        setAttempt(0);
        setErrorMessage("");
        setObjectUrl("");

        loadAttachment(0);

        return () => {
            clearRetryTimeout();

            if (
                objectUrlRef.current
            ) {
                URL.revokeObjectURL(
                    objectUrlRef.current
                );

                objectUrlRef.current =
                    "";
            }
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
                        ? "Preparando archivo..."
                        : "Cargando archivo..."}
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
                    Reintentar
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
        "Archivo de WhatsApp";

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
                aria-label="Abrir imagen"
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