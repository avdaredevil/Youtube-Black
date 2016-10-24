var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var Video = require("mongoose").model("Video");


const fetchProjects = (req,res,next) => {
    Video.find({}, (err,all) => {
        if (err) {console.error(err);return next()}
        req.ProjC = all
        next()
    })
}

const fetchProjectCount = (req,res,next) => {
    Video.count({}, (err,c) => {
        if (err) {console.error(err);return next()}
        req.ProjC = c
        next()
    })
}


router.get('/', fetchProjectCount, (req, res) => res.render('index', {projects: req.ProjC||0}));
router.get('/offline', fetchProjects, (req, res) => res.render('offline', {projects: req.ProjC.length, projDetails: req.ProjC}));
router.get('/test', (req, res) => res.render('test'));
router.get('/Get-Component/:component', (req, res) => {
    const name = req.params.component.replace(/\\\//g,''), loc = path.join('components',name), fullLoc = path.join(express().get("views"),loc)
    fs.access(fullLoc+".pug", fs.F_OK, function(err) {
        if (err) {return res.status(404).json({message: "No such template"})}
        res.render(loc)
    })
})


module.exports = router;
