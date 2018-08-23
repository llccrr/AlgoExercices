////////// DECKS ///////////////////////////////////////////////////////////////////////////////////////////////////////
const zooDeck = {
  0: 0,
  1: 3,
  2: 3,
  3: 5,
  4: 6,
  5: 5,
  6: 3,
  7: 2,
  8: 2,
  12: 1,
  creature: 30,
  value: (card, turn) => {
    const attack = 5;
    const defense = 2;
    const abilities = {
      breakthrough: 1,
      charge: 1,
      drain: 3,
      guard: 4,
      lethal: 12,
      ward: 3
    };
    const cost = 1.5;

    let value = ((card.attack * attack + card.defense * defense) / (card.cost || 1)) * cost; /// typo sur le cost ???
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
  'green item': 5,
  'red item': 0,
  'blue item': 0,
  value: () => 0
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///// CONSTANTS ///////////////////////////////////////////////////////////////////////////////////////////////////
const cardTypesEnum = ['creature', 'green item', 'red item', 'blue item'];
const [creatureDeck, itemDeck] = [zooDeck, greenDeck];
const abilitiesWeights = [1, 1, 2, 3, 3, 1]; //B C D G L W
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//// CLASSES ///////////////////////////////////////////////////////////////////////////////////////////////////////
class Actions {
  static pick(card) {
    return `PICK ${card.nb}`;
  }
  static attack(myCard, opponent) {
    return `ATTACK ${myCard.id} ${opponent.id}`;
  }
  static summon(card) {
    return `SUMMON ${card.id}`;
  }
}
class Card {
  constructor(cardInfo) {
    Object.assign(this, cardInfo);
    this.value = this.deck().value(this);
  }
  deck() {
    return this.cardType === 'creature' ? creatureDeck : itemDeck;
  }
}
class Board extends Array {
  constructor(...args) {
    super(...args);
  }
  sortBy(carac, order = 'asc') {
    return this.sort((prev, next) => (order === 'asc' ? prev[carac] - next[carac] : next[carac] - prev[carac]));
  }
  filterBy(carac) {
    return this.filter(card => card[carac]);
  }
  rejectBy(carac) {
    return this.filter(card => !card[carac]);
  }
  sumBy(carac) {
    return this.reduce((total, card) => total + card[carac], 0);
  }
}
class Combo {
  constructor(opponent, combo) {
    this.opponent = opponent;
    this.combo = combo;
    this.loss = combo.reduce((total, card) => total + (card.defense <= opponent.attack || opponent.lethal ? 1 : 0), 0);
    this.efficient = combo.reduce((total, card) => total - card.attack, opponent.defense);
  }

  isPlayable() {
    return !this.opponent.downed && !this.combo.some(card => card.used);
  }

  formatActions() {
    this.combo.map(card => Actions.attack(card, this.opponent)).join(';');
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * TODO
 * eviter de suicider une bete si carte qui vient dêtre summon peut la tuer au prochain tour
 * gerer ward allié et lethal ennemi dans dsf
 * rajouter coeff sur cardDraw, healthChange...
 * bug si crea a un cost de 0
 * typo sur le cost (?)
 * extend Array plutot que de faire une classe Board
 */
const debug = true;
let me = {};
let ennemy = {};
let phase = 'DRAFT';
let turn = 1;

// game loop
while (true) {
  updatePlayersAndCurrentPhase();
  const cards = getCardsList();

  if (phase === 'DRAFT') {
    const card = draft(cards, turn);
    turn++;
    print(Actions.pick(card));
  } else {
    const myHand = new Board(...cards.filter(card => card.location === 0));
    const myBoard = new Board(...cards.filter(card => card.location === 1));
    const opponentBoard = new Board(...cards.filter(card => card.location === -1));
    const actions = [...summonCreatures(myHand, myBoard), ...attackOpponent(myBoard, opponentBoard)];
    print(actions.length ? actions.join(';') : 'PASS');
  }
}

/////// GAME FUNCTIONS /////////////////////////////////////////////////////////////////////////////////////////////////
function updatePlayersAndCurrentPhase() {
  const getPlayerInfo = () => {
    const [playerHealth, playerMana, playerDeck, playerRune] = readline()
      .split(' ')
      .map(val => parseInt(val));
    return { playerHealth, playerMana, playerDeck, playerRune };
  };

  me = getPlayerInfo();
  ennemy = Object.assign({ id: -1 }, getPlayerInfo());

  if (me.playerMana === 0) {
    phase = 'DRAFT';
  } else {
    phase = 'BATTLE';
  }
}

function getCardsList() {
  const cards = new Board();
  const opponentHand = parseInt(readline());
  const cardCount = parseInt(readline());
  for (var i = 0; i < cardCount; i++) {
    var inputs = readline().split(' ');

    const cardInfo = new Card({
      nb: i,
      cardNumber: parseInt(inputs[0]),
      id: parseInt(inputs[1]),
      location: parseInt(inputs[2]),
      cardType: cardTypesEnum[parseInt(inputs[3])],
      cost: parseInt(inputs[4]),
      attack: parseInt(inputs[5]),
      defense: parseInt(inputs[6]),
      breakthrough: inputs[7].includes('B'),
      charge: inputs[7].includes('C'),
      drain: inputs[7].includes('D'),
      guard: inputs[7].includes('G'),
      lethal: inputs[7].includes('L'),
      ward: inputs[7].includes('W'),
      myHealthChange: parseInt(inputs[8]),
      opponentHealthChange: parseInt(inputs[9]),
      cardDraw: parseInt(inputs[10])
    });
    cards.push(cardInfo);
  }
  return cards;
}

function draft(cards, turn) {
  const pickBestCard = cards => cards.sortBy('value', 'desc')[0];

  const pickCurvedCard = cards => {
    const sortedByBest = cards.sortBy('value', 'desc');
    log(...sortedByBest.map(card => `${card.attack} ${card.defense} pour ${card.cost} (${card.value})`));

    let chosenCard = sortedByBest.find(card => card.deck()[card.cost] > 0 && card.deck()[card.cardType] > 0);
    if (!chosenCard) {
      chosenCard = sortedByBest.find(card => card.deck()[card.cardType] > 0);
    }
    if (!chosenCard) {
      chosenCard = sortedByBest.find(card => card.deck()[card.cost] > 0);
    }

    const cardToPick = chosenCard || sortedByBest[0];
    cardToPick.deck()[cardToPick.cost]--;
    cardToPick.deck()[cardToPick.cardType]--;
    log(cardToPick.deck());
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

function summonCreatures(myHand, myBoard) {
  const sortedByCost = myHand.filter(card => card.cardType === 'creature' && card.cost <= me.playerMana).sortBy('cost');

  ////find all summon combos//////////////////////////////////////////////////////////////////////////////////////////////
  ///different des attack
  function dfs(graph, root, cards, total, paths) {
    const newGraph = graph.filter(card => card.id !== root.id);
    if (newGraph.length === 0) {
      paths.push(cards);
    }
    for (let i = 0; i < newGraph.length; i++) {
      const child = newGraph[i];
      const newCost = total + child.cost;
      if (newCost <= me.playerMana && myBoard.length + cards.length <= 5) {
        dfs(newGraph, child, [...cards, child], newCost, paths);
      } else {
        paths.push(cards);
      }
    }
  }
  const summonCombos = [];
  for (let i = 0; i < sortedByCost.length; i++) {
    const root = sortedByCost[i];
    dfs(sortedByCost, root, [root], root.cost, summonCombos);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  if (summonCombos.length === 0) return [];

  //find best combo (with most creatures and most cost)
  const comboToSummon = summonCombos.reduce((bestCombo, currentCombo) => {
    const bestCost = bestCombo.reduce((total, card) => total + card.cost, 0);
    const currentCost = currentCombo.reduce((total, card) => total + card.cost, 0);
    return bestCombo.length + bestCost < currentCombo.length + currentCost ? currentCombo : bestCombo;
  });
  log('Best Summoning combo', comboToSummon);

  //add directly to the board all cards with charge
  comboToSummon.forEach(card => {
    if (card.charge) {
      card.location = 1;
      myBoard.push(card);
    }
  });
  return comboToSummon.map(Actions.summon);
}

function attackOpponent(myBoard, opponentBoard) {
  if (myBoard.length === 0) return [];
  let actions = [];
  opponentBoard.length && actions.push(...lethalsAttack(myBoard, opponentBoard));
  const opGuards = opponentBoard.filterBy('guard').sortBy('attack', 'desc');
  actions.push(...destroyWards(myBoard, opGuards));
  if (opGuards.length > 0) {
    actions.push(...attackGuards(myBoard, opGuards));
  }
  if (cantKillPlayer(myBoard)) actions.push(...attack(myBoard, opponentBoard));
  actions.push(...fullFace(myBoard));
  return actions;
}

function lethalsAttack(myBoard, opponentBoard) {
  const actions = [];
  const opGuards = opponentBoard.filterBy('guard');
  myBoard.forEach(card => {
    if (card.lethal) {
      const opponent = (opGuards.length ? opGuards : opponentBoard).reduce(
        (chosen, opponent) => (chosen.defense > opponent.defense ? chosen : opponent)
      );
      card.used = true;
      actions.push(Actions.attack(card, opponent));
    }
  });
  return actions;
}

function destroyWards(myBoard, opponentBoard) {
  const actions = [];
  opponentBoard.forEach(opponent => {
    if (opponent.ward) {
      const weakest = myBoard.reduce(
        (weakest, card) => (weakest.attack < card.attack && !weakest.used ? weakest : card)
      );
      weakest.used = true;
      opponent.ward = false;
      actions.push(Actions.attack(weakest, opponent));
    }
  });
  return actions;
}

function attackGuards(myBoard, opponentBoard) {
  ////////////////////////////////////////////////////////////////////////////////////////////////
  const combos = getAllCombos(myBoard, opponentBoard);
  ////////////////////////////////////////////////////////////////////////////////////////////////
  function guardTrades(playableCombos) {
    const killingCombos = playableCombos.filter(combo => combo.efficient <= 0);
    const sortedByLoss = (killingCombos.length === 0 ? playableCombos : killingCombos).sort(
      (prev, next) => prev.loss - next.loss
    );
    const sortedByEfficient = sortedByLoss
      .filter(combo => combo.loss === sortedByLoss[0].loss)
      .sort((prev, next) => next.efficient - prev.efficient);
    log('efficientcombos', sortedByEfficient);
    return sortedByEfficient;
  }
  const actions = chooseBestActions(combos, opponentBoard, guardTrades)
  log('guardCombos', actions);
  return actions;
}

function cantKillPlayer(myBoard) {
  const totalAttack = myBoard.rejectBy('used').sumBy('attack');
  return ennemy.playerHealth > totalAttack;
}

function attack(myBoard, opponentBoard) {
  const myUnusedBoard = myBoard.rejectBy('used');
  const opponents = opponentBoard.rejectBy('guard');
  
  const combos = getAllCombos(myUnusedBoard, opponents);

  function attackTrades(playableCombos) {
    //killing more dangerous cards
    const killingCombos = playableCombos.filter(combo => combo.efficient <= 0).sort((prev, next) => prev.loss - next.loss);
    const efficientsTrades = killingCombos
      .filter(
        combo =>
          combo.loss === killingCombos[0].loss &&
          combo.loss < 2 &&
          combo.opponent.defense - combo.efficient <= combo.opponent.attack
      )
      .sort((prev, next) => next.efficient - prev.efficient);
    log('efficientrades', efficientsTrades);
    return efficientsTrades;
  }
  const actions = chooseBestActions(combos, opponents, attackTrades);
  log('attackCombos', actions);
  return actions;
}

function fullFace(myBoard) {
  return myBoard.map(card => Actions.attack(card, ennemy));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getAllCombos(myBoard, opponentBoard) {
  function dfs(opponent, graph, root, combo, total, combos) {
    const newGraph = graph.filter(card => card.id !== root.id);
    if (newGraph.length === 0) {
      //lorsqu'on atteint le bout du graph
      combos.push(new Combo(opponent, combo));
    }
    for (let i = 0; i < newGraph.length; i++) {
      const child = newGraph[i];
      const comboAttack = total + child.attack;
      if (total < opponent.defense) {
        dfs(opponent, newGraph, child, [...combo, child], comboAttack, combos);
      } else {
        combos.push(new Combo(opponent, combo));
      }
    }
  }
  const combos = [];
  opponentBoard.forEach(opponent => {
    for (let i = 0; i < myBoard.length; i++) {
      const root = myBoard[i];
      dfs(opponent, myBoard, root, [root], root.attack, combos);
    }
  });
  return combos;
}

function chooseBestActions(combos, opponentBoard, moreTradesFn) {
  function chooseBestCombo(combos, opponents) {
    const chosenCombos = [];
    for (let i = 0; i < opponents.length; i++) {
      let playableCombos = combos.filter(combo => combo.isPlayable());
      //freetrades
      let bestCombos,
        sorted = [];
      const freeTrades = playableCombos
        .filter(combo => combo.loss === 0 && combo.efficient <= 0)
        .sort((prev, next) => next.efficient - prev.efficient);
      sorted.push(...freeTrades);
      log('freetrades', freeTrades);

      if(moreTradesFn) {
        sorted.push(...moreTradesFn(playableCombos));
      }

      //between same combos, choose strongest opponent
      bestCombos = sorted
        .filter(combo => combo.loss === sorted[0].loss && combo.efficient === sorted[0].efficient)
        .sort((prev, next) => next.opponent.attack - prev.opponent.attack);

      bestCombos.forEach(combo => {
        if (combo.isPlayable()) {
          //eviter de push 2 fois le même combo
          chosenCombos.push(combo);
          combo.opponent.downed = true;
          combo.combo.forEach(card => {
            card.used = true;
          });
        }
      });
    }
    return chosenCombos;
  }
  return chooseBestCombo(combos, opponentBoard).map(combo => combo.formatActions());
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////// UTILITIES ///////////////////////////////////////////////////////////////////////////////////////////////////
function log(...messages) {
  if (debug) {
    messages.forEach(message => {
      if (typeof message === 'object') {
        message = JSON.stringify(message);
      }
      printErr(message);
    });
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
