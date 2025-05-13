import HMA from '../Indicator/HMA.js'

export default class Crossover {
  constructor({shortPeriod, longPeriod}, next) {
    this.next = next
    this.shortHMA = new HMA({period: shortPeriod})
    this.longHMA = new HMA({period: longPeriod})
    this.last
  }

  fn(data) {
    const shortHMA = this.shortHMA.fn(data)
    const longHMA = this.longHMA.fn(data)
    
    let signal

    if (this.last) {
      if (this.last.shortHMA < this.last.longHMA && shortHMA > longHMA)
        signal = 'SELL'
      if (this.last.shortHMA > this.last.longHMA && shortHMA < longHMA)
        signal = 'BUY'
    }

    this.last = { shortHMA, longHMA }
    console.log(this.last)

    this.next.fn({ 
      ...(shortHMA && {shortHMA}),
      ...(longHMA && {longHMA}),
      ...(signal && {signal}),
      ...data
      }) 
  }
}