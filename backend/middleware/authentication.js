// if the person has a token thats valid then we will let them enter otherwise no. so we will throw unauthroized error if token does not exist and we will use next() if it does.

const {UnauthenticatedError} = require('../errors')
const jwt= require('jsonwebtoken')

const authenticator=(req,res,next)=>{
    const authHeader=req.headers.authorization;
    // console.log(req.headers)
    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('authentication Invalid bale')
    }
   
    const token = authHeader.split(' ')[1];
try{
    const payload=jwt.verify(token, process.env.JWT_SECRET);
    // ATTACHING USER TO THE REQUEST OBJ
    req.user={userId: payload.userId, name: payload.name};
    next();


    // ANOTHER WAY OF CODING THIS. ISME BASICALLY DB SE ALL USER INFO FETCH KARKE STORE KARDENGE IN REQ OBJECT OFCOURSE REMOVING THE PASSWORD. 
   /* 
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      throw new UnauthenticatedError('Authentication invalid');
    }
    // Attach the user to the request object
    req.user = user;
    next();
     */
}catch(error){
    throw new UnauthenticatedError("token is invalid")
}

}

module.exports=authenticator