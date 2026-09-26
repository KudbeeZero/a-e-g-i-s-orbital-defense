# Security Policy

## Supported Versions

| Version | Status |
|---------|--------|
| Latest  | ✅ Actively supported |
| Older   | ⚠️ No security updates |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities!**

If you discover a security vulnerability, please:

1. **Do not** post it in GitHub Issues
2. **Email** security details to the project maintainer (marked in commits)
3. **Include**:
   - A clear description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any proposed fix (optional)

4. **Expect** a response within 48 hours

## Security Considerations

### Frontend Security
- ✅ No sensitive data stored in localStorage (only game progress)
- ✅ TypeScript strict mode prevents many common vulnerabilities
- ✅ Radix UI components are accessible and secure by default
- ✅ No direct DOM manipulation (React handles HTML escaping)

### Backend (ICP)
- ⚠️ Backend is currently a stub (no live services yet)
- 🔐 Internet Identity handles authentication (proven secure)
- 🔐 ICP provides hardware-backed security

### Dependencies
- 📦 Regularly updated through Dependabot
- 🔍 No known high-severity vulnerabilities
- ✅ TypeScript prevents many runtime errors

## Best Practices

- Keep Node.js and pnpm up to date
- Run `pnpm audit` periodically
- Use HTTPS in production
- Monitor GitHub Security Advisories
- Don't commit `.env` files or secrets

## Deployment Security

- 🔐 Cloudflare Pages: Built-in DDoS protection, auto HTTPS
- 🔐 Vercel: Enterprise-grade security, auto scaling
- 🔐 GitHub Pages: HTTPS enforced, CDN-backed

---

Thank you for helping keep AEGIS secure! 🛡️
