const express = require('express');
const router = express.Router();

// Route de test
router.get('/', (req, res) => {
  res.send('Module fonctionnel');
});

module.exports = router;
