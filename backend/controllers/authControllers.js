const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OtpModel');
const jwt = require('jsonwebtoken'); // Import JWT

exports.signup = async (req, res) => {
    try{
    const name = req.body.name;
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    const otp = req.body.otp

    const user = await User.findOne({ email });
    if (user){
        return res.status(409).json({ message : "Email already Exists!"})
    }
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: 'The OTP is not valid',
      });
    }
        const hashedPass = await bcrypt.hash(password,10)
        const user1 = new User({name:name,email:email,phoneNumber:phoneNumber,password:hashedPass})
        await user1.save();
        const token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({ message: "User Created Successfully!", token });
        console.log("User created")
}catch(error){
    res.status(500).json({ message: "Internal Server Error", error: error.message });
}
}

exports.login = async (req,res)=>{
    try{
     const {emailorPhone,password} = req.body;
     if (!emailorPhone || !password) {
         return res.status(400).json({ message: "Email/Phone and password are required!" });
       }
      const user = await User.findOne({
       $or: [{ email: emailorPhone }, { phoneNumber: emailorPhone }],
     });
 
     if (!user){
         return res.status(404).json({message : 'User not  FOund'})
     }
 
     const isMatch = await bcrypt.compare(password,user.password)
 
     if (!isMatch){
         return res.status(404).json({message : 'Wrong password'})
     }
 
     const token = jwt.sign({id:user._id, email:user.email, role: user.role},process.env.JWT_SECRET)
     res.status(200).json({ message: "Login Successful!", token });
 
 } catch (error) {
     res.status(500).json({ message: "Internal Server Error", error: error.message });
 }
 };