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


/**
 * MetaIntegrationForm
 *
 * Description:
 * - Administrar las integraciones de Meta pertenecientes a una empresa.
 *
 * Notes:
 * - Permite crear, consultar, actualizar y desactivar integraciones.
 * - Permite validar la configuración almacenada contra Meta.
 * - Los campos de conexión son controlados exclusivamente por el backend.
 * - Las credenciales sensibles no son administradas directamente desde este componente.
 */
function MetaIntegrationForm({
    companyId,
    onError,
    onSuccess,
}) {
    const [integrations, setIntegrations] = useState([]);
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    const [metaAppId, setMetaAppId] = useState("");
    const [credentialReference, setCredentialReference] = useState("");
    const [notes, setNotes] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
     * resetForm
     *
     * Description:
     * - Restablecer el formulario de integración.
     */
    function resetForm() {
        setSelectedIntegration(null);
        setMetaAppId("");
        setCredentialReference("");
        setNotes("");
    }


    /**
     * loadIntegrations
     *
     * Description:
     * - Obtener las integraciones activas de la empresa seleccionada.
     */
    async function loadIntegrations() {
        if (!companyId) {
            setIntegrations([]);
            resetForm();
            return;
        }

        setIsLoading(true);

        try {
            const response = await getMetaIntegrations(companyId);

            setIntegrations(response?.data || []);
        } catch (error) {
            setIntegrations([]);

            onError?.(
                error.message ||
                "No fue posible cargar las integraciones de Meta."
            );
        } finally {
            setIsLoading(false);
        }
    }


    /**
     * handleNewIntegration
     *
     * Description:
     * - Preparar el formulario para crear una integración.
     */
    function handleNewIntegration() {
        clearParentMessages();
        resetForm();
    }


    /**
     * handleSelectIntegration
     *
     * Description:
     * - Obtener el detalle completo de una integración seleccionada.
     */
    async function handleSelectIntegration(integration) {
        if (
            !companyId ||
            !integration?.id ||
            isLoadingDetail
        ) {
            return;
        }

        setIsLoadingDetail(true);
        clearParentMessages();

        try {
            const response = await getMetaIntegration(
                companyId,
                integration.id
            );

            const integrationDetail = response?.data;

            if (!integrationDetail) {
                throw new Error(
                    "No fue posible obtener el detalle de la integración."
                );
            }

            setSelectedIntegration(integrationDetail);
            setMetaAppId(integrationDetail.meta_app_id || "");
            setCredentialReference(
                integrationDetail.credential_reference || ""
            );
            setNotes(integrationDetail.notes || "");
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible cargar la integración de Meta."
            );
        } finally {
            setIsLoadingDetail(false);
        }
    }


    /**
     * handleSubmit
     *
     * Description:
     * - Crear o actualizar una integración de Meta.
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (
            !companyId ||
            isSaving
        ) {
            return;
        }

        setIsSaving(true);
        clearParentMessages();

        const integrationData = {
            meta_app_id: metaAppId.trim(),
            credential_reference: credentialReference.trim(),
            notes: notes.trim(),
        };

        try {
            if (selectedIntegration) {
                await updateMetaIntegration(
                    companyId,
                    selectedIntegration.id,
                    integrationData
                );

                onSuccess?.(
                    "Integración de Meta actualizada correctamente."
                );
            } else {
                await createMetaIntegration(
                    companyId,
                    integrationData
                );

                onSuccess?.(
                    "Integración de Meta creada correctamente."
                );
            }

            resetForm();
            await loadIntegrations();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible guardar la integración de Meta."
            );
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleValidate
     *
     * Description:
     * - Validar la integración seleccionada contra Meta.
     *
     * Notes:
     * - El backend sincroniza is_connected según el resultado real.
     */
    async function handleValidate() {
        if (
            !companyId ||
            !selectedIntegration ||
            isValidating
        ) {
            return;
        }

        setIsValidating(true);
        clearParentMessages();

        try {
            const response = await validateMetaIntegration(
                companyId,
                selectedIntegration.id
            );

            const validatedIntegration =
                response?.data?.meta_integration;

            onSuccess?.(
                response?.success_message ||
                "Integración de Meta validada correctamente."
            );

            if (validatedIntegration) {
                setSelectedIntegration((currentIntegration) => ({
                    ...currentIntegration,
                    ...validatedIntegration,
                }));
            }

            await loadIntegrations();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible validar la integración contra Meta."
            );
        } finally {
            setIsValidating(false);
        }
    }


    /**
     * handleDeactivate
     *
     * Description:
     * - Desactivar la integración seleccionada.
     */
    async function handleDeactivate() {
        if (
            !companyId ||
            !selectedIntegration ||
            isDeleting
        ) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea desactivar la integración de Meta "${selectedIntegration.meta_app_id}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearParentMessages();

        try {
            await deactivateMetaIntegration(
                companyId,
                selectedIntegration.id
            );

            onSuccess?.(
                "Integración de Meta desactivada correctamente."
            );

            resetForm();
            await loadIntegrations();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible desactivar la integración de Meta."
            );
        } finally {
            setIsDeleting(false);
        }
    }


    useEffect(() => {
        resetForm();
        loadIntegrations();
    }, [companyId]);


    return (
        <div className={styles.integrationWorkspace}>
            <section className={styles.listPanel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            Meta
                        </span>

                        <h2>
                            Integraciones
                        </h2>

                        <p>
                            Aplicaciones de Meta configuradas para la empresa.
                        </p>
                    </div>

                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={handleNewIntegration}
                        disabled={
                            isSaving ||
                            isDeleting ||
                            isValidating
                        }
                    >
                        Nueva integración
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loadingState}>
                        Cargando integraciones...
                    </div>
                ) : integrations.length === 0 ? (
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
                                <path d="M12 8v8" />
                            </svg>
                        </div>

                        <strong>
                            No existen integraciones configuradas.
                        </strong>

                        <span>
                            Cree una integración para conectar esta empresa con Meta.
                        </span>
                    </div>
                ) : (
                    <div className={styles.integrationList}>
                        {integrations.map((integration) => (
                            <button
                                key={integration.id}
                                className={`${styles.integrationCard} ${
                                    selectedIntegration?.id === integration.id
                                        ? styles.integrationCardActive
                                        : ""
                                }`}
                                type="button"
                                onClick={() => handleSelectIntegration(integration)}
                                disabled={isLoadingDetail}
                            >
                                <div className={styles.integrationCardMain}>
                                    <div className={styles.integrationIcon}>
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
                                            <path d="M7.5 14.5c2.2-5.3 3.8-8 5.2-8 1.5 0 2.3 2.8 3.8 6.1 1 2.2 1.8 3.4 3 3.4" />
                                            <path d="M4.5 16c1.2 0 2-1.2 3-3.4 1.5-3.3 2.3-6.1 3.8-6.1 1.4 0 3 2.7 5.2 8" />
                                        </svg>
                                    </div>

                                    <div className={styles.integrationInformation}>
                                        <strong>
                                            {integration.meta_app_id}
                                        </strong>

                                        <span>
                                            Meta App ID
                                        </span>
                                    </div>
                                </div>

                                <span
                                    className={
                                        integration.is_connected
                                            ? styles.connectedBadge
                                            : styles.disconnectedBadge
                                    }
                                >
                                    {integration.is_connected
                                        ? "Conectada"
                                        : "Sin validar"}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.formPanel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            Configuración
                        </span>

                        <h2>
                            {selectedIntegration
                                ? "Editar integración"
                                : "Nueva integración"}
                        </h2>

                        <p>
                            {selectedIntegration
                                ? "Modifique o valide la configuración seleccionada."
                                : "Registre la aplicación y referencia segura de credenciales."}
                        </p>
                    </div>

                    {selectedIntegration && (
                        <span
                            className={
                                selectedIntegration.is_connected
                                    ? styles.connectedBadge
                                    : styles.disconnectedBadge
                            }
                        >
                            {selectedIntegration.is_connected
                                ? "Conectada"
                                : "Sin validar"}
                        </span>
                    )}
                </div>

                <form
                    className={styles.integrationForm}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.formField}>
                        <label htmlFor="meta-app-id">
                            Meta App ID
                        </label>

                        <input
                            id="meta-app-id"
                            type="text"
                            value={metaAppId}
                            onChange={(event) => setMetaAppId(event.target.value)}
                            placeholder="Identificador de la aplicación en Meta"
                            disabled={
                                isSaving ||
                                isDeleting ||
                                isValidating
                            }
                            required
                        />

                        <span className={styles.fieldHelp}>
                            Identificador de la aplicación configurada en Meta.
                        </span>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="credential-reference">
                            Referencia de credenciales
                        </label>

                        <input
                            id="credential-reference"
                            type="text"
                            value={credentialReference}
                            onChange={(event) => setCredentialReference(event.target.value)}
                            placeholder="Referencia del almacén seguro"
                            autoComplete="off"
                            disabled={
                                isSaving ||
                                isDeleting ||
                                isValidating
                            }
                            required
                        />

                        <span className={styles.fieldHelp}>
                            Referencia al secreto almacenado externamente. No ingrese tokens o secretos directamente.
                        </span>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="meta-notes">
                            Notas
                        </label>

                        <textarea
                            id="meta-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Información administrativa opcional"
                            disabled={
                                isSaving ||
                                isDeleting ||
                                isValidating
                            }
                            rows="4"
                        />
                    </div>

                    {selectedIntegration && (
                        <div className={styles.lifecycleSection}>
                            <div className={styles.lifecycleHeader}>
                                <div>
                                    <h3>
                                        Estado de integración
                                    </h3>

                                    <p>
                                        Información controlada por CentralChat y Meta.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.lifecycleGrid}>
                                <div className={styles.lifecycleField}>
                                    <span>
                                        Webhook Key
                                    </span>

                                    <strong>
                                        {selectedIntegration.webhook_key || "—"}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        Estado
                                    </span>

                                    <strong>
                                        {selectedIntegration.is_connected
                                            ? "Conectada"
                                            : "No conectada"}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        Conectada desde
                                    </span>

                                    <strong>
                                        {selectedIntegration.connected_at
                                            ? new Intl.DateTimeFormat(
                                                "es-HN",
                                                {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                }
                                            ).format(
                                                new Date(
                                                    selectedIntegration.connected_at
                                                )
                                            )
                                            : "—"}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        Desconectada
                                    </span>

                                    <strong>
                                        {selectedIntegration.disconnected_at
                                            ? new Intl.DateTimeFormat(
                                                "es-HN",
                                                {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                }
                                            ).format(
                                                new Date(
                                                    selectedIntegration.disconnected_at
                                                )
                                            )
                                            : "—"}
                                    </strong>
                                </div>
                            </div>

                            <button
                                className={styles.validateButton}
                                type="button"
                                onClick={handleValidate}
                                disabled={
                                    isSaving ||
                                    isDeleting ||
                                    isValidating
                                }
                            >
                                {isValidating
                                    ? "Validando con Meta..."
                                    : "Validar integración con Meta"}
                            </button>
                        </div>
                    )}

                    <div className={styles.formActions}>
                        {selectedIntegration && (
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={handleDeactivate}
                                disabled={
                                    isSaving ||
                                    isDeleting ||
                                    isValidating
                                }
                            >
                                {isDeleting
                                    ? "Desactivando..."
                                    : "Desactivar"}
                            </button>
                        )}

                        <div className={styles.primaryActions}>
                            {selectedIntegration && (
                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={resetForm}
                                    disabled={
                                        isSaving ||
                                        isDeleting ||
                                        isValidating
                                    }
                                >
                                    Cancelar
                                </button>
                            )}

                            <button
                                className={styles.primaryButton}
                                type="submit"
                                disabled={
                                    !companyId ||
                                    isSaving ||
                                    isDeleting ||
                                    isValidating
                                }
                            >
                                {isSaving
                                    ? "Guardando..."
                                    : selectedIntegration
                                        ? "Guardar cambios"
                                        : "Crear integración"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default MetaIntegrationForm;