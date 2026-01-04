import { logoutUser } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import React from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const Navbar = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const handleLogout = async () => {
        try {
            const res = await logoutUser();
            toast.success(res.data.message);
            navigate("/");
        } catch (error) {
            toast.success("Something went wrong");
        }
    };
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom sticky-top shadow-sm">
            <div className="container-fluid">
                <button
                    className="btn btn-outline-secondary d-lg-none"
                    id="sidebarToggle"
                >
                    Menu
                </button>
                <div
                    className="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
                        <li className="nav-item me-3">
                            <span className="nav-link text-muted">
                                Welcome, Aashish Giri
                            </span>
                        </li>
                        <li className="nav-item">
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
