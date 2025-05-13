import WMA from './WMA.js'

export default class HMA {
    constructor({period}, next) {
        this.next = next
        this.wma1 = new WMA({ period: period / 2 })
        this.wma2 = new WMA({ period  })
        this.hma = new WMA({ period: Math.round(Math.sqrt(period)), of: 'hma_base' })
    }

    fn(data) {

        const wma1 = this.wma1.fn(data)
        const wma2 = this.wma2.fn(data)
        const hma_base = wma1 * 2 - wma2
        const hma = this.hma.fn({ hma_base })
        if (this.next)
            this.next.fn({ hma, ...data })
        return hma
    }
}
