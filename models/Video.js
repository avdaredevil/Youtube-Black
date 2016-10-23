var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ChartMetadata = require('./ChartMetadata');

ProjectSchema = new Schema({
    name: {type: String, trim: true, required: true},
    created: {type: Date, default: Date.now},
    state: {type: String, enum: ["pending","analyzing","processed"], lowercase: true},
    metadata: [ChartMetadata.schema],
    data: {}
})
ProjectSchema.set("toJSON", {virtuals: true})
ProjectSchema.set("toObject", {virtuals: true})

ProjectSchema.statics.newProject = function(name, data, done){
    if (typeof data === "function" && !done) {done = data;data=undefined}
	var Project = this;
    Project.create({
        name: name,
        state: "pending",
        data: data
    }, function(err, project){
        if(err) {throw (console.warn("[AP-ERROR] ",err),err)}
        done(null, project);
    });
}

module.exports = mongoose.model("Project", ProjectSchema);