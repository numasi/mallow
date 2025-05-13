export default class Trades {
  constructor(options) {
    this.options = options
  }

  async fn({data, pipes: [next, rest]}) {
    const { transactions, timestamp } = data
    const { symbol } = this.options || {}
    const f = makeTxFilter({ contract: 'market', event: 'orderClosed', ...(symbol && {symbol}) })
    transactions.filter(f).forEach(async tx => 
      next.fn({
        data: {
          symbol: JSON.parse(tx.payload).symbol,
          timestamp,
          price: JSON.parse(tx.payload).price,
          ...data
        },
        pipes: rest
      }
    ))
  }
}
