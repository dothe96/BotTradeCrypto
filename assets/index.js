google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawBasic);
function drawBasic() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'TRADE');
    data.addColumn('number', 'USD');

    var options = {
        title: "Total USD",
        hAxis: {
            title: 'Trades'
        },
        vAxis: {
            title: 'USD'
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    var temp;

    setInterval( ()=> {
        let res = fetch("/balance");
        res.then(r => {
            r.json().then(resData => {
                var trade = resData.tradeNumber;
                var balance = resData.balance;
                if (trade && trade===temp) {
                    return;
                } else {
                    temp = trade;
                }
                if (trade && balance) {
                    data.addRow([trade, balance]);
                    chart.draw(data, options);
                    printTradeLog(resData)
                    handleRunningAnimation("run")
                } else {
                    handleRunningAnimation("stop")
                }
            })
        }).catch(err => {
            console.log(err);
            handleRunningAnimation("stop")
        });
    }, 2000);
}

function printTradeLog(data) {
    document.getElementById("btc").innerHTML = data.btc.toFixed(6).toString();
    document.getElementById("usdt").innerHTML = data.usdt.toFixed(2).toString();
    document.getElementById("total-usd").innerHTML = data.balance.toFixed(2).toString();

    let isDonNothing = false;
    let node = document.getElementById("default-element");
    let newNode = node.cloneNode(true);
    newNode.id = "trade-" + data.tradeNumber;

    let decision = newNode.querySelector("#default-decision");
    decision.id = "decision-" + data.tradeNumber;
    if (data.decision == "sell") {
        decision.classList.remove("trade-decision-buy");
        decision.classList.add("trade-decision-sell");
        decision.innerHTML = `Trade #${data.tradeNumber}: Sell`;
    } else if (data.decision == "buy"){
        decision.innerHTML = `Trade #${data.tradeNumber}: Buy`;
    } else {
        decision.innerHTML = `Trade #${data.tradeNumber}: Skip`;
        decision.classList.remove("trade-decision-buy");
        decision.classList.add("trade-decision-donothing");
        isDonNothing = true;
    }

    if (!isDonNothing) {
        let detail = newNode.querySelector("#default-detail");
        detail.id = "detail-" + data.tradeNumber;
        detail.innerHTML = `Price: ${data.price} - Amount: ${data.amount}`;
    }

    let symbol = newNode.querySelector("#default-symbol");
    symbol.id = "symbol-" + data.tradeNumber;
    symbol.innerHTML = data.symbol;

    let stackLog = document.getElementById("stack-log");
    stackLog.appendChild(newNode);
    //stackLog.scrollTop = stackLog.scrollHeight;
    scrollTo(stackLog, stackLog.scrollHeight, 1500);
}

function handleRunningAnimation(run) {
    var runningText = document.getElementById("running-text").innerHTML;
    if ((runningText == "Starting" && run == "stop") || (runningText == "Stopping" && run == "run")) {
        return;
    }
    if (run == "run") {
        document.getElementById("running-text").innerHTML = "Running";
        document.getElementById("line1").style.animationPlayState = "running";
        document.getElementById("line2").style.animationPlayState = "running";
        document.getElementById("line3").style.animationPlayState = "running";
    } else {
        document.getElementById("running-text").innerHTML = "Stop";
        document.getElementById("line1").style.animationPlayState = "paused";
        document.getElementById("line2").style.animationPlayState = "paused";
        document.getElementById("line3").style.animationPlayState = "paused";
    }
}

function onStart() {
    const res = fetch("/bot/1");
    res.then(data => {
        console.log("Run bot");
        document.getElementById("running-text").innerHTML = "Starting";
    }).catch(err => {
        console.err(err);
        document.getElementById("running-text").innerHTML = "Start failed";
    });
}

function onStop() {
    const res = fetch("/bot/2");
    res.then(data => {
        console.log("Stop bot");
        document.getElementById("running-text").innerHTML = "Stopping";
    }).catch(err => {
        console.err(err);
        document.getElementById("running-text").innerHTML = "Stop failed";
    });
}

function scrollTo(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;
        
    var animateScroll = function(){        
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};