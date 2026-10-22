import SectionTabListItem from "../SectionTabListItem/SectionTabListItem.jsx";

import styles from "./SectionTabs.module.css";

/**
 * SectionTabs
 * Description: Render section navigation with a single keyboard focus stop.
 * Notes: Arrow keys wrap; Home and End select the first and last enabled tabs.
 */
function SectionTabs({
    sections = [],
    activeSection,
    onChange,
    getLabel = (label) => label,
    label = "Secciones",
    className = styles.sectionTabs,
    tabClassName = styles.sectionTab,
    activeTabClassName = styles.sectionTabActive,
}) {
    const enabledSections = sections.filter((section) => !section.disabled);
    const focusSection = enabledSections.some(
        (section) => (section.value ?? section.id) === activeSection,
    )
        ? activeSection
        : (enabledSections[0]?.value ?? enabledSections[0]?.id);

    function handleKeyDown(event) {
        if (
            !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) ||
            !enabledSections.length
        )
            return;
        event.preventDefault();
        const currentIndex = enabledSections.findIndex(
            (section) => String(section.value ?? section.id) === event.target.dataset.section,
        );
        const nextIndex =
            event.key === "Home"
                ? 0
                : event.key === "End"
                  ? enabledSections.length - 1
                  : (currentIndex +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        enabledSections.length) %
                    enabledSections.length;
        const nextValue = enabledSections[nextIndex].value ?? enabledSections[nextIndex].id;
        for (const button of event.currentTarget.querySelectorAll('[role="tab"]')) {
            if (button.dataset.section === String(nextValue)) button.focus();
        }
        onChange(nextValue);
    }

    return (
        <div className={className} role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
            {sections.map((section) => (
                <SectionTabListItem
                    key={section.value ?? section.id}
                    section={section}
                    activeSection={activeSection}
                    focusSection={focusSection}
                    onChange={onChange}
                    getLabel={getLabel}
                    tabClassName={tabClassName}
                    activeTabClassName={activeTabClassName}
                />
            ))}
        </div>
    );
}

export default SectionTabs;
