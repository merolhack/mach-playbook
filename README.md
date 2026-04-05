# MACH Playbook
## Modern Engineering & Architecture Knowledge Base

This repository hosts the **MACH Playbook**, a professional repository and engineering blog covering core cloud-native methodologies:
- **M**icroservices
- **A**PI-First
- **C**loud-Native
- **H**eadless Architecture

Built on [Jekyll](https://jekyllrb.com) using the [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy/) theme, this platform was migrated cleanly from WordPress to a static frontend deployed completely automatically via GitHub Pages.

### CI/CD Content Features
This playbook leverages several programmatic integrations:
1. **Automated Header Imagery:** All markdown files dropped into `_posts` missing a cover image will trigger a GitHub Action (`auto-generate-images`). The script calls Pollinations.ai to dynamically compute, fetch, and attach a unique, 16:9 abstract technology graphic directly to the YAML frontmatter. 
2. **Google AdSense Enabled:** Site layout automatically tracks page hits and renders dynamic ads seamlessly via custom Jekyll includes.
3. **Automated Deployments:** Fully tracked via GitHub Actions to deploy static pages instantly.
