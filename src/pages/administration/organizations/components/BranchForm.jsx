import FormActions from "../../../../components/common/FormActions/FormActions.jsx";
import FormField from "../../../../components/common/FormField/FormField.jsx";

import styles from "./OrganizationForms.module.css";
import { usePageTranslation } from "../../../usePageTranslation.js";


/**
 * BranchForm
 *
 * Description:
 * - Renderizar el formulario de creación y edición de sucursales.
 *
 * Notes:
 * - La sucursal permanece asociada a la empresa seleccionada.
 */
function BranchForm({
    selectedBranch,
    companyId,
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
                        {selectedBranch ? t("Editar sucursal") : t("Nueva sucursal")}
                    </h2>

                    <p>
                        {selectedBranch
                            ? t("Modifique la información de la sucursal seleccionada.")
                            : t("Complete la información para registrar una nueva sucursal.")}
                    </p>
                </div>
            </div>

            <form className={styles.entityForm} onSubmit={onSubmit}>
                <FormField
                    id="branch-name"
                    label={t("Nombre")}
                    value={name}
                    onChange={onNameChange}
                    placeholder={t("Nombre de la sucursal")}
                    disabled={!companyId || isSaving || isDeleting}
                    required
                />

                <FormField
                    id="branch-code"
                    label={t("Código")}
                    value={code}
                    onChange={onCodeChange}
                    placeholder={t("Código de la sucursal")}
                    disabled={!companyId || isSaving || isDeleting}
                    required
                />

                <FormField
                    id="branch-description"
                    label={t("Descripción")}
                    type="textarea"
                    value={description}
                    onChange={onDescriptionChange}
                    placeholder={t("Descripción opcional")}
                    disabled={!companyId || isSaving || isDeleting}
                />

                <FormActions
                    destructive={
                        selectedBranch ? (
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
                    {selectedBranch && (
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
                        disabled={!companyId || isSaving || isDeleting}
                    >
                        {isSaving
                            ? t("Guardando...")
                            : selectedBranch
                                ? t("Guardar cambios")
                                : t("Crear sucursal")}
                    </button>
                </FormActions>
            </form>
        </section>
    );
}

export default BranchForm;
