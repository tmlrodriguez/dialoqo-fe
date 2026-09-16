import { createContext, Fragment, useContext, useEffect, useMemo, useState } from "react";

export const LANGUAGE_STORAGE_KEY = "dialoqo_language";
export const SUPPORTED_LANGUAGES = ["es", "en"];

const LanguageContext = createContext(null);

const EXACT_TRANSLATIONS = {
    "Idioma": "Language",
    "Abrir menú": "Open menu",
    "Cerrar menú": "Close menu",
    "Acceso": "Access",
    "Acceso de empresa asignado correctamente.": "Company access assigned successfully.",
    "Acceso de empresa revocado correctamente.": "Company access revoked successfully.",
    "Actualizar estado": "Refresh status",
    "Asignación": "Assignment",
    "Cambiar número": "Change number",
    "Cargando": "Loading",
    "Cerrar": "Close",
    "Complete la información para registrar un nuevo miembro.": "Complete the information to register a new member.",
    "Complete la información para registrar una nueva empresa.": "Complete the information to register a new company.",
    "Complete la información para registrar una nueva sucursal.": "Complete the information to register a new branch.",
    "Conexión con Meta creada correctamente.": "Meta connection created successfully.",
    "Conexión con Meta desconectada correctamente.": "Meta connection disconnected successfully.",
    "Conexión con Meta establecida correctamente.": "Meta connection established successfully.",
    "Conexión con Meta verificada correctamente.": "Meta connection verified successfully.",
    "Configurado por Dialoqo": "Configured by Dialoqo",
    "Conversación": "Conversation",
    "Debe seleccionar una empresa antes de administrar sus sucursales.": "Select a company before managing its branches.",
    "Editar cuenta WABA": "Edit WABA account",
    "Editar empresa": "Edit company",
    "Editar miembro": "Edit member",
    "Editar número": "Edit number",
    "Editar plantilla": "Edit template",
    "Editar sucursal": "Edit branch",
    "El número ya se encuentra asignado al miembro seleccionado.": "The number is already assigned to the selected member.",
    "Estado": "Status",
    "Estado de Meta": "Meta status",
    "Finalizar": "End",
    "Guardar": "Save",
    "Historial": "History",
    "Información de la conexión actualizada correctamente.": "Connection information updated successfully.",
    "Miembro actualizado correctamente.": "Member updated successfully.",
    "Miembro creado correctamente.": "Member created successfully.",
    "Miembro desactivado correctamente.": "Member deactivated successfully.",
    "Modifique el número o administre su estado operativo.": "Update the number or manage its operational status.",
    "Modifique la configuración o gestione su conexión con Meta.": "Update the configuration or manage its Meta connection.",
    "Modifique la información de la empresa seleccionada.": "Update the selected company's information.",
    "Modifique la información de la sucursal seleccionada.": "Update the selected branch's information.",
    "Modifique la información del miembro seleccionado.": "Update the selected member's information.",
    "No configurado": "Not configured",
    "No fue posible": "Unable to complete the request",
    "No fue posible actualizar el estado de lectura de la conversación.": "Unable to update the conversation read status.",
    "No fue posible actualizar la conexión con Meta.": "Unable to update the Meta connection.",
    "No fue posible asignar el acceso.": "Unable to assign access.",
    "No fue posible asignar el número de WhatsApp.": "Unable to assign the WhatsApp number.",
    "No fue posible cargar el contexto de conversaciones.": "Unable to load the conversation context.",
    "No fue posible cargar la conexión con Meta.": "Unable to load the Meta connection.",
    "No fue posible cargar la cuenta de WhatsApp Business.": "Unable to load the WhatsApp Business account.",
    "No fue posible cargar la plantilla.": "Unable to load the template.",
    "No fue posible cargar las conversaciones.": "Unable to load conversations.",
    "No fue posible cargar las cuentas de WhatsApp Business.": "Unable to load WhatsApp Business accounts.",
    "No fue posible cargar las empresas.": "Unable to load companies.",
    "No fue posible cargar las sucursales.": "Unable to load branches.",
    "No fue posible cargar los accesos.": "Unable to load access records.",
    "No fue posible cargar los mensajes.": "Unable to load messages.",
    "No fue posible cargar los miembros.": "Unable to load members.",
    "No fue posible cargar mensajes anteriores.": "Unable to load earlier messages.",
    "No fue posible conectar la cuenta con Meta.": "Unable to connect the account to Meta.",
    "No fue posible crear la conexión con Meta.": "Unable to create the Meta connection.",
    "No fue posible desactivar el miembro.": "Unable to deactivate the member.",
    "No fue posible desactivar la cuenta de WhatsApp Business.": "Unable to deactivate the WhatsApp Business account.",
    "No fue posible desconectar la conexión con Meta.": "Unable to disconnect the Meta connection.",
    "No fue posible desconectar la cuenta de Meta.": "Unable to disconnect the account from Meta.",
    "No fue posible finalizar la asignación.": "Unable to end the assignment.",
    "No fue posible guardar el miembro.": "Unable to save the member.",
    "No fue posible guardar la cuenta de WhatsApp Business.": "Unable to save the WhatsApp Business account.",
    "No fue posible marcar la conversación como leída.": "Unable to mark the conversation as read.",
    "No fue posible obtener el detalle de la conexión con Meta.": "Unable to retrieve the Meta connection details.",
    "No fue posible obtener el detalle de la cuenta.": "Unable to retrieve the account details.",
    "No fue posible obtener el detalle de la plantilla.": "Unable to retrieve the template details.",
    "No fue posible obtener el detalle del evento.": "Unable to retrieve the event details.",
    "No fue posible obtener el detalle del número.": "Unable to retrieve the number details.",
    "No fue posible obtener la información del miembro.": "Unable to retrieve member information.",
    "No fue posible obtener la nueva conversación.": "Unable to retrieve the new conversation.",
    "No fue posible refrescar el estado de la cuenta.": "Unable to refresh the account status.",
    "No fue posible revocar el acceso.": "Unable to revoke access.",
    "No fue posible validar la conexión con Meta.": "Unable to validate the Meta connection.",
    "Nombre del número": "Number name",
    "Número": "Number",
    "Número seleccionado": "Selected number",
    "Operación": "Operation",
    "Progreso de selección": "Selection progress",
    "Reasignar": "Reassign",
    "Rol recibido:": "Received role:",
    "Sin rol": "No role",
    "Usuario MEMBER": "MEMBER user",
    "¿Desea desconectar esta empresa de Meta?": "Do you want to disconnect this company from Meta?",
    "— Conectada": "— Connected",
    "— Desconectada": "— Disconnected",
    "Hoy": "Today",
    "Ayer": "Yesterday",
    "Dialoqo · Inteligencia conversacional": "Dialoqo · Conversational intelligence",
    "Plataforma de inteligencia conversacional": "Conversational intelligence platform",
    "Inteligencia conversacional": "Conversational intelligence",
    "Inteligencia detrás de cada conversación": "Intelligence behind every conversation",
    "Bienvenido": "Welcome",
    "Inicia sesión para acceder a la inteligencia detrás de tus conversaciones.": "Sign in to access the intelligence behind your conversations.",
    "Usuario": "Username",
    "Contraseña": "Password",
    "Ingresa tu usuario": "Enter your username",
    "Ingresa tu contraseña": "Enter your password",
    "Iniciar sesión": "Sign in",
    "Iniciando sesión...": "Signing in...",
    "Cerrar sesión": "Sign out",
    "Cargando Dialoqo...": "Loading Dialoqo...",
    "No fue posible iniciar sesión.": "Unable to sign in.",
    "Convierte cada conversación en información que tu empresa puede entender y utilizar.": "Turn every conversation into information your company can understand and use.",
    "Dialoqo centraliza las comunicaciones de tu organización para escuchar, observar, interpretar y detectar lo que ocurre en cada conversación.": "Dialoqo centralizes your organization's communications to listen, observe, interpret, and detect what is happening in every conversation.",
    "Escucha y observa": "Listen and observe",
    "Mantén visibles las conversaciones de tu organización en tiempo real.": "Keep your organization's conversations visible in real time.",
    "Lee y entiende": "Read and understand",
    "Transforma mensajes y contexto en información útil para la operación.": "Turn messages and context into useful operational information.",
    "Detecta y alerta": "Detect and alert",
    "Identifica situaciones importantes para que puedan atenderse oportunamente.": "Identify important situations so they can be addressed promptly.",
    "Acceso no disponible": "Access unavailable",
    "El usuario autenticado no tiene un rol válido para utilizar Dialoqo.": "The authenticated user does not have a valid role to use Dialoqo.",
    "Administración": "Administration",
    "Organización": "Organization",
    "Usuarios y accesos": "Users and access",
    "Accesos de Monitores": "Monitor Access",
    "Auditoría": "Audit",
    "Monitoreo": "Monitoring",
    "Mis conversaciones": "My conversations",
    "WhatsApp": "WhatsApp",
    "Dashboard": "Dashboard",
    "Resumen general": "Overview",
    "Actividad reciente": "Recent activity",
    "Conversaciones activas": "Active conversations",
    "Mensajes sin leer": "Unread messages",
    "Números monitoreados": "Monitored numbers",
    "Gestión administrativa": "Administration management",
    "Eventos de auditoría": "Audit events",
    "Filtros": "Filters",
    "Filtros avanzados": "Advanced filters",
    "Empresa": "Company",
    "Empresas": "Companies",
    "Sucursal": "Branch",
    "Sucursales": "Branches",
    "Número de WhatsApp": "WhatsApp number",
    "Números de WhatsApp": "WhatsApp numbers",
    "Números": "Numbers",
    "Miembro": "Member",
    "Miembros": "Members",
    "Monitor": "Monitor",
    "Monitores": "Monitors",
    "Cuenta WABA": "WABA Account",
    "Cuentas WABA": "WABA Accounts",
    "Asignaciones": "Assignments",
    "Plantillas": "Templates",
    "Plantilla": "Template",
    "Conexión": "Connection",
    "Conectada": "Connected",
    "Conectado": "Connected",
    "Desconectada": "Disconnected",
    "No conectada": "Not connected",
    "Sin validar": "Not validated",
    "No validado": "Not validated",
    "Validar": "Validate",
    "Validar con Meta": "Validate with Meta",
    "Verificar conexión": "Verify connection",
    "Verificando conexión...": "Verifying connection...",
    "Monitoreando": "Monitoring",
    "Sin monitoreo": "Not monitored",
    "Tiempo real": "Real time",
    "Sin tiempo real": "No real-time connection",
    "Responsable": "Assigned member",
    "Sin responsable": "Unassigned",
    "Nombre": "Name",
    "Apellido": "Last name",
    "Correo electrónico": "Email",
    "Nombre de usuario": "Username",
    "Contraseña inicial": "Initial password",
    "Código": "Code",
    "Código único": "Unique code",
    "Descripción": "Description",
    "Notas": "Notes",
    "Información administrativa opcional": "Optional administrative information",
    "Descripción opcional": "Optional description",
    "Activo": "Active",
    "Activa": "Active",
    "Inactivo": "Inactive",
    "Revocado": "Revoked",
    "Sí": "Yes",
    "No": "No",
    "Crear": "Create",
    "Actualizar": "Update",
    "Editar": "Edit",
    "Eliminar": "Delete",
    "Desactivar": "Deactivate",
    "Cancelar": "Cancel",
    "Guardar cambios": "Save changes",
    "Guardar notas": "Save notes",
    "Buscar": "Search",
    "Enviar": "Send",
    "Enviar mensaje": "Send message",
    "Enviar plantilla": "Send template",
    "Enviar a Meta": "Send to Meta",
    "Abrir": "Open",
    "Anterior": "Previous",
    "Siguiente": "Next",
    "Asignar": "Assign",
    "Asignar número": "Assign number",
    "Reasignar número": "Reassign number",
    "Finalizar asignación": "End assignment",
    "Finalizando asignación...": "Ending assignment...",
    "Nueva conversación": "New conversation",
    "Nueva empresa": "New company",
    "Nueva sucursal": "New branch",
    "Nuevo monitor": "New monitor",
    "Nuevo miembro": "New member",
    "Nuevo número": "New number",
    "Nueva cuenta WABA": "New WABA account",
    "Nueva plantilla": "New template",
    "Crear empresa": "Create company",
    "Crear sucursal": "Create branch",
    "Crear monitor": "Create monitor",
    "Crear miembro": "Create member",
    "Crear número": "Create number",
    "Crear cuenta": "Create account",
    "Crear conexión con Meta": "Create Meta connection",
    "Creando conexión...": "Creating connection...",
    "Asignar acceso": "Assign access",
    "Asignar acceso de Monitor": "Assign Monitor access",
    "Accesos activos": "Active access",
    "Accesos de Monitores activos": "Active Monitor access",
    "Historial de accesos": "Access history",
    "Historial de Accesos de Monitores": "Monitor Access history",
    "Asignaciones de monitoreo actualmente vigentes.": "Currently active monitoring assignments.",
    "Seleccione un monitor y una empresa para autorizar su monitoreo.": "Select a monitor and a company to authorize monitoring access.",
    "Asigne una empresa a un monitor para comenzar.": "Assign a company to a monitor to get started.",
    "No existen accesos activos.": "There is no active access.",
    "Accesos anteriormente revocados.": "Previously revoked access.",
    "Accesos que fueron revocados anteriormente.": "Access that was previously revoked.",
    "Cargando accesos...": "Loading access...",
    "Cargando empresas...": "Loading companies...",
    "Cargando sucursales...": "Loading branches...",
    "Cargando monitores...": "Loading monitors...",
    "Cargando miembros...": "Loading members...",
    "Cargando contexto de conversaciones...": "Loading conversation context...",
    "Cargando archivo...": "Loading file...",
    "Preparando archivo...": "Preparing file...",
    "Cargando...": "Loading...",
    "Seleccione una empresa": "Select a company",
    "Seleccione una empresa.": "Select a company.",
    "Seleccione una sucursal": "Select a branch",
    "Seleccione un número": "Select a number",
    "Seleccione el canal de WhatsApp que desea supervisar.": "Select the WhatsApp channel you want to monitor.",
    "Seleccione la empresa cuyas conversaciones desea monitorear.": "Select the company whose conversations you want to monitor.",
    "Seleccione uno de sus números asignados para atender conversaciones.": "Select one of your assigned numbers to handle conversations.",
    "Su usuario todavía no tiene acceso a empresas con canales de monitoreo disponibles.": "Your user does not yet have access to companies with monitoring channels available.",
    "Su usuario todavía no tiene ningún número de WhatsApp asignado.": "Your user does not have any WhatsApp numbers assigned yet.",
    "Estamos obteniendo los canales autorizados para su usuario.": "We are retrieving the channels authorized for your user.",
    "Conversaciones": "Conversations",
    "Buscar conversaciones": "Search conversations",
    "Buscar cliente o número...": "Search customer or number...",
    "Todas": "All",
    "Todos": "All",
    "No leídas": "Unread",
    "No existen conversaciones disponibles.": "No conversations are available.",
    "No existen conversaciones pendientes de lectura.": "There are no unread conversations.",
    "No se encontraron conversaciones que coincidan con la búsqueda.": "No conversations matched your search.",
    "Las conversaciones aparecerán cuando exista actividad en este número.": "Conversations will appear when there is activity on this number.",
    "Seleccione una conversación del panel izquierdo para consultar su historial.": "Select a conversation from the left panel to view its history.",
    "Seleccione una conversación del panel izquierdo para consultar su historial y enviar mensajes.": "Select a conversation from the left panel to view its history and send messages.",
    "Sin mensajes todavía.": "No messages yet.",
    "Escriba un mensaje...": "Write a message...",
    "Leído": "Read",
    "Entregado": "Delivered",
    "Enviado": "Sent",
    "Fallido": "Failed",
    "Mensaje": "Message",
    "Mensaje relacionado": "Related message",
    "Reacción": "Reaction",
    "Ubicación": "Location",
    "Ubicación compartida": "Shared location",
    "Abrir mapa": "Open map",
    "Botón seleccionado": "Selected button",
    "Opción seleccionada": "Selected option",
    "Tipo de mensaje no soportado": "Unsupported message type",
    "CentralChat conservó el evento, pero todavía no dispone de una representación especializada.": "Dialoqo preserved the event, but a specialized representation is not available yet.",
    "No fue posible interpretar los datos del contacto.": "Unable to interpret the contact data.",
    "Archivo de WhatsApp": "WhatsApp file",
    "No fue posible obtener el archivo multimedia.": "Unable to retrieve the media file.",
    "El archivo multimedia todavía no está disponible.": "The media file is not available yet.",
    "Reintentar": "Retry",
    "Abrir imagen": "Open image",
    "Nueva conversación": "New conversation",
    "Cerrar nueva conversación": "Close new conversation",
    "Cerrar selector de plantillas": "Close template picker",
    "Nombre o idioma": "Name or language",
    "Debe proporcionar un número de WhatsApp válido incluyendo el código de país.": "Enter a valid WhatsApp number including the country code.",
    "No fue posible enviar el mensaje.": "Unable to send the message.",
    "No fue posible enviar la plantilla.": "Unable to send the template.",
    "No fue posible iniciar la conversación.": "Unable to start the conversation.",
    "La conversación fue creada, pero no fue posible abrirla automáticamente.": "The conversation was created, but it could not be opened automatically.",
    "Administre las empresas y sucursales registradas en Dialoqo.": "Manage the companies and branches registered in Dialoqo.",
    "Administre las empresas, sucursales, monitores y accesos de Dialoqo.": "Manage Dialoqo companies, branches, monitors, and access.",
    "Empresas activas administradas por su usuario.": "Active companies managed by your user.",
    "Sucursales activas de la empresa seleccionada.": "Active branches of the selected company.",
    "No existen empresas registradas.": "No companies are registered.",
    "No existen sucursales registradas.": "No branches are registered.",
    "Cree la primera empresa para comenzar a configurar Dialoqo.": "Create the first company to begin configuring Dialoqo.",
    "Cree la primera sucursal para la empresa seleccionada.": "Create the first branch for the selected company.",
    "Nombre de la empresa": "Company name",
    "Nombre de la sucursal": "Branch name",
    "Código de la sucursal": "Branch code",
    "Empresa creada correctamente.": "Company created successfully.",
    "Empresa actualizada correctamente.": "Company updated successfully.",
    "Empresa desactivada correctamente.": "Company deactivated successfully.",
    "Sucursal creada correctamente.": "Branch created successfully.",
    "Sucursal actualizada correctamente.": "Branch updated successfully.",
    "Sucursal desactivada correctamente.": "Branch deactivated successfully.",
    "No fue posible guardar la empresa.": "Unable to save the company.",
    "No fue posible guardar la sucursal.": "Unable to save the branch.",
    "No fue posible desactivar la sucursal.": "Unable to deactivate the branch.",
    "Usuarios autorizados para utilizar las funciones de monitoreo.": "Users authorized to use monitoring features.",
    "Usuarios de monitoreo administrados por su usuario.": "Monitoring users managed by your user.",
    "Usuarios que pueden recibir la asignación de números corporativos.": "Users who can be assigned corporate numbers.",
    "Empresas que cada usuario MONITOR tiene autorizadas para supervisión.": "Companies each MONITOR user is authorized to supervise.",
    "Cree el primer monitor para posteriormente asignarle acceso a empresas.": "Create the first monitor and then assign company access.",
    "No existen monitores registrados.": "No monitors are registered.",
    "No existen monitores disponibles": "No monitors available",
    "No existen empresas disponibles": "No companies available",
    "Complete la información para registrar un nuevo monitor.": "Complete the information to register a new monitor.",
    "Modifique la información del monitor seleccionado.": "Update the selected monitor's information.",
    "Editar monitor": "Edit monitor",
    "Monitor creado correctamente.": "Monitor created successfully.",
    "Monitor actualizado correctamente.": "Monitor updated successfully.",
    "No fue posible guardar el monitor.": "Unable to save the monitor.",
    "No fue posible cargar los monitores.": "Unable to load monitors.",
    "No fue posible obtener la información del monitor.": "Unable to retrieve monitor information.",
    "Administre cuentas de WhatsApp Business, números corporativos, responsables y plantillas utilizadas por Dialoqo.": "Manage WhatsApp Business accounts, corporate numbers, assignees, and templates used by Dialoqo.",
    "Cuenta de WhatsApp Business creada correctamente.": "WhatsApp Business account created successfully.",
    "Cuenta de WhatsApp Business actualizada correctamente.": "WhatsApp Business account updated successfully.",
    "Cuenta de WhatsApp Business conectada correctamente.": "WhatsApp Business account connected successfully.",
    "Cuenta de WhatsApp Business desactivada correctamente.": "WhatsApp Business account deactivated successfully.",
    "Cuenta desconectada correctamente.": "Account disconnected successfully.",
    "Estado de la cuenta actualizado correctamente.": "Account status updated successfully.",
    "Nombre de la cuenta": "Account name",
    "Identificador de WhatsApp Business Account": "WhatsApp Business Account identifier",
    "Identificador del número en Meta": "Meta phone number identifier",
    "Registre una cuenta de WhatsApp Business para la empresa.": "Register a WhatsApp Business account for the company.",
    "Registre un número corporativo de WhatsApp.": "Register a corporate WhatsApp number.",
    "Número de WhatsApp creado correctamente.": "WhatsApp number created successfully.",
    "Número de WhatsApp actualizado correctamente.": "WhatsApp number updated successfully.",
    "Número de WhatsApp desactivado correctamente.": "WhatsApp number deactivated successfully.",
    "Número de WhatsApp validado correctamente.": "WhatsApp number validated successfully.",
    "Número de WhatsApp asignado correctamente.": "WhatsApp number assigned successfully.",
    "Número de WhatsApp desasignado correctamente.": "WhatsApp number unassigned successfully.",
    "Monitoreo de WhatsApp activado correctamente.": "WhatsApp monitoring activated successfully.",
    "Monitoreo de WhatsApp desactivado correctamente.": "WhatsApp monitoring deactivated successfully.",
    "No fue posible validar el número contra Meta.": "Unable to validate the number with Meta.",
    "No fue posible activar el monitoreo.": "Unable to activate monitoring.",
    "No fue posible desactivar el monitoreo.": "Unable to deactivate monitoring.",
    "No fue posible cargar los números de WhatsApp.": "Unable to load WhatsApp numbers.",
    "No fue posible guardar el número de WhatsApp.": "Unable to save the WhatsApp number.",
    "No fue posible desactivar el número de WhatsApp.": "Unable to deactivate the WhatsApp number.",
    "Plantillas sincronizadas correctamente.": "Templates synchronized successfully.",
    "Defina una nueva plantilla para enviarla a revisión.": "Define a new template to submit for review.",
    "El campo Components debe contener JSON válido.": "The Components field must contain valid JSON.",
    "No fue posible cargar las plantillas.": "Unable to load templates.",
    "No fue posible cargar las plantillas de WhatsApp.": "Unable to load WhatsApp templates.",
    "No fue posible guardar la plantilla.": "Unable to save the template.",
    "No fue posible eliminar la plantilla.": "Unable to delete the template.",
    "No fue posible sincronizar las plantillas con Meta.": "Unable to synchronize templates with Meta.",
    "Consulte y analice el historial inmutable de acciones administrativas, operativas y de seguridad registradas en Dialoqo.": "Review and analyze the immutable history of administrative, operational, and security actions recorded in Dialoqo.",
    "Categoría": "Category",
    "Acción": "Action",
    "Severidad": "Severity",
    "Actor": "Actor",
    "Recurso": "Resource",
    "Modelo destino": "Target model",
    "Aplicación destino": "Target application",
    "ID del recurso": "Resource ID",
    "Fecha y hora": "Date and time",
    "Dirección IP": "IP address",
    "User agent": "User agent",
    "Request ID": "Request ID",
    "Metadata": "Metadata",
    "Información": "Information",
    "Crítico": "Critical",
    "Autenticación": "Authentication",
    "Inicio de sesión": "Sign in",
    "Cierre de sesión": "Sign out",
    "Todas las categorías": "All categories",
    "Descripción, usuario, recurso...": "Description, user, resource...",
    "Refine el historial de auditoría utilizando los criterios disponibles.": "Refine the audit history using the available criteria.",
    "Utilice estos campos para investigaciones técnicas o trazabilidad específica.": "Use these fields for technical investigations or specific traceability.",
    "No fue posible cargar los eventos de auditoría.": "Unable to load audit events.",
    "No fue posible cargar el detalle del evento.": "Unable to load the event details.",
    "Sin recurso específico": "No specific resource",
    "No disponible.": "Not available.",
    "Aún no hay información para mostrar": "There is no information to display yet",
    "Bienvenido a Dialoqo. Consulta el estado general de la plataforma.": "Welcome to Dialoqo. View the overall platform status.",
    "Estado general de las integraciones configuradas.": "Overall status of configured integrations.",
    "Conversaciones actualmente monitoreadas.": "Currently monitored conversations.",
    "Mensajes pendientes de revisión.": "Messages pending review.",
    "Números de WhatsApp con monitoreo activo.": "WhatsApp numbers with active monitoring.",
    "Los eventos y conversaciones recientes aparecerán en esta sección.": "Recent events and conversations will appear in this section.",
    "La actividad reciente aparecerá aquí cuando integremos los datos del backend.": "Recent activity will appear here when backend data is integrated.",
    "Buscar plantilla...": "Search templates...",
    "Cree el primer miembro para posteriormente asignarle un número corporativo.": "Create the first member and then assign a corporate number.",
    "La sucursal seleccionada no contiene números de WhatsApp disponibles para monitoreo.": "The selected branch has no WhatsApp numbers available for monitoring.",
    "Miembro asignado": "Assigned member",
    "Monitor desactivado correctamente.": "Monitor deactivated successfully.",
    "No existen empresas disponibles.": "No companies are available.",
    "No existen miembros registrados.": "No members are registered.",
    "No existen números disponibles.": "No numbers are available.",
    "No existen sucursales disponibles.": "No branches are available.",
    "No fue posible cargar el miembro.": "Unable to load the member.",
    "No fue posible cargar el monitor.": "Unable to load the monitor.",
    "No fue posible cargar el número de WhatsApp.": "Unable to load the WhatsApp number.",
    "No fue posible cargar las asignaciones del número.": "Unable to load number assignments.",
    "No fue posible completar la solicitud.": "Unable to complete the request.",
    "No fue posible crear la conexión WebSocket: faltan parámetros requeridos.": "Unable to create the WebSocket connection: required parameters are missing.",
    "No fue posible desactivar el monitor.": "Unable to deactivate the monitor.",
    "No fue posible desactivar la empresa.": "Unable to deactivate the company.",
    "Plantilla actualizada correctamente.": "Template updated successfully.",
    "Plantilla eliminada correctamente.": "Template deleted successfully.",
    "Plantilla enviada a Meta correctamente.": "Template sent to Meta successfully.",
    "Sin nombre": "Unnamed",
    "Sin webhook": "No webhook",
    "Todas las acciones": "All actions",
    "Todas las severidades": "All severities",
    "Tiempo real activo": "Real-time connected",
    "Tiempo real desconectado": "Real-time disconnected",
    "La conexión en tiempo real permite que nuevos mensajes y cambios aparezcan sin recargar la página.": "The real-time connection lets new messages and updates appear without reloading the page.",
    "No fue posible obtener el detalle de la conversación.": "Unable to retrieve the conversation details.",

};

