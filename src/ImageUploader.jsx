import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';

const ImageUploader = ({ onUpload, currentImage }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Musíte vybrat obrázek.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      // Vytvoříme unikátní název souboru
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // 1. Nahrání do Supabase Storage (bucket: quiz-images)
      let { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Získání veřejné URL adresy
      const { data } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error.message);
      alert('Chyba při nahrávání obrázku: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onUpload('');
  };

  return (
    <div className="w-full">
      {currentImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50">
          <img src={currentImage} alt="Preview" className="w-full h-48 object-cover" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-300 mb-3" />
            )}
            <p className="mb-2 text-sm text-slate-500 font-bold">
              {uploading ? 'Nahrávám...' : 'Klikněte pro nahrání obrázku'}
            </p>
            <p className="text-xs text-slate-400 italic">PNG, JPG nebo WEBP</p>
          </div>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} accept="image/*" />
        </label>
      )}
    </div>
  );
};

export default ImageUploader;