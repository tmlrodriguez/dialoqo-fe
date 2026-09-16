import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    ChevronRight,
    CircleCheck,
    Eye,
    GitBranch,
    History,
    MessageCircleMore,
    MessagesSquare,
    Network,
    Plus,
    Radio,
    Send,
    ShieldCheck,
    Smartphone,
    UserCheck,
    UserRound,
    UsersRound,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext.jsx";

import styles from "./LandingPage.module.css";


const COPY = {
    es: {
        eyebrow: "Comunicación empresarial centralizada",
        title: "La comunicación de WhatsApp de tu empresa, visible y bajo control.",
        intro: "Centraliza los números de WhatsApp Business de tu organización, organiza su operación por empresa, sucursal y responsable, y supervisa las conversaciones desde un solo lugar.",
        discover: "Descubrir Dialoqo",
        app: "Ingresar a Dialoqo",
        trust: "Centralización · Control · Supervisión · Tiempo real",

        structureEyebrow: "Estructura empresarial",
        structureTitle: "Organiza cada número dentro de su contexto real.",
        structureIntro: "Dialoqo relaciona empresas, sucursales, números corporativos y responsables para que cada conversación tenga un contexto claro dentro de la organización.",

        capabilityEyebrow: "Todo en un solo lugar",
        capabilityTitle: "Controla la operación de WhatsApp sin depender de conversaciones dispersas.",
        capabilityIntro: "Cada usuario accede únicamente a las funciones y números que le corresponden.",

        visibilityEyebrow: "Supervisión operacional",
        visibilityTitle: "Observa las conversaciones sin interferir con la operación.",
        visibilityIntro: "Los usuarios MONITOR pueden supervisar los números autorizados y consultar sus conversaciones en tiempo real sin capacidad para responder.",

        howEyebrow: "Simple por diseño",
        howTitle: "Cómo funciona Dialoqo",
        howIntro: "Configura la organización, asigna responsabilidades y comienza a supervisar o atender conversaciones desde una estructura centralizada.",

        administrator: "Administradores",
        administratorText: "Gestionan empresas, sucursales, usuarios, números de WhatsApp, asignaciones y configuración.",
        monitor: "Monitores",
        monitorText: "Supervisan conversaciones de las empresas y números para los cuales tienen acceso autorizado.",
        member: "Miembros",
        memberText: "Atienden directamente las conversaciones pertenecientes a los números que tienen asignados.",
        realtime: "Actualización en tiempo real",
        realtimeText: "Nuevos mensajes y cambios pueden aparecer en la interfaz sin necesidad de recargar manualmente la página.",

        ctaEyebrow: "Control para la comunicación empresarial",
        cta: "Centraliza los WhatsApp de tu organización.",
        ctaText: "Define quién administra, quién supervisa y quién atiende cada número corporativo desde una sola plataforma.",
        contact: "Hablar con Dialoqo",
        openApp: "Abrir aplicación",

        company: "Empresa",
        branch: "Sucursal",
        number: "Número de WhatsApp",
        responsible: "Responsable",
        conversations: "Conversaciones",
        connected: "Conectado",
        monitoring: "Monitoreando",
        assigned: "Asignado",
        current: "Conversación activa",
        active: "Activo",
        messageOne: "Hola, quisiera información sobre el producto.",
        messageTwo: "Claro. Con gusto le ayudamos.",
        messageThree: "¿Tienen disponibilidad?",
    },

    en: {
        eyebrow: "Centralized business communication",
        title: "Your company's WhatsApp communication, visible and under control.",
        intro: "Centralize your organization's WhatsApp Business numbers, organize operations by company, branch, and assignee, and supervise conversations from one place.",
        discover: "Discover Dialoqo",
        app: "Open Dialoqo",
        trust: "Centralization · Control · Supervision · Real time",

        structureEyebrow: "Business structure",
        structureTitle: "Organize every number within its actual business context.",
        structureIntro: "Dialoqo connects companies, branches, corporate numbers, and assignees so every conversation has a clear organizational context.",

        capabilityEyebrow: "Everything in one place",
        capabilityTitle: "Control WhatsApp operations without relying on scattered conversations.",
        capabilityIntro: "Each user only accesses the functions and numbers that belong to their role.",

        visibilityEyebrow: "Operational supervision",
        visibilityTitle: "Observe conversations without interfering with operations.",
        visibilityIntro: "MONITOR users can supervise authorized numbers and review their conversations in real time without the ability to reply.",

        howEyebrow: "Simple by design",
        howTitle: "How Dialoqo works",
        howIntro: "Configure the organization, assign responsibilities, and begin supervising or handling conversations from a centralized structure.",

        administrator: "Administrators",
        administratorText: "Manage companies, branches, users, WhatsApp numbers, assignments, and configuration.",
        monitor: "Monitors",
        monitorText: "Supervise conversations from companies and numbers for which they have authorized access.",
        member: "Members",
        memberText: "Directly handle conversations belonging to their assigned numbers.",
        realtime: "Real-time updates",
        realtimeText: "New messages and changes can appear in the interface without requiring manual page refreshes.",

        ctaEyebrow: "Control for business communication",
        cta: "Centralize your organization's WhatsApp numbers.",
        ctaText: "Define who administers, who supervises, and who handles each corporate number from a single platform.",
        contact: "Talk to Dialoqo",
        openApp: "Open application",

        company: "Company",
        branch: "Branch",
        number: "WhatsApp number",
        responsible: "Assignee",
        conversations: "Conversations",
        connected: "Connected",
        monitoring: "Monitoring",
        assigned: "Assigned",
        current: "Active conversation",
        active: "Active",
        messageOne: "Hello, I would like information about the product.",
        messageTwo: "Of course. We will be happy to help you.",
        messageThree: "Do you have availability?",
    },
};


