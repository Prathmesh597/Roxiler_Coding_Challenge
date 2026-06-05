const jwt = require("jsonwebtoken");

//1. Verify incoming token
const verifyToken = (req, res, next) =>{
    try{

        //1. Get Authorization header, "bearer: xnsdsr...."
        const authHeader = req.headers["authorization"];

        //2. if Header Empty, Error message -> access forbidden
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message: "Access denied"});
        }

        //3. if Header NOT Empty, Strip "bearer" part from token
        const token = authHeader.split(" ")[1];

        //4. verify token
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        //5. Store verifieed user in context
        req.user = decode;

        next();
        
    }catch(error){
        res.status(401).json({ message: "Invalid or expired token" });
    }
}