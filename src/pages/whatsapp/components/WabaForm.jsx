import { useEffect, useRef, useState } from "react";

import {
    completeWhatsAppEmbeddedSignup,
    connectWhatsAppBusinessAccount,
    createWhatsAppBusinessAccount,
    deactivateWhatsAppBusinessAccount,
    disconnectWhatsAppBusinessAccount,
    getWhatsAppBusinessAccount,
    getWhatsAppBusinessAccounts,
    refreshWhatsAppBusinessAccount,
    updateWhatsAppBusinessAccount,
} from "../../../services/whatsapp.js";

import {
    launchWhatsAppEmbeddedSignup,
} from "../../../services/metaEmbeddedSignup.js";

import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";

import styles from "./WabaForm.module.css";


/* =========================================================
   CONSTANTS
   ========================================================= */

const EMPTY_FORM = {
    display_name: "",
    meta_waba_id: "",
    meta_business_id: "",
    notes: "",
};

const EMBEDDED_SIGNUP_COMPLETION_EVENTS = new Set([
    "FINISH",
    "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING",
]);


/* =========================================================
   WABA FORM
   ========================================================= */

/**
 * WabaForm
 *
 * Description:
 * - Manage WhatsApp Business Accounts belonging to a company.
 * - Connect accounts through Meta Embedded Signup.
 * - Support WhatsApp Business App coexistence onboarding.
 * - Complete authorization through the Django backend.
 * - Preserve advanced manual administration.
 *
 * Notes:
 * - Each WABA belongs directly to a Dialoqo company.
 * - Meta credentials are managed exclusively by Django.
 * - Authorization codes are never stored in React state.
 * - Meta identifiers are validated by the backend.
 * - Phone numbers are registered by backend operations.
 * - Phone numbers are not automatically assigned to branches.
 * - Monitoring activation remains a separate operation.
 * - Connection status is controlled exclusively by Django.
 */
