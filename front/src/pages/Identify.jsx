import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Search, RefreshCw, Eye, Sparkles } from 'lucide-react';

const Identify = ({ onSelectGem }) => {
  const [formData, setFormData] = useState({
    ri: '',
    riMin: '',
    riMax: '',
    sg: '',
    opticalNature: '',
    birefringence: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // DR ဖြစ်ပြီး RI Max နှင့် RI Min ထည့်ထားပါက Birefringence ကို Auto တွက်ချက်ခြင်း
  useEffect(() => {
    if (formData.opticalNature === 'DR') {
      const max = parseFloat(formData.riMax);
      const min = parseFloat(formData.riMin);

      if (!isNaN(max) && !isNaN(min)) {
        const diff = Math.abs(max - min).toFixed(3);
        setFormData((prev) => ({ ...prev, birefringence: diff }));
      }
    }
  }, [formData.riMax, formData.riMin, formData.opticalNature]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'opticalNature') {
      setFormData((prev) => ({
        ...prev,
        opticalNature: value,
        ri: '',
        riMin: '',
        riMax: '',
        birefringence: value === 'SR' ? '0' : ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    const payload = {};

    if (formData.sg) {
      payload.sg = parseFloat(formData.sg);
    }

    if (formData.opticalNature) {
      payload.opticalNature = formData.opticalNature;
    }

    if (formData.birefringence !== '' && !isNaN(parseFloat(formData.birefringence))) {
      payload.birefringence = parseFloat(formData.birefringence);
    }

    if (formData.opticalNature === 'DR') {
      const min = parseFloat(formData.riMin);
      const max = parseFloat(formData.riMax);
      
      if (!isNaN(min)) payload.riMin = min;
      if (!isNaN(max)) payload.riMax = max;

      if (!isNaN(min) && !isNaN(max)) {
        payload.ri = (min + max) / 2;
      } else if (!isNaN(min)) {
        payload.ri = min;
      } else if (!isNaN(max)) {
        payload.ri = max;
      }
    } else {
      if (formData.ri) payload.ri = parseFloat(formData.ri);
    }

    try {
      const response = await API.post('/gems/identify', payload);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gem စစ်ဆေးစဉ် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ ri: '', riMin: '', riMax: '', sg: '', opticalNature: '', birefringence: '' });
    setResults(null);
    setError('');
  };

  const gemList = results?.gems || (Array.isArray(results?.data) ? results.data : Array.isArray(results) ? results : []);
  const gemCount = results?.count ?? gemList.length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="w-7 h-7 text-emerald-600" /> Gem Identification System
        </h1>
        <p className="text-slate-500 text-sm">
          တိုင်းတာရရှိထားသော RI, SG, Optical Nature တန်ဖိုးများ ရိုက်ထည့်၍ ကျောက်အမျိုးအစား ရှာဖွေပါ
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Optical Nature (ON)
              </label>
              <select
                name="opticalNature"
                value={formData.opticalNature}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none border-slate-300 bg-white"
              >
                <option value="">-- ရွေးချယ်ပါ (Optional) --</option>
                <option value="SR">SR (Singly Refractive)</option>
                <option value="DR">DR (Doubly Refractive)</option>
                <option value="AGG">AGG (Aggregate)</option>
              </select>
            </div>

            {formData.opticalNature === 'DR' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    RI Min <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    name="riMin"
                    value={formData.riMin}
                    onChange={handleChange}
                    placeholder="Ex: 1.760"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    RI Max <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    name="riMax"
                    value={formData.riMax}
                    onChange={handleChange}
                    placeholder="Ex: 1.768"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none border-slate-300"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Refractive Index (RI) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="ri"
                  value={formData.ri}
                  onChange={handleChange}
                  placeholder="Ex: 1.765"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none border-slate-300"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Specific Gravity (SG) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="sg"
                value={formData.sg}
                onChange={handleChange}
                placeholder="Ex: 4.00"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Birefringence{' '}
                {formData.opticalNature === 'SR' && (
                  <span className="text-xs text-amber-600 font-normal">(N/A for SR)</span>
                )}
                {formData.opticalNature === 'DR' && (
                  <span className="text-xs text-emerald-600 font-normal">(Auto Calculated)</span>
                )}
              </label>
              <input
                type="number"
                step="0.001"
                name="birefringence"
                value={formData.birefringence}
                onChange={handleChange}
                disabled={formData.opticalNature === 'SR'}
                placeholder={formData.opticalNature === 'SR' ? 'None (SR)' : 'Ex: 0.008'}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none border-slate-300 ${
                  formData.opticalNature === 'SR'
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : formData.opticalNature === 'DR'
                    ? 'bg-slate-50 font-semibold text-emerald-700'
                    : ''
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-emerald-300 cursor-pointer"
            >
              {loading ? (
                <span>စစ်ဆေးနေပါသည်...</span>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Identify Gem
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              တွေ့ရှိသော ကျောက်မျက်များ ({gemCount})
            </h2>
          </div>

          {gemCount === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
              ကိုက်ညီသော ကျောက်မျက် မတွေ့ရှိပါ။ တန်ဖိုးများကို ပြန်လည်စစ်ဆေးပါ။
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gemList.map((gem) => (
                <div
                  key={gem._id || gem.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-emerald-700">{gem.name}</h3>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">
                      {gem.opticalNature || 'N/A'}
                    </span>
                  </div>

                  <div className="text-sm space-y-1 text-slate-600">
                    <p><span className="font-semibold text-slate-700">RI Range:</span> {gem.riMin} - {gem.riMax}</p>
                    <p><span className="font-semibold text-slate-700">SG Range:</span> {gem.sgMin} - {gem.sgMax}</p>
                    {gem.birefringence !== undefined && (
                      <p>
                        <span className="font-semibold text-slate-700">Birefringence:</span>{' '}
                        {typeof gem.birefringence === 'object' ? gem.birefringence?.value : gem.birefringence}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectGem && onSelectGem(gem._id || gem.id)}
                    className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Identify;