/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { callGemini, extractText, extractImageDataUrl } from "./geminiClient";
import { Asset, PlacedLayer } from "../types";

/**
 * Helper to strip the data URL prefix (e.g. "data:image/png;base64,")
 */
const getBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

/**
 * Helper to load an image asynchronously from base64 or URL
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
};

/**
 * Local high-fidelity canvas compositing fallback.
 * Blends the logos perfectly onto the product base with realistic effects.
 */
export const compositeMockupLocally = async (
  product: Asset,
  layers: { asset: Asset; placement: PlacedLayer }[],
  instruction: string
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not create 2D canvas context");

  // Load product base image
  const productImg = await loadImage(product.data);
  
  // Set canvas size to product image's natural dimensions to preserve resolution
  canvas.width = productImg.naturalWidth || 800;
  canvas.height = productImg.naturalHeight || 800;

  // Draw product base
  ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height);

  // Draw each logo layer
  for (const layer of layers) {
    try {
      const logoImg = await loadImage(layer.asset.data);
      
      // Calculate pixel coordinates based on layout percentages
      const posX = (layer.placement.x / 100) * canvas.width;
      const posY = (layer.placement.y / 100) * canvas.height;
      
      // Base width is 15% of the product width
      const baseWidth = canvas.width * 0.15;
      const logoWidth = baseWidth * layer.placement.scale;
      const logoHeight = logoWidth * (logoImg.naturalHeight / logoImg.naturalWidth);

      ctx.save();
      
      // Move origin to the logo's center
      ctx.translate(posX, posY);
      
      // Rotate
      if (layer.placement.rotation) {
        ctx.rotate((layer.placement.rotation * Math.PI) / 180);
      }

      // Advanced realistic blend styling based on instructions
      const lowerInstruction = (instruction || '').toLowerCase();
      if (lowerInstruction.includes("blend") || lowerInstruction.includes("fabric") || lowerInstruction.includes("texture") || lowerInstruction.includes("print") || lowerInstruction.includes("merge")) {
        // Use multiply for blending dark prints into light fabric texture
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.90;
      } else if (lowerInstruction.includes("screen print") || lowerInstruction.includes("stencil")) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.95;
      } else {
        // Standard sticker/decal feel: add a subtle realistic shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.98;
      }

      // Draw the logo centered
      ctx.drawImage(logoImg, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
      
      ctx.restore();
    } catch (err) {
      console.warn("Failed to load or draw logo layer:", err);
    }
  }

  return canvas.toDataURL('image/png');
};

/**
 * Local vector-style Logo generator fallback.
 * Generates beautiful, modern minimalist logo badges on white backgrounds.
 */
