import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, ArrowRight, ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

export default function AssignWork() {
  const { products, users, assignments, setAssignments, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    product: '',
    operator: '',
    cavity: '',
    partNo: '',
    machine: '',
    counterStart: '',
    processes: [],
    shifts: [],
    timeSlots: {
      'Shift A': [],
      'Shift B': []
    }
  });

  const selectedProductObj = products.find(p => p.name === formData.product);
  const operators = users.filter(u => u.role === 'operator');

  const timeSlots = {
    'Shift A': ['08:00 – 09:00', '09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '12:00 – 01:00', '01:00 – 02:00', '02:00 – 03:00', '03:00 – 04:00', '04:00 – 05:00'],
    'Shift B': ['08:00 – 09:00', '09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '12:00 – 01:00', '01:00 – 02:00', '02:00 – 03:00', '03:00 – 04:00', '04:00 – 05:00']
  };

  const handleOpenModal = () => {
    setStep(1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newAssignments = [];
    formData.processes.forEach(process => {
      formData.shifts.forEach(shift => {
        formData.timeSlots[shift].forEach(timeSlot => {
          newAssignments.push({
            ...formData,
            process,
            shift,
            timeSlot
          });
        });
      });
    });

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      // Process in sequence to avoid overwhelming the server, or we can send them all at once if the backend supports bulk.
      // But standard controller uses standard create.
      for (const assignment of newAssignments) {
        const res = await axios.post('/api/assignments', assignment, config);
        setAssignments(prev => [...prev, res.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving assignment');
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.product || formData.processes.length === 0)) {
      alert("Please select a product and at least one process.");
      return;
    }
    if (step === 2) {
      if (formData.shifts.length === 0) {
        alert("Please select at least one shift.");
        return;
      }
      const hasTimeSlot = formData.shifts.some(shift => formData.timeSlots[shift].length > 0);
      if (!hasTimeSlot) {
        alert("Please select at least one time slot for the selected shifts.");
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const toggleProcess = (proc) => {
    setFormData(prev => ({
      ...prev,
      processes: prev.processes.includes(proc) 
        ? prev.processes.filter(p => p !== proc)
        : [...prev.processes, proc]
    }));
  };

  const toggleShift = (shift) => {
    setFormData(prev => ({
      ...prev,
      shifts: prev.shifts.includes(shift) 
        ? prev.shifts.filter(s => s !== shift)
        : [...prev.shifts, shift]
    }));
  };

  const toggleTimeSlot = (shift, time) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [shift]: prev.timeSlots[shift].includes(time)
          ? prev.timeSlots[shift].filter(t => t !== time)
          : [...prev.timeSlots[shift], time]
      }
    }));
  };

  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Assign Work</h1>
        <button 
          onClick={handleOpenModal}
          className="bg-accent hover:bg-accent/90 text-background px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
        >
          <Plus className="w-5 h-5" /> New Assignment
        </button>
      </div>

      <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/30 text-gray-400 text-sm border-b border-gray-800">
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">Product & Process</th>
                <th className="py-4 px-6 font-medium">Operator</th>
                <th className="py-4 px-6 font-medium">Shift / Time</th>
                <th className="py-4 px-6 font-medium">Machine</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-6 text-gray-300">{assignment.date}</td>
                  <td className="py-4 px-6">
                    <div className="text-white font-medium">{assignment.product}</div>
                    <div className="text-xs text-accent font-bold mt-1 bg-accent/10 inline-block px-2 py-0.5 rounded border border-accent/20">
                      {assignment.process || (assignment.processes && assignment.processes.join(', '))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-accent">{assignment.operator}</td>
                  <td className="py-4 px-6 text-gray-400">{assignment.shift} ({assignment.timeSlot})</td>
                  <td className="py-4 px-6 text-gray-300">{assignment.machine} / Cav: {assignment.cavity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-step Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">New Assignment</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 -z-10"></div>
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex flex-col items-center gap-2 ${step >= s ? 'text-accent' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step > s ? 'bg-accent text-background' : step === s ? 'bg-card border-2 border-accent text-accent' : 'bg-gray-800 text-gray-500'}`}>
                      {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                    </div>
                    <span className="text-xs font-medium bg-card px-2">
                      {s === 1 ? 'Product' : s === 2 ? 'Schedule' : 'Details'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Step 1: Product Selection */}
              <div className={step === 1 ? 'block space-y-6 animate-in slide-in-from-right-4' : 'hidden'}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Assignment Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Product</label>
                  <select value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none appearance-none" required>
                    <option value="">-- Select Product --</option>
                    {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                {selectedProductObj && (
                  <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-800">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Select Processes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProductObj.processes.map((proc, i) => (
                        <button 
                          type="button"
                          key={i} 
                          onClick={() => toggleProcess(proc)}
                          className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                            formData.processes.includes(proc) 
                              ? 'bg-accent/20 border-accent text-accent font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {proc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Schedule */}
              <div className={step === 2 ? 'block space-y-6 animate-in slide-in-from-right-4' : 'hidden'}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Select Shifts (Multiple Allowed)</label>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {['Shift A', 'Shift B'].map(shift => (
                      <div 
                        key={shift}
                        onClick={() => toggleShift(shift)}
                        className={`cursor-pointer p-4 rounded-xl border text-center transition-all ${formData.shifts.includes(shift) ? 'bg-accent/10 border-accent text-accent font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-background border-gray-800 text-gray-400 hover:border-gray-600'}`}
                      >
                        {shift}
                      </div>
                    ))}
                  </div>
                </div>

                {formData.shifts.map(shift => (
                  <div key={shift} className="p-4 bg-gray-800/20 rounded-xl border border-gray-800 mb-4">
                    <label className="block text-sm font-bold text-white mb-3">{shift} Time Slots</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots[shift].map(time => (
                        <div
                          key={time}
                          onClick={() => toggleTimeSlot(shift, time)}
                          className={`cursor-pointer p-2 rounded-lg border text-center text-xs sm:text-sm transition-all ${formData.timeSlots[shift].includes(time) ? 'bg-accent text-background font-bold border-accent shadow-lg shadow-accent/20' : 'bg-background border-gray-800 text-gray-400 hover:border-gray-600'}`}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 3: Details */}
              <div className={step === 3 ? 'block space-y-6 animate-in slide-in-from-right-4' : 'hidden'}>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Assign Operator</label>
                  <select value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none appearance-none" required>
                    <option value="">-- Select Operator --</option>
                    {operators.map(op => <option key={op.id} value={op.name}>{op.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Cavity</label>
                    <input type="text" value={formData.cavity} onChange={e => setFormData({...formData, cavity: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" placeholder="e.g. C1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Part No.</label>
                    <input type="text" value={formData.partNo} onChange={e => setFormData({...formData, partNo: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" placeholder="e.g. P001" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Machine</label>
                    <input type="text" value={formData.machine} onChange={e => setFormData({...formData, machine: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" placeholder="e.g. M1" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Counter Start</label>
                    <input type="number" value={formData.counterStart} onChange={e => setFormData({...formData, counterStart: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent outline-none" placeholder="0" required />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-800">
                <button type="button" onClick={prevStep} disabled={step === 1} className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                
                {step < 3 ? (
                  <button type="button" onClick={nextStep} disabled={(step === 1 && !formData.product)} className="bg-accent hover:bg-accent/90 text-background px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="submit" className="bg-accent hover:bg-accent/90 text-background px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent/20">
                    <CheckCircle2 className="w-5 h-5" /> Submit Assignment
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
