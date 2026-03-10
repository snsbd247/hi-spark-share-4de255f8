/**
 * Storage Abstraction Layer
 * 
 * Currently backed by Supabase Storage.
 * Swap this implementation to use local filesystem, S3, or any other
 * storage provider when migrating away from Supabase.
 * 
 * All file operations go through this module — no direct supabase.storage
 * calls should exist elsewhere in the codebase.
 */

import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  publicUrl: string;
  path: string;
}

export interface StorageProvider {
  upload(bucket: string, path: string, file: File, options?: { upsert?: boolean }): Promise<UploadResult>;
  getPublicUrl(bucket: string, path: string): string;
  delete(bucket: string, paths: string[]): Promise<void>;
}

// ─── Supabase Storage Provider ──────────────────────────────────
const supabaseStorage: StorageProvider = {
  async upload(bucket, path, file, options = {}) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: options.upsert ?? true });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return { publicUrl, path };
  },

  getPublicUrl(bucket, path) {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  },

  async delete(bucket, paths) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  },
};

// ─── Active Provider ────────────────────────────────────────────
// Change this to swap storage backends (e.g., localStorageProvider, s3Provider)
let activeProvider: StorageProvider = supabaseStorage;

export function setStorageProvider(provider: StorageProvider) {
  activeProvider = provider;
}

// ─── Public API ─────────────────────────────────────────────────
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
): Promise<UploadResult> {
  return activeProvider.upload(bucket, path, file, options);
}

export function getPublicUrl(bucket: string, path: string): string {
  return activeProvider.getPublicUrl(bucket, path);
}

export async function deleteFiles(bucket: string, paths: string[]): Promise<void> {
  return activeProvider.delete(bucket, paths);
}

// ─── Convenience helpers ────────────────────────────────────────
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${ext}`;
  const result = await uploadFile("avatars", path, file);
  return result.publicUrl;
}

export async function uploadCustomerPhoto(customerId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `customer-photos/${customerId}.${ext}`;
  const result = await uploadFile("avatars", path, file);
  return result.publicUrl;
}

export async function uploadCompanyLogo(userId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${userId}/company-logo.${ext}`;
  const result = await uploadFile("avatars", path, file);
  return result.publicUrl;
}
