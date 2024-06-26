// KB a créé les routes signup et signin
var express = require('express');
var router = express.Router();

const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');


router.get('/', (req, res) => {
  User.find().then(data => {
    res.json({ result: true, data: data });
  });
})


router.post('/signup', (req, res) => {
  // CheckBody functions checks that there are fields username, email and passwords in req.body
  if (!checkBody(req.body, [
    'username',
    'email', 
    'password', 
    'city',  
  ])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  let valueOfIsDogOwner = true;
  if (req.body.isDogOwner === true || req.body.isDogOwner === false){
    valueOfIsDogOwner = req.body.isDogOwner;
  } 

  let valueOfIsProfessional = false;
  if (req.body.isProfessional === true || req.body.isProfessional === false){
    valueOfIsProfessional = req.body.isProfessional;
  } 
  

  // Check if the user has not already been registered
  User.findOne({ email: req.body.email }).then(data => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
      const token = uid2(32);

      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: token,
        firstname: "",
        lastname: "",
        birthdate: new Date,
        city: req.body.city,
        dateCreated: new Date,
        dateModified: new Date,
        isDogOwner: valueOfIsDogOwner,
        isProfessional: valueOfIsProfessional,
        isDeactivated: false,
        photos: [],
      });
      console.log("new user", newUser)

      newUser.save().then(newDoc => {
        res.json({
          result: true,
          response: {
            isConnect: true,
            username: newDoc.username,
            userID:newDoc.userID,
            email: newDoc.email,
            isDogOwner: newDoc.isDogOwner,
            isProfessional: newDoc.isProfessional,
            city: newDoc.city,
            token: newDoc.token,
          },
        });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, user: {
      isConnect : true,
      username : data.username,
      userID: data._id,
      email : data.email,
      isDogOwner : data.isDogOwner,
      isProfessional : data.isProfessional,
      city : data.city,
      token: data.token }});
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

// update user
router.put("/updateUser/:userID", async (req, res) => {
   try {
    const userID = req.params.userID;
    const update = req.body;
    console.log("Reception infoUser du Frontend",update);
    const options = { new: true }; // Pour retourner le document modifié

    const updatedUser = await User.findOneAndUpdate({ _id: userID }, update, options);
     console.log("UpdateUser, retour updatedUser", updatedUser);   
     if (!updatedUser) {
        return res.json({ result: false, error: "updateuser pb" });  
     }    
      return res.json({ result: true, user: updatedUser });;
        } catch (error){
          res.json({ result: false, error});
        }
      });


module.exports = router;