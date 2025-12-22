import React from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/SignUpPage.module.scss';
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "../stores/useAuthStore.js";

import { useNavigate } from "react-router";
import GlobalLoadingOverlay from "../components/common/GlobalLoadingOverlay.jsx";
import { toast } from "sonner";


const cx = classNames.bind(styles);


const signUpSchema = z.object({
    firstname: z.string().min(1, "First Name is required"),
    lastname: z.string().min(1, "Last Name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    gender: z.enum(["male", "female", "other"], { required_error: "Gender is required" }),
    birthday: z.string().nonempty("Birthday is required"),
    agree: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

const SignUpPage = () => {
    const navigate = useNavigate();
    const signUp = useAuthStore((state) => state.signUp);


    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(signUpSchema),
    });


    const onSubmit = async (data) => {
        const {
            username,
            password,
            email,
            firstname,
            lastname,
            gender,
            birthday,
        } = data;

        try {
            const res = await signUp(username, password, email, firstname, lastname, gender, birthday);
            res && navigate("/signin");

        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className={cx('page-wrapper')}>
            <div className={cx("header")}>
                <h1 className={cx("logo-text")}>Shrimple</h1>
                <h2 className={cx("sub-title")}>Join the conversation today</h2>
            </div>

            <div className={cx("body")}>
                <div className={cx('sign-up-wrapper')}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <p className={cx("title")}>Create Account</p>

                        <div className={cx("inputs-group")}>
                            <div className={cx("form-row")}>
                                <label>First Name:</label>
                                <input {...register("firstname")} className={cx("input")} />
                                {errors.firstname && <p className={cx("error")}>{errors.firstname.message}</p>}
                            </div>
                            <div className={cx("form-row")}>
                                <label>Last Name:</label>
                                <input {...register("lastname")} className={cx("input")} />
                                {errors.lastname && <p className={cx("error")}>{errors.lastname.message}</p>}
                            </div>
                        </div>

                        <div className={cx("form-row")}>
                            <label>Username:</label>
                            <input {...register("username")} className={cx("input")} />
                            {errors.username && <p className={cx("error")}>{errors.username.message}</p>}
                        </div>

                        <div className={cx("form-row")}>
                            <label>Email:</label>
                            <input {...register("email")} className={cx("input")} type="email" />
                            {errors.email && <p className={cx("error")}>{errors.email.message}</p>}
                        </div>

                        <div className={cx("inputs-group")}>
                            <div className={cx("form-row")}>
                                <label>Gender:</label>
                                <select {...register("gender")} className={cx("input")}>
                                    <option value="">Select...</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && <p className={cx("error")}>{errors.gender.message}</p>}
                            </div>
                            <div className={cx("form-row")}>
                                <label>Birthday:</label>
                                <input {...register("birthday")} className={cx("input")} type="date" />
                                {errors.birthday && <p className={cx("error")}>{errors.birthday.message}</p>}
                            </div>
                        </div>

                        <div className={cx("form-row")}>
                            <label>Password:</label>
                            <input {...register("password")} className={cx("input")} type="password" />
                            {errors.password && <p className={cx("error")}>{errors.password.message}</p>}
                        </div>

                        <div className={cx("form-row")}>
                            <label>Confirm Password:</label>
                            <input {...register("confirmPassword")} className={cx("input")} type="password" />
                            {errors.confirmPassword && <p className={cx("error")}>{errors.confirmPassword.message}</p>}
                        </div>

                        <div className={cx("checkbox-row")}>
                            <input id="agree" type="checkbox" {...register("agree")} />
                            <label htmlFor="agree">
                                I agree to the <span>Terms of Service</span> and <span>Privacy Policy</span>
                            </label>
                            {errors.agree && <p className={cx("error")}>{errors.agree.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting}>Create Account</button>
                    </form>

                    <div className={cx("line")}>or</div>
                    <button
                        className={cx("social-btn", "google")}
                        onClick={() => toast.info("Feature coming soon!")}
                        type="button"
                    >
                        Sign up with Google
                    </button>
                    <button
                        className={cx("social-btn", "github")}
                        onClick={() => toast.info("Feature coming soon!")}
                        type="button"
                    >
                        Sign up with GitHub
                    </button>
                    <p>Already have an account? <span><Link to="/signin">Sign in</Link></span></p>
                    <GlobalLoadingOverlay />
                </div>
                <p className={cx("copyright")}>© 2025 Shrimple. All rights reserved.</p>
            </div>
        </div>
    );
};

export default SignUpPage;
