const express=require('express')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const passport=require('passport')
const localStrategy=require('passport-local').Strategy
const jwt=require('jsonwebtoken')
const { v2: cloudinary } = require("cloudinary");
const app=express()
const PORT=8000
const cors=require('cors')
app.use(bodyParser.json())
app.use(cors())
// CLOUDINARY_NAME='dzcwki4mp'
// CLOUDINARY_API_KEY='419677824567658'
// CLOUDINARY_SECRET_KEY='QcU0U3W_OS9_VijtVyt0sTQopf4'
app.use(bodyParser.urlencoded({extended:false}))
app.use(passport.initialize())
const fs = require("fs");
const path = require("path");
const connectCloudinary=async ()=>{
    cloudinary.config({
        cloud_name:'dzcwki4mp',
        api_key:'419677824567658',
        api_secret:'QcU0U3W_OS9_VijtVyt0sTQopf4'
    })
    console.log("cloudinary connected")
}
connectCloudinary()
  const uploadPath = path.join(__dirname, "file");
  
  // Check if 'file' directory exists. If not, create it
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

mongoose.connect("mongodb://localhost:27017/chatto")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });

const User=require("./models/user.js")
const Message=require("./models/message.js")
/////////////endpoint for registration of the user
const multer = require("multer");
const storage=multer.diskStorage({
    filename: function(req,file,callback){
        callback(null,file.originalname)
    }
})

const upload=multer({storage})
// Endpoint for registration

app.post("/register", upload.single('image'),async (req, res) => {
    const { name, email, password } = req.body;
    const imageFile=req.file
    // create a new User object
    let imageUrl="";
    if(imageFile){
        //upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = imageUpload.secure_url;
        // await User.findByIdAndUpdate(email,{image:imageUrl})
    }
    const newUser = new User({ name, email, password, image:imageUrl });
  
    // save the user to the database
    newUser
      .save()
      .then(() => {
        res.status(200).json({ message: "User registered successfully" });
      })
      .catch((err) => {
        console.log("Error registering user", err);
        res.status(500).json({ message: "Error registering the user!" });
      });
  });
  //function to create a token for the user
