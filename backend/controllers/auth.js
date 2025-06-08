const User=require('../models/User')
const {BadRequestError, UnauthenticatedError}=require('../errors')
const {StatusCodes}=require('http-status-codes')

const register=async (req,res)=>{
    const user= await User.create({...req.body})
    res.status(StatusCodes.CREATED).json({user:{userId: user._id, name: user.name}, token: user.createJWT()})
}


const login=async (req,res)=>{
    const {email,password}= req.body
    if(!email || !password) throw new BadRequestError("Please enter email and password")

    const user=await User.findOne({email: email})
    if(!user) throw new UnauthenticatedError("Invalid Email, user not found")
    
    const isCorrectPassword= await user.comparePassword(password);
    if(!isCorrectPassword) throw new  UnauthenticatedError("Incorrect Password")

        res.status(StatusCodes.OK).json({user:{userId: user._id, name: user.name}, token: user.createJWT()})
}

module.exports={
    login,
    register
}