import axiosInstance from "@/services/axiosInstance";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

const PolicyList = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const res = await axiosInstance.get("/policies");
            setPolicies(res.data);
        } catch (error) {
            toast.error("Failed to load policies");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === "ACTIVE")
            return <span className="badge bg-success">ACTIVE ENFORCEMENT</span>;
        if (status === "DEPRECATED")
            return <span className="badge bg-secondary">DEPRECATED</span>;
        return <span className="badge bg-warning text-dark">DRAFT</span>;
    };

    return (
        <div className="container-fluid p-4">
            <ToastContainer />
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark">Governance Policies</h3>
                    <p className="text-muted">
                        Official organizational rules and regulations.
                    </p>
                </div>
                {/* Only show Add button if you have a role check in React, or just show it and let API block it */}
                <Link to="create" className="btn btn-dark shadow-sm">
                    + Draft New Policy
                </Link>
            </div>

            <div className="row g-4">
                {policies.map((policy) => (
                    <div key={policy.id} className="col-md-6 col-xl-4">
                        <div
                            className={`card h-100 border-0 shadow-sm ${
                                policy.status === "ACTIVE"
                                    ? "border-top border-4 border-success"
                                    : ""
                            }`}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between mb-3">
                                    {getStatusBadge(policy.status)}
                                    <small className="text-muted">
                                        Effective:{" "}
                                        {policy.effective_date
                                            ? new Date(
                                                  policy.effective_date
                                              ).toLocaleDateString("en-GB")
                                            : "Pending"}
                                    </small>
                                </div>

                                <h5 className="fw-bold text-dark mb-3">
                                    {policy.title}
                                </h5>

                                <p className="text-secondary small line-clamp-3">
                                    {/* Strip HTML tags for preview */}
                                    {policy.content
                                        .replace(/<[^>]*>?/gm, "")
                                        .substring(0, 150)}
                                    ...
                                </p>

                                <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-between">
                                    <div className="small">
                                        <span className="text-muted d-block">
                                            Signed by:
                                        </span>
                                        <strong>
                                            {policy.approver?.name ||
                                                "Pending Approval"}
                                        </strong>
                                    </div>
                                    <Link
                                        to={`/dashboard/policies/${policy.id}`}
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        Read Policy &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {policies.length === 0 && !loading && (
                    <div className="col-12 text-center py-5 text-muted">
                        No policies established yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyList;
