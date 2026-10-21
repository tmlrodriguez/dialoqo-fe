import FormActions from "../../../../components/common/FormActions/FormActions.jsx";
import FormField from "../../../../components/common/FormField/FormField.jsx";

import styles from "./OrganizationForms.module.css";
import { usePageTranslation } from "../../../usePageTranslation.js";


/**
 * CompanyForm
 *
 * Description:
 * - Render the company creation and editing form.
 * - Collect the company name and optional description.
 *
 * Notes:
 * - The company code field has been removed.
 * - Company identifiers are managed by the backend.
 * - The parent page controls form state and operations.
 * - Existing administrative actions remain unchanged.
 */
function CompanyForm({
    selectedCompany,
    name,
    description,
    isSaving,
    isDeleting,
    onNameChange,
    onDescriptionChange,
    onSubmit,
    onReset,
    onDeactivate,
}) {
    const { t } = usePageTranslation();

    const isBusy = isSaving || isDeleting;

    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>
                        {selectedCompany
                            ? t("Editar empresa")
                            : t("Nueva empresa")}
                    </h2>

                    <p>
                        {selectedCompany
                            ? t(
                                "Modifique la información de la empresa seleccionada."
                            )
                            : t(
                                "Complete la información para registrar una nueva empresa."
                            )}
                    </p>
                </div>
            </div>

            <form
                className={styles.entityForm}
                onSubmit={onSubmit}
            >
                {/* ------------------------------------------ */}
                {/* COMPANY NAME                               */}
                {/* ------------------------------------------ */}

                <FormField
                    id="company-name"
                    label={t("Nombre")}
                    value={name}
                    onChange={onNameChange}
                    placeholder={t("Nombre de la empresa")}
                    disabled={isBusy}
                    required
                />

                {/* ------------------------------------------ */}
                {/* COMPANY DESCRIPTION                        */}
                {/* ------------------------------------------ */}

                <FormField
                    id="company-description"
                    label={t("Descripción")}
                    type="textarea"
                    value={description}
                    onChange={onDescriptionChange}
                    placeholder={t("Descripción opcional")}
                    disabled={isBusy}
                />

                {/* ------------------------------------------ */}
                {/* FORM ACTIONS                               */}
                {/* ------------------------------------------ */}

                <FormActions
                    destructive={
                        selectedCompany ? (
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={onDeactivate}
                                disabled={isBusy}
                            >
                                {isDeleting
                                    ? t("Desactivando...")
                                    : t("Desactivar")}
                            </button>
                        ) : null
                    }
                >
                    {selectedCompany && (
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onReset}
                            disabled={isBusy}
                        >
                            {t("Cancelar")}
                        </button>
                    )}

                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={isBusy}
                    >
                        {isSaving
                            ? t("Guardando...")
                            : selectedCompany
                                ? t("Guardar cambios")
                                : t("Crear empresa")}
                    </button>
                </FormActions>
            </form>
        </section>
    );
}

export default CompanyForm;