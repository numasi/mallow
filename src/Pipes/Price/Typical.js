const delimiters = {
  hourly: [0, 13],
  daily: [0, 10],
  twentymin: [0,16],
}

export default class Typical { 
    constructor({interval}) {
        this.interval = interval
        this.low = Infinity
        this.high = 0
        this.lastPrice = null
        this.lastPeriod = null
    }
    
    async fn({data, pipes: [next, rest]}) {
      let {timestamp, price } = data
      price = parseFloat(price)
      let newPeriod = false
      let period = timestamp.substring(...delimiters[this.interval])
      if (this.interval === 'twentymin') {
        let min = period.substring(period.length - 2, period.length - 1)
        period = `${period.slice(0,-2)}${min}0`
        if (parseInt(min) % 2 === 0 && period != this.lastPeriod)
          newPeriod = true
      } else 
      if (period != this.lastPeriod)
        newPeriod = true

      if (this.lastPeriod && newPeriod) {
          const typical = (this.high + this.low + this.lastPrice) / 3
          next.fn({
              data: {
                typical, 
                lastPrice: this.lastPrice,
                period,
                ...data
              },
              pipes: rest
          })
          this.low = Infinity
          this.high = 0
          this.newPeriod = false
      }

      if (price > this.high) this.high = price
      if (price < this.low) this.low = price
      this.lastPrice = price
      this.lastPeriod = period
  }

}

