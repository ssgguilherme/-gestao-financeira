import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Settings,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  Save,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  Smartphone
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const ProfileView: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manipulador de upload de imagem direto do celular ou computador
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Por favor, selecione um arquivo de imagem válido.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Redimensiona para foto de perfil otimizada (máximo 256x256)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          setFeedback({
            type: 'success',
            text: 'Foto selecionada! Clique no botão "Salvar Alterações" abaixo para confirmar.'
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ type: 'error', text: 'Informe um nome válido.' });
      return;
    }

    setIsSavingProfile(true);

    try {
      const res = await api.updateProfile({
        name: name.trim(),
        avatarUrl: avatarUrl ? avatarUrl : ''
      });
      updateUser(res.user);
      setFeedback({
        type: 'success',
        text: 'Perfil atualizado com sucesso! Seu nome e foto já estão sendo exibidos no painel.'
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Erro ao atualizar dados.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'A confirmação da nova senha não confere.' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await api.updateProfile({
        currentPassword,
        newPassword
      });
      updateUser(res.user);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', text: 'Senha alterada com sucesso!' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Senha atual incorreta.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          <span>Configurações da Conta</span>
        </h1>
        <p className="text-xs text-slate-400">
          Altere sua foto de perfil diretamente do celular, o nome exibido no painel e sua senha de acesso.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2 text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Nome e Upload de Foto */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Foto de Perfil & Nome</span>
          </h2>

          {/* Seletor Visual de Foto */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="relative group self-center sm:self-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden flex-shrink-0 border-2 border-emerald-500/40">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name || user.name} className="w-full h-full object-cover" />
                ) : (
                  (name || user.name).charAt(0).toUpperCase()
                )}
              </div>

              {/* Botão de câmera sobreposto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-emerald-500 text-white shadow-md hover:bg-emerald-600 transition-transform active:scale-90"
                title="Trocar foto"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold text-white">Escolha uma foto sua</div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Toque no botão para selecionar uma foto da galeria do seu celular ou tirar uma foto nova.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Escolher do Celular</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                )}
              </div>

              {/* Input escondido para acionamento do arquivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Nome de Exibição no Painel *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Seu Nome ou Apelido"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                E-mail da Conta (Não editável)
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? 'Salvando...' : 'Salvar Alterações (Nome e Foto)'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Alterar Senha */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-black text-white">Alterar Senha de Acesso</h2>
          </div>
          <p className="text-xs text-slate-400">
            Digite sua senha atual e defina a nova senha para sua conta.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Senha Atual *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">
                Nova Senha * (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Confirmar Nova Senha *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isChangingPass ? 'Processando...' : 'Atualizar Senha'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Card 3: Aplicativo PWA (Instalar no Celular ou Notebook) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-lg shadow-emerald-500/10 flex-shrink-0">
              <img src="/icons/icon-192.png" alt="FinanFlow" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Aplicativo FinanFlow (PWA)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Instalável
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Instale o app diretamente no seu celular ou computador para abrir em tela cheia com o novo ícone.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-md pt-2">
          <PWAInstallButton isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};
