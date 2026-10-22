import { useState } from "react";

import Button from "../../../common/buttons/Button/Button.jsx";
import Form from "../../../common/forms/Form/Form.jsx";
import FormActions from "../../../common/forms/FormActions/FormActions.jsx";
import FormField from "../../../common/forms/FormField/FormField.jsx";
import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";

import styles from "./CompanyForm.module.css";

/**
 * CompanyForm
 * Description: Own the entity draft and submit its values to the page.
 * Notes: Page keys reset the draft when selection changes. API mutations stay in the page.
 */
function CompanyForm({ selectedCompany, isSaving, isDeleting, onSubmit, onReset, onDeactivate }) {
    const [name, setName] = useState(selectedCompany?.name || "");
    const code = selectedCompany?.code || "";
    const [description, setDescription] = useState(selectedCompany?.description || "");

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit({ name, code, description });
    }

    const { t } = usePageTranslation();

    const isBusy = isSaving || isDeleting;

    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>{selectedCompany ? t("Editar empresa") : t("Nueva empresa")}</h2>

                    <p>
                        {selectedCompany
                            ? t("Modifique la información de la empresa seleccionada.")
                            : t("Complete la información para registrar una nueva empresa.")}
                    </p>
                </div>
            </div>

            <Form className={styles.entityForm} onSubmit={handleSubmit}>
                <FormField
                    id="company-name"
                    label={t("Nombre")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("Nombre de la empresa")}
                    disabled={isBusy}
                    required
                />

                <FormField
                    id="company-description"
                    label={t("Descripción")}
                    type="textarea"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={t("Descripción opcional")}
                    disabled={isBusy}
                />

                <FormActions
                    destructive={
                        selectedCompany ? (
                            <Button
                                className={styles.dangerButton}
                                type="button"
                                onClick={onDeactivate}
                                disabled={isBusy}
                            >
                                {isDeleting ? t("Desactivando...") : t("Desactivar")}
                            </Button>
                        ) : null
                    }
                >
                    {selectedCompany && (
                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onReset}
                            disabled={isBusy}
                        >
                            {t("Cancelar")}
                        </Button>
                    )}

                    <Button className={styles.primaryButton} type="submit" disabled={isBusy}>
                        {isSaving
                            ? t("Guardando...")
                            : selectedCompany
                              ? t("Guardar cambios")
                              : t("Crear empresa")}
                    </Button>
                </FormActions>
            </Form>
        </section>
    );
}

export default CompanyForm;
