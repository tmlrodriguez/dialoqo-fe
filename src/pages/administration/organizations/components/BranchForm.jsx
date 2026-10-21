import FormActions from "../../../../components/common/FormActions/FormActions.jsx";
import FormField from "../../../../components/common/FormField/FormField.jsx";

import styles from "./OrganizationForms.module.css";
import { usePageTranslation } from "../../../usePageTranslation.js";


/**
 * BranchForm
 *
 * Description:
 * - Render the branch creation and editing form.
 * - Collect the branch name and optional description.
 *
 * Notes:
 * - The branch code field has been removed.
 * - Branch identifiers are managed by the backend.
 * - Each branch belongs to the selected company.
 * - The parent page controls form state and operations.
 * - Existing administrative actions remain unchanged.
 */
function BranchForm({
    selectedBranch,
    companyId,
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

    const isDisabled = !companyId || isBusy;

    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>
                        {selectedBranch
                            ? t("Editar sucursal")
                            : t("Nueva sucursal")}
                    </h2>

                    <p>
                        {selectedBranch
                            ? t(
                                "Modifique la información de la sucursal seleccionada."
                            )
                            : t(
                                "Complete la información para registrar una nueva sucursal."
                            )}
                    </p>
                </div>
            </div>

            <form
                className={styles.entityForm}
                onSubmit={onSubmit}
            >
                {/* ------------------------------------------ */}
                {/* BRANCH NAME                                */}
                {/* ------------------------------------------ */}

                <FormField
                    id="branch-name"
                    label={t("Nombre")}
                    value={name}
                    onChange={onNameChange}
                    placeholder={t("Nombre de la sucursal")}
                    disabled={isDisabled}
                    required
                />

                {/* ------------------------------------------ */}
                {/* BRANCH DESCRIPTION                         */}
                {/* ------------------------------------------ */}

                <FormField
                    id="branch-description"
                    label={t("Descripción")}
                    type="textarea"
                    value={description}
                    onChange={onDescriptionChange}
                    placeholder={t("Descripción opcional")}
                    disabled={isDisabled}
                />

                {/* ------------------------------------------ */}
                {/* FORM ACTIONS                               */}
                {/* ------------------------------------------ */}

                <FormActions
                    destructive={
                        selectedBranch ? (
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
                    {selectedBranch && (
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onReset}
                            disabled={isDisabled}
                        >
                            {t("Cancelar")}
                        </button>
                    )}

                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={isDisabled}
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