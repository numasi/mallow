import CrossoverMean from '../src/Pipes/Strategy/CrossoverMean.js'
import OHLCTypical from '../src/Pipes/Price/OHLCTypical.js'
import BinanceWebSocketStream from '../src/Connectors/BinanceWebSocketStream.js'
import BinanceWebSocketAPI from '../src/Connectors/BinanceWebSocketAPI.js'
import Broker from '../src/Broker.js'

const portfolio = [
  {
    platform: 'BinanceTest',
    options: {
      symbol: 'BTCUSDT',
      interval: '1m',
    },
    strategy: [
      'OHLCTypical',
      { CrossoverMean: { shortPeriod: 2, longPeriod: 16 } }
    ],
  },
]

const pipes = {
  OHLCTypical,
  CrossoverMean
}

const connectors = {
  Binance: { streamer: BinanceWebSocketStream, broker: BinanceWebSocketAPI },
  BinanceTest: { streamer: BinanceWebSocketStream, broker: BinanceWebSocketAPI, params: { test: true } }
}

function run(portfolio) {
  const streams = makeStreams(portfolio)
  streams.forEach(s => s.run())
}

function instantiateConnectors(platform) {
  const streamer = new (connectors[platform].streamer)(connectors[platform].params)
  const broker = new (connectors[platform].broker)(connectors[platform].params)
  return { streamer,  broker}
}

function makeStreams(portfolio) {
  const platforms = [...new Set(portfolio.map(pi => pi.platform))]
  const connectors = Object.fromEntries(platforms.map(p => [ p, instantiateConnectors(p)]))
  
  let setups = []

  portfolio.forEach(i => {
    const { options, platform } = i
    const entry = assemblePipeline(i, connectors[platform].broker)
    setups = [ { platform, options, entry }, ...setups ]
  })

  for (const setup of setups) 
    connectors[setup.platform].streamer.addSetup(setup.options, setup.entry)

  return Object.entries(connectors).map(([platform, connectors]) => connectors.streamer)
}

function assemblePipeline(config, brokerConnector) {
  const broker = new Broker(config.options.symbol, brokerConnector)
  const entry = makePipes(config.strategy, broker)  
  return entry
}

function configToPipe(config, next) {
  if (typeof config === 'string')
    return new pipes[config](undefined, next)
  const [name, params] = Object.entries(config)[0]
  return new pipes[name](params, next)
}

function makePipes(configs, last) {
  if (!configs.length)
    return last
  const config = configs.pop()
  const pipe = configToPipe(config, last)
  return makePipes(configs, pipe)
}

run(portfolio)