export default class FromTo {
  constructor({from, to}) {
    this.from = Date.parse(from)
    this.to = Date.parse(to)
  }

  fn({data, pipes: [next, rest]}) {
    const from = Date.parse(data.period)
    const to = Date.parse(data.period)
    if (from >= this.from && to <= this.to)
      next.fn({data, pipes: rest})
  }
}