import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserWithId, updateUser } from "@/services/authService";

const UpdateUser = () => {
    const { id } = useParams(); // Capture ID from URL
    const navigate = useNavigate();
    const [isLoadingData, setIsLoadingData] = useState(true);

    // --- React Hook Form ---
    const {
        register,
        handleSubmit,
        reset,
        setError,
        watch,
        formState: { errors, isSubmitting },
    } = useForm();

    // --- Styles (Matching your Royal Navy theme) ---
    const styles = {
        cardHeader: { backgroundColor: "#003366", color: "#ffffff" },
        btnPrimary: {
            backgroundColor: "#003366",
            borderColor: "#003366",
            color: "white",
        },
    };

    // --- 1. Fetch Existing User Data ---
    // --- 1. Fetch Existing User Data ---
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getUserWithId(id);

                // DEBUG: Check your console to see exactly what Laravel sent
                console.log("API Response:", response);

                // Handle nested data structure
                // Case A: Service returns full Axios object -> response.data.data
                // Case B: Service returns response.data -> response.data
                const userData =
                    response.data?.data || response.data || response;

                console.log("User Data to Load:", userData); // Verify this has 'name', 'email', etc.

                if (!userData) {
                    throw new Error("No user data found");
                }

                // Pre-fill form
                reset({
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    department: userData.department,
                    // Handle Boolean (true) vs String ("1") vs Int (1)
                    is_active: userData.is_active ? "1" : "0",
                });

                setIsLoadingData(false);
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Error loading user data.");
            }
        };

        if (id) fetchUser();
    }, [id, reset, navigate]);

    // --- 2. Submit Handler ---
    const onSubmit = async (data) => {
        // Validation: Confirm Password (only if password is typed)
        if (data.password && data.password !== data.password_confirmation) {
            toast.error("Passwords do not match!");
            return;
        }

        // Clean Payload: Remove password fields if empty
        const payload = { ...data };
        if (!payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        // Convert status back to boolean/integer for Laravel if needed,
        // though Laravel 'boolean' validation handles "0"/"1" fine.

        try {
            await updateUser(id, payload);

            toast.success("User updated successfully!");

            // Redirect after short delay
            setTimeout(() => navigate("/dashboard/users"), 1500);
        } catch (error) {
            if (error.response && error.response.status === 422) {
                // Handle Validation Errors
                const apiErrors = error.response.data.errors;
                toast.error("Please fix the validation errors.");
                Object.keys(apiErrors).forEach((key) => {
                    setError(key, {
                        type: "server",
                        message: apiErrors[key][0],
                    });
                });
            } else {
                toast.error("System Error: Could not update user.");
            }
        }
    };

    if (isLoadingData) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <ToastContainer position="top-right" />

            <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                    {/* Navigation */}
                    <div className="mb-3">
                        <Link
                            to="/users"
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
                            <h4 className="mb-0 fw-bold">Edit User Profile</h4>
                            <p className="mb-0 opacity-75 small">
                                Update access details and permissions.
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">
                                    Identity & Role
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
                                            {...register("email", {
                                                required: "Email is required",
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
                                    </div>

                                    {/* Department */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            {...register("department")}
                                        />
                                    </div>

                                    {/* Account Status (Active/Inactive) */}
                                    <div className="col-md-12">
                                        <label className="form-label fw-semibold">
                                            Account Status
                                        </label>
                                        <select
                                            className="form-select"
                                            {...register("is_active")}
                                        >
                                            <option value="1">
                                                Active (User can login)
                                            </option>
                                            <option value="0">
                                                Inactive (Access suspended)
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <h6 className="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2 mt-4">
                                    Security (Optional)
                                </h6>
                                <p className="small text-muted mb-3">
                                    Leave these fields blank unless you want to
                                    change the user's password.
                                </p>

                                <div className="row g-3 mb-4">
                                    {/* Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${
                                                errors.password
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="••••••••"
                                            {...register("password", {
                                                minLength: {
                                                    value: 8,
                                                    message:
                                                        "Must be at least 8 characters",
                                                },
                                            })}
                                        />
                                        {errors.password && (
                                            <div className="invalid-feedback">
                                                {errors.password.message}
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="••••••••"
                                            {...register(
                                                "password_confirmation",
                                                {
                                                    validate: (val) => {
                                                        if (
                                                            watch("password") &&
                                                            val !==
                                                                watch(
                                                                    "password"
                                                                )
                                                        ) {
                                                            return "Passwords do not match";
                                                        }
                                                    },
                                                }
                                            )}
                                        />
                                        {errors.password_confirmation && (
                                            <div className="text-danger small mt-1">
                                                {
                                                    errors.password_confirmation
                                                        .message
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="d-flex justify-content-end gap-2 pt-3 border-top">
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
                                                Updating...
                                            </>
                                        ) : (
                                            "Save Changes"
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

export default UpdateUser;
