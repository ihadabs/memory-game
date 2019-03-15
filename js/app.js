const stars = document.querySelectorAll(".stars li");
const restartButton = document.querySelector(".restart");
const allCards = document.querySelectorAll(".card");
const timerDiv = document.querySelector(".timer");
const openShowClasses = ["open", "show"];

let numberOfMoves = 0;
let matchedCards = 0;
let opendCards = [];
let isProcessing = false;
let timestamp = new Date();
let stop = true;

const stars3 = 25;
const stars2 = 35;
const stars1 = 45;

const getElapsedTime = () => (new Date() - timestamp) / 1000;

const updateTimer = () => {
  if (!stop) {
    timerDiv.innerHTML = Math.floor(getElapsedTime());
  }
};

const startTimer = () => setInterval(updateTimer, 300);

const sleep = time => {
  return new Promise(resolve => setTimeout(resolve, time));
};

const shuffleCards = () => {
  var ul = document.querySelector(".deck");
  for (var i = ul.children.length; i >= 0; i--) {
    ul.appendChild(ul.children[(Math.random() * i) | 0]);
  }
};

const updateStarRating = reset => {
  if (reset !== undefined) {
    stars.forEach(star => fillStar(star, true));
    return;
  }

  stars.forEach((star, i) => {
    if (i == 2) fillStar(star, numberOfMoves <= stars3);
    if (i == 1) fillStar(star, numberOfMoves <= stars2);
    if (i == 0) fillStar(star, numberOfMoves <= stars1);
  });
};

const fillStar = (star, fill) => {
  if (fill) {
    star.classList.remove("fa-star-o");
    star.classList.add("fa-star");
  } else {
    star.classList.remove("fa-star");
    star.classList.add("fa-star-o");
  }
};

const updateNumberOfMoves = number => {
  let moves = document.querySelector(".moves");
  if (number === 0) numberOfMoves = 0;
  else ++numberOfMoves;
  moves.innerHTML = numberOfMoves;
  updateStarRating();
};

const openAllCards = () => {
  allCards.forEach(card => openCard(card));
  isProcessing = true;
  return sleep(2000).then(() => {
    closeCards(allCards);
    isProcessing = false;
  });
};

const restart = () => {
  stop = true;
  timerDiv.innerHTML = 0;
  matchedCards = 0;
  opendCards = [];
  updateNumberOfMoves(0);
  allCards.forEach(card => {
    card.classList = ["card"];
  });
  shuffleCards();
  updateStarRating(true);
  openAllCards().then(() => {
    stop = false;
    timestamp = new Date();
  });
};

const openCard = card => {
  card.classList.add(...openShowClasses);
};

const closeCards = cards => {
  cards.forEach(card => {
    card.classList.remove(...openShowClasses);
  });
};

const matchCards = cards => {
  closeCards(cards);
  matchedCards += 2;
  cards.forEach(card => {
    card.classList.add("match");
  });
  sleep(50).then(() => {
    if (matchedCards >= allCards.length) {
      stopTimer();
      allMatched();
    }
  });
};

allCards.forEach(card => {
  card.onclick = () => {
    // Make sure there is process is going on
    if (isProcessing) return;

    // Check if card is already matched
    if (card.classList.contains("match")) return;

    let lastOpendCard = opendCards.shift();

    // Check if cards are not the same
    if (lastOpendCard === card) {
      opendCards.unshift(lastOpendCard);
      return;
    }

    isProcessing = true;
    openCard(card);
    updateNumberOfMoves();

    if (lastOpendCard != undefined) {
      // Check if cards icons matched
      if (
        lastOpendCard.firstElementChild.classList[1] ===
        card.firstElementChild.classList[1]
      ) {
        matchCards([lastOpendCard, card]);
        isProcessing = false;
      } else {
        // Add sleep so user can see last opened card
        sleep(800).then(() => {
          closeCards([lastOpendCard, card]);
          isProcessing = false;
        });
      }
    } else {
      // Card is pushed since there is no other card to compare with
      opendCards.push(card);
      isProcessing = false;
    }
  };
});

restartButton.onclick = restart;
restart();
startTimer();

const allMatched = () => {
  const starRating =
    numberOfMoves <= stars3
      ? 3
      : numberOfMoves <= stars2
      ? 2
      : numberOfMoves <= stars1
      ? 3
      : 0;
  const wantToRestart = window.confirm(
    "Congratulations, you have made it!" +
      "\n" +
      "You took " +
      getElapsedTime() +
      " seconds, " +
      "\n" +
      "Your rate is " +
      starRating +
      " out of 3," +
      "\n" +
      "To restart the game press OK"
  );
  if (wantToRestart) restart();
  else stop = true;
};
