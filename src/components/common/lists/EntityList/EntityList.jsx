import styles from "./EntityList.module.css";

/**
 * EntityList
 *
 * Description:
 * - Mostrar una colección vertical de entidades.
 *
 * Notes:
 * - Los elementos son proporcionados por la página que utiliza el componente.
 */
function EntityList({ children }) {
    return <div className={styles.entityList}>{children}</div>;
}

export default EntityList;
