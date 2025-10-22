import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SkinAnalysisResult } from '../types/skinAnalysis';

// Ensure the API key is available in the environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we assume it's always provided.
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Gemini API calls will fail.");
}

const genAI = new GoogleGenerativeAI(API_KEY!);

export const generateBeautyTip = async (): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Provide a short, insightful beauty tip for general consumers interested in skincare and makeup. Keep it under 50 words and format it as a single paragraph.' }]
      }],
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating beauty tip:", error);
    return "Failed to generate a beauty tip. Please check your connection and API key.";
  }
};

interface FaceValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validateFaceImage = async (imageBase64: string): Promise<FaceValidationResult> => {
  try {
    // Remove "data:image/xxx;base64," prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      },
      {
        text: `この画像を分析して、肌診断に適した顔写真かどうかを判定してください。

以下の基準で判定し、JSON形式で回答してください:
{
  "hasFace": true/false (顔が写っているか),
  "faceVisibility": "clear"/"partial"/"unclear" (顔全体が明確に見えるか),
  "brightness": "good"/"dark"/"overexposed" (明るさは適切か),
  "angle": "frontal"/"angled"/"profile" (正面から撮影されているか),
  "quality": "good"/"acceptable"/"poor" (画質は十分か),
  "isValid": true/false (肌診断に使用可能か),
  "errorMessage": "エラーメッセージ（isValidがfalseの場合のみ）"
}

判定基準:
- 顔が写っていない場合: isValid = false, errorMessage = "顔が検出されませんでした。顔全体が写っている写真をアップロードしてください。"
- 顔の一部しか写っていない場合: isValid = false, errorMessage = "顔全体が写っていません。顔全体が写るように撮影してください。"
- 暗すぎる場合: isValid = false, errorMessage = "写真が暗すぎます。明るい場所で撮影してください。"
- 明るすぎる場合: isValid = false, errorMessage = "写真が明るすぎます。直射日光を避けて撮影してください。"
- 正面ではない場合: isValid = false, errorMessage = "正面から撮影してください。顔を正面に向けて撮影し直してください。"
- 画質が悪い場合: isValid = false, errorMessage = "画質が不十分です。ピントを合わせて撮影し直してください。"
- 顔以外のもの（動物、物体など）: isValid = false, errorMessage = "人間の顔が検出されませんでした。ご自身の顔写真をアップロードしてください。"

すべての条件を満たす場合のみ isValid = true としてください。
必ずJSON形式で回答してください。マークダウンのコードブロックは使用しないでください。`
      }
    ]);

    const response = result.response;
    const parsedResult = JSON.parse(response.text());

    if (!parsedResult.isValid) {
      return {
        isValid: false,
        errorMessage: parsedResult.errorMessage || "この画像は肌診断に適していません。撮影ガイドを参考に撮り直してください。"
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating face image:", error);
    // バリデーションエラーの場合は安全側に倒して通す（AIの判定ミスを避けるため）
    return { isValid: true };
  }
};

export const analyzeSkinImage = async (imageBase64: string): Promise<SkinAnalysisResult> => {
  try {
    // Remove "data:image/xxx;base64," prefix if present
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      },
      {
        text: `この肌画像を美容専門家の視点で詳しく分析し、以下の形式のJSONで回答してください:
{
  "skinType": "乾燥肌/脂性肌/混合肌/普通肌のいずれか",
  "concerns": ["肌悩み1", "肌悩み2", "肌悩み3"],
  "condition": {
    "moisture": "水分状態の評価（良好/やや不足/不足など）",
    "texture": "肌理の評価（整っている/やや粗い/粗いなど）",
    "clarity": "透明感の評価（高い/普通/低いなど）",
    "moistureScore": 1から5の数値（5が最良、1が最悪）,
    "textureScore": 1から5の数値（5が最良、1が最悪）,
    "clarityScore": 1から5の数値（5が最良、1が最悪）,
    "elasticityScore": 1から5の数値（5が最良、1が最悪）,
    "poreScore": 1から5の数値（5が最良、1が最悪）
  },
  "recommendations": ["具体的なケア方法1", "具体的なケア方法2", "具体的なケア方法3"],
  "avoid": ["避けるべき成分や行動1", "避けるべき成分や行動2"]
}

重要:
- 各スコアは必ず1から5の整数で評価してください
- スコアが高いほど良い状態です
- 明確な差をつけて評価してください（3点は避け、1-2点または4-5点を積極的に使用）
- 良好な項目は5点、やや良いは4点
- やや悪いは2点、悪いは1点
- 中程度（3点）は本当に判断が難しい場合のみ使用
- moistureScore: 水分量の豊富さ（乾燥している=1-2、潤っている=4-5）
- textureScore: 肌理の細かさ・滑らかさ（粗い=1-2、滑らか=4-5）
- clarityScore: 透明感・くすみのなさ（くすんでいる=1-2、透明感がある=4-5）
- elasticityScore: 弾力・ハリ（弾力がない=1-2、ハリがある=4-5）
- poreScore: 毛穴の目立たなさ（目立つ=1-2、目立たない=4-5）

レーダーチャートで視覚的に分かりやすくなるよう、メリハリのある評価をしてください。

必ずJSON形式で回答してください。マークダウンのコードブロックは使用しないでください。`
      }
    ]);

    const response = result.response;
    const parsedResult = JSON.parse(response.text());
    return parsedResult as SkinAnalysisResult;
  } catch (error) {
    console.error("Error analyzing skin:", error);
    throw new Error("肌診断に失敗しました。しばらく経ってから再度お試しください。");
  }
};