export const generateLocalLogo = (prompt: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not create canvas context");

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 512, 512);

  const cleanPrompt = prompt.trim();
  const firstLetter = cleanPrompt.charAt(0).toUpperCase() || 'S';
  const lowerPrompt = cleanPrompt.toLowerCase();

  // Determine colors based on prompt keywords
  let gradientColors = ['#6366F1', '#A855F7', '#EC4899']; // Default: Purple-indigo-pink
  if (lowerPrompt.includes('coffe') || lowerPrompt.includes('bean') || lowerPrompt.includes('cafe')) {
    gradientColors = ['#78350F', '#B45309', '#F59E0B']; // Coffee/Gold
  } else if (lowerPrompt.includes('natur') || lowerPrompt.includes('green') || lowerPrompt.includes('organic') || lowerPrompt.includes('leaf')) {
    gradientColors = ['#065F46', '#10B981', '#34D399']; // Emerald/Mint
  } else if (lowerPrompt.includes('tech') || lowerPrompt.includes('cyber') || lowerPrompt.includes('blue') || lowerPrompt.includes('digital')) {
    gradientColors = ['#1E3A8A', '#3B82F6', '#60A5FA']; // Tech blue
  } else if (lowerPrompt.includes('fire') || lowerPrompt.includes('hot') || lowerPrompt.includes('red') || lowerPrompt.includes('sun')) {
    gradientColors = ['#991B1B', '#EF4444', '#F59E0B']; // Fire Red/Orange
  } else if (lowerPrompt.includes('dark') || lowerPrompt.includes('black') || lowerPrompt.includes('metal')) {
    gradientColors = ['#111827', '#374151', '#9CA3AF']; // Slate grey
  }

  // Draw elegant geometric badge background
  const centerX = 256;
  const centerY = 220;
  const radius = 130;

  // Create gradient
  const grad = ctx.createLinearGradient(120, 120, 392, 392);
  grad.addColorStop(0, gradientColors[0]);
  grad.addColorStop(0.5, gradientColors[1]);
  grad.addColorStop(1, gradientColors[2]);

  // Draw outer circle border or shield or polygon
  ctx.strokeStyle = grad;
  ctx.lineWidth = 10;
  ctx.beginPath();
  
  let drewShape = false;
  if (lowerPrompt.includes('shield') || lowerPrompt.includes('guard') || lowerPrompt.includes('secure')) {
    // Shield path
    ctx.moveTo(centerX, centerY - radius);
    ctx.quadraticCurveTo(centerX + radius, centerY - radius, centerX + radius, centerY);
    ctx.quadraticCurveTo(centerX + radius, centerY + radius * 0.6, centerX, centerY + radius * 1.2);
    ctx.quadraticCurveTo(centerX - radius, centerY + radius * 0.6, centerX - radius, centerY);
    ctx.quadraticCurveTo(centerX - radius, centerY - radius, centerX, centerY - radius);
    drewShape = true;
  } else if (lowerPrompt.includes('hex') || lowerPrompt.includes('cube') || lowerPrompt.includes('tech')) {
    // Hexagon path
    for (let s = 0; s < 6; s++) {
      const angle = (s * Math.PI) / 3 - Math.PI / 6;
      const px = centerX + radius * Math.cos(angle);
      const py = centerY + radius * Math.sin(angle);
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    drewShape = true;
  }

  if (!drewShape) {
    // Elegant concentric circles
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Thin inner concentric circle
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, 0, 2 * Math.PI);
  }
  ctx.stroke();

  // Draw central graphic icon or elegant lettermark
  ctx.fillStyle = grad;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let drewIcon = false;
  
  // Custom simple line icon based on keywords
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = grad;

  if (lowerPrompt.includes('cup') || lowerPrompt.includes('coffe') || lowerPrompt.includes('cafe') || lowerPrompt.includes('tea')) {
    // Draw coffee cup
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY - 20);
    ctx.lineTo(centerX + 40, centerY - 20);
    ctx.lineTo(centerX + 30, centerY + 40);
    ctx.quadraticCurveTo(centerX, centerY + 50, centerX - 30, centerY + 40);
    ctx.closePath();
    
    // Handle
    ctx.moveTo(centerX + 35, centerY - 10);
    ctx.quadraticCurveTo(centerX + 60, centerY, centerX + 30, centerY + 20);
    ctx.stroke();
    
    // Steam
    ctx.beginPath();
    ctx.lineWidth = 3;
    for (let sx = -15; sx <= 15; sx += 15) {
      ctx.moveTo(centerX + sx, centerY - 30);
      ctx.bezierCurveTo(centerX + sx - 5, centerY - 40, centerX + sx + 5, centerY - 45, centerX + sx, centerY - 55);
    }
    ctx.stroke();
    drewIcon = true;
  } else if (lowerPrompt.includes('star') || lowerPrompt.includes('spark') || lowerPrompt.includes('premium')) {
    // Draw 8-point star
    ctx.beginPath();
    for (let s = 0; s < 16; s++) {
      const angle = (s * Math.PI) / 8;
      const r = s % 2 === 0 ? radius * 0.65 : radius * 0.25;
      const px = centerX + r * Math.cos(angle);
      const py = centerY + r * Math.sin(angle);
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    drewIcon = true;
  } else if (lowerPrompt.includes('leaf') || lowerPrompt.includes('natur') || lowerPrompt.includes('organic') || lowerPrompt.includes('plant')) {
    // Draw beautiful leaf
    ctx.beginPath();
    ctx.moveTo(centerX - 50, centerY + 50);
    ctx.quadraticCurveTo(centerX - 30, centerY - 50, centerX + 50, centerY - 50);
    ctx.quadraticCurveTo(centerX + 50, centerY + 30, centerX - 50, centerY + 50);
    ctx.closePath();
    ctx.fill();
    
    // Vein
    ctx.beginPath();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.moveTo(centerX - 40, centerY + 40);
    ctx.quadraticCurveTo(centerX, centerY, centerX + 45, centerY - 45);
    ctx.stroke();
    drewIcon = true;
  } else if (lowerPrompt.includes('bolt') || lowerPrompt.includes('flash') || lowerPrompt.includes('power') || lowerPrompt.includes('energy') || lowerPrompt.includes('tech')) {
    // Draw lightning bolt
    ctx.beginPath();
    ctx.moveTo(centerX + 15, centerY - 65);
    ctx.lineTo(centerX - 35, centerY + 5);
    ctx.lineTo(centerX - 5, centerY + 5);
    ctx.lineTo(centerX - 15, centerY + 65);
    ctx.lineTo(centerX + 35, centerY - 5);
    ctx.lineTo(centerX + 5, centerY - 5);
    ctx.closePath();
    ctx.fill();
    drewIcon = true;
  } else if (lowerPrompt.includes('fire') || lowerPrompt.includes('flame') || lowerPrompt.includes('burn') || lowerPrompt.includes('hot')) {
    // Draw flame
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 60);
    ctx.bezierCurveTo(centerX - 60, centerY + 60, centerX - 50, centerY - 10, centerX - 10, centerY - 60);
    ctx.bezierCurveTo(centerX - 30, centerY - 10, centerX + 10, centerY, centerX + 10, centerY - 30);
    ctx.bezierCurveTo(centerX + 50, centerY - 10, centerX + 60, centerY + 20, centerX, centerY + 60);
    ctx.closePath();
    ctx.fill();
    drewIcon = true;
  }

  if (!drewIcon) {
    // Draw premium elegant lettermark with serif or clean font
    ctx.font = 'bold 150px "Inter", sans-serif';
    ctx.fillText(firstLetter, centerX, centerY + 10);
  }

  // Draw the prompt text beautifully centered at the bottom of the badge
  ctx.fillStyle = '#18181B';
  ctx.font = 'bold 24px "JetBrains Mono", monospace';
  const displayLabel = cleanPrompt.length > 20 ? cleanPrompt.substring(0, 18) + '..' : cleanPrompt;
  ctx.fillText(displayLabel.toUpperCase(), centerX, 410);

  // Decorative tracking dots or subtitle
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '500 12px "Inter", sans-serif';
  ctx.fillText("EST. 2026 • LOGO STUDIO", centerX, 445);

  return canvas.toDataURL('image/png');
};

