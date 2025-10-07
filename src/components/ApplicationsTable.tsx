import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MembershipApplication } from '../services/adminService';
import { adminService } from '../services/adminService';

interface ApplicationsTableProps {
  applications: MembershipApplication[];
  onStatusUpdate: () => void;
}

export default function ApplicationsTable({ applications, onStatusUpdate }: ApplicationsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, status: 'pending' | 'approved' | 'rejected' | 'under_review') => {
    setUpdatingId(id);
    try {
      await adminService.updateApplicationStatus(id, status);
      onStatusUpdate();
    } catch (error) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      under_review: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {applications.map((app) => (
              <React.Fragment key={app.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{app.name}</div>
                    {app.email && <div className="text-sm text-slate-500">{app.email}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {app.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {app.revenue_district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(app.application_status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDate(app.submitted_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setExpandedRow(expandedRow === app.id ? null : app.id)}
                      className="text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {expandedRow === app.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRow === app.id && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-slate-50">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-600">Gender</p>
                            <p className="text-sm text-slate-900 mt-1">{app.gender}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-600">Date of Birth</p>
                            <p className="text-sm text-slate-900 mt-1">{app.date_of_birth}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-600">Education</p>
                            <p className="text-sm text-slate-900 mt-1">{app.education}</p>
                          </div>
                          {app.specialization && (
                            <div>
                              <p className="text-xs font-medium text-slate-600">Specialization</p>
                              <p className="text-sm text-slate-900 mt-1">{app.specialization}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-slate-600">Occupation</p>
                            <p className="text-sm text-slate-900 mt-1">{app.occupation}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-600">Assembly Constituency</p>
                            <p className="text-sm text-slate-900 mt-1">{app.assembly_constituency}</p>
                          </div>
                        </div>

                        {app.address && (
                          <div>
                            <p className="text-xs font-medium text-slate-600">Address</p>
                            <p className="text-sm text-slate-900 mt-1">{app.address}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-slate-600">Motivation</p>
                          <p className="text-sm text-slate-900 mt-1">{app.motivation}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {app.is_already_member && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              Already Member
                            </span>
                          )}
                          {app.want_to_volunteer && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Wants to Volunteer
                            </span>
                          )}
                          {app.want_to_join_and_volunteer && (
                            <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full">
                              Join & Volunteer
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'approved')}
                            disabled={updatingId === app.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-400"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'under_review')}
                            disabled={updatingId === app.id}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400"
                          >
                            <Clock className="w-4 h-4" />
                            Under Review
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            disabled={updatingId === app.id}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-400"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
