import readline from 'readline'
import stream from 'stream'
import fs from 'fs'
import { toObject } from '../utils.js'

export default class FromFile {
  constructor({filepath, notation, from, to}) {
    this.notation = notation
    const instream = fs.createReadStream(filepath)
    this.rl = readline.createInterface(instream, new stream);
  }

  async fn({pipes: [next, rest]}) {
    let first = true
    for await (const line of this.rl) {
      if (first) { 
        first = false
        continue
      }
      const data = toObject(this.notation, line.split(' '))
      await next.fn({data, pipes: rest})
    }
  }
}
