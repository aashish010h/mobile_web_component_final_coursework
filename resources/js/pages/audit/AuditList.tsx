import React, { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";

const AuditLogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter State
    const [actionFilter, setActionFilter] = useState("");

    // Fetch Logs Function
    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            // Build Query Parameters
            const params = {
                page: page,
                action: actionFilter || undefined, // Only send if selected
            };

            const res = await axiosInstance.get("/audit-logs", { params });

            setLogs(res.data.data);
            setCurrentPage(res.data.meta.current_page);
            setTotalPages(res.data.meta.last_page);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch when Page or Filter changes
    useEffect(() => {
        fetchLogs(currentPage);
    }, [currentPage, actionFilter]);

    // Handle Filter Change
    const handleFilterChange = (e) => {
        setActionFilter(e.target.value);
        setCurrentPage(1); // Reset to page 1 when filtering
    };

    // Helper to format JSON details nicely
    const renderDetails = (log) => {
        if (!log.details) return <span className="text-muted">-</span>;

        // If it's an UPDATE, show what changed
        if (log.action === "UPDATED" && log.details.new) {
            return (
                <small className="text-muted">
                    {Object.keys(log.details.new).map((key) => (
                        <div key={key}>
                            <strong>{key}:</strong> {log.details.old?.[key]}{" "}
                            &rarr;{" "}
                            <span className="text-primary">
                                {log.details.new[key]}
                            </span>
                        </div>
                    ))}
                </small>
            );
        }

        // Default: just show generic info
        return (
            <small
                className="text-truncate d-block"
                style={{ maxWidth: "250px" }}
                title={JSON.stringify(log.details)}
            >
                {JSON.stringify(log.details)}
            </small>
        );
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h4 text-primary fw-bold">
                    🛡️ System Audit Logs
                </h2>

                {/* Simple Filter Dropdown */}
                <select
                    className="form-select w-auto"
                    value={actionFilter}
                    onChange={handleFilterChange}
                >
                    <option value="">All Actions</option>
                    <option value="LOGIN_SUCCESS">User Login</option>
                    <option value="CREATED">Created</option>
                    <option value="UPDATED">Updated</option>
                    <option value="DELETED">Deleted</option>
                    <option value="ASSET_DOWNLOAD">Downloads</option>
                </select>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Target</th>
                                    <th>Changes / Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-5 text-muted"
                                        >
                                            Loading logs...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center py-5 text-muted"
                                        >
                                            No records found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="ps-4 text-nowrap">
                                                {new Date(
                                                    log.created_at
                                                ).toLocaleString("en-GB")}
                                            </td>
                                            <td>
                                                {log.user ? (
                                                    <div className="d-flex flex-column">
                                                        <span className="fw-bold text-dark">
                                                            {log.user.name}
                                                        </span>
                                                        <span className="small text-muted">
                                                            {log.user.role}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="badge bg-secondary">
                                                        System / Deleted User
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        log.action === "DELETED"
                                                            ? "bg-danger"
                                                            : log.action ===
                                                              "UPDATED"
                                                            ? "bg-warning text-dark"
                                                            : log.action ===
                                                              "CREATED"
                                                            ? "bg-success"
                                                            : "bg-info"
                                                    }`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="font-monospace text-secondary">
                                                    {log.target_type
                                                        ?.split("\\")
                                                        .pop() || "N/A"}{" "}
                                                    #{log.target_id}
                                                </small>
                                            </td>
                                            <td>{renderDetails(log)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="card-footer bg-white d-flex justify-content-end py-3">
                    <button
                        className="btn btn-outline-secondary btn-sm me-2"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                        &larr; Previous
                    </button>
                    <span className="align-self-center mx-2 text-muted small">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-primary btn-sm ms-2"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                        Next &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogList;
