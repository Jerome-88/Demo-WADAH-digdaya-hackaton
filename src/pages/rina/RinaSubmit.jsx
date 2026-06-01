import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Upload, Image, FileText, Rocket } from 'lucide-react';

const CHECKLIST = [
  'Ukuran file 1080x1080px (square format)',
  'Warna brand merah bata + kuning emas digunakan',
  'Teks "Nasi Goreng Spesial Rp 25.000" terbaca jelas',
  'Tagline "Rasa Rumahan, Harga Terjangkau" ada',
  'Kontras teks minimal 4.5:1 sudah dicek',
];

export default function RinaSubmit() {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checkedItems, setCheckedItems] = useState(new Set());

  function simUploadFile() {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1800);
  }

  function toggleCheck(i) {
    setCheckedItems(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const allChecked = checkedItems.size === CHECKLIST.length;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => navigate('/rina/task')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-inter text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Kembali ke Tugas
      </button>

      <h1 className="font-sora font-bold text-deep text-2xl mb-1">Kumpulkan Hasil Kerja</h1>
      <p className="text-gray-500 font-inter text-sm mb-7">Pastikan karyamu sudah memenuhi semua ketentuan sebelum dikumpulkan</p>

      {/* Checklist */}
      <div className="bg-indigo/5 border border-indigo/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-indigo" />
          <h2 className="font-sora font-bold text-deep">Checklist Sebelum Submit</h2>
        </div>
        <div className="space-y-3">
          {CHECKLIST.map((item, i) => (
            <label key={i} className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => toggleCheck(i)}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all ${
                  checkedItems.has(i)
                    ? 'bg-indigo border-indigo'
                    : 'border-indigo/30 group-hover:border-indigo/60'
                }`}
              >
                {checkedItems.has(i) && <CheckCircle size={11} className="text-white" />}
              </div>
              <span className={`text-sm font-inter leading-relaxed ${checkedItems.has(i) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {item}
              </span>
            </label>
          ))}
        </div>
        {allChecked && (
          <div className="mt-4 flex items-center gap-2 text-green text-sm font-semibold font-inter">
            <CheckCircle size={16} />
            Semua checklist terpenuhi!
          </div>
        )}
      </div>

      {/* Upload area */}
      <div className="mb-6">
        <h2 className="font-sora font-bold text-deep mb-3">Upload File Hasil Kerja</h2>

        {!uploaded && !uploading && (
          <div
            onClick={simUploadFile}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-indigo/50 hover:bg-indigo/2 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 bg-indigo/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo/20 transition-colors">
              <Upload size={26} className="text-indigo" />
            </div>
            <div className="font-semibold text-gray-700 font-inter mb-1">Drag & drop atau klik untuk upload</div>
            <div className="text-gray-400 text-sm font-inter">JPG, PNG — 1080x1080px, maks 5MB</div>
            <div className="mt-4 inline-block bg-indigo/10 text-indigo text-xs px-4 py-2 rounded-full font-inter font-semibold">
              Pilih File
            </div>
          </div>
        )}

        {uploading && (
          <div className="border-2 border-indigo/30 rounded-2xl p-10 text-center bg-indigo/5">
            <div className="w-12 h-12 border-4 border-indigo border-t-transparent rounded-full animate-spin-fast mx-auto mb-4" />
            <div className="font-semibold text-indigo font-inter">Mengupload file…</div>
            <div className="text-gray-400 text-sm font-inter mt-1">Mohon tunggu</div>
          </div>
        )}

        {uploaded && (
          <div className="border-2 border-green/30 rounded-2xl overflow-hidden animate-pop">
            {/* File preview mock */}
            <div className="bg-gradient-to-br from-red-900 to-yellow-800 h-48 flex items-center justify-center relative">
              <div className="text-center">
                <div className="text-5xl mb-2">🍛</div>
                <div className="text-white font-sora font-bold text-lg">Nasi Goreng Spesial</div>
                <div className="text-yellow-300 font-inter text-sm">Rp 25.000</div>
                <div className="text-white/70 text-xs font-inter mt-1">Rasa Rumahan, Harga Terjangkau</div>
              </div>
              <div className="absolute top-3 right-3 bg-green/90 rounded-full px-2.5 py-1 flex items-center gap-1">
                <CheckCircle size={11} className="text-white" />
                <span className="text-white text-xs font-semibold font-inter">Uploaded</span>
              </div>
            </div>
            <div className="bg-white p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green/10 rounded-xl flex items-center justify-center">
                <Image size={18} className="text-green" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800 font-inter text-sm">instagram_pak_budi_final.jpg</div>
                <div className="text-xs text-gray-400 font-inter mt-0.5">1080 × 1080 px · 245 KB · JPG</div>
              </div>
              <div className="flex items-center gap-1 text-green text-xs font-semibold font-inter">
                <CheckCircle size={13} />
                Siap
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit button */}
      {uploaded && (
        <div className="animate-pop space-y-4">
          <div className="bg-green/10 border border-green/30 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green" />
            <div>
              <div className="font-semibold text-green font-inter text-sm">File siap dikumpulkan!</div>
              <div className="text-gray-600 text-xs font-inter">AI akan mengevaluasi karyamu secara otomatis</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/rina/evaluation')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green to-teal text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity active:scale-95 font-inter text-base shadow-lg"
          >
            Kumpulkan Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
