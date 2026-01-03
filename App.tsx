
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import AIAssistant from './components/AIAssistant';
import { Task, TaskStatus, TaskCategory, ProjectInfo } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: 'Meu Super RPG 3D',
    genre: 'RPG de Ação',
    version: '5.4.1',
    targetPlatforms: ['PC', 'PlayStation 5']
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ue5_tasks');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Sistema de Movimentação Base',
        description: 'Implementar movimentação WSAD com Character Controller e suporte a gamepad.',
        category: TaskCategory.GAMEPLAY,
        status: TaskStatus.DONE,
        priority: 'Crítica'
      },
      {
        id: '2',
        title: 'Iluminação Global Lumen',
        description: 'Configurar post-process e directional light para iluminação dinâmica total.',
        category: TaskCategory.GRAPHICS,
        status: TaskStatus.IN_PROGRESS,
        priority: 'Alta'
      },
      {
        id: '3',
        title: 'IA de Inimigo Básico',
        description: 'Behavior Tree simples com estados de Patrulha e Perseguição.',
        category: TaskCategory.AI,
        status: TaskStatus.TODO,
        priority: 'Média'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ue5_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || 'Nova Função',
      description: taskData.description || '',
      category: taskData.category || TaskCategory.GAMEPLAY,
      status: TaskStatus.TODO,
      priority: taskData.priority || 'Média'
    };
    setTasks([newTask, ...tasks]);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tasks={tasks} projectInfo={projectInfo} />;
      case 'tasks':
        return <TaskBoard tasks={tasks} projectInfo={projectInfo} addTask={addTask} updateTaskStatus={updateTaskStatus} removeTask={removeTask} />;
      case 'ai-assistant':
        return <AIAssistant projectInfo={projectInfo} />;
      case 'resources':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
            <ResourceCard title="Documentação Oficial" icon="fa-book-open" link="https://dev.epicgames.com/documentation/en-us/unreal-engine/" color="blue" />
            <ResourceCard title="Unreal Marketplace" icon="fa-store" link="https://www.unrealengine.com/marketplace/" color="amber" />
            <ResourceCard title="UE5 Roadmap" icon="fa-map" link="https://www.unrealengine.com/en-US/release-notes" color="emerald" />
            <ResourceCard title="C++ API Reference" icon="fa-code" link="https://dev.epicgames.com/documentation/en-us/unreal-engine/api/" color="purple" />
            <ResourceCard title="Quixel Megascans" icon="fa-cube" link="https://quixel.com/megascans/" color="rose" />
            <ResourceCard title="Unreal Forums" icon="fa-comments" link="https://forums.unrealengine.com/" color="indigo" />
          </div>
        );
      case 'settings':
        return (
          <div className="glass-card p-10 rounded-3xl max-w-2xl mx-auto space-y-8 border-slate-800">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <i className="fa-solid fa-sliders text-blue-500"></i> Configurações do Projeto
            </h2>
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-400 mb-2">Nome do Projeto</label>
                 <input 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none"
                  value={projectInfo.name}
                  onChange={(e) => setProjectInfo({...projectInfo, name: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-400 mb-2">Gênero</label>
                   <input 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none"
                    value={projectInfo.genre}
                    onChange={(e) => setProjectInfo({...projectInfo, genre: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-400 mb-2">Versão Unreal</label>
                   <input 
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:border-blue-500 focus:outline-none"
                    value={projectInfo.version}
                    onChange={(e) => setProjectInfo({...projectInfo, version: e.target.value})}
                   />
                 </div>
               </div>
               <button className="w-full unreal-gradient py-4 rounded-xl font-bold text-white hover:opacity-90 transition-all">Salvar Alterações</button>
            </div>
          </div>
        );
      default:
        return <Dashboard tasks={tasks} projectInfo={projectInfo} />;
    }
  };

  return (
    <div className="flex bg-[#0b0e14] min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const ResourceCard = ({ title, icon, link, color }: { title: string, icon: string, link: string, color: string }) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-500', amber: 'text-amber-500', emerald: 'text-emerald-500', purple: 'text-purple-500', rose: 'text-rose-500', indigo: 'text-indigo-500'
  };

  return (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="glass-card p-6 rounded-2xl flex flex-col items-center text-center gap-4 hover:border-slate-500 transition-all hover:-translate-y-1 group"
    >
      <div className={`text-4xl ${colors[color]} group-hover:scale-110 transition-transform`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h4 className="font-bold text-lg text-white">{title}</h4>
      <p className="text-sm text-slate-500">Acesse recursos externos de alta qualidade para UE5.</p>
    </a>
  );
};

export default App;
