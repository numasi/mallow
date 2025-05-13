import { quantileSeq } from 'mathjs'
import { Window } from '../utils.js'

export default class OutliarFilter {
  constructor() {
    this.buffer = new Window(50)
    this.firstFill = true
    //Array.from({ length: 10 }, () => null)
  }

  static isOutliar(value, arr) {
    const q1 = quantileSeq(arr, 0.25)
    const q3 = quantileSeq(arr, 0.75)
    const iqr = q3 - q1
    const fence = iqr * 1.5
    //console.log(value, value <= q1 - fence)
    //console.log(value, value >= q3 + fence)
    return value <= q1 - fence || value >= q3 + fence
  }

  async fn({data, pipes: [next, rest]}) {
    this.buffer.push(data)
    if (this.buffer.isFull()) {
      const values = this.buffer.map(({ price }) => price)
      if (this.firstFill) {
        const pass = this.buffer.filter(({ price }) => !OutliarFilter.isOutliar(price, values)) 
        for (const data of pass)
          next.fn({data, pipes: rest})
        this.firstFill = false
      } else {
        if (!OutliarFilter.isOutliar(data.price, values))
          next.fn({data, pipes: rest})
      }
    }
  }
}