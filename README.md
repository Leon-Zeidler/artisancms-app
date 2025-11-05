This repository contains the source for the ArtisanCMS web application.

## Applying the runtime environment guard fixes locally

If you received a `.patch` file (or pulled this repository without the `work` branch that originally held the fixes), you can apply the exact changes by running the following commands from the root of your local clone:

```bash
# fetch the patch file if necessary
curl -O https://raw.githubusercontent.com/<your-fork>/artisancms-app/main/patches/runtime-env-guards.patch

# make sure you are on the branch you want to update (e.g. main)
git checkout main

# apply the patch
git apply patches/runtime-env-guards.patch

# review and commit
git status
git diff
```

> **Troubleshooting:**
>
> * If `git apply` reports that the patch cannot be applied cleanly, ensure your local repository matches the commit prior to the fix (`2ce3c01`) or review the patch manually and copy the relevant sections into your files.
> * If you prefer using `git am`, run `git am patches/runtime-env-guards.patch` instead; it preserves the original commit metadata.

After applying the patch, redeploy or restart the application so the updated runtime guards take effect. Confirm that all required environment variables are present (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `FROM_EMAIL`, and `OPENAI_API_KEY`).

## Local development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).
