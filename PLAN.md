# MACH Playbook — Migration Plan: WordPress.com → GitHub Pages (Project Site)

## Overview

Migrate `machleninmeza.wordpress.com` to a GitHub Pages **project site** hosted
inside a new repository under the existing `merolhack` account. The personal
resume at `merolhack.github.io` is left completely untouched.

| Site | Repository | URL |
|---|---|---|
| Resume (existing) | `merolhack/merolhack.github.io` | `merolhack.github.io` — unchanged |
| MACH Blog (new) | `merolhack/mach-playbook` | `merolhack.github.io/mach-playbook` |

**Stack:**
- Static site generator: Jekyll
- Theme: Chirpy (developer/tech blog, native dark mode, free)
- Comments: Giscus (GitHub Discussions — free)
- Contact form: Formspree (free tier)
- Analytics: Google Analytics (free)
- Ads: Google AdSense (apply after 3 months of content)
- Deployment: GitHub Actions (automatic on every push)

> **AdSense note:** Google verifies domain ownership at the root domain
> (`merolhack.github.io`), not at the subdirectory. This means a single
> verification snippet must be added to the resume repo's `<head>` before
> AdSense approval. Ads will only appear on the blog — the resume is unaffected
> beyond that one invisible meta tag. See Phase 7 for exact steps.

---

## Phase 1 — Export WordPress Content

### Step 1A: Export via WordPress dashboard (Manual — 2 min)

```
1. Go to: https://machleninmeza.wordpress.com/wp-admin/export.php
2. Select "All content"
3. Click "Download Export File"
4. Save the file as: machleninmeza-export.xml
5. Place it in: Development/tmp/wp-export/machleninmeza-export.xml
```

### Step 1B: Export pages separately

```
1. On the same export page, select "Pages" only
2. Download and save as: machleninmeza-pages.xml
3. Place in same folder: Development/tmp/wp-export/
```

---

## Phase 2 — Convert WordPress XML to Jekyll Markdown

Uses `wordpress-export-to-markdown` — a Node.js script that converts the XML
into Jekyll-ready `.md` files and downloads all embedded images.

### Step 2A: Run the conversion (PowerShell)

```powershell
# Install Node.js if not present: https://nodejs.org/

# Create working directory
mkdir tmp\jekyll-posts
cd tmp\jekyll-posts

# Clone the converter
git clone https://github.com/obedparla/wordpress-export-to-markdown .
npm install

# Run conversion — Jekyll output format (date-prefixed filenames, flat structure)
node index.js `
  --input=..\wp-export\machleninmeza-export.xml `
  --output=.\output `
  --post-folders=false `
  --prefix-date=true `
  --save-attached-images=true `
  --save-scraped-images=true

# Output will be in: tmp\jekyll-posts\output\
# Structure:
#   output/
#     _posts/
#       2026-04-04-microservices-at-scale-engineering-debt-and-system-complexity.md
#       2026-04-04-the-distributed-monolith-trap.md
#       ... (all 6 posts)
#     images/
#       ... (any embedded images)
```

### Step 2B: Verify the converted files

Each `.md` file should open with Jekyll frontmatter like this:

```markdown
---
title: "Microservices at Scale: Engineering Debt and System Complexity"
date: 2026-04-04
categories: [Guides]
tags: [microservices, architecture, technical-debt]
---

Post content here...
```

Manually check 2-3 files before proceeding. Fix any broken image paths or
missing frontmatter fields.

---

## Phase 3 — Create the Project Site Repository

### Step 3A: Create the repository (Manual — 3 min)

```
1. Go to: https://github.com/cotes2020/chirpy-starter
2. Click "Use this template" → "Create a new repository"
3. Owner: merolhack  (your personal account)
4. Repository name: mach-playbook
   ⚠️ Do NOT name it merolhack.github.io — that is your resume repo
5. Set visibility: Public
6. Click "Create repository"

Result: https://github.com/merolhack/mach-playbook
Live URL will be: https://merolhack.github.io/mach-playbook
```

