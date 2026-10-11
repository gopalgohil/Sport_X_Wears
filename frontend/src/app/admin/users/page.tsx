'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  ShieldCheck,
  Activity,
  Search,
  Filter,
  Calendar,
  Clock,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Trash2,
  Shield,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
  X,
  BadgeCheck,
  ChevronDown,
} from 'lucide-react';
import { getAllUsersAdmin, deleteUserAdmin, AdminUsersResponse } from '@/lib/api';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function AdminUsersPage() {
  const { token, user: currentAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [kpis, setKpis] = useState<AdminUsersResponse['kpis']>({
    totalUsers: 0,
    verifiedUsers: 0,
    adminUsers: 0,
    activeToday: 0,
    allOrdersTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAllUsersAdmin(
        {
          search: searchQuery.trim() || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          isVerified: verificationFilter !== 'all' ? verificationFilter : undefined,
        },
        token
      );

      if (res?.success) {
        setUsers(res.users || []);
        if (res.kpis) {
          setKpis(res.kpis);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch admin users:', err);
      setActionError(err.message || 'Failed to load athlete directory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, verificationFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(true);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await deleteUserAdmin(deleteModalUser._id, token);
      setActionSuccess(`Athlete account for ${deleteModalUser.name} deleted.`);
      setDeleteModalUser(null);
      await fetchUsers(true);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const exportToCSV = () => {
    if (users.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Verified', 'Registered Date', 'Last Login', 'Orders Count', 'Total Spent (INR)'];
    const rows = users.map((u) => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.phone || 'N/A'}"`,
      `"${u.role}"`,
      `"${u.isVerified ? 'Yes' : 'No'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : 'N/A'}"`,
      `"${u.lastLogin ? new Date(u.lastLogin).toISOString() : 'N/A'}"`,
      u.ordersCount || 0,
      u.totalSpent || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sportxwear_athletes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never / Pending';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isRecentLogin = (dateStr?: string) => {
    if (!dateStr) return false;
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Alerts */}
      {actionSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 animate-in fade-in">
          <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{actionSuccess}</p>
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm font-medium">{actionError}</p>
          <button onClick={() => setActionError(null)} className="ml-auto text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-wide text-white uppercase">
            Registered Athletes & Users
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Realtime directory of registered athletes, login telemetry, verification statuses, and lifetime metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-red-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 transition text-xs font-bold uppercase tracking-wider"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Athletes</span>
            <div className="p-2 rounded-xl bg-neutral-800/80 text-red-400 border border-neutral-700/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
            {kpis.totalUsers}
          </div>
          <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">{kpis.verifiedUsers} verified</span>
            <span>accounts</span>
          </div>
        </div>

        {/* Active Today / 24h Logins */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-600/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active (24h)</span>
            <div className="p-2 rounded-xl bg-neutral-800/80 text-emerald-400 border border-neutral-700/50">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight flex items-center gap-2">
            <span>{kpis.activeToday}</span>
            <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Logged in within last 24 hours
          </div>
        </div>

        {/* Admins & Staff */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl group-hover:bg-amber-600/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Staff / Admins</span>
            <div className="p-2 rounded-xl bg-neutral-800/80 text-amber-400 border border-neutral-700/50">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
            {kpis.adminUsers}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Administrative access privileges
          </div>
        </div>

        {/* User Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">User Lifetime GMV</span>
            <div className="p-2 rounded-xl bg-neutral-800/80 text-blue-400 border border-neutral-700/50">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
            ₹{kpis.allOrdersTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            Total revenue from athlete orders
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search athlete by name, email, or phone..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-24 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg font-medium transition"
          >
            Find
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-red-500 appearance-none pr-8 font-medium cursor-pointer"
            >
              <option value="all">Role: All Users</option>
              <option value="user">Athletes Only</option>
              <option value="admin">Admins Only</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Verification Filter */}
          <div className="relative">
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-300 focus:outline-none focus:border-red-500 appearance-none pr-8 font-medium cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="true">Verified (Active)</option>
              <option value="false">Unverified (Pending OTP)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Directory Table / Card view */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-neutral-900/40 border border-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
          <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No athletes found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No users match your search query or filter selection. Try adjusting your search criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60 backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/40 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-5">Athlete</th>
                  <th className="py-3.5 px-4">Role & Status</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Orders & Spend</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {users.map((athlete) => {
                  const recent = isRecentLogin(athlete.lastLogin);
                  const isCurrentAdmin = athlete._id === currentAdmin?._id;

                  return (
                    <tr key={athlete._id} className="hover:bg-neutral-900/30 transition-colors">
                      {/* Athlete Details */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/20 to-neutral-800 border border-red-500/30 flex items-center justify-center font-bold text-white shrink-0 uppercase">
                            {athlete.name ? athlete.name.slice(0, 2) : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{athlete.name}</span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] bg-red-950 border border-red-800 text-red-300 px-1.5 py-0.5 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-neutral-400 mt-0.5">
                              <span>{athlete.email}</span>
                              <button
                                onClick={() => handleCopyEmail(athlete.email)}
                                title="Copy Email"
                                className="text-neutral-500 hover:text-white transition"
                              >
                                {copiedEmail === athlete.email ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {athlete.phone && (
                              <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{athlete.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase border ${
                              athlete.role === 'admin'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                                : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                            }`}
                          >
                            <Shield className="w-2.5 h-2.5" />
                            {athlete.role}
                          </span>
                          <div>
                            {athlete.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                <BadgeCheck className="w-3.5 h-3.5" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                Pending OTP
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-4">
                        <div className="text-neutral-300 font-medium flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span>{formatDate(athlete.createdAt)}</span>
                        </div>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="text-neutral-300 font-medium flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                            <span>{formatDate(athlete.lastLogin)}</span>
                          </div>
                          {recent && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-300 text-[10px] font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active Today
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Orders & Spend */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-white flex items-center gap-1">
                            <ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />
                            {athlete.ordersCount || 0} orders
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            ₹{(athlete.totalSpent || 0).toLocaleString('en-IN')} total spent
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteModalUser(athlete)}
                            disabled={isCurrentAdmin}
                            title={isCurrentAdmin ? "Cannot delete own admin account" : "Delete User Account"}
                            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-red-400 hover:border-red-800/60 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {users.map((athlete) => {
              const recent = isRecentLogin(athlete.lastLogin);
              const isCurrentAdmin = athlete._id === currentAdmin?._id;

              return (
                <div
                  key={athlete._id}
                  className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm space-y-3"
                >
                  {/* Header: Avatar, Name, Email, Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/20 to-neutral-800 border border-red-500/30 flex items-center justify-center font-bold text-white shrink-0 uppercase">
                        {athlete.name ? athlete.name.slice(0, 2) : 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{athlete.name}</span>
                          {isCurrentAdmin && (
                            <span className="text-[9px] bg-red-950 border border-red-800 text-red-300 px-1 py-0.2 rounded font-mono">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                          <span className="truncate max-w-[170px]">{athlete.email}</span>
                          <button
                            onClick={() => handleCopyEmail(athlete.email)}
                            className="text-neutral-500 hover:text-white"
                          >
                            {copiedEmail === athlete.email ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase border shrink-0 ${
                        athlete.role === 'admin'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      {athlete.role}
                    </span>
                  </div>

                  {/* Telemetry info */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block">Registered:</span>
                      <span className="text-neutral-300 font-medium">{formatDate(athlete.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Last Login:</span>
                      <span className="text-neutral-300 font-medium">{formatDate(athlete.lastLogin)}</span>
                      {recent && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                          • Active Today
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Orders:</span>
                      <span className="text-white font-bold">{athlete.ordersCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Lifetime Spend:</span>
                      <span className="text-emerald-400 font-bold">
                        ₹{(athlete.totalSpent || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {athlete.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Pending OTP
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteModalUser(athlete)}
                        disabled={isCurrentAdmin}
                        title={isCurrentAdmin ? "Cannot delete own admin account" : "Delete User Account"}
                        className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-red-400 hover:bg-neutral-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-red-900/50 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete Athlete Account</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              This action cannot be undone. Are you sure you want to permanently delete{' '}
              <strong className="text-white font-bold">{deleteModalUser.name}</strong> ({deleteModalUser.email})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-2"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
