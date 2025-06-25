import Ember from 'ember';

export default Ember.Controller.extend({
  username: '',
  password: '',
  status: '',
// usernameChanged: function() {
//     console.log('Username has been changed to:', this.get('username'));
//     console.log('password has been changed to:', this.get('password'));
//   }.observes('username','password'),
// init() {
//   this._super(...arguments);

  // Will run only once, even if called twice in same run loop
// const sharedFn = function() {
//   console.log("✅ I should run only once");
// };

// Ember.run.scheduleOnce('afterRender', this, sharedFn);
// Ember.run.scheduleOnce('afterRender', this, sharedFn);
// Ember.run.schedule('afterRender',this,sharedFn)
// Ember.run.schedule('afterRender',this,sharedFn)
// },
//  init() {
//     this.set('username', 'broken');
//     console.log('init ran but no super');
//   }
// init() {
//   this._super(...arguments);

//   console.log("🟠 init called");
//   const f=()=>{
//     console.log('✅ phase:', Ember.run.currentRunLoop);

//  console.log("✅ scheduleOnce: I run only once");
//   }
//   Ember.run(() => {
//     this.set('price', 50000);
//     this.set('price', 60000);

//     Ember.run.scheduleOnce('afterRender', this,f);

//     Ember.run.scheduleOnce('afterRender', this, f);

//     Ember.run.schedule('afterRender', this, f);

//     Ember.run.schedule('afterRender', this,f);
//   });

//   console.log("🟢 init end");
// }
// ,
  init() {
    this._super(...arguments);
    Ember.run.scheduleOnce('afterRender', this, function () {
      Ember.$('#loginForm').on('submit', (event) => {
        this.send('login', event);
      });
    });
    
  },

  actions: {
  //     save() {
  //   console.log('Controller: save'  );
  //   return true; 
  // },
    login(event) {
      event.preventDefault();

      let self = this;

      Ember.$.ajax({
        url: 'http://localhost:1010/trading-backend/auth?action=login',
        method: 'POST',
        data: {
          username: this.get('username'),
          password: this.get('password')
        },
        success(response) {
          if (response.status === "success") {
            localStorage.setItem("email", response.email || self.get('username'));
            localStorage.setItem("token", response.accessToken); 

            self.set('status', 'Login successful!');
            self.transitionToRoute('dashboard');
          } else {
            self.set('status', 'Login failed.');
          }
        },
        error(xhr) {
          self.set('status', 'Login error: ' + xhr.responseText);
        }
      });
    }
  }
});
