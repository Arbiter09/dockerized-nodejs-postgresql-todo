import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";

const router = express.Router();

// Register a new user endpoint /auth/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Encrypt the password
  const hashedPassword = await bcrypt.hashSync(password, 8);

  // Save the new user and hashed password to the database
  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // now that we have a user, We want to add their first todo for them
    const defaultTodo = "Hello ;) Add your first TODO!";
    await prisma.todo.create({
      data: {
        task: defaultTodo,
        userId: user.id,
      },
    });

    // Create a token for the user
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.sendStatus(503);
  }

  console.log(username, password);
});

router.post("/login", async (req, res) => {
  // we get their email, and we look up the password associated with that email in the database
  // but we get it back and see it's encrypted, which means that we cannot compare it to the one the user just used trying to login
  // so what we can to do, is again, one way encrypt the password the user just entered, and compare it to the one in the database
  // if they match, we know the user entered the correct password

  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    // if the user doesn't exist
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // if the user exists, compare the password
    const isValid = bcrypt.compareSync(password, user.password);

    // if the password does not match , return out the function
    if (!isValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    console.log(user);
    // we have a valid user
    // create a token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(503);
  }
});

export default router;
