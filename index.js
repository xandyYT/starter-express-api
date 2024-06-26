_path = process.cwd()

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

app.use("/", mainrouter)
app.use((req, res) => {
    res.sendFile(__dirname + '/404error.html')
})
app.listen(1406, () => {
    console.log("ta on na porta 1406")
})
