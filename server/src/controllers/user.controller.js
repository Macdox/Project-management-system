const user = require("../models/user");


//ADMIN: get all users
exports.getAllUsers = async (req, res) => {
  const users = await user.find().select("-password -refreshToken");
  res.json(users);
};
