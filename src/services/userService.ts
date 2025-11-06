import api from '../lib/apiClient';
import type { 
  UpdateUserRequest, 
  RoleAssignmentRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from '../types/api';

// Image size constants (must match backend)
const MIN_IMAGE_SIZE = 1024;  // 1KB
const MAX_IMAGE_SIZE = 5_242_880;  // 5MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff'
];

export const userService = {
  getCurrentProfile() {
    // Correct Path: /users/me
    return api.get('/users/me');
  },
  getAllUsers() {
    // Correct Path: /users
    return api.get('/users');
  },
  getUserByUsername(username: string) {
    // Correct Path: /users/{username}
    return api.get(`/users/${encodeURIComponent(username)}`);
  },
  updateUser(username: string, payload: UpdateUserRequest) {
    return api.put(`/users/${encodeURIComponent(username)}`, payload);
  },
  deleteUser(username: string) {
    return api.delete(`/users/${encodeURIComponent(username)}`);
  },
  enableUser(username: string) {
    return api.post(`/users/${encodeURIComponent(username)}/enable`);
  },
  disableUser(username: string) {
    return api.post(`/users/${encodeURIComponent(username)}/disable`);
  },
  unlockUser(username: string) {
    return api.post(`/users/${encodeURIComponent(username)}/unlock`);
  },
  manageUserRole(username: string, payload: RoleAssignmentRequest) {
    return api.post(`/users/${encodeURIComponent(username)}/roles`, payload);
  },
  resetUserPassword(username: string, payload: ResetPasswordRequest) {
    return api.post(`/users/${encodeURIComponent(username)}/reset-password`, payload);
  },
  changeCurrentUserPassword(payload: ChangePasswordRequest) {
    // Correct Path: /users/me/change-password
    return api.post('/users/me/change-password', payload);
  },
  updateProfile(fullName: string, phone: string, address: string) {
    return api.put('/users/profile', { fullName, phone, address });
  },
  uploadProfilePhoto(photoUrl: string) {
    return api.post('/users/profile/photo', { photoUrl });
  },

  // New BLOB-based profile photo endpoints with caching support
  /**
   * Upload profile photo as base64 BLOB
   * - Converts image to base64
   * - Stores as binary data in database
   * - Automatically invalidates cache
   */
  uploadProfilePhotoBlob(base64Image: string, mimeType: string = 'image/jpeg') {
    return api.post('/users/profile-photo', { base64Image, mimeType });
  },

  /**
   * Get current user's profile photo
   * - Returns base64 encoded image
   * - Cached for performance (only refreshed when updated)
   */
  getProfilePhoto() {
    return api.get('/users/profile-photo');
  },

  /**
   * Get profile photo as binary stream
   * - Returns raw image bytes with Content-Type header
   * - Useful for direct image display
   */
  getProfilePhotoBinary() {
    return api.get('/users/profile-photo/binary', { responseType: 'blob' });
  },

  /**
   * Get profile photo metadata for cache validation
   * - Returns size, MIME type, and last update timestamp
   * - Use for conditional requests (If-Modified-Since)
   */
  getProfilePhotoMetadata() {
    return api.get('/users/profile-photo/metadata');
  },

  /**
   * Delete user's profile photo
   * - Removes image from database
   * - Clears cache
   */
  deleteProfilePhoto() {
    return api.delete('/users/profile-photo');
  },

  // Image conversion utilities
  /**
   * Convert File to base64 for upload
   * Useful for image input handlers
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate image file before upload
   * Checks MIME type, size, and format
   */
  validateImageFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
    // Check MIME type
    if (!file.type || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, GIF, WebP, BMP, TIFF`
      };
    }

    // Check minimum size
    if (file.size < MIN_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Image is too small (${this.formatFileSize(file.size)}). Minimum: ${this.formatFileSize(MIN_IMAGE_SIZE)}`
      };
    }

    // Check maximum size (use parameter if provided)
    const maxSizeBytes = maxSizeMB * 1_048_576;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `Image size (${this.formatFileSize(file.size)}) exceeds limit of ${maxSizeMB}MB`
      };
    }

    return { valid: true };
  },

  /**
   * Format file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1_073_741_824) return (bytes / 1_048_576).toFixed(2) + ' MB';
    return (bytes / 1_073_741_824).toFixed(2) + ' GB';
  },

  /**
   * Check if file is a valid image without uploading
   */
  validateImageFormat(file: File): Promise<{ valid: boolean; width?: number; height?: number; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          valid: true,
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          valid: false,
          error: 'Invalid image file or corrupted data'
        });
      };

      img.src = objectUrl;
    });
  },

  getUserPreferences() {
    return api.get('/users/preferences');
  },
  updateUserPreferences(preferences: any) {
    return api.put('/users/preferences', preferences);
  },
};

export default userService;
