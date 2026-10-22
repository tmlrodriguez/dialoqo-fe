import Input from "../../../common/forms/Input/Input.jsx";

import styles from "./TemplateFieldListItem.module.css";

/**
 * TemplateFieldListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function TemplateFieldListItem({ item: field, values, handleValueChange, t, isSending }) {
    return (
        <label key={field.id} className={styles.field}>
            <span>{field.label}</span>

            <Input
                type="text"
                value={values[field.id] || ""}
                onChange={(event) => handleValueChange(field.id, event.target.value)}
                placeholder={`${t("Valor para")} {{${field.placeholder}}}`}
                disabled={isSending}
            />
        </label>
    );
}

export default TemplateFieldListItem;
