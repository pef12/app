
import React, { useState } from 'react';
import { Task, TaskStatus, TaskCategory, ProjectInfo } from '../types';
import { generateTaskSteps, getSuggestedFunctions } from '../services/geminiService';

interface TaskBoardProps {
  tasks: Task[];
  projectInfo: ProjectInfo;
  addTask: (task: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  removeTask: (id: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, projectInfo, addTask, updateTaskStatus, removeTask }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedTaskSteps, setSelectedTaskSteps] = useState<string | null>(null);
  const [loadingSteps, setLoadingSteps] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: TaskCategory.GAMEPLAY,
    priority: 'Média' as Task['priority']
  });

  const handleAddTask = () => {
    if (!newTask.title) return;
    addTask(newTask);
    setNewTask({ title: '', description: '', category: TaskCategory.GAMEPLAY, priority: 'Média' });
    setIsAdding(false);
  };

  const loadSuggestions = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    const res = await getSuggestedFunctions(projectInfo.name, projectInfo.genre);
    setSuggestions(res);
  };

  const showAIGuide = async (task: Task) => {
    setLoadingSteps(true);
    setSelectedTaskSteps(null);
    const steps = await generateTaskSteps(task.title, task.category);
    setSelectedTaskSteps(steps);
    setLoadingSteps(false);
  };

  const addSuggestion = (s: any) => {
    addTask({
      title: s.title,
      description: s.description,
      category: s.category as TaskCategory,
      priority: s.priority as Task['priority']
    });
    setSuggestions(prev => prev.filter(item => item.title !== s.title));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Arquitetura de Funções</h2>
          <p className="text-slate-400">Gerencie a lógica e o custo computacional do seu jogo</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadSuggestions}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-5 py-3 rounded-xl font-bold flex items-center gap-2 border border-blue-500/20 transition-all shadow-lg"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i> Sugerir com IA
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="unreal-gradient px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
          >
            <i className="fa-solid fa-plus"></i> Novo Módulo
          </button>
        </div>
      </div>

      {/* Sugestões Modal */}
      {isSuggesting && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex items-center justify-center p-4 overflow-hidden">
          <div className="glass-card w-full max-w-4xl max-h-[85vh] flex flex-col rounded-[2.5rem] border-slate-700/50 shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 text-xl border border-blue-500/20">
                  <i className="fa-solid fa-lightbulb"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Sugestões de Arquitetura</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Baseado em: {projectInfo.genre}</p>
                </div>
              </div>
              <button onClick={() => setIsSuggesting(false)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-full">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-4">
              {suggestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-blue-400 font-bold animate-pulse">Analisando mecânicas ideais...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((s, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/10">{s.category}</span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{s.priority} Priority</span>
                      </div>
                      <h4 className="text-white font-bold text-lg mb-2">{s.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed mb-6">{s.description}</p>
                      <button 
                        onClick={() => addSuggestion(s)}
                        className="w-full py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-blue-600/20"
                      >
                        <i className="fa-solid fa-plus-circle"></i> Adicionar ao Projeto
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="glass-card p-6 rounded-2xl border-blue-500/30 bg-blue-900/5 animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nome do Módulo (ex: Sistema de Combate)"
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            />
            <select 
              className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              value={newTask.category}
              onChange={(e) => setNewTask({...newTask, category: e.target.value as TaskCategory})}
            >
              {Object.values(TaskCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Quais as regras de negócio e requisitos de performance?"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 mb-4 h-24"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          />
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
               <span className="text-sm text-slate-400">Prioridade:</span>
               {['Baixa', 'Média', 'Alta', 'Crítica'].map(p => (
                 <button 
                  key={p}
                  onClick={() => setNewTask({...newTask, priority: p as Task['priority']})}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${newTask.priority === p ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                 >
                   {p}
                 </button>
               ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleAddTask} className="bg-blue-600 px-6 py-2 rounded-lg font-bold text-white">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => (
          <div key={task.id} className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-6 hover:border-slate-600 transition-all group relative overflow-hidden">
            {task.priority === 'Crítica' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>}
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest ${
                  task.priority === 'Crítica' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
                  task.priority === 'Alta' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                  'bg-slate-800/50 text-slate-400 border border-slate-700'
                }`}>
                  {task.priority}
                </span>
                <span className="text-[11px] text-blue-400/80 font-bold uppercase tracking-tighter">{task.category}</span>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{task.title}</h4>
              <p className="text-slate-400 text-sm line-clamp-2 mt-1">{task.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => showAIGuide(task)}
                className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-inner"
                title="Consultar Guia Técnico"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </button>
              
              <select 
                className="bg-slate-800/80 border border-slate-700/50 rounded-lg py-2 px-4 text-xs font-bold text-slate-200 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none transition-all"
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
              >
                {Object.values(TaskStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <button 
                onClick={() => removeTask(task.id)}
                className="w-8 h-8 flex items-center justify-center text-slate-700 hover:text-rose-500 transition-colors"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {(loadingSteps || selectedTaskSteps) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in">
          <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-[2rem] border-slate-700/50 shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 unreal-gradient rounded-full flex items-center justify-center text-white">
                    <i className="fa-solid fa-code"></i>
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-white tracking-tight">DOCUMENTAÇÃO TÉCNICA</h3>
                   <p className="text-[10px] text-slate-500 font-bold uppercase">Diretrizes de Implementação e Performance</p>
                 </div>
              </div>
              <button onClick={() => { setSelectedTaskSteps(null); setLoadingSteps(false); }} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-full">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar bg-[#0b0e14]/50">
              {loadingSteps ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-400 font-bold animate-pulse text-lg">Processando Arquitetura...</p>
                    <p className="text-slate-500 text-xs mt-1">Otimizando lógica para Unreal Engine 5</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6 flex items-start gap-4">
                    <i className="fa-solid fa-circle-info text-blue-400 mt-1"></i>
                    <p className="text-xs text-blue-200 leading-relaxed font-medium">
                      Esta documentação foi gerada focando no balanço entre **comportamento realista** e **baixo impacto em CPU**. Recomendamos seguir a ordem dos nodes para manter a estrutura assíncrona.
                    </p>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed text-slate-300 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
                    {selectedTaskSteps}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;
