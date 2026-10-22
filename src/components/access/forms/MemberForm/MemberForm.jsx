import { useState } from "react";

import Button from "../../../common/buttons/Button/Button.jsx";
import Form from "../../../common/forms/Form/Form.jsx";
import FormActions from "../../../common/forms/FormActions/FormActions.jsx";
import FormField from "../../../common/forms/FormField/FormField.jsx";
import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";

import styles from "./MemberForm.module.css";

/**
 * MemberForm
 * Description: Own the entity draft and submit its values to the page.
 * Notes: Page keys reset the draft when selection changes. API mutations stay in the page.
 */
function MemberForm({
    selectedMember,
    isSaving,
    isDeleting,
    isLoadingDetail,
    onSubmit,
    onReset,
    onDeactivate,
}) {
    const [username, setUsername] = useState(selectedMember?.username || "");
    const [email, setEmail] = useState(selectedMember?.email || "");
    const [firstName, setFirstName] = useState(selectedMember?.first_name || "");
    const [lastName, setLastName] = useState(selectedMember?.last_name || "");
    const [password, setPassword] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit({ username, email, firstName, lastName, password });
    }

    const { t } = usePageTranslation();
    return (
        <section className={styles.formPanel}>
            <div className={styles.panelHeader}>
                <div>
                    <h2>{selectedMember ? t("Editar miembro") : t("Nuevo miembro")}</h2>

                    <p>
                        {selectedMember
                            ? t("Modifique la información del miembro seleccionado.")
                            : t("Complete la información para registrar un nuevo miembro.")}
                    </p>
                </div>
            </div>

            <Form className={styles.entityForm} onSubmit={handleSubmit}>
                <FormField
                    id="member-first-name"
                    label={t("Nombre")}
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder={t("Nombre")}
                    disabled={isSaving || isDeleting || isLoadingDetail}
                />

                <FormField
                    id="member-last-name"
                    label={t("Apellido")}
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder={t("Apellido")}
                    disabled={isSaving || isDeleting || isLoadingDetail}
                />

                <FormField
                    id="member-username"
                    label={t("Usuario")}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder={t("Nombre de usuario")}
                    disabled={isSaving || isDeleting || isLoadingDetail}
                    autoComplete="off"
                    required
                />

                <FormField
                    id="member-email"
                    label={t("Correo electrónico")}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="correo@empresa.com"
                    disabled={isSaving || isDeleting || isLoadingDetail}
                    autoComplete="off"
                />

                {!selectedMember && (
                    <FormField
                        id="member-password"
                        label={t("Contraseña")}
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={t("Contraseña inicial")}
                        disabled={isSaving || isDeleting}
                        autoComplete="new-password"
                        required
                    />
                )}

                <FormActions
                    destructive={
                        selectedMember ? (
                            <Button
                                className={styles.dangerButton}
                                type="button"
                                onClick={onDeactivate}
                                disabled={isSaving || isDeleting || isLoadingDetail}
                            >
                                {isDeleting ? t("Desactivando...") : t("Desactivar")}
                            </Button>
                        ) : null
                    }
                >
                    {selectedMember && (
                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onReset}
                            disabled={isSaving || isDeleting || isLoadingDetail}
                        >
                            {t("Cancelar")}
                        </Button>
                    )}

                    <Button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={isSaving || isDeleting || isLoadingDetail}
                    >
                        {isSaving
                            ? t("Guardando...")
                            : selectedMember
                              ? t("Guardar cambios")
                              : t("Crear miembro")}
                    </Button>
                </FormActions>
            </Form>
        </section>
    );
}

export default MemberForm;
