import Button from "../../buttons/Button/Button.jsx";

/**
 * SectionTabListItem
 * Description: Render an individual section tab.
 */
function SectionTabListItem({
    section,
    activeSection,
    focusSection,
    onChange,
    getLabel,
    tabClassName,
    activeTabClassName,
}) {
    const value = section.value ?? section.id;
    const isActive = value === activeSection;

    return (
        <Button
            className={`${tabClassName} ${isActive ? activeTabClassName : ""}`}
            role="tab"
            aria-selected={isActive}
            disabled={section.disabled}
            tabIndex={focusSection === value ? 0 : -1}
            data-section={value}
            onClick={() => onChange(value)}
        >
            {section.icon}
            {getLabel(section.label)}
            {section.badge != null && <span>{section.badge}</span>}
        </Button>
    );
}

export default SectionTabListItem;
