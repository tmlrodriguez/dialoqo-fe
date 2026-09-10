import { apiRequest } from "../api/client.js";


/**
 * getMetaIntegrations
 *
 * Description:
 * - Obtener las integraciones de Meta activas de una empresa.
 */
export function getMetaIntegrations(companyId) {
    return apiRequest(`/whatsapp/companies/${companyId}/integrations/`);
}


/**
 * getMetaIntegration
 *
 * Description:
 * - Obtener el detalle de una integración de Meta.
 */
export function getMetaIntegration(companyId, integrationId) {
    return apiRequest(`/whatsapp/companies/${companyId}/integrations/${integrationId}/`);
}


/**
 * createMetaIntegration
 *
 * Description:
 * - Crear una integración de Meta dentro de una empresa.
 */
export function createMetaIntegration(companyId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/integrations/`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}


/**
 * updateMetaIntegration
 *
 * Description:
 * - Actualizar una integración de Meta existente.
 */
export function updateMetaIntegration(companyId, integrationId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/integrations/${integrationId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}


/**
 * deactivateMetaIntegration
 *
 * Description:
 * - Desactivar una integración de Meta existente.
 */
export function deactivateMetaIntegration(companyId, integrationId) {
    return apiRequest(`/whatsapp/companies/${companyId}/integrations/${integrationId}/`, {
        method: "DELETE",
    });
}


/**
 * validateMetaIntegration
 *
 * Description:
 * - Validar contra Meta las credenciales configuradas para una integración.
 */
export function validateMetaIntegration(companyId, integrationId) {
    return apiRequest(`/whatsapp/companies/${companyId}/integrations/${integrationId}/validate/`, {
        method: "POST",
    });
}


/**
 * getWhatsAppBusinessAccounts
 *
 * Description:
 * - Obtener las cuentas de WhatsApp Business activas de una empresa.
 */
export function getWhatsAppBusinessAccounts(companyId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/`);
}


/**
 * getWhatsAppBusinessAccount
 *
 * Description:
 * - Obtener el detalle de una cuenta de WhatsApp Business.
 */
export function getWhatsAppBusinessAccount(companyId, accountId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/`);
}


/**
 * createWhatsAppBusinessAccount
 *
 * Description:
 * - Crear una cuenta de WhatsApp Business dentro de una empresa.
 */
export function createWhatsAppBusinessAccount(companyId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}


/**
 * updateWhatsAppBusinessAccount
 *
 * Description:
 * - Actualizar una cuenta de WhatsApp Business existente.
 */
export function updateWhatsAppBusinessAccount(companyId, accountId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}


/**
 * deactivateWhatsAppBusinessAccount
 *
 * Description:
 * - Desactivar una cuenta de WhatsApp Business existente.
 */
export function deactivateWhatsAppBusinessAccount(companyId, accountId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/`, {
        method: "DELETE",
    });
}


/**
 * connectWhatsAppBusinessAccount
 *
 * Description:
 * - Conectar una cuenta de WhatsApp Business con Meta.
 */
export function connectWhatsAppBusinessAccount(companyId, accountId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/connection/`, {
        method: "POST",
    });
}


/**
 * refreshWhatsAppBusinessAccount
 *
 * Description:
 * - Actualizar el estado real de una cuenta de WhatsApp Business contra Meta.
 */
export function refreshWhatsAppBusinessAccount(companyId, accountId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/connection/`, {
        method: "PATCH",
    });
}


/**
 * disconnectWhatsAppBusinessAccount
 *
 * Description:
 * - Desconectar una cuenta de WhatsApp Business de Meta.
 */
export function disconnectWhatsAppBusinessAccount(companyId, accountId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/connection/`, {
        method: "DELETE",
    });
}


/**
 * getWhatsAppNumbers
 *
 * Description:
 * - Obtener los números de WhatsApp activos de una sucursal.
 */
export function getWhatsAppNumbers(companyId, branchId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/`);
}


/**
 * getWhatsAppNumber
 *
 * Description:
 * - Obtener el detalle de un número de WhatsApp.
 */
export function getWhatsAppNumber(companyId, branchId, numberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/`);
}


/**
 * createWhatsAppNumber
 *
 * Description:
 * - Crear un número de WhatsApp dentro de una sucursal.
 */
export function createWhatsAppNumber(companyId, branchId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}


/**
 * updateWhatsAppNumber
 *
 * Description:
 * - Actualizar un número de WhatsApp existente.
 */
export function updateWhatsAppNumber(companyId, branchId, numberId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}


/**
 * deactivateWhatsAppNumber
 *
 * Description:
 * - Desactivar un número de WhatsApp existente.
 */
export function deactivateWhatsAppNumber(companyId, branchId, numberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/`, {
        method: "DELETE",
    });
}


