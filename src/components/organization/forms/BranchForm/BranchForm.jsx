import { useState } from "react";

import Button from "../../../common/buttons/Button/Button.jsx";
import Form from "../../../common/forms/Form/Form.jsx";
import FormActions from "../../../common/forms/FormActions/FormActions.jsx";
import FormField from "../../../common/forms/FormField/FormField.jsx";
import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";

import styles from "./BranchForm.module.css";

/**
 * BranchForm
 * Description: Own the entity draft and submit its values to the page.
 * Notes: Page keys reset the draft when selection changes. API mutations stay in the page.
 */
function BranchForm({
    selectedBranch,
    companyId,
    isSaving,
    isDeleting,
    onSubmit,
    onReset,
    onDeactivate,
}) {
    const [name, setName] = useState(selectedBranch?.name || "");
    const code = selectedBranch?.code || "";
    const [description, setDescription] = useState(selectedBranch?.description || "");

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit({ name, code, description });
    }

    const { t } = usePageTranslation();

    const isBusy = isSaving || isDeleting;

    const isDisabled = !companyId || isBusy;

    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>{selectedBranch ? t("Editar sucursal") : t("Nueva sucursal")}</h2>

                    <p>
                        {selectedBranch
                            ? t("Modifique la información de la sucursal seleccionada.")
                            : t("Complete la información para registrar una nueva sucursal.")}
                    </p>
                </div>
            </div>

            <Form className={styles.entityForm} onSubmit={handleSubmit}>
                <FormField
                    id="branch-name"
                    label={t("Nombre")}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("Nombre de la sucursal")}
                    disabled={isDisabled}
                    required
                />

                <FormField
                    id="branch-description"
                    label={t("Descripción")}
                    type="textarea"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder={t("Descripción opcional")}
                    disabled={isDisabled}
                />

                <FormActions
                    destructive={
                        selectedBranch ? (
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
                    {selectedBranch && (
                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onReset}
                            disabled={isDisabled}
                        >
                            {t("Cancelar")}
                        </Button>
                    )}

                    <Button className={styles.primaryButton} type="submit" disabled={isDisabled}>
                        {isSaving
                            ? t("Guardando...")
                            : selectedBranch
                              ? t("Guardar cambios")
                              : t("Crear sucursal")}
                    </Button>
                </FormActions>
            </Form>
        </section>
    );
}

export default BranchForm;
