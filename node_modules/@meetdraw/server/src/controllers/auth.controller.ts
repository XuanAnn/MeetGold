import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      const result = await AuthService.register({ username, email, password });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message || 'Registration failed' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await AuthService.login({ email, password });
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(401).json({ message: err.message || 'Login failed' });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({ user: req.user });
  }
}
