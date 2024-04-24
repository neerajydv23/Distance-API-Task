const express = require('express');
const { index, search, viewAll, exportPDF, exportEXCEL } = require('../controllers/indexController');
const router = express.Router();



router.get('/',index);

router.post('/search', search);

router.get('/viewAll',viewAll);

router.get('/export/pdf', exportPDF);

router.get('/export/excel', exportEXCEL);

module.exports = router;