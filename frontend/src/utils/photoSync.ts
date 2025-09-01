// Photo sync utility for uploading local photos after authentication
import api from '../services/api';
import toast from 'react-hot-toast';

export interface LocalPhoto {
  base64Data: string;
  filename: string;
  mimetype: string;
}

// Sync locally stored photos to the server after successful login
export const syncPhotosAfterLogin = async (localPhotos: string[]): Promise<string[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('No auth token found for photo sync');
    return localPhotos;
  }

  const photoUrls: string[] = [];
  let uploadedCount = 0;

  for (const photo of localPhotos) {
    // Skip if photo is already uploaded (doesn't start with data:)
    if (!photo.startsWith('data:image/')) {
      photoUrls.push(photo);
      continue;
    }

    try {
      const response = await api.post('/images/upload', {
        image: photo,
        filename: `synced-photo-${Date.now()}.jpg`,
        mimetype: 'image/jpeg'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        photoUrls.push(response.data.data.imageUrl);
        uploadedCount++;
      } else {
        // Keep local version if upload fails
        photoUrls.push(photo);
        console.error('Photo sync failed:', response.data.message);
      }
    } catch (error: any) {
      console.error('Photo sync error:', error);
      // Keep local version if upload fails
      photoUrls.push(photo);
    }
  }

  if (uploadedCount > 0) {
    toast.success(`Successfully synced ${uploadedCount} photo(s) to your profile!`);
  }

  return photoUrls;
};

// Get user's photos from server
export const fetchUserPhotos = async (): Promise<string[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }

  try {
    const response = await api.get('/images/upload', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      return response.data.data.photos.map((photo: any) => photo.url);
    }
  } catch (error: any) {
    console.error('Failed to fetch user photos:', error);
  }

  return [];
};

// Delete photo from server
export const deleteUserPhoto = async (photoUrl: string, photoIndex: number): Promise<boolean> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  // For local photos (base64), just return true to allow local deletion
  if (photoUrl.startsWith('data:image/')) {
    return true;
  }

  try {
    // Extract image ID from server response if available
    // This would need to be stored when the photo was uploaded
    const response = await api.delete('/images/upload', {
      data: {
        imageId: 'placeholder-id' // This should be the actual image ID
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.success;
  } catch (error: any) {
    console.error('Failed to delete photo from server:', error);
    return false;
  }
};