var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();

router.get('/', (req, res) => res.render('index'));
router.get('/test', (req, res) => res.render('test'));




router.get('/Get-Component/:component', (req, res) => {
    const name = req.params.component.replace(/\\\//g,''), loc = path.join('components',name), fullLoc = path.join(express().get("views"),loc)
    fs.access(fullLoc+".pug", fs.F_OK, function(err) {
        if (err) {return res.status(404).json({message: "No such template"})}
        res.render(loc)
    })
})


module.exports = router;
