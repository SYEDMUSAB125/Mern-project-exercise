const express = require("express");
require("./db/config");
const key = require("./key");
const cors = require("cors")
const User = require("./db/user");
const Product = require("./db/product");
const app = express();
const Jwt = require("jsonwebtoken");
app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {

    const user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password
    if (user) {
        Jwt.sign({ user }, key, { expiresIn: "2h" }, (err, token) => {
            if (err) {
                res.send("Something went wrong.Please try again later");
            } else {
                res.send({ result, auth: token })
            }
        })
    }

});
app.post("/login", async (req, res) => {
    // res.send(req.body)
    // console.log(req.body)
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select('-password')

        if (user) {
            Jwt.sign({ user }, key, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send("Something went wrong.Please try again later");
                } else {
                    res.send({ user, auth: token })
                }
            })
        }

    }
    else {
        res.send({ result: "User not Found" })
    }
});
app.post("/add-product",verifyToken, async (req, res) => {
    const product = new Product(req.body);
    let result = await product.save();
    res.send(result);
})
app.get("/list",verifyToken, async (req, res) => {
    let result = await Product.find();
    if (result.length > 0) {
        res.send(result)
    } else {
        res.send({ result: "Product Not Found" })
    }
}
);
app.delete("/product/:id",verifyToken, async (req, res) => {
    let result = await Product.deleteOne({ _id: req.params.id });
    res.send(result)
});
app.get("/product/:id",verifyToken, async (req, res) => {
    let result = await Product.findOne({ _id: req.params.id })
    if (result) {
        res.send(result)

    }
    else if (!result) {
        res.send({ result: "No Entity found" })
    }
    else {
        res.send({ result: "something went wrong" })
    }
})
app.put("/product/:id",verifyToken, async (req, res) => {
    let result = await Product.updateOne({
        _id: req.params.id
    }, { $set: req.body }
    )
    res.send(result)
})
app.get("/search/:key",verifyToken, async (req, res) => {
    let result = await Product.find({
        $or: [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
           
        ]
    })
    res.send(result)
})
function verifyToken(req,res,next){
 let token = req.headers["authorization"];
//  console.log("middleware called",token)
 if(token){
   token = token.split(' ')[1];
//    console.log("miiddleware", token);
   Jwt.verify(token, key,(err,valid)=>{
    if(err){
        res.status(401).send({result:"please enter valid token"})
    }else{
        next();
    }
   })
 }else{
   res.status(403).send("please enter authorization token")
 }

}
app.listen(5000);