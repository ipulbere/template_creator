export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use whatever name you saved in Vercel (GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_KEY)
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

export async function POST(req: Request) {
  try {
    const { category, type, color, section } = await req.json();

    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in Environment Variables");

    // TASK 1: TEMPLATE
    if (type === 'TEMPLATE') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate a high-converting Tailwind HTML for ${category.Category} with ${color} accents. Use symbols for services. Include markers [DESC_PHOTO: context].`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const html = response.text().replace(/```html|```/g, "").trim();

      const { error: dbError } = await supabaseAdmin.from('category_templates').insert({
        category: category.Category,
        html_content: html,
        css_theme: { accent: color, style: category["Website Style"] }
      });

      if (dbError) throw new Error(`Supabase Template Error: ${dbError.message}`);
      return NextResponse.json({ success: true });
    }

    // TASK 2: IMAGE
    if (type === 'IMAGE') {
      let imagePrompt = `A professional website stock photo: ${section} for a ${category.Category} business.`;
      if (section === "Before and after") {
        imagePrompt = `Professional stock photo. Split image in 2 halves. Left: ${category.Category} messy before. Right: ${category.Category} clean after.`;
      }
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=1280&height=720&nologo=true`;
      const imgRes = await fetch(imageUrl);
      const blob = await imgRes.blob();
      const fileName = `${category.Category.replace(/\s/g, '_')}_${section.replace(/\s/g, '_')}_${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabaseAdmin.storage.from('category_assets').upload(fileName, blob, { upsert: true });
      if (uploadError) throw new Error(`Upload Error: ${uploadError.message}`);

      const { data: publicUrlData } = supabaseAdmin.storage.from('category_assets').getPublicUrl(fileName);

      const { data: existing } = await supabaseAdmin.from('category_assets').select('assets').eq('category', category.Category).single();
      const currentAssets = existing?.assets || {};
      currentAssets[section.toLowerCase().replace(/ /g, '_')] = publicUrlData.publicUrl;

      const { error: tableError } = await supabaseAdmin.from('category_assets').update({ assets: currentAssets }).eq('category', category.Category);
      if (tableError) throw new Error(`Asset Table Error: ${tableError.message}`);

      return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
    }

  } catch (error: any) {
    console.error("GENERATION ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
