var mongoose = require('mongoose');
var Schema = mongoose.Schema;

VideoSchema = new Schema({
    y_id: {type: String, trim: true, required: true, key: true},
    file: {type: String},
    data: {}
})
VideoSchema.set("toJSON", {virtuals: true})
VideoSchema.set("toObject", {virtuals: true})

VideoSchema.statics.newVideo = function(y_id, file, data, done){
	var Video = this;
    Video.create({
        y_id: y_id,
        file: file,
        data: data
    }, function(err, video){
        if(err) {throw (console.warn("[AP-ERROR] ",err),err)}
        done(null, video);
    });
}

module.exports = mongoose.model("Video", VideoSchema);
