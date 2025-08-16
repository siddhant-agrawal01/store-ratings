import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { registerSchema, loginSchema, changePasswordSchema } from "../validators.js";

const sign = (user) => jwt.sign({
  id: user.id, email: user.email, role: user.role, name: user.name
}, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const hash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { ...data, password: hash, role: "USER" }
    });
    return res.json({ token: sign(user) });
  } catch (e) {
    return res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(data.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    return res.json({ token: sign(user) });
  } catch (e) {
    return res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Old password incorrect" });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
    res.json({ message: "Password updated" });
  } catch (e) {
    return res.status(400).json({ message: e.errors?.[0]?.message || e.message });
  }
};
