
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getGeminiResponse = async (prompt: string, context?: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `Você é um Arquiteto Sênior de Unreal Engine 5.
  Sua resposta DEVE ser dividida em seções claras usando estes marcadores:

  [CONVERSA]
  (Sua resposta amigável e explicativa aqui)

  [BLUEPRINT]
  | Nome do Node | Função | Performance | Snippet C++ |
  | :--- | :--- | :--- | :--- |
  (Liste os nodes aqui. Na coluna Snippet C++, coloque apenas a linha de código principal da API da Unreal)

  [LOGICA]
  (Explique o fluxo lógico passo a passo, conexões de pinos e regras de negócio)

  DIRETRIZES TÉCNICAS:
  1. Use nomes exatos de nodes (ex: 'Spawn Actor from Class').
  2. No Snippet C++, use a sintaxe oficial da UE5 (ex: GetWorld()->SpawnActor<T>(...)).
  3. Evite o Event Tick sempre que possível.
  4. Responda em Português do Brasil.
  
  Contexto: ${context || 'Nenhum contexto fornecido'}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        topP: 0.9,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "[CONVERSA]\nErro ao acessar a arquitetura da IA. Verifique sua chave de API.";
  }
};

export const getSuggestedFunctions = async (projectName: string, genre: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Como arquiteto de UE5, sugira 5 funções/módulos essenciais para um jogo do gênero "${genre}" chamado "${projectName}". Retorne uma lista com título e descrição curta.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              priority: { type: Type.STRING }
            },
            required: ["title", "description", "category", "priority"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error suggesting functions:", error);
    return [];
  }
};

export const generateTaskSteps = async (taskTitle: string, category: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Gere um guia técnico para "${taskTitle}". Liste os nodes essenciais em uma tabela com C++ snippets.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Mentor técnico de Unreal Engine 5.",
      },
    });
    return response.text;
  } catch (error) {
    return "Erro ao gerar documentação.";
  }
};
