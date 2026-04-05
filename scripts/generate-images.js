const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
require('dotenv').config();

const POSTS_DIR = path.join(__dirname, '../_posts');
const IMG_DIR = path.join(__dirname, '../assets/img/posts');

// Ensure image directory exists
if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

async function generateImage(title) {
  const prompt = `A header image for a professional tech blog post about ${title}, photorealistic, abstract technology, beautiful, highly detailed, clean design`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=675&nologo=true`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("Image generation failed:", response.statusText);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}

async function processPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));

  let processedCount = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(fileContent);

    // Skip if an image already exists in the metadata
    if (parsed.data.image || (parsed.data.image && parsed.data.image.path)) {
      continue;
    }

    console.log(`Processing missing image for post: ${parsed.data.title || file}`);
    
    // Generate image
    const base64Data = await generateImage(parsed.data.title || 'technology microservices');
    
    if (base64Data) {
      const fileName = file.replace(/\.md$/, '.png');
      const imgPath = path.join(IMG_DIR, fileName);
      
      // Save image
      fs.writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));
      console.log(`Saved image to: assets/img/posts/${fileName}`);

      // Update markdown metadata
      parsed.data.image = {
        path: `/assets/img/posts/${fileName}`
      };

      // Write markdown file back
      const updatedMarkdown = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(filePath, updatedMarkdown, 'utf8');
      console.log(`Updated frontmatter for: ${file}`);
      
      processedCount++;
    } else {
      console.log(`Skipped ${file} due to generation failure.`);
    }

    // Wait 2-3 seconds between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\nOperation finished. Generated ${processedCount} new images.`);
}

processPosts();
