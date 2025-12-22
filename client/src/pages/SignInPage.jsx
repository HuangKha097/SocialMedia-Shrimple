import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "../assets/css/SignInPage.module.scss";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore.js";
import { useNavigate } from "react-router";
import GlobalLoadingOverlay from "../components/common/GlobalLoadingOverlay.jsx";

const cx = classNames.bind(styles);


const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    remember: z.boolean().optional(),
});

const SignInPage = () => {
    const navigate = useNavigate();
    const signIn = useAuthStore((state) => state.signIn);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    const [showPassword, setShowPassword] = useState(false);


    const onSubmit = async (data) => {
        const { email, password } = data;
        try {
            const res = await signIn(email, password)
            res.success && navigate("/");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className={cx("page-wrapper")}>
            <div className={cx("header")}>
                <h1 className={cx("logo-text")}>Shrimple</h1>
                <h2 className={cx("sub-title")}>Welcome back to your conversations</h2>
            </div>

            <div className={cx("body")}>
                <div className={cx("sign-in-wrapper")}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <p className={cx("title")}>Sign In</p>

                        {/* Email */}
                        <div className={cx("form-row")}>
                            <label htmlFor="email">Email Address:</label>
                            <input
                                {...register("email")}
                                className={cx("input")}
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className={cx("error")}>{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className={cx("form-row")}>
                            <label htmlFor="password">Password:</label>
                            <div className={cx("input-group")} style={{ position: 'relative' }}>
                                <input
                                    {...register("password")}
                                    className={cx("input")}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    style={{ paddingRight: '40px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255,255,255,0.6)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className={cx("error")}>{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember me + Forgot password */}
                        <div className={cx("checkbox-row", "space-between")}>
                            <div className={cx("remember-section")}>
                                <input id="remember" type="checkbox" {...register("remember")} />
                                <label htmlFor="remember">Remember me</label>
                            </div>
                            <span className={cx("forgot-password")}>Forgot password?</span>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className={cx("line")}>or</div>

                    {/* Social buttons */}
                    <button
                        className={cx("social-btn", "google")}
                        onClick={() => toast.info("Feature coming soon!")}
                        type="button"
                    >
                        <span>Continue with Google</span>
                    </button>
                    <button
                        className={cx("social-btn", "github")}
                        onClick={() => toast.info("Feature coming soon!")}
                        type="button"
                    >
                        <span>Continue with GitHub</span>
                    </button>

                    {/* Link to Sign up */}
                    <p>
                        Don’t have an account?{" "}
                        <span>
                            <Link to="/signup">Sign up</Link>
                        </span>
                    </p>

                    <GlobalLoadingOverlay />
                </div>

                <p className={cx("copyright")}>
                    © 2025 Shrimple. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default SignInPage;
