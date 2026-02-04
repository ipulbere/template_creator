import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { category, type, color, section } = await req.json();

  try {
    // TASK 1: Generate a single Template
    if (type === 'TEMPLATE') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Generate high-converting Tailwind HTML for ${category.Category} with ${color} accents... [Use previous prompt rules]`;
      const result = await model.generateContent(prompt);
      const html = result.response.text().replace(/```html|```/g, "").trim();

      await supabaseAdmin.from('category_templates').insert({
        category: category.Category,
        html_content: html,
        css_theme: { accent: color, style: category["Website Style"] }
      });
      return NextResponse.json({ success: true });
    }

    // TASK 2: Generate a single Image
    if (type === 'IMAGE') {
      let prompt = `A professional website stock photo: ${section} for a ${category.Category} business.`;
      if (section === "Before and after") {
        prompt = `Professional stock photo. Split image in 2 halves. Left: ${category.Category} messy before. Right: ${category.Category} clean after.`;
      }
      
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true`;
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const fileName = `${category.Category.replace(/\s/g, '_')}_${section.replace(/\s/g, '_')}.jpg`;
      
      await supabaseAdmin.storage.from('category_assets').upload(fileName, blob, { upsert: true });
      const { data } = supabaseAdmin.storage.from('category_assets').getPublicUrl(fileName);

      // Update the assets column in DB
      const { data: existing } = await supabaseAdmin.from('category_assets').select('assets').eq('category', category.Category).single();
      const currentAssets = existing?.assets || {};
      currentAssets[section.toLowerCase().replace(/ /g, '_')] = data.publicUrl;

      await supabaseAdmin.from('category_assets').update({ assets: currentAssets }).eq('category', category.Category);
      
      return NextResponse.json({ success: true, url: data.publicUrl });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
