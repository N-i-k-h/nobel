import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Filter, Eye, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkAudit() {
  const { auditLogs, users, products } = useAppContext();
  const [selectedLog, setSelectedLog] = useState(null);
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    date: '',
    operator: '',
    product: '',
    actionType: ''
  });

  const operators = users.filter(u => u.role === 'operator');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const logDate = format(new Date(log.timestamp), 'yyyy-MM-dd');
      const matchesDate = !filters.date || logDate === filters.date;
      const matchesOperator = !filters.operator || log.userName === filters.operator;
      const matchesProduct = !filters.product || log.product === filters.product;
      const matchesAction = !filters.actionType || log.action === filters.actionType;
      const matchesSearch = !searchQuery || log.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChanges = !showOnlyChanges || log.action === 'EDIT_WORK_LOG';
      
      return matchesDate && matchesOperator && matchesProduct && matchesAction && matchesSearch && matchesChanges;
    });
  }, [auditLogs, filters, searchQuery, showOnlyChanges]);

  const renderDiff = (oldVal, newVal) => {
    if (oldVal === newVal) return <span className="text-white font-mono">{newVal}</span>;
    
    // Check if high change (> 20%)
    let isHighChange = false;
    if (typeof oldVal === 'number' && typeof newVal === 'number' && oldVal > 0) {
      const diff = Math.abs(newVal - oldVal);
      isHighChange = (diff / oldVal) > 0.2;
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-red-400 line-through font-mono">{oldVal}</span>
        <ArrowRight className="w-3 h-3 text-gray-500" />
        <span className="text-green-400 font-bold font-mono">{newVal}</span>
        {isHighChange && (
          <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded ml-2 uppercase font-bold tracking-wider">
            <AlertTriangle className="w-3 h-3" /> High Change
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Work Audit</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">
            <input 
              type="checkbox" 
              checked={showOnlyChanges}
              onChange={(e) => setShowOnlyChanges(e.target.checked)}
              className="rounded bg-gray-800 border-gray-700 text-accent focus:ring-accent focus:ring-offset-background"
            />
            Show Only Edits
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex items-center gap-2 text-gray-400 font-medium mb-1 w-full md:w-auto px-2">
          <Filter className="w-4 h-4" /> Filters
        </div>
        
        <div className="flex-1 min-w-[200px] relative">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Search Operator</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Operator name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-white focus:border-accent outline-none text-sm" 
            />
          </div>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Date</label>
          <input 
            type="date" 
            value={filters.date}
            onChange={(e) => setFilters({...filters, date: e.target.value})}
            className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm" 
          />
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Operator</label>
          <select 
            value={filters.operator}
            onChange={(e) => setFilters({...filters, operator: e.target.value})}
            className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm appearance-none"
          >
            <option value="">All Operators</option>
            {operators.map(op => <option key={op.id} value={op.name}>{op.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Product</label>
          <select 
            value={filters.product}
            onChange={(e) => setFilters({...filters, product: e.target.value})}
            className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm appearance-none"
          >
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Action Type</label>
          <select 
            value={filters.actionType}
            onChange={(e) => setFilters({...filters, actionType: e.target.value})}
            className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm appearance-none"
          >
            <option value="">All Actions</option>
            <option value="CREATE_WORK_LOG">Create</option>
            <option value="EDIT_WORK_LOG">Edit</option>
          </select>
        </div>
        
        <button 
          onClick={() => {
            setFilters({date: '', operator: '', product: '', actionType: ''});
            setSearchQuery('');
          }}
          className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Reset
        </button>
      </div>

      <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/30 text-gray-400 text-sm border-b border-gray-800">
                <th className="py-4 px-6 font-medium whitespace-nowrap">Date & Time</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">User Name</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">Action Type</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">Product</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap">Shift / Time Slot</th>
                <th className="py-4 px-6 font-medium whitespace-nowrap text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-6 text-gray-300 whitespace-nowrap">
                    {format(new Date(log.timestamp), 'dd MMM yyyy | HH:mm')}
                  </td>
                  <td className="py-4 px-6 text-white font-medium">{log.userName}</td>
                  <td className="py-4 px-6">
                    {log.action === 'CREATE_WORK_LOG' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        CREATE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        EDIT
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-300">{log.product}</td>
                  <td className="py-4 px-6 text-gray-400 text-sm">Shift {log.shift} ({log.timeSlot})</td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="inline-flex items-center gap-1.5 text-accent hover:text-accent/80 font-medium text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No audit logs found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  Audit Details 
                  <span className="text-sm font-normal text-gray-500 font-mono tracking-wider">{selectedLog.id}</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedLog.userName} • {format(new Date(selectedLog.timestamp), 'dd MMM yyyy | HH:mm')}
                </p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Context Info */}
              <div className="grid grid-cols-3 gap-4 mb-8 bg-background border border-gray-800 rounded-xl p-4">
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Product</span>
                  <span className="text-white font-medium">{selectedLog.product}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Shift</span>
                  <span className="text-white font-medium">Shift {selectedLog.shift}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-1">Time Slot</span>
                  <span className="text-white font-medium">{selectedLog.timeSlot}</span>
                </div>
              </div>

              {/* Data Comparison */}
              <div className="grid grid-cols-2 gap-6 relative">
                {/* Visual Divider line */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-800 -translate-x-1/2"></div>
                
                {/* Old Data (Left Side) */}
                <div className="bg-gray-900/30 border border-red-500/20 rounded-xl overflow-hidden">
                  <div className="bg-red-500/10 border-b border-red-500/20 p-3">
                    <h3 className="font-bold text-red-400 uppercase tracking-widest text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Old Data
                    </h3>
                  </div>
                  <div className="p-5">
                    {selectedLog.action === 'CREATE_WORK_LOG' || !selectedLog.oldData ? (
                      <div className="flex items-center justify-center h-full min-h-[150px] text-gray-500 italic">
                        No previous data
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                          <span className="text-sm text-gray-400">Production Qty</span>
                          <span className="font-mono text-white">{selectedLog.oldData.qty ?? selectedLog.oldData.productionQty}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                          <span className="text-sm text-gray-400">Front Rejection</span>
                          <span className="font-mono text-white">{selectedLog.oldData.frontRejection}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                          <span className="text-sm text-gray-400">Rear Rejection</span>
                          <span className="font-mono text-white">{selectedLog.oldData.rearRejection}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-300">Final Output</span>
                          <span className="font-mono font-bold text-white text-lg">{selectedLog.oldData.finalOutput}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Data (Right Side) */}
                <div className="bg-gray-900/30 border border-green-500/20 rounded-xl overflow-hidden">
                  <div className="bg-green-500/10 border-b border-green-500/20 p-3">
                    <h3 className="font-bold text-green-400 uppercase tracking-widest text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> New Data
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-sm text-gray-400">Production Qty</span>
                        {selectedLog.action === 'EDIT_WORK_LOG' && selectedLog.oldData ? (
                          renderDiff(selectedLog.oldData.qty ?? selectedLog.oldData.productionQty, selectedLog.newData.qty ?? selectedLog.newData.productionQty)
                        ) : (
                          <span className="font-mono text-green-400">{selectedLog.newData.qty ?? selectedLog.newData.productionQty}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-sm text-gray-400">Front Rejection</span>
                        {selectedLog.action === 'EDIT_WORK_LOG' && selectedLog.oldData ? (
                          renderDiff(selectedLog.oldData.frontRejection, selectedLog.newData.frontRejection)
                        ) : (
                          <span className="font-mono text-green-400">{selectedLog.newData.frontRejection}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-sm text-gray-400">Rear Rejection</span>
                        {selectedLog.action === 'EDIT_WORK_LOG' && selectedLog.oldData ? (
                          renderDiff(selectedLog.oldData.rearRejection, selectedLog.newData.rearRejection)
                        ) : (
                          <span className="font-mono text-green-400">{selectedLog.newData.rearRejection}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Final Output</span>
                        {selectedLog.action === 'EDIT_WORK_LOG' && selectedLog.oldData ? (
                          renderDiff(selectedLog.oldData.finalOutput, selectedLog.newData.finalOutput)
                        ) : (
                          <span className="font-mono font-bold text-green-400 text-lg">{selectedLog.newData.finalOutput}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-800 flex justify-end flex-shrink-0">
              <button 
                onClick={() => setSelectedLog(null)} 
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-medium transition-colors border border-gray-700"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
