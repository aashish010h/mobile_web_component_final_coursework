import { getFirstTwoAlpha } from "@/lib/helper";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
    const { user } = useAuthStore();
    // Define your menu items here for easy management
    const menuItems = [
        {
            path: "/dashboard",
            label: "Overview",
            icon: "📊",
            end: true, // Exact match for the dashboard home
        },
        {
            path: "assets",
            label: "Knowledge Base",
            icon: "💼",
            end: false,
        },
        {
            path: "users",
            label: "User Management",
            icon: "👤",
            end: false,
        },
    ];

    // --- Custom Colors ---
    const styles = {
        sidebar: {
            backgroundColor: "#1e1e2d", // Deep Midnight Blue
            minHeight: "100vh",
            width: "260px",
            boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
        },
        brand: {
            color: "#ffffff",
            letterSpacing: "1px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
        },
        // We use a function for the link style to handle active state dynamically
        getLinkStyle: (isActive) => ({
            color: isActive ? "#ffffff" : "#a6a7b9", // White if active, Muted Grey if not
            backgroundColor: isActive
                ? "rgba(32, 201, 151, 0.15)"
                : "transparent", // Subtle Teal tint if active
            borderLeft: isActive
                ? "4px solid #20c997"
                : "4px solid transparent", // The Teal Accent Bar
            transition: "all 0.3s ease",
        }),
    };

    return (
        <div className="d-flex flex-column" style={styles.sidebar}>
            {/* 1. Brand / Logo Area */}
            <div className="p-4 mb-3" style={styles.brand}>
                <div className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "1.5rem" }}>🛡️</span>
                    <span className="fw-bold fs-5">DKN System</span>
                </div>
                <small
                    className="text-muted d-block mt-1"
                    style={{ fontSize: "0.75rem" }}
                >
                    University Governance
                </small>
            </div>

            {/* 2. Navigation Links */}
            <div className="d-flex flex-column gap-1 px-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end} // Ensures /dashboard doesn't stay lit when visiting /dashboard/users
                        style={({ isActive }) => styles.getLinkStyle(isActive)}
                        className="text-decoration-none d-flex align-items-center py-3 px-3 rounded-end"
                    >
                        {({ isActive }) => (
                            <>
                                <span className="fs-5 me-3 opacity-75">
                                    {item.icon}
                                </span>
                                <span
                                    className={`fw-medium ${
                                        isActive ? "" : "opacity-75"
                                    }`}
                                >
                                    {item.label}
                                </span>
                                {/* Optional: Little arrow for active state */}
                                {isActive && (
                                    <span
                                        className="ms-auto text-success"
                                        style={{ color: "#20c997" }}
                                    >
                                        •
                                    </span>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* 3. Bottom Profile / Logout Area (Optional) */}
            <div className="mt-auto p-3 border-top border-secondary border-opacity-25">
                <div className="d-flex align-items-center gap-3 text-secondary p-2">
                    <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                        style={{
                            width: "35px",
                            height: "35px",
                            fontSize: "0.8rem",
                        }}
                    >
                        {getFirstTwoAlpha(user?.data?.name)}
                    </div>
                    <div className="small">
                        <div className="text-white">{user?.data.name}</div>
                        <div
                            className="text-white"
                            style={{ fontSize: "0.7rem" }}
                        >
                            {user?.data.role}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