### Step 3B: Clone the repository locally (PowerShell)

```powershell
cd C:\Users\lenin\Documents\Freelances\machleninmeza\Development
git clone https://github.com/merolhack/mach-playbook.git
cd mach-playbook
```

---

## Phase 4 — Configure the Site

### Step 4A: Edit `_config.yml`

Open `_config.yml` in the `mach-playbook` repo and replace the defaults:

```yaml
# ⚠️ baseurl is REQUIRED for project sites — must match the repo name exactly
baseurl: "/mach-playbook"
url: "https://merolhack.github.io"

# Site identity
title: MACH Playbook
tagline: >-
  Learn MACH fundamentals through concrete service boundaries, clean APIs,
  and deployment examples, so architecture decisions feel tangible, not theoretical.
description: >-
  Practical guides and patterns for Microservices, API-first, Cloud-native,
  and Headless architecture.

# Author
author:
  name: merolhack

# Theme — native dark mode, no paywall
theme_mode: dark

# GitHub link in sidebar
github:
  username: merolhack

# Google Analytics — fill after creating GA4 property
google_analytics:
  id: ""   # e.g. G-XXXXXXXXXX

# Pagination
paginate: 10

# Timezone
timezone: America/Mexico_City

# Comments via Giscus — fill repo_id and category_id after Step 5B
comments:
  active: giscus
  giscus:
    repo: merolhack/mach-playbook
    repo_id: ""
    category: General
    category_id: ""
    mapping: pathname
    input_position: bottom
    lang: en
```

> **Critical:** `baseurl: "/mach-playbook"` is what makes all internal links
> and assets resolve correctly on a project site. Without it, everything 404s.
> Never leave it blank for a project site.

### Step 4B: Add the About page

Create or edit `_tabs/about.md`:

```markdown
---
title: About
icon: fas fa-info-circle
order: 4
---

Microservices & MACH Notes distills complex MACH architecture into practical
guides. We focus on real-world patterns, API-first design, and resilient
microservices, so you can ship independently scalable systems with confidence,
not vendor-driven hype.
```

### Step 4C: Add the Privacy Policy page (required for AdSense)

Create `_tabs/privacy.md`:

```markdown
---
title: Privacy Policy
icon: fas fa-shield-alt
order: 5
---

## Privacy Policy

**Last updated: April 2026**

### Information We Collect
This site uses Google Analytics to collect anonymous traffic data including
pages visited, time on site, and general geographic location. No personally
identifiable information is collected.

### Cookies
This site uses cookies for analytics and, when enabled, advertising purposes
through Google AdSense. You can disable cookies in your browser settings.

### Third-Party Services
- **Google Analytics**: Traffic analysis
- **Google AdSense**: Advertising (when enabled)
- **Giscus**: Comments via GitHub Discussions
- **Formspree**: Contact form submissions

### Contact
For privacy questions, use the Contact page on this site.
```

---

## Phase 5 — Migrate Posts and Configure Comments

### Step 5A: Copy converted posts into the repo (PowerShell)

```powershell
$src  = "C:\Users\lenin\Documents\Freelances\machleninmeza\Development\tmp\jekyll-posts\output"
$dest = "C:\Users\lenin\Documents\Freelances\machleninmeza\Development\mach-playbook"

# Copy posts
Copy-Item "$src\_posts\*" "$dest\_posts\" -Recurse -Force

# Copy images if the converter downloaded any
if (Test-Path "$src\images") {
    Copy-Item "$src\images\*" "$dest\assets\img\" -Recurse -Force
}
```

### Step 5B: Set up Giscus comments (Manual — 5 min)

```
1. Go to: https://github.com/merolhack/mach-playbook/settings
2. General → Features → enable Discussions
3. Go to: https://giscus.app
4. Enter repository: merolhack/mach-playbook
5. Set Discussion Category: "General"
6. Copy the repo_id and category_id values shown
7. Paste both into _config.yml under comments.giscus
```

