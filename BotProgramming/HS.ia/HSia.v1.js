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
  9: 1,
  10: 1,
  11: 1,
  12: 1,
  creature: 30,
  value: (card, turn) => {
    const attack = 3;
    const defense = 2;
    const abilities = {
      breakthrough: 3,
      charge: 1,
      drain: 1,
      guard: 4,
      lethal: 12,
      ward: 3
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
  sortBy(carac, asc) {
    return this.sort((prev, next) => (asc ? prev[carac] - next[carac] : next[carac] - prev[carac]));
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
 * dans les combos d'attaque, prevoir le cas ou y a un conflit entre combo et le meileur supprime tout autre combo sur le 2nd guard
 *
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
    const actions = [...summonCreatures(myHand, myBoard), ...attackOpponent(myBoard, opponentBoard)];
    print(actions.length ? actions.join(";") : "PASS");
  }
}

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

function summonCreatures(myHand, myBoard) {
  function dfs(graph, root, cards, totalMana, paths) {
    const newGraph = graph.filter(card => card.id !== root.id);
    if (newGraph.length === 0) {
      paths.push(cards);
    }
    for (let i = 0; i < newGraph.length; i++) {
      const child = newGraph[i];
      const newCost = totalMana + child.cost;
      if (newCost <= me.playerMana && myBoard.length + cards.length <= 5) {
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
  result.forEach(card => {
    if (card.charge) {
      card.location = 1;
      myBoard.push(card);
    }
  });
  return result.map(card => `SUMMON ${card.id}`);
}

function attackOpponent(myBoard, opponentBoard) {
  if (myBoard.length === 0) return [];
  let actions = [];
  opponentBoard.length && actions.push(...lethalsAttack(myBoard, opponentBoard));
  const opGuards = opponentBoard.filter(card => card.guard).sortBy("attack");
  log("opGuards", opGuards);
  actions.push(...destroyWards(myBoard, opGuards));
  if (opGuards.length > 0) {
    actions.push(...attackGuards(myBoard, opGuards));
  }
  actions.push(...attack(myBoard, opponentBoard));
  return actions;
}

function attackGuards(myBoard, opGuards) {
  function dfs(opGuard, graph, root, combo, totalAttack, combos) {
    const newGraph = graph.filter(card => card.id !== root.id);
    if (newGraph.length === 0) {
      //lorsqu'on atteint le bout du graph
      combos.push({
        opGuard,
        combo,
        loss: combo.reduce((total, card) => total + (card.defense - opGuard.attack <= 0 ? 1 : 0), 0),
        efficient: combo.reduce((total, card) => total - card.attack, opGuard.defense)
      });
    }
    for (let i = 0; i < newGraph.length; i++) {
      const child = newGraph[i];
      const comboAttack = totalAttack + child.attack;
      if (totalAttack < opGuard.defense) {
        dfs(opGuard, newGraph, child, [...combo, child], comboAttack, combos);
      } else {
        combos.push({
          opGuard,
          combo,
          loss: combo.reduce((total, card) => total + (card.defense - opGuard.attack <= 0 ? 1 : 0), 0),
          efficient: combo.reduce((total, card) => total - card.attack, opGuard.defense)
        });
      }
    }
  }

  function chooseBestCombo(myBoard, opGuards) {
    const chosenCombos = [];
    for (let i = 0; i < opGuards.length; i++) {
      let opGuardCombos = combos.filter(combo => !combo.opGuard.downed && !combo.combo.some(card => card.used));

      let bestCombos, sorted;
      const freeTrades = opGuardCombos
        .filter(combo => combo.loss === 0 && combo.efficient <= 0)
        .sort((prev, next) => next.efficient - prev.efficient);
      sorted = freeTrades;

      if (freeTrades.length === 0) {
        const killingCombos = opGuardCombos.filter(combo => combo.efficient <= 0);
        const sortedByLoss = (killingCombos.length === 0 ? opGuardCombos : killingCombos).sort(
          (prev, next) => prev.loss - next.loss
        );
        const sortedByEfficient = sortedByLoss
          .filter(combo => combo.loss === sortedByLoss[0].loss)
          .sort((prev, next) => next.efficient - prev.efficient);
        sorted = sortedByEfficient;
      }

      bestCombos = sorted
        .filter(combo => combo.efficient === sorted[0].efficient)
        .sort((prev, next) => next.opGuard.attack - prev.opGuard.attack);

      bestCombos.forEach(combo => {
        if (!combo.combo.some(card => card.used)) {
          //eviter de push 2 fois le même combo
          chosenCombos.push(combo);
          combo.opGuard.downed = true;
          combo.combo.forEach(card => {
            card.used = true;
          });
        }
      });
    }
    return chosenCombos;
  }

  const actions = [],
    combos = [];
  opGuards.forEach(opGuard => {
    for (let i = 0; i < myBoard.length; i++) {
      const root = myBoard[i];
      dfs(opGuard, myBoard, root, [root], root.attack, combos);
    }
  });

  const chosenCombos = chooseBestCombo(myBoard, opGuards);
  actions.push(
    ...chosenCombos.map(combo => combo.combo.map(card => `ATTACK ${card.id} ${combo.opGuard.id}`).join(";"))
  );
  log("guardCombos", actions);

  return actions;
}

function attack(myBoard, opponentBoard) {
  return fullFace(myBoard);
  /*  function dfs(opGuard, graph, root, combo, totalAttack, combos) {
    const newGraph = graph.filter(card => card.id !== root.id);
    if (newGraph.length === 0) {
      //lorsqu'on atteint le bout du graph
      combos.push({
        opGuard,
        combo,
        loss: combo.reduce((total, card) => total + (card.defense - opGuard.attack <= 0 ? 1 : 0), 0),
        efficient: combo.reduce((total, card) => total - card.attack, opGuard.defense)
      });
    }
    for (let i = 0; i < newGraph.length; i++) {
      const child = newGraph[i];
      const comboAttack = totalAttack + child.attack;
      if (totalAttack < opGuard.defense) {
        dfs(opGuard, newGraph, child, [...combo, child], comboAttack, combos);
      } else {
        combos.push({
          opGuard,
          combo,
          loss: combo.reduce((total, card) => total + (card.defense - opGuard.attack <= 0 ? 1 : 0), 0),
          efficient: combo.reduce((total, card) => total - card.attack, opGuard.defense)
        });
      }
    }
  }

  function chooseBestCombo(myBoard, opGuards) {
    const chosenCombos = [];
    for (let i = 0; i < opGuards.length; i++) {
      let opGuardCombos = combos.filter(combo => !combo.opGuard.downed && !combo.combo.some(card => card.used));

      let bestCombos, sorted;
      const freeTrades = opGuardCombos
        .filter(combo => combo.loss === 0 && combo.efficient <= 0)
        .sort((prev, next) => next.efficient - prev.efficient);
      sorted = freeTrades;

      if (freeTrades.length === 0) {
        const killingCombos = opGuardCombos.filter(combo => combo.efficient <= 0);
        const sortedByLoss = (killingCombos.length === 0 ? opGuardCombos : killingCombos).sort(
          (prev, next) => prev.loss - next.loss
        );
        const sortedByEfficient = sortedByLoss
          .filter(combo => combo.loss === sortedByLoss[0].loss)
          .sort((prev, next) => next.efficient - prev.efficient);
        sorted = sortedByEfficient;
      }

      bestCombos = sorted
        .filter(combo => combo.efficient === sorted[0].efficient)
        .sort((prev, next) => next.opGuard.attack - prev.opGuard.attack);

      bestCombos.forEach(combo => {
        if (!combo.combo.some(card => card.used)) {
          //eviter de push 2 fois le même combo
          chosenCombos.push(combo);
          combo.opGuard.downed = true;
          combo.combo.forEach(card => {
            card.used = true;
          });
        }
      });
    }
    return chosenCombos;
  }

  const actions = [],
    combos = [];
  opGuards.forEach(opGuard => {
    for (let i = 0; i < myBoard.length; i++) {
      const root = myBoard[i];
      dfs(opGuard, myBoard, root, [root], root.attack, combos);
    }
  });

  const chosenCombos = chooseBestCombo(myBoard, opGuards);
  actions.push(
    ...chosenCombos.map(combo => combo.combo.map(card => `ATTACK ${card.id} ${combo.opGuard.id}`).join(";"))
  );
  log("attackCombos", actions);

  return actions;*/
}

function lethalsAttack(myBoard, opponentBoard) {
  const actions = [];
  const opGuards = opponentBoard.filter(card => card.guard);
  myBoard.forEach(card => {
    if (card.lethal) {
      const opponent = (opGuards.length ? opGuards : opponentBoard).reduce(
        (chosen, opponent) => (chosen.defense > opponent.defense ? chosen : opponent)
      );
      card.used = true;
      actions.push(`ATTACK ${card.id} ${opponent.id}`);
    }
  });
  return actions;
}

function destroyWards(myBoard, opponents) {
  const actions = [];
  opponents.forEach(opponent => {
    if (opponent.ward) {
      const weakest = myBoard.reduce(
        (weakest, card) => (weakest.attack < card.attack && !weakest.used ? weakest : card)
      );
      weakest.used = true;
      opponent.ward = false;
      actions.push(`ATTACK ${weakest.id} ${opponent.id}`);
    }
  });
  return actions;
}

function fullFace(myBoard) {
  return myBoard.map(card => `ATTACK ${card.id} -1`);
}
//.map(card => `ATTACK ${card.id} ${opponent.id} ${message}`)
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
