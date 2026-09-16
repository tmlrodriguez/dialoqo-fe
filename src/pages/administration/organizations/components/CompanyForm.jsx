import FormActions from "../../../../components/common/FormActions/FormActions.jsx";
import FormField from "../../../../components/common/FormField/FormField.jsx";

import styles from "./OrganizationForms.module.css";
import { usePageTranslation } from "../../../usePageTranslation.js";


/**
 * CompanyForm
 *
 * Description:
 * - Renderizar el formulario de creación y edición de empresas.
 *
 * Notes:
 * - La página controla el estado y las operaciones.
 */
function CompanyForm({
    selectedCompany,
    name,
    code,
    description,
    isSaving,
    isDeleting,
    onNameChange,
    onCodeChange,
    onDescriptionChange,
    onSubmit,
    onReset,
    onDeactivate,
}) {
    const { t } = usePageTranslation();
    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>
                        {selectedCompany ? t("Editar empresa") : t("Nueva empresa")}
                    </h2>

                    <p>
                        {selectedCompany
                            ? t("Modifique la información de la empresa seleccionada.")
                            : t("Complete la información para registrar una nueva empresa.")}
                    </p>
                </div>
            </div>

            <form className={styles.entityForm} onSubmit={onSubmit}>
                <FormField
                    id="company-name"
                    label={t("Nombre")}
                    value={name}
                    onChange={onNameChange}
                    placeholder={t("Nombre de la empresa")}
                    disabled={isSaving || isDeleting}
                    required
                />

                <FormField
                    id="company-code"
                    label={t("Código")}
                    value={code}
                    onChange={onCodeChange}
                    placeholder={t("Código único")}
                    disabled={isSaving || isDeleting}
                    required
                />

                <FormField
                    id="company-description"
                    label={t("Descripción")}
                    type="textarea"
                    value={description}
                    onChange={onDescriptionChange}
                    placeholder={t("Descripción opcional")}
                    disabled={isSaving || isDeleting}
                />

                <FormActions
                    destructive={
                        selectedCompany ? (
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={onDeactivate}
                                disabled={isSaving || isDeleting}
                            >
                                {isDeleting ? t("Desactivando...") : t("Desactivar")}
                            </button>
                        ) : null
                    }
                >
                    {selectedCompany && (
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onReset}
                            disabled={isSaving || isDeleting}
                        >
                            {t("Cancelar")}
                        </button>
                    )}

                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={isSaving || isDeleting}
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
