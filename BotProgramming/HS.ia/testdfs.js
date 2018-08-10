function dfs(graph, root, cards, totalMana, paths) {
    const newGraph = graph.filter(card => card.id !== root.id);
    for(let i = 0; i < newGraph.length; i++) {
        const child = newGraph[i];
        const newCost = totalMana + child.cost;
        if(newCost <= playerMana) {
            dfs(newGraph, child, [...cards, child], newCost, paths)
        } else {
            paths.push(cards);
        }
    }
}

const playerMana = 4;
const myHand = [{id: 2, cost: 2}, {id: 3, cost: 3}, {id: 1, cost: 1}, {id: 4, cost: 4}];
const sortedByCost = myHand
    .sort((prev, next) => prev.cost - next.cost)
    .filter(card => card.cost <= playerMana)

const paths = [];
for(let i = 0; i < sortedByCost.length; i++) {
    const root = sortedByCost[i];
    dfs(sortedByCost, root, [root], root.cost, paths);
}
console.log(paths)
const result = paths.reduce((bestCombo, currentCombo) => {
	   const bestCost = bestCombo.reduce((total, card) => total + card.cost, 0);
	   const currentCost = currentCombo.reduce((total, card) => total + card.cost, 0);
	   return bestCombo.length + bestCost < currentCombo.length + currentCost ? currentCombo : bestCombo;
});
console.log('result', result);
