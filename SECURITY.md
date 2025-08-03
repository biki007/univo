# Security Policy

## Supported Versions

We actively support the following versions of Univio with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The Univio team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@univio.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Security Features

### Authentication & Authorization

- **Multi-factor Authentication**: Support for TOTP, SMS, and biometric authentication
- **OAuth Integration**: Secure integration with Google, GitHub, Microsoft, and other providers
- **Session Management**: Secure session handling with automatic timeout
- **Role-Based Access Control**: Granular permissions system

### Data Protection

- **End-to-End Encryption**: All meeting data encrypted in transit and at rest
- **Quantum-Safe Cryptography**: Future-proof encryption algorithms
- **Zero-Knowledge Architecture**: Server cannot access user meeting content
- **Data Minimization**: Only necessary data is collected and stored

### Infrastructure Security

- **HTTPS Everywhere**: All connections use TLS 1.3
- **Content Security Policy**: Strict CSP headers to prevent XSS
- **Secure Headers**: HSTS, X-Frame-Options, and other security headers
- **Input Validation**: Comprehensive input sanitization and validation

### WebRTC Security

- **DTLS Encryption**: All WebRTC traffic encrypted with DTLS
- **TURN Server Security**: Secure relay servers with authentication
- **Media Encryption**: SRTP encryption for all audio/video streams
- **Connection Validation**: Strict ICE candidate validation

### Database Security

- **Row Level Security**: Supabase RLS policies for data isolation
- **Encrypted Storage**: Database encryption at rest
- **Connection Security**: Encrypted database connections
- **Audit Logging**: Comprehensive security event logging

## Security Best Practices

### For Developers

1. **Keep Dependencies Updated**: Regularly update all dependencies
2. **Code Review**: All code changes require security review
3. **Static Analysis**: Use ESLint security rules and other static analysis tools
4. **Environment Variables**: Never commit secrets to version control
5. **Principle of Least Privilege**: Grant minimum necessary permissions

### For Users

1. **Strong Passwords**: Use unique, complex passwords
2. **Enable 2FA**: Always enable two-factor authentication
3. **Keep Software Updated**: Use the latest version of the application
4. **Secure Networks**: Avoid using public Wi-Fi for sensitive meetings
5. **Meeting Security**: Use waiting rooms and passwords for sensitive meetings

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported via security@univio.com
2. **Day 1-2**: Initial response and acknowledgment
3. **Day 3-7**: Vulnerability assessment and reproduction
4. **Day 8-30**: Development of fix and testing
5. **Day 31-45**: Coordinated disclosure and patch release
6. **Day 46+**: Public disclosure (if appropriate)

## Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed and fixed. Users will be notified through:

- Email notifications (for registered users)
- Security advisories on GitHub
- Release notes and changelog
- In-app notifications (for critical updates)

## Bug Bounty Program

We are planning to launch a bug bounty program in the future. Details will be announced on our website and security page.

## Compliance

Univio is designed to meet various compliance requirements:

- **GDPR**: European data protection regulation compliance
- **CCPA**: California Consumer Privacy Act compliance
- **SOC 2**: Security, availability, and confidentiality controls
- **HIPAA**: Healthcare data protection (enterprise plans)

## Security Audits

We conduct regular security audits including:

- **Penetration Testing**: Third-party security assessments
- **Code Audits**: Regular security code reviews
- **Dependency Scanning**: Automated vulnerability scanning
- **Infrastructure Audits**: Cloud security assessments

## Contact Information

For security-related questions or concerns:

- **Email**: security@univio.com
- **PGP Key**: Available on request
- **Response Time**: Within 48 hours

For general support:
- **Email**: support@univio.com
- **Discord**: [Univio Community](https://discord.gg/univio)

## Acknowledgments

We would like to thank the following security researchers who have helped improve Univio's security:

- [Security researchers will be listed here after responsible disclosure]

---

**Last Updated**: January 2025
**Version**: 1.0

Thank you for helping keep Univio and our users safe!