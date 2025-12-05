// src/security/middleware.js
import { XSSPrevention, SQLInjectionPrevention } from './prevention.js';
import { hasPermission } from './roles.js';

/**
 * Middleware de autenticação
 */
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware de autorização
 */
export const authorize = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        required_permission: permission 
      });
    }
    
    next();
  };
};

/**
 * Middleware de sanitização automática
 */
export const sanitize = (req, res, next) => {
  // Sanitiza query params
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        // Detecta ataques
        if (SQLInjectionPrevention.detect(value) || XSSPrevention.detect(value)) {
          return res.status(400).json({ 
            error: 'Input malicioso detectado',
            field: key 
          });
        }
        req.query[key] = XSSPrevention.sanitizeFormInput(value);
      }
    }
  }
  
  // Sanitiza body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

// Função auxiliar para sanitizar objetos recursivamente
function sanitizeObject(obj) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = XSSPrevention.sanitizeFormInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Middleware de headers de segurança
 */
export const securityHeaders = (req, res, next) => {
  // CSP
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://unpkg.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openrouter.ai; " +
    "font-src 'self' data:; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'; " +
    "upgrade-insecure-requests"
  );
  
  // Outros headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

export default {
  authenticate,
  authorize,
  sanitize,
  securityHeaders
};