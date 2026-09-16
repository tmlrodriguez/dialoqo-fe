import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout.jsx";
import ProtectedRoute from "../components/routing/ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

import AccessPage from "../pages/administration/access/AccessPage.jsx";
import OrganizationPage from "../pages/administration/organizations/OrganizationPage.jsx";
import WhatsAppAdministrationPage from "../pages/whatsapp/WhatsappAdministrationPage.jsx";
import AuditEventsPage from "../pages/auditing/AuditEventsPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import MonitoringPage from "../pages/monitoring/MonitoringPage.jsx";
import PublicLayout from "../components/public/PublicLayout.jsx";
import LandingPage from "../pages/public/LandingPage.jsx";
import LegalPage from "../pages/public/LegalPage.jsx";
import ContactPage from "../pages/public/ContactPage.jsx";


/**
 * RoleHomeRoute
 *
 * Description:
 * - Redirigir cada usuario autenticado a la página inicial correspondiente a su rol.
 *
 * Notes:
 * - ADMINISTRATOR ingresa directamente a la administración de organización.
 * - MONITOR ingresa directamente al flujo de monitoreo para seleccionar empresa, sucursal y número.
 * - MEMBER ingresa directamente a sus conversaciones autorizadas.
 */
function RoleHomeRoute() {
    const { user } = useAuth();

    if (user?.role === "ADMINISTRATOR") {
        return <Navigate to="/app/administration/organization" replace />;
    }

    if (user?.role === "MONITOR" || user?.role === "MEMBER") {
        return <Navigate to="/app/monitoring" replace />;
    }

    return <Navigate to="/login" replace />;
}


/**
 * AppRoutes
 *
 * Description:
 * - Definir las rutas principales de Dialoqo.
 *
 * Notes:
 * - Las rutas autenticadas utilizan ProtectedRoute.
 * - MONITOR accede a Monitoreo y consulta conversaciones exclusivamente en modo lectura.
 * - MEMBER accede a sus conversaciones y puede operar únicamente los números que el backend le autoriza.
 * - ADMINISTRATOR accede a las funciones administrativas y de auditoría.
 */
function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/privacy" element={<LegalPage type="privacy" />} />
                <Route path="/terms" element={<LegalPage type="terms" />} />
                <Route path="/data-deletion" element={<LegalPage type="deletion" />} />
                <Route path="/contact" element={<ContactPage />} />
            </Route>

            <Route path="/login" element={<LoginPage />} />

            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<RoleHomeRoute />} />
                <Route path="monitoring" element={<ProtectedRoute allowedRoles={["MONITOR", "MEMBER"]}><MonitoringPage /></ProtectedRoute>} />
                <Route path="administration/organization" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><OrganizationPage /></ProtectedRoute>} />
                <Route path="administration/access" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><AccessPage /></ProtectedRoute>} />
                <Route path="administration/whatsapp" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><WhatsAppAdministrationPage /></ProtectedRoute>} />
                <Route path="auditing" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><AuditEventsPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