/**
 * Local high-fidelity product blank template generator.
 * Generates beautiful merch blanks (T-Shirt, Mug, Tote Bag, Bottle) on studio backgrounds.
 */
export const generateLocalProduct = (prompt: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not create canvas context");

  const lowerPrompt = prompt.toLowerCase();

  // Create a stunning premium studio background (gradient vignette)
  const bgGrad = ctx.createRadialGradient(256, 256, 50, 256, 256, 360);
  bgGrad.addColorStop(0, '#FAFAFA');
  bgGrad.addColorStop(1, '#D4D4D8');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft floor shadow for the product
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 15;

  // Let's determine the color of the product
  let productColors = ['#F4F4F5', '#E4E4E7']; // Default: Soft white
  if (lowerPrompt.includes('black') || lowerPrompt.includes('dark') || lowerPrompt.includes('charcoal')) {
    productColors = ['#27272A', '#18181B'];
  } else if (lowerPrompt.includes('red') || lowerPrompt.includes('crimson')) {
    productColors = ['#EF4444', '#991B1B'];
  } else if (lowerPrompt.includes('blue') || lowerPrompt.includes('navy')) {
    productColors = ['#3B82F6', '#1D4ED8'];
  } else if (lowerPrompt.includes('green') || lowerPrompt.includes('emerald')) {
    productColors = ['#10B981', '#064E3B'];
  } else if (lowerPrompt.includes('yellow') || lowerPrompt.includes('gold')) {
    productColors = ['#FBBF24', '#D97706'];
  } else if (lowerPrompt.includes('pink')) {
    productColors = ['#EC4899', '#BE185D'];
  }

  // Draw the product silhouette and shading
  const cx = 256;
  const cy = 256;

  // Set fill and stroke
  const grad = ctx.createLinearGradient(150, 150, 362, 362);
  grad.addColorStop(0, productColors[0]);
  grad.addColorStop(1, productColors[1]);

  if (lowerPrompt.includes('shirt') || lowerPrompt.includes('tee') || lowerPrompt.includes('apparel') || lowerPrompt.includes('clothing') || lowerPrompt.includes('hoodie')) {
    // Draw a T-Shirt
    ctx.fillStyle = grad;
    ctx.beginPath();
    // Neck collar
    ctx.moveTo(cx - 50, cy - 130);
    ctx.quadraticCurveTo(cx, cy - 110, cx + 50, cy - 130);
    // Shoulder Right
    ctx.lineTo(cx + 120, cy - 110);
    // Sleeve Right Outer
    ctx.lineTo(cx + 160, cy - 40);
    // Sleeve Right Inner
    ctx.lineTo(cx + 110, cy - 20);
    // Underarm Right
    ctx.lineTo(cx + 100, cy - 30);
    // Side Right
    ctx.lineTo(cx + 90, cy + 140);
    // Hem bottom
    ctx.lineTo(cx - 90, cy + 140);
    // Side Left
    ctx.lineTo(cx - 100, cy - 30);
    // Underarm Left
    ctx.lineTo(cx - 110, cy - 20);
    // Sleeve Left Inner
    ctx.lineTo(cx - 160, cy - 40);
    // Shoulder Left
    ctx.lineTo(cx - 120, cy - 110);
    ctx.closePath();
    ctx.fill();

    // Fabric folds, collar details and shading
    ctx.strokeStyle = lowerPrompt.includes('black') ? '#3F3F46' : '#D4D4D8';
    ctx.lineWidth = 3;
    
    // Collar stitching lines
    ctx.beginPath();
    ctx.moveTo(cx - 50, cy - 130);
    ctx.quadraticCurveTo(cx, cy - 110, cx + 50, cy - 130);
    ctx.quadraticCurveTo(cx, cy - 122, cx - 50, cy - 130);
    ctx.stroke();

    // Crease lines / realism highlights
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; // highlight
    ctx.moveTo(cx - 95, cy - 80);
    ctx.quadraticCurveTo(cx - 60, cy - 10, cx - 80, cy + 100);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; // shadow
    ctx.moveTo(cx + 95, cy - 80);
    ctx.quadraticCurveTo(cx + 60, cy - 10, cx + 80, cy + 100);
    ctx.stroke();

  } else if (lowerPrompt.includes('mug') || lowerPrompt.includes('cup') || lowerPrompt.includes('coffee mug')) {
    // Draw Ceramic Mug
    ctx.fillStyle = grad;
    // Draw handle first (behind)
    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.strokeStyle = productColors[1];
    ctx.arc(cx - 80, cy, 50, -Math.PI / 2, Math.PI / 2, true);
    ctx.stroke();

    // Draw handle inner/highlight
    ctx.strokeStyle = productColors[0];
    ctx.lineWidth = 14;
    ctx.stroke();

    // Draw Mug body
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 100);
    ctx.lineTo(cx + 70, cy - 100);
    ctx.lineTo(cx + 65, cy + 110);
    ctx.quadraticCurveTo(cx, cy + 120, cx - 65, cy + 110);
    ctx.closePath();
    ctx.fill();

    // Mug Rim Ellipse
    ctx.fillStyle = productColors[0];
    ctx.beginPath();
    ctx.ellipse(cx, cy - 100, 70, 16, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mug Inner shadow / depth
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 100, 64, 12, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Gloss highlights
    const gloss = ctx.createLinearGradient(cx + 20, cy - 100, cx + 60, cy + 100);
    gloss.addColorStop(0, 'rgba(255,255,255,0.25)');
    gloss.addColorStop(0.3, 'rgba(255,255,255,0.05)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.moveTo(cx + 30, cy - 95);
    ctx.lineTo(cx + 55, cy - 95);
    ctx.lineTo(cx + 50, cy + 105);
    ctx.lineTo(cx + 30, cy + 105);
    ctx.closePath();
    ctx.fill();

  } else if (lowerPrompt.includes('bag') || lowerPrompt.includes('tote') || lowerPrompt.includes('canvas bag')) {
    // Draw Tote Bag
    // Draw straps first
    ctx.strokeStyle = productColors[1];
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy - 100, 55, Math.PI, 0);
    ctx.stroke();

    ctx.strokeStyle = productColors[0];
    ctx.lineWidth = 10;
    ctx.stroke();

    // Bag main body
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - 95, cy - 50);
    ctx.lineTo(cx + 95, cy - 50);
    ctx.lineTo(cx + 85, cy + 140);
    ctx.quadraticCurveTo(cx, cy + 145, cx - 85, cy + 140);
    ctx.closePath();
    ctx.fill();

    // Top trim stitch
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 95, cy - 40);
    ctx.lineTo(cx + 95, cy - 40);
    ctx.stroke();

    // Realistic fabric folds/texture wrinkles
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy - 40);
    ctx.quadraticCurveTo(cx - 20, cy + 30, cx - 40, cy + 130);
    ctx.moveTo(cx + 70, cy - 40);
    ctx.quadraticCurveTo(cx + 20, cy + 30, cx + 40, cy + 130);
    ctx.stroke();

  } else {
    // Default: Elegant cylindrical aluminum water bottle / tumbler
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - 45, cy - 120);
    ctx.lineTo(cx + 45, cy - 120);
    ctx.lineTo(cx + 50, cy - 100);
    ctx.lineTo(cx + 55, cy + 130);
    ctx.quadraticCurveTo(cx, cy + 140, cx - 55, cy + 130);
    ctx.lineTo(cx - 50, cy - 100);
    ctx.closePath();
    ctx.fill();

    // Metallic cap / lid
    ctx.fillStyle = '#9CA3AF'; // metallic silver cap
    ctx.beginPath();
    ctx.rect(cx - 30, cy - 145, 60, 25);
    ctx.fill();
    ctx.fillStyle = '#4B5563';
    ctx.beginPath();
    ctx.rect(cx - 25, cy - 150, 50, 8);
    ctx.fill();

    // Metal sheen gloss highlight
    const metalGloss = ctx.createLinearGradient(cx - 40, cy - 120, cx + 40, cy + 120);
    metalGloss.addColorStop(0, 'rgba(255,255,255,0.15)');
    metalGloss.addColorStop(0.5, 'rgba(255,255,255,0)');
    metalGloss.addColorStop(0.7, 'rgba(255,255,255,0.1)');
    metalGloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = metalGloss;
    ctx.fillRect(cx - 40, cy - 100, 80, 230);
  }

  ctx.restore();

  // Add elegant display label in lower area
  ctx.fillStyle = '#71717A';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText("PREMIUM MERCHANDISE BLANK", cx, 470);

  return canvas.toDataURL('image/png');
};

