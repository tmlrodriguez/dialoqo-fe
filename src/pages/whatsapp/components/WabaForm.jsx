import { useEffect, useState } from "react";

import {
    connectWhatsAppBusinessAccount,
    createWhatsAppBusinessAccount,
    deactivateWhatsAppBusinessAccount,
    disconnectWhatsAppBusinessAccount,
    getMetaIntegrations,
    getWhatsAppBusinessAccount,
    getWhatsAppBusinessAccounts,
    refreshWhatsAppBusinessAccount,
    updateWhatsAppBusinessAccount,
} from "../../../services/whatsapp.js";

import styles from "./WabaForm.module.css";


/**
 * WabaForm
 *
 * Description:
 * - Administrar las cuentas de WhatsApp Business pertenecientes a una empresa.
 *
 * Notes:
 * - Permite crear, consultar, actualizar y desactivar cuentas WABA.
 * - Permite conectar, refrescar y desconectar una cuenta contra Meta.
 * - La integración seleccionada debe pertenecer a la misma empresa.
 * - Los campos de conexión son controlados exclusivamente por el backend.
 */
function WabaForm({
    companyId,
    onError,
    onSuccess,
}) {
    const [accounts, setAccounts] = useState([]);
    const [integrations, setIntegrations] = useState([]);

    const [selectedAccount, setSelectedAccount] = useState(null);

    const [metaIntegrationId, setMetaIntegrationId] = useState("");
    const [metaWabaId, setMetaWabaId] = useState("");
    const [metaBusinessId, setMetaBusinessId] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [notes, setNotes] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);


    function clearParentMessages() {
        onError?.("");
        onSuccess?.("");
    }


    function resetForm() {
        setSelectedAccount(null);
        setMetaWabaId("");
        setMetaBusinessId("");
        setDisplayName("");
        setNotes("");

        setMetaIntegrationId(
            integrations.length > 0
                ? String(integrations[0].id)
                : ""
        );
    }


    async function loadIntegrations() {
        if (!companyId) {
            setIntegrations([]);
            setMetaIntegrationId("");
            return;
        }

        setIsLoadingIntegrations(true);

        try {
            const response = await getMetaIntegrations(companyId);
            const integrationList = response?.data || [];

            setIntegrations(integrationList);

            setMetaIntegrationId((currentValue) => {
                const stillExists = integrationList.some(
                    (integration) =>
                        String(integration.id) === String(currentValue)
                );

                if (stillExists) {
                    return currentValue;
                }

                return integrationList.length > 0
                    ? String(integrationList[0].id)
                    : "";
            });
        } catch (error) {
            setIntegrations([]);
            setMetaIntegrationId("");

            onError?.(
                error.message ||
                "No fue posible cargar las integraciones de Meta."
            );
        } finally {
            setIsLoadingIntegrations(false);
        }
    }


    async function loadAccounts() {
        if (!companyId) {
            setAccounts([]);
            resetForm();
            return;
        }

        setIsLoading(true);

        try {
            const response = await getWhatsAppBusinessAccounts(companyId);

            setAccounts(response?.data || []);
        } catch (error) {
            setAccounts([]);

            onError?.(
                error.message ||
                "No fue posible cargar las cuentas de WhatsApp Business."
            );
        } finally {
            setIsLoading(false);
        }
    }


    function handleNewAccount() {
        clearParentMessages();
        resetForm();
    }


    async function handleSelectAccount(account) {
        if (
            !companyId ||
            !account?.id ||
            isLoadingDetail
        ) {
            return;
        }

        setIsLoadingDetail(true);
        clearParentMessages();

        try {
            const response = await getWhatsAppBusinessAccount(
                companyId,
                account.id
            );

            const accountDetail = response?.data;

            if (!accountDetail) {
                throw new Error(
                    "No fue posible obtener el detalle de la cuenta."
                );
            }

            setSelectedAccount(accountDetail);

            setMetaIntegrationId(
                accountDetail.meta_integration
                    ? String(accountDetail.meta_integration)
                    : ""
            );

            setMetaWabaId(accountDetail.meta_waba_id || "");
            setMetaBusinessId(accountDetail.meta_business_id || "");
            setDisplayName(accountDetail.display_name || "");
            setNotes(accountDetail.notes || "");
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible cargar la cuenta de WhatsApp Business."
            );
        } finally {
            setIsLoadingDetail(false);
        }
    }


    async function reloadSelectedAccount(accountId) {
        const response = await getWhatsAppBusinessAccount(
            companyId,
            accountId
        );

        const accountDetail = response?.data;

        if (accountDetail) {
            setSelectedAccount(accountDetail);

            setMetaIntegrationId(
                accountDetail.meta_integration
                    ? String(accountDetail.meta_integration)
                    : ""
            );

            setMetaWabaId(accountDetail.meta_waba_id || "");
            setMetaBusinessId(accountDetail.meta_business_id || "");
            setDisplayName(accountDetail.display_name || "");
            setNotes(accountDetail.notes || "");
        }
    }


    async function handleSubmit(event) {
        event.preventDefault();

        if (
            !companyId ||
            !metaIntegrationId ||
            isSaving
        ) {
            return;
        }

        setIsSaving(true);
        clearParentMessages();

        const accountData = {
            meta_integration: Number(metaIntegrationId),
            meta_waba_id: metaWabaId.trim(),
            meta_business_id: metaBusinessId.trim(),
            display_name: displayName.trim(),
            notes: notes.trim(),
        };

        try {
            if (selectedAccount) {
                await updateWhatsAppBusinessAccount(
                    companyId,
                    selectedAccount.id,
                    accountData
                );

                onSuccess?.(
                    "Cuenta de WhatsApp Business actualizada correctamente."
                );
            } else {
                await createWhatsAppBusinessAccount(
                    companyId,
                    accountData
                );

                onSuccess?.(
                    "Cuenta de WhatsApp Business creada correctamente."
                );
            }

            resetForm();
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible guardar la cuenta de WhatsApp Business."
            );
        } finally {
            setIsSaving(false);
        }
    }


    async function handleConnect() {
        if (
            !companyId ||
            !selectedAccount ||
            isConnecting
        ) {
            return;
        }

        setIsConnecting(true);
        clearParentMessages();

        try {
            const response = await connectWhatsAppBusinessAccount(
                companyId,
                selectedAccount.id
            );

            onSuccess?.(
                response?.success_message ||
                "Cuenta de WhatsApp Business conectada correctamente."
            );

            await reloadSelectedAccount(selectedAccount.id);
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible conectar la cuenta con Meta."
            );
        } finally {
            setIsConnecting(false);
        }
    }


    async function handleRefresh() {
        if (
            !companyId ||
            !selectedAccount ||
            isRefreshing
        ) {
            return;
        }

        setIsRefreshing(true);
        clearParentMessages();

        try {
            const response = await refreshWhatsAppBusinessAccount(
                companyId,
                selectedAccount.id
            );

            onSuccess?.(
                response?.success_message ||
                "Estado de la cuenta actualizado correctamente."
            );

            await reloadSelectedAccount(selectedAccount.id);
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible refrescar el estado de la cuenta."
            );
        } finally {
            setIsRefreshing(false);
        }
    }


    async function handleDisconnect() {
        if (
            !companyId ||
            !selectedAccount ||
            isDisconnecting
        ) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea desconectar la cuenta "${selectedAccount.display_name}" de Meta?`
        );

        if (!confirmed) {
            return;
        }

        setIsDisconnecting(true);
        clearParentMessages();

        try {
            const response = await disconnectWhatsAppBusinessAccount(
                companyId,
                selectedAccount.id
            );

            onSuccess?.(
                response?.success_message ||
                "Cuenta desconectada correctamente."
            );

            await reloadSelectedAccount(selectedAccount.id);
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible desconectar la cuenta de Meta."
            );
        } finally {
            setIsDisconnecting(false);
        }
    }


    async function handleDeactivate() {
        if (
            !companyId ||
            !selectedAccount ||
            isDeleting
        ) {
            return;
        }

        const confirmed = window.confirm(
            `¿Desea desactivar la cuenta "${selectedAccount.display_name}"?`
        );

        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        clearParentMessages();

        try {
            await deactivateWhatsAppBusinessAccount(
                companyId,
                selectedAccount.id
            );

            onSuccess?.(
                "Cuenta de WhatsApp Business desactivada correctamente."
            );

            resetForm();
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                "No fue posible desactivar la cuenta de WhatsApp Business."
            );
        } finally {
            setIsDeleting(false);
        }
    }


    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("es-HN", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }


    const lifecycleBusy =
        isSaving ||
        isDeleting ||
        isConnecting ||
        isRefreshing ||
        isDisconnecting;


    useEffect(() => {
        setAccounts([]);
        setIntegrations([]);
        setSelectedAccount(null);

        loadIntegrations();
        loadAccounts();
    }, [companyId]);


    return (
        <div className={styles.wabaWorkspace}>
            <section className={styles.listPanel}>
                <div className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            WhatsApp Business
                        </span>

                        <h2>
                            Cuentas WABA
                        </h2>

                        <p>
                            Cuentas de WhatsApp Business configuradas para la empresa.
                        </p>
                    </div>

                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={handleNewAccount}
                        disabled={lifecycleBusy}
                    >
                        Nueva cuenta
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loadingState}>
                        Cargando cuentas...
                    </div>
                ) : accounts.length === 0 ? (
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
                                <rect x="4" y="4" width="16" height="16" rx="3" />
                                <path d="M8 9h8" />
                                <path d="M8 13h5" />
                            </svg>
                        </div>

                        <strong>
                            No existen cuentas WABA configuradas.
                        </strong>

                        <span>
                            Cree una cuenta de WhatsApp Business después de configurar una integración de Meta.
                        </span>
                    </div>
                ) : (
                    <div className={styles.accountList}>
                        {accounts.map((account) => (
                            <button
                                key={account.id}
                                className={`${styles.accountCard} ${
                                    selectedAccount?.id === account.id
                                        ? styles.accountCardActive
                                        : ""
                                }`}
                                type="button"
                                onClick={() => handleSelectAccount(account)}
                                disabled={isLoadingDetail}
                            >
                                <div className={styles.accountCardMain}>
                                    <div className={styles.accountIcon}>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <rect x="4" y="4" width="16" height="16" rx="3" />
                                            <path d="M8 9h8" />
                                            <path d="M8 13h5" />
                                        </svg>
                                    </div>

                                    <div className={styles.accountInformation}>
                                        <strong>
                                            {account.display_name}
                                        </strong>

                                        <span>
                                            WABA {account.meta_waba_id}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.statusGroup}>
                                    <span
                                        className={
                                            account.is_connected
                                                ? styles.connectedBadge
                                                : styles.disconnectedBadge
                                        }
                                    >
                                        {account.is_connected
                                            ? "Conectada"
                                            : "Desconectada"}
                                    </span>

                                    <span
                                        className={
                                            account.is_webhook_configured
                                                ? styles.webhookBadge
                                                : styles.webhookInactiveBadge
                                        }
                                    >
                                        {account.is_webhook_configured
                                            ? "Webhook"
                                            : "Sin webhook"}
                                    </span>
                                </div>
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
                            {selectedAccount
                                ? "Editar cuenta WABA"
                                : "Nueva cuenta WABA"}
                        </h2>

                        <p>
                            {selectedAccount
                                ? "Modifique la configuración o gestione su conexión con Meta."
                                : "Registre una cuenta de WhatsApp Business para la empresa."}
                        </p>
                    </div>

                    {selectedAccount && (
                        <span
                            className={
                                selectedAccount.is_connected
                                    ? styles.connectedBadge
                                    : styles.disconnectedBadge
                            }
                        >
                            {selectedAccount.is_connected
                                ? "Conectada"
                                : "Desconectada"}
                        </span>
                    )}
                </div>

                <form
                    className={styles.wabaForm}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.formField}>
                        <label htmlFor="waba-integration">
                            Integración de Meta
                        </label>

                        <select
                            id="waba-integration"
                            value={metaIntegrationId}
                            onChange={(event) => setMetaIntegrationId(event.target.value)}
                            disabled={
                                isLoadingIntegrations ||
                                integrations.length === 0 ||
                                lifecycleBusy
                            }
                            required
                        >
                            {integrations.length === 0 && (
                                <option value="">
                                    No existen integraciones disponibles
                                </option>
                            )}

                            {integrations.map((integration) => (
                                <option
                                    key={integration.id}
                                    value={integration.id}
                                >
                                    {integration.meta_app_id}
                                    {integration.is_connected
                                        ? " — Conectada"
                                        : " — Sin validar"}
                                </option>
                            ))}
                        </select>

                        <span className={styles.fieldHelp}>
                            La cuenta WABA utilizará las credenciales de esta integración.
                        </span>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-display-name">
                            Nombre
                        </label>

                        <input
                            id="waba-display-name"
                            type="text"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            placeholder="Nombre de la cuenta"
                            disabled={lifecycleBusy}
                            required
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-meta-id">
                            Meta WABA ID
                        </label>

                        <input
                            id="waba-meta-id"
                            type="text"
                            value={metaWabaId}
                            onChange={(event) => setMetaWabaId(event.target.value)}
                            placeholder="Identificador de WhatsApp Business Account"
                            disabled={lifecycleBusy}
                            required
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-business-id">
                            Meta Business ID
                        </label>

                        <input
                            id="waba-business-id"
                            type="text"
                            value={metaBusinessId}
                            onChange={(event) => setMetaBusinessId(event.target.value)}
                            placeholder="Identificador de Meta Business"
                            disabled={lifecycleBusy}
                            required
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-notes">
                            Notas
                        </label>

                        <textarea
                            id="waba-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Información administrativa opcional"
                            disabled={lifecycleBusy}
                            rows="4"
                        />
                    </div>

                    {selectedAccount && (
                        <div className={styles.lifecycleSection}>
                            <div className={styles.lifecycleHeader}>
                                <div>
                                    <h3>
                                        Estado en Meta
                                    </h3>

                                    <p>
                                        Estado real sincronizado por las operaciones de conexión.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.lifecycleGrid}>
                                <div className={styles.lifecycleField}>
                                    <span>
                                        Conexión
                                    </span>

                                    <strong>
                                        {selectedAccount.is_connected
                                            ? "Conectada"
                                            : "Desconectada"}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        Webhook
                                    </span>

                                    <strong>
                                        {selectedAccount.is_webhook_configured
                                            ? "Configurado"
                                            : "No configurado"}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        Conectada desde
                                    </span>

                                    <strong>
                                        {formatDateTime(selectedAccount.connected_at)}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        Desconectada
                                    </span>

                                    <strong>
                                        {formatDateTime(selectedAccount.disconnected_at)}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles.lifecycleActions}>
                                {!selectedAccount.is_connected ? (
                                    <button
                                        className={styles.lifecyclePrimaryButton}
                                        type="button"
                                        onClick={handleConnect}
                                        disabled={lifecycleBusy}
                                    >
                                        {isConnecting
                                            ? "Conectando..."
                                            : "Conectar con Meta"}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className={styles.lifecycleSecondaryButton}
                                            type="button"
                                            onClick={handleRefresh}
                                            disabled={lifecycleBusy}
                                        >
                                            {isRefreshing
                                                ? "Actualizando..."
                                                : "Actualizar estado"}
                                        </button>

                                        <button
                                            className={styles.lifecycleDangerButton}
                                            type="button"
                                            onClick={handleDisconnect}
                                            disabled={lifecycleBusy}
                                        >
                                            {isDisconnecting
                                                ? "Desconectando..."
                                                : "Desconectar"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.formActions}>
                        {selectedAccount && (
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={handleDeactivate}
                                disabled={lifecycleBusy}
                            >
                                {isDeleting
                                    ? "Desactivando..."
                                    : "Desactivar"}
                            </button>
                        )}

                        <div className={styles.primaryActions}>
                            {selectedAccount && (
                                <button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={resetForm}
                                    disabled={lifecycleBusy}
                                >
                                    Cancelar
                                </button>
                            )}

                            <button
                                className={styles.primaryButton}
                                type="submit"
                                disabled={
                                    !companyId ||
                                    !metaIntegrationId ||
                                    lifecycleBusy
                                }
                            >
                                {isSaving
                                    ? "Guardando..."
                                    : selectedAccount
                                        ? "Guardar cambios"
                                        : "Crear cuenta"}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default WabaForm;