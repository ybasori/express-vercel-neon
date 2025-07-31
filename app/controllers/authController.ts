import Validator from "@app/helper/Validator";
import User from "@app/models/User";
import { Request, Response } from "express"
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";


const authController ={
    login: async (req:Request, res: Response)=>{

        try{

        const rules = {
            username: {
                label: "Username",
                rule: {
                    required: true,
                },
            },
            password: {
                label: "Password",
                rule: {
                    required: true,
                },
            },
        };

        const validate = await Validator.make(req.body, rules);
        if (validate.fails()) {
            return res.status(400).json({
                statusCode: 400,
                message: "Bad request!",
                error: validate.getMessages(),
            });
        }

        const userModel = new User();

        const users = await userModel.getByFilter({filter: {
            username: req.body.username,
            deleted_at: "null"
        }});

        if(!!!users || users.length<1){
            return res.status(400).json({
                statusCode: 400,
                message: "Username or Password not matched!",
            });
        }

        const [user] = users

        const comparePassword = await bcrypt.compare(req.body.password, user.password);
            // console.log("======", comparePassword)

        if(!!!comparePassword){
            return res.status(400).json({
                statusCode: 400,
                message: "Username or Password not matched!",
            });
        }

        delete user.password;
      
        // Normally you'd validate username/password here
        const token = jwt.sign(user, process.env.SECRET_KEY ?? "", { expiresIn: '1h' });
      
        // Set token in HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV==="production", // set to true if using HTTPS
          sameSite: 'lax',
          maxAge: 60 * 60 * 1000, // 1 hour
        });
      
        
        return res.json({ statusCode: 200, message: "Welcome!", result: {name: user.name, username: user.username, joined_at: user.created_at} });
    }catch(err){
        console.log(err)
            return res.status(500).json({
                statusCode: 500,
                message: err,
            });
    }
    },
    logout: (_req:Request, res:Response)=>{
        
        res.clearCookie('token');
        res.json({ success: true });
    }
}

export default authController;