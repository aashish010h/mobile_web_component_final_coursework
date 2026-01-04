import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Don't forget this import!
import { createUser } from "@/services/authService";

const AddUser = () => {
    const navigate = useNavigate();

    // --- React Hook Form Setup ---
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            role: "EMPLOYEE", // Default role
        },
    });

    // Watch password to validate confirmation
    const password = watch("password");

    // --- Styles ---
    const styles = {
        cardHeader: { backgroundColor: "#003366", color: "#ffffff" },
        btnPrimary: {
            backgroundColor: "#003366",
            borderColor: "#003366",
            color: "white",
        },
    };

    // --- Submit Handler ---
    const onSubmit = async (data) => {
        // Client-side confirmation check
        if (data.password !== data.password_confirmation) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            await createUser(data);

            toast.success(`User ${data.name} created successfully!`, {
                position: "top-right",
                autoClose: 2000,
            });

            // Redirect after brief delay
            setTimeout(() => navigate("/dashboard/users"), 2000);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Laravel Validation Errors
                const apiErrors = error.response.data.errors;

                // 1. Show Toast for general awareness
                toast.error("Please fix the errors in the form.");

                // 2. Set field-specific errors in React Hook Form
                Object.keys(apiErrors).forEach((key) => {
                    setError(key, {
                        type: "server",
                        message: apiErrors[key][0],
                    });
                });
            } else {
                toast.error("System Error: Could not create user.");
            }
        }
    };

    return (
        <div className="container mt-5 mb-5">
            {/* Toast Container */}
            <ToastContainer />

            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    {/* Navigation */}
                    <div className="mb-3">
                        <Link
                            to="/dashboard/users"
                            className="text-decoration-none text-muted"
                        >
                            &larr; Back to User List
                        </Link>
                    </div>

                    <div className="card shadow-lg border-0 rounded-3 overflow-hidden">
                        {/* Header */}
                        <div
                            className="card-header p-4"
                            style={styles.cardHeader}
                        >
                            <h4 className="mb-0 fw-bold">Create System User</h4>
                            <p className="mb-0 opacity-75 small">
                                Enter details to grant access to the Knowledge
                                System.
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">
                                    User Identity
                                </h6>

                                <div className="row g-3 mb-4">
                                    {/* Name */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Full Name{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                errors.name ? "is-invalid" : ""
                                            }`}
                                            placeholder="e.g. Aashish Giri"
                                            {...register("name", {
                                                required: "Name is required",
                                            })}
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">
                                                {errors.name.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Email Address{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${
                                                errors.email ? "is-invalid" : ""
                                            }`}
                                            placeholder="user@uwl.ac.uk"
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message:
                                                        "Invalid email address",
                                                },
                                            })}
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Role */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            System Role{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            className={`form-select ${
                                                errors.role ? "is-invalid" : ""
                                            }`}
                                            {...register("role", {
                                                required: true,
                                            })}
                                        >
                                            <option value="EMPLOYEE">
                                                Employee
                                            </option>
                                            <option value="SUPERVISOR">
                                                Supervisor
                                            </option>
                                            <option value="KNOWLEDGE_CHAMPION">
                                                Knowledge Champion
                                            </option>
                                            <option value="GOVERNANCE_COUNCIL">
                                                Governance Council
                                            </option>
                                            <option value="ADMIN">
                                                Administrator
                                            </option>
                                        </select>
                                        {errors.role && (
                                            <div className="invalid-feedback">
                                                Role is required
                                            </div>
                                        )}
                                    </div>

                                    {/* Department */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. IT Services"
                                            {...register("department")}
                                        />
                                    </div>
                                </div>

                                <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">
                                    Security Credentials
                                </h6>

                                <div className="row g-3 mb-4">
                                    {/* Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Password{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${
                                                errors.password
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            {...register("password", {
                                                required:
                                                    "Password is required",
                                                minLength: {
                                                    value: 8,
                                                    message:
                                                        "Must be at least 8 characters",
                                                },
                                            })}
                                        />
                                        <div className="form-text small">
                                            Min 8 characters
                                        </div>
                                        {errors.password && (
                                            <div className="invalid-feedback">
                                                {errors.password.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Confirm Password{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${
                                                errors.password_confirmation
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            {...register(
                                                "password_confirmation",
                                                {
                                                    required:
                                                        "Please confirm password",
                                                    validate: (val) => {
                                                        if (!val)
                                                            return "Confirmation is required";
                                                        if (
                                                            watch(
                                                                "password"
                                                            ) !== val
                                                        )
                                                            return "Passwords do not match";
                                                    },
                                                }
                                            )}
                                        />
                                        {errors.password_confirmation && (
                                            <div className="invalid-feedback">
                                                {
                                                    errors.password_confirmation
                                                        .message
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-2 pt-3">
                                    <Link
                                        to="/users"
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
                                                Saving...
                                            </>
                                        ) : (
                                            "Create User"
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

export default AddUser;
