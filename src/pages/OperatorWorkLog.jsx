import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ClipboardList, Check } from 'lucide-react';

export default function OperatorWorkLog() {
  const { user, assignments, masterData, setMasterData, addAuditLog } = useAppContext();
  const [selectedTask, setSelectedTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    qty: 0,
    frontRejection: 0,
    rearRejection: 0
  });

  const myAssignments = assignments.filter(a => a.operator === user?.name);

  const finalOutput = Math.max(0, formData.qty - formData.frontRejection - formData.rearRejection);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      date: selectedTask.date,
      product: selectedTask.product,
      operator: user.name,
      shift: selectedTask.shift,
      timeSlot: selectedTask.timeSlot,
      qty: Number(formData.qty),
      frontRejection: Number(formData.frontRejection),
      rearRejection: Number(formData.rearRejection),
      finalOutput
    };

    setMasterData([...masterData, newEntry]);
    
    // Add audit log for CREATE
    addAuditLog(
      'CREATE_WORK_LOG', 
      selectedTask.product, 
      selectedTask.shift, 
      selectedTask.timeSlot, 
      null, // No old data
      {
        productionQty: Number(formData.qty),
        frontRejection: Number(formData.frontRejection),
        rearRejection: Number(formData.rearRejection),
        finalOutput
      }
    );

    setSuccessMsg('Work log submitted successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      setSelectedTask(null);
      setFormData({ qty: 0, frontRejection: 0, rearRejection: 0 });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Work Log Entry</h1>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 mb-6 animate-in slide-in-from-top-4">
          <Check className="w-5 h-5" /> {successMsg}
        </div>
      )}

      {!selectedTask ? (
        <div className="space-y-4">
          <p className="text-gray-400 mb-4">Select an assignment to log work:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myAssignments.map((assignment) => (
              <div 
                key={assignment.id} 
                onClick={() => {
                  setSelectedTask(assignment);
                  setFormData({ qty: 0, frontRejection: 0, rearRejection: 0 });
                }}
                className="bg-card border border-gray-800 rounded-2xl p-5 hover:border-accent cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] group flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">{assignment.product}</h3>
                  <p className="text-sm text-gray-400 mt-1">{assignment.date} | {assignment.shift} ({assignment.timeSlot})</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Log Work: {selectedTask.product}</h2>
              <p className="text-sm text-gray-400 mt-1">{selectedTask.date} | {selectedTask.shift} ({selectedTask.timeSlot})</p>
            </div>
            <button onClick={() => setSelectedTask(null)} className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
              Cancel
            </button>
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
            
            <div className="flex justify-end">
              <button type="submit" className="bg-accent hover:bg-accent/90 text-background px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg shadow-accent/20 hover:scale-105">
                Submit Work Log
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
