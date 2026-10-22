import { Building2, ChevronRight, GitBranch, Smartphone, UserCheck } from "lucide-react";

import StructureVisual from "../../visuals/StructureVisual/StructureVisual.jsx";

import styles from "./LandingStructureSection.module.css";

/**
 * LandingStructureSection
 * Description: Present the structuresection section with page-owned data and actions.

 */
function LandingStructureSection({ copy }) {
    return (
        <section className={styles.structureSection}>
            <div className={styles.split}>
                <div className={styles.sectionCopy}>
                    <span className={styles.sectionEyebrow}>{copy.structureEyebrow}</span>
                    <h2>{copy.structureTitle}</h2>
                    <p>{copy.structureIntro}</p>

                    <div className={styles.structureFlow}>
                        <span>
                            <Building2 size={14} />
                            {copy.company}
                        </span>
                        <ChevronRight className={styles.flowArrow} size={15} />
                        <span>
                            <GitBranch size={14} />
                            {copy.branch}
                        </span>
                        <ChevronRight className={styles.flowArrow} size={15} />
                        <span>
                            <Smartphone size={14} />
                            {copy.number}
                        </span>
                        <ChevronRight className={styles.flowArrow} size={15} />
                        <span>
                            <UserCheck size={14} />
                            {copy.responsible}
                        </span>
                    </div>
                </div>

                <StructureVisual copy={copy} className={styles.structureVisual} />
            </div>
        </section>
    );
}

export default LandingStructureSection;
