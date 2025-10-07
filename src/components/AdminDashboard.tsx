import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  LogOut,
  Search,
  Filter
} from 'lucide-react';
import { adminService, MembershipApplication, ApplicationStats } from '../services/adminService';
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
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsData, statsData] = await Promise.all([
        adminService.getAllApplications(),
        adminService.getApplicationStats(),
      ]);
      setApplications(appsData);
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
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {
        const results = await adminService.searchApplications(searchTerm);
        setApplications(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      loadData();
    }
  };

  const handleFilterChange = async (status: string) => {
    setFilterStatus(status);
    setIsLoading(true);
    try {
      if (status === 'all') {
        await loadData();
      } else {
        const filtered = await adminService.filterApplicationsByStatus(status);
        setApplications(filtered);
      }
    } catch (error) {
      console.error('Filter failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Applications"
            value={stats.total}
            icon={FileText}
            bgColor="bg-slate-100"
            iconColor="text-slate-600"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            bgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="Under Review"
            value={stats.under_review}
            icon={FileText}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircle}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
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
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
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
          <ApplicationsTable applications={applications} onStatusUpdate={loadData} />
        )}
      </main>
    </div>
  );
}
