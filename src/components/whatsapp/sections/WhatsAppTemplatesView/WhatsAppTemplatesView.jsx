import Button from "../../../common/buttons/Button/Button.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";
import ManagedTemplateList from "../../lists/ManagedTemplateList/ManagedTemplateList.jsx";
import TemplateEditorForm from "../../forms/TemplateEditorForm/TemplateEditorForm.jsx";

import TemplateFilterForm from "../../forms/TemplateFilterForm/TemplateFilterForm.jsx";

import styles from "./WhatsAppTemplatesView.module.css";

/**
 * WhatsAppTemplatesView
 * Description: Present WhatsApp resources and delegate all operations to the page.
 */
function WhatsAppTemplatesView({
    t,
    selectedAccountId,
    handleAccountChange,
    isLoadingAccounts,
    accounts,
    operationInProgress,
    handleSynchronize,
    isSynchronizing,
    handleApplyFilters,
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
    pagination,
    handleNewTemplate,
    isLoadingTemplates,
    templates,
    selectedTemplate,
    handleSelectTemplate,
    isLoadingDetail,
    getCategoryLabel,
    getStatusLabel,
    loadTemplates,
    currentPage,
    handleSubmit,
    PARAMETER_FORMATS,
    formatDateTime,
    handleDelete,
    isDeleting,
    resetForm,
    isSaving,
    templateFormVersion,
}) {
    return (
        <>
            <div className={styles.contextBar}>
                <div className={styles.contextHeader}>
                    <div className={styles.contextField}>
                        <label htmlFor="template-account">{t("Cuenta WABA")}</label>

                        <Input
                            as="select"
                            id="template-account"
                            value={selectedAccountId}
                            onChange={handleAccountChange}
                            disabled={
                                isLoadingAccounts || accounts.length === 0 || operationInProgress
                            }
                        >
                            {accounts.length === 0 && (
                                <option value="">{t("No existen cuentas WABA disponibles")}</option>
                            )}

                            <OptionList
                                items={accounts}
                                getValue={(account) => account.id}
                                getLabel={(account) => (
                                    <>
                                        {account.display_name} — {account.meta_waba_id}
                                    </>
                                )}
                            />
                        </Input>
                    </div>

                    <Button
                        className={styles.syncButton}
                        type="button"
                        onClick={handleSynchronize}
                        disabled={!selectedAccountId || operationInProgress}
                    >
                        {isSynchronizing ? t("Sincronizando...") : t("Sincronizar con Meta")}
                    </Button>
                </div>
            </div>

            {!selectedAccountId ? (
                <section className={styles.emptyPanel}>
                    <div className={styles.emptyIcon}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M5 4h14v16H5z" />
                            <path d="M8 8h8" />
                            <path d="M8 12h8" />
                            <path d="M8 16h5" />
                        </svg>
                    </div>

                    <strong>{t("Seleccione una cuenta WABA.")}</strong>

                    <span>
                        {t(
                            "Las plantillas pertenecen a una cuenta de WhatsApp Business específica.",
                        )}
                    </span>
                </section>
            ) : (
                <>
                    <TemplateFilterForm
                        handleApplyFilters={handleApplyFilters}
                        t={t}
                        search={search}
                        setSearch={setSearch}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        TEMPLATE_STATUSES={TEMPLATE_STATUSES}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        TEMPLATE_CATEGORIES={TEMPLATE_CATEGORIES}
                        languageFilter={languageFilter}
                        setLanguageFilter={setLanguageFilter}
                        handleResetFilters={handleResetFilters}
                    />

                    <div className={styles.templateWorkspace}>
                        <section className={styles.listPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <span className={styles.eyebrow}>Meta</span>

                                    <h2>{t("Plantillas")}</h2>

                                    <p>
                                        {pagination.count}{" "}
                                        {pagination.count === 1
                                            ? t("plantilla registrada")
                                            : t("plantillas registradas")}
                                    </p>
                                </div>

                                <Button
                                    className={styles.secondaryButton}
                                    type="button"
                                    onClick={handleNewTemplate}
                                    disabled={operationInProgress}
                                >
                                    {t("Nueva plantilla")}
                                </Button>
                            </div>

                            {isLoadingTemplates ? (
                                <div className={styles.loadingState}>
                                    {t("Cargando plantillas...")}
                                </div>
                            ) : templates.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            aria-hidden="true"
                                        >
                                            <path d="M5 4h14v16H5z" />
                                            <path d="M8 8h8" />
                                            <path d="M8 12h8" />
                                        </svg>
                                    </div>

                                    <strong>{t("No existen plantillas.")}</strong>

                                    <span>
                                        {t("Sincronice con Meta o cree una nueva plantilla.")}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.templateList}>
                                        <ManagedTemplateList
                                            items={templates}
                                            selectedTemplate={selectedTemplate}
                                            handleSelectTemplate={handleSelectTemplate}
                                            isLoadingDetail={isLoadingDetail}
                                            getCategoryLabel={getCategoryLabel}
                                            getStatusLabel={getStatusLabel}
                                        />
                                    </div>

                                    <div className={styles.pagination}>
                                        <Button
                                            className={styles.secondaryButton}
                                            type="button"
                                            disabled={!pagination.previous}
                                            onClick={() => loadTemplates(currentPage - 1)}
                                        >
                                            {t("Anterior")}
                                        </Button>

                                        <span>Página {currentPage}</span>

                                        <Button
                                            className={styles.secondaryButton}
                                            type="button"
                                            disabled={!pagination.next}
                                            onClick={() => loadTemplates(currentPage + 1)}
                                        >
                                            {t("Siguiente")}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </section>

                        <section className={styles.formPanel}>
                            <div className={styles.panelHeader}>
                                <div>
                                    <span className={styles.eyebrow}>{t("Configuración")}</span>

                                    <h2>
                                        {selectedTemplate
                                            ? t("Editar plantilla")
                                            : t("Nueva plantilla")}
                                    </h2>

                                    <p>
                                        {selectedTemplate
                                            ? t("Modifique los campos permitidos por Meta.")
                                            : t(
                                                  "Defina una nueva plantilla para enviarla a revisión.",
                                              )}
                                    </p>
                                </div>

                                {selectedTemplate && (
                                    <span
                                        className={`${styles.statusBadge} ${
                                            selectedTemplate.status === "APPROVED"
                                                ? styles.statusApproved
                                                : selectedTemplate.status === "REJECTED"
                                                  ? styles.statusRejected
                                                  : selectedTemplate.status === "PENDING"
                                                    ? styles.statusPending
                                                    : styles.statusNeutral
                                        }`}
                                    >
                                        {getStatusLabel(selectedTemplate.status)}
                                    </span>
                                )}
                            </div>

                            <TemplateEditorForm
                                key={templateFormVersion}
                                onSubmit={handleSubmit}
                                t={t}

                                selectedTemplate={selectedTemplate}
                                operationInProgress={operationInProgress}

                                TEMPLATE_CATEGORIES={TEMPLATE_CATEGORIES}

                                PARAMETER_FORMATS={PARAMETER_FORMATS}

                                getStatusLabel={getStatusLabel}
                                formatDateTime={formatDateTime}
                                handleDelete={handleDelete}
                                isDeleting={isDeleting}
                                resetForm={resetForm}
                                selectedAccountId={selectedAccountId}
                                isSaving={isSaving}
                            />
                        </section>
                    </div>
                </>
            )}
        </>
    );
}

export default WhatsAppTemplatesView;
