Meteor.users.allow({
  update: function(userId) {
    return Roles.userIsInRole(userId, ['admin']);
  }
});

Courses = new Meteor.Collection('courses');

Courses.allow({
  insert: function(userId) {
    return Roles.userIsInRole(userId, ['editor']);
  },
  // XXX: Use groups to prevent different creators from
  //      editing each other's courses.
  update: function(userId) {
    return Roles.userIsInRole(userId, ['editor']);
  },
  remove: function(userId) {
    return Roles.userIsInRole(userId, ['editor']);
  }
});

/*
Courses JSON

{ _id: id
, title: text
, slug: text
, description: text
, units: [] }

Units JSON
{ _id: id
, title: text }


Courses Status JSON
{ userId
, courseId
, status: new/seen/mastered
, percentage }

Units Status JSON
{ userId
, unitId
, }

*/

CourseMetrics = new Meteor.Collection('CourseStats');
