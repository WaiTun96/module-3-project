import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import GemForm from '../../components/Admin/GemForm';
import { Plus, Edit, Trash2, Search, Gem, RefreshCw, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [gems, setGems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [selectedGem, setSelectedGem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/gems');
      const data = response.data.gems || response.data;
      setGems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Gem စာရင်းများ ရယူရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGems();
  }, []);

  const handleAddNew = () => {
    setSelectedGem(null);
    setShowForm(true);
  };

  const handleEdit = (gem) => {
    setSelectedGem(gem);
    setShowForm(true);
  };

  const handleDelete = async (gemId, gemName) => {
    if (window.confirm(`"${gemName}" ကို စာရင်းထဲမှ ဖျက်ပစ်ရန် သေချာပါသလား။`)) {
      try {
        await API.delete(`/gems/${gemId}`);
        fetchGems();
      } catch (err) {
        alert(err.response?.data?.message || 'ဖျက်ပစ်ရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်။');
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedGem(null);
    fetchGems();
  };


  const filteredGems = gems.filter((gem) =>
    gem?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gem className="w-7 h-7 text-emerald-600" /> Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gem Data များကို ထည့်သွင်းခြင်း၊ ပြင်ဆင်ခြင်းနှင့် ဖျက်ပစ်ခြင်းများကို စီမံနိုင်ပါသည်။
          </p>
        </div>

        {!showForm && (
          <button
            onClick={handleAddNew}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add New Gem
          </button>
        )}
      </div>

      {showForm ? (
        <GemForm
          selectedGem={selectedGem}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setSelectedGem(null);
          }}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search Gem Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={fetchGems}
              className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-emerald-600 font-medium cursor-pointer self-end md:self-center"
            >
              <RefreshCw className="w-4 h-4" /> Refresh List
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-slate-500 text-sm mt-2">Gem စာရင်းများ ရယူနေပါသည်...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto border rounded-lg border-slate-200">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Gem Name</th>
                    <th className="p-3">RI Range</th>
                    <th className="p-3">SG Range</th>
                    <th className="p-3">Optical Nature</th>
                    <th className="p-3">Birefringence</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        Gem မရှိသေးပါ သို့မဟုတ် ရှာဖွေမှုနှင့် မကိုက်ညီပါ။
                      </td>
                    </tr>
                  ) : (
                    filteredGems.map((gem) => (
                      <tr key={gem._id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{gem.name}</td>
                        <td className="p-3">{gem.riMin} - {gem.riMax}</td>
                        <td className="p-3">{gem.sgMin} - {gem.sgMax}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">
                            {gem.opticalNature}
                          </span>
                        </td>
                        <td className="p-3">
                          {typeof gem.birefringence === 'object' 
                            ? (gem.birefringence?.value ?? 0) 
                            : (gem.birefringence ?? 0)}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(gem)}
                              className="p-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-md transition cursor-pointer"
                              title="Edit Gem"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(gem._id, gem.name)}
                              className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-md transition cursor-pointer"
                              title="Delete Gem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;