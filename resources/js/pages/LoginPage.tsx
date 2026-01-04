import React, { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchemaType } from "../schemas/loginSchema";
import { login } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router";
import { getErrorMessage } from "@/lib/helper";

const LoginPage: FC = () => {
    const [serverError, setServerError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const {
        register,
        handleSubmit,
        setValue, // Needed for the 'Use' buttons
        formState: { errors, isSubmitting },
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchemaType) => {
        setServerError("");
        try {
            const userData = await login(data);
            setUser(userData.data);
            localStorage.setItem("token", userData.token);
            navigate("/dashboard"); // Fixed path to absolute
        } catch (err: unknown) {
            setServerError(getErrorMessage(err));
        }
    };

    // --- DEMO USERS DATA ---
    const demoUsers = [
        { role: "Admin", email: "admin@uwl.ac.uk", desc: "Full System Access" },
        {
            role: "Supervisor",
            email: "sarah.supervisor@uwl.ac.uk",
            desc: "Can Approve/Reject Assets",
        },
        {
            role: "Champion",
            email: "david.champ@uwl.ac.uk",
            desc: "High Points & Leaderboard",
        },
        {
            role: "Council",
            email: "emma.council@uwl.ac.uk",
            desc: "Policy Oversight",
        },
        {
            role: "Employee",
            email: "john.doe@uwl.ac.uk",
            desc: "Standard Access",
        },
    ];

    const handlePrefill = (email: string) => {
        setValue("email", email);
        setValue("password", "password");
        setServerError(""); // Clear errors if any
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    {/* LEFT COLUMN: Login Form */}
                    <div className="col-md-5 col-lg-4">
                        <div className="card shadow-lg border-0 rounded-3">
                            <div className="card-body p-4 p-md-5">
                                <div className="text-center mb-4">
                                    <div className="display-4 mb-2">🛡️</div>
                                    <h3
                                        className="fw-bold"
                                        style={{ color: "#003366" }}
                                    >
                                        Digital Knowledge Network (DKN) System
                                    </h3>
                                    <p className="text-muted small"></p>
                                </div>

                                {serverError && (
                                    <div className="alert alert-danger py-2 small shadow-sm border-0">
                                        ⚠️ {serverError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-uppercase text-secondary">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control form-control-lg ${
                                                errors.email ? "is-invalid" : ""
                                            }`}
                                            placeholder="name@uwl.ac.uk"
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-uppercase text-secondary">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control form-control-lg ${
                                                errors.password
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="••••••••"
                                            {...register("password")}
                                        />
                                        {errors.password && (
                                            <div className="invalid-feedback">
                                                {errors.password.message}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="btn btn-primary w-100 btn-lg shadow-sm fw-bold"
                                        disabled={isSubmitting}
                                        style={{
                                            backgroundColor: "#003366",
                                            borderColor: "#003366",
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Authenticating...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </button>
                                </form>
                                <div className="text-center mt-4 text-muted small">
                                    Protected by University Identity Service
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Demo Credentials (Hidden on small screens) */}
                    <div className="col-md-6 col-lg-5 d-none d-md-block ms-md-4">
                        <div className="h-100 d-flex flex-column justify-content-center">
                            <h4 className="fw-bold mb-3 text-dark">
                                Testing User Details & Access
                            </h4>
                            <p className="text-muted mb-4">
                                Use these pre-configured accounts to test
                                different roles and permissions within the
                                Knowledge System.
                            </p>

                            <div className="list-group shadow-sm">
                                {demoUsers.map((user) => (
                                    <button
                                        key={user.role}
                                        type="button"
                                        className="list-group-item list-group-item-action d-flex align-items-center justify-content-between p-3 border-0 border-bottom"
                                        onClick={() =>
                                            handlePrefill(user.email)
                                        }
                                    >
                                        <div>
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="fw-bold text-dark">
                                                    {user.role}
                                                </span>
                                                <span className="badge bg-light text-secondary border">
                                                    {user.email}
                                                </span>
                                            </div>
                                            <div className="small text-muted mt-1">
                                                {user.desc}
                                            </div>
                                        </div>
                                        <div className="text-primary small fw-bold">
                                            Use &rarr;
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-3 p-3 bg-white rounded shadow-sm border-start border-4 border-warning">
                                <small className="text-muted">
                                    <strong>Note:</strong> All test accounts use
                                    the password:{" "}
                                    <code className="text-dark fw-bold">
                                        password
                                    </code>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
