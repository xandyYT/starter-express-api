

var express = require("express")
var cors = require("cors")
var secure = require("ssl-express-www")

var app = express()
var mainrouter = require('./main.js')
app.enable("trust proxy")
app.set("json spaces", 2)
app.use(cors())
app.use(secure)
app.use(express.static('public'))
app.all('/eaer', async (req, res) => {
    res.json({"oi": "oi"})
})
app.use("/", mainrouter)

app.listen(process.env.PORT || 3000, () => {
    console.log("ta on na porta 1406")
})
