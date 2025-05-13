import querystring from 'node:querystring'

const API = 'https://api.binance.com/api/v3/'
const notation = { 0: 'timestamp', 1: 'open', 2: 'high', 3: 'low', 4: 'close', 5: 'volume' }
const intervalsToMS = { '1h': 60 * 60 * 1000, '1d': 24 * 60 * 60 * 1000 }

export default class FromBinance {
  constructor(rows, options) {
    /*const { symbol, interval, from, to } = options
    this.symbol = symbol
    this.interval = interval
    this.from = from
    this.to = to*/
    this.rows = rows
  }

  static async makePipe(options) {
    options.startTime = Date.parse(options.from)
    delete options.from

    options.endTime = Date.parse(options.to)
    delete options.to

    options.limit = 1000

    const intervalMS = intervalsToMS[options.interval]
    const rowsCount = (options.endTime - options.startTime) / intervalMS
    const batchCount = Math.ceil(rowsCount / 1000)

    let rows = []
    for (let i = 0; i<batchCount; i++) {
      const startTime = options.startTime + i * intervalMS * 1000
      const endTime = i + 1 === batchCount ? options.endTime : startTime + intervalMS * 1000 
      const query = querystring.stringify({...options, startTime, endTime })
      const response = await fetch(API+'klines?'+query)
      const newRows = await response.json()
      rows = [...rows, ...newRows]
    }

    return new FromBinance(rows)
  }

  async fn({pipes: [next, rest]}) {
    for (const row of this.rows) {
      const data = row.reduce((acc, val, i) => {
        const key = notation[i]
        if (!key) return acc
        if (key === 'timestamp')
          val = new Date(val).toISOString()
        return { ...acc, [notation[i]]: val }
      }, {}) 
      next.fn({ pipes: rest, data })
    }
  }
}
