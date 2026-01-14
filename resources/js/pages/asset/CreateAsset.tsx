import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createAsset } from "@/services/assetService";
import { getPolicies, getTags } from "@/services/apiService";

const CreateAsset = () => {
    const navigate = useNavigate();

    // --- State ---
    const [policies, setPolicies] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [customTags, setCustomTags] = useState([]);

    // --- React Hook Form ---
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    const selectedFile = watch("file");

    // --- Styles (Original Kept) ---
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

    // --- Load Data ---
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [policyData, tagData] = await Promise.all([
                    getPolicies(),
                    getTags(),
                ]);
                console.log("policyd", policyData);
                setPolicies(policyData);
                setAvailableTags(tagData);
            } catch (e) {
                console.error("Failed to load options");
            }
        };
        loadInitialData();
    }, []);

    // --- Custom Tag Logic ---
    const handleAddCustomTag = () => {
        const tag = newTagName.trim();
        if (tag && !customTags.includes(tag)) {
            setCustomTags([...customTags, tag]);
            setNewTagName("");
        }
    };

    const removeCustomTag = (tagToRemove) => {
        setCustomTags(customTags.filter((t) => t !== tagToRemove));
    };

    // --- Submit Handler ---
    const onSubmit = async (data) => {
        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("summary", data.summary);
        formData.append("governance_policy_id", data.governance_policy_id);

        if (data.file && data.file[0]) {
            formData.append("file", data.file[0]);
        }

        // Combine existing tag IDs and new tag strings
        const allTags = [...(data.tags || []), ...customTags];
        allTags.forEach((tag) => {
            formData.append("tags[]", tag);
        });

        try {
            await createAsset(formData);
            toast.success("Asset uploaded successfully!");
            setTimeout(() => navigate("/dashboard/assets"), 1500);
        } catch (error) {
            if (error.response?.status === 422) {
                toast.error("Validation failed.");
            } else {
                toast.error("Upload failed. Max size 10MB.");
            }
        }
    };

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
                                            policy --
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
                                </div>

                                {/* --- TAGS SECTION --- */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Tags & Taxonomy
                                    </label>
                                    <div
                                        className="p-3 border rounded bg-light mb-2"
                                        style={{
                                            maxHeight: "150px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {/* Existing Tags */}
                                        {availableTags.map((tag) => (
                                            <div
                                                key={tag.id}
                                                className="form-check form-check-inline"
                                            >
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`tag-${tag.id}`}
                                                    value={tag.id}
                                                    {...register("tags")}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`tag-${tag.id}`}
                                                >
                                                    {tag.name}
                                                </label>
                                            </div>
                                        ))}

                                        {/* Custom Tags UI */}
                                        {customTags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="badge bg-primary me-2 mb-1"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    className="btn-close btn-close-white ms-2"
                                                    style={{
                                                        fontSize: "0.5rem",
                                                    }}
                                                    onClick={() =>
                                                        removeCustomTag(tag)
                                                    }
                                                ></button>
                                            </span>
                                        ))}
                                    </div>

                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Add a new tag (e.g. AI, Finance)"
                                            value={newTagName}
                                            onChange={(e) =>
                                                setNewTagName(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddCustomTag();
                                                }
                                            }}
                                        />
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={handleAddCustomTag}
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    <div className="form-text">
                                        Select existing tags or type to create
                                        new ones.
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
                                </div>

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
                                        <div>
                                            {selectedFile?.[0] ? (
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
                                </div>

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
