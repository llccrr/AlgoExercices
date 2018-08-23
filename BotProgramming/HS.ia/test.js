console.log(' \n\n\n --- ##### DEBUT ##### --- \n\n\n ');
const a = [
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

const myHand = [
  {
    id: 0,
    defense: -2,
    cost: 0,
    cardDraw: 0,
    cardType: 'red item'
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
const opponentBoard = [
  {
    id: 31,
    attack: 7,
    guard: false,
    lethal: false,
    ward: false,
    defense: 2
  },
  {
    id: 32,
    attack: 9,
    defense: 12,
    guard: false,
    lethal: false,
    ward: false
  }
];

const test = {
  card: 2,
  leTest: this.card
};
const me = {
  playerMana: 10
};
function getDangerosity(crea) {
  // in case of pump spell
  // if (crea.cardType === 'green item'){
  //     const pump = {...crea};
  //     pump.toughness += 1;
  //     pump.type = 0;
  //     pump.abilities.push('C');
  //     return getDangerosity(pump);
  // }
  let danger = 0;
  if (crea.lethal) {
    danger += 8 + crea.attack / 2;
    danger += 4 * crea.defense;
    danger += 5 * crea.ward;
    danger += 3 * crea.guard;
  } else {
    danger += Math.sqrt(crea.attack) * Math.sqrt(crea.defense) / 3;
    danger += 1.5 * crea.attack * (1.5 + crea.ward);
    danger += 1.5 * crea.defense * (1.5 + crea.guard);
  }
  // if (crea.location === 0 && crea.charge){
  //     danger += 2 * (1 + 3 * crea.lethal);
  // }
  console.log({ crea });
  return danger;
}

function getRedValue(removal) {
  if (removal.defense === -99) {
    return 28;
  }
  return 6 * ((removal.cost - removal.defense) / 2 - removal.cardDraw);
}

function playRemovals(myHand, opponentBoard) {
  const chosenActions = [];
  const removals = myHand.filter(card => card.cardType === 'red item' || card.cardType === 'blue item');
  if (removals.length === 0) return [];
  opponentBoard.sort((prev, next) => getDangerosity(next) - getDangerosity(prev)).forEach(opponent => {
    const danger = getDangerosity(opponent);
    const chosen = removals.sort((prev, next) => getRedValue(next) - getRedValue(prev)).find(removal => {
      const redValue = getRedValue(removal);
      console.log('danger:' + danger + 'redValue:' + redValue);
      if (redValue < danger) {
        console.log('target legit', opponent.id);
        if (removal.defense + opponent.defense <= 0 && (!opponent.ward || removal.ward)) {
          console.log('can kill it');
          return true;
        } else {
          console.log('cant kill it');
          console.log(`${opponent.defense} + ${removal.defense} = ${removal.defense + opponent.defense}`);
        }
      }
      return false;
    });
    console.log('toKill (red)', chosen);
    if (chosen && me.playerMana >= chosen.cost) {
      chosenActions.push(`USE ${chosen.id} ${opponent.id}`);
      me.playerMana -= chosen.cost;
      opponent.downed = true;
    }
  });
  return chosenActions;
}

const actions = playRemovals(myHand, opponentBoard);
console.log(JSON.stringify(actions, null, 2));
