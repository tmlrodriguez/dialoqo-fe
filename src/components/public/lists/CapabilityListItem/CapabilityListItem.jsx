import styles from "./CapabilityListItem.module.css";

/**
 * CapabilityListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function CapabilityListItem({ item: item, currentLanguage }) {
    const Icon = item.icon;
    return (
        <article className={styles.card} key={item.es.title}>
            <span className={styles.cardIcon}>
                <Icon size={22} strokeWidth={1.8} />
            </span>

            <h3>{item[currentLanguage].title}</h3>
            <p>{item[currentLanguage].description}</p>
        </article>
    );
}

export default CapabilityListItem;
