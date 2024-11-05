var express = require('express');
const users = require('../models/model-users');
const jwt = require('jsonwebtoken')

var router = express.Router();

router.post('/data',async(req,res)=>{
  try {
    if (!req.body.Email || !req.body.Password) {
      return res.status(400).json({
        status: "error",
        message: "Email and Password are required",
      });
    }
  const newdata = new users({
  Email:req.body.Email,
  Password: req.body.Password,
  // Cart:req.body.Cart
})
 newdata.save()
 res.json({
  status: "success",
  res:"succesfully added"
 })
}
 catch (error) {
  console.error('Error adding user:', error.message);
  res.status(500).json({
    status: "error",
    message: "Failed to add user",
    error: error.message,
  });
}
})

router.post('/signup',async(req,res)=>{
  try {
    if (!req.body.Email || !req.body.Password) {
      return res.status(400).json({
        status: "error",
        message: "Email and Password are required",
      });
    }
    const existingUser = await users.findOne({ Email: req.body.Email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Email is already in use",
      });
    }
  const signup = new users({
    Email:req.body.Email,
    Password:req.body.Password
  });
  await signup.save();
  const token = jwt.sign({ id: signup.id }, 'SECRET_KEY', { expiresIn: '24h' });
  return res.status(201).json({
    status:"success",
    message:"successfully signed up",
    token:token
  });
  }
  catch (error) {
   console.error('Error during signup:', error.message);
   return res.status(500).json({
    status: "error",
    message: "Failed to sign up",
    error: error.message,
  });
  }
})
 
router.post('/login' , async (req,res)=>{
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({
        status: "error",
        message: "Email and Password are required",
      });
    }
  const  login=await users.findOne({Email})
  if (!login) {
    return res.status(404).json({
      status: "failed",
      message: "User not found",
    });
  }
  const token = jwt.sign({ id: login.id }, 'SECRET_KEY', { expiresIn: '24h' });
  return res.status(200).json({
    status: "success",
    message: "Successfully logged in",
    token: token,
  });
  }
  catch (error) {
    console.error('Error during login:', error.message);
    return res.status(500).json({
      status: "error",
      message: "Failed to log in",
      error: error.message,
    });
  }
})

router.post('/addcart',async(req,res)=>{
  const secret = 'SECRET_KEY';
try {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Token is required",
    });
  }
  const decoded = jwt.verify(token, secret);
  const usersId =decoded.id;
  console.log(usersId);
  console.log('Token is valid:', decoded);
  const user = await users.findByIdAndUpdate(usersId,
    {$push:{"Cart" : req.body.Cart}},
    {new:true});
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    } 
  console.log(user);
  res.json({
    res:"succesfully added",
    cart:user.Cart
   })
  } 
  catch (error) {
   console.error('Invalid token:', error.message);
   res.status(500).json({
    status: "error",
    message: "Failed to add to cart",
    error: error.message,
  });
}
})

router.post('/removefromcart',async(req,res)=>{
  const secret = 'SECRET_KEY';
try {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "Token is required",
    });
  }
  const decoded = jwt.verify(token, secret);
  const usersId =decoded.id;
  console.log(usersId);
  console.log('Token is valid:', decoded);
  const user = await users.findByIdAndUpdate(usersId,
    {$pull:{"Cart" : req.body.Cart}},
    {new:true});
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
  console.log(user);
  res.json({
    res:"succesfully removed"
   })
} catch (error) {
  console.error('Invalid token:', error.message);
  console.error('Error removing from cart:', error.message);

  // Send an error response for other issues
  res.status(500).json({
    status: "error",
    message: "Failed to remove from cart",
    error: error.message,
  });
}
})

router.post('/getcart',async(req,res)=>{
  const secret = 'SECRET_KEY';
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, secret);
    const usersId =decoded.id;
    console.log(usersId);
    console.log('Token is valid:', decoded);
    const getcart= await users.findOne({_id:usersId})
   const response={}
   console.log(getcart);
   if(getcart) {
    const cartItems = await users.aggregate([
      {
        $match: {_id:getcart._id}
      },
      {
        $lookup:{
          from:'products',
          let: {cart:getcart.Cart},    
          pipeline:[
            {
              $match:{
                $expr:{
                  $in:["$_id",{
                    $map:{
                      input:"$$cart",
                      as:"cartId",
                      in:{$toObjectId:"$$cartId"}
                       }
                  }]
                }
              }
            }
          ],
          as:'productDetails'
        }
      }
   ])
  console.log(cartItems);
  response.status=200
  response.ok=true
  response.message="Cart fetched succesfully"
  res.json({
    res:cartItems
  })
  }
// const getcart= await users.findOne({_id:req.body.userId})
} catch (error) {
  console.error('Invalid token:', error.message);
}
})

module.exports = router;
