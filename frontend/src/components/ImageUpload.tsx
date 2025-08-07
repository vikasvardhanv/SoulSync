// frontend/src/components/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera, Move, Loader, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { imagesAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  photos: string[];
  onPhotosUpdate: (photos: string[]) => void;
  maxPhotos?: number;
  minPhotos?: number;
  className?: string;
  isRequired?: boolean;
  showError?: boolean;
  errorMessage?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  photos,
  onPhotosUpdate,
  maxPhotos = 6,
  minPhotos = 2,
  className = '',
  isRequired = true,
  showError = false,
  errorMessage = `Please upload at least ${minPhotos} photos`
}) => {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size limits
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const RECOMMENDED_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_DIMENSION = 2048; // pixels

  // Validation function
  const validatePhotos = (currentPhotos: string[]): boolean => {
    if (isRequired && currentPhotos.length < minPhotos) {
      setValidationError(`At least ${minPhotos} photos are required`);
      return false;
    }
    setValidationError('');
    return true;
  };

  // Enhanced file validation
  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }

    // Check file size with detailed feedback
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${fileSizeMB}MB) exceeds 10MB limit. Please compress your image or choose a smaller one.`;
    }

    if (file.size > RECOMMENDED_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      console.warn(`Large file detected: ${fileSizeMB}MB. Consider compressing for faster upload.`);
    }

    return null;
  };

  // Image compression function
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.8 // 80% quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast.error(`Can only add ${remainingSlots} more photos (max ${maxPhotos})`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const fileArray = Array.from(files);
      let processedFiles: File[] = [];
      
      // Validate and optionally compress files
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress((i / fileArray.length) * 30); // 30% for processing
        
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          setUploading(false);
          setUploadProgress(0);
          return;
        }

        // Auto-compress large files
        if (file.size > RECOMMENDED_SIZE) {
          toast.info(`Compressing ${file.name} for optimal upload...`);
          const compressedFile = await compressImage(file);
          processedFiles.push(compressedFile);
        } else {
          processedFiles.push(file);
        }
      }

      setUploadProgress(40); // 40% for upload preparation

      // Upload files
      for (let i = 0; i < processedFiles.length; i++) {
        const file = processedFiles[i];
        const formData = new FormData();
        formData.append('image', file);

        try {
          setUploadProgress(40 + ((i + 1) / processedFiles.length) * 60); // 40-100%
          
          const response = await imagesAPI.uploadSingle(formData);
          
          if (response.data.success) {
            const newPhotos = [...photos, response.data.data.imageUrl];
            onPhotosUpdate(newPhotos);
            validatePhotos(newPhotos);
          } else {
            throw new Error(response.data.message || 'Upload failed');
          }
        } catch (uploadError: any) {
          console.error('Upload error for file:', file.name, uploadError);
          
          // Handle specific error types
          if (uploadError.response?.status === 413) {
            toast.error(
              `${file.name} is too large for upload. Please compress it to under 5MB.`,
              { duration: 6000 }
            );
          } else if (uploadError.response?.status === 500) {
            toast.error(
              `Server error uploading ${file.name}. Please try again or contact support.`,
              { duration: 6000 }
            );
          } else {
            toast.error(
              uploadError.response?.data?.message || 
              `Failed to upload ${file.name}. Please try again.`
            );
          }
        }
      }

      if (processedFiles.length > 0) {
        toast.success(`Successfully uploaded ${processedFiles.length} photo(s)!`);
      }
      
    } catch (error: any) {
      console.error('File processing error:', error);
      toast.error('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const deletePhoto = async (photoUrl: string, index: number) => {
    try {
      const response = await imagesAPI.deletePhoto({ imageUrl: photoUrl });
      
      if (response.data.success) {
        const newPhotos = photos.filter((_, i) => i !== index);
        onPhotosUpdate(newPhotos);
        validatePhotos(newPhotos);
        toast.success('Photo deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete photo');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete photo');
    }
  };

  // File size formatter
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if requirements are met
  const isValid = photos.length >= minPhotos;
  const hasError = (showError || validationError) && !isValid;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !uploading && !photos.length >= maxPhotos && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          hasError
            ? 'border-red-300 bg-red-50 hover:border-red-400'
            : photos.length >= maxPhotos
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : uploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-warm-300 hover:border-coral-400 hover:bg-coral-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading || photos.length >= maxPhotos}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-warm-600">Processing images...</p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-warm-500">{Math.round(uploadProgress)}% complete</p>
          </div>
        ) : photos.length >= maxPhotos ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <p className="text-warm-600">Maximum {maxPhotos} photos reached</p>
            <p className="text-sm text-warm-500">Delete a photo to add new ones</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className={`w-8 h-8 ${hasError ? 'text-red-500' : 'text-coral-500'}`} />
            <div>
              <p className={`font-medium ${hasError ? 'text-red-700' : 'text-warm-700'}`}>
                Drop photos here or click to upload
              </p>
              <p className={`text-sm ${hasError ? 'text-red-600' : 'text-warm-500'}`}>
                {photos.length}/{maxPhotos} photos • Minimum {minPhotos} required
              </p>
            </div>
            <div className="bg-warm-100 rounded-lg p-3 mt-2">
              <p className="text-xs text-warm-600 font-medium mb-1">📸 Photo Tips:</p>
              <ul className="text-xs text-warm-600 space-y-1">
                <li>• Maximum 10MB per photo</li>
                <li>• JPEG, PNG, or WebP formats</li>
                <li>• High quality photos get more matches!</li>
                <li>• We'll automatically optimize large photos</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Validation Error */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-red-600 text-sm font-medium">
                {validationError || errorMessage}
              </p>
              <p className="text-red-500 text-xs mt-1">
                Add at least {minPhotos - photos.length} more photo(s) to continue
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {isValid && photos.length >= minPhotos && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-green-600 text-sm">
            Perfect! You've added {photos.length} photo{photos.length > 1 ? 's' : ''}
          </p>
        </motion.div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {photos.map((photo, index) => (
              <motion.div
                key={photo}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square rounded-xl overflow-hidden bg-warm-100 border-2 border-transparent hover:border-coral-300 transition-all"
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Photo Index */}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
                
                {/* Controls */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(photo, index);
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="p-2 bg-white/20 text-white rounded-full cursor-move">
                    <Move className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Primary Photo Indicator */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-coral-500 text-white text-xs px-2 py-1 rounded-full">
                    Primary
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Instructions */}
      {photos.length > 0 && (
        <div className="bg-peach-50 border border-peach-200 rounded-lg p-3">
          <p className="text-sm text-warm-600">
            <Camera className="w-4 h-4 inline mr-1" />
            Drag photos to reorder. Your first photo will be your main profile picture.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;