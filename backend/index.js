const express = require('express');

const app = express();

app.use(express.json());
var users = 0;

function connectionsMid (req, res, next)
{
    console.log("CONNECTIONS: " + ++users);
    next();
}

app.get('/', connectionsMid, function (req, res) {
    res.json({
        msg: "Hello there"
    });
});




app.listen(3000, () => {
    console.log("LISTENING TO PORT 3000");
})
