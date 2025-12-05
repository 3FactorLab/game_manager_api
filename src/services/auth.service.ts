/**
 * @file auth.service.ts
 * @description Handles all authentication-related business logic: registration, login, token management, and profile updates.
 */
import { User, IUser, UserRole } from "../models";
import RefreshToken from "../models/refreshToken.model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env";
import { JwtPayload } from "../middleware";
import { RegisterUserDto, UpdateUserDto } from "../dtos";
import { hashPassword, comparePassword } from "../utils/password.util";
import { AppError } from "../utils/AppError";
import { deleteFile } from "./file.service";

// Helper to generate random token
const generateRefreshToken = (userId: string, ipAddress?: string) => {
  return new RefreshToken({
    user: userId,
    token: crypto.randomBytes(40).toString("hex"),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdByIp: ipAddress,
  });
};

// Registration Logic
// Destination: Used by AuthController.register (src/controllers/auth.controller.ts).
// Validates input, hashes password, and creates a new user.
// Enforces 'USER' role by default for security.
export const registerUser = async (userData: RegisterUserDto) => {
  const { username, email, password, role } = userData;

  if (!password) {
    throw new AppError("Password is required", 400);
  }

  // Encriptar
  const hashedPassword = await hashPassword(password);

  // Crear y guardar
  // Permitimos rol personalizado si se envía, sino por defecto USER
  const user = new User({
    username,
    email,
    password: hashedPassword,
    // Force USER role for public registration
    role: UserRole.USER,
  });

  return await user.save();
};

// Login Logic
// Destination: Used by AuthController.login (src/controllers/auth.controller.ts).
// Verifies credentials and generates a pair of Access/Refresh tokens.
export const loginUser = async (
  email: string,
  password: string,
  ipAddress?: string
) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError("Credenciales inválidas", 401);

  if (!user.password) throw new AppError("User has no password", 400);

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new AppError("Credenciales inválidas", 401);

  // Generar Access Token
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  // Generar Refresh Token
  const refreshToken = generateRefreshToken(user._id.toString(), ipAddress);
  await refreshToken.save();

  return {
    token,
    refreshToken: refreshToken.token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

// Refresh Token Logic (Rotation)
// Destination: Used by AuthController.refreshToken (src/controllers/auth.controller.ts).
// Implements Refresh Token Rotation strategy for enhanced security.
// Revokes the old refresh token and issues a new pair.
export const refreshTokenService = async (
  token: string,
  ipAddress?: string
) => {
  const refreshToken = await RefreshToken.findOne({ token });

  if (!refreshToken || !refreshToken.isActive) {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await User.findById(refreshToken.user);
  if (!user) throw new AppError("User not found", 404);

  // Revocar el token actual (Rotación)
  refreshToken.revoked = new Date();
  refreshToken.replacedByToken = "new_token_generated"; // Placeholder or actual new token
  await refreshToken.save();

  // Generar nuevos tokens
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
  const newAccessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  const newRefreshToken = generateRefreshToken(user._id.toString(), ipAddress);
  await newRefreshToken.save();

  // Update the link
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken.token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

// Update Logic
// Destination: Used by AuthController.updateUser (src/controllers/auth.controller.ts).
// Updates user profile data and handles profile picture replacement.
// Uses FileService to clean up old images.
export const updateUserProfile = async (
  userId: string,
  updateData: UpdateUserDto,
  imagePath?: string
) => {
  // 1. Buscar el usuario actual para ver si tiene foto vieja
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const updates: UpdateUserDto & { profilePicture?: string } = {
    ...updateData,
  };
  if (imagePath) {
    updates.profilePicture = imagePath;
  }

  if (updates.profilePicture && user.profilePicture) {
    //borrar la foto vieja usando el servicio desacoplado
    await deleteFile(user.profilePicture);
  }

  // Encriptar contraseña si viene en el update
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }
  // { new: true } devuelve el usuario actualizado
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

// Delete User
// Destination: Used by AuthController.deleteUser (src/controllers/auth.controller.ts).
export const deleteUserById = async (userId: string) => {
  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) throw new AppError("User not found", 404);
  return deletedUser;
};
