import {
    useEffect,
    useState,
} from "react";

import {
    markConversationAsRead,
} from "../../../services/monitoring.js";

import MessageComposer from "./MessageComposer.jsx";
import MessageList from "./MessageList.jsx";

import styles from "./ConversationPanel.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * ConversationPanel
 *
 * Description:
 * - Mostrar la conversación seleccionada y permitir interacción según las capacidades del usuario.
 *
 * Notes:
 * - Al abrir una conversación se marca como leída para el usuario autenticado.
 * - MONITOR consulta la conversación en modo lectura.
 * - MEMBER puede responder mediante texto o plantillas cuando el backend lo autoriza.
 * - El historial puede refrescarse después de enviar mensajes de texto o plantillas.
 * - Los eventos realtime pueden solicitar una recarga adicional del historial.
 */
function ConversationPanel({
    companyId,
    branchId,
    numberId,
    conversation,
    canSendMessages = false,
    realtimeRefreshKey = 0,
    onBack,
    onConversationRead,
    onMessageSent,
    onError,
}) {
    const { t } = usePageTranslation();
    const [
        isMarkingRead,
        setIsMarkingRead,
    ] = useState(false);

    const [
        messageRefreshKey,
        setMessageRefreshKey,
    ] = useState(0);


    /**
     * getCustomerName
     *
     * Description:
     * - Obtener la identidad visible del cliente.
     */
    function getCustomerName() {
        const customer =
            conversation?.customer ||
            {};

        return (
            customer.display_name ||
            customer.profile_name ||
            customer.phone_number ||
            "Cliente"
        );
    }


    /**
     * getAssignmentName
     *
     * Description:
     * - Obtener el miembro actualmente responsable del número.
     */
    function getAssignmentName() {
        const member =
            conversation
                ?.current_assignment
                ?.member;

        if (!member) {
            return "";
        }

        const fullName = [
            member.first_name,
            member.last_name,
        ]
            .filter(Boolean)
            .join(" ");

        return (
            fullName ||
            member.member_code ||
            ""
        );
    }


    /**
     * markAsRead
     *
     * Description:
     * - Marcar la conversación abierta como leída.
     */
    async function markAsRead() {
        if (
            !companyId ||
            !branchId ||
            !numberId ||
            !conversation?.id ||
            isMarkingRead
        ) {
            return;
        }

        setIsMarkingRead(true);

        try {
            await markConversationAsRead(
                companyId,
                branchId,
                numberId,
                conversation.id
            );

            onConversationRead?.(
                conversation.id
            );
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible marcar la conversación como leída.")
            );
        } finally {
            setIsMarkingRead(false);
        }
    }


    /**
     * handleMessageSent
     *
     * Description:
     * - Actualizar el historial después de un envío exitoso.
     */
    function handleMessageSent(
        message
    ) {
        setMessageRefreshKey(
            (currentValue) =>
                currentValue + 1
        );

        onMessageSent?.(
            message
        );
    }


    useEffect(() => {
        setMessageRefreshKey(0);

        if (conversation?.id) {
            markAsRead();
        }
    }, [
        companyId,
        branchId,
        numberId,
        conversation?.id,
    ]);


    if (!conversation) {
        return (
            <div className={styles.emptyPanel}>
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
                        <path d="M8 10h8" />
                        <path d="M8 14h5" />
                    </svg>
                </div>

                <span className={styles.eyebrow}>
                    {t("Conversaciones")}
                </span>

                <h2>
                    Seleccione una conversación
                </h2>

                <p>
                    {canSendMessages
                        ? t("Seleccione una conversación del panel izquierdo para consultar su historial y enviar mensajes.")
                        : t("Seleccione una conversación del panel izquierdo para consultar su historial.")}
                </p>
            </div>
        );
    }


    const customer =
        conversation.customer || {};

    const assignmentName =
        getAssignmentName();

    const combinedRefreshKey =
        messageRefreshKey +
        realtimeRefreshKey;


    return (
        <section className={styles.conversationPanel}>
            <header className={styles.header}>
                <div className={styles.customerIdentity}>
                    {onBack && (
                        <button className={styles.mobileBackButton} type="button" onClick={onBack} aria-label={t("Regresar a conversaciones")}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                    )}
                    <div className={styles.avatar}>
                        {getCustomerName()
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className={styles.customerInformation}>
                        <strong>
                            {getCustomerName()}
                        </strong>

                        <span>
                            {customer.phone_number ||
                                ""}
                        </span>
                    </div>
                </div>

                <div className={styles.headerMetadata}>
                    {assignmentName && (
                        <div className={styles.assignment}>
                            <span>
                                {t("Responsable")}
                            </span>

                            <strong>
                                {assignmentName}
                            </strong>
                        </div>
                    )}

                    {isMarkingRead && (
                        <span className={styles.readingState}>
                            Marcando como leída...
                        </span>
                    )}
                </div>
            </header>

            <MessageList
                companyId={companyId}
                branchId={branchId}
                numberId={numberId}
                conversationId={
                    conversation.id
                }
                refreshKey={
                    combinedRefreshKey
                }
                onError={onError}
            />

            {canSendMessages && (
                <MessageComposer
                    companyId={companyId}
                    branchId={branchId}
                    numberId={numberId}
                    conversationId={conversation.id}
                    onMessageSent={handleMessageSent}
                    onError={onError}
                />
            )}
        </section>
    );
}


export default ConversationPanel;
