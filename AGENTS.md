# Project Instructions & Constraints

## Persistent Rules for AI Coding Assistant

1. **Protect Configuration Files**: NEVER delete, modify, or touch any files within the `.github/workflows/` directory.
2. **Firebase Configuration Integrity**:
   - DO NOT change the `hosting` settings in `firebase.json` (specifically `rewrites` and `public`).
   - DO NOT add or modify Cloud Functions or Cloud Run configurations manually.
3. **Build Script Protection**: DO NOT modify the `build` script in `package.json`. It must remain exactly as configured.
4. **Environment Consistency**: Ensure that any changes respect the existing full-stack architecture (Express + Vite) and deployment flow.
