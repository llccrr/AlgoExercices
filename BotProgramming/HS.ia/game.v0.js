/* let players = [];
    for (let i = 0; i < 2; i++) {
        const inputs = readline().split(' ');
        const health = parseInt(inputs[0]);
        const mana = parseInt(inputs[1]);
        const deck = parseInt(inputs[2]);
        const rune = parseInt(inputs[3]);
        players[i] = formatPlayer(health, mana, deck, rune);
    }
    const opponentHand = parseInt(readline());
    const cardCount = parseInt(readline());
    for (var i = 0; i < cardCount; i++) {
        var inputs = readline().split(' ');
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
    }*/

function getPlayers() {
  const players = [];

  for (let i = 0; i < 2; i++) {
    const inputs = readline().split(" ");
    const player = {};
    ["health", "mana", "deck" /*, 'rune'*/].forEach((key, index) => {
      player[key] = parseInt(inputs[index]);
    });
    players.push(player);
  }
  return players;
}

function getInfos() {
  const myHand = [];
  const myBoard = [];
  const enemyBoard = [];

  const cardCount = parseInt(readline());
  for (let i = 0; i < cardCount; i++) {
    const card = {};
    card.inputs = readline().split(" ");
    card.cardNumber = parseInt(inputs[0]);
    card.instanceId = parseInt(inputs[1]);
    card.location = parseInt(inputs[2]);
    card.cardType = parseInt(inputs[3]);
    card.cost = parseInt(inputs[4]);
    card.attack = parseInt(inputs[5]);
    card.defense = parseInt(inputs[6]);
    card.abilities = inputs[7];
    //card.myHealthChange = parseInt(inputs[8]);
    //card.opponentHealthChange = parseInt(inputs[9]);
    //card.cardDraw = parseInt(inputs[10]);

    if (location === 0) myHand.push(card);
    else if (location === 1) myBoard.push(card);
    else if (location === -1) enemyBoard.push(card);
    return [myHand, myBoard, enemyBoard];
  }
}
const draftCurve = {
  "O-3": 5,
  "4-6": 7,
  "7-8": 7,
  "9-10": 6,
  "11-12": 5
};

//utiliser après le 14 ieme tour
const calculGap = myDraft => {
  Object.keys(draftCurve).map(key => {
    return draftCurve[key] - myDraft[key];
  });
};

const mostValuableCard = cards =>
  cards.reduce((acc, card, index) => (card.value > acc ? card.value : acc), 0);

function draft(myDraft) {
  // if myDraft.count < 14 -> Pick de la quali
  // map over best quali
  // print + break;
  // updateMyDraft
  // else -> pick de la curve
  //calcul du gap pour chaque catégorie + sort le gap
  // pick en priorité si carte === gap
  // mise à jour de myDraft
  const theoreticalGap = calculGap(myDraft);
  myHand.reduce((acc, card, index) => {}, 0);
  for (let i = 0; i < myHand.length; i++) {
    const card = myHand[i];
    printErr("----carte----", i);
    printErr(card.cost);
    printErr(card.attack);
    printErr(card.defense);
    printErr("----------");

    if (
      card.cost === 5 ||
      card.cost === 6 ||
      card.cost === 7 ||
      card.cost === 8
    ) {
      print(`PICK ${i}`);
      printErr("ici");
      myDraft[card.cost] = -~myDraft[card.cost];
      break;
    }
    printErr("là");
    if (i === 2) {
      print("PICK 0");
      myDraft[card.cost] = -~myDraft[card.cost];
      break;
    }
  }
}
// game loop
while (true) {
  /* let players = [];
    for (let i = 0; i < 2; i++) {
        const inputs = readline().split(' ');
        const health = parseInt(inputs[0]);
        const mana = parseInt(inputs[1]);
        const deck = parseInt(inputs[2]);
        const rune = parseInt(inputs[3]);
        players[i] = formatPlayer(health, mana, deck, rune);
    }
    const opponentHand = parseInt(readline());
    const cardCount = parseInt(readline());
    for (var i = 0; i < cardCount; i++) {
        var inputs = readline().split(' ');
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
    }*/
  const [player, opponent] = getPlayers();
  const opponentHand = parseInt(readline());
  const [myHand, myBoard, enemyBoard] = getInfos();
  const phase = player.mana ? "game" : "draft";
  myHand.forEach(card => {
    printErr("----carte----");
    printErr(card.cardNumber);
    printErr(card.cost);
    printErr(card.attack);
    printErr(card.defense);
    printErr("----------");
  });
  // Write an action using print()
  // To debug: printErr('Debug messages...');

  print("PASS");
}
