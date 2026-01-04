import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    getPolicy,
    publishPolicy,
    deprecatePolicy,
} from "@/services/apiService";
import { useAuthStore } from "@/store/useAuthStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PolicyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Check if user has legislative power
    const isAuthorized =
        user &&
        (user.data.role === "ADMIN" || user.data.role === "GOVERNANCE_COUNCIL");

    useEffect(() => {
        fetchPolicyData();
    }, [id]);

    const fetchPolicyData = async () => {
        try {
            const data = await getPolicy(id);
            setPolicy(data);
        } catch (error) {
            toast.error("Policy not found.");
            navigate("/dashboard/policies");
        } finally {
            setLoading(false);
        }
    };

    // --- APPROVE HANDLER ---
    const handleApprove = async () => {
        if (
            !window.confirm(
                "⚠️ LEGISLATIVE ACTION\n\nAre you sure you want to ENACT this policy? This will make it binding for the entire organization."
            )
        )
            return;

        setActionLoading(true);
        try {
            await publishPolicy(id);
            toast.success("Policy has been Enacted and Published!");
            fetchPolicyData(); // Refresh page to show new status
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Approval failed.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- DEPRECATE HANDLER ---
    const handleDeprecate = async () => {
        if (!window.confirm("Are you sure you want to retire this policy?"))
            return;

        setActionLoading(true);
        try {
            await deprecatePolicy(id);
            toast.success("Policy marked as deprecated.");
            fetchPolicyData();
        } catch (error) {
            toast.error("Action failed.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading)
        return (
            <div className="p-5 text-center text-muted">
                Loading document...
            </div>
        );
    if (!policy) return null;

    return (
        <div className="container mt-4 mb-5">
            <ToastContainer />

            {/* --- ACTION BANNER (Only for Council when Draft) --- */}
            {isAuthorized && policy.status === "DRAFT" && (
                <div className="alert alert-warning border-warning shadow-sm d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h5 className="fw-bold mb-1">
                            ⚠️ Action Required: Draft Policy
                        </h5>
                        <p className="mb-0 small">
                            This document is currently a Draft. It requires
                            Council approval to become active law.
                        </p>
                    </div>
                    <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="btn btn-success fw-bold px-4 shadow-sm"
                    >
                        {actionLoading ? "Processing..." : "✅ Approve & Enact"}
                    </button>
                </div>
            )}

            <div className="mb-4">
                <Link
                    to="/dashboard/policies"
                    className="text-decoration-none text-muted fw-bold"
                >
                    &larr; Back to Library
                </Link>
            </div>

            <div className="row">
                {/* LEFT: Main Document */}
                <div className="col-lg-8">
                    <div className="card shadow-lg border-0 rounded-3">
                        <div className="card-body p-5">
                            {/* Header Section */}
                            <div className="border-bottom pb-4 mb-4 text-center">
                                <h4 className="text-uppercase text-secondary small fw-bold mb-2">
                                    Governance Document
                                </h4>
                                <h1 className="display-6 fw-bold text-dark">
                                    {policy.title}
                                </h1>

                                <div className="mt-3">
                                    {policy.status === "ACTIVE" && (
                                        <span className="badge bg-success px-3 py-2">
                                            ✅ ACTIVE LAW
                                        </span>
                                    )}
                                    {policy.status === "DRAFT" && (
                                        <span className="badge bg-warning text-dark px-3 py-2">
                                            📝 DRAFT
                                        </span>
                                    )}
                                    {policy.status === "DEPRECATED" && (
                                        <span className="badge bg-secondary px-3 py-2">
                                            🚫 DEPRECATED
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content Body */}
                            <div
                                className="policy-content text-dark"
                                style={{
                                    lineHeight: "1.8",
                                    fontSize: "1.05rem",
                                }}
                            >
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: policy.content,
                                    }}
                                />
                            </div>

                            {/* Digital Signature Footer */}
                            <div className="mt-5 pt-5 row">
                                <div className="col-md-6 ms-auto text-end">
                                    <div
                                        className="border-bottom border-dark mb-2"
                                        style={{ width: "100%" }}
                                    ></div>
                                    <div className="fw-bold text-dark">
                                        {policy.approver
                                            ? policy.approver.name
                                            : "(Pending Signature)"}
                                    </div>
                                    <div className="small text-muted text-uppercase">
                                        {policy.approver
                                            ? policy.approver.role
                                            : "Approving Authority"}
                                    </div>
                                    <div className="small text-muted">
                                        Effective:{" "}
                                        {policy.effective_date
                                            ? new Date(
                                                  policy.effective_date
                                              ).toLocaleDateString()
                                            : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Admin Controls */}
                <div className="col-lg-4">
                    {/* 1. Metadata Panel */}
                    <div className="card shadow-sm border-0 mb-4">
                        <div className="card-header bg-light fw-bold border-0">
                            Document Info
                        </div>
                        <ul className="list-group list-group-flush small">
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted">Status</span>
                                <span className="fw-bold">{policy.status}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between">
                                <span className="text-muted">Last Updated</span>
                                <span>
                                    {new Date(
                                        policy.updated_at
                                    ).toLocaleDateString()}
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* 2. Council Control Panel (Secondary Actions) */}
                    {isAuthorized && (
                        <div className="card shadow-sm border-0 border-top border-4 border-dark">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">⚙️ Management</h6>
                                <div className="d-grid gap-2">
                                    {policy.status === "ACTIVE" && (
                                        <button
                                            onClick={handleDeprecate}
                                            disabled={actionLoading}
                                            className="btn btn-outline-danger btn-sm"
                                        >
                                            🚫 Deprecate (Retire Policy)
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-light border btn-sm text-muted"
                                        disabled
                                    >
                                        ✏️ Edit Content (Locked)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PolicyDetail;
