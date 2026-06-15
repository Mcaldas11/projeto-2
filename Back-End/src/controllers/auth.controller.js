import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Cidadao, Trabalhador } from "../config/db.config.js";
import { genericError } from "../utils/error.utils.js";

// Retrieve admin list Configuration
const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "admin@vcc.pt,admin.geral@example.pt,admin_e2e_test@vcc.pt")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

// Validate admin status Authorization 
const isAdminEmail = (email) => getAdminEmails().includes((email || "").trim());

// Retrieve manager list Configuration
const getResponsavelEmails = () =>
  (
    process.env.RESPONSAVEL_EMAILS ||
    process.env.RESPONSAVEL_EMAIL ||
    "responsavel.1@vcc.pt"
  )
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

// Validate manager status Authorization
const isResponsavelEmail = (email) => {
  const e = (email || "").trim();
  if (!e) return false;
  const configured = getResponsavelEmails();
  if (configured.includes(e)) return true;
  return e.toLowerCase().startsWith("responsavel.");
};

// Unified Login logic Authentication
export const unifiedLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Payload validation Sanitization
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const loginEmail = email.trim();

    // Search for worker account Database Query
    let user = await Trabalhador.findOne({
      where: { emailTrabalhador: loginEmail },
    });

    let userType = null;
    let userId = null;
    let userEmail = null;
    let credentials = null;

    if (user) {
      // Role detection Authorization
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
      // Search for citizen account Database Query
      user = await Cidadao.findOne({ where: { email: loginEmail } });
      if (user) {
        userType = "cidadao";
        userId = user.idCidadao;
        userEmail = user.email;
        credentials = user.credenciais;
      }
    }

    // Verify user existence Validation
    if (!user || !credentials) {
      return res.status(401).json({
        message: "Authentication failed. User not found or no password set.",
      });
    }

    // Password hash verification Hashing
    const isPasswordCorrect = await bcrypt.compare(password, credentials);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Wrong password." });
    }

    // Generate access token JWT
    const token = jwt.sign(
      {
        userId,
        email: userEmail,
        userType,
      },
      "your_jwt_secret",
      { expiresIn: "24h" },
    );

    // Send token response DTO
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
