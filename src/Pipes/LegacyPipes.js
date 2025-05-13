
export class Signal {
  constructor() {
  }

  fn({data, pipes: [next, rest]}) {
    let signal

    if (data.turning === 'DEC') {
        if (data.trend === 'UP') {
          signal = 'SELL'
        }
        if (data.trend === 'DOWN') {
          signal = 'BUY'
        }
    }

    next.fn({ 
      data: {
      ...(signal && {signal}),
        ...data
      }, 
      pipes: rest})
  }
}


export class Watchout {
  constructor() {
    this.count = 0
    this.watch = false
  }

  fn({data, pipes: [next, rest]}) {
    let watchout

    if (this.watch) {
      console.log(data['acc'])
      if (Math.abs(data['acc']) > 0.0000010) 
        watchout = 'WATCHOUT' 
      this.count ++
      if (this.count > 3) {
        this.watch = false
        this.count = 0
      }
    }

    if (data['concavity'] === 'DEC')
      this.watch = true

    next.fn({ 
      data: {
      ...(watchout && {watchout}),
       ...data
      }, 
      pipes: rest})
  }
}

