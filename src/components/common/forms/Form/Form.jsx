/**
 * Form
 * Description: Render a native form with the supplied attributes, events and fields.
 */
function Form({ children, ...props }) {
    return <form {...props}>{children}</form>;
}

export default Form;
