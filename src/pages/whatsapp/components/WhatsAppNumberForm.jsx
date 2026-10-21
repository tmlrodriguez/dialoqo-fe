import { useEffect, useState } from "react";
import { getBranches } from "../../../services/organizations.js";
import {
    activateWhatsAppMonitoring,
    createWhatsAppNumber,
    deactivateWhatsAppMonitoring,
    deactivateWhatsAppNumber,
    getWhatsAppBusinessAccounts,
    getWhatsAppNumber,
    getWhatsAppNumbers,
    updateWhatsAppNumber,
    validateWhatsAppNumber,
} from "../../../services/whatsapp.js";
import { getLanguageLocale } from "../../../utils/i18n.js";
import { usePageTranslation } from "../../usePageTranslation.js";
import styles from "./WhatsAppNumberForm.module.css";

const EMPTY = {
    whatsapp_business_account: "",
    phone_number: "",
    meta_phone_number_id: "",
    display_name: "",
    notes: "",
};

/**
 * WhatsAppNumberForm
 * - Embedded Signup registers discovered numbers under the default branch.
 * - Monitoring activation remains a separate, explicit operation.
 * - Manual registration is an advanced fallback.
 * - Existing Meta identities are read-only in the frontend.
 */
function WhatsAppNumberForm({ companyId, onError, onSuccess }) {
    const { t } = usePageTranslation();
    const [branches, setBranches] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [numbers, setNumbers] = useState([]);
    const [branchId, setBranchId] = useState("");
    const [selected, setSelected] = useState(null);
    const [manual, setManual] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);
    const [loadingNumbers, setLoadingNumbers] = useState(false);
    const [operation, setOperation] = useState("");
    const busy = Boolean(operation);

    function clearMessages() {
        onError?.("");
        onSuccess?.("");
    }

    function change(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function reset() {
        setSelected(null);
        setManual(false);
        setForm({
            ...EMPTY,
            whatsapp_business_account: accounts[0] ? String(accounts[0].id) : "",
        });
    }

    function apply(number) {
        setSelected(number);
        setManual(false);
        setForm({
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
    useEffect(() => {
        let cancelled = false;
        setBranches([]);
        setAccounts([]);
        setBranchId("");
        setSelected(null);
        setNumbers([]);
        setManual(false);
        setForm(EMPTY);
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
                setForm({
                    ...EMPTY,
                    whatsapp_business_account: accountList[0] ? String(accountList[0].id) : "",
                });
            } catch (error) {
                if (!cancelled) onError?.(error.message || t("No fue posible cargar la configuración."));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadContext();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    // Load only the numbers belonging to the active branch.
    useEffect(() => {
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
                if (!cancelled) onError?.(error.message || t("No fue posible cargar los números."));
            } finally {
                if (!cancelled) setLoadingNumbers(false);
            }
        }
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId, branchId]);

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

    async function save(event) {
        event.preventDefault();
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

    return (
        <div className={styles.numberSection}>
            <div className={styles.contextBar}>
                <label htmlFor="number-branch">{t("Sucursal")}</label>
                <select
                    id="number-branch"
                    value={branchId}
                    disabled={loading || busy || branches.length === 0}
                    onChange={(event) => {
                        clearMessages();
                        setBranchId(event.target.value);
                        reset();
                    }}
                >
                    {branches.length === 0 && (
                        <option value="">{t("No existen sucursales disponibles")}</option>
                    )}
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                </select>
                <p>{t("Los números de Meta se registran inicialmente en la sucursal predeterminada.")}</p>
            </div>

            <div className={styles.numberWorkspace}>
                <section className={styles.listPanel}>
                    <header className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>{t("Canales")}</span>
                            <h2>{t("Números de WhatsApp")}</h2>
                            <p>{t("Seleccione un número para administrar su monitoreo.")}</p>
                        </div>
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            disabled={!branchId || busy}
                            onClick={() => {
                                clearMessages();
                                reset();
                                setManual(true);
                            }}
                        >
                            {t("Registro manual")}
                        </button>
                    </header>

                    {!branchId ? (
                        <div className={styles.emptyState}>{t("Seleccione una sucursal.")}</div>
                    ) : loadingNumbers ? (
                        <div className={styles.loadingState}>{t("Cargando números...")}</div>
                    ) : numbers.length === 0 ? (
                        <div className={styles.emptyState}>
                            <strong>{t("No existen números registrados.")}</strong>
                            <p>{t("Conecte una cuenta desde Cuentas WABA para registrar números automáticamente.")}</p>
                        </div>
                    ) : (
                        <div className={styles.numberList}>
                            {numbers.map((number) => (
                                <button
                                    key={number.id}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => selectNumber(number)}
                                    className={`${styles.numberCard} ${selected?.id === number.id ? styles.numberCardActive : ""}`}
                                >
                                    <div className={styles.numberInformation}>
                                        <strong>{number.display_name}</strong>
                                        <span>{number.phone_number}</span>
                                    </div>
                                    <div className={styles.statusGroup}>
                                        <span className={number.is_connected ? styles.connectedBadge : styles.disconnectedBadge}>
                                            {number.is_connected ? t("Conectado") : t("Sin validar")}
                                        </span>
                                        <span className={number.is_monitoring_enabled ? styles.monitoringBadge : styles.monitoringInactiveBadge}>
                                            {number.is_monitoring_enabled ? t("Monitoreando") : t("Sin monitoreo")}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className={styles.formPanel}>
                    <header className={styles.panelHeader}>
                        <div>
                            <span className={styles.eyebrow}>{t("Administración")}</span>
                            <h2>{selected?.display_name || (manual ? t("Registro manual") : t("Detalle del número"))}</h2>
                            <p>{t("Estado operativo y configuración administrativa.")}</p>
                        </div>
                    </header>

                    {!selected && !manual ? (
                        <div className={styles.emptyState}>
                            <strong>{t("Seleccione un número")}</strong>
                            <p>{t("El monitoreo se activa por número.")}</p>
                        </div>
                    ) : (
                        <div className={styles.detailsBody}>
                            {selected && (
                                <div className={styles.lifecycleSection}>
                                    <h3>{t("Estado operativo")}</h3>
                                    <div className={styles.lifecycleGrid}>
                                        <div><span>{t("Conexión")}</span><strong>{selected.is_connected ? t("Conectado") : t("Sin validar")}</strong></div>
                                        <div><span>{t("Monitoreo")}</span><strong>{selected.is_monitoring_enabled ? t("Activo") : t("Inactivo")}</strong></div>
                                        <div><span>{t("Inicio de monitoreo")}</span><strong>{dateText(selected.monitoring_started_at)}</strong></div>
                                        <div><span>{t("Fin de monitoreo")}</span><strong>{dateText(selected.monitoring_stopped_at)}</strong></div>
                                    </div>
                                    <div className={styles.lifecycleActions}>
                                        <button
                                            type="button"
                                            className={styles.secondaryButton}
                                            disabled={busy}
                                            onClick={() => mutate(
                                                "validate",
                                                (id) => validateWhatsAppNumber(companyId, branchId, id),
                                                "Número validado correctamente."
                                            )}
                                        >
                                            {operation === "validate" ? t("Validando...") : t("Validar con Meta")}
                                        </button>
                                        {selected.is_monitoring_enabled ? (
                                            <button
                                                type="button"
                                                className={styles.dangerButton}
                                                disabled={busy}
                                                onClick={() => {
                                                    if (!window.confirm(t("¿Desea detener el monitoreo?"))) return;
                                                    mutate("monitor", (id) => deactivateWhatsAppMonitoring(companyId, branchId, id), "Monitoreo detenido correctamente.");
                                                }}
                                            >
                                                {t("Detener monitoreo")}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className={styles.primaryButton}
                                                disabled={busy || !selected.is_connected}
                                                onClick={() => mutate("monitor", (id) => activateWhatsAppMonitoring(companyId, branchId, id), "Monitoreo activado correctamente.")}
                                            >
                                                {t("Activar monitoreo")}
                                            </button>
                                        )}
                                    </div>
                                    {!selected.is_connected && (
                                        <p className={styles.lifecycleNotice}>{t("Valide primero el número con Meta.")}</p>
                                    )}
                                </div>
                            )}

                            <form className={styles.numberForm} onSubmit={save}>
                                <div className={styles.formField}>
                                    <label htmlFor="number-name">{t("Nombre")}</label>
                                    <input
                                        id="number-name"
                                        value={form.display_name}
                                        required
                                        disabled={busy}
                                        onChange={(event) => change("display_name", event.target.value)}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label htmlFor="number-notes">{t("Notas")}</label>
                                    <textarea
                                        id="number-notes"
                                        value={form.notes}
                                        rows={3}
                                        disabled={busy}
                                        onChange={(event) => change("notes", event.target.value)}
                                    />
                                </div>
                                <details key={selected?.id || "manual"} className={styles.advancedSection} defaultOpen={manual}>
                                    <summary>{t("Opciones avanzadas")}</summary>
                                    <div className={styles.advancedFields}>
                                        <div className={styles.formField}>
                                            <label htmlFor="number-waba">{t("Cuenta WABA")}</label>
                                            <select
                                                id="number-waba"
                                                value={form.whatsapp_business_account}
                                                disabled={busy || Boolean(selected)}
                                                required
                                                onChange={(event) => change("whatsapp_business_account", event.target.value)}
                                            >
                                                <option value="">{t("Seleccione una cuenta WABA")}</option>
                                                {accounts.map((account) => (
                                                    <option key={account.id} value={account.id}>
                                                        {account.display_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formField}>
                                            <label htmlFor="number-phone">{t("Número telefónico")}</label>
                                            <input
                                                id="number-phone"
                                                value={form.phone_number}
                                                readOnly={Boolean(selected)}
                                                disabled={busy}
                                                required
                                                placeholder="+50499999999"
                                                onChange={(event) => change("phone_number", event.target.value)}
                                            />
                                        </div>
                                        <div className={styles.formField}>
                                            <label htmlFor="number-meta-id">Meta Phone Number ID</label>
                                            <input
                                                id="number-meta-id"
                                                value={form.meta_phone_number_id}
                                                readOnly={Boolean(selected)}
                                                disabled={busy}
                                                required
                                                onChange={(event) => change("meta_phone_number_id", event.target.value)}
                                            />
                                        </div>
                                    </div>
                                </details>
                                <div className={styles.formActions}>
                                    {selected && (
                                        <button
                                            type="button"
                                            className={styles.dangerButton}
                                            disabled={busy || selected.is_monitoring_enabled}
                                            onClick={deactivate}
                                        >
                                            {t("Desactivar número")}
                                        </button>
                                    )}
                                    <div className={styles.primaryActions}>
                                        <button type="button" className={styles.secondaryButton} disabled={busy} onClick={reset}>
                                            {t("Cancelar")}
                                        </button>
                                        <button
                                            type="submit"
                                            className={styles.primaryButton}
                                            disabled={busy || (!selected && !form.whatsapp_business_account)}
                                        >
                                            {operation === "save" ? t("Guardando...") : selected ? t("Guardar cambios") : t("Crear número")}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

export default WhatsAppNumberForm;
