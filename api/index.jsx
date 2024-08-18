const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const crypto = require("crypto")
const nodemailer = require("nodemailer")

const app = express()
const port = 3000;
const cors = require("cors")

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

const jwt = require("jsonwebtoken")
const User = require('./models/user.jsx');

mongoose.connect("mongodb+srv://nicholasjamou:4uPJndybgjTEq8nw@cluster0.mucaghn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(() => {
    console.log("Connected to MongoDB")

}).catch((err) => {
    console.log("Error connecting to MongoDB", err)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

//endpoint to register a user to the backend
pp.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        // Generate a verification token
        newUser.verificationToken = crypto.randomBytes(20).toString("hex");

        // Save user to database
        await newUser.save();
        
        // Send verification email
        sendVerificationEmail(newUser.email, newUser.verificationToken);
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.log("Error registering the user", err);
        res.status(500).json({ message: "Error registering the user" });
    }
});

const sendVerificationEmail = async (email, verificationToken) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user:"nicholas.jamou@gmail.com",
            pass:"bsku ksid nuke uqfr"
        },
    });

    const mailOptions = {
        from: "nicholas.jamou@gmail.com",
        to: email,
        subject: "Email Verification",
        text: `Please click the following link to verify your email: http://192.168.0.32:3000/verify/${verificationToken}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent");
    } catch (err) {
        console.log("Error sending verification email", err);
    }

    };

//verify the user

app.get("/verify/:token", async (req, res) => {
    try {
        const token = req.params.token;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(404).json({ message: "Invalid verification token" });
        }

        //mark the user as verified
        user.verified = true;
        user.verificationToken = undefined;

        await user.save();

        res.status(200).json({ message: "Email verified Sucesfully" });
    } catch (error) {
        console.log("errror", error);
        res.status(500).json({ message: "Email verification failed" });
    }
});

