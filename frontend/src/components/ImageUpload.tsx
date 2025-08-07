// frontend/src/components/ImageUpload.tsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { imagesAPI } from '../services/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  photos: string[]; // Array of image IDs or data URLs
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
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${fileSizeMB}MB) exceeds 10MB limit`;
    }

    return null;
  };

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    if (files.length > remainingSlots) {
      toast.error(`Can only add ${remainingSlots} more photos (max ${maxPhotos})`);
      return;
    }

    setUploading(true);
    
    try {
      const fileArray = Array.from(files);
      
      // Validate files
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          setUploading(false);
          return;
        }
      }

      // Upload files
      const uploadPromises = fileArray.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await imagesAPI.uploadSingle(formData);
          
          if (response.data.success) {
            return response.data.data.imageUrl; // This will be a data URL for immediate display
          } else {
            throw new Error(response.data.message || 'Upload failed');
          }
        } catch (uploadError: any) {
          console.error(`Upload error for file ${file.name}:`, uploadError);
          toast.error(`Failed to upload ${file.name}`);
          throw uploadError;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newPhotos = [...photos, ...uploadedUrls];
      onPhotosUpdate(newPhotos);
      
      if (isRequired && newPhotos.length >= minPhotos) {
        setValidationError('');
      }

      toast.success(`Successfully uploaded ${uploadedUrls.length} photo(s)!`);
      
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const deletePhoto = async (photo: string, index: number) => {
    try {
      // If it's an image ID (not a data URL), use the delete API
      if (!photo.startsWith('data:')) {
        await imagesAPI.deletePhoto({ imageId: photo });
      }
      
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosUpdate(newPhotos);
      toast.success('Photo deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const isValid = photos.length >= minPhotos;
  const hasError = (showError || validationError) && !isValid;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          hasError
            ? 'border-red-300 bg-red-50'
            : photos.length >= maxPhotos
            ? 'border-gray-300 bg-gray-50'
            : uploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-warm-300 hover:border-coral-400 hover:bg-coral-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={uploading || photos.length >= maxPhotos}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-warm-600">Uploading images...</p>
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
                Upload your photos
              </p>
              <p className={`text-sm ${hasError ? 'text-red-600' : 'text-warm-500'}`}>
                {photos.length}/{maxPhotos} photos • Minimum {minPhotos} required
              </p>
            </div>
            <button
              type="button"
              onClick={handleBrowseClick}
              disabled={uploading || photos.length >= maxPhotos}
              className="px-6 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Choose Files
            </button>
            <div className="bg-warm-100 rounded-lg p-3 mt-2">
              <p className="text-xs text-warm-600 font-medium mb-1">📸 Photo Tips:</p>
              <ul className="text-xs text-warm-600 space-y-1">
                <li>• Maximum 10MB per photo</li>
                <li>• JPEG, PNG, or WebP formats</li>
                <li>• High quality photos get more matches!</li>
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
                key={`${photo}-${index}`}
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
                
                {/* Delete Button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(photo, index);
                    }}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
    </div>
  );
};

export default ImageUpload;