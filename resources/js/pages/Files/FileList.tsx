import { timeAgo } from "@/lib/helper";
import { getFiles } from "@/services/fileService";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// --- 1. TS Interfaces (Matching Laravel API Resource) ---

interface ApiMeta {
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
}

interface FileRecord {
    id: string;
    filename: string; // Changed from 'name' to match Laravel Resource
    status: "pending" | "processing" | "completed" | "failed";
    total_rows: number;
    created_at: string; // ISO String
    created_human: string; // "2 minutes ago"
}

interface ApiResponse {
    data: FileRecord[];
    meta: ApiMeta;
    links: any;
}

const FileList = () => {
    // --- 2. State Management ---
    const [files, setFiles] = useState<any[]>([]);
    const [meta, setMeta] = useState<ApiMeta | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);

    // --- 3. Data Fetching (With AbortController) ---
    useEffect(() => {
        const controller = new AbortController();

        const fetchFiles = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await getFiles(page);
                console.log("res", res.data);
                setFiles(res.data);
                setMeta(res.meta);
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    setError(err.message || "An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();

        // Cleanup: Cancel request if component unmounts or page changes fast
        return () => controller.abort();
    }, [page]);

    // --- 4. Handlers ---
    const handleNext = () => {
        if (meta && meta.current_page < meta.last_page) {
            setPage((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        if (meta && meta.current_page > 1) {
            setPage((prev) => prev - 1);
        }
    };

    // --- 5. Helper for Status Colors ---
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-success text-white";
            case "processing":
                return "bg-primary text-white";
            case "failed":
                return "bg-danger text-white";
            default:
                return "bg-secondary text-white"; // queued/pending
        }
    };

    return (
        <div className="container-fluid p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">Data Management</h4>
                    <p className="text-muted small mb-0">
                        Manage your CSV uploads and system files.
                    </p>
                </div>
                <Link
                    to="store"
                    className="btn btn-primary d-flex align-items-center gap-2 shadow-sm text-decoration-none"
                >
                    <span className="fs-5">+</span>
                    <span>Upload New File</span>
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-0">
                    {/* Error State */}
                    {error && (
                        <div className="alert alert-danger m-3" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light">
                                <tr className="text-muted text-uppercase small fw-bold">
                                    <th className="ps-4 py-3">File Name</th>
                                    <th className="py-3">Uploaded</th>
                                    <th className="py-3">Rows</th>
                                    <th className="py-3">Status</th>
                                    <th className="text-end pe-4 py-3">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="border-top-0">
                                {/* Loading Skeleton */}
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="text-center py-5 text-muted"
                                        >
                                            <div
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></div>
                                            Loading files...
                                        </td>
                                    </tr>
                                ) : files?.length === 0 ? (
                                    /* Empty State */
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="text-center py-5 text-muted"
                                        >
                                            No files found. Upload your first
                                            CSV.
                                        </td>
                                    </tr>
                                ) : (
                                    /* Data Mapping */
                                    files &&
                                    files.map((file) => (
                                        <tr key={file.id}>
                                            <td className="ps-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="rounded p-2 bg-light me-3 text-success">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="20"
                                                            height="20"
                                                            fill="currentColor"
                                                            className="bi bi-filetype-csv"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M14 4.5V14a2..." />
                                                        </svg>
                                                    </div>

                                                    <div>
                                                        <span className="d-block fw-bold text-dark">
                                                            {file.original_name}
                                                        </span>
                                                        <span className="small text-muted">
                                                            {String(
                                                                file.id
                                                            ).substring(0, 8)}
                                                            ...
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="text-secondary">
                                                <div className="d-flex flex-column">
                                                    <span>
                                                        {new Date(
                                                            file.created_at
                                                        ).toLocaleDateString(
                                                            "en-GB"
                                                        )}
                                                    </span>
                                                    <span
                                                        className="small text-muted"
                                                        style={{
                                                            fontSize: "0.75rem",
                                                        }}
                                                    >
                                                        {timeAgo(
                                                            file.created_at
                                                        )}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="text-secondary font-monospace">
                                                {file.records_count.toLocaleString()}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge rounded-pill ${getStatusBadge(
                                                        file.status
                                                    )}`}
                                                >
                                                    {file.status.toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="text-end pe-4">
                                                <div className="btn-group">
                                                    <Link
                                                        to={`/status/${file.id}`}
                                                        className="btn btn-sm btn-white border hover-shadow"
                                                        title="View Details"
                                                    >
                                                        👁️
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

                {/* Footer Pagination */}
                {meta && (
                    <div className="card-footer bg-white border-top-0 py-3">
                        <div className="d-flex justify-content-between align-items-center small text-muted">
                            <span>
                                Showing {meta.from || 0} to {meta.to || 0} of{" "}
                                {meta.total} files
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

export default FileList;
