import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, X, ShoppingBag, Package } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

export default function Bags() {
  const { bags, setBags, cards, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingBag, setViewingBag] = useState(null);

  const [formData, setFormData] = useState({
    weight: '',
    destination: '',
    card: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const handleOpenModal = () => {
    setFormData({
      weight: '',
      destination: '',
      card: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.post('/api/bags', formData, config);
      setBags([...bags, res.data]);
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving bag');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Bag Management</h1>
        <button 
          onClick={handleOpenModal}
          className="bg-accent hover:bg-accent/90 text-background px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
        >
          <Plus className="w-5 h-5" /> Add Bag
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bags.map((bag) => (
          <div key={bag.id} className="bg-card border border-gray-800 rounded-2xl p-6 hover:shadow-lg hover:border-accent/50 transition-all duration-300 cursor-pointer group relative overflow-hidden" onClick={() => setViewingBag(bag)}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -z-10 group-hover:bg-accent/10 transition-colors"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-accent">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{bag.date}</p>
                <h3 className="text-lg font-bold text-white">{bag.weight}</h3>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Card Ref:</span>
                <span className="text-gray-300 font-medium">{bag.card}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Destination:</span>
                <span className="text-white font-medium">{bag.destination}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Bag Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Add New Bag</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Weight (e.g. 50kg)</label>
                <input required type="text" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Destination</label>
                <input required type="text" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Card Reference</label>
                <select required value={formData.card} onChange={e => setFormData({...formData, card: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none appearance-none">
                  <option value="">-- Select Card --</option>
                  {cards.map(c => <option key={c.id} value={c.cardNumber}>{c.cardNumber} ({c.partNo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-accent hover:bg-accent/90 text-background px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">Save Bag</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bag UI */}
      {viewingBag && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent border border-accent/30">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Bag Details</h2>
                  <p className="text-sm text-gray-400">Ref: {viewingBag.card}</p>
                </div>
              </div>
              <button onClick={() => setViewingBag(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-background border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Weight</p>
                  <p className="text-xl font-bold text-white">{viewingBag.weight}</p>
                </div>
                <div className="bg-background border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Destination</p>
                  <p className="text-lg font-bold text-white truncate">{viewingBag.destination}</p>
                </div>
                <div className="bg-background border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">Date Packed</p>
                  <p className="text-lg font-bold text-white">{viewingBag.date}</p>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Operator Traceability</h3>
              
              <div className="bg-background border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-800/50 border-b border-gray-800 text-sm">
                      <th className="p-4 text-gray-400 font-medium">Process</th>
                      <th className="p-4 text-gray-400 font-medium">Operator</th>
                      <th className="p-4 text-gray-400 font-medium text-right">Qty Contributed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-800/50">
                      <td className="p-4 text-white font-medium">Production</td>
                      <td className="p-4 text-gray-300">Ravi</td>
                      <td className="p-4 text-accent font-bold text-right">25</td>
                    </tr>
                    <tr className="border-b border-gray-800/50">
                      <td className="p-4 text-white font-medium">Production</td>
                      <td className="p-4 text-gray-300">Suresh</td>
                      <td className="p-4 text-accent font-bold text-right">15</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-white font-medium">Filtering</td>
                      <td className="p-4 text-gray-300">Gita</td>
                      <td className="p-4 text-accent font-bold text-right">40</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
