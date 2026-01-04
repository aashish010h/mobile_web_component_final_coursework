import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers } from "@/services/authService"; // You need to create this
import { timeAgo } from "@/lib/helper";

const UserList = () => {
    // --- State ---
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Query Parameters ---
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    // --- Data Fetching ---
    useEffect(() => {
        const controller = new AbortController();

        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Pass search/role params to your API
                const res = await getUsers(page, search, roleFilter, {
                    signal: controller.signal,
                });
                setUsers(res.data);
                setMeta(res.meta || res); // Handle Laravel's pagination structure
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error(err);
                    setError("Failed to load users.");
                }
            } finally {
                setLoading(false);
            }
        };

        // Debounce search slightly to avoid API spam
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [page, search, roleFilter]);

    // --- Helpers ---
    const getRoleBadge = (role) => {
        const map = {
            ADMIN: "bg-danger text-white",
            SUPERVISOR: "bg-warning text-dark",
            KNOWLEDGE_CHAMPION: "bg-info text-dark",
            EMPLOYEE: "bg-secondary text-white",
        };
        return map[role] || "bg-light text-dark border";
    };

    const handleNext = () => {
        if (meta && meta.current_page < meta.last_page) setPage((p) => p + 1);
    };

    const handlePrev = () => {
        if (meta && meta.current_page > 1) setPage((p) => p - 1);
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">User Management</h4>
                    <p className="text-muted small mb-0">
                        Manage access, roles, and employee profiles.
                    </p>
                </div>
                <Link
                    to="store"
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm text-decoration-none"
                >
                    <span className="fs-5">+</span>
                    <span>Create User</span>
                </Link>
            </div>

            {/* Filters Bar (Crucial for Admin) */}
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPERVISOR">Supervisor</option>
                        <option value="KNOWLEDGE_CHAMPION">Champion</option>
                        <option value="EMPLOYEE">Employee</option>
                    </select>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    {error && (
                        <div className="alert alert-danger m-3">{error}</div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr className="text-muted text-uppercase small fw-bold">
                                    <th className="ps-4 py-3">User Identity</th>
                                    <th className="py-3">Role</th>
                                    <th className="py-3">Department</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3">Joined</th>
                                    <th className="text-end pe-4 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="border-top-0">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-5 text-muted"
                                        >
                                            <div className="spinner-border spinner-border-sm me-2" />
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="text-center py-5 text-muted"
                                        >
                                            No users found matching your
                                            criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    {/* Initials Avatar */}
                                                    <div
                                                        className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {user.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="d-block fw-bold text-dark">
                                                            {user.name}
                                                        </span>
                                                        <span className="small text-muted">
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge rounded-pill ${getRoleBadge(
                                                        user.role
                                                    )}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>

                                            <td className="text-secondary">
                                                {user.department || (
                                                    <em className="text-muted small">
                                                        Unassigned
                                                    </em>
                                                )}
                                            </td>

                                            <td>
                                                {user.is_active ? (
                                                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary rounded-pill px-2">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="text-secondary small">
                                                <div>
                                                    {new Date(
                                                        user.created_at
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )}
                                                </div>
                                                <div
                                                    className="text-muted"
                                                    style={{
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    {timeAgo(user.created_at)}
                                                </div>
                                            </td>

                                            <td className="text-end pe-4">
                                                <div className="btn-group">
                                                    <Link
                                                        to={`${user.id}/edit`}
                                                        className="btn btn-sm btn-white border hover-shadow"
                                                        title="Edit User"
                                                    >
                                                        ✏️
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {meta && (
                    <div className="card-footer bg-white border-top-0 py-3">
                        <div className="d-flex justify-content-between align-items-center small text-muted">
                            <span>
                                Showing {meta.from || 0} to {meta.to || 0} of{" "}
                                {meta.total} users
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={
                                        meta.current_page === 1 || loading
                                    }
                                    className="btn btn-sm btn-outline-secondary"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        meta.current_page === meta.last_page ||
                                        loading
                                    }
                                    className="btn btn-sm btn-outline-secondary"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;