const WORD_TRANSLATIONS = [
    ["No fue posible", "Unable to"], ["Seleccione", "Select"], ["Cargando", "Loading"], ["Creando", "Creating"], ["Guardando", "Saving"], ["Actualizando", "Updating"], ["Desactivando", "Deactivating"], ["Conectando", "Connecting"], ["Desconectando", "Disconnecting"], ["Validando", "Validating"], ["Sincronizando", "Synchronizing"], ["Empresa", "Company"], ["empresas", "companies"], ["empresa", "company"], ["Sucursal", "Branch"], ["sucursales", "branches"], ["sucursal", "branch"], ["Número", "Number"], ["número", "number"], ["Números", "Numbers"], ["Miembro", "Member"], ["miembro", "member"], ["Miembros", "Members"], ["Monitor", "Monitor"], ["monitores", "monitors"], ["Conversaciones", "Conversations"], ["conversaciones", "conversations"], ["Conversación", "Conversation"], ["conversación", "conversation"], ["Mensajes", "Messages"], ["mensajes", "messages"], ["Mensaje", "Message"], ["mensaje", "message"], ["Plantillas", "Templates"], ["plantillas", "templates"], ["Plantilla", "Template"], ["plantilla", "template"], ["Responsable", "Assigned member"], ["responsable", "assigned member"], ["Asignación", "Assignment"], ["asignación", "assignment"], ["Historial", "History"], ["Estado", "Status"], ["Buscar", "Search"], ["Crear", "Create"], ["Editar", "Edit"], ["Guardar", "Save"], ["Eliminar", "Delete"], ["Desactivar", "Deactivate"], ["Activar", "Activate"], ["Validar", "Validate"], ["Conectar", "Connect"], ["Desconectar", "Disconnect"], ["Actualizar", "Update"], ["Asignar", "Assign"], ["Reasignar", "Reassign"], ["Finalizar", "End"], ["Enviar", "Send"], ["Cerrar", "Close"], ["Abrir", "Open"], ["Anterior", "Previous"], ["Siguiente", "Next"], ["Nombre", "Name"], ["Apellido", "Last name"], ["Correo electrónico", "Email"], ["Contraseña", "Password"], ["Usuario", "Username"], ["Notas", "Notes"], ["Descripción", "Description"], ["Información", "Information"], ["Activo", "Active"], ["Activa", "Active"], ["Inactivo", "Inactive"], ["Conectada", "Connected"], ["Conectado", "Connected"], ["Desconectada", "Disconnected"], ["Configurado", "Configured"], ["No configurado", "Not configured"], ["Sin validar", "Not validated"], ["Sin webhook", "No webhook"], ["Sin monitoreo", "Not monitored"], ["Sin responsable", "Unassigned"], ["Administración", "Administration"], ["Organización", "Organization"], ["Auditoría", "Audit"], ["Monitoreo", "Monitoring"]
];

