Template.viewCourse.created = function () {
  var courseId = this.data.courseId;
  console.log('Fetching stencils...', courseId);
  Session.set('stencils', undefined);
  Meteor.call('fetchAnnotatedStencils', courseId, function (err, data) {
    console.log('Got stencils:', data);
    // for(var i=0;i<data.length;i++) {
    //   if( data[i].schedule ) {
    //     var parsed = moment(data[i].schedule);
    //     data[i].scheduleETA  = parsed.fromNow();
    //     data[i].schedulePP   = parsed.calendar();
    //     data[i].scheduleUnix = parsed.unix();
    //   } else {
    //     data[i].scheduleETA  = '';
    //     data[i].schedulePP   = '';
    //     data[i].scheduleUnix = 0;
    //   }
    // }
    Session.set('stencils', data);
    Template.viewCourse.setStencilsCache();
    Meteor.setInterval(Template.viewCourse.setStencilsCache, 10000);
  });
};
Template.viewCourse.setStencilsCache = function () {
  var data = Session.get('stencils')||[];
  for(var i=0;i<data.length;i++) {
    if( data[i].schedule ) {
      var parsed = moment(data[i].schedule);
      data[i].scheduleETA  = parsed.fromNow();
      data[i].schedulePP   = parsed.calendar();
      data[i].scheduleUnix = parsed.unix();
    } else {
      data[i].scheduleETA  = '';
      data[i].schedulePP   = '';
      data[i].scheduleUnix = 0;
    }
  }
  Session.set('stencils', data);
};
Template.viewCourse.stencils = function () {
  var ordering = Session.get('ordering')||'order';
  var stencils = Session.get('stencils')||[];
  if( ordering === 'date' ) {
    return stencils.sort(function (a,b) {
      if( a.schedule === b.schedule ) return a.order - b.order;
      if( a.schedule === null ) return 1;
      if( b.schedule === null ) return -1;
      return a.scheduleUnix - b.scheduleUnix;
    });
  } else {
    return stencils;
  }

};
Template.viewCourse.getETA = function (time) {
  return '';//time?time.fromNow():'';
};
Template.viewCourse.ppTime = function (time) {
  console.log('ppTime', time);
  return ''; // time?time.calendar():'';
};
Template.viewCourse.events({
  'click .order': function (evt) {
    Session.set('ordering', 'order');
  },
  'click .time': function (evt) {
    Session.set('ordering', 'date');
  }
});
