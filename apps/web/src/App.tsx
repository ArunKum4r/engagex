import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute.js";
import { useAccent } from "./hooks/use-accent";
import { useAuth } from "./hooks/use-auth";
import { useTheme } from "./hooks/use-theme";
import LoginPage from "./pages/auth/LoginPage.js";
import RegisterPage from "./pages/auth/RegisterPage.js";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.js";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.js";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.js";
import AppShell from "./components/layout/AppShell.js";
import DashboardPage from "./pages/dashboard/DashboardPage.js";
import AutomationsPage from "./pages/automations/AutomationsPage.js";
import AutomationDetailPage from "./pages/automations/AutomationDetailPage.js";
import WorkspaceSettingsPage from "./pages/settings/WorkspaceSettingsPage.js";
import WorkspaceMembersPage from "./pages/settings/WorkspaceMembersPage.js";
import AcceptInvitationPage from "./components/workspaces/AcceptInvitationPage.js";
import IntegrationsPage from "./pages/integrations/IntegrationsPage.js";
import IntegrationDetailsPage from "./pages/integrations/IntegrationDetailsPage.js";
import IntegrationAccountPage from "./pages/integrations/IntegrationAccountPage.js";
import AutomationEditPage from "./pages/automations/AutomationEditPage.js";
import AutomationPreviewPage from "./pages/automations/AutomationPreviewPage.js";
import PrivacyPolicy from "./pages/PrivacyPolicy.js";
import TermsOfService from "./pages/TermsOfService.js";
import DataDeletion from "./pages/DataDeletion.js";

const App = () => {
    useTheme();
    useAccent();
    useAuth();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/data-deletion" element={<DataDeletion />} />

                <Route element={<ProtectedRoute /> }>
                    <Route element={<AppShell />}>
                        <Route path="/dashboard" element={<DashboardPage />}/>
                        <Route path="/automations" element={<AutomationsPage />}/>
                        <Route path="/automations/:automationId" element={<AutomationDetailPage />}/>
                        <Route path="/automations/:automationId/edit" element={<AutomationEditPage />}/>
                        <Route path="/automations/:automationId/preview" element={<AutomationPreviewPage />}/>
                        <Route path="/settings/workspace" element={<WorkspaceSettingsPage />} />
                        <Route path="/settings/workspace/members" element={<WorkspaceMembersPage />} />
                        <Route
                            path="/workspaces"
                            element={
                                <div>
                                    Workspaces
                                </div>
                            }
                        />

                        <Route path="/integrations" element={<IntegrationsPage />}/>
                        <Route path="/integrations/:integrationSlug" element={<IntegrationDetailsPage />}/>
                        <Route path="/integrations/:integrationSlug/accounts/:accountId" element={<IntegrationAccountPage />}/>

                        <Route
                            path="/settings"
                            element={
                                <div>
                                    Settings
                                </div>
                            }
                        />
                    </Route>
                </Route>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;