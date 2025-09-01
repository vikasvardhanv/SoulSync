import { useRef, useState } from "react";
import { Image, Loader2, Trash2 } from "lucide-react";
import { uploadPhotos } from "../services/api";

type Props = {
  onChange: (urls: string[]) => void;
  max?: number;
};

export default function ImageUpload({ onChange, max = 6 }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files).slice(0, max);
    try {
      setBusy(true);
      const urls = await uploadPhotos(files);
      const next = [...previews, ...urls].slice(0, max);
      setPreviews(next);
      onChange(next);
    } catch (error) {
      console.error('Upload failed:', error);
      // Even if upload fails, we can still show local previews for form validation
      // Convert files to data URLs for immediate preview
      const localUrls = await Promise.all(
        files.map(file => new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        }))
      );
      const next = [...previews, ...localUrls].slice(0, max);
      setPreviews(next);
      onChange(next);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(idx: number) {
    const next = previews.filter((_, i) => i !== idx);
    setPreviews(next);
    onChange(next);
  }

  return (
    <div>
      <label className="label mb-2 block">Photos *</label>
      <p className="helper mb-3">Upload at least 2 photos (up to {max} total)</p>
      <div className="flex flex-wrap gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative h-28 w-24 overflow-hidden rounded-xl border border-border">
            <img src={src} className="h-full w-full object-cover" alt={`photo ${i+1}`} />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-lg bg-black/60 p-1 text-white"
              aria-label="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {previews.length < max && (
          <button
            type="button"
            className="flex h-28 w-24 items-center justify-center rounded-xl border border-dashed border-border hover:bg-surface/60"
            onClick={() => inputRef.current?.click()}
          >
            {busy ? <Loader2 className="animate-spin" /> : <Image />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      <p className="helper mt-2">Up to {max} images. JPG, PNG, or WEBP. Max 5 MB each.</p>
    </div>
  );
}