import Button from "../../../common/buttons/Button/Button.jsx";

import Form from "../../../common/forms/Form/Form.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";

import styles from "./TemplateFilterForm.module.css";

/**
 * TemplateFilterForm
 * Description: Present the form fields and delegate submitted data to its feature controller.
 */
function TemplateFilterForm({
    handleApplyFilters,
    t,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    TEMPLATE_STATUSES,
    categoryFilter,
    setCategoryFilter,
    TEMPLATE_CATEGORIES,
    languageFilter,
    setLanguageFilter,
    handleResetFilters,
}) {
    return (
        <Form className={styles.filters} onSubmit={handleApplyFilters}>
            <div className={styles.filterField}>
                <label htmlFor="template-search">{t("Buscar")}</label>

                <Input
                    id="template-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("Nombre o idioma")}
                />
            </div>

            <div className={styles.filterField}>
                <label htmlFor="template-status-filter">{t("Estado")}</label>

                <Input
                    as="select"
                    id="template-status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                >
                    <OptionList
                        items={TEMPLATE_STATUSES}
                        getValue={(option) => option.value}
                        getLabel={(option) => <>{t(option.label)}</>}
                    />
                </Input>
            </div>

            <div className={styles.filterField}>
                <label htmlFor="template-category-filter">{t("Categoría")}</label>

                <Input
                    as="select"
                    id="template-category-filter"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                >
                    <OptionList
                        items={TEMPLATE_CATEGORIES}
                        getValue={(option) => option.value}
                        getLabel={(option) => <>{t(option.label)}</>}
                    />
                </Input>
            </div>

            <div className={styles.filterField}>
                <label htmlFor="template-language-filter">{t("Idioma")}</label>

                <Input
                    id="template-language-filter"
                    type="text"
                    value={languageFilter}
                    onChange={(event) => setLanguageFilter(event.target.value)}
                    placeholder="es, es_HN, en_US..."
                />
            </div>

            <div className={styles.filterActions}>
                <Button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={handleResetFilters}
                >
                    {t("Limpiar")}
                </Button>

                <Button className={styles.primaryButton} type="submit">
                    {t("Aplicar")}
                </Button>
            </div>
        </Form>
    );
}

export default TemplateFilterForm;
