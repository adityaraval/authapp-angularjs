const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const {UserModel} = require('../model/user');
var redis = require("redis"),client = redis.createClient();

passport.use(new BearerStrategy(
    function(token, done) {

        UserModel.findOne({ token: token }, function (err, user) {
        if (err) { return done(err); }
        else if (!user) { return done(null, false); }
        else{
            var getLoggedInUser = user._id;
            client.get(getLoggedInUser.toString(),(err,result)=>{
                if(result){
                    var convertedJSON = JSON.parse(result);
                    console.log("CACHE SET");
                    console.log(convertedJSON.role,"ROLE");
                }else{
                    console.log("CACHE CLEARED");
                    var LoggedInUser = user._id;
                    client.setex(LoggedInUser.toString(),60,JSON.stringify(user));
                }
            });
            return done(null, user, { scope: 'all' });
        }
      });
    }
));


module.exports = {passportConfig:passport};