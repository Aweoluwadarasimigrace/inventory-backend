const jwt = require("jsonwebtoken");
const Auth = require("../model/auth.model");

const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await Auth.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};


const verifyIsAdmin = (req,res,next)=>{
   if(req.user.role !== "admin"){
     return res.status(403).json({ message: "Access denied. Admins only." });
   }
   next()
}
module.exports = { verifyToken, verifyIsAdmin };
