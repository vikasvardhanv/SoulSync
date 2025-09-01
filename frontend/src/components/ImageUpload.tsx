// frontend/src/components/ImageUpload.tsx - Updated for base64 upload
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface ImageUploadProps {
  photos: string[]; // Array of image data URLs
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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${fileSizeMB}MB) exceeds 5MB limit`;
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
    setValidationError(''); // Clear any previous errors
    
    try {
      const fileArray = Array.from(files);
      
      // Validate files first
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
          setUploading(false);
          return;
        }
      }

      console.log(`Starting to process ${fileArray.length} files...`);

      // Process files using base64 API
      const uploadPromises = fileArray.map(async (file, index) => {
        console.log(`Processing file ${index + 1}/${fileArray.length}: ${file.name}`);
        
        try {
          // Convert file to base64 with robust error handling
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            
            // Set a timeout for file reading (30 seconds max)
            const timeout = setTimeout(() => {
              reject(new Error(`File reading timeout: ${file.name}`));
            }, 30000);
            
            reader.onload = (e) => {
              clearTimeout(timeout);
              const result = e.target?.result;
              if (typeof result === 'string' && result.startsWith('data:')) {
                console.log(`✅ Successfully converted ${file.name} to base64 (${Math.round(result.length / 1024)}KB)`);
                resolve(result);
              } else {
                console.error(`❌ Invalid result for ${file.name}:`, typeof result);
                reject(new Error(`Invalid file data: ${file.name}`));
              }
            };
            
            reader.onerror = (e) => {
              clearTimeout(timeout);
              console.error(`❌ FileReader error for ${file.name}:`, e);
              reject(new Error(`Cannot read file: ${file.name}. File may be corrupted.`));
            };
            
            reader.onabort = () => {
              clearTimeout(timeout);
              console.error(`❌ File reading aborted: ${file.name}`);
              reject(new Error(`File reading was cancelled: ${file.name}`));
            };
            
            // Validate file before reading
            if (!file || file.size === 0) {
              clearTimeout(timeout);
              reject(new Error(`Empty or invalid file: ${file.name}`));
              return;
            }
            
            // Start reading the file
            try {
              reader.readAsDataURL(file);
            } catch (readError) {
              clearTimeout(timeout);
              reject(new Error(`Cannot start reading file: ${file.name}`));
            }
          });
          
          // Try to upload via API if authenticated
          const token = localStorage.getItem('token');
          if (token) {
            try {
              console.log(`Attempting API upload for ${file.name}`);
              const response = await api.post('/images/upload', {
                image: base64Data,
                filename: file.name,
                mimetype: file.type
              }, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.data.success) {
                console.log(`API upload successful for ${file.name}`);
                toast.success(`${file.name} uploaded successfully`);
                return response.data.data.imageUrl;
              }
            } catch (uploadError: any) {
              console.error(`API upload error for ${file.name}:`, uploadError);
              
              if (uploadError.response?.status === 401) {
                console.log(`Auth expired for ${file.name}, using local storage`);
                toast.info(`${file.name} saved locally - will sync after login`);
              } else {
                const errorMessage = uploadError.response?.data?.message || uploadError.message;
                console.log(`Upload failed for ${file.name}: ${errorMessage}`);
                toast.info(`${file.name} saved locally - will sync after login`);
              }
            }
          } else {
            console.log(`No auth token, saving ${file.name} locally`);
            toast.info(`${file.name} saved locally - will upload after login`);
          }
          
          // Always return base64 for immediate display
          console.log(`Returning base64 data for ${file.name}`);
          return base64Data;
          
        } catch (error: any) {
          console.error(`File processing error for ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}: ${error.message}`);
          throw error;
        }
      });

      // Process files individually to avoid Promise.all() failing everything
      const uploadedUrls: string[] = [];
      const failedFiles: string[] = [];
      
      console.log('Processing files individually...');
      for (let i = 0; i < uploadPromises.length; i++) {
        try {
          const result = await uploadPromises[i];
          uploadedUrls.push(result);
          console.log(`Successfully processed file ${i + 1}/${uploadPromises.length}`);
        } catch (error: any) {
          const fileName = fileArray[i]?.name || `file-${i + 1}`;
          failedFiles.push(fileName);
          console.error(`Failed to process file ${i + 1} (${fileName}):`, error);
        }
      }
      
      console.log(`Processing complete: ${uploadedUrls.length} successful, ${failedFiles.length} failed`);
      
      // Update photos with successful uploads only
      if (uploadedUrls.length > 0) {
        const newPhotos = [...photos, ...uploadedUrls];
        onPhotosUpdate(newPhotos);
        
        if (isRequired && newPhotos.length >= minPhotos) {
          setValidationError('');
        }
        
        toast.success(`Successfully added ${uploadedUrls.length} photo(s)!`);
      }
      
      // Handle failed uploads
      if (failedFiles.length > 0) {
        const errorMsg = `Failed to process ${failedFiles.length} file(s): ${failedFiles.join(', ')}`;
        console.error(errorMsg);
        toast.error(`Some files failed to upload. Please try again.`);
        
        // Only show validation error if we still don't have enough photos
        if ((photos.length + uploadedUrls.length) < minPhotos) {
          setValidationError(`Need ${minPhotos - photos.length - uploadedUrls.length} more photo(s)`);
        }
      }
      
    } catch (error: any) {
      console.error('Unexpected upload error:', error);
      toast.error('Upload failed. Please try again.');
      setValidationError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
      // Clear the input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const deletePhoto = async (photo: string, index: number) => {
    try {
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

  // Debug logging
  React.useEffect(() => {
    console.log('ImageUpload - Photos updated:', {
      count: photos.length,
      isValid: photos.length >= minPhotos,
      photos: photos.length > 0 ? photos.slice(0, 2).map(p => p.substring(0, 50) + '...') : []
    });
  }, [photos, minPhotos]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 space-y-2">
          <div>Debug: {photos.length}/{maxPhotos} photos | Valid: {photos.length >= minPhotos ? 'Yes' : 'No'} | Uploading: {uploading ? 'Yes' : 'No'}</div>
          <button
            onClick={async () => {
              try {
                // Create a test image
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#ff7a6b';
                  ctx.fillRect(0, 0, 200, 200);
                  ctx.fillStyle = 'white';
                  ctx.font = '16px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('Test Photo', 100, 100);
                }
                
                canvas.toBlob((blob) => {
                  if (blob) {
                    const file = new File([blob], 'test-photo.png', { type: 'image/png' });
                    handleFileSelect(new DataTransfer().files);
                    // Create FileList manually
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    handleFileSelect(dt.files);
                  }
                });
              } catch (error) {
                console.error('Test upload failed:', error);
              }
            }}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            disabled={uploading}
          >
            Add Test Photo
          </button>
        </div>
      )}
      
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
            <Loader className="w-8 h-8 text-coral-500 animate-spin" />
            <p className="text-warm-800 font-medium">Uploading images...</p>
          </div>
        ) : photos.length >= maxPhotos ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <p className="text-warm-800 font-medium">Maximum {maxPhotos} photos reached</p>
            <p className="text-sm text-warm-700">Delete a photo to add new ones</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className={`w-8 h-8 ${hasError ? 'text-red-500' : 'text-coral-500'}`} />
            <div className="text-center">
              <p className={`font-semibold text-lg ${hasError ? 'text-red-800' : 'text-warm-800'}`}>
                Upload your photos
              </p>
              <p className={`text-sm font-medium ${hasError ? 'text-red-700' : 'text-warm-700'}`}>
                {photos.length}/{maxPhotos} photos • Minimum {minPhotos} required
              </p>
            </div>
            <button
              type="button"
              onClick={handleBrowseClick}
              disabled={uploading || photos.length >= maxPhotos}
              className="px-8 py-3 bg-coral-500 text-white rounded-xl hover:bg-coral-600 active:bg-coral-700 transition-colors font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Choose Files
            </button>
            <div className="bg-warm-100 border border-warm-200 rounded-xl p-4 mt-2 max-w-xs">
              <p className="text-sm text-warm-800 font-semibold mb-2">📸 Photo Tips:</p>
              <ul className="text-sm text-warm-700 space-y-1">
                <li>• Maximum 5MB per photo</li>
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
          className="bg-red-50 border border-red-300 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 text-sm font-semibold">
                {validationError || errorMessage}
              </p>
              <p className="text-red-700 text-sm mt-1">
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
          className="bg-green-50 border border-green-300 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 text-sm font-medium">
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