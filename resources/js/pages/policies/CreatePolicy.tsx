import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createPolicy } from "@/services/apiService";
import { useAuthStore } from "@/store/useAuthStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreatePolicy = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [previewMode, setPreviewMode] = useState(false);

    // --- 1. Security Check ---
    useEffect(() => {
        if (user && !["ADMIN", "GOVERNANCE_COUNCIL"].includes(user.data.role)) {
            toast.error("Unauthorized: Only Council members can draft laws.");
            navigate("/dashboard/policies");
        }
    }, [user, navigate]);

    // --- 2. Form Setup ---
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    const watchedContent = watch("content", "");

    // --- 3. Submit Handler ---
    const onSubmit = async (data) => {
        try {
            await createPolicy(data);
            toast.success("Policy draft created successfully!");
            setTimeout(() => navigate("/dashboard/policies"), 1500);
        } catch (error) {
            toast.error("Failed to create policy. Please check inputs.");
        }
    };

    // --- Styles ---
    const styles = {
        header: { backgroundColor: "#1a1a1a", color: "#ffffff" }, // Darker, serious tone for "Law"
    };

    return (
        <div className="container mt-5 mb-5">
            <ToastContainer />

            <div className="row justify-content-center">
                <div className="col-lg-9">
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <Link
                            to="/dashboard/policies"
                            className="text-decoration-none text-muted"
                        >
                            &larr; Cancel and Return
                        </Link>
                        <span className="badge bg-dark">
                            LEGISLATION DRAFTING MODE
                        </span>
                    </div>

                    <div className="card shadow-lg border-0 rounded-3 overflow-hidden">
                        <div className="card-header p-4" style={styles.header}>
                            <h4 className="mb-0 fw-bold">
                                Draft New Governance Policy
                            </h4>
                            <p className="mb-0 opacity-75 small">
                                Define new organizational rules and regulations.
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            {/* Toggle Preview */}
                            <div className="d-flex justify-content-end mb-3">
                                <button
                                    type="button"
                                    className={`btn btn-sm ${
                                        previewMode
                                            ? "btn-primary"
                                            : "btn-outline-secondary"
                                    }`}
                                    onClick={() => setPreviewMode(!previewMode)}
                                >
                                    {previewMode
                                        ? "Edit Mode ✏️"
                                        : "Preview Document 👁️"}
                                </button>
                            </div>

                            {previewMode ? (
                                // --- PREVIEW MODE ---
                                <div className="border p-5 rounded bg-light">
                                    <h2 className="text-center fw-bold mb-4">
                                        PREVIEW
                                    </h2>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: watchedContent,
                                        }}
                                    />
                                </div>
                            ) : (
                                // --- EDIT MODE ---
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {/* Title */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            Policy Title{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control form-control-lg ${
                                                errors.title ? "is-invalid" : ""
                                            }`}
                                            placeholder="e.g. Data Protection & Privacy Act 2026"
                                            {...register("title", {
                                                required: "Title is required",
                                            })}
                                        />
                                        {errors.title && (
                                            <div className="invalid-feedback">
                                                {errors.title.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Effective Date */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            Target Effective Date
                                        </label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            {...register("effective_date")}
                                        />
                                        <div className="form-text">
                                            If left blank, it will not be
                                            enforced until manually published.
                                        </div>
                                    </div>

                                    {/* Content Editor */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            Policy Content (HTML Supported){" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            className={`form-control ${
                                                errors.content
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            rows="12"
                                            placeholder="<p>Section 1: The purpose of this policy is...</p>"
                                            style={{
                                                fontFamily: "monospace",
                                                fontSize: "0.9rem",
                                            }}
                                            {...register("content", {
                                                required: "Content is required",
                                            })}
                                        ></textarea>
                                        {errors.content && (
                                            <div className="invalid-feedback">
                                                {errors.content.message}
                                            </div>
                                        )}
                                        <div className="form-text">
                                            Tip: You can use basic HTML tags
                                            like &lt;h1&gt;, &lt;p&gt;,
                                            &lt;ul&gt;, &lt;strong&gt; for
                                            formatting.
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-dark px-4 py-2 fw-bold shadow-sm"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting
                                                ? "Saving Draft..."
                                                : "Save Policy Draft"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePolicy;
