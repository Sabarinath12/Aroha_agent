# Security Measures

This document outlines the security measures implemented to protect the application and prevent API abuse.

## API Protection

### 1. Rate Limiting

**Session Creation Endpoint** (`/api/session`)
- **Limit**: 5 requests per 15 minutes per IP address
- **Purpose**: Prevents abuse of OpenAI Realtime API session creation
- **Cost Protection**: Limits potential unauthorized API costs
- **Implementation**: `express-rate-limit` middleware with IP-based tracking

**General API Endpoints** (all `/api/*` routes)
- **Limit**: 30 requests per minute per IP address
- **Purpose**: Prevents general API abuse and DDoS attempts
- **Implementation**: Applied globally to all API routes

### 2. Request Monitoring & Logging

All API requests are logged with:
- IP address
- Request method and path
- Response status code
- Request duration
- JSON response (truncated for security)

**Security Events Logged**:
- Session creation attempts
- Rate limit violations
- Failed session creations
- Successful session creations

**Log Format**: `[Security]` prefix for security-related events

### 3. CORS Protection

**Same-Origin Policy**:
- Only requests from the same domain are allowed
- Cross-origin requests from external sites are blocked
- Prevents unauthorized websites from using your API

**Origin Validation**:
- Strict hostname matching using URL parsing
- Prevents subdomain/superdomain attacks (e.g., `evil.com.attacker.net`)
- Invalid origin URLs are rejected and logged
- Unauthorized preflight requests return 403 Forbidden

**Allowed Origins**:
- Same-origin requests only (exact hostname match)
- No wildcard `*` origins allowed
- No substring-based matching (strict equality check)

### 4. Security Headers

All responses include security headers:

- **X-Frame-Options: DENY**
  - Prevents clickjacking attacks
  - Prevents the app from being embedded in iframes

- **X-Content-Type-Options: nosniff**
  - Prevents MIME type sniffing attacks
  - Forces browsers to respect declared content types

- **X-XSS-Protection: 1; mode=block**
  - Enables XSS filtering in older browsers
  - Blocks pages when XSS detected

- **Strict-Transport-Security** (production only)
  - Forces HTTPS connections
  - Prevents man-in-the-middle attacks

- **Permissions-Policy**
  - Microphone: Allowed (required for voice features)
  - Camera: Blocked (not needed)
  - Geolocation: Blocked (not needed)

## API Key Security

### OpenAI API Key

**Storage**:
- Stored securely in environment variables (`OPENAI_API_KEY`)
- Never exposed to frontend code
- Only accessible to backend server

**Usage**:
- Used to generate ephemeral session keys (60-second TTL)
- Ephemeral keys are provided to frontend for WebRTC connections
- Frontend never has access to the permanent API key

**Protection Methods**:
1. Backend-only access to permanent API key
2. Ephemeral keys expire after 60 seconds
3. Rate limiting on session creation endpoint
4. Request logging for audit trail

### Google Maps API Key

**Storage**:
- Stored in environment variables (`VITE_GOOGLE_MAPS_API_KEY`)
- Exposed to frontend (required for Maps API)

**Recommended Protection** (configure in Google Cloud Console):
1. Add domain restrictions (only allow your domain)
2. Add API restrictions (only allow Maps JavaScript API)
3. Set up usage quotas and alerts
4. Enable billing alerts

## Production Configuration

### Proxy Trust Settings

**Development**:
- Proxy trust disabled
- Direct connections only

**Production**:
- Proxy trust enabled (`app.set('trust proxy', 1)`)
- Properly detects client IPs behind load balancers
- Required for accurate rate limiting
- Required for HSTS enforcement

### HTTPS Enforcement

In production environments:
- Strict-Transport-Security header is enabled
- Forces HTTPS connections for 1 year
- Includes subdomains
- Requires reverse proxy to terminate TLS

## Best Practices

### For Deployment

1. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use Replit Secrets or similar for production
   - Rotate API keys regularly

2. **Proxy Configuration**:
   - Ensure reverse proxy (nginx, cloudflare) properly sets X-Forwarded-* headers
   - Verify `trust proxy` setting matches your infrastructure
   - Test IP detection in production

3. **Monitoring**:
   - Review security logs regularly
   - Set up alerts for rate limit violations
   - Monitor API usage and costs
   - Watch for CORS rejection patterns

4. **Google Maps API**:
   - Configure domain restrictions in Google Cloud Console
   - Set up billing alerts to prevent unexpected charges
   - Enable only required APIs

5. **Rate Limits**:
   - Adjust rate limits based on legitimate usage patterns
   - Consider implementing user authentication for higher limits
   - Monitor rate limit violations

### For Users

1. **API Keys**:
   - Keep your OpenAI API key secret
   - Never share your API keys
   - Use separate keys for development and production

2. **Monitoring**:
   - Check OpenAI usage dashboard regularly
   - Set up billing alerts
   - Monitor for unusual activity

## Incident Response

If you suspect API abuse:

1. **Immediate Actions**:
   - Check server logs for suspicious activity
   - Review rate limit violation logs
   - Check OpenAI usage dashboard

2. **Mitigation**:
   - Reduce rate limits if needed
   - Block specific IP addresses if necessary
   - Rotate API keys if compromised

3. **Investigation**:
   - Review security logs (`[Security]` prefix)
   - Check for unusual request patterns
   - Verify all API costs

## Security Checklist

- [x] Rate limiting on session creation endpoint
- [x] General API rate limiting
- [x] CORS protection enabled
- [x] Security headers configured
- [x] Request logging and monitoring
- [x] API keys stored in environment variables
- [x] Ephemeral session keys used for WebRTC
- [ ] Google Maps API domain restrictions (configure in Google Cloud Console)
- [ ] Billing alerts configured (configure in OpenAI dashboard)
- [ ] Regular security log reviews (ongoing maintenance)

## Rate Limit Response

When rate limits are exceeded, clients receive:

```json
{
  "error": "Too many session requests. Please wait before trying again.",
  "retryAfter": 900
}
```

Status Code: `429 Too Many Requests`

Headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in window
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)

## Support

For security concerns or to report vulnerabilities, check server logs and monitor API usage in:
- OpenAI Dashboard: https://platform.openai.com/usage
- Google Cloud Console: https://console.cloud.google.com
