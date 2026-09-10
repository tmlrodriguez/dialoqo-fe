import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout.jsx";
import ProtectedRoute from "../components/routing/ProtectedRoute.jsx";

import AccessPage from "../pages/administration/access/AccessPage.jsx";
import MembersPage from "../pages/administration/members/MembersPage.jsx";
import OrganizationPage from "../pages/administration/organizations/OrganizationPage.jsx";
import WhatsAppAdministrationPage from "../pages/whatsapp/WhatsappAdministrationPage.jsx";
import AuditEventsPage from "../pages/auditing/AuditEventsPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import MonitoringPage from "../pages/monitoring/MonitoringPage.jsx";


/**
 * AppRoutes
 *
 * Description:
 * - Definir las rutas principales de Dialoqo.
 *
 * Notes:
 * - Las rutas autenticadas utilizan ProtectedRoute.
 * - Los MONITOR acceden a Dashboard y Conversaciones.
 * - Los ADMINISTRATOR acceden a las funciones administrativas y de auditoría.
 */
function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/app" replace />} />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<ProtectedRoute allowedRoles={["MONITOR"]}><DashboardPage /></ProtectedRoute>} />
                <Route path="monitoring" element={<ProtectedRoute allowedRoles={["MONITOR"]}><MonitoringPage /></ProtectedRoute>} />
                <Route path="administration/organization" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><OrganizationPage /></ProtectedRoute>} />
                <Route path="administration/members" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><MembersPage /></ProtectedRoute>} />
                <Route path="administration/access" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><AccessPage /></ProtectedRoute>} />
                <Route path="administration/whatsapp" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><WhatsAppAdministrationPage /></ProtectedRoute>} />
                <Route path="auditing" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><AuditEventsPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;