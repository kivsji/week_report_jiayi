import { GoogleGenAI } from "@google/genai";
import { ExcelRow } from "../types";

const initGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeFeedback = async (rows: ExcelRow[]): Promise<string> => {
  try {
    const ai = initGenAI();
    
    // Filter only relevant columns to save tokens and privacy
    const feedbackData = rows
      .filter(r => r["反馈内容（含表扬）"] || r["待跟进专项"])
      .map(r => `反馈: ${r["反馈内容（含表扬）"]}, 跟进: ${r["反馈内容跟进"]}, 待办: ${r["待跟进专项"]}, 态度: ${r["业主态度群诉态度"]}`)
      .slice(0, 100); // Limit to top 100 for token limits if necessary

    const prompt = `
      作为一名物业经理助理，请分析以下业主拜访记录（JSON格式摘要）。
      请帮我提取主要事项，生成一份简短的"主要事项总结"（HTML格式，使用<ul><li>）。
      重点关注：
      1. 高频提到的问题是什么？
      2. 态度恶劣或投诉的主要原因。
      3. 还有哪些紧急待解决的事项。
      
      请保持简洁专业。不要包含任何个人隐私信息（如电话、具体房号）。
      
      数据如下:
      ${JSON.stringify(feedbackData)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "无法生成分析。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 分析服务暂时不可用，请检查网络或 API Key。";
  }
};

export const formatWeeklyWork = async (rawText: string): Promise<string> => {
  try {
    const ai = initGenAI();
    const prompt = `
      我将提供一段物业经理的本周工作杂记。请帮我整理成两个清晰的HTML部分：
      1. <h3>已完成工作</h3> (列出已完成的项目，使用 <ul><li>)
      2. <h3>待跟进工作</h3> (列出未完成或需持续跟进的项目，使用 <ul><li>)
      
      如果内容中没有明确区分，请根据语义推断。保持语气职业。
      
      输入内容:
      ${rawText}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text || rawText;
  } catch (error) {
    return rawText; // Fallback to raw text
  }
};
