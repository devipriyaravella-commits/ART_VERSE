import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageUploadOptions {
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const DEFAULT_MAX_PROFILE_SIZE = 5 * 1024 * 1024; // 5 MB
const DEFAULT_MAX_COVER_SIZE = 10 * 1024 * 1024; // 10 MB
const DEFAULT_MAX_ARTWORK_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * Cleanly sanitize filenames to prevent collisions and illegal characters
 */
function sanitizeFileName(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Validates uploaded image file type and size
 */
export function validateImageFile(
  file: File,
  maxSizeBytes: number = DEFAULT_MAX_ARTWORK_SIZE,
  allowedMimeTypes: string[] = DEFAULT_ALLOWED_TYPES
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided for upload.' };
  }

  // Type validation
  const fileType = file.type?.toLowerCase();
  const fileExt = file.name ? file.name.split('.').pop()?.toLowerCase() : '';
  const validExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt || '');

  if (!allowedMimeTypes.includes(fileType) && !validExtension) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a JPG, PNG, or WEBP image.'
    };
  }

  // Size validation
  if (file.size > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). The maximum limit is ${maxMB}MB.`
    };
  }

  return { valid: true };
}

/**
 * Extracts storage relative file path from public Supabase URL
 */
export function extractStoragePath(url: string, bucket: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index !== -1) {
    return decodeURIComponent(url.substring(index + marker.length));
  }
  return null;
}

export const storageService = {
  /**
   * Validate image before uploading
   */
  validateFile(file: File, type: 'profile' | 'cover' | 'artwork'): FileValidationResult {
    let limit = DEFAULT_MAX_ARTWORK_SIZE;
    if (type === 'profile') limit = DEFAULT_MAX_PROFILE_SIZE;
    if (type === 'cover') limit = DEFAULT_MAX_COVER_SIZE;
    return validateImageFile(file, limit);
  },

  /**
   * Upload Profile Avatar
   * Stores under: profile-images/{userId}/avatar-{timestamp}.ext
   * Updates profiles.avatar_url in Supabase
   */
  async uploadProfileAvatar(file: File, userId: string): Promise<{ publicUrl: string }> {
    const validation = this.validateFile(file, 'profile');
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    if (!isSupabaseConfigured()) {
      // In offline / preview mode: read as object URL or base64 data url
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ publicUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) {
        throw new Error('Unable to upload profile picture. Please verify your connection and try again.');
      }

      const { data } = supabase.storage.from('profile-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update database profile record
      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);
      } catch (dbErr) {
        console.warn('Profile avatar DB update notice:', dbErr);
      }

      return { publicUrl };
    } catch (err: any) {
      const userMsg = err?.message?.includes('Unable to upload')
        ? err.message
        : 'Image upload failed. Please try again with a standard JPG or PNG image.';
      throw new Error(userMsg);
    }
  },

  /**
   * Delete Profile Avatar
   */
  async deleteProfileAvatar(userId: string, currentAvatarUrl?: string): Promise<boolean> {
    if (isSupabaseConfigured() && currentAvatarUrl) {
      const path = extractStoragePath(currentAvatarUrl, 'profile-images');
      if (path) {
        try {
          await supabase.storage.from('profile-images').remove([path]);
        } catch {}
      }

      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: null })
          .eq('id', userId);
      } catch {}
    }
    return true;
  },

  /**
   * Upload Cover Image
   * Stores under: cover-images/{userId}/cover-{timestamp}.ext
   * Updates profiles.cover_url in Supabase
   */
  async uploadCoverImage(file: File, userId: string): Promise<{ publicUrl: string }> {
    const validation = this.validateFile(file, 'cover');
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    if (!isSupabaseConfigured()) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ publicUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${userId}/cover-${Date.now()}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('cover-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) {
        throw new Error('Unable to upload cover image. Please verify your connection and try again.');
      }

      const { data } = supabase.storage.from('cover-images').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Update database profile cover_url
      try {
        await supabase
          .from('profiles')
          .update({ cover_url: publicUrl })
          .eq('id', userId);
      } catch (dbErr) {
        console.warn('Cover image DB update notice:', dbErr);
      }

      return { publicUrl };
    } catch (err: any) {
      const userMsg = err?.message?.includes('Unable to upload')
        ? err.message
        : 'Cover image upload failed. Please try again with a standard JPG or PNG image.';
      throw new Error(userMsg);
    }
  },

  /**
   * Delete Cover Image
   */
  async deleteCoverImage(userId: string, currentCoverUrl?: string): Promise<boolean> {
    if (isSupabaseConfigured() && currentCoverUrl) {
      const path = extractStoragePath(currentCoverUrl, 'cover-images');
      if (path) {
        try {
          await supabase.storage.from('cover-images').remove([path]);
        } catch {}
      }

      try {
        await supabase
          .from('profiles')
          .update({ cover_url: null })
          .eq('id', userId);
      } catch {}
    }
    return true;
  },

  /**
   * Upload Artwork Image
   * Stores under: artwork-images/{artistId}/{artworkId}/{timestamp}-{cleanFileName}
   */
  async uploadArtworkImage(
    file: File,
    artistId: string,
    artworkId?: string
  ): Promise<{ publicUrl: string; filePath: string }> {
    const validation = this.validateFile(file, 'artwork');
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    if (!isSupabaseConfigured()) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            publicUrl: reader.result as string,
            filePath: `local/${Date.now()}`
          });
        };
        reader.readAsDataURL(file);
      });
    }

    const safeName = sanitizeFileName(file.name || 'artwork.jpg');
    const folder = artworkId || 'new';
    const filePath = `${artistId}/${folder}/${Date.now()}-${safeName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('artwork-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg'
        });

      if (uploadError) {
        throw new Error('Unable to upload artwork image. Please verify your connection and try again.');
      }

      const { data } = supabase.storage.from('artwork-images').getPublicUrl(filePath);
      return { publicUrl: data.publicUrl, filePath };
    } catch (err: any) {
      const userMsg = err?.message?.includes('Unable to upload')
        ? err.message
        : 'Artwork image upload failed. Please try again with a valid JPG, PNG, or WEBP file.';
      throw new Error(userMsg);
    }
  },

  /**
   * Delete Artwork Image from Storage
   */
  async deleteArtworkImage(imageUrl: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !imageUrl) return false;
    const path = extractStoragePath(imageUrl, 'artwork-images');
    if (path) {
      const { error } = await supabase.storage.from('artwork-images').remove([path]);
      if (error) {
        console.warn('Could not remove file from artwork-images:', error.message);
        return false;
      }
      return true;
    }
    return false;
  }
};
