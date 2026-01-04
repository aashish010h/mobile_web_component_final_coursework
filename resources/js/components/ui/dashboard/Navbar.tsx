import { logoutUser } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";
import { useNavigate } from "react-router-dom"; // Fixed import from 'react-router' to 'react-router-dom'
import { toast } from "react-toastify";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore(); // Ensure you clear store on logout

    const handleLogout = async () => {
        try {
            await logoutUser(); // Call API to revoke token
            localStorage.removeItem("token"); // Clear local storage
            setUser(null); // Clear global state
            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            console.error(error);
            // Force logout on error anyway to prevent stuck state
            localStorage.removeItem("token");
            setUser(null);
            navigate("/");
        }
    };

    // Helper to get initials (e.g., "Aashish Giri" -> "AG")
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <nav className="navbar navbar-expand navbar-white bg-white border-bottom sticky-top shadow-sm px-4 py-3">
            <div className="container-fluid">
                {/* Mobile Toggle (Optional depending on your sidebar setup) */}
                <button
                    className="btn btn-light d-lg-none me-2"
                    id="sidebarToggle"
                >
                    ☰
                </button>

                {/* Right Side: User Profile & Actions */}
                <div
                    className="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul className="navbar-nav ms-auto align-items-center">
                        {/* User Info Block */}
                        <li className="nav-item d-flex align-items-center me-4">
                            <div className="text-end me-3 d-none d-md-block">
                                <div
                                    className="fw-bold text-dark"
                                    style={{ fontSize: "0.95rem" }}
                                >
                                    {user?.data.name || "Guest User"}
                                </div>
                                <div
                                    className="badge bg-light text-secondary border fw-normal"
                                    style={{ fontSize: "0.7rem" }}
                                >
                                    {user?.data.role?.replace("_", " ") ||
                                        "N/A"}
                                </div>
                            </div>

                            {/* Avatar Circle */}
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor: "#003366", // Your theme color
                                    fontSize: "0.9rem",
                                }}
                            >
                                {getInitials(user?.data.name)}
                            </div>
                        </li>

                        {/* Divider */}
                        <li
                            className="nav-item d-none d-md-block border-start mx-2"
                            style={{ height: "25px" }}
                        ></li>

                        {/* Logout Button */}
                        <li className="nav-item ms-2">
                            <button
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
                                onClick={handleLogout}
                                style={{
                                    borderRadius: "20px",
                                    padding: "0.4rem 1rem",
                                }}
                            >
                                <span>Logout</span>
                                <span style={{ fontSize: "0.8rem" }}>🚪</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
