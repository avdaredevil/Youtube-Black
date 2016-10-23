var express  = require("express");
var request  = require("request");
var config  = require("../config/keys.json");
var querystring = require("querystring");

var router   = express.Router();
const API = {
    key: config.google,
    base: "https://www.googleapis.com/youtube/v3/",
    get: (route,data) => new Promise((res,rej) => {
        data.key = API.key
        const q = querystring.stringify(data), URL = API.base()+route+"?"+q
        console.log("URL:",URL)
        request.get(URL, (err,resp,body) => err?rej(err):res(body))
    }),
}
//=======================================================================|
function APIErr(res, message, code) {
    const m = typeof message == "object" ? message : {message : message};
    return res.status(code||403).json(m);
}

function APISucc(res, message) {
    return res.status(200).json(message);
}
router.get("/vault/:section", function(req, res) {
    API.get("videos", {
        part:"contentDetails",
        chart: "mostPopular",
        regionCode: "US",
        maxResults: 25
    }).then(d => APISucc(res, {data: d}),e => APIErr(res, {message: "Could not fetch Popular Videos", error: e}))
});

router.use(function(req, res, next) {
    APIErr(res, "Invalid API call", API_C.Invalid);
});

module.exports = router;
