var express  = require("express");
var passport = require('passport');
var request  = require("request");
var util     = require("util");
var Auth     = require('../tools/apiAuth');
var WriteAP  = require('../tools/WriteAP');
var API_C    = require('../tools/APICodes').Codes;
var config   = require("../config/environment");

var router   = express.Router();

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

function pp(t) {
  var p = t.split(":");
  WriteAP(">>+"+p[0]+(p[1]?":"+p[1]:"").green);
  return t;
}

WriteAP(">*"+"API Level".grey+":");

router.get(pp("/admin/getGatheredData"), Auth.isLoggedIn, function(req, res) {
    var userid = req.session.login.userid;
    request.get({url:config.apiRoute("admin/"+userid+"/getGatheredData")}, function(err, resp, body) {
        if(err) {
          return APIErr(res, err);
        }
        try {
            body = JSON.parse(body);
            res.json(body);
        } catch(e) {
          return APIErr(res, {message: "Malformed js returned from API", body: body}, API_C.My_Bad);
        }
    });

});

router.post(pp("/chooseBankAccount"), Auth.isLoggedIn, function(req, res) {
  req.body.userid = req.session.login.userid;
  request.post({url: config.apiRoute("chooseBankAccount"), json:req.body}, function(err, resp, body) {
    if(err){
      return APIErr(res, err);
    }

    try {
      body = typeof body !== "object" ? JSON.parse(body) : body;
      return res.json(body);
    } catch(e) {
      return APIErr(res, {message: "Malformed js returned from API ["+e+"]", body: body}, API_C.My_Bad);
    }
  });

});

router.get(pp("/recipes/:recipe"), Auth.isLoggedIn, function(req, res) {
  request.get({url: config.apiRoute("get/" + req.session.login.userid + "/recipes/" + req.params.recipe)}, function(err, resp, body) {
    if(err){
      return APIErr(res, err);
    }
    try {
      body = JSON.parse(body);
      return res.json(body);
    } catch(e) {
      return APIErr(res, {message: "Malformed js returned from API", body: body}, API_C.My_Bad);
    }
  });
});

router.post(pp("/recipeSubmit/:name/:step"), Auth.isLoggedIn, function(req, res) {
  request.post({url: config.apiRoute("recipeSubmit/" + req.session.login.userid + "/" + req.params.name + "/" + req.params.step), json:req.body}, function(err, resp, body) {
    if(err){
      return APIErr(res, err);
    }

    try {
      body = typeof body !== "object" ? JSON.parse(body) : body;
      return res.json(body);
    } catch(e) {
      return APIErr(res, {message: "Malformed js returned from API ["+e+"]", body: body}, API_C.My_Bad);
    }
  });
});

router.post(pp("/addGoal"), Auth.isLoggedIn, function(req, res) {
  req.body.userid = req.session.login.userid;
  request.post({url: config.apiRoute("createGoal"), json:req.body}, function(err, resp, body) {
    if(err){
      return APIErr(res, err);
    }
    try {
      return res.json(body);
    } catch(e) {
      return APIErr(res, {message: "Malformed js returned from API", body: body}, API_C.My_Bad);
    }
  });
});

router.get(pp("/snooze/:hash"), Auth.isLoggedIn, function(req, res) {
  request.get({url: config.apiRoute("snooze/"+req.session.login.userid+"/"+req.params.hash)}, function(err, resp, body) {
    if(err){
      return APIErr(res, err);
    }
    try {
      body = JSON.parse(body);
      return res.json(body);
    } catch(e) {
      return APIErr(res, {message: "Malformed js returned from API", body: body}, API_C.My_Bad);
    }
  });
});

//=======================================================================|
router.get(pp("/apiData/:api"), Auth.isLoggedIn, function(req, res) {

  var url = config.apiRoute("get/" + req.session.login.userid + "/" + req.params.api);

  request.get({url: url}, function(err, resp, body) {

    if(err || !resp.statusCode == 200) {
      return APIErr(res, err);
    }

    try {
      body = JSON.parse(body);
      return res.json(body);
    } catch (e) {
      return APIErr(res, {message: 'Malformed js returned from API', data: body}, API_C.My_Bad);
    }
  });
});

router.get(pp("/tools/resolve_zip/:zipcode"), Auth.isLoggedIn, function(req, res) {
  request.get({url:config.apiRoute("tools/resolve_zip/"+req.params.zipcode)}, function(err, resp, body) {
    if (err) {
      return APIErr(res, err);
    }
    try {
      return res.json(JSON.parse(body));
    } catch (e) {
      return APIErr(res, 'Malformed js returned from API');
    }
  });
});

