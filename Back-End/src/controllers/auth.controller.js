import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Cidadao, Trabalhador } from "../config/db.config.js";
import { genericError } from "../utils/error.utils.js";

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "admin@vcc.pt,admin.geral@example.pt")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const isAdminEmail = (email) => getAdminEmails().includes((email || "").trim());

const getResponsavelEmails = () =>
  (
    process.env.RESPONSAVEL_EMAILS ||
    process.env.RESPONSAVEL_EMAIL ||
    "responsavel.1@vcc.pt"
  )
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const isResponsavelEmail = (email) =>
  getResponsavelEmails().includes((email || "").trim());

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Try finding in Trabalhador first
    let user = await Trabalhador.findOne({
      where: { emailTrabalhador: email },
    });
    let userType = null;
    let userId = null;
    let credentials = null;

    if (user) {
      credentials = user.credenciaisTrabalhadores;
      userId = user.idTrabalhador;
      const isAdmin = isAdminEmail(user.emailTrabalhador);
      const isResponsavel = isResponsavelEmail(user.emailTrabalhador);
      userType = isAdmin
        ? "trabalhador_admin"
        : isResponsavel
          ? "trabalhador_responsavel"
          : "trabalhador";
    } else {
      // Try finding in Cidadao
      user = await Cidadao.findOne({ where: { email } });
      if (user) {
        credentials = user.credenciais;
        userId = user.idCidadao;
        userType = "cidadao";
      }
    }

    if (!user || !credentials) {
      return res.status(401).json({
        message: "Authentication failed. User not found or no password set.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, credentials);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Wrong password." });
    }

    const token = jwt.sign(
      {
        userId: userId,
        email: email,
        userType: userType,
      },
      "your_jwt_secret",
      { expiresIn: "15m" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId: userId,
      userType: userType,
    });
  } catch (error) {
    next(genericError("Error during login"));
  }
};
