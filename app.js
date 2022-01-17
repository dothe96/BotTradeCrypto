const express = require("express");
const BotTrading = require("./bot");
const app = express();
const port = 3000;

const Bot = new BotTrading();

app.use("/", express.static(__dirname + "/public"));
app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/balance", (req, res) => {
    res.json(Bot.getBalanceData());
});

app.get("/bot/:action", (req, res) => {
    var action = req.params.action;
    if (action == 1) {
        Bot.runBot();
        res.send("Run Bot");
    } else if (action == 2) {
        Bot.stopBot();
        res.send("Stop Bot");
    }
});

app.listen(port, (err) => {
    if (err) {
        console.error(err);
    }
    console.log("Server running on port " + port);
});