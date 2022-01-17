class TradingScript {
    constructor() {
    }

    getDecision(orderBook) {
        if (!checkValidation(orderBook.bids[0], orderBook.bids[1], orderBook.bids[2], orderBook.asks[0], orderBook.asks[1], orderBook.asks[2])) {
            console.error("Cannot get decision, cause by invalid value");
            return;
        }
        let avgLastThreeBids = (orderBook.bids[0].amount + orderBook.bids[1].amount + orderBook.bids[2].amount) / 3;
        let avgLastThreeAsks = (orderBook.asks[0].amount + orderBook.asks[1].amount + orderBook.asks[2].amount) / 3;
        avgLastThreeBids = avgLastThreeBids.toFixed(10);
        avgLastThreeAsks = avgLastThreeAsks.toFixed(10);
        if (avgLastThreeBids === avgLastThreeAsks) {
            return "donothing";
        } else if (avgLastThreeBids > avgLastThreeAsks) {
            return "sell";
        } else {
            return "buy";
        }
    }
}

function checkValidation(...params) {
    for (var param of params) {
        if (!param) {
            return false;
        }
    }
    return true;
}

module.exports = TradingScript;