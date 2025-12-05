// src/security/sanitization.js

/**
 * PREVENÇÃO DE XSS (Cross-Site Scripting)
 * Sanitiza inputs do usuário para prevenir injeção de scripts
 */

// Lista de tags HTML perigosas
const DANGEROUS_TAGS = [
  'script', 'iframe', 'object', 'embed', 'link', 
  'style', 'form', 'input', 'button', 'meta'
];

// Lista de atributos perigosos
const DANGEROUS_ATTRIBUTES = [
  'onclick', 'onload', 'onerror', 'onmouseover', 
  'onfocus', 'onblur', 'onchange', 'href', 'src'
];

/**
 * Remove tags HTML potencialmente perigosas
 */
export const sanitizeHTML = (html) => {
  if (!html) return '';
  
  let sanitized = String(html);
  
  // Remove tags perigosas
  DANGEROUS_TAGS.forEach(tag => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    sanitized = sanitized.replace(new RegExp(`<${tag}[^>]*>`, 'gi'), '');
  });
  
  // Remove atributos perigosos
  DANGEROUS_ATTRIBUTES.forEach(attr => {
    const regex = new RegExp(`${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove javascript: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, '');
  
  return sanitized;
};

/**
 * Escapa caracteres especiais para prevenir XSS
 */
export const escapeHTML = (text) => {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * PREVENÇÃO DE SQL INJECTION
 * Valida e sanitiza inputs antes de queries
 */

// Caracteres perigosos para SQL
const SQL_DANGEROUS_CHARS = /['";\\--]/g;

/**
 * Escapa caracteres perigosos em strings SQL
 */
export const escapeSQLString = (str) => {
  if (!str) return '';
  return String(str).replace(/'/g, "''").replace(/\\/g, '\\\\');
};

/**
 * Valida se string contém tentativa de SQL injection
 */
export const detectSQLInjection = (input) => {
  if (!input) return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION\s+SELECT)/i,
    /(;\s*DROP)/i,
    /(--|\#|\/\*)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * VALIDAÇÃO DE DADOS
 */

export const validators = {
  // Email
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  // CPF
  cpf: (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    
    // Valida dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;
    
    return true;
  },
  
  // Telefone
  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },
  
  // Senha forte
  strongPassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  },
  
  // Coordenadas geográficas
  coordinates: (lat, lng) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    return (
      !isNaN(latNum) && !isNaN(lngNum) &&
      latNum >= -90 && latNum <= 90 &&
      lngNum >= -180 && lngNum <= 180
    );
  },
  
  // URL segura
  url: (url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
};

/**
 * Sanitiza dados de ocorrência
 */
export const sanitizeOccurrenceData = (data) => {
  return {
    description: escapeHTML(sanitizeHTML(data.description)),
    type: ['Crime', 'Acidente', 'Outro'].includes(data.type) ? data.type : 'Outro',
    coord: validators.coordinates(data.coord?.lat, data.coord?.lng) 
      ? data.coord 
      : null
  };
};

/**
 * Sanitiza dados de usuário
 */
export const sanitizeUserData = (data) => {
  const sanitized = {
    name: escapeHTML(data.name),
    email: data.email.toLowerCase().trim(),
    phone: data.phone.replace(/\D/g, ''),
    cpf: data.cpf.replace(/\D/g, '')
  };
  
  // Valida dados
  if (!validators.email(sanitized.email)) {
    throw new Error('Email inválido');
  }
  
  if (!validators.cpf(sanitized.cpf)) {
    throw new Error('CPF inválido');
  }
  
  if (!validators.phone(sanitized.phone)) {
    throw new Error('Telefone inválido');
  }
  
  return sanitized;
};

/**
 * Rate Limiting - Previne ataques de força bruta
 */
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove requisições antigas
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }
  
  reset(identifier) {
    this.requests.delete(identifier);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Content Security Policy Headers
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.openrouter.ai https://openrouter.ai",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};