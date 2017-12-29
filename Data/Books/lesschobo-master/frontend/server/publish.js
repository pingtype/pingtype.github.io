Meteor.publish(null, function() {
    return Courses.find({});
});

Meteor.publish(null, function (){ 
    return Meteor.roles.find({})
});

Meteor.publish(null, function (){
    return CourseMetrics.find({userId: this.userId});
});
