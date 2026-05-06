import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Check } from 'lucide-react';

export default function OperatorEditWork() {
  const { user, masterData, setMasterData, addAuditLog } = useAppContext();
  const [searchParams, setSearchParams] = useState({ date: '', shift: '', timeSlot: '' });
  const [loadedEntry, setLoadedEntry] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    qty: 0,
    frontRejection: 0,
    rearRejection: 0
  });

  const finalOutput = Math.max(0, formData.qty - formData.frontRejection - formData.rearRejection);

  const handleSearch = () => {
    const entry = masterData.find(m => 
      m.operator === user?.name && 
      m.date === searchParams.date && 
      m.shift === searchParams.shift && 
      m.timeSlot === searchParams.timeSlot
    );
    
    if (entry) {
      setLoadedEntry(entry);
      setFormData({
        qty: entry.qty,
        frontRejection: entry.frontRejection,
        rearRejection: entry.rearRejection
      });
      setSuccessMsg('');
    } else {
      alert("No entry found for these parameters.");
      setLoadedEntry(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loadedEntry) return;

    const updatedData = masterData.map(m => {
      if (m.id === loadedEntry.id) {
        return {
          ...m,
          qty: Number(formData.qty),
          frontRejection: Number(formData.frontRejection),
          rearRejection: Number(formData.rearRejection),
          finalOutput
        };
      }
      return m;
    });

    setMasterData(updatedData);

    // Add audit log for EDIT
    addAuditLog(
      'EDIT_WORK_LOG', 
      loadedEntry.product, 
      loadedEntry.shift, 
      loadedEntry.timeSlot, 
      {
        productionQty: loadedEntry.qty,
        frontRejection: loadedEntry.frontRejection,
        rearRejection: loadedEntry.rearRejection,
        finalOutput: loadedEntry.finalOutput
      },
      {
        productionQty: Number(formData.qty),
        frontRejection: Number(formData.frontRejection),
        rearRejection: Number(formData.rearRejection),
        finalOutput
      }
    );
    setSuccessMsg('Work log updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      setLoadedEntry(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Edit Work Log</h1>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 mb-6 animate-in slide-in-from-top-4">
          <Check className="w-5 h-5" /> {successMsg}
        </div>
      )}

      <div className="bg-card border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Find Entry</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
            <input type="date" value={searchParams.date} onChange={e => setSearchParams({...searchParams, date: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Shift</label>
            <select value={searchParams.shift} onChange={e => setSearchParams({...searchParams, shift: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none appearance-none">
              <option value="">-- Select --</option>
              <option value="Shift A">Shift A (Morning)</option>
              <option value="Shift B">Shift B (Night)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Time Slot</label>
            <select value={searchParams.timeSlot} onChange={e => setSearchParams({...searchParams, timeSlot: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none appearance-none">
              <option value="">-- Select --</option>
              {searchParams.shift === 'Shift A' && ['08:00 – 09:00', '09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '12:00 – 01:00', '01:00 – 02:00', '02:00 – 03:00', '03:00 – 04:00', '04:00 – 05:00'].map(t => <option key={t} value={t}>{t}</option>)}
              {searchParams.shift === 'Shift B' && ['08:00 – 09:00', '09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '12:00 – 01:00', '01:00 – 02:00', '02:00 – 03:00', '03:00 – 04:00', '04:00 – 05:00'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button 
            onClick={handleSearch}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors border border-gray-700"
          >
            <Search className="w-4 h-4" /> Load Entry
          </button>
        </div>
      </div>

      {loadedEntry && (
        <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-gray-800 bg-gray-900/30">
            <h2 className="text-xl font-bold text-white">Editing: {loadedEntry.product}</h2>
            <p className="text-sm text-gray-400 mt-1">Found entry for {loadedEntry.date} | {loadedEntry.shift} ({loadedEntry.timeSlot})</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Total Production Qty</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={formData.qty} 
                  onChange={e => setFormData({...formData, qty: e.target.value})} 
                  className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none text-xl font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-red-400/80 mb-2">Front Rejection</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={formData.frontRejection} 
                  onChange={e => setFormData({...formData, frontRejection: e.target.value})} 
                  className="w-full bg-background border border-red-900/30 rounded-xl px-4 py-3 text-red-400 focus:border-red-500 outline-none text-xl font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-400/80 mb-2">Rear Rejection</label>
                <input 
                  type="number" 
                  min="0"
                  required
                  value={formData.rearRejection} 
                  onChange={e => setFormData({...formData, rearRejection: e.target.value})} 
                  className="w-full bg-background border border-purple-900/30 rounded-xl px-4 py-3 text-purple-400 focus:border-purple-500 outline-none text-xl font-medium" 
                />
              </div>
            </div>
            
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-medium text-accent">Auto Calculation</h3>
                <p className="text-sm text-gray-400 mt-1">Final Output = Production - Front - Rear</p>
              </div>
              <div className="text-4xl font-black text-accent">{finalOutput}</div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setLoadedEntry(null)} className="px-6 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-medium">Cancel</button>
              <button type="submit" className="bg-accent hover:bg-accent/90 text-background px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg shadow-accent/20 hover:scale-105">
                Update Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
