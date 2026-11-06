import { executeTextEnhancement } from "./text-enhancement";

export interface ImproveTaskTitleInput {
  title: string;
  description?: string;
  boardName?: string;
  boardDescription?: string;
}

export interface ImproveTaskDescriptionInput {
  title: string;
  description: string;
  boardName?: string;
  boardDescription?: string;
}

const TASK_TITLE_INSTRUCTIONS = `You are an expert writing assistant for a Kanban task management app.
Your task is to improve the user's task title.

Instructions:
- Preserve the original meaning, intent, and scope.
- Make the title clear, concise, specific, and action-oriented when appropriate.
- Use the task description and parent board context to understand the task, but avoid introducing unsupported requirements.
- Strictly keep the improved title under 50 characters to fit a Kanban card.
- Preserve the language of the original text (e.g., Arabic -> Arabic, English -> English).
- Return only the improved title.`;

const TASK_DESCRIPTION_INSTRUCTIONS = `You are an expert writing assistant for a Kanban task management app.
Your task is to improve the user's task description.

Instructions:
- Preserve all original details, meaning, technical terms, and scope.
- Improve clarity, readability, and sentence structure using clean markdown.
- Use the task title and parent board context to understand the task context.
- Never invent new requirements, implementation details, or unstated assumptions.
- Strictly keep the improved description under 2000 characters.
- Preserve the language of the original text (e.g., Arabic -> Arabic, English -> English).
- Return only the improved description.`;

export async function improveTaskTitle({
  title,
  description,
  boardName,
  boardDescription,
}: ImproveTaskTitleInput): Promise<string> {
  const context = [
    boardName?.trim() && `Parent Board: ${boardName.trim()}`,
    boardDescription?.trim() && `Board Description: ${boardDescription.trim()}`,
    description?.trim() && `Task Description:\n${description.trim()}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = [
    "Improve this task title according to the instructions.",
    context ? `<context>\n${context}\n</context>` : "",
    `<current_title>\n${title.trim()}\n</current_title>`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return executeTextEnhancement({
    prompt,
    systemInstruction: TASK_TITLE_INSTRUCTIONS,
    maxLength: 50,
    label: "task title",
  });
}

export async function improveTaskDescription({
  title,
  description,
  boardName,
  boardDescription,
}: ImproveTaskDescriptionInput): Promise<string> {
  const context = [
    boardName?.trim() && `Parent Board: ${boardName.trim()}`,
    boardDescription?.trim() && `Board Description: ${boardDescription.trim()}`,
    `Task Title: ${title.trim()}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const prompt = [
    "Improve this task description according to the instructions.",
    `<context>\n${context}\n</context>`,
    `<current_description>\n${description.trim()}\n</current_description>`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return executeTextEnhancement({
    prompt,
    systemInstruction: TASK_DESCRIPTION_INSTRUCTIONS,
    maxLength: 2000,
    label: "task description",
  });
}

