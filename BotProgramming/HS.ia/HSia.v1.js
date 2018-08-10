//// CLASSES ///////////////////////////////////////////////////////////////////////////////////////////////////////
class Card {
  constructor(cardInfo) {
    Object.assign(this, cardInfo);
  }

  isCreature() {
    return this.cardType === "creature";
  }

  isGreenItem() {
    return this.cardType === "green item";
  }

  isRedItem() {
    return this.cardType === "red item";
  }

  isBlueItem() {
    return this.cardType === "blue item";
  }

  isDefender() {
    return this.guard && !this.breakthrough && !this.drain;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////// DECKS ///////////////////////////////////////////////////////////////////////////////////////////////////////
const emptyDeck = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 1,
  9: 0,
  10: 0,
  11: 0,
  12: 0,
  "green item": 0,
  "red item": 0,
  "blue item": 0,
  value: () => {
    0;
  }
};
const zooDeck = {
  0: 0,
  1: 4,
  2: 4,
  3: 6,
  4: 6,
  5: 5,
  6: 3,
  7: 2,
  8: 1,
  9: 0,
  10: 1,
  11: 0,
  12: 0,
  creature: 30,
  value: (card, turn) => {
    const attack = 3;
    const defense = 2;
    const abilities = {
      breakthrough: 1.8,
      charge: 2,
      drain: 1.4,
      guard: 1,
      lethal: 2,
      ward: 1.8
    };
    const cost = 1.5;

    let value =
      (card.attack * attack + card.defense * defense) / card.cost * cost;
    value *= Object.keys(abilities).reduce(
      (total, ability) => total * (card[ability] ? abilities[ability] : 1),
      1
    );
    value *= card.attack !== 0;
    return value;
  }
};
const greenDeck = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  "green item": 5,
  "red item": 0,
  "blue item": 0,
  value: () => {
    0;
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * TODO
 * toujours viser le 0 mana à la fin du tour (pas urgent)
 * revoir utilisation des items verts
 * buter les lethal adverse avec des petites cartes
 * si pas de guard sur le terrain, privilégier la pose de guard
 * gérer les abilities sur les green items
 * eviter de suicider une bete si carte qui vient dêtre summon peut la tuer au prochain tour
 * joouer drain à la place de lethal
 * curve pour les items
 * fonctions de calcul de poids à mettre dans le deck
 */
const debug = true;
let me = {};
let ennemy = {};
let opponentCard = new Card({
  id: -1,
  attack: 0,
  defense: 30,
  abilities: "------"
});
let phase = "DRAFT";
const cardTypesEnum = ["creature", "green item", "red item", "blue item"];
const [creatureDeck, itemDeck] = [zooDeck, greenDeck];
const abilitiesWeights = [1, 1, 2, 3, 3, 1]; //B C D G L W
let turn = 1;

// game loop
while (true) {
  updatePlayersAndCurrentPhase();
  const cards = getCardsList();

  if (phase === "DRAFT") {
    const card = draft(cards, turn);
    turn++;
    print(`PICK ${card.nb}`);
  } else {
    play(cards);
  }
}

//////// BRAIN FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////
function getBoardInterest(card) {
  return 1;
}

function getDefenderOpponent(myCard, myBoard, opponentBoard) {
  return opponentBoard.find(card => card.attack === 0) || opponentCard;
}

function getAttackerOpponent(myCard, myBoard, opponentBoard) {
  return opponentBoard.reduce((chosenCard, card) => {
    if (card.defense <= 0) {
      return chosenCard;
    }
    if (card.guard && !chosenCard.guard) {
      return card;
    }
    if (!card.guard && chosenCard.guard) {
      return chosenCard;
    }
    if (card.lethal) {
      return chosenCard;
    }
    if (ennemy.playerHealth <= myCard.attack * 2 && hasNoGuard(opponentBoard)) {
      return opponentCard;
    }
    if (myCard.lethal) {
      if (card.guard) {
        if (chosenCard.defense > card.defense) {
          return chosenCard;
        } else if (chosenCard.defense === card.defense) {
          return chosenCard.attack > card.attack ? chosenCard : card;
        } else {
          return card;
        }
      }
      if (
        (chosenCard.id == -1 && card.attack + card.defense > 6) ||
        card.attack * 2 + card.defense >
          chosenCard.attack * 2 + chosenCard.defense
      ) {
        return card;
      }
    }
    if (myCard.breakthrough && card.defense * 2 < myCard.attack) {
      return card;
    }
    if (myCard.ward) {
      if (chosenCard.id == -1 || chosenCard.attack < card.attack) {
        return card;
      } else {
        return chosenCard;
      }
    }
    if (
      card.guard &&
      card.defense >= chosenCard.defense &&
      myCard.attack >= card.defense
    ) {
      return card;
    }
    if (
      hasNoGuard(myBoard) &&
      myCard.attack >= card.defense &&
      myCard.defense > card.attack
    ) {
      return card;
    }

    return chosenCard;
  }, opponentCard);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////// GAME FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////////
function updatePlayersAndCurrentPhase() {
  const getPlayerInfo = () => {
    const [playerHealth, playerMana, playerDeck, playerRune] = readline()
      .split(" ")
      .map(val => parseInt(val));
    return { playerHealth, playerMana, playerDeck, playerRune };
  };

  me = getPlayerInfo();
  ennemy = getPlayerInfo();

  if (me.playerMana === 0) {
    phase = "DRAFT";
  } else {
    phase = "BATTLE";
  }
}

function getCardsList() {
  const pickValue = card => {
    switch (card.cardType) {
      case "creature":
        return creatureDeck.value(card, turn);
      case "green item":
        return itemDeck.value(card, turn);
      case "red item":
        return itemDeck.value(card, turn);
      case "blue item":
        return itemDeck.value(card, turn);
      default:
        return -1;
    }
  };

  var cards = [];
  var opponentHand = parseInt(readline());
  var cardCount = parseInt(readline());
  for (var i = 0; i < cardCount; i++) {
    var inputs = readline().split(" ");
    var cardNumber = parseInt(inputs[0]);
    var instanceId = parseInt(inputs[1]);
    var location = parseInt(inputs[2]);
    var cardType = parseInt(inputs[3]);
    var cost = parseInt(inputs[4]);
    var attack = parseInt(inputs[5]);
    var defense = parseInt(inputs[6]);
    var abilities = inputs[7];
    var myHealthChange = parseInt(inputs[8]);
    var opponentHealthChange = parseInt(inputs[9]);
    var cardDraw = parseInt(inputs[10]);

    const cardInfo = new Card({
      nb: i,
      cardNumber,
      id: instanceId,
      location,
      cost,
      attack,
      defense,
      breakthrough: abilities.includes("B"),
      charge: abilities.includes("C"),
      drain: abilities.includes("D"),
      guard: abilities.includes("G"),
      lethal: abilities.includes("L"),
      ward: abilities.includes("W"),
      myHealthChange,
      opponentHealthChange,
      cardDraw,
      cardType: cardTypesEnum[cardType]
    });
    cardInfo.value = pickValue(cardInfo);
    cards.push(cardInfo);
  }
  return cards;
}

function draft(cards, turn) {
  let card;
  if (turn <= 12) {
    card = pickCurvedCard(cards);
  } else {
    card = pickCurvedCard(cards);
  }
  return card;
}

function pickBestCard(cards) {
  const sortedByBest = cards.sort((prev, next) => next.value - prev.value);
  return sortedByBest[0];
}

function pickCurvedCard(cards) {
  const deck = card => (card.isCreature() ? creatureDeck : itemDeck);

  const sortedByBest = cards.sort((prev, next) => next.value - prev.value);
  log(sortedByBest);
  log(sortedByBest.map(card => card.value));

  let chosenCard = sortedByBest.find(
    card => deck(card)[card.cost] > 0 && deck(card)[card.cardType] > 0
  );
  log(chosenCard);

  if (!chosenCard) {
    chosenCard = sortedByBest.find(card => deck(card)[card.cardType] > 0);
    log("card not found, checking card type", chosenCard);
  }
  if (!chosenCard) {
    chosenCard = sortedByBest.find(card => deck(card)[card.cost] > 0);
    log("card not found, checking card cost", chosenCard);
  }

  const cardToPick = chosenCard || sortedByBest[0];
  deck(cardToPick)[cardToPick.cost]--;
  deck(cardToPick)[cardToPick.cardType]--;
  log(cardToPick.value);
  log(deck(cardToPick));
  return cardToPick;
}

function play(cards) {
  const myHand = cards.filter(card => card.location === 0);
  const myBoard = cards.filter(card => card.location === 1);
  const opponentBoard = cards.filter(card => card.location === -1);
  const actions = [
    ...summonCreatures(myHand, myBoard),
    ...attackOpponent(myBoard, opponentBoard)
  ];
  print(actions.length ? actions.join(";") : "PASS");
}

function dfs(graph, root, cards, totalMana, paths) {
  const newGraph = graph.filter(card => card.id !== root.id);
  for (let i = 0; i < newGraph.length; i++) {
    const child = newGraph[i];
    const newCost = totalMana + child.cost;
    if (newCost <= playerMana) {
      dfs(newGraph, child, [...cards, child], newCost, paths);
    } else {
      paths.push(cards);
    }
  }
}

function summonCreatures(myHand, myBoard) {
  const sortedByCost = myHand
    .filter(card => card.isCreature() && card.cost <= me.playerMana)
    .sort((prev, next) => prev.cost - next.cost);

  const paths = [];
  for (let i = 0; i < sortedByCost.length; i++) {
    const root = sortedByCost[i];
    dfs(sortedByCost, root, [root], root.cost, paths);
  }

  const result = paths.reduce((bestCombo, currentCombo) => {
    const bestCost = bestCombo.reduce((total, card) => total + card.cost, 0);
    const currentCost = currentCombo.reduce(
      (total, card) => total + card.cost,
      0
    );
    return bestCombo.length + bestCost < currentCombo.length + currentCost
      ? currentCombo
      : bestCombo;
  });
  log("Best Summoning combo" + result);
  return result;

  // const summonedCards = sortedByCost.reduce((prevCombo, card1) => {
  //     const currentCombo = sortedByCost.reduce((tmp, card2) => {
  //         if (card1.id !== card2.id && tmp.mana + card2.cost <= me.playerMana) {
  //             return { mana: card2.cost + tmp.mana, cards: [...tmp.cards, card2] };
  //         } else {
  //             return tmp;
  //         }
  //     }, { mana: card1.cost, cards: [card1] });

  //     if(prevCombo.mana >= currentCombo.mana && prevCombo.cards.length >= currentCombo.cards.length) {
  //         return prevCombo;
  //     } else {
  //         return currentCombo;
  //     }
  // }, { mana: 0, cards: [] });
  // log('sorted hand: ', sortedByInterest, sortedByInterest.map(card => card.value));

  // const summonedCards = sortedByInterest.filter(card => {
  //     if (me.playerMana - card.cost >= 0) {
  //         me.playerMana -= card.cost;
  //         if (card.charge) card.location = 1;
  //         myBoard.push(card);
  //         return true;
  //     } else {
  //         return false;
  //     }
  // });
  // log('summoned cards: ', summonedCards);

  // return summonedCards.map(card => `SUMMON ${card.id}`);
}

function attackOpponent(myBoard, opponentBoard) {
  let actions = [];
  myBoard = myBoard.sort(
    (prev, next) => getBoardInterest(next) - getBoardInterest(prev)
  );
  log("sorted board : ", myBoard);
  myBoard.forEach(card => {
    if (card.location === 1) {
      let message = "";
      log("attacker: ", card);
      const opponent = getBestOpponent(card, myBoard, opponentBoard);
      log("attacked opponent: ", opponent);
      if (opponent.ward) {
        opponent.ward = false;
      } else {
        if (opponent.id === -1) {
          ennemy.playerHealth -= card.attack;
        } else {
          opponent.defense -= card.attack;
        }
      }
      if (card.lethal) opponent.defense = 0;
      if (card.attack === 0) message = "*pouic*";
      actions.push(`ATTACK ${card.id} ${opponent.id} ${message}`);
    }
  });
  return actions;
}

function getBestOpponent(myCard, myBoard, opponentBoard) {
  if (myCard.attack === 0) {
    return opponentCard;
  }

  if (myCard.isDefender()) {
    return getDefenderOpponent(myCard, myBoard, opponentBoard);
  } else {
    return getAttackerOpponent(myCard, myBoard, opponentBoard);
  }
}

function hasNoGuard(board) {
  return !board.some(card => card.defense > 0 && card.guard);
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////// UTILITIES ///////////////////////////////////////////////////////////////////////////////////////////////////
function log(...messages) {
  if (debug) {
    messages.forEach(message => {
      if (typeof message === "object") {
        message = JSON.stringify(message);
      }
      printErr(message);
    });
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
