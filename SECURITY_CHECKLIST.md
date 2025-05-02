# Security Checklist

This document outlines the security measures implemented in the **TimeCapsule Connect** project. 

## Authentication & Authorization
- **Passwords**: All passwords are hashed using `bcrypt` with at least 10 salt rounds.
- **JWT**: JSON Web Tokens (JWT) are used for secure authentication. Tokens expire after 15–30 minutes.
- **Role-Based Access Control (RBAC)**: Admin and regular user roles are enforced.

## Data Handling
- **Sensitive Data**: All sensitive data, such as passwords and JWT tokens, are **never** logged.
- **User Data**: Capsule data is private by default, only shared when explicitly intended.
- **Uploaded Files**: All uploaded files are sanitized to prevent XSS or malware.

## API & Web Server Security
- **Input Validation**: All user input is validated using `express-validator` to prevent SQL injection and XSS.
- **Helmet**: Security headers are added using `helmet()`, including `Content-Security-Policy` and `X-Content-Type-Options`.
- **CORS**: Only trusted origins are allowed to access the backend.
- **Rate Limiting**: API rate limiting is enforced using `express-rate-limit`.
- **Error Handling**: Error messages are generalized and do not expose stack traces or sensitive data.

## Infrastructure
- **Environment Variables**: `.env` files are not committed to version control.
- **Backups**: Regular backups are configured to prevent data loss.

## Dependency Management
- **NPM Audit**: Regular security audits are run on dependencies using `npm audit`.
- **Updates**: We actively monitor and update dependencies to patch any known vulnerabilities.

## Logging & Monitoring
- **Access Logs**: Sensitive access events (like login attempts) are logged.
- **Monitoring**: We use a monitoring solution to track uptime and security incidents.

## Contributing
- If you find any vulnerabilities or have suggestions, please refer to the [CONTRIBUTING.md](CONTRIBUTING.md).
