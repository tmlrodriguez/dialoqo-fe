import Input from "../../../common/forms/Input/Input.jsx";

import styles from "./BusinessAccountFieldListItem.module.css";

/**
 * BusinessAccountFieldListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function BusinessAccountFieldListItem({ item: [key, label], form, changeField, busy }) {
    return (
        <div className={styles.formField} key={key}>
            <label htmlFor={`manual-${key}`}>{label}</label>

            <Input
                id={`manual-${key}`}
                type="text"
                value={form[key]}
                onChange={(event) => changeField(key, event.target.value)}
                disabled={busy}
                required
            />
        </div>
    );
}

export default BusinessAccountFieldListItem;
