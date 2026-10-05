import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Unauthorized from "../pages/Unauthorized";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

/* SUPER ADMIN */

import SuperAdminDashboard from "../pages/super-admin/Dashboard";
import CreateKAO from "../pages/super-admin/CreateKAO";
import ManageKAOs from "../pages/super-admin/ManageKAOs";
import SuperAdminAnalytics from "../pages/super-admin/Analytics";
import Documents from "../pages/super-admin/Documents";
import AuditLogs from "../pages/super-admin/AuditLogs";
import Settings from "../pages/super-admin/Settings";
import KAOsTable from "../pages/super-admin/KAOsTable";
import ClientsTable from "../pages/super-admin/ClientsTable";
import CompaniesTable from "../pages/super-admin/CompaniesTable";
import ManageKAODetail from "../pages/super-admin/ManageKAODetail";
import ManageClientDetail from "../pages/super-admin/ManageClientDetail";
import ManageCompanyDetail from "../pages/super-admin/ManageCompanyDetail";
import Approvals from "../pages/super-admin/Approvals";

/* KAO */

import KAODashboard from "../pages/kao/Dashboard";
import ManageClients from "../pages/kao/ManageClients";
import CreateClient from "../pages/kao/CreateClient";
import KaoCreateCompany from "../pages/kao/CreateCompany";
import KaoAnalytics from "../pages/kao/Analytics";
import KaoCompliance from "../pages/kao/Compliance";
import KaoDocuments from "../pages/kao/Documents";
import KaoReports from "../pages/kao/Reports";
import KaoManageCompanies from "../pages/kao/ManageCompanies";

/* CLIENT */

import ClientDashboard from "../pages/client/Dashboard";
import ManageCompanies from "../pages/client/ManageCompanies";
import ClientAnalytics from "../pages/client/Analytics";
import ClientCompliance from "../pages/client/Compliance";
import ClientUploads from "../pages/client/Uploads";
import ClientOnboarding from "../pages/client/Onboarding";
import CreateCompany from "../pages/client/CreateCompany";
import CreateLogin from "../pages/shared/CreateLogin";
import EmployeeOnboarding from "../pages/shared/EmployeeOnboarding";
import ManageEmployees from "../pages/shared/ManageEmployees";
import PlaceholderPage from "../pages/shared/PlaceholderPage";
import ProfilePage from "../pages/shared/ProfilePage";

/* COMPANY */

