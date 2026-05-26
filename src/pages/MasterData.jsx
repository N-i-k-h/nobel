import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Download, FileText, Filter, LayoutGrid, File, Settings } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SHIFT_A_TIMINGS = [
  "08:00 – 09:00", "09:00 – 10:00", "10:00 – 11:00", "11:00 – 12:00",
  "12:00 – 01:00", "01:00 – 02:00", "02:00 – 03:00", "03:00 – 04:00", "04:00 – 05:00"
];

const SHIFT_B_TIMINGS = [
  "08:00 – 09:00", "09:00 – 10:00", "10:00 – 11:00", "11:00 – 12:00",
  "12:00 – 01:00", "01:00 – 02:00", "02:00 – 03:00", "03:00 – 04:00", "04:00 – 05:00"
];

export default function MasterData() {
  const { masterData, products, users } = useAppContext();
  const [viewMode, setViewMode] = useState('digital'); // 'digital' or 'paper'
  const [selectedShift, setSelectedShift] = useState('A');
  
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    product: '',
    machine: '',
    cavity: ''
  });

  const activeTimings = selectedShift === 'A' ? SHIFT_A_TIMINGS : SHIFT_B_TIMINGS;

  const filteredData = useMemo(() => {
    return masterData.filter(item => {
      return (!filters.date || item.date === filters.date) &&
             (!filters.product || item.product === filters.product) &&
             (item.shift.toUpperCase().includes(selectedShift));
    });
  }, [masterData, filters, selectedShift]);

  const gridData = useMemo(() => {
    return activeTimings.map(time => {
      const entry = filteredData.find(d => d.timeSlot === time || d.timeSlot.split(' ')[0] === time.split(' ')[0]);
      return {
        time,
        productionQty: entry?.qty || '',
        frontRejection: entry?.frontRejection || '',
        rearRejection: entry?.rearRejection || '',
        remarks: entry?.remarks || '',
        operator: entry?.operator || ''
      };
    });
  }, [activeTimings, filteredData]);

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.setFontSize(16);
    doc.text('NOBEL – HOURLY PRODUCTION MONITORING NOTE', 40, 40);
    
    doc.setFontSize(10);
    doc.text(`Date: ${filters.date}`, 40, 60);
    doc.text(`Shift: ${selectedShift}`, 150, 60);
    doc.text(`Product: ${filters.product || 'All'}`, 250, 60);

    const tableData = gridData.map(row => {
      const totalRej = (Number(row.frontRejection) || 0) + (Number(row.rearRejection) || 0);
      return [
        row.time,
        row.productionQty,
        row.frontRejection,
        row.rearRejection,
        row.productionQty ? (Number(row.productionQty) - totalRej) : '',
        row.remarks,
        row.operator
      ];
    });

    autoTable(doc, {
      startY: 80,
      head: [['Time Slot', 'Production Qty', 'Front Rej', 'Back Rej', 'Final Output', 'Remarks', 'Operator']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillGray: true, textColor: 0, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 5 }
    });

    doc.save(`Nobel_Production_${filters.date}_Shift_${selectedShift}.pdf`);
  };

  const handleExportExcel = () => {
    const data = gridData.map(row => {
      const totalRej = (Number(row.frontRejection) || 0) + (Number(row.rearRejection) || 0);
      return {
        'Time Slot': row.time,
        'Production Qty': row.productionQty,
        'Front Rejection': row.frontRejection,
        'Back Rejection': row.rearRejection,
        'Final Output': row.productionQty ? (Number(row.productionQty) - totalRej) : '',
        'Remarks': row.remarks,
        'Operator': row.operator
      };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production Note");
    XLSX.writeFile(wb, `Nobel_Production_${filters.date}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Master Data</h1>
        <div className="flex gap-3">
          <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-700 mr-2">
            <button 
              onClick={() => setViewMode('digital')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'digital' ? 'bg-accent text-background' : 'text-gray-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Digital
            </button>
            <button 
              onClick={() => setViewMode('paper')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'paper' ? 'bg-accent text-background' : 'text-gray-400 hover:text-white'}`}
            >
              <File className="w-4 h-4" /> Paper
            </button>
          </div>
          <button onClick={handleExportPDF} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-gray-700">
            <FileText className="w-4 h-4 text-red-400" /> PDF
          </button>
          <button onClick={handleExportExcel} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-gray-700">
            <Download className="w-4 h-4 text-green-400" /> Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-gray-800 rounded-2xl p-4 flex flex-wrap gap-4 items-end">
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
          <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Shift</label>
          <select 
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-accent outline-none text-sm appearance-none"
          >
            <option value="A">Shift A (Morning)</option>
            <option value="B">Shift B (Night)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
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
        
        <button 
          onClick={() => setFilters({date: new Date().toISOString().split('T')[0], product: '', machine: '', cavity: ''})}
          className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {viewMode === 'paper' ? (
        <div className="bg-white p-8 rounded-sm shadow-2xl overflow-x-auto min-h-[1000px] text-black">
          <div className="max-w-4xl mx-auto border-2 border-black">
            {/* Paper Header */}
            <div className="flex justify-between items-start border-b-2 border-black p-4">
              <div className="flex flex-col">
                <span className="flex items-center text-3xl font-black tracking-tighter uppercase leading-none">
                  N<Settings className="w-6 h-6 mx-[1px] stroke-[3]" />BEL
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Live Lighter Live Stronger</span>
              </div>
              <div className="text-center pt-1">
                <h2 className="text-xl font-black uppercase tracking-widest underline decoration-2 underline-offset-4">Hourly Production Monitoring Note</h2>
              </div>
              <div className="flex flex-col text-right font-bold text-[10px] uppercase pt-1">
                <span>ISO 9001:2015</span>
                <span>Certified Company</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-3 border-b-2 border-black text-[10px] font-bold uppercase">
              <div className="border-r-2 border-black p-2">Machine Name: <span className="ml-1 font-mono">{filters.machine || '_______'}</span></div>
              <div className="border-r-2 border-black p-2">Date: <span className="ml-1 font-mono">{filters.date}</span></div>
              <div className="p-2 text-center text-xs">SHIFT - {selectedShift}</div>
            </div>
            <div className="grid grid-cols-3 border-b-2 border-black text-[10px] font-bold uppercase">
              <div className="border-r-2 border-black p-2">Part Name: <span className="ml-1 font-mono">{filters.product || '_______'}</span></div>
              <div className="border-r-2 border-black p-2">Part No: <span className="ml-1 font-mono">_______</span></div>
              <div className="p-2">Cavity: <span className="ml-1 font-mono">{filters.cavity || '____'}</span></div>
            </div>

            {/* Paper Grid */}
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr className="bg-gray-100 uppercase font-bold text-center">
                  <th className="border-2 border-black p-2 w-32" rowSpan="2">Time Slot</th>
                  <th className="border-2 border-black p-2" rowSpan="2">Production Qty.</th>
                  <th className="border-2 border-black p-2" colSpan="2">Rejection Qty.</th>
                  <th className="border-2 border-black p-2" rowSpan="2">Final Outward</th>
                  <th className="border-2 border-black p-2" rowSpan="2">Remarks</th>
                  <th className="border-2 border-black p-2" rowSpan="2">Operator Name</th>
                </tr>
                <tr className="bg-gray-100 uppercase font-bold text-center">
                  <th className="border-2 border-black p-2">Front</th>
                  <th className="border-2 border-black p-2">Back</th>
                </tr>
              </thead>
              <tbody>
                {gridData.map((row, idx) => {
                  const totalRej = (Number(row.frontRejection) || 0) + (Number(row.rearRejection) || 0);
                  const finalOut = row.productionQty ? (Number(row.productionQty) - totalRej) : '';
                  return (
                    <tr key={idx} className="h-10">
                      <td className="border-2 border-black px-2 py-1 font-mono font-bold text-center bg-gray-50">{row.time}</td>
                      <td className="border-2 border-black px-2 py-1 text-center font-mono">{row.productionQty}</td>
                      <td className="border-2 border-black px-2 py-1 text-center font-mono text-red-600">{row.frontRejection}</td>
                      <td className="border-2 border-black px-2 py-1 text-center font-mono text-purple-600">{row.rearRejection}</td>
                      <td className="border-2 border-black px-2 py-1 text-center font-mono font-bold bg-gray-50">{finalOut}</td>
                      <td className="border-2 border-black px-2 py-1">{row.remarks}</td>
                      <td className="border-2 border-black px-2 py-1 text-center font-bold uppercase">{row.operator}</td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="h-10 font-bold bg-gray-100">
                  <td className="border-2 border-black px-2 py-1 text-center">TOTAL</td>
                  <td className="border-2 border-black px-2 py-1 text-center font-mono">
                    {gridData.reduce((acc, curr) => acc + Number(curr.productionQty || 0), 0)}
                  </td>
                  <td className="border-2 border-black px-2 py-1 text-center font-mono text-red-600">
                    {gridData.reduce((acc, curr) => acc + Number(curr.frontRejection || 0), 0)}
                  </td>
                  <td className="border-2 border-black px-2 py-1 text-center font-mono text-purple-600">
                    {gridData.reduce((acc, curr) => acc + Number(curr.rearRejection || 0), 0)}
                  </td>
                  <td className="border-2 border-black px-2 py-1 text-center font-mono bg-gray-200">
                    {gridData.reduce((acc, curr) => {
                      const totalRej = (Number(curr.frontRejection) || 0) + (Number(curr.rearRejection) || 0);
                      const final = curr.productionQty ? (Number(curr.productionQty) - totalRej) : 0;
                      return acc + final;
                    }, 0)}
                  </td>
                  <td colSpan="2" className="border-2 border-black px-2 py-1"></td>
                </tr>
              </tbody>
            </table>
            
            {/* Footer Signatures */}
            <div className="grid grid-cols-2 p-8 font-bold text-xs uppercase">
              <div>Supervisor Signature: _________________</div>
              <div className="text-right">Shift Incharge: _________________</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/30 text-gray-400 text-sm border-b border-gray-800">
                  <th className="py-4 px-6 font-medium whitespace-nowrap sticky left-0 bg-[#0a0a0a] z-10">Time Slot</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap">Production</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap text-red-400/80">Front Rej</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap text-purple-400/80">Back Rej</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap text-accent">Final Output</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap">Operator</th>
                  <th className="py-4 px-6 font-medium whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {gridData.map((row, idx) => {
                  const totalRej = (Number(row.frontRejection) || 0) + (Number(row.rearRejection) || 0);
                  const finalOut = row.productionQty ? (Number(row.productionQty) - totalRej) : '-';
                  return (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 px-6 text-gray-300 font-medium sticky left-0 bg-[#0a0a0a] z-10 border-r border-gray-800/50">{row.time}</td>
                      <td className="py-3 px-6 text-white font-mono">{row.productionQty || '0'}</td>
                      <td className="py-3 px-6 text-red-400 font-mono">{row.frontRejection || '0'}</td>
                      <td className="py-3 px-6 text-purple-400 font-mono">{row.rearRejection || '0'}</td>
                      <td className="py-3 px-6 text-accent font-bold text-lg font-mono">{finalOut}</td>
                      <td className="py-3 px-6 text-gray-300">{row.operator || '-'}</td>
                      <td className="py-3 px-6 text-gray-400 text-sm">{row.remarks || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
