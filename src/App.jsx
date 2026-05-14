import React, { useState, useEffect, useRef } from 'react'
import { api } from './api'
import Swal from 'sweetalert2'

const walletSyncChannel = new BroadcastChannel('wallet_sync');

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [showModal, setShowModal] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showPublicRecharge, setShowPublicRecharge] = useState(false)
  
  // Initialize user from sessionStorage if available
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('cafe_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch (err) {
      console.error('Failed to parse saved user:', err)
      sessionStorage.removeItem('cafe_user')
      return null
    }
  })

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('cafe_user', JSON.stringify(user))
    } else {
      sessionStorage.removeItem('cafe_user')
    }
  }, [user])

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('navigate', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('navigate', handleLocationChange)
    }
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new Event('navigate'))
  }

  const handleCloseAddModal = () => {
    setShowModal(false)
    loadCafes()
    loadStats()
    loadSettlements()
  }

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  // Restore path-based access for Super Admin
  if (currentPath === '/super-admin') {
    return (
      <>
        <SuperAdminPanel 
          onLogout={handleLogout} 
          onAddCafe={() => setShowModal(true)} 
          refreshTrigger={showModal}
        />
        {showModal && <AddCafeModal onClose={() => setShowModal(false)} />}
      </>
    )
  }

  // Handle Cafe Admin session
  if (user?.user_type === 'cafe_admin' && user?.user) {
    return <CafeAdminDashboard 
      user={user.user} 
      onLogout={handleLogout} 
      onUpdateUser={(updatedCafe) => setUser({ ...user, user: updatedCafe })}
    />
  }

  return (
    <>
      <LandingPage 
        onNavigate={navigate} 
        onLogin={() => setShowLogin(true)} 
        onRecharge={() => setShowPublicRecharge(true)}
      />
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onLoginSuccess={(userData) => {
            setUser(userData)
            setShowLogin(false)
            Swal.fire({
              title: 'Login Successful!',
              icon: 'success',
              toast: true,
              position: 'top-end',
              timer: 800,
              showConfirmButton: false
            });
          }} 
        />
      )}
      {showPublicRecharge && <PublicRechargeModal onClose={() => setShowPublicRecharge(false)} />}
    </>
  )
}

