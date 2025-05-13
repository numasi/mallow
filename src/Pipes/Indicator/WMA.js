import { Window } from '../utils.js'

export default class WMA {
    constructor({period, of, name}, next) {
        this.next = next
        this.prices = new Window(period)
        this.of = of ?? 'typical'
        this.name = name ?? 'wma'
    }

    fn(data) {
      const price = data[this.of]
      this.prices.push(price)
      const wma = calcWMA(this.prices)
      if (this.next)
        this.next.fn({ [this.name]: wma, ...data })
      return wma
    }
}

function calcWMA(prices) {
    const period = prices.length
    const sum = prices.reduce((acc, p, i) => acc + p * (period - i), 0)
    const divider = ((period + 1) * period) / 2
    return sum / divider
}
