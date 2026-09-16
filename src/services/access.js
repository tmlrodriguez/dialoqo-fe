import { apiRequest } from "../api/client.js";


/**
 * getMonitors
 *
 * Description:
 * - Obtener los monitores activos administrados por el usuario autenticado.
 *
 * Notes:
 * - Solo está disponible para usuarios ADMINISTRATOR.
 */
export function getMonitors() {
    return apiRequest("/access/monitors/");
}


/**
 * getMonitor
 *
 * Description:
 * - Obtener un monitor específico administrado por el usuario autenticado.
 *
 * Notes:
 * - El monitor debe pertenecer al administrador autenticado.
 */
export function getMonitor(userId) {
    return apiRequest(`/access/monitors/${userId}/`);
}


/**
 * createMonitor
 *
 * Description:
 * - Crear un nuevo usuario MONITOR en CentralChat.
 *
 * Notes:
 * - El rol MONITOR es asignado exclusivamente por el backend.
 */
export function createMonitor(monitorData) {
    return apiRequest("/access/monitors/", {
        method: "POST",
        body: JSON.stringify(monitorData),
    });
}


/**
 * updateMonitor
 *
 * Description:
 * - Actualizar parcialmente un monitor existente.
 *
 * Notes:
 * - La contraseña y el rol no pueden modificarse mediante esta operación.
 */
export function updateMonitor(userId, monitorData) {
    return apiRequest(`/access/monitors/${userId}/`, {
        method: "PATCH",
        body: JSON.stringify(monitorData),
    });
}


/**
 * deactivateMonitor
 *
 * Description:
 * - Desactivar un monitor existente.
 *
 * Notes:
 * - El usuario permanece preservado para mantener su historial.
 */
export function deactivateMonitor(userId) {
    return apiRequest(`/access/monitors/${userId}/`, {
        method: "DELETE",
    });
}


export function getMembers() {
    return apiRequest("/access/members/");
}


export function getMember(memberId) {
    return apiRequest(`/access/members/${memberId}/`);
}


export function createMember(data) {
    return apiRequest("/access/members/", {
        method: "POST",
        body: JSON.stringify(data),
    });
}


export function updateMember(memberId, data) {
    return apiRequest(`/access/members/${memberId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}


export function deactivateMember(memberId) {
    return apiRequest(`/access/members/${memberId}/`, {
        method: "DELETE",
    });
}