import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import { useKeyedState } from "../../../../hooks/useKeyedState.js";

import styles from "./BusinessAccountEditForm.module.css";

/**
 * BusinessAccountEditForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function BusinessAccountEditForm({ onSubmit, t, initialValues, busy, resetSelection, operation }) {
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
            <div className={styles.formField}>
                <label htmlFor="waba-name">{t("Nombre")}</label>

                <Input
                    id="waba-name"
                    type="text"
                    value={form.display_name}
                    onChange={(event) => changeField("display_name", event.target.value)}
                    disabled={busy}
                    required
                />
            </div>

            <div className={styles.formField}>
                <label htmlFor="waba-notes">{t("Notas")}</label>

                <Input
                    as="textarea"
                    id="waba-notes"
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
                    onClick={resetSelection}
                    disabled={busy}
                >
                    {t("Cerrar")}
                </Button>

                <Button type="submit" className={styles.primaryButton} disabled={busy}>
                    {operation === "save" ? t("Guardando...") : t("Guardar cambios")}
                </Button>
            </div>
        </Form>
    );
}

export default BusinessAccountEditForm;
