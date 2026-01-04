import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAsset } from "@/services/assetService";
import { getPolicies } from "@/services/apiService";

const CreateAsset = () => {
    const navigate = useNavigate();

    // --- React Hook Form ---
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    // Watch file input to show selected filename
    const selectedFile = watch("file");

    // --- Styles ---
    const styles = {
        cardHeader: { backgroundColor: "#003366", color: "#ffffff" },
        btnPrimary: {
            backgroundColor: "#003366",
            borderColor: "#003366",
            color: "white",
        },
        fileZone: {
            border: "2px dashed #ccc",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
            transition: "all 0.2s ease",
        },
    };

    // --- Submit Handler ---
    const onSubmit = async (data) => {
        const formData = new FormData();

        // 1. Append Text Data
        formData.append("title", data.title);
        formData.append("summary", data.summary);
        formData.append("governance_policy_id", data.governance_policy_id);

        // 2. Append File (only if selected)
        if (data.file && data.file[0]) {
            formData.append("file", data.file[0]);
        }

        // 3. Append Tags (Hardcoded for now - you can fetch these from API later)
        // Example: Sending Tag ID 1 (General) if you have seeded your DB
        // formData.append("tags[]", "1");

        try {
            await createAsset(formData);

            toast.success("Asset uploaded successfully!");

            // Redirect back to list
            setTimeout(() => navigate("/dashboard/assets"), 1500);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const apiErrors = error.response.data.errors;
                toast.error("Validation failed.");
                // You could map these to setError like in the User form
                console.log(apiErrors);
            } else {
                toast.error(
                    "Upload failed. Please check the file size (Max 10MB)."
                );
            }
        }
    };

    const [policies, setPolicies] = useState([]);

    // 2. Fetch Policies on load
    useEffect(() => {
        const loadPolicies = async () => {
            try {
                const data = await getPolicies();
                // Only show ACTIVE policies to link against? Or all? Usually Active.
                setPolicies(data.filter((p) => p.status === "ACTIVE"));
            } catch (e) {
                console.error("Failed to load policies");
            }
        };
        loadPolicies();
    }, []);

    return (
        <div className="container mt-5 mb-5">
            <ToastContainer />
            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    <div className="mb-3">
                        <Link
                            to="/dashboard/assets"
                            className="text-decoration-none text-muted"
                        >
                            &larr; Back to Repository
                        </Link>
                    </div>

                    <div className="card shadow-lg border-0 rounded-3 overflow-hidden">
                        <div
                            className="card-header p-4"
                            style={styles.cardHeader}
                        >
                            <h4 className="mb-0 fw-bold">
                                Upload Knowledge Asset
                            </h4>
                            <p className="mb-0 opacity-75 small">
                                Share policies, guides, or documents with the
                                organisation.
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* 1. Document Details */}
                                <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">
                                    Document Details
                                </h6>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Asset Title{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.title ? "is-invalid" : ""
                                        }`}
                                        placeholder="e.g. Remote Work Policy 2026"
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

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Governance Compliance
                                    </label>
                                    <select
                                        className="form-select"
                                        {...register("governance_policy_id")}
                                    >
                                        <option value="">
                                            -- Does not adhere to specific
                                            policy --Guest User
                                        </option>
                                        {policies?.map((policy) => (
                                            <option
                                                key={policy.id}
                                                value={policy.id}
                                            >
                                                {policy.title}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="form-text">
                                        Does this document support a specific
                                        organizational policy?
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Summary / Abstract{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className={`form-control ${
                                            errors.summary ? "is-invalid" : ""
                                        }`}
                                        rows="3"
                                        placeholder="Briefly describe what this document contains..."
                                        {...register("summary", {
                                            required: "Summary is required",
                                            maxLength: {
                                                value: 500,
                                                message: "Max 500 characters",
                                            },
                                        })}
                                    ></textarea>
                                    {errors.summary && (
                                        <div className="invalid-feedback">
                                            {errors.summary.message}
                                        </div>
                                    )}
                                    <div className="form-text text-end small">
                                        Max 500 chars
                                    </div>
                                </div>

                                {/* 2. File Upload Zone */}
                                <h6 className="text-uppercase text-muted fw-bold small mb-4 mt-4 border-bottom pb-2">
                                    Attachment
                                </h6>

                                <div className="mb-4">
                                    <div
                                        className="position-relative text-center p-5"
                                        style={styles.fileZone}
                                    >
                                        <input
                                            type="file"
                                            className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                                            style={{ cursor: "pointer" }}
                                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                                            {...register("file")}
                                        />

                                        <div className="pointer-events-none">
                                            {selectedFile &&
                                            selectedFile.length > 0 ? (
                                                <div className="text-success">
                                                    <div className="fs-1 mb-2">
                                                        📄
                                                    </div>
                                                    <h6 className="fw-bold">
                                                        {selectedFile[0].name}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {(
                                                            selectedFile[0]
                                                                .size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{" "}
                                                        MB
                                                    </small>
                                                </div>
                                            ) : (
                                                <div className="text-muted">
                                                    <div className="fs-1 mb-2">
                                                        ☁️
                                                    </div>
                                                    <h6 className="fw-bold text-dark">
                                                        Click or Drag file to
                                                        upload
                                                    </h6>
                                                    <p className="small mb-0">
                                                        Supported: PDF, DOCX,
                                                        PPTX (Max 10MB)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-text mt-2">
                                        Note: All uploads are automatically
                                        scanned and encrypted.
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                                    <Link
                                        to="/dashboard/assets"
                                        className="btn btn-light border px-4"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="btn px-4 shadow-sm"
                                        style={styles.btnPrimary}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            "Upload Asset"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateAsset;
