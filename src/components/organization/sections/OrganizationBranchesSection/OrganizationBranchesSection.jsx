import Button from "../../../common/buttons/Button/Button.jsx";
import EmptyState from "../../../common/feedback/EmptyState/EmptyState.jsx";
import EntityList from "../../../common/lists/EntityList/EntityList.jsx";
import Input from "../../../common/forms/Input/Input.jsx";
import LoadingState from "../../../common/feedback/LoadingState/LoadingState.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";
import BranchForm from "../../forms/BranchForm/BranchForm.jsx";

import BranchList from "../../lists/BranchList/BranchList.jsx";

import styles from "./OrganizationBranchesSection.module.css";

/**
 * OrganizationBranchesSection
 * Description: Present the contextbar section with page-owned data and actions.
 */
function OrganizationBranchesSection({
    activeSection,
    t,
    branchCompanyId,
    handleBranchCompanyChange,
    isLoadingCompanies,
    companies,
    resetBranchForm,
    isLoadingBranches,
    branches,
    selectedBranch,
    handleSelectBranch,
    branchFormVersion,
    isSaving,
    isDeleting,
    handleBranchSubmit,
    handleDeactivateBranch,
}) {
    return (
        activeSection === "branches" && (
            <>
                <div className={styles.contextBar}>
                    <div className={styles.contextField}>
                        <label htmlFor="branch-company">{t("Empresa")}</label>

                        <Input
                            as="select"
                            id="branch-company"
                            value={branchCompanyId}
                            onChange={handleBranchCompanyChange}
                            disabled={isLoadingCompanies || companies.length === 0}
                        >
                            {companies.length === 0 && (
                                <option value="">{t("No existen empresas disponibles")}</option>
                            )}

                            <OptionList
                                items={companies}
                                getValue={(company) => company.id}
                                getLabel={(company) => <>{company.name}</>}
                            />
                        </Input>
                    </div>
                </div>

                <div className={styles.workspace}>
                    <section className={styles.listPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>{t("Sucursales")}</h2>
                                <p>{t("Sucursales activas de la empresa seleccionada.")}</p>
                            </div>

                            <Button
                                className={styles.secondaryButton}
                                type="button"
                                onClick={resetBranchForm}
                                disabled={!branchCompanyId}
                            >
                                {t("Nueva sucursal")}
                            </Button>
                        </div>

                        {!branchCompanyId ? (
                            <EmptyState
                                icon="⌂"
                                title={t("Seleccione una empresa.")}
                                description={t(
                                    "Debe seleccionar una empresa antes de administrar sus sucursales.",
                                )}
                            />
                        ) : isLoadingBranches ? (
                            <LoadingState message={t("Cargando sucursales...")} />
                        ) : branches.length === 0 ? (
                            <EmptyState
                                icon="⌂"
                                title={t("No existen sucursales registradas.")}
                                description={t(
                                    "Cree la primera sucursal para la empresa seleccionada.",
                                )}
                            />
                        ) : (
                            <EntityList>
                                <BranchList
                                    items={branches}
                                    t={t}
                                    selectedBranch={selectedBranch}
                                    handleSelectBranch={handleSelectBranch}
                                />
                            </EntityList>
                        )}
                    </section>

                    <BranchForm
                        key={branchFormVersion}
                        selectedBranch={selectedBranch}
                        companyId={branchCompanyId}

                        isSaving={isSaving}
                        isDeleting={isDeleting}

                        onSubmit={handleBranchSubmit}
                        onReset={resetBranchForm}
                        onDeactivate={handleDeactivateBranch}
                    />
                </div>
            </>
        )
    );
}

export default OrganizationBranchesSection;
