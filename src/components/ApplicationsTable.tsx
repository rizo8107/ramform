import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MembershipApplication } from '../services/adminService';
import { adminService } from '../services/adminService';

interface ApplicationsTableProps {
  applications: MembershipApplication[];
  onStatusUpdate: () => void;
}

export default function ApplicationsTable({ applications, onStatusUpdate }: ApplicationsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
                Submitted
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                Details
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
                    <td colSpan={5} className="px-6 py-4 bg-slate-50">
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

                        {/* Status badges and action buttons removed as requested */}
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