/**
 * validateWhatsAppNumber
 *
 * Description:
 * - Validar contra Meta la conexión de un número de WhatsApp.
 */
export function validateWhatsAppNumber(companyId, branchId, numberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/validate/`, {
        method: "POST",
    });
}


/**
 * activateWhatsAppMonitoring
 *
 * Description:
 * - Activar el monitoreo de un número de WhatsApp.
 */
export function activateWhatsAppMonitoring(companyId, branchId, numberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/monitoring/`, {
        method: "POST",
    });
}


/**
 * deactivateWhatsAppMonitoring
 *
 * Description:
 * - Desactivar el monitoreo de un número de WhatsApp.
 */
export function deactivateWhatsAppMonitoring(companyId, branchId, numberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/monitoring/`, {
        method: "DELETE",
    });
}


/**
 * getNumberAssignments
 *
 * Description:
 * - Obtener la asignación actual y el historial de asignaciones de un número.
 */
export function getNumberAssignments(companyId, branchId, numberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/assignments/`);
}


/**
 * getNumberAssignment
 *
 * Description:
 * - Obtener una asignación específica de un número.
 */
export function getNumberAssignment(companyId, branchId, numberId, assignmentId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/assignments/${assignmentId}/`);
}


/**
 * assignWhatsAppNumber
 *
 * Description:
 * - Asignar o reasignar un número de WhatsApp a un miembro.
 */
export function assignWhatsAppNumber(companyId, branchId, numberId, memberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/assignments/`, {
        method: "POST",
        body: JSON.stringify({
            member: memberId,
        }),
    });
}


/**
 * unassignWhatsAppNumber
 *
 * Description:
 * - Finalizar la asignación activa de un número de WhatsApp.
 */
export function unassignWhatsAppNumber(companyId, branchId, numberId) {
    return apiRequest(`/whatsapp/companies/${companyId}/branches/${branchId}/numbers/${numberId}/assignments/`, {
        method: "DELETE",
    });
}


/**
 * getMessageTemplates
 *
 * Description:
 * - Obtener las plantillas de WhatsApp de una cuenta WABA.
 *
 * Notes:
 * - Permite búsqueda, filtrado y paginación.
 */
export function getMessageTemplates(companyId, accountId, filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.search) {
        queryParams.set("search", filters.search);
    }

    if (filters.status) {
        queryParams.set("status", filters.status);
    }

    if (filters.category) {
        queryParams.set("category", filters.category);
    }

    if (filters.language) {
        queryParams.set("language", filters.language);
    }

    if (filters.page) {
        queryParams.set("page", filters.page);
    }

    if (filters.pageSize) {
        queryParams.set("page_size", filters.pageSize);
    }

    const queryString = queryParams.toString();

    const endpoint = queryString
        ? `/whatsapp/companies/${companyId}/accounts/${accountId}/templates/?${queryString}`
        : `/whatsapp/companies/${companyId}/accounts/${accountId}/templates/`;

    return apiRequest(endpoint);
}


/**
 * getMessageTemplate
 *
 * Description:
 * - Obtener el detalle de una plantilla de WhatsApp.
 */
export function getMessageTemplate(companyId, accountId, templateId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/templates/${templateId}/`);
}


/**
 * createMessageTemplate
 *
 * Description:
 * - Crear una nueva plantilla y enviarla a Meta.
 */
export function createMessageTemplate(companyId, accountId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/templates/`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}


/**
 * updateMessageTemplate
 *
 * Description:
 * - Actualizar una plantilla existente en Meta.
 */
export function updateMessageTemplate(companyId, accountId, templateId, data) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/templates/${templateId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}


/**
 * deleteMessageTemplate
 *
 * Description:
 * - Eliminar una plantilla existente en Meta.
 */
export function deleteMessageTemplate(companyId, accountId, templateId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/templates/${templateId}/`, {
        method: "DELETE",
    });
}


/**
 * synchronizeMessageTemplates
 *
 * Description:
 * - Sincronizar el catálogo de plantillas de una WABA desde Meta.
 */
export function synchronizeMessageTemplates(companyId, accountId) {
    return apiRequest(`/whatsapp/companies/${companyId}/accounts/${accountId}/templates/sync/`, {
        method: "POST",
    });
}