const CAPABILITIES = [
    {
        icon: Building2,
        es: {
            title: "Múltiples empresas",
            description: "Administra diferentes organizaciones desde una misma plataforma manteniendo separados sus datos y accesos.",
        },
        en: {
            title: "Multiple companies",
            description: "Manage different organizations from one platform while keeping their data and access separated.",
        },
    },
    {
        icon: Network,
        es: {
            title: "Sucursales y números",
            description: "Organiza los números corporativos según la estructura real de cada empresa.",
        },
        en: {
            title: "Branches and numbers",
            description: "Organize corporate numbers according to each company's actual business structure.",
        },
    },
    {
        icon: UserCheck,
        es: {
            title: "Responsables definidos",
            description: "Asigna cada número a un usuario MEMBER responsable de atender sus conversaciones.",
        },
        en: {
            title: "Defined assignees",
            description: "Assign each number to the MEMBER responsible for handling its conversations.",
        },
    },
    {
        icon: Eye,
        es: {
            title: "Supervisión independiente",
            description: "Autoriza usuarios MONITOR para observar conversaciones sin permitirles enviar mensajes.",
        },
        en: {
            title: "Independent supervision",
            description: "Authorize MONITOR users to observe conversations without allowing them to send messages.",
        },
    },
    {
        icon: MessagesSquare,
        es: {
            title: "Atención centralizada",
            description: "Los usuarios MEMBER pueden responder mensajes y utilizar plantillas desde los números que tienen asignados.",
        },
        en: {
            title: "Centralized handling",
            description: "MEMBER users can reply to messages and use templates from their assigned numbers.",
        },
    },
    {
        icon: History,
        es: {
            title: "Trazabilidad administrativa",
            description: "Mantén visible quién tiene acceso, qué número tiene asignado y cómo se estructura la operación.",
        },
        en: {
            title: "Administrative traceability",
            description: "Keep visibility into who has access, which number is assigned, and how operations are structured.",
        },
    },
];


