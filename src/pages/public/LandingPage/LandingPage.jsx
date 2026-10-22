import Page from "../../../components/common/layout/Page/Page.jsx";
import LandingCallToAction from "../../../components/public/sections/LandingCallToAction/LandingCallToAction.jsx";
import LandingCapabilitiesSection from "../../../components/public/sections/LandingCapabilitiesSection/LandingCapabilitiesSection.jsx";
import LandingHero from "../../../components/public/sections/LandingHero/LandingHero.jsx";
import LandingMonitoringSection from "../../../components/public/sections/LandingMonitoringSection/LandingMonitoringSection.jsx";
import LandingRolesSection from "../../../components/public/sections/LandingRolesSection/LandingRolesSection.jsx";
import LandingStepsSection from "../../../components/public/sections/LandingStepsSection/LandingStepsSection.jsx";
import LandingStructureSection from "../../../components/public/sections/LandingStructureSection/LandingStructureSection.jsx";
import { COPY } from "../../../data/landingContent.js";
import { useLanguage } from "../../../hooks/useLanguage.js";

import styles from "./LandingPage.module.css";

function LandingPage() {
    const { language } = useLanguage();
    const currentLanguage = language === "en" ? "en" : "es";
    const copy = COPY[currentLanguage];

    return (
        <Page title={"Dialoqo"} className={styles.landingPage}>
            <LandingHero copy={copy} />

            <LandingStructureSection copy={copy} />

            <LandingCapabilitiesSection copy={copy} currentLanguage={currentLanguage} />

            <LandingMonitoringSection copy={copy} />

            <LandingStepsSection copy={copy} currentLanguage={currentLanguage} />

            <LandingRolesSection copy={copy} />

            <LandingCallToAction copy={copy} />
        </Page>
    );
}

export default LandingPage;
