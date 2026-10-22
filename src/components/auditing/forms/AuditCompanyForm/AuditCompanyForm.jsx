import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";

import styles from "./AuditCompanyForm.module.css";

/**
 * AuditCompanyForm
 * Description: Present the contextbar section with page-owned data and actions.
 */
function AuditCompanyForm({
    t,
    selectedCompanyId,
    handleCompanyChange,
    isLoadingCompanies,
    companies,
}) {
    return (
        <div className={styles.contextBar}>
            <div className={styles.contextField}>
                <label htmlFor="audit-company">{t("Empresa")}</label>

                <Input
                    as="select"
                    id="audit-company"
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
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
    );
}

export default AuditCompanyForm;
