Template.review.created = function () {
  console.log('studyCourse', this.data);
  cards.remove({});
  fetchMoreCards(this.data);
};
Template.review.destroyed = function () {
  clearStudyCards();
};
Template.review.studyTemplate = function () {
  if ( !cards.empty() )
    return 'study';
  if ( Session.equals('loading', true) )
    return 'studyLoading';
  // empty(cards) === true
  return 'studyFinishedReview';
}

Template.studyCourse.created = function () {
  console.log('studyCourse', this.data);
  cards.remove({});
  fetchMoreCards(this.data);
}
Template.studyCourse.destroyed = function () {
  clearStudyCards();
};
Template.studyCourse.studyTemplate = function () {
  if ( !cards.empty() )
    return 'study';
  if ( Session.equals('loading', true) )
    return 'studyLoading';
  // empty(cards) === true
  return 'studyFinished';
}


Template.study.cardTemplate = function () {
  var activeId = Session.get('activeCard');
  if ( activeId === 'final' )
    return 'final';
  var card = activeCard('cardTemplate');
  if ( !card ) return 'studySprintCompleted';
  return 'studyMandarinCard';
}


Template.view.created = function () {
  Session.set('editable', false);
}
Template.view.rendered = function () {
  this.autorun(function () {
    if(Template.view.editable())
      enableSortable(Router.current().data());
  });
}
Template.view.title = function () {
  if( !this.course ) return '';
  var idx = parseInt(this.unitIndex);
  return this.course.units[idx].title;
}
Template.view.content = function () {
  if( !this.course ) return '';
  var idx = parseInt(this.unitIndex);
  return this.course.units[idx].content;
}
Template.view.editable = function () {
  return Session.equals('editable', true) &&
    Roles.userIsInRole(Meteor.userId(), ['editor']);
}
Template.view.editContent = function () {
  return Session.equals('editContent', true) &&
    Template.view.editable();
}
Template.view.editTitle = function () {
  return Session.equals('editTitle', true) &&
    Template.view.editable();
}
Template.view.events({
  'blur .unit-content-editable': function (evt) {
    if( !this.course ) return;
      var idx = parseInt(this.unitIndex);
    var field = 'units.' + idx + '.content';
        obj = {};
    obj[field] = evt.target.value;
    Courses.update({_id: this.course._id},
      {'$set': obj});
    Session.set('editContent', false);
  },
  'keydown .unit-title-editable': function (evt) {
    if (evt.keyCode === 13) {
      evt.target.blur();
    }
  },
  'blur .unit-title-editable': function (evt) {
    if( !this.course ) return;
      var idx = parseInt(this.unitIndex);
    var field = 'units.' + idx + '.title';
        obj = {};
    obj[field] = evt.target.value;
    console.log(evt.target.value);
    Courses.update({_id: this.course._id},
      {'$set': obj});
    Session.set('editTitle', false);
  },
  'click #unlock-edit': function () {
    //enableSortable(this);
    Session.set('editable', true);
  },
  'click #lock-edit': function () {
    $(".unit-list").sortable();
    $(".unit-list").sortable("destroy");
    Session.set('editable', false);
  },
  'dblclick .unit-content': function (evt) {
    if(Template.view.editable())
      Session.set('editContent', true);
  },
  'dblclick .unit-title': function (evt) {
    if(Template.view.editable())
      Session.set('editTitle', true);
  }
});

function enableSortable(context) {
  var course = context.course;
  $(".unit-list").sortable({
      items: "a.unit",
      stop: function (event, ui) {
        var newOrder = $(this).sortable('toArray');
        var units = _.indexBy(course.units, '_id');
        var newUnits = _.map(newOrder, function(key) { return units[key]; });
        Courses.update(course._id,
          {'$set': {'units': newUnits} });
        $(this).sortable('cancel');
        // Let the backend know about the unit ordering.
        Meteor.call('putCourse', course._id, newOrder, function(){});

        var selectedUnitId = course.units[parseInt(context.unitIndex)]._id;
        var selectedUnitIdx = _.indexOf(newOrder, selectedUnitId);

        if( context.unitIndex !== selectedUnitIdx)
          Router.go('view',
            {id: context.courseId, slug: context.slug, nth: selectedUnitIdx});
      }
  });
}





