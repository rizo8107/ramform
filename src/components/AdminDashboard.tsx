import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  LogOut,
  Search,
  Filter
} from 'lucide-react';
import { adminService, MembershipApplication, ApplicationStats } from '../services/adminService';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import StatsCard from './StatsCard';
import ApplicationsTable from './ApplicationsTable';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'under_review'>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsPaged, statsData] = await Promise.all([
        adminService.fetchApplications({
          status: filterStatus,
          search: searchTerm,
          district: filterDistrict !== 'all' ? filterDistrict : undefined,
          fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
          toDate: toDate ? new Date(new Date(toDate).setHours(23,59,59,999)).toISOString() : undefined,
          page,
          pageSize,
        }),
        adminService.getApplicationStats(),
      ]);
      setApplications(appsPaged.data);
      setTotalCount(appsPaged.count);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await loadData();
  };

  const handleStatusChange = async (status: 'all' | 'pending' | 'approved' | 'rejected' | 'under_review') => {
    setFilterStatus(status);
    setPage(1);
    await loadData();
  };

  const handleResetFilters = async () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterDistrict('all');
    setFromDate('');
    setToDate('');
    setPage(1);
    await loadData();
  };

  const exportCsv = () => {
    const headers = [
      'id','name','phone_number','email','revenue_district','assembly_constituency','application_status','submitted_at'
    ];
    const rows = applications.map(a => [
      a.id, a.name, a.phone_number, a.email || '', a.revenue_district, a.assembly_constituency, a.application_status, a.submitted_at
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-sm text-slate-600">Membership Applications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/reports"
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Reports
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 mb-8">
          <StatsCard
            title="Total Applications"
            value={stats.total}
            icon={FileText}
            bgColor="bg-slate-100"
            iconColor="text-slate-600"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <form onSubmit={handleSearch} className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>
            </form>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent w-full"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <select
                value={filterDistrict}
                onChange={(e) => { setFilterDistrict(e.target.value); setPage(1); }}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent w-full"
              >
                <option value="all">All Districts</option>
                {[...new Set(applications.map(a => a.revenue_district).filter(Boolean))].sort().map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-between">
            <div className="flex gap-2">
              <button onClick={() => loadData()} className="px-4 py-2 bg-slate-900 text-white rounded-lg">Apply</button>
              <button onClick={handleResetFilters} className="px-4 py-2 border border-slate-300 rounded-lg">Reset</button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Rows:</label>
              <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="px-3 py-2 border border-slate-300 rounded-lg">
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button onClick={exportCsv} className="px-4 py-2 border border-slate-300 rounded-lg">Export CSV</button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No applications found</h3>
            <p className="text-slate-600">There are no membership applications to display.</p>
          </div>
        ) : (
          <>
            <ApplicationsTable applications={applications} onStatusUpdate={loadData} />
            <div className="flex items-center justify-between py-4 text-sm text-slate-600">
              <div>
                Page {page} of {totalPages} • {totalCount} total
              </div>
              <div className="flex gap-2">
                <button
                  disabled={!canPrev}
                  onClick={async () => { setPage(p => Math.max(1, p - 1)); await loadData(); }}
                  className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={!canNext}
                  onClick={async () => { setPage(p => p + 1); await loadData(); }}
                  className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