/**
 * Generates an AI marketing copy and review of the mockup using the standard free gemini-3.5-flash model.
 * This runs flawlessly on the standard free tier!
 */
export const generateMockupReview = async (
  productName: string,
  logoName: string,
  userPrompt: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';

    const promptText = `
    Analyze this custom-branded merchandise design:
    - Product base type: ${productName}
    - Brand logo graphic used: ${logoName}
    - Custom design context/prompt: ${userPrompt}

    Write a highly engaging, professional marketing copy for this custom-branded merchandise item.
    Also, provide 3 catchy advertising slogans.
    Finally, include a brief design critique praising the logo's placement and color contrast.
    Format your response in beautiful, clean markdown with clear headers and bullet points. Keep it professional.
    `;

    const parts = await callGemini(model, [{ text: promptText }]);
    return extractText(parts) || "Failed to generate AI description.";
  } catch (err) {
    console.warn("AI review generation failed:", err);
    return "### Custom Designed Mockup\n\nCrafted using high-fidelity local layout mapping and blending. Product visualization complete.";
  }
};

/**
 * Generates a product mockup by compositing multiple logos onto a product image.
 * Uses the fallback canvas compositor if premium image model fails or billing is not enabled.
 */
export const generateMockup = async (
  product: Asset,
  layers: { asset: Asset; placement: PlacedLayer }[],
  instruction: string
): Promise<string> => {
  try {
      const model = 'gemini-2.5-flash-image';
 
      // 1. Add Product Base
      const parts: any[] = [
        {
          inlineData: {
            mimeType: product.mimeType,
            data: getBase64Data(product.data),
          },
        },
      ];
 
      // 2. Add All Logos
      let layoutHints = "";
      layers.forEach((layer, index) => {
        parts.push({
          inlineData: {
            mimeType: layer.asset.mimeType,
            data: getBase64Data(layer.asset.data),
          },
        });
 
        // Construct simple positioning hint
        const vPos = layer.placement.y < 33 ? "top" : layer.placement.y > 66 ? "bottom" : "center";
        const hPos = layer.placement.x < 33 ? "left" : layer.placement.x > 66 ? "right" : "center";
        
        layoutHints += `\n- Logo ${index + 1}: Place at ${vPos}-${hPos} area (approx coords: ${Math.round(layer.placement.x)}% x, ${Math.round(layer.placement.y)}% y). Scale: ${layer.placement.scale}.`;
      });
 
      // 3. Add Instructions
      const finalPrompt = `
      User Instructions: ${instruction}
      
      Layout Guidance based on user's rough placement on canvas:
      ${layoutHints}
 
      System Task: Composite the provided logo images (images 2-${layers.length + 1}) onto the first image (the product) to create a realistic product mockup. 
      Follow the Layout Guidance for positioning if provided, but prioritize realistic surface warping, lighting, and perspective blending.
      Output ONLY the resulting image.
      `;
 
      parts.push({ text: finalPrompt });
 
      const outParts = await callGemini(model, parts, { imageOutput: true });
      const dataUrl = extractImageDataUrl(outParts);
      if (dataUrl) return dataUrl;
      throw new Error("No image data found in response");
 
  } catch (error) {
    console.warn("Gemini image API failed (no key / quota / error). Falling back to local canvas compositor.", error);
  }

  // Fallback to local canvas compositing
  return compositeMockupLocally(product, layers, instruction);
};

