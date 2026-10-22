import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import { useKeyedState } from "../../../../hooks/useKeyedState.js";
import BusinessAccountFieldList from "../../lists/BusinessAccountFieldList/BusinessAccountFieldList.jsx";

import styles from "./BusinessAccountRegistrationForm.module.css";

/**
 * BusinessAccountRegistrationForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function BusinessAccountRegistrationForm({
    onSubmit,
    t,
    initialValues,
    busy,
    setManual,
    operation,
}) {
    const [form, setForm] = useKeyedState(initialValues, initialValues);

    function changeField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!busy) onSubmit(form);
    }

    return (
        <Form className={styles.wabaForm} onSubmit={handleSubmit}>
            <BusinessAccountFieldList
                items={[
                    ["display_name", t("Nombre")],
                    ["meta_waba_id", "Meta WABA ID"],
                    ["meta_business_id", "Meta Business ID"],
                ]}
                form={form}
                changeField={changeField}
                busy={busy}
            />

            <div className={styles.formField}>
                <label htmlFor="manual-notes">{t("Notas")}</label>

                <Input
                    as="textarea"
                    id="manual-notes"
                    value={form.notes}
                    onChange={(event) => changeField("notes", event.target.value)}
                    disabled={busy}
                    rows={3}
                />
            </div>

            <div className={styles.formActions}>
                <Button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setManual(false)}
                    disabled={busy}
                >
                    {t("Cancelar")}
                </Button>

                <Button type="submit" className={styles.primaryButton} disabled={busy}>
                    {operation === "save" ? t("Guardando...") : t("Crear cuenta")}
                </Button>
            </div>
        </Form>
    );
}

export default BusinessAccountRegistrationForm;
