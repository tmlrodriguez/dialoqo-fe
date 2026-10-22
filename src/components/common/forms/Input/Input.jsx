/**
 * Input
 * Description: Provide one native field boundary for inputs, selects and textareas.
 * Notes: Feature CSS and native validation remain authoritative for presentation and behavior.
 */
function Input({ as: Element = "input", ...props }) {
    return <Element {...props} />;
}

export default Input;
