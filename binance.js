require("dotenv").config();
const ccxt = require("ccxt");
const moment = require("moment");
const API_KEY_BINANCE = process.env.API_KEY_BINANCE;
const SECRET_KEY_BINANCE = process.env.SECRET_KEY_BINANCE;

class Binance {
    constructor() {
        this.binance = new ccxt.binance({
            apiKey: API_KEY_BINANCE,
            secret: SECRET_KEY_BINANCE
        });
        this.binance.setSandboxMode(true);
    }

    async getPrices(symbol, timeFrame, limit) {
        if (!limit) {
            limit = 1000;
        }
        const price = await this.binance.fetchOHLCV(symbol, timeFrame, undefined, limit);
        return dataFormatter("price", price);
    }
    
    async getBalance() {
        const balance = await this.binance.fetchBalance();
        return balance;
    }

    async getOderBook(symbol) {
        const orderBook = await this.binance.fetchOrderBook(symbol);
        return dataFormatter("orderBook", orderBook);
    }
    
    async executeLimitOder(symbol, direction, quantity, price) {
        if (!validateDirection(direction)) {
            return;
        }
        if (price <= 0) {
            console.error(`Invalid price "${price}". It must be positive number`);
            return
        }
        const order = await this.binance.createLimitBuyOrder(symbol, direction, 'limit', quantity, price);
        if (order) {
            console.log("Oder success: ", order);
        } else {
            console.error("Oder failed: ", order);
        }
        return order;
    }

    async executeMarketOder(symbol, direction, quantity) {
        if (!validateDirection(direction)) {
            return;
        }
        const order = await this.binance.createMarketOrder(symbol, direction, quantity);
        if (order) {
            console.log(`Order success: ${direction} ${quantity} ${symbol}`);
            console.log("Order: " + order.toString());
        } else {
            console.error("Order failed!");
        }
        return order;
    }

    async getPriceTicker(symbol) {
        let priceTicker = await this.binance.fetchTicker(symbol);
        return priceTicker;
    }
}

function dataFormatter(type, data) {
    if (type == "price") {
        return data.map(price => {
            return {
                timestamp: moment(price[0]).format(),
                open: price[1],
                high: price[2],
                low: price[3],
                close: price[4],
                volume: price[5]
            }
        });
    } else if (type == "orderBook") {
        const bids = data.bids.map(bid => {
            return {
                price: bid[0],
                amount: bid[1]
            }
        });
        const asks = data.asks.map(ask => {
            return {
                price: ask[0],
                amount: ask[1]
            }
        });
        return {
            bids : bids,
            asks: asks
        }
    } else {
        return null;
    }
}

function validateDirection(direction) {
    if (direction == "donothing") {
        console.log("No decision");
        return false;
    }
    if (!direction && direction != "buy" && direction != "sell") {
        console.error(`Invalid direction "${direction}". It must be "buy" or "sell"`);
        console.log("Cancel oder");
        return false;
    }
    return true;
}

module.exports = Binance;