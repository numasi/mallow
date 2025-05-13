import { Spot, SPOT_WS_STREAMS_TESTNET_URL } from '@binance/spot'

const intervalsToMS = { '1h': 60 * 60 * 1000, '1d': 24 * 60 * 60 * 1000 }

export default class StreamBinance {
  constructor(options) {
    this.options = options
    this.inited = false
  }

  init() {
    const configurationWebsocketStreams = {
      wsURL: SPOT_WS_STREAMS_TESTNET_URL,
    }

    const client = new Spot({ configurationWebsocketStreams })

    client.websocketStreams
      .connect()
      .then((connection) => {
          const stream = connection.kline(this.options)
          stream.on('message', (data) => { 
            this.fn({data, pipes: this.pipes}) 
          })
      })
      .catch((err) => console.error(err))

    this.inited = true
    //setTimeout(() => websocketStreamClient.disconnect(), 6000)

  }

  fn({pipes, data}) {
      if (!this.inited) {
        this.pipes = pipes
        this.init()
        return
      }

      const { k: {t: timestamp, o: open, c: close, h: high, l: low}} = data 
  
      const parsed = { timestamp: new Date(timestamp).toISOString(), open, close, high, low }
      
      console.log(parsed)
      //next.fn({ pipes: rest, data })
  }
}