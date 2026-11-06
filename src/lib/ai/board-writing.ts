import { executeTextEnhancement } from "./text-enhancement";

export interface ImproveBoardTitleInput {
  title: string;
  description?: string;
  template?: string;
}

export interface ImproveBoardDescriptionInput {
  title: string;
  description: string;
  template?: string;
}

const BOARD_TITLE_INSTRUCTIONS = `You are an expert writing assistant for a Kanban productivity app.
Your task is to improve the user's Kanban board name.

Instructions:
- Preserve the original meaning, purpose, and intent of the board.
- Make the board title clear, concise, professional, and memorable.
- Use the board description and template context when provided.
- Strictly keep the improved title under 50 characters.
- Preserve the language of the original text (e.g., Arabic -> Arabic, English -> English).
- Return only the improved title.`;

const BOARD_DESCRIPTION_INSTRUCTIONS = `You are an expert writing assistant for a Kanban productivity app.
Your task is to improve the user's Kanban board description.

Instructions:
- Preserve the board's purpose, scope, and key details.
- Make the description clear, helpful, and concise.
- Use the board title and template context to understand the board's purpose.
- Strictly keep the improved description under 500 characters.
- Preserve the language of the original text (e.g., Arabic -> Arabic, English -> English).
- Return only the improved description.`;

export async function improveBoardTitle({
  title,
  description,
  template,
}: ImproveBoardTitleInput): Promise<string> {
  const context = [
    template?.trim() && `Board Template: ${template.trim()}`,
    description?.trim() && `Board Description:\n${description.trim()}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = [
    "Improve this board name according to the instructions.",
    context ? `<context>\n${context}\n</context>` : "",
    `<current_name>\n${title.trim()}\n</current_name>`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return executeTextEnhancement({
    prompt,
    systemInstruction: BOARD_TITLE_INSTRUCTIONS,
    maxLength: 50,
    label: "board title",
  });
}

export async function improveBoardDescription({
  title,
  description,
  template,
}: ImproveBoardDescriptionInput): Promise<string> {
  const context = [
    template?.trim() && `Board Template: ${template.trim()}`,
    `Board Name: ${title.trim()}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = [
    "Improve this board description according to the instructions.",
    `<context>\n${context}\n</context>`,
    `<current_description>\n${description.trim()}\n</current_description>`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return executeTextEnhancement({
    prompt,
    systemInstruction: BOARD_DESCRIPTION_INSTRUCTIONS,
    maxLength: 500,
    label: "board description",
  });
}
