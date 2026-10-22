import {
    Building2,
    CircleCheck,
    Eye,
    GitBranch,
    MessageCircleMore,
    Smartphone,
    UserCheck,
    UserRound,
} from "lucide-react";

import styles from "./StructureVisual.module.css";

function StructureVisual({ copy, className = "" }) {
    return (
        <div className={`${styles.structureVisual} ${className}`}>
            <div className={styles.structureHeader}>
                <div>
                    <span className={styles.structureLogo}>
                        <MessageCircleMore size={21} strokeWidth={2.1} />
                    </span>

                    <div>
                        <small>Dialoqo</small>
                        <strong>{copy.company}</strong>
                    </div>
                </div>

                <span className={styles.onlineBadge}>
                    <i />
                    {copy.connected}
                </span>
            </div>

            <div className={styles.organizationTree}>
                <div className={styles.treeRow}>
                    <span className={styles.treeIcon}>
                        <Building2 size={18} strokeWidth={1.9} />
                    </span>

                    <div>
                        <small>{copy.company}</small>
                        <strong>Telematica</strong>
                    </div>

                    <span className={styles.treeStatus}>
                        <CircleCheck size={11} />
                        {copy.active}
                    </span>
                </div>

                <div className={styles.treeConnector}>
                    <span />
                </div>

                <div className={`${styles.treeRow} ${styles.treeIndented}`}>
                    <span className={styles.treeIcon}>
                        <GitBranch size={18} strokeWidth={1.9} />
                    </span>

                    <div>
                        <small>{copy.branch}</small>
                        <strong>Choluteca</strong>
                    </div>
                </div>

                <div className={styles.treeConnector}>
                    <span />
                </div>

                <div className={`${styles.treeRow} ${styles.treeIndentedLarge}`}>
                    <span className={styles.phoneIcon}>
                        <Smartphone size={18} strokeWidth={1.9} />
                    </span>

                    <div>
                        <small>{copy.number}</small>
                        <strong>Ventas Especiales</strong>
                        <p>+1 555 665 5582</p>
                    </div>

                    <div className={styles.numberStatus}>
                        <span>
                            <CircleCheck size={10} />
                            {copy.connected}
                        </span>

                        <span>
                            <Eye size={10} />
                            {copy.monitoring}
                        </span>
                    </div>
                </div>

                <div className={styles.assignmentCard}>
                    <div>
                        <span className={styles.memberAvatar}>
                            <UserRound size={17} strokeWidth={2} />
                        </span>

                        <div>
                            <small>{copy.responsible}</small>
                            <strong>Luis Rodriguez</strong>
                        </div>
                    </div>

                    <span>
                        <UserCheck size={11} />
                        {copy.assigned}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default StructureVisual;
