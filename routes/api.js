var express  = require("express");
var path  = require("path");
var request  = require("request");
var config  = require("../config/keys.json");
var querystring = require("querystring");
var mongoose = require("mongoose");
var fs = require("fs");
var Video = mongoose.model("Video");
var dl_y = require("youtube-dl");

var router   = express.Router();
const MakeJSON = j => typeof j=="object"?j:JSON.parse(j)
const API = {
    key: config.google,
    base: "https://www.googleapis.com/youtube/v3/",
    get: (route,data) => new Promise((res,rej) => {
        data.key = API.key
        const q = querystring.stringify(data), URL = API.base+route+"?"+q
        console.log("URL:",URL)
        request.get(URL, (err,resp,body) => {
            if (err) {rej(err)}
            const d = MakeJSON(body)
            d.error?rej(d.error):res(d)
        })
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
const fetchProjectCount = cb => {
    Video.count({}, (err,c) => {
        if (err) {console.error(err);return cb(err)}
        cb(null,c)
    })
}

router.get("/Get-Trending", function(req, res) {
    API.get("videos", {
        part:"snippet,contentDetails,statistics",
        chart: "mostPopular",
        regionCode: "US",
        maxResults: 12
    }).then(d => APISucc(res, {data: d.items},e => APIErr(res, {message: "Could not fetch Popular Videos", error: e})))
    .catch(e => APIErr(res, {message: "Could not fetch Popular Videos", error: e}))
});
router.get("/search/:query", function(req, res) {
    const data = {}
    API.get("search", {
        part:"snippet",
        q: req.params.query,
        regionCode: "US",
        maxResults: 12
    }).then(d=>{data.ids = d.items.map(i => i.id.videoId).filter(i=>i)})
    .then(_ => API.get("videos", {
        part:"snippet,contentDetails,statistics",
        id: data.ids.join(","),
        regionCode: "US",
        maxResults: 12
    })).then(d => APISucc(res, {data: d.items}),e => APIErr(res, {message: "Could not fetch Search Results for ["+req.params.query+"]", error: e}))
    .catch(e => APIErr(res, {message: "Could not fetch Search Results for ["+req.params.query+"]", error: e}))
});

router.get("/Get-Video/:id", function(req, res) {
    Video.findById(req.params.id, (err,v) => {
        if (err) {return APIError(res,"Could not find video",404)}
        res.sendFile(path.resolve(v.file))
    })
})
router.get("/Remove-Video/:vid", function(req, res) {
    //TODO: Implement this route
    res.json({na:"na","naa":"naa",bat:"man"})
})
router.post("/Download-Dis/:vid", function(req, res) {
    const vid = dl_y("http://www.youtube.com/watch?v="+req.params.vid)
    vid.on('info', function(info) {
        console.log('Download started');
        console.log('filename: ' + info.filename);
        console.log('size: '+info.size);
    });
    const loc = './downloads/'+req.params.vid+'.mp4', location = path.resolve(loc)
    vid.pipe(fs.createWriteStream(location))
    Video.newVideo(req.params.vid, loc, req.body, (err,v) => {
        if (err) {return APIErr(res,{error: err})}
        fetchProjectCount((err,c) => {
            return APISucc(res,{message: "I Gotcha -AP", video: v, count: c})
        })
    })
})

router.use(function(req, res, next) {
    APIErr(res, "Invalid API call", 403);
});

module.exports = router;
