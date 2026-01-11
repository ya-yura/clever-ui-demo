# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** create a public GitHub issue.

Instead, please email security concerns to: **security@cleverence.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Architecture

This application uses:
- **External OAuth2 server** (Cleverence Mobile SMARTS) for authentication
- **Server-side validation** on all API requests
- **Client-side checks** are UX-only and do not provide security

See [SECURITY.md](../SECURITY.md) for detailed security architecture documentation.

