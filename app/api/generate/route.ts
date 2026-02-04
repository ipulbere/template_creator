export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: Request) {
  try {
    const { category, type, color, section } = await req.json();

    if (!apiKey) return NextResponse.json({ error: "API Key missing in Vercel" }, { status: 500 });

    // --- TASK: TEMPLATE ---
    if (type === 'TEMPLATE') {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Generate a high-converting single-page website HTML for a ${category.Category} business. 
      Use Tailwind CSS via CDN. Style: ${category["Website Style"]}. Accent Color: ${color}.
      Include sections: Hero, Services, About, Testimonials.
      Use exactly these markers for images: [DESC_PHOTO: Hero], [DESC_PHOTO: Product], [DESC_PHOTO: Team], [DESC_PHOTO: Work], [DESC_PHOTO: Before/After].
      Return ONLY the HTML code, no markdown blocks.`;

      const result = await model.generateContent(prompt);
      const htmlText = result.response.text();
      const cleanHtml = htmlText.replace(/```html|```/g, "").trim();

      const { error: dbError } = await supabaseAdmin.from('category_templates').insert({
        category: category.Category,
        html_content: cleanHtml,
        css_theme: { accent: color, style: category["Website Style"] }
      });

      if (dbError) throw new Error(`Database Error: ${dbError.message}`);
      return NextResponse.json({ success: true });
    }

    // --- TASK: IMAGE ---
    if (type === 'IMAGE') {
      const prompt = section === "Before and after" 
        ? `Professional stock photo. Split image in 2 halves. Left: ${category.Category} work area messy. Right: same area perfectly finished.`
        : `A professional website stock photo: ${section} for ${category.Category} business.`;

      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&seed=${Math.random()}`;
      
      const imgRes = await fetch(imageUrl);
      const blob = await imgRes.blob();
      const fileName = `${category.Category.replace(/\s/g, '_')}_${section.replace(/\s/g, '_')}.jpg`;

      const { error: uploadError } = await supabaseAdmin.storage.from('category_assets').upload(fileName, blob, { upsert: true });
      if (uploadError) throw new Error(`Upload Error: ${uploadError.message}`);

      const { data: pub } = supabaseAdmin.storage.from('category_assets').getPublicUrl(fileName);
      
      // Update assets column
      const { data: row } = await supabaseAdmin.from('category_assets').select('assets').eq('category', category.Category).single();
      const currentAssets = row?.assets || {};
      currentAssets[section.toLowerCase().replace(/ /g, '_')] = pub.publicUrl;

      await supabaseAdmin.from('category_assets').update({ assets: currentAssets }).eq('category', category.Category);
      
      return NextResponse.json({ success: true, url: pub.publicUrl });
    }

    return NextResponse.json({ error: "Invalid Type" }, { status: 400 });

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
