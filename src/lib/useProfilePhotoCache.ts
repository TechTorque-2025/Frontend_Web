import { useEffect, useState, useRef } from 'react';
import userService from '../services/userService';

/**
 * Hook for managing cached profile photos
 * - Stores photo in localStorage with metadata
 * - Automatically invalidates cache when photo is updated
 * - Reduces network requests for frequently viewed photos
 */
export const useProfilePhotoCache = (userId?: string) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const cacheKeyRef = useRef(`profile_photo_${userId}`);
  const metadataCacheKeyRef = useRef(`profile_photo_metadata_${userId}`);

  /**
   * Load photo from cache or server
   */
  const loadPhoto = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check localStorage cache first
      if (!forceRefresh) {
        const cachedPhoto = localStorage.getItem(cacheKeyRef.current);
        const cachedMetadata = localStorage.getItem(metadataCacheKeyRef.current);

        if (cachedPhoto && cachedMetadata) {
          const metadata = JSON.parse(cachedMetadata);

          // Cache is valid if it's less than 1 hour old
          const cacheAge = Date.now() - metadata.cachedAt;
          if (cacheAge < 3600000) { // 1 hour in milliseconds
            setPhoto(cachedPhoto);
            setMetadata(metadata);
            setLoading(false);
            return;
          }
        }
      }

      // Fetch from server
      const response = await userService.getProfilePhoto();
      const photoData = response.data;

      if (photoData && photoData.base64Image) {
        // Convert base64 to data URL for img src
        const dataUrl = `data:${photoData.mimeType};base64,${photoData.base64Image}`;

        const cacheMetadata = {
          userId: photoData.userId,
          mimeType: photoData.mimeType,
          fileSize: photoData.fileSize,
          lastUpdated: photoData.lastUpdated,
          cachedAt: Date.now(),
        };

        // Store in localStorage
        localStorage.setItem(cacheKeyRef.current, dataUrl);
        localStorage.setItem(metadataCacheKeyRef.current, JSON.stringify(cacheMetadata));

        setPhoto(dataUrl);
        setMetadata(cacheMetadata);
      }
    } catch (err) {
      // No photo available or error occurred
      if (err instanceof Error && !err.message.includes('204')) {
        setError(err.message);
      }
      setPhoto(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload new photo and invalidate cache
   */
  const uploadPhoto = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      // Validate file
      const validation = userService.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid image file');
      }

      // Convert to base64
      const dataUrl = await userService.fileToBase64(file);
      const mimeType = file.type;

      // Extract pure base64 from data URL (remove "data:image/jpeg;base64," prefix)
      const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;

      // Upload
      const response = await userService.uploadProfilePhotoBlob(base64, mimeType);

      // Invalidate cache
      localStorage.removeItem(cacheKeyRef.current);
      localStorage.removeItem(metadataCacheKeyRef.current);

      // Reload photo
      await loadPhoto(true);

      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload photo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete photo and clear cache
   */
  const deletePhoto = async () => {
    setLoading(true);
    setError(null);

    try {
      await userService.deleteProfilePhoto();

      // Clear cache
      localStorage.removeItem(cacheKeyRef.current);
      localStorage.removeItem(metadataCacheKeyRef.current);

      setPhoto(null);
      setMetadata(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete photo';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if cache needs refresh based on server metadata
   */
  const checkIfCacheNeedsRefresh = async () => {
    try {
      const serverMetadata = await userService.getProfilePhotoMetadata();
      const localMetadata = metadata;

      if (
        localMetadata &&
        serverMetadata &&
        serverMetadata.lastUpdated !== localMetadata.lastUpdated
      ) {
        // Photo was updated on server, refresh cache
        await loadPhoto(true);
      }
    } catch (err) {
      // Silently fail - not critical
      console.debug('Cache validation check failed:', err);
    }
  };

  return {
    photo,
    loading,
    error,
    metadata,
    loadPhoto,
    uploadPhoto,
    deletePhoto,
    checkIfCacheNeedsRefresh,
  };
};

export default useProfilePhotoCache;
