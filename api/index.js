module.exports = (req, res) => {
  try {
    const app = require('../backend/server.js')
    return app(req, res)
  } catch (err) {
    res.status(500).json({
      error: 'Serverless Boot Error',
      message: err.message,
      stack: err.stack
    })
  }
}
