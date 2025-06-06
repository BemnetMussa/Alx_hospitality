import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel";

// Sign up a user
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  console.log(req.body);

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .json({ token, user: { name: newUser.name, email: newUser.email } });

    console.log("user", newUser);
  } catch (error) {
    res.status(500).json({ message: "Error during sign-up" });
  }
};

// Login a user
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Error during login" });
  }
};
