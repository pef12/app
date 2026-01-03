
export enum TaskStatus {
  TODO = 'Pendente',
  IN_PROGRESS = 'Em Progresso',
  DONE = 'Concluído',
  BLOCKED = 'Bloqueado'
}

export enum TaskCategory {
  GAMEPLAY = 'Gameplay',
  AI = 'Inteligência Artificial',
  GRAPHICS = 'Gráficos/VFX',
  UI = 'Interface (UI/UX)',
  AUDIO = 'Áudio',
  NETWORKING = 'Networking',
  CORE = 'Core Engine/C++'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
}

export interface ProjectInfo {
  name: string;
  genre: string;
  version: string;
  targetPlatforms: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}
