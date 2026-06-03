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

const isResponsavelEmail = (email) => {
  const e = (email || "").trim();
  if (!e) return false;
  const configured = getResponsavelEmails();
  if (configured.includes(e)) return true;
  // Fallback: treat any email starting with "responsavel." as a responsavel
  return e.toLowerCase().startsWith("responsavel.");
};

export const unifiedLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const loginEmail = email.trim();

    // 1. Try to find in Trabalhador table first
    let user = await Trabalhador.findOne({
      where: { emailTrabalhador: loginEmail },
    });

    let userType = null;
    let userId = null;
    let userEmail = null;
    let credentials = null;

    if (user) {
      const isAdmin = isAdminEmail(user.emailTrabalhador);
      const isResponsavel = isResponsavelEmail(user.emailTrabalhador);

      userType = isAdmin
        ? "trabalhador_admin"
        : isResponsavel
          ? "trabalhador_responsavel"
          : "trabalhador";
      userId = user.idTrabalhador;
      userEmail = user.emailTrabalhador;
      credentials = user.credenciaisTrabalhadores;
    } else {
      // 2. Try to find in Cidadao table
      user = await Cidadao.findOne({ where: { email: loginEmail } });
      if (user) {
        userType = "cidadao";
        userId = user.idCidadao;
        userEmail = user.email;
        credentials = user.credenciais;
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
        userId,
        email: userEmail,
        userType,
      },
      "your_jwt_secret",
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId,
      userType,
    });
  } catch (error) {
    console.error("Login error:", error);
    next(genericError("Error during login"));
  }
};
