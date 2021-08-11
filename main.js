const Table = require('cli-table');
const chalk = require('chalk');

class Azee {
  size;
  board;
  queue = [];
  score = 0;
  moves = [];
  isFinished = false;
  isSealed = false;

  constructor(size = 5) {
    this.size = size
    this.board = Array(size).fill(
      Array(size).fill(' ')
    )
    this.resetBoard()
    for (let y = 0; y < this.size; y++) {
      this.queue[y] = Array(y+1).fill(' ')
    }
  }

  charToColor(char) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
    const background = colors[letters.indexOf(char)] ?? 'black'
    return chalk.bgKeyword(background)('  ') 
  }

  resetBoard() {
    for (let y = 0; y < this.size; y++) {
      this.board[y] = Array(this.size).fill(0).map((_,index) => (
        String.fromCharCode(65 + (((index - y) + (this.size - 1)) % this.size)).toLowerCase()
      ))
    }
  }

  toString() {
    const table = new Table({ colWidths: Array(this.size).fill(4) });
    const board = this.board.map(row => row.map(this.charToColor))
    table.push(...board);
    return table.toString()
  }

  print() {
    console.log(this.toString())
  }

  move(y, char) {
    this.moves.push([y, char])
    if (this.queue[y][0] !== ' ' && this.queue[y][0] !== char) return false
    let index = 0
    for (; this.queue[y][index] !== ' ' && index < y; index++) {}
    if (this.queue[y][index] === ' ') {
      this.queue[y][index] = char 
      return true
    }
    return false
  }

  completeTile(x, y) {
    this.board[y][x] = this.board[y][x].toUpperCase()
    this.countPointsForTile(x, y)
  }

  countPointsForTile(x, y) {
    const char = this.board[y][x]
    const matcher = new RegExp(`[A-Z]*${char}[A-Z]*`)
    const row = this.board[y].join('').match(matcher)?.[0] ?? ''
    const col = this.board.map(arr => arr[x]).join('').match(matcher)?.[0] ?? ''
    this.score += Math.max((row.length > 1 ? row.length : 0) + (col.length > 1 ? col.length : 0), 1)
  }

  endRound() {
    this.moves.push('endRound')
    for (let y = 0; y < this.size; y++) {
      const row = this.queue[y]
      const char = row[0]
      if (char !== ' ' && char === row.slice(-1)[0]) {
        const x = this.board[y].indexOf(char)
        this.completeTile(x, y)
        // clear row in queue
        this.queue[y] = Array(y+1).fill(' ') 
      }
    }
    this.isFinished = this.completedHorizontal()
  }

  canQueueRow(y, char) {
    const rowIsFull = this.queue[y].slice(-1)[0] !== ' '
    return !rowIsFull && (this.queue[y][0] === char || this.queue[y][0] === ' ')
  }

  completedHorizontal() {
    const rows = this.board.map(cols => cols.join(''))
    for (const row of rows) {
      if (!/[a-z]/.test(row)) {
        return true
      }
    }
    return false
  }

  availableMoves() {
    const moves = []
    if (!this.isFinished) {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          const char = this.board[y][x]
          if (/[a-z]/.test(char) && this.canQueueRow(y, char)) {
            moves.push([y, this.board[y][x]])
          }
        }
      }
    }
    return moves
  }

  replay(level = 1) {
    const azee = new Azee()
    for (const move of this.moves) {
      if (typeof move === 'string') {
        azee[move]()
      } else {
        azee.move(...move)
      }
      if (level === 1 && typeof move === 'string') {
        azee.print()
      } else if(level === 0) {
        azee.print()
      }
    }
  }

  finalTally() {
    const filter = (str) => !/[a-z]/.test(str)

    if (this.isFinished && !this.isSealed) {
      this.moves.push('finalTally')
      const rows = this.board.map(row => row.join('')).filter(filter)
      const cols = Array(this.size).fill(0).map((_,y) => (
        Array(this.size).fill(0).map((_,x) => (
          this.board[x][y]
        )).join('')
      )).filter(filter)
      this.score += (rows.length * 2) + (cols.length * 7)
    }
    this.isSealed = true
  }
}

function getRandomInt(min, max) {
  return Math.round(Math.random() * max) + min;
}

let bestGame = null
let worseGame = null

function simulateGame() {
  const azee = new Azee()

  while (azee.availableMoves().length > 0) {
    let moves = azee.availableMoves()
    while (moves.length > 0) {
      const randomMove = moves[getRandomInt(0, moves.length - 1)]
      azee.move(...randomMove)
      moves = azee.availableMoves()
    }
    azee.endRound()
  }

  azee.finalTally()

  if (bestGame === null || bestGame.score < azee.score) {
    bestGame = azee
  }
  if (worseGame === null || worstGame.score > worstGame.score) {
    worstGame = azee
  }
}

i = 0
while (i < 10000) {
  simulateGame()
  i++
}

bestGame.replay(1)
console.log(bestGame.score)
console.log('=====================')
worstGame.replay(1)
console.log(worstGame.score)

