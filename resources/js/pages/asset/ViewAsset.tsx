import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
    getAsset,
    deleteAsset,
    downloadAssetFile,
} from "@/services/assetService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewAsset = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);
    const handleDownload = async () => {
        try {
            // Pass the title as a fallback name
            await downloadAssetFile(id, asset.title);
        } catch (error) {
            // This catches the "Unauthenticated" error from the service
            toast.error(error.message || "Failed to download file.");
        }
    };
    // --- Styles ---
    const styles = {
        header: { backgroundColor: "#003366", color: "#ffffff" },
        badge: { fontSize: "0.85rem", padding: "0.5em 1em" },
        metaLabel: {
            fontSize: "0.75rem",
            textTransform: "uppercase",
            color: "#6c757d",
            fontWeight: "bold",
        },
    };

    // --- Fetch Data ---
    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const res = await getAsset(id);
                // Handle nested resource structure (data.data vs data)
                setAsset(res.data || res);
            } catch (error) {
                toast.error("Asset not found or access denied.");
                navigate("/dashboard/assets");
            } finally {
                setLoading(false);
            }
        };
        fetchAsset();
    }, [id, navigate]);

    // --- Handlers ---
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this asset?"))
            return;
        try {
            await deleteAsset(id);
            toast.success("Asset archived.");
            navigate("/dashboard/assets");
        } catch (error) {
            toast.error("Failed to delete. You might not have permission.");
        }
    };

    // --- Helpers ---
    const getStatusColor = (status) => {
        switch (status) {
            case "PUBLISHED":
                return "success";
            case "DRAFT":
                return "secondary";
            case "PENDING_REVIEW":
                return "warning";
            case "FLAGGED_OUTDATED":
                return "danger";
            default:
                return "primary";
        }
    };

    if (loading)
        return (
            <div className="p-5 text-center text-muted">
                Loading asset details...
            </div>
        );
    if (!asset) return null;

    return (
        <div className="container mt-4 mb-5">
            <ToastContainer />

            {/* Breadcrumb / Back Link */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <Link
                    to="/dashboard/assets"
                    className="text-decoration-none text-muted fw-bold"
                >
                    &larr; Back to Repository
                </Link>
                {/* Admin Actions Toolbar */}
                <div className="btn-group">
                    <Link
                        to={`/dashboard/assets/${id}/edit`}
                        className="btn btn-outline-secondary btn-sm"
                    >
                        Edit Asset
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="btn btn-outline-danger btn-sm"
                    >
                        Archive
                    </button>
                </div>
            </div>

            <div className="row g-4">
                {/* LEFT COLUMN: Main Content */}
                <div className="col-lg-8">
                    <div className="card shadow-sm border-0 rounded-3 h-100">
                        <div className="card-body p-4 p-md-5">
                            {/* Title Header */}
                            <div className="mb-4 border-bottom pb-4">
                                <div className="d-flex align-items-start justify-content-between gap-3">
                                    <h2 className="fw-bold text-dark mb-0">
                                        {asset.title}
                                    </h2>
                                    <span
                                        className={`badge bg-${getStatusColor(
                                            asset.status
                                        )} rounded-pill`}
                                        style={styles.badge}
                                    >
                                        {asset.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div className="bg-light p-4 rounded-3 mb-4 border-start border-4 border-primary">
                                <h6 className="text-primary fw-bold mb-2">
                                    Executive Summary
                                </h6>
                                <p
                                    className="mb-0 text-secondary"
                                    style={{ lineHeight: "1.6" }}
                                >
                                    {asset.summary}
                                </p>
                            </div>

                            {/* Main Body (Rich Text Placeholder) */}
                            <div className="mt-4">
                                <h5 className="fw-bold mb-3">Asset Details</h5>
                                {asset.content_body ? (
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: asset.content_body,
                                        }}
                                    />
                                ) : (
                                    <p className="text-muted fst-italic">
                                        This asset contains no inline text
                                        content. Please verify if a file is
                                        attached.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Metadata & Actions */}
                <div className="col-lg-4">
                    {/* File Download Card */}
                    <div className="card shadow-sm border-0 rounded-3 mb-3 bg-white">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3">Attached File</h6>
                            {asset.download_url ? (
                                <div className="d-grid">
                                    <a
                                        onClick={handleDownload}
                                        className="btn btn-primary py-2 fw-bold shadow-sm"
                                        style={{
                                            backgroundColor: "#003366",
                                            borderColor: "#003366",
                                        }}
                                    >
                                        ⬇️ Download Document
                                    </a>
                                    <div className="text-center mt-2 small text-muted">
                                        Securely encrypted
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-warning mb-0 small">
                                    No file attached to this record.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="card shadow-sm border-0 rounded-3">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-4 border-bottom pb-2">
                                Governance Data
                            </h6>

                            {/* Author */}
                            <div className="mb-3">
                                <div style={styles.metaLabel}>Author</div>
                                <div className="d-flex align-items-center mt-1">
                                    <div
                                        className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        {asset.author?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <div className="fw-bold text-dark">
                                            {asset.author?.name || "Unknown"}
                                        </div>
                                        <div className="small text-muted">
                                            {asset.author?.department ||
                                                "Unassigned"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="row mb-3">
                                <div className="col-6">
                                    <div style={styles.metaLabel}>Created</div>
                                    <div className="fw-medium text-dark">
                                        {asset.created_at}
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div style={styles.metaLabel}>
                                        Last Updated
                                    </div>
                                    <div className="fw-medium text-dark">
                                        {asset.updated_at}
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mb-3">
                                <div style={styles.metaLabel}>Impact</div>
                                <div className="d-flex align-items-center gap-2 mt-1">
                                    <span className="badge bg-light text-dark border">
                                        👁️ {asset.view_count || 0} Views
                                    </span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <div style={styles.metaLabel} className="mb-2">
                                    Classification Tags
                                </div>
                                <div className="d-flex flex-wrap gap-1">
                                    {asset.tags && asset.tags.length > 0 ? (
                                        asset.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="badge bg-info bg-opacity-10 text-dark border"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-muted small">
                                            No tags assigned
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewAsset;
