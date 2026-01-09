import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const Sidebar = () => {
    // ACCESS: Check your DevTools. Usually it is user.role, not user.data.role
    const { user } = useAuthStore();
    const userRole = user?.role || user?.data?.role;

    // 1. Define the Menu Structure
    const navItems = [
        // --- COMMON ---
        {
            path: "/dashboard",
            label: "Overview",
            icon: "📊",
            allowedRoles: null, // Visible to everyone
        },
        {
            path: "/dashboard/assets",
            label: "Knowledge Base",
            icon: "📚",
            allowedRoles: null,
        },
        {
            path: "/dashboard/policies",
            label: "Governance Policies",
            icon: "⚖️",
            allowedRoles: null, // Everyone reads policies
        },

        // --- MANAGEMENT ZONES ---
        {
            path: "/dashboard/pending-assets",
            label: "Pending Reviews",
            icon: "✅",
            // Matches your 'review' backend route permissions
            allowedRoles: ["SUPERVISOR", "ADMIN", "GOVERNANCE_COUNCIL"],
        },
        {
            path: "/dashboard/audits",
            label: "Audit Logs",
            icon: "🕵️‍♂️",
            allowedRoles: ["ADMIN", "GOVERNANCE_COUNCIL"],
        },
        {
            path: "/dashboard/ai-recommended-assets",
            label: "AI Recommendation",
            icon: "🤖",
            allowedRoles: null,
        },
        {
            path: "/dashboard/users",
            label: "User Management",
            icon: "👥",
            // Matches your 'UserController' backend route
            allowedRoles: ["ADMIN"],
        },

        // --- COMPLIANCE ---
        {
            path: "/dashboard/privacy",
            label: "Privacy & GDPR",
            icon: "🔒",
            allowedRoles: null,
        },
    ];

    // 2. Filter logic
    const visibleItems = navItems.filter((item) => {
        if (!item.allowedRoles) return true;
        return item.allowedRoles.includes(userRole);
    });

    return (
        <div
            className="bg-white border-end h-100 shadow-sm"
            id="sidebar-wrapper"
            style={{ minHeight: "100vh" }}
        >
            <div className="sidebar-heading border-bottom bg-white fw-bold text-center py-4 text-primary fs-5">
                🛡️ Velion DKN
            </div>

            <div className="list-group list-group-flush pt-2">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/dashboard"}
                        className={({ isActive }) =>
                            `list-group-item list-group-item-action border-0 py-3 px-4 d-flex align-items-center ${
                                isActive
                                    ? "bg-primary bg-opacity-10 text-primary border-end border-4 border-primary fw-bold"
                                    : "text-secondary hover-bg-light"
                            }`
                        }
                    >
                        <span className="me-3 fs-5">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* User Role Badge */}
            <div className="mt-auto p-4 border-top bg-light">
                <small
                    className="text-muted text-uppercase fw-bold"
                    style={{ fontSize: "0.65rem" }}
                >
                    Logged in as
                </small>
                <div className="d-flex align-items-center mt-2">
                    <div
                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                        style={{
                            width: "32px",
                            height: "32px",
                            fontSize: "14px",
                        }}
                    >
                        {user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="lh-1">
                        <div className="fw-bold text-dark small">
                            {user?.name || "Guest"}
                        </div>
                        <span
                            className="badge bg-secondary mt-1"
                            style={{ fontSize: "0.6rem" }}
                        >
                            {userRole?.replace("_", " ") || "GUEST"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
