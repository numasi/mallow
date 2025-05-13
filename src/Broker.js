import { std } from 'mathjs'

export default class Broker {
    constructor(symbol, connector) {
        this.symbol = symbol
        this.connector = connector
        this.dirty = false
        this.position = 'SHORT'
        this.value = this.initial = 1000
        this.numberOfTrades = this.won = this.lost = 0
        this.results = this.profit = this.loss = 0
        this.resultsPerc = 0
        this.peak = this.trough = this.drawdown = 0
        this.returns = []
        this.tradeDates = []
        this.drawdowns = []
    }

    fn(data) {
        if (!this.firstTimestamp) 
            this.firstTimestamp = data.timestamp
        this.lastTimestamp = data.timestamp
        this.lastPrice = data.close

        switch (data.signal) {
            case 'SELL': 
                this.sell(data.timestamp, data.close)
                break
            case 'BUY': 
                this.buy(data.timestamp, data.close)
                break
        }
    }

    buy(period, price, forced) {
        if (this.position !== 'SHORT' || this.dirty)
            return

        this.dirty = true
        this.connector.order(this.symbol, 'SELL', this.value, this)
    }

    sell(period, price, forced) {
        if (this.position !== 'LONG' || this.dirty)
            return
        
        this.dirty = true
        this.connector.order(this.symbol, 'SELL', this.value, this)
    }

    rejected(e) {
        console.log(e)
    }

    fulfilled(quantity, side, transactionTime) {

        const sideToPosition = { 'BUY': 'LONG', 'SELL': 'SHORT'}
        const sideToBookFn = { 'BUY': this.bookBuy, 'SELL': this.bookSell}

        this.value = quantity
        this.position = sideToPosition[side]
        sideToBookFn[side](transactionTime)
    }
    
    bookSell(period) {
        const result = this.value - this.lastShortValue
        const resultPerc = result / this.lastShortValue * 100
        if (result > 0) {
            this.won++
            this.profit += result
        } else {
            this.lost++
            this.loss += result
        }
        this.results += result
        this.returns.push(resultPerc)
        this.resultsPerc += resultPerc
        this.tradeDates.push(period)
        this.RoR = this.results / this.initial * 100
        if (this.results > this.peak) {
            if (this.underDrawdown && this.drawdown)
                this.drawdowns.push(this.drawdown)
            this.underDrawdown = false
            this.peak = this.results
        } else  {
            this.underDrawdown = true
            this.trough = this.results
            this.drawdown = (this.peak - this.trough) / this.peak
        }

        this.numberOfTrades++
        /*console.log(
            period, 'SHORT', this.value, 'ENTRY', price, forced ? 'FORCED' : '',
            '|', result.toPrecision(3),
            '|', resultPerc.toPrecision(4) + '%',
            '|', 'RoR:', this.RoR.toPrecision(4) + '%'
        )*/
    }

    bookBuy() {
        this.lastShortValue = this.value
        this.value = this.value / price
        //console.log(period, 'LONG:', this.value, 'ENTRY:', price, forced ? 'FORCED' : '')
    }
    
    stats() {
        console.log('========== SUMMARY ==========')
        const years = (Date.parse(this.lastTimestamp) - Date.parse(this.firstTimestamp)) / (1000 * 60 * 60 * 24 * 365)
        const endValue = this.position === 'SHORT' ? this.value : this.value * this.lastPrice
        console.log(`Start: ${this.initial} | ${this.firstTimestamp}`)
        console.log(`End: ${endValue} | ${this.lastTimestamp}`)
        console.log('RoR:', this.RoR.toPrecision(4) + '%')
        console.log('Profit Factor:', Math.abs(this.profit/this.loss).toPrecision(4))
        const CAGR = ((endValue / this.initial) ** (1 / years) - 1) * 100
        console.log('CAGR:', CAGR.toPrecision(4) + '%')
        const riskFree = 150
        const avgTrade = this.resultsPerc / this.numberOfTrades
        const Sharpe = this.RoR / std(this.returns)
        console.log('Sharpe:', Sharpe.toPrecision(4))
        console.log('Trades:', this.numberOfTrades, 'Win:', this.won, 'Lost:', this.lost, 'Ratio:', this.won/this.lost)
        console.log(`Average trade: ${avgTrade.toPrecision(4)}%`)
        const bestTrade = this.returns.reduce((a, b) => Math.max(a, b), -Infinity)
        const bestTradeDate = this.tradeDates[this.returns.findIndex(el => el === bestTrade)]
        console.log(`Best trade: ${bestTrade.toPrecision(4)}% | ${bestTradeDate}`)
        console.log(`Worst trade: ${this.returns.reduce((a, b) => Math.min(a, b), Infinity).toPrecision(4)}%`)
        console.log(`Max drawdown: ${this.drawdowns.reduce((a, b) => Math.max(a, b), -Infinity).toPrecision(4)}%`)
        console.log('=============================')

    }

    minStats() {
        const years = (Date.parse(this.lastTimestamp) - Date.parse(this.firstTimestamp)) / (1000 * 60 * 60 * 24 * 365)
        const endValue = this.position === 'SHORT' ? this.value : this.value * this.lastPrice
        const CAGR = ((endValue / this.initial) ** (1 / years) - 1) * 100
        this.CAGR = CAGR
        this.sharpe = CAGR / std(this.returns)
        console.log('CAGR:', CAGR.toPrecision(4) + '%')
        console.log('Sharepish:', this.sharpe.toPrecision(4))
        console.log('Trades:', this.numberOfTrades, 'Win:', this.won, 'Lost:', this.lost, 'Ratio:', this.won/this.lost)
    }

}