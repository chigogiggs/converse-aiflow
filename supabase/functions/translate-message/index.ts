import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "tr", name: "Turkish" },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    const languageList = languages.map(lang => lang.name).join(', ');
    const prompt = `Translate this text to ${languageList}. Maintain the case (lowercase/uppercase) of the original text. Your response must be a valid JSON object where each key is a language name from the list and the value is the translated text. Do not include any additional text or explanations. Format your entire response as a JSON object.\n\nExample format:\n{"English": "Hello", "Spanish": "Hola"}\n\nText to translate: ${text}`;

    console.log('Translation prompt:', prompt);

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a translation assistant. Always respond with valid JSON objects containing translations. Never include additional text or explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await openAIResponse.json();
    console.log('OpenAI response:', data);

    let translations: Record<string, string> = {};
    try {
      const translationsJson = JSON.parse(data.choices[0].message.content);
      
      // Convert language names to codes
      for (const [langName, translation] of Object.entries(translationsJson)) {
        const language = languages.find(l => l.name.toLowerCase() === langName.toLowerCase());
        if (language) {
          translations[language.code] = translation as string;
        }
      }
    } catch (parseError) {
      console.error('Error parsing translations:', parseError);
      throw new Error('Failed to parse translation response');
    }

    console.log('Final translations:', translations);

    return new Response(
      JSON.stringify({ translations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});