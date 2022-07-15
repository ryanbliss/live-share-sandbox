export const ReactIndexJs = `
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
 document.getElementById('root')
);
`;

export const PackageJson = `
{
  "name": "live-share-sandbox",
  "main": "/index.js",
  "private": true,
  "version": "0.0.0",
  "dependencies": {
    "@microsoft/live-share": "~0.3.1",
    "@microsoft/live-share-media": "~0.3.1",
    "@microsoft/teams-js": "2.0.0-experimental.0",
    "fluid-framework": "~0.59.0",
    "lodash": "^4.17.21",
    "react": "^17.0.0",
    "react-dom": "^17.0.0",
    "react-scripts": "^5.0.0",
    "url": "^0.11.0"
  }
}
`;
