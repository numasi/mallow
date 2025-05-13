export default class OHLCTypical { 
  constructor(_, next) {
    this.next = next
  }

  async fn(data) {
    
    const high = parseFloat(data.high)
    const low = parseFloat(data.low)
    const close = parseFloat(data.close)
    
    const typical = (high + low + close) / 3
    await this.next.fn({
          typical,
          ...data
    })
  }
}