import CompanyDashboard from "../pages/company/Dashboard";
import UploadCompliance from "../pages/company/UploadCompliance";
import UploadHistory from "../pages/company/UploadHistory";
import AIInsights from "../pages/company/AIInsights";
import CompanyAnalytics from "../pages/company/Analytics";
import UploadDocuments from "../pages/company/UploadDocuments";
import CompanyReports from "../pages/company/Reports";
import ComplianceMaster from "../pages/company/ComplianceMaster";
import AddCompliance from "../pages/company/AddCompliance";
import Branches from "../pages/company/Branches";
import MasterData from "../pages/company/MasterData";
import ApprovalWorkflow from "../pages/company/ApprovalWorkflow";
import Notifications from "../pages/company/Notifications";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}

        <Route path="/" element={<Login />} />

        <Route path="/forgot-password" element={<Login />} />

        <Route path="/super-admin/login" element={<Login />} />

        <Route path="/kao/:kaoSlug/login" element={<Login />} />

        <Route path="/client/:clientSlug/login" element={<Login />} />

        <Route path="/company/:companySlug/login" element={<Login />} />

        {/* UNAUTHORIZED */}

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PROTECTED ROUTES */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* SUPER ADMIN */}

          <Route
            path="/super-admin"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/create-kao"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <CreateKAO />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/create-company"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <KaoCreateCompany />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/create-login"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <CreateLogin />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/approvals"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <Approvals />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/create-client"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <CreateClient />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/manage-kaos"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <ManageKAOs />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/manage-kaos/:id"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <ManageKAODetail />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/kaos"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <KAOsTable />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/clients"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <ClientsTable />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/manage-client/:id"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <ManageClientDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/companies"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <CompaniesTable />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/manage-company/:id"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <ManageCompanyDetail />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/analytics"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <SuperAdminAnalytics />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/upload-history"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <UploadHistory />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/documents"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <Documents />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/audit-logs"
            element={<Navigate to="/super-admin/activity-logs" replace />}
          />

          <Route
            path="/super-admin/activity-logs"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <AuditLogs />
              </RoleRoute>
            }
          />

          <Route
            path="/super-admin/settings"
            element={
              <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                <Settings />
              </RoleRoute>
            }
          />

          {/* KAO */}

          <Route
            path="/kao"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <KAODashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/create-client"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <CreateClient />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/profile"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <ProfilePage title="Profile KAO" />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/create-login"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <CreateLogin />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/create-company"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <KaoCreateCompany />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/manage-clients"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <ManageClients />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/analytics"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <KaoAnalytics />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/upload-history"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <UploadHistory />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/compliance"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <KaoCompliance />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/documents"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <KaoDocuments />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/reports"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <KaoReports />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/manage-companies"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <KaoManageCompanies />
              </RoleRoute>
            }
          />

          <Route
            path="/kao/activity-logs"
            element={
              <RoleRoute allowedRoles={["KAO"]}>
                <AuditLogs />
              </RoleRoute>
            }
          />

          {/* CLIENT */}

          <Route
            path="/client"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ClientDashboard />
              </RoleRoute>
            }
          />

          {/* Create Company is managed by super-admin now (moved out of client section) */}

          <Route
            path="/client/manage-companies"
            element={
              <RoleRoute
                allowedRoles={["CLIENT"]}
                allowedServiceModels={["PAAS"]}
              >
                <ManageCompanies />
              </RoleRoute>
            }
          />

          <Route
            path="/client/profile"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ProfilePage title="Profile Client" />
              </RoleRoute>
            }
          />

          <Route
            path="/client/create-login"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <CreateLogin />
              </RoleRoute>
            }
          />

          <Route
            path="/client/create-company"
            element={
              <RoleRoute
                allowedRoles={["CLIENT"]}
                allowedServiceModels={["PAAS"]}
              >
                <CreateCompany />
              </RoleRoute>
            }
          />

          <Route
            path="/client/onboarding-employee"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <EmployeeOnboarding />
              </RoleRoute>
            }
          />

          <Route
            path="/client/manage-employees"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ManageEmployees />
              </RoleRoute>
            }
          />

          <Route
            path="/client/upload-history"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ClientUploads />
              </RoleRoute>
            }
          />

          <Route
            path="/client/analytics"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ClientAnalytics />
              </RoleRoute>
            }
          />

          <Route
            path="/client/compliance"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ClientCompliance />
              </RoleRoute>
            }
          />

          <Route
            path="/client/uploads"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ClientUploads />
              </RoleRoute>
            }
          />

          <Route
            path="/client/onboarding"
            element={
              <RoleRoute allowedRoles={["CLIENT"]}>
                <ClientOnboarding />
              </RoleRoute>
            }
          />

          {/* COMPANY */}

          <Route
            path="/company"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <CompanyDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/company/upload"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <UploadCompliance />
              </RoleRoute>
            }
          />

          <Route
            path="/company/upload-history"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <UploadHistory />
              </RoleRoute>
            }
          />

          <Route
            path="/company/ai-insights"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <AIInsights />
              </RoleRoute>
            }
          />

          <Route
            path="/company/analytics"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <CompanyAnalytics />
              </RoleRoute>
            }
          />

          <Route
            path="/company/upload-documents"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <UploadDocuments />
              </RoleRoute>
            }
          />

          <Route
            path="/company/reports"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <CompanyReports />
              </RoleRoute>
            }
          />

          <Route
            path="/company/compliance-master"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <ComplianceMaster />
              </RoleRoute>
            }
          />

          <Route
            path="/company/compliance"
            element={<Navigate to="/company/compliance-master" replace />}
          />

          <Route
            path="/company/add-compliance"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <AddCompliance />
              </RoleRoute>
            }
          />

          <Route
            path="/company/profile"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <ProfilePage title="Profile Company/Branch" />
              </RoleRoute>
            }
          />

          <Route
            path="/company/onboarding-employee"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <EmployeeOnboarding />
              </RoleRoute>
            }
          />

          <Route
            path="/company/manage-employees"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <ManageEmployees />
              </RoleRoute>
            }
          />

          <Route
            path="/company/branches"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <Branches />
              </RoleRoute>
            }
          />

          <Route
            path="/company/master-data"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <MasterData />
              </RoleRoute>
            }
          />

          <Route
            path="/company/approvals"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <ApprovalWorkflow />
              </RoleRoute>
            }
          />

          <Route
            path="/company/notifications"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <Notifications />
              </RoleRoute>
            }
          />

          <Route
            path="/company/audit-trail"
            element={<Navigate to="/company/activity-logs" replace />}
          />

          <Route
            path="/company/activity-logs"
            element={
              <RoleRoute allowedRoles={["COMPANY"]}>
                <AuditLogs />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
