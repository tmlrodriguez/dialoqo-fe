/**
 * LegalSectionListItem
 * Description: Present one collection entry and invoke its supplied actions.

 */
function LegalSectionListItem({ item: [title, text] }) {
    return (
        <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
        </section>
    );
}

export default LegalSectionListItem;