router.post(pp("/questionnaire"), Auth.isLoggedIn, function(req, res) {
  req.body.userid = req.session.login.userid;
  request.post({url:config.apiRoute("questionnaire"), json:req.body}, function(err, resp, body) {
    if (err) {
      return APIErr(res, err);
    }
    if (resp.statusCode != 200) {
      return APIErr(res, body, resp.statusCode);
    }
    return APISucc(res, "success");
  });
});

router.post(pp("/reminders/:num"), Auth.isLoggedIn, function(req, res) {
  request.post({url:config.apiRoute("reminders"), json:{data:req.params.num, userid:req.session.login.userid}}, function(err, resp, body) {
    if (err) {
      return APIErr(res, err);
    }
    if (resp.statusCode != 200) {
      return APIErr(res, body, resp.statusCode);
    }
    return APISucc(res, "success");
  });
});


router.get(pp("/broadcastUserLocation/:coords"), Auth.isLoggedIn, function(req, res) {
  request.get({url:config.apiRoute("broadcastUserLocation/" + req.session.login.userid + "/" + req.params.coords)});
  APISucc(res, "success");
});

router.post("/goals", Auth.isLoggedIn, function(req, res) {
  req.body.userid = req.session.login.userid;
  return request.post({url:config.apiRoute("goals"), json:req.body}, function(err, resp, body) {
    if (err) {
      return APIErr(res, err);
    }
    if (resp.statusCode != 200) {
      return APIErr(res, body, resp.statusCode);
    }
    return APISucc(res, "success");
  });
});

function vaultRequest(req, res, m, s) {
  req.body.userid = req.session.login.userid;
  request[m]({url:config.apiRoute("get/" + req.session.login.userid + "/vault/" + s), json: req.body}, function(err, resp, body) {
    if (err) {
      return APIErr(res, err);
    }
    if (resp.statusCode != 200) {
      return APIErr(res, body, resp.statusCode);
    }
    return APISucc(res, body);
  });
}
router.get("/vault/:section", Auth.isLoggedIn, function(req, res) {
  vaultRequest(req, res, "get", req.params.section);
});

router.post("/vault/:section", Auth.isLoggedIn, function(req, res) {
  vaultRequest(req, res, "post", req.params.section);
});

//=============================================|
WriteAP(">>+/login, /signup");
function ProcessAuth(route) {
  return (req, res) => {
    if (req.session.login) {
      return APISucc(res, "Already Logged in");
    }

    var r = config.apiRoute(route);

    return request.post({url:r, json: req.body}, function(err, resp) {
      if (err) {
        return APIErr(res, err, API_C.My_Bad);
      }
      var body = resp.body;
      if (body && !body.success) {
        return APIErr(res, {message: body.message, body: body}, API_C.Denied);
      }
      req.session.login = body.session;
      req.session.save();
      return res.json(body);
    });
  };
}

//=============================================|
// api/resetPassword
// requires email in body
//=============================================|
router.post("/reset-password", function(req, res) {
  var r = config.apiRoute("resetPassword");

  return request.post({url:r,json:req.body}, function(err, resp) {
    if (err) {
      var errMessage = 'Unable to send password reset email';
      return res.status(500).json({msg : errMessage, err : err });
    }
    if (resp.statusCode !== 200) {
      return APIErr(res, { message:errMessage, body:resp.body }, resp.statusCode);
    }
    return res.json(resp.body);
  });
});

//=============================================|
// api/setPassword
// requires password and token in body
//=============================================|
router.post("/set-password", function(req, res) {
  var r = config.apiRoute("setPassword");

  return request.post({url:r,json:req.body}, function(err, resp) {
    if (err) {
      var errMessage = 'Unable to reset password';
      return res.status(500).json({msg : errMessage, err : err });
    }
    if (resp.statusCode !== 200) {
      return APIErr(res, { message:errMessage, body:resp.body }, resp.statusCode);
    }
    return res.json(resp.body);
  });
});

router.get("/confirmEmail/:token", function(req, res) {
  var r = config.apiRoute("confirmEmail") + '/' + req.params.token;

  return request.get({url:r}, function(err, resp) {
    if (err) {
      return res.status(500).json({msg : 'Unable to confirm email'});
    }
    return res.json(resp.body);
  });
});

router.post("/login", ProcessAuth("login"));
router.post("/signup", ProcessAuth("register"));

router.use(function(req, res, next) {
  APIErr(res, "Invalid API call", API_C.Invalid);
});

module.exports = router;
