// frontend/src/components/auth/SignupForm.tsx - Fixed version with proper onboarding flow
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Heart, ArrowLeft, MapPin, Tag, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import ImageUpload from '../ImageUpload';
import toast from 'react-hot-toast';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  bio?: string;
  location?: string;
  interests?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  age?: string;
  general?: string;
}

const SignupForm = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    bio: '',
    location: '',
    interests: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photoError, setPhotoError] = useState<string>('');
  const [showPhotoError, setShowPhotoError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();

  // Real-time validation
  const validateField = (name: keyof SignupFormData, value: string): string => {
    switch (name) {
      case 'name':
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        return '';
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      
      case 'password':
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 100) return 'Password is too long';
        return '';
      
      case 'confirmPassword':
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      case 'age':
        const ageNum = parseInt(value);
        if (isNaN(ageNum)) return 'Please enter a valid age';
        if (ageNum < 18) return 'You must be at least 18 years old';
        if (ageNum > 100) return 'Please enter a valid age';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      const error = validateField(name as keyof SignupFormData, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name as keyof SignupFormData, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate required fields
    newErrors.name = validateField('name', formData.name);
    newErrors.email = validateField('email', formData.email);
    newErrors.password = validateField('password', formData.password);
    newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword);
    newErrors.age = validateField('age', formData.age);

    // Validate photos - minimum 2 required
    if (photos.length < 2) {
      setPhotoError('Please upload at least 2 photos to create your profile');
      setShowPhotoError(true);
      newErrors.general = 'Please complete all required fields including photos';
    } else {
      setPhotoError('');
      setShowPhotoError(false);
    }

    setErrors(newErrors);
    
    // Return true if no errors and minimum photos requirement met
    return !Object.values(newErrors).some(error => error) && photos.length >= 2;
  };

  const processFormData = () => {
    const payload: any = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      age: parseInt(formData.age)
    };

    // Add optional fields if provided
    if (formData.bio?.trim()) {
      payload.bio = formData.bio.trim();
    }
    
    if (formData.location?.trim()) {
      payload.location = formData.location.trim();
    }
    
    if (formData.interests?.trim()) {
      payload.interests = formData.interests
        .split(',')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0);
    }
    
    // Use uploaded photos
    if (photos.length > 0) {
      payload.photos = photos;
    }

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission attempt:', {
      photosCount: photos.length,
      formValid: isFormValid(),
      hasMinPhotos: photos.length >= 2
    });
    
    if (!validateForm()) {
      toast.error('Please complete all required fields including uploading at least 2 photos');
      return;
    }

    if (photos.length < 2) {
      toast.error('Please upload at least 2 photos to continue');
      setShowPhotoError(true);
      setPhotoError('At least 2 photos are required to create your profile');
      return;
    }

    setLoading(true);
    try {
      const payload = processFormData();
      console.log('Sending signup payload:', {
        ...payload,
        photos: payload.photos ? `${payload.photos.length} photos` : 'no photos'
      });
      
      await signUp(payload);
      toast.success('Account created successfully! Let\'s set up your profile.');
      // Navigate to personality quiz to start onboarding
      navigate('/personality-quiz');
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.response?.data?.errors) {
        const backendErrors: FormErrors = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.path) {
            backendErrors[err.path as keyof FormErrors] = err.msg;
          }
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
      } else if (error.response?.data?.message) {
        if (error.response.data.message.includes('email already exists')) {
          setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
        } else {
          setErrors(prev => ({ ...prev, general: error.response.data.message }));
        }
      } else {
        setErrors(prev => ({ ...prev, general: 'An unexpected error occurred. Please try again.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const basicValidation = (
      formData.name.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      parseInt(formData.age) >= 18 &&
      !Object.values(errors).some(error => error)
    );
    
    // Photo validation
    const hasMinPhotos = photos.length >= 2;
    
    console.log('Form validation:', {
      basicValidation,
      hasMinPhotos,
      photosCount: photos.length,
      photos: photos.length > 0 ? photos.slice(0, 2).map(p => p.substring(0, 50) + '...') : []
    });
    
    return basicValidation && hasMinPhotos;
  };

  return (
    <div className="min-h-screen warm-gradient flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-coral-200 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-mint-200 rounded-full opacity-30 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-peach-200 rounded-full opacity-25 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-lavender-200 rounded-full opacity-20 animate-bounce-gentle" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-warm-600 hover:text-warm-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>
        </motion.div>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-coral-400 to-peach-400 rounded-full mb-6 shadow-coral"
          >
            <Heart className="w-10 h-10 text-white" fill="currentColor" />
          </motion.div>
          <h1 className="text-4xl font-friendly font-bold text-warm-800 mb-2">Join SoulSync</h1>
          <p className="text-warm-600">Start your journey to find true connection</p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="friendly-card p-8 space-y-8"
        >
          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-red-600 text-sm">{errors.general}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Required Fields Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-warm-800 mb-4">Required Information</h3>
              
              {/* Name Field */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-warm-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none z-10" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`friendly-input w-full pl-10 pr-4 py-3 ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-warm-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none z-10" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`friendly-input w-full pl-10 pr-4 py-3 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Age Field */}
              <div className="space-y-1">
                <label htmlFor="age" className="block text-sm font-medium text-warm-700">
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none z-10" />
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min={18}
                    max={100}
                    value={formData.age}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`friendly-input w-full pl-10 pr-4 py-3 ${errors.age ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Enter your age"
                    autoComplete="age"
                  />
                </div>
                {errors.age && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.age}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-warm-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none z-10" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`friendly-input w-full pl-10 pr-12 py-3 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-warm-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none z-10" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`friendly-input w-full pl-10 pr-12 py-3 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="border-t border-peach-200 pt-6">
              <h3 className="text-lg font-semibold text-warm-800 mb-4">
                Profile Photos <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-warm-600 mb-4">
                Add at least 2 photos to make your profile stand out and attract meaningful connections
              </p>
              
              <ImageUpload
                photos={photos}
                onPhotosUpdate={setPhotos}
                maxPhotos={6}
                minPhotos={2}
                isRequired={true}
                showError={showPhotoError}
                errorMessage={photoError}
              />
            </div>

            {/* Optional Fields Section */}
            <div className="border-t border-peach-200 pt-6">
              <h3 className="text-lg font-semibold text-warm-800 mb-4">Optional Profile Details</h3>
              <p className="text-sm text-warm-600 mb-4">Help others get to know you better</p>
              
              {/* Bio Field */}
              <div className="space-y-1 mb-4">
                <label htmlFor="bio" className="block text-sm font-medium text-warm-700">
                  Tell us about yourself
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="friendly-input w-full p-3 resize-none"
                  rows={3}
                  maxLength={500}
                  placeholder="Share something about your personality, hobbies, or what you're looking for..."
                />
                <p className="text-xs text-warm-500">{formData.bio?.length || 0}/500 characters</p>
              </div>

              {/* Location Field */}
              <div className="space-y-1 mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-warm-700">
                  Where are you based?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none z-10" />
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="friendly-input w-full pl-10 pr-4 py-3"
                    maxLength={100}
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              </div>

              {/* Interests Field */}
              <div className="space-y-1 mb-4">
                <label htmlFor="interests" className="block text-sm font-medium text-warm-700">
                  Your interests
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none z-10" />
                  <input
                    id="interests"
                    name="interests"
                    type="text"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="friendly-input w-full pl-10 pr-4 py-3"
                    placeholder="hiking, music, cooking, travel"
                  />
                </div>
                <p className="text-xs text-warm-500">Separate interests with commas</p>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !isFormValid()}
              className="friendly-button w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed py-4"
            >
              {loading ? (
                <span className="loading-dots">Creating Account</span>
              ) : (
                'Create Account'
              )}
            </motion.button>

            {/* Form Status */}
            <div className="text-center">
              {!isFormValid() && (
                <div className="space-y-2">
                  <p className="text-sm text-warm-500">
                    Please complete all required fields:
                  </p>
                  <div className="text-xs text-warm-400 space-y-1">
                    {formData.name.trim().length < 2 && <p>• Enter your full name</p>}
                    {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && <p>• Enter valid email address</p>}
                    {formData.password.length < 6 && <p>• Create password (6+ characters)</p>}
                    {formData.password !== formData.confirmPassword && <p>• Passwords must match</p>}
                    {parseInt(formData.age) < 18 && <p>• Enter your age (18+)</p>}
                    {photos.length < 2 && <p>• Upload at least 2 photos ({photos.length}/2)</p>}
                  </div>
                </div>
              )}
              {isFormValid() && !loading && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Ready to create your account!
                </p>
              )}
            </div>
          </form>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="text-warm-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-coral-500 hover:text-coral-600 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupForm;