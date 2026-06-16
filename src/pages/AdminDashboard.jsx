import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUsers, HiOutlineStar, HiOutlineChartBar, HiOutlineLogout,
  HiOutlineTrash, HiOutlineSearch, HiOutlineRefresh, HiOutlineChevronLeft,
  HiOutlineChevronRight, HiOutlineTrendingUp, HiOutlineCalendar,
  HiOutlineGlobe, HiOutlineDeviceMobile, HiOutlineBookOpen
} from 'react-icons/hi';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const getToken = () => localStorage.getItem('namazly_admin_token');

const adminFetch = async (url, options = {}) => {
  const token = getToken();
  if (!token) throw new Error('No admin token');
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('namazly_admin_token');
    throw new Error('UNAUTHORIZED');
  }
  return res.json();
};

/* ─── Stat Card ─────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color = 'emerald', delay = 0 }) => {
  const colorMap = {
    emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/20',
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/20',
    amber: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/20',
    violet: 'from-violet-500/20 to-violet-600/10 text-violet-400 border-violet-500/20',
  };
  const iconColor = {
    emerald: 'text-emerald-400', blue: 'text-blue-400', amber: 'text-amber-400',
    rose: 'text-rose-400', violet: 'text-violet-400',
  };

  return (
    <div
      className={`rounded-2xl p-5 border bg-gradient-to-br ${colorMap[color]} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 poppins-regular">{label}</p>
          <p className="text-3xl font-bold text-white poppins-regular mt-1">{value}</p>
          {sub && <p className="text-xs text-white/40 poppins-regular mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-white/5 ${iconColor[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

/* ─── Mini Bar Chart ───────────────────────────────────── */
const MiniBarChart = ({ data, labels, color = '#34d399', title }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-white/70 poppins-regular mb-4">{title}</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((val, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end gap-1">
            <span className="text-[10px] text-white/40 poppins-regular text-center">{val}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: `${Math.max((val / max) * 75, 4)}%`,
                background: `linear-gradient(to top, ${color}66, ${color})`,
                minHeight: '4px',
              }}
            />
            <span className="text-[10px] text-white/30 poppins-regular text-center">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Helpers ───────────────────────────────────────────── */
const formatMonthKey = (key) => {
  if (!key || key.length < 7) return key;
  const [year, month] = key.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const idx = parseInt(month, 10) - 1;
  return idx >= 0 && idx < 12 ? `${months[idx]} ${year.slice(2)}` : key;
};

const formatWeekKey = (key) => {
  if (!key || !key.includes('-W')) return key;
  const [year, week] = key.split('-W');
  return `Wk ${week} (${year.slice(2)})`;
};

