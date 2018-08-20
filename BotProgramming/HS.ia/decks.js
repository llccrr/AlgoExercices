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