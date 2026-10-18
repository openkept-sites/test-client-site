# Test Client Ltd site (test client site)

**This is a test client site, not a real firm.** Test Client Ltd is fictional. Openkept uses this
repository to exercise ok's website change flow end to end: ok opens a pull request with a client's
requested change, Vercel builds a preview, the client and Openkept approve, and a person merges.

- Astro static site. Text lives in `src/pages/*.astro` and `src/pages/*.md`; news posts in
  `src/content/blog/*.md`; photos in `public/images/`.
- `npm ci`, then `npm run build` (builds to `dist/`) and `npm run qa` (axe-core WCAG 2 A/AA plus basic
  page checks on the built pages). These are the gates ok runs before it opens a pull request.
- `main` is protected: changes land only through a pull request with a Code Owner approval.

Source: the `fixtures/test-client-site` fixture in `openkept/ok` (see its SETUP.md).
