import { type FC, type FormEvent, useState } from 'react';
import { X, Trash2, UserPlus } from 'lucide-react';

interface ManageAgentsModalProps {
  isOpen: boolean;
  agents: string[];
  ownerEmail: string;
  onClose: () => void;
  onAddAgent: (email: string) => Promise<void>;
  onRemoveAgent: (email: string) => Promise<void>;
}

export const ManageAgentsModal: FC<ManageAgentsModalProps> = ({
  isOpen,
  agents,
  ownerEmail,
  onClose,
  onAddAgent,
  onRemoveAgent,
}) => {
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!cleaned) return;
    setIsSaving(true);
    try {
      await onAddAgent(cleaned);
      setEmail('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            Manage Agents
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="agent@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="font-medium text-slate-900">{ownerEmail}</span>
              <span className="text-slate-500">Owner</span>
            </div>

            {agents
              .filter((a) => a.toLowerCase() !== ownerEmail.toLowerCase())
              .map((agentEmail) => (
                <div
                  key={agentEmail}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                >
                  <span className="text-slate-800">{agentEmail}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveAgent(agentEmail)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Remove agent"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
