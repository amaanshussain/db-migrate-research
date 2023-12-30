const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');
const { executeQuery } = require('./db');
const { getHash, generateToken } = require('./helper');


const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cookieParser());

app.get("/users", async (req, res) => {
    const data = await executeQuery("select * from user", []);
    res.send({ data: data });
})

app.post("/users/new", async (req, res) => {
    const uid = uuid.v4();
    const name = req.body.name;
    const email = req.body.email.toLowerCase();
    const avatar = req.body.avatar;
    const password = req.body.password;

    const hashpassword = getHash(password);

    const exists = await executeQuery("select * from user where email = ?", [email]);
    if (exists.length === 1) {
        res.status(400).send({ error: "Email already in use." });
        return;
    }

    const create = await executeQuery("insert into user (uid, name, email, avatar, hash) values (?, ?, ?, ?, ?)", [uid, name, email, avatar, hashpassword]);

    res.send({ response: "Created user." });
})

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const hashpassword = getHash(password);

    const user = await executeQuery("select uid from user where email = ? and hash = ?", [email, hashpassword]);
    if (user.length !== 1) {
        res.status(400).send({ error: "Incorrect email/password" });
        return;
    }

    const token = generateToken(user[0].uid);
    await executeQuery("insert into token (token, uid) values (?, ?)", [token, user[0].uid]);

    res.cookie("token", token);
    res.send({ response: "Logged in.", uid: user[0].uid });

})

const authorizeToken = async (req, res, next) => {
    const token = req.cookies.token;
    req.body.uid = null;
    try {
        const [{ uid }] = await executeQuery("select uid from token where token = ?", [token]);
        req.body.uid = uid;

    } catch {
        res.send({ error: "Couldn't authorize user." });
    }
    next();
}

app.get("/info", [authorizeToken], async (req, res) => {
    res.send({ uid: req.body.uid });
})

app.get("/business", async (req, res) => {
    const data = await executeQuery("select * from business", []);
    res.send({ businesses: data });
})

app.post("/business", [authorizeToken], async (req, res) => {
    const uid = req.body.uid;
    const name = req.body.name;
    const bid = uuid.v4();

    const business = await executeQuery("insert into business (bid, uid, name) values (?, ?, ?)", [bid, uid, name]);

    res.cookie("bid", bid);
    res.send({ response: "Created business.", bid: bid });
})

app.delete("/business", [authorizeToken], async (req, res) => {
    const uid = req.body.uid;
    const bid = req.body.bid;
    await executeQuery("delete from business where uid = ? and bid = ?", [uid, bid]);
    if (res.cookies.bid === bid) {
        res.cookie("bid", "", { maxAge: 0 });
    }
    res.send({ response: "Deleted business." });
})

app.post("/activebusiness", [authorizeToken], async (req, res) => {
    const uid = req.body.uid;
    const bid = req.body.bid;

    const owns = await executeQuery("select * from business where uid = ? and bid = ?", [uid, bid]);

    if (owns.length !== 1) {
        res.status(400).send({ error: "Couldn't set business." });
        return;
    }

    res.cookie("bid", bid);
    res.send({ response: "Set business." });
})

const authorizeBusiness = async (req, res, next) => {
    const uid = req.body.uid;
    const bid = req.cookies.bid;
    req.body.bid = null;

    const business = await executeQuery("select * from business where uid = ? and bid = ?", [uid, bid]);

    if (business.length !== 1) {
        res.status(400).send({ error: "Couldn't get business." });
        return;
    }

    req.body.bid = bid;
    next();
}

app.get("/activebusiness", [authorizeToken, authorizeBusiness], async (req, res) => {

    const uid = req.body.uid;
    const bid = req.body.bid;

    const business = await executeQuery("select * from business where uid = ? and bid = ?", [uid, bid]);

    if (business.length !== 1) {
        res.status(400).send({ error: "Couldn't get business." });
        return;
    }

    res.send({ data: business[0] });
})

app.get("/products", [authorizeToken, authorizeBusiness], async (req, res) => {
    const bid = req.body.bid;

    const data = await executeQuery("select * from product where bid = ?", [bid]);

    res.send({ products: data });
})

app.post("/products", [authorizeToken, authorizeBusiness], async (req, res) => {
    const pid = uuid.v4();
    const bid = req.body.bid;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const count = req.body.count;

    await executeQuery("\
    insert into product \
    (pid, bid, name, price, count, description) values \
    (?, ?, ?, ?, ?, ?) \
    ", [pid, bid, name, price, count, description]);

    res.send({ response: "Created product." });
})

app.delete("/products", [authorizeToken, authorizeBusiness], async (req, res) => {
    const bid = req.body.bid;
    const pid = req.body.pid;

    const product = await executeQuery("select * from product where pid = ? and bid = ?", [pid, bid]);

    if (product.length !== 1) {
        res.status(400).send({ error: "Can't delete product." });
        return;
    }

    await executeQuery("delete from product where pid = ?", [pid]);
    res.send({ response: "Deleted product." });
})


app.listen(PORT, () => {
    console.log("app is running...");
})