/* ─── User Growth Line Chart (CSS-based) ───────────────── */
const UserGrowthChart = ({ data, filter, onFilterChange }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/70 poppins-regular flex items-center gap-2">
            <HiOutlineTrendingUp className="w-4 h-4 text-emerald-400" />
            User Signups
          </h3>
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
            {['day', 'week', 'month', '6month', '1year'].map(f => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-2 py-1 rounded cursor-pointer border-0 capitalize transition-all ${
                  filter === f ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-white/40 hover:text-white/60 bg-transparent'
                }`}
              >
                {f === '6month' ? '6m' : f === '1year' ? '1y' : f}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30 poppins-regular text-center py-8">No signup data available yet</p>
      </div>
    );
  }

  const counts = data.map(d => d.count);
  const max = Math.max(...counts, 1);

  return (
    <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70 poppins-regular flex items-center gap-2">
          <HiOutlineTrendingUp className="w-4 h-4 text-emerald-400" />
          User Signups
        </h3>
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
          {['day', 'week', 'month', '6month', '1year'].map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-2.5 py-1 rounded cursor-pointer border-0 capitalize transition-all ${
                filter === f ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-white/40 hover:text-white/60 bg-transparent'
              }`}
            >
              {f === '6month' ? '6m' : f === '1year' ? '1y' : f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-[3px] h-28 overflow-hidden">
        {data.map((d, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end min-w-0" title={`${filter === 'week' ? formatWeekKey(d._id) : filter === 'month' || filter === '6month' || filter === '1year' ? formatMonthKey(d._id) : d._id}: ${d.count} users`}>
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{
                height: `${Math.max((d.count / max) * 100, 4)}%`,
                background: 'linear-gradient(to top, rgba(52,211,153,0.3), rgba(52,211,153,0.8))',
                minHeight: '3px',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[9px] text-white/25 poppins-regular">
        {filter === 'day' ? (
          <>
            <span>{data[0]?._id?.slice(5)}</span>
            {data.length > 3 && <span>{data[Math.floor(data.length / 2)]?._id?.slice(5)}</span>}
            <span>{data[data.length - 1]?._id?.slice(5)}</span>
          </>
        ) : filter === 'week' ? (
          <>
            {data.map((d, i) => (
              <span key={i}>{formatWeekKey(d._id)}</span>
            ))}
          </>
        ) : (
          <>
            <span>{formatMonthKey(data[0]?._id)}</span>
            <span>{formatMonthKey(data[Math.floor(data.length / 4)]?._id)}</span>
            <span>{formatMonthKey(data[Math.floor(data.length / 2)]?._id)}</span>
            <span>{formatMonthKey(data[Math.floor(3 * data.length / 4)]?._id)}</span>
            <span>{formatMonthKey(data[data.length - 1]?._id)}</span>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Visitor Traffic Chart (CSS-based) ────────────────── */
const VisitorGrowthChart = ({ data, filter, onFilterChange }) => {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/70 poppins-regular flex items-center gap-2">
            <HiOutlineGlobe className="w-4 h-4 text-emerald-400" />
            Website Traffic
          </h3>
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
            {['day', 'week', 'month', '6month', '1year'].map(f => (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-2 py-1 rounded cursor-pointer border-0 capitalize transition-all ${
                  filter === f ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-white/40 hover:text-white/60 bg-transparent'
                }`}
              >
                {f === '6month' ? '6m' : f === '1year' ? '1y' : f}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30 poppins-regular text-center py-8">No visitor data available yet</p>
      </div>
    );
  }

  const counts = data.map(d => d.count);
  const max = Math.max(...counts, 1);

  return (
    <div className="rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70 poppins-regular flex items-center gap-2">
          <HiOutlineGlobe className="w-4 h-4 text-emerald-400" />
          Website Traffic
        </h3>
        <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 text-xs">
          {['day', 'week', 'month', '6month', '1year'].map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-2.5 py-1 rounded cursor-pointer border-0 capitalize transition-all ${
                filter === f ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-white/40 hover:text-white/60 bg-transparent'
              }`}
            >
              {f === '6month' ? '6m' : f === '1year' ? '1y' : f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-[3px] h-28 overflow-hidden">
        {data.map((d, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end min-w-0" title={`${filter === 'week' ? formatWeekKey(d._id) : filter === 'month' || filter === '6month' || filter === '1year' ? formatMonthKey(d._id) : d._id}: ${d.count} visits`}>
            <div
              className="w-full rounded-t-sm transition-all duration-500"
              style={{
                height: `${Math.max((d.count / max) * 100, 4)}%`,
                background: 'linear-gradient(to top, rgba(52,211,153,0.3), rgba(52,211,153,0.8))',
                minHeight: '3px',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[9px] text-white/25 poppins-regular">
        {filter === 'day' ? (
          <>
            <span>{data[0]?._id?.slice(5)}</span>
            {data.length > 3 && <span>{data[Math.floor(data.length / 2)]?._id?.slice(5)}</span>}
            <span>{data[data.length - 1]?._id?.slice(5)}</span>
          </>
        ) : filter === 'week' ? (
          <>
            {data.map((d, i) => (
              <span key={i}>{formatWeekKey(d._id)}</span>
            ))}
          </>
        ) : (
          <>
            <span>{formatMonthKey(data[0]?._id)}</span>
            <span>{formatMonthKey(data[Math.floor(data.length / 4)]?._id)}</span>
            <span>{formatMonthKey(data[Math.floor(data.length / 2)]?._id)}</span>
            <span>{formatMonthKey(data[Math.floor(3 * data.length / 4)]?._id)}</span>
            <span>{formatMonthKey(data[data.length - 1]?._id)}</span>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Helpers ───────────────────────────────────────────── */
const parseUserAgent = (ua) => {
  if (!ua) return 'Unknown';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Macintosh')) return 'Mac';
  if (ua.includes('Linux')) return 'Linux';
  return 'Mobile';
};

/* ─── Tab Button ───────────────────────────────────────── */
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold poppins-regular transition-all duration-200 border-0 cursor-pointer
      ${active
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10'
      }`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

/* ─── Main Admin Dashboard ─────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [visitFilter, setVisitFilter] = useState('day');
  const [signupFilter, setSignupFilter] = useState('day');
  const [showAllPageViews, setShowAllPageViews] = useState(false);

  // NEW visitors list pagination & toggle states
  const [visitors, setVisitors] = useState([]);
  const [visitorsType, setVisitorsType] = useState('all'); // 'all' or 'unique'
  const [visitorsPage, setVisitorsPage] = useState(1);
  const [visitorsTotalPages, setVisitorsTotalPages] = useState(1);
  const [visitorsTotal, setVisitorsTotal] = useState(0);
  const [visitorsLoading, setVisitorsLoading] = useState(false);

  // NEW Masail states
  const [masail, setMasail] = useState([]);
  const [masailTotal, setMasailTotal] = useState(0);
  const [masailPage, setMasailPage] = useState(1);
  const [masailTotalPages, setMasailTotalPages] = useState(1);
  const [masailSearch, setMasailSearch] = useState('');
  const [masailLoading, setMasailLoading] = useState(false);
  const [deleteMaslaLoading, setDeleteMaslaLoading] = useState(null);

  const [newMasla, setNewMasla] = useState({
    question: '',
    answer: '',
    category: 'General',
    authority: 'Mufti Tariq Masood',
    reference: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Check admin auth on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/1adminMs1', { replace: true });
    }
  }, [navigate]);

  const loadStats = useCallback(async (vFilter = 'day', sFilter = 'day') => {
    try {
      const data = await adminFetch(`/admin/stats?visitFilter=${vFilter}&signupFilter=${sFilter}`);
      if (data.success) setStats(data.stats);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') navigate('/1adminMs1', { replace: true });
    }
  }, [navigate]);

  const loadUsers = useCallback(async (page = 1, search = '') => {
    try {
      const data = await adminFetch(`/admin/users?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
      if (data.success) {
        setUsers(data.users);
        setUsersTotal(data.total);
        setUsersPage(data.page);
        setUsersTotalPages(data.totalPages);
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') navigate('/1adminMs1', { replace: true });
    }
  }, [navigate]);

  const loadReviews = useCallback(async () => {
    try {
      const data = await adminFetch('/admin/reviews');
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') navigate('/1adminMs1', { replace: true });
    }
  }, [navigate]);

  // NEW load visitors function
  const loadVisitors = useCallback(async (page = 1, type = 'all') => {
    setVisitorsLoading(true);
    try {
      const data = await adminFetch(`/admin/visitors?page=${page}&limit=15&type=${type}`);
      if (data.success) {
        setVisitors(data.visitors);
        setVisitorsTotal(data.total);
        setVisitorsPage(data.page);
        setVisitorsTotalPages(data.totalPages);
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') navigate('/1adminMs1', { replace: true });
    } finally {
      setVisitorsLoading(false);
    }
  }, [navigate]);

  // NEW load masail function
  const loadAdminMasail = useCallback(async (page = 1, search = '') => {
    setMasailLoading(true);
    try {
      const data = await adminFetch(`/masail?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      if (data.success) {
        setMasail(data.masail);
        setMasailTotal(data.total);
        setMasailPage(data.page);
        setMasailTotalPages(data.totalPages);
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') navigate('/1adminMs1', { replace: true });
    } finally {
      setMasailLoading(false);
    }
  }, [navigate]);

  // Load stats when filter changes
  useEffect(() => {
    loadStats(visitFilter, signupFilter);
  }, [visitFilter, signupFilter, loadStats]);

  // Load visitors when page or type changes
  useEffect(() => {
    if (activeTab === 'visitors') {
      loadVisitors(visitorsPage, visitorsType);
    }
  }, [activeTab, visitorsPage, visitorsType, loadVisitors]);

  // Load masail when tab or page changes
  useEffect(() => {
    if (activeTab === 'masail') {
      loadAdminMasail(masailPage, masailSearch);
    }
  }, [activeTab, masailPage, loadAdminMasail]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadStats(visitFilter, signupFilter), loadUsers(), loadReviews()]);
      setLoading(false);
    };
    init();
  }, [loadUsers, loadReviews]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'visitors') {
      await Promise.all([loadStats(visitFilter, signupFilter), loadVisitors(visitorsPage, visitorsType)]);
    } else if (activeTab === 'masail') {
      await Promise.all([loadStats(visitFilter, signupFilter), loadAdminMasail(masailPage, masailSearch)]);
    } else {
      await Promise.all([loadStats(visitFilter, signupFilter), loadUsers(usersPage, userSearch), loadReviews()]);
    }
    setRefreshing(false);
  };

  const handleDeleteMasla = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Masla permanently?')) return;
    setDeleteMaslaLoading(id);
    try {
      const data = await adminFetch(`/masail/${id}`, { method: 'DELETE' });
      if (data.success) {
        setMasail(prev => prev.filter(m => m._id !== id));
        setMasailTotal(prev => prev - 1);
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') navigate('/1adminMs1', { replace: true });
    } finally {
      setDeleteMaslaLoading(null);
    }
  };

  const handleAddMasla = async (e) => {
    e.preventDefault();
    if (!newMasla.question || !newMasla.answer || !newMasla.category) {
      setFormError('Question, Answer and Category are required!');
      return;
    }
    setFormSubmitting(true);
    setFormError('');
    setFormSuccess('');
    try {
      const data = await adminFetch('/masail', {
        method: 'POST',
        body: JSON.stringify(newMasla)
      });
      if (data.success) {
        setFormSuccess('Masla added successfully!');
        setNewMasla({
          question: '',
          answer: '',
          category: 'General',
          authority: 'Mufti Tariq Masood',
          reference: ''
        });
        loadAdminMasail(1, masailSearch);
      } else {
        setFormError(data.message || 'Failed to add Masla.');
      }
    } catch (err) {
      setFormError('Error connecting to server.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    setDeleteLoading(id);
    try {
      const data = await adminFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
      if (data.success) {
        setReviews(prev => prev.filter(r => r._id !== id));
        // Update stats
        loadStats();
      }
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') navigate('/1adminMs1', { replace: true });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUserSearch = (e) => {
    e.preventDefault();
    loadUsers(1, userSearch);
  };

  const handleLogout = () => {
    localStorage.removeItem('namazly_admin_token');
    navigate('/1adminMs1', { replace: true });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0f1a14 0%, #1a372d 50%, #0f2219 100%)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full animate-spin mx-auto mb-4"
            style={{ border: '3px solid rgba(52,211,153,0.2)', borderTopColor: '#34d399' }} />
          <p className="poppins-regular text-emerald-400/60 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f1a14 0%, #1a372d 50%, #0f2219 100%)' }}>

      {/* ─── Top Bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 px-4 md:px-8"
        style={{ background: 'rgba(15,26,20,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-sm font-bold">N</span>
            </div>
            <div>
              <h1 className="poppins-regular text-sm font-bold text-white leading-tight">Namazly Admin</h1>
              <p className="poppins-regular text-[10px] text-white/30">Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 transition-all border-0 cursor-pointer"
              title="Refresh data"
            >
              <HiOutlineRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all border-0 cursor-pointer poppins-regular"
            >
              <HiOutlineLogout className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex="-1" className="max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* ─── Tab Navigation ──────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={HiOutlineChartBar} label="Overview" />
          <TabButton active={activeTab === 'visitors'} onClick={() => setActiveTab('visitors')} icon={HiOutlineGlobe} label="Visitors" />
          <TabButton active={activeTab === 'masail'} onClick={() => { setActiveTab('masail'); loadAdminMasail(1, masailSearch); }} icon={HiOutlineBookOpen} label="Masail" />
          <TabButton active={activeTab === 'users'} onClick={() => { setActiveTab('users'); loadUsers(1, userSearch); }} icon={HiOutlineUsers} label="Users" />
          <TabButton active={activeTab === 'reviews'} onClick={() => { setActiveTab('reviews'); loadReviews(); }} icon={HiOutlineStar} label="Reviews" />
        </div>

        {/* ════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                        */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard icon={HiOutlineUsers} label="Total Users" value={stats.totalUsers} sub="All registered accounts" color="emerald" delay={0} />
              <StatCard icon={HiOutlineCalendar} label="Today's Signups" value={stats.todayUsers} sub="New accounts today" color="blue" delay={50} />
              <StatCard icon={HiOutlineStar} label="Total Reviews" value={stats.totalReviews} sub={`Avg: ${stats.avgRating} ⭐`} color="amber" delay={100} />
              <StatCard icon={HiOutlineGlobe} label="Total Visits" value={stats.totalVisits} sub={`Unique: ${stats.uniqueVisitors}`} color="rose" delay={150} />
              <StatCard icon={HiOutlineDeviceMobile} label="PWA Installs" value={stats.pwaInstalls} sub="App installations" color="violet" delay={200} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VisitorGrowthChart data={stats.visitorGrowth} filter={visitFilter} onFilterChange={setVisitFilter} />
              <UserGrowthChart data={stats.userGrowth} filter={signupFilter} onFilterChange={setSignupFilter} />
            </div>

            {/* Lower Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <MiniBarChart
                  data={stats.ratingDistribution}
                  labels={['1★', '2★', '3★', '4★', '5★']}
                  color="#fbbf24"
                  title="⭐ Rating Distribution"
                />
              </div>
              <div className="lg:col-span-2 rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white/70 poppins-regular mb-4">📊 Conversion Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold poppins-regular">Namaz Calculated</p>
                    <p className="text-3xl font-bold text-white poppins-regular mt-1">{stats.calculatedNamazCount}</p>
                    <p className="text-[10px] text-white/30 poppins-regular mt-1">Total calculations logged</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold poppins-regular">Namaz Managed</p>
                    <p className="text-3xl font-bold text-white poppins-regular mt-1">{stats.namazManagedCount}</p>
                    <p className="text-[10px] text-white/30 poppins-regular mt-1">Adjusted counts logged</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                    <p className="text-xs text-white/40 uppercase tracking-wider font-semibold poppins-regular">Avg Visits / {visitFilter}</p>
                    <p className="text-3xl font-bold text-white poppins-regular mt-1">{stats.avgVisits}</p>
                    <p className="text-[10px] text-white/30 poppins-regular mt-1">In selected timeframe</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Views Table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white/70 poppins-regular flex items-center gap-2">
                  <HiOutlineGlobe className="w-4 h-4 text-emerald-400" />
                  Page Views (Page-wise Visit Counts)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/40 uppercase tracking-wider font-semibold poppins-regular">
                      <th className="px-5 py-3">Page Path (URL)</th>
                      <th className="px-5 py-3 text-right">Views</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80 poppins-regular">
                    {(showAllPageViews ? stats.pageViews : stats.pageViews?.slice(0, 5))?.map((pv, i) => (
                      <tr key={pv._id || i} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3 font-mono text-emerald-300 truncate max-w-xs sm:max-w-lg" title={pv.path}>
                          {pv.path}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-white">
                          {pv.views.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {(!stats.pageViews || stats.pageViews.length === 0) && (
                      <tr>
                        <td colSpan="2" className="px-5 py-8 text-center text-white/20">
                          No page views tracked yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {stats.pageViews && stats.pageViews.length > 5 && (
                <div className="px-5 py-3 border-t border-white/10 text-center">
                  <button
                    onClick={() => setShowAllPageViews(prev => !prev)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold poppins-regular bg-transparent border-0 cursor-pointer"
                  >
                    {showAllPageViews ? 'See Less' : `See More (${stats.pageViews.length - 5} more)`}
                  </button>
                </div>
              )}
            </div>

            {/* Recent Users */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/70 poppins-regular flex items-center gap-2">
                  <HiOutlineUsers className="w-4 h-4 text-emerald-400" />
                  Recent Signups
                </h3>
                <button
                  onClick={() => { setActiveTab('users'); loadUsers(1, ''); }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold poppins-regular bg-transparent border-0 cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {stats.recentUsers?.map((u, i) => (
                  <div key={u._id || i} className="px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                    <img
                      src={u.avatar || '/icon-48.png'}
                      alt={u.name || 'User avatar'}
                      width="32"
                      height="32"
                      className="w-8 h-8 rounded-full border border-white/10 object-cover bg-white/10"
                      onError={(e) => { e.currentTarget.src = '/icon-48.png'; }}
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 font-semibold poppins-regular truncate">{u.name}</p>
                      <p className="text-xs text-white/30 poppins-regular truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] text-white/20 poppins-regular whitespace-nowrap">{formatDate(u.createdAt)}</span>
                  </div>
                ))}
                {(!stats.recentUsers || stats.recentUsers.length === 0) && (
                  <p className="px-5 py-8 text-center text-xs text-white/20 poppins-regular">No users yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* VISITORS TAB                                        */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'visitors' && stats && (
          <div className="space-y-4 animate-fade-in">
            {/* Toggles & Summary info */}
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/10 text-xs">
                <button
                  onClick={() => { setVisitorsType('all'); setVisitorsPage(1); }}
                  className={`px-4 py-2 rounded-lg cursor-pointer border-0 font-semibold transition-all ${
                    visitorsType === 'all' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/60 bg-transparent'
                  }`}
                >
                  All Sessions ({stats.totalVisits})
                </button>
                <button
                  onClick={() => { setVisitorsType('unique'); setVisitorsPage(1); }}
                  className={`px-4 py-2 rounded-lg cursor-pointer border-0 font-semibold transition-all ${
                    visitorsType === 'unique' ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/60 bg-transparent'
                  }`}
                >
                  Unique Visitors ({stats.uniqueVisitors})
                </button>
              </div>
              
              <p className="text-xs text-white/30 poppins-regular">
                Showing {visitors.length} of {visitorsTotal} visitors · Page {visitorsPage} of {visitorsTotalPages}
              </p>
            </div>

            {visitorsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 rounded-full animate-spin border-2 border-emerald-400/30 border-t-emerald-400" />
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">
                          {visitorsType === 'unique' ? 'Visitor (Email / IP)' : 'Session (Email / IP)'}
                        </th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">IP Address</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">Platform / OS</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider text-center">Namaz Calc</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider text-center">Namaz Managed</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider text-center">PWA Install</th>
                        <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">
                          {visitorsType === 'unique' ? 'Last Seen' : 'Date & Time'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {visitors.map((v, i) => {
                        const identifier = v.email || v.ip;
                        const isEmail = !!v.email;
                        return (
                          <tr key={v._id || i} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                {isEmail ? (
                                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-400 font-bold uppercase">
                                    {v.email.charAt(0)}
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-white/40 font-bold">
                                    G
                                  </div>
                                )}
                                <span className={`text-sm font-semibold poppins-regular truncate max-w-[200px] ${isEmail ? 'text-white/80' : 'text-white/50 font-mono text-xs'}`}>
                                  {identifier}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-xs text-white/30 font-mono">{v.ip}</td>
                            <td className="px-5 py-3 text-xs text-white/40 poppins-regular">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                                {parseUserAgent(v.userAgent)}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              {v.calculatedNamaz ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/10">
                                  🕌 Yes
                                </span>
                              ) : (
                                <span className="text-white/20 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {v.namazManaged ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/10">
                                  📊 Yes
                                </span>
                              ) : (
                                <span className="text-white/20 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {v.isPwaInstall ? (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-400 font-semibold border border-violet-500/10">
                                  📱 Yes
                                </span>
                              ) : (
                                <span className="text-white/20 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-xs text-white/30 poppins-regular">
                              {formatDate(v.createdAt)} · {formatTime(v.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                      {visitors.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center text-xs text-white/20 poppins-regular">No visitor sessions recorded yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {visitorsTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setVisitorsPage(prev => Math.max(prev - 1, 1))}
                      disabled={visitorsPage <= 1}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed border-0 cursor-pointer transition-all"
                    >
                      <HiOutlineChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-white/40 poppins-regular px-2">
                      {visitorsPage} / {visitorsTotalPages}
                    </span>
                    <button
                      onClick={() => setVisitorsPage(prev => Math.min(prev + 1, visitorsTotalPages))}
                      disabled={visitorsPage >= visitorsTotalPages}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed border-0 cursor-pointer transition-all"
                    >
                      <HiOutlineChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* USERS TAB                                           */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            {/* Search */}
            <form onSubmit={handleUserSearch} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <HiOutlineSearch className="w-4 h-4 text-white/30" />
                </div>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  aria-label="Search users"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25
                             bg-white/5 border border-white/10 focus:border-emerald-400/40 outline-none transition-all poppins-regular"
                />
              </div>
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-semibold border border-emerald-500/20 hover:bg-emerald-500/30 transition-all cursor-pointer poppins-regular">
                Search
              </button>
            </form>

            {/* Count */}
            <p className="text-xs text-white/30 poppins-regular">
              Showing {users.length} of {usersTotal} users · Page {usersPage} of {usersTotalPages}
            </p>

            {/* Users table */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">User</th>
                    <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider hidden lg:table-cell">Qaza Progress</th>
                    <th className="px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => {
                    const q = u.qazaRecord || {};
                    const totalQaza = (q.fajr || 0) + (q.zohar || 0) + (q.asr || 0) + (q.maghrib || 0) + (q.ishaFarz || 0) + (q.ishaWitr || 0);
                    return (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || '/icon-48.png'} alt={u.name || 'User avatar'} width="32" height="32" className="w-8 h-8 rounded-full border border-white/10 object-cover bg-white/10"
                              onError={(e) => { e.currentTarget.src = '/icon-48.png'; }} loading="lazy" />
                            <span className="text-sm text-white/80 font-semibold poppins-regular truncate max-w-[140px]">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-white/40 poppins-regular hidden md:table-cell">{u.email}</td>
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <span className="text-xs text-white/50 poppins-regular font-mono">
                            {totalQaza > 0 ? `${totalQaza.toLocaleString()} total` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-white/30 poppins-regular whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-xs text-white/20 poppins-regular">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {usersTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => loadUsers(usersPage - 1, userSearch)}
                  disabled={usersPage <= 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed border-0 cursor-pointer transition-all"
                >
                  <HiOutlineChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-white/40 poppins-regular px-2">
                  {usersPage} / {usersTotalPages}
                </span>
                <button
                  onClick={() => loadUsers(usersPage + 1, userSearch)}
                  disabled={usersPage >= usersTotalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed border-0 cursor-pointer transition-all"
                >
                  <HiOutlineChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* REVIEWS TAB                                         */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-white/30 poppins-regular">{reviews.length} reviews total</p>

            <div className="space-y-3">
              {reviews.map((r) => {
                const userName = r.user?.name || r.guestName || 'Anonymous';
                const userAvatar = r.user?.avatar || null;
                const userEmail = r.user?.email || null;
                return (
                  <div key={r._id} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/[0.07] transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {userAvatar ? (
                          <img src={userAvatar} alt={userName} width="36" height="36" className="w-9 h-9 rounded-full border border-white/10 object-cover flex-shrink-0 bg-white/10"
                            onError={(e) => { e.currentTarget.src = '/icon-48.png'; }} loading="lazy" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 text-sm font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white/80 poppins-regular truncate">{userName}</p>
                            {!r.user && <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-400 font-semibold">GUEST</span>}
                          </div>
                          {userEmail && <p className="text-[11px] text-white/25 poppins-regular">{userEmail}</p>}
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={`text-sm ${i < r.rating ? 'text-amber-400' : 'text-white/10'}`}>★</span>
                            ))}
                            <span className="text-xs text-white/20 poppins-regular ml-1">{formatDate(r.createdAt)} · {formatTime(r.createdAt)}</span>
                          </div>
                          <p className="text-sm text-white/60 poppins-regular mt-2 leading-relaxed">{r.comment}</p>
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteReview(r._id)}
                        disabled={deleteLoading === r._id}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border-0 cursor-pointer flex-shrink-0"
                        title="Delete review"
                      >
                        {deleteLoading === r._id
                          ? <div className="w-4 h-4 rounded-full animate-spin border-2 border-rose-400/30 border-t-rose-400" />
                          : <HiOutlineTrash className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-white/20 poppins-regular">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════ */}
        {/* MASAIL TAB                                          */}
        {/* ════════════════════════════════════════════════════ */}
        {activeTab === 'masail' && (
          <div className="space-y-6 animate-fade-in">
            {/* Grid Layout for Form and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to Add New Masla */}
              <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-4 self-start">
                <h3 className="text-sm font-bold text-white poppins-regular flex items-center gap-2">
                  <span>➕</span> Add New Masla
                </h3>
                
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs poppins-regular">
                    ⚠️ {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs poppins-regular">
                    ✅ {formSuccess}
                  </div>
                )}

                <form onSubmit={handleAddMasla} className="space-y-3.5 text-left">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-semibold tracking-wider mb-1.5 poppins-regular">Question / Sawaal</label>
                    <textarea
                      value={newMasla.question}
                      onChange={(e) => setNewMasla(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="e.g. Kya cryptocurrency halal hai?"
                      className="block w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/20 bg-white/5 border border-white/10 focus:border-emerald-400/40 outline-none transition-all poppins-regular resize-none h-20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-semibold tracking-wider mb-1.5 poppins-regular">Answer / Jawaab</label>
                    <textarea
                      value={newMasla.answer}
                      onChange={(e) => setNewMasla(prev => ({ ...prev, answer: e.target.value }))}
                      placeholder="Enter detailed fatwa/answer..."
                      className="block w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/20 bg-white/5 border border-white/10 focus:border-emerald-400/40 outline-none transition-all poppins-regular resize-none h-32"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase font-semibold tracking-wider mb-1.5 poppins-regular">Category</label>
                      <select
                        value={newMasla.category}
                        onChange={(e) => setNewMasla(prev => ({ ...prev, category: e.target.value }))}
                        className="block w-full px-3 py-2 rounded-xl text-xs text-white bg-neutral-900 border border-white/10 focus:border-emerald-400/40 outline-none transition-all poppins-regular h-9 cursor-pointer"
                      >
                        <option value="General">General</option>
                        <option value="Wazu">Wazu</option>
                        <option value="Namaz">Namaz</option>
                        <option value="Ghusl">Ghusl</option>
                        <option value="Roza">Roza</option>
                        <option value="Zakat">Zakat</option>
                        <option value="Cleanliness">Cleanliness</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase font-semibold tracking-wider mb-1.5 poppins-regular">Authority</label>
                      <input
                        type="text"
                        value={newMasla.authority}
                        onChange={(e) => setNewMasla(prev => ({ ...prev, authority: e.target.value }))}
                        placeholder="e.g. Mufti Tariq Masood"
                        className="block w-full px-3 py-2 rounded-xl text-xs text-white placeholder-white/20 bg-white/5 border border-white/10 focus:border-emerald-400/40 outline-none transition-all poppins-regular h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase font-semibold tracking-wider mb-1.5 poppins-regular">Book Reference / Hawala</label>
                    <input
                      type="text"
                      value={newMasla.reference}
                      onChange={(e) => setNewMasla(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="e.g. Ask Mufti Tariq Masood"
                      className="block w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/20 bg-white/5 border border-white/10 focus:border-emerald-400/40 outline-none transition-all poppins-regular h-9"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 poppins-regular"
                  >
                    {formSubmitting ? 'Adding...' : 'Add Masla'}
                  </button>
                </form>
              </div>

              {/* Table of Existing Masail */}
              <div className="lg:col-span-2 space-y-4">
                {/* Search Bar */}
                <form
                  onSubmit={(e) => { e.preventDefault(); loadAdminMasail(1, masailSearch); }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
                      <HiOutlineSearch className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={masailSearch}
                      onChange={(e) => setMasailSearch(e.target.value)}
                      placeholder="Search question or answers..."
                      className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 bg-white/5 border border-white/10 focus:border-emerald-400/40 outline-none transition-all poppins-regular"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-semibold border border-emerald-500/20 hover:bg-emerald-500/30 transition-all cursor-pointer poppins-regular"
                  >
                    Search
                  </button>
                </form>

                {/* Listing Count Info */}
                <p className="text-xs text-white/30 poppins-regular text-left">
                  Showing {masail.length} of {masailTotal} Masail · Page {masailPage} of {masailTotalPages}
                </p>

                {/* Table */}
                {masailLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full animate-spin border-2 border-emerald-400/30 border-t-emerald-400" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
                      <table className="w-full text-left table-fixed">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="w-1/2 px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">Question</th>
                            <th className="w-1/6 px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider">Category</th>
                            <th className="w-1/6 px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider text-center">Views</th>
                            <th className="w-1/6 px-5 py-3 text-xs font-semibold text-white/40 poppins-regular uppercase tracking-wider text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {masail.map((m) => (
                            <tr key={m._id} className="hover:bg-white/5 transition-colors">
                              <td className="px-5 py-3 text-left">
                                <p className="text-sm font-semibold text-white/80 poppins-regular truncate" title={m.question}>
                                  {m.question}
                                </p>
                                <p className="text-[10px] text-white/30 poppins-regular truncate mt-0.5">
                                  Ref: {m.reference || 'N/A'} · By {m.authority}
                                </p>
                              </td>
                              <td className="px-5 py-3 text-left">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/10 uppercase tracking-wider">
                                  {m.category}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-center text-xs text-white/50 font-mono">
                                {m.views || 0}
                              </td>
                              <td className="px-5 py-3 text-center">
                                <button
                                  onClick={() => handleDeleteMasla(m._id)}
                                  disabled={deleteMaslaLoading === m._id}
                                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border-0 cursor-pointer"
                                  title="Delete Masla"
                                >
                                  {deleteMaslaLoading === m._id ? (
                                    <div className="w-4 h-4 rounded-full animate-spin border-2 border-rose-400/30 border-t-rose-400" />
                                  ) : (
                                    <HiOutlineTrash className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                          {masail.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-5 py-10 text-center text-xs text-white/20 poppins-regular">No Masail found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {masailTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <button
                          onClick={() => setMasailPage(prev => Math.max(prev - 1, 1))}
                          disabled={masailPage <= 1}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed border-0 cursor-pointer transition-all"
                        >
                          <HiOutlineChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-white/40 poppins-regular px-2">
                          {masailPage} / {masailTotalPages}
                        </span>
                        <button
                          onClick={() => setMasailPage(prev => Math.min(prev + 1, masailTotalPages))}
                          disabled={masailPage >= masailTotalPages}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 disabled:opacity-30 disabled:cursor-not-allowed border-0 cursor-pointer transition-all"
                        >
                          <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
