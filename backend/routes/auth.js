const express = require('express')
const jwt =  require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const User = require("../models/User")
const router = express.Router();
const passport = require("passport");

router.post('/signup',async (req,res)=>{
    try{
    const name = req.body.name;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;

    const hashedPass = await bcryptjs.hash(password,10)

    const user = await User.findOne({ email });
    if (user){
        res.status(411).json({ message : "Email already Exists!"})
    }
    else{
       const user1 = new User({name:name,email:email,phoneNumber:phoneNumber,password:hashedPass})
        await user1.save();
        res.status(211).json({message: "User Created Successfully!"})
    }
}catch(error){
    res.status(500).json({ message: "Internal Server Error", error: error.message });
}
})

router.get('/login',async (req,res)=>{
   try{
    const {emailorPhone,password} = req.body;

    const user  = User.findOne({
        $or:[ {email :emailorPhone, phoneNumber : emailorPhone}],
    })

    if (!user){
        return res.status(404).json({message : 'User not  FOund'})
    }

    const isMatch = await bcryptjs.compare(password,user.password)

    if (!isMatch){
        return res.status(404).json({message : 'Wrong password'})
    }

    const token = jwt.sign({id:user._id, email:user.email, role: user.role},process.env.JWT_SECRET)
    res.status(200).json({ message: "Login Successful!", token });

} catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
}
});

router.get('/google', passport.authenticate("google",{scope:["profile","email"]}))


router.get('/google/callback', passport.authenticate("google",{failureRedirect:"/login"}),(req,res)=>{
    res.redirect("http://localhost:5173/dashboard?token=${req.user.token}")
}
)

module.exports = router;