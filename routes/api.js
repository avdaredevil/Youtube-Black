var express  = require("express");
var request  = require("request");
var config  = require("../config/keys.json");
var url  = require("querystring");

var router   = express.Router();
const API = {
    key: config.google,
    base: "https://www.googleapis.com/youtube/v3/",
    get: route => new Promise((res,rej) => {
        const q = 
        request.get(API.base()+route)
    }),
}
//=======================================================================|
function APIErr(res, message, code) {
    WriteAP(">!Error: "+message);
    const m = typeof message == "object" ? message : {message : message};
    return res.status(code||API_C.Error).json(m);
}

function APISucc(res, message) {
    WriteAP(">+Success");
    return res.status(API_C.OK).json(message);
}
router.get("/vault/:section", function(req, res) {
    API.get("videos", {
        part:"contentDetails",
        chart: "mostPopular",
        regionCode: "US",
        maxResults: 25
    }).then(onAccept,e => APIErr(res,{message: "Could not fetch", error: e}))
});

router.use(function(req, res, next) {
    APIErr(res, "Invalid API call", API_C.Invalid);
});

module.exports = router;