const STEPS = [
    {
        icon: Building2,
        es: {
            title: "Registra la empresa",
            description: "Define la organización que utilizará Dialoqo.",
        },
        en: {
            title: "Register the company",
            description: "Define the organization that will use Dialoqo.",
        },
    },
    {
        icon: GitBranch,
        es: {
            title: "Crea las sucursales",
            description: "Representa la estructura física u operativa de la empresa.",
        },
        en: {
            title: "Create branches",
            description: "Represent the company's physical or operational structure.",
        },
    },
    {
        icon: Smartphone,
        es: {
            title: "Configura los números",
            description: "Relaciona los números corporativos de WhatsApp con su sucursal.",
        },
        en: {
            title: "Configure numbers",
            description: "Connect corporate WhatsApp numbers to their respective branch.",
        },
    },
    {
        icon: UserCheck,
        es: {
            title: "Asigna responsables",
            description: "Define qué MEMBER atenderá las conversaciones de cada número.",
        },
        en: {
            title: "Assign responsibility",
            description: "Define which MEMBER will handle conversations for each number.",
        },
    },
    {
        icon: MessageCircleMore,
        es: {
            title: "Supervisa y atiende",
            description: "Monitores observan; miembros asignados atienden las conversaciones.",
        },
        en: {
            title: "Supervise and handle",
            description: "Monitors observe while assigned members handle conversations.",
        },
    },
];