function LandingPage({ onNavigate, onLogin, onRecharge }) {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon"></div>
          <div className="logo-text">
            <h1>CueTrakk</h1>
            <span>Management System</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="help-text">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Help: +91 7020374328
          </div>
          <button className="login-btn" onClick={onLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Login
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="hero-subtitle">MANAGE. TRACK. ELEVATE.</span>
          <h2>Run Your <span>Snooker Cafe Smarter</span></h2>
          <div className="hero-btns">
            <button className="btn-primary" onClick={onLogin}>Get Started &rarr;</button>
            <button className="btn-secondary" onClick={onRecharge}>Recharge Wallet</button>
          </div>
        </div>
        <div className="features-container">
          <div className="features-grid">
            {[
              { t: 'Table Tracking', p: 'Track table usage in real-time with automatic timer calculation.' },
              { t: 'Table Management', p: 'Manage all your tables, categories and pricing from one dashboard.' },
              { t: 'Smart Billing', p: 'Automatic bill generation with precision accuracy based on play time.' },
              { t: 'Sales & Expense', p: 'Get deep insights into your daily and monthly business performance.' }
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle></svg></div>
                <h3>{f.t}</h3>
                <p>{f.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="footer">
        <p>&copy; 2026 <span>CueTrakk</span> | <a href="/super-admin" className="admin-trigger" onClick={(e) => { if (!e.ctrlKey && !e.metaKey) { e.preventDefault(); onNavigate('/super-admin'); } }}>v1.2.0-b8.dgfj</a></p>
      </footer>
    </div>
  )
}

function SuperAdminPanel({ onLogout, onAddCafe, refreshTrigger }) {
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedCafe, setSelectedCafe] = useState(null)
  const [cafes, setCafes] = useState([])
  const [cafeStats, setCafeStats] = useState([])
  const [stats, setStats] = useState({
    today_earnings: 0,
    monthly_earnings: 0,
    active_cafes: 0,
    today_bookings: 0
  })

  const [globalWalletHistory, setGlobalWalletHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    loadData()
    loadGlobalHistory()
  }, [refreshTrigger])

  const loadGlobalHistory = async () => {
    try {
      setLoadingHistory(true)
      const res = await api.getAllWalletHistory()
      setGlobalWalletHistory(res.data || [])
    } catch (err) {
      console.error('Error loading global history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const loadData = async () => {
    try {
      const cafeData = await api.getCafes()
      setCafes(cafeData.data || [])
      
      // Fetch real stats from backend
      const statsData = await api.getStats()
      setStats({
        today_earnings: statsData.today_earnings || 0,
        monthly_earnings: statsData.monthly_earnings || 0,
        active_cafes: statsData.active_cafes || (cafeData.data || []).length,
        today_bookings: statsData.today_bookings || 0
      })

      // Fetch per-cafe stats (earnings, bookings, recovery)
      try {
        const cafeStatsRes = await api.getSuperAdminCafeStats()
        setCafeStats(cafeStatsRes.data || [])
      } catch (err) {
        console.error('Error loading per-cafe stats:', err)
      }
    } catch (err) {
      console.error('Error loading cafes:', err)
    }
  }

  // Helper: find per-cafe stats by cafe id
  const getCafeStat = (cafeId) => {
    return cafeStats.find(cs => cs.id === cafeId) || { total_earned: 0, wallet_balance: 0, recovery_pct: 0, month_bookings: 0 }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this cafe? All associated data (bookings, tables, sales, expenses) will be permanently removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteCafe(id)
        loadData()
        Swal.fire({
          title: 'Deleted!',
          text: 'Cafe has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6366f1'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  }

  const handleNavigate = (view) => {
    setActiveView(view)
    setSelectedCafe(null)
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-box">P</div>
          <div className="logo-text"><h3>Pool Cafe</h3><span>SUPER</span></div>
        </div>
        <nav className="admin-nav">
          <div className="nav-group">
            <span className="nav-label">MAIN MENU</span>
            <div 
              className={`nav-item ${activeView === 'dashboard' && !selectedCafe ? 'active' : ''}`}
              onClick={() => handleNavigate('dashboard')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Dashboard</span>
            </div>
          </div>
          <div className="nav-group">
            <span className="nav-label">SYSTEM</span>
            <div className="nav-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V11a2 2 0 0 1-2-2 2 2 0 0 1 2-2v-.09A1.65 1.65 0 0 0 4.6 4.6a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              <span>Settings</span>
            </div>
          </div>
          <div className="nav-group">
            <span className="nav-label">REPORTS</span>
            <div 
              className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
              onClick={() => handleNavigate('analytics')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span>Analytics</span>
            </div>
            <div 
              className={`nav-item ${activeView === 'expenses' ? 'active' : ''}`}
              onClick={() => handleNavigate('expenses')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>Expenses</span>
            </div>
          </div>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={onLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search for something..." />
          </div>
          <div className="header-right">
            <div className="notif-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <div className="notif-dot"></div>
            </div>
            <div className="user-profile">
              <div className="user-info"><h4>Super Admin</h4><span>Administrator</span></div>
              <div className="user-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </div>
          </div>
        </header>
        <section className="admin-content">
          {selectedCafe ? (
            <CafeDetailsView 
              cafe={selectedCafe} 
              onBack={() => setSelectedCafe(null)} 
              onRefresh={loadData} 
            />
          ) : activeView === 'dashboard' ? (
            <>
              <div className="content-welcome">
                <div className="welcome-text"><h2>Welcome back, Admin</h2><p>Here is your cafe management dashboard.</p></div>
                <button className="add-cafe-btn" onClick={onAddCafe}>Add New Cafe</button>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon green">₹</div>
                    <span className="stat-tag green">TODAY</span>
                  </div>
                  <span className="stat-label">Today's Earnings</span>
                  <h3 className="stat-value">₹{stats.today_earnings}</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon purple">₹</div>
                    <span className="stat-tag orange">MONTH</span>
                  </div>
                  <span className="stat-label">Monthly Earnings</span>
                  <h3 className="stat-value">₹{stats.monthly_earnings}</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon blue">🏠</div>
                    <span className="stat-tag cyan">ACTIVE</span>
                  </div>
                  <span className="stat-label">Active Cafes</span>
                  <h3 className="stat-value">{stats.active_cafes}</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon orange">📅</div>
                    <span className="stat-tag orange">TODAY</span>
                  </div>
                  <span className="stat-label">Today's Bookings</span>
                  <h3 className="stat-value">{stats.today_bookings}</h3>
                </div>
              </div>
              <div className="data-section">
                <div className="section-header">
                  <h3>Registered Cafes</h3>
                  <button className="refresh-btn" onClick={loadData}>↻ Refresh</button>
                </div>
                <div className="table-container">
                  <table>
                    <thead><tr><th>CAFE NAME</th><th>INVESTMENT</th><th>COMMISSION</th><th>EARNING</th><th>RECOVERY</th><th>WALLET</th><th>ACTION</th></tr></thead>
                    <tbody>
                      {cafes.length > 0 ? cafes.map(cafe => {
                        const cs = getCafeStat(cafe.id)
                        return (
                        <tr key={cafe.id}>
                          <td>
                            <span className="cafe-link" onClick={() => setSelectedCafe(cafe)}>{cafe.name}</span>
                            {cafe.is_demo && <span className="demo-badge">DEMO</span>}
                          </td>
                          <td style={{fontWeight: 600, color: '#64748b'}}>₹{cs.initial_investment || 0}</td>
                          <td>₹{cafe.commission_rs}</td>
                          <td style={{fontWeight: 700, color: '#16a34a'}}>₹{cs.total_earned}</td>
                          <td>
                            <div className="recovery-box">
                              <div className="recovery-info">
                                <span>{cs.recovery_pct}%</span>
                                <span className="recovery-amount">₹{cs.total_earned}/₹{cs.initial_investment}</span>
                              </div>
                              <div className="progress-bar"><div className="fill" style={{width: `${cs.recovery_pct}%`}}></div></div>
                            </div>
                          </td>
                          <td><span className="badge-green">₹{cs.wallet_balance}</span></td>
                          <td><button className="delete-btn" onClick={() => handleDelete(cafe.id)}>🗑️</button></td>
                        </tr>)
                      }) : (
                        <tr className="empty-row"><td colSpan="7">No cafes registered yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="data-section" style={{marginTop: '3rem'}}>
                <div className="section-header">
                  <h3>Global Wallet Transaction History</h3>
                  <button className="refresh-btn" onClick={loadGlobalHistory}>
                    {loadingHistory ? '...' : '↻ Refresh'}
                  </button>
                </div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>CAFE NAME</th>
                        <th>DATE & TIME</th>
                        <th>AMOUNT</th>
                        <th>TRANSACTION ID</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {globalWalletHistory.filter(tx => tx.type === 'credit').length > 0 ? 
                        globalWalletHistory.filter(tx => tx.type === 'credit').map(tx => (
                        <tr key={tx.id}>
                          <td style={{fontWeight: 700, color: '#4f46e5'}}>{tx.cafes?.name || 'Unknown'}</td>
                          <td>{new Date(tx.created_at).toLocaleString()}</td>
                          <td className="green-text" style={{fontWeight: 800}}>+₹{tx.amount}</td>
                          <td style={{fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b'}}>{tx.razorpay_payment_id || 'N/A'}</td>
                          <td>
                            <span className={tx.status === 'success' ? 'badge-green' : 'badge-red'}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr className="empty-row"><td colSpan="5">No global recharges found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : activeView === 'analytics' ? (
            <AnalyticsView />
          ) : (
            <ExpensesView cafes={cafes} onRefreshData={loadData} />
          )}
        </section>
      </main>
    </div>
  )
}

function AnalyticsView() {
  const [stats, setAnalyticsStats] = useState({ today_earnings: 0, monthly_earnings: 0, month_expenses: 0, total_investment: 0, total_all_time_earnings: 0 })
  const [dailyEarnings, setDailyEarnings] = useState([])
  const [analyticsCafeStats, setAnalyticsCafeStats] = useState([])
  const [lastUpdated, setLastUpdated] = useState('')
  const [settlements, setSettlements] = useState([])
  const [settling, setSettling] = useState(false)
  const [pastExpenses, setPastExpenses] = useState(null) // { settlement, expenses }
  const [loadingPastExp, setLoadingPastExp] = useState(false)

  useEffect(() => { loadAnalytics() }, [])

  const loadAnalytics = async () => {
    try {
      const [statsRes, dailyRes, cafeStatsRes] = await Promise.all([
        api.getStats(),
        api.getDailyEarnings(),
        api.getSuperAdminCafeStats()
      ])
      setAnalyticsStats(statsRes)
      setDailyEarnings(dailyRes.data || [])
      setAnalyticsCafeStats(cafeStatsRes.data || [])
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('Error loading analytics:', err)
    }
    // Load settlements separately so a missing table doesn't crash everything
    try {
      const settlementsRes = await api.getPlatformSettlements()
      setSettlements(settlementsRes.data || [])
    } catch (err) {
      console.warn('Platform settlements not available yet (create the table in Supabase):', err.message)
      setSettlements([])
    }
  }

  const handleManualSettle = async () => {
    const result = await Swal.fire({
      title: 'Settle Period?',
      text: 'Settle the current period now? This will create a snapshot of earnings and expenses.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, settle now'
    });

    if (!result.isConfirmed) return
    setSettling(true)
    try {
      await api.manualPlatformSettle()
      Swal.fire({
        title: 'Settled!',
        text: 'Platform settled successfully!',
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });
      loadAnalytics()
    } catch (err) {
      Swal.fire({
        title: 'Failed!',
        text: 'Settlement failed: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setSettling(false)
    }
  }

  const viewPastExpenses = async (settlement) => {
    setLoadingPastExp(true)
    setPastExpenses({ settlement, expenses: [] })
    try {
      const res = await api.getPlatformSettlementExpenses(settlement.id)
      setPastExpenses({ settlement: res.settlement || settlement, expenses: res.data || [] })
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load past expenses: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
      setPastExpenses(null)
    } finally {
      setLoadingPastExp(false)
    }
  }

  const netProfit = (stats.monthly_earnings || 0) - (stats.month_expenses || 0)
  const overallProfitLoss = (stats.total_all_time_earnings || 0) - (stats.total_investment || 0)
  const topCafes = analyticsCafeStats.filter(c => c.total_earned >= 2200)
  const lowCafes = analyticsCafeStats.filter(c => c.total_earned <= 1500)
  const currentMonth = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <div className="header-title">
          <h2>Platform Analytics <span className="live-badge">LIVE</span></h2>
          <p>Real-time platform performance data. Last updated: {lastUpdated || 'Loading...'}</p>
        </div>
        <div className="header-actions">
          <button className="btn-settle" onClick={handleManualSettle} disabled={settling}>{settling ? 'Settling...' : 'Settle This Month'}</button>
          <button className="btn-refresh-outline" onClick={loadAnalytics}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="analytics-stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-circle green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"></path><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
            <span className="stat-badge green">TODAY</span>
          </div>
          <span className="stat-label">Today's Total Earning</span>
          <h3 className="stat-value">₹{stats.today_earnings}</h3>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-circle purple">₹</div>
            <span className="stat-badge purple">MONTH</span>
          </div>
          <span className="stat-label">Total Month Earnings</span>
          <h3 className="stat-value">₹{stats.monthly_earnings}</h3>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-circle red">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 18l-9.5-9.5-5 5L1 6"></path><polyline points="17 18 23 18 23 12"></polyline></svg>
            </div>
            <span className="stat-badge orange">MONTH</span>
          </div>
          <span className="stat-label">Month Global Expenses</span>
          <h3 className="stat-value">₹{stats.month_expenses || 0}</h3>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-circle blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <span className="stat-badge cyan">NET</span>
          </div>
          <span className="stat-label">Net Profit (Profit/Loss)</span>
          <h3 className={`stat-value ${netProfit >= 0 ? 'green-text' : 'red-text'}`}>{netProfit >= 0 ? '+' : ''}₹{netProfit}</h3>
        </div>
      </div>

      <div className="investment-stats-grid">
        <div className="stat-card accent-red">
          <div className="stat-header">
            <div className="stat-icon-box red">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            </div>
            <span className="stat-badge red-fill">TOTAL</span>
          </div>
          <span className="stat-label">Total Initial Investment</span>
          <h3 className="stat-value small">₹{(stats.total_investment || 0).toLocaleString()}</h3>
        </div>
        <div className="stat-card accent-orange">
          <div className="stat-header">
            <div className="stat-icon-box orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <span className="stat-badge orange-fill">NET OVERALL</span>
          </div>
          <span className="stat-label">Overall Profit/Loss (Incl. Investment)</span>
          <h3 className={`stat-value small ${overallProfitLoss >= 0 ? 'green-text' : 'orange-text'}`}>{overallProfitLoss >= 0 ? '+' : ''}₹{overallProfitLoss.toLocaleString()}</h3>
        </div>
      </div>

      <div className="performance-history-grid">
        <div className="styled-table-card top-border-green">
          <div className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ed8936" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <h3>Top Performing Cafes (₹2200+)</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>CAFE NAME</th><th>BOOKINGS</th><th>MONTHLY REVENUE</th></tr>
              </thead>
              <tbody>
                {topCafes.length > 0 ? topCafes.map(c => (
                  <tr key={c.id}><td>{c.name}</td><td>{c.month_bookings}</td><td className="green-text">₹{c.total_earned}</td></tr>
                )) : (
                  <tr className="empty-row"><td colSpan="3">No cafes in this tier.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="styled-table-card top-border-red">
          <div className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f56565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <h3>Low Revenue Cafes (≤ ₹1500)</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>CAFE NAME</th><th>BOOKINGS</th><th>MONTHLY REVENUE</th></tr>
              </thead>
              <tbody>
                {lowCafes.length > 0 ? lowCafes.map(c => (
                  <tr key={c.id}><td>{c.name}</td><td>{c.month_bookings}</td><td className="red-text">₹{c.total_earned}</td></tr>
                )) : (
                  <tr className="empty-row"><td colSpan="3">No cafes in this tier.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="performance-history-grid">
        <div className="styled-table-card">
          <div className="card-title">
            <h3>Daily Earning History</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>DATE</th><th>BOOKINGS</th><th>TOTAL EARNING</th></tr>
              </thead>
              <tbody>
                {dailyEarnings.length > 0 ? dailyEarnings.map((day, idx) => (
                  <tr key={idx}>
                    <td>{day.date_label}</td>
                    <td>{day.bookings}</td>
                    <td className="green-text-dim">₹{day.earnings}</td>
                  </tr>
                )) : (
                  <tr className="empty-row"><td colSpan="3">No data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="styled-table-card">
          <div className="card-title">
            <h3>Platform Settlement History</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>PERIOD</th><th>EARNINGS</th><th>NET PROFIT</th><th>EXPENSES</th></tr>
              </thead>
              <tbody>
                {settlements.length > 0 ? settlements.map(s => (
                  <tr key={s.id}>
                    <td style={{fontWeight: 700}}>{s.month_label}</td>
                    <td style={{color: '#16a34a', fontWeight: 700}}>₹{parseFloat(s.total_earnings || 0).toFixed(0)}</td>
                    <td className={parseFloat(s.net_profit) >= 0 ? 'green-text-dim' : 'red-text'}>₹{parseFloat(s.net_profit || 0).toFixed(0)}</td>
                    <td>
                      <div className="expense-cell" style={{cursor:'pointer'}} onClick={() => viewPastExpenses(s)}>
                        <span style={{color:'#6366f1', fontWeight:700}}>₹{parseFloat(s.total_expenses || 0).toFixed(0)}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr className="empty-row"><td colSpan="4">No settlements yet. They auto-create on the 1st of each month.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {pastExpenses && (
        <div className="modal-overlay" onClick={() => setPastExpenses(null)}>
          <div className="modal-container" style={{maxWidth: '560px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Past Expenses — {pastExpenses.settlement?.month_label}</h2>
              <button className="close-modal" onClick={() => setPastExpenses(null)}>✕</button>
            </div>
            <div className="modal-body">
              {loadingPastExp ? <p style={{textAlign:'center',padding:'2rem'}}>Loading...</p> : (
                pastExpenses.expenses.length > 0 ? (
                  <div className="expense-items-list">
                    {pastExpenses.expenses.map(ex => (
                      <div key={ex.id} className="expense-item-row">
                        <div className="ei-left">
                          <div className="ei-icon-box">{ex.category === 'Salary' ? '👤' : ex.category === 'Software Investment' ? '💻' : '💰'}</div>
                          <div className="ei-details">
                            <span className="ei-cafe-name">{ex.cafes?.name || 'Unknown Cafe'}</span>
                            <span className="ei-name">{ex.name}</span>
                            <span className="ei-date">{new Date(ex.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</span>
                          </div>
                        </div>
                        <span className="ei-amount">₹{parseFloat(ex.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : <p style={{textAlign:'center',color:'#94a3b8',padding:'2rem'}}>No expenses recorded in this period.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



function AddCafeModal({ onClose }) {
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    owner_name: '',
    phone_no: '',
    cafe_type: 'Snooker Pool',
    commission_rs: '',
    username: '',
    password: '',
    inner_password: '',
    initial_investment: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createCafe({
        ...formData,
        commission_rs: parseFloat(formData.commission_rs) || 0,
        initial_investment: parseFloat(formData.initial_investment) || 0,
        is_demo: isDemo
      });
      onClose();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Error registering cafe: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-container" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Add New Cafe</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid">
            {/* Row 1 */}
            <div className="input-group">
              <label className="input-label">🏠 Cafe Name</label>
              <input name="name" required value={formData.name} onChange={handleChange} type="text" className="input-field" placeholder="Ex: Star Cafe" />
            </div>
            <div className="input-group">
              <label className="input-label">📍 Cafe Address</label>
              <input name="address" required value={formData.address} onChange={handleChange} type="text" className="input-field" placeholder="123 Street Name" />
            </div>

            {/* Row 2 */}
            <div className="input-group">
              <label className="input-label">👤 Owner Name</label>
              <input name="owner_name" required value={formData.owner_name} onChange={handleChange} type="text" className="input-field" placeholder="Ex: Rahul Sharma" />
            </div>
            <div className="input-group">
              <label className="input-label">📞 Phone No</label>
              <input name="phone_no" required value={formData.phone_no} onChange={handleChange} type="text" className="input-field" placeholder="9876543210" />
            </div>

            {/* Row 3 */}
            <div className="input-group">
              <label className="input-label">⚙️ Cafe Type</label>
              <select name="cafe_type" value={formData.cafe_type} onChange={handleChange} className="input-field">
                <option>Snooker Pool</option>
                <option>Gaming Zone</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">💰 Commission (RS)</label>
              <input name="commission_rs" required value={formData.commission_rs} onChange={handleChange} type="number" className="input-field" placeholder="Ex: 10" />
            </div>

            {/* Row 4 */}
            <div className="input-group">
              <label className="input-label">🛡️ Username</label>
              <input name="username" required value={formData.username} onChange={handleChange} type="text" className="input-field" placeholder="cafe_login_id" />
            </div>
            <div className="input-group">
              <label className="input-label">🔑 Password</label>
              <input name="password" required value={formData.password} onChange={handleChange} type="password" title="password" className="input-field" placeholder="********" />
            </div>

            {/* Row 5 */}
            <div className="input-group">
              <label className="input-label">🔒 Inner Password</label>
              <input name="inner_password" required value={formData.inner_password} onChange={handleChange} type="password" title="inner password" className="input-field" placeholder="********" />
            </div>
            <div className="input-group">
              <label className="input-label">📉 Initial Investment</label>
              <input name="initial_investment" required value={formData.initial_investment} onChange={handleChange} type="number" className="input-field" placeholder="Ex: 10000" />
            </div>

            {/* Demo Checkbox */}
            <div 
              className={`demo-checkbox-container ${isDemo ? 'checked' : ''}`}
              onClick={() => setIsDemo(!isDemo)}
            >
              <div className="custom-checkbox">
                {isDemo && '✓'}
              </div>
              <div className="checkbox-text">
                <h4>Mark as <span>Demo Cafe</span></h4>
                <p>Data will not reflect in Super Admin platform earnings or stats.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Cafe'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ExpensesView({ cafes, onRefreshData }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ 
    cafe_id: '', 
    name: '', 
    amount: '', 
    category: 'Software Investment', 
    date: new Date().toISOString().split('T')[0] 
  })

  useEffect(() => {
    loadAllExpenses()
  }, [])

  const loadAllExpenses = async () => {
    try {
      setLoading(true)
      const res = await api.getAllExpenses()
      setExpenses(res.data || [])
    } catch (err) {
      console.error('Failed to load global expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.cafe_id || form.cafe_id === 'Choose a cafe...') {
      Swal.fire({
        title: 'Selection Required',
        text: 'Please select a cafe first.',
        icon: 'warning',
        confirmButtonColor: '#6366f1'
      });
      return
    }
    
    try {
      setSubmitting(true)
      const amt = parseFloat(form.amount)
      if (isNaN(amt)) {
        Swal.fire({
          title: 'Invalid Amount',
          text: 'Please enter a valid numeric amount.',
          icon: 'error',
          confirmButtonColor: '#6366f1'
        });
        setSubmitting(false)
        return
      }
      
      await api.addExpense({ ...form, amount: amt })
      setForm({ 
        cafe_id: '', 
        name: '', 
        amount: '', 
        category: 'Software Investment', 
        date: new Date().toISOString().split('T')[0] 
      })
      await loadAllExpenses()
      if (onRefreshData) onRefreshData() // Update global stats
      Swal.fire({
        title: 'Success!',
        text: 'Expense recorded successfully!',
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Error adding expense: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Expense?',
      text: 'Are you sure you want to delete this expense?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return
    try {
      await api.deleteExpense(id)
      loadAllExpenses()
      if (onRefreshData) onRefreshData()
      Swal.fire({
        title: 'Deleted!',
        text: 'Expense has been removed.',
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Error deleting expense: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  // Helper to find cafe name from the local cafes list
  const getCafeName = (ex) => {
    if (ex.cafes?.name) return ex.cafes.name;
    const found = cafes.find(c => c.id === ex.cafe_id);
    return found ? found.name : 'Unknown Cafe';
  }

  return (
    <div className="expenses-view">
      <div className="analytics-header">
        <div className="header-title">
          <h2>Global Expenses</h2>
          <p>Tracking all operational costs across the entire cafe network.</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh-outline" onClick={loadAllExpenses}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Refresh Expenses
          </button>
        </div>
      </div>

      <div className="expenses-grid">
        <div className="expense-card form-card">
          <h3>Add New Expense</h3>
          <form className="expense-form" onSubmit={handleAdd}>
            <div className="input-group">
              <label className="input-label">Select Cafe</label>
              <select 
                className="input-field" 
                value={form.cafe_id}
                onChange={e => setForm({...form, cafe_id: e.target.value})}
                required
              >
                <option value="">Choose a cafe...</option>
                {cafes.map(cafe => (
                  <option key={cafe.id} value={cafe.id}>{cafe.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Expense Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Rent, Electricity" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="0.00" 
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select 
                className="input-field"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option>Software Investment</option>
                <option>Maintenance</option>
                <option>Salary</option>
                <option>Marketing</option>
                <option>Other</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input 
                type="date" 
                className="input-field" 
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                required
              />
            </div>
            <button className="btn-submit-full" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>

        <div className="expense-card log-card">
          <h3>Expense Log</h3>
          <div className="expense-list-container" style={{maxHeight: '600px', overflowY: 'auto'}}>
            {loading ? (
              <div className="empty-log-state">Loading expenses...</div>
            ) : expenses.length > 0 ? (
              <div className="expense-items-list">
                {expenses.map(ex => (
                  <div key={ex.id} className="expense-item-row">
                    <div className="ei-left">
                      <div className="ei-icon-box">
                        {ex.category === 'Salary' ? '👤' : ex.category === 'Software Investment' ? '💻' : '💰'}
                      </div>
                      <div className="ei-details">
                        <span className="ei-cafe-name">{getCafeName(ex)}</span>
                        <span className="ei-name">{ex.name}</span>
                        <span className="ei-date">{new Date(ex.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="ei-right">
                      <span className="ei-amount">₹{parseFloat(ex.amount).toLocaleString()}</span>
                      <button className="ei-delete-btn" onClick={() => handleDelete(ex.id)} title="Delete Expense">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-log-state">
                <p>No expenses recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CafeDetailsView({ cafe, onBack, onRefresh }) {
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(false)
  const [walletHistory, setWalletHistory] = useState([])
  const [cafeStats, setCafeStats] = useState({
    today_bookings: 0,
    today_earnings: 0,
    monthly_earnings: 0,
    monthly_recharges: 0,
    monthly_expenses: 0,
    net_profit: 0
  })
  const [settingsForm, setSettingsForm] = useState({
    username: cafe.username || '',
    password: cafe.password || '',
    inner_password: cafe.inner_password || '',
    commission_rs: cafe.commission_rs || 0
  })

  useEffect(() => {
    fetchCafeData()
  }, [cafe.id])

  const fetchCafeData = async () => {
    try {
      setLoading(true)
      // 1. Fetch Wallet History (all transactions)
      const histRes = await api.getWalletHistory(cafe.id)
      setWalletHistory(histRes.data || [])

      // 2. Fetch detailed stats from super-admin endpoint
      const detailStats = await api.getCafeDetailStats(cafe.id)
      
      // Calculate monthly recharges from wallet history
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()
      const monthlyRecharges = (histRes.data || [])
        .filter(tx => {
          const d = new Date(tx.created_at)
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear && tx.type === 'credit' && tx.status === 'success'
        })
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)

      setCafeStats({
        today_bookings: detailStats.today_bookings || 0,
        today_earnings: detailStats.today_commission || 0,
        monthly_earnings: detailStats.monthly_commission || 0,
        monthly_recharges: monthlyRecharges,
        monthly_expenses: detailStats.monthly_expenses || 0,
        net_profit: detailStats.net_profit || 0
      })
    } catch (err) {
      console.error('Error fetching cafe detail data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    const result = await Swal.fire({
      title: 'Reset System?',
      text: 'WARNING: This will permanently delete ALL bookings, sales, expenses, and wallet history for this cafe. Table and Menu configurations will be preserved. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, reset everything!'
    });

    if (!result.isConfirmed) return
    
    try {
      setLoading(true)
      await api.resetCafe(cafe.id)
      Swal.fire({
        title: 'Reset Complete!',
        text: 'System reset successfully! All historical data cleared.',
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });
      if (onRefresh) onRefresh()
      fetchCafeData()
    } catch (err) {
      Swal.fire({
        title: 'Reset Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      const newCommission = parseFloat(settingsForm.commission_rs)
      const updateData = {
        username: settingsForm.username,
        password: settingsForm.password,
        inner_password: settingsForm.inner_password,
        commission_rs: newCommission
      }
      
      // Ensure the cafe's internal platform fee doesn't exceed the new super-admin commission
      if (cafe.admin_commission_amount > newCommission) {
        updateData.admin_commission_amount = newCommission
      }

      await api.updateCafeSettings(cafe.id, updateData)
      Swal.fire({
        title: 'Updated!',
        text: 'Settings updated successfully!',
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });
      if (onRefresh) onRefresh()
      fetchCafeData()
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Error updating settings: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="cafe-details-view">
      <div className="analytics-header">
        <div className="header-title">
          <h2>{cafe.name}</h2>
          <p>Manage and monitor {cafe.name}'s performance and settings.</p>
        </div>
        <div className="header-actions">
          <button className="btn-back" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="view-tabs">
        <div className={`view-tab ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          Overview
        </div>
        <div className={`view-tab ${activeTab === 'Settings' ? 'active' : ''}`} onClick={() => setActiveTab('Settings')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V11a2 2 0 0 1-2-2 2 2 0 0 1 2-2v-.09A1.65 1.65 0 0 0 4.6 4.6a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          Settings
        </div>
        <div className={`view-tab ${activeTab === 'Legal & Setup' ? 'active' : ''}`} onClick={() => setActiveTab('Legal & Setup')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Legal & Setup
        </div>
        <div className={`view-tab ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Profile
        </div>
      </div>

      {activeTab === 'Overview' && (
        <>
          <div className="analytics-stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-circle blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <span className="stat-badge cyan">TODAY</span>
              </div>
               <span className="stat-label">Today's Booking</span>
               <h3 className="stat-value">{cafeStats.today_bookings}</h3>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-circle green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"></path><polyline points="17 6 23 6 23 12"></polyline></svg>
                </div>
                <span className="stat-badge green">TODAY</span>
              </div>
               <span className="stat-label">Today's Platform Earning</span>
               <h3 className="stat-value">₹{cafeStats.today_earnings}</h3>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-circle purple">₹</div>
                <span className="stat-badge purple">MONTH</span>
              </div>
               <span className="stat-label">Month Platform Earning</span>
               <h3 className="stat-value">₹{cafeStats.monthly_earnings}</h3>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-circle blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
                </div>
                <span className="stat-badge cyan">WALLET</span>
              </div>
               <span className="stat-label">Current Balance</span>
               <h3 className="stat-value green-text">₹{cafe.wallet_balance || 0}</h3>
            </div>
          </div>

          <div className="cafe-stats-row-3">
            <div className="stat-card accent-orange">
              <div className="stat-header">
                <div className="stat-icon-box orange">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
                </div>
                <span className="stat-badge orange-fill">EXPENSES</span>
              </div>
              <span className="stat-label">Current Month Expenses</span>
              <h3 className="stat-value small">₹{cafeStats.monthly_expenses}</h3>
            </div>
            <div className="stat-card accent-green">
              <div className="stat-header">
                <div className="stat-icon-box green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"></path><polyline points="17 6 23 6 23 12"></polyline></svg>
                </div>
                <span className="stat-badge green-fill">NET</span>
              </div>
              <span className="stat-label">Net Profit (After Expenses)</span>
              <h3 className={`stat-value small ${cafeStats.net_profit >= 0 ? 'green-text' : 'red-text'}`}>{cafeStats.net_profit >= 0 ? '+' : ''}₹{cafeStats.net_profit}</h3>
            </div>
            <div className="stat-card accent-purple">
              <div className="stat-header">
                <div className="stat-icon-box purple">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                </div>
                <span className="stat-badge purple-fill">MONTH</span>
              </div>
               <span className="stat-label">Month Wallet Recharges</span>
               <h3 className="stat-value small purple-text">₹{cafeStats.monthly_recharges}</h3>
            </div>
          </div>

          <div className="performance-history-grid">
            <div className="styled-table-card">
              <div className="card-title">
                <h3>Wallet History</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>DATE</th><th>TYPE</th><th>AMOUNT</th><th>STATUS</th></tr>
                  </thead>
                   <tbody>
                    {walletHistory.filter(tx => tx.type === 'credit').length > 0 ? 
                      walletHistory.filter(tx => tx.type === 'credit').slice(0, 10).map(tx => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.created_at).toLocaleString()}</td>
                          <td><span className={`type-badge ${tx.type}`}>{tx.type.toUpperCase()}</span></td>
                          <td className="green-text">+₹{tx.amount}</td>
                          <td><span className={`status-badge ${tx.status}`}>{tx.status}</span></td>
                        </tr>
                      )) : (
                        <tr className="empty-row"><td colSpan="4">No recharges found.</td></tr>
                      )}
                   </tbody>
                </table>
              </div>
            </div>
            <div className="styled-table-card">
              <div className="card-title">
                <h3>Settlement History</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>MONTH</th><th>EARNINGS</th><th>PROFIT</th></tr>
                  </thead>
                  <tbody>
                    <tr className="empty-row"><td colSpan="3">No history found.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Settings' && (
        <div className="cafe-settings-container">
          <div className="settings-card">
            <h3>Cafe Settings</h3>
            <div className="settings-form-grid">
              <div className="input-group">
                <label className="input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Username
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={settingsForm.username} 
                  onChange={e => setSettingsForm({...settingsForm, username: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Password
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={settingsForm.password} 
                  onChange={e => setSettingsForm({...settingsForm, password: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Inner Password
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={settingsForm.inner_password} 
                  onChange={e => setSettingsForm({...settingsForm, inner_password: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label className="input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  Commission (₹)
                </label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={settingsForm.commission_rs} 
                  onChange={e => setSettingsForm({...settingsForm, commission_rs: e.target.value})}
                />
              </div>
            </div>
            <button className="btn-save-settings" onClick={handleSaveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>

            <div className="danger-zone">
              <h4 className="danger-title">Danger Zone</h4>
              <p className="danger-desc">Resetting the system will clear all active sessions and booking data for this cafe. This action cannot be undone.</p>
              <button className="btn-reset-system" onClick={handleReset} disabled={loading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                {loading ? 'Resetting...' : 'Reset System'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Legal & Setup' && (
        <div className="legal-setup-grid">
          <div className="legal-card main-details">
            <div className="card-header-icon blue">
              <div className="header-icon-circle blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <h3>Agreement Details</h3>
            </div>
            <div className="legal-form">
              <div className="input-group">
                <label className="input-label">Owner Full Name</label>
                <input type="text" className="input-field" defaultValue={cafe.owner_name} />
              </div>
              <div className="input-group">
                <label className="input-label">Business Address</label>
                <input type="text" className="input-field" defaultValue={cafe.address} />
              </div>
              <div className="form-row-2">
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input type="text" className="input-field" defaultValue={cafe.phone_no} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="text" className="input-field" placeholder="N/A" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="input-group">
                  <label className="input-label">Agreement Date</label>
                  <input type="date" className="input-field" defaultValue="2026-05-06" />
                </div>
                <div className="input-group">
                  <label className="input-label">Contract Period (Years)</label>
                  <input type="text" className="input-field" defaultValue="3" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Commission Details (for Agreement)</label>
                <input type="text" className="input-field" defaultValue={`₹${cafe.commission_rs}`} />
              </div>
              <div className="legal-actions">
                <button className="btn-save-dark">Save Info</button>
                <button className="btn-download-template">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Download Template
                </button>
              </div>
            </div>
          </div>

          <div className="legal-right-column">
            <div className="legal-card upload-card">
              <div className="card-header-icon green">
                <div className="header-icon-circle green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <h3>Signed Agreement</h3>
              </div>
              <div className="upload-box">
                <svg className="upload-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <p>Upload the scanned copy of the signed agreement (Max 20MB).</p>
                <button className="btn-select-file">Select PDF File</button>
              </div>
            </div>

            <div className="legal-card upload-card">
              <div className="card-header-between">
                <div className="card-header-icon red">
                  <div className="header-icon-circle red">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </div>
                  <h3>Setup Proofs</h3>
                </div>
                <button className="btn-add-photo">+ Add Photo</button>
              </div>
              <div className="upload-box empty">
                <svg className="camera-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                <p>No setup photos captured yet.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Profile' && (
        <div className="profile-tab-content">
          <div className="profile-header-box">
            <div className="profile-icon-large">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <div className="profile-title-group">
              <h3>Cafe Profile Information</h3>
              <p>Comprehensive details of the registered cafe entity.</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-section">
              <h4 className="section-title-small">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                BASIC INFORMATION
              </h4>
              <div className="detail-item">
                <span className="detail-label">CAFE NAME</span>
                <span className="detail-value heavy">{cafe.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">OWNER NAME</span>
                <span className="detail-value heavy">{cafe.owner_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">BUSINESS TYPE</span>
                <span className="business-type-badge">{cafe.cafe_type || 'Snooker Pool'}</span>
              </div>
            </div>

            <div className="profile-section">
              <h4 className="section-title-small">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                CONTACT & LOCATION
              </h4>
              <div className="detail-item">
                <span className="detail-label">PHONE NUMBER</span>
                <span className="detail-value heavy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  {cafe.phone_no}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">ADDRESS</span>
                <span className="detail-value">{cafe.address}</span>
              </div>
            </div>
          </div>

          <div className="profile-config-cards">
            <div className="config-card blue-tint">
              <h4 className="config-title blue">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                SYSTEM ACCESS
              </h4>
              <div className="config-item">
                <span className="detail-label">USERNAME</span>
                <span className="username-tag">{cafe.username}</span>
              </div>
              <div className="config-item">
                <span className="detail-label">ADMIN PASSWORD</span>
                <span className="detail-value heavy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  {cafe.password}
                </span>
              </div>
              <div className="config-item">
                <span className="detail-label">INNER SECURITY PASSWORD</span>
                <span className="detail-value heavy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  {cafe.inner_password}
                </span>
              </div>
            </div>

            <div className="config-card green-tint">
              <h4 className="config-title green">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                FINANCIAL CONFIG
              </h4>
              <div className="config-item">
                <span className="detail-label">INITIAL INVESTMENT</span>
                <h3 className="config-value-large">₹{cafe.initial_investment}</h3>
              </div>
              <div className="config-item">
                <span className="detail-label">COMMISSION RATE</span>
                <h3 className="config-value-large">₹{cafe.commission_rs}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LoginModal({ onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.login(username, password)
      onLoginSuccess(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-login-overlay" onClick={onClose}>
      <div className="login-glass-card" onClick={e => e.stopPropagation()}>
        <div className="login-left-brand">
          <div className="brand-circle">P</div>
          <div className="brand-info">
            <h2>PoolCafe</h2>
            <p>Admin Control Panel</p>
          </div>
        </div>
        
        <form className="login-right-form" onSubmit={handleSubmit}>
          <div className="form-header">
            <h1>Welcome Back</h1>
            <p>Enter your cafe credentials to access your dashboard</p>
          </div>



          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </button>

          <button type="button" className="login-back-btn" onClick={onClose}>
            ← Back to Home
          </button>
        </form>
      </div>
    </div>
  )
}

function CafeAdminDashboard({ user, onLogout, onUpdateUser }) {

  const [activeTab, setActiveTab] = useState('dashboard')
  const [tables, setTables] = useState([])
  const [activeBookings, setActiveBookings] = useState([])
  const [bookingItems, setBookingItems] = useState({}) 
  const [menuItems, setMenuItems] = useState([])
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showTakeAwayModal, setShowTakeAwayModal] = useState(false)
  const [showOrderItemModal, setShowOrderItemModal] = useState(false)
  const [showOrderReviewModal, setShowOrderReviewModal] = useState(false)
  const [activeBookingForOrder, setActiveBookingForOrder] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)
  const [checkoutData, setCheckoutData] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showWalletModal, setShowWalletModal] = useState(false)

  // Inner password lock (resets on page refresh)
  const [innerUnlocked, setInnerUnlocked] = useState(false)
  const [showInnerPasswordModal, setShowInnerPasswordModal] = useState(false)
  const [innerPasswordInput, setInnerPasswordInput] = useState('')
  const [innerPasswordError, setInnerPasswordError] = useState('')
  const [pendingTab, setPendingTab] = useState(null)

  const lockedTabs = ['analytics', 'expenses', 'settings']

  const handleTabClick = (tab) => {
    if (lockedTabs.includes(tab) && !innerUnlocked) {
      setPendingTab(tab)
      setInnerPasswordInput('')
      setInnerPasswordError('')
      setShowInnerPasswordModal(true)
      return
    }
    setActiveTab(tab)
  }

  const handleInnerPasswordSubmit = (e) => {
    e.preventDefault()
    if (innerPasswordInput === user.inner_password) {
      setInnerUnlocked(true)
      setShowInnerPasswordModal(false)
      setInnerPasswordInput('')
      setInnerPasswordError('')
      if (pendingTab) {
        setActiveTab(pendingTab)
        setPendingTab(null)
      }
    } else {
      setInnerPasswordError('Incorrect password. Please try again.')
    }
  }

  useEffect(() => {
    // Parallelize initial load for maximum speed
    const initLoad = async () => {
      loadCafeDetails()
      loadTables()
      loadActiveBookings()
      loadMenu()
    }
    initLoad()

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    // Periodically refresh cafe details (wallet, commission) every 10 seconds for multi-device sync
    const detailTimer = setInterval(loadCafeDetails, 10000)

    // Real-time sync for same-browser multi-tab updates
    const handleSync = (event) => {
      if (event.data.type === 'WALLET_UPDATED' && event.data.cafeId === user.id) {
        console.log("Real-time wallet sync triggered");
        loadCafeDetails();
      }
    };
    walletSyncChannel.addEventListener('message', handleSync);

    return () => {
      clearInterval(timer)
      clearInterval(detailTimer)
      walletSyncChannel.removeEventListener('message', handleSync);
    }
  }, [user.id])

  const loadCafeDetails = async () => {
    try {
      const res = await api.getCafeDetails(user.id)
      if (res.data) {
        const freshData = res.data
        // Auto-correction: if super-admin reduced the limit below current active fee
        if (freshData.admin_commission_amount > freshData.commission_rs) {
          const correctedAmount = freshData.commission_rs
          await api.updateCafeSettings(user.id, { admin_commission_amount: correctedAmount })
          freshData.admin_commission_amount = correctedAmount
        }
        onUpdateUser(freshData)
      }
    } catch (err) {
      console.error('Failed to load cafe details:', err)
    }
  }

  const loadMenu = async () => {
    try {
      const res = await api.getMenuItems(user.id)
      setMenuItems(res.data || [])
    } catch (err) {
      console.error('Failed to load menu:', err)
    }
  }

  const loadActiveBookings = async () => {
    try {
      const res = await api.getActiveBookings(user.id)
      const bookings = res.data || []
      setActiveBookings(bookings)
      
      // Update item counts incrementally in background so tables appear instantly
      bookings.forEach(async (b) => {
        try {
          const itemRes = await api.getBookingItems(b.id)
          setBookingItems(prev => ({
            ...prev,
            [b.id]: itemRes.data || []
          }))
        } catch (e) {
          console.error(`Error loading items for booking ${b.id}:`, e)
        }
      })
    } catch (err) {
      console.error('Failed to load active bookings:', err)
    }
  }

  const loadTables = async () => {
    try {
      const res = await api.getTables(user.id)
      setTables(res.data || [])
    } catch (err) {
      console.error('Failed to load tables:', err)
    }
  }

  const totalPhysicalTables = tables.reduce((acc, t) => acc + (parseInt(t.quantity) || 0), 0)
  const activeSessionCount = activeBookings.length

  const handleStartSession = async (customerName, customerPhone) => {
    if (!selectedTable) return;

    // Wallet Balance Check
    if (user.wallet_balance < 25) {
      Swal.fire({
        title: 'System Suspended',
        text: `Your wallet balance (₹${user.wallet_balance}) is below the minimum required limit of ₹25. Please recharge your wallet to start new table sessions.`,
        icon: 'error',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'Recharge Now'
      }).then((result) => {
        if (result.isConfirmed) {
          setShowWalletModal(true);
        }
      });
      return;
    }

    try {
      const bookingData = {
        cafe_id: user.id,
        table_id: `${selectedTable.typeId}-${selectedTable.index}`,
        table_name: selectedTable.displayName,
        customer_name: customerName || 'Walk-in',
        customer_phone: customerPhone || 'No Phone',
        start_time: new Date().toISOString(),
        price_per_hour: parseFloat(selectedTable.price) || 0
      }
      await api.startBooking(bookingData)
      setShowSessionModal(false)
      loadActiveBookings()
      Swal.fire({
        title: 'Session Started!',
        text: `${selectedTable.displayName} is now active.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: 'Start Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  const handleEndSession = (bookingId) => {
    const booking = activeBookings.find(b => b.id === bookingId)
    if (!booking) return;
    const start = new Date(booking.start_time)
    const now = new Date()
    const diffMs = now - start
    const hours = diffMs / (1000 * 60 * 60)
    const h = Math.floor(diffMs / 3600000)
    const m = Math.floor((diffMs % 3600000) / 60000)
    const durationText = `${h}h ${m}m 0s`
    let pricePerHour = parseFloat(booking.price_per_hour) || 0
    let resolvedTableType = booking.table_name?.toLowerCase().includes('take') ? 'Take Away' : 'Table Dine-in'
    
    if (tables.length > 0) {
      const matched = tables.find(t => (booking.table_name || "").toLowerCase().includes(t.name.toLowerCase()))
      if (matched) {
        if (pricePerHour === 0) pricePerHour = parseFloat(matched.price) || 0
        resolvedTableType = matched.name
      }
    }
    
    const timeCharge = Math.max(0, Math.round(hours * pricePerHour))
    const items = bookingItems[bookingId] || []
    const itemsCharge = items.reduce((acc, item) => acc + (parseFloat(item.price || 0) * (item.quantity || 1)), 0)
    
    // Disable platform fees for Takeaway orders
    const isTakeAway = booking.table_name?.toLowerCase().includes('take')
    const platformFees = (user.is_commission_active && !isTakeAway) ? (parseFloat(user.admin_commission_amount) || 0) : 0
    
    setCheckoutData({
      bookingId, tableName: booking.table_name, customerName: booking.customer_name,
      customerPhone: booking.customer_phone, duration: durationText, pricePerHour,
      timeCharge, itemsCharge, items, platformFees, subtotal: timeCharge + itemsCharge,
      total: timeCharge + itemsCharge + platformFees, endTime: now.toISOString(),
      tableType: resolvedTableType
    })
    setShowCheckoutModal(true)
  }

  const confirmCheckout = async (bookingId, finalData) => {
    // Optimistic UI Update: Instantly close modal and free up the table in the UI
    setShowCheckoutModal(false)
    setActiveBookings(prev => prev.filter(b => b.id !== bookingId))

    try {
      // Perform the actual API call
      await api.endBooking(bookingId, finalData)
      
      // Refresh data in background to ensure everything is in sync
      loadActiveBookings()
      loadCafeDetails()
      
      // Show a quick non-blocking toast
      Swal.fire({
        title: 'Paid & Table Freed!',
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 2500,
        showConfirmButton: false,
        background: '#fff',
        color: '#10b981',
        iconColor: '#10b981'
      });
    } catch (err) {
      Swal.fire({
        title: 'Checkout Error',
        text: 'Failed to record checkout: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
      // Restore correct state from server
      loadActiveBookings()
    }
  }

  const formatDuration = (startTime) => {
    const start = new Date(startTime)
    const diff = Math.floor((currentTime - start) / 1000)
    if (diff < 0) return "00:00:00"
    const h = Math.floor(diff / 3600).toString().padStart(2, '0')
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
    const s = (diff % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  return (
    <div className="cafe-admin-layout">
      <aside className="cafe-sidebar">
        <div className="cafe-logo"><div className="logo-p">P</div><h3>PoolCafe</h3></div>
        <nav className="cafe-nav">
          <div className={`cafe-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>Dashboard</span>
          </div>
          <div className={`cafe-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => handleTabClick('history')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>History</span>
          </div>
          <div className={`cafe-nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabClick('analytics')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            <span>Analytics</span>
            <svg className="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {innerUnlocked ? (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></>
              ) : (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></>
              )}
            </svg>
          </div>
          <div className={`cafe-nav-item ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => handleTabClick('expenses')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>Expenses</span>
            <svg className="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {innerUnlocked ? (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></>
              ) : (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></>
              )}
            </svg>
          </div>
          <div className={`cafe-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V11a2 2 0 0 1-2-2 2 2 0 0 1 2-2v-.09A1.65 1.65 0 0 0 4.6 4.6a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings</span>
            <svg className="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {innerUnlocked ? (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></>
              ) : (
                <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></>
              )}
            </svg>
          </div>
        </nav>
        <div className="cafe-sidebar-footer"><div className="logout-action" onClick={onLogout}><span>Logout</span></div></div>
      </aside>

      <main className="cafe-main">
        <header className="cafe-header">
          <h2>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'history' ? 'History' : activeTab === 'analytics' ? 'Analytics' : activeTab === 'expenses' ? 'Expenses' : 'Settings'}</h2>
          <div className="header-right-new">
            <span className="user-role">Super Admin</span>
            <div className="user-avatar-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </header>

        <section className="cafe-content" style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
            {user.wallet_balance < 30 && (
              <div className={`wallet-alert-banner ${user.wallet_balance < 25 ? 'critical' : 'warning'}`}>
                <div className="alert-content">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {user.wallet_balance < 25 ? (
                    <p><strong>CRITICAL:</strong> Wallet balance is below ₹25. Table bookings are suspended. Recharge immediately!</p>
                  ) : (
                    <p><strong>WARNING:</strong> Wallet balance is low (₹{user.wallet_balance}). Please recharge soon.</p>
                  )}
                </div>
                <button className="btn-recharge-now" onClick={() => setShowWalletModal(true)}>RECHARGE NOW</button>
              </div>
            )}
            <div className="cafe-stats-grid">
               <div className="cafe-stat-card">
                 <span className="stat-label">Total Tables</span>
                 <h1>{totalPhysicalTables}</h1>
               </div>
               <div className="cafe-stat-card green-tint">
                 <span className="stat-label">Active Sessions</span>
                 <h1>{activeSessionCount}</h1>
               </div>
               <div className="cafe-stat-card">
                 <span className="stat-label">Available Tables</span>
                 <h1>{totalPhysicalTables - activeSessionCount}</h1>
               </div>
               <div className="cafe-stat-card blue-tint clickable-card" onClick={() => setShowWalletModal(true)}>
                 <span className="stat-label">Wallet Balance</span>
                 <h1>₹{user.wallet_balance || 0}</h1>
                 <span className="card-hint">Click to recharge</span>
               </div>
            </div>

            <div className="tables-grid">
              {tables.map(tableType => (
                Array.from({ length: parseInt(tableType.quantity) || 0 }).map((_, i) => {
                  const tableUid = `${tableType.id}-${i}`;
                  const activeBooking = activeBookings.find(b => b.table_id === tableUid);
                  const isBusy = !!activeBooking;
                  return (
                    <div key={tableUid} className={`table-card-v2 ${isBusy ? 'busy' : ''}`}>
                      <div className="card-top" style={{ marginBottom: '1.5rem' }}>
                        <h2>Table {i + 1}</h2>
                        <span className="type-label">{(tableType.name || 'Small Table').toUpperCase()}</span>
                        <div className="price-badge">₹{tableType.price}/hr</div>
                      </div>
                      {isBusy ? (
                        <div className="busy-content">
                          <div className="busy-badge-top">● BUSY</div>
                          
                          <div className="timer-display-v2">{formatDuration(activeBooking.start_time)}</div>
                          
                          <div className="customer-info-area">
                            <div className="customer-name-text">{activeBooking.customer_name}</div>
                            <div className="customer-phone-text">{activeBooking.customer_phone || 'No Phone'}</div>
                          </div>

                          <div className="busy-actions-footer">
                            <div className="action-pill-btn-green" onClick={() => { setActiveBookingForOrder(activeBooking); setShowOrderItemModal(true); }}>+</div>
                            <button className="btn-end-table-main" onClick={() => handleEndSession(activeBooking.id)}>END TABLE</button>
                            <div className="action-pill-btn-grey" onClick={() => { setActiveBookingForOrder(activeBooking); setShowOrderReviewModal(true); }} style={{position: 'relative'}}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                              {(bookingItems[activeBooking.id] || []).length > 0 && (
                                <span className="item-count-badge-red">
                                  {(bookingItems[activeBooking.id] || []).length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="card-action-area" onClick={() => {
                          if ((user.wallet_balance || 0) < 25) {
                            Swal.fire({
                              title: 'Insufficient Balance',
                              text: `Your balance is ₹${user.wallet_balance || 0}, which is below the ₹25 limit. Please recharge to start a new session.`,
                              icon: 'error',
                              confirmButtonColor: '#6366f1',
                              confirmButtonText: 'Recharge Now'
                            }).then(res => {
                              if (res.isConfirmed) setShowWalletModal(true)
                            })
                            return
                          }
                          setSelectedTable({ typeId: tableType.id, index: i, displayName: `${tableType.name} ${i + 1}`, price: tableType.price });
                          setShowSessionModal(true);
                        }}>
                          <div className="plus-box-new">+</div>
                          <span className="start-text">START</span>
                        </div>
                      )}
                    </div>
                  );
                })
              ))}
              <div className="take-away-card-v2" onClick={() => {
                if ((user.wallet_balance || 0) < 25) {
                  Swal.fire({
                    title: 'Insufficient Balance',
                    text: `Your balance is ₹${user.wallet_balance || 0}, which is below the ₹25 limit. Please recharge to start a takeaway order.`,
                    icon: 'error',
                    confirmButtonColor: '#6366f1',
                    confirmButtonText: 'Recharge Now'
                  }).then(res => {
                    if (res.isConfirmed) setShowWalletModal(true)
                  })
                  return
                }
                setShowTakeAwayModal(true)
              }}>
                <div className="card-top">
                  <h2>Take Away</h2>
                  <span className="type-label-white">CAFÉ ORDERS</span>
                </div>
                <div className="card-action-area">
                  <div className="plus-box-white">+</div>
                </div>
              </div>
            </div>
          </section>

        <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
          <CafeHistoryView cafeId={user.id} activeTab={activeTab} />
        </div>
        
        <div style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
          <CafeAnalyticsView cafeId={user.id} activeTab={activeTab} />
        </div>
        
        <div style={{ display: activeTab === 'expenses' ? 'block' : 'none' }}>
          <CafeExpensesView cafeId={user.id} activeTab={activeTab} />
        </div>
        
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <CafeSettingsView 
            cafeId={user.id} 
            onRefresh={loadTables} 
            onRefreshMenu={loadMenu}
            user={user} 
            onUpdateUser={onUpdateUser} 
          />
        </div>
      </main>

      {showSessionModal && <StartSessionModal table={selectedTable} onClose={() => setShowSessionModal(false)} onStart={handleStartSession} />}
      {showCheckoutModal && <CheckoutModal data={checkoutData} user={user} onClose={() => setShowCheckoutModal(false)} onConfirm={confirmCheckout} />}
      {showOrderItemModal && <OrderItemModal booking={activeBookingForOrder} menu={menuItems} items={bookingItems[activeBookingForOrder?.id] || []} onClose={() => setShowOrderItemModal(false)} onSuccess={loadActiveBookings} />}
      {showOrderReviewModal && <OrderReviewModal booking={activeBookingForOrder} items={bookingItems[activeBookingForOrder?.id] || []} onClose={() => setShowOrderReviewModal(false)} onRefresh={loadActiveBookings} />}
      {showTakeAwayModal && <TakeAwayModal cafeId={user.id} menu={menuItems} user={user} onClose={() => setShowTakeAwayModal(false)} />}
      {showWalletModal && (
        <WalletRechargeModal 
          user={user} 
          onClose={() => setShowWalletModal(false)} 
          onSuccess={(newBalance) => {
            onUpdateUser({ ...user, wallet_balance: newBalance })
          }} 
        />
      )}

      {/* Inner Password Lock Modal */}
      {showInnerPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowInnerPasswordModal(false)}>
          <form className="modal-container session-modal" onClick={e => e.stopPropagation()} onSubmit={handleInnerPasswordSubmit} style={{maxWidth: '380px'}}>
            <div className="modal-header">
              <h2>🔒 Secured Section</h2>
              <button type="button" className="close-modal" onClick={() => setShowInnerPasswordModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{padding: '2rem', textAlign: 'center'}}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem', boxShadow: '0 8px 24px rgba(99,102,241,0.25)'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <p style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', lineHeight: 1.5}}>
                Enter your inner security password to access this section
              </p>
              <input 
                type="password" 
                className="input-field" 
                placeholder="Enter inner password" 
                value={innerPasswordInput}
                onChange={e => { setInnerPasswordInput(e.target.value); setInnerPasswordError('') }}
                autoFocus
                style={{textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.15em'}}
              />
              {innerPasswordError && (
                <div style={{color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginTop: '0.75rem', animation: 'shake 0.3s ease-out'}}>
                  {innerPasswordError}
                </div>
              )}
            </div>
            <div className="modal-footer" style={{justifyContent: 'center', gap: '0.75rem'}}>
              <button type="button" className="btn-cancel" onClick={() => setShowInnerPasswordModal(false)}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={!innerPasswordInput}>Unlock</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}



function CafeHistoryView({ cafeId, activeTab }) {
  const [historyGroups, setHistoryGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    loadHistory()
  }, [])

  // Silent re-fetch when tab becomes active
  useEffect(() => {
    if (activeTab === 'history' && initialLoadDone.current) {
      loadHistory(false)
    }
  }, [activeTab])

  const loadHistory = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true)
      const res = await api.getHistory(cafeId)
      
      // Combine and group by date
      const combined = [
        ...(res.bookings || []).map(b => ({ ...b, type: 'Table', timestamp: b.end_time })),
        ...(res.sales || []).map(s => ({ ...s, type: 'TakeAway', timestamp: s.created_at }))
      ]

      // Sort by timestamp descending
      combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      // Group by date string
      const groups = {}
      combined.forEach(item => {
        const date = new Date(item.timestamp)
        const dateKey = date.toDateString()
        if (!groups[dateKey]) {
          groups[dateKey] = {
            date: date,
            dateLabel: getFriendlyDate(date),
            items: [],
            total: 0,
            tableCount: 0,
            takeawayCount: 0
          }
        }
        groups[dateKey].items.push(item)
        groups[dateKey].total += parseFloat(item.total_amount || 0)
        if (item.type === 'Table') groups[dateKey].tableCount++
        else groups[dateKey].takeawayCount++
      })

      setHistoryGroups(Object.values(groups))
      initialLoadDone.current = true
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFriendlyDate = (date) => {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  if (loading) {
    return <div className="cafe-content"><div className="loading-state">Loading history...</div></div>
  }

  return (
    <section className="cafe-content">
      <div className="history-view-container">
        <div className="history-header-section">
          <h2>Session History</h2>
          <p>Detailed record of all table sessions and takeaways</p>
        </div>

        <div className="history-filters">
          <button className="btn-filter-period">
            Last 30 Days
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"></path></svg>
          </button>
        </div>

        <div className="history-list">
          {historyGroups.length > 0 ? historyGroups.map((group, idx) => (
            <HistoryAccordion 
              key={idx} 
              group={group} 
              defaultOpen={idx === 0} 
              onViewDetail={(item) => {
                setSelectedItem(item)
                setShowDetailModal(true)
              }} 
            />
          )) : (
            <div className="empty-history-state">No history records found.</div>
          )}
        </div>
      </div>
      {showDetailModal && <HistoryDetailModal item={selectedItem} onClose={() => setShowDetailModal(false)} />}
    </section>
  )
}

function HistoryAccordion({ group, defaultOpen, onViewDetail }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const getDuration = (start, end) => {
    if (!start || !end) return '0m'
    const diff = new Date(end) - new Date(start)
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h > 0 ? h + 'h ' : ''}${m}m`
  }

  return (
    <div className={`history-accordion-item ${isOpen ? 'open' : ''}`}>
      <div className="history-accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="h-header-left">
          <span className="h-date-label">{group.dateLabel}</span>
          <div className="h-stats-badges">
            {group.tableCount > 0 && (
              <div className="h-stat-badge tables">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                {group.tableCount} Tables
              </div>
            )}
            {group.takeawayCount > 0 && (
              <div className="h-stat-badge takeaways">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {group.takeawayCount} Takeaways
              </div>
            )}
          </div>
        </div>
        <div className="h-header-right">
          <span className="h-total-revenue">₹{group.total.toLocaleString()}</span>
          <svg className="h-toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"></path></svg>
        </div>
      </div>
      
      <div className="history-accordion-content">
        <div className="history-records-list">
          {group.items.map((item, i) => (
            <div className="history-record-row" key={i}>
              <div className="r-left">
                <div className="r-icon-circle">
                   {item.type === 'Table' ? '⑧' : '🥡'}
                </div>
                <div className="r-info">
                  <span className="r-title">{item.type === 'Table' ? item.table_name : 'TakeAway Order'}</span>
                  <span className="r-subtitle">{item.customer_name || 'Walk-in'}</span>
                </div>
              </div>
              <div className="r-middle">
                <div className="r-time-action-wrapper">
                  <div className="r-time-stack">
                    {item.type === 'Table' ? (
                      <>
                        <span className="r-duration">{getDuration(item.start_time, item.end_time)}</span>
                        <span className="r-time">{formatTime(item.end_time)}</span>
                      </>
                    ) : (
                      <span className="r-time">{formatTime(item.timestamp)}</span>
                    )}
                  </div>
                  <button 
                    className="btn-view-detail" 
                    onClick={() => onViewDetail(item)}
                    title="View Details"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                </div>
              </div>
              <div className="r-right">
                <div className="r-amount-group">
                  <span className="r-amount">₹{item.total_amount}</span>
                  { (parseFloat(item.discount) || 0) > 0 && (
                    <span className="r-discount-badge">-₹{item.discount} disc.</span>
                  )}
                  { (parseFloat(item.extra_amount) || 0) > 0 && (
                    <span className="r-extra-badge">+₹{item.extra_amount} extra</span>
                  )}
                </div>
                <span className={`r-status-badge ${item.payment_method === 'Cash' ? 'cash' : 'online'}`}>
                  {item.payment_method || 'Online'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
function SettlementExpenseModal({ cafeId, settlement, onClose }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExp = async () => {
      try {
        const res = await api.getSettlementExpenses(cafeId, settlement.start_date, settlement.end_date)
        setExpenses(res.data || [])
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchExp()
  }, [cafeId, settlement])

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{maxWidth: '600px'}}>
        <div className="modal-header">
          <h2>Expenses: {settlement.month_label}</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading ? <p>Loading expenses...</p> : (
            <div className="expenses-table-wrapper">
              <table style={{width: '100%'}}>
                <thead>
                  <tr style={{background: '#f8fafc'}}>
                    <th style={{padding: '12px'}}>Name</th>
                    <th style={{padding: '12px'}}>Amount</th>
                    <th style={{padding: '12px'}}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.length > 0 ? expenses.map(e => (
                    <tr key={e.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                      <td style={{padding: '12px'}}>{e.name}</td>
                      <td style={{padding: '12px', fontWeight: '700'}}>₹{e.amount}</td>
                      <td style={{padding: '12px', color: '#64748b'}}>{new Date(e.created_at).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" style={{textAlign: 'center', padding: '2rem', color: '#94a3b8'}}>No expenses found for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-submit" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function SettlementSettingsModal({ cafeId, currentDay, onClose, onSave }) {
  const [day, setDay] = useState(currentDay)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.updateCafeSettings(cafeId, { settlement_day: parseInt(day) })
      onSave()
      onClose()
    } catch (err) {
      Swal.fire({
        title: 'Update Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-container" style={{maxWidth: '450px'}} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{background: '#eef2ff', padding: '8px', borderRadius: '10px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <h2 style={{margin: 0}}>Settlement Cycle</h2>
          </div>
          <button type="button" className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="settlement-info-card">
            <h4>{day}<sup>{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}</sup> Day Selected</h4>
            <p>Automated settlement will trigger after closing time on this day.</p>
          </div>
          
          <label className="input-label" style={{marginBottom: '1rem'}}>Select Day of Month (1-28)</label>
          <div className="day-grid">
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
              <div 
                key={d} 
                className={`day-cell ${day === d ? 'selected' : ''}`}
                onClick={() => setDay(d)}
              >
                {d}
              </div>
            ))}
          </div>
          
          <div className="notice-box" style={{marginTop: '1.5rem'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>Settlement will reset your sales and expenses for the new month.</span>
          </div>
        </div>
        <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', background: '#ffffff', padding: '1.5rem 2rem' }}>
          <button type="button" className="btn-cancel" onClick={onClose} style={{ borderRadius: '12px' }}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={loading} style={{ background: '#6366f1', borderRadius: '12px', padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
            {loading ? 'Saving...' : 'Done'}
          </button>
        </div>
      </form>
    </div>
  )
}
function CafeAnalyticsView({ cafeId, activeTab }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExpenseModal, setShowExpenseModal] = useState(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    loadData()
  }, [cafeId])

  // Silent re-fetch when tab becomes active
  useEffect(() => {
    if (activeTab === 'analytics' && initialLoadDone.current) {
      loadData(true)
    }
  }, [activeTab])

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      setError(null)
      const res = await api.getAnalytics(cafeId)
      // Ensure safe defaults so the UI never crashes on missing fields
      const safe = {
        today: { total: 0, online: 0, cash: 0, bookings: 0, takeaways: 0 },
        yesterday: { total: 0, online: 0, cash: 0, bookings: 0, takeaways: 0 },
        month_sales: 0,
        month_online: 0,
        month_cash: 0,
        month_expenses: 0,
        expense_count: 0,
        net_profit: 0,
        history: [],
        settlement_day: 1,
        warning: null,
        ...res,
        today: { total: 0, online: 0, cash: 0, bookings: 0, takeaways: 0, ...(res?.today || {}) },
        yesterday: { total: 0, online: 0, cash: 0, bookings: 0, takeaways: 0, ...(res?.yesterday || {}) },
      }
      setData(safe)
      initialLoadDone.current = true
    } catch (err) {
      console.error('Analytics Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSettleMonth = async () => {
    const result = await Swal.fire({
      title: 'Settle Month?',
      text: 'Are you sure you want to settle this month? This will save all current stats to history and reset the current month values to zero.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, settle now'
    });

    if (!result.isConfirmed) return
    try {
      setLoading(true)
      await api.settleMonth(cafeId)
      await loadData()
      Swal.fire({
        title: 'Settled!',
        text: 'Month settled successfully! Data has been moved to history.',
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });
    } catch (err) {
      Swal.fire({
        title: 'Failed!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
      setLoading(false)
    }
  }

  if (loading) return <div className="cafe-content"><div className="loading-state">Loading financial analytics...</div></div>
  if (error) return <div className="cafe-content"><div className="loading-state" style={{color:'#ef4444'}}>Error loading analytics: {error}<br/><button className="btn-settle" style={{marginTop:'1rem'}} onClick={loadData}>Retry</button></div></div>
  if (!data) return <div className="cafe-content"><div className="loading-state">No data available.</div></div>

  return (
    <section className="cafe-content">
      <div className="analytics-view-container">
        {data.warning && (
          <div className="settlement-warning-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <span>{data.warning}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span style={{fontSize: '0.8rem', fontWeight: 700, color: '#64748b', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #f1f5f9'}}>
                Reset Day: <span style={{color: '#10b981'}}>{data.settlement_day || 1}</span>
              </span>
              <button className="btn-analytics-gear" onClick={() => setShowSettingsModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V11a2 2 0 0 1-2-2 2 2 0 0 1 2-2v-.09A1.65 1.65 0 0 0 4.6 4.6a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </button>
            </div>
        </div>

        <div className="analytics-cards-grid">
          {/* Today's Sales */}
          <div className="analytics-card-premium">
            <div className="a-icon-box yellow">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="a-content">
              <span className="a-label">Today's Sales</span>
              <span className="a-value">₹{data.today.total.toLocaleString()}</span>
              <div className="a-stats-row">
                <div className="a-mini-badge bookings">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle></svg>
                  {data.today.bookings} Bookings
                </div>
              </div>
              <div className="a-breakdown-box">
                <div className="breakdown-item">
                  <span className="b-label on">On:</span>
                  <span className="b-val">₹{data.today.online.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span className="b-label ca">Ca:</span>
                  <span className="b-val">₹{data.today.cash.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yesterday's Sales */}
          <div className="analytics-card-premium">
            <div className="a-icon-box blue">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"></path><path d="M12 7v5l3 3"></path></svg>
            </div>
            <div className="a-content">
              <span className="a-label">Yesterday's Sales</span>
              <span className="a-value">₹{data.yesterday.total.toLocaleString()}</span>
              <div className="a-stats-row">
                <div className="a-mini-badge bookings">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle></svg>
                  {data.yesterday.bookings} Bookings
                </div>
                <div className="a-mini-badge takeaways">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path></svg>
                  {data.yesterday.takeaways} Takeaways
                </div>
              </div>
              <div className="a-breakdown-box">
                <div className="breakdown-item">
                  <span className="b-label on">On:</span>
                  <span className="b-val">₹{data.yesterday.online.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span className="b-label ca">Ca:</span>
                  <span className="b-val">₹{data.yesterday.cash.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* This Month Sales */}
          <div className="analytics-card-premium">
            <div className="a-icon-box blue">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="a-content">
              <span className="a-label">This Month Sales</span>
              <span className="a-value">₹{data.month_sales.toLocaleString()}</span>
              <div className="a-stats-row">
                <span className="a-label" style={{ opacity: 0.6 }}>Since last settlement</span>
              </div>
              <div className="a-breakdown-box">
                <div className="breakdown-item">
                  <span className="b-label on">On:</span>
                  <span className="b-val">₹{(data.month_online || 0).toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span className="b-label ca">Ca:</span>
                  <span className="b-val">₹{(data.month_cash || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* This Month Expense */}
          <div className="analytics-card-premium">
            <div className="a-icon-box red" style={{ background: '#fff5f5' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            </div>
            <div className="a-content">
              <span className="a-label">This Month Expense</span>
              <span className="a-value" style={{ color: '#ef4444' }}>₹{data.month_expenses.toLocaleString()}</span>
              <span className="a-label" style={{ marginTop: '-5px', opacity: 0.6 }}>{data.expense_count} Records</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="analytics-card-premium">
            <div className="a-icon-box green">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            </div>
            <div className="a-content">
              <span className="a-label">Net Profit</span>
              <span className="a-value profit">₹{data.net_profit.toLocaleString()}</span>
              <span className="a-label" style={{ marginTop: '-5px', opacity: 0.6 }}>After Expenses</span>
            </div>
          </div>
        </div>

        <h3 className="history-section-title">Monthly Profit & Loss History</h3>
        {data.history && data.history.length > 0 ? (
          <div className="settlement-history-list">
            <div className="s-history-header">
              <span>Month / Date</span>
              <span>Total Sales</span>
              <span>Total Expenses</span>
              <span>Net Profit</span>
            </div>
            {data.history.map((s, idx) => (
              <div key={idx} className="s-history-row">
                <div className="s-col-date">
                  <strong>{s.month_label}</strong>
                  <span>{new Date(s.created_at).toLocaleDateString()}</span>
                </div>
                <div className="s-col-sales">₹{s.total_sales.toLocaleString()}</div>
                <div className="s-col-expenses clickable-val" onClick={() => setShowExpenseModal(s)}>
                  ₹{s.total_expenses.toLocaleString()}
                </div>
                <div className="s-col-profit profit-text">₹{s.net_profit.toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="coming-soon-chart">
             Historical data and trends will appear here after your first settlement.
          </div>
        )}

        {showExpenseModal && (
          <SettlementExpenseModal 
            cafeId={cafeId} 
            settlement={showExpenseModal} 
            onClose={() => setShowExpenseModal(null)} 
          />
        )}

        {showSettingsModal && (
          <SettlementSettingsModal 
            cafeId={cafeId}
            currentDay={data.settlement_day}
            onClose={() => setShowSettingsModal(false)}
            onSave={loadData}
          />
        )}
      </div>
    </section>
  )
}

function CafeExpensesView({ cafeId, activeTab }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'General' })

  const [submitting, setSubmitting] = useState(false)
  const initialLoadDone = useRef(false)

  useEffect(() => {
    loadExpenses(true)
  }, [])

  // Silent re-fetch when tab becomes active
  useEffect(() => {
    if (activeTab === 'expenses' && initialLoadDone.current) {
      loadExpenses(false)
    }
  }, [activeTab])

  const loadExpenses = async (showFullLoading = false) => {
    try {
      if (showFullLoading) setLoading(true)
      const res = await api.getExpenses(cafeId)
      setExpenses(res.data || [])
      initialLoadDone.current = true
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.addExpense({ ...form, cafe_id: cafeId, amount: parseFloat(form.amount) })
      setForm({ name: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'General' })
      // Silent refresh
      await loadExpenses(false)
      Swal.fire({
        title: 'Added!',
        text: 'Expense added successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Expense?',
      text: 'Are you sure you want to delete this expense?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return
    try {
      await api.deleteExpense(id)
      loadExpenses(false)
      Swal.fire({
        title: 'Deleted!',
        text: 'Expense has been removed.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  if (loading) return <div className="cafe-content"><div className="loading-state">Loading expenses...</div></div>

  return (
    <section className="cafe-content">
      <div className="expenses-view-container">
        <div className="analytics-subtitle-bar">
          <div className="subtitle-indicator"></div>
          <p>Track and manage your business expenditures</p>
        </div>

        <div className="expenses-grid-layout">
          {/* Form Column */}
          <div className="expense-card-white">
            <h3>Add New Expense</h3>
            <form className="expense-form" onSubmit={handleAdd}>
              <div className="input-group">
                <label className="input-label">Expense Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Rent, Electricity" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="0.00" 
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn-add-expense-dark" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Expense'}
              </button>
            </form>
          </div>

          {/* List Column */}
          <div className="expense-card-white">
            <h3>Recent Expenses</h3>
            <div className="expenses-table-wrapper">
              {expenses.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount (₹)</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(exp => (
                      <tr key={exp.id}>
                        <td className="expense-name-cell">{exp.name}</td>
                        <td className="expense-amount-cell">₹{parseFloat(exp.amount).toLocaleString()}</td>
                        <td>{new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                        <td>
                          <button className="btn-delete-expense" onClick={() => handleDelete(exp.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-expenses-text">No expenses recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CafeSettingsView({ cafeId, onRefresh, onRefreshMenu, user, onUpdateUser }) {
  const [tables, setTables] = useState([])
  const [showTableModal, setShowTableModal] = useState(false)
  const [closingTime, setClosingTime] = useState(user.closing_time || '00:00')
  const [isSavingTime, setIsSavingTime] = useState(false)
  const [showAddMenuModal, setShowAddMenuModal] = useState(false)
  const [showViewMenuModal, setShowViewMenuModal] = useState(false)
  const [menuCategories, setMenuCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [isEditingCommission, setIsEditingCommission] = useState(false)
  const [tempCommission, setTempCommission] = useState(user.admin_commission_amount || 0)

  const [walletHistory, setWalletHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    fetchTables()
    fetchMenuData()
    fetchWalletHistory()
  }, [])

  const fetchWalletHistory = async () => {
    try {
      setLoadingHistory(true)
      const res = await api.getWalletHistory(cafeId)
      setWalletHistory(res.data || [])
    } catch (err) {
      console.error('Failed to load wallet history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const fetchMenuData = async () => {
    try {
      const catRes = await api.getMenuCategories(cafeId)
      const itemRes = await api.getMenuItems(cafeId)
      setMenuCategories(catRes.data || [])
      setMenuItems(itemRes.data || [])
    } catch (err) {
      console.error('Failed to load menu data:', err)
    }
  }

  const fetchTables = async () => {
    try {
      const res = await api.getTables(cafeId)
      setTables(res.data || [])
    } catch (err) {
      console.error('Failed to load tables:', err)
    }
  }


  const handleTableChange = (id, field, value) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }

  const handleSaveAll = async () => {
    try {
      await Promise.all(tables.map(t => api.updateTable(t.id, t)))
      Swal.fire({
        title: 'Saved!',
        text: 'Configurations saved successfully!',
        icon: 'success',
        confirmButtonColor: '#6366f1'
      });
      onRefresh() // Instant update for Dashboard
    } catch (err) {
      Swal.fire({
        title: 'Save Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  const handleDeleteTable = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Table Type?',
      text: 'Are you sure you want to delete this table type?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteTable(id)
        fetchTables()
        onRefresh() // Instant update for Dashboard
        Swal.fire({
          title: 'Deleted!',
          text: 'Table type removed.',
          icon: 'success',
          confirmButtonColor: '#6366f1'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  }

  return (
    <section className="cafe-content">
      <div className="settings-hero-new">
        <div className="settings-title-group">
          <h2>Café Settings</h2>
          <p className="subtitle-text">Manage pricing and inventory.</p>
        </div>

        
        <div className="settings-top-controls">
          <div className="time-picker-group">
            <div className="time-input-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <input 
                type="time" 
                value={closingTime} 
                onChange={e => setClosingTime(e.target.value)} 
                className="modern-time-input"
              />
            </div>
            <button 
              className="btn-save-mini" 
              onClick={async () => {
                try {
                  setIsSavingTime(true)
                  await api.updateCafeSettings(cafeId, { closing_time: closingTime })
                  onUpdateUser({ ...user, closing_time: closingTime })
                  Swal.fire({
                    title: 'Updated!',
                    text: 'Closing time updated successfully!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                  });
                } catch (err) {
                  Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update closing time: ' + err.message,
                    icon: 'error',
                    confirmButtonColor: '#6366f1'
                  });
                } finally {
                  setIsSavingTime(false)
                }
              }}
              disabled={isSavingTime}
            >
              {isSavingTime ? '...' : 'Save'}
            </button>
          </div>
          <button className="btn-add-table-blue" onClick={() => setShowTableModal(true)}>
            + Add Table
          </button>
        </div>
      </div>

      <div className="settings-grid">
        {tables.map(table => (
          <div className="settings-card-premium" key={table.id}>
            <div className="card-header-simple">
              <h3>{table.name}</h3>
              <span className="badge-pricing">Pricing</span>
            </div>
            <div className="card-body-simple">
              <div className="input-field-group">
                <label>Price (per hour)</label>
                <div className="price-input-wrapper">
                  <span className="currency-sign">₹</span>
                  <input 
                    type="number" 
                    value={table.price} 
                    onChange={e => handleTableChange(table.id, 'price', e.target.value)}
                  />
                </div>
              </div>
              <div className="input-field-group">
                <label>Table Count</label>
                <div className="count-row-new">
                  <input 
                    type="number" 
                    value={table.quantity} 
                    onChange={e => handleTableChange(table.id, 'quantity', e.target.value)}
                  />
                  <button className="btn-trash-outline" onClick={() => handleDeleteTable(table.id)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="settings-footer-actions">
        <button className="btn-save-configs" onClick={handleSaveAll}>
          Save Table Configurations
        </button>
      </div>

      <div className="settings-section-divider"></div>

      <div className="management-cards-grid">
        {/* Menu Management */}
        <div className="management-card">
          <div className="m-card-header">
            <h3>Menu Management</h3>
            <span className="badge-inventory">INVENTORY</span>
          </div>
          <div className="m-card-body">
            <button className="btn-m-primary" onClick={() => setShowAddMenuModal(true)}>+ Add New Item</button>
            <button className="btn-m-secondary" onClick={() => setShowViewMenuModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              View Entire Menu ({menuItems.length})
            </button>
          </div>
        </div>


        {/* Active Commission */}
        <div className={`management-card ${user.is_commission_active ? 'border-green' : ''}`}>
          <div className="m-card-header">
            <h3>Active Commission</h3>
            <span className="badge-commission">₹{user.commission_rs} / session</span>
          </div>
          <div className="m-card-body">
            <div className="toggle-group">
              <button 
                className={!user.is_commission_active ? 'btn-toggle-red' : 'btn-toggle-grey'}
                onClick={async () => {
                  try {
                    await api.updateCafeSettings(cafeId, { is_commission_active: false })
                    onUpdateUser({ ...user, is_commission_active: false })
                  } catch (err) {
                    Swal.fire({
                      title: 'Error!',
                      text: err.message,
                      icon: 'error',
                      confirmButtonColor: '#6366f1'
                    });
                  }
                }}
              >
                Disable
              </button>
              <button 
                className={user.is_commission_active ? 'btn-toggle-green' : 'btn-toggle-grey'}
                onClick={async () => {
                  try {
                    await api.updateCafeSettings(cafeId, { is_commission_active: true })
                    onUpdateUser({ ...user, is_commission_active: true })
                  } catch (err) {
                    Swal.fire({
                      title: 'Error!',
                      text: err.message,
                      icon: 'error',
                      confirmButtonColor: '#6366f1'
                    });
                  }
                }}
              >
                Enable
              </button>
            </div>
            
            {user.is_commission_active && (
              <div className="inner-status-box" style={{ animation: 'slideDown 0.3s ease' }}>
                <div className="status-label-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Platform Fee Active</span>
                </div>
                <div className="status-value-row">
                  {isEditingCommission ? (
                    <div className="edit-commission-input-row">
                      <span className="curr">₹</span>
                      <input 
                        type="number" 
                        value={tempCommission} 
                        onChange={e => setTempCommission(e.target.value)}
                        className="mini-edit-input"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="price-val">₹{user.admin_commission_amount || 0}</span>
                  )}
                  
                  <button 
                    className="btn-edit-mini"
                    onClick={async () => {
                      if (isEditingCommission) {
                        const newAmount = parseFloat(tempCommission) || 0
                        if (newAmount > user.commission_rs) {
                          Swal.fire({
                            title: 'Limit Exceeded',
                            text: `You cannot set a platform fee greater than the assigned commission (₹${user.commission_rs})`,
                            icon: 'error',
                            confirmButtonColor: '#6366f1'
                          });
                          return
                        }
                        try {
                          await api.updateCafeSettings(cafeId, { admin_commission_amount: newAmount })
                          onUpdateUser({ ...user, admin_commission_amount: newAmount })
                          setIsEditingCommission(false)
                        } catch (err) {
                          Swal.fire({
                            title: 'Error!',
                            text: err.message,
                            icon: 'error',
                            confirmButtonColor: '#6366f1'
                          });
                        }
                      } else {
                        setTempCommission(user.admin_commission_amount || 0)
                        setIsEditingCommission(true)
                      }
                    }}
                  >
                    {isEditingCommission ? 'Done' : 'Edit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discount Settings */}
        <div className="management-card">
          <div className="m-card-header">
            <h3>Discount Settings</h3>
            <span className="badge-discount" style={{ textTransform: 'uppercase' }}>
              TYPE: {user.discount_type || 'FIXED'} ({user.discount_type === 'percentage' ? '%' : '₹'})
            </span>
          </div>
          <div className="m-card-body">
            <p className="m-card-desc">Choose how you want to calculate discounts during checkout.</p>
            <div className="toggle-group-grey" style={{ marginTop: '1rem' }}>
              <button 
                className={user.discount_type !== 'percentage' ? 'btn-toggle-dark' : 'btn-toggle-grey'}
                onClick={async () => {
                  try {
                    await api.updateCafeSettings(cafeId, { discount_type: 'fixed' })
                    onUpdateUser({ ...user, discount_type: 'fixed' })
                  } catch (err) {
                    Swal.fire({
                      title: 'Error!',
                      text: err.message,
                      icon: 'error',
                      confirmButtonColor: '#6366f1'
                    });
                  }
                }}
              >
                Fixed (₹)
              </button>
              <button 
                className={user.discount_type === 'percentage' ? 'btn-toggle-dark' : 'btn-toggle-grey'}
                onClick={async () => {
                  try {
                    await api.updateCafeSettings(cafeId, { discount_type: 'percentage' })
                    onUpdateUser({ ...user, discount_type: 'percentage' })
                  } catch (err) {
                    Swal.fire({
                      title: 'Error!',
                      text: err.message,
                      icon: 'error',
                      confirmButtonColor: '#6366f1'
                    });
                  }
                }}
              >
                Percentage (%)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="wallet-history-section">
        <div className="wh-header">
          <h3>Wallet Transaction History</h3>
          <span className="wh-count-badge">{walletHistory.filter(tx => tx.type === 'credit').length} Transactions</span>
        </div>
        
        {loadingHistory ? (
          <div className="empty-state-msg" style={{padding: '3rem'}}>Loading history...</div>
        ) : walletHistory.filter(tx => tx.type === 'credit').length > 0 ? (
          <div className="wh-transactions-list">
            {walletHistory.filter(tx => tx.type === 'credit').map(tx => (
              <div className="wh-transaction-row" key={tx.id}>
                <div className="wh-tx-left">
                  <div className="wh-tx-icon credit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                  </div>
                  <div className="wh-tx-info">
                    <div className="wh-tx-type">Wallet Recharge</div>
                    <div className="wh-tx-date">{new Date(tx.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div className="wh-tx-mid">
                  <span className="wh-tx-id">{tx.razorpay_payment_id || 'N/A'}</span>
                </div>
                <div className="wh-tx-right">
                  <span className="wh-tx-amount credit">+₹{tx.amount}</span>
                  <span className={`wh-tx-status ${tx.status}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wh-empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            <p>No wallet transactions found.</p>
          </div>
        )}
      </div>

      {showTableModal && (
        <TableModal 
          onClose={() => setShowTableModal(false)} 
          onSuccess={() => {
            setShowTableModal(false)
            fetchTables()
            onRefresh() // Instant update for Dashboard
          }}
          cafeId={cafeId}
        />
      )}

      {showAddMenuModal && (
        <AddMenuModal 
          cafeId={cafeId}
          categories={menuCategories}
          onClose={() => setShowAddMenuModal(false)}
          onSuccess={() => {
            setShowAddMenuModal(false)
            fetchMenuData()
            if (onRefreshMenu) onRefreshMenu()
          }}
          onRefreshCategories={fetchMenuData}
        />
      )}

      {showViewMenuModal && (
        <ViewMenuModal 
          categories={menuCategories}
          items={menuItems}
          onClose={() => setShowViewMenuModal(false)}
          onRefresh={() => {
            fetchMenuData()
            if (onRefreshMenu) onRefreshMenu()
          }}
        />
      )}
    </section>

  )
}

function WalletRechargeModal({ user, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRecharge = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    setLoading(true)
    try {
      const order = await api.createWalletOrder(user.id, parseFloat(amount))
      
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        throw new Error("Razorpay Key ID is missing in configuration.");
      }

      const options = {
        key: rzpKey,
        amount: order.amount,
        currency: order.currency,
        name: "CueTrakk Wallet",
        description: "Wallet Recharge",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyData = {
              cafe_id: user.id,
              amount: parseFloat(amount),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }
            const res = await api.verifyWalletPayment(verifyData)
            onSuccess(res.new_balance)
            // Notify other tabs
            walletSyncChannel.postMessage({ type: 'WALLET_UPDATED', cafeId: user.id });
            Swal.fire({
              title: 'Recharge Successful!',
              text: 'Your wallet has been topped up.',
              icon: 'success',
              confirmButtonColor: '#6366f1'
            });
            onClose()
          } catch (err) {
            Swal.fire({
              title: 'Verification Failed',
              text: err.message,
              icon: 'error',
              confirmButtonColor: '#6366f1'
            });
          }
        },
        prefill: {
          name: user.owner_name,
          contact: user.phone_no
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response){
        Swal.fire({
          title: 'Payment Failed',
          text: response.error.description,
          icon: 'error',
          confirmButtonColor: '#6366f1'
        });
      });
      rzp.open()
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to initiate payment: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container wallet-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Recharge Wallet</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleRecharge} className="modal-body">
          <div className="wallet-balance-summary">
            <span>Current Balance</span>
            <h3>₹{user.wallet_balance || 0}</h3>
          </div>
          <div className="input-field-group" style={{marginTop: '1.5rem'}}>
            <label>Enter Amount (₹)</label>
            <div className="price-input-wrapper">
              <span className="currency-sign">₹</span>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="1000"
                required
                min="1"
              />
            </div>
          </div>
          <p className="wallet-hint">Money will be added to your account instantly after successful payment.</p>
          <div className="modal-footer" style={{padding: '1.5rem 0 0 0', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0'}}>
             <button type="submit" className="btn-save-configs" style={{width: '100%'}} disabled={loading}>
               {loading ? 'Processing...' : 'Add Money to Wallet'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TableModal({ onClose, onSuccess, cafeId, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    quantity: initialData?.quantity || 1,
    price: initialData?.price || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
      try {
        const data = {
          name: formData.name,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          cafe_id: cafeId
        }
        
        if (initialData) {
          await api.updateTable(initialData.id, data)
        } else {
          await api.createTable(data)
        }
        onSuccess()
      } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Operation failed: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-container table-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Table Type' : 'Add New Tables'}</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="input-group">
            <label className="input-label">Table Type Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Small Table" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div className="input-group" style={{marginTop: '1.5rem'}}>
            <label className="input-label">Quantity</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="Ex: 6" 
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
              required 
            />
          </div>
          <div className="input-group" style={{marginTop: '1.5rem'}}>
            <label className="input-label">Price (per hour)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="Ex: 120" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              required 
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Processing...' : (initialData ? 'Update Table' : 'Add Tables')}
          </button>
        </div>
      </form>
    </div>
  )
}



function CheckoutModal({ data, user, onClose, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState('Online')
  const [loading, setLoading] = useState(false)
  
  const [discountInput, setDiscountInput] = useState('')
  const [showDiscountInput, setShowDiscountInput] = useState(false)
  const [extraInput, setExtraInput] = useState('')
  const [showExtraInput, setShowExtraInput] = useState(false)
  const [cashReceived, setCashReceived] = useState('')

  const subtotal = parseFloat(data.subtotal) || 0
  const platformFees = parseFloat(data.platformFees) || 0
  const discountValRaw = parseFloat(discountInput) || 0
  
  // Calculate discount based on setting
  let discountVal = discountValRaw
  if (user?.discount_type === 'percentage') {
    discountVal = (subtotal + platformFees) * (discountValRaw / 100)
  }
  
  const extraVal = parseFloat(extraInput) || 0
  
  const finalTotal = Math.max(0, subtotal + platformFees - discountVal + extraVal)
  const changeToReturn = Math.max(0, (parseFloat(cashReceived) || 0) - finalTotal)

  const handlePaid = async () => {
    console.log('Attempting to mark as paid:', {
      bookingId: data.bookingId,
      method: paymentMethod,
      amount: finalTotal
    });
    setLoading(true)
    try {
      await onConfirm(data.bookingId, {
        end_time: data.endTime,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        discount: discountVal,
        extra_amount: extraVal
      })
    } catch (err) {
      console.error('Payment processing failed:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to process payment: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container checkout-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '820px', padding: 0, overflow: 'hidden'}}>
        <div className="modal-header" style={{padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9'}}>
          <h2 style={{fontSize: '1.25rem'}}>Checkout - {data.tableName}</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="checkout-grid-screenshot">
          <div className="checkout-left">
            <div className="billing-scroll-area">
              <div className="checkout-section-header">Billing Details</div>
              
              <div className="billing-detail-row">
                <span className="billing-detail-label">Table Type</span>
                <span className="billing-detail-value">{data.tableType}</span>
              </div>
              <div className="billing-detail-row">
                <span className="billing-detail-label">Customer Name</span>
                <span className="billing-detail-value">{data.customerName || 'Guest'}</span>
              </div>
              <div className="billing-detail-row">
                <span className="billing-detail-label">Phone Number</span>
                <span className="billing-detail-value">{data.customerPhone || 'N/A'}</span>
              </div>
              
              {!data.tableName.includes('Take') && (
                <>
                  <div className="billing-detail-row">
                    <span className="billing-detail-label">Duration</span>
                    <span className="billing-detail-value">{data.duration}</span>
                  </div>
                  <div className="billing-detail-row">
                    <span className="billing-detail-label">Time Charge (₹{data.pricePerHour}/hr)</span>
                    <span className="billing-detail-value">₹{data.timeCharge}</span>
                  </div>
                </>
              )}
              
              {data.items && data.items.length > 0 && (
                <>
                  <div className="checkout-section-header" style={{marginTop: '2rem'}}>Order Items</div>
                  {data.items.map((item, idx) => (
                    <div className="billing-detail-row" key={idx}>
                      <span className="billing-detail-label">{item.name} x{item.quantity || 1}</span>
                      <span className="billing-detail-value">₹{item.price * (item.quantity || 1)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="green-summary-box" style={{marginTop: 'auto', flexShrink: 0}}>
              <div className="summary-row-item subtotal">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row-item platform">
                <span>Platform Fees</span>
                <span>+₹{platformFees.toLocaleString()}</span>
              </div>
              
              {discountVal > 0 && (
                <div className="summary-row-item discount">
                  <span>Discount</span>
                  <span>-₹{discountVal.toFixed(2)} {user?.discount_type === 'percentage' && `(${discountValRaw}%)`}</span>
                </div>
              )}
              
              {extraVal > 0 && (
                <div className="summary-row-item platform" style={{color: '#1e293b'}}>
                  <span>Extra Added</span>
                  <span>+₹{extraVal.toLocaleString()}</span>
                </div>
              )}

              <div className="summary-row-item total">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>

              <div className="summary-actions-row">
                {!showDiscountInput ? (
                  <button type="button" className="btn-add-discount-dashed" onClick={() => setShowDiscountInput(true)}>
                    - Add Discount
                  </button>
                ) : (
                  <div className="discount-input-wrapper">
                    <input 
                      type="number" 
                      placeholder={user?.discount_type === 'percentage' ? "00%" : "00"} 
                      value={discountInput}
                      onChange={e => setDiscountInput(e.target.value)}
                      autoFocus
                    />
                    <button type="button" className="clear-btn" onClick={() => {setDiscountInput(''); setShowDiscountInput(false)}}>✕</button>
                  </div>
                )}
                
                {!showExtraInput ? (
                  <button type="button" className="btn-add-extra-money" onClick={() => setShowExtraInput(true)}>
                    + Add Extra Money
                  </button>
                ) : (
                  <div className="discount-input-wrapper" style={{borderColor: '#22c55e'}}>
                    <input 
                      type="number" 
                      placeholder="00" 
                      style={{color: '#16a34a'}}
                      value={extraInput}
                      onChange={e => setExtraInput(e.target.value)}
                      autoFocus
                    />
                    <button type="button" className="clear-btn" style={{background: '#22c55e'}} onClick={() => {setExtraInput(''); setShowExtraInput(false)}}>✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="checkout-right">
            
            <div className="payment-method-selector">
              <div className="checkout-section-header">PAYMENT METHOD</div>
              <div className="method-options">
                <div 
                  className={`method-option ${paymentMethod === 'Online' ? 'active' : ''}`} 
                  onClick={() => setPaymentMethod('Online')}
                >
                  <div className={`custom-checkbox ${paymentMethod === 'Online' ? 'checked' : ''}`}>
                    {paymentMethod === 'Online' && '✓'}
                  </div>
                  <span>Online</span>
                </div>
                
                <div 
                  className={`method-option ${paymentMethod === 'Cash' ? 'active' : ''}`} 
                  onClick={() => setPaymentMethod('Cash')}
                >
                  <div className={`custom-checkbox ${paymentMethod === 'Cash' ? 'checked' : ''}`}>
                    {paymentMethod === 'Cash' && '✓'}
                  </div>
                  <span>Cash</span>
                </div>
              </div>
            </div>

            <div className="checkout-section-header">
              {paymentMethod === 'Online' ? 'SCAN TO PAY' : 'CASH PAYMENT'}
            </div>
            
            {paymentMethod === 'Online' ? (
              <div className="qr-code-large-box">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=test@upi%26am=${finalTotal}%26cu=INR`} alt="QR Code" />
              </div>
            ) : (
               <div className="simple-cash-calc">
                 <div className="cash-input-field">
                    <label>Enter Amount Received</label>
                    <div className="big-cash-input">
                       <span>₹</span>
                       <input 
                         type="number" 
                         placeholder="000" 
                         value={cashReceived}
                         onChange={e => setCashReceived(e.target.value)}
                       />
                    </div>
                 </div>

                 {parseFloat(cashReceived) > 0 && (
                    <div className="return-display">
                      <label>Return to Customer</label>
                      <div className="return-amount">₹{changeToReturn.toLocaleString()}</div>
                    </div>
                 )}
               </div>
            )}
            
            <div className="final-amount-display">
              <span className="total-label">Final Amount</span>
              <span className="total-val">₹{finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="checkout-modal-footer">
          <button type="button" className="btn-cancel-light" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-mark-paid-dark" onClick={handlePaid} disabled={loading}>
            {loading ? 'Processing...' : 'Mark as Paid & Reset Table'}
          </button>
        </div>
      </div>
    </div>
  )
}


function AddMenuModal({ cafeId, categories, onClose, onSuccess, onRefreshCategories }) {
  const [itemName, setItemName] = useState('')
  const [itemPrice, setItemPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!categoryId) throw new Error('Please select a category')

      await api.createMenuItem({
        cafe_id: cafeId,
        category_id: categoryId,
        name: itemName,
        price: parseFloat(itemPrice)
      })
      
      setItemName('')
      setItemPrice('')
      onSuccess()
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Error adding item: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <form className="modal-container menu-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Add Menu Item</h2>
            <button type="button" className="close-modal" onClick={onClose}>✕</button>
          </div>
          <div className="modal-body">
            <div className="input-group">
              <label className="input-label">Select Category</label>
              <div className="category-select-group">
                <select 
                  className="input-field" 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Choose category...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <button type="button" className="btn-add-cat" onClick={() => setShowAddCategoryModal(true)} title="Add New Category">+</button>
              </div>
          </div>

          <div className="input-group" style={{marginTop: '1.5rem'}}>
            <label className="input-label">Item Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Cold Coffee" 
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              required 
            />
          </div>

          <div className="input-group" style={{marginTop: '1.5rem'}}>
            <label className="input-label">Price (₹)</label>
            <input 
              type="number" 
              className="input-field" 
              placeholder="Ex: 60" 
              value={itemPrice}
              onChange={e => setItemPrice(e.target.value)}
              required 
            />
          </div>
        </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      {showAddCategoryModal && (
        <AddCategoryModal
          cafeId={cafeId}
          onClose={() => setShowAddCategoryModal(false)}
          onSuccess={async (newCatId) => {
            if (onRefreshCategories) {
              await onRefreshCategories()
            }
            setCategoryId(newCatId)
            setShowAddCategoryModal(false)
          }}
        />
      )}
    </>
  )
}

function AddCategoryModal({ cafeId, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await api.createMenuCategory({ cafe_id: cafeId, name: name.trim() })
      if (res?.data && res.data.length > 0) {
        await onSuccess(res.data[0].id)
      } else {
        throw new Error('Failed to create category')
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10001 }}>
      <form className="modal-container menu-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Add New Category</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="input-group">
            <label className="input-label">Category Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Hot Beverages" 
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required 
            />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Done'}
          </button>
        </div>
      </form>
    </div>
  )
}

function ViewMenuModal({ categories, items, onClose, onRefresh }) {
  const [editingId, setEditingId] = useState(null)
  const [editingPrice, setEditingPrice] = useState('')

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Item?',
      text: 'Are you sure you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteMenuItem(id)
        onRefresh()
        Swal.fire({
          title: 'Deleted!',
          text: 'Item has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
          confirmButtonColor: '#6366f1'
        });
      }
    }
  }

  const handleEditClick = (item) => {
    setEditingId(item.id)
    setEditingPrice(item.price)
  }

  const handleSavePrice = async (item) => {
    const newPrice = parseFloat(editingPrice)
    if (isNaN(newPrice) || newPrice < 0) {
      Swal.fire({
        title: 'Invalid Price',
        text: 'Please enter a valid price.',
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
      return
    }
    try {
      await api.updateMenuItem(item.id, newPrice)
      setEditingId(null)
      onRefresh()
    } catch (err) {
      Swal.fire({
        title: 'Update Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container view-menu-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Entire Menu ({items.length})</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body menu-list-container">
          {categories.length === 0 ? (
            <div className="empty-state-msg" style={{padding: '3rem'}}>No items added yet.</div>
          ) : (
            categories.map(cat => {
              const catItems = items.filter(item => item.category_id === cat.id)
              if (catItems.length === 0) return null
              
              return (
                <div className="menu-category-section" key={cat.id}>
                  <div className="menu-category-title">
                    <span>{cat.name}</span>
                    <span style={{fontSize: '0.8rem', color: '#64748b'}}>{catItems.length} items</span>
                  </div>
                  <div className="menu-items-grid">
                    {catItems.map(item => (
                      <div className="menu-item-card" key={item.id}>
                        <div className="m-item-info">
                          <h4>{item.name}</h4>
                          {editingId === item.id ? (
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px'}}>
                              <span style={{fontSize: '0.9rem'}}>₹</span>
                              <input 
                                type="number" 
                                value={editingPrice} 
                                onChange={e => setEditingPrice(e.target.value)}
                                style={{width: '70px', padding: '4px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '0.9rem'}}
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSavePrice(item) }}
                              />
                            </div>
                          ) : (
                            <span>₹{item.price}</span>
                          )}
                        </div>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                          {editingId === item.id ? (
                            <button className="btn-delete-item" style={{color: '#10b981', background: '#d1fae5'}} onClick={() => handleSavePrice(item)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                          ) : (
                            <button className="btn-delete-item" style={{color: '#6366f1', background: '#eef2ff'}} onClick={() => handleEditClick(item)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                          )}
                          <button className="btn-delete-item" onClick={() => handleDelete(item.id)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function OrderItemModal({ booking, menu, items, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [optimisticItems, setOptimisticItems] = useState(items)

  // Sync with props when they change (e.g. after a successful background refresh)
  useEffect(() => {
    setOptimisticItems(items)
  }, [items])

  const handleAddItem = async (item) => {
    // 1. Optimistic Update
    const tempId = `temp-${Date.now()}`
    const newItem = {
      id: tempId,
      booking_id: booking.id,
      item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      isOptimistic: true
    }
    setOptimisticItems(prev => [...prev, newItem])

    // 2. API Call (non-blocking for UI)
    try {
      await api.addBookingItem({
        booking_id: booking.id,
        item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      })
      onSuccess() // Parent will refresh and then sync back to us
    } catch (err) {
      // 3. Rollback on error
      setOptimisticItems(prev => prev.filter(i => i.id !== tempId))
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add item: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  const handleRemoveItem = async (menuItemId) => {
    // Find the last added instance of this item in our optimistic list
    const itemToRemove = [...optimisticItems].reverse().find(i => String(i.item_id) === String(menuItemId))
    if (!itemToRemove) return
    
    // 1. Optimistic Update
    setOptimisticItems(prev => {
      const idx = prev.findLastIndex(i => String(i.item_id) === String(menuItemId))
      if (idx === -1) return prev
      const newList = [...prev]
      newList.splice(idx, 1)
      return newList
    })

    // 2. API Call (if it's not a temp item)
    try {
      if (!String(itemToRemove.id).startsWith('temp-')) {
        await api.deleteBookingItem(itemToRemove.id)
      }
      onSuccess()
    } catch (err) {
      // 3. Rollback on error
      setOptimisticItems(prev => [...prev, itemToRemove])
      Swal.fire({
        title: 'Error!',
        text: 'Failed to remove item: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  // Group items by category for the modal
  const allCategories = [...new Set(menu.map(m => m.cafe_menu_categories?.name))].filter(Boolean)
  const filterTabs = ['All', ...allCategories]

  const displayCategories = activeCategory === 'All' ? allCategories : [activeCategory]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container view-menu-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '850px'}}>
        <div className="modal-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem 1.5rem 0.75rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
            <h2 style={{fontSize: '1.4rem'}}>Add Order: {booking?.table_name}</h2>
            <button type="button" className="close-modal" onClick={onClose}>✕</button>
          </div>
          
          <div className="category-filter-scroll">
            {filterTabs.map(cat => (
              <button 
                key={cat} 
                className={`cat-filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-body menu-list-container" style={{paddingTop: '0.5rem'}}>
          {menu.length === 0 ? (
            <div className="empty-state-msg" style={{padding: '3rem'}}>No menu items found. Please add them in Settings.</div>
          ) : (
            displayCategories.map(catName => (
              <div className="menu-category-section" key={catName}>
                <div className="menu-category-title">
                  <span>{catName}</span>
                </div>
                <div className="menu-items-grid">
                  {menu.filter(m => m.cafe_menu_categories?.name === catName).map(item => {
                    const count = optimisticItems.filter(i => String(i.item_id) === String(item.id)).reduce((acc, i) => acc + (i.quantity || 1), 0)
                    const hasItems = count > 0

                    return (
                      <div 
                        className={`menu-item-card clickable-item ${hasItems ? 'selected' : ''}`} 
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        style={{cursor: 'pointer'}}
                      >
                        <div className="m-item-info">
                          <h4>{item.name}</h4>
                          <span>₹{item.price}</span>
                        </div>
                        
                        {hasItems ? (
                          <div className="modern-qty-pill" onClick={e => e.stopPropagation()}>
                            <button type="button" className="qty-minus" onClick={() => handleRemoveItem(item.id)}>-</button>
                            <div className="qty-circle">{count}</div>
                            <button type="button" className="qty-plus" onClick={() => handleAddItem(item)}>+</button>
                          </div>
                        ) : (
                          <div className="plus-indicator-modern">+</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-submit" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}

function OrderReviewModal({ booking, items, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [optimisticItems, setOptimisticItems] = useState(items)

  useEffect(() => {
    setOptimisticItems(items)
  }, [items])

  // Group items by item_id to show combined quantities
  const groupedItems = Object.values(optimisticItems.reduce((acc, item) => {
    const key = item.item_id || 'unknown';
    if (!acc[key]) {
      acc[key] = { ...item, count: 0, ids: [] };
    }
    acc[key].count += (item.quantity || 1);
    acc[key].ids.push(item.id);
    return acc;
  }, {}));

  const handleAdd = async (item) => {
    // 1. Optimistic Update
    const tempId = `temp-${Date.now()}`
    const newItem = {
      id: tempId,
      booking_id: booking.id,
      item_id: item.item_id,
      name: item.name,
      price: item.price,
      quantity: 1
    }
    setOptimisticItems(prev => [...prev, newItem])

    // 2. API Call
    try {
      await api.addBookingItem({
        booking_id: booking.id,
        item_id: item.item_id,
        name: item.name,
        price: item.price,
        quantity: 1
      })
      onRefresh()
    } catch (err) {
      // 3. Rollback
      setOptimisticItems(prev => prev.filter(i => i.id !== tempId))
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  const handleRemove = async (ids, itemId) => {
    if (ids.length === 0) return
    const idToDelete = ids[ids.length - 1]
    
    // 1. Optimistic Update
    setOptimisticItems(prev => {
      const idx = prev.findLastIndex(i => String(i.item_id) === String(itemId))
      if (idx === -1) return prev
      const newList = [...prev]
      const removed = newList.splice(idx, 1)[0]
      return newList
    })

    // 2. API Call
    try {
      if (!String(idToDelete).startsWith('temp-')) {
        await api.deleteBookingItem(idToDelete)
      }
      onRefresh()
    } catch (err) {
      // 3. Rollback
      onRefresh() // Easiest way to rollback complex state here
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container view-menu-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '850px'}}>
        <div className="modal-header">
          <h2>Order History - {booking?.table_name}</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body menu-list-container">
          {groupedItems.length === 0 ? (
            <div className="empty-state-msg" style={{padding: '3rem'}}>No items added to this table yet.</div>
          ) : (
            <div className="menu-items-grid">
              {groupedItems.map(item => (
                <div className="menu-item-card selected" key={item.item_id}>
                  <div className="m-item-info">
                    <h4>{item.name}</h4>
                    <span>₹{item.price} per unit</span>
                  </div>
                  
                  <div className="modern-qty-pill">
                    <button type="button" className="qty-minus" onClick={() => handleRemove(item.ids, item.item_id)}>-</button>
                    <div className="qty-circle">{item.count}</div>
                    <button type="button" className="qty-plus" onClick={() => handleAdd(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function TakeAwayModal({ cafeId, menu, user, onClose }) {
  const [cart, setCart] = useState([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Online')
  const [loading, setLoading] = useState(false)

  const [discountInput, setDiscountInput] = useState('')
  const [showDiscountInput, setShowDiscountInput] = useState(false)
  const [extraInput, setExtraInput] = useState('')
  const [showExtraInput, setShowExtraInput] = useState(false)
  const [cashReceived, setCashReceived] = useState('')

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)
  const platformFees = 0
  const discountValRaw = parseFloat(discountInput) || 0
  
  let discountVal = discountValRaw
  if (user?.discount_type === 'percentage') {
    discountVal = (subtotal + platformFees) * (discountValRaw / 100)
  }
  
  const extraVal = parseFloat(extraInput) || 0
  
  const finalTotal = Math.max(0, subtotal + platformFees - discountVal + extraVal)
  const changeToReturn = Math.max(0, (parseFloat(cashReceived) || 0) - finalTotal)

  const handleFinish = async () => {
    // Optimistic: close modal immediately to make it feel instant
    onClose()
    
    try {
      await api.createSale({
        cafe_id: cafeId,
        customer_name: "Take Away Customer",
        total_amount: finalTotal,
        payment_method: paymentMethod,
        order_type: "TakeAway",
        items: cart,
        discount: discountVal,
        extra_amount: extraVal
      })
      
      // Non-blocking toast
      Swal.fire({
        title: 'Order Successful!',
        icon: 'success',
        toast: true,
        position: 'top-end',
        timer: 2500,
        showConfirmButton: false,
        background: '#fff',
        color: '#10b981',
        iconColor: '#10b981'
      });
    } catch (err) {
      Swal.fire({
        title: 'Takeaway Error',
        text: 'Failed to record sale: ' + err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    }
  }

  // Group items by category
  const categories = [...new Set(menu.map(m => m.cafe_menu_categories?.name))].filter(Boolean)

  if (showCheckout) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container checkout-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '820px', padding: 0, overflow: 'hidden'}}>
          <div className="modal-header" style={{padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9'}}>
            <h2 style={{fontSize: '1.25rem'}}>Take Away - Billing</h2>
            <button type="button" className="close-modal" onClick={() => setShowCheckout(false)}>Back</button>
          </div>
          
          <div className="checkout-grid-screenshot">
            <div className="checkout-left">
              <div className="billing-scroll-area">
                <div className="checkout-section-header">Order Items</div>
                {cart.map((item, idx) => (
                  <div className="billing-detail-row" key={idx}>
                    <span className="billing-detail-label">{item.name} x{item.quantity}</span>
                    <span className="billing-detail-value">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="green-summary-box" style={{marginTop: 'auto', flexShrink: 0}}>
                <div className="summary-row-item subtotal">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                {discountVal > 0 && (
                  <div className="summary-row-item discount">
                    <span>Discount</span>
                    <span>-₹{discountVal.toFixed(2)} {user?.discount_type === 'percentage' && `(${discountValRaw}%)`}</span>
                  </div>
                )}
                
                {extraVal > 0 && (
                  <div className="summary-row-item platform" style={{color: '#1e293b'}}>
                    <span>Extra Added</span>
                    <span>+₹{extraVal.toLocaleString()}</span>
                  </div>
                )}

                <div className="summary-row-item total">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>

                <div className="summary-actions-row">
                  {!showDiscountInput ? (
                    <button type="button" className="btn-add-discount-dashed" onClick={() => setShowDiscountInput(true)}>
                      - Add Discount
                    </button>
                  ) : (
                    <div className="discount-input-wrapper">
                      <input 
                        type="number" 
                        placeholder={user?.discount_type === 'percentage' ? "00%" : "00"} 
                        value={discountInput}
                        onChange={e => setDiscountInput(e.target.value)}
                        autoFocus
                      />
                      <button type="button" className="clear-btn" onClick={() => {setDiscountInput(''); setShowDiscountInput(false)}}>✕</button>
                    </div>
                  )}
                  
                  {!showExtraInput ? (
                    <button type="button" className="btn-add-extra-money" onClick={() => setShowExtraInput(true)}>
                      + Add Extra Money
                    </button>
                  ) : (
                    <div className="discount-input-wrapper" style={{borderColor: '#22c55e'}}>
                      <input 
                        type="number" 
                        placeholder="00" 
                        style={{color: '#16a34a'}}
                        value={extraInput}
                        onChange={e => setExtraInput(e.target.value)}
                        autoFocus
                      />
                      <button type="button" className="clear-btn" style={{background: '#22c55e'}} onClick={() => {setExtraInput(''); setShowExtraInput(false)}}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="checkout-right">
              
              <div className="payment-method-selector">
                <div className="checkout-section-header">PAYMENT METHOD</div>
                <div className="method-options">
                  <div 
                    className={`method-option ${paymentMethod === 'Online' ? 'active' : ''}`} 
                    onClick={() => setPaymentMethod('Online')}
                  >
                    <div className={`custom-checkbox ${paymentMethod === 'Online' ? 'checked' : ''}`}>
                      {paymentMethod === 'Online' && '✓'}
                    </div>
                    <span>Online</span>
                  </div>
                  
                  <div 
                    className={`method-option ${paymentMethod === 'Cash' ? 'active' : ''}`} 
                    onClick={() => setPaymentMethod('Cash')}
                  >
                    <div className={`custom-checkbox ${paymentMethod === 'Cash' ? 'checked' : ''}`}>
                      {paymentMethod === 'Cash' && '✓'}
                    </div>
                    <span>Cash</span>
                  </div>
                </div>
              </div>

              <div className="checkout-section-header">
                {paymentMethod === 'Online' ? 'SCAN TO PAY' : 'CASH PAYMENT'}
              </div>
              
              {paymentMethod === 'Online' ? (
                <div className="qr-code-large-box">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=test@upi%26am=${finalTotal}%26cu=INR`} alt="QR Code" />
                </div>
              ) : (
                 <div className="simple-cash-calc">
                   <div className="cash-input-field">
                      <label>Enter Amount Received</label>
                      <div className="big-cash-input">
                         <span>₹</span>
                         <input 
                           type="number" 
                           placeholder="000" 
                           value={cashReceived}
                           onChange={e => setCashReceived(e.target.value)}
                         />
                      </div>
                   </div>

                   {parseFloat(cashReceived) > 0 && (
                      <div className="return-display">
                        <label>Return to Customer</label>
                        <div className="return-amount">₹{changeToReturn.toLocaleString()}</div>
                      </div>
                   )}
                 </div>
              )}
              
              <div className="final-amount-display">
                <span className="total-label">Final Amount</span>
                <span className="total-val">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="checkout-modal-footer">
            <button type="button" className="btn-cancel-light" onClick={() => setShowCheckout(false)}>Cancel</button>
            <button type="button" className="btn-mark-paid-dark" onClick={handleFinish} disabled={loading}>
              {loading ? 'Processing...' : 'Complete Take Away Order'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container view-menu-modal" style={{maxWidth: '920px'}} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Take Away Order</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="take-away-split-body" style={{display: 'flex', height: '70vh', maxHeight: '550px'}}>
          {/* Menu Side */}
          <div className="menu-selection-side" style={{flex: 1.5, overflowY: 'auto', padding: '1rem', borderRight: '1px solid #f1f5f9'}}>
            {categories.map(catName => (
              <div className="menu-category-section" key={catName}>
                <div className="menu-category-title"><span>{catName}</span></div>
                <div className="menu-items-grid">
                  {menu.filter(m => m.cafe_menu_categories?.name === catName).map(item => (
                    <div className="menu-item-card clickable-item" key={item.id} onClick={() => addToCart(item)} style={{cursor: 'pointer'}}>
                      <div className="m-item-info">
                        <h4>{item.name}</h4>
                        <span>₹{item.price}</span>
                      </div>
                      <div className="plus-indicator">+</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Side */}
          <div className="cart-review-side" style={{flex: 1, padding: '1rem', background: '#f8fafc', display: 'flex', flexDirection: 'column'}}>
            <div className="bill-section-title">Current Order</div>
            <div className="cart-items-list" style={{flex: 1, overflowY: 'auto'}}>
              {cart.length === 0 ? (
                <div className="empty-state-msg" style={{marginTop: '4rem'}}>Select items to start order.</div>
              ) : (
                cart.map(item => (
                  <div className="menu-item-card" key={item.id} style={{marginBottom: '0.5rem', background: 'white'}}>
                    <div className="m-item-info">
                      <h4>{item.name} x{item.quantity}</h4>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                    <button className="btn-delete-item" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                ))
              )}
            </div>
            <div className="cart-footer" style={{paddingTop: '1rem', borderTop: '1px solid #e2e8f0'}}>
              <div className="total-row main" style={{marginBottom: '1rem'}}>
                <span>Total Amount</span>
                <span>₹{subtotal}</span>
              </div>
              <button 
                className="btn-mark-paid" 
                style={{width: '100%', margin: 0}} 
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StartSessionModal({ table, onClose, onStart }) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onStart(customerName, customerPhone)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-container session-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Start Session - {table?.displayName}</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="input-group" style={{marginBottom: '1.5rem'}}>
            <label className="input-label">Customer Name</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="Enter customer name" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="input-group" style={{marginBottom: '1.5rem'}}>
            <label className="input-label">Phone Number (Optional)</label>
            <input 
              type="text" 
              className="input-field"
              placeholder="Enter phone number" 
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="price-preview-info" style={{background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px dashed #e2e8f0'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}>Table Rate</span>
                <span style={{color: '#10b981', fontWeight: 800}}>₹{table?.price}/hr</span>
             </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit">Start Table</button>
        </div>
      </form>
    </div>
  )
}


function HistoryDetailModal({ item, onClose }) {
  if (!item) return null;

  const totalAmount = parseFloat(item.total_amount) || 0
  const discountVal = parseFloat(item.discount) || 0
  const extraVal = parseFloat(item.extra_amount) || 0
  // Subtotal = final - extra + discount
  const subtotal = totalAmount - extraVal + discountVal
  const items = item.items || []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container history-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-row">
            <div className="icon-badge">
              {item.type === 'Table' ? '⑧' : '🥡'}
            </div>
            <div className="title-texts">
              <h2>{item.type === 'Table' ? item.table_name : 'TakeAway Order'}</h2>
              <span className="subtitle">{item.customer_name || 'Walk-in'} • {new Date(item.end_time || item.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-box">
              <span className="label">SESSION TIMINGS</span>
              <div className="time-row">
                <div className="time-block">
                  <span className="t-label">STARTED</span>
                  <span className="t-val">{item.start_time ? new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                </div>
                <div className="time-arrow">→</div>
                <div className="time-block">
                  <span className="t-label">ENDED</span>
                  <span className="t-val">{new Date(item.end_time || item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="detail-box">
              <span className="label">PAYMENT METHOD</span>
              <div className={`payment-badge-large ${item.payment_method === 'Cash' ? 'cash' : 'online'}`}>
                {item.payment_method || 'Online'}
              </div>
            </div>
          </div>

          <div className="items-section">
            <h4 className="section-title">Order Summary</h4>
            <div className="items-list-mini">
              {items.length > 0 ? items.map((oi, idx) => {
                const qty = parseInt(oi.quantity) || 1
                // Exhaustive search for price and name
                const price = parseFloat(oi.price) || (oi.cafe_menu_items && parseFloat(oi.cafe_menu_items.price)) || (oi.menu_items && parseFloat(oi.menu_items.price)) || 0
                const name = oi.name || (oi.cafe_menu_items && oi.cafe_menu_items.name) || (oi.menu_items && oi.menu_items.name) || (oi.menu_item && oi.menu_item.name) || (oi.table_name) || 'Unnamed Item'
                return (
                  <div className="mini-item-row" key={idx}>
                    <div className="i-info">
                      <span className="i-qty">{qty}x</span>
                      <span className="i-name">{name}</span>
                    </div>
                    <span className="i-price">₹{(price * qty).toFixed(2)}</span>
                  </div>
                )
              }) : (
                <div className="empty-items">No items ordered.</div>
              )}
            </div>
          </div>

          <div className="billing-summary-card">
             <div className="b-row">
               <span>Base Bill (Time + Food)</span>
               <span>₹{subtotal.toFixed(2)}</span>
             </div>
             {discountVal > 0 && (
               <div className="b-row discount">
                 <span>Discount Applied</span>
                 <span>-₹{discountVal.toFixed(2)}</span>
               </div>
             )}
             {extraVal > 0 && (
               <div className="b-row extra">
                 <span>Extra Charges</span>
                 <span>+₹{extraVal.toFixed(2)}</span>
               </div>
             )}
             <div className="b-divider"></div>
             <div className="b-row grand-total">
               <span>Total Paid</span>
               <span>₹{totalAmount.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PublicRechargeModal({ onClose }) {
  const [step, setStep] = useState('search') // 'search', 'confirm', 'success'
  const [identifier, setIdentifier] = useState('')
  const [foundCafe, setFoundCafe] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.lookupCafe(identifier)
      setFoundCafe(res.data)
      setStep('confirm')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRecharge = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      Swal.fire({
        title: 'Invalid Amount',
        text: "Please enter a valid amount",
        icon: 'warning',
        confirmButtonColor: '#6366f1'
      });
      return
    }
    
    setLoading(true)
    try {
      const order = await api.createWalletOrder(foundCafe.id, parseFloat(amount))
      console.log("Razorpay Order Created:", order);

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        throw new Error("Razorpay Key ID is missing. Please check your configuration.");
      }

      const options = {
        key: rzpKey,
        amount: order.amount,
        currency: order.currency,
        name: "CueTrakk Wallet",
        description: `Recharge for ${foundCafe.name}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.verifyWalletPayment({
              cafe_id: foundCafe.id,
              amount: parseFloat(amount),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            // Notify other tabs (like the admin dashboard in another tab)
            walletSyncChannel.postMessage({ type: 'WALLET_UPDATED', cafeId: foundCafe.id });
            setStep('success')
          } catch (err) {
            Swal.fire({
              title: 'Verification Failed',
              text: err.message,
              icon: 'error',
              confirmButtonColor: '#6366f1'
            });
          }
        },
        prefill: {
          name: foundCafe.owner_name,
          contact: foundCafe.phone_no
        },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => setLoading(false)
        }
      }
      
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response){
        Swal.fire({
          title: 'Payment Failed',
          text: response.error.description,
          icon: 'error',
          confirmButtonColor: '#6366f1'
        });
      });
      rzp.open()
    } catch (err) {
      Swal.fire({
        title: 'Recharge Failed',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#6366f1'
      });
    } finally {
      // Don't set loading false here if payment modal is open, let ondismiss or success handle it
      // but if there was an error before open(), we need it false.
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container recharge-public-modal" onClick={e => e.stopPropagation()} style={{maxWidth: '450px'}}>
        <div className="modal-header">
          <h2>Recharge Wallet</h2>
          <button type="button" className="close-modal" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {step === 'search' && (
            <form onSubmit={handleSearch}>
              <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                 <div style={{fontSize: '3rem', marginBottom: '1rem'}}>💳</div>
                 <p style={{color: '#64748b'}}>Enter your Cafe Username or Phone Number to find your account and top up instantly.</p>
              </div>
              <div className="input-group">
                <label className="input-label">Username or Phone</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. 9876543210 or cafe_admin" 
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-alert" style={{marginTop: '1rem'}}>{error}</div>}
              <button type="submit" className="btn-submit" style={{width: '100%', marginTop: '1.5rem', height: '50px'}} disabled={loading}>
                {loading ? 'Searching...' : 'Find My Account'}
              </button>
            </form>
          )}

          {step === 'confirm' && foundCafe && (
            <div className="confirm-cafe-card">
              <div className="cafe-found-badge">CAFE FOUND</div>
              <div className="cafe-found-info">
                <div className="info-row">
                  <span className="label">CAFE NAME</span>
                  <span className="value heavy">{foundCafe.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">OWNER</span>
                  <span className="value">{foundCafe.owner_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">USERNAME</span>
                  <span className="value">@{foundCafe.username}</span>
                </div>
              </div>
              
              <div className="amount-input-section" style={{marginTop: '2rem'}}>
                <label className="input-label">Enter Recharge Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Enter amount (Min ₹100)" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{fontSize: '1.5rem', height: '60px', textAlign: 'center', fontWeight: 'bold'}}
                  autoFocus
                />
              </div>
              
              <div className="recharge-actions" style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
                <button className="btn-cancel" style={{flex: 1}} onClick={() => setStep('search')}>Back</button>
                <button className="btn-submit" style={{flex: 2, height: '50px'}} onClick={handleRecharge} disabled={loading}>
                  {loading ? 'Processing...' : 'Proceed to Pay'}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="success-state" style={{textAlign: 'center', padding: '2rem'}}>
              <div className="success-anim-icon">✓</div>
              <h3 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>Payment Successful!</h3>
              <p style={{color: '#64748b', lineHeight: '1.5'}}>₹{amount} has been successfully added to <strong>{foundCafe.name}</strong> wallet. Your tables are now ready for new sessions.</p>
              <button className="btn-submit" style={{marginTop: '2rem', width: '100%', height: '50px'}} onClick={onClose}>Finish</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App







