import Ember from 'ember';

export default Ember.Route.extend({
   beforeModel() {
    if (!localStorage.getItem('email')) {
      this.transitionTo('login');
    }
  },
  model() {
    return Ember.$.getJSON("http://localhost:1010/trading-backend/news").then(data => {
      if (!Array.isArray(data.articles)) {
        console.warn("Crypto news is not ready:", data);
        return { news: data };
      }

      return {
        news: data.articles.map(c => ({
          id: c.source.id,
          name: c.source.name,
          author:c.author?c.author:"James Bond",
          title:c.title,
          description:c.description?c.description:"The 2025 annual bitcoin (BTC-USD) conference is underway, with US Vice President JD Vance and Donald Trump Jr. in attendance. BitcoinIRA COO and co-founder...",
          url:c.url,
          img:c.urlToImage?c.urlToImage:"https://media.fortuneindia.com/fortune-india/import/2024-11-20/1kvgdsw3/GettyImages-2184362749.jpg"
        }))
      };
    });
  },

  
});
