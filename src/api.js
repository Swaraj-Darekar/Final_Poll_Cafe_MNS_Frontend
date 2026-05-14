const API_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api`;

export const api = {
  async getCafes() {
    const res = await fetch(`${API_URL}/cafes`);
    if (!res.ok) throw new Error('Failed to fetch cafes');
    return res.json();
  },

  async getCafeDetails(id) {
    const res = await fetch(`${API_URL}/cafes/${id}`);
    if (!res.ok) throw new Error('Failed to fetch cafe details');
    return res.json();
  },

  async createCafe(cafeData) {
    const res = await fetch(`${API_URL}/cafes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cafeData),
    });
    if (!res.ok) throw new Error('Failed to register cafe');
    return res.json();
  },



  async resetCafe(id) {
    const res = await fetch(`${API_URL}/cafes/${id}/reset`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to reset cafe');
    }
    return res.json();
  },

  async deleteCafe(id) {
    const res = await fetch(`${API_URL}/cafes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete cafe');
    }
    return res.json();
  },

  async login(username, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Login failed');
    }
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${API_URL}/stats/summary`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getTables(cafeId) {
    const res = await fetch(`${API_URL}/tables/cafe/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch tables');
    return res.json();
  },

  async createTable(tableData) {
    const res = await fetch(`${API_URL}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tableData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to add table');
    }
    return res.json();
  },

  async updateTable(tableId, tableData) {
    const res = await fetch(`${API_URL}/tables/${tableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tableData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update table');
    }
    return res.json();
  },

  async deleteTable(tableId) {
    const res = await fetch(`${API_URL}/tables/${tableId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to delete table');
    }
    return res.json();
  },

  async startBooking(bookingData) {
    const res = await fetch(`${API_URL}/bookings/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to start session');
    }
    return res.json();
  },

  async getActiveBookings(cafeId) {
    const res = await fetch(`${API_URL}/bookings/active/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch active sessions');
    return res.json();
  },

  async endBooking(bookingId, bookingData) {
    const res = await fetch(`${API_URL}/bookings/end/${bookingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to end session');
    }
    return res.json();
  },

  // --- Menu Management ---
  async getMenuCategories(cafeId) {
    const res = await fetch(`${API_URL}/menu/categories/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch menu categories');
    return res.json();
  },

  async createMenuCategory(catData) {
    const res = await fetch(`${API_URL}/menu/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create menu category');
    }
    return res.json();
  },

  async getMenuItems(cafeId) {
    const res = await fetch(`${API_URL}/menu/items/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch menu items');
    return res.json();
  },

  async createMenuItem(itemData) {
    const res = await fetch(`${API_URL}/menu/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create menu item');
    }
    return res.json();
  },

  async updateMenuItem(itemId, price) {
    const res = await fetch(`${API_URL}/menu/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update menu item price');
    }
    return res.json();
  },

  async deleteMenuItem(itemId) {
    const res = await fetch(`${API_URL}/menu/items/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
    return res.json();
  },

  // --- Booking Items (Orders) ---
  async addBookingItem(itemData) {
    const res = await fetch(`${API_URL}/bookings/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to add item to booking');
    }
    return res.json();
  },

  async getBookingItems(bookingId) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}/items`);
    if (!res.ok) throw new Error('Failed to fetch booking items');
    return res.json();
  },

  async deleteBookingItem(itemId) {
    const res = await fetch(`${API_URL}/bookings/items/${itemId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove item from booking');
    return res.json();
  },

  async createSale(saleData) {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to record sale');
    }
    return res.json();
  },

  async getHistory(cafeId) {
    const res = await fetch(`${API_URL}/history/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async getAnalytics(cafeId) {
    const res = await fetch(`${API_URL}/analytics/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async settleMonth(cafeId) {
    const res = await fetch(`${API_URL}/settle/${cafeId}`, { method: 'POST' });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to settle month');
    }
    return res.json();
  },

  async getSettlementExpenses(cafeId, start, end) {
    const res = await fetch(`${API_URL}/settlements/${cafeId}/expenses?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
    if (!res.ok) throw new Error('Failed to fetch settlement expenses');
    return res.json();
  },

  async getExpenses(cafeId) {
    const res = await fetch(`${API_URL}/expenses/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
  },

  async addExpense(data) {
    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to add expense');
    }
    return res.json();
  },

  async deleteExpense(id) {
    const res = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete expense');
    }
    return res.json();
  },

  async getAllExpenses() {
    const res = await fetch(`${API_URL}/admin/platform-expenses-all`);
    if (!res.ok) throw new Error('Failed to fetch global expenses');
    return res.json();
  },

  async getPlatformSettlements() {
    const res = await fetch(`${API_URL}/super-admin/platform-settlements`);
    if (!res.ok) throw new Error('Failed to fetch platform settlements');
    return res.json();
  },

  async getPlatformSettlementExpenses(settlementId) {
    const res = await fetch(`${API_URL}/super-admin/platform-settlements/${settlementId}/expenses`);
    if (!res.ok) throw new Error('Failed to fetch settlement expenses');
    return res.json();
  },

  async manualPlatformSettle() {
    const res = await fetch(`${API_URL}/super-admin/settle-now`, { method: 'POST' });
    if (!res.ok) throw new Error('Settlement failed');
    return res.json();
  },

  async updateCafeSettings(cafeId, settings) {
    const res = await fetch(`${API_URL}/cafe-settings/${cafeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to update settings');
    }
    return res.json();
  },

  async createWalletOrder(cafeId, amount) {
    const res = await fetch(`${API_URL}/wallet/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cafe_id: cafeId, amount })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to create wallet order');
    }
    return res.json();
  },

  async verifyWalletPayment(data) {
    const res = await fetch(`${API_URL}/wallet/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Payment verification failed');
    return res.json();
  },

  async getWalletHistory(cafeId) {
    const res = await fetch(`${API_URL}/wallet/history/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch wallet history');
    return res.json();
  },

  async getAllWalletHistory() {
    const res = await fetch(`${API_URL}/super-admin/wallet-history`);
    if (!res.ok) throw new Error('Failed to fetch global wallet history');
    return res.json();
  },

  async getSuperAdminCafeStats() {
    const res = await fetch(`${API_URL}/super-admin/cafe-stats`);
    if (!res.ok) throw new Error('Failed to fetch cafe stats');
    return res.json();
  },

  async getDailyEarnings() {
    const res = await fetch(`${API_URL}/super-admin/daily-earnings`);
    if (!res.ok) throw new Error('Failed to fetch daily earnings');
    return res.json();
  },

  async getCafeDetailStats(cafeId) {
    const res = await fetch(`${API_URL}/super-admin/cafe-detail-stats/${cafeId}`);
    if (!res.ok) throw new Error('Failed to fetch cafe detail stats');
    return res.json();
  },
  
  async lookupCafe(identifier) {
    const res = await fetch(`${API_URL}/public/cafe-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Cafe not found');
    }
    return res.json();
  }
};






