export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

export async function POST(req: Request) {
  try {
    const { category, type, color, section } = await req.json();

    // --- TASK 1: HTML GENERATION (Gemini 3 Flash) ---
    if (type === 'TEMPLATE') {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash",
        systemInstruction: "Output only pure HTML code. Use Tailwind CSS via CDN. Do not include markdown formatting like ```html." 
      });

      const prompt = `Create a professional high-converting landing page for a ${category.Category} business.
        Accent Color: ${color}. Style: ${category["Website Style"]}.
        Include: Hero with CTA, Services (using symbols), About Us, Testimonials, and Certificates (symbols).
        Logo: Generate an inline SVG with the initial "${category.Category.charAt(0)}" and name.
        Images: Insert these exact placeholders: 
        [DESC_PHOTO: A professional website stock photo: Hero at work for ${category.Category}]
        [DESC_PHOTO: A professional website stock photo: Finished products for ${category.Category}]
        [DESC_PHOTO: A professional website stock photo: The team for ${category.Category}]
        [DESC_PHOTO: A professional website stock photo: Team at work for ${category.Category}]
        [DESC_PHOTO: A professional website stock photo: Before and after ${category.Category}]`;

      const result = await model.generateContent(prompt);
      const htmlOutput = result.response.text().trim();

      const { error: dbError } = await supabaseAdmin.from('category_templates').insert({
        category: category.Category,
        html_content: htmlOutput,
        css_theme: { accent: color, style: category["Website Style"] }
      });

      if (dbError) throw dbError;
      return NextResponse.json({ success: true });
    }

    // --- TASK 2: IMAGE GENERATION (Gemini 2.5/2.0 Flash Image) ---
    if (type === 'IMAGE') {
      let imageModel;
      try {
        imageModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
      } catch (e) {
        imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-image" });
      }

      let finalPrompt = `A professional website stock photo: ${section} for a ${category.Category} business.`;
      
      if (section === "Before and after") {
        finalPrompt = `A professional website stock photo: Split the image in 2 halves, both must represent the same scene. On the left: Before the service, objects/scene in bad shape. On the right side: After the service, beautiful scene, happy people. Category: ${category.Category}`;
      }

      // Stage 2: Description-to-Image via Model
      const result = await imageModel.generateContent(finalPrompt);
      const response = await result.response;
      
      // Note: Assuming the model returns a blob/base64 as per the specific image model docs
      const base64Data = response.text(); // Adjust based on specific Image Model API response structure
      const blob = await (await fetch(`data:image/jpeg;base64,${base64Data}`)).blob();

      const fileName = `${category.Category.replace(/\s/g, '_')}_${section.replace(/\s/g, '_')}.jpg`;
      
      // Upload to your category_assets bucket
      await supabaseAdmin.storage.from('category_assets').upload(fileName, blob, { upsert: true });
      const { data: pubUrl } = supabaseAdmin.storage.from('category_assets').getPublicUrl(fileName);

      // Update Database Table
      const { data: existing } = await supabaseAdmin.from('category_assets').select('assets').eq('category', category.Category).single();
      const assets = existing?.assets || {};
      assets[section.toLowerCase().replace(/ /g, '_')] = pubUrl.publicUrl;

      await supabaseAdmin.from('category_assets').update({ assets }).eq('category', category.Category);

      return NextResponse.json({ success: true, url: pubUrl.publicUrl });
    }

  } catch (error: any) {
    console.error("API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
