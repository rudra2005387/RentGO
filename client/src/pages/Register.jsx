import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { Button, Input, Alert } from "../components/ui";

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

  // Validation logic
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordStrong = (password) => password.length >= 8;

  const isFormValid = () => {
    return (
      formData.fullName.trim().length > 0 &&
      isEmailValid(formData.email) &&
      isPasswordStrong(formData.password) &&
      formData.password === formData.confirmPassword &&
      formData.phone.length === 10 &&
      termsAccepted
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Only allow digits for phone field
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isEmailValid(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong(formData.password)) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.phone.length !== 10) {
      setError("Phone number must be 10 digits.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || firstName; // fallback to firstName if no last name

      const payload = {
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: Number(formData.phone), // ← send as number, not string
        role: "guest",
      };

      console.log("Sending payload:", payload);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        // Extract detailed validation errors if present
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(data.errors.map((e) => e.msg || e.message).join(", "));
        }
        throw new Error(data.message || "Registration failed");
      }

      login(data.data.user, data.data.token);
      navigate("/", { replace: true });

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary-light p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-card-hover p-6 sm:p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600 mb-6">Join RentGo to get started</p>

        {error && (
          <Alert type="danger" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10 digit phone number"
              maxLength={10}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-lg" />
                ) : (
                  <FaEye className="text-lg" />
                )}
              </button>
            </div>
            {formData.password && (
              <p className={`text-xs mt-1 ${isPasswordStrong(formData.password) ? 'text-green-600' : 'text-orange-600'}`}>
                {isPasswordStrong(formData.password) ? '✓ Strong password' : '⚠ At least 8 characters required'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-lg" />
                ) : (
                  <FaEye className="text-lg" />
                )}
              </button>
            </div>
            {formData.confirmPassword && (
              <p className={`text-xs mt-1 flex items-center gap-1 ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {formData.password === formData.confirmPassword ? (
                  <>
                    <FaCheckCircle /> Passwords match
                  </>
                ) : (
                  '✗ Passwords do not match'
                )}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link to="/" className="text-primary hover:text-primary-hover font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/" className="text-primary hover:text-primary-hover font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`w-full mt-8 py-3 rounded-lg shadow-lg font-semibold text-white transition-all duration-200 transform ${
              isFormValid()
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            variant="primary"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⟳</span>
                Creating Account...
              </span>
            ) : (
              <>
                <span className="flex items-center justify-center">
                  {isFormValid() ? '✓ Sign Up & Create Account' : 'Complete Form to Continue'}
                </span>
              </>
            )}
          </Button>

        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:text-primary-hover">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;