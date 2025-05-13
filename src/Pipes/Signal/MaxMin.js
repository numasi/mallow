import { Window } from '../utils.js'

export default class MaxMin {
  constructor() {
    this.values = new Window(3)
  }

  fn({data, pipes: [next, rest] = []}) {
    this.values.push(data['hma'])
    let maxmin
    if (this.values.isFull()) {
      if (this.values[0] > this.values[1] && this.values[2] > this.values[1])
        maxmin = 'MIN'
      if (this.values[0] < this.values[1] && this.values[2] < this.values[1])
        maxmin = 'MAX'
    }

    const signal = maxmin === 'MIN' ? 'BUY' : maxmin === 'MAX' ? 'SELL' : undefined
    if (next)
      next.fn({ 
        data: {
        ...(maxmin && {maxmin}),
        ...(signal && {signal}),
        ...data
        }, 
        pipes: rest})
    return maxmin
  }
}