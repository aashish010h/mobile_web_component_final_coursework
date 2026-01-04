import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/ui/dashboard/Navbar";
import Sidebar from "@/components/ui/dashboard/Sidebar"; // Fixed typo 'Sibebar'
import { useAuthStore } from "@/store/useAuthStore";

const DashboardLayout = () => {
    const { restoreLogin } = useAuthStore();

    useEffect(() => {
        restoreLogin();
    }, []);

    // Width must match the width defined inside your Sidebar component (260px)
    const SIDEBAR_WIDTH = "260px";

    return (
        <div
            className="d-flex"
            style={{ backgroundColor: "#f5f6fa", minHeight: "100vh" }}
        >
            {/* 1. Fixed Sidebar Wrapper */}
            <div
                style={{
                    width: SIDEBAR_WIDTH,
                    height: "100vh",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 1000,
                    overflowY: "auto", // Scroll sidebar independently if menu is long
                }}
            >
                <Sidebar />
            </div>

            {/* 2. Main Content Wrapper */}
            <div
                style={{
                    marginLeft: SIDEBAR_WIDTH, // Push content to the right
                    width: `calc(100% - ${SIDEBAR_WIDTH})`,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100vh",
                }}
            >
                {/* Navbar stays at the top of the content area */}
                <Navbar />

                {/* Page Content */}
                <main className="container-fluid p-4 flex-grow-1">
                    <Outlet />
                </main>

                {/* Footer */}
                <footer className="py-4 text-center text-muted small border-top bg-white mt-auto">
                    © {new Date().getFullYear()} Aashish Giri | University of
                    West London
                </footer>
            </div>
        </div>
    );
};

export default DashboardLayout;
