import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase, { auth, provider } from './firebase.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      currentItem: '',
      username: '',
      items: [],
      user: null // <-- add this line
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.login = this.login.bind(this); // <-- add this line
    this.logout = this.logout.bind(this); // <-- add this line
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  handleSubmit(e) {
    e.preventDefault();
    const itemsRef = firebase.database().ref('items');
    const item = {
      title: this.state.currentItem,
      user: this.state.user.displayName || this.state.user.email
    }
    itemsRef.push(item);
    this.setState({
      currentItem: '',
      username: ''
    });
  }

  logout() {
  auth.signOut()
    .then(() => {
      this.setState({
        user: null
      });
    });
  }
  login() {
    auth.signInWithPopup(provider) 
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }
  componentDidMount() {
    const itemsRef = firebase.database().ref('items');

    itemsRef.on('value', (snapshot) => {
      let items = snapshot.val();
      let newState = [];
      for (let item in items) {
        newState.push({
          id: item,
          title: items[item].title,
          user: items[item].user
        });
      }
      this.setState({
        items: newState
      });
    });

    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user });
      } 
    });
  }
  removeItem(itemId) {
    const itemRef = firebase.database().ref(`/items/${itemId}`);
    itemRef.remove();
  }
  render() {
    return (
      <div className='app'>
        <header>
            <div className="wrapper">
              <h1>Fitmatch<i className="fa fa-heartbeat" aria-hidden="true"></i></h1>
              
                {this.state.user ?

                  <button onClick={this.logout}>Log Out</button>                
                  :
                  <button onClick={this.login}>Google Log In</button>              
                }               
            </div>
        </header>
        {this.state.user ?
          <div>
            <div className='user-profile'>
               <img src={this.state.user.photoURL} />
            </div>
            <div className='container'>
              <section className='add-item'>
                <form onSubmit={this.handleSubmit}>
                  <h1>About You</h1>
                  <input type="text" name="username" placeholder="What's your name?" value={this.state.user.displayName || this.state.user.email} />
                  <input value={this.state.avgMileWalking} onChange={this.handleInputChange} name="avgMileWalking" placeholder="average running miles per week" />
                  <input value={this.state.avgMileJogging} onChange={this.handleInputChange} name="avgMileJogging" placeholder="average jogging miles per week" />
                  <input value={this.state.avgMileBiking} onChange={this.handleInputChange} name="avgMileBiking" placeholder="average biking miles per week" />
                  <button>Submit</button>
                </form>
              </section>
              <section className='display-item'>
                <div className="wrapper">
                  <ul>
                    {this.state.items.map((item) => {
                      return (
                        <li key={item.id}>
                          <h3>{item.title}</h3>
                          <p>brought by: {item.user}
                             {item.user === this.state.user.displayName || item.user === this.state.user.email ?
                               <button onClick={() => this.removeItem(item.id)}>Remove Item</button> : null}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
            </div>
          </div>
          :
          <div className='wrapper'>
            <p>You must be logged in to access the dashboard.</p>
          </div>
        }
      </div>
    );
  }
}

export default App;