import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";
import { useKeyedState } from "../../../../hooks/useKeyedState.js";

import styles from "./WhatsAppNumberEditForm.module.css";

/**
 * WhatsAppNumberEditForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function WhatsAppNumberEditForm({
    onSubmit,
    t,
    initialValues,
    busy,
    selected,
    manual,
    accounts,
    deactivate,
    reset,
    operation,
}) {
    const [form, setForm] = useKeyedState(initialValues, initialValues);

    function change(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!busy) onSubmit(form);
    }

    return (
        <Form className={styles.numberForm} onSubmit={handleSubmit}>
            <div className={styles.formField}>
                <label htmlFor="number-name">{t("Nombre")}</label>
                <Input
                    id="number-name"
                    value={form.display_name}
                    required
                    disabled={busy}
                    onChange={(event) => change("display_name", event.target.value)}
                />
            </div>
            <div className={styles.formField}>
                <label htmlFor="number-notes">{t("Notas")}</label>
                <Input
                    as="textarea"
                    id="number-notes"
                    value={form.notes}
                    rows={3}
                    disabled={busy}
                    onChange={(event) => change("notes", event.target.value)}
                />
            </div>
            <details
                key={selected?.id || "manual"}
                className={styles.advancedSection}
                defaultOpen={manual}
            >
                <summary>{t("Opciones avanzadas")}</summary>
                <div className={styles.advancedFields}>
                    <div className={styles.formField}>
                        <label htmlFor="number-waba">{t("Cuenta WABA")}</label>
                        <Input
                            as="select"
                            id="number-waba"
                            value={form.whatsapp_business_account}
                            disabled={busy || Boolean(selected)}
                            required
                            onChange={(event) =>
                                change("whatsapp_business_account", event.target.value)
                            }
                        >
                            <option value="">{t("Seleccione una cuenta WABA")}</option>
                            <OptionList
                                items={accounts}
                                getValue={(account) => account.id}
                                getLabel={(account) => <>{account.display_name}</>}
                            />
                        </Input>
                    </div>
                    <div className={styles.formField}>
                        <label htmlFor="number-phone">{t("Número telefónico")}</label>
                        <Input
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
                        <Input
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
                    <Button
                        type="button"
                        className={styles.dangerButton}
                        disabled={busy || selected.is_monitoring_enabled}
                        onClick={deactivate}
                    >
                        {t("Desactivar número")}
                    </Button>
                )}
                <div className={styles.primaryActions}>
                    <Button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={busy}
                        onClick={reset}
                    >
                        {t("Cancelar")}
                    </Button>
                    <Button
                        type="submit"
                        className={styles.primaryButton}
                        disabled={busy || (!selected && !form.whatsapp_business_account)}
                    >
                        {operation === "save"
                            ? t("Guardando...")
                            : selected
                              ? t("Guardar cambios")
                              : t("Crear número")}
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default WhatsAppNumberEditForm;
