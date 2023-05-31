// Import tailwind
import './resources/app.css';
import './resources/infinitymint.css';

// Import react + app
import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import App from './App';
import storage from './storage';

// Load saved data
storage.loadSavedData();
// Standard react
// Looking for the good stuff? Check out src/App.tsx
const root = ReactDOM.createRoot(document.querySelector('#root'));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// To log results (for example: reportWebVitals(console.log))
// Or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
