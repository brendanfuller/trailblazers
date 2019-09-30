import React from 'react';
import { render } from 'react-dom';
import App from './App.jsx';


function renderApp() {
    render(<App />, document.querySelector("#app"));
}
  
renderApp();
  