function StructureVisual({ copy }) {
    return (
        <div className={styles.structureVisual}>
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

                <div className={styles.treeConnector}><span /></div>

                <div className={`${styles.treeRow} ${styles.treeIndented}`}>
                    <span className={styles.treeIcon}>
                        <GitBranch size={18} strokeWidth={1.9} />
                    </span>

                    <div>
                        <small>{copy.branch}</small>
                        <strong>Choluteca</strong>
                    </div>
                </div>

                <div className={styles.treeConnector}><span /></div>

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


function ConversationVisual({ copy }) {
    return (
        <div className={styles.conversationVisual}>
            <div className={styles.conversationHeader}>
                <div>
                    <span className={styles.memberAvatar}>
                        <UserRound size={17} strokeWidth={2} />
                    </span>

                    <div>
                        <small>{copy.current}</small>
                        <strong>Luis Rodriguez</strong>
                    </div>
                </div>

                <span className={styles.onlineBadge}>
                    <i />
                    {copy.connected}
                </span>
            </div>

            <div className={styles.conversationBody}>
                <div className={styles.messageIncoming}>
                    <p>{copy.messageOne}</p>
                    <small>10:41</small>
                </div>

                <div className={styles.messageOutgoing}>
                    <p>{copy.messageTwo}</p>
                    <small>10:42</small>
                </div>

                <div className={styles.messageIncomingSmall}>
                    <p>{copy.messageThree}</p>
                    <small>10:43</small>
                </div>
            </div>

            <div className={styles.composerPreview}>
                <span>
                    <Plus size={16} strokeWidth={2.1} />
                </span>

                <div />

                <button type="button" aria-label="Send">
                    <Send size={14} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}


function LandingPage() {
    const { language } = useLanguage();
    const currentLanguage = language === "en" ? "en" : "es";
    const copy = COPY[currentLanguage];

    useEffect(() => {
        document.title = currentLanguage === "en" ? "Dialoqo | Business WhatsApp Management" : "Dialoqo | Gestión de WhatsApp Empresarial";
    }, [currentLanguage]);

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroGlowOne} />
                <div className={styles.heroGlowTwo} />
                <div className={styles.gridBackground} />

                <div className={styles.container}>
                    <div className={styles.heroCopy}>
                        <span className={styles.eyebrow}><i />{copy.eyebrow}</span>

                        <h1>{copy.title}</h1>

                        <p className={styles.heroIntro}>{copy.intro}</p>

                        <div className={styles.heroActions}>
                            <a href="#capabilities" className={styles.primary}>
                                {copy.discover}
                                <ArrowRight size={17} strokeWidth={2} />
                            </a>

                            <Link to="/app" className={styles.secondary}>
                                {copy.app}
                            </Link>
                        </div>

                        <div className={styles.heroTrust}>
                            <span className={styles.trustLine} />
                            <span>{copy.trust}</span>
                        </div>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={styles.visualGlow} />

                        <div className={styles.visualStack}>
                            <StructureVisual copy={copy} />
                            <ConversationVisual copy={copy} />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.structureSection}>
                <div className={styles.split}>
                    <div className={styles.sectionCopy}>
                        <span className={styles.sectionEyebrow}>{copy.structureEyebrow}</span>
                        <h2>{copy.structureTitle}</h2>
                        <p>{copy.structureIntro}</p>

                        <div className={styles.structureFlow}>
                            <span><Building2 size={14} />{copy.company}</span>
                            <ChevronRight className={styles.flowArrow} size={15} />
                            <span><GitBranch size={14} />{copy.branch}</span>
                            <ChevronRight className={styles.flowArrow} size={15} />
                            <span><Smartphone size={14} />{copy.number}</span>
                            <ChevronRight className={styles.flowArrow} size={15} />
                            <span><UserCheck size={14} />{copy.responsible}</span>
                        </div>
                    </div>

                    <StructureVisual copy={copy} />
                </div>
            </section>

            <section id="capabilities" className={styles.section}>
                <div className={styles.sectionInner}>
                    <header className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>{copy.capabilityEyebrow}</span>
                        <h2>{copy.capabilityTitle}</h2>
                        <p>{copy.capabilityIntro}</p>
                    </header>

                    <div className={styles.cards}>
                        {CAPABILITIES.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article className={styles.card} key={item.es.title}>
                                    <span className={styles.cardIcon}>
                                        <Icon size={22} strokeWidth={1.8} />
                                    </span>

                                    <h3>{item[currentLanguage].title}</h3>
                                    <p>{item[currentLanguage].description}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className={styles.monitoringSection}>
                <div className={styles.split}>
                    <div className={styles.sectionCopy}>
                        <span className={styles.sectionEyebrow}>{copy.visibilityEyebrow}</span>
                        <h2>{copy.visibilityTitle}</h2>
                        <p>{copy.visibilityIntro}</p>
                    </div>

                    <ConversationVisual copy={copy} />
                </div>
            </section>

            <section className={styles.stepsSection}>
                <div className={styles.sectionInner}>
                    <header className={styles.sectionHeader}>
                        <span className={styles.sectionEyebrow}>{copy.howEyebrow}</span>
                        <h2>{copy.howTitle}</h2>
                        <p>{copy.howIntro}</p>
                    </header>

                    <div className={styles.steps}>
                        {STEPS.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <article key={item.es.title}>
                                    <div className={styles.stepNumber}>
                                        <Icon size={19} strokeWidth={1.8} />
                                        <small>{String(index + 1).padStart(2, "0")}</small>
                                    </div>

                                    <div className={styles.stepLine} />

                                    <div>
                                        <h3>{item[currentLanguage].title}</h3>
                                        <p>{item[currentLanguage].description}</p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className={styles.rolesSection}>
                <div className={styles.securityGrid}>
                    <article>
                        <span className={styles.featureIcon}>
                            <ShieldCheck size={23} strokeWidth={1.8} />
                        </span>
                        <h3>{copy.administrator}</h3>
                        <p>{copy.administratorText}</p>
                    </article>

                    <article>
                        <span className={styles.featureIcon}>
                            <Eye size={23} strokeWidth={1.8} />
                        </span>
                        <h3>{copy.monitor}</h3>
                        <p>{copy.monitorText}</p>
                    </article>

                    <article>
                        <span className={styles.featureIcon}>
                            <UsersRound size={23} strokeWidth={1.8} />
                        </span>
                        <h3>{copy.member}</h3>
                        <p>{copy.memberText}</p>
                    </article>

                    <article>
                        <span className={`${styles.featureIcon} ${styles.realtimeIcon}`}>
                            <Radio size={23} strokeWidth={1.8} />
                        </span>
                        <h3>{copy.realtime}</h3>
                        <p>{copy.realtimeText}</p>
                    </article>
                </div>
            </section>

            <section className={styles.cta}>
                <div className={styles.ctaGlow} />

                <div className={styles.ctaInner}>
                    <span className={styles.ctaEyebrow}>{copy.ctaEyebrow}</span>
                    <h2>{copy.cta}</h2>
                    <p>{copy.ctaText}</p>

                    <div className={styles.heroActions}>
                        <Link className={styles.primary} to="/contact">
                            {copy.contact}
                            <ArrowRight size={17} strokeWidth={2} />
                        </Link>

                        <Link className={styles.secondary} to="/app">
                            {copy.openApp}
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}


export default LandingPage;