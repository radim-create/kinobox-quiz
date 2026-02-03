import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Image, Loader2, X } from 'lucide-react';

export default function ImageUploader({ onUpload, currentImage }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `quiz-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('quiz-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('quiz-assets').getPublicUrl(filePath);
      onUpload(data.publicUrl);
    } catch (error) {
      alert('Chyba při nahrávání obrázku.');
    } finally {
      setUploading(false);
    }
  };

  if (currentImage) return (
    <div className="relative w-full h-32 group">
      <img src={currentImage} className="w-full h-full object-cover rounded-xl" alt="Preview" />
      <button 
        onClick={() => onUpload('')}
        className="absolute top-2 right-2 bg-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );

  return (
    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-kinobox transition-colors">
      {uploading ? <Loader2 className="animate-spin text-kinobox" /> : (
        <>
          <Image className="text-slate-500 mb-2" />
          <span className="text-xs text-slate-500 text-center px-2 font-medium uppercase tracking-tighter">Nahrát obrázek</span>
        </>
      )}
      <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*" />
    </label>
  );
}