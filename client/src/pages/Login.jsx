import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaSpinner, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../config/apiClient';
import { containerVariants, itemVariants, fadeInUp } from '../utils/animations';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpNotice, setOtpNotice] = useState('');
  const [otpRequestLoading, setOtpRequestLoading] = useState(false);
  const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem('rentgo_remembered_email');
    if (remembered) {
      setEmail(remembered);
      setOtpEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!otpSent || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const data = res.data;
      if (!data.success) throw new Error(data.message || 'Login failed');
      
      login(data.data.user, data.data.token);
      
      if (rememberMe) {
        localStorage.setItem('rentgo_remembered_email', email);
      } else {
        localStorage.removeItem('rentgo_remembered_email');
      }
      
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Handle detailed error messages from server
      const message = err.response?.data?.message || 
                     err.response?.data?.errors?.[0]?.message || 
                     err.message || 
                     'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email: resetEmail });
      if (res.data.success) {
        setResetSent(true);
        setTimeout(() => {
          setForgotPassword(false);
          setResetSent(false);
          setResetEmail('');
        }, 3000);
      }
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.response?.data?.errors?.[0]?.message || 
                     err.message || 
                     'Failed to send reset email.';
      setError(message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpNotice('');

    if (!otpEmail) {
      setError('Please enter your email address.');
      return;
    }

    setOtpRequestLoading(true);
    try {
      const res = await apiClient.post('/auth/send-otp', { email: otpEmail });
      if (!res.data.success) throw new Error(res.data.message || 'Failed to send OTP');
      setOtpSent(true);
      setOtpCode('');
      setOtpCountdown(60);
      setOtpNotice('OTP sent. Check your inbox for the 6-digit code.');
    } catch (err) {
      const message = err.response?.data?.message ||
                     err.response?.data?.errors?.[0]?.message ||
                     err.message ||
                     'Failed to send OTP. Please try again.';
      setError(message);
    } finally {
      setOtpRequestLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpNotice('');

    if (!otpEmail || !otpCode) {
      setError('Please enter your email and the OTP code.');
      return;
    }

    setOtpVerifyLoading(true);
    try {
      const res = await apiClient.post('/auth/verify-otp', { email: otpEmail, otp: otpCode });
      const data = res.data;
      if (!data.success) throw new Error(data.message || 'OTP verification failed');

      login(data.data.user, data.data.token);

      if (rememberMe) {
        localStorage.setItem('rentgo_remembered_email', otpEmail);
      } else {
        localStorage.removeItem('rentgo_remembered_email');
      }

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message ||
                     err.response?.data?.errors?.[0]?.message ||
                     err.message ||
                     'OTP verification failed. Please try again.';
      setError(message);
    } finally {
      setOtpVerifyLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-white to-rose-50">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-center items-center lg:w-1/2 p-12 bg-gradient-to-br from-rose-500 to-rose-600 text-white"
      >
        <div className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
            className="text-6xl font-bold mb-6"
          >
            🏠
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">Welcome to RentGo</h1>
          <p className="text-lg opacity-90 mb-8">
            Find your perfect stay or list your property
          </p>
          <motion.div
            className="space-y-4 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, staggerChildren: 0.1 }}
          >
            {[
              { icon: '✨', title: 'Seamless Booking', desc: 'Reserve properties in seconds' },
              { icon: '🔒', title: 'Secure & Trusted', desc: 'Bank-level security' },
              { icon: '🌍', title: 'Global Community', desc: 'Connect worldwide' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm opacity-80">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen lg:min-h-auto"
      >
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!forgotPassword ? (
              <motion.div
                key="login"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome back</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Sign in to your RentGo account</p>
                </motion.div>

                {/* Form Card */}
                <motion.form
                  onSubmit={otpMode ? handleVerifyOtp : handleSubmit}
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg"
                >
                  {/* Mode Toggle */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpMode(false);
                        if (!email && otpEmail) setEmail(otpEmail);
                        setOtpSent(false);
                        setOtpCountdown(0);
                        setOtpCode('');
                        setError('');
                        setOtpNotice('');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        !otpMode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpMode(true);
                        if (!otpEmail && email) setOtpEmail(email);
                        setOtpSent(false);
                        setOtpCountdown(0);
                        setOtpCode('');
                        setError('');
                        setOtpNotice('');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        otpMode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Email OTP
                    </button>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                    >
                      <span className="text-red-600 text-xl">⚠️</span>
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}

                  {/* Success Notice */}
                  {otpNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3"
                    >
                      <span className="text-emerald-600 text-xl">✅</span>
                      <p className="text-sm text-emerald-700">{otpNotice}</p>
                    </motion.div>
                  )}

                  {/* Email Input */}
                  <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={otpMode ? otpEmail : email}
                      onChange={(e) => (otpMode ? setOtpEmail(e.target.value) : setEmail(e.target.value))}
                      placeholder="you@example.com"
                      required
                      disabled={loading || otpRequestLoading || otpVerifyLoading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white disabled:opacity-50"
                    />
                  </motion.div>

                  {!otpMode ? (
                    <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          disabled={loading}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white disabled:opacity-50 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div custom={3} variants={itemVariants} initial="hidden" animate="visible">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        disabled={otpVerifyLoading || otpRequestLoading}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white disabled:opacity-50 tracking-[0.3em] text-center text-lg"
                      />
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>Did not get the code?</span>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpRequestLoading || otpCountdown > 0}
                          className="font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Remember Me & Forgot Password */}
                  <motion.div
                    custom={4}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center justify-between text-sm"
                  >
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading || otpRequestLoading || otpVerifyLoading}
                        className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    {!otpMode && (
                      <button
                        type="button"
                        onClick={() => setForgotPassword(true)}
                        className="text-rose-500 font-medium hover:text-rose-600 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    custom={5}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    type="submit"
                    disabled={loading || otpVerifyLoading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full mt-8 bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading || otpVerifyLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {otpMode ? 'Verifying...' : 'Signing in...'}
                      </>
                    ) : (
                      <>
                        {otpMode ? 'Verify & Sign In' : 'Sign In'}
                        <FaArrowRight className="text-sm" />
                      </>
                    )}
                  </motion.button>

                  {otpMode && (
                    <motion.button
                      custom={6}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpRequestLoading}
                      whileHover={{ scale: otpRequestLoading ? 1 : 1.01 }}
                      whileTap={{ scale: otpRequestLoading ? 1 : 0.99 }}
                      className="w-full border-2 border-rose-200 text-rose-600 font-semibold py-3 rounded-lg hover:bg-rose-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {otpRequestLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        'Send OTP'
                      )}
                    </motion.button>
                  )}
                </motion.form>

                {/* Sign Up Link */}
                <motion.div
                  custom={6}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-6 text-center text-sm text-gray-600"
                >
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-rose-500 font-bold hover:text-rose-600 transition-colors"
                  >
                    Create one
                  </Link>
                </motion.div>

                {/* Demo Credentials */}
                <motion.div
                  custom={7}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm"
                >
                  <p className="font-semibold text-blue-900 mb-2">✨ Demo Credentials:</p>
                  <p className="text-blue-800">Email: demo@rentgo.com</p>
                  <p className="text-blue-800">Password: Demo@123</p>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="reset"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
              >
                <motion.div custom={0} variants={itemVariants} initial="hidden" animate="visible">
                  <button
                    onClick={() => setForgotPassword(false)}
                    className="text-rose-500 font-medium hover:text-rose-600 mb-4 flex items-center gap-2"
                  >
                    ← Back to login
                  </button>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h2>
                  <p className="text-gray-600 text-sm">Enter your email to receive reset instructions</p>
                </motion.div>

                <motion.form
                  onSubmit={handleResetPassword}
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg"
                >
                  {resetSent ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8"
                    >
                      <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">Email sent!</p>
                      <p className="text-gray-600">Check your email for password reset instructions.</p>
                    </motion.div>
                  ) : (
                    <>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                        >
                          <span className="text-red-600 text-xl">⚠️</span>
                          <p className="text-sm text-red-700">{error}</p>
                        </motion.div>
                      )}

                      <motion.div custom={2} variants={itemVariants} initial="hidden" animate="visible">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          disabled={resetLoading}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-rose-500 focus:outline-none transition-all bg-gray-50 focus:bg-white disabled:opacity-50"
                        />
                      </motion.div>

                      <motion.button
                        custom={3}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        type="submit"
                        disabled={resetLoading}
                        whileHover={{ scale: resetLoading ? 1 : 1.02 }}
                        whileTap={{ scale: resetLoading ? 1 : 0.98 }}
                        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:shadow-lg text-white font-bold py-3 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {resetLoading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Email'
                        )}
                      </motion.button>
                    </>
                  )}
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
