// We fetch cards in the background without acting on them.
// This collection can be accessed without race conditions
// due to the singled threaded nature of JavaScript.
var cardsPrefetched = new Meteor.Collection(null);
cards = new Meteor.Collection(null);

clearStudyCards = function() {
  cardsPrefetched.remove({});
  cards.remove({});
}

// Fetch cards from either the review queue or the
// practice queue, depending on context.
// context.action must be set.
fetchMoreCards = function (context) {
  if( cardsPrefetched.empty() ) {
    switch(context.action) {
      case 'review':
        fetchMoreReviewCards(context.courseId);
        return;
      case 'study':
        fetchMoreStudyCards(context.courseId, context.unitIndex);
        return;
      default:
        console.log('fetchMoreCards: Invalid context', context);
        return;
    }
  } else {
    // console.log('Cards already in prefetch queue.');
    activateNextCardSet();
  }
}

function processCards(newCards) {
  // console.log('Processing cards', newCards);
  instantiateCards(newCards);

  cardsPrefetched.remove({});
  // console.log('Cards stored in prefetch cache.');
  cardsPrefetched.insertMany(newCards);

  // If we don't have any active cards, switch to the
  // prefetched deck.
  if ( cards.empty() ) {
    activateNextCardSet();
  }
}
fetchMoreReviewCards = function(courseId) {
  Session.set('loading', true);
  Meteor.call('fetchReviewCards', getTempUserId(), courseId,
    function (err, data) {
      Session.set('loading', false);
      processCards(data);
    });
}
fetchMoreStudyCards = function(courseId, unitIdx) {
  Session.set('loading', true);
  Meteor.call('fetchStudyCards', getTempUserId(), courseId, unitIdx,
    function (err, data) {
      Session.set('loading', false);
      processCards(data);
    });
}

activateNextCardSet = function () {
  cards.remove({});
  if ( Session.equals('loading', true) ) {
    // Cards are being loaded. Remove the cards we have now so that
    // when the new cards are fetched, they'll be used immediately.
    // console.log('Cards are being loaded.');
  } else {
    // Cards have been prefetched. Move them to the active collection.
    // console.log('Cards available. Switching immediately.');
    cards.copy(cardsPrefetched);
    cardsPrefetched.remove({});
    if( !cards.empty() )
      Session.set('activeCard', cards.findOne()._id);
  }
}

// Instantiate extra card fields which are used for teaching logic.
function instantiateCards(cards) {
  for(var i=0; i<cards.length; i++) {
    cards[i].status = 'blocked';
    switch (cards[i].type) {
      case "chinese":
        instantiateChineseCard(cards[i]);
        break;
      default:
        console.log('instatiateCards: unhandled card type', cards[i].type);
        break;
    }
  }
  if( cards.length > 0)
    cards[0].status = 'active';
}

activeCard = function(origin) {
  // console.log('activeCard', origin);
  var activeId = Session.get('activeCard');
  return cards.findOne({_id: activeId});
}
// activeCard = function () {
//   console.log('activeCard');
//   var activeId = Session.get('activeCard');
//   return cards.findOne({_id: activeId});
// }
saveCard = function (card) {
  cards.update({_id: card._id}, card);
}
nextCard = function () {
  var activeId = Session.get('activeCard');
  var newCard = cards.findOne({status: "blocked"});
  if ( !newCard ) {
    return;
  }
  newCard.status = 'active';
  saveCard(newCard);
}