### Step 5C: Add AdSense placeholder to the blog

Create `_includes/head.html` inside the `mach-playbook` repo:

```html
<!-- Google AdSense — uncomment after approval -->
<!--
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous">
</script>
-->
```

---

## Phase 6 — Deploy to GitHub Pages

### Step 6A: Push to GitHub (PowerShell)

```powershell
cd C:\Users\lenin\Documents\Freelances\machleninmeza\Development\mach-playbook

git add .
git commit -m "Initial MACH Playbook migration from WordPress.com"
git push origin main
```

### Step 6B: Enable GitHub Pages on the project repo (Manual — 2 min)

```
1. Go to: https://github.com/merolhack/mach-playbook/settings/pages
2. Under "Build and deployment" → Source: select "GitHub Actions"
3. GitHub detects the Chirpy workflow at .github/workflows/pages-deploy.yml
4. Wait 2-3 minutes for the first build to complete
5. Visit: https://merolhack.github.io/mach-playbook
```

### Step 6C: Verify both sites are intact

```
Blog  → https://merolhack.github.io/mach-playbook  (dark theme, posts listed)
Resume → https://merolhack.github.io               (completely unchanged)
```

---

## Phase 7 — Apply for Google AdSense

### How domain verification works for project sites

AdSense approves at the **root domain** (`merolhack.github.io`), not the
subdirectory. The flow is:

1. You submit `https://merolhack.github.io/mach-playbook` to AdSense.
2. Google gives you a `<meta>` verification tag.
3. You add that tag to the **resume repo's** `<head>` — one invisible line,
   no visual change to the resume.
4. Google approves → ads activate only on the blog subdirectory.
5. The resume never shows ads.

### Step 7A: Add the verification tag to the resume repo (when prompted)

In `merolhack/merolhack.github.io`, open your root HTML template and add
inside `<head>`:

```html
<!-- Google AdSense domain verification — for mach-playbook blog only -->
<meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with the publisher ID Google provides.
Commit and push this to the resume repo.

### Step 7B: Eligibility checklist

```
[ ] Blog live at merolhack.github.io/mach-playbook
[ ] Blog has been live 3+ months (target: July 2026)
[ ] 10+ published posts with 500+ words each
[ ] Privacy Policy page live on the blog
[ ] Contact page or Formspree form live
[ ] No copyrighted or scraped content
[ ] Site loads correctly on mobile
[ ] Verification meta tag added to resume repo <head> and pushed
```

### Step 7C: Application steps

```
1. Go to: https://adsense.google.com → Get Started
2. Enter URL: https://merolhack.github.io/mach-playbook
3. Follow Google's verification flow
4. Add the meta tag to merolhack/merolhack.github.io (Step 7A)
5. Wait 1–14 days for Google review
6. Once approved:
   a. Open mach-playbook/_includes/head.html
   b. Uncomment the AdSense <script> block
   c. Replace ca-pub-XXXXXXXXXXXXXXXX with your real publisher ID
   d. Commit and push → ads go live automatically on next build
```

---

## Antigravity Prompt — Phase 1: Export WordPress Content

```
You are logged into WordPress.com as merolhack.

Navigate to: https://machleninmeza.wordpress.com/wp-admin/export.php

Step 1 — Export all content:
1. Select "All content" from the export options.
2. Click "Download Export File".
3. Note the downloaded filename and file size.

Step 2 — Export pages only:
1. Return to the same export page.
2. Select "Pages" only.
3. Download and note the filename.

Report both filenames and their byte sizes before navigating away.
```

---

## Antigravity Prompt — Phase 3: Create the Project Repository

```
You are logged into GitHub as merolhack.

Perform the following steps exactly:

1. Navigate to: https://github.com/cotes2020/chirpy-starter
2. Click the green "Use this template" button.
3. Select "Create a new repository".
4. Set Owner to: merolhack
5. Set Repository name to exactly: mach-playbook
   ⚠️ Do NOT use merolhack.github.io — that repo already exists (resume).
