import Ember from 'ember';
import $ from 'jquery';

export default Ember.Route.extend({
  beforeModel() {
    if (!localStorage.getItem('email')) {
      this.transitionTo('login');
    }
  },

  model() {
    const token = localStorage.getItem('token');
    const email=localStorage.getItem('email')
    return $.ajax({
      url: `http://localhost:1010/trading-backend/fetch?action=news&email=${encodeURIComponent(email)}`,
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(data => {
      if (!Array.isArray(data.articles)) {
        console.warn("Crypto news is not ready:", data);
        return { news: data };
      }

      return {
        news: data.articles.map(c => ({
          id: (c.source && c.source.id) || 'unknown',
          name: (c.source && c.source.name) || 'Unknown Source',
          author: c.author || "James Bond",
          title: c.title,
          description: c.description || "The 2025 annual bitcoin (BTC-USD) conference is underway...",
          url: c.url,
          img: c.urlToImage || "https://media.fortuneindia.com/fortune-india/import/2024-11-20/1kvgdsw3/GettyImages-2184362749.jpg"
        }))
      };
    });
  }
});
