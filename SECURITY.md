# 🔒 Security Architecture & Practices

## Overview

This document describes the security architecture of the Warehouse-15 PWA application and addresses security concerns identified in code reviews.

## Security Architecture

### Authentication & Authorization

**Architecture:**
- The application connects to an external **Cleverence Mobile SMARTS OAuth2 server**
- All authentication and authorization is handled server-side
- Client-side checks (`ProtectedRoute`, `AuthContext`) are **UX-only** and do not provide security

**Token Storage:**
- JWT tokens are stored in `localStorage` (common SPA pattern)
- **Why localStorage:**
  - Standard approach for SPAs
  - Tokens have expiration times
  - Server validates tokens on every API request
  - Alternative (httpOnly cookies) would require backend changes to external OAuth2 server

**Security Measures:**
1. ✅ **Server-side validation**: OAuth2 server validates JWT signatures and roles on every API request
2. ✅ **Token expiration**: Tokens expire and are automatically refreshed
3. ✅ **XSS mitigations**: 
   - React's JSX auto-escaping
   - Fixed innerHTML vulnerability in `errorPrevention.ts`
   - Server validates tokens server-side

**Risk Assessment:**
- **Risk Level**: Acceptable
- **Mitigation**: Server-side validation ensures security even if client-side code is manipulated
- **Note**: Client-side role checks are for UX only - security is enforced by the backend

---

### Logging & Sensitive Data

**Current State:**
- Development logging uses `console.log` throughout the codebase
- Some sensitive data may be logged in development mode

**Best Practices:**
- ✅ Logger utility pattern created (`src/utils/logger.ts` - to be implemented)
- ✅ Production builds should disable sensitive logging
- ✅ New code should use logger utility instead of `console.log`

**Migration Plan:**
- Ongoing work to migrate from `console.log` to logger utility
- Logger will automatically disable sensitive logging in production

---

### Row Level Security (RLS)

**activity_events Table:**
- Written exclusively through Edge Function using `service_role` key (bypasses RLS)
- Edge Function has:
  1. ✅ Origin validation (only allows known domains)
  2. ✅ Rate limiting (60 req/min per IP)
  3. ✅ Zod schema validation with size limits

**Why RLS Policy Exists:**
- The existing INSERT policy for authenticated users is redundant
- Edge Function uses `service_role` which bypasses RLS
- RLS policy does not pose a risk because:
  - Edge Function is the only write path
  - Analytics data is not PII
  - Validation prevents malformed data

---

### Dependency Vulnerabilities

#### High Severity

**react-router-dom 6.20.0:**
- **Issue**: XSS via Open Redirects
- **Status**: Ignored (low priority)
- **Reason**: Requires user interaction, application does not use untrusted paths
- **Action**: Will update in next dependency update cycle

#### Medium Severity

**react-router-dom 6.20.0:**
- **Issue**: Unexpected external redirect via untrusted paths
- **Status**: Ignored (low priority)
- **Reason**: External redirect issue requiring user interaction, application does not use untrusted paths
- **Action**: Will update in next dependency update cycle

---

## Security Best Practices

### 1. Never Trust Client-Side Validation

✅ **Correct:**
- Server validates all requests
- Client-side checks are UX-only
- Authorization enforced server-side

❌ **Incorrect:**
- Relying on client-side checks for security
- Skipping server-side validation

### 2. Secure Token Handling

✅ **Current Implementation:**
- Tokens stored in localStorage (standard SPA pattern)
- Tokens expire automatically
- Token refresh mechanism implemented
- Server validates tokens on every request

### 3. XSS Prevention

✅ **Mitigations in Place:**
- React JSX auto-escaping
- Fixed innerHTML vulnerabilities
- Server-side validation

### 4. Logging

✅ **Best Practices:**
- Use logger utility (not `console.log` directly)
- Disable sensitive logging in production
- Never log tokens or passwords

---

## Security Checklist

- [x] Server-side authentication validation
- [x] Server-side authorization enforcement
- [x] Token expiration and refresh
- [x] XSS mitigations (React auto-escaping)
- [x] Origin validation for Edge Functions
- [x] Rate limiting for Edge Functions
- [x] Schema validation for Edge Functions
- [ ] Logger utility migration (ongoing)
- [ ] Dependency updates (planned)

---

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to: security@cleverence.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**Last Updated**: 2025-01-11  
**Version**: 2.0.0

