import Input from "../../../common/forms/Input/Input.jsx";
import OptionList from "../../../common/forms/OptionList/OptionList.jsx";

import styles from "./WhatsAppCompanyForm.module.css";

/**
 * WhatsAppCompanyForm
 * Description: Present the contextbar section with page-owned data and actions.
 */
function WhatsAppCompanyForm({
    t,
    selectedCompanyId,
    handleCompanyChange,
    isLoadingCompanies,
    hasCompanies,
    companies,
}) {
    return (
        <div className={styles.contextBar}>
            <div className={styles.contextField}>
                <label htmlFor="whatsapp-company">{t("Empresa")}</label>

                <Input
                    as="select"
                    id="whatsapp-company"
                    value={selectedCompanyId}
                    onChange={handleCompanyChange}
                    disabled={isLoadingCompanies || !hasCompanies}
                >
                    {!hasCompanies && (
                        <option value="">
                            {isLoadingCompanies
                                ? t("Cargando empresas...")
                                : t("No existen empresas disponibles")}
                        </option>
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

export default WhatsAppCompanyForm;
