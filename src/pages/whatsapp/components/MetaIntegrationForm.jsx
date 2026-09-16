import { useEffect, useState } from "react";

import {
    createMetaIntegration,
    deactivateMetaIntegration,
    getMetaIntegration,
    getMetaIntegrations,
    updateMetaIntegration,
    validateMetaIntegration,
} from "../../../services/whatsapp.js";

import styles from "./MetaIntegrationForm.module.css";
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * MetaIntegrationForm
 *
 * Description:
 * - Administrar la conexión de una empresa con la plataforma Meta utilizada por Dialoqo.
 *
 * Notes:
 * - Cada empresa mantiene una única conexión de Meta.
 * - La Meta App pertenece globalmente a Dialoqo.
 * - El Meta App ID es informativo y controlado exclusivamente por el backend.
 * - Access tokens, App Secret y Verify Token permanecen exclusivamente en el backend.
 * - Los administradores nunca administran credenciales sensibles de Meta.
 * - La desconexión no elimina ni desactiva el registro MetaIntegration.
 * - El backend es autoritativo sobre el estado real de conexión.
 */
function MetaIntegrationForm({
    companyId,
    onError,
    onSuccess,
}) {
    const { t } = usePageTranslation();
    const [integration, setIntegration] = useState(null);
    const [notes, setNotes] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);


    /**
     * clearParentMessages
     *
     * Description:
     * - Limpiar los mensajes administrados por la página padre.
     */
    function clearParentMessages() {
        onError?.("");
        onSuccess?.("");
    }


    /**
     * resetConnection
     *
     * Description:
     * - Restablecer el estado local de la conexión.
     *
     * Notes:
     * - Debe utilizarse únicamente cuando realmente no existe un MetaIntegration.
     */
    function resetConnection() {
        setIntegration(null);
        setNotes("");
    }


    /**
     * applyIntegrationDetail
     *
     * Description:
     * - Aplicar al estado local el detalle completo de una conexión Meta.
     */
    function applyIntegrationDetail(integrationDetail) {
        setIntegration(integrationDetail);
        setNotes(integrationDetail?.notes || "");
    }


    /**
     * loadIntegrationDetail
     *
     * Description:
     * - Obtener el detalle completo de la conexión Meta de la empresa.
     */
    async function loadIntegrationDetail(integrationId) {
        if (!companyId || !integrationId) {
            return;
        }

        setIsLoadingDetail(true);

        try {
            const response = await getMetaIntegration(
                companyId,
                integrationId
            );

            const integrationDetail = response?.data;

            if (!integrationDetail) {
                throw new Error(
                    t("No fue posible obtener el detalle de la conexión con Meta.")
                );
            }

            applyIntegrationDetail(integrationDetail);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible cargar la conexión con Meta.")
            );
        } finally {
            setIsLoadingDetail(false);
        }
    }


    /**
     * loadIntegration
     *
     * Description:
     * - Obtener la conexión Meta correspondiente a la empresa seleccionada.
     *
     * Notes:
     * - Solo se espera una conexión activa por empresa.
     * - Una conexión desconectada continúa existiendo y debe seguir mostrándose.
     */
    async function loadIntegration() {
        if (!companyId) {
            resetConnection();
            return;
        }

        setIsLoading(true);
        clearParentMessages();

        try {
            const response = await getMetaIntegrations(companyId);
            const integrations = response?.data || [];
            const currentIntegration = integrations[0] || null;

            if (!currentIntegration) {
                resetConnection();
                return;
            }

            await loadIntegrationDetail(currentIntegration.id);
        } catch (error) {
            resetConnection();

            onError?.(
                error.message ||
                t("No fue posible cargar la conexión con Meta.")
            );
        } finally {
            setIsLoading(false);
        }
    }


    /**
     * handleCreateConnection
     *
     * Description:
     * - Crear el contexto inicial de conexión Meta para la empresa.
     *
     * Notes:
     * - Esta operación se ejecuta solamente cuando todavía no existe un MetaIntegration.
     * - La creación del contexto no significa necesariamente que la conexión ya esté validada.
     * - Las credenciales y la Meta App son proporcionadas globalmente por Dialoqo.
     */
    async function handleCreateConnection() {
        if (!companyId || isSaving || integration) {
            return;
        }

        setIsSaving(true);
        clearParentMessages();

        try {
            const response = await createMetaIntegration(
                companyId,
                {
                    notes: notes.trim(),
                }
            );

            const createdIntegration = response?.data;

            onSuccess?.(
                response?.success_message ||
                t("Conexión con Meta creada correctamente.")
            );

            if (createdIntegration?.id) {
                await loadIntegrationDetail(
                    createdIntegration.id
                );
            } else {
                await loadIntegration();
            }
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible crear la conexión con Meta.")
            );

            await loadIntegration();
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleSaveNotes
     *
     * Description:
     * - Actualizar la información administrativa de la conexión.
     *
     * Notes:
     * - Esta operación no modifica el estado de conexión.
     */
    async function handleSaveNotes(event) {
        event.preventDefault();

        if (!companyId || !integration || isSaving) {
            return;
        }

        setIsSaving(true);
        clearParentMessages();

        try {
            const response = await updateMetaIntegration(
                companyId,
                integration.id,
                {
                    notes: notes.trim(),
                }
            );

            onSuccess?.(
                response?.success_message ||
                t("Información de la conexión actualizada correctamente.")
            );

            await loadIntegrationDetail(
                integration.id
            );
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible actualizar la conexión con Meta.")
            );
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleValidate
     *
     * Description:
     * - Validar o restablecer la conexión de la empresa con Meta.
     *
     * Notes:
     * - El backend utiliza las credenciales globales de Dialoqo.
     * - El administrador nunca proporciona tokens o secretos.
     * - El backend es autoritativo sobre is_connected, connected_at y disconnected_at.
     * - El recurso se vuelve a consultar después de completar la operación.
     */
    async function handleValidate() {
        if (
            !companyId ||
            !integration ||
            isValidating
        ) {
            return;
        }

        setIsValidating(true);
        clearParentMessages();

        try {
            const response = await validateMetaIntegration(
                companyId,
                integration.id
            );

            onSuccess?.(
                response?.success_message ||
                (
                    integration.is_connected
                        ? t("Conexión con Meta verificada correctamente.")
                        : t("Conexión con Meta establecida correctamente.")
                )
            );

            await loadIntegrationDetail(
                integration.id
            );
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible validar la conexión con Meta.")
            );

            try {
                await loadIntegrationDetail(
                    integration.id
                );
            } catch {
                // El error principal ya fue comunicado al usuario.
            }
        } finally {
            setIsValidating(false);
        }
    }


    /**
     * handleDisconnect
     *
     * Description:
     * - Desconectar de Meta la conexión existente de la empresa.
     *
     * Notes:
     * - El registro MetaIntegration permanece activo.
     * - La operación únicamente modifica el estado de conexión.
     * - La conexión puede volver a validarse posteriormente.
     * - El estado completo se recarga desde el backend después de desconectar.
     */
    async function handleDisconnect() {
        if (
            !companyId ||
            !integration ||
            !integration.is_connected ||
            isDisconnecting
        ) {
            return;
        }

        const confirmed = window.confirm(
            t("¿Desea desconectar esta empresa de Meta?")
        );

        if (!confirmed) {
            return;
        }

        setIsDisconnecting(true);
        clearParentMessages();

        try {
            const response = await deactivateMetaIntegration(
                companyId,
                integration.id
            );

            onSuccess?.(
                response?.success_message ||
                t("Conexión con Meta desconectada correctamente.")
            );

            await loadIntegrationDetail(
                integration.id
            );
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible desconectar la conexión con Meta.")
            );

            try {
                await loadIntegrationDetail(
                    integration.id
                );
            } catch {
                // El error principal ya fue comunicado al usuario.
            }
        } finally {
            setIsDisconnecting(false);
        }
    }


    /**
     * formatDateTime
     *
     * Description:
     * - Convertir una fecha ISO a una representación legible.
     */
    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(
            getLanguageLocale(),
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        ).format(date);
    }


    const operationInProgress =
        isSaving ||
        isDisconnecting ||
        isValidating;


    useEffect(() => {
        resetConnection();
        loadIntegration();
    }, [companyId]);


    if (!companyId) {
        return (
            <section className={styles.formPanel}>
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
                            <circle cx="12" cy="12" r="9" />
                            <path d="M8 12h8" />
                        </svg>
                    </div>

                    <strong>
                        {t("Seleccione una empresa.")}
                    </strong>

                    <span>
                        {t("Debe seleccionar una empresa antes de administrar su conexión con Meta.")}
                    </span>
                </div>
            </section>
        );
    }


    if (isLoading || isLoadingDetail) {
        return (
            <section className={styles.formPanel}>
                <div className={styles.loadingState}>
                    {t("Cargando conexión con Meta...")}
                </div>
            </section>
        );
    }


    if (!integration) {
        return (
            <section className={styles.formPanel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            WhatsApp Business
                        </span>

                        <h2>
                            {t("Conexión con Meta")}
                        </h2>

                        <p>
                            {t("Cree el contexto de conexión de esta empresa con la plataforma Meta utilizada por Dialoqo.")}
                        </p>
                    </div>

                    <span className={styles.disconnectedBadge}>
                        {t("No configurada")}
                    </span>
                </div>

                <div className={styles.integrationForm}>
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
                                <path d="M8 12h8" />
                                <path d="M12 8v8" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                        </div>

                        <strong>
                            {t("Esta empresa todavía no tiene una conexión Meta configurada.")}
                        </strong>

                        <span>
                            {t("Dialoqo utilizará su aplicación y credenciales globales de Meta para establecer el contexto de conexión.")}
                        </span>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="meta-notes">
                            {t("Notas")}
                        </label>

                        <textarea
                            id="meta-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder={t("Información administrativa opcional")}
                            disabled={isSaving}
                            rows="4"
                        />

                        <span className={styles.fieldHelp}>
                            {t("Campo opcional para información interna relacionada con esta conexión.")}
                        </span>
                    </div>

                    <div className={styles.formActions}>
                        <div />

                        <div className={styles.primaryActions}>
                            <button
                                className={styles.primaryButton}
                                type="button"
                                onClick={handleCreateConnection}
                                disabled={isSaving}
                            >
                                {isSaving
                                    ? t("Creando conexión...")
                                    : t("Crear conexión con Meta")}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }


    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <span className={styles.eyebrow}>
                        WhatsApp Business
                    </span>

                    <h2>
                        {t("Conexión con Meta")}
                    </h2>

                    <p>
                        {t("Estado de la conexión de esta empresa con la plataforma Meta de Dialoqo.")}
                    </p>
                </div>

                <span
                    className={
                        integration.is_connected
                            ? styles.connectedBadge
                            : styles.disconnectedBadge
                    }
                >
                    {integration.is_connected
                        ? t("Conectada")
                        : t("No conectada")}
                </span>
            </div>

            <form
                className={styles.integrationForm}
                onSubmit={handleSaveNotes}
            >
                <div className={styles.lifecycleSection}>
                    <div className={styles.lifecycleHeader}>
                        <div>
                            <h3>
                                {t("Plataforma Meta")}
                            </h3>

                            <p>
                                {t("La aplicación y las credenciales son administradas centralmente por Dialoqo.")}
                            </p>
                        </div>
                    </div>

                    <div className={styles.lifecycleGrid}>
                        <div className={styles.lifecycleField}>
                            <span>
                                Meta App
                            </span>

                            <strong>
                                Dialoqo
                            </strong>
                        </div>

                        <div className={styles.lifecycleField}>
                            <span>
                                Meta App ID
                            </span>

                            <strong>
                                {integration.meta_app_id || t("Configurado por Dialoqo")}
                            </strong>
                        </div>

                        <div className={styles.lifecycleField}>
                            <span>
                                {t("Estado")}
                            </span>

                            <strong>
                                {integration.is_connected
                                    ? t("Conectada")
                                    : t("No conectada")}
                            </strong>
                        </div>

                        <div className={styles.lifecycleField}>
                            <span>
                                {t("Conectada desde")}
                            </span>

                            <strong>
                                {formatDateTime(
                                    integration.connected_at
                                )}
                            </strong>
                        </div>

                        <div className={styles.lifecycleField}>
                            <span>
                                {t("Última desconexión")}
                            </span>

                            <strong>
                                {formatDateTime(
                                    integration.disconnected_at
                                )}
                            </strong>
                        </div>
                    </div>

                    <button
                        className={styles.validateButton}
                        type="button"
                        onClick={handleValidate}
                        disabled={operationInProgress}
                    >
                        {isValidating
                            ? integration.is_connected
                                ? t("Verificando conexión...")
                                : t("Conectando con Meta...")
                            : integration.is_connected
                                ? t("Verificar conexión")
                                : t("Conectar con Meta")}
                    </button>
                </div>

                <div className={styles.formField}>
                    <label htmlFor="meta-notes">
                        {t("Notas")}
                    </label>

                    <textarea
                        id="meta-notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder={t("Información administrativa opcional")}
                        disabled={operationInProgress}
                        rows="4"
                    />

                    <span className={styles.fieldHelp}>
                        {t("Información administrativa interna relacionada con esta conexión.")}
                    </span>
                </div>

                <div className={styles.formActions}>
                    <div>
                        {integration.is_connected && (
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={handleDisconnect}
                                disabled={operationInProgress}
                            >
                                {isDisconnecting
                                    ? t("Desconectando...")
                                    : t("Desconectar de Meta")}
                            </button>
                        )}
                    </div>

                    <div className={styles.primaryActions}>
                        <button
                            className={styles.primaryButton}
                            type="submit"
                            disabled={operationInProgress}
                        >
                            {isSaving
                                ? t("Guardando...")
                                : t("Guardar notas")}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}

export default MetaIntegrationForm;
