import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";

import styles from "./ConversationSearchForm.module.css";

/**
 * ConversationSearchForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function ConversationSearchForm({ handleSearchSubmit, search, setSearch, t, isLoading }) {
    return (
        <Form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <div className={styles.searchField}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" />

                    <path d="m20 20-3.5-3.5" />
                </svg>

                <Input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("Buscar cliente o número...")}
                    aria-label={t("Buscar conversaciones")}
                />
            </div>

            <Button className={styles.searchButton} type="submit" disabled={isLoading}>
                {t("Buscar")}
            </Button>
        </Form>
    );
}

export default ConversationSearchForm;
