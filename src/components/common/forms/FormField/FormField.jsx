import Input from "../Input/Input.jsx";
import OptionList from "../OptionList/OptionList.jsx";

import styles from "./FormField.module.css";

/**
 * FormField
 *
 * Description:
 * - Renderizar campos de formulario con estilo consistente.
 *
 * Notes:
 * - Soporta input, textarea y select.
 */
function FormField({
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder = "",
    disabled = false,
    required = false,
    autoComplete,
    rows = 5,
    options = [],
}) {
    return (
        <div className={styles.formField}>
            <label htmlFor={id}>{label}</label>

            {type === "textarea" && (
                <Input
                    as="textarea"
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    rows={rows}
                />
            )}

            {type === "select" && (
                <Input
                    as="select"
                    id={id}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                >
                    <OptionList
                        items={options}
                        getValue={(option) => option.value}
                        getLabel={(option) => <>{option.label}</>}
                        getDisabled={(option) => option.disabled}
                    />
                </Input>
            )}

            {type !== "textarea" && type !== "select" && (
                <Input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    autoComplete={autoComplete}
                />
            )}
        </div>
    );
}

export default FormField;
