/* eslint-disable @typescript-eslint/no-require-imports */
import OpenAI from "openai";
import dotenv from "dotenv";

import express from "express";

import cors from "cors";
import pool from "./db.js";

import nodemailer from "nodemailer";

const app = express();

import bcrypt from "bcryptjs";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(
  cors({
    origin: "https://rainbow-duckanoo-f31b80.netlify.app",
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

app.use(express.json());

dotenv.config();

console.log("API_KEY:", process.env.OPENAI_API_KEY);

console.log("API_KEY:", process.env.MYSQLPORT);
console.log("API_KEY:", process.env.MYSQLUSER);
console.log("API_KEY:", process.env.MYSQLPASSWORD);
console.log("API_KEY:", process.env.MYSQLDATABASE);
console.log("API_KEY:", process.env.MYSQLHOST);

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Продукт не найден" });
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      brand,
      releaseDate,
      rating,
      sellsAmount,
      color,
      image,
    } = req.body;

    const [result] = await pool.query(
      "INSERT INTO products (id, name, description, price, category, brand, releaseDate, rating, sellsAmount, color, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        name,
        description,
        price,
        category,
        brand,
        releaseDate,
        rating,
        sellsAmount,
        color,
        image,
      ]
    );

    res
      .status(201)
      .json({ id: result.insertId, message: "Товар успешно добавлен" });
  } catch (error) {
    console.error("Ошибка при добавлении товара:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    releaseDate,
    category,
    brand,
    rating,
    sellsAmount,
    color,
    image,
  } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE products SET name = ?, description = ?, price = ?, releaseDate = ?, category = ?, brand = ?, rating = ?, sellsAmount = ?, color = ?, image = ? WHERE id = ?",
      [
        name,
        description,
        price,
        releaseDate,
        category,
        brand,
        rating,
        sellsAmount,
        color,
        image,
        id,
      ]
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Продукт успешно обновлен" });
    } else {
      res.status(404).json({ message: "Продукт не найден" });
    }
  } catch (error) {
    console.error("Ошибка при обновлении продукта:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Продукт не найден" });
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/characteristics", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products_characteristics");
    res.json(rows);
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/characteristics/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM products_characteristics WHERE productId = ?",
      [id]
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Продукт не найден" });
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/comment", async (req, res) => {
  const { userId, productId, comment, commentRating } = req.body;

  try {
    const commentId = Date.now();
    const commentDate = new Date();

    await pool.query(
      "INSERT INTO users_comments (commentId, productId, userId, comment, commentRating, commentLikes, commentDislikes, commentDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [commentId, productId, userId, comment, commentRating, 0, 0, commentDate]
    );

    res.status(201).json({ message: "Comment saved successfully" });
  } catch (error) {
    console.error("Error saving comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/update-products/:id", async (req, res) => {
  const { id } = req.params;
  const { commentRating } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT rating, reviewAmounts FROM products WHERE id = ?",
      [id]
    );
    const product = rows[0];

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { rating, reviewAmounts } = product;
    const newReviewAmounts = reviewAmounts + 1;
    const newRating =
      (rating * reviewAmounts + commentRating) / newReviewAmounts;

    await pool.query(
      "UPDATE products SET rating = ?, reviewAmounts = ? WHERE id = ?",
      [newRating, newReviewAmounts, id]
    );

    res.status(200).json({ message: "Product rating updated successfully" });
  } catch (error) {
    console.error("Error updating product rating:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/update-comment/:id", async (req, res) => {
  const { id } = req.params;
  const { userId, like, dislike } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM comment_votes WHERE userId = ? AND commentId = ?",
      [userId, id]
    );

    if (rows.length > 0) {
      const previousVote = rows[0].voteType;

      if (like && previousVote === "like") {
        await pool.query(
          "UPDATE users_comments SET commentLikes = commentLikes - 1 WHERE commentId = ?",
          [id]
        );
        await pool.query(
          "DELETE FROM comment_votes WHERE userId = ? AND commentId = ?",
          [userId, id]
        );
        return res.status(200).json({ message: "Лайк убран" });
      }

      if (dislike && previousVote === "dislike") {
        await pool.query(
          "UPDATE users_comments SET commentDislikes = commentDislikes - 1 WHERE commentId = ?",
          [id]
        );
        await pool.query(
          "DELETE FROM comment_votes WHERE userId = ? AND commentId = ?",
          [userId, id]
        );
        return res.status(200).json({ message: "Дизлайк убран" });
      }

      if (like && previousVote === "dislike") {
        await pool.query(
          "UPDATE users_comments SET commentDislikes = commentDislikes - 1, commentLikes = commentLikes + 1 WHERE commentId = ?",
          [id]
        );
        await pool.query(
          "UPDATE comment_votes SET voteType = 'like' WHERE userId = ? AND commentId = ?",
          [userId, id]
        );
        return res
          .status(200)
          .json({ message: "Дизлайк убран, лайк добавлен" });
      }

      if (dislike && previousVote === "like") {
        await pool.query(
          "UPDATE users_comments SET commentLikes = commentLikes - 1, commentDislikes = commentDislikes + 1 WHERE commentId = ?",
          [id]
        );
        await pool.query(
          "UPDATE comment_votes SET voteType = 'dislike' WHERE userId = ? AND commentId = ?",
          [userId, id]
        );
        return res
          .status(200)
          .json({ message: "Лайк убран, дизлайк добавлен" });
      }
    } else {
      if (like) {
        await pool.query(
          "UPDATE users_comments SET commentLikes = commentLikes + 1 WHERE commentId = ?",
          [id]
        );
        await pool.query(
          "INSERT INTO comment_votes (userId, commentId, voteType) VALUES (?, ?, 'like')",
          [userId, id]
        );
        return res.status(200).json({ message: "Лайк добавлен" });
      }

      if (dislike) {
        await pool.query(
          "UPDATE users_comments SET commentDislikes = commentDislikes + 1 WHERE commentId = ?",
          [id]
        );
        await pool.query(
          "INSERT INTO comment_votes (userId, commentId, voteType) VALUES (?, ?, 'dislike')",
          [userId, id]
        );
        return res.status(200).json({ message: "Дизлайк добавлен" });
      }
    }
  } catch (error) {
    console.error("Ошибка при обновлении голосов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/comments/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const [comments] = await pool.query(
      "SELECT * FROM users_comments WHERE productId = ? ORDER BY commentId DESC",
      [productId]
    );

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/register", async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  try {
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE userEmail = ?",
      [userEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const userId = Date.now();

    await pool.query(
      "INSERT INTO users (userId, userName, userEmail, userPassword) VALUES (?, ?, ?, ?)",
      [userId, userName, userEmail, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: userId,
        name: userName,
        email: userEmail,
      },
    });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE userEmail = ?",
      [userEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
      userPassword,
      user.userPassword
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.userId,
        name: user.userName,
        email: user.userEmail,
        address: user.userAddress,
        postalCode: user.userPostalCode,
        phoneNumber: user.userPhoneNumber,
        notifications: user.userNotifications,
        bonusPoints: user.userBonusPoints,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");

    res.json(rows);
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE userId = ?", [
      id,
    ]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { userName, userEmail, userBonusPoints, userDiscount } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE userId = ?", [
      id,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query(
      "UPDATE users SET userName = ?, userEmail = ?, userBonusPoints = ?, userDiscount = ? WHERE userId = ?",
      [userName, userEmail, userBonusPoints, userDiscount, id]
    );

    res.json({ message: "Информация о пользователе успешно обновлена" });
  } catch (error) {
    console.error("Ошибка при обновлении информации о пользователе:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("DELETE FROM users WHERE userId = ?", [id]);

    if (rows.affectedRows > 0) {
      res.json({ message: "Пользователь успешно удален" });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/user-info", async (req, res) => {
  const {
    userId,
    userName,
    userEmail,
    userAddress,
    userPostalCode,
    userPhoneNumber,
  } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE userId = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query(
      "UPDATE users SET userName = ?, userEmail = ?, userAddress = ?, userPostalCode = ?, userPhoneNumber = ? WHERE userId = ?",
      [
        userName,
        userEmail,
        userAddress,
        userPostalCode,
        userPhoneNumber,
        userId,
      ]
    );

    res.status(200).json({
      message: "User info updated successfully",
    });
  } catch (error) {
    console.error("Error handling user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/user/user-discount", async (req, res) => {
  const { userId, bonusPoints, userDiscount } = req.body;

  try {
    const [userDiscountFromDB] = await pool.query(
      "SELECT userDiscount FROM users WHERE userId = ?",
      [userId]
    );
    if (
      userDiscountFromDB.length > 0 &&
      userDiscountFromDB[0].userDiscount > 0
    ) {
      return res.status(400).json({ error: "You have already got a discount" });
    }

    await pool.query(
      "UPDATE users SET userBonusPoints = userBonusPoints - ?, userDiscount = ? WHERE userId = ?",
      [bonusPoints, userDiscount, userId]
    );
    res.json({ message: "Bonus added successfully" });
  } catch (error) {
    console.error("Error adding bonus:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/user/add-bonus", async (req, res) => {
  const { userId, bonusPoints } = req.body;

  try {
    await pool.query(
      "UPDATE users SET userBonusPoints = userBonusPoints + ? WHERE userId = ?",
      [bonusPoints, userId]
    );
    res.json({ message: "Bonus added successfully" });
  } catch (error) {
    console.error("Error adding bonus:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/user/remove-discount", async (req, res) => {
  const { userId } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE users SET userDiscount = 0 WHERE userId = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "User not found or no discount applied" });
    }

    res.json({ message: "Discount removed successfully" });
  } catch (error) {
    console.error("Error removing discount:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/user-info/password", async (req, res) => {
  const { userId, userOldPassword, userPassword } = req.body;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE userId = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      userOldPassword,
      user.userPassword
    );
    if (!passwordMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);

    await pool.query("UPDATE users SET userPassword = ? WHERE userId = ?", [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({
      message: "User info updated successfully",
    });
  } catch (error) {
    console.error("Error handling user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/account/orders/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE userId = ?", [
      userId,
    ]);
    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [rows] = await pool.query("SELECT * FROM orders WHERE userId = ?", [
      userId,
    ]);
    res.json(rows);
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders");
    res.json(rows);
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/orders/stats", async (req, res) => {
  const { year, month, week } = req.query;

  try {
    let query = "SELECT COUNT(*) AS totalOrders FROM orders WHERE 1=1";
    const params = [];

    if (year) {
      query += " AND YEAR(orderDate) = ?";
      params.push(year);
    }

    if (month) {
      query += " AND MONTH(orderDate) = ?";
      params.push(month);
    }

    if (week) {
      query += " AND FLOOR((DAY(orderDate) - 1) / 7) + 1 = ?";
      params.push(week);
    }

    const [result] = await pool.query(query, params);

    res.json({
      message: "Количество заказов успешно получено",
      totalOrders: result[0].totalOrders,
    });
  } catch (error) {
    console.error("Ошибка при получении статистики заказов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.get("/orders/stats/amount", async (req, res) => {
  const { year, month, week } = req.query;

  try {
    let query = "SELECT SUM(totalPrice) AS totalAmount FROM orders WHERE 1=1";
    const params = [];

    if (year) {
      query += " AND YEAR(orderDate) = ?";
      params.push(year);
    }

    if (month) {
      query += " AND MONTH(orderDate) = ?";
      params.push(month);
    }

    if (week) {
      query += " AND FLOOR((DAY(orderDate) - 1) / 7) + 1 = ?";
      params.push(week);
    }

    const [result] = await pool.query(query, params);

    res.json({
      message: "Сумма заказов успешно получена",
      totalAmount: result[0].totalAmount || 0,
    });
  } catch (error) {
    console.error("Ошибка при получении суммы заказов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.put("/account/orders/:id", async (req, res) => {
  const { id } = req.params;
  const {
    userId,
    productsIds,
    productsCounts,
    orderDate,
    totalPrice,
    orderStatus,
    userAddress,
    userPhoneNumber,
    userName,
    userPostalCode,
    userEmail,
  } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE orders SET userId = ?, productsIds = ?, productsCounts = ?, orderDate = ?, totalPrice = ?, orderStatus = ?, userAddress = ?, userPhoneNumber = ?, userName = ?, userPostalCode = ?, userEmail = ? WHERE orderId = ?",
      [
        userId,
        productsIds,
        productsCounts,
        orderDate,
        totalPrice,
        orderStatus,
        userAddress,
        userPhoneNumber,
        userName,
        userPostalCode,
        userEmail,
        id,
      ]
    );

    if (result.affectedRows > 0) {
      res.json({ message: "Заказ успешно обновлен" });
    } else {
      res.status(404).json({ message: "Заказ не найден" });
    }
  } catch (error) {
    console.error("Ошибка при обновлении заказа:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.delete("/account/orders/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query("DELETE FROM orders WHERE orderId = ?", [
      id,
    ]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Заказ не найден" });
    }
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.post("/cart/create-checkout-session", async (req, res) => {
  try {
    const {
      productsWithQuantity,
      discount,
      shippingMethod,
      serviseCommission,
    } = req.body;

    const maxDiscountAmount = 2000;
    const totalAmount = productsWithQuantity.reduce((sum, product) => {
      return sum + product.price * product.quantity;
    }, 0);
    const discountAmount = (discount / 100) * totalAmount;
    const finalDiscountAmount = Math.min(discountAmount, maxDiscountAmount);

    const shipmentCost =
      shippingMethod === "free" ? 0 : shippingMethod === "regular" ? 7.5 : 22.5;

    const lineItems = productsWithQuantity.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: Math.floor(
          product.price * 100 -
            product.price * 100 * (finalDiscountAmount / totalAmount)
        ),
      },
      quantity: product.quantity,
    }));

    lineItems.push(
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.floor(shipmentCost * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Service Commission",
          },
          unit_amount: Math.floor(serviseCommission * 100),
        },
        quantity: 1,
      }
    );
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `https://rainbow-duckanoo-f31b80.netlify.app/cart/success?session_id={CHECKOUT_SESSION_ID}&subtotal=${totalAmount}&serviseCommission=${serviseCommission}`,
      cancel_url: "https://rainbow-duckanoo-f31b80.netlify.app/cart/error",
    });

    console.log("Stripe session created:", session);

    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

app.post("/cart/save-order", async (req, res) => {
  const {
    sessionId,
    userId,
    productsIds,
    productsCounts,
    discount,
    userAddress,
    userPhoneNumber,
    userName,
    userPostalCode,
    userEmail,
    subtotal,
    serviseCommission,
    shippingMethod,
  } = req.body;
  let amount_total, customer_details;

  const shipmentCost =
    shippingMethod === "free" ? 0 : shippingMethod === "regular" ? 7.5 : 22.5;

  try {
    if (/[a-zA-Z]/.test(sessionId)) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      amount_total = session.amount_total;
      customer_details = session.customer_details;
    }

    const orderData = {
      orderId: sessionId,
      userId: userId,
      productsIds: productsIds,
      productsCounts: productsCounts,
      orderDate: new Date(),
      totalPrice:
        amount_total !== undefined
          ? amount_total / 100
          : Math.floor(
              (1 - discount * 0.01) * Number(subtotal) +
                Number(serviseCommission) +
                shipmentCost
            ),
      userAddress: userAddress,
      userPhoneNumber: userPhoneNumber,
      userName: userName,
      userPostalCode: userPostalCode,
      userEmail: userEmail,
    };

    const [rows] = await pool.query(
      "SELECT orderId, orderDate, totalPrice FROM orders WHERE orderId = ?",
      [orderData.orderId]
    );

    if (rows.length > 0) {
      return res.json({
        message: "Order already exists",
        email: customer_details?.email || userEmail,
        orderDate: rows[0].orderDate,
        totalPrice: rows[0].totalPrice,
      });
    }

    await pool.query(
      "INSERT INTO orders (orderId, userId, productsIds, productsCounts, orderDate, totalPrice, userAddress, userPhoneNumber, userName, userPostalCode, userEmail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        orderData.orderId,
        orderData.userId,
        orderData.productsIds,
        JSON.stringify(orderData.productsCounts),
        orderData.orderDate,
        orderData.totalPrice,
        orderData.userAddress,
        orderData.userPhoneNumber,
        orderData.userName,
        orderData.userPostalCode,
        orderData.userEmail,
      ]
    );

    const productIdsArray = productsIds.split(",").map(Number);
    const productCountsArray = Array.isArray(productsCounts)
      ? productsCounts.map(Number)
      : [];

    if (productIdsArray.length !== productCountsArray.length) {
      return res.status(400).json({
        error: "Mismatch between product IDs and counts",
      });
    }

    const updateQueries = productIdsArray.map((productId, index) => {
      const count = productCountsArray[index];
      return pool.query(
        "UPDATE products SET sellsAmount = sellsAmount + ? WHERE id = ?",
        [count, productId]
      );
    });

    await Promise.all(updateQueries);

    res.json({
      message: "Order saved successfully",
      email:
        customer_details !== undefined ? customer_details.email : userEmail,
      orderDate: orderData.orderDate,
      amountTotal: orderData.totalPrice,
    });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/contact-us/submit", async (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "illadmitrenko666@gmail.com",
      pass: "eiav cuyc fizp munq",
    },
  });

  const mailOptions = {
    from: '"Form Submission" <illadmitrenko666@gmail.com>',
    to: "illadmitrenko666@gmail.com",
    subject: "New Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Error sending email");
  }
});

app.post("/delete-user", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE userId = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.query("DELETE FROM users WHERE userId = ?", [id]);

    res.json({ message: "User deleted successfully", deletedUser: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/message", async (req, res) => {
  try {
    console.log("Received request:", req.body);
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: req.body.message }],
      model: "gpt-4o-mini",
    });

    res.status(200).send({
      status: "Message received",
      received: chatCompletion.choices[0].message.content,
    });
    res.end();
  } catch (e) {
    res.write("An error occurred");
    res.end();
    console.error(e);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
