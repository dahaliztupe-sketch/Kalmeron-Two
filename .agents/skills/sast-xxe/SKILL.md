---
name: sast-xxe
description: Detect XML External Entity (XXE) vulnerabilities in XML parsing code. Use when reviewing file upload handlers, document parsers, or any code that processes XML/SVG/DOCX/XLSX files. Covers file disclosure, SSRF via XXE, and denial of service.
---

# SAST: XML External Entity (XXE) Detection

Scan for XXE vulnerabilities — OWASP A05:2021 (Security Misconfiguration).

## What to Look For

### High Risk Patterns (Node.js)
```javascript
// ❌ VULNERABLE: libxmljs with entity expansion enabled
const doc = libxml.parseXmlString(userXml);

// ❌ VULNERABLE: xml2js with unresolved entities
import xml2js from 'xml2js';
const result = await xml2js.parseStringPromise(userXml);

// ❌ VULNERABLE: XLSX/DOCX processing (XML internally)
const workbook = XLSX.read(userBuffer); // may expand entities

// ❌ VULNERABLE: SVG processing without sanitization
// SVGs are XML — user-uploaded SVGs can contain XXE
const svg = fs.readFileSync(uploadedSvgPath);
res.setHeader('Content-Type', 'image/svg+xml');
res.send(svg); // serves arbitrary SVG including XXE payloads
```

### Attack Payload
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<user><name>&xxe;</name></user>
```

### Safe Patterns
```javascript
// ✅ SAFE: disable entity expansion
const parser = new DOMParser();
// Use a library with XXE disabled by default

// ✅ SAFE: use JSON instead of XML where possible

// ✅ SAFE: validate SVG uploads (strip DOCTYPE)
import DOMPurify from 'dompurify';
const cleanSvg = DOMPurify.sanitize(svgContent, { USE_PROFILES: { svg: true } });
```

## Kalmeron-Specific Checks
- `PDF Worker` (port 8000) — check Python XML parsing in PDF extraction
- Any Excel/Word file upload processing
- SVG avatar uploads in `app/api/user/avatar/route.ts`

## Scan Checklist

- [ ] No XML parsing libraries with default entity expansion
- [ ] SVG uploads sanitized with DOMPurify before serving/processing
- [ ] DOCX/XLSX processors run in sandboxed environment
- [ ] JSON API used instead of XML/SOAP where possible
- [ ] Python XML parsing uses `defusedxml` not built-in `xml.etree`

## Severity Matrix
| Pattern | Severity |
|---|---|
| XXE with file:// protocol | Critical |
| XXE for internal SSRF | High |
| Billion laughs DoS | High |
| SVG with external entity | High |

## Remediation
1. Disable DOCTYPE declarations in XML parsers
2. Disable external entity resolution
3. Use `defusedxml` in Python
4. Sanitize SVG uploads with DOMPurify
5. Prefer JSON over XML for API design
