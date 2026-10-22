import EntityListItem from "../../../common/lists/EntityListItem/EntityListItem.jsx";

/**
 * CompanyListItem
 * Description: Present one collection entry and invoke its supplied actions.
 */
function CompanyListItem({ item: company, t, selectedCompany, handleSelectCompany }) {
    return (
        <EntityListItem
            key={company.id}
            title={company.name}
            subtitle={company.code}
            initial={(company.name || "E").charAt(0).toUpperCase()}
            status={t("Activa")}
            isActive={selectedCompany?.id === company.id}
            onClick={() => handleSelectCompany(company)}
        />
    );
}

export default CompanyListItem;
