"use client";

import { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Loader2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";

interface ImageUploadFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  folderPath: string; // e.g., 'games/bgmi' or 'games/draft-1234'
}

export default function ImageUploadField({ label, name, value, onChange, folderPath }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Compress image
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);

      // 2. Upload to Supabase
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${name}-${Date.now()}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // 4. Update parent state
      onChange(name, publicUrlData.publicUrl);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to upload image: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="col-span-1">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-white/40">{label}</label>
        
        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`p-1.5 rounded-md transition-colors ${mode === 'url' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
            title="Use URL"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`p-1.5 rounded-md transition-colors ${mode === 'upload' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
            title="Upload File"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <input 
          type="text" 
          name={name} 
          value={value || ""} 
          onChange={handleUrlChange} 
          className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/40" 
          placeholder="https://..." 
        />
      ) : (
        <div className="relative">
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden" 
            id={`file-upload-${name}`}
            disabled={isUploading}
          />
          <label 
            htmlFor={`file-upload-${name}`}
            className={`flex items-center justify-center gap-2 w-full bg-zinc-900 border border-dashed border-white/[0.15] hover:border-purple-500/50 rounded-xl px-4 py-2.5 text-sm transition-all cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : 'text-white/70 hover:text-white'}`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-purple-400">Uploading...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 text-white/40" />
                <span>Click to upload image</span>
              </>
            )}
          </label>
        </div>
      )}

      {value && (
        <div className="mt-2 text-[10px] text-white/30 truncate flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Asset provided: {value.substring(0, 30)}...
        </div>
      )}
    </div>
  );
}
