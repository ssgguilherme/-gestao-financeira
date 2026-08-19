import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  LogOut,
  Check,
  Smartphone,
  Bell,
  Wifi,
  Download,
  Camera,
  Key,
  Building2,
  FileText,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  ShieldCheck,
  Save,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';
import { api } from '../services/api';

export const ProfileView: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const {
    isInstallable,
    isInstalled,
    isOnline,
    installApp,
    requestNotifications,
    notificationPermission
  } = usePWA();

  // Personal Info
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Company / Business Info
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [companyDocument, setCompanyDocument] = useState(user?.companyDocument || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'pj');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [cityState, setCityState] = useState(user?.cityState || '');
  const [address, setAddress] = useState(user?.address || '');
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState<string>(
    user?.monthlyRevenueTarget !== undefined ? String(user.monthlyRevenueTarget) : ''
  );
  const [financialNotes, setFinancialNotes] = useState(user?.financialNotes || '');

  // State controls
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
      setCompanyName(user.companyName || '');
      setCompanyDocument(user.companyDocument || '');
      setBusinessType(user.businessType || 'pj');
      setOccupation(user.occupation || '');
      setCityState(user.cityState || '');
      setAddress(user.address || '');
      setMonthlyRevenueTarget(user.monthlyRevenueTarget !== undefined ? String(user.monthlyRevenueTarget) : '');
      setFinancialNotes(user.financialNotes || '');
    }
  }, [user]);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  ];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const numRevenue = monthlyRevenueTarget ? parseFloat(monthlyRevenueTarget.replace(/\./g, '').replace(',', '.')) : 0;

      await updateProfile({
        name,
        email,
        phone,
        avatarUrl,
        companyName,
        companyDocument,
        businessType,
        occupation,
        cityState,
        address,
        monthlyRevenueTarget: isNaN(numRevenue) ? 0 : numRevenue,
        financialNotes
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar dados do perfil e da empresa.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setChangingPass(true);
    setPassMessage(null);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPassMessage({ type: 'success', text: res.message || 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassMessage({ type: 'error', text: err.message || 'Erro ao alterar senha.' });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#222b3d] pb-6">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={avatarUrl || user?.avatarUrl || avatars[0]}
                alt={name || user?.name}
                className="w-20 h-20 rounded-2xl border-2 border-emerald-500 object-cover shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-white dark:border-[#141a26]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {name || user?.name || 'Seu Nome'}
                </h1>
                {companyName && (
                  <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-[#e2f163] px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center space-x-1">
                    <Building2 className="w-3 h-3 inline" />
                    <span>{companyName}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{email || user?.email}</p>
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                  {businessType === 'pj' ? 'Pessoa Jurídica (PJ)' : businessType === 'mei' ? 'MEI - Microempreendedor' : businessType === 'autonomo' ? 'Autônomo / Freelancer' : 'Pessoa Física'}
                </span>
                {companyDocument && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium border border-slate-200 dark:border-slate-700">
                    Doc: {companyDocument}
                  </span>
                )}
                {cityState && (
                  <span className="text-[10px] text-slate-400 flex items-center space-x-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{cityState}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 transition-all cursor-pointer flex items-center space-x-1.5 self-end sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>

        {/* Avatar Preset Selector */}
        <div className="pt-4 space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Camera className="w-3.5 h-3.5 text-emerald-500" />
            <span>Escolher Foto de Perfil ou Logotipo</span>
          </label>
          <div className="flex items-center space-x-3 overflow-x-auto pb-1">
            {avatars.map((av, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(av)}
                className={`w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  avatarUrl === av ? 'border-emerald-500 scale-105 shadow-md ring-2 ring-emerald-500/30' : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={av} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Profile & Company Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Informações da Empresa / Negócio */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-5 transition-colors">
          <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-[#222b3d] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Informações da Empresa / Negócio</span>
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-[#e2f163] px-2 py-0.5 rounded-full">
                  Persistência Ativa
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize os dados da sua empresa ou atividade profissional para relatórios e gestão financeira.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome da Empresa */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Nome da Empresa / Nome Fantasia / Razão Social</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Minha Empresa Soluções Ltda ou Consultoria Digital"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            {/* CNPJ ou CPF */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>CNPJ ou CPF da Empresa</span>
              </label>
              <input
                type="text"
                value={companyDocument}
                onChange={(e) => setCompanyDocument(e.target.value)}
                placeholder="Ex: 00.000.000/0001-91"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            {/* Tipo de Perfil / Estrutura */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                <span>Tipo de Estrutura</span>
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 cursor-pointer"
              >
                <option value="pj">Pessoa Jurídica (Empresa / LTDA / S.A.)</option>
                <option value="mei">MEI - Microempreendedor Individual</option>
                <option value="autonomo">Profissional Autônomo / Freelancer</option>
                <option value="pf">Pessoa Física / Finanças Pessoais</option>
              </select>
            </div>

            {/* Ramo de Atuação / Segmento */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ramo de Atividade / Cargo</span>
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Ex: Tecnologia, Varejo, Serviços Médicos, Advocacia"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            {/* Meta Mensal de Faturamento (R$) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Meta Mensal de Faturamento (R$)</span>
              </label>
              <input
                type="text"
                value={monthlyRevenueTarget}
                onChange={(e) => setMonthlyRevenueTarget(e.target.value)}
                placeholder="Ex: 25000"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            {/* Cidade / UF */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Cidade e UF</span>
              </label>
              <input
                type="text"
                value={cityState}
                onChange={(e) => setCityState(e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            {/* Endereço Completo */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Endereço Comercial</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000, Sala 502"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            {/* Observações Financeiras da Empresa */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Diretrizes & Observações Financeiras da Empresa
              </label>
              <textarea
                rows={2}
                value={financialNotes}
                onChange={(e) => setFinancialNotes(e.target.value)}
                placeholder="Ex: Foco em redução de custos operacionais e reinvestimento de 20% do faturamento."
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dados Pessoais do Usuário / Responsável */}
        <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-5 transition-colors">
          <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-[#222b3d] pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Dados Pessoais & Acesso
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informações do titular da conta e credenciais de login.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Nome Completo do Responsável *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silva"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                E-mail de Acesso *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Telefone / WhatsApp de Contato</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#222b3d]">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {saved && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Informações e nome da empresa salvos com sucesso!
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Dados Salvos!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Salvando Alterações...' : 'Salvar Configurações'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Security / Password Card */}
      <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-[#222b3d] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Segurança & Alteração de Senha</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Atualize sua senha de acesso periodicamente para sua proteção.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
          {passMessage && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              passMessage.type === 'success' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30'
            }`}>
              {passMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Senha Atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha segura"
                className="w-full bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={changingPass || !currentPassword || !newPassword}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              {changingPass ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>

      {/* PWA & Mobile App Settings Card */}
      <div className="bg-white dark:bg-[#141a26] border border-slate-200 dark:border-[#222b3d] p-6 rounded-3xl shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-[#222b3d] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Configurações de PWA & Aplicativo</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie a instalação local, notificações e sincronização offline.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* App Status */}
          <div className="bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Status do App</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isInstalled ? 'Instalado como PWA' : isInstallable ? 'Pronto para instalação' : 'Rodando no navegador'}
                </p>
              </div>
            </div>

            {isInstallable && (
              <button
                onClick={installApp}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Instalar</span>
              </button>
            )}
          </div>

          {/* Connection Status */}
          <div className="bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Wifi className={`w-4 h-4 ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Conexão de Rede</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isOnline ? 'Online - Sincronizado' : 'Offline - Dados em cache'}</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isOnline ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-500'}`}>
              {isOnline ? 'Ativo' : 'Offline'}
            </span>
          </div>

          {/* Notifications Status */}
          <div className="bg-slate-50 dark:bg-[#182030] border border-slate-200 dark:border-[#26334d] p-3.5 rounded-2xl flex items-center justify-between sm:col-span-2">
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-200">Notificações Push & Alertas</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {notificationPermission === 'granted'
                    ? 'Notificações de vencimento de faturas e limites operacionais ativas'
                    : notificationPermission === 'denied'
                    ? 'Notificações bloqueadas pelo navegador'
                    : 'Receba alertas importantes de faturas e limite de gastos da empresa'}
                </p>
              </div>
            </div>

            {notificationPermission !== 'granted' && notificationPermission !== 'denied' && (
              <button
                onClick={requestNotifications}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Ativar Alertas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
