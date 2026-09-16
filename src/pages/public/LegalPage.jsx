import { useEffect } from "react";

import { useLanguage } from "../../context/LanguageContext.jsx";

import styles from "./LegalPage.module.css";

const CONTENT = {
    privacy: {
        es: {
            title: "Política de privacidad",
            updated: "Última actualización: 2 de septiembre de 2026.",
            intro: "Política de Privacidad de Dialoqo. Esta política resume cómo tratamos la información necesaria para prestar, proteger y mejorar la plataforma. Los datos y obligaciones específicas se mantienen sujetos a los contratos y legislación aplicables.",
            sections: [
                ["1. Responsable, alcance y roles", "Dialoqo es una plataforma de inteligencia conversacional y gestión de comunicaciones empresariales operada por Telemática, S. de R.L. de C.V., Honduras. Esta política aplica al sitio, plataforma e integraciones. En entornos empresariales, el cliente determina qué canales conecta, qué usuarios autoriza y las finalidades de uso; según corresponda, el cliente puede actuar como responsable de determinados datos y Dialoqo como proveedor o encargado del tratamiento."],
                ["2. Información que procesamos", "Podemos procesar datos de usuarios y cuentas; empresas, sucursales, miembros, números y asignaciones; identificadores de clientes y conversaciones; texto, contexto, fechas, estados y metadatos de mensajes; plantillas; imágenes, documentos, audio, video u otros adjuntos; y datos técnicos como IP, sesión, errores, eventos y registros de seguridad. Solo procesamos las categorías necesarias para las funciones habilitadas."],
                ["3. Fuentes y finalidades", "La información puede provenir de usuarios, organizaciones clientes, integraciones autorizadas, Meta/WhatsApp Business Platform y la operación técnica de Dialoqo. Se utiliza para autenticar usuarios, aplicar permisos, conectar canales, recibir y mostrar conversaciones, permitir mensajería, procesar archivos y estados, proporcionar trazabilidad y soporte, proteger el servicio y habilitar análisis, indicadores o alertas cuando estén disponibles y legalmente permitidos."],
                ["4. Meta, WhatsApp e integraciones de terceros", "Dialoqo puede utilizar APIs y servicios de Meta, WhatsApp Business Platform y otros proveedores. La organización debe autorizar los activos correspondientes. Los datos obtenidos mediante estas integraciones se utilizan para proporcionar y proteger las funciones autorizadas y están sujetos también a los términos y políticas del proveedor correspondiente."],
                ["5. Autorización, acceso y segregación", "El tratamiento puede basarse en la prestación del servicio, autorización o consentimiento cuando sea requerido, intereses legítimos compatibles, obligaciones legales y seguridad. Dialoqo aplica controles por usuario, rol y organización para evitar que usuarios sin autorización accedan a información que no les corresponde."],
                ["6. Proveedores, divulgación y venta de datos", "Podemos utilizar proveedores de infraestructura, alojamiento, comunicaciones, seguridad y soporte que reciben únicamente la información necesaria para prestar sus funciones. También podemos divulgar información ante obligaciones legales o requerimientos válidos. Dialoqo no vende contenido de conversaciones ni información personal a anunciantes o intermediarios de datos."],
                ["7. Conservación y seguridad", "La conservación depende del tipo de información, configuración del cliente, contratos, seguridad y obligaciones legales. Aplicamos medidas razonables como autenticación, autorización, segregación lógica, cifrado en tránsito, gestión de credenciales, auditoría, respaldos y monitoreo técnico. Ningún sistema conectado a Internet puede garantizar seguridad absoluta."],
                ["8. Transferencias, derechos y solicitudes", "Algunos proveedores pueden procesar información desde distintos países y procuramos aplicar salvaguardas apropiadas cuando corresponda. Dependiendo de la legislación aplicable, las personas pueden solicitar acceso, corrección, actualización, oposición, limitación, portabilidad o eliminación. Podemos verificar identidad o autoridad antes de responder y, cuando actuemos por cuenta de un cliente, coordinar la solicitud con dicha organización."],
                ["9. Eliminación, cookies, menores e incidentes", "Las instrucciones de eliminación están disponibles en Eliminación de datos, sujetas a excepciones legales y de seguridad. El sitio público puede utilizar tecnologías estrictamente necesarias y cualquier uso futuro de tecnologías no esenciales requerirá la actualización correspondiente. Dialoqo está orientado a organizaciones, no a menores como servicio de consumo. Los incidentes de seguridad serán evaluados, contenidos, investigados y notificados cuando corresponda."],
                ["10. Cambios y contacto", "Podemos actualizar esta política cuando cambien la plataforma, proveedores, prácticas o requisitos legales. La versión vigente mostrará su fecha de actualización. Para consultas sobre privacidad, seguridad o protección de datos utiliza los medios publicados en Contacto."],
            ],
        },
        en: {
            title: "Privacy Policy",
            updated: "Last updated: September 2, 2026.",
            intro: "Dialoqo Privacy Policy. This policy summarizes how we process the information necessary to provide, protect, and improve the platform. Specific data-processing obligations remain subject to applicable contracts and laws.",
            sections: [
                ["1. Controller, scope, and roles", "Dialoqo is a conversational intelligence and business communications management platform operated by Telemática, S. de R.L. de C.V., Honduras. This policy applies to the website, platform, and integrations. In business environments, the customer determines which channels are connected, which users are authorized, and the purposes of use. As applicable, the customer may act as controller of certain data and Dialoqo as a service provider or data processor."],
                ["2. Information we process", "We may process user and account data; companies, branches, members, numbers, and assignments; customer and conversation identifiers; message text, context, dates, statuses, and metadata; templates; images, documents, audio, video, or other attachments; and technical information such as IP addresses, sessions, errors, events, and security logs. We process only the categories necessary for the enabled functionality."],
                ["3. Sources and purposes", "Information may come from users, customer organizations, authorized integrations, Meta/WhatsApp Business Platform, and Dialoqo's technical operations. It is used to authenticate users, enforce permissions, connect channels, receive and display conversations, enable messaging, process files and statuses, provide traceability and support, protect the service, and enable analytics, indicators, or alerts when available and legally permitted."],
                ["4. Meta, WhatsApp, and third-party integrations", "Dialoqo may use APIs and services from Meta, WhatsApp Business Platform, and other providers. The organization must authorize the corresponding assets. Data obtained through these integrations is used to provide and protect authorized functionality and is also subject to the applicable provider's terms and policies."],
                ["5. Authorization, access, and segregation", "Processing may be based on provision of the service, authorization or consent when required, compatible legitimate interests, legal obligations, and security. Dialoqo applies controls by user, role, and organization to prevent unauthorized users from accessing information that does not belong to them."],
                ["6. Service providers, disclosure, and sale of data", "We may use infrastructure, hosting, communications, security, and support providers that receive only the information necessary to perform their functions. We may also disclose information when required by law or in response to valid legal requests. Dialoqo does not sell conversation content or personal information to advertisers or data brokers."],
                ["7. Retention and security", "Retention depends on the type of information, customer configuration, contracts, security requirements, and legal obligations. We apply reasonable measures such as authentication, authorization, logical segregation, encryption in transit, credential management, auditing, backups, and technical monitoring. No system connected to the Internet can guarantee absolute security."],
                ["8. Transfers, rights, and requests", "Some providers may process information from different countries, and we seek to apply appropriate safeguards where required. Depending on applicable law, individuals may request access, correction, updating, objection, restriction, portability, or deletion. We may verify identity or authority before responding and, when acting on behalf of a customer, coordinate the request with that organization."],
                ["9. Deletion, cookies, minors, and incidents", "Deletion instructions are available on the Data Deletion page, subject to legal and security exceptions. The public website may use strictly necessary technologies, and any future use of non-essential technologies will require the corresponding update. Dialoqo is intended for organizations and is not directed to minors as a consumer service. Security incidents will be assessed, contained, investigated, and notified where required."],
                ["10. Changes and contact", "We may update this policy when the platform, providers, practices, or legal requirements change. The current version will display its update date. For questions about privacy, security, or data protection, use the contact methods published on the Contact page."],
            ],
        },
    },

    terms: {
        es: {
            title: "Términos de servicio",
            updated: "Última actualización: 2 de septiembre de 2026.",
            intro: "Términos de Servicio de Dialoqo. Estos términos resumen las condiciones generales de uso. Las condiciones comerciales específicas pueden complementarse mediante contratos, propuestas, órdenes de servicio, anexos de datos y acuerdos de nivel de servicio.",
            sections: [
                ["1. Objeto, aceptación y autoridad", "Estos términos regulan el acceso y uso del sitio y plataforma Dialoqo. Al utilizar el servicio, el usuario acepta estas condiciones y declara tener capacidad para hacerlo. Quien configure una organización, conecte un canal o administre activos declara tener autoridad suficiente para actuar en nombre de la organización correspondiente."],
                ["2. Cuentas, permisos y seguridad", "Los usuarios deben proteger sus credenciales y notificar accesos no autorizados. La organización es responsable de mantener actualizados usuarios, roles, permisos y accesos. Dialoqo aplica medidas razonables de seguridad, mientras que el cliente debe utilizar credenciales seguras, revocar accesos innecesarios y colaborar ante incidentes."],
                ["3. Uso permitido y prohibido", "Dialoqo debe utilizarse únicamente para fines empresariales legítimos y autorizados. Está prohibido acceder a comunicaciones sin autorización, suplantar identidades, enviar spam o fraude, evadir controles de seguridad, extraer datos fuera de las funciones autorizadas, introducir malware, degradar el servicio, infringir derechos de terceros o incumplir políticas de proveedores."],
                ["4. Meta, WhatsApp e integraciones externas", "Dialoqo puede depender de Meta, WhatsApp Business Platform y otros servicios externos. El cliente debe cumplir sus políticas, incluyendo reglas de consentimiento, mensajería y plantillas. Las funciones pueden estar sujetas a aprobación, límites, disponibilidad, cambios o interrupciones de terceros, y Dialoqo no garantiza decisiones de aprobación tomadas por dichos proveedores."],
                ["5. Datos, privacidad y responsabilidad del cliente", "El tratamiento se describe en la Política de privacidad. La organización conserva los derechos que le correspondan sobre sus datos y autoriza a Dialoqo a procesarlos únicamente para prestar y proteger el servicio. El cliente es responsable de tener autoridad y base legal para conectar canales, acceder a conversaciones y autorizar usuarios."],
                ["6. Disponibilidad, soporte y evolución", "El servicio puede experimentar mantenimiento, interrupciones de infraestructura o indisponibilidad de terceros. Los niveles de servicio garantizados, cuando existan, se definirán contractualmente. Dialoqo puede mejorar, modificar o sustituir funciones por seguridad, compatibilidad, cumplimiento o evolución tecnológica, y los canales de soporte dependerán del servicio contratado."],
                ["7. Propiedad intelectual y confidencialidad", "Dialoqo, su software, interfaces, diseños, documentación y marca están protegidos por derechos aplicables y no se transfieren al usuario. La información empresarial no pública debe mantenerse confidencial y no divulgarse a personas no autorizadas, conforme a las obligaciones contractuales y legales aplicables."],
                ["8. Suspensión, terminación y conservación posterior", "Podemos limitar o suspender el acceso ante amenazas de seguridad, uso ilegal, incumplimiento material, requerimientos de autoridad o riesgos para la plataforma. La terminación se regirá por el contrato aplicable y, posteriormente, los datos se gestionarán conforme a obligaciones de retención, devolución y eliminación."],
                ["9. Garantías, responsabilidad y cumplimiento", "Salvo garantías expresas asumidas por contrato o exigidas por ley, el servicio está sujeto a disponibilidad técnica y dependencias externas. Los límites de responsabilidad económica se determinarán contractualmente y conforme a la ley. Cada organización es responsable de cumplir las normas aplicables a comunicaciones, privacidad, consumidores, marketing y sus actividades empresariales."],
                ["10. Modificaciones y contacto", "Podemos actualizar estos términos cuando cambien el servicio, proveedores o marco legal. La fecha de última actualización identifica la versión vigente. Para consultas sobre estas condiciones utiliza los medios publicados en Contacto."],
            ],
        },
        en: {
            title: "Terms of Service",
            updated: "Last updated: September 2, 2026.",
            intro: "Dialoqo Terms of Service. These terms summarize the general conditions of use. Specific commercial conditions may be supplemented by contracts, proposals, service orders, data-processing addenda, and service-level agreements.",
            sections: [
                ["1. Purpose, acceptance, and authority", "These terms govern access to and use of the Dialoqo website and platform. By using the service, the user accepts these conditions and represents that they have the capacity to do so. Anyone who configures an organization, connects a channel, or manages assets represents that they have sufficient authority to act on behalf of the corresponding organization."],
                ["2. Accounts, permissions, and security", "Users must protect their credentials and report unauthorized access. The organization is responsible for keeping users, roles, permissions, and access rights current. Dialoqo applies reasonable security measures, while the customer must use secure credentials, revoke unnecessary access, and cooperate in the event of incidents."],
                ["3. Permitted and prohibited use", "Dialoqo must be used only for legitimate and authorized business purposes. Accessing communications without authorization, impersonating identities, sending spam or fraudulent communications, circumventing security controls, extracting data outside authorized functionality, introducing malware, degrading the service, infringing third-party rights, or violating provider policies is prohibited."],
                ["4. Meta, WhatsApp, and external integrations", "Dialoqo may depend on Meta, WhatsApp Business Platform, and other external services. The customer must comply with their policies, including consent, messaging, and template requirements. Features may be subject to third-party approval, limits, availability, changes, or interruptions, and Dialoqo does not guarantee approval decisions made by those providers."],
                ["5. Data, privacy, and customer responsibility", "Data processing is described in the Privacy Policy. The organization retains the rights applicable to its data and authorizes Dialoqo to process that data only to provide and protect the service. The customer is responsible for having the authority and legal basis required to connect channels, access conversations, and authorize users."],
                ["6. Availability, support, and evolution", "The service may experience maintenance, infrastructure interruptions, or third-party unavailability. Guaranteed service levels, where applicable, will be defined contractually. Dialoqo may improve, modify, or replace functionality for security, compatibility, compliance, or technological evolution, and support channels will depend on the contracted service."],
                ["7. Intellectual property and confidentiality", "Dialoqo, its software, interfaces, designs, documentation, and brand are protected by applicable rights and are not transferred to the user. Non-public business information must remain confidential and must not be disclosed to unauthorized persons, in accordance with applicable contractual and legal obligations."],
                ["8. Suspension, termination, and post-termination retention", "We may limit or suspend access in response to security threats, illegal use, material breach, government requirements, or risks to the platform. Termination will be governed by the applicable contract and, afterward, data will be handled according to applicable retention, return, and deletion obligations."],
                ["9. Warranties, liability, and compliance", "Except for express warranties assumed by contract or required by law, the service is subject to technical availability and external dependencies. Limits on financial liability will be determined contractually and in accordance with applicable law. Each organization is responsible for complying with rules applicable to communications, privacy, consumers, marketing, and its business activities."],
                ["10. Changes and contact", "We may update these terms when the service, providers, or legal framework changes. The last-updated date identifies the current version. For questions about these terms, use the contact methods published on the Contact page."],
            ],
        },
    },

    deletion: {
        es: {
            title: "Eliminación de datos",
            updated: null,
            intro: "Instrucciones para solicitar la eliminación de información asociada a Dialoqo.",
            description: "Eliminación de datos en Dialoqo. Estas instrucciones explican quién puede solicitar eliminación, cómo verificamos la solicitud, qué información puede eliminarse y las principales excepciones aplicables.",
            sections: [
                ["1. Quién puede solicitar la eliminación", "Puede solicitarla el titular de los datos, un representante autorizado o una organización cliente respecto de información bajo su administración. Cuando Dialoqo procese datos por cuenta de un cliente, puede ser necesario coordinar la solicitud con esa organización."],
                ["2. Cómo presentar una solicitud", "Utiliza los datos publicados en Contacto e indica en el asunto Solicitud de eliminación de datos - Dialoqo. Incluye nombre, correo asociado, organización cuando corresponda, identificadores necesarios para localizar la información, descripción de los datos y explicación de tu autoridad para solicitar la eliminación."],
                ["3. Verificación de identidad y autoridad", "Antes de eliminar información podemos solicitar verificación razonable de identidad, control de cuenta o autoridad sobre la organización. La verificación protege a los titulares y evita solicitudes realizadas por terceros no autorizados."],
                ["4. Evaluación y alcance", "Una vez verificada la solicitud, identificaremos sistemas y categorías de información relevantes y determinaremos qué datos pueden eliminarse, anonimizarse o deben conservarse legítimamente. Según el caso, esto puede incluir perfiles, configuraciones, conversaciones, mensajes, adjuntos e identificadores asociados."],
                ["5. Excepciones y conservación limitada", "Podemos conservar información cuando sea necesaria para obligaciones legales, contables o contractuales; seguridad; prevención de fraude; defensa de reclamaciones; auditoría; resolución de disputas o integridad de registros. La conservación se limitará a lo razonablemente necesario para esas finalidades."],
                ["6. Copias de seguridad y anonimización", "Datos eliminados de sistemas activos pueden permanecer temporalmente en copias de seguridad protegidas hasta su rotación o expiración y no deben utilizarse para operación ordinaria. Cuando resulte apropiado, podemos anonimizar información para que deje de asociarse razonablemente con una persona o cuenta específica."],
                ["7. Meta, WhatsApp y otros proveedores", "Eliminar información de Dialoqo no necesariamente elimina datos almacenados independientemente por Meta, WhatsApp u otros proveedores. El solicitante puede necesitar utilizar también los mecanismos del proveedor externo. Dialoqo cooperará respecto de la información que controle."],
                ["8. Desconexión, revocación y terminación", "Una organización puede solicitar desconectar activos integrados o revocar el acceso de usuarios. Revocar acceso no necesariamente elimina registros históricos legítimos. Cuando termine una relación de servicio, los datos se gestionarán conforme al contrato, instrucciones válidas del cliente y obligaciones aplicables."],
                ["9. Plazos y confirmación", "Las solicitudes se procesarán dentro de un plazo razonable y conforme a los plazos legales aplicables. Casos complejos pueden requerir coordinación adicional. Cuando corresponda, confirmaremos la ejecución o explicaremos cualquier razón legítima que impida eliminar total o parcialmente la información."],
                ["10. Contacto y protección contra solicitudes indebidas", "Podemos solicitar aclaraciones cuando una solicitud sea excesivamente amplia, no permita identificar los datos o no pueda verificarse. No eliminaremos ni divulgaremos información de terceros a una persona sin autoridad. Para iniciar o consultar una solicitud utiliza Contacto."],
            ],
        },
        en: {
            title: "Data Deletion",
            updated: null,
            intro: "Instructions for requesting the deletion of information associated with Dialoqo.",
            description: "Data deletion in Dialoqo. These instructions explain who may request deletion, how we verify the request, what information may be deleted, and the main applicable exceptions.",
            sections: [
                ["1. Who may request deletion", "A data subject, an authorized representative, or a customer organization may request deletion of information under their administration. When Dialoqo processes data on behalf of a customer, it may be necessary to coordinate the request with that organization."],
                ["2. How to submit a request", "Use the information published on the Contact page and include Data Deletion Request - Dialoqo in the subject line. Include your name, associated email address, organization where applicable, identifiers necessary to locate the information, a description of the data, and an explanation of your authority to request its deletion."],
                ["3. Identity and authority verification", "Before deleting information, we may request reasonable verification of identity, account control, or authority over the organization. Verification protects data subjects and helps prevent requests made by unauthorized third parties."],
                ["4. Evaluation and scope", "Once the request has been verified, we will identify the relevant systems and categories of information and determine which data can be deleted or anonymized and which data must legitimately be retained. Depending on the circumstances, this may include profiles, settings, conversations, messages, attachments, and associated identifiers."],
                ["5. Exceptions and limited retention", "We may retain information when necessary for legal, accounting, or contractual obligations; security; fraud prevention; defense of claims; auditing; dispute resolution; or record integrity. Retention will be limited to what is reasonably necessary for those purposes."],
                ["6. Backups and anonymization", "Data deleted from active systems may remain temporarily in protected backups until their normal rotation or expiration and should not be used for ordinary operations. Where appropriate, we may anonymize information so that it can no longer reasonably be associated with a specific person or account."],
                ["7. Meta, WhatsApp, and other providers", "Deleting information from Dialoqo does not necessarily delete data independently stored by Meta, WhatsApp, or other providers. The requester may also need to use the external provider's deletion mechanisms. Dialoqo will cooperate with respect to information under its control."],
                ["8. Disconnection, revocation, and termination", "An organization may request the disconnection of integrated assets or revoke user access. Revoking access does not necessarily delete legitimate historical records. When a service relationship ends, data will be handled according to the applicable contract, valid customer instructions, and applicable obligations."],
                ["9. Timeframes and confirmation", "Requests will be processed within a reasonable timeframe and in accordance with applicable legal deadlines. Complex cases may require additional coordination. Where appropriate, we will confirm completion or explain any legitimate reason preventing the complete or partial deletion of the information."],
                ["10. Contact and protection against improper requests", "We may request clarification when a request is excessively broad, does not allow us to identify the relevant data, or cannot be verified. We will not delete or disclose third-party information to a person who lacks authority. To initiate or inquire about a request, use the Contact page."],
            ],
        },
    },
};

function LegalPage({ type }) {
    const { language } = useLanguage();
    const localizedContent = CONTENT[type] || null;
    const currentLanguage = language === "en" ? "en" : "es";
    const copy = localizedContent ? localizedContent[currentLanguage] || localizedContent.es : null;

    useEffect(() => {
        document.title = copy ? `${copy.title} | Dialoqo` : "Dialoqo";
    }, [copy?.title]);

    if (!copy) {
        return null;
    }

    return (
        <>
            <section className={styles.hero}>
                <div>
                    <h1>{copy.title}</h1>

                    {copy.updated && (
                        <span className={styles.updated}>
                            {copy.updated}
                        </span>
                    )}

                    <p>{copy.intro}</p>

                    {copy.description && (
                        <p className={styles.description}>
                            {copy.description}
                        </p>
                    )}
                </div>
            </section>

            <article className={styles.content}>
                {copy.sections.map(([title, text]) => (
                    <section key={title}>
                        <h2>{title}</h2>
                        <p>{text}</p>
                    </section>
                ))}
            </article>
        </>
    );
}

export default LegalPage;