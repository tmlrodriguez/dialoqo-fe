/**
 * OptionListItem
 * Description: Render one native select option.
 */
function OptionListItem({ value, disabled = false, children }) {
    return (
        <option value={value} disabled={disabled}>
            {children}
        </option>
    );
}

export default OptionListItem;
