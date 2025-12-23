import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body);


    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token ,admin : admin.email});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
