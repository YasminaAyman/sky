import './App.css';
import React from 'react';
import SignIn from './SignIn';
import Home from './Home';
import { AuthProvider } from "./Auth";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/signin" component={SignIn} />
        </Switch>
      </Router>
    </AuthProvider>
  );
}

export default App;
