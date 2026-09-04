"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ message: 'Username, email and password are required' });
            }
            if (password.length < 6) {
                return res.status(400).json({ message: 'Password must be at least 6 characters long' });
            }
            const result = await auth_service_1.AuthService.register({ username, email, password });
            return res.status(201).json(result);
        }
        catch (err) {
            return res.status(400).json({ message: err.message || 'Registration failed' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }
            const result = await auth_service_1.AuthService.login({ email, password });
            return res.status(200).json(result);
        }
        catch (err) {
            return res.status(401).json({ message: err.message || 'Login failed' });
        }
    }
    static async me(req, res) {
        return res.status(200).json({ user: req.user });
    }
}
exports.AuthController = AuthController;
