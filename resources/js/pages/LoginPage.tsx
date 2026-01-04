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
        formState: { errors, isSubmitting },
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchemaType) => {
        setServerError("");
        try {
            const userData = await login(data);
            console.log("userdadadad", userData);
            setUser(userData.data);
            localStorage.setItem("token", userData.token);
            navigate("dashboard");
        } catch (err: unknown) {
            setServerError(getErrorMessage(err));
        }
    };
    return (
        <>
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card p-4 shadow-sm" style={{ width: "350px" }}>
                    <h3 className="text-center mb-3">Login</h3>

                    {serverError && (
                        <div className="alert alert-danger py-2">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <div className="mb-3">
                            <label className="form-label">
                                Email (admin@admin.com)
                            </label>
                            <input
                                type="email"
                                className={`form-control ${
                                    errors.email ? "is-invalid" : ""
                                }`}
                                placeholder="Enter email"
                                {...register("email")}
                            />
                            {errors.email && (
                                <div className="invalid-feedback">
                                    {errors.email.message}
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div className="mb-3">
                            <label className="form-label">
                                Password (password)
                            </label>
                            <input
                                type="password"
                                className={`form-control ${
                                    errors.password ? "is-invalid" : ""
                                }`}
                                placeholder="Enter password"
                                {...register("password")}
                            />
                            {errors.password && (
                                <div className="invalid-feedback">
                                    {errors.password.message}
                                </div>
                            )}
                        </div>

                        <button
                            className="btn btn-primary w-100"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