function normalizeLanguage(value) {
    return SUPPORTED_LANGUAGES.includes(value) ? value : "es";
}

export function getStoredLanguage() {
    return normalizeLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function getLanguageLocale(language = getStoredLanguage()) {
    return language === "en" ? "en-US" : "es-HN";
}

export function translateText(value, language = getStoredLanguage()) {
    if (language !== "en" || typeof value !== "string") return value;
    const original = value;
    const trimmed = original.trim();
    if (!trimmed) return original;
    let translated = EXACT_TRANSLATIONS[trimmed];
    if (!translated) {
        translated = trimmed;
        for (const [source, target] of WORD_TRANSLATIONS) translated = translated.split(source).join(target);
    }
    if (translated === trimmed) return original;
    const leading = original.match(/^\s*/)?.[0] || "";
    const trailing = original.match(/\s*$/)?.[0] || "";
    return `${leading}${translated}${trailing}`;
}

const textTranslationState = new WeakMap();
const attributeTranslationState = new WeakMap();

function translateElementTree(root, language) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    for (const node of textNodes) {
        if (!node.parentElement || ["SCRIPT", "STYLE"].includes(node.parentElement.tagName)) continue;

        const currentText = node.nodeValue || "";
        const previousState = textTranslationState.get(node);
        let originalText = previousState?.original ?? currentText;

        // React can reuse an existing Text node when dynamic data changes. If the
        // current DOM value is different from the value last rendered by the
        // translator, treat it as new application content instead of restoring
        // the first value ever seen on this node.
        if (previousState && currentText !== previousState.rendered) originalText = currentText;

        const targetText = language === "en" ? translateText(originalText, "en") : originalText;
        textTranslationState.set(node, { original: originalText, rendered: targetText });

        if (currentText !== targetText) node.nodeValue = targetText;
    }

    const elements = root.nodeType === Node.ELEMENT_NODE ? [root, ...root.querySelectorAll("*")] : [...document.querySelectorAll("*")];
    for (const element of elements) {
        let elementState = attributeTranslationState.get(element);
        if (!elementState) {
            elementState = {};
            attributeTranslationState.set(element, elementState);
        }

        for (const attribute of ["placeholder", "aria-label", "title"]) {
            if (!element.hasAttribute?.(attribute)) continue;

            const currentValue = element.getAttribute(attribute) || "";
            const previousState = elementState[attribute];
            let originalValue = previousState?.original ?? currentValue;

            if (previousState && currentValue !== previousState.rendered) originalValue = currentValue;

            const targetValue = language === "en" ? translateText(originalValue, "en") : originalValue;
            elementState[attribute] = { original: originalValue, rendered: targetValue };

            if (currentValue !== targetValue) element.setAttribute(attribute, targetValue);
        }
    }
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(getStoredLanguage);

    function setLanguage(nextLanguage) {
        const normalized = normalizeLanguage(nextLanguage);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
        setLanguageState(normalized);
    }

    useEffect(() => {
        document.documentElement.lang = language;
        const root = document.getElementById("root");
        translateElementTree(root, language);
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "characterData") translateElementTree(mutation.target.parentElement, language);
                for (const node of mutation.addedNodes) if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) translateElementTree(node.nodeType === Node.TEXT_NODE ? node.parentElement : node, language);
            }
        });
        if (root) observer.observe(root, { childList: true, subtree: true, characterData: true });
        return () => observer.disconnect();
    }, [language]);

    useEffect(() => {
        const originalConfirm = window.confirm;
        const originalAlert = window.alert;
        window.confirm = (message) => originalConfirm(translateText(String(message), language));
        window.alert = (message) => originalAlert(translateText(String(message), language));
        return () => { window.confirm = originalConfirm; window.alert = originalAlert; };
    }, [language]);

    const value = useMemo(() => ({ language, locale: getLanguageLocale(language), setLanguage, t: (text) => translateText(text, language) }), [language]);

    return <LanguageContext.Provider value={value}><Fragment key={language}>{children}</Fragment></LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used inside LanguageProvider.");
    return context;
}
