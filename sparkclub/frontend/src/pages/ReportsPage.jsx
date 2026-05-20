// frontend/src/pages/ReportsPage.jsx
import { useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import { Download, FileSpreadsheet, FileText, Calendar, IndianRupee } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date filters for custom export
  const [fromDate, setFromDate] = useState(`${new Date().getFullYear()}-01-01`);
  const [toDate, setToDate] = useState(`${new Date().getFullYear()}-12-31`);
  const [exporting, setExporting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [sRes, bRes, mRes] = await Promise.all([
        reportsAPI.summary(year),
        reportsAPI.expenseBreakdown(year),
        reportsAPI.monthly(year)
      ]);
      setSummary(sRes.data);
      setBreakdown(bRes.data.filter(b => b.total > 0)); // only active categories
      setMonthly(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [year]);

  // Export to Excel using XLSX
  async function handleExportExcel() {
    setExporting(true);
    try {
      const { data: txs } = await reportsAPI.export({ from: fromDate, to: toDate });
      
      const formatted = txs.map(t => ({
        ID: t.id,
        Date: t.date,
        Type: t.type.toUpperCase(),
        Amount: t.amount,
        Description: t.description,
        Reference: t.reference || '',
        Category: t.category || 'Uncategorized',
        'Recorded By': t.recorded_by
      }));

      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ledger');
      
      XLSX.writeFile(workbook, `SparkClub_Ledger_${fromDate}_to_${toDate}.xlsx`);
    } catch (err) {
      alert('Failed to export Excel.');
    } finally {
      setExporting(false);
    }
  }

  // Export to PDF using jsPDF
  async function handleExportPDF() {
    setExporting(true);
    try {
      const { data: txs } = await reportsAPI.export({ from: fromDate, to: toDate });
      const doc = new jsPDF();

      // Header block
      doc.setFillColor(30, 41, 59); // Slate-800
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('SPARKCLUB AUDIT REPORT', 14, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Filter: ${fromDate} to ${toDate}`, 14, 29);

      // Body Details
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Summary', 14, 48);

      let totalIncome = 0;
      let totalExpense = 0;
      txs.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else totalExpense += t.amount;
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Total Income: Rs. ${totalIncome.toLocaleString('en-IN')}`, 14, 55);
      doc.text(`Total Expenses: Rs. ${totalExpense.toLocaleString('en-IN')}`, 14, 61);
      doc.text(`Net Balance: Rs. ${(totalIncome - totalExpense).toLocaleString('en-IN')}`, 14, 67);

      // Simple Table layout
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Ledger Details', 14, 80);

      let y = 88;
      // Print Headers
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 5, 182, 7, 'F');
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      doc.text('Date', 16, y);
      doc.text('Description', 40, y);
      doc.text('Category', 110, y);
      doc.text('Type', 150, y);
      doc.text('Amount (Rs)', 175, y);

      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      txs.forEach((t) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
          // Re-draw header on next page
          doc.setFillColor(241, 245, 249);
          doc.rect(14, y - 5, 182, 7, 'F');
          doc.setTextColor(51, 65, 85);
          doc.setFont('helvetica', 'bold');
          doc.text('Date', 16, y);
          doc.text('Description', 40, y);
          doc.text('Category', 110, y);
          doc.text('Type', 150, y);
          doc.text('Amount (Rs)', 175, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(30, 41, 59);
        }

        doc.text(t.date, 16, y);
        doc.text(t.description.substring(0, 32), 40, y);
        doc.text(t.category || 'Uncategorized', 110, y);
        doc.text(t.type.toUpperCase(), 150, y);
        doc.text(t.amount.toLocaleString('en-IN'), 175, y);
        y += 7;
      });

      doc.save(`SparkClub_Financial_Report_${fromDate}_to_${toDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to export PDF.');
    } finally {
      setExporting(false);
    }
  }

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'];

  if (loading) return <div className="text-slate-400">Loading Financial Reports...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Reports & Exports</h1>
          <p className="text-slate-400 text-sm">Review full breakdown statistics and download audit logs</p>
        </div>
        <select
          className="input py-1.5 w-32"
          value={year}
          onChange={e => setYear(e.target.value)}
        >
          <option value="2024">FY 2024</option>
          <option value="2025">FY 2025</option>
          <option value="2026">FY 2026</option>
        </select>
      </div>

      {/* Audit cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card space-y-2">
          <p className="text-xs text-slate-500 font-medium">Annual Allocated Budget</p>
          <p className="text-2xl font-bold">₹{summary.totalBudget.toLocaleString('en-IN')}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-xs text-slate-500 font-medium">Expenses Year-to-Date</p>
          <p className="text-2xl font-bold text-red-400">₹{summary.totalExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className="card space-y-2">
          <p className="text-xs text-slate-500 font-medium">Available Balance</p>
          <p className="text-2xl font-bold text-emerald-400">
            ₹{(summary.totalIncome - summary.totalExpense).toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Pie) */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-200">Expense Breakdown by Category</h3>
          <div className="h-64 flex items-center justify-center">
            {breakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No expense records found</p>
            )}
          </div>
        </div>

        {/* Monthly Performance (Bar) */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-slate-200">Monthly Cashflow Comparisons</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly.map(m => ({ name: m.month, Income: m.total_income, Expenses: m.total_expense }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export Segment */}
      <div className="card space-y-6">
        <div>
          <h3 className="font-semibold text-slate-200">Export Ledger Details</h3>
          <p className="text-xs text-slate-500 mt-1">Specify custom ranges to print reports or download Excel audits</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">Start Date</label>
            <input
              type="date"
              className="input py-1.5"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">End Date</label>
            <input
              type="date"
              className="input py-1.5"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="btn-secondary flex items-center justify-center gap-1.5 flex-1 text-xs"
            >
              <FileSpreadsheet size={16} />
              Excel (.xlsx)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="btn-primary flex items-center justify-center gap-1.5 flex-1 text-xs"
            >
              <FileText size={16} />
              PDF (.pdf)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