6. Set visibility to: Public
7. Click "Create repository".
8. Wait for creation to complete.
9. Navigate to the new repo and confirm these files exist:
   _config.yml, _posts/, _tabs/, .github/workflows/pages-deploy.yml

Report the full repository URL and confirm the Chirpy files are present.
```

---

## Antigravity Prompt — Phase 6: Verify Deployment

```
You are logged into GitHub as merolhack.

Navigate to: https://github.com/merolhack/mach-playbook/actions

1. Find the most recent workflow run (named "pages-deploy" or similar).
2. Report its status: queued / in progress / success / failed.
3. If failed: click the run and report the exact error from the failed step.
4. If success:
   a. Navigate to: https://merolhack.github.io/mach-playbook
   b. Confirm the site title reads "MACH Playbook"
   c. Confirm the dark theme is applied
   d. Confirm at least one post appears on the home page
   e. Navigate to: https://merolhack.github.io
   f. Confirm the resume still loads correctly and is unaffected

Report the deployment status and describe what both pages look like.
```

---

## Post-Migration: Update CREDENTIALS.md

Add this section to CREDENTIALS.md after migration is complete:

```
## GitHub Pages — MACH Blog (Project Site)

Repository:  https://github.com/merolhack/mach-playbook
Live URL:    https://merolhack.github.io/mach-playbook
Branch:      main (auto-deploys via GitHub Actions)
Theme:       Chirpy (jekyll-theme-chirpy)
baseurl:     /mach-playbook  ← set in _config.yml, do not remove

## Resume (unchanged)

Repository:  https://github.com/merolhack/merolhack.github.io
Live URL:    https://merolhack.github.io

## Google AdSense (pending approval)

Publisher ID:  ca-pub-XXXXXXXXXXXXXXXX  ← fill after approval
Verification:  meta tag in merolhack/merolhack.github.io <head> (invisible)
Ads active on: merolhack.github.io/mach-playbook only
```

---

## Migration Checklist

```
Phase 1 — Export
[ ] All content exported from WordPress.com (XML)
[ ] Pages exported separately (XML)

Phase 2 — Convert
[ ] Node.js wordpress-export-to-markdown installed and run
[ ] output/_posts/ contains .md files with correct frontmatter
[ ] 2-3 sample posts verified manually

Phase 3 — Repo setup
[ ] chirpy-starter used to create merolhack/mach-playbook
[ ] ⚠️ repo name is mach-playbook, NOT merolhack.github.io
[ ] Repo cloned locally

Phase 4 — Configure
[x] _config.yml: baseurl set to /mach-playbook
[x] _config.yml: url set to https://merolhack.github.io
[x] _config.yml: title, tagline, author, dark mode filled
[x] _tabs/about.md content added
[x] _tabs/privacy.md created

Phase 5 — Migrate content
[x] Posts copied to mach-playbook/_posts/
[x] Images copied to mach-playbook/assets/img/
[ ] Giscus Discussions enabled on mach-playbook repo
[ ] Giscus repo_id and category_id filled in _config.yml
[x] AdSense placeholder added to _includes/head.html (commented out)

Phase 6 — Deploy
[ ] git push to main
[ ] GitHub Pages source set to "GitHub Actions" in mach-playbook settings
[ ] First Actions build succeeded
[ ] Blog live at merolhack.github.io/mach-playbook ✓
[ ] Resume still live at merolhack.github.io ✓ (untouched)

Phase 7 — Monetize
[ ] Blog has 10+ posts and is 3+ months old (July 2026)
[ ] AdSense application submitted at adsense.google.com
[ ] Google verification meta tag added to resume repo <head> and pushed
[ ] AdSense approved
[ ] AdSense script uncommented in mach-playbook/_includes/head.html
[ ] Real publisher ID (ca-pub-XXXX) filled in

WordPress.com (30-day parallel window)
[ ] All post URLs verified on new blog
[ ] WordPress.com deactivated after 30-day window
```