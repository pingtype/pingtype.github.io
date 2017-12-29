Template.browseCourses.rendered = function () {
  var self = this;
  // this.autorun(function() {
  //   Tracker.afterFlush(function () {
  //     self.$('.meter').tooltip();
  //   });
  // });
};
Template.browseCourses.courses = function () {
  return Courses.find({}).fetch();
};
Template.courseLine.ofTotalPercent = function (field) {
  var obj = CourseMetrics.findOne({courseId: this._id});
  if( obj ) {
    return Math.round(obj[field] / obj.total * 100);
  } else {
    return '0';
  }
};
