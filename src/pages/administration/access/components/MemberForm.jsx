import FormActions from "../../../../components/common/FormActions/FormActions.jsx";
import FormField from "../../../../components/common/FormField/FormField.jsx";

import styles from "./AccessForms.module.css";
import { usePageTranslation } from "../../../usePageTranslation.js";


/**
 * MemberForm
 *
 * Description:
 * - Renderizar el formulario de creación y edición de miembros.
 *
 * Notes:
 * - Los miembros son usuarios autenticados de Dialoqo con rol MEMBER.
 * - La contraseña solo se solicita durante la creación.
 * - El rol MEMBER es asignado exclusivamente por el backend.
 */
function MemberForm({
    selectedMember,
    username,
    email,
    firstName,
    lastName,
    password,
    isSaving,
    isDeleting,
    isLoadingDetail,
    onUsernameChange,
    onEmailChange,
    onFirstNameChange,
    onLastNameChange,
    onPasswordChange,
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
                        {selectedMember ? t("Editar miembro") : t("Nuevo miembro")}
                    </h2>

                    <p>
                        {selectedMember
                            ? t("Modifique la información del miembro seleccionado.")
                            : t("Complete la información para registrar un nuevo miembro.")}
                    </p>
                </div>
            </div>

            <form className={styles.entityForm} onSubmit={onSubmit}>
                <FormField
                    id="member-first-name"
                    label={t("Nombre")}
                    value={firstName}
                    onChange={onFirstNameChange}
                    placeholder={t("Nombre")}
                    disabled={isSaving || isDeleting || isLoadingDetail}
                />

                <FormField
                    id="member-last-name"
                    label={t("Apellido")}
                    value={lastName}
                    onChange={onLastNameChange}
                    placeholder={t("Apellido")}
                    disabled={isSaving || isDeleting || isLoadingDetail}
                />

                <FormField
                    id="member-username"
                    label={t("Usuario")}
                    value={username}
                    onChange={onUsernameChange}
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
                    onChange={onEmailChange}
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
                        onChange={onPasswordChange}
                        placeholder={t("Contraseña inicial")}
                        disabled={isSaving || isDeleting}
                        autoComplete="new-password"
                        required
                    />
                )}

                <FormActions
                    destructive={
                        selectedMember ? (
                            <button
                                className={styles.dangerButton}
                                type="button"
                                onClick={onDeactivate}
                                disabled={isSaving || isDeleting || isLoadingDetail}
                            >
                                {isDeleting ? t("Desactivando...") : t("Desactivar")}
                            </button>
                        ) : null
                    }
                >
                    {selectedMember && (
                        <button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={onReset}
                            disabled={isSaving || isDeleting || isLoadingDetail}
                        >
                            {t("Cancelar")}
                        </button>
                    )}

                    <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={isSaving || isDeleting || isLoadingDetail}
                    >
                        {isSaving
                            ? t("Guardando...")
                            : selectedMember
                                ? t("Guardar cambios")
                                : t("Crear miembro")}
                    </button>
                </FormActions>
            </form>
        </section>
    );
}

export default MemberForm;
