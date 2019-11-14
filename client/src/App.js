import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './Home';
import Students from './Students';
const $ = require('jquery');

export default function App(){
  return(
    <div>
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/students" component={Students} />
        </Switch>
      </Router>
    </div>
  )
}

function Header(){
  return(
    <div id="nav-bar" className="navbar navbar-expand-lg">
      <ul  className="navbar-nav mr-auto">
        <li>
          <h2>P3</h2>
        </li>
        <li className="nav-item">
          <Link id="home-btn" to="/">Home</Link>
        </li>
        <li className="nav-item">
          <Link id="students-btn" to="/students">Students</Link>
        </li>
      </ul>
    </div>
  )
}