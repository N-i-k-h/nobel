import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  Factory, AlertTriangle, CheckCircle, Percent, Users, Package,
  TrendingUp, TrendingDown, Filter, Clock, Activity, Target
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { masterData, assignments, products, users } = useAppContext();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [filters, setFilters] = useState({
    date: todayStr,
    product: '',
    shift: ''
  });

  // Derived Data
  const filteredData = useMemo(() => {
    return masterData.filter(d => {
      const matchDate = !filters.date || d.date === filters.date;
      const matchProduct = !filters.product || d.product === filters.product;
      const matchShift = !filters.shift || d.shift === filters.shift;
      return matchDate && matchProduct && matchShift;
    });
  }, [masterData, filters]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(a => {
      const matchDate = !filters.date || a.date === filters.date;
      const matchProduct = !filters.product || a.product === filters.product;
      const matchShift = !filters.shift || a.shift === filters.shift;
      return matchDate && matchProduct && matchShift;
    });
  }, [assignments, filters]);

  // KPIs
  const totalProduction = filteredData.reduce((sum, d) => sum + Number(d.qty || 0), 0);
  const totalFrontRej = filteredData.reduce((sum, d) => sum + Number(d.frontRejection || 0), 0);
  const totalRearRej = filteredData.reduce((sum, d) => sum + Number(d.rearRejection || 0), 0);
  const totalRejection = totalFrontRej + totalRearRej;
  const finalOutput = totalProduction - totalRejection;
  const efficiency = totalProduction > 0 ? (finalOutput / totalProduction) * 100 : 0;

  const activeOperators = new Set(filteredAssignments.map(a => a.operator)).size;
  const activeProducts = new Set(filteredAssignments.map(a => a.product)).size;

  // Efficiency Color Logic
  const getEfficiencyColor = (eff) => {
    if (eff >= 90) return 'text-green-400';
    if (eff >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Charts Data
  const timeSlots = ['08:00 – 09:00', '09:00 – 10:00', '10:00 – 11:00', '11:00 – 12:00', '12:00 – 01:00', '01:00 – 02:00', '02:00 – 03:00', '03:00 – 04:00', '04:00 – 05:00'];
  
  const productionTrendData = timeSlots.map(time => {
    const dataForTime = filteredData.filter(d => d.timeSlot === time || (d.timeSlot && d.timeSlot.includes(time.substring(0,2))));
    return {
      timeSlot: time.substring(0, 5), // Just show start hour for brevity
      production: dataForTime.reduce((sum, d) => sum + Number(d.qty || 0), 0)
    };
  });

  const rejectionAnalysisData = useMemo(() => {
    const agg = {};
    filteredData.forEach(d => {
      if (!agg[d.product]) agg[d.product] = { name: d.product, front: 0, rear: 0 };
      agg[d.product].front += Number(d.frontRejection || 0);
      agg[d.product].rear += Number(d.rearRejection || 0);
    });
    return Object.values(agg);
  }, [filteredData]);

  const operatorPerfData = useMemo(() => {
    const agg = {};
    filteredData.forEach(d => {
      if (!agg[d.operator]) agg[d.operator] = { name: d.operator, production: 0 };
      agg[d.operator].production += Number(d.qty || 0);
    });
    return Object.values(agg);
  }, [filteredData]);

  // Live Work Table
  const liveWork = useMemo(() => {
    return filteredAssignments.map(a => {
      const log = filteredData.find(d => d.operator === a.operator && d.product === a.product && d.timeSlot === a.timeSlot);
      return {
        id: a.id,
        operator: a.operator,
        product: a.product,
        shift: a.shift,
        timeSlot: a.timeSlot,
        production: log ? log.qty : '-',
        rejection: log ? (Number(log.frontRejection) + Number(log.rearRejection)) : '-',
        status: log ? 'Completed' : 'Pending'
      };
    });
  }, [filteredAssignments, filteredData]);

  const pendingCount = liveWork.filter(w => w.status === 'Pending').length;
  const highRejectionCount = filteredData.filter(d => d.qty > 0 && ((Number(d.frontRejection) + Number(d.rearRejection)) / d.qty) > 0.2).length;
  const lowEfficiencyCount = filteredData.filter(d => d.qty > 0 && (Number(d.finalOutput) / d.qty) < 0.7).length;

  // Quick Insights
  const topPerformer = operatorPerfData.length > 0 ? operatorPerfData.reduce((prev, current) => (prev.production > current.production) ? prev : current) : null;
  const mostRejection = rejectionAnalysisData.length > 0 ? rejectionAnalysisData.reduce((prev, current) => ((prev.front + prev.rear) > (current.front + current.rear)) ? prev : current) : null;
  // Approximating Best Process via Best Product
  const productPerf = useMemo(() => {
    const agg = {};
    filteredData.forEach(d => {
      if (!agg[d.product]) agg[d.product] = { name: d.product, prod: 0, final: 0 };
      agg[d.product].prod += Number(d.qty || 0);
      agg[d.product].final += Number(d.finalOutput || 0);
    });
    return Object.values(agg).map(p => ({...p, eff: p.prod > 0 ? p.final/p.prod : 0}));
  }, [filteredData]);
  const bestProduct = productPerf.length > 0 ? productPerf.reduce((prev, curr) => prev.eff > curr.eff ? prev : curr) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time overview of factory performance.</p>
        </div>
        
        {/* Filters */}
        <div className="flex bg-card border border-gray-800 rounded-xl p-2 gap-2">
          <input type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} className="bg-background border border-gray-800 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-accent" />
          <select value={filters.product} onChange={e => setFilters({...filters, product: e.target.value})} className="bg-background border border-gray-800 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-accent appearance-none min-w-[120px]">
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <select value={filters.shift} onChange={e => setFilters({...filters, shift: e.target.value})} className="bg-background border border-gray-800 rounded-lg px-3 py-1.5 text-white text-sm outline-none focus:border-accent appearance-none">
            <option value="">All Shifts</option>
            <option value="Shift A">Shift A</option>
            <option value="Shift B">Shift B</option>
          </select>
        </div>
      </div>

      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-card border border-gray-800 rounded-2xl p-4 flex flex-col hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Prod</span>
            <Factory className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white">{totalProduction}</span>
        </div>
        
        <div className="bg-card border border-red-900/30 rounded-2xl p-4 flex flex-col hover:border-red-500/50 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400/80">Total Rej</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <span className="text-2xl font-black text-red-400">{totalRejection}</span>
        </div>

        <div className="bg-card border border-green-900/30 rounded-2xl p-4 flex flex-col hover:border-green-500/50 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-green-400/80">Final Output</span>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-2xl font-black text-green-400">{finalOutput}</span>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-4 flex flex-col hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Efficiency</span>
            <Percent className="w-4 h-4 text-accent" />
          </div>
          <span className={`text-2xl font-black ${getEfficiencyColor(efficiency)}`}>{efficiency.toFixed(1)}%</span>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-4 flex flex-col hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Ops</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-white">{activeOperators}</span>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-4 flex flex-col hover:border-accent/50 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Prod</span>
            <Package className="w-4 h-4 text-pink-400" />
          </div>
          <span className="text-2xl font-black text-white">{activeProducts}</span>
        </div>
      </div>

      {/* Section 4 & 5: Alerts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> System Alerts
          </h3>
          <div className="space-y-3">
            {highRejectionCount > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span><strong className="font-bold">{highRejectionCount}</strong> logs have high rejection rate (&gt;20%).</span>
              </div>
            )}
            {lowEfficiencyCount > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                <TrendingDown className="w-5 h-5 flex-shrink-0" />
                <span><strong className="font-bold">{lowEfficiencyCount}</strong> logs show low efficiency (&lt;70%).</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span><strong className="font-bold">{pendingCount}</strong> active assignments pending submission.</span>
              </div>
            )}
            {highRejectionCount === 0 && lowEfficiencyCount === 0 && pendingCount === 0 && (
              <div className="text-gray-500 text-sm italic">All systems running optimally. No active alerts.</div>
            )}
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" /> Quick Insights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Top Performer</span>
              <span className="text-lg font-bold text-white truncate block">{topPerformer ? topPerformer.name : '-'}</span>
              <span className="text-xs text-green-400 font-medium">Highest Output</span>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Most Rejection</span>
              <span className="text-lg font-bold text-white truncate block">{mostRejection ? mostRejection.name : '-'}</span>
              <span className="text-xs text-red-400 font-medium">Needs Attention</span>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Best Product</span>
              <span className="text-lg font-bold text-white truncate block">{bestProduct ? bestProduct.name : '-'}</span>
              <span className="text-xs text-blue-400 font-medium">High Efficiency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-gray-800 rounded-2xl p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Production Trend</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productionTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="timeSlot" stroke="#666" tick={{fontSize: 12}} />
                <YAxis stroke="#666" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#333', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="production" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Rejection Analysis</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rejectionAnalysisData} margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} />
                <YAxis stroke="#666" tick={{fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#333', borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="front" stackId="a" fill="#ef4444" name="Front Rej" />
                <Bar dataKey="rear" stackId="a" fill="#8b5cf6" name="Rear Rej" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Operator Performance</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operatorPerfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#666" tick={{fontSize: 12}} />
                <YAxis stroke="#666" tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e1e30', borderColor: '#333', borderRadius: '8px' }} />
                <Bar dataKey="production" name="Production Qty" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Live Work Table */}
        <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-gray-800 bg-gray-900/30">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Work Status</h3>
          </div>
          <div className="flex-1 overflow-auto max-h-[250px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Operator</th>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Time Slot</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {liveWork.length > 0 ? liveWork.map((work, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-white font-medium">{work.operator}</td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{work.product}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{work.timeSlot}</td>
                    <td className="py-3 px-4">
                      {work.status === 'Completed' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500 text-sm">No work assigned for these filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
