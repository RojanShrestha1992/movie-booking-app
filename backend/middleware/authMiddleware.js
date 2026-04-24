// check if user is authenticated
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//verify token and get user from token
const verifyToken = async (req, res, next) => {
  //get token from header
  try {
    const authHeader = req.headers.authorization;
    //2. check if token is present
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }
    //3. extract token from header
    const token = authHeader.split(" ")[1];
    // 4. verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //decode contains user id, fetch user from database
    //5. find user by id and attach to request object
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    //6. if user not found, return error
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found, authorization denied" });
    }
    //7. attach user to request object
    req.user = user;
    //8. call next middleware
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token is not valid, authorization denied" });
  }
};

// verify admin role after verifytoken middleware
const verifyAdmin = (req, res, next) => {
  // check if user is admin
  if (req.user && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
