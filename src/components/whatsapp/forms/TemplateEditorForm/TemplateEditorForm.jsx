import { useState } from "react";

import AlertMessage from "../../../common/feedback/AlertMessage/AlertMessage.jsx";
import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";

import styles from "./TemplateEditorForm.module.css";

/**
 * TemplateEditorForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function TemplateEditorForm({
    onSubmit,
    t,
    selectedTemplate,
    operationInProgress,
    TEMPLATE_CATEGORIES,
    PARAMETER_FORMATS,
    getStatusLabel,
    formatDateTime,
    handleDelete,
    isDeleting,
    resetForm,
    selectedAccountId,
    isSaving,
}) {
    const [name, setName] = useState(selectedTemplate?.name || "");
    const [language, setLanguage] = useState(selectedTemplate?.language || "");
    const [category, setCategory] = useState(selectedTemplate?.category || "UTILITY");
    const [parameterFormat, setParameterFormat] = useState(
        selectedTemplate?.parameter_format || "POSITIONAL",
    );
    const [componentsText, setComponentsText] = useState(
        JSON.stringify(selectedTemplate?.components || [], null, selectedTemplate ? 2 : 0),
    );
    const [errorMessage, setErrorMessage] = useState("");

    function parseComponents() {
        let parsedComponents;

        try {
            parsedComponents = JSON.parse(componentsText);
        } catch {
            throw new Error(t("El campo Components debe contener JSON válido."));
        }

        if (!Array.isArray(parsedComponents)) {
            throw new Error(t("Components debe contener un arreglo JSON."));
        }

        if (parsedComponents.length === 0) {
            throw new Error(t("La plantilla debe contener al menos un componente."));
        }

        return parsedComponents;
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (operationInProgress) return;
        let components;
        try {
            components = parseComponents();
        } catch (error) {
            setErrorMessage(error.message);
            return;
        }
        setErrorMessage("");
        onSubmit({ name, language, category, parameterFormat, components });
    }

    return (
        <Form className={styles.templateForm} onSubmit={handleSubmit}>
            <AlertMessage message={errorMessage} />
            <div className={styles.formField}>
                <label htmlFor="template-name">{t("Nombre")}</label>

                <Input
                    id="template-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="order_confirmation"
                    disabled={Boolean(selectedTemplate) || operationInProgress}
                    required
                />

                <span className={styles.fieldHelp}>
                    {t("Solo letras minúsculas, números y guiones bajos.")}
                </span>
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formField}>
                    <label htmlFor="template-language">{t("Idioma")}</label>

                    <Input
                        id="template-language"
                        type="text"
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                        placeholder="es"
                        disabled={Boolean(selectedTemplate) || operationInProgress}
                        required
                    />
                </div>

                <div className={styles.formField}>
                    <label htmlFor="template-category">{t("Categoría")}</label>

                    <Input
                        as="select"
                        id="template-category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        disabled={operationInProgress}
                        required
                    >
                        <OptionList
                            items={TEMPLATE_CATEGORIES.filter((option) => option.value)}
                            getValue={(option) => option.value}
                            getLabel={(option) => <>{t(option.label)}</>}
                        />
                    </Input>
                </div>
            </div>

            <div className={styles.formField}>
                <label htmlFor="template-parameter-format">{t("Formato de parámetros")}</label>

                <Input
                    as="select"
                    id="template-parameter-format"
                    value={parameterFormat}
                    onChange={(event) => setParameterFormat(event.target.value)}
                    disabled={Boolean(selectedTemplate) || operationInProgress}
                >
                    <OptionList
                        items={PARAMETER_FORMATS}
                        getValue={(option) => option.value}
                        getLabel={(option) => <>{t(option.label)}</>}
                    />
                </Input>
            </div>

            <div className={styles.formField}>
                <label htmlFor="template-components">{t("Components")}</label>

                <Input
                    as="textarea"
                    id="template-components"
                    value={componentsText}
                    onChange={(event) => setComponentsText(event.target.value)}
                    placeholder={t('[{"type":"BODY","text":"Hola {{1}}"}]')}
                    disabled={operationInProgress}
                    rows="12"
                    spellCheck="false"
                    required
                />

                <span className={styles.fieldHelp}>
                    {t("Definición normalizada en formato JSON.")}
                </span>
            </div>

            {selectedTemplate && (
                <div className={styles.lifecycleSection}>
                    <div className={styles.lifecycleGrid}>
                        <div>
                            <span>Meta Template ID</span>

                            <strong>{selectedTemplate.meta_template_id || "—"}</strong>
                        </div>

                        <div>
                            <span>{t("Estado")}</span>

                            <strong>{getStatusLabel(selectedTemplate.status)}</strong>
                        </div>

                        <div>
                            <span>{t("Disponible en Meta")}</span>

                            <strong>
                                {selectedTemplate.is_available_in_meta ? t("Sí") : t("No")}
                            </strong>
                        </div>

                        <div>
                            <span>{t("Última sincronización")}</span>

                            <strong>{formatDateTime(selectedTemplate.last_synced_at)}</strong>
                        </div>
                    </div>

                    {selectedTemplate.rejection_reason && (
                        <div className={styles.rejectionMessage}>
                            <strong>{t("Motivo de rechazo")}</strong>

                            <span>{selectedTemplate.rejection_reason}</span>
                        </div>
                    )}
                </div>
            )}

            <div className={styles.formActions}>
                {selectedTemplate && (
                    <Button
                        className={styles.dangerButton}
                        type="button"
                        onClick={handleDelete}
                        disabled={operationInProgress}
                    >
                        {isDeleting ? t("Eliminando...") : t("Eliminar")}
                    </Button>
                )}

                <div className={styles.primaryActions}>
                    {selectedTemplate && (
                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={resetForm}
                            disabled={operationInProgress}
                        >
                            {t("Cancelar")}
                        </Button>
                    )}

                    <Button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={!selectedAccountId || operationInProgress}
                    >
                        {isSaving
                            ? t("Guardando...")
                            : selectedTemplate
                              ? t("Guardar cambios")
                              : t("Enviar a Meta")}
                    </Button>
                </div>
            </div>
        </Form>
    );
}

export default TemplateEditorForm;
