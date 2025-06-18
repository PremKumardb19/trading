// app/services/token.js
import Ember from 'ember';

export default Ember.Service.extend({
  token: null,
  user: null,

  init() {
    this._super(...arguments);
    this.loadFromStorage();
  },

  setToken(token) {
    this.set('token', token);
    localStorage.setItem('jwtToken', token);
  },

  getToken() {
    return this.get('token') || localStorage.getItem('jwtToken');
  },

  setUser(user) {
    this.set('user', user);
    localStorage.setItem('userData', JSON.stringify(user));
  },

  getUser() {
    return this.get('user') || this.loadUserFromStorage();
  },

  loadFromStorage() {
    const token = localStorage.getItem('jwtToken');
    const userData = localStorage.getItem('userData');
    
    if (token) {
      this.set('token', token);
    }
    
    if (userData) {
      try {
        this.set('user', JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
  },

  loadUserFromStorage() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.set('user', user);
        return user;
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        return null;
      }
    }
    return null;
  },

  clearToken() {
    this.set('token', null);
    this.set('user', null);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('email'); // Clear legacy email storage
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp <= currentTime) {
        // Token expired, clear it
        this.clearToken();
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Error parsing JWT token:', e);
      this.clearToken();
      return false;
    }
  },

  getAuthHeaders() {
    const token = this.getToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  },

  // Decode JWT payload without verification (client-side only)
  decodeToken() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  },

  // Get token expiration time
  getTokenExpiration() {
    const payload = this.decodeToken();
    return payload ? new Date(payload.exp * 1000) : null;
  },

  // Check if token will expire soon (within next 5 minutes)
  willExpireSoon() {
    const payload = this.decodeToken();
    if (!payload) return true;
    
    const currentTime = Date.now() / 1000;
    const fiveMinutesFromNow = currentTime + (5 * 60);
    
    return payload.exp <= fiveMinutesFromNow;
  }
});