function WabaForm({
    companyId,
    onError,
    onSuccess,
}) {
    const { t } = usePageTranslation();

    /* -----------------------------------------------------
       COMPANY CONTEXT
       ----------------------------------------------------- */

    const companyRef = useRef(companyId);

    companyRef.current = companyId;


    /* -----------------------------------------------------
       ACCOUNT STATE
       ----------------------------------------------------- */

    const [accounts, setAccounts] = useState([]);

    const [selected, setSelected] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);


    /* -----------------------------------------------------
       INTERFACE STATE
       ----------------------------------------------------- */

    const [manual, setManual] = useState(false);

    const [advanced, setAdvanced] = useState(false);


    /* -----------------------------------------------------
       LOADING STATE
       ----------------------------------------------------- */

    const [loading, setLoading] = useState(false);

    const [loadingDetail, setLoadingDetail] = useState(false);

    const [operation, setOperation] = useState("");


    /* -----------------------------------------------------
       DERIVED STATE
       ----------------------------------------------------- */

    const busy = Boolean(operation);


    /**
     * sameCompany
     *
     * Description:
     * - Verify that an asynchronous operation still belongs
     *   to the currently selected company.
     */
    function sameCompany(id) {
        return String(companyRef.current) === String(id);
    }


    /* =====================================================
       MESSAGE MANAGEMENT
       ===================================================== */

    /**
     * clearMessages
     *
     * Description:
     * - Clear messages managed by the parent page.
     */
    function clearMessages() {
        onError?.("");
        onSuccess?.("");
    }


    /* =====================================================
       FORM STATE
       ===================================================== */

    /**
     * resetSelection
     *
     * Description:
     * - Clear the selected WABA.
     * - Restore the default administration interface.
     */
    function resetSelection() {
        setSelected(null);

        setForm(EMPTY_FORM);

        setManual(false);

        setAdvanced(false);
    }


    /**
     * applyAccount
     *
     * Description:
     * - Apply the authoritative account representation
     *   returned by Django.
     */
    function applyAccount(account) {
        setSelected(account);

        setForm({
            display_name: account.display_name || "",
            meta_waba_id: account.meta_waba_id || "",
            meta_business_id: account.meta_business_id || "",
            notes: account.notes || "",
        });

        setManual(false);

        setAdvanced(false);
    }


    /**
     * changeField
     *
     * Description:
     * - Update one editable form field.
     */
    function changeField(key, value) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    }


    /* =====================================================
       ACCOUNT RETRIEVAL
       ===================================================== */

    /**
     * loadAccounts
     *
     * Description:
     * - Retrieve the active WABAs belonging to a company.
     *
     * Notes:
     * - Responses from previously selected companies
     *   are ignored.
     */
    async function loadAccounts(id = companyId) {
        if (!id) {
            setAccounts([]);
            setLoading(false);

            return;
        }

        setLoading(true);

        try {
            const response =
                await getWhatsAppBusinessAccounts(id);

            if (!sameCompany(id)) {
                return;
            }

            setAccounts(
                Array.isArray(response?.data)
                    ? response.data
                    : []
            );

        } catch (error) {
            if (!sameCompany(id)) {
                return;
            }

            setAccounts([]);

            onError?.(
                error.message ||
                t("No fue posible cargar las cuentas.")
            );

        } finally {
            if (sameCompany(id)) {
                setLoading(false);
            }
        }
    }


    /**
     * loadDetail
     *
     * Description:
     * - Retrieve the authoritative WABA detail.
     * - Update the selected account when the company
     *   context remains valid.
     */
    async function loadDetail(
        accountId,
        id = companyId
    ) {
        if (!id || !accountId) {
            return;
        }

        const response =
            await getWhatsAppBusinessAccount(
                id,
                accountId
            );

        if (
            sameCompany(id) &&
            response?.data
        ) {
            applyAccount(response.data);
        }
    }


    /**
     * selectAccount
     *
     * Description:
     * - Select an existing WABA.
     * - Retrieve its current backend state.
     */
    async function selectAccount(account) {
        if (
            !companyId ||
            !account?.id ||
            busy ||
            loadingDetail
        ) {
            return;
        }

        const id = companyId;

        clearMessages();

        setLoadingDetail(true);

        try {
            await loadDetail(
                account.id,
                id
            );

        } catch (error) {
            if (sameCompany(id)) {
                onError?.(
                    error.message ||
                    t("No fue posible cargar la cuenta.")
                );
            }

        } finally {
            setLoadingDetail(false);
        }
    }


    /* =====================================================
       META EMBEDDED SIGNUP
       ===================================================== */

    /**
     * handleSignup
     *
     * Description:
     * - Launch Meta Embedded Signup.
     * - Support standard WhatsApp Cloud API onboarding.
     * - Support WhatsApp Business App coexistence.
     * - Capture Meta authorization and identifiers.
     * - Submit authorization to Django.
     * - Refresh the administrative interface.
     *
     * Notes:
     * - Authorization codes are never logged.
     * - The frontend never exchanges authorization codes.
     * - The Meta App Secret remains exclusively in Django.
     * - The Business Portfolio ID is optional in the
     *   frontend payload and verified by Django.
     * - Meta identifiers are not authoritative until
     *   validated by Django.
     * - Backend onboarding success is not invalidated
     *   by subsequent interface refresh failures.
     */
    async function handleSignup() {
        if (!companyId || busy) {
            return;
        }

        const id = companyId;

        clearMessages();

        setOperation("signup");

        try {
            /* ---------------------------------------------
               STEP 1: LAUNCH META EMBEDDED SIGNUP
               --------------------------------------------- */

            const result =
                await launchWhatsAppEmbeddedSignup();


            /* ---------------------------------------------
               STEP 2: HANDLE CANCELLATION
               --------------------------------------------- */

            if (result?.cancelled) {
                if (sameCompany(id)) {
                    onError?.(
                        t("La conexión con Meta fue cancelada.")
                    );
                }

                return;
            }


            /* ---------------------------------------------
               STEP 3: EXTRACT AUTHORIZATION
               --------------------------------------------- */

            const session = result?.session;

            const sessionData =
                session?.data || {};

            const authorizationCode =
                result?.authorization?.code;

            const wabaId =
                sessionData.waba_id ||
                sessionData.wabaId ||
                result?.identifiers?.waba_id;

            const phoneNumberId =
                sessionData.phone_number_id ||
                sessionData.phoneNumberId ||
                result?.identifiers?.phone_number_id;

            const businessId =
                sessionData.business_id ||
                sessionData.business_portfolio_id ||
                sessionData.businessId ||
                result?.identifiers?.business_id;


            /* ---------------------------------------------
               STEP 4: VALIDATE COMPLETION EVENT
               --------------------------------------------- */

            if (
                !EMBEDDED_SIGNUP_COMPLETION_EVENTS.has(
                    session?.event
                )
            ) {
                throw new Error(
                    t(
                        "Meta no confirmó la finalización de Embedded Signup."
                    )
                );
            }


            /* ---------------------------------------------
               STEP 5: VALIDATE REQUIRED IDENTIFIERS
               --------------------------------------------- */

            if (!authorizationCode) {
                throw new Error(
                    t(
                        "Meta no proporcionó el código de autorización."
                    )
                );
            }

            if (!wabaId) {
                throw new Error(
                    t(
                        "Meta no proporcionó el WABA ID."
                    )
                );
            }

            if (!phoneNumberId) {
                throw new Error(
                    t(
                        "Meta no proporcionó el Phone Number ID."
                    )
                );
            }


            /* ---------------------------------------------
               STEP 6: BUILD BACKEND PAYLOAD
               --------------------------------------------- */

            const payload = {
                code: authorizationCode,
                waba_id: String(wabaId),
                phone_number_id: String(phoneNumberId),
            };

            if (businessId) {
                payload.business_id =
                    String(businessId);
            }


            /* ---------------------------------------------
               STEP 7: SUBMIT AUTHORIZATION TO DJANGO
               --------------------------------------------- */

            const response =
                await completeWhatsAppEmbeddedSignup(
                    id,
                    payload
                );

            const onboarding =
                response?.data;


            /* ---------------------------------------------
               STEP 8: VALIDATE BACKEND COMPLETION
               --------------------------------------------- */

            if (
                !onboarding?.account_id ||
                !onboarding?.is_connected ||
                !onboarding?.is_webhook_configured
            ) {
                throw new Error(
                    t(
                        "Django no confirmó la conexión de WhatsApp Business."
                    )
                );
            }


            /* ---------------------------------------------
               STEP 9: VERIFY COMPANY CONTEXT
               --------------------------------------------- */

            if (!sameCompany(id)) {
                return;
            }


            /* ---------------------------------------------
               STEP 10: BUILD SUCCESS MESSAGE
               --------------------------------------------- */

            const registeredCount =
                Array.isArray(onboarding.registered_numbers)
                    ? onboarding.registered_numbers.length
                    : null;

            const countText =
                registeredCount === null
                    ? ""
                    : ` ${registeredCount} ${t("número(s) registrado(s).")}`;

            const successMessage =
                response?.success_message ||
                t(
                    "WhatsApp Business conectado correctamente."
                );


            /* ---------------------------------------------
               STEP 11: NOTIFY SUCCESS
               --------------------------------------------- */

            onSuccess?.(
                `${successMessage}${countText} ${t(
                    "Active el monitoreo desde Números."
                )}`
            );


            /* ---------------------------------------------
               STEP 12: REFRESH ACCOUNTS
               --------------------------------------------- */

            /*
             * Onboarding has already succeeded in Django.
             *
             * Refresh failures must not incorrectly report
             * that Meta onboarding failed.
             */

            try {
                await loadAccounts(id);

                await loadDetail(
                    onboarding.account_id,
                    id
                );

            } catch (refreshError) {
                if (import.meta.env.DEV) {
                    console.warn(
                        "[EMBEDDED SIGNUP] UI REFRESH FAILED",
                        {
                            error_type:
                                refreshError?.name || "Error",
                        }
                    );
                }
            }

        } catch (error) {
            if (sameCompany(id)) {
                onError?.(
                    error.message ||
                    t(
                        "No fue posible completar Embedded Signup."
                    )
                );
            }

        } finally {
            setOperation("");
        }
    }


    /* =====================================================
       CREATE / UPDATE WABA
       ===================================================== */

    /**
     * handleSave
     *
     * Description:
     * - Update an existing WABA.
     * - Create a WABA manually when advanced mode is enabled.
     *
     * Notes:
     * - Existing Meta identifiers are not editable.
     * - Connection status remains backend-controlled.
     */
    async function handleSave(event) {
        event.preventDefault();

        if (
            !companyId ||
            busy ||
            (!selected && !manual)
        ) {
            return;
        }

        const id = companyId;

        const accountId =
            selected?.id;

        clearMessages();

        setOperation("save");

        try {
            if (accountId) {
                await updateWhatsAppBusinessAccount(
                    id,
                    accountId,
                    {
                        display_name:
                            form.display_name.trim(),

                        notes:
                            form.notes.trim(),
                    }
                );

            } else {
                await createWhatsAppBusinessAccount(
                    id,
                    {
                        display_name:
                            form.display_name.trim(),

                        meta_waba_id:
                            form.meta_waba_id.trim(),

                        meta_business_id:
                            form.meta_business_id.trim(),

                        notes:
                            form.notes.trim(),
                    }
                );
            }

            if (!sameCompany(id)) {
                return;
            }

            onSuccess?.(
                t("Cuenta guardada correctamente.")
            );

            if (accountId) {
                await loadDetail(
                    accountId,
                    id
                );
            } else {
                resetSelection();
            }

            await loadAccounts(id);

        } catch (error) {
            if (sameCompany(id)) {
                onError?.(
                    error.message ||
                    t("No fue posible guardar la cuenta.")
                );
            }

        } finally {
            setOperation("");
        }
    }


    /* =====================================================
       META LIFECYCLE OPERATIONS
       ===================================================== */

    /**
     * lifecycle
     *
     * Description:
     * - Execute an authorized WABA lifecycle operation.
     * - Refresh account state after completion.
     *
     * Notes:
     * - The backend remains authoritative.
     * - Operations are scoped to the selected company.
     */
    async function lifecycle(
        action,
        name,
        successText
    ) {
        if (
            !companyId ||
            !selected ||
            busy
        ) {
            return;
        }

        const id = companyId;

        const accountId =
            selected.id;

        clearMessages();

        setOperation(name);

        try {
            const response =
                await action(
                    id,
                    accountId
                );

            if (!sameCompany(id)) {
                return;
            }

            onSuccess?.(
                response?.success_message ||
                t(successText)
            );

            await loadDetail(
                accountId,
                id
            );

            await loadAccounts(id);

        } catch (error) {
            if (sameCompany(id)) {
                onError?.(
                    error.message ||
                    t(
                        "No fue posible completar la operación."
                    )
                );
            }

        } finally {
            setOperation("");
        }
    }


    /**
     * handleDisconnect
     *
     * Description:
     * - Disconnect the selected WABA from Meta.
     */
    async function handleDisconnect() {
        if (!selected || busy) {
            return;
        }

        const confirmed = window.confirm(
            `${t("¿Desea desconectar la cuenta")} ` +
            `"${selected.display_name}" ` +
            `${t("de Meta?")}`
        );

        if (!confirmed) {
            return;
        }

        await lifecycle(
            disconnectWhatsAppBusinessAccount,
            "disconnect",
            "Cuenta desconectada correctamente."
        );
    }


    /**
     * handleDeactivate
     *
     * Description:
     * - Logically deactivate the selected WABA.
     *
     * Notes:
     * - Backend business rules determine whether
     *   deactivation is permitted.
     */
    async function handleDeactivate() {
        if (
            !companyId ||
            !selected ||
            busy
        ) {
            return;
        }

        const confirmed = window.confirm(
            `${t("¿Desea desactivar la cuenta")} ` +
            `"${selected.display_name}"?`
        );

        if (!confirmed) {
            return;
        }

        const id = companyId;

        const accountId =
            selected.id;

        clearMessages();

        setOperation("deactivate");

        try {
            await deactivateWhatsAppBusinessAccount(
                id,
                accountId
            );

            if (!sameCompany(id)) {
                return;
            }

            resetSelection();

            onSuccess?.(
                t("Cuenta desactivada correctamente.")
            );

            await loadAccounts(id);

        } catch (error) {
            if (sameCompany(id)) {
                onError?.(
                    error.message ||
                    t(
                        "No fue posible desactivar la cuenta."
                    )
                );
            }

        } finally {
            setOperation("");
        }
    }


    /* =====================================================
       DATE FORMATTING
       ===================================================== */

    /**
     * formatDateTime
     *
     * Description:
     * - Format an ISO datetime using the current locale.
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


    /* =====================================================
       COMPANY CONTEXT INITIALIZATION
       ===================================================== */

    useEffect(() => {
        companyRef.current = companyId;

        setAccounts([]);

                resetSelection();

        loadAccounts(companyId);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);


    /* =====================================================
       COMPONENT RENDER
       ===================================================== */

    return (
        <div className={styles.wabaWorkspace}>

            {/* =================================================
                WABA ACCOUNT LIST
               ================================================= */}

            <section className={styles.listPanel}>

                <header className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            WhatsApp Business
                        </span>

                        <h2>
                            {t("Cuentas WABA")}
                        </h2>

                        <p>
                            {t(
                                "Conecte y administre las cuentas de esta empresa."
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={handleSignup}
                        disabled={!companyId || busy}
                    >
                        {operation === "signup"
                            ? t("Conectando...")
                            : t("Conectar con Meta")}
                    </button>
                </header>


                {/* ---------------------------------------------
                    ACCOUNT LOADING STATE
                   --------------------------------------------- */}

                {loading ? (
                    <div className={styles.loadingState}>
                        {t("Cargando cuentas...")}
                    </div>

                ) : accounts.length === 0 ? (

                    /* -----------------------------------------
                       EMPTY STATE
                       ----------------------------------------- */

                    <div className={styles.emptyState}>
                        <strong>
                            {t(
                                "No existen cuentas WABA configuradas."
                            )}
                        </strong>

                        <span>
                            {t(
                                "Conecte con Meta para registrar automáticamente la cuenta y sus números."
                            )}
                        </span>
                    </div>

                ) : (

                    /* -----------------------------------------
                       ACCOUNT LIST
                       ----------------------------------------- */

                    <div className={styles.accountList}>
                        {accounts.map((account) => (
                            <button
                                key={account.id}
                                type="button"
                                className={`
                                    ${styles.accountCard}
                                    ${
                                        selected?.id === account.id
                                            ? styles.accountCardActive
                                            : ""
                                    }
                                `}
                                onClick={() =>
                                    selectAccount(account)
                                }
                                disabled={
                                    busy ||
                                    loadingDetail
                                }
                                aria-pressed={
                                    selected?.id === account.id
                                }
                            >
                                <div
                                    className={
                                        styles.accountInformation
                                    }
                                >
                                    <strong>
                                        {account.display_name}
                                    </strong>

                                    <span>
                                        WABA {account.meta_waba_id}
                                    </span>
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


            {/* =================================================
                WABA CONFIGURATION
               ================================================= */}

            <section className={styles.formPanel}>

                <header className={styles.panelHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            {t("Configuración")}
                        </span>

                        <h2>
                            {selected
                                ? selected.display_name
                                : t("Administración de cuenta")}
                        </h2>

                        <p>
                            {selected
                                ? t(
                                    "Revise el estado y administre la cuenta seleccionada."
                                )
                                : t(
                                    "Seleccione una cuenta o utilice Conectar con Meta."
                                )}
                        </p>
                    </div>
                </header>


                {/* =============================================
                    SELECTED WABA DETAILS
                   ============================================= */}

                {selected && (
                    <div className={styles.detailBody}>

                        {/* -------------------------------------
                            META CONNECTION STATUS
                           ------------------------------------- */}

                        <div className={styles.lifecycleSection}>

                            <div className={styles.lifecycleHeader}>
                                <h3>
                                    {t("Estado en Meta")}
                                </h3>

                                <p>
                                    {t(
                                        "Estado sincronizado por el backend."
                                    )}
                                </p>
                            </div>


                            {/* ---------------------------------
                                STATUS INFORMATION
                               --------------------------------- */}

                            <div className={styles.lifecycleGrid}>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        {t("Conexión")}
                                    </span>

                                    <strong>
                                        {selected.is_connected
                                            ? t("Conectada")
                                            : t("Desconectada")}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        {t("Webhook")}
                                    </span>

                                    <strong>
                                        {selected.is_webhook_configured
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
                                            selected.connected_at
                                        )}
                                    </strong>
                                </div>

                                <div className={styles.lifecycleField}>
                                    <span>
                                        {t("Última desconexión")}
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selected.disconnected_at
                                        )}
                                    </strong>
                                </div>
                            </div>


                            {/* ---------------------------------
                                REFRESH CONNECTION STATUS
                               --------------------------------- */}

                            <div className={styles.lifecycleActions}>
                                <button
                                    type="button"
                                    className={
                                        styles.secondaryButton
                                    }
                                    onClick={() =>
                                        lifecycle(
                                            refreshWhatsAppBusinessAccount,
                                            "refresh",
                                            "Estado actualizado correctamente."
                                        )
                                    }
                                    disabled={busy}
                                >
                                    {operation === "refresh"
                                        ? t("Actualizando...")
                                        : t("Actualizar estado")}
                                </button>
                            </div>
                        </div>


                        {/* =====================================
                            EDIT ACCOUNT
                           ===================================== */}

                        <form
                            className={styles.wabaForm}
                            onSubmit={handleSave}
                        >

                            {/* ---------------------------------
                                DISPLAY NAME
                               --------------------------------- */}

                            <div className={styles.formField}>
                                <label htmlFor="waba-name">
                                    {t("Nombre")}
                                </label>

                                <input
                                    id="waba-name"
                                    type="text"
                                    value={form.display_name}
                                    onChange={(event) =>
                                        changeField(
                                            "display_name",
                                            event.target.value
                                        )
                                    }
                                    disabled={busy}
                                    required
                                />
                            </div>


                            {/* ---------------------------------
                                NOTES
                               --------------------------------- */}

                            <div className={styles.formField}>
                                <label htmlFor="waba-notes">
                                    {t("Notas")}
                                </label>

                                <textarea
                                    id="waba-notes"
                                    value={form.notes}
                                    onChange={(event) =>
                                        changeField(
                                            "notes",
                                            event.target.value
                                        )
                                    }
                                    disabled={busy}
                                    rows={3}
                                />
                            </div>


                            {/* ---------------------------------
                                FORM ACTIONS
                               --------------------------------- */}

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={
                                        styles.secondaryButton
                                    }
                                    onClick={resetSelection}
                                    disabled={busy}
                                >
                                    {t("Cerrar")}
                                </button>

                                <button
                                    type="submit"
                                    className={
                                        styles.primaryButton
                                    }
                                    disabled={busy}
                                >
                                    {operation === "save"
                                        ? t("Guardando...")
                                        : t("Guardar cambios")}
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {/* =============================================
                    ADVANCED ADMINISTRATION
                   ============================================= */}

                <div className={styles.advancedArea}>

                    {/* -----------------------------------------
                        ADVANCED OPTIONS TOGGLE
                       ----------------------------------------- */}

                    <button
                        type="button"
                        className={styles.advancedToggle}
                        onClick={() =>
                            setAdvanced((value) => !value)
                        }
                        disabled={busy}
                        aria-expanded={advanced}
                    >
                        {t("Opciones avanzadas")}

                        {" "}

                        {advanced ? "−" : "+"}
                    </button>


                    {/* -----------------------------------------
                        ADVANCED OPTIONS CONTENT
                       ----------------------------------------- */}

                    {advanced && (
                        <div className={styles.advancedContent}>

                            {selected ? (

                                /* =================================
                                   EXISTING ACCOUNT OPERATIONS
                                   ================================= */

                                <>

                                    {/* -----------------------------
                                        META IDENTIFIERS
                                       ----------------------------- */}

                                    <div className={styles.lifecycleGrid}>

                                        <div className={styles.lifecycleField}>
                                            <span>
                                                Meta WABA ID
                                            </span>

                                            <strong>
                                                {selected.meta_waba_id}
                                            </strong>
                                        </div>

                                        <div className={styles.lifecycleField}>
                                            <span>
                                                Meta Business ID
                                            </span>

                                            <strong>
                                                {selected.meta_business_id}
                                            </strong>
                                        </div>
                                    </div>


                                    {/* -----------------------------
                                        LIFECYCLE ACTIONS
                                       ----------------------------- */}

                                    <div className={styles.lifecycleActions}>

                                        {!selected.is_connected && (
                                            <button
                                                type="button"
                                                className={
                                                    styles.secondaryButton
                                                }
                                                onClick={() =>
                                                    lifecycle(
                                                        connectWhatsAppBusinessAccount,
                                                        "connect",
                                                        "Cuenta conectada correctamente."
                                                    )
                                                }
                                                disabled={busy}
                                            >
                                                {operation === "connect"
                                                    ? t("Conectando...")
                                                    : t(
                                                        "Conectar cuenta existente"
                                                    )}
                                            </button>
                                        )}


                                        {selected.is_connected && (
                                            <button
                                                type="button"
                                                className={
                                                    styles.dangerButton
                                                }
                                                onClick={
                                                    handleDisconnect
                                                }
                                                disabled={busy}
                                            >
                                                {operation === "disconnect"
                                                    ? t("Desconectando...")
                                                    : t("Desconectar")}
                                            </button>
                                        )}


                                        <button
                                            type="button"
                                            className={
                                                styles.dangerButton
                                            }
                                            onClick={
                                                handleDeactivate
                                            }
                                            disabled={busy}
                                        >
                                            {operation === "deactivate"
                                                ? t("Desactivando...")
                                                : t("Desactivar")}
                                        </button>
                                    </div>
                                </>

                            ) : (

                                /* =================================
                                   MANUAL ACCOUNT REGISTRATION
                                   ================================= */

                                <>

                                    <p className={styles.advancedHelp}>
                                        {t(
                                            "El registro manual es una alternativa administrativa. Se recomienda conectar con Meta."
                                        )}
                                    </p>


                                    {!manual ? (

                                        /* -------------------------
                                           ENABLE MANUAL FORM
                                           ------------------------- */

                                        <button
                                            type="button"
                                            className={
                                                styles.secondaryButton
                                            }
                                            onClick={() =>
                                                setManual(true)
                                            }
                                            disabled={busy}
                                        >
                                            {t(
                                                "Crear cuenta manualmente"
                                            )}
                                        </button>

                                    ) : (

                                        /* -------------------------
                                           MANUAL FORM
                                           ------------------------- */

                                        <form
                                            className={
                                                styles.wabaForm
                                            }
                                            onSubmit={
                                                handleSave
                                            }
                                        >

                                            {/* ---------------------
                                                REQUIRED FIELDS
                                               --------------------- */}

                                            {[
                                                [
                                                    "display_name",
                                                    t("Nombre"),
                                                ],
                                                [
                                                    "meta_waba_id",
                                                    "Meta WABA ID",
                                                ],
                                                [
                                                    "meta_business_id",
                                                    "Meta Business ID",
                                                ],
                                            ].map(([key, label]) => (
                                                <div
                                                    className={
                                                        styles.formField
                                                    }
                                                    key={key}
                                                >
                                                    <label
                                                        htmlFor={
                                                            `manual-${key}`
                                                        }
                                                    >
                                                        {label}
                                                    </label>

                                                    <input
                                                        id={
                                                            `manual-${key}`
                                                        }
                                                        type="text"
                                                        value={
                                                            form[key]
                                                        }
                                                        onChange={(event) =>
                                                            changeField(
                                                                key,
                                                                event.target.value
                                                            )
                                                        }
                                                        disabled={busy}
                                                        required
                                                    />
                                                </div>
                                            ))}


                                            {/* ---------------------
                                                NOTES
                                               --------------------- */}

                                            <div className={styles.formField}>
                                                <label htmlFor="manual-notes">
                                                    {t("Notas")}
                                                </label>

                                                <textarea
                                                    id="manual-notes"
                                                    value={form.notes}
                                                    onChange={(event) =>
                                                        changeField(
                                                            "notes",
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={busy}
                                                    rows={3}
                                                />
                                            </div>


                                            {/* ---------------------
                                                FORM ACTIONS
                                               --------------------- */}

                                            <div className={styles.formActions}>

                                                <button
                                                    type="button"
                                                    className={
                                                        styles.secondaryButton
                                                    }
                                                    onClick={() =>
                                                        setManual(false)
                                                    }
                                                    disabled={busy}
                                                >
                                                    {t("Cancelar")}
                                                </button>

                                                <button
                                                    type="submit"
                                                    className={
                                                        styles.primaryButton
                                                    }
                                                    disabled={busy}
                                                >
                                                    {operation === "save"
                                                        ? t("Guardando...")
                                                        : t("Crear cuenta")}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default WabaForm;