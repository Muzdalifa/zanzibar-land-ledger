import { type FC, type FormEvent, useState } from 'react';
import { Trash2, UserPlus, Shield } from 'lucide-react';

export interface AgentRecord {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  addedAt?: string;
}

interface AgentsViewProps {
  agents: AgentRecord[];
  ownerEmail: string;
  onAddAgent: (agent: { email: string; name: string; phone: string }) => Promise<void>;
  onRemoveAgent: (id: string) => Promise<void>;
}

export const AgentsView: FC<AgentsViewProps> = ({
  agents,
  ownerEmail,
  onAddAgent,
  onRemoveAgent,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail) return;
    setIsSaving(true);
    try {
      await onAddAgent({
        email: cleanedEmail,
        name: name.trim(),
        phone: phone.trim(),
      });
      setName('');
      setEmail('');
      setPhone('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">
          Add Authorized Agent
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Agents can sign in with their Google email to add or edit sites and plots.
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Full Name (e.g. Ali Khamis)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <input
            type="email"
            required
            placeholder="Google Email (e.g. agent@gmail.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            Add Agent
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Agent Records ({agents.filter((a) => a.email.toLowerCase() !== ownerEmail.toLowerCase()).length + 1})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Role</th>
                <th className="py-3 px-6">Added</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="bg-slate-50/50">
                <td className="py-3 px-6 font-medium text-slate-900">Primary Owner</td>
                <td className="py-3 px-6 text-slate-700">{ownerEmail}</td>
                <td className="py-3 px-6 text-slate-500">—</td>
                <td className="py-3 px-6">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                    <Shield className="w-3.5 h-3.5" />
                    Owner
                  </span>
                </td>
                <td className="py-3 px-6 text-slate-500">—</td>
                <td className="py-3 px-6 text-right text-xs text-slate-400">Protected</td>
              </tr>

              {agents
                .filter((a) => a.email.toLowerCase() !== ownerEmail.toLowerCase())
                .map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-medium text-slate-900">
                      {agent.name || '—'}
                    </td>
                    <td className="py-3 px-6 text-slate-700">{agent.email}</td>
                    <td className="py-3 px-6 text-slate-600">{agent.phone || '—'}</td>
                    <td className="py-3 px-6 text-slate-600 capitalize">{agent.role || 'agent'}</td>
                    <td className="py-3 px-6 text-slate-500 text-xs">
                      {agent.addedAt ? agent.addedAt.slice(0, 10) : '—'}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onRemoveAgent(agent.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                        title="Remove agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
