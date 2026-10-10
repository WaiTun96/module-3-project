import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Request Header ထဲမှ Authorization Bearer Token ကို ရယူခြင်း
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    // Token မှန်မမှန် စစ်ဆေးခြင်း
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId: "..." }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed or expired" });
  }
};