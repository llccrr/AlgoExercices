////////// DECKS ///////////////////////////////////////////////////////////////////////////////////////////////////////
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

    let value = ((card.attack * attack + card.defense * defense) / card.cost) * cost;
    value *= Object.keys(abilities).reduce((total, ability) => total * (card[ability] ? abilities[ability] : 1), 1);
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
  value: () => 0
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///// CONSTANTS ///////////////////////////////////////////////////////////////////////////////////////////////////
const cardTypesEnum = ["creature", "green item", "red item", "blue item"];
const [creatureDeck, itemDeck] = [zooDeck, greenDeck];
const abilitiesWeights = [1, 1, 2, 3, 3, 1]; //B C D G L W
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//// CLASSES ///////////////////////////////////////////////////////////////////////////////////////////////////////
class Card {
  constructor(cardInfo) {
    Object.assign(this, cardInfo);
    this.value = this.deck().value(this);
  }
  deck() {
    return this.cardType === "creature" ? creatureDeck : itemDeck;
  }
}
class Board extends Array {
  constructor(...args) {
    super(...args);
  }
  hasNoGuard() {
    return !this.some(card => card.defense > 0 && card.guard);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    const myHand = cards.filter(card => card.location === 0);
    const myBoard = new Board(...cards.filter(card => card.location === 1));
    const opponentBoard = new Board(...cards.filter(card => card.location === -1));
    const actions = [...summonCreatures(myHand), ...attackOpponent(myBoard, opponentBoard)];
    print(actions.length ? actions.join(";") : "PASS");
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
    if (ennemy.playerHealth <= myCard.attack * 2 && opponentBoard.hasNoGuard()) {
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
        card.attack * 2 + card.defense > chosenCard.attack * 2 + chosenCard.defense
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
    if (card.guard && card.defense >= chosenCard.defense && myCard.attack >= card.defense) {
      return card;
    }
    if (myBoard.hasNoGuard() && myCard.attack >= card.defense && myCard.defense > card.attack) {
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
  const cards = [];
  const opponentHand = parseInt(readline());
  const cardCount = parseInt(readline());
  for (var i = 0; i < cardCount; i++) {
    var inputs = readline().split(" ");

    const cardInfo = new Card({
      nb: i,
      cardNumber: parseInt(inputs[0]),
      id: parseInt(inputs[1]),
      location: parseInt(inputs[2]),
      cardType: cardTypesEnum[parseInt(inputs[3])],
      cost: parseInt(inputs[4]),
      attack: parseInt(inputs[5]),
      defense: parseInt(inputs[6]),
      breakthrough: inputs[7].includes("B"),
      charge: inputs[7].includes("C"),
      drain: inputs[7].includes("D"),
      guard: inputs[7].includes("G"),
      lethal: inputs[7].includes("L"),
      ward: inputs[7].includes("W"),
      myHealthChange: parseInt(inputs[8]),
      opponentHealthChange: parseInt(inputs[9]),
      cardDraw: parseInt(inputs[10])
    });
    cards.push(cardInfo);
  }
  return cards;
}

function draft(cards, turn) {
  const pickBestCard = cards => cards.sort((prev, next) => next.value - prev.value)[0];

  const pickCurvedCard = cards => {
    const deck = card => card.deck();

    const sortedByBest = cards.sort((prev, next) => next.value - prev.value);
    log(sortedByBest);
    log(sortedByBest.map(card => card.value));

    let chosenCard = sortedByBest.find(card => deck(card)[card.cost] > 0 && deck(card)[card.cardType] > 0);
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
  };

  let card;
  if (turn <= 12) {
    card = pickCurvedCard(cards);
  } else {
    card = pickCurvedCard(cards);
  }
  return card;
}

function summonCreatures(myHand) {
  function dfs(graph, root, cards, totalMana, paths) {
    const newGraph = graph.filter(card => card.id !== root.id);
    if (newGraph.length === 0) {
      paths.push(cards);
    }
    for (let i = 0; i < newGraph.length; i++) {
      const child = newGraph[i];
      const newCost = totalMana + child.cost;
      if (newCost <= me.playerMana) {
        dfs(newGraph, child, [...cards, child], newCost, paths);
      } else {
        paths.push(cards);
      }
    }
  }

  const sortedByCost = myHand
    .filter(card => card.cardType === "creature" && card.cost <= me.playerMana)
    .sort((prev, next) => prev.cost - next.cost);

  const paths = [];
  for (let i = 0; i < sortedByCost.length; i++) {
    const root = sortedByCost[i];
    dfs(sortedByCost, root, [root], root.cost, paths);
  }
  if (paths.length === 0) return [];

  const result = paths.reduce((bestCombo, currentCombo) => {
    const bestCost = bestCombo.reduce((total, card) => total + card.cost, 0);
    const currentCost = currentCombo.reduce((total, card) => total + card.cost, 0);
    return bestCombo.length + bestCost < currentCombo.length + currentCost ? currentCombo : bestCombo;
  });
  log("Best Summoning combo", result);
  return result.map(card => `SUMMON ${card.id}`);
}

function attackOpponent(myBoard, opponentBoard) {
  function getBestOpponent(myCard, myBoard, opponentBoard) {
    if (myCard.attack === 0) {
      return opponentCard;
    }
    let attackedOpponent;
    if (myCard.guard && !myCard.breakthrough && !myCard.drain) {
      log("defender");
      attackedOpponent = getDefenderOpponent(myCard, myBoard, opponentBoard);
    } else {
      log("attacker");
      attackedOpponent = getAttackerOpponent(myCard, myBoard, opponentBoard);
    }
    log(attackedOpponent);
    return attackedOpponent;
  }

  let actions = [];
  myBoard = myBoard.sort((prev, next) => getBoardInterest(next) - getBoardInterest(prev));
  log("sorted board : ", myBoard);
  myBoard.forEach(card => {
    if (card.location === 1) {
      let message = "";
      log("attacker: ", card);
      const opponent = getBestOpponent(card, myBoard, opponentBoard);
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
