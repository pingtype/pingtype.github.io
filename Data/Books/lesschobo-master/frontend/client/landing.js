Template.landing.watermelonPath = function () {
  return Router.routes['view'].path({
    id: 'XYQDY9dzoNYcfMoGn',
    slug: 'watermelon',
    nth: 0
  });
};
Template.landing.umbrellaPath = function () {
  return Router.routes['view'].path({
    id: 'T2B9nPPqdfJ4N8va3',
    slug: 'umbrella',
    nth: 0
  });
};
Template.landing.hskPath = function () {
  return Router.routes['view'].path({
    id: 'J7bpTCDFqQpEhtNbb',
    slug: 'hsk',
    nth: 0
  });
};
Template.landing.courses = function () {
  var initCourses = [
        'XYQDY9dzoNYcfMoGn',
        'T2B9nPPqdfJ4N8va3',
        'evJkCP4KRroQyyRBX'];
  return Courses.find({_id: {$in: initCourses}}).fetch();
};
