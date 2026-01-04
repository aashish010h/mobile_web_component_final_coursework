import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssets, deleteAsset } from "@/services/assetService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { downloadAssetFile } from "@/services/assetService";

const AssetList = () => {
    // --- State ---
    const [assets, setAssets] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Filters ---
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const handleDownload = async (id, title) => {
        try {
            // Pass the title as a fallback name
            await downloadAssetFile(id, title);
        } catch (error) {
            // This catches the "Unauthenticated" error from the service
            toast.error(error.message || "Failed to download file.");
        }
    };

    // --- Fetch Data ---
    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            try {
                const res = await getAssets(page, search, statusFilter);
                setAssets(res.data);
                setMeta(res.meta);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load knowledge assets.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce search to prevent API spam
        const timer = setTimeout(() => {
            fetchAssets();
        }, 300);

        return () => clearTimeout(timer);
    }, [page, search, statusFilter]);

    // --- Handlers ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to archive this asset?"))
            return;

        try {
            await deleteAsset(id);
            toast.success("Asset archived successfully.");
            // Refresh list
            const res = await getAssets(page, search, statusFilter);
            setAssets(res.data);
        } catch (error) {
            toast.error("Failed to delete asset. You may not have permission.");
        }
    };

    // --- Helpers ---
    const getStatusBadge = (status) => {
        switch (status) {
            case "PUBLISHED":
                return "bg-success text-white";
            case "DRAFT":
                return "bg-secondary text-white";
            case "PENDING_REVIEW":
                return "bg-warning text-dark";
            case "FLAGGED_OUTDATED":
                return "bg-danger text-white";
            case "ARCHIVED":
                return "bg-dark text-white";
            default:
                return "bg-light text-dark border";
        }
    };

    return (
        <div className="container-fluid p-4">
            <ToastContainer />

            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Knowledge Base</h4>
                    <p className="text-muted small mb-0">
                        Manage policies, guides, and organisational assets.
                    </p>
                </div>
                <Link
                    to="/dashboard/assets/store"
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                    style={{
                        backgroundColor: "#003366",
                        borderColor: "#003366",
                    }}
                >
                    <span className="fs-5">+</span>
                    <span>Upload Asset</span>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0">
                            🔍
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search title or summary..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Statuses</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Drafts</option>
                        <option value="PENDING_REVIEW">Pending Review</option>
                        <option value="FLAGGED_OUTDATED">
                            Flagged / Outdated
                        </option>
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="bg-light">
                            <tr className="text-muted text-uppercase small fw-bold">
                                <th
                                    className="ps-4 py-3"
                                    style={{ width: "40%" }}
                                >
                                    Asset Details
                                </th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Author</th>
                                <th className="py-3">Last Updated</th>
                                <th className="text-end pe-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center py-5 text-muted"
                                    >
                                        <div className="spinner-border spinner-border-sm me-2" />
                                        Loading repository...
                                    </td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="text-center py-5 text-muted"
                                    >
                                        No assets found. Upload your first
                                        document!
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset.id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex flex-column">
                                                <Link
                                                    to={`/dashboard/assets/${asset.id}/edit`}
                                                    className="fw-bold text-dark text-decoration-none hover-primary"
                                                >
                                                    {asset.title}
                                                </Link>
                                                <small
                                                    className="text-muted text-truncate"
                                                    style={{
                                                        maxWidth: "350px",
                                                    }}
                                                >
                                                    {asset.summary}
                                                </small>
                                                {/* Tags Row */}
                                                <div className="mt-1">
                                                    {asset.tags &&
                                                        asset.tags
                                                            .slice(0, 3)
                                                            .map((tag, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="badge bg-light text-secondary border me-1 fw-normal"
                                                                    style={{
                                                                        fontSize:
                                                                            "0.7rem",
                                                                    }}
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={`badge rounded-pill ${getStatusBadge(
                                                    asset.status
                                                )} px-3`}
                                            >
                                                {asset.status.replace("_", " ")}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div
                                                    className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2 text-primary fw-bold"
                                                    style={{
                                                        width: "30px",
                                                        height: "30px",
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    {asset.author?.name?.charAt(
                                                        0
                                                    ) || "U"}
                                                </div>
                                                <span className="small">
                                                    {asset.author?.name ||
                                                        "Unknown"}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="text-secondary small">
                                            {asset.updated_at}
                                        </td>

                                        <td className="text-end pe-4">
                                            <div className="btn-group">
                                                {/* Download Button */}
                                                <td className="text-end pe-4">
                                                    <div className="btn-group">
                                                        {/* REPLACED THE <a> TAG WITH THIS BUTTON */}
                                                        {asset.download_url && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDownload(
                                                                        asset.id,
                                                                        asset.title
                                                                    )
                                                                }
                                                                className="btn btn-sm btn-white border hover-shadow"
                                                                title="Download File"
                                                            >
                                                                ⬇️
                                                            </button>
                                                        )}
                                                        {/* ... edit and delete buttons ... */}
                                                    </div>
                                                </td>
                                                {/* Edit Button */}
                                                <Link
                                                    to={`/dashboard/assets/${asset.id}/view`}
                                                    className="btn btn-sm btn-white border hover-shadow"
                                                    title="View"
                                                >
                                                    👀
                                                </Link>
                                                {/* Edit Button */}
                                                <Link
                                                    to={`/dashboard/assets/${asset.id}/edit`}
                                                    className="btn btn-sm btn-white border hover-shadow"
                                                    title="Edit / Review"
                                                >
                                                    ✏️
                                                </Link>

                                                {/* Delete (Only visual, backend checks perm) */}
                                                <button
                                                    onClick={() =>
                                                        handleDelete(asset.id)
                                                    }
                                                    className="btn btn-sm btn-white border hover-shadow text-danger"
                                                    title="Archive"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && (
                    <div className="card-footer bg-white border-top-0 py-3">
                        <div className="d-flex justify-content-between align-items-center small text-muted">
                            <span>
                                Showing {meta.from || 0} to {meta.to || 0} of{" "}
                                {meta.total} assets
                            </span>
                            <div className="d-flex gap-2">
                                <button
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={
                                        meta.current_page === 1 || loading
                                    }
                                    className="btn btn-sm btn-outline-secondary"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
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

export default AssetList;
