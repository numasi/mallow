import { Window } from '../utils.js'

export default class DeltaV {
  constructor() {
    this.values = new Window(3)
    this.lastVal = null
    this.lastSpeed = null
    this.lastAcc = null
  }

  fn({data, pipes: [next, rest] = []}) {
    let speed, relSpeed, acc, concavity, turning
    this.values.push(data.hma)
    if (this.values.isFull()) {
      speed = Math.abs(this.values[0] - this.values[this.values.length - 1])
      relSpeed = 100 - (this.values[0] / this.values[this.values.length - 1] * 100)
      if (this.lastSpeed) {
        acc = speed - this.lastSpeed
        concavity = Math.sign(acc)
        if (this.lastAcc) {
          const lastConcavity = Math.sign(this.lastAcc)
          if (concavity !== lastConcavity) {
            turning = concavity === 1 ? 'ACC' : 'DEC'
          }
        }
        this.lastAcc = acc
      }
      this.lastSpeed = speed
    }

    if (next)
      next.fn({ 
        data: {
        ...(turning && { turning }),
        ...(speed && {speed}),
        ...(relSpeed && {relSpeed}),
        ...(acc && {acc}),
        ...data
        }, 
        pipes: rest})

    return { turning, speed, acc, relSpeed }
  }
}
