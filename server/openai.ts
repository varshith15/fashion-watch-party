import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTrivia(
  modelName?: string, 
  designerName?: string, 
  context?: string
): Promise<string> {
  try {
    let prompt = "Generate an interesting fashion trivia fact. ";
    
    if (modelName && designerName) {
      prompt += `Focus on the collaboration or connection between model ${modelName} and designer ${designerName}. `;
    } else if (modelName) {
      prompt += `Focus on model ${modelName}'s career, achievements, or runway history. `;
    } else if (designerName) {
      prompt += `Focus on designer ${designerName}'s brand, design philosophy, or notable collections. `;
    }
    
    if (context) {
      prompt += `Additional context: ${context}. `;
    }
    
    prompt += "Keep it concise (under 100 words), engaging, and suitable for a live fashion stream audience. Focus on interesting facts about craftsmanship, design inspiration, career milestones, or fashion history. Respond with JSON in this format: { 'trivia': 'your trivia fact here' }";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a fashion industry expert who provides engaging trivia about models, designers, and fashion history for a live streaming audience."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{"trivia": "Fashion fact not available"}');
    return result.trivia || "Fashion fact not available";
    
  } catch (error) {
    console.error("Error generating trivia:", error);
    return "Unable to generate trivia at this moment.";
  }
}

export async function generateCaption(
  modelName?: string,
  designerName?: string,
  eventName?: string,
  additionalContext?: string
): Promise<string> {
  try {
    let prompt = "Generate an engaging social media caption for a fashion runway moment. ";
    
    if (modelName) prompt += `Model: ${modelName}. `;
    if (designerName) prompt += `Designer: ${designerName}. `;
    if (eventName) prompt += `Event: ${eventName}. `;
    if (additionalContext) prompt += `Context: ${additionalContext}. `;
    
    prompt += "Make it engaging, use relevant emojis, and keep it under 150 characters. Focus on the elegance and artistry. Respond with JSON in this format: { 'caption': 'your caption here' }";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a social media expert specializing in fashion content creation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || '{"caption": "Fashion moment captured ✨"}');
    return result.caption || "Fashion moment captured ✨";
    
  } catch (error) {
    console.error("Error generating caption:", error);
    return "Fashion moment captured ✨";
  }
}

export async function analyzeOutfit(imageBase64: string): Promise<{
  description: string;
  style: string;
  colors: string[];
  materials: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this fashion outfit image. Describe the style, identify key colors, materials, and provide a brief description. Respond with JSON in this format: { 'description': 'brief description', 'style': 'style category', 'colors': ['color1', 'color2'], 'materials': ['material1', 'material2'] }"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      description: result.description || "Fashion item analysis not available",
      style: result.style || "Contemporary",
      colors: result.colors || ["Unknown"],
      materials: result.materials || ["Unknown"]
    };
    
  } catch (error) {
    console.error("Error analyzing outfit:", error);
    return {
      description: "Unable to analyze outfit at this moment",
      style: "Contemporary",
      colors: ["Unknown"],
      materials: ["Unknown"]
    };
  }
}
