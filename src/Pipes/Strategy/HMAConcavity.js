import HMA from '../Indicator/HMA.js'
import DeltaV from '../Signal/DeltaV.js'
import Trend from '../Signal/Trend.js'

export default class HMAConcavity {
  constructor({period}, broker) {
    this.broker = broker
    this.hma = new HMA({period})
    this.trend = new Trend
    this.deltaV = new DeltaV
  }

  fn({data, pipes: [next, rest]}) {
    const hma = this.hma.fn({ data })
    const trend = this.trend.fn({ data: { hma } })
    const deltaV = this.deltaV.fn({ data: { hma } })

    let signal
    if (deltaV.turning === 'DEC') {
        if (trend === 'UP') {
          signal = 'SELL'
        }
        if (trend === 'DOWN') {
          signal = 'BUY'
        }
    }


    let action
    if (this.broker.position === 'LONG') {
      this.entryTick++
      if (signal === 'SELL')
        //1.02
        if (data.lastPrice > this.entry) 
          action = 'SELL'
      //0.94
      //if (hma < this.entryHMA * 0.98)
        //action = 'FSELL'
    }

    if (this.broker.position === 'SHORT') 
      if (signal === 'BUY')
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
        this.entry = data.lastPrice
        this.entryHMA = hma
        this.entryTick = 0
        break
    }

    next.fn({ 
      data: {
      ...(hma && {hma}),
      ...(signal && {signal}),
      ...(action && {action}),
      ...(deltaV && deltaV),
      ...data
      }, 
      pipes: rest})
  }
}