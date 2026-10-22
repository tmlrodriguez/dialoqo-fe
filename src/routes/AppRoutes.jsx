import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/common/layout/AppLayout/AppLayout.jsx";
import PublicLayout from "../components/public/layout/PublicLayout/PublicLayout.jsx";
import RoutePage from "../components/routing/boundaries/RoutePage/RoutePage.jsx";
import ProtectedRoute from "../components/routing/guards/ProtectedRoute/ProtectedRoute.jsx";
import { useAuth } from "../hooks/useAuth.js";

const LandingPage = lazy(() => import("../pages/public/LandingPage/LandingPage.jsx"));
const LegalPage = lazy(() => import("../pages/public/LegalPage/LegalPage.jsx"));
const ContactPage = lazy(() => import("../pages/public/ContactPage/ContactPage.jsx"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage/LoginPage.jsx"));

const MonitoringPage = lazy(() => import("../pages/monitoring/MonitoringPage/MonitoringPage.jsx"));
const OrganizationPage = lazy(() => import("../pages/administration/organizations/OrganizationPage/OrganizationPage.jsx"));
const AccessPage = lazy(() => import("../pages/administration/access/AccessPage/AccessPage.jsx"));
const WhatsAppAdministrationPage = lazy(() => import("../pages/whatsapp/WhatsAppPage/WhatsAppPage.jsx"));
const AuditEventsPage = lazy(() => import("../pages/auditing/AuditEventsPage/AuditEventsPage.jsx"));

/**
 * RoleHomeRoute
 * Description: Redirigir al usuario a la página inicial correspondiente a su rol.
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
 * Description: Definir las rutas públicas y autenticadas con sus permisos y carga diferida.
 */
function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/" element={<RoutePage><LandingPage /></RoutePage>} />
                <Route path="/privacy" element={<RoutePage><LegalPage type="privacy" /></RoutePage>} />
                <Route path="/terms" element={<RoutePage><LegalPage type="terms" /></RoutePage>} />
                <Route path="/data-deletion" element={<RoutePage><LegalPage type="deletion" /></RoutePage>} />
                <Route path="/contact" element={<RoutePage><ContactPage /></RoutePage>} />
            </Route>

            <Route path="/login" element={<RoutePage><LoginPage /></RoutePage>} />

            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<RoleHomeRoute />} />
                <Route path="monitoring" element={<ProtectedRoute allowedRoles={["MONITOR", "MEMBER"]}><RoutePage><MonitoringPage /></RoutePage></ProtectedRoute>} />
                <Route path="administration/organization" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><RoutePage><OrganizationPage /></RoutePage></ProtectedRoute>} />
                <Route path="administration/access" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><RoutePage><AccessPage /></RoutePage></ProtectedRoute>} />
                <Route path="administration/whatsapp" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><RoutePage><WhatsAppAdministrationPage /></RoutePage></ProtectedRoute>} />
                <Route path="auditing" element={<ProtectedRoute allowedRoles={["ADMINISTRATOR"]}><RoutePage><AuditEventsPage /></RoutePage></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;
