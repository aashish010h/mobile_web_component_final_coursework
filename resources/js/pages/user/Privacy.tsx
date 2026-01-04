import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { exportMyData, deleteMyAccount } from "@/services/apiService";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
    const [isExporting, setIsExporting] = useState(false);
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    // --- Handlers ---

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await exportMyData();

            // Create a Blob and trigger download manually
            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                JSON.stringify(data, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = "my_personal_data.json";
            link.click();

            toast.success("Data export started.");
        } catch (error) {
            toast.error("Export failed.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        const confirm1 = window.confirm(
            "⚠️ WARNING: This action is irreversible.\n\nYour name and email will be permanently scrubbed from the system."
        );
        if (!confirm1) return;

        const confirm2 = window.confirm("Are you absolutely sure?");
        if (!confirm2) return;

        try {
            await deleteMyAccount();
            toast.success("Account anonymized. Goodbye.");

            // Force logout
            logout();
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Deletion failed.");
        }
    };

    return (
        <div className="container mt-4 mb-5">
            <ToastContainer />

            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <h3 className="fw-bold mb-4">Privacy & Data Rights</h3>

                    {/* Card 1: Portability */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <span className="fs-2">📥</span>
                                <div>
                                    <h5 className="fw-bold mb-0">
                                        Data Portability
                                    </h5>
                                    <small className="text-muted">
                                        GDPR Article 20
                                    </small>
                                </div>
                            </div>
                            <p className="text-secondary">
                                You have the right to receive the personal data
                                concerning you, which you have provided to us,
                                in a structured, commonly used, and
                                machine-readable format.
                            </p>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="btn btn-outline-primary"
                            >
                                {isExporting
                                    ? "Generating JSON..."
                                    : "Download My Data (JSON)"}
                            </button>
                        </div>
                    </div>

                    {/* Card 2: Erasure */}
                    <div className="card shadow-sm border-0 border-start border-4 border-danger">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <span className="fs-2">🗑️</span>
                                <div>
                                    <h5 className="fw-bold text-danger mb-0">
                                        Right to be Forgotten
                                    </h5>
                                    <small className="text-muted">
                                        GDPR Article 17
                                    </small>
                                </div>
                            </div>
                            <p className="text-secondary">
                                You can request the erasure of personal data
                                held about you.
                                <strong>Note:</strong> To maintain
                                organizational integrity, your contributions
                                (documents, logs) will not be deleted, but your
                                identity will be permanently anonymized (e.g.,
                                "Deleted User 123").
                            </p>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger text-white"
                            >
                                Permanently Anonymize My Account
                            </button>
                        </div>
                    </div>

                    <div className="alert alert-info mt-4 small">
                        <strong>Compliance Note:</strong> All actions taken on
                        this page are logged for audit purposes.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
