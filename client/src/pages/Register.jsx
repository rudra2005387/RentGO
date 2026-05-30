import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye, FaEyeSlash, FaCheckCircle, FaSpinner, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { containerVariants, itemVariants } from "../utils/animations";
import apiClient from "../config/apiClient";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState(1); // 1: basic, 2: password, 3: terms

  // Validation logic
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordStrong = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  };

  const isPasswordsMatch = () => formData.password === formData.confirmPassword;

  const isStep1Valid = () =>
    formData.fullName.trim().length > 0 &&
    isEmailValid(formData.email) &&
    formData.phone.length === 10;

  const isStep2Valid = () =>
    isPasswordStrong(formData.password) && isPasswordsMatch();

  const isFormValid = () =>
    isStep1Valid() && isStep2Valid() && termsAccepted;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2);
    } else if (step === 2 && isStep2Valid()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isFormValid()) {
      setError("Please complete all fields correctly.");
      return;
    }

    setLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const payload = {
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone, // Keep as string, don't convert to number
        role: "guest",
      };

      const response = await apiClient.post("/auth/register", payload);
      const data = response.data;

      if (data.success) {
        setSuccessMessage("Account created successfully! Redirecting...");
        login(data.data.user, data.data.token);
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (err) {
      // Handle detailed validation errors from server
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map(e => `${e.field}: ${e.message}`)
          .join(", ");
        setError(errorMessages || "Registration failed. Please try again.");
      } else {
        setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-rose-50 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 text-sm sm:text-base">Join RentGo to get started</p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-8"
        >
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`flex-1 h-2 rounded-full transition-all ${
                step >= num ? "bg-rose-500" : "bg-gray-200"
              }`}
            />
          ))}
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
          >
            <FaCheckCircle className="text-xl flex-shrink-0" />
            <p className="text-sm font-medium">{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700"
          >
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Form Container */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-6">Basic Information</h2>

                {/* Full Name */}
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible" className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                  {formData.fullName && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <FaCheckCircle className="text-xs" /> Name looks good
                    </motion.p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible" className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                  {formData.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs mt-1 flex items-center gap-1 ${isEmailValid(formData.email) ? "text-green-600" : "text-orange-600"}`}
                    >
                      {isEmailValid(formData.email) ? (
                        <>
                          <FaCheckCircle className="text-xs" /> Valid email
                        </>
                      ) : (
                        "⚠ Enter a valid email"
                      )}
                    </motion.p>
                  )}
                </motion.div>

                {/* Phone */}
                <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit number"
                    maxLength="10"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                  {formData.phone && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs mt-1 flex items-center gap-1 ${formData.phone.length === 10 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {formData.phone.length === 10 ? (
                        <>
                          <FaCheckCircle className="text-xs" /> Phone verified
                        </>
                      ) : (
                        `⚠ ${formData.phone.length}/10 digits`
                      )}
                    </motion.p>
                  )}
                </motion.div>

                <motion.button
                  custom={3}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid()}
                  className="w-full mt-8 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  Next Step
                  <FaArrowRight className="text-sm" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-6">Create Password</h2>

                {/* Password */}
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible" className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs mt-2 flex items-center gap-1 ${isPasswordStrong(formData.password) ? "text-green-600" : "text-orange-600"}`}
                    >
                      {isPasswordStrong(formData.password) ? (
                        <>
                          <FaCheckCircle className="text-xs" /> Strong password
                        </>
                      ) : (
                        "⚠ Must have uppercase & numbers (8+ chars)"
                      )}
                    </motion.p>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div custom={1} variants={itemVariants} initial="hidden" animate="visible" className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-xs mt-1 flex items-center gap-1 ${isPasswordsMatch() ? "text-green-600" : "text-red-600"}`}
                    >
                      {isPasswordsMatch() ? (
                        <>
                          <FaCheckCircle className="text-xs" /> Passwords match
                        </>
                      ) : (
                        "✗ Passwords don't match"
                      )}
                    </motion.p>
                  )}
                </motion.div>

                <div className="flex gap-3 mt-8">
                  <motion.button
                    custom={2}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-all hover:border-gray-400"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    custom={3}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    type="button"
                    onClick={handleNext}
                    disabled={!isStep2Valid()}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Next Step
                    <FaArrowRight className="text-sm" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Terms & Submit */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-6">Review & Create Account</h2>

                {/* Account Summary */}
                <motion.div
                  custom={0}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{formData.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{formData.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{formData.phone}</span>
                  </div>
                </motion.div>

                {/* Terms Checkbox */}
                <motion.div
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500 mt-1 cursor-pointer"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </motion.div>

                {/* Submit Buttons */}
                <div className="flex gap-3 mt-8">
                  <motion.button
                    custom={2}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg transition-all hover:border-gray-400"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    custom={3}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    type="submit"
                    disabled={!isFormValid() || loading}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Create Account
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600"
        >
          Already have an account?{" "}
          <Link to="/login" className="text-rose-500 font-bold hover:text-rose-600 transition-colors">
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;