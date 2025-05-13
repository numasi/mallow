export default class Market {
  constructor(market) {
    this.market = market
  }

  fn({data, pipes: [next, rest]}) {
      if (data.symbol === this.market)
        next.fn({data, pipes: rest})
  }
}
