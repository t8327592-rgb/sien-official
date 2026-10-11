"use client";

import NextImage from "next/image";
import { useState, useRef, useId } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";

interface ImageUploaderProps {
  defaultValue?: string;
}

export function ImageUploader({ defaultValue = "" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(defaultValue);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputId = useId();
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setIsCompressing(true);
    let objectUrl = "";
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("JPEG・PNG・WebP画像を選択してください。");
      if (file.size > 5 * 1024 * 1024) throw new Error("画像は5MB以下にしてください。");
      const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
      const jpeg = header[0] === 255 && header[1] === 216 && header[2] === 255;
      const png = [137,80,78,71,13,10,26,10].every((byte, i) => header[i] === byte);
      const webp = String.fromCharCode(...header.slice(0,4)) === "RIFF" && String.fromCharCode(...header.slice(8,12)) === "WEBP";
      if (!(file.type === "image/jpeg" && jpeg || file.type === "image/png" && png || file.type === "image/webp" && webp)) throw new Error("拡張子と画像形式が一致しません。");
      objectUrl = URL.createObjectURL(file);
      const image = new window.Image();
      image.src = objectUrl;
      await image.decode();
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 20000000) throw new Error("画像は2,000万画素以下にしてください。");
      const ratio = Math.min(1, 2048 / image.naturalWidth, 2048 / image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("画像を処理できませんでした。");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let result = "";
      for (const quality of [0.9, 0.8, 0.65, 0.5]) {
        result = canvas.toDataURL("image/webp", quality);
        if (result.length <= 1400000) break;
      }
      if (result.length > 1400000) throw new Error("圧縮後も画像が大きすぎます。小さい画像を選択してください。");
      setPreview(result);
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "EncodingError" ? cause.message : "画像を読み込めません。別の画像をお試しください。");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setIsCompressing(false);
    }
  };

  const handleClear = () => {
    setError("");
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* 隠しinput（サーバーサイドへのデータ送信に使用） */}
      <input type="hidden" name="imageUrl" value={preview} />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isCompressing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {isCompressing ? (
            <span className="flex items-center gap-2">処理中...</span>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              画像を選択
            </>
          )}
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleClear}
            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" /> クリア
          </button>
        )}
      </div>

      <input
        id={inputId}
        aria-label="JPEG・PNG・WebP画像をアップロード"
        aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ""}`}
        aria-invalid={!!error}
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      <p id={`${inputId}-help`} className="text-sm text-slate-600">JPEG・PNG・WebP、5MB・2,000万画素まで。最大2048px・1MB以下に圧縮します。</p>
      {error && <p id={`${inputId}-error`} role="alert" className="text-sm text-red-700">{error}</p>}

      {/* プレビュー表示 */}
      <div className="w-full max-w-md aspect-[16/9] border-2 border-dashed border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col items-center justify-center relative">
        {preview ? (
          <NextImage src={preview} alt="選択した画像のプレビュー" fill unoptimized className="object-contain" />
        ) : (
          <div className="text-slate-400 flex flex-col items-center gap-2">
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm font-medium">画像が選択されていません</span>
          </div>
        )}
      </div>
    </div>
  );
}
