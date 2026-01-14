import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import "./navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Fetch notifications from Laravel
    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await axios.get("/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data.data || res.data;
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    }, []);

    // Logic to mark all as read on backend and clear UI
    const handleMarkAllAsRead = async () => {
        if (notifications.length === 0) return;
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "/api/notifications/read-all",
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setNotifications([]); // Clear badge and list
        } catch (err) {
            console.error("Mark all as read failed", err);
        }
    };

    // Toggle dropdown and handle closing logic
    const toggleDropdown = (e) => {
        e.stopPropagation();
        if (showDropdown) {
            handleMarkAllAsRead(); // Mark read when manually closing via button
        }
        setShowDropdown(!showDropdown);
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);

        const closeOnOutsideClick = () => {
            if (showDropdown) {
                handleMarkAllAsRead(); // Mark read when clicking anywhere else
                setShowDropdown(false);
            }
        };

        window.addEventListener("click", closeOnOutsideClick);
        return () => {
            clearInterval(interval);
            window.removeEventListener("click", closeOnOutsideClick);
        };
    }, [showDropdown, notifications.length, fetchNotifications]);

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem("token");
            setUser(null);
            navigate("/");
        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
            navigate("/");
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <nav className="navbar navbar-expand bg-white border-bottom sticky-top shadow-sm px-4 py-2">
            <div className="container-fluid">
                <div className="ms-auto d-flex align-items-center">
                    {/* NOTIFICATION DROP-DOWN */}
                    <div className="notif-dropdown-container me-4">
                        <button className="notif-btn" onClick={toggleDropdown}>
                            <span>🔔</span>
                            {notifications.length > 0 && (
                                <span className="notif-badge">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        <div
                            className={`notif-menu ${
                                showDropdown ? "show" : ""
                            }`}
                        >
                            <div className="notif-header">
                                <h6>Notifications</h6>
                            </div>
                            <div className="notif-list">
                                {notifications.length === 0 ? (
                                    <div className="notif-empty">
                                        <p className="mb-0">No new updates</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="notif-item">
                                            <p className="msg">{n.message}</p>
                                            <span className="time">
                                                {new Date(
                                                    n.created_at
                                                ).toLocaleTimeString("en-GB", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PROFILE SECTION */}
                    <div className="d-flex align-items-center ps-4 border-start">
                        <div className="text-end me-3 d-none d-md-block">
                            <div className="fw-bold small">
                                {user?.data?.name || "Aashish Giri"}
                            </div>
                            <div
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                            >
                                {user?.data?.role || "Student"}
                            </div>
                        </div>
                        <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3 shadow-sm"
                            style={{
                                width: "38px",
                                height: "38px",
                                backgroundColor: "#003366",
                            }}
                        >
                            {getInitials(user?.data?.name)}
                        </div>
                        <button
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
