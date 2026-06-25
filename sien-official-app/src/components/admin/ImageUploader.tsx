"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";

interface ImageUploaderProps {
  defaultValue?: string;
}

export function ImageUploader({ defaultValue = "" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(defaultValue);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像が選択されたときの処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 画像以外は弾く
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // リサイズ処理 (最大幅: 1200px)
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // 画質0.8でJPEGとして圧縮しBase64化
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          setPreview(compressedBase64);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
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
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* プレビュー表示 */}
      <div className="w-full max-w-md aspect-[16/9] border-2 border-dashed border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex flex-col items-center justify-center relative">
        {preview ? (
          <img src={preview} alt="プレビュー" className="w-full h-full object-cover" />
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
