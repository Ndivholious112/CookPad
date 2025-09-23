// Vercel Serverless Function entry for the backend
// This wraps the Express app so Vercel can handle requests.

const app = require('../server');

module.exports = app; // Express app is a valid (req, res) handler
