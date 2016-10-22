var express = require('express');
var router = express.Router();

router.get('/', (req, res) => res.render('index', {question: "Sample Poll"}));

module.exports = router;
