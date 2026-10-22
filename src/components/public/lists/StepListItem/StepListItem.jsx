import styles from "./StepListItem.module.css";

/**
 * StepListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function StepListItem({ item: item, index: index, currentLanguage }) {
    const Icon = item.icon;
    return (
        <article key={item.es.title}>
            <div className={styles.stepNumber}>
                <Icon size={19} strokeWidth={1.8} />
                <small>{String(index + 1).padStart(2, "0")}</small>
            </div>

            <div className={styles.stepLine} />

            <div>
                <h3>{item[currentLanguage].title}</h3>
                <p>{item[currentLanguage].description}</p>
            </div>
        </article>
    );
}

export default StepListItem;