const createToken = (userId) => {
    // Set the token payload
    const payload = {
      userId: userId,
    };
  
    // Generate the token with a secret key and expiration time
    const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });
  
    return token;
  };

  ////////////////endpoint for logging in of that particular user
  app.post("/login", (req, res) => {
    const { email, password } = req.body;
    
    //check if the email and password are provided
    if (!email || !password) {
      return res
        .status(404)
        .json({ message: "Email and the password are required" });
    }
  
    //check for that user in the database
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          //user not found
          return res.status(404).json({ message: "User not found" });
        }
  
        //compare the provided passwords with the password in the database
        if (user.password !== password) {
          return res.status(404).json({ message: "Invalid Password!" });
        }
  
        const token = createToken(user._id);
        res.status(200).json({ token });
      })
      .catch((error) => {
        console.log("error in finding the user", error);
        res.status(500).json({ message: "Internal server Error!" });
      });
  });
  //////////endpoint to access all the users except the user who is currently logged in
  

  app.get("/users/:userId", async (req, res) => {
    try {
      const loggedInUserId = req.params.userId;
  
      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
        return res.status(400).json({ message: "Invalid User ID" });
      }
  
      // Fetch the logged-in user's document to get their friends
      const loggedInUser = await User.findById(loggedInUserId).lean();
  
      if (!loggedInUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Combine user's own ID and their friends' IDs into an array to exclude
      const excludedUserIds = [loggedInUserId, ...loggedInUser.friends.map(id => id.toString())];
  
      // Find users who are not in the excluded list
      const users = await User.find({
        _id: { $nin: excludedUserIds }
      }).lean();
  
      res.status(200).json(users);
    } catch (err) {
      console.error("Error retrieving users:", err);
      res.status(500).json({ message: "Error retrieving users" });
    }
  });

  /////////endpoint to send a request to user
  app.post("/friend-request", async (req, res) => {
    const { currentUserId, selectedUserId } = req.body;
  
    try {
      //update the recepient's friendRequestsArray!
      await User.findByIdAndUpdate(selectedUserId, {
        $push: { friendRequests: currentUserId },
      });
  
      //update the sender's sentFriendRequests array
      await User.findByIdAndUpdate(currentUserId, {
        $push: { sentFriendRequests: selectedUserId },
      });
  
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(500);
    }
  });
  ///////endpoint to show all the friend-request of particular user
  app.get("/friend-request/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID" });
      }
  
      // Fetch user document and populate friend requests
      const user = await User.findById(userId)
        .populate("friendRequests", "name email image")
        .lean();
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Ensure uniqueness using a Set
      const uniqueFriendRequests = Array.from(
        new Map(user.friendRequests.map((req) => [req._id.toString(), req])).values()
      );
  
      res.json(uniqueFriendRequests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  ////endpoint to accept a friend request of a particular person
  app.post("/friend-request/accept", async (req, res) => {
    try {
      const { senderId, recepientId } = req.body;
  
      //retrieve the documents of sender and the recipient
      const sender = await User.findById(senderId);
      const recepient = await User.findById(recepientId);
  
      sender.friends.push(recepientId);
      recepient.friends.push(senderId);
  
      recepient.friendRequests = recepient.friendRequests.filter(
        (request) => request.toString() !== senderId.toString()
      );
  
      sender.sentFriendRequests = sender.sentFriendRequests.filter(
        (request) => request.toString() !== recepientId.toString()
      );
  
      await sender.save();
      await recepient.save();
  
      res.status(200).json({ message: "Friend Request accepted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  ////endpoint to access all the friends of loggedIn users
  app.get("/accepted-friends/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID" });
      }
  
      // Fetch user and populate friends
      const user = await User.findById(userId)
        .populate("friends", "name email image")
        .lean();
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Ensure uniqueness using a Set
      const uniqueFriends = Array.from(
        new Map(user.friends.map((friend) => [friend._id.toString(), friend])).values()
      );
  
      res.json(uniqueFriends);
    } catch (error) {
      console.error("Error fetching accepted friends:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  
  
// Configure multer for handling file uploads

  
  ////endpoint to post messages and store it in the backend
  app.post("/messages", upload.single('imageFile'), async (req, res) => {
    try {
        const { senderId, recepientId, messageType, messageText } = req.body;
        let newMessage;

        if (messageType === "image") {
            const imageFile = req.file;
            let imageUrl = "";

            if (imageFile) {
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    resource_type: "image",
                });
                imageUrl = imageUpload.secure_url;
            }

            newMessage = new Message({
                senderId,
                recepientId,
                messageType,
                message: messageText,
                timestamp: new Date(),
                imageUrl: imageUrl || null,
            });

        } else {
            // ✅ Handles other message types like text
            newMessage = new Message({
                senderId,
                recepientId,
                messageType,
                message: messageText,
                timestamp: new Date(),
                imageUrl: null,
            });
        }

        await newMessage.save();
        res.status(200).json({ message: "Message sent Successfully" });

    } catch (error) {
        console.error("Error in /messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


  //endpoint to get the userdetails to design the header part of chatroom
  app.get("/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      //fetch the user data from the user ID
      const recepientId = await User.findById(userId);
  
      res.json(recepientId);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  //endpoint to fetch the messages between two users in the chatRoom
app.get("/messages/:senderId/:recepientId", async (req, res) => {
    try {
      const { senderId, recepientId } = req.params;
  
      const messages = await Message.find({
        $or: [
          { senderId: senderId, recepientId: recepientId },
          { senderId: recepientId, recepientId: senderId },
        ],
      }).populate("senderId", "_id name");
  
      res.json(messages);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  //endpoint to delete the message
  app.post("/deleteMessages", async (req, res) => {
    try {
      const { messages } = req.body;
  
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "invalid req body!" });
      }
  
      await Message.deleteMany({ _id: { $in: messages } });
  
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server" });
    }
  });
  app.get("/friend-requests/sent/:userId",async(req,res) => {
    try{
      const {userId} = req.params;
      const user = await User.findById(userId).populate("sentFriendRequests","name email image").lean();
  
      const sentFriendRequests = user.sentFriendRequests;
  
      res.json(sentFriendRequests);
    } catch(error){
      console.log("error",error);
      res.status(500).json({ error: "Internal Server" });
    }
  })
  app.get("/friends/:userId",(req,res) => {
    try{
      const {userId} = req.params;
  
      User.findById(userId).populate("friends").then((user) => {
        if(!user){
          return res.status(404).json({message: "User not found"})
        }
  
        const friendIds = user.friends.map((friend) => friend._id);
  
        res.status(200).json(friendIds);
      })
    } catch(error){
      console.log("error",error);
      res.status(500).json({message:"internal server error"})
    }
  })
app.listen(PORT,()=>{
    console.log("Server is running on 8000 port")
})