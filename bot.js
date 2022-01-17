require("dotenv").config();
const Emitter = require("events");
const Binance = require("./binance");
const TradingByOrderBook = require("./tradingByOderBook");
const delay = require("delay");
const SYMBOL = process.env.TRADING_PAIRS;

class BotTrading {

    constructor() {
        this.emitter = new Emitter();
        this.exeCnt = 0;
        this.run = false;
    }

    async runBot() {
        console.log("Run bot");
        this.run = true;
        this.emitter.on("stopLoop", () => {
            this.run = false;
        });
        let exchange = getExchange();
        let script = getScript();
        await this.loop(exchange, script);
    }

    stopBot() {
        console.log("Stop bot");
        this.emitter.emit("stopLoop");
    }
    
    async loop(exchange, script) {
        await delay(5 * 1000);
        while (this.run) {
            await this.executor(exchange, script);
            this.exeCnt++;
            await delay(30 * 1000);
        }
    }
    
    async executor(exchange, script) {
        let orderBook = await exchange.getOderBook(SYMBOL);
        var decision = script.getDecision(orderBook);
        if (!decision) {
            console.log("No decision");
            return;
        }
        const amount = 0.035;
        const balance = await exchange.getBalance();
        if (balance.total.BTC <= (1 + amount) && decision == "sell") {
            decision = "donothing";
            console.log("BTC is not enough: " + balance.total.BTC);
        } else {
            await exchange.executeMarketOder(SYMBOL, decision, amount);
        }
        const btcPrice = await exchange.getPrices(SYMBOL, "1m", 1);
        const total = balance.total.USDT + (balance.total.BTC-1) * btcPrice[0].close;
        this.balanceData = {
            tradeNumber: this.exeCnt,
            balance: total,
            symbol: SYMBOL,
            decision: decision,
            amount: amount,
            price: "market",
            usdt: balance.total.USDT,
            btc: balance.total.BTC-1,
        }
        console.log(`Trade #${this.balanceData.tradeNumber} balance $${this.balanceData.balance}`);
    }

    getBalanceData() {
        if (!this.run) {
            return {tradeNumber: null, balance: null};
        }
        return this.balanceData || {tradeNumber: 0, balance: 0};
    }
}

function getExchange() {
    let exchange = process.env.EXCHANGE;
    if (exchange.toLowerCase() == "binance") {
        return new Binance();
    }
    return;
}

function getScript() {
    let script = process.env.USING_SCRIPT;
    if (script.toUpperCase() == "ORDER_BOOK") {
        return new TradingByOrderBook();
    }
    return;
}

module.exports = BotTrading;