var backend = process.env['BACKEND_PORT_8000_TCP_ADDR'] || 'localhost';
var port    = process.env['BACKEND_PORT_8000_TCP_PORT'] || '8000';
var path = 'http://' + backend + ':' + port;

Meteor.methods({
  fetchReviewCards: function (tmpUserId, courseId) {
    var userId = Meteor.userId() || tmpUserId;
    var ret = HTTP.call(
      'GET',
      path + '/users/' + userId + '/courses/' + courseId + '/review');
    return JSON.parse(ret.content);
  },
  fetchStudyCards: function (tmpUserId, courseId, unitIdx) {
    var userId = Meteor.userId() || tmpUserId;
    var ret = HTTP.call(
      'GET',
      path + '/users/' + userId + '/courses/' + courseId + '/' + unitIdx);
    console.log('study', courseId, JSON.parse(ret.content));
    return JSON.parse(ret.content);
  },
  // fetchAnnotatedStencils: function (courseId) {
  //   console.log('userId', Meteor.userId());
  //   var ret = HTTP.call('GET', 'http://localhost:8000/users/' + Meteor.userId() + '/units/' + courseId + '/stencils/');
  //   return JSON.parse(ret.content);
  // },
  postResponse: function(tmpUserId, courseId, response) {
    
    response.userId = Meteor.userId() || tmpUserId;
    console.log('userId', response.userId);

    return HTTP.call(
      'POST',
      path + '/responses/' + courseId,
      {data: response, params: {key: 'value'}});
  },

  putCourse: function(courseId, unitIds) {
    // FIXME: Fail if course is malformed.
    // XXX: Limit this call to admins/authors.
    HTTP.call(
      'PUT',
      path+'/courses/'+courseId,
      {data: unitIds });
  },
  putUnit: function(unitId, stencils) {
    // XXX: Limit this call to admins/authors.
    HTTP.call(
      'PUT',
      path+'/units/'+unitId,
      {data: stencils});
  }
});

