import React, { useState } from 'react';
import { useBurger } from '../../context/BakeryContext';
import { UserRole } from '../../types';
import { 
  Flame, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  ChefHat, 
  Sparkles, 
  KeyRound, 
  ArrowRight, 
  UserPlus, 
  UtensilsCrossed,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LoginViewProps {
  onOpenCustomerMenu?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenCustomerMenu }) => {
  const { login, registerUser, quickLoginAs, usersList } = useBurger();

  const [email, setEmail] = useState('admin@taverna.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Chapeiro / Grelhador');
  const [regPhone, setRegPhone] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = login(email, password);
    if (!result.success) {
      setErrorMessage(result.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  const handleQuickLogin = (roleOrEmail: string) => {
    setErrorMessage(null);
    quickLoginAs(roleOrEmail);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = registerUser({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      telefone: regPhone
    });

    if (result.success) {
      setRegisterSuccess(true);
      setTimeout(() => {
        setIsRegistering(false);
        setRegisterSuccess(false);
      }, 1500);
    } else {
      setErrorMessage(result.message || 'Erro ao registrar usuário.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-amber-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/10 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Main card container */}
      <div className="w-full max-w-lg z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 text-stone-950 shadow-xl shadow-amber-950/40 border border-amber-400/30 mb-3 relative group">
            <Flame className="w-9 h-9 fill-stone-950 text-stone-950 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-stone-950"></span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-wider font-display bg-gradient-to-r from-stone-100 via-stone-200 to-amber-200 bg-clip-text text-transparent">
            TAVERNA
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold mt-0.5">
            Hamburgueria Artesanal • Sistema de Gestão
          </p>
        </div>

        {/* Highlighted box with the requested user credentials */}
        {!isRegistering && (
          <div className="mb-5 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl border-l border-b border-amber-500/30">
              Pronto para Uso
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                  <span>Seu Login de Acesso (Administrador Master)</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Utilize as credenciais abaixo para ter acesso ilimitado a todos os módulos:
                </p>

                <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs bg-stone-950/70 p-2.5 rounded-xl border border-stone-800">
                  <div>
                    <span className="text-[11px] text-stone-300 block font-medium">E-mail:</span>
                    <span className="font-mono font-bold text-amber-400 select-all">admin@taverna.com</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-300 block font-medium">Senha:</span>
                    <span className="font-mono font-bold text-amber-400 select-all">admin</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Administrador')}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>⚡ Entrar com Meu Login (1 Clique)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Form */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h2 className="text-base font-bold text-stone-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Acesso à Plataforma</span>
                </h2>
                <span className="text-[11px] text-stone-300">Ambiente Operacional</span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>E-mail ou Usuário</span>
                  <span className="text-[10px] text-stone-300 font-normal">Ex: admin@taverna.com</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@taverna.com"
                    className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 placeholder-stone-600 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300 flex items-center justify-between">
                  <span>Senha</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@taverna.com');
                      setPassword('admin');
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    Preencher Senha Admin
                  </button>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 rounded-xl pl-9 pr-10 py-2.5 text-xs text-stone-100 placeholder-stone-600 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-950/30 transition-all flex items-center justify-center gap-2 active:scale-98 mt-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </button>

              {/* Quick Profile Selectors */}
              <div className="pt-3 border-t border-stone-800">
                <span className="text-[11px] text-stone-300 block mb-2 font-medium">
                  Ou selecione um cargo para teste imediato:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Administrador')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                      ADM
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-200 group-hover:text-amber-400 truncate">
                        Administrador
                      </div>
                      <div className="text-[10px] text-stone-300 truncate">Acesso Geral</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Gerente de Operações')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                      GER
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-200 group-hover:text-blue-400 truncate">
                        Gerente
                      </div>
                      <div className="text-[10px] text-stone-300 truncate">Estoque & Custos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Chapeiro Chefe')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center text-xs font-bold shrink-0">
                      CHF
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-200 group-hover:text-orange-400 truncate">
                        Chapeiro Chefe
                      </div>
                      <div className="text-[10px] text-stone-300 truncate">Fogo & Comandas</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('Chapeiro / Grelhador')}
                    className="flex items-center gap-2 p-2 rounded-xl bg-stone-950/60 hover:bg-stone-800 border border-stone-800 hover:border-amber-600/40 text-left transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0">
                      CHP
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-200 group-hover:text-rose-400 truncate">
                        Chapeiro
                      </div>
                      <div className="text-[10px] text-stone-300 truncate">Controle de Grelha</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Register link */}
              <div className="pt-2 text-center flex items-center justify-between text-xs text-stone-300">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-stone-400 hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar novo funcionário</span>
                </button>

                <span className="text-stone-300">•</span>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@taverna.com');
                    setPassword('admin');
                  }}
                  className="text-stone-400 hover:text-stone-200 transition-colors"
                >
                  Restaurar campos
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h2 className="text-base font-bold text-stone-200 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-500" />
                  <span>Cadastrar Novo Membro</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-stone-400 hover:text-stone-200"
                >
                  Voltar ao Login
                </button>
              </div>

              {registerSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Usuário cadastrado com sucesso! Entrando no sistema...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: João da Chapa"
                  className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-300">E-mail</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="joao@taverna.com"
                    className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-300">Senha</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Senha de acesso"
                    className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-300">Cargo / Função</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Gerente de Operações">Gerente de Operações</option>
                    <option value="Chapeiro Chefe">Chapeiro Chefe</option>
                    <option value="Chapeiro / Grelhador">Chapeiro / Grelhador</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-300">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(69) 99999-9999"
                    className="w-full bg-stone-950/80 border border-stone-700/80 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-bold rounded-xl"
                >
                  Salvar e Entrar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Public customer menu bypass button */}
        {onOpenCustomerMenu && (
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={onOpenCustomerMenu}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900/60 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-600/30 text-stone-300 hover:text-amber-400 rounded-xl text-xs font-medium transition-all shadow-sm"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
              <span>Acessar Cardápio Digital (Visão do Cliente / Sem Login)</span>
              <ArrowRight className="w-3 h-3 text-stone-300" />
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-[11px] text-stone-300 space-y-1">
          <div className="flex items-center justify-center gap-3">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Sessão Local Segura
            </span>
            <span>•</span>
            <span>Porto Velho - RO</span>
            <span>•</span>
            <span>Taverna v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
