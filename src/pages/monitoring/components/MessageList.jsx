import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getMessages,
} from "../../../services/monitoring.js";

import MessageBubble from "./MessageBubble.jsx";

import styles from "./MessageList.module.css";
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * MessageList
 *
 * Description:
 * - Obtener y renderizar el historial de mensajes de una conversación.
 *
 * Notes:
 * - La primera solicitud obtiene los mensajes más recientes.
 * - Cada página se reorganiza cronológicamente antes del renderizado.
 * - Las páginas adicionales permiten cargar mensajes históricos.
 * - refreshKey permite actualizar los mensajes después de un envío o evento realtime.
 * - El contexto jerárquico se entrega a MessageBubble para permitir acceso seguro a multimedia.
 */
function MessageList({
    companyId,
    branchId,
    numberId,
    conversationId,
    refreshKey = 0,
    onError,
}) {
    const { t } = usePageTranslation();
    const [messages, setMessages] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(false);

    const [
        isLoadingOlder,
        setIsLoadingOlder,
    ] = useState(false);

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const [
        hasOlderMessages,
        setHasOlderMessages,
    ] = useState(false);

    const listRef =
        useRef(null);


    /**
     * normalizePage
     *
     * Description:
     * - Convertir una página descendente del backend en orden cronológico.
     */
    function normalizePage(results) {
        return [
            ...results,
        ].reverse();
    }


    /**
     * scrollToBottom
     *
     * Description:
     * - Desplazar el historial al mensaje más reciente.
     */
    function scrollToBottom() {
        const container =
            listRef.current;

        if (!container) {
            return;
        }

        container.scrollTop =
            container.scrollHeight;
    }


    /**
     * loadInitialMessages
     *
     * Description:
     * - Obtener la página inicial con los mensajes más recientes.
     */
    async function loadInitialMessages({
        showLoading = true,
        scrollAfterLoad = true,
    } = {}) {
        if (
            !companyId ||
            !branchId ||
            !numberId ||
            !conversationId
        ) {
            setMessages([]);
            setCurrentPage(1);
            setHasOlderMessages(false);

            return;
        }

        if (showLoading) {
            setIsLoading(true);
        }

        try {
            const response =
                await getMessages(
                    companyId,
                    branchId,
                    numberId,
                    conversationId,
                    {
                        ordering:
                            "-message_timestamp",
                        page: 1,
                        pageSize: 50,
                    }
                );

            const responseData =
                response?.data || {};

            const results =
                responseData.results || [];

            setMessages(
                normalizePage(
                    results
                )
            );

            setCurrentPage(1);

            setHasOlderMessages(
                Boolean(
                    responseData.next
                )
            );

            if (scrollAfterLoad) {
                requestAnimationFrame(
                    () => {
                        scrollToBottom();
                    }
                );
            }
        } catch (error) {
            if (showLoading) {
                setMessages([]);
            }

            onError?.(
                error.message ||
                t("No fue posible cargar los mensajes.")
            );
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }


    /**
     * loadOlderMessages
     *
     * Description:
     * - Obtener una página histórica y agregarla antes del contenido actual.
     */
    async function loadOlderMessages() {
        if (
            !hasOlderMessages ||
            isLoadingOlder
        ) {
            return;
        }

        const nextPage =
            currentPage + 1;

        const container =
            listRef.current;

        const previousScrollHeight =
            container?.scrollHeight || 0;

        setIsLoadingOlder(true);

        try {
            const response =
                await getMessages(
                    companyId,
                    branchId,
                    numberId,
                    conversationId,
                    {
                        ordering:
                            "-message_timestamp",
                        page: nextPage,
                        pageSize: 50,
                    }
                );

            const responseData =
                response?.data || {};

            const olderMessages =
                normalizePage(
                    responseData.results ||
                    []
                );

            setMessages(
                (
                    currentMessages
                ) => {
                    const existingIds =
                        new Set(
                            currentMessages.map(
                                (
                                    message
                                ) =>
                                    message.id
                            )
                        );

                    const uniqueOlderMessages =
                        olderMessages.filter(
                            (
                                message
                            ) =>
                                !existingIds.has(
                                    message.id
                                )
                        );

                    return [
                        ...uniqueOlderMessages,
                        ...currentMessages,
                    ];
                }
            );

            setCurrentPage(
                nextPage
            );

            setHasOlderMessages(
                Boolean(
                    responseData.next
                )
            );

            requestAnimationFrame(
                () => {
                    if (!container) {
                        return;
                    }

                    const newScrollHeight =
                        container.scrollHeight;

                    container.scrollTop =
                        newScrollHeight -
                        previousScrollHeight;
                }
            );
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible cargar mensajes anteriores.")
            );
        } finally {
            setIsLoadingOlder(false);
        }
    }


    /**
     * formatDateDivider
     *
     * Description:
     * - Obtener el texto utilizado para separar mensajes por fecha.
     */
    function formatDateDivider(
        value
    ) {
        if (!value) {
            return "";
        }

        const date =
            new Date(value);

        const today =
            new Date();

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const todayStart =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );

        const messageStart =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

        const difference =
            Math.round(
                (
                    todayStart -
                    messageStart
                ) /
                86400000
            );

        if (difference === 0) {
            return t("Hoy");
        }

        if (difference === 1) {
            return t("Ayer");
        }

        return new Intl.DateTimeFormat(
            getLanguageLocale(),
            {
                day: "numeric",
                month: "long",
                year:
                    date.getFullYear() !==
                    today.getFullYear()
                        ? "numeric"
                        : undefined,
            }
        ).format(date);
    }


    /**
     * isDifferentDay
     *
     * Description:
     * - Determinar si debe mostrarse un separador de fecha.
     */
    function isDifferentDay(
        currentMessage,
        previousMessage
    ) {
        if (!previousMessage) {
            return true;
        }

        const currentDate =
            new Date(
                currentMessage.message_timestamp
            );

        const previousDate =
            new Date(
                previousMessage.message_timestamp
            );

        if (
            Number.isNaN(
                currentDate.getTime()
            ) ||
            Number.isNaN(
                previousDate.getTime()
            )
        ) {
            return false;
        }

        return (
            currentDate.getFullYear() !==
                previousDate.getFullYear() ||
            currentDate.getMonth() !==
                previousDate.getMonth() ||
            currentDate.getDate() !==
                previousDate.getDate()
        );
    }


    useEffect(() => {
        setMessages([]);
        setCurrentPage(1);
        setHasOlderMessages(false);

        loadInitialMessages({
            showLoading: true,
            scrollAfterLoad: true,
        });
    }, [
        companyId,
        branchId,
        numberId,
        conversationId,
    ]);


    useEffect(() => {
        if (
            !companyId ||
            !branchId ||
            !numberId ||
            !conversationId ||
            refreshKey <= 0
        ) {
            return;
        }

        loadInitialMessages({
            showLoading: false,
            scrollAfterLoad: true,
        });
    }, [refreshKey]);


    if (isLoading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>

                <span>
                    {t("Cargando mensajes...")}
                </span>
            </div>
        );
    }


    if (messages.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" />
                    </svg>
                </div>

                <strong>
                    {t("No existen mensajes.")}
                </strong>

                <span>
                    Esta conversación todavía no contiene mensajes almacenados.
                </span>
            </div>
        );
    }


    return (
        <div
            ref={listRef}
            className={styles.messageList}
        >
            {hasOlderMessages && (
                <div className={styles.loadOlderContainer}>
                    <button
                        type="button"
                        onClick={loadOlderMessages}
                        disabled={
                            isLoadingOlder
                        }
                    >
                        {isLoadingOlder
                            ? t("Cargando...")
                            : "Cargar mensajes anteriores"}
                    </button>
                </div>
            )}

            {messages.map(
                (
                    message,
                    index
                ) => {
                    const previousMessage =
                        index > 0
                            ? messages[
                                index - 1
                            ]
                            : null;

                    const showDateDivider =
                        isDifferentDay(
                            message,
                            previousMessage
                        );

                    return (
                        <div key={message.id}>
                            {showDateDivider && (
                                <div className={styles.dateDivider}>
                                    <span>
                                        {formatDateDivider(
                                            message.message_timestamp
                                        )}
                                    </span>
                                </div>
                            )}

                            <MessageBubble
                                message={message}
                                companyId={companyId}
                                branchId={branchId}
                                numberId={numberId}
                                conversationId={conversationId}
                            />
                        </div>
                    );
                }
            )}
        </div>
    );
}


export default MessageList;
