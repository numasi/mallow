import { Spot, SPOT_REST_API_PROD_URL, SPOT_REST_API_TEST_URL  } from '@binance/spot'
import { randomUUID } from 'crypto'

export default class BinanceWebSocketAPI {
  constructor(params) {
    this.params = params
    this.orders = {}

    const configurationRestAPI = {
        apiKey: process.env.API_KEY ?? '',
        apiSecret: process.env.API_SECRET ?? '',
        basePath: this.params.test ? SPOT_REST_API_TEST_URL : SPOT_REST_API_PROD_URL
    }
    this.client = new Spot({ configurationRestAPI })
  }

  /*handleMessage(data) {
    const { id, status } = data
    switch (status) {
      case 200:
        this.orders[id].fulfilled(data)
        break;
      case 409:
        //this.orders[id].needToQuery(data)
        break;
      default:
        if (status >= 500 && status < 600) {
          //reconnect
          //this.orders[id].uncertain(data)
        } else this.orders[id].rejected(data)
    }
  }*/

  order(symbol, side, quantity, broker) {
    const id = randomUUID()
    this.orders[id] = broker

    //async wont fail!
    try {
      this.client.newOrder(symbol, side, "MARKET", {
        ...(side === "BUY" && { quoteOrderQty: quantity }),
        ...(side === "SELL" && { quantity }),
        newClientOrderId: id,
      })
    } catch (e) {
      this.orders[id].rejected(e)
      delete this.orders[id]
    }
  }
}