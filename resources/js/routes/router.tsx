import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardHome from "@/pages/DashboardHome";
import FileList from "@/pages/Files/FileList";
import FileAdd from "@/pages/Files/FileAdd";
import UserList from "@/pages/user/UserList";
import AddUser from "@/pages/user/AddUser";
import UpdateUser from "@/pages/user/UpdateUser";
import AssetList from "@/pages/asset/AssetList";
import CreateAsset from "@/pages/asset/CreateAsset";
import EditAsset from "@/pages/asset/EditAsset";
import ViewAsset from "@/pages/asset/ViewAsset";
import Privacy from "@/pages/user/Privacy";
import PolicyList from "@/pages/policies/PolicyList";
import PolicyDetail from "@/pages/policies/PolicyDetail";
import CreatePolicy from "@/pages/policies/CreatePolicy";
import AuditLogList from "@/pages/audit/AuditList";
//import ProtectedRoute from "./ProtectedRoutes";

const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthLayout />,
        children: [{ index: true, element: <LoginPage /> }],
    },
    {
        path: "/dashboard",
        element: (
            // <ProtectedRoute>
            <DashboardLayout />
            // </ProtectedRoute>
        ),
        children: [
            { index: true, element: <DashboardHome /> },
            {
                path: "assets",
                element: <AssetList isPending={false} isAi={false} />,
            },
            {
                path: "pending-assets",
                element: <AssetList isPending={true} isAi={false} />,
            },
            { path: "assets/store", element: <CreateAsset /> },
            { path: "assets/:id/view", element: <ViewAsset /> },
            { path: "assets/:id/edit", element: <EditAsset /> },
            { path: "users", element: <UserList /> },
            { path: "users/store", element: <AddUser /> },
            { path: "users/:id/edit", element: <UpdateUser /> },
            { path: "privacy", element: <Privacy /> },
            { path: "policies", element: <PolicyList /> },
            { path: "policies/:id", element: <PolicyDetail /> },
            { path: "policies/create", element: <CreatePolicy /> },
            {
                path: "ai-recommended-assets",
                element: <AssetList isPending={false} isAi={true} />,
            },
            { path: "audits", element: <AuditLogList /> },
        ],
    },
]);

export default router;
