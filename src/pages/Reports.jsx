import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { FileText, Download, Filter, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function Reports() {
  const { masterData, products, cards, bags, users } = useAppContext();
  const [activeTab, setActiveTab] = useState('operator');
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    product: '',
    shift: ''
  });

  const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

  const dateFilteredMasterData = useMemo(() => {
    return masterData.filter(d => {
      const matchProduct = !filters.product || d.product === filters.product;
      const matchShift = !filters.shift || d.shift.includes(filters.shift);
      const matchFrom = !filters.dateFrom || new Date(d.date) >= new Date(filters.dateFrom);
      const matchTo = !filters.dateTo || new Date(d.date) <= new Date(filters.dateTo);
      return matchProduct && matchShift && matchFrom && matchTo;
    });
  }, [masterData, filters]);

  // 1. Operator-wise Data
  const operatorReport = useMemo(() => {
    const agg = {};
    dateFilteredMasterData.forEach(d => {
      if (!agg[d.operator]) agg[d.operator] = { name: d.operator, prod: 0, front: 0, rear: 0, final: 0 };
      agg[d.operator].prod += Number(d.qty || 0);
      agg[d.operator].front += Number(d.frontRejection || 0);
      agg[d.operator].rear += Number(d.rearRejection || 0);
      agg[d.operator].final += Number(d.finalOutput || 0);
    });
    return Object.values(agg).map(a => ({
      ...a,
      efficiency: a.prod > 0 ? ((a.final / a.prod) * 100).toFixed(1) : 0
    }));
  }, [dateFilteredMasterData]);

  // 2. Production Data
  const productionReport = useMemo(() => {
    const agg = {};
    dateFilteredMasterData.forEach(d => {
      if (!agg[d.product]) agg[d.product] = { name: d.product, prod: 0, final: 0 };
      agg[d.product].prod += Number(d.qty || 0);
      agg[d.product].final += Number(d.finalOutput || 0);
    });
    return Object.values(agg);
  }, [dateFilteredMasterData]);

  // 3. Rejection Data
  const rejectionReport = useMemo(() => {
    const agg = {};
    dateFilteredMasterData.forEach(d => {
      if (!agg[d.product]) agg[d.product] = { name: d.product, front: 0, rear: 0, total: 0 };
      agg[d.product].front += Number(d.frontRejection || 0);
      agg[d.product].rear += Number(d.rearRejection || 0);
      agg[d.product].total += Number(d.frontRejection || 0) + Number(d.rearRejection || 0);
    });
    return Object.values(agg);
  }, [dateFilteredMasterData]);

  // 4. Process-wise Data
  const processReport = useMemo(() => {
    const agg = {};
    dateFilteredMasterData.forEach(d => {
      const prodObj = products.find(p => p.name === d.product);
      if (prodObj && prodObj.processes) {
        prodObj.processes.forEach(proc => {
          if (!agg[proc]) agg[proc] = { name: proc, prod: 0, rej: 0, final: 0 };
          agg[proc].prod += Number(d.qty || 0) / prodObj.processes.length;
          agg[proc].rej += (Number(d.frontRejection || 0) + Number(d.rearRejection || 0)) / prodObj.processes.length;
          agg[proc].final += Number(d.finalOutput || 0) / prodObj.processes.length;
        });
      }
    });
    return Object.values(agg).map(a => ({
      name: a.name,
      prod: Math.round(a.prod),
      rej: Math.round(a.rej),
      efficiency: a.prod > 0 ? ((a.final / a.prod) * 100).toFixed(1) : 0
    }));
  }, [dateFilteredMasterData, products]);

  // 5. Card-wise Data
  const cardReport = useMemo(() => {
    return cards.map(c => {
      const relatedData = masterData.filter(m => m.date === c.date && (m.product === c.productName || !c.productName));
      const totalProd = relatedData.reduce((acc, curr) => acc + Number(curr.qty || 0), 0);
      const totalRej = relatedData.reduce((acc, curr) => acc + Number(curr.frontRejection || 0) + Number(curr.rearRejection || 0), 0);
      const prodObj = products.find(p => p.name === c.productName);
      return {
        cardNumber: c.cardNumber,
        productName: c.productName || 'General Product',
        date: c.date,
        processes: prodObj ? prodObj.processes.length : 1,
        totalProd,
        totalRej
      };
    });
  }, [cards, masterData, products]);

  // 6. Bag-wise Data
  const bagReport = useMemo(() => {
    return bags.map(b => {
      const linkedCard = cards.find(c => c.cardNumber === b.card);
      const relatedData = masterData.filter(m => m.date === b.date);
      const totalProd = relatedData.reduce((acc, curr) => acc + Number(curr.qty || 0), 0) / (bags.length || 1);
      const totalRej = relatedData.reduce((acc, curr) => acc + Number(curr.frontRejection || 0) + Number(curr.rearRejection || 0), 0) / (bags.length || 1);
      
      return {
        bagId: `BAG-${b.id}`,
        weight: b.weight,
        destination: b.destination,
        linkedCard: b.card,
        totalProd: Math.round(totalProd),
        totalRej: Math.round(totalRej)
      };
    });
  }, [bags, cards, masterData]);

  const generatePDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.setFontSize(18);
    doc.text('NOBEL ALLOY - SYSTEM REPORT', 40, 40);
    doc.setFontSize(10);
    doc.text(`Report Type: ${activeTab.toUpperCase()}`, 40, 60);
    doc.text(`Date Generated: ${format(new Date(), 'dd MMM yyyy')}`, 40, 75);
    
    let head = [];
    let body = [];

    if (activeTab === 'operator') {
      head = [['Operator', 'Production', 'Front Rej', 'Rear Rej', 'Final Output', 'Efficiency %']];
      body = operatorReport.map(r => [r.name, r.prod, r.front, r.rear, r.final, `${r.efficiency}%`]);
    } else if (activeTab === 'production') {
      head = [['Product Name', 'Total Production', 'Total Output']];
      body = productionReport.map(r => [r.name, r.prod, r.final]);
    } else if (activeTab === 'rejection') {
      head = [['Product Name', 'Front Rejection', 'Rear Rejection', 'Total Rejection']];
      body = rejectionReport.map(r => [r.name, r.front, r.rear, r.total]);
    } else if (activeTab === 'process') {
      head = [['Process Name', 'Total Production', 'Total Rejection', 'Efficiency %']];
      body = processReport.map(r => [r.name, r.prod, r.rej, `${r.efficiency}%`]);
    } else if (activeTab === 'card') {
      head = [['Card Number', 'Product', 'Date', 'Processes', 'Total Prod', 'Total Rej']];
      body = cardReport.map(r => [r.cardNumber, r.productName, r.date, r.processes, r.totalProd, r.totalRej]);
    } else if (activeTab === 'bag') {
      head = [['Bag ID', 'Weight', 'Destination', 'Linked Card', 'Total Prod', 'Total Rej']];
      body = bagReport.map(r => [r.bagId, r.weight, r.destination, r.linkedCard, r.totalProd, r.totalRej]);
    }

    doc.autoTable({
      startY: 90,
      head,
      body,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 0, fontStyle: 'bold' } // Accent color
    });

    doc.save(`Nobel_${activeTab}_Report_${format(new Date(), 'ddMMyyyy')}.pdf`);
  };

  const generateExcel = () => {
    let data = [];
    if (activeTab === 'operator') data = operatorReport;
    else if (activeTab === 'production') data = productionReport;
    else if (activeTab === 'rejection') data = rejectionReport;
    else if (activeTab === 'process') data = processReport;
    else if (activeTab === 'card') data = cardReport;
    else if (activeTab === 'bag') data = bagReport;

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `Nobel_${activeTab}_Report_${format(new Date(), 'ddMMyyyy')}.xlsx`);
  };

  const renderTable = () => {
    let headers = [];
    let rows = [];

    if (activeTab === 'operator') {
      headers = ['Operator', 'Total Prod', 'Front Rej', 'Rear Rej', 'Final Output', 'Efficiency'];
      rows = operatorReport.map(r => (
        <tr key={r.name} className="border-b border-gray-800/50 hover:bg-gray-800/20">
          <td className="p-4 text-white font-medium">{r.name}</td>
          <td className="p-4 text-gray-300 font-mono">{r.prod}</td>
          <td className="p-4 text-red-400 font-mono">{r.front}</td>
          <td className="p-4 text-purple-400 font-mono">{r.rear}</td>
          <td className="p-4 text-accent font-bold font-mono">{r.final}</td>
          <td className="p-4 text-green-400 font-medium">{r.efficiency}%</td>
        </tr>
      ));
    } else if (activeTab === 'production') {
      headers = ['Product Name', 'Total Production', 'Total Output'];
      rows = productionReport.map(r => (
        <tr key={r.name} className="border-b border-gray-800/50 hover:bg-gray-800/20">
          <td className="p-4 text-white font-medium">{r.name}</td>
          <td className="p-4 text-gray-300 font-mono">{r.prod}</td>
          <td className="p-4 text-accent font-bold font-mono">{r.final}</td>
        </tr>
      ));
    } else if (activeTab === 'rejection') {
      headers = ['Product Name', 'Front Rejection', 'Rear Rejection', 'Total Rejection'];
      rows = rejectionReport.map(r => (
        <tr key={r.name} className="border-b border-gray-800/50 hover:bg-gray-800/20">
          <td className="p-4 text-white font-medium">{r.name}</td>
          <td className="p-4 text-red-400 font-mono">{r.front}</td>
          <td className="p-4 text-purple-400 font-mono">{r.rear}</td>
          <td className="p-4 text-orange-500 font-bold font-mono">{r.total}</td>
        </tr>
      ));
    } else if (activeTab === 'process') {
      headers = ['Process Name', 'Total Production', 'Total Rejection', 'Efficiency'];
      rows = processReport.map(r => (
        <tr key={r.name} className="border-b border-gray-800/50 hover:bg-gray-800/20">
          <td className="p-4 text-white font-medium">{r.name}</td>
          <td className="p-4 text-gray-300 font-mono">{r.prod}</td>
          <td className="p-4 text-red-400 font-mono">{r.rej}</td>
          <td className="p-4 text-green-400 font-medium">{r.efficiency}%</td>
        </tr>
      ));
    } else if (activeTab === 'card') {
      headers = ['Card Number', 'Product', 'Date', 'Processes', 'Total Prod', 'Total Rej'];
      rows = cardReport.map(r => (
        <tr key={r.cardNumber} className="border-b border-gray-800/50 hover:bg-gray-800/20">
          <td className="p-4 text-accent font-bold">{r.cardNumber}</td>
          <td className="p-4 text-gray-300">{r.productName}</td>
          <td className="p-4 text-gray-400">{r.date}</td>
          <td className="p-4 text-white">{r.processes}</td>
          <td className="p-4 text-gray-300 font-mono">{r.totalProd}</td>
          <td className="p-4 text-red-400 font-mono">{r.totalRej}</td>
        </tr>
      ));
    } else if (activeTab === 'bag') {
      headers = ['Bag ID', 'Weight', 'Destination', 'Linked Card', 'Total Prod', 'Total Rej'];
      rows = bagReport.map(r => (
        <tr key={r.bagId} className="border-b border-gray-800/50 hover:bg-gray-800/20">
          <td className="p-4 text-white font-bold">{r.bagId}</td>
          <td className="p-4 text-gray-300">{r.weight}</td>
          <td className="p-4 text-gray-400">{r.destination}</td>
          <td className="p-4 text-accent">{r.linkedCard}</td>
          <td className="p-4 text-gray-300 font-mono">{r.totalProd}</td>
          <td className="p-4 text-red-400 font-mono">{r.totalRej}</td>
        </tr>
      ));
    }

    if (rows.length === 0) {
      return (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
          <BarChart2 className="w-12 h-12 mb-4 opacity-20" />
          <p>No data available for the selected filters.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/30 text-gray-400 text-sm border-b border-gray-800">
              {headers.map(h => <th key={h} className="p-4 font-medium whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };

  const renderChart = () => {
    if (activeTab === 'operator' && operatorReport.length > 0) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={operatorReport}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Bar dataKey="prod" name="Production" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="final" name="Final Output" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (activeTab === 'production' && productionReport.length > 0) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productionReport}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Bar dataKey="prod" name="Total Production" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (activeTab === 'rejection' && rejectionReport.length > 0) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rejectionReport}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="total" name="Total Rejection" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (activeTab === 'process' && processReport.length > 0) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processReport} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9ca3af" />
            <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
            <Bar dataKey="efficiency" name="Efficiency %" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if ((activeTab === 'card' || activeTab === 'bag')) {
      const data = activeTab === 'card' ? cardReport : bagReport;
      if (data.length === 0) return null;
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="totalProd" nameKey={activeTab === 'card' ? 'cardNumber' : 'bagId'} cx="50%" cy="50%" outerRadius={100} label>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">System Reports</h1>
        <div className="flex gap-3">
          <button onClick={generatePDF} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-gray-700 shadow-sm">
            <FileText className="w-4 h-4 text-red-400" /> Export PDF
          </button>
          <button onClick={generateExcel} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-gray-700 shadow-sm">
            <Download className="w-4 h-4 text-green-400" /> Export Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'operator', label: 'Operator-wise' },
          { id: 'production', label: 'Production' },
          { id: 'rejection', label: 'Rejection' },
          { id: 'process', label: 'Process-wise' },
          { id: 'card', label: 'Card-wise' },
          { id: 'bag', label: 'Bag-wise' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-accent text-background shadow-lg shadow-accent/20' : 'bg-card text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters (only applicable to masterData based reports mostly) */}
      <div className="bg-card border border-gray-800 rounded-2xl p-5 flex flex-wrap gap-4 items-end">
        <div className="flex items-center gap-2 text-gray-400 font-medium mb-1 px-2">
          <Filter className="w-4 h-4" /> Filters
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">From Date</label>
          <input type="date" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm" />
        </div>
        
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">To Date</label>
          <input type="date" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm" />
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Product</label>
          <select value={filters.product} onChange={e => setFilters({...filters, product: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm appearance-none">
            <option value="">All Products</option>
            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Shift</label>
          <select value={filters.shift} onChange={e => setFilters({...filters, shift: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm appearance-none">
            <option value="">All Shifts</option>
            <option value="A">Shift A</option>
            <option value="B">Shift B</option>
          </select>
        </div>
        
        <button onClick={() => setFilters({dateFrom: '', dateTo: '', product: '', shift: ''})} className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium">
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/30">
            <h3 className="text-white font-bold capitalize">{activeTab.replace('-', ' ')} Report Data</h3>
          </div>
          <div className="flex-1 max-h-[500px] overflow-y-auto">
            {renderTable()}
          </div>
        </div>

        <div className="bg-card border border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col justify-center items-center">
          <h3 className="text-white font-bold capitalize mb-6 w-full">{activeTab.replace('-', ' ')} Chart</h3>
          {renderChart() || (
             <div className="p-12 text-center text-gray-500 flex flex-col items-center">
               <PieChartIcon className="w-12 h-12 mb-4 opacity-20" />
               <p>No chart data available.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
