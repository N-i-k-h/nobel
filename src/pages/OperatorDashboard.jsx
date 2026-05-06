import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRight, CheckCircle2, AlertTriangle, Percent, Factory } from 'lucide-react';

export default function OperatorDashboard() {
  const { user, assignments, masterData, products } = useAppContext();
  const navigate = useNavigate();

  // Find assignments for this user
  const myAssignments = assignments.filter(a => a.operator === user?.name);
  const myWork = masterData.filter(m => m.operator === user?.name);

  const totalQty = myWork.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const totalRej = myWork.reduce((sum, item) => sum + Number(item.frontRejection || 0) + Number(item.rearRejection || 0), 0);
  const finalOutput = totalQty - totalRej;
  const efficiency = totalQty > 0 ? ((finalOutput / totalQty) * 100).toFixed(1) : 0;

  const getEfficiencyColor = (eff) => {
    if (eff >= 90) return 'text-green-400';
    if (eff >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}!</h1>
          <p className="text-gray-400">Here is your personal work overview.</p>
        </div>
        <button 
          onClick={() => navigate('/operator/work-log')}
          className="bg-accent hover:bg-accent/90 text-background px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-accent/20 hover:scale-105"
        >
          Go to Work Log <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Factory className="w-5 h-5 text-accent" /> Personal Stats
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-green-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-bl-full -z-10 group-hover:bg-green-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Total Production</p>
              <h2 className="text-4xl font-black text-white">{totalQty}</h2>
            </div>
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full -z-10 group-hover:bg-red-500/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Total Rejection</p>
              <h2 className="text-4xl font-black text-white">{totalRej}</h2>
            </div>
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-accent/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full -z-10 group-hover:bg-accent/10 transition-colors"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-1">Efficiency %</p>
              <h2 className={`text-4xl font-black ${getEfficiencyColor(efficiency)}`}>{efficiency}%</h2>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-accent" /> Today's Assigned Work
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myAssignments.length > 0 ? myAssignments.map(assignment => {
          const productData = products.find(p => p.name === assignment.product);
          return (
            <div key={assignment.id} className="bg-card border border-gray-800 rounded-2xl p-6 hover:border-accent/50 transition-colors shadow-sm group">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-accent/10 text-accent p-2 rounded-xl group-hover:bg-accent group-hover:text-background transition-colors">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-gray-800 rounded-full text-gray-300 border border-gray-700">
                  {assignment.date}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-white mb-1 group-hover:text-accent transition-colors">{assignment.product}</h3>
              <p className="text-gray-400 font-medium text-sm mb-4 bg-gray-900/50 inline-block px-3 py-1 rounded-lg">
                {assignment.shift} Shift <span className="text-accent">•</span> {assignment.timeSlot}
              </p>
              
              <div className="space-y-3 text-sm mt-2">
                <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800/50">
                  <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Assigned Process</span>
                  <div className="flex mt-2">
                    {assignment.process ? (
                      <span className="bg-accent/20 border border-accent/30 text-accent text-xs uppercase font-bold px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        {assignment.process}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">No specific process assigned</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800/50 text-center">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Machine</span>
                    <span className="font-bold text-white">{assignment.machine}</span>
                  </div>
                  <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800/50 text-center">
                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cavity</span>
                    <span className="font-bold text-white">{assignment.cavity}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-12 border border-dashed border-gray-800 rounded-2xl text-center text-gray-500 flex flex-col items-center">
            <ClipboardList className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">No assignments found for you today.</p>
            <p className="text-sm mt-2">Check back later or contact your supervisor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
