import { MongoClient } from 'mongodb'
import cliProgress from 'cli-progress'

export default class FromDB {
  constructor(client, collection, options) {
    const { from, to } = options
    this.from = from
    this.to = to
    this.client = client
    this.collection = collection
    this.progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    this.progress.start(to - from, 0);
  }

  static async makePipe(options) {
    const url = `mongodb://${process.env.MONGODB}`
    const client = new MongoClient(url)

    await client.connect()
    const db = await client.db('hsc');
    const collection = await db.collection('chain')

    return new FromDB(client, collection, options)
  }

  async fn({pipes: [next, rest]}) {
    for (let i = this.from; i <= this.to; i++) {
      const block = await this.collection.findOne({_id: i })
      next.fn({ pipes: rest, data: block })
      this.progress.increment()
    }
    this.client.close()
    this.progress.stop()
  }
}
