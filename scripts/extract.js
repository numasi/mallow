import { run } from '../src/Pipes/utils.js'
import FromBinance from '../src/Pipes/IO/FromBinance.js'
import ToFile from '../src/Pipes/IO/ToFile.js'

/*run([
  await FromDB.makePipe({ from: 30592222, to: 31456235}),
  new Trades(),
  new ToFile({ filepath: 'trades-ALL', annotate: ['symbol', 'timestamp', 'price']})
])*/

run([
  await FromBinance.makePipe({symbol: 'HIVEUSDT', interval: '1h', from: '2017-08-17', to: '2023-11-16' }),
  new ToFile({ filepath: 'datasource/HIVEUSDT_1h', annotate: ['timestamp', 'open', 'high', 'low', 'close', 'volume']})
])