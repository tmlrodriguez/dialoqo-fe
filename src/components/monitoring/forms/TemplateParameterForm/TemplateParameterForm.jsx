import { useMemo } from "react";

import Button from "../../../common/buttons/Button/Button.jsx";
import { useKeyedState } from "../../../../hooks/useKeyedState.js";
import { usePageTranslation } from "../../../../hooks/usePageTranslation.js";

import { buildFields } from "../../../../utils/templateParameters.js";
import TemplateFieldList from "../../lists/TemplateFieldList/TemplateFieldList.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import styles from "./TemplateParameterForm.module.css";

/**
 * TemplateParameterForm
 *
 * Description:
 * - Recopilar los valores requeridos por una plantilla WhatsApp.
 *
 * Notes:
 * - Soporta parámetros de texto posicionales y nombrados.
 * - Los parámetros se construyen utilizando el formato esperado por Meta.
 * - La primera versión interactiva soporta variables de texto HEADER y BODY.
 */
function TemplateParameterForm({ template, isSending, onBack, onSubmit }) {
    const { t } = usePageTranslation();
    const [values, setValues] = useKeyedState({}, template?.id);

    const fields = useMemo(() => buildFields(template, t), [template, t]);

    /**
     * buildPreview
     *
     * Description:
     * - Obtener una representación textual básica del template.
     */
    function buildPreview() {
        const components = template?.components || [];

        return components
            .filter((component) =>
                ["HEADER", "BODY", "FOOTER"].includes(String(component?.type || "").toUpperCase()),
            )
            .map((component) => component.text)
            .filter(Boolean)
            .join("\n\n");
    }

    /**
     * handleValueChange
     *
     * Description:
     * - Actualizar el valor ingresado para un parámetro.
     */
    function handleValueChange(fieldId, value) {
        setValues((currentValues) => ({
            ...currentValues,
            [fieldId]: value,
        }));
    }

    /**
     * buildSendComponents
     *
     * Description:
     * - Construir los componentes dinámicos requeridos por Meta.
     */
    function buildSendComponents() {
        const parameterFormat = String(template?.parameter_format || "POSITIONAL").toUpperCase();

        const groupedFields = fields.reduce((groups, field) => {
            if (!groups[field.componentType]) {
                groups[field.componentType] = [];
            }

            groups[field.componentType].push(field);

            return groups;
        }, {});

        return Object.entries(groupedFields).map(([componentType, componentFields]) => {
            const sortedFields =
                parameterFormat === "POSITIONAL"
                    ? [...componentFields].sort(
                          (first, second) => Number(first.placeholder) - Number(second.placeholder),
                      )
                    : componentFields;

            const parameters = sortedFields.map((field) => {
                const parameter = {
                    type: "text",
                    text: values[field.id]?.trim() || "",
                };

                if (parameterFormat === "NAMED") {
                    parameter.parameter_name = field.placeholder;
                }

                return parameter;
            });

            return {
                type: componentType,
                parameters,
            };
        });
    }

    /**
     * handleSubmit
     *
     * Description:
     * - Validar y preparar los componentes para envío.
     */
    function handleSubmit(event) {
        event.preventDefault();

        const missingValue = fields.some((field) => !values[field.id]?.trim());

        if (missingValue) {
            return;
        }

        onSubmit?.(buildSendComponents());
    }

    const preview = buildPreview();

    const isComplete = fields.every((field) => Boolean(values[field.id]?.trim()));

    return (
        <Form className={styles.form} onSubmit={handleSubmit}>
            <header className={styles.header}>
                <Button className={styles.backButton} type="button" onClick={onBack}>
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>

                    {t("Plantillas")}
                </Button>

                <div>
                    <span className={styles.eyebrow}>{t("Plantilla seleccionada")}</span>

                    <h3>{template?.name}</h3>

                    <p>
                        {template?.language} · {template?.category}
                    </p>
                </div>
            </header>

            {preview && (
                <div className={styles.preview}>
                    <span>{t("Vista previa")}</span>

                    <p>{preview}</p>
                </div>
            )}

            {fields.length > 0 ? (
                <div className={styles.fields}>
                    <div className={styles.sectionHeader}>
                        <strong>{t("Variables")}</strong>

                        <span>{t("Complete los valores requeridos por la plantilla.")}</span>
                    </div>

                    <TemplateFieldList
                        items={fields}
                        values={values}
                        handleValueChange={handleValueChange}
                        t={t}
                        isSending={isSending}
                    />
                </div>
            ) : (
                <div className={styles.noParameters}>
                    <strong>{t("Esta plantilla no requiere variables.")}</strong>

                    <span>{t("Puede enviarla directamente.")}</span>
                </div>
            )}

            <footer className={styles.actions}>
                <Button
                    className={styles.cancelButton}
                    type="button"
                    onClick={onBack}
                    disabled={isSending}
                >
                    {t("Cancelar")}
                </Button>

                <Button
                    className={styles.sendButton}
                    type="submit"
                    disabled={isSending || !isComplete}
                >
                    {isSending ? (
                        <>
                            <span className={styles.spinner}></span>
                            {t("Enviando...")}
                        </>
                    ) : (
                        <>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>

                            {t("Enviar plantilla")}
                        </>
                    )}
                </Button>
            </footer>
        </Form>
    );
}

export default TemplateParameterForm;
