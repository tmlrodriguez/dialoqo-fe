import {
    useEffect,
    useMemo,
    useState,
} from "react";

import styles from "./TemplateParameterForm.module.css";
import { usePageTranslation } from "../../usePageTranslation.js";


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
function TemplateParameterForm({
    template,
    isSending,
    onBack,
    onSubmit,
}) {
    const { t } = usePageTranslation();
    const [values, setValues] =
        useState({});


    /**
     * extractPlaceholders
     *
     * Description:
     * - Extraer placeholders de una cadena de plantilla.
     */
    function extractPlaceholders(
        text
    ) {
        if (!text) {
            return [];
        }

        const matches = [
            ...String(text).matchAll(
                /\{\{\s*([^{}]+?)\s*\}\}/g
            ),
        ];

        return matches.map(
            (match) =>
                match[1].trim()
        );
    }


    /**
     * buildFields
     *
     * Description:
     * - Construir los campos editables requeridos por HEADER y BODY.
     */
    function buildFields() {
        const components =
            template?.components || [];

        const fields = [];

        components.forEach(
            (component) => {
                const type =
                    String(
                        component?.type || ""
                    ).toUpperCase();

                if (
                    type !== "HEADER" &&
                    type !== "BODY"
                ) {
                    return;
                }

                const placeholders =
                    extractPlaceholders(
                        component?.text
                    );

                placeholders.forEach(
                    (
                        placeholder,
                        index
                    ) => {
                        fields.push({
                            id: `${type.toLowerCase()}-${placeholder}-${index}`,
                            componentType:
                                type.toLowerCase(),
                            placeholder,
                            label:
                                type === "HEADER"
                                    ? `Encabezado · ${placeholder}`
                                    : `Mensaje · ${placeholder}`,
                        });
                    }
                );
            }
        );

        return fields;
    }


    const fields =
        useMemo(
            () =>
                buildFields(),
            [template]
        );


    /**
     * buildPreview
     *
     * Description:
     * - Obtener una representación textual básica del template.
     */
    function buildPreview() {
        const components =
            template?.components || [];

        return components
            .filter((component) =>
                ["HEADER", "BODY", "FOOTER"].includes(
                    String(
                        component?.type || ""
                    ).toUpperCase()
                )
            )
            .map(
                (component) =>
                    component.text
            )
            .filter(Boolean)
            .join("\n\n");
    }


    /**
     * handleValueChange
     *
     * Description:
     * - Actualizar el valor ingresado para un parámetro.
     */
    function handleValueChange(
        fieldId,
        value
    ) {
        setValues(
            (currentValues) => ({
                ...currentValues,
                [fieldId]:
                    value,
            })
        );
    }


    /**
     * buildSendComponents
     *
     * Description:
     * - Construir los componentes dinámicos requeridos por Meta.
     */
    function buildSendComponents() {
        const parameterFormat =
            String(
                template?.parameter_format ||
                "POSITIONAL"
            ).toUpperCase();

        const groupedFields =
            fields.reduce(
                (
                    groups,
                    field
                ) => {
                    if (
                        !groups[
                            field.componentType
                        ]
                    ) {
                        groups[
                            field.componentType
                        ] = [];
                    }

                    groups[
                        field.componentType
                    ].push(
                        field
                    );

                    return groups;
                },
                {}
            );

        return Object.entries(
            groupedFields
        ).map(
            ([
                componentType,
                componentFields,
            ]) => {
                const sortedFields =
                    parameterFormat ===
                    "POSITIONAL"
                        ? [
                            ...componentFields,
                        ].sort(
                            (
                                first,
                                second
                            ) =>
                                Number(
                                    first.placeholder
                                ) -
                                Number(
                                    second.placeholder
                                )
                        )
                        : componentFields;

                const parameters =
                    sortedFields.map(
                        (field) => {
                            const parameter = {
                                type: "text",
                                text:
                                    values[
                                        field.id
                                    ]?.trim() ||
                                    "",
                            };

                            if (
                                parameterFormat ===
                                "NAMED"
                            ) {
                                parameter.parameter_name =
                                    field.placeholder;
                            }

                            return parameter;
                        }
                    );

                return {
                    type:
                        componentType,
                    parameters,
                };
            }
        );
    }


    /**
     * handleSubmit
     *
     * Description:
     * - Validar y preparar los componentes para envío.
     */
    function handleSubmit(
        event
    ) {
        event.preventDefault();

        const missingValue =
            fields.some(
                (field) =>
                    !values[
                        field.id
                    ]?.trim()
            );

        if (missingValue) {
            return;
        }

        onSubmit?.(
            buildSendComponents()
        );
    }


    useEffect(() => {
        const initialValues = {};

        fields.forEach(
            (field) => {
                initialValues[
                    field.id
                ] = "";
            }
        );

        setValues(
            initialValues
        );
    }, [template?.id]);


    const preview =
        buildPreview();

    const isComplete =
        fields.every(
            (field) =>
                Boolean(
                    values[
                        field.id
                    ]?.trim()
                )
        );


    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
        >
            <header className={styles.header}>
                <button
                    className={styles.backButton}
                    type="button"
                    onClick={onBack}
                >
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
                </button>

                <div>
                    <span className={styles.eyebrow}>
                        Plantilla seleccionada
                    </span>

                    <h3>
                        {template?.name}
                    </h3>

                    <p>
                        {template?.language} · {template?.category}
                    </p>
                </div>
            </header>

            {preview && (
                <div className={styles.preview}>
                    <span>
                        Vista previa
                    </span>

                    <p>
                        {preview}
                    </p>
                </div>
            )}

            {fields.length > 0 ? (
                <div className={styles.fields}>
                    <div className={styles.sectionHeader}>
                        <strong>
                            Variables
                        </strong>

                        <span>
                            Complete los valores requeridos por la plantilla.
                        </span>
                    </div>

                    {fields.map(
                        (field) => (
                            <label
                                key={field.id}
                                className={styles.field}
                            >
                                <span>
                                    {field.label}
                                </span>

                                <input
                                    type="text"
                                    value={
                                        values[
                                            field.id
                                        ] || ""
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleValueChange(
                                            field.id,
                                            event.target.value
                                        )
                                    }
                                    placeholder={`Valor para {{${field.placeholder}}}`}
                                    disabled={
                                        isSending
                                    }
                                />
                            </label>
                        )
                    )}
                </div>
            ) : (
                <div className={styles.noParameters}>
                    <strong>
                        Esta plantilla no requiere variables.
                    </strong>

                    <span>
                        Puede enviarla directamente.
                    </span>
                </div>
            )}

            <footer className={styles.actions}>
                <button
                    className={styles.cancelButton}
                    type="button"
                    onClick={onBack}
                    disabled={isSending}
                >
                    {t("Cancelar")}
                </button>

                <button
                    className={styles.sendButton}
                    type="submit"
                    disabled={
                        isSending ||
                        !isComplete
                    }
                >
                    {isSending ? (
                        <>
                            <span className={styles.spinner}></span>
                            Enviando...
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
                </button>
            </footer>
        </form>
    );
}


export default TemplateParameterForm;
