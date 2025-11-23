"use client";

import React, { useState, useRef } from "react";
import Image from 'next/image';
import useProfilePhotoCache from "@/lib/useProfilePhotoCache";
import userService from "@/services/userService";

interface ProfilePhotoUploadProps {
  onUploadSuccess?: (photoData: unknown) => void;
  onDeleteSuccess?: () => void;
  showPreview?: boolean;
  maxSizeMB?: number;
  className?: string;
}

/**
 * Profile Photo Upload Component
 * Features:
 * - Drag and drop support
 * - Image preview before upload
 * - BLOB storage with automatic caching
 * - Cache invalidation on update
 * - Progress feedback
 */
export default function ProfilePhotoUpload({
  onUploadSuccess,
  onDeleteSuccess,
  showPreview = true,
  maxSizeMB = 5,
  className = "",
}: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { photo, loading, error, uploadPhoto, deletePhoto } =
    useProfilePhotoCache();

  // Handle file selection (both input and drag-drop)
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Validate file
      const validation = userService.validateImageFile(file, maxSizeMB);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid file");
        return;
      }

      // Show preview
      if (showPreview) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload
      const result = await uploadPhoto(file);
      setUploadSuccess(true);
      setUploadError(null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Callback
      onUploadSuccess?.(result);

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your profile photo?")) {
      try {
        await deletePhoto();
        setPreviewUrl(null);
        onDeleteSuccess?.();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete photo";
        setUploadError(message);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          dragActive
            ? "theme-border-primary theme-bg-secondary"
            : "theme-border theme-bg-primary hover:theme-bg-hover"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="text-center">
          <div className="text-4xl mb-2">📸</div>
          <p className="text-lg font-semibold theme-text-primary">
            Drag and drop your photo here
          </p>
          <p className="text-sm theme-text-muted">
            or click to select a file (Max {maxSizeMB}MB)
          </p>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (previewUrl || photo) && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Preview:</p>
          <div className="relative w-full max-w-xs mx-auto rounded-lg overflow-hidden border border-gray-200">
            <Image src={previewUrl || photo || ""} alt="Profile preview" width={400} height={300} className="w-full h-auto object-cover" />
          </div>
        </div>
      )}

      {/* Messages */}
      {uploadError && (
        <div className="theme-alert-danger text-sm">
          ❌ {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="theme-alert-success text-sm">
          ✅ Photo uploaded successfully!
        </div>
      )}

      {error && (
        <div className="theme-alert-warning text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="theme-alert-info text-sm">
          ⏳ Processing...
        </div>
      )}

      {/* Delete Button */}
      {photo && !previewUrl && (
        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
        >
          Delete Current Photo
        </button>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>✓ Supported formats: JPG, PNG, GIF, WebP</p>
        <p>✓ Maximum file size: {maxSizeMB}MB</p>
        <p>✓ Images are stored securely as BLOB data</p>
        <p>✓ Cached locally for fast loading</p>
      </div>
    </div>
  );
}
