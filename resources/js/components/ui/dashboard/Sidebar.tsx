import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const Sidebar = () => {
    const { user } = useAuthStore();

    // 1. Define the Menu Structure
    const navItems = [
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
            allowedRoles: null, // Everyone needs to read laws
        },
        // --- RESTRICTED ITEMS ---
        {
            path: "/dashboard/users",
            label: "User Management",
            icon: "👥",
            allowedRoles: ["ADMIN"], // ONLY Admin sees this
        },
        {
            path: "/dashboard/privacy",
            label: "Privacy & GDPR",
            icon: "🔒",
            allowedRoles: null,
        },
    ];

    // 2. Filter logic: Does the user have the right role?
    // If allowedRoles is null, everyone sees it.
    // If allowedRoles is set, the user's role must be in the list.
    const visibleItems = navItems.filter((item) => {
        if (!item.allowedRoles) return true;
        return item.allowedRoles.includes(user?.data?.role);
    });

    return (
        <div className="bg-white border-end h-100" id="sidebar-wrapper">
            <div className="sidebar-heading border-bottom bg-light fw-bold text-center py-4 text-dark fs-5">
                🛡️ UWL Governance
            </div>

            <div className="list-group list-group-flush pt-2">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/dashboard"} // Exact match for home
                        className={({ isActive }) =>
                            `list-group-item list-group-item-action border-0 py-3 px-4 ${
                                isActive
                                    ? "bg-primary bg-opacity-10 text-primary border-end border-4 border-primary fw-bold"
                                    : "text-secondary"
                            }`
                        }
                    >
                        <span className="me-3">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </div>

            {/* Optional: User Role Badge at bottom */}
            <div className="mt-auto p-4 border-top">
                <small
                    className="text-muted text-uppercase fw-bold"
                    style={{ fontSize: "0.7rem" }}
                >
                    Current Access
                </small>
                <div className="badge bg-secondary d-block mt-1 py-2">
                    {user?.data?.role?.replace("_", " ") || "GUEST"}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
