import { useState } from "react";

import { usePageTranslation } from "./usePageTranslation.js";
import { useResourceLifecycle } from "./useResourceLifecycle.js";
import { getBranches } from "../services/organizations.js";
import {
    validateWhatsAppNumber,
    deactivateWhatsAppMonitoring,
    activateWhatsAppMonitoring,
    createWhatsAppNumber,
    deactivateWhatsAppNumber,
    getWhatsAppBusinessAccounts,
    getWhatsAppNumber,
    getWhatsAppNumbers,
    updateWhatsAppNumber,
} from "../services/whatsapp.js";
import { getLanguageLocale } from "../utils/i18n.js";

const EMPTY = {
    whatsapp_business_account: "",
    phone_number: "",
    meta_phone_number_id: "",
    display_name: "",
    notes: "",
};

/**
 * useWhatsAppNumbers
 * Description: Own the selected company resource, mutations and request lifecycle.
 */
export function useWhatsAppNumbers({ companyId, onError, onSuccess }) {
    const { t } = usePageTranslation();
    const [branches, setBranches] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [numbers, setNumbers] = useState([]);
    const [branchId, setBranchId] = useState("");
    const [selected, setSelected] = useState(null);
    const [manual, setManual] = useState(false);
    const [initialValues, setInitialValues] = useState(EMPTY);
    const [loading, setLoading] = useState(false);
    const [loadingNumbers, setLoadingNumbers] = useState(false);
    const [operation, setOperation] = useState("");
    const busy = Boolean(operation);

    function clearMessages() {
        onError?.("");
        onSuccess?.("");
    }

    function reset() {
        setSelected(null);
        setManual(false);
        setInitialValues({
            ...EMPTY,
            whatsapp_business_account: accounts[0] ? String(accounts[0].id) : "",
        });
    }

    function apply(number) {
        setSelected(number);
        setManual(false);
        setInitialValues({
            whatsapp_business_account: String(number.whatsapp_business_account || ""),
            phone_number: number.phone_number || "",
            meta_phone_number_id: number.meta_phone_number_id || "",
            display_name: number.display_name || "",
            notes: number.notes || "",
        });
    }

    function dateText(value) {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat(getLanguageLocale(), {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(date);
    }

    // Load company context. Discard responses from an obsolete company.
    useResourceLifecycle(
        () => {
            let cancelled = false;
            setBranches([]);
            setAccounts([]);
            setBranchId("");
            setSelected(null);
            setNumbers([]);
            setManual(false);
            setInitialValues(EMPTY);
            if (!companyId) return;

            async function loadContext() {
                setLoading(true);
                try {
                    const [branchResponse, accountResponse] = await Promise.all([
                        getBranches(companyId),
                        getWhatsAppBusinessAccounts(companyId),
                    ]);
                    if (cancelled) return;
                    const branchList = branchResponse?.data || [];
                    const accountList = accountResponse?.data || [];
                    setBranches(branchList);
                    setAccounts(accountList);
                    setBranchId(branchList[0] ? String(branchList[0].id) : "");
                    setInitialValues({
                        ...EMPTY,
                        whatsapp_business_account: accountList[0] ? String(accountList[0].id) : "",
                    });
                } catch (error) {
                    if (!cancelled)
                        onError?.(error.message || t("No fue posible cargar la configuración."));
                } finally {
                    if (!cancelled) setLoading(false);
                }
            }
            loadContext();
            return () => {
                cancelled = true;
            };
        },
        JSON.stringify([companyId]),
    );

    // Load only the numbers belonging to the active branch.
    useResourceLifecycle(
        () => {
            let cancelled = false;
            setNumbers([]);
            setSelected(null);
            setManual(false);
            if (!companyId || !branchId) return;

            async function load() {
                setLoadingNumbers(true);
                try {
                    const response = await getWhatsAppNumbers(companyId, branchId);
                    if (!cancelled) setNumbers(response?.data || []);
                } catch (error) {
                    if (!cancelled)
                        onError?.(error.message || t("No fue posible cargar los números."));
                } finally {
                    if (!cancelled) setLoadingNumbers(false);
                }
            }
            load();
            return () => {
                cancelled = true;
            };
        },
        JSON.stringify([companyId, branchId]),
    );

    async function refreshList() {
        const response = await getWhatsAppNumbers(companyId, branchId);
        setNumbers(response?.data || []);
    }

    async function refreshDetail(id) {
        const response = await getWhatsAppNumber(companyId, branchId, id);
        if (!response?.data) throw new Error(t("No fue posible cargar el número."));
        apply(response.data);
    }

    async function selectNumber(number) {
        if (!number?.id || busy) return;
        clearMessages();
        setOperation("load");
        try {
            await refreshDetail(number.id);
        } catch (error) {
            onError?.(error.message || t("No fue posible cargar el número."));
        } finally {
            setOperation("");
        }
    }

    async function mutate(name, request, successText) {
        if (!selected || busy) return;
        const id = selected.id;
        clearMessages();
        setOperation(name);
        try {
            const response = await request(id);
            onSuccess?.(response?.success_message || t(successText));
            try {
                await refreshList();
                await refreshDetail(id);
            } catch {
                // A failed refresh does not invalidate a successful mutation.
            }
        } catch (error) {
            onError?.(error.message || t("No fue posible completar la operación."));
        } finally {
            setOperation("");
        }
    }

    async function save(form) {
        if (!companyId || !branchId || busy) return;
        clearMessages();
        setOperation("save");
        try {
            if (selected) {
                await updateWhatsAppNumber(companyId, branchId, selected.id, {
                    display_name: form.display_name.trim(),
                    notes: form.notes.trim(),
                });
                onSuccess?.(t("Número actualizado correctamente."));
                await refreshDetail(selected.id);
            } else {
                await createWhatsAppNumber(companyId, branchId, {
                    whatsapp_business_account: Number(form.whatsapp_business_account),
                    phone_number: form.phone_number.trim(),
                    meta_phone_number_id: form.meta_phone_number_id.trim(),
                    display_name: form.display_name.trim(),
                    notes: form.notes.trim(),
                });
                onSuccess?.(t("Número creado. Valídelo con Meta antes de activar el monitoreo."));
                reset();
            }
            await refreshList();
        } catch (error) {
            onError?.(error.message || t("No fue posible guardar el número."));
        } finally {
            setOperation("");
        }
    }

    async function deactivate() {
        if (!selected || busy) return;
        if (!window.confirm(t("¿Desea desactivar este número?"))) return;
        clearMessages();
        setOperation("delete");
        try {
            await deactivateWhatsAppNumber(companyId, branchId, selected.id);
            reset();
            onSuccess?.(t("Número desactivado correctamente."));
            await refreshList();
        } catch (error) {
            onError?.(error.message || t("No fue posible desactivar el número."));
        } finally {
            setOperation("");
        }
    }

    const handleValidate = () =>
        mutate(
            "validate",
            (id) => validateWhatsAppNumber(companyId, branchId, id),
            "Número validado correctamente.",
        );

    const handleDeactivateMonitoring = () => {
        if (!window.confirm(t("¿Desea detener el monitoreo?"))) return;
        mutate(
            "monitor",
            (id) => deactivateWhatsAppMonitoring(companyId, branchId, id),
            "Monitoreo detenido correctamente.",
        );
    };

    const handleActivateMonitoring = () =>
        mutate(
            "monitor",
            (id) => activateWhatsAppMonitoring(companyId, branchId, id),
            "Monitoreo activado correctamente.",
        );

    return {
        t,
        branchId,
        loading,
        busy,
        branches,
        clearMessages,
        setBranchId,
        reset,
        setManual,
        loadingNumbers,
        numbers,
        selectNumber,
        selected,
        manual,
        dateText,
        companyId,
        operation,
        save,
        initialValues,
        accounts,
        deactivate,
        handleValidate,
        handleDeactivateMonitoring,
        handleActivateMonitoring,
    };
}
