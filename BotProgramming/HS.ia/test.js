console.log(" \n\n\n --- ##### DEBUT ##### --- \n\n\n ");
const myHand = [
  {
    cost: 2,
    id: 0
  },
  {
    cost: 3,
    id: 1
  },
  {
    cost: 2,
    id: 2
  },
  {
    cost: 2,
    id: 3
  },
  {
    cost: 4,
    id: 4
  },
  {
    cost: 4,
    id: 5
  },
  {
    cost: 4,
    id: 6
  }
];

const myBoard = [
  {
    id: 0,
    attack: 3,
    defense: 2
  },
  {
    id: 1,
    attack: 3,
    defense: 2
  },
  {
    id: 2,
    attack: 6,
    defense: 2
  },
  {
    id: 3,
    attack: 7,
    defense: 8
  }
];
const opGuards = [
  {
    id: 31,
    attack: 12,
    defense: 12
  },
  {
    id: 32,
    attack: 9,
    defense: 12
  }
];

const test = {
  card: 2,
  leTest: this.card
};

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
  const combos = [];
  opGuards.forEach(opGuard => {
    for (let i = 0; i < myBoard.length; i++) {
      const root = myBoard[i];
      dfs(opGuard, myBoard, root, [root], root.attack, combos);
    }
  });

  const chosenCombos = [];
  for (let i = 0; i < opGuards.length; i++) {
    let opGuardCombos = combos.filter(combo => !combo.opGuard.downed && !combo.combo.some(card => card.used));

    let bestCombos, sorted;
    const freeTrades = opGuardCombos
      .filter(combo => combo.loss === 0 && combo.efficient <= 0)
      .sort((prev, next) => next.efficient - prev.efficient);
    sorted = freeTrades;

    if (freeTrades.length === 0) {
      const sortedByLoss = opGuardCombos
        .filter(combo => combo.efficient <= 0)
        .sort((prev, next) => prev.loss - next.loss);
      const sortedByEfficient = sortedByLoss
        .filter(combo => combo.loss === sortedByLoss[0].loss)
        .sort((prev, next) => next.efficient - prev.efficient);
      sorted = sortedByEfficient;
    }

    bestCombos = sorted
      .filter(combo => combo.efficient === sorted[0].efficient)
      .sort((prev, next) => next.opGuard.attack - prev.opGuard.attack);
    console.log(JSON.stringify(bestCombos, null, 2));

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
  return chosenCombos
    .map(combo => combo.combo.map(card => `ATTACK ${card.id} ${combo.opGuard.id}`).join(";"))
    .join(";");
}

const actions = attackGuards(myBoard, opGuards);
console.log(actions);
