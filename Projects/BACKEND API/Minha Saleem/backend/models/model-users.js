const mongoose = require('mongoose')

const users =mongoose.model("users",{
    Email:{
        type:String,
        require:true
    },
    Password:{
        type:String,
        require:true
    },
    Cart:{
        type:Array,
        require:true
    }
})

module.exports=users;