/**
 * Generates a new logo or product base using AI if available, or falls back to local high-fidelity generator.
 */
export const generateAsset = async (prompt: string, type: 'logo' | 'product'): Promise<string> => {
  try {
      const model = 'gemini-2.5-flash-image';
      
      const enhancedPrompt = type === 'logo' 
          ? `A high-quality, professional vector-style logo design of a ${prompt}. Isolated on a pure white background. Minimalist and clean, single distinct logo.`
          : `Professional studio product photography of a single ${prompt}. Ghost mannequin style or flat lay. Front view, isolated on neutral background. High resolution, photorealistic. Single object only, no stacks, no duplicates.`;
 
      const outParts = await callGemini(model, [{ text: enhancedPrompt }], { imageOutput: true });
      const dataUrl = extractImageDataUrl(outParts);
      if (dataUrl) return dataUrl;
      throw new Error("No image generated");
 
  } catch (error) {
      console.warn(`AI asset generation failed for ${type}. Falling back to local template engine.`, error);
  }

  // Beautiful local asset generator fallback
  if (type === 'logo') {
    return generateLocalLogo(prompt);
  } else {
    return generateLocalProduct(prompt);
  }
};

/**
 * Takes a raw AR composite and makes it photorealistic.
 */
export const generateRealtimeComposite = async (
    compositeImageBase64: string,
    prompt: string = "Make this look like a real photo"
  ): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash-image';
    
        const parts = [
          {
            inlineData: {
              mimeType: 'image/png',
              data: getBase64Data(compositeImageBase64),
            },
          },
          {
            text: `Input is a rough AR composite. Task: ${prompt}. 
            Render the overlaid object naturally into the scene. 
            Match the lighting, shadows, reflections, and perspective of the background. 
            Keep the background largely as is, but blend the object seamlessly.
            Output ONLY the resulting image.`,
          },
        ];
    
        const outParts = await callGemini(model, parts, { imageOutput: true });
        const dataUrl = extractImageDataUrl(outParts);
        if (dataUrl) return dataUrl;
        throw new Error("No image data found in response");
    
    } catch (error) {
        console.warn("AR Composite via API failed. Returning base composite.", error);
    }

    return compositeImageBase64;
  };
