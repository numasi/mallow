import { Spot, SPOT_WS_STREAMS_TESTNET_URL, SPOT_WS_STREAMS_PROD_URL } from '@binance/spot'

function optionsToId(options) {
  const { symbol, interval } = options
  return `${symbol}_${interval}`
}

function idToOptions(id) {
  const [ symbol, interval ] = id.split('_')
  return { symbol, interval }
}

export default class BinanceWebsocketStream {
  constructor(params) {
    this.params = params
    this.setups = {}
    this.callbacks = {
      message: data => { 
        const { k: {t: timestamp, o: open, c: close, h: high, l: low, i: interval, s: symbol}} = JSON.parse(data)
        const id =  optionsToId({ symbol, interval})
        this.setups[id].fn({symbol, timestamp, open, close, high, low, })
      }
    }
  }

  addSetup(options, entry) {
    const id = optionsToId(options)
    this.setups[id] = entry
  }

  run() {

    const client = new Spot({
      wsURL: params.test ? SPOT_WS_STREAMS_TESTNET_URL : SPOT_WS_STREAMS_PROD_URL
    })

    client.websocketStreams
      .connect()
      .then((connection) => {
        Object.keys(this.setups).forEach(id => {
          const stream = connection.kline(idToOptions(id))
          stream.on('message', (data) => { 
            this.fn({data, pipes: this.pipes}) 
          })
        })
      })
      .catch((err) => console.error(err))
  }
}