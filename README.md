# Mallow: Configurable algo trading bot for Node/Bun 🤖
- Binance conncetors
- Assemble various indicators into a data pipeline
- Issue sell/buy signals depending on indicator data (aka custom strategies)
- Extract exchange data to file / DB and use it for testing
- Charting with chart.js & nano-server
- Docker compose contianer setup

---

## Disclaimer

This code is NOT PRODUCTION READY at all! Made for experimenting, learning and fun. Do not try to use it for live trading unless you are ready to lose your assets.

---

## Uses

Make a .env file along the lines of .env.example

`docker compose up`
`docker compose exec mallow sh`

For accessing localhost:5000/chart.html: `bunx nano-server`

Extract some exchange data: `bun scripts/extract.js`

Running the bot: `bun scripts/run.js`

---

## TODO
- Refactor portfolio config, runner code and utils
- Typescript
- Broker improvements
- Add (back) support for Hive Engine exchange

---

