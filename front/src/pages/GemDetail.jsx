import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Filter, 
  ImageOff, 
  ZoomIn, 
  X,
  Eye
} from 'lucide-react';

const getImageUrl = (path) => {
  if (!path || path === '' || path === 'N/A') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) return path;
  
  let baseURL = API.defaults.baseURL || 'http://localhost:5000';
  baseURL = baseURL.replace(/\/api\/?$/, '');

  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!cleanPath.startsWith('/uploads/')) {
    cleanPath = `/uploads${cleanPath}`;
  }

  return `${baseURL}${cleanPath}`;
};

// Image Preview Modal Component
const ImagePreviewModal = ({ src, alt, onClose }) => {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-800 text-white border-b border-slate-700">
          <span className="text-sm font-medium text-slate-300">{alt || 'Image Preview'}</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-2 overflow-auto max-h-[80vh] flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[75vh] object-contain rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

// GemImage Component
const GemImage = ({ src, alt, className, onPreview }) => {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getImageUrl(src);

  if (!src || hasError) {
    return (
      <div className="w-full h-40 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 p-4">
        <ImageOff className="w-6 h-6 mb-1 text-slate-400" />
        <span className="text-xs font-medium">Image Not Available</span>
      </div>
    );
  }

  return (
    <div 
      className="relative group cursor-pointer overflow-hidden rounded-lg"
      onClick={() => onPreview && onPreview(imageUrl, alt)}
    >
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} transition duration-300 group-hover:scale-105`}
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-medium">
        <ZoomIn className="w-5 h-5" /> Preview
      </div>
    </div>
  );
};

const GemDetail = ({ gemId, onBack }) => {
  const [gem, setGem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchGemDetail = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/gems/${gemId}`);
        setGem(response.data.data || response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'အသေးစိတ် အချက်အလက်များ ရယူ၍ မရပါ။');
      } finally {
        setLoading(false);
      }
    };

    if (gemId) {
      fetchGemDetail();
    }
  }, [gemId]);

  const handleOpenPreview = (src, alt) => {
    setPreviewImage({ src, alt });
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !gem) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error || 'ကျောက်မျက် မတွေ့ရှိပါ'}</div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition cursor-pointer"
        >
          နောက်သို့ ပြန်သွားမည်
        </button>
      </div>
    );
  }

  const details = gem.details || {};

  const birefringenceValue = typeof gem.birefringence === 'object' 
    ? gem.birefringence?.value 
    : gem.birefringence;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition font-medium cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" /> နောက်သို့ ပြန်သွားမည်
      </button>

      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{gem.name}</h1>
            <p className="text-slate-500 text-sm mt-1">
              Optical Nature: <span className="font-semibold text-emerald-700">{gem.opticalNature || 'N/A'}</span>
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full self-start md:self-center">
            Detailed Properties
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <span className="text-xs text-slate-500 block">RI Range</span>
            <span className="text-base font-bold text-slate-700">{gem.riMin} - {gem.riMax}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <span className="text-xs text-slate-500 block">SG Range</span>
            <span className="text-base font-bold text-slate-700">{gem.sgMin} - {gem.sgMax}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <span className="text-xs text-slate-500 block">Birefringence</span>
            <span className="text-base font-bold text-slate-700">{birefringenceValue ?? 'N/A'}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 pt-2 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-600" /> Advanced Optical & Internal Characteristics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard
          icon={<Eye className="w-5 h-5 text-teal-500" />}
          title="Dichroism"
          value={typeof details?.dichroism === 'object' ? details?.dichroism?.value : details?.dichroism}
          photo={typeof details?.dichroism === 'object' ? details?.dichroism?.photo : null}
          onPreview={handleOpenPreview}
        />

        <DetailCard
          icon={<Sparkles className="w-5 h-5 text-amber-500" />}
          title="Absorption Spectrum"
          value={details?.spectrum?.value}
          photo={details?.spectrum?.photo}
          onPreview={handleOpenPreview}
        />

        <DetailCard
          icon={<Layers className="w-5 h-5 text-indigo-500" />}
          title="Internal Inclusions"
          value={details?.inclusions?.value}
          photo={details?.inclusions?.photo}
          onPreview={handleOpenPreview}
        />

        <DetailCard
          icon={<ShieldCheck className="w-5 h-5 text-purple-500" />}
          title="UV Fluorescence"
          value={details?.uvFluorescence?.value}
          photo={details?.uvFluorescence?.photo}
          onPreview={handleOpenPreview}
        />

        <DetailCard
          icon={<Filter className="w-5 h-5 text-rose-500" />}
          title="Chelsea Filter Reaction"
          value={details?.chelseaFilter?.value}
          photo={details?.chelseaFilter?.photo}
          onPreview={handleOpenPreview}
        />
      </div>

      {previewImage && (
        <ImagePreviewModal
          src={previewImage.src}
          alt={previewImage.alt}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

const DetailCard = ({ icon, title, value, photo, onPreview }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between space-y-4 hover:shadow-md transition">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
          {value || 'N/A'}
        </p>
      </div>

      {photo ? (
        <div className="pt-2">
          <span className="text-xs text-slate-400 block mb-1">Visual Reference (Click to Zoom):</span>
          <div className="bg-slate-50 rounded-lg">
            <GemImage
              src={photo}
              alt={title}
              className="w-full h-48 object-cover"
              onPreview={onPreview}
            />
          </div>
        </div>
      ) : (
        <span className="text-xs text-slate-400 italic">ဓာတ်ပုံ မရှိပါ</span>
      )}
    </div>
  );
};

export default GemDetail;