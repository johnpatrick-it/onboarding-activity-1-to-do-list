// REACT ENTRY POINT: Where React app starts
// This is like your old main.js but for React

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ReactDOM.createRoot() is React 18's way to start the app
// It finds the div with id="root" in index.html and puts our React app there
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)