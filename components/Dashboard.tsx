
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Task, TaskStatus, ProjectInfo } from '../types';

interface DashboardProps {
  tasks: Task[];
  projectInfo: ProjectInfo;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, projectInfo }) => {
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const categoryCounts = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(categoryCounts).map(cat => ({
    name: cat.split(' ')[0], // Short name
    total: categoryCounts[cat]
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{projectInfo.name}</h1>
          <p className="text-slate-400">Status Geral do Projeto • Engine: {projectInfo.version}</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Gênero</p>
            <p className="text-white font-medium">{projectInfo.genre}</p>
          </div>
          <div className="h-10 w-px bg-slate-800"></div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Progresso</p>
            <p className="text-blue-400 font-bold">
              {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === TaskStatus.DONE).length / tasks.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="fa-list-check" label="Total de Funções" value={tasks.length} color="blue" />
        <StatCard icon="fa-spinner" label="Em Desenvolvimento" value={statusCounts[TaskStatus.IN_PROGRESS] || 0} color="amber" />
        <StatCard icon="fa-check-double" label="Concluídas" value={statusCounts[TaskStatus.DONE] || 0} color="emerald" />
        <StatCard icon="fa-circle-exclamation" label="Críticas" value={tasks.filter(t => t.priority === 'Crítica').length} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Distribuição de Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Funções por Categoria</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: string, label: string, value: number, color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colorMap[color]} backdrop-blur-sm transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-current/20`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>
        <div>
          <p className="text-sm opacity-70 font-medium">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
