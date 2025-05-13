export class Window extends Array  {
  constructor(size) {
    super()
    this.size = size
  }

  push(item) {
      if (this.length < this.size)
        super.push(item)
      else
        [item, ...this.slice(0, -1)]
          .forEach((e, i) => this[i] = e)
    }

  isFull() {
    return this.length === this.size
  }
}

export function makeTxFilter(filters) {
  return (tx) =>
    Object.entries(filters).every(([fKey, fVal]) => {
      if (fKey === "event")
        return tx.logs.includes(`"event":"${fVal}"`)

      if (fKey === "symbol")
        return tx.payload.includes(`"symbol":"${fVal}"`)

      if (Array.isArray(fVal))
        return fVal.some((fValN) => test(tx[fKey], fValN))

      return test(tx[fKey], fVal)
    })
}

function test(valA, valB) {
  const mode = "match"
  return mode === "search" ? valA.includes(valB) : valA === valB
}

export async function run(pipes) {
  const pipeList = toList(pipes)
  const [first, rest] = pipeList
  await first.fn({pipes: rest})
}

function toList(arr) {
  let list = null
  for (const elem of arr.reverse()) {
    list = [elem, list]
  }
  return list
}

export function toObject(keys, values) {
  const obj = keys.reduce((accumulator, key, index) =>
    ({...accumulator, [key]: values[index] }), {})
  return obj
}
