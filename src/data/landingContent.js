import {
    Building2,
    Eye,
    GitBranch,
    History,
    MessageCircleMore,
    MessagesSquare,
    Network,
    Smartphone,
    UserCheck,
} from "lucide-react";

export const COPY = {
    es: {
        eyebrow: "Comunicación empresarial centralizada",
        title: "La comunicación de WhatsApp de tu empresa, visible y bajo control.",
        intro: "Centraliza los números de WhatsApp Business de tu organización, organiza su operación por empresa, sucursal y responsable, y supervisa las conversaciones desde un solo lugar.",
        discover: "Descubrir Dialoqo",
        app: "Ingresar a Dialoqo",
        trust: "Centralización · Control · Supervisión · Tiempo real",

        structureEyebrow: "Estructura empresarial",
        structureTitle: "Organiza cada número dentro de su contexto real.",
        structureIntro:
            "Dialoqo relaciona empresas, sucursales, números corporativos y responsables para que cada conversación tenga un contexto claro dentro de la organización.",

        capabilityEyebrow: "Todo en un solo lugar",
        capabilityTitle:
            "Controla la operación de WhatsApp sin depender de conversaciones dispersas.",
        capabilityIntro:
            "Cada usuario accede únicamente a las funciones y números que le corresponden.",

        visibilityEyebrow: "Supervisión operacional",
        visibilityTitle: "Observa las conversaciones sin interferir con la operación.",
        visibilityIntro:
            "Los monitores pueden supervisar los números autorizados y consultar sus conversaciones en tiempo real sin capacidad para responder.",

        howEyebrow: "Simple por diseño",
        howTitle: "Cómo funciona Dialoqo",
        howIntro:
            "Configura la organización, asigna responsabilidades y comienza a supervisar o atender conversaciones desde una estructura centralizada.",

        administrator: "Administradores",
        administratorText:
            "Gestionan empresas, sucursales, usuarios, números de WhatsApp, asignaciones y configuración.",
        monitor: "Monitores",
        monitorText:
            "Supervisan conversaciones de las empresas y números para los cuales tienen acceso autorizado.",
        member: "Miembros",
        memberText:
            "Atienden directamente las conversaciones pertenecientes a los números que tienen asignados.",
        realtime: "Actualización en tiempo real",
        realtimeText:
            "Nuevos mensajes y cambios pueden aparecer en la interfaz sin necesidad de recargar manualmente la página.",

        ctaEyebrow: "Control para la comunicación empresarial",
        cta: "Centraliza los WhatsApp de tu organización.",
        ctaText:
            "Define quién administra, quién supervisa y quién atiende cada número corporativo desde una sola plataforma.",
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
        structureIntro:
            "Dialoqo connects companies, branches, corporate numbers, and assignees so every conversation has a clear organizational context.",

        capabilityEyebrow: "Everything in one place",
        capabilityTitle: "Control WhatsApp operations without relying on scattered conversations.",
        capabilityIntro:
            "Each user only accesses the functions and numbers that belong to their role.",

        visibilityEyebrow: "Operational supervision",
        visibilityTitle: "Observe conversations without interfering with operations.",
        visibilityIntro:
            "Monitors can supervise authorized numbers and review their conversations in real time without the ability to reply.",

        howEyebrow: "Simple by design",
        howTitle: "How Dialoqo works",
        howIntro:
            "Configure the organization, assign responsibilities, and begin supervising or handling conversations from a centralized structure.",

        administrator: "Administrators",
        administratorText:
            "Manage companies, branches, users, WhatsApp numbers, assignments, and configuration.",
        monitor: "Monitors",
        monitorText:
            "Supervise conversations from companies and numbers for which they have authorized access.",
        member: "Members",
        memberText: "Directly handle conversations belonging to their assigned numbers.",
        realtime: "Real-time updates",
        realtimeText:
            "New messages and changes can appear in the interface without requiring manual page refreshes.",

        ctaEyebrow: "Control for business communication",
        cta: "Centralize your organization's WhatsApp numbers.",
        ctaText:
            "Define who administers, who supervises, and who handles each corporate number from a single platform.",
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

export const CAPABILITIES = [
    {
        icon: Building2,
        es: {
            title: "Múltiples empresas",
            description:
                "Administra diferentes organizaciones desde una misma plataforma manteniendo separados sus datos y accesos.",
        },
        en: {
            title: "Multiple companies",
            description:
                "Manage different organizations from one platform while keeping their data and access separated.",
        },
    },
    {
        icon: Network,
        es: {
            title: "Sucursales y números",
            description:
                "Organiza los números corporativos según la estructura real de cada empresa.",
        },
        en: {
            title: "Branches and numbers",
            description:
                "Organize corporate numbers according to each company's actual business structure.",
        },
    },
    {
        icon: UserCheck,
        es: {
            title: "Responsables definidos",
            description:
                "Asigna cada número a un miembro responsable de atender sus conversaciones.",
        },
        en: {
            title: "Defined assignees",
            description:
                "Assign each number to the member responsible for handling its conversations.",
        },
    },
    {
        icon: Eye,
        es: {
            title: "Supervisión independiente",
            description:
                "Autoriza monitores para observar conversaciones sin permitirles enviar mensajes.",
        },
        en: {
            title: "Independent supervision",
            description:
                "Authorize monitors to observe conversations without allowing them to send messages.",
        },
    },
    {
        icon: MessagesSquare,
        es: {
            title: "Atención centralizada",
            description:
                "Los miembros pueden responder mensajes y utilizar plantillas desde los números que tienen asignados.",
        },
        en: {
            title: "Centralized handling",
            description:
                "Members can reply to messages and use templates from their assigned numbers.",
        },
    },
    {
        icon: History,
        es: {
            title: "Trazabilidad administrativa",
            description:
                "Mantén visible quién tiene acceso, qué número tiene asignado y cómo se estructura la operación.",
        },
        en: {
            title: "Administrative traceability",
            description:
                "Keep visibility into who has access, which number is assigned, and how operations are structured.",
        },
    },
];

export const STEPS = [
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
            description: "Define qué miembro atenderá las conversaciones de cada número.",
        },
        en: {
            title: "Assign responsibility",
            description: "Define which member will handle conversations for each number.",
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
