import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAsset, updateAsset } from "@/services/assetService";

const EditAsset = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentFileUrl, setCurrentFileUrl] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // --- React Hook Form ---
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    const selectedFile = watch("file");

    // --- Styles ---
    const styles = {
        cardHeader: { backgroundColor: "#003366", color: "#ffffff" },
        btnPrimary: {
            backgroundColor: "#003366",
            borderColor: "#003366",
            color: "white",
        },
    };

    // --- 1. Fetch Existing Data ---
    useEffect(() => {
        const fetchAssetData = async () => {
            try {
                const response = await getAsset(id);
                // Handle response wrapping (response.data.data vs response.data)
                const asset = response.data || response;

                // Pre-fill form
                reset({
                    title: asset.title,
                    summary: asset.summary,
                    status: asset.status,
                });

                // Store current file URL for display
                if (asset.download_url) {
                    setCurrentFileUrl(asset.download_url);
                }
                setLoadingData(false);
            } catch (error) {
                toast.error("Could not load asset data.");
                navigate("/dashboard/assets");
            }
        };

        if (id) fetchAssetData();
    }, [id, reset, navigate]);

    // --- 2. Submit Handler ---
    const onSubmit = async (data) => {
        const formData = new FormData();

        // Append Text Fields
        formData.append("title", data.title);
        formData.append("summary", data.summary);
        formData.append("status", data.status);

        // Append File ONLY if user selected a new one
        if (data.file && data.file.length > 0) {
            formData.append("file", data.file[0]);
        }

        try {
            await updateAsset(id, formData);

            toast.success("Asset updated successfully!");
            setTimeout(() => navigate("/dashboard/assets"), 1500);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                toast.error("Validation failed. Please check inputs.");
            } else {
                toast.error("Update failed. Check file size or permissions.");
            }
        }
    };

    if (loadingData) {
        return <div className="p-5 text-center">Loading asset details...</div>;
    }

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
                                Edit Knowledge Asset
                            </h4>
                            <p className="mb-0 opacity-75 small">
                                Modify content, update status, or replace file.
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Content Section */}
                                <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">
                                    Content & Metadata
                                </h6>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Asset Title
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${
                                            errors.title ? "is-invalid" : ""
                                        }`}
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

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        Summary
                                    </label>
                                    <textarea
                                        className={`form-control ${
                                            errors.summary ? "is-invalid" : ""
                                        }`}
                                        rows="3"
                                        {...register("summary", {
                                            required: "Summary is required",
                                        })}
                                    ></textarea>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Status (Governance)
                                    </label>
                                    <select
                                        className="form-select"
                                        {...register("status")}
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PENDING_REVIEW">
                                            Pending Review
                                        </option>
                                        <option value="PUBLISHED">
                                            Published
                                        </option>
                                        <option value="FLAGGED_OUTDATED">
                                            Flagged (Outdated)
                                        </option>
                                        <option value="ARCHIVED">
                                            Archived
                                        </option>
                                    </select>
                                    <div className="form-text small">
                                        Changing to "Published" makes this
                                        visible to all employees.
                                    </div>
                                </div>

                                {/* File Section */}
                                <h6 className="text-uppercase text-muted fw-bold small mb-3 mt-4 border-bottom pb-2">
                                    Attachment
                                </h6>

                                {/* Current File Display */}
                                {currentFileUrl && (
                                    <div className="alert alert-light border d-flex align-items-center mb-3">
                                        <span className="fs-4 me-3">📄</span>
                                        <div>
                                            <div className="small text-muted text-uppercase fw-bold">
                                                Current File
                                            </div>
                                            <a
                                                href={currentFileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="fw-bold text-dark text-decoration-none"
                                            >
                                                Download / View Existing
                                                Document
                                            </a>
                                        </div>
                                        <span className="badge bg-success ms-auto">
                                            Active
                                        </span>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        {currentFileUrl
                                            ? "Replace File (Optional)"
                                            : "Upload File"}
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                                        {...register("file")}
                                    />
                                    {/* Show name of new file if selected */}
                                    {selectedFile &&
                                        selectedFile.length > 0 && (
                                            <div className="text-success small mt-2">
                                                New file selected:{" "}
                                                <strong>
                                                    {selectedFile[0].name}
                                                </strong>
                                            </div>
                                        )}
                                    <div className="form-text">
                                        Leave blank to keep the existing file.
                                        Max 10MB.
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-2 pt-3 border-top mt-4">
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
                                        {isSubmitting
                                            ? "Updating..."
                                            : "Save Changes"}
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

export default EditAsset;
