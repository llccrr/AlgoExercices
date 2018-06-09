const formatUFO = (inputs, lastMove = '') => ({
    x: parseInt(inputs[0]),
    y: parseInt(inputs[1]),
    vx: parseInt(inputs[2]),
    vy: parseInt(inputs[3]),
    hasFlag: parseInt(inputs[4]),
    lastMove
})

const formatFlag = (inputs) => ({
    x: parseInt(inputs[0]),
    y: parseInt(inputs[1])
})

const buildUFO = (alastMoves) => {
    const ufos = [];
    for (let i = 0; i < 2; i++) {
        inputs = readline().split(' ');
        ufos.push(formatUFO(inputs, alastMoves[i]));
    }
    return ufos;
}

const goTo = (x,y, speed) => `${x} ${y} ${speed}`;

const bump = (enemyToBump, speed) => goTo(enemyToBump.x + enemyToBump.vx +, enemyToBump.vy + enemyToBump.vy, speed)

const distance = (a, b) => {
	const xs = a.x - b.x;
	const ys = a.y - b.y;

	return Math.sqrt(xs**2 + ys**2);
}

const closestToFlag = (ufo1, ufo2, flag) => {
    if(distance(ufo1,flag)<distance(ufo2,flag)){
        return ufo1;
    }
    else{
        return ufo2;
    }
}

const indexUFOWithFlag = (UFOs) =>
    UFOs.map(it => it.hasFlag).indexOf(1)

const goBack = (f, x) => {
    return goTo(x, f.y, 'BOOST')
}

const betweenFlagAndUfo = (ufo,flag,dist) => {
    let x = (ufo.x-flag.x)*(dist/distance(ufo,flag))+flag.x;
    let y = (ufo.y-flag.y)*(dist/distance(ufo,flag))+flag.y
    return { x:x , y:y};
}

let i = 0;
var lastMoves = ['rien', 'rien']
var prevMoves = [{x: 0, y:0}, {x: 0, y:0}]
while (true) {
    i++
    // Read flag 1 property
    let inputs = readline().split(' ');
    const myFlag = formatFlag(inputs)
    // Read flag 2 property
    inputs = readline().split(' ');
    const enemyFlag = formatFlag(inputs)
    const myUFOs = buildUFO([...lastMoves]);
    const enemyUFOs = buildUFO(['rien', 'rien']);
    
    // Set base pos once per game
    if (i === 1) {
        myBase = myFlag.x;
        enemyBase = enemyFlag.x;
    }
    // Set FlagPos at Each round
    const indexEnemyWithFlag = indexUFOWithFlag(enemyUFOs)
    if(!~indexEnemyWithFlag) initMyFlagPos = { ...myFlag };
    if(!~indexUFOWithFlag(myUFOs)) initEnemyFlagPos = { ...enemyFlag };

    const closestToMyFlag = closestToFlag(...enemyUFOs, myFlag);
    // Defense
    if (~indexEnemyWithFlag) {
        // Il a le flag
        myUFOs[0].nextMove = bump(enemyUFOs[indexEnemyWithFlag], 'BOOST')

    } else {
        // Il a pas le flag
        // Si le dist(toi, leclosest) < 850 -> bump sans 400
        // Si dist(toi, between) < 900 -> choke
        // Sinon GoTo me, between
        const between = betweenFlagAndUfo(closestToMyFlag, myFlag, 600);
        const distMeClosest = distance(myUFOs[0], closestToMyFlag);
        const distMeBetween = distance(myUFOs[0], between);
        const baseSpeed = distMeBetween > 1000 ? '100' : ~~(distMeBetween/10).toString()
        myUFOs[0].nextMove = goTo(~~between.x, ~~between.y, baseSpeed)
        if (distMeBetween < 400) {
            myUFOs[0].nextMove = goTo(prevMoves[0].x, prevMoves[0].y, '98')
        }
        if (distMeClosest < 850) {
            myUFOs[0].nextMove = goTo(closestToMyFlag.x, closestToMyFlag.y, '100')
        }
        /*const distMyUFOtoMyFlag = distance(myUFOs[0], myFlag)
        const power = distMyUFOtoMyFlag > 1000 ? '100' :  ~~(distMyUFOtoMyFlag/10).toString()
        myUFOs[0].nextMove = goTo(myFlag.x, myFlag.y, power)

        if (distMyUFOtoMyFlag <  600) {
            myUFOs[0].nextMove = goTo(prevMoves[0].x, prevMoves[0].y, 98)
        }*/

        /*const closest = closestToFlag(enemyUFOs[0], enemyUFOs[1], myFlag)
        if(distance(myUFOs[0], closest) < 950) {
            bump(closest, '100');
        }*/

    }

    //Attack
    if (~indexUFOWithFlag(myUFOs)) {
        //GoBack
        //const closestOfAttack = closest(enemyUFOs, myUFOs[1]);
        //if(closestOfAttack.y >  myUFOs[1].y) {

        if(myUFOs[1].x - enemyBase < 1000){
            myUFOs[1].nextMove = goTo(myBase,  myUFOs[1].y + myUFOs[1].vy, 'BOOST')
        } else {
            myUFOs[1].nextMove = goTo(myBase,  myUFOs[1].y, 'BOOST')

        }
        myUFOs[1].nextMove = goTo(myBase, initEnemyFlagPos.y, 'BOOST')
    } else {
        const distanceAttToFlag = distance(myUFOs[1], enemyFlag);
        const attSpeed = distanceAttToFlag < 3500 ? 'BOOST' : '100'

        myUFOs[1].nextMove = goTo(enemyFlag.x, enemyFlag.y, attSpeed)
    }

    // final print
    for (let i = 0; i < 2; i++) {
        lastMoves[i] = myUFOs[i].nextMove;
        prevMoves[i] = {
            x: myUFOs[i].x,
            y: myUFOs[i].y
        }
        print(myUFOs[i].nextMove);
    }
}
