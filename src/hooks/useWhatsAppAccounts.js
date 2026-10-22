import { useRef, useState } from "react";

import { usePageTranslation } from "./usePageTranslation.js";
import { useResourceLifecycle } from "./useResourceLifecycle.js";
import { launchWhatsAppEmbeddedSignup } from "../services/metaEmbeddedSignup.js";
import {
    refreshWhatsAppBusinessAccount,
    connectWhatsAppBusinessAccount,
    completeWhatsAppEmbeddedSignup,
    createWhatsAppBusinessAccount,
    deactivateWhatsAppBusinessAccount,
    disconnectWhatsAppBusinessAccount,
    getWhatsAppBusinessAccount,
    getWhatsAppBusinessAccounts,
    updateWhatsAppBusinessAccount,
} from "../services/whatsapp.js";
import { getLanguageLocale } from "../utils/i18n.js";

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

/**
 * useWhatsAppAccounts
 * Description: Own the selected company resource, mutations and request lifecycle.
 */
export function useWhatsAppAccounts({ companyId, onError, onSuccess }) {
    const { t } = usePageTranslation();

    const companyRef = useRef(companyId);

    const [accounts, setAccounts] = useState([]);

    const [selected, setSelected] = useState(null);

    const [initialValues, setInitialValues] = useState(EMPTY_FORM);

    const [manual, setManual] = useState(false);

    const [advanced, setAdvanced] = useState(false);

    const [loading, setLoading] = useState(false);

    const [loadingDetail, setLoadingDetail] = useState(false);

    const [operation, setOperation] = useState("");

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

    /**
     * resetSelection
     *
     * Description:
     * - Clear the selected WABA.
     * - Restore the default administration interface.
     */
    function resetSelection() {
        setSelected(null);

        setInitialValues(EMPTY_FORM);

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

        setInitialValues({
            display_name: account.display_name || "",
            meta_waba_id: account.meta_waba_id || "",
            meta_business_id: account.meta_business_id || "",
            notes: account.notes || "",
        });

        setManual(false);

        setAdvanced(false);
    }

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
            const response = await getWhatsAppBusinessAccounts(id);

            if (!sameCompany(id)) {
                return;
            }

            setAccounts(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            if (!sameCompany(id)) {
                return;
            }

            setAccounts([]);

            onError?.(error.message || t("No fue posible cargar las cuentas."));
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
    async function loadDetail(accountId, id = companyId) {
        if (!id || !accountId) {
            return;
        }

        const response = await getWhatsAppBusinessAccount(id, accountId);

        if (sameCompany(id) && response?.data) {
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
        if (!companyId || !account?.id || busy || loadingDetail) {
            return;
        }

        const id = companyId;

        clearMessages();

        setLoadingDetail(true);

        try {
            await loadDetail(account.id, id);
        } catch (error) {
            if (sameCompany(id)) {
                onError?.(error.message || t("No fue posible cargar la cuenta."));
            }
        } finally {
            setLoadingDetail(false);
        }
    }

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
            const result = await launchWhatsAppEmbeddedSignup();

            if (result?.cancelled) {
                if (sameCompany(id)) {
                    onError?.(t("La conexión con Meta fue cancelada."));
                }

                return;
            }

            const session = result?.session;

            const sessionData = session?.data || {};

            const authorizationCode = result?.authorization?.code;

            const wabaId =
                sessionData.waba_id || sessionData.wabaId || result?.identifiers?.waba_id;

            const phoneNumberId =
                sessionData.phone_number_id ||
                sessionData.phoneNumberId ||
                result?.identifiers?.phone_number_id;

            const businessId =
                sessionData.business_id ||
                sessionData.business_portfolio_id ||
                sessionData.businessId ||
                result?.identifiers?.business_id;

            if (!EMBEDDED_SIGNUP_COMPLETION_EVENTS.has(session?.event)) {
                throw new Error(t("Meta no confirmó la finalización de Embedded Signup."));
            }

            if (!authorizationCode) {
                throw new Error(t("Meta no proporcionó el código de autorización."));
            }

            if (!wabaId) {
                throw new Error(t("Meta no proporcionó el WABA ID."));
            }

            if (!phoneNumberId) {
                throw new Error(t("Meta no proporcionó el Phone Number ID."));
            }

            const payload = {
                code: authorizationCode,
                waba_id: String(wabaId),
                phone_number_id: String(phoneNumberId),
            };

            if (businessId) {
                payload.business_id = String(businessId);
            }

            const response = await completeWhatsAppEmbeddedSignup(id, payload);

            const onboarding = response?.data;

            if (
                !onboarding?.account_id ||
                !onboarding?.is_connected ||
                !onboarding?.is_webhook_configured
            ) {
                throw new Error(t("Django no confirmó la conexión de WhatsApp Business."));
            }

            if (!sameCompany(id)) {
                return;
            }

            const registeredCount = Array.isArray(onboarding.registered_numbers)
                ? onboarding.registered_numbers.length
                : null;

            const countText =
                registeredCount === null
                    ? ""
                    : ` ${registeredCount} ${t("número(s) registrado(s).")}`;

            const successMessage =
                response?.success_message || t("WhatsApp Business conectado correctamente.");

            onSuccess?.(`${successMessage}${countText} ${t("Active el monitoreo desde Números.")}`);

            /*
             * Onboarding has already succeeded in Django.
             *
             * Refresh failures must not incorrectly report
             * that Meta onboarding failed.
             */

            try {
                await loadAccounts(id);

                await loadDetail(onboarding.account_id, id);
            } catch {
                if (sameCompany(id))
                    onError?.(
                        t("La conexión se completó, pero no fue posible actualizar la vista."),
                    );
            }
        } catch (error) {
            if (sameCompany(id)) {
                onError?.(error.message || t("No fue posible completar Embedded Signup."));
            }
        } finally {
            setOperation("");
        }
    }

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
    async function handleSave(form) {
        if (!companyId || busy || (!selected && !manual)) {
            return;
        }

        const id = companyId;

        const accountId = selected?.id;

        clearMessages();

        setOperation("save");

        try {
            if (accountId) {
                await updateWhatsAppBusinessAccount(id, accountId, {
                    display_name: form.display_name.trim(),

                    notes: form.notes.trim(),
                });
            } else {
                await createWhatsAppBusinessAccount(id, {
                    display_name: form.display_name.trim(),

                    meta_waba_id: form.meta_waba_id.trim(),

                    meta_business_id: form.meta_business_id.trim(),

                    notes: form.notes.trim(),
                });
            }

            if (!sameCompany(id)) {
                return;
            }

            onSuccess?.(t("Cuenta guardada correctamente."));

            if (accountId) {
                await loadDetail(accountId, id);
            } else {
                resetSelection();
            }

            await loadAccounts(id);
        } catch (error) {
            if (sameCompany(id)) {
                onError?.(error.message || t("No fue posible guardar la cuenta."));
            }
        } finally {
            setOperation("");
        }
    }

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
    async function lifecycle(action, name, successText) {
        if (!companyId || !selected || busy) {
            return;
        }

        const id = companyId;

        const accountId = selected.id;

        clearMessages();

        setOperation(name);

        try {
            const response = await action(id, accountId);

            if (!sameCompany(id)) {
                return;
            }

            onSuccess?.(response?.success_message || t(successText));

            await loadDetail(accountId, id);

            await loadAccounts(id);
        } catch (error) {
            if (sameCompany(id)) {
                onError?.(error.message || t("No fue posible completar la operación."));
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
                `${t("de Meta?")}`,
        );

        if (!confirmed) {
            return;
        }

        await lifecycle(
            disconnectWhatsAppBusinessAccount,
            "disconnect",
            "Cuenta desconectada correctamente.",
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
        if (!companyId || !selected || busy) {
            return;
        }

        const confirmed = window.confirm(
            `${t("¿Desea desactivar la cuenta")} ` + `"${selected.display_name}"?`,
        );

        if (!confirmed) {
            return;
        }

        const id = companyId;

        const accountId = selected.id;

        clearMessages();

        setOperation("deactivate");

        try {
            await deactivateWhatsAppBusinessAccount(id, accountId);

            if (!sameCompany(id)) {
                return;
            }

            resetSelection();

            onSuccess?.(t("Cuenta desactivada correctamente."));

            await loadAccounts(id);
        } catch (error) {
            if (sameCompany(id)) {
                onError?.(error.message || t("No fue posible desactivar la cuenta."));
            }
        } finally {
            setOperation("");
        }
    }

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

        return new Intl.DateTimeFormat(getLanguageLocale(), {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }

    useResourceLifecycle(
        () => {
            companyRef.current = companyId;

            setAccounts([]);

            resetSelection();

            loadAccounts(companyId);
        },
        JSON.stringify([companyId]),
    );

    const handleRefresh = () =>
        lifecycle(refreshWhatsAppBusinessAccount, "refresh", "Estado actualizado correctamente.");

    const handleConnect = () =>
        lifecycle(connectWhatsAppBusinessAccount, "connect", "Cuenta conectada correctamente.");

    return {
        t,
        handleSignup,
        companyId,
        busy,
        operation,
        loading,
        accounts,
        selected,
        selectAccount,
        loadingDetail,
        formatDateTime,
        handleSave,
        initialValues,
        resetSelection,
        setAdvanced,
        advanced,
        handleDisconnect,
        handleDeactivate,
        manual,
        setManual,
        handleRefresh,
        handleConnect,
    };
}
