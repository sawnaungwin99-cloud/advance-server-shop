- [ ] Add a privacy-safe feed of real recent completed purchases.
- [ ] Show a dismissible Burmese purchase ticker without blocking checkout or Telegram.
- [ ] Verify live data, timing, mobile layout and tests.

## Google sign-in repair
- [x] Enable Google and replace the legacy sign-in flow with managed Google authentication.
- [x] Verify the sign-in button uses the managed entry path and the hosted entry reaches Google's account screen.
- [x] Inspect snwadvshop.com: its managed OAuth entry currently returns 404; add the Netlify redirect to the working Lovable entry.
- [ ] Enable the snwadvshop.com return URL and verify Netlify after redeployment; blocked on the user's Auth settings change and redeployment.
- [ ] Verify a complete Google account sign-in and return; requires the user's Google consent, not available in the sandbox.