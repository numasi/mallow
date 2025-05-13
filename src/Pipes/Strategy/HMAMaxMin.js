import HMA from '../Indicator/HMA.js'
import MaxMin from '../Signal/MaxMin.js'

export default class HMAMaxMin {
  constructor({period}, broker) {
    this.broker = broker
    this.hma = new HMA({period})
    this.maxmin = new MaxMin()
  }

  fn({data, pipes: [next, rest]}) {
    const hma = this.hma.fn({ data })
    const maxmin = this.maxmin.fn({ data: { hma } }) 

    let action
    if (this.broker.position === 'LONG') {
    
      if (maxmin === 'MAX')
        if (data.typical > this.entry) 
          action = 'SELL'

      if (hma < this.entryHMA * 0.7)
        action = 'FSELL'
    }

    if (this.broker.position === 'SHORT')
      if (maxmin === 'MIN')
        action = 'BUY'

    switch (action) {
      case 'SELL': 
        this.broker.sell(data.period, data.lastPrice)
        break
      case 'FSELL': 
        this.broker.sell(data.period, data.lastPrice, true)
        break
      case 'BUY': 
        this.broker.buy(data.period, data.lastPrice)
        this.entry = data.typical
        this.entryHMA = hma
        break
    }

    next.fn({ 
      data: {
      ...(hma && {hma}),
      ...(maxmin && { signal: maxmin}),
      ...(action && {action}),
      ...data
      }, 
      pipes: rest})
  }
}