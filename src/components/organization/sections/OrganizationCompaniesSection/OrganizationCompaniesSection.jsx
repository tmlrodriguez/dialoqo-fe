import Button from "../../../common/buttons/Button/Button.jsx";
import EmptyState from "../../../common/feedback/EmptyState/EmptyState.jsx";
import EntityList from "../../../common/lists/EntityList/EntityList.jsx";
import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import CompanyForm from "../../forms/CompanyForm/CompanyForm.jsx";

import CompanyList from "../../lists/CompanyList/CompanyList.jsx";

import styles from "./OrganizationCompaniesSection.module.css";

/**
 * OrganizationCompaniesSection
 * Description: Present a page section with explicit data and action props.
 */
function OrganizationCompaniesSection({
    activeSection,
    t,
    resetCompanyForm,
    isLoadingCompanies,
    companies,
    selectedCompany,
    handleSelectCompany,
    companyFormVersion,
    isSaving,
    isDeleting,
    handleCompanySubmit,
    handleDeactivateCompany,
}) {
    return (
        activeSection === "companies" && (
            <div className={styles.workspace}>
                <section className={styles.listPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2>{t("Empresas")}</h2>
                            <p>{t("Empresas activas administradas por su usuario.")}</p>
                        </div>

                        <Button
                            className={styles.secondaryButton}
                            type="button"
                            onClick={resetCompanyForm}
                        >
                            {t("Nueva empresa")}
                        </Button>
                    </div>

                    {isLoadingCompanies ? (
                        <LoadingState message={t("Cargando empresas...")} />
                    ) : companies.length === 0 ? (
                        <EmptyState
                            icon="▦"
                            title={t("No existen empresas registradas.")}
                            description={t(
                                "Cree la primera empresa para comenzar a configurar Dialoqo.",
                            )}
                        />
                    ) : (
                        <EntityList>
                            <CompanyList
                                items={companies}
                                t={t}
                                selectedCompany={selectedCompany}
                                handleSelectCompany={handleSelectCompany}
                            />
                        </EntityList>
                    )}
                </section>

                <CompanyForm
                    key={companyFormVersion}
                    selectedCompany={selectedCompany}

                    isSaving={isSaving}
                    isDeleting={isDeleting}

                    onSubmit={handleCompanySubmit}
                    onReset={resetCompanyForm}
                    onDeactivate={handleDeactivateCompany}
                />
            </div>
        )
    );
}

export default OrganizationCompaniesSection;
