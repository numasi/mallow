export class Concavity {
  constructor({of, period} = {}) {
    this.of = of ?? 'hma'
    this.period = period ?? 3
    this.loopback = new Window(this.period)
    this.lastProjection = null
    this.lastConcavity = null

  }

  static calcConcavity(projection, reality) {
    if (reality > projection)
      return 1
    if (reality < projection)
      return -1
    return 0
  }

  fn({data, pipes: [next, rest]}) {
    const value = data[this.of]
    this.loopback.push(value)
    let concavity, turning, signal
    if (this.loopback.isFull()) {
      if (this.lastProjection) {
        concavity = Concavity.calcConcavity(this.lastProjection, value)
        if (this.lastConcavity) {
          if (concavity != this.lastConcavity) {
            turning = concavity === 1 ? 'ACC' : 'DEC'
          if (turning === 'DEC')
            if (this.loopback[0] > this.loopback[1])
              //UPTREND
              signal = 'SELL'
            else 
              //DOWNTREND
              signal = 'BUY'
          }
        }
        this.lastConcavity = concavity
      }
      const delta = this.loopback[0] - this.loopback[this.period - 1]
      const deltaPerRate = delta / this.period
      this.lastProjection = this.loopback[0] + deltaPerRate
    }

    next.fn({ 
      data: {
      ...(concavity && { concavity }),
      ...(signal && { signal }),
      ...(turning && { turning }),
       ...data
      }, 
      pipes: rest })
  }
}