Template.learnToolbar.cards = function () {
  return cards.find().fetch();
};
Template.learnToolbar.cardClass = function () {
  var activeId = Session.get('activeCard');
  var active = activeId == this.value._id ? 'active' : '';
  switch( this.value.status ) {
    case 'active': return active + ' next';
    case 'blocked': return active + ' disabled';
    case 'completed': return active + ' btn-success'
    default: return '';
  }
};
Template.learnToolbar.isCompleted = function () {
  var card = activeCard('isCompleted');
  if ( !card || card.status === 'completed' ) {
    return true;
  }
  return false;
};
Template.learnToolbar.final = function () {
  var activeId = Session.get('activeCard');
  var newCard = cards.findOne({status: "active"});
  if ( !newCard ) {
    if( activeId === 'final' )
      return 'next btn-info active';
    return 'next btn-info';
  }
  return 'disabled'
};
Template.learnToolbar.events({
  'click .learn-toolbar-card': function (evt) {
    Session.set('activeCard', this.value._id);
    console.log(this.value._id);
    //console.log($(evt.target).attr('data-key'));
  },
  'click .learn-toolbar-final': function (evt) {
    Session.set('activeCard', 'final');
    //console.log($(evt.target).attr('data-key'));
  },
  'click #showAnswerBtn': function (evt) {
    activeCard('showAnswerBtn').showAnswer();
  },
  'click #continueBtn': function () {
    var activeId = Session.get('activeCard');
    if( activeId === 'final' ) {
      activateNextCardSet(this.courseId);
    }
    
    var newCard = cards.findOne({status: "active"});
    if( !newCard )
      Session.set('activeCard', 'final');
    else
      Session.set('activeCard', newCard._id);
  }
});

Template.final.created = function () {
  console.log('final created', this.data.action);
  fetchMoreCards(this.data);
};
Template.final.events({
  'click .continue': function (evt) {
    console.log('final clicked', this.action);
    activateNextCardSet(this.courseId);
  }
});


Template.learnLayout.created = function() {
  Session.set('json-upload', undefined);
  Session.set('json-error', undefined);
}
Template.learnLayout.nReviewConcepts = function () {
  var courseId = Router.current().data().courseId;
  var stats = CourseMetrics.findOne({courseId: courseId});
  if( stats && typeof stats.review !== 'undefined' ) return stats.review;
  return 'N/A';
};
Template.learnLayout.activeWhenEq = function (a, b) {
  return a == b ? "active" : "";
};
Template.learnLayout.jsonUpload = function () {
  return Session.get('json-upload');
}
Template.learnLayout.jsonError = function () {
  return Session.get('json-error');
}
Template.learnLayout.events({
  'click .activate-stencils': function(event, template) {
    var json = Session.get('json-upload').json;
    var unitId = template.data.course.units[template.data.unitIndex]._id;
    $(event.target).button('loading');
    Meteor.call('putUnit', unitId, json, function () {
      $(event.target).button('reset');
      $('#uploadModal').modal('hide');
    });
  },
  'change .file-upload-input': function(event, template) {
    var func = this;
    var file = event.currentTarget.files[0];
    var reader = new FileReader();
    Session.set('json-upload',undefined);
    Session.set('json-error', undefined);

    if(file) {
      reader.onload = function(fileLoadEvent) {
        try{
          var json = JSON.parse(reader.result);
          Session.set('json-upload',
            { json: json
            , nStencils: json.length }
          );
        } catch(e) {
          Session.set('json-error', e.message);
        }
        //console.log('file-upload', file, reader.result);
        //Meteor.call('file-upload', file, reader.result);
      };
      reader.readAsText(file);
    }
  }
});


Template.studyNav.nextIdx = function () {
  if( !this.course ) return 0;
  var idx = parseInt(this.unitIndex);
  return idx+1;
};
Template.studyNav.nextActive = function () {
  if( !this.course ) return 0;
  var idx = parseInt(this.unitIndex);
  var nUnits = this.course.units.length;
  return idx+1 < nUnits ? "" : "disabled";
};

Template.studyNav.prevIdx = function () {
  if( !this.course ) return 0;
  var idx = parseInt(this.unitIndex);
  return idx-1;
};
Template.studyNav.prevActive = function () {
  if( !this.course ) return 0;
  var idx = parseInt(this.unitIndex);
  return idx != 0 ? "" : "disabled";
};