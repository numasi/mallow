import HMA from '../Indicator/HMA.js'

export default class Crossover {
  constructor({shortPeriod, longPeriod}, broker) {
    this.broker = broker
    this.shortHMA = new HMA({period: shortPeriod})
    this.longHMA = new HMA({period: longPeriod})
    this.last
  }

  fn({data, pipes: [next, rest]}) {
    const shortHMA = this.shortHMA.fn({ data })
    const longHMA = this.longHMA.fn({ data })
    
    let action

    if (this.last) {
      if (this.last.shortHMA < this.last.longHMA && shortHMA > longHMA)
        action = 'BUY'
      if (this.last.shortHMA > this.last.longHMA && shortHMA < longHMA)
        action = 'SELL'
    }

    switch (action) {
      case 'SELL': 
        this.broker.sell(data.timestamp, data.close)
        break
      case 'BUY': 
        this.broker.buy(data.timestamp, data.close)
        break
    }

    this.last = { shortHMA, longHMA }

    next.fn({ 
      data: {
      ...(shortHMA && {shortHMA}),
      ...(longHMA && {longHMA}),
      ...(action && {action}),
      ...data
      }, 
      pipes: rest})
  }
}