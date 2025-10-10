import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService, type MembershipApplication } from '../services/adminService';
import { FileText, BarChart2, ArrowLeft } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<MembershipApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const allStatuses = ['pending', 'under_review', 'approved', 'rejected'] as const;
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([...allStatuses]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Fetch a large page to build aggregates. Adjust if you expect more rows.
        const { data } = await adminService.fetchApplications({ page: 1, pageSize: 1000, status: 'all' });
        setApps(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const districts = useMemo(() => Array.from(new Set(apps.map(a => a.revenue_district).filter(Boolean))).sort(), [apps]);

  const filtered = useMemo(() => {
    return apps.filter(a => {
      const okStatus = selectedStatuses.includes(a.application_status);
      const okDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(a.revenue_district || '');
      const ts = new Date(a.submitted_at).getTime();
      const okFrom = fromDate ? ts >= new Date(fromDate).setHours(0,0,0,0) : true;
      const okTo = toDate ? ts <= new Date(toDate).setHours(23,59,59,999) : true;
      return okStatus && okDistrict && okFrom && okTo;
    });
  }, [apps, selectedStatuses, selectedDistricts, fromDate, toDate]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const byStatus = filtered.reduce<Record<string, number>>((acc, a) => {
      acc[a.application_status] = (acc[a.application_status] || 0) + 1;
      return acc;
    }, {});
    const byDistrict = filtered.reduce<Record<string, number>>((acc, a) => {
      const k = a.revenue_district || 'Unknown';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const byGender = filtered.reduce<Record<string, number>>((acc, a) => {
      const g = (a.gender || 'Unknown') as string;
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    const byMember = filtered.reduce<Record<string, number>>((acc, a) => {
      const k = a.is_already_member ? 'Yes' : 'No';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    // Age buckets from date_of_birth
    const byAgeBucket = filtered.reduce<Record<string, number>>((acc, a) => {
      const dob = a.date_of_birth ? new Date(a.date_of_birth) : null;
      if (!dob || isNaN(dob.getTime())) {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
        return acc;
      }
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      let bucket: string = '55+';
      if (age < 18) bucket = '<18';
      else if (age <= 24) bucket = '18-24';
      else if (age <= 34) bucket = '25-34';
      else if (age <= 44) bucket = '35-44';
      else if (age <= 54) bucket = '45-54';
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    }, {});

    const byDay = filtered.reduce<Record<string, number>>((acc, a) => {
      const day = new Date(a.submitted_at).toISOString().slice(0, 10);
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    const daySeries = Object.entries(byDay)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));

    const topDistricts = Object.entries(byDistrict)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return { total, byStatus, byDistrict, byGender, byMember, byAgeBucket, daySeries, topDistricts };
  }, [filtered]);

  const lineData = useMemo(() => ({
    labels: stats.daySeries.map(d => new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
    datasets: [
      {
        label: 'Submissions',
        data: stats.daySeries.map(d => d.count),
        borderColor: 'rgb(37, 99, 235)',
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  }), [stats.daySeries]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, stepSize: 1 },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      x: { grid: { display: false } },
    },
  } as const;

  const barData = useMemo(() => ({
    labels: stats.topDistricts.map(d => d[0]),
    datasets: [
      {
        label: 'Applications',
        data: stats.topDistricts.map(d => d[1]),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      },
    ],
  }), [stats.topDistricts]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0, stepSize: 1 },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      y: { grid: { display: false } },
    },
  } as const;

  const pieData = useMemo(() => {
    const labels = ['pending', 'under_review', 'approved', 'rejected'];
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
    return {
      labels: labels.map(l => l.replace('_', ' ').toUpperCase()),
      datasets: [
        {
          data: labels.map(l => stats.byStatus[l] || 0),
          backgroundColor: colors,
        },
      ],
    };
  }, [stats.byStatus]);

  const pieOptions = { responsive: true, maintainAspectRatio: false } as const;

  // Age distribution (bar)
  const ageBarData = useMemo(() => {
    const order = ['<18','18-24','25-34','35-44','45-54','55+'];
    return {
      labels: order,
      datasets: [
        {
          label: 'Applicants',
          data: order.map(k => (stats.byAgeBucket[k] || 0)),
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
        },
      ],
    };
  }, [stats.byAgeBucket]);
  const ageBarOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } }, x: { grid: { display: false } } } } as const;

  // Gender split (pie)
  const genderPieData = useMemo(() => {
    const labels = ['Male','Female','Unknown'];
    return {
      labels,
      datasets: [{
        data: labels.map(k => stats.byGender[k] || 0),
        backgroundColor: ['#60a5fa','#f472b6','#94a3b8'],
      }],
    };
  }, [stats.byGender]);

  // Party Member (Yes/No)
  const memberPieData = useMemo(() => {
    const labels = ['Yes','No'];
    return {
      labels,
      datasets: [{
        data: labels.map(k => stats.byMember[k] || 0),
        backgroundColor: ['#10b981','#ef4444'],
      }],
    };
  }, [stats.byMember]);

  // Stacked by status over days
  const stackedData = useMemo(() => {
    // build set of days in range from filtered
    const dayKeys = Array.from(new Set(filtered.map(a => new Date(a.submitted_at).toISOString().slice(0,10)))).sort();
    const colors: Record<string,string> = { pending: '#f59e0b', under_review: '#3b82f6', approved: '#10b981', rejected: '#ef4444' };
    return {
      labels: dayKeys.map(d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })),
      datasets: allStatuses.map(s => ({
        label: s.replace('_',' ').toUpperCase(),
        data: dayKeys.map(d => filtered.filter(a => a.application_status===s && new Date(a.submitted_at).toISOString().slice(0,10)===d).length),
        backgroundColor: colors[s],
        stack: 'status',
      }))
    };
  }, [filtered]);

  const stackedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: { x: { stacked: true }, y: { stacked: true, ticks: { precision: 0, stepSize: 1 }, beginAtZero: true } }
  } as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Reports</h1>
                <p className="text-sm text-slate-600">Analytics and summaries</p>
              </div>
            </div>
            <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="grid grid-cols-2 gap-2 md:col-span-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">From</label>
                <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">To</label>
                <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Status</label>
              <select multiple value={selectedStatuses} onChange={e=>setSelectedStatuses(Array.from(e.target.selectedOptions).map(o=>o.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-28">
                {allStatuses.map(s => <option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Districts</label>
              <select multiple value={selectedDistricts} onChange={e=>setSelectedDistricts(Array.from(e.target.selectedOptions).map(o=>o.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg h-28">
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={()=>{ /* derived state updates automatically */ }} className="px-4 py-2 bg-slate-900 text-white rounded-lg">Apply</button>
            <button onClick={()=>{ setFromDate(''); setToDate(''); setSelectedStatuses([...allStatuses]); setSelectedDistricts([]); }} className="px-4 py-2 border border-slate-300 rounded-lg">Reset</button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {/* Primary charts requested: Age, Gender, Location, Party Member */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Age Distribution</h2>
                <div className="h-64">{filtered.length === 0 ? <p className="text-slate-600">No data</p> : <Bar data={ageBarData} options={ageBarOptions} />}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Gender Split</h2>
                <div className="h-64"><Pie data={genderPieData} options={pieOptions} /></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Locations</h2>
                <div className="h-64">{stats.topDistricts.length === 0 ? <p className="text-slate-600">No data</p> : <Bar data={barData} options={barOptions} />}</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Party Member (Yes/No)</h2>
                <div className="h-64"><Pie data={memberPieData} options={pieOptions} /></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <p className="text-sm text-slate-600">Total Applications</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
              </div>
              {(['pending', 'under_review', 'approved', 'rejected'] as const).map((s) => (
                <div key={s} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <p className="text-sm text-slate-600">{s.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.byStatus[s] || 0}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Submissions by Day</h2>
                </div>
                <div className="h-64">
                  {stats.daySeries.length === 0 ? (
                    <p className="text-slate-600">No data</p>
                  ) : (
                    <Line data={lineData} options={lineOptions} />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Top Districts</h2>
                </div>
                <div className="h-64">
                  {stats.topDistricts.length === 0 ? (
                    <p className="text-slate-600">No data</p>
                  ) : (
                    <Bar data={barData} options={barOptions} />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Status Breakdown</h2>
                </div>
                <div className="h-64">
                  <Pie data={pieData} options={pieOptions} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Daily Submissions by Status</h2>
              </div>
              <div className="h-72">
                {filtered.length === 0 ? (
                  <p className="text-slate-600">No data</p>
                ) : (
                  <Bar data={stackedData} options={stackedOptions} />
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Raw Data (first 1000)</h2>
                <button
                  onClick={() => {
                    const headers = ['id','name','phone_number','email','revenue_district','assembly_constituency','application_status','submitted_at'];
                    const rows = apps.map(a => [a.id, a.name, a.phone_number, a.email || '', a.revenue_district, a.assembly_constituency, a.application_status, a.submitted_at]);
                    const csv = [headers, ...rows].map(r => r.map(v => `"${(v ?? '').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `applications_report_${new Date().toISOString().slice(0,10)}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">District</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map(a => (
                      <tr key={a.id} className="border-b border-slate-100">
                        <td className="px-4 py-2">{a.name}</td>
                        <td className="px-4 py-2">{a.phone_number}</td>
                        <td className="px-4 py-2">{a.revenue_district}</td>
                        <td className="px-4 py-2">{a.application_status}</td>
                        <td className="px-4 py-2">{new Date(a.submitted_at).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
