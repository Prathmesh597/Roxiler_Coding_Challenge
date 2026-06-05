const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

//1. Register new User
const register = async(req, res)=>{
    
    try{
        
        //1. request body
        const{name, email, password, address} = req.body;

        //2. check if email exists in db, return array
        const[existingUser] = await db.query(
            "select id from users where email = ?", [email]
        );

        //3. if User EXISTS, error message
        if(existingUser.length > 0){
            return res.status(400).json({message: "User with email Alreay Exists.."});
        }

        //4.If User NOT EXISTS, convert Raw password -> Hashed password, with 10 salt iteration
        const hashedPassword = await bcrypt.hash(password, 10);

        //5. Insert new user in db with hashed password
        await db.query(
            "Insert into users(name,email,password,address,role) values(?,?,?,?,?)",
            [name,email,hashedPassword,address,"user"]
        );

        res.status(201).json({message: "User Registered Sucessfully.."});

        

    }catch(error){
        res.status(500).json({message: "Registration failed..", error: error.message});
    }
}

//2. Login user
const login = async (req,res) =>{

    try{

        //1. request body for login
        const{email,password} = req.body;

        //2. get user by email, return array of users with matching email
        const[users] = await db.query(
            "Select * from users where email = ?",[email]
        );

        //3. If NOT EXISTS, error message
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        //4. if EXISTS get first user
        const user = users[0];

        //5. Convert Raw password -> Hashed password, compare with found users hashed password 
        const isMatch = await bcrypt.compare(password, user.password);

        //6. if NOT match, Error message
        if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
        }

        //7. Generate JWT token using Server-side payload, Secret_key, and expiration time
        const token = jwt.sign(
            {id: user.id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "24h"}
        );

        //8. Send response back
        res.status(200).json({
            token, user:{
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    }catch(error){
        res.status(500).json({message: "Server error..", error: error.message});
    }

}

module.exports = { register, login };
