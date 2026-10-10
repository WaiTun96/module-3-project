import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Save, X, PlusCircle, Edit3, Image as ImageIcon } from 'lucide-react';

const getImageUrl = (path) => {
  if (!path || path === '' || path === 'N/A') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  const baseURL = API.defaults.baseURL ? API.defaults.baseURL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${cleanPath}`;
};

const GemForm = ({ selectedGem, onSuccess, onCancel }) => {
  const isEditMode = Boolean(selectedGem);

  const [formData, setFormData] = useState({
    name: '',
    riMin: '',
    riMax: '',
    sgMin: '',
    sgMax: '',
    opticalNature: 'SR',
    birefringenceValue: '0',
    dichroismValue: 'None',
    spectrumValue: 'N/A',
    inclusionsValue: 'N/A',
    uvFluorescenceValue: 'N/A',
    chelseaFilterValue: 'N/A',
  });

  const [photos, setPhotos] = useState({
    dichroismPhoto: null,
    spectrumPhoto: null,
    inclusionsPhoto: null,
    uvFluorescencePhoto: null,
    chelseaFilterPhoto: null,
  });

  const [previews, setPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedGem) {
      const { details } = selectedGem;
      
      const dichroismVal = typeof details?.dichroism === 'object' 
        ? details?.dichroism?.value 
        : details?.dichroism || 'None';

      const dichroismPic = typeof details?.dichroism === 'object'
        ? details?.dichroism?.photo
        : null;

      const birefringenceVal = typeof selectedGem.birefringence === 'object'
        ? selectedGem.birefringence?.value
        : (selectedGem.birefringence ?? '0');

      setFormData({
        name: selectedGem.name || '',
        riMin: selectedGem.riMin ?? '',
        riMax: selectedGem.riMax ?? '',
        sgMin: selectedGem.sgMin ?? '',
        sgMax: selectedGem.sgMax ?? '',
        opticalNature: selectedGem.opticalNature || 'SR',
        birefringenceValue: birefringenceVal,
        dichroismValue: dichroismVal,
        spectrumValue: details?.spectrum?.value || 'N/A',
        inclusionsValue: details?.inclusions?.value || 'N/A',
        uvFluorescenceValue: details?.uvFluorescence?.value || 'N/A',
        chelseaFilterValue: details?.chelseaFilter?.value || 'N/A'
      });

      setPreviews({
        dichroismPhoto: getImageUrl(dichroismPic),
        spectrumPhoto: getImageUrl(details?.spectrum?.photo),
        inclusionsPhoto: getImageUrl(details?.inclusions?.photo),
        uvFluorescencePhoto: getImageUrl(details?.uvFluorescence?.photo),
        chelseaFilterPhoto: getImageUrl(details?.chelseaFilter?.photo)
      });
    }
  }, [selectedGem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const selectedFile = files[0];
      setPhotos((prev) => ({ ...prev, [name]: selectedFile }));
      
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviews((prev) => ({ ...prev, [name]: objectUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const submitData = new FormData();
    
    // Append form text fields
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    // Append file objects if selected
    Object.keys(photos).forEach((key) => {
      if (photos[key]) {
        submitData.append(key, photos[key]);
      }
    });

    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (isEditMode) {
        await API.put(`/gems/${selectedGem._id}`, submitData, config);
      } else {
        await API.post('/gems', submitData, config);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'လုပ်ဆောင်ချက် မအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 max-w-4xl mx-auto my-6 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          {isEditMode ? <Edit3 className="w-6 h-6 text-emerald-600" /> : <PlusCircle className="w-6 h-6 text-emerald-600" />}
          {isEditMode ? 'Edit Gem Information' : 'Add New Gem'}
        </h2>
        {onCancel && (
          <button onClick={onCancel} type="button" className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-md font-semibold text-slate-700 border-b pb-2 mb-4">
            ၁။ အခြေခံ အချက်အလက်များ (Basic Properties)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gem Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Natural Ruby"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RI Min *</label>
              <input
                type="number"
                step="0.001"
                name="riMin"
                value={formData.riMin}
                onChange={handleChange}
                required
                placeholder="1.762"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RI Max *</label>
              <input
                type="number"
                step="0.001"
                name="riMax"
                value={formData.riMax}
                onChange={handleChange}
                required
                placeholder="1.770"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Optical Nature</label>
              <select
                name="opticalNature"
                value={formData.opticalNature}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="SR">SR</option>
                <option value="DR">DR</option>
                <option value="AGG">AGG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SG Min *</label>
              <input
                type="number"
                step="0.01"
                name="sgMin"
                value={formData.sgMin}
                onChange={handleChange}
                required
                placeholder="3.99"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">SG Max *</label>
              <input
                type="number"
                step="0.01"
                name="sgMax"
                value={formData.sgMax}
                onChange={handleChange}
                required
                placeholder="4.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Birefringence Value</label>
              <input
                type="number"
                step="0.001"
                name="birefringenceValue"
                value={formData.birefringenceValue}
                onChange={handleChange}
                placeholder="0.008"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-slate-700 border-b pb-2 mb-4">
            ၂။ အသေးစိတ် လက္ခဏာများနှင့် ဓာတ်ပုံများ (Details & Photos)
          </h3>
          <div className="space-y-4">
            <PropertyWithFileInput
              title="Dichroism"
              valueName="dichroismValue"
              photoName="dichroismPhoto"
              valuePlaceholder="Ex: Strong / Weak / None"
              value={formData.dichroismValue}
              preview={previews.dichroismPhoto}
              onTextChange={handleChange}
              onFileChange={handleFileChange}
            />

            <PropertyWithFileInput
              title="Absorption Spectrum"
              valueName="spectrumValue"
              photoName="spectrumPhoto"
              valuePlaceholder="Spectrum lines / description..."
              value={formData.spectrumValue}
              preview={previews.spectrumPhoto}
              onTextChange={handleChange}
              onFileChange={handleFileChange}
            />

            <PropertyWithFileInput
              title="Inclusions"
              valueName="inclusionsValue"
              photoName="inclusionsPhoto"
              valuePlaceholder="Silk, Rutile needles, Fingerprints..."
              value={formData.inclusionsValue}
              preview={previews.inclusionsPhoto}
              onTextChange={handleChange}
              onFileChange={handleFileChange}
            />

            <PropertyWithFileInput
              title="UV Fluorescence"
              valueName="uvFluorescenceValue"
              photoName="uvFluorescencePhoto"
              valuePlaceholder="Strong Red, Inert..."
              value={formData.uvFluorescenceValue}
              preview={previews.uvFluorescencePhoto}
              onTextChange={handleChange}
              onFileChange={handleFileChange}
            />

            <PropertyWithFileInput
              title="Chelsea Filter"
              valueName="chelseaFilterValue"
              photoName="chelseaFilterPhoto"
              valuePlaceholder="Red reaction, No reaction..."
              value={formData.chelseaFilterValue}
              preview={previews.chelseaFilterPhoto}
              onTextChange={handleChange}
              onFileChange={handleFileChange}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition cursor-pointer"
            >
              မလုပ်တော့ပါ
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-2 transition disabled:bg-emerald-300 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            {loading ? 'သိမ်းဆည်းနေပါသည်...' : isEditMode ? 'Update Gem' : 'Save New Gem'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PropertyWithFileInput = ({
  title,
  valueName,
  photoName,
  valuePlaceholder,
  value,
  preview,
  onTextChange,
  onFileChange
}) => {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Text Description</label>
          <input
            type="text"
            name={valueName}
            value={value || ''}
            onChange={onTextChange}
            placeholder={valuePlaceholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-slate-500" /> Choose Image File
          </label>
          <input
            type="file"
            accept="image/*"
            name={photoName}
            onChange={onFileChange}
            className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded border border-slate-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GemForm;