instantiateChineseCard = function(card) {
  var s = card.sentences;

  for(var i=0; i<s.length; i++) {
      for(var j=0; j<s[i].blocks.length; j++) {
        var block = s[i].blocks[j];
        block.sentenceId = i;
        block.blockId    = j;
        block.len        = block.isEscaped ? 0 : block.chinese.length;
        block.literal    = false;
        block.dictIndex  = 0;
        block.isActive   = false;
        if( !block.isEscaped ) {
          // XXX: Use pinyin from stencil notes.
          block.selectedPinyin = _.uniq(_.pluck(block.definitions, 'pinyin'));
          _.each(block.selectedPinyin, function(str) {
            block.len = Math.max(block.len, str.length/2);
          });
        }
      }
    }
  markNextActiveBlock(card);
  card.shownAnswer = false;
  card.showEnglish = false;
  card.showAnswer = function () {
    console.log('Show answer: mandarin', this);
    
    var card = this;
    if( card.showEnglish ) {
      card.shownAnswer = true;
      // console.log('show answer')
      var elt = $('.autofocus');
      elt.attr('data-content', elt.attr('data-answer-content'));
      $('.autofocus').focus();
      $('.autofocus').popover('show');
    } else {
      card.showEnglish = true;
    }
    saveCard(card);

  };
}

// Clear the currently active block (if there is one) and mark the next
// available gap as active (if there is a next available gap).
function markNextActiveBlock(card) {
  var s = card.sentences;
  for(var i=0; i<s.length; i++) {
    for(var j=0; j<s[i].blocks.length; j++) {
      var block = s[i].blocks[j];
      if ( block.isActive ) {
        block.isActive = false;
        block.isGap    = false;
      } else if ( block.isGap ) {
        block.isActive = true;
        return;
      }
    }
  }
  card.status='completed';
  nextCard();
}

function activeBlock(card) {
  if (!card) return {};

  var s = card.sentences;
  for(var i=0; i<s.length; i++) {
    for(var j=0; j<s[i].blocks.length; j++) {
      var block = s[i].blocks[j];
      if ( block.isActive ) return block;
    }
  }
  return false;
}


Template.studyMandarinCard.rendered = function () {
  $('.mandarin-help').popover({trigger: 'manual'});
  $('#helpModal').on('shown.bs.modal', function (e) {
    if(! $('#helpModal div.popover').is(':visible')) {
      $('.mandarin-help').popover('show');
    }
  })
  this.autorun(function() {
    // $('.active-input').popover({trigger: 'focus'});
    // $('.active-input').popover('show');
  });
};
Template.studyMandarinCard.activeBlock = function () {
  return activeBlock(activeCard('activeBlock'));
};
Template.studyMandarinCard.card = function () {
  return activeCard('card');
};
Template.studyMandarinCard.showPinyin = function (card) {
  return activeBlock(card) == false;
};
Template.studyMandarinCard.showEnglish = function (card) {
  return activeBlock(card) == false || card.showEnglish;
};
Template.studyMandarinCard.answer = function () {
  var block = activeBlock(activeCard('answer'));
  return block.definitions[0].pinyin;
};









function isCorrectAnswer(userAnswerOrig) {
  var card = activeCard('submit');
  var block = activeBlock(card);
  var userAnswer = userAnswerOrig.trimSpaces();

  var pinyinAnswers =
          _.invoke( _.uniq(_.pluck(block.definitions, 'pinyin'))
                  , 'trimSpaces');
  var pinyinAnswersNoTones = _.invoke(pinyinAnswers, 'trimTones');

  if (userAnswer === block.chinese)
    return true;
  if (_.contains(pinyinAnswers, userAnswer))
    return true;
  if (userAnswer === userAnswer.trimTones()) {
    if (_.contains(pinyinAnswersNoTones, userAnswer))
      return true;
  } else if (_.contains(pinyinAnswersNoTones, userAnswer.trimTones())) {
    console.log('tone error')
  }
  return false;
};

Template.studyMandarinCard.events({
  'click .mandarin-translation': function (evt) {
    var card       = activeCard('remove literal');
    card.showEnglish = true;
    saveCard(card);
  },
  'click .mandarin-literal': function (evt) {
    var card       = activeCard('remove literal');
    console.log('remove literal', this);
    card.sentences[this.sentenceId].blocks[this.blockId].literal = '';
    saveCard(card);
  },
  'click .mandarin-dict-select': function (evt) {
    var card       = activeCard('dict select');
    var s          = card.sentences;
    var sentenceId = $(evt.target).attr('data-sentence-id');
    var blockId    = $(evt.target).attr('data-block-id');
    var pinyinIdx  = $(evt.target).attr('data-pinyin-idx');
    var englishIdx = $(evt.target).attr('data-english-idx');

    var block      = s[sentenceId].blocks[blockId];
    var definition = block.definitions[pinyinIdx];
    var pinyin     = definition.pinyin;
    var english    = definition.english[englishIdx];

    console.log('select', pinyin, english);
    block.literal = english;
    block.dictIndex = pinyinIdx;
    block.selectedPinyin = [block.definitions[pinyinIdx].pinyin];
    saveCard(card);
  },
  // 'click .mandarin-continue': function () {
  //   console.log('continue');
  //   var card = activeCard();
  //   card.status = card.showAnswer ? 'missed' : 'perfect' ;
  //   saveCard(card);
  //   nextCard();
  // },
  'keydown .active-input': function (evt) {
    if (evt.keyCode === 27) {
      var card = activeCard('escape');
      card.showAnswer();
    } else if(evt.keyCode===13) {
      var card = activeCard('submit');
      var block = activeBlock(card);
      var userAnswer = evt.currentTarget.value;
      
      var response = {stencilId: card.stencilId,
                      content: {
                        type: 'MandarinTextAnswer',
                        shownAnswer: card.shownAnswer,
                        key: block.chinese,
                        value: userAnswer },
                      at: (new Date().toJSON())
                     };
      Meteor.call(
        'postResponse',
        getTempUserId(),
        Router.current().data().courseId,
        response);

      if (isCorrectAnswer(userAnswer)) {
        $(evt.target).popover('destroy');
        markNextActiveBlock(card);
        card.shownAnswer = false;
        saveCard(card);
      } else {
        console.log('incorrect', userAnswer, block.chinese);
        $(evt.currentTarget).select();
      }
    } else if(evt.keyCode === 32) {
      var card = activeCard('submit');
      var block = activeBlock(card);
      var userAnswer = evt.currentTarget.value;
      if(isCorrectAnswer(userAnswer)) {
        var e = $.Event('keydown');
        e.keyCode=13;
        $(evt.target).trigger(e);
      }
    }
  }
});




