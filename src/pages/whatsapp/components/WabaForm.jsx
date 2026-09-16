import { useEffect, useState } from "react";

import {
    connectWhatsAppBusinessAccount,
    createWhatsAppBusinessAccount,
    deactivateWhatsAppBusinessAccount,
    disconnectWhatsAppBusinessAccount,
    getWhatsAppBusinessAccount,
    getWhatsAppBusinessAccounts,
    refreshWhatsAppBusinessAccount,
    updateWhatsAppBusinessAccount,
} from "../../../services/whatsapp.js";

import styles from "./WabaForm.module.css";
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";


/**
 * WabaForm
 *
 * Description:
 * - Administrar las cuentas de WhatsApp Business pertenecientes a una empresa.
 *
 * Notes:
 * - Cada cuenta WABA pertenece directamente a una empresa de Dialoqo.
 * - La Meta App y sus credenciales pertenecen globalmente a Dialoqo.
 * - El administrador no selecciona ni administra credenciales de Meta.
 * - Permite crear, consultar, actualizar, conectar, refrescar, desconectar y desactivar cuentas WABA.
 * - Los campos de estado de conexión son controlados exclusivamente por el backend.
 */
function WabaForm({
    companyId,
    onError,
    onSuccess,
}) {
    const { t } = usePageTranslation();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const [metaWabaId, setMetaWabaId] = useState("");
    const [metaBusinessId, setMetaBusinessId] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [notes, setNotes] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);


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
     * - Restablecer el formulario WABA.
     */
    function resetForm() {
        setSelectedAccount(null);
        setMetaWabaId("");
        setMetaBusinessId("");
        setDisplayName("");
        setNotes("");
    }


    /**
     * applyAccountDetail
     *
     * Description:
     * - Aplicar al formulario la representación detallada de una cuenta WABA.
     */
    function applyAccountDetail(accountDetail) {
        setSelectedAccount(accountDetail);
        setMetaWabaId(accountDetail.meta_waba_id || "");
        setMetaBusinessId(accountDetail.meta_business_id || "");
        setDisplayName(accountDetail.display_name || "");
        setNotes(accountDetail.notes || "");
    }


    /**
     * loadAccounts
     *
     * Description:
     * - Obtener las cuentas WABA activas pertenecientes a la empresa.
     */
    async function loadAccounts() {
        if (!companyId) {
            setAccounts([]);
            resetForm();
            return;
        }

        setIsLoading(true);
        clearParentMessages();

        try {
            const response = await getWhatsAppBusinessAccounts(companyId);

            setAccounts(response?.data || []);
        } catch (error) {
            setAccounts([]);

            onError?.(
                error.message ||
                t("No fue posible cargar las cuentas de WhatsApp Business.")
            );
        } finally {
            setIsLoading(false);
        }
    }


    /**
     * handleNewAccount
     *
     * Description:
     * - Preparar el formulario para registrar una nueva cuenta WABA.
     */
    function handleNewAccount() {
        clearParentMessages();
        resetForm();
    }


    /**
     * handleSelectAccount
     *
     * Description:
     * - Obtener el detalle completo de una cuenta WABA seleccionada.
     */
    async function handleSelectAccount(account) {
        if (!companyId || !account?.id || isLoadingDetail) {
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
                    t("No fue posible obtener el detalle de la cuenta.")
                );
            }

            applyAccountDetail(accountDetail);
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible cargar la cuenta de WhatsApp Business.")
            );
        } finally {
            setIsLoadingDetail(false);
        }
    }


    /**
     * reloadSelectedAccount
     *
     * Description:
     * - Sincronizar nuevamente el detalle de la cuenta WABA seleccionada.
     */
    async function reloadSelectedAccount(accountId) {
        if (!companyId || !accountId) {
            return;
        }

        const response = await getWhatsAppBusinessAccount(
            companyId,
            accountId
        );

        const accountDetail = response?.data;

        if (accountDetail) {
            applyAccountDetail(accountDetail);
        }
    }


    /**
     * handleSubmit
     *
     * Description:
     * - Crear o actualizar una cuenta WABA.
     *
     * Notes:
     * - La cuenta queda asociada directamente a la empresa determinada por la URL.
     * - No se envía ninguna referencia a MetaIntegration.
     */
    async function handleSubmit(event) {
        event.preventDefault();

        if (!companyId || isSaving) {
            return;
        }

        setIsSaving(true);
        clearParentMessages();

        const accountData = {
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
                    t("Cuenta de WhatsApp Business actualizada correctamente.")
                );
            } else {
                await createWhatsAppBusinessAccount(
                    companyId,
                    accountData
                );

                onSuccess?.(
                    t("Cuenta de WhatsApp Business creada correctamente.")
                );
            }

            resetForm();

            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible guardar la cuenta de WhatsApp Business.")
            );
        } finally {
            setIsSaving(false);
        }
    }


    /**
     * handleConnect
     *
     * Description:
     * - Conectar la cuenta WABA seleccionada con Meta utilizando la configuración global de Dialoqo.
     *
     * Notes:
     * - El backend valida que Dialoqo tenga acceso a la WABA.
     * - El backend administra la suscripción de la aplicación de Dialoqo a la WABA.
     */
    async function handleConnect() {
        if (!companyId || !selectedAccount || isConnecting) {
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
                t("Cuenta de WhatsApp Business conectada correctamente.")
            );

            await reloadSelectedAccount(selectedAccount.id);
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible conectar la cuenta con Meta.")
            );
        } finally {
            setIsConnecting(false);
        }
    }


    /**
     * handleRefresh
     *
     * Description:
     * - Refrescar desde Meta el estado real de la cuenta WABA seleccionada.
     */
    async function handleRefresh() {
        if (!companyId || !selectedAccount || isRefreshing) {
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
                t("Estado de la cuenta actualizado correctamente.")
            );

            await reloadSelectedAccount(selectedAccount.id);
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible refrescar el estado de la cuenta.")
            );
        } finally {
            setIsRefreshing(false);
        }
    }


    /**
     * handleDisconnect
     *
     * Description:
     * - Desconectar la cuenta WABA seleccionada de la aplicación de Meta utilizada por Dialoqo.
     */
    async function handleDisconnect() {
        if (!companyId || !selectedAccount || isDisconnecting) {
            return;
        }

        const confirmed = window.confirm(
            `${t("¿Desea desconectar la cuenta")} "${selectedAccount.display_name}" ${t("de Meta?")}`
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
                t("Cuenta desconectada correctamente.")
            );

            await reloadSelectedAccount(selectedAccount.id);
            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible desconectar la cuenta de Meta.")
            );
        } finally {
            setIsDisconnecting(false);
        }
    }


    /**
     * handleDeactivate
     *
     * Description:
     * - Desactivar la cuenta WABA seleccionada.
     */
    async function handleDeactivate() {
        if (!companyId || !selectedAccount || isDeleting) {
            return;
        }

        const confirmed = window.confirm(
            `${t("¿Desea desactivar la cuenta")} "${selectedAccount.display_name}"?`
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
                t("Cuenta de WhatsApp Business desactivada correctamente.")
            );

            resetForm();

            await loadAccounts();
        } catch (error) {
            onError?.(
                error.message ||
                t("No fue posible desactivar la cuenta de WhatsApp Business.")
            );
        } finally {
            setIsDeleting(false);
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

        return new Intl.DateTimeFormat(getLanguageLocale(), {
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
        resetForm();

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
                            {t("Cuentas WABA")}
                        </h2>

                        <p>
                            {t("Cuentas de WhatsApp Business registradas para la empresa.")}
                        </p>
                    </div>

                    <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={handleNewAccount}
                        disabled={lifecycleBusy}
                    >
                        {t("Nueva cuenta")}
                    </button>
                </div>

                {isLoading ? (
                    <div className={styles.loadingState}>
                        {t("Cargando cuentas...")}
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
                            {t("No existen cuentas WABA configuradas.")}
                        </strong>

                        <span>
                            {t("Registre una cuenta de WhatsApp Business para comenzar.")}
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
                                            ? t("Conectada")
                                            : t("Desconectada")}
                                    </span>

                                    <span
                                        className={
                                            account.is_webhook_configured
                                                ? styles.webhookBadge
                                                : styles.webhookInactiveBadge
                                        }
                                    >
                                        {account.is_webhook_configured
                                            ? t("Webhook")
                                            : t("Sin webhook")}
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
                            {t("Configuración")}
                        </span>

                        <h2>
                            {selectedAccount
                                ? t("Editar cuenta WABA")
                                : t("Nueva cuenta WABA")}
                        </h2>

                        <p>
                            {selectedAccount
                                ? t("Modifique la configuración o gestione su conexión con Meta.")
                                : t("Registre una cuenta de WhatsApp Business para la empresa.")}
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
                                ? t("Conectada")
                                : t("Desconectada")}
                        </span>
                    )}
                </div>

                <form
                    className={styles.wabaForm}
                    onSubmit={handleSubmit}
                >
                    <div className={styles.lifecycleSection}>
                        <div className={styles.lifecycleHeader}>
                            <div>
                                <h3>
                                    {t("Plataforma Meta")}
                                </h3>

                                <p>
                                    {t("Esta cuenta utilizará la Meta App y las credenciales globales administradas por Dialoqo.")}
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
                                    {t("Configuración")}
                                </span>

                                <strong>
                                    {t("Administrada por Dialoqo")}
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-display-name">
                            {t("Nombre")}
                        </label>

                        <input
                            id="waba-display-name"
                            type="text"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            placeholder={t("Nombre de la cuenta")}
                            disabled={lifecycleBusy}
                            required
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-meta-id">
                            {t("Meta WABA ID")}
                        </label>

                        <input
                            id="waba-meta-id"
                            type="text"
                            value={metaWabaId}
                            onChange={(event) => setMetaWabaId(event.target.value)}
                            placeholder={t("Identificador de WhatsApp Business Account")}
                            disabled={lifecycleBusy}
                            required
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-business-id">
                            {t("Meta Business ID")}
                        </label>

                        <input
                            id="waba-business-id"
                            type="text"
                            value={metaBusinessId}
                            onChange={(event) => setMetaBusinessId(event.target.value)}
                            placeholder={t("Identificador de Meta Business")}
                            disabled={lifecycleBusy}
                            required
                        />
                    </div>

                    <div className={styles.formField}>
                        <label htmlFor="waba-notes">
                            {t("Notas")}
                        </label>

                        <textarea
                            id="waba-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder={t("Información administrativa opcional")}
                            disabled={lifecycleBusy}
                            rows="4"
                        />
                    </div>

                    {selectedAccount && (
                        <div className={styles.lifecycleSection}>
                            <div className={styles.lifecycleHeader}>
                                <div>
                                    <h3>
                                        {t("Estado en Meta")}
                                    </h3>

                                    <p>
                                        {t("Estado real sincronizado mediante la plataforma Meta.")}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.lifecycleGrid}>
                                <div className={styles.lifecycleField}>
                                    <span>
                                        {t("Conexión")}
                                    </span>

                                    <strong>
                                        {selectedAccount.is_connected
                                            ? t("Conectada")
                                            : t("Desconectada")}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        {t("Webhook")}
                                    </span>

                                    <strong>
                                        {selectedAccount.is_webhook_configured
                                            ? t("Configurado")
                                            : t("No configurado")}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        {t("Conectada desde")}
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedAccount.connected_at
                                        )}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        {t("Desconectada")}
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedAccount.disconnected_at
                                        )}
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
                                            ? t("Conectando...")
                                            : t("Conectar con Meta")}
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
                                                ? t("Actualizando...")
                                                : t("Actualizar estado")}
                                        </button>

                                        <button
                                            className={styles.lifecycleDangerButton}
                                            type="button"
                                            onClick={handleDisconnect}
                                            disabled={lifecycleBusy}
                                        >
                                            {isDisconnecting
                                                ? t("Desconectando...")
                                                : t("Desconectar")}
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
                                    ? t("Desactivando...")
                                    : t("Desactivar")}
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
                                    {t("Cancelar")}
                                </button>
                            )}

                            <button
                                className={styles.primaryButton}
                                type="submit"
                                disabled={!companyId || lifecycleBusy}
                            >
                                {isSaving
                                    ? t("Guardando...")
                                    : selectedAccount
                                        ? t("Guardar cambios")
                                        : t("Crear cuenta")}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default WabaForm;
