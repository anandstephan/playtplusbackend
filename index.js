require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const MONGO_URI = require('./keys').MONGO_URI
const User = require('./models/User')
const app = express()
const bcrypt = require('bcrypt')

//Middleware

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//DB Connection

mongoose.connect(MONGO_URI);

mongoose.connection.on('connected',()=>{
    console.log("Connection successfully Setup")
})

mongoose.connection.on('error',(err)=>{
    console.log("err"+err);
})

//Signup
app.post("/signup",(req,res) =>{
    const {name,email,password} =req.body;
    if(!email || !name || !password){
        res.status(422).json({error:"Please Add all the fields"})
    }
    else{
    User.findOne({email:email})
        .then((savedUser)=>{
            if(savedUser){
             res.status(422).json({error:'User Already Exsists'})
            }else{
                bcrypt.hash(password,12)
                        .then(hashedPassword =>{
                            const user1 = new User({
                                name,
                                email,
                                password:hashedPassword,
                         
                            }) 
                            user1.save()
                                .then(user =>{
                                    res.status(200).json({msg:'User Added successfully'})
                                })
                                .catch((err)=>{
                                    console.log(err);
                                })
                        })

            }
        })
        .catch(err =>{
            console.log(err)
        })
    }
})

//Login
app.post("/login",(req,res) =>{
    const {email,password} = req.body
    if(!email || !password){
        return res.status(422).json({error:"please add email and password"})
    }
    User.findOne({email:email})
        .then(savedUser =>{
            if(!savedUser){
                return res.status(422).json({error:"Invalid Email!!"})
            }
            bcrypt.compare(password,savedUser.password)
                .then(doMatch =>{
                    if(doMatch){
                        return res.json({message:"Successfully signed in"})
                       
                    }else{
                        return res.status(422).json({error:"Invalid Password"})
                    }
                })
        })
        .catch(err => console.log(err))
})


const PORT = process.env.PORT || 5000
app.listen(PORT,()=>console.log(`Server is running at ${PORT}`))