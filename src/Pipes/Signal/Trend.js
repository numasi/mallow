import { Window } from '../utils.js'

export default class Trend {
  constructor({period, of} = {}) {
    this.of = of ?? 'hma'
    this.period = period ?? 2
    this.values = new Window(this.period)
  }

  fn({data, pipes: [next, rest] = []}) {
    this.values.push(data[this.of])
    
    let trend
    if (this.values.isFull()) {
    trend = 'STALE'
    if (this.values[0] > this.values[1])
      trend = 'UP'
    if (this.values[0] < this.values[1])
      trend = 'DOWN'
    }

    if (next)
      next.fn({ 
        data: {
          ...(trend && { trend } ),
        ...data
        }, 
        pipes: rest
      })
    return trend
  }
}
