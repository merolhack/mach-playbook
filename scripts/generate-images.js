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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set in .env or environment.");
  process.exit(1);
}

async function generateImage(title) {
  const prompt = `A header image for a professional tech blog post about ${title}, photorealistic, abstract technology, beautiful, 16:9 aspect ratio`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.error.message);
      return null;
    }

    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;
      const imgPart = parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('image/'));
      if (imgPart) {
        return imgPart.inlineData.data;
      }
      // If the API unexpectedly returns text instead (content filtering or instruction rejection)
      const textPart = parts.find(p => p.text);
      console.error("API did not return image data. Returned text:", textPart ? textPart.text : "Unknown format");
      return null;
    } else {
      console.error("Unexpected response:", data);
      return null;
